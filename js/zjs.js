/*
 * zjs JavaScript Libray v1.0.0
 * Author zyy7259
 * Email zyy7259@gmail.com
 * Date 2014-09-01
 */

(function() {

    var zjs = {
        version: '1.0.0',
        constructor: zjs,
        selector: '',
    },
    _f = function(){return !1;};

    zjs.get = function(id) {
        var elem;

        if (!id) {
            return this;
        }

        if (typeof id === 'string') {
            elem = document.getElementById(id);
        }
        return elem;
    };

    zjs.addEvent = function(elem, type, handler) {
        if (elem.addEventListener) {
            elem.addEventListener(type, handler);
        } else if (elem.attachEvent) {
            elem.attachEvent('on' + type, handler);
        }
    };
    zjs.on = zjs.addEvent;

    zjs.stop = function(event) {
        this.stopBubble(event);
        this.stopDefault(event);
    };

    zjs.stopBubble = function(event) {
        if (!!event) {
            !!event.stopPropagation ? event.stopPropagation() : event.cancelBubble = !0;
        }
    };

    zjs.stopDefault = function(event) {
        if (!!event) {
            !!event.preventDefault ? event.preventDefault() : event.returnValue = !1;
        }
    };

    zjs.ajax = function(options) {
        var xhr,
            url = options.url || '',
            method = options.method.toUpperCase(),
            async = options.async || true,
            data = options.data,
            callback = options.callback || _f;

        if (method !== 'GET' && method !== 'POST') {
            method = 'GET';
        }

        if (window.XMLHttpRequest) {
            // code for IE7+, Firefox, Chrome, Opera, Safari
            xhr = new XMLHttpRequest();
        } else {
            // code for IE6
            xhr = new ActiveXObject("Microsoft.XMLHTTP");
        }
        xhr.onreadystatechange = function() {
            if (xhr.readyState === 4 && xhr.status === 200) {
                callback(xhr);
            }
        };
        xhr.open(method, url, async);
        if (method === 'GET') {
            xhr.send();
        } else {
            xhr.send(JSON.stringify(data));
        }
    };

    zjs.rest = function(options) {
        var callback = options.callback || _f;
        options.callback = function(xhr) {
            var r = xhr.responseText
            callback(JSON.parse(r));
        };
        this.ajax(options);
    };

    window.zjs = window.$ = zjs;
})();

(function() {
    var _o = {},
        _r = [],
        funcpro = Function.prototype;
    if (!funcpro.bind) {
        funcpro.bind = function() {
            var func = this,
                obj = arguments[0],
                args = _r.slice.call(arguments, 1);
            return function() {
                _r.push.apply(args, arguments);
                return func.apply(obj, args);
            };
        };
    }
})();

// Create a JSON object only if one does not already exist. We create the
// methods in a closure to avoid creating global variables.
if (typeof JSON !== 'object') {
    JSON = {};
}
(function() {
    if (typeof JSON.stringify !== 'function') {
        JSON.stringify = function() {};
    }
})();