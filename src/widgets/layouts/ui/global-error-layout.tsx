import type { ErrorComponentProps } from "@tanstack/react-router"

export function GlobalErrorLayout({ error }: ErrorComponentProps) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center h-full">
      <div className="container">
        <div className="text-center">
          <h1 className="text-3xl font-bold">Something went wrong</h1>
          <p className="text-lg">Please try again later</p>
          <p>{error.message}</p>
        </div>
      </div>
    </div>
  )
}
