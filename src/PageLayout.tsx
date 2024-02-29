import React from "react";
export default function PageLayout(props: { children: React.ReactNode }) {
  return <div className="page-layout">
    {props.children}
    <style>{`
      body{
        margin: 0;
        background-color: #fff9e6;
      }    
    `}</style>
  </div>
}