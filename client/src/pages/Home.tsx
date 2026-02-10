import { useProducts } from "@/hooks/use-products";
import { ProductCard } from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { ArrowRight, Truck, ShieldCheck, Heart } from "lucide-react";
import { motion } from "framer-motion";

export default function Home() {
  const { data: featuredProducts } = useProducts();

  // Simple animation variants
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-b from-primary/5 to-white py-20 lg:py-32 overflow-hidden">
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 bg-accent/30 rounded-full blur-3xl" />
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div 
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="space-y-6"
            >
              <h1 className="text-5xl lg:text-7xl font-display font-extrabold text-slate-900 dark:text-slate-100 leading-[1.1]">
                Amor em cada <br/>
                <span className="text-primary">detalhe</span>
              </h1>
              <p className="text-lg lg:text-xl text-slate-600 dark:text-slate-400 max-w-lg leading-relaxed">
                Oferecemos os melhores produtos e serviços para o seu pet. De rações premium a banhos relaxantes.
              </p>
              <div className="flex flex-wrap gap-4 pt-4">
                <Link href="/products">
                  <Button size="lg" className="rounded-full text-lg px-8 py-6 shadow-xl shadow-primary/25 hover:shadow-2xl hover:scale-105 transition-all">
                    Ver Produtos
                  </Button>
                </Link>
                <Link href="/services">
                  <Button variant="outline" size="lg" className="rounded-full text-lg px-8 py-6 border-2 hover:bg-slate-50">
                    Agendar Serviço
                  </Button>
                </Link>
              </div>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8 }}
              className="relative hidden lg:block"
            >
              {/* Unsplash image of a happy dog */}
              <img 
                src="https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&q=80&w=800"
                alt="Happy Dog"
                className="rounded-3xl shadow-2xl rotate-3 hover:rotate-0 transition-transform duration-500"
              />
              <div className="absolute -bottom-6 -left-6 bg-white p-6 rounded-2xl shadow-xl max-w-xs animate-bounce delay-700 duration-3000">
                <div className="flex items-center gap-4">
                  <div className="bg-green-100 p-3 rounded-full">
                    <ShieldCheck className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-900">Qualidade Garantida</p>
                    <p className="text-sm text-slate-500">Produtos certificados</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 bg-white dark:bg-background">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="flex flex-col items-center text-center p-6 rounded-2xl bg-slate-50 dark:bg-slate-900 hover:bg-white dark:hover:bg-slate-800 hover:shadow-lg transition-all border border-slate-100 dark:border-slate-800">
              <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-4">
                <Truck className="h-7 w-7" />
              </div>
              <h3 className="text-xl font-bold mb-2">Entrega Rápida</h3>
              <p className="text-slate-600 dark:text-slate-400">Receba seus produtos em casa com rapidez e segurança.</p>
            </div>
            <div className="flex flex-col items-center text-center p-6 rounded-2xl bg-slate-50 dark:bg-slate-900 hover:bg-white dark:hover:bg-slate-800 hover:shadow-lg transition-all border border-slate-100 dark:border-slate-800">
              <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-4">
                <ShieldCheck className="h-7 w-7" />
              </div>
              <h3 className="text-xl font-bold mb-2">Produtos Premium</h3>
              <p className="text-slate-600 dark:text-slate-400">Trabalhamos apenas com as melhores marcas do mercado.</p>
            </div>
            <div className="flex flex-col items-center text-center p-6 rounded-2xl bg-slate-50 dark:bg-slate-900 hover:bg-white dark:hover:bg-slate-800 hover:shadow-lg transition-all border border-slate-100 dark:border-slate-800">
              <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-4">
                <Heart className="h-7 w-7" />
              </div>
              <h3 className="text-xl font-bold mb-2">Cuidado e Carinho</h3>
              <p className="text-slate-600 dark:text-slate-400">Profissionais apaixonados por animais prontos para atender.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-20 bg-slate-50 dark:bg-slate-950">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-end mb-10">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-slate-100 mb-2">Destaques da Loja</h2>
              <p className="text-slate-600 dark:text-slate-400">Os produtos mais amados pelos pets.</p>
            </div>
            <Link href="/products">
              <Button variant="ghost" className="hidden md:flex group">
                Ver todos <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>

          <motion.div 
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {featuredProducts?.slice(0, 4).map((product) => (
              <motion.div key={product.id} variants={item}>
                <ProductCard product={product} />
              </motion.div>
            ))}
            {!featuredProducts && Array(4).fill(0).map((_, i) => (
              <div key={i} className="h-[400px] bg-white rounded-2xl animate-pulse" />
            ))}
          </motion.div>

          <div className="mt-8 text-center md:hidden">
            <Link href="/products">
              <Button variant="outline" className="w-full">Ver todos</Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
