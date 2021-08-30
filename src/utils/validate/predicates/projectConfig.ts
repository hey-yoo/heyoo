import ow from '../ow';

const projectConfig = ow.object.partialShape({
  type: ow.string.equals('project'),
  packs: ow.string.not.empty,
});

export default projectConfig;
