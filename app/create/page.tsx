"use client"

import { CreateQuestionForm } from "@/components/create-question-form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Sparkles } from "lucide-react"

export default function CreatePage() {
  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-black text-white">
      {/* --- Yıldızlı Arka Plan --- */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,rgba(15,23,42,1),black)]" />
      <div className="absolute inset-0 bg-[url('/stars.svg')] bg-cover bg-center opacity-30 animate-pulse" />
      <div className="absolute inset-0">
        <div className="stars absolute w-[2px] h-[2px] bg-white rounded-full animate-twinkle"></div>
      </div>

      {/* --- İçerik --- */}
      <div className="relative z-10 container max-w-5xl py-16 px-4 sm:px-8">
        <div className="mb-12 flex flex-col md:flex-row items-center md:items-start gap-6 text-center md:text-left">
          <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-primary/20 backdrop-blur-sm shadow-lg">
            <Sparkles className="h-10 w-10 text-primary animate-pulse" />
          </div>
          <div>
            <h1 className="text-4xl sm:text-5xl font-bold mb-2">Soru Oluştur</h1>
            <p className="text-muted-foreground text-gray-300 max-w-2xl">
              Astronomi bilgini paylaş ve diğerlerinin öğrenmesine yardımcı ol. 
              Her yeni soru, bilgi evrenine küçük bir yıldız ekler! 🌟
            </p>
          </div>
        </div>

        <Card className="border border-primary/30 bg-black/40 backdrop-blur-md shadow-xl">
          <CardHeader>
            <CardTitle className="text-xl text-primary">Yeni Soru</CardTitle>
            <CardDescription className="text-gray-400">
              Sorun gönderildikten sonra moderatörler tarafından incelenecek. 
              Zor sorular daha fazla puan kazandırır — tıpkı büyük yıldızların daha parlak olması gibi!
            </CardDescription>
          </CardHeader>
          <CardContent>
            <CreateQuestionForm />
          </CardContent>
        </Card>

        <div className="mt-10 rounded-xl border border-accent/30 bg-accent/10 backdrop-blur-md p-6 shadow-lg">
          <h3 className="mb-4 font-semibold text-lg text-accent">İpuçları 🌌</h3>
          <ul className="space-y-2 text-sm text-gray-300">
            <li>• Sorunun net ve anlaşılır olduğundan emin ol</li>
            <li>• 4 cevap seçeneği ekle, sadece biri doğru olmalı</li>
            <li>• Zorluk seviyesini doğru seç: Kolay (10 puan), Orta (25 puan), Zor (50 puan)</li>
            <li>• Kategorini doğru seç, bu diğer kullanıcıların soruyu bulmasına yardımcı olur</li>
          </ul>
        </div>
      </div>

      {/* --- Basit yıldız animasyonu için küçük CSS --- */}
      <style jsx>{`
        @keyframes twinkle {
          0%, 100% { opacity: 0.6; }
          50% { opacity: 1; }
        }
        .animate-twinkle {
          animation: twinkle 2s infinite ease-in-out alternate;
        }
      `}</style>
    </div>
  )
}
