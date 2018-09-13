 export const ServerUrl = "http://localhost:3000/";
 // export const ServerUrl = "http://172.16.2.118:3000/";
export const ExportStatus = {
    None: 0,
    Exporting: 1
};
export const DBOpeType = {
    List: "list",
    Create : "create",
    Remove: "remove",
    Update: "update",
    CheckVersion: "checkVersion",
    BackUp: "backup",
    AddVersion: "addVersion",
    VersionList: "versionList",
    GetCurrVersion: "getCurrVersion",
    UpdateCurrVersion: "updateCurrVersion"
};