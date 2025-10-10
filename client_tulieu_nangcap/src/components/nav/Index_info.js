export default {
    props: {
        collection: { type: String, default: () => { return ""; } },
        id: { type: String, default: () => { return ""; } },
        db: { type: String, default: () => { return ""; } },
        groupid: { type: String, default: () => { return ""; } },
        teleport: { type: String, default: () => { return "default_nav"; } }
    },
    methods: {
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
        toGroupPage (type) {
            window.db.get(type + 'Nav').get().then(
            async(document) => {
                if (document && Array.isArray(document.page) && document.page.length > 0) {
                    window.location.href = "/#/" + type + "/" + window.Vue.router.currentRoute.value.params.site + '/' + Object.values(document.page[0])[0]['shortName'];
                } else {
                    window.location.href = "/#/" + type + "/" + window.Vue.router.currentRoute.value.params.site;
                }
            })
        },
        async doChangePassAction() {
            let vm = this;
            await window.Vue.$axios.post('/security/guest/processAccountPassword', {
                passwordNew: vm.passwordNew,
                passwordNewConfirm: vm.passwordConfirm,
                token: localStorage.getItem('token')
            }, {
                headers: {
                    'db': localStorage.getItem('db'),
                    'Content-Type': 'application/json; charset=utf-8',
                    'Accept': 'application/json, text/plain, */*',
                }
            })
            .then((response) => {
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
            if (localStorage.getItem("user")) {
                vm.user = JSON.parse(localStorage.getItem("user"));
            }
        }
    },
    mounted: function() {
        let vm = this;
        if (localStorage.getItem("user")) {
            vm.user = JSON.parse(localStorage.getItem("user"));
        }
    },
    data: ()  => ({
        renderPage: false,
        pages: [],
        defaultPage: '',
        defaultPageGroup: '',
        user: null,
        page: '',
        password: '',
        passwordNew: '',
        passwordConfirm: '',
        changePass: false,
        defaultNav: true
    }),
    template: `
    <div class="left">

        <div class="item">
            <button aria-label="btn" class="label" v-if="user"> <i class="mdi mdi-account-circle" /> <span>{{ user?.title }}</span> </button>
            <button aria-label="btn" class="label" @click="toLogin" v-else> <i class="mdi mdi-power-settings-new" /> <span>Đăng nhập</span> </button>
            <div class="dropdown" v-if="user">
                <div @click="toGroupPage('web')"> <button aria-label="btn" class="dropdown-child">Trang khai thác</button> </div>
                <div> <div class="divider"></div> </div>
                <div @click="toGroupPage('group')"> <button aria-label="btn" class="dropdown-child">Trang quản trị</button> </div>
                <div> <div class="divider"></div> </div>
                <div @click="changePass = !changePass"> <button aria-label="btn" class="dropdown-child">Đổi mật khẩu</button> </div>
                <div> <div class="divider"></div> </div>
                <div @click="doLogout"> <button aria-label="btn" class="dropdown-child">Đăng xuất</button> </div>
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
                        Đổi mât khẩu
                        </h3>
                    </div>
                    </div>
                </div>
                <div class="p-4">
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
        
    </div>
    `
}