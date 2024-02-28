import example_data from "./examples/example_data.json";
import { sortFlatData, useHeTree } from "../lib/index";
import { useState } from "react";
import { useImmer } from "use-immer";
function App() {
  // const [flatData, setflatData] = useState(() => {
  //   const list: (typeof example_data)[] = [];
  //   for (const { node, skip, } of traverseTreeData(example_data, 'children')) {
  //     node.id = Math.random()
  //     // @ts-ignore
  //     list.push(node);
  //   }
  //   return list
  // });
  const [flatData, setflatData] = useImmer(() => sortFlatData([
    { "id": 1, "pid": null, "name": "Root Category" },
    { "id": 2, "pid": 1, "name": "Technology" },
    { "id": 5, "pid": 2, "name": "Hardware" },
    { "id": 10, "pid": 5, "name": "Computer Components" },
    { "id": 3, "pid": 1, "name": "Science" },
    { "id": 7, "pid": 3, "name": "Biology" },
    { "id": 4, "pid": 2, "name": "Programming" },
    { "id": 6, "pid": 3, "name": "Physics" },
    { "id": 8, "pid": 4, "name": "Python" },
    { "id": 9, "pid": 4, "name": "Java" },
    { "id": 11, "pid": 5, "name": "Networking" },
    { "id": 12, "pid": 6, "name": "Classical Mechanics" },
    { "id": 13, "pid": 6, "name": "Quantum Mechanics" },
    { "id": 14, "pid": 7, "name": "Genetics" },
    { "id": 15, "pid": 7, "name": "Ecology" },
    { "id": 16, "pid": 8, "name": "Django" },
    { "id": 17, "pid": 8, "name": "JavaScript" },
    { "id": 18, "pid": 9, "name": "Spring" },
    { "id": 19, "pid": 9, "name": "C++" },
    { "id": 20, "pid": 10, "name": "CPU" },
    { "id": 21, "pid": 10, "name": "RAM" },
    { "id": 22, "pid": 11, "name": "Wireless Networking" },
    { "id": 23, "pid": 11, "name": "Routing" },
    { "id": 24, "pid": 12, "name": "Newtonian Mechanics" },
    { "id": 25, "pid": 12, "name": "Relativity" },
    { "id": 26, "pid": 13, "name": "Quantum Field Theory" },
    { "id": 27, "pid": 13, "name": "String Theory" },
    { "id": 28, "pid": 14, "name": "DNA Structure" },
    { "id": 29, "pid": 14, "name": "Gene Expression" },
    { "id": 30, "pid": 15, "name": "Ecosystems" },
    { "id": 31, "pid": 15, "name": "Biodiversity" },
    { "id": 32, "pid": 16, "name": "Flask" },
    { "id": 33, "pid": 16, "name": "React" },
    { "id": 34, "pid": 17, "name": "Node.js" },
    { "id": 35, "pid": 17, "name": "Angular" },
    { "id": 36, "pid": 18, "name": "Maven" },
    { "id": 37, "pid": 18, "name": "Hibernate" },
    { "id": 38, "pid": 19, "name": "Object-Oriented Programming" },
    { "id": 39, "pid": 19, "name": "Data Structures" },
    { "id": 40, "pid": 20, "name": "GPU" },
    { "id": 41, "pid": 20, "name": "Motherboard" },
    { "id": 42, "pid": 21, "name": "DDR4" },
    { "id": 43, "pid": 21, "name": "DDR5" },
    { "id": 44, "pid": 22, "name": "Wi-Fi" },
    { "id": 45, "pid": 22, "name": "Bluetooth" },
    { "id": 46, "pid": 23, "name": "IP Addressing" },
    { "id": 47, "pid": 23, "name": "Firewall" },
    { "id": 48, "pid": 24, "name": "Gravitation" },
    { "id": 49, "pid": 24, "name": "Orbital Mechanics" },
    { "id": 50, "pid": 25, "name": "General Relativity" },
    { "id": 51, "pid": 25, "name": "Special Relativity" },
    { "id": 52, "pid": 26, "name": "Quantum Entanglement" },
    { "id": 53, "pid": 26, "name": "Quantum Superposition" },
    { "id": 54, "pid": 27, "name": "Quantum Strings" },
    { "id": 55, "pid": 27, "name": "Superstring Theory" },
    { "id": 56, "pid": 28, "name": "RNA Structure" },
    { "id": 57, "pid": 28, "name": "Mutation" },
    { "id": 58, "pid": 29, "name": "Genome Mapping" },
    { "id": 59, "pid": 29, "name": "Genetic Engineering" },
    { "id": 60, "pid": 30, "name": "Forest Ecosystems" },
    { "id": 61, "pid": 30, "name": "Desert Ecosystems" },
    { "id": 62, "pid": 31, "name": "Species Richness" },
    { "id": 63, "pid": 31, "name": "Ecological Succession" },
    { "id": 64, "pid": 32, "name": "API Development" },
    { "id": 65, "pid": 32, "name": "Web Development" },
    { "id": 66, "pid": 33, "name": "React Native" },
    { "id": 67, "pid": 33, "name": "Vue.js" },
    { "id": 68, "pid": 34, "name": "Express.js" },
    { "id": 69, "pid": 34, "name": "Sails.js" },
    { "id": 70, "pid": 35, "name": "RxJS" },
    { "id": 71, "pid": 35, "name": "Dart" },
    { "id": 72, "pid": 36, "name": "Ant" },
    { "id": 73, "pid": 36, "name": "Gradle" },
    { "id": 74, "pid": 37, "name": "JPA" },
    { "id": 75, "pid": 37, "name": "MyBatis" },
    { "id": 76, "pid": 38, "name": "Inheritance" },
    { "id": 77, "pid": 38, "name": "Polymorphism" },
    { "id": 78, "pid": 39, "name": "Arrays" },
    { "id": 79, "pid": 39, "name": "Linked Lists" },
    { "id": 80, "pid": 40, "name": "Graphics Card" },
    { "id": 81, "pid": 40, "name": "CUDA" },
    { "id": 82, "pid": 41, "name": "ATX" },
    { "id": 83, "pid": 41, "name": "ITX" },
    { "id": 84, "pid": 42, "name": "Latency" },
    { "id": 85, "pid": 42, "name": "Bandwidth" },
    { "id": 86, "pid": 43, "name": "DDR5X" },
    { "id": 87, "pid": 43, "name": "GDDR6" },
    { "id": 88, "pid": 44, "name": "5G" },
    { "id": 89, "pid": 44, "name": "Mesh Networking" },
    { "id": 90, "pid": 45, "name": "Wireless Mouse" },
    { "id": 91, "pid": 45, "name": "Wireless Keyboard" },
    { "id": 92, "pid": 46, "name": "IPv4" },
    { "id": 93, "pid": 46, "name": "IPv6" },
    { "id": 94, "pid": 47, "name": "Network Firewall" },
    { "id": 95, "pid": 47, "name": "Application Firewall" },
    { "id": 96, "pid": 48, "name": "Kepler's Laws" },
    { "id": 97, "pid": 48, "name": "Newton's Law of Universal Gravitation" },
    { "id": 98, "pid": 49, "name": "Hohmann Transfer Orbit" },
    { "id": 99, "pid": 49, "name": "Geostationary Orbit" },
    { "id": 100, "pid": 50, "name": "Black Holes" },
    { "id": 101, "pid": 50, "name": "Wormholes" }
  ], 'id', 'pid'));
  const updateOpen = (id, open) => {
    let ids = [...openIds];
    if (open) {
      ids.push(id)
    } else {
      ids.splice(ids.indexOf(id), 1)
    }
    setopenIds(ids)
  }
  const toggleCheck = (id) => {
    let a = new Set(checkedIds)
    if (a.has(id)) {
      a.delete(id)
    } else {
      a.add(id)
    }
    setcheckedIds([...a])
  }
  const [openIds, setopenIds] = useState([1, 2, 4]);
  const [checkedIds, setcheckedIds] = useState([4]);
  const t = useHeTree({
    data: flatData,
    dataType: 'flat',
    renderNode: ({ id, node, open, checked }) => <div>
      <button onClick={() => { updateOpen(id, !open) }}>{open ? '-' : '+'}</button>
      <input type="checkbox" checked={Boolean(checked)} onChange={() => { toggleCheck(id) }} />
      {node?.name}
    </div>,
    onChange: setflatData,
    parentIdKey: 'pid',
    openIds,
    checkedIds,
  })

  // const renderNode = ({ node, dragOvering, setOpen, setChecked, draggable, onDragStart }) => <div>
  //   <div>
  //     <button draggable={draggable} onDragStart={onDragStart}>x</button>
  //     <button onClick={() => setOpen(!node.open)}>{node.open ? '-' : '+'}</button>
  //     <input type="checkbox" checked={node.checked || false} onChange={(e) => setChecked(e.target.checked)} />
  //     {node.text}
  //   </div>
  // </div>
  return (
    <>
      <div className='text-center'>
        <b>@he-tree/react</b>
        <a className='ml-10' href="https://github.com/phphe/he-tree-react">Github</a>
      </div>
      <div className='grid grid-cols-3 gap-4'>
        <div>
          {t.renderHeTree()}
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
