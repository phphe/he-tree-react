import * as hp from "helper-js";

export type Id = string | number;
export type Checked = boolean | null;
export interface StatBase<T> {
  id: Id;
  pid: Id | null;
  childIds: Id[];
  siblingIds: Id[];
  index: number;
  level: number;
  node: T;
  parent: T | null;
  parentStat: StatBase<T> | null;
  children: T[];
  childStats: StatBase<T>[];
  siblings: T[];
  siblingStats: StatBase<T>[];
  _isStat?: boolean;
}

export function* walkTreeData<T>(
  treeData: T[],
  childrenKey = "children"
): Generator<{
  node: T;
  parent: T | null;
  siblings: T[];
  index: number;
  skip: () => void;
}> {
  let _skipChildren = false;
  const skip = () => {
    _skipChildren = true;
  };
  yield* walk(treeData, null);
  // @ts-ignore
  function* walk(arr: T[], parent: T | null) {
    let index = 0;
    for (const node of arr) {
      const siblings = arr;
      yield { node, parent, siblings, index, skip };
      index++;
      if (_skipChildren) {
        _skipChildren = false;
      } else {
        // @ts-ignore
        const children: T[] = node[childrenKey];
        if (children) {
          yield* walk(children, node);
        }
      }
    }
  }
}

const defaultOptions_extendTreeData = {
  flat: false,
  idKey: "id",
  parentIdKey: "parentId",
  childrenKey: "children",
};
export function extendTreeData<T extends Record<string, any>>(
  data: T[],
  options0: Partial<typeof defaultOptions_extendTreeData> & {}
) {
  const options = { ...defaultOptions_extendTreeData, ...options0 };
  const { flat, idKey: ID, parentIdKey: PID, childrenKey: CHILDREN } = options;
  let treeData: T[];
  // flat to treeData
  if (flat) {
    const map: Record<any, any> = {};
    const root: T[] = [];
    for (const v of data) {
      map[v[ID]] = { ...v, [CHILDREN]: [] };
    }
    for (const v of data) {
      const parent = map[v[PID]];
      (parent ? parent[CHILDREN] : root).push(v);
    }
    treeData = root;
  } else {
    treeData = hp.cloneTreeData(data, { childrenKey: CHILDREN });
  }
  // generate flatData
  const flatData: T[] = [];
  const stats: Record<string, StatBase<T>> = {};
  let i = 0;
  const knownIds = new Set<string>();
  const genId = (node: T, i: number) => {
    let id = "";
    for (const key in node) {
      const value = node[key];
      let tp = typeof value;
      if (tp === "string" || tp === "number") {
        id += (value + "").substring(0, 32);
      }
      if (id.length >= 100) {
        break;
      }
    }
    if (knownIds.has(id)) {
      id = i + id;
    }
    if (knownIds.has(id)) {
      id = Math.random().toString(36).substring(2, 15);
    }
    return id;
  };
  for (const { node, parent } of walkTreeData(treeData, CHILDREN)) {
    const newNode: any = { ...node };
    if (newNode[ID] == null) {
      newNode[ID] = genId(node, i);
      newNode[PID] = parent ? parent[ID] : null;
    }
    knownIds.add(newNode[ID]);
    delete newNode[CHILDREN];
    flatData.push(newNode);
    i++;
  }
  const afterChildrenChanged = (node: T | null) => {
    // const children = node? node[CHILDREN] : treeData;
    const oldStat = 
  };
  return {};
}
