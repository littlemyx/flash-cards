import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import type { Flashcard } from "@shared/schema";

export default function Stats() {
  const { data: cards } = useQuery<Flashcard[]>({
    queryKey: ['/api/flashcards']
  });

  if (!cards) return null;

  const totalCards = cards.length;
  const dueCards = cards.filter(card => card.nextReview <= new Date()).length;
  const masteredCards = cards.filter(card => card.repetitions >= 4).length;

  const stats = [
    {
      label: "Total Cards",
      value: totalCards,
      progress: 100
    },
    {
      label: "Due for Review",
      value: dueCards,
      progress: (dueCards / totalCards) * 100
    },
    {
      label: "Mastered",
      value: masteredCards,
      progress: (masteredCards / totalCards) * 100
    }
  ];

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Statistics</h1>

      <div className="grid gap-4 md:grid-cols-3">
        {stats.map(stat => (
          <Card key={stat.label}>
            <CardHeader>
              <CardTitle>{stat.value}</CardTitle>
              <CardDescription>{stat.label}</CardDescription>
            </CardHeader>
            <CardContent>
              <Progress value={stat.progress} className="h-2" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
