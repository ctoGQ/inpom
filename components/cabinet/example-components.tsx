'use client';

/**
 * MyCabinet - Example Components with Unified Theme + Framer Motion
 * 
 * These are EXAMPLE implementations showing how to use the new
 * unified design system. Copy patterns as needed.
 */

import { motion, AnimatePresence } from 'framer-motion';
import {
  AnimatedCard,
  AnimatedButton,
  AnimatedList,
  PageTransitionWrapper,
  slideUpVariant,
  listItemVariant,
  staggerContainerVariant
} from '@/components/cabinet/framer-animations';

/**
 * Example 1: Animated Section with Title
 */
export function AnimatedSection({
  title,
  children
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <motion.div
      className="cabinet-section"
      variants={slideUpVariant}
      initial="hidden"
      animate="visible"
    >
      <h2 className="text-h3 cabinet-section-title">{title}</h2>
      {children}
    </motion.div>
  );
}

/**
 * Example 2: Transaction List with Auto Theme + Animations
 */
interface Transaction {
  id: string;
  title: string;
  subtitle: string;
  amount: string;
  status: 'completed' | 'pending' | 'failed';
}

export function TransactionList({ items }: { items: Transaction[] }) {
  return (
    <AnimatedList
      items={items.map((tx) => (
        <a
          key={tx.id}
          href={`/mycabinet/transactions/${tx.id}`}
          className="cabinet-list-item"
        >
          <div className="cabinet-list-item-main">
            <div className="cabinet-list-item-title text-h3">{tx.title}</div>
            <div className="cabinet-list-item-subtitle text-caption">
              {tx.subtitle}
            </div>
          </div>
          <div>
            {/* Amount auto-themed: light mode dark text → dark mode white text */}
            <div className="cabinet-list-item-amount">{tx.amount}</div>
            <div
              className={`cabinet-list-item-status cabinet-list-item-status-${tx.status}`}
            >
              {tx.status.charAt(0).toUpperCase() + tx.status.slice(1)}
            </div>
          </div>
        </a>
      ))}
    />
  );
}

/**
 * Example 3: Card with Animated Content
 */
export function AnimatedContentCard({
  title,
  children,
  onAction
}: {
  title: string;
  children: React.ReactNode;
  onAction?: () => void;
}) {
  return (
    <AnimatedCard className="cabinet-card">
      <div className="cabinet-card-header">
        <h3 className="text-h3 cabinet-card-title">{title}</h3>
        {onAction && (
          <button
            onClick={onAction}
            className="cabinet-card-action text-primary"
          >
            Edit
          </button>
        )}
      </div>
      <motion.div
        variants={slideUpVariant}
        initial="hidden"
        animate="visible"
      >
        {children}
      </motion.div>
    </AnimatedCard>
  );
}

/**
 * Example 4: Modal with Full Theming
 */
export function ConfirmModal({
  title,
  description,
  isOpen,
  onConfirm,
  onCancel
}: {
  title: string;
  description: string;
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 bg-black/50 z-50 flex items-end"
          onClick={onCancel}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            variants={slideUpVariant}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="cabinet-card w-full rounded-t-3xl max-w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="space-y-lg">
              {/* Title auto-themed: dark in light mode, light in dark mode */}
              <h2 className="text-h2">{title}</h2>
              
              {/* Description auto-themed secondary text color */}
              <p className="text-body text-secondary">{description}</p>

              {/* Button group with animations */}
              <div className="flex gap-md pt-lg">
                <motion.button
                  className="cabinet-button cabinet-button-secondary flex-1"
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={onCancel}
                >
                  Cancel
                </motion.button>
                <motion.button
                  className="cabinet-button cabinet-button-primary flex-1"
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={onConfirm}
                >
                  Confirm
                </motion.button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/**
 * Example 5: Form with Animated Fields
 */
export function AnimatedForm({
  onSubmit,
  loading = false
}: {
  onSubmit: (formData: FormData) => Promise<void>;
  loading?: boolean;
}) {
  return (
    <form className="cabinet-form" onSubmit={(e) => {
      e.preventDefault();
      onSubmit(new FormData(e.currentTarget));
    }}>
      {/* Each form group animates in sequence */}
      <motion.div
        className="cabinet-form-group"
        variants={slideUpVariant}
        initial="hidden"
        animate="visible"
      >
        <label className="cabinet-form-label">Email</label>
        <input
          type="email"
          name="email"
          className="cabinet-form-input"
          placeholder="your@email.com"
          disabled={loading}
        />
      </motion.div>

      <motion.div
        className="cabinet-form-group"
        variants={slideUpVariant}
        initial="hidden"
        animate="visible"
        transition={{ delay: 0.1 }}
      >
        <label className="cabinet-form-label">Message</label>
        <textarea
          name="message"
          className="cabinet-form-textarea"
          placeholder="Your message here..."
          disabled={loading}
        />
      </motion.div>

      {/* Submit button with loading state */}
      <AnimatedButton
        className={`cabinet-button cabinet-button-primary w-full ${
          loading ? 'opacity-50' : ''
        }`}
        disabled={loading}
      >
        {loading ? (
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 1 }}
          >
            ⏳
          </motion.div>
        ) : (
          'Submit'
        )}
      </AnimatedButton>
    </form>
  );
}

/**
 * Example 6: Full Page with Theme Support
 */
export function MyCabinetPageExample() {
  return (
    <PageTransitionWrapper>
      <div className="mycabinet-container">
        <div className="mycabinet-main">
          {/* All of these automatically respect light/dark theme */}
          
          <AnimatedSection title="Balance">
            <AnimatedCard className="payment-card">
              <div className="payment-card-content">
                <div className="payment-card-type">Account Balance</div>
                <div className="payment-card-number">$1,234.56</div>
                <div className="payment-card-holder">
                  <span>Available</span>
                  <span>Updated now</span>
                </div>
              </div>
            </AnimatedCard>
          </AnimatedSection>

          <AnimatedSection title="Recent Transactions">
            <TransactionList
              items={[
                {
                  id: '1',
                  title: 'Payment Received',
                  subtitle: '2 hours ago',
                  amount: '+$50.00',
                  status: 'completed'
                },
                {
                  id: '2',
                  title: 'Pending Transfer',
                  subtitle: 'Processing',
                  amount: '-$100.00',
                  status: 'pending'
                }
              ]}
            />
          </AnimatedSection>

          <AnimatedContentCard
            title="Quick Actions"
            onAction={() => console.log('Edit')}
          >
            <div className="space-y-md">
              <AnimatedButton className="cabinet-button cabinet-button-primary w-full">
                Deposit Funds
              </AnimatedButton>
              <AnimatedButton className="cabinet-button cabinet-button-secondary w-full">
                Create Invoice
              </AnimatedButton>
            </div>
          </AnimatedContentCard>
        </div>
      </div>
    </PageTransitionWrapper>
  );
}

export default MyCabinetPageExample;
