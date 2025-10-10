/* eslint-disable */
import store from '../store';
import router from '../router';
import { defineAsyncComponent } from "vue";

export default {
    install(Vue) {
      Vue.config.performance = true;
      window.Vue = Vue;
      window.Vue.store = store;
      window.Vue.router = router;
      window.Vue.pad = function (n, width, z) {
        z = z || "0";
        n = n + "";
        return n.length >= width
          ? n
          : new Array(width - n.length + 1).join(z) + n;
      }
      window.Vue.redirect = async function (data, refresh, otherPage, clean, mutiple, isFormFilter, ext) {
        let uri = window.location.hash;
        if (window.location.hash && window.location.hash.indexOf('?') != -1) {
            uri = window.location.hash.substring(window.location.hash.indexOf('?') + 1)
        }
        let redirectURL = ''
        if (window.location.hash.startsWith('#/')) {
            const [hash1, hash2] = window.location.hash.split('?')
            redirectURL = hash1
        } else {
            redirectURL = window.location.pathname
        }
        if (otherPage !== '' && otherPage !== undefined && otherPage !== null) {
            redirectURL = otherPage
        }
        let params = {};
        let queryX = window.Vue.router.currentRoute.value.query;
        for (const keyXXX in queryX) {
            if (Array.isArray(queryX[keyXXX])) {
                mutiple = true;
                break;
            }
        }
        if (mutiple) {
            params = queryX;
        } else {
            let regex = /[?&]([^=#]+)=([^&#]*)/g,
                match = {};
            while (match = regex.exec("&" + uri)) {
                params[match[1]] = decodeURIComponent(match[2]);
            }
        }

        if (isFormFilter) {
            if (redirectURL && redirectURL.indexOf('?') !== -1) {
                let regexx = /[?&]([^=#]+)=([^&#]*)/g,
                    matchx = {};
                let paramsx = {}
                while (matchx = regexx.exec("&" + redirectURL.substring(redirectURL.indexOf('?') + 1))) {
                    paramsx[matchx[1]] = decodeURIComponent(matchx[2]);
                }
                redirectURL = redirectURL.substring(0, redirectURL.indexOf('?') + 1);
                for (let keyx in paramsx) {
                    if (keyx !== 't' && keyx !== '_filter') {
                        params[keyx] = paramsx[keyx]
                    }
                }
            } else {
                redirectURL += '?';
            }
        } else {
            redirectURL += '?';
        }

        if (clean) {
            params = {}
        }
        if (ext) {
            params = ext;
        }
        if (data === undefined || data === null) {
            data = []
        }
        let ignoreParam = {};
        if (mutiple) {
            let desParam = {};
            let desSearchObjectArray = {};
            for (let indx = data.length - 1; indx >= 0; indx--) {

                if (Array.isArray(data[indx]['value'])) {
                    if (!desParam.hasOwnProperty(data[indx]['key'])) {
                        desParam[data[indx]['key']] = data[indx]['value'];
                    } else {
                        data.splice(indx, 1);
                    }
                } else {
                    if (!desSearchObjectArray.hasOwnProperty(data[indx]['key'])) {
                        desSearchObjectArray[data[indx]['key']] = [];
                    }
                    desSearchObjectArray[data[indx]['key']].push(data[indx]['value']);
                    if (!desParam.hasOwnProperty(data[indx]['key'])) {
                        if (!desParam.hasOwnProperty(data[indx]['key'] + '___' + data[indx]['value'])) {
                            desParam[data[indx]['key'] + '___' + data[indx]['value']] = data[indx]['value'];
                        } else {
                            data.splice(indx, 1);
                        }
                    } else {
                        if (desParam[data[indx]['key']] && Array.isArray(desParam[data[indx]['key']]) && desParam[data[indx]['key']].indexOf(data[indx]['value']) >= 0) {
                            data.splice(indx, 1);
                        }
                    }
                }
            }
            for (const paramx of data) {
                if (paramx['key'] !== 't' && paramx['value'] !== '' && paramx['value'] !== undefined && paramx['value'] !== null) {
                    ignoreParam[paramx['key']] = 1;
                    if (Array.isArray(paramx['value'])) {
                        for (let curParEl of paramx['value']) {
                            if (desSearchObjectArray[paramx['key']] && desSearchObjectArray[paramx['key']].indexOf(curParEl) >= 0) {
                                redirectURL += paramx['key'] + "=" + curParEl + "&";
                            }
                        }
                    } else {
                        redirectURL += paramx['key'] + "=" + paramx['value'] + "&";
                    }
                } else if (paramx['value'] === '') {
                    params[paramx['key']] = '';
                    ignoreParam[paramx['key']] = 1;
                }
            }
        } else {
            for (const param of data) {
                if (Array.isArray(queryX[param['key']])) {
                    params[param['key']] = queryX[param['key']];
                } else {
                    params[param['key']] = param['value'];
                }
            }
        }
        delete params['undefined'];
        delete params['null'];
        for (let curPar in params) {
            if (curPar !== 't' && params[curPar] !== '' && params[curPar] !== undefined && params[curPar] !== null && !ignoreParam.hasOwnProperty(curPar)) {
                if (Array.isArray(params[curPar])) {
                    for (let curParEl of params[curPar]) {
                        redirectURL += curPar + "=" + curParEl + "&";
                    }
                } else {
                    redirectURL += curPar + "=" + params[curPar] + "&";
                }
            }
        }
        redirectURL = redirectURL.replace(/&$/, '').replace(/\?$/, '');
        if (refresh) {
            if (redirectURL && redirectURL.indexOf('?') > 0) {
                redirectURL += '&t=' + new Date().getTime();
            } else {
                redirectURL += '?t=' + new Date().getTime();
            }
        }
        window.Vue.router.push(redirectURL.replace(/#/, ''));
      }
      window.Vue.redirect_page = async function (page, ignore) {
        let queryX = window.Vue.router.currentRoute.value.query;
        if (ignore.length > 0) {
            let queryRouter = [];
            for (const key in queryX) {
                if (ignore.indexOf(key) == -1 && key != '_t' && key != 't') {
                    queryRouter.push({
                        key: key,
                        value: queryX[key]
                    })
                } else {
                    queryRouter.push({
                        key: key,
                        value: ''
                    })
                }
            }
            window.Vue.redirect(queryRouter, true, page)
        }
      }
        
      window.Vue.initVueData = async function (vm, data, query) {
          let queryX = window.Vue.router.currentRoute.value.query;
          let ignoreKeys = [];
          for (const key in query) {
              if (typeof query[key] == 'object') {
                  ignoreKeys.push(key);
                  vm[key] = query[key];
              } else {
                  if (queryX.hasOwnProperty(query[key])) {
                      vm[key] = queryX[query[key]]
                      ignoreKeys.push(key);
                  }
              }
          }
          for (const key in query) {

          }
          for (const el in data) {
              if (ignoreKeys.indexOf(el) == -1) {
                  vm[el] = data[el];
              }
          }
          vm['db'] = localStorage.getItem('db');
          vm['site'] = localStorage.getItem('site');
          vm['renderPage'] = true;
      }

      Vue.component("vuejx-notification", defineAsyncComponent(() => import("./notification/notification.vue")));
      Vue.component("vuejx-loading", defineAsyncComponent(() => import("./loading/loading.vue")));
      Vue.component("vuejx-lodash", defineAsyncComponent(() => import("./lodash/lodash.vue")));
      Vue.component("vuejx-page", defineAsyncComponent(() => import("./dynamic_page/dynamic_page.vue")));
      Vue.component("vuejx-ui-base", defineAsyncComponent(() => import("./ui/core.vue")));
      Vue.component("vuejx-screen", defineAsyncComponent(() => import("./adv/vuejx_screen.vue")));
      Vue.component("vuejx-ui", defineAsyncComponent(() => import("./ui/ui.vue")));
      Vue.component('vuejx-upload', defineAsyncComponent(() => import("./adv/file.vue")));
      Vue.component('vuejx-upload-2', defineAsyncComponent(() => import("./adv/file.vue")));
      Vue.component('vuejx-date-combobox', defineAsyncComponent(() => import("./adv/date.vue")));
      Vue.component('vuejx-autocomplete', defineAsyncComponent(() => import("./adv/autocomplete.vue")));
      Vue.component('vuejx-autocomplete-wrap', defineAsyncComponent(() => import("./adv/autocomplete_wrap.vue")));
      Vue.component('vuejx-region', defineAsyncComponent(() => import("./adv/region.vue")));
      Vue.component("vuejx-number", defineAsyncComponent(() => import("./adv/number.vue")));
      Vue.component("vuejx-phanto", defineAsyncComponent(() => import("./adv/phanto.vue")));
      Vue.component("vuejx-text", defineAsyncComponent(() => import("./adv/text.vue")));
      Vue.component("vuejx-boolean", defineAsyncComponent(() => import("./adv/boolean.vue")));
      Vue.component("vuejx-header", defineAsyncComponent(() => import("./nav/vuejx_header.vue")));
      Vue.component("vuejx-data-report", defineAsyncComponent(() => import("./data/data_report.vue")));
      Vue.component("vuejx-maps", defineAsyncComponent(() => import("./maps/Index.vue")));
      Vue.component('vuejx-collapse', defineAsyncComponent(() => import("./adv/collapse.vue")));
      Vue.component('vuejx-mermaid-string', defineAsyncComponent(() => import("./mermaid/mermaid.vue")));
      Vue.component('vuejx-apex-charts', defineAsyncComponent(() => import("./ApexCharts/ApexCharts.vue")));
      Vue.component('vuejx-editor', defineAsyncComponent(() => import("./editor/editor.vue")));
      
    }
};