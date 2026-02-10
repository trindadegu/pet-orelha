import { useQuery, useMutation } from "@tanstack/react-query";
import { api } from "@shared/routes";
import { Service, Appointment } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";

export function useServices() {
  return useQuery({
    queryKey: [api.services.list.path],
    queryFn: async () => {
      const res = await fetch(api.services.list.path);
      if (!res.ok) throw new Error("Failed to fetch services");
      return await res.json() as Service[];
    },
  });
}

type BookAppointmentInput = z.infer<typeof api.services.book.input>;

export function useBookService() {
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: BookAppointmentInput) => {
      const res = await fetch(api.services.book.path, {
        method: api.services.book.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to book appointment");
      }
      return await res.json() as Appointment;
    },
    onSuccess: () => {
      toast({
        title: "Agendamento realizado!",
        description: "Entraremos em contato para confirmar.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro no agendamento",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}
