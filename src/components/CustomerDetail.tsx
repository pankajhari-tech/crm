import React, { useState } from 'react';
import {
  ArrowLeft,
  Phone,
  MapPin,
  FileText,
  Plus,
  DollarSign,
  Package,
  Calendar,
  Edit2,
  Trash2,
  Receipt,
  HelpCircle,
  Copy,
  Check,
  MessageCircle,
  Building2,
  Hash,
  Truck
} from 'lucide-react';
import { useCrm } from '../context/CrmContext';
import { CustomerOrder, PaymentRecord } from '../types/crm';
import { formatCurrency, formatDate, formatDateTime, getWhatsAppLink } from '../utils/formatters';
import { CustomerModal } from './CustomerModal';
import { OrderProductsModal } from './OrderProductsModal';
import { RecordPaymentModal } from './RecordPaymentModal';
import { CustomerStatementModal } from './CustomerStatementModal';
import { ConfirmDialog } from './ConfirmDialog';

interface CustomerDetailProps {
  customerId: string;
  onBack: () => void;
}

export const CustomerDetail: React.FC<CustomerDetailProps> = ({ customerId, onBack }) => {
  const {
    getCustomerWithSummary,
    getCustomerOrders,
    getCustomerPayments,
    updateCustomer,
    deleteCustomer,
    addOrder,
    updateOrder,
    deleteOrder,
    recordPayment,
    deletePayment,
  } = useCrm();

  const customer = getCustomerWithSummary(customerId);
  const orders = getCustomerOrders(customerId);
  const payments = getCustomerPayments(customerId);

  // Modals state
  const [isEditCustomerOpen, setIsEditCustomerOpen] = useState(false);
  const [isAddOrderOpen, setIsAddOrderOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState<CustomerOrder | null>(null);
  const [isRecordPaymentOpen, setIsRecordPaymentOpen] = useState(false);
  const [preselectedOrderId, setPreselectedOrderId] = useState<string | undefined>(undefined);
  const [isStatementOpen, setIsStatementOpen] = useState(false);

  // Confirm delete states
  const [confirmDeleteCustomer, setConfirmDeleteCustomer] = useState(false);
  const [orderToDelete, setOrderToDelete] = useState<CustomerOrder | null>(null);
  const [paymentToDelete, setPaymentToDelete] = useState<PaymentRecord | null>(null);

  // Active tab in customer view
  const [activeTab, setActiveTab] = useState<'orders' | 'payments'>('orders');
  const [copiedPhone, setCopiedPhone] = useState(false);

  if (!customer) {
    return (
      <div className="p-8 text-center bg-white rounded-xl border border-slate-200 shadow-xs">
        <p className="text-slate-600">Customer not found or was removed.</p>
        <button
          onClick={onBack}
          className="mt-4 px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700"
        >
          Return to Customer List
        </button>
      </div>
    );
  }

  const handleCopyPhone = () => {
    navigator.clipboard.writeText(customer.phone);
    setCopiedPhone(true);
    setTimeout(() => setCopiedPhone(false), 2000);
  };

  const handleOpenRecordPaymentForOrder = (orderId: string) => {
    setPreselectedOrderId(orderId);
    setIsRecordPaymentOpen(true);
  };

  const handleOpenRecordPaymentGeneral = () => {
    setPreselectedOrderId(undefined);
    setIsRecordPaymentOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Top Breadcrumb / Back Bar */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Customer List
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsStatementOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors shadow-2xs"
            title="Generate print-friendly customer statement"
          >
            <Receipt className="w-3.5 h-3.5 text-slate-500" />
            View Statement
          </button>
          <button
            onClick={() => setIsEditCustomerOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors shadow-2xs"
          >
            <Edit2 className="w-3.5 h-3.5 text-slate-500" />
            Edit Customer
          </button>
          <button
            onClick={() => setConfirmDeleteCustomer(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-rose-600 bg-white border border-rose-200 rounded-lg hover:bg-rose-50 transition-colors shadow-2xs"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Delete
          </button>
        </div>
      </div>

      {/* Customer Profile Card */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
          <div className="space-y-3">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{customer.name}</h1>
                <span className="text-xs text-slate-400">
                  ID: {customer.id.split('-').slice(0, 3).join('-')}
                </span>
                {customer.city && (
                  <span className="text-xs font-medium px-2 py-0.5 bg-slate-100 text-slate-700 rounded-md">
                    {customer.city}
                  </span>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-slate-600 mt-2">
                {/* Phone & WhatsApp */}
                <div className="flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  <a href={`tel:${customer.phone}`} className="hover:text-indigo-600 font-medium font-mono">
                    {customer.phone}
                  </a>
                  <button
                    onClick={handleCopyPhone}
                    className="p-1 text-slate-400 hover:text-slate-600 rounded transition-colors"
                    title="Copy phone"
                  >
                    {copiedPhone ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                  </button>
                  <a
                    href={getWhatsAppLink(customer.phone, customer.name)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-[11px] text-emerald-600 hover:text-emerald-700 font-medium ml-1"
                    title="Chat on WhatsApp"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    WhatsApp
                  </a>
                </div>

                <span aria-hidden="true" className="text-slate-300">·</span>

                <div className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  <span>{customer.address}</span>
                </div>

                {customer.panNumber && (
                  <>
                    <span aria-hidden="true" className="text-slate-300">·</span>
                    <div className="flex items-center gap-1">
                      <Hash className="w-3.5 h-3.5 text-slate-400" />
                      <span className="font-mono text-indigo-700 font-semibold">PAN: {customer.panNumber}</span>
                    </div>
                  </>
                )}

                <span aria-hidden="true" className="text-slate-300">·</span>

                <div className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <span>Customer since {formatDate(customer.createdAt)}</span>
                </div>
              </div>
            </div>

            {customer.notes && (
              <div className="flex items-start gap-2 p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700">
                <FileText className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                <span className="leading-relaxed"><strong className="font-semibold">Notes:</strong> {customer.notes}</span>
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="flex flex-row lg:flex-col sm:items-stretch gap-2 shrink-0">
            <button
              onClick={() => {
                setEditingOrder(null);
                setIsAddOrderOpen(true);
              }}
              className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors shadow-xs"
            >
              <Package className="w-4 h-4" />
              Add Products
            </button>
            <button
              onClick={handleOpenRecordPaymentGeneral}
              className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-semibold text-slate-800 bg-emerald-100 hover:bg-emerald-200 rounded-lg transition-colors shadow-2xs"
            >
              <DollarSign className="w-4 h-4 text-emerald-700" />
              Record Payment
            </button>
          </div>
        </div>

        {/* 5 Financial Summary Counters */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5 mt-6 pt-6 border-t border-slate-100">
          <div className="p-3.5 bg-slate-50/70 border border-slate-200 rounded-lg">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider block">Total Billed</span>
            <div className="mt-1 text-xl font-bold font-mono text-slate-900">
              {formatCurrency(customer.totalCost)}
            </div>
            <span className="text-[11px] text-slate-400 mt-0.5 block">
              {customer.ordersCount} order{customer.ordersCount === 1 ? '' : 's'} ({customer.productsCount} items)
            </span>
          </div>

          <div className="p-3.5 bg-blue-50/60 border border-blue-200 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-blue-700 uppercase tracking-wider block flex items-center gap-1">
                <Truck className="w-3.5 h-3.5 text-blue-600" />
                Delivery Charges
              </span>
            </div>
            <div className="mt-1 text-xl font-bold font-mono text-blue-900">
              {formatCurrency(customer.totalDeliveryCharge ?? 0)}
            </div>
            <span className="text-[11px] text-blue-700/70 mt-0.5 block">
              Charged across {customer.ordersCount} order{customer.ordersCount === 1 ? '' : 's'}
            </span>
          </div>

          <div className="p-3.5 bg-slate-50/70 border border-slate-200 rounded-lg">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider block">Total Paid</span>
            <div className="mt-1 text-xl font-bold font-mono text-emerald-600">
              {formatCurrency(customer.customerPayment)}
            </div>
            <span className="text-[11px] text-slate-400 mt-0.5 block">
              {payments.length} payment record{payments.length === 1 ? '' : 's'}
            </span>
          </div>

          <div className={`p-3.5 border rounded-lg ${customer.remainingPayment > 0 ? 'bg-amber-50/50 border-amber-200' : 'bg-slate-50/70 border-slate-200'}`}>
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider block">Remaining Due</span>
            <div className={`mt-1 text-xl font-bold font-mono ${customer.remainingPayment > 0 ? 'text-amber-600' : 'text-slate-900'}`}>
              {formatCurrency(customer.remainingPayment)}
            </div>
            <span className="text-[11px] text-slate-400 mt-0.5 block">
              {customer.remainingPayment === 0 ? 'Fully settled ✓' : 'Outstanding payment due'}
            </span>
          </div>

          <div className="p-3.5 bg-indigo-50/50 border border-indigo-100 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-indigo-700 uppercase tracking-wider block">Total Profit</span>
              <span title="Automatic Profit = Total Billed - Wholesale Purchase Cost" className="text-indigo-400">
                <HelpCircle className="w-3.5 h-3.5" />
              </span>
            </div>
            <div className="mt-1 text-xl font-bold font-mono text-indigo-600">
              {formatCurrency(customer.profit)}
            </div>
            <span className="text-[11px] text-indigo-400 mt-0.5 block">
              {customer.totalCost > 0 ? `${((customer.profit / customer.totalCost) * 100).toFixed(0)}% profit margin` : '0% margin'}
            </span>
          </div>
        </div>
      </div>

      {/* Tabs Bar */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('orders')}
          className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors flex items-center gap-2 ${
            activeTab === 'orders'
              ? 'bg-slate-900 text-white'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Package className="w-4 h-4" />
          Products & Orders ({orders.length})
        </button>
        <button
          onClick={() => setActiveTab('payments')}
          className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors flex items-center gap-2 ${
            activeTab === 'payments'
              ? 'bg-slate-900 text-white'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <DollarSign className="w-4 h-4" />
          Payment History ({payments.length})
        </button>
      </div>

      {/* Tab Content 1: Products & Orders */}
      {activeTab === 'orders' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-800">
              Products & Orders Associated with Customer
            </h2>
            <button
              onClick={() => {
                setEditingOrder(null);
                setIsAddOrderOpen(true);
              }}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-800"
            >
              <Plus className="w-4 h-4" />
              Add Order
            </button>
          </div>

          {orders.length === 0 ? (
            <div className="p-8 text-center bg-white rounded-xl border border-dashed border-slate-300">
              <Package className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="text-sm font-medium text-slate-700">No orders or products recorded yet</p>
              <p className="text-xs text-slate-500 mt-1">Add products to track delivery charges, payments, and profit.</p>
              <button
                onClick={() => {
                  setEditingOrder(null);
                  setIsAddOrderOpen(true);
                }}
                className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                Add First Product Order
              </button>
            </div>
          ) : (
            orders.map(order => (
              <div
                key={order.id}
                className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden"
              >
                {/* Order Header */}
                <div className="px-6 py-3.5 bg-slate-50/70 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="font-mono font-bold text-sm text-slate-900">
                      {order.orderNumber}
                    </span>
                    <span aria-hidden="true" className="text-slate-300">·</span>
                    <span className="text-xs text-slate-500">
                      {formatDate(order.date)}
                    </span>
                    {order.deliveryLocationType && (
                      <>
                        <span aria-hidden="true" className="text-slate-300">·</span>
                        <span className="inline-flex items-center gap-1 text-[11px] text-slate-700 bg-white px-2 py-0.5 rounded border border-slate-200">
                          <Truck className="w-3 h-3 text-indigo-500" />
                          {order.deliveryCourier ? `${order.deliveryCourier} · ` : ''}{order.deliveryLocationType}
                          <span className="font-semibold text-indigo-700 font-mono">({formatCurrency(order.deliveryCharge)})</span>
                        </span>
                      </>
                    )}
                    {order.notes && (
                      <>
                        <span aria-hidden="true" className="text-slate-300">·</span>
                        <span className="text-xs text-slate-500 italic">"{order.notes}"</span>
                      </>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {order.remainingPayment > 0 && (
                      <button
                        onClick={() => handleOpenRecordPaymentForOrder(order.id)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-md hover:bg-emerald-100 transition-colors"
                      >
                        <DollarSign className="w-3.5 h-3.5" />
                        Record Payment
                      </button>
                    )}
                    <button
                      onClick={() => {
                        setEditingOrder(order);
                        setIsAddOrderOpen(true);
                      }}
                      className="p-1.5 text-slate-400 hover:text-slate-700 rounded-md hover:bg-slate-100 transition-colors"
                      title="Edit order"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setOrderToDelete(order)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 rounded-md hover:bg-rose-50 transition-colors"
                      title="Delete order"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Products Table */}
                <div className="px-6 py-4">
                  <div className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
                    Products in this Order ({order.products.length})
                  </div>
                  <div className="border border-slate-200 rounded-lg overflow-hidden text-xs">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-50 text-slate-600 border-b border-slate-200">
                          <th className="p-2.5">Product Name</th>
                          <th className="p-2.5 text-center">Quantity</th>
                          <th className="p-2.5 text-right">Unit Price (Rs.)</th>
                          <th className="p-2.5 text-right">Base Wholesale (Rs.)</th>
                          <th className="p-2.5 text-right">Line Total</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {order.products.map(product => (
                          <tr key={product.id} className="hover:bg-slate-50/30">
                            <td className="p-2.5 font-medium text-slate-900">{product.name}</td>
                            <td className="p-2.5 text-center font-mono">{product.quantity}</td>
                            <td className="p-2.5 text-right font-mono text-slate-600">{formatCurrency(product.productCost)}</td>
                            <td className="p-2.5 text-right font-mono text-slate-400">
                              {product.baseCost > 0 ? formatCurrency(product.baseCost) : '—'}
                            </td>
                            <td className="p-2.5 text-right font-mono font-semibold text-slate-900">
                              {formatCurrency(product.totalProductCost)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Payment Details & Profit Breakdown */}
                <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200">
                  <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 text-xs">
                    <div>
                      <span className="text-slate-500 block">Product Cost</span>
                      <span className="font-mono font-medium text-slate-900">{formatCurrency(order.productCost)}</span>
                    </div>
                    <div className="bg-blue-50/60 p-1.5 rounded border border-blue-100">
                      <span className="text-blue-700 block font-medium flex items-center gap-1">
                        <Truck className="w-3 h-3 text-blue-500" /> Delivery Charge
                      </span>
                      <span className="font-mono font-semibold text-blue-900">{formatCurrency(order.deliveryCharge)}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Other Charges</span>
                      <span className="font-mono font-medium text-slate-900">{formatCurrency(order.otherCharges)}</span>
                    </div>
                    <div>
                      <span className="text-slate-900 block font-semibold">Total Cost</span>
                      <span className="font-mono font-bold text-slate-900 text-sm">{formatCurrency(order.totalCost)}</span>
                    </div>
                    <div>
                      <span className="text-emerald-700 block font-medium">Customer Payment</span>
                      <span className="font-mono font-semibold text-emerald-600">{formatCurrency(order.customerPayment)}</span>
                    </div>
                    <div>
                      <span className="text-amber-700 block font-medium">Remaining Due</span>
                      <span className={`font-mono font-semibold ${order.remainingPayment > 0 ? 'text-amber-600' : 'text-slate-500'}`}>
                        {formatCurrency(order.remainingPayment)}
                      </span>
                    </div>
                    <div className="bg-white p-2 rounded border border-indigo-100 col-span-2 sm:col-span-1">
                      <span className="text-indigo-600 block font-semibold">Profit (auto)</span>
                      <span className="font-mono font-bold text-indigo-700 text-sm">{formatCurrency(order.profit)}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Tab Content 2: Payment History */}
      {activeTab === 'payments' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-800">
              Payment History Ledger (Nepal Gateways)
            </h2>
            <button
              onClick={handleOpenRecordPaymentGeneral}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600 hover:text-emerald-800"
            >
              <Plus className="w-4 h-4" />
              Record Payment
            </button>
          </div>

          {payments.length === 0 ? (
            <div className="p-8 text-center bg-white rounded-xl border border-dashed border-slate-300">
              <DollarSign className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="text-sm font-medium text-slate-700">No payment records yet</p>
              <p className="text-xs text-slate-500 mt-1">Record payments made via Fonepay, eSewa, Khalti, or COD to update the balance.</p>
              <button
                onClick={handleOpenRecordPaymentGeneral}
                className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                Record First Payment
              </button>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-slate-600 border-b border-slate-200 uppercase font-semibold">
                    <th className="p-3">Payment Date</th>
                    <th className="p-3">Gateway / Method</th>
                    <th className="p-3">Linked Order</th>
                    <th className="p-3">Reference / Trace ID</th>
                    <th className="p-3 text-right">Amount Paid</th>
                    <th className="p-3 text-center w-12"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {payments.map(payment => {
                    const linkedOrder = orders.find(o => o.id === payment.orderId);
                    return (
                      <tr key={payment.id} className="hover:bg-slate-50/50">
                        <td className="p-3 font-medium text-slate-900">
                          {formatDateTime(payment.date)}
                        </td>
                        <td className="p-3">
                          <span className="font-semibold text-slate-800 bg-slate-100 px-2 py-0.5 rounded">
                            {payment.method}
                          </span>
                        </td>
                        <td className="p-3">
                          {linkedOrder ? (
                            <span className="font-mono text-indigo-600 font-medium">
                              {linkedOrder.orderNumber}
                            </span>
                          ) : (
                            <span className="text-slate-400">Account Balance</span>
                          )}
                        </td>
                        <td className="p-3 text-slate-600">
                          {payment.reference && <span className="font-mono font-medium">{payment.reference} </span>}
                          {payment.note && <span className="text-slate-500 italic">({payment.note})</span>}
                          {!payment.reference && !payment.note && <span className="text-slate-400">—</span>}
                        </td>
                        <td className="p-3 text-right font-mono font-bold text-emerald-600 text-sm">
                          {formatCurrency(payment.amount)}
                        </td>
                        <td className="p-3 text-center">
                          <button
                            onClick={() => setPaymentToDelete(payment)}
                            className="p-1 text-slate-400 hover:text-rose-600 rounded transition-colors"
                            title="Delete payment record"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Edit Customer Modal */}
      <CustomerModal
        isOpen={isEditCustomerOpen}
        onClose={() => setIsEditCustomerOpen(false)}
        initialData={customer}
        onSubmit={data => updateCustomer(customer.id, data)}
      />

      {/* Add / Edit Order Modal */}
      <OrderProductsModal
        isOpen={isAddOrderOpen}
        onClose={() => {
          setIsAddOrderOpen(false);
          setEditingOrder(null);
        }}
        customerId={customer.id}
        customerName={customer.name}
        initialOrder={editingOrder}
        onSubmit={addOrder}
        onUpdate={updateOrder}
      />

      {/* Record Payment Modal */}
      <RecordPaymentModal
        isOpen={isRecordPaymentOpen}
        onClose={() => setIsRecordPaymentOpen(false)}
        customerId={customer.id}
        customerName={customer.name}
        orders={orders}
        preselectedOrderId={preselectedOrderId}
        totalRemaining={customer.remainingPayment}
        onSubmit={recordPayment}
      />

      {/* Customer Statement View */}
      <CustomerStatementModal
        isOpen={isStatementOpen}
        onClose={() => setIsStatementOpen(false)}
        customer={customer}
        orders={orders}
        payments={payments}
      />

      {/* Confirm Delete Customer */}
      <ConfirmDialog
        isOpen={confirmDeleteCustomer}
        title="Delete Customer Record"
        message={`Are you sure you want to delete ${customer.name}? This will permanently delete all associated products, orders, and payment history.`}
        confirmLabel="Delete Customer"
        onConfirm={() => {
          deleteCustomer(customer.id);
          setConfirmDeleteCustomer(false);
          onBack();
        }}
        onCancel={() => setConfirmDeleteCustomer(false)}
      />

      {/* Confirm Delete Order */}
      <ConfirmDialog
        isOpen={!!orderToDelete}
        title="Delete Order"
        message={`Are you sure you want to delete order ${orderToDelete?.orderNumber}?`}
        confirmLabel="Delete Order"
        onConfirm={() => {
          if (orderToDelete) {
            deleteOrder(orderToDelete.id);
            setOrderToDelete(null);
          }
        }}
        onCancel={() => setOrderToDelete(null)}
      />

      {/* Confirm Delete Payment */}
      <ConfirmDialog
        isOpen={!!paymentToDelete}
        title="Delete Payment Record"
        message={`Are you sure you want to delete this payment of ${paymentToDelete ? formatCurrency(paymentToDelete.amount) : ''}?`}
        confirmLabel="Delete Payment"
        onConfirm={() => {
          if (paymentToDelete) {
            deletePayment(paymentToDelete.id);
            setPaymentToDelete(null);
          }
        }}
        onCancel={() => setPaymentToDelete(null)}
      />
    </div>
  );
};
