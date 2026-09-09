export function reduceValue(value: number): number {
  const digits = String(value).split('').map((d) => Number(d));
  const sum = digits.reduce((acc, d) => acc + d, 0);
  if (sum < 10) {
    return sum;
  }
  return reduceValue(sum);
}