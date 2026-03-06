import PdfPrinter from 'pdfmake';
import { INVOICE_CONFIG } from './payment-config';

// Standard fonts for pdfmake in node without loading external files
const fonts = {
  Helvetica: {
    normal: 'Helvetica',
    bold: 'Helvetica-Bold',
    italics: 'Helvetica-Oblique',
    bolditalics: 'Helvetica-BoldOblique'
  }
};

interface InvoiceItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  category?: string;
}

interface CustomerInfo {
  name: string;
  email: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
}

export interface InvoiceData {
  orderId: string;
  orderDate: Date;
  customer: CustomerInfo;
  items: InvoiceItem[];
  subtotal: number;
  deliveryCharges: number;
  gstAmount: number;
  totalAmount: number;
  paymentMethod: string;
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

  static async generateInvoicePDF(data: InvoiceData): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      try {
        const printer = new PdfPrinter(fonts);
        const invoiceNumber = this.generateInvoiceNumber();

        // Build items table
        const tableBody = [
          [
            { text: 'Item', style: 'tableHeader' },
            { text: 'Qty', style: 'tableHeader', alignment: 'center' },
            { text: 'Price (₹)', style: 'tableHeader', alignment: 'right' },
            { text: 'Total (₹)', style: 'tableHeader', alignment: 'right' }
          ]
        ];

        data.items.forEach(item => {
          tableBody.push([
            { text: item.name, style: 'tableBody' },
            { text: item.quantity.toString(), style: 'tableBody', alignment: 'center' },
            { text: item.price.toFixed(2), style: 'tableBody', alignment: 'right' },
            { text: (item.price * item.quantity).toFixed(2), style: 'tableBody', alignment: 'right' }
          ] as any);
        });

        const docDefinition: any = {
          defaultStyle: {
            font: 'Helvetica'
          },
          content: [
            {
              columns: [
                {
                  text: INVOICE_CONFIG.COMPANY_NAME + '\nInvoice',
                  style: 'header'
                },
                {
                  text: [
                    { text: `Invoice No: ${invoiceNumber}\n`, bold: true },
                    `Order ID: ${data.orderId}\n`,
                    `Date: ${this.formatDate(data.orderDate)}\n`,
                    `Payment Method: ${data.paymentMethod.toUpperCase()}`
                  ],
                  alignment: 'right'
                }
              ]
            },
            {
              text: '\n'
            },
            {
              columns: [
                {
                  text: [
                    { text: 'From:\n', bold: true },
                    `${INVOICE_CONFIG.COMPANY_NAME}\n`,
                    `${INVOICE_CONFIG.COMPANY_ADDRESS}\n`,
                    `Email: ${INVOICE_CONFIG.COMPANY_EMAIL}\n`,
                    `Phone: ${INVOICE_CONFIG.COMPANY_PHONE}\n`,
                    `GSTIN: ${INVOICE_CONFIG.GST_NUMBER}`
                  ]
                },
                {
                  text: [
                    { text: 'Bill To:\n', bold: true },
                    `${data.customer.name}\n`,
                    `${data.customer.address || ''}\n`,
                    `${data.customer.city || ''}, ${data.customer.state || ''} ${data.customer.zipCode || ''}\n`,
                    `Phone: ${data.customer.phone || ''}\n`,
                    `Email: ${data.customer.email}`
                  ],
                  alignment: 'right'
                }
              ]
            },
            {
              text: '\n\n'
            },
            {
              table: {
                headerRows: 1,
                widths: ['*', 'auto', 'auto', 'auto'],
                body: tableBody
              },
              layout: 'lightHorizontalLines'
            },
            {
              text: '\n'
            },
            {
              columns: [
                { text: '' },
                {
                  table: {
                    widths: ['*', 'auto'],
                    body: [
                      ['Subtotal:', `₹${data.subtotal.toFixed(2)}`],
                      ['Delivery Charges:', `₹${data.deliveryCharges.toFixed(2)}`],
                      ['GST (18% included or added based on config):', `₹${data.gstAmount.toFixed(2)}`],
                      [{ text: 'Grand Total:', bold: true }, { text: `₹${data.totalAmount.toFixed(2)}`, bold: true }]
                    ]
                  },
                  layout: 'noBorders',
                  alignment: 'right'
                }
              ]
            },
            {
              text: '\n\nThank you for choosing Thulira Sustainable Products!',
              alignment: 'center',
              italics: true
            }
          ],
          styles: {
            header: {
              fontSize: 22,
              bold: true,
              color: '#2d5a3d'
            },
            tableHeader: {
              bold: true,
              fontSize: 12,
              color: 'black'
            },
            tableBody: {
              fontSize: 11
            }
          }
        };

        const pdfDoc = printer.createPdfKitDocument(docDefinition);
        const chunks: Buffer[] = [];

        pdfDoc.on('data', (chunk) => {
          chunks.push(chunk);
        });

        pdfDoc.on('end', () => {
          const result = Buffer.concat(chunks);
          resolve(result);
        });

        pdfDoc.on('error', (err) => {
          reject(err);
        });

        pdfDoc.end();
      } catch (error) {
        reject(error);
      }
    });
  }
}