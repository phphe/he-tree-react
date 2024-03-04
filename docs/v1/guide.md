# Guide

## Installation

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

## Data Types

This library supports two types of data structures:

- Flat data, which is a one-dimensional array. Similar to data stored in a database. Each item requires an id, a parent id, `null` means there is no parent. The order of flat data must be the same as the tree, you can use the [`sortFlatData`](./api#sortflatdata) method to sort the data when initializing the data.
  ```js
  [
    { id: 1, pid: null },
    { id: 2, pid: 1 },
    { id: 3, pid: 2 },
  ];
  ```
- Tree data. Each node contain child nodes in an array. If id is not specified, this library will use the node's index in the tree as the id. When using tree data, you need to set `dataType: 'tree'`.
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

The `id, pid, children` in the data are not fixed. In the options, use `idKey, parentIdKey, childrenKey` to indicate the corresponding key names in your data.

## No Components

This library does not export components, but exports a hook `useHeTree`. Use the returned `renderHeTree` to render the tree. The advantage of this is that in addition to `renderHeTree`, `useHeTree` will also return some internal states and methods, which can be easily obtained.

```js
import { useHeTree } from "he-tree-react";

export default function App() {
  const { renderHeTree } = useHeTree({...})
  return <div>
    {renderHeTree()}
  </div>
}
```

## Options

`useHeTree` is the primary function used, its first parameter is an options object. The required options are `data`, and at least one of `renderNode, renderNodeBox` must be present. Other important options include:

- `dataType`, indicating data type. Available values:
  - `flat`, default. Flat data.
  - `tree`, tree-shaped data.
- `idKey, parentIdKey`, the default values are `id` and `parent_id`. Needed when using flat data. Although there are default values, it is better to explicitly state them.
- `childrenKey`, the default is `children`. Needed when using tree-shaped data. Although there are default values, it is better to explicitly state them.
- `onChange`, a function called when data changes, the parameter is new data. If your tree will not change then this is not required.
- <a id="isfunctionreactive"/> `isFunctionReactive`, boolean. Default `false`. `useHeTree` options include many callback functions, such as `onChange, canDrop`. `isFunctionReactive` can be used to control whether to listen for changes to these callback functions. If your callback functions and `data` change synchronously, you do not need to enable this. Otherwise, you need to enable this and use React's `useCallback` or `useMemo` to cache all your callback functions to avoid performance issues.

[See the `useHeTree` API documentation for more information](api#usehetree).

## Tips

- `stat`, information related to a single node. Most of the parameters in callback functions have `stat`. [Refer to `Stat` API](api#stat).
- `node`, the data of the node. You can get node data through `stat.node`.
- `getStat`, through this function you can get `stat`, the only parameter can be `id, node, stat`. This function is in the return object of `useHeTree`: `const {getStat} = useHeTree({...})`.
- The code examples below have preview. These examples can be directly copied for use. Pay attention to the the highlighted lines in code.
- The code examples below use the `tsx` format, if you need the `js` format, you can use any ts js online converter.

## Use Flat Data

<<< @/../src/pages/base_flat_data.tsx
<DemoIframe url="/base_flat_data" />

## Use Tree-shaped Data

<<< @/../src/pages/base_tree_data.tsx
<DemoIframe url="/base_tree_data" />

## Custom Drag Trigger Element

You can add the `draggable` attribute to any child element of the node.

<<< @/../src/pages/custom_drag_trigger_flat_data.tsx{14}
<DemoIframe url="/custom_drag_trigger_flat_data" />

## HTML and Style of Node <a id="node_structure_style"/>

Node HTML:

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

There are two `div` above. Use the `renderNode` option to control the rendering of the inner div. For example: `renderNode: ({node}) => <div>{node.name}</div>`.

The outer div is called `nodeBox`, don't modify its `padding-left, padding-right`. Use the [`indent`](api#indent) option to control the indentation of the node. If you want to control the rendering of `nodeBox` or the drag placeholder, you can use the `renderNodeBox` option, which will override `renderNode`. The standard `renderNodeBox` is as follows:

```tsx{4-7,9}
renderNodeBox: ({ stat, attrs, isPlaceholder }) => (
  <div {...attrs}>
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

Lines 4 to 7 are drag-and-drop placeholder. Line 9 is node.

## Custom Drag Placeholder and Node Box

<<< @/../src/pages/customize_placeholder_and_node_box.tsx{13-19,23-39}
<DemoIframe url="/customize_placeholder_and_node_box" />

## Open & Close <a id="node_open"/>

- Use the `openIds` option to indicate the open nodes.
- The `open` status of the node can be obtained through `stat.open`.
- The `allIds` returned by `useHeTree` contains the ids of all nodes.
- This library exports methods that can expand all parents of one or multiple nodes. For flat data: [`openParentsInFlatData`](api#openparentsinflatdata). For tree data: [`openParentsInTreeData`](api#openparentsintreedata).

<<< @/../src/pages/open_ids.tsx{1,9-16,22-24,29-32}
<DemoIframe url="/open_ids" />

## Checked <a id="node_checked"/>

- Use the option `checkedIds` to indicate the checked nodes.
- The `checked` status of this node can be obtained through `stat.checked`.
- This library exports methods that can get `checkedIds` for one or more nodes after the `checked` status changes. Flat data: [`updateCheckedInFlatData`](api#updatecheckedinflatdata). Tree data: [`updateCheckedInTreeData](api#updatecheckedintreedata).
  - The update of this method to the node's `checked` is cascading. If you don't want to cascade updates, replace it with your own logic.
  - This method returns an array of length 2. The first item is all checked ids, and the second item is all semi-checked ids. If you don't need semi-checked, ignore the second item.
  - Semi-checked, that is, there are child nodes that are checked or semi-checked, and there are child nodes that are not checked.

<<< @/../src/pages/checked_ids.tsx{1,9-15,21-23,28-29}
<DemoIframe url="/checked_ids" />

## draggable & droppable

Use the following options to control:

- [`canDrag`](api#candrag), whether the node can be dragged.
- [`canDrop`](api#candrop), whether the node can be dropped.
- [`canDropToRoot`](api#candroptoroot), whether the tree root can be dropped.

<<< @/../src/pages/draggable_droppable.tsx{16-18}
<DemoIframe url="/draggable_droppable" />

- The root node cannot be dropped.
- `Technology` and its sub-nodes can be dragged. `Science` and its sub-nodes cannot be dragged.
- `Science` and its sub-nodes can be dropped. `Technology` and its sub-nodes cannot be dropped.

## Open when dragging over

Use the following options to control:

- [`dragOpen`](api#dragopen), whether to enable, default `false`.
- [`dragOpenDelay`](api#dragopen), delay, default `600` milliseconds.
- [`onDragOpen`](api#ondragopen), the function called when the node is opened.

<<< @/../src/pages/dragopen.tsx
<DemoIframe url="/dragopen" />

## Update Data

Due to the immutable nature of React, it is difficult to update flat data and tree data. For flat data, this library provides two methods to add nodes or delete nodes. If you want to perform more complex operations, or update tree data, it is recommended that you use [`immer`](https://github.com/mweststrate/immer).

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

## Update Flat Data<a id="update_flat_data_with_inner_methods2"/>

[`addToFlatData`](api#addtoflatdata). [`removeByIdInFlatData`](api#removebyidinflatdata).
These 2 methods will modify original data, so pass copy to it, or use `immer`.

<<< @/../src/pages/update_data.tsx{3,12-22,33-34}
<DemoIframe url="/update_data" />

## Update Flat Data with immer

Note, here we use `useImmer` instead of React's `useState`.

<<< @/../src/pages/update_flat_data_with_immer.tsx{3,7,12,13-31,42-44}
<DemoIframe url="/update_flat_data_with_immer" />

## Update Tree Data with immer

Note, here we use `useImmer` instead of React's `useState`. `findTreeData` is like `Array.prototype.find`.

<<< @/../src/pages/update_tree_data_with_immer.tsx{1,4,10-30,41-43}
<DemoIframe url="/update_tree_data_with_immer" />

## Drag from External

Related options:

- [`onExternalDragOver`](api#onexternaldragover): Indicate whether to handle external drag.
- [`onExternalDrop`](api#onexternaldrop): Callback when drop from external.

<<< @/../src/pages/external_drag.tsx{16-22,25}
<DemoIframe url="/external_drag" />

## Big Data

Use option [`virtual`](api#virtual) to enable virtual list. Remember to set height for tree.

<<< @/../src/pages/virtual_list.tsx{23,30}
<DemoIframe url="/virtual_list" />

## Touch & Mobile Device

It is based on HTML5 Drag and Drop API. So it works in any device that supports Drag and Drop API. For others, you can try Drag and Drop API polyfill.

::: tip Notice
In mobile, user need touch and hold to trigger drag.
:::

## Others

- Option [`direction`](api#direction): from right to left.
- Option [`customDragImage`](api#customdragimage): custom drag image.
- Option [`rootId`](api#rootid): the parent id of root nodes in flat data.
- Option [`keepPlaceholder`](api#keepplaceholder): whether to retain the drag placeholder node when dragging outside the tree. Default is `false`.
