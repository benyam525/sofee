"use client"

import { useState, useEffect, useCallback } from "react"

interface TypewriterProps {
  className?: string
  style?: React.CSSProperties
}

// The rejected words/phrases the writer cycles through before landing on "ink blot"
const REJECTED_ATTEMPTS = [
  "nightmare",
  "mess",
  "total shi",
  "absolute clusterf",
  "endless spiral of",
  "ink blot", // Final answer
]

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
    const baseText = "Choosing a suburb is an "
    const endingText = " — just like the one next to my name."
    const typingSpeed = 45
    const deleteSpeed = 35

    // Type the base text first
    let currentText = ""
    for (const char of baseText) {
      currentText += char
      setDisplayedText(currentText)
      await new Promise((r) => setTimeout(r, typingSpeed + Math.random() * 25))
    }

    // Now cycle through rejected attempts
    for (let i = 0; i < REJECTED_ATTEMPTS.length; i++) {
      const attempt = REJECTED_ATTEMPTS[i]
      const isLast = i === REJECTED_ATTEMPTS.length - 1

      // Type this attempt
      for (const char of attempt) {
        currentText += char
        setDisplayedText(currentText)
        await new Promise((r) => setTimeout(r, typingSpeed + Math.random() * 30))
      }

      if (!isLast) {
        // Pause - writer realizes this isn't right
        // Longer pause for more dramatic effect
        const pauseDuration = 600 + Math.random() * 400
        await new Promise((r) => setTimeout(r, pauseDuration))

        // Delete the attempt (slower, more deliberate)
        for (let j = 0; j < attempt.length; j++) {
          currentText = currentText.slice(0, -1)
          setDisplayedText(currentText)
          await new Promise((r) => setTimeout(r, deleteSpeed + Math.random() * 20))
        }

        // Brief pause before next attempt
        await new Promise((r) => setTimeout(r, 300 + Math.random() * 200))
      }
    }

    // Small pause after "ink blot" before continuing
    await new Promise((r) => setTimeout(r, 200))

    // Type the ending
    for (const char of endingText) {
      currentText += char
      setDisplayedText(currentText)
      await new Promise((r) => setTimeout(r, typingSpeed + Math.random() * 25))
    }

    setIsTyping(false)
  }, [])

  useEffect(() => {
    // Small delay before starting to type
    const startDelay = setTimeout(() => {
      typeText()
    }, 800)

    return () => clearTimeout(startDelay)
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
