import React, { useState } from "react";
import { useLanguage } from "../../contexts/LanguageContext";
import { useProjectSheetReport } from "../../hooks/useReports";
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
  TrendingUp,
  TrendingDown,
  DollarSign,
  Calendar,
  Download,
  FileText,
} from "lucide-react";
import { formatNumber, formatDate } from "../../Helpers/localization";
import ProjectSelector from "../../components/ui/ProjectSelector"; // Changed relative path
import { Input } from "../../components/ui/input"; // Assuming you have an Input component
import { Badge } from "../../components/ui/badge";

const ProjectSheetReport: React.FC = () => {
  const { t, isRTL } = useLanguage();
  const [selectedProjectId, setSelectedProjectId] = useState<string>("");
  const [fromDate, setFromDate] = useState<string>("");
  const [toDate, setToDate] = useState<string>("");

  const { data: reportData, isLoading, error } = useProjectSheetReport(
    selectedProjectId,
    fromDate || undefined,
    toDate || undefined
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
            {isRTL ? "كشف حساب مشروع" : "Project Sheet"}
          </h1>
          <p className="text-muted-foreground">
            {isRTL
              ? "تفاصيل الإيرادات والمصروفات الخاصة بالمشروع"
              : "Detailed income and expense report for project"}
          </p>
        </div>
        <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handlePrint}>
                <Download className="w-4 h-4 mr-2" />
                {isRTL ? "تصدير" : "Export"}
            </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            <div className="space-y-2">
              <label className="text-sm font-medium">
                {isRTL ? "المشروع" : "Project"}
              </label>
              <ProjectSelector
                value={selectedProjectId}
                onChange={setSelectedProjectId}
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
             <div className="hidden md:block">
                {/* Spacer or Button to apply if manual trigger needed */}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Report Content */}
      {selectedProjectId && !isLoading && report && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-200">
              <CardContent className="p-6 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-emerald-600">
                    {isRTL ? "إجمالي الإيرادات" : "Total Income"}
                  </p>
                  <h3 className="text-2xl font-bold text-emerald-700 mt-1">
                    {formatNumber(report.totalIncome)}
                  </h3>
                </div>
                <div className="w-10 h-10 rounded-full bg-emerald-200 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-emerald-700" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200">
              <CardContent className="p-6 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-red-600">
                    {isRTL ? "إجمالي المصروفات" : "Total Expenses"}
                  </p>
                  <h3 className="text-2xl font-bold text-red-700 mt-1">
                    {formatNumber(report.totalExpenses)}
                  </h3>
                </div>
                <div className="w-10 h-10 rounded-full bg-red-200 flex items-center justify-center">
                  <TrendingDown className="w-5 h-5 text-red-700" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
              <CardContent className="p-6 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-600">
                    {isRTL ? "صافي الربج" : "Net Profit"}
                  </p>
                  <h3 className="text-2xl font-bold text-blue-700 mt-1">
                    {formatNumber(report.netProfit)}
                  </h3>
                </div>
                <div className="w-10 h-10 rounded-full bg-blue-200 flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-blue-700" />
                </div>
              </CardContent>
            </Card>

             <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
              <CardContent className="p-6 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-orange-600">
                    {isRTL ? "مستحقات" : "Receivables"}
                  </p>
                  <h3 className="text-2xl font-bold text-orange-700 mt-1">
                    {formatNumber(report.totalReceivables)}
                  </h3>
                </div>
                <div className="w-10 h-10 rounded-full bg-orange-200 flex items-center justify-center">
                  <FileText className="w-5 h-5 text-orange-700" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Transactions Table */}
          <Card>
            <CardHeader>
              <CardTitle>{isRTL ? "تفاصيل المعاملات" : "Transaction Details"}</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                     <TableHead className={`text-${isRTL ? "right" : "left"}`}>{isRTL ? "التاريخ" : "Date"}</TableHead>
                    <TableHead className={`text-${isRTL ? "right" : "left"}`}>{isRTL ? "الوصف" : "Description"}</TableHead>
                    <TableHead className={`text-${isRTL ? "right" : "left"}`}>{isRTL ? "النوع" : "Type"}</TableHead>
                    <TableHead className={`text-${isRTL ? "right" : "left"}`}>{isRTL ? "المبلغ" : "Amount"}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {report.transactions.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                        {isRTL ? "لا توجد معاملات" : "No transactions found"}
                      </TableCell>
                    </TableRow>
                  ) : (
                    report.transactions.map((transaction) => (
                      <TableRow key={transaction.id}>
                        <TableCell>{formatDate(transaction.transactionDate)}</TableCell>
                        <TableCell>{transaction.description}</TableCell>
                        <TableCell>
                            <Badge variant={transaction.direction === "In" ? "default" : "destructive"}>
                                {transaction.type}
                            </Badge>
                        </TableCell>
                        <TableCell className={`font-bold ${transaction.direction === "In" ? "text-emerald-600" : "text-red-600"}`}>
                            {formatNumber(transaction.amount)}
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

      {!selectedProjectId && (
        <Card className="bg-muted/50 border-dashed border-2">
            <CardContent className="h-48 flex flex-col items-center justify-center text-muted-foreground">
                <Calendar className="w-12 h-12 mb-4 opacity-50" />
                <p>{isRTL ? "الرجاء اختيار مشروع لعرض التقرير" : "Please select a project to view report"}</p>
            </CardContent>
        </Card>
      )}

        {isLoading && selectedProjectId && (
            <div className="h-64 flex items-center justify-center">
                 <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        )}
    </div>
  );
};

export default ProjectSheetReport;
