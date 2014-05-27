/**
 * JQuery extend methods
 * User defined helpers
 */
$.extend({

    /**
     * Makes AJAX request
     * @param params
     * @param callback
     */
    callServerApi: function(params, callback) {
        var method = 'POST',
            callParams = {},
            dataType = 'html';

        if (typeof params.dataType !== 'undefined') {
            dataType = params.dataType;
        }

        if (params.overlay == 1) {
            callParams.beforeSend = function() {
                $('.overlay').show();
            }
            callParams.complete = function() {
                $('.overlay').hide();
            }
        }

        callParams.url = params.action;
        callParams.method = method;
        callParams.dataType = dataType;
        callParams.data = params;
        callParams.success = function(data) {
            callback(data);
        };

        if (typeof params.beforeSend !== 'undefined') {
            callParams.beforeSend = params.beforeSend;
            delete params.beforeSend;
        }
        $.ajax(callParams);
    },

    /**
     * Shuffle array
     * @param array
     * @returns array
     */
    shuffle: function(array) {
        for (var i = array.length - 1; i > 0; i--) {
            var j = Math.floor(Math.random() * (i + 1));
            var tmp = array[i];
            array[i] = array[j];
            array[j] = tmp;
        }

        return array;
    },

    /**
     * Get random number
     * @param int from
     * @param int to
     * @returns {number}
     */
    simpleRand: function(from, to) {
        return Math.floor(Math.random() * (to - from + 1) + from);
    },

    /**
     * PHP analog for intval
     * @param mixed_var
     * @param base
     * @returns {*}
     */
    intval: function(mixed_var, base) {

        var tmp;

        if (typeof(mixed_var) == 'string') {
            tmp = parseInt(mixed_var);
            if (isNaN(tmp) || !isFinite(tmp)) {
                return 0;
            } else {
                return tmp.toString(base || 10);
            }
        } else if (typeof(mixed_var) == 'number' && isFinite(mixed_var)) {
            return Math.floor(mixed_var);
        } else {
            return 0;
        }
    },

    /**
     * Get specified param in name from URL
     * @param name
     * @returns {*}
     */
    urlParam: function(name) {
        var results = new RegExp('[\\?&]' + name + '=([^&#]*)').exec(window.location.href);
        return (results !== null) ? results[1] : null;
    },

    /**
     * Get all URL params as object
     * @param url
     * @returns {Array}
     */
    getUrlParams: function(url) {
        var vars = [],
            hash;
        var hashes = url.slice(url.indexOf('?') + 1).split('&');
        for (var i = 0; i < hashes.length; i++) {
            hash = hashes[i].split('=');
            vars.push(hash[0]);
            vars[hash[0]] = hash[1];
        }
        return vars;
    },

    /**
     * Implodes string with "glue"
     * @param glue
     * @param pieces
     * @returns {*}
     */
    implode: function(glue, pieces) {
        return ((pieces instanceof Array) ? pieces.join(glue) : pieces);
    },

    /**
     * Count function for object
     * @param obj
     * @returns {number}
     */
    getObjectLength: function(obj) {
        var length = 0;
        for (var p in obj) {
            if (obj.hasOwnProperty(p)) {
                length++;
            }
        }
        return length;
    },

    /**
     * Defines FB specified ref by request_id
     * @returns {string}
     */
    defineReqestRef: function() {
        var request_ids = decodeURIComponent($.urlParam('request_ids')),
            toreturn = '';

        if (typeof request_ids !== 'undefined' && request_ids !== '') {

            var request_ids_array = request_ids.split(',');
            toreturn = request_ids_array.pop();
        }

        return toreturn;
    },

    uBrowser: function() {
        $.browser = {
            chrome: false,
            mozilla: false,
            opera: false,
            msie: false,
            safari: false
        };
        var ua = navigator.userAgent;
        $.each($.browser, function(c, a) {
            $.browser[c] = ((new RegExp(c, 'i').test(ua))) ? true : false;
            if ($.browser.mozilla && c == 'mozilla') {
                $.browser.mozilla = ((new RegExp('firefox', 'i').test(ua))) ? true : false;
            };
            if ($.browser.chrome && c == 'safari') {
                $.browser.safari = false;
            };
        });
        return $.browser;
    }
});