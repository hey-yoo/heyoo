# heyoo

`heyoo` is a command-line tool written in typescript, which supports the expansion of its own or project functions 
in the form of `plugins` or `packs`.

All `plugins` and `packs` must be es module, so your node.js version must conform to ^12.20.0 || ^14.13.1 || >=16.0.0.

Read this in other languages: English | [简体中文](./README_ZH-CN.md)

## Installation

```shell
pnpm add heyoo -g
# or
npm i heyoo -g
# or
yarn add heyoo -g
```

## Usage

### Commands

#### create

Create a new [plugins](#Plugins) or [packs](#Packs) project based on the selected preset template.

```shell
hey create
# or
# type is one of "plugins" and "packs"
hey create [type]
```

#### link

Link local `plugins` or `packs` to `heyoo`.

```shell
hey link
# or
# type is one of "plugins" and "packs"
hey link [type]
```

For `plugins`, there can only be one link and install of the plugins, and they will overwrite each other when
the link and install commands are executed.

For `packs`, the priority of the linked package is higher than the package in node_modules.

#### unlink

Unlink the `plugins` or `packs` under the current path.

```shell
hey unlink
```

#### install

Install the plugins. Supports the installation of plugins published to npm registry, GitHub or GitLab.

```shell
hey install <plugins>

# npm registry example:
hey install @heyoo/plugins-js-template
# GitHub repo example:
hey install hey-yoo/heyoo-template#plugins-js-template
```

You can check this [document](https://www.npmjs.com/package/download-git-repo) to learn more about 
how to install GitHub or GitLab plugins.

#### uninstall

Uninstall the installed plugins.

```shell
hey uninstall <plugins>
```

#### list

Display the local `plugins` and `packs`.

```shell
hey list
```

![](https://raw.githubusercontent.com/HaolinHom/pic-go-bag/heyoo/heyoo-usage-list.png)

#### run

If there is a configuration file [hey.config](#heyconfig) in the current path and there is a specified target `packs`,
when the packs can be found then will execute the script(function).

```shell
hey run [script]
```

#### setting

open the setting file [setting.json](#settingjson).

```shell
hey setting
```

### Plugins

The plugins expand the function of `heyoo` by registering new commands on `heyoo`.

The package.json in its directory must have an exports attribute, and its value must be a string:

```json5
{
  "type": "module",
  "exports": "./bin/index.js"
}
```

The file specified by the exports attribute must export the default command array (export default []). 
The following is its type definition:

```typescript
interface command {
  command: string;
  action: (...args: any[]) => void | Promise<void>;
  option?: string[][];
  requiredOption?: string[][];
  argument?: string[][];
  description?: string;
}

export default [] as command[];
```

You can read this [document](https://github.com/tj/commander.js#readme) to learn more about the interface command attribute.

### Packs

Packs are used to provide extended functions for specific projects(where the configuration file [hey.config](#heyconfig) exists).

The package.json in its directory must have an exports attribute, and its value must be an object like this:

```json5
{
  "type": "module",
  "exports": {
    "./foo": "./bin/foo.js",
    "./bar": "./bin/bar.js"
  }
}
```

You can read [Package entry points](https://nodejs.org/api/packages.html#packages_package_entry_points) to learn more 
about the exports' property.

The file specified by the exports attribute must export the default function (export default function () {}).

### Configuration file

#### hey.config

The configuration file supports js and json formats. If it is in js format, it must be exported as es module.
And there must be a packs attribute, which is used to specify `packs`, 
and its value must be consistent with the value of the name attribute in the package.json in the `packs`.

The run command will first check whether there is a link to the `packs` locally, otherwise it will search from
node_modules under the current path.

```javascript
export default {
  packs: '@heyoo/plugins-js-template',
};
```

#### setting.json

The setting file setting.json will be generated by `heyoo` when used for the first time:

```json5
{
  // packageManager's value is one fo pnpm, npm, yarn
  "packageManager": "",
  "template": {
    "plugins": [],
    "packs": []
  }
}
```

The value of the template:

```json5
{
  // template name
  "title": "",
  // template type (Currently only git is supported, npm will be supported in the future)
  "type": "git",
  // When type is git, you need to specify the git repo
  "repo": ""
}
```

You can read this [document](https://www.npmjs.com/package/download-git-repo) to learn more about template repo attributes.

Currently `heyoo` has some preset templates, which can be viewed [here](https://github.com/hey-yoo/heyoo-template#readme).
