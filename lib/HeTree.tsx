import "./HeTree.css";
import React, { useEffect, useMemo, useState, useRef, ReactNode, useCallback, useImperativeHandle } from "react";
import * as hp from "helper-js";
import { VirtualList, VirtualListHandle } from "./VirtualList";

// types ==================================
export type Id = string | number
export type Checked = boolean | null
export interface Stat<T> {
  id: Id,
  pid: Id | null,
  childIds: Id[],
  siblingIds: Id[],
  index: number,
  level: number,
  node: T,
  parent: T | null,
  parentStat: Stat<T> | null,
  children: T[],
  childStats: Stat<T>[],
  siblings: T[],
  siblingStats: Stat<T>[],
  _isStat?: boolean,
  open: boolean,
  checked: Checked,
  draggable: boolean,
}

export type NodeAttrs = { 'data-key': string, 'data-level': string, 'data-node-box': boolean, 'data-drag-placeholder'?: boolean } & React.HTMLProps<HTMLDivElement>

// single instance ==================================
const dragOverInfo = {
  id: null as any,
  x: 0,
  y: 0,
  time: 0,
}

// react hooks ==================================
export const defaultProps = {
  /**
   * 
   */
  idKey: 'id',
  parentIdKey: 'parentId',
  childrenKey: 'children',
  indent: 20,
  dragOpen: false,
  dragOpenDelay: 600,
  placeholderId: '__DRAG_PLACEHOLDER__',
  dataType: 'flat' as 'tree' | 'flat',
  rootId: null as any,
}

export interface HeTreeProps<T extends Record<string, any>> extends Partial<typeof defaultProps> {
  data: T[],
  isOpen?: (node: T) => boolean,
  isChecked?: (node: T) => boolean | null,
  isFunctionReactive?: boolean,
  renderNode?: (stat: Stat<T>) => ReactNode,
  renderNodeBox?: (info: { stat: Stat<T>, attrs: NodeAttrs, isPlaceholder: boolean }) => ReactNode,
  canDrag?: (stat: Stat<T>) => boolean | null | undefined | void,
  canDrop?: (stat: Stat<T>, index?: number) => boolean | null | undefined | void,
  canDropToRoot?: (index?: number) => boolean,
  customDragImage?: (e: React.DragEvent<HTMLElement>, stat: Stat<T>) => void,
  onDragStart?: (e: React.DragEvent<HTMLElement>, stat: Stat<T>) => void,
  onDragOver?: (e: React.DragEvent<HTMLElement>, stat: Stat<T>, isExternal: boolean) => void,
  onExternalDrag?: (e: React.DragEvent<HTMLElement>) => boolean,
  onDrop?: (e: React.DragEvent<HTMLElement>, parentStat: Stat<T> | null, index: number, isExternal: boolean) => boolean | void,
  onDragEnd?: (e: React.DragEvent<HTMLElement>, stat: Stat<T>, isOutside: boolean) => void,
  onChange: (data: T[]) => void,
  onDragOpen?: (stat: Stat<T>) => void,
}

export function useHeTree<T extends Record<string, any>>(
  props0: HeTreeProps<T>
) {
  const props = { ...defaultProps, ...props0 }
  const { idKey: ID, parentIdKey: PID, childrenKey: CHILDREN, placeholderId, isFunctionReactive, } = props
  if (!props.renderNode && !props.renderNodeBox) {
    throw new Error("Either renderNodeBox or renderNode is required.");
  }
  // mainCache ==================================
  const mainCache = useMemo(
    () => {
      const stats: Record<Id, Stat<T>> = {} // You can't get ordered values from an object. Because Chrome doesn't support it. https://segmentfault.com/a/1190000018306931
      const nodes: Record<Id, T> = {}
      const openedIds: Id[] = []
      const checkedIds: Id[] = []
      const semiCheckedIds: Id[] = []
      const rootIds: Id[] = []
      const rootNodes: T[] = []
      const rootStats: Stat<T>[] = []
      // 
      function* simpleWalk() {
        if (props.dataType === 'flat') {
          const childrenById = new Map<Id | null, T[]>()
          childrenById.set(null, [])
          const rootNodes2 = childrenById.get(null)!
          for (const v of props.data) {
            const id = v[ID]
            childrenById.set(id, [])
          }
          for (const v of props.data) {
            const pid = v[PID]
            const siblings = childrenById.get(pid) || rootNodes2
            siblings.push(v)
          }
          function* walkArr(arr: T[]): Generator<T> {
            for (const node of arr) {
              yield node
              const id = node[ID]
              yield* walkArr(childrenById.get(id)!)
            }
          }
          yield* walkArr(rootNodes2)
        } else {
          for (const { node } of walkTreeData(props.data, CHILDREN)) {
            yield node
          }
        }
      }
      let count = 0
      for (const node of simpleWalk()) {
        const id: Id = node[ID] ?? count
        const pid = node[PID] as Id
        const parent = nodes[pid] || null
        const parentStat = stats[pid] || null;
        const childIds: Id[] = []
        const children: T[] = []
        const childStats: Stat<T>[] = []
        let siblingIds, siblings, siblingStats
        if (!parentStat) {
          siblingIds = rootIds
          siblings = rootNodes
          siblingStats = rootStats
        } else {
          siblingIds = parentStat.childIds
          siblings = parentStat.children
          siblingStats = parentStat.childStats
        }
        const index = siblingIds.indexOf(id)
        const level = parentStat?.level + 1 || 1
        const stat = {
          _isStat: true,
          id,
          pid,
          childIds,
          siblingIds,
          node,
          parent,
          parentStat,
          children,
          childStats,
          siblings,
          siblingStats,
          index,
          level,
          open: props.isOpen ? props.isOpen(node) : true,
          checked: props.isChecked ? props.isChecked(node) : false,
          draggable: false,
        }
        stats[id] = stat
        nodes[id] = node
        if (parentStat) {
          parentStat.childIds.push(id)
          parentStat.children.push(node)
          parentStat.childStats.push(stat)
        } else {
          rootIds.push(id)
          rootNodes.push(node)
          rootStats.push(stat)
        }
        if (stat.open) {
          openedIds.push(id)
        }
        if (stat.checked) {
          checkedIds.push(id)
        } else if (stat.checked === null) {
          semiCheckedIds.push(id)
        }
        count++
      }
      // after stats ready
      for (const { node: stat } of walkTreeData(rootStats, 'childStats')) {
        let draggable = props.canDrag?.(stat) ?? null
        if (draggable === null) {
          draggable = stat.parentStat ? stat.parentStat.draggable : true
        }
        stat.draggable = draggable
      }
      const getStat = (nodeOrStatOrId: T | Stat<T> | Id) => {
        let id: Id
        if (typeof nodeOrStatOrId === 'object') {
          // @ts-ignore
          id = nodeOrStatOrId._isStat ? nodeOrStatOrId.id : nodeOrStatOrId[ID]
        } else {
          id = nodeOrStatOrId
        }
        return stats[id]
      }
      let draft: T[] | null = null
      function getDraft() {
        if (!draft) {
          const map = new Map<Stat<T> | null, T[]>()
          map.set(null, [])
          draft = map.get(null)!
          for (const { node: stat, parent: parentStat } of walkTreeData(rootStats, 'childStats')) {
            const newNode = { ...stat.node, [CHILDREN]: [] }
            map.set(stat, newNode[CHILDREN])
            map.get(parentStat)!.push(newNode)
          }
        }
        return draft
      }
      function nextData() {
        const draft = getDraft()
        let result = draft
        if (props.dataType === 'flat') {
          result = [];
          for (const { node, parent } of walkTreeData(draft, CHILDREN)) {
            // @ts-ignore
            node[PID] = parent ? parent[ID] : props.rootId
            result.push(node)
          }
        }
        return result
      }
      function resolveChecked(node: T, checked: boolean) {
        const ckSet = new Set(checkedIds);
        const semiSet = new Set(semiCheckedIds);
        const t: Record<Id, Checked> = {}
        const update = (id: Id, checked: Checked) => {
          t[id] = checked
          if (checked === null) {
            ckSet.delete(id)
            semiSet.add(id)
          } else {
            ckSet[checked ? 'add' : 'delete'](id)
            semiSet.delete(id)
          }
        }
        // children
        for (const { stat } of traverseChildNodesIncludingSelf(node)) {
          update(stat.id, checked)
        }
        // parents
        for (const { stat } of traverseParentsIncludingSelf(getStat(node)!.parent)) {
          let allChecked = true
          let hasChecked = false
          for (const childStat of stat.childStats) {
            const childChecked = t[childStat.id] !== undefined ? t[childStat.id] : childStat.checked
            if (childChecked) {
              hasChecked = true
            } else {
              allChecked = false
            }
          }
          const checked = allChecked ? true : (hasChecked ? null : false)
          update(stat.id, checked)
        }
        return {
          checkedIds: Array.from(ckSet),
          semiCheckedIds: Array.from(semiSet),
        }
      }
      return {
        stats, nodes, openedIds, checkedIds, semiCheckedIds,
        // root
        rootIds, rootNodes, rootStats,
        // methods
        getStat,
        resolveChecked,
        getDraft,
        nextData,
      }
    }, [props.data, props.dataType, ID, PID, props.rootId,
    isFunctionReactive && props.isOpen,
    isFunctionReactive && props.isChecked,
    isFunctionReactive && props.canDrag,
  ]
  );
  const { stats, nodes, rootIds, rootStats, getStat, getDraft, nextData } = mainCache;
  // about drag ==================================
  const indent = props.indent!
  const [draggedStat, setDraggedStat] = useState<Stat<T>>();
  const [dragOverStat, setDragOverStat] = useState<Stat<T>>();
  const virtualList = useRef<VirtualListHandle>(null);
  const [placeholder, setPlaceholder] = useState<{ parentStat: Stat<T> | null, level: number, index: number, height: number } | null>();
  const isExternal = !draggedStat
  const cacheForVisible = useMemo(
    () => {
      const visibleIds: Id[] = []
      const attrsList: NodeAttrs[] = [];
      for (const { node: stat, skipChildren } of walkTreeData(rootStats, 'childStats')) {
        const attr = createAttrs(stat)
        if (stat === draggedStat) {
          // hide dragged node but don't remove it. Because dragend event won't be triggered if without it.
          Object.assign(attr.style!, {
            position: 'fixed',
            top: 0,
            left: 0,
            pointerEvents: 'none',
            zIndex: '-999999999',
            visibility: 'hidden',
          })
        }
        attrsList.push(attr)
        visibleIds.push(stat.id)
        if (!stat.open || stat === draggedStat) {
          skipChildren()
        }
      }
      if (placeholder) {
        const toIndexInVisible = (parentStat: Stat<T> | null, index: number) => {
          let find = (parentStat?.childStats || rootStats)[index];
          let finalIndex
          if (find) {
            finalIndex = visibleIds.indexOf(find.id)
          } else {
            const getNext = (stat: Stat<T>) => stat.siblingStats[stat.siblingStats.indexOf(stat) + 1];
            let next
            if (parentStat) {
              for (const stat of walkParents(parentStat, 'parentStat', { withSelf: true })) {
                next = getNext(stat);
                if (next) {
                  break;
                }
              }
            }
            if (next) {
              finalIndex = visibleIds.indexOf(next.id)
            } else {
              finalIndex = visibleIds.length
            }
          }
          return finalIndex
        }
        // get placeholder's index in visibleIds
        const indexInVisible = toIndexInVisible(placeholder.parentStat, placeholder.index)
        // 
        visibleIds.splice(indexInVisible, 0, placeholderId)
        // @ts-ignore
        const placeholderAttrs = createAttrs({
          id: placeholderId,
          level: placeholder.level,
        }, true)
        placeholderAttrs['data-drag-placeholder'] = true
        attrsList.splice(indexInVisible, 0, placeholderAttrs)
      }
      function createAttrs(stat: Stat<T>, isPlaceholder = false): typeof attrsList[0] {
        return {
          key: stat.id,
          draggable: stat.draggable,
          style: { paddingLeft: (stat.level - 1) * indent + 'px' },
          'data-key': stat.id + '',
          'data-level': stat.level + '',
          'data-node-box': true,
          onDragStart(e) {
            // @ts-ignore
            if (e._handledByNode) {
              return
            }
            if (isPlaceholder) {
              e.preventDefault() // prevent drag
              return
            }
            // prevent if triggered by nested parent
            const el = e.target as HTMLElement
            if (el.querySelector(`[draggable=true]`)) {
              e.preventDefault() // prevent drag
              return
            }
            // @ts-ignore
            e._handledByNode = true // make parent ignore this event
            // 
            e.dataTransfer!.setData("text", "he-tree"); // set data to work in Chrome Android
            // TODO 拖拽类型识别
            e.dataTransfer!.dropEffect = 'move'
            const nodeBox = hp.findParent(e.target as HTMLElement, (el) => el.hasAttribute('data-node-box'), { withSelf: true })
            if (props.customDragImage) {
              props.customDragImage(e, stat)
            } else {
              // setDragImage
              const node = nodeBox.children[0]
              e.dataTransfer.setDragImage(node, 0, 0);
            }
            setTimeout(() => {
              setDraggedStat(stat)
              setPlaceholder({
                ...placeholder!,
                parentStat: stat.parentStat,
                level: stat.level,
                index: (stat.parentStat?.childIds || rootIds).indexOf(stat.id),
              })
            }, 0)
            props.onDragStart?.(e, stat)
            // listen dragend. dragend only trigger in dragstart window
            const onDragEnd = (e: DragEvent) => {
              // TODO
              window.removeEventListener('dragend', onDragEnd);
            }
            window.addEventListener('dragend', onDragEnd);
          },
          onDragOver(e) {
            if (isExternal && !props.onExternalDrag?.(e)) {
              return
            }
            // @ts-ignore
            e._handledByNode = true // make root ignore this event
            // dragOpen ========================
            const shouldDragOpen = () => {
              if (!props.dragOpen) {
                return false
              }
              if (isPlaceholder) {
                return false
              }
              if (!stat.open) {
                return false
              }
              const refresh = () => Object.assign(dragOverInfo, { id: stat.id, x: e.pageX, y: e.pageY, time: Date.now() })
              if (dragOverInfo.id !== stat.id) {
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
              props.onDragOpen!(stat)
            }
            // dragOpen end ========================
            let t = findClosestAndNext(stat, isPlaceholder)
            const { closest, next } = t

            let { atTop } = t
            const listRoot = virtualList.current!.getRootElement()
            // @ts-ignore
            const nodeBox = hp.findParent(e.target, (el) => el.hasAttribute('data-node-box'), { withSelf: true })
            // node start position
            const nodeX = nodeBox.getBoundingClientRect().x
            let placeholderLevel = Math.ceil((e.pageX - nodeX) / indent) // use this number to detect placeholder position. >= 0: prepend. < 0: after.}
            placeholderLevel = hp.between(placeholderLevel, 0, (closest?.level || 0) + 1)
            if (!atTop && !isPlaceholder && closest.id === rootIds[0]) {
              // check if at top
              const topNodeElement = listRoot.querySelector(`[data-key="${closest.id}"]`)
              if (topNodeElement) {
                const rect = topNodeElement.getBoundingClientRect()
                atTop = rect.y + rect.height / 2 > e.pageY
              }
            }
            if (atTop) {
              placeholderLevel = 0
            }
            //
            let newPlaceholder: typeof placeholder
            if (atTop) {
              newPlaceholder = {
                ...placeholder!,
                parentStat: null,
                level: 1,
                index: 0,
              }
            } else {
              const parentMinLevel = next ? next.level - 1 : 0
              // find all droppable positions
              const availablePositionsLeft: { parentStat: Stat<T>, index: number }[] = [];
              const availablePositionsRight: typeof availablePositionsLeft = [];
              let cur = closest
              const curLevel = () => cur ? cur.level : 0
              while (curLevel() >= parentMinLevel) {
                const index = getTargetIndex(cur, next)
                if (getDroppable(cur, index)) {
                  (placeholderLevel > curLevel() ? availablePositionsLeft : availablePositionsRight).unshift({
                    parentStat: cur,
                    index,
                  })
                }
                if (!cur) {
                  break
                }
                cur = cur.parentStat!
              }
              let placeholderPosition = hp.arrayLast(availablePositionsLeft)
              if (!placeholderPosition) {
                placeholderPosition = hp.arrayFirst(availablePositionsRight)
              }
              if (placeholderPosition) {
                newPlaceholder = {
                  ...placeholder!,
                  parentStat: placeholderPosition.parentStat,
                  level: (placeholderPosition.parentStat?.level ?? 0) + 1,
                  index: placeholderPosition.index,
                }
              } else {
                // 
              }
            }
            setPlaceholder(newPlaceholder)
            if (newPlaceholder) {
              e.preventDefault(); // call mean droppable
            }
            !isPlaceholder && setDragOverStat(undefined)
            props.onDragOver?.(e, stat, isExternal)
          },
          onDragLeave(e) {
            !isPlaceholder && setDragOverStat(undefined)
          },
        }
      }
      const onDragOverRoot: React.DragEventHandler<HTMLElement> = (e) => {
        // @ts-ignore
        if (e._handledByNode) {
          return
        }
        // ignore if has visible tree node
        if (visibleIds.length > 0) {
          return
        }
        if (isExternal && !props.onExternalDrag?.(e)) {
          return
        }
        if (getDroppable(null, 0)) {
          setPlaceholder({
            ...placeholder!,
            parentStat: null,
            level: 1,
            index: 0,
          })
          e.preventDefault(); // droppable
        }
      }
      const onDropToRoot: React.DragEventHandler<HTMLElement> = (e) => {
        if (isExternal && !props.onExternalDrag?.(e)) {
          return
        }
        let customized = false
        if (placeholder) {
          const { index: targetIndexInSiblings } = placeholder
          if (props.onDrop?.(e, placeholder.parentStat, targetIndexInSiblings, isExternal) === false) {
            customized = true
          }
          if (!customized && !isExternal) {
            // move node
            const draft = getDraft()
            let draggedSiblings: T[], targetSiblings: T[]
            if (!placeholder.parentStat) {
              targetSiblings = draft
            }
            let draggedNodeDraft: T
            for (const { node, siblings } of walkTreeData(draft, CHILDREN)) {
              if (node[ID] === draggedStat.id) {
                draggedSiblings = siblings
                draggedNodeDraft = node
              }
              if (!targetSiblings! && node[ID] === placeholder.parentStat!.id) {
                targetSiblings = node[CHILDREN]
              }
              if (draggedSiblings! && targetSiblings!) {
                break
              }
            }
            const ds = draggedSiblings!
            const ts = targetSiblings!
            const startIndex = ds.findIndex(v => v[ID] === draggedStat.id)
            let targetIndex = placeholder.index
            // check index
            if (ds === ts && placeholder.index > startIndex) {
              targetIndex -= 1
            }
            // remove from start position
            ds.splice(startIndex, 1)
            // move to target position
            ts.splice(targetIndex, 0, draggedNodeDraft!)
            props.onChange(nextData())
          }
        }
        if (!customized) {
          e.preventDefault();
        }
        setDragOverStat(undefined);
        setDraggedStat(undefined);
        setPlaceholder(undefined);
      }
      function getDroppable(stat: Stat<T> | null, index?: number): boolean {
        if (!stat) {
          return props.canDropToRoot?.(index) ?? true
        }
        if (!stat.open) {
          return false
        }
        let droppable = props.canDrop?.(stat, index)
        if (droppable == undefined) {
          droppable = getDroppable(stat.parentStat)
        }
        return droppable
      }
      /**
       * find closest and next node stat
       */
      function findClosestAndNext(stat: Stat<T>, isPlaceholder: boolean) {
        let closest = stat
        let index = visibleIds.indexOf(stat.id) // index of closest node
        let atTop = false
        const isPlaceholderOrDraggedNode = (id: Id) => id === placeholderId || getStat(id) === draggedStat
        const find = (startIndex: number, step: number) => {
          let i = startIndex, cur
          do {
            i += step
            cur = visibleIds[i]
          } while (cur && isPlaceholderOrDraggedNode(cur));
          return { id: cur, i }
        }
        const findAndAssign = (startIndex: number, dir: number) => {
          const t = find(startIndex, dir)
          closest = getStat(t.id)
          index = t.i
        }
        const NEXT = 1, PREV = -1
        if (isPlaceholder) {
          findAndAssign(index, PREV)
          if (!closest) {
            atTop = true
            findAndAssign(-1, NEXT)
          }
        }
        // next
        const next = getStat(find(index, NEXT).id)
        return { closest, atTop, next }
      }
      /**
       * calculate placeholder target index in target parent's children
       */
      function getTargetIndex(targetParentStat: Stat<T> | null, next: Stat<T> | undefined) {
        const siblingStats = targetParentStat ? targetParentStat.childStats : rootStats
        let index = siblingStats.length
        if (next && next.siblingStats === siblingStats) {
          index = siblingStats.indexOf(next)
        }
        return index
      }
      return { visibleIds, attrsList, onDragOverRoot, onDropToRoot }
    }, [mainCache, indent, draggedStat,
    // watch placeholder position
    placeholder?.parentStat, placeholder?.index,
    // watch props
    indent, placeholderId,
    // watch func
    ...([props.canDrop, props.canDropToRoot, props.customDragImage, props.onDragStart, props.onDragOver, props.onExternalDrag, props.onDrop, props.onDragEnd, props.onChange].map(func => isFunctionReactive && func)),
  ])
  const { visibleIds, attrsList, onDragOverRoot, onDropToRoot } = cacheForVisible
  const persistentIndices = useMemo(() => draggedStat ? [visibleIds.indexOf(draggedStat.id)] : [], [draggedStat, visibleIds]);
  // render
  const renderHeTree = useMemo(
    () => {
      let cached: ReactNode
      return () => {
        if (!cached) {
          let renderNodeBox = props.renderNodeBox!
          if (!renderNodeBox) {
            renderNodeBox = ({ stat, attrs, isPlaceholder }) => <div {...attrs}>
              {isPlaceholder ? <div></div> : props.renderNode!(stat)}
            </div>
          }
          // 
          cached = (
            <div className="he-tree" onDragOver={onDragOverRoot} onDrop={onDropToRoot}>
              <VirtualList<Id> ref={virtualList} items={visibleIds} virtual={false} persistentIndices={persistentIndices}
                renderItem={(id, index) => renderNodeBox({
                  stat: getStat(id)!, attrs: attrsList[index], isPlaceholder: id === placeholderId
                })}
              />
            </div>
          )
        }
        return cached
      }
    }, [cacheForVisible.visibleIds,
    isFunctionReactive && props.renderNode,
    isFunctionReactive && props.renderNodeBox,
  ]);

  return {
    ...mainCache,
    // 
    visibleIds, attrsList,
    // ref
    virtualList,
    // drag states
    draggedStat, dragOverStat, placeholder, isExternal,
    // render
    renderHeTree,
  }
}

// react components ==================================
// no components
// utils methods ==================================

export interface WalkTreeDataYield<T> {
  node: T, parent: T | null, parents: T[], siblings: T[], index: number, skipChildren: VoidFunction,
  // exitWalk: VoidFunction
}

export function* walkTreeData<T>(
  treeData: T[],
  childrenKey: string,
  // handler?: (arg: WalkTreeDataYield<T>) => void,
): Generator<WalkTreeDataYield<T>> {
  let _skipChildren = false
  let _exit = false
  const skipChildren = () => { _skipChildren = true }
  // const exitWalk = () => { _exit = true }
  // if (handler) {
  //   for (const t of walk(treeData, null, [])) {
  //     handler(t)
  //   }
  // }
  yield* walk(treeData, null, [])
  // @ts-ignore
  function* walk(arr: T[], parent: T | null, parents: T[]) {
    let index = 0
    for (const node of arr) {
      const siblings = arr
      yield {
        node, parent, parents, siblings, index, skipChildren,
        // exitWalk 
      }
      if (_exit) {
        return
      }
      index++
      if (_skipChildren) {
        _skipChildren = false
      } else {
        // @ts-ignore
        const children: T[] = node[childrenKey]
        if (children) {
          yield* walk(children, node, [...parents, node])
        }
      }
    }
  }
}

export function* walkParents<T>(
  node: T,
  parentKeyOrGetter: string | ((node: T) => T | void | undefined | null),
  options = { withSelf: false }
) {
  let cur = node
  while (cur) {
    if (cur !== node || options.withSelf) {
      yield cur
    }
    // @ts-ignore
    cur = typeof parentKeyOrGetter === 'function' ? parentKeyOrGetter(cur) : cur[parentKeyOrGetter];
  }
}

// private methods
function calculateDistance(x1: number, y1: number, x2: number, y2: number) {
  return Math.sqrt(Math.pow((x2 - x1), 2) + Math.pow((y2 - y1), 2));
}