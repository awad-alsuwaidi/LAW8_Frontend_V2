export interface RateSubTableDto {
  id: number;
  name: string;
  code: string;
  amount: number;
  isActive: boolean;
  rateTypeId: number;
  activeText?: string;
}