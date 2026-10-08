import Image, { type ImageProps } from "next/image";
import { cn } from "@/lib/utils";
import lightLogo from "@/public/logo-light.png";
import darkLogo from "@/public/logo-dark.png";

type ThemeLogoProps = Pick<
  ImageProps,
  "width" | "height" | "className" | "fetchPriority"
> & {
  alt?: string;
};

export function ThemeLogo({
  width = 32,
  height = 32,
  alt = "Ceylon Tour logo",
  className,
  fetchPriority,
}: ThemeLogoProps) {
  // Follow the app's theme class without a client-only render or hydration flash.
  return (
    <>
      <Image
        src={lightLogo}
        alt={alt}
        width={width}
        height={height}
        fetchPriority={fetchPriority}
        className={cn("object-contain", className, "block dark:hidden")}
      />
      <Image
        src={darkLogo}
        alt={alt}
        width={width}
        height={height}
        fetchPriority={fetchPriority}
        className={cn("object-contain", className, "hidden dark:block")}
      />
    </>
  );
}
