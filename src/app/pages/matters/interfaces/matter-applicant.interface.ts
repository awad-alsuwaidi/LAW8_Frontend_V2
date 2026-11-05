export interface MatterApplicantDto {
  id?: number;
  matterId?: number; 
  firstName: string;
  middleName?: string | null; 
  lastName: string;
  fullName?: string; 
  position?: string | null;
  address?: string | null;
  email?: string | null;
  phone1?: string | null;
  mobile1?: string | null; 
  fax?: string | null;
  remarks?: string | null;
}