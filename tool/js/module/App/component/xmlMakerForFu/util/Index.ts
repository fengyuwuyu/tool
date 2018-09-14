export const space: string = "    ";
export const littleSpace: string = "  ";
export const littlerSpace: string = " ";
export const newLine: string = "<br/>";
export const dataType: string[] = ["byte", "short", "int", "long", "float", "double", "char", "bool", "string", "bytes"];
export const scriptCode: string = `<script>
       function toShowModel(modelType, modelName, modelId){
       var isHave = false;
       var searchClass = document.getElementsByName("modelName");
       console.log(searchClass)
       for (var i = 0; i < searchClass.length; i++) {
           if(searchClass[i].id == modelName){
               isHave = true;
           }
       }
       var toolUrl = "http://localhost:8088/modelWin/";
       // var toolUrl = "http://172.16.2.118:8988/modelWin/";
       // isHave = false;
       if(isHave){
           window.open(toolUrl + modelType +"/" + modelName +"/" + modelId, "showModelWin");
       }else{
           window.open(toolUrl + "metaDataXml" + "/" +modelName + "/" + modelId, "showModelWin");
       }
       return false;
    }
    </script>`;
export const calcStructArray2CodeStruct = function(struts: any[], type?: string, setId?: boolean, xmlCatagory?: string, currentXmlId?: string) {
    var html = ``;
    struts.forEach((obj)=> {
        let items: any[] = fix2Array(obj.item);
        if(obj.__) {
            html += `<span class="comment" >${space}/*${littlerSpace}`;
            html += `${obj.__}`;
            html += `${littlerSpace}*/</span>${newLine}`;
        }
        html += `${space}<span class="struct">struct</span>${littleSpace}<span class="structName" id="${obj._.name}" name="modelName">${obj._.name}</span>`;
        if(setId){
            html += `<span class="${obj._.name}" ></span>`;
        }
        html += `${littlerSpace}{${this.newLine}`;
        items.forEach((iObj)=> {
            if(iObj.__) {
                html += `${space}<span class="comment" >${space}/*${littlerSpace}`;
                html += `${iObj.__}`;
                html += `${littlerSpace}*/</span>${newLine}`;
            }
            switch (type) {
                case "command":
                    if((iObj._.required &&iObj._.required == '0') || (iObj._.attribute && iObj._.attribute === 'optional')){
                        html += `${space}${space}<span class='type'>optional</span>`+littleSpace;
                    }else{
                        html += `${space}${space}<span class='type'>required</span>`+littleSpace;
                    }
                    break;
                case "rpc":
                    if((iObj._.required &&iObj._.required == '0') || (iObj._.attribute && iObj._.attribute === 'optional')){
                        html += `${space}${space}<span class='type'>optional</span>`+littleSpace;
                    }else{
                        html += `${space}${space}<span class='type'>required</span>`+littleSpace;
                    }
                    break;
                default:
                    html += `${space}${space}`;
                    break;
            }
            if(dataType.indexOf(iObj._.type) == -1){
                html += `<a class="structType" target="showModeWin" href="javascript: toShowModel(\'${xmlCatagory}\', \'${iObj._.type}\', \'${currentXmlId}\')">${iObj._.type}</a>${iObj._.attribute == "repeated"?"[]":""}${littleSpace}${iObj._.name};${newLine}`;
            }else{
                html += `<span class="structType">${iObj._.type}</span>${iObj._.attribute == "repeated"?"[]":""}${littleSpace}${iObj._.name};${newLine}`;
            }
        });
        html += `${space}}${this.newLine}${this.newLine}`;
    });

    return html;
}

export const calcEnumArray2CodeEnum = function(enums: any[], type?: string, setId?: boolean) {
    let html = ``;
    enums.forEach((obj)=> {
        let items: any[] = fix2Array(obj.eitem);
        if(obj.__) {
            html += `<span class="comment" >${space}/*${space}`;
            html += `${obj.__}`;
            html += `${space}*/</span>${newLine}`;
        }
        html += `${space}<span class="enum">enum</span>${littleSpace}<span class="enumName" id="${obj._.name}" name="modelName">${obj._.name}</span>`;
        if(setId){
            html += `<span class="${obj._.name}" ></span>`;
        }
        html += `${littlerSpace}{${this.newLine}`;
        items.forEach((iObj)=> {
            if(iObj.__) {
                html += `${space}<span class="comment" >${space}/*${space}`;
                html += `${iObj.__}`;
                html += `${space}*/</span>${newLine}`;
            }
            html += `${space}${space}<span class="enumType">${iObj._.name}</span>${littlerSpace}=${littlerSpace}${iObj._.value};`
            if(iObj._.desc){
                html += `${littlerSpace}${littlerSpace}<span class="comment" >//${iObj._.desc}</span>`;
            }
            html += `${newLine}`;
        });
        html += `${space}}${newLine}${this.newLine}`;
    });

    return html;
}

export const fix2Array = function(obj: any) {
    return $.isArray(obj) ? obj : (obj ? [obj] : []);
}