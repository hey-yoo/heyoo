import ow from '../ow';

const packageJson = ow.object.partialShape({
  name: ow.string.nonEmpty,
  version: ow.string.nonEmpty,
  type: ow.string.equals('module'),
  exports: ow.string.endsWith('.js'),
});

export default packageJson;
