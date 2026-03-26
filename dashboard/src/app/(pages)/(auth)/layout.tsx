import { openSans } from "@/app/fonts";
import { Footer } from "@/components/layout/Footer";
import AnalyticsWrapper from "@/lib/analytics/vercel-analytics";
import { Children } from "@/types";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "<website_title>",
  description: "<website_description>",
  keywords: [
    "<search_keyword1>",
    "<search_keyword2>",
    // ..... and so on
  ],
  alternates: {
    canonical: "/",
  },
  robots: {
    index: true,
    follow: true,
    nocache: true,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    title: "<website_title>",
    description: "<website_description>",
    url: `${process.env.NEXT_PUBLIC_BASE_URL}`,
    siteName: "<website_name>",
    images: [
      {
        url: "/images/preview.webp",
        width: 1200,
        height: 630,
        alt: "<website_name> Preview",
      },
    ],
  },
};

export default function AuthLayout({ children }: Readonly<Children>) {
  return (
    <body
      className={`${openSans.variable} m-0 font-sans antialiased font-normal bg-white text-start text-base leading-default text-slate-500`}
      suppressHydrationWarning={true}
    >
      <main className="mt-0 transition-all duration-200 ease-soft-in-out">
        {children}
        <Footer />
      </main>
      <AnalyticsWrapper />
    </body>
  );
}
