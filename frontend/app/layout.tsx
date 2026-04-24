import type { Metadata, Viewport } from "next";
import { Noto_Sans, Noto_Serif } from "next/font/google";
import "./globals.css";

const notoSans = Noto_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-noto-sans",
});

const notoSerif = Noto_Serif({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-noto-serif",
});

export const metadata: Metadata = {
  title: "NourishNet",
  description: "AI-powered malnutrition risk analysis for ASHA workers. Contributing to UN SDG 3.",
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  themeColor: "#1a6b3c",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/icon-192x192.png" />
      </head>
      <body className={`${notoSans.variable} ${notoSerif.variable} font-sans bg-background text-text-primary min-h-screen pb-safe`}>
        <main className="max-w-md mx-auto min-h-screen bg-white shadow-xl overflow-hidden shadow-gray-200/50 flex flex-col relative w-full h-full">
          {children}
        </main>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js').then(function(registration) {
                    console.log('ServiceWorker registration successful with scope: ', registration.scope);
                  }, function(err) {
                    console.log('ServiceWorker registration failed: ', err);
                  });
                });
              }
            `,
          }}
        />
      </body>
    </html>
  );
}