"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SessionProvider } from "next-auth/react";
import { ThemeProvider } from "next-themes";
import { useState } from "react";
import { LanguageProvider } from "@/contexts/language-context";
import { Toasters } from "@/components/toasters";
import type { Locale } from "@/i18n";

export function Providers({ children, lang }: { children: React.ReactNode; lang?: Locale }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60_000,
            refetchOnWindowFocus: false,
            retry: 1,
          },
        },
      })
  );

  return (
    <SessionProvider>
      <ThemeProvider
        attribute="class"
        defaultTheme="light"
        enableSystem={false}
        disableTransitionOnChange
      >
        <QueryClientProvider client={queryClient}>
          <LanguageProvider lang={lang}>
            {children}
            <Toasters />
          </LanguageProvider>
        </QueryClientProvider>
      </ThemeProvider>
    </SessionProvider>
  );
}
