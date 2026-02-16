import { apiClient } from "./api";
import {
  AccountDto,
  AccountCreateDto,
  AccountUpdateDto,
  AccountFilterDto,
  JournalEntryDto,
  JournalEntryCreateDto,
  JournalEntryFilterDto,
  AccountBalanceDto,
  TrialBalanceDto,
  LedgerDto,
  ProfitAndLossDto,
  BalanceSheetDto,
  PagedResponseDto,
  PaginationDto,
  PostPaymentDto,
} from "../types/api";

export const accountingService = {
  // Account Management
  getAccounts: async (
    pagination: PaginationDto,
    filters?: AccountFilterDto
  ) => {
    const params: any = {
      pageNumber: pagination.pageNumber,
      pageSize: pagination.pageSize,
    };

    if (filters) {
      if (filters.accountCode) params.accountCode = filters.accountCode;
      if (filters.name) params.name = filters.name;
      if (filters.accountType !== undefined)
        params.accountType = filters.accountType;
      if (filters.parentAccountId)
        params.parentAccountId = filters.parentAccountId;
      if (filters.isActive !== undefined) params.isActive = filters.isActive;
      if (filters.isPostable !== undefined)
        params.isPostable = filters.isPostable;
      if (filters.includeInactive !== undefined)
        params.includeInactive = filters.includeInactive;
    }

    return apiClient.get<PagedResponseDto<AccountDto>>(
      "/api/accounting/accounts",
      params
    );
  },

  getAccount: async (id: string) => {
    return apiClient.get<AccountDto>(`/api/accounting/accounts/${id}`);
  },

  getAccountHierarchy: async () => {
    return apiClient.get<AccountDto[]>("/api/accounting/accounts/hierarchy");
  },

  createAccount: async (data: AccountCreateDto) => {
    return apiClient.post<AccountDto>("/api/accounting/accounts", data);
  },

  updateAccount: async (id: string, data: AccountUpdateDto) => {
    return apiClient.put<AccountDto>(`/api/accounting/accounts/${id}`, data);
  },

  deleteAccount: async (id: string) => {
    return apiClient.delete<boolean>(`/api/accounting/accounts/${id}`);
  },

  // Journal Entry Management
  getJournalEntries: async (
    pagination: PaginationDto,
    filters?: JournalEntryFilterDto
  ) => {
    const params: any = {
      pageNumber: pagination.pageNumber,
      pageSize: pagination.pageSize,
    };

    if (filters) {
      if (filters.fromDate) params.fromDate = filters.fromDate;
      if (filters.toDate) params.toDate = filters.toDate;
      if (filters.referenceType !== undefined)
        params.referenceType = filters.referenceType;
      if (filters.referenceId) params.referenceId = filters.referenceId;
      if (filters.isPosted !== undefined) params.isPosted = filters.isPosted;
      if (filters.accountId) params.accountId = filters.accountId;
      if (filters.entryNumber) params.entryNumber = filters.entryNumber;
    }

    return apiClient.get<PagedResponseDto<JournalEntryDto>>(
      "/api/accounting/journal-entries",
      params
    );
  },

  getJournalEntry: async (id: string) => {
    return apiClient.get<JournalEntryDto>(
      `/api/accounting/journal-entries/${id}`
    );
  },

  createJournalEntry: async (data: JournalEntryCreateDto) => {
    return apiClient.post<JournalEntryDto>(
      "/api/accounting/journal-entries",
      data
    );
  },

  postJournalEntry: async (id: string) => {
    return apiClient.post<boolean>(
      `/api/accounting/journal-entries/${id}/post`,
      {}
    );
  },

  reverseJournalEntry: async (id: string) => {
    return apiClient.post<boolean>(
      `/api/accounting/journal-entries/${id}/reverse`,
      {}
    );
  },

  // General Ledger Queries
  getAccountBalance: async (accountId: string, asOfDate?: string) => {
    const params: any = {};
    if (asOfDate) params.asOfDate = asOfDate;
    return apiClient.get<AccountBalanceDto>(
      `/api/accounting/accounts/${accountId}/balance`,
      params
    );
  },

  getTrialBalance: async (asOfDate?: string) => {
    const params: any = {};
    if (asOfDate) params.asOfDate = asOfDate;
    return apiClient.get<TrialBalanceDto>(
      "/api/accounting/reports/trial-balance",
      params
    );
  },

  getAccountLedger: async (
    accountId: string,
    fromDate?: string,
    toDate?: string
  ) => {
    const params: any = {};
    if (fromDate) params.fromDate = fromDate;
    if (toDate) params.toDate = toDate;
    return apiClient.get<LedgerDto>(
      `/api/accounting/accounts/${accountId}/ledger`,
      params
    );
  },

  getProfitAndLoss: async (fromDate: string, toDate: string) => {
    return apiClient.get<ProfitAndLossDto>(
      "/api/accounting/reports/profit-and-loss",
      { fromDate, toDate }
    );
  },

  getBalanceSheet: async (asOfDate: string) => {
    return apiClient.get<BalanceSheetDto>("/api/accounting/reports/balance-sheet", {
      asOfDate,
    });
  },

  // Posting Operations
  postInvoice: async (invoiceId: string) => {
    return apiClient.post<{ success: boolean; message: string }>(
      `/api/accounting/posting/invoice/${invoiceId}`,
      {}
    );
  },

  postExpense: async (expenseId: number) => {
    return apiClient.post<{ success: boolean; message: string }>(
      `/api/accounting/posting/expense/${expenseId}`,
      {}
    );
  },

  postPayment: async (data: PostPaymentDto) => {
    return apiClient.post<{ success: boolean; message: string }>(
      "/api/accounting/posting/payment",
      data
    );
  },

  getInvoicePostingStatus: async (invoiceId: string) => {
    return apiClient.get<{ invoiceId: string; isPosted: boolean }>(
      `/api/accounting/posting/invoice/${invoiceId}/status`
    );
  },

  getExpensePostingStatus: async (expenseId: number) => {
    return apiClient.get<{ expenseId: number; isPosted: boolean }>(
      `/api/accounting/posting/expense/${expenseId}/status`
    );
  },
};

