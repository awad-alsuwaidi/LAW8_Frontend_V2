export interface LookupTaskGroupsDto {
  id: number;
  nameEn: string;
  nameAr: string;
  isActive: boolean;
  departmentId: number;
  departmentName?: string;
  taskCount: number;
  createdBy: string;
  createdDate: string;
}

export interface TaskGroupTaskDto {
  id: number;
  taskDescription: string;
}

export interface TaskGroupDetailsDto extends LookupTaskGroupsDto {
  taskIds: TaskGroupTaskDto[];
}

export interface TaskGroupSaveDto {
  nameEn: string;
  nameAr: string;
  isActive: boolean;
  departmentId: number;
  taskIds: number[];
}