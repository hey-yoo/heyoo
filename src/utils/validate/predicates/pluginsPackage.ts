import ow from '../ow';

const pluginsPackage = ow.object.partialShape({
  name: ow.string.nonEmpty,
  version: ow.string.nonEmpty,
  type: ow.string.equals('module'),
  exports: ow.string.startsWith('./').endsWith('.js'),
});

export default pluginsPackage;
