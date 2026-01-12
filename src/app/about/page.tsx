import { Card, CardContent } from "@/components/ui/card"
import { Shield, Database, Globe, Lock } from "lucide-react"

export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16 space-y-6">
          <div className="inline-block mb-4">
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center gold-glow mx-auto">
              <span className="text-primary text-5xl font-bold">ੴ</span>
            </div>
          </div>
          <h1 className="font-serif text-4xl md:text-5xl font-bold text-foreground">About Sikh Historical Chain</h1>
          <p className="text-xl text-muted-foreground text-pretty leading-relaxed">
            A sacred mission to preserve Sikh politics through blockchain technology
          </p>
        </div>

        {/* Mission Statement */}
        <div className="glass-effect rounded-2xl p-8 md:p-12 mb-12 gold-glow">
          <h2 className="font-serif text-2xl md:text-3xl font-bold text-foreground mb-6 text-center">Our Mission</h2>

          <p className="text-lg text-muted-foreground leading-relaxed mb-6">
            Preserving Sikh heritage and Gurbani purity through decentralised technology. This project begins with
            legacy of our Gurus, as a form of digital seva and to seek their blessings. Later, the archive will expand to include Sikh Shaheeds and political history, representing the union of Miri and Piri — spirituality and sovereignty.
          </p>

          <p className="text-lg text-muted-foreground leading-relaxed mb-6">
            Every great civilisation survives and thrives not only through warriors, but through intellectuals; thinkers, innovators, strategists, and scholars who preserve knowledge, challenge oppression, and build systems that last.
          </p>
          
          <p className="text-lg text-muted-foreground leading-relaxed">
            For the Sikh community, Khalsa Raj isn't just political sovereignty, its intellectual sovereignty too. Without thinkers, historians, engineers, and philosophers rooted in Gurmat (Guru's wisdom), power becomes hollow. We aim to cultivate a community of Sikh scholars and polymaths, using histroy as an impetus, empowering the community to achieve true Khalsa Raj.
          </p>
        </div>

        {/* Sacred Quote */}
        <div className="glass-effect rounded-2xl p-8 md:p-12 mb-12 text-center">
          <div className="space-y-6">
            <p className="font-serif text-2xl md:text-3xl text-primary leading-relaxed">ਸਤਿਨਾਮਕਰਤਾਪੁਰਖੁਨਿਰਭਉਨਿਰਵੈਰੁ</p>
            <p className="text-lg text-muted-foreground italic">Sat Naam Karta Purakh Nirbhau Nirvair</p>
            <p className="text-base text-muted-foreground">
              Truth is His Name, Creative Being Personified, Without Fear, Without Hatred
            </p>
          </div>
        </div>

        {/* Why Blockchain */}
        <div className="mb-12">
          <h2 className="font-serif text-3xl font-bold text-foreground mb-8 text-center">Why Blockchain?</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="glass-effect border-border/50 gold-glow-hover">
              <CardContent className="p-6">
                <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center mb-4">
                  <Lock className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-serif text-xl font-bold text-foreground mb-3">Immutability</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Once recorded on the blockchain, history cannot be altered or tampered with, safeguarding the legacies
                  for eternity.
                </p>
              </CardContent>
            </Card>

            <Card className="glass-effect border-border/50 gold-glow-hover">
              <CardContent className="p-6">
                <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center mb-4">
                  <Database className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-serif text-xl font-bold text-foreground mb-3">Decentralisation</h3>
                <p className="text-muted-foreground leading-relaxed">
                  No single authority controls the archive. The knowledge is distributed across the globe, making it
                  resilient and censorship-resistant.
                </p>
              </CardContent>
            </Card>

            <Card className="glass-effect border-border/50 gold-glow-hover">
              <CardContent className="p-6">
                <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center mb-4">
                  <Shield className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-serif text-xl font-bold text-foreground mb-3">Verification</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Anyone can verify the authenticity of scriptures using cryptographic hashes, guaranteeing trust
                  without third parties.
                </p>
              </CardContent>
            </Card>

            <Card className="glass-effect border-border/50 gold-glow-hover">
              <CardContent className="p-6">
                <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center mb-4">
                  <Globe className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-serif text-xl font-bold text-foreground mb-3">Global Access</h3>
                <p className="text-muted-foreground leading-relaxed">
                  The archive is accessible to anyone, anywhere in the world, breaking down geographical and
                  institutional barriers.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Sikh Sovereignty */}
        <div className="mb-12">
          <h2 className="font-serif text-3xl font-bold text-foreground mb-8 text-center">Sikh Sovereignty</h2>
          <div className="glass-effect rounded-xl p-8">
            <p className="text-lg text-muted-foreground leading-relaxed mb-6">
              This project was born out of the fight for justice. Sikhi has been twisted, diluted, and rewritten
              to serve political interests. It's not just a digital archive, it's resistance in the face of oppression.
              By putting our history on the blockchain, we remove it from the hands of governments and biased historians
              who manipulate narratives. This is a digital revolution, a way for Sikhs to reclaim their voice, protect
              their legacy, and make sure that no one can ever erase or distort the truth again.
            </p>

            <p className="text-lg text-muted-foreground leading-relaxed">
            Sikhs have faced many battles. But the battle today is without bullets and without gunfire and that battle
            is behind closed doors and the battle now is on our history, on our language, on our heritage, on our people and the Panth
            itself. As the archive grows, we will expand to include Sikh Shaheeds (martyrs) and political history. Now Sikhs
            have the capability to share the truth without interference from systems that seek to distort it through manipulation or omission. No longer malleable to external agendas. This is more than just a platform, it is a direct challenge to all the agendas, agencies and governments whom wish to disorientate Sikhi.
          </p>

          </div>
        </div>
      </div>
    </div>
  )
}
