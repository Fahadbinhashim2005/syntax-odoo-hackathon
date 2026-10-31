import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

const titleMap: Record<string, string> = {
  '/dashboard': 'Executive Overview',
  '/products': 'Products & Services',
  '/plans': 'Subscription Plans',
  '/discounts': 'Promotions & Discounts',
  '/taxes': 'Taxation & GST Rules',
  '/quotations': 'Quotation Pipeline',
  '/quotations/new': 'Create Quotation',
  '/subscriptions': 'Active Subscriptions',
  '/invoices': 'Invoices & Billing',
  '/invoices/overdue': 'Overdue Invoices',
  '/payments': 'Payment History',
  '/reports/revenue': 'Revenue Intelligence',
  '/customers': 'Customer CRM',
  '/staff': 'Staff Management',
  '/settings': 'Account Settings',
  '/my-subscriptions': 'My Subscriptions',
  '/my-invoices': 'My Invoices',
};

export const Layout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  const getPageTitle = () => {
    if (titleMap[location.pathname]) return titleMap[location.pathname];
    if (location.pathname.startsWith('/products/')) return 'Product Details';
    if (location.pathname.startsWith('/quotations/')) return 'Quotation View';
    if (location.pathname.startsWith('/subscriptions/')) return 'Subscription Details';
    if (location.pathname.startsWith('/invoices/')) return 'Invoice Details';
    if (location.pathname.startsWith('/customers/')) return 'Customer Profile';
    return 'Brightloop';
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar Navigation */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Page Area */}
      <div className="flex-1 lg:pl-64 flex flex-col min-w-0">
        <Header onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} title={getPageTitle()} />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
