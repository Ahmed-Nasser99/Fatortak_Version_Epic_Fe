import React, { useState } from "react";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  BookOpen,
  Loader2,
  ChevronRight,
  ChevronDown,
  FileText,
} from "lucide-react";
import { useLanguage } from "../contexts/LanguageContext";
import {
  useAccounts,
  useCreateAccount,
  useUpdateAccount,
  useDeleteAccount,
  useAccountHierarchy,
} from "../hooks/useAccounting";
import {
  AccountDto,
  AccountCreateDto,
  AccountUpdateDto,
  AccountType,
} from "../types/api";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Input } from "../components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../components/ui/dialog";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { formatCurrency } from "../Helpers/formatCurrency";
import { toast } from "sonner";

const ChartOfAccounts: React.FC = () => {
  const { t, isRTL } = useLanguage();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedAccountType, setSelectedAccountType] = useState<
    AccountType | "all"
  >("all");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<AccountDto | null>(
    null
  );
  const [expandedAccounts, setExpandedAccounts] = useState<Set<string>>(
    new Set()
  );
  const [pagination, setPagination] = useState({
    pageNumber: 1,
    pageSize: 100,
  });

  const { data: accountsResponse, isLoading, refetch } = useAccounts(
    pagination,
    {
      name: searchTerm || undefined,
      accountType:
        selectedAccountType !== "all"
          ? selectedAccountType
          : undefined,
    }
  );

  const { data: hierarchyResponse } = useAccountHierarchy();
  const createAccountMutation = useCreateAccount();
  const updateAccountMutation = useUpdateAccount();
  const deleteAccountMutation = useDeleteAccount();

  const accounts = accountsResponse?.data?.data || [];
  const hierarchy = hierarchyResponse?.data?.data || [];

  const accountTypeColors: Record<AccountType, string> = {
    [AccountType.Asset]: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
    [AccountType.Liability]: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
    [AccountType.Equity]: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
    [AccountType.Revenue]: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
    [AccountType.Expense]: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
  };

  const toggleExpand = (accountId: string) => {
    setExpandedAccounts((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(accountId)) {
        newSet.delete(accountId);
      } else {
        newSet.add(accountId);
      }
      return newSet;
    });
  };

  const handleCreateAccount = () => {
    setSelectedAccount(null);
    setIsCreateModalOpen(true);
  };

  const handleEditAccount = (account: AccountDto) => {
    setSelectedAccount(account);
    setIsEditModalOpen(true);
  };

  const handleDeleteAccount = async (accountId: string) => {
    if (
      window.confirm(
        isRTL
          ? "هل أنت متأكد من حذف هذا الحساب؟"
          : "Are you sure you want to delete this account?"
      )
    ) {
      try {
        const result = await deleteAccountMutation.mutateAsync(accountId);
        if (result.success) {
          refetch();
        }
      } catch (error: any) {
        toast.error(error.message || "Failed to delete account");
      }
    }
  };

  const renderAccountTree = (accountList: AccountDto[], level: number = 0) => {
    return accountList.map((account) => {
      const hasChildren = account.childAccounts && account.childAccounts.length > 0;
      const isExpanded = expandedAccounts.has(account.id);

      return (
        <div key={account.id} className="mb-1">
          <div
            className={`flex items-center gap-2 p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800 ${
              level > 0 ? "ml-4" : ""
            }`}
            style={{ paddingLeft: `${level * 1.5}rem` }}
          >
            {hasChildren && (
              <button
                onClick={() => toggleExpand(account.id)}
                className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
              >
                {isExpanded ? (
                  <ChevronDown className="w-4 h-4" />
                ) : (
                  <ChevronRight className="w-4 h-4" />
                )}
              </button>
            )}
            {!hasChildren && <div className="w-6" />}
            <div className="flex-1 flex items-center gap-3">
              <span className="font-mono text-sm text-gray-600 dark:text-gray-400">
                {account.accountCode}
              </span>
              <span className="flex-1">{account.name}</span>
              <Badge
                className={accountTypeColors[account.accountType]}
              >
                {account.accountTypeName}
              </Badge>
              {account.isPostable && (
                <Badge variant="outline" className="text-xs">
                  Postable
                </Badge>
              )}
              {account.balance !== undefined && (
                <span className="font-semibold">
                  {formatCurrency(account.balance)}
                </span>
              )}
              <div className="flex gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleEditAccount(account)}
                >
                  <Edit className="w-4 h-4" />
                </Button>
                {!hasChildren && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteAccount(account.id)}
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </Button>
                )}
              </div>
            </div>
          </div>
          {hasChildren && isExpanded && account.childAccounts && (
            <div className="ml-4">
              {renderAccountTree(account.childAccounts, level + 1)}
            </div>
          )}
        </div>
      );
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                  <BookOpen className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <CardTitle className="text-2xl">
                    {isRTL ? "دليل الحسابات" : "Chart of Accounts"}
                  </CardTitle>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {isRTL
                      ? "إدارة الحسابات المحاسبية"
                      : "Manage your accounting accounts"}
                  </p>
                </div>
              </div>
              <Button onClick={handleCreateAccount}>
                <Plus className="w-4 h-4 mr-2" />
                {isRTL ? "إضافة حساب" : "Add Account"}
              </Button>
            </div>
          </CardHeader>
        </Card>

        {/* Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder={
                      isRTL ? "بحث عن حساب..." : "Search accounts..."
                    }
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select
                value={selectedAccountType}
                onValueChange={(value) =>
                  setSelectedAccountType(value as AccountType | "all")
                }
              >
                <SelectTrigger className="w-48">
                  <SelectValue
                    placeholder={
                      isRTL ? "نوع الحساب" : "Account Type"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">
                    {isRTL ? "جميع الأنواع" : "All Types"}
                  </SelectItem>
                  <SelectItem value={AccountType.Asset.toString()}>
                    Asset
                  </SelectItem>
                  <SelectItem value={AccountType.Liability.toString()}>
                    Liability
                  </SelectItem>
                  <SelectItem value={AccountType.Equity.toString()}>
                    Equity
                  </SelectItem>
                  <SelectItem value={AccountType.Revenue.toString()}>
                    Revenue
                  </SelectItem>
                  <SelectItem value={AccountType.Expense.toString()}>
                    Expense
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Accounts List */}
        <Card>
          <CardHeader>
            <CardTitle>
              {isRTL ? "قائمة الحسابات" : "Accounts List"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
              </div>
            ) : (
              <div className="space-y-1">
                {hierarchy.length > 0
                  ? renderAccountTree(hierarchy)
                  : accounts.length > 0
                  ? accounts.map((account) => (
                      <div
                        key={account.id}
                        className="flex items-center gap-3 p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800"
                      >
                        <span className="font-mono text-sm text-gray-600 dark:text-gray-400 w-20">
                          {account.accountCode}
                        </span>
                        <span className="flex-1">{account.name}</span>
                        <Badge
                          className={accountTypeColors[account.accountType]}
                        >
                          {account.accountTypeName}
                        </Badge>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditAccount(account)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteAccount(account.id)}
                          >
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </Button>
                        </div>
                      </div>
                    ))
                  : (
                      <div className="text-center py-12 text-gray-500">
                        {isRTL
                          ? "لا توجد حسابات"
                          : "No accounts found"}
                      </div>
                    )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Create Account Modal */}
        <CreateAccountModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onSuccess={() => {
            setIsCreateModalOpen(false);
            refetch();
          }}
        />

        {/* Edit Account Modal */}
        {selectedAccount && (
          <EditAccountModal
            isOpen={isEditModalOpen}
            onClose={() => {
              setIsEditModalOpen(false);
              setSelectedAccount(null);
            }}
            account={selectedAccount}
            onSuccess={() => {
              setIsEditModalOpen(false);
              setSelectedAccount(null);
              refetch();
            }}
          />
        )}
      </div>
    </div>
  );
};

// Create Account Modal Component
interface CreateAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const CreateAccountModal: React.FC<CreateAccountModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { isRTL } = useLanguage();
  const createAccountMutation = useCreateAccount();
  const [formData, setFormData] = useState<AccountCreateDto>({
    accountCode: "",
    name: "",
    accountType: AccountType.Asset,
    description: "",
    isActive: true,
    isPostable: false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const result = await createAccountMutation.mutateAsync(formData);
      if (result.success) {
        onSuccess();
        setFormData({
          accountCode: "",
          name: "",
          accountType: AccountType.Asset,
          description: "",
          isActive: true,
          isPostable: false,
        });
      }
    } catch (error: any) {
      // Error handled by mutation
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {isRTL ? "إضافة حساب جديد" : "Create New Account"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>
                {isRTL ? "رمز الحساب" : "Account Code"} *
              </Label>
              <Input
                value={formData.accountCode}
                onChange={(e) =>
                  setFormData({ ...formData, accountCode: e.target.value })
                }
                required
                placeholder="e.g., 1000"
              />
            </div>
            <div>
              <Label>
                {isRTL ? "اسم الحساب" : "Account Name"} *
              </Label>
              <Input
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                required
              />
            </div>
          </div>
          <div>
            <Label>
              {isRTL ? "نوع الحساب" : "Account Type"} *
            </Label>
            <Select
              value={formData.accountType.toString()}
              onValueChange={(value) =>
                setFormData({
                  ...formData,
                  accountType: parseInt(value) as AccountType,
                })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={AccountType.Asset.toString()}>
                  Asset
                </SelectItem>
                <SelectItem value={AccountType.Liability.toString()}>
                  Liability
                </SelectItem>
                <SelectItem value={AccountType.Equity.toString()}>
                  Equity
                </SelectItem>
                <SelectItem value={AccountType.Revenue.toString()}>
                  Revenue
                </SelectItem>
                <SelectItem value={AccountType.Expense.toString()}>
                  Expense
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>
              {isRTL ? "الوصف" : "Description"}
            </Label>
            <Textarea
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              rows={3}
            />
          </div>
          <div className="flex gap-4">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isActive"
                checked={formData.isActive}
                onChange={(e) =>
                  setFormData({ ...formData, isActive: e.target.checked })
                }
                className="w-4 h-4"
              />
              <Label htmlFor="isActive">
                {isRTL ? "نشط" : "Active"}
              </Label>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isPostable"
                checked={formData.isPostable}
                onChange={(e) =>
                  setFormData({ ...formData, isPostable: e.target.checked })
                }
                className="w-4 h-4"
              />
              <Label htmlFor="isPostable">
                {isRTL ? "قابل للترحيل" : "Postable"}
              </Label>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              {isRTL ? "إلغاء" : "Cancel"}
            </Button>
            <Button
              type="submit"
              disabled={createAccountMutation.isPending}
            >
              {createAccountMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {isRTL ? "جاري الحفظ..." : "Saving..."}
                </>
              ) : (
                isRTL ? "حفظ" : "Save"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

// Edit Account Modal Component
interface EditAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  account: AccountDto;
  onSuccess: () => void;
}

const EditAccountModal: React.FC<EditAccountModalProps> = ({
  isOpen,
  onClose,
  account,
  onSuccess,
}) => {
  const { isRTL } = useLanguage();
  const updateAccountMutation = useUpdateAccount();
  const [formData, setFormData] = useState<AccountUpdateDto>({
    name: account.name,
    description: account.description,
    isActive: account.isActive,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const result = await updateAccountMutation.mutateAsync({
        id: account.id,
        data: formData,
      });
      if (result.success) {
        onSuccess();
      }
    } catch (error: any) {
      // Error handled by mutation
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {isRTL ? "تعديل الحساب" : "Edit Account"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>
              {isRTL ? "رمز الحساب" : "Account Code"}
            </Label>
            <Input value={account.accountCode} disabled />
          </div>
          <div>
            <Label>
              {isRTL ? "اسم الحساب" : "Account Name"} *
            </Label>
            <Input
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              required
            />
          </div>
          <div>
            <Label>
              {isRTL ? "الوصف" : "Description"}
            </Label>
            <Textarea
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              rows={3}
            />
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isActive"
              checked={formData.isActive}
              onChange={(e) =>
                setFormData({ ...formData, isActive: e.target.checked })
              }
              className="w-4 h-4"
            />
            <Label htmlFor="isActive">
              {isRTL ? "نشط" : "Active"}
            </Label>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              {isRTL ? "إلغاء" : "Cancel"}
            </Button>
            <Button
              type="submit"
              disabled={updateAccountMutation.isPending}
            >
              {updateAccountMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {isRTL ? "جاري الحفظ..." : "Saving..."}
                </>
              ) : (
                isRTL ? "حفظ" : "Save"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ChartOfAccounts;

