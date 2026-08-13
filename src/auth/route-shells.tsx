import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/auth/useAuth"

function startLogin() {
  window.location.assign("/oauth2/authorization/keycloak")
}

export function LoginRedirect() {
  useEffect(() => {
    startLogin()
  }, [])

  return <LoadingPage message="Redirecționare către autentificare..." />
}

export function LoadingPage({ message = "Se verifică sesiunea curentă..." }: { message?: string }) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <CardTitle>AKADION</CardTitle>
          <CardDescription>{message}</CardDescription>
        </CardHeader>
      </Card>
    </main>
  )
}

export function AuthErrorPage() {
  const { error } = useAuth()

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4">
      <Card className="w-full max-w-lg text-center">
        <CardHeader>
          <CardTitle>Nu am putut valida sesiunea</CardTitle>
          <CardDescription>{error || "A apărut o problemă de comunicare. Încearcă din nou."}</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center gap-3">
          <Button type="button" onClick={() => window.location.reload()}>
            Reîncearcă
          </Button>
        </CardContent>
      </Card>
    </main>
  )
}
