export default {
    methods: {
        async init(conditionAggs, keyCode) {
            let vm = this;
            const aggsData = await window.VueJX.aggs(vm, 'danh_muc', vm.$parent._.props.group_by, 1, 1, vm.$parent._.props.valKey, vm.$parent._.props.textKey, vm.$parent.excludeXXX, conditionAggs, vm.$parent._.props.re_calculator, vm.$parent._.props.keywords, vm.$parent._.props.queryParam, vm.$parent._.props.publicData, vm.$parent._.props.multiple, vm.$parent._.props.pageCountNext, vm.$parent._.props.range, vm.$parent._.props.custom_label);
            if (aggsData && aggsData.pageCount == 0 && vm.$parent._.data.collectionDM) {
                let keyCodeQuery = {};
                keyCodeQuery[vm.$parent.valKey] = keyCode;
                const searchData = await window.VueJX.search(vm, vm.$parent._.data.collectionDM, [], [], [{
                    match: keyCodeQuery
                }], vm.$parent._.props.columns, null, null, 1, false, 1);
                if (searchData && searchData.totalRecord > 0) {
                    try {
                        vm.detail = {
                            name: searchData.dataResults[0]._source[vm.$parent.textKey]
                        };
                    } catch (error) {
                        
                    }
                }
            } else {
                vm.detail = aggsData && Array.isArray(aggsData.items) && aggsData.items.length > 0 ? aggsData.items[0] : {}
            }
        },
        menuToParMutiple() {
            let menuQuery = [ { key: "typeView", value: "" }, { key: "_page", value: "1" } ];
            menuQuery.push({
                key: this.$parent._.props.group_by["keyAggs"], value: ""
            })
            window.Vue.redirect(menuQuery, true);
        }
    },
    mounted: function() {
        let vm = this;
        vm.$nextTick(function() {
            setTimeout(async () => {
                let doInit = true;
                let keyCode = window.Vue.router.currentRoute.value.query[vm.$parent.group_by["keyAggs"]];
                vm.multiple = vm.$parent._.props.multiple;
                for (const el of vm.$parent.items) {
                    if (String(el.code) == String(keyCode)) {
                        doInit = false;
                        break;
                    }
                }
                if (doInit && keyCode) {
                    let aggsQuery = JSON.parse(JSON.stringify(vm.$parent._.props.conditionAggs));
                    if (keyCode && Array.isArray(keyCode) && 1 == 2) {
                        let shouldMultiple = {
                            bool: {
                                must: []
                            }
                        }
                        for (let elKeyword of keyCode) {
                            let query = {};
                            query[vm.$parent._.props.group_by["keyAggs"]] = elKeyword !== "NULL" ? elKeyword : "";
                            shouldMultiple["bool"]["must"].push({
                                match: query,
                            });
                        }
                        aggsQuery.push(shouldMultiple);
                    } else {
                        let queryEX = {};
                        queryEX[vm.$parent.group_by["keyAggs"]] = keyCode;
                        aggsQuery.push( {
                            match: queryEX
                        });
                    }
                    await vm.init(aggsQuery, keyCode);
                }
            }, 0);
        });
    },
    data: ()  => ({
        detail: {},
        multiple: false
    }),
    template: `
    <div v-if="detail && detail.name" class="flex justify-start cursor-pointer hover:text-blue-700 hover:bg-gray-200 px-2 py-2 relative border-b border-gray-200 text-blue-700 bg-gray-200">
        <i v-if="multiple" @click="menuToParMutiple" class="mdi mdi-checkbox-marked absolute left-0 top-0 text-sm" style="margin-top: 12px; margin-left: 8px" ></i>
        <div @click="menuToParMutiple" class="text-sm w-full mr-8" :class="{'ml-5': multiple }"> {{ detail.name }}  </div>
        <i @click="menuToParMutiple" v-if="!noreport" class="absolute right-0 top-0 not-italic text-blue-700 text-sm" style="margin-top: 10px; margin-right: 13px" >
            {{ detail.counter ? detail.counter : 0 }}
        </i>
    </div>
    `
}