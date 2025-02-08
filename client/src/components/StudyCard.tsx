import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { Flashcard } from "@shared/schema";

interface StudyCardProps {
  card: Flashcard;
  onRate: (quality: number) => void;
}

export default function StudyCard({ card, onRate }: StudyCardProps) {
  const [showAnswer, setShowAnswer] = useState(false);

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardContent className="p-6 space-y-4">
        <div className="min-h-[200px] flex items-center justify-center text-xl">
          {showAnswer ? card.back : card.front}
        </div>
        
        {!showAnswer ? (
          <Button 
            className="w-full" 
            onClick={() => setShowAnswer(true)}
          >
            Show Answer
          </Button>
        ) : (
          <div className="grid grid-cols-3 gap-2">
            <Button
              variant="outline"
              className="col-span-1"
              onClick={() => onRate(1)}
            >
              Hard
            </Button>
            <Button
              variant="outline"
              className="col-span-1"
              onClick={() => onRate(3)}
            >
              Good
            </Button>
            <Button
              variant="outline"
              className="col-span-1"
              onClick={() => onRate(5)}
            >
              Easy
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
