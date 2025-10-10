import { createApp } from 'vue'
import App from './App.vue'
import VueJX from './components/vuejx-kit.js';
import router from './router';
import './style.css'

const prefix = localStorage.getItem('db').toLocaleLowerCase() + '___' + localStorage.getItem('site').toLocaleLowerCase();

window.buildSiteView = async function (data, appversion) {

    if (appversion && appversion != data.appversion) {
        delete window.Vue._context.components[data.shortName + '___web_header']
        delete window.Vue._context.components[data.shortName + '___group_header']
        delete window.Vue._context.components[data.shortName + '___web_footer']
        delete window.Vue._context.components[data.shortName + '___group_footer']
    }
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

            vueSiteGroup['props'] = {
                siteCss: {
                    type: String,
                    default: '<style type="text/css">' + data.cssConfig + '</style>'
                }
            }
            vueSiteGroup['template'] = '<div v-html="siteCss"></div> ' + vueSiteGroup['template'];
            window.Vue.component(data.shortName + '___group_header', vueSiteGroup);
    }
    if (data.guestFooterConfig && data.guestFooterConfig.length > 50) {
        let guestFooterConfig = eval("( " + data.guestFooterConfig + " )");
        window.Vue.component(data.shortName + '___web_footer', guestFooterConfig);
    }
    if (data.groupFooterConfig && data.groupFooterConfig.length > 50) {
        let groupFooterConfig = eval("( " + data.groupFooterConfig + " )");
        window.Vue.component(data.shortName + '___group_footer', groupFooterConfig);
    }
    window.db.set(prefix, { 
        id: prefix, 
        shortName: prefix, 
        guestHeaderConfig: data.guestHeaderConfig, 
        groupHeaderConfig: data.groupHeaderConfig, 
        guestFooterConfig: data.guestFooterConfig, 
        groupFooterConfig: data.groupFooterConfig, 
        cssConfig: data.cssConfig, appversion: data.appversion
    })
    
}

window.buildPageView = async function (data, appversion) {
    
    let vueForm = eval("( " + data.pageConfig + " )");
    if (vueForm) {
        vueForm['props'] = {
            siteCss: {
                type: String,
                default: '<style type="text/css">' + data.cssConfig + '</style>'
            }
        }
        vueForm['template'] = vueForm['template'] + ' <div v-html="siteCss"></div> ';
        if (appversion && appversion != data.appversion) {
            delete window.Vue._context.components[prefix + '___' + data.shortName]
        }
        window.Vue.component(prefix + '___' + data.shortName, vueForm);
        window.db.set(prefix + '___' + data.shortName, { id: data.shortName, shortName: data.shortName, pageConfig: data.pageConfig, cssConfig: data.cssConfig, appversion: data.appversion })
    }

    if (data.pageFooterConfig && data.pageFooterConfig.length > 50) {
        let vueFormHeader = eval("( " + data.pageHeaderConfig + " )");
        if (appversion && appversion != data.appversion) {
            delete window.Vue._context.components[prefix + '___' + data.shortName + '___header']
        }
        window.Vue.component(prefix + '___' + data.shortName + '___header', vueFormHeader);
        window.db.set(prefix + '___' + data.shortName + '___header', { id: data.shortName, shortName: data.shortName, pageConfig: data.pageHeaderConfig, cssConfig: data.cssConfig, appversion: data.appversion })
    }
    if (data.pageFooterConfig && data.pageFooterConfig.length > 50) {
        let vueFormFooter = eval("( " + data.pageFooterConfig + " )");
        if (appversion && appversion != data.appversion) {
            delete window.Vue._context.components[prefix + '___' + data.shortName + '___footer']
        }
        window.Vue.component(prefix + '___' + data.shortName + '___footer', vueFormFooter);
        window.db.set(prefix + '___' + data.shortName + '___footer', { id: data.shortName, shortName: data.shortName, pageConfig: data.pageFooterConfig, cssConfig: data.cssConfig, appversion: data.appversion })
    }
}

const app = createApp(App)
    .use(VueJX).use(router);

router.isReady().then(() => {
    app.mount('#app')
})    