import { apiClient } from "@/services/api";
import { useEffect, useState } from "react";

// Breakdown interfaces for detailed tooltips
export interface RevenueBreakdown {
  paid: number;
  partialPaid: number;
  pending: number;
}

export interface ExpenseBreakdown {
  paid: number;
  partialPaid: number;
  pending: number;
}

export interface DashboardStats {
  // Existing fields
  totalRevenue: number;
  totalExpenses: number;
  netIncome: number;
  totalInvoices: number;
  paidInvoices: number;
  pendingAmount: number;
  overdueInvoices: number;
  totalCustomers: number;
  totalSuppliers: number;
  totalItems: number;
  activeItems: number;

  // New fields for enhanced dashboard
  currentBalance: number;
  totalCashAvailable: number;
  stockValue: number;
  totalReceivables: number;
  totalPayables: number;

  // Breakdown and date range for tooltips
  revenueBreakdown: RevenueBreakdown;
  expenseBreakdown: ExpenseBreakdown;
  startDate: string;
  endDate: string;
}

interface MonthlyFinancial {
  month: string;
  year: number;
  revenue: number;
  expenses: number;
  profit: number;
}

export interface RecentInvoice {
  id: string;
  invoiceNumber: string;
  customerName: string;
  status: string;
  total: number;
  issueDate: string;
  dueDate: string;
  createdAt: string;
  invoiceType: string;
}

export interface Transaction {
  date: string;
  type: string;
  reference: string;
  amount: number;
  paid: number;
  remaining: number;
}

export interface DashboardData {
  stats: DashboardStats;
  recentInvoices: RecentInvoice[];
  recentTransactions: Transaction[];
  monthlyFinancials: MonthlyFinancial[];
}
export const useDashboardReport = (period: string, branchId?: string, projectId?: string) => {
  const [data, setData] = useState<{ data: DashboardData } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        let url = `/api/dashboard?period=${period}`;
        if (branchId) {
          url += `&branchId=${branchId}`;
        }
        if (projectId) {
          url += `&projectId=${projectId}`;
        }
        const response = await apiClient.get<DashboardData>(url);
        if (response.success && response.data) {
          setData({ data: response.data });
        }
      } catch (error) {
        setError("Failed to fetch dashboard data");
        // Fallback data...
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [period, branchId, projectId]);

  return { data, isLoading, error };
};
