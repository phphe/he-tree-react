import{r as o,j as n}from"./index-Bdko82Ir.js";import{s,u as p}from"./HeTree-CB4Dd815.js";function x(){const a={idKey:"id",parentIdKey:"parent_id"},[r,t]=o.useState(()=>s([{id:2,parent_id:1,name:"Technology"},{id:5,parent_id:2,name:"Hardware"},{id:10,parent_id:5,name:"Computer Components"},{id:4,parent_id:2,name:"Programming"},{id:8,parent_id:4,name:"Python"},{id:3,parent_id:1,name:"Science"},{id:7,parent_id:3,name:"Biology"},{id:6,parent_id:3,name:"Physics"}],a)),{renderTree:d}=p({...a,data:r,dataType:"flat",onChange:t,renderNode:({id:e,node:i,open:m,checked:c,draggable:l})=>n.jsxs("div",{children:[i.name," - ",e]}),canDrag:({id:e})=>e===2?!0:e===3?!1:void 0,canDrop:({id:e})=>e===3?!0:e===2?!1:void 0,canDropToRoot:e=>!1});return n.jsx("div",{children:d({style:{width:"300px",border:"1px solid #555",padding:"20px"}})})}export{x as default};