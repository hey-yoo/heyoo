import owDefault from 'ow';
// @ts-ignore
const ow = owDefault.default;

const projectConfig = ow.object.partialShape({
  packs: ow.string.not.empty,
});

export default projectConfig;
