import owDefault from 'ow';
import registry from './registry';
// @ts-ignore
const ow = owDefault.default;

const pluginsConfig = ow.object.partialShape({
  name: ow.string.not.empty,
  version: ow.string.not.empty,
  registry,
});

export default pluginsConfig;
