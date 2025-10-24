"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, ShoppingCart, Zap, Cpu, HardDrive, Monitor } from "lucide-react"

// Laptop product data
const laptops = [
  {
    id: 1,
    name: 'MacBook Pro 16"',
    brand: "Apple",
    price: 2499,
    image: "/macbook-pro-16-inch-laptop-silver.jpg",
    specs: {
      processor: "M3 Pro",
      ram: "32GB",
      storage: "1TB SSD",
      display: '16.2" Liquid Retina XDR',
    },
    inStock: true,
    featured: true,
  },
  {
    id: 2,
    name: "Dell XPS 15",
    brand: "Dell",
    price: 1899,
    image: "/dell-xps-15-laptop-silver.jpg",
    specs: {
      processor: "Intel i9-13900H",
      ram: "32GB",
      storage: "1TB SSD",
      display: '15.6" OLED 4K',
    },
    inStock: true,
    featured: true,
  },
  {
    id: 3,
    name: "ThinkPad X1 Carbon",
    brand: "Lenovo",
    price: 1599,
    image: "/lenovo-thinkpad-x1-carbon-laptop-black.jpg",
    specs: {
      processor: "Intel i7-1365U",
      ram: "16GB",
      storage: "512GB SSD",
      display: '14" WUXGA',
    },
    inStock: true,
    featured: false,
  },
  {
    id: 4,
    name: 'MacBook Air 13"',
    brand: "Apple",
    price: 1299,
    image: "/macbook-air-13-inch-laptop-midnight-blue.jpg",
    specs: {
      processor: "M3",
      ram: "16GB",
      storage: "512GB SSD",
      display: '13.6" Liquid Retina',
    },
    inStock: true,
    featured: false,
  },
  {
    id: 5,
    name: "HP Spectre x360",
    brand: "HP",
    price: 1749,
    image: "/hp-spectre-x360.png",
    specs: {
      processor: "Intel i7-1355U",
      ram: "16GB",
      storage: "1TB SSD",
      display: '13.5" OLED Touch',
    },
    inStock: true,
    featured: false,
  },
  {
    id: 6,
    name: "ASUS ROG Zephyrus",
    brand: "ASUS",
    price: 2299,
    image: "/asus-rog-gaming-laptop-black.jpg",
    specs: {
      processor: "AMD Ryzen 9",
      ram: "32GB",
      storage: "2TB SSD",
      display: '16" QHD 240Hz',
    },
    inStock: false,
    featured: true,
  },
]

export default function StorePage() {
  const [cart, setCart] = useState<typeof laptops>([])
  const router = useRouter()

  const addToCart = (laptop: (typeof laptops)[0]) => {
    setCart([...cart, laptop])
  }

  const goToCheckout = (laptop: (typeof laptops)[0]) => {
    router.push(`/payment`)
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="size-5" />
              </Button>
            </Link>
            <div className="flex items-center gap-2">
              <div className="size-8 rounded-lg bg-primary flex items-center justify-center">
                <Zap className="size-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold">SolPay Store</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="relative bg-transparent">
              <ShoppingCart className="size-4 mr-2" />
              Cart
              {cart.length > 0 && (
                <Badge className="absolute -top-2 -right-2 size-5 flex items-center justify-center p-0 text-xs">
                  {cart.length}
                </Badge>
              )}
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="border-b border-border bg-gradient-to-b from-primary/5 to-transparent">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-3xl">
            <Badge className="mb-4">Premium Laptops</Badge>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4 text-balance">
              Shop High-Performance Laptops
            </h1>
            <p className="text-lg text-muted-foreground text-balance">
              Pay instantly with Solana. Fast checkout, low fees, complete security.
            </p>
          </div>
        </div>
      </section>

      {/* Products Grid */}
      <section className="container mx-auto px-4 py-12">
        {/* Featured Products */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Featured Products</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {laptops
              .filter((laptop) => laptop.featured)
              .map((laptop) => (
                <Card key={laptop.id} className="flex flex-col overflow-hidden group hover:shadow-lg transition-shadow">
                  <div className="relative aspect-[4/3] overflow-hidden bg-muted">
                    <img
                      src={laptop.image || "/placeholder.svg"}
                      alt={laptop.name}
                      className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
                    />
                    {laptop.featured && (
                      <Badge className="absolute top-3 right-3 bg-accent text-accent-foreground">Featured</Badge>
                    )}
                    {!laptop.inStock && (
                      <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
                        <Badge variant="secondary">Out of Stock</Badge>
                      </div>
                    )}
                  </div>
                  <CardHeader>
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <CardTitle className="text-xl">{laptop.name}</CardTitle>
                        <CardDescription>{laptop.brand}</CardDescription>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold">${laptop.price}</div>
                        <div className="text-xs text-muted-foreground">≈ {(laptop.price / 150).toFixed(2)} SOL</div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="flex-1">
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Cpu className="size-4" />
                        <span>{laptop.specs.processor}</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <HardDrive className="size-4" />
                        <span>
                          {laptop.specs.ram} RAM • {laptop.specs.storage}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Monitor className="size-4" />
                        <span>{laptop.specs.display}</span>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex gap-2">
                    <Button
                      variant="outline"
                      className="flex-1 bg-transparent"
                      disabled={!laptop.inStock}
                      onClick={() => addToCart(laptop)}
                    >
                      <ShoppingCart className="size-4 mr-2" />
                      Add to Cart
                    </Button>
                    <Button className="flex-1" disabled={!laptop.inStock} onClick={() => goToCheckout(laptop)}>
                      Buy Now
                    </Button>
                  </CardFooter>
                </Card>
              ))}
          </div>
        </div>

        {/* All Products */}
        <div>
          <h2 className="text-2xl font-bold mb-6">All Products</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {laptops
              .filter((laptop) => !laptop.featured)
              .map((laptop) => (
                <Card key={laptop.id} className="flex flex-col overflow-hidden group hover:shadow-lg transition-shadow">
                  <div className="relative aspect-[4/3] overflow-hidden bg-muted">
                    <img
                      src={laptop.image || "/placeholder.svg"}
                      alt={laptop.name}
                      className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
                    />
                    {!laptop.inStock && (
                      <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
                        <Badge variant="secondary">Out of Stock</Badge>
                      </div>
                    )}
                  </div>
                  <CardHeader>
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <CardTitle className="text-xl">{laptop.name}</CardTitle>
                        <CardDescription>{laptop.brand}</CardDescription>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold">${laptop.price}</div>
                        <div className="text-xs text-muted-foreground">≈ {(laptop.price / 150).toFixed(2)} SOL</div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="flex-1">
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Cpu className="size-4" />
                        <span>{laptop.specs.processor}</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <HardDrive className="size-4" />
                        <span>
                          {laptop.specs.ram} RAM • {laptop.specs.storage}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Monitor className="size-4" />
                        <span>{laptop.specs.display}</span>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex gap-2">
                    <Button
                      variant="outline"
                      className="flex-1 bg-transparent"
                      disabled={!laptop.inStock}
                      onClick={() => addToCart(laptop)}
                    >
                      <ShoppingCart className="size-4 mr-2" />
                      Add to Cart
                    </Button>
                    <Button className="flex-1" disabled={!laptop.inStock} onClick={() => goToCheckout(laptop)}>
                      Buy Now
                    </Button>
                  </CardFooter>
                </Card>
              ))}
          </div>
        </div>
      </section>
    </div>
  )
}
