import React, { useState, useEffect } from 'react';
import { X, User, Phone, MapPin, FileText, Hash, Building2 } from 'lucide-react';
import { Customer } from '../types/crm';

interface CustomerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    name: string;
    phone: string;
    address: string;
    city?: string;
    panNumber?: string;
    notes?: string;
  }) => void;
  initialData?: Customer | null;
}

const NEPAL_MAJOR_CITIES = [
  'Kathmandu',
  'Lalitpur',
  'Bhaktapur',
  'Pokhara',
  'Butwal',
  'Biratnagar',
  'Chitwan (Bharatpur/Narayangarh)',
  'Dharan',
  'Birgunj',
  'Nepalgunj',
  'Hetauda',
  'Itahari',
  'Dhangadhi',
  'Other',
];

export const CustomerModal: React.FC<CustomerModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
}) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('Kathmandu');
  const [panNumber, setPanNumber] = useState('');
  const [notes, setNotes] = useState('');
  const [errors, setErrors] = useState<{ name?: string; phone?: string; address?: string }>({});

  useEffect(() => {
    if (initialData) {
      setName(initialData.name);
      setPhone(initialData.phone);
      setAddress(initialData.address);
      setCity(initialData.city || 'Kathmandu');
      setPanNumber(initialData.panNumber || '');
      setNotes(initialData.notes || '');
    } else {
      setName('');
      setPhone('+977 ');
      setAddress('');
      setCity('Kathmandu');
      setPanNumber('');
      setNotes('');
    }
    setErrors({});
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const validate = () => {
    const errs: { name?: string; phone?: string; address?: string } = {};
    if (!name.trim()) errs.name = 'Customer / Business name is required';
    if (!phone.trim() || phone.trim() === '+977') errs.phone = 'Valid phone number is required';
    if (!address.trim()) errs.address = 'Street/Locality address is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    onSubmit({
      name: name.trim(),
      phone: phone.trim(),
      address: address.trim(),
      city,
      panNumber: panNumber.trim(),
      notes: notes.trim(),
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div 
        className="bg-white rounded-xl shadow-2xl max-w-lg w-full border border-slate-200 overflow-hidden"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/70">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              {initialData ? 'Edit Customer' : 'Add New Customer'}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Enter customer contact details (Nepal business environment)
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
          {/* Name */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
              Customer / Business Name <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <User className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={name}
                onChange={e => {
                  setName(e.target.value);
                  if (errors.name) setErrors(prev => ({ ...prev, name: undefined }));
                }}
                placeholder="e.g. Aayush Shrestha or New Road Traders"
                className={`w-full pl-9 pr-3 py-2 text-sm bg-white border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-colors ${
                  errors.name ? 'border-rose-400 bg-rose-50/20' : 'border-slate-300'
                }`}
                autoFocus
              />
            </div>
            {errors.name && <p className="text-xs text-rose-600 mt-1">{errors.name}</p>}
          </div>

          {/* Phone & City */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                Phone / Mobile <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Phone className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={phone}
                  onChange={e => {
                    setPhone(e.target.value);
                    if (errors.phone) setErrors(prev => ({ ...prev, phone: undefined }));
                  }}
                  placeholder="+977 9841XXXXXX"
                  className={`w-full pl-9 pr-3 py-2 text-sm bg-white border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-colors ${
                    errors.phone ? 'border-rose-400 bg-rose-50/20' : 'border-slate-300'
                  }`}
                />
              </div>
              {errors.phone && <p className="text-xs text-rose-600 mt-1">{errors.phone}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                City / Region
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Building2 className="w-4 h-4" />
                </div>
                <select
                  value={city}
                  onChange={e => setCity(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                >
                  {NEPAL_MAJOR_CITIES.map(c => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Address & PAN */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                Address / Chowk / Tole <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute top-2.5 left-3 pointer-events-none text-slate-400">
                  <MapPin className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={address}
                  onChange={e => {
                    setAddress(e.target.value);
                    if (errors.address) setErrors(prev => ({ ...prev, address: undefined }));
                  }}
                  placeholder="e.g. New Road, Ward 22 or Lakeside Ward 6"
                  className={`w-full pl-9 pr-3 py-2 text-sm bg-white border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-colors ${
                    errors.address ? 'border-rose-400 bg-rose-50/20' : 'border-slate-300'
                  }`}
                />
              </div>
              {errors.address && <p className="text-xs text-rose-600 mt-1">{errors.address}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                PAN / VAT <span className="text-slate-400 font-normal lowercase">(optional)</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Hash className="w-3.5 h-3.5" />
                </div>
                <input
                  type="text"
                  value={panNumber}
                  onChange={e => setPanNumber(e.target.value)}
                  placeholder="9-digit PAN"
                  maxLength={9}
                  className="w-full pl-8 pr-3 py-2 text-sm font-mono bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                />
              </div>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
              Customer Notes / Delivery Remarks
            </label>
            <div className="relative">
              <div className="absolute top-2.5 left-3 pointer-events-none text-slate-400">
                <FileText className="w-4 h-4" />
              </div>
              <textarea
                rows={2}
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="e.g. Pays via Fonepay QR, delivery through Pathao or courier branch..."
                className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-colors resize-none"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors shadow-xs focus:ring-2 focus:ring-indigo-500/20"
            >
              {initialData ? 'Save Changes' : 'Create Customer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
