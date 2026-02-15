import React from "react";
import { Calendar, User, FileText, Package } from "lucide-react";
import { getColorClasses } from "./colorUtils";
import { formatDate } from "@/Helpers/localization";

interface TemplateProps {
  invoice: any;
  company: any;
  isRTL: boolean;
  t: (key: string) => string;
  formatCurrency: (amount: number) => string;
  getStatusColor: (status: string) => string;
  getInvoiceTypeColor: (type: string) => string;
  customColor?: string;
}

const ModernGradientTemplate: React.FC<TemplateProps> = ({
  invoice,
  company,
  isRTL,
  t,
  formatCurrency,
  getStatusColor,
  getInvoiceTypeColor,
  customColor,
}) => {
  const colors = getColorClasses(customColor);

  return (
    <div className={`${isRTL ? "rtl" : "ltr"}`}>
      {/* Professional Invoice Header */}
      <div
        className={`flex justify-between items-start mb-8 pb-6 border-b-4 border-${colors.primary}`}
      >
        <div className="flex items-start space-x-4 rtl:space-x-reverse">
          {company?.logoUrl && (
            <img
              src={company.logoUrl}
              alt={company.name || t("company")}
              className="h-36 w-auto object-contain"
            />
          )}
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              {company?.name || t("company")}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              {company?.address || t("defaultAddress")}
            </p>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              {company?.email || "info@company.com"} |{" "}
              {company?.phone || t("defaultPhone")}
            </p>
            {company?.taxNumber && (
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                {t("taxNumber")}: {company.taxNumber}
              </p>
            )}
          </div>
        </div>
        <div className={`text-${isRTL ? "left" : "right"}`}>
          <h2
            className={`text-4xl font-bold ${colors.text} dark:${colors.text} mb-3`}
          >
            {invoice.invoiceNumber}
          </h2>
          <div
            className={`inline-block px-4 py-2 rounded-full text-sm font-semibold border mb-2 ${getStatusColor(
              invoice.status
            )}`}
          >
            {t(`status.${invoice.status.toLowerCase()}`)}
          </div>
          <div
            className={`inline-block px-4 py-2 rounded-full text-sm font-semibold ml-2 rtl:ml-0 rtl:mr-2 ${getInvoiceTypeColor(
              invoice.invoiceType
            )}`}
          >
            {t(`invoiceType.${invoice.invoiceType.toLowerCase()}`)}
          </div>
        </div>
      </div>

      {/* Invoice Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Bill To */}
        <div
          className={`bg-gray-50 dark:bg-gray-800/50 p-6 rounded-2xl border-l-4 rtl:border-l-0 rtl:border-r-4 border-${colors.primary}`}
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            <User
              className={`w-5 h-5 ${colors.text} ${isRTL ? "ml-2" : "mr-2"}`}
            />
            {t("billTo")}
          </h3>
          <div className="space-y-3">
            <div>
              <div className="text-xs text-gray-500 uppercase mb-1">
                {t("customer")}
              </div>
              <div className="font-semibold text-gray-900 dark:text-white">
                {invoice.customerName}
              </div>
            </div>
            {invoice.customerEmail && (
              <div>
                <div className="text-xs text-gray-500 uppercase mb-1">
                  {t("email")}
                </div>
                <div className="font-semibold text-gray-900 dark:text-white">
                  {invoice.customerEmail}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Invoice Details */}
        <div
          className={`bg-gray-50 dark:bg-gray-800/50 p-6 rounded-2xl border-l-4 rtl:border-l-0 rtl:border-r-4 border-${colors.primary}`}
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            <Calendar
              className={`w-5 h-5 ${colors.text} ${isRTL ? "ml-2" : "mr-2"}`}
            />
            {t("invoiceDetails")}
          </h3>
          <div className="space-y-3">
            <div>
              <div className="text-xs text-gray-500 uppercase mb-1">
                {t("issueDate")}
              </div>
              <div className="font-semibold text-gray-900 dark:text-white">
                {formatDate(invoice.issueDate)}
              </div>
            </div>
            <div>
              <div className="text-xs text-gray-500 uppercase mb-1">
                {t("dueDate")}
              </div>
              <div className="font-semibold text-gray-900 dark:text-white">
                {formatDate(invoice.dueDate)}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Items Section */}
      {invoice.items && invoice.items.length > 0 && (
        <div className="mb-8">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
            <Package
              className={`w-6 h-6 ${colors.text} ${isRTL ? "ml-3" : "mr-3"}`}
            />
            {t("items")}
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse bg-white dark:bg-gray-800 shadow-lg rounded-2xl overflow-hidden">
              <thead>
                <tr
                  className={`bg-gradient-to-r ${colors.gradient} text-white`}
                >
                  <th className="px-6 py-4 text-left rtl:text-right font-semibold">
                    {t("item")}
                  </th>
                  <th className="px-6 py-4 text-center font-semibold">
                    {t("quantity")}
                  </th>
                  <th className="px-6 py-4 text-center font-semibold">
                    {t("price")}
                  </th>
                  <th className="px-6 py-4 text-center font-semibold">
                    {t("vatRate")}
                  </th>
                  <th className="px-6 py-4 text-center font-semibold">
                    {t("discount")}
                  </th>
                  <th className="px-6 py-4 text-center font-semibold">
                    {t("total")}
                  </th>
                </tr>
              </thead>
              <tbody>
                {invoice.items.map((item: any, index: number) => (
                  <tr
                    key={item.id || index}
                    className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50"
                  >
                    <td className="px-6 py-4">
                      <div className="font-semibold text-gray-900 dark:text-white">
                        {item.itemName || item.name}
                      </div>
                      {item.description && (
                        <div className="text-gray-600 dark:text-gray-400 text-sm mt-1">
                          {item.description}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-center font-medium text-gray-900 dark:text-white">
                      {item.quantity}
                    </td>
                    <td className="px-6 py-4 text-center font-medium text-gray-900 dark:text-white">
                      {item.unitPrice?.toFixed(2)}{" "}
                      {company?.currency || t("defaultCurrency")}
                    </td>
                    <td className="px-6 py-4 text-center font-medium text-gray-900 dark:text-white">
                      {item?.vatRate
                        ? `${Math.floor(item.vatRate * 100)}%`
                        : t("none")}
                    </td>
                    <td className="px-6 py-4 text-center font-medium text-gray-900 dark:text-white">
                      {item?.discount
                        ? `${Math.floor(item.discount * 100)}%`
                        : t("none")}
                    </td>
                    <td className="px-6 py-4 text-center font-bold text-gray-900 dark:text-white">
                      {(item.quantity * item.unitPrice)?.toFixed(2)}{" "}
                      {company?.currency || t("defaultCurrency")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Totals Section */}
      <div
        className={`bg-gradient-to-r ${colors.gradient} text-white p-8 rounded-2xl`}
      >
        <h3 className="text-xl font-semibold mb-6">{t("summary")}</h3>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-purple-100">{t("subtotal")}</span>
            <span className="font-semibold text-lg">
              {formatCurrency(invoice.total - (invoice.vatAmount || 0))}{" "}
              {company?.currency || t("defaultCurrency")}
            </span>
          </div>
          {invoice.vatAmount > 0 && (
            <div className="flex justify-between items-center">
              <span className="text-purple-100">{t("vatLabel")}</span>
              <span className="font-semibold text-lg">
                {formatCurrency(invoice.vatAmount || 0)}{" "}
                {company?.currency || t("defaultCurrency")}
              </span>
            </div>
          )}
          {invoice.totalDiscount > 0 && (
            <div className="flex justify-between items-center">
              <span className="text-purple-100">{t("totalDiscount")}</span>
              <span className="font-semibold text-lg">
                {formatCurrency(invoice.totalDiscount || 0)}{" "}
                {company?.currency || t("defaultCurrency")}
              </span>
            </div>
          )}
          <div
            className={`flex justify-between items-center border-t border-${colors.primary}/50 pt-4 mt-4`}
          >
            <span className="text-xl font-bold">{t("total")}</span>
            <span className="text-3xl font-bold">
              {formatCurrency(invoice.total || 0)}{" "}
              {company?.currency || t("defaultCurrency")}
            </span>
          </div>
        </div>
      </div>

      {/* Notes */}
      {invoice.notes && (
        <div className="bg-gray-50 dark:bg-gray-800/50 p-6 rounded-2xl mt-8">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
            {t("notes")}
          </h3>
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
            {invoice.notes}
          </p>
        </div>
      )}
    </div>
  );
};

export default ModernGradientTemplate;
