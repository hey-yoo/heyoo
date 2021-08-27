import owDefault from 'ow';
// @ts-ignore
const ow = owDefault.default;

const projectConfig = ow.object.partialShape({
  type: ow.string.equals('project'),
  packs: ow.string.not.empty,
});

export default projectConfig;
