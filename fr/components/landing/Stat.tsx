import { useId, type ComponentProps } from "react";
import { MapPin, Users, Compass, ShieldCheck, TreePine } from "lucide-react";

import { motion } from "motion/react";

import CountUp from "./CountUp";

export function Stat() {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-10 md:gap-2 pb-12 pt-0 px-4 sm:px-6 md:px-12 lg:px-12 w-full max-w-7xl mx-auto">

      <div className="col-span-2 lg:col-span-4 max-w-7xl mx-auto px-4 sm:px-6 md:px-12 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-foreground text-xs font-semibold uppercase tracking-wider mb-4">
            <TreePine className="w-3.5 h-3.5 text-primary" />
            <span>Our Sustainable Footprint</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold font-heading text-foreground tracking-tight drop-shadow-md">
            Empowering Sri Lanka Through Conscious Travel
          </h2>
          <p className="text-muted-foreground text-base sm:text-lg max-w-2xl mx-auto mt-3.5 font-normal leading-relaxed">
            Every journey planned through Ceylon Tour helps preserve fragile ecosystems and directly supports local rural communities.
          </p>
        </motion.div>
    </div>

      {stats.map((feature, idx) => (
        <div
          key={idx}
          className="relative flex flex-col border border-border items-center justify-center bg-card p-3 sm:p-6 rounded-3xl overflow-hidden soft-bloom"
        >
          <Grid size={20} />
          <div className="relative z-20 mb-4 text-primary">
            {feature.icon}
          </div>
          <div className="text-3xl font-bold text-foreground relative z-20 flex items-center">
            <CountUp
              from={0}
              to={feature.value}
              separator=","
              direction="up"
              duration={1}
              className="count-up-text"
            />
            {feature.suffix}
          </div>
          <p className="text-muted-foreground mt-2 text-base font-normal relative z-20 text-center">
            {feature.description}
          </p>
        </div>
      ))}
    </div>
  );
}

const stats = [
  {
    title: "Hidden Eco Spots",
    value: 150,
    suffix: "+",
    description: "Curated off-grid locations & secret trails",
    icon: <MapPin className="w-6 h-6" />,
  },
  {
    title: "Certified Local Hosts",
    value: 850,
    suffix: "+",
    description: "Verified guides, artisans & homestays",
    icon: <Users className="w-6 h-6" />,
  },
  {
    title: "Eco Travelers Served",
    value: 45,
    suffix: "k+",
    description: "Memorable journeys across the island",
    icon: <Compass className="w-6 h-6" />,
  },
  {
    title: "Zero-Waste Certified",
    value: 100,
    suffix: "%",
    description: "Sustainable plastic-free tour protocols",
    icon: <ShieldCheck className="w-6 h-6" />,
  },
];

const defaultGridPattern = [
  [7, 1],
  [8, 5],
  [9, 2],
  [10, 4],
  [7, 3],
];

export const Grid = ({
  pattern,
  size,
}: {
  pattern?: number[][];
  size?: number;
}) => {
  const p = pattern ?? defaultGridPattern;
  return (
    <div className="pointer-events-none absolute left-1/2 top-0  -ml-20 -mt-2 h-full w-full [mask-image:linear-gradient(var(--foreground),transparent)]">
      <div className="absolute inset-0 bg-gradient-to-r [mask-image:radial-gradient(farthest-side_at_top,var(--foreground),transparent)] dark:from-muted/20 from-transparent to-transparent dark:to-muted/20 opacity-100">
        <GridPattern
          width={size ?? 20}
          height={size ?? 20}
          x="-12"
          y="4"
          squares={p}
          className="absolute inset-0 h-full w-full"
          strokeClassName="stroke-border"
          fillClassName="fill-border/50"
        />
      </div>
    </div>
  );
};

export function GridPattern({ width, height, x, y, squares, strokeClassName, fillClassName, ...props }: ComponentProps<"svg"> & { width?: number, height?: number, x?: string | number, y?: string | number, squares?: number[][], strokeClassName?: string, fillClassName?: string }) {
  const patternId = useId();

  return (
    <svg aria-hidden="true" {...props}>
      <defs>
        <pattern
          id={patternId}
          width={width}
          height={height}
          patternUnits="userSpaceOnUse"
          x={x}
          y={y}
        >
          <path d={`M.5 ${height}V.5H${width}`} fill="none" strokeWidth="1" className={strokeClassName} />
        </pattern>
      </defs>
      <rect
        width="100%"
        height="100%"
        strokeWidth={0}
        fill={`url(#${patternId})`}
      />
      {squares && (
        <svg x={x} y={y} className="overflow-visible">
          {squares.map(([x, y]: number[], idx: number) => (
            <rect
              strokeWidth="0"
              className={fillClassName}
              key={`${x}-${y}-${idx}`}
              width={Number(width) + 1}
              height={Number(height) + 1}
              x={x * Number(width)}
              y={y * Number(height)}
            />
          ))}
        </svg>
      )}
    </svg>
  );
}
