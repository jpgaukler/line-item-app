import fnv1a from '@sindresorhus/fnv1a';
import { ProductInputOption } from '../interfaces/product-input-option.interface';
import { ProductInput } from '../interfaces/product-input.interface';
import { Product } from '../interfaces/product.interface';

export function generateProductCodes(product: Product): string[] {
  const inputs: ProductInput[] = product.inputs;
  const productCodes: string[] = [];
  const currentInputs: Record<ProductInput['name'], ProductInputOption['value']> = {};

  function buildVariation(index: number) {
    // base case: full permutation built, add to results array
    if (index === inputs.length) {
      productCodes.push(calculateProductCode(product.productCodeFormula, currentInputs));
      return;
    }

    const input: ProductInput = inputs[index];

    for (const option of input.options) {
      currentInputs[input.name] = option.value;
      buildVariation(index + 1);
    }
  }

  buildVariation(0);

  return productCodes;
}

export function calculateProductCode(
  productCodeFormula: string,
  inputs: Record<string, string>,
): string {
  if (productCodeFormula[0] !== '=') {
    return productCodeFormula;
  }

  const inputNames: RegExp = /\[\s*(\w+)\s*\]/g;
  const whitespace: RegExp = /\s/g;

  // remove whitespace to normalize input names
  const values: Record<string, string> = Object.fromEntries(
    Object.entries(inputs).map(([name, value]) => [name.replace(whitespace, ''), value]),
  );

  // replace placeholders in the product code formula with selected values
  return productCodeFormula
    .substring(1) // remove "=" character
    .replace(whitespace, '') // remove any whitespace
    .replace(inputNames, (match, inputName) => values[inputName] ?? '?'); // replace input names with values
}

/**
 * Generate a hash of the inputs that determine product codes (this includes the product code formula
 * and the possible input values). This hash can be used to determine if the price dictionary is out of date,
 * if product inputs have changed since last generating the pricing dictionary.
 * @param product
 * @returns A unique hash of product inputs as a bigint
 */
export function buildProductCodeHash(product: Product): string {
  // Helper to ensure consistent formatting for every string fragment
  const normalize = (val: string | undefined | null) => (val ?? '').trim().toLowerCase();

  const formula = normalize(product.productCodeFormula);
  const inputs = product.inputs
    .map((i) => {
      const normalizedName = normalize(i.name);
      const normalizedOptions = i.options
        .map((o) => normalize(o.value))
        .sort() // Ensure option values are deterministic
        .join(',');

      return `${normalizedName}:${normalizedOptions}`;
    })
    .sort() // Ensure input order doesn't change the hash
    .join('|');

  const fingerprint = `${formula}|${inputs}`;

  return fnv1a(fingerprint, { size: 64 }).toString();
}
