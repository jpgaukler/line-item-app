import { QuoteItemInput } from '../interfaces/quote-item-input.interface';

const PLACEHOLDERS_REGEX: RegExp = /\[\s*(\w+)\s*\]/g;
const WHITESPACE_REGEX: RegExp = /\s/g;

/**
 * Calculate the product code for a line item based on the current inputs when editing a quote.
 * @param productCodeFormula The product code formula for the given product.
 * @param inputs The quote item inputs that are currently selected on the line item.
 * @returns The calculated product code for the given product with the current inputs.
 */
export function evaluateProductCodeFormula(
  productCodeFormula: string,
  inputs: QuoteItemInput[],
): string {
  if (productCodeFormula[0] !== '=') {
    return productCodeFormula;
  }

  // map inputs to a Record<string, string> with normalized field names
  const values: Record<string, string> = Object.fromEntries(
    inputs.map((input) => {
      const normalizedName = input.name.replace(WHITESPACE_REGEX, '');
      return [normalizedName, input.value];
    }),
  );

  // replace placeholders in the product code formula with selected values
  let result: string = productCodeFormula
    .substring(1) // remove "=" character
    .replace(PLACEHOLDERS_REGEX, (match, inputName) => {
      const normalizedName = inputName.replace(WHITESPACE_REGEX, '');
      return values[normalizedName] ?? '';
    });

  // append -X if there are any custom inputs
  if (inputs.some((i) => i.isCustomValue)) {
    result = result + '-X';
  }

  return result;
}

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

  while ((match = PLACEHOLDERS_REGEX.exec(formula)) !== null) {
    const field = match[1].replace(WHITESPACE_REGEX, '');

    if (!normalizedNames.includes(field)) {
      invalidFields.push(field);
    }
  }

  return invalidFields; // Empty array means valid
}
