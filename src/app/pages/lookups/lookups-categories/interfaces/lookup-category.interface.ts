export interface LookupCategoryDto {
  id: number;
  nameEn: string;
  nameAr: string;

  // ★ من الباك
  isActive: boolean;
  practiceAreaId: number;
  practiceAreaName: string;
  hasClasses: boolean;

  // ★ للـ template (computed)
  active?: boolean;
  practiceArea?: string;
  practsArea?: string;
  practsAreaId?: number;
}