import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl, type errorSchemas } from "@shared/routes";
import { z } from "zod";
import type { InsertTile, Tile } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

export function useTiles() {
  return useQuery({
    queryKey: [api.tiles.list.path],
    queryFn: async () => {
      const res = await fetch(api.tiles.list.path);
      if (!res.ok) throw new Error("Failed to fetch tiles");
      return api.tiles.list.responses[200].parse(await res.json());
    },
  });
}

export function useCreateTile() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: InsertTile) => {
      const validated = api.tiles.create.input.parse(data);
      const res = await fetch(api.tiles.create.path, {
        method: api.tiles.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validated),
      });

      if (!res.ok) {
        const errorData = await res.json();
        // Try to parse as validation error
        try {
          // Check if it's a validation error
          const validationError = z.object({
            message: z.string(),
            field: z.string().optional()
          }).parse(errorData);
          throw new Error(validationError.message);
        } catch (e) {
           throw new Error("Failed to create tile");
        }
      }
      return api.tiles.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.tiles.list.path] });
      toast({
        title: "Success",
        description: "Tile created successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

export function useDeleteTile() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: number) => {
      const url = buildUrl(api.tiles.delete.path, { id });
      const res = await fetch(url, { method: api.tiles.delete.method });
      
      if (!res.ok) {
        if (res.status === 404) throw new Error("Tile not found");
        throw new Error("Failed to delete tile");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.tiles.list.path] });
      toast({
        title: "Deleted",
        description: "Tile removed from dashboard",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}
