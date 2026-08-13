import { StrictMode } from "react"
import { QueryClientProvider } from "@tanstack/react-query"
import { createRoot } from "react-dom/client"
import { BrowserRouter } from "react-router-dom"
import { queryClient } from "@/api/queryClient"
import App from "./App"
import { AuthProvider } from "./auth/AuthProvider"
import "./index.css"

const rootElement = document.getElementById("root")

if (!rootElement) {
  throw new Error('Root element with id "root" was not found.')
}

createRoot(rootElement).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  </StrictMode>,
)
