"use client";

import type React from "react";
import { useEffect, useState } from "react";
import {
  Plus,
  Search,
  Filter,
  Download,
  Eye,
  Edit,
  Trash2,
  Send,
  Calendar,
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Users,
  MoreVertical,
  Share2,
  MoreHorizontal,
} from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  useInvoices,
  useDeleteInvoice,
  useDuplicateInvoice,
  useSendInvoice,
  useInvoice,
  useUpdateInvoiceStatus,
} from "@/hooks/useInvoices";
import type { PaginationDto, InvoiceFilterDto } from "@/types/api";
import { toast } from "react-toastify";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import EnhancedInvoiceModal from "@/components/modals/EnhancedInvoiceModal";
import InvoiceDetailsModal from "@/components/modals/InvoiceDetailsModal";
import InvoiceFilterModal from "@/components/modals/InvoiceFilterModal";
import InvoiceUpdateModal from "@/components/modals/InvoiceUpdateModal";
import { useRoleAccess } from "@/hooks/useRoleAccess";
import { formatCurrency } from "@/Helpers/formatCurrency";
import { formatNumber, formatDate } from "@/Helpers/localization";
import IntegratedInstallmentsManager from "@/components/modals/InstallmentsManager";
import { useExpensesReport, useSalesInvoicesReport } from "@/hooks/useReports";
import ExpenseDetailsModal from "@/components/modals/ExpenseDetailsModal";
import { ReportExportButton } from "@/components/reports/ReportExportButton";
import { useAuth } from "@/contexts/AuthContext";

// Add the Transaction interface
export interface Transaction {
  date: string;
  type: string;
  reference: string;
  amount: number;
  paid: number;
  remaining: number;
  targetId?: string;
}

const ExpensesReport: React.FC = () => {
  const roleAccess = useRoleAccess();
  const { t, isRTL } = useLanguage();
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState("");
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [editInvoiceId, setEditInvoiceId] = useState<string | null>(null);
  const [deleteInvoiceId, setDeleteInvoiceId] = useState<string | null>(null);
  const [installmentsInvoiceId, setInstallmentsInvoiceId] = useState<
    string | null
  >(null);
  const [viewInvoiceId, setViewInvoiceId] = useState<string | null>(null);

  // Add state for expense details modal
  const [viewExpense, setViewExpense] = useState<Transaction | null>(null);

  const [filters, setFilters] = useState<InvoiceFilterDto>({
    invoiceType: "buy",
  });
  const [isExporting, setIsExporting] = useState(false);
  const handleApplyFilters = (newFilters: any) => {
    const updatedFilters = {
      ...newFilters,
      invoiceType: "Sell",
      expensesStatus: statusFilter || "",
    };
    setFilters(updatedFilters);
    setPagination((prev) => ({ ...prev, pageNumber: 1 }));
    setIsFilterModalOpen(false);
  };
  // Pagination state
  const [pagination, setPagination] = useState<PaginationDto>({
    pageNumber: 1,
    pageSize: 10,
  });

  // Fetch expenses with filters
  const {
    data: expensesResponse,
    isLoading,
    error,
    refetch,
  } = useExpensesReport(pagination, filters);

  // Update mapping to use Transaction DTO
  const expenses: Transaction[] = expensesResponse?.success
    ? expensesResponse.data?.data || []
    : [];
  const totalCount = expensesResponse?.success
    ? expensesResponse.data?.totalCount || 0
    : 0;

  const expenseStats = expensesResponse?.success
    ? expensesResponse.data?.metaData || {}
    : {};

  useEffect(() => {
    if (filters.expensesStatus !== statusFilter) {
      setFilters((prev) => ({ ...prev, expensesStatus: statusFilter }));
    }
  }, [statusFilter, filters.expensesStatus]);
  // Calculate stats with new structure
  const stats = {
    totalPurchased: formatCurrency(expenseStats?.totalPurchased || 0),
    totalPaid: formatCurrency(expenseStats?.totalPaid || 0),
    totalPayables: formatCurrency(expenseStats?.totalPayables || 0),
    totalCount: expenseStats?.totalCount || 0,
  };

  const handleCloseExpenseModal = () => {
    setViewExpense(null);
  };

  const handleViewExpenseDetails = (expense: Transaction) => {
    setViewExpense(expense);
  };
  const handleDownloadExpense = (expenseId: string) => {
    toast.info(t("downloadingExpense"));
  };

  const handleExport = async (format: "excel" | "pdf") => {
    try {
      setIsExporting(true);
      const queryParams = new URLSearchParams();

      // Add filters
      if (filters.startDate) queryParams.append("startDate", filters.startDate);
      if (filters.endDate) queryParams.append("endDate", filters.endDate);
      if (filters.expensesStatus)
        queryParams.append("expensesStatus", filters.expensesStatus);
      if (filters.search) queryParams.append("search", filters.search);
      queryParams.append("invoiceType", "buy");

      queryParams.append("format", format);
      queryParams.append("lang", isRTL ? "ar" : "en");

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/reports/expenses/export?${queryParams.toString()}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
          },
        },
      );

      if (!response.ok) throw new Error("Export failed");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Expenses_Report_${new Date().toISOString().split("T")[0]}.${format === "excel" ? "xlsx" : "pdf"}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success(t("exportSuccess") || "Report exported successfully");
    } catch (error) {
      console.error("Export error:", error);
      toast.error(t("exportError") || "Failed to export report");
    } finally {
      setIsExporting(false);
    }
  };

  const handleDownloadExpenseFromModal = (expense: Transaction) => {
    toast.info(
      isRTL
        ? `جاري تحميل ${expense.reference}`
        : `Downloading ${expense.reference}`,
    );
    // Add your download logic here
  };

  const getTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case "purchase":
        return "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400";
      case "salary":
        return "bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/20 dark:text-purple-400";
      case "utility":
        return "bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/20 dark:text-orange-400";
      case "rent":
        return "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-400";
      case "other":
        return "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900/20 dark:text-gray-400";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900/20 dark:text-gray-400";
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case "purchase":
        return <FileText className="w-3 h-3" />;
      case "salary":
        return <Users className="w-3 h-3" />;
      case "utility":
        return <AlertCircle className="w-3 h-3" />;
      case "rent":
        return <CheckCircle className="w-3 h-3" />;
      case "other":
        return <MoreHorizontal className="w-3 h-3" />;
      default:
        return <FileText className="w-3 h-3" />;
    }
  };

  const formatTypeText = (type: string) => {
    switch (type.toLowerCase()) {
      case "purchase":
        return isRTL ? "شراء" : "Purchase";
      case "salary":
        return isRTL ? "مرتبات" : "Salary";
      case "utility":
        return isRTL ? "مرافق" : "Utility";
      case "rent":
        return isRTL ? "إيجار" : "Rent";
      case "other":
        return isRTL ? "أخرى" : "Other";
      default:
        return type;
    }
  };

  const handlePageChange = (newPage: number) => {
    setPagination((prev) => ({ ...prev, pageNumber: newPage }));
  };
  const handleViewInvoice = (invoiceId: string) => {
    setViewInvoiceId(invoiceId);
  };
  const handleCloseDetailsModal = () => {
    setViewInvoiceId(null);
  };
  const { data: singleInvoiceResponse, isLoading: isLoadingDetails } =
    useInvoice(viewInvoiceId || editInvoiceId || "");

  const invoiceDetails = singleInvoiceResponse?.success
    ? singleInvoiceResponse.data
    : null;
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
        <div className="flex items-center justify-center min-h-screen">
          <Card className="w-full max-w-md mx-4">
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="w-8 h-8 text-destructive" />
              </div>
              <h2 className="text-xl font-semibold text-destructive mb-2">
                {t("errorLoadingExpenses")}
              </h2>
              <p className="text-muted-foreground mb-6">
                {error instanceof Error
                  ? error.message
                  : "Unknown error occurred"}
              </p>
              <Button onClick={() => refetch()} className="w-full">
                {t("retry")}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="container !max-w-full mx-auto p-4 space-y-6">
        {/* Enhanced Header */}
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 backdrop-blur-3xl" />
          <div className="relative bg-card/40 backdrop-blur-sm border rounded-2xl p-6 shadow-lg">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div
                className={`space-y-2 ${isRTL ? "text-right" : "text-left"}`}
              >
                <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                  {t("expensesReport")}
                </h1>
              </div>
              <div className="flex items-center gap-3">
                <ReportExportButton
                  onExport={handleExport}
                  isLoading={isExporting}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Stats Grid - Updated with new structure */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-950/20 dark:to-gray-900/20 border-gray-200 dark:border-gray-800 hover:shadow-lg transition-all duration-300">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                    {t("totalPurchases")}
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    {stats.totalPurchased}
                  </p>
                </div>
                <div className="w-12 h-12 bg-gray-500/20 rounded-xl flex items-center justify-center">
                  <Clock className="w-6 h-6 text-gray-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-950/20 dark:to-emerald-900/20 border-emerald-200 dark:border-emerald-800 hover:shadow-lg transition-all duration-300">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-emerald-600 dark:text-emerald-400 font-medium">
                    {t("totalPaid")}
                  </p>
                  <p className="text-2xl font-bold text-emerald-900 dark:text-emerald-100">
                    {stats.totalPaid}
                  </p>
                </div>
                <div className="w-12 h-12 bg-emerald-500/20 rounded-xl flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-emerald-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-950/20 dark:to-yellow-900/20 border-yellow-200 dark:border-yellow-800 hover:shadow-lg transition-all duration-300">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-yellow-600 dark:text-yellow-400 font-medium">
                    {t("totalPayables")}
                  </p>
                  <p className="text-2xl font-bold text-yellow-900 dark:text-yellow-100">
                    {stats.totalPayables}
                  </p>
                </div>
                <div className="w-12 h-12 bg-yellow-500/20 rounded-xl flex items-center justify-center">
                  <Clock className="w-6 h-6 text-yellow-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/20 dark:to-blue-900/20 border-blue-200 dark:border-blue-800 hover:shadow-lg transition-all duration-300">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">
                    {t("totalExpensesCount")}
                  </p>
                  <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                    {formatNumber(stats.totalCount)}
                  </p>
                </div>
                <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
                  <FileText className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Enhanced Filters */}
        <Card className="bg-card/60 backdrop-blur-sm border shadow-sm">
          <CardContent className="p-6">
            <div className="flex flex-col xl:flex-row gap-4">
              <div className="flex-1 relative">
                <Search
                  className={`absolute top-1/2 transform -translate-y-1/2 ${
                    isRTL ? "right-4" : "left-4"
                  } w-5 h-5 text-muted-foreground`}
                />
                <input
                  type="text"
                  placeholder={t("searchExpenses")}
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    // Add search term to filters
                    setFilters((prev) => ({ ...prev, search: e.target.value }));
                  }}
                  className={`w-full py-3 px-4 ${
                    isRTL ? "pr-12 text-right" : "pl-12"
                  } border rounded-xl bg-background/60 backdrop-blur-sm focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-200`}
                />
              </div>
              <div className="flex gap-2">
                <select
                  value={statusFilter || ""} // Use filters state directly
                  onChange={(e) => {
                    setStatusFilter(e.target.value);
                  }}
                  className={`w-full py-3 px-4 border rounded-xl bg-background/60 backdrop-blur-sm focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-200 ${
                    isRTL ? "text-right" : ""
                  }`}
                >
                  <option value="">
                    {t("allTypes")}
                  </option>
                  <option value="purchase">
                    {isRTL ? "شراء" : "Purchase"}
                  </option>
                  <option value="salary">{isRTL ? "مرتبات" : "Salary"}</option>
                  <option value="expense">
                    {isRTL ? "مصاريف" : "Expense"}
                  </option>
                </select>
                <Button
                  variant="outline"
                  onClick={() => setIsFilterModalOpen(true)}
                  className="bg-background/60 backdrop-blur-sm hover:bg-background/80"
                >
                  <Filter className="w-4 h-4 mr-2" />
                  {t("moreFilters")}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Loading State */}
        {isLoading && (
          <Card className="bg-card/60 backdrop-blur-sm">
            <CardContent className="p-12">
              <div className="flex items-center justify-center space-x-3">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent"></div>
                <span className="text-muted-foreground text-lg">
                  {t("loadingExpenses")}
                </span>
              </div>
            </CardContent>
          </Card>
        )}

        {!isLoading && (
          <Card className="bg-card/60 backdrop-blur-sm border shadow-sm">
            {/* Desktop Table */}
            <div className="hidden lg:block">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b bg-muted/30">
                      <th
                        className={`px-6 py-4 text-${
                          isRTL ? "right" : "left"
                        } text-sm font-semibold text-muted-foreground`}
                      >
                        {t("date")}
                      </th>
                      <th
                        className={`px-6 py-4 text-${
                          isRTL ? "right" : "left"
                        } text-sm font-semibold text-muted-foreground`}
                      >
                        {t("type")}
                      </th>
                      <th
                        className={`px-6 py-4 text-${
                          isRTL ? "right" : "left"
                        } text-sm font-semibold text-muted-foreground`}
                      >
                        {t("reference")}
                      </th>
                      <th
                        className={`px-6 py-4 text-${
                          isRTL ? "right" : "left"
                        } text-sm font-semibold text-muted-foreground`}
                      >
                        {t("amount")}
                      </th>
                      <th
                        className={`px-6 py-4 text-${
                          isRTL ? "right" : "left"
                        } text-sm font-semibold text-muted-foreground`}
                      >
                        {t("paid")}
                      </th>
                      <th
                        className={`px-6 py-4 text-${
                          isRTL ? "right" : "left"
                        } text-sm font-semibold text-muted-foreground`}
                      >
                        {t("remaining")}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/50">
                    {expenses.map((expense: Transaction, index: number) => (
                      <tr
                        key={index}
                        className="hover:bg-muted/20 transition-colors"
                      >
                        <td className="px-6 py-4 !text-start">
                          <div className="flex items-center space-x-2">
                            <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                              <Calendar className="w-4 h-4 text-primary" />
                            </div>
                            <span className="font-medium">
                              {formatDate(expense.date)}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 !text-start">
                          <div className="relative">
                            <Button
                              variant="ghost"
                              disabled
                              className={`h-auto p-2 ${getTypeColor(
                                expense.type,
                              )} border !opacity-100 !hover:opacity-80`}
                            >
                              <div className="flex items-center space-x-2">
                                {getTypeIcon(expense.type)}
                                <span className="text-xs font-medium">
                                  {formatTypeText(expense.type)}
                                </span>
                              </div>
                            </Button>
                          </div>
                        </td>
                        <td className="px-6 py-4 !text-start">
                          <div className="flex items-center space-x-2">
                            <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
                              <FileText className="w-4 h-4 text-muted-foreground" />
                            </div>
                            <span
                              className="cursor-pointer text-blue-500 hover:text-blue-700 hover:underline"
                              onClick={() =>
                                expense.type == "Purchase"
                                  ? handleViewInvoice(expense.targetId)
                                  : handleViewExpenseDetails(expense)
                              }
                            >
                              {expense.reference}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 font-semibold !text-start">
                          {formatCurrency(expense.amount)} EGP
                        </td>
                        <td className="px-6 py-4 !text-start">
                          <span className="text-emerald-600 font-medium">
                            {formatCurrency(expense.paid)} EGP
                          </span>
                        </td>
                        <td className="px-6 py-4 !text-start">
                          <span className="text-orange-600 font-medium">
                            {formatCurrency(expense.remaining)} EGP
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Mobile Cards */}
            <div className="lg:hidden divide-y divide-border/50">
              {expenses.map((expense: Transaction, index: number) => (
                <div key={index} className="p-4 space-y-4">
                  <div className={`flex items-start justify-between`}>
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                        <Calendar className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <h3
                          className="font-semibold cursor-pointer text-blue-500 hover:text-blue-700"
                          onClick={() =>
                            expense.type == "Purchase"
                              ? handleViewInvoice(expense.targetId)
                              : handleViewExpenseDetails(expense)
                          }
                        >
                          {new Date(expense.date).toLocaleDateString()}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {expense.reference}
                        </p>
                      </div>
                    </div>
                    <Badge className={`${getTypeColor(expense.type)} border`}>
                      <div className="flex items-center space-x-1">
                        {getTypeIcon(expense.type)}
                        <span className="text-xs">
                          {formatTypeText(expense.type)}
                        </span>
                      </div>
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground block">
                        {t("amount")}
                      </span>
                      <span className="font-semibold">
                        {formatCurrency(expense.amount)} EGP
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground block">
                        {t("paid")}
                      </span>
                      <span className="text-emerald-600">
                        {formatCurrency(expense.paid)} EGP
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground block">
                        {t("remaining")}
                      </span>
                      <span className="text-orange-600">
                        {formatCurrency(expense.remaining)} EGP
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Enhanced Pagination */}
            <div className="border-t bg-muted/20 px-6 py-4">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-sm text-muted-foreground">
                  {t("showingXofYRecords", {
                    current: formatNumber(expenses.length),
                    total: formatNumber(totalCount),
                  })}
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(pagination.pageNumber - 1)}
                    disabled={pagination.pageNumber <= 1}
                  >
                    {t("previous")}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(pagination.pageNumber + 1)}
                    disabled={expenses.length < pagination.pageSize}
                  >
                    {t("next")}
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Enhanced Empty State */}
        {!isLoading && expenses.length === 0 && (
          <Card className="bg-card/60 backdrop-blur-sm">
            <CardContent className="p-12 text-center">
              <div className="w-20 h-20 bg-muted rounded-2xl flex items-center justify-center mx-auto mb-6">
                <FileText className="w-10 h-10 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-semibold mb-2">
                  {t("noExpensesFound")}
              </h3>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Expense Details Modal */}
      <ExpenseDetailsModal
        isOpen={!!viewExpense}
        onClose={handleCloseExpenseModal}
        expense={viewExpense}
      />

      {viewInvoiceId && invoiceDetails && (
        <InvoiceDetailsModal
          isOpen={!!viewInvoiceId}
          onClose={handleCloseDetailsModal}
          invoice={invoiceDetails}
        />
      )}

      {installmentsInvoiceId && (
        <IntegratedInstallmentsManager
          invoiceId={installmentsInvoiceId}
          invoice={expenses.find(
            (inv) =>
              inv.targetId === installmentsInvoiceId && inv.type == "Purchase",
          )}
          isOpen={!!installmentsInvoiceId}
          onClose={() => setInstallmentsInvoiceId(null)}
        />
      )}
      <InvoiceFilterModal
        isOpen={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        onApplyFilters={handleApplyFilters}
        currentFilters={filters}
        isSell={false}
      />
    </div>
  );
};

export default ExpensesReport;
