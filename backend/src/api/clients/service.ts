import { clientRepository } from './repository';

const ALLOWED_ROLES_FOR_WRITE = ['SUPER_ADMIN', 'ADMIN', 'ACCOUNTANT', 'SALES_EXECUTIVE'];

class ServiceError extends Error {
    status: number;
    constructor(message: string, status = 400) {
        super(message);
        this.status = status;
    }
}

function buildDisplayName(data: Record<string, any>): string {
    if (data.display_name) return data.display_name;
    if (data.customer_type === 'Business' && data.company_name) return data.company_name;
    const first = data.primary_contact_first_name || '';
    const last = data.primary_contact_last_name || '';
    const fullName = `${first} ${last}`.trim();
    return fullName || data.name;
}

export const clientService = {
    assertCanWrite: (role: string) => {
        if (!ALLOWED_ROLES_FOR_WRITE.includes(role)) {
            throw new ServiceError('You do not have permission to modify clients.', 403);
        }
    },

    list: async (filters: { type?: string; status?: string; q?: string }) => {
        return clientRepository.findAll(filters);
    },

    getById: async (id: number) => {
        const client = await clientRepository.findById(id);
        if (!client) throw new ServiceError('Client not found.', 404);

        if (client.type === 'customer') {
            const outstanding = await clientRepository.getOutstandingBalance(id);
            client.balance = outstanding;
        }
        return client;
    },

    create: async (payload: Record<string, any>) => {
        const { custom_id, name, email, type } = payload;
        if (!custom_id || !name || !email || !type) {
            throw new ServiceError('ID, Name, Email, and Type are required.');
        }

        const existing = await clientRepository.findByCustomId(custom_id);
        if (existing) {
            throw new ServiceError('A client with this ID already exists.', 409);
        }

        const data = {
            ...payload,
            email: email.toLowerCase(),
            phone: payload.phone || '—',
            status: payload.status || 'Active',
            balance: payload.balance ? parseFloat(payload.balance) : 0.0,
            currency: payload.currency || 'INR',
            display_name: buildDisplayName(payload),
        };

        return clientRepository.create(data);
    },

    update: async (id: number, payload: Record<string, any>) => {
        const existing = await clientRepository.findById(id);
        if (!existing) throw new ServiceError('Client not found.', 404);

        const data = { ...payload };
        if (data.email) data.email = data.email.toLowerCase();
        // Recompute display_name only if relevant fields changed and display_name wasn't explicitly set
        if (!data.display_name && (data.company_name || data.primary_contact_first_name || data.primary_contact_last_name)) {
            data.display_name = buildDisplayName({ ...existing, ...data });
        }
        // balance is computed, never accept it from the client payload
        delete data.balance;

        const updated = await clientRepository.update(id, data);
        if (!updated) throw new ServiceError('No fields to update.', 400);
        return updated;
    },

    remove: async (id: number) => {
        const existing = await clientRepository.findById(id);
        if (!existing) throw new ServiceError('Client not found.', 404);

        const hasOpen = await clientRepository.hasOpenTransactions(id);
        if (hasOpen) {
            throw new ServiceError(
                'Cannot delete a client with open invoices or bills. Mark them Inactive instead, or resolve outstanding transactions first.',
                409
            );
        }

        const deleted = await clientRepository.softDelete(id);
        return deleted;
    },

    summary: async () => {
        const counts = await clientRepository.getSummaryCounts();
        const totalReceivables = await clientRepository.getTotalReceivables();
        return {
            totalCount: parseInt(counts.total_count) || 0,
            activeCount: parseInt(counts.active_count) || 0,
            totalReceivables,
        };
    },
};

export { ServiceError };