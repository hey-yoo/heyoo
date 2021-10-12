import ow from './ow';
import { BasePredicate } from 'ow';

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
    // @ts-ignore
    result = error;
  }
  return result;
}
