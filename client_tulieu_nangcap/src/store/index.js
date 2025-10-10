/* eslint-disable */
import { reactive, readonly } from "vue";

const state = reactive({
    loading: false,
    currentPage: '',
    doneInit: false,
    //ext params
    dynamic_page: globalThis.dynamic_page ? globalThis.dynamic_page.split(',') : [],
    redirect: localStorage.getItem('redirect'),
    visibility: localStorage.getItem('token') ? 'group' : 'web',
    site: localStorage.getItem('site'),
    db: localStorage.getItem('db'),
    token: localStorage.getItem('token'),
    web_height: localStorage.getItem('web_height'),
    group_height: localStorage.getItem('group_height'),
    web_nav: {},
    group_nav: {},
    versionApp: localStorage.getItem('versionApp') ? parseInt(localStorage.getItem('versionApp')) : 0
})

const methods = {
    setOpen(type) {
        state.loading = type
    },
    setCurrentPage(page) {
        state.currentPage = page
    },
    setDoneInit(todo) {
        state.doneInit = todo
    },
    setSite(site) {
        state.site = site
    },
    setWebNav(web_nav) {
        state.web_nav = web_nav
    },
    setGroupNav(group_nav) {
        state.group_nav = group_nav
    },
    async buildComp(pageConfig, page) {
        let vueComp = eval(
            "( " + pageConfig + " )"
        )
        window.Vue.component(page + '___' + state.currentPage + '___' + state.site, vueComp);
        window.db.set(page + '___' + state.currentPage + '___' + state.site, {
            id: page + '___' + state.currentPage + '___' + state.site, 
            page: pageConfig
        });
    }
}

const getters = {

    async graphqlQuery(query, variables) {
        let result = null
        variables['token'] = state.token;
        variables['db'] = state.db;
        var myHeaders = new Headers();
	    myHeaders.append("Content-Type", "application/json");
		var raw = JSON.stringify({
            query: query,
            variables: variables,
        });
	    var requestOptions = {
	      method: 'POST',
	      headers: myHeaders,
	      body: raw,
	      redirect: 'follow'
	    };
        return new Promise((resolve, reject) => {
            fetch("/admin/vuejx/", requestOptions)
            .then(response => response.json())
            .then(result => {
                if (result) {
                    console.log(result);
                    resolve(result.data)
                }        
            })
            .catch(error => {reject(null)});
        });
    }

}

export default {
    state: readonly(state),
    methods,
    getters
}