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
          .filter(line => line.trim() && !line.startsWith('#')) // Skip comments and empty lines
          .map(line => {
            // Split by tab, which is the standard ANKI format separator
            const fields = line.split('\t').map(s => s.trim());

            // ANKI format typically has: German word, Article (optional), English translation
            // We'll combine article (if present) with the German word
            const front = fields[1] ? `${fields[1]} ${fields[0]}` : fields[0];
            const back = fields[fields.length - 1]; // Last field is always English translation

            return { front, back };
          })
          .filter(card => card.front && card.back); // Ensure both sides have content

        await apiRequest('POST', '/api/flashcards/upload', { cards });
        await queryClient.invalidateQueries({ queryKey: ['/api/flashcards'] });

        toast({
          title: "Success",
          description: `Uploaded ${cards.length} cards`
        });
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to upload file. Make sure the file follows the ANKI format.",
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