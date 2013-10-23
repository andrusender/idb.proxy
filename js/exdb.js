(function (window, undefined) {
    "use strict";
    function exDB() {
        var self = this;
        this.extensionId = arguments[0] || "eojllnbjkomphhmpcpafaipblnembfem";
        this.filterList = new Array();
        this._table;
        this._query;
        self.sendMessage = function sendMessage(data, callback) {
            chrome.runtime.sendMessage(self.extensionId, data, callback);
        };

        self.open = function (params, callback) {
            self.sendMessage({"cmd": "open", "params": params}, function(r){
                var tn;
                for(var i=0;i< r.length;i++)
                    tn = r[i];
                    self.__defineGetter__(tn,function(){
                        self._table = tn;
                        return this;
                    });
                callback();
            });
            return self;
        };

        self.close = function (callback) {
            self.sendMessage({"cmd": "close", "params": {}}, callback);
            return self;
        }

        self.table = function (name) {
            self._table = name;
            return self;
        };

        self.query = function () {
            self._query = arguments;
            return self;
        };

        self.execute = function (callback) {
            self.sendMessage({"cmd": "execute", "table": self._table, "query": self._query, "filters": self.filterList}, function (result) {
                if (result && result.RUNTIME_ERROR) {
                    console.error(result.RUNTIME_ERROR.message);
                    result = null;
                }
                callback(result);
            });
            self._query = null;
            self.filterList = [];
        };

        self.getUsageAndQuota = function(callback){
            self.sendMessage({"cmd": "getUsageAndQuota"},callback);
        }

        "add update remove get".split(" ").forEach(function (fn) {
            self[fn] = function (item, callback) {
                self.sendMessage({"cmd": fn, "table": self._table, "params": item}, function (result) {
                    if (result && result.RUNTIME_ERROR) {
                        console.error(result.RUNTIME_ERROR.message);
                        result = null;
                    }
                    callback(result);
                });
                return self;
            }
        });

        "all only lowerBound upperBound bound filter desc distinct keys count".split(" ").forEach(function (fn) {
            self[fn] = function () {
                self.filterList.push({type: fn, args: arguments});
                return self;
            }
        });

    }

    window.exDB = exDB;
})(window, undefined);