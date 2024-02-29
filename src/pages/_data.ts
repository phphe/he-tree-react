export function createFlatData() {
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
      id: 1,
      parent_id: null,
      name: "Root Category",
    },
    {
      id: 2,
      parent_id: 1,
      name: "Technology",
    },
    {
      id: 5,
      parent_id: 2,
      name: "Hardware",
    },
    {
      id: 10,
      parent_id: 5,
      name: "Computer Components",
    },
    {
      id: 4,
      parent_id: 2,
      name: "Programming",
    },
    {
      id: 8,
      parent_id: 4,
      name: "Python",
    },
    {
      id: 3,
      parent_id: 1,
      name: "Science",
    },
    {
      id: 7,
      parent_id: 3,
      name: "Biology",
    },
    {
      id: 6,
      parent_id: 3,
      name: "Physics",
    },
  ];
}

export function createTreeData() {
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
      id: 1,
      name: "Root Category",
      children: [
        {
          id: 2,
          name: "Technology",
          children: [
            {
              id: 5,
              name: "Hardware",
              children: [
                {
                  id: 10,
                  name: "Computer Components",
                  children: [],
                },
              ],
            },
            {
              id: 4,
              name: "Programming",
              children: [
                {
                  id: 8,
                  name: "Python",
                  children: [],
                },
              ],
            },
          ],
        },
        {
          id: 3,
          name: "Science",
          children: [
            {
              id: 7,
              name: "Biology",
              children: [],
            },
            {
              id: 6,
              name: "Physics",
              children: [],
            },
          ],
        },
      ],
    },
  ];
}
