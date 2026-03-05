// Invoice Generation Service
import { INVOICE_CONFIG } from './payment-config';
import { GSTCalculator } from './gst-calculator';

// PDF generation disabled for now
// pdfmake setup removed

interface InvoiceItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  category: string;
  total: number;
}

interface CustomerInfo {
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
}

interface InvoiceData {
  orderId: string;
  orderDate: string;
  customer: CustomerInfo;
  items: InvoiceItem[];
  subtotal: number;
  deliveryCharges: number;
  gstAmount: number;
  totalAmount: number;
  paymentMethod: string;
  paymentId?: string;
}

export class InvoiceGenerator {
  static generateInvoiceNumber(): string {
    const date = new Date();
    const year = date.getFullYear().toString().substr(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    
    return `TH-${year}${month}${day}-${random}`;
  }

  static formatDate(date: Date): string {
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }
}