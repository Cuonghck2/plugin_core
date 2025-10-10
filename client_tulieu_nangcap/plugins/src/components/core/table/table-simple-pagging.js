export default {
    props: {
        page: { type: Number, default: () => { return 1; } },
        pages: { type: Number, default: () => { return 1; } },
        size: { type: Number, default: () => { return 15; } },
        sizeLast: { type: Number, default: () => { return 0; } },
        totalRecord: { type: Number, default: () => { return 0; } },
        sortBack: { type: Array, default: () => { return []; } },
        sortNext: { type: Array, default: () => { return []; } }
    },
    methods: {
        async paggingData(type) {
            let vm = this;
            vm.sizeLastX = vm.rows;
            vm.curPage = vm.page;
            let paggingType = type;
            if (paggingType === 'next') { 
                vm.curPage = parseInt(vm.page) + 1; 
                if (vm.page >= vm.pages) { vm.curPage = vm.pages; }
            } else if (paggingType === 'prev') { 
                vm.curPage = parseInt(vm.page) - 1;
            } else if (paggingType === 'first') { 
                vm.curPage = 1; 
            } else if (paggingType === 'last') { 
                vm.curPage = vm.pages; 
                vm.sizeLastX = vm.totalRecord - vm.rows * (vm.curPage - 1)
            }
            if (vm.curPage <= 1) {
                vm.curPage = 1; paggingType = 'first';
            } else if (vm.page <= vm.pages) {
            }
            vm.$emit('pagging', {
                sizeLast: vm.sizeLastX,
                page: vm.curPage,
                pages: vm.pages,
                size: vm.size,
                totalRecord: vm.totalRecord,
                sortBack: vm.sortBack,
                sortNext: vm.sortNext,
                paggingType: paggingType
            })
        }
    },
    mounted: function() {
        let vm = this;
        vm.$nextTick(function() {
            setTimeout(async () => {
                if (vm.sizeLast == 0) {
                    vm.rows = vm.size;
                } else if (vm.sizeLast) {
                    vm.rows = vm.sizeLast;
                } else {
                    vm.rows = vm.size;
                }
            }, 0);
        });
    },
    data: ()  => ({
        sizeLastX: 15,
        curPage: 1,
        rows: 15
    }),
    template: `
        <header class="bg-white flex items-center py-1 pr-4"><div class="flex"><button class="font-semibold text-blue-700 px-2 py-2 leading-none focus:outline-none hover:text-primary" tabindex="-1"  @click="paggingData('first')"  aria-label="first"> <i class="mdi mdi-chevron-double-left"></i> </button><button class="font-semibold text-blue-700 pl-0 pr-2 py-2 leading-none focus:outline-none hover:text-primary" tabindex="-1" @click="paggingData('prev')" aria-label="back" > <i class="mdi mdi-chevron-left"></i> </button><button class="text-blue-700 px-2 py-2 leading-none focus:outline-none hover:text-primary btn__pagging" tabindex="-1" > Trang {{ page }} / {{ pages }} </button><button v-if="page < pages" class="font-semibold text-blue-700 pl-2 pr-0 py-2 leading-none focus:outline-none hover:text-primary" tabindex="-1" @click="paggingData('next')" aria-label="next" > <i class="mdi mdi-chevron-right"></i> </button><button v-if="page < pages" class="font-semibold text-blue-700 px-2 py-2 leading-none focus:outline-none hover:text-primary" tabindex="-1" @click="paggingData('last')" aria-label="last"><i class="mdi mdi-chevron-double-right"></i> </button><button class="focus:outline-none btn__pagging_info" tabindex="-1"> <div> <h4 class="font-semibold"> <span>Tổng số bản ghi: </span> <span class='text-blue-700'>{{totalRecord}}</span> </h4> </div> </button></div> <div class="ml-auto"> <span>Hiển thị</span> <input style="width: 60px" class="text-center appearance-none bg-gray-200 text-blue-700 border border-gray-200 rounded py-1 px-1 focus:outline-none focus:bg-white focus:border-gray-400 ml-2" v-model="rows" @change="paggingData('rows')" type="text" aria-label="total" /></div></header>
    `
}