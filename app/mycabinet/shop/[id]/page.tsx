'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { CabinetLayout } from '@/components/cabinet/cabinet-layout';
import { MobileModal } from '@/components/mobile-modal';
import { useToast } from '@/components/ui/use-toast';
import {
  Star,
  Package,
  ShoppingCart,
  Pencil,
  ChevronRight,
  MessageCircle,
  Send,
  Tag,
  BarChart2,
  AlertCircle,
} from 'lucide-react';

// â”€â”€ Types â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
interface Product {
  id: number;
  title: string;
  slug: string;
  description: string;
  short_description?: string;
  price: number;
  original_price?: number;
  currency: string;
  stock_quantity: number;
  sku?: string;
  rating: number;
  review_count: number;
  sale_count: number;
  comment_count: number;
  status: string;
  product_type: string;
  is_featured: boolean;
  created_at: string;
  category_name: string;
  category_id: number;
  seller_id: number;
  seller_name: string;
  seller_avatar?: string;
}

interface Attribute {
  attribute_name: string;
  attribute_value: string;
}

interface ProductImage {
  id: number;
  image_url: string;
  is_primary: boolean;
}

interface Comment {
  id: number;
  product_id: number;
  parent_id: number | null;
  content: string;
  is_deleted: boolean;
  is_edited: boolean;
  likes_count: number;
  created_at: string;
  author_id: number;
  author_name: string | null;
  author_avatar: string | null;
}

// â”€â”€ Helpers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const PRODUCT_TYPE_LABELS: Record<string, string> = {
  goods: 'Товар',
  service: 'Послуга',
  digital: 'Цифровий',
  subscription: 'Підписка',
};

const STATUS_LABELS: Record<string, string> = {
  active: 'Активний',
  draft: 'Чернетка',
  inactive: 'Неактивний',
  moderation: 'На перевірці',
};

function initials(name: string) {
  return name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'щойно';
  if (m < 60) return `${m} хв тому`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} год тому`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d} дн тому`;
  return new Date(dateStr).toLocaleDateString('uk-UA', { day: '2-digit', month: 'short' });
}

// â”€â”€ Avatar Component â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function Avatar({ name, src, size = 40 }: { name: string; src?: string | null; size?: number }) {
  return src ? (
    <Image
      src={src}
      alt={name}
      width={size}
      height={size}
      className="rounded-full object-cover flex-shrink-0"
      style={{ width: size, height: size }}
    />
  ) : (
    <div
      className="rounded-full bg-foreground/10 flex items-center justify-center flex-shrink-0 text-foreground font-semibold"
      style={{ width: size, height: size, fontSize: size * 0.35 }}
    >
      {initials(name)}
    </div>
  );
}

// â”€â”€ Comment Row â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function CommentRow({ comment, onReply }: { comment: Comment; onReply?: (id: number, name: string) => void }) {
  if (comment.is_deleted) {
    return (
      <div className={`p-4 ${comment.parent_id ? 'pl-10' : ''}`}>
        <p className="text-xs text-muted-foreground italic">[коментар видалено]</p>
      </div>
    );
  }
  return (
    <div className={`p-4 hover:bg-foreground/5 transition-colors ${comment.parent_id ? 'pl-8' : ''}`}>
      <div className="flex gap-3">
        <Avatar name={comment.author_name || '?'} src={comment.author_avatar} size={32} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className="text-sm font-semibold text-foreground">{comment.author_name}</span>
            <span className="text-xs text-muted-foreground">{timeAgo(comment.created_at)}</span>
            {comment.is_edited && <span className="text-xs text-muted-foreground">• редаговано</span>}
          </div>
          <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap break-words">{comment.content}</p>
          {onReply && (
            <button
              onClick={() => onReply(comment.id, comment.author_name || '')}
              className="mt-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              Ğ’Ñ–Ğ´Ğ¿Ğ¾Ğ²Ñ–ÑÑ‚Ğ¸
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// â”€â”€ Main Page â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const productId = params.id as string;
  const referrer = searchParams.get('referrer');
  const { toast } = useToast();

  const [product, setProduct] = useState<Product | null>(null);
  const [attributes, setAttributes] = useState<Attribute[]>([]);
  const [images, setImages] = useState<ProductImage[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'details' | 'attributes' | 'comments'>('details');
  const [activeImageIdx, setActiveImageIdx] = useState(0);

  const [commentText, setCommentText] = useState('');
  const [replyTo, setReplyTo] = useState<{ id: number; name: string } | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [purchasing, setPurchasing] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const commentInputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      try {
        const [productRes, commentsRes, profileRes] = await Promise.all([
          fetch(`/api/shop/products/detail?id=${productId}`),
          fetch(`/api/shop/products/${productId}/comments`),
          fetch('/api/auth/profile'),
        ]);

        if (!productRes.ok) { router.replace('/mycabinet/shop'); return; }

        const [productData, commentsData, profileData] = await Promise.all([
          productRes.json(),
          commentsRes.json(),
          profileRes.json(),
        ]);

        setProduct(productData.product || null);
        setAttributes(productData.attributes || []);
        setImages(productData.images || []);
        setComments(commentsData.comments || []);
        if (profileData.customer) setCurrentUserId(profileData.customer.id);
      } catch (err) {
        console.error('[ProductDetail] fetch error:', err);
        toast({ title: 'Помилка', description: 'Не вдалось завантажити товар', variant: 'destructive' });
      } finally {
        setLoading(false);
      }
    };
    if (productId) fetchAll();
  }, [productId, router, toast]);

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const text = commentText.trim();
    if (!text || !product) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/shop/products/${product.id}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: text, parent_id: replyTo?.id ?? null }),
      });
      if (!res.ok) throw new Error((await res.json()).error || 'Failed');
      const data = await res.json();
      setComments((prev) => [...prev, data.comment]);
      setCommentText('');
      setReplyTo(null);
    } catch (err) {
      toast({ title: 'Помилка', description: err instanceof Error ? err.message : 'Не вдалось опублікувати', variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  };

  const startReply = (id: number, name: string) => {
    setReplyTo({ id, name });
    setActiveTab('comments');
    setTimeout(() => commentInputRef.current?.focus(), 100);
  };

  const handleBuyClick = () => {
    if (!product) return;
    setShowConfirmModal(true);
  };

  const confirmPurchase = async () => {
    if (!product || purchasing) return;
    
    setPurchasing(true);
    try {
      const res = await fetch('/api/shop/purchase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: product.id,
          quantity: 1,
          sellerId: product.seller_id,
          amount: product.price,
          currency: product.currency,
        }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Не вдалось створити покупку');
      }

      const data = await res.json();
      setShowConfirmModal(false);
      toast({
        title: 'Успіх',
        description: `Покупка успішна. Транзакція #${data.transactionId}`,
      });
      
      // Redirect to transaction detail
      router.push(`/mycabinet/transactions/${data.transactionId}`);
    } catch (err) {
      console.error('[Buy] Error:', err);
      toast({
        title: 'Помилка',
        description: err instanceof Error ? err.message : 'Не вдалось створити покупку',
        variant: 'destructive',
      });
    } finally {
      setPurchasing(false);
    }
  };

  if (loading) {
    return (
      <CabinetLayout title="Завантаження..." showBack showAvatar showNav backHref={referrer || '/mycabinet/shop'}>
        <div className="px-4 pt-6 pb-28 space-y-4">
          <div className="w-full aspect-[4/3] bg-foreground/5 rounded-2xl animate-pulse" />
          <div className="h-6 w-2/3 bg-foreground/5 rounded animate-pulse" />
          <div className="h-20 bg-foreground/5 rounded-2xl animate-pulse" />
          <div className="h-14 bg-foreground/5 rounded-2xl animate-pulse" />
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-12 bg-foreground/5 rounded-xl animate-pulse" />
          ))}
        </div>
      </CabinetLayout>
    );
  }

  if (!product) {
    return (
      <CabinetLayout title="Не знайдено" showBack showAvatar showNav backHref={referrer || '/mycabinet/shop'}>
        <div className="px-4 pt-16 pb-28 flex flex-col items-center gap-4">
          <AlertCircle className="w-16 h-16 text-muted-foreground" />
          <p className="font-semibold text-foreground">Товар не знайдено</p>
          <Link href="/mycabinet/shop" className="text-sm text-muted-foreground underline">
            До магазину
          </Link>
        </div>
      </CabinetLayout>
    );
  }

  const isOwner = currentUserId === product.seller_id;
  const discount =
    product.original_price && Number(product.original_price) > Number(product.price)
      ? Math.round(((Number(product.original_price) - Number(product.price)) / Number(product.original_price)) * 100)
      : 0;

  const topLevelComments = comments.filter((c) => !c.parent_id);
  const repliesFor = (id: number) => comments.filter((c) => c.parent_id === id);

  return (
    <CabinetLayout title={product.title} showBack showAvatar showNav={false} backHref={referrer || '/mycabinet/shop'}>
      <div className="px-4 pt-6 pb-4 space-y-5">

        {/* â”€â”€ Hero image gallery â”€â”€ */}
        {images.length > 0 ? (
          <div className="space-y-2">
            <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden bg-foreground/5">
              <Image
                src={images[activeImageIdx]?.image_url || images[0].image_url}
                alt={product.title}
                fill
                sizes="(max-width: 768px) 100vw, 600px"
                className="object-cover"
                priority
              />
              {discount > 0 && (
                <div className="absolute top-3 left-3 bg-destructive text-destructive-foreground text-xs font-bold px-2 py-1 rounded-lg">
                  -{discount}%
                </div>
              )}
              {product.is_featured && (
                <div className="absolute top-3 right-3 bg-foreground text-background text-xs font-bold px-2 py-1 rounded-lg">
                  Ğ¢ĞĞŸ
                </div>
              )}
            </div>
            {images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto scrollbar-hide">
                {images.map((img, i) => (
                  <button
                    key={img.id}
                    onClick={() => setActiveImageIdx(i)}
                    className={`flex-shrink-0 w-16 h-16 rounded-xl overflow-hidden border-2 transition-colors ${
                      i === activeImageIdx ? 'border-foreground' : 'border-foreground/10'
                    }`}
                  >
                    <Image src={img.image_url} alt="" width={64} height={64} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden bg-foreground/5 flex items-center justify-center">
            <Package className="w-16 h-16 text-muted-foreground/20" />
            {discount > 0 && (
              <div className="absolute top-3 left-3 bg-destructive text-destructive-foreground text-xs font-bold px-2 py-1 rounded-lg">
                -{discount}%
              </div>
            )}
          </div>
        )}

        {/* â”€â”€ Price card â”€â”€ */}
        <div className="p-5 rounded-2xl border border-foreground/10 space-y-3">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Ціна</p>
              <div className="flex items-baseline gap-2">
                <p className="text-4xl font-bold text-foreground">{Number(product.price).toFixed(0)}</p>
                <p className="text-lg font-semibold text-muted-foreground">{product.currency || 'INPOM'}</p>
              </div>
              {product.original_price && Number(product.original_price) > Number(product.price) && (
                <p className="text-sm text-muted-foreground line-through mt-0.5">
                  {Number(product.original_price).toFixed(0)} {product.currency || 'INPOM'}
                </p>
              )}
            </div>
            <div className="text-right">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Тип</p>
              <span className="inline-block px-2.5 py-1 rounded-lg bg-foreground/5 border border-foreground/10 text-xs font-medium text-foreground">
                {PRODUCT_TYPE_LABELS[product.product_type] || product.product_type}
              </span>
            </div>
          </div>
          {product.short_description && (
            <p className="text-sm text-muted-foreground leading-relaxed border-t border-foreground/10 pt-3">
              {product.short_description}
            </p>
          )}
        </div>

        {/* Product seller card */}
        <Link href={`/mycabinet/members/${product.seller_id}`}>
          <div className="p-5 rounded-2xl border border-foreground/10 flex items-center gap-4 hover:bg-foreground/5 transition-colors">
            <Avatar name={product.seller_name} src={product.seller_avatar} size={48} />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Продавець</p>
              <p className="text-sm font-semibold text-foreground truncate">{product.seller_name}</p>
            </div>
            <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
          </div>
        </Link>

        {/* â”€â”€ Stats row â”€â”€ */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Продано', value: product.sale_count, icon: <BarChart2 className="w-4 h-4" /> },
            { label: 'Рейтинг', value: (Number(product.rating) || 0).toFixed(1), icon: <Star className="w-4 h-4 fill-foreground/60 text-foreground/60" /> },
            { label: 'В наявності', value: product.stock_quantity, icon: <Package className="w-4 h-4" /> },
          ].map(({ label, value, icon }) => (
            <div key={label} className="p-4 rounded-2xl border border-foreground/10 bg-foreground/[0.02] flex flex-col gap-1">
              <div className="flex items-center gap-1.5 text-muted-foreground">
                {icon}
                <p className="text-xs font-semibold uppercase tracking-wide">{label}</p>
              </div>
              <p className="text-xl font-bold text-foreground">{value}</p>
            </div>
          ))}
        </div>

        {/* â”€â”€ Tabs â”€â”€ */}
        <div className="flex gap-2 bg-foreground/5 p-1 rounded-xl">
          {(
            [
              { key: 'details', label: 'Деталі' },
              { key: 'attributes', label: `Характеристики${attributes.length ? ` (${attributes.length})` : ''}` },
              { key: 'comments', label: `Коментарі${comments.length ? ` (${comments.length})` : ''}` },
            ] as const
          ).map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`flex-1 px-3 py-2.5 rounded-lg font-medium text-xs transition-colors ${
                activeTab === key ? 'bg-foreground/10 text-foreground' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* â”€â”€ Tab: Details â”€â”€ */}
        {activeTab === 'details' && (
          <div className="rounded-2xl border border-foreground/10 overflow-hidden divide-y divide-foreground/10">
            <div className="p-4 flex items-start gap-3 hover:bg-foreground/5 transition-colors">
              <div className="flex-1 min-w-0">
                <p className="text-xs text-muted-foreground mb-1">Опис</p>
                <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">{product.description || 'â€”'}</p>
              </div>
            </div>
            <div className="p-4 flex items-center justify-between hover:bg-foreground/5 transition-colors">
              <p className="text-sm text-muted-foreground">Категорія</p>
              <div className="flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-muted-foreground" />
                <p className="text-sm font-medium text-foreground">{product.category_name}</p>
              </div>
            </div>
            <div className="p-4 flex items-center justify-between hover:bg-foreground/5 transition-colors">
              <p className="text-sm text-muted-foreground">Статус</p>
              <p className="text-sm font-medium text-foreground">{STATUS_LABELS[product.status] || product.status}</p>
            </div>
            {product.sku && (
              <div className="p-4 flex items-center justify-between hover:bg-foreground/5 transition-colors">
                <p className="text-sm text-muted-foreground">Артикул (SKU)</p>
                <p className="text-sm font-medium text-foreground font-mono">{product.sku}</p>
              </div>
            )}
            <div className="p-4 flex items-center justify-between hover:bg-foreground/5 transition-colors">
              <p className="text-sm text-muted-foreground">Опубліковано</p>
              <p className="text-sm font-medium text-foreground">
                {new Date(product.created_at).toLocaleDateString('uk-UA', { day: '2-digit', month: 'long', year: 'numeric' })}
              </p>
            </div>
            <div className="p-4 flex items-center justify-between hover:bg-foreground/5 transition-colors">
              <p className="text-sm text-muted-foreground">Коментарів</p>
              <p className="text-sm font-medium text-foreground">{product.comment_count ?? comments.length}</p>
            </div>
          </div>
        )}

        {/* â”€â”€ Tab: Characteristics â”€â”€ */}
        {activeTab === 'attributes' && (
          <div className="rounded-2xl border border-foreground/10 overflow-hidden divide-y divide-foreground/10">
            {attributes && attributes.length > 0 ? (
              attributes.map((attr, i) => (
                <div key={i} className="p-4 flex items-start justify-between gap-4 hover:bg-foreground/5 transition-colors">
                  <p className="text-sm text-muted-foreground flex-shrink-0">{attr.attribute_name}</p>
                  <p className="text-sm font-medium text-foreground text-right">{attr.attribute_value}</p>
                </div>
              ))
            ) : (
              <div className="p-8 text-center">
                <p className="text-sm text-muted-foreground">Характеристики відсутні</p>
              </div>
            )}
          </div>
        )}

        {/* â”€â”€ Tab: Comments â”€â”€ */}
        {activeTab === 'comments' && (
          <div className="space-y-4">
            {comments.length > 0 ? (
              <div className="rounded-2xl border border-foreground/10 overflow-hidden divide-y divide-foreground/10">
                {topLevelComments.map((comment) => (
                  <div key={comment.id}>
                    <CommentRow comment={comment} onReply={startReply} />
                    {repliesFor(comment.id).map((reply) => (
                      <div key={reply.id} className="border-t border-foreground/10 bg-foreground/[0.02]">
                        <CommentRow comment={reply} />
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-foreground/10 p-8 text-center">
                <MessageCircle className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">Поки немає коментарів. Будьте першим!</p>
              </div>
            )}

            {/* Comment input */}
            <form onSubmit={handleCommentSubmit} className="rounded-2xl border border-foreground/10 overflow-hidden">
              {replyTo && (
                <div className="px-4 py-2 bg-foreground/5 border-b border-foreground/10 flex items-center justify-between">
                  <p className="text-xs text-muted-foreground">
                    Відповідь до <span className="font-medium text-foreground">{replyTo.name}</span>
                  </p>
                  <button type="button" onClick={() => setReplyTo(null)} className="text-xs text-muted-foreground hover:text-foreground">
                    Скасувати
                  </button>
                </div>
              )}
              <div className="flex items-end gap-3 p-3">
                <textarea
                  ref={commentInputRef}
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Напишіть коментар..."
                  rows={2}
                  maxLength={2000}
                  className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none resize-none"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleCommentSubmit(e as any); }
                  }}
                />
                <button
                  type="submit"
                  disabled={!commentText.trim() || submitting}
                  className="w-9 h-9 rounded-xl bg-primary text-primary-foreground flex items-center justify-center flex-shrink-0 disabled:opacity-40 hover:opacity-90 transition-opacity"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </form>
          </div>
        )}

        {/* â”€â”€ Owner edit link â”€â”€ */}
        {isOwner && (
          <Link href={`/mycabinet/shop/${product.id}/edit`}>
            <div className="rounded-2xl border border-foreground/10 p-4 flex items-center gap-3 hover:bg-foreground/5 transition-colors">
              <div className="w-9 h-9 rounded-xl bg-foreground/5 flex items-center justify-center flex-shrink-0">
                <Pencil className="w-4 h-4 text-muted-foreground" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">Редагувати оголошення</p>
                <p className="text-xs text-muted-foreground">Ви є автором цього товару</p>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
            </div>
          </Link>
        )}

        {/* Buy button (non-owner, in-stock) */}
        {!isOwner && product.stock_quantity > 0 && (
          <div className="fixed bottom-0 left-0 right-0 px-4 pb-4 z-10 bg-background border-t border-foreground/10">
            <button 
              onClick={handleBuyClick}
              disabled={purchasing}
              className="w-full py-4 bg-primary text-primary-foreground font-semibold rounded-2xl flex items-center justify-center gap-2 hover:opacity-90 active:scale-[0.98] transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ShoppingCart className="w-5 h-5" />
              {purchasing ? 'Обробка...' : 'Придбати'}
            </button>
          </div>
        )}
      </div>

      {/* Purchase Confirmation Modal */}
      <MobileModal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        title="Підтвердити покупку"
      >
        <div className="px-6 py-6 space-y-6">
          {/* Product Summary */}
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Товар</p>
            <p className="text-lg font-semibold text-foreground line-clamp-2">{product?.title}</p>
          </div>

          {/* Amount to Deduct */}
          <div className="rounded-2xl bg-destructive/10 border border-destructive/20 p-4 space-y-1">
            <p className="text-sm text-muted-foreground">Сума списання</p>
            <p className="text-3xl font-bold text-foreground">
              {product?.price ? Number(product.price).toFixed(2) : '0.00'} {product?.currency || 'INPOM'}
            </p>
          </div>

          {/* Confirm Button */}
          <button
            onClick={confirmPurchase}
            disabled={purchasing}
            className="w-full py-4 bg-primary text-primary-foreground font-semibold rounded-2xl flex items-center justify-center gap-2 hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ShoppingCart className="w-5 h-5" />
            {purchasing ? 'Обробка...' : 'Підтвердити'}
          </button>

          {/* Cancel Button */}
          <button
            onClick={() => setShowConfirmModal(false)}
            disabled={purchasing}
            className="w-full py-3 bg-foreground/5 text-foreground font-medium rounded-2xl hover:bg-foreground/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Скасувати
          </button>
        </div>
      </MobileModal>
    </CabinetLayout>
  );
}
