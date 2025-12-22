import { Provider as TanStackQueryProvider } from "../tanstack-query/provider"
import { ThemeProvider } from "../theme/provider"

export function RootProvider({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <TanStackQueryProvider>{children}</TanStackQueryProvider>
    </ThemeProvider>
  )
}
