/* eslint-disable */
export function sleep(ms) { return new Promise(res => setTimeout(res, ms)); }
export async function cleanDot(data) {
    for (let key in data) {
        if (String(key).indexOf(".") !== -1) {
            delete data[key];
        }
    }
    return data;
}
export function dateViewYear(item, key, defaultVal) {
  return window.Vue.dateViewYear(item, key, defaultVal)
}
export function dateViewMonthYear(item, key, defaultVal) {
  return window.Vue.dateViewMonthYear(item, key, defaultVal)
}
export function dateView(item, key, defaultVal, dateFormat) {
  return window.Vue.dateView(item, key, defaultVal, dateFormat)
}
export function objectView(item, key, defaultVal) {
  return window.Vue.objectView(item, key, defaultVal)
}
export function objectViewObject(item, key, defaultVal) {
  return window.Vue.objectViewObject(item, key, defaultVal)
}
export async function sampleData(db, collection, referenceUid, objectId, keys, filterDetail) {
    let vuejx_form_data = {};
    const queryRouter = window.Vue.router.currentRoute.value.query;
    if (filterDetail) {
      vuejx_form_data = {};
      if (db && collection) {
        await window.VueJX
          .dispatch("vuejx_manager/userOne", {
            db: localStorage.getItem("db"),
            collection: collection,
            keys: keys,
            filter: filterDetail,
            skip: 0,
          })
          .then((data) => {
            if (data) {
              vuejx_form_data = data;
            }
          })
          .catch(() => {
            vuejx_form_data = {};
          });
      }
    } else {
      let rawReferenceUid = queryRouter["referenceUid"];
      if (referenceUid) {
        rawReferenceUid = referenceUid;
      }
      if (objectId && String(objectId) === "true") {
        rawReferenceUid = null;
      }
      if (!queryRouter["_id"] || queryRouter["_id"] === 'NULL' ) {
        vuejx_form_data = {};
      }
      if (queryRouter["_id"] && queryRouter["_id"] !== "NULL" && (!rawReferenceUid || objectId)) {
        vuejx_form_data = {};
        if (db && collection) {
          await window.VueJX
            .dispatch("vuejx_manager/userById", {
              db: localStorage.getItem("db"),
              collection: collection,
              id: queryRouter["_id"],
              keys: keys,
            })
            .then((data) => {
              if (data) {
                vuejx_form_data = data;
              }
            })
            .catch(() => {
              vuejx_form_data = {};
            });
        }
      } else if (rawReferenceUid) {
        vuejx_form_data = {};
        if (db && collection) {
          await window.VueJX
            .dispatch("vuejx_manager/userOne", {
              db: localStorage.getItem("db"),
              collection: collection,
              keys: keys,
              filter: {
                referenceUid: rawReferenceUid,
              },
              skip: 0,
            })
            .then((data) => {
              if (data) {
                vuejx_form_data = data;
              }
            })
            .catch(() => {
              vuejx_form_data = {};
            });
        }
      } else if (queryRouter["_id"] && queryRouter["_id"] == "NULL" && objectId) {
        vuejx_form_data = {};
        if (db && collection) {
          await window.VueJX
            .dispatch("vuejx_manager/userById", {
              db: localStorage.getItem("db"),
              collection: collection,
              id: objectId,
              keys: keys
            })
            .then((data) => {
              if (data) {
                vuejx_form_data = data;
              }
            })
            .catch(() => {
              vuejx_form_data = {};
            });
        }
      }
    }

    let dotObject = {};
    if (vuejx_form_data) {
      dotObject = await window.Vue.flattenKeys(vuejx_form_data, null, true);
    }
    return dotObject;
}

export async function flattenObject(data) {
    return window.Vue.flattenKeys(data);
}
export async function flatData(data) {
    return window.Vue.flattenKeys(data);
}
export async function backward(data) {
    return window.Vue.backward(data);
}

export async function removeBykey(data, key) {
    for (let keyX in data) {
      if (keyX === key || String(keyX).startsWith(key + ".")) {
        delete data[keyX];
      }
    }
    return data;
}
export function isArray(item, key) {
    return window.Vue.isArray(window.Vue.get(item, key))
}

export function isNotNull(item, key) {
    return window.Vue.isEmpty(window.Vue.get(item, key))
}

export function permission(role) {
    const user = vm.user;
    if (role !== undefined && role !== null && role.length > 0) {
      return user["role"].some((v) => {
        if (role.indexOf(v["_source"]["shortName"]) !== -1) {
          return true;
        }
      });
    } else {
      return true;
    }
}
export function exportXLSX(id, name) {
    let vm = this;
}
export function exportPDF(id, name) {
    let vm = this;
}
export function rtf(str) {
    return new Promise((resolve, reject) => {
      let reslult = "";
    });
}

export async function submitData(dataForm, customRedirect, hasNoti, updateOne) {
    let vm = this;
    if (hasNoti !== undefined && hasNoti !== null && hasNoti !== "") {
    } else {
      hasNoti = true;
    }
    let postData = dataForm;
    if (postData["site"]) {
    } else {
      postData["site"] = vm.site;
    }
    let action = "vuejx_manager/userCreate";
    if (
      postData._id !== undefined &&
      postData._id !== null &&
      postData._id !== ""
    ) {
      action = "vuejx_manager/userUpdateById";
    }
    if (updateOne) {
      action = "vuejx_manager/userUpdateOne";
    }
    let dbPost = postData["PostDB"];
    let collectionPost = postData["PostCollection"];
    let actionCode = postData["actionCode"];
    delete postData["actionCode"];
    delete postData["PostCollection"];
    delete postData["PostDB"];
    console.log(action, {
      db: localStorage.getItem("db"),
      collection: collectionPost,
      body: postData,
      actionCode: actionCode,
    });
    if (dbPost !== undefined && dbPost !== null && dbPost !== "") {
      await window.VueJX
        .dispatch(action, {
          db: localStorage.getItem("db"),
          collection: collectionPost,
          body: postData,
          actionCode: actionCode,
        })
        .then((response) => {
          if (
            response.data !== undefined &&
            response.data.insertedId !== undefined
          ) {
            dataForm["_id"] = response.data.insertedId;
            if (customRedirect) {
                /*
                vm.$emit("afterSubmit", {
                    insertedId: response.data.insertedId,
                });
                */
            } else {
              window.Vue.redirect(
                [
                  {
                    key: "_id",
                    value: response.data.insertedId,
                  },
                  {
                    key: "t",
                    value: new Date().getTime(),
                  },
                ],
                true
              );
            }
          } else {
            if (customRedirect) {
                /*
                vm.$emit("afterSubmit", {
                modifiedCount: 1,
                });
                */
            } else {
              window.Vue.redirect(
                [
                  {
                    key: "t",
                    value: new Date().getTime(),
                  },
                ],
                true
              );
            }
          }
          if (hasNoti) {
            window.Vue.toastr.success("Thành công.");
          }
        })
        .catch((err) => {
          if (hasNoti) {
            window.Vue.toastr.error("Error.");
          }
        });
    }
}

export async function pullDetailES(vm, collection, query, columns) {
  let result = null
    const searchData = await window.VueJX.search(vm, collection, [], [], query, columns ? columns : [], null, null, 1, false, 1);
    if (searchData && searchData.totalRecord > 0) {
        try {
          result = searchData.dataResults[0]._source
        } catch (error) {
          result = null
        }
    }
    return result
}

export async function exportExcel(table, filename, sheetName, type, fn, dl) {
    if (!document.getElementById("exportxlsx_lib_script")) {
      var script = document.createElement("script");
      script.setAttribute("type", "application/javascript");
      script.setAttribute("src", "/xlsx.full.min.js");
      script.setAttribute("id", "exportxlsx_lib_script");
      document.head.appendChild(script);
    }
    setTimeout(() => {
      if (filename) {
      } else {
        filename = "export";
      }
      if (sheetName) {
      } else {
        sheetName = "Sheet JS";
      }
      var elt = document.getElementById(table);
      var wb = XLSX.utils.table_to_book(elt.parentNode, { sheet: sheetName });
      XLSX.writeFile(wb, fn || filename + ".xlsx");
    }, 500);
}

export async function exportPdf(idToExport, filename, orientation, margin) {
  if (!document.getElementById("exportpdf_lib_script")) {
    var script = document.createElement("script");
    script.setAttribute("type", "application/javascript");
    script.setAttribute("src", "/static/vuejx-next/html2pdf.bundle.js");
    script.setAttribute("id", "exportpdf_lib_script");
    document.head.appendChild(script);
  }
  setTimeout(() => {
    var element = document.getElementById(idToExport);
    if (orientation) {
    } else {
      orientation = "landscape";
    }
    if (filename) {
    } else {
      filename = "export";
    }
    if (margin) {
    } else {
      margin = 0.5;
    }
    var opt = {
      margin: margin,
      filename: filename + ".pdf",
      image: { type: "jpeg", quality: 1 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: "in", format: "letter", orientation: orientation },
    };

    // New Promise-based usage:
    html2pdf().set(opt).from(element).save();
  }, 500);
}

export function pad(n, width, z) {
    z = z || "0";
    n = n + "";
    return n.length >= width
      ? n
      : new Array(width - n.length + 1).join(z) + n;
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
        const rawData = JSON.parse(JSON.stringify(data));
        let objectUnknown = {};
        for (let key in data) {
          if (objectReport[key]) {
            if (
              data[key]["aggregations"] !== undefined &&
              data[key]["aggregations"] !== null &&
              data[key]["aggregations"]["report"] !== undefined &&
              data[key]["aggregations"]["report"] !== null &&
              data[key]["aggregations"]["report"]["aggregations"] !==
                undefined &&
              data[key]["aggregations"]["report"]["aggregations"] !== null &&
              data[key]["aggregations"]["report"]["aggregations"][
                "buckets"
              ] !== undefined &&
              data[key]["aggregations"]["report"]["aggregations"][
                "buckets"
              ] !== null
            ) {
              let totalAggs =
                data[key]["aggregations"]["report"]["doc_count"];
              let objectMapping = {};
              let totalAggsEl = 0;
              for (let el of data[key]["aggregations"]["report"][
                "aggregations"
              ]["buckets"]) {
                if (Object.prototype.hasOwnProperty.call(el, "ext")) {
                  objectMapping[el["key"]] = el["ext"]["value"];
                } else {
                  objectMapping[el["key"]] = el["doc_count"];
                }
                totalAggsEl = totalAggsEl + el["doc_count"];
              }
              objectUnknown[key] = totalAggs - totalAggsEl;
              data[key] = objectMapping;
            }
          }
        }
        resultxxx = {
          unknown: objectUnknown,
          report: data,
          report_raw: rawData
        }
      })
      .catch(err => {
      });
      return resultxxx;
}