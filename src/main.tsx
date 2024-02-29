// don't use reset css
// import '@unocss/reset/tailwind.css'
// import '@unocss/reset/tailwind-compat.css'
import 'virtual:uno.css'
import React, { lazy, Suspense } from 'react';
import ReactDOM from 'react-dom/client'
import { createHashRouter, RouterProvider } from "react-router-dom";
import PageLayout from './PageLayout.tsx';

// router
const Pages = {
  home: lazy(() => import("./pages/index.tsx")),
  base_tree_data: lazy(() => import("./pages/base_tree_data.tsx")),
  base_flat_data: lazy(() => import("./pages/base_flat_data.tsx"))
}
const router = createHashRouter([
  {
    path: "/",
    element: <PageLayout />,
    children: [
      {
        path: "/",
        element: <Pages.home />
      },
      {
        path: "/base_tree_data",
        element: <Pages.base_tree_data />,
      },
      {
        path: "/base_flat_data",
        element: <Pages.base_flat_data />,
      }
    ]
  },
]);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    {/* <App /> */}
    <Suspense fallback={<span>loading</span>}>
      <RouterProvider router={router} />
    </Suspense>
  </React.StrictMode>,
)
