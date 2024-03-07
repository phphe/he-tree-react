# API

## 导出

此库导出的变量, 方法, Typescript 类型.

- [`useHeTree`](#usehetree): 主要的 React hook. 本库没有导出组件, 你需要使用此函数返回的[`renderTree`](#rendertree)渲染树.
- [`walkTreeData`](#walktreedata), [`walkTreeDataGenerator`](#walktreedatagenerator), [`findTreeData`](#findtreedata), [`filterTreeData`](#filtertreedata), [`openParentsInTreeData`](#openparentsintreedata), [`updateCheckedInTreeData`](#updatecheckedintreedata): 用来处理和遍历树形数据的方法.
- [`sortFlatData`](#sortflatdata), [`walkFlatData`](#walkflatdata), [`walkFlatDataGenerator`](#walkflatdatagenerator), [`convertIndexToTreeIndexInFlatData`](#convertindextotreeindexinflatdata), [`addToFlatData`](#addtoflatdata), [`removeByIdInFlatData`](#removebyidinflatdata), [`openParentsInFlatData`](#openparentsinflatdata), [`updateCheckedInFlatData`](#updatecheckedinflatdata): 用来处理和遍历扁平数据的方法.
- [`walkParentsGenerator`](#walkparentsgenerator): 遍历另一种特殊数据的方法. 这种数据类似`HTMLElement`, 其中包含类似于`parentElement`的指向父节点的键.
- `defaultProps`: `useHeTree`的选项的默认值.

以下为 Typescript 的类型:

- `Id`: 节点 id, 父级 id. 类型: `string | number`.
- [`Stat`](#stat): 节点的相关信息.
- `HeTreeProps`: `useHeTree`的选项.

## useHeTree

```ts
import { useHeTree } from "he-tree-react";
const {/* return */} = useHeTree({/* options */}) // prettier-ignore
```

本库的主要功能. React hook. 参数如下:

- options: 选项, 类型是对象. 以下是 options 中的部分属性:

  | 名称                                           | 类型                    | 默认值      | 描述                                                                  |
  | ---------------------------------------------- | ----------------------- | ----------- | :-------------------------------------------------------------------- |
  | data<a id="data"/>                             | Array                   |             | 数据. 参考[数据类型](guide#数据类型).                                 |
  | dataType<a id="datatype"/>                     | 'flat', 'tree'          | 'flat'      | 数据类型                                                              |
  | idKey<a id="idkey"/>                           | string                  | 'id'        | 你的数据中 id 的键名.                                                 |
  | parentIdKey<a id="parentidkey"/>               | string                  | 'parent_id' | 你的数据中父级 id 的键名. 仅用于扁平数据.                             |
  | childrenKey<a id="childrenkey"/>               | string                  | 'children'  | 你的数据中子级的键名. 仅用于树形数据.                                 |
  | indent<a id="indent"/>                         | number                  | 20          | 节点缩进, 单位是 px.                                                  |
  | dragOpen<a id="dragopen"/>                     | boolean                 | false       | 是否启用功能"拖拽到节点上时打开节点".                                 |
  | dragOpenDelay<a id="dragopendelay"/>           | number                  | 600         | 拖拽到节点上时打开节点的等待时间. 单位是毫秒.                         |
  | onDragOpen<a id="ondragopen"/>                 | `function(stat):  void` |             | 拖拽到节点上时打开节点的回调.                                         |
  | direction<a id="direction"/>                   | 'lrt', 'rtl'            | 'ltr'       | 显示方向, ltr 是从左往右显示, rtl 与之相反.                           |
  | rootId<a id="rootid"/>                         | string, null            | null        | 使用扁平数据时, 没有父级的节点的父级 id.                              |
  | virtual<a id="virtual"/>                       | boolean                 | false       | 是否启用虚拟化. 当数据非常多时用来提高性能.                           |
  | keepPlaceholder<a id="keepplaceholder"/>       | boolean                 | false       | 当拖拽离开树的范围, 是否要保留占位元素. 建议只在一个树的页面开启此项. |
  | openIds<a id="openids"/>                       | Array                   |             | 所有打开节点的 id.                                                    |
  | checkedIds<a id="checkedids"/>                 | Array                   |             | 所有勾选的节点的 id.                                                  |
  | isFunctionReactive<a id="isfunctionreactive"/> | boolean                 | false       | 是否监听回调函数的改变. [参考](guide#isfunctionreactive)              |

  以下是 options 中的剩余回调方法:
  | 名称 | 类型 | 描述 |
  | ------------------------- | ------------------------------------------------------ | :-------------------------------------------------------------------------------------------------------------------------------------------|
  | renderNode<a id="rendernode"/> | `(stat)=> ReactNode` | 节点的渲染函数. |
  | renderNodeBox<a id="rendernodebox"/> | `({stat, attrs, isPlaceholder})=> ReactNode` | nodeBox 的渲染函数. [参考](guide#node_structure_style). |
  | onChange<a id="onchange"/>| `(newData)=>void`|数据发生改变时调用.|
  | canDrag<a id="candrag"/> | `(stat)=>boolean, null, undefined, void` | 节点是否可拖拽. 返回`null, undefined, void`表示继承父节点. |
  | canDrop<a id="candrop"/> | `(stat, index)=>boolean, null, undefined, void` | 节点是否可放入. 返回`null, undefined, void`表示继承父节点. 参数`index`可能为空, 不为空时表示将要放入节点的子级的位置. |
  | customDragImage<a id="customdragimage"/> | `(event, stat)=> void` | 调用`event.dataTransfer.setDragImage`自定义 drag image. [参考](https://developer.mozilla.org/en-US/docs/Web/API/DataTransfer/setDragImage). |
  |onDragStart<a id="ondragstart"/>| `(event, stat)=> void` |当拖拽开始时|
  |onExternalDragOver<a id="onexternaldragover"/>|`(event)=>boolean`|当拖拽来自外部时调用. 你必选返回布尔值表示是否处理此拖拽.|
  |onDragOver<a id="ondragover"/>| `(event, stat, isExternal)=> void` |当拖拽到树上方时, `isExternal`表示此次拖拽是否来自外部.|
  |onDragEnd<a id="ondragend"/>|`(event, stat, isOutside)=>void`|当此树发起的拖拽结束时调用. stat 是此次拖拽的节点的 stat.isOutside 表示是否在树外部结束.|
  |onExternalDrop<a id="onexternaldrop"/>|`(event, parentStat, index)=>void`|当外部拖拽在此树结束时调用. parentStat 是目标父节点的 stat, 为空时代表树的根级. index 是目标位置, 即节点在兄弟节点中的索引.|

### `useHeTree`的返回

`useHeTree`的返回是对象, 包含了一些 states 和方法. **注意**, 这个对象每次更新都会改变, 不要依赖这个对象, 可以依赖这个对象的属性. 属性如下:
| 名称 | 类型 | 描述 |
| ------------------------- | ------------------------------------------------------ | :-------------------------------------------------------------------------------------------------------------------------------------------|
|renderTree<a id="rendertree"/>|`(options?: { className?: string, style?: React.CSSProperties }): ReactNode`|渲染树. 参数可以传入`className`和`style`控制根元素的样式.|
|getStat<a id="getstat"/>|`(idOrNodeOrStat)=>stat`|根据 id, 节点数据或 stat, 获得对应的 stat.|
|allIds<a id="allids"/>|数组|所有节点的 id.|
|rootIds<a id="rootids"/>|数组|树根级的所有节点的 id.|
|rootNodes<a id="rootnodes"/>|数组|树根级的所有节点的数据. 如果是树形数据, 它就是选项中的`data`.|
|rootStats<a id="rootstats"/>|数组|树根级的所有节点的 stat.|
|placeholder<a id="placeholder"/>|`{parentStat, index, level}`| 拖拽时占位节点的信息. 占位节点不存在时为空.|
|draggingStat<a id="draggingstat"/>|`stat`|由此树发起拖拽时, 被拖拽的节点的 stat. 不存在时为空.|
|dragOverStat<a id="dragoverstat"/>|`stat`|拖拽到其上面的节点. 可能为空.|
|visibleIds<a id="visibleids"/>|数组|显示的所有节点的 id.|
|attrsList<a id="attrslist"/>|数组|显示的所有节点的 attrs.|
|virtualListRef<a id="virtuallistref"/>|`ref`|虚拟列表组件的 ref, 参考[虚拟列表](https://github.com/phphe/react-base-virtual-list).|
|scrollToNode<a id="scrolltonode"/>|`(idOrNodeOrStat)=>boolean`|滚动到节点. 参数可以是 id, 节点数据或 stat. 如果节点未找到或未显示, 返回`false`. [例子](examples#scroll_to_node2)|

## walkTreeDataGenerator

通过`for of`遍历树形数据的方法. 循环中执行`skipChildren()`将跳过该节点的所有子节点, 执行`exitWalk`将结束遍历.

```ts
for (const [
  node,
  { parent, parents, siblings, index, skipChildren, exitWalk },
] of walkTreeDataGenerator(data, "children")) {
  // ...
}
```

## walkTreeData

通过回调方法遍历树形数据的方法. 回调方法中执行`skipChildren()`将跳过该节点的所有子节点, 执行`exitWalk`将结束遍历.

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

类似 `Array.prototype.find`. 返回找到的第一个节点. 回调方法中执行`skipChildren()`将跳过该节点的所有子节点, 执行`exitWalk`将结束遍历.

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

类似 `Array.prototype.filter`. 返回找到的所有节点. 回调方法中执行`skipChildren()`将跳过该节点的所有子节点, 执行`exitWalk`将结束遍历.

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

打开单个或多个节点的所有父节点, 这样才能确保该节点可见. [参考](guide#node_open).

```
(
  treeData,
  openIds: Id[],
  idOrIds: Id | Id[],
  options?: {idKey: string, childrenKey: string}
): newOpenIds
```

## updateCheckedInTreeData

更新单个节点或多个节点的`checked`状态. 这将同时更新它们的子节点和父节点. [参考](guide#node_checked).

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

把扁平数据按照节点在树里的顺序排序. 返回排序后的新数组. 你的数据在初始化时应该使用它以保证顺序.

```
(
  flatData,
  options?: {idKey: string, parentIdKey: string}
): sortedData
```

## walkFlatDataGenerator

通过`for of`遍历扁平数据的方法. 循环中执行`skipChildren()`将跳过该节点的所有子节点, 执行`exitWalk`将结束遍历. 使用前需确保你的数据的顺序是正确的.

相比于`walkTreeDataGenerator`, 少了`siblings`, 多了 `treeIndex, id, pid`. `treeIndex`是节点在整个树中的索引.

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

通过回调方法遍历扁平数据的方法. 回调方法中执行`skipChildren()`将跳过该节点的所有子节点, 执行`exitWalk`将结束遍历. 使用前需确保你的数据的顺序是正确的.

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

打开单个或多个节点的所有父节点, 这样才能确保该节点可见. 用前需确保你的数据的顺序是正确的. [参考](guide#node_open).

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

更新单个节点或多个节点的`checked`状态. 这将同时更新它们的子节点和父节点. 用前需确保你的数据的顺序是正确的. [参考](guide#node_checked).

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

通过某节点的父节点 id 和它在兄弟节点中的索引, 计算出它在整棵树中的索引.

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

向扁平数据添加一个节点. 它会改变原数据数组. 所以推荐传入原始数据的拷贝, 或者与`useImmer`一起使用. [参考](guide#update_flat_data_with_inner_methods2)

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

从扁平数据删除一个节点. 返回被删除的数据. 它会改变原数据数组. 所以推荐传入原始数据的拷贝, 或者与`useImmer`一起使用. [参考](guide#update_flat_data_with_inner_methods2)

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

遍历另一种特殊数据的方法. 这种数据类似`HTMLElement`, 其中包含类似于`parentElement`的指向父节点的键.

```
(
  node,
  parentKeyOrGetter: string | ((node) => parent | undefined),
  options?: {
    withSelf: boolean;
  }
): Generator
```

`parentKeyOrGetter`可以是字符串或者返回父级的方法. `options.withSelf`表示是否包括传入的节点. 返回 [Generator](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Generator). 下面是遍历 HTMLElement 的例子:

```ts
let el = document.querySelector("div");
for (const parent of walkParentsGenerator(el, "parentElement", {
  withSelf: true,
})) {
  // ...
}
```

## Stat

`stat`包括和节点有关的信息. 只读. 属性如下:

| 名称         | 类型         | 描述                        |
| ------------ | ------------ | :-------------------------- |
| \_isStat     | boolean      | 表明是否是 stat 对象        |
| node         | object       | 节点的数据                  |
| id           | Id           | id                          |
| pid          | Id, null     | 节点的父级 id               |
| parent       | object, null | 父节点的数据                |
| parentStat   | stat, null   | 父节点的 stat               |
| childIds     | Id[]         | 子节点的 id 数组            |
| children     | object[]     | 子节点数组                  |
| childStats   | stat[]       | 子节点的 stat 数组          |
| siblingIds   | Id[]         | 兄弟节点的 id 数组          |
| siblings     | object[]     | 兄弟节点数组                |
| siblingStats | stat[]       | 兄弟节点的 stat 数组        |
| index        | number       | 节点在兄弟节点中的索引      |
| level        | number       | 节点在树中的深度. 从 1 开始 |
| open         | boolean      | 是否展开                    |
| checked      | boolean      | 是否勾选                    |
| draggable    | boolean      | 是否可拖动                  |
