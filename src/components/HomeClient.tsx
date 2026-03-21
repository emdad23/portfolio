"use client";
import { useState } from "react";
import { Nav } from "@/components/layout/Nav";
import { CommandPalette } from "@/components/layout/CommandPalette";

export function HomeClient() {
  const [paletteOpen, setPaletteOpen] = useState(false);

  return (
    <>
      <Nav onOpenPalette={() => setPaletteOpen(true)} />
      <CommandPalette isOpen={paletteOpen} onClose={() => setPaletteOpen(false)} />
    </>
  );
}
