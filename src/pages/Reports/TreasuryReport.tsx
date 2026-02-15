import React, { useState } from "react";
import { useLanguage } from "../../contexts/LanguageContext";
import { useTreasuryReport } from "../../hooks/useReports";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import {
  Wallet,
  Landmark,
  TrendingDown,
  TrendingUp,
  Download,
  Filter,
} from "lucide-react";
import { formatNumber, formatDate } from "../../Helpers/localization";
import FinancialAccountSelector from "../../components/ui/FinancialAccountSelector";
import { Input } from "../../components/ui/input";
import { Badge } from "../../components/ui/badge";

const TreasuryReport: React.FC = () => {
  const { t, isRTL } = useLanguage();
  const [selectedAccountId, setSelectedAccountId] = useState<string>("all");
  const [fromDate, setFromDate] = useState<string>("");
  const [toDate, setToDate] = useState<string>("");

  const { data: reportData, isLoading, error } = useTreasuryReport(
    fromDate || undefined,
    toDate || undefined,
    selectedAccountId === "all" ? undefined : selectedAccountId
  );

  const report = reportData?.data;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {isRTL ? "تقرير الخزينة والبنوك" : "Treasury & Bank Report"}
          </h1>
          <p className="text-muted-foreground">
            {isRTL
              ? "متابعة أرصدة الحسابات وحركة الأموال"
              : "Monitor account balances and fund movements"}
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={handlePrint}>
          <Download className="w-4 h-4 mr-2" />
          {isRTL ? "تصدير" : "Export"}
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            <div className="space-y-2">
              <label className="text-sm font-medium">
                {isRTL ? "الحساب" : "Account"}
              </label>
              <FinancialAccountSelector
                value={selectedAccountId}
                onChange={setSelectedAccountId}
                allowAll
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">
                {isRTL ? "من تاريخ" : "From Date"}
              </label>
              <Input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">
                {isRTL ? "إلى تاريخ" : "To Date"}
              </label>
              <Input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {!isLoading && report && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          
          {/* Summary Card */}
             <Card className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
              <CardContent className="p-6 flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-white/20 rounded-full backdrop-blur-sm">
                        <Landmark className="w-8 h-8 text-white" />
                    </div>
                    <div>
                        <p className="text-blue-100 font-medium">{isRTL ? "إجمالي الرصيد الحالي" : "Total Current Balance"}</p>
                        <h2 className="text-3xl font-bold">{formatNumber(report.totalBalance)}</h2>
                    </div>
                </div>
                 <div className="flex gap-4">
                    {/* Placeholder for future aggregate stats like Total In/Out if available in DTO */}
                </div>
              </CardContent>
            </Card>

           {/* Accounts List (if viewing all or multiple) */}
           {(!selectedAccountId || selectedAccountId === 'all') && report.accounts && report.accounts.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {report.accounts.map((acc: any) => (
                        <Card key={acc.id} className="hover:shadow-md transition-shadow">
                            <CardContent className="p-4 flex items-center justify-between">
                                <div>
                                    <p className="font-semibold text-lg">{acc.name}</p>
                                    <p className="text-xs text-muted-foreground">{acc.accountType}</p>
                                </div>
                                <div className="text-right">
                                     <p className="font-bold text-xl text-primary">{formatNumber(acc.balance)}</p>
                                     <p className="text-xs text-muted-foreground">{acc.currency}</p>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
           )}


          {/* Transactions Table */}
          <Card>
            <CardHeader>
              <CardTitle>{isRTL ? "سجل الحركات" : "Transaction History"}</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className={`text-${isRTL ? "right" : "left"}`}>{isRTL ? "التاريخ" : "Date"}</TableHead>
                    <TableHead className={`text-${isRTL ? "right" : "left"}`}>{isRTL ? "الحساب" : "Account"}</TableHead>
                    <TableHead className={`text-${isRTL ? "right" : "left"}`}>{isRTL ? "الوصف" : "Description"}</TableHead>
                    <TableHead className={`text-${isRTL ? "right" : "left"}`}>{isRTL ? "النوع" : "Type"}</TableHead>
                    <TableHead className={`text-${isRTL ? "right" : "left"}`}>{isRTL ? "المبلغ" : "Amount"}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {report.transactions.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                        {isRTL ? "لا توجد حركات" : "No transactions found"}
                      </TableCell>
                    </TableRow>
                  ) : (
                    report.transactions.map((transaction) => (
                      <TableRow key={transaction.id}>
                        <TableCell>{formatDate(transaction.transactionDate)}</TableCell>
                        <TableCell>{transaction.financialAccountName || "-"}</TableCell>
                        <TableCell>{transaction.description}</TableCell>
                        <TableCell>
                           <Badge variant={transaction.direction === "In" ? "default" : "destructive"} className="flex w-fit items-center gap-1">
                                {transaction.direction === "In" ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                                {transaction.type}
                            </Badge>
                        </TableCell>
                        <TableCell className={`font-bold ${transaction.direction === "In" ? "text-emerald-600" : "text-red-600"}`}>
                           {transaction.direction === "In" ? "+" : "-"}{formatNumber(transaction.amount)}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {isLoading && (
         <div className="h-64 flex items-center justify-center">
             <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      )}
    </div>
  );
};

export default TreasuryReport;
