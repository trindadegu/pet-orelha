import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@shared/routes";
import { Order, OrderItem } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";

export function useOrders() {
  return useQuery({
    queryKey: [api.orders.list.path],
    queryFn: async () => {
      const res = await fetch(api.orders.list.path);
      if (!res.ok) throw new Error("Failed to fetch orders");
      return await res.json() as Order[];
    },
  });
}

type CreateOrderInput = z.infer<typeof api.orders.create.input>;

export function useCreateOrder() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateOrderInput) => {
      const res = await fetch(api.orders.create.path, {
        method: api.orders.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to create order");
      }
      return await res.json() as Order;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.orders.list.path] });
      toast({
        title: "Pedido realizado!",
        description: "Seu pedido foi recebido com sucesso.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro no pedido",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}
