import { label } from 'std-terminal-logger';
import fileUrl from 'file-url';

export default async function exec(scriptPath: string) {
  const scriptModule = await import(fileUrl(scriptPath));
  const scriptFn = scriptModule.default;
  if (typeof scriptFn === 'function') {
    scriptFn();
  } else {
    console.log(label.error, `${scriptPath} doesn't export a function`);
  }
}
