import { apiClient } from "./api";
import {
  FinancialAccountDto,
  CreateFinancialAccountDto,
  UpdateFinancialAccountDto,
  FinancialAccountFilterDto,
  PagedResponseDto,
  PaginationDto,
} from "../types/api";

export const financialAccountService = {
  // Get all accounts with pagination and filtering
  getAccounts: async (
    pagination: PaginationDto,
    filters?: FinancialAccountFilterDto
  ) => {
    const params: any = {
      pageNumber: pagination.pageNumber,
      pageSize: pagination.pageSize,
    };

    if (filters) {
      if (filters.name) params.name = filters.name;
      if (filters.type) params.type = filters.type;
    }

    return apiClient.get<PagedResponseDto<FinancialAccountDto>>(
      "/api/financial-accounts",
      params
    );
  },

  // Get account by ID
  getAccount: async (id: string) => {
    return apiClient.get<FinancialAccountDto>(`/api/financial-accounts/${id}`);
  },

  // Create new account
  createAccount: async (data: CreateFinancialAccountDto) => {
    return apiClient.post<FinancialAccountDto>("/api/financial-accounts", data);
  },

  // Update account
  updateAccount: async (id: string, data: UpdateFinancialAccountDto) => {
    return apiClient.put<FinancialAccountDto>(`/api/financial-accounts/${id}`, data);
  },

  // Delete account
  deleteAccount: async (id: string) => {
    return apiClient.delete<boolean>(`/api/financial-accounts/${id}`);
  },
};
