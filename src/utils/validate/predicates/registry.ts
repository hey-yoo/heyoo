import owDefault from 'ow';
import { RESERVED_WORD } from '../../../constants';
// @ts-ignore
const ow = owDefault.default;

const registry = ow.array.ofType(
  ow.optional.object.exactShape({
    // required
    command: ow.string.not.empty.lowercase.not.oneOf(RESERVED_WORD),
    action: ow.function,
    // optional
    option: ow.optional.array.ofType(ow.array.ofType(ow.string)),
    requiredOption: ow.optional.array.ofType(ow.array.ofType(ow.string)),
    argument: ow.optional.array.ofType(ow.string),
    description: ow.optional.string,
  })
);

export default registry;
