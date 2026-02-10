import { useAuth } from "@/hooks/use-auth";
import { useProducts, useCreateProduct, useDeleteProduct, useUpdateProduct } from "@/hooks/use-products";
import { useOrders } from "@/hooks/use-orders";
import { useLocation } from "wouter";
import { useEffect, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogTrigger, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { formatCurrency } from "@/lib/utils";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertProductSchema } from "@shared/schema";
import { Trash2, Plus, Package, Users, ShoppingBag, Edit } from "lucide-react";
import { Product } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

export default function Admin() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (user && user.role !== 'admin') {
      setLocation("/");
    } else if (!user) {
      setLocation("/auth");
    }
  }, [user, setLocation]);

  if (!user || user.role !== 'admin') return null;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-background py-12">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-display font-bold text-slate-900 dark:text-slate-100 mb-8">Painel Administrativo</h1>

        <Tabs defaultValue="products" className="space-y-8">
          <TabsList className="bg-white dark:bg-slate-900 p-1 rounded-full border border-slate-200 dark:border-slate-800 shadow-sm">
            <TabsTrigger value="products" className="rounded-full px-6">Produtos</TabsTrigger>
            <TabsTrigger value="orders" className="rounded-full px-6">Pedidos</TabsTrigger>
          </TabsList>

          <TabsContent value="products">
            <ProductsManager />
          </TabsContent>

          <TabsContent value="orders">
            <OrdersManager />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

function ProductsManager() {
  const { data: products } = useProducts();
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();
  const deleteProduct = useDeleteProduct();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const form = useForm({
    resolver: zodResolver(insertProductSchema),
    defaultValues: {
      name: "",
      description: "",
      price: 0,
      category: "Acessórios",
      image: "https://images.unsplash.com/photo-1576201836106-db1758fd1c97?auto=format&fit=crop&q=80&w=400",
      stock: 10
    }
  });

  useEffect(() => {
    if (editingProduct) {
      form.reset({
        name: editingProduct.name,
        description: editingProduct.description,
        price: Number(editingProduct.price),
        category: editingProduct.category,
        image: editingProduct.image,
        stock: editingProduct.stock
      });
    } else {
      form.reset({
        name: "",
        description: "",
        price: 0,
        category: "Acessórios",
        image: "https://images.unsplash.com/photo-1576201836106-db1758fd1c97?auto=format&fit=crop&q=80&w=400",
        stock: 10
      });
    }
  }, [editingProduct, form]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        form.setValue("image", reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = (data: any) => {
    if (editingProduct) {
      updateProduct.mutate({ id: editingProduct.id, ...data, price: Number(data.price) }, {
        onSuccess: () => {
          setIsDialogOpen(false);
          setEditingProduct(null);
          form.reset();
        }
      });
    } else {
      createProduct.mutate({ ...data, price: Number(data.price) }, {
        onSuccess: () => {
          setIsDialogOpen(false);
          form.reset();
        }
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Gerenciar Produtos</h2>
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) setEditingProduct(null);
        }}>
          <DialogTrigger asChild>
            <Button className="rounded-full gap-2" onClick={() => setEditingProduct(null)}>
              <Plus className="w-4 h-4" /> Novo Produto
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>{editingProduct ? "Editar Produto" : "Adicionar Produto"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
              <div className="grid gap-2">
                <Label>Nome</Label>
                <Input {...form.register("name")} />
                {form.formState.errors.name && <span className="text-red-500 text-xs">{form.formState.errors.name.message as string}</span>}
              </div>
              <div className="grid gap-2">
                <Label>Descrição</Label>
                <Input {...form.register("description")} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Preço</Label>
                  <Input type="number" step="0.01" {...form.register("price", { valueAsNumber: true })} />
                </div>
                <div className="grid gap-2">
                  <Label>Estoque</Label>
                  <Input type="number" {...form.register("stock", { valueAsNumber: true })} />
                </div>
              </div>
              <div className="grid gap-2">
                <Label>Categoria</Label>
                <Input {...form.register("category")} placeholder="Ração, Brinquedos, etc" />
              </div>
              <div className="grid gap-2">
                <Label>Imagem do Produto</Label>
                <div className="flex flex-col gap-4">
                  <div className="flex gap-2">
                    <Input 
                      type="file" 
                      accept="image/*" 
                      onChange={handleImageUpload}
                      className="cursor-pointer"
                    />
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      <Label className="text-xs text-muted-foreground mb-1 block">Ou use uma URL externa</Label>
                      <Input {...form.register("image")} placeholder="https://..." />
                    </div>
                    {form.watch("image") && (
                      <div className="h-16 w-16 rounded-lg border overflow-hidden bg-slate-100 dark:bg-slate-800 flex-shrink-0">
                        <img src={form.watch("image")} alt="Preview" className="h-full w-full object-cover" />
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <Button type="submit" className="w-full" disabled={createProduct.isPending || updateProduct.isPending}>
                {createProduct.isPending || updateProduct.isPending ? "Salvando..." : editingProduct ? "Atualizar Produto" : "Salvar Produto"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Produto</TableHead>
              <TableHead>Categoria</TableHead>
              <TableHead>Preço</TableHead>
              <TableHead>Estoque</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products?.map((product) => (
              <TableRow key={product.id}>
                <TableCell className="font-medium">
                  <div className="flex items-center gap-3">
                    <img src={product.image} alt={product.name} className="h-8 w-8 rounded object-cover" />
                    {product.name}
                  </div>
                </TableCell>
                <TableCell>{product.category}</TableCell>
                <TableCell>{formatCurrency(Number(product.price))}</TableCell>
                <TableCell>{product.stock}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => {
                        setEditingProduct(product);
                        setIsDialogOpen(true);
                      }}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                      onClick={() => {
                        if(confirm("Tem certeza que deseja excluir?")) {
                          deleteProduct.mutate(product.id);
                        }
                      }}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

function OrdersManager() {
  const { data: orders } = useOrders();

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Cliente</TableHead>
            <TableHead>Data</TableHead>
            <TableHead>Total</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders?.map((order) => (
            <TableRow key={order.id}>
              <TableCell>#{order.id}</TableCell>
              <TableCell>{order.customerName}</TableCell>
              <TableCell>{new Date(order.createdAt!).toLocaleDateString()}</TableCell>
              <TableCell>{formatCurrency(Number(order.total))}</TableCell>
              <TableCell>
                <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                  order.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                }`}>
                  {order.status}
                </span>
              </TableCell>
            </TableRow>
          ))}
          {orders?.length === 0 && (
            <TableRow>
              <TableCell colSpan={5} className="text-center py-8 text-slate-500">
                Nenhum pedido encontrado.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
