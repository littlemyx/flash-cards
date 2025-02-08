
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useSpring, animated, to } from "@react-spring/web";
import { useDrag } from "@use-gesture/react";
import { Repeat } from "lucide-react";
import type { Flashcard } from "@shared/schema";

interface StudyCardProps {
  card: Flashcard;
  onRate: (quality: number) => void;
}

export default function StudyCard({ card, onRate }: StudyCardProps) {
  const [showBack, setShowBack] = useState(false);
  const [leaving, setLeaving] = useState(false);

  // Reset state when card changes
  useEffect(() => {
    setShowBack(false);
    setLeaving(false);
    api.start({ x: 0, opacity: 1, scale: 1 });
  }, [card.id]);

  // Cleanup animation state on unmount
  useEffect(() => {
    return () => {
      setLeaving(false);
      api.stop();
    };
  }, []);

  const [{ x, opacity, scale }, api] = useSpring(() => ({ 
    x: 0,
    opacity: 1,
    scale: 1,
    config: { tension: 500, friction: 30 }
  }));

  const bind = useDrag(({ down, movement: [mx], direction: [xDir], velocity: [vx] }) => {
    try {
      if (leaving) return;

      const trigger = Math.abs(vx) > 0.1;
      const dir = xDir < 0 ? -1 : 1;

      if (!down && trigger) {
        setLeaving(true);
        api.start({
          x: dir * 500,
          opacity: 0,
          scale: 0.8,
          immediate: false,
          onRest: () => {
            try {
              onRate(dir < 0 ? 1 : 5);
            } catch (error) {
              console.error("Error during rating:", error);
              setLeaving(false);
              api.start({ x: 0, opacity: 1, scale: 1 });
            }
          },
        });
      } else {
        if (!leaving) {
          const xMove = down ? mx : 0;
          const moveScale = 1 - Math.min(Math.abs(xMove) / 1000, 0.2);
          api.start({
            x: xMove,
            scale: moveScale,
            opacity: 1 - (Math.abs(xMove) / 500),
            immediate: down,
          });
        }
      }
    } catch (error) {
      console.error("Error during drag:", error);
      setLeaving(false);
      api.start({ x: 0, opacity: 1, scale: 1 });
    }
  }, {
    axis: 'x',
    filterTaps: true,
  });

  return (
    <div className="w-full max-w-2xl mx-auto">
      <animated.div
        style={{
          x,
          opacity,
          scale,
          touchAction: 'none',
        }}
        {...bind()}
      >
        <Card 
          className={`
            w-full cursor-grab active:cursor-grabbing transition-all
            ${leaving ? 'pointer-events-none' : ''}
          `}
        >
          <CardContent className="p-6 space-y-4">
            <div className="min-h-[200px] flex flex-col items-center justify-center text-xl">
              <div className="text-center">
                {showBack ? card.back : card.front}
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="mt-4"
                onClick={() => setShowBack(!showBack)}
              >
                <Repeat className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </animated.div>

      <div className="mt-8 text-center text-sm text-muted-foreground">
        <p>Swipe right if you remember, left if you don't</p>
        <p>Click the button to flip the card</p>
      </div>
    </div>
  );
}
