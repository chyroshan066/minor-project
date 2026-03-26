import localFont from "next/font/local";

export const openSans = localFont({
  src: [
    {
      path: "../../public/fonts/open-sans/Open-Sans-300.woff2",
      weight: "300",
      style: "normal"
    },
    {
      path: "../../public/fonts/open-sans/Open-Sans-Regular.woff2",
      weight: "400",
      style: "normal"
    },
    {
      path: "../../public/fonts/open-sans/Open-Sans-600.woff2",
      weight: "600",
      style: "normal"
    },
    {
      path: "../../public/fonts/open-sans/Open-Sans-700.woff2",
      weight: "700",
      style: "normal"
    },
  ],
  display: 'swap',
  variable: '--font-openSans'
});