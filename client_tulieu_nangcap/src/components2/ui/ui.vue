<template>
    <n-notification-provider :max="1">
      <slot name="notification"></slot>
    </n-notification-provider>
    <n-loading-bar-provider>
      <slot name="loading"></slot>
    </n-loading-bar-provider>
    <slot name="main_content"></slot>
    <n-layout v-if="viewMode" :has-sider="true">
      <n-layout-sider class="sider___nav"
        collapse-mode="width"
        :collapsed-width="120"
        :width="300"
        :show-trigger="true"
        :bordered="true"
      >
        <slot name="menu_left"></slot>
      </n-layout-sider>
      <n-layout-content>
        <slot name="menu_content"></slot>
      </n-layout-content>
    </n-layout>
</template>

<script>

  import {
      // create naive ui
      create,
      // component
      NLayout, NLayoutSider, NLayoutContent, NNotificationProvider, NLoadingBarProvider, NDatePicker
    } from 'naive-ui'
    
    const naive = create({
      components: [
        NLayout, NLayoutSider, NLayoutContent, NNotificationProvider, NLoadingBarProvider, NDatePicker
      ]
    })
    window.Vue.use(naive)
  
    window.Vue.component('vuejx-footer', {
      template: `
          <footer class="absolute_footer">
              <slot name="footer"></slot>
          </footer>
      `
    });
    window.Vue.component('v-layout', {
        template: `
        <div class="flex flex-wrap">
            <slot></slot>
        </div>
        `
    });
    window.Vue.component('v-form', {template: `<div><slot></slot></div>`});
    window.Vue.component('v-sheet', {template: `<div><slot></slot></div>`});
    window.Vue.component('v-subheader', {template: `<div class="block font-semibold leading-normal truncate"><slot></slot></div>`});
    window.Vue.component('v-flex', {
        props: {
            sm1: {
                type: Boolean,
                default: () => {
                  return false;
                }
              },
              sm2: {
                type: Boolean,
                default: () => {
                  return false;
                }
              },
              sm3: {
                type: Boolean,
                default: () => {
                  return false;
                }
              },
              sm4: {
                type: Boolean,
                default: () => {
                  return false;
                }
              },
              sm5: {
                type: Boolean,
                default: () => {
                  return false;
                }
              },
              sm6: {
                type: Boolean,
                default: () => {
                  return false;
                }
              },
              sm7: {
                type: Boolean,
                default: () => {
                  return false;
                }
              },
              sm8: {
                type: Boolean,
                default: () => {
                  return false;
                }
              },
              sm9: {
                type: Boolean,
                default: () => {
                  return false;
                }
              },
              sm10: {
                type: Boolean,
                default: () => {
                  return false;
                }
              },
              sm11: {
                type: Boolean,
                default: () => {
                  return false;
                }
              },
              sm12: {
                type: Boolean,
                default: () => {
                  return false;
                }
              },
              xs1: {
                type: Boolean,
                default: () => {
                  return false;
                }
              },
              xs2: {
                type: Boolean,
                default: () => {
                  return false;
                }
              },
              xs3: {
                type: Boolean,
                default: () => {
                  return false;
                }
              },
              xs4: {
                type: Boolean,
                default: () => {
                  return false;
                }
              },
              xs5: {
                type: Boolean,
                default: () => {
                  return false;
                }
              },
              xs6: {
                type: Boolean,
                default: () => {
                  return false;
                }
              },
              xs7: {
                type: Boolean,
                default: () => {
                  return false;
                }
              },
              xs8: {
                type: Boolean,
                default: () => {
                  return false;
                }
              },
              xs9: {
                type: Boolean,
                default: () => {
                  return false;
                }
              },
              xs10: {
                type: Boolean,
                default: () => {
                  return false;
                }
              },
              xs11: {
                type: Boolean,
                default: () => {
                  return false;
                }
              },
              xs12: {
                type: Boolean,
                default: () => {
                  return false;
                }
              }
        },
        template: `
        <div :class="{'xs1': xs1, 'xs2': xs2, 'xs3': xs3, 'xs4': xs4, 'xs5': xs5, 'xs6': xs6, 'xs7': xs7, 'xs8': xs8, 'xs9': xs9, 'xs10': xs10, 'xs11': xs11, 'xs12': xs12, 'sm1': sm1, 'sm2': sm2, 'sm3': sm3, 'sm4': sm4, 'sm5': sm5, 'sm6': sm6, 'sm7': sm7, 'sm8': sm8, 'sm9': sm9, 'sm10': sm10, 'sm11': sm11, 'sm12': sm12 }">
            <slot></slot>
        </div>
        `
    });
</script>
<script setup>
  import { ref } from 'vue'

  const db = ref(localStorage.getItem('db').toLocaleLowerCase())
  const site = ref(localStorage.getItem('site').toLocaleLowerCase())
  import { sleep, cleanDot, sampleData, flattenObject, flatData, backward, removeBykey, isArray, isNotNull, permission, exportXLSX, exportPDF, rtf, submitData, exportExcel, exportPdf, pad, dataReport, pullDetailES,
    dateViewYear, dateViewMonthYear, dateView, objectView, objectViewObject } from '../../untils.js'
    window.Vue.sampleData = async function (db, collection, referenceUid, objectId, keys, filterDetail) {
      return await sampleData(db, collection, referenceUid, objectId, keys, filterDetail)
    }
    window.Vue.dataReport = async function (query) {
      return await dataReport(query)
    }
  defineExpose({
    sleep, cleanDot, sampleData, flattenObject, flatData, backward, removeBykey, isArray, isNotNull, permission, exportXLSX, exportPDF, rtf, submitData, exportExcel, exportPdf, pad, dataReport, pullDetailES,
    dateViewYear, dateViewMonthYear, dateView, objectView, objectViewObject,
    db, site
  })

</script>