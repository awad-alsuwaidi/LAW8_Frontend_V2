export interface Region {
  id: number;
  code: string;
  nameEn: string;
  nameAr: string;
  isActive: boolean;
}

export interface Country {
  id: number;
  code: string;
  nameEn: string;
  nameAr: string;
  regionId: number;
  taxRate: number;
  isActive: boolean;
}
