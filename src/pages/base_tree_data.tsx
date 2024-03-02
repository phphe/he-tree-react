import { useHeTree } from "he-tree-react";
import { useState } from 'react';

export default function BasePage() {
  const [data, setdata] = useState(() => [
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
  ]);
  const { renderHeTree } = useHeTree({
    data,
    dataType: 'tree',
    childrenKey: 'children',
    onChange: setdata,
    renderNode: ({ id, node, open, checked }) => <div>
      {node.name}
    </div>,
  })
  return <div>
    {renderHeTree({ style: { width: '300px', border: '1px solid #555', padding: '20px' } })}
  </div>
}