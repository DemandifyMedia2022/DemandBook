"use client";

import { useState } from "react";
import { Modal, FormField, inputCls, selectCls } from "@/components/ui/page-shell";
import { User } from "./user-table";

interface InviteUserModalProps {
  onClose: () => void;
  onInvite: (newUser: Omit<User, "id" | "initials" | "status" | "lastActivity">) => void;
}

export function InviteUserModal({ onClose, onInvite }: InviteUserModalProps) {
  const [inviteName, setInviteName] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<User["role"]>("Staff");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteName || !inviteEmail) return;

    onInvite({
      name: inviteName,
      email: inviteEmail,
      role: inviteRole,
    });
  };

  return (
    <Modal title="Invite New User" onClose={onClose}>
      <form onSubmit={handleSubmit} className="p-6 space-y-4">
        <FormField label="Full Name">
          <input className={inputCls} required placeholder="e.g. John Doe" value={inviteName} onChange={(e) => setInviteName(e.target.value)} />
        </FormField>
        <FormField label="Email Address">
          <input type="email" className={inputCls} required placeholder="john@demandbooks.io" value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} />
        </FormField>
        <FormField label="Select Role">
          <select className={selectCls} value={inviteRole} onChange={(e) => setInviteRole(e.target.value as User["role"])}>
            <option value="Staff">Staff Member</option>
            <option value="Accountant">Accountant</option>
            <option value="Admin">Administrator</option>
          </select>
        </FormField>
        <div className="pt-4 border-t border-outline-variant flex justify-end gap-3">
          <button type="button" onClick={onClose} className="px-4 py-2 border border-outline-variant rounded-lg text-sm font-semibold text-on-surface-variant hover:bg-surface-container transition-colors">Cancel</button>
          <button type="submit" className="px-4 py-2 bg-primary text-on-primary rounded-lg text-sm font-bold hover:bg-primary/90 transition-colors">Send Invite</button>
        </div>
      </form>
    </Modal>
  );
}
