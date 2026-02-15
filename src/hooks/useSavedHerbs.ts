import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

/**
 * Senior Engineer Note: 
 * This hook manages saved herbs for the authenticated user.
 * The 'herb_id' is stored as TEXT in the database to accommodate both
 * database-generated UUIDs and static demo IDs (e.g., ATB-2025-001).
 */
export function useSavedHerbs() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch all saved herb IDs for the current user
  const { data: savedIds = new Set<string>(), isLoading } = useQuery({
    queryKey: ["saved_herbs_ids", user?.id],
    queryFn: async () => {
      if (!user) return new Set<string>();
      
      const { data, error } = await supabase
        .from("saved_herbs")
        .select("herb_id")
        .eq("user_id", user.id);

      if (error) {
        console.error("Error fetching saved herbs:", error);
        throw error;
      }
      
      return new Set(data.map((item) => item.herb_id));
    },
    enabled: !!user,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const toggleSaveMutation = useMutation({
    mutationFn: async ({ herbId, isSaved }: { herbId: string; isSaved: boolean }) => {
      // 1. Double-check session (Critical for RLS)
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !session?.user) {
        throw new Error("Authentication required to save herbs. Please log in again.");
      }

      const userId = session.user.id;

      if (isSaved) {
        // DELETE operation
        const { error } = await supabase
          .from("saved_herbs")
          .delete()
          .match({ user_id: userId, herb_id: herbId });
        
        if (error) throw error;
        return { herbId, removed: true };
      } else {
        // INSERT operation
        const { error } = await supabase
          .from("saved_herbs")
          .insert({ 
            user_id: userId, 
            herb_id: herbId 
          });

        if (error) {
          // Handle unique constraint violation (code 23505) gracefully
          // This happens if the UI is out of sync but the herb is already saved.
          if (error.code === '23505') {
            return { herbId, removed: false };
          }
          throw error;
        }
        return { herbId, removed: false };
      }
    },
    onMutate: async ({ herbId, isSaved }) => {
      // Optimistic Update
      await queryClient.cancelQueries({ queryKey: ["saved_herbs_ids", user?.id] });
      const previousIds = queryClient.getQueryData<Set<string>>(["saved_herbs_ids", user?.id]);

      queryClient.setQueryData(["saved_herbs_ids", user?.id], (old: Set<string> | undefined) => {
        const newSet = new Set(old || []);
        if (isSaved) {
          newSet.delete(herbId);
        } else {
          newSet.add(herbId);
        }
        return newSet;
      });

      return { previousIds };
    },
    onError: (err, variables, context) => {
      // Rollback optimistic update
      if (context?.previousIds) {
        queryClient.setQueryData(["saved_herbs_ids", user?.id], context.previousIds);
      }
      
      toast({
        title: "Error",
        description: (err as Error).message || "Failed to update saved herbs",
        variant: "destructive",
      });
    },
    onSuccess: (data) => {
      // Provide positive feedback
      toast({
        title: data.removed ? "Removed" : "Saved",
        description: data.removed
          ? "Herb removed from your collection."
          : "Herb saved to your dashboard.",
      });
    },
    onSettled: () => {
      // Ensure sync by refetching
      queryClient.invalidateQueries({ queryKey: ["saved_herbs_ids", user?.id] });
      queryClient.invalidateQueries({ queryKey: ["saved_herbs", user?.id] });
    },
  });

  return {
    savedIds,
    isLoading,
    toggleSave: (herbId: string) => {
      if (!user) {
        toast({
          title: "Login Required",
          description: "Please log in to save herbs to your dashboard.",
          variant: "destructive",
        });
        return;
      }
      const isSaved = savedIds.has(herbId);
      toggleSaveMutation.mutate({ herbId, isSaved });
    },
    isToggling: toggleSaveMutation.isPending,
  };
}
