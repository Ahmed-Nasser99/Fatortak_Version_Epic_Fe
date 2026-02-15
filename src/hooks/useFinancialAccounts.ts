import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { financialAccountService } from "../services/financialAccountService";
import {
  CreateFinancialAccountDto,
  UpdateFinancialAccountDto,
  FinancialAccountFilterDto,
  PaginationDto,
} from "../types/api";

export const useFinancialAccounts = (
  pagination: PaginationDto,
  filters?: FinancialAccountFilterDto
) => {
  return useQuery({
    queryKey: ["financialAccounts", pagination, filters],
    queryFn: () => financialAccountService.getAccounts(pagination, filters),
  });
};

export const useFinancialAccount = (id: string) => {
  return useQuery({
    queryKey: ["financialAccount", id],
    queryFn: () => financialAccountService.getAccount(id),
    enabled: !!id,
  });
};

export const useCreateFinancialAccount = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateFinancialAccountDto) =>
      financialAccountService.createAccount(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["financialAccounts"] });
    },
  });
};

export const useUpdateFinancialAccount = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: UpdateFinancialAccountDto;
    }) => financialAccountService.updateAccount(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["financialAccounts"] });
      queryClient.invalidateQueries({ queryKey: ["financialAccount", id] });
    },
  });
};

export const useDeleteFinancialAccount = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => financialAccountService.deleteAccount(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["financialAccounts"] });
    },
  });
};
