
import React from 'react';
import { Button, Col, FormSelect, Form, Modal ,Badge} from 'react-bootstrap';
import Select from 'react-select';
import QRCode from 'qrcode.react';
import * as htmlToImage from 'html-to-image';
import { XIcon } from '@primer/octicons-react';
// import * as XLSX from 'xlsx';
import * as XLSX from "xlsx-js-style";

import  JSZip from 'jszip';
import FileSaver from 'file-saver';

import { alertService } from '../../../_services/alert.service';
import { replaceSpecialChars, stringtrim } from '../../../_services/common.service';
import { submitCollection } from '../../../_services/submit.service';
import { submitSets } from '../../UiComponents/SubmitSets';
import { AcViewModal } from '../../UiComponents/AcImports';
import { TooltipWrapper } from '../../newMasterPlanogram/AddMethods';

// import * as XLSX from 'xlsx';

/**
 * Using to generate multiple QR field codes in planogram layout view
 * Working as a hidden component triggers by #bulkqrprintlink id
 *
 * @export
 * @class RandomQRGenerator
 * @extends {React.Component}
 */
export class RandomQRGenerator extends React.Component{
    constructor(props){
        super(props);

        this.state = {
            qrObj: null,
            qrFieldArray: [],

            printQRList: [],
        }
    }
    // onclick generate button
    generateBulkQR = () => {
        // shows loading modal in parent
        this.props.updateLoadingModal(true, () => {
            let imagesArray = []; //images list
            // loop fields list and add all fields to single list
            for (let j = 0; j < this.props.rects.length; j++) {
                const rectobj = this.props.rects[j];

                for (let i = 0; i < rectobj.fields.length; i++) {
                    const fieldobj = rectobj.fields[i];

                    if(!fieldobj.isNew && fieldobj.uuid && fieldobj.department && fieldobj.department.departmentId > 0 && fieldobj.noInFloorLayout > 0){
                        imagesArray.push(fieldobj);
                    }
                }    
            }
            // console.log(imagesArray);
            // set qrFieldArray and continue load qr with first field obj
            if(imagesArray.length > 0){
                this.setState({ qrFieldArray: imagesArray, printQRList: [] }, () => {
                    this.continueLoadQRs(this.state.qrFieldArray[0]);
                });
            } else{
                alertService.error(this.props.t("NO_FIELDS_FOUND_TOPRINT"));
            } 
        });
    }
    // generate images for fields
    // set qrObj and then get images using htmlToImage by using #qrcontent3 id
    continueLoadQRs = (nextobj) => {
        //clear already added obj
        this.setState({ qrObj: null }, () => {
            //set new qrObj
            this.setState({ qrObj: nextobj }, () => {
                //get image from #qrcontent3 id
                htmlToImage.toPng(document.getElementById('qrcontent3')).then((blob) => {
                    //push to printQRList
                    let newprintlist = this.state.printQRList;
                    let filename = replaceSpecialChars(nextobj?((nextobj.department?nextobj.department.name:"_")+(nextobj.noInFloorLayout > 0 ? (" - "+nextobj.noInFloorLayout) : "_")) : "_");
                    newprintlist.push({ uuid:  nextobj.uuid, filename: filename, image: blob });
                    //remove current field from qr list
                    let newclist = JSON.parse(JSON.stringify(this.state.qrFieldArray));
                    newclist.splice(0,1);
                    //update qrlist and fields list
                    this.setState({ printQRList: newprintlist, qrFieldArray: newclist }, () => {
                        //if more fields available in qr list continue this loop
                        if(this.state.qrFieldArray.length > 0){
                            this.continueLoadQRs(this.state.qrFieldArray[0]);
                        } else{
                            //if not continue to generate zip
                            // console.log(this.state.printQRList);
                            this.generateZipFile(this.state.printQRList);
                        }
                    });
                });        
            });
        });
    }
    // generate zip for print genearated images
    // using JSZip to generate zip
    generateZipFile = (printfilelist) => {
        const zip = new JSZip(); //init JSZip
        //loop field images and add to JSZip
        for (let i = 0; i < printfilelist.length; i++) {
            const printimage = printfilelist[i];
            //remove base64 first content not to make it data url
            zip.file((printimage.filename+".png"), printimage.image.replace("data:image/png;base64,",""), {base64: true});
        }
        //generate zipfile
        let layoutdetails = this.props.planFloorObj;
        let isallqrs = (this.props.isPrintAllQRs.isall?"all":this.props.isPrintAllQRs.dept.name);
        let layoutname = replaceSpecialChars(layoutdetails?(layoutdetails.floor.name+"_"+layoutdetails.mainVersion+"_"+isallqrs):"_");

        zip.generateAsync({type:"blob"}).then((content) => {
            let newdate = new Date();
            // see FileSaver.js
            FileSaver.saveAs(content, layoutname+"_"+newdate.getTime()+".zip");

            this.props.updateLoadingModal(false);
        });
    }

    render(){
        return <>
            <div className='multiprint-generatediv'>
                <Col id="qrcontent3" style={{ padding: "25px", background: "#fff", borderRadius: "4px" }}>
                    {this.state.qrObj?<QRCode style={{ float: "center" }} value={this.state.qrObj.uuid} size={512} />:<></>}<br />
                    {/* <label style={{ fontSize: "20px", float: "center", textTransform: "uppercase" }}>{this.state.qrObj?this.state.qrObj.uuid:""}</label><br /> */}
                    <label style={{ fontSize: "32px", fontWeight: "700", float: "center" }}>{this.state.qrObj?((this.state.qrObj.department?this.state.qrObj.department.name:"")+(this.state.qrObj.noInFloorLayout > 0 ? (" - "+this.state.qrObj.noInFloorLayout) : "")) : ""} </label>
                </Col>
            </div>
            <Button id="bulkqrprintlink" onClick={() => this.generateBulkQR()} style={{ display: "none" }}>{this.props.t('BULKQR_PRINT')}</Button>
        </>;    
    }
}
/**
 * Bulk QR print option select modal
 * Users can select a department or entire layout as options to print bulk qrs
 *
 * @export
 * @class BulkQRModal
 * @extends {React.Component}
 */
export class BulkQRModal extends React.Component{
    constructor(props){
        super(props);
        
        this.state = {
            modalCountsShow: 0,
            selectedDept: null,
            filteredDeptList: [],

            deptList: [],
        }
    }

    componentDidMount(){
        // console.log(this.props.rects);
        //onload trigger to get counts and departments
        this.findAllCounts();
    }
    //get department list and counts from available aisles
    findAllCounts = () => {
        let rectlist = JSON.parse(JSON.stringify(this.props.rects));
        let deptlist = [];
        let fieldsallcount = 0;
        for (let i = 0; i < rectlist.length; i++) {
            const aisleobj = rectlist[i];
            
            for (let j = 0; j < aisleobj.fields.length; j++) {
                const fieldobj = aisleobj.fields[j];
                
                if(!fieldobj.isNew && fieldobj.uuid && fieldobj.department && fieldobj.department.departmentId > 0 && fieldobj.noInFloorLayout > 0){
                    let finddeptadded = deptlist.findIndex(x => x.departmentId === fieldobj.department.departmentId);
                    if(finddeptadded > -1){
                        deptlist[finddeptadded].fieldcount = (deptlist[finddeptadded].fieldcount + 1);
                    } else{
                        let deptobj = fieldobj.department;
                        deptobj["fieldcount"] = 1;
                        deptlist.push(deptobj);
                    }

                    fieldsallcount = (fieldsallcount + 1);    
                }
            }
        }

        // console.log(deptlist);
        this.setState({ deptList: deptlist, modalCountsShow: fieldsallcount }, () => {
            if(this.state.deptList.length === 0){
                alertService.error(this.props.t("NO_FIELDS_FOUND_TOPRINT"));
                this.props.toggleBulkQRPrint();
            }
        });
    }
    //onchange department select set selected department
    updateSelectedDept = (selidx) => {
        if(selidx > -1){
            let rectlist = JSON.parse(JSON.stringify(this.props.rects));
            let seldept = this.state.deptList[selidx];

            let newaisles = [];
            for (let i = 0; i < rectlist.length; i++) {
                const rectobj = rectlist[i];
                
                let newfields = [];
                for (let j = 0; j < rectobj.fields.length; j++) {
                    const fieldobj = rectobj.fields[j];
                    if(seldept.departmentId === fieldobj.department.departmentId){
                        newfields.push(fieldobj);
                    }
                }

                if(newfields.length > 0){
                    rectobj.fields = newfields;
                    newaisles.push(rectobj);
                }
            }
            // console.log(newaisles);

            this.setState({ selectedDept: seldept, filteredDeptList: newaisles });
        } else{
            this.setState({ selectedDept: null });
        }
    }
    //check department is selected before export
    selectedDeptExport = () => {
        if(this.state.selectedDept){
            if(this.props.isNonSimExport){
                this.exportNonUsedProducts()
            }else{
                this.props.triggerBulkQR(this.state.filteredDeptList, false, this.state.selectedDept);
            }
        } else{
            alertService.error(this.props.t("SELECT_DEPARTMENT"));
        }
    }
    exportNonUsedProducts=()=>{
        // console.log(this.state.selectedDept,this.props.floorlayoutId);
        var cdobj={
            floorLayoutId: this.props.floorlayoutId,
            departmentId: this.state.selectedDept.departmentId
        }
        submitSets(submitCollection.productsNotInPlanogram, cdobj, true, null, true).then(res => {
            // var sample=[{"department":"dept 1","productsNotInPlanogram":[{"barcode":"00000000001","name":"prod 1","department":"dept 1","category":"cat 1","subcategory":"subcat 1","brand":"brand 1","completeStatus":"FullData","hierarchyCompleteStatus":"Completed"},{"barcode":"00000000002","name":"prod 2","department":"dept 1","category":"cat 1","subcategory":"subcat 1","brand":"brand 1","completeStatus":"FullData","hierarchyCompleteStatus":"Completed"}]},{"department":"dept 2","productsNotInPlanogram":[{"barcode":"00000000003","name":"prod 3","department":"dept 2","category":"cat 1","subcategory":"subcat 1","brand":"brand 1","completeStatus":"FullData","hierarchyCompleteStatus":"HaveIssues"},{"barcode":"00000000004","name":"prod 4","department":"dept 2","category":"cat 1","subcategory":"subcat 1","brand":"brand 1","completeStatus":"DataMissig","hierarchyCompleteStatus":"Completed"},{"barcode":"00000000005","name":"prod 5","department":"dept 2","category":"cat 2","subcategory":"subcat 1","brand":"brand 1","completeStatus":"FullData","hierarchyCompleteStatus":"Completed"}]}]
            if (res && res.status) {
                this.ExportCSV(res.extra, "planigo_nonusedprod_export",this.state.selectedDept.name);
                // console.log(res.extra);
            }else{
                // alertService.error(res && res.extra?res.extra:this.props.t("erroroccurred"))
            }
        });
    }
    //export prodinfo data
    ExportCSV = (exportData, fileName,depname) => {
        // const fileType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
        const fileExtension = '.xlsx';

        const cdate = new Date();
        //export data
        var csvData = [];
       var styles= { font: { bold: true },alignment:{wrapText:true} }
        if (exportData && exportData.length > 0) {
            exportData.forEach(exproditem => {
                csvData.push([{v:exproditem.department,s:styles}])
                csvData.push([{v:"Barcode",s:styles}, {v:"Name",s:styles}, {v:"Department",s:styles}, {v:"Category",s:styles}, {v:"Sub category",s:styles}, {v:"Brand",s:styles},{v:"Product data complete status",s:styles},{v:"Department/Category/SubCategory complete status",s:styles}]);
                exproditem.productsNotInPlanogram.forEach(nonused => {
                    csvData.push([nonused.barcode, nonused.name, nonused.department, nonused.category, nonused.subcategory, nonused.brand, nonused.completeStatus, nonused.hierarchyCompleteStatus]);
                })
            });
        }
        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.aoa_to_sheet(csvData);
        XLSX.utils.book_append_sheet(wb, ws, "readme demo");

        // STEP 4: Write Excel file to browser
        XLSX.writeFile(wb, replaceSpecialChars(fileName + "_" + (cdate.getTime())+"_"+depname)+ fileExtension);
        // FileSaver.saveAs(data, fileName + "_" + (cdate.getTime())+"_"+depname+ fileExtension);
    }
    // ExportCSV = (exportData, fileName,depname) => {
    //     const fileType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
    //     const fileExtension = '.xlsx';


    //     const cdate = new Date();
    //     //export data
    //     var csvData = [];

    //     if (exportData && exportData.length > 0) {
    //         exportData.forEach(exproditem => {
    //             csvData.push([exproditem.department])
    //             csvData.push(["Barcode", "Name", "Department", "Category", "Sub category", "Brand","Complete Status","Hierarchy Complete Status"]);
    //             exproditem.productsNotInPlanogram.forEach(nonused => {
    //                 csvData.push([nonused.barcode, nonused.name, nonused.department, nonused.category, nonused.subcategory, nonused.brand, nonused.completeStatus, nonused.hierarchyCompleteStatus]);
    //             })

    //         });
    //     }
    //     const ws = XLSX.utils.json_to_sheet(csvData);
    //     const wb = { Sheets: { 'data': ws }, SheetNames: ['data'] };
    //     const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    //     const data = new Blob([excelBuffer], { type: fileType });
    //     FileSaver.saveAs(data, fileName + "_" + (cdate.getTime())+"_"+depname+ fileExtension);
    // }

    //     const cdate = new Date();
    //     //export data
    //     var csvData = [];
       
    //     if (exportData && exportData.length > 0) {
    //         exportData.forEach(exproditem => {
    //             csvData.push([exproditem.department])
    //             csvData.push(["Barcode", "Name", "Department", "Category", "Sub category", "Brand","Complete Status","Hierarchy Complete Status"]);
    //             exproditem.productsNotInPlanogram.forEach(nonused => {
    //                 csvData.push([nonused.barcode, nonused.name, nonused.department, nonused.category, nonused.subcategory, nonused.brand, nonused.completeStatus, nonused.hierarchyCompleteStatus]);
    //             })
              
    //         });
    //     }
    //     const ws = XLSX.utils.json_to_sheet(csvData);
    //     const wb = { Sheets: { 'data': ws }, SheetNames: ['data'] };
    //     const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    //     const data = new Blob([excelBuffer], { type: fileType });
    //     FileSaver.saveAs(data, fileName + "_" + (cdate.getTime())+"_"+depname+ fileExtension);
    // }
    render(){
        let {isNonSimExport}=this.props
        return <>
            <Modal show={this.props.showBulkPrintModal} className={'bulkqrprint-modal'} centered style={{direction: this.props.isRTL}} onHide={this.props.toggleBulkQRPrint}>
               <Modal.Body>
                    <span className='close-link' onClick={this.props.toggleBulkQRPrint}><XIcon size={22}/></span>
                    {isNonSimExport?<h3 className='text-center'>{this.props.t('NONUSED_PROD_PRINT')}</h3>:<h3 className='text-center'>{this.props.t('BULKQRPRINT_MODAL')}</h3>}

                    <Col className='section-wrapper'>
                        <h5>{this.props.t("DEPARTMENT_WISE")}</h5>
                        <ul className='list-inline'>
                            <li className='list-inline-item'>
                                <FormSelect onChange={e => this.updateSelectedDept(e.target.value)} style={{width: "280px"}} >
                                    <option value={-1}>{this.props.t("SELECT_DEPARTMENT")}</option>
                                    {this.state.deptList.map((deptobj, deptidx) => {
                                        return <option key={deptidx} value={deptidx}>{deptobj.name}</option>
                                    })}
                                </FormSelect>
                            </li>
                            <li className={'list-inline-item '+(this.props.isRTL === "rtl"?"float-left":"float-right")}>
                                <Button onClick={() => this.selectedDeptExport()}>{this.props.t("EXPORT")}</Button>
                            </li>
                        </ul>
                        {(this.state.selectedDept&& !isNonSimExport)?<small className='count-label'>{this.state.selectedDept.fieldcount} {this.props.t("FIELDS_AVAILABLE")}</small>:<></>}
                    </Col>
                    {isNonSimExport?<></>:<Col className='section-wrapper'>
                        <h5>{this.props.t("ALL_LAYOUT")}</h5>
                        <Button className={this.props.isRTL === "rtl"?"float-left":"float-right"} onClick={() => this.props.triggerBulkQR(this.props.rects, true)}>{this.props.t("EXPORT")}</Button>
                        <small className='count-label'>{this.state.modalCountsShow} {this.props.t("FIELDS_AVAILABLE")}</small>    
                    </Col>}
                </Modal.Body>
            </Modal>
        </>;
    }
}

export class StoreCopyModel extends React.Component{
    constructor(props){
        super(props);
        
        this.state = {
            deptList: [],
            regions:[],
            storeList:[],
            storeId:null,
            regionId:null,
            isloading:false,
            showdepartmentModel:false,
            departmentlist:[],
            SelectedDepartmentIds:[],
            singledepartmentId:null
        }
    }

    componentDidMount(){
        this.setState({
            regions:this.props.regions,
            departmentlist:this.props.departmentlist
        })
    }
  
    updateStore = (index) => {
        let stores = this.state.storeList;
        this.setState({
            storeId:stores[index].branchId
        })
    }


    updateRegions = (idx) => {
       if(idx > -1){
        let selregion = this.state.regions[idx];
        let reid = selregion.regionId;
        this.setState({
            regionId:reid
        })
        submitSets(submitCollection.getUserBranches, "?regionId=" + (reid), true).then(res => {
            if(res.status){
             let stores = res.extra.filter(data => data.branchId !== parseInt(this.props.storeId));
             this.setState({ storeList: stores });
            }
         });
       }else{
        this.setState({storeList : [],storeId:null,regionId:null})
       }
    }

    handleTagModalToggle = ()=>{
        this.setState({
            showdepartmentModel: !this.state.showdepartmentModel,
            singledepartmentId:null
        })
    }
    send= () => {
        if(this.state.regionId){
            if(this.state.storeId){

                if(this.state.SelectedDepartmentIds.length > 0){
                    let departmentIds = [];

                    for (const department of this.state.SelectedDepartmentIds) {
                        departmentIds.push(department.value)
                    }

                    let sobj ={
                        "floorLayoutId":this.props.floorlayoutId,
                        "targetStoreId":this.state.storeId,
                        "departmentIds":departmentIds
                    }
                    this.setState({
                        isloading:true
                    })
                    submitSets(submitCollection.PlanogramStoreCopy,sobj, true, null, true).then(res => {
                        this.setState({
                            isloading:false
                        })
                        this.props.togglehide()
                        if(res.status){
                         alertService.success(this.props.t('successfully_copied'))
            
                        }else{
                        // alertService.error(res.extra&&res.extra!==""?res.extra:this.props.t('erroroccurred'));
                        }
                     });
                }else{
                    alertService.error(this.props.t('Add_least_one_department'));
                }       
            }else{
                alertService.error(this.props.t('select_a_Store'));
            }
        }else{
            alertService.error(this.props.t('Select_A_Region'));
        }       
    }

    addDepartment = (data)=>{
        this.setState({
            singledepartmentId:data
        })
        
    }

    pushDepartmentIds = ()=>{
        if(this.state.singledepartmentId){
            if(this.state.SelectedDepartmentIds.length > 0){
                let find = this.state.SelectedDepartmentIds.filter((d)=>{return d.value === this.state.singledepartmentId.value});
                if(find.length > 0 ){
                 alertService.warn(this.props.t('ALREADY_ADDED'))
                }else{
                 this.setState((prevState) => ({
                     SelectedDepartmentIds: [...prevState.SelectedDepartmentIds, this.state.singledepartmentId]
                   }),()=>{
                     this.setState({
                         singledepartmentId:null,
                         showdepartmentModel:false
                     })
                   });
                }
             }else{
                 this.setState((prevState) => ({
                     SelectedDepartmentIds: [...prevState.SelectedDepartmentIds, this.state.singledepartmentId]
                   }),()=>{
                     this.setState({
                         singledepartmentId:null,
                         showdepartmentModel:false
                     })
                   });
             }
        }else{
            alertService.error(this.props.t('selectdepartment'));
        }
    }
   
    removeSelectedDepartment=(id)=>{
        let data = this.state.SelectedDepartmentIds.filter((d)=>{ return d.value !== id});
        this.setState({
            SelectedDepartmentIds:data
        })
    }

    render(){
        return <>
            <Modal show={this.props.showModel} className={'bulkqrprint-modal'} centered style={{direction: this.props.isRTL}} onHide={this.props.togglehide}>
               <Modal.Body>
                    <span className='close-link' onClick={this.props.togglehide}><XIcon size={22}/></span>
                    <h3 className='text-center'>{this.props.t('Planogram_Store_Copy')}</h3>
                    <Col className='section-wrapper d-flex flex-column gap-4'>
                        <div>
                            <h5>{this.props.t('Select_Region')}</h5>
                            <ul className='list-inline'>
                                <li className='list-inline-item'>
                                    <Form.Control as="select" onChange={e => this.updateRegions(e.target.value)} style={{width: "280px"}} >
                                        <option value={-1}>{this.props.t('Select_A_Region')}</option>
                                        {this.state.regions.map((dataobj, dataidx) => {
                                            return <option key={dataidx} value={dataidx}>{dataobj.name}</option>
                                        })}
                                    </Form.Control>
                                </li>
                            </ul>
                        </div>
                        <div>
                            <h5>{this.props.t('select_Store')}</h5>
                            <ul className='list-inline'>
                                <li className='list-inline-item'>
                                    <Form.Control as="select" onChange={e => this.updateStore(e.target.value)} style={{width: "280px"}} >
                                        <option value={-1}>{this.props.t('select_a_Store')}</option>
                                        {this.state.storeList.map((storeobj, storeidx) => {
                                            return <option key={storeidx} value={storeidx}>{storeobj.name}</option>
                                        })}
                                    </Form.Control>
                                </li>
                            </ul>
                        </div>
                        <div>
                            <h5>{this.props.t('departments')} <Button variant='danger' style={{margin:"0px 5px 0px 5px",padding:"0px 7px"}} onClick={this.handleTagModalToggle}>+</Button></h5>
                            {this.state.SelectedDepartmentIds?this.state.SelectedDepartmentIds.map((xitem,xidx) => {
                            return <React.Fragment key={xidx}>
                                    <TooltipWrapper text={xitem.label}>
                                      <Badge bg="primary" className="department-badge">{stringtrim(xitem.label,70)} <span onClick={()=>this.removeSelectedDepartment(xitem.value)}><XIcon size={14}/></span></Badge>
                                    </TooltipWrapper>
                                  </React.Fragment>;
                        }):<></>}
                        </div>
                        <div>
                            <div className={(this.props.isRTL === "rtl"?"float-left":"float-right")}>
                                <Button  onClick={() => this.send()}>{this.props.t('btnnames.send')}</Button>
                            </div>
                        </div>
                    </Col>
                </Modal.Body>
            </Modal>
            <Modal show={this.state.showdepartmentModel} centered size={"sm"} backdrop="static" keyboard={false} onHide={this.handleTagModalToggle} className={"branchmodal-view tagaddmodal " + (this.props.isRTL === "rtl" ? "RTL" : "")} dir={this.props.isRTL}>
                <Modal.Header>
                <Modal.Title><b>{this.props.t('Add_Department')}</b></Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Select id="tagId" name="area" placeholder={this.props.t('selectdepartment')} options={this.state.departmentlist} onChange={(e)=>this.addDepartment(e)} type="text" className="filter-searchselect" classNamePrefix="searchselect-inner" components={{ IndicatorSeparator: () => null }} maxMenuHeight={120} data-validation-type="area" required />
                </Modal.Body>
                <Modal.Footer>
                <Button size='sm' className="bsavebutton btn btn-success branch " variant='success' onClick={this.pushDepartmentIds} >{this.props.t("btnnames.add")}</Button>
                <Button size='sm' className="bbackbutton btn btn-light branch " variant='light' onClick={this.handleTagModalToggle} >{this.props.t("btnnames.back")}</Button>
                </Modal.Footer>
            </Modal>
            <AcViewModal showmodal={this.state.isloading} />
        </>;
    }
}


