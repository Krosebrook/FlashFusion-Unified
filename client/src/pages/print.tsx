import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Printer, Package, ShoppingCart, Image, FileText, Shirt } from "lucide-react";

const mockUser = {
  id: "user123",
  name: "John Doe",
  email: "john@example.com",
  plan: "Pro"
};

const printProducts = [
  {
    id: 1,
    name: "Business Cards",
    category: "Marketing",
    price: 29.99,
    minQuantity: 100,
    sizes: ["Standard", "Premium", "Luxury"],
    image: "/api/placeholder/300/200",
    description: "Professional business cards with your brand"
  },
  {
    id: 2,
    name: "T-Shirts",
    category: "Apparel",
    price: 19.99,
    minQuantity: 1,
    sizes: ["S", "M", "L", "XL", "XXL"],
    image: "/api/placeholder/300/200",
    description: "Custom branded t-shirts and apparel"
  },
  {
    id: 3,
    name: "Flyers",
    category: "Marketing",
    price: 39.99,
    minQuantity: 50,
    sizes: ["A4", "A5", "Letter"],
    image: "/api/placeholder/300/200",
    description: "Eye-catching promotional flyers"
  },
  {
    id: 4,
    name: "Banners",
    category: "Display",
    price: 89.99,
    minQuantity: 1,
    sizes: ["2x4 ft", "3x6 ft", "4x8 ft"],
    image: "/api/placeholder/300/200",
    description: "Large format banners for events"
  },
  {
    id: 5,
    name: "Stickers",
    category: "Marketing",
    price: 24.99,
    minQuantity: 25,
    sizes: ["Small", "Medium", "Large"],
    image: "/api/placeholder/300/200",
    description: "Custom branded stickers and labels"
  },
  {
    id: 6,
    name: "Posters",
    category: "Display", 
    price: 49.99,
    minQuantity: 1,
    sizes: ["A3", "A2", "A1"],
    image: "/api/placeholder/300/200",
    description: "High-quality promotional posters"
  }
];

const recentOrders = [
  {
    id: "ORD-001",
    product: "Business Cards",
    quantity: 500,
    status: "Delivered",
    date: "2024-12-15",
    total: 149.99
  },
  {
    id: "ORD-002", 
    product: "T-Shirts",
    quantity: 25,
    status: "In Production",
    date: "2024-12-20",
    total: 499.75
  },
  {
    id: "ORD-003",
    product: "Flyers",
    quantity: 200,
    status: "Shipped",
    date: "2024-12-18",
    total: 79.98
  }
];

export default function Print() {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<number | null>(null);

  const { data: cart } = useQuery({
    queryKey: ['/api/print/cart'],
    queryFn: () => ({
      items: 3,
      total: 245.67
    }),
  });

  const categories = ["All", "Marketing", "Apparel", "Display"];
  
  const filteredProducts = printProducts.filter(product => {
    const matchesCategory = selectedCategory === "All" || product.category === selectedCategory;
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleAddToCart = (productId: number) => {
    console.log(`Adding product ${productId} to cart`);
    // Simulate adding to cart
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Delivered": return "text-green-600 bg-green-100";
      case "Shipped": return "text-blue-600 bg-blue-100";
      case "In Production": return "text-yellow-600 bg-yellow-100";
      default: return "text-slate-600 bg-slate-100";
    }
  };

  return (
    <div className="min-h-screen flex bg-slate-50">
      <Sidebar user={mockUser} />
      
      <div className="lg:pl-64 flex flex-col flex-1">
        <Topbar title="Print Products" />
        
        <main className="flex-1 overflow-y-auto">
          <div className="px-6 py-8">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-2xl font-bold text-slate-900 flex items-center">
                  <Printer className="h-6 w-6 mr-3 text-primary" />
                  Print Products
                </h1>
                <p className="text-slate-600 mt-1">Order custom branded materials for your business</p>
              </div>
              
              <div className="flex items-center space-x-4">
                <Button variant="outline">
                  <Package className="h-4 w-4 mr-2" />
                  Track Orders
                </Button>
                <Button>
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  Cart ({cart?.items || 0})
                </Button>
              </div>
            </div>

            {/* Filters */}
            <Card className="mb-8">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1">
                    <Input
                      placeholder="Search products..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full"
                    />
                  </div>
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger className="w-48">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(category => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
              {/* Products Grid */}
              <div className="lg:col-span-3">
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {filteredProducts.map((product) => (
                    <Card key={product.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                      <div className="aspect-video bg-slate-100 relative">
                        {product.category === "Marketing" && <FileText className="absolute inset-0 m-auto h-12 w-12 text-slate-400" />}
                        {product.category === "Apparel" && <Shirt className="absolute inset-0 m-auto h-12 w-12 text-slate-400" />}
                        {product.category === "Display" && <Image className="absolute inset-0 m-auto h-12 w-12 text-slate-400" />}
                      </div>
                      
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="font-medium text-slate-900">{product.name}</h3>
                          <Badge variant="secondary" className="text-xs">
                            {product.category}
                          </Badge>
                        </div>
                        
                        <p className="text-sm text-slate-600 mb-3">{product.description}</p>
                        
                        <div className="space-y-2 mb-4">
                          <div className="flex justify-between text-sm">
                            <span className="text-slate-500">Starting at</span>
                            <span className="font-medium text-slate-900">${product.price}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-slate-500">Min quantity</span>
                            <span className="text-slate-600">{product.minQuantity}</span>
                          </div>
                        </div>
                        
                        <div className="flex space-x-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="flex-1"
                            onClick={() => setSelectedProduct(product.id)}
                          >
                            Customize
                          </Button>
                          <Button 
                            size="sm" 
                            className="flex-1"
                            onClick={() => handleAddToCart(product.id)}
                          >
                            Add to Cart
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm font-medium text-slate-600">Shopping Cart</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-600">Items</span>
                        <span className="font-medium">{cart?.items || 0}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-600">Subtotal</span>
                        <span className="font-medium">${cart?.total || 0}</span>
                      </div>
                      <Button className="w-full" size="sm">
                        Checkout
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm font-medium text-slate-600">Recent Orders</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {recentOrders.slice(0, 3).map((order) => (
                        <div key={order.id} className="p-3 border border-slate-200 rounded-lg">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-medium text-slate-900">{order.id}</span>
                            <Badge variant="secondary" className={`text-xs ${getStatusColor(order.status)}`}>
                              {order.status}
                            </Badge>
                          </div>
                          <div className="text-xs text-slate-600">
                            {order.product} × {order.quantity}
                          </div>
                          <div className="text-xs text-slate-500 mt-1">
                            {order.date}
                          </div>
                        </div>
                      ))}
                      <Button variant="outline" className="w-full" size="sm">
                        View All Orders
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm font-medium text-slate-600">Need Custom Design?</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-slate-600 mb-3">
                      Our design team can create custom artwork for your products.
                    </p>
                    <Button variant="outline" className="w-full" size="sm">
                      Request Quote
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}