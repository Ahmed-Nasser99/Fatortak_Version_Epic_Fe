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
  DollarSign,
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
import { TransactionDto } from "@/types/reports";
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
import { formatDate, formatNumber } from "@/Helpers/localization";
import IntegratedInstallmentsManager from "@/components/modals/InstallmentsManager";
import { useTransactionReport } from "@/hooks/useReports";
import ExpenseDetailsModal from "@/components/modals/ExpenseDetailsModal";
import { ReportExportButton } from "@/components/reports/ReportExportButton";
import { useAuth } from "@/contexts/AuthContext";
import { reportService } from "@/services/reportService";

// Add the Transaction interface
export interface Transaction {
  date: string;
  type: string;
  reference: string;
  amount: number;
  paid: number;
  remaining: number;
  status: string;
  targetId: string;
}

const TransactionReport: React.FC = () => {
  const roleAccess = useRoleAccess();
  const { t, isRTL } = useLanguage();
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState("");
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [viewInvoiceId, setViewInvoiceId] = useState<string | null>(null);
  const [editInvoiceId, setEditInvoiceId] = useState<string | null>(null);
  const [deleteInvoiceId, setDeleteInvoiceId] = useState<string | null>(null);
  const [installmentsInvoiceId, setInstallmentsInvoiceId] = useState<
    string | null
  >(null);
  const [filters, setFilters] = useState<InvoiceFilterDto>({
    invoiceType: "buy",
  });
  const [viewExpense, setViewExpense] = useState<TransactionDto | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const { } = useAuth();

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
  } = useTransactionReport(pagination, filters);

  const handleApplyFilters = (newFilters: any) => {
    const updatedFilters = {
      ...newFilters,
      invoiceType: "Sell",
      type: statusFilter || "",
    };
    setFilters(updatedFilters);
    setPagination((prev) => ({ ...prev, pageNumber: 1 }));
    setIsFilterModalOpen(false);
  };

  // Update mapping to use Transaction DTO
  const expenses: TransactionDto[] = expensesResponse?.success
    ? expensesResponse.data?.data || []
    : [];
  const totalCount = expensesResponse?.success
    ? expensesResponse.data?.totalCount || 0
    : 0;

  const expenseStats = expensesResponse?.success
    ? expensesResponse.data?.metaData || {}
    : {};

  // Calculate stats with new structure
  const stats = {
    totalPurchased: expenseStats?.totalPurchased || 0,
    totalPaid: expenseStats?.totalPaid || 0,
    totalSuppliers: expenseStats?.totalSuppliers || 0,
    totalCount: expenseStats?.totalCount || 0,
  };

  const handleCloseDetailsModal = () => {
    setViewInvoiceId(null);
  };

  const handleDownloadExpense = (expenseId: string) => {
    toast.info(t("downloadingExpense"));
  };

  const handleCloseExpenseModal = () => {
    setViewExpense(null);
  };

  const handleViewExpenseDetails = (expense: TransactionDto) => {
    setViewExpense(expense);
  };

  const handleExport = async (format: 'pdf' | 'excel') => {
    try {
      setIsExporting(true);
      const blob = await reportService.exportTransactions(filters, format, isRTL ? 'ar' : 'en');
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Transactions_Report_${new Date().toISOString().split('T')[0]}.${format === 'pdf' ? 'pdf' : 'xlsx'}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Export failed:', error);
      toast.error(t('exportFailed'));
    } finally {
      setIsExporting(false);
    }
  };

  // ADD THIS FUNCTION: Handle reference click based on transaction type
  // ADD THIS FUNCTION: Handle reference click based on transaction type
  const handleReferenceClick = (transaction: TransactionDto) => {
    switch (transaction.type?.toLowerCase()) {
      case "paymentmade":
      case "purchase":
        // For purchase transactions, open invoice details
        if (transaction.referenceType === "Invoice" && transaction.referenceId)
             setViewInvoiceId(transaction.referenceId);
        break;
      case "paymentreceived":
      case "sales":
        if (transaction.referenceType === "Invoice" && transaction.referenceId)
             setViewInvoiceId(transaction.referenceId);
        break;
      case "installment":
        // For installment transactions, open installments manager
        if (transaction.referenceType === "Invoice" && transaction.referenceId)
             setInstallmentsInvoiceId(transaction.referenceId);
        break;
      case "salary":
      case "expense":
      case "utility":
      case "rent":
      case "other":
        // For expense types, open expense details modal
        setViewExpense(transaction);
        break;
      default:
        // Default fallback - show basic details
        setViewExpense(transaction);
        break;
    }
  };

  const { data: singleInvoiceResponse, isLoading: isLoadingDetails } =
    useInvoice(viewInvoiceId || editInvoiceId || "");

  const invoiceDetails = singleInvoiceResponse?.success
    ? singleInvoiceResponse.data
    : null;

  useEffect(() => {
    if (filters.type !== statusFilter) {
      setFilters((prev) => ({ ...prev, type: statusFilter }));
    }
  }, [statusFilter, filters.type]);

  const getTypeColor = (type: string) => {
    switch (type?.toLowerCase()) {
      case "paymentmade":
      case "purchase":
        return "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400";
      case "salary":
        return "bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/20 dark:text-purple-400";
      case "paymentreceived":
      case "sales":
        return "bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/20 dark:text-orange-400";
      case "utility":
        return "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-400";
      case "other":
        return "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900/20 dark:text-gray-400";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900/20 dark:text-gray-400";
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type?.toLowerCase()) {
      case "sales":
        return <DollarSign className="w-3 h-3" />;
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
  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "paid":
        return "bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400";
      case "sent":
        return "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400";
      case "draft":
        return "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900/20 dark:text-gray-400";
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400";
      case "cancelled":
        return "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/20 dark:text-red-400";
      case "overdue":
        return "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/20 dark:text-red-400";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900/20 dark:text-gray-400";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status?.toLowerCase()) {
      case "paid":
        return <CheckCircle className="w-3 h-3" />;
      case "sent":
        return <Send className="w-3 h-3" />;
      case "draft":
        return <Clock className="w-3 h-3" />;
      case "pending":
        return <Clock className="w-3 h-3" />;
      case "cancelled":
        return <XCircle className="w-3 h-3" />;
      case "overdue":
        return <AlertCircle className="w-3 h-3" />;
      default:
        return <Clock className="w-3 h-3" />;
    }
  };

  const formatTypeText = (type: string) => {
    switch (type?.toLowerCase()) {
      case "sales":
      case "paymentreceived":
        return t("salesType");
      case "purchase":
      case "paymentmade":
        return t("purchaseTypeLabel");
      case "salary":
        return t("salaryType");
      case "utility":
        return t("utilityType");
      case "rent":
        return t("rentType");
      case "expense":
        return t("expenseType");
      case "installment":
        return t("installmentType");
      case "other":
        return t("otherType");
      default:
        return type;
    }
  };
  const handlePageChange = (newPage: number) => {
    setPagination((prev) => ({ ...prev, pageNumber: newPage }));
  };
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
                  {t("transactionReport")}
                </h1>
              </div>
              <div className="flex items-center gap-3">
                 <ReportExportButton onExport={handleExport} isLoading={isExporting} />
              </div>
            </div>
          </div>
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
                  placeholder={
                    t("searchTransactions")
                  }
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
                  <option value="Purchase">
                    {t("purchaseTypeLabel")}
                  </option>
                  <option value="Sales">{t("salesType")}</option>
                  <option value="Installment">
                    {t("installmentType")}
                  </option>
                  <option value="Salary">{t("salaryType")}</option>
                  <option value="Expense">
                    {t("expenseType")}
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
                        className={`px-6 py-4 t text-sm font-semibold text-muted-foreground !text-start`}
                      >
                        {t("date")}
                      </th>
                      <th
                        className={`px-6 py-4 text-sm font-semibold text-muted-foreground !text-start`}
                      >
                        {t("type")}
                      </th>
                      <th
                        className={`px-6 py-4  text-sm font-semibold text-muted-foreground !text-start`}
                      >
                        {t("reference")}
                      </th>
                      <th
                        className={`px-6 py-4 text-sm font-semibold text-muted-foreground !text-start`}
                      >
                        {t("amount")}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/50">
                    {expenses.map((expense: TransactionDto, index: number) => (
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
                              {formatDate(expense.transactionDate)}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 !text-start">
                          <div className="relative">
                            <Button
                              variant="ghost"
                              disabled
                              className={`h-auto p-2 ${getTypeColor(
                                expense.type
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
                          <div className="flex items-center justify-start space-x-2">
                            <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
                              <FileText className="w-4 h-4 text-muted-foreground" />
                            </div>
                            {/* UPDATED: Make reference clickable */}
                            <span
                              className="cursor-pointer text-blue-500 hover:text-blue-700 hover:underline"
                              onClick={() => handleReferenceClick(expense)}
                            >
                              {expense.description}
                            </span>
                          </div>
                        </td>

                        <td className="px-6 py-4 font-semibold !text-start">
                          {formatCurrency(expense.amount)} EGP
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Mobile Cards */}
            <div className="lg:hidden divide-y divide-border/50">
              {expenses.map((expense: TransactionDto, index: number) => (
                <div key={index} className="p-4 space-y-4">
                  <div className={`flex items-start justify-between`}>
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                        <Calendar className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        {/* UPDATED: Make date/reference clickable on mobile */}
                        <h3
                          className="font-semibold cursor-pointer text-blue-500 hover:text-blue-700"
                          onClick={() => handleReferenceClick(expense)}
                        >
                          {formatDate(expense.transactionDate)}
                        </h3>
                        <p
                          className="text-sm text-muted-foreground cursor-pointer hover:text-blue-500"
                          onClick={() => handleReferenceClick(expense)}
                        >
                          {expense.description}
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
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDownloadExpense(expense.description)}
                      className="flex-1 min-w-0"
                    >
                      <Download className="w-3 h-3 mr-1" />
                      {t("download")}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleReferenceClick(expense)}
                      className="flex-1 min-w-0"
                    >
                      <Eye className="w-3 h-3 mr-1" />
                      {t("details")}
                    </Button>
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
              inv.referenceId === installmentsInvoiceId && inv.type?.toLowerCase() == "purchase"
          ) as any}
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
      />{" "}
    </div>
  );
};

export default TransactionReport;
