"use client"
import { useEffect, useRef } from "react"

export default function StarBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    let width = (canvas.width = window.innerWidth)
    let height = (canvas.height = window.innerHeight)

    const stars = Array.from({ length: 150 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      r: Math.random() * 1.5,
      alpha: Math.random(),
      delta: Math.random() * 0.02,
    }))

    const animate = () => {
      ctx.clearRect(0, 0, width, height)
      stars.forEach((s) => {
        s.alpha += s.delta
        if (s.alpha <= 0 || s.alpha >= 1) s.delta = -s.delta
        ctx.beginPath()
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(255,255,255,${s.alpha})`
        ctx.fill()
      })
      requestAnimationFrame(animate)
    }
    animate()

    const handleResize = () => {
      width = canvas.width = window.innerWidth
      height = canvas.height = window.innerHeight
    }
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="fixed top-0 left-0 z-[-1] h-full w-full bg-gradient-to-b from-[#030712] to-[#0f172a]"
    />
  )
}
