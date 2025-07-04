import { DefaultSeoProps } from 'next-seo';

export const defaultSeo: DefaultSeoProps = {
  title: 'Roots Career - あなたの理想のキャリアを見つけよう',
  description: '最新の求人情報とキャリア支援サービスを提供するRoots Career。あなたの未来への第一歩をサポートします。',
  openGraph: {
    type: 'website',
    locale: 'ja_JP',
    url: 'https://rootscareer.jp/',
    siteName: 'Roots Career',
    images: [
      {
        url: 'https://rootscareer.jp/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Roots Career - あなたの理想のキャリアを見つけよう',
      },
    ],
  },
  twitter: {
    handle: '@rootscareer',
    site: '@rootscareer',
    cardType: 'summary_large_image',
  },
  additionalMetaTags: [
    {
      name: 'viewport',
      content: 'width=device-width, initial-scale=1',
    },
    {
      name: 'author',
      content: 'Roots Career',
    },
    {
      name: 'keywords',
      content: '転職, 就職, 求人, キャリア, 日本, エンジニア, IT, 技術職',
    },
  ],
}; 