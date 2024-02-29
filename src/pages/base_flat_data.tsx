import { createFlatData } from './_data'
import { useHeTree, sortFlatData } from "../../lib/index";
import { useState } from 'react';

export default function BasePage() {
  const [data, setdata] = useState(() => sortFlatData(createFlatData()));
  const { renderHeTree } = useHeTree({
    data,
    dataType: 'flat',
    idKey: 'id',
    parentIdKey: 'parent_id',
    onChange: setdata,
    renderNode: ({ id, node, open, checked }) => <div>
      {node.name}
    </div>,
  })
  return <div>
    {renderHeTree()}
  </div>
}