import "./HeTree.css";
import React, { useEffect, useMemo, useState, useRef, ReactNode, useCallback, useImperativeHandle } from "react";
import * as hp from "helper-js";
import { VirtualList, VirtualListHandle, FixedForwardRef } from "./VirtualList";
import type { } from 'type-fest';

const forwardRef = React.forwardRef as FixedForwardRef

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

// single instance ==================================
const dragOverInfo = {
  id: null as any,
  x: 0,
  y: 0,
  time: 0,
}

// react hooks ==================================
export const defaultProps_useTreeData = {
  idKey: 'id',
  parentIdKey: 'parentId',
  childrenKey: 'children',
  flat: false,
}
export function useTreeData<T extends Record<string, any>>(prop0: {
  data: T[],
} & Partial<typeof defaultProps_useTreeData>) {
  const props = { ...defaultProps_useTreeData, ...prop0 }
  const { idKey: ID, parentIdKey: PID, childrenKey: CHILDREN } = props
  const memoizedValue = useMemo(
    () => {

    }, []
  );
}
export const defaultProps = {
  /**
   * 
   */
  idKey: 'id',
  parentIdKey: 'parentId',
  indent: 20,
  dragOpen: false,
  dragOpenDelay: 600,
  placeholderId: '__DRAG_PLACEHOLDER__',
}

export function useTree<T extends Record<string, any>>(
  props0: {
    data: T[],
    isOpen?: (node: T) => boolean,
    isChecked?: (node: T) => boolean | null,
    isFunctionReactive?: boolean,
    renderNode: (stat: Stat<T>) => ReactNode,
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
  } & Partial<typeof defaultProps>
) {
  const props = { ...defaultProps, ...props0 }
  const { idKey: ID, parentIdKey: PID, isFunctionReactive } = props
  // mainCache ==================================
  const mainCache = useMemo(
    () => {
      const stats: Record<Id, Stat<T>> = {}
      const nodes: Record<Id, T> = {}
      const openedIds: Id[] = []
      const checkedIds: Id[] = []
      const semiCheckedIds: Id[] = []
      const rootIds: Id[] = []
      const rootNodes: T[] = []
      const rootNodeStats: Stat<T>[] = []
      // 
      const tasks: Record<Id, (parentStat: Stat<T>) => void> = {}
      const addTask = (pid: Id, task: (parentStat?: Stat<T>) => void) => {
        const parentStat = stats[pid]
        if (parentStat) {
          task(parentStat)
        } else {
          const old = tasks[pid]
          tasks[pid] = (parentStat) => {
            old?.(parentStat)
            task(parentStat)
          }
        }
      }
      const removeTask = (id: Id) => {
        tasks[id]?.(stats[id])
        delete tasks[id]
      }
      // 
      for (const node of props.data) {
        const id = node[ID] as Id
        const pid = node[PID] as Id
        const parent = nodes[pid] || null
        addTask(pid, () => {

        })
        const parentStat = stats[pid] || null;
        const childIds: Id[] = []
        const children: T[] = []
        const childStats: Stat<T>[] = []
        let siblingIds, siblings, siblingStats
        if (!parentStat) {
          siblingIds = rootIds
          siblings = rootNodes
          siblingStats = rootNodeStats
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
          rootNodeStats.push(stat)
        }
        if (stat.open) {
          openedIds.push(id)
        }
        if (stat.checked) {
          checkedIds.push(id)
        } else if (stat.checked === null) {
          semiCheckedIds.push(id)
        }
      }
      // after stats ready
      for (const stat of Object.values(stats)) {
        let draggable = props.canDrag?.(stat) ?? null
        if (draggable === null) {
          draggable = stat.parentStat ? stat.parentStat.draggable : true
        }
        stat.draggable = draggable
        if (!draggable) {
          console.log(stat);

        }
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
      function* traverseChildNodesIncludingSelf(node?: T | null) {
        let _skip = false
        const skip = () => { _skip = true }
        yield* walk(node)
        function* walk(node?: T | null): Generator<{ node: T, stat: Stat<T>, skip: () => void }> {
          let childIds: Id[]
          if (node) {
            const stat = stats[node[ID]]
            yield { node, stat, skip }
            childIds = stat.childIds
          } else {
            childIds = rootIds
          }
          if (_skip) {
            _skip = false
          } else {
            for (const childId of childIds) {
              const child = nodes[childId]
              yield* walk(child)
            }
          }
        }
      }
      function* traverseParentsIncludingSelf(node?: T | null) {
        while (node) {
          const stat = stats[node[ID]]
          yield { node, stat }
          node = nodes[stat.pid!]
        }
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
        rootIds, rootNodes, rootNodeStats,
        // methods
        getStat,
        traverseChildNodesIncludingSelf,
        traverseParentsIncludingSelf,
        resolveChecked,
      }
    }, [props.data, ID, PID,
    isFunctionReactive && props.isOpen,
    isFunctionReactive && props.isChecked,
    isFunctionReactive && props.canDrag,
  ]);
  const { stats, nodes, traverseChildNodesIncludingSelf, rootIds, getStat } = mainCache;
  // about drag ==================================
  const indent = props.indent!
  const [draggedStat, setdraggedStat] = useState<Stat<T>>();
  const [dragOverStat, setdragOverStat] = useState<Stat<T>>();
  const virtualList = useRef<VirtualListHandle>(null);
  const [placeholder, setplaceholder] = useState<{ parentStat: Stat<T> | null, level: number, index: number, } | null>();
  const isExternal = !draggedStat
  const cacheForVisible = useMemo(
    () => {
      const visibleIds: Id[] = []
      const attrsList: (React.HTMLProps<HTMLDivElement> & { 'data-key': string, 'data-level': string, 'data-node-box': boolean, 'data-drag-placeholder'?: boolean })[] = []
      for (const { stat, skip } of traverseChildNodesIncludingSelf()) {
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
        if (!stat.open) {
          skip()
        }
      }
      if (placeholder) {
        // get placeholder's index in visibleIds
        let indexInVisible = placeholder.parentStat ? visibleIds.indexOf(placeholder.parentStat.id) : 0
        const until = getStat((placeholder.parentStat?.childIds || rootIds)[placeholder.index])
        for (const { stat, node, skip } of traverseChildNodesIncludingSelf(placeholder.parentStat?.node)) {
          if (stat === until) {
            break
          }
          indexInVisible++
          if (!stat.open) {
            skip()
          }
        }
        console.log(indexInVisible, placeholder.index);
        // 
        visibleIds.splice(indexInVisible, 0, props.placeholderId)
        // @ts-ignore
        const placeholderAttrs = createAttrs({
          id: props.placeholderId,
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
            if (props.customDragImage) {
              props.customDragImage(e, stat)
            } else {
              // setDragImage
              let cur = e.target as HTMLElement
              const nodeBox = hp.findParent(cur, (el) => el.hasAttribute('data-node-box'), { withSelf: true })
              const node = nodeBox.children[0]
              e.dataTransfer.setDragImage(node, 0, 0);
            }
            setTimeout(() => {
              setdraggedStat(stat)
              setplaceholder({
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
            const nodeBoxEl = hp.findParent(e.target, (el) => el.hasAttribute('data-node-box'), { withSelf: true })
            // node start position
            const nodeX = nodeBoxEl.getBoundingClientRect().x
            let placeholderLevel = Math.ceil((e.pageX - nodeX) / indent) // use this number to detect placeholder position. >= 0: prepend. < 0: after.}
            placeholderLevel = hp.between(placeholderLevel, 0, (closest?.level || 0) + 1)
            if (!atTop && !isPlaceholder && closest.id === rootIds[0]) {
              // chekc if at top
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
              while (cur && cur.level >= parentMinLevel) {
                const index = getTargetIndex(cur, next)
                if (getDroppable(cur, index)) {
                  (placeholderLevel > cur.level ? availablePositionsLeft : availablePositionsRight).unshift({
                    parentStat: cur,
                    index,
                  })
                }
                cur = cur.parentStat!
              }
              let placeholderPosition = hp.arrayLast(availablePositionsLeft)
              if (!placeholderPosition) {
                placeholderPosition = hp.arrayFirst(availablePositionsRight)
              }
              if (placeholderPosition) {
                newPlaceholder = {
                  parentStat: placeholderPosition.parentStat,
                  level: (placeholderPosition.parentStat?.level ?? 0) + 1,
                  index: placeholderPosition.index,
                }
              } else {
                // 
              }
            }
            setplaceholder(newPlaceholder)
            if (newPlaceholder) {
              e.preventDefault(); // call mean droppable
            }
            !isPlaceholder && setdragOverStat(undefined)
            props.onDragOver?.(e, stat, isExternal)
          },
          onDragLeave(e) {
            !isPlaceholder && setdragOverStat(undefined)
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
          setplaceholder({
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
          // if (!isExternal) {
          //   if (draggedStat.parentStat === placeholder.parentStat && targetIndexInSiblings > draggedStat.index) {
          //     targetIndexInSiblings--
          //   }
          // }
          if (props.onDrop?.(e, placeholder.parentStat, targetIndexInSiblings, isExternal) === false) {
            customized = true
          }
          if (!customized && !isExternal) {
            // move node
            const newData = props.data.slice()
            // index in data
            const startIndex = newData.indexOf(draggedStat.node) // drag start index
            let targetIndex = (placeholder.parentStat ? newData.indexOf(placeholder.parentStat.node) + 1 : 0) + targetIndexInSiblings
            let draggedCount = [...traverseChildNodesIncludingSelf(draggedStat.node)].length
            if (startIndex < targetIndex) {
              targetIndex -= draggedCount
              console.log('--');

            }
            console.log(startIndex, targetIndex, targetIndexInSiblings, 'x');
            const moved = newData.splice(startIndex, draggedCount)
            newData.splice(targetIndex, 0, ...moved)
            newData[targetIndex] = { ...draggedStat.node, [PID]: placeholder.parentStat?.id ?? null }
            console.log(newData[targetIndex]);

            props.onChange(newData)
          }
        }
        if (!customized) {
          e.preventDefault();
        }
        setdragOverStat(undefined);
        setdraggedStat(undefined);
        setplaceholder(undefined);
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
        const isPlaceholderOrDraggedNode = (id: Id) => id === props.placeholderId || getStat(id) === draggedStat
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
      function getTargetIndex(targetParentInfo: Stat<T>, next: Stat<T> | undefined) {
        let index = targetParentInfo.children.length
        if (next && next.parent === targetParentInfo.node) {
          index = targetParentInfo.children.indexOf(next.node)
        }
        return index
      }
      return { visibleIds, attrsList, onDragOverRoot, onDropToRoot }
    }, [mainCache, indent, draggedStat,
    // watch placeholder position
    placeholder?.parentStat, placeholder?.index,
    // watch props
    indent, props.placeholderId,
    // watch func
    ...([props.canDrop, props.canDropToRoot, props.customDragImage, props.onDragStart, props.onDragOver, props.onExternalDrag, props.onDrop, props.onDragEnd, props.onChange].map(func => isFunctionReactive && func)),
  ])
  return {
    ...mainCache, ...cacheForVisible,
    virtualList,
    // drag states
    draggedStat, dragOverStat, placeholder, isExternal,
  }
}

// react components ==================================
export const HeTree = <T extends Record<string, any>,>(props: ReturnType<typeof useTree<T>>) => {
  const { draggedStat, visibleIds } = props
  const persistentIndices = useMemo(() => draggedStat ? [visibleIds.indexOf(draggedStat.id)] : [], [draggedStat, visibleIds]);
  // const renderPlaceholder = (info: TreeNodeInfo<T>) => {
  //   return <div className="tree-drag-placeholder" ></div>
  // }
  // 
  return (
    <div className="he-tree" onDragOver={props.onDragOverRoot} onDrop={props.onDropToRoot}>
      <VirtualList<Id> ref={props.virtualList} items={props.visibleIds} virtual={false} persistentIndices={persistentIndices}
        renderItem={(id, index) => (
          <div {...props.attrsList[index]}>
            {
              id === '__DRAG_PLACEHOLDER__' ? <div className="tree-drag-placeholder" ></div> :
                <div>{props.getStat(id).node.name}-{props.getStat(id).level}-{id}</div>
            }
          </div>
        )}
      />
    </div>
  )
}
// utils methods ==================================

export function* traverseTreeData<T>(
  treeData: T[],
  childrenKey = 'children',
): Generator<{ node: T, parent: T | null, siblings: T[], index: number, skip: () => void }> {
  let _skipChildren = false
  const skip = () => { _skipChildren = true }
  yield* walk(treeData, null)
  // @ts-ignore
  function* walk(arr: T[], parent: T | null) {
    let index = 0
    for (const node of arr) {
      const siblings = arr
      yield { node, parent, siblings, index, skip }
      index++
      if (_skipChildren) {
        _skipChildren = false
      } else {
        // @ts-ignore
        const children: T[] = node[childrenKey]
        if (children) {
          yield* walk(children, node)
        }
      }
    }
  }
}

function calculateDistance(x1: number, y1: number, x2: number, y2: number) {
  return Math.sqrt(Math.pow((x2 - x1), 2) + Math.pow((y2 - y1), 2));
}


