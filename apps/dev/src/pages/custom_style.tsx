import { useHeTree, sortFlatData } from "he-tree-react";
import { useState } from 'react';

export default function BasePage() {
  const keys = { idKey: 'id', parentIdKey: 'parent_id' };
  const [data, setdata] = useState(() => sortFlatData([
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
  ], keys));
  const { renderTree, placeholder } = useHeTree({
    ...keys,
    data,
    dataType: 'flat',
    onChange: setdata,
    renderNodeBox: ({ stat, attrs, isPlaceholder }) => (
      <div {...attrs} key={attrs.key} className="my-node-box">
        {isPlaceholder ? <div className="my-placeholder">DROP HERE</div>
          : <div className="my-node">
            <span className="drag-handler" draggable={stat.draggable}>{dragIcon()}</span>
            {stat.node.name}
          </div>
        }
      </div>
    ),
  })
  return <>
    <h3 style={{ margin: '0 0 0 110px', padding: '20px 0 0px' }}>Draggable Tree</h3>
    <div>
      {renderTree({ className: `my-tree ${placeholder ? 'dragging' : 'no-dragging'}` })}
    </div>
    <style>{`
    .my-tree{
      width: 300px; 
      border: 1px solid #ccc; 
      border-radius: 5px;
      margin: 20px; 
      padding: 20px;
    }
    .my-placeholder{
      height:40px;
      border: 1px dashed blue;
      border-radius: 3px;
      background-color: #f3ffff;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: small;
    }
    /*.no-dragging .my-node-box:hover{
      background-color: #eee;
    }*/
    .my-node-box:not(:last-child){
      margin-bottom: 10px;
    }
    .my-node{
      padding: 5px 10px;
      padding-left: 30px;
      border: 1px solid #e2e2e2;
      border-radius: 3px;
      background-color: #f0f0f0;
      display: flex;
      align-items: center;
      position: relative;
      box-shadow: 1px 1px 3px 0px rgb(0 0 0 / 19%);
    }
    .no-dragging .my-node:hover{
      background-color: #ebfeff;
    }
    .drag-handler{
      position: absolute;
      left: 0;
      top: 0;
      width: 30px;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: grab;
    }
    .drag-handler:hover{
      background-color: #f0f0f0;
    }
    .my-node svg{
      width:16px;
    }
    `}</style>
  </>
}

function dragIcon() {
  return <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><title>drag-horizontal-variant</title><path d="M21 11H3V9H21V11M21 13H3V15H21V13Z" /></svg>
}