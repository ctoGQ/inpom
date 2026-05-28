'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { CabinetLayout } from '@/components/cabinet/cabinet-layout';
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
  goods: 'Ğ¢Ğ¾Ğ²Ğ°Ñ€',
  service: 'ĞŸĞ¾ÑĞ»ÑƒĞ³Ğ°',
  digital: 'Ğ¦Ğ¸Ñ„Ñ€Ğ¾Ğ²Ğ¸Ğ¹',
  subscription: 'ĞŸÑ–Ğ´Ğ¿Ğ¸ÑĞºĞ°',
};

const STATUS_LABELS: Record<string, string> = {
  active: 'ĞĞºÑ‚Ğ¸Ğ²Ğ½Ğ¸Ğ¹',
  draft: 'Ğ§ĞµÑ€Ğ½ĞµÑ‚ĞºĞ°',
  inactive: 'ĞĞµĞ°ĞºÑ‚Ğ¸Ğ²Ğ½Ğ¸Ğ¹',
  moderation: 'ĞĞ° Ğ¿ĞµÑ€ĞµĞ²Ñ–Ñ€Ñ†Ñ–',
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
  if (m < 1) return 'Ñ‰Ğ¾Ğ¹Ğ½Ğ¾';
  if (m < 60) return `${m} Ñ…Ğ² Ñ‚Ğ¾Ğ¼Ñƒ`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} Ğ³Ğ¾Ğ´ Ñ‚Ğ¾Ğ¼Ñƒ`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d} Ğ´Ğ½ Ñ‚Ğ¾Ğ¼Ñƒ`;
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
        <p className="text-xs text-muted-foreground italic">[ĞºĞ¾Ğ¼ĞµĞ½Ñ‚Ğ°Ñ€ Ğ²Ğ¸Ğ´Ğ°Ğ»ĞµĞ½Ğ¾]</p>
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
            {comment.is_edited && <span className="text-xs text-muted-foreground">â€¢ Ñ€ĞµĞ´Ğ°Ğ³Ğ¾Ğ²Ğ°Ğ½Ğ¾</span>}
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
  const productId = params.id as string;
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
        toast({ title: 'ĞŸĞ¾Ğ¼Ğ¸Ğ»ĞºĞ°', description: 'ĞĞµ Ğ²Ğ´Ğ°Ğ»Ğ¾ÑÑŒ Ğ·Ğ°Ğ²Ğ°Ğ½Ñ‚Ğ°Ğ¶Ğ¸Ñ‚Ğ¸ Ñ‚Ğ¾Ğ²Ğ°Ñ€', variant: 'destructive' });
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
      toast({ title: 'ĞŸĞ¾Ğ¼Ğ¸Ğ»ĞºĞ°', description: err instanceof Error ? err.message : 'ĞĞµ Ğ²Ğ´Ğ°Ğ»Ğ¾ÑÑŒ Ğ¾Ğ¿ÑƒĞ±Ğ»Ñ–ĞºÑƒĞ²Ğ°Ñ‚Ğ¸', variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  };

  const startReply = (id: number, name: string) => {
    setReplyTo({ id, name });
    setActiveTab('comments');
    setTimeout(() => commentInputRef.current?.focus(), 100);
  };

  if (loading) {
    return (
      <CabinetLayout title="Ğ—Ğ°Ğ²Ğ°Ğ½Ñ‚Ğ°Ğ¶ĞµĞ½Ğ½Ñ..." showBack showAvatar showNav>
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
      <CabinetLayout title="ĞĞµ Ğ·Ğ½Ğ°Ğ¹Ğ´ĞµĞ½Ğ¾" showBack showAvatar showNav>
        <div className="px-4 pt-16 pb-28 flex flex-col items-center gap-4">
          <AlertCircle className="w-16 h-16 text-muted-foreground" />
          <p className="font-semibold text-foreground">Ğ¢Ğ¾Ğ²Ğ°Ñ€ Ğ½Ğµ Ğ·Ğ½Ğ°Ğ¹Ğ´ĞµĞ½Ğ¾</p>
          <Link href="/mycabinet/shop" className="text-sm text-muted-foreground underline">
            Ğ”Ğ¾ Ğ¼Ğ°Ñ€ĞºĞµÑ‚Ğ¿Ğ»ĞµĞ¹ÑÑƒ
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
    <CabinetLayout title={product.title} showBack showAvatar showNav>
      <div className="px-4 pt-6 pb-28 space-y-5">

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
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Ğ¦Ñ–Ğ½Ğ°</p>
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
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Ğ¢Ğ¸Ğ¿</p>
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

        {/* â”€â”€ Seller card â”€â”€ */}
        <Link href={`/shop?seller_id=${product.seller_id}`}>
          <div className="p-5 rounded-2xl border border-foreground/10 flex items-center gap-4 hover:bg-foreground/5 transition-colors">
            <Avatar name={product.seller_name} src={product.seller_avatar} size={48} />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">ĞŸÑ€Ğ¾Ğ´Ğ°Ğ²ĞµÑ†ÑŒ</p>
              <p className="text-sm font-semibold text-foreground truncate">{product.seller_name}</p>
            </div>
            <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
          </div>
        </Link>

        {/* â”€â”€ Stats row â”€â”€ */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'ĞŸÑ€Ğ¾Ğ´Ğ°Ğ½Ğ¾', value: product.sale_count, icon: <BarChart2 className="w-4 h-4" /> },
            { label: 'Ğ ĞµĞ¹Ñ‚Ğ¸Ğ½Ğ³', value: (Number(product.rating) || 0).toFixed(1), icon: <Star className="w-4 h-4 fill-foreground/60 text-foreground/60" /> },
            { label: 'Ğ’ Ğ½Ğ°ÑĞ²Ğ½Ğ¾ÑÑ‚Ñ–', value: product.stock_quantity, icon: <Package className="w-4 h-4" /> },
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
              { key: 'details', label: 'Ğ”ĞµÑ‚Ğ°Ğ»Ñ–' },
              { key: 'attributes', label: `Ğ¥Ğ°Ñ€Ğ°ĞºÑ‚ĞµÑ€Ğ¸ÑÑ‚Ğ¸ĞºĞ¸${attributes.length ? ` (${attributes.length})` : ''}` },
              { key: 'comments', label: `ĞšĞ¾Ğ¼ĞµĞ½Ñ‚Ğ°Ñ€Ñ–${comments.length ? ` (${comments.length})` : ''}` },
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
                <p className="text-xs text-muted-foreground mb-1">ĞĞ¿Ğ¸Ñ</p>
                <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">{product.description || 'â€”'}</p>
              </div>
            </div>
            <div className="p-4 flex items-center justify-between hover:bg-foreground/5 transition-colors">
              <p className="text-sm text-muted-foreground">ĞšĞ°Ñ‚ĞµĞ³Ğ¾Ñ€Ñ–Ñ</p>
              <div className="flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-muted-foreground" />
                <p className="text-sm font-medium text-foreground">{product.category_name}</p>
              </div>
            </div>
            <div className="p-4 flex items-center justify-between hover:bg-foreground/5 transition-colors">
              <p className="text-sm text-muted-foreground">Ğ¡Ñ‚Ğ°Ñ‚ÑƒÑ</p>
              <p className="text-sm font-medium text-foreground">{STATUS_LABELS[product.status] || product.status}</p>
            </div>
            {product.sku && (
              <div className="p-4 flex items-center justify-between hover:bg-foreground/5 transition-colors">
                <p className="text-sm text-muted-foreground">ĞÑ€Ñ‚Ğ¸ĞºÑƒĞ» (SKU)</p>
                <p className="text-sm font-medium text-foreground font-mono">{product.sku}</p>
              </div>
            )}
            <div className="p-4 flex items-center justify-between hover:bg-foreground/5 transition-colors">
              <p className="text-sm text-muted-foreground">ĞĞ¿ÑƒĞ±Ğ»Ñ–ĞºĞ¾Ğ²Ğ°Ğ½Ğ¾</p>
              <p className="text-sm font-medium text-foreground">
                {new Date(product.created_at).toLocaleDateString('uk-UA', { day: '2-digit', month: 'long', year: 'numeric' })}
              </p>
            </div>
            <div className="p-4 flex items-center justify-between hover:bg-foreground/5 transition-colors">
              <p className="text-sm text-muted-foreground">ĞšĞ¾Ğ¼ĞµĞ½Ñ‚Ğ°Ñ€Ñ–Ğ²</p>
              <p className="text-sm font-medium text-foreground">{product.comment_count ?? comments.length}</p>
            </div>
          </div>
        )}

        {/* â”€â”€ Tab: Characteristics â”€â”€ */}
        {activeTab === 'attributes' && (
          <div className="rounded-2xl border border-foreground/10 overflow-hidden divide-y divide-foreground/10">
            {attributes.length > 0 ? (
              attributes.map((attr, i) => (
                <div key={i} className="p-4 flex items-start justify-between gap-4 hover:bg-foreground/5 transition-colors">
                  <p className="text-sm text-muted-foreground flex-shrink-0">{attr.attribute_name}</p>
                  <p className="text-sm font-medium text-foreground text-right">{attr.attribute_value}</p>
                </div>
              ))
            ) : (
              <div className="p-8 text-center">
                <p className="text-sm text-muted-foreground">Ğ¥Ğ°Ñ€Ğ°ĞºÑ‚ĞµÑ€Ğ¸ÑÑ‚Ğ¸ĞºĞ¸ Ğ²Ñ–Ğ´ÑÑƒÑ‚Ğ½Ñ–</p>
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
                <p className="text-sm text-muted-foreground">ĞŸĞ¾ĞºĞ¸ Ğ½ĞµĞ¼Ğ°Ñ” ĞºĞ¾Ğ¼ĞµĞ½Ñ‚Ğ°Ñ€Ñ–Ğ². Ğ‘ÑƒĞ´ÑŒÑ‚Ğµ Ğ¿ĞµÑ€ÑˆĞ¸Ğ¼!</p>
              </div>
            )}

            {/* Comment input */}
            <form onSubmit={handleCommentSubmit} className="rounded-2xl border border-foreground/10 overflow-hidden">
              {replyTo && (
                <div className="px-4 py-2 bg-foreground/5 border-b border-foreground/10 flex items-center justify-between">
                  <p className="text-xs text-muted-foreground">
                    Ğ’Ñ–Ğ´Ğ¿Ğ¾Ğ²Ñ–Ğ´ÑŒ Ğ´Ğ¾ <span className="font-medium text-foreground">{replyTo.name}</span>
                  </p>
                  <button type="button" onClick={() => setReplyTo(null)} className="text-xs text-muted-foreground hover:text-foreground">
                    Ğ¡ĞºĞ°ÑÑƒĞ²Ğ°Ñ‚Ğ¸
                  </button>
                </div>
              )}
              <div className="flex items-end gap-3 p-3">
                <textarea
                  ref={commentInputRef}
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="ĞĞ°Ğ¿Ğ¸ÑˆÑ–Ñ‚ÑŒ ĞºĞ¾Ğ¼ĞµĞ½Ñ‚Ğ°Ñ€..."
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
                <p className="text-sm font-medium text-foreground">Ğ ĞµĞ´Ğ°Ğ³ÑƒĞ²Ğ°Ñ‚Ğ¸ Ğ¾Ğ³Ğ¾Ğ»Ğ¾ÑˆĞµĞ½Ğ½Ñ</p>
                <p className="text-xs text-muted-foreground">Ğ’Ğ¸ Ñ” Ğ°Ğ²Ñ‚Ğ¾Ñ€Ğ¾Ğ¼ Ñ†ÑŒĞ¾Ğ³Ğ¾ Ñ‚Ğ¾Ğ²Ğ°Ñ€Ñƒ</p>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
            </div>
          </Link>
        )}

        {/* â”€â”€ Buy button (non-owner, in-stock) â”€â”€ */}
        {!isOwner && product.stock_quantity > 0 && (
          <div className="fixed bottom-[72px] left-0 right-0 px-4 z-10">
            <button className="w-full py-4 bg-primary text-primary-foreground font-semibold rounded-2xl flex items-center justify-center gap-2 hover:opacity-90 active:scale-[0.98] transition-all shadow-lg">
              <ShoppingCart className="w-5 h-5" />
              ĞŸÑ€Ğ¸Ğ´Ğ±Ğ°Ñ‚Ğ¸
            </button>
          </div>
        )}
      </div>
    </CabinetLayout>
  );
}
