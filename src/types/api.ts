export interface InvoiceDto {
  id: string;
  invoiceNumber: string;
  customerName: string;
  customerEmail?: string;
  issueDate: string;
  dueDate: string;
  total: number;
  status: string;
  notes?: string;
  vatAmount?: number;
  currency: string;
  invoiceType?: string;
  createdAt?: string;
  updatedAt?: string;
  discount?: number;
  branchId?: string;
}

export interface PagedResponseDto<T> {
  data: T[];
  pageNumber: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
  metaData: any;
}

export interface PaginationDto {
  pageNumber: number;
  pageSize: number;
}

export interface InvoiceCreateDto {
  customerName: string;
  customerEmail?: string;
  invoiceNumber: string;
  issueDate: string;
  dueDate: string;
  total: number;
  status: string;
  notes?: string;
  vatAmount?: number;
  currency: string;
  invoiceType?: string;
  branchId?: string;
  projectId?: string;
}


export interface InvoiceUpdateDto {
  customerName?: string;
  customerEmail?: string;
  invoiceNumber?: string;
  issueDate?: string;
  dueDate?: string;
  status?: string;
  notes?: string;
  total?: number;
  vatAmount?: number;
  currency?: string;
  invoiceType?: string;
  branchId?: string;
}

export interface InvoiceFilterDto {
  search?: string;
  status?: string;
  fromDate?: string;
  toDate?: string;
  minimumPrice?: number;
  maximumPrice?: number;
  customerId?: number;
  invoiceType?: string;
  branchId?: string;
  expensesStatus?: string;
  type?: string;
  startDate?: string;
  endDate?: string;
}

export interface SendInvoiceDto {
  email: string;
  message?: string;
}

export interface MarkPaidDto {
  paymentDate: string;
  paymentMethod: string;
  transactionId?: string;
  notes?: string;
}

export interface UpdateInvoiceStatusDto {
  status: string;
}

// User related DTOs
export interface UserDto {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  phoneNumber?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UserCreateDto {
  email: string;
  firstName: string;
  lastName: string;
  password: string;
  role: string;
  phoneNumber?: string;
}

export interface UserUpdateDto {
  firstName?: string;
  lastName?: string;
  role?: string;
  phoneNumber?: string;
  isActive?: boolean;
}

export interface UserFilterDto {
  email?: string;
  firstName?: string;
  lastName?: string;
  role?: string;
  isActive?: boolean;
}

export interface ChangePasswordDto {
  currentPassword: string;
  newPassword: string;
}

// Customer related DTOs
export interface CustomerDto {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  taxNumber?: string;
  vatNumber?: string;
  paymentTerms?: string;
  notes?: string;
  isActive: boolean;
  isSupplier: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CustomerCreateDto {
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  taxNumber?: string;
  vatNumber?: string;
  paymentTerms?: string;
  isSupplier?: boolean;
  notes?: string;
}

export interface CustomerUpdateDto {
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
  taxNumber?: string;
  vatNumber?: string;
  paymentTerms?: string;
  notes?: string;
  isActive?: boolean;
}

export interface CustomerFilterDto {
  name?: string;
  email?: string;
  phone?: string;
  isActive?: boolean;
  isSupplier?: boolean;
}

// Item related DTOs
export interface ItemDto {
  id: string;
  code: string;
  name: string;
  description?: string;
  type: "product" | "service";
  unitPrice: number;
  purchaseUnitPrice?: number;
  quantity?: number;
  vatRate: number;
  discount?: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  imageUrl: string | null;
  branchId?: string;
}

export interface ItemCreateDto {
  code: string;
  name: string;
  description?: string;
  type: "product" | "service";
  unitPrice: number;
  purchaseUnitPrice?: number;
  quantity?: number;
  vatRate: number;
  discount?: number;
  imageFile?: File | null;
  branchId?: string;
}

export interface ItemUpdateDto {
  code?: string;
  name?: string;
  description?: string;
  type?: "product" | "service";
  unitPrice?: number;
  purchaseUnitPrice?: number;
  quantity?: number;
  vatRate?: number;
  discount?: number;
  isActive?: boolean;
  imageFile?: File | null;
  removeImage?: boolean;
  branchId?: string;
}

export interface ItemFilterDto {
  code?: string;
  name?: string;
  nameOrCode?: string;
  category?: string;
  type?: "product" | "service";
  isActive?: boolean;
  branchId?: string;
}

// Company related DTOs
export interface CompanyDto {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  taxNumber?: string;
  vatNumber?: string;
  currency: string;
  defaultVatRate: number;
  invoicePrefix: string;
  logoUrl?: string;
  saleInvoiceTemplate?: string;
  saleInvoiceTemplateColor?: string;
  purchaseInvoiceTemplate?: string;
  purchaseInvoiceTemplateColor?: string;
  enableMultipleBranches: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CompanyCreateDto {
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  taxNumber?: string;
  vatNumber?: string;
  currency: string;
  defaultVatRate: number;
  invoicePrefix: string;
}

export interface CompanyUpdateDto {
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
  taxNumber?: string;
  vatNumber?: string;
  currency?: string;
  defaultVatRate?: number;
  invoicePrefix?: string;
  enableMultipleBranches?: boolean;
}
export interface CompanyUpdateInvoiceTemplateDto {
  invoiceType?: string;
  template?: string;
  color?: string;
}

export interface UploadCompanyLogoDto {
  companyId: string;
  file: File;
}

// Branch related DTOs
export interface BranchDto {
  id: string;
  name: string;
  address?: string;
  phone?: string;
  isMain: boolean;
  isActive: boolean;
}

export interface CreateBranchDto {
  name: string;
  address?: string;
  phone?: string;
  isMain: boolean;
}

export interface UpdateBranchDto {
  name?: string;
  address?: string;
  phone?: string;
  isMain?: boolean;
  isActive?: boolean;
}

// User Profile related DTOs
export interface UserProfileDto {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  profilePictureUrl?: string;
  role?: string;
  userName?: string;
  lastLoginAt?: string;
  tenantName?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserProfileUpdateDto {
  firstName?: string;
  lastName?: string;
  email?: string;
  phoneNumber?: string;
}

export interface UpdateUserProfileImageDto {
  file: File;
}

// Expenses related DTOs
export interface ExpenseDto {
  id: number;
  date: string;
  total: number;
  notes?: string;
  fileUrl?: string;
  fileName?: string;
  createdAt: Date;
  updatedAt?: Date;
  branchId?: string;
  projectId?: string;
}

export interface CreateExpenseDto {
  date: string;
  total: number;
  notes?: string;
  file?: File;
  branchId?: string;
  projectId?: string;
  category?: string;
}

export interface UpdateExpenseDto {
  date?: string;
  total?: number;
  notes?: string;
  file?: File;
  removeFile?: boolean;
  branchId?: string;
  projectId?: string;
  category?: string;
}

export interface ExpenseFilterDto {
  notes?: string;
  branchId?: string;
}

// Auth related DTOs
export interface AuthResponseDto {
  token: string;
  user: UserDto;
  tenant?: TenantDto;
}

export interface TenantDto {
  id: string;
  name: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Report related DTOs
export interface DashboardReportDto {
  totalRevenue: number;
  totalInvoices: number;
  totalCustomers: number;
  totalItems: number;
  recentInvoices: InvoiceDto[];
  topCustomers: TopCustomerDto[];
  topItems: TopItemDto[];
  revenueChart: RevenueReportDto[];
}

export interface RevenueReportDto {
  period: string;
  revenue: number;
  invoiceCount: number;
}

export interface TopCustomerDto {
  customerId: string;
  customerName: string;
  totalRevenue: number;
  invoiceCount: number;
}

export interface TopItemDto {
  itemId: string;
  itemName: string;
  totalSold: number;
  totalRevenue: number;
}

export interface DateRangeDto {
  startDate: string;
  endDate: string;
}
// Notification related DTOs
export interface NotificationDto {
  id: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: Date;
  readAt?: Date;
  relatedEntityId?: string;
  relatedEntityType?: string;
  notificationType: string;
}

// Project related DTOs
export interface ProjectDto {
  id: string;
  name: string;
  description?: string;
  customerId?: string;
  customerName?: string;
  startDate?: string;
  endDate?: string;
  status: ProjectStatus;
  totalBudget?: number;
  totalIncome: number;
  totalExpenses: number;
  netProfit: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProjectDto {
  name: string;
  description?: string;
  customerId?: string;
  startDate?: string;
  endDate?: string;
  status?: ProjectStatus;
  budget?: number;
}

export interface UpdateProjectDto {
  name?: string;
  description?: string;
  customerId?: string;
  startDate?: string;
  endDate?: string;
  status?: ProjectStatus;
  budget?: number;
}

export enum ProjectStatus {
  NotStarted = "NotStarted",
  Active = "Active",
  Completed = "Completed",
  OnHold = "OnHold",
  Cancelled = "Cancelled",
}

export interface ProjectFilterDto {
  name?: string;
  status?: ProjectStatus;
  clientName?: string;
}


// Accounting Module Types
export enum AccountType {
  Asset = 1,
  Liability = 2,
  Equity = 3,
  Revenue = 4,
  Expense = 5,
}

export enum JournalEntryReferenceType {
  Manual = 1,
  Invoice = 2,
  Expense = 3,
  Payment = 4,
  PurchaseInvoice = 5,
  Reversing = 6,
  Inventory = 7,
  Payroll = 8,
}

export interface AccountDto {
  id: string;
  tenantId: string;
  accountCode: string;
  name: string;
  accountType: AccountType;
  accountTypeName: string;
  parentAccountId?: string;
  parentAccountName?: string;
  level: number;
  isActive: boolean;
  isPostable: boolean;
  description?: string;
  createdAt: string;
  updatedAt?: string;
  childAccounts?: AccountDto[];
  balance?: number;
}

export interface AccountCreateDto {
  accountCode: string;
  name: string;
  accountType: AccountType;
  parentAccountId?: string;
  description?: string;
  isActive?: boolean;
  isPostable?: boolean;
}

export interface AccountUpdateDto {
  name?: string;
  description?: string;
  isActive?: boolean;
}

export interface AccountFilterDto {
  accountCode?: string;
  name?: string;
  accountType?: AccountType;
  parentAccountId?: string;
  isActive?: boolean;
  isPostable?: boolean;
  includeInactive?: boolean;
}

export interface JournalEntryLineDto {
  id: string;
  journalEntryId: string;
  accountId: string;
  accountCode: string;
  accountName: string;
  debit: number;
  credit: number;
  description?: string;
  reference?: string;
}

export interface JournalEntryDto {
  id: string;
  tenantId: string;
  entryNumber: string;
  date: string;
  referenceType: JournalEntryReferenceType;
  referenceTypeName: string;
  referenceId?: string;
  description?: string;
  isPosted: boolean;
  postedAt?: string;
  createdBy?: string;
  postedBy?: string;
  createdAt: string;
  updatedAt?: string;
  reversingEntryId?: string;
  lines: JournalEntryLineDto[];
  totalDebit: number;
  totalCredit: number;
}

export interface JournalEntryLineCreateDto {
  accountId: string;
  debit: number;
  credit: number;
  description?: string;
  reference?: string;
}

export interface JournalEntryCreateDto {
  date: string;
  description?: string;
  lines: JournalEntryLineCreateDto[];
}

export interface JournalEntryFilterDto {
  fromDate?: string;
  toDate?: string;
  referenceType?: JournalEntryReferenceType;
  referenceId?: string;
  isPosted?: boolean;
  accountId?: string;
  entryNumber?: string;
}

export interface AccountBalanceDto {
  accountId: string;
  accountCode: string;
  accountName: string;
  debitTotal: number;
  creditTotal: number;
  balance: number;
  asOfDate?: string;
}

export interface TrialBalanceItemDto {
  accountId: string;
  accountCode: string;
  accountName: string;
  debitTotal: number;
  creditTotal: number;
  balance: number;
}

export interface TrialBalanceDto {
  items: TrialBalanceItemDto[];
  totalDebit: number;
  totalCredit: number;
  isBalanced: boolean;
  asOfDate?: string;
}

export interface LedgerEntryDto {
  journalEntryId: string;
  entryNumber: string;
  date: string;
  description?: string;
  debit: number;
  credit: number;
  runningBalance: number;
  reference?: string;
}

export interface LedgerDto {
  accountId: string;
  accountCode: string;
  accountName: string;
  fromDate?: string;
  toDate?: string;
  entries: LedgerEntryDto[];
  openingBalance: number;
  closingBalance: number;
}

export interface ProfitAndLossItemDto {
  accountId: string;
  accountCode: string;
  accountName: string;
  amount: number;
}

export interface ProfitAndLossDto {
  fromDate: string;
  toDate: string;
  revenueItems: ProfitAndLossItemDto[];
  expenseItems: ProfitAndLossItemDto[];
  totalRevenue: number;
  totalExpenses: number;
  netIncome: number;
}

export interface BalanceSheetItemDto {
  accountId: string;
  accountCode: string;
  accountName: string;
  balance: number;
}

export interface BalanceSheetDto {
  asOfDate: string;
  assets: BalanceSheetItemDto[];
  liabilities: BalanceSheetItemDto[];
  equity: BalanceSheetItemDto[];
  totalAssets: number;
  totalLiabilities: number;
  totalEquity: number;
  isBalanced: boolean;
}

export interface PostPaymentDto {
  invoiceId: string;
  amount: number;
}