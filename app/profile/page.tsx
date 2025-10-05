"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { createClient } from "@/lib/supabase/client"
import type { User, Question, UserBadge } from "@/lib/types"
import { Loader2, Search, Trophy, Brain, CheckCircle, Sparkles } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { profile } from "console"

export function UserProfile() {
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const [username, setUsername] = useState(searchParams.get("username") || "")
  const [user, setUser] = useState<User | null>(null)
  const [userBadges, setUserBadges] = useState<UserBadge[]>([])
  const [createdQuestions, setCreatedQuestions] = useState<Question[]>([])
  const [stats, setStats] = useState({
    totalAnswered: 0,
    correctAnswers: 0,
    totalQuestionsCreated: 0,
    approvedQuestions: 0,
  })
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    console.log("[v0] UserProfile mounted, searchParams username:", searchParams.get("username"))
    if (searchParams.get("username")) {
      loadProfile(searchParams.get("username")!)
    }
  }, [searchParams])

  async function loadProfile(usernameToLoad: string) {
    console.log("[v0] Loading profile for username:", usernameToLoad)
    setIsLoading(true)
    const supabase = createClient()

    try {
      // Kullanıcıyı bul
      const { data: userData, error: userError } = await supabase
        .from("users")
        .select("*")
        .eq("username", usernameToLoad)
        .single()

      console.log("[v0] User data result:", { userData, userError })

      if (userError || !userData) {
        console.error("[v0] User not found:", userError)
        toast({ title: "Hata", description: "Kullanıcı bulunamadı", variant: "destructive" })
        setIsLoading(false)
        return
      }

      setUser(userData)
      console.log("[v0] User set:", userData.display_name)

      // Kullanıcının rozetlerini al
      const { data: badgesData } = await supabase
        .from("user_badges")
        .select("*, badge:badges(*)")
        .eq("user_id", userData.id)
        .order("earned_at", { ascending: false })

      console.log("[v0] Badges loaded:", badgesData?.length || 0)
      if (badgesData) setUserBadges(badgesData as UserBadge[])

      // Kullanıcının oluşturduğu soruları al
      const { data: questionsData } = await supabase
        .from("questions")
        .select("*, category:categories(*)")
        .eq("user_id", userData.id)
        .order("created_at", { ascending: false })

      console.log("[v0] Questions loaded:", questionsData?.length || 0)
      if (questionsData) setCreatedQuestions(questionsData as Question[])

      // İstatistikleri hesapla
      const { data: answersData } = await supabase.from("user_answers").select("*").eq("user_id", userData.id)

      const totalAnswered = answersData?.length || 0
      const correctAnswers = answersData?.filter((a) => a.is_correct).length || 0
      const totalQuestionsCreated = questionsData?.length || 0
      const approvedQuestions = questionsData?.filter((q) => q.status === "approved").length || 0

      console.log("[v0] Stats calculated:", { totalAnswered, correctAnswers, totalQuestionsCreated, approvedQuestions })

      setStats({
        totalAnswered,
        correctAnswers,
        totalQuestionsCreated,
        approvedQuestions,
      })

      console.log("[v0] Profile loaded successfully")
    } catch (error) {
      console.error("[v0] Error loading profile:", error)
      toast({ title: "Hata", description: "Profil yüklenirken hata oluştu", variant: "destructive" })
    } finally {
      console.log("[v0] Setting isLoading to false")
      setIsLoading(false)
    }
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    console.log("[v0] Search submitted with username:", username)
    if (username.trim()) {
      loadProfile(username.trim())
    }
  }

  console.log("[v0] Render state:", { user: user?.display_name, isLoading })

  if (!user && !isLoading) {
    console.log("[v0] Rendering search form")
    return (
      <Card>
        <CardHeader>
          <CardTitle>Profil Ara</CardTitle>
          <CardDescription>Görüntülemek istediğin kullanıcı adını gir</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="flex-1">
              <Label htmlFor="username" className="sr-only">
                Kullanıcı Adı
              </Label>
              <Input
                id="username"
                placeholder="kullanici_adi"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
            <Button type="submit" className="gap-2">
              <Search className="h-4 w-4" />
              Ara
            </Button>
          </form>
        </CardContent>
      </Card>
    )
  }

  if (isLoading) {
    console.log("[v0] Rendering loading state")
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!user) {
    console.log("[v0] No user and not loading, returning null")
    return null
  }

  const successRate = stats.totalAnswered > 0 ? Math.round((stats.correctAnswers / stats.totalAnswered) * 100) : 0

  console.log("[v0] Rendering user profile for:", user.display_name)

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <Card className="border-primary/20 bg-gradient-to-br from-primary/10 to-primary/5">
        <CardContent className="pt-6">
          <div className="flex flex-col items-center gap-6 sm:flex-row">
            <Avatar className="h-24 w-24">
              <AvatarFallback className="text-3xl font-bold">
                {user.display_name.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 text-center sm:text-left">
              <h2 className="text-3xl font-bold">{user.display_name}</h2>
              <p className="text-muted-foreground">@{user.username}</p>
              <p className="mt-2 text-sm text-muted-foreground">
                Üyelik: {new Date(user.created_at).toLocaleDateString("tr-TR")}
              </p>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-primary">{user.total_points}</div>
              <div className="text-sm text-muted-foreground">Toplam Puan</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="flex flex-col items-center gap-2 pt-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <Brain className="h-6 w-6 text-primary" />
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{stats.totalAnswered}</div>
              <div className="text-sm text-muted-foreground">Cevaplanan Soru</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex flex-col items-center gap-2 pt-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-500/10">
              <CheckCircle className="h-6 w-6 text-green-500" />
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{stats.correctAnswers}</div>
              <div className="text-sm text-muted-foreground">Doğru Cevap</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex flex-col items-center gap-2 pt-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent/10">
              <Trophy className="h-6 w-6 text-accent" />
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{successRate}%</div>
              <div className="text-sm text-muted-foreground">Başarı Oranı</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex flex-col items-center gap-2 pt-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-chart-3/10">
              <Sparkles className="h-6 w-6 text-chart-3" />
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{stats.approvedQuestions}</div>
              <div className="text-sm text-muted-foreground">Onaylanan Soru</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Badges and Questions */}
      <Tabs defaultValue="badges" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="badges">Rozetler ({userBadges.length})</TabsTrigger>
          <TabsTrigger value="questions">Oluşturulan Sorular ({createdQuestions.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="badges" className="space-y-4">
          {userBadges.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Trophy className="mb-4 h-12 w-12 text-muted-foreground" />
                <p className="text-muted-foreground">Henüz rozet kazanılmadı</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {userBadges.map((userBadge) => (
                <Card key={userBadge.id} className="border-primary/20">
                  <CardContent className="flex flex-col items-center gap-3 pt-6">
                    <div
                      className="flex h-16 w-16 items-center justify-center rounded-full text-3xl"
                      style={{ backgroundColor: `${userBadge.badge?.color}20` }}
                    >
                      {userBadge.badge?.icon}
                    </div>
                    <div className="text-center">
                      <h3 className="font-bold">{userBadge.badge?.name}</h3>
                      <p className="text-sm text-muted-foreground">{userBadge.badge?.description}</p>
                    </div>
                    <Badge
                      variant="outline"
                      style={{
                        borderColor: userBadge.badge?.color,
                        color: userBadge.badge?.color,
                      }}
                    >
                      {new Date(userBadge.earned_at).toLocaleDateString("tr-TR")}
                    </Badge>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="questions" className="space-y-4">
          {createdQuestions.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Sparkles className="mb-4 h-12 w-12 text-muted-foreground" />
                <p className="text-muted-foreground">Henüz soru oluşturulmadı</p>
              </CardContent>
            </Card>
          ) : (
            createdQuestions.map((question) => {
              const statusColors = {
                pending: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
                approved: "bg-green-500/10 text-green-500 border-green-500/20",
                rejected: "bg-red-500/10 text-red-500 border-red-500/20",
              }

              const difficultyColors = {
                kolay: "bg-green-500/10 text-green-500 border-green-500/20",
                orta: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
                zor: "bg-red-500/10 text-red-500 border-red-500/20",
              }

              return (
                <Card key={question.id} className="border-primary/20">
                  <CardHeader>
                    <div className="flex items-start justify-between gap-4">
                      <CardTitle className="text-lg">{question.question_text}</CardTitle>
                      <div className="flex flex-col gap-2">
                        <Badge className={statusColors[question.status]}>
                          {question.status === "pending"
                            ? "Bekliyor"
                            : question.status === "approved"
                              ? "Onaylandı"
                              : "Reddedildi"}
                        </Badge>
                        <Badge className={difficultyColors[question.difficulty]}>
                          {question.difficulty.toUpperCase()}
                        </Badge>
                      </div>
                    </div>
                    <CardDescription className="flex items-center gap-4">
                      {question.category && (
                        <span className="flex items-center gap-1">
                          {question.category.icon} {question.category.name}
                        </span>
                      )}
                      <span>{question.points} puan</span>
                      <span>{new Date(question.created_at).toLocaleDateString("tr-TR")}</span>
                    </CardDescription>
                  </CardHeader>
                  {question.moderator_note && question.status === "rejected" && (
                    <CardContent>
                      <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-3">
                        <p className="text-sm font-medium text-destructive">Red Nedeni:</p>
                        <p className="mt-1 text-sm text-muted-foreground">{question.moderator_note}</p>
                      </div>
                    </CardContent>
                  )}
                </Card>
              )
            })
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
export default UserProfile