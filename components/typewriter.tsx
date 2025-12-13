"use client"

import { useState, useEffect, useCallback } from "react"

interface TypewriterProps {
  className?: string
  style?: React.CSSProperties
}

const LINES = [
  "Zillow shows listings.",
  "Redfin shows prices.",
  "GreatSchools shows schools.",
  "Sofee shows where you should live.",
]

// Helper for more natural random timing
function naturalRandom(min: number, max: number): number {
  const r = (Math.random() + Math.random()) / 2
  return min + r * (max - min)
}

export function Typewriter({ className, style }: TypewriterProps) {
  const [lines, setLines] = useState<string[]>([])
  const [currentLineText, setCurrentLineText] = useState("")
  const [isTyping, setIsTyping] = useState(true)
  const [cursorVisible, setCursorVisible] = useState(true)

  // Cursor blink effect
  useEffect(() => {
    const cursorInterval = setInterval(() => {
      setCursorVisible((prev) => !prev)
    }, 530)
    return () => clearInterval(cursorInterval)
  }, [])

  const typeText = useCallback(async () => {
    // Initial pause
    await new Promise((r) => setTimeout(r, naturalRandom(800, 1200)))

    for (let lineIndex = 0; lineIndex < LINES.length; lineIndex++) {
      const line = LINES[lineIndex]
      const isLastLine = lineIndex === LINES.length - 1

      // Type each character of the line
      let currentText = ""
      for (let i = 0; i < line.length; i++) {
        currentText += line[i]
        setCurrentLineText(currentText)

        let delay = naturalRandom(35, 65)
        if (Math.random() < 0.08) {
          delay += naturalRandom(80, 150)
        }
        await new Promise((r) => setTimeout(r, delay))
      }

      if (!isLastLine) {
        // Pause at end of line
        await new Promise((r) => setTimeout(r, naturalRandom(400, 600)))

        // Move completed line to lines array and reset current
        setLines((prev) => [...prev, currentText])
        setCurrentLineText("")

        // Small pause before next line
        await new Promise((r) => setTimeout(r, naturalRandom(200, 400)))
      } else {
        // Final line - add to completed lines
        setLines((prev) => [...prev, currentText])
        setCurrentLineText("")
      }
    }

    setIsTyping(false)
  }, [])

  useEffect(() => {
    typeText()
  }, [typeText])

  return (
    <span className={className} style={style}>
      {lines.map((line, i) => (
        <span key={i}>
          {line}
          {i < lines.length - 1 && <br />}
        </span>
      ))}
      {currentLineText && (
        <>
          {lines.length > 0 && <br />}
          {currentLineText}
        </>
      )}
      <span
        className="inline-block w-[3px] ml-[2px] align-middle"
        style={{
          height: "1em",
          backgroundColor: isTyping || cursorVisible ? "#0B2037" : "transparent",
          transition: "background-color 0.1s",
        }}
      />
    </span>
  )
}
