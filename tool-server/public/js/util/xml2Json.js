(function() {
    function getXmlNodeAttributes(node, json) {
        var attributes = node.attributes;
        if(!attributes || attributes.length === 0) {
            return json;
        }

        for(var i=0, len=attributes.length; i<len; i++) {
            var item = attributes.item(i);
            json[item.nodeName] = item.value;
        }

        return json;
    }

    function findPrevComment(siblings, index) {
        for(var i=index-1; i>-1; i--) {
            var node = siblings[i];
            if(node.nodeType == 1) {
                return;
            }
            if(node.nodeType == 8) {
                return node;
            }
        }
    }

    function makeXmlJson(node) {
        var json = {};
        var children = node.childNodes;
        var nodeName = node.nodeName;
        var attributes = {};
        var resultKey = {};
        getXmlNodeAttributes(node, attributes);
        json._ = attributes;
        for(var i=0, len=children.length; i<len; i++) {
            var cNode = children[i];
            switch(cNode.nodeType) {
                case 1:
                    var prevNode = findPrevComment(children, i);
                    nodeName = cNode.nodeName;
                    var xmlJson = makeXmlJson(cNode);
                    if(prevNode) {
                        xmlJson.__ = prevNode.nodeValue.trim();
                    }
                    if(resultKey[nodeName]) {
                        if(!$.isArray(json[nodeName])) {
                            json[nodeName] = [json[nodeName]];
                        }

                        json[nodeName].push(xmlJson);
                    } else {
                        json[nodeName] = xmlJson;
                        resultKey[nodeName] = 1;
                    }
                    break;
            }
        }

        return json;
    }

    function xml2json(xml) {
        var doc;
        try {
            doc = $.parseXML(xml);
        } catch(e) {
            alert(e.message);
        }

        return makeXmlJson(doc);
    }

    if (typeof jQuery !== 'undefined') {
        jQuery.extend({xml2json: xml2json});
    } else if (typeof module !== 'undefined') {
        module.exports = xml2json;
    } else if (typeof window !== 'undefined') {
        window.xml2json = xml2json;
    }
})();