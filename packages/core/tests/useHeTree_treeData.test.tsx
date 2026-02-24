
import {
  useHeTree,
} from "../src/HeTree";
import { render } from '@testing-library/react';
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
  const { asFragment } = render(<Test />);
  expect(asFragment()).toMatchSnapshot();
})
