import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Rocket, Brain, Trophy, Star, Users, Sparkles } from "lucide-react"
import StarBackground from "@/components/StarBackground"

export default function HomePage() {
  return (
    <div className="relative min-h-screen overflow-hidden text-white">
  <StarBackground />
  <div className="relative z-10 mx-auto max-w-7xl px-6 py-20 lg:px-12">
      {/* Hero Section */}
      <section className="flex flex-col items-center justify-center gap-10 py-24 text-center">
        <div className="relative flex items-center justify-center">
          <div className="absolute inset-0 -z-10 animate-pulse blur-3xl">
            <div className="h-full w-full rounded-full bg-primary/20" />
          </div>
          <Rocket className="h-24 w-24 md:h-32 md:w-32 animate-float text-primary" />
        </div>

        <div className="max-w-4xl space-y-6">
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-6xl lg:text-7xl">
            Astronomi Bilgini Test Et
          </h1>
          <p className="text-lg text-muted-foreground sm:text-xl lg:text-2xl leading-relaxed">
            🚀 NASA Space Apps Challenge için hazırlanmış interaktif astronomi platformu.  
            Sorular oluştur, cevapla ve evrenin sırlarını keşfet!
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mt-4">
          <Button size="lg" asChild className="gap-2 w-full sm:w-auto text-lg px-8 py-6">
            <Link href="/quiz">
              <Brain className="h-5 w-5" />
              Quiz'e Başla
            </Link>
          </Button>
          <Button
            size="lg"
            variant="outline"
            asChild
            className="gap-2 bg-transparent w-full sm:w-auto text-lg px-8 py-6"
          >
            <Link href="/create">
              <Sparkles className="h-5 w-5" />
              Soru Oluştur
            </Link>
          </Button>
        </div>
      </section>

      {/* Features Section */}
      <section className="grid gap-8 py-24 sm:grid-cols-2 lg:grid-cols-3 xl:gap-12">
        <FeatureCard
          icon={<Brain className="h-8 w-8 text-primary" />}
          title="Sorular Oluştur"
          description="Astronomi bilgini paylaş! Kendi sorularını oluştur ve diğer kullanıcıların öğrenmesine yardımcı ol."
          color="primary"
        />
        <FeatureCard
          icon={<Trophy className="h-8 w-8 text-accent" />}
          title="Puan Kazan"
          description="Soruları doğru cevaplayarak puan kazan. Zor sorular daha fazla puan getirir!"
          color="accent"
        />
        <FeatureCard
          icon={<Star className="h-8 w-8 text-chart-3" />}
          title="Rozet Topla"
          description="Belirli puanlara ulaşarak özel rozetler kazan ve başarılarını sergile."
          color="chart-3"
        />
        <FeatureCard
          icon={<Users className="h-8 w-8 text-chart-4" />}
          title="Moderasyon Sistemi"
          description="Tüm sorular moderatörler tarafından onaylanır, böylece kaliteli içerik garantilenir."
          color="chart-4"
        />
        <FeatureCard
          icon={<Rocket className="h-8 w-8 text-chart-5" />}
          title="Kategoriler"
          description="Gezegenler, yıldızlar, galaksiler ve daha fazlası! Farklı kategorilerde uzmanlaş."
          color="chart-5"
        />
        <FeatureCard
          icon={<Sparkles className="h-8 w-8 text-primary" />}
          title="Liderlik Tablosu"
          description="En yüksek puanlı kullanıcılar arasına gir ve şampiyonluğunu kanıtla!"
          color="primary"
        />
      </section>

      {/* CTA Section */}
      <section className="flex flex-col items-center justify-center gap-8 rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/10 to-accent/10 p-10 sm:p-16 text-center backdrop-blur">
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold">Hemen Başla!</h2>
        <p className="max-w-3xl text-base sm:text-lg lg:text-xl text-muted-foreground">
          Astronomi bilgini test et, yeni şeyler öğren ve topluluğa katkıda bulun.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
          <Button size="lg" asChild className="text-lg px-8 py-6 w-full sm:w-auto">
            <Link href="/quiz">Quiz'e Başla</Link>
          </Button>
          <Button size="lg" variant="secondary" asChild className="text-lg px-8 py-6 w-full sm:w-auto">
            <Link href="/leaderboard">Sıralamayı Gör</Link>
          </Button>
        </div>
      </section>
    </div>
    </div>
  )
}

/* Feature Card Component */
function FeatureCard({
  icon,
  title,
  description,
  color,
}: {
  icon: React.ReactNode
  title: string
  description: string
  color: string
}) {
  return (
    <Card
      className={`border-${color}/30 bg-card/60 backdrop-blur-xl hover:scale-[1.02] hover:shadow-lg transition-all duration-300`}
    >
      <CardHeader>
        <div className={`mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-${color}/15`}>
          {icon}
        </div>
        <CardTitle className="text-xl lg:text-2xl font-semibold">{title}</CardTitle>
        <CardDescription className="text-base leading-relaxed">{description}</CardDescription>
      </CardHeader>
    </Card>
  )
}
