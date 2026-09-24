import React, { useState, useRef } from 'react';
import {
  Users,
  DollarSign,
  TrendingUp,
  Download,
  Upload,
  RotateCcw,
  UserPlus,
  HelpCircle,
  X,
  Truck
} from 'lucide-react';
import { useCrm } from '../context/CrmContext';
import { formatCurrency } from '../utils/formatters';

interface NavbarProps {
  onAddNewCustomer: () => void;
  onGoHome: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onAddNewCustomer, onGoHome }) => {
  const { overallMetrics, resetToDemoData, exportDataJson, importDataJson } = useCrm();
  const [showDataMenu, setShowDataMenu] = useState(false);
  const [importStatus, setImportStatus] = useState<string>('');
  const [showFormulaModal, setShowFormulaModal] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = () => {
    const jsonStr = exportDataJson();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `nepal-crm-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setShowDataMenu(false);
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = event => {
      const content = event.target?.result as string;
      const success = importDataJson(content);
      if (success) {
        setImportStatus('Nepal CRM data imported successfully!');
        setTimeout(() => {
          setImportStatus('');
          setShowDataMenu(false);
        }, 2000);
      } else {
        setImportStatus('Invalid JSON backup file');
      }
    };
    reader.readAsText(file);
  };

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-2xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Bar */}
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo & Brand */}
          <div 
            onClick={onGoHome}
            className="flex items-center gap-3 cursor-pointer group shrink-0"
          >
            <div className="w-10 h-10 rounded-xl bg-indigo-700 text-white flex items-center justify-center shadow-xs group-hover:bg-indigo-800 transition-colors">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base font-bold tracking-tight text-slate-900">
                  ClientPulse CRM
                </span>
                <span className="text-[10px] uppercase font-bold tracking-wider text-rose-700 bg-rose-50 border border-rose-200 px-1.5 py-0.5 rounded">
                  Nepal 🇳🇵
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden sm:block">
                Customers · Products · Payments (eSewa/Fonepay) · Profit (NPR)
              </p>
            </div>
          </div>

          {/* Quick Metrics strip (Desktop) */}
          <div className="hidden lg:flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1.5 text-slate-600">
              <Users className="w-3.5 h-3.5 text-slate-400" />
              <span>Customers:</span>
              <strong className="text-slate-900 font-mono font-semibold">{overallMetrics.totalCustomers}</strong>
            </div>

            <span aria-hidden="true" className="text-slate-300">·</span>

            <div className="flex items-center gap-1.5 text-slate-600">
              <Truck className="w-3.5 h-3.5 text-blue-600" />
              <span>Delivery:</span>
              <strong className="text-blue-700 font-mono font-semibold">{formatCurrency(overallMetrics.totalDeliveryCharges)}</strong>
            </div>

            <span aria-hidden="true" className="text-slate-300">·</span>

            <div className="flex items-center gap-1.5 text-slate-600">
              <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
              <span>Paid:</span>
              <strong className="text-emerald-600 font-mono font-semibold">{formatCurrency(overallMetrics.totalPaid)}</strong>
            </div>

            <span aria-hidden="true" className="text-slate-300">·</span>

            <div className="flex items-center gap-1.5 text-slate-600">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
              <span>Remaining:</span>
              <strong className="text-amber-600 font-mono font-semibold">{formatCurrency(overallMetrics.totalRemaining)}</strong>
            </div>

            <span aria-hidden="true" className="text-slate-300">·</span>

            <div className="flex items-center gap-1.5 text-slate-600">
              <TrendingUp className="w-3.5 h-3.5 text-indigo-600" />
              <span>Total Profit:</span>
              <strong className="text-indigo-600 font-mono font-bold">{formatCurrency(overallMetrics.totalProfit)}</strong>
              <button
                onClick={() => setShowFormulaModal(true)}
                className="text-slate-400 hover:text-indigo-600 ml-0.5"
                title="View automatic profit calculation details"
              >
                <HelpCircle className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2.5">
            {/* Data options dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowDataMenu(!showDataMenu)}
                className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                title="Data backup and reset"
              >
                Data Options
              </button>

              {showDataMenu && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-40 text-xs text-slate-700">
                  <div className="px-3 py-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    Nepal CRM Data
                  </div>
                  <button
                    onClick={handleExport}
                    className="w-full text-left px-3 py-2 hover:bg-slate-50 flex items-center gap-2"
                  >
                    <Download className="w-4 h-4 text-slate-500" />
                    Export Backup (JSON)
                  </button>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full text-left px-3 py-2 hover:bg-slate-50 flex items-center gap-2"
                  >
                    <Upload className="w-4 h-4 text-slate-500" />
                    Import Backup (JSON)
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".json"
                    className="hidden"
                    onChange={handleImportFile}
                  />
                  <div className="border-t border-slate-100 my-1"></div>
                  <button
                    onClick={() => {
                      if (window.confirm('Reset all CRM data to Nepal business sample records?')) {
                        resetToDemoData();
                        setShowDataMenu(false);
                      }
                    }}
                    className="w-full text-left px-3 py-2 text-rose-600 hover:bg-rose-50 flex items-center gap-2"
                  >
                    <RotateCcw className="w-4 h-4" />
                    Reset to Nepal Demo Data
                  </button>
                  {importStatus && (
                    <div className="px-3 py-1 text-[11px] text-indigo-600 font-medium bg-indigo-50 mt-1">
                      {importStatus}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Add Customer Primary Button */}
            <button
              onClick={onAddNewCustomer}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors shadow-xs"
            >
              <UserPlus className="w-3.5 h-3.5" />
              Add Customer
            </button>
          </div>
        </div>

        {/* Mobile metrics strip */}
        <div className="lg:hidden flex items-center justify-between py-2 border-t border-slate-100 text-[11px] text-slate-600 overflow-x-auto gap-3">
          <div>Delivery: <strong className="font-mono text-blue-700">{formatCurrency(overallMetrics.totalDeliveryCharges)}</strong></div>
          <div>Paid: <strong className="font-mono text-emerald-600">{formatCurrency(overallMetrics.totalPaid)}</strong></div>
          <div>Remaining: <strong className="font-mono text-amber-600">{formatCurrency(overallMetrics.totalRemaining)}</strong></div>
          <div>Profit: <strong className="font-mono text-indigo-600">{formatCurrency(overallMetrics.totalProfit)}</strong></div>
        </div>
      </div>

      {/* Automatic Profit Formula Modal */}
      {showFormulaModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-semibold text-slate-900 text-sm flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-indigo-600" />
                Automatic Profit & Billing Breakdown (Nepal)
              </h3>
              <button
                onClick={() => setShowFormulaModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="py-4 space-y-3 text-xs text-slate-600">
              <p>
                In <strong>ClientPulse CRM</strong>, profit and total billing are calculated automatically in Nepalese Rupees (Rs.) for every customer order:
              </p>

              <div className="bg-slate-50 p-3 rounded-lg font-mono text-slate-800 space-y-1.5 border border-slate-200">
                <div className="text-slate-900 font-semibold">Total Cost = Product Cost + Delivery Charge + Other Charges</div>
                <div className="text-emerald-700 font-semibold">
                  Automatic Profit = Total Cost - Total Wholesale Purchase Cost
                </div>
                <div className="text-amber-700">Remaining Payment = Total Cost - Customer Payment</div>
              </div>

              <div className="p-2.5 bg-blue-50/60 rounded border border-blue-100 text-[11px] text-blue-900 space-y-1">
                <div><strong>Delivery Logistics (Nepal):</strong> Pathao Parcel, InDrive Delivery, Nepal Can Move (NCM), Sundar Courier, Post/EMS, Store Pickup.</div>
                <div><strong>Delivery Charge Presets:</strong> Free (Rs. 0), Inside Valley (Rs. 100/150), Outside Valley (Rs. 250/350).</div>
              </div>

              <div className="p-2.5 bg-indigo-50/60 rounded border border-indigo-100 text-[11px] text-indigo-900 space-y-1">
                <div><strong>Nepali Gateways Supported:</strong> Fonepay / QR, eSewa, Khalti, Cash on Delivery (COD), ConnectIPS, Cheque.</div>
              </div>
            </div>

            <button
              onClick={() => setShowFormulaModal(false)}
              className="w-full mt-2 py-2 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
