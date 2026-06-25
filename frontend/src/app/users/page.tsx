"use client";

import { useState } from "react";
import { PageHeader, StatCard } from "@/components/ui/page-shell";
import { User, UserTable } from "@/components/users/user-table";
import { InviteUserModal } from "@/components/users/invite-user-modal";

const initialUsers: User[] = [
  { id: "usr-1", name: "Sarah Mitchell", email: "sarah.m@demandbooks.io", initials: "SM", role: "Admin", status: "Active", lastActivity: "2 mins ago" },
  { id: "usr-2", name: "Robert Kincaid", email: "robert.k@demandbooks.io", initials: "RK", role: "Accountant", status: "Active", lastActivity: "1 hour ago" },
  { id: "usr-3", name: "Amanda Lee", email: "a.lee@demandbooks.io", initials: "AL", role: "Staff", status: "Pending", lastActivity: "Invited: Oct 24" },
  { id: "usr-4", name: "David Byrne", email: "d.byrne@demandbooks.io", initials: "DB", role: "Accountant", status: "Active", lastActivity: "Yesterday" },
];

export default function UserManagement() {
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [showInviteModal, setShowInviteModal] = useState(false);

  const handleInviteUser = (newUser: Omit<User, "id" | "initials" | "status" | "lastActivity">) => {
    const initials = newUser.name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .substring(0, 2)
      .toUpperCase();

    const createdUser: User = {
      id: "usr-" + String(users.length + 1),
      name: newUser.name,
      email: newUser.email,
      initials: initials || "US",
      role: newUser.role,
      status: "Pending",
      lastActivity: "Just invited",
    };

    setUsers([createdUser, ...users]);
    setShowInviteModal(false);
  };

  const handleRemoveUser = (id: string) => {
    if (confirm("Are you sure you want to remove this user?")) {
      setUsers(users.filter((u) => u.id !== id));
    }
  };

  const activeCount = users.filter((u) => u.status === "Active").length;
  const pendingCount = users.filter((u) => u.status === "Pending").length;

  return (
    <div className="p-6 max-w-[1440px] mx-auto space-y-6">
      <PageHeader
        title="User Management"
        subtitle="Manage your team members, roles, and system access permissions."
        actions={
          <button
            onClick={() => setShowInviteModal(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-primary text-on-primary rounded-lg font-bold text-xs hover:bg-primary/90 transition-all active:scale-95 shadow-sm"
          >
            <span className="material-symbols-outlined text-[17px]">person_add</span>
            Invite User
          </button>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard label="Total Team Members" value={String(users.length + 8)} icon="group" trend={{ label: "+2 this month", up: true }} />
        <StatCard label="Active Now" value={String(activeCount)} icon="person_check" trend={{ label: "Currently online", up: true }} />
        <StatCard label="Pending Invites" value={String(pendingCount + 2)} icon="schedule_send" trend={{ label: "Awaiting acceptance", up: null }} />
      </div>

      {/* Team Table */}
      <UserTable users={users} onRemoveUser={handleRemoveUser} />

      {/* Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-surface-container border border-outline-variant p-5 rounded-xl flex flex-col gap-3">
          <span className="material-symbols-outlined text-primary text-[28px]" style={{ fontVariationSettings: "'FILL' 1" }}>security</span>
          <h3 className="font-bold text-sm text-on-surface">Role Definitions</h3>
          <p className="text-xs text-on-surface-variant leading-relaxed">Administrators have full access to billing, user management, and ledger configurations.</p>
          <button className="text-primary text-xs font-semibold flex items-center gap-1 hover:underline mt-auto">
            Manage Permissions <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
          </button>
        </div>
        <div className="bg-surface-container border border-outline-variant p-5 rounded-xl flex flex-col gap-3">
          <span className="material-symbols-outlined text-secondary text-[28px]" style={{ fontVariationSettings: "'FILL' 1" }}>history</span>
          <h3 className="font-bold text-sm text-on-surface">Audit Trail</h3>
          <p className="text-xs text-on-surface-variant leading-relaxed">Track user activities, login timestamps, and critical data changes across the system.</p>
          <button className="text-primary text-xs font-semibold flex items-center gap-1 hover:underline mt-auto">
            View Logs <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
          </button>
        </div>
        <div className="bg-primary text-on-primary p-5 rounded-xl flex flex-col gap-3 shadow-lg">
          <span className="material-symbols-outlined text-on-primary text-[28px]" style={{ fontVariationSettings: "'FILL' 1" }}>mail</span>
          <h3 className="font-bold text-sm">Invitation Portal</h3>
          <p className="text-on-primary/80 text-xs leading-relaxed">Send bulk invites to your accounting team or external auditors with custom expiry dates.</p>
          <button className="bg-white text-primary px-4 py-2 rounded-lg font-bold text-xs w-fit hover:bg-opacity-90 transition-all mt-auto">
            Bulk Invite
          </button>
        </div>
      </div>

      {showInviteModal && (
        <InviteUserModal
          onClose={() => setShowInviteModal(false)}
          onInvite={handleInviteUser}
        />
      )}
    </div>
  );
}
