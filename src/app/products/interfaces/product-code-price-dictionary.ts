export type ProductCode = string;

export interface ProductCodePriceDictionary {
  productInputsHash: string;
  prices: Record<ProductCode, number>;
}
