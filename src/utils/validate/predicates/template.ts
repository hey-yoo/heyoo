import ow from '../ow';

const template = ow.object.partialShape({
  title: ow.string.nonEmpty,
  type: ow.string.equals('git'),
  repo: ow.string.nonEmpty,
  description: ow.optional.string,
});

export default template;
