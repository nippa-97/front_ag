import { Component } from 'react';
import { withRouter,  } from 'react-router-dom';
import { withTranslation } from 'react-i18next';
import {Col, Button , Modal, Form, Row } from 'react-bootstrap';
import Select from 'react-select';
import Switch from "react-switch";

import { submitSets } from '../../../UiComponents/SubmitSets';
import { submitCollection } from '../../../../_services/submit.service';
import { alertService } from '../../../../_services/alert.service';
import { AcInput, AcViewModal, ValT} from '../../../UiComponents/AcImports';
import { CustomColorPicker } from '../../../common_layouts/color-picker'; 

import "./catelogueApprovals.css";
import { PlusCircleIcon, XIcon } from '@primer/octicons-react';

export class BrandApprove extends Component {
    _isMounted = false;
    constructor(props) {
        super(props)
        this.state = {
            loading:false,
            ApproveObj:this.defaultApproveObj(),

            brandObj:this.defaultBrandObjLoad(),
            showBrandAddModal:false,

            supplierObj:this.defaultSupplierObjLoad(),
            showSupplierAddModal:false,

            supplierList:[],
            supplierListLoading:false,
            brandsList:[],
            brandListLoading:false,
        }
    }

    componentDidMount(){
        this._isMounted = true;
        if(this._isMounted){
            if(this.props.mappingObj){
                this.setState({ApproveObj:JSON.parse(JSON.stringify(this.props.mappingObj)) , supplierList:(this.props.supplierList ? JSON.parse(JSON.stringify(this.props.supplierList)) : [] )},()=>{
                    this.loadSuppliers();
                });
            }
        }
    }

    componentWillUnmount(){
        this._isMounted = false;
    }

    defaultApproveObj = () =>{
        return {
            brandId: 0,
            importCode: "",
            importName: "",
            pendingBrandId: 0,
            pendingSupplierId: 0,
            supplierId: 0,
            supplierRefCode: "",
            supplierRefName: "",
            catelogId:0,
            isNewBrand:false,
        };
    }

    loadSuppliers = () =>{
        let sobj = {isReqPagination:false}
        this.setState({supplierList:[], supplierListLoading:true});
        submitSets(submitCollection.searchSuppliers, sobj, true).then(res => {
            this.setState({supplierListLoading:false});
            if(res && res.status && res.extra){
                let temarr = [];
                for (let i = 0; i < res.extra.length; i++) {
                   temarr.push({value:res.extra[i].supplierId, label:res.extra[i].supplierName});
                }
                this.setState({supplierList:temarr},()=>{
                    this.setSupplierList();
                });
            }
        });
    }

    setSupplierList = () =>{
        let sup_list = JSON.parse(JSON.stringify(this.state.supplierList));
        let sup_refName = (this.state.ApproveObj.supplierRefName ? this.state.ApproveObj.supplierRefName : "N/A");
        let sup_refId = (this.state.ApproveObj.supplierId ? this.state.ApproveObj.supplierId : null);
        let approve_obj = this.state.ApproveObj;

        let find_index = -1;
        if(sup_refId){
            find_index = sup_list.findIndex(x => x.value === sup_refId);
        }
        else{
            find_index = sup_list.findIndex(x => (x.label).toLowerCase() === sup_refName.toLowerCase());
        }

        if(find_index === -1){
            let srfname = (sup_refName === "N/A" ? sup_refName : (sup_refName+ " ["+this.props.t("NEW")+"]"));
            sup_list.unshift({value:-1, label:srfname});
            approve_obj.supplierId = -1;
            approve_obj.isNewSupplier = (sup_refName === "N/A" ? false : true)//true;
            this.setState({supplierList:sup_list, ApproveObj:approve_obj},()=>{});
        }
        else{
            approve_obj.supplierId = sup_list[find_index].value;
            approve_obj.isNewSupplier = true;
            this.setState({ ApproveObj:approve_obj},()=>{});
        }
    }

    handleNewSwitchChanges = (ctxt) =>{
        setTimeout(() => {
            var csobj = this.state.ApproveObj;
            csobj.isNewBrand = !ctxt;
            csobj.brandId = -1;
            this.setState({ApproveObj: csobj});
        }, 100);
    }

    //brand
    handleBrandChange = (e) =>{
        let obj = this.state.ApproveObj;
        obj.brandId = e.value;
        obj.isNewBrand = (e.value < 0 ? true : false);
        this.setState({ApproveObj:obj},()=>{});
    }

    defaultBrandObjLoad = () =>{
        return {brandId: -1, brandName:"", color:"#999999", supplierId:-1,supplierName:"",supplierCode:""};
    }

    handleNewBrandChangeSupplier = (e) =>{
        let obj = this.state.brandObj;
        obj.supplierId = e.value;
        this.setState({brandObj:obj},()=>{});
    }

    changeBrandColor = (color) =>{
        let sobj = this.state.brandObj;
        sobj.color = color;
        this.setState({brandObj:sobj});
    }

    AddNewBrand = () =>{
        var brobj = this.state.brandObj;
        if(brobj.brandName===""){
            alertService.warn("Subcategory Name Cannot be empty!");
            return false;
        }

        if(brobj.supplierId<=0){
            alertService.warn("Supplier is required!");
            return false;
        }

        this.setState({ loading:true});
        submitSets(submitCollection.saveBrand, brobj, true, null, true).then(resp => {
            this.setState({ loading:false});
            if(resp && resp.status){
                alertService.success(this.props.t("succussfuly")+" " +this.props.t("saved"));
                this.toggleAddingModals("showBrandAddModal",false);
                this.props.loadBrands();
            } else{
                // alertService.error((resp&&resp.msg?resp.msg:resp&&resp.extra?resp.extra:this.props.t('ERROR_OCCURRED')));
            }
            
        });
    }
    
    //supplier
    handleSupplierChange = (e) =>{
        let obj = this.state.ApproveObj;
        obj.supplierId = e.value;
        obj.isNewSupplier = (e.value===-1?true:false);
        this.setState({ApproveObj:obj},()=>{});
    }
    
    defaultSupplierObjLoad = () =>{
        return {supplierId: -1,supplierName:"",supplierCode:"", color:"#ccc"};
    }

    changeSupColor = (color) =>{
        let sobj = this.state.supplierObj;
        sobj.color = color;
        this.setState({supplierObj:sobj});
    }

    AddNewSupplier = () => {
        var supobj = this.state.supplierObj;

        if(supobj.supplierCode===""){
            alertService.warn("Supplier Code Cannot be empty!");
            return false;
        }
        if(supobj.supplierName===""){
            alertService.warn("Supplier Name Cannot be empty!");
            return false;
        }

        this.setState({ loading:true});
        submitSets(submitCollection.saveSupplier, supobj, true, null, true).then(resp => {
            this.setState({ loading:false});
            if(resp && resp.status){
                alertService.success(this.props.t("succussfuly")+" " +this.props.t("saved"));
                this.toggleAddingModals("showSupplierAddModal",false);
                this.loadSuppliers();
            } else{
                // alertService.error((resp&&resp.msg?resp.msg:resp&&resp.extra?resp.extra:this.props.t('ERROR_OCCURRED')));
            }
            
        });
    }

    toggleAddingModals = (type,isshow)=>{
         this.setState({[type]:isshow,brandObj:this.defaultBrandObjLoad(),supplierObj:this.defaultSupplierObjLoad(),});
    }

    //main mapping save
    approveMappingData = () =>{
        let approve_obj = this.state.ApproveObj;
        //console.log(approve_obj);
        if(approve_obj.supplierId===null || approve_obj.supplierId===undefined){
            alertService.warn("Select a category");
            return false;
        }
        if(approve_obj.isNewBrand===false && approve_obj.brandId <= 0){
            alertService.warn("Select a brand");
            return false;
        }
        this.props.toggleLoadingModal();
        this.setState({ loading:true});
        submitSets(submitCollection.approveBrandData, approve_obj, true, null, true).then(resp => {
            this.props.toggleLoadingModal();
            this.setState({ loading:false});
            if(resp && resp.status){
                alertService.success(this.props.t("succussfuly")+" " +this.props.t("saved"));
                this.props.loadBrands();
                this.props.mainSearch();
                this.props.toggleApproveModals("showBrandApproveModal",false);
            }
            else{
                // alertService.error((resp&&resp.msg?resp.msg:resp&&resp.extra?resp.extra:this.props.t('ERROR_OCCURRED')));
            }
        });
    }

    render(){
        return(
            <>
                <Modal show={this.props.showBrandApproveModal} className={"approve-modal "+(this.props.isRTL==="rtl" ? "RTL":"LTR")} onHide={ e => { this.props.toggleApproveModals("showBrandApproveModal",false) }} backdrop="static" dir={this.props.isRTL}>
                    <Modal.Header>
                        <Modal.Title>
                            <h6>{this.props.t("CATELOG_NEW_INFO_LABELS.new_brand_title")}</h6>
                            {this.state.ApproveObj.importName}
                        </Modal.Title>
                        <button className="close-btn" onClick={ () => this.props.toggleApproveModals("showBrandApproveModal",false)} ><XIcon size={20}   /></button>
                    </Modal.Header>
                    <Modal.Body>

                        <Form.Group className='switch-col'>
                            <Row>
                                <Col xs={10}>
                                <p className='info-des-txt'>{this.props.t("CATELOG_NEW_INFO_LABELS.brand")} <span>{this.state.ApproveObj.importName ? this.state.ApproveObj.importName : "N/A" }</span></p>
                                </Col>
                                <Col xs={2}>
                                    <Switch onChange={()=> this.handleNewSwitchChanges(this.state.ApproveObj.isNewBrand)} checked={this.state.ApproveObj.isNewBrand} onColor={"#5128a0"} />
                                </Col>
                            </Row>
                        </Form.Group>
                        
                        <Form.Group className={this.state.ApproveObj.isNewBrand===true ?" d-none":""}>
                            <p className='info-des-txt'>{this.props.t("CATELOG_NEW_INFO_LABELS.brand_already_exist_msg")}</p>
                            <Col xs={12} className={"select-label-wrapper "+ (this.state.ApproveObj.categoryId<=0 ? "new" : " exist")}>
                                <h5>{this.props.t("brand")} <span onClick={()=>this.toggleAddingModals("showBrandAddModal",true)}><PlusCircleIcon /></span> </h5>
                                <Select 
                                    options={this.props.brandsList} 
                                    onChange={(e) => this.handleBrandChange(e)}
                                    placeholder=""
                                    value={this.props.brandsList.filter(option => option.value === this.state.ApproveObj.brandId)}
                                    classNamePrefix="searchselect-inner" maxMenuHeight={200}
                                    menuPortalTarget={document.body}
                                        menuPosition="fixed"
                                        styles={{
                                            menuPortal: (provided) => ({ ...provided, zIndex: 9999 }),
                                            menu: (provided) => ({ ...provided, zIndex: 9999 })
                                        }}
                                />

                            </Col>
                        </Form.Group>

                        <Form.Group className={this.state.ApproveObj.isNewBrand===true ?" ":" d-none "}>
                            <h5>{this.props.t("suplable")} <span onClick={()=>this.toggleAddingModals("showSupplierAddModal",true)}><PlusCircleIcon /></span> </h5>
                            <Col xs={12} className={"select-label-wrapper "+ (this.state.ApproveObj.categoryId<=0 ? "new" : " exist")}>
                                <Select 
                                    options={this.state.supplierList} 
                                    onChange={(e) => this.handleSupplierChange(e)}
                                    placeholder="" 
                                    value={this.state.supplierList.filter(option => option.value === this.state.ApproveObj.supplierId)}
                                    classNamePrefix="searchselect-inner" maxMenuHeight={200}
                                    menuPortalTarget={document.body}
                                        menuPosition="fixed"
                                        styles={{
                                            menuPortal: (provided) => ({ ...provided, zIndex: 9999 }),
                                            menu: (provided) => ({ ...provided, zIndex: 9999 })
                                        }}
                                />
                                <Col xs={12} className={"combo-loading-div "+(this.state.supplierListLoading===true ? "" :" d-none")}>{this.props.t("LOADING")}</Col>

                            </Col>
                        </Form.Group>


                        {/* <Form.Group>
                            <div className={"switch-main-div"}>
                                <label className="pure-material-switch" style={{ width: "100%" }}>
                                    <input type="checkbox" checked={this.state.ApproveObj.isNewBrand} onChange={(e) => this.handleNewSwitchChanges(this.state.ApproveObj.isNewBrand)} />
                                    <span> {this.props.t("NEW_BRAND")} </span>
                                </label>    
                                <p className='info-des-txt'>{this.props.t("CATELOG_NEW_INFO_LABELS.brand")} <span>{this.state.ApproveObj.importName ? this.state.ApproveObj.importName : "N/A" }</span></p>
                            </div>
                        </Form.Group> */}

                    </Modal.Body>
                    <Modal.Footer>
                        <Button onClick={()=>this.approveMappingData()} disabled={this.state.loading===true?true:false}  variant='success'>{this.props.t("btnnames.save")}</Button>
                    </Modal.Footer>
                </Modal>

                <Modal show={this.state.showBrandAddModal} className={"adding-modal brand "+(this.props.isRTL==="rtl" ? "RTL":"LTR")} onHide={ e => { this.toggleAddingModals("showBrandAddModal",false) }} backdrop="static" dir={this.props.isRTL}>
                    <Modal.Header>
                        <Modal.Title>{this.props.t("addnewbrand")}</Modal.Title>
                        <button className="close-btn" onClick={ () => this.toggleAddingModals("showBrandAddModal",false)} ><XIcon size={20}   /></button>
                    </Modal.Header>
                    <Modal.Body>
                        <Col xs={12} className="form-subcontent">
                            <Form.Group style={{marginBottom:"15px"}}>
                                <AcInput eleid="brandName" atype="text" aid="brandName" adefval={this.state.brandObj.brandName} aobj={this.state.brandObj} avset={this.state.vobj} avalidate={[ValT.empty]} aplace={this.props.t('brandname')} showlabel={true} arequired={true}/>
                            </Form.Group>
                            <Form.Group style={{marginBottom:"20px"}}>
                                {/* <AcInput atype="color" aid="color" adefval={this.state.brandObj.color} aobj={this.state.brandObj} avset={this.state.vobj} avalidate={[ValT.empty]} aplace={this.props.t('color')} showlabel={true}/> */}
                                <CustomColorPicker 
                                    isRTL = {this.props.isRTL}
                                    selectedColor={this.state.brandObj.color}
                                    label={this.props.t('color')}
                                    isCompulsary={true}
                                    changeColor = {this.changeBrandColor}    
                                    type={"brand"}
                                    departmentId={-1}
                                    categoryId={-1}
                                    isNew ={true}
                                    t ={this.props.t}
                                />
                            </Form.Group>
                            <Form.Group style={{marginBottom:"35px"}}>
                                <Form.Label>{this.props.t("suplable")}<span style={{color:"red"}}>*</span></Form.Label>
                                <Select 
                                    id="supplierId" 
                                    name="supplierId" 
                                    placeholder={this.props.t("supselectplceholder")} 
                                    options={this.state.supplierList} 
                                    onChange={(e) => this.handleNewBrandChangeSupplier(e)} 
                                    value={this.state.supplierList.filter(option => option.value === this.state.brandObj.supplierId)} 
                                    className="filter-suplist" size="sm" 
                                    classNamePrefix="searchselect-inner" 
                                    maxMenuHeight={200} 
                                    data-validation-type="area"
                                    menuPortalTarget={document.body}
                                        menuPosition="fixed"
                                        styles={{
                                            menuPortal: (provided) => ({ ...provided, zIndex: 9999 }),
                                            menu: (provided) => ({ ...provided, zIndex: 9999 })
                                        }}
                                
                                />
                            </Form.Group>
                        </Col>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant='success' disabled={this.state.loading===true?true:false} onClick={()=>this.AddNewBrand()}>{this.props.t("btnnames.save")}</Button>
                    </Modal.Footer>
                </Modal>

                <Modal show={this.state.showSupplierAddModal} className={"adding-modal brand "+(this.props.isRTL==="rtl" ? "RTL":"LTR")} onHide={ e => { this.toggleAddingModals("showSupplierAddModal",false) }} backdrop="static" dir={this.props.isRTL}>
                    <Modal.Header>
                        <Modal.Title>{this.props.t("NEW_SUPPLIER")}</Modal.Title>
                        <button className="close-btn" onClick={ () => this.toggleAddingModals("showSupplierAddModal",false)} ><XIcon size={20}   /></button>
                    </Modal.Header>
                    <Modal.Body>
                        <Col xs={12} className="form-subcontent">
                            <Form.Group style={{marginTop:"0px"}}>
                                <AcInput eleid="supplierName" atype="text" aid="supplierCode" adefval={this.state.supplierObj.supplierCode} aobj={this.state.supplierObj} avset={this.state.vobj} avalidate={[ValT.empty]} aplace={this.props.t('supcode')} showlabel={true} arequired={true}/>
                            </Form.Group>
                            <Form.Group style={{marginBottom:"15px"}}>
                                <AcInput eleid="supplierName" atype="text" aid="supplierName" adefval={this.state.supplierObj.supplierName} aobj={this.state.supplierObj} avset={this.state.vobj} avalidate={[ValT.empty]} aplace={this.props.t('supname')} showlabel={true} arequired={true}/>
                            </Form.Group>
                            <Form.Group>
                                <CustomColorPicker 
                                    isRTL = {this.props.isRTL}
                                    selectedColor={this.state.supplierObj.color}
                                    label={this.props.t('color')}
                                    isCompulsary={true}
                                    changeColor = {this.changeSupColor}    
                                    type={"supplier"}
                                    departmentId={-1}
                                    categoryId={-1}
                                    isNew ={true}
                                    t ={this.props.t}
                                />
                            </Form.Group>
                        </Col>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant='success' disabled={this.state.loading===true?true:false} onClick={()=>this.AddNewSupplier()}>{this.props.t("btnnames.save")}</Button>
                    </Modal.Footer>
                </Modal>

                <AcViewModal showmodal={this.state.loading} message={this.props.t('PLEASE_WAIT')} />
            </>
        )
    }
}

export default withTranslation()(withRouter(BrandApprove));