self.addEventListener('message', async function(e) {
    var myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");
    var raw = JSON.stringify({
      "filter": {
        "match": {
          "site": "csdl_mt"
        }
      },
      db: 'CSDL_MTQA'
    });
    var requestOptions = {
      method: 'POST',
      headers: myHeaders,
      body: raw,
      redirect: 'follow'
    };
    fetch("/admin/vuejx/initApp", requestOptions)
      .then(response => response.json())
      .then(result => {
            if (Array.isArray(result) && result.length > 0) {
                self.postMessage({
                    appversion: result[0]._source['appversion']
                });  
            }
      })
      .catch(error => {});	

})
