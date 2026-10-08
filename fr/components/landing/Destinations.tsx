"use client";

import { useState } from "react";
import Image, { StaticImageData } from "next/image";
import { MapPin, Star, Clock, Sparkles, ArrowUpRight, Heart } from "lucide-react";
import { useRouter } from "next/navigation";

import sigiriyaImg from "@/public/poswiecie-sigiriya-459197_1920.jpg";
import mirissaImg from "@/public/tomas-malik-6BQyHtYSb5E-unsplash.jpg";
import ellaImg from "@/public/andrei-alekseev-VVltlbkjMwQ-unsplash.jpg";
import devilsImg from "@/public/samanthaweerasinghe-devils-staircase-5346794_1920.jpg";
import templeImg from "@/public/musthaqsms-temple-204803_1920.jpg";
import palmImg from "@/public/hendrik-cornelissen-svZvPZ54uBI-unsplash.jpg";

interface Destination {
  id: string;
  title: string;
  category: "all" | "highlands" | "heritage" | "coastal" | "wilderness";
  categoryLabel: string;
  location: string;
  image: StaticImageData;
  rating: number;
  reviews: number;
  duration: string;
  price: string;
  tag: string;
  description: string;
}

const destinations: Destination[] = [
  {
    id: "sigiriya",
    title: "Sigiriya Rock Citadel & Forest Sanctuaries",
    category: "heritage",
    categoryLabel: "Ancient Heritage",
    location: "Matale District, Central Province",
    image: sigiriyaImg,
    rating: 4.98,
    reviews: 420,
    duration: "3 Days",
    price: "$290",
    tag: "UNESCO Wonder",
    description: "Scale the ancient 5th-century sky palace, wander royal water gardens, and stay in eco-lodges surrounded by wild peacocks.",
  },
  {
    id: "ella",
    title: "Ella Highlands & Misty Nine Arch Bridge",
    category: "highlands",
    categoryLabel: "Highlands & Tea",
    location: "Badulla, Central Highlands",
    image: ellaImg,
    rating: 4.95,
    reviews: 610,
    duration: "4 Days",
    price: "$340",
    tag: "Iconic Railway",
    description: "Board the world-famous blue train through misty tea plantations, hike Little Adam's Peak, and sip organic hand-plucked tea.",
  },
  {
    id: "mirissa",
    title: "Mirissa Secret Coves & Coral Conservation",
    category: "coastal",
    categoryLabel: "Coastal Sanctuary",
    location: "Southern Coastline",
    image: mirissaImg,
    rating: 4.92,
    reviews: 380,
    duration: "4 Days",
    price: "$310",
    tag: "Marine Reserve",
    description: "Ethical blue whale watching with certified marine biologists, palm-fringed lagoons, and sunset paddleboarding.",
  },
  {
    id: "devils-staircase",
    title: "Devil's Staircase & Ohiya Mountain Treks",
    category: "wilderness",
    categoryLabel: "Wild Wilderness",
    location: "Horton Plains Foothills",
    image: devilsImg,
    rating: 4.97,
    reviews: 215,
    duration: "2 Days",
    price: "$195",
    tag: "Remote Adventure",
    description: "Traverse high-altitude hairpins, cascading Bambarakanda waterfalls, and stay in zero-plastic community trail camps.",
  },
  {
    id: "kandy-temple",
    title: "Sacred Tooth Relic & Royal Botanics",
    category: "heritage",
    categoryLabel: "Ancient Heritage",
    location: "Kandy Sacred City",
    image: templeImg,
    rating: 4.93,
    reviews: 512,
    duration: "2 Days",
    price: "$220",
    tag: "Spiritual Legacy",
    description: "Experience sacred evening drum ceremonies, lakeside artisan workshops, and ancient spice medicine lore.",
  },
  {
    id: "bentota-bay",
    title: "Bentota Lagoon & Turtle Rehabilitation",
    category: "coastal",
    categoryLabel: "Coastal Sanctuary",
    location: "South-West Coast",
    image: palmImg,
    rating: 4.91,
    reviews: 320,
    duration: "3 Days",
    price: "$270",
    tag: "Eco Sanctuaries",
    description: "Mangrove river safaris, sea turtle conservation hatcheries, and sustainable Ayurvedic coastal rejuvenation.",
  },
  {
    id: "belihuloya",
    title: "Belihuloya River Valley & Pine Foothills",
    category: "wilderness",
    categoryLabel: "Quiet Escape",
    location: "Sabaragamuwa Province",
    image: devilsImg,
    rating: 4.96,
    reviews: 185,
    duration: "3 Days",
    price: "$210",
    tag: "Crowd-Free Haven",
    description: "Serene mountain river retreats, natural bathing pools, and authentic village homestays away from the crowds.",
  },
];

const categories = [
  { key: "all", label: "All Destinations" },
  { key: "highlands", label: "Highlands & Tea" },
  { key: "heritage", label: "Ancient Heritage" },
  { key: "coastal", label: "Coastal Sanctuaries" },
  { key: "wilderness", label: "Wilderness & Treks" },
];

export const Destinations = () => {
  const [activeCategory, setActiveCategory] = useState("all");
  const [favorites, setFavorites] = useState<Record<string, boolean>>({});
  const router = useRouter();

  const toggleFavorite = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setFavorites((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const filteredDestinations = destinations.filter(
    (item) => activeCategory === "all" || item.category === activeCategory
  );

  return (
    <section id="destinations" className="py-16 md:py-24 px-4 sm:px-6 md:px-12 max-w-7xl mx-auto w-full">
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-secondary/15 border border-secondary/30 text-foreground text-xs font-semibold uppercase tracking-wider mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Curated Sri Lankan Journeys</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold font-heading text-foreground tracking-tight">
            Handpicked Eco Sanctuaries & Hidden Trails
          </h2>
          <p className="text-muted-foreground text-base sm:text-lg mt-3 font-normal leading-relaxed">
            Travel deep into Sri Lanka’s most breathtaking regions with verified zero-waste protocols and direct community stewardship.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-2">
          {categories.map((cat) => (
            <button
              key={cat.key}
              onClick={() => setActiveCategory(cat.key)}
              className={`text-xs sm:text-sm px-4 py-2 rounded-full font-medium transition-all duration-200 ${
                activeCategory === cat.key
                  ? "bg-primary text-primary-foreground shadow-md"
                  : "bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground border border-border/60"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Destinations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredDestinations.map((dest) => (
          <div
            key={dest.id}
            onClick={() => router.push("/auth")}
            className="group relative flex flex-col rounded-3xl overflow-hidden bg-card border border-border/80 shadow-md hover:shadow-2xl transition-all duration-500 hover:-translate-y-1.5 cursor-pointer"
          >
            {/* Image Container with Vignette */}
            <div className="relative h-64 sm:h-72 w-full overflow-hidden bg-muted">
              <Image
                src={dest.image}
                alt={dest.title}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                className="object-cover object-center group-hover:scale-108 transition-transform duration-700 ease-out"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-overlay/80 via-overlay/25 to-transparent z-10" />

              {/* Floating Badges */}
              <div className="absolute top-4 left-4 right-4 z-20 flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-overlay/50 backdrop-blur-md border border-overlay-foreground/20 text-overlay-foreground text-xs font-medium">
                  {dest.tag}
                </span>

                <button
                  onClick={(e) => toggleFavorite(dest.id, e)}
                  className={`w-9 h-9 rounded-full backdrop-blur-md border flex items-center justify-center transition-all ${
                    favorites[dest.id]
                      ? "bg-destructive/90 border-destructive text-destructive-foreground"
                      : "bg-overlay/40 border-overlay-foreground/20 text-overlay-foreground hover:bg-overlay-foreground/20"
                  }`}
                  aria-label="Save destination"
                >
                  <Heart
                    size={16}
                    className={favorites[dest.id] ? "fill-current text-destructive-foreground" : "text-overlay-foreground"}
                  />
                </button>
              </div>

              {/* Location Badge over Image bottom */}
              <div className="absolute bottom-4 left-4 right-4 z-20 flex items-center justify-between text-overlay-foreground text-xs">
                <div className="flex items-center gap-1.5 drop-shadow">
                  <MapPin className="w-4 h-4 text-primary" />
                  <span className="font-medium">{dest.location}</span>
                </div>
                <div className="flex items-center gap-1 bg-overlay/40 backdrop-blur-md px-2.5 py-1 rounded-full border border-overlay-foreground/10 font-medium">
                  <Star className="w-3.5 h-3.5 fill-warning text-warning" />
                  <span>{dest.rating}</span>
                  <span className="text-overlay-foreground/60">({dest.reviews})</span>
                </div>
              </div>
            </div>

            {/* Content Body */}
            <div className="p-6 flex flex-col flex-grow justify-between gap-4">
              <div>
                <span className="text-xs font-semibold text-foreground uppercase tracking-wider">
                  {dest.categoryLabel}
                </span>
                <h3 className="font-heading text-xl font-bold text-foreground mt-1 group-hover:text-primary transition-colors line-clamp-1">
                  {dest.title}
                </h3>
                <p className="text-muted-foreground text-sm mt-2 font-normal line-clamp-2 leading-relaxed">
                  {dest.description}
                </p>
              </div>

              {/* Card Footer */}
              <div className="pt-4 border-t border-border/60 flex items-center justify-between mt-auto">
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1 font-medium">
                    <Clock className="w-3.5 h-3.5 text-secondary" />
                    {dest.duration}
                  </span>
                  <span>•</span>
                  <span>
                    <strong className="text-foreground text-sm font-bold">{dest.price}</strong> / person
                  </span>
                </div>

                <div className="w-8 h-8 rounded-full bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground flex items-center justify-center transition-all duration-300">
                  <ArrowUpRight size={16} />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
