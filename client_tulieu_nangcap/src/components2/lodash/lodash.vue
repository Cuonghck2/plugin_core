<template>
  <span></span>
</template>
<script>
import { reverse, pickBy, merge, isObject, isArray, isUndefined, isNumber, isEmpty, get, set, omit } from 'lodash';
const valTypes = { none: "NONE", primitive: "PRIM", object: "OBJECT", array: "ARRAY" }
const sortObjectKeys = (obj) => {
  return Object.keys(obj).sort().reduce((acc,key)=>{
    acc[key]=obj[key];
    return acc;
  },{});
};
const startsWith = (val, valToSearch) => {
    return val.indexOf(valToSearch) == 0;
}
const getPathType = (arrPath) => {
  var arrPathTypes = [];
  for (var path in arrPath) {
      var pathVal = arrPath[path];
      if (!pathVal)
          arrPathTypes.push(valTypes.none);
      else if (isNumber(pathVal))
          arrPathTypes.push(valTypes.array);
      else
          arrPathTypes.push(valTypes.object);
  }
  return arrPathTypes;
}
const getFieldName = (field, prefix, isRoot, isArrayItem, isArray) => {
  if (isArray)
    return (prefix ? prefix : "") + (isNumber(field) ? "[" + field + "]" : (isRoot && !prefix ? "" : ".") + field);
  else if (isArrayItem)
    return (prefix ? prefix : "") + "[" + field + "]";
  else
    return (prefix ? prefix + "." : "") + field;
}
const clearAudit = (newObj, curKey) => {
  if (curKey.endsWith('_index') || curKey.endsWith('_score') || curKey.endsWith('_source') || curKey.endsWith('_type') || curKey.endsWith('_doc') || curKey.endsWith('sort')) {
    return true;
  } else {
    return false;
  }
}
export default {
  beforeCreate: function() {
    window.Vue.reverse = reverse;
    window.Vue.pickBy = pickBy;
    window.Vue.merge = merge;
    window.Vue.isObject = isObject;
    window.Vue.isArray = isArray;
    window.Vue.isEmpty = isEmpty;
    window.Vue.omit = omit;
    window.Vue.get = get;
    window.Vue.set = set;
    window.Vue.flattenKeys = (obj, prefix, removeNull) => {
        var newObj = {};
        // primitives
        if (!isObject(obj) && !isArray(obj)) {
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
                            if (isEmpty(currentProp)) {
                                const curKey = getFieldName(f, p, isRoot, false, true);
                                newObj[curKey] = currentProp;
                                if (clearAudit(newObj, curKey)) {
                                    ignoreKeys = curKey;
                                }
                                delete newObj[ignoreKeys]
                            } else {
                                const curKey = getFieldName(f, p, isRoot, false, true);
                                newObj = recurse(currentProp, curKey, isArrayItem); // array
                                if (clearAudit(newObj, curKey)) {
                                    ignoreKeys = curKey;
                                }
                                delete newObj[ignoreKeys]
                            }
                        } else {
                            if (isArrayItem && isEmpty(currentProp) == false) {
                                const curKey = getFieldName(f, p, isRoot, true);
                                newObj = recurse(currentProp, curKey); // array item object
                                if (clearAudit(newObj, curKey)) {
                                    ignoreKeys = curKey;
                                }
                                delete newObj[ignoreKeys]
                            } else if (isEmpty(currentProp) == false) {
                                const curKey = getFieldName(f, p, isRoot);
                                if (!removeNull) {
                                    newObj[getFieldName(f, p, isRoot)] = currentProp; // primitive
                                } else if (removeNull) {
                                    currentProp = window.Vue.pickBy(currentProp);
                                }
                                newObj = recurse(currentProp, curKey); // object
                                if (typeof currentProp == 'object') {
                                    let objPrem = {};
                                    objPrem[curKey] = currentProp;
                                    newObj = { ...newObj, ...objPrem };
                                }
                                if (clearAudit(newObj, curKey)) {
                                    ignoreKeys = curKey;
                                }
                                delete newObj[ignoreKeys]
                            } else if (isEmpty(currentProp)) {
                                const curKey = getFieldName(f, p, isRoot, isArrayItem);
                                newObj[curKey] = currentProp;
                                if (clearAudit(newObj, curKey)) {
                                    ignoreKeys = curKey;
                                }
                                delete newObj[ignoreKeys]
                            }
                        }
                    } else {
                        if (isArrayItem || isNumber(f)) {
                            const curKey = getFieldName(f, p, isRoot, true);
                            newObj[curKey] = currentProp; // array item primitive
                            if (clearAudit(newObj, curKey)) {
                                ignoreKeys = curKey;
                            }
                            delete newObj[ignoreKeys]
                        } else {
                            if (!removeNull) {
                                const curKey = getFieldName(f, p, isRoot);
                                newObj[curKey] = currentProp; // primitive
                                if (clearAudit(newObj, curKey)) {
                                    ignoreKeys = curKey;
                                }
                                delete newObj[ignoreKeys]
                            } else if (currentProp) {
                                const curKey = getFieldName(f, p, isRoot);
                                newObj[curKey] = currentProp; // primitive
                                if (clearAudit(newObj, curKey)) {
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
    };
    window.Vue.isNumber = isNumber;
    window.Vue.backward = function (obj, prefix) {
        var newObj = {};
        var arStartRegex = /\[(\d+)\]/g;
        if (!isObject(obj) && !isArray(obj)) {
            if (prefix) {
                return obj[prefix];
            } else {
                return obj;
            }
        }
        obj = sortObjectKeys(obj);
        for (var tProp in obj) {
            var tPropVal = obj[tProp];

            if (prefix) {
                var prefixRegex = new RegExp("^" + prefix);
                tProp = tProp.replace(prefixRegex, "");
            }

            tProp = tProp.replace(arStartRegex, ".$1");

            if (startsWith(tProp, ".")) {
              tProp = tProp.replace(/^\./, "");
            }
            var arrPath = tProp.split(".");
            var arrPathTypes = getPathType(arrPath);
            if (!isUndefined(arrPathTypes) &&
                arrPathTypes[0] == valTypes.array &&
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

                var isArray = currentPathType == valTypes.array;

                if (isNumber(currentPath)) {
                  currentPath = parseInt(currentPath);
                }
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
                if (currentPathType == valTypes.array && rPropValPrev && rObjPrev) {
                    if (Array.isArray(rObjPrev[rPropValPrev]) == false)
                        rObjPrev[rPropValPrev] = [];
                    rObjPrev[rPropValPrev].push(rPropVal);
                } else {
                    rObj[currentPath] = rPropVal;
                }
            }(tPropVal, newObj));
        }

        return newObj;
    };
  }
}
</script>