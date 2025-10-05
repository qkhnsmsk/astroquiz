"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { useToast } from "@/hooks/use-toast"
import { createClient } from "@/lib/supabase/client"
import type { Category, DifficultyLevel } from "@/lib/types"
import { Loader2, Plus } from "lucide-react"

const DIFFICULTY_POINTS = {
  kolay: 10,
  orta: 25,
  zor: 50,
}

export function CreateQuestionForm() {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])

  // Form state
  const [username, setUsername] = useState("")
  const [questionText, setQuestionText] = useState("")
  const [categoryId, setCategoryId] = useState("")
  const [difficulty, setDifficulty] = useState<DifficultyLevel>("orta")
  const [options, setOptions] = useState([
    { text: "", isCorrect: false },
    { text: "", isCorrect: false },
    { text: "", isCorrect: false },
    { text: "", isCorrect: false },
  ])

  useEffect(() => {
    loadCategories()
  }, [])

  async function loadCategories() {
    const supabase = createClient()
    const { data } = await supabase.from("categories").select("*").order("name")
    if (data) setCategories(data)
  }

  function updateOption(index: number, text: string) {
    const newOptions = [...options]
    newOptions[index].text = text
    setOptions(newOptions)
  }

  function setCorrectAnswer(index: number) {
    const newOptions = options.map((opt, i) => ({
      ...opt,
      isCorrect: i === index,
    }))
    setOptions(newOptions)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setIsLoading(true)

    try {
      const supabase = createClient()

      // Validasyon
      if (!username.trim()) {
        toast({ title: "Hata", description: "Kullanıcı adı gerekli", variant: "destructive" })
        return
      }

      if (!questionText.trim()) {
        toast({ title: "Hata", description: "Soru metni gerekli", variant: "destructive" })
        return
      }

      if (!categoryId) {
        toast({ title: "Hata", description: "Kategori seçmelisin", variant: "destructive" })
        return
      }

      const filledOptions = options.filter((opt) => opt.text.trim())
      if (filledOptions.length < 2) {
        toast({ title: "Hata", description: "En az 2 cevap seçeneği gerekli", variant: "destructive" })
        return
      }

      const correctAnswers = options.filter((opt) => opt.isCorrect)
      if (correctAnswers.length !== 1) {
        toast({ title: "Hata", description: "Tam olarak 1 doğru cevap seçmelisin", variant: "destructive" })
        return
      }

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

      // Soruyu oluştur
      const { data: question, error: questionError } = await supabase
        .from("questions")
        .insert({
          user_id: user.id,
          category_id: categoryId,
          question_text: questionText.trim(),
          difficulty,
          points: DIFFICULTY_POINTS[difficulty],
          status: "pending",
        })
        .select()
        .single()

      if (questionError) throw questionError

      // Cevap seçeneklerini ekle
      const optionsToInsert = filledOptions.map((opt, index) => ({
        question_id: question.id,
        option_text: opt.text.trim(),
        is_correct: opt.isCorrect,
        option_order: index,
      }))

      const { error: optionsError } = await supabase.from("answer_options").insert(optionsToInsert)

      if (optionsError) throw optionsError

      // Kullanıcıya soru oluşturma puanı ver (5 puan)
      await supabase
        .from("users")
        .update({ total_points: user.total_points + 5 })
        .eq("id", user.id)

      toast({
        title: "Başarılı!",
        description: "Sorun oluşturuldu ve moderatör onayı bekliyor. 5 puan kazandın!",
      })

      // Formu temizle
      setQuestionText("")
      setCategoryId("")
      setDifficulty("orta")
      setOptions([
        { text: "", isCorrect: false },
        { text: "", isCorrect: false },
        { text: "", isCorrect: false },
        { text: "", isCorrect: false },
      ])

      // Profil sayfasına yönlendir
      setTimeout(() => {
        router.push(`/profile?username=${username}`)
      }, 1500)
    } catch (error) {
      console.error("[v0] Error creating question:", error)
      toast({
        title: "Hata",
        description: "Soru oluşturulurken bir hata oluştu",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="username">Kullanıcı Adın</Label>
        <Input
          id="username"
          placeholder="kullanici_adi"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
        <p className="text-xs text-muted-foreground">Bu adla sorular oluşturacak ve puan kazanacaksın</p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="question">Soru</Label>
        <Textarea
          id="question"
          placeholder="Örnek: Güneş sistemindeki en büyük gezegen hangisidir?"
          value={questionText}
          onChange={(e) => setQuestionText(e.target.value)}
          rows={3}
          required
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="category">Kategori</Label>
          <Select value={categoryId} onValueChange={setCategoryId} required>
            <SelectTrigger id="category">
              <SelectValue placeholder="Kategori seç" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((cat) => (
                <SelectItem key={cat.id} value={cat.id}>
                  {cat.icon} {cat.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="difficulty">Zorluk</Label>
          <Select value={difficulty} onValueChange={(val) => setDifficulty(val as DifficultyLevel)} required>
            <SelectTrigger id="difficulty">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="kolay">Kolay (10 puan)</SelectItem>
              <SelectItem value="orta">Orta (25 puan)</SelectItem>
              <SelectItem value="zor">Zor (50 puan)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-4">
        <Label>Cevap Seçenekleri</Label>
        <RadioGroup value={options.findIndex((opt) => opt.isCorrect).toString()}>
          {options.map((option, index) => (
            <div key={index} className="flex items-center gap-3">
              <RadioGroupItem value={index.toString()} id={`option-${index}`} onClick={() => setCorrectAnswer(index)} />
              <Input
                placeholder={`Seçenek ${index + 1}`}
                value={option.text}
                onChange={(e) => updateOption(index, e.target.value)}
                className="flex-1"
              />
              <Label htmlFor={`option-${index}`} className="text-xs text-muted-foreground">
                {option.isCorrect ? "Doğru" : "Yanlış"}
              </Label>
            </div>
          ))}
        </RadioGroup>
        <p className="text-xs text-muted-foreground">Doğru cevabı seçmek için sol taraftaki daireye tıkla</p>
      </div>

      <Button type="submit" disabled={isLoading} className="w-full">
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Oluşturuluyor...
          </>
        ) : (
          <>
            <Plus className="mr-2 h-4 w-4" />
            Soruyu Oluştur
          </>
        )}
      </Button>
    </form>
  )
}
