"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { createClient } from "@/lib/supabase/client"
import type { Question } from "@/lib/types"
import { Check, X, Loader2, AlertCircle } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export function ModeratorPanel() {
  const { toast } = useToast()
  const [pendingQuestions, setPendingQuestions] = useState<Question[]>([])
  const [approvedQuestions, setApprovedQuestions] = useState<Question[]>([])
  const [rejectedQuestions, setRejectedQuestions] = useState<Question[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [processingId, setProcessingId] = useState<string | null>(null)

  useEffect(() => {
    loadQuestions()
  }, [])

  async function loadQuestions() {
    setIsLoading(true)
    const supabase = createClient()

    const [pending, approved, rejected] = await Promise.all([
      supabase
        .from("questions")
        .select("*, user:users(*), category:categories(*), answer_options(*)")
        .eq("status", "pending")
        .order("created_at", { ascending: false }),
      supabase
        .from("questions")
        .select("*, user:users(*), category:categories(*)")
        .eq("status", "approved")
        .order("approved_at", { ascending: false })
        .limit(10),
      supabase
        .from("questions")
        .select("*, user:users(*), category:categories(*)")
        .eq("status", "rejected")
        .order("created_at", { ascending: false })
        .limit(10),
    ])

    if (pending.data) setPendingQuestions(pending.data as Question[])
    if (approved.data) setApprovedQuestions(approved.data as Question[])
    if (rejected.data) setRejectedQuestions(rejected.data as Question[])

    setIsLoading(false)
  }

  async function handleApprove(questionId: string) {
    setProcessingId(questionId)
    const supabase = createClient()

    try {
      const { error } = await supabase
        .from("questions")
        .update({ status: "approved", approved_at: new Date().toISOString() })
        .eq("id", questionId)

      if (error) throw error

      toast({ title: "Başarılı", description: "Soru onaylandı" })
      await loadQuestions()
    } catch (error) {
      console.error("[v0] Error approving question:", error)
      toast({ title: "Hata", description: "Soru onaylanırken hata oluştu", variant: "destructive" })
    } finally {
      setProcessingId(null)
    }
  }

  async function handleReject(questionId: string, note: string) {
    setProcessingId(questionId)
    const supabase = createClient()

    try {
      const { error } = await supabase
        .from("questions")
        .update({ status: "rejected", moderator_note: note || "Uygun değil" })
        .eq("id", questionId)

      if (error) throw error

      toast({ title: "Başarılı", description: "Soru reddedildi" })
      await loadQuestions()
    } catch (error) {
      console.error("[v0] Error rejecting question:", error)
      toast({ title: "Hata", description: "Soru reddedilirken hata oluştu", variant: "destructive" })
    } finally {
      setProcessingId(null)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <Tabs defaultValue="pending" className="w-full">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="pending">Bekleyen ({pendingQuestions.length})</TabsTrigger>
        <TabsTrigger value="approved">Onaylanan</TabsTrigger>
        <TabsTrigger value="rejected">Reddedilen</TabsTrigger>
      </TabsList>

      <TabsContent value="pending" className="space-y-4">
        {pendingQuestions.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <AlertCircle className="mb-4 h-12 w-12 text-muted-foreground" />
              <p className="text-muted-foreground">Bekleyen soru yok</p>
            </CardContent>
          </Card>
        ) : (
          pendingQuestions.map((question) => (
            <QuestionCard
              key={question.id}
              question={question}
              onApprove={handleApprove}
              onReject={handleReject}
              isProcessing={processingId === question.id}
            />
          ))
        )}
      </TabsContent>

      <TabsContent value="approved" className="space-y-4">
        {approvedQuestions.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <AlertCircle className="mb-4 h-12 w-12 text-muted-foreground" />
              <p className="text-muted-foreground">Henüz onaylanmış soru yok</p>
            </CardContent>
          </Card>
        ) : (
          approvedQuestions.map((question) => <QuestionCard key={question.id} question={question} isApproved />)
        )}
      </TabsContent>

      <TabsContent value="rejected" className="space-y-4">
        {rejectedQuestions.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <AlertCircle className="mb-4 h-12 w-12 text-muted-foreground" />
              <p className="text-muted-foreground">Henüz reddedilmiş soru yok</p>
            </CardContent>
          </Card>
        ) : (
          rejectedQuestions.map((question) => <QuestionCard key={question.id} question={question} isRejected />)
        )}
      </TabsContent>
    </Tabs>
  )
}

function QuestionCard({
  question,
  onApprove,
  onReject,
  isProcessing,
  isApproved,
  isRejected,
}: {
  question: Question
  onApprove?: (id: string) => void
  onReject?: (id: string, note: string) => void
  isProcessing?: boolean
  isApproved?: boolean
  isRejected?: boolean
}) {
  const [rejectNote, setRejectNote] = useState("")
  const [showRejectForm, setShowRejectForm] = useState(false)

  const difficultyColors = {
    kolay: "bg-green-500/10 text-green-500 border-green-500/20",
    orta: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
    zor: "bg-red-500/10 text-red-500 border-red-500/20",
  }

  return (
    <Card className="border-primary/20">
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <CardTitle className="text-xl">{question.question_text}</CardTitle>
            <CardDescription className="mt-2">
              Oluşturan: <span className="font-medium">{question.user?.display_name}</span> •{" "}
              {new Date(question.created_at).toLocaleDateString("tr-TR")}
            </CardDescription>
          </div>
          <div className="flex flex-col gap-2">
            <Badge className={difficultyColors[question.difficulty]}>{question.difficulty.toUpperCase()}</Badge>
            <Badge variant="outline">{question.points} puan</Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {question.category && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>{question.category.icon}</span>
            <span>{question.category.name}</span>
          </div>
        )}

        {question.answer_options && question.answer_options.length > 0 && (
          <div className="space-y-2">
            <Label className="text-sm font-medium">Cevap Seçenekleri:</Label>
            <div className="space-y-2">
              {question.answer_options
                .sort((a, b) => a.option_order - b.option_order)
                .map((option, index) => (
                  <div
                    key={option.id}
                    className={`rounded-lg border p-3 ${
                      option.is_correct ? "border-green-500/50 bg-green-500/10" : "border-border bg-muted/30"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{String.fromCharCode(65 + index)}.</span>
                      <span>{option.option_text}</span>
                      {option.is_correct && (
                        <Badge variant="outline" className="ml-auto bg-green-500/10 text-green-500">
                          Doğru Cevap
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {isRejected && question.moderator_note && (
          <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-3">
            <Label className="text-sm font-medium text-destructive">Red Nedeni:</Label>
            <p className="mt-1 text-sm text-muted-foreground">{question.moderator_note}</p>
          </div>
        )}

        {!isApproved && !isRejected && (
          <div className="flex gap-2">
            {!showRejectForm ? (
              <>
                <Button onClick={() => onApprove?.(question.id)} disabled={isProcessing} className="flex-1 gap-2">
                  {isProcessing ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <Check className="h-4 w-4" />
                      Onayla
                    </>
                  )}
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => setShowRejectForm(true)}
                  disabled={isProcessing}
                  className="flex-1 gap-2"
                >
                  <X className="h-4 w-4" />
                  Reddet
                </Button>
              </>
            ) : (
              <div className="w-full space-y-2">
                <Textarea
                  placeholder="Red nedeni (opsiyonel)"
                  value={rejectNote}
                  onChange={(e) => setRejectNote(e.target.value)}
                  rows={2}
                />
                <div className="flex gap-2">
                  <Button
                    variant="destructive"
                    onClick={() => {
                      onReject?.(question.id, rejectNote)
                      setShowRejectForm(false)
                      setRejectNote("")
                    }}
                    disabled={isProcessing}
                    className="flex-1"
                  >
                    {isProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : "Reddet"}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowRejectForm(false)
                      setRejectNote("")
                    }}
                    disabled={isProcessing}
                  >
                    İptal
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
