"use client";

import { useState, useEffect, useRef } from "react";
import { X, ChevronDown } from "lucide-react";

interface AutocompleteProps {
  suggestions: string[];
  selected: string[];
  onSelect: (item: string) => void;
  onRemove: (item: string) => void;
  placeholder: string;
  label: string;
  icon?: React.ReactNode;
}

export default function Autocomplete({
  suggestions,
  selected,
  onSelect,
  onRemove,
  placeholder,
  label,
  icon,
}: AutocompleteProps) {
  const [input, setInput] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [filtered, setFiltered] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const available = suggestions.filter(
      (s) =>
        !selected.includes(s) && s.toLowerCase().includes(input.toLowerCase()),
    );
    setFiltered(available);
  }, [input, suggestions, selected]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && input.trim()) {
      e.preventDefault();
      onSelect(input.trim());
      setInput("");
    }
  };

  const handleSelect = (item: string) => {
    onSelect(item);
    setInput("");
    setIsOpen(false);
    inputRef.current?.focus();
  };

  return (
    <div ref={containerRef} className="space-y-2">
      <label className="text-sm font-semibold text-foreground block">
        {label}
      </label>

      <div className="relative">
        <div className="relative flex items-center">
          {icon && (
            <span className="absolute left-3 text-muted-foreground">
              {icon}
            </span>
          )}
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              setIsOpen(true);
            }}
            onFocus={() => setIsOpen(true)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className={`w-full px-3 py-2 ${icon ? "pl-10" : ""} border border-border rounded-lg bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent`}
          />
          {(filtered.length > 0 || input) && (
            <ChevronDown
              className={`absolute right-3 h-4 w-4 text-muted-foreground pointer-events-none transition-transform ${
                isOpen ? "rotate-180" : ""
              }`}
            />
          )}
        </div>

        {/* Autocomplete dropdown */}
        {isOpen && filtered.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-card border border-border rounded-lg shadow-lg z-50 max-h-64 overflow-y-auto">
            {filtered.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => handleSelect(item)}
                className="w-full text-left px-3 py-2 hover:bg-accent text-sm text-foreground hover:text-accent-foreground transition-colors first:rounded-t-lg last:rounded-b-lg"
              >
                {item}
              </button>
            ))}
          </div>
        )}

        {/* Create new suggestion */}
        {isOpen && input.trim() && !suggestions.includes(input.trim()) && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-card border border-border rounded-lg shadow-lg z-50">
            <button
              type="button"
              onClick={() => handleSelect(input.trim())}
              className="w-full text-left px-3 py-2 hover:bg-accent text-sm text-foreground hover:text-accent-foreground transition-colors font-medium"
            >
              + Create "{input.trim()}"
            </button>
          </div>
        )}
      </div>

      {/* Selected items */}
      {selected.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selected.map((item) => (
            <div
              key={item}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm"
            >
              <span>{item}</span>
              <button
                type="button"
                onClick={() => onRemove(item)}
                className="inline-flex hover:text-primary/70 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
