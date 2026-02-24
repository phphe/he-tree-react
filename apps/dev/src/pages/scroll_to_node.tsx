import { useHeTree, sortFlatData } from "he-tree-react";
import type { Id } from "he-tree-react";
import { useState } from 'react';

export default function BasePage() {
  const keys = { idKey: 'id', parentIdKey: 'pid' };
  // prettier-ignore
  const [data, setdata] = useState(() => sortFlatData(createData(), keys));
  const [openIds, setopenIds] = useState<Id[] | undefined>([]);
  const handleOpen = (id: Id, open: boolean) => {
    if (open) {
      setopenIds([...(openIds || allIds), id]);
    } else {
      setopenIds((openIds || allIds).filter((i) => i !== id));
    }
  }
  const { renderTree, allIds, scrollToNode } = useHeTree({
    ...keys,
    data,
    dataType: 'flat',
    onChange: setdata,
    openIds,
    virtual: true,
    renderNode: ({ id, node, open, checked, draggable }) => <div>
      <button onClick={() => handleOpen(id, !open)}>{open ? '-' : '+'}</button>
      {id}
    </div>,
  })
  return <div>
    <button onClick={() => scrollToNode(910)}>Scroll to 910</button>
    {renderTree({ style: { width: '300px', height: '300px', border: '1px solid #555', padding: '20px' } })}
  </div>
}

// generate 10000 nodes
function createData() {
  const genId = () => result.length
  const result: { id: number, pid: number | null }[] = [];
  for (let i = 0; i < 1000; i++) {
    let id1 = genId()
    result.push({ id: id1, pid: null })
    for (let j = 0; j < 4; j++) {
      result.push({ id: genId(), pid: id1 })
    }
    let id2 = genId()
    result.push({ id: id2, pid: null })
    for (let j = 0; j < 4; j++) {
      result.push({ id: genId(), pid: id2 })
    }
  }
  return result;
}