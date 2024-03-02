# 使用指南

## 安装

::: code-group

```sh [npm]
npm install he-tree-react
```

```sh [pnpm]
pnpm add he-tree-react
```

```sh [yarn]
yarn add he-tree-react
```

:::

## 数据类型

此库支持两种结构的数据:

- 扁平数据, 即一个一维数组. 类似与存储在数据库中的数据. 每项需要`id`, 父级 id, `null`代表没有父级. 扁平数据的顺序必须准确, 你需要在初始化数据时使用[`sortFlatData`](./api#sortflatdata)方法给数据排序.
  ```js
  [
    { id: 1, pid: null },
    { id: 2, pid: 1 },
    { id: 3, pid: 2 },
  ];
  ```
- 树形数据. 使用`children`数组包含子节点. 如果未指定`id`, 此库将使用节点在树中的索引作为`id`. 使用树形数据时需设置`dataType: 'tree'`.

```js
[
  {
    id: 1,
    children: [
      {
        id: 2,
        children: [{ id: 3 }],
      },
    ],
  },
];
```

数据中的`id, pid, children`不是固定的. 在设置中, 使用`idKey, parentIdKey, childrenKey`表明你的数据中的对应键名.

## 没有组件

此库没有导出组件,而是导出一个 hook `useHeTree`. 使用它返回的`renderHeTree`渲染树. 这样做的好处是除了`renderHeTree`,
`useHeTree`还会返回一些内部状态和方法, 可以轻松的被使用.

```js
import { useHeTree } from "he-tree-react";

export default function App() {
  const { renderHeTree } = useHeTree({...})
  return <div>
    {renderHeTree()}
  </div>
}
```

## 基础使用-平面数据

<<< @/../src/pages/base_flat_data.tsx
<DemoIframe url="/base_flat_data" />

## 基础使用-树形数据

<<< @/../src/pages/base_tree_data.tsx
<DemoIframe url="/base_tree_data" />
