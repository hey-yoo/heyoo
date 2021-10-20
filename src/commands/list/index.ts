import { text } from 'chalk-ex';
import { getApplication } from '../../utils/application';
import { PACKS, PLUGINS } from '../../constants';

export default async function list() {
  const appJson = getApplication();
  [PLUGINS, PACKS].forEach((type) => {
    console.log(text.lime(`${type}:`));
    appJson[type].forEach((item) => {
      console.log(
        ' ',
        text.blue(item.name),
        text.white(item.version),
        `${text.white('(')}${text.blueGray(item.type)}${text.white(')')}`
      );
    });
  });
}
