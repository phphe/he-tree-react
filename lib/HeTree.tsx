import "./HeTree.css";
import React, { useEffect, useMemo, useState, useRef, ReactNode, useCallback } from "react";
import * as hp from "helper-js";
import { VirtualList, VirtualListHandle, OptionalKeys } from "./VirtualList";

type RecordStringUnknown = Record<string, unknown>

export type HeTreeProps = {
  treeData: RecordStringUnknown,
  renderNode: (info: TreeNodeInfo) => ReactNode,
  keyKey?: string
  isNodeDraggable?: (node: RecordStringUnknown) => boolean | undefined
  isNodeDroppable?: (node: RecordStringUnknown, draggedNode: RecordStringUnknown | undefined, index?: number) => boolean | undefined
  customDragImage?: (e: React.DragEvent<HTMLElement>, node: RecordStringUnknown) => void,
  onDragStart?: (e: React.DragEvent<HTMLElement>, node: RecordStringUnknown) => void,
  onExternalDrag?: (e: React.DragEvent<HTMLElement>) => boolean | undefined,
  onExternalDrop?: (e: React.DragEvent<HTMLElement>, parent: RecordStringUnknown, index: number) => void,
  onChange?: (treeData: RecordStringUnknown) => void,
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
  dragOpen: !false,
  dragOpenDelay: 600,
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
type KEYS = {
  CHECKED: string, CHILDREN: string, OPEN: string, KEY: string
}

export const _useTreeData = (props: HeTreeProps & KEYS) => {
  const { CHECKED, CHILDREN, OPEN, KEY } = props
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
      props.treeData,
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
          parentInfo.children.push(node)
        }
        flat.push(info)
      },
      { childrenKey: CHILDREN }
    );
    // methods
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
    return { flatInfos: flat, infoByNodeMap }
  }, [refreshSeed, props.treeData, CHECKED, CHILDREN, OPEN, KEY, props.isNodeDraggable,])
  return { flatInfos, infoByNodeMap }
}

export const _useDraggable = (props: { useTreeDataReturn: ReturnType<typeof _useTreeData> } & HeTreeProps & KEYS
) => {
  const { CHECKED, CHILDREN, OPEN, KEY } = props
  const { flatInfos, infoByNodeMap } = props.useTreeDataReturn
  const indent = props.indent!
  const [draggedNode, setdraggedNode] = useState<RecordStringUnknown>();
  const [draggedNodeDelayed, setdraggedNodeDelayed] = useState<RecordStringUnknown>();
  const [dragOverNode, setdragOverNode] = useState<RecordStringUnknown>();
  const virtualList = useRef<VirtualListHandle>(null);
  const [placeholderInfo, setplaceholderInfo] = useState<(TreeNodeInfo & { _indexInVisible: number }) | null>();
  const mainCache = useMemo(() => {
    const visibleInfos: TreeNodeInfo[] = [];
    for (const { node, parent, skipChildren } of traverseTreeChildren(props.treeData[CHILDREN] as RecordStringUnknown[], CHILDREN, props.treeData)) {
      const info = infoByNodeMap.get(node)!
      completeInfo(info)
      visibleInfos.push(info)
      if (props.foldable && !node[OPEN]) {
        skipChildren()
      }
    }
    if (placeholderInfo) {
      placeholderInfo.draggable = false
      completeInfo(placeholderInfo)
      visibleInfos.splice(placeholderInfo._indexInVisible, 0, placeholderInfo)
    }
    const onDragOverRoot: React.DragEventHandler<HTMLElement> = (e) => {
      // @ts-ignore
      if (e._handledByNode) {
        return
      }
      // ignore if has visible tree node
      if (visibleInfos.find(info => !info.isPlaceholder)) {
        return
      }
      if (getDroppable(props.treeData, 0)) {
        const newPlaceholderInfo = createPlaceholderInfo()
        Object.assign(newPlaceholderInfo, {
          parent: props.treeData,
          level: 1,
          _indexInVisible: 0,
        })
        // @ts-ignore
        setplaceholderInfo(newPlaceholderInfo)
        e.preventDefault();
      }
    }
    function completeInfo(info: TreeNodeInfo) {
      const onDragStart: TreeNodeInfo['onDragStart'] = (e) => {
        e.dataTransfer!.setData("text", "he-tree"); // set data to work in Chrome Android
        // TODO 拖拽类型识别
        e.dataTransfer!.dropEffect = 'move'
        if (props.customDragImage) {
          props.customDragImage(e, info.node)
        } else {
          // setDragImage
          let cur = e.target as HTMLElement
          const nodeBox = hp.findParent(cur, (el) => hp.hasClass(el, 'tree-node-box'), { withSelf: true })
          const node = nodeBox.children[0]
          e.dataTransfer.setDragImage(node, 0, 0);
        }
        props.onDragStart?.(e, info.node)
        setdraggedNode(info.node);
        setTimeout(() => {
          setdraggedNodeDelayed(info.node);
          const newPlaceholderInfo = createPlaceholderInfo()
          Object.assign(newPlaceholderInfo, {
            parent: info.node,
            level: info.level,
            // @ts-ignore
            _indexInVisible: info.parent[CHILDREN].indexOf(info.node) + 1,
          })
          // @ts-ignore
          setplaceholderInfo(newPlaceholderInfo)
        }, 0)
        // listen dragend
        const onDragEnd = (e: DragEvent) => {
          window.removeEventListener('dragend', onDragEnd);
        }
        window.addEventListener('dragend', onDragEnd);
      }
      const style: React.CSSProperties = { paddingLeft: (info.level - 1) * indent + 'px' }
      if (info.node === draggedNode) {
        // hide dragged node but don't remove it. Because dragend event won't be triggered if without it.
        Object.assign(style, {
          position: 'fixed',
          top: 0,
          left: 0,
          pointerEvents: 'none',
          zIndex: '-999999999',
          visibility: 'hidden',
        } as React.CSSProperties)
      }
      const isInnerDrag = () => draggedNode != null
      Object.assign(info, {
        onDragStart,
        attrs: {
          key: info.key,
          draggable: info.draggable,
          style,
          onDragStart,
          onDragOver(e) {
            if (!isInnerDrag() && !props.onExternalDrag?.(e)) {
              return
            }
            // @ts-ignore
            e._handledByNode = true // make root ignore this event
            // dragOpen ========================
            const shouldDragOpen = () => {
              const { node } = info
              if (!props.dragOpen) {
                return false
              }
              if (info.isPlaceholder) {
                return false
              }
              if (!props.foldable || node[OPEN]) {
                return false
              }
              const refresh = () => Object.assign(dragOverInfo, { node, x: e.pageX, y: e.pageY, time: Date.now() })
              if (dragOverInfo.node !== node) {
                refresh()
                return false
              }
              if (calculateDistance(e.pageX, e.pageY, dragOverInfo.x, dragOverInfo.y) > 10) {
                refresh()
                return false
              }
              const now = Date.now()
              if (now - dragOverInfo.time >= props.dragOpenDelay!) {
                return true
              }
            }
            if (shouldDragOpen()) {
              info.setOpen(true)
            }
            // dragOpen end ========================
            let t = findClosestAndNext(info)
            const { closest, index, next } = t
            let { atTop } = t
            const listRoot = virtualList.current!.getRootElement()
            // node start position
            const nodeX = getInnerX(listRoot, false)
            let placeholderLevel = Math.ceil((e.pageX - nodeX) / indent) // use this number to detect placeholder position. >= 0: prepend. < 0: after.}
            placeholderLevel = hp.between(placeholderLevel, 0, (closest?.level || 0) + 1)
            // @ts-ignore
            if (!atTop && !info.isPlaceholder && closest.node === props.treeData[CHILDREN][0]) {
              // chekc if at top
              const firstNodeElement = listRoot.querySelector(`.tree-node-box[data-key="${closest.key}"]`)!
              const rect = firstNodeElement.getBoundingClientRect()
              atTop = rect.y + rect.height / 2 > e.pageY
            }
            if (atTop) {
              placeholderLevel = 0
            }
            //
            let newPlaceholderInfo = createPlaceholderInfo()
            if (atTop) {
              Object.assign(newPlaceholderInfo, {
                parent: props.treeData,
                level: 1,
                _indexInVisible: 0,
              })
            } else {
              const parentMinLevel = next ? next.level - 1 : 0
              // find all droppable positions
              const availablePositionsLeft: { parentInfo: TreeNodeInfo }[] = [];
              const availablePositionsRight: typeof availablePositionsLeft = [];
              let cur = closest
              while (cur && cur.level >= parentMinLevel) {
                // @ts-ignore
                const ti = cur._targetIndex = getTargetIndex(cur, next)
                if (getDroppable(cur.node, ti)) {
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
                let targetIndex = index + 1 // index in visible infos
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
            setdragOverNode(info.node)
          },
          onDrop(e) {
            e.preventDefault();
            setdragOverNode(undefined);
            setdraggedNode(undefined);
            setdraggedNodeDelayed(undefined);
            setplaceholderInfo(undefined);
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
      if (props.customDragTrigger) {
        // @ts-ignore
        delete info.attrs.draggable; delete info.attrs.onDragStart;
      }
    }
    function getDroppable(node: RecordStringUnknown, index?: number): boolean {
      const isClose = props.foldable && node !== props.treeData && !node[OPEN]
      if (isClose) {
        return false
      }
      let droppable = props.isNodeDroppable?.(node, draggedNode, index)
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
    function createPlaceholderInfo() {
      return {
        isPlaceholder: true,
        key: '__DRAG_PLACEHOLDER__',
        node: {},
        children: [],
        parent: null,
        level: 0,
        _indexInVisible: 0,
      }
    }
    function findClosestAndNext(info: TreeNodeInfo) {
      let closest = info
      let index = visibleInfos.indexOf(info) // index of closest node
      let atTop = false
      const isPlaceholderOrDraggedNode = (info: TreeNodeInfo) => info.isPlaceholder || info.node === draggedNode
      const find = (startIndex: number, dir: number) => {
        let i = startIndex, cur
        do {
          i += dir
          cur = visibleInfos[i]
        } while (cur && isPlaceholderOrDraggedNode(cur));
        return { cur, i }
      }
      const findAndAssign = (startIndex: number, dir: number) => {
        const { cur, i } = find(startIndex, dir)
        closest = cur
        index = i
      }
      const NEXT = 1, PREV = -1
      if (info.isPlaceholder) {
        findAndAssign(index, PREV)
        if (!closest) {
          atTop = true
          findAndAssign(-1, NEXT)
        }
      }
      // next
      const next = find(index, NEXT).cur
      return { closest, index, atTop, next }
    }
    /**
     * calculate placeholder target index in target parent's children
     */
    function getTargetIndex(targetParentInfo: TreeNodeInfo, next: TreeNodeInfo | undefined) {
      let index = targetParentInfo.children.length
      if (next && next.parent === targetParentInfo.node) {
        index = targetParentInfo.children.indexOf(next.node)
      }
      return index
    }
    return { visibleInfos, onDragOverRoot }
  }, [
    draggedNodeDelayed,
    // watch placeholder position
    placeholderInfo?.parent, placeholderInfo?._indexInVisible,
    // watch props
    props.useTreeDataReturn.flatInfos, props.useTreeDataReturn.infoByNodeMap, props.treeData, props.foldable, OPEN, CHILDREN, indent, props.customDragTrigger, props.isNodeDroppable, props.customDragImage, props.onDragStart, props.onExternalDrag, props.onExternalDrop, props.onChange,
  ])
  const persistentIndices = useMemo(() => draggedNode ? [mainCache.visibleInfos.indexOf(infoByNodeMap.get(draggedNode)!)] : [], [draggedNode, mainCache.visibleInfos, infoByNodeMap]);
  return { draggedNode, dragOverNode, virtualList, persistentIndices, ...mainCache }
}

export const HeTree = function HeTree(props: HeTreeProps) {
  const keys = {
    KEY: props.keyKey!,
    CHILDREN: props.childrenKey!,
    OPEN: props.openKey!,
    CHECKED: props.checkedKey!,
  }
  const foldable = Boolean(props.foldable)
  const customDragTrigger = Boolean(props.customDragTrigger)
  const { treeData, isNodeDraggable, isNodeDroppable, dragOpen, dragOpenDelay } = props
  // flat treeData and info
  // info.children does not include placeholder
  const useTreeDataReturn = _useTreeData({ ...keys, ...props })
  const { flatInfos, infoByNodeMap } = useTreeDataReturn
  const { draggedNode, dragOverNode, virtualList, persistentIndices, visibleInfos, onDragOverRoot } = _useDraggable({ useTreeDataReturn, ...keys, ...props })
  // 
  const renderPlaceholder = (info: TreeNodeInfo) => {
    return <div className="tree-drag-placeholder" ></div>
  }
  // 
  return (
    <div className="he-tree" onDragOver={onDragOverRoot}>
      <VirtualList ref={virtualList} items={visibleInfos} virtual={false} persistentIndices={persistentIndices}
        renderItem={(info, index) => (
          <div className="tree-node-box" {...info.attrs} >
            {!info.isPlaceholder ? props.renderNode(info) : renderPlaceholder(info)}
          </div>
        )}
      />
    </div>
  )
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
