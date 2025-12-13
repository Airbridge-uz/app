"use client";

import { TanstackQueryProvider } from "./tanstack-query/provider";

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <TanstackQueryProvider>
            {children}
        </TanstackQueryProvider>
    );
}