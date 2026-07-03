import { pool } from '../../db';
import { recurringInvoiceRepository } from './repository';
import { invoiceRepository } from '../invoices/repository';

function nextCustomId(prefix: string, lastNum: number) {
    return `${prefix}-${String(lastNum + 1).padStart(4, '0')}`;
}

function advanceDate(current: Date, frequency: string, intervalCount: number): Date {
    const d = new Date(current);
    switch (frequency) {
        case 'Daily': d.setDate(d.getDate() + intervalCount); break;
        case 'Weekly': d.setDate(d.getDate() + intervalCount * 7); break;
        case 'Monthly': d.setMonth(d.getMonth() + intervalCount); break;
        case 'Yearly': d.setFullYear(d.getFullYear() + intervalCount); break;
    }
    return d;
}

export const recurringInvoiceService = {
    async createProfile(data: any, userId: number) {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            // Auto-create or find client if client_id is missing (mirrors invoiceService.createInvoice)
            if (!data.client_id && data.customerName) {
                const cRes = await client.query('SELECT id FROM clients WHERE email = $1 OR name = $2 LIMIT 1', [data.customerEmail || '', data.customerName]);
                if (cRes.rows.length > 0) {
                    data.client_id = cRes.rows[0].id;
                } else {
                    const customId = `CUST-${Math.floor(1000 + Math.random() * 9000)}`;
                    const cIns = await client.query('INSERT INTO clients (custom_id, name, email, type) VALUES ($1, $2, $3, $4) RETURNING id', [customId, data.customerName, data.customerEmail || null, 'customer']);
                    data.client_id = cIns.rows[0].id;
                }
            }

            let sub_total = 0, tax_total = 0, discount_total = 0;
            if (data.items && Array.isArray(data.items)) {
                data.items.forEach((item: any) => {
                    const amount = (item.quantity * item.rate) - (item.discount || 0);
                    sub_total += item.quantity * item.rate;
                    discount_total += item.discount || 0;
                    tax_total += item.tax_amount || 0;
                    item.amount = amount + (item.tax_amount || 0);
                });
            }
            data.sub_total = sub_total;
            data.tax_total = tax_total;
            data.discount_total = discount_total;
            data.amount = sub_total - discount_total + tax_total + (data.shipping_charges || 0) + (data.round_off || 0);

            if (!data.custom_id) {
                const countRes = await client.query(`SELECT COUNT(*) FROM recurring_invoices`);
                data.custom_id = nextCustomId('REC', parseInt(countRes.rows[0].count));
            }

            data.next_generation_date = data.next_generation_date || data.start_date;
            data.status = data.status || 'Active';

            const profile = await recurringInvoiceRepository.createProfile(data, client);

            if (data.items && data.items.length > 0) {
                await recurringInvoiceRepository.createItems(profile.id, data.items, client);
            }

            await recurringInvoiceRepository.logActivity(profile.id, userId, 'Created', 'Recurring profile created', client);

            await client.query('COMMIT');
            return this.getProfileDetails(profile.id);
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    },

    async updateProfile(id: number, data: any, userId: number) {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            const existing = await recurringInvoiceRepository.getProfileById(id);
            if (!existing) throw new Error('Recurring profile not found');

            if (data.items && Array.isArray(data.items)) {
                let sub_total = 0, tax_total = 0, discount_total = 0;
                data.items.forEach((item: any) => {
                    const amount = (item.quantity * item.rate) - (item.discount || 0);
                    sub_total += item.quantity * item.rate;
                    discount_total += item.discount || 0;
                    tax_total += item.tax_amount || 0;
                    item.amount = amount + (item.tax_amount || 0);
                });
                data.sub_total = sub_total;
                data.tax_total = tax_total;
                data.discount_total = discount_total;
                data.amount = sub_total - discount_total + tax_total + (data.shipping_charges ?? existing.shipping_charges) + (data.round_off ?? existing.round_off);
            }

            const { items, ...profileData } = data;
            await recurringInvoiceRepository.updateProfile(id, profileData, client);

            if (items) {
                await recurringInvoiceRepository.deleteItems(id, client);
                if (items.length > 0) await recurringInvoiceRepository.createItems(id, items, client);
            }

            await recurringInvoiceRepository.logActivity(id, userId, 'Updated', 'Recurring profile updated', client);

            await client.query('COMMIT');
            return this.getProfileDetails(id);
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    },

    async getProfiles(filters: any, limit: number, offset: number) {
        return await recurringInvoiceRepository.getProfiles(filters, limit, offset);
    },

    async getProfileDetails(id: number) {
        const profile = await recurringInvoiceRepository.getProfileById(id);
        if (!profile) return null;
        const items = await recurringInvoiceRepository.getItems(id);
        const childInvoices = await recurringInvoiceRepository.getChildInvoices(id);
        const activity = await recurringInvoiceRepository.getActivityLogs(id);
        const trend = await recurringInvoiceRepository.getTrend(id);
        return { ...profile, items, childCount: childInvoices.length, childInvoices, activity, trend };
    },

    async deleteProfile(id: number, userId: number) {
        const profile = await recurringInvoiceRepository.deleteProfile(id);
        await recurringInvoiceRepository.logActivity(id, userId, 'Deleted', 'Recurring profile deleted');
        return profile;
    },

    async pauseProfile(id: number, reason: string, userId: number) {
        const profile = await recurringInvoiceRepository.updateProfile(id, { status: 'On Hold', pause_reason: reason || null });
        await recurringInvoiceRepository.logActivity(id, userId, 'Paused', reason || 'Profile put on hold');
        return profile;
    },

    async resumeProfile(id: number, userId: number) {
        const profile = await recurringInvoiceRepository.updateProfile(id, { status: 'Active', pause_reason: null });
        await recurringInvoiceRepository.logActivity(id, userId, 'Resumed', 'Profile resumed');
        return profile;
    },

    // Generates one child invoice from a profile "right now", independent of schedule
    async generateNow(profileId: number, userId: number) {
        const profile = await recurringInvoiceRepository.getProfileById(profileId);
        if (!profile) throw new Error('Recurring profile not found');
        const items = await recurringInvoiceRepository.getItems(profileId);
        return this._createChildInvoice(profile, items, userId, { advanceSchedule: false });
    },

    // Core generator, used by generateNow() and the scheduled job
    async _createChildInvoice(profile: any, items: any[], userId: number, opts: { advanceSchedule: boolean }) {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            const today = new Date();
            const dueDate = new Date(today);
            dueDate.setDate(dueDate.getDate() + (profile.due_date_offset_days || 0));

            const countRes = await client.query(`SELECT COUNT(*) FROM invoices`);
            const number = `INV-${today.getFullYear()}-${String(1000 + parseInt(countRes.rows[0].count)).slice(-4)}`;

            const invoiceStatus = profile.creation_mode === 'AutoSend' ? 'Sent' : 'Draft';

            const invoice = await invoiceRepository.createInvoice({
                number,
                client_id: profile.client_id,
                invoice_date: today,
                due_date: dueDate,
                currency: profile.currency,
                payment_terms: profile.payment_terms,
                reference_number: profile.reference_number,
                sub_total: profile.sub_total,
                discount_total: profile.discount_total,
                tax_total: profile.tax_total,
                shipping_charges: profile.shipping_charges,
                round_off: profile.round_off,
                amount: profile.amount,
                balance: profile.amount,
                status: invoiceStatus,
                customer_notes: profile.customer_notes,
                terms_conditions: profile.terms_conditions,
                internal_notes: profile.internal_notes,
            }, client);

            await client.query(`UPDATE invoices SET recurring_invoice_id = $1 WHERE id = $2`, [profile.id, invoice.id]);

            if (items.length > 0) {
                await invoiceRepository.createInvoiceItems(invoice.id, items, client);
            }

            await invoiceRepository.logActivity(invoice.id, userId, 'Created', `Auto-generated from recurring profile ${profile.custom_id}`, client);
            await recurringInvoiceRepository.logActivity(profile.id, userId, 'Sent Now', `Generated invoice ${number}`, client);

            // Update the recurring profile's own bookkeeping
            const updates: any = {
                last_generated_at: today,
                occurrences_generated: (profile.occurrences_generated || 0) + 1,
            };

            if (opts.advanceSchedule) {
                const nextDate = advanceDate(today, profile.frequency, profile.interval_count);
                updates.next_generation_date = nextDate;

                const newOccurrenceCount = updates.occurrences_generated;

                if (profile.end_condition === 'OnDate' && profile.end_date && nextDate > new Date(profile.end_date)) {
                    updates.status = 'Expired';
                    updates.next_generation_date = null;
                } else if (profile.end_condition === 'AfterOccurrences' && profile.max_occurrences && newOccurrenceCount >= profile.max_occurrences) {
                    updates.status = 'Completed';
                    updates.next_generation_date = null;
                }
            }

            await recurringInvoiceRepository.updateProfile(profile.id, updates, client);

            await client.query('COMMIT');
            return invoice;
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    },

    // Called by the cron job — generates invoices for every profile due today or earlier
    async runScheduledGeneration() {
        const today = new Date().toISOString().split('T')[0];
        const dueProfiles = await recurringInvoiceRepository.getDueProfiles(today);

        const results = [];
        for (const profile of dueProfiles) {
            try {
                const items = await recurringInvoiceRepository.getItems(profile.id);
                const invoice = await this._createChildInvoice(profile, items, 1, { advanceSchedule: true });
                results.push({ profileId: profile.id, invoiceId: invoice.id, success: true });
            } catch (error: any) {
                console.error(`Failed to generate invoice for recurring profile ${profile.id}:`, error);
                results.push({ profileId: profile.id, success: false, error: error.message });
            }
        }
        return results;
    }
};