// Common types used across the application

export interface ApiResponse<T = unknown> {
  success: boolean;
  result?: T;
  message?: string;
  error?: string;
}

export interface Pagination {
  current: number;
  pageSize: number;
  total: number;
}

export interface ListResult<T = unknown> {
  items: T[];
  pagination: Pagination;
}

export interface User {
  _id: string;
  email: string;
  name?: string;
  surname?: string;
  photo?: string;
  token?: string;
  role?: string;
  enabled?: boolean;
  [key: string]: unknown;
}

export interface AuthState {
  current: User | {};
  isLoggedIn: boolean;
  isLoading: boolean;
  isSuccess: boolean;
}

export interface RequestOptions {
  page?: number;
  items?: number;
  q?: string;
  fields?: string;
  filter?: string;
  equal?: string;
  currency?: string;
  question?: string;
  [key: string]: string | number | undefined;
}

export interface CrudState<T = unknown> {
  list: ListResult<T>;
  currentItem: T | null;
  currentAction: {
    actionType: 'create' | 'update' | 'delete' | null;
    data: T | null;
  };
  isLoading: boolean;
  isSuccess: boolean;
  error: string | null;
}

export interface FormField {
  name: string;
  label: string;
  type: string;
  required?: boolean;
  disableForUpdate?: boolean;
  disableForForm?: boolean;
  disableForTable?: boolean;
  hasFeedback?: boolean;
  feedback?: string;
  options?: Array<{ value: string | number; label: string; color?: string }>;
  [key: string]: unknown;
}

export interface TableColumn {
  title: string;
  dataIndex?: string | string[];
  key?: string;
  render?: (value: unknown, record: Record<string, unknown>) => React.ReactNode;
  onCell?: (record?: Record<string, unknown>, rowIndex?: number) => Record<string, unknown> | undefined;
  isDate?: boolean;
  fixed?: 'left' | 'right' | boolean;
  [key: string]: unknown;
}

export interface RouteConfig {
  path: string;
  element: React.ReactElement;
  children?: RouteConfig[];
}

export type ReactNode = React.ReactNode;

// Module Config Interfaces
export interface ModuleConfig {
  entity: string;
  PANEL_TITLE?: string;
  DATATABLE_TITLE?: string;
  ADD_NEW_ENTITY?: string;
  ENTITY_NAME?: string;
  deleteModalLabels?: string[];
  deleteMessage?: string;
  modalTitle?: string;
  dataTableColumns?: TableColumn[];
  fields?: Record<string, FormField>;
  searchConfig?: SearchConfig;
  disableAdd?: boolean;
  [key: string]: unknown;
}

export interface SearchConfig {
  displayLabels: string[];
  searchFields: string;
  outputValue?: string;
  entity?: string;
}

// ERP/Invoice/Quote Item Interfaces
export interface InvoiceItem {
  _id?: string;
  itemName: string;
  description?: string;
  quantity: number;
  price: number;
  total: number;
  offerPrice?: number;
}

export interface Client {
  _id?: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  [key: string]: unknown;
}

export interface ErpDocument {
  _id?: string;
  number?: number;
  year?: number;
  status?: string;
  paymentStatus?: string;
  client: Client;
  items?: InvoiceItem[];
  subTotal: number;
  taxTotal: number;
  taxRate: number;
  total: number;
  credit: number;
  currency?: string;
  date?: string;
  expiredDate?: string;
  created?: string;
  updated?: string;
  [key: string]: unknown;
}

// Dashboard Interfaces
export interface DashboardStats {
  total?: number;
  total_undue?: number;
  performance?: Array<{
    status: string;
    percentage: number;
  }>;
}

export interface SummaryData {
  active?: number;
  new?: number;
  total?: number;
  total_undue?: number;
  performance?: Array<{
    status: string;
    percentage: number;
  }>;
}

// Form Interfaces
export interface FormProps {
  isUpdateForm?: boolean;
  subTotal?: number;
  offerTotal?: number;
  current?: ErpDocument | Record<string, unknown>;
  [key: string]: unknown;
}

// Auth Module Interfaces
export interface AuthModuleProps {
  authContent: React.ReactNode;
  AUTH_TITLE: string;
  isForRegistre?: boolean;
}

// Network Interface
export interface NetworkConnection {
  effectiveType?: string;
  downlink?: number;
  downlinkMax?: number;
  rtt?: number;
  saveData?: boolean;
  type?: string;
}

// Responsive Config
export interface ResponsiveConfig {
  xs?: number;
  sm?: number;
  md?: number;
  lg?: number;
  xl?: number;
  xxl?: number;
}

// Statistics Interfaces
export interface StatisticItem {
  tag: string;
  value: number;
  color?: string;
}

export interface PreviewCardProps {
  title?: string;
  statistics?: StatisticItem[];
  isLoading?: boolean;
  entity?: string;
}

export interface SummaryCardProps {
  title: string;
  tagColor?: string;
  data?: number | string;
  prefix?: string;
  isLoading?: boolean;
}

export interface RecentTableProps {
  entity: string;
  dataTableColumns: TableColumn[];
}

// Navigator with Connection API
export interface NavigatorWithConnection extends Navigator {
  connection?: NetworkConnection;
  mozConnection?: NetworkConnection;
  webkitConnection?: NetworkConnection;
}

// Menu Item Types
export interface MenuItemType {
  label?: React.ReactNode;
  key?: string;
  icon?: React.ReactNode;
  type?: 'divider';
  disabled?: boolean;
  onClick?: () => void;
}

// Form Field for ItemRow
export interface ItemRowField {
  name: string;
  fieldKey?: string;
  [key: string]: unknown;
}

// ErpPanelModule Interfaces
export interface ErpPanelConfig extends ModuleConfig {
  disableAdd?: boolean;
}

export interface CreateItemProps {
  config: ErpPanelConfig;
  CreateForm: React.ComponentType<FormProps>;
}

export interface UpdateItemProps {
  config: ErpPanelConfig;
  UpdateForm: React.ComponentType<FormProps>;
}

export interface DeleteItemProps {
  config: ErpPanelConfig;
  isOpen?: boolean;
}

export interface ReadItemProps {
  config: ErpPanelConfig;
  selectedItem?: ErpDocument;
}

export interface ItemRowProps {
  field: ItemRowField;
  remove: (name: string) => void;
  current?: ErpDocument | Record<string, unknown> | null;
}

export interface SearchItemProps {
  config: ErpPanelConfig;
}

export interface DataTableProps {
  config: ErpPanelConfig;
  extra?: MenuItemType[];
}

