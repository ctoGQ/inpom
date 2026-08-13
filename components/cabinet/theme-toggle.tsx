'use client';

import { useEffect, useState } from 'react';
import { useTheme } from 'next-themes';
import { Sun, Moon } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function ThemeToggle() {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();

  // useEffect only runs on client, so now we can safely show the UI
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  const isDark = theme === 'dark';

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-display text-foreground">Тема оформлення</h3>
      
      <div className="flex items-center justify-between p-4 border border-foreground/10 rounded-lg">
        <div className="flex items-center gap-3">
          
          <div>
            <p className="text-sm font-medium text-foreground">
              {isDark ? 'Темна тема' : 'Світла тема'}
            </p>
            <p className="text-xs text-muted-foreground">
              {isDark 
                ? 'Сокращує нагрузку на очі у ночі' 
                : 'Оптимальна для денного використання'}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant={isDark ? 'default' : 'outline'}
            size="sm"
            onClick={() => setTheme('dark')}
            className="w-10 h-10 p-0"
          >
            <Moon className="w-4 h-4" />
          </Button>
          <Button
            variant={!isDark ? 'default' : 'outline'}
            size="sm"
            onClick={() => setTheme('light')}
            className="w-10 h-10 p-0"
          >
            <Sun className="w-4 h-4" />
          </Button>
        </div>
      </div>

     
    </div>
  );
}
