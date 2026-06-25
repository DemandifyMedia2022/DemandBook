"use client";

import { cn } from "@/lib/utils";

export interface FavoriteReport {
  id: string;
  name: string;
  category: string;
  icon: string;
  colorClass: string;
}

interface FavoriteReportsProps {
  favorites: FavoriteReport[];
}

export function FavoriteReports({ favorites }: FavoriteReportsProps) {
  return (
    <div className="lg:col-span-1 bg-card border border-border rounded-xl p-6 flex flex-col justify-between shadow-sm">
      <div>
        <h3 className="font-headline-sm text-headline-sm flex items-center gap-2 mb-4">
          <span className="material-symbols-outlined text-primary font-variation-settings: 'FILL' 1;">
            star
          </span>{" "}
          Favorites
        </h3>
        <div className="space-y-3">
          {favorites.map((fav) => (
            <div
              key={fav.id}
              className="flex items-center justify-between p-3.5 rounded-lg bg-card-container-lowest border border-border hover:border-primary transition-all cursor-pointer group"
            >
              <div className="flex items-center gap-3">
                <span className={cn("material-symbols-outlined", fav.colorClass)}>
                  {fav.icon}
                </span>
                <div>
                  <p className="font-bold text-sm text-foreground">{fav.name}</p>
                  <p className="text-xs text-muted-foreground">{fav.category}</p>
                </div>
              </div>
              <span className="material-symbols-outlined text-outline-variant group-hover:text-primary transition-colors">
                chevron_right
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
