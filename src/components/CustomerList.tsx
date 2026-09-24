import React, { useState } from 'react';
import {
  Search,
  Phone,
  MapPin,
  ChevronRight,
  Edit2,
  Trash2,
  Package,
  UserPlus,
  MessageCircle,
  Hash,
  Truck
} from 'lucide-react';
import { useCrm } from '../context/CrmContext';
import { CustomerWithSummary } from '../types/crm';
import { formatCurrency, formatDate, getWhatsAppLink } from '../utils/formatters';
import { CustomerModal } from './CustomerModal';
import { ConfirmDialog } from './ConfirmDialog';

interface CustomerListProps {
  onSelectCustomer: (id: string) => void;
  onAddNewCustomer: () => void;
}

export const CustomerList: React.FC<CustomerListProps> = ({
  onSelectCustomer,
  onAddNewCustomer,
}) => {
  const {
    filteredCustomers,
    searchQuery,
    setSearchQuery,
    filterStatus,
    setFilterStatus,
    deleteCustomer,
    updateCustomer,
    customersWithSummaries,
  } = useCrm();

  const [customerToEdit, setCustomerToEdit] = useState<CustomerWithSummary | null>(null);
  const [customerToDelete, setCustomerToDelete] = useState<CustomerWithSummary | null>(null);

  return (
    <div className="space-y-4">
      {/* Top Filter & Search Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
        {/* Search Input */}
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search by name, phone (+977), address, city, or PAN..."
            className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-xs text-slate-400 hover:text-slate-600"
            >
              Clear
            </button>
          )}
        </div>

        {/* Filter Segmented Control */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg text-xs font-medium self-start sm:self-auto">
          <button
            onClick={() => setFilterStatus('all')}
            className={`px-3 py-1.5 rounded-md transition-colors ${
              filterStatus === 'all'
                ? 'bg-white text-slate-900 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All ({customersWithSummaries.length})
          </button>
          <button
            onClick={() => setFilterStatus('pending')}
            className={`px-3 py-1.5 rounded-md transition-colors flex items-center gap-1.5 ${
              filterStatus === 'pending'
                ? 'bg-white text-slate-900 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
            Pending ({customersWithSummaries.filter(c => c.remainingPayment > 0).length})
          </button>
          <button
            onClick={() => setFilterStatus('paid')}
            className={`px-3 py-1.5 rounded-md transition-colors flex items-center gap-1.5 ${
              filterStatus === 'paid'
                ? 'bg-white text-slate-900 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            Settled ({customersWithSummaries.filter(c => c.remainingPayment === 0 && c.totalCost > 0).length})
          </button>
        </div>

        {/* Add Customer Button */}
        <button
          onClick={onAddNewCustomer}
          className="inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors shadow-xs shrink-0"
        >
          <UserPlus className="w-4 h-4" />
          Add Customer
        </button>
      </div>

      {/* Customer Cards / Table */}
      {filteredCustomers.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-xl border border-dashed border-slate-300">
          <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400 mb-3">
            <Search className="w-6 h-6" />
          </div>
          <h3 className="text-base font-semibold text-slate-900">No customers found</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            {searchQuery
              ? `No customer matches "${searchQuery}". Try searching for another name, phone number, or city.`
              : 'Add your first customer to manage orders, payments, and profit.'}
          </p>
          {!searchQuery && (
            <button
              onClick={onAddNewCustomer}
              className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors"
            >
              <UserPlus className="w-3.5 h-3.5" />
              Add Customer
            </button>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50/75 text-slate-600 border-b border-slate-200 font-semibold uppercase tracking-wider">
                  <th className="p-3.5">Customer & Location</th>
                  <th className="p-3.5">Phone & Contact</th>
                  <th className="p-3.5 text-center">Orders</th>
                  <th className="p-3.5 text-right">Total Paid (Rs.)</th>
                  <th className="p-3.5 text-right">Remaining Due (Rs.)</th>
                  <th className="p-3.5 text-right">Profit (Rs.)</th>
                  <th className="p-3.5 text-center w-24">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredCustomers.map(customer => (
                  <tr
                    key={customer.id}
                    onClick={() => onSelectCustomer(customer.id)}
                    className="hover:bg-indigo-50/30 transition-colors cursor-pointer group"
                  >
                    {/* Name & City */}
                    <td className="p-3.5 align-middle">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm text-slate-900 group-hover:text-indigo-600 transition-colors">
                          {customer.name}
                        </span>
                        {customer.city && (
                          <span className="text-[10px] font-medium px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded">
                            {customer.city}
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5 truncate max-w-xs flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                        <span className="truncate">{customer.address}</span>
                      </div>
                      {customer.panNumber && (
                        <div className="text-[10px] text-indigo-700 font-mono mt-0.5 flex items-center gap-1">
                          <Hash className="w-2.5 h-2.5" />
                          PAN: {customer.panNumber}
                        </div>
                      )}
                    </td>

                    {/* Phone & WhatsApp */}
                    <td className="p-3.5 align-middle">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-slate-800 font-medium">{customer.phone}</span>
                        <a
                          href={getWhatsAppLink(customer.phone, customer.name)}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={e => e.stopPropagation()}
                          className="p-1 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 rounded transition-colors"
                          title="Chat on WhatsApp"
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                        </a>
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        Added {formatDate(customer.createdAt)}
                      </div>
                    </td>

                    {/* Orders count & Delivery */}
                    <td className="p-3.5 align-middle text-center">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-slate-100 rounded text-slate-700 font-mono font-medium">
                        <Package className="w-3 h-3 text-slate-400" />
                        {customer.ordersCount} ({customer.productsCount} items)
                      </span>
                      {customer.totalDeliveryCharge > 0 && (
                        <div className="text-[11px] text-blue-700 font-medium flex items-center justify-center gap-1 mt-1 font-mono">
                          <Truck className="w-3 h-3 text-blue-500" />
                          Delivery: {formatCurrency(customer.totalDeliveryCharge)}
                        </div>
                      )}
                    </td>

                    {/* Total Paid */}
                    <td className="p-3.5 align-middle text-right font-mono font-medium text-emerald-600 text-sm">
                      {formatCurrency(customer.customerPayment)}
                      <span className="block text-[11px] text-slate-400 font-sans font-normal">
                        of {formatCurrency(customer.totalCost)}
                      </span>
                    </td>

                    {/* Remaining Payment */}
                    <td className="p-3.5 align-middle text-right font-mono text-sm">
                      {customer.remainingPayment > 0 ? (
                        <span className="font-bold text-amber-600">
                          {formatCurrency(customer.remainingPayment)}
                        </span>
                      ) : customer.totalCost > 0 ? (
                        <span className="text-emerald-600 font-medium text-xs">Settled ✓</span>
                      ) : (
                        <span className="text-slate-400 text-xs">Rs. 0</span>
                      )}
                    </td>

                    {/* Total Profit */}
                    <td className="p-3.5 align-middle text-right font-mono font-bold text-slate-900 text-sm">
                      <span className="text-indigo-700">{formatCurrency(customer.profit)}</span>
                    </td>

                    {/* Quick Row Actions */}
                    <td 
                      className="p-3.5 align-middle text-center"
                      onClick={e => e.stopPropagation()}
                    >
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => setCustomerToEdit(customer)}
                          className="p-1.5 text-slate-400 hover:text-slate-700 rounded-md hover:bg-slate-100 transition-colors"
                          title="Edit customer details"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setCustomerToDelete(customer)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 rounded-md hover:bg-rose-50 transition-colors"
                          title="Delete customer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onSelectCustomer(customer.id)}
                          className="p-1.5 text-indigo-600 hover:text-indigo-800 rounded-md hover:bg-indigo-50 transition-colors"
                          title="View customer record"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Edit Customer Modal */}
      {customerToEdit && (
        <CustomerModal
          isOpen={true}
          onClose={() => setCustomerToEdit(null)}
          initialData={customerToEdit}
          onSubmit={data => {
            updateCustomer(customerToEdit.id, data);
            setCustomerToEdit(null);
          }}
        />
      )}

      {/* Confirm Delete Customer Modal */}
      {customerToDelete && (
        <ConfirmDialog
          isOpen={true}
          title="Delete Customer"
          message={`Are you sure you want to delete ${customerToDelete.name}? This will remove all their product orders and payment records.`}
          confirmLabel="Delete Customer"
          onConfirm={() => {
            deleteCustomer(customerToDelete.id);
            setCustomerToDelete(null);
          }}
          onCancel={() => setCustomerToDelete(null)}
        />
      )}
    </div>
  );
};
