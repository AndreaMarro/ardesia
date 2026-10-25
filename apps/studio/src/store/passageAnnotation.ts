/** Presentation of the teacher's own text, with no interpretation or truncation. */
export function wrapPassageAnnotation(text: string): string {
  return text.split("\n").flatMap((paragraph) => {
    const lines: string[] = []
    let line = ""
    for (const word of paragraph.trim().split(/\s+/)) {
      if (!word) continue
      if (word.length > 40) {
        if (line) { lines.push(line); line = "" }
        for (let index = 0; index < word.length; index += 40) {
          const chunk = word.slice(index, index + 40)
          if (chunk.length === 40) lines.push(chunk)
          else line = chunk
        }
      } else if (!line) line = word
      else if (line.length + word.length + 1 <= 40) line += ` ${word}`
      else { lines.push(line); line = word }
    }
    if (line || lines.length === 0) lines.push(line)
    return lines
  }).join("\n")
}
