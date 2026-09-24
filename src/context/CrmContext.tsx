import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react';
import { Customer, CustomerOrder, CustomerWithSummary, PaymentRecord, ProductItem, NepalPaymentMethod } from '../types/crm';
import { INITIAL_CUSTOMERS, INITIAL_ORDERS, INITIAL_PAYMENTS } from '../data/mockData';
import { calculateOrderProfit } from '../utils/formatters';

interface CrmContextType {
  customers: Customer[];
  orders: CustomerOrder[];
  payments: PaymentRecord[];
  selectedCustomerId: string | null;
  setSelectedCustomerId: (id: string | null) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  filterStatus: 'all' | 'pending' | 'paid';
  setFilterStatus: (status: 'all' | 'pending' | 'paid') => void;
  
  // Basic CRM Operations
  addCustomer: (data: {
    name: string;
    phone: string;
    address: string;
    city?: string;
    panNumber?: string;
    notes?: string;
  }) => Customer;
  updateCustomer: (
    id: string,
    data: {
      name: string;
      phone: string;
      address: string;
      city?: string;
      panNumber?: string;
      notes?: string;
    }
  ) => void;
  deleteCustomer: (id: string) => void;
  
  // Product / Order Operations
  addOrder: (data: {
    customerId: string;
    date: string;
    products: Omit<ProductItem, 'id' | 'totalProductCost' | 'totalBaseCost'>[];
    deliveryCharge: number;
    otherCharges: number;
    deliveryLocationType?: CustomerOrder['deliveryLocationType'];
    deliveryCourier?: string;
    notes?: string;
    initialPayment?: number;
    paymentMethod?: NepalPaymentMethod;
    paymentReference?: string;
  }) => CustomerOrder;
  updateOrder: (orderId: string, data: {
    date: string;
    products: Omit<ProductItem, 'id' | 'totalProductCost' | 'totalBaseCost'>[];
    deliveryCharge: number;
    otherCharges: number;
    deliveryLocationType?: CustomerOrder['deliveryLocationType'];
    deliveryCourier?: string;
    notes?: string;
  }) => void;
  deleteOrder: (orderId: string) => void;
  
  // Payment Operations
  recordPayment: (data: {
    customerId: string;
    orderId?: string;
    amount: number;
    date: string;
    method: NepalPaymentMethod;
    reference?: string;
    note?: string;
  }) => PaymentRecord;
  deletePayment: (paymentId: string) => void;
  
  // Aggregated Data Getters
  getCustomerOrders: (customerId: string) => CustomerOrder[];
  getCustomerPayments: (customerId: string) => PaymentRecord[];
  getCustomerWithSummary: (customerId: string) => CustomerWithSummary | null;
  
  // Computed Lists
  customersWithSummaries: CustomerWithSummary[];
  filteredCustomers: CustomerWithSummary[];
  overallMetrics: {
    totalCustomers: number;
    totalOrders: number;
    totalRevenue: number;
    totalPaid: number;
    totalRemaining: number;
    totalProfit: number;
    totalDeliveryCharges: number;
    totalProductSales: number;
  };
  
  // Data Management
  resetToDemoData: () => void;
  exportDataJson: () => string;
  importDataJson: (json: string) => boolean;
}

const STORAGE_KEYS = {
  CUSTOMERS: 'clientpulse_nepal_customers_v2',
  ORDERS: 'clientpulse_nepal_orders_v2',
  PAYMENTS: 'clientpulse_nepal_payments_v2',
};

const CrmContext = createContext<CrmContextType | undefined>(undefined);

export const CrmProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [customers, setCustomers] = useState<Customer[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CUSTOMERS);
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return INITIAL_CUSTOMERS;
  });

  const [orders, setOrders] = useState<CustomerOrder[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.ORDERS);
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return INITIAL_ORDERS;
  });

  const [payments, setPayments] = useState<PaymentRecord[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.PAYMENTS);
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return INITIAL_PAYMENTS;
  });

  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'paid'>('all');

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(customers));
    } catch (e) {
      console.error('Failed to save customers to localStorage', e);
    }
  }, [customers]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
    } catch (e) {
      console.error('Failed to save orders to localStorage', e);
    }
  }, [orders]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.PAYMENTS, JSON.stringify(payments));
    } catch (e) {
      console.error('Failed to save payments to localStorage', e);
    }
  }, [payments]);

  // Add Customer with optional Nepal City & PAN
  const addCustomer = (data: {
    name: string;
    phone: string;
    address: string;
    city?: string;
    panNumber?: string;
    notes?: string;
  }): Customer => {
    const newCustomer: Customer = {
      id: `cust-np-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      name: data.name.trim(),
      phone: data.phone.trim(),
      address: data.address.trim(),
      city: data.city?.trim() || 'Kathmandu',
      panNumber: data.panNumber?.trim() || '',
      notes: data.notes?.trim() || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setCustomers(prev => [newCustomer, ...prev]);
    return newCustomer;
  };

  // Update Customer
  const updateCustomer = (
    id: string,
    data: {
      name: string;
      phone: string;
      address: string;
      city?: string;
      panNumber?: string;
      notes?: string;
    }
  ) => {
    setCustomers(prev =>
      prev.map(c =>
        c.id === id
          ? {
              ...c,
              name: data.name.trim(),
              phone: data.phone.trim(),
              address: data.address.trim(),
              city: data.city?.trim() || c.city,
              panNumber: data.panNumber?.trim() || '',
              notes: data.notes?.trim() || '',
              updatedAt: new Date().toISOString(),
            }
          : c
      )
    );
  };

  // Delete Customer
  const deleteCustomer = (id: string) => {
    setCustomers(prev => prev.filter(c => c.id !== id));
    setOrders(prev => prev.filter(o => o.customerId !== id));
    setPayments(prev => prev.filter(p => p.customerId !== id));
    if (selectedCustomerId === id) {
      setSelectedCustomerId(null);
    }
  };

  // Add Order & Products
  const addOrder = (data: {
    customerId: string;
    date: string;
    products: Omit<ProductItem, 'id' | 'totalProductCost' | 'totalBaseCost'>[];
    deliveryCharge: number;
    otherCharges: number;
    deliveryLocationType?: CustomerOrder['deliveryLocationType'];
    deliveryCourier?: string;
    notes?: string;
    initialPayment?: number;
    paymentMethod?: NepalPaymentMethod;
    paymentReference?: string;
  }): CustomerOrder => {
    const formattedProducts: ProductItem[] = data.products.map(p => {
      const qty = Number(p.quantity) || 1;
      const unitCost = Number(p.productCost) || 0;
      const unitBase = Number(p.baseCost) || 0;
      return {
        id: `prod-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        name: p.name.trim(),
        quantity: qty,
        productCost: unitCost,
        baseCost: unitBase,
        totalProductCost: Number((qty * unitCost).toFixed(2)),
        totalBaseCost: Number((qty * unitBase).toFixed(2)),
      };
    });

    const productCost = formattedProducts.reduce((sum, item) => sum + item.totalProductCost, 0);
    const totalBaseCost = formattedProducts.reduce((sum, item) => sum + item.totalBaseCost, 0);
    const deliveryCharge = Number(data.deliveryCharge) || 0;
    const otherCharges = Number(data.otherCharges) || 0;
    const totalCost = Number((productCost + deliveryCharge + otherCharges).toFixed(2));
    
    const initialPay = Number(data.initialPayment) || 0;
    const customerPayment = Math.min(initialPay, totalCost);
    const remainingPayment = Number((totalCost - customerPayment).toFixed(2));
    
    // Automatic profit calculation: total revenue charged - base cost of goods
    const profit = calculateOrderProfit(totalCost, totalBaseCost, 0);

    const orderNumber = `ORD-${Date.now().toString().slice(-4)}`;
    const newOrderId = `ord-${Date.now()}`;

    const newOrder: CustomerOrder = {
      id: newOrderId,
      orderNumber,
      customerId: data.customerId,
      date: data.date || new Date().toISOString().split('T')[0],
      products: formattedProducts,
      productCost,
      deliveryCharge,
      otherCharges,
      totalCost,
      customerPayment,
      remainingPayment,
      totalBaseCost,
      profit,
      deliveryLocationType: data.deliveryLocationType || 'Inside Valley (Kathmandu/Lalitpur/Bhaktapur)',
      deliveryCourier: data.deliveryCourier?.trim() || '',
      notes: data.notes?.trim() || '',
    };

    setOrders(prev => [newOrder, ...prev]);

    if (customerPayment > 0) {
      const newPayment: PaymentRecord = {
        id: `pay-${Date.now()}`,
        customerId: data.customerId,
        orderId: newOrderId,
        amount: customerPayment,
        date: new Date().toISOString(),
        method: data.paymentMethod || 'Fonepay / QR',
        reference: data.paymentReference?.trim() || `Initial payment for ${orderNumber}`,
        note: `Payment recorded with order ${orderNumber}`,
      };
      setPayments(prev => [newPayment, ...prev]);
    }

    return newOrder;
  };

  // Update Order
  const updateOrder = (orderId: string, data: {
    date: string;
    products: Omit<ProductItem, 'id' | 'totalProductCost' | 'totalBaseCost'>[];
    deliveryCharge: number;
    otherCharges: number;
    deliveryLocationType?: CustomerOrder['deliveryLocationType'];
    deliveryCourier?: string;
    notes?: string;
  }) => {
    setOrders(prev =>
      prev.map(ord => {
        if (ord.id !== orderId) return ord;

        const formattedProducts: ProductItem[] = data.products.map((p, idx) => {
          const existingId = ord.products[idx]?.id || `prod-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
          const qty = Number(p.quantity) || 1;
          const unitCost = Number(p.productCost) || 0;
          const unitBase = Number(p.baseCost) || 0;
          return {
            id: existingId,
            name: p.name.trim(),
            quantity: qty,
            productCost: unitCost,
            baseCost: unitBase,
            totalProductCost: Number((qty * unitCost).toFixed(2)),
            totalBaseCost: Number((qty * unitBase).toFixed(2)),
          };
        });

        const productCost = formattedProducts.reduce((sum, item) => sum + item.totalProductCost, 0);
        const totalBaseCost = formattedProducts.reduce((sum, item) => sum + item.totalBaseCost, 0);
        const deliveryCharge = Number(data.deliveryCharge) || 0;
        const otherCharges = Number(data.otherCharges) || 0;
        const totalCost = Number((productCost + deliveryCharge + otherCharges).toFixed(2));
        
        const remainingPayment = Number(Math.max(0, totalCost - ord.customerPayment).toFixed(2));
        const profit = calculateOrderProfit(totalCost, totalBaseCost, 0);

        return {
          ...ord,
          date: data.date,
          products: formattedProducts,
          productCost,
          deliveryCharge,
          otherCharges,
          totalCost,
          remainingPayment,
          totalBaseCost,
          profit,
          deliveryLocationType: data.deliveryLocationType || ord.deliveryLocationType,
          deliveryCourier: data.deliveryCourier !== undefined ? data.deliveryCourier.trim() : ord.deliveryCourier,
          notes: data.notes?.trim() || '',
        };
      })
    );
  };

  // Delete Order
  const deleteOrder = (orderId: string) => {
    setOrders(prev => prev.filter(o => o.id !== orderId));
    setPayments(prev => prev.filter(p => p.orderId !== orderId));
  };

  // Record Payment
  const recordPayment = (data: {
    customerId: string;
    orderId?: string;
    amount: number;
    date: string;
    method: NepalPaymentMethod;
    reference?: string;
    note?: string;
  }): PaymentRecord => {
    const payAmount = Number(data.amount) || 0;
    const newPayment: PaymentRecord = {
      id: `pay-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      customerId: data.customerId,
      orderId: data.orderId,
      amount: payAmount,
      date: data.date || new Date().toISOString(),
      method: data.method,
      reference: data.reference?.trim() || '',
      note: data.note?.trim() || '',
    };

    setPayments(prev => [newPayment, ...prev]);

    if (data.orderId) {
      setOrders(prev =>
        prev.map(ord => {
          if (ord.id === data.orderId) {
            const newCustomerPayment = Number((ord.customerPayment + payAmount).toFixed(2));
            const newRemaining = Number(Math.max(0, ord.totalCost - newCustomerPayment).toFixed(2));
            return {
              ...ord,
              customerPayment: newCustomerPayment,
              remainingPayment: newRemaining,
            };
          }
          return ord;
        })
      );
    } else {
      setOrders(prev => {
        let remainingToDistribute = payAmount;
        return prev.map(ord => {
          if (ord.customerId === data.customerId && ord.remainingPayment > 0 && remainingToDistribute > 0) {
            const applied = Math.min(remainingToDistribute, ord.remainingPayment);
            remainingToDistribute -= applied;
            const newCustomerPayment = Number((ord.customerPayment + applied).toFixed(2));
            const newRemaining = Number((ord.totalCost - newCustomerPayment).toFixed(2));
            return {
              ...ord,
              customerPayment: newCustomerPayment,
              remainingPayment: newRemaining,
            };
          }
          return ord;
        });
      });
    }

    return newPayment;
  };

  // Delete Payment
  const deletePayment = (paymentId: string) => {
    const payment = payments.find(p => p.id === paymentId);
    if (!payment) return;

    if (payment.orderId) {
      setOrders(prev =>
        prev.map(ord => {
          if (ord.id === payment.orderId) {
            const newCustomerPayment = Math.max(0, ord.customerPayment - payment.amount);
            return {
              ...ord,
              customerPayment: newCustomerPayment,
              remainingPayment: Number((ord.totalCost - newCustomerPayment).toFixed(2)),
            };
          }
          return ord;
        })
      );
    }

    setPayments(prev => prev.filter(p => p.id !== paymentId));
  };

  // Reset to Demo Data
  const resetToDemoData = () => {
    setCustomers(INITIAL_CUSTOMERS);
    setOrders(INITIAL_ORDERS);
    setPayments(INITIAL_PAYMENTS);
    localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(INITIAL_CUSTOMERS));
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(INITIAL_ORDERS));
    localStorage.setItem(STORAGE_KEYS.PAYMENTS, JSON.stringify(INITIAL_PAYMENTS));
  };

  // Export JSON
  const exportDataJson = () => {
    const data = {
      exportDate: new Date().toISOString(),
      country: 'Nepal',
      currency: 'NPR (Rs.)',
      customers,
      orders,
      payments,
    };
    return JSON.stringify(data, null, 2);
  };

  // Import JSON
  const importDataJson = (json: string): boolean => {
    try {
      const parsed = JSON.parse(json);
      if (Array.isArray(parsed.customers) && Array.isArray(parsed.orders) && Array.isArray(parsed.payments)) {
        setCustomers(parsed.customers);
        setOrders(parsed.orders);
        setPayments(parsed.payments);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  const getCustomerOrders = (customerId: string) => {
    return orders
      .filter(o => o.customerId === customerId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  };

  const getCustomerPayments = (customerId: string) => {
    return payments
      .filter(p => p.customerId === customerId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  };

  const customersWithSummaries: CustomerWithSummary[] = useMemo(() => {
    return customers.map(customer => {
      const custOrders = orders.filter(o => o.customerId === customer.id);
      const custPayments = payments.filter(p => p.customerId === customer.id);

      const ordersCount = custOrders.length;
      const productsCount = custOrders.reduce((sum, ord) => sum + ord.products.reduce((pSum, p) => pSum + p.quantity, 0), 0);
      
      const totalProductCost = Number(custOrders.reduce((sum, ord) => sum + ord.productCost, 0).toFixed(2));
      const totalDeliveryCharge = Number(custOrders.reduce((sum, ord) => sum + (ord.deliveryCharge || 0), 0).toFixed(2));
      const totalOtherCharges = Number(custOrders.reduce((sum, ord) => sum + (ord.otherCharges || 0), 0).toFixed(2));
      const totalCost = Number(custOrders.reduce((sum, ord) => sum + ord.totalCost, 0).toFixed(2));
      const customerPayment = Number(custPayments.reduce((sum, pay) => sum + pay.amount, 0).toFixed(2));
      const remainingPayment = Number(Math.max(0, totalCost - customerPayment).toFixed(2));
      const profit = Number(custOrders.reduce((sum, ord) => sum + ord.profit, 0).toFixed(2));

      const sortedDates = custOrders.map(o => o.date).sort().reverse();
      const lastOrderDate = sortedDates[0];

      return {
        ...customer,
        ordersCount,
        productsCount,
        totalProductCost,
        totalDeliveryCharge,
        totalOtherCharges,
        totalCost,
        customerPayment,
        remainingPayment,
        profit,
        lastOrderDate,
      };
    });
  }, [customers, orders, payments]);

  const getCustomerWithSummary = (customerId: string): CustomerWithSummary | null => {
    return customersWithSummaries.find(c => c.id === customerId) || null;
  };

  const filteredCustomers = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return customersWithSummaries.filter(c => {
      const matchesSearch =
        !q ||
        c.name.toLowerCase().includes(q) ||
        c.phone.toLowerCase().includes(q) ||
        c.address.toLowerCase().includes(q) ||
        (c.city && c.city.toLowerCase().includes(q)) ||
        (c.panNumber && c.panNumber.includes(q));

      if (!matchesSearch) return false;

      if (filterStatus === 'pending') {
        return c.remainingPayment > 0;
      }
      if (filterStatus === 'paid') {
        return c.remainingPayment === 0 && c.totalCost > 0;
      }
      return true;
    });
  }, [customersWithSummaries, searchQuery, filterStatus]);

  const overallMetrics = useMemo(() => {
    const totalCustomers = customers.length;
    const totalOrders = orders.length;
    const totalRevenue = Number(orders.reduce((sum, o) => sum + o.totalCost, 0).toFixed(2));
    const totalPaid = Number(payments.reduce((sum, p) => sum + p.amount, 0).toFixed(2));
    const totalRemaining = Number(Math.max(0, totalRevenue - totalPaid).toFixed(2));
    const totalProfit = Number(orders.reduce((sum, o) => sum + o.profit, 0).toFixed(2));
    const totalDeliveryCharges = Number(orders.reduce((sum, o) => sum + (o.deliveryCharge || 0), 0).toFixed(2));
    const totalProductSales = Number(orders.reduce((sum, o) => sum + (o.productCost || 0), 0).toFixed(2));

    return {
      totalCustomers,
      totalOrders,
      totalRevenue,
      totalPaid,
      totalRemaining,
      totalProfit,
      totalDeliveryCharges,
      totalProductSales,
    };
  }, [customers, orders, payments]);

  return (
    <CrmContext.Provider
      value={{
        customers,
        orders,
        payments,
        selectedCustomerId,
        setSelectedCustomerId,
        searchQuery,
        setSearchQuery,
        filterStatus,
        setFilterStatus,
        addCustomer,
        updateCustomer,
        deleteCustomer,
        addOrder,
        updateOrder,
        deleteOrder,
        recordPayment,
        deletePayment,
        getCustomerOrders,
        getCustomerPayments,
        getCustomerWithSummary,
        customersWithSummaries,
        filteredCustomers,
        overallMetrics,
        resetToDemoData,
        exportDataJson,
        importDataJson,
      }}
    >
      {children}
    </CrmContext.Provider>
  );
};

export const useCrm = () => {
  const context = useContext(CrmContext);
  if (!context) {
    throw new Error('useCrm must be used within a CrmProvider');
  }
  return context;
};
