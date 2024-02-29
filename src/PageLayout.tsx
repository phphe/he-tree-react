import React, { useState } from "react";
import { useRoutes, Link, NavLink, Outlet } from "react-router-dom";
export default function PageLayout(props: {}) {
  const [menu, setmenu] = useState(() => [
    {
      title: 'Home',
      path: '/',
    },
    {
      title: 'Base Tree with Tree Data',
      path: '/base_tree_data',
    },
    {
      title: 'Base Tree with Flat Data',
      path: '/base_flat_data',
    },
  ]);

  return <div className="page-layout">
    <Outlet />
    <div className="main-menu fixed top-1 right-2 px-4 py-4 bg-gray-200 text-right max-sm:hidden">
      {menu.map((item, index) => <div key={index} className="menu-item py-1">
        <NavLink to={item.path}>{item.title}</NavLink>
      </div>
      )}
    </div>
    <style>{`
      body{
        margin: 0;
        background-color: #fff9e6;
      }
    `}</style>
  </div>
}