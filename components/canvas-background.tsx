"use client"

import { useEffect, useRef } from "react"

export default function CanvasBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const resizeCanvas = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight

      // Initial solid green background
      ctx.fillStyle = "#2A3F30"
      ctx.fillRect(0, 0, canvas.width, canvas.height)
    }

    resizeCanvas()
    window.addEventListener("resize", resizeCanvas)

    const particles: Array<{
      x: number
      y: number
      vx: number
      vy: number
      radius: number
      opacity: number
      hue: number
    }> = []

    const particleCount = 50

    // Green themed particle colors
    const colors = [
      "rgba(110, 231, 183, ", // light green
      "rgba(34, 197, 94, ",   // emerald
      "rgba(74, 222, 128, "   // soft green
    ]

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        radius: Math.random() * 3 + 0.5,
        opacity: Math.random() * 0.25 + 0.05,
        hue: Math.floor(Math.random() * colors.length),
      })
    }

    let animationId: number
    let time = 0

    const animate = () => {
      time += 0.005

      // Green background with fade effect
      ctx.fillStyle = "rgba(42, 63, 48, 0.12)"
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      particles.forEach((particle, index) => {
        particle.x += particle.vx
        particle.y += particle.vy

        particle.opacity = 0.15 + Math.sin(time * 0.5 + index) * 0.1

        if (
          particle.x - particle.radius < 0 ||
          particle.x + particle.radius > canvas.width
        ) {
          particle.vx *= -1
        }

        if (
          particle.y - particle.radius < 0 ||
          particle.y + particle.radius > canvas.height
        ) {
          particle.vy *= -1
        }

        particle.x = Math.max(
          particle.radius,
          Math.min(canvas.width - particle.radius, particle.x)
        )
        particle.y = Math.max(
          particle.radius,
          Math.min(canvas.height - particle.radius, particle.y)
        )

        ctx.fillStyle = colors[particle.hue] + particle.opacity + ")"
        ctx.beginPath()
        ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2)
        ctx.fill()

        particles.slice(index + 1).forEach((other) => {
          const dx = other.x - particle.x
          const dy = other.y - particle.y
          const distance = Math.sqrt(dx * dx + dy * dy)

          if (distance < 150) {
            const avgColor =
              colors[Math.floor((particle.hue + other.hue) / 2)]
            const alpha =
              (1 - distance / 150) * 0.08 * particle.opacity

            ctx.strokeStyle = avgColor + alpha + ")"
            ctx.lineWidth = 0.8
            ctx.beginPath()
            ctx.moveTo(particle.x, particle.y)
            ctx.lineTo(other.x, other.y)
            ctx.stroke()
          }
        })
      })

      animationId = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      cancelAnimationFrame(animationId)
      window.removeEventListener("resize", resizeCanvas)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full pointer-events-none"
    />
  )
}
