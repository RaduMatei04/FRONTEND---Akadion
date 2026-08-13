import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function NotFoundPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <CardTitle>Pagină inexistentă</CardTitle>
          <CardDescription>Pagina pe care o cauți nu există.</CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild>
            <Link to="/">Mergi la home</Link>
          </Button>
        </CardContent>
      </Card>
    </main>
  )
}
