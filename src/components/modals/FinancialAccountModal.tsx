import React, { useState, useEffect } from "react";
import { X, Save } from "lucide-react";
import { useLanguage } from "../../contexts/LanguageContext";
import {
  useCreateFinancialAccount,
  useUpdateFinancialAccount,
} from "../../hooks/useFinancialAccounts";
import {
  FinancialAccountDto,
  CreateFinancialAccountDto,
  FinancialAccountType,
} from "../../types/api";
import { toast } from "react-toastify";

interface FinancialAccountModalProps {
  isOpen: boolean;
  account?: FinancialAccountDto | null;
  onClose: () => void;
  onSuccess?: () => void;
}

const FinancialAccountModal: React.FC<FinancialAccountModalProps> = ({
  isOpen,
  account,
  onClose,
  onSuccess,
}) => {
  const { isRTL, t } = useLanguage();
  const createAccountMutation = useCreateFinancialAccount();
  const updateAccountMutation = useUpdateFinancialAccount();

  const isEditing = !!account;

  const [formData, setFormData] = useState<CreateFinancialAccountDto>({
    name: account?.name || "",
    accountType: account?.accountType || FinancialAccountType.Bank,
    accountNumber: account?.accountNumber || "",
    bankName: account?.bankName || "",
    iban: account?.iban || "",
    swift: account?.swift || "",
    currency: account?.currency || "SAR",
    description: account?.description || "",
      // initialBalance is usually only set on creation, but API might allow update if not locked
      // For now, I'll allow setting it on creation only visually, or handle update if backend supports it.
      // DTO has it.
    initialBalance: account?.balance || 0, 
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
      if (account) {
          setFormData({
            name: account.name,
            accountType: account.accountType,
            accountNumber: account.accountNumber || "",
            bankName: account.bankName || "",
            iban: account.iban || "",
            swift: account.swift || "",
            currency: account.currency || "SAR",
            initialBalance: account.balance || 0,
            description: account.description || "",
          });
      } else {
        setFormData({
            name: "",
            accountType: FinancialAccountType.Bank,
            accountNumber: "",
            bankName: "",
            iban: "",
            swift: "",
            currency: "SAR",
            initialBalance: 0,
            description: "",
        });
      }
  }, [account, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors: Record<string, string> = {};
    if (!formData.name) {
      newErrors.name = isRTL ? "اسم الحساب مطلوب" : "Account Name is required";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      let result;
      if (isEditing && account) {
        // Exclude initialBalance from update if backend doesn't support re-initializing balance logic here
        // But CreateFinancialAccountDto usually has it. UpdateDTO might differ.
        // Let's assume UpdateDTO has similar fields.
        const { initialBalance, ...updateData } = formData;
        result = await updateAccountMutation.mutateAsync({
          id: account.id,
          data: updateData, // ensure UpdateFinancialAccountDto compatible
        });
      } else {
        result = await createAccountMutation.mutateAsync(formData);
      }

      if (result.success) {
        toast.success(
          isEditing
            ? (isRTL ? "تم تحديث الحساب بنجاح" : "Account updated successfully")
            : (isRTL ? "تم إنشاء الحساب بنجاح" : "Account created successfully")
        );
        onSuccess?.();
        handleClose();
      }
    } catch (error) {
      toast.error(
        isEditing
          ? (isRTL ? "فشل في تحديث الحساب" : "Failed to update account")
          : (isRTL ? "فشل في إنشاء الحساب" : "Failed to create account")
      );
    }
  };

  const handleClose = () => {
    setErrors({});
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      dir={isRTL ? "rtl" : "ltr"}
    >
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div
          className={`flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 ${
            isRTL ? "flex-row-reverse" : ""
          }`}
        >
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            {isEditing
              ? (isRTL ? "تعديل حساب مالي" : "Edit Financial Account")
              : (isRTL ? "حساب مالي جديد" : "New Financial Account")}
          </h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Account Type */}
             <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {isRTL ? "نوع الحساب" : "Account Type"}
              </label>
              <div className="flex space-x-4 space-x-reverse">
                  {[FinancialAccountType.Bank, FinancialAccountType.Cash, FinancialAccountType.Custody].map((type) => (
                      <label key={type} className={`inline-flex items-center cursor-pointer ${isRTL ? "ml-4" : "mr-4"}`}>
                          <input
                              type="radio"
                              name="accountType"
                              value={type}
                              checked={formData.accountType === type}
                              onChange={() => setFormData({...formData, accountType: type})}
                              className="form-radio text-purple-600"
                          />
                          <span className="ml-2 mr-2">{type}</span>
                      </label>
                  ))}
              </div>
            </div>

            {/* Name */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {isRTL ? "اسم الحساب" : "Account Name"} *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => {
                  setFormData({ ...formData, name: e.target.value });
                  setErrors({ ...errors, name: "" });
                }}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                  errors.name
                    ? "border-red-500"
                    : "border-gray-300 dark:border-gray-600"
                } ${isRTL ? "text-right" : "text-left"}`}
                placeholder={isRTL ? "اسم الحساب" : "Account Name"}
                required
              />
              {errors.name && (
                <p className="text-red-500 text-xs mt-1">{errors.name}</p>
              )}
            </div>

            {/* Bank Fields (Condition: Only if Bank) */}
            {formData.accountType === FinancialAccountType.Bank && (
                <>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            {isRTL ? "اسم البنك" : "Bank Name"}
                        </label>
                        <input
                            type="text"
                            value={formData.bankName}
                            onChange={(e) => setFormData({...formData, bankName: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        />
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            {isRTL ? "رقم الحساب" : "Account Number"}
                        </label>
                        <input
                            type="text"
                            value={formData.accountNumber}
                            onChange={(e) => setFormData({...formData, accountNumber: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            {isRTL ? "IBAN" : "IBAN"}
                        </label>
                        <input
                            type="text"
                            value={formData.iban}
                            onChange={(e) => setFormData({...formData, iban: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        />
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            {isRTL ? "SWIFT" : "SWIFT"}
                        </label>
                        <input
                            type="text"
                            value={formData.swift}
                            onChange={(e) => setFormData({...formData, swift: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        />
                    </div>
                </>
            )}

            {/* Currency */}
             <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {isRTL ? "العملة" : "Currency"}
              </label>
              <select
                value={formData.currency}
                onChange={(e) =>
                  setFormData({ ...formData, currency: e.target.value })
                }
                className={`w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                  isRTL ? "text-right" : "text-left"
                }`}
              >
                  <option value="SAR">SAR</option>
                  <option value="EGP">EGP</option>
                  <option value="USD">USD</option>
              </select>
            </div>

            {/* Initial Balance */}
            {!isEditing && (
                 <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {isRTL ? "الرصيد الافتتاحي" : "Initial Balance"}
                  </label>
                  <input
                    type="number"
                    value={formData.initialBalance}
                    onChange={(e) =>
                      setFormData({ ...formData, initialBalance: Number(e.target.value) })
                    }
                    className={`w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                      isRTL ? "text-right" : "text-left"
                    }`}
                  />
                </div>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {isRTL ? "الوصف" : "Description"}
            </label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              className={`w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                isRTL ? "text-right" : "text-left"
              }`}
            />
          </div>

          {/* Buttons */}
          <div
            className={`flex justify-end space-x-4 ${
              isRTL ? "flex-row-reverse space-x-reverse" : ""
            }`}
          >
            <button
              type="button"
              onClick={handleClose}
              className="px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              {isRTL ? "إلغاء" : "Cancel"}
            </button>
            <button
              type="submit"
              disabled={createAccountMutation.isPending || updateAccountMutation.isPending}
              className={`flex items-center space-x-2 px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 ${
                isRTL ? "flex-row-reverse space-x-reverse" : ""
              }`}
            >
              <Save className="w-4 h-4" />
              <span>
                {createAccountMutation.isPending || updateAccountMutation.isPending
                  ? (isRTL ? "جاري الحفظ..." : "Saving...")
                  : (isRTL ? "حفظ" : "Save")}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FinancialAccountModal;
