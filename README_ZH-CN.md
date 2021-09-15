# heyoo

`heyoo`是一个由 typescript 编写的命令行工具，支持以插件(`plugins`)或者包(`packs`)的形式对其本身或者项目的功能进行拓展。

所有的`plugins`与`packs`都必须是 es module ，所以你的 node.js 的版本必须符合 ^12.20.0 || ^14.13.1 || >=16.0.0 。

使用其他语言阅读：[English](./README.md) | 简体中文

## 安装

```shell
pnpm add heyoo -g
# or
npm i heyoo -g
# or
yarn add heyoo -g
```

## 使用

### 命令

#### create

根据选择的预设模板创建新的 [plugins](#插件) 或者 [packs](#包) 项目。

```shell
hey create
# or
# type is one of "plugins" and "packs"
hey create [type]
```

#### link

将本地的`plugins`或`packs`链接到`heyoo`内。

```shell
hey link
# or
# type is one of "plugins" and "packs"
hey link [type]
```

对于`plugins`，插件的链接与安装只能存在一个，执行 link 与 install 命令时会互相覆盖。

对于`packs`，链接的包优先级高于 node_modules 内的包。

#### unlink

解除当前路径下的`plugins`或`packs`的链接。

```shell
hey unlink
```

#### install

安装插件。支持安装发布到 npm registry 、 GitHub 或者 GitLab 上的插件。

```shell
hey install <plugins>

# npm registry example:
hey install @heyoo/plugins-js-template
# GitHub repo example:
hey install hey-yoo/heyoo-template#plugins-js-template
```

可以查阅这份 [文档](https://www.npmjs.com/package/download-git-repo) 了解更多有关如何安装 GitHub 或者 GitLab 插件的信息。

#### uninstall

卸载已安装的插件。

```shell
hey uninstall <plugins>
```

#### list

显示本地的`plugins`与`packs`。

```shell
hey list
```

![](https://raw.githubusercontent.com/HaolinHom/pic-go-bag/heyoo/heyoo-usage-list.png)

#### run

如果在当前路径下存在配置文件 [hey.config](#hey.config) ，并且有指定目标`packs`，则会找到该 packs ，并执行可以运行的函数。

```shell
hey run [script]
```

### 插件

插件是通过在`heyoo`上注册新的命令达到拓展`heyoo`功能的。

其目录下的 package.json 必须有 exports 属性，并且它的值必须是字符串:

```json5
{
  "type": "module",
  "exports": "./bin/index.js"
}
```

exports 属性指定的文件必须导出默认的命令数组(export default [])，以下是它的类型定义:

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

可以阅读这份 [文档](https://github.com/tj/commander.js#readme) 了解更多有关 interface command 属性的内容。

### 包

包是用于为具体项目(存在配置文件 [hey.config](#hey.config) 的项目)提供拓展功能的。

其目录下的 package.json 必须有 exports 属性，并且它的值必须这样一个对象:

```json5
{
  "type": "module",
  "exports": {
    "./foo": "./bin/foo.js",
    "./bar": "./bin/bar.js"
  }
}
```

可以阅读 [Package entry points](https://nodejs.org/api/packages.html#packages_package_entry_points) 了解更多有关 exports 属性的内容。

exports 属性指定的文件必须导出默认的函数(export default function () {})。


### 配置文件

#### hey.config

配置文件支持 js 及 json 格式，如果是 js 格式，则必须导出为 es module 。
且必须有 packs 属性，用于指定`packs`，其值需与该`packs`内 package.json 中的 name 一致。

run 命令会优先检测本地是否已有链接该`packs`，否则从当前路径下的 node_modules 内进行查找。

```javascript
export default {
  packs: '@heyoo/plugins-js-template',
};
```

#### setting

在首次使用时会在`heyoo`下生成设置文件 setting.json：

```json5
{
  // 包管理器(pnpm, npm, yarn)
  "packageManager": "",
  // 模板(可根据需要手动更改)
  "template": {
    // 插件模板
    "plugins": [],
    // 包模板
    "packs": []
  }
}
```

模板的值：

```json5
{
  // 模板名称
  "title": "",
  // 模板类型(目前只支持 git ，未来会支持 npm)
  "type": "git",
  // type为git时，需指定git仓库地址
  "repo": ""
}
```

可以阅读这份 [文档](https://www.npmjs.com/package/download-git-repo) 了解更多有关模板 repo 属性的内容。

目前`heyoo`有预设的一些模板，具体可以查看 [这里](https://github.com/hey-yoo/heyoo-template#readme) 。
