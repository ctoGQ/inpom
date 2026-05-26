'use client';

import { useState, useEffect, useRef } from 'react';
import { X, Search } from 'lucide-react';

interface Characteristic {
  id: number;
  name: string;
  category: string;
}

interface CharacteristicInput {
  name: string;
  value: string;
}

interface CharacteristicSearchProps {
  value: CharacteristicInput[];
  onChange: (characteristics: CharacteristicInput[]) => void;
}

export function CharacteristicSearch({ value, onChange }: CharacteristicSearchProps) {
  const [search, setSearch] = useState('');
  const [suggestions, setSuggestions] = useState<Characteristic[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedCharacteristic, setSelectedCharacteristic] = useState<Characteristic | null>(null);
  const [characteristicValue, setCharacteristicValue] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout>();

  // Search for characteristics
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (search.length === 0) {
      setSuggestions([]);
      return;
    }

    setLoading(true);
    searchTimeoutRef.current = setTimeout(async () => {
      try {
        const response = await fetch(`/api/shop/characteristics?search=${encodeURIComponent(search)}&limit=10`);
        if (!response.ok) throw new Error('Failed to fetch characteristics');
        const data = await response.json();
        setSuggestions(data.characteristics || []);
        setSelectedIndex(-1);
      } catch (error) {
        console.error('[v0] Error fetching characteristics:', error);
        setSuggestions([]);
      } finally {
        setLoading(false);
      }
    }, 300); // Debounce search

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [search]);

  // Handle keyboard navigation in suggestions
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions || suggestions.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0) {
          selectCharacteristic(suggestions[selectedIndex]);
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        setSelectedIndex(-1);
        break;
    }
  };

  const selectCharacteristic = (char: Characteristic) => {
    setSelectedCharacteristic(char);
    setSearch('');
    setSuggestions([]);
    setShowSuggestions(false);
    setCharacteristicValue('');
  };

  const addCharacteristic = () => {
    if (!selectedCharacteristic || !characteristicValue.trim()) {
      return;
    }

    // Check if characteristic already exists
    const exists = value.some(
      c => c.name.toLowerCase() === selectedCharacteristic.name.toLowerCase()
    );

    if (exists) {
      // Update existing value
      onChange(
        value.map(c =>
          c.name.toLowerCase() === selectedCharacteristic.name.toLowerCase()
            ? { ...c, value: characteristicValue }
            : c
        )
      );
    } else {
      // Add new characteristic
      onChange([
        ...value,
        {
          name: selectedCharacteristic.name,
          value: characteristicValue
        }
      ]);
    }

    setSelectedCharacteristic(null);
    setCharacteristicValue('');
  };

  const removeCharacteristic = (index: number) => {
    onChange(value.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-4">
      {/* Search Input */}
      <div>
        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide block mb-2">
          Пошук характеристики
        </label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Введіть назву характеристики (напр. Розмір, Колір...)"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setShowSuggestions(true);
            }}
            onFocus={() => setShowSuggestions(true)}
            onKeyDown={handleKeyDown}
            className="w-full pl-10 pr-4 py-3 bg-foreground/5 border border-foreground/10 rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-all"
            disabled={loading}
          />

          {/* Suggestions Dropdown */}
          {showSuggestions && suggestions.length > 0 && (
            <div
              ref={suggestionsRef}
              className="absolute top-full left-0 right-0 mt-2 bg-background border border-foreground/10 rounded-xl shadow-lg z-10 max-h-48 overflow-y-auto"
            >
              {suggestions.map((char, index) => (
                <button
                  key={char.id}
                  onClick={() => selectCharacteristic(char)}
                  className={`w-full px-4 py-3 text-left text-sm transition-colors border-b border-foreground/5 last:border-b-0 hover:bg-foreground/5 ${
                    index === selectedIndex ? 'bg-primary/10 text-primary' : 'text-foreground'
                  }`}
                >
                  <div className="font-medium">{char.name}</div>
                  <div className="text-xs text-muted-foreground">{char.category}</div>
                </button>
              ))}
            </div>
          )}
        </div>

        {loading && (
          <p className="text-xs text-muted-foreground mt-2">Пошук...</p>
        )}
      </div>

      {/* Selected Characteristic Input */}
      {selectedCharacteristic && (
        <div className="flex gap-2">
          <input
            type="text"
            placeholder={`Введіть значення для "${selectedCharacteristic.name}"`}
            value={characteristicValue}
            onChange={(e) => setCharacteristicValue(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                addCharacteristic();
              }
            }}
            className="flex-1 px-4 py-3 bg-foreground/5 border border-foreground/10 rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-all"
          />
          <button
            onClick={addCharacteristic}
            disabled={!characteristicValue.trim()}
            className="px-6 py-3 bg-primary text-primary-foreground font-medium rounded-xl hover:shadow-md active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            Додати
          </button>
        </div>
      )}

      {/* Added Characteristics List */}
      {value.length > 0 && (
        <div className="space-y-2">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            Додані характеристики ({value.length})
          </label>
          <div className="space-y-2">
            {value.map((char, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-foreground/5 border border-foreground/10 rounded-xl"
              >
                <div>
                  <p className="font-medium text-foreground text-sm">{char.name}</p>
                  <p className="text-xs text-muted-foreground">{char.value}</p>
                </div>
                <button
                  onClick={() => removeCharacteristic(index)}
                  className="p-1 hover:bg-red-500/20 text-red-500 rounded-lg transition-colors"
                  title="Видалити"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
