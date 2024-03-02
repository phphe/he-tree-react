import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { Link, NavLink, Outlet, useSearchParams } from "react-router-dom";
export default function PageLayout(props: {}) {
  const [searchParams, setSearchParams] = useSearchParams();
  // bg & color
  const prevBgColor = useRef<string[]>();
  const bgColor = useMemo(() => [
    searchParams.get('bg') || prevBgColor.current?.[0] || '#fff9e6',
    searchParams.get('color') || prevBgColor.current?.[1] || '#000'
  ], [searchParams]);
  prevBgColor.current = bgColor;
  // iframe id
  const [iframeId, setiframeId] = useState(searchParams.get('iframe_id')!);

  const [menu, setmenu] = useState(() => [
    {
      title: 'Base - Flat Data',
      path: '/base_flat_data',
    },
    {
      title: 'Base - Tree Data',
      path: '/base_tree_data',
    },
    {
      title: 'Home',
      path: '/',
    },
  ]);

  useLayoutEffect(() => {
    const { ResizeObserver } = window
    const observer = ResizeObserver && new ResizeObserver(() => {
      window.parent.postMessage({ type: 'iframeHeight', height: document.body.offsetHeight, id: iframeId }, '*')
    })
    // observer is undefined in test environment
    observer?.observe(document.body)
    return () => {
      observer?.disconnect()
    }
  }, [])

  return <div className="page-layout">
    <Outlet />
    <div className="main-menu fixed top-1 right-2 px-4 py-4 bg-gray-100  max-md:hidden">
      <div className="text-xl font-bold mb-5 text-black">Menu</div>
      {menu.map((item, index) => <div key={index} className="menu-item py-1">
        <NavLink to={item.path}>{item.title}</NavLink>
      </div>
      )}
    </div>
    <style>{`
      body{
        margin: 0;
        background-color: ${bgColor[0]};
        color: ${bgColor[1]};
      }
      .main-menu{
      }
      .main-menu a{
        text-decoration: none;
      }
      .main-menu a.active{
        font-weight: bold;
      }
      .main-menu a:hover{
        text-decoration: underline;
      }
    `}</style>
  </div>
}