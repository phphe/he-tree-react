import {
  walkTreeDataGenerator,
  walkTreeData,
  findTreeData,
  filterTreeData,
  openParentsInTreeData,
  updateCheckedInTreeData,
} from "../../lib/HeTree";

test("walkTreeDataGenerator", () => {
  let data = createData();
  for (const [
    node,
    { parent, index, parents, skipChildren, exitWalk },
  ] of walkTreeDataGenerator(data)) {
    if (node.text === "Nuxt") {
      expect(parent!.text).toBe("Vue");
      expect(parents[2]!.text).toBe("Vue");
      expect(parents[0]!.text).toBe("Projects");
      break;
    }
  }
});
test("walkTreeDataGenerator: exitWalk", () => {
  let data = createData();
  let i = 0;
  for (const [
    node,
    { parent, index, parents, skipChildren, exitWalk },
  ] of walkTreeDataGenerator(data)) {
    if (i === 3) {
      exitWalk();
    }
    i++;
  }
  expect(i).toBe(4);
});
test("walkTreeDataGenerator: skipChildren", () => {
  let data = createData();
  let i = 0;
  for (const [
    node,
    { parent, index, parents, skipChildren, exitWalk },
  ] of walkTreeDataGenerator(data)) {
    i++;
    skipChildren();
  }
  expect(i).toBe(data.length);
});
test("walkTreeDataGenerator: siblings, index", () => {
  let data = createData();
  for (const [
    node,
    { parent, parents, skipChildren, exitWalk, siblings, index },
  ] of walkTreeDataGenerator(data)) {
    if (node.text === "Vue") {
      expect(siblings).toBe(parent?.children);
    }
    if (node.text === "React") {
      expect(index).toBe(1);
      break;
    }
  }
});
test("walkTreeData", () => {
  let data = createData();
  walkTreeData(
    data,
    (node, { parent, parents, skipChildren, exitWalk, siblings, index }) => {
      if (node.text === "Vue") {
        expect(siblings).toBe(parent?.children);
      }
      if (node.text === "React") {
        expect(index).toBe(1);
        exitWalk();
      }
    }
  );
});
test("walkTreeData: skipChildren", () => {
  let data = createData();
  let i = 0;
  walkTreeData(
    data,
    (node, { parent, parents, skipChildren, exitWalk, siblings, index }) => {
      i++;
      skipChildren();
    }
  );
  expect(i).toBe(data.length);
});
test("walkTreeData: exitWalk", () => {
  let data = createData();
  let i = 0;
  walkTreeData(
    data,
    (node, { parent, parents, skipChildren, exitWalk, siblings, index }) => {
      i++;
      if (i === 3) {
        exitWalk();
      }
    }
  );
  expect(i).toBe(3);
});
test("walkTreeData: options", () => {
  let data = [
    {
      sub: [
        { text: "Vue", id: 1 },
        { text: "React", id: 2 },
        { text: "Nuxt", id: 3 },
      ],
    },
  ];
  let i = 0;
  walkTreeData(
    data,
    (
      node: any,
      { parent, parents, skipChildren, exitWalk, siblings, index }
    ) => {
      if (i === 3) {
        expect(node.text).toBe("Nuxt");
        exitWalk();
      }
      i++;
    },
    "sub"
  );
});
test("findTreeData", () => {
  let data = createData();
  let r = findTreeData(data, (node) => node.text === "Next");
  expect(r?.text).toBe("Next");
  r = findTreeData(data, (node) => node.text === "Next============");
  expect(r).toBe(undefined);
});
test("filterTreeData", () => {
  let data = createData();
  let r = filterTreeData(data, (node) => node.text.startsWith("A"));
  expect(r.length).toBe(4);
  r = filterTreeData(data, (node) => node.text === "===========");
  expect(r.length).toBe(0);
});
test("openParentsInTreeData", () => {
  let data = createData();
  let cur = [...data];
  let openIds = ["Frontend"];
  let newOpenids = openParentsInTreeData(cur, openIds, "The Godfather", {
    idKey: "text",
  });
  expect(newOpenids.toString()).toBe("Frontend,Movie,Videos");
  newOpenids = openParentsInTreeData(cur, [], "Next", { idKey: "text" });
  expect(newOpenids.toString()).toBe("Frontend,Projects,React");
  newOpenids = openParentsInTreeData(cur, [], "===================");
  expect(newOpenids.toString()).toBe("");
});
test("updateCheckedInTreeData", () => {
  let data = createData2();
  let cur = [...data];
  let ids = [3];
  let [newIds, semi,all] = updateCheckedInTreeData(cur,ids,[], true);
  expect(newIds.toString()).toBe("3");
  // 
  [newIds, semi] = updateCheckedInTreeData(cur,ids,[3], true);
  expect(newIds.toString()).toBe("3,6,7");
  expect(semi.toString()).toBe("1");
  // 
  [newIds, semi] = updateCheckedInTreeData(cur,[],[8,10], true);
  expect(newIds.toString()).toBe("10,2,4,5,8");
  expect(semi.toString()).toBe("1");
  // uncheck
  [newIds, semi, all] = updateCheckedInTreeData(cur,[10,2,4,8,5],[8], false);
  expect(newIds.toString()).toBe("10,5");
  expect(semi.toString()).toBe("1,2");
  expect(all.toString()).toBe("1,10,2,5");
  // 
  [newIds, semi, all] = updateCheckedInTreeData(cur,[1,2,5,10,4,8,3,7,6],[6,7], !false);
  expect(newIds.length).toBe(9);
  expect(semi.length).toBe(0);
  expect(all.length).toBe(9);
  // 
  [newIds, semi, all] = updateCheckedInTreeData(cur,[1,2,5,10,4,8,3,7,6],[6,7], false);
  expect(semi.toString()).toBe('1');
});

function createData() {
  // return example tree data
  return [
    {
      text: "Projects",
      children: [
        {
          text: "Frontend",
          children: [
            {
              text: "Vue",
              children: [
                {
                  text: "Nuxt",
                },
              ],
            },
            {
              text: "React",
              children: [
                {
                  text: "Next",
                },
              ],
            },
            {
              text: "Angular",
            },
          ],
        },
        {
          text: "Backend",
        },
      ],
    },
    {
      text: "Videos",
      children: [
        {
          text: "Movie",
          children: [
            {
              text: "The Godfather",
            },
            {
              text: "La Dolce Vita",
            },
            {
              text: "In the Mood for Love",
            },
          ],
        },
        {
          text: "AD",
        },
        {
          text: "Shorts",
        },
      ],
    },
    {
      text: "Photos",
      children: [
        {
          text: "Animals",
        },
        {
          text: "Buildings",
        },
        {
          text: "Sky",
        },
        {
          text: "Sea",
        },
      ],
    },
    {
      text: "Music",
      children: [
        {
          text: "My Happy Melodies.",
        },
        {
          text: "Hello Summer.",
        },
        {
          text: "An Overture To Happiness.",
        },
        {
          text: "Sunny Days.",
        },
        {
          text: "Every One Need Adventure.",
        },
        {
          text: "Happy, Chill Radio.",
        },
        {
          text: "I Found My Way.",
        },
        {
          text: "Early, Early Morning.",
        },
      ],
    },
    {
      text: "Games",
      children: [
        {
          text: "swimming",
        },
        {
          text: "cycling",
        },
        {
          text: "tennis",
        },
        {
          text: "boxing",
        },
      ],
    },
    {
      text: "Download",
    },
  ];
}

function createData2() {
  // same to flatData.test
  // size 9
  /* structure
  1
    2
      5
        10
      4
        8
    3
      7
      6
  */
  return [
    {
        "id": 1,
        "name": "Root Category",
        "children": [
            {
                "id": 2,
                "name": "Technology",
                "children": [
                    {
                        "id": 5,
                        "name": "Hardware",
                        "children": [
                            {
                                "id": 10,
                                "name": "Computer Components",
                                "children": []
                            }
                        ]
                    },
                    {
                        "id": 4,
                        "name": "Programming",
                        "children": [
                            {
                                "id": 8,
                                "name": "Python",
                                "children": []
                            }
                        ]
                    }
                ]
            },
            {
                "id": 3,
                "name": "Science",
                "children": [
                    {
                        "id": 7,
                        "name": "Biology",
                        "children": []
                    },
                    {
                        "id": 6,
                        "name": "Physics",
                        "children": []
                    }
                ]
            }
        ]
    }
]
}