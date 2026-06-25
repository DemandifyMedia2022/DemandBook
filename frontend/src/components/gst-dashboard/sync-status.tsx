"use client";

import Image from "next/image";

export function SyncStatus() {
  return (
    <div className="bg-surface-container p-6 rounded-xl text-center shadow-sm">
      <div className="mb-4 h-32 flex items-center justify-center relative">
        <Image
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuB57vcgIQD_yFzU76fIAg5Cr55hLjSvvByFhQRDkmi55F0M-6_hJCxLbIlHLjwwqE40_Y5n_fytuoxPb8NN9vOXddiF8k23IKC80QYt1uYfFTJLoez15BaAHvS7r95PrM3HHaaqJnHH6BpM2YalzWGgK1DTCu39mek8r8Ce-H6_kuC2M42gkuyYUP9c-ZtXOESHHnk_NIbtEsTSJ32S8Lg49wuA_JjK1-cawcLx4o_TCzc14Z4bS3wjaTookDnXpjJAU0YXSCbaQ4k"
          alt="GST Data Synchronized"
          width={120}
          height={120}
          className="object-contain"
        />
      </div>
      <h5 className="font-bold text-on-surface text-sm">Data is Synchronized</h5>
      <p className="text-xs text-on-surface-variant mt-2 leading-relaxed">
        Last portal fetch was 2 hours ago. Your books are 100% in sync with the GSTN database.
      </p>
    </div>
  );
}
