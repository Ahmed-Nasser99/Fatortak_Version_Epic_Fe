import React, { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { AuthProvider } from "./contexts/AuthContext";
import { LanguageProvider, useLanguage } from "./contexts/LanguageContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import AuthGuard from "./components/AuthGuard";
import MainLayout from "./components/Layout/MainLayout";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import SellInvoices from "./pages/SellInvoices";
import BuyInvoices from "./pages/BuyInvoices";
import Clients from "./pages/Clients";
import Projects from "./pages/Projects";
import Suppliers from "./pages/Suppliers";
import Items from "./pages/Items";
import Expenses from "./pages/Expenses";
import Reports from "./pages/Reports";
import ProjectSheetReport from "./pages/Reports/ProjectSheetReport";
import TreasuryReport from "./pages/Reports/TreasuryReport";
import SupplierLedgerReport from "./pages/Reports/SupplierLedgerReport";
import Team from "./pages/Team";
import Settings from "./pages/Settings";
import UserProfile from "./pages/UserProfile";
import AIChat from "./pages/AIChat";
import SubscriptionPlansPage from "./pages/SubscriptionPlansPage";
import NotFound from "./pages/NotFound";
import SubscriptionRequiredModal from "./components/modals/SubscriptionRequiredModal";
import { useSubscriptionModal } from "./hooks/useSubscriptionModal";
import { apiClient } from "./services/api";
import "./App.css";
import PaymentPage from "./pages/PaymentPage";
import PublicInvoicePage from "./pages/PublicInvoicePage";
import Notifications from "./pages/Notifications";
import Register from "./pages/Register";
import Welcome from "./pages/Welcome";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Employees from "./pages/Employees";
import Departments from "./pages/Departments";
import Attendances from "./pages/Attendances";
import OcrInvoicePage from "./pages/Ai/OcrInvoicePage";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import DailyAttendanceReport from "./pages/DailyAttendanceReport";
import MonthlyAttendanceReport from "./pages/MonthlyAttendanceReport";
import Payroll from "./pages/Payroll";
import InvoiceTemplateDemo from "./pages/InvoiceTemplate/InvoiceTemplateDemo";
import SalesInvoiceReport from "./pages/Reports/SalesInvoiceReport";
import ExpensesReport from "./pages/Reports/ExpensesReport";
import ClientAccountStatementReport from "./pages/Reports/ClientAccountStatementReport";
import SupplierAccountStatementReport from "./pages/Reports/SupplierAccountStatementReport";
import TransactionReport from "./pages/Reports/TransactionReport";

// 🆕 NEW IMPORTS - Stock Reports
import CurrentStockReport from "./pages/Reports/CurrentStockReport";
import ItemMovementReport from "./pages/Reports/ItemMovementReport";
import ItemProfitabilityReport from "./pages/Reports/ItemProfitabilityReport";
import ChartOfAccounts from "./pages/ChartOfAccounts";
import JournalEntries from "./pages/JournalEntries";
import FinancialReports from "./pages/FinancialReports";
import ExpenseCategories from "./pages/ExpenseCategories";
import Custody from "./pages/Custody";
import CreateProjectWithContractForm from "./pages/CreateProjectWithContractForm";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 0, // data becomes stale immediately
      gcTime: 0, // (old name: cacheTime) delete cached data immediately
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      refetchOnMount: true, // always refetch when component mounts
      retry: false,
      enabled: true,
    },
    mutations: {
      retry: false,
    },
  },
});

function AppContent() {
  const {
    showSubscriptionModal,
    handleSubscriptionRequired,
    closeSubscriptionModal,
    handleViewPlans,
  } = useSubscriptionModal();

  useEffect(() => {
    apiClient.setSubscriptionRequiredHandler(handleSubscriptionRequired);
  }, [handleSubscriptionRequired]);

  const { isRTL } = useLanguage();

  return (
    <>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/welcome"
          element={
            <AuthGuard>
              <Welcome />
            </AuthGuard>
          }
        />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route
          path="/invoice/:invoiceId/:invoiceTemplate?/:invoiceTemplateColor?"
          element={<PublicInvoicePage />}
        />

        <Route
          path="/"
          element={
            <AuthGuard>
              <MainLayout />
            </AuthGuard>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="sell-invoices" element={<SellInvoices />} />
          <Route path="buy-invoices" element={<BuyInvoices />} />
          <Route path="clients" element={<Clients />} />
          <Route path="projects" element={<Projects />} />
          <Route path="projects/new-with-contract" element={<CreateProjectWithContractForm />} />
          <Route path="suppliers" element={<Suppliers />} />
          <Route path="chart-of-accounts" element={<ChartOfAccounts />} />
          <Route path="expense-categories" element={<ExpenseCategories />} />
          <Route path="journal-entries" element={<JournalEntries />} />
          <Route path="custody" element={<Custody />} />
          <Route path="financial-reports" element={<FinancialReports />} />
          <Route path="items" element={<Items />} />
          <Route path="expenses" element={<Expenses />} />
          <Route path="reports" element={<Reports />} />
          <Route
            path="reports/salesInvoices"
            element={<SalesInvoiceReport />}
          />
          <Route path="reports/expenses" element={<ExpensesReport />} />
          <Route
            path="reports/clientAccountStatement"
            element={<ClientAccountStatementReport />}
          />
          <Route
            path="reports/supplierAccountStatement"
            element={<SupplierAccountStatementReport />}
          />
          <Route path="reports/transactions" element={<TransactionReport />} />

          {/* 🆕 NEW ROUTES - Stock Reports */}
          <Route
            path="reports/current-stock"
            element={<CurrentStockReport />}
          />
          <Route
            path="reports/item-movement"
            element={<ItemMovementReport />}
          />
          <Route
            path="reports/item-profitability"
            element={<ItemProfitabilityReport />}
          />

          <Route path="reports" element={<Reports />} />
          <Route path="reports/project-sheet" element={<ProjectSheetReport />} />
          <Route path="reports/treasury" element={<TreasuryReport />} />
          <Route path="reports/supplier-ledger" element={<SupplierLedgerReport />} />
          <Route path="team" element={<Team />} />
          <Route path="settings" element={<Settings />} />
          <Route path="employees" element={<Employees />} />
          <Route path="departments" element={<Departments />} />
          <Route path="attendances" element={<Attendances />} />
          <Route path="payroll" element={<Payroll />} />
          <Route path="daily-attendance" element={<DailyAttendanceReport />} />
          <Route
            path="monthly-attendance"
            element={<MonthlyAttendanceReport />}
          />
          <Route path="profile" element={<UserProfile />} />
          <Route path="notifications" element={<Notifications />} />
          <Route path="ai-chat" element={<AIChat />} />
          <Route path="ocr-invoice" element={<OcrInvoicePage />} />
          <Route
            path="invoice-templates/:invoiceType"
            element={<InvoiceTemplateDemo />}
          />
          <Route
            path="subscription-plans"
            element={<SubscriptionPlansPage />}
          />
          <Route path="payment" element={<PaymentPage />} />
        </Route>
        <Route path="*" element={<NotFound />} />
      </Routes>

      <SubscriptionRequiredModal
        isOpen={showSubscriptionModal}
        onClose={closeSubscriptionModal}
        onViewPlans={handleViewPlans}
      />
      <ToastContainer rtl={isRTL} />
    </>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <LanguageProvider>
          <AuthProvider>
            <Router>
              <AppContent />
            </Router>
          </AuthProvider>
        </LanguageProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
