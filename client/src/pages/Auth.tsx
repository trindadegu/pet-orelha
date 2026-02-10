import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/use-auth";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { api } from "@shared/routes";
import { z } from "zod";
import { useLocation } from "wouter";
import { useEffect } from "react";
import { PawPrint } from "lucide-react";

export default function Auth() {
  const { loginMutation, registerMutation, user } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (user) {
      setLocation("/");
    }
  }, [user, setLocation]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4 relative overflow-hidden">
      {/* Decorative blobs */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-accent/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/3" />

      <Card className="w-full max-w-md rounded-3xl shadow-2xl border-none relative z-10">
        <CardHeader className="text-center space-y-4 pb-2">
          <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
            <PawPrint className="w-6 h-6 text-primary" />
          </div>
          <CardTitle className="text-2xl font-display">Bem-vindo ao PetShop</CardTitle>
          <CardDescription>Acesse sua conta para gerenciar pedidos e agendamentos.</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6 rounded-full h-12 bg-slate-100 p-1">
              <TabsTrigger value="login" className="rounded-full text-sm font-medium">Login</TabsTrigger>
              <TabsTrigger value="register" className="rounded-full text-sm font-medium">Cadastro</TabsTrigger>
            </TabsList>
            
            <TabsContent value="login">
              <LoginForm onSubmit={(data) => loginMutation.mutate(data)} isLoading={loginMutation.isPending} />
            </TabsContent>
            
            <TabsContent value="register">
              <RegisterForm onSubmit={(data) => registerMutation.mutate(data)} isLoading={registerMutation.isPending} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}

function LoginForm({ onSubmit, isLoading }: { onSubmit: (data: any) => void; isLoading: boolean }) {
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(api.auth.login.input),
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" type="email" placeholder="seu@email.com" {...register("email")} className="rounded-xl" />
        {errors.email && <span className="text-red-500 text-xs">{errors.email.message as string}</span>}
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Senha</Label>
        <Input id="password" type="password" {...register("password")} className="rounded-xl" />
        {errors.password && <span className="text-red-500 text-xs">{errors.password.message as string}</span>}
      </div>
      <Button type="submit" className="w-full rounded-full h-12 text-base" disabled={isLoading}>
        {isLoading ? "Entrando..." : "Entrar"}
      </Button>
    </form>
  );
}

function RegisterForm({ onSubmit, isLoading }: { onSubmit: (data: any) => void; isLoading: boolean }) {
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(api.auth.register.input),
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="reg-name">Nome</Label>
        <Input id="reg-name" placeholder="Seu Nome" {...register("name")} className="rounded-xl" />
        {errors.name && <span className="text-red-500 text-xs">{errors.name.message as string}</span>}
      </div>
      <div className="space-y-2">
        <Label htmlFor="reg-email">Email</Label>
        <Input id="reg-email" type="email" placeholder="seu@email.com" {...register("email")} className="rounded-xl" />
        {errors.email && <span className="text-red-500 text-xs">{errors.email.message as string}</span>}
      </div>
      <div className="space-y-2">
        <Label htmlFor="reg-password">Senha</Label>
        <Input id="reg-password" type="password" {...register("password")} className="rounded-xl" />
        {errors.password && <span className="text-red-500 text-xs">{errors.password.message as string}</span>}
      </div>
      <div className="space-y-2">
        <Label htmlFor="reg-confirm">Confirmar Senha</Label>
        <Input id="reg-confirm" type="password" {...register("confirmPassword")} className="rounded-xl" />
        {errors.confirmPassword && <span className="text-red-500 text-xs">{errors.confirmPassword.message as string}</span>}
      </div>
      <Button type="submit" className="w-full rounded-full h-12 text-base" disabled={isLoading}>
        {isLoading ? "Criando conta..." : "Criar Conta"}
      </Button>
    </form>
  );
}
