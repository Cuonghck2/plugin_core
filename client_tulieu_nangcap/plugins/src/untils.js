/* eslint-disable */
import axios from 'axios'
axios.defaults.headers.common.Accept = 'application/json'
axios.interceptors.response.use(function (response) {
    return response;
}, function (error) {
    window.Vue.loadingBar.finish();
    console.log(error);
    return Promise.reject(error);
});
export {axios}

export function sleep(ms) { return new Promise(res => setTimeout(res, ms)); }

export const found = async(entityRole, userObj) => {
    if (
        entityRole !== undefined && entityRole !== null && entityRole.length > 0
    ) {
        let result = true;

        entityRole.some((v) => {
            if (v.permission == 5 && userObj && userObj.role.indexOf(v.shortName) != -1) {
                result = false;
            }
        });

        return result;
    } else {
        return true;
    }
};

export async function pullScriptForm(pathFile, mode) {
    
    let result = '';
    if (pathFile.indexOf(',') != -1) {
        let URLs = pathFile.split(',');
        return Promise.all(URLs.map(URL => {
            return axios.get(URL, {
                responseType: 'text',
                transformResponse: [data => data],
            })
            .then(function(response) {
                return response.data
            })
            .catch(async function(error) {
    
            });
        }));
    } else {
        await axios.get(pathFile)
        .then((response) => {
            if (mode == 'text') {
                result = response.data
            } else {
                result = JSON.stringify(response.data)
            }
        })
        .catch(async (error) => {
            
        });
        return result;
    }
}

export async function processAxios(postData, key) {
    let result = null;
    postData.variables.token = localStorage.getItem("token")
    postData.variables.db = localStorage.getItem("db")
    if (postData?.variables?.collection) {
        await axios.post('/admin/vuejx/', postData)
        .then((response) => {
            result = window.Vue.get(response.data, key)
        }).catch(() => { window.Vue.toastr.error("Error."); result = {} });
    }
    return result;
}

export async function userById(postData){
    var queryDetail = `query add($token: String, $db: String, $collection: String, $id: String, $keys: JSON) {
        userById: userById(token: $token, db: $db, collection: $collection, id: $id, keys: $keys)
    }`;
    return await processAxios({
        query: queryDetail,
        variables: {
            collection: postData.collection,
            id: postData.id,
            keys: postData.keys
        },
    }, 'data.userById');
}

export async function userUpdateMany(postData){
    var queryDetail =`mutation add($token: String, $db: String, $collection: String, $body: JSON, $filter: JSON, $sort: JSON, $skip: Int, $limit: Int, $actionCode: String) {
        userUpdateMany: userUpdateMany(token: $token, db: $db, collection: $collection, body: $body, filter: $filter, sort: $sort, skip: $skip, limit: $limit, actionCode: $actionCode)
    }`;
    return await processAxios({
        query: queryDetail,
        variables: {
            collection: postData.collection,
            body: postData.body,
            filter: postData.filter,
            sort: postData.sort,
            skip: postData.skip,
            limit: postData.limit,
            actionCode: postData.actionCode
        },
    }, 'data.userUpdateMany');
}
export async function userOne(postData){
    var queryDetail = `query add($token: String, $db: String, $collection: String, $filter: JSON, $skip: Int, $sort: JSON, $keys: JSON) {
        userOne: userOne(token: $token, db: $db, collection: $collection, filter: $filter, skip: $skip, sort: $sort, keys: $keys)
    }`;
    return await processAxios({
        query: queryDetail,
        variables: {
            collection: postData.collection,
            filter: postData.filter,
            skip: postData.skip,
            sort: postData.sort,
            keys: postData.keys
        },
    }, 'data.userOne');
}

export async function processData(postData){
    let queryAction = null;
    if (postData && postData.body._id && typeof postData.body._id == 'string') {
        queryAction =  `mutation add($token: String, $db: String, $collection: String, $body: JSON, $actionCode: String) {
            queryAction: userUpdateById(token: $token, db: $db, collection: $collection, body: $body, actionCode: $actionCode)
        }`;
    }
    if (!queryAction) {
        queryAction = `mutation add($token: String, $db: String, $collection: String, $body: JSON, $actionCode: String) {
            queryAction: userCreate(token: $token, db: $db, collection: $collection, body: $body, actionCode: $actionCode)
        }`;
    }
    return await processAxios({
        query: queryAction,
        variables: {
            collection: postData.collection,
            body: postData.body,
            actionCode: postData.actionCode ? postData.actionCode : 'NEW'
        },
    }, 'data.queryAction');
}

export async function processDataOne(postData){
    let queryAction = null;
    queryAction =  `mutation add($token: String, $db: String, $collection: String, $body: JSON, $filter: JSON, $sort: JSON, $skip: Int, $actionCode: String) {
        queryAction: userUpdateOne(token: $token, db: $db, collection: $collection, body: $body, filter: $filter, sort: $sort, skip: $skip, actionCode: $actionCode)
    }`;
    const filter = postData.body.filter
    delete postData.body.filter
    return await processAxios({
        query: queryAction,
        variables: {
            collection: postData.collection,
            body: postData.body,
            filter: filter,
            sort: postData.sort,
            skip: postData.skip,
            actionCode: postData.actionCode
        },
    }, 'data.queryAction');
}

export async function htmlToPdf(postData){
    window.Vue.loadingBar.start();
    axios.post("/admin/vuejx/docx/topdf", postData, {
        responseType: "arraybuffer",
        headers: {
            Authorization: "Bearer " + localStorage.getItem('token'),
            token: localStorage.getItem('token'),
            "Content-Type": "application/json",
            "Accept": "application/octet-stream",
        },
    })
    .then((response) => {
        window.Vue.loadingBar.finish();
        const blob = new Blob([response.data], {
            type: "application/octet-stream",
        });
        var a = document.createElement("a");
        a.href = window.URL.createObjectURL(blob);
        a.download = postData["dataId"];
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    })
    .catch((error) => {
        window.Vue.loadingBar.error();
        console.log(error);
    });
}

export async function xlsxtemplate(postData){
    window.Vue.loadingBar.start();
    axios.post("/admin/vuejx/docx/generateexcel", postData, {
        responseType: "arraybuffer",
        headers: {
            Authorization: "Bearer " + localStorage.getItem('token'),
            token: localStorage.getItem('token'),
            "Content-Type": "application/json",
            "Accept": "application/octet-stream",
        },
    })
    .then((response) => {
        window.Vue.loadingBar.finish();
        const blob = new Blob([response.data], {
            type: "application/octet-stream",
        });
        var a = document.createElement("a");
        a.href = window.URL.createObjectURL(blob);
        a.download = postData["dataId"] && postData["dataId"].endsWith('.pdf') ? postData["dataId"] : postData["collection"] + ".xlsx";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    })
    .catch((error) => {
        window.Vue.loadingBar.error();
        console.log(error);
    });
}

export async function docxtemplate(postData){
    window.Vue.loadingBar.start();
    axios.post("/admin/vuejx/docx/generate", postData, {
        responseType: "arraybuffer",
        headers: {
            Authorization: "Bearer " + localStorage.getItem('token'),
            token: localStorage.getItem('token'),
            "Content-Type": "application/json",
            "Accept": "application/octet-stream",
        },
    })
    .then((response) => {
        window.Vue.loadingBar.finish();
        const blob = new Blob([response.data], {
            type: "application/octet-stream",
        });
        var a = document.createElement("a");
        a.href = window.URL.createObjectURL(blob);
        a.download = postData["dataId"] + ".docx";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    })
    .catch((error) => {
        window.Vue.loadingBar.error();
        console.log(error);
    });
}

export async function graphqlQuery(query, variables){
    let result = null;
    await axios.post('/admin/vuejx/', {
        query: query,
        variables: variables,
    }).then((response) => {
        result = response.data.data;
    }).catch(() => { result = null });
    return result;
}

export async function search(vm, collection, keywords, queryFilter, condition, includes, sort, storage, size, queryParam, sizeLast, customPagging, inlineSearchQuery) {
    let filter = [];
    let sortNext = [];
    let sortBack = [];
    let paggingType = '';
    let page = 1;
    let resultData = {
        dataResults: [],
        totalRecord: 0,
        pages: 1,
        page: 1,
        sortBack: [],
        sortNext: [],
        size: 15,
        bodyQuery: null
    }
    let newRoute = JSON.parse(JSON.stringify(window.Vue.router.currentRoute.value));
    if (inlineSearchQuery) {
        newRoute.query = inlineSearchQuery
    }
    for (let key in queryFilter) {
        if ((newRoute.query[queryFilter[key]['key']] ||
                newRoute.query[queryFilter[key]['key'] + '_from'] ||
                newRoute.query[queryFilter[key]['key'] + '_to']) && queryParam) {
            let query = {};
            if (Array.isArray(newRoute.query[queryFilter[key]['key']])) {
                let shouldMultiple = {
                    bool: {
                        should: [],
                        must: []
                    }
                }
                for (let elKeyword of newRoute.query[queryFilter[key]['key']]) {
                    let queryMul = {};
                    let extQuery = {
                        "bool": {
                            "must": []
                        }
                    };
                    if (queryFilter[key]['dataType'] === 'boolean') {
                        queryMul[queryFilter[key]['key']] = String(elKeyword) === '0' ? 'false' : 'true';
                        if (queryFilter[key]['multiple'] === true) {
                            if (queryFilter[key]['key'].endsWith('.raw')) {
                                if (Object.keys(queryMul).length > 0) {
                                    shouldMultiple['bool']['must'].push({
                                        match_phrase_prefix: String(queryMul).trim()
                                    })
                                }
                            } else {
                                if (Object.keys(queryMul).length > 0) {
                                    shouldMultiple['bool']['must'].push({
                                        match: String(queryMul).trim()
                                    })
                                }
                            }
                        } else {
                            if (queryFilter[key]['key'].endsWith('.raw')) {
                                if (Object.keys(queryMul).length > 0) {
                                    shouldMultiple['bool']['should'].push({
                                        match_phrase_prefix: queryMul
                                    })
                                }
                            } else {
                                if (Object.keys(queryMul).length > 0) {
                                    shouldMultiple['bool']['should'].push({
                                        match: queryMul
                                    })
                                }
                            }
                        }

                    } else {

                        if (queryFilter[key]['key'].endsWith('.raw')) {
                            queryMul[queryFilter[key]['key']] = elKeyword !== 'NULL' ? String(elKeyword).trim() : '';
                            if (Object.keys(queryMul).length > 0) {
                                extQuery['bool']['must'].push({
                                    match_phrase_prefix: queryMul
                                })
                            }
                        } else if (queryFilter[key]['key'].endsWith('.keyword')) {
                            queryMul[queryFilter[key]['key']] = elKeyword !== 'NULL' ? String(elKeyword).trim() : '';
                            if (Object.keys(queryMul).length > 0) {
                                extQuery['bool']['must'].push({
                                    match: queryMul
                                })
                            }
                        } else {
                            queryMul[queryFilter[key]['key']] = elKeyword !== 'NULL' ? String(elKeyword).trim() : '';
                            if (Object.keys(queryMul).length > 0) {
                                extQuery['bool']['must'].push({
                                    match: queryMul
                                })
                            }
                        }
                        /*
                        let keySearch = elKeyword.split(' ');
                        for (const keyS of keySearch) {
                            let preX = {};
                            preX[queryFilter[key]['key']] = String(keyS).toLocaleLowerCase().trim();
                            if (preX[queryFilter[key]['key']] && String(preX[queryFilter[key]['key']]).indexOf('/') != -1) {
                                preX[queryFilter[key]['key']] = String(preX[queryFilter[key]['key']]).substring(0, String(preX[queryFilter[key]['key']]).indexOf('/')).trim()
                            }
                            if (Object.keys(preX).length > 0) {
                                extQuery['bool']['must'].push({
                                    "prefix": preX
                                });
                            }
                        }
                        */
                        if (Object.keys(extQuery).length > 0) {
                            if (queryFilter[key]['multiple'] === true) {
                                shouldMultiple['bool']['must'].push(extQuery);
                            } else {
                                shouldMultiple['bool']['should'].push(extQuery);
                            }
                        }
                    }
                }
                filter.push(shouldMultiple);
            } else {
                let extQuery = {
                    "bool": {
                        "must_not": [],
                        "must": [],
                        "should": []
                    }
                };
                if (queryFilter[key]["relation"] !== "range" && queryFilter[key]["relation"] !== "date" && queryFilter[key]["relation"] !== "date_range") {
                    if (queryFilter[key]['dataType'] === 'boolean') {
                        query[queryFilter[key]['key']] = String(newRoute.query[queryFilter[key]['key']]) === '0' ? 'false' : 'true';
                        if (queryFilter[key]['key'].endsWith('.raw')) {
                            if (Object.keys(query).length > 0) {
                                filter.push({
                                    "match_phrase_prefix": query
                                })
                            }
                        } else {
                            if (Object.keys(query).length > 0) {
                                filter.push({
                                    match: query
                                })
                            }
                        }
                    } else {

                        if (queryFilter[key]['key'].endsWith('.raw')) {
                            query[queryFilter[key]['key']] = newRoute.query[queryFilter[key]['key']] !== 'NULL' ? String(newRoute.query[queryFilter[key]['key']]).trim() : '';
                            if (Object.keys(query).length > 0) {
                                extQuery['bool']['must'].push({
                                    match_phrase_prefix: query
                                })
                            }
                            /*
                            let keySearch = newRoute.query[queryFilter[key]['key']].split(' ');
                            for (const keyS of keySearch) {
                                let preX = {};
                                preX[queryFilter[key]['key']] = String(keyS).toLocaleLowerCase().trim();
                                if (preX[queryFilter[key]['key']] && String(preX[queryFilter[key]['key']]).indexOf('/') != -1) {
                                    preX[queryFilter[key]['key']] = String(preX[queryFilter[key]['key']]).substring(0, String(preX[queryFilter[key]['key']]).indexOf('/')).trim()
                                }
                                if (Object.keys(preX).length > 0) {
                                    if (String(keyS).toLocaleLowerCase().indexOf('\.') !== -1 || String(keyS).toLocaleLowerCase().indexOf('-') !== -1 || String(keyS).toLocaleLowerCase().indexOf('–') !== -1 || String(keyS).toLocaleLowerCase().indexOf(',') !== -1 || String(keyS).toLocaleLowerCase().indexOf('(') !== -1 || String(keyS).toLocaleLowerCase().indexOf('/') !== -1) {
                                        break;
                                    }
                                    extQuery['bool']['must'].push({
                                        "prefix": preX
                                    });
                                }
                            }
                            */
                        } else {
                            query[queryFilter[key]['key']] = newRoute.query[queryFilter[key]['key']] !== 'NULL' ? String(newRoute.query[queryFilter[key]['key']]).trim() : '';
                            if (newRoute.query[queryFilter[key]['key']] === 'NULL') {
                                extQuery['bool']['should'] = [
                                    {
                                        "bool": {
                                           "must_not": {
                                               "exists": {
                                                   "field": queryFilter[key]['key']
                                               }
                                           }
                                        }
                                    }, {
                                    match: query
                                }];
                            } else {
                                if (Object.keys(query).length > 0) {
                                    extQuery['bool']['must'].push({
                                        match: query
                                    })
                                }
                            }
                        }
                        filter.push(extQuery);
                    }
                } else if (queryFilter[key]["relation"] === "range") {
                    const fromQ = parseInt(newRoute.query[queryFilter[key]["key"] + '_from']);

                    let objectQDate = {};
                    objectQDate[queryFilter[key]["key"]] = {
                        "gte": fromQ
                    }

                    if (newRoute.query[queryFilter[key]["key"] + '_to']) {
                        const toQ = parseInt(newRoute.query[queryFilter[key]["key"] + '_to']);
                        objectQDate[queryFilter[key]["key"]]["lt"] = toQ
                    }

                    filter.push({
                        "range": objectQDate
                    });
                } else if (queryFilter[key]["relation"] === "date") {
                    const qDate = new Date(parseInt(newRoute.query[queryFilter[key]["key"]]));
                    let nam = qDate.getFullYear();
                    let thang = qDate.getMonth() + 1;
                    thang = thang < 10 ? ('0' + thang) : thang;
                    let ngay = qDate.getDate() < 10 ? ('0' + qDate.getDate()) : qDate.getDate();
                    let objectQDate = {};
                    objectQDate[queryFilter[key]["key"]] = {
                        "time_zone": "+07:00",
                        "gte": nam + '-' + thang + '-' + ngay,
                        "lte": nam + '-' + thang + '-' + ngay
                    }

                    filter.push({
                        "range": objectQDate
                    });
                } else if (queryFilter[key]["relation"] === "date_range") {
                    const qDateFrom = new Date(parseInt(newRoute.query[queryFilter[key]["key"] + '_from']));
                    let nam = qDateFrom.getFullYear();
                    let thang = qDateFrom.getMonth() + 1;
                    thang = thang < 10 ? ('0' + thang) : thang;
                    let ngay = qDateFrom.getDate() < 10 ? ('0' + qDateFrom.getDate()) : qDateFrom.getDate();

                    let objectQDate = {};
                    objectQDate[queryFilter[key]["key"]] = {
                        "time_zone": "+07:00",
                        "gte": nam + '-' + thang + '-' + ngay
                    }

                    if (newRoute.query[queryFilter[key]["key"] + '_to']) {
                        const qDateTo = new Date(parseInt(newRoute.query[queryFilter[key]["key"] + '_to']));
                        let nam_to = qDateTo.getFullYear();
                        let thang_to = qDateTo.getMonth() + 1;
                        thang_to = thang_to < 10 ? ('0' + thang_to) : thang_to;
                        let ngay_to = qDateTo.getDate() < 10 ? ('0' + qDateTo.getDate()) : qDateTo.getDate();

                        objectQDate[queryFilter[key]["key"]]["lte"] = nam_to + '-' + thang_to + '-' + ngay_to
                    }

                    filter.push({
                        "range": objectQDate
                    });
                }
            }
        }
    }
    //keywords
    if (newRoute.query["keywords"] && queryParam) {
        let keywordsFilter = {
            bool: {
                should: []
            }
        };
        for (let key in keywords) {
            let mustKeyword = {
                bool: {
                    must: []
                }
            }
            let keySearchSplit = decodeURIComponent(newRoute.query["keywords"]).toLocaleLowerCase()
            /*.replace(/,/g, ' ').replace(/\./g, ' ').replace(/-/g, ' ').replace(/–/g, ' ').replace(/:/g, ' ').replace(/\//g, ' ').replace(/  /g, ' ')*/
            .split(' ');
            if (keywords[key].endsWith('.raw')) {
                let query = {};
                query[keywords[key]] = decodeURIComponent(newRoute.query["keywords"]).toLocaleLowerCase();
                if (Object.keys(query).length > 0) {
                    mustKeyword['bool']['must'].push({
                        match_phrase_prefix: query
                    })
                }
                /*
                for (const keyS of keySearchSplit) {
                    let preX = {};
                    preX[keywords[key]] = String(keyS).toLocaleLowerCase();
                    if (preX[keywords[key]] && String(preX[keywords[key]]).indexOf('/') != -1) {
                        preX[keywords[key]] = String(preX[keywords[key]]).substring(0, String(preX[keywords[key]]).indexOf('/'))
                    }
                    if (Object.keys(preX).length > 0) {
                        if (String(keyS).toLocaleLowerCase().indexOf('\.') !== -1 || String(keyS).toLocaleLowerCase().indexOf('-') !== -1 || String(keyS).toLocaleLowerCase().indexOf('–') !== -1 || String(keyS).toLocaleLowerCase().indexOf(',') !== -1 || String(keyS).toLocaleLowerCase().indexOf('(') !== -1 || String(keyS).toLocaleLowerCase().indexOf('/') !== -1) {
                            break;
                        }
                        mustKeyword['bool']['must'].push({
                            "prefix": preX
                        });
                    }
                }
                */
            } else if (keywords[key].endsWith('.keyword')) {
                let query = {};
                query[keywords[key]] = decodeURIComponent(newRoute.query["keywords"]).toLocaleLowerCase();
                if (Object.keys(query).length > 0) {
                    mustKeyword['bool']['must'].push({
                        match: query
                    })
                }
            } else {
                if (keywords[key] === 'shortName' || keywords[key] === 'MaMuc') {
                    let query = {};
                    query[keywords[key]] = decodeURIComponent(newRoute.query["keywords"]);
                    if (Object.keys(query).length > 0) {
                        mustKeyword['bool']['must'].push({
                            match: query
                        })
                    }
                } else {
                    for (let search of keySearchSplit) {
                        let query = {};
                        if (search !== '') {
                            query[keywords[key]] = search;
                            if (Object.keys(query).length > 0) {
                                mustKeyword['bool']['must'].push({
                                    match: query
                                })
                            }
                        }
                    }
                }

            }
            keywordsFilter['bool']['should'].push(mustKeyword);
        }
        filter.push(keywordsFilter);
    }

    let bodyQuery = {
        "size": size,
        "query": {
            "bool": {
                "filter": {
                    "match": {
                        "site": localStorage.getItem('site')
                    }
                },
                "must": []
            }
        }
    }
    bodyQuery['highlight'] = {
        "pre_tags": [
            "<es_em>"
        ],
        "post_tags": [
            "</es_em>"
        ],
        "fields": {
            "*": {}
        }
    }
    if (includes !== null) {
        bodyQuery['_source'] = {
            "includes": includes
        }
    }
    if (sort !== null) {
        bodyQuery['sort'] = JSON.parse(JSON.stringify(sort));
    } else {
        bodyQuery['sort'] = []
    }
    if (storage) {
        bodyQuery['query']['bool']['must'].push(storage)
    } else {
        bodyQuery['query']['bool']['must'].push({
            "match": {
                "storage": 'regular'
            }
        })
    }
    if (condition) {
        for (const el of condition) {
            bodyQuery['query']['bool']['must'].push(el)
        }
    }
    if (filter !== undefined) {
        for (const el of filter) {
            bodyQuery['query']['bool']['must'].push(el)
        }
    }
    if (customPagging) {
        if (typeof customPagging.sortNext == 'string' && customPagging.sortNext) {
            sortNext = JSON.parse(decodeURIComponent(customPagging.sortNext));
        } else {
            sortNext = customPagging.sortNext ? customPagging.sortNext : [];
        }
        if (typeof customPagging.sortBack == 'string' && customPagging.sortBack) {
            sortBack = JSON.parse(decodeURIComponent(customPagging.sortBack));
        } else {
            sortBack = customPagging.sortBack ? customPagging.sortBack : [];
        }
        paggingType = customPagging.paggingType;
        if (customPagging.sizeLast) {
            sizeLast = customPagging.sizeLast;
        }
        size = customPagging.size;
        resultData.size = size;
        page = customPagging.page;
        resultData.page = page;
    } else {
        const paramsQuery = new URLSearchParams(window.location.href)
        if (paramsQuery.get('_s_n')) {
            sortNext = JSON.parse(decodeURIComponent(paramsQuery.get('_s_n')));
        }
        if (paramsQuery.get('_s_b')) {
            sortBack = JSON.parse(decodeURIComponent(paramsQuery.get('_s_b')));
        }
        if (paramsQuery.get('_pagging')) {
            paggingType = paramsQuery.get('_pagging');
        }
        if (paramsQuery.get('_rows') && queryParam) {
            size = paramsQuery.get('_rows');
            resultData.size = size;
        }
        if (paramsQuery.get('_sizeLast')) {
            sizeLast = paramsQuery.get('_sizeLast');
        }
        if (paramsQuery.get('_page') && queryParam) {
            page = paramsQuery.get('_page');
            resultData.page = page;
        }
    }
    bodyQuery['from'] = 0;
    bodyQuery['size'] = size;
    if (paggingType === 'next' && page != 1) {
        if (Array.isArray(sortNext) && sortNext.length > 0) {
            bodyQuery['search_after'] = sortNext;
            delete bodyQuery['from']
            bodyQuery['sort'] = [];
            let hasId = false;
            if (sizeLast && sizeLast != size) {
                bodyQuery['size'] = sizeLast;
            }
            for (let elSort of sort) {
                if (typeof elSort == 'object') {
                    let objectSort = {};
                    objectSort[Object.keys(elSort)[0]] = elSort[Object.keys(elSort)[0]];
                    bodyQuery['sort'].push(objectSort)
                    if (Object.keys(elSort)[0] === 'id.keyword') {
                        hasId = true;
                    }
                }
            }
            if (!hasId) {
                bodyQuery['sort'].push({"id.keyword": "asc"})
            }
        }
    } else if (paggingType === 'prev' && page != 1) {
        if (Array.isArray(sortBack) && sortBack.length > 0) {
            bodyQuery['search_after'] = sortBack;
            delete bodyQuery['from']
            bodyQuery['sort'] = [];
            let hasId = false;
            for (let elSort of sort) {
                if (typeof elSort == 'object') {
                    let objectSort = {};
                    if (elSort[Object.keys(elSort)[0]] === 'asc') {
                        objectSort[Object.keys(elSort)[0]] = 'desc'
                    } else {
                        objectSort[Object.keys(elSort)[0]] = 'asc'
                    }
                    bodyQuery['sort'].push(objectSort)
                    if (Object.keys(elSort)[0] === 'id.keyword') {
                        hasId = true;
                    }
                }
            }
            if (!hasId) {
                bodyQuery['sort'].push({"id.keyword": "desc"})
            }
        }
    } else if (paggingType === 'last' && page != 1) {
        bodyQuery['size'] = sizeLast;
        delete bodyQuery['from']
        bodyQuery['sort'] = [];
        let hasId = false;
        for (let elSort of sort) {
            if (typeof elSort == 'object') {
                let objectSort = {};
                if (elSort[Object.keys(elSort)[0]] === 'asc') {
                    objectSort[Object.keys(elSort)[0]] = 'desc'
                } else {
                    objectSort[Object.keys(elSort)[0]] = 'asc'
                }
                bodyQuery['sort'].push(objectSort)
                if (Object.keys(elSort)[0] === 'id.keyword') {
                    hasId = true;
                }
            }
        }
        if (!hasId) {
            bodyQuery['sort'].push({"id.keyword": "desc"})
        }
    }  else if (paggingType === 'first') {
        delete bodyQuery['from']
        bodyQuery['sort'] = [];
        let hasId = false;
        for (let elSort of sort) {
            if (typeof elSort == 'object') {
                let objectSort = {};
                objectSort[Object.keys(elSort)[0]] = elSort[Object.keys(elSort)[0]];
                bodyQuery['sort'].push(objectSort)
                if (Object.keys(elSort)[0] === 'id.keyword') {
                    hasId = true;
                }
            }
        }
        if (!hasId) {
            bodyQuery['sort'].push({"id.keyword": "asc"})
        }
    } else {
        bodyQuery['sort'].push({"id.keyword": "asc"})
    }
    resultData.bodyQuery = bodyQuery;
    if (vm) {
        vm.$emit("body_query", bodyQuery);
    }
    await window.VueJX.dispatch('vuejx_manager/graphqlQuery', {
        query: `
            query search($token: String, $body: JSON, $db: String, $collection: String) {
                results: search(token: $token, body: $body, db: $db, collection: $collection )
            }
        `,
        variables: {
            body: bodyQuery,
            db: localStorage.getItem("db"),
            collection: collection
        }
    }).then(async response => {
        let dataResultsX = [];
        if (response['results'] !== null && response['results'] !== undefined) {
            dataResultsX = response['results']['hits']['hits'];
            resultData.totalRecord = response['results']['hits']['total']['value'];
            if (typeof resultData.totalRecord === 'object') {
                resultData.totalRecord = resultData.totalRecord['count'];
            }
            if (vm) {
                vm.$emit("init_total", resultData.totalRecord);
            }
        }
        if ((paggingType === 'prev' || paggingType === 'last') && page != 1) {
            if (!window.Vue && !window.Vue.reverse) {
                await window.sleep(500)
            }
            resultData.dataResults = window.Vue.reverse(dataResultsX)
        } else {
            resultData.dataResults = dataResultsX
        }
        if (resultData.dataResults.length > 0) {
            resultData.sortBack = resultData.dataResults[0]['sort'];
            resultData.sortNext = resultData.dataResults[resultData.dataResults.length - 1]['sort'];
        }
        if (resultData.totalRecord > size) {
            let floorPage = Math.floor(resultData.totalRecord / size);
            if (resultData.totalRecord % size > 0) {
                floorPage = floorPage + 1;
            }
            resultData.pages = floorPage;
        } else {
            page = 1;
            resultData.pages = 1;
        }
        if (vm) {
            vm.$emit("init", resultData.dataResults)
        }
    }).catch(err => {
        if (vm) {
            vm.$emit("init", [])
        }
        resultData.dataResults = [];
    });
    return resultData;
}

export async function aggsData(vm, type, group_by, group_size, pageCount, valKey, textKey, exclude, conditionAggs, re_calculator, keywords, queryParam, publicData, multiple, pageCountNext, range, custom_label, customAggs) {

    let resultData = {}
    let newRoute = window.Vue.router.currentRoute.value;
    let isAdvFilter = false;
    let currentSite = localStorage.getItem('site');
    if (
        newRoute.query.hasOwnProperty("adv_filter") &&
        String(newRoute.query["adv_filter"]) === "true"
    ) {
        isAdvFilter = true;
    }
    let filter = [];
    let selectedMenuXXX = [];
    let activeArray = [];
    //query
    if (
        newRoute.query[group_by["keyAggs"]] === undefined ||
        newRoute.query[group_by["keyAggs"]] === null ||
        newRoute.query[group_by["keyAggs"]] === ""
    ) {
        selectedMenuXXX = [];
        activeArray = [];
    }
    for (let key in re_calculator) {
        if (group_by["keyAggs"] == re_calculator[key]["key"] && re_calculator[key]["key"] == newRoute.query['_state_aggs']) {
        } else {
        if (newRoute.query[re_calculator[key]["key"]] && queryParam) {
            if (Array.isArray(newRoute.query[re_calculator[key]["key"]])) {
                let shouldMultiple = {
                    bool: {
                        should: [],
                        must: [],
                    },
                };
                for (let elKeyword of newRoute.query[re_calculator[key]["key"]]) {
                    let query = {};
                    if (re_calculator[key]["relation"] === "eq" && re_calculator[key]["keyType"] === "multiple") {

                        
                        if (re_calculator[key]["dataType"] === "boolean") {
                            query[re_calculator[key]["key"]] = String(elKeyword) === "0" ? "false" : "true";
                            if (re_calculator[key]["key"].endsWith(".raw")) {
                                shouldMultiple["bool"]["must"].push({
                                    match_phrase_prefix: query,
                                });
                            } else {
                                shouldMultiple["bool"]["must"].push({
                                    match: query,
                                });
                            }
                        } else {
                            query[re_calculator[key]["key"]] = elKeyword !== "NULL" ? elKeyword : "";
                            if (re_calculator[key]["key"].endsWith(".raw")) {
                                shouldMultiple["bool"]["must"].push({
                                    match_phrase_prefix: query,
                                });
                            } else {
                                shouldMultiple["bool"]["must"].push({
                                    match: query,
                                });
                            }
                        }
                    } else if (re_calculator[key]["relation"] === "eq" && re_calculator[key]["keyType"] !== "multiple") {
                        if (re_calculator[key]["dataType"] === "boolean") {
                            query[re_calculator[key]["key"]] = String(elKeyword) === "0" ? "false" : "true";
                            if (re_calculator[key]["key"].endsWith(".raw")) {
                                shouldMultiple["bool"]["should"].push({
                                    match_phrase_prefix: query,
                                });
                            } else {
                                shouldMultiple["bool"]["should"].push({
                                    match: query,
                                });
                            }
                        } else {
                            query[re_calculator[key]["key"]] = elKeyword !== "NULL" ? elKeyword : "";
                            if (re_calculator[key]["key"].endsWith(".raw")) {
                                shouldMultiple["bool"]["should"].push({
                                    match_phrase_prefix: query,
                                });
                            } else {
                                shouldMultiple["bool"]["should"].push({
                                    match: query,
                                });
                            }
                        }
                    }
                }
                filter.push(shouldMultiple);
            } else {
                let query = {};
                if (re_calculator[key]["relation"] !== "range") {
                    if (re_calculator[key]["dataType"] === "boolean") {
                        query[re_calculator[key]["key"]] = String(newRoute.query[re_calculator[key]["key"]]) === "0" ? "false" : "true";
                        if (re_calculator[key]["key"].endsWith(".raw")) {
                            filter.push({
                                match_phrase_prefix: query,
                            });
                        } else {
                            filter.push({
                                match: query,
                            });
                        }
                    } else {
                        query[re_calculator[key]["key"]] = newRoute.query[re_calculator[key]["key"]] !== "NULL" ? newRoute.query[re_calculator[key]["key"]] : "";
                        if (re_calculator[key]["key"].endsWith(".raw")) {
                            filter.push({
                                match_phrase_prefix: query,
                            });
                        } else {
                            filter.push({
                                match: query,
                            });
                        }
                    }
                } else if (re_calculator[key]["relation"] === "range") {
                    let objectString = "";
                    if (newRoute.query[re_calculator[key]["key"]].indexOf("-") > 0) {
                        let [fromQ, toQ] = newRoute.query[re_calculator[key]["key"]].split("-");
                        let rangQQ = `{`;
                        if (fromQ !== "*") {
                            rangQQ = rangQQ + `"gte":` + fromQ;
                        }
                        if (toQ !== "*") {
                            if (fromQ !== "*") {
                                rangQQ = rangQQ + `, `;
                            }
                            rangQQ = rangQQ + `"lt":` + toQ;
                        }
                        rangQQ = rangQQ + ` }`;
                        objectString = `
                            {
                                "range": {
                                    "` +
                            re_calculator[key]["key"] +
                            `": ` +
                            rangQQ +
                            `
                                }
                            }
                        `;
                    }
                    filter.push(JSON.parse(objectString));
                }
            }
        }
    }
    }
    if (
        newRoute.query["keywords"] !== undefined &&
        newRoute.query["keywords"] !== "" &&
        queryParam
    ) {
        let keywordsFilter = {
            bool: {
                should: []
            }
        };
        for (let key in keywords) {
            let mustKeyword = {
                bool: {
                    must: []
                }
            };
            if (keywords[key].endsWith(".raw")) {
                let query = {};
                query[keywords[key]] = decodeURIComponent(newRoute.query["keywords"])
                .toLocaleLowerCase()
                /*
                .replace(/,/g, " ")
                .replace(/\./g, " ")
                .replace(/-/g, " ")
                .replace(/–/g, " ")
                .replace(/:/g, " ")
                .replace(/\//g, " ")
                .replace(/  /g, " ");
                */
                mustKeyword["bool"]["must"].push({
                    match_phrase_prefix: query,
                });
            } else {
                let keySearchSplit = decodeURIComponent(newRoute.query["keywords"])
                .toLocaleLowerCase()
                /*
                .replace(/,/g, " ")
                .replace(/\./g, " ")
                .replace(/-/g, " ")
                .replace(/–/g, " ")
                .replace(/:/g, " ")
                .replace(/\//g, " ")
                .replace(/  /g, " ")
                */
                .split(" ");
                for (let search of keySearchSplit) {
                    let query = {};
                    if (search !== "") {
                        query[keywords[key]] = search;
                        mustKeyword["bool"]["must"].push({
                            match: query,
                        });
                    }
                }
            }
            keywordsFilter["bool"]["should"].push(mustKeyword);
        }

        filter.push(keywordsFilter);
    }

    let sortAggs = [{
        "_count": {
            "order": "desc"
        }
    }];
    if (group_by["_termAggs"]) {
        sortAggs = [];
    }
    if (group_by["order"]) {
        sortAggs = group_by["order"];
    }
    let from = pageCount * group_size - group_size;
    console.log('pageCountpageCount', pageCount, group_size, from);
    if (from < 0) {
        from = 0;
    }

    let bodyQueryAggs = {
        size: 0,
        query: {
            bool: {
                filter: {
                    match: {
                        site: currentSite,
                    },
                },
                must: [],
            },
        },
        aggs: {
            report: {
                filter: {
                    bool: {
                        must_not: exclude,
                        must: [],
                        filter: {
                            match: {
                                site: currentSite,
                            },
                        },
                    },
                },
                aggs: {
                    aggregations: {
                        terms: {
                            size: 10000,
                            field: group_by["keyAggs"],
                        },
                        "aggs": {
                            "aggs_sort": {
                                "bucket_sort": {
                                    "sort": sortAggs,
                                    "size": group_size,
                                    "from": from
                                }
                            },
                            "top_el_hits": {
                                "top_hits": {
                                    "_source": {
                                        "includes": group_by["includesAggs"] ? group_by["includesAggs"] : [
                                            group_by["keyAggs"],
                                            group_by["keyAggs"].replace(valKey, textKey),
                                            group_by["keyAggs"].replace(valKey, 'type')
                                        ]
                                    },
                                    "size": 1
                                }
                            }
                        }
                    },
                },
            },
        },
    };
    if (type === 'range') {
        let rangQuery = [];
        for (const el of range) {
            rangQuery.push({
                from: el["from"],
                to: el["to"],
            });
        }
        bodyQueryAggs['aggs']['report']['aggs'] = {
            report: {
                range: {
                    field: group_by["keyAggs"],
                    ranges: rangQuery,
                }
            }
        }
    } else if (type === 'fulltext') {
        let min_doc_count = 1;
        let order = {
            _count: "desc",
        };
        if (group_by["min_doc_count"]) {
            min_doc_count = group_by["min_doc_count"];
        }
        if (group_by["order"]) {
            order = group_by["order"];
        }
        bodyQueryAggs['aggs']['report']['aggs'] = {
            aggregations: {
                terms: {
                    size: group_by["sizeAggs"],
                    field: group_by["keyAggs"],
                    min_doc_count: min_doc_count,
                    order: order
                },
                "aggs": {
                    "aggs_sort": {
                        "bucket_sort": {
                            "sort": sortAggs,
                            "size": group_size,
                            "from": from
                        }
                    }
                }
            }
        }
    } else if (type === 'custom') {
        bodyQueryAggs['aggs'] = customAggs;
    } else {
        if (Array.isArray(group_by["includes"])) {
            for (let elInc of group_by["includes"]) {
                bodyQueryAggs['aggs']['report']['aggs']['aggregations']['aggs']['top_el_hits']['top_hits']['_source']['includes'].push(elInc)
            }
        }
        if (group_by["_termAggs"]) {
            bodyQueryAggs['aggs']['report']['aggs']['aggregations']['terms']['order'] = {
                "_term": group_by["_termAggs"] ? group_by["_termAggs"] : 'asc'
            }
        }
    }
    if (conditionAggs !== null) {
        let defaultStorageAggs = true;
        for (const el of conditionAggs) {
            if (
                el["match"] !== undefined &&
                el["match"] !== null &&
                el["match"].hasOwnProperty("storage")
            ) {
                defaultStorageAggs = false;
            }
            bodyQueryAggs["query"]["bool"]["must"].push(el);
        }
        if (defaultStorageAggs) {
            bodyQueryAggs["query"]["bool"]["must"].push({
                match: {
                    storage: "regular",
                },
            });
        }
    } else {
        bodyQueryAggs["query"]["bool"]["must"].push({
            match: {
                storage: "regular",
            },
        });
    }
    if (
        filter !== undefined &&
        filter !== null &&
        filter.length > 0
    ) {
        let indexCal = 0;
        for (const elCal of filter) {
            /*
            indexCal = indexCal + 1;
            if (
                Array.isArray(newRoute.query[group_by["keyAggs"]]) &&
                indexCal === 1
            ) {
                continue;
            }
            */
            if (isAdvFilter) {
                bodyQueryAggs["query"]["bool"]["must"].push(elCal);
            } else {
                if (elCal.hasOwnProperty("bool")) {
                    bodyQueryAggs["query"]["bool"]["must"].push(elCal);
                } else if (
                    (elCal.hasOwnProperty("match") &&
                        !elCal["match"].hasOwnProperty(group_by["keyAggs"])) ||
                    (elCal.hasOwnProperty("match_phrase_prefix") &&
                        !elCal["match_phrase_prefix"].hasOwnProperty(
                            group_by["keyAggs"]
                        ))
                ) {
                    bodyQueryAggs["query"]["bool"]["must"].push(elCal);
                }
            }
        }
    }
    let items = [];
    let collectionDM = '';
    //active
    if (multiple) {
        selectedMenuXXX = [];
        activeArray = [];
    } else {
        selectedMenuXXX = [];
    }
    const keyAQQ = newRoute.query[group_by["keyAggs"]];
    let ignore = {};
    let objectReportCouter = {};
    await window.Vue.$root
        .dispatch(
            "vuejx_manager/graphqlQuery", {
                query: `
                query search($token: String, $bodyAggs: JSON, $dbAggs: String, $collectionAggs: String, $publicData: String) {
                    aggs: aggs(token: $token, body: $bodyAggs, db: $dbAggs, collection: $collectionAggs, publicData: $publicData )
                }
            `,
                variables: {
                    bodyAggs: bodyQueryAggs,
                    dbAggs: localStorage.getItem('db'),
                    collectionAggs: group_by["collectionAggs"],
                    publicData: publicData,
                },
            }
        )
        .then(async(response) => {
            collectionDM = '';
            let indexMenu = -1;
            let reportData = {};
            if (type === 'fulltext') {
                let showPaggingSizeTotal = response.aggs.aggregations.report.doc_count;
                resultData.showPaggingSizeTotal = showPaggingSizeTotal;
                if (
                    pageCount * group_by["sizeAggs"] >= showPaggingSizeTotal ||
                    group_by["sizeAggs"] >= showPaggingSizeTotal
                ) {
                    pageCountNext = 0;
                } else {
                    pageCountNext = 1;
                }
                items = [];
                for (const elReport of response.aggs.aggregations.report.aggregations.buckets) {
                    let newName = elReport["key"];
                    if (custom_label && custom_label.ignore_prefix) {
                        if (String(custom_label.ignore_prefix).indexOf(',') != -1) {
                            const prefixKeyIgnore = String(custom_label.ignore_prefix).split(',')
                            for (const elIgnore of prefixKeyIgnore) {
                                newName = String(newName).replace(elIgnore, '')
                            }
                        } else {
                            newName = String(newName).replace(custom_label.ignore_prefix, '')
                        }
                    } else if (custom_label) {
                        newName = custom_label[elReport["key"]];
                    }
                    if (!newName) {
                        newName = 'NULL';
                    }
                    items.push({
                        code: elReport["key"] ? elReport["key"] : 'NULL' ,
                        name: String(newName).trim(),
                        y: elReport["doc_count"],
                        counter: elReport["key"] ? elReport["doc_count"] : '',
                    });
                    indexMenu = indexMenu + 1;
                    if (Array.isArray(keyAQQ)) {
                        for (const ekey of keyAQQ) {
                            if (String(elReport["key"] ? elReport["key"] : 'NULL') === String(ekey)) {
                                if (multiple) {
                                    selectedMenuXXX.push(indexMenu);
                                } else {
                                    selectedMenuXXX = [indexMenu];
                                }
                                break;
                            }
                        }
                    } else {
                        if (String(elReport["key"] ? elReport["key"] : 'NULL') === String(keyAQQ)) {
                            if (multiple) {
                                selectedMenuXXX.push(indexMenu);
                            } else {
                                selectedMenuXXX = [indexMenu];
                            }
                        }
                    }
                }
                activeArray = selectedMenuXXX;
            } else if (type === 'range') {
                for (const elReport of response.aggs.aggregations.report.report.buckets) {
                    reportData[elReport["from"] + "-" + elReport["to"]] = elReport["doc_count"] > 0 ? elReport["doc_count"] : "";
                }
                items = [];
                let qFrom = newRoute.query[group_by["keyAggs"] + '_from'];
                let qTo = newRoute.query[group_by["keyAggs"] + '_to'];
                for (const el of range) {
                    items.push({
                        code: el["from"] + "-" + el["to"],
                        name: String(el[textKey]).trim(),
                        counter: reportData[el["from"] + "-" + el["to"]] !== undefined ? reportData[el["from"] + "-" + el["to"]] : 0,
                        y: reportData[el["from"] + "-" + el["to"]] !== undefined ? reportData[el["from"] + "-" + el["to"]] : 0,
                    });
                    indexMenu = indexMenu + 1;
                    if (String(el["from"] + "-" + el["to"]) === (qFrom + '-' + qTo)) {
                        if (multiple) {
                            selectedMenuXXX.push(indexMenu);
                        } else {
                            selectedMenuXXX = [indexMenu];
                        }
                    }
                }
                activeArray = selectedMenuXXX;
            } else if (type === 'custom') {
                resultData.aggs = response.aggs;
            } else {
                for (const elBuck of response.aggs.aggregations.report.aggregations.buckets) {
                    let textViewCode = ''
                    let code = elBuck['key']
                    if (elBuck['top_el_hits'] && elBuck['top_el_hits']['hits']['hits']) {
                        for (const elName of elBuck['top_el_hits']['hits']['hits']) {
                            if (multiple) {
                                if (String(group_by["keyAggs"]).indexOf('.') !== -1) {
                                    let mulKey = group_by["keyAggs"].split('.')[0];
                                    let arrayAggName = null
                                    if (group_by["keyAggs_arrayfield"]) {
                                        arrayAggName = window.Vue.objectViewObject(elName, group_by["keyAggs_arrayfield"])
                                    } else {
                                        arrayAggName = elName['_source'][mulKey]
                                    }
                                    if (Array.isArray(arrayAggName)) {
                                        for (let elMul of arrayAggName) {
                                            let keyMXXX = group_by["keyAggs"].replace(mulKey + '.', '')
                                            let inCode = window.Vue.objectView(elMul, keyMXXX, '')
                                            if (!inCode) {
                                                keyMXXX = group_by["keyAggs"].substr(group_by["keyAggs"].indexOf('\.') + 1).replace('\.keyword', '')
                                                inCode = window.Vue.objectView(elMul, keyMXXX, '')
                                            }
                                            if (group_by["keyAggs_arrayfieldvalue"]) {
                                                inCode = window.Vue.objectView(elMul, group_by["keyAggs_arrayfieldvalue"], '')
                                            }
                                            if (inCode.toLocaleLowerCase().replace(/\./g, '') == code.toLocaleLowerCase().replace(/ /g, '')) {
                                                if (group_by["keyAggs_arrayfieldvalue"]) {
                                                    textViewCode = window.Vue.objectView(elMul, group_by["keyAggs_arrayfieldtext"], '');
                                                    collectionDM = window.Vue.objectView(elMul, group_by["keyAggs_arrayfieldvalue"].replace('.' + valKey, '.type'), '');
                                                } else {
                                                    textViewCode = window.Vue.objectView(elMul, keyMXXX.replace('.' + valKey, '.' + textKey), '');
                                                    collectionDM = window.Vue.objectView(elMul, keyMXXX.replace('.' + valKey, '.type'), '');
                                                }
                                                break;
                                            }
                                        }
                                    } else {
                                        let inCode = window.Vue.objectView(elName, '_source.' + group_by["keyAggs"], '')
                                        if (group_by["keyAggs_fieldvalue"]) {
                                            inCode = window.Vue.objectView(elName, group_by["keyAggs_fieldvalue"], '')
                                        }
                                        if (inCode.toLocaleLowerCase().replace(/\./g, '') == code.toLocaleLowerCase().replace(/ /g, '')) {
                                            if (!group_by["keyAggs_fieldtext"]) {
                                                textViewCode = window.Vue.objectView(elName, '_source.' + group_by["keyAggs"].replace(valKey, textKey), '')
                                                collectionDM = window.Vue.objectView(elName, '_source.' + group_by["keyAggs"].replace(valKey, 'type'), '')
                                            } else {
                                                textViewCode = window.Vue.objectView(elName, group_by["keyAggs_fieldtext"], '')
                                                collectionDM = window.Vue.objectView(elName, group_by["keyAggs_fieldtext"].replace(valKey, 'type'), '')
                                            }
                                            break;
                                        }
                                    }
                                } else {
                                    const mulKey = group_by["keyAggs"];
                                    if (Array.isArray(elName['_source'][mulKey])) {
                                        for (let elMul of elName['_source'][mulKey]) {
                                            if (elMul['_source'][valKey] == code.toLocaleLowerCase().replace(/ /g, '')) {
                                                textViewCode = elMul['_source'][textKey];
                                                collectionDM = elMul['_source']['type'];
                                                break;
                                            }
                                        }
                                    } else {
                                        let inCode = window.Vue.objectView(elName, '_source.' + group_by["keyAggs"], '')
                                        if (inCode.toLocaleLowerCase().replace(/\./g, '') == code.toLocaleLowerCase().replace(/ /g, '')) {
                                            textViewCode = window.Vue.objectView(elName, '_source.' + group_by["keyAggs"].replace(valKey, textKey), '')
                                            collectionDM = window.Vue.objectView(elName, '_source.' + group_by["keyAggs"].replace(valKey, 'type'), '')
                                            break;
                                        }
                                    }
                                }
                            } else {
                                const inCode = window.Vue.objectView(elName, '_source.' + group_by["keyAggs"], '')
                                if (inCode.toLocaleLowerCase().replace(/\./g, '') == code.replace(/ /g, '')) {
                                    textViewCode = window.Vue.objectView(elName, '_source.' + group_by["keyAggs"].replace(valKey, textKey), '')
                                    collectionDM = window.Vue.objectView(elName, '_source.' + group_by["keyAggs"].replace(valKey, 'type'), '')
                                    break;
                                }
                            }
                        }
                    }
                    if (custom_label && custom_label.ignore_prefix) {
                        if (String(custom_label.ignore_prefix).indexOf(',') != -1) {
                            const prefixKeyIgnore = String(custom_label.ignore_prefix).split(',')
                            for (const elIgnore of prefixKeyIgnore) {
                                textViewCode = String(textViewCode).replace(elIgnore, '')
                            }
                        } else {
                            textViewCode = String(textViewCode).replace(custom_label.ignore_prefix, '')
                        }
                    } else  if (custom_label) {
                        textViewCode = custom_label[textViewCode];
                    }
                    items.push({
                        code: code,
                        name: String(textViewCode).trim(),
                        counter: elBuck['doc_count']
                    })
                    objectReportCouter[code] = elBuck['doc_count'];
                    indexMenu = indexMenu + 1;
                    if (Array.isArray(keyAQQ)) {
                        for (const ekey of keyAQQ) {
                            if (String(code) === String(ekey)) {
                                if (multiple) {
                                    selectedMenuXXX.push(indexMenu);
                                } else {
                                    selectedMenuXXX = [indexMenu];
                                }
                                break;
                            }
                        }
                    } else {
                        if (String(code) === String(keyAQQ)) {
                            if (multiple) {
                                selectedMenuXXX.push(indexMenu);
                            } else {
                                selectedMenuXXX = [indexMenu];
                            }
                        }
                    }
                }
                activeArray = selectedMenuXXX;
            }
        })
        .catch((err) => { 
            items = []; 
            if (type === 'range') {
                for (const el of range) {
                    items.push({
                        code: el["from"] + "-" + el["to"] + "",
                        name: el[textKey],
                        counter: "",
                        y: ""
                    })
                }
            }
        });
    if (group_size > items.length) {
        pageCountNext = 0;
    } else {
        pageCountNext = 1;
    }
    if (items.length === 0) {
        resultData.pageCount = pageCount - 1;
    } else {
        resultData.pageCount = pageCount
    }
    resultData.pageCountNext = pageCountNext;
    resultData.items = items;
    resultData.selectedMenuXXX = selectedMenuXXX;
    resultData.activeArray = activeArray;
    resultData.collectionDM = collectionDM;
    resultData.ignore = ignore;
    if (vm) {
        vm.$emit("counterObject", objectReportCouter)
        vm.$emit("result", items);
    }
    return resultData;
}

export async function dataReport(query) {
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
   let resultxxx = null;
    await window.VueJX
        .dispatch("vuejx_manager/graphqlQuery", {
        query: aggsQuery,
        variables: variables
    })
    .then(data => {
        const resultxxx = JSON.parse(JSON.stringify(data));
    }).catch(err => {});
    return resultxxx;
}