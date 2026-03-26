import { openSans } from "@/app/fonts";
import { Configurator } from "@/components/layout/Configurator";
import { SideNav } from "@/components/layout/SideNav";
import AnalyticsWrapper from "@/lib/analytics/vercel-analytics";
import { Providers } from "@/redux/provider";
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

export default function DashboardLayout({ children }: Readonly<Children>) {
  return (
    <body
      className={`${openSans.variable} m-0 font-sans text-base antialiased font-normal leading-default bg-gray-50 text-slate-500`}
      suppressHydrationWarning={true}
    >
      <Providers>
        <SideNav />
        {children}
        <Configurator />
        <AnalyticsWrapper />
      </Providers>
    </body>
  );
}
