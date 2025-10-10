<template>
  <span></span>
</template>

<script>
import { useLoadingBar } from 'naive-ui'
import { defineComponent } from 'vue'

export default defineComponent({
  setup () {
    window.Vue.loadingBar = useLoadingBar();
  }
})
</script>