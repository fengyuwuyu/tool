import { Injectable } from '@angular/core';
import {DBOpeType, ServerUrl} from "../../../../config/Common";
@Injectable()
export class ModuleWinService {
    private _list: any[];

    list(e: any) {
        if (this._list) {
            e.successCallback(this._list);
        }
        $.ajax({
            url: ServerUrl + e.url + "/" + DBOpeType.List,
            type: "post",
            data: JSON.stringify({}),
            contentType: "application/json",
            xhrFields: {
                withCredentials: true
            },
            success: (resJson) => {
                if (resJson.result) {
                    this._list = resJson.list;
                    this._list.forEach((obj) => {
                        obj.json = JSON.parse(obj.jsonStr);
                        // obj.downloadUrl = ServerUrl + "xmlForFu/" + (obj.json.root.module._.service || obj.json.root.module._.name) + ".xml";
                    })
                    e.successCallback(this._list);
                }
            }
        });
    }
}