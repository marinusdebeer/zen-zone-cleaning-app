import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Zen Zone Cleaning",
  description: "Multi-tenant cleaning service management",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                const theme = localStorage.getItem('theme');
                const html = document.documentElement;
                if (theme === 'dark') {
                  html.classList.remove('light');
                  html.classList.add('dark');
                } else if (theme === 'light') {
                  html.classList.remove('dark');
                  html.classList.add('light');
                } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
                  html.classList.add('dark');
                } else {
                  html.classList.add('light');
                }
              } catch (e) {}
            `,
          }}
        />
      </head>
      <body className={inter.className}>
        {children}
      </body>
    </html>
  );
}

