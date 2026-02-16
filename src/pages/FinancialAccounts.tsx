import React, { useState } from "react";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Wallet,
  CreditCard,
  Building,
  Landmark,
  Banknote,
  DollarSign,
  TrendingUp,
} from "lucide-react";
import { useLanguage } from "../contexts/LanguageContext";
import {
  useFinancialAccounts,
  useDeleteFinancialAccount,
} from "../hooks/useFinancialAccounts";
import {
  PaginationDto,
  FinancialAccountFilterDto,
  FinancialAccountType,
} from "../types/api";
import { toast } from "react-toastify";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import FinancialAccountModal from "../components/modals/FinancialAccountModal";
import EnhancedDeleteDialog from "../components/ui/enhanced-delete-dialog";
import { formatNumber } from "@/Helpers/localization";
import TransferModal from "../components/modals/TransferModal";
import { ArrowRightLeft } from "lucide-react";

const FinancialAccounts: React.FC = () => {
  const { t, isRTL } = useLanguage();
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [editAccount, setEditAccount] = useState<any>(null);
  const [deleteAccountId, setDeleteAccountId] = useState<string | null>(null);

  // Pagination state
  const [pagination, setPagination] = useState<PaginationDto>({
    pageNumber: 1,
    pageSize: 10,
  });

  const filters: FinancialAccountFilterDto = {
    ...(searchTerm && { name: searchTerm }),
  };

  const {
    data: accountsResponse,
    isLoading,
    error,
    refetch,
  } = useFinancialAccounts(pagination, filters);

  const deleteAccountMutation = useDeleteFinancialAccount();

  const accounts = accountsResponse?.success
    ? accountsResponse.data?.data || []
    : [];

  const totalCount = accountsResponse?.success
    ? accountsResponse.data?.totalCount || 0
    : 0;

  // Calculate generic stats based on loaded data (for now)
  const stats = {
    total: totalCount,
    totalBalance: accounts.reduce((acc, curr) => acc + (curr.balance || 0), 0),
  };

  const handleNewAccount = () => {
    setEditAccount(null);
    setIsModalOpen(true);
  };

  const handleEditAccount = (account: any) => {
    setEditAccount(account);
    setIsModalOpen(true);
  };

  const handleDeleteAccount = (accountId: string) => {
    setDeleteAccountId(accountId);
  };

  const handleConfirmDelete = async () => {
    if (!deleteAccountId) return;

    try {
      const result = await deleteAccountMutation.mutateAsync(deleteAccountId);

      if (result.success) {
        toast.success(
          isRTL ? "تم حذف الحساب بنجاح" : "Account deleted successfully",
        );
        setDeleteAccountId(null);
        refetch();
      }
    } catch (error) {
      toast.error(isRTL ? "فشل في حذف الحساب" : "Failed to delete account");
    }
  };

  const handlePageChange = (newPage: number) => {
    setPagination((prev) => ({ ...prev, pageNumber: newPage }));
  };

  const getAccountTypeIcon = (type: FinancialAccountType) => {
    switch (type) {
      case FinancialAccountType.Bank:
        return <Landmark className="w-4 h-4" />;
      case FinancialAccountType.Cash:
        return <Banknote className="w-4 h-4" />;
      case FinancialAccountType.Custody:
        return <Wallet className="w-4 h-4" />;
      default:
        return <Building className="w-4 h-4" />;
    }
  };

  const getAccountTypeBadge = (type: FinancialAccountType) => {
    switch (type) {
      case FinancialAccountType.Bank:
        return (
          <Badge className="bg-blue-100 text-blue-800 border-blue-200 flex items-center gap-1">
            {getAccountTypeIcon(type)} {isRTL ? "بنك" : "Bank"}
          </Badge>
        );
      case FinancialAccountType.Cash:
        return (
          <Badge className="bg-green-100 text-green-800 border-green-200 flex items-center gap-1">
            {getAccountTypeIcon(type)} {isRTL ? "خزينة" : "Cash"}
          </Badge>
        );
      case FinancialAccountType.Custody:
        return (
          <Badge className="bg-purple-100 text-purple-800 border-purple-200 flex items-center gap-1">
            {getAccountTypeIcon(type)} {isRTL ? "عهدة" : "Custody"}
          </Badge>
        );
      default:
        return <Badge variant="secondary">{type}</Badge>;
    }
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
        <div className="flex items-center justify-center min-h-screen">
          <Card className="w-full max-w-md mx-4">
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Wallet className="w-8 h-8 text-destructive" />
              </div>
              <h2 className="text-xl font-semibold text-destructive mb-2">
                {isRTL ? "خطأ في تحميل الحسابات" : "Error Loading Accounts"}
              </h2>
              <Button onClick={() => refetch()} className="w-full">
                {isRTL ? "إعادة المحاولة" : "Retry"}
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
        <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 rounded-3xl p-8 text-white shadow-2xl">
          <div
            className={`flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0 ${
              isRTL ? "lg:flex-row-reverse" : ""
            }`}
          >
            <div className={`flex items-center space-x-4`}>
              <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-lg mx-3">
                <Wallet className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold mb-2">
                  {isRTL ? "الحسابات المالية" : "Financial Accounts"}
                </h1>
                <p className="text-blue-100 text-lg">
                  {isRTL
                    ? "إدارة حسابات البنوك والخزينة والعهد"
                    : "Manage bank accounts, cash, and custody"}
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                onClick={() => setIsTransferModalOpen(true)}
                variant="outline"
                className="bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white border-white/30 px-6 py-3 rounded-xl shadow-lg transition-all"
              >
                <ArrowRightLeft className="w-5 h-5 mr-2" />
                <span>{isRTL ? "تحويل أموال" : "Transfer Funds"}</span>
              </Button>
              <Button
                onClick={handleNewAccount}
                className="bg-white text-indigo-600 hover:bg-gray-100 px-6 py-3 rounded-xl shadow-lg transition-all font-bold"
              >
                <Plus className="w-5 h-5 mr-2" />
                <span>
                  {isRTL ? "حساب جديد" : "New Account"}
                </span>
              </Button>
            </div>
          </div>
        </div>

        {/* Stats Grid - Simplified as we don't need complex stats yet */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 hover:shadow-lg transition-all duration-300">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-600 font-medium">
                  {isRTL ? "إجمالي الحسابات" : "Total Accounts"}
                </p>
                <p className="text-2xl font-bold text-blue-900">
                  {formatNumber(stats.total)}
                </p>
              </div>
              <CreditCard className="w-8 h-8 text-blue-600 opacity-50" />
            </CardContent>
          </Card>
          {/* 
            <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-200 hover:shadow-lg transition-all duration-300">
                <CardContent className="p-4 flex items-center justify-between">
                    <div>
                        <p className="text-sm text-emerald-600 font-medium">{isRTL ? "إجمالي الرصيد (تقريبي)" : "Total Balance (Approx)"}</p>
                        <p className="text-2xl font-bold text-emerald-900">{formatNumber(stats.totalBalance)}</p>
                    </div>
                     <DollarSign className="w-8 h-8 text-emerald-600 opacity-50" />
                </CardContent>
            </Card>
             */}
        </div>

        {/* Search */}
        <Card className="bg-card/60 backdrop-blur-sm border shadow-sm">
          <CardContent className="p-6">
            <div className="relative">
              <Search
                className={`absolute top-1/2 transform -translate-y-1/2 ${
                  isRTL ? "right-4" : "left-4"
                } w-5 h-5 text-muted-foreground`}
              />
              <input
                type="text"
                placeholder={
                  isRTL ? "البحث في الحسابات..." : "Search accounts..."
                }
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full py-3 px-4 ${
                  isRTL ? "pr-12 text-right" : "pl-12"
                } border rounded-xl bg-background/60 backdrop-blur-sm focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-all duration-200`}
              />
            </div>
          </CardContent>
        </Card>

        {/* Accounts List */}
        {!isLoading && (
          <Card className="bg-card/60 backdrop-blur-sm border shadow-sm">
            <div className="hidden lg:block">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b bg-muted/30">
                      <th
                        className={`px-6 py-4 text-${isRTL ? "right" : "left"} text-sm font-semibold text-muted-foreground`}
                      >
                        {isRTL ? "الحساب" : "Account"}
                      </th>
                      <th
                        className={`px-6 py-4 text-${isRTL ? "right" : "left"} text-sm font-semibold text-muted-foreground`}
                      >
                        {isRTL ? "النوع" : "Type"}
                      </th>
                      <th
                        className={`px-6 py-4 text-${isRTL ? "right" : "left"} text-sm font-semibold text-muted-foreground`}
                      >
                        {isRTL ? "تفاصيل البنك" : "Bank Details"}
                      </th>
                      <th
                        className={`px-6 py-4 text-${isRTL ? "right" : "left"} text-sm font-semibold text-muted-foreground`}
                      >
                        {isRTL ? "الرصيد" : "Balance"}
                      </th>
                      <th
                        className={`px-6 py-4 text-${isRTL ? "right" : "left"} text-sm font-semibold text-muted-foreground`}
                      >
                        {isRTL ? "إجراءات" : "Actions"}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/50">
                    {accounts.map((account: any) => (
                      <tr
                        key={account.id}
                        className="hover:bg-muted/20 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <div className="font-semibold">{account.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {account.description}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          {getAccountTypeBadge(account.type)}
                        </td>
                        <td className="px-6 py-4 text-sm text-muted-foreground">
                          {account.type === FinancialAccountType.Bank ? (
                            <div className="flex flex-col">
                              {account.bankName && (
                                <span>
                                  <span className="font-medium">
                                    {isRTL ? "البنك: " : "Bank: "}
                                  </span>
                                  {account.bankName}
                                </span>
                              )}
                              {account.accountNumber && (
                                <span>
                                  <span className="font-medium">
                                    {isRTL ? "رقم الحساب: " : "Acc#: "}
                                  </span>
                                  {account.accountNumber}
                                </span>
                              )}
                              {account.iban && (
                                <span>
                                  <span className="font-medium">IBAN: </span>
                                  {account.iban}
                                </span>
                              )}
                            </div>
                          ) : (
                            "-"
                          )}
                        </td>
                        <td className="px-6 py-4 text-sm font-bold text-emerald-600">
                          {formatNumber(account.balance)} {account.currency}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditAccount(account)}
                              className="text-primary hover:text-primary/80"
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteAccount(account.id)}
                              className="text-destructive hover:text-destructive/80"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Mobile View */}
            <div className="lg:hidden divide-y divide-border/50">
              {accounts.map((account: any) => (
                <div key={account.id} className="p-4 space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-bold">{account.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {getAccountTypeBadge(account.type)}
                      </p>
                    </div>
                    <div className="font-bold text-emerald-600">
                      {formatNumber(account.balance)} {account.currency}
                    </div>
                  </div>
                  {account.type === FinancialAccountType.Bank && (
                    <div className="text-sm text-muted-foreground">
                      {account.bankName && <div>{account.bankName}</div>}
                      {account.accountNumber && (
                        <div>{account.accountNumber}</div>
                      )}
                    </div>
                  )}
                  <div className="flex gap-2 justify-end">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditAccount(account)}
                    >
                      <Edit className="w-3 h-3" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteAccount(account.id)}
                      className="text-destructive"
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            <div className="border-t bg-muted/20 px-6 py-4">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-sm text-muted-foreground">
                  {isRTL
                    ? `عرض ${formatNumber(accounts.length)} من ${formatNumber(totalCount)} حسابات`
                    : `Showing ${formatNumber(accounts.length)} of ${formatNumber(totalCount)} accounts`}
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(pagination.pageNumber - 1)}
                    disabled={pagination.pageNumber <= 1}
                  >
                    {isRTL ? "السابق" : "Previous"}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(pagination.pageNumber + 1)}
                    disabled={accounts.length < pagination.pageSize}
                  >
                    {isRTL ? "التالي" : "Next"}
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Empty State */}
        {!isLoading && accounts.length === 0 && (
          <Card className="bg-card/60 backdrop-blur-sm">
            <CardContent className="p-12 text-center">
              <div className="w-20 h-20 bg-muted rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Wallet className="w-10 h-10 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-semibold mb-2">
                {isRTL ? "لا يوجد حسابات" : "No financial accounts found"}
              </h3>
              <Button
                onClick={handleNewAccount}
                className="bg-gradient-to-r from-blue-600 to-violet-600"
              >
                <Plus className="w-4 h-4 mr-2" />
                {isRTL ? "إضافة أول حساب" : "Add First Account"}
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      <FinancialAccountModal
        isOpen={isModalOpen}
        account={editAccount}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => {
          refetch();
        }}
      />

      <EnhancedDeleteDialog
        isOpen={!!deleteAccountId}
        onClose={() => setDeleteAccountId(null)}
        onConfirm={handleConfirmDelete}
        title={isRTL ? "حذف الحساب" : "Delete Account"}
        description={
          isRTL
            ? "هل أنت متأكد من حذف هذا الحساب؟"
            : "Are you sure you want to delete this account?"
        }
        itemName={accounts.find((a: any) => a.id === deleteAccountId)?.name}
        isLoading={deleteAccountMutation.isPending}
      />

      <TransferModal
        isOpen={isTransferModalOpen}
        onClose={() => setIsTransferModalOpen(false)}
        onSuccess={() => {
          setIsTransferModalOpen(false);
          refetch();
        }}
      />
    </div>
  );
};

export default FinancialAccounts;
