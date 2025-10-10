export default {
    props: {
        storage: { type: Object, default: () => { return null } },
        employee__table: { type: Boolean, default: false },
        idtable: { type: String, default: "table__to__export" },
        db: { type: String, default: () => { return localStorage.getItem("db"); } },
        collection: { type: String, default: () => { return ""; } },
        site: { type: String, default: () => { return ""; } },
        includes: { type: Array, default: () => { return []; } },
        sort: { type: Array, default: () => { return []; } },
        pagesize: { type: Number, default: () => { return 15; } },
        paging: { type: Boolean, default: () => { return true; } },
        condition: { type: Array, default: () => { return []; } },
        queryFilter: { type: Array, default: () => { return []; } },
        keywords: { type: Array, default: () => { return []; } },
        queryParam: { type: Boolean, default: () => { return true; } },
        empty: { type: Boolean, default: () => { return false; } },
        skeleton: { type: Object, default: () => { return { th: [], td: [] } } }
    },
    methods: {
        async init() {
            let vm = this;
            vm.renderData = false;
            vm.rows = vm.pagesize;
            if (!vm.paging) { vm.rows = vm.pagesize; vm.page = 1; }
            const searchData = await window.VueJX.search(vm, vm.collection, vm.keywords, vm.queryFilter, vm.condition, vm.includes, vm.sort, vm.storage, vm.rows, vm.queryParam, vm.sizeLast);
            vm.dataResults = searchData.dataResults;
            vm.pages = searchData.pages;
            vm.page = searchData.page;
            vm.totalRecord = searchData.totalRecord;
            vm.sortNext = searchData.sortNext;
            vm.sortBack = searchData.sortBack;
            vm.rows = searchData.size;
            vm.renderData = true;
        },
        dateView(item, key, defaultVal, dateFormat) { return window.Vue.dateView(item, key, defaultVal, dateFormat) },
        objectView(item, key, defaultVal) { return window.Vue.objectView(item, key, defaultVal) },
        toDetail(id) {  window.Vue.redirect([{ key: "_id", value: id ? id : "NULL" }], false, this.detailPage) },
        async paggingData(type) {
            let vm = this;
            let typsPa = type;
            let queryBuild = [];
            vm.sizeLast = vm.rows;
            const paramsQuery = new URLSearchParams(window.location.href)
            if (type === 'next') { vm.page = parseInt(vm.page) + 1; if (vm.page >= vm.pages) { vm.page = vm.pages; } if (Array.isArray(vm.sortNext) && vm.sortNext.length > 0) { vm.sortBack = vm.sortNext; }
            } else if (type === 'prev') { vm.page = parseInt(vm.page) - 1; if (paramsQuery.get('_s_b')) { vm.sortNext = JSON.parse(decodeURIComponent(paramsQuery.get('_s_b'))); }
            } else if (type === 'first') { vm.page = 1; } else if (type === 'last') { vm.page = vm.pages; vm.sizeLast = vm.totalRecord - vm.rows * (vm.page - 1);}
            queryBuild.push({ key: "t", value: new Date().getTime() })
            if (vm.page <= 1) {
                vm.page = 1; typsPa = 'first';
                queryBuild.push({ key: "_s_n", value: '' }); queryBuild.push({ key: "_s_b", value: '' });
            } else if (vm.page <= vm.pages) {
                if (Array.isArray(vm.sortNext) && vm.sortNext.length > 0) { queryBuild.push({ key: "_s_n", value: encodeURIComponent(JSON.stringify(vm.sortNext)) }) }
                if (Array.isArray(vm.sortBack) && vm.sortBack.length > 0) { queryBuild.push({ key: "_s_b", value: encodeURIComponent(JSON.stringify(vm.sortBack)) }) }
            }
            queryBuild.push({ key: "_pagging", value: typsPa })
            queryBuild.push({ key: "_rows", value: vm.rows })
            if (type === 'rows') { queryBuild.push({ key: "_page", value: 1 }); queryBuild.push({ key: "_rows", value: vm.rows }) } else { queryBuild.push({ key: "_page", value: vm.page }) }
            if ("undefined" !== typeof window.history.pushState ) {
                let paggingURL = '/#' + window.Vue.router.currentRoute.value.path + '?t=' + new Date().getTime();
                for (const el of queryBuild) { if (el.key != 't') { paggingURL += '&' + el.key + '=' + el.value } }
                const query = window.Vue.router.currentRoute.value.query;
                for (const elQuery in query) { if (['_page', 't', '_s_n', '_s_b'].indexOf(elQuery) == -1) { paggingURL += '&' + elQuery + '=' + query[elQuery] } }
                window.history.pushState({}, '', paggingURL);
                await vm.init();
            } else { window.Vue.redirect(queryBuild) }
        }
    },
    watch: {
        '$route': async function(newRoute, oldRoute) {
            let pageSitePrepare = window.VueJX.page()
            if (oldRoute.params.page == pageSitePrepare) {
                let vm = this;
                vm.renderData = false;
                await vm.init();
                vm.renderData = true;
            }
        }
    },
    mounted: function() {
        let vm = this;
        vm.$nextTick(function() {
            vm.renderData = false;
            setTimeout(async () => {
                await vm.init();
                vm.renderData = true;
            }, 0);
        });
    },
    data: ()  => ({
        renderData: false,
        site: localStorage.getItem('site'),
        rows: 15,
        sizeLast: 15,
        dataResults: [],
        page: 1,
        pages: 1,
        totalRecord: 0,
        sortBack: [],
        sortNext: [],
        paggingType: ''
    }),
    template: `
    <div class="vuejx__table overflow-hidden">
        <table v-if="!renderData" class="w-full"> <thead class="w-full"> <slot name="thead"></slot> </thead> <tbody class="w-full p-4"> <tr> <td colspan="100"> <p class="loading___table"> Chờ trong giây lát ... </p> </td> </tr> </tbody> </table>
        <table :id="idtable" v-else class="w-full"> <thead class="w-full"> <slot name="thead"></slot> </thead> <tbody class="w-full"> <slot name="tbody" v-bind:page="rows" v-bind:data="dataResults"></slot> </tbody> </table>
        <header v-if="renderData && paging" class="bg-white flex items-center py-1 pr-4"><div class="flex"><button class="font-semibold text-blue-700 px-2 py-2 leading-none focus:outline-none hover:text-primary" tabindex="-1"  @click="paggingData('first')"  aria-label="first"> <i class="mdi" :class="{'mdi-chevron-double-left': !loadingAction}"></i> </button><button class="font-semibold text-blue-700 pl-0 pr-2 py-2 leading-none focus:outline-none hover:text-primary" tabindex="-1" @click="paggingData('prev')" aria-label="back" > <i class="mdi" :class="{'mdi-chevron-left': !loadingAction}"></i> </button><button class="text-blue-700 px-2 py-2 leading-none focus:outline-none hover:text-primary btn__pagging" tabindex="-1" > Trang {{ page }} / {{ pages }} </button><button v-if="page < pages" class="font-semibold text-blue-700 pl-2 pr-0 py-2 leading-none focus:outline-none hover:text-primary" tabindex="-1" @click="paggingData('next')" aria-label="next" > <i class="mdi" :class="{'mdi-chevron-right': !loadingAction}"></i> </button><button v-if="page < pages" class="font-semibold text-blue-700 px-2 py-2 leading-none focus:outline-none hover:text-primary" tabindex="-1" @click="paggingData('last')" aria-label="last"><i class="mdi" :class="{'mdi-chevron-double-right': !loadingAction}"></i> </button><button class="focus:outline-none btn__pagging_info" tabindex="-1"> <div> <h4 class="font-semibold"> <span>Tổng số bản ghi: </span> <span class='text-blue-700'>{{totalRecord}}</span> </h4> </div> </button></div> <div class="ml-auto"> <span>Hiển thị</span> <input style="width: 60px" class="text-center appearance-none bg-gray-200 text-blue-700 border border-gray-200 rounded py-1 px-1 focus:outline-none focus:bg-white focus:border-gray-400 ml-2" v-model="rows" @change="paggingData('rows')" type="text" aria-label="total" /></div></header>
    </div>
    `
}