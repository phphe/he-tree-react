import { useHeTree, sortFlatData } from "he-tree-react";
import type { Id } from "he-tree-react";
import { useState } from 'react';

export default function BasePage() {
  const keys = { idKey: 'id', parentIdKey: 'parent_id' };
  // prettier-ignore
  const [data, setdata] = useState(() => sortFlatData([{ id: 1, parent_id: null, name: "Root Category", }, { id: 2, parent_id: 1, name: "Technology", }, { id: 5, parent_id: 2, name: "Hardware", }, { id: 10, parent_id: 5, name: "Computer Components", }, { id: 4, parent_id: 2, name: "Programming", }, { id: 8, parent_id: 4, name: "Python", }, { id: 3, parent_id: 1, name: "Science", }, { id: 7, parent_id: 3, name: "Biology", }, { id: 6, parent_id: 3, name: "Physics", },], keys));
  const [openIds, setopenIds] = useState<Id[] | undefined>([1, 3]);
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
    dragOpen: true,
    onDragOpen(stat) {
      handleOpen(stat.id, true)
    },
  })
  return <div>
    {renderTree({ style: { width: '300px', border: '1px solid #555', padding: '20px' } })}
  </div>
}