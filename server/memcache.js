const mcache = require('memory-cache');

var memcache = {
    keyify: function() {
        let key = "__";
        for (var i=0; i < arguments.length; i++) {
            key += encodeURI(arguments[i]) + "__";
        }
        return key;
    },
    getCache: function(key) {
        let body = mcache.get(key);
        return body;
    },
    setCache: function(key, body) {
        mcache.put(key, body, 60 * 60 * 24 * 7 * 1000);
    }
}
  
module.exports = { memcache };