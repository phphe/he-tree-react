import { useHeTree, sortFlatData, openParentsInFlatData } from "he-tree-react";
import type { Id } from "he-tree-react";
import { useState } from 'react';

export default function BasePage() {
  const keys = { idKey: 'id', parentIdKey: 'parent_id' };
  // prettier-ignore
  const [data, setdata] = useState(() => sortFlatData([{ id: 1, parent_id: null, name: "Root Category", }, { id: 2, parent_id: 1, name: "Technology", }, { id: 5, parent_id: 2, name: "Hardware", }, { id: 10, parent_id: 5, name: "Computer Components", }, { id: 4, parent_id: 2, name: "Programming", }, { id: 8, parent_id: 4, name: "Python", }, { id: 3, parent_id: 1, name: "Science", }, { id: 7, parent_id: 3, name: "Biology", }, { id: 6, parent_id: 3, name: "Physics", },], keys));
  const [openIds, setopenIds] = useState<Id[] | undefined>([]);
  const handleOpen = (id: Id, open: boolean) => {
    if (open) {
      setopenIds([...(openIds || allIds), id]);
    } else {
      setopenIds((openIds || allIds).filter((i) => i !== id));
    }
  }
  const { renderTree, allIds } = useHeTree({
    ...keys,
    data,
    dataType: 'flat',
    onChange: setdata,
    openIds,
    renderNode: ({ id, node, open, checked, draggable }) => <div>
      <button onClick={() => handleOpen(id, !open)}>{open ? '-' : '+'}</button>
      {node.name} - {id}
    </div>,
  })
  return <div>
    <button onClick={() => setopenIds(allIds)}>Open All</button>
    <button onClick={() => setopenIds([])}>Close All</button>
    <button onClick={() => setopenIds(openParentsInFlatData(data, openIds || allIds, 8, keys))}>Open 'Python'</button>
    <button onClick={() => setopenIds(openParentsInFlatData(data, [], 8, keys))}>Only Open 'Python'</button>
    {renderTree({ style: { width: '300px', border: '1px solid #555', padding: '20px' } })}
  </div>
}