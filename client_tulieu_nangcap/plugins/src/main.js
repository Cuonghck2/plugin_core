import { decompressSync, strToU8, strFromU8, compressSync } from 'fflate';
window.decompressSync = decompressSync;
window.strToU8 = strToU8;
window.strFromU8 = strFromU8;
window.compressSync = compressSync;
import { sleep, search, aggsData, userById, processData, graphqlQuery, userOne, userUpdateMany, xlsxtemplate, docxtemplate, htmlToPdf, pullScriptForm, axios, dataReport, processDataOne } from './untils.js';
window.sleep = sleep;
import VueJXHeader from './components/core/nav/Index2.js';
import VueJXHeaderSimple from './components/core/nav/Index_simple.js';
import VueJXNavVertical from './components/core/nav/Index_vertical.js';
import VueJXNavVerticalInfo from './components/core/nav/Index_info.js';
import Table from './components/core/table/table.js';

import tableViewKhcn from './components/core/table/table-view-khcn.js';
import tableSimpleKhcn from './components/core/table/table-simple-khcn.js';
import tableSimplePagging from './components/core/table/table-simple-pagging.js';
import tableSimpleTop from './components/core/table/table-simple-top.js';
import VueJXMenuAggs from './components/core/menu/menu-aggs.js'
import VueJXMenuAggsView from './components/core/menu/menu-aggs-view.js'
import QLVTFilter from './components/core/menu/qlvt-filter.js'
import VuejxDataReport from './components/core/input/data-report.js'
import VuejxDone from './components/core/done/vuejx-done.js'
import MTQuanTrac from './components/mt/vuejx-quan-trac.js'
import MTPreview from './components/mt/vuejx-preview-report.js'
import VueJXLeafletWrap from './components/core/table/vuejx-leaflet-wrap.js';
import tableSimpleSelect from './components/core/table/table-simple-selected.js';
import tableSimpleKhcnStatic from './components/core/table/table-simple-khcn-static.js';
import VuejxCMS from './components/adv/cms/vn-data-cms.js'

import { openDB } from 'idb';
const dbPromise = openDB('vuejx_app_admin', 1, {
  upgrade(db, oldVersion, newVersion) {
      db.createObjectStore('screens_admin');
  },
});

window.db = {
    set: async function(key, val) {
      try {
        return (await dbPromise).put('screens_admin', val, key);
      } catch (error) {
      }
    },
    get: async function get(key) {
        try {
            return (await dbPromise).get('screens_admin', key);
        } catch (error) {
        }
    }
}
function padTo2Digits(num) {
    return num.toString().padStart(2, '0');
}
  
function formatDate(date) {
    return [
      padTo2Digits(date.getDate()),
      padTo2Digits(date.getMonth() + 1),
      date.getFullYear(),
    ].join('/');
}
  
function formatDateTimeX(date) {
    return [
      padTo2Digits(date.getDate()),
      padTo2Digits(date.getMonth() + 1),
      date.getFullYear(),
    ].join('/') + ' ' + [
        padTo2Digits(date.getHours()),
        padTo2Digits(date.getMinutes())
    ].join(':');
}
window.VueJX = {
    formatDate: function (date) {
        return formatDate(date)
    },
    formatDateTime: function (date) {
        return formatDateTimeX(date)
    },
    dataReportQuery: async function (dataPage) {
        return await dataReport(dataPage);
    },
    initPagePull: async function (visibilityF, page) {
        return await initPage(visibilityF, page);
    },
    pageURL: function() {
        let pageURL = window.location.hash.split('/');
        if (window.location.hash.indexOf('?') != -1) {
            pageURL = window.location.hash.substring(0, window.location.hash.indexOf('?')).split('/')
        }
        return pageURL;
    },
    page: function() {
        let pageURL = window.VueJX.pageURL();
        let pageSitePrepare = '';
        if (Array.isArray(pageURL) && pageURL.length > 0 && pageURL[pageURL.length - 1]) {
            pageSitePrepare = pageURL[pageURL.length - 1]
        }
        return pageSitePrepare;
    },
    search: async function(vm, type, collection, keywords, queryFilter, condition, includes, sort, storage, size, queryParam, sizeLast, customPagging, inlineSearchQuery) {
        return await search(vm, type, collection, keywords, queryFilter, condition, includes, sort, storage, size, queryParam, sizeLast, customPagging, inlineSearchQuery);
    },
    aggs: async function(vm, type, group_by, group_size, pageCount, valKey, textKey, exclude, conditionAggs, re_calculator, keywords, queryParam, publicData, multiple, pageCountNext, range, custom_label, customAggs) {
        return await aggsData(vm, type, group_by, group_size, pageCount, valKey, textKey, exclude, conditionAggs, re_calculator, keywords, queryParam, publicData, multiple, pageCountNext, range, custom_label, customAggs);
    },
    scriptForm: async function(pathFile, mode) {
        return await pullScriptForm(pathFile, mode);
    },
    dispatch: async function(func, postData) {
        let result = null
        let variables = postData.variables;
        let query = postData.query;
        if (func === 'vuejx_manager/graphqlQuery') {
            variables['token'] = localStorage.getItem('token');
            variables['db'] = localStorage.getItem('db');
            result = await graphqlQuery(query, variables);
        } else if (func === 'vuejx_manager/userById') {
            result = await userById(postData);
        } else if (func === 'vuejx_manager/userUpdateMany') {
            result = await userUpdateMany(postData);
        } else if (func === 'vuejx_manager/userOne') {
            result = await userOne(postData);
        } else if (func === 'vuejx_manager/userCreate' || func === 'vuejx_manager/userUpdateById') {
            result = await processData(postData);
        } else if (func === 'vuejx_manager/userUpdateOne') {
            result = await processDataOne(postData);
        } else if (func === 'vuejx_manager/xlsxtemplate') {
            result = await xlsxtemplate(postData);
        } else if (func === 'vuejx_manager/topdf') {
            result = await htmlToPdf(postData);
        } else if (func === 'vuejx_manager/docxtemplate') {
            result = await docxtemplate(postData);
        }
        return result;
    }
}

const buildSite = async (data) => {
    do {
        console.log('waiting instant');
        await sleep(50);
    } while (!window.Vue);

    if (data.guestHeaderConfig && data.guestHeaderConfig.length > 50) {
        let vueSiteGuest = eval("( " + data.guestHeaderConfig + " )");
        if (vueSiteGuest) {
            vueSiteGuest['props'] = {
                siteCss: {
                    type: String,
                    default: '<style type="text/css">' + data.cssConfig + '</style>'
                }
            }
            vueSiteGuest['template'] = '<div v-html="siteCss"></div> ' + vueSiteGuest['template'];
            window.Vue.component(data.shortName + '___web_header', vueSiteGuest);
        }
        
    }
    if (data.groupHeaderConfig && data.groupHeaderConfig.length > 50) {
        let vueSiteGroup = eval("( " + data.groupHeaderConfig + " )");
        if (vueSiteGroup) {
            vueSiteGroup['props'] = {
                siteCss: {
                    type: String,
                    default: '<style type="text/css">' + data.cssConfig + '</style>'
                }
            }
            vueSiteGroup['template'] = '<div v-html="siteCss"></div> ' + vueSiteGroup['template'];
            window.Vue.component(data.shortName + '___group_header', vueSiteGroup);
        }   
    }
    if (data.guestFooterConfig && data.guestFooterConfig.length > 50) {
        let guestFooterConfig = eval("( " + data.guestFooterConfig + " )");
        window.Vue.component(data.shortName + '___web_footer', guestFooterConfig);
    }
    if (data.groupFooterConfig && data.groupFooterConfig.length > 50) {
        let groupFooterConfig = eval("( " + data.groupFooterConfig + " )");
        window.Vue.component(data.shortName + '___group_footer', groupFooterConfig);
    }
}
const buildPage = async (data) => {
    do {
        console.log('waiting instant');
        await sleep(50);
    } while (!window.Vue);
    
    let vueForm = eval("( " + data.pageConfig + " )");
    if (vueForm) {
        vueForm['props'] = {
            siteCss: {
                type: String,
                default: '<style type="text/css">' + data.cssConfig + '</style>'
            }
        }
        vueForm['template'] = vueForm['template'] + ' <div v-html="siteCss"></div> ';
        window.Vue.component(data.shortName, vueForm);
    }

    if (data.pageFooterConfig && data.pageFooterConfig.length > 50) {
        let vueFormHeader = eval("( " + data.pageHeaderConfig + " )");
        window.Vue.component(data.shortName + '___header', vueFormHeader);
    }
    if (data.pageFooterConfig && data.pageFooterConfig.length > 50) {
        let vueFormFooter = eval("( " + data.pageFooterConfig + " )");
        window.Vue.component(data.shortName + '___footer', vueFormFooter);
    }
}

const initPage = async (visibilityF, page) => {
    let result = {
        webNav: [],
        groupNav: []
    }
    let resultPage = [];
    let site = localStorage.getItem("site");
    do {
        console.log('waiting instant');
        site = localStorage.getItem("site");
        await sleep(50);
    } while (!site);
    let visibility = 'web';
    let pageURL = window.location.hash.split('/');
    if (window.location.hash.indexOf('?') != -1) {
        pageURL = window.location.hash.substring(0, window.location.hash.indexOf('?')).split('/')
    }
    if (Array.isArray(pageURL) && pageURL.length >= 3 && (pageURL[1] == 'group' || pageURL[1] == 'web')) {
        visibility = pageURL[1]
    } else {
        if (visibilityF) {
            visibility = visibilityF
        }
    }
    let bodySite = {
        size: 1,
        _source: {
            includes: [
                "shortName",
                "app_view",
                "dataApp",
                "webGroupData",
                "webNavData",
                "ext_menu"
            ]
        },
        query: {
            bool: {
                filter: {
                    match: {
                        shortName: localStorage.getItem("site")
                    },
                }
            },
        },
    };

    var myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json;charset=UTF-8");
    myHeaders.append("Accept", "application/json, text/plain, */*");

    var requestOptions = {
        method: 'POST',
        headers: myHeaders,
        body: JSON.stringify({
            query: `
                query search($token: String, $bodySite: JSON) {
                    sites: search(token: $token, body: $bodySite, db: "` + localStorage.getItem("db") + `", collection: "vuejx_site")
                }
            `,
            variables: {
                token: localStorage.getItem('token'),
                bodySite: bodySite
            },
        }),
        redirect: 'follow'
    };
    let defaultWeb = '';
    let defaultGroup = '';
    await fetch("/admin/vuejx/", requestOptions)
    .then(response => response.json())
    .then(result => {
        const response = result.data;
        if (Array.isArray(response.sites["hits"]["hits"]) && response.sites["hits"]["hits"].length > 0) {
            const webNavData = JSON.parse(response.sites["hits"]["hits"][0]['_source']['webNavData']);
            if (Array.isArray(webNavData) && webNavData.length > 0) {
                defaultWeb = Object.values(webNavData[0])[0]['shortName']
                window.db.set('webNav', { id: 'webNav', page: webNavData })
                result['webNav'] = webNavData;
            }
            const webGroupData = JSON.parse(response.sites["hits"]["hits"][0]['_source']['webGroupData']);
            console.log('webGroupData', webGroupData);
            if (Array.isArray(webGroupData) && webGroupData.length > 0) {
                defaultGroup = Object.values(webGroupData[0])[0]['shortName']
                window.db.set('groupNav', { id: 'groupNav', page: webGroupData })
                result['groupNav'] = webGroupData;
            }
            if (response.sites["hits"]["hits"][0]['_source']['ext_menu']) {
                localStorage.setItem('ext_menu', response.sites["hits"]["hits"][0]['_source']['ext_menu'])
            }
        }

    })
    .catch(error => {console.log('error', error);});
    return result;
};

window.initPage = async function (visibilityF, page) {
    return await initPage(visibilityF, page);
}
window.buildPageView = async function (data) {
    return await buildPage(data);
}
window.buildSiteView = async function (data) {
    return await buildSite(data);
}

let index = 0;
async function startUI() {
    if (window.Vue) {

        window.Vue.$axios = axios;
        window.Vue.doneInit = false;
        window.Vue.initBuild = {
            page: async function(curPagex, indexPagex) {
                return await initBuildPage(curPagex, indexPagex);
            },
            initPageProcess:  async function(visibilityF, page) {
                return await initPage(visibilityF, page);
            }
        };
        
        let curPage = window.Vue.router.currentRoute.value.params.page;
        if (window.Vue.router.currentRoute.value.params.visibility === 'login') {
            curPage = 'login'
        }
        window.Vue.$root = {
            $store: {
                dispatch: async function(func, postData) {
                    return await window.VueJX.dispatch(func, postData);
                }
            },
            dispatch: async function(func, postData) {
                return await window.VueJX.dispatch(func, postData);
            }
        }

        window.Vue.component('vuejx-header-simple', VueJXHeaderSimple);
        window.Vue.component('vuejx-nav-vertical', VueJXNavVertical);
        window.Vue.component('vuejx-nav-vertical-info', VueJXNavVerticalInfo);
        window.Vue.component('vuejx-table-simple', Table);
        window.Vue.component('vuejx-table-simple-khcn', tableSimpleKhcn);
        window.Vue.component('vuejx-table-simple-khcn-guest', tableSimpleKhcn);
        window.Vue.component('vuejx-view-khcn', tableViewKhcn);
        window.Vue.component('vuejx-table-pagging', tableSimplePagging);
        window.Vue.component('vuejx-table-simple-khcn-top', tableSimpleTop);
        window.Vue.component('vuejx-menu-aggs', VueJXMenuAggs);
        window.Vue.component('vuejx-menu-aggs-view', VueJXMenuAggsView);
        window.Vue.component('qlvt-filter', QLVTFilter);
        window.Vue.component('vuejx-data-report', VuejxDataReport);
        window.Vue.component('vuejx-done', VuejxDone);
        window.Vue.component('mt-quan-trac', MTQuanTrac);
        window.Vue.component('vuejx-preview-report', MTPreview);
        window.Vue.component('vuejx-leaflet-wrap', VueJXLeafletWrap);
        window.Vue.component('vuejx-table-simple-selected', tableSimpleSelect);
        window.Vue.component('vuejx-table-simple-khcn-static', tableSimpleKhcnStatic);
        window.Vue.component('vn-data-cms', VuejxCMS);
        
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
        window.Vue.redirect_page = function (page, ignore, toQuery, clear) {
            try {
                let queryX = window.Vue.router.currentRoute.value.query;
                if (Array.isArray(ignore)) {
                    let queryRouter = [];
                    for (const key in queryX) {
                        if (clear) {
                            queryRouter.push({
                                key: key,
                                value: ''
                            })
                        } else if (ignore.indexOf(key) == -1 && key != '_t' && key != 't') {
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
                    if (toQuery && Array.isArray(toQuery)) {
                        queryRouter = [...queryRouter, ...toQuery]
                    }
                    window.Vue.redirect(queryRouter, true, page)
                }
            } catch (error) {
                
            }
        }
        window.Vue.redirect = function (data, refresh, otherPage, clean, mutiple, isFormFilter, ext) {
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

        window.Vue.dateViewYear = function (item, key, defaultVal) {
            const datetime = window.Vue.get(item, key, defaultVal)
            if (datetime && String(datetime) != '0') {
                const curDate = new Date(parseInt(datetime))
                if (new Date(parseInt(datetime)) == "Invalid Date") {
                    return defaultVal
                } else {
                    return curDate.getFullYear()
                }
            } else {
                return defaultVal
            }
        },
        window.Vue.dateViewMonthYear = function (item, key, defaultVal) {
            let curDateStr = window.Vue.dateView(item, key, defaultVal)
            if (curDateStr) {
                return curDateStr.substr(3)
            } else {
                return defaultVal
            }
        },
        window.Vue.dateView = function (item, key, defaultVal, dateFormat) {
            const datetime = window.Vue.get(item, key, defaultVal)
            if (datetime && String(datetime) != '0') {
                const curDate = new Date(parseInt(datetime))
                if (new Date(parseInt(datetime)) == "Invalid Date") {
                    return defaultVal
                } else {
                    return formatDate(curDate)
                }
            } else {
                return defaultVal
            }
        },
        window.Vue.dateTimeView = function (item, key, defaultVal, dateFormat) {
            const datetime = window.Vue.get(item, key, defaultVal)
            if (datetime && String(datetime) != '0') {
                const curDate = new Date(parseInt(datetime))
                if (new Date(parseInt(datetime)) == "Invalid Date") {
                    return defaultVal
                } else {
                    return formatDateTimeX(curDate)
                }
            } else {
                return defaultVal
            }
        },
        window.Vue.objectView = function (item, key, defaultVal) {
            let result = window.Vue.get(item, key, defaultVal)
            if (result && typeof result == 'string') {
                result = result.replace(/\n/g, '<br/>')
            }
            return result
        }
        window.Vue.objectViewObject = function (item, key, defaultVal) {
            return window.Vue.get(item, key, defaultVal)
        }
        window.Vue.doneInit = true;
       
    } else {
        index++
        await sleep(50);
        if (index < 200) {
            await startUI();
        }
    }
}
startUI();
