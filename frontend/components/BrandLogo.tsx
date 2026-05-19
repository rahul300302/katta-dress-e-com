import Image from 'next/image';
import Link from 'next/link';
import { BRAND } from '@/lib/constants';

const sizes = {
  sm: { box: 'h-8 w-8', text: 'text-lg', gap: 'gap-2' },
  md: { box: 'h-10 w-10', text: 'text-2xl', gap: 'gap-2.5' },
  lg: { box: 'h-14 w-14', text: 'text-3xl', gap: 'gap-3' },
  xl: { box: 'h-20 w-20', text: 'text-3xl', gap: 'gap-4' },
} as const;

type BrandLogoProps = {
  showName?: boolean;
  size?: keyof typeof sizes;
  className?: string;
  href?: string | null;
  priority?: boolean;
};

export default function BrandLogo({
  showName = true,
  size = 'md',
  className = '',
  href = '/',
  priority = false,
}: BrandLogoProps) {
  const s = sizes[size];

  const content = (
    <span className={`inline-flex items-center ${s.gap} ${className}`}>
      <span
        className={`relative ${s.box} shrink-0 overflow-hidden rounded-lg bg-[#0a0a0a] ring-1 ring-black/10`}
      >
        <Image
          src={BRAND.logo}
          alt={`${BRAND.name} logo`}
          fill
          className="object-cover"
          sizes="80px"
          priority={priority}
        />
      </span>
      {showName && (
        <span className={`font-display font-black tracking-tighter text-store-text ${s.text}`}>
          {BRAND.name}
        </span>
      )}
    </span>
  );

  if (href) {
    return (
      <Link href={href} className="transition-opacity hover:opacity-90">
        {content}
      </Link>
    );
  }

  return content;
}
