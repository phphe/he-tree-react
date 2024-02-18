import example_data from "./examples/example_data.json";
import { HeTree, } from "../lib/index";
import { useState } from "react";
function App() {
  const [treeData, settreeData] = useState(example_data);
  const renderNode = ({ node, dragOvering, setOpen, setChecked, draggable, onDragStart }) => <div>
    <div>
      <button draggable={draggable} onDragStart={onDragStart}>x</button>
      <button onClick={() => setOpen(!node.open)}>{node.open ? '-' : '+'}</button>
      <input type="checkbox" checked={node.checked || false} onChange={(e) => setChecked(e.target.checked)} />
      {node.text}
    </div>
  </div>
  return (
    <>
      <div className='text-center'>
        <b>@he-tree/react</b>
        <a className='ml-10' href="https://github.com/phphe/he-tree-react">Github</a>
      </div>
      <div className='grid grid-cols-3 gap-4'>
        <div>
          <HeTree treeData={treeData} renderNode={renderNode} foldable={true} customDragTrigger={true} onChange={settreeData} />
        </div>
        <div>
        </div>
        <div>
        </div>
      </div >
    </>
  )
}

export default App
