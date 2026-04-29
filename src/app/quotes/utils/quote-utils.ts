import { QuoteItemSelection } from '../interfaces/quote-item-selection.interface';

export function evaluateProductCode(
  productCodeFormula: string,
  selections: QuoteItemSelection[],
): string {
  if (productCodeFormula[0] !== '=') {
    return productCodeFormula;
  }

  const whitespace: RegExp = /\s/g;

  // Map selections to a Record<string, string> with normalized field names
  const values: Record<string, string> = Object.fromEntries(
    selections.map((selection) => {
      const normalizedName = selection.name.replace(whitespace, '');
      return [normalizedName, selection.value];
    }),
  );

  // remove = sign, then replace placeholders in the product code formula with selected values
  return productCodeFormula.substring(1).replace(/{{\s*(\w+)\s*}}/g, (match, selectionName) => {
    const normalizedName = selectionName.replace(whitespace, '');
    return values[normalizedName] ?? '';
  });
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
