export const spendingCategories = [
  'Makanan',
  'Transportasi',
  'Tagihan',
  'Hiburan',
  'Belanja',
  'Perjalanan',
  'Lainnya',
] as const;

export type SpendingCategory = (typeof spendingCategories)[number];

export interface BaseTransaction {
  id: string;
  description: string;
  amount: number;
  date: string;
}

export interface Income extends BaseTransaction {
  type: 'income';
}

export interface Spending extends BaseTransaction {
  type: 'spending';
  category: SpendingCategory;
}

export type Transaction = Income | Spending;
