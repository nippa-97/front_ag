import React from 'react';
import { Button } from 'react-bootstrap';
import * as FileSaver from 'file-saver';
import * as XLSX from 'xlsx';

/**
 * using to export current added product list to excel file
 *
 * @param {*} {exportData - exporing data, fileName - file name}
 * @return {*} 
 */
 export default function ExportCSV ({exportData, fileName, t}) {
    const fileType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
    const fileExtension = '.xlsx';

    const exportToCSV = () => {
        const cdate = new Date();
        //export data
        var csvData = [];
        csvData.push(["Barcode","Product Name"]);
        if(exportData && exportData.length > 0){
            exportData.forEach( exproditem => {
                csvData.push([exproditem.productInfo.barcode,((exproditem.productInfo.brandName&&exproditem.productInfo.brandName!==""&&exproditem.productInfo.brandName!=="-"?(exproditem.productInfo.brandName+" "):(t("notavailable")+" "))+exproditem.productInfo.productName)]);
            });
        }
        
        const ws = XLSX.utils.json_to_sheet(csvData);
        const wb = { Sheets: { 'data': ws }, SheetNames: ['data'] };
        const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
        const data = new Blob([excelBuffer], {type: fileType});
        FileSaver.saveAs(data, fileName+"_"+(cdate.getTime()) + fileExtension);
    }

    return (
        <Button variant="outline-success" type="button" onClick={(e) => exportToCSV()} style={{width:"100%",borderRadius:"15px",fontSize:"12px"}}>{t("btnnames.excelexport")}</Button>
    )
}