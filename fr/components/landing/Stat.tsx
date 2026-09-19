"use client";

import { useId } from "react";
import { motion } from "motion/react";
import { Compass, MapPin, Users, ShieldCheck, TreePine } from "lucide-react";
import CountUp from "./CountUp";

export function Stat() {
  return (
    <section
      id="impact"
      className="w-full bg-gradient-to-b from-[#001D24] via-[#003440] to-[#001D24] text-white py-24 md:py-32 border-y border-white/10 relative overflow-hidden"
    >
      {/* Background Soft Glow Rings */}
      <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-[500px] h-[500px] bg-[#44A6B5]/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 right-1/4 w-[450px] h-[450px] bg-[#B2D5E2]/15 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-[#B2D5E2] text-xs font-semibold uppercase tracking-wider mb-4">
            <TreePine className="w-3.5 h-3.5 text-[#44A6B5]" />
            <span>Our Sustainable Footprint</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold font-heading text-white tracking-tight drop-shadow-md">
            Empowering Sri Lanka Through Conscious Travel
          </h2>
          <p className="text-slate-200/90 text-base sm:text-lg max-w-2xl mx-auto mt-3.5 font-normal leading-relaxed">
            Every journey planned through Ceylon Tour helps preserve fragile ecosystems and directly supports local rural communities.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 w-full">
          {stats.map((feature, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.5, delay: idx * 0.12 }}
              whileHover={{ y: -8 }}
              className="relative flex flex-col border border-white/15 items-center justify-center bg-white/10 backdrop-blur-xl p-8 sm:p-9 rounded-3xl overflow-hidden shadow-2xl hover:border-[#44A6B5]/60 hover:bg-white/15 transition-all duration-300 group"
            >
              <Grid size={22} />
              <div className={`relative z-20 mb-5 p-3.5 rounded-2xl ${feature.iconStyle} group-hover:scale-110 transition-transform duration-300 shadow-md`}>
                {feature.icon}
              </div>
              <div className="text-3xl sm:text-4xl font-extrabold text-white relative z-20 flex items-center tracking-tight drop-shadow">
                <CountUp
                  from={0}
                  to={feature.value}
                  separator=","
                  direction="up"
                  duration={1.5}
                  className="count-up-text"
                />
                <span className={`font-bold ml-0.5 ${feature.suffixColor}`}>{feature.suffix}</span>
              </div>
              <p className="text-white font-semibold text-base mt-2.5 relative z-20 text-center">
                {feature.title}
              </p>
              <p className="text-slate-200/80 text-sm font-normal relative z-20 text-center mt-1 leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

const stats = [
  {
    title: "Hidden Eco Spots",
    value: 150,
    suffix: "+",
    description: "Curated off-grid locations & secret trails",
    icon: <MapPin className="w-6 h-6" />,
    iconStyle: "bg-[#44A6B5]/25 text-[#44A6B5]",
    suffixColor: "text-[#44A6B5]",
  },
  {
    title: "Certified Local Hosts",
    value: 850,
    suffix: "+",
    description: "Verified guides, artisans & homestays",
    icon: <Users className="w-6 h-6" />,
    iconStyle: "bg-[#B2D5E2]/25 text-[#B2D5E2]",
    suffixColor: "text-[#B2D5E2]",
  },
  {
    title: "Eco Travelers Served",
    value: 45,
    suffix: "k+",
    description: "Memorable journeys across the island",
    icon: <Compass className="w-6 h-6" />,
    iconStyle: "bg-white/20 text-[#44A6B5]",
    suffixColor: "text-[#44A6B5]",
  },
  {
    title: "Zero-Waste Certified",
    value: 100,
    suffix: "%",
    description: "Sustainable plastic-free tour protocols",
    icon: <ShieldCheck className="w-6 h-6" />,
    iconStyle: "bg-emerald-500/25 text-emerald-400",
    suffixColor: "text-emerald-400",
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
    <div className="pointer-events-none absolute left-1/2 top-0 -ml-20 -mt-2 h-full w-full [mask-image:linear-gradient(white,transparent)] opacity-20">
      <div className="absolute inset-0 bg-gradient-to-r [mask-image:radial-gradient(farthest-side_at_top,white,transparent)] from-transparent to-transparent opacity-100">
        <GridPattern
          width={size ?? 20}
          height={size ?? 20}
          x="-12"
          y="4"
          squares={p}
          className="absolute inset-0 h-full w-full"
          strokeClassName="stroke-white/30"
          fillClassName="fill-white/10"
        />
      </div>
    </div>
  );
};

export function GridPattern({
  width,
  height,
  x,
  y,
  squares,
  strokeClassName,
  fillClassName,
  ...props
}: React.ComponentProps<"svg"> & {
  width?: number;
  height?: number;
  x?: string | number;
  y?: string | number;
  squares?: number[][];
  strokeClassName?: string;
  fillClassName?: string;
}) {
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
          <path
            d={`M.5 ${height}V.5H${width}`}
            fill="none"
            strokeWidth="1"
            className={strokeClassName}
          />
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