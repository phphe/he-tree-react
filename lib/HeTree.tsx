import "./HeTree.css";
import React, { useEffect, useMemo, useState, useRef, ReactNode } from "react";
import * as hp from "helper-js";
import { VirtualList, VirtualListHandle, OptionalKeys } from "./VirtualList";

type RecordStringUnknown = Record<string, unknown>

export type HeTreeProps = {
  treeData: RecordStringUnknown,
  renderNode: (info: TreeNodeInfo) => ReactNode,
  keyKey?: string
  isNodeDraggable?: (node: RecordStringUnknown) => boolean | undefined
  isNodeDroppable?: (node: RecordStringUnknown, draggedNode: RecordStringUnknown | undefined) => boolean | undefined
  afterDragOpen?: (node: RecordStringUnknown) => void,
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
  dragOpen: false,
  dragOpenDelay: 0,
}

export type TreeNodeInfo = {
  isPlaceholder: boolean,
  key: string | number,
  node: RecordStringUnknown,
  parent: RecordStringUnknown,
  children: RecordStringUnknown[],
  level: number,
  dragOver: boolean,
  draggable: boolean,
  setOpen: (open: boolean) => void,
  setChecked: (checked: boolean | null) => void,
  onDragStart?: React.DragEventHandler<HTMLElement>,
  attrs?: {
    key: string | number,
    draggable: boolean,
    style: React.CSSProperties,
    onDragStart: React.DragEventHandler<HTMLElement>,
    onDragOver: React.DragEventHandler<HTMLElement>,
    onDrop: React.DragEventHandler<HTMLElement>,
    onDragEnter: React.DragEventHandler<HTMLElement>,
    onDragLeave: React.DragEventHandler<HTMLElement>,
    'data-key': string | number,
    'data-level': number,
    'drag-placeholder'?: 'true'
  }
}

const dragOverInfo = {
  node: null as RecordStringUnknown | null,
  x: 0,
  y: 0,
  time: 0,
}

export const _useTreeData = (
  { treeData, CHECKED, CHILDREN, OPEN, KEY, isNodeDraggable }:
    {
      treeData: RecordStringUnknown,
      CHECKED: string
      CHILDREN: string
      OPEN: string
      KEY: string
      isNodeDraggable?: HeTreeProps['isNodeDraggable'],
    }
) => {

  const [refreshSeed, setrefreshSeed] = useState([]);
  const { flatInfos, infoByNodeMap } = useMemo(() => {
    const flat: TreeNodeInfo[] = [];
    const resolveNode = (
      { isPlaceholder, key, node, parent, children, level, ...others }: {
        isPlaceholder: boolean,
        key: string | number,
        node: RecordStringUnknown,
        parent: RecordStringUnknown,
        children: RecordStringUnknown[], level: number,
      } & RecordStringUnknown
    ): TreeNodeInfo => {
      isPlaceholder = Boolean(isPlaceholder)
      if (key == null) {
        key = flat.length // use index as key
      }
      const setOpen = (open: boolean) => {
        node[OPEN] = open
        setrefreshSeed([])
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
        setrefreshSeed([])
      }
      const draggable = getDraggable(node, parent)
      const info: TreeNodeInfo = {
        isPlaceholder, key, node, parent, children, level, dragOver: false, draggable, setOpen, setChecked, ...others,
      }
      return info
    }

    const infoByNodeMap = new Map<RecordStringUnknown, TreeNodeInfo>()
    hp.walkTreeData(
      treeData,
      (node: any, index, parent, path) => {
        // @ts-ignore
        const key: string = node[KEY]
        // @ts-ignore
        const children = [];
        // @ts-ignore
        const info: TreeNodeInfo = resolveNode({ key, node, parent, children, level: path.length })
        infoByNodeMap.set(node, info)
        if (!parent) {
          // root
        } else {
          const parentInfo = infoByNodeMap.get(parent)!
          parentInfo.children.push(info)
        }
        flat.push(info)
      },
      { childrenKey: CHILDREN }
    );
    // methods
    function getDraggable(node: RecordStringUnknown, parent: RecordStringUnknown | undefined): boolean {
      let draggable = infoByNodeMap.get(node)?.draggable
      if (draggable == undefined) {
        draggable = isNodeDraggable?.(node)
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
    return { flatInfos: flat, infoByNodeMap }
  }, [refreshSeed, treeData, CHECKED, CHILDREN, OPEN, KEY, isNodeDraggable,])
  return { flatInfos, infoByNodeMap }
}

export const _useDraggable = ({
  useTreeDataReturn, treeData, foldable, OPEN, CHILDREN, indent, customDragTrigger, isNodeDroppable,
}: {
  useTreeDataReturn: ReturnType<typeof _useTreeData>,
  treeData: HeTreeProps['treeData'],
  foldable: boolean,
  OPEN: string,
  CHILDREN: string,
  indent: number,
  customDragTrigger: boolean
  isNodeDroppable: HeTreeProps['isNodeDroppable']
}
) => {
  const { flatInfos, infoByNodeMap } = useTreeDataReturn
  const [draggedNode, setdraggedNode] = useState<RecordStringUnknown>();
  const [dragOverNode, setdragOverNode] = useState<RecordStringUnknown>();
  const virtualList = useRef<VirtualListHandle>(null);
  const [placeholderInfo, setplaceholderInfo] = useState<(TreeNodeInfo & { _indexInVisible: number }) | null>();
  const { visibleInfos } = useMemo(() => {
    const visibleInfos: TreeNodeInfo[] = [];
    for (const { node, parent, skipChildren } of traverseTreeChildren(treeData[CHILDREN] as RecordStringUnknown[], CHILDREN, treeData)) {
      const info = infoByNodeMap.get(node)!
      completeInfo(info)
      visibleInfos.push(info)
      if (foldable && !node[OPEN]) {
        skipChildren()
      }
    }
    if (placeholderInfo) {
      placeholderInfo.draggable = false
      completeInfo(placeholderInfo)
      visibleInfos.splice(placeholderInfo._indexInVisible, 0, placeholderInfo)
    }
    function completeInfo(info: TreeNodeInfo) {
      const onDragStart: TreeNodeInfo['onDragStart'] = (e) => {
        e.dataTransfer!.setData("text", "he-tree"); // set data to work in Chrome Android
        // TODO 拖拽类型识别
        e.dataTransfer!.dropEffect = 'move'
        setdraggedNode(info.node);
      }
      const style = { paddingLeft: (info.level - 1) * indent + 'px' }
      Object.assign(info, {
        onDragStart,
        attrs: {
          key: info.key,
          draggable: customDragTrigger ? false : info.draggable,
          style,
          onDragStart,
          onDragOver(e) {
            let closest: TreeNodeInfo = info
            let index = visibleInfos.indexOf(info) // index of closest node
            let atTop = false
            if (info.isPlaceholder) {
              index--
              closest = visibleInfos[index]
              if (!closest) {
                atTop = true
                index = 1
                closest = visibleInfos[index]
              }
            }
            const listRoot = virtualList.current!.getRootElement()
            // node start position
            const nodeX = getInnerX(listRoot, false)
            let placeholderLevel = Math.ceil((e.pageX - nodeX) / indent) // use this number to detect placeholder position. >= 0: prepend. < 0: after.}
            placeholderLevel = hp.between(placeholderLevel, 0, closest.level + 1)
            // @ts-ignore
            if (!atTop && !info.isPlaceholder && closest.node === treeData[CHILDREN][0]) {
              // chekc if at top
              const firstNodeElement = listRoot.querySelector(`.tree-node-box[data-key="${closest.key}"]`)!
              const rect = firstNodeElement.getBoundingClientRect()
              atTop = rect.y + rect.height / 2 > e.pageY
            }
            if (atTop) {
              placeholderLevel = 0
            }
            //
            let newPlaceholderInfo = {
              isPlaceholder: true,
              key: '__DRAG_PLACEHOLDER__',
              node: {},
              children: [],
              parent: info.parent,
              level: 0,
              _indexInVisible: 0,
            }
            const isDroppable = (info: TreeNodeInfo) => {
              return getDroppable(info.node)
            }
            if (atTop) {
              Object.assign(newPlaceholderInfo, {
                parent: treeData,
                level: 1,
                _indexInVisible: 0,
              })
            } else {
              let next = visibleInfos[index + 1]
              if (next?.isPlaceholder) {
                next = visibleInfos[index + 2]
              }
              const parentMinLevel = next ? next.level - 1 : 0
              // find all droppable positions
              const availablePositionsLeft: { parentInfo: TreeNodeInfo }[] = [];
              const availablePositionsRight: typeof availablePositionsLeft = [];
              let cur = closest
              while (cur && cur.level >= parentMinLevel) {
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
                let oldIndex = placeholderInfo?._indexInVisible
                if (oldIndex != null && oldIndex < targetIndex) {
                  targetIndex--
                }
                Object.assign(newPlaceholderInfo, {
                  parent: placeholderLevelPosition.parentInfo.node,
                  level: placeholderLevelPosition.parentInfo.level + 1,
                  _indexInVisible: targetIndex
                })
              } else {
                // @ts-ignore
                newPlaceholderInfo = null
              }
            }
            // @ts-ignore
            setplaceholderInfo(newPlaceholderInfo)
            if (newPlaceholderInfo) {
              e.preventDefault(); // call mean droppable
            }
          },
          onDrop(e) {
            e.preventDefault();
          },
          onDragEnter(e) {
            setdragOverNode(info.node)
          },
          onDragLeave(e) {
            setdragOverNode(undefined)
          },
          'data-key': info.key,
          'data-level': info.level,
        }
      } as TreeNodeInfo)
    }
    function getDroppable(node: RecordStringUnknown): boolean {
      const isClose = foldable && node !== treeData && !node[OPEN]
      if (isClose) {
        return false
      }
      let droppable = isNodeDroppable?.(node, draggedNode)
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
    return { visibleInfos }
  }, [
    // watch placeholder position
    placeholderInfo?.parent, placeholderInfo?._indexInVisible,
    // watch arguments
    useTreeDataReturn.flatInfos, useTreeDataReturn.infoByNodeMap, treeData, foldable, OPEN, CHILDREN, indent, customDragTrigger, isNodeDroppable,
  ])
  return { draggedNode, dragOverNode, visibleInfos, virtualList }
}

export const HeTree = function HeTree(props: HeTreeProps) {
  const KEY = props.keyKey!
  const CHILDREN = props.childrenKey!
  const OPEN = props.openKey!
  const CHECKED = props.checkedKey!
  const indent = props.indent!
  const foldable = Boolean(props.foldable)
  const customDragTrigger = Boolean(props.customDragTrigger)
  const { treeData, isNodeDraggable, isNodeDroppable, } = props
  // flat treeData and info
  // info.children does not include placeholder
  const useTreeDataReturn = _useTreeData({ treeData, CHECKED, CHILDREN, OPEN, KEY, isNodeDraggable })
  const { flatInfos, infoByNodeMap } = useTreeDataReturn
  const { draggedNode, dragOverNode, visibleInfos, virtualList } = _useDraggable({ useTreeDataReturn, treeData, foldable, OPEN, CHILDREN, indent, customDragTrigger, isNodeDroppable })
  // 
  const renderPlaceholder = (info: TreeNodeInfo) => {
    return <div className="tree-drag-placeholder" ></div>
  }
  // 
  return <VirtualList ref={virtualList} items={visibleInfos} virtual={false}
    renderItem={(info, index) => (
      <div className="tree-node-box" {...info.attrs} >
        {!info.isPlaceholder ? props.renderNode(info) : renderPlaceholder(info)}
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

function calculateDistance(x1: number, y1: number, x2: number, y2: number) {
  return Math.sqrt(Math.pow((x2 - x1), 2) + Math.pow((y2 - y1), 2));
}

// : Generator<{node:T, parent: T|null}>
export function* traverseTreeNode<T>(node: T, childrenKey = 'children', parent: T | null = null): Generator<{ node: T, parent: T | null, skipChildren: () => void }> {
  let _skipChildren = false
  const skipChildren = () => { _skipChildren = true }
  yield { node, parent, skipChildren }
  if (_skipChildren) {
    return
  }
  // @ts-ignore
  const children: T[] = node[childrenKey]
  if (children?.length > 0) {
    yield* traverseTreeChildren(children, childrenKey, node)
  }
}

export function* traverseTreeChildren<T>(children: T[], childrenKey = 'children', parent: T | null = null): ReturnType<typeof traverseTreeNode<T>> {
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
