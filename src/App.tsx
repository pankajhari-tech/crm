import React, { useState } from 'react';
import { CrmProvider, useCrm } from './context/CrmContext';
import { Navbar } from './components/Navbar';
import { CustomerList } from './components/CustomerList';
import { CustomerDetail } from './components/CustomerDetail';
import { CustomerModal } from './components/CustomerModal';

function MainLayout() {
  const {
    selectedCustomerId,
    setSelectedCustomerId,
    addCustomer,
  } = useCrm();

  const [isAddCustomerModalOpen, setIsAddCustomerModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-100/60 text-slate-900 flex flex-col antialiased">
      {/* Navbar with CRM metrics and global actions */}
      <Navbar
        onAddNewCustomer={() => setIsAddCustomerModalOpen(true)}
        onGoHome={() => setSelectedCustomerId(null)}
      />

      {/* Main CRM Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {selectedCustomerId ? (
          <CustomerDetail
            customerId={selectedCustomerId}
            onBack={() => setSelectedCustomerId(null)}
          />
        ) : (
          <CustomerList
            onSelectCustomer={id => setSelectedCustomerId(id)}
            onAddNewCustomer={() => setIsAddCustomerModalOpen(true)}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>ClientPulse CRM · Nepal Business Edition (NPR / Rs.)</span>
          <span className="text-slate-400">Fonepay · eSewa · Khalti · COD · Local Browser Persistence</span>
        </div>
      </footer>

      {/* Global Add Customer Modal */}
      <CustomerModal
        isOpen={isAddCustomerModalOpen}
        onClose={() => setIsAddCustomerModalOpen(false)}
        onSubmit={data => {
          const newCust = addCustomer(data);
          // Automatically open new customer profile
          setSelectedCustomerId(newCust.id);
        }}
      />
    </div>
  );
}

export default function App() {
  return (
    <CrmProvider>
      <MainLayout />
    </CrmProvider>
  );
}
