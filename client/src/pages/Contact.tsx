import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { MapPin, Phone, Mail, Clock } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertContactSchema } from "@shared/schema";
import { useMutation } from "@tanstack/react-query";
import { api } from "@shared/routes";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";

type ContactForm = z.infer<typeof insertContactSchema>;

export default function Contact() {
  const { register, handleSubmit, reset, formState: { errors } } = useForm<ContactForm>({
    resolver: zodResolver(insertContactSchema),
  });
  const { toast } = useToast();

  const mutation = useMutation({
    mutationFn: async (data: ContactForm) => {
      const res = await fetch(api.contact.submit.path, {
        method: api.contact.submit.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed");
    },
    onSuccess: () => {
      toast({ title: "Mensagem enviada!", description: "Entraremos em contato em breve." });
      reset();
    }
  });

  return (
    <div className="min-h-screen bg-slate-50 py-12">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h1 className="text-4xl font-display font-bold text-slate-900 mb-4">Fale Conosco</h1>
          <p className="text-slate-600">Estamos aqui para ouvir você e seu pet.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {/* Info Cards */}
          <div className="space-y-4">
            <Card className="rounded-2xl border-none shadow-md">
              <CardContent className="p-6 flex items-start gap-4">
                <MapPin className="text-primary w-6 h-6 mt-1" />
                <div>
                  <h3 className="font-bold text-lg mb-1">Endereço</h3>
                  <p className="text-slate-600 text-sm">Rua dos Pets, 123<br/>Jardim dos Bichos<br/>São Paulo - SP</p>
                </div>
              </CardContent>
            </Card>
            <Card className="rounded-2xl border-none shadow-md">
              <CardContent className="p-6 flex items-start gap-4">
                <Phone className="text-primary w-6 h-6 mt-1" />
                <div>
                  <h3 className="font-bold text-lg mb-1">Telefone</h3>
                  <p className="text-slate-600 text-sm">(11) 99999-9999<br/>(11) 3333-3333</p>
                </div>
              </CardContent>
            </Card>
            <Card className="rounded-2xl border-none shadow-md">
              <CardContent className="p-6 flex items-start gap-4">
                <Clock className="text-primary w-6 h-6 mt-1" />
                <div>
                  <h3 className="font-bold text-lg mb-1">Horário</h3>
                  <p className="text-slate-600 text-sm">Seg - Sex: 08h - 19h<br/>Sáb: 09h - 17h</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Form */}
          <div className="md:col-span-2">
            <Card className="rounded-2xl border-none shadow-lg overflow-hidden">
              <CardContent className="p-8">
                <form onSubmit={handleSubmit((data) => mutation.mutate(data))} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="name">Nome</Label>
                      <Input id="name" {...register("name")} placeholder="Seu nome" className="rounded-xl" />
                      {errors.name && <span className="text-red-500 text-xs">{errors.name.message}</span>}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input id="email" type="email" {...register("email")} placeholder="seu@email.com" className="rounded-xl" />
                      {errors.email && <span className="text-red-500 text-xs">{errors.email.message}</span>}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="message">Mensagem</Label>
                    <Textarea 
                      id="message" 
                      {...register("message")} 
                      placeholder="Como podemos ajudar?" 
                      className="min-h-[150px] rounded-xl" 
                    />
                    {errors.message && <span className="text-red-500 text-xs">{errors.message.message}</span>}
                  </div>
                  <Button type="submit" size="lg" className="rounded-full w-full md:w-auto" disabled={mutation.isPending}>
                    {mutation.isPending ? "Enviando..." : "Enviar Mensagem"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
