import ow from '../ow';

const heyConfig = ow.object.partialShape({
  packs: ow.string.not.empty,
});

export default heyConfig;
