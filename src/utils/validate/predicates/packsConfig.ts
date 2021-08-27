import owDefault from 'ow';
// @ts-ignore
const ow = owDefault.default;

const packsConfig = ow.object.partialShape({
  name: ow.string.not.empty,
  version: ow.string.not.empty,
  type: ow.string.equals('packs'),
  commands: ow.array.ofType(ow.string),
});

export default packsConfig;
