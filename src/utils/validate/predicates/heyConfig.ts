import ow from '../ow';

const heyConfig = ow.object.partialShape({
  packs: ow.string.not.empty,
  register: ow.array.ofType(
    ow.string.not.empty
  ),
});

export default heyConfig;
