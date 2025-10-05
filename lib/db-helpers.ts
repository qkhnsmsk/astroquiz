import { createClient } from "./supabase/server"
import type { User } from "./types"

export async function getCurrentUser(username: string): Promise<User | null> {
  const supabase = await createClient()
  const { data, error } = await supabase.from("users").select("*").eq("username", username).single()

  if (error) return null
  return data
}

export async function createUser(username: string, displayName: string): Promise<User | null> {
  const supabase = await createClient()
  const { data, error } = await supabase.from("users").insert({ username, display_name: displayName }).select().single()

  if (error) return null
  return data
}

export async function getLeaderboard(limit = 10) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .order("total_points", { ascending: false })
    .limit(limit)

  if (error) return []
  return data
}

export async function getUserBadges(userId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("user_badges")
    .select("*, badge:badges(*)")
    .eq("user_id", userId)
    .order("earned_at", { ascending: false })

  if (error) return []
  return data
}

export async function checkAndAwardBadges(userId: string, totalPoints: number) {
  const supabase = await createClient()

  // Kullanıcının henüz almadığı rozetleri bul
  const { data: badges } = await supabase
    .from("badges")
    .select("*")
    .lte("required_points", totalPoints)
    .order("required_points", { ascending: false })

  if (!badges) return

  // Kullanıcının mevcut rozetlerini al
  const { data: userBadges } = await supabase.from("user_badges").select("badge_id").eq("user_id", userId)

  const earnedBadgeIds = new Set(userBadges?.map((ub) => ub.badge_id) || [])

  // Yeni rozetleri ekle
  for (const badge of badges) {
    if (!earnedBadgeIds.has(badge.id)) {
      await supabase.from("user_badges").insert({ user_id: userId, badge_id: badge.id })
    }
  }
}
