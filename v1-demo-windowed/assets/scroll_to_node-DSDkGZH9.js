import{r as c,j as a}from"./index-Bdko82Ir.js";import{s as x,u as f}from"./HeTree-CB4Dd815.js";function b(){const t={idKey:"id",parentIdKey:"pid"},[e,o]=c.useState(()=>x(g(),t)),[d,r]=c.useState([]),s=(n,p)=>{r(p?[...d||i,n]:(d||i).filter(l=>l!==n))},{renderTree:u,allIds:i,scrollToNode:h}=f({...t,data:e,dataType:"flat",onChange:o,openIds:d,virtual:!0,renderNode:({id:n,node:p,open:l,checked:j,draggable:m})=>a.jsxs("div",{children:[a.jsx("button",{onClick:()=>s(n,!l),children:l?"-":"+"}),n]})});return a.jsxs("div",{children:[a.jsx("button",{onClick:()=>h(910),children:"Scroll to 910"}),u({style:{width:"300px",height:"300px",border:"1px solid #555",padding:"20px"}})]})}function g(){const t=()=>e.length,e=[];for(let o=0;o<1e3;o++){let d=t();e.push({id:d,pid:null});for(let s=0;s<4;s++)e.push({id:t(),pid:d});let r=t();e.push({id:r,pid:null});for(let s=0;s<4;s++)e.push({id:t(),pid:r})}return e}export{b as default};