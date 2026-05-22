'use client';

import { motion } from 'framer-motion';
import { ArrowDown, ArrowUp, Banknote } from 'lucide-react';
import Link from 'next/link';

interface QuickActionsProps {
  cardId: number;
}

export function QuickActions({ cardId }: QuickActionsProps) {
  const actions = [
    {
      label: 'ДЕПОЗИТ',
      icon: ArrowDown,
      href: '/mycabinet/deposit',
      color: 'from-green-400 to-emerald-500',
    },
    {
      label: 'ІНВОЙС',
      icon: Banknote,
      href: '/mycabinet/create-invoice',
      color: 'from-blue-400 to-cyan-500',
    },
    {
      label: 'ВИВЕСТИ',
      icon: ArrowUp,
      href: '/mycabinet/withdraw',
      color: 'from-purple-400 to-pink-500',
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.4,
        ease: [0.34, 1.56, 0.64, 1],
      },
    },
  };

  return (
    <motion.div
      className="grid grid-cols-3 gap-sm"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {actions.map((action, index) => {
        const Icon = action.icon;
        return (
          <motion.div key={index} variants={itemVariants}>
            <Link href={action.href}>
              <motion.button
                className="w-full aspect-square bg-gradient-to-br from-gray-900 to-black rounded-2xl flex flex-col items-center justify-center gap-2 text-white font-semibold text-xs transition-all shadow-lg hover:shadow-xl"
                whileHover={{ scale: 1.05, y: -4 }}
                whileTap={{ scale: 0.95 }}
              >
                <Icon className="w-6 h-6" />
                <span className="text-center px-1">{action.label}</span>
              </motion.button>
            </Link>
          </motion.div>
        );
      })}
    </motion.div>
  );
}
