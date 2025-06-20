'use client';

import { useState } from 'react';
import Link from 'next/link';

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: 'account' | 'job' | 'application' | 'technical' | 'other';
}

const faqData: FAQItem[] = [
  {
    id: '1',
    question: 'アカウントの作成方法を教えてください',
    answer: 'ページ右上の「会員登録」ボタンをクリックし、メールアドレスとパスワードを入力してください。登録後、管理者による承認が必要な場合があります。',
    category: 'account'
  },
  {
    id: '2',
    question: 'パスワードを忘れてしまいました',
    answer: 'ログインページの「パスワードを忘れた方」リンクをクリックし、登録済みのメールアドレスを入力してください。パスワードリセット用のメールをお送りします。',
    category: 'account'
  },
  {
    id: '3',
    question: '求人への応募方法を教えてください',
    answer: '求人詳細ページの「この求人に応募する」ボタンをクリックし、志望動機を入力して送信してください。ログインが必要です。',
    category: 'application'
  },
  {
    id: '4',
    question: '応募した求人の状況を確認したい',
    answer: 'マイページの「応募履歴」から、応募した求人の選考状況を確認できます。',
    category: 'application'
  },
  {
    id: '5',
    question: '求人をお気に入りに追加するには？',
    answer: '求人詳細ページまたは求人一覧ページの♡ボタンをクリックすることで、お気に入りに追加できます。',
    category: 'job'
  },
  {
    id: '6',
    question: '求人検索の方法を教えてください',
    answer: 'ヘッダーの「求人検索」から検索ページにアクセスし、キーワードやタグで絞り込み検索ができます。',
    category: 'job'
  },
  {
    id: '7',
    question: 'プロフィール情報を編集したい',
    answer: 'マイページの「プロフィール編集」ボタンから、基本情報、スキル、経験年数などを編集できます。',
    category: 'account'
  },
  {
    id: '8',
    question: 'サイトが正常に動作しません',
    answer: 'ブラウザのキャッシュをクリアするか、別のブラウザでお試しください。問題が続く場合は、お問い合わせフォームからご連絡ください。',
    category: 'technical'
  },
  {
    id: '9',
    question: '個人情報の取り扱いについて知りたい',
    answer: 'プライバシーポリシーページで詳細をご確認いただけます。個人情報は適切に保護され、求人応募や機能改善のみに使用されます。',
    category: 'other'
  },
  {
    id: '10',
    question: 'アカウントを削除したい',
    answer: 'アカウント削除をご希望の場合は、お問い合わせフォームからご連絡ください。削除処理を行います。',
    category: 'account'
  }
];

const categories = {
  account: 'アカウント',
  job: '求人検索',
  application: '応募関連',
  technical: '技術的な問題',
  other: 'その他'
};

export default function HelpPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [openFAQ, setOpenFAQ] = useState<string | null>(null);

  const filteredFAQs = faqData.filter(faq => {
    const matchesCategory = selectedCategory === 'all' || faq.category === selectedCategory;
    const matchesSearch = faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* ヘッダー */}
        <div className="mb-8">
          <nav className="flex items-center space-x-2 text-sm text-gray-500 mb-4">
            <Link href="/" className="hover:text-blue-600">ホーム</Link>
            <span>/</span>
            <span className="text-gray-900">ヘルプ</span>
          </nav>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-4">ヘルプセンター</h1>
          <p className="text-gray-600">
            JobFind 2025の使い方や、よくある質問をご確認いただけます
          </p>
        </div>

        {/* 検索バー */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="max-w-2xl mx-auto">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="質問を検索..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* カテゴリーフィルター */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-24">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">カテゴリー</h3>
              <ul className="space-y-2">
                <li>
                  <button
                    onClick={() => setSelectedCategory('all')}
                    className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                      selectedCategory === 'all'
                        ? 'bg-blue-100 text-blue-700 font-medium'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    すべて
                  </button>
                </li>
                {Object.entries(categories).map(([key, label]) => (
                  <li key={key}>
                    <button
                      onClick={() => setSelectedCategory(key)}
                      className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                        selectedCategory === key
                          ? 'bg-blue-100 text-blue-700 font-medium'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      {label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* FAQ一覧 */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow-sm">
              <div className="p-6 border-b">
                <h2 className="text-xl font-semibold text-gray-900">
                  よくある質問 ({filteredFAQs.length}件)
                </h2>
              </div>
              
              <div className="divide-y">
                {filteredFAQs.length > 0 ? (
                  filteredFAQs.map((faq) => (
                    <div key={faq.id} className="p-6">
                      <button
                        onClick={() => setOpenFAQ(openFAQ === faq.id ? null : faq.id)}
                        className="w-full text-left"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-start space-x-3">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              {categories[faq.category]}
                            </span>
                            <h3 className="text-lg font-medium text-gray-900 hover:text-blue-600 transition-colors">
                              {faq.question}
                            </h3>
                          </div>
                          <svg
                            className={`w-5 h-5 text-gray-400 transition-transform ${
                              openFAQ === faq.id ? 'rotate-180' : ''
                            }`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </div>
                      </button>
                      
                      {openFAQ === faq.id && (
                        <div className="mt-4 pl-16">
                          <p className="text-gray-700 leading-relaxed">{faq.answer}</p>
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="p-12 text-center">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 20a7.962 7.962 0 01-5-1.709l-3.5 3.5-1.5-1.5 3.5-3.5A7.962 7.962 0 014 12a8 8 0 018-8 8 8 0 018 8 7.962 7.962 0 01-1.709 5l3.5 3.5-1.5 1.5-3.5-3.5z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">該当する質問が見つかりません</h3>
                    <p className="text-gray-500 mb-4">検索条件を変更するか、お問い合わせフォームからご連絡ください。</p>
                    <Link
                      href="/contact"
                      className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium"
                    >
                      お問い合わせする
                      <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </Link>
                  </div>
                )}
              </div>
            </div>

            {/* クイックリンク */}
            <div className="mt-8 bg-blue-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">お困りの場合</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Link
                  href="/contact"
                  className="flex items-center p-4 bg-white rounded-lg hover:shadow-md transition-shadow"
                >
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">お問い合わせ</h4>
                    <p className="text-sm text-gray-500">個別のサポートを受ける</p>
                  </div>
                </Link>

                <Link
                  href="/privacy-policy"
                  className="flex items-center p-4 bg-white rounded-lg hover:shadow-md transition-shadow"
                >
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">プライバシーポリシー</h4>
                    <p className="text-sm text-gray-500">個人情報の取り扱いについて</p>
                  </div>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* 戻るボタン */}
        <div className="mt-8 text-center">
          <Link 
            href="/"
            className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            ホームに戻る
          </Link>
        </div>
      </div>
    </div>
  );
} 