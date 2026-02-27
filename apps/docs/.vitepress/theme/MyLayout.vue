<script setup>
import DefaultTheme from 'vitepress/theme'

const { Layout } = DefaultTheme
</script>

<template>
  <Layout>
    <template #home-hero-image>
      <video autoplay loop muted playsinline
        style="width: 350px; max-width: 100%; height: auto; display: block; margin: 0 auto;">
        <source src="/demo.webm" type="video/webm">
      </video>
    </template>
  </Layout>
</template>

<style>
.VPHero .image-bg {
  display: none;
}
</style>