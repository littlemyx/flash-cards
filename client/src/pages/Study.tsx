
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { apiRequest } from "@/lib/queryClient";
import StudyCard from "@/components/StudyCard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useState, useEffect } from "react";
import type { Flashcard } from "@shared/schema";

export default function Study() {
  const { data: dueCards, isLoading } = useQuery<Flashcard[]>({
    queryKey: ['/api/flashcards/due']
  });

  const [currentCardId, setCurrentCardId] = useState<number | null>(null);

  useEffect(() => {
    if (dueCards?.length && !currentCardId) {
      setCurrentCardId(dueCards[0].id);
    }
  }, [dueCards]);

  const reviewMutation = useMutation({
    mutationFn: async ({ id, quality }: { id: number; quality: number }) => {
      await apiRequest('POST', '/api/flashcards/review', { id, quality });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/flashcards/due'] });
      setCurrentCardId(null);
    }
  });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!dueCards?.length) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>All Caught Up!</CardTitle>
          <CardDescription>
            You've reviewed all your due cards. Come back later for more reviews.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const currentCard = dueCards.find(card => card.id === currentCardId);

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-center">Study Session</h1>
      <p className="text-center text-muted-foreground">
        {dueCards.length} cards due for review
      </p>
      
      {currentCard && (
        <StudyCard
          key={currentCard.id}
          card={currentCard}
          onRate={(quality) => reviewMutation.mutate({ id: currentCard.id, quality })}
        />
      )}
    </div>
  );
}
