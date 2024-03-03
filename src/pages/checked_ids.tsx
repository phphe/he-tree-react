import { useHeTree, sortFlatData, updateCheckedInFlatData } from "he-tree-react";
import type { Id } from "he-tree-react";
import { useState } from 'react';

export default function BasePage() {
  const keys = { idKey: 'id', parentIdKey: 'parent_id' };
  // prettier-ignore
  const [data, setdata] = useState(() => sortFlatData([{ id: 1, parent_id: null, name: "Root Category", }, { id: 2, parent_id: 1, name: "Technology", }, { id: 5, parent_id: 2, name: "Hardware", }, { id: 10, parent_id: 5, name: "Computer Components", }, { id: 4, parent_id: 2, name: "Programming", }, { id: 8, parent_id: 4, name: "Python", }, { id: 3, parent_id: 1, name: "Science", }, { id: 7, parent_id: 3, name: "Biology", }, { id: 6, parent_id: 3, name: "Physics", },], keys));
  const [checkedIds, setcheckedIds] = useState<Id[]>([]);
  const [semiCheckedIds, setsemiCheckedIds] = useState<Id[]>([]);
  const handleChecked = (id: Id, checked: boolean) => {
    const r = updateCheckedInFlatData(data, checkedIds, id, checked, keys);
    setcheckedIds(r[0]);
    setsemiCheckedIds(r[1]);
  }
  const { renderHeTree } = useHeTree({
    ...keys,
    data,
    dataType: 'flat',
    onChange: setdata,
    checkedIds,
    renderNode: ({ id, node, open, checked, draggable }) => <div>
      <input type="checkbox" checked={checked || false} onChange={() => handleChecked(id, !checked)} />
      {node.name} - {id}
    </div>,
  })
  return <div>
    Checked: {JSON.stringify(checkedIds)} <br />
    Semi-Checked: {JSON.stringify(semiCheckedIds)}
    {renderHeTree({ style: { width: '300px', border: '1px solid #555', padding: '20px' } })}
  </div>
}