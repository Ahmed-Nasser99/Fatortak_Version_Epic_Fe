"use client";

import type React from "react";
import { useState } from "react";
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
import { useSalesInvoicesReport } from "@/hooks/useReports";
import { ReportExportButton } from "@/components/reports/ReportExportButton";
import { useAuth } from "@/contexts/AuthContext";
import { useCurrentCompany } from "@/hooks/useCompanies";

const SalesInvoiceReport: React.FC = () => {
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
    invoiceType: "Sell",
  });
  const [isExporting, setIsExporting] = useState(false);
  const { data: companyResult } = useCurrentCompany();
  const company = companyResult?.data;

  // Pagination state
  const [pagination, setPagination] = useState<PaginationDto>({
    pageNumber: 1,
    pageSize: 10,
  });

  // Fetch invoices with filters
  const {
    data: invoicesResponse,
    isLoading,
    error,
    refetch,
  } = useSalesInvoicesReport(pagination, filters);

  const invoices = invoicesResponse?.success
    ? invoicesResponse.data?.data || []
    : [];
  const totalCount = invoicesResponse?.success
    ? invoicesResponse.data?.totalCount || 0
    : 0;

  const invoiceStats = invoicesResponse?.success
    ? invoicesResponse.data?.metaData || {}
    : {};

  // Calculate stats with new structure
  const stats = {
    totalSales: formatCurrency(invoiceStats?.totalSales || 0),
    totalPaid: formatCurrency(invoiceStats?.totalPaid || 0),
    totalReceivables: formatCurrency(invoiceStats?.totalReceivables || 0),
    totalCount: invoiceStats?.totalCount || 0,
  };

  const handleCloseDetailsModal = () => {
    setViewInvoiceId(null);
  };

  const handleDownloadInvoice = (invoiceId: string) => {
    toast.info(t("downloadingInvoice"));
  };

  const formatPhoneForWhatsApp = (phone) => {
    if (!phone) return "";

    // Remove all non-numeric characters
    let cleanPhone = phone.replace(/\D/g, "");

    // If phone doesn't start with country code, assume it's Egyptian (+20)
    if (cleanPhone.length === 10 && !cleanPhone.startsWith("20")) {
      cleanPhone = "+20" + cleanPhone;
    }

    return cleanPhone;
  };

  const handleShareInvoice = (invoice: any) => {
    const formattedPhone = formatPhoneForWhatsApp(invoice?.customerPhoneNumber);

    // Prepare the message based on language
    const message = isRTL
      ? `تفاصيل الفاتورة\n\n` +
        `رقم الفاتورة: ${invoice.invoiceNumber}\n` +
        `العميل: ${invoice.customerName}\n` +
        `المبلغ: ${invoice.total} ${invoice.currency}\n` +
        `الحالة: ${t(`${invoice.status.toLowerCase()}Status`)}\n` +
        `تاريخ الإصدار: ${formatDate(invoice.issueDate)}\n` +
        `تاريخ الاستحقاق: ${formatDate(invoice.dueDate)}\n` +
        `رابط الفاتورة: ${window.location.origin}/invoice/${invoice.id}/${
          invoice?.invoiceType?.toLowerCase() == "sell"
            ? company?.saleInvoiceTemplate || "modern-gradient"
            : company?.purchaseInvoiceTemplate || "modern-gradient"
        }/${
          invoice?.invoiceType?.toLowerCase() == "sell"
            ? company?.saleInvoiceTemplateColor || "professional-dark"
            : company?.purchaseInvoiceTemplateColor || "professional-dark"
        }`
      : `Invoice Details\n\n` +
        `Invoice Number: ${invoice.invoiceNumber}\n` +
        `Customer: ${invoice.customerName}\n` +
        `Amount: ${invoice.total} ${invoice.currency}\n` +
        `Status: ${t(`${invoice.status.toLowerCase()}Status`)}\n` +
        `Issue Date: ${formatDate(invoice.issueDate)}\n` +
        `Due Date: ${formatDate(invoice.dueDate)}\n` +
        `View And Download: ${window.location.origin}/invoice/${invoice.id}/${
          invoice?.invoiceType?.toLowerCase() == "sell"
            ? company?.saleInvoiceTemplate || "modern-gradient"
            : company?.purchaseInvoiceTemplate || "modern-gradient"
        }/${
          invoice?.invoiceType?.toLowerCase() == "sell"
            ? company?.saleInvoiceTemplateColor || "professional-dark"
            : company?.purchaseInvoiceTemplateColor || "professional-dark"
        }`;

    // Encode the message for WhatsApp URL
    const encodedMessage = encodeURIComponent(message);

    let whatsappUrl;
    if (formattedPhone) {
      whatsappUrl = `https://wa.me/${formattedPhone}?text=${encodedMessage}`;
    } else {
      whatsappUrl = `https://wa.me/?text=${encodedMessage}`;
    }

    // For mobile devices, try to open WhatsApp app directly
    const isMobile =
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent,
      );

    if (isMobile) {
      // Try WhatsApp app first, fallback to web
      try {
        window.location.href = `whatsapp://send?phone=${formattedPhone}&text=${encodedMessage}`;
        // Fallback to web version after a short delay
        setTimeout(() => {
          window.open(whatsappUrl, "_blank");
        }, 1000);
      } catch (error) {
        window.open(whatsappUrl, "_blank");
      }
    } else {
      // Desktop - open WhatsApp Web
      window.open(whatsappUrl, "_blank");
    }
  };
  const handleExport = async (format: "excel" | "pdf") => {
    try {
      setIsExporting(true);
      const queryParams = new URLSearchParams();

      // Add filters
      if (filters.startDate) queryParams.append("startDate", filters.startDate);
      if (filters.endDate) queryParams.append("endDate", filters.endDate);
      if (filters.status) queryParams.append("status", filters.status);
      if (filters.search) queryParams.append("search", filters.search);
      queryParams.append("invoiceType", "Sell");

      queryParams.append("format", format);
      queryParams.append("lang", isRTL ? "ar" : "en");

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/reports/sales/export?${queryParams.toString()}`,
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
      a.download = `Sales_Report_${new Date().toISOString().split("T")[0]}.${format === "excel" ? "xlsx" : "pdf"}`;
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

  const handleApplyFilters = (newFilters: any) => {
    const updatedFilters = {
      ...newFilters,
      invoiceType: "Sell", // Ensure we always filter for Sell invoices
    };
    setFilters(updatedFilters);
    setPagination((prev) => ({ ...prev, pageNumber: 1 })); // Reset to first page when filters change
    setIsFilterModalOpen(false);
  };

  const handleViewInvoice = (invoiceId: string) => {
    setViewInvoiceId(invoiceId);
  };

  const { data: singleInvoiceResponse, isLoading: isLoadingDetails } =
    useInvoice(viewInvoiceId || editInvoiceId || "");

  const invoiceDetails = singleInvoiceResponse?.success
    ? singleInvoiceResponse.data
    : null;

  const { data: editInvoiceResponse, isLoading: isLoadingEditInvoice } =
    useInvoice(editInvoiceId || "");

  const editInvoiceData = editInvoiceResponse?.success
    ? editInvoiceResponse.data
    : null;

  const handlePageChange = (newPage: number) => {
    setPagination((prev) => ({ ...prev, pageNumber: newPage }));
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
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
    switch (status.toLowerCase()) {
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

  const handleViewInstallments = (invoiceId: string) => {
    setInstallmentsInvoiceId(invoiceId);
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
                {t("errorLoadingSellInvoices")}
              </h2>
              <p className="text-muted-foreground mb-6">
                {error instanceof Error
                  ? error.message
                  : "Unknown error occurred"}
              </p>
              <Button onClick={() => refetch()} className="w-full">
                {isRTL ? "إعادة المحاولة" : "Retry"}
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
                  {t("salesReport")}
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
                    {t("totalSales")}
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    {stats.totalSales}
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
                    {t("totalReceivables")}
                  </p>
                  <p className="text-2xl font-bold text-yellow-900 dark:text-yellow-100">
                    {stats.totalReceivables}
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
                    {t("totalInvoicesCount")}
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
                  placeholder={t("searchInvoices")}
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
                  value={statusFilter}
                  onChange={(e) => {
                    const newStatus = e.target.value;
                    setStatusFilter(newStatus);
                    setFilters((prev) => ({ ...prev, status: newStatus }));
                  }}
                  className={`w-full py-3 px-4 border rounded-xl bg-background/60 backdrop-blur-sm focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-200 ${
                    isRTL ? "text-right" : ""
                  }`}
                >
                  <option value="">{t("allStatus")}</option>
                  <option value="Draft">{t("status.draft")}</option>
                  <option value="Pending">{t("status.pending")}</option>
                  <option value="Paid">{t("status.paid")}</option>
                  <option value="Overdue">{t("status.overdue")}</option>
                  <option value="Cancelled">{t("status.cancelled")}</option>
                  <option value="PartialPaid">{t("status.partialpaid")}</option>
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
                  {t("loadingInvoices")}
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
                        {t("invoiceNumber")}
                      </th>
                      <th
                        className={`px-6 py-4 text-${
                          isRTL ? "right" : "left"
                        } text-sm font-semibold text-muted-foreground`}
                      >
                        {t("customer")}
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
                        {t("status")}
                      </th>
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
                        {t("dueDate")}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/50">
                    {invoices.map((invoice: any) => (
                      <tr
                        key={invoice.id}
                        className="hover:bg-muted/20 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-2">
                            <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                              <FileText className="w-4 h-4 text-primary" />
                            </div>
                            <span
                              className="font-medium cursor-pointer text-blue-500"
                              onClick={() => handleViewInvoice(invoice.id)}
                            >
                              {invoice.invoiceNumber}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-2">
                            <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
                              <Users className="w-4 h-4 text-muted-foreground" />
                            </div>
                            <span>{invoice.customerName}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 !text-start">
                          <div>
                            <div className="font-semibold">
                              {formatCurrency(invoice.total)}{" "}
                              {invoice.currency || "EGP"}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {t("vatLabel")}:{" "}
                              {formatCurrency(invoice.vatAmount)}{" "}
                              {invoice.currency || "EGP"}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {t("discountLabel")}:{" "}
                              {formatCurrency(invoice.totalDiscount)}{" "}
                              {invoice.currency || "EGP"}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 !text-start">
                          <div className="relative">
                            <Button
                              variant="ghost"
                              disabled
                              className={`h-auto p-2 ${getStatusColor(
                                invoice.status,
                              )} border !opacity-100 !hover:opacity-80`}
                            >
                              <div className="flex items-center space-x-2">
                                {getStatusIcon(invoice.status)}
                                <span className="text-xs font-medium">
                                  {t(`${invoice.status.toLowerCase()}Status`)}
                                </span>
                              </div>
                            </Button>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-muted-foreground !text-start">
                          {formatDate(invoice.issueDate)}
                        </td>
                        <td className="px-6 py-4 text-sm text-muted-foreground !text-start">
                          {formatDate(invoice.dueDate)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Mobile Cards */}
            <div className="lg:hidden divide-y divide-border/50">
              {invoices.map((invoice: any) => (
                <div key={invoice.id} className="p-4 space-y-4">
                  <div className={`flex items-start justify-between`}>
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                        <FileText className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold">
                          {invoice?.invoiceNumber}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {invoice?.customerName}
                        </p>
                      </div>
                    </div>
                    <Badge
                      className={`${getStatusColor(invoice.status)} border`}
                    >
                      <div className="flex items-center space-x-1">
                        {getStatusIcon(invoice.status)}
                        <span className="text-xs">
                          {t(`${invoice.status.toLowerCase()}Status`)}
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
                        {formatCurrency(invoice.total)}{" "}
                        {invoice.currency || "EGP"}
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground block">
                        {t("dueDate")}
                      </span>
                      <span>{formatDate(invoice.dueDate)}</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewInvoice(invoice.id)}
                      className="flex-1 min-w-0"
                    >
                      <Eye className="w-3 h-3 mr-1" />
                      {t("view")}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleShareInvoice(invoice)}
                      className="flex-1 min-w-0"
                    >
                      <Share2 className="w-3 h-3 mr-1" />
                      {t("share")}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDownloadInvoice(invoice.id)}
                      className="flex-1 min-w-0"
                    >
                      <Download className="w-3 h-3 mr-1" />
                      {t("download")}
                    </Button>
                    {invoice?.hasInstallments && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewInstallments(invoice.id)}
                        className="flex-1 min-w-0"
                      >
                        <Calendar className="w-3 h-3 mr-1" />
                        {t("viewInstallments")}
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Enhanced Pagination */}
            <div className="border-t bg-muted/20 px-6 py-4">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="text-sm text-muted-foreground">
                    {t("showingXofYRecords", {
                      current: formatNumber(invoices.length),
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
                    disabled={invoices.length < pagination.pageSize}
                  >
                    {t("next")}
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Enhanced Empty State */}
        {!isLoading && invoices.length === 0 && (
          <Card className="bg-card/60 backdrop-blur-sm">
            <CardContent className="p-12 text-center">
              <div className="w-20 h-20 bg-muted rounded-2xl flex items-center justify-center mx-auto mb-6">
                <FileText className="w-10 h-10 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-semibold mb-2">
                {t("noInvoicesFound")}
              </h3>
            </CardContent>
          </Card>
        )}
      </div>
      <InvoiceFilterModal
        isOpen={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        onApplyFilters={handleApplyFilters}
        currentFilters={filters}
        isSell={true}
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
          invoice={invoices.find((inv) => inv.id === installmentsInvoiceId)}
          isOpen={!!installmentsInvoiceId}
          onClose={() => setInstallmentsInvoiceId(null)}
        />
      )}
    </div>
  );
};

export default SalesInvoiceReport;
