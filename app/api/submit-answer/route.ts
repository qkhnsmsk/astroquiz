import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

export async function POST(request: NextRequest) {
  try {
    const { userId, questionId, selectedOptionId } = await request.json()

    if (!userId || !questionId || !selectedOptionId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
          },
        },
      }
    )

    // Soruyu ve cevap seçeneklerini al
    const { data: question, error: questionError } = await supabase
      .from("questions")
      .select("*, answer_options(*)")
      .eq("id", questionId)
      .single()

    if (questionError || !question) {
      console.error("[v0] Question fetch error:", questionError)
      return NextResponse.json({ error: "Question not found" }, { status: 404 })
    }

    // Doğru cevabı bul
    const correctOption = question.answer_options?.find((opt: any) => opt.is_correct)
    const isCorrect = selectedOptionId === correctOption?.id
    const pointsEarned = isCorrect ? question.points : 0

    // Cevabı kaydet
    const { error: answerError } = await supabase.from("user_answers").insert({
      user_id: userId,
      question_id: questionId,
      selected_option_id: selectedOptionId,
      is_correct: isCorrect,
      points_earned: pointsEarned,
    })

    if (answerError) {
      console.error("[v0] Answer save error:", answerError)
      return NextResponse.json({ error: "Failed to save answer" }, { status: 500 })
    }

    let newTotalPoints = 0

    // Kullanıcının puanını güncelle
    if (isCorrect) {
      const { data: user } = await supabase.from("users").select("total_points").eq("id", userId).single()

      if (user) {
        newTotalPoints = user.total_points + pointsEarned
        await supabase.from("users").update({ total_points: newTotalPoints }).eq("id", userId)

        // Rozet kontrolü yap
        await checkAndAwardBadges(supabase, userId, newTotalPoints)
      }
    }

    return NextResponse.json({
      success: true,
      isCorrect,
      pointsEarned,
      newTotalPoints,
    })
  } catch (error) {
    console.error("[v0] Error in submit-answer API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

type Badge = {
  id: string
  required_points: number
}

type UserBadge = {
  badge_id: string
}

async function checkAndAwardBadges(
  supabase: any,
  userId: string,
  totalPoints: number
): Promise<void> {
  // Kullanıcının henüz almadığı rozetleri bul
  const { data: badges } = await supabase
    .from("badges")
    .select("*")
    .lte("required_points", totalPoints)
    .order("required_points", { ascending: false })

  if (!badges) return

  // Kullanıcının mevcut rozetlerini al
  const { data: userBadges } = await supabase
    .from("user_badges")
    .select("badge_id")
    .eq("user_id", userId)

  const earnedBadgeIds = new Set(
    (userBadges as UserBadge[] | null)?.map((ub) => ub.badge_id) ?? []
  )

  // Yeni rozetleri ekle
  for (const badge of badges as Badge[]) {
    if (!earnedBadgeIds.has(badge.id)) {
      await supabase.from("user_badges").insert({ user_id: userId, badge_id: badge.id })
    }
  }
}
