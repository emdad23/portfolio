"use client";
import { useState } from "react";
import { Nav } from "@/components/layout/Nav";
import { CommandPalette } from "@/components/layout/CommandPalette";
import type { ContactDetails } from "@/lib/settings";

export function HomeClient({ contact }: { contact: ContactDetails }) {
  const [paletteOpen, setPaletteOpen] = useState(false);

  return (
    <>
      <Nav onOpenPalette={() => setPaletteOpen(true)} />
      <CommandPalette isOpen={paletteOpen} onClose={() => setPaletteOpen(false)} contact={contact} />
    </>
  );
}
