import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { Product } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";

export function useProducts(category?: string) {
  return useQuery({
    queryKey: [api.products.list.path, category],
    queryFn: async () => {
      const url = category 
        ? `${api.products.list.path}?category=${category}`
        : api.products.list.path;
      
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch products");
      return await res.json() as Product[];
    },
  });
}

export function useProduct(id: number) {
  return useQuery({
    queryKey: [api.products.get.path, id],
    queryFn: async () => {
      const url = buildUrl(api.products.get.path, { id });
      const res = await fetch(url);
      if (res.status === 404) return null;
      if (!res.ok) throw new Error("Failed to fetch product");
      return await res.json() as Product;
    },
    enabled: !!id,
  });
}

type CreateProductInput = z.infer<typeof api.products.create.input>;
type UpdateProductInput = z.infer<typeof api.products.update.input>;

export function useCreateProduct() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: CreateProductInput) => {
      const res = await fetch(api.products.create.path, {
        method: api.products.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to create product");
      return await res.json() as Product;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.products.list.path] });
      toast({ title: "Produto criado com sucesso!" });
    },
    onError: (err) => {
      toast({ 
        title: "Erro ao criar produto", 
        description: err.message,
        variant: "destructive" 
      });
    },
  });
}

export function useUpdateProduct() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: UpdateProductInput }) => {
      const url = buildUrl(api.products.update.path, { id });
      const res = await fetch(url, {
        method: api.products.update.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to update product");
      return await res.json() as Product;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.products.list.path] });
      toast({ title: "Produto atualizado com sucesso!" });
    },
    onError: (err) => {
      toast({ 
        title: "Erro ao atualizar produto", 
        description: err.message,
        variant: "destructive" 
      });
    },
  });
}

export function useDeleteProduct() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: number) => {
      const url = buildUrl(api.products.delete.path, { id });
      const res = await fetch(url, { method: api.products.delete.method });
      if (!res.ok) throw new Error("Failed to delete product");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.products.list.path] });
      toast({ title: "Produto removido com sucesso!" });
    },
    onError: (err) => {
      toast({ 
        title: "Erro ao remover produto", 
        description: err.message,
        variant: "destructive" 
      });
    },
  });
}
