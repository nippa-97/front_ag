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

import "./catelogueApprovals.css";
import { PlusCircleIcon, XIcon } from '@primer/octicons-react';
import { CustomColorPicker } from '../../../common_layouts/color-picker'; 

export class SupplierApprove extends Component {
    _isMounted = false;
    constructor(props) {
        super(props)
        this.state = {
            ApproveObj:this.defaultApproveObj(),

            supplierObj:this.defaultSupplierObjLoad(),
            showSupplierAddModal:false,

            supplierList:[],
            supplierListLoading:false,

        }
    }

    componentDidMount(){
        this._isMounted = true;
        if(this._isMounted){
            if(this.props.mappingObj){
                this.setState({ApproveObj:JSON.parse(JSON.stringify(this.props.mappingObj))},()=>{
                    this.loadSuppliers();
                });
            }
        }
    }

    componentWillUnmount(){
        this._isMounted = false;
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
                this.setState({supplierList:temarr},()=>{});
            }
        });
    }

    defaultApproveObj = () =>{
        return {
            importCode: "SUP01",
            importName: "test sup name",
            isApprove: false,
            isNewSupplier: false,
            pendingSupId: 0,
            supplierId: 0
        };
    }

    handleNewSwitchChanges = (ctxt) =>{
        setTimeout(() => {
            var csobj = this.state.ApproveObj;
            csobj.isNewSupplier = !ctxt;
            this.setState({ApproveObj: csobj});
        }, 100);
    }
    
    //supplier
    handleSupplierChange = (e) =>{
        let obj = this.state.ApproveObj;
        obj.supplierId = e.value;

        this.setState({ApproveObj:obj},()=>{});
    }
    
    defaultSupplierObjLoad = () =>{
        return {supplierId: -1,supplierName:"",supplierCode:"",};
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
         this.setState({[type]:isshow,supplierObj:this.defaultSupplierObjLoad(),});
    }

    //main mapping save
    approveMappingData = () =>{
        let approve_obj = this.state.ApproveObj;
        //console.log(approve_obj);
       
        if(approve_obj.isNewSupplier===false && approve_obj.supplierId <= 0){
            alertService.warn("Select a supplier");
            return false;
        }
        this.props.toggleLoadingModal();
        this.setState({ loading:true});
        submitSets(submitCollection.approveSupplierData, approve_obj, true, null, true).then(resp => {
            this.props.toggleLoadingModal();
            this.setState({ loading:false});
            if(resp && resp.status){
                alertService.success(this.props.t("succussfuly")+" " +this.props.t("saved"));
                this.props.mainSearch();
                this.props.toggleApproveModals("showSupplierAppovalModal",false);
            }
            else{
                // alertService.error((resp&&resp.msg?resp.msg:resp&&resp.extra?resp.extra:this.props.t('ERROR_OCCURRED')));
            }
        });
    }

    render(){
        return(
            <>
                <Modal show={this.props.showSupplierAppovalModal} className={"approve-modal supplier "+(this.props.isRTL==="rtl" ? "RTL":"LTR")} onHide={ e => { this.props.toggleApproveModals("showSupplierAppovalModal",false) }} backdrop="static" dir={this.props.isRTL}>
                    <Modal.Header>
                        <Modal.Title>
                            <h6>{this.props.t("CATELOG_NEW_INFO_LABELS.new_sup_title")}</h6>
                            {this.state.ApproveObj.importName}
                        </Modal.Title>
                        <button className="close-btn" onClick={ () => this.props.toggleApproveModals("showSupplierAppovalModal",false)} ><XIcon size={20}   /></button>
                    </Modal.Header>
                    <Modal.Body style={{height:"240px !important"}}>

                        <Form.Group className='switch-col'>
                            <Row>
                                <Col xs={10}>
                                <p className='info-des-txt'>{this.props.t("CATELOG_NEW_INFO_LABELS.supplier")} <span>{this.state.ApproveObj.importName ? this.state.ApproveObj.importName : "N/A" }</span></p>
                                </Col>
                                <Col xs={2}>
                                    <Switch onChange={()=> this.handleNewSwitchChanges(this.state.ApproveObj.isNewSupplier)} checked={this.state.ApproveObj.isNewSupplier} onColor={"#5128a0"} />
                                </Col>
                            </Row>
                        </Form.Group>
                        
                        {/* <Form.Group>
                            <div className={"switch-main-div"}>
                                <label className="pure-material-switch" style={{ width: "100%" }}>
                                    <input type="checkbox" checked={this.state.ApproveObj.isNewSupplier} onChange={(e) => this.handleNewSwitchChanges(this.state.ApproveObj.isNewSupplier)} />
                                    <span> {this.props.t("NEW_SUPPLIER")} </span>
                                </label>    
                                <p className='info-des-txt'>{this.props.t("CATELOG_NEW_INFO_LABELS.supplier")} <span>{this.state.ApproveObj.importName ? this.state.ApproveObj.importName : "N/A" }</span></p>
                            </div>
                        </Form.Group> */}

                        <Form.Group className={(this.state.ApproveObj.isNewSupplier===true ? " d-none":"")}>
                        <p className='info-des-txt'>{this.props.t("CATELOG_NEW_INFO_LABELS.sup_already_exist_msg")}</p>
                            <h5>{this.props.t("suplable")} <span onClick={()=>this.toggleAddingModals("showSupplierAddModal",true)}><PlusCircleIcon /></span> </h5>
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
                        </Form.Group>
                        

                    </Modal.Body>
                    <Modal.Footer>
                        <Button onClick={()=>this.approveMappingData()} disabled={this.state.loading===true?true:false}  variant='success'>{this.props.t("btnnames.save")}</Button>
                    </Modal.Footer>
                </Modal>

                <Modal show={this.state.showSupplierAddModal} className={"adding-modal supplier "+(this.props.isRTL==="rtl" ? "RTL":"LTR")} onHide={ e => { this.toggleAddingModals("showSupplierAddModal",false) }} backdrop="static" dir={this.props.isRTL}>
                    <Modal.Header>
                        <Modal.Title>{this.props.t("NEW_SUPPLIER")}</Modal.Title>
                        <button className="close-btn" onClick={ () => this.toggleAddingModals("showSupplierAddModal",false)} ><XIcon size={20}   /></button>
                    </Modal.Header>
                    <Modal.Body style={{height:"240px !important"}}>
                        <Col xs={12} className="form-subcontent">
                            <Form.Group style={{marginBottom:"35px"}}>
                                <AcInput eleid="supplierName" atype="text" aid="supplierCode" adefval={this.state.supplierObj.supplierCode} aobj={this.state.supplierObj} avset={this.state.vobj} avalidate={[ValT.empty]} aplace={this.props.t('supcode')} showlabel={true} arequired={true}/>
                            </Form.Group>
                            <Form.Group style={{marginBottom:"35px"}}>
                                <AcInput eleid="supplierName" atype="text" aid="supplierName" adefval={this.state.supplierObj.supplierName} aobj={this.state.supplierObj} avset={this.state.vobj} avalidate={[ValT.empty]} aplace={this.props.t('supname')} showlabel={true} arequired={true}/>
                            </Form.Group>
                            <Form.Group style={{marginBottom:"35px"}}>
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

export default withTranslation()(withRouter(SupplierApprove));