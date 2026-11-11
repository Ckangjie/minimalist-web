<template>
  <footer class="footer border-t transition-colors duration-300">
    <div class="footer-inner max-w-1200px mx-auto px-6 py-6 text-center">
      <p class="footer-copy text-xs m-0">
        &copy; {{ year }} <b>Jie Hub</b> · 云端聚合导航 · Powered by Cloudflare Pages &amp; Workers
      </p>
    </div>
  </footer>
</template>

<script setup>
const year = new Date().getFullYear();
</script>

<style lang="scss" scoped>
.footer {
  background-color: var(--bg-surface);
  border-color: var(--border-color);

  &-copy {
    color: var(--text-muted);
  }
}
</style>
