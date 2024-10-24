import { SessionProvider } from "next-auth/react"

export function AuthWrapper({ children }: { children: React.ReactNode }) {
  return <SessionProvider>{children}</SessionProvider>
}