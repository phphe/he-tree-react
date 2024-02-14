import "./HeTree.css";
import { useEffect, useMemo, useState, useRef, ReactNode, DragEventHandler } from "react";
import * as hp from "helper-js";
import { VirtualList, VirtualListHandle, OptionalKeys } from "./VirtualList";

type RecordStringUnknown = Record<string, unknown>

export type HeTreeProps = {
  treeData: RecordStringUnknown,
  renderNode: (info: TreeNodeInfo) => ReactNode,
  isNodeDraggable?: (node: RecordStringUnknown) => boolean | undefined
  isNodeDroppable?: (node: RecordStringUnknown, draggedNode: RecordStringUnknown | undefined) => boolean | undefined
} & OptionalKeys<typeof defaultProps>

export const defaultProps = {
  /**
   * 
   */
  childrenKey: 'children',
  openKey: 'open',
  checkedKey: 'checked',
  foldable: false,
  indent: 20,
  customDragTrigger: false,
}

export type TreeNodeInfo = {
  _isPlaceholder: boolean,
  key: string | number,
  node: RecordStringUnknown,
  parent: RecordStringUnknown,
  children: RecordStringUnknown[],
  level: number,
  dragOvering: boolean,
  draggable: boolean,
  setOpen: (open: boolean) => void,
  setChecked: (checked: boolean | null) => void,
  onDragStart: DragEventHandler,
  _attrs: {
    key: string | number,
    draggable: boolean,
    style: React.CSSProperties,
    onDragStart: DragEventHandler,
    onDragOver: DragEventHandler,
    onDrop: DragEventHandler,
    onDragEnter: DragEventHandler,
    onDragLeave: DragEventHandler,
    'data-key': string | number,
    'data-level': number,
    'drag-placeholder'?: 'true'
  }
} & RecordStringUnknown

export const HeTree = function HeTree(props: HeTreeProps) {
  const CHILDREN = props.childrenKey!
  const OPEN = props.openKey!
  const CHECKED = props.checkedKey!
  const indent = props.indent!
  const draggedNode = useRef<RecordStringUnknown>();
  const [forceRerender, setforceRerender] = useState([]); // change value to force rerender
  const [mainCacheSeed, setmainCacheSeed] = useState([]); // set to trigger refresh main cache
  const [placeholderArgs, setplaceholderArgs] = useState<{
    _isPlaceholder: boolean,
    key: string,
    node: RecordStringUnknown,
    parent: RecordStringUnknown,
    children: RecordStringUnknown[],
    level: number,
    index: number,
  } | null>();
  const virtualList = useRef<VirtualListHandle>(null);
  // flat treeData and info
  // info.children does not include placeholder
  const { flatInfos, infoByNodeMap } = useMemo(() => {
    const flat: TreeNodeInfo[] = [];
    const resolveNode = (
      { _isPlaceholder, key, node, parent, children, level, ...others }: {
        _isPlaceholder: boolean,
        key: string | number,
        node: RecordStringUnknown,
        parent: RecordStringUnknown,
        children: RecordStringUnknown[], level: number,
      } & RecordStringUnknown
    ): TreeNodeInfo => {
      _isPlaceholder = Boolean(_isPlaceholder)
      if (key == null) {
        key = Math.random()
      }
      const style = { paddingLeft: (level - 1) * indent + 'px' }
      const onDragStart = (e: DragEvent) => {
        e.dataTransfer!.setData("text", "he-tree"); // set data to work in Chrome Android
        e.dataTransfer!.dropEffect = 'move'
        draggedNode.current = node;
      }
      // main events for drop area
      const onDragOver = (e: DragEvent) => {
        let closest: TreeNodeInfo = info
        let index = flatInfos.indexOf(info) // index of closest node
        let atTop = false
        if (info._isPlaceholder) {
          let i = index - 1
          closest = flatInfos[i]
          if (!closest) {
            atTop = true
            i = index + 1
            closest = flatInfos[i]
          }
          index = i
        }
        const listRoot = virtualList.current!.getRootElement()
        // node start position
        const nodeX = getInnerX(listRoot, false)
        let placeholderLevel = Math.ceil((e.pageX - nodeX) / indent) // use this number to detect placeholder position. >= 0: prepend. < 0: after.}
        placeholderLevel = hp.between(placeholderLevel, 0, closest.level + 1)
        // @ts-ignore
        if (!atTop && !info._isPlaceholder && closest.node === props.treeData[CHILDREN][0]) {
          // chekc if at top
          const firstNodeElement = listRoot.querySelector(`.tree-node-box[data-key="${closest.key}"]`)!
          const rect = firstNodeElement.getBoundingClientRect()
          atTop = rect.y + rect.height / 2 > e.pageY
        }
        if (atTop) {
          placeholderLevel = 0
        }
        // default args if for 'after' action
        let newPlaceholderArgs: typeof placeholderArgs = {
          _isPlaceholder: true,
          key: '__DRAG_PLACEHOLDER__',
          node: {},
          parent: parent,
          children: [],
          level,
          index: index + 1,
        }
        const isDroppable = (info: TreeNodeInfo) => {
          return getDroppable(info.node)
        }
        if (atTop) {
          Object.assign(newPlaceholderArgs, {
            parent: props.treeData,
            level: 1,
            index: 0,
          })
        } else {
          let next = flatInfos[index + 1]
          if (next?._isPlaceholder) {
            next = flatInfos[index + 2]
          }
          const minLevel = next ? next.level : 1
          // TODO 如果closest关闭的，则等待打开，不find availablePositions
          // find all droppable positions
          const availablePositionsLeft: { parentInfo: TreeNodeInfo }[] = [];
          const availablePositionsRight: typeof availablePositionsLeft = [];
          let cur = closest
          while (cur && cur.level >= minLevel - 1) {
            if (isDroppable(cur)) {
              (placeholderLevel > cur.level ? availablePositionsLeft : availablePositionsRight).unshift({
                parentInfo: cur,
              })
            }
            cur = infoByNodeMap.get(cur.parent)!
          }
          let placeholderLevelPosition = hp.arrayLast(availablePositionsLeft)
          if (!placeholderLevelPosition) {
            placeholderLevelPosition = hp.arrayFirst(availablePositionsRight)
          }
          if (placeholderLevelPosition) {
            let targetIndex = index + 1
            let oldIndex = placeholderArgs?.index
            if (oldIndex != null && oldIndex < targetIndex) {
              targetIndex--
            }
            Object.assign(newPlaceholderArgs, {
              parent: placeholderLevelPosition.parentInfo.node,
              level: placeholderLevelPosition.parentInfo.level + 1,
              index: targetIndex
            })
          } else {
            newPlaceholderArgs = null
          }
        }
        setplaceholderArgs(newPlaceholderArgs)
        if (newPlaceholderArgs) {
          e.preventDefault(); // call mean droppable
        }
      }
      const onDrop = (e: DragEvent) => {
        e.preventDefault();
      }
      // other events
      const onDragEnter = (e: DragEvent) => {
        info.dragOvering = true
        setforceRerender([])
      }
      const onDragLeave = (e: DragEvent) => {
        info.dragOvering = false
        setforceRerender([])
      }
      const setOpen = (open: boolean) => {
        node[OPEN] = open
        setmainCacheSeed([])
      }
      const setChecked = (checked: boolean | null) => {
        node[CHECKED] = checked
        if (node[CHILDREN]) {
          // @ts-ignore
          for (const { node: child } of traverseTreeChildren(node[CHILDREN], CHILDREN)) {
            // @ts-ignore
            child[CHECKED] = checked
          }
        }
        for (const parent of traverseSelfAndParents(info.parent, 'parent')) {
          // @ts-ignore
          let allChecked = true
          let hasChecked = false
          // @ts-ignore
          parent[CHILDREN].forEach(v => {
            if (v[CHECKED]) {
              hasChecked = true
            } else {
              allChecked = false
            }
          })
          parent[CHECKED] = allChecked ? true : (hasChecked ? null : false)
        }
        setmainCacheSeed([])
      }
      const draggable = _isPlaceholder ? false : getDraggable(node, parent)
      const _attrs: TreeNodeInfo['_attrs'] = {
        key, style, draggable: props.customDragTrigger ? false : draggable,
        // @ts-ignore
        onDragStart, onDragOver, onDrop, onDragEnter, onDragLeave,
        // data attrs
        'data-key': key, 'data-level': level
      }
      if (_isPlaceholder) {
        _attrs['drag-placeholder'] = 'true'
      }
      const info: TreeNodeInfo = {
        _isPlaceholder, key, node, parent, children, level, dragOvering: false, draggable, setOpen, setChecked, _attrs, ...others,
        // @ts-ignore
        onDragStart,
      }
      return info
    }

    let count = -1
    const infoByNodeMap = new Map<RecordStringUnknown, TreeNodeInfo>()
    hp.walkTreeData(
      props.treeData,
      (node: any, index, parent, path) => {
        // @ts-ignore
        const key: string = node.id || node.key
        // @ts-ignore
        const children = [];
        const isRoot = count === -1
        // @ts-ignore
        const info: TreeNodeInfo = resolveNode({ key, node, parent, children, level: path.length })
        infoByNodeMap.set(node, info)
        if (isRoot) {
          // root
        } else {
          const parentInfo = infoByNodeMap.get(parent)!
          parentInfo.children.push(info)
          flat.push(info)
        }
        count++
      },
      { childrenKey: CHILDREN }
    );
    if (placeholderArgs) {
      const placeholderInfo = resolveNode(placeholderArgs)
      infoByNodeMap.set(placeholderInfo.node, placeholderInfo)
      flat.splice(placeholderArgs.index, 0, placeholderInfo)
    }
    return { flatInfos: flat, infoByNodeMap }
    // 
    function getDraggable(node: RecordStringUnknown, parent: RecordStringUnknown | undefined): boolean {
      let draggable = infoByNodeMap.get(node)?.draggable
      if (draggable == undefined) {
        draggable = props.isNodeDraggable?.(node)
      }
      if (draggable == undefined) {
        if (parent) {
          const parentInfo = infoByNodeMap.get(parent)!
          draggable = getDraggable(parent, parentInfo.parent)
        } else {
          draggable = true
        }
      }
      return draggable
    }
    function getDroppable(node: RecordStringUnknown): boolean {
      let droppable = props.isNodeDroppable?.(node, draggedNode.current)
      if (droppable == undefined) {
        const parent = infoByNodeMap.get(node)?.parent
        if (parent) {
          droppable = getDroppable(parent)
        } else {
          droppable = true
        }
      }
      return droppable
    }
  }, [mainCacheSeed, placeholderArgs?.parent, placeholderArgs?.index,
    // props
    props.treeData, props.isNodeDraggable, props.isNodeDroppable, CHILDREN, OPEN, CHECKED, props.foldable, indent, props.customDragTrigger,
  ]);
  const visibleNodeInfos = useMemo(() => {
    let closed = new Set()
    if (!props.foldable) {
      return flatInfos
    } else {
      return flatInfos.filter(info => {
        let hidden = false
        if (closed.has(info.parent)) {
          closed.add(info.node)
          hidden = true
        } else if (!info.node[OPEN]) {
          closed.add(info.node)
        }
        return !hidden
      })
    }
  }, [flatInfos, props.foldable, OPEN])
  const renderPlaceholder = (info: TreeNodeInfo) => {
    return <div className="tree-drag-placeholder" ></div>
  }
  return <VirtualList ref={virtualList} items={visibleNodeInfos} virtual={false}
    renderItem={(info, index) => (
      <div className="tree-node-box" {...info._attrs} >
        {!info._isPlaceholder ? props.renderNode(info) : renderPlaceholder(info)}
      </div>
    )}
  />
}

HeTree.defaultProps = defaultProps

function getInnerX(el: HTMLElement, rightDirection = false) {
  let rect = el.getBoundingClientRect()
  let css = window.getComputedStyle(el)
  let padding = parseFloat(css[!rightDirection ? 'paddingLeft' : 'paddingRight'])
  if (!rightDirection) {
    return rect.x + padding
  } else {
    return rect.x + rect.width - padding
  }
}

// : Generator<{node:T, parent: T|null}>
export function* traverseTreeNode<T>(node: T, childrenKey = 'children', parent: T | null = null): Generator<{ node: T, parent: T | null }> {
  yield { node, parent }
  // @ts-ignore
  const children: T[] = node[childrenKey]
  if (children?.length > 0) {
    yield* traverseTreeChildren(children, childrenKey, node)
  }
}

export function* traverseTreeChildren<T>(children: T[], childrenKey = 'children', parent: T | null = null): Generator<{ node: T, parent: T | null }> {
  for (const node of children) {
    yield* traverseTreeNode(node, childrenKey, parent)
  }
}

export function* traverseSelfAndParents<T>(node: T | null | undefined, parentKey = 'parent') {
  let cur = node
  while (cur) {
    yield cur
    // @ts-ignore
    cur = cur[parentKey]
  }
}