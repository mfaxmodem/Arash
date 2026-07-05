import "./globals.css";

// This script runs before React hydrates — no hydration mismatch
// Default is ALWAYS light. Dark only if user explicitly chose it.
const themeScript = `
  (function() {
    try {
      if (localStorage.getItem('theme') === 'dark') {
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
    <>
      <script dangerouslySetInnerHTML={{ __html: themeScript }} suppressHydrationWarning />
      {children}
    </>
  );
}
