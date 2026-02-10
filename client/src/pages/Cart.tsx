import { useCart } from "@/hooks/use-cart";
import { Button } from "@/components/ui/button";
import { Minus, Plus, Trash2, ArrowRight } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { Link, useLocation } from "wouter";
import { useCreateOrder } from "@/hooks/use-orders";
import { useAuth } from "@/hooks/use-auth";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export default function Cart() {
  const { items, updateQuantity, removeItem, total, clearCart } = useCart();
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const createOrder = useCreateOrder();
  
  const [customerName, setCustomerName] = useState(user?.name || "");

  const handleCheckout = () => {
    if (!customerName.trim()) return;

    createOrder.mutate({
      items: items.map(item => ({
        productId: item.id,
        quantity: item.quantity
      })),
      customerName: customerName,
    }, {
      onSuccess: () => {
        clearCart();
        // Ideally redirect to a success page, but staying here with empty cart state is ok for now
      }
    });
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="text-center space-y-4">
          <div className="w-24 h-24 bg-slate-200 rounded-full flex items-center justify-center mx-auto mb-4">
            <Trash2 className="w-10 h-10 text-slate-400" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900">Seu carrinho está vazio</h2>
          <p className="text-slate-500">Que tal dar uma olhada em nossos produtos?</p>
          <Link href="/products">
            <Button size="lg" className="mt-4 rounded-full">Ver Produtos</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-12">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-display font-bold text-slate-900 mb-8">Carrinho de Compras</h1>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart Items List */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <div key={item.id} className="bg-white p-4 rounded-2xl flex gap-4 items-center shadow-sm border border-slate-100">
                <img 
                  src={item.image} 
                  alt={item.name} 
                  className="w-24 h-24 object-cover rounded-xl bg-slate-100"
                />
                <div className="flex-1">
                  <h3 className="font-bold text-slate-900">{item.name}</h3>
                  <p className="text-primary font-semibold">{formatCurrency(Number(item.price))}</p>
                </div>
                
                <div className="flex items-center gap-3 bg-slate-50 rounded-full p-1">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 rounded-full"
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                  >
                    <Minus className="h-3 w-3" />
                  </Button>
                  <span className="text-sm font-medium w-4 text-center">{item.quantity}</span>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 rounded-full"
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                  >
                    <Plus className="h-3 w-3" />
                  </Button>
                </div>

                <Button 
                  variant="ghost" 
                  size="icon"
                  className="text-red-500 hover:text-red-600 hover:bg-red-50 rounded-full"
                  onClick={() => removeItem(item.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>

          {/* Summary / Checkout */}
          <div className="lg:col-span-1">
            <Card className="rounded-2xl shadow-lg border-none sticky top-24">
              <CardHeader>
                <CardTitle>Resumo do Pedido</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal</span>
                  <span>{formatCurrency(total)}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Frete</span>
                  <span className="text-green-600">Grátis</span>
                </div>
                <Separator />
                <div className="flex justify-between font-bold text-xl text-slate-900">
                  <span>Total</span>
                  <span>{formatCurrency(total)}</span>
                </div>

                {!user && (
                   <div className="grid gap-2 pt-4">
                     <Label htmlFor="guestName">Nome Completo</Label>
                     <Input 
                        id="guestName" 
                        value={customerName} 
                        onChange={(e) => setCustomerName(e.target.value)}
                        placeholder="Digite seu nome para o pedido"
                      />
                   </div>
                )}
              </CardContent>
              <CardFooter>
                <Button 
                  className="w-full rounded-full h-12 text-lg shadow-xl shadow-primary/20" 
                  onClick={handleCheckout}
                  disabled={createOrder.isPending || !customerName}
                >
                  {createOrder.isPending ? "Processando..." : (
                    <>
                      Finalizar Compra <ArrowRight className="ml-2 h-5 w-5" />
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
