import{r as l,j as e}from"./index-Bdko82Ir.js";import{s as u,u as x,o as p}from"./HeTree-CB4Dd815.js";function j(){const a={idKey:"id",parentIdKey:"parent_id"},[o,c]=l.useState(()=>u([{id:1,parent_id:null,name:"Root Category"},{id:2,parent_id:1,name:"Technology"},{id:5,parent_id:2,name:"Hardware"},{id:10,parent_id:5,name:"Computer Components"},{id:4,parent_id:2,name:"Programming"},{id:8,parent_id:4,name:"Python"},{id:3,parent_id:1,name:"Science"},{id:7,parent_id:3,name:"Biology"},{id:6,parent_id:3,name:"Physics"}],a)),[d,n]=l.useState([]),m=(t,s)=>{n(s?[...d||r,t]:(d||r).filter(i=>i!==t))},{renderTree:h,allIds:r}=x({...a,data:o,dataType:"flat",onChange:c,openIds:d,renderNode:({id:t,node:s,open:i,checked:y,draggable:g})=>e.jsxs("div",{children:[e.jsx("button",{onClick:()=>m(t,!i),children:i?"-":"+"}),s.name," - ",t]})});return e.jsxs("div",{children:[e.jsx("button",{onClick:()=>n(r),children:"Open All"}),e.jsx("button",{onClick:()=>n([]),children:"Close All"}),e.jsx("button",{onClick:()=>n(p(o,d||r,8,a)),children:"Open 'Python'"}),e.jsx("button",{onClick:()=>n(p(o,[],8,a)),children:"Only Open 'Python'"}),h({style:{width:"300px",border:"1px solid #555",padding:"20px"}})]})}export{j as default};
