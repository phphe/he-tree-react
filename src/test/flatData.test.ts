import {
  walkFlatDataGenerator,
  walkFlatData,
  convertIndexToTreeIndexInFlatData,
  addToFlatData,
  removeByIdInFlatData,
} from "../../lib/HeTree";

test("walkFlatDataGenerator: node, treeIndex", () => {
  let data = createData();
  for (const [
    node,
    { treeIndex, parent, index, parents },
  ] of walkFlatDataGenerator(data)) {
    if (treeIndex === 3) {
      expect(node.id).toBe(10);
    }
  }
});
test("walkFlatDataGenerator: parent", () => {
  let data = createData();
  for (const [
    node,
    { treeIndex, parent, index, parents },
  ] of walkFlatDataGenerator(data)) {
    if (treeIndex === 3) {
      expect(parent!.id).toBe(5);
    }
  }
});
test("walkFlatDataGenerator: index", () => {
  let data = createData();
  for (const [
    node,
    { treeIndex, parent, index, parents },
  ] of walkFlatDataGenerator(data)) {
    if (treeIndex === 4) {
      expect(index).toBe(1);
    }
  }
});
test("walkFlatDataGenerator: parents", () => {
  let data = createData();
  for (const [
    node,
    { treeIndex, parent, index, parents },
  ] of walkFlatDataGenerator(data)) {
    if (treeIndex === 4) {
      expect(parents[0].id).toBe(1);
      expect(parents[1].id).toBe(2);
    }
  }
});
test("walkFlatDataGenerator: options", () => {
  let data = createData("key", "pid");
  for (const [
    node,
    { treeIndex, parent, index, parents },
  ] of walkFlatDataGenerator(data, { idKey: "key", parentIdKey: "pid" })) {
    if (treeIndex === 4) {
      // @ts-ignore
      expect(parents[0].key).toBe(1);
      // @ts-ignore
      expect(parents[1].key).toBe(2);
    }
  }
});
test("walkFlatDataGenerator: pid undefined", () => {
  let data = createData();
  // @ts-ignore
  data[0].parent_id = undefined;
  for (const [
    node,
    { treeIndex, parent, index, parents },
  ] of walkFlatDataGenerator(data)) {
    if (treeIndex === 0) {
      expect(parent).toBe(null);
      expect(JSON.stringify(parents)).toBe("[]");
    }
  }
});
test("walkFlatDataGenerator: pid not found", () => {
  let data = createData();
  // @ts-ignore
  data[0].parent_id = 99999999;
  for (const [
    node,
    { treeIndex, parent, index, parents },
  ] of walkFlatDataGenerator(data)) {
    if (treeIndex === 0) {
      expect(parent).toBe(null);
      expect(JSON.stringify(parents)).toBe("[]");
    }
  }
});
test("walkFlatDataGenerator: skipChildren", () => {
  let data = createData();
  let t = "";
  for (const [
    node,
    { treeIndex, parent, index, parents, skipChildren },
  ] of walkFlatDataGenerator(data)) {
    t += node.id + "";
    if (node.id === 2) {
      skipChildren();
    }
  }
  expect(t).toBe("12376");
});
test("walkFlatDataGenerator: exitWalk", () => {
  let data = createData();
  let t = "";
  for (const [
    node,
    { treeIndex, parent, index, parents, exitWalk },
  ] of walkFlatDataGenerator(data)) {
    t += node.id + "";
    if (node.id === 5) {
      exitWalk();
    }
  }
  expect(t).toBe("125");
});
test("walkFlatData", () => {
  let data = createData();
  walkFlatData(data, (node, { treeIndex, parent, index, parents }) => {
    if (treeIndex === 0) {
      expect(parent).toBe(null);
      expect(JSON.stringify(parents)).toBe("[]");
      expect(node.id).toBe(1);
    }
  });
});
test("walkFlatData: options", () => {
  let data = createData("key", "pid");
  walkFlatData(
    data,
    (node, { treeIndex, parent, index, parents }) => {
      if (treeIndex === 0) {
        expect(parent).toBe(null);
        expect(JSON.stringify(parents)).toBe("[]");
        expect(node.key).toBe(1);
      }
    },
    { idKey: "key", parentIdKey: "pid" }
  );
});
test("walkFlatData: skipChildren", () => {
  let data = createData();
  let t = "";
  walkFlatData(data, (node, { skipChildren }) => {
    t += node.id + "";
    if (node.id === 2) {
      skipChildren();
    }
  });
  expect(t).toBe("12376");
});
test("walkFlatData: exitWalk", () => {
  let data = createData();
  let t = "";
  walkFlatData(data, (node, { exitWalk }) => {
    t += node.id + "";
    if (node.id === 5) {
      exitWalk();
    }
  });
  expect(t).toBe("125");
});
test("convertIndexToTreeIndexInFlatData", () => {
  let data = createData();
  expect(convertIndexToTreeIndexInFlatData(data, null, 0)).toBe(0);
  expect(convertIndexToTreeIndexInFlatData(data, null, 1)).toBe(9);
  expect(convertIndexToTreeIndexInFlatData(data, null, null)).toBe(9);
  expect(convertIndexToTreeIndexInFlatData(data, 1, 0)).toBe(1);
  expect(convertIndexToTreeIndexInFlatData(data, 1, 1)).toBe(6);
  expect(convertIndexToTreeIndexInFlatData(data, 1, null)).toBe(9);
  expect(convertIndexToTreeIndexInFlatData(data, 2, null)).toBe(6);
  expect(convertIndexToTreeIndexInFlatData(data, 3, 0)).toBe(7);
  expect(convertIndexToTreeIndexInFlatData(data, 3, 1)).toBe(8);
  expect(convertIndexToTreeIndexInFlatData(data, 3, 2)).toBe(9);
  expect(convertIndexToTreeIndexInFlatData(data, 3, 3)).toBe(9);
  expect(convertIndexToTreeIndexInFlatData(data, 3, 3000)).toBe(9);
  expect(convertIndexToTreeIndexInFlatData(data, 3, null)).toBe(9);
  expect(convertIndexToTreeIndexInFlatData(data, 10, null)).toBe(4);
});
test("addToFlatData", () => {
  let data = createData();
  let cur = [...data];
  addToFlatData(cur, { id: "new", parent_id: 1, name: "new" }, 0);
  expect(cur[1].id).toBe("new");
  cur = [...data];
  addToFlatData(cur, { id: "new", parent_id: null, name: "new" }, 1);
  expect(cur[9].id).toBe("new");
  cur = [...data];
  addToFlatData(cur, { id: "new", parent_id: 2, name: "new" }, null);
  expect(cur[6].id).toBe("new");
});
test("removeByIdInFlatData", () => {
  let data = createData();
  let cur = [...data];
  removeByIdInFlatData(cur, 1);
  expect(cur.length).toBe(0);
  //
  cur = [...data];
  removeByIdInFlatData(cur, 2);
  expect(cur.length).toBe(4);
  //
  cur = [...data];
  console.log("if remove id 5", removeByIdInFlatData(cur, 5));
  expect(cur.length).toBe(7);
  //
  cur = createData("key");
  let removed = removeByIdInFlatData(cur, 10, { idKey: "key" });
  expect(removed.length).toBe(1);
  expect(removed[0].key).toBe(10);
  expect(cur.length).toBe(data.length - 1);
});

function createData(id = "id", parent_id = "parent_id") {
  // size 9
  return [
    {
      [id]: 1,
      [parent_id]: null,
      name: "Root Category",
    },
    {
      [id]: 2,
      [parent_id]: 1,
      name: "Technology",
    },
    {
      [id]: 5,
      [parent_id]: 2,
      name: "Hardware",
    },
    {
      [id]: 10,
      [parent_id]: 5,
      name: "Computer Components",
    },
    {
      [id]: 4,
      [parent_id]: 2,
      name: "Programming",
    },
    {
      [id]: 8,
      [parent_id]: 4,
      name: "Python",
    },
    {
      [id]: 3,
      [parent_id]: 1,
      name: "Science",
    },
    {
      [id]: 7,
      [parent_id]: 3,
      name: "Biology",
    },
    {
      [id]: 6,
      [parent_id]: 3,
      name: "Physics",
    },
  ];
}
