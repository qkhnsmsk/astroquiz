"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Rocket, Home, PlusCircle, Shield, Trophy, User } from "lucide-react"
import { cn } from "@/lib/utils"

export function Navigation() {
  const pathname = usePathname()

  const links = [
    { href: "/", label: "Ana Sayfa", icon: Home },
    { href: "/quiz", label: "Quiz Oyna", icon: Rocket },
    { href: "/create", label: "Soru Oluştur", icon: PlusCircle },
    { href: "/leaderboard", label: "Sıralama", icon: Trophy },
    { href: "/moderator", label: "Moderatör", icon: Shield },
    { href: "/profile", label: "Profil", icon: User },
  ]

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-bold text-xl">
          <div className="flex items-center justify-center">
            <img src="/logo.svg" alt="Logo" className="h-12 w-auto" />
          </div>
        </Link>

        <div className="flex items-center gap-2">
          {links.map((link) => {
            const Icon = link.icon
            const isActive = pathname === link.href
            return (
              <Button
                key={link.href}
                variant={isActive ? "default" : "ghost"}
                size="sm"
                asChild
                className={cn("gap-2", isActive && "bg-primary text-primary-foreground")}
              >
                <Link href={link.href}>
                  <Icon className="h-4 w-4" />
                  <span className="hidden md:inline-block">{link.label}</span>
                </Link>
              </Button>
            )
          })}
        </div>
      </div>
    </nav>
  )
}
