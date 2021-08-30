import ow from '../ow';
import registry from './registry';

const pluginsConfig = ow.object.partialShape({
  type: ow.string.equals('plugins'),
  registry,
});

export default pluginsConfig;
