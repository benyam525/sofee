"use client"

import { useState, useEffect, useCallback } from "react"

interface TypewriterProps {
  className?: string
  style?: React.CSSProperties
}

// The rejected words/phrases the writer cycles through before landing on "ink blot"
// Each includes the article (a/an) so grammar works with "Choosing a suburb is"
const REJECTED_ATTEMPTS = [
  "a nightmare",
  "a mess",
  "total shi",
  "ajhdfkjhasdasf",
  "😵‍💫🙎🏽🤬🧨💥💀",
  "an ink blot", // Final answer
]

// Helper for more natural random timing - clusters around the middle
function naturalRandom(min: number, max: number): number {
  // Use average of two randoms for more bell-curve distribution
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
    const baseText = "Choosing a suburb is "
    const endingText = " — just like the one next to my name."

    // Initial pause - just cursor blinking, drawing user in
    await new Promise((r) => setTimeout(r, naturalRandom(1200, 1800)))

    // Type the base text first
    let currentText = ""
    for (let i = 0; i < baseText.length; i++) {
      const char = baseText[i]
      currentText += char
      setDisplayedText(currentText)

      // Vary typing speed - occasionally pause slightly longer (thinking)
      let delay = naturalRandom(35, 65)
      if (Math.random() < 0.08) {
        delay += naturalRandom(80, 180) // occasional micro-hesitation
      }
      await new Promise((r) => setTimeout(r, delay))
    }

    // Now cycle through rejected attempts
    for (let i = 0; i < REJECTED_ATTEMPTS.length; i++) {
      const attempt = REJECTED_ATTEMPTS[i]
      const isLast = i === REJECTED_ATTEMPTS.length - 1

      // Small thinking pause before each attempt (varies by attempt)
      if (i > 0) {
        await new Promise((r) => setTimeout(r, naturalRandom(150, 350)))
      }

      // Type this attempt - speed varies per attempt
      const isKeyboardSmash = attempt === "ajhdfkjhasdasf"
      const isEmoji = attempt.includes("😵")

      for (const char of attempt) {
        currentText += char
        setDisplayedText(currentText)

        let charDelay: number
        if (isKeyboardSmash) {
          // Keyboard smash is FAST and frantic
          charDelay = naturalRandom(15, 35)
        } else if (isEmoji) {
          // Emojis typed slower, more deliberate rage
          charDelay = naturalRandom(60, 120)
        } else {
          // Normal typing with variation
          charDelay = naturalRandom(40, 70)
          if (Math.random() < 0.1) {
            charDelay += naturalRandom(50, 120)
          }
        }
        await new Promise((r) => setTimeout(r, charDelay))
      }

      if (!isLast) {
        // Pause - writer realizes this isn't right
        // Vary dramatically based on the attempt
        let pauseDuration: number
        if (isKeyboardSmash) {
          pauseDuration = naturalRandom(300, 500) // quick realization
        } else if (isEmoji) {
          pauseDuration = naturalRandom(700, 1100) // stares at it longer
        } else if (attempt === "total shi") {
          pauseDuration = naturalRandom(400, 700) // catches self quick
        } else {
          pauseDuration = naturalRandom(500, 900)
        }
        await new Promise((r) => setTimeout(r, pauseDuration))

        // Delete the attempt - speed varies
        const deleteSpeed = isKeyboardSmash
          ? naturalRandom(20, 35) // rage delete
          : isEmoji
            ? naturalRandom(40, 70) // slower emoji delete
            : naturalRandom(30, 50)

        for (let j = 0; j < attempt.length; j++) {
          currentText = currentText.slice(0, -1)
          setDisplayedText(currentText)

          // Occasional speed variation in delete
          let delDelay = deleteSpeed
          if (Math.random() < 0.15) {
            delDelay *= naturalRandom(0.5, 1.5)
          }
          await new Promise((r) => setTimeout(r, delDelay))
        }

        // Brief pause before next attempt - varies
        await new Promise((r) => setTimeout(r, naturalRandom(200, 450)))
      }
    }

    // Pause after landing on "ink blot" - a satisfied moment
    await new Promise((r) => setTimeout(r, naturalRandom(250, 400)))

    // Type the ending - slightly faster, more confident now
    for (let i = 0; i < endingText.length; i++) {
      const char = endingText[i]
      currentText += char
      setDisplayedText(currentText)

      let delay = naturalRandom(30, 55)
      // Pause slightly after em dash
      if (endingText[i - 1] === "—") {
        delay += naturalRandom(100, 200)
      }
      await new Promise((r) => setTimeout(r, delay))
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
