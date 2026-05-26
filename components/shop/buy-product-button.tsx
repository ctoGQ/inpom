'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { ShoppingCart, Loader, Check } from 'lucide-react';

interface BuyProductButtonProps {
  productId: number;
  price: number;
  productTitle: string;
  stockQuantity: number;
  sellerId: number;
  currentUserId?: number;
}

export function BuyProductButton({
  productId,
  price,
  productTitle,
  stockQuantity,
  sellerId,
  currentUserId
}: BuyProductButtonProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [quantity, setQuantity] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [purchased, setPurchased] = useState(false);

  const totalPrice = price * quantity;
  const isOwnProduct = currentUserId === sellerId;
  const canBuy = !isOwnProduct && quantity > 0 && quantity <= stockQuantity;

  const handleBuy = async () => {
    if (!currentUserId) {
      toast({
        title: 'Авторизація потрібна',
        description: 'Будь ласка, увійдіть в акаунт для покупки товару',
        variant: 'destructive'
      });
      router.push('/auth/signin');
      return;
    }

    if (isOwnProduct) {
      toast({
        title: 'Помилка',
        description: 'Ви не можете купити власний товар',
        variant: 'destructive'
      });
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/shop/products/buy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId,
          quantity
        })
      });

      const data = await response.json();

      if (!response.ok) {
        toast({
          title: 'Помилка при покупці',
          description: data.error || 'Не вдалось купити товар',
          variant: 'destructive'
        });
        return;
      }

      setPurchased(true);
      toast({
        title: 'Успіх!',
        description: `Товар "${productTitle}" куплено за ${totalPrice} INPOM. Новий баланс: ${data.newBalance} INPOM`
      });

      // Close modal after 2 seconds
      setTimeout(() => {
        setIsOpen(false);
        setPurchased(false);
        setQuantity(1);
      }, 2000);
    } catch (error) {
      console.error('[v0] Error buying product:', error);
      toast({
        title: 'Помилка',
        description: 'Не вдалось купити товар. Спробуйте ще раз',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isOwnProduct) {
    return (
      <Button disabled variant="outline" className="w-full">
        Ваш товар
      </Button>
    );
  }

  if (stockQuantity <= 0) {
    return (
      <Button disabled className="w-full">
        Немає в наявності
      </Button>
    );
  }

  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        className="w-full gap-2"
        size="lg"
      >
        <ShoppingCart className="w-5 h-5" />
        Купити за {totalPrice} INPOM
      </Button>

      {/* Purchase Modal */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end">
          <div className="w-full bg-background rounded-t-2xl p-6 space-y-4 animate-in slide-in-from-bottom">
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-foreground">Купити товар</h3>
              <p className="text-sm text-muted-foreground line-clamp-2">{productTitle}</p>
            </div>

            {purchased ? (
              <div className="p-4 rounded-2xl bg-green-500/10 border border-green-500/30 flex items-center gap-2">
                <Check className="w-5 h-5 text-green-600" />
                <p className="text-sm font-medium text-green-600">Покупка успішна!</p>
              </div>
            ) : (
              <>
                <div className="space-y-2 p-4 rounded-2xl bg-foreground/5 border border-foreground/10">
                  <div className="flex justify-between">
                    <p className="text-sm text-muted-foreground">Ціна за одиницю</p>
                    <p className="text-sm font-semibold text-foreground">{price} INPOM</p>
                  </div>
                  <div className="flex justify-between">
                    <p className="text-sm text-muted-foreground">Кількість</p>
                    <p className="text-sm font-semibold text-foreground">{quantity}</p>
                  </div>
                  <div className="border-t border-foreground/10 pt-2 mt-2 flex justify-between">
                    <p className="text-sm font-semibold text-foreground">Всього</p>
                    <p className="text-lg font-bold text-foreground">{totalPrice} INPOM</p>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2 block">
                    Кількість (макс. {stockQuantity})
                  </label>
                  <Input
                    type="number"
                    min="1"
                    max={stockQuantity}
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, Math.min(stockQuantity, parseInt(e.target.value) || 1)))}
                    disabled={isLoading}
                    className="text-center"
                  />
                </div>

                <div className="flex gap-2 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => setIsOpen(false)}
                    disabled={isLoading}
                    className="flex-1"
                  >
                    Скасувати
                  </Button>
                  <Button
                    onClick={handleBuy}
                    disabled={isLoading || !canBuy}
                    className="flex-1 gap-2"
                  >
                    {isLoading && <Loader className="w-4 h-4 animate-spin" />}
                    {isLoading ? 'Обробка...' : `Купити за ${totalPrice} INPOM`}
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
