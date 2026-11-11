<template>
  <footer class="footer">
    <div class="footer-inner">
      <p class="footer-copy">&copy; {{ year }} Brand. All rights reserved.</p>
    </div>
  </footer>
</template>

<script setup>
const year = new Date().getFullYear();
</script>

<style lang="scss" scoped>
.footer {
  color: #c0c4cc;
  background-color: #1d2d44;

  &-inner {
    max-width: 1200px;
    margin: 0 auto;
    padding: 24px;
    text-align: center;
    box-sizing: border-box;
  }

  &-copy {
    font-size: 13px;
  }
}
</style>
