"use client";

import type React from "react";
import { useState } from "react";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Package,
  Download,
  Search,
  Filter,
  Award,
  AlertCircle,
} from "lucide-react";
import { DatePicker } from "@/components/ui/date-picker";
import { format } from "date-fns";
import { useLanguage } from "@/contexts/LanguageContext";
import { useItemProfitabilityReport } from "@/hooks/useReports";
import type { ItemProfitabilityFilterDto } from "@/types/reports";
import type { PaginationDto } from "@/types/api";
import { toast } from "react-toastify";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/Helpers/formatCurrency";
import { formatNumber, formatDate, parseLocalDate } from "@/Helpers/localization";
import { ReportExportButton } from "@/components/reports/ReportExportButton";
import { useAuth } from "@/contexts/AuthContext";

const ItemProfitabilityReport: React.FC = () => {
  const { t, isRTL } = useLanguage();

  // State for filters
  const [searchTerm, setSearchTerm] = useState("");
  const [startDate, setStartDate] = useState<string>(
    format(new Date(new Date().getFullYear(), new Date().getMonth(), 1), "yyyy-MM-dd")
  );
  const [endDate, setEndDate] = useState<string>(
    format(new Date(), "yyyy-MM-dd")
  );
  const [showTopOnly, setShowTopOnly] = useState(false);
  const [topCount, setTopCount] = useState(10);
  const [isExporting, setIsExporting] = useState(false);

  const [filters, setFilters] = useState<ItemProfitabilityFilterDto>({});

  // Pagination state
  const [pagination, setPagination] = useState<PaginationDto>({
    pageNumber: 1,
    pageSize: 20,
  });

  // Fetch profitability data
  const {
    data: profitResponse,
    isLoading,
    error,
    refetch,
  } = useItemProfitabilityReport(pagination, filters);

  const profitData = profitResponse?.success
    ? profitResponse.data?.data || []
    : [];
  const totalCount = profitResponse?.success
    ? profitResponse.data?.totalCount || 0
    : 0;

  const profitStats = profitResponse?.success
    ? profitResponse.data?.metaData || {}
    : {};

  const stats = {
    totalRevenue: profitStats?.totalRevenue || 0,
    totalCost: profitStats?.totalCost || 0,
    totalProfit: profitStats?.totalProfit || 0,
    avgProfitMargin: profitStats?.avgProfitMargin || 0,
  };

  const handleSearch = () => {
    setFilters({
      search: searchTerm,
      fromDate: startDate,
      toDate: endDate,
      topCount: showTopOnly ? topCount : undefined,
    });
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
      if (filters.fromDate) queryParams.append("fromDate", filters.fromDate);
      if (filters.toDate) queryParams.append("toDate", filters.toDate);
      if (filters.topCount) queryParams.append("topCount", filters.topCount.toString());
      
      queryParams.append("format", format);
      queryParams.append("lang", isRTL ? "ar" : "en");

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/reports/item-profitability/export?${queryParams.toString()}`,
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
      a.download = `Item_Profitability_Report_${new Date().toISOString().split('T')[0]}.${format === "excel" ? "xlsx" : "pdf"}`;
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

  const getProfitColor = (profitPercentage: number) => {
    if (profitPercentage < 0) return "text-red-600 dark:text-red-400";
    if (profitPercentage < 10) return "text-yellow-600 dark:text-yellow-400";
    if (profitPercentage < 25) return "text-blue-600 dark:text-blue-400";
    return "text-green-600 dark:text-green-400";
  };

  const getProfitIcon = (profitPercentage: number) => {
    if (profitPercentage < 0)
      return <TrendingDown className="w-4 h-4 text-red-600" />;
    if (profitPercentage >= 25)
      return <Award className="w-4 h-4 text-green-600" />;
    return <TrendingUp className="w-4 h-4 text-blue-600" />;
  };

  const getProfitBadgeColor = (profitPercentage: number) => {
    if (profitPercentage < 0)
      return "bg-red-50 text-red-700 dark:bg-red-950/20 dark:text-red-400";
    if (profitPercentage < 10)
      return "bg-yellow-50 text-yellow-700 dark:bg-yellow-950/20 dark:text-yellow-400";
    if (profitPercentage < 25)
      return "bg-blue-50 text-blue-700 dark:bg-blue-950/20 dark:text-blue-400";
    return "bg-green-50 text-green-700 dark:bg-green-950/20 dark:text-green-400";
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
        <div className="flex items-center justify-center min-h-screen">
          <Card className="w-full max-w-md mx-4">
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-8 h-8 text-destructive" />
              </div>
              <h2 className="text-xl font-semibold text-destructive mb-2">
                {t("errorLoadingReport")}
              </h2>
              <p className="text-muted-foreground mb-6">
                {error instanceof Error
                  ? error.message
                  : t("unknownError")}
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
                  {t("itemProfitabilityReport")}
                </h1>
                <p className="text-muted-foreground">
                  {t("analyzeProfitLossPerItem")}
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
                    {t("totalRevenue")}
                  </p>
                  <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                    {formatCurrency(stats.totalRevenue)}
                  </p>
                </div>
                <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-950/20 dark:to-red-900/20 border-red-200 dark:border-red-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-red-600 dark:text-red-400 font-medium mb-1">
                    {t("totalCost")}
                  </p>
                  <p className="text-2xl font-bold text-red-900 dark:text-red-100">
                    {formatCurrency(stats.totalCost)}
                  </p>
                </div>
                <div className="w-12 h-12 bg-red-500/20 rounded-xl flex items-center justify-center">
                  <TrendingDown className="w-6 h-6 text-red-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/20 dark:to-green-900/20 border-green-200 dark:border-green-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-green-600 dark:text-green-400 font-medium mb-1">
                    {t("totalProfit")}
                  </p>
                  <p className="text-2xl font-bold text-green-900 dark:text-green-100">
                    {formatCurrency(stats.totalProfit)}
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
                    {t("avgProfitMargin")}
                  </p>
                  <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">
                    {stats.avgProfitMargin.toFixed(1)}%
                  </p>
                </div>
                <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center">
                  <Award className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="bg-card/60 backdrop-blur-sm border shadow-sm">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              {/* Search */}
              <div className="space-y-2">
                <label
                  className={`text-sm font-medium ${
                    isRTL ? "text-right block" : ""
                  }`}
                >
                  {t("search")}
                </label>
                <input
                  type="text"
                  placeholder={t("searchByItemNameOrCode")}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                  className={`w-full py-2 px-4 border rounded-xl bg-background/60 backdrop-blur-sm focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-200 ${
                    isRTL ? "text-right" : ""
                  }`}
                />
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

              {/* Top Count */}
              <div className="space-y-2">
                <label
                  className={`text-sm font-medium ${
                    isRTL ? "text-right block" : ""
                  }`}
                >
                  {t("topCount")}
                </label>
                <select
                  value={topCount}
                  onChange={(e) => setTopCount(Number(e.target.value))}
                  disabled={!showTopOnly}
                  className={`w-full py-2 px-4 border rounded-xl bg-background/60 backdrop-blur-sm focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-200 ${
                    isRTL ? "text-right" : ""
                  }`}
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                </select>
              </div>

              {/* Actions */}
              <div className="space-y-2">
                <label className="text-sm font-medium invisible">Actions</label>
                <div className="flex gap-2">
                  <Button
                    variant={showTopOnly ? "default" : "outline"}
                    onClick={() => setShowTopOnly(!showTopOnly)}
                    className="flex-1"
                  >
                    <Award className="w-4 h-4 mr-2" />
                    {t("top")}
                  </Button>
                  <Button onClick={handleSearch} className="flex-1">
                    <Search className="w-4 h-4 mr-2" />
                    {t("search")}
                  </Button>
                </div>
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

        {/* Profitability Table */}
        {!isLoading && profitData.length > 0 && (
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
                      #
                    </th>
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
                      {t("totalSales")}
                    </th>
                    <th
                      className={`px-6 py-4 text-${
                        isRTL ? "right" : "left"
                      } text-sm font-semibold text-muted-foreground`}
                    >
                      {t("totalCost")}
                    </th>
                    <th
                      className={`px-6 py-4 text-${
                        isRTL ? "right" : "left"
                      } text-sm font-semibold text-muted-foreground`}
                    >
                      {t("profit")}
                    </th>
                    <th
                      className={`px-6 py-4 text-${
                        isRTL ? "right" : "left"
                      } text-sm font-semibold text-muted-foreground`}
                    >
                      {t("profitPercentage")}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {profitData.map((item: any, index: number) => (
                    <tr
                      key={item.itemId}
                      className="hover:bg-muted/20 transition-colors"
                    >
                      <td className="px-6 py-4 text-muted-foreground">
                        {(pagination.pageNumber - 1) * pagination.pageSize +
                          index +
                          1}
                      </td>
                      <td className="px-6 py-4 font-medium">{item.itemCode}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          <Package className="w-4 h-4 text-primary" />
                          <span>{item.itemName}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-semibold text-blue-600">
                        {formatCurrency(item.totalSales)}
                      </td>
                      <td className="px-6 py-4 font-semibold text-red-600">
                        {formatCurrency(item.totalCost)}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`font-bold ${getProfitColor(
                            item.profitPercentage
                          )}`}
                        >
                          {formatCurrency(item.profit)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <Badge
                          className={`${getProfitBadgeColor(
                            item.profitPercentage
                          )} border`}
                        >
                          <div className="flex items-center space-x-1">
                            {getProfitIcon(item.profitPercentage)}
                            <span className="font-semibold">
                              {item.profitPercentage.toFixed(1)}%
                            </span>
                          </div>
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="lg:hidden divide-y divide-border/50">
              {profitData.map((item: any, index: number) => (
                <div key={item.itemId} className="p-4 space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold">{item.itemName}</h3>
                      <p className="text-sm text-muted-foreground">
                        {item.itemCode}
                      </p>
                    </div>
                    <Badge
                      className={`${getProfitBadgeColor(
                        item.profitPercentage
                      )} border`}
                    >
                      <div className="flex items-center space-x-1">
                        {getProfitIcon(item.profitPercentage)}
                        <span className="font-semibold">
                          {item.profitPercentage.toFixed(1)}%
                        </span>
                      </div>
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground block">
                        {t("sales")}
                      </span>
                      <span className="text-blue-600 font-semibold text-lg">
                        {formatCurrency(item.totalSales)}
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground block">
                        {t("cost")}
                      </span>
                      <span className="text-red-600 font-semibold text-lg">
                        {formatCurrency(item.totalCost)}
                      </span>
                    </div>
                    <div className="col-span-2">
                      <span className="text-muted-foreground block">
                        {t("profit")}
                      </span>
                      <span
                        className={`font-bold text-xl ${getProfitColor(
                          item.profitPercentage
                        )}`}
                      >
                        {formatCurrency(item.profit)}
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
                    current: formatNumber(profitData.length),
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
                    disabled={profitData.length < pagination.pageSize}
                  >
                    {t("next")}
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Empty State */}
        {!isLoading && profitData.length === 0 && (
          <Card className="bg-card/60 backdrop-blur-sm">
            <CardContent className="p-12 text-center">
              <div className="w-20 h-20 bg-muted rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Package className="w-10 h-10 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-semibold mb-2">
                {t("noDataFound")}
              </h3>
              <p className="text-muted-foreground">
                {t("noItemTransactionsFoundInPeriod")}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default ItemProfitabilityReport;
