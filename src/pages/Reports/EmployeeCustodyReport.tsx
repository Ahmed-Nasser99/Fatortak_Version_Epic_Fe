import React, { useState } from "react";
import { useLanguage } from "../../contexts/LanguageContext";
import { useEmployeeCustodyReport } from "../../hooks/useReports";
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
  Download,
  User,
  Wallet,
  Calendar,
} from "lucide-react";
import { formatNumber, formatDate } from "../../Helpers/localization";
import EmployeeSelector from "../../components/ui/EmployeeSelector";
import { Input } from "../../components/ui/input";
import { Badge } from "../../components/ui/badge";

const EmployeeCustodyReport: React.FC = () => {
  const { t, isRTL } = useLanguage();
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>("");
  const [fromDate, setFromDate] = useState<string>("");
  const [toDate, setToDate] = useState<string>("");

  const { data: reportData, isLoading } = useEmployeeCustodyReport(
    selectedEmployeeId,
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
            {isRTL ? "تقرير عهدة الموظفين" : "Employee Custody Report"}
          </h1>
          <p className="text-muted-foreground">
            {isRTL
              ? "متابعة العهد المالية المسلمة للموظفين"
              : "Track financial custody assigned to employees"}
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
                {isRTL ? "الموظف" : "Employee"}
              </label>
              <EmployeeSelector
                value={selectedEmployeeId}
                onChange={setSelectedEmployeeId}
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

      {selectedEmployeeId && !isLoading && report && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
             {/* Summary Info */}
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                 <Card className="bg-gradient-to-br from-indigo-50 to-indigo-100 border-indigo-200">
                    <CardContent className="p-6 flex items-center justify-between">
                        <div>
                             <p className="text-sm font-medium text-indigo-600">{isRTL ? "الرصيد الحالي" : "Current Balance"}</p>
                             <h2 className="text-3xl font-bold text-indigo-800 mt-1">{formatNumber(report.currentBalance)}</h2>
                        </div>
                        <div className="bg-indigo-200 p-3 rounded-full">
                            <Wallet className="w-6 h-6 text-indigo-700" />
                        </div>
                    </CardContent>
                </Card>
                 <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-200">
                    <CardContent className="p-6 flex items-center justify-between">
                         <div>
                             <p className="text-sm font-medium text-emerald-600">{isRTL ? "إجمالي المستلم" : "Total Received"}</p>
                             <h2 className="text-3xl font-bold text-emerald-800 mt-1">{formatNumber(report.totalReceived)}</h2>
                        </div>
                         <div className="bg-emerald-200 p-3 rounded-full">
                            <User className="w-6 h-6 text-emerald-700" />
                        </div>
                    </CardContent>
                </Card>
                 <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200">
                    <CardContent className="p-6 flex items-center justify-between">
                         <div>
                             <p className="text-sm font-medium text-red-600">{isRTL ? "إجمالي المنصرف" : "Total Spent"}</p>
                             <h2 className="text-3xl font-bold text-red-800 mt-1">{formatNumber(report.totalSpent)}</h2>
                        </div>
                         <div className="bg-red-200 p-3 rounded-full">
                            <Wallet className="w-6 h-6 text-red-700" />
                        </div>
                    </CardContent>
                </Card>
             </div>

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
                    report.transactions.map((transaction: any) => (
                      <TableRow key={transaction.id}>
                        <TableCell>{formatDate(transaction.transactionDate)}</TableCell>
                        <TableCell>{transaction.description}</TableCell>
                        <TableCell>
                            <Badge variant={transaction.direction === "In" ? "default" : "secondary"}>
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

      {!selectedEmployeeId && (
        <Card className="bg-muted/50 border-dashed border-2">
            <CardContent className="h-48 flex flex-col items-center justify-center text-muted-foreground">
                <Calendar className="w-12 h-12 mb-4 opacity-50" />
                <p>{isRTL ? "الرجاء اختيار موظف لعرض التقرير" : "Please select an employee to view report"}</p>
            </CardContent>
        </Card>
      )}

       {isLoading && selectedEmployeeId && (
         <div className="h-64 flex items-center justify-center">
             <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      )}
    </div>
  );
};

export default EmployeeCustodyReport;
