function GetUrlPath() {
    let e = document.location.toString();
    return -1 != (e = decodeURI(e)).indexOf("/") && (e = e.substring(0, e.lastIndexOf("/"))), e
}

function shellExecuteByOAAssist(param) {
    if (wps != null) {
        wps.OAAssist.ShellExecute(param)
    }
}

function OpenTaskPane(identifier) {
    let tsd = wps.PluginStorage.getItem(identifier);
    if (!tsd) {
        let taskpane = wps.CreateTaskPane(GetUrlPath() + `/ui/${identifier}/index.html`);
        wps.PluginStorage.setItem(identifier, taskpane.ID);
        taskpane.Visible = true;
    }
    else {
        let taskpane = wps.GetTaskPane(tsd);
        taskpane.Visible = !taskpane.Visible;
    }
}

function OpenDialogWindow(identifier, title = 'Platypus', width = 400, height = 600) {
    wps.ShowDialog(GetUrlPath() + `/ui/${identifier}/index.html`, title,
        width * window.devicePixelRatio, height * window.devicePixelRatio, true);
}

function getWorkSheet(sheetName) {
    let aSheet = wps.EtApplication().ActiveSheet;
    let sheets = wps.EtApplication().ActiveWorkbook.Worksheets;
    let sheet = sheets.Item(sheetName);

    if (!sheet) {
        // 名字为 sheetName 的工作表不存在
        // 添加到末尾
        sheets.Add(undefined, sheets.Item(sheets.Count), 1, WPS_Enum.xlWorksheet);
        wps.EtApplication().ActiveSheet.Name = sheetName;
        aSheet.Activate();
        sheet = sheets.Item(sheetName);
    }
    return sheet;
}

function getWorkSheetExt(sheetName) {
    let aSheet = wps.EtApplication().ActiveSheet;
    let sheets = wps.EtApplication().ActiveWorkbook.Worksheets;
    for (let i = 1; i <= sheets.Count; i++) {
        let sheet = sheets.Item(i);
        if (sheet.Name.includes(sheetName)) return sheet;
    }
    sheets.Add(undefined, sheets.Item(sheets.Count), 1, WPS_Enum.xlWorksheet);
    wps.EtApplication().ActiveSheet.Name = sheetName;
    aSheet.Activate();
    return sheets.Item(sheetName);
}

/**
 * 返回一个以bookName命名的工作表
 * @param {string} bookName
 * @returns {object} workbook
 */
function getWorkBook(bookName) {
    for (let i = 1; i <= wps.EtApplication().Workbooks.Count; i++) {
        let x = wps.EtApplication().Workbooks.Item(i);
        if (x.Name == bookName) return x;
    }
    return null;
}

// include the bookName
function getWorkBookExt(bookName) {
    for (let i = 1; i <= wps.EtApplication().Workbooks.Count; i++) {
        let x = wps.EtApplication().Workbooks.Item(i);
        if (x.Name.indexOf(bookName) >= 0) return x;
    }
    return null;
}

function navToLTCellInLUA(cell) {
    do {
        if (cell.MergeCells ||
            cell.Value2 || (cell.Borders.Item(WPS_Enum.xlEdgeTop).LineStyle > 0 && cell.Borders.Item(WPS_Enum.xlEdgeRight).LineStyle > 0)) {
            var rowCell = cell;
            cell = cell.Offset(-1, 0);
        }
        else {
            break;
        }
    } while (cell != null);

    if (rowCell == null) return null;

    do {
        if (rowCell.MergeCells || rowCell.Value2 || (rowCell.Borders.Item(WPS_Enum.xlEdgeLeft).LineStyle > 0 && cell.Borders.Item(WPS_Enum.xlEdgeBottom).LineStyle > 0)) {
            var colCell = rowCell;
            rowCell = rowCell.Offset(0, -1);
        }
        else {
            break;
        }
    } while (rowCell != null);
    return colCell;
}

function ReduceRef(excel_formula, border, params){
    for (let j=0;j< 2; j++){
        // A12, BC3
        excel_formula.replaceAll(/[A-Z]{0,2}\d+/g, (x)=>{
            if (wps.Range(x).Column <= border) {
                return `(${wps.Range(x).Formula.slice(1,)})`
            }
            else {
                // variable
                // 300
                let name = wps.Range(x).Offset(-1, 0).Text.trim();
                if ( !params.hasOwnProperty(name) ) params[name]=wps.Range(x).Value2;
                return `(${name})`;
            }
        })
    }
    return excel_formula;
}

function TemplateToDocuments(){
    let StartCell = navToLTCellInLUA(wps.ActiveCell);
    let Cell = StartCell.Offset(1, 1);
    let border = StartCell.Column + 5;
    StartCell = StartCell.Offset(0, 6).Offset(0, 1);
    let retn = {};
    retn["params"] = {};
    retn["data"] = [];
    retn["GraphRef"]=StartCell.MergeCells?StartCell.Offset(0, 1).Offset(1, 0).Text:StartCell.Offset(1, 0).Text;
    do {
        let doc = {};
        doc['index'] = Cell.Text.trim();
        doc['material'] = Cell.Offset(0 , 1).Text.trim();
        doc['density'] = Number(Cell.Offset(0, 2).Value2);
        let xcell = Cell.Offset(0, 3);
        if (xcell.HasFormula){
            doc['length'] = ReduceRef(xcell.Formula.slice(1,), border, retn["params"]);
        }
        else {
            doc['length'] = Number(xcell.Value2);
        }
        xcell = xcell.Offset(0, 1);
        if (xcell.HasFormula){
            doc['number'] = ReduceRef(xcell.Formula.slice(1,), border, retn["params"]);
        }
        else {
            doc['number'] = Number(xcell.Value2);
        }
        retn["data"].push(doc);
        Cell = Cell.Offset(1, 0)
    } while(Cell.Value2);
    return retn;
}