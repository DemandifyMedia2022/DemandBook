"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import {
  SectionCard, SearchBar, Th, Td, TableRow, EmptyState,
} from "@/components/ui/page-shell";

export interface User {
  id: string;
  name: string;
  email: string;
  initials: string;
  role: "Admin" | "Accountant" | "Staff";
  status: "Active" | "Pending";
  lastActivity: string;
}

interface UserTableProps {
  users: User[];
  onRemoveUser: (id: string) => void;
}

const roleColors: Record<User["role"], string> = {
  Admin: "bg-primary/10 text-primary",
  Accountant: "bg-secondary/10 text-secondary",
  Staff: "bg-slate-100 text-slate-600",
};

const avatarColors = ["bg-primary text-primary-foreground", "bg-secondary text-secondary-foreground", "bg-amber-500 text-white", "bg-teal-600 text-white"];

export function UserTable({ users, onRemoveUser }: UserTableProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const filtered = users.filter((u) => {
    const q = searchQuery.toLowerCase();
    return u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q) || u.role.toLowerCase().includes(q);
  });

  return (
    <SectionCard
      title="Team Members"
      subtitle={`${filtered.length} members`}
      noPadding
      actions={<SearchBar value={searchQuery} onChange={setSearchQuery} placeholder="Search by name, email..." />}
    >
      <div className="overflow-x-auto">
        <table className="w-full min-w-[600px]">
          <thead>
            <tr>
              <Th>User</Th>
              <Th>Role</Th>
              <Th>Status</Th>
              <Th>Last Activity</Th>
              <Th>Actions</Th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((user, i) => (
              <TableRow key={user.id}>
                <Td>
                  <div className="flex items-center gap-3">
                    <div className={cn("w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold shrink-0", avatarColors[i % avatarColors.length])}>
                      {user.initials}
                    </div>
                    <div>
                      <p className="font-bold text-foreground text-sm">{user.name}</p>
                      <p className="text-[11px] text-muted-foreground">{user.email}</p>
                    </div>
                  </div>
                </Td>
                <Td>
                  <span className={cn("px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide", roleColors[user.role])}>
                    {user.role}
                  </span>
                </Td>
                <Td>
                  <span className={cn("inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold", user.status === "Active" ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700")}>
                    <span className={cn("w-1.5 h-1.5 rounded-full", user.status === "Active" ? "bg-green-600 animate-pulse" : "bg-amber-500")} />
                    {user.status}
                  </span>
                </Td>
                <Td className="text-muted-foreground text-xs">{user.lastActivity}</Td>
                <Td>
                  <div className="flex items-center gap-1">
                    <button className="p-1.5 rounded hover:bg-card-container text-muted-foreground hover:text-primary transition-colors" title="Edit">
                      <span className="material-symbols-outlined text-[16px]">edit</span>
                    </button>
                    <button
                      onClick={() => onRemoveUser(user.id)}
                      className="p-1.5 rounded hover:bg-card-container text-muted-foreground hover:text-destructive transition-colors"
                      title="Remove"
                    >
                      <span className="material-symbols-outlined text-[16px]">person_remove</span>
                    </button>
                  </div>
                </Td>
              </TableRow>
            ))}
            {filtered.length === 0 && <EmptyState icon="group" message="No users match the search." colSpan={5} />}
          </tbody>
        </table>
      </div>
    </SectionCard>
  );
}
