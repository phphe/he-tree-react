
import {
  useHeTree,
} from "../../lib/HeTree";
import renderer from "react-test-renderer";
import { useState } from 'react';
import { createData } from "./treeData.test";


test('render tree', () => {
  const Test = () => {
    const [data, setdata] = useState(createData);
    const { renderTree } = useHeTree({
      data,
      dataType: 'tree',
      onChange: setdata,
      renderNode: ({ id, node, open, checked }) => <div>
        {node.name}
      </div>,
    })
    return renderTree()
  }
  const component = renderer.create(
    <Test />,
  )
  let cptJson = toJson(component)
  expect(cptJson).toMatchSnapshot()
})

export function toJson(component: renderer.ReactTestRenderer) {
  const result = component.toJSON()
  expect(result).toBeDefined()
  expect(result).not.toBeInstanceOf(Array)
  return result as renderer.ReactTestRendererJSON
}