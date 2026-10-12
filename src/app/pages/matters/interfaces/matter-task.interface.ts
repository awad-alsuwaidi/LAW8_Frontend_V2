export interface MatterTaskDto{
    id: number;
    matterId: number;
    assignee: string;
    assigneeName: null;
    description: string;
    periority: number;
    periorityName: string;
    status: number;
    statusName: string;
    startDate: string;
    dueDate: string;
    filePath: string;
    assigneeList: any[];
    attachmentListPath: string[];
    haveAttachment:boolean
}
