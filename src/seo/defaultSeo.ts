import { DefaultSeoProps } from 'next-seo';

export const defaultSeoConfig = {
  title: 'FindOut Career - あなたの理想のキャリアを見つけよう',
  description: '理想のキャリアを見つけるための求人プラットフォーム。厳選された求人情報で、あなたの未来を切り拓きましょう。',
  canonical: 'https://findout-career.com/',
  openGraph: {
    type: 'website',
    locale: 'ja_JP',
    url: 'https://findout-career.com/',
    siteName: 'FindOut Career',
    title: 'FindOut Career - あなたの理想のキャリアを見つけよう',
    description: '理想のキャリアを見つけるための求人プラットフォーム。厳選された求人情報で、あなたの未来を切り拓きましょう。',
    images: [
      {
        url: 'https://findout-career.com/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'FindOut Career - キャリア発見プラットフォーム',
      },
    ],
  },
  twitter: {
    cardType: 'summary_large_image',
    site: '@findoutcareer',
    handle: '@findoutcareer',
  },
  additionalMetaTags: [
    {
      name: 'keywords',
      content: '転職, 就職, 求人, キャリア, 仕事探し, 転職サイト, 求人情報, キャリアアップ, 就職活動, findout career',
    },
    {
      name: 'author',
      content: 'FindOut Career',
    },
    {
      name: 'viewport',
      content: 'width=device-width, initial-scale=1.0',
    },
  ],
}; 