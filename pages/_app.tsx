import type { AppProps } from "next/app"
import '@/styles/globals.css'

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <div className="[&_a]:text-indigo-600 [&_a:hover]:text-indigo-700">
      <Component {...pageProps} />
    </div>
  )
}

export default MyApp
