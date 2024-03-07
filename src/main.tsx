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
  base_flat_data: lazy(() => import("./pages/base_flat_data.tsx")),
  custom_drag_trigger_flat_data: lazy(() => import("./pages/custom_drag_trigger_flat_data.tsx")),
  open_ids: lazy(() => import("./pages/open_ids.tsx")),
  checked_ids: lazy(() => import("./pages/checked_ids.tsx")),
  update_data: lazy(() => import("./pages/update_data.tsx")),
  update_flat_data_with_immer: lazy(() => import("./pages/update_flat_data_with_immer.tsx")),
  update_tree_data_with_immer: lazy(() => import("./pages/update_tree_data_with_immer.tsx")),
  customize_placeholder_and_node_box: lazy(() => import("./pages/customize_placeholder_and_node_box.tsx")),
  draggable_droppable: lazy(() => import("./pages/draggable_droppable.tsx")),
  dragopen: lazy(() => import("./pages/dragopen.tsx")),
  external_drag: lazy(() => import("./pages/external_drag.tsx")),
  virtual_list: lazy(() => import("./pages/virtual_list.tsx")),
  scroll_to_node: lazy(() => import("./pages/scroll_to_node.tsx")),
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
      },
      {
        path: "/custom_drag_trigger_flat_data",
        element: <Pages.custom_drag_trigger_flat_data />,
      },
      {
        path: "/open_ids",
        element: <Pages.open_ids />,
      },
      {
        path: "/checked_ids",
        element: <Pages.checked_ids />,
      },
      {
        path: "/update_data",
        element: <Pages.update_data />,
      },
      {
        path: "/update_flat_data_with_immer",
        element: <Pages.update_flat_data_with_immer />,
      },
      {
        path: "/update_tree_data_with_immer",
        element: <Pages.update_tree_data_with_immer />,
      },
      {
        path: "/customize_placeholder_and_node_box",
        element: <Pages.customize_placeholder_and_node_box />,
      },
      {
        path: "/draggable_droppable",
        element: <Pages.draggable_droppable />,
      },
      {
        path: "/dragopen",
        element: <Pages.dragopen />,
      },
      {
        path: "/external_drag",
        element: <Pages.external_drag />,
      },
      {
        path: "/virtual_list",
        element: <Pages.virtual_list />,
      },
      {
        path: '/scroll_to_node',
        element: <Pages.scroll_to_node />
      },
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
