import exampleData from './example_data.json'
import { VirtualList, } from '../../lib/VirtualList'

export default function StickyExample() {
  return <>
    <h2>Sticky</h2>
    <ul>
      <li>Use prop 'persistentIndices' to make items persistent.</li>
      <li>"persistentIndices" support multiple items.</li>
      <li>Use css 'position:sticky' make items sticky.</li>
    </ul>
    <VirtualList
      items={exampleData}
      style={{ height: '600px', border: '1px solid #ccc', padding: '10px' }}
      persistentIndices={[1]} // sticky the second item
      renderItem={(item, index) => <div key={index} style={{ marginBottom: '10px', ...index === 1 && { position: 'sticky', top: 0, background: '#fff', zIndex: 2 } }}>
        <h3>{index}. {item.headline}</h3>
        <div>
          <div style={{ float: 'left', width: '100px', height: '100px', background: '#f0f0f0', borderRadius: '5px', marginRight: '10px' }}></div>
          {item.content}
        </div>
      </div>}
    ></VirtualList>
    <br />
    <a href="https://github.com/phphe/react-base-virtual-list/blob/main/src/examples/sticky.tsx">Source Code</a>
  </>
}