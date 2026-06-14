'use client';
// components/AccessoryOverlay.tsx
// Renders the equipped accessory positioned on top of the pet image.
// Usage: wrap your pet <Image> in a relative container, then render <AccessoryOverlay /> as a sibling.

import Image from 'next/image';
import { usePetStore, getAccessory } from '@/hooks/usePetStore';

export default function AccessoryOverlay({ size = 100 }: { size?: number }) {
  const { equippedAccessory } = usePetStore();
  const acc = getAccessory(equippedAccessory);
  if (!acc) return null;

  return (
    <div
      className="absolute pointer-events-none z-10"
      style={{
        top: acc.top,
        left: acc.left,
        width: acc.width,
        transform: 'translateX(-50%)',
      }}
    >
      <Image
        src={acc.image}
        alt={acc.name}
        width={size}
        height={size}
        className="w-full h-auto object-contain drop-shadow-md"
      />
    </div>
  );
}