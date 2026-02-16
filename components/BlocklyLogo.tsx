"use client";

import Image from "next/image";
import { useThemeMode } from "@/components/AppProviders";

interface BlocklyLogoProps {
  size?: number;
}

export function BlocklyLogo({ size = 60 }: BlocklyLogoProps) {
  const { mode } = useThemeMode();
  const logoSrc = mode === "dark" ? "/blockly-dark.svg" : "/blockly-light.svg";

  return <Image src={logoSrc} alt="Blockly Logo" width={size} height={size} priority />;
}
