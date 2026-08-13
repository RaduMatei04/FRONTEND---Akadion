import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export function AccessDeniedPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <CardTitle>Acces interzis</CardTitle>
          <CardDescription>Pagina de administrare este disponibilă doar utilizatorilor cu rol ADMIN.</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center gap-3">
          <Button asChild>
            <Link to="/">Mergi la home</Link>
          </Button>
        </CardContent>
      </Card>
    </main>
  )
}
