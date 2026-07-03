import { pool } from '../../db';
import { quoteRepository } from './repository';

export const quoteService = {
    async createQuote(data: any, userId: number) {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            // Calculate totals from line items
            let sub_total = 0;
            let tax_total = 0;
            let discount_total = 0;

            if (data.items && Array.isArray(data.items)) {
                data.items.forEach((item: any) => {
                    const base = item.quantity * item.rate;
                    const lineDiscountAmt = base * ((item.discount_pct || 0) / 100);
                    const afterDiscount = base - lineDiscountAmt;
                    const taxAmt = afterDiscount * ((item.tax_rate || 0) / 100);

                    sub_total += base;
                    discount_total += lineDiscountAmt;
                    tax_total += taxAmt;
                    item.amount = afterDiscount + taxAmt;
                });
            }

            data.sub_total = sub_total;
            data.tax_total = tax_total;
            data.discount_total = discount_total;
            data.amount =
                sub_total - discount_total + tax_total +
                (data.shipping_charges || 0) + (data.round_off || 0);
            data.status = data.status || 'Draft';

            // Auto-generate quote number if not provided
            if (!data.quote_number) {
                const rand = Math.floor(1000 + Math.random() * 9000);
                data.quote_number = `QUO-${new Date().getFullYear()}-${rand}`;
            }

            // Create Quote
            const quote = await quoteRepository.createQuote(data, client);

            // Create Items
            if (data.items && data.items.length > 0) {
                await quoteRepository.createQuoteItems(quote.id, data.items, client);
            }

            // Log Activity
            await quoteRepository.logActivity(quote.id, userId, 'Created', 'Quote created successfully', client);

            await client.query('COMMIT');
            return this.getQuoteDetails(quote.id);
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    },

    async updateQuote(id: number, data: any, userId: number) {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            const existing = await quoteRepository.getQuoteById(id);
            if (!existing) throw new Error('Quote not found');

            let sub_total = 0;
            let tax_total = 0;
            let discount_total = 0;

            if (data.items && Array.isArray(data.items)) {
                data.items.forEach((item: any) => {
                    const base = item.quantity * item.rate;
                    const lineDiscountAmt = base * ((item.discount_pct || 0) / 100);
                    const afterDiscount = base - lineDiscountAmt;
                    const taxAmt = afterDiscount * ((item.tax_rate || 0) / 100);

                    sub_total += base;
                    discount_total += lineDiscountAmt;
                    tax_total += taxAmt;
                    item.amount = afterDiscount + taxAmt;
                });
            }

            data.sub_total = sub_total;
            data.tax_total = tax_total;
            data.discount_total = discount_total;
            data.amount =
                sub_total - discount_total + tax_total +
                (data.shipping_charges || 0) + (data.round_off || 0);

            const { items, ...quoteData } = data;

            // Sanitize empty dates
            if (quoteData.quote_date === '') quoteData.quote_date = null;
            if (quoteData.expiry_date === '') quoteData.expiry_date = null;

            // Update quote
            await quoteRepository.updateQuote(id, quoteData, client);

            // Replace items
            if (items) {
                await quoteRepository.deleteQuoteItems(id, client);
                if (items.length > 0) {
                    await quoteRepository.createQuoteItems(id, items, client);
                }
            }

            // Log Activity
            await quoteRepository.logActivity(id, userId, 'Updated', 'Quote updated', client);

            await client.query('COMMIT');
            return this.getQuoteDetails(id);
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    },

    async getQuotes(filters: any, limit: number, offset: number) {
        return await quoteRepository.getQuotes(filters, limit, offset);
    },

    async getQuoteDetails(id: number) {
        const quote = await quoteRepository.getQuoteById(id);
        if (!quote) return null;

        const items = await quoteRepository.getQuoteItems(id);
        const activity = await quoteRepository.getActivityLogs(id);

        return {
            ...quote,
            items,
            activity,
        };
    },

    async deleteQuote(id: number, userId: number) {
        const quote = await quoteRepository.deleteQuote(id);
        await quoteRepository.logActivity(id, userId, 'Deleted', 'Quote moved to trash');
        return quote;
    },

    async updateStatus(id: number, status: string, userId: number) {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');
            const quote = await quoteRepository.updateQuote(id, { status }, client);
            await quoteRepository.logActivity(id, userId, 'Status Changed', `Status changed to ${status}`, client);
            await client.query('COMMIT');
            return this.getQuoteDetails(id);
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    },
};