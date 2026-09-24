import React from 'react';
import { X, Printer } from 'lucide-react';
import { CustomerWithSummary, CustomerOrder, PaymentRecord } from '../types/crm';
import { formatCurrency, formatDate } from '../utils/formatters';

interface CustomerStatementModalProps {
  isOpen: boolean;
  onClose: () => void;
  customer: CustomerWithSummary;
  orders: CustomerOrder[];
  payments: PaymentRecord[];
}

export const CustomerStatementModal: React.FC<CustomerStatementModalProps> = ({
  isOpen,
  onClose,
  customer,
  orders,
  payments,
}) => {
  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div 
        className="bg-white rounded-xl shadow-2xl max-w-3xl w-full border border-slate-200 overflow-hidden my-6 print:m-0 print:border-none print:shadow-none"
        role="dialog"
        aria-modal="true"
      >
        {/* Modal Controls Bar */}
        <div className="flex items-center justify-between px-6 py-3 border-b border-slate-200 bg-slate-50 print:hidden">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-600">
            Customer Statement & Payment Ledger (Nepal)
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors shadow-2xs"
            >
              <Printer className="w-3.5 h-3.5" />
              Print Statement
            </button>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-200 transition-colors"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Statement Document */}
        <div className="p-8 space-y-6 print:p-0">
          {/* Header */}
          <div className="flex justify-between items-start border-b border-slate-200 pb-6">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">CUSTOMER STATEMENT</h1>
              <p className="text-xs text-slate-500 mt-1">Date: {formatDate(new Date().toISOString())}</p>
            </div>
            <div className="text-right">
              <span className="text-lg font-bold text-indigo-700">ClientPulse CRM</span>
              <p className="text-xs text-slate-500">Nepal Business Customer Ledger</p>
            </div>
          </div>

          {/* Customer Profile & PAN */}
          <div className="grid grid-cols-2 gap-6 bg-slate-50 p-4 rounded-lg border border-slate-200 text-sm">
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Customer Profile</h3>
              <p className="font-semibold text-slate-900 text-base">{customer.name}</p>
              <p className="text-slate-600">{customer.phone}</p>
              <p className="text-slate-600 text-xs mt-0.5">{customer.address}, {customer.city || 'Nepal'}</p>
              {customer.panNumber && (
                <p className="text-xs text-indigo-700 font-mono font-medium mt-1">
                  PAN / VAT: {customer.panNumber}
                </p>
              )}
            </div>
            <div className="text-right">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Account Summary (NPR)</h3>
              <div className="space-y-1 text-xs">
                <p className="text-slate-600">Total Billed: <span className="font-mono font-medium text-slate-900">{formatCurrency(customer.totalCost)}</span></p>
                <p className="text-slate-600">Total Paid: <span className="font-mono font-medium text-emerald-600">{formatCurrency(customer.customerPayment)}</span></p>
                <p className="text-slate-900 font-semibold text-sm">Remaining Due: <span className="font-mono text-amber-600">{formatCurrency(customer.remainingPayment)}</span></p>
              </div>
            </div>
          </div>

          {/* Products & Orders Breakdown */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 mb-2">Orders & Products Breakdown</h3>
            <div className="border border-slate-200 rounded-lg overflow-hidden text-xs">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                    <th className="p-2.5">Order / Date</th>
                    <th className="p-2.5">Product Items</th>
                    <th className="p-2.5 text-right">Delivery / Other</th>
                    <th className="p-2.5 text-right">Total Cost</th>
                    <th className="p-2.5 text-right">Paid</th>
                    <th className="p-2.5 text-right">Remaining Due</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {orders.map(order => (
                    <tr key={order.id} className="hover:bg-slate-50/50">
                      <td className="p-2.5 align-top font-medium text-slate-900">
                        <div>{order.orderNumber}</div>
                        <div className="text-slate-500 text-[11px]">{formatDate(order.date)}</div>
                        {order.deliveryLocationType && (
                          <div className="text-[10px] text-slate-400 mt-0.5">{order.deliveryLocationType}</div>
                        )}
                      </td>
                      <td className="p-2.5 align-top">
                        <ul className="space-y-1">
                          {order.products.map(prod => (
                            <li key={prod.id} className="text-slate-700">
                              {prod.quantity} × {prod.name} <span className="text-slate-400">(@ {formatCurrency(prod.productCost)})</span>
                            </li>
                          ))}
                        </ul>
                      </td>
                      <td className="p-2.5 align-top text-right text-slate-600">
                        <div>{formatCurrency(order.deliveryCharge)}</div>
                        {order.otherCharges > 0 && <div className="text-[11px] text-slate-400">+{formatCurrency(order.otherCharges)} oth.</div>}
                      </td>
                      <td className="p-2.5 align-top text-right font-mono font-medium text-slate-900">
                        {formatCurrency(order.totalCost)}
                      </td>
                      <td className="p-2.5 align-top text-right font-mono text-emerald-600">
                        {formatCurrency(order.customerPayment)}
                      </td>
                      <td className="p-2.5 align-top text-right font-mono font-medium text-amber-600">
                        {formatCurrency(order.remainingPayment)}
                      </td>
                    </tr>
                  ))}
                  {orders.length === 0 && (
                    <tr>
                      <td colSpan={6} className="p-4 text-center text-slate-400">No orders recorded yet.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Payment History Table */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 mb-2">Payment History Ledger</h3>
            <div className="border border-slate-200 rounded-lg overflow-hidden text-xs">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                    <th className="p-2.5">Date</th>
                    <th className="p-2.5">Gateway / Method</th>
                    <th className="p-2.5">Ref / Trace ID</th>
                    <th className="p-2.5 text-right">Amount Received</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {payments.map(payment => (
                    <tr key={payment.id}>
                      <td className="p-2.5 text-slate-700">{formatDate(payment.date)}</td>
                      <td className="p-2.5 font-medium text-slate-800">{payment.method}</td>
                      <td className="p-2.5 text-slate-600">
                        {payment.reference || '—'} {payment.note && <span className="text-slate-400">({payment.note})</span>}
                      </td>
                      <td className="p-2.5 text-right font-mono font-semibold text-emerald-600">
                        {formatCurrency(payment.amount)}
                      </td>
                    </tr>
                  ))}
                  {payments.length === 0 && (
                    <tr>
                      <td colSpan={4} className="p-4 text-center text-slate-400">No payments recorded yet.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Totals Summary Footer */}
          <div className="border-t-2 border-slate-300 pt-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-sm">
            <div className="text-xs text-slate-500 space-y-1">
              <div>
                Total Profit from Customer:{' '}
                <span className="font-mono font-semibold text-indigo-700">{formatCurrency(customer.profit)}</span>
              </div>
              <div className="text-[11px] text-slate-400">
                Generated via ClientPulse Nepal CRM
              </div>
            </div>
            <div className="space-y-1.5 text-right w-full sm:w-auto">
              <div className="text-xs text-slate-600 flex justify-between sm:justify-end gap-4">
                <span>Product Subtotal:</span>
                <span className="font-mono font-medium">{formatCurrency(customer.totalProductCost)}</span>
              </div>
              <div className="text-xs text-blue-700 font-medium flex justify-between sm:justify-end gap-4">
                <span>Total Delivery Charges:</span>
                <span className="font-mono font-semibold">{formatCurrency(customer.totalDeliveryCharge)}</span>
              </div>
              {customer.totalOtherCharges > 0 && (
                <div className="text-xs text-slate-600 flex justify-between sm:justify-end gap-4">
                  <span>Other / Packaging:</span>
                  <span className="font-mono font-medium">{formatCurrency(customer.totalOtherCharges)}</span>
                </div>
              )}
              <div className="text-xs text-slate-900 font-semibold border-t border-slate-200 pt-1 flex justify-between sm:justify-end gap-4">
                <span>Total Billed:</span>
                <span className="font-mono font-bold">{formatCurrency(customer.totalCost)}</span>
              </div>
              <div className="text-xs text-emerald-700 font-medium flex justify-between sm:justify-end gap-4">
                <span>Total Paid:</span>
                <span className="font-mono font-semibold">{formatCurrency(customer.customerPayment)}</span>
              </div>
              <div className="text-base font-bold text-slate-900 border-t border-slate-300 pt-1 flex justify-between sm:justify-end gap-4">
                <span>Balance Due:</span>
                <span className="font-mono text-amber-600">{formatCurrency(customer.remainingPayment)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
