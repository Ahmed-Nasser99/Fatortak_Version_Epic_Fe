"use client";

import type React from "react";
import { useState } from "react";
import {
  Download,
  Calendar,
  FileText,
  User,
  Mail,
  Phone,
  MapPin,
  TrendingUp,
  TrendingDown,
  Search,
  Filter,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import { DatePicker } from "@/components/ui/date-picker";
import { format } from "date-fns";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAccountStatement } from "@/hooks/useReports";
import type { AccountStatementFilterDto } from "@/types/reports";
import { toast } from "react-toastify";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/Helpers/formatCurrency";
import { formatNumber, formatDate, parseLocalDate } from "@/Helpers/localization";
import { useCustomers } from "@/hooks/useCustomers";
import { ReportExportButton } from "@/components/reports/ReportExportButton";
import { useAuth } from "@/contexts/AuthContext";

const ClientAccountStatementReport: React.FC = () => {
  const { t, isRTL } = useLanguage();

  // State for filters
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>("");
  const [accountType, setAccountType] = useState<"Sell" | "Buy">("Sell");
  const [startDate, setStartDate] = useState<string>(
    format(new Date(new Date().getFullYear(), new Date().getMonth(), 1), "yyyy-MM-dd")
  );
  const [endDate, setEndDate] = useState<string>(
    format(new Date(), "yyyy-MM-dd")
  );
  const [isExporting, setIsExporting] = useState(false);

  // Fetch customers/suppliers for dropdown
  const { data: customersResponse } = useCustomers({
    pageNumber: 1,
    pageSize: 1000,
  });
  const customers =
    customersResponse?.success && customersResponse.data?.data
      ? customersResponse.data.data.filter((c: any) =>
          accountType === "Sell" ? !c.isSupplier : c.isSupplier
        )
      : [];

  // Build filter object
  const filter: AccountStatementFilterDto = {
    customerId: selectedCustomerId,
    startDate,
    endDate,
    invoiceType: accountType,
  };

  // Fetch account statement
  const {
    data: statementResponse,
    isLoading,
    error,
    refetch,
  } = useAccountStatement(filter);

  const statement = statementResponse?.success ? statementResponse.data : null;

  const handleExport = async (format: "excel" | "pdf") => {
    if (!selectedCustomerId) {
      toast.error(t("selectCustomerFirst") || "Please select a customer first");
      return;
    }

    try {
      setIsExporting(true);
      const queryParams = new URLSearchParams();
      
      queryParams.append("customerId", selectedCustomerId);
      queryParams.append("startDate", startDate);
      queryParams.append("endDate", endDate);
      queryParams.append("invoiceType", accountType);
      
      queryParams.append("format", format);
      queryParams.append("lang", isRTL ? "ar" : "en");

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/reports/account-statement/export?${queryParams.toString()}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
          },
        }
      );

      if (!response.ok) throw new Error("Export failed");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Account_Statement_${new Date().toISOString().split('T')[0]}.${format === "excel" ? "xlsx" : "pdf"}`;
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

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case "Invoice":
        return <FileText className="w-4 h-4 text-blue-600" />;
      case "Payment Received":
        return <ArrowDownRight className="w-4 h-4 text-green-600" />;
      case "Payment Applied":
        return <ArrowUpRight className="w-4 h-4 text-purple-600" />;
      case "Opening Balance":
        return <TrendingUp className="w-4 h-4 text-gray-600" />;
      default:
        return <FileText className="w-4 h-4 text-gray-600" />;
    }
  };

  const getTransactionColor = (type: string) => {
    switch (type) {
      case "Invoice":
        return "bg-blue-50 text-blue-700 dark:bg-blue-950/20 dark:text-blue-400";
      case "Payment Received":
        return "bg-green-50 text-green-700 dark:bg-green-950/20 dark:text-green-400";
      case "Payment Applied":
        return "bg-purple-50 text-purple-700 dark:bg-purple-950/20 dark:text-purple-400";
      case "Opening Balance":
        return "bg-gray-50 text-gray-700 dark:bg-gray-950/20 dark:text-gray-400";
      default:
        return "bg-gray-50 text-gray-700 dark:bg-gray-950/20 dark:text-gray-400";
    }
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
                {t("errorLoadingStatement")}
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
        {/* Header */}
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 backdrop-blur-3xl" />
          <div className="relative bg-card/40 backdrop-blur-sm border rounded-2xl p-6 shadow-lg">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div
                className={`space-y-2 ${isRTL ? "text-right" : "text-left"}`}
              >
                <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                  {t("clientAccountStatement")}
                </h1>
                <p className="text-muted-foreground">
                    {t("detailedViewOfAccountTransactions")}
                </p>
              </div>
              <div className="flex items-center gap-3">
                 <ReportExportButton onExport={handleExport} isLoading={isExporting} disabled={!selectedCustomerId} />
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <Card className="bg-card/60 backdrop-blur-sm border shadow-sm">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Customer/Supplier Selection */}
              <div className="space-y-2">
                <label
                  className={`text-sm font-medium ${
                    isRTL ? "text-right block" : ""
                  }`}
                >
                  {accountType === "Sell"
                    ? t("selectCustomer")
                    : t("selectSupplier")}
                </label>
                <select
                  value={selectedCustomerId}
                  onChange={(e) => setSelectedCustomerId(e.target.value)}
                  className={`w-full py-2 px-4 border rounded-xl bg-background/60 backdrop-blur-sm focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-200 ${
                    isRTL ? "text-right" : ""
                  }`}
                >
                  <option value="">{t("select")}...</option>
                  {customers.map((customer: any) => (
                    <option key={customer.id} value={customer.id}>
                      {customer.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Start Date */}
              <div className="space-y-2">
                <label
                  className={`text-sm font-medium ${
                    isRTL ? "text-right block" : ""
                  }`}
                >
                  {t("startDate")}
                </label>
                <DatePicker
                  date={parseLocalDate(startDate)}
                  setDate={(date) =>
                    setStartDate(date ? format(date, "yyyy-MM-dd") : "")
                  }
                />
              </div>

              {/* End Date */}
              <div className="space-y-2">
                <label
                  className={`text-sm font-medium ${
                    isRTL ? "text-right block" : ""
                  }`}
                >
                  {t("endDate")}
                </label>
                <DatePicker
                  date={parseLocalDate(endDate)}
                  setDate={(date) =>
                    setEndDate(date ? format(date, "yyyy-MM-dd") : "")
                  }
                />
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
                  {t("loadingData")}
                </span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Customer Info & Summary */}
        {statement && !isLoading && (
          <>
            {/* Customer Information Card */}
            <Card className="bg-card/60 backdrop-blur-sm border shadow-sm">
              <CardHeader className="border-b bg-muted/20">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center space-x-2">
                    <User className="w-5 h-5 text-primary" />
                    <span>
                      {t("accountInformation")}
                    </span>
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2 text-muted-foreground text-sm">
                      <User className="w-4 h-4" />
                      <span>{t("name")}</span>
                    </div>
                    <p className="font-semibold">
                      {statement.customerInfo.name}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2 text-muted-foreground text-sm">
                      <Mail className="w-4 h-4" />
                      <span>{t("email")}</span>
                    </div>
                    <p className="font-semibold">
                      {statement.customerInfo.email || "-"}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2 text-muted-foreground text-sm">
                      <Phone className="w-4 h-4" />
                      <span>{t("phone")}</span>
                    </div>
                    <p className="font-semibold">
                      {statement.customerInfo.phone || "-"}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2 text-muted-foreground text-sm">
                      <MapPin className="w-4 h-4" />
                      <span>{t("address")}</span>
                    </div>
                    <p className="font-semibold">
                      {statement.customerInfo.address || "-"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Balance Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/20 dark:to-blue-900/20 border-blue-200 dark:border-blue-800">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-blue-600 dark:text-blue-400 font-medium mb-1">
                        {t("openingBalance")}
                      </p>
                      <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                        {formatCurrency(statement.openingBalance)}{" "}
                        {statement.customerInfo.currency}
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
                      <TrendingUp className="w-6 h-6 text-blue-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/20 dark:to-purple-900/20 border-purple-200 dark:border-purple-800">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-purple-600 dark:text-purple-400 font-medium mb-1">
                        {t("totalTransactions")}
                      </p>
                      <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">
                        {statement.transactions.length}
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center">
                      <FileText className="w-6 h-6 text-purple-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card
                className={`bg-gradient-to-br ${
                  statement.closingBalance >= 0
                    ? "from-green-50 to-green-100 dark:from-green-950/20 dark:to-green-900/20 border-green-200 dark:border-green-800"
                    : "from-red-50 to-red-100 dark:from-red-950/20 dark:to-red-900/20 border-red-200 dark:border-red-800"
                }`}
              >
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p
                        className={`text-sm font-medium mb-1 ${
                          statement.closingBalance >= 0
                            ? "text-green-600 dark:text-green-400"
                            : "text-red-600 dark:text-red-400"
                        }`}
                      >
                        {t("closingBalance")}
                      </p>
                      <p
                        className={`text-2xl font-bold ${
                          statement.closingBalance >= 0
                            ? "text-green-900 dark:text-green-100"
                            : "text-red-900 dark:text-red-100"
                        }`}
                      >
                        {formatCurrency(Math.abs(statement.closingBalance))}{" "}
                        {statement.customerInfo.currency}
                      </p>
                    </div>
                    <div
                      className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                        statement.closingBalance >= 0
                          ? "bg-green-500/20"
                          : "bg-red-500/20"
                      }`}
                    >
                      {statement.closingBalance >= 0 ? (
                        <TrendingUp className="w-6 h-6 text-green-600" />
                      ) : (
                        <TrendingDown className="w-6 h-6 text-red-600" />
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Transactions Table */}
            <Card className="bg-card/60 backdrop-blur-sm border shadow-sm">
              <CardHeader className="border-b bg-muted/20">
                <CardTitle>
                  {t("transactionHistory")}
                </CardTitle>
              </CardHeader>

              {/* Desktop Table */}
              <div className="hidden lg:block overflow-x-auto">
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
                        {t("transactionType")}
                      </th>
                      <th
                        className={`px-6 py-4 text-${
                          isRTL ? "right" : "left"
                        } text-sm font-semibold text-muted-foreground`}
                      >
                        {t("details")}
                      </th>
                      <th
                        className={`px-6 py-4 text-${
                          isRTL ? "right" : "left"
                        } text-sm font-semibold text-muted-foreground`}
                      >
                        {isRTL ? "قيمة الفاتورة" : "Invoice Amount"}
                      </th>
                      <th
                        className={`px-6 py-4 text-${
                          isRTL ? "right" : "left"
                        } text-sm font-semibold text-muted-foreground`}
                      >
                        {isRTL ? "المدفوع" : "Payment"}
                      </th>
                      <th
                        className={`px-6 py-4 text-${
                          isRTL ? "right" : "left"
                        } text-sm font-semibold text-muted-foreground`}
                      >
                        {isRTL ? "الرصيد" : "Balance"}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/50">
                    {statement.transactions.map((transaction, index) => (
                      <tr
                        key={index}
                        className="hover:bg-muted/20 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-2">
                            <Calendar className="w-4 h-4 text-muted-foreground" />
                            <span className="font-medium">
                              {transaction.date}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <Badge
                            className={`${getTransactionColor(
                              transaction.transactionType
                            )} border`}
                          >
                            <div className="flex items-center space-x-1">
                              {getTransactionIcon(transaction.transactionType)}
                              <span className="text-xs">
                                {transaction.transactionType}
                              </span>
                            </div>
                          </Badge>
                        </td>
                        <td className="px-6 py-4 text-sm">
                          {transaction.transactionDetails}
                        </td>
                        <td className="px-6 py-4 font-medium">
                          {transaction.invoiceAmount
                            ? `${formatCurrency(
                                Math.abs(transaction.invoiceAmount)
                              )} ${statement.customerInfo.currency}`
                            : "-"}
                        </td>
                        <td className="px-6 py-4">
                          {transaction.paymentAmount ? (
                            <span className="text-green-600 font-medium">
                              {formatCurrency(
                                Math.abs(transaction.paymentAmount)
                              )}{" "}
                              {statement.customerInfo.currency}
                            </span>
                          ) : (
                            "-"
                          )}
                        </td>
                        <td className="px-6 py-4 font-bold">
                          <span
                            className={
                              transaction.balance >= 0
                                ? "text-green-600"
                                : "text-red-600"
                            }
                          >
                            {formatCurrency(Math.abs(transaction.balance))}{" "}
                            {statement.customerInfo.currency}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards */}
              <div className="lg:hidden divide-y divide-border/50">
                {statement.transactions.map((transaction, index) => (
                  <div key={index} className="p-4 space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                          {getTransactionIcon(transaction.transactionType)}
                        </div>
                        <div>
                          <h3 className="font-semibold">{transaction.date}</h3>
                          <p className="text-sm text-muted-foreground">
                            {transaction.transactionDetails}
                          </p>
                        </div>
                      </div>
                      <Badge
                        className={`${getTransactionColor(
                          transaction.transactionType
                        )} border text-xs`}
                      >
                        {transaction.transactionType}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      {transaction.invoiceAmount && (
                        <div>
                          <span className="text-muted-foreground block">
                            {isRTL ? "قيمة الفاتورة" : "Invoice Amount"}
                          </span>
                          <span className="font-semibold">
                            {formatCurrency(
                              Math.abs(transaction.invoiceAmount)
                            )}{" "}
                            {statement.customerInfo.currency}
                          </span>
                        </div>
                      )}
                      {transaction.paymentAmount && (
                        <div>
                          <span className="text-muted-foreground block">
                            {t("payment")}
                          </span>
                          <span className="text-green-600 font-semibold">
                            {formatCurrency(
                              Math.abs(transaction.paymentAmount)
                            )}{" "}
                            {statement.customerInfo.currency}
                          </span>
                        </div>
                      )}
                      <div className="col-span-2">
                        <span className="text-muted-foreground block">
                          {t("balance")}
                        </span>
                        <span
                          className={`text-lg font-bold ${
                            transaction.balance >= 0
                              ? "text-green-600"
                              : "text-red-600"
                          }`}
                        >
                          {formatCurrency(Math.abs(transaction.balance))}{" "}
                          {statement.customerInfo.currency}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </>
        )}

        {/* Empty State */}
        {!statement && !isLoading && selectedCustomerId && (
          <Card className="bg-card/60 backdrop-blur-sm">
            <CardContent className="p-12 text-center">
              <div className="w-20 h-20 bg-muted rounded-2xl flex items-center justify-center mx-auto mb-6">
                <FileText className="w-10 h-10 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-semibold mb-2">
                {t("noDataFound")}
              </h3>
              <p className="text-muted-foreground">
                    {t("noTransactionsForSelectedAccount")}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Initial State - No Customer Selected */}
        {!statement && !isLoading && !selectedCustomerId && (
          <Card className="bg-card/60 backdrop-blur-sm">
            <CardContent className="p-12 text-center">
              <div className="w-20 h-20 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <User className="w-10 h-10 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">
                {t("selectAnAccount")}
              </h3>
              <p className="text-muted-foreground mb-6">
                    {t("pleaseSelectCustomerOrSupplier")}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default ClientAccountStatementReport;
