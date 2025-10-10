<script>
export default {
    props: {
        collection: { type: String, default: () => { return ""; } },
        id: { type: String, default: () => { return ""; } },
        db: { type: String, default: () => { return ""; } },
        groupid: { type: String, default: () => { return ""; } },
        teleport: { type: String, default: () => { return "default_nav"; } }
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
        doLogout () {
            try {
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
        doChangePass() {
            const current = window.Vue.router.currentRoute.value;
            let toGPage = "/#/" + current.params.visibility + "/" + localStorage.getItem("site") + "/" + this.ssoLogin
            window.open(toGPage, "_blank");
        },
        async toGroupPage (type) {
            let document = await window.db.get(type + 'Nav')
            if (document && Array.isArray(document.page) && document.page.length > 0) {
                const toGPage = "/#/" + type + "/" + window.Vue.router.currentRoute.value.params.site + '/' + Object.values(document.page[0])[0]['shortName'];
                if (localStorage.getItem('menu_blank')) {
                    window.open(toGPage, "_blank");
                } else {
                    window.location.href = toGPage
                }
                //window.location.href = "/#/" + type + "/" + window.Vue.router.currentRoute.value.params.site + '/dashboard_group'
            } else {
                const toGPage = "/#/" + type + "/" + window.Vue.router.currentRoute.value.params.site;
                if (localStorage.getItem('menu_blank')) {
                    window.open(toGPage, "_blank");
                } else {
                    window.location.href = toGPage
                }
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
                        vm.perchkx(isAdmin, itemxxxx, objectData, keyObj)
                        if (Array.isArray(objectData.sub___pages) && objectData.sub___pages.length > 0) {
                            for (let elChild of objectData.sub___pages) {
                                objectData = elChild._source;
                                keyObj = elChild._source.shortName;
                                vm.perchkx(isAdmin, elChild._source, objectData, keyObj)
                            }
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
                            if (el.permission == '5') {
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
        },
        async doChangePassAction() {
            let vm = this;
            console.log("doChangePassAction")
            await window.Vue.$axios.post('/security/guest/processAccountPassword', {
                isChangePass: true,
                passwordOld: vm.passwordOld,
                passwordNew: vm.passwordNew,
                passwordConfirm: vm.passwordConfirm,
                token: localStorage.getItem('token')
            }, {
                headers: {
                    'db': localStorage.getItem('db'),
                    'Content-Type': 'application/json; charset=utf-8',
                    'Accept': 'application/json, text/plain, */*',
                }
            })
            .then((response) => {
                console.log("change passs response",response)
                if (response.data.status == 200) {
                    alert('Đổi mật khẩu thành công.')
                    vm.passwordOld = '';
                    vm.passwordNew = '';
                    vm.passwordConfirm = '';
                }
                vm.changePass = false;
            })
            .catch((error) => {
                alert('Đổi mật khẩu thất bại.')
            });
        }
    },
    watch: {
        '$route': async function(newRoute, oldRoute) {
            let vm = this;
            if (vm.teleport == 'default_nav') {
                vm.defaultNav = true;
            } else {
                vm.defaultNav = false;
            }
            if (localStorage.getItem("user")) {
                vm.user = JSON.parse(localStorage.getItem("user"));
            }
            vm.page = newRoute.params.page;
            if (newRoute.params.visibility === 'group' || newRoute.params.visibility === 'web') {
                if (newRoute.params.visibility != oldRoute.params.visibility) {
                    vm.renderPage = false;
                    vm.pages = [];
                    await vm.pullNewPages(newRoute.params.visibility + "Nav");
                    vm.renderPage = true;
                }
            }
        }
    },
    mounted: function() {
        let vm = this;
        vm.renderPage = false;
        let visibility = window.Vue.router.currentRoute.value.params.visibility;
        vm.page = window.Vue.router.currentRoute.value.params.page;
        if (vm.teleport == 'default_nav') {
            vm.defaultNav = true;
        } else {
            vm.defaultNav = false;
        }
        if (localStorage.getItem("user")) {
            vm.user = JSON.parse(localStorage.getItem("user"));
        }
        vm.$nextTick(function() {
            setTimeout(async () => {
                await window.initPage(visibility)
                if (visibility === 'web' || visibility === 'group') {
                    await vm.pullNewPages(visibility + "Nav");
                }
                vm.renderPage = true;
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
        password: '',
        passwordOld: '',
        passwordNew: '',
        passwordConfirm: '',
        changePass: false,
        defaultNav: true,
        ssoLogin: localStorage.getItem('SSO_LOGIN')
    }),
}
</script>

<template>
    <div class="vuejx__header">
        <slot name="header_top">
        </slot>
        <div v-if="defaultNav" :id="teleport" class="hd__screen"></div>
        <template v-if="renderPage">
            <Teleport :to="'#' + teleport">
            <div>
                <div class="top-bar">
                    <slot name="header_nav">
                        <div class="left" tabindex="0">

                            <template v-for="(item, index) in pages">

                                <div v-bind:key="index" class="item" tabindex="0" :class="{ active: page ? page.startsWith(Object.values(item)[0].shortName) || String(Object.values(item)[0].activePage).indexOf(page + ',') !== -1 : false, 'mr-2': Object.values(item)[0].sub___pages && Object.values(item)[0].sub___pages.length > 0 }"
                                    v-if="item && Object.values(item) && Object.values(item)[0] && Object.values(item)[0].perView"
                                >
                                    <button aria-label="btn" class="label" :class="Object.values(item)[0].shortName" @click.stop="toPage(Object.values(item)[0])"> {{ Object.values(item)[0].title }} <i v-if="Object.values(item)[0].sub___pages && Object.values(item)[0].sub___pages.length > 0" class="mdi mdi-chevron-double-down" style="margin-top: -2px;"></i> </button>
                                    <div class="dropdown" v-if="Object.values(item)[0].sub___pages && Object.values(item)[0].sub___pages.length > 0"> <div v-for="(sub, indexSub) in Object.values(item)[0].sub___pages" v-bind:key="indexSub"> <button aria-label="btn" class="dropdown-child" @click.stop="toPage(sub['_source'])"> {{ sub._source?.title }} </button> </div> </div>
                                </div>
                                
                            </template>
                            
                        </div>
                    </slot>
                    <slot name="header_login">
                        <div class="left" tabindex="0">
                            <div class="item">
                                <button aria-label="btn" class="label" v-if="user"> <i class="mdi mdi-account-circle" /> <span>{{ user?.title }}</span> </button>
                                <button aria-label="btn" class="label" @click="toLogin" v-else> <i class="mdi mdi-power-settings-new" /> <span>Đăng nhập</span> </button>
                                <div class="dropdown" v-if="user">
                                    <div @click="toGroupPage('web')"> <button aria-label="btn" class="dropdown-child guest___site">Trang khai thác</button> </div>
                                    <div> <div class="divider"></div> </div>
                                    <div @click="toGroupPage('group')"> <button aria-label="btn" class="dropdown-child">Trang quản trị</button> </div>
                                    <div> <div class="divider"></div> </div>
                                    <div v-if="ssoLogin" @click="doChangePass"> <button aria-label="btn" class="dropdown-child">Đổi mật khẩu</button> </div>
                                    <div v-else @click="changePass = !changePass"> <button aria-label="btn" class="dropdown-child">Đổi mật khẩu</button> </div>
                                    <div> <div class="divider"></div> </div>
                                    <div @click="doLogout"> <button aria-label="btn" class="dropdown-child">Đăng xuất</button> </div>
                                </div>
                            </div>
                        </div>
                    </slot>
                </div>
            </div>
            <div class="fixed z-10 inset-0 overflow-y-auto" style="z-index: 9999;" v-if="changePass">
                <div
                    class="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0"
                >
                    <div class="fixed inset-0 transition-opacity">
                    <div class="absolute inset-0 bg-gray-100 opacity-75"></div>
                    </div>

                    <span class="hidden sm:inline-block sm:align-middle sm:h-screen"></span>
                    <div
                        class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle w-1/4"
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="modal-headline"
                        style="z-index: 9999;"
                    >
                    <div class="bg-white px-4 py-2 border-b">
                        <div class="sm:flex sm:items-start">
                        <div class="text-center sm:mt-0 sm:text-left">
                            <h3
                            class="text-lg leading-6 font-semibold text-gray-900"
                            id="modal-headline"
                            >
                            Đổi mật khẩu
                            </h3>
                        </div>
                        </div>
                    </div>
                    <div class="p-4">
                        <div>
                        <div class="block font-semibold leading-normal truncate">
                            Mật khẩu cũ
                            <span
                            class="required__class"
                            >*</span>
                        </div>
                        <input
                            v-model="passwordOld"
                            class="p-2 focus:outline-none focus:cursor-text w-full border border-gray-200 bg-gray-200 text-gray-700 focus:outline-none focus:bg-white focus:border-gray-400 rounded"
                            type="password"
                            placeholder="Mật khẩu cũ"
                        />
                        </div>
                        <div>
                        <div class="block font-semibold leading-normal truncate">
                            Mật khẩu mới
                            <span
                            class="required__class"
                            >*</span>
                        </div>
                        <input
                            v-model="passwordNew"
                            class="p-2 focus:outline-none focus:cursor-text w-full border border-gray-200 bg-gray-200 text-gray-700 focus:outline-none focus:bg-white focus:border-gray-400 rounded"
                            type="password"
                            placeholder="Mật khẩu mới"
                        />
                        </div>
                        <div>
                        <div class="block font-semibold leading-normal truncate">
                            Xác nhận mật khẩu
                            <span
                            class="required__class"
                            >*</span>
                        </div>
                        <input
                            v-model="passwordConfirm"
                            class="p-2 focus:outline-none focus:cursor-text w-full border border-gray-200 bg-gray-200 text-gray-700 focus:outline-none focus:bg-white focus:border-gray-400 rounded"
                            type="password"
                            placeholder="Mật khẩu mới"
                        />
                        </div>

                    </div>
                    <div class="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                        <span class="flex w-full rounded-md shadow-sm sm:ml-3 sm:w-auto">
                        <button @click="doChangePassAction"
                            type="button"
                            class="inline-flex justify-center w-full rounded-md border border-transparent px-4 py-2 bg-red-600 text-base leading-6 font-medium text-white shadow-sm hover:bg-red-500 focus:outline-none focus:border-red-700 focus:shadow-outline-red transition ease-in-out duration-150 sm:text-sm sm:leading-5"
                        >
                            Xác nhận
                        </button>
                        </span>
                        <span
                        class="mt-3 flex w-full rounded-md shadow-sm sm:mt-0 sm:w-auto"
                        >
                        <button @click="changePass = !changePass"
                            type="button"
                            class="inline-flex justify-center w-full rounded-md border border-gray-300 px-4 py-2 bg-white text-base leading-6 font-medium text-gray-700 shadow-sm hover:text-gray-500 focus:outline-none focus:border-blue-300 focus:shadow-outline-blue transition ease-in-out duration-150 sm:text-sm sm:leading-5"
                        >
                            Quay lại
                        </button>
                        </span>
                    </div>
                    </div>
                </div>
            </div>
            </Teleport>
        </template>
    </div>
</template>