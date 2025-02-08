import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertFlashcardSchema, type InsertFlashcard } from "@shared/schema";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";

export default function CardCreator() {
  const { toast } = useToast();
  const form = useForm<InsertFlashcard>({
    resolver: zodResolver(insertFlashcardSchema),
    defaultValues: {
      front: "",
      back: ""
    }
  });

  async function onSubmit(data: InsertFlashcard) {
    try {
      await apiRequest('POST', '/api/flashcards', data);
      await queryClient.invalidateQueries({ queryKey: ['/api/flashcards'] });
      form.reset();
      toast({
        title: "Success",
        description: "Card created successfully"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create card",
        variant: "destructive"
      });
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="front"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Front</FormLabel>
              <FormControl>
                <Input placeholder="Question or term" {...field} />
              </FormControl>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="back"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Back</FormLabel>
              <FormControl>
                <Input placeholder="Answer or definition" {...field} />
              </FormControl>
            </FormItem>
          )}
        />
        <Button type="submit">Create Card</Button>
      </form>
    </Form>
  );
}
