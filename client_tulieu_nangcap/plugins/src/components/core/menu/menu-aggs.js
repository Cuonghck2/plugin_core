export default {
    props: {
        storage: { type: String, default: () => { return 'regular' } },
        item_conditon: { type: Array, default: () => { return []; } },
        sort: { type: Array, default: () => { return [{order: 'asc'}]; } },
        placeholder: { type: String, default: "Tìm kiếm..." },
        redirect_page: { type: String, default: "" },
        database: { type: String, default: localStorage.getItem('db') },
        collection: { type: String, default: "" },
        title_header: { type: String, default: "" },
        showMenu: { type: Boolean, default: () => { return true; } },
        tree: { type: Boolean, default: false, },
        ignoreData: { type: Array, default: () => { return []; } },
        condition: { type: Array, default: () => { return []; } },
        conditionAggs: { type: Array, default: () => { return []; } }, 
        type: { type: String, default: "danh_muc" },
        group_by: { type: Object, default: null, },
        group_size: { type: Number, default: 100, },
        range: { type: Array, default: [], },
        aggs: { type: Object, default: null, },
        publicData: { type: String, default: "false", },
        single: { type: Array, default: ['_s_n', '_s_b', '_pagging', '_rows', '_page', '_sizeLast'] },
        pagging: { type: Boolean, default: false, },
        redirect: { type: Boolean, default: false, },
        noreport: { type: Boolean, default: false, },
        view_null: { type: Boolean, default: false, },
        custom_label: { type: Object, default: null, },
        custom_label_null: { type: String, default: "" },
        skeleton: { type: Object, default: { rows: 2, } },
        multiple: { type: Boolean, default: false, },
        show_empty_aggs: { type: Boolean, default: true, },
        keywords: { type: Array, default: [], },
        queryParam: { type: Boolean, default: true, },
        re_calculator: { type: Array, default: [], },
        re_calculator_key: { type: String, default: "" },
        textKey: { type: String, default: "title", },
        valKey: { type: String, default: "shortName", },
        queryFilter: { type: Array, default: () => { return []; } },
        columns: { type: Array, default: ["shortName", "title", "type", "parent", "MaMuc", "MaLoai",  "TenMuc", "TenGoi", "MaDinhDanh"] },
        filter_adv: { type: Boolean, default: true, },
        collection_danhmuc: { type: String, default: "" }
    },
    methods: {
        async init(exclude, next) {
            let vm = this;
            vm.renderDataLoading = false
            vm.renderData = false;
            vm.items = [];
            vm.paggingShow = String(vm.pagging) == 'true';
            if (vm.noreport && vm.collection) {
                const searchData = await window.VueJX.search(vm, vm.collection, vm.keywords, vm.queryFilter, vm.condition, vm.columns, vm.sort, {
                    match: {
                        storage: vm.storage
                    }
                }, vm.group_size, vm.queryParam, vm.group_size);
                let indexMenu = -1;
                const newRoute = window.Vue.router.currentRoute.value;
                const keyAQQ = newRoute.query[vm.group_by["keyAggs"]];
                vm.activeArray = [];
                vm.selectedMenuXXX = [];
                for (let el of searchData.dataResults) {
                    vm.items.push({ code: vm.objectView(el._source, vm.valKey), name: vm.objectView(el._source, vm.textKey), counter: '' });
                    indexMenu = indexMenu + 1;
                    if (Array.isArray(keyAQQ)) {
                        for (const ekey of keyAQQ) {
                            if (String(vm.objectView(el._source, vm.valKey)) === String(ekey)) {
                                if (vm.multiple) {
                                    vm.selectedMenuXXX.push(indexMenu);
                                } else {
                                    vm.selectedMenuXXX = [indexMenu];
                                }
                                break;
                            }
                        }
                    } else {
                        if (String(vm.objectView(el._source, vm.valKey)) === String(keyAQQ)) {
                            if (vm.multiple) {
                                vm.selectedMenuXXX.push(indexMenu);
                            } else {
                                vm.selectedMenuXXX = [indexMenu];
                            }
                        }
                    }
                    vm.activeArray = vm.selectedMenuXXX;
                }
            } else {
                let aggsData = null;
                if (vm.storage !== 'regular') {
                    vm.conditionAggs.push({
                        match: {
                            storage: vm.storage
                        }
                    })
                }
                if (vm.type === "danh_muc") {
                    aggsData = await window.VueJX.aggs(vm, vm.type, vm.group_by, vm.group_size, vm.pageCount, vm.valKey, vm.textKey, exclude, vm.conditionAggs, vm.re_calculator, vm.keywords, vm.queryParam, vm.publicData, vm.multiple, vm.pageCountNext, vm.range, vm.custom_label);
                } else if (vm.type === "range") {
                    aggsData = await window.VueJX.aggs(vm, vm.type, vm.group_by, vm.group_size, vm.pageCount, vm.valKey, vm.textKey, exclude, vm.conditionAggs, vm.re_calculator, vm.keywords, vm.queryParam, vm.publicData, vm.multiple, vm.pageCountNext, vm.range, vm.custom_label);
                } else if (vm.type === "fulltext") {
                    aggsData = await window.VueJX.aggs(vm, vm.type, vm.group_by, vm.group_size, vm.pageCount, vm.valKey, vm.textKey, exclude, vm.conditionAggs, vm.re_calculator, vm.keywords, vm.queryParam, vm.publicData, vm.multiple, vm.pageCountNext, vm.range, vm.custom_label);
                }
                vm.items = aggsData && aggsData.items ? aggsData.items : [];
                vm.pageCountNext = aggsData && aggsData.pageCountNext ? aggsData.pageCountNext : 0;
                vm.pageCount = aggsData && aggsData.pageCount ? aggsData.pageCount : 0;
                vm.selectedMenuXXX = aggsData && aggsData.selectedMenuXXX ? aggsData.selectedMenuXXX : [];
                vm.activeArray = aggsData && aggsData.activeArray ? aggsData.activeArray : [];
                if (vm.group_by['collection']) {
                    vm.collectionDM = vm.group_by['collection'];
                } else {
                    vm.collectionDM = aggsData && aggsData.collectionDM ? aggsData.collectionDM : '';
                }
                
            }
            if (vm.items.length === 0) {
                vm.pageCount = vm.pageCount - 1;
            }
            vm.renderData = true;
            setTimeout(() => {
                vm.renderDataLoading = true
            }, 0);
        },
        menuToParMutiple(item, indexMX) {
            let menuQuery = [ { key: "typeView", value: "" }, { key: "_page", value: "1" } ];
            if (!window.Vue.router.currentRoute.value.query.hasOwnProperty("_filterAction") || window.Vue.router.currentRoute.value.query["_filterAction"] !== "search") {
                menuQuery.push({ key: "_filterAction", value: "filter" });
            }
            this.activeArray = Array.from(new Set(this.activeArray));
            let inOO = 0;
            for (let el of this.activeArray) {
                if (el === indexMX) {
                    this.activeArray.splice(inOO, 1);
                }
                inOO = inOO + 1;
            }
            let newQQ = window.Vue.router.currentRoute.value.query[this.group_by["keyAggs"]];
            for (const el of this.single) {
                menuQuery.push({ key: el, value: "" });
            }
            if (this.view_null) {
                menuQuery.push({ key: this.group_by["keyAggs"], value: "NULL" });
            } else {
                if (this.type === 'range') {
                    let qFrom = window.Vue.router.currentRoute.value.query[this.group_by["keyAggs"] + '_from'];
                    let qTo = window.Vue.router.currentRoute.value.query[this.group_by["keyAggs"] + '_to'];
                    if (String(item["code"]) === String(qFrom + '-' + qTo)) {
                        const [ from, to ] = String(item.code).split('-');
                        menuQuery.push({ key: this.group_by["keyAggs"] + '_from', value: '' });
                        menuQuery.push({ key: this.group_by["keyAggs"] + '_to', value: '' });
                        item["index"] = -1;
                    } else {
                        const [ from, to ] = String(item.code).split('-');
                        menuQuery.push({ key: this.group_by["keyAggs"] + '_from', value: from });
                        menuQuery.push({ key: this.group_by["keyAggs"] + '_to', value: to });
                        this.activeArray.push(indexMX);
                    }
                } else {
                    if (Array.isArray(newQQ)) {
                        if (newQQ.indexOf(String(item.code)) > -1) {
                            newQQ.splice(newQQ.indexOf(String(item.code)), 1);
                        } else {
                            menuQuery.push({ key: this.group_by["keyAggs"], value: String(item.code).replace(/&/g, "%26") });
                            this.activeArray.push(indexMX);
                        }
                        for (const newText of newQQ) {
                            menuQuery.push({ key: this.group_by["keyAggs"], value: String(newText).replace(/&/g, "%26") });
                        }
                    } else {
                        if (String(item["code"]) === String(newQQ)) {
                            menuQuery.push({ key: this.group_by["keyAggs"], value: "" });
                        } else {
                            menuQuery.push({ key: this.group_by["keyAggs"], value: String(item.code).replace(/&/g, "%26") });
                            this.activeArray.push(indexMX);
                        }
                    }
                }
            }
            if (this.multiple) {
                if (window.Vue.router.currentRoute.value.query[this.group_by["keyAggs"]] && !Array.isArray(window.Vue.router.currentRoute.value.query[this.group_by["keyAggs"]])) {
                    if (String(item["code"]) !== String(window.Vue.router.currentRoute.value.query[this.group_by["keyAggs"]])) {
                        menuQuery.push({ key: this.group_by["keyAggs"], value: String(window.Vue.router.currentRoute.value.query[this.group_by["keyAggs"]]).replace(/&/g, "%26")});
                    }
                }
            }
            menuQuery.push({ key: '_state_aggs', value: this.group_by["keyAggs"] });
            if (this.redirect) {
                menuQuery = [];
                window.Vue.redirect(menuQuery, true, item.code, true);
            } else {
                window.Vue.redirect(menuQuery, true, null, false, this.multiple);
            }
        },
        menuToPar(item, indexMX) {
            this.activeArray = [];
            let menuQuery = [{ key: "typeView", value: "" }, { key: "_page", value: "1" }];
            if (!window.Vue.router.currentRoute.value.query.hasOwnProperty("_filterAction") || window.Vue.router.currentRoute.value.query["_filterAction"] !== "search") {
                menuQuery.push({ key: "_filterAction", value: "filter" });
            }
            let newQQ = window.Vue.router.currentRoute.value.query[this.group_by["keyAggs"]];
            for (const el of this.single) {
                menuQuery.push({ key: el, value: "" });
            }
            if (this.view_null) {
                menuQuery.push({ key: this.group_by["keyAggs"], value: "NULL" });
            } else {
                if (this.type === 'range') {
                    let qFrom = window.Vue.router.currentRoute.value.query[this.group_by["keyAggs"] + '_from'];
                    let qTo = window.Vue.router.currentRoute.value.query[this.group_by["keyAggs"] + '_to'];
                    if (String(item["code"]) === String(qFrom + '-' + qTo)) {
                        const [ from, to ] = String(item.code).split('-');
                        menuQuery.push({ key: this.group_by["keyAggs"] + '_from', value: '' });
                        menuQuery.push({ key: this.group_by["keyAggs"] + '_to', value: '' });
                        item["index"] = -1;
                    } else {
                        const [ from, to ] = String(item.code).split('-');
                        menuQuery.push({ key: this.group_by["keyAggs"] + '_from', value: from });
                        menuQuery.push({ key: this.group_by["keyAggs"] + '_to', value: to });
                        this.activeArray.push(indexMX);
                    }
                } else {
                    if (String(item["code"]) === String(newQQ)) {
                        menuQuery.push({ key: this.group_by["keyAggs"], value: "" });
                        item["index"] = -1;
                    } else {
                        menuQuery.push({ key: this.group_by["keyAggs"], value: String(item.code).replace(/&/g, "%26") });
                        this.activeArray.push(indexMX);
                    }
                }
            }
            menuQuery.push({ key: '_state_aggs', value: this.group_by["keyAggs"] });
            if (this.redirect) {
                menuQuery = [];
                if (this.redirect_page) {
                    window.Vue.redirect(menuQuery, true, this.redirect_page, true);
                } else {
                    window.Vue.redirect(menuQuery, true, item.code, true);
                }
            } else {
                if (this.redirect_page) {
                    window.Vue.redirect(menuQuery, true, this.redirect_page, false, false);
                } else {
                    window.Vue.redirect(menuQuery, true, null, false, false);
                }
            }
        },
        async nextAggs() {
            this.paggingAction = true;
            if (this.pageCountNext !== 0) {
                this.pageCount = this.pageCount + 1;
                await this.init(this.excludeXXX, true, this.filter);
            }
        },
        async backAggs() {
            this.paggingAction = true;
            this.pageCount = this.pageCount - 1;
            if (this.pageCount <= 0) {
                this.pageCount = 0;
            }
            await this.init(this.excludeXXXBack, false, this.filter);
        },
        toogleMenu() {
            this.showMenuScope = !this.showMenuScope
        },
        toogleMenuSearch() {
            this.toogleSearch = !this.toogleSearch;
        },
        objectView(item, key, defaultVal) {
          return window.Vue.objectView(item, key, defaultVal)
        },
        changeData(data) {
            let menuQuery = [{ key: "typeView", value: "", }, { key: "_page", value: "1" }];
            menuQuery.push({ key: this.group_by.keyAggs, value: data._source[this.valKey]});
            window.Vue.redirect(menuQuery, true);
        }
    },
    watch: {
        '$route': async function (newValue, oldValue) {
            if (this.group_by["keyAggs"] != newValue._state_aggs && newValue.params.page == oldValue.params.page) {
                this.paggingAction = false;
                await this.init([], true);
            }
        }
    },
    mounted: function() {
        let vm = this;
        vm.$nextTick(function() {
            setTimeout(async () => {
                vm.paggingAction = false;
                await vm.init([], true);
            }, 0);
        });
    },
    data: ()  => ({
        paggingShow: false,
        collectionDM: '',
        items: [],
        search: null,
        activeArray: [],
        open: [],
        tree: [],
        renderData: false,
        showPaggingSize: 0,
        showPaggingSizeTotal: 0,
        selectedMenu: [-1],
        ignore: {},
        pageCount: 1,
        pageCountNext: 1,
        excludeXXX: [],
        excludeXXXBack: [],
        activePage: window.Vue.router.currentRoute.value.params["page"],
        selectedMenuXXX: [],
        filter: [],
        paggingActive: true,
        showMenuScope: true,
        toogleSearch: false,
        paggingAction: false,
        renderDataLoading: false
    }),
    template: `
    <div class="vuejx__chips_filter mb-2" :class="{'done___loading': renderDataLoading}">
        <header class="bg-white flex items-center px-2 border-b border-gray-200" v-if="title_header" >
        <div class="flex"> <button aria-label="btn" class="focus:outline-none" tabindex="-1"> <div> <h4 class="font-semibold text-left truncate header___aggs"> {{ title_header }} </h4> </div> </button> </div>
        <div class="ml-auto">
            <button v-if="type === 'danh_muc' && filter_adv" aria-label="menu" class=" font-semibold rounded px-0 py-2 leading-none focus:outline-none hover:text-blue-700 mr-2" tabindex="-1" @click="toogleMenuSearch" > <i class="mdi mdi-search" style="color: inherit" ></i> </button>
            <button aria-label="menu" class=" font-semibold rounded  px-0 py-2 leading-none focus:outline-none hover:text-blue-700 " tabindex="-1" @click="toogleMenu" > <i v-if="showMenuScope" class="mdi mdi-chevron-double-up" style="color: inherit" ></i> <i v-else class="mdi mdi-chevron-double-down" style="color: inherit" ></i></button>
        </div>
        </header>
        <div v-if="!renderData && showMenuScope" class="bg-white p-3 py-1"> <div v-for="tdRow in skeleton['rows']" v-bind:key="tdRow"> <span class="skeleton-box h-4 mt-1 w-3/5 inline-block"></span> <span class="skeleton-box h-4 mt-1 w-1/12 inline-block" style="float: right" ></span></div> </div>
        <div v-else v-show="showMenuScope" class="bg-white">
            <vuejx-autocomplete v-if="toogleSearch && type === 'danh_muc'" :config="{
                    placeholder: placeholder,
                    modelView: 'object',
                    chips: false, 
                    object: true, 
                    itemText: '_source.' + textKey,
                    itemValue: '_source.' + valKey,
                    link: [ { db: database, collection: collection_danhmuc ? collection_danhmuc : collectionDM, condition: item_conditon, sort: collectionDM == 'C_TinhThanh' ? [{'TenMuc.keyword': 'asc'}] : sort } ],
                    column: columns, sort: sort
                }"
                @change_data="changeData"
            ></vuejx-autocomplete>
            <template v-if="type == 'danh_muc'">
                <vuejx-menu-aggs-view :key="items"
                    :collection_danhmuc="collection_danhmuc"
                    :items="items"
                    :group_size="group_size"
                    type="danh_muc"
                    :multiple="multiple"
                    :conditionAggs='conditionAggs'
                    :textKey="textKey"
                    :valKey="valKey"
                    :group_by="group_by"
                    :skeleton="skeleton"
                    :keywords="keywords"
                    :re_calculator="re_calculator"
                ></vuejx-menu-aggs-view>
            </template>
            <template v-if="renderData">
                <div class="flex justify-start cursor-pointer text-gray-900 hover:text-blue-700 hover:bg-gray-200 px-2 py-1 relative border-b border-gray-200 " :class="{ 'text-blue-700 bg-gray-200':  activeArray.indexOf(index) >= 0 }" v-for="(subItem, index) in items"  v-bind:key="index" >
                    <i v-if="multiple && activeArray.indexOf(index) >= 0" class="mdi mdi-checkbox-marked absolute left-0 top-0 text-sm" style="margin-top: 8px; margin-left: 8px"  @click="menuToParMutiple(subItem, index)" ></i>
                    <i v-else-if="multiple" class="mdi mdi-checkbox-blank-outline absolute left-0 top-0 text-sm" style="margin-top: 8px; margin-left: 8px" @click="menuToParMutiple(subItem, index)" ></i>
                    <div class="text-sm w-full" :class="{ 'mr-1': noreport, 'mr-8': !noreport, 'ml-5': multiple }" @click="menuToPar(subItem, index)" > {{ subItem["name"] }}  </div>
                    <i v-if="!noreport" class="absolute right-0 top-0 not-italic text-blue-700 text-sm" style="margin-top: 6px; margin-right: 13px"  @click="menuToPar(subItem, index)" >{{ subItem["counter"] }}</i>
                </div>
                <div class="flex justify-between relative" v-if="(paggingShow && renderData && items.length >= group_size) || paggingAction">
                    <button aria-label="btn" :class="{ 'cursor-not-allowed': pageCount === 0 || pageCount === 1, 'text-blue-700': pageCount > 1 }" @click="backAggs" class=" font-semibold  px-3 py-2 leading-none focus:outline-none hover:bg-primary hover:text-white" tabindex="-1" > <i class="mdi mdi-backburger text-xs"></i> </button>
                    <button aria-label="btn" :class="{ 'cursor-not-allowed': pageCountNext === 0, 'text-blue-700': pageCountNext !== 0 }" @click="nextAggs" class=" font-semibold px-3 py-2 leading-none focus:outline-none hover:bg-primary hover:text-white " tabindex="-1" > <i class="mdi mdi-forwardburger text-xs"></i></button>
                </div>
            </template>
        </div>
    </div>
    `
}