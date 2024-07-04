import * as FileSaver from 'file-saver';
import { Badge, Button, Col, Form, Modal, Table } from 'react-bootstrap';
import * as XLSX from 'xlsx';
import FeatherIcon from 'feather-icons-react';
import { useState } from 'react';
import { FileIcon, XIcon } from '@primer/octicons-react';
import { confirmAlert } from 'react-confirm-alert';
import { v4 as uuidv4 } from 'uuid'; //unique 

import { alertService } from '../../../../_services/alert.service';
import { submitSets } from '../../../UiComponents/SubmitSets';
import { submitCollection } from '../../../../_services/submit.service';
import { PopoverWrapper, TooltipWrapper } from '../../../newMasterPlanogram/AddMethods';

import { excelUploadAvailablity } from '../../../../enums/planogramTypes';

import imagePlaceholder from '../../../../assets/img/icons/default_W100_100.jpg';
import loadinggif from '../../../../assets/img/loading-sm.gif';

// import { sampleExcelUploadData } from '../sampledata';


/**
 * using to export current added product list to excel file
 * also for import products in pg/sim
 *
 * @param {*} {exportData - exporing data, fileName - file name}
 * @return {*} 
 */
export default function ExportCSV (
    {exportData, fileName, t, isRTL, fieldDeptList, saveObj, bkpSaveObj, activeViewObj, 
    toggleLoadingModal, sendExcelData, excelStartIndex, paginationMaxCount,
    excelUploadPagination, setExcelUploadPagination, compareFieldsListForAisleMerge,

    isSimView, handleAddProduct, originatedMpId, isShowFromPreview, selectedSimPreviewObj, additionalIDs,
}
) {
    let [showDeptModal, togglePrintDeptModal] = useState(false);
    let [selectedDept, setSelectedDept] = useState(0);
    const [uploadedBarcodes, setUploadedBarcodes] = useState([]);
    let [isShowAvailableModal, toggleAvailableBarcodeModal] = useState(false);
    // let [printProdList, setPrintProdList] = useState([]);
    let uploadLimit = 10000;

    let [isUploadPaginating, setUploadPaginating] = useState(false);

    const fileType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
    const fileExtension = '.xlsx';

    //excel export - create excel file
    const exportToCSV = (loadedPrintProdList) => {
        let layoutversion = (saveObj.fieldsList && saveObj.fieldsList[0]?saveObj.fieldsList[0].floorLayoutVersion.toLowerCase().replace(/ /g, '_'):"");
        let curSelectedDept = fieldDeptList[selectedDept];
        let fileName= (layoutversion+(curSelectedDept && curSelectedDept.name?(curSelectedDept.name.toLowerCase().replace(/ /g, '_')):"display_Unit")+"_export_products_list");

        const cdate = new Date();

        //create export data
        var csvData = [["Barcode","Product Name"]];
        if(loadedPrintProdList && loadedPrintProdList.length > 0){
            for (let i = 0; i < loadedPrintProdList.length; i++) {
                const exproditem = loadedPrintProdList[i];
                csvData.push([exproditem.productInfo.barcode,((exproditem.productInfo.brandName&&exproditem.productInfo.brandName!==""&&exproditem.productInfo.brandName!=="-"?(exproditem.productInfo.brandName+" "):(t("notavailable")+" "))+exproditem.productInfo.productName)]);
            }
        }
        //if export prods available continue excel print
        if(csvData.length > 1){
            const ws = XLSX.utils.json_to_sheet(csvData);
            const wb = { Sheets: { 'data': ws }, SheetNames: ['data'] };
            const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
            const data = new Blob([excelBuffer], {type: fileType});
            FileSaver.saveAs(data, fileName+"_"+(cdate.getTime()) + fileExtension);
    
            togglePrintDeptModal(!showDeptModal);
        } else{
            alertService.error(t("NO_PRODUCTS_AVAILABLE"));
        }
    }
    //planogram - get all fields of selected department
    const loadDepartmentProdList = () => {
        let saveobj = structuredClone(bkpSaveObj);
        let activeobj = activeViewObj;
        let curSelectedDept = fieldDeptList[selectedDept];

        let sameIdDeptFields = saveobj.fieldsList.filter(x => x.department.departmentId === curSelectedDept.departmentId);

        let sendobj = {
            floorlayoutId: saveobj.floorLayoutId,
            departmentId: curSelectedDept.departmentId,
            isFromActiveLayout: false,
            activeFloorLayoutId: (activeobj?activeobj.floorLayoutId:0),
            floorLayoutHasFieldIds: sameIdDeptFields.map(z => { return z.id })
        };

        toggleLoadingModal(true, () => {
            submitSets(submitCollection.loadDepartmentBulkField, sendobj, true).then(res => {
                // console.log(res);
                if(res && res.status){
                    let resObj = res.extra;
                    findExistingNewProductsCount(resObj, sameIdDeptFields, (existingProdsList) => {
                        // setPrintProdList(existingProdsList);
                        exportToCSV(existingProdsList);
                    });
                }

                toggleLoadingModal(false);
            });
        });
    }
    //planogram - find product existing in new product 
    const findExistingNewProductsCount = (mainobj, existingFields, _callback) => {
        let existprodlist =  []; //existing and newly added products list

        let cshelfs = [];
        if(mainobj && Object.keys(mainobj).length > 0){
            let mergeFields = mainobj.fieldsList.concat(existingFields);
            // console.log(mergeFields);

            mergeFields = compareFieldsListForAisleMerge(mergeFields);

            if(mergeFields && mergeFields.length > 0){
                for (let k = 0; k < mergeFields.length; k++) {
                    const csobj  = mergeFields[k];

                    if (csobj.planogramShelfDto) {
                        cshelfs = (csobj.planogramShelfDto?csobj.planogramShelfDto:[]);
                        
                        for (let i = 0; i < cshelfs.length; i++) {
                            const shelf = cshelfs[i];
                            
                            for (var j = 0; j < shelf.planogramProduct.length; j++) {
                                const prodobj = shelf.planogramProduct[j];
                                
                                if(!prodobj.isDelete){
                                    let pushProdObj = structuredClone(prodobj);
                                    //add to existing prodlist
                                    let checkalrdyadded = existprodlist.findIndex(z => z.productInfo.id === pushProdObj.productInfo.id);
                                        
                                    if(checkalrdyadded === -1){
                                        existprodlist.push(pushProdObj); 
                                    }  
                                }
                            }
                        }
                    }        
                }
            }
        }
        // console.log(existprodlist);

        _callback(existprodlist);
    }
    //sample excel sheet download
    function createAndDownloadXLSX() {
        // create workbook and worksheet
        const wb = XLSX.utils.book_new();
        let ws = XLSX.utils.json_to_sheet([
            { Barcode: '001021518522'},
            { Barcode: '001021518523'}
        ]);
     
        // add worksheet to workbook
        XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
      
        // create XLSX file and download it
        XLSX.writeFile(wb, 'planogram_excel_upload_format_example.xlsx');
    }
    //on select new excel file
    function excelFileChange(event){
        let file = (event.target.files && event.target.files.length > 0?event.target.files[0]:null);

        if(file){
            toggleLoadingModal(true, () => {
                const reader = new FileReader();
                reader.onload = (evt) => { // evt = on_file_select event
                    // Parse data
                    const bstr = evt.target.result;
                    const wb = XLSX.read(bstr, {type:'binary'});
                    // Get first worksheet
                    const wsname = wb.SheetNames[0];
                    const ws = wb.Sheets[wsname];
                    // Convert array of arrays
                    const data = XLSX.utils.sheet_to_json(ws);
                    // Update state
                    const columnCount = XLSX.utils.decode_range(ws['!ref']).e.c + 1 //colums count
                    
                    // let date1 = new Date();
                    if(columnCount >= 1 && data.length > 0){
                        
                        let barcodedata = [];
                        // let duplicatebarcodes = [];
                        for (let i = 0; i < data.length; i++) {
                            const dataobj = data[i];
                            
                            let [firstKey, firstValue] = Object.entries(dataobj)[0];
                            if(firstKey && firstValue !== ""){
                                let barcodetxt = firstValue.toString().trim();
                                //check barcode is already added
                                // let checkIsAdded = barcodedata.find(x => x === barcodetxt);
    
                                /* let checkIsAdded = -1;
                                for(let i = 0; i < barcodedata.length; i++) {
                                    if(barcodedata[i] === barcodetxt) {
                                        checkIsAdded = i;
                                        break;
                                    }
                                }
    
                                if(checkIsAdded === -1){
                                    barcodedata.push(barcodetxt);
                                } else{
                                    // duplicatebarcodes.push(barcodetxt);
                                } */
    
                                barcodedata.push(barcodetxt);
                            }
                        }
                        // console.log(duplicatebarcodes);
    
                        // let date2 = new Date();
                        // let difference = (date2 - date1) / 1000;
                        // console.log(difference + " seconds");
    
                        if(barcodedata.length > 0){
                            if(barcodedata.length <= uploadLimit){
                                if(barcodedata.length > 5000){
                                    toggleLoadingModal(false);
                                    confirmAlert({
                                        title: t('EXCEL_UPLOAD_MAXIMUM'),
                                        message: t('EXCEL_UPLOAD_MAXIMUM_CONFIRM'),
                                        overlayClassName: (isRTL==="rtl"?"alertrtl-content":""),
                                        buttons: [{
                                            label: t('btnnames.yes'),
                                            onClick: () => {
                                                resetPaginationDetails(() => {
                                                    toggleLoadingModal(true, () => {
                                                        loadExcelProdData(barcodedata);
                                                    });
                                                });
                                            }
                                        }, {
                                            label: t('btnnames.no')
                                        }]
                                    });
                                } else{
                                    resetPaginationDetails(() => {
                                        loadExcelProdData(barcodedata);
                                    });
                                }
                            } else{
                                alertService.error(t("EXCELDATA_UPLOADLIMIT_WARN"));
                                toggleLoadingModal(false);
                            }
                        } else{
                            alertService.error(t("NO_EXCELDATA_AVAILABLE"));
                            toggleLoadingModal(false);
                        }
                    } else{
                        alertService.error(t("NO_EXCELDATA_AVAILABLE"));
                        toggleLoadingModal(false);
                    }
                };
                reader.readAsBinaryString(file);
            });
        }
    }
    //reset pagination details
    function resetPaginationDetails(_callback){
        excelUploadPagination = { 
            totalCount: 0, 
            startIndex: 0,  
            available: 0, 
            notavailable: 0,
            availableBarcodes: [],
            uploadUUID: uuidv4(),
        };

        _callback();
    }
    //get available product details of uploaded barcode list
    function loadExcelProdData(barcodedata){
        let excelPagination = excelUploadPagination;

        let sendobj = {
            barcodes: (excelUploadPagination.startIndex === 0?barcodedata:[]),
            isReqPagination: true,
            isReqCount: false,
            maxResult: paginationMaxCount,
            startIndex: excelPagination.startIndex,
            uuid: excelPagination.uploadUUID
        }

        let saveurl = submitCollection.saveImportedBarcodes;
        if(isSimView){
            saveurl = submitCollection.saveSimImportedBarcodes;
            
            sendobj.mpId = (originatedMpId && originatedMpId > -1?originatedMpId:saveObj?saveObj.mp_id:-1);
            if(isShowFromPreview && selectedSimPreviewObj){
                sendobj.mpId = selectedSimPreviewObj.mpId;
            }

        } else{
            sendobj.floorlayoutId = saveObj.floorLayoutId;
        }

        // toggleLoadingModal((excelUploadPagination.startIndex > 1?false:true), () => {
            setUploadPaginating(true);
            submitSets(saveurl, sendobj, true).then(res => {
                // console.log(res);
                if(res && res.status){
                    let datalist = (res.extra && res.extra.importedBarcodes && res.extra.importedBarcodes.length > 0?res.extra.importedBarcodes:[]);
                    setUploadedBarcodes(barcodedata);
                    
                    excelPagination.availableBarcodes = excelPagination.availableBarcodes.concat(datalist);
                    toggleAvailableBarcodeModal(true);
                    

                    if(excelUploadPagination.startIndex === 0){
                        excelPagination.totalCount = (res.count > 0?res.count:0);
                        sendExcelData(excelPagination.availableBarcodes, excelPagination.totalCount);
                        
                        excelPagination.available = (excelPagination.available + (res.extra && res.extra.avaibleImportedBarcodeCount > 0?res.extra.avaibleImportedBarcodeCount:0));
                        excelPagination.notavailable = (excelPagination.notavailable + (res.extra && res.extra.notAvaibleImportedBarcodeCount > 0?res.extra.notAvaibleImportedBarcodeCount:0));
                    }


                    excelPagination.startIndex = (excelPagination.startIndex + (datalist.length > 0?datalist.length:0));
                }

                // console.log(excelPagination);
                setExcelUploadPagination(excelPagination);

                setUploadPaginating(false);
                toggleLoadingModal(false);
            });
        // });

    }
    //reset input upload before select another file
    function resetExcelUploadFile() {
        
        document.getElementById("excelupload-file"+(additionalIDs?additionalIDs:"")).value = null;

        let popoverelem = document.getElementById("productexport-examples");
        if(popoverelem && popoverelem.classList.contains("show")){
            document.getElementById("excelupload-file"+(additionalIDs?additionalIDs:"")).click();
        }
    }
    //
    /* function sendAvailableProdList(){
        let availableProdList = availableBarcodes.filter(x => x.availabilityType === excelUploadAvailablity.available);

        if(availableProdList.length > 0){
            sendExcelData(availableProdList);
            toggleAvailableBarcodeModal(false);
        } else{
            alertService.error(t("NO_AVAILABLE_PRODS"));
        }
    } */

    function getScrollPosition(e){
        if(isUploadPaginating === false && excelUploadPagination.startIndex < excelUploadPagination.totalCount){
            var top = document.getElementById("upload-scrollcontent").scrollTop;
            var sheight = document.getElementById("upload-scrollcontent").scrollHeight;

            var position = (sheight - top);
            var clientHeight = e.target.clientHeight;
            position = Math.trunc((position - 1)); 
            
            if(position <= clientHeight){
                loadExcelProdData(uploadedBarcodes);
            }
        }
    }

    return (<>
        {!isSimView?<>
            <PopoverWrapper cusid="productexport-controllers" text={
                <ul className='list-inline'>
                    <li className='list-inline-item excelupload-wrapper'>
                        <PopoverWrapper cusid="productexport-examples" text={<>
                            <div className='example-contents'>
                                <div className='header'>
                                    <span className='title1'>{t('Excel_file_examples')}</span>
                                    <span className='title2'>{t('Import_xlsx_files_with_these_formats')}</span>
                                </div>
                                <div className='body-content'>
                                    <Button variant="success" onClick={createAndDownloadXLSX}><FileIcon size={16} /> {t('Template')}</Button>
                                    <div className='examplesheet'>
                                        <div className='data sheetheader'>
                                            <span style={{color:"gray",fontWeight:"700"}}>{t('barcode')}</span>
                                        </div>
                                        <div className='data'>
                                            <span>001021518522</span>
                                        </div>
                                        <div className='data'>
                                            <span>001021518523</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </>} placement="top">
                            <div id="upload-info-link" className='upload-info'><FeatherIcon icon="info" size={14} /></div>
                        </PopoverWrapper>
                        <label htmlFor='excelupload-file' onClick={() => resetExcelUploadFile()} className='excelupload-link'><FeatherIcon icon="upload" size={16}/></label>
                        <input id="excelupload-file" type="file" onChange={e => excelFileChange(e)} accept='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel' style={{display: "none"}} />
                    </li>

                    <li className='list-inline-item' onClick={(e) => togglePrintDeptModal(true)}><FeatherIcon icon="download" size={16}/></li>      
                </ul>
            } placement="top" rootClose={true}>
                <div className='icon-wrapper'><FeatherIcon icon="file" size={18} /></div>
            </PopoverWrapper>
            
            <Modal className="contimplement-modal pgPrintDeptsModal" show={showDeptModal} centered onHide={() => togglePrintDeptModal(!showDeptModal)}>
                <Modal.Body>
                    <div className='closebtn' onClick={() => togglePrintDeptModal(false)}><XIcon size={30} /></div>

                    <h3 className='issue-header'>{t("PRINT_PGDEPARTMENTS")}</h3>

                    <h5>{t("PLEASE_SELECT_A_DEPTTO_CONTINUE")}</h5>

                    <Col>
                        <Form.Control as={"select"} value={selectedDept} onChange={e => setSelectedDept(e.target.value)}>
                            {fieldDeptList.map((fielddept, fielddeptidx) => {
                                return <option value={fielddeptidx} key={fielddeptidx}>{fielddept.name}</option>
                            })}
                        </Form.Control>
                    </Col>
                </Modal.Body>
                <Modal.Footer style={{display:"initial", textAlign:"right"}}>
                    <Button type="button" variant="secondary" size="sm" className={(isRTL==="rtl"?"float-left":"float-right")} onClick={() => togglePrintDeptModal(false)} style={{borderRadius:"15px"}}>{t('btnnames.close')}</Button>
                    <Button type="button" variant="primary" size="sm" className={(isRTL==="rtl"?"float-left":"float-right")} onClick={() => loadDepartmentProdList()} style={{borderRadius:"15px"}}>{t('continue_btn')}</Button>
                </Modal.Footer>
            </Modal>
        </>:<>
            <div id="productexport-controllers" className='sim-view'>
                <ul className='list-inline'>
                    <TooltipWrapper text={t("Add_Store_Product")}>
                        <li className='list-inline-item add' onClick={(e) => handleAddProduct(true)}><FeatherIcon icon="plus" size={14} /></li>
                    </TooltipWrapper>   

                    <TooltipWrapper text={t("EXCEL_UPLOAD_MAXIMUM")}>  
                        <li className='list-inline-item excelupload-wrapper'>
                            <PopoverWrapper cusid="productexport-examples" text={<>
                                <div className='example-contents'>
                                    <div className='header'>
                                        <span className='title1'>{t('Excel_file_examples')}</span>
                                        <span className='title2'>{t('Import_xlsx_files_with_these_formats')}</span>
                                    </div>
                                    <div className='body-content'>
                                        <Button variant="success" onClick={createAndDownloadXLSX}><FileIcon size={16} /> {t('Template')}</Button>
                                        <div className='examplesheet'>
                                            <div className='data sheetheader'>
                                                <span style={{color:"gray",fontWeight:"700"}}>{t('barcode')}</span>
                                            </div>
                                            <div className='data'>
                                                <span>001021518522</span>
                                            </div>
                                            <div className='data'>
                                                <span>001021518523</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </>} placement="bottom">
                                <div id="upload-info-link" className='upload-info'><FeatherIcon icon="info" size={14} /></div>
                            </PopoverWrapper>
                            <label htmlFor={"excelupload-file"+(additionalIDs?additionalIDs:"")} onClick={() => resetExcelUploadFile()} className='excelupload-link'><FeatherIcon icon="upload" size={16}/></label>
                            <input id={"excelupload-file"+(additionalIDs?additionalIDs:"")} type="file" onChange={e => excelFileChange(e)} accept='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel' style={{display: "none"}} />
                        </li>
                    </TooltipWrapper> 
                </ul>
            </div>
        </>}

        {isShowAvailableModal?<Modal className="contimplement-modal pgPrintDeptsModal pgImportBarcodeListModal" show={isShowAvailableModal} centered onHide={() => toggleAvailableBarcodeModal(!isShowAvailableModal)}>
            <Modal.Body>
                <div className='closebtn' onClick={() => toggleAvailableBarcodeModal(false)}><XIcon size={30} /></div>

                <h3 className='issue-header'>{t("IMPORTED_PRODLIST")}</h3>

                <h5>{t("Total")+(": "+excelUploadPagination.totalCount+" ")+t("items")}</h5>

                <Col>
                    <Table size='sm' style={{marginBottom: "0px"}}>
                        <thead>
                            <tr><th>{t("product")}</th><th width="30%">{t("status")}</th></tr>
                        </thead>
                    </Table>
                </Col>
                <Col id="upload-scrollcontent" className='scroll-content' onScroll={(e)=> getScrollPosition(e)}>
                    <Table size='sm' style={{paddingBottom:"10px"}}>
                        <tbody>
                            {excelUploadPagination.availableBarcodes.map((xitem, xidx) => {
                                return <tr key={xidx}>
                                    <td>
                                        <div className='img-view'>
                                            <img src={xitem.availabilityType === excelUploadAvailablity.available && xitem.imageUrl?xitem.imageUrl:imagePlaceholder} className={"img-resize-hor"} alt=""/>   
                                        </div>
                                        <div className={'barcodeprod-details'+(xitem.availabilityType === excelUploadAvailablity.not_available?" no-data":"")}>
                                            <small>{xitem.barcode}</small>
                                            {xitem.productName}
                                        </div>
                                    </td>
                                    <td className='text-center' width="30%">{xitem.availabilityType === excelUploadAvailablity.not_available?<Badge bg='danger'>{t('ISSUESTORE_BTNS.notavailable')}</Badge>:<Badge bg='success'>{t('ISSUESTORE_BTNS.available')}</Badge>}</td>
                                </tr>;
                            })}
                        </tbody>
                    </Table>

                    {isUploadPaginating?<>
                        <Col className="text-center" style={{paddingBottom:"10px"}}><img src={loadinggif} alt="loading animation" style={{height:"20px"}}/></Col>
                    </>:<></>}
                </Col>
            </Modal.Body>
            <Modal.Footer style={{display:"initial", textAlign:"right"}}>
                <label><div>{t("ISSUESTORE_BTNS.available")}: {excelUploadPagination.available}</div>  <div>{t("ISSUESTORE_BTNS.notavailable")}: {excelUploadPagination.notavailable}</div></label>

                <Button type="button" variant="primary" size="sm" className={(isRTL==="rtl"?"float-left":"float-right")} onClick={() => toggleAvailableBarcodeModal(false)} style={{borderRadius:"15px"}}>{t('OKAY')}</Button>
                {/* <Button type="button" variant="primary" size="sm" className={(isRTL==="rtl"?"float-left":"float-right")} onClick={() => sendAvailableProdList()} style={{borderRadius:"15px"}}>{t('IMPORT_AVAILABLE_LIST')}</Button> */}
            </Modal.Footer>
        </Modal>:<></>}
    </>)
}