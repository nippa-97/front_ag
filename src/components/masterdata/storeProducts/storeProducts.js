import React from 'react';
import { Link, withRouter } from 'react-router-dom';
import {Breadcrumb, Row, Col, Form, Button, Modal, Table, InputGroup, Image, Pagination, Badge } from 'react-bootstrap';
import Select from 'react-select';

import { AcInput, AcNoDataView, AcViewModal, ValT } from '../../UiComponents/AcImports';
import { submitSets } from '../../UiComponents/SubmitSets';
import { submitCollection } from '../../../_services/submit.service';
import { alertService } from '../../../_services/alert.service';
import { withTranslation } from 'react-i18next';
import MDSidebarMenu from '../../common_layouts/mdsidebarmenu';
import PreviewImage from '../../common_layouts/image_preview/imagePreview.js';
import { confirmAlert } from 'react-confirm-alert';

import './storeProducts.scss';
import { getCookie, getPager,preventNumberInput,preventinputToString,preventinputotherthannumbers, restrictDecimalPoint } from '../../../_services/common.service';
import { ChevronLeftIcon, ChevronRightIcon, XIcon } from '@primer/octicons-react';
//import { store } from '../../../store/store';

/**
 * 
 * 
 *
 * @class 
 * @extends {React.Component}
 */
export class StoreProducts extends React.Component{
    _isMounted = false;
    timeoutId;

    constructor(props){
        super(props);
        this.state = {
            loading:false,
            selectedStoreId:null,
            isStoreAvailable:true,
            productsList:[],
            sobj:this.defaultSearchObjLoad(0),
            productObj:this.defaultSaveObjLoad(0),
            showAddModal:false,
            isSaveLoading:false,
            selectedStoreName:"",

            startpage: 1, 
            totalresults: 0,
            defaultPageCount: 8, 
            currentPage: 1, 
            totalPages: 0,
            ftablebody:[],
            pageItemsList:[],
            isdataloaded:false,

            showPreviewImageModal:false,
            imgPreviewProductId:0,
            noOptionMsg:"No Results",
            errors:{}
        }
    }

    componentDidMount(){
        this._isMounted = true;

        if(this._isMounted){
            //get storeid if available
            var cstoreid = (getCookie("storeId")?getCookie("storeId"):0);
            let st_id = parseInt(cstoreid);
            if(st_id>0){
                this.setState({selectedStoreId:st_id, isStoreAvailable:true, sobj:this.defaultSearchObjLoad(st_id),},()=>{
                    // this.loadAllProducts();
                    this.handleTableSearch();
                    this.findStoreName(st_id);
                });
            }
            else{
                alertService.error("Store is not available.Please set a Store.");
            }
        }
    }

    componentWillUnmount(){
        this._isMounted = false;
    }

    findStoreName = (stid) =>{
        let storelist = (this.props.loadedBranchList ? this.props.loadedBranchList : []);
        let index = storelist.findIndex(x => x.id === stid);
        let storeName = (storelist[index] ? storelist[index].name :"-");
        this.setState({selectedStoreName:storeName});
    }

    defaultSearchObjLoad = (storeId) =>{
        return {storeId:storeId,searchValue:"", isReqPagination: true, startIndex: 0, maxResult: 8,}
    }

    defaultSaveObjLoad = (storeId) =>{
        return {storeId: storeId, productId:null, OosSensitiveValue:"",OosActualStoreStatus:"Empty", imageUrl:null}
    }

    resetSearch = () => {
        this.setState({sobj:this.defaultSearchObjLoad(this.state.selectedStoreId), startpage:1, currentPage:1},()=>{
            this.handleTableSearch();
        });
    }

    //load products
    loadAllProducts = (searchName) =>{

        if(searchName && searchName !== null && searchName !== ""){

        let sobj = {barcode: "",isReqPagination: true, startIndex: 0, maxResult: 8 , productName: searchName? searchName.trim() : "" ,productSource: "",};
        
        submitSets(submitCollection.findNames,sobj, true).then(res => {
            if(res && res.status){
                let temlist = [];
                for (let i = 0; i < res.extra.length; i++) {
                    temlist.push({
                        value:res.extra[i].productId,
                        label:(res.extra[i].productName + " - "+res.extra[i].barcode)
                    });
                }
                this.setState({productsList:temlist},()=>{
                    if(temlist.length < 1)
                        this.setState({noOptionMsg:"No Results"})
                    else
                        this.setState({noOptionMsg:"Loading"})
                });
            }else{
                this.setState({noOptionMsg:"No Results"})
            } 
        });
        }
    }

    //set filter object
    handleFilterObject = (evt,etype,ctype,msg) => {
        var cobj = this.state.sobj;
        if(etype === "searchValue"){
            if(!preventinputToString(evt,evt.target.value,msg)){
                evt.preventDefault()
                return
              }
        }
        if(etype !== null){
            cobj[etype] = evt.target.value;
        }
        cobj.startIndex = 0;
        
        this.setState({sobj:cobj}, () => {
            if(ctype === "click" || (ctype === "enter" && evt.which === 13)){
                this.setState({startpage: 1,toridata:[],totalresults:0, currentPage:1}, () => {
                this.handleTableSearch(null,"click");
            });

            }
        });
    }

    //new product add
    handleNewLink = () => {
        if(this.state.selectedStoreId>0){
            this.setState({productObj:this.defaultSaveObjLoad(this.state.selectedStoreId)},()=>{
                this.toggleAddinfModal();
            });
        }
        else{
            alertService.error("Store is not available.Please set a Store.");
        }
    }
    //handle add modal
    toggleAddinfModal = () =>{
        this.setState({showAddModal:!this.state.showAddModal});
    }

    //handle form data change
    handleFormDataChange = (type, val) =>{
        let pobj = this.state.productObj;
        pobj[type] = val;
        this.setState({productObj:pobj});
    }

    //handle save product
    saveProduct = () =>{
        let sobj = (this.state.productObj);
        if(sobj.productId === null || sobj.productId<0){
            alertService.warn(this.props.t("SELECT_PRODUCT"));
            return false;
        }
        if(sobj.OosActualStoreStatus === undefined){
            alertService.warn(this.props.t("SELECT_ACTUAL_STORE_STATE"));
            return false;
        }
        if(sobj.OosSensitiveValue === null || sobj.OosSensitiveValue===""){
            alertService.warn(this.props.t("ADD_SENSITIVE_VALUE"));
            return false;
        }
        if(sobj.OosSensitiveValue<0){
            alertService.warn(this.props.t("INVALID_SENSITIVE_VALUE"));
            return false;
        }
        this.setState({loading:true, isSaveLoading:true});
        submitSets(submitCollection.storeProductSave,sobj, true, null, true).then(resp => {
            this.setState({loading:false, isSaveLoading:false});
            if(resp && resp.status){
                alertService.success(this.props.t("SUCCESSFULLY_ADDED"));
                this.toggleAddinfModal();
                this.resetSearch();
            } 
            else{
                // alertService.error((resp&&resp.extra?resp.extra:resp.msg?resp.msg:this.props.t('ERROR_OCCURRED')));
            }
        });

    }

    //-----main table loading ------
    handleTableSearch = () =>{
        this.setState({isdataloaded: false, loading: true,});
        submitSets(submitCollection.storeProductsFind, this.state.sobj, true).then(res => {
            // var cdata = this.state.toridata;
            var cdata = [];
            if (res && res.status) {
                var resultsList = [];

                for (let i = 0; i < res.extra.length; i++) {
                    let cobj = res.extra[i];
                    cobj.updatedSensitiveValue = cobj.OosSensitiveValue;
                    resultsList.push(cobj);
                }

                var cpageidx = cdata.findIndex(x => x.page === this.state.startpage);
                if (cpageidx > -1) {
                    cdata[cpageidx].data = resultsList;
                } else {
                    cdata.push({ page: (this.state.startpage), data: resultsList });
                }
                this.setState({
                    isdataloaded: true, loading: false,
                    toridata: cdata,
                    //totalresults: ((this.state.startpage === 1 || this.state.sobj.isReqCount) ? res.count : this.state.totalresults),
                    totalresults: (res.count ? res.count : 0),
                }, () => {
                    this.loadTableData();
                });

                //save filter obj
                let filterobj = this.state.sobj;
                filterobj.currentPage = this.state.currentPage;
                filterobj.pagtotal = (res.extra ? res.extra.length : 0);

            } else {
                this.setState({
                    isdataloaded: true, loading: false,
                    toridata: cdata,
                }, () => {
                    
                    this.loadTableData();
                });
            }
        });
    }

    //table data load
    loadTableData = () => {
        var cdata = [];
        if (this.state.toridata && this.state.toridata.length > 0) {
            var cfindList = this.state.toridata.find(x => x.page === this.state.startpage);
            if (cfindList) {
                cdata = cfindList.data
            }
        }
        this.setState({ ftablebody: cdata }, () => {
            if (this.state.currentPage > 1) {
                this.setPage(this.state.currentPage, false);
            } else {
                this.setPage(1, false);
            }
        });
    }

    //page change
    handlePageChange = (cstartpage) => {
        //var cfindList = this.state.toridata.find(x => x.page === cstartpage);
        var csobj = this.state.sobj;
        //request 
        // if (cstartpage === this.state.totalPages) {
        //     csobj["isReqCount"] = true
        // } else {
        //     csobj["isReqCount"] = false
        // }
        csobj["isReqCount"] = true;
        csobj.startIndex = ((cstartpage - 1) * this.state.sobj.maxResult);
        this.setState({ sobj: csobj, startpage: cstartpage, isdataloaded: false }, () => {
            // if (cfindList) {
            //     this.setState({ isdataloaded: true });
            //     this.loadTableData();
            // } else {
            // }//used when paginations items are stored in state

            this.handleTableSearch(null, "click");
        });
    }
    //pager
    setPage = (cpage, isnewpage) => {
        var pageLength = (this.state.sobj.maxResult ? this.state.sobj.maxResult : this.state.defaultPageCount);
        var citems = (this.state.ftablebody ? JSON.parse(JSON.stringify(this.state.ftablebody)) : []);
        var pager = getPager(this.state.totalresults, cpage, pageLength);
        // check page isn't out of range
        if (cpage < 1 || cpage > pager.totalPages) {
            this.setState({
                pageItemsList: [],
                currentPage: 1,
                totalPages: 0
            });
            return;
        }
        var cfindList = (this.state.toridata ? this.state.toridata.find(x => x.page === this.state.newstartpage) : undefined);
        if (isnewpage) {
            if (cfindList && cfindList) {
                this.setState({
                    ftablebody: cfindList.data
                });
            } else {
                this.handlePageChange(cpage);
            }
        }
        this.setState({
            pageItemsList: citems,
            currentPage: pager.currentPage,
            totalPages: pager.totalPages,
            isonloadtable: false,
        });
    }

    //change sesitive val of table
    changeTableSesitiveValue = (index, value) =>{
        let ftablelist = JSON.parse(JSON.stringify(this.state.ftablebody));
        if(!restrictDecimalPoint(value,3)){
            if(!(value&& preventNumberInput(value,this.props.t('validation.NumberInputValidation')))){
                ftablelist[index].updatedSensitiveValue = (value>-1?value:0);
                ftablelist[index].SesitiveValUpdateAvl = true;
            }
        }
        this.setState({ftablebody:ftablelist});
    }

    //click update sensitive update click 
    handleClickSensitiveUpdate = (prod, index) =>{
        let cprod = JSON.parse(JSON.stringify(prod));
        console.log(cprod)
        if(parseFloat(cprod.updatedSensitiveValue) === parseFloat(cprod.OosSensitiveValue)){
            alertService.warn(this.props.t("NO_CHANGES_AVAILABLE"));
            return false;
        }

        if(cprod.updatedSensitiveValue==="" || cprod.updatedSensitiveValue<0){
            alertService.warn(this.props.t("INVALID_SENSITIVE_VALUE"));
            return false;
        }

        cprod.OosSensitiveValue = cprod.updatedSensitiveValue;
        this.updateProductData(cprod, true,index);
    }

    //change actual store state of table
    changeTableActualStore = (index, value) =>{
        let ftablelist = JSON.parse(JSON.stringify(this.state.ftablebody));
        ftablelist[index].OosActualStoreStatus = value;
        ftablelist[index].actualStateUpdateAvl = true;
        this.setState({ftablebody:ftablelist},()=>{
            this.updateProductData(ftablelist[index]);
        });
    }

    updateProductData = (prod, isSensitive, index) =>{
        this.setState({loading: true,});
        submitSets(submitCollection.storeProductUpdate, prod, true, null, true).then(resp => {
            this.setState({ loading: false,});
            if (resp && resp.status) {
                alertService.success(this.props.t("SUCCESSFULLY_UPDATED"));
                this.handleTableSearch();
                if(isSensitive===true){
                    this.initAfterSensitiveUpdate(prod, index);
                }
            } else {
                // alertService.error((resp&&resp.extra?resp.extra:resp.msg?resp.msg:this.props.t('ERROR_OCCURRED')));
            }
        });
    }

    //refresh after update sensitive
    initAfterSensitiveUpdate = (pobj,i) =>{
        let ftablelist = JSON.parse(JSON.stringify(this.state.ftablebody));
        ftablelist[i].OosSensitiveValue = pobj.updatedSensitiveValue;
        //ftablelist[i].updatedSensitiveValue = "";
        this.setState({ftablebody:ftablelist});
    }

    deleteProduct = (prod) =>{
        confirmAlert({
            title: this.props.t("CONFIRM_TO_DELETE"),
            message: this.props.t("suretodelete"),
            overlayClassName: (this.props.isRTL === "rtl" ? "alertrtl-content" : ""),
            buttons: [{
                label: this.props.t('btnnames.yes'),
                onClick: () => {
                    this.setState({ loading:true});
                    submitSets(submitCollection.storeProductDelete, prod, true, null, true).then(resp => {
                        this.setState({ loading:false});
                        if(resp && resp.status){
                            alertService.success(this.props.t("SUCCESSFULLY_DELETED"));
                            
                            if(this.state.ftablebody.length!==1){
                                this.handleTableSearch();
                            } else{
                                this.resetSearch();
                            }

                        }
                        else{
                            // alertService.error((resp&&resp.msg?resp.msg:resp&&resp.extra?resp.extra:this.props.t('ERROR_OCCURRED')));
                        }
                    });
                    return false;
                }
                
            }, {
                label: this.props.t('btnnames.no'),
                onClick: () => {
                    
                    return false;
                }
            }]
        });
    }

    //image preview
    setImagePreviewProduct = (id) =>{
        if(id){
            this.setState({imgPreviewProductId:id},()=>{
                this.handlePreviewModal();
            });
        }
    }

    handlePreviewModal = () =>{
        this.setState({showPreviewImageModal:!this.state.showPreviewImageModal});
    }

    filterProdSelect = (searchName) => {

        if(searchName && searchName !== "" && searchName !== null ){
            this.setState({noOptionMsg:"Loading",productsList:[]})

            clearTimeout(this.timeoutId);
              
            this.timeoutId = setTimeout(() => {
                this.loadAllProducts(searchName)
            }, 300);
        }else{
            
            this.setState({noOptionMsg:"No Results"})
        }
    }

    emptyList = () => {
        this.setState({productsList:[], noOptionMsg:"No Results"})
    }
    
    render(){
        let actual_status_list = { 
            Empty: this.props.t("SENSITIVITY_STATUS.empty"), 
            Half: this.props.t("SENSITIVITY_STATUS.half"), 
            Full: this.props.t("SENSITIVITY_STATUS.full")
        }
        
        var cpcount = (this.state.sobj.maxResult ? this.state.sobj.maxResult : this.state.defaultPageCount);
        var ptotalresults = (this.state.totalresults?this.state.totalresults:0);
        var pstartcount = (this.state.currentPage > 1?((cpcount * (this.state.currentPage - 1))):1);
        var pendcount = (ptotalresults > (cpcount * this.state.currentPage)?((cpcount * this.state.currentPage)):ptotalresults);


        return(
            <Col xs={12} className={"main-content store-products "+(this.props.isRTL==="rtl"?"RTL":"")} dir={this.props.isRTL}>
                <div>
                <Row>
                    <MDSidebarMenu />
                    <Col xs={12} lg={10}>
                      <Breadcrumb dir="ltr">
                        {this.props.isRTL==="rtl"?<>
                          <Breadcrumb.Item active>{this.props.t('STORE_PRODUCTS')}</Breadcrumb.Item>
                            <li className="breadcrumb-item"><Link to={"/"+this.props.HomePageVal} role="button">{this.props.t('home')}</Link></li>
                        </>:<>
                          <li className="breadcrumb-item"><Link to={"/"+this.props.HomePageVal} role="button">{this.props.t('home')}</Link></li>
                          <Breadcrumb.Item active>{this.props.t('STORE_PRODUCTS')}</Breadcrumb.Item>
                        </>}
                      </Breadcrumb> 

                      <Col className="white-container" xs={12}>
                        <h6 className='current-store-text'>{this.props.t("store_products_currently_view_txt")} <b>{this.state.selectedStoreName}</b></h6>
                        <Col xs={12} className="custom-filters form-inline">
                            <Button type="submit" className="highlight-btn" variant="success" size="sm" onClick={this.handleNewLink}>{this.props.t('btnnames.addnew')}</Button>
                            <label className="filter-label">{this.props.t('btnnames.search')}</label>
                            <Form.Control placeholder={this.props.t('barcode')+", "+this.props.t('productname')} value={this.state.sobj.searchValue} onChange={e => this.handleFilterObject(e,"searchValue","change",this.props.t('Character.search_text'))} onKeyUp={e => this.handleFilterObject(e,"searchValue","enter")} style={{width:"250px"}}  onKeyDown={(e)=>preventinputToString(e,this.state.sobj.searchValue,(this.props.t('Character.search_text')))}/>
                            <Button type="button" variant="warning" className="search-link filter-btn" onClick={e => this.handleFilterObject(e,"null","click")}>{this.props.t('btnnames.search')}</Button>
                            <Button type="button" variant="outline-secondary" className="filter-btn" onClick={this.resetSearch}>{this.props.t('btnnames.reset')}</Button>
                        </Col>

                        <Col className='table-section' xs={12}>
                            {
                                (this.state.ftablebody.length>0)?
                                    <Table striped bordered hover className='filter-table'>
                                        <thead>
                                            <tr>
                                                <th style={{width:"60px"}}>{this.props.t("img")}</th>
                                                <th style={{width:"90px"}}>{this.props.t("barcode")}</th>
                                                <th style={{width:"220px"}}>{this.props.t("productname")}</th>
                                                <th style={{width:"90px"}}>{this.props.t("department")}</th>
                                                <th style={{width:"140px",textAlign:"center"}}>{this.props.t("sensitiveValue")}</th>
                                                <th style={{width:"160px"}}>{this.props.t("updateSensitiveValue")}</th>
                                                <th style={{width:"120px"}}>{this.props.t("actualStoreState")}</th>
                                                <th style={{width:"35px"}}></th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {this.state.ftablebody.map((prod, i) =>{
                                                return <React.Fragment  key={i}>
                                                    <tr>
                                                        <td className='center'>
                                                            <div className='img'>
                                                            {prod.imageUrl ?<Image onClick={()=>this.setImagePreviewProduct(prod.productId)} src={prod.imageUrl} className="img-resize-ver" /> :<></>}
                                                            </div>
                                                        </td>
                                                        <td>{prod.barcode}</td>
                                                        <td>{prod.productName}</td>
                                                        <td>{prod.departmentName ? prod.departmentName : "-"}</td>
                                                        <td className='center'>{prod.OosSensitiveValue}</td>
                                                        <td className='values'>
                                                            <InputGroup>
                                                                <Form.Control 
                                                                // type="number"
                                                                type="text" pattern="\d*"
                                                                 value={prod.updatedSensitiveValue} onChange={(e)=>this.changeTableSesitiveValue(i,e.target.value)} onKeyDown={(e)=>{preventinputotherthannumbers(e,prod.updatedSensitiveValue,(this.props.t('Character.sensitivity')))}}/>
                                                                <Button variant="outline-secondary" onClick={()=>this.handleClickSensitiveUpdate(prod,i)}>{this.props.t('btnnames.update')}</Button>
                                                            </InputGroup>
                                                      
                                                        </td>
                                                        <td className='select-dropdown'>
                                                            <select className='form-control' value={prod.OosActualStoreStatus} onChange={(e)=>this.changeTableActualStore(i,e.target.value)}>
                                                                <option value={"Empty"}>{this.props.t("SENSITIVITY_STATUS.empty")}</option>
                                                                <option value={"Half"}>{this.props.t("SENSITIVITY_STATUS.half")}</option>
                                                                <option value={"Full"}>{this.props.t("SENSITIVITY_STATUS.full")}</option>
                                                            </select>
                                                        </td>
                                                        <td className='delete'><span onClick={()=>this.deleteProduct(prod)}><XIcon size={20} /></span></td>
                                                    </tr>
                                                    </React.Fragment>
                                                })}
                                        </tbody>

                                </Table>
                            :this.state.isdataloaded?<>
                                <AcNoDataView />
                            </>:<></>}

                            {/* <Col className='no-data-col' xs={12}>{this.props.t("NO_DATA")}</Col> */}

                            {this.state.ftablebody.length > 0 ? <>
                                <Badge bg="light" className="filtertable-showttxt" style={{color:"#142a33"}}>
                                    {this.props.isRTL===""?<>{this.props.t("results")} {ptotalresults} {this.props.t("of")} {pendcount} {this.props.t("to")} {pstartcount} {this.props.t("showing")}</>:<>{this.props.t("showing")} {pstartcount} {this.props.t("to")} {pendcount} {this.props.t("of")} {ptotalresults} {this.props.t("results")}</>}
                                </Badge>
                                <Pagination>
                                    <Pagination.Item onClick={() => this.setPage(1, true)} disabled={(this.state.currentPage === 1 ? true : false)}><ChevronLeftIcon /><ChevronLeftIcon /></Pagination.Item>
                                    <Pagination.Item onClick={() => this.setPage((this.state.currentPage - 1), true)} disabled={(this.state.currentPage === 1 ? true : false)}><ChevronLeftIcon /></Pagination.Item>
                                    <label>{this.state.currentPage} / {(this.state.totalPages ? this.state.totalPages : 0)}</label>
                                    <Pagination.Item onClick={() => this.setPage((this.state.currentPage + 1), true)} disabled={(this.state.currentPage === this.state.totalPages ? true : false)}><ChevronRightIcon /></Pagination.Item>
                                    <Pagination.Item onClick={() => this.setPage(this.state.totalPages, true)} disabled={(this.state.currentPage === this.state.totalPages ? true : false)}><ChevronRightIcon /><ChevronRightIcon /></Pagination.Item>
                                </Pagination>

                            </> : <></>}
                        </Col>


                      </Col>
                      
                    </Col>
                    
                </Row>
            </div>

            <Modal show={this.state.showAddModal} className="store-product-adding-modal " dir={this.props.isRTL} onHide={this.toggleAddinfModal}  backdrop="static">
                <Modal.Header>
                    <Modal.Title style={{fontSize:"22px",fontWeight:"700"}}>{this.props.t('Add_Store_Product')}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                   <Form.Group style={{marginBottom:"18px"}}>
                        <label>{this.props.t("SELECT_PRODUCT")}</label>
                        <Select 
                            options={this.state.productsList} 
                            onChange={(e) => this.handleFormDataChange("productId",e.value)}
                            onInputChange={this.filterProdSelect}
                            placeholder={this.props.t("SELECT_PRODUCT")}
                            value={this.state.productsList.filter(option => option.value === this.state.productObj.productId)}
                            classNamePrefix="searchselect-inner" maxMenuHeight={200}
                            menuPortalTarget={document.body}
                                menuPosition="fixed"
                                styles={{
                                    menuPortal: (provided) => ({ ...provided, zIndex: 9999 }),
                                    menu: (provided) => ({ ...provided, zIndex: 9999 })
                                }}
                            filterOption={() => true}
                            noOptionsMessage={() => this.state.noOptionMsg}
                            onFocus={this.emptyList}
                        />
                   </Form.Group>
                  
                   <Form.Group>
                        <AcInput eleid="OosActualStoreStatusTxt" atype="select" aid="OosActualStoreStatus" aplace={this.props.t("actualStoreState")} adefval={this.state.productObj.OosActualStoreStatus} adata={actual_status_list} aobj={this.state.productObj} avset={this.state.vobj} avalidate={[ValT.empty]}/>
                   </Form.Group>
                   <Form.Group>
                        <AcInput eleid="OosSensitiveValueTxt" atype="number" aid="OosSensitiveValue" aplace={this.props.t("sensitiveValue")} adefval={this.state.productObj.OosSensitiveValue} aobj={this.state.productObj} avset={this.state.vobj} avalidate={[ValT.empty]} restrictDecimalPoint={3} removeSpecialCharacter={true} msg={this.props.t('Character.sensitivity')} showlabel={true} t={this.props.t} isInt={true}/>
                   </Form.Group>             

                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" className={(this.props.isRTL === "rtl"?"float-right":"float-left")} disabled={(this.state.isSaveLoading===true ? true : false)} onClick={this.toggleAddinfModal} type="button" style={{borderRadius:"25px"}}>{this.props.t('btnnames.back')}</Button>
                    <Button variant="success" disabled={(this.state.isSaveLoading===true ? true : false)} onClick={this.saveProduct} className={"formview-btn "+(this.props.isRTL==="rtl"?"float-left":"float-right")} type="button" style={{borderRadius:"25px"}}>{this.props.t('btnnames.save')}</Button>       
                </Modal.Footer>
            </Modal>

            {this.state.showPreviewImageModal===true ? 
                <PreviewImage 
                    productid={this.state.imgPreviewProductId} 
                    loadfromback={true} 
                    isshow={this.state.showPreviewImageModal} 
                    isRTL={this.props.isRTL} 
                    handlePreviewModal={this.handlePreviewModal}
                    hideheaderlables={true}
                    />
                :<></>
            }

            <AcViewModal showmodal={this.state.loading} />
            </Col>
        )
    }
}

export default withTranslation()(withRouter(StoreProducts));
