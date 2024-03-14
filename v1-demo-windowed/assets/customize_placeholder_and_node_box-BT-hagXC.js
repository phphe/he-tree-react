import{r,j as e}from"./index-Bdko82Ir.js";import{s as p,u as m}from"./HeTree-CB4Dd815.js";function x(){const a={idKey:"id",parentIdKey:"parent_id"},[n,t]=r.useState(()=>p([{id:1,parent_id:null,name:"Root Category"},{id:2,parent_id:1,name:"Technology"},{id:5,parent_id:2,name:"Hardware"},{id:10,parent_id:5,name:"Computer Components"},{id:4,parent_id:2,name:"Programming"},{id:8,parent_id:4,name:"Python"},{id:3,parent_id:1,name:"Science"},{id:7,parent_id:3,name:"Biology"},{id:6,parent_id:3,name:"Physics"}],a)),{renderTree:i}=m({...a,data:n,dataType:"flat",onChange:t,renderNodeBox:({stat:o,attrs:d,isPlaceholder:s})=>r.createElement("div",{...d,key:d.key},s?e.jsx("div",{className:"my-drag-placeholder",children:"drop here"}):e.jsx("div",{className:"mynode",children:o.node.name}))});return e.jsxs("div",{children:[i({className:"mytree",style:{width:"300px",border:"1px solid #555",padding:"20px"}}),e.jsx("style",{children:`
    .mytree [data-node-box]{
      padding: 5px 0;
    }
    .mytree [data-node-box]:hover{
      background-color: #eee;
    }
    .mytree .he-tree-drag-placeholder{
      height: 30px;
      line-height: 30px;
      text-align: center;
      border: 1px dashed red;
    }
    .mynode{
      padding-left:5px;
    }
    `})]})}export{x as default};
