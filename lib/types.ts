export type DifficultyLevel = "kolay" | "orta" | "zor"
export type QuestionStatus = "pending" | "approved" | "rejected"

export interface User {
  id: string
  username: string
  display_name: string
  total_points: number
  created_at: string
}

export interface Category {
  id: string
  name: string
  description: string | null
  icon: string | null
}

export interface Question {
  id: string
  user_id: string
  category_id: string | null
  question_text: string
  difficulty: DifficultyLevel
  points: number
  status: QuestionStatus
  moderator_note: string | null
  created_at: string
  approved_at: string | null
  user?: User
  category?: Category
  answer_options?: AnswerOption[]
}

export interface AnswerOption {
  id: string
  question_id: string
  option_text: string
  is_correct: boolean
  option_order: number
}

export interface UserAnswer {
  id: string
  user_id: string
  question_id: string
  selected_option_id: string
  is_correct: boolean
  points_earned: number
  answered_at: string
}

export interface Badge {
  id: string
  name: string
  description: string
  icon: string | null
  required_points: number
  color: string
}

export interface UserBadge {
  id: string
  user_id: string
  badge_id: string
  earned_at: string
  badge?: Badge
}
