import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';

// Layout & Route Guards
import { Layout } from './components/layout/Layout';
import { ProtectedRoute } from './components/layout/ProtectedRoute';

// Member 1: Auth & User Management
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';
import { ForgotPasswordPage } from './pages/auth/ForgotPasswordPage';
import { ResetPasswordPage } from './pages/auth/ResetPasswordPage';
import { StaffManagementPage } from './pages/auth/StaffManagementPage';
import { CustomerListPage } from './pages/auth/CustomerListPage';
import { CustomerProfilePage } from './pages/auth/CustomerProfilePage';
import { AccountSettingsPage } from './pages/auth/AccountSettingsPage';

// Member 2: Catalogue & Pricing
import { ProductListPage } from './pages/catalogue/ProductListPage';
import { AddEditProductPage } from './pages/catalogue/AddEditProductPage';
import { PlanListPage } from './pages/catalogue/PlanListPage';
import { AddEditPlanPage } from './pages/catalogue/AddEditPlanPage';
import { DiscountManagementPage } from './pages/catalogue/DiscountManagementPage';
import { TaxSettingsPage } from './pages/catalogue/TaxSettingsPage';

// Member 3: Quotations & Subscriptions
import { QuotationListPage } from './pages/subscriptions/QuotationListPage';
import { CreateQuotationPage } from './pages/subscriptions/CreateQuotationPage';
import { QuotationDetailPage } from './pages/subscriptions/QuotationDetailPage';
import { SubscriptionListPage } from './pages/subscriptions/SubscriptionListPage';
import { SubscriptionDetailPage } from './pages/subscriptions/SubscriptionDetailPage';
import { CustomerMySubscriptionsPage } from './pages/subscriptions/CustomerMySubscriptionsPage';

// Member 4: Finance & Invoicing
import { FinanceDashboardPage } from './pages/finance/FinanceDashboardPage';
import { InvoiceListPage } from './pages/finance/InvoiceListPage';
import { InvoiceDetailPage } from './pages/finance/InvoiceDetailPage';
import { PaymentListPage } from './pages/finance/PaymentListPage';
import { OverdueInvoicesPage } from './pages/finance/OverdueInvoicesPage';
import { RevenueReportPage } from './pages/finance/RevenueReportPage';
import { CustomerMyInvoicesPage } from './pages/finance/CustomerMyInvoicesPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 1000 * 60 * 2, // 2 minutes
      retry: 1,
    },
  },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Toaster position="top-right" richColors closeButton />
      <BrowserRouter>
        <Routes>
          {/* Public Authentication Pages */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />

          {/* Protected Application Wrapper */}
          <Route element={<ProtectedRoute />}>
            <Route element={<Layout />}>
              {/* Root redirect */}
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<FinanceDashboardPage />} />

              {/* Member 1: Staff & Customer Management */}
              <Route path="/staff" element={<StaffManagementPage />} />
              <Route path="/customers" element={<CustomerListPage />} />
              <Route path="/customers/:id" element={<CustomerProfilePage />} />
              <Route path="/settings" element={<AccountSettingsPage />} />

              {/* Member 2: Products & Catalogue */}
              <Route path="/products" element={<ProductListPage />} />
              <Route path="/products/new" element={<AddEditProductPage />} />
              <Route path="/products/:id" element={<AddEditProductPage />} />
              <Route path="/plans" element={<PlanListPage />} />
              <Route path="/plans/new" element={<AddEditPlanPage />} />
              <Route path="/plans/:id" element={<AddEditPlanPage />} />
              <Route path="/discounts" element={<DiscountManagementPage />} />
              <Route path="/taxes" element={<TaxSettingsPage />} />

              {/* Member 3: Quotations & Subscriptions */}
              <Route path="/quotations" element={<QuotationListPage />} />
              <Route path="/quotations/new" element={<CreateQuotationPage />} />
              <Route path="/quotations/:id" element={<QuotationDetailPage />} />
              <Route path="/subscriptions" element={<SubscriptionListPage />} />
              <Route path="/subscriptions/:id" element={<SubscriptionDetailPage />} />
              <Route path="/my-subscriptions" element={<CustomerMySubscriptionsPage />} />

              {/* Member 4: Finance, Invoices & Reports */}
              <Route path="/invoices" element={<InvoiceListPage />} />
              <Route path="/invoices/overdue" element={<OverdueInvoicesPage />} />
              <Route path="/invoices/:id" element={<InvoiceDetailPage />} />
              <Route path="/payments" element={<PaymentListPage />} />
              <Route path="/reports/revenue" element={<RevenueReportPage />} />
              <Route path="/my-invoices" element={<CustomerMyInvoicesPage />} />
            </Route>
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
