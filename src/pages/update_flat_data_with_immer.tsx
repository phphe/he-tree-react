import {
  useHeTree, sortFlatData,
  addToFlatData, removeByIdInFlatData
} from "he-tree-react";
import type { Id } from "he-tree-react";
import { useRef } from 'react';
import { useImmer } from "use-immer";

export default function BasePage() {
  const keys = { idKey: 'id', parentIdKey: 'parent_id' };
  // prettier-ignore
  const [data, setdata] = useImmer(() => sortFlatData([{ id: 1, parent_id: null, name: "Root Category", }, { id: 2, parent_id: 1, name: "Technology", }, { id: 5, parent_id: 2, name: "Hardware", }, { id: 10, parent_id: 5, name: "Computer Components", }, { id: 4, parent_id: 2, name: "Programming", }, { id: 8, parent_id: 4, name: "Python", }, { id: 3, parent_id: 1, name: "Science", }, { id: 7, parent_id: 3, name: "Biology", }, { id: 6, parent_id: 3, name: "Physics", },], keys));
  const add = (pid: Id) => {
    let id = parseInt(Math.random().toString().substring(2, 5));
    setdata(draft => {
      addToFlatData(draft, { id, parent_id: pid as number, name: "New" }, 0, keys)
    });
  }
  const remove = (id: Id) => {
    setdata(draft => {
      removeByIdInFlatData(draft, id as number, keys)
    })
  }
  const edit = (id: Id) => {
    let newName = prompt("Enter new name")
    setdata(draft => {
      if (newName) {
        draft.find(node => node.id === id)!.name = newName
      }
    })
  }
  const initialData = useRef<typeof data>();
  initialData.current = initialData.current || data;
  const { renderHeTree } = useHeTree({
    ...keys,
    data,
    dataType: 'flat',
    onChange: setdata,
    renderNode: ({ id, node, draggable }) => <div>
      <button draggable={draggable}>👉</button>
      {node.name} - {id} -
      <button onClick={() => add(id)}>+</button>
      <button onClick={() => remove(id)}>-</button>
      <button onClick={() => edit(id)}>Edit</button>
    </div>,
  })
  return <div>
    <button onClick={() => setdata(initialData.current!)}>Restore</button>
    {renderHeTree({ style: { width: '300px', border: '1px solid #555', padding: '20px' } })}
  </div>
}