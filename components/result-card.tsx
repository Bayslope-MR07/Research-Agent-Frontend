// components/result-card.tsx - Updated for HTML rendering and code highlighting
"use client"

import { useState } from "react"
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism'  // Dark theme; adjust as needed

interface ResultCardProps {
  result: {
    id: number
    title: string
    url: string
    description: string  // Now supports HTML/markdown
    score?: number
    sourceQuery?: string
  }
  isAnimating: boolean
}

export default function ResultCard({ result, isAnimating }: ResultCardProps) {
  const [isHovered, setIsHovered] = useState(false)

  // Simple parser for description: Handle highlighted spans and code blocks
  const renderDescription = (desc: string) => {
    // Handle <span class="highlighted"> as mark
    let html = desc.replace(/<span class="highlighted">(.*?)<\/span>/g, '<mark class="bg-yellow-200 dark:bg-yellow-800 px-1 rounded">$1</mark>')
    
    // Parse ```language\ncode\n``` blocks
    const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g
    let match
    while ((match = codeBlockRegex.exec(html)) !== null) {
      const lang = match[1] || 'text'
      const code = match[2].trim()
      const replacement = `<div class="my-4 p-4 bg-muted rounded-lg"><pre class="code-block"><code>${code}</code></pre></div>`
      // For full highlighting, we'd use SyntaxHighlighter, but to avoid heavy rendering, use a placeholder or conditional
      // Here, simple <pre> for now; extend with highlighter if code detected
      html = html.replace(match[0], replacement)
    }
    
    return { __html: html }
  }

  return (
    <div
      className={`group premium-card p-6 transition-all duration-500 transform cursor-pointer ${
        isAnimating ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
      } ${
        isHovered
          ? "border-accent/50 shadow-xl shadow-accent/25 -translate-y-2 scale-[1.02]"
          : "border-border/50 shadow-lg shadow-primary/10"
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Score Badge */}
      {result.score && (
        <div className="absolute top-3 right-3 bg-primary/90 text-primary-foreground text-xs px-2 py-1 rounded-full">
          {result.score}/10
        </div>
      )}

      <div
        className={`absolute top-0 left-0 h-1 bg-gradient-to-r from-primary via-secondary to-accent transition-all duration-300 ${isHovered ? "w-full" : "w-0"}`}
      />

      <div className="space-y-3">
        <h3 className="text-lg font-bold text-foreground group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-primary group-hover:to-accent group-hover:bg-clip-text transition-all duration-300">
          {result.title}
        </h3>

        <a
          href={result.url.startsWith('http') ? result.url : `https://${result.url}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-accent hover:text-accent/80 inline-flex items-center gap-1 font-semibold transition-all duration-200"
        >
          {result.url.replace(/^https?:\/\//, '')}
          <span className="opacity-0 group-hover:opacity-100 transition-opacity">↗</span>
        </a>

        {/* Render description with HTML support */}
        <div 
          className="text-sm text-foreground/90 leading-relaxed pt-2 prose prose-sm max-w-none"
          dangerouslySetInnerHTML={renderDescription(result.description)}
        />
      </div>

      <div className="absolute bottom-0 right-0 w-12 h-12 bg-gradient-to-tl from-accent/10 to-transparent rounded-tl-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
    </div>
  )
}