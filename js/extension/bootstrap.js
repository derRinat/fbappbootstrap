/* Engine start */

var SAPI = createClass({

    construct: function(socialNetworkId, settings) {

        this.network = null;
        this.cache = new Hash();
        this.queryParams = new Hash();
        this.settings = settings;
        this.socialNetworkId = socialNetworkId;

        this._setQueryParams();
        this._createNetwork();
    },

    /**
     *  Define and collect URL params in assoc array
     */
    _setQueryParams: function() {
        var query = window.location.search.trim();

        query = query.length ? query.substr(1) : query;
        query = decodeURIComponent(query);

        if (query.length > 0) {
            var self = this;
            $.each(query.split('&'), function(p) {
                p = p.toString().split("=", 2);
                self.queryParams.set(p[0], p[1]);
            })
        }
    },

    /**
     *  Social netwrork wrapper factory
     */
    _createNetwork: function() {

        var network = null;

        switch (this.socialNetworkId) {

            case 'fb':
                network = new FacebookNetwork(this);
                break;
            default:
                throw new Error('Error. Unknown social network: ' + this.socialNetworkId);
                break;
        }
        this.network = network;
        this.network.setCacheStorage(this.cache);
        this.network.start(this.settings.CALLBACK);
    },

    _log: function() {
        if (this.settings.DEBUG && window.console && console.log) {

            if (Browser.ie) {
                var args = [];
                for (var a = 0; a < arguments.length; a++) {
                    args[a] = typeof(arguments[a]) == 'object' ? JSON.encode(arguments[a]) : arguments[a];
                }
                console.log(args.join(", "));
            } else {
                console.log.apply(console, arguments);
            }
        }
    },

    _error: function() {
        if (window.console && console.error) console.error(error);
    }
})

///

// Social network Interface, defines method which will defined in extended classes
var SocialNetwork = createClass({

    // Define possible wrapper methods as abstracts
    abstracts: [
        'start',
        'setNetworkParams',
        'getUser',
        'getFriends',
        'inviteFriends',
        'massInviteFriends',
        'makePayment',
        'wallPost',
        'sendNotification',
        'createSig',
        'getUserId',
        'hasLike',
        'getAuthUrl'
    ],

    // Class constructor
    construct: function(wrapper) {
        if (!(wrapper instanceof SAPI)) {
            throw new TypeError("wrapper must be instance of SAPI");
        }

        this.cancelled = 0;
        this.dataHandler = null;
        this.cacheStorage = null;
        this.networkParams = new Hash();
        this.wrapper = wrapper;
    },

    setCacheStorage: function(cache) {
        this.cacheStorage = cache;
    },

    getCacheStorage: function() {
        return this.cacheStorage;
    },

    setDataHandler: function(handler) {
        if (typeof(handler) != 'function') {
            throw new TypeError("Data handler is not a Function");
        }

        this.dataHandler = handler;
    },

    getDataHandler: function() {
        return this.dataHandler;
    },

    extractResponse: function(response) {
        if (typeof response !== 'null' && response.length !== 0) {
            return response[0];
        }
        return null;
    },

    setCallback: function(callback) {
        this.callback = callback;
    },

    getCallback: function() {
        return this.callback;
    },

    init: function(callback) {
        this.callback = callback;
    },

    // Getters & setters for private vars
    getClassProperty: function(property) {
        if (typeof this[property] !== 'undefined')
            return this[property];
        return null;
    },

    setClassProperty: function(property, value) {
        this[property] = value;
    },

    incrClassProperty: function(property) {
        this[property]++;
    }
});

var FacebookNetwork = createClass({

    extend: SocialNetwork,

    // Constructor, call parent constructor, set specified social network setttings as class properties
    construct: function(wrapper) {

        SocialNetwork.call(this, wrapper);

        // Default private vars
        this.setClassProperty('friendsOffset', 0);
        this.setClassProperty('inviteMassFriendsSkip', 0);
    },

    // Lets go...
    start: function(callback) {

        this.setCallback(callback);

        var self = this;

        FB.init(this.wrapper.settings.NETWORK.INIT_PARAMS);

        FB.getLoginStatus(function(response) {
            if (response.status == 'connected') {
                self._collectNetworkParams(response);

                self._checkPermissions(function() {
                    self.getUser(function() {
                        self.getFriends(function() {
                            self.getCallback()(self);
                        })
                    })
                });
            } else {
                var cancelled = $.urlParam('error_reason');

                if (cancelled === 'user_denied') {
                    self.cancelled = 1;
                    self.getCallback()(self);
                } else {
                    self.authRedirect();
                }
            }
        });
    },

    _getUserRef: function() {
        return $.urlParam('ref');
    },

    getUser: function(callback) {

        // Try to get data from cache, esle get if from network
        var self = this,
            cache = this.getCacheStorage(),
            settings = this.wrapper.settings,
            userData = {}

        if (cache.get('user')) {
            if (typeof callback === 'function')
                callback(cache.get('user'));
            return cache.get('user');
        } else {

            // Get data from network
            FB.api({
                    method: 'fql.query',
                    query: 'SELECT ' + settings.NETWORK.PROFILE_FIELDS + ' FROM user WHERE uid=me()'
                },

                function(response) {
                    var response = self.extractResponse(response);

                    userData.profile = response;
                    userData.ref = self._getUserRef();

                    userData.permissions = {}

                    FB.api('/me/permissions', function(permissions_response) {
                        if ('data' in permissions_response) {

                            for (var p = 0; p < permissions_response.data.length; p++) {
                                var permission = permissions_response.data[p];
                                userData.permissions[permission.permission] = permission.status === 'granted' ? 1 : 0;
                            }
                        }

                        // Set user data in cache
                        cache.set('user', userData);
                        if (typeof callback === 'function')
                            callback();
                        return userData;
                    });
                }
            )
        }
    },

    // Get user friends from cache or ask network for friends data...
    getFriends: function(callback) {
        var self = this,
            cache = this.getCacheStorage(),
            settings = this.wrapper.settings,
            friends = {
                invitable: [],
                in_app: []
            };

        if (cache.get('friends')) {
            if (typeof callback === 'function')
                callback(cache.get('friends'));
            return cache.get('friends');
        } else {
            // get friends from netwrork

            FB.api('/me/invitable_friends', function(response) {

                response = response.data;

                if (response instanceof Array) {
                    for (var f = 0; f < response.length; f++) {
                        var tf = {
                            name: response[f].name,
                            picture: response[f].picture.data.url
                        }

                        friends.invitable.push(tf);
                    }
                }

                FB.api('/me/friends', function(response) {

                    response = response.data;
                    friends.in_app = response; // TODO: filter friends data, sort this friends...

                    cache.set('friends', friends);
                    if (typeof callback === 'function')

                        callback();
                    return friends;
                });
            });
        }
    },

    getNetworkParams: function() {
        return this.networkParams.getHash();
    },

    _collectNetworkParams: function(object) {
        this.networkParams.set('access_token', object.authResponse.accessToken);
        this.networkParams.set('signed_request', object.authResponse.signedRequest);
    },

    // Check user permissions
    _checkPermissions: function(callback) {
        var params = {},
            toask = [],
            settings = this.wrapper.settings;
        self = this;

        params.method = 'fql.query';
        params.query = 'SELECT ' + settings.NETWORK.PERMISSIONS + ' FROM permissions WHERE uid = me()';

        FB.api(params, function(response) {

            var response = self.extractResponse(response);

            if (response !== null) {
                for (var key in response) {
                    if (response[key] != "1") {
                        toask.push(key);
                    }
                }

                if (toask.length > 0) {
                    self.authRedirect();
                } else {
                    callback();
                }
            }
        });
    },

    getAuthUrl: function() {
        var settings = this.wrapper.settings;
        return settings.NETWORK.AUTH_URL + '&redirect_uri=' + settings.APPLICATION.URL + '&scope=' + settings.NETWORK.PERMISSIONS;
    },

    // Redirect user to ask permissions
    authRedirect: function() {
        console.log('AURL: ', this.getAuthUrl());
        window.top.location.href = encodeURI(this.getAuthUrl());
    },

    // Get only  frineds uids from friends...
    _getFriendsUids: function(sorted) {
        var friends = sorted === 1 ? this.getFriendsSorted() : this.getFriends();

        var uids = [];

        if (friends.length > 0) {
            for (var f = 0; f < friends.length; f++) {
                uids.push(friends[f].uid);
            }
        }

        return uids;
    },

    // Call invite friends dialog
    inviteFriends: function(message, callback) {
        var params = {};

        params.method = 'apprequests';
        params.message = message;

        FB.ui(params, callback);
    },

    // Mass friends invite
    massInviteFriends: function(message, callback) {

        var settings = this.wrapper.settings;
        friends = this._getFriendsUids(),
        offset = this.getClassProperty('friendsOffset'),
        start = 0,
        finish = 0,
        count = settings.SMM.MASS_INVITE.OFFSET;

        if (offset !== 0) {
            start = offset * count;
            finish = start + count;
        } else {
            finish = count;
        }

        if (friends.length > 0) {
            var uids = friends.slice(start, finish);

            if (uids.length > 0) {

                var params = {};

                params.method = 'apprequests';
                params.message = message;
                params.to = $.implode(',', uids);

                FB.ui(params, callback);
            }
        }
    },

    // Check if user has a community/group/page like
    hasLike: function(uid, callback) {
        var cache = this.getCacheStorage(),
            settings = this.wrapper.settings,
            community = settings.SMM.COMMUNITY;


        if (cache.get('has_like')) {
            if (typeof callback === 'function')
                callback(cache.get('has_like'))
        } else {
            FB.api('/' + uid + '/likes', function(response) {

                var has_like = 0;
                if (response !== null && typeof response.data !== 'undefined' && (response.data instanceof Array) && response.data.length > 0) {

                    for (var c = 0; c < response.data.length; c++) {

                        var cur_c = response.data[c];

                        if (typeof cur_c === 'object' && typeof cur_c.category !== 'undefined') {
                            if (cur_c.category === community.CATEGORY && cur_c.id == community.ID) {
                                has_like = 1;
                                break;
                            }
                        }
                    }
                }
                cache.set('has_like', has_like);
                callback(has_like);
                //
            });
        }
    }

    // TODO: mount rest public API (ex. payments)
})