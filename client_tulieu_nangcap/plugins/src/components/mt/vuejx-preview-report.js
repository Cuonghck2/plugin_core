export default {
    props: {
        group: { type: String, default: () => { return ""; } },
        phuluc: { type: String, default: () => { return ""; } },
        userCreate: { type: String, default: () => { return ''; } },
        all_page: { type: Boolean, default: () => { return false; } }
    },
    mounted: function() {
        let vm = this;
        vm.$nextTick(function() {
            vm.donePreview = false;
            if (localStorage.getItem("user")) {
                vm.user = JSON.parse(localStorage.getItem("user"));
            }
            setTimeout(async () => {
                let conditonBM =  [{
                    match: {
                        group: vm.group
                    }
                }]
                if (vm.phuluc) {
                    conditonBM.push({
                        match: {
                            phuluc: vm.phuluc
                        }
                    })
                }
                const searchData = await window.VueJX.search(vm, 'vuejx_page_screen', [], [], conditonBM, ['pageConfig', 'shortName'], [{'order': 'asc'}], null, 100, false, 100, null);
                vm.preview_cfg = searchData.dataResults;
                console.log('vm.preview_cfg', vm.preview_cfg, vm.group, vm.phuluc);
                for (let el of vm.preview_cfg) {
                    console.log('el', el);
                    if (el && el._source && el._source.pageConfig) {
                        let dynamicView = { 
                            pageConfig: el._source.pageConfig,
                            shortName: 'preview___component___' + el._source.shortName
                        };
                        await window.buildPageView(dynamicView)
                    }
                }
                vm.donePreview = true;
                setTimeout(() => {
                  vm.$emit('reportDone', 'OK');
                }, 300);
            }, 0);
        });
    },
    methods: {
        sampleData() {

        },
        pullDataByYear() {

        },
        pullDataByDate() {
            
        },
        async dataReport(query) {
           let aggsQuery = `
             query search($token: String, 
         `;
           let variables = {};
           let aggsQueryBody = ` `;
           let objectReport = {};
           for (let queryEl of query) {
             let keyName = Object.keys(queryEl)[0];
             let publicData = "false";
             if (queryEl[keyName]["publicData"]) {
               publicData = String(queryEl[keyName]["publicData"]);
             }
             aggsQuery =
               aggsQuery +
               " $body" +
               keyName +
               ": JSON, $db" +
               keyName +
               ": String, $collection" +
               keyName +
               ": String";
             if (queryEl[keyName]["type"] === "data") {
               aggsQueryBody =
                 aggsQueryBody +
                 " " +
                 keyName +
                 ": search(token: $token, body: $body" +
                 keyName +
                 ", db: $db" +
                 keyName +
                 ", collection: $collection" +
                 keyName +
                 " ), ";
             } else {
               aggsQueryBody =
                 aggsQueryBody +
                 " " +
                 keyName +
                 ": aggs(token: $token, body: $body" +
                 keyName +
                 ", db: $db" +
                 keyName +
                 ", collection: $collection" +
                 keyName +
                 ', publicData: "' +
                 publicData +
                 '" ), ';
             }
             if (queryEl[keyName]["report"]) {
               objectReport[keyName] = true;
             } else {
               objectReport[keyName] = false;
             }
             variables["body" + keyName + ""] = queryEl[keyName]["body"];
             variables["db" + keyName + ""] = localStorage.getItem("db");
             variables["collection" + keyName + ""] = queryEl[keyName]["collection"];
           }
           aggsQuery = aggsQuery + ` ){ ` + aggsQueryBody + ` } `;
           console.log('aggsQueryaggsQueryaggsQueryaggsQuery', aggsQuery, variables);
           let resultxxx = null;
           await window.VueJX
             .dispatch("vuejx_manager/graphqlQuery", {
               query: aggsQuery,
               variables: variables
             })
             .then(data => {
                resultxxx = data;
             })
             .catch(err => {
             });
             return resultxxx;
        }
    },
    data: ()  => ({
        preview_cfg: [],
        donePreview: false,
        user: {}
    }),
    template: `
    <div class="preview___wrap" v-if="donePreview">
        <component v-for="(item, index) in preview_cfg" v-bind:is="'csdl_baocaodoanhnghiep___csdl_mt___preview___component___' + item._source.shortName"></component>
    </div>
    `
}