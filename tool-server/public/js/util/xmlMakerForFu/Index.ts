export const space: string = "    ";
export const littleSpace: string = "  ";
export const littlerSpace: string = " ";
export const newLine: string = "<br/>";
export const calcStructArray2CodeStruct = function(struts: any[]) {
    var html = ``;
    struts.forEach((obj)=> {
        let items: any[] = this.fix2Array(obj.item);
        html += `${space}<span class="struct">struct</span>${this.littleSpace}<span class="structName">${obj._.name}</span>${this.littlerSpace}{${this.newLine}`;
        items.forEach((iObj)=> {
            html += `${space}${this.space}<span class="enumType">${iObj._.type}</span>${iObj._.repeated?"[]":""}${this.littleSpace}${iObj._.name};${this.newLine}`
        });
        html += `${space}}${this.newLine}${this.newLine}`;
    });

    return html;
}
  
export const calcEnumArray2CodeEnum = function(enums: any[]) {
    let html = ``;
    enums.forEach((obj)=> {
        let items: any[] = this.fix2Array(obj.item);
        html += `${space}<span class="enum">enum</span>${this.littleSpace}<span class="enumName">${obj._.name}</span>${this.littlerSpace}{${this.newLine}`;
        items.forEach((iObj)=> {
            html += `${space}${this.space}<span class="enumType">${iObj._.name}</span>${littlerSpace}=${littlerSpace}${iObj._.value};${this.newLine}`
        });
        html += `${space}}${this.newLine}${this.newLine}`;
    });

    return html;
}

export const fix2Array = function(obj: any) {
    return $.isArray(obj) ? obj : (obj ? [obj] : []);
}