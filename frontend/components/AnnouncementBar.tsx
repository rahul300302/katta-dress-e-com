'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Truck } from 'lucide-react';
import api from '@/services/api';

const DEFAULT_TEXT = "Free shipping on orders above ₹1500 · Premium men's tees only";

export default function AnnouncementBar() {
  const [text, setText] = useState(DEFAULT_TEXT);

  useEffect(() => {
    api
      .get('/site/announcement')
      .then((res) => {
        if (res.data.success && res.data.data?.text) {
          setText(res.data.data.text);
        }
      })
      .catch(() => {});
  }, []);

  const line = (
    <span className="inline-flex shrink-0 items-center gap-2 px-8">
      <Truck className="h-3.5 w-3.5 shrink-0" />
      {text}
    </span>
  );

  return (
    <motion.div
      initial={{ y: -40, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="overflow-hidden bg-store-text py-2 text-xs font-medium tracking-wide text-store-bg sm:text-sm"
    >
      <div className="flex w-max animate-marquee">
        {line}
        {line}
        {line}
        {line}
      </div>
    </motion.div>
  );
}
