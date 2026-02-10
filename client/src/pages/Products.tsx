import { useProducts } from "@/hooks/use-products";
import { ProductCard } from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { useState } from "react";
import { motion } from "framer-motion";

const categories = ["Todos", "Ração", "Brinquedos", "Higiene", "Acessórios"];

export default function Products() {
  const [selectedCategory, setSelectedCategory] = useState("Todos");
  const [search, setSearch] = useState("");
  
  const { data: products, isLoading } = useProducts(
    selectedCategory === "Todos" ? undefined : selectedCategory
  );

  const filteredProducts = products?.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50 py-12">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h1 className="text-4xl font-display font-bold text-slate-900 mb-4">Nossos Produtos</h1>
          <p className="text-slate-600">Encontre tudo que seu pet precisa para ser feliz e saudável.</p>
        </div>

        {/* Filters & Search */}
        <div className="bg-white rounded-2xl p-6 shadow-sm mb-10 border border-slate-100">
          <div className="flex flex-col md:flex-row gap-6 justify-between items-center">
            <div className="flex flex-wrap gap-2 justify-center md:justify-start">
              {categories.map((cat) => (
                <Button
                  key={cat}
                  variant={selectedCategory === cat ? "default" : "outline"}
                  onClick={() => setSelectedCategory(cat)}
                  className={`rounded-full ${selectedCategory === cat ? "shadow-md" : "border-slate-200"}`}
                >
                  {cat}
                </Button>
              ))}
            </div>
            <div className="relative w-full md:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 h-4 w-4" />
              <Input 
                placeholder="Buscar produto..." 
                className="pl-10 rounded-full border-slate-200 focus:ring-primary/20"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {isLoading ? (
            Array(8).fill(0).map((_, i) => (
              <div key={i} className="h-[400px] bg-white rounded-2xl animate-pulse" />
            ))
          ) : (
            filteredProducts?.map((product, idx) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
              >
                <ProductCard product={product} />
              </motion.div>
            ))
          )}
        </div>

        {!isLoading && filteredProducts?.length === 0 && (
          <div className="text-center py-20">
            <h3 className="text-2xl font-bold text-slate-400">Nenhum produto encontrado</h3>
            <p className="text-slate-500 mt-2">Tente mudar os filtros ou a busca.</p>
          </div>
        )}
      </div>
    </div>
  );
}
