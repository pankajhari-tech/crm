export interface ProductItem {
  id: string;
  name: string;
  quantity: number;
  productCost: number; // Unit selling price/cost charged to customer (in NPR)
  baseCost: number; // Unit base/wholesale cost to business for profit calculation (in NPR)
  totalProductCost: number; // quantity * productCost
  totalBaseCost: number; // quantity * baseCost
}

export interface CustomerOrder {
  id: string;
  orderNumber: string;
  customerId: string;
  date: string;
  products: ProductItem[];
  productCost: number; // Sum of items totalProductCost
  deliveryCharge: number; // Delivery fee charged to customer (in NPR)
  otherCharges: number; // packaging, service fees
  totalCost: number; // productCost + deliveryCharge + otherCharges
  customerPayment: number; // Total payments received for this order
  remainingPayment: number; // totalCost - customerPayment
  totalBaseCost: number; // Sum of items totalBaseCost
  deliveryActualCost?: number;
  profit: number; // Automatic profit calculation: totalCost - totalBaseCost
  deliveryLocationType?: 'Inside Valley (Kathmandu/Lalitpur/Bhaktapur)' | 'Outside Valley' | 'Store Pickup';
  deliveryCourier?: string; // Pathao, Nepal Can Move, InDrive, Sundar Courier, etc.
  notes?: string;
}

export type NepalPaymentMethod =
  | 'eSewa'
  | 'Khalti'
  | 'Fonepay / QR'
  | 'Cash on Delivery (COD)'
  | 'Bank Transfer (ConnectIPS)'
  | 'Cash'
  | 'Cheque'
  | 'Other';

export interface PaymentRecord {
  id: string;
  customerId: string;
  orderId?: string; // Optional reference to specific order
  amount: number;
  date: string;
  method: NepalPaymentMethod;
  reference?: string; // eSewa Ref, Fonepay Trace ID, Bank Voucher #
  note?: string;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  address: string;
  city?: string; // Kathmandu, Pokhara, Lalitpur, etc.
  panNumber?: string; // Optional PAN / VAT number for business clients in Nepal
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CustomerWithSummary extends Customer {
  ordersCount: number;
  productsCount: number;
  totalProductCost: number;
  totalDeliveryCharge: number;
  totalOtherCharges: number;
  totalCost: number;
  customerPayment: number;
  remainingPayment: number;
  profit: number;
  lastOrderDate?: string;
}

