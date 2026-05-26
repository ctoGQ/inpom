'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  RadioGroup,
  RadioGroupItem,
} from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { Heart, Share2, Star, ShoppingCart, User, Calendar, Check } from 'lucide-react';

interface Product {
  id: number;
  title: string;
  description: string;
  price: string | number;
  original_price?: string | number;
  currency: string;
  stock_quantity: number;
  rating: number;
  review_count: number;
  view_count: number;
  sale_count: number;
  category_name: string;
  seller_name: string;
  seller_id: number;
  seller_avatar?: string;
  seller_rating: number;
  seller_total_sales: number;
  images: Array<{
    id: number;
    image_url: string;
    alt_text?: string;
    is_primary: boolean;
  }>;
  attributes: Array<{
    id: number;
    attribute_name: string;
    attribute_value: string;
  }>;
}

interface Review {
  id: number;
  rating: number;
  title: string;
  comment: string;
  reviewer_name: string;
  created_at: string;
  helpful_count: number;
}

const formatDate = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('uk-UA');
  } catch {
    return dateString;
  }
};

export default function ProductDetailPage() {
  const params = useParams();
  const slug = params.id as string;
  const { toast } = useToast();

  const [product, setProduct] = useState<Product | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [mainImageIndex, setMainImageIndex] = useState(0);
  const [inWishlist, setInWishlist] = useState(false);
  const [isWritingReview, setIsWritingReview] = useState(false);
  const [reviewRating, setReviewRating] = useState('5');
  const [reviewTitle, setReviewTitle] = useState('');
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  // Fetch product details
  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/shop/products/detail/${slug}`);
        if (res.ok) {
          const data = await res.json();
          setProduct(data);
          // Fetch reviews
          const reviewRes = await fetch(`/api/shop/reviews?productId=${data.id}`);
          if (reviewRes.ok) {
            const reviewData = await reviewRes.json();
            setReviews(reviewData.reviews || []);
          }
        } else {
          toast({
            title: 'Помилка',
            description: 'Не вдалося завантажити товар',
            variant: 'destructive',
          });
        }
      } catch (error) {
        console.error('Error fetching product:', error);
        toast({
          title: 'Помилка',
          description: 'Помилка підключення',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    if (slug) fetchProduct();
  }, [slug, toast]);

  const handleWishlist = async () => {
    try {
      const method = inWishlist ? 'DELETE' : 'POST';
      const res = await fetch('/api/shop/wishlist', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: product?.id }),
      });

      if (res.ok) {
        setInWishlist(!inWishlist);
        toast({
          title: inWishlist ? 'Видалено з списку бажань' : 'Додано в список бажань',
        });
      }
    } catch (error) {
      console.error('Error updating wishlist:', error);
    }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewTitle.trim() || !reviewComment.trim()) {
      toast({
        title: 'Помилка',
        description: 'Заповніть усі поля',
        variant: 'destructive',
      });
      return;
    }

    setSubmittingReview(true);
    try {
      const res = await fetch('/api/shop/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: product?.id,
          rating: parseInt(reviewRating),
          title: reviewTitle,
          comment: reviewComment,
        }),
      });

      if (res.ok) {
        toast({
          title: 'Успіх',
          description: 'Ваш відгук додано',
        });
        setReviewTitle('');
        setReviewComment('');
        setReviewRating('5');
        setIsWritingReview(false);
        // Refresh reviews
        const reviewRes = await fetch(`/api/shop/reviews?productId=${product?.id}`);
        if (reviewRes.ok) {
          const reviewData = await reviewRes.json();
          setReviews(reviewData.reviews || []);
        }
      }
    } catch (error) {
      console.error('Error submitting review:', error);
      toast({
        title: 'Помилка',
        description: 'Не вдалося додати відгук',
        variant: 'destructive',
      });
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleAddToCart = () => {
    toast({
      title: 'В розробці',
      description: 'Функція кошика буде доступна незабаром',
    });
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: product?.title,
          text: product?.description?.substring(0, 100),
          url: window.location.href,
        });
      } catch (error) {
        console.error('Share failed:', error);
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      toast({
        title: 'Скопійовано',
        description: 'Посилання на товар скопійовано',
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 md:grid-cols-2 gap-8">
          <Skeleton className="w-full h-96" />
          <div className="space-y-4">
            <Skeleton className="w-3/4 h-8" />
            <Skeleton className="w-1/2 h-6" />
            <Skeleton className="w-2/3 h-4" />
            <Skeleton className="w-full h-40" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Товар не знайдено</h1>
          <p className="text-muted-foreground mb-4">Обраний товар не доступний</p>
          <Link href="/shop">
            <Button>Повернутися в магазин</Button>
          </Link>
        </div>
      </div>
    );
  }

  const mainImage = product.images?.[mainImageIndex]?.image_url;
  const discount = product.original_price
    ? Math.round(
        ((parseFloat(product.original_price.toString()) - parseFloat(product.price.toString())) /
          parseFloat(product.original_price.toString())) *
          100
      )
    : 0;

  return (
    <div className="min-h-screen bg-background">
      {/* Breadcrumb */}
      <div className="border-b bg-card/50">
        <div className="max-w-7xl mx-auto px-4 py-3 text-sm text-muted-foreground">
          <Link href="/shop" className="hover:text-foreground">Магазин</Link>
          {' / '}
          <span>{product.category_name}</span>
          {' / '}
          <span className="text-foreground">{product.title}</span>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          {/* Image Gallery */}
          <div className="space-y-4">
            <div className="relative bg-muted rounded-lg overflow-hidden aspect-square">
              {mainImage ? (
                <Image
                  src={mainImage}
                  alt={product.title}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <ShoppingCart className="w-12 h-12 text-muted-foreground" />
                </div>
              )}
              {discount > 0 && (
                <div className="absolute top-4 right-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                  -{discount}%
                </div>
              )}
            </div>

            {/* Thumbnail Gallery */}
            {product.images && product.images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto">
                {product.images.map((image, idx) => (
                  <button
                    key={image.id}
                    onClick={() => setMainImageIndex(idx)}
                    className={`relative w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 border-2 transition ${
                      mainImageIndex === idx
                        ? 'border-primary'
                        : 'border-muted hover:border-muted-foreground'
                    }`}
                  >
                    <Image
                      src={image.image_url}
                      alt={`Thumbnail ${idx}`}
                      fill
                      className="object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            {/* Header */}
            <div>
              <div className="flex items-start justify-between mb-2">
                <h1 className="text-3xl font-bold">{product.title}</h1>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleWishlist}
                  className={inWishlist ? 'text-red-500' : ''}
                >
                  <Heart className="w-6 h-6" fill={inWishlist ? 'currentColor' : 'none'} />
                </Button>
              </div>
              <p className="text-muted-foreground">{product.category_name}</p>
            </div>

            {/* Rating */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                {Array(5)
                  .fill(0)
                  .map((_, i) => (
                    <Star
                      key={i}
                      className="w-4 h-4"
                      fill={i < Math.round(product.rating) ? 'currentColor' : 'none'}
                    />
                  ))}
              </div>
              <span className="text-sm font-semibold">{(Number(product.rating) || 0).toFixed(1)}</span>
              <span className="text-sm text-muted-foreground">
                ({product.review_count} відгуків)
              </span>
            </div>

            {/* Price */}
            <div className="space-y-2">
              <div className="flex items-baseline gap-3">
                <span className="text-3xl font-bold">
                  {product.price} {product.currency}
                </span>
                {product.original_price && (
                  <span className="text-lg text-muted-foreground line-through">
                    {product.original_price} {product.currency}
                  </span>
                )}
              </div>
            </div>

            {/* Stock Status */}
            <div className="flex items-center gap-2">
              {product.stock_quantity > 0 ? (
                <>
                  <Check className="w-5 h-5 text-green-500" />
                  <span className="text-sm text-green-600 font-semibold">В наявності</span>
                </>
              ) : (
                <span className="text-sm text-red-600 font-semibold">Немає в наявності</span>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <Button
                size="lg"
                className="flex-1"
                onClick={handleAddToCart}
                disabled={product.stock_quantity === 0}
              >
                <ShoppingCart className="w-4 h-4 mr-2" />
                Додати в кошик
              </Button>
              <Button variant="outline" size="lg" onClick={handleShare}>
                <Share2 className="w-4 h-4" />
              </Button>
            </div>

            {/* Seller Info */}
            <Card className="p-4">
              <div className="flex items-center gap-3 mb-3">
                {product.seller_avatar ? (
                  <Image
                    src={product.seller_avatar}
                    alt={product.seller_name}
                    width={40}
                    height={40}
                    className="rounded-full"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                    <User className="w-5 h-5 text-muted-foreground" />
                  </div>
                )}
                <div className="flex-1">
                  <Link href={`/shop/sellers/${product.seller_id}`} className="font-semibold hover:underline">
                    {product.seller_name}
                  </Link>
                  <div className="flex items-center gap-2 text-sm">
                    <div className="flex gap-0.5">
                      {Array(5)
                        .fill(0)
                        .map((_, i) => (
                          <Star
                            key={i}
                            className="w-3 h-3"
                            fill={i < Math.round(product.seller_rating) ? 'currentColor' : 'none'}
                          />
                        ))}
                    </div>
                    <span className="text-muted-foreground">
                      {product.seller_total_sales} продаж
                    </span>
                  </div>
                </div>
              </div>
            </Card>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4">
              <Card className="p-4 text-center">
                <div className="text-2xl font-bold">{product.view_count}</div>
                <div className="text-xs text-muted-foreground">Переглядів</div>
              </Card>
              <Card className="p-4 text-center">
                <div className="text-2xl font-bold">{product.sale_count}</div>
                <div className="text-xs text-muted-foreground">Продано</div>
              </Card>
              <Card className="p-4 text-center">
                <div className="text-2xl font-bold">{product.review_count}</div>
                <div className="text-xs text-muted-foreground">Відгуків</div>
              </Card>
            </div>
          </div>
        </div>

        {/* Description and Attributes */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* Description */}
          <div className="md:col-span-2 space-y-6">
            <Card className="p-6">
              <h2 className="text-xl font-bold mb-4">Опис</h2>
              <p className="text-muted-foreground whitespace-pre-wrap">{product.description}</p>
            </Card>

            {/* Attributes */}
            {product.attributes && product.attributes.length > 0 && (
              <Card className="p-6">
                <h2 className="text-xl font-bold mb-4">Характеристики</h2>
                <div className="space-y-3">
                  {product.attributes.map((attr) => (
                    <div key={attr.id} className="flex justify-between py-2 border-b last:border-0">
                      <span className="text-muted-foreground">{attr.attribute_name}</span>
                      <span className="font-semibold">{attr.attribute_value}</span>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* Reviews Section */}
            <Card className="p-6">
              <h2 className="text-xl font-bold mb-4">Відгуки ({product.review_count})</h2>

              {!isWritingReview ? (
                <Button
                  variant="outline"
                  className="w-full mb-6"
                  onClick={() => setIsWritingReview(true)}
                >
                  Написати відгук
                </Button>
              ) : (
                <form onSubmit={handleSubmitReview} className="space-y-4 mb-6 p-4 bg-muted rounded-lg">
                  <div>
                    <Label>Оцінка</Label>
                    <RadioGroup value={reviewRating} onValueChange={setReviewRating}>
                      <div className="flex items-center gap-2">
                        {['1', '2', '3', '4', '5'].map((val) => (
                          <div key={val} className="flex items-center gap-1">
                            <RadioGroupItem value={val} id={`rating-${val}`} />
                            <Label htmlFor={`rating-${val}`} className="cursor-pointer flex gap-0.5">
                              {Array(5)
                                .fill(0)
                                .map((_, i) => (
                                  <Star
                                    key={i}
                                    className="w-3 h-3"
                                    fill={i < parseInt(val) ? 'currentColor' : 'none'}
                                  />
                                ))}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </RadioGroup>
                  </div>

                  <div>
                    <Label htmlFor="title">Заголовок</Label>
                    <input
                      id="title"
                      type="text"
                      placeholder="Короткий заголовок відгуку"
                      value={reviewTitle}
                      onChange={(e) => setReviewTitle(e.target.value)}
                      className="w-full px-3 py-2 border rounded-md bg-background"
                    />
                  </div>

                  <div>
                    <Label htmlFor="comment">Відгук</Label>
                    <Textarea
                      id="comment"
                      placeholder="Ваш відгук..."
                      value={reviewComment}
                      onChange={(e) => setReviewComment(e.target.value)}
                      className="min-h-24"
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button type="submit" disabled={submittingReview}>
                      {submittingReview ? 'Отправка...' : 'Опубліковати'}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setIsWritingReview(false);
                        setReviewTitle('');
                        setReviewComment('');
                      }}
                    >
                      Скасувати
                    </Button>
                  </div>
                </form>
              )}

              {/* Reviews List */}
              <div className="space-y-4">
                {reviews.length > 0 ? (
                  reviews.map((review) => (
                    <div key={review.id} className="p-4 bg-muted rounded-lg">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <div className="flex gap-1 mb-1">
                            {Array(5)
                              .fill(0)
                              .map((_, i) => (
                                <Star
                                  key={i}
                                  className="w-3 h-3"
                                  fill={i < review.rating ? 'currentColor' : 'none'}
                                />
                              ))}
                          </div>
                          <h4 className="font-semibold">{review.title}</h4>
                          <p className="text-sm text-muted-foreground">{review.reviewer_name}</p>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {formatDate(review.created_at)}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{review.comment}</p>
                      <button className="text-xs text-muted-foreground hover:text-foreground">
                        Корисно ({review.helpful_count})
                      </button>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-muted-foreground py-8">
                    Немає відгуків. Будьте першим!
                  </p>
                )}
              </div>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            <Card className="p-4 sticky top-4">
              <h3 className="font-semibold mb-3">Доставка</h3>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-muted-foreground">Термін доставки:</span>
                  <p className="font-semibold">3-5 робочих днів</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Грн</span>
                  <p className="font-semibold">Залежить від міста</p>
                </div>
              </div>
            </Card>

            <Card className="p-4">
              <h3 className="font-semibold mb-3">Гарантія</h3>
              <div className="space-y-2 text-sm">
                <p className="text-muted-foreground">
                  ✓ Повернення протягом 14 днів
                </p>
                <p className="text-muted-foreground">
                  ✓ Гарантія якості
                </p>
                <p className="text-muted-foreground">
                  ✓ Безпечний платіж
                </p>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
