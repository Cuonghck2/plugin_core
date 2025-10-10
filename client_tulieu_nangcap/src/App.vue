<script setup>
  import { onMounted, watch, ref } from 'vue'
  import { useRoute } from 'vue-router';
  import { sleep } from './untils'
  const route = useRoute()
  const renderPageLoad = ref(false)
  const renderPageLoadView = ref(false)
  const renderSite = ref(false)
  const viewMode = ref(localStorage.getItem('view_group'))
  const pageCr = ref('')
  const pageOld = ref('')
  const db = ref(localStorage.getItem('db').toLowerCase())
  const visibility = ref('')
  const site = ref(localStorage.getItem('site').toLowerCase())
  const siteDefault = ref(localStorage.getItem('site').toLowerCase())
  const appversion = ref(0)
  const headerView = ref( {
    web_height: localStorage.getItem('web_height'),
    group_height: localStorage.getItem('group_height')
  })
  const injectWat = ref(false)

  const pullPageView = async (sitePage, appversion) => {
    const pageView = await window.VueJX.scriptForm(`/static/page/${sitePage}/${db.value}___${sitePage}___${pageCr.value}.js`, 'text')
    const decompressed =  window.decompressSync(
        window.strToU8(pageView, true),
    );
    let dynamicView = JSON.parse(
        window.strFromU8(decompressed),
    );
    if (appversion && appversion != dynamicView.appversion) {
      renderPageLoad.value = false
    }
    dynamicView['shortName'] = pageCr.value;
    await window.buildPageView(dynamicView, appversion)
    if (appversion && appversion != dynamicView.appversion) {
      renderPageLoad.value = true
    }
  }
  const pullSiteView = async (sitePage, appversion) => {
    const pageView = await window.VueJX.scriptForm(`/static/page/${sitePage}/${db.value}___${sitePage}.js`, 'text')
    const decompressed =  window.decompressSync(
        window.strToU8(pageView, true),
    );
    let dynamicView = JSON.parse(
        window.strFromU8(decompressed),
    );
    dynamicView['shortName'] = db.value + '___' + siteDefault.value;
    await window.buildSiteView(dynamicView, appversion)
  }
  const preparePage = async () => {
    injectWat.value = true
    appversion.value = localStorage.getItem('appversion');
    visibility.value = route.params.visibility
    console.log('preparePagepreparePagepreparePage', visibility.value, route.params, window.Vue.router.currentRoute.value.params);
    renderPageLoad.value = false
    site.value = route.params.site
    let sitePage = site.value;
    if (!sitePage) {
      sitePage = localStorage.getItem('site').toLowerCase()
    }
    let document = await window.db.get(db.value + '___' + sitePage + '___' + pageCr.value)
    if (document && document.appversion) {
      await window.buildPageView(document, document.appversion)
      await sleep(200)
      renderPageLoad.value = true
      pullPageView(sitePage, document.appversion)
    } else {
      await pullPageView(sitePage)
      renderPageLoad.value = true
    }
    if (!window.Vue.doneInit) {
      do {
        await window.sleep(50)
      } while (!window.Vue.doneInit);
    }
  }
  watch(() => window.Vue._context.components[db.value + '___' + siteDefault.value + '___' + route.params.visibility + '_header'], (currentValue, oldValue) => {
    if (!currentValue) {
      renderSite.value = false
      if (siteDefault.value) {
        setTimeout(async () => {
          let sitePage = site.value;
          if (!sitePage) {
            sitePage = localStorage.getItem('site').toLowerCase()
          }
          let document = await window.db.get(db.value + '___' + siteDefault.value)
          if (document && document.appversion) {
            await window.buildSiteView(document, document.appversion)
            pullSiteView(sitePage)
          } else {
            await pullSiteView(sitePage)
          }
          renderSite.value = true
        }, 0);
      }
    }
  }, { immediate: true });

  watch(() => route.params.page, (newValue, oldValue) => {
    pageCr.value = newValue;
    pageOld.value = oldValue
    if (pageCr.value && pageCr.value != pageOld.value) {
      delete window.Vue._context.components[db.value + '___' + site.value + '___' + pageOld.value]
      setTimeout(async () => {
        await preparePage();
        renderPageLoadView.value = true
      }, 0);
    }
  }, { immediate: true });
  watch(() => route.query._view, (newValue, oldValue) => {
    pageCr.value = route.params.page
    if (route.params.visibility != 'web' && route.params.visibility != 'group') {
      pageCr.value = route.params.visibility
    }
    window.Vue.store.methods.setCurrentPage(pageCr.value);
    if (oldValue && oldValue != newValue && pageCr.value == pageOld.value) {
      renderPageLoadView.value = false
      setTimeout(() => {
        renderPageLoadView.value = true
      }, 200);
    }
    pageOld.value = pageCr.value;
  }, { immediate: true });
  watch(() => route.params.site, () => {
    site.value = route.params.site
  });
  watch(() => route.params.visibility, (newValue, oldValue) => {
    visibility.value = newValue
    setTimeout(async () => {
      console.log('window.Vue.router.currentRoute.value.paramswindow.Vue.router.currentRoute.value.paramswindow.Vue.router.currentRoute.value.params', window.Vue.router.currentRoute.value.params);
      if (!window.Vue.router.currentRoute.value.params.page && (newValue == 'group' || newValue == 'web')) {

        let document = await window.db.get(newValue + 'Nav')
        if (document && Array.isArray(document.page) && document.page[0]) {
          window.Vue.router.push(`/${newValue}/${window.Vue.store.state.site}/${Object.keys(document.page[0])[0]}`);
        }
        
      } else if (!window.Vue.router.currentRoute.value.params.page) {
        pageCr.value = newValue
        if (pageCr.value) {
          delete window.Vue._context.components[db.value + '___' + site.value + '___' + pageCr.value]
          await preparePage();
          renderPageLoadView.value = true
        }
      }
    }, 0);
  }, { immediate: true });
  onMounted(() => {
    if (!route.params.visibility) {
      if (window.Vue.store.state.redirect) {
        window.Vue.router.push(window.Vue.store.state.redirect.replace('/#/', '/'));
      } else {
        window.Vue.router.push(`/${window.Vue.store.state.visibility}/${window.Vue.store.state.site}/`);
      }
    }
  })
  
</script>

<template>
  <vuejx-ui-base>
    
    <template v-slot:main_content_wrap>
      <div :class="pageCr" class="layout__page__screen">
        <vuejx-ui :viewMode="viewMode">
          <template v-slot:main_content>
            <div id="header___container" class="vuejx__header" :style="{'min-height': headerView[visibility + '_height']}" :class="pageCr == 'login' ? 'hidden' : ''">
              <component v-if="renderSite" v-bind:is="db + '___' + (site ? site : siteDefault) + '___' + visibility + '_header'"
                @doneHeader="doneHeader"
              ></component>
            </div>
            <div :id="pageCr !== 'login' ? 'body___container' : ''" :class="{'done___loading': renderPageLoad && renderPageLoadView}">
              <div class="body___container_height">
                <div v-show="renderPageLoadView" :class="{'hd__screen': pageCr !== 'login'}">
                  <component v-if="renderPageLoad" v-bind:is="db + '___' + (site ? site : siteDefault) + '___' + pageCr"></component>
                </div>
              </div>
            </div>
            <div id="footer___container" v-if="!viewMode" :class="{'hidden': pageCr == 'login'}">
              <component v-if="renderSite" v-bind:is="db + '___' + (site ? site : siteDefault) + '___' + visibility + '_footer'"></component>
            </div>
          </template>
          <template v-slot:notification>
                <vuejx-notification></vuejx-notification>
          </template>
            <template v-slot:loading>
                  <vuejx-loading></vuejx-loading>
            </template>
        </vuejx-ui>
      </div>

    </template>
  </vuejx-ui-base>
  <vuejx-lodash></vuejx-lodash>
</template>
