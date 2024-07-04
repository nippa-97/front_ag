import { Component } from 'react';
import { withRouter,  } from 'react-router-dom';
import { withTranslation } from 'react-i18next';
import {Col, Row, Button , Modal, Breadcrumb, OverlayTrigger, Tooltip } from 'react-bootstrap';


import { submitSets } from '../../UiComponents/SubmitSets';
import { submitCollection } from '../../../_services/submit.service';
import { alertService } from '../../../_services/alert.service';
import { XIcon } from '@primer/octicons-react';
import { Icons } from '../../../assets/icons/icons';
import {  AcViewModal} from '../../UiComponents/AcImports';//AcInput, ValT,
import FeatherIcon from 'feather-icons-react';
import { confirmAlert } from 'react-confirm-alert';

const setTextValue = (txt, climit) =>{
    var limit = (climit ? climit : 50);
    if(txt){
        if (txt.length > limit) {
            var shortname = txt.substring(0, limit) + " ...";
            return shortname;
        }
        else{
            return txt;
        }
    }
    else{
        return ("N/A");
    }
}

export class UpdateData extends Component {
    _isMounted = false;
    constructor(props) {
        super(props)
        this.state = {
            loading:false,
            logObj:{},
            mainType:"",
            DataImportStatus:"None",

            //data lists
            departmentList:[],
            categoryList:[],
            subCategoryList:[],
            suppliersList:[],
            brandsList:[],
            
            //edit objects
            depObj:this.defaultDepartentObjectLoad(),
            catObj:this.defaultCategoryObjectLoad(),
            subCatObj:this.defaultSubCategoryObjectLoad(),
            brandObj:this.defaultBrandObjLoad(),
            supObj:this.defaultSupplierObjLoad(),
            prodObj:this.defaultProductObjLoad(),
            
            //modals
            showDepartmentModal:false,
            showCategoryModal:false,
            showSubcategoryModal:false,
            showBrandModal:false,
            showSupplierModal:false,
            showProductModal:false,
            
            showdepiconmodal:false,
            selectedIcon:{departmentIconId:0,departmentIconName:"DEP_DEFAULT"},

        }
    }

    componentDidMount(){
        this._isMounted = true;
        if(this._isMounted){
            if(this.props.updateObj){
                let cobj = this.props.updateObj;
                this.setState({logObj:cobj, loading:true});
                
                if(cobj.logType==="Department"){
                    this.loadSpecificDepartment(cobj.referenceId, cobj.logId);
                }
                else if(cobj.logType==="Category"){
                    this.loadSpecificCategory(cobj.referenceId, cobj.logId);
                }
                else if(cobj.logType==="SubCategory"){
                    this.loadSpecificSubcategory(cobj.referenceId, cobj.logId);
                }
                else if(cobj.logType==="Brand"){
                    this.loadSpecificBrand(cobj.referenceId, cobj.logId);
                }
                else if(cobj.logType==="Supplier"){
                    this.loadSpecificSupplier(cobj.referenceId, cobj.logId);
                }
                else if(cobj.logType==="Product"){
                    this.loadSpecificProduct(cobj.referenceId, cobj.logId);
                }
                else{
                    this.setState({loading:false});
                }
            }
            else{
                this.props.toggleUpdateDataModal();
            }
        }
    }

    componentWillUnmount(){
        this._isMounted = false;
    }

    defaultDepartentObjectLoad = () => {
        return {name: "", color: "#ccc",importName:"", importStatus:"None",isImportChangeApprove:false, departmentIconId:"",departmentIconName:"DEP_DEFAULT"};
    }

    defaultCategoryObjectLoad = () => {
        return {
            id: -1,
            categoryName: "",
            isDelete: false,
            isNew: true,
            subCategory: [],
            color:"#ccc",
        };
    }

    defaultSubCategoryObjectLoad = () =>{
        return  {
            categoryId: 0,
            color: "#ccc",
            isDelete: false,
            isNew: true,
            subCategoryId: 0,
            subCategoryName: "",
        }
    }

    defaultBrandObjLoad = () =>{
        return {brandId: -1, brandName:"", color:"#999999", supplierId:-1,supplierName:"",supplierCode:""};
    }

    defaultSupplierObjLoad = () =>{
        return {supplierId: -1,supplierName:"",supplierCode:"",};
    }

    defaultProductObjLoad = () =>{
        return {productId: -1,productName:"",subCategoryId:-1,brandId:-1};
    }

    toggleUpdateModals = (type,show) => {
        this.setState({[type]:show});
    }

    initIconChangeModal = () => {
        let temobj = JSON.parse(JSON.stringify(this.state.depObj));
        let obj = {departmentIconId : temobj.departmentIconId, departmentIconName : temobj.departmentIconName};
        this.setState({selectedIcon:obj});
        this.toggleDepartmentIconsModal();
    }
    handleIconSelect = (citem) =>{
        this.setState({selectedIcon:citem});
    }
    changeIcon = () =>{
        let temobj = this.state.depObj;
        temobj.departmentIconName = this.state.selectedIcon.departmentIconName;
        temobj.departmentIconId = this.state.selectedIcon.departmentIconId;
        this.toggleDepartmentIconsModal();
    }
    toggleDepartmentIconsModal = () =>{
        this.setState({showdepiconmodal: !this.state.showdepiconmodal});
    }

    handleUseSugNameSwitchChanges = (type,key, val)=>{
        let cobj = this.state[type];
        cobj[key] = val;
        this.setState({[type]:cobj});
    }

    //load,save methods
    //department
    loadSpecificDepartment = (depid, logid) =>{
        submitSets(submitCollection.findDepatByID, ("?departmentId="+depid+"&catelogId="+logid), true, null, true).then(resp => {
            if(resp && resp.status){
                let cobj = JSON.parse(JSON.stringify(resp.extra));
                
                cobj.catelogId = logid;

                if(cobj.importStatus==="None"){
                    cobj.importStatus = (this.state.logObj.updateStatus? this.state.logObj.updateStatus :"None");
                }
                else{
                    cobj.isImportChangeApprove = true;
                }
                
                this.setState({depObj:cobj, loading:false});
                this.toggleUpdateModals("showDepartmentModal",true);
            }
            else{
                // alertService.error((resp&&resp.msg?resp.msg:resp&&resp.extra?resp.extra:this.props.t('ERROR_OCCURRED')));
                this.props.toggleUpdateDataModal();
            }
        });
    }

    saveDepartments = () =>{
        let sobj = this.state.depObj;
        let msg = (sobj.isImportChangeApprove===true? this.props.t("APPROVE_CHANGES_AVL_MSG"):this.props.t("APPROVE_CHANGES_NOTAVL_MSG"));
        confirmAlert({
            title: this.props.t("CONFIRM_TO_SUBMIT"),
            message: msg,
            overlayClassName: (this.props.isRTL === "rtl" ? "alertrtl-content" : ""),
            buttons: [{
                label: this.props.t('btnnames.yes'),
                onClick: () => {
                    this.setState({ loading:true});
                    submitSets(submitCollection.approveDepartmentImportUpdate, sobj, true, null, true).then(resp => {
                        this.setState({ loading:false});
                        if(resp && resp.status){
                            alertService.success(this.props.t("succussfuly")+" " +this.props.t("saved"));
                            this.props.loadAllDepartments();
                            this.props.mainSearch();
                            this.props.toggleUpdateDataModal();
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

    //category
    loadSpecificCategory = (cid, logid) =>{
        submitSets(submitCollection.findCategoryById, "?categoryId="+cid+"&catelogId="+logid,true, null, true).then(resp => {
            if(resp && resp.status){
                let cobj = JSON.parse(JSON.stringify(resp.extra));
                cobj.catelogId = logid;
               
                if(cobj.importStatus!=="None"){
                    cobj.isImportNameChangeApprove = false;
                    cobj.isImportDepartmentChangeApprove = false;
                }

                if(cobj.importStatus==="None"){
                    cobj.importStatus = (this.state.logObj.updateStatus? this.state.logObj.updateStatus :"None");
                }
                else if(cobj.importStatus==="ReferenceAndDataUpdate"){
                    cobj.isImportNameChangeApprove = true;
                    cobj.isImportDepartmentChangeApprove = true;
                }
                else if(cobj.importStatus==="DataUpdatePending"){
                    cobj.isImportNameChangeApprove = true;
                    cobj.isImportDepartmentChangeApprove = false;
                }
                else if(cobj.importStatus==="ReferenceUpdatePending"){
                    cobj.isImportNameChangeApprove = false;
                    cobj.isImportDepartmentChangeApprove = true;
                }

                this.setState({catObj:cobj, loading:false});
                this.toggleUpdateModals("showCategoryModal",true);
            }
            else{
                // alertService.error((resp&&resp.msg?resp.msg:resp&&resp.extra?resp.extra:this.props.t('ERROR_OCCURRED')));
                this.props.toggleUpdateDataModal();
            }
        });
    }

    saveCategory = () =>{
        let sobj = this.state.catObj;
        let msg = (sobj.isImportNameChangeApprove===true || sobj.isImportDepartmentChangeApprove === true? this.props.t("APPROVE_CHANGES_AVL_MSG"):this.props.t("APPROVE_CHANGES_NOTAVL_MSG"));

        confirmAlert({
            title: this.props.t("CONFIRM_TO_SUBMIT"),
            message: msg,
            overlayClassName: (this.props.isRTL === "rtl" ? "alertrtl-content" : ""),
            buttons: [{
                label: this.props.t('btnnames.yes'),
                onClick: () => {
                    this.setState({ loading:true});
                    submitSets(submitCollection.approveCategoryImportUpdate, sobj, true, null, true).then(resp => {
                        this.setState({ loading:false});
                        if(resp && resp.status){
                            alertService.success(this.props.t("succussfuly")+" " +this.props.t("saved"));
                            this.props.mainSearch();
                            this.props.toggleUpdateDataModal();
                        }
                        else{
                            // alertService.error((resp&&resp.msg?resp.msg:resp&&resp.extra?resp.extra:this.props.t('ERROR_OCCURRED')));
                        }
                    });
                }
            }, {
                label: this.props.t('btnnames.no'),
                onClick: () => {
                    return false;
                }
            }]
        });

        
    }

    loadSpecificSubcategory = (scid, logid) =>{
        submitSets(submitCollection.findSubCategoryById, "?subCategoryId="+scid+"&catelogId="+logid,true, null, true).then(resp => {
            if(resp && resp.status){
                let cobj = JSON.parse(JSON.stringify(resp.extra));
                cobj.catelogId = logid;

                if(cobj.importStatus!=="None"){
                    cobj.isImportNameChangeApprove = false;
                    cobj.isImportCategoryChangeApprove = false;
                }

                if(cobj.importStatus==="None"){
                    cobj.importStatus = (this.state.logObj.updateStatus? this.state.logObj.updateStatus :"None");
                }
                else if(cobj.importStatus==="ReferenceAndDataUpdate"){
                    cobj.isImportNameChangeApprove = true;
                    cobj.isImportCategoryChangeApprove = true;
                }
                else if(cobj.importStatus==="DataUpdatePending"){
                    cobj.isImportNameChangeApprove = true;
                    cobj.isImportCategoryChangeApprove = false;
                }
                else if(cobj.importStatus==="ReferenceUpdatePending"){
                    cobj.isImportNameChangeApprove = false;
                    cobj.isImportCategoryChangeApprove = true;
                }
                
                this.setState({subCatObj:cobj, loading:false});
                this.toggleUpdateModals("showSubcategoryModal",true);
            }
            else{
                // alertService.error((resp&&resp.msg?resp.msg:resp&&resp.extra?resp.extra:this.props.t('ERROR_OCCURRED')));
                this.props.toggleUpdateDataModal();
            }
        });
    }

    saveSubcategory = () =>{
        let sobj = this.state.subCatObj;
        let msg = (sobj.isImportNameChangeApprove===true || sobj.isImportCategoryChangeApprove === true? this.props.t("APPROVE_CHANGES_AVL_MSG"):this.props.t("APPROVE_CHANGES_NOTAVL_MSG"));
        confirmAlert({
            title: this.props.t("CONFIRM_TO_SUBMIT"),
            message: msg,
            overlayClassName: (this.props.isRTL === "rtl" ? "alertrtl-content" : ""),
            buttons: [{
                label: this.props.t('btnnames.yes'),
                onClick: () => {
                    this.setState({ loading:true});
                    submitSets(submitCollection.approveSubCategoryImportUpdate, sobj, true, null, true).then(resp => {
                        this.setState({ loading:false});
                        if(resp && resp.status){
                            alertService.success(this.props.t("succussfuly")+" " +this.props.t("saved"));
                            this.props.mainSearch();
                            this.props.toggleUpdateDataModal();
                        }
                        else{
                            // alertService.error((resp&&resp.msg?resp.msg:resp&&resp.extra?resp.extra:this.props.t('ERROR_OCCURRED')));
                        }
                    });
                }
            }, {
                label: this.props.t('btnnames.no'),
                onClick: () => {
                    return false;
                }
            }]
        });

    }

    //brand
    loadSpecificBrand = (bid, logid) =>{
        submitSets(submitCollection.findBrandByID, "?brandId="+bid+"&catelogId="+logid, true, null, true).then(resp => {
            if(resp && resp.status){
                let cobj = JSON.parse(JSON.stringify(resp.extra));
                cobj.catelogId = logid;
                
                if(cobj.importStatus!=="None"){
                    cobj.isImportNameChangeApprove = false;
                    cobj.isImportSupplierChangeApprove = false;
                }

                if(cobj.importStatus==="None"){
                    cobj.importStatus = (this.state.logObj.updateStatus? this.state.logObj.updateStatus :"None");
                }
                else if(cobj.importStatus==="ReferenceAndDataUpdate"){
                    cobj.isImportNameChangeApprove = true;
                    cobj.isImportSupplierChangeApprove = true;
                }
                else if(cobj.importStatus==="DataUpdatePending"){
                    cobj.isImportNameChangeApprove = true;
                    cobj.isImportSupplierChangeApprove = false;
                }
                else if(cobj.importStatus==="ReferenceUpdatePending"){
                    cobj.isImportNameChangeApprove = false;
                    cobj.isImportSupplierChangeApprove = true;
                }

                this.setState({brandObj:cobj, loading:false});
                this.toggleUpdateModals("showBrandModal",true);
            }
            else{
                // alertService.error((resp&&resp.msg?resp.msg:resp&&resp.extra?resp.extra:this.props.t('ERROR_OCCURRED')));
                this.props.toggleUpdateDataModal();
            }
        });
    }

    saveBrand = () =>{
        let sobj = this.state.brandObj;
        let msg = (sobj.isImportNameChangeApprove===true || sobj.isImportSupplierChangeApprove === true? this.props.t("APPROVE_CHANGES_AVL_MSG"):this.props.t("APPROVE_CHANGES_NOTAVL_MSG"));

        confirmAlert({
            title: this.props.t("CONFIRM_TO_SUBMIT"),
            message: msg,
            overlayClassName: (this.props.isRTL === "rtl" ? "alertrtl-content" : ""),
            buttons: [{
                label: this.props.t('btnnames.yes'),
                onClick: () => {
                    this.setState({ loading:true});
                    submitSets(submitCollection.approveBrandImportUpdate, sobj, true, null, true).then(resp => {
                        this.setState({ loading:false});
                        if(resp && resp.status){
                            alertService.success(this.props.t("succussfuly")+" " +this.props.t("saved"));
                            this.props.loadBrands();
                            this.props.mainSearch();
                            this.props.toggleUpdateDataModal();
                        }
                        else{
                            // alertService.error((resp&&resp.msg?resp.msg:resp&&resp.extra?resp.extra:this.props.t('ERROR_OCCURRED')));
                        }
                    });
                }
            }, {
                label: this.props.t('btnnames.no'),
                onClick: () => {
                    return false;
                }
            }]
        });

        
    }

    //suppliers
    loadSpecificSupplier = (sid,logid) =>{
        submitSets(submitCollection.findSupplierByID, "?supplierId="+sid+"&catelogId="+logid,true, null, true).then(resp => {
            if(resp && resp.status){
                let cobj = JSON.parse(JSON.stringify(resp.extra));
                
                cobj.catelogId = logid;

                if(cobj.importStatus==="None"){
                    cobj.importStatus = (this.state.logObj.updateStatus? this.state.logObj.updateStatus :"None");
                }
                else{
                    cobj.isImportChangeApprove = true;
                }

                this.setState({supObj:cobj, loading:false});
                this.toggleUpdateModals("showSupplierModal",true);
            }
            else{
                // alertService.error((resp&&resp.msg?resp.msg:resp&&resp.extra?resp.extra:this.props.t('ERROR_OCCURRED')));
                this.props.toggleUpdateDataModal();
            }
        });
    }

    saveSupplier = () =>{
        let sobj = this.state.supObj;
        let msg = (sobj.isImportChangeApprove===true? this.props.t("APPROVE_CHANGES_AVL_MSG"):this.props.t("APPROVE_CHANGES_NOTAVL_MSG"));

        confirmAlert({
            title: this.props.t("CONFIRM_TO_SUBMIT"),
            message: msg,
            overlayClassName: (this.props.isRTL === "rtl" ? "alertrtl-content" : ""),
            buttons: [{
                label: this.props.t('btnnames.yes'),
                onClick: () => {
                    this.setState({ loading:true});
                    submitSets(submitCollection.approveSupplierImportUpdate, sobj, true, null, true).then(resp => {
                        this.setState({ loading:false});
                        if(resp && resp.status){
                            alertService.success(this.props.t("succussfuly")+" " +this.props.t("saved"));
                            this.props.toggleUpdateDataModal();
                            this.props.mainSearch();
                        }
                        else{
                            // alertService.error((resp&&resp.msg?resp.msg:resp&&resp.extra?resp.extra:this.props.t('ERROR_OCCURRED')));
                        }
                    });
                }
            }, {
                label: this.props.t('btnnames.no'),
                onClick: () => {
                    return false;
                }
            }]
        });
    }

    //product
    loadSpecificProduct = (pid,logid) =>{
        submitSets(submitCollection.findProducByIdForImportApprove, "?productId="+pid+"&catelogId="+logid, true, null, true).then(resp => {
            if(resp && resp.status){
                let cobj = JSON.parse(JSON.stringify(resp.extra));
                cobj.catelogId = logid;
                
                if(cobj.importStatus!=="None"){
                    cobj.isImportNameChangeApprove = false;
                    cobj.isImportSubCategoryChangeApprove = false;
                    cobj.isImportBrandChangeApprove = false;
                }

                if(cobj.importStatus==="None"){
                    cobj.importStatus = (this.state.logObj.updateStatus? this.state.logObj.updateStatus :"None");
                }
                else if(cobj.importStatus==="ReferenceAndDataUpdate"){
                    cobj.isImportSubCategoryChangeApprove = cobj.haveSubCategoryChange;
                    cobj.isImportBrandChangeApprove = cobj.haveBrandChange;
                    cobj.isImportNameChangeApprove = true;
                }
                else if(cobj.importStatus==="DataUpdatePending"){
                    cobj.isImportSubCategoryChangeApprove = false;
                    cobj.isImportBrandChangeApprove = false;
                    cobj.isImportNameChangeApprove = true;
                }
                else if(cobj.importStatus==="ReferenceUpdatePending"){
                    cobj.isImportSubCategoryChangeApprove = cobj.haveSubCategoryChange;
                    cobj.isImportBrandChangeApprove = cobj.haveBrandChange;
                    cobj.isImportNameChangeApprove = false;
                }
                
                this.setState({prodObj:cobj, loading:false});
                this.toggleUpdateModals("showProductModal",true);
            }
            else{
                // alertService.error((resp&&resp.msg?resp.msg:resp&&resp.extra?resp.extra:this.props.t('ERROR_OCCURRED')));
                this.props.toggleUpdateDataModal();
            }
        });
    }

    saveProduct = () =>{
        let sobj = this.state.prodObj;
        let msg = (sobj.isImportNameChangeApprove===true || sobj.isImportSubCategoryChangeApprove===true || sobj.isImportBrandChangeApprove === true ? this.props.t("APPROVE_CHANGES_AVL_MSG"):this.props.t("APPROVE_CHANGES_NOTAVL_MSG"));

        confirmAlert({
            title: this.props.t("CONFIRM_TO_SUBMIT"),
            message: msg,
            overlayClassName: (this.props.isRTL === "rtl" ? "alertrtl-content" : ""),
            buttons: [{
                label: this.props.t('btnnames.yes'),
                onClick: () => {
                    this.setState({ loading:true});
                    submitSets(submitCollection.approveProductImportUpdate, sobj, true, null, true).then(resp => {
                        this.setState({ loading:false});
                        if(resp && resp.status){
                            alertService.success(this.props.t("succussfuly")+" " +this.props.t("saved"));
                            this.props.toggleUpdateDataModal();
                            this.props.mainSearch();
                        }
                        else{
                            // alertService.error((resp&&resp.msg?resp.msg:resp&&resp.extra?resp.extra:this.props.t('ERROR_OCCURRED')));
                        }
                    });
                }
            }, {
                label: this.props.t('btnnames.no'),
                onClick: () => {
                    return false;
                }
            }]
        });
    }

    render(){
        return(
            <>
                <Modal size='lg' show={this.state.showDepartmentModal} className={"update-data-modal "+(this.props.isRTL==="rtl" ? "RTL":"LTR")} onHide={ e => { this.props.toggleUpdateDataModal() }} backdrop="static" dir={this.props.isRTL}>
                    <Modal.Header>
                        <Modal.Title>
                            <h6>{this.props.t("department")}</h6>
                            {setTextValue(this.state.depObj.name,30)}
                        </Modal.Title>
                        <button className="close-btn" onClick={ () => this.props.toggleUpdateDataModal()} ><XIcon size={20}   /></button>
                    </Modal.Header>
                    <Modal.Body>
                        <h6 className='modal-body-title'>{this.props.t("CONFLICT_TITLE")}</h6>
                        
                        <Col xs={12} className={"conflict-item "+(this.state.depObj.isImportChangeApprove===true?"approved":"")}>
                            <Row style={{margin:"0px -5px"}}>
                                <Col xs={4} className="conflict-item-sub-cols">
                                    <small>{this.props.t("CATELOG_LOG_EX_LABLES.name")}</small>
                                    <OverlayTrigger placement="bottom" overlay={<Tooltip>{setTextValue(this.state.depObj.name)}</Tooltip>}>
                                        <h6 className='name'>{setTextValue(this.state.depObj.name,150)}</h6>
                                    </OverlayTrigger>
                                </Col>
                                <Col xs={2} className="conflict-item-sub-cols icons-col arrow"><span className='icon'>{this.props.isRTL==="rtl" ?<FeatherIcon icon="arrow-left" size="22"/>:<FeatherIcon icon="arrow-right" size="22"/>}</span></Col>
                                <Col xs={4} className="conflict-item-sub-cols">
                                    <small>{this.props.t("SUGGESTED_NAME")}</small>
                                    <OverlayTrigger placement="bottom" overlay={<Tooltip>{setTextValue(this.state.depObj.importName)}</Tooltip>}>
                                        <h6 className='name'>{setTextValue(this.state.depObj.importName,150)}</h6>
                                    </OverlayTrigger>
                                </Col>
                            <Col xs={2} className={"conflict-item-sub-cols icons-col "+(this.state.logObj.logStatus==="PlanigoCompleted"?"d-none":"")}>
                                <div>
                                    <span className={'d-inline select-icon '+(this.state.depObj.isImportChangeApprove===true?"selected":"")} onClick={() => this.handleUseSugNameSwitchChanges("depObj","isImportChangeApprove",true)}><FeatherIcon icon="check" size="15"/></span>
                                    <span className={'d-inline select-icon '+(this.state.depObj.isImportChangeApprove===false?"not-selected":"")} onClick={() => this.handleUseSugNameSwitchChanges("depObj","isImportChangeApprove",false)}><FeatherIcon icon="x" size="15" /></span>
                                </div>
                            </Col>

                            </Row>
                        </Col>
                        <p className={"update-suggestion-note "+(this.state.logObj.logStatus==="PlanigoCompleted"?"d-none":"")}>
                            - {this.props.t("SUGGESTION_NOTE.first")}<br/>
                            - {this.props.t("SUGGESTION_NOTE.second")}<br/>
                            - {this.props.t("SUGGESTION_NOTE.third")}
                        </p>
                        
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant='secondary' className='reset' onClick={()=>this.props.toggleUpdateDataModal()}>{this.props.t('btnnames.close')}</Button>
                        <Button variant='success' className={(this.state.logObj.logStatus==="PlanigoCompleted"?"d-none":"")} onClick={()=>this.saveDepartments()}>{this.props.t('btnnames.save')}</Button>
                    </Modal.Footer>
                </Modal>

                <Modal show={this.state.showdepiconmodal} className="icons-view adding-modal " dir={this.props.isRTL} onHide={this.toggleDepartmentIconsModal}>
                    <Modal.Header>
                        <Modal.Title style={{fontSize:"22px",fontWeight:"700"}}>{this.props.t('selecticon')}</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <Col className="formcontrol-main">
                            <Row className="main-icons-col">
                                {  
                                    this.props.departmentIconsShowList.map((citem,index)=>{
                                        return(
                                            <Col xs={2} key={index} className="main-icons-item">
                                                <Col xs={12} className={"main-icons-item-inner "+(this.state.selectedIcon.departmentIconName === citem.departmentIconName ?" active " :"")} onClick={()=>this.handleIconSelect(citem)}>
                                                    {
                                                        this.state.selectedIcon.departmentIconName === citem.departmentIconName ?
                                                        Icons.DepIconsLoad(citem.departmentIconName, {size:40, color:"#FFF"}):
                                                        Icons.DepIconsLoad(citem.departmentIconName, {size:40, color:"#AF7AC5"})
                                                    }
                                                </Col>
                                            </Col>
                                        )
                                    })
                                }
                            </Row>
                        </Col>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={this.toggleDepartmentIconsModal} type="button" style={{borderRadius:"25px"}}>{this.props.t('btnnames.back')}</Button>
                        <Button variant="success" className={"formview-btn "+(this.props.isRTL==="rtl"?"float-left":"float-right")} onClick={this.changeIcon} type="button" style={{borderRadius:"25px"}}>{this.props.t('btnnames.change')}</Button>       
                    </Modal.Footer>
                </Modal>

                <Modal size="lg" show={this.state.showCategoryModal} className={"update-data-modal "+(this.props.isRTL==="rtl" ? "RTL":"LTR")} onHide={ e => { this.props.toggleUpdateDataModal() }} backdrop="static" dir={this.props.isRTL}>
                    <Modal.Header>
                        <Modal.Title>
                            <h6>{this.props.t("category")}</h6>
                            {setTextValue(this.state.catObj.categoryName,150)}
                            
                            <Breadcrumb>
                                <Breadcrumb.Item active>{setTextValue(this.state.catObj.departmentName,150)}</Breadcrumb.Item>
                            </Breadcrumb>

                        </Modal.Title>
                        <button className="close-btn" onClick={ () => this.props.toggleUpdateDataModal()} ><XIcon size={20}   /></button>
                    </Modal.Header>
                    <Modal.Body>
                        <h6 className='modal-body-title'>{this.props.t("CONFLICT_TITLE")}</h6>
                        
                        <Col xs={12} className={"conflict-item "+(this.state.catObj.importStatus==="ReferenceUpdatePending" || this.state.catObj.importStatus==="ReferenceAndDataUpdate" ?"":" d-none ")+(this.state.catObj.isImportDepartmentChangeApprove===true?" approved ":"")}>
                            <Row style={{margin:"0px -5px"}}>
                                <Col xs={4} className="conflict-item-sub-cols">
                                    <small>{this.props.t("CATELOG_LOG_EX_LABLES.department")}</small>
                                    <OverlayTrigger placement="bottom" overlay={<Tooltip>{setTextValue(this.state.catObj.departmentName)}</Tooltip>}>
                                        <h6 className='name'>{setTextValue(this.state.catObj.departmentName,150)}</h6>
                                    </OverlayTrigger>
                                </Col>
                                <Col xs={2} className="conflict-item-sub-cols icons-col arrow"><span className='icon'>{this.props.isRTL==="rtl" ?<FeatherIcon icon="arrow-left" size="22"/>:<FeatherIcon icon="arrow-right" size="22"/>}</span></Col>
                                <Col xs={4} className="conflict-item-sub-cols">
                                    <small>{this.props.t("SUGGESTED_DEPARTMENT")}</small>
                                    <OverlayTrigger placement="bottom" overlay={<Tooltip>{(this.state.catObj.importDepartmentId<0 ? setTextValue(this.state.catObj.importDepartmentRefName) : setTextValue(this.state.catObj.importDepartmentName))}</Tooltip>}>
                                        <h6 className='name'>{(this.state.catObj.importDepartmentId<0 ? setTextValue(this.state.catObj.importDepartmentRefName,150) : setTextValue(this.state.catObj.importDepartmentName,150))}</h6>
                                    </OverlayTrigger>
                                </Col>
                            <Col xs={2} className={"conflict-item-sub-cols icons-col "+(this.state.logObj.logStatus==="PlanigoCompleted"?"d-none":"")}>
                                <div>
                                    <span className={'d-inline select-icon '+(this.state.catObj.isImportDepartmentChangeApprove===true?"selected":"")} onClick={() => this.handleUseSugNameSwitchChanges("catObj","isImportDepartmentChangeApprove",true)}><FeatherIcon icon="check" size="15"/></span>
                                    <span className={'d-inline select-icon '+(this.state.catObj.isImportDepartmentChangeApprove===false?"not-selected":"")} onClick={() => this.handleUseSugNameSwitchChanges("catObj","isImportDepartmentChangeApprove",false)}><FeatherIcon icon="x" size="15" /></span>
                                </div>
                            </Col>

                            </Row>
                        </Col>

                        <Col xs={12} className={"conflict-item "+(this.state.catObj.importStatus==="DataUpdatePending" || this.state.catObj.importStatus==="ReferenceAndDataUpdate" ?"":" d-none ")+(this.state.catObj.isImportNameChangeApprove===true?" approved ":"")}>
                            <Row style={{margin:"0px -5px"}}>
                                <Col xs={4} className="conflict-item-sub-cols">
                                    <small>{this.props.t("CATELOG_LOG_EX_LABLES.name")}</small>
                                    <h6 className='name'>{setTextValue(this.state.catObj.categoryName,150)}</h6>
                                </Col>
                                <Col xs={2} className="conflict-item-sub-cols icons-col arrow"><span className='icon'>{this.props.isRTL==="rtl" ?<FeatherIcon icon="arrow-left" size="22"/>:<FeatherIcon icon="arrow-right" size="22"/>}</span></Col>
                                <Col xs={4} className="conflict-item-sub-cols">
                                    <small>{this.props.t("SUGGESTED_NAME")}</small>
                                    <h6 className='name'>{setTextValue(this.state.catObj.importName,150)}</h6>
                                </Col>
                            <Col xs={2} className={"conflict-item-sub-cols icons-col "+(this.state.logObj.logStatus==="PlanigoCompleted"?"d-none":"")}>
                                <div>
                                    <span className={'d-inline select-icon '+(this.state.catObj.isImportNameChangeApprove===true?"selected":"")} onClick={() => this.handleUseSugNameSwitchChanges("catObj","isImportNameChangeApprove",true)}><FeatherIcon icon="check" size="15"/></span>
                                    <span className={'d-inline select-icon '+(this.state.catObj.isImportNameChangeApprove===false?"not-selected":"")} onClick={() => this.handleUseSugNameSwitchChanges("catObj","isImportNameChangeApprove",false)}><FeatherIcon icon="x" size="15" /></span>
                                </div>
                            </Col>

                            </Row>
                        </Col>

                        <p className={"update-suggestion-note "+(this.state.logObj.logStatus==="PlanigoCompleted"?"d-none":"")}>
                            - {this.props.t("SUGGESTION_NOTE.first")}<br/>
                            - {this.props.t("SUGGESTION_NOTE.second")}<br/>
                            - {this.props.t("SUGGESTION_NOTE.third")}
                        </p>
                        
                    </Modal.Body>
                    <Modal.Footer >
                        <Button variant='secondary' className='reset' onClick={()=>this.props.toggleUpdateDataModal()}>{this.props.t('btnnames.close')}</Button>
                        <Button variant='success' className={(this.state.logObj.logStatus==="PlanigoCompleted"?"d-none":"")} onClick={()=>this.saveCategory()}>{this.props.t('btnnames.save')}</Button>
                    </Modal.Footer>
                </Modal>

                <Modal size="lg" show={this.state.showSubcategoryModal} className={"update-data-modal "+(this.props.isRTL==="rtl" ? "RTL":"LTR")} onHide={ e => { this.props.toggleUpdateDataModal() }} backdrop="static" dir={this.props.isRTL}>
                    <Modal.Header>
                        <Modal.Title>
                            <h6>{this.props.t("subcategory")}</h6>
                            {setTextValue(this.state.subCatObj.subCategoryName,25)}
                            {
                                this.props.isRTL=== "rtl"?
                                <Breadcrumb>
                                    <Breadcrumb.Item active>{setTextValue(this.state.subCatObj.categoryName,100)}</Breadcrumb.Item>
                                    <Breadcrumb.Item active>{setTextValue(this.state.subCatObj.departmentName,100)}</Breadcrumb.Item>
                                </Breadcrumb>
                                :
                                <Breadcrumb>
                                    <Breadcrumb.Item active>{setTextValue(this.state.subCatObj.departmentName,100)}</Breadcrumb.Item>
                                    <Breadcrumb.Item active>{setTextValue(this.state.subCatObj.categoryName,100)}</Breadcrumb.Item>
                                </Breadcrumb>
                            }
                           
                        </Modal.Title>
                        <button className="close-btn" onClick={ () => this.props.toggleUpdateDataModal()} ><XIcon size={20}   /></button>

                    </Modal.Header>
                    <Modal.Body>
                        <h6 className='modal-body-title'>{this.props.t("CONFLICT_TITLE")}</h6>
                        
                        <Col xs={12} className={"conflict-item "+(this.state.subCatObj.importStatus==="ReferenceUpdatePending" || this.state.subCatObj.importStatus==="ReferenceAndDataUpdate" ?"":"d-none")+(this.state.subCatObj.isImportCategoryChangeApprove===true?" approved ":"")}>
                            <Row style={{margin:"0px -5px"}}>
                                <Col xs={4} className="conflict-item-sub-cols">
                                    <small>{this.props.t("CATELOG_LOG_EX_LABLES.category")}</small>
                                    <OverlayTrigger placement="bottom" overlay={<Tooltip>{setTextValue(this.state.subCatObj.categoryName)}</Tooltip>}>
                                        <h6 className='name'>{setTextValue(this.state.subCatObj.categoryName,100)}</h6>
                                    </OverlayTrigger>
                                </Col>
                                <Col xs={2} className="conflict-item-sub-cols icons-col arrow"><span className='icon'>{this.props.isRTL==="rtl" ?<FeatherIcon icon="arrow-left" size="22"/>:<FeatherIcon icon="arrow-right" size="22"/>}</span></Col>
                                <Col xs={4} className="conflict-item-sub-cols">
                                    <small>{this.props.t("SUGGESTED_CATEGORY")}</small>
                                    <OverlayTrigger placement="bottom" overlay={<Tooltip>{(this.state.subCatObj.importCategoryId<0 ? setTextValue(this.state.subCatObj.importCategoryRefName) : setTextValue(this.state.subCatObj.importCategoryName))}</Tooltip>}>
                                        <h6 className='name'>{(this.state.subCatObj.importCategoryId<0 ? setTextValue(this.state.subCatObj.importCategoryRefName,150) : setTextValue(this.state.subCatObj.importCategoryName,150))}</h6>
                                    </OverlayTrigger>
                                </Col>
                            <Col xs={2} className={"conflict-item-sub-cols icons-col "+(this.state.logObj.logStatus==="PlanigoCompleted"?"d-none":"") }>
                                <div>
                                    <span className={'d-inline select-icon '+(this.state.subCatObj.isImportCategoryChangeApprove===true?"selected":"")} onClick={() => this.handleUseSugNameSwitchChanges("subCatObj","isImportCategoryChangeApprove",true)}><FeatherIcon icon="check" size="15"/></span>
                                    <span className={'d-inline select-icon '+(this.state.subCatObj.isImportCategoryChangeApprove===false?"not-selected":"")} onClick={() => this.handleUseSugNameSwitchChanges("subCatObj","isImportCategoryChangeApprove",false)}><FeatherIcon icon="x" size="15" /></span>
                                </div>
                            </Col>

                            </Row>
                        </Col>

                        <Col xs={12} className={"conflict-item "+(this.state.subCatObj.importStatus==="DataUpdatePending" || this.state.subCatObj.importStatus==="ReferenceAndDataUpdate" ?"":"d-none")+(this.state.subCatObj.isImportNameChangeApprove===true?" approved ":"")}>
                            <Row style={{margin:"0px -5px"}}>
                                <Col xs={4} className="conflict-item-sub-cols">
                                    <small>{this.props.t("CATELOG_LOG_EX_LABLES.name")}</small>
                                    <OverlayTrigger placement="bottom" overlay={<Tooltip>{setTextValue(this.state.subCatObj.subCategoryName)}</Tooltip>}>
                                        <h6 className='name'>{setTextValue(this.state.subCatObj.subCategoryName,150)}</h6>
                                    </OverlayTrigger>
                                </Col>
                                <Col xs={2} className="conflict-item-sub-cols icons-col arrow"><span className='icon'>{this.props.isRTL==="rtl" ?<FeatherIcon icon="arrow-left" size="22"/>:<FeatherIcon icon="arrow-right" size="22"/>}</span></Col>
                                <Col xs={4} className="conflict-item-sub-cols">
                                    <small>{this.props.t("SUGGESTED_NAME")}</small>
                                    <OverlayTrigger placement="bottom" overlay={<Tooltip>{setTextValue(this.state.subCatObj.importName)}</Tooltip>}>
                                        <h6 className='name'>{setTextValue(this.state.subCatObj.importName,150)}</h6>
                                    </OverlayTrigger>
                                </Col>
                            <Col xs={2} className={"conflict-item-sub-cols icons-col "+(this.state.logObj.logStatus==="PlanigoCompleted"?"d-none":"")}>
                                <div>
                                    <span className={'d-inline select-icon '+(this.state.subCatObj.isImportNameChangeApprove===true?"selected":"")} onClick={() => this.handleUseSugNameSwitchChanges("subCatObj","isImportNameChangeApprove",true)}><FeatherIcon icon="check" size="15"/></span>
                                    <span className={'d-inline select-icon '+(this.state.subCatObj.isImportNameChangeApprove===false?"not-selected":"")} onClick={() => this.handleUseSugNameSwitchChanges("subCatObj","isImportNameChangeApprove",false)}><FeatherIcon icon="x" size="15" /></span>
                                </div>
                            </Col>

                            </Row>
                        </Col>

                        <p className={"update-suggestion-note "+(this.state.logObj.logStatus==="PlanigoCompleted"?"d-none":"")}>
                            - {this.props.t("SUGGESTION_NOTE.first")}<br/>
                            - {this.props.t("SUGGESTION_NOTE.second")}<br/>
                            - {this.props.t("SUGGESTION_NOTE.third")}
                        </p>
                        
                    </Modal.Body>
                    <Modal.Footer >
                        <Button variant='secondary' className='reset' onClick={()=>this.props.toggleUpdateDataModal()}>{this.props.t('btnnames.close')}</Button>
                        <Button variant='success' className={(this.state.logObj.logStatus==="PlanigoCompleted"?"d-none":"")} onClick={()=>this.saveSubcategory()}>{this.props.t('btnnames.save')}</Button>
                    </Modal.Footer>
                </Modal>

                <Modal size="lg" show={this.state.showBrandModal} className={"update-data-modal "+(this.props.isRTL==="rtl" ? "RTL":"LTR")} onHide={ e => { this.props.toggleUpdateDataModal() }} backdrop="static" dir={this.props.isRTL}>
                    <Modal.Header>
                        <Modal.Title>
                            <h6>{this.props.t("brand")}</h6>
                            {setTextValue(this.state.brandObj.brandName,150)}
                            <Breadcrumb>
                                <Breadcrumb.Item active>{setTextValue(this.state.brandObj.supplierName,150)}</Breadcrumb.Item>
                            </Breadcrumb>
                        </Modal.Title>
                        <button className="close-btn" onClick={ () => this.props.toggleUpdateDataModal()} ><XIcon size={20}   /></button>
                    </Modal.Header>
                    <Modal.Body>
                        <h6 className='modal-body-title'>{this.props.t("CONFLICT_TITLE")}</h6>

                        <Col xs={12} className={"conflict-item "+(this.state.brandObj.importStatus==="DataUpdatePending" || this.state.brandObj.importStatus==="ReferenceAndDataUpdate" ?"":"d-none")+(this.state.brandObj.isImportNameChangeApprove===true?" approved ":"")}>
                            <Row style={{margin:"0px -5px"}}>
                                <Col xs={4} className="conflict-item-sub-cols">
                                    <small>{this.props.t("CATELOG_LOG_EX_LABLES.name")}</small>
                                    <OverlayTrigger placement="bottom" overlay={<Tooltip>{setTextValue(this.state.brandObj.brandName)}</Tooltip>}>
                                        <h6 className='name'>{setTextValue(this.state.brandObj.brandName,150)}</h6>
                                    </OverlayTrigger>
                                </Col>
                                <Col xs={2} className="conflict-item-sub-cols icons-col arrow"><span className='icon'>{this.props.isRTL==="rtl" ?<FeatherIcon icon="arrow-left" size="22"/>:<FeatherIcon icon="arrow-right" size="22"/>}</span></Col>
                                <Col xs={4} className="conflict-item-sub-cols">
                                    <small>{this.props.t("SUGGESTED_NAME")}</small>
                                    <OverlayTrigger placement="bottom" overlay={<Tooltip>{setTextValue(this.state.brandObj.importName)}</Tooltip>}>
                                        <h6 className='name'>{setTextValue(this.state.brandObj.importName,150)}</h6>
                                    </OverlayTrigger>
                                </Col>
                            <Col xs={2} className={"conflict-item-sub-cols icons-col "+(this.state.logObj.logStatus==="PlanigoCompleted"?"d-none":"")}>
                                <div>
                                    <span className={'d-inline select-icon '+(this.state.brandObj.isImportNameChangeApprove===true?"selected":"")} onClick={() => this.handleUseSugNameSwitchChanges("brandObj","isImportNameChangeApprove",true)}><FeatherIcon icon="check" size="15"/></span>
                                    <span className={'d-inline select-icon '+(this.state.brandObj.isImportNameChangeApprove===false?"not-selected":"")} onClick={() => this.handleUseSugNameSwitchChanges("brandObj","isImportNameChangeApprove",false)}><FeatherIcon icon="x" size="15" /></span>
                                </div>
                            </Col>

                            </Row>
                        </Col>

                        <Col xs={12} className={"conflict-item "+(this.state.brandObj.importStatus==="ReferenceUpdatePending" || this.state.brandObj.importStatus==="ReferenceAndDataUpdate" ?"":"d-none")+(this.state.brandObj.isImportSupplierChangeApprove===true?" approved ":"")}>
                            <Row style={{margin:"0px -5px"}}>
                                <Col xs={4} className="conflict-item-sub-cols">
                                    <small>{this.props.t("CATELOG_LOG_EX_LABLES.supplier")}</small>
                                    <OverlayTrigger placement="bottom" overlay={<Tooltip>{setTextValue(this.state.brandObj.supplierName)}</Tooltip>}>
                                        <h6 className='name'>{setTextValue(this.state.brandObj.supplierName,100)}</h6>
                                    </OverlayTrigger>
                                </Col>
                                <Col xs={2} className="conflict-item-sub-cols icons-col arrow"><span className='icon'>{this.props.isRTL==="rtl" ?<FeatherIcon icon="arrow-left" size="22"/>:<FeatherIcon icon="arrow-right" size="22"/>}</span></Col>
                                <Col xs={4} className="conflict-item-sub-cols">
                                    <small>{this.props.t("SUGGESTED_SUPPLIER")}</small>
                                    <OverlayTrigger placement="bottom" overlay={<Tooltip>{this.state.brandObj.importSupplierId<0? setTextValue(this.state.brandObj.importRefSupplierName): setTextValue(this.state.brandObj.importSupplierName)}</Tooltip>}>
                                        <h6 className='name'>{this.state.brandObj.importSupplierId<0? setTextValue(this.state.brandObj.importRefSupplierName,150): setTextValue(this.state.brandObj.importSupplierName,150)}</h6>
                                    </OverlayTrigger>
                                </Col>
                            <Col xs={2} className={"conflict-item-sub-cols icons-col "+(this.state.logObj.logStatus==="PlanigoCompleted"?"d-none":"")}>
                                <div>
                                    <span className={'d-inline select-icon '+(this.state.brandObj.isImportSupplierChangeApprove===true?"selected":"")} onClick={() => this.handleUseSugNameSwitchChanges("brandObj","isImportSupplierChangeApprove",true)}><FeatherIcon icon="check" size="15"/></span>
                                    <span className={'d-inline select-icon '+(this.state.brandObj.isImportSupplierChangeApprove===false?"not-selected":"")} onClick={() => this.handleUseSugNameSwitchChanges("brandObj","isImportSupplierChangeApprove",false)}><FeatherIcon icon="x" size="15" /></span>
                                </div>
                            </Col>

                            </Row>
                        </Col>
                        
                        <p className={"update-suggestion-note "+(this.state.logObj.logStatus==="PlanigoCompleted"?"d-none":"")}>
                            - {this.props.t("SUGGESTION_NOTE.first")}<br/>
                            - {this.props.t("SUGGESTION_NOTE.second")}<br/>
                            - {this.props.t("SUGGESTION_NOTE.third")}
                        </p>

                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant='secondary' className='reset' onClick={()=>this.props.toggleUpdateDataModal()}>{this.props.t('btnnames.close')}</Button>
                        <Button variant='success' className={(this.state.logObj.logStatus==="PlanigoCompleted"?"d-none":"")} onClick={()=>this.saveBrand()}>{this.props.t('btnnames.save')}</Button>
                    </Modal.Footer>
                </Modal>

                <Modal size="lg" show={this.state.showSupplierModal} className={"update-data-modal "+(this.props.isRTL==="rtl" ? "RTL":"LTR")} onHide={ e => { this.props.toggleUpdateDataModal() }} backdrop="static" dir={this.props.isRTL}>
                    <Modal.Header>
                        <Modal.Title>
                            <h6>{this.props.t("suplable")}</h6>
                            {setTextValue(this.state.supObj.supplierName,150)}
                        </Modal.Title>
                        <button className="close-btn" onClick={ () => this.props.toggleUpdateDataModal()} ><XIcon size={20}   /></button>
                    </Modal.Header>
                    <Modal.Body>
                        <h6 className='modal-body-title'>{this.props.t("CONFLICT_TITLE")}</h6>
                        
                        <Col xs={12} className={"conflict-item "+(this.state.supObj.isImportChangeApprove===true?"approved":"")}>
                            <Row style={{margin:"0px -5px"}}>
                                <Col xs={4} className="conflict-item-sub-cols">
                                    <small>{this.props.t("CATELOG_LOG_EX_LABLES.name")}</small>
                                    <OverlayTrigger placement="bottom" overlay={<Tooltip>{setTextValue(this.state.supObj.supplierName)}</Tooltip>}>
                                        <h6 className='name'>{setTextValue(this.state.supObj.supplierName,150)}</h6>
                                    </OverlayTrigger>
                                </Col>
                                <Col xs={2} className="conflict-item-sub-cols icons-col arrow"><span className='icon'>{this.props.isRTL==="rtl" ?<FeatherIcon icon="arrow-left" size="22"/>:<FeatherIcon icon="arrow-right" size="22"/>}</span></Col>
                                <Col xs={4} className="conflict-item-sub-cols">
                                    <small>{this.props.t("SUGGESTED_NAME")}</small>
                                    <OverlayTrigger placement="bottom" overlay={<Tooltip>{setTextValue(this.state.supObj.importName)}</Tooltip>}>
                                        <h6 className='name'>{setTextValue(this.state.supObj.importName,150)}</h6>
                                    </OverlayTrigger>
                                </Col>
                            <Col xs={2} className={"conflict-item-sub-cols icons-col "+(this.state.logObj.logStatus==="PlanigoCompleted"?"d-none":"")}>
                                <div>
                                    <span className={'d-inline select-icon '+(this.state.supObj.isImportChangeApprove===true?"selected":"")} onClick={() => this.handleUseSugNameSwitchChanges("supObj","isImportChangeApprove",true)}><FeatherIcon icon="check" size="15"/></span>
                                    <span className={'d-inline select-icon '+(this.state.supObj.isImportChangeApprove===false?"not-selected":"")} onClick={() => this.handleUseSugNameSwitchChanges("supObj","isImportChangeApprove",false)}><FeatherIcon icon="x" size="15" /></span>
                                </div>
                            </Col>

                            </Row>
                        </Col>
                        <p className={"update-suggestion-note "+(this.state.logObj.logStatus==="PlanigoCompleted"?"d-none":"")}>
                            - {this.props.t("SUGGESTION_NOTE.first")}<br/>
                            - {this.props.t("SUGGESTION_NOTE.second")}<br/>
                            - {this.props.t("SUGGESTION_NOTE.third")}
                        </p>
                        
                    </Modal.Body>
                    <Modal.Footer >
                        <Button variant='secondary' className='reset' onClick={()=>this.props.toggleUpdateDataModal()}>{this.props.t('btnnames.close')}</Button>
                        <Button variant='success' className={(this.state.logObj.logStatus==="PlanigoCompleted"?"d-none":"")} onClick={()=>this.saveSupplier()}>{this.props.t('btnnames.save')}</Button>
                    </Modal.Footer>
                </Modal>

                <Modal show={this.state.showProductModal} size="lg" className={"update-data-modal "+(this.props.isRTL==="rtl" ? "RTL":"LTR")} onHide={ e => { this.props.toggleUpdateDataModal() }} backdrop="static" dir={this.props.isRTL}>
                    <Modal.Header>
                        <Modal.Title>
                            <h6>{this.props.t("product")}</h6>
                            {setTextValue(this.state.prodObj.productName,30)}
                            <small className='barcode'>{setTextValue(this.state.prodObj.barcode)}</small>

                            {
                                this.props.isRTL=== "rtl"?
                                <Breadcrumb>
                                <Breadcrumb.Item active>{setTextValue(this.state.prodObj.brandName,100)}</Breadcrumb.Item>
                                    <Breadcrumb.Item active>{setTextValue(this.state.prodObj.subCategoryName,100)}</Breadcrumb.Item>
                                    <Breadcrumb.Item active>{setTextValue(this.state.prodObj.categoryName,100)}</Breadcrumb.Item>
                                    <Breadcrumb.Item active>{setTextValue(this.state.prodObj.departmentName,100)}</Breadcrumb.Item>
                                </Breadcrumb>
                                :
                                <Breadcrumb>
                                    <Breadcrumb.Item active>{setTextValue(this.state.prodObj.departmentName,100)}</Breadcrumb.Item>
                                    <Breadcrumb.Item active>{setTextValue(this.state.prodObj.categoryName,100)}</Breadcrumb.Item>
                                    <Breadcrumb.Item active>{setTextValue(this.state.prodObj.subCategoryName,100)}</Breadcrumb.Item>
                                    <Breadcrumb.Item active>{setTextValue(this.state.prodObj.brandName,100)}</Breadcrumb.Item>
                                </Breadcrumb>
                            }
                            
                            
                            
                        </Modal.Title>
                        <button className="close-btn" onClick={ () => this.props.toggleUpdateDataModal()} ><XIcon size={20}   /></button>
                    </Modal.Header>
                    <Modal.Body>
                        <h6 className='modal-body-title'>{this.props.t("CONFLICT_TITLE")}</h6>    

                        <Col xs={12} style={{padding:"0px"}} className={(this.state.prodObj.importStatus==="ReferenceUpdatePending" || this.state.prodObj.importStatus==="ReferenceAndDataUpdate" ?"":"d-none")}>
                            <Col xs={12} className={"conflict-item "+(this.state.prodObj.haveSubCategoryChange===true ?"":"d-none")+(this.state.prodObj.isImportSubCategoryChangeApprove===true?" approved ":"")}>
                                <Row style={{margin:"0px -5px"}}>
                                    <Col xs={4} className="conflict-item-sub-cols">
                                        <small>{this.props.t("CATELOG_LOG_EX_LABLES.subcategory")}</small>
                                        <OverlayTrigger placement="bottom" overlay={<Tooltip>{setTextValue(this.state.prodObj.subCategoryName)}</Tooltip>}>
                                            <h6 className='name'>{setTextValue(this.state.prodObj.subCategoryName,100)}</h6>
                                        </OverlayTrigger>
                                    </Col>
                                    <Col xs={2} className="conflict-item-sub-cols icons-col arrow"><span className='icon'>{this.props.isRTL==="rtl" ?<FeatherIcon icon="arrow-left" size="22"/>:<FeatherIcon icon="arrow-right" size="22"/>}</span></Col>
                                    <Col xs={4} className="conflict-item-sub-cols">
                                        <small>{this.props.t("PROD_SUGGESTED_SUBCAT")}</small>
                                        <OverlayTrigger placement="bottom" overlay={<Tooltip>{this.state.prodObj.importSubCategoryId<0? setTextValue(this.state.prodObj.importSubCategoryRefName): setTextValue(this.state.prodObj.importSubCategoryName)}</Tooltip>}>
                                            <h6 className='name'>{this.state.prodObj.importSubCategoryId<0? setTextValue(this.state.prodObj.importSubCategoryRefName, 100): setTextValue(this.state.prodObj.importSubCategoryName, 100)}</h6>
                                        </OverlayTrigger>
                                    </Col>
                                <Col xs={2} className={"conflict-item-sub-cols icons-col "+(this.state.logObj.logStatus==="PlanigoCompleted"?"d-none":"")}>
                                    <div>
                                        <span className={'d-inline select-icon '+(this.state.prodObj.isImportSubCategoryChangeApprove===true?"selected":"")} onClick={() => this.handleUseSugNameSwitchChanges("prodObj","isImportSubCategoryChangeApprove",true)}><FeatherIcon icon="check" size="15"/></span>
                                        <span className={'d-inline select-icon '+(this.state.prodObj.isImportSubCategoryChangeApprove===false?"not-selected":"")} onClick={() => this.handleUseSugNameSwitchChanges("prodObj","isImportSubCategoryChangeApprove",false)}><FeatherIcon icon="x" size="15" /></span>
                                    </div>
                                </Col>

                                </Row>
                            </Col>

                            <Col xs={12} className={"conflict-item "+(this.state.prodObj.haveBrandChange===true ?" ":"d-none")+(this.state.prodObj.isImportBrandChangeApprove===true?" approved ":"")}>
                                <Row style={{margin:"0px -5px"}}>
                                    <Col xs={4} className="conflict-item-sub-cols">
                                        <small>{this.props.t("CATELOG_LOG_EX_LABLES.brand")}</small>
                                        <OverlayTrigger placement="bottom" overlay={<Tooltip>{setTextValue(this.state.prodObj.brandName)}</Tooltip>}>
                                            <h6 className='name'>{setTextValue(this.state.prodObj.brandName,150)}</h6>
                                        </OverlayTrigger>
                                    </Col>
                                    <Col xs={2} className="conflict-item-sub-cols icons-col arrow"><span className='icon'>{this.props.isRTL==="rtl" ?<FeatherIcon icon="arrow-left" size="22"/>:<FeatherIcon icon="arrow-right" size="22"/>}</span></Col>
                                    <Col xs={4} className="conflict-item-sub-cols">
                                        <small>{this.props.t("PROD_SUGGESTED_BRAND")}</small>
                                        <OverlayTrigger placement="bottom" overlay={<Tooltip>{this.state.prodObj.importBrandId<0? setTextValue(this.state.prodObj.importBrandRefName): setTextValue(this.state.prodObj.importBrandName)}</Tooltip>}>
                                            <h6 className='name'>{this.state.prodObj.importBrandId<0? setTextValue(this.state.prodObj.importBrandRefName, 150): setTextValue(this.state.prodObj.importBrandName, 150)}</h6>
                                        </OverlayTrigger>
                                    </Col>
                                <Col xs={2} className={"conflict-item-sub-cols icons-col "+(this.state.logObj.logStatus==="PlanigoCompleted"?"d-none":"")}>
                                    <div>
                                        <span className={'d-inline select-icon '+(this.state.prodObj.isImportBrandChangeApprove===true?"selected":"")} onClick={() => this.handleUseSugNameSwitchChanges("prodObj","isImportBrandChangeApprove",true)}><FeatherIcon icon="check" size="15"/></span>
                                        <span className={'d-inline select-icon '+(this.state.prodObj.isImportBrandChangeApprove===false?"not-selected":"")} onClick={() => this.handleUseSugNameSwitchChanges("prodObj","isImportBrandChangeApprove",false)}><FeatherIcon icon="x" size="15" /></span>
                                    </div>
                                </Col>

                                </Row>
                            </Col>
                            
                        </Col>

                        <Col xs={12} className={(this.state.prodObj.importStatus==="DataUpdatePending" || this.state.prodObj.importStatus==="ReferenceAndDataUpdate" ?"":"d-none")}>
                            
                            <Col xs={12} className={"conflict-item "+(this.state.prodObj.isImportNameChangeApprove===true?" approved ":"")}>
                                <Row style={{margin:"0px -5px"}}>
                                    <Col xs={4} className="conflict-item-sub-cols">
                                        <small>{this.props.t("CATELOG_LOG_EX_LABLES.name")}</small>
                                        <OverlayTrigger placement="bottom" overlay={<Tooltip>{setTextValue(this.state.prodObj.productName)}</Tooltip>}>
                                            <h6 className='name'>{setTextValue(this.state.prodObj.productName,150)}</h6>
                                        </OverlayTrigger>
                                    </Col>
                                    <Col xs={2} className="conflict-item-sub-cols icons-col arrow"><span className='icon'>{this.props.isRTL==="rtl" ?<FeatherIcon icon="arrow-left" size="22"/>:<FeatherIcon icon="arrow-right" size="22"/>}</span></Col>
                                    <Col xs={4} className="conflict-item-sub-cols">
                                        <small>{this.props.t("SUGGESTED_NAME")}</small>
                                        <OverlayTrigger placement="bottom" overlay={<Tooltip>{setTextValue(this.state.prodObj.importName)}</Tooltip>}>
                                            <h6 className='name'>{setTextValue(this.state.prodObj.importName,150)}</h6>
                                        </OverlayTrigger>
                                    </Col>
                                    <Col xs={2} className={"conflict-item-sub-cols icons-col "+(this.state.logObj.logStatus==="PlanigoCompleted"?"d-none":"") }>
                                        <div>
                                            <span className={'d-inline select-icon '+(this.state.prodObj.isImportNameChangeApprove===true?"selected":"")} onClick={() => this.handleUseSugNameSwitchChanges("prodObj","isImportNameChangeApprove",true)}><FeatherIcon icon="check" size="15"/></span>
                                            <span className={'d-inline select-icon '+(this.state.prodObj.isImportNameChangeApprove===false?"not-selected":"")} onClick={() => this.handleUseSugNameSwitchChanges("prodObj","isImportNameChangeApprove",false)}><FeatherIcon icon="x" size="15" /></span>
                                        </div>
                                    </Col>
                                </Row>
                            </Col>
                        </Col>
                        <p className={"update-suggestion-note "+(this.state.logObj.logStatus==="PlanigoCompleted"?"d-none":"")}>
                            - {this.props.t("SUGGESTION_NOTE.first")}<br/>
                            - {this.props.t("SUGGESTION_NOTE.second")}<br/>
                            - {this.props.t("SUGGESTION_NOTE.third")}
                        </p>
                        
                    </Modal.Body>
                    <Modal.Footer >
                        <Button variant='secondary' className='reset' onClick={()=>this.props.toggleUpdateDataModal()}>{this.props.t('btnnames.close')}</Button>
                        <Button variant='success' className={(this.state.logObj.logStatus==="PlanigoCompleted"?"d-none":"")} onClick={()=>this.saveProduct()}>{this.props.t('btnnames.save')}</Button>
                    </Modal.Footer>
                </Modal>

                <AcViewModal showmodal={this.state.loading} message={this.props.t('PLEASE_WAIT')} />
            </>

            
        )
    }

}
export default withTranslation()(withRouter(UpdateData));


