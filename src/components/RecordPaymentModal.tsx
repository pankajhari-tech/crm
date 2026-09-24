import React, { useState, useEffect } from 'react';
import { X, DollarSign, Calendar, CreditCard, FileText, QrCode } from 'lucide-react';
import { CustomerOrder, NepalPaymentMethod, PaymentRecord } from '../types/crm';
import { formatCurrency } from '../utils/formatters';

interface RecordPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  customerId: string;
  customerName: string;
  orders: CustomerOrder[];
  preselectedOrderId?: string;
  totalRemaining: number;
  onSubmit: (data: {
    customerId: string;
    orderId?: string;
    amount: number;
    date: string;
    method: NepalPaymentMethod;
    reference?: string;
    note?: string;
  }) => void;
}

export const RecordPaymentModal: React.FC<RecordPaymentModalProps> = ({
  isOpen,
  onClose,
  customerId,
  customerName,
  orders,
  preselectedOrderId,
  totalRemaining,
  onSubmit,
}) => {
  const [selectedOrderId, setSelectedOrderId] = useState<string>('');
  const [amount, setAmount] = useState<string>('');
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [method, setMethod] = useState<NepalPaymentMethod>('Fonepay / QR');
  const [reference, setReference] = useState<string>('');
  const [note, setNote] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string>('');

  const pendingOrders = orders.filter(o => o.remainingPayment > 0);

  useEffect(() => {
    if (preselectedOrderId) {
      setSelectedOrderId(preselectedOrderId);
      const targetOrder = orders.find(o => o.id === preselectedOrderId);
      if (targetOrder) {
        setAmount(targetOrder.remainingPayment.toString());
      }
    } else if (pendingOrders.length > 0) {
      setSelectedOrderId(pendingOrders[0].id);
      setAmount(pendingOrders[0].remainingPayment.toString());
    } else {
      setSelectedOrderId('');
      setAmount(totalRemaining > 0 ? totalRemaining.toString() : '');
    }
    setDate(new Date().toISOString().split('T')[0]);
    setMethod('Fonepay / QR');
    setReference('');
    setNote('');
    setErrorMsg('');
  }, [preselectedOrderId, orders, isOpen, totalRemaining]);

  if (!isOpen) return null;

  const handleOrderSelectionChange = (orderId: string) => {
    setSelectedOrderId(orderId);
    if (orderId) {
      const ord = orders.find(o => o.id === orderId);
      if (ord) {
        setAmount(ord.remainingPayment.toString());
      }
    } else {
      setAmount(totalRemaining.toString());
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setErrorMsg('Please enter a valid payment amount in Rs. greater than zero');
      return;
    }

    onSubmit({
      customerId,
      orderId: selectedOrderId || undefined,
      amount: numAmount,
      date: new Date(date).toISOString(),
      method,
      reference: reference.trim(),
      note: note.trim(),
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div 
        className="bg-white rounded-xl shadow-2xl max-w-md w-full border border-slate-200 overflow-hidden"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/70">
          <div>
            <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
              <QrCode className="w-5 h-5 text-emerald-600" />
              Record Payment (Nepal Gateway)
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Customer: <span className="font-medium text-slate-700">{customerName}</span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {errorMsg && (
            <div className="p-3 text-xs bg-rose-50 border border-rose-200 text-rose-700 rounded-lg">
              {errorMsg}
            </div>
          )}

          {/* Current Outstanding Balance notice */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between text-xs">
            <span className="text-slate-600">Total Outstanding Balance:</span>
            <span className={`font-mono font-bold text-sm ${totalRemaining > 0 ? 'text-amber-600' : 'text-emerald-600'}`}>
              {formatCurrency(totalRemaining)}
            </span>
          </div>

          {/* Target Order Selection */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
              Apply Payment To
            </label>
            <select
              value={selectedOrderId}
              onChange={e => handleOrderSelectionChange(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
            >
              <option value="">Apply to Customer Account Balance</option>
              {orders.map(o => (
                <option key={o.id} value={o.id}>
                  {o.orderNumber} ({o.date}) — Total: {formatCurrency(o.totalCost)} (Remaining: {formatCurrency(o.remainingPayment)})
                </option>
              ))}
            </select>
          </div>

          {/* Amount Paid */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
              Payment Amount (Rs.) <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500 text-xs font-bold font-mono">
                Rs.
              </div>
              <input
                type="number"
                min="1"
                step="1"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                placeholder="0"
                className="w-full pl-10 pr-3 py-2 text-sm font-mono font-medium bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                required
                autoFocus
              />
            </div>
          </div>

          {/* Date & Payment Method */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                Payment Date <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-slate-400">
                  <Calendar className="w-3.5 h-3.5" />
                </div>
                <input
                  type="date"
                  value={date}
                  onChange={e => setDate(e.target.value)}
                  className="w-full pl-8 pr-2 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-indigo-600"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                Method / Gateway
              </label>
              <div className="relative">
                <select
                  value={method}
                  onChange={e => setMethod(e.target.value as NepalPaymentMethod)}
                  className="w-full px-2.5 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-indigo-600"
                >
                  <option value="Fonepay / QR">Fonepay / QR</option>
                  <option value="eSewa">eSewa</option>
                  <option value="Khalti">Khalti</option>
                  <option value="Cash on Delivery (COD)">Cash on Delivery (COD)</option>
                  <option value="Bank Transfer (ConnectIPS)">Bank (ConnectIPS)</option>
                  <option value="Cash">Cash (Counter)</option>
                  <option value="Cheque">Cheque</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>
          </div>

          {/* Reference */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
              Reference / Trace ID / Slip #
            </label>
            <input
              type="text"
              value={reference}
              onChange={e => setReference(e.target.value)}
              placeholder="e.g. ESEWA-99210 or Fonepay Trace #8210"
              className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
            />
          </div>

          {/* Note */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
              Payment Note <span className="text-slate-400 font-normal lowercase">(optional)</span>
            </label>
            <div className="relative">
              <div className="absolute top-2.5 left-3 pointer-events-none text-slate-400">
                <FileText className="w-3.5 h-3.5" />
              </div>
              <textarea
                rows={2}
                value={note}
                onChange={e => setNote(e.target.value)}
                placeholder="e.g. Paid from Prabhu Bank QR at store..."
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-indigo-600 resize-none"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors shadow-xs focus:ring-2 focus:ring-emerald-500/20"
            >
              Record Payment
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
