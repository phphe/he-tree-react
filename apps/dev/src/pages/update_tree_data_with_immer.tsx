import { useHeTree, findTreeData } from "he-tree-react";
import type { Id } from "he-tree-react";
import { useRef } from 'react';
import { useImmer } from "use-immer";

export default function BasePage() {
  const CHILDREN = 'children'
  const keys = { idKey: 'id', childrenKey: CHILDREN };
  // prettier-ignore
  const [data, setdata] = useImmer(() => [{ id: 1, name: "Root Category", children: [{ id: 2, name: "Technology", children: [{ id: 5, name: "Hardware", children: [{ id: 10, name: "Computer Components", children: [], },], }, { id: 4, name: "Programming", children: [{ id: 8, name: "Python", children: [], },], },], }, { id: 3, name: "Science", children: [{ id: 7, name: "Biology", children: [], }, { id: 6, name: "Physics", children: [], },], },], },]);
  const add = (pid: Id) => {
    let id = parseInt(Math.random().toString().substring(2, 5));
    setdata(draft => {
      findTreeData(draft, (node) => node.id === pid, CHILDREN)![CHILDREN].unshift({ id, name: "New", [CHILDREN]: [], })
    })
  }
  const remove = (id: Id, pid: Id | null) => {
    setdata(draft => {
      const children = findTreeData(draft, (node,) => node.id === pid, CHILDREN)![CHILDREN]
      children.splice(children.findIndex(t => t.id === id), 1)
    })
  }
  const edit = (id: Id) => {
    let newName = prompt("Enter new name")
    setdata(draft => {
      if (newName) {
        findTreeData(draft, (node) => node.id === id, CHILDREN)!.name = newName
      }
    })
  }
  const initialData = useRef<typeof data>();
  initialData.current = initialData.current || data;
  const { renderTree } = useHeTree({
    ...keys,
    data,
    dataType: 'tree',
    onChange: setdata,
    renderNode: ({ id, pid, node, draggable }) => <div>
      <button draggable={draggable}>👉</button>
      {node.name} - {id} -
      <button onClick={() => add(id)}>+</button>
      <button onClick={() => remove(id, pid)}>-</button>
      <button onClick={() => edit(id)}>Edit</button>
    </div>,
  })
  return <div>
    <button onClick={() => setdata(initialData.current!)}>Restore</button>
    {renderTree({ style: { width: '300px', border: '1px solid #555', padding: '20px' } })}
  </div>
}