/**
 * iOS + Framer Motion Integration Guide
 * For /mycabinet pages
 * 
 * ## Quick Start
 * 
 * 1. Import the animations:
 *    ```tsx
 *    import { 
 *      AnimatedContainer, 
 *      AnimatedCard, 
 *      slideUpVariant 
 *    } from '@/components/cabinet/framer-animations';
 *    ```
 * 
 * 2. Use in your components:
 *    ```tsx
 *    <AnimatedContainer variant={slideUpVariant}>
 *      <div className="cabinet-card">Content</div>
 *    </AnimatedContainer>
 *    ```
 * 
 * ## Available Animations
 * 
 * ### Variants
 * - fadeInVariant: Simple fade in/out (300ms)
 * - slideUpVariant: Slide up with fade (400ms)
 * - slideDownVariant: Slide down with fade (400ms)
 * - scaleVariant: Scale from 0.95 with fade (300ms)
 * - cardVariant: Card-specific animation with hover
 * - modalVariant: Modal/overlay animation (300ms)
 * - pageTransitionVariant: Full page transition
 * 
 * ### Containers
 * - AnimatedContainer: Basic wrapper with variants
 * - AnimatedList: For rendering lists with stagger effect
 * - AnimatedCard: Pre-styled card with animations
 * - AnimatedButton: Button with tap feedback
 * - PageTransitionWrapper: Wrap entire pages
 * 
 * ## Color System Integration
 * 
 * All animations respect light/dark theme automatically via CSS variables:
 * - box-shadow: Uses rgba(0,0,0,0.1) for light, rgba(0,0,0,0.3) for dark
 * - Transform effects are consistent across themes
 * - Text animations use CSS class names (already themed)
 * 
 * ## Typography (iOS HIG Compliant)
 * 
 * Use these classes with any component:
 * - .text-h1: 28px, weight 700, -0.5px letter-spacing
 * - .text-h2: 22px, weight 600, -0.25px letter-spacing
 * - .text-h3: 18px, weight 600
 * - .text-body: 16px, weight 400, 1.5 line-height
 * - .text-caption: 14px, weight 400
 * - .text-small: 12px, weight 500
 * - .text-tiny: 10px, weight 500 (uppercase, 0.5px letter-spacing)
 * 
 * All respond to dark mode automatically.
 * 
 * ## Spacing System (8px Base)
 * 
 * Padding, margin, gap classes:
 * - xs: 4px
 * - sm: 8px
 * - md: 12px
 * - lg: 16px
 * - xl: 20px
 * - 2xl: 24px
 * - 3xl: 32px
 * - 4xl: 40px
 * - 5xl: 48px
 * 
 * Examples:
 * - className="gap-md space-y-lg p-lg"
 * - margin-bottom, margin-top: use .mb-*, .mt-*
 * - padding: use .p-*, .px-*, .py-*
 * 
 * ## Example: Card List with Animations
 * 
 * ```tsx
 * import { AnimatedList, listItemVariant } from '@/components/cabinet/framer-animations';
 * 
 * export function TransactionsList() {
 *   const transactions = [
 *     { id: 1, title: 'Payment', amount: '+$50.00', status: 'completed' },
 *     { id: 2, title: 'Transfer', amount: '-$100.00', status: 'pending' }
 *   ];
 * 
 *   return (
 *     <div className="cabinet-section">
 *       <h2 className="text-h3 cabinet-section-title">Recent Transactions</h2>
 *       <AnimatedList
 *         items={transactions.map((tx, i) => (
 *           <a key={tx.id} href={`/mycabinet/transactions/${tx.id}`} 
 *              className="cabinet-list-item">
 *             <div className="cabinet-list-item-main">
 *               <div className="cabinet-list-item-title">{tx.title}</div>
 *               <div className="cabinet-list-item-subtitle">Today</div>
 *             </div>
 *             <div>
 *               <div className="cabinet-list-item-amount">{tx.amount}</div>
 *               <div className={`cabinet-list-item-status cabinet-list-item-status-${tx.status}`}>
 *                 {tx.status}
 *               </div>
 *             </div>
 *           </a>
 *         ))}
 *       />
 *     </div>
 *   );
 * }
 * ```
 * 
 * ## Example: Modal with Animation
 * 
 * ```tsx
 * import { AnimatePresence, motion } from 'framer-motion';
 * import { modalVariant } from '@/components/cabinet/framer-animations';
 * 
 * export function PaymentModal({ isOpen, onClose }) {
 *   return (
 *     <AnimatePresence>
 *       {isOpen && (
 *         <motion.div 
 *           className="fixed inset-0 bg-black/50 z-50"
 *           onClick={onClose}
 *         >
 *           <motion.div
 *             variants={modalVariant}
 *             initial="hidden"
 *             animate="visible"
 *             exit="exit"
 *             className="cabinet-card"
 *             onClick={(e) => e.stopPropagation()}
 *           >
 *             Modal Content
 *           </motion.div>
 *         </motion.div>
 *       )}
 *     </AnimatePresence>
 *   );
 * }
 * ```
 * 
 * ## Dark Mode
 * 
 * All components automatically respond to dark mode via the .dark class.
 * Colors use CSS variables that update based on theme.
 * 
 * No additional styling needed!
 * 
 * ## Performance Tips
 * 
 * 1. Use GPU acceleration: Framer Motion automatically handles this with transform
 * 2. Avoid animating layout on large lists (use exit animations instead)
 * 3. Use AnimatePresence for mount/unmount animations
 * 4. Keep animation durations consistent (300-400ms for iOS feel)
 * 5. Test on actual iOS devices for smooth 60fps experience
 * 
 * ## Responsive Design
 * 
 * All styles are mobile-first:
 * - Mobile: < 768px (default)
 * - Tablet: >= 768px (adjusted padding/gaps)
 * - Desktop: >= 1024px (no bottom nav)
 * 
 * Animations remain smooth on all breakpoints.
 * 
 * ## Accessibility
 * 
 * All animations respect prefers-reduced-motion:
 * ```css
 * @media (prefers-reduced-motion: reduce) {
 *   * {
 *     animation-duration: 0.01ms !important;
 *     animation-iteration-count: 1 !important;
 *     transition-duration: 0.01ms !important;
 *   }
 * }
 * ```
 * 
 * Consider adding this to globals.css for better UX.
 */

export {};
