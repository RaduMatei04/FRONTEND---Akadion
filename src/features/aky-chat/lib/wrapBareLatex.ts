const MASK_MARKER = "\u001c"
const MASK_PATTERN = new RegExp(`[${MASK_MARKER}](\\d+)[${MASK_MARKER}]`, "g")

const CODE_FENCE_PATTERN = /```[\s\S]*?(?:```|$)/g
const INLINE_CODE_PATTERN = /`[^`\n]+`/g
const DELIMITED_MATH_PATTERN = /\$\$[^$]*\$\$|\$[^$]*\$/g

const LATEX_OPERATORS = new Set(["=", "+", "-", "<", ">", "/"])
const NOT_MATH_COMMANDS = new Set(["n", "r", "t"])

function maskProtectedRegions(text: string): { masked: string; restore: (value: string) => string } {
  const regions: string[] = []

  const mask = (match: string) => {
    regions.push(match)
    return `${MASK_MARKER}${regions.length - 1}${MASK_MARKER}`
  }

  const masked = text.replace(CODE_FENCE_PATTERN, mask).replace(INLINE_CODE_PATTERN, mask).replace(DELIMITED_MATH_PATTERN, mask)

  const restore = (value: string) =>
    value.replace(MASK_PATTERN, (sentinel) => {
      const index = Number(sentinel.slice(1, -1))
      return regions[index] ?? sentinel
    })

  return { masked, restore }
}

function isLetter(char: string | undefined): boolean {
  return char !== undefined && /[a-zA-Z]/.test(char)
}

function isDigit(char: string | undefined): boolean {
  return char !== undefined && /[0-9]/.test(char)
}

function isLatexOperator(char: string | undefined): boolean {
  return char !== undefined && LATEX_OPERATORS.has(char)
}

function canContinueAfterSpace(next: string | undefined): boolean {
  return next === "\\" || next === "{" || next === "(" || next === "[" || next === "_" || next === "^" || isLatexOperator(next)
}

function consumeBalanced(text: string, openIndex: number, open: string, close: string): number {
  let depth = 0
  let index = openIndex

  while (index < text.length) {
    const char = text[index]

    if (char === "\\") {
      index += 2
      continue
    }

    if (char === "\n") {
      return index
    }

    if (char === open) {
      depth += 1
    } else if (char === close) {
      depth -= 1
      if (depth === 0) {
        return index + 1
      }
    }

    index += 1
  }

  return index
}

function consumeLatexRun(text: string, start: number): number {
  let index = start + 1
  let sawNotMathCommand = false

  const commandStart = index
  while (index < text.length && isLetter(text[index])) {
    index += 1
  }

  if (NOT_MATH_COMMANDS.has(text.slice(commandStart, index))) {
    sawNotMathCommand = true
  }

  while (index < text.length) {
    const char = text[index]

    if (char === "\\") {
      if (!isLetter(text[index + 1])) {
        break
      }

      const commandStart = index + 1
      index = commandStart
      while (index < text.length && isLetter(text[index])) {
        index += 1
      }

      const commandName = text.slice(commandStart, index)
      if (NOT_MATH_COMMANDS.has(commandName)) {
        sawNotMathCommand = true
      }

      continue
    }

    if (char === "{") {
      index = consumeBalanced(text, index, "{", "}")
      continue
    }

    if (char === "(" || char === "[") {
      index = consumeBalanced(text, index, char, char === "(" ? ")" : "]")
      continue
    }

    if (char === "_" || char === "^") {
      if (text[index + 1] === "{") {
        index = consumeBalanced(text, index + 1, "{", "}")
      } else if (isLetter(text[index + 1]) || isDigit(text[index + 1])) {
        index += 2
      } else {
        break
      }
      continue
    }

    if (isLatexOperator(char)) {
      index += 1
      continue
    }

    if (char === " ") {
      if (canContinueAfterSpace(text[index + 1])) {
        index += 1
        continue
      }
      break
    }

    if (isLetter(char) || isDigit(char)) {
      if (text[index - 1] !== " ") {
        index += 1
        continue
      }
      break
    }

    break
  }

  if (sawNotMathCommand) {
    return start
  }

  return index
}

function wrapLatexRuns(text: string): string {
  let result = ""
  let index = 0

  while (index < text.length) {
    const char = text[index]

    if (char === "\\" && isLetter(text[index + 1])) {
      const end = consumeLatexRun(text, index)
      if (end > index + 1) {
        result += `$${text.slice(index, end)}$`
        index = end
        continue
      }
    }

    result += char
    index += 1
  }

  return result
}

export function wrapBareLatex(text: string): string {
  const { masked, restore } = maskProtectedRegions(text)
  return restore(wrapLatexRuns(masked))
}
