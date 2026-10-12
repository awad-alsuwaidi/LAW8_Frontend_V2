export interface MatterAttachmentDto{
    id: number;
    law_MatterId: number;
    description: string;
    receivedDate: string;
    documentDate: string;
    expirationDate: string;
    fileName: string;
    filePathe: string;
    attachment:Blob;
   attachmentPath?: string | null;
   attachmentName?: string | null;
   isLinkedToHearingSession:boolean;
}
