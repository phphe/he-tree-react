import { walkParentsGenerator } from "../src/HeTree";

test("walkParentsGenerator", () => {
  const PARENT = "parent_node";
  let root = {};
  let child1 = { [PARENT]: root };
  let child2 = { [PARENT]: root };
  let child11 = { [PARENT]: child1 };
  let child21 = { [PARENT]: child2 };
  let child22 = { [PARENT]: child2 };

  let i = 0;
  for (const node of walkParentsGenerator(child22, PARENT)) {
    if (i === 0) {
      expect(node).toBe(child2);
    } else if (i === 1) {
      expect(node).toBe(root);
    }
    i++;
  }
});
