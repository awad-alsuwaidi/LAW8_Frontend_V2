export interface PredefinedTaskDto {
  id: number;
  nameEn: string;
  nameAr: string;
  isActive: boolean;
  priorityId: number;
  priorityName?: string;
  durationType: number;        
  duration: number;
  assigneeCount?: number;
  assignees?: Assignee[];
  attachmentCount?: number;
  attachments?: Attachment[];
}

export interface Assignee {
  id: number;
  name: string;
  initial?: string;
}

export interface Attachment {
  id: number;
  taskId: number;
  filePath: string;
  fileName: string | null;
}

export interface PredefinedTaskSaveDto {
  nameEn: string;
  nameAr: string;
  isActive: boolean;
  priorityId: number;
  durationType: number;
  duration: number;
  assigneeIds: number[];
  attachments?: File[];
  attachmentIdsToDelete?: number[];
}