import React, { useState } from "react";
import {
  BarChart3,
  Loader2,
  Download,
  Calendar,
  TrendingUp,
  TrendingDown,
  DollarSign,
  FileText,
  Calculator,
  Building2,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";
import { useLanguage } from "../contexts/LanguageContext";
import {
  useTrialBalance,
  useProfitAndLoss,
  useBalanceSheet,
  useAccountLedger,
  useAccounts,
} from "../hooks/useAccounting";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../components/ui/tabs";
import { formatCurrency } from "../Helpers/formatCurrency";
import { formatDate } from "../Helpers/localization";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";

const FinancialReports: React.FC = () => {
  const { t, isRTL } = useLanguage();
  const [activeTab, setActiveTab] = useState("trial-balance");
  
  // Trial Balance
  const [trialBalanceDate, setTrialBalanceDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const { data: trialBalanceResponse, isLoading: isLoadingTrialBalance } =
    useTrialBalance(trialBalanceDate);

  // Profit & Loss
  const [pnlFromDate, setPnlFromDate] = useState<string>(
    new Date(new Date().getFullYear(), 0, 1).toISOString().split("T")[0]
  );
  const [pnlToDate, setPnlToDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const { data: pnlResponse, isLoading: isLoadingPnl } = useProfitAndLoss(
    pnlFromDate,
    pnlToDate
  );

  // Balance Sheet
  const [balanceSheetDate, setBalanceSheetDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const { data: balanceSheetResponse, isLoading: isLoadingBalanceSheet } =
    useBalanceSheet(balanceSheetDate);

  // Account Ledger
  const [selectedAccountId, setSelectedAccountId] = useState<string>("");
  const [ledgerFromDate, setLedgerFromDate] = useState<string>("");
  const [ledgerToDate, setLedgerToDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const { data: accountsResponse } = useAccounts(
    { pageNumber: 1, pageSize: 1000 },
    { isActive: true }
  );
  const { data: ledgerResponse, isLoading: isLoadingLedger } =
    useAccountLedger(selectedAccountId, ledgerFromDate, ledgerToDate);

  const accounts = accountsResponse?.data?.data || [];

  const handleExport = (reportType: string) => {
    // TODO: Implement export functionality
    toast.success(`Exporting ${reportType}...`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <BarChart3 className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <CardTitle className="text-2xl">
                  {isRTL ? "التقارير المالية" : "Financial Reports"}
                </CardTitle>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {isRTL
                    ? "عرض التقارير المالية والمحاسبية"
                    : "View financial and accounting reports"}
                </p>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Reports Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="trial-balance">
              <Calculator className="w-4 h-4 mr-2" />
              {isRTL ? "ميزان المراجعة" : "Trial Balance"}
            </TabsTrigger>
            <TabsTrigger value="profit-loss">
              <TrendingUp className="w-4 h-4 mr-2" />
              {isRTL ? "قائمة الدخل" : "Profit & Loss"}
            </TabsTrigger>
            <TabsTrigger value="balance-sheet">
              <Building2 className="w-4 h-4 mr-2" />
              {isRTL ? "الميزانية العمومية" : "Balance Sheet"}
            </TabsTrigger>
            <TabsTrigger value="ledger">
              <FileText className="w-4 h-4 mr-2" />
              {isRTL ? "دفتر الأستاذ" : "Account Ledger"}
            </TabsTrigger>
          </TabsList>

          {/* Trial Balance Tab */}
          <TabsContent value="trial-balance" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>
                    {isRTL ? "ميزان المراجعة" : "Trial Balance"}
                  </CardTitle>
                  <div className="flex gap-2">
                    <div>
                      <Label className="text-sm mr-2">
                        {isRTL ? "حتى تاريخ" : "As of Date"}
                      </Label>
                      <Input
                        type="date"
                        value={trialBalanceDate}
                        onChange={(e) => setTrialBalanceDate(e.target.value)}
                        className="w-40"
                      />
                    </div>
                    <Button
                      variant="outline"
                      onClick={() => handleExport("trial-balance")}
                    >
                      <Download className="w-4 h-4 mr-2" />
                      {isRTL ? "تصدير" : "Export"}
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {isLoadingTrialBalance ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                  </div>
                ) : (
                  <div>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>
                            {isRTL ? "رمز الحساب" : "Account Code"}
                          </TableHead>
                          <TableHead>
                            {isRTL ? "اسم الحساب" : "Account Name"}
                          </TableHead>
                          <TableHead className="text-right">
                            {isRTL ? "مدين" : "Debit"}
                          </TableHead>
                          <TableHead className="text-right">
                            {isRTL ? "دائن" : "Credit"}
                          </TableHead>
                          <TableHead className="text-right">
                            {isRTL ? "الرصيد" : "Balance"}
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {trialBalanceResponse?.data?.data?.items?.map(
                          (item) => (
                            <TableRow key={item.accountId}>
                              <TableCell className="font-mono">
                                {item.accountCode}
                              </TableCell>
                              <TableCell>{item.accountName}</TableCell>
                              <TableCell className="text-right font-mono">
                                {formatCurrency(item.debitTotal)}
                              </TableCell>
                              <TableCell className="text-right font-mono">
                                {formatCurrency(item.creditTotal)}
                              </TableCell>
                              <TableCell className="text-right font-mono font-semibold">
                                {formatCurrency(item.balance)}
                              </TableCell>
                            </TableRow>
                          )
                        )}
                        <TableRow className="font-bold bg-gray-100 dark:bg-gray-800">
                          <TableCell colSpan={2}>
                            {isRTL ? "الإجمالي" : "Total"}
                          </TableCell>
                          <TableCell className="text-right font-mono">
                            {formatCurrency(
                              trialBalanceResponse?.data?.data?.totalDebit || 0
                            )}
                          </TableCell>
                          <TableCell className="text-right font-mono">
                            {formatCurrency(
                              trialBalanceResponse?.data?.data?.totalCredit || 0
                            )}
                          </TableCell>
                          <TableCell></TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                    <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div className="flex items-center gap-2">
                        {trialBalanceResponse?.data?.data?.isBalanced ? (
                          <>
                            <CheckCircle className="w-5 h-5 text-green-600" />
                            <span className="text-green-600 font-semibold">
                              {isRTL ? "متوازن" : "Balanced"}
                            </span>
                          </>
                        ) : (
                          <>
                            <XCircle className="w-5 h-5 text-red-600" />
                            <span className="text-red-600 font-semibold">
                              {isRTL ? "غير متوازن" : "Not Balanced"}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Profit & Loss Tab */}
          <TabsContent value="profit-loss" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>
                    {isRTL ? "قائمة الدخل" : "Profit & Loss Statement"}
                  </CardTitle>
                  <div className="flex gap-2">
                    <div>
                      <Label className="text-sm mr-2">
                        {isRTL ? "من" : "From"}
                      </Label>
                      <Input
                        type="date"
                        value={pnlFromDate}
                        onChange={(e) => setPnlFromDate(e.target.value)}
                        className="w-40"
                      />
                    </div>
                    <div>
                      <Label className="text-sm mr-2">
                        {isRTL ? "إلى" : "To"}
                      </Label>
                      <Input
                        type="date"
                        value={pnlToDate}
                        onChange={(e) => setPnlToDate(e.target.value)}
                        className="w-40"
                      />
                    </div>
                    <Button
                      variant="outline"
                      onClick={() => handleExport("profit-loss")}
                    >
                      <Download className="w-4 h-4 mr-2" />
                      {isRTL ? "تصدير" : "Export"}
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {isLoadingPnl ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Revenue Section */}
                    <div>
                      <h3 className="text-lg font-semibold mb-3">
                        {isRTL ? "الإيرادات" : "Revenue"}
                      </h3>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>
                              {isRTL ? "الحساب" : "Account"}
                            </TableHead>
                            <TableHead className="text-right">
                              {isRTL ? "المبلغ" : "Amount"}
                            </TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {pnlResponse?.data?.data?.revenueItems?.map(
                            (item) => (
                              <TableRow key={item.accountId}>
                                <TableCell>
                                  {item.accountCode} - {item.accountName}
                                </TableCell>
                                <TableCell className="text-right font-mono">
                                  {formatCurrency(item.amount)}
                                </TableCell>
                              </TableRow>
                            )
                          )}
                          <TableRow className="font-bold bg-green-50 dark:bg-green-900/20">
                            <TableCell>
                              {isRTL ? "إجمالي الإيرادات" : "Total Revenue"}
                            </TableCell>
                            <TableCell className="text-right font-mono">
                              {formatCurrency(
                                pnlResponse?.data?.data?.totalRevenue || 0
                              )}
                            </TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </div>

                    {/* Expenses Section */}
                    <div>
                      <h3 className="text-lg font-semibold mb-3">
                        {isRTL ? "المصروفات" : "Expenses"}
                      </h3>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>
                              {isRTL ? "الحساب" : "Account"}
                            </TableHead>
                            <TableHead className="text-right">
                              {isRTL ? "المبلغ" : "Amount"}
                            </TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {pnlResponse?.data?.data?.expenseItems?.map(
                            (item) => (
                              <TableRow key={item.accountId}>
                                <TableCell>
                                  {item.accountCode} - {item.accountName}
                                </TableCell>
                                <TableCell className="text-right font-mono">
                                  {formatCurrency(item.amount)}
                                </TableCell>
                              </TableRow>
                            )
                          )}
                          <TableRow className="font-bold bg-red-50 dark:bg-red-900/20">
                            <TableCell>
                              {isRTL ? "إجمالي المصروفات" : "Total Expenses"}
                            </TableCell>
                            <TableCell className="text-right font-mono">
                              {formatCurrency(
                                pnlResponse?.data?.data?.totalExpenses || 0
                              )}
                            </TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </div>

                    {/* Net Income */}
                    <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <div className="flex items-center justify-between">
                        <span className="text-lg font-bold">
                          {isRTL ? "صافي الدخل" : "Net Income"}
                        </span>
                        <span
                          className={`text-2xl font-bold font-mono ${
                            (pnlResponse?.data?.data?.netIncome || 0) >= 0
                              ? "text-green-600"
                              : "text-red-600"
                          }`}
                        >
                          {formatCurrency(
                            pnlResponse?.data?.data?.netIncome || 0
                          )}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Balance Sheet Tab */}
          <TabsContent value="balance-sheet" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>
                    {isRTL ? "الميزانية العمومية" : "Balance Sheet"}
                  </CardTitle>
                  <div className="flex gap-2">
                    <div>
                      <Label className="text-sm mr-2">
                        {isRTL ? "حتى تاريخ" : "As of Date"}
                      </Label>
                      <Input
                        type="date"
                        value={balanceSheetDate}
                        onChange={(e) => setBalanceSheetDate(e.target.value)}
                        className="w-40"
                      />
                    </div>
                    <Button
                      variant="outline"
                      onClick={() => handleExport("balance-sheet")}
                    >
                      <Download className="w-4 h-4 mr-2" />
                      {isRTL ? "تصدير" : "Export"}
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {isLoadingBalanceSheet ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-6">
                    {/* Assets */}
                    <div>
                      <h3 className="text-lg font-semibold mb-3">
                        {isRTL ? "الأصول" : "Assets"}
                      </h3>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>
                              {isRTL ? "الحساب" : "Account"}
                            </TableHead>
                            <TableHead className="text-right">
                              {isRTL ? "الرصيد" : "Balance"}
                            </TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {balanceSheetResponse?.data?.data?.assets?.map(
                            (item) => (
                              <TableRow key={item.accountId}>
                                <TableCell>
                                  {item.accountCode} - {item.accountName}
                                </TableCell>
                                <TableCell className="text-right font-mono">
                                  {formatCurrency(item.balance)}
                                </TableCell>
                              </TableRow>
                            )
                          )}
                          <TableRow className="font-bold bg-blue-50 dark:bg-blue-900/20">
                            <TableCell>
                              {isRTL ? "إجمالي الأصول" : "Total Assets"}
                            </TableCell>
                            <TableCell className="text-right font-mono">
                              {formatCurrency(
                                balanceSheetResponse?.data?.data?.totalAssets ||
                                  0
                              )}
                            </TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </div>

                    {/* Liabilities & Equity */}
                    <div>
                      <div className="mb-6">
                        <h3 className="text-lg font-semibold mb-3">
                          {isRTL ? "الخصوم" : "Liabilities"}
                        </h3>
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>
                                {isRTL ? "الحساب" : "Account"}
                              </TableHead>
                              <TableHead className="text-right">
                                {isRTL ? "الرصيد" : "Balance"}
                              </TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {balanceSheetResponse?.data?.data?.liabilities?.map(
                              (item) => (
                                <TableRow key={item.accountId}>
                                  <TableCell>
                                    {item.accountCode} - {item.accountName}
                                  </TableCell>
                                  <TableCell className="text-right font-mono">
                                    {formatCurrency(item.balance)}
                                  </TableCell>
                                </TableRow>
                              )
                            )}
                            <TableRow className="font-bold bg-red-50 dark:bg-red-900/20">
                              <TableCell>
                                {isRTL
                                  ? "إجمالي الخصوم"
                                  : "Total Liabilities"}
                              </TableCell>
                              <TableCell className="text-right font-mono">
                                {formatCurrency(
                                  balanceSheetResponse?.data?.data
                                    ?.totalLiabilities || 0
                                )}
                              </TableCell>
                            </TableRow>
                          </TableBody>
                        </Table>
                      </div>

                      <div>
                        <h3 className="text-lg font-semibold mb-3">
                          {isRTL ? "حقوق الملكية" : "Equity"}
                        </h3>
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>
                                {isRTL ? "الحساب" : "Account"}
                              </TableHead>
                              <TableHead className="text-right">
                                {isRTL ? "الرصيد" : "Balance"}
                              </TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {balanceSheetResponse?.data?.data?.equity?.map(
                              (item) => (
                                <TableRow key={item.accountId}>
                                  <TableCell>
                                    {item.accountCode} - {item.accountName}
                                  </TableCell>
                                  <TableCell className="text-right font-mono">
                                    {formatCurrency(item.balance)}
                                  </TableCell>
                                </TableRow>
                              )
                            )}
                            <TableRow className="font-bold bg-green-50 dark:bg-green-900/20">
                              <TableCell>
                                {isRTL ? "إجمالي حقوق الملكية" : "Total Equity"}
                              </TableCell>
                              <TableCell className="text-right font-mono">
                                {formatCurrency(
                                  balanceSheetResponse?.data?.data?.totalEquity ||
                                    0
                                )}
                              </TableCell>
                            </TableRow>
                          </TableBody>
                        </Table>
                      </div>

                      <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div className="flex items-center justify-between">
                          <span className="font-bold">
                            {isRTL
                              ? "إجمالي الخصوم وحقوق الملكية"
                              : "Total Liabilities & Equity"}
                          </span>
                          <span className="font-mono font-bold">
                            {formatCurrency(
                              (balanceSheetResponse?.data?.data
                                ?.totalLiabilities || 0) +
                                (balanceSheetResponse?.data?.data?.totalEquity ||
                                  0)
                            )}
                          </span>
                        </div>
                        {balanceSheetResponse?.data?.data?.isBalanced && (
                          <div className="mt-2 text-sm text-green-600">
                            <CheckCircle className="w-4 h-4 inline mr-1" />
                            {isRTL ? "متوازن" : "Balanced"}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Account Ledger Tab */}
          <TabsContent value="ledger" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>
                    {isRTL ? "دفتر الأستاذ" : "Account Ledger"}
                  </CardTitle>
                  <div className="flex gap-2">
                    <Select
                      value={selectedAccountId}
                      onValueChange={setSelectedAccountId}
                    >
                      <SelectTrigger className="w-64">
                        <SelectValue
                          placeholder={
                            isRTL ? "اختر الحساب" : "Select Account"
                          }
                        />
                      </SelectTrigger>
                      <SelectContent>
                        {accounts.map((account) => (
                          <SelectItem key={account.id} value={account.id}>
                            {account.accountCode} - {account.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Input
                      type="date"
                      value={ledgerFromDate}
                      onChange={(e) => setLedgerFromDate(e.target.value)}
                      placeholder={isRTL ? "من تاريخ" : "From Date"}
                      className="w-40"
                    />
                    <Input
                      type="date"
                      value={ledgerToDate}
                      onChange={(e) => setLedgerToDate(e.target.value)}
                      placeholder={isRTL ? "إلى تاريخ" : "To Date"}
                      className="w-40"
                    />
                    <Button
                      variant="outline"
                      onClick={() => handleExport("ledger")}
                      disabled={!selectedAccountId}
                    >
                      <Download className="w-4 h-4 mr-2" />
                      {isRTL ? "تصدير" : "Export"}
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {!selectedAccountId ? (
                  <div className="text-center py-12 text-gray-500">
                    {isRTL
                      ? "يرجى اختيار حساب لعرض دفتر الأستاذ"
                      : "Please select an account to view ledger"}
                  </div>
                ) : isLoadingLedger ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                  </div>
                ) : (
                  <div>
                    <div className="mb-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <Label className="text-sm text-gray-500">
                            {isRTL ? "الحساب" : "Account"}
                          </Label>
                          <p className="font-semibold">
                            {ledgerResponse?.data?.data?.accountCode} -{" "}
                            {ledgerResponse?.data?.data?.accountName}
                          </p>
                        </div>
                        <div>
                          <Label className="text-sm text-gray-500">
                            {isRTL ? "الرصيد الافتتاحي" : "Opening Balance"}
                          </Label>
                          <p className="font-mono font-semibold">
                            {formatCurrency(
                              ledgerResponse?.data?.data?.openingBalance || 0
                            )}
                          </p>
                        </div>
                        <div>
                          <Label className="text-sm text-gray-500">
                            {isRTL ? "الرصيد الختامي" : "Closing Balance"}
                          </Label>
                          <p className="font-mono font-semibold">
                            {formatCurrency(
                              ledgerResponse?.data?.data?.closingBalance || 0
                            )}
                          </p>
                        </div>
                      </div>
                    </div>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>
                            {isRTL ? "التاريخ" : "Date"}
                          </TableHead>
                          <TableHead>
                            {isRTL ? "رقم القيد" : "Entry #"}
                          </TableHead>
                          <TableHead>
                            {isRTL ? "الوصف" : "Description"}
                          </TableHead>
                          <TableHead className="text-right">
                            {isRTL ? "مدين" : "Debit"}
                          </TableHead>
                          <TableHead className="text-right">
                            {isRTL ? "دائن" : "Credit"}
                          </TableHead>
                          <TableHead className="text-right">
                            {isRTL ? "الرصيد" : "Balance"}
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {ledgerResponse?.data?.data?.entries?.map((entry) => (
                          <TableRow key={entry.journalEntryId}>
                            <TableCell>
                              {formatDate(new Date(entry.date))}
                            </TableCell>
                            <TableCell className="font-mono">
                              {entry.entryNumber}
                            </TableCell>
                            <TableCell>{entry.description || "-"}</TableCell>
                            <TableCell className="text-right font-mono">
                              {entry.debit > 0
                                ? formatCurrency(entry.debit)
                                : "-"}
                            </TableCell>
                            <TableCell className="text-right font-mono">
                              {entry.credit > 0
                                ? formatCurrency(entry.credit)
                                : "-"}
                            </TableCell>
                            <TableCell className="text-right font-mono font-semibold">
                              {formatCurrency(entry.runningBalance)}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default FinancialReports;

