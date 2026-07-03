import { Request, Response } from 'express';
import { quoteService } from './service';

export const list = async (req: Request, res: Response) => {
  try {
    const filters = {
      status: req.query.status !== 'All' ? req.query.status : undefined,
      search: req.query.q || undefined,
      client_id: req.query.client_id || undefined,
    };

    const limit = parseInt((req.query.limit as string) || '10');
    const offset = parseInt((req.query.offset as string) || '0');

    const result = await quoteService.getQuotes(filters, limit, offset);
    return res.status(200).json({ success: true, quotes: result.data, total: result.total });
  } catch (error) {
    console.error('Failed to list quotes:', error);
    return res.status(500).json({ success: false, message: 'Database error listing quotes.' });
  }
};

export const create = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id || 1;
    const quote = await quoteService.createQuote(req.body, userId);
    return res.status(201).json({ success: true, quote });
  } catch (error: any) {
    console.error('Failed to create quote:', error);
    if (error.code === '23505') {
      return res.status(409).json({ success: false, message: 'A quote with this number already exists.' });
    }
    return res.status(500).json({ success: false, message: 'Database error creating quote.' });
  }
};

export const getDetails = async (req: Request, res: Response) => {
  try {
    const quote = await quoteService.getQuoteDetails(parseInt(req.params.id));
    if (!quote) return res.status(404).json({ success: false, message: 'Quote not found' });
    return res.status(200).json({ success: true, quote });
  } catch (error) {
    console.error('Failed to get quote:', error);
    return res.status(500).json({ success: false, message: 'Error retrieving quote details' });
  }
};

export const update = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id || 1;
    const quote = await quoteService.updateQuote(parseInt(req.params.id), req.body, userId);
    return res.status(200).json({ success: true, quote });
  } catch (error) {
    console.error('Failed to update quote:', error);
    return res.status(500).json({ success: false, message: 'Error updating quote' });
  }
};

export const deleteQuote = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id || 1;
    await quoteService.deleteQuote(parseInt(req.params.id), userId);
    return res.status(200).json({ success: true, message: 'Quote deleted successfully' });
  } catch (error) {
    console.error('Failed to delete quote:', error);
    return res.status(500).json({ success: false, message: 'Error deleting quote' });
  }
};

export const updateStatus = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id || 1;
    const { status } = req.body;
    if (!status) {
      return res.status(400).json({ success: false, message: 'Status is required' });
    }
    const quote = await quoteService.updateStatus(parseInt(req.params.id), status, userId);
    return res.status(200).json({ success: true, quote });
  } catch (error) {
    console.error('Failed to update quote status:', error);
    return res.status(500).json({ success: false, message: 'Error updating quote status' });
  }
};