import { QuoteItemSelection } from '../interfaces/quote-item-selection.interface';

const PLACEHOLDERS_REGEX: RegExp = /{{\s*(\w+)\s*}}/g;
const WHITESPACE_REGEX: RegExp = /\s/g;

/**
 * Calculate the product code for a line item based on the current selections when editing a quote.
 * @param productCodeFormula The product code formula for the given product.
 * @param selections The quote item selections that are currently selected on the line item.
 * @returns The calculated product code for the given product with the current selections.
 */
export function evaluateProductCodeFormula(
  productCodeFormula: string,
  selections: QuoteItemSelection[],
): string {
  if (productCodeFormula[0] !== '=') {
    return productCodeFormula;
  }

  // Map selections to a Record<string, string> with normalized field names
  const values: Record<string, string> = Object.fromEntries(
    selections.map((selection) => {
      const normalizedName = selection.name.replace(WHITESPACE_REGEX, '');
      return [normalizedName, selection.value];
    }),
  );

  // remove "=", then replace placeholders in the product code formula with selected values
  const result: string = productCodeFormula
    .substring(1)
    .replace(PLACEHOLDERS_REGEX, (match, selectionName) => {
      const normalizedName = selectionName.replace(WHITESPACE_REGEX, '');
      return values[normalizedName] ?? '';
    });

  return result;
}

/**
 * Validate that a user defined product code formula is using valid selection names within placeholder sections.
 * @param formula The product code formula entered by the user.
 * @param selectionNames The names of all selections on the product.
 * @returns The names of any invalid fields, or an empty array if formula is valid.
 */
export function validateProductCodeFormula(formula: string, selectionNames: string[]): string[] {
  const invalidFields: string[] = [];

  if (formula[0] !== '=') {
    return invalidFields;
  }

  const normalizedNames: string[] = selectionNames
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

// type StringFunctions = {
//   [key: string]: (val: string, ...args: string[]) => string;
// };

// const stringFunctions: StringFunctions = {
//   trim: (val: string) => val.trim(),
//   upper: (val: string) => val.toUpperCase(),
//   lower: (val: string) => val.toLowerCase(),
//   first: (val: string, count: string) => val.substring(0, Number(count)),
//   last: (val: string, count: string) => val.substring(val.length - Number(count)),
// };

// export function evaluateProductCodeFormula(
//   productCodeFormula: string, // The template string, e.g., "FS-{{Length}}-{{Size.first:2}}"
//   values: Record<string, string>, // Map of field names to selected values
// ): string {
//   return productCodeFormula.replace(
//     /{{\s*(\w+)(?:\.(\w+)(?::([^}]+))?)?\s*}}/g, // global flag (g) will call the callback once for each match found in the string.
//     (match, field, func, params) => {
//       // Example: {{Length.first:2}})
//       // match = The entire matched string (e.g., {{Length.first:2}})
//       // field = capture group 1 (\w+) — captures Length
//       // func = optional capture group 2 (\w+) — captures first
//       // params = optional capture group 3 ([^}]+) — captures 2

//       let value = values[field] ?? ''; // Get value from map, default to empty string

//       // If function is specified and exists
//       if (func && stringFunctions[func]) {
//         const args = (params ?? '').split(':'); // Split params by colon (e.g., "2" → ["2"])
//         value = stringFunctions[func](value, ...args); // Call function with value + args
//       }

//       return value;
//     },
//   );
// }
