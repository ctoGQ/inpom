'use client';

import { useEffect, useRef, useState } from 'react';
import { X } from 'lucide-react';

interface MobileModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  showDragHandle?: boolean;
  snapPoints?: number[];
}

export function MobileModal({
  isOpen,
  onClose,
  title,
  children,
  showDragHandle = true,
  snapPoints = [0],
}: MobileModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [startY, setStartY] = useState(0);
  const [currentY, setCurrentY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    const handleTouchStart = (e: TouchEvent) => {
      // Only allow drag from the drag handle area (top part of modal)
      const touch = e.touches[0];
      if (touch.clientY > 50) return; // Only top 50px is draggable

      setStartY(touch.clientY);
      setIsDragging(true);
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isDragging) return;

      const touch = e.touches[0];
      const diff = touch.clientY - startY;

      // Only allow dragging down
      if (diff > 0) {
        setCurrentY(diff);
      }
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (!isDragging) return;

      setIsDragging(false);

      // Close modal if dragged more than 100px or more than 30% of modal height
      const modalHeight = modalRef.current?.clientHeight || 0;
      const threshold = Math.max(100, modalHeight * 0.3);

      if (currentY > threshold) {
        onClose();
      }

      setCurrentY(0);
    };

    if (isOpen) {
      document.addEventListener('touchstart', handleTouchStart);
      document.addEventListener('touchmove', handleTouchMove);
      document.addEventListener('touchend', handleTouchEnd);

      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, isDragging, startY, currentY, onClose]);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/30 transition-opacity"
        onClick={onClose}
        style={{
          opacity: isDragging ? 0.15 : 0.3,
        }}
      />

      {/* Modal */}
      <div
        className="fixed inset-x-0 bottom-0 z-50 transition-transform duration-300"
        style={{
          transform: isDragging
            ? `translateY(${currentY}px)`
            : 'translateY(0)',
        }}
        ref={modalRef}
      >
        <div className="bg-background rounded-t-3xl shadow-2xl shadow-black/20 dark:shadow-black/50 border-t border-border overflow-hidden flex flex-col max-h-[90vh]">
          {/* Drag Handle */}
          {showDragHandle && (
            <div className="flex justify-center pt-3 pb-1 cursor-grab active:cursor-grabbing">
              <div className="h-1 w-12 rounded-full bg-muted" />
            </div>
          )}

          {/* Header */}
          {title && (
            <div className="flex items-center justify-between px-6 py-4 border-b border-border sticky top-0 bg-background z-10">
              <button
                onClick={onClose}
                className="text-muted-foreground hover:text-foreground transition-colors p-1"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
              <h2 className="text-center font-semibold text-foreground flex-1">
                {title}
              </h2>
              <div className="w-5" />
            </div>
          )}

          {/* Content */}
          <div
            ref={contentRef}
            className="overflow-y-auto flex-1"
            style={{
              WebkitOverflowScrolling: 'touch',
            }}
          >
            {children}
          </div>
        </div>
      </div>
    </>
  );
}
