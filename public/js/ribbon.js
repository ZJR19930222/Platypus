function OnAddinLoad(ribbonUI) {
    // dont modify the official code
    if (typeof (wps.ribbonUI) != "object") {
        wps.ribbonUI = ribbonUI
    }
    // test connection
    wps.PluginStorage.setItem("isConnect", false);
    return true;
}


function ClickBtn(control) {
    var elemId = control.Id;
    switch (elemId) {
        case "config":
            {
                // connect to db
                OpenDialogWindow('database', "用户登录");
                break;
            }
        case "upload":
            {
                OpenDialogWindow('data-upload', "配置数据集");
                break;
            }
        case "download":
            {
                // OpenTaskPane('pushBeamData', "上传数据");
                // gatherthisBridge();
                // dataUpLoad();
                // OpenDialogWindow('showPicture', "数据组分", 900, 700);
                // dogather();
                // toDataBase();
                // dopush();
                // toxianjiao();
                // DataGo();
                // toDataSF();
                // toDataOfGuardrail();
                // toDataZZ();
                // toDataFS();
                setCellCharFontAll();
                break;
            }
        case "convert":
            {
                OpenDialogWindow('showPicture', "数据组分", 900, 700);
                // ConvetToRebarSymbol();
                break;
            }
        case "calcTable":
            {
                InsertTable();
                break;
            }
        case "calcTableEx":
            {
                InsertTableEx();
                break;
            }
        case "gather":
            {
                GatherTable();
                break;
            }
        default:
            break;
    }
    return true;
}