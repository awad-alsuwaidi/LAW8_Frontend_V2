// ===================== Lookup =====================
export interface LookupItem {
  id: number;
  name: string;
  code?: string;
  isBillable?: boolean;
  amount?: number;
  [key: string]: any;
}

// ===================== Timesheet list row (list page) =====================
export interface TimesheetListItemDto {
  id: number;
  matterId: number;
  matterCode: string;
  clientName: string;

  userId: string | number;
  userName: string;
  userInitial: string;

  taskCodeId: number;
  taskCodeName: string;

  date: string;
  hours: number;
  description: string;
  notes?: string;

  hold: number;
  holdName: string;

  statusCode: string;
  statusName: string;

  rateId?: number | null;
  rateAmount?: number | null;
  amount?: number;
  effectiveBillable?: number | null;
  isBillable: boolean;

  canEdit: boolean;
  invoiceNo?: string | null;

  serial?: number;
}

// ===================== Timesheet editor row =====================
export interface TimesheetRowDto {
  id?: number | null;
  matterId: number | null;
  matterCode?: string;
  clientName?: string;
  userId: string | number | null;
  userName?: string;
  userInitial?: string;
  taskCodeId: number | null;
  taskCodeName?: string;
  date: string;
  hours: number;
  description: string;
  notes?: string;
  hold: number;
  holdName?: string;
  rateId?: number | null;
  rateAmount?: number | null;
  amount?: number;
  effectiveBillable?: number | null;
  isBillable?: boolean;
  statusCode?: string;
  statusName?: string;
  canEdit?: boolean;
}

// ===================== Summary =====================
export interface TimesheetSummary {
  billableHours: number;
  nonBillableHours: number;
  noChargeHours: number;
  totalHours: number;
}

// ===================== Rate suggestion =====================
export interface RateSuggestionResponse {
  rate?: number | null;
  rateAmount?: number | null;
  rateId?: number | null;
  taskCodeId?: number | null;
  taskCodeName?: string;
  clientName?: string;
  matterCode?: string;
  amount?: number | null;
  isBillable?: boolean;
  availableRates?: LookupItem[];
}

// ===================== Batch payload =====================
export interface BatchRowPayload {
  id?: number | null;
  matterId: number;
  userId: string | number;
  taskCodeId: number;
  clientName: string;
  date: string;
  hours: number;
  description: string;
  notes?: string;
  hold: number;
  rateId?: number | null;
}

export interface BatchPayload {
  items: BatchRowPayload[];
  submit: boolean;
}

export type TimesheetDto = TimesheetListItemDto;
