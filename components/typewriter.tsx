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
  const [displayedText, setDisplayedText] = useState("")
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
        setDisplayedText(currentText)

        let delay = naturalRandom(35, 65)
        if (Math.random() < 0.08) {
          delay += naturalRandom(80, 150)
        }
        await new Promise((r) => setTimeout(r, delay))
      }

      if (!isLastLine) {
        // Pause at end of line before deleting
        await new Promise((r) => setTimeout(r, naturalRandom(600, 900)))

        // Delete the line character by character
        for (let i = currentText.length; i > 0; i--) {
          currentText = currentText.slice(0, -1)
          setDisplayedText(currentText)
          await new Promise((r) => setTimeout(r, naturalRandom(25, 45)))
        }

        // Small pause before next line
        await new Promise((r) => setTimeout(r, naturalRandom(300, 500)))
      }
    }

    setIsTyping(false)
  }, [])

  useEffect(() => {
    typeText()
  }, [typeText])

  return (
    <span className={className} style={style}>
      {displayedText}
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
