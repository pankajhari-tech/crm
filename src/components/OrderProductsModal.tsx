import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, Calculator, Package, HelpCircle, Truck } from 'lucide-react';
import { CustomerOrder, NepalPaymentMethod, ProductItem } from '../types/crm';
import { formatCurrency } from '../utils/formatters';

interface OrderProductsModalProps {
  isOpen: boolean;
  onClose: () => void;
  customerId: string;
  customerName: string;
  initialOrder?: CustomerOrder | null;
  onSubmit: (data: {
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
  }) => void;
  onUpdate?: (orderId: string, data: {
    date: string;
    products: Omit<ProductItem, 'id' | 'totalProductCost' | 'totalBaseCost'>[];
    deliveryCharge: number;
    otherCharges: number;
    deliveryLocationType?: CustomerOrder['deliveryLocationType'];
    deliveryCourier?: string;
    notes?: string;
  }) => void;
}

interface ProductRowState {
  name: string;
  quantity: string;
  productCost: string; // Unit price charged in NPR
  baseCost: string;    // Unit wholesale purchase cost in NPR
}

export const OrderProductsModal: React.FC<OrderProductsModalProps> = ({
  isOpen,
  onClose,
  customerId,
  customerName,
  initialOrder,
  onSubmit,
  onUpdate,
}) => {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [products, setProducts] = useState<ProductRowState[]>([
    { name: '', quantity: '1', productCost: '', baseCost: '' },
  ]);
  const [deliveryType, setDeliveryType] = useState<CustomerOrder['deliveryLocationType']>(
    'Inside Valley (Kathmandu/Lalitpur/Bhaktapur)'
  );
  const [deliveryCourier, setDeliveryCourier] = useState<string>('Pathao Parcel');
  const [deliveryCharge, setDeliveryCharge] = useState<string>('100');
  const [otherCharges, setOtherCharges] = useState<string>('0');
  const [initialPayment, setInitialPayment] = useState<string>('0');
  const [paymentMethod, setPaymentMethod] = useState<NepalPaymentMethod>('Fonepay / QR');
  const [paymentReference, setPaymentReference] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [showBaseCostExplanation, setShowBaseCostExplanation] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');

  useEffect(() => {
    if (initialOrder) {
      setDate(initialOrder.date);
      setProducts(
        initialOrder.products.map(p => ({
          name: p.name,
          quantity: p.quantity.toString(),
          productCost: p.productCost.toString(),
          baseCost: (p.baseCost || 0).toString(),
        }))
      );
      setDeliveryType(initialOrder.deliveryLocationType || 'Inside Valley (Kathmandu/Lalitpur/Bhaktapur)');
      setDeliveryCourier(initialOrder.deliveryCourier || 'Pathao Parcel');
      setDeliveryCharge(initialOrder.deliveryCharge.toString());
      setOtherCharges(initialOrder.otherCharges.toString());
      setInitialPayment(initialOrder.customerPayment.toString());
      setNotes(initialOrder.notes || '');
    } else {
      setDate(new Date().toISOString().split('T')[0]);
      setProducts([{ name: '', quantity: '1', productCost: '', baseCost: '' }]);
      setDeliveryType('Inside Valley (Kathmandu/Lalitpur/Bhaktapur)');
      setDeliveryCourier('Pathao Parcel');
      setDeliveryCharge('100');
      setOtherCharges('0');
      setInitialPayment('0');
      setPaymentMethod('Fonepay / QR');
      setPaymentReference('');
      setNotes('');
    }
    setErrorMsg('');
  }, [initialOrder, isOpen]);

  if (!isOpen) return null;

  const handleDeliveryTypeChange = (type: CustomerOrder['deliveryLocationType']) => {
    setDeliveryType(type);
    if (!initialOrder) {
      if (type === 'Inside Valley (Kathmandu/Lalitpur/Bhaktapur)') {
        setDeliveryCharge('100');
      } else if (type === 'Outside Valley') {
        setDeliveryCharge('250');
      } else {
        setDeliveryCharge('0');
      }
    }
  };

  // Real-time calculation helpers
  const calculatedProductCost = products.reduce((sum, p) => {
    const qty = parseFloat(p.quantity) || 0;
    const cost = parseFloat(p.productCost) || 0;
    return sum + qty * cost;
  }, 0);

  const calculatedBaseCost = products.reduce((sum, p) => {
    const qty = parseFloat(p.quantity) || 0;
    const base = parseFloat(p.baseCost) || 0;
    return sum + qty * base;
  }, 0);

  const numDelivery = parseFloat(deliveryCharge) || 0;
  const numOther = parseFloat(otherCharges) || 0;
  const totalCost = calculatedProductCost + numDelivery + numOther;
  
  const numPayment = parseFloat(initialPayment) || 0;
  const remainingPayment = Math.max(0, totalCost - numPayment);
  const automaticProfit = totalCost - calculatedBaseCost;

  const handleAddProductRow = () => {
    setProducts(prev => [...prev, { name: '', quantity: '1', productCost: '', baseCost: '' }]);
  };

  const handleRemoveProductRow = (index: number) => {
    if (products.length === 1) {
      setProducts([{ name: '', quantity: '1', productCost: '', baseCost: '' }]);
      return;
    }
    setProducts(prev => prev.filter((_, idx) => idx !== index));
  };

  const handleProductChange = (index: number, field: keyof ProductRowState, value: string) => {
    setProducts(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
    setErrorMsg('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const validProducts = products.filter(p => p.name.trim().length > 0);
    if (validProducts.length === 0) {
      setErrorMsg('Please enter at least one product name');
      return;
    }

    for (const p of validProducts) {
      const qty = parseFloat(p.quantity);
      const cost = parseFloat(p.productCost);
      if (isNaN(qty) || qty <= 0) {
        setErrorMsg(`Product "${p.name}" requires a valid quantity greater than 0`);
        return;
      }
      if (isNaN(cost) || cost < 0) {
        setErrorMsg(`Product "${p.name}" requires a valid product cost in Rs.`);
        return;
      }
    }

    const formattedProducts = validProducts.map(p => ({
      name: p.name.trim(),
      quantity: parseFloat(p.quantity) || 1,
      productCost: parseFloat(p.productCost) || 0,
      baseCost: parseFloat(p.baseCost) || 0,
    }));

    if (initialOrder && onUpdate) {
      onUpdate(initialOrder.id, {
        date,
        products: formattedProducts,
        deliveryCharge: numDelivery,
        otherCharges: numOther,
        deliveryLocationType: deliveryType,
        deliveryCourier: deliveryCourier.trim(),
        notes: notes.trim(),
      });
    } else {
      onSubmit({
        customerId,
        date,
        products: formattedProducts,
        deliveryCharge: numDelivery,
        otherCharges: numOther,
        deliveryLocationType: deliveryType,
        deliveryCourier: deliveryCourier.trim(),
        notes: notes.trim(),
        initialPayment: numPayment,
        paymentMethod,
        paymentReference,
      });
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div 
        className="bg-white rounded-xl shadow-2xl max-w-2xl w-full border border-slate-200 overflow-hidden my-6 transition-all"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/70">
          <div>
            <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
              <Package className="w-5 h-5 text-indigo-600" />
              {initialOrder ? `Edit Order (${initialOrder.orderNumber})` : 'Add Products / New Order'}
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

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {errorMsg && (
            <div className="p-3 text-xs bg-rose-50 border border-rose-200 text-rose-700 rounded-lg">
              {errorMsg}
            </div>
          )}

          {/* Date & Note */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                Order Date <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                value={date}
                onChange={e => setDate(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                Order Notes / Delivery Ref
              </label>
              <input
                type="text"
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="e.g. Pathao tracking # or fragile handling"
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
              />
            </div>
          </div>

          {/* Delivery Region Selection */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <Truck className="w-3.5 h-3.5 text-indigo-600" />
              Delivery Location (Nepal)
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleDeliveryTypeChange('Inside Valley (Kathmandu/Lalitpur/Bhaktapur)')}
                className={`px-2.5 py-1.5 text-xs text-left rounded-md border transition-all ${
                  deliveryType === 'Inside Valley (Kathmandu/Lalitpur/Bhaktapur)'
                    ? 'border-indigo-600 bg-indigo-50/70 font-semibold text-indigo-900 shadow-2xs'
                    : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                }`}
              >
                Inside Valley (KTM/LAL/BKT)
              </button>
              <button
                type="button"
                onClick={() => handleDeliveryTypeChange('Outside Valley')}
                className={`px-2.5 py-1.5 text-xs text-left rounded-md border transition-all ${
                  deliveryType === 'Outside Valley'
                    ? 'border-indigo-600 bg-indigo-50/70 font-semibold text-indigo-900 shadow-2xs'
                    : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                }`}
              >
                Outside Valley (Courier)
              </button>
              <button
                type="button"
                onClick={() => handleDeliveryTypeChange('Store Pickup')}
                className={`px-2.5 py-1.5 text-xs text-left rounded-md border transition-all ${
                  deliveryType === 'Store Pickup'
                    ? 'border-indigo-600 bg-indigo-50/70 font-semibold text-indigo-900 shadow-2xs'
                    : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                }`}
              >
                Store / Office Pickup
              </button>
            </div>
          </div>

          {/* Product Line Items */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-700">
                  Product Details
                </span>
                <button
                  type="button"
                  onClick={() => setShowBaseCostExplanation(!showBaseCostExplanation)}
                  className="text-slate-400 hover:text-indigo-600 transition-colors"
                  title="How is profit calculated in NPR?"
                >
                  <HelpCircle className="w-3.5 h-3.5" />
                </button>
              </div>
              <button
                type="button"
                onClick={handleAddProductRow}
                className="inline-flex items-center gap-1 text-xs font-medium text-indigo-600 hover:text-indigo-800 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Product Item
              </button>
            </div>

            {showBaseCostExplanation && (
              <div className="mb-3 p-3 bg-indigo-50/70 border border-indigo-100 rounded-lg text-xs text-indigo-900 leading-relaxed">
                <strong>Automatic Profit Calculation (NPR):</strong> Profit is calculated as{' '}
                <span className="font-mono bg-white px-1 py-0.5 rounded border border-indigo-200">
                  Total Cost (Billed) - Total Wholesale Base Cost
                </span>. Enter the base/purchase cost you paid per unit to track your exact profit margin automatically.
              </div>
            )}

            <div className="border border-slate-200 rounded-lg overflow-hidden">
              <div className="bg-slate-50 px-3 py-2 grid grid-cols-12 gap-2 text-xs font-semibold text-slate-600 uppercase tracking-wider border-b border-slate-200">
                <div className="col-span-5">Product Name</div>
                <div className="col-span-2 text-center">Qty</div>
                <div className="col-span-2 text-right">Price (Rs.)</div>
                <div className="col-span-2 text-right">Base Cost (Rs.)</div>
                <div className="col-span-1 text-center"></div>
              </div>

              <div className="divide-y divide-slate-100 max-h-56 overflow-y-auto">
                {products.map((item, idx) => (
                  <div key={idx} className="p-2.5 grid grid-cols-12 gap-2 items-center hover:bg-slate-50/50">
                    <div className="col-span-5">
                      <input
                        type="text"
                        value={item.name}
                        onChange={e => handleProductChange(idx, 'name', e.target.value)}
                        placeholder="e.g. Ergonomic Office Chair"
                        className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded focus:outline-none focus:border-indigo-600"
                        required
                      />
                    </div>
                    <div className="col-span-2">
                      <input
                        type="number"
                        min="1"
                        step="1"
                        value={item.quantity}
                        onChange={e => handleProductChange(idx, 'quantity', e.target.value)}
                        className="w-full px-2 py-1.5 text-xs text-center bg-white border border-slate-300 rounded focus:outline-none focus:border-indigo-600"
                        required
                      />
                    </div>
                    <div className="col-span-2">
                      <input
                        type="number"
                        min="0"
                        step="1"
                        value={item.productCost}
                        onChange={e => handleProductChange(idx, 'productCost', e.target.value)}
                        placeholder="0"
                        className="w-full px-2 py-1.5 text-xs text-right bg-white border border-slate-300 rounded focus:outline-none focus:border-indigo-600 font-mono"
                        required
                      />
                    </div>
                    <div className="col-span-2">
                      <input
                        type="number"
                        min="0"
                        step="1"
                        value={item.baseCost}
                        onChange={e => handleProductChange(idx, 'baseCost', e.target.value)}
                        placeholder="0"
                        title="Wholesale purchase cost for profit calculation"
                        className="w-full px-2 py-1.5 text-xs text-right bg-white border border-slate-300 rounded focus:outline-none focus:border-indigo-600 font-mono"
                      />
                    </div>
                    <div className="col-span-1 text-center">
                      <button
                        type="button"
                        onClick={() => handleRemoveProductRow(idx)}
                        className="text-slate-400 hover:text-rose-600 p-1 rounded transition-colors"
                        aria-label="Remove item"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Delivery & Other Charges Section */}
          <div className="bg-slate-50/80 border border-slate-200 rounded-xl p-4 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-2.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                <Truck className="w-4 h-4 text-indigo-600" />
                Delivery Charge & Courier (Nepal)
              </label>
              <div className="text-xs text-indigo-700 font-medium">
                Added directly to Customer Total Cost
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Delivery Charge Input & Quick Presets */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-700">
                    Delivery Charge (Rs.) <span className="text-rose-500">*</span>
                  </label>
                  <span className="text-xs font-mono text-indigo-700 font-bold">
                    +Rs. {deliveryCharge || 0}
                  </span>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500 text-xs font-bold font-mono">
                    Rs.
                  </div>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={deliveryCharge}
                    onChange={e => setDeliveryCharge(e.target.value)}
                    placeholder="100"
                    className="w-full pl-10 pr-3 py-2 text-sm font-mono font-medium bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                  />
                </div>

                {/* Quick Delivery Charge Presets */}
                <div className="space-y-1">
                  <span className="text-[10px] uppercase font-semibold text-slate-500 block">
                    Quick Nepal Delivery Presets:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    <button
                      type="button"
                      onClick={() => {
                        setDeliveryCharge('0');
                        setDeliveryType('Store Pickup');
                        setDeliveryCourier('Customer Pickup');
                      }}
                      className={`px-2 py-1 text-[11px] rounded border transition-colors ${
                        deliveryCharge === '0'
                          ? 'bg-indigo-600 text-white border-indigo-600 font-medium'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      Free (Rs. 0)
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setDeliveryCharge('100');
                        setDeliveryType('Inside Valley (Kathmandu/Lalitpur/Bhaktapur)');
                        setDeliveryCourier('Pathao Parcel');
                      }}
                      className={`px-2 py-1 text-[11px] rounded border transition-colors ${
                        deliveryCharge === '100'
                          ? 'bg-indigo-600 text-white border-indigo-600 font-medium'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      Valley (Rs. 100)
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setDeliveryCharge('150');
                        setDeliveryType('Inside Valley (Kathmandu/Lalitpur/Bhaktapur)');
                        setDeliveryCourier('Pathao Parcel');
                      }}
                      className={`px-2 py-1 text-[11px] rounded border transition-colors ${
                        deliveryCharge === '150'
                          ? 'bg-indigo-600 text-white border-indigo-600 font-medium'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      Express Valley (Rs. 150)
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setDeliveryCharge('250');
                        setDeliveryType('Outside Valley');
                        setDeliveryCourier('Nepal Can Move (NCM)');
                      }}
                      className={`px-2 py-1 text-[11px] rounded border transition-colors ${
                        deliveryCharge === '250'
                          ? 'bg-indigo-600 text-white border-indigo-600 font-medium'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      Outside Valley (Rs. 250)
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setDeliveryCharge('350');
                        setDeliveryType('Outside Valley');
                        setDeliveryCourier('Sundar Courier');
                      }}
                      className={`px-2 py-1 text-[11px] rounded border transition-colors ${
                        deliveryCharge === '350'
                          ? 'bg-indigo-600 text-white border-indigo-600 font-medium'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      East/West Courier (Rs. 350)
                    </button>
                  </div>
                </div>
              </div>

              {/* Courier Service & Other Charges */}
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Courier Partner / Delivery Mode
                  </label>
                  <select
                    value={deliveryCourier}
                    onChange={e => setDeliveryCourier(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-indigo-600"
                  >
                    <option value="Pathao Parcel">Pathao Parcel (Intra-Valley Bike/Express)</option>
                    <option value="InDrive Delivery">InDrive Delivery (Local Bike / Cab)</option>
                    <option value="Nepal Can Move (NCM)">Nepal Can Move (NCM Nationwide Courier)</option>
                    <option value="Sundar Courier">Sundar Courier (Branch to Branch)</option>
                    <option value="Curilo Delivery">Curilo Delivery</option>
                    <option value="Nepal Post / EMS">Nepal Post / EMS (Hulak)</option>
                    <option value="Store Staff Delivery">Store Staff / Local Van Delivery</option>
                    <option value="Customer Pickup">Store / Office Pickup (Self)</option>
                    <option value="Other Courier">Other Local Logistics Partner</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Other Charges / Packaging (Rs.)
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500 text-xs font-bold font-mono">
                      Rs.
                    </div>
                    <input
                      type="number"
                      min="0"
                      step="1"
                      value={otherCharges}
                      onChange={e => setOtherCharges(e.target.value)}
                      placeholder="0"
                      className="w-full pl-10 pr-3 py-2 text-sm font-mono bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Initial Customer Payment (Fonepay, eSewa, Khalti, COD) */}
          {!initialOrder && (
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-700">
                  Initial Payment Received (Nepal Gateways)
                </span>
                <span className="text-xs text-slate-500">Optional / Deposit</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs text-slate-600 mb-1">Amount Paid (Rs.)</label>
                  <input
                    type="number"
                    min="0"
                    max={totalCost}
                    step="1"
                    value={initialPayment}
                    onChange={e => setInitialPayment(e.target.value)}
                    placeholder="0"
                    className="w-full px-2.5 py-1.5 text-sm font-mono bg-white border border-slate-300 rounded-md focus:outline-none focus:border-indigo-600"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-600 mb-1">Payment Gateway</label>
                  <select
                    value={paymentMethod}
                    onChange={e => setPaymentMethod(e.target.value as NepalPaymentMethod)}
                    className="w-full px-2.5 py-1.5 text-sm bg-white border border-slate-300 rounded-md focus:outline-none focus:border-indigo-600"
                  >
                    <option value="Fonepay / QR">Fonepay / QR</option>
                    <option value="eSewa">eSewa</option>
                    <option value="Khalti">Khalti</option>
                    <option value="Cash on Delivery (COD)">Cash on Delivery (COD)</option>
                    <option value="Bank Transfer (ConnectIPS)">Bank Transfer (ConnectIPS)</option>
                    <option value="Cash">Cash (Counter)</option>
                    <option value="Cheque">Cheque</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-slate-600 mb-1">Txn Ref / Trace ID</label>
                  <input
                    type="text"
                    value={paymentReference}
                    onChange={e => setPaymentReference(e.target.value)}
                    placeholder="e.g. eSewa Ref # or Trace ID"
                    className="w-full px-2.5 py-1.5 text-sm bg-white border border-slate-300 rounded-md focus:outline-none focus:border-indigo-600"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Payment & Automatic Profit Calculation Summary Card */}
          <div className="bg-indigo-950 text-white p-4 rounded-xl shadow-inner space-y-3">
            <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-indigo-200">
              <span className="flex items-center gap-1.5">
                <Calculator className="w-4 h-4" />
                Payment & Cost Breakdown (Rs.)
              </span>
              <span className="text-[11px] font-mono text-indigo-300 hidden sm:inline">
                Product Cost + Delivery Charge = Total Cost
              </span>
            </div>

            <div className="grid grid-cols-3 gap-3 text-xs pt-1 border-t border-indigo-800">
              <div>
                <span className="text-indigo-300 block">Product Cost</span>
                <span className="text-sm font-semibold font-mono">{formatCurrency(calculatedProductCost)}</span>
              </div>
              <div className="bg-indigo-900/60 p-1.5 rounded border border-indigo-700/60">
                <span className="text-indigo-200 block font-medium flex items-center gap-1">
                  <Truck className="w-3 h-3 text-indigo-400" />
                  Delivery Charge
                </span>
                <span className="text-sm font-bold font-mono text-white">+{formatCurrency(numDelivery)}</span>
              </div>
              <div>
                <span className="text-indigo-300 block">Other Charges</span>
                <span className="text-sm font-semibold font-mono">+{formatCurrency(numOther)}</span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 text-xs pt-2 border-t border-indigo-800">
              <div>
                <span className="text-indigo-200 block font-medium">Total Cost (Billed)</span>
                <span className="text-base font-bold font-mono text-white">{formatCurrency(totalCost)}</span>
              </div>
              <div>
                <span className="text-indigo-200 block font-medium">Customer Payment</span>
                <span className="text-base font-bold font-mono text-emerald-300">{formatCurrency(numPayment)}</span>
              </div>
              <div>
                <span className="text-indigo-200 block font-medium">Remaining Due</span>
                <span className={`text-base font-bold font-mono ${remainingPayment > 0 ? 'text-amber-300' : 'text-emerald-300'}`}>
                  {formatCurrency(remainingPayment)}
                </span>
              </div>
            </div>

            {/* Profit */}
            <div className="pt-2 border-t border-indigo-800 flex items-center justify-between">
              <div>
                <span className="text-xs text-indigo-300">Automatic Profit (Total Billed - Wholesale Cost)</span>
                <div className="text-xs text-indigo-400">
                  Wholesale Purchase Cost: {formatCurrency(calculatedBaseCost)}
                </div>
              </div>
              <div className="text-right">
                <span className="text-lg font-bold font-mono text-emerald-400">
                  {formatCurrency(automaticProfit)}
                </span>
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors shadow-xs focus:ring-2 focus:ring-indigo-500/20"
            >
              {initialOrder ? 'Save Order' : 'Create Order & Products'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
