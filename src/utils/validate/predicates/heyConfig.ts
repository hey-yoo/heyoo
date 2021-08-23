import owDefault from 'ow';
import registry from './registry';
// @ts-ignore
const ow = owDefault.default;

const heyConfig = ow.object.partialShape({
  name: ow.string.not.empty,
  version: ow.string.not.empty,
  registry,
});

export default heyConfig;
