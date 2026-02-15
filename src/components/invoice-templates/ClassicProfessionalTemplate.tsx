import React from "react";
import { Calendar, User, Building2 } from "lucide-react";
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

const ClassicProfessionalTemplate: React.FC<TemplateProps> = ({
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
      {/* Classic Header with Theme Color */}
      <div
        className={`bg-gradient-to-r ${colors.gradient} text-white p-8 rounded-t-3xl`}
      >
        <div className="flex justify-between items-start">
          <div className="flex items-center space-x-4 rtl:space-x-reverse">
            {company?.logoUrl && (
              <img
                src={company.logoUrl}
                alt={company.name || t("company")}
                className="h-36 w-auto object-contain bg-gray-200 p-2 rounded-xl"
              />
            )}
            <div>
              <h1 className="text-3xl font-bold mb-1">
                {company?.name || t("company")}
              </h1>
              <p className={`${colors.textLight} text-sm`}>
                {company?.email || "info@company.com"}
              </p>
            </div>
          </div>
          <div className={`text-${isRTL ? "left" : "right"}`}>
            <div
              className={`text-sm uppercase tracking-wider ${colors.textLight} mb-1`}
            >
              {t("invoiceDetails")}
            </div>
            <div className="text-3xl font-bold">{invoice.invoiceNumber}</div>
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="bg-white dark:bg-gray-800 p-8">
        {/* Status Badges */}
        <div className="flex gap-3 mb-8">
          <span
            className={`px-4 py-2 rounded-lg text-sm font-semibold border ${getStatusColor(
              invoice.status
            )}`}
          >
            {t(`status.${invoice.status.toLowerCase()}`)}
          </span>
          <span
            className={`px-4 py-2 rounded-lg text-sm font-semibold ${getInvoiceTypeColor(
              invoice.invoiceType
            )}`}
          >
            {t(`invoiceType.${invoice.invoiceType.toLowerCase()}`)}
          </span>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-3 gap-6 mb-8 border-b border-gray-200 dark:border-gray-700 pb-8">
          <div>
            <div
              className={`flex items-center ${colors.text} dark:${colors.text} mb-2`}
            >
              <Building2 className="w-4 h-4 mr-2 rtl:mr-0 rtl:ml-2" />
              <span className="font-semibold text-sm uppercase tracking-wide">
                {t("company")}
              </span>
            </div>
            <p className="text-gray-700 dark:text-gray-300 text-sm">
              {company?.address || t("defaultAddress")}
            </p>
            <p className="text-gray-700 dark:text-gray-300 text-sm">
              {company?.phone || t("defaultPhone")}
            </p>
          </div>
          <div>
            <div
              className={`flex items-center ${colors.text} dark:${colors.text} mb-2`}
            >
              <User className="w-4 h-4 mr-2 rtl:mr-0 rtl:ml-2" />
              <span className="font-semibold text-sm uppercase tracking-wide">
                {t("billTo")}
              </span>
            </div>
            <p className="font-bold text-gray-900 dark:text-white">
              {invoice.customerName}
            </p>
            <p className="text-gray-700 dark:text-gray-300 text-sm">
              {invoice.customerEmail}
            </p>
          </div>
          <div>
            <div
              className={`flex items-center ${colors.text} dark:${colors.text} mb-2`}
            >
              <Calendar className="w-4 h-4 mr-2 rtl:mr-0 rtl:ml-2" />
              <span className="font-semibold text-sm uppercase tracking-wide">
                {t("dates")}
              </span>
            </div>
            <p className="text-gray-700 dark:text-gray-300 text-sm">
              <span className="font-semibold">{t("issueDate")}:</span>{" "}
              {formatDate(invoice.issueDate)}
            </p>
            <p className="text-gray-700 dark:text-gray-300 text-sm">
              <span className="font-semibold">{t("dueDate")}:</span>{" "}
              {formatDate(invoice.dueDate)}
            </p>
          </div>
        </div>

        {/* Items Table */}
        <table className="w-full mb-8">
          <thead>
            <tr className={`border-b-2 border-${colors.primary}`}>
              <th className="text-left rtl:text-right py-3 text-gray-700 dark:text-gray-300 font-semibold">
                {t("item")}
              </th>
              <th className="text-center py-3 text-gray-700 dark:text-gray-300 font-semibold">
                {t("quantity")}
              </th>
              <th className="text-center py-3 text-gray-700 dark:text-gray-300 font-semibold">
                {t("price")}
              </th>
              <th className="text-right rtl:text-left py-3 text-gray-700 dark:text-gray-300 font-semibold">
                {t("total")}
              </th>
            </tr>
          </thead>
          <tbody>
            {invoice.items.map((item: any, index: number) => (
              <tr
                key={item.id || index}
                className="border-b border-gray-200 dark:border-gray-700"
              >
                <td className="py-4 text-gray-900 dark:text-white">
                  <div className="font-semibold">
                    {item.itemName || item.name}
                  </div>
                  {item.description && (
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {item.description}
                    </div>
                  )}
                </td>
                <td className="py-4 text-center text-gray-900 dark:text-white">
                  {item.quantity}
                </td>
                <td className="py-4 text-center text-gray-900 dark:text-white">
                  {item.unitPrice?.toFixed(2)}
                </td>
                <td className="py-4 text-right rtl:text-left font-semibold text-gray-900 dark:text-white">
                  {(item.quantity * item.unitPrice)?.toFixed(2)}{" "}
                  {company?.currency || t("defaultCurrency")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Totals */}
        <div className="flex justify-end">
          <div className="w-80 space-y-2">
            <div className="flex justify-between py-2">
              <span className="text-gray-700 dark:text-gray-300">
                {t("subtotal")}
              </span>
              <span className="font-semibold text-gray-900 dark:text-white">
                {formatCurrency(invoice.total - (invoice.vatAmount || 0))}{" "}
                {company?.currency || t("defaultCurrency")}
              </span>
            </div>
            {invoice.vatAmount > 0 && (
              <div className="flex justify-between py-2">
                <span className="text-gray-700 dark:text-gray-300">
                  {t("vatLabel")}
                </span>
                <span className="font-semibold text-gray-900 dark:text-white">
                  {formatCurrency(invoice.vatAmount || 0)}{" "}
                  {company?.currency || t("defaultCurrency")}
                </span>
              </div>
            )}
            <div
              className={`flex justify-between py-3 border-t-2 border-${colors.primary}`}
            >
              <span className="text-xl font-bold text-gray-900 dark:text-white">
                {t("total")}
              </span>
              <span
                className={`text-2xl font-bold ${colors.text} dark:${colors.text}`}
              >
                {formatCurrency(invoice.total || 0)}{" "}
                {company?.currency || t("defaultCurrency")}
              </span>
            </div>
          </div>
        </div>

        {/* Notes */}
        {invoice.notes && (
          <div
            className={`mt-8 p-6 ${colors.bgLight} dark:${colors.bg}/20 border-l-4 border-${colors.primary} rounded`}
          >
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
              {t("notes")}
            </h3>
            <p className="text-gray-700 dark:text-gray-300 text-sm">
              {invoice.notes}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ClassicProfessionalTemplate;
