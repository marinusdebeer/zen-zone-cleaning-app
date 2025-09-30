import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/ui/components/theme-provider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "CleanFlow",
  description: "Complete Business Management for Cleaning Services",
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
                // Get manual theme and timestamp
                const manualTheme = localStorage.getItem('theme');
                const manualTimestamp = parseInt(localStorage.getItem('theme_timestamp') || '0', 10);
                
                // Get system theme and timestamp
                const systemThemeSaved = localStorage.getItem('system_theme');
                const systemTimestamp = parseInt(localStorage.getItem('system_theme_timestamp') || '0', 10);
                
                // Get current system preference
                const systemIsDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                const currentSystemTheme = systemIsDark ? 'dark' : 'light';
                const now = Date.now();
                
                // Check if system theme changed
                let actualSystemTimestamp = systemTimestamp;
                if (currentSystemTheme !== systemThemeSaved) {
                  actualSystemTimestamp = now;
                  localStorage.setItem('system_theme', currentSystemTheme);
                  localStorage.setItem('system_theme_timestamp', now.toString());
                }
                
                // Use whichever changed most recently
                let activeTheme;
                if (manualTimestamp > actualSystemTimestamp) {
                  activeTheme = manualTheme || currentSystemTheme;
                } else {
                  activeTheme = currentSystemTheme;
                }
                
                document.documentElement.classList.toggle('dark', activeTheme === 'dark');
              } catch (e) {}
            `,
          }}
        />
      </head>
      <body className={inter.className}>
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}

