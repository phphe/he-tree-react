import {
  useRef
} from 'react';
import exampleData from './example_data.json'
import { VirtualList, VirtualListHandle } from '../../lib/VirtualList'

export default function ScrollToIndexExample() {
  const ref = useRef<VirtualListHandle>(null);
  return <>
    <h2>scroll to index</h2>
    <ul>
      <li><button onClick={() => ref.current!.scrollToIndex(100)}>scroll to 100</button></li>
      <li><button onClick={() => ref.current!.scrollToIndex(233)}>scroll to 233</button></li>
      <li><button onClick={() => ref.current!.scrollToIndex(567)}>scroll to 567</button></li>
      <li><button onClick={() => ref.current!.scrollToIndex(761)}>scroll to 761</button></li>
      <li><button onClick={() => ref.current!.scrollToIndex(999)}>scroll to 999</button></li>
    </ul>
    <VirtualList
      ref={ref}
      items={exampleData}
      style={{ height: '600px', border: '1px solid #ccc', padding: '10px' }}
      renderItem={(item, index) => <div key={index} style={{ marginBottom: '10px' }}>
        <h3>{index}. {item.headline}</h3>
        <div>
          <div style={{ float: 'left', width: '100px', height: '100px', background: '#f0f0f0', borderRadius: '5px', marginRight: '10px' }}></div>
          {item.content}
        </div>
      </div>}
    ></VirtualList>
    <br />
    <a href="https://github.com/phphe/react-base-virtual-list/blob/main/src/examples/scrollToIndex.tsx">Source Code</a>
  </>
}