import ow from '../ow';

const packsConfig = ow.object.partialShape({
  type: ow.string.equals('packs'),
  commands: ow.array.ofType(ow.string),
});

export default packsConfig;
