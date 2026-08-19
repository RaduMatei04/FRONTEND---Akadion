import ReactMarkdown from "react-markdown"
import rehypeKatex from "rehype-katex"
import remarkGfm from "remark-gfm"
import remarkMath from "remark-math"

import "katex/dist/katex.min.css"

import { wrapBareLatex } from "../lib/wrapBareLatex"

interface AkyMarkdownProps {
  children: string
}

export default function AkyMarkdown({ children }: AkyMarkdownProps) {
  return (
    <ReactMarkdown remarkPlugins={[remarkGfm, remarkMath]} rehypePlugins={[rehypeKatex]}>
      {wrapBareLatex(children)}
    </ReactMarkdown>
  )
}
