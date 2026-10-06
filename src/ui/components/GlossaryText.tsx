import { useId, useState } from 'react'
import { getGlossaryByTermName, getGlossaryTerm } from '../../content/glossary'
import './GlossaryText.css'

type Props = {
  readonly text: string
}

/**
 * Renders text with [[termId|Label]] glossary tokens as accessible tooltips.
 */
export function GlossaryText({ text }: Props) {
  const parts = tokenize(text)
  return (
    <span className="glossary-text">
      {parts.map((part, index) =>
        part.kind === 'text' ? (
          <span key={index}>{part.value}</span>
        ) : (
          <GlossaryChip key={index} termId={part.termId} label={part.label} />
        ),
      )}
    </span>
  )
}

function GlossaryChip({
  termId,
  label,
}: {
  termId: string
  label: string
}) {
  const tipId = useId()
  const [open, setOpen] = useState(false)
  const term =
    getGlossaryTerm(termId) ?? getGlossaryByTermName(label) ?? {
      id: termId,
      term: label,
      definition: 'Definition coming soon.',
    }

  return (
    <span className="glossary-chip">
      <button
        type="button"
        className="glossary-term"
        aria-describedby={open ? tipId : undefined}
        onClick={() => setOpen((v) => !v)}
        onBlur={() => setOpen(false)}
      >
        {label}
      </button>
      {open && (
        <span className="glossary-tip" role="tooltip" id={tipId}>
          <strong>{term.term}</strong>
          <span>{term.definition}</span>
        </span>
      )}
    </span>
  )
}

type Token =
  | { kind: 'text'; value: string }
  | { kind: 'term'; termId: string; label: string }

function tokenize(text: string): Token[] {
  const tokens: Token[] = []
  const re = /\[\[([^\]|]+)\|([^\]]+)\]\]/g
  let last = 0
  let match: RegExpExecArray | null
  while ((match = re.exec(text))) {
    if (match.index > last) {
      tokens.push({ kind: 'text', value: text.slice(last, match.index) })
    }
    tokens.push({ kind: 'term', termId: match[1]!, label: match[2]! })
    last = match.index + match[0].length
  }
  if (last < text.length) tokens.push({ kind: 'text', value: text.slice(last) })
  return tokens
}
