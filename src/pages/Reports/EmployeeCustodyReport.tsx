import React from "react";
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
  Users,
  TrendingDown,
  TrendingUp,
  Download,
  Receipt,
} from "lucide-react";
import { formatNumber, formatDate } from "../../Helpers/localization";
import { Badge } from "../../components/ui/badge";

const EmployeeCustodyReport: React.FC = () => {
  const { t, isRTL } = useLanguage();
  const { data: reportData, isLoading } = useEmployeeCustodyReport();

  const handlePrint = () => {
    window.print();
  };

  const employees = reportData?.data || [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {isRTL ? "تقرير عهد الموظفين" : "Employee Custody Report"}
          </h1>
          <p className="text-muted-foreground">
            {isRTL
              ? "متابعة أرصدة عهد الموظفين وحركات المصروفات"
              : "Monitor employee custody balances and expense movements"}
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={handlePrint}>
          <Download className="w-4 h-4 mr-2" />
          {isRTL ? "تصدير" : "Export"}
        </Button>
      </div>

      {!isLoading && (
        <div className="grid grid-cols-1 gap-6">
          {employees.map((emp) => (
            <Card key={emp.employeeId} className="overflow-hidden">
              <CardHeader className="bg-muted/50 p-4">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-full">
                      <Users className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{emp.employeeName}</CardTitle>
                      <p className="text-sm text-muted-foreground">
                        {isRTL ? "كود الموظف: " : "Employee ID: "} {emp.employeeId.substring(0, 8)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-muted-foreground">
                      {isRTL ? "الرصيد الحالي" : "Current Balance"}
                    </p>
                    <p className={`text-xl font-bold ${emp.currentBalance > 0 ? "text-red-600" : "text-emerald-600"}`}>
                      {formatNumber(emp.currentBalance)}
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-px bg-border">
                  <div className="bg-background p-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-emerald-500" />
                      <span className="text-sm text-muted-foreground">{isRTL ? "إجمالي المستلم" : "Total Received"}</span>
                    </div>
                    <span className="font-semibold text-emerald-600">{formatNumber(emp.totalReceived)}</span>
                  </div>
                  <div className="bg-background p-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <TrendingDown className="w-4 h-4 text-red-500" />
                      <span className="text-sm text-muted-foreground">{isRTL ? "إجمالي المنصرف" : "Total Spent"}</span>
                    </div>
                    <span className="font-semibold text-red-600">{formatNumber(emp.totalSpent)}</span>
                  </div>
                </div>

                <div className="p-4">
                  <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                    <Receipt className="w-4 h-4" />
                    {isRTL ? "آخر العمليات" : "Recent Transactions"}
                  </h4>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className={`text-${isRTL ? "right" : "left"}`}>{isRTL ? "التاريخ" : "Date"}</TableHead>
                          <TableHead className={`text-${isRTL ? "right" : "left"}`}>{isRTL ? "الوصف" : "Description"}</TableHead>
                          <TableHead className={`text-${isRTL ? "right" : "left"}`}>{isRTL ? "المبلغ" : "Amount"}</TableHead>
                          <TableHead className={`text-${isRTL ? "right" : "left"}`}>{isRTL ? "الاتجاه" : "Direction"}</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {emp.transactions.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={4} className="text-center py-4 text-muted-foreground">
                              {isRTL ? "لا توجد حركات" : "No transactions found"}
                            </TableCell>
                          </TableRow>
                        ) : (
                          emp.transactions.map((transaction) => (
                            <TableRow key={transaction.id}>
                              <TableCell className="text-xs">{formatDate(transaction.transactionDate)}</TableCell>
                              <TableCell className="text-sm font-medium">{transaction.description}</TableCell>
                              <TableCell className="font-bold">{formatNumber(transaction.amount)}</TableCell>
                              <TableCell>
                                <Badge variant={transaction.direction === "Debit" ? "default" : "destructive"} className="text-[10px] px-1.5 py-0">
                                  {transaction.direction === "Debit" ? (isRTL ? "استلام عهدة" : "Received") : (isRTL ? "صرف مصروفات" : "Spent")}
                                </Badge>
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          {employees.length === 0 && (
            <Card className="p-12 text-center text-muted-foreground">
               {isRTL ? "لم يتم العثور على موظفين بعهدة" : "No employees with custody found"}
            </Card>
          )}
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

export default EmployeeCustodyReport;
