import React, { useState } from "react";
import { X, ArrowRightLeft, Calendar, DollarSign, FileText, Loader2 } from "lucide-react";
import { useLanguage } from "../../contexts/LanguageContext";
import { useFinancialAccounts } from "../../hooks/useFinancialAccounts";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "../../services/api";
import { TransferDto } from "../../types/api";
import { toast } from "react-toastify";
import { DatePicker } from "../ui/date-picker";
import { format } from "date-fns";
import { parseLocalDate } from "@/Helpers/localization";
import FinancialAccountSelector from "../ui/FinancialAccountSelector";
import ProjectSelector from "../ui/ProjectSelector";
import BranchSelector from "../ui/BranchSelector";

interface TransferModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const TransferModal: React.FC<TransferModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const { isRTL, t } = useLanguage();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState<TransferDto>({
    fromAccountId: "",
    toAccountId: "",
    amount: 0,
    date: new Date().toISOString().split("T")[0],
    description: "",
    branchId: "",
    projectId: "",
  });

  const transferMutation = useMutation({
    mutationFn: async (data: TransferDto) => {
      const result = await apiClient.post<any>("/api/transactions/transfer", data);
      if (!result.success) {
        throw new Error(result.errorMessage || (isRTL ? "فشل التحويل" : "Transfer failed"));
      }
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["financialAccounts"] });
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      toast.success(isRTL ? "تم التحويل بنجاح" : "Transfer completed successfully");
      onSuccess();
    },
    onError: (error: any) => {
      toast.error(error.message);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fromAccountId || !formData.toAccountId) {
      toast.error(isRTL ? "يرجى اختيار الحسابات" : "Please select both accounts");
      return;
    }
    if (formData.fromAccountId === formData.toAccountId) {
      toast.error(isRTL ? "لا يمكن التحويل لنفس الحساب" : "Cannot transfer to the same account");
      return;
    }
    if (formData.amount <= 0) {
      toast.error(isRTL ? "المبلغ يجب أن يكون أكبر من صفر" : "Amount must be greater than zero");
      return;
    }

    // Clean data to avoid sending empty strings for GUIDs
    const submissionData = {
      ...formData,
      branchId: formData.branchId || undefined,
      projectId: formData.projectId || undefined,
    };

    transferMutation.mutate(submissionData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" dir={isRTL ? "rtl" : "ltr"}>
      <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-scale-in">
        <div className="bg-gradient-to-r from-indigo-600 to-violet-600 p-6 text-white flex justify-between items-center">
          <div className="flex items-center gap-3">
            <ArrowRightLeft className="w-6 h-6" />
            <h2 className="text-xl font-bold">{isRTL ? "تحويل أموال" : "Transfer Funds"}</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-lg transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {isRTL ? "من حساب" : "From Account"} *
              </label>
              <FinancialAccountSelector
                value={formData.fromAccountId}
                onChange={(val) => setFormData(prev => ({ ...prev, fromAccountId: val }))}
              />
            </div>

            <div className="flex justify-center -my-2">
                <div className="bg-muted p-2 rounded-full border shadow-sm">
                    <ArrowRightLeft className={`w-5 h-5 text-indigo-600 ${isRTL ? "rotate-180" : ""}`} />
                </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {isRTL ? "إلى حساب" : "To Account"} *
              </label>
              <FinancialAccountSelector
                value={formData.toAccountId}
                onChange={(val) => setFormData(prev => ({ ...prev, toAccountId: val }))}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t("amount")} *
                  </label>
                  <div className="relative">
                    <DollarSign className={`absolute top-1/2 -translate-y-1/2 ${isRTL ? "right-3" : "left-3"} w-4 h-4 text-gray-400`} />
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={formData.amount || ""}
                      onChange={(e) => setFormData(prev => ({ ...prev, amount: parseFloat(e.target.value) || 0 }))}
                      className={`w-full ${isRTL ? "pr-10" : "pl-10"} py-2.5 border rounded-xl focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-700`}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t("date")}
                  </label>
                  <DatePicker
                    date={parseLocalDate(formData.date)}
                    setDate={(d) => setFormData(prev => ({ ...prev, date: d ? format(d, "yyyy-MM-dd") : "" }))}
                  />
                </div>
            </div>

            <BranchSelector
              value={formData.branchId || ""}
              onChange={(val) => setFormData(prev => ({ ...prev, branchId: val }))}
              label={isRTL ? "الفرع" : "Branch"}
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {isRTL ? "المشروع (اختياري)" : "Project (Optional)"}
              </label>
              <ProjectSelector
                value={formData.projectId || ""}
                onChange={(val) => setFormData(prev => ({ ...prev, projectId: val }))}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {isRTL ? "ملاحظات" : "Description"}
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-700"
                rows={2}
              />
            </div>
          </div>

          <div className="flex gap-4 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 border border-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              {t("cancel")}
            </button>
            <button
              type="submit"
              disabled={transferMutation.isPending}
              className="flex-1 px-4 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all shadow-lg hover:shadow-indigo-500/30 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {transferMutation.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : <ArrowRightLeft className="w-5 h-5" />}
              <span>{isRTL ? "إتمام التحويل" : "Complete Transfer"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TransferModal;
