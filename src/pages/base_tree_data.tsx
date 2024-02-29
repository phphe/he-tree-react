import { createTreeData } from './_data'
import { useHeTree } from "../../lib/index";
import { useState } from 'react';

export default function BasePage() {
  const [data, setdata] = useState(createTreeData);
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
    {renderHeTree()}
  </div>
}