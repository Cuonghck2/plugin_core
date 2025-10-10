/* eslint-disable */
export function sleepDotize(ms) { return new Promise(res => setTimeout(res, ms)); }

var dotize = {
    valTypes: {
        none: "NONE",
        primitive: "PRIM",
        object: "OBJECT",
        array: "ARRAY",
    },

    getValType: function (val) {
        if ((!val || typeof val != "object") && !Array.isArray(val))
            return dotize.valTypes.primitive;
        if (Array.isArray(val))
            return dotize.valTypes.array;
        if (typeof val == "object")
            return dotize.valTypes.object;
    },

    getPathType: function (arrPath) {
        var arrPathTypes = [];
        for (var path in arrPath) {
            var pathVal = arrPath[path];
            if (!pathVal)
                arrPathTypes.push(dotize.valTypes.none);
            else if (dotize.isNumber(pathVal))
                arrPathTypes.push(dotize.valTypes.array);
            else
                arrPathTypes.push(dotize.valTypes.object);
        }
        return arrPathTypes;
    },

    isUndefined: function (obj) {
        return typeof obj == "undefined";
    },

    isNumber: function (f) {
        return !isNaN(parseInt(f));
    },

    isEmptyObj: function (obj) {
        for (var prop in obj) {
            if (Object.hasOwnProperty.call(obj, prop))
                return false;
        }
        return JSON.stringify(obj) === JSON.stringify({});
    },

    isNotObject: function (obj) {
        return !obj || typeof obj != "object";
    },

    isEmptyArray: function (arr) {
        return Array.isArray(arr) && arr.length == 0;
    },

    isNotArray: function (arr) {
        return Array.isArray(arr) == false;
    },

    removeEmptyArrayItem: function (arr) {
        return arr.filter(function (el) {
            return el != null && el != "";
        });
    },

    getFieldName: function (field, prefix, isRoot, isArrayItem, isArray) {
        if (isArray)
            return (prefix ? prefix : "") + (dotize.isNumber(field) ? "[" + field + "]" : (isRoot && !prefix ? "" : ".") + field);
        else if (isArrayItem)
            return (prefix ? prefix : "") + "[" + field + "]";
        else
            return (prefix ? prefix + "." : "") + field;
    },

    startsWith: function (val, valToSearch) {
        return val.indexOf(valToSearch) == 0;
    },

    clearAudit: function (newObj, curKey) {
        if (curKey.endsWith('_index') || curKey.endsWith('_score') || curKey.endsWith('_source') || curKey.endsWith('_type') || curKey.endsWith('_doc') || curKey.endsWith('sort')) {
            return true;
        } else {
            return false;
        }
    },

    convert: function (obj, prefix, removeNull) {
        var newObj = {};
        // primitives
        if (dotize.isNotObject(obj) && dotize.isNotArray(obj)) {
            if (prefix) {
                newObj[prefix] = obj;
                return newObj;
            } else {
                return obj;
            }
        }
            return function recurse(o, p, isRoot) {
                var isArrayItem = Array.isArray(o);
                var ignoreKeys = '';
                for (var f in o) {
                    var currentProp = o[f];
                    if (currentProp && typeof currentProp === "object" && !Array.isArray(currentProp)) {
                        if (Array.isArray(currentProp)) {
                            if (dotize.isEmptyArray(currentProp)) {
                                const curKey = dotize.getFieldName(f, p, isRoot, false, true);
                                newObj[curKey] = currentProp;
                                if (dotize.clearAudit(newObj, curKey)) {
                                    ignoreKeys = curKey;
                                }
                                delete newObj[ignoreKeys]
                            } else {
                                const curKey = dotize.getFieldName(f, p, isRoot, false, true);
                                newObj = recurse(currentProp, curKey, isArrayItem); // array
                                if (dotize.clearAudit(newObj, curKey)) {
                                    ignoreKeys = curKey;
                                }
                                delete newObj[ignoreKeys]
                            }
                        } else {
                            if (isArrayItem && dotize.isEmptyObj(currentProp) == false) {
                                const curKey = dotize.getFieldName(f, p, isRoot, true);
                                newObj = recurse(currentProp, curKey); // array item object
                                if (dotize.clearAudit(newObj, curKey)) {
                                    ignoreKeys = curKey;
                                }
                                delete newObj[ignoreKeys]
                            } else if (dotize.isEmptyObj(currentProp) == false) {
                                const curKey = dotize.getFieldName(f, p, isRoot);
                                if (!removeNull) {
                                    newObj[dotize.getFieldName(f, p, isRoot)] = currentProp; // primitive
                                } else if (removeNull) {
                                    currentProp = window.Vue.pickBy(currentProp);
                                }
                                newObj = recurse(currentProp, curKey); // object
                                if (typeof currentProp == 'object') {
                                    let objPrem = {};
                                    objPrem[curKey] = currentProp;
                                    newObj = { ...newObj, ...objPrem };
                                }
                                if (dotize.clearAudit(newObj, curKey)) {
                                    ignoreKeys = curKey;
                                }
                                delete newObj[ignoreKeys]
                            } else if (dotize.isEmptyObj(currentProp)) {
                                const curKey = dotize.getFieldName(f, p, isRoot, isArrayItem);
                                newObj[curKey] = currentProp;
                                if (dotize.clearAudit(newObj, curKey)) {
                                    ignoreKeys = curKey;
                                }
                                delete newObj[ignoreKeys]
                            }
                        }
                    } else {
                        if (isArrayItem || dotize.isNumber(f)) {
                            const curKey = dotize.getFieldName(f, p, isRoot, true);
                            newObj[curKey] = currentProp; // array item primitive
                            if (dotize.clearAudit(newObj, curKey)) {
                                ignoreKeys = curKey;
                            }
                            delete newObj[ignoreKeys]
                        } else {
                            if (!removeNull) {
                                const curKey = dotize.getFieldName(f, p, isRoot);
                                newObj[curKey] = currentProp; // primitive
                                if (dotize.clearAudit(newObj, curKey)) {
                                    ignoreKeys = curKey;
                                }
                                delete newObj[ignoreKeys]
                            } else if (currentProp) {
                                const curKey = dotize.getFieldName(f, p, isRoot);
                                newObj[curKey] = currentProp; // primitive
                                if (dotize.clearAudit(newObj, curKey)) {
                                    ignoreKeys = curKey;
                                }
                                delete newObj[ignoreKeys]
                            }
                        }
                    }
                }
                delete newObj['_index'];
                delete newObj['_score'];
                delete newObj['_type'];
                delete newObj[ignoreKeys]
                return newObj;
            }(obj, prefix, true);
    },
    sortObjectKeys: function (obj){
        return Object.keys(obj).sort().reduce((acc,key)=>{
            acc[key]=obj[key];
            return acc;
        },{});
    },
    backward: function (obj, prefix) {
        var newObj = {};
        var arStartRegex = /\[(\d+)\]/g;

        // primitives
        if (dotize.isNotObject(obj) && dotize.isNotArray(obj)) {
            if (prefix) {
                return obj[prefix];
            } else {
                return obj;
            }
        }
        obj = dotize.sortObjectKeys(obj);
        for (var tProp in obj) {
            var tPropVal = obj[tProp];

            if (prefix) {
                var prefixRegex = new RegExp("^" + prefix);
                tProp = tProp.replace(prefixRegex, "");
            }

            tProp = tProp.replace(arStartRegex, ".$1");

            if (dotize.startsWith(tProp, "."))
                tProp = tProp.replace(/^\./, "");

            var arrPath = tProp.split(".");
            var arrPathTypes = dotize.getPathType(arrPath);

            // has array on root
            if (!dotize.isUndefined(arrPathTypes) &&
                arrPathTypes[0] == dotize.valTypes.array &&
                Array.isArray(newObj) == false) {
                newObj = [];
            }

            (function recurse(rPropVal, rObj, rPropValPrev, rObjPrev) {
                var currentPath = arrPath.shift();
                var currentPathType = arrPathTypes.shift();

                if (typeof currentPath == "undefined" || currentPath == "") {
                    newObj = rPropVal;
                    return;
                }

                var isArray = currentPathType == dotize.valTypes.array;

                if (dotize.isNumber(currentPath))
                    currentPath = parseInt(currentPath);

                // has multiple levels
                if (arrPath.length > 0) {
                    // is not assigned before
                    if (typeof rObj[currentPath] == "undefined") {
                        if (isArray) {
                            rObj[currentPath] = [];
                        } else {
                            rObj[currentPath] = {};
                        }
                    }

                    recurse(rPropVal, rObj[currentPath], currentPath, rObj);
                    return;
                }

                if (currentPathType == dotize.valTypes.array && rPropValPrev && rObjPrev) {
                    if (Array.isArray(rObjPrev[rPropValPrev]) == false)
                        rObjPrev[rPropValPrev] = [];
                    rObjPrev[rPropValPrev].push(rPropVal);
                } else {
                    rObj[currentPath] = rPropVal;
                }
            }(tPropVal, newObj));
        }

        return newObj;
    },
    backwardRaw: function (obj, prefix) {
        var newObj = {};
        var arStartRegex = /\[(\d+)\]/g;

        // primitives
        if (dotize.isNotObject(obj) && dotize.isNotArray(obj)) {
            if (prefix) {
                return obj[prefix];
            } else {
                return obj;
            }
        }

        for (var tProp in obj) {
            var tPropVal = obj[tProp];

            if (prefix) {
                var prefixRegex = new RegExp("^" + prefix);
                tProp = tProp.replace(prefixRegex, "");
            }

            tProp = tProp.replace(arStartRegex, ".$1");

            if (dotize.startsWith(tProp, "."))
                tProp = tProp.replace(/^\./, "");

            var arrPath = tProp.split(".");
            var arrPathTypes = dotize.getPathType(arrPath);

            // has array on root
            if (!dotize.isUndefined(arrPathTypes) &&
                arrPathTypes[0] == dotize.valTypes.array &&
                Array.isArray(newObj) == false) {
                newObj = [];
            }

            (function recurse(rPropVal, rObj, rPropValPrev, rObjPrev) {
                var currentPath = arrPath.shift();
                var currentPathType = arrPathTypes.shift();

                if (typeof currentPath == "undefined" || currentPath == "") {
                    newObj = rPropVal;
                    return;
                }

                var isArray = currentPathType == dotize.valTypes.array;

                if (dotize.isNumber(currentPath))
                    currentPath = parseInt(currentPath);

                // has multiple levels
                if (arrPath.length > 0) {
                    // is not assigned before
                    if (typeof rObj[currentPath] == "undefined") {
                        if (isArray) {
                            rObj[currentPath] = [];
                        } else {
                            rObj[currentPath] = {};
                        }
                    }

                    recurse(rPropVal, rObj[currentPath], currentPath, rObj);
                    return;
                }

                if (currentPathType == dotize.valTypes.array && rPropValPrev && rObjPrev) {
                    if (Array.isArray(rObjPrev[rPropValPrev]) == false)
                        rObjPrev[rPropValPrev] = [];
                    rObjPrev[rPropValPrev].push(rPropVal);
                } else {
                    rObj[currentPath] = rPropVal;
                }
            }(tPropVal, newObj));
        }

        return newObj;
    }
}

export default { dotize }
