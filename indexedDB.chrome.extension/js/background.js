var server;

chrome.runtime.onMessageExternal.addListener(
    function (request, sender, sendResponse) {
        var cmd = request.cmd,
            params = request.params;
        try {
            switch (cmd) {
                case "getUsageAndQuota":
                    navigator.webkitPersistentStorage.queryUsageAndQuota(function(u,q){
                        sendResponse({"usage": u,"quota":q});
                    });
                    break;
                case "open":
                    db.open(params).done(function (s) {
                        server = s;
                        var exclude = "add close get query remove update".split(" ");
                        var tables = new Array();
                        for(var table in server){
                            if(exclude.indexOf(table)==-1){
                                tables.push(table);
                            }
                        }
                        sendResponse(tables);
                    });
                    break;
                case "close":
                    server.close();
                    sendResponse({});
                    break;
                case "get":
                    server[request.table].get(params).done(sendResponse)
                    break;
                case "add":
                    server[request.table].add(params).done(sendResponse);
                    break;
                case "update":
                    server[request.table].update(params).done(sendResponse);
                    break;
                case "remove":
                    server[request.table].remove(params).done(sendResponse);
                    break;
                case "execute":
                    var tmp_server = server[request.table];
                    var query = tmp_server.query.apply(tmp_server, obj2arr(request.query));
                    var flt;
                    for (var i = 0; i < request.filters.length; i++) {
                        flt = request.filters[i];
                        if (flt.type == "filter") {
                            flt.args = new Function("item", flt.args[0]);
                        }
                        query = query[flt.type].apply(query, obj2arr(flt.args));
                    }
                    query.execute().done(sendResponse);
                    break;
            }
        } catch (error) {
            if (error.name != "TypeError") {
                sendResponse({RUNTIME_ERROR: error});
            }
        }
        return true;
    });

