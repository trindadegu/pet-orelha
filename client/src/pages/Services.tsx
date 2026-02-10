import { useServices, useBookService } from "@/hooks/use-services";
import { Service } from "@shared/schema";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertAppointmentSchema } from "@shared/schema";
import { z } from "zod";
import { formatCurrency } from "@/lib/utils";
import { Calendar as CalendarIcon, Clock } from "lucide-react";
import { useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const bookingSchema = insertAppointmentSchema;
type BookingFormData = z.infer<typeof bookingSchema>;

function BookingForm({ service, onClose }: { service: Service; onClose: () => void }) {
  const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm<BookingFormData>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      serviceId: service.id,
      serviceName: service.name,
      status: "pending",
    }
  });

  const { mutate, isPending } = useBookService();
  const date = watch("date");

  const onSubmit = (data: BookingFormData) => {
    mutate(data, {
      onSuccess: () => onClose()
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-4">
      <div className="grid gap-2">
        <Label htmlFor="customerName">Seu Nome</Label>
        <Input id="customerName" {...register("customerName")} placeholder="João Silva" />
        {errors.customerName && <span className="text-red-500 text-xs">{errors.customerName.message}</span>}
      </div>

      <div className="grid gap-2">
        <Label htmlFor="customerPhone">Telefone</Label>
        <Input id="customerPhone" {...register("customerPhone")} placeholder="(11) 99999-9999" />
        {errors.customerPhone && <span className="text-red-500 text-xs">{errors.customerPhone.message}</span>}
      </div>

      <div className="grid gap-2">
        <Label htmlFor="petName">Nome do Pet</Label>
        <Input id="petName" {...register("petName")} placeholder="Rex" />
        {errors.petName && <span className="text-red-500 text-xs">{errors.petName.message}</span>}
      </div>

      <div className="grid gap-2">
        <Label>Data Preferencial</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant={"outline"}
              className={`w-full justify-start text-left font-normal ${!date && "text-muted-foreground"}`}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {date ? format(new Date(date), "PPP", { locale: ptBR }) : <span>Escolha uma data</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={date ? new Date(date) : undefined}
              onSelect={(d) => d && setValue("date", d)}
              initialFocus
              locale={ptBR}
            />
          </PopoverContent>
        </Popover>
        {errors.date && <span className="text-red-500 text-xs">{errors.date.message}</span>}
      </div>

      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? "Agendando..." : "Confirmar Agendamento"}
      </Button>
    </form>
  );
}

export default function Services() {
  const { data: services, isLoading } = useServices();
  const [openDialogId, setOpenDialogId] = useState<number | null>(null);

  return (
    <div className="min-h-screen bg-slate-50 py-12">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h1 className="text-4xl font-display font-bold text-slate-900 mb-4">Nossos Serviços</h1>
          <p className="text-slate-600">Profissionais dedicados para cuidar do bem-estar do seu melhor amigo.</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {isLoading ? (
             Array(3).fill(0).map((_, i) => (
              <div key={i} className="h-[400px] bg-white rounded-2xl animate-pulse" />
            ))
          ) : (
            services?.map((service) => (
              <div key={service.id} className="bg-white rounded-3xl overflow-hidden shadow-lg border border-slate-100 hover:shadow-2xl transition-all duration-300 group">
                <div className="h-48 overflow-hidden relative">
                   {/* Unsplash image placeholder */}
                  <img 
                    src={service.image} 
                    alt={service.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute top-4 right-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-sm font-bold text-primary shadow-sm">
                    {service.duration} min
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-2xl font-display font-bold text-slate-900 mb-2">{service.name}</h3>
                  <p className="text-slate-600 mb-6 line-clamp-2">{service.description}</p>
                  
                  <div className="flex items-center justify-between mt-auto">
                    <span className="text-2xl font-bold text-primary">
                      {formatCurrency(Number(service.price))}
                    </span>
                    
                    <Dialog open={openDialogId === service.id} onOpenChange={(open) => setOpenDialogId(open ? service.id : null)}>
                      <DialogTrigger asChild>
                        <Button className="rounded-full px-6">Agendar</Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                          <DialogTitle>Agendar {service.name}</DialogTitle>
                          <DialogDescription>
                            Preencha seus dados para solicitar um horário.
                          </DialogDescription>
                        </DialogHeader>
                        <BookingForm service={service} onClose={() => setOpenDialogId(null)} />
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
