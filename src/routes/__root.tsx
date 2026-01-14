import { RootProvider } from "@/app/providers/root/provider"
import appCss from "@/app/styles/styles.css?url"
import { Toaster } from "@/shared/ui/sonner"
import { NotFoundWidget } from "@/widgets/layouts/errors/not-found"
import { GlobalErrorLayout } from "@/widgets/layouts/ui/global-error-layout"
import { aiDevtoolsPlugin } from "@tanstack/react-ai-devtools"
import { TanStackDevtools } from "@tanstack/react-devtools"
import {
  createRootRoute,
  HeadContent,
  Outlet,
  Scripts,
} from "@tanstack/react-router"
import type * as React from "react"

export const Route = createRootRoute({
  shellComponent: RootShell,
  component: RootComponent,
  errorComponent: (error) => (
    <GlobalErrorLayout error={error.error} reset={error.reset} />
  ),
  notFoundComponent: NotFoundWidget,
  ssr: false, // or `defaultSsr: false` on the router,
  head: () => ({
    meta: [
      {
        charSet: "utf-8",
      },
      {
        name: "viewport",
        content: "width=device-width, initial-scale=1",
      },
      {
        title: "TanStack Start Starter",
      },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
    ],
  }),
})

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  )
}

function RootComponent() {
  return (
    <RootProvider>
      <TanStackDevtools
        plugins={[
          // ... other plugins
          aiDevtoolsPlugin(),
        ]}
        // this config is important to connect to the server event bus
        eventBusConfig={{
          connectToServerBus: true,
        }}
      />
      <Outlet />
      <Toaster />
    </RootProvider>
  )
}
