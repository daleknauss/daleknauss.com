By = { // fast selectors originally on (git://gist.github.com/1455456.git)
    id: function (id) {
        return document.getElementById(id);
    },
    tag: function (tag, context) {
        return (context || document).getElementsByTagName(tag)
    },
    css: function (klass, context) {
        return (context || document).getElementsByClassName(klass);
    },
    name: function (name) {
        return document.getElementsByName(name);
    },
    qsa: function (query, context) {
        return (context || document).querySelectorAll(query);
    },
    qs: function (query, context) {        
        return (context || document).querySelector(query);
    }
}
