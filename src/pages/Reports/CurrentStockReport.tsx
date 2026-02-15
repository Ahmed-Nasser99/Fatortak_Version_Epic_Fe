"use client";

import type React from "react";
import { useEffect, useState } from "react";
import {
  Package,
  Search,
  Filter,
  Download,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  FileText,
} from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useCurrentStockReport } from "@/hooks/useReports";
import type { StockReportFilterDto } from "@/types/reports";
import type { PaginationDto } from "@/types/api";
import { toast } from "react-toastify";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/Helpers/formatCurrency";
import { formatNumber } from "@/Helpers/localization";
import { ReportExportButton } from "@/components/reports/ReportExportButton";
import { useAuth } from "@/contexts/AuthContext";

const CurrentStockReport: React.FC = () => {
  const { t, isRTL } = useLanguage();

  // State for filters
  const [searchTerm, setSearchTerm] = useState("");
  const [showLowStockOnly, setShowLowStockOnly] = useState(false);
  const [filters, setFilters] = useState<StockReportFilterDto>({});
  const [isExporting, setIsExporting] = useState(false);

  // Pagination state
  const [pagination, setPagination] = useState<PaginationDto>({
    pageNumber: 1,
    pageSize: 20,
  });

  // Fetch stock data
  const {
    data: stockResponse,
    isLoading,
    error,
    refetch,
  } = useCurrentStockReport(pagination, filters);

  const stockData = stockResponse?.success
    ? stockResponse.data?.data || []
    : [];
  const totalCount = stockResponse?.success
    ? stockResponse.data?.totalCount || 0
    : 0;

  const stockStats = stockResponse?.success
    ? stockResponse.data?.metaData || {}
    : {};

  const stats = {
    totalItems: stockStats?.totalItems || 0,
    totalInStock: stockStats?.totalInStock || 0,
    totalValue: stockStats?.totalValue || 0,
    lowStockItems: stockStats?.lowStockItems || 0,
  };

  useEffect(() => {
    handleSearch();
  }, [searchTerm, showLowStockOnly, pagination.pageNumber]);
  const handleSearch = () => {
    setFilters((prev) => ({
      ...prev,
      search: searchTerm,
      lowStock: showLowStockOnly,
    }));
    setPagination((prev) => ({ ...prev, pageNumber: 1 }));
  };

  const handlePageChange = (newPage: number) => {
    setPagination((prev) => ({ ...prev, pageNumber: newPage }));
  };

  const handleExport = async (format: "excel" | "pdf") => {
    try {
      setIsExporting(true);
      const queryParams = new URLSearchParams();
      
      // Add filters
      if (filters.search) queryParams.append("search", filters.search);
      if (filters.lowStock) queryParams.append("lowStock", "true");
      
      queryParams.append("format", format);
      queryParams.append("lang", isRTL ? "ar" : "en");

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/reports/stock/current/export?${queryParams.toString()}`,
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
      a.download = `Stock_Report_${new Date().toISOString().split('T')[0]}.${format === "excel" ? "xlsx" : "pdf"}`;
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

  const getStockStatusColor = (inStock: number) => {
    if (inStock <= 0) return "text-red-600 dark:text-red-400";
    if (inStock <= 10) return "text-yellow-600 dark:text-yellow-400";
    return "text-green-600 dark:text-green-400";
  };

  const getStockStatusIcon = (inStock: number) => {
    if (inStock <= 0) return <AlertTriangle className="w-4 h-4 text-red-600" />;
    if (inStock <= 10)
      return <TrendingDown className="w-4 h-4 text-yellow-600" />;
    return <TrendingUp className="w-4 h-4 text-green-600" />;
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
        <div className="flex items-center justify-center min-h-screen">
          <Card className="w-full max-w-md mx-4">
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Package className="w-8 h-8 text-destructive" />
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
                  {t("currentStockReport")}
                </h1>
                <p className="text-muted-foreground">
                    {t("comprehensiveViewOfInventoryLevels")}
                </p>
              </div>
              <ReportExportButton onExport={handleExport} isLoading={isExporting} />
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/20 dark:to-blue-900/20 border-blue-200 dark:border-blue-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-600 dark:text-blue-400 font-medium mb-1">
                    {t("totalItems")}
                  </p>
                  <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                    {stats.totalItems}
                  </p>
                </div>
                <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
                  <Package className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/20 dark:to-green-900/20 border-green-200 dark:border-green-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-green-600 dark:text-green-400 font-medium mb-1">
                    {t("totalInStock")}
                  </p>
                  <p className="text-2xl font-bold text-green-900 dark:text-green-100">
                    {stats.totalInStock.toFixed(0)}
                  </p>
                </div>
                <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/20 dark:to-purple-900/20 border-purple-200 dark:border-purple-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-purple-600 dark:text-purple-400 font-medium mb-1">
                    {t("totalStockValue")}
                  </p>
                  <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">
                    {formatCurrency(stats.totalValue)}
                  </p>
                </div>
                <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center">
                  <FileText className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-950/20 dark:to-red-900/20 border-red-200 dark:border-red-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-red-600 dark:text-red-400 font-medium mb-1">
                    {t("lowStockItems")}
                  </p>
                  <p className="text-2xl font-bold text-red-900 dark:text-red-100">
                    {stats.lowStockItems}
                  </p>
                </div>
                <div className="w-12 h-12 bg-red-500/20 rounded-xl flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6 text-red-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="bg-card/60 backdrop-blur-sm border shadow-sm">
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1 relative">
                <Search
                  className={`absolute top-1/2 transform -translate-y-1/2 ${
                    isRTL ? "right-4" : "left-4"
                  } w-5 h-5 text-muted-foreground`}
                />
                <input
                  type="text"
                  placeholder={t("searchByItemNameOrCode")}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={`w-full py-3 px-4 ${
                    isRTL ? "pr-12 text-right" : "pl-12"
                  } border rounded-xl bg-background/60 backdrop-blur-sm focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-200`}
                />
              </div>
              <div className="flex gap-2">
                <Button
                  variant={showLowStockOnly ? "default" : "outline"}
                  onClick={() => {
                    setShowLowStockOnly(!showLowStockOnly);
                    setFilters((prev) => ({
                      ...prev,
                      lowStock: !showLowStockOnly,
                    }));
                  }}
                >
                  <AlertTriangle className="w-4 h-4 mr-2" />
                  {t("lowStockOnly")}
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
                  {t("loadingData")}
                </span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Stock Table */}
        {!isLoading && stockData.length > 0 && (
          <Card className="bg-card/60 backdrop-blur-sm border shadow-sm">
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
                      {t("itemCode")}
                    </th>
                    <th
                      className={`px-6 py-4 text-${
                        isRTL ? "right" : "left"
                      } text-sm font-semibold text-muted-foreground`}
                    >
                      {t("itemName")}
                    </th>
                    <th
                      className={`px-6 py-4 text-${
                        isRTL ? "right" : "left"
                      } text-sm font-semibold text-muted-foreground`}
                    >
                      {t("soldQty")}
                    </th>
                    <th
                      className={`px-6 py-4 text-${
                        isRTL ? "right" : "left"
                      } text-sm font-semibold text-muted-foreground`}
                    >
                      {t("inStock")}
                    </th>
                    <th
                      className={`px-6 py-4 text-${
                        isRTL ? "right" : "left"
                      } text-sm font-semibold text-muted-foreground`}
                    >
                      {t("purchasePrice")}
                    </th>
                    <th
                      className={`px-6 py-4 text-${
                        isRTL ? "right" : "left"
                      } text-sm font-semibold text-muted-foreground`}
                    >
                      {t("sellPrice")}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {stockData.map((item: any) => (
                    <tr
                      key={item.itemId}
                      className="hover:bg-muted/20 transition-colors"
                    >
                      <td className="px-6 py-4 font-medium !text-start">
                        {item.itemCode}
                      </td>
                      <td className="px-6 py-4 !text-start">
                        <div className="flex items-center space-x-2">
                          <Package className="w-4 h-4 text-primary" />
                          <span>{item.itemName}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-red-600 font-medium !text-start">
                        {item.soldQty.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 !text-start">
                        <div className="flex items-center space-x-2">
                          {getStockStatusIcon(item.inStock)}
                          <span
                            className={`font-bold ${getStockStatusColor(
                              item.inStock
                            )}`}
                          >
                            {item.inStock.toFixed(2)}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 !text-start">
                        {item.purchasePrice
                          ? formatCurrency(item.purchasePrice)
                          : "-"}
                      </td>
                      <td className="px-6 py-4 !text-start">
                        {item.sellPrice ? formatCurrency(item.sellPrice) : "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="lg:hidden divide-y divide-border/50">
              {stockData.map((item: any) => (
                <div key={item.itemId} className="p-4 space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold">{item.itemName}</h3>
                      <p className="text-sm text-muted-foreground">
                        {item.itemCode}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      {getStockStatusIcon(item.inStock)}
                      <span
                        className={`font-bold ${getStockStatusColor(
                          item.inStock
                        )}`}
                      >
                        {item.inStock.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground block">
                        {t("sold")}
                      </span>
                      <span className="text-red-600 font-semibold">
                        {item.soldQty.toFixed(2)}
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground block">
                        {t("purchasePrice")}
                      </span>
                      <span className="font-semibold">
                        {item.purchasePrice
                          ? formatCurrency(item.purchasePrice)
                          : "-"}
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground block">
                        {t("sellPrice")}
                      </span>
                      <span className="font-semibold">
                        {item.sellPrice ? formatCurrency(item.sellPrice) : "-"}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            <div className="border-t bg-muted/20 px-6 py-4">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-sm text-muted-foreground">
                  {t("showingXofYRecords", {
                    current: formatNumber(stockData.length),
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
                    disabled={stockData.length < pagination.pageSize}
                  >
                    {t("next")}
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Empty State */}
        {!isLoading && stockData.length === 0 && (
          <Card className="bg-card/60 backdrop-blur-sm">
            <CardContent className="p-12 text-center">
              <div className="w-20 h-20 bg-muted rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Package className="w-10 h-10 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-semibold mb-2">
                {t("noDataFound")}
              </h3>
              <p className="text-muted-foreground">
                {t("noItemsFoundInStock")}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default CurrentStockReport;
