var obj2arr = function (obj) {
    if (typeof obj == 'object') {
        var tmp_args = new Array();
        for (var k in obj) {
            tmp_args.push(obj[k]);
        }
        return tmp_args;
    } else {
        return [obj];
    }
}