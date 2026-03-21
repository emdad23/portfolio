"use client";
import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { commandGroups } from "@/data/nav";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export function CommandPalette({ isOpen, onClose }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const [sel, setSel] = useState(0);

  const allItems = commandGroups.flatMap((g) => g.items);
  const filtered = query
    ? allItems.filter((item) => item.label.toLowerCase().includes(query.toLowerCase()))
    : null;

  const visibleItems = filtered ?? allItems;

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
      setSel(0);
      setQuery("");
    }
  }, [isOpen]);

  const exec = (item: (typeof allItems)[0]) => {
    onClose();
    if (item.external) { window.open(item.href, "_blank"); return; }
    if (item.href.startsWith("mailto:") || item.href.startsWith("tel:")) {
      window.location.href = item.href; return;
    }
    setTimeout(() => {
      const el = document.querySelector(item.href) as HTMLElement;
      if (el) window.scrollTo({ top: el.offsetTop - 70, behavior: "smooth" });
    }, 150);
  };

  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowDown") { e.preventDefault(); setSel((s) => Math.min(s + 1, visibleItems.length - 1)); }
      else if (e.key === "ArrowUp") { e.preventDefault(); setSel((s) => Math.max(s - 1, 0)); }
      else if (e.key === "Enter") { e.preventDefault(); exec(visibleItems[sel]); }
      else if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [isOpen, sel, visibleItems]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[9000] flex items-start justify-center pt-[18vh]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
          style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(8px)" }}
        >
          <motion.div
            className="w-[min(560px,90vw)] bg-white rounded-2xl overflow-hidden shadow-2xl"
            initial={{ y: -10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -10, opacity: 0 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
          >
            {/* Search */}
            <div className="flex items-center gap-3 px-5 py-4 border-b border-border">
              <span className="text-muted">⌘</span>
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => { setQuery(e.target.value); setSel(0); }}
                placeholder="Type a command or search..."
                className="flex-1 border-none outline-none font-sans text-[0.95rem] text-black bg-transparent placeholder:text-muted"
              />
              <button onClick={onClose} className="text-[0.65rem] font-bold text-muted bg-gray px-2 py-1 rounded">ESC</button>
            </div>

            {/* List */}
            <div className="max-h-[360px] overflow-y-auto p-2">
              {filtered ? (
                filtered.length === 0 ? (
                  <p className="text-center text-muted text-sm py-6">No results for &quot;{query}&quot;</p>
                ) : (
                  filtered.map((item, i) => (
                    <button key={item.label} onClick={() => exec(item)}
                      className={`w-full flex items-center justify-between px-3 py-[0.65rem] rounded-lg cursor-none transition-colors ${i === sel ? "bg-gray" : "hover:bg-gray"}`}>
                      <div className="flex items-center gap-3">
                        <div className={`w-7 h-7 rounded-md flex items-center justify-center text-sm border border-border ${i === sel ? "bg-black border-black" : "bg-gray"}`}>{item.emoji}</div>
                        <span className={`text-[0.875rem] ${i === sel ? "font-semibold text-black" : "text-text2"}`}>{item.label}</span>
                      </div>
                      <span className="text-[0.67rem] font-mono text-muted bg-gray px-2 py-0.5 rounded border border-border">{item.shortcut}</span>
                    </button>
                  ))
                )
              ) : (
                commandGroups.map((group) => {
                  let itemOffset = 0;
                  commandGroups.forEach((g, gi) => {
                    if (gi < commandGroups.indexOf(group)) itemOffset += g.items.length;
                  });
                  return (
                    <div key={group.label}>
                      <p className="text-[0.63rem] font-bold text-muted uppercase tracking-[1.5px] px-3 pt-2 pb-1">{group.label}</p>
                      {group.items.map((item, i) => {
                        const idx = itemOffset + i;
                        return (
                          <button key={item.label} onClick={() => exec(item)}
                            className={`w-full flex items-center justify-between px-3 py-[0.65rem] rounded-lg cursor-none transition-colors ${idx === sel ? "bg-gray" : "hover:bg-gray"}`}>
                            <div className="flex items-center gap-3">
                              <div className={`w-7 h-7 rounded-md flex items-center justify-center text-sm border border-border ${idx === sel ? "bg-black border-black" : "bg-gray"}`}>{item.emoji}</div>
                              <span className={`text-[0.875rem] ${idx === sel ? "font-semibold text-black" : "text-text2"}`}>{item.label}</span>
                            </div>
                            <span className="text-[0.67rem] font-mono text-muted bg-gray px-2 py-0.5 rounded border border-border">{item.shortcut}</span>
                          </button>
                        );
                      })}
                    </div>
                  );
                })
              )}
            </div>

            {/* Footer */}
            <div className="flex gap-6 px-5 py-[0.65rem] border-t border-border">
              {[["↑↓","Navigate"],["↵","Select"],["ESC","Close"]].map(([key, label]) => (
                <div key={key} className="flex items-center gap-1 text-[0.67rem] text-muted">
                  <span className="font-mono text-[0.62rem] bg-gray px-1.5 py-0.5 rounded border border-border">{key}</span>
                  {label}
                </div>
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
