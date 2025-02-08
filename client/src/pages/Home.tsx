import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import FileUpload from "@/components/FileUpload";
import CardCreator from "@/components/CardCreator";
import type { Flashcard } from "@shared/schema";

export default function Home() {
  const { data: cards } = useQuery<Flashcard[]>({
    queryKey: ['/api/flashcards']
  });

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Flashcards</h1>
        <FileUpload />
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Create New Card</CardTitle>
            <CardDescription>Add a new flashcard to your deck</CardDescription>
          </CardHeader>
          <CardContent>
            <CardCreator />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Your Cards</CardTitle>
            <CardDescription>All flashcards in your deck</CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[400px] pr-4">
              <div className="space-y-4">
                {cards?.map(card => (
                  <Card key={card.id}>
                    <CardContent className="p-4">
                      <p className="font-medium">{card.front}</p>
                      <p className="text-muted-foreground mt-2">{card.back}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
