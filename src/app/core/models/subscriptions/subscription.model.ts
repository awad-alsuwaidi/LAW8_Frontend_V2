export interface Subscription {
  id: string;
  organizationId: string;
  productCode: string;
  status: 'Active' | 'Suspended' | 'Cancelled' | 'Pending';
  numberOfUsers: number;
  totalPrice: number;
  taxAmount: number;
  grandTotal: number;
  startDate: string;
  endDate: string;
}
