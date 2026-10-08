"use client";

import { ArrowRight, Compass, MapPin, UserCheck } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const steps = [
  {
    number: "01",
    icon: Compass,
    title: "Choose what interests you",
    description:
      "Tell us what you enjoy, from tea country and ancient sites to quiet beaches and village stays.",
    detail: "Find places that suit your kind of trip.",
  },
  {
    number: "02",
    icon: MapPin,
    title: "Find a quieter route",
    description:
      "Compare destinations and crowd levels. When a popular spot is busy, explore a nearby alternative.",
    detail: "Spend more time exploring, less time waiting.",
  },
  {
    number: "03",
    icon: UserCheck,
    title: "Travel with local people",
    description:
      "Discover local guides and village hosts who know the area, and choose stays that care for their surroundings.",
    detail: "Keep more of your travel spending local.",
  },
];

export const HowItWorks = () => {
  const router = useRouter();

  return (
    <section
      id="how-it-works"
      aria-labelledby="how-it-works-title"
      className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 md:px-12 md:py-24"
    >
      <div className="mx-auto mb-10 max-w-2xl text-center">
        <p className="mb-3 text-sm font-medium text-foreground">How it works</p>
        <h2
          id="how-it-works-title"
          className="font-heading text-3xl font-semibold tracking-tight text-foreground sm:text-4xl"
        >
          Plan your trip in three steps
        </h2>
        <p className="mt-4 text-base leading-relaxed text-muted-foreground">
          Find places you’ll enjoy, avoid the busiest times, and get to know Sri
          Lanka through the people who call it home.
        </p>
      </div>

      <ol className="grid list-none grid-cols-1 gap-6 md:grid-cols-3">
        {steps.map(({ number, icon: Icon, title, description, detail }) => (
          <li key={number} className="min-w-0">
            <Card className="h-full ring-border [--card-spacing:--spacing(6)]">
              <CardHeader className="gap-5">
                <div className="flex items-center justify-between">
                  <div className="flex size-10 items-center justify-center rounded-lg bg-muted text-primary">
                    <Icon className="size-5" aria-hidden="true" />
                  </div>
                  <span className="text-sm font-medium tabular-nums text-muted-foreground">
                    Step {number}
                  </span>
                </div>
                <CardTitle>
                  <h3 className="text-xl font-semibold text-card-foreground">
                    {title}
                  </h3>
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-1">
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {description}
                </p>
              </CardContent>
              <CardFooter className="border-border">
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {detail}
                </p>
              </CardFooter>
            </Card>
          </li>
        ))}
      </ol>

      <div className="mt-10 flex justify-center">
        <Button size="lg" onClick={() => router.push("/auth")}>
          Start planning your trip
          <ArrowRight aria-hidden="true" data-icon="inline-end" />
        </Button>
      </div>
    </section>
  );
};
