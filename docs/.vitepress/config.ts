import { defineConfig } from "vitepress";

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "He Tree React",
  description: "A VitePress Site",
  cleanUrls: true,
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    // nav: [
    //   { text: "Home", link: "/" },
    //   { text: "Guide", link: "/v1/guide" },
    //   { text: "API", link: "/v1/api" },
    // ],

    // sidebar: [
    //   {
    //     text: "Examples",
    //     items: [
    //       { text: "Markdown Examples", link: "/markdown-examples" },
    //       { text: "Runtime API Examples", link: "/api-examples" },
    //     ],
    //   },
    // ],

    socialLinks: [
      { icon: "github", link: "https://github.com/phphe/he-tree-react" },
    ],
  },
  markdown: {
    // lineNumbers: true,
  },
  locales: {
    root: {
      label: "English",
      lang: "en",
      themeConfig: {
        nav: [
          { text: "Home", link: "/" },
          { text: "Guide", link: "/v1/guide" },
          { text: "Examples", link: "/v1/examples" },
          { text: "API", link: "/v1/api" },
        ],
      },
    },
    zh: {
      label: "中文",
      lang: "zh",
      themeConfig: {
        nav: [
          { text: "首页", link: "/zh/" },
          { text: "使用", link: "/zh/v1/guide" },
          { text: "例子", link: "/zh/v1/examples" },
          { text: "API", link: "/zh/v1/api" },
        ],
      },
    },
  },
  head: [
    [
      "script",
      {
        async: "",
        src: "https://www.googletagmanager.com/gtag/js?id=G-GVYKBNTKPG",
      },
    ],
    [
      "script",
      {},
      `window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', 'G-GVYKBNTKPG');`,
    ],
  ],
});
