export interface LookupSubCategoryDto {
  id: number;
  matterCategoryId: number;
  nameEn: string;
  nameAr: string;
  appealPeriod: number;
  cassationPeriod: number;

  // ★ من الـ API
  isActive: boolean;

  // ★ computed للـ template
  active?: boolean;
  activeText?: string;
}