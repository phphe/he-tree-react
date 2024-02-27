import {
  walkTreeDataGenerator,
  walkTreeData,
  findTreeData,
  filterTreeData,
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
    console.log(node.text);
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
