(function() {
    const space = "    ";
    const littleSpace = " ";
    const newLine = "\n";
    const xmlHeader = `<?xml${littleSpace}version="1.0"${littleSpace}encoding="utf-8"?>${newLine}`;
    function objHasChildren(obj) {
        var result = false;
        for(var key in obj) {
            if(key == "_" || key == "__") {
                continue;
            }

            result = true;
            break;
        }

        return result;
    }
    function makeObjXml(json, deep, jsonKey) {
        var curSpace = "";
        var tmpDeep = deep;
        while(tmpDeep--) {
            curSpace += space;
        }
        var xml = ``;
        for(var key in json) {
            if(key == "_" || key == "__")
                continue;

            var obj = json[key];
            var info = obj._ || {};
            var comment = obj.__;
            var isArray = $.isArray(obj);
            if(!isArray) {
                if(comment) {
                    xml += `${curSpace}<!--${newLine}`;
                    xml += `${curSpace}${comment}${newLine}`;
                    xml += `${curSpace}-->${newLine}`;
                }
                (xml += `${curSpace}<${jsonKey || key}`);
                for(var iKey in info) {
                    var iObj = info[iKey];
                    xml += `${littleSpace}${iKey}="${iObj}"`;
                }
                if(objHasChildren(obj)) {
                    xml += `>${newLine}`;
                    xml += makeObjXml(obj, deep + 1);
                    xml += `${curSpace}</${jsonKey || key}>${newLine}`;
                } else {
                    xml += `${littleSpace}/>${newLine}`;
                }
            } else {
                xml += makeObjXml(obj, deep, key);
            }
        }

        return xml;
    }
    function json2Xml(json) {
        return xmlHeader + makeObjXml(json, 0);
    }

    if (typeof jQuery !== 'undefined') {
        jQuery.extend({json2Xml: json2Xml});
    } else if (typeof module !== 'undefined') {
        module.exports = json2Xml;
    } else if (typeof window !== 'undefined') {
        window.json2Xml = json2Xml;
    }
})();
