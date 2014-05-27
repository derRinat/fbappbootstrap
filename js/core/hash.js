/* Hash */

var Hash = createClass({

    construct: function() {
        this.hash = {}
    },

    setHash: function(hash) {
        this.hash = hash;
    },

    getHash: function() {
        return this.hash;
    },

    get: function(key) {
        if (typeof this.hash[key] !== 'undefined')
            return this.hash[key];
        return null;
    },

    set: function(key, value) {
        this.hash[key] = value;
    },

    has: function(key) {
        if (typeof this.hash === 'Object')
            return (key in this.hash);
        return false;
    }
});