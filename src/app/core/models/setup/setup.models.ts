export interface PaginatedResult<T> {
  items: T[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

export interface RegionDto {
  id: number;
  code: string;
  nameEn: string;
  nameAr?: string;
  isActive: boolean;
}

export interface SaveRegionDto {
  code: string;
  nameEn: string;
  nameAr?: string;
  isActive: boolean;
}

export interface CurrencyDto {
  id: number;
  code: string;
  nameEn: string;
  nameAr?: string;
  symbol: string;
  decimalPlaces: number;
  isDefault: boolean;
  isActive: boolean;
}

export interface SaveCurrencyDto {
  code: string;
  nameEn: string;
  nameAr?: string;
  symbol: string;
  decimalPlaces: number;
  isDefault: boolean;
  isActive: boolean;
}

export interface CountryDto {
  id: number;
  code: string;
  nameEn: string;
  nameAr?: string;
  regionId: number;
  regionName?: string;
  isActive: boolean;
  taxRate?: number;
}

export interface SaveCountryDto {
  code: string;
  nameEn: string;
  nameAr?: string;
  regionId: number;
  isActive: boolean;
  taxRate?: number;
}

export interface FeatureDto {
  id: number;
  productId: number;
  productName?: string;
  nameEn: string;
  nameAr?: string;
  description?: string;
  priceAddOn: number;
  isActive: boolean;
}

export interface SaveFeatureDto {
  productId: number;
  nameEn: string;
  nameAr?: string;
  description?: string;
  priceAddOn: number;
  isActive: boolean;
}

export interface OrgTypeDto {
  id: number;
  code: string;
  nameEn: string;
  nameAr?: string;
  description?: string;
  isActive: boolean;
}

export interface SaveOrgTypeDto {
  code: string;
  nameEn: string;
  nameAr?: string;
  description?: string;
  isActive: boolean;
}

export interface ProductDto {
  id: number;
  code: string;
  nameEn: string;
  nameAr?: string;
  description?: string;
  isProvisionable: boolean;
  provisioningKey?: string;
  isActive: boolean;
}

export interface SaveProductDto {
  code: string;
  nameEn: string;
  nameAr?: string;
  description?: string;
  isProvisionable: boolean;
  provisioningKey?: string;
  isActive: boolean;
}

/** Fixed display precedence for the core products; anything else follows alphabetically by code. */
const PRODUCT_ORDER = ['LAW8', 'DOC8'];

export function sortProducts<T extends { code: string }>(items: T[]): T[] {
  const rank = (p: T) => {
    const i = PRODUCT_ORDER.findIndex((c) => p.code.toUpperCase().startsWith(c));
    return i === -1 ? PRODUCT_ORDER.length : i;
  };
  return [...items].sort((a, b) => rank(a) - rank(b) || a.code.localeCompare(b.code));
}

/** Dropdown order for currencies: platform default first, then USD, then the rest by code. */
export function sortCurrencies<T extends { code: string; isDefault: boolean }>(items: T[]): T[] {
  const rank = (c: T) => (c.isDefault ? 0 : c.code.toUpperCase() === 'USD' ? 1 : 2);
  return [...items].sort((a, b) => rank(a) - rank(b) || a.code.localeCompare(b.code));
}
