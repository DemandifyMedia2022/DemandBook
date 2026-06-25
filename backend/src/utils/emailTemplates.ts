export const getInvoiceEmailTemplate = (invoiceData: any) => {
    return `
    <html>
        <body style="font-family: Arial, sans-serif; color: #333;">
            <h2>Invoice ${invoiceData.number}</h2>
            <p>Dear Customer,</p>
            <p>Please find your invoice attached for the amount of ${invoiceData.currency} ${invoiceData.amount}.</p>
            <p>Due Date: ${invoiceData.due_date}</p>
            <br/>
            <p>Thank you for your business!</p>
        </body>
    </html>
    `;
};

export const getPaymentReminderTemplate = (invoiceData: any) => {
    return `
    <html>
        <body style="font-family: Arial, sans-serif; color: #333;">
            <h2>Payment Reminder: Invoice ${invoiceData.number}</h2>
            <p>Dear Customer,</p>
            <p>This is a reminder that your invoice for ${invoiceData.currency} ${invoiceData.amount} is due on ${invoiceData.due_date}.</p>
            <p>Please arrange payment at your earliest convenience.</p>
            <br/>
            <p>Thank you!</p>
        </body>
    </html>
    `;
};
