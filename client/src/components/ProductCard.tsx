import { Product } from "@shared/schema";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart } from "lucide-react";
import { useCart } from "@/hooks/use-cart";
import { formatCurrency } from "@/lib/utils";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useCart();

  return (
    <Card className="group overflow-hidden border-none shadow-md hover:shadow-xl transition-all duration-300 rounded-2xl bg-white">
      <div className="relative aspect-square overflow-hidden bg-slate-50">
        <Badge className="absolute top-3 left-3 z-10 bg-white/90 text-primary backdrop-blur-sm shadow-sm hover:bg-white">
          {product.category}
        </Badge>
        <img
          src={product.image}
          alt={product.name}
          className="h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-110"
        />
      </div>
      <CardContent className="p-5">
        <h3 className="font-display font-bold text-lg text-slate-900 line-clamp-1 mb-1">
          {product.name}
        </h3>
        <p className="text-sm text-slate-500 line-clamp-2 min-h-[2.5rem]">
          {product.description}
        </p>
      </CardContent>
      <CardFooter className="p-5 pt-0 flex items-center justify-between">
        <span className="text-xl font-bold text-primary">
          {formatCurrency(Number(product.price))}
        </span>
        <Button 
          size="sm" 
          onClick={() => addItem(product)}
          className="rounded-full px-4 shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all"
        >
          <ShoppingCart className="mr-2 h-4 w-4" />
          Adicionar
        </Button>
      </CardFooter>
    </Card>
  );
}
