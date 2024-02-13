import example_data from "./examples/example_data.json";
import { HeTree, } from "../lib/index";
function App() {
  const renderNode = ({ node, dragOvering, setOpen, setChecked }) => <div>
    <div>
      <button onClick={() => setOpen(!node.open)}>{node.open ? '-' : '+'}</button>
      <input type="checkbox" checked={node.checked} onChange={(e) => setChecked(e.target.checked)} />
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
          <HeTree treeData={example_data} renderNode={renderNode} foldable={true} />
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
