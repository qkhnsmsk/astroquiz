"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"
import type { User, Badge as BadgeType } from "@/lib/types"
import { Loader2, Crown, Medal, Award, Trophy, AlertCircle } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export function Leaderboard() {
  const [users, setUsers] = useState<User[]>([])
  const [badges, setBadges] = useState<BadgeType[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    console.log("[v0] Leaderboard mounted")
    loadData()
  }, [])

  async function loadData() {
    console.log("[v0] loadData called, setting isLoading to true")
    setIsLoading(true)
    setError(null)
    const supabase = createClient()

    try {
      console.log("[v0] Loading leaderboard data...")

      const [usersData, badgesData] = await Promise.all([
        supabase.from("users").select("*").order("total_points", { ascending: false }).limit(50),
        supabase.from("badges").select("*").order("required_points", { ascending: true }),
      ])

      if (usersData.error) {
        console.error("[v0] Error loading users:", usersData.error)
        throw new Error(usersData.error.message)
      }

      if (badgesData.error) {
        console.error("[v0] Error loading badges:", badgesData.error)
        throw new Error(badgesData.error.message)
      }

      console.log("[v0] Loaded users:", usersData.data?.length || 0)
      console.log("[v0] Loaded badges:", badgesData.data?.length || 0)

      if (usersData.data && usersData.data.length > 0) {
        console.log(
          "[v0] User scores (should be highest to lowest):",
          usersData.data.map((u) => ({ name: u.display_name, points: u.total_points })),
        )
      }

      if (usersData.data) setUsers(usersData.data)
      if (badgesData.data) setBadges(badgesData.data)

      console.log("[v0] Data set successfully")
    } catch (err: any) {
      console.error("[v0] Error in loadData:", err)
      setError(err.message || "Veri yüklenirken hata oluştu")
    } finally {
      console.log("[v0] Setting isLoading to false")
      setIsLoading(false)
    }
  }

  console.log("[v0] Render state:", { usersCount: users.length, badgesCount: badges.length, isLoading, error })

  if (isLoading) {
    console.log("[v0] Rendering loading state")
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (error) {
    console.log("[v0] Rendering error state")
    return (
      <Card className="border-destructive/50">
        <CardContent className="flex flex-col items-center justify-center gap-4 py-12">
          <AlertCircle className="h-12 w-12 text-destructive" />
          <div className="text-center">
            <h3 className="font-semibold text-destructive">Veritabanı Hatası</h3>
            <p className="mt-2 text-sm text-muted-foreground">{error}</p>
            <p className="mt-4 text-sm text-muted-foreground">Lütfen SQL scriptlerini çalıştırdığınızdan emin olun:</p>
            <ul className="mt-2 text-left text-sm text-muted-foreground">
              <li>• scripts/001_create_tables.sql</li>
              <li>• scripts/002_seed_data.sql</li>
            </ul>
          </div>
          <Button onClick={loadData} variant="outline" className="mt-4 bg-transparent">
            Tekrar Dene
          </Button>
        </CardContent>
      </Card>
    )
  }

  console.log("[v0] Rendering leaderboard with", users.length, "users")

  return (
    <Tabs defaultValue="leaderboard" className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="leaderboard">Sıralama</TabsTrigger>
        <TabsTrigger value="badges">Rozetler</TabsTrigger>
      </TabsList>

      <TabsContent value="leaderboard" className="space-y-4">
        {users.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Trophy className="mb-4 h-12 w-12 text-muted-foreground" />
              <p className="text-muted-foreground">Henüz kullanıcı yok</p>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Top 3 */}
            <div className="grid gap-4 md:grid-cols-3">
              {users.slice(0, 3).map((user, index) => (
                <Card
                  key={user.id}
                  className={`${
                    index === 0
                      ? "border-chart-4/50 bg-gradient-to-br from-chart-4/10 to-chart-4/5"
                      : index === 1
                        ? "border-muted-foreground/30 bg-gradient-to-br from-muted-foreground/10 to-muted-foreground/5"
                        : "border-chart-5/30 bg-gradient-to-br from-chart-5/10 to-chart-5/5"
                  }`}
                >
                  <CardContent className="flex flex-col items-center gap-4 pt-6">
                    <div className="relative">
                      <Avatar className="h-20 w-20">
                        <AvatarFallback className="text-2xl font-bold">
                          {user.display_name.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div
                        className={`absolute -right-2 -top-2 flex h-10 w-10 items-center justify-center rounded-full ${
                          index === 0
                            ? "bg-chart-4 text-chart-4-foreground"
                            : index === 1
                              ? "bg-muted-foreground text-background"
                              : "bg-chart-5 text-chart-5-foreground"
                        }`}
                      >
                        {index === 0 ? (
                          <Crown className="h-5 w-5" />
                        ) : index === 1 ? (
                          <Medal className="h-5 w-5" />
                        ) : (
                          <Award className="h-5 w-5" />
                        )}
                      </div>
                    </div>
                    <div className="text-center">
                      <h3 className="font-bold">{user.display_name}</h3>
                      <p className="text-sm text-muted-foreground">@{user.username}</p>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold">{user.total_points}</div>
                      <div className="text-sm text-muted-foreground">puan</div>
                    </div>
                    <Badge
                      variant="outline"
                      className={
                        index === 0
                          ? "bg-chart-4/10 text-chart-4"
                          : index === 1
                            ? "bg-muted-foreground/10 text-muted-foreground"
                            : "bg-chart-5/10 text-chart-5"
                      }
                    >
                      #{index + 1}
                    </Badge>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Rest of the list */}
            {users.length > 3 && (
              <Card>
                <CardHeader>
                  <CardTitle>Tüm Kullanıcılar</CardTitle>
                  <CardDescription>Puana göre sıralanmış kullanıcı listesi</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {users.slice(3).map((user, index) => (
                      <div
                        key={user.id}
                        className="flex items-center justify-between rounded-lg border border-border bg-muted/30 p-4"
                      >
                        <div className="flex items-center gap-4">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted font-bold">
                            #{index + 4}
                          </div>
                          <Avatar>
                            <AvatarFallback>{user.display_name.substring(0, 2).toUpperCase()}</AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">{user.display_name}</div>
                            <div className="text-sm text-muted-foreground">@{user.username}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-xl font-bold">{user.total_points}</div>
                          <div className="text-xs text-muted-foreground">puan</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </TabsContent>

      <TabsContent value="badges" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Tüm Rozetler</CardTitle>
            <CardDescription>Belirli puanlara ulaşarak kazanabileceğin rozetler</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {badges.map((badge) => (
                <Card key={badge.id} className="border-primary/20">
                  <CardContent className="flex flex-col items-center gap-3 pt-6">
                    <div
                      className="flex h-16 w-16 items-center justify-center rounded-full text-3xl"
                      style={{ backgroundColor: `${badge.color}20` }}
                    >
                      {badge.icon}
                    </div>
                    <div className="text-center">
                      <h3 className="font-bold">{badge.name}</h3>
                      <p className="text-sm text-muted-foreground">{badge.description}</p>
                    </div>
                    <Badge variant="outline" style={{ borderColor: badge.color, color: badge.color }}>
                      {badge.required_points} puan
                    </Badge>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  )
}
export default Leaderboard