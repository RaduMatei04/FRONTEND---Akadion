import { Loader2, Send } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface AkyComposerProps {
  enabled: boolean
  selectedCourseId: string | number | null
  isSending: boolean
  draft: string
  setDraft: (value: string) => void
  handleSubmit: (event: React.FormEvent<HTMLFormElement>) => Promise<void>
  accentClassName: string
}

export default function AkyComposer({ enabled, selectedCourseId, isSending, draft, setDraft, handleSubmit, accentClassName }: AkyComposerProps) {
  return (
    <div className="mt-auto p-6 pt-2 bg-white/50 backdrop-blur-md border-t border-slate-100">
      <form onSubmit={(event) => void handleSubmit(event)} className="space-y-3">
        <div className="rounded-[1.6rem] border border-[#d9e4f4] bg-white p-2 shadow-sm transition-shadow focus-within:shadow-md">
          <div className="flex items-end gap-2">
            <Input
              disabled={!enabled || !selectedCourseId || isSending}
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              placeholder="Scrie întrebarea ta pentru Aky..."
              className="h-12 flex-1 rounded-2xl border-0 bg-transparent px-4 text-slate-700 shadow-none focus-visible:ring-0 disabled:opacity-60 placeholder:text-slate-400"
            />
            <Button
              type="submit"
              disabled={!enabled || !selectedCourseId || !draft.trim() || isSending}
              className={`h-12 w-12 shrink-0 rounded-2xl bg-linear-to-r ${accentClassName} p-0 text-white shadow-md disabled:opacity-40 transition-transform active:scale-95`}
            >
              {isSending ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5 ml-1" />}
            </Button>
          </div>
        </div>
      </form>
    </div>
  )
}
