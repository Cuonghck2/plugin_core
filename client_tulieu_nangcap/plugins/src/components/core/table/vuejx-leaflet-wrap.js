export default {
    props: {
        item: { type: Object, default: () => { return { } } },
        data: { type: Object, default: () => { return { } } },
        mode: { type: String, default: () => { return 'editor' }}
    },
    methods: {
        async init(inline_query) {
            let vm = this;
            if (!window.L) {
                await window.sleep(200)
            }
            if (!window.L) {
                await window.sleep(200)
            }
            vm.dataForm = {...vm.dataForm, ...vm.data}
            console.log('vm.dataFormvm.dataForm', vm.dataForm);
            if (vm.map) {
                vm.map.off();
                vm.map.remove();
                vm.doneMap()
            }
        },
        async doneMap() {
            let vm = this;
            try {
                var pin;
                vm.map = window.L.map('mapContainer').setView([vm.dataForm[vm.item.model + '.KinhDo'] ? vm.dataForm[vm.item.model + '.KinhDo'] : 21.0294498, vm.dataForm[vm.item.model + '.ViDo'] ? vm.dataForm[vm.item.model + '.ViDo'] : 105.8544441], vm.zoom);
                var tiles = window.L.tileLayer(vm.url, {
                zoom: vm.zoom,  
                maxZoom: vm.maxZoom,
                attribution: vm.attribution
                }).addTo(vm.map);
                if (vm.dataForm[vm.item.model + '.KinhDo']  && vm.dataForm[vm.item.model + '.ViDo'] ) {
                    pin = window.L.marker([vm.dataForm[vm.item.model + '.KinhDo'], vm.dataForm[vm.item.model + '.ViDo']],{ riseOnHover:true,draggable:true });
                    pin.addTo(vm.map);
                }
                vm.provider = new window.GeoSearch.OpenStreetMapProvider()

                vm.map.on('click', function(ev) {
                vm.dataForm[vm.item.model + '.KinhDo'] = ev?.latlng?.lat
                vm.dataForm[vm.item.model + '.ViDo'] = ev?.latlng?.lng
                if (typeof pin == "object") {
                    pin.setLatLng(ev.latlng);
                    vm.$emit("doneMapData", vm.dataForm);
                }
                else {
                    pin = window.L.marker(ev.latlng,{ riseOnHover:true,draggable:true });
                    pin.addTo(vm.map);
                    pin.on('drag',function(ev) {
                    vm.dataForm[vm.item.model + '.KinhDo'] = ev?.latlng?.lat
                    vm.dataForm[vm.item.model + '.ViDo'] = ev?.latlng?.lng
                    vm.$emit("doneMapData", vm.dataForm);
                    });
                }
                });
            } catch (error) {
                vm.dataForm[vm.item.model + '.KinhDo'] = null
                vm.dataForm[vm.item.model + '.ViDo'] = null
            }
              
        },
        debounceSearch(event) {
            let vm = this;
            vm.searchDiaDiem = null
            clearTimeout(vm.debounce)
            vm.debounce = setTimeout(async () => {
                vm.searchDiaDiem = event.target.value
                vm.resultsDiaDiem = await vm.provider.search({ query: String(vm.searchDiaDiem).trim() });
            }, 300)
        },
        dataChange() {
            let vm = this;
            vm.map.off();
            vm.map.remove();
            vm.doneMap()
            vm.$emit("doneMapData", vm.dataForm);
        },
        pickLocation(itemSearch) {
            let vm = this;
            vm.dataForm[vm.item.model + '.KinhDo'] = itemSearch?.y
            vm.dataForm[vm.item.model + '.ViDo'] = itemSearch?.x
            vm.searchDiaDiem = ''
            vm.resultsDiaDiem = []
            vm.map.off();
            vm.map.remove();
            vm.doneMap()
            vm.$emit("doneMapData", vm.dataForm);
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
    watch: {
        '$route': async function(newRoute, oldRoute) {
            let vm = this;
            vm.renderData = false;
            await vm.init();
            vm.renderData = true;
        }
    },
    data: ()  => ({
        zoom: 16,
        maxZoom: 20,
        renderData: false,
        dataForm: {},
        debounce: null,
        searchDiaDiem: '',
        resultsDiaDiem: [],
        provider: null,
        url: "//{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
        attribution: '<a target="_blank" href="https://vmap.vn/">vmap.vn</a>'
    }),
    template: `
    <vuejx-maps @done="doneMap">
        <div v-if="mode == 'editor'" class="grid grid-cols-4 gap-2 mb-4 px-0">
            <div v-if="item" :class="'vuejx_comp___kinhdo' + item['model']" class="col-span-1">
                <div class="block font-semibold leading-tight pb-1 truncate">
                    {{ item['label_kinhdo'] }}
                </div>
                <input v-model="dataForm[item.model + '.KinhDo']" class="p-2 ocus:cursor-text w-full border border-gray-200 focus:outline-none focus:bg-white focus:border-gray-400 rounded" :class="{'bg-gray-500 text-white pointer-events-none': item.disable, 'bg-gray-200 text-gray-700': !item.disable}" type="text" :placeholder="item['placeholder_kinhdo'] ? item['placeholder_kinhdo'] : 'Kinh độ...'" :disabled="item.disable"
                    @change="dataChange(item.model + '.KinhDo')"
                />
            </div>
            <div v-if="item" :class="'vuejx_comp___kinhdo' + item['model']" class="col-span-1">
                <div class="block font-semibold leading-tight pb-1 truncate">
                    {{ item['label_vido'] }}
                </div>
                <input v-model="dataForm[item.model + '.ViDo']" class="p-2 ocus:cursor-text w-full border border-gray-200 focus:outline-none focus:bg-white focus:border-gray-400 rounded" :class="{'bg-gray-500 text-white pointer-events-none': item.disable, 'bg-gray-200 text-gray-700': !item.disable}" type="text" :placeholder="item['placeholder_vido'] ? item['placeholder_vido'] : 'Vĩ độ...'" :disabled="item.disable"
                    @change="dataChange(item.model + '.ViDo')"
                />
            </div>
            <div v-if="item" :class="'vuejx_comp___map_search' + item['model']" class="col-span-2 relative">
                <div class="block font-semibold leading-tight pb-1 truncate">
                    Tìm kiếm địa chỉ...
                </div>
                <input class="p-2 ocus:cursor-text w-full border border-gray-200 focus:outline-none focus:bg-white focus:border-gray-400 rounded" :class="{'bg-gray-200 text-gray-700': !item.disable}" type="text" :placeholder="'Tìm kiếm...'"
                    @input="debounceSearch"
                />
                <div class="dropdown" :class="{'leaflet___search': resultsDiaDiem && resultsDiaDiem.length > 0}">
                    <div v-for="(itemSearch, index) in resultsDiaDiem">
                        <button @click="pickLocation(itemSearch)"
                        aria-label="btn" 
                        class="dropdown-child" style="word-break: break-word;white-space: break-spaces;font-weight: normal;">
                            {{ itemSearch.label }}
                        </button>
                    </div>
                </div>
            </div>
        </div>
        <div id="mapContainer" style="height: 600px; width:100%; overflow: hidden;"></div>
    </vuejx-maps>
    `
}