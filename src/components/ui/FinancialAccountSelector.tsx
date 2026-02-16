import React from "react";
import { useFinancialAccounts } from "../../hooks/useFinancialAccounts";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { useLanguage } from "../../contexts/LanguageContext";

interface FinancialAccountSelectorProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
  placeholder?: string;
}

const FinancialAccountSelector: React.FC<FinancialAccountSelectorProps> = ({
  value,
  onChange,
  className,
  placeholder,
}) => {
  const { t, isRTL } = useLanguage();
  
  const { data: accountsResponse, isLoading } = useFinancialAccounts({
    pageNumber: 1,
    pageSize: 100,
  });

  const accounts = accountsResponse?.success
    ? accountsResponse.data?.data || []
    : [];

  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className={`${className} ${isRTL ? "text-right" : "text-left"}`}>
        <SelectValue placeholder={placeholder || (isRTL ? "اختر الحساب" : "Select Account")} />
      </SelectTrigger>
      <SelectContent>
        {accounts.map((account) => (
          <SelectItem key={account.id} value={account.id}>
            {account.name} ({account.type})
          </SelectItem>
        ))}
        {accounts.length === 0 && !isLoading && (
            <div className="p-2 text-sm text-gray-500 text-center">
                {isRTL ? "لا يوجد حسابات" : "No accounts found"}
            </div>
        )}
      </SelectContent>
    </Select>
  );
};

export default FinancialAccountSelector;
