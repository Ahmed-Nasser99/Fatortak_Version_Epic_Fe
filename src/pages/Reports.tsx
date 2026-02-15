import { useState, useEffect } from "react";
import { useReports } from "@/hooks/useReports";
import { useLanguage } from "@/contexts/LanguageContext";
import { formatDate, formatNumber } from "@/Helpers/localization";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { OptimizedStatsCard } from "@/components/reports/OptimizedStatsCard";
import { RevenueChart } from "@/components/reports/RevenueChart";
import { DataTable } from "@/components/reports/DataTable";
import { ExportButton } from "@/components/reports/ExportButton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import BranchSelector from "@/components/ui/BranchSelector";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  Package,
  Building,
  BarChart3,
  CreditCard,
} from "lucide-react";

export default function ReportsPage() {
  const [period, setPeriod] = useState("month");
  const [filterBranchId, setFilterBranchId] = useState("");
  const { t, isRTL } = useLanguage();
  const {
    stats,
    revenueData,
    topCustomers,
    topSuppliers,
    cashFlow,
    profitAnalysis,
    isLoading,
    error,
    fetchAllReports,
  } = useReports();

  useEffect(() => {
    fetchAllReports(period, filterBranchId || undefined);
  }, [period, filterBranchId]);

  const statCards = [
    {
      title: t("reports.stats.totalRevenue"),
      value: stats?.totalRevenue || 0,
      change: stats?.revenueChange,
      isCurrency: true,
      icon: DollarSign,
      gradient: "from-emerald-500 via-teal-500 to-cyan-600",
    },
    {
      title: t("reports.stats.totalExpenses"),
      value: stats?.totalExpenses || 0,
      change: stats?.expensesChange,
      isCurrency: true,
      icon: CreditCard,
      gradient: "from-red-500 via-pink-500 to-rose-600",
    },
    {
      title: t("reports.stats.netIncome"),
      value: stats?.netIncome || 0,
      isCurrency: true,
      icon: TrendingUp,
      gradient: "from-blue-500 via-indigo-500 to-purple-600",
    },
    {
      title: t("reports.stats.activeCustomers"),
      value: stats?.activeCustomers || 0,
      icon: Users,
      gradient: "from-purple-500 via-violet-500 to-indigo-600",
    },
    {
      title: t("reports.stats.activeSuppliers"),
      value: stats?.activeSuppliers || 0,
      icon: Package,
      gradient: "from-orange-500 via-amber-500 to-yellow-600",
    },
  ];

  const customerColumns = [
    { header: t("customer"), accessor: "customerName" },
    { header: t("orders"), accessor: "orders" },
    { header: t("totalSpent"), accessor: "totalSpent", isCurrency: true },
    { header: t("lastOrder"), accessor: "lastOrderDate" },
    { header: t("status"), accessor: "status", isBadge: true },
  ];

  const supplierColumns = [
    { header: t("supplier"), accessor: "name" },
    { header: t("orders"), accessor: "orders" },
    { header: t("totalAmount"), accessor: "totalAmount", isCurrency: true },
    { header: t("lastOrder"), accessor: "lastOrderDate" },
  ];

  if (error) {
    return (
      <div
        className={`min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-6 ${
          isRTL ? "rtl" : "ltr"
        }`}
      >
        <div className="mx-auto">
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl p-6">
            <div
              className={`flex items-center space-x-3 ${
                isRTL ? "flex-row-reverse space-x-reverse" : ""
              }`}
            >
              <div className="w-10 h-10 bg-red-100 dark:bg-red-900/40 rounded-full flex items-center justify-center">
                <TrendingDown className="w-5 h-5 text-red-600 dark:text-red-400" />
              </div>
              <div className={isRTL ? "text-right" : "text-left"}>
                <h3 className="text-lg font-semibold text-red-900 dark:text-red-200">
                  {t("reports.error")}
                </h3>
                <p className="text-red-700 dark:text-red-300">{error}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 ${
        isRTL ? "rtl" : "ltr"
      }`}
      id="reports-container"
    >
      {/* Enhanced Header */}
      <div className="mx-auto px-6 py-6">
        <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-3xl p-8 text-white shadow-2xl">
          <div
            className={`flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0 ${
              isRTL ? "lg:flex-row-reverse" : ""
            }`}
          >
            <div className={`flex items-center space-x-4`}>
              <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-lg mx-3">
                <BarChart3 className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold mb-2">
                  {t("reports.title")}
                </h1>
                <p className="text-blue-100 text-lg">
                  {t("reports.subtitle")}
                </p>
              </div>
            </div>

            <div
              className={`flex items-center space-x-3 ${
                isRTL ? "flex-row-reverse space-x-reverse" : ""
              }`}
            >
              <div
                className={`flex items-center space-x-2 bg-white/20 backdrop-blur-sm rounded-xl border border-white/30 px-3 py-2 ${
                  isRTL ? "flex-row-reverse space-x-reverse" : ""
                }`}
              >
                <BarChart3 className="w-4 h-4 text-white" />
                <span className="text-sm font-medium text-white">
                  {t("reports.period")}:
                </span>
              </div>
              <Select value={period} onValueChange={setPeriod}>
                <SelectTrigger className="w-40 bg-white/20 backdrop-blur-sm border-white/30 text-white rounded-xl">
                  <SelectValue placeholder="Select period" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="week">{t("reports.thisWeek")}</SelectItem>
                  <SelectItem value="month">
                    {t("reports.thisMonth")}
                  </SelectItem>
                  <SelectItem value="quarter">
                    {t("reports.thisQuarter")}
                  </SelectItem>
                  <SelectItem value="year">{t("reports.thisYear")}</SelectItem>
                </SelectContent>
              </Select>

              <BranchSelector
                value={filterBranchId}
                onChange={setFilterBranchId}
                className="w-48 bg-white/20 backdrop-blur-sm border-white/30 text-white rounded-xl"
              />

              <ExportButton data={stats} filename="business-report" />
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto px-6 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 mb-8">
          {statCards.map((stat, index) => (
            <OptimizedStatsCard
              key={index}
              title={stat.title}
              value={stat.value}
              change={stat.change}
              isCurrency={stat.isCurrency}
              icon={stat.icon}
              gradient={stat.gradient}
              isLoading={isLoading}
            />
          ))}
        </div>

        {/* Tabs Section */}
        {!isLoading && (
          <Tabs defaultValue="overview" className="space-y-8">
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-2">
              <TabsList className="grid w-full grid-cols-4 bg-gray-50 dark:bg-gray-700/50">
                <TabsTrigger
                  value="overview"
                  className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-600"
                >
                  {t("reports.tabs.overview")}
                </TabsTrigger>
                <TabsTrigger
                  value="customers"
                  className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-600"
                >
                  {t("reports.tabs.customers")}
                </TabsTrigger>
                <TabsTrigger
                  value="suppliers"
                  className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-600"
                >
                  {t("reports.tabs.suppliers")}
                </TabsTrigger>
                <TabsTrigger
                  value="financial"
                  className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-600"
                >
                  {t("reports.tabs.financial")}
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="overview" className="space-y-8">
              {/* Revenue Chart */}
              <Card className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900">
                <CardHeader className="pb-4">
                  <CardTitle
                    className={`flex items-center space-x-3 ${
                      isRTL ? "flex-row-reverse space-x-reverse text-right" : ""
                    }`}
                  >
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                      <TrendingUp className="w-4 h-4 text-white" />
                    </div>
                    <span>{t("reports.charts.revenueTitle")}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <RevenueChart data={revenueData} />
                </CardContent>
              </Card>

              {/* Cash Flow and Profit Analysis */}
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                <Card className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/10 dark:to-teal-900/10">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center">
                        <DollarSign className="w-4 h-4 text-white" />
                      </div>
                      <span>{t("reports.charts.cashFlowTitle")}</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      {/* Cash In */}
                      <div className="flex items-center justify-between p-4 bg-white/60 dark:bg-gray-800/60 rounded-xl">
                        <div className="flex items-center space-x-3">
                          <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
                          <span className="font-medium">
                            {t("reports.cashFlow.cashIn")}
                          </span>
                        </div>
                        <span className="font-bold text-emerald-600 dark:text-emerald-400">
                          {formatNumber(cashFlow?.cashIn)}
                        </span>
                      </div>

                      {/* Cash Out - Main Item */}
                      <div className="flex items-center justify-between p-4 bg-white/60 dark:bg-gray-800/60 rounded-xl">
                        <div className="flex items-center space-x-3">
                          <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                          <span className="font-medium">
                            {t("reports.cashFlow.cashOut")}
                          </span>
                        </div>
                        <span className="font-bold text-red-600 dark:text-red-400">
                          {formatNumber(cashFlow?.cashOut)}
                        </span>
                      </div>

                      {/* Expense Breakdown */}
                      <div className="ml-8 space-y-3 border-l-2 border-gray-200 dark:border-gray-700 pl-4">
                        {/* Purchase Invoices */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                              {t("reports.cashFlow.purchaseInvoices")}
                            </span>
                          </div>
                          <span className="text-sm font-medium text-red-500 dark:text-red-400">
                            {formatNumber(cashFlow?.totalPurchaseInvoices)}
                          </span>
                        </div>

                        {/* Other Expenses */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                              {t("reports.cashFlow.otherExpenses")}
                            </span>
                          </div>
                          <span className="text-sm font-medium text-red-500 dark:text-red-400">
                            {formatNumber(cashFlow?.totalExpenses)}
                          </span>
                        </div>

                        {/* totalSalaries */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                              {t("reports.cashFlow.totalSalaries")}
                            </span>
                          </div>
                          <span className="text-sm font-medium text-red-500 dark:text-red-400">
                            {formatNumber(cashFlow?.totalSalaries)}
                          </span>
                        </div>
                      </div>
                      {/* Net Cash Flow */}
                      <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl border-2 border-blue-200 dark:border-blue-800">
                        <div className="flex items-center space-x-3">
                          <div
                            className={`w-3 h-3 ${
                              (cashFlow?.netCashFlow || 0) >= 0
                                ? "bg-emerald-500"
                                : "bg-red-500"
                            } rounded-full`}
                          ></div>
                          <span className="font-semibold">
                            {t("reports.cashFlow.netCashFlow")}
                          </span>
                        </div>
                        <span
                          className={`font-bold text-lg ${
                            (cashFlow?.netCashFlow || 0) >= 0
                              ? "text-emerald-600 dark:text-emerald-400"
                              : "text-red-600 dark:text-red-400"
                          }`}
                        >
                          {formatNumber(cashFlow?.netCashFlow)}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Profit Analysis Card (unchanged) */}
                <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/10 dark:to-indigo-900/10">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                        <BarChart3 className="w-4 h-4 text-white" />
                      </div>
                      <span>{t("reports.charts.profitTitle")}</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      <div className="flex items-center justify-between p-4 bg-white/60 dark:bg-gray-800/60 rounded-xl">
                        <span className="font-medium">
                          {t("reports.profit.totalRevenue")}
                        </span>
                        <span className="font-bold text-blue-600 dark:text-blue-400">
                          {formatNumber(profitAnalysis?.revenue)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between p-4 bg-white/60 dark:bg-gray-800/60 rounded-xl">
                        <span className="font-medium">
                          {t("reports.profit.netProfit")}
                        </span>
                        <span className="font-bold text-emerald-600 dark:text-emerald-400">
                          {formatNumber(profitAnalysis?.netProfit)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-violet-50 dark:from-purple-900/20 dark:to-violet-900/20 rounded-xl border-2 border-purple-200 dark:border-purple-800">
                        <span className="font-semibold">
                          {t("reports.profit.grossMargin")}
                        </span>
                        <span className="font-bold text-lg text-purple-600 dark:text-purple-400">
                          {formatNumber(profitAnalysis?.grossMargin, { minimumFractionDigits: 1, maximumFractionDigits: 1 })}%
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="customers">
              <Card>
                <CardHeader>
                  <CardTitle
                    className={`flex items-center space-x-3 ${
                      isRTL ? "flex-row-reverse space-x-reverse text-right" : ""
                    }`}
                  >
                    <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-violet-600 rounded-lg flex items-center justify-center">
                      <Users className="w-4 h-4 text-white" />
                    </div>
                    <span>{t("topCustomersPerformance")}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <DataTable
                    columns={customerColumns}
                    data={topCustomers.map((c) => ({
                      ...c,
                      lastOrderDate: formatDate(c.lastOrderDate),
                    }))}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="suppliers">
              <Card>
                <CardHeader>
                  <CardTitle
                    className={`flex items-center space-x-3 ${
                      isRTL ? "flex-row-reverse space-x-reverse text-right" : ""
                    }`}
                  >
                    <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg flex items-center justify-center">
                      <Package className="w-4 h-4 text-white" />
                    </div>
                    <span>{t("topSuppliersOverview")}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <DataTable
                    columns={supplierColumns}
                    data={topSuppliers.map((s) => ({
                      ...s,
                      lastOrderDate: formatDate(s.lastOrderDate),
                    }))}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="financial">
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                <Card className="bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/10 dark:to-orange-900/10">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-lg flex items-center justify-center">
                        <TrendingUp className="w-4 h-4 text-white" />
                      </div>
                      <span>{t("detailedCashFlow")}</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 bg-white/60 dark:bg-gray-800/60 rounded-xl">
                        <span className="font-medium">
                          {t("reports.cashFlow.outstandingReceivables")}
                        </span>
                        <span className="font-bold text-yellow-600 dark:text-yellow-400">
                          {formatNumber(cashFlow?.outstandingReceivables)}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  );
}
