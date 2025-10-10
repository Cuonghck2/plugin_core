export default {
    props: {
        collection: { type: String, default: () => { return ""; } },
        id: { type: String, default: () => { return ""; } },
        db: { type: String, default: () => { return ""; } },
        groupid: { type: String, default: () => { return ""; } }
    },
    methods: {
        toPage (item) {
            this.page = item.shortName;
            if (!item.targetURL) {
                const current = window.Vue.router.currentRoute.value;
                window.Vue.redirect(null, true, "/" + current.params.visibility + "/" + localStorage.getItem("site") + "/" + item.shortName, true);
            } else {
                if (item.targetMode == 1) { window.open(item.targetURL, "_blank"); } else { window.location.href = item.targetURL; }
            }
        },
        async doLogout () {
            try {
                window.db.set('groupNav', { id: 'groupNav', page: [] })
                window.db.set('groupNav', { id: 'webNav', page: [] })
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
                    vm.renderPage = true;
                } else {
                    await window.sleep(50);
                    await vm.pullNewPages()
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
        vm.renderPage = false;
        console.log('mountedmountedmountedmounted3');
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
            }, 0);
        });
    },
    data: ()  => ({
        renderPage: false,
        pages: [],
        defaultPage: '',
        defaultPageGroup: '',
        user: null,
        page: ''
    }),
    template: `<div class="vuejx__header" :key="pages"><slot name="header_top"></slot><div class="hd__screen"><div class="top-bar"><slot name="header_nav"><div class="left" tabindex="0"><div v-for="(item, index) in pages" v-bind:key="index" class="item" tabindex="0" :class="{ active: page ? page.startsWith(Object.values(item)[0].shortName) || String(Object.values(item)[0].activePage).indexOf(page + ',') !== -1 : false }"><button aria-label="btn" class="label" @click.stop="toPage(Object.values(item)[0])"> {{ Object.values(item)[0].title }} </button><div class="dropdown" v-if="Object.values(item)[0].sub___pages && Object.values(item)[0].sub___pages.length > 0"> <div v-for="(sub, indexSub) in Object.values(item)[0].sub___pages" v-bind:key="indexSub"> <button aria-label="btn" class="dropdown-child" @click.stop="toPage(sub['_source'])"> {{ sub._source?.title }} </button> </div> </div></div></div></slot><slot name="header_login"><div class="left" tabindex="0"><div class="item"><button aria-label="btn" class="label" v-if="user"> <i class="mdi mdi-account-circle" /> <span>{{ user?.title }}</span> </button><button aria-label="btn" class="label" @click="toLogin" v-else> <i class="mdi mdi-power-settings-new" /> <span>Đăng nhập</span> </button><div class="dropdown" v-if="user"><div @click="toGroupPage('web')"> <button aria-label="btn" class="dropdown-child">Trang khai thác</button> </div><div> <div class="divider"></div> </div><div @click="toGroupPage('group')"> <button aria-label="btn" class="dropdown-child">Trang quản trị</button> </div><div> <div class="divider"></div> </div><div @click="doLogout"> <button aria-label="btn" class="dropdown-child">Đăng xuất</button> </div></div></div></div></slot></div></div></div>`
}