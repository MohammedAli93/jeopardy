export function humanizeNumber(
  num: number,
  separator: "," | "." = ","
): string {
  let numStr = num.toString();

  const [integerPart, decimalPart] = numStr.split(".");

  const formattedInteger = integerPart.replace(
    /\B(?=(\d{3})+(?!\d))/g,
    separator
  );

  return decimalPart ? `${formattedInteger}.${decimalPart}` : formattedInteger;
}
