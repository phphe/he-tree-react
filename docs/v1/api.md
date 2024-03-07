# API

## Exported

The exported variables, methods, and Typescript types.

- [`useHeTree`](#usehetree): Main React hook. This library does not export components, you need to use the [`renderTree`](#rendertree) render tree returned by this function.
- [`walkTreeData`](#walktreedata), [`walkTreeDataGenerator`](#walktreedatagenerator), [`findTreeData`](#findtreedata), [`filterTreeData`](#filtertreedata), [`openParentsInTreeData`](#openparentsintreedata), [`updateCheckedInTreeData`](#updatecheckedintreedata): Methods for processing and traversing tree data.
- [`sortFlatData`](#sortflatdata), [`walkFlatData`](#walkflatdata), [`walkFlatDataGenerator`](#walkflatdatagenerator), [`convertIndexToTreeIndexInFlatData`](#convertindextotreeindexinflatdata), [`addToFlatData`](#addtoflatdata), [`removeByIdInFlatData`](#removebyidinflatdata), [`openParentsInFlatData`](#openparentsinflatdata), [`updateCheckedInFlatData`](#updatecheckedinflatdata): Methods for processing and traversing flat data.
- [`walkParentsGenerator`](#walkparentsgenerator): To iterate over another special kind of data. This data is like `HTMLElement`, which contains a key pointing to the parent node like `parentElement`.
- `defaultProps`: The default value of `useHeTree` options.

Typescript types:

- `Id`: node id, parent id. Type: `string | number`.
- [`Stat`](#stat): Node information.
- `HeTreeProps`: Options for `useHeTree`.

## useHeTree

```ts
import { useHeTree } from "he-tree-react";
const {/* return */} = useHeTree({/* options */}) // prettier-ignore
```

The main function of this library. React hook. The arguments are as follows:

- options: Options, type is object. The following are some properties in options:

  | Name                                           | Type                    | Default     | Description                                                                                                          |
  | ---------------------------------------------- | ----------------------- | ----------- | :------------------------------------------------------------------------------------------------------------------- |
  | data<a id="data"/>                             | Array                   |             | Data. Check [Data Types](guide#data-types).                                                                          |
  | dataType<a id="datatype"/>                     | 'flat', 'tree'          | 'flat'      | Data Types                                                                                                           |
  | idKey<a id="idkey"/>                           | string                  | 'id'        | key of id 名.                                                                                                        |
  | parentIdKey<a id="parentidkey"/>               | string                  | 'parent_id' | key of the parent id. For flat data only.                                                                            |
  | childrenKey<a id="childrenkey"/>               | string                  | 'children'  | key of children nodes. For tree data only.                                                                           |
  | indent<a id="indent"/>                         | number                  | 20          | Node indentation, unit is px.                                                                                        |
  | dragOpen<a id="dragopen"/>                     | boolean                 | false       | Whether to enable the function "Open node when dragging over node".                                                  |
  | dragOpenDelay<a id="dragopendelay"/>           | number                  | 600         | The waiting time to open the node when dragging over the node. The unit is milliseconds.                             |
  | onDragOpen<a id="ondragopen"/>                 | `function(stat):  void` |             | The callback of "Open node when dragging over node".                                                                 |
  | direction<a id="direction"/>                   | 'lrt', 'rtl'            | 'ltr'       | Display direction, ltr is displayed from left to right, rtl is the opposite.                                         |
  | rootId<a id="rootid"/>                         | string, null            | null        | The parent id of a node that has not parent in flat data.                                                            |
  | virtual<a id="virtual"/>                       | boolean                 | false       | Whether to enable virtualization. Used to improve performance when there is a lot of data.                           |
  | keepPlaceholder<a id="keepplaceholder"/>       | boolean                 | false       | Whether to retain placeholder when dragging out of the tree. It is recommended to enable this only on one tree page. |
  | openIds<a id="openids"/>                       | Array                   |             | All open nodes' id.                                                                                                  |
  | checkedIds<a id="checkedids"/>                 | Array                   |             | All checked nodes' id.                                                                                               |
  | isFunctionReactive<a id="isfunctionreactive"/> | boolean                 | false       | Whether to listen for change of the callback functions. [Reference](guide#isfunctionreactive)                        |

  The remaining callback functions in options:
  | Name | Type | Description |
  | ------------------------- | ------------------------------------------------------ | :-------------------------------------------------------------------------------------------------------------------------------------------|
  | renderNode<a id="rendernode"/> | `(stat)=> ReactNode` | Node render. |
  | renderNodeBox<a id="rendernodebox"/> | `({stat, attrs, isPlaceholder})=> ReactNode` | nodeBox's render. [Reference](guide#node_structure_style). |
  | onChange<a id="onchange"/>| `(newData)=>void`|Callback on data change|
  | canDrag<a id="candrag"/> | `(stat)=>boolean, null, undefined, void` | Whether a node draggable. Returning `null, undefined, void` means inheriting the parent node. |
  | canDrop<a id="candrop"/> | `(stat, index)=>boolean, null, undefined, void` | Whether a node droppable. Returning `null, undefined, void` means inheriting the parent node. The parameter `index` may be empty. If it is not empty, it indicates the position. |
  | customDragImage<a id="customdragimage"/> | `(event, stat)=> void` | Called `event.dataTransfer.setDragImage` to custom drag image. [Reference](https://developer.mozilla.org/en-US/docs/Web/API/DataTransfer/setDragImage). |
  |onDragStart<a id="ondragstart"/>| `(event, stat)=> void` ||
  |onExternalDragOver<a id="onexternaldragover"/>|`(event)=>boolean`|Called when drag from external. Must return a Boolean value to indicate whether to handle this drag.|
  |onDragOver<a id="ondragover"/>| `(event, stat, isExternal)=> void` |`isExternal` indicates whether the drag is from outside.|
  |onDragEnd<a id="ondragend"/>|`(event, stat, isOutside)=>void`|Called on dragend and this drag is started in this tree. `stat` is the stat of the dragged node. `isOutside` indicates whether it ended outside the tree.|
  |onExternalDrop<a id="onexternaldrop"/>|`(event, parentStat, index)=>void`|Called when the external drag ends on this tree. parentStat is the stat of the target parent node, and when it is empty, it represents the root of the tree. Index is the target position, the index of the node among siblings.|

### Return of `useHeTree`

The return of `useHeTree` is an object, including some states and methods. **Note**, this object will change every time. Do not rely on this object, but you can rely on the properties of this object. The properties are as follows:
| Name | Type | Description |
| ------------------------- | ------------------------------------------------------ | :-------------------------------------------------------------------------------------------------------------------------------------------|
|renderTree<a id="rendertree"/>|`(options?: { className?: string, style?: React.CSSProperties }): ReactNode`|Tree render. Options can be passed in `className` and `style` to control the style of the root element.|
|getStat<a id="getstat"/>|`(idOrNodeOrStat)=>stat`|Get stat by id, or node data, or stat object.|
|allIds<a id="allids"/>|Array|The ids of all nodes.|
|rootIds<a id="rootids"/>|Array|The ids of all root nodes|
|rootNodes<a id="rootnodes"/>|Array|All root nodes. In tree data, it is same with `options.data`.|
|rootStats<a id="rootstats"/>|Array|All root nodes' stat.|
|placeholder<a id="placeholder"/>|`{parentStat, index, level}`| Drag placeholder info. Null if it does not exist.|
|draggingStat<a id="draggingstat"/>|`stat`|When a drag is initiated from this tree, the stat of the dragged node. Null if it does not exist.|
|dragOverStat<a id="dragoverstat"/>|`stat`|Dragging over node's stat. May be null.|
|visibleIds<a id="visibleids"/>|Array|All visible nodes' id.|
|attrsList<a id="attrslist"/>|Array|All visible nodes' attrs.|
|virtualListRef<a id="virtuallistref"/>|`ref`| `ref` of virtual list component, Check [virtual list](https://github.com/phphe/react-base-virtual-list).|
|scrollToNode<a id="scrolltonode"/>|`(idOrNodeOrStat)=>boolean`|Scroll to node. The argument can be id, node or stat. If node not found or invisible, it return `false`. [Example](examples#scroll_to_node2)|

## walkTreeDataGenerator

The method of traversing tree data through `for of`. Executing `skipChildren()` in the loop will skip all child nodes of the node, and executing `exitWalk` will end the traversal.

```ts
for (const [
  node,
  { parent, parents, siblings, index, skipChildren, exitWalk },
] of walkTreeDataGenerator(data, "children")) {
  // ...
}
```

## walkTreeData

The method to traverse tree data through the callback method. Executing `skipChildren()` in the callback method will skip all child nodes of the node, and executing `exitWalk` will end the traversal.

```ts
walkTreeDataGenerator(
  data,
  (node, { parent, parents, siblings, index, skipChildren, exitWalk }) => {
    // ...
  },
  "children"
);
```

## findTreeData

Like `Array.prototype.find`. Returns the first node found. Executing `skipChildren()` in the callback method will skip all child nodes of the node, and executing `exitWalk` will end the traversal.

```ts
let foundNode = findTreeData(
  data,
  (node, { parent, parents, siblings, index, skipChildren, exitWalk }) => {
    // return node.id === 1;
  },
  "children"
);
```

## filterTreeData

Like `Array.prototype.filter`. Returns all nodes found. Executing `skipChildren()` in the callback method will skip all child nodes of the node, and executing `exitWalk` will end the traversal.

```ts
let nodes = filterTreeData(
  data,
  (node, { parent, parents, siblings, index, skipChildren, exitWalk }) => {
    // return node.id > 1;
  },
  "children"
);
```

## openParentsInTreeData

Open all parent nodes of a single or multiple nodes to make the node visible. [Reference](guide#node_open).

```
(
  treeData,
  openIds: Id[],
  idOrIds: Id | Id[],
  options?: {idKey: string, childrenKey: string}
): newOpenIds
```

## updateCheckedInTreeData

Update the `checked` status of a single node or multiple nodes. This will update both their children and parents. [Reference](guide#node_checked).

```
(
  treeData,
  checkedIds: Id[],
  idOrIds: Id | Id[],
  checked: boolean,
  options?: {idKey: string, childrenKey: string}
): [newCheckedIds, newSemiCheckedIds]
```

## sortFlatData

Sort the flat data according to the order of the nodes in the tree. Return the new sorted array. Your data should use it to ensure order after initialized.

```
(
  flatData,
  options?: {idKey: string, parentIdKey: string}
): sortedData
```

## walkFlatDataGenerator

The method of traversing flat data through `for of`. Executing `skipChildren()` in the loop will skip all the child nodes of the node, and executing `exitWalk` will end the traversal. Make sure the order of your data is correct before using it.

Compared to walkTreeDataGenerator, it lacks `siblings`, but has `treeIndex, id, pid`. treeIndex is the index of the node in the tree.

```ts
for (const [
  node,
  { parent, parents, index, treeIndex, id, pid, skipChildren, exitWalk },
] of walkFlatDataGenerator(flatData, {
  idKey: "id",
  parentIdKey: "parent_id",
})) {
  // ...
}
```

## walkFlatData

The method of traversing flat data through the callback method. Executing `skipChildren()` in the callback method will skip all child nodes of the node, and executing `exitWalk` will end the traversal. Before using, make sure that the order of your data is correct.

```ts
walkFlatData(
  flatData,
  (
    node,
    { parent, parents, index, treeIndex, id, pid, skipChildren, exitWalk }
  ) => {
    // ...
  },
  {
    idKey: "id",
    parentIdKey: "parent_id",
  }
);
```

## openParentsInFlatData

Open all parent nodes of a single or multiple nodes to make the node visible. Make sure your data is in the correct order before using it. [Reference](guide#node_open).

```
(
  flatData,
  openIds: Id[],
  idOrIds: Id | Id[],
  options?: {
    idKey: "id",
    parentIdKey: "parent_id",
  }
): newOpenIds
```

## updateCheckedInFlatData

Update the `checked` status of a single node or multiple nodes. This will update both their children and parents. Make sure your data is in the correct order before using it. [Reference](guide#node_checked).

```
(
  flatData,
  checkedIds: Id[],
  idOrIds: Id | Id[],
  checked: boolean,
  options?: {
    idKey: "id",
    parentIdKey: "parent_id",
  }
): [newCheckedIds, newSemiCheckedIds]
```

## convertIndexToTreeIndexInFlatData

Calculate the index of a node in the tree through its parent node id and its index in the sibling nodes.

```
(
  flatData,
  parentId: Id | null,
  indexInSiblings: Id | null,
  options?: {
    idKey: "id",
    parentIdKey: "parent_id",
  }
): treeIndex
```

## addToFlatData

Add a node to the flat data. It will change the original data array. Therefore, it is recommended to pass in a copy of the original data, or use it together with `useImmer`. [Reference](guide#update_flat_data_with_inner_methods2)

```
(
  flatData,
  newNode,
  index: Id | null,
  options?: {
    idKey: "id",
    parentIdKey: "parent_id",
  }
):void
```

## removeByIdInFlatData

Remove node by id from the flat data. It will change the original data array. Therefore, it is recommended to pass in a copy of the original data, or use it together with `useImmer`. [Reference](guide#update_flat_data_with_inner_methods2)

```
(
  flatData,
  removeId: Id | null,
  options?: {
    idKey: "id",
    parentIdKey: "parent_id",
  }
): removedData
```

## walkParentsGenerator

A method to iterate over another special kind of data. This data is like `HTMLElement`, which contains keys pointing to the parent node like `parentElement`.

```
(
  node,
  parentKeyOrGetter: string | ((node) => parent | undefined),
  options?: {
    withSelf: boolean;
  }
): Generator
```

`parentKeyOrGetter` can be a string or a method that returns the parent. `options.withSelf` indicates whether to include the node self. Returns [Generator](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Generator). Here is an example of traversing HTMLElement:

```ts
let el = document.querySelector("div");
for (const parent of walkParentsGenerator(el, "parentElement", {
  withSelf: true,
})) {
  // ...
}
```

## Stat

`stat` contains information related to the node. Read-only. The properties are as follows:

| Name         | Type         | Description                           |
| ------------ | ------------ | :------------------------------------ |
| \_isStat     | boolean      | Indicates whether it is a stat object |
| node         | object       | node data                             |
| id           | Id           | id                                    |
| pid          | Id, null     | parent id                             |
| parent       | object, null | parent data                           |
| parentStat   | stat, null   | parent stat                           |
| childIds     | Id[]         |                                       |
| children     | object[]     |                                       |
| childStats   | stat[]       | stats of children                     |
| siblingIds   | Id[]         |                                       |
| siblings     | object[]     | sibling nodes                         |
| siblingStats | stat[]       | stats of siblings                     |
| index        | number       | node's index in siblings              |
| level        | number       | node's depth in tree. Start from 1    |
| open         | boolean      |                                       |
| checked      | boolean      |                                       |
| draggable    | boolean      |                                       |
