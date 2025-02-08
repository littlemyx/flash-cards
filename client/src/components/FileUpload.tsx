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
          .filter(line => line.trim())
          .map(line => {
            const [front, back] = line.split(',').map(s => s.trim());
            return { front, back };
          });

        await apiRequest('POST', '/api/flashcards/upload', { cards });
        await queryClient.invalidateQueries({ queryKey: ['/api/flashcards'] });

        toast({
          title: "Success",
          description: `Uploaded ${cards.length} cards`
        });
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to upload file",
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
        accept=".txt,.csv"
        onChange={handleFileUpload}
        className="hidden"
        id="file-upload"
      />
      <label htmlFor="file-upload">
        <Button variant="outline" className="cursor-pointer" asChild>
          <span>
            <Upload className="h-4 w-4 mr-2" />
            Upload Cards
          </span>
        </Button>
      </label>
    </div>
  );
}
