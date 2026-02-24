import { defineConfig } from "vitepress";
// import { version } from "../package.json"; // monorepo获取不到最新版本，暂时写首位

const GTAG_ID = "G-GVYKBNTKPG";
const vVersion = `v${1}`;

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "He Tree React",
  description: "A VitePress Site",
  cleanUrls: true,
  themeConfig: {
    search: {
      provider: "local",
    },
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
          {
            text: vVersion,
            items: [
              {
                text: "Changelog",
                link: "https://github.com/phphe/he-tree-react/releases",
              },
            ],
          },
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
          {
            text: vVersion,
            items: [
              {
                text: "更新日志",
                link: "https://github.com/phphe/he-tree-react/releases",
              },
            ],
          },
        ],
      },
    },
  },
  head: [
    [
      "script",
      {
        async: "",
        src: `https://www.googletagmanager.com/gtag/js?id=${GTAG_ID}`,
      },
    ],
    [
      "script",
      {},
      `window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', '${GTAG_ID}');`,
    ],
  ],
  sitemap: {
    hostname: "https://he-tree-react.phphe.com",
  },
  lastUpdated: true,
});
