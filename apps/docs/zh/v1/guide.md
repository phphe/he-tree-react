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

- 扁平数据, 即一个一维数组. 类似与存储在数据库中的数据. 每项需要`id`, 父级 id, `null`代表没有父级. 扁平数据的顺序必须跟树一样, 你可以在初始化数据时使用[`sortFlatData`](./api#sortflatdata)方法给数据排序.
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

此库没有导出组件,而是导出一个 hook `useHeTree`. 使用它返回的`renderTree`渲染树. 这样做的好处是除了`renderTree`,
`useHeTree`还会返回一些内部状态和方法, 可以轻松的被获取.

```js
import { useHeTree } from "he-tree-react";

export default function App() {
  const { renderTree } = useHeTree({...})
  return <div>
    {renderTree()}
  </div>
}
```

## 选项

`useHeTree`是主要使用的函数, 它的第一个参数是选项对象. 必须的选项有`data`, 必须两者中有一个的是`renderNode, renderNodeBox`. 其他重要选项是:

- `dataType`, 表明数据类型. 可用值:
  - `flat`, 默认. 扁平数据.
  - `tree`, 树形数据.
- `idKey, parentIdKey`, 默认值是`id`和`parent_id`. 使用扁平数据时需要. 虽然有默认值, 但还是建议写明更好.
- `childrenKey`, 默认是`children`. 使用树形数据时需要. 虽然有默认值, 但还是建议写明更好.
- `onChange`, 数据改变时调用的函数, 参数是新数据. 如果你的树不会改变则不需要.
- <a id="isfunctionreactive"/>`isFunctionReactive`, 布尔. 默认`false`. `useHeTree`选项中包含许多回调函数, 如`onChange, canDrop`. `isFunctionReactive`可用来控制是否监听这些回调函数的改变. 如果你的回调函数和`data`是同步改变的, 则不用启用此项. 否则你需要启用此项, 并且用 React 的`useCallback`或`useMemo`缓存你的所有回调函数以避免性能问题.

[查看`useHeTree`的 API 文档以了解更多](api#usehetree).

## 提示

- `stat`, 单个节点的相关信息. 大部分回调函数的参数里有`stat`. [参考`Stat` API](api#stat).
- `node`, 节点的数据. 通过`stat.node`可以获取节点数据.
- `getStat`, 通过此函数可以获取`stat`, 唯一参数可以是`id, node, stat`. 此函数在`useHeTree`的返回对象中: `const {getStat} = useHeTree({...})`.
- 下面的代码例子附带有运行效果. 这些例子可以直接复制使用. 注意其中的高亮行的代码.
- 下面的代码例子使用`tsx`格式, 如果你需要`js`格式, 可以使用任意 ts js 在线转换器.

## 基础使用-扁平数据

<<< @/../dev/src/pages/base_flat_data.tsx
<DemoIframe url="/base_flat_data" />

## 基础使用-树形数据

<<< @/../dev/src/pages/base_tree_data.tsx
<DemoIframe url="/base_tree_data" />

## 自定义拖拽触发元素

给节点任意子元素添加`draggable`属性即可.

<<< @/../dev/src/pages/custom_drag_trigger_flat_data.tsx{14}
<DemoIframe url="/custom_drag_trigger_flat_data" />

## 节点 HTML 结构和样式<a id="node_structure_style"/>

节点 HTML 如下:

```html
<div
  draggable="true"
  data-key="1"
  data-level="1"
  data-node-box="true"
  style="padding-left: 0px;"
>
  <div>Node</div>
</div>
```

上面有两个 div. 使用`renderNode`选项控制内层 div 的渲染. 如: `renderNode: ({node}) => <div>{node.name}</div>`.

外层节点被称为`nodeBox`, 不要修改它的`padding-left, padding-right`. 使用选项[`indent`](api#indent)控制节点的缩进. 如果你想控制`nodeBox`或拖拽占位节点的渲染, 可以使用`renderNodeBox`选项, 这将覆盖`renderNode`. 标准的`renderNodeBox`如下:

```tsx{4-7,9}
renderNodeBox: ({ stat, attrs, isPlaceholder }) => (
  <div {...attrs} key={attrs.key}>
    {isPlaceholder ? (
      <div
        className="he-tree-drag-placeholder"
        style={{ minHeight: "20px", border: "1px dashed blue" }}
      />
    ) : (
      <div>{/* node area */}</div>
    )}
  </div>
);
```

第 4 到第 7 行是拖拽占位节点. 第 9 行是节点元素.

## 自定义拖拽占位节点和 node box

<<< @/../dev/src/pages/customize_placeholder_and_node_box.tsx{13-19,23-39}
<DemoIframe url="/customize_placeholder_and_node_box" />

## 节点的展开与折叠<a id="node_open"/>

- 使用选项`openIds`表明展开的节点.
- 可通过`stat.open`获取该节点的`open`状态.
- `useHeTree`返回的`allIds`包含所有节点的 id.
- 此库导出了方法可以展开单个或多个节点的所有父级. 扁平数据: [`openParentsInFlatData`](api#openparentsinflatdata). 树形数据: [`openParentsInTreeData`](api#openparentsintreedata).

<<< @/../dev/src/pages/open_ids.tsx{1,9-16,22-24,29-32}
<DemoIframe url="/open_ids" />
此例子顶部 4 个按钮分别是: 展开全部, 折叠全部, 展开'Python'节点的所有父节点, 仅展开'Python'节点的所有父节点.

## 节点的勾选<a id="node_checked"/>

- 使用选项`checkedIds`表明勾选的节点.
- 可通过`stat.checked`获取该节点的`checked`状态.
- 此库导出了方法可以获取单个或多个节点`checked`变动后的`checkedIds`. 扁平数据: [`updateCheckedInFlatData`](api#updatecheckedinflatdata). 树形数据: [`updateCheckedInTreeData](api#updatecheckedintreedata).
  - 此方法对节点的`checked`的更新是级联的. 如果你不想级联更新, 使用你自己的逻辑替代.
  - 此方法返回一个长度 2 的数组. 第一项是所有勾选的 id, 第二项是所有半选的 id. 如果不需要半选, 忽略第二项.
  - 半选, 即同时有子节点被勾选或半选, 也有子节点未被勾选.

<<< @/../dev/src/pages/checked_ids.tsx{1,9-15,21-23,28-29}
<DemoIframe url="/checked_ids" />

## 控制是否可拖拽, 可放入

使用以下选项控制:

- [`canDrag`](api#candrag), 节点是否可拖拽.
- [`canDrop`](api#candrop), 节点是否可放入.
- [`canDropToRoot`](api#candroptoroot), 树根是否可放入.

<<< @/../dev/src/pages/draggable_droppable.tsx{16-18}
<DemoIframe url="/draggable_droppable" />

- 根节点不可放入.
- `Technology`及子节点可以拖拽. `Science`及子节点不可以拖拽.
- `Science`及子节点可以放入. `Technology`及子节点不可以放入.

## 拖拽到节点上时打开节点

使用以下选项控制:

- [`dragOpen`](api#dragopen), 是否启用, 默认`false`.
- [`dragOpenDelay`](api#dragopen), 延时, 默认 `600` 毫秒.
- [`onDragOpen`](api#ondragopen), 打开节点时调用的函数.

<<< @/../dev/src/pages/dragopen.tsx
<DemoIframe url="/dragopen" />

## 更新数据

由于 React 的不可变特性, 扁平数据和树形数据更新都很困难. 针对扁平数据, 此库提供了两个方法, 用以增加节点或删除节点. 如果你要进行更复杂的操作, 或者更新树形数据, 推荐你使用[`immer`](https://github.com/mweststrate/immer).
::: code-group

```sh [npm]
npm install immer use-immer
```

```sh [pnpm]
pnpm add immer use-immer
```

```sh [yarn]
yarn add immer use-immer
```

:::

## 使用内置方法更新扁平数据<a id="update_flat_data_with_inner_methods2"/>

[`addToFlatData`](api#addtoflatdata): 增加节点. [`removeByIdInFlatData`](api#removebyidinflatdata): 删除节点.
这两个方法都会改变原数据, 所以把原数据的复制传给它, 或者与`immer`一起使用.

<<< @/../dev/src/pages/update_data.tsx{3,12-22,33-34}
<DemoIframe url="/update_data" />

## 使用 immer 更新扁平数据

注意, 这里使用了`useImmer`替代 React 的`useState`.

<<< @/../dev/src/pages/update_flat_data_with_immer.tsx{3,7,12,13-31,42-44}
<DemoIframe url="/update_flat_data_with_immer" />

## 使用 immer 更新树形数据

注意, 这里使用了`useImmer`替代 React 的`useState`. `findTreeData`方法类似数组的`find`方法.

<<< @/../dev/src/pages/update_tree_data_with_immer.tsx{1,4,10-30,41-43}
<DemoIframe url="/update_tree_data_with_immer" />

## 从外部发起的拖拽

相关选项:

- [`onExternalDragOver`](api#onexternaldragover): 表明是否处理外部拖拽.
- [`onExternalDrop`](api#onexternaldrop): 当外部拖拽放入树中时调用的回调函数.

<<< @/../dev/src/pages/external_drag.tsx{16-22,25}
<DemoIframe url="/external_drag" />

## 超大数据

使用选项[`virtual`](api#virtual)启用虚拟列表功能. 记得给树设置可见区域高度.

<<< @/../dev/src/pages/virtual_list.tsx{23,30}
<DemoIframe url="/virtual_list" />

## 触摸 & 移动设备

此库基于 HTML5 Drag and Drop API, 所以在支持 Drag and Drop API 的移动设备上能工作. 如果不支持, 可以尝试添加兼容 Drag and Drop API 的库.

::: tip 注意
触摸时, 用户需要触摸并等一会儿才能触发拖拽。
:::

## 其他

- 选项 [`direction`](api#direction): 从右往左显示.
- 选项 [`customDragImage`](api#customdragimage): 自定义 drag image.
- 选项 [`rootId`](api#rootid): 使用扁平数据时, 顶级节点的父 id.
- 选项 [`keepPlaceholder`](api#keepplaceholder): 拖拽到树外时, 是否要保留拖拽占位节点. 默认`false`.
- 辅助方法 [`scrollToNode`](api#scrolltonode): 滚动到指定节点.
