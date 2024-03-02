import { createFlatData } from './_data'
import { useHeTree, sortFlatData } from "he-tree-react";
import { useState } from 'react';

export default function BasePage() {
  const keys = { idKey: 'id', parentIdKey: 'parent_id' };
  const [data, setdata] = useState(() => sortFlatData(createFlatData(), keys));
  const { renderHeTree } = useHeTree({
    ...keys,
    data,
    dataType: 'flat',
    onChange: setdata,
    renderNode: ({ id, node, open, checked }) => <div>
      {node.name}
    </div>,
  })
  return <div style={{ width: '300px', border: '1px solid #ccc', padding: '10px' }}>
    {renderHeTree()}
  </div>
}