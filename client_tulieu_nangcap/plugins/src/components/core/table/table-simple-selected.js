export default {
    props: {
        table_class: { type: String, default: "border-b w-full bg-white" },
        table_view: { type: String, default: "" },
        title_remove: { type: String, default: "xoá" },
        custom_table: { type: Boolean, default: () => { return false } },
        remove: { type: Boolean, default: () => { return false } },
        crud: { type: Boolean, default: () => { return false } },
        import_data: { type: Boolean, default: () => { return false } },
        export_data: { type: Boolean, default: () => { return false } },
        export_data_label: { type: String, default: () => { return 'Export' } },
        noHeader: { type: Boolean, default: () => { return false } },
        noRouterr: { type: Boolean, default: () => { return false } },
        storage: { type: Object, default: () => { return null } },
        widthSTT: { type: Number, default: () => { return 50; } },
        filter_options: {  type: Array, default: () => { return []; } },
        table_config: { type: Array, default: () => { return []; } },
        title: { type: String, default: "" },
        detailPage: { type: String, default: "" },
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
        skeleton: { type: Object, default: () => { return { th: [], td: [] } } },
        exportTemplate: { type: String, default: "" },
        exportTemplateTitle: { type: String, default: "" },
        aggs_ext: { type: String, default: "" },
        aggs_ext_keyAggs: { type: String, default: "" },
        placeholderKeyowrds: { type: String, default: "Tìm kiếm ..." },
        treeParentKey: { type: String, default: "LoaiChiTieuRoot" },
        state_query: { type: Array, default: null },
        inlineFilter: { type: Boolean, default: () => { return false } },
        inlineSearch: { type: Boolean, default: () => { return false } },
        modelName: { type: String, default: "" },
        realTotalPick: { type: Number, default: () => { return 0 } }
    },
    methods: {
        async init(inline_query) {
            let vm = this;
            vm.renderData = false;
            vm.rows = vm.pagesize;
            let query = window.Vue.router.currentRoute.value.query;
            let customPagging = null;
            if (inline_query) {
                customPagging = {};
                for (const el of inline_query) {
                    if (el.key === "_s_n") {
                        customPagging.sortNext = el.value
                    }
                    if (el.key === "_s_b") {
                        customPagging.sortBack = el.value
                    }
                    if (el.key === "_pagging") {
                        customPagging.paggingType = el.value
                    }
                    if (el.key === "_page") {
                        customPagging.page = el.value
                    }
                    if (el.key === "_sizeLast") {
                        customPagging.sizeLast = el.value > 0 ? el.value : vm.pagesize;
                        customPagging.size = el.value > 0 ? el.value : vm.pagesize;
                    }
                }
                if (!customPagging.size) {
                    customPagging.size = vm.pagesize;
                    customPagging.sizeLast = vm.pagesize;
                }
            }
            if (query.adv_filter) {
                vm.adv_filter = query.adv_filter;
            } else {
                vm.adv_filter = false;
            }
            if (!vm.paging) { vm.rows = vm.pagesize; vm.page = 1; }
            vm.aggReport = {};

            if (Array.isArray(vm.keywords) && vm.keywords.length == 0) {
                for (const elCf of vm.table_config) {
                    vm.keywords.push(String(elCf.value).replace('_source.', '') + '.raw')
                }
            }
            if (vm.noRouterr && !customPagging) {
                customPagging = {
                    page: 1,
                    paggingType: "first",
                    size: vm.pagesize,
                    sizeLast: vm.pagesize,
                    sortBack: "",
                    sortNext: ""
                }
            }
            const searchData = await window.VueJX.search(vm, vm.collection, vm.keywords, vm.queryFilter, vm.condition, vm.includes, vm.sort, vm.storage, vm.rows, vm.queryParam, vm.sizeLast, customPagging, vm.inlineSearchQuery);
            vm.dataResults = searchData.dataResults;
            if (vm.dataResults && vm.dataResults.length < vm.rows) {
                vm.pages = Math.floor(searchData.totalRecord / vm.rows) + 1
            } else {
                vm.pages = searchData.pages;
            }
            vm.page = searchData.page;
            vm.totalRecord = searchData.totalRecord;
            vm.sortNext = searchData.sortNext;
            vm.sortBack = searchData.sortBack;
            vm.rows = searchData.size;
            vm.renderData = true;
            vm.bodyQuery = searchData.bodyQuery;
        },
        dateView(item, key, defaultVal, dateFormat) { return window.Vue.dateView(item, key, defaultVal, dateFormat) },
        objectView(item, key, defaultVal) { return window.Vue.objectView(item, key, defaultVal) },
        toDetail(id) { 
            if (this.detailPage && this.detailPage.indexOf('?') != -1) {
                let [pageDetail, queryxxx] = this.detailPage.split('?');
                let buildQuery = [{ key: "_id", value: id ? id : "NULL" }];
                if (queryxxx && queryxxx.indexOf('&') != -1) {
                    let listQuery = queryxxx.split('&');

                    for (let el of listQuery) {
                        if (el && el.indexOf('=') != -1) {
                            const [keyx, valx] =  el.split('=');
                            buildQuery.push({ key: keyx, value: valx })
                        } else {
                            buildQuery.push({ key: el, value: '' })
                        }
                    }
                }
                window.Vue.redirect(buildQuery, false, pageDetail) 
            } else {
                window.Vue.redirect([{ key: "_id", value: id ? id : "NULL" }], false, this.detailPage) 
            }
            
        },
        async paggingData(type) {
            let vm = this;
            let typsPa = type;
            let queryBuild = [];
            vm.sizeLast = vm.rows;
            const paramsQuery = new URLSearchParams(window.location.href)
            if (type === 'next') { vm.page = parseInt(vm.page) + 1; if (vm.page >= vm.pages) { vm.page = vm.pages; vm.sizeLast = vm.totalRecord - vm.rows * (vm.page - 1); } if (Array.isArray(vm.sortNext) && vm.sortNext.length > 0) { vm.sortBack = vm.sortNext; }
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
            if (vm.sizeLast != vm.rows) {
                queryBuild.push({ key: "_sizeLast", value: vm.sizeLast })
            }
            if (type === 'rows') { queryBuild.push({ key: "_page", value: 1 }); queryBuild.push({ key: "_rows", value: vm.rows }) } else { queryBuild.push({ key: "_page", value: vm.page }) }
            if (!vm.noRouterr) {
                if ("undefined" !== typeof window.history.pushState ) {
                    let paggingURL = '/#' + window.Vue.router.currentRoute.value.path + '?t=' + new Date().getTime();
                    for (const el of queryBuild) { if (el.key != 't') { paggingURL += '&' + el.key + '=' + el.value } }
                    const query = window.Vue.router.currentRoute.value.query;
                    for (const elQuery in query) { if (['_page', 't', '_s_n', '_s_b'].indexOf(elQuery) == -1) { paggingURL += '&' + elQuery + '=' + query[elQuery] } }
                    if (vm.inlineSearchQuery) {
                        window.history.pushState({}, '', paggingURL);
                        await vm.init();
                    } else {
                        vm.renderData = false;
                        await vm.init(queryBuild);
                        vm.renderData = true;
                    }
                } else { 
                    if (vm.inlineSearchQuery) {
                        vm.renderData = false;
                        await vm.init(queryBuild);
                        vm.renderData = true;
                    } else {
                        window.Vue.redirect(queryBuild)
                    }
                }
            } else {
                vm.renderData = false;
                await vm.init(queryBuild);
                vm.renderData = true;
            }
            
        },
        async inlineSearchAction(datax) {
            let vm = this;
            vm.inlineSearchQuery = {}
            let data = {keywords: datax.keywords, customadv: {}};
            for (let el of vm.filter_options) {
                if (datax.customadv && typeof datax.customadv == 'object' && datax.customadv[el.keyCode]) {
                    data['customadv'][el.keyCode] = datax.customadv[el.keyCode]
                }
            }
            if (data && data.keywords) {
                vm.inlineSearchQuery = { ...vm.inlineSearchQuery, ...{keywords: data.keywords} };
            } else {
                delete vm.inlineSearchQuery['keywords']
            }
            if (data && data.customadv && Object.keys(data.customadv).length > 0) {
                if (data.keywords.trim() == '') {
                    delete data.keywords
                }
                delete data.customadv['menu']
                delete data.customadv['_view']
                delete data.customadv['_id']
                if (Object.keys(data.customadv).length > 0) {
                    vm.inlineSearchQuery = { ...vm.inlineSearchQuery, ...data.customadv };
                }
            }
            if (vm.inlineSearchQuery && Object.keys(vm.inlineSearchQuery).length > 0) {
                vm.paggingData('first')
                vm.$emit('inlineSearchAction', {modelName: vm.modelName, state: true})
            } else {
                vm.inlineSearchQuery = null
                vm.$emit('inlineSearchAction', {modelName: vm.modelName, state: false})
            }
        }
    },
    watch: {
        '$route': async function(newRoute, oldRoute) {
            let pageSitePrepare = window.VueJX.page()
            if (oldRoute.params.page == pageSitePrepare) {
                let vm = this;
                vm.renderData = false;
                vm.renderData = true;
            }
        }
    },
    mounted: function() {
        let vm = this;
        vm.$nextTick(function() {
            vm.renderData = false;
            setTimeout(async () => {
                vm.renderData = true;
            }, 0);
        });
    },
    data: ()  => ({
        itemxxx: {},
        renderData: false,
        site: localStorage.getItem('site'),
        rows: 15,
        sizeLast: 15,
        dataResults: [],
        dataResultsChild: {},
        page: 1,
        pages: 1,
        totalRecord: 0,
        sortBack: [],
        sortNext: [],
        paggingType: '',
        indexTree: '',
        keyTree: '',
        checkAll: false,
        ids: [],
        adv_filter: false,
        bodyQuery: null,
        aggReport: {},
        inlineSearchQuery: {}
    }),
    template: `
    <div v-if="custom_table"><slot name="custom_view" v-bind:data="dataResults"></slot></div>
    <div class="vuejx__table" v-else>
        <div class="top-content flex" v-if="!noHeader">
            <qlvt-filter @inlineSearchAction="inlineSearchAction" :inlineSearch="inlineSearch" :inlineFilter="inlineFilter" :state_query="state_query" :placeholderKeyowrds="placeholderKeyowrds" class=" flex-1" ref="filter" :filter_options="filter_options">
                <template v-slot:filter_button="{ submitSearch, showSearchAdvanced, clearSearch }">
                    <slot name="ext_btn"> 
                        <button aria-label="btn" v-if="!inlineFilter && filter_options.length > 0" class=" filter___adv font-semibold rounded border border-blue-700 text-blue-700 px-3 leading-none focus:outline-none hover:bg-blue-700 hover:text-white ml-2 whitespace-no-wrap" tabindex="-1" @click="showSearchAdvanced()">{{ adv_filter ? 'Xoá bộ lọc' : 'Nâng cao'}}</button>
                        <button aria-label="btn" v-if="crud" class="filter___add_cms whitespace-no-wrap ml-2 font-semibold rounded border border-blue-700 bg-blue-700 text-white px-3 pb-1 leading-none focus:outline-none hover:bg-white hover:text-blue-700" tabindex="-1" @click="toDetail('')">Thêm mới</button>
                        <button aria-label="btn" v-if="inlineSearchQuery && (inlineSearchQuery.keywords || inlineSearchQuery.customadv)" class="filter___add_cms whitespace-no-wrap ml-2 font-semibold rounded border border-blue-700 bg-blue-700 text-white px-3 pb-1 leading-none focus:outline-none hover:bg-white hover:text-blue-700" tabindex="-1" @click="clearSearch">Xoá tìm kiếm</button>
                    </slot>
                    <slot name="ext_btn_2"> 
                    </slot>
                    <button v-if="import_data" aria-label="btn" class=" filter___import whitespace-no-wrap ml-2 font-semibold rounded border border-blue-700 text-blue-700 px-3 pb-1 leading-none focus:outline-none hover:bg-white hover:text-blue-700" tabindex="-1">
                        <label for="formFile">Import</label>
                        <input class="hidden" type="file" id="formFile" @change="doImport">
                    </button>
                    <button v-if="export_data" aria-label="btn" class=" filter___import whitespace-no-wrap ml-2 font-semibold rounded border border-blue-700 text-blue-700 px-3 pb-1 leading-none focus:outline-none hover:bg-white hover:text-blue-700" tabindex="-1" @click="doExport">{{ export_data_label }}</button>
                </template>
            </qlvt-filter>
        </div>
        <button aria-label="btn" v-if="ids.length > 0" @click="doRemove" class="whitespace-no-wrap mb-2 font-semibold rounded border border-red-700 text-red-700 p-2 leading-none focus:outline-none hover:bg-red-200 hover:text-gray-900 px-3" tabindex="-1">
            Xác nhận {{title_remove}} {{ ids.length }} bản ghi.
        </button>
        <slot name="button_ext"></slot>
        <slot name="report_ext">
        <table v-if="!renderData" class="border-b w-full bg-white"> <thead class="w-full bg-white"> <slot name="thead"> <tr> <th width="50">STT</th> <th v-for="(item, index) of table_config" v-bind:key="index" :width="item.width" :class="item.class"> {{ item.title }} </th> </tr> </slot> </thead> <tbody class="w-full bg-white p-4"> <tr> <td colspan="100"> <p class="loading___table"> Chờ trong giây lát ... </p> </td> </tr> </tbody></table>
        <table :id="idtable" v-else :class="table_class">
        <thead :class="{ 'w-full': !employee__table }">
            <slot name="thead_title"> </slot>
            <slot name="thead"> <tr> <th v-if="table_view == 'tree'" width="40"></th><th v-if="remove" width="40" @click="pickAll">
                <i class="mdi mdi-checkbox-blank-outline " v-if="!checkAll"></i>
                <i class="mdi mdi-checkbox-marked " v-else></i>
            </th> <th width="50">STT</th> <th v-for="(item, index) of table_config" v-bind:key="index" :width="item.width" :class="item.class"> {{ item.title }} </th> </tr> </slot>
        </thead>
        <tbody class="border-b w-full bg-white"> <slot name="tbody" v-bind:page="rows" v-bind:data="dataResults"> <slot name="tbody_title"></slot>
            <template v-for="(item, index) in dataResults">
                <tr v-bind:key="index">
                    <td :width="widthSTT" align="center"
                    >{{ page * rows - rows + index + 1 }} </td>
                    <td v-for="(itemCf, indexx) of table_config" v-bind:key="indexx" :width="itemCf.width" 
                        :class="itemCf.class"    
                        @click="itemCf.action ? '' : toDetail(item._id)" >
                        <slot :name="'cell_' + indexx" v-bind:celldata="item">
                        </slot>
                    </td>
                </tr> 
            </template>
            </slot>
        </tbody>
        </table>
        <slot name="pagging">
        <header v-if="renderData && paging" class="bg-white flex items-center py-1 pr-4"><div class="flex"><button class="font-semibold text-blue-700 px-2 py-2 leading-none focus:outline-none hover:text-primary" tabindex="-1"  @click="paggingData('first')"  aria-label="first"> <i class="mdi" :class="{'mdi-chevron-double-left': !loadingAction}"></i> </button><button class="font-semibold text-blue-700 pl-0 pr-2 py-2 leading-none focus:outline-none hover:text-primary" tabindex="-1" @click="paggingData('prev')" aria-label="back" > <i class="mdi" :class="{'mdi-chevron-left': !loadingAction}"></i> </button><button class="text-blue-700 px-2 py-2 leading-none focus:outline-none hover:text-primary btn__pagging" tabindex="-1" > Trang {{ page }} / {{ pages }} </button><button v-if="page < pages" class="font-semibold text-blue-700 pl-2 pr-0 py-2 leading-none focus:outline-none hover:text-primary" tabindex="-1" @click="paggingData('next')" aria-label="next" > <i class="mdi" :class="{'mdi-chevron-right': !loadingAction}"></i> </button><button v-if="page < pages" class="font-semibold text-blue-700 px-2 py-2 leading-none focus:outline-none hover:text-primary" tabindex="-1" @click="paggingData('last')" aria-label="last"><i class="mdi" :class="{'mdi-chevron-double-right': !loadingAction}"></i> </button><button class="focus:outline-none btn__pagging_info" tabindex="-1"> <div> <h4 class="font-semibold"> <span>Tổng số bản ghi: </span> <span class='text-blue-700'>{{totalRecord}}</span> </h4> </div> </button></div> <div class="ml-auto"> 
            <span>Tổng số bản ghi đã chọn: <span class="font-bold"><slot name="total_pick">{{ realTotalPick }}</slot></span></span>
        </div></header>
        </slot></slot>
    </div>
    `
}