import { useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { InsertFlashcard } from "@shared/schema";

export default function FileUpload() {
  const { toast } = useToast();

  const handleFileUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const content = e.target?.result as string;
        const cards: InsertFlashcard[] = content
          .split('\n')
          .filter(line => line.trim() && !line.startsWith('[')) // Skip metadata/empty lines
          .map(line => {
            // Split by tab and trim each field
            const fields = line.split('\t').map(s => s.trim());

            // Skip if we don't have enough fields
            if (fields.length < 4) return null;

            // Extract German word/phrase and English translation
            const germanWord = fields[1]; // e.g., "die Ansage, -n"
            const englishTranslation = fields[3]; // e.g., "announcement"

            if (!germanWord || !englishTranslation) return null;

            return {
              front: germanWord,
              back: englishTranslation
            };
          })
          .filter((card): card is InsertFlashcard => card !== null);

        if (cards.length === 0) {
          throw new Error("No valid cards found in the file");
        }

        await apiRequest('POST', '/api/flashcards/upload', { cards });
        await queryClient.invalidateQueries({ queryKey: ['/api/flashcards'] });

        toast({
          title: "Success",
          description: `Uploaded ${cards.length} cards`
        });
      } catch (error) {
        toast({
          title: "Error",
          description: error instanceof Error ? error.message : "Failed to upload file. Make sure the file follows the ANKI format.",
          variant: "destructive"
        });
      }
    };

    reader.readAsText(file);
  }, [toast]);

  return (
    <div className="flex items-center space-x-2">
      <input
        type="file"
        accept=".txt,.csv,.tsv"
        onChange={handleFileUpload}
        className="hidden"
        id="file-upload"
      />
      <label htmlFor="file-upload">
        <Button variant="outline" className="cursor-pointer" asChild>
          <span>
            <Upload className="h-4 w-4 mr-2" />
            Upload ANKI Cards
          </span>
        </Button>
      </label>
    </div>
  );
}