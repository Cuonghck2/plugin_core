<script setup>
  import {
    create,
    NInput, NConfigProvider, viVN, dateViVN
  } from 'naive-ui'
  
  const naive = create({
    components: [
      NInput, NConfigProvider
    ]
  })
  window.Vue.use(naive)
</script>
<template>
  <n-config-provider :locale="viVN" :date-locale="dateViVN">
    <slot name="main_content_wrap"></slot>
  </n-config-provider>
</template>