import { Metadata } from 'next';

export const metadata: Metadata = {
  title: '個人情報取扱同意書 | ジョブポスティング',
  description: 'ジョブポスティングサイトにおける個人情報の取扱いについてご説明します。'
};

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-md p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            個人情報取扱同意書
          </h1>
          
          <div className="prose max-w-none text-gray-700 space-y-6">
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                1. 個人情報の取得について
              </h2>
              <p className="leading-relaxed">
                当サイトでは、会員登録や求人応募の際に、お客様の氏名、メールアドレス、電話番号、職歴等の個人情報を取得いたします。
                これらの情報は、適正な手段により取得し、お客様の同意なく第三者に提供することはありません。
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                2. 個人情報の利用目的
              </h2>
              <p className="leading-relaxed mb-3">
                取得した個人情報は、以下の目的で利用いたします：
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>会員登録および会員管理</li>
                <li>求人情報の提供およびマッチングサービス</li>
                <li>求人応募の処理および採用活動のサポート</li>
                <li>お客様からのお問い合わせへの対応</li>
                <li>サービス改善のための統計分析（個人を特定できない形式）</li>
                <li>重要なお知らせやサービス情報の配信</li>
                <li>法令に基づく対応</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                3. 個人情報の第三者提供
              </h2>
              <p className="leading-relaxed">
                お客様の個人情報は、以下の場合を除き、第三者に提供することはありません：
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4 mt-3">
                <li>お客様の事前の同意がある場合</li>
                <li>法令に基づく場合</li>
                <li>人の生命、身体または財産の保護のために必要がある場合</li>
                <li>公衆衛生の向上または児童の健全な育成の推進のために特に必要がある場合</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                4. 個人情報の管理
              </h2>
              <p className="leading-relaxed">
                当サイトでは、個人情報への不正アクセス、紛失、破損、改ざん、漏洩等を防止するため、
                適切なセキュリティ対策を実施し、個人情報の厳重な管理を行います。
                また、個人情報を取り扱う従業者に対して、個人情報保護に関する教育を徹底します。
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                5. 個人情報の保存期間
              </h2>
              <p className="leading-relaxed">
                個人情報は、利用目的の達成に必要な期間に限り保存し、不要になった場合は速やかに削除いたします。
                ただし、法令により保存が義務付けられている場合は、その期間保存いたします。
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                6. お客様の権利
              </h2>
              <p className="leading-relaxed mb-3">
                お客様には、ご自身の個人情報について以下の権利があります：
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>個人情報の開示請求</li>
                <li>個人情報の訂正・追加・削除の請求</li>
                <li>個人情報の利用停止・消去の請求</li>
                <li>個人情報の第三者提供の停止の請求</li>
              </ul>
              <p className="leading-relaxed mt-3">
                これらの請求については、お問い合わせフォームまたはメールにてご連絡ください。
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                7. Cookie等の利用
              </h2>
              <p className="leading-relaxed">
                当サイトでは、サービスの向上およびお客様の利便性向上のため、Cookieを使用する場合があります。
                Cookieの使用を希望されない場合は、ブラウザの設定で無効にすることができます。
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                8. お問い合わせ窓口
              </h2>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="leading-relaxed">
                  個人情報の取扱いに関するお問い合わせは、以下までご連絡ください：
                </p>
                <div className="mt-3 space-y-1">
                  <p><strong>メール:</strong> privacy@jobposting.example.com</p>
                  <p><strong>受付時間:</strong> 平日 9:00〜18:00</p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                9. 本方針の変更
              </h2>
              <p className="leading-relaxed">
                本方針は、法令の変更や事業内容の変更等により、予告なく変更する場合があります。
                変更後の方針は、当サイトに掲載した時点から効力を生じるものとします。
              </p>
            </section>

            <div className="border-t pt-6 mt-8">
              <p className="text-sm text-gray-600 text-center">
                制定日：2024年12月19日<br />
                最終更新日：2024年12月19日
              </p>
            </div>
          </div>

          <div className="mt-8 text-center">
            <a 
              href="/signup" 
              className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              同意して会員登録に進む
            </a>
          </div>
        </div>
      </div>
    </div>
  );
} 