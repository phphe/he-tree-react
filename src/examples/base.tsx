import exampleData from './example_data.json'
import { VirtualList, } from '../../lib/VirtualList'

export default function BaseExample() {
  return <>
    <h2>Virtual List Demo</h2>
    <ul>
      <li>Dynamic, the list items are not the same height.</li>
      <li>1000 items in the demo.</li>
    </ul>
    <VirtualList
      items={exampleData}
      style={{ height: '600px', border: '1px solid #ccc', padding: '10px' }}
      renderItem={(item, index) => <div key={index} style={{ marginBottom: '10px', }}>
        <h3>{index}. {item.headline}</h3>
        <div>
          <div style={{ float: 'left', width: '100px', height: '100px', background: '#f0f0f0', borderRadius: '5px', marginRight: '10px' }}></div>
          {item.content}
        </div>
      </div>}
    ></VirtualList>
    <br />
    <a href="https://github.com/phphe/react-base-virtual-list/blob/main/src/examples/base.tsx">Source Code</a>
  </>
}