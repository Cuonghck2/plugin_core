<script setup>
  import { sleep, cleanDot, sampleData, flattenObject, flatData, backward, removeBykey, isArray, isNotNull, permission, exportXLSX, exportPDF, rtf, submitData, exportExcel, exportPdf, pad, dataReport } from '../../untils.js'
  import { onMounted, ref, defineExpose } from 'vue'
  defineExpose({
    sleep, cleanDot, sampleData, flattenObject, flatData, backward, removeBykey, isArray, isNotNull, permission, exportXLSX, exportPDF, rtf, submitData, exportExcel, exportPdf, pad, dataReport
  })
  const _view = ref(window.Vue.router.currentRoute.value.query._view)
  const currentPage = ref(window.Vue.store.state.currentPage)
  const site = ref(window.Vue.store.state.site)
  const dynamicView = ref('')
  let bodyQuery = {
      "size": 1,
      "_source": {
        "includes": [ "shortName" ]
      },
      "script_fields": {
        "pageView": {
          "script": {
            "source": "if (doc['shortName'] == ['" + _view.value + "']) { doc['pageConfig'] } else { '' }"
          }
        }
      },
      "query": {
          "bool": {
              "filter": {
                  "match": {
                      "site": localStorage.getItem('site')
                  }
              },
              "must": [
                {
                  "match": {
                    "group": window.Vue.store.state.currentPage
                  }
                },
                {
                  "match": {
                    "visibility": window.Vue.store.state.visibility
                  }
                }
              ]
          }
      }
  }
  onMounted(() => {
    dynamicView.value = '';
    setTimeout(async () => {
      
      let dynamicPages = await window.Vue.store.getters.graphqlQuery(`
          query search($token: String, $body: JSON, $db: String, $collection: String) {
              results: search(token: $token, body: $body, db: $db, collection: $collection )
          }
      `,{
          body: bodyQuery,
          db: localStorage.getItem("db"),
          collection: 'vuejx_page_screen'
      })
      if (Array.isArray(dynamicPages?.results?.hits?.hits) && dynamicPages.results.hits.hits[0] && dynamicPages.results.hits.hits[0]['fields']['pageView']) {
        await window.Vue.store.methods.buildComp(dynamicPages.results.hits.hits[0]['fields']['pageView'][0], _view.value)
      }
      
      dynamicView.value = _view.value;

    }, 0);
  })
</script>

<template>
  <component ref="abcxxxyx" :key="dynamicView" v-bind:is="_view + '___' + currentPage + '___' + site"></component>
</template>