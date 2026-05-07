import fnv1a from '@sindresorhus/fnv1a';
import { ProductInputOption } from '../interfaces/product-input-option.interface';
import { ProductInput } from '../interfaces/product-input.interface';
import { Product } from '../interfaces/product.interface';

const INPUT_NAME_REGEX: RegExp = /\[\s*(\w+)\s*\]/g;
const WHITESPACE_REGEX: RegExp = /\s/g;

/**
 * Validate that a user defined product code formula is using valid input names within placeholder sections.
 * @param formula The product code formula entered by the user.
 * @param inputNames The names of all inputs on the product.
 * @returns The names of any invalid fields, or an empty array if formula is valid.
 */
export function validateProductCodeFormula(formula: string, inputNames: string[]): string[] {
  const invalidFields: string[] = [];

  if (formula[0] !== '=') {
    return invalidFields;
  }

  const normalizedNames: string[] = inputNames
    .map((name) => name.replace(WHITESPACE_REGEX, ''))
    .filter((i) => i !== '');

  let match: RegExpExecArray | null;

  while ((match = INPUT_NAME_REGEX.exec(formula)) !== null) {
    const field = match[1].replace(WHITESPACE_REGEX, '');

    if (!normalizedNames.includes(field)) {
      invalidFields.push(field);
    }
  }

  return invalidFields; // Empty array means valid
}

/**
 * Calculate the product code for a given product code formula and set of product inputs.
 * @param productCodeFormula
 * @param inputs
 * @returns The product code for the given set of inputs.
 */
export function calculateProductCode(product: Product, inputs: Record<string, string>): string {
  if (product.productCodeFormula[0] !== '=') {
    return product.productCodeFormula;
  }

  // remove whitespace to normalize input names
  const normalizedInputs: Record<string, string> = Object.fromEntries(
    Object.entries(inputs).map(([name, value]) => [name.replace(WHITESPACE_REGEX, ''), value]),
  );

  // replace placeholders in the product code formula with selected values
  let result: string = product.productCodeFormula
    .substring(1) // remove "=" character
    .replace(WHITESPACE_REGEX, '') // remove any whitespace
    .replace(INPUT_NAME_REGEX, (match, inputName) => normalizedInputs[inputName] ?? '?'); // replace input names with values

  // append -X if there are any custom inputs
  const hasCustomOptionValue = product.inputs.some((input) => {
    const optionValue = inputs[input.name];
    const matchingOption = input.options.find((opt) => opt.value === optionValue);
    return !matchingOption; // If no match found, it's custom
  });

  if (hasCustomOptionValue) {
    result += '-X';
  }

  return result;
}

/**
 * Generate all possible product codes for a Product, based on it's product code formula and inputs definition.
 * @param product
 * @returns Array of all possible product codes.
 */
export function generateProductCodes(product: Product): string[] {
  const inputs: ProductInput[] = product.inputs;
  const productCodes: string[] = [];
  const currentInputs: Record<ProductInput['name'], ProductInputOption['value']> = {};

  function buildVariation(index: number) {
    // base case: full permutation built, add to results array
    if (index === inputs.length) {
      productCodes.push(calculateProductCode(product, currentInputs));
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
