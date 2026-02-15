"use client";

import type React from "react";
import { useState } from "react";
import {
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  FileText,
  TrendingUp,
  Package,
  Download,
  Search,
} from "lucide-react";
import { DatePicker } from "@/components/ui/date-picker";
import { format } from "date-fns";
import { useLanguage } from "@/contexts/LanguageContext";
import { useItemMovementReport } from "@/hooks/useReports";
import type { ItemMovementFilterDto } from "@/types/reports";
import { toast } from "react-toastify";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/Helpers/formatCurrency";
import { formatNumber, formatDate, parseLocalDate } from "@/Helpers/localization";

import { useItems } from "@/hooks/useItems";
import { ReportExportButton } from "@/components/reports/ReportExportButton";
import { useAuth } from "@/contexts/AuthContext";

const ItemMovementReport: React.FC = () => {
  const { t, isRTL } = useLanguage();

  // State for filters
  const [selectedItemId, setSelectedItemId] = useState<string>("");
  const [startDate, setStartDate] = useState<string>(
    format(new Date(new Date().getFullYear(), new Date().getMonth(), 1), "yyyy-MM-dd")
  );
  const [endDate, setEndDate] = useState<string>(
    format(new Date(), "yyyy-MM-dd")
  );
  const [isExporting, setIsExporting] = useState(false);

  // Fetch items for dropdown
  const { data: itemsResponse } = useItems({
    pageNumber: 1,
    pageSize: 1000,
  });
  const items =
    itemsResponse?.success && itemsResponse.data?.data
      ? itemsResponse.data.data
      : [];

  // Build filter object
  const filter: ItemMovementFilterDto = {
    itemId: selectedItemId,
    fromDate: startDate,
    toDate: endDate,
  };

  // Fetch movement data
  const {
    data: movementResponse,
    isLoading,
    error,
    refetch,
  } = useItemMovementReport(filter);

  const movements = movementResponse?.success ? movementResponse.data : [];

  // Get selected item details
  const selectedItem = items.find((item: any) => item.id === selectedItemId);

  const handleExport = async (format: "excel" | "pdf") => {
    if (!selectedItemId) {
      toast.error(t("selectItemFirst") || "Please select an item first");
      return;
    }

    try {
      setIsExporting(true);
      const queryParams = new URLSearchParams();
      
      queryParams.append("itemId", selectedItemId);
      queryParams.append("fromDate", startDate);
      queryParams.append("toDate", endDate);
      
      queryParams.append("format", format);
      queryParams.append("lang", isRTL ? "ar" : "en");

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/reports/item-movement/export?${queryParams.toString()}`,
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
      a.download = `Item_Movement_Report_${new Date().toISOString().split('T')[0]}.${format === "excel" ? "xlsx" : "pdf"}`;
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
    return type === "Buy" ? (
      <ArrowDownRight className="w-4 h-4 text-green-600" />
    ) : (
      <ArrowUpRight className="w-4 h-4 text-red-600" />
    );
  };

  const getTransactionColor = (type: string) => {
    return type === "Buy"
      ? "bg-green-50 text-green-700 dark:bg-green-950/20 dark:text-green-400"
      : "bg-red-50 text-red-700 dark:bg-red-950/20 dark:text-red-400";
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
                {t("errorLoadingReport")}
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
                  {t("itemMovementReport")}
                </h1>
                <p className="text-muted-foreground">
                    {t("trackAllItemTransactions")}
                </p>
              </div>
              <ReportExportButton onExport={handleExport} isLoading={isExporting} disabled={!selectedItemId} />
            </div>
          </div>
        </div>

        {/* Filters */}
        <Card className="bg-card/60 backdrop-blur-sm border shadow-sm">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 gap-4">
              {/* Item Selection */}
              <div className="space-y-2">
                <label
                  className={`text-sm font-medium ${
                    isRTL ? "text-right block" : ""
                  }`}
                >
                  {t("selectItem")}
                </label>
                <select
                  value={selectedItemId}
                  onChange={(e) => setSelectedItemId(e.target.value)}
                  className={`w-full py-2 px-4 border rounded-xl bg-background/60 backdrop-blur-sm focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-200 ${
                    isRTL ? "text-right" : ""
                  }`}
                >
                  <option value="">{t("select")}...</option>
                  {items.map((item: any) => (
                    <option key={item.id} value={item.id}>
                      {item.code} - {item.name}
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

        {/* Item Info Card */}
        {selectedItem && movements.length > 0 && !isLoading && (
          <Card className="bg-card/60 backdrop-blur-sm border shadow-sm">
            <CardHeader className="border-b bg-muted/20">
              <CardTitle className="flex items-center space-x-2">
                <Package className="w-5 h-5 text-primary" />
                <span>{t("itemInformation")}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">
                    {t("itemCode")}
                  </p>
                  <p className="font-semibold">{selectedItem.code}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">
                    {t("itemName")}
                  </p>
                  <p className="font-semibold">{selectedItem.name}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Summary Cards */}
        {movements.length > 0 && !isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/20 dark:to-green-900/20 border-green-200 dark:border-green-800">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-green-600 dark:text-green-400 font-medium mb-1">
                      {t("totalIn")}
                    </p>
                    <p className="text-2xl font-bold text-green-900 dark:text-green-100">
                      {formatNumber(movements.reduce((sum, m) => sum + m.qtyIn, 0))}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center">
                    <ArrowDownRight className="w-6 h-6 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-950/20 dark:to-red-900/20 border-red-200 dark:border-red-800">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-red-600 dark:text-red-400 font-medium mb-1">
                      {t("totalOut")}
                    </p>
                    <p className="text-2xl font-bold text-red-900 dark:text-red-100">
                      {formatNumber(movements.reduce((sum, m) => sum + m.qtyOut, 0))}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-red-500/20 rounded-xl flex items-center justify-center">
                    <ArrowUpRight className="w-6 h-6 text-red-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/20 dark:to-blue-900/20 border-blue-200 dark:border-blue-800">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-blue-600 dark:text-blue-400 font-medium mb-1">
                      {t("currentBalance")}
                    </p>
                    <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                      {formatNumber(movements[movements.length - 1]?.currentBalance)}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
                    <FileText className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Movements Table */}
        {movements.length > 0 && !isLoading && (
          <Card className="bg-card/60 backdrop-blur-sm border shadow-sm">
            <CardHeader className="border-b bg-muted/20">
              <CardTitle>
                {t("movementHistory")}
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
                      {t("invoiceNo")}
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
                      {t("qtyIn")}
                    </th>
                    <th
                      className={`px-6 py-4 text-${
                        isRTL ? "right" : "left"
                      } text-sm font-semibold text-muted-foreground`}
                    >
                      {t("qtyOut")}
                    </th>
                    <th
                      className={`px-6 py-4 text-${
                        isRTL ? "right" : "left"
                      } text-sm font-semibold text-muted-foreground`}
                    >
                      {t("balance")}
                    </th>
                    <th
                      className={`px-6 py-4 text-${
                        isRTL ? "right" : "left"
                      } text-sm font-semibold text-muted-foreground`}
                    >
                      {t("unitPrice")}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {movements.map((movement: any, index: number) => (
                    <tr
                      key={index}
                      className="hover:bg-muted/20 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          <Calendar className="w-4 h-4 text-muted-foreground" />
                          <span className="font-medium">
                            {formatDate(movement.date)}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-medium">
                        {movement.invoiceNumber}
                      </td>
                      <td className="px-6 py-4">
                        <Badge
                          className={`${getTransactionColor(
                            movement.type
                          )} border`}
                        >
                          <div className="flex items-center space-x-1">
                            {getTransactionIcon(movement.type)}
                            <span className="text-xs">{movement.type}</span>
                          </div>
                        </Badge>
                      </td>
                      <td className="px-6 py-4">
                        {movement.qtyIn > 0 ? (
                          <span className="text-green-600 font-semibold">
                            +{formatNumber(movement.qtyIn)}
                          </span>
                        ) : (
                          "-"
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {movement.qtyOut > 0 ? (
                          <span className="text-red-600 font-semibold">
                            -{formatNumber(movement.qtyOut)}
                          </span>
                        ) : (
                          "-"
                        )}
                      </td>
                      <td className="px-6 py-4 font-bold text-primary">
                        {movement.balance.toFixed(2)}
                      </td>
                      <td className="px-6 py-4">
                        {formatCurrency(movement.unitPrice)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="lg:hidden divide-y divide-border/50">
              {movements.map((movement: any, index: number) => (
                <div key={index} className="p-4 space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                        {getTransactionIcon(movement.type)}
                      </div>
                      <div>
                        <h3 className="font-semibold">
                          {movement.invoiceNumber}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {new Date(movement.date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <Badge
                      className={`${getTransactionColor(
                        movement.type
                      )} border text-xs`}
                    >
                      {movement.type}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    {movement.qtyIn > 0 && (
                      <div>
                        <span className="text-muted-foreground block">
                          {t("qtyInShort")}
                        </span>
                        <span className="text-green-600 font-semibold text-lg">
                          +{movement.qtyIn.toFixed(2)}
                        </span>
                      </div>
                    )}
                    {movement.qtyOut > 0 && (
                      <div>
                        <span className="text-muted-foreground block">
                          {t("qtyOutShort")}
                        </span>
                        <span className="text-red-600 font-semibold text-lg">
                          -{movement.qtyOut.toFixed(2)}
                        </span>
                      </div>
                    )}
                    <div>
                      <span className="text-muted-foreground block">
                        {t("balance")}
                      </span>
                      <span className="font-bold text-primary text-lg">
                        {movement.balance.toFixed(2)}
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground block">
                        {t("unitPrice")}
                      </span>
                      <span className="font-semibold">
                        {formatCurrency(movement.unitPrice)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Empty State - No Item Selected */}
        {!selectedItemId && !isLoading && (
          <Card className="bg-card/60 backdrop-blur-sm">
            <CardContent className="p-12 text-center">
              <div className="w-20 h-20 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Package className="w-10 h-10 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">
                {t("selectAnItem")}
              </h3>
              <p className="text-muted-foreground">
                    {t("pleaseSelectAnItemToViewMovement")}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Empty State - No Movements */}
        {selectedItemId && movements.length === 0 && !isLoading && (
          <Card className="bg-card/60 backdrop-blur-sm">
            <CardContent className="p-12 text-center">
              <div className="w-20 h-20 bg-muted rounded-2xl flex items-center justify-center mx-auto mb-6">
                <FileText className="w-10 h-10 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-semibold mb-2">
                {t("noMovementsFound")}
              </h3>
              <p className="text-muted-foreground">
                    {t("noMovementsForSelectedItem")}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default ItemMovementReport;
