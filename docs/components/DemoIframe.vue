<template>
  <div class="DemoIframe">
    <div>
      <strong>{{ lang === 'zh' ? '请看效果' : 'Preview' }}</strong>
    </div>
    <div class="iframeWrapper">
      <iframe v-if="iframe_id" :src="shouldLoad ? fullUrl : undefined" scrolling="no"
        :style="{ height: height + 'px' }" />
    </div>
  </div>
</template>

<script>
import { useData } from 'vitepress'

export default {
  props: {
    url: {},
  },
  setup(props) {
    const { isDark, lang } = useData()
    return {
      isDark,
      lang,
    }
  },
  data() {
    return {
      shouldLoad: false,
      loadedOnce: false,
      iframe_id: '',
      height: '',
      bg: '',
      color: '',
    }
  },
  computed: {
    fullUrl() {
      return `${import.meta.env.DEV ? 'http://localhost:3000' : ''}/v1-demo-windowed#${this.url}?bg=${this.bg}&color=${this.color}&iframe_id=${this.iframe_id}`
    },
  },
  watch: {
  },
  methods: {
    resizeIframe(obj) {
      obj.style.height = obj.contentWindow.document.documentElement.scrollHeight + 'px';
    },
    checkShouldLoad() {
      if (this.loadedOnce) {
        return
      }
      const buffer = 200
      let rect = this.$el.getBoundingClientRect()
      const compare = y => (y > -buffer) && (y < window.innerHeight + buffer)
      this.shouldLoad = compare(rect.top) || compare(rect.bottom)
      if (this.shouldLoad) {
        this.loadedOnce = true
      }
    },
  },
  mounted() {
    this.$watch('isDark', async (val) => {
      await this.$nextTick()
      const t = getComputedStyle(document.body)
      this.bg = encodeURIComponent(t.backgroundColor)
      this.color = encodeURIComponent(t.color)
    }, { immediate: true })
    // 
    this.iframe_id = Math.random().toString(36).substring(2, 15)
    // 
    this._messageListener = (e) => {
      if (e.data?.type === "iframeHeight") {
        if (e.data.id === this.iframe_id) {
          this.height = e.data.height
        }
      }
    }
    window.addEventListener("message", this._messageListener, false);

    window.addEventListener("scroll", this.checkShouldLoad);
  },
  beforeUnmount() {
    window.removeEventListener("message", this._messageListener, false);
    window.removeEventListener("scroll", this.checkShouldLoad);
  },
}
</script>

<style scoped>
.DemoIframe {
  margin: 16px 0;
}

.DemoIframe .iframeWrapper {
  margin-top: 10px;
  padding: 10px;
  border: 1px solid var(--vp-c-divider, #ccc);
  border-radius: 8px;
}

.DemoIframe iframe {
  border: 0;
  width: 100%;
}
</style>