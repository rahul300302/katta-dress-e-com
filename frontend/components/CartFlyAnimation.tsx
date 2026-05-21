'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { useCartStore } from '@/store/cartStore';

export default function CartFlyAnimation() {
  const fly = useCartStore((s) => s.fly);
  const [target, setTarget] = useState<{ x: number; y: number } | null>(null);

  useEffect(() => {
    if (!fly) return;
    const el = document.getElementById('cart-nav-icon');
    if (el) {
      const r = el.getBoundingClientRect();
      setTarget({ x: r.left + r.width / 2, y: r.top + r.height / 2 });
    } else {
      setTarget({ x: window.innerWidth - 40, y: 32 });
    }
    const t = setTimeout(() => useCartStore.setState({ fly: null }), 700);
    return () => clearTimeout(t);
  }, [fly]);

  return (
    <AnimatePresence>
      {fly && target && (
        <motion.div
          className="pointer-events-none fixed z-[200] h-10 w-10 overflow-hidden rounded-full border-2 border-white bg-store-faint shadow-lg"
          initial={{ left: fly.x - 20, top: fly.y - 20, scale: 1, opacity: 1 }}
          animate={{
            left: target.x - 20,
            top: target.y - 20,
            scale: 0.35,
            opacity: 0.85,
          }}
          exit={{ opacity: 0, scale: 0 }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        >
          {fly.image ? (
            <Image src={fly.image} alt="" fill className="object-cover" sizes="40px" />
          ) : (
            <div className="h-full w-full bg-store-text" />
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
