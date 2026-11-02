export interface MatterAttachmentDto {
  id: number;
  matterId: number;
  
  name: string;                  
  description: string;
  
  receivedDate: string | null;
  documentDate: string | null;
  expirationDate: string | null;
  
  isLink: boolean;               
  url: string | null;           
  
  originalFileName: string;      
  extension: string;             
  sizeBytes: number;             
  contentType: string;          
  
  isActive: boolean;            
  sharedWithClient: boolean;     
  uploadedByClient: boolean;    
  
  services: string[];            
    isLinkedToHearingSession?: boolean;
}