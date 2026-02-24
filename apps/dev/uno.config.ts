import { defineConfig } from "unocss";
import { presetWind } from "unocss";

export default defineConfig({
  presets: [presetWind()],
  rules: [
    [/^top-([\.\d]+)$/, ([_, num]) => ({ top: `${num}px` })],
    [/^right-([\.\d]+)$/, ([_, num]) => ({ right: `${num}px` })],
    [/^bottom-([\.\d]+)$/, ([_, num]) => ({ bottom: `${num}px` })],
    [/^left-([\.\d]+)$/, ([_, num]) => ({ left: `${num}px` })],
  ],
});
