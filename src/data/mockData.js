export const MOCK_PRODUCTS = [
  {
    id: "1",
    name: "Aura Gold Pendant",
    category: "Pendant Lights",
    price: 15500,
    description: "A stunning minimalist gold pendant light that adds warmth and elegance to any dining or living area.",
    image: "https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?auto=format&fit=crop&q=80&w=800",
    featured: true,
  },
  {
    id: "2",
    name: "Lumina Chandelier",
    category: "Ceiling Lights",
    price: 45000,
    description: "Modern cinematic chandelier with adjustable arms and soft glowing bulbs. Perfect for a grand entryway.",
    image: "https://images.unsplash.com/photo-1565814329452-e1efa11c5e8d?auto=format&fit=crop&q=80&w=800",
    featured: true,
  },
  {
    id: "3",
    name: "Eclipse Wall Sconce",
    category: "Wall Lights",
    price: 8500,
    description: "Sleek black and gold wall sconce providing indirect ambient lighting for hallways and bedrooms.",
    image: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&q=80&w=800",
    featured: true,
  },
  {
    id: "4",
    name: "Zenith Outdoor Lantern",
    category: "Outdoor Lights",
    price: 12000,
    description: "Weather-resistant outdoor lantern with a warm vintage glow. Ideal for patios and garden pathways.",
    image: "https://images.unsplash.com/photo-1580130080645-8120d938bf8c?auto=format&fit=crop&q=80&w=800",
    featured: false,
  },
  {
    id: "5",
    name: "Nova Drop Light",
    category: "Pendant Lights",
    price: 9800,
    description: "Industrial-chic drop light with exposed filament bulb and matte black finish.",
    image: "https://images.unsplash.com/photo-1540932239986-30128078f3b5?auto=format&fit=crop&q=80&w=800",
    featured: true,
  },
  {
    id: "6",
    name: "Edison Vintage Bulb",
    category: "Decorative Bulbs",
    price: 2500,
    description: "Classic Edison-style filament bulb emitting a rich, warm amber light.",
    image: "https://images.unsplash.com/photo-1493612265052-a1f72d93e112?auto=format&fit=crop&q=80&w=800",
    featured: false,
  },
  {
    id: "7",
    name: "Halo Flush Mount",
    category: "Ceiling Lights",
    price: 18000,
    description: "Ultra-thin LED flush mount ceiling light with a gold trim edge. Excellent for low ceilings.",
    image: "https://images.unsplash.com/photo-1515260268569-9271009adfdb?auto=format&fit=crop&q=80&w=800",
    featured: false,
  },
  {
    id: "8",
    name: "Solstice Wall Lamp",
    category: "Wall Lights",
    price: 11500,
    description: "A geometric wall lamp that casts beautiful light patterns against the wall.",
    image: "https://images.unsplash.com/photo-1524484485831-a92ffc0de03f?auto=format&fit=crop&q=80&w=800",
    featured: false,
  }
];

export const CATEGORIES = [
  "Pendant Lights",
  "Ceiling Lights",
  "Wall Lights",
  "Outdoor Lights",
  "Decorative Bulbs"
];

export function getProducts() {
  const stored = localStorage.getItem('products');
  if (stored) {
    return JSON.parse(stored);
  }
  // Seed with MOCK_PRODUCTS if empty
  localStorage.setItem('products', JSON.stringify(MOCK_PRODUCTS));
  return MOCK_PRODUCTS;
}

export function saveProducts(products) {
  localStorage.setItem('products', JSON.stringify(products));
}
