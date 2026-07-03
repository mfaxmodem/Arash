import "./globals.css";
import { HtmlLangSync } from "@/components/site/html-lang-sync";
import { ThemeProvider } from "@/components/theme-provider";

// This script runs before React hydrates — no hydration mismatch
const themeScript = `
  (function() {
    try {
      var t = localStorage.getItem('theme');
      if (t === 'dark' || (!t && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        document.documentElement.classList.add('dark');
      }
    } catch(e) {}
  })()
`;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fa" dir="rtl" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <link
          rel="preconnect"
          href="https://cdn.jsdelivr.net"
          crossOrigin="anonymous"
        />
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/gh/rastikerdar/vazirmatn@v33.003/Vazirmatn-font-face.css"
        />
      </head>
      <body className="font-vazir antialiased bg-background text-foreground" suppressHydrationWarning>
        <ThemeProvider>
          <HtmlLangSync />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
