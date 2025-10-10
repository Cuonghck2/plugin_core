export default {
    props: {
        collection: { type: String, default: () => { return ""; } },
        id: { type: String, default: () => { return ""; } },
        db: { type: String, default: () => { return ""; } },
        groupid: { type: String, default: () => { return ""; } }
    },
    methods: {
        toPage (item) {
            try {
                if (item && item.sub___pages && item.sub___pages.length > 0) {
                    return;   
                }
                this.page = item.shortName;
                if (!item.targetURL) {
                    const current = window.Vue.router.currentRoute.value;
                    window.Vue.redirect(null, true, "/" + current.params.visibility + "/" + localStorage.getItem("site") + "/" + item.shortName, true);
                } else {
                    if (item.targetMode == 1) { window.open(item.targetURL, "_blank"); } else { window.location.href = item.targetURL; }
                }
            } catch (error) {
                
            }
        },
        async doLogout () {
            try {
                window.db.set('groupNav', { id: groupNav,  page: [] })
                window.db.set('webNav', { id: groupNav,  page: [] })
                localStorage.setItem("token", "");
                localStorage.setItem("user", "");
                localStorage.setItem("isAuthenticated", false);
                window.location.href = "/#/login";
            } catch (error) {
                window.location.href = "/#/login";
            }
        },
        toLogin () {
            window.location.href = "/#/login";
        },
        async toGroupPage (type) {
            let document = await window.db.get(type + 'Nav')
            if (document && Array.isArray(document.page) && document.page.length > 0) {
                window.location.href = "/#/" + type + "/" + window.Vue.router.currentRoute.value.params.site + '/' + Object.values(document.page[0])[0]['shortName'];
            } else {
                window.location.href = "/#/" + type + "/" + window.Vue.router.currentRoute.value.params.site;
            }
        },
        async pullNewPages(nav) {
            let vm = this;
            if (nav) {
                let document = await window.db.get(nav)
                if (document) {
                    vm.pages = document.page;
                    let isAdmin = false;
                    if (this.user && Array.isArray(this.user.role) && this.user.role.length > 0 && this.user.role.indexOf('admin') != -1) {
                        isAdmin = true;
                    }
                    for (let itemxxxx of vm.pages) {
                        let keyObj = Object.keys(itemxxxx)[0];
                        let objectData = Object.values(itemxxxx)[0];
                        itemxxxx[keyObj]['activePage'] = '';
                        let arrayActivePage = [];
                        vm.perchkx(isAdmin, itemxxxx, objectData, keyObj)
                        if (Array.isArray(objectData.sub___pages) && objectData.sub___pages.length > 0) {
                            for (let elChild of objectData.sub___pages) {
                                objectData = elChild._source;
                                keyObj = elChild._source.shortName;
                                arrayActivePage.push(keyObj);
                                vm.perchkx(isAdmin, elChild._source, objectData, keyObj)
                            }
                            itemxxxx[Object.keys(itemxxxx)[0]]['activePage'] = arrayActivePage.join(',');
                        }
                    }
                } else {
                    await window.sleep(50);
                    await vm.pullNewPages()
                }
            }
        },
        perchkx(isAdmin, itemxxxx, objectData, keyObj) {
            if (!isAdmin && itemxxxx && itemxxxx[keyObj]) {
                if (objectData.openAccess == '2') {
                    itemxxxx[keyObj]['perView'] = true;
                } else if (objectData.openAccess == '1' && this.user) {
                    itemxxxx[keyObj]['perView'] = true;
                } else if (objectData.openAccess == '0' && this.user && Array.isArray(objectData.accessRoles) && objectData.accessRoles.length > 0) {
                    let result = false;
                    for (const el of objectData.accessRoles) {
                        if (Array.isArray(this.user.role) && this.user.role.length > 0 && this.user.role.indexOf(el.shortName) != -1) {
                            if (el.permission == '4') {
                                result = false;
                                break;
                            } else {
                                result = true;
                                break;
                            }
                        }
                    }
                    itemxxxx[keyObj]['perView'] = result;
                } else {
                    if (this.user && Array.isArray(this.user.role) && this.user.role.length > 0 && this.user.role.indexOf('admin') != -1) {
                        itemxxxx[keyObj]['perView'] = true;
                    } else {
                        itemxxxx[keyObj]['perView'] = false;
                    }
                }
            } else if (itemxxxx && itemxxxx[keyObj]) {
                if (objectData.openAccess == '0' && this.user && Array.isArray(objectData.accessRoles) && objectData.accessRoles.length > 0) {
                    let result = false;
                    let notFount = false;
                    for (const el of objectData.accessRoles) {
                        if (Array.isArray(this.user.role) && this.user.role.length > 0 && this.user.role.indexOf(el.shortName) != -1) {
                            notFount = false;
                            if (el.permission == '5') {
                                result = false;
                                break;
                            } else {
                                result = true;
                                break;
                            }
                        } else {
                            notFount = true;
                        }
                    }
                    if (notFount) {
                        itemxxxx[keyObj]['perView'] = true;
                    } else {
                        itemxxxx[keyObj]['perView'] = result;
                    }
                } else {
                    itemxxxx[keyObj]['perView'] = true;
                }
            }
        }
    },
    watch: {
        '$route': async function(newRoute, oldRoute) {
            let vm = this;
            vm.renderPage = false;
            if (newRoute.params.visibility === 'group' || newRoute.params.visibility === 'web') {
                if (newRoute.params.visibility != oldRoute.params.visibility) {
                    vm.pages = [];
                    await vm.pullNewPages(newRoute.params.visibility + "Nav");
                }
            }
            if (localStorage.getItem("user")) {
                vm.user = JSON.parse(localStorage.getItem("user"));
            }
        }
    },
    mounted: function() {
        let vm = this;
        console.log('mountedmountedmountedmounted2');
        vm.renderPage = false;
        vm.render___header__nav = false;
        let visibility = window.Vue.router.currentRoute.value.params.visibility;
        vm.page = window.Vue.router.currentRoute.value.params.page;
        vm.$nextTick(function() {
            setTimeout(async () => {
                if (visibility === 'web' || visibility === 'group') {
                    await vm.pullNewPages(visibility + "Nav");
                }
                if (localStorage.getItem("user")) {
                    vm.user = JSON.parse(localStorage.getItem("user"));
                }
                for (let indexX = 0; indexX < 100; indexX++) {
                    if (document.getElementById('body___container__header_view')) {
                        setTimeout(() => {
                            vm.render___header__nav = true;
                        }, 0);
                        break;
                    } else {
                        await window.sleep(20);
                    }
                }
            }, 0);
        });
    },
    data: ()  => ({
        renderPage: false,
        pages: [],
        defaultPage: '',
        defaultPageGroup: '',
        user: null,
        page: '',
        render___header__nav: false
    }),
    template: `<div v-if="render___header__nav"><slot name="menu_top_right"><Teleport to="#body___container__header_view"><span></span></Teleport></slot></div><nav class="tree-nav" :key="pages"><detailsv-for="(item, index) in pages" v-bind:key="index" tabindex="0":open="page ? page.startsWith(Object.values(item)[0].shortName) || String(Object.values(item)[0].activePage).indexOf(page + ',') !== -1 : false"class="tree-nav__item is-expandable":class="{ active: page ? page.startsWith(Object.values(item)[0].shortName) || String(Object.values(item)[0].activePage).indexOf(page + ',') !== -1 : false }"><summary@click="toPage(Object.values(item)[0])"class="tree-nav__item-title relative":class="{ active: page ? page.startsWith(Object.values(item)[0].shortName) || String(Object.values(item)[0].activePage).indexOf(page + ',') !== -1 : false }"><i class="mdi icon_nav" :class="Object.values(item)[0].shortName"></i><span>{{ Object.values(item)[0].title }}</span><svg v-if="Object.values(item)[0].sub___pages && Object.values(item)[0].sub___pages.length > 0" class="absolute right-0 expand___tree" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M19.9201 8.94995L13.4001 15.47C12.6301 16.24 11.3701 16.24 10.6001 15.47L4.08008 8.94995" stroke="#8A8E95" stroke-width="1.5" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round"/></svg></summary><div class="wrap__tree__child"><details  v-if="Object.values(item)[0].sub___pages && Object.values(item)[0].sub___pages.length > 0"v-for="(itemChild, indexChild) in Object.values(item)[0].sub___pages"v-bind:key="indexChild"class="tree-nav__item is-expandable"><summary@click="toPage(Object.values(itemChild)[0])"class="tree-nav__item-title flex":class="{ active: page ? page.startsWith(Object.values(itemChild)[0].shortName) || String(Object.values(itemChild)[0].activePage).indexOf(page + ',') !== -1 : false }"><i class="mdi mdi-chevron-right"></i><span>{{ Object.values(itemChild)[0].title }}</span></summary></details></div></details></nav>`
}