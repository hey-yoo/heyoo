import ow from '../ow';

const packsPackage = ow.object.partialShape({
  name: ow.string.nonEmpty,
  version: ow.string.nonEmpty,
  type: ow.string.equals('module'),
  exports: ow.object.is((obj: { [key: string]: string }) => {
    const keyTest = Object.keys(obj).every(item => /^\.\/.*(?<!\.js)$/.test(item));
    if (!keyTest) {
      return `exports keys must like this: "./dir" or "./dir/dir"`;
    }
    const valueTest = Object.values(obj).every(item => /^\.\/.+\.js$/.test(item));
    if (!valueTest) {
      return `exports values must start with "./" and end with ".js"`;
    }
    return true;
  }),
});

export default packsPackage;
