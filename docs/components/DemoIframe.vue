<template>
  <div>
    <iframe :src="fullUrl" />
  </div>
</template>

<script>
export default {
  props: {
    url: {},
  },
  computed: {
    fullUrl() {
      return `${import.meta.env.DEV ? 'http://localhost:3000' : ''}/he-tree-react#${this.url}`
    },
  },
  methods: {},
}
</script>

<style scoped>
iframe {
  width: 100%;
  border: 0;
  min-height: 200px;
}
</style>