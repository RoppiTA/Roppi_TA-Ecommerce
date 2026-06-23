export type QuoteStatus = 'pendiente' | 'en_revision' | 'aceptada' | 'rechazada';

export interface Quote {
  id: number;
  code: string;
  clientName: string;
  dateRequested: string;
  expiryDate: string;
  totalAmount: number;
  status: QuoteStatus;
}
