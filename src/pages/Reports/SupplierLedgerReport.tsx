import React, { useState } from "react";
import { useLanguage } from "../../contexts/LanguageContext";
import { useSupplierLedgerReport } from "../../hooks/useReports";
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
  FileText,
  Calendar,
} from "lucide-react";
import { formatNumber, formatDate } from "../../Helpers/localization";
import SupplierSelector from "../../components/ui/SupplierSelector";
import { Input } from "../../components/ui/input";
import { Badge } from "../../components/ui/badge";

const SupplierLedgerReport: React.FC = () => {
  const { t, isRTL } = useLanguage();
  const [selectedSupplierId, setSelectedSupplierId] = useState<string>("");
  const [fromDate, setFromDate] = useState<string>("");
  const [toDate, setToDate] = useState<string>("");

  const { data: reportData, isLoading } = useSupplierLedgerReport(
    selectedSupplierId,
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
            {isRTL ? "كشف حساب مورد" : "Supplier Ledger"}
          </h1>
          <p className="text-muted-foreground">
            {isRTL
              ? "تفاصيل المعاملات المالية مع المورد"
              : "Financial transaction details with supplier"}
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
                {isRTL ? "المورد" : "Supplier"}
              </label>
              <SupplierSelector
                value={selectedSupplierId}
                onChange={setSelectedSupplierId}
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

      {selectedSupplierId && !isLoading && report && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
             {/* Summary Info */}
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="bg-gradient-to-br from-gray-50 to-gray-100 border-gray-200">
                     <CardContent className="p-6">
                         <div className="flex justify-between items-center mb-4">
                             <div>
                                 <p className="text-sm font-medium text-gray-500">{isRTL ? "المورد" : "Supplier"}</p>
                                 <h3 className="text-xl font-bold">{report.customerInfo?.name}</h3>
                             </div>
                              <div className="p-2 bg-white rounded-full">
                                 <FileText className="w-6 h-6 text-gray-400" />
                             </div>
                         </div>
                          <div className="space-y-1 text-sm text-gray-600">
                             <p>{report.customerInfo?.email}</p>
                             <p>{report.customerInfo?.phone}</p>
                         </div>
                     </CardContent>
                </Card>
                 <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
                    <CardContent className="p-6 flex flex-col justify-center h-full">
                        <div className="flex justify-between items-center">
                            <p className="text-sm font-medium text-blue-600">{isRTL ? "الرصيد الحالي" : "Current Balance"}</p>
                             <Badge variant="outline" className="bg-blue-200 text-blue-800 border-blue-300">
                                {report.customerInfo?.currency}
                            </Badge>
                        </div>
                         <h2 className="text-3xl font-bold text-blue-700 mt-2">{formatNumber(report.closingBalance)}</h2>
                         <p className="text-xs text-blue-500 mt-1">
                             {isRTL ? "رصيد افتتاحي: " : "Opening Balance: "} {formatNumber(report.openingBalance)}
                         </p>
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
                    <TableHead className={`text-${isRTL ? "right" : "left"}`}>{isRTL ? "مدين" : "Debit"}</TableHead>
                    <TableHead className={`text-${isRTL ? "right" : "left"}`}>{isRTL ? "دائن" : "Credit"}</TableHead>
                    <TableHead className={`text-${isRTL ? "right" : "left"}`}>{isRTL ? "الرصيد" : "Balance"}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {report.transactions.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                        {isRTL ? "لا توجد معاملات" : "No transactions found"}
                      </TableCell>
                    </TableRow>
                  ) : (
                    report.transactions.map((transaction: any) => (
                      <TableRow key={transaction.transactionDate + transaction.transactionDetails}>
                        <TableCell>{formatDate(transaction.transactionDate)}</TableCell>
                        <TableCell>{transaction.transactionDetails}</TableCell>
                        <TableCell>
                            <Badge variant="outline">{transaction.transactionType}</Badge>
                        </TableCell>
                         <TableCell className="font-medium text-red-600">
                            {transaction.invoiceAmount ? formatNumber(transaction.invoiceAmount) : "-"}
                        </TableCell>
                        <TableCell className="font-medium text-emerald-600">
                            {transaction.paymentAmount ? formatNumber(transaction.paymentAmount) : "-"}
                        </TableCell>
                        <TableCell className="font-bold">
                            {formatNumber(transaction.balance)}
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

      {!selectedSupplierId && (
        <Card className="bg-muted/50 border-dashed border-2">
            <CardContent className="h-48 flex flex-col items-center justify-center text-muted-foreground">
                <Calendar className="w-12 h-12 mb-4 opacity-50" />
                <p>{isRTL ? "الرجاء اختيار مورد لعرض التقرير" : "Please select a supplier to view report"}</p>
            </CardContent>
        </Card>
      )}

       {isLoading && selectedSupplierId && (
         <div className="h-64 flex items-center justify-center">
             <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      )}
    </div>
  );
};

export default SupplierLedgerReport;
