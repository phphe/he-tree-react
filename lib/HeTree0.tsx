import "./HeTree.css";
import React, { useEffect, useMemo, useState, useRef, ReactNode, useCallback, useImperativeHandle } from "react";
import * as hp from "helper-js";
import { VirtualList, VirtualListHandle, OptionalKeys, FixedForwardRef } from "./VirtualList";

const forwardRef = React.forwardRef as FixedForwardRef

export type HeTreeProps<T extends Record<string, unknown>,> = {
  treeData: T,
  renderNode: (info: TreeNodeInfo<T>) => ReactNode,
  keyKey?: string
  isNodeDraggable?: (node: T) => boolean | null
  isNodeDroppable?: (node: T, draggedNode: T | undefined, index?: number) => boolean | null
  customDragImage?: (e: React.DragEvent<HTMLElement>, node: T) => void,
  onDragStart?: (e: React.DragEvent<HTMLElement>, node: T) => void,
  onDragOver?: (e: React.DragEvent<HTMLElement>, node: T, isExternal: boolean) => void,
  onExternalDrag?: (e: React.DragEvent<HTMLElement>) => boolean,
  onDrop?: (e: React.DragEvent<HTMLElement>, parent: T, index: number, isExternal: boolean) => boolean | void,
  onDragEnd?: (e: React.DragEvent<HTMLElement>, node: T, isOutside: boolean) => void,
  onChange?: (treeData: T) => void,
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

export type TreeNodeInfo<T extends Record<string, unknown>,> = {
  isPlaceholder: boolean,
  key: string | number,
  node: T,
  parent: T,
  children: T[],
  level: number,
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
export interface HeTreeHandle<T extends Record<string, unknown>,> {
  draggedNode: T | undefined,
  dragOverNode: T | undefined,
  infoByNodeMap: Map<T, TreeNodeInfo<T>>,
  virtualList: React.RefObject<VirtualListHandle>,
  getNodeParent: (node: T) => T | undefined,
  traverseParentsFromSelf: (
    node: T,
    getParent?: (node: T) => T | null | undefined
  ) => Generator<T>,
  updateNode: (node: T,
    newNodeOrUpdate: T | ((node: T) => void),
  ) => void,
  removeNode: (node: T) => void,
  unappliedUpdates: Map<T, T>,
}

const dragOverInfo = {
  node: null as any,
  x: 0,
  y: 0,
  time: 0,
}
type KEYS = {
  CHECKED: string, CHILDREN: string, OPEN: string, KEY: string
}

export const _useTreeData = <T extends Record<string, unknown>,>(props: HeTreeProps<T> & KEYS) => {
  const { CHECKED, CHILDREN, OPEN, KEY } = props
  const mainCache = useMemo(() => {
    const flat: TreeNodeInfo<T>[] = [];
    const resolveNode = (
      { isPlaceholder, key, node, parent, children, level, ...others }: {
        isPlaceholder: boolean,
        key: string | number,
        node: T,
        parent: T,
        children: T[], level: number,
      } & T
    ): TreeNodeInfo<T> => {
      isPlaceholder = Boolean(isPlaceholder)
      if (key == null) {
        key = flat.length // use index as key
      }
      const setOpen = (open: boolean) => {
        updateNode(node, (node) => {
          // @ts-ignore
          node[OPEN] = open
        })
      }
      const setChecked = (checked: boolean | null) => {
        const setCheckedOne = (node: T, checked: boolean | null) => {
          updateNode(node, (node) => {
            // @ts-ignore
            node[CHECKED] = checked
          })
        }
        setCheckedOne(node, checked)
        if (node[CHILDREN]) {
          // @ts-ignore
          for (const { node: child } of traverseTreeChildren<T>(node[CHILDREN], CHILDREN)) {
            setCheckedOne(child, checked)
          }
        }
        for (const parent of traverseParentsFromSelf(info.parent)) {
          // @ts-ignore
          let allChecked = true
          let hasChecked = false
          // @ts-ignore
          parent[CHILDREN].forEach(v => {
            if ((unappliedUpdates.get(v) || v)[CHECKED]) {
              hasChecked = true
            } else {
              allChecked = false
            }
          })
          setCheckedOne(parent, allChecked ? true : (hasChecked ? null : false))
        }
      }
      const draggable = getDraggable(node, parent)
      const info: TreeNodeInfo<T> = {
        isPlaceholder, key, node, parent, children, level, draggable, setOpen, setChecked, ...others,
      }
      return info
    }

    const infoByNodeMap = new Map<T, TreeNodeInfo<T>>()
    for (const { node, parent, skipChildren } of traverseTreeNode(props.treeData, CHILDREN)) {
      // @ts-ignore
      const key: string = node[KEY]
      // @ts-ignore
      const children = [];
      const parentInfo = parent && infoByNodeMap.get(parent)
      const level = parentInfo ? parentInfo.level + 1 : 0
      // @ts-ignore
      const info: TreeNodeInfo<T> = resolveNode({ key, node, parent, children, level })
      infoByNodeMap.set(node, info)
      if (parentInfo) {
        parentInfo.children.push(node)
      }
      flat.push(info)
    }
    // methods
    const getNodeParent: HeTreeHandle<T>['getNodeParent'] = (node: T) => infoByNodeMap.get(node)?.parent
    const traverseParentsFromSelf: HeTreeHandle<T>['traverseParentsFromSelf'] = function* (node, getParent) {
      let cur = node
      while (cur) {
        yield cur
        const parent = getParent ? getParent(cur) : getNodeParent(cur)
        // @ts-ignore
        cur = parent
      }
    }
    const unappliedUpdates = new Map<T, T>() // cached node updates before next update of React
    // store update to unappliedUpdates
    const storeUpdate = (node: T, newNode: T) => {
      unappliedUpdates.set(node, newNode)
      infoByNodeMap.set(newNode, infoByNodeMap.get(node)!)
    }
    const updateNode: HeTreeHandle<T>['updateNode'] = (node, newNodeOrUpdate) => {
      let newNode: T
      if (typeof newNodeOrUpdate === 'function') {
        newNode = unappliedUpdates.get(node) || { ...node }
        if (newNode[CHILDREN]) {
          // @ts-ignore
          newNode[CHILDREN] = newNode[CHILDREN].slice()
        }
        newNodeOrUpdate(newNode)
      } else {
        newNode = newNodeOrUpdate
      }
      storeUpdate(node, newNode)
      let child = node
      const parent = getNodeParent(node)
      if (parent) {
        for (const node of traverseParentsFromSelf(parent)) {
          const cachedNewNode = unappliedUpdates.get(node)
          let newNode = cachedNewNode || { ...node }
          storeUpdate(node, newNode)
          const childNew = unappliedUpdates.get(child)
          // @ts-ignore
          const index = node[CHILDREN].indexOf(child)
          if (newNode[CHILDREN] === node[CHILDREN]) {
            // @ts-ignore
            newNode[CHILDREN] = newNode[CHILDREN].slice()
          }
          // @ts-ignore
          newNode[CHILDREN][index] = childNew
          child = node
          if (cachedNewNode) {
            break
          }
        }
      }
      const newTreeData = unappliedUpdates.get(props.treeData) || unappliedUpdates.get(child)!
      props.onChange!(newTreeData)
    }
    const removeNode: HeTreeHandle<T>['removeNode'] = (node) => {
      // error when remove node is root or not in treeData
      const parent = getNodeParent(node)!
      updateNode(parent, (newParent) => {
        newParent[CHILDREN]
        // @ts-ignore
        const index = newParent[CHILDREN].indexOf(node)
        // @ts-ignore
        newParent[CHILDREN].splice(index, 1)
      })
    }
    function getDraggable(node: T, parent: T | undefined): boolean {
      let draggable: boolean | null | undefined = infoByNodeMap.get(node)?.draggable
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
    return {
      flatInfos: flat, infoByNodeMap,
      getNodeParent,
      traverseParentsFromSelf,
      updateNode,
      removeNode,
      unappliedUpdates,
    }
  }, [props.treeData, CHECKED, CHILDREN, OPEN, KEY, props.isNodeDraggable, props.onChange])
  return mainCache
}

export const _useDraggable = <T extends Record<string, unknown>,>(props: HeTreeProps<T> & ReturnType<typeof _useTreeData<T>> & KEYS
) => {
  const { CHECKED, CHILDREN, OPEN, KEY, flatInfos, infoByNodeMap } = props
  const indent = props.indent!
  const [draggedNode, setdraggedNode] = useState<T>();
  const [draggedNodeDelayed, setdraggedNodeDelayed] = useState<T>();
  const [dragOverNode, setdragOverNode] = useState<T>();
  const virtualList = useRef<VirtualListHandle>(null);
  const [placeholderInfo, setplaceholderInfo] = useState<(TreeNodeInfo<T> & { _indexInVisible: number }) | null>();
  const mainCache = useMemo(() => {
    const visibleInfos: TreeNodeInfo<T>[] = [];
    for (const { node, parent, skipChildren } of traverseTreeChildren(props.treeData[CHILDREN] as T[], CHILDREN, props.treeData)) {
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
    const isInnerDrag = () => draggedNode != null
    const onDragOverRoot: React.DragEventHandler<HTMLElement> = (e) => {
      // @ts-ignore
      if (e._handledByNode) {
        return
      }
      // ignore if has visible tree node
      if (visibleInfos.length > 0) {
        return
      }
      if (!isInnerDrag() && !props.onExternalDrag?.(e)) {
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
    function completeInfo(info: TreeNodeInfo<T>) {
      const onDragStart: TreeNodeInfo<T>['onDragStart'] = (e) => {
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
        props.onDragStart?.(e, info.node)
        // listen dragend. dragend only trigger in dragstart window
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
      Object.assign(info, {
        onDragStart,
        attrs: {
          key: info.key,
          draggable: info.draggable,
          style,
          onDragStart,
          onDragOver(e) {
            const isExternal = !isInnerDrag()
            if (isExternal && !props.onExternalDrag?.(e)) {
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
              const availablePositionsLeft: { parentInfo: TreeNodeInfo<T> }[] = [];
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
            props.onDragOver?.(e, info.node, isExternal)
          },
          onDrop(e) {
            const isExternal = !isInnerDrag()
            if (isExternal && !props.onExternalDrag?.(e)) {
              return
            }
            let customized = false
            if (placeholderInfo) {
              const { parent } = placeholderInfo
              console.log(placeholderInfo);

              // @ts-ignore
              let targetIndex: number = infoByNodeMap.get(parent)._targetIndex
              let draggedNodeIndex: number
              if (!isExternal) {
                const draggedNodeInfo = infoByNodeMap.get(draggedNode!)!
                const siblings = parent[CHILDREN] as T[]
                if (draggedNodeInfo.parent === parent) {
                  draggedNodeIndex = siblings.indexOf(draggedNode!)
                  if (targetIndex > draggedNodeIndex) {
                    targetIndex--
                  }
                }
              }
              if (props.onDrop?.(e, parent, targetIndex, isExternal) === false) {
                customized = true
              }
              if (!customized && !isExternal) {
                // move node
                props.removeNode(draggedNode!)
                props.updateNode(parent, (parent) => {
                  parent = props.unappliedUpdates.get(parent) || parent
                  if (!parent[CHILDREN]) {
                    // @ts-ignore
                    parent[CHILDREN] = []
                  }
                  // @ts-ignore
                  parent[CHILDREN].splice(targetIndex, 0, draggedNode)
                })
              }
            }
            if (!customized) {
              e.preventDefault();
            }
            setdragOverNode(undefined);
            setdraggedNode(undefined);
            setdraggedNodeDelayed(undefined);
            setplaceholderInfo(undefined);
          },
          onDragEnter(e) {
            // call setdragOverNode in onDragOver
            // setdragOverNode(info.node)
          },
          onDragLeave(e) {
            setdragOverNode(undefined)
          },
          'data-key': info.key,
          'data-level': info.level,
        }
      } as TreeNodeInfo<T>)
      if (props.customDragTrigger) {
        // @ts-ignore
        delete info.attrs.draggable; delete info.attrs.onDragStart;
      }
    }
    function getDroppable(node: T, index?: number): boolean {
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
    function findClosestAndNext(info: TreeNodeInfo<T>) {
      let closest = info
      let index = visibleInfos.indexOf(info) // index of closest node
      let atTop = false
      const isPlaceholderOrDraggedNode = (info: TreeNodeInfo<T>) => info.isPlaceholder || info.node === draggedNode
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
    function getTargetIndex(targetParentInfo: TreeNodeInfo<T>, next: TreeNodeInfo<T> | undefined) {
      let index = targetParentInfo.children.length
      if (next && next.parent === targetParentInfo.node) {
        index = targetParentInfo.children.indexOf(next.node)
      }
      return index
    }
    return { visibleInfos, onDragOverRoot }
  }, [
    draggedNodeDelayed, flatInfos, infoByNodeMap,
    // watch placeholder position
    placeholderInfo?.parent, placeholderInfo?._indexInVisible,
    // watch props
    props.treeData, props.foldable, OPEN, CHILDREN, indent, props.customDragTrigger, props.isNodeDroppable, props.customDragImage, props.onDragStart, props.onDragOver, props.onExternalDrag, props.onDrop, props.onDragEnd, props.onChange,
  ])
  const persistentIndices = useMemo(() => draggedNode ? [mainCache.visibleInfos.indexOf(infoByNodeMap.get(draggedNode)!)] : [], [draggedNode, mainCache.visibleInfos, infoByNodeMap]);
  return { draggedNode, dragOverNode, virtualList, persistentIndices, ...mainCache }
}

export const HeTree = forwardRef(function HeTree<T extends Record<string, unknown>,>(props: HeTreeProps<T>, ref: React.ForwardedRef<HeTreeHandle<T>>) {
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
  const { flatInfos, infoByNodeMap,
    traverseParentsFromSelf,
    getNodeParent,
    updateNode,
    removeNode,
    unappliedUpdates,
  } = useTreeDataReturn
  const { draggedNode, dragOverNode, virtualList, persistentIndices, visibleInfos, onDragOverRoot } = _useDraggable({ ...useTreeDataReturn, ...keys, ...props })
  // expose handle
  useImperativeHandle(ref, () => {
    return {
      draggedNode,
      dragOverNode,
      infoByNodeMap,
      virtualList,
      getNodeParent,
      traverseParentsFromSelf,
      updateNode,
      removeNode,
      unappliedUpdates,
    }
  }, [draggedNode, dragOverNode, infoByNodeMap,])
  // 
  const renderPlaceholder = (info: TreeNodeInfo<T>) => {
    return <div className="tree-drag-placeholder" ></div>
  }
  // 
  return (
    <div className="he-tree" onDragOver={onDragOverRoot}>
      <VirtualList<TreeNodeInfo<T>> ref={virtualList} items={visibleInfos} virtual={false} persistentIndices={persistentIndices}
        renderItem={(info, index) => (
          <div className="tree-node-box" {...info.attrs} >
            {!info.isPlaceholder ? props.renderNode(info) : renderPlaceholder(info)}
          </div>
        )}
      />
    </div>
  )
})

// @ts-ignore
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

// utils methods ==================================
export function* traverseTreeNode<T extends Record<string, unknown>,>(node: T, childrenKey = 'children', parent: T | null = null): Generator<{ node: T, parent: T | null, skipChildren: () => void }> {
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

export function* traverseTreeChildren<T extends Record<string, unknown>,>(children: T[], childrenKey = 'children', parent: T | null = null): ReturnType<typeof traverseTreeNode<T>> {
  for (const node of children) {
    yield* traverseTreeNode(node, childrenKey, parent)
  }
}

// utils methods end ==================================