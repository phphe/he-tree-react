
import {
  useHeTree,
} from "../../lib/HeTree";
import renderer from "react-test-renderer";
import { useState } from 'react';
import { createData } from "./treeData.test";

// let tree = toJson(component)
// expect(tree).toMatchSnapshot()

test('render tree', () => {
  // const element = document.createElement('div')
  // expect(element).not.toBeNull()
  const Test = () => {
    const [data, setdata] = useState(createData);
    const { renderHeTree } = useHeTree({
      data,
      dataType: 'tree',
      onChange: setdata,
      renderNode: ({ id, node, open, checked }) => <div>
        {node.name}
      </div>,
    })
    return renderHeTree()
  }
  const component = renderer.create(
    <Test />,
  )
})

export function toJson(component: renderer.ReactTestRenderer) {
  const result = component.toJSON()
  expect(result).toBeDefined()
  expect(result).not.toBeInstanceOf(Array)
  return result as renderer.ReactTestRendererJSON
}