import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ExternalLink, FileText } from "lucide-react"
import Link from "next/link"

const gurus = [
  {
    name: "Guru Nanak Dev Ji",
    period: "1469-1539",
    scripture: "Japji Sahib",
    description:
      "The founder of Sikhi, The Lord in Form, Whose divine hymns continue to guide seekers towards the Path of the Saints.",
    ipfsHash: "QmX4fG7h9K2pL8mN3qR5sT6vW9xY1zA2bC3dE4fG5hI6jK",
    contributions: "974 hymns in Guru Granth Sahib",
  },
  {
    name: "Guru Angad Dev Ji",
    period: "1504-1552",
    scripture: "Gurmukhi Script",
    description: "Standardised the Gurmukhi script and expanded the Sikh community. He established wrestling clubs and taught the importance of a healthy lifestyle.",
    ipfsHash: "QmY5gH8i0J3kM4nO6pR7sU8vX0yZ2aB3cD4eF6gH7iJ8kL",
    contributions: "62 hymns in Guru Granth Sahib",
  },
  {
    name: "Guru Amar Das Ji",
    period: "1479-1574",
    scripture: "Anand Sahib",
    description:
      "Established the Manji system, appointing preachers to spread Sikhi and promoting equality through Langar.",
    ipfsHash: "QmZ6hI9j1K4lN5oP7qS8tV9wY1zA3bC4dE5fG6hH8iJ9kM",
    contributions: "907 hymns in Guru Granth Sahib",
  },
  {
    name: "Guru Ram Das Ji",
    period: "1534-1581",
    scripture: "Laavan (Wedding Hymns)",
    description:
      "Founded the city of Ramdaspur, and composed the sacred wedding hymns as a path for two souls to unite and merge back with the One.",
    ipfsHash: "QmA7iJ0k2L5mO6pQ8rT9uW0xZ2aB4cD5eF7gH9iJ0kL1mN",
    contributions: "679 hymns in Guru Granth Sahib",
  },
  {
    name: "Guru Arjan Dev Ji",
    period: "1563-1606",
    scripture: "Sukhmani Sahib",
    description:
      "Compiled Sri Aad Granth Sahib, the divine Word of God revealed through the Gurus and other spiritual leaders from different religions, and built Sri Darbar Sahib (Golden Temple).",
    ipfsHash: "QmB8jK1l3M6nP7qR9sU0vX1yZ3aB5cD6eF8gH0iJ1kL2mO",
    contributions: "2,218 hymns in Guru Granth Sahib",
  },
  {
    name: "Guru Hargobind Ji",
    period: "1595-1644",
    scripture: "Miri Piri Doctrine",
    description:
      "Established the concept of Miri-Piri, balancing spiritual and temporal authority by teaching us advanced weaponary and horse riding. Went against social norms, challenging radical tyrants.",
    ipfsHash: "QmC9kL2m4N7oQ8rS0tV1wX2yZ4aB6cD7eF9gH1iJ2kL3mP",
    contributions: "Warrior-Saint Tradition",
  },
  {
    name: "Guru Har Rai Ji",
    period: "1630-1661",
    scripture: "Healing & Compassion",
    description:
      "Known for His love and compassion of nature, establishing herbal medical centres and maintaining the Army of God.",
    ipfsHash: "QmD0lM3n5O8pR9sT1uW2xY3zA5bC7dE8fG0hI2jK3lM4nQ",
    contributions: "Created Hospitals",
  },
  {
    name: "Guru Har Krishan Ji",
    period: "1656-1664",
    scripture: "Selfless Service",
    description:
      "The youngest Guru who miraculously healed others during the smallpox epidemic, at His own expense, inspiring devotion through compassion.",
    ipfsHash: "QmE1mN4o6P9qS0tU2vX3yZ4aB6cD8eF1gH2iJ3kL4mN5oR",
    contributions: "Embodiment of Compassion and Miracles",
  },
  {
    name: "Guru Tegh Bahadur Ji",
    period: "1621-1675",
    scripture: "Saloks & Hymns",
    description: "Martyred for protecting religious freedom and human rights of another religion.",
    ipfsHash: "QmF2nO5p7Q0rT1uV3wY4zA5bC7dE9fG2hI3jK4lM5nN6oS",
    contributions: "115 hymns in Guru Granth Sahib",
  },
  {
    name: "Guru Gobind Singh Ji",
    period: "1666-1708",
    scripture: "Khalsa",
    description: "Created the Khalsa and declared Sri Guru Granth Sahib Ji as the eternal Guru. Infused the spirit of fearless righteousness into the Sikhs to fight for justice.",
    ipfsHash: "QmG3oP6q8R1sU2vW4xZ5aB6cD8eF0gH3iJ4kL5mN6oO7pT",
    contributions: "Established the Khalsa Panth",
  },
  {
    name: "Guru Granth Sahib Ji",
    period: "1708-Present",
    scripture: "Eternal Living Guru",
    description:
      "The eternal Guru of the Sikhs, containing 1,430 Angs of revelation straight from God. It is the only revelation in the entire planet, written and authenticated by the leaders of the religion themselves. It is written in pure poetry, seperated by music not chapters, enlightening us to connect back to The Divine One.",
    ipfsHash: "QmH4pQ7r9S2tV3wX5yZ6aB7cD9eF1gH4iJ5kL6mN7oO8pU",
    contributions: "5,894 hymns from 6 Gurus, 15 Bhagats (Saints), 11 Bhatts (Poets) and other mystics.",
  },
]

export default function LedgerPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16 space-y-4">
          <h1 className="font-serif text-4xl md:text-5xl font-bold text-foreground">The Panthic Ledger</h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto text-pretty leading-relaxed">
            Starting with the Gurus for blessings, built to preserve Sikh politics
          </p>
        </div>

        {/* Scriptures Grid */}
        <div className="grid md:grid-cols-2 gap-x-16 gap-6">
          {gurus.map((guru, index) => (
            <Card key={index} className="glass-effect border-border/50 gold-glow-hover overflow-hidden">
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <CardTitle className="font-serif text-xl text-foreground mb-2">{guru.name}</CardTitle>
                    <CardDescription className="text-muted-foreground">{guru.period}</CardDescription>
                  </div>
                  <Badge variant="outline" className="border-primary/50 text-primary bg-primary/10">
                    <FileText className="h-3 w-3 mr-1" />
                    {guru.scripture}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground leading-relaxed">{guru.description}</p>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Hash:</span>
                  </div>
                  <code className="block text-xs bg-secondary/50 px-3 py-2 rounded font-mono text-primary break-all">
                    {guru.ipfsHash}
                  </code>
                </div>

                <div className="pt-2">
                  <p className="text-xs text-muted-foreground mb-3">{guru.contributions}</p>
                  <Link href={`/blockchain?hash=${guru.ipfsHash}`}>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full bg-primary text-primary-foreground gold-glow-hover hover:bg-primary/90"
                    >
                      View on Blockchain
                      <ExternalLink className="ml-2 h-3 w-3" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Info Section */}
        <div className="mt-16 glass-effect rounded-xl p-8 text-center">
          <h3 className="font-serif text-2xl font-bold text-foreground mb-4">Verified & Immutable</h3>
          <p className="text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Each event is cryptographically hashed and stored, ensuring authenticity and permanence. The blockchain
            prevents any fraudulence or alteration of history driven by certain agendas.
          </p>
        </div>
      </div>
    </div>
  )
}
