import { Request, Response } from 'express';
import { recurringInvoiceService } from './service';

export const list = async (req: Request, res: Response) => {
  try {
    const filters = {
      status: req.query.status !== 'All' ? req.query.status : undefined,
      frequency: req.query.frequency !== 'All' ? req.query.frequency : undefined,
      search: req.query.q || undefined,
    };
    const limit = parseInt((req.query.limit as string) || '20');
    const offset = parseInt((req.query.offset as string) || '0');

    const result = await recurringInvoiceService.getProfiles(filters, limit, offset);
    return res.status(200).json({ success: true, profiles: result.data, total: result.total });
  } catch (error) {
    console.error('Failed to list recurring invoices:', error);
    return res.status(500).json({ success: false, message: 'Database error listing recurring invoices.' });
  }
};

export const create = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id || 1;
    const profile = await recurringInvoiceService.createProfile(req.body, userId);
    return res.status(201).json({ success: true, profile });
  } catch (error) {
    console.error('Failed to create recurring profile:', error);
    return res.status(500).json({ success: false, message: 'Database error creating recurring profile.' });
  }
};

export const getDetails = async (req: Request, res: Response) => {
  try {
    const profile = await recurringInvoiceService.getProfileDetails(parseInt(req.params.id));
    if (!profile) return res.status(404).json({ success: false, message: 'Recurring profile not found' });
    return res.status(200).json({ success: true, profile });
  } catch (error) {
    console.error('Failed to get recurring profile:', error);
    return res.status(500).json({ success: false, message: 'Error retrieving recurring profile' });
  }
};

export const update = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id || 1;
    const profile = await recurringInvoiceService.updateProfile(parseInt(req.params.id), req.body, userId);
    return res.status(200).json({ success: true, profile });
  } catch (error) {
    console.error('Failed to update recurring profile:', error);
    return res.status(500).json({ success: false, message: 'Error updating recurring profile' });
  }
};
export const deleteProfile = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id || 1;
    await recurringInvoiceService.deleteProfile(parseInt(req.params.id), userId);
    return res.status(200).json({ success: true, message: 'Recurring profile deleted successfully' });
  } catch (error) {
    console.error('Failed to delete recurring profile:', error);
    return res.status(500).json({ success: false, message: 'Error deleting recurring profile' });
  }
};

export const pause = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id || 1;
    const profile = await recurringInvoiceService.pauseProfile(parseInt(req.params.id), req.body.reason, userId);
    return res.status(200).json({ success: true, profile });
  } catch (error) {
    console.error('Failed to pause recurring profile:', error);
    return res.status(500).json({ success: false, message: 'Error pausing recurring profile' });
  }
};

export const resume = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id || 1;
    const profile = await recurringInvoiceService.resumeProfile(parseInt(req.params.id), userId);
    return res.status(200).json({ success: true, profile });
  } catch (error) {
    console.error('Failed to resume recurring profile:', error);
    return res.status(500).json({ success: false, message: 'Error resuming recurring profile' });
  }
};

export const generateNow = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id || 1;
    const invoice = await recurringInvoiceService.generateNow(parseInt(req.params.id), userId);
    return res.status(201).json({ success: true, invoice });
  } catch (error: any) {
    console.error('Failed to generate invoice now:', error);
    return res.status(500).json({ success: false, message: error.message || 'Error generating invoice' });
  }
};