import { useState, useEffect } from "react";
import { reportService } from "../services/reportService";
import {
  CashFlowDto,
  ProfitAnalysisDto,
  ReportStatsDto,
  RevenueDataPointDto,
  TopSupplierDto,
  TopCustomerDto,
  AccountStatementFilterDto,
  ItemProfitabilityFilterDto,
  ItemMovementFilterDto,
  StockReportFilterDto,
} from "@/types/reports";
import { useQuery } from "@tanstack/react-query";
import { InvoiceFilterDto, PaginationDto } from "@/types/api";

export const useReports = () => {
  const [stats, setStats] = useState<ReportStatsDto | null>(null);
  const [revenueData, setRevenueData] = useState<RevenueDataPointDto[]>([]);
  const [topCustomers, setTopCustomers] = useState<TopCustomerDto[]>([]);
  const [topSuppliers, setTopSuppliers] = useState<TopSupplierDto[]>([]);
  const [cashFlow, setCashFlow] = useState<CashFlowDto | null>(null);
  const [profitAnalysis, setProfitAnalysis] =
    useState<ProfitAnalysisDto | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAllReports = async (period: string = "month", branchId?: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const [
        statsRes,
        revenueRes,
        customersRes,
        suppliersRes,
        cashFlowRes,
        profitRes,
      ] = await Promise.all([
        reportService.getStats(period, branchId),
        reportService.getRevenue(period, branchId),
        reportService.getTopCustomers(period, branchId),
        reportService.getTopSuppliers(period, branchId),
        reportService.getCashFlow(period, branchId),
        reportService.getProfitAnalysis(period, branchId),
      ]);

      if (statsRes.success) setStats(statsRes.data);
      if (revenueRes.success) setRevenueData(revenueRes.data);
      if (customersRes.success) {
        // Map the API response to match our expected TopCustomerDto format
        const mappedCustomers = customersRes.data.map((customer: any) => ({
          customerId: customer.customerId || customer.id || "",
          customerName: customer.customerName || customer.name || "",
          totalRevenue: customer.totalRevenue || 0,
          invoiceCount: customer.invoiceCount || 0,
          orders: customer.orders || customer.invoiceCount || 0,
          totalSpent: customer.totalSpent || customer.totalRevenue || 0,
          lastOrderDate: customer.lastOrderDate || "",
          status: customer.status || "active",
        }));
        setTopCustomers(mappedCustomers);
      }
      if (suppliersRes.success) setTopSuppliers(suppliersRes.data);
      if (cashFlowRes.success) setCashFlow(cashFlowRes.data);
      if (profitRes.success) setProfitAnalysis(profitRes.data);
    } catch (err) {
      setError("Failed to load reports");
    } finally {
      setIsLoading(false);
    }
  };

  return {
    stats,
    revenueData,
    topCustomers,
    topSuppliers,
    cashFlow,
    profitAnalysis,
    isLoading,
    error,
    fetchAllReports,
  };
};
export const useSalesInvoicesReport = (
  pagination: PaginationDto,
  filters?: InvoiceFilterDto
) => {
  return useQuery({
    queryKey: [pagination, filters],
    queryFn: () => reportService.getSalesInvoicesReport(pagination, filters),
    gcTime: 0, // Immediately remove from cache
    staleTime: 0, // Always consider data stale
  });
};
export const useExpensesReport = (
  pagination: PaginationDto,
  filters?: InvoiceFilterDto
) => {
  return useQuery({
    queryKey: ["invoices", "expenses", pagination, filters],
    queryFn: () => reportService.getExpensesReport(pagination, filters),
    gcTime: 0, // Immediately remove from cache
    staleTime: 0, // Always consider data stale
  });
};
export const useTransactionReport = (
  pagination: PaginationDto,
  filters?: InvoiceFilterDto
) => {
  return useQuery({
    queryKey: ["invoices", "expenses", pagination, filters],
    queryFn: () => reportService.getTransactionReport(pagination, filters),
    gcTime: 0, // Immediately remove from cache
    staleTime: 0, // Always consider data stale
  });
};
export const useAccountStatement = (filter: AccountStatementFilterDto) => {
  return useQuery({
    queryKey: ["account-statement", filter],
    queryFn: () => reportService.getAccountStatement(filter),
    enabled: !!filter.customerId, // Only fetch when customerId is provided
    gcTime: 0, // Immediately remove from cache
    staleTime: 0, // Always consider data stale
  });
};
export const useCurrentStockReport = (
  pagination: PaginationDto,
  filters?: StockReportFilterDto
) => {
  return useQuery({
    queryKey: ["current-stock", pagination, filters],
    queryFn: () => reportService.getCurrentStockReport(pagination, filters),
    gcTime: 0,
    staleTime: 0,
  });
};

export const useItemMovementReport = (filter: ItemMovementFilterDto) => {
  return useQuery({
    queryKey: ["item-movement", filter],
    queryFn: () => reportService.getItemMovementReport(filter),
    enabled: !!filter.itemId,
    gcTime: 0,
    staleTime: 0,
  });
};

export const useItemProfitabilityReport = (
  pagination: PaginationDto,
  filters?: ItemProfitabilityFilterDto
) => {
  return useQuery({
    queryKey: ["item-profitability", pagination, filters],
    queryFn: () =>
      reportService.getItemProfitabilityReport(pagination, filters),
    gcTime: 0,
    staleTime: 0,
  });
};

export const useLowStockReport = (pagination: PaginationDto) => {
  return useQuery({
    queryKey: ["low-stock", pagination],
    queryFn: () => reportService.getLowStockReport(pagination),
    gcTime: 0,
    staleTime: 0,
  });
};
