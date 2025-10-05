"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { useToast } from "@/hooks/use-toast"
import { createClient } from "@/lib/supabase/client"
import type { Question } from "@/lib/types"
import { Loader2, Trophy, CheckCircle2, XCircle, Sparkles } from "lucide-react"

type GameState = "setup" | "playing" | "answered" | "finished"

function playSound(isCorrect: boolean) {
  try {
    const audio = new Audio(isCorrect ? "/correct.mp3" : "/incorrect.mp3")
    audio.volume = 0.5 // Set volume to 50%
    audio.play().catch((error) => {
      console.error("[v0] Error playing sound:", error)
    })
  } catch (error) {
    console.error("[v0] Error creating audio:", error)
  }
}

export function QuizGame() {
  const { toast } = useToast()
  const [gameState, setGameState] = useState<GameState>("setup")
  const [username, setUsername] = useState("")
  const [userId, setUserId] = useState<string | null>(null)
  const [questions, setQuestions] = useState<Question[]>([])
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [selectedOption, setSelectedOption] = useState<string | null>(null)
  const [score, setScore] = useState(0)
  const [totalPoints, setTotalPoints] = useState(0)
  const [isLoading, setIsLoading] = useState(false)

  const currentQuestion = questions[currentQuestionIndex]
  const progress = questions.length > 0 ? ((currentQuestionIndex + 1) / questions.length) * 100 : 0

  async function startQuiz() {
    if (!username.trim()) {
      toast({ title: "Hata", description: "Kullanıcı adı gerekli", variant: "destructive" })
      return
    }

    setIsLoading(true)
    const supabase = createClient()

    try {
      // Kullanıcıyı bul veya oluştur
      let { data: user } = await supabase.from("users").select("*").eq("username", username.trim()).single()

      if (!user) {
        const { data: newUser, error: userError } = await supabase
          .from("users")
          .insert({ username: username.trim(), display_name: username.trim() })
          .select()
          .single()

        if (userError) throw userError
        user = newUser
      }

      setUserId(user.id)
      setTotalPoints(user.total_points)

      // Onaylanmış soruları getir (kullanıcının daha önce cevaplamadığı)
      const { data: answeredQuestions } = await supabase
        .from("user_answers")
        .select("question_id")
        .eq("user_id", user.id)

      const answeredIds = answeredQuestions?.map((a) => a.question_id) || []

      let query = supabase
        .from("questions")
        .select("*, category:categories(*), answer_options(*)")
        .eq("status", "approved")
        .order("created_at", { ascending: false })
        .limit(10)

      if (answeredIds.length > 0) {
        query = query.not("id", "in", `(${answeredIds.join(",")})`)
      }

      const { data: questionsData, error: questionsError } = await query

      if (questionsError) throw questionsError

      if (!questionsData || questionsData.length === 0) {
        toast({
          title: "Tüm soruları cevapladın!",
          description: "Yeni sorular eklenene kadar bekle veya kendin soru oluştur",
        })
        return
      }

      setQuestions(questionsData as Question[])
      setGameState("playing")
    } catch (error) {
      console.error("[v0] Error starting quiz:", error)
      toast({ title: "Hata", description: "Quiz başlatılırken hata oluştu", variant: "destructive" })
    } finally {
      setIsLoading(false)
    }
  }

  async function submitAnswer() {
    if (!selectedOption || !userId || !currentQuestion) return

    setIsLoading(true)

    try {
      const response = await fetch("/api/submit-answer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          questionId: currentQuestion.id,
          selectedOptionId: selectedOption,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "Failed to submit answer")
      }

      playSound(result.isCorrect)

      if (result.isCorrect) {
        setScore(score + 1)
        setTotalPoints(result.newTotalPoints)
      }

      setGameState("answered")
    } catch (error) {
      console.error("[v0] Error submitting answer:", error)
      toast({ title: "Hata", description: "Cevap kaydedilirken hata oluştu", variant: "destructive" })
    } finally {
      setIsLoading(false)
    }
  }

  function nextQuestion() {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1)
      setSelectedOption(null)
      setGameState("playing")
    } else {
      setGameState("finished")
    }
  }

  function resetQuiz() {
    setGameState("setup")
    setQuestions([])
    setCurrentQuestionIndex(0)
    setSelectedOption(null)
    setScore(0)
    setUserId(null)
  }

  if (gameState === "setup") {
    return (
      <Card className="border-primary/20">
        <CardHeader>
          <CardTitle>Quiz'e Başla</CardTitle>
          <CardDescription>Kullanıcı adını gir ve astronomi bilgini test et</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="quiz-username">Kullanıcı Adın</Label>
            <Input
              id="quiz-username"
              placeholder="kullanici_adi"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && startQuiz()}
            />
          </div>
          <Button onClick={startQuiz} disabled={isLoading} className="w-full gap-2">
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Yükleniyor...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                Quiz'e Başla
              </>
            )}
          </Button>

          <div className="rounded-lg border border-accent/20 bg-accent/5 p-4">
            <h3 className="mb-2 font-semibold">Nasıl Oynanır?</h3>
            <ul className="space-y-1 text-sm text-muted-foreground">
              <li>• Her soru için 4 seçenek sunulur</li>
              <li>• Doğru cevap verirsen puan kazanırsın</li>
              <li>• Zor sorular daha fazla puan getirir</li>
              <li>• Belirli puanlara ulaşarak rozet kazanırsın</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (gameState === "finished") {
    const percentage = questions.length > 0 ? Math.round((score / questions.length) * 100) : 0

    return (
      <Card className="border-primary/20">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
            <Trophy className="h-10 w-10 text-primary" />
          </div>
          <CardTitle className="text-3xl">Quiz Tamamlandı!</CardTitle>
          <CardDescription>Harika bir performans sergiledin</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-3">
            <Card>
              <CardContent className="pt-6 text-center">
                <div className="text-3xl font-bold text-primary">{score}</div>
                <div className="text-sm text-muted-foreground">Doğru Cevap</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 text-center">
                <div className="text-3xl font-bold text-accent">{percentage}%</div>
                <div className="text-sm text-muted-foreground">Başarı Oranı</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 text-center">
                <div className="text-3xl font-bold text-chart-3">{totalPoints}</div>
                <div className="text-sm text-muted-foreground">Toplam Puan</div>
              </CardContent>
            </Card>
          </div>

          <div className="flex gap-2">
            <Button onClick={resetQuiz} className="flex-1">
              Tekrar Oyna
            </Button>
            <Button variant="outline" onClick={() => (window.location.href = `/profile?username=${username}`)}>
              Profilime Git
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!currentQuestion) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  const correctOption = currentQuestion.answer_options?.find((opt) => opt.is_correct)
  const isCorrect = selectedOption === correctOption?.id

  const difficultyColors = {
    kolay: "bg-green-500/10 text-green-500 border-green-500/20",
    orta: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
    zor: "bg-red-500/10 text-red-500 border-red-500/20",
  }

  return (
    <div className="space-y-6">
      {/* Progress Bar */}
      <Card>
        <CardContent className="pt-6">
          <div className="mb-2 flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
              Soru {currentQuestionIndex + 1} / {questions.length}
            </span>
            <span className="font-medium">
              Puan: {totalPoints} • Doğru: {score}
            </span>
          </div>
          <Progress value={progress} className="h-2" />
        </CardContent>
      </Card>

      {/* Question Card */}
      <Card className="border-primary/20">
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <CardTitle className="text-2xl">{currentQuestion.question_text}</CardTitle>
            <div className="flex flex-col gap-2">
              <Badge className={difficultyColors[currentQuestion.difficulty]}>
                {currentQuestion.difficulty.toUpperCase()}
              </Badge>
              <Badge variant="outline">{currentQuestion.points} puan</Badge>
            </div>
          </div>
          {currentQuestion.category && (
            <CardDescription className="flex items-center gap-2">
              <span>{currentQuestion.category.icon}</span>
              <span>{currentQuestion.category.name}</span>
            </CardDescription>
          )}
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            {currentQuestion.answer_options
              ?.sort((a, b) => a.option_order - b.option_order)
              .map((option, index) => {
                const isSelected = selectedOption === option.id
                const showCorrect = gameState === "answered" && option.is_correct
                const showWrong = gameState === "answered" && isSelected && !option.is_correct

                return (
                  <button
                    key={option.id}
                    onClick={() => gameState === "playing" && setSelectedOption(option.id)}
                    disabled={gameState === "answered" || isLoading}
                    className={`w-full rounded-lg border p-4 text-left transition-all ${
                      showCorrect
                        ? "border-green-500 bg-green-500/10"
                        : showWrong
                          ? "border-red-500 bg-red-500/10"
                          : isSelected
                            ? "border-primary bg-primary/10"
                            : "border-border bg-muted/30 hover:border-primary/50 hover:bg-muted/50"
                    } ${gameState === "answered" ? "cursor-default" : "cursor-pointer"}`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-background font-medium">
                        {String.fromCharCode(65 + index)}
                      </span>
                      <span className="flex-1">{option.option_text}</span>
                      {showCorrect && <CheckCircle2 className="h-5 w-5 text-green-500" />}
                      {showWrong && <XCircle className="h-5 w-5 text-red-500" />}
                    </div>
                  </button>
                )
              })}
          </div>

          {gameState === "answered" && (
            <div
              className={`rounded-lg border p-4 ${
                isCorrect ? "border-green-500/50 bg-green-500/10" : "border-red-500/50 bg-red-500/10"
              }`}
            >
              <div className="flex items-center gap-2">
                {isCorrect ? (
                  <>
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                    <span className="font-medium text-green-500">Doğru! +{currentQuestion.points} puan kazandın</span>
                  </>
                ) : (
                  <>
                    <XCircle className="h-5 w-5 text-red-500" />
                    <span className="font-medium text-red-500">Yanlış cevap</span>
                  </>
                )}
              </div>
            </div>
          )}

          {gameState === "playing" ? (
            <Button onClick={submitAnswer} disabled={!selectedOption || isLoading} className="w-full">
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Kontrol Ediliyor...
                </>
              ) : (
                "Cevabı Gönder"
              )}
            </Button>
          ) : (
            <Button onClick={nextQuestion} className="w-full">
              {currentQuestionIndex < questions.length - 1 ? "Sonraki Soru" : "Sonuçları Gör"}
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
