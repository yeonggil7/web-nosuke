import { DefaultSeoProps } from 'next-seo';

export const defaultSeo: DefaultSeoProps = {
  title: 'ジョブポスティングサイト',
  description: '最新の求人情報を掲載しています',
  openGraph: {
    type: 'website',
    locale: 'ja_JP',
    url: 'https://example.com/',
    siteName: 'ジョブポスティングサイト',
    images: [
      {
        url: 'https://example.com/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'ジョブポスティングサイト',
      },
    ],
  },
  twitter: {
    handle: '@handle',
    site: '@site',
    cardType: 'summary_large_image',
  },
}; 