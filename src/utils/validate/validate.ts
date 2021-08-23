import owDefault, { BasePredicate } from 'ow';
// @ts-ignore
const ow = owDefault.default;

export default function validate(
  value: unknown,
  owLabel: string,
  predicate: BasePredicate
): null | string {
  let result = null;
  try {
    if (owLabel) {
      ow(value, owLabel, predicate);
    } else {
      ow(value, predicate);
    }
  } catch (error) {
    result = error;
  }
  return result;
}