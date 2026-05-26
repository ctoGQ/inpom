'use client';

import { useState, useEffect, useRef } from 'react';
import { Search, ChevronRight } from 'lucide-react';

interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string;
}

interface CategorySearchProps {
  value: string;
  categoryName: string;
  onChange: (categoryId: string, categoryName: string) => void;
}

export function CategorySearch({
  value,
  categoryName,
  onChange
}: CategorySearchProps) {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<Category[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Fetch categories
  useEffect(() => {
    const searchCategories = async () => {
      if (!query.trim()) {
        setLoading(true);
        try {
          const response = await fetch(`/api/shop/categories/search?limit=20`);
          if (!response.ok) throw new Error('Failed to fetch categories');
          const data = await response.json();
          setSuggestions(data.categories || []);
        } catch (error) {
          console.error('[v0] Error fetching categories:', error);
          setSuggestions([]);
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(true);
        try {
          const response = await fetch(`/api/shop/categories/search?q=${encodeURIComponent(query)}&limit=20`);
          if (!response.ok) throw new Error('Failed to search categories');
          const data = await response.json();
          setSuggestions(data.categories || []);
        } catch (error) {
          console.error('[v0] Error searching categories:', error);
          setSuggestions([]);
        } finally {
          setLoading(false);
        }
      }
    };

    const debounceTimer = setTimeout(searchCategories, 300);
    return () => clearTimeout(debounceTimer);
  }, [query]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  const handleSelect = (category: Category) => {
    onChange(category.id.toString(), category.name);
    setQuery('');
    setIsOpen(false);
    setSuggestions([]);
  };

  return (
    <div ref={containerRef} className="relative">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
        <input
          ref={inputRef}
          type="text"
          placeholder={categoryName || 'Пошук категорії...'}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          className="w-full pl-10 pr-4 py-3 bg-foreground/5 border border-foreground/10 rounded-2xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-all"
        />
      </div>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-background border border-foreground/10 rounded-2xl shadow-lg z-50 max-h-96 overflow-y-auto">
          {loading ? (
            <div className="p-4 text-center text-muted-foreground">
              Завантаження...
            </div>
          ) : suggestions.length === 0 ? (
            <div className="p-4 text-center text-muted-foreground">
              {query ? 'Категорії не знайдені' : 'Немає категорій'}
            </div>
          ) : (
            <div className="divide-y divide-foreground/10">
              {suggestions.map((category) => (
                <button
                  key={category.id}
                  onClick={() => handleSelect(category)}
                  className="w-full px-4 py-3 text-left hover:bg-foreground/5 transition-colors flex items-center justify-between group"
                >
                  <div>
                    <p className="font-medium text-foreground text-sm">{category.name}</p>
                    {category.description && (
                      <p className="text-xs text-muted-foreground">{category.description}</p>
                    )}
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
