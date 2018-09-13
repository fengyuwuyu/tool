import { Injectable } from '@angular/core';
import { ServerUrl, DBOpeType } from '../../../../../config/Common';
@Injectable()
export class RecordXmlService {
    private _list: any[];
    list(e: any) {
        if(this._list) {
            e.successCallback(this._list);
        }

        $.ajax({  
            url: ServerUrl + "recordXml/"+DBOpeType.List,
            type: "post",
            data: JSON.stringify({}),
            contentType: "application/json",
            xhrFields: {
                withCredentials: true
            },
            success: (resJson)=> {
                if(resJson.result) {
                    this._list = resJson.list;
                    this._list.forEach((obj)=> {
                        obj.json = JSON.parse(obj.jsonStr);
                        obj.downloadUrl = ServerUrl+"xmlForFu/recordXml/"+(obj.json.root.module._.name) + ".xml";
                    })
                    e.successCallback(this._list);
                }
            }
        });
    }

    create(e: any) {
        console.log(JSON.stringify(e.data));
        $.ajax({
            url: ServerUrl+"recordXml/"+DBOpeType.Create,
            type: "post",
            data: JSON.stringify(e.data),
            contentType: "application/json",
            xhrFields: {
                withCredentials: true
            },
            success: (resJson)=> {
                if(resJson.result) {
                    e.successCallback && e.successCallback(resJson);
                } else {
                    e.failCallback && e.failCallback(resJson);
                }
            },
            error: (e2)=> {
            }
        });
    }

    update(e: any) {
        $.ajax({
            url: ServerUrl+"recordXml/"+DBOpeType.Update,
            type: "post",
            data: JSON.stringify(e.data),
            contentType: "application/json",
            xhrFields: {
                withCredentials: true
            },
            success: (resJson)=> {
                if(resJson.result) {
                    e.successCallback && e.successCallback(resJson);
                } else {
                    e.failCallback && e.failCallback(resJson);
                }
            },
            error: (e2)=> {
            }
        });
    }

    remove(e: any) {
        $.ajax({
            url: ServerUrl+"recordXml/"+DBOpeType.Remove,
            type: "post",
            data: JSON.stringify(e.data),
            contentType: "application/json",
            xhrFields: {
                withCredentials: true
            },
            success: (resJson)=> {
                if(resJson.result) {
                    e.successCallback && e.successCallback(resJson);
                } else {
                    e.failCallback && e.failCallback(resJson);
                }
            },
            error: (e2)=> {
            }
        });
    }

    checkVersion(e: any) {
        $.ajax({
            url: ServerUrl+"recordXml/"+DBOpeType.CheckVersion,
            type: "post",
            data: JSON.stringify(e.data),
            contentType: "application/json",
            xhrFields: {
                withCredentials: true
            },
            success: (resJson)=> {
                if(resJson.result) {
                    e.successCallback && e.successCallback(resJson);
                } else {
                    e.failCallback && e.failCallback(resJson);
                }
            },
            error: (e2)=> {
            }
        });
    }
}