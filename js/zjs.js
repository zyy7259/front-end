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
    //支持 #id|.classname|tagname|tagname.classname|tagname#id四种，如果要多层筛选，请重复调用
    zjs.querySelectorAll = function(node,selector){
        if(typeof(document.querySelectorAll)!='undefined'){
            return node.querySelectorAll(selector);
        }
        var tname;
        var citems;
        function findElementsByClassNameInner(n,className){
            var items= n.children;
            for(var i=0;i<items.length;i++){
                if(items[i].className==className){
                    citems.push(items[i]);
                }
                findElementsByClassNameInner(items[i],className);
            }
            return citems;
        }
        function findElementsByIDInner(n,id){
            var items= n.children;
            for(var i=0;i<items.length;i++){
                if(items[i].id==id){
                    citems.push(items[i]);
                }
                findElementsByIDInner(items[i],id);
            }
            return citems;
        }
        if(selector.charAt(0)=='.'){
            tname=selector.substring(1);
            citems=new Array();
            var items=findElementsByClassNameInner(node,tname);
            return items;
        }
        else if(selector.charAt(0)=='#'){
            var id=selector.substring(1);
            citems=new Array();
            var items=findElementsByIDInner(node,id);
            return items;
        }
        else if((r=selector.match(/(\w+)\.(\w+)/))!=null){
            tagName=r[1].toLowerCase();
            className=r[2];
            citems=new Array();
            var titems=findElementsByClassNameInner(node,className);
            var items=new Array();
            for(i=0;i<titems.length;i++){
                if(titems[i].tagName && titems[i].tagName.toLowerCase()==tagName){
                    items.push(titems[i]);
                }
            }
            return items;
        }
        else if((r=selector.match(/(\w+)#(\w+)/))!=null){
            tagName=r[1].toLowerCase();
            id=r[2];
            citems=new Array();
            var titems=findElementsByIDInner(node,id);
            var items=new Array();
            for(i=0;i<titems.length;i++){
                if(titems[i].tagName && titems[i].tagName.toLowerCase()==tagName){
                    items.push(titems[i]);
                }
            }
            return items;
        }
        else{
            var items= node.getElementsByTagName(selector);
            return items;
        }
    };
    //支持 #id|.classname|tagname|tagname.classname|tagname#id四种，如果要多层筛选，请重复调用
    zjs.querySelector = function(node,selector){
        if(node==null) return null;
        if(typeof(document.querySelector)!='undefined'){
            return node.querySelector(selector);
        }
        var items = this.querySelectorAll(node,selector);
        return items.length==0 ? null:items[0]
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
            onload = options.onload || _f;

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
                onload(xhr);
            }
        };
        xhr.open(method, url, async);
        if (method === 'GET') {
            xhr.send();
        } else {
            xhr.send(data);
        }
    };

    zjs.rest = function(options) {
        var onload = options.onload || _f;
        options.onload = function(xhr) {
            var r = xhr.responseText
            onload(!!JSON ? JSON.parse(r) : eval(r));
        };
        this.ajax(options);
    };

    zjs.datestr = function(date) {
        date = new Date(+date);
        var year = date.getFullYear(),
            month = date.getMonth() + 1,
            day = date.getDate(),
            hour = date.getHours(),
            minute = date.getMinutes();
        if (month < 10) {
            month = '0' + month;
        }
        if (day < 10) {
            day = '0' + day;
        }
        if (hour < 10) {
            hour = '0' + hour;
        }
        if (minute < 10) {
            minute = '0' + minute;
        }
        return year + '-' + month + '-' + day + ' ' + hour + ':' + minute;
    };

    window.zjs = window.$ = zjs;
})();

// Function.prototype extension
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
