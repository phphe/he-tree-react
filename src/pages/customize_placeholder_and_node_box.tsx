import { useHeTree, sortFlatData } from "he-tree-react";
import { useState } from 'react';

export default function BasePage() {
  const keys = { idKey: 'id', parentIdKey: 'parent_id' };
  // prettier-ignore
  const [data, setdata] = useState(() => sortFlatData([{ id: 1, parent_id: null, name: "Root Category", }, { id: 2, parent_id: 1, name: "Technology", }, { id: 5, parent_id: 2, name: "Hardware", }, { id: 10, parent_id: 5, name: "Computer Components", }, { id: 4, parent_id: 2, name: "Programming", }, { id: 8, parent_id: 4, name: "Python", }, { id: 3, parent_id: 1, name: "Science", }, { id: 7, parent_id: 3, name: "Biology", }, { id: 6, parent_id: 3, name: "Physics", },], keys));
  const { renderHeTree } = useHeTree({
    ...keys,
    data,
    dataType: 'flat',
    onChange: setdata,
    renderNodeBox: ({ stat, attrs, isPlaceholder }) => (
      <div {...attrs}>
        {isPlaceholder ? <div className="he-tree-drag-placeholder">drop here</div>
          : <div className="mynode">{stat.node.name}</div>
        }
      </div>
    ),
  })
  return <div>
    {renderHeTree({ className: 'mytree', style: { width: '300px', border: '1px solid #555', padding: '20px' } })}
    <style>{`
    .mytree [data-node-box]{
      padding: 5px 0;
    }
    .mytree [data-node-box]:hover{
      background-color: #eee;
    }
    .mytree .he-tree-drag-placeholder{
      height: 30px;
      line-height: 30px;
      text-align: center;
      border: 1px dashed red;
    }
    .mynode{
      padding-left:5px;
    }
    `}</style>
  </div>
}