import ow from '../ow';

const heyConfig = ow.array.ofType(
  ow.object.partialShape({
    packs: ow.string.not.empty,
    register: ow.object.partialShape({
      script: ow.string.not.empty,
      subprocess: ow.optional.boolean,
      watch: ow.optional.string,
    }),
  })
);

export default heyConfig;
