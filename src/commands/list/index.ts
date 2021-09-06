import { text } from 'std-terminal-logger';
import { getApplication } from '../../utils/application';

export default async function list() {
  const cfg = {
    plugins: ['installed', 'linked'],
    packs: ['linked'],
  };
  const appJson = getApplication();

  Object.keys(cfg).forEach((type) => {
    console.log(text.lime(`${type}:`));
    cfg[type].forEach((method) => {
      appJson[type][method].forEach((item) => {
        console.log(
          `${text.white(' [')}${text.blueGray(method)}${text.white(']')}`,
          text.blue(item.name),
          text.white(item.version)
        );
      });
    });
  });
}
