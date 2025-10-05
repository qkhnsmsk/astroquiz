"use client"

import { QuizGame } from "@/components/quiz-game"
import { Brain } from "lucide-react"
import StarBackground from "@/components/StarBackground"

export default function QuizPage() {
  return (
    <div className="relative min-h-screen overflow-hidden text-white bg-gradient-to-br from-[#020617] via-[#0f172a] to-[#1e293b]">
      {/* Astronomik yıldızlı arka plan */}
      <StarBackground />

      {/* İçerik */}
      <div className="relative z-10 mx-auto max-w-5xl px-6 py-16 sm:px-8 lg:px-12">
        {/* Üst Başlık */}
        <div className="mb-12 flex flex-col items-center justify-center text-center md:flex-row md:text-left md:items-center md:justify-start gap-6">
          <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-accent/10 backdrop-blur-sm shadow-md">
            <Brain className="h-10 w-10 text-accent animate-pulse" />
          </div>

          <div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight">
              Quiz Oyna
            </h1>
            <p className="text-muted-foreground text-base sm:text-lg lg:text-xl mt-2">
              Astronomi bilgini test et ve yıldızlar arasında puan topla 🌠
            </p>
          </div>
        </div>

        {/* Quiz Alanı */}
        <div className="rounded-2xl border border-white/10 bg-card/30 backdrop-blur-xl p-6 sm:p-8 lg:p-10 shadow-2xl">
          <QuizGame />
        </div>
      </div>
    </div>
  )
}
