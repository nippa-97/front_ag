import React from 'react';
import { withRouter } from 'react-router-dom';
import { connect } from "react-redux";
import {Col, Form, Button, Row, Modal,Badge, Dropdown } from 'react-bootstrap';

import { AcInput, AcButton, ValT, AcViewModal} from '../../../UiComponents/AcImports';
//import { PlusIcon , XIcon} from '@primer/octicons-react';
import { Icons } from '../../../../assets/icons/icons';

import './addnew.scss';
import { alertService } from '../../../../_services/alert.service';
import { submitSets } from '../../../UiComponents/SubmitSets';
import { submitCollection } from '../../../../_services/submit.service';

import {  withTranslation } from "react-i18next";
import "../../../../_translations/i18n";

import { viewSetDeptPrevAction } from '../../../../actions/dept/dept_action';
import { CustomColorPicker } from '../../../common_layouts/color-picker';

/**
 * department add/update components
 *
 * @class DepartmentDetailsComponent
 * @extends {React.Component}
 */

export class DepartmentDetailsComponent extends React.Component{
    _isMounted = false;

    constructor(props){
        super(props);
        this.state = {
            loading:false,
            isedit: false,
            sobj: this.defaultObjectLoad(), vobj: {},

            departmentIconsMainList:[],
            departmentIconsShowList:[],

            selectedIcon:{departmentIconId:0,departmentIconName:"DEP_DEFAULT"},
            isFromLog:false,

            prevpagedetails: null,
            isUpdated: false,
            initialName: "",
        }
    }

    componentDidMount(){
        this._isMounted = true;
    
        if(this._isMounted){
            //get edit object if available
            var cisedit = (this.props.selectedDept?true:false);
            // console.log(this.props.selectedDept);

            this.setState({
                isedit: cisedit,
                sobj: (cisedit?this.props.selectedDept:this.defaultObjectLoad()),
                initialName: (cisedit?this.props.selectedDept.name:""),
            });

            this.getDepartmentIcons();
        }
    }

    componentWillUnmount(){
        this._isMounted = false;
    }
    //default object
    defaultObjectLoad = () => {
        return {name: "", color: "#999999", departmentIconId:"", departmentIconName:"DEP_DEFAULT", hide: false};
    }
    //save/update department
    handleDeptSave = (obj) => {
        
        if(obj.name === ""){
            alertService.error(this.props.t('PLEASE_ENTER_DEPARTMENT_NAME'));
            return false;
        }   

        submitSets(submitCollection.saveDepatments, obj, null).then(resp => {
            if(resp && resp.status){
                /* let cprevdetails = this.state.prevpagedetails;
                if(cprevdetails){
                    cprevdetails["viewtype"] = (type===1?"new":"update");
                    this.props.setDeptPrevDetails(cprevdetails);
                } */
                
                let newdeptobj = this.state.sobj;
                newdeptobj["departmentId"] = resp.extra;
                
                alertService.success(this.props.t('SAVED_DEPARTMENT_SUCCESSFULLY'));
                this.props.handleUpdateModalToggle(true, newdeptobj);
            } else{
                // alertService.error((resp&&resp.msg?resp.msg:resp&&resp.extra?resp.extra:this.props.t('ERROR_OCCURRED')));
                if(resp.validation){
                
                    let codeMessage = this.props.t(resp.validation.code);
        
                    if(resp.validation.msgParams && resp.validation.msgParams.length > 0){
                        
                        let filledMessage = codeMessage.replace(/\[\$\]/g, () => resp.validation.msgParams.shift());
        
                        resp.validation.type === "error" ? alertService.error(filledMessage) : alertService.warn(filledMessage);
        
                    }else{
                        resp.validation.type === "error" ? alertService.error(codeMessage) : alertService.warn(codeMessage);
                    }
        
                }else{
                    alertService.error(this.props.t("ERROR_OCCURRED"));
                }
            }
        });

    }

    handleDeptUpdate = (obj) => {

        if(obj.name === ""){
            alertService.error(this.props.t('PLEASE_ENTER_DEPARTMENT_NAME'));
            return false;
        }    
        
        let nameUpdate = false;

        if(this.state.initialName !== this.state.sobj.name){
            nameUpdate = true;
        }

        if(!this.state.isUpdated && !nameUpdate){
            alertService.warn(this.props.t('NO_CHANGES_AVAILABLE'));
            return false;
        }

        submitSets(submitCollection.updateDepatments, obj, null).then(resp => {
            
            if(resp && resp.status){
                
                let newdeptobj = this.state.sobj;
                newdeptobj["departmentId"] = resp.extra;
                
                alertService.success(this.props.t('SUCCESSFULLY_DEPARTMENT')+("updated"));
                this.props.handleUpdateModalToggle(true, newdeptobj);
            } else{
                alertService.error((resp&&resp.msg?resp.msg:resp&&resp.extra?resp.extra:this.props.t('ERROR_OCCURRED')));
            }
        });
        
    }

    //delete department
    handleDeptDelete = (resp) => {
        if(resp && resp.status){
            /* let cprevdetails = this.state.prevpagedetails;
            if(cprevdetails){
                cprevdetails["viewtype"] = "delete";
                this.props.setDeptPrevDetails(cprevdetails);
            } */

            alertService.success(this.props.t('SUCCESSFULLY_DEPARTMENT_DELETED'));
            this.props.handleUpdateModalToggle(true, true);
        } else{
            // alertService.error((resp&&resp.msg?resp.msg:resp&&resp.extra?resp.extra:this.props.t('ERROR_OCCURRED')));

            if(resp.validation){
            
                let codeMessage = this.props.t(resp.validation.code);
    
                if(resp.validation.msgParams && resp.validation.msgParams.length > 0){
                    
                    let filledMessage = codeMessage.replace(/\[\$\]/g, () => resp.validation.msgParams.shift());
    
                    resp.validation.type === "error" ? alertService.error(filledMessage) : alertService.warn(filledMessage);
    
                }else{
                    resp.validation.type === "error" ? alertService.error(codeMessage) : alertService.warn(codeMessage);
                }
    
            }else{
                alertService.error(this.props.t("ERROR_OCCURRED"));
            }
        }
    }

    //#DEP-H01 get department icons
    getDepartmentIcons = () =>{
        submitSets(submitCollection.getDepartmentIcons, null,null).then(res => {
            if(res && res.status){
               this.setState({departmentIconsMainList:res.extra, departmentIconsShowList:res.extra});
            } 
        });
    }

    changeIcon = (citem) =>{
        let temobj = this.state.sobj;
        temobj.departmentIconName = citem.departmentIconName;
        temobj.departmentIconId = citem.departmentIconId;

        this.setState({ sobj: temobj, isUpdated: true});
    }

    changeColor = (color) =>{
        let ssobj = this.state.sobj;
        ssobj.color = color;
        this.setState({sobj:ssobj, isUpdated: true});
    }

    backLinkSet = (backpath, iscurrent) => {
        /* let cprevdetails = this.state.prevpagedetails;
        if(iscurrent && cprevdetails){
            cprevdetails["viewtype"] = "back";
            this.props.setDeptPrevDetails(cprevdetails);
    
            this.props.history.push(backpath);
        } */
        this.props.handleUpdateModalToggle();
    }

    handleChangeForm = (key, value) => {
        let sobj = this.state.sobj;
        sobj[key] = value;

        this.setState({ sobj: sobj, isUpdated: true });
    }

    toggleLoading = (isshow)=>{
        this.setState({loading:isshow});
    }

    render(){
        return (<>
            <Modal show={this.props.isShowUpdateModal} className={"deptupdate-modal dept-content "+(this.props.isRTL==="rtl" ? "RTL" : "LTR")} dir={this.props.isRTL} onHide={this.props.handleUpdateModalToggle}>
                <Modal.Header>
                    <Modal.Title style={{fontSize:"20px", fontWeight:"700", textAlign:"center", width:"100%"}}>{this.state.isedit?this.props.t('editDepartment'):this.props.t('addNewDepartment')}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Col className="formcontrol-main">
                        <>
                        <Col xs={12} className="form-subcontent">
                            
                            <Form.Group>
                                <AcInput atype="text" aid="name" adefval={this.state.sobj.name} aobj={this.state.sobj} avset={this.state.vobj} avalidate={[ValT.empty]} aplace={this.props.t('departmentname')} showlabel={true} msg={this.props.t('Character.depname')} characterValidate={255} validateString={true}/>
                            </Form.Group>
                            {
                                this.state.sobj.importName && (this.state.sobj.importStatus==="None" || this.state.sobj.importStatus==="ReferenceUpdatePending") ?
                                    <div style={{marginTop:"-15px"}}>
                                        <Badge bg="warning" pill>{this.props.t("CATELOG_IMP_NAME")} : {this.state.sobj.importName}</Badge>
                                    </div>
                                :<></>
                            }
                        
                            <Col>
                                <Row>
                                    <Col xs={12} md={6}>
                                        <Form.Group>
                                            {/* <AcInput atype="color" aid="color" adefval={this.state.sobj.color} aobj={this.state.sobj} avset={this.state.vobj} avalidate={[ValT.empty]} aplace={this.props.t('depcolor')} showlabel={true}/> */}
                                            <CustomColorPicker 
                                                isRTL = {this.props.isRTL}
                                                selectedColor={this.state.sobj.color}
                                                label={this.props.t('depcolor')}
                                                isCompulsary={true}
                                                changeColor = {this.changeColor}    
                                                type={"department"}
                                                departmentId={-1}
                                                categoryId={-1}
                                                isNew ={!this.state.isedit}
                                                t ={this.props.t}
                                            />
                                        </Form.Group>
                                    </Col>
                                    <Col xs={12} md={6}>
                                        <div className={"switch-main-div"} style={{marginTop: "15px"}}>
                                            <label className="pure-material-switch" style={{ width: "100%" }}>
                                                <input type="checkbox" checked={this.state.sobj.hide} onChange={(e) => this.handleChangeForm("hide", !this.state.sobj.hide)} />
                                                <span> {this.props.t('is_hidden')} </span>
                                            </label>    
                                        </div>
                                    </Col>
                                </Row>
                            </Col>

                            <Col>
                                <Row>
                                    <Col xs={12} md={6}>
                                        <Form.Group className='icon-view'>
                                            <Form.Label style={{width:"100%"}}>
                                                {this.props.t("icon")} 
                                            </Form.Label>

                                            <Dropdown className={"formview-btn change-btn "+(this.props.isRTL==="rtl"?"float-left":"float-right")}>
                                                <Dropdown.Toggle variant="secondary">{this.props.t("changeicon")}</Dropdown.Toggle>
                                                <Dropdown.Menu>
                                                    <Dropdown.Item href="#">
                                                        <Col className='icons-view scroll-content'>
                                                            <Row className="main-icons-col">
                                                                {  //#DEP-H02
                                                                    this.state.departmentIconsShowList.map((citem,index)=>{
                                                                        let selectedicon = (this.state.sobj && this.state.sobj.departmentIconName?this.state.sobj.departmentIconName:"DEP_DEFAULT");
                                                                        return(
                                                                            <Col xs={4} key={index} className="main-icons-item">
                                                                                <Col xs={12} className={"main-icons-item-inner "+(selectedicon === citem.departmentIconName ?" active " :"")} onClick={()=>this.changeIcon(citem)}>
                                                                                    {selectedicon === citem.departmentIconName?
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
                                                    </Dropdown.Item>
                                                </Dropdown.Menu>
                                            </Dropdown>
                                            
                                            <Col xs={12} className="text-center">
                                                {Icons.DepIconsLoad((this.state.sobj.departmentIconName ? this.state.sobj.departmentIconName : "DEP_DEFAULT") , {size:70, color:"#AF7AC5"})}
                                            </Col>
                                        </Form.Group>
                                    </Col>        
                                </Row>
                            </Col>
                            
                        </Col>
                        </>
                    </Col>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" type="button" onClick={() => this.backLinkSet()} className="back-link">{this.props.t('btnnames.close')}</Button>
                    {this.state.isedit? <>
                        {/* <AcButton eleid="updatebtnlink" avariant="success" asubmit={} aobj={this.state.sobj} avalidate={this.state.vobj} aclass=" formview-btn" atype="button">{this.props.t('btnnames.update')}</AcButton> */}
                        <Button variant="success" style={{margin:"0px 5px 0px 5px"}} className={"formview-btn "+(this.props.isRTL==="rtl"?"float-left":"float-right")} onClick={()=>this.handleDeptUpdate(this.state.sobj)}>{this.props.t('btnnames.update')}</Button>
                        {/* <AcButton eleid="updatebtnlink" avariant="success" asubmit={submitCollection.updateDepatments} aobj={this.state.sobj} avalidate={this.state.vobj} aclass=" formview-btn" atype="button" aresp={e => this.handleDeptSave(e,2)} >{this.props.t('btnnames.update')}</AcButton> */}
                        <AcButton eleid="deletebtnlink" avariant="danger" aconfirm={true} asubmit={submitCollection.deleteDepatments} aobj={this.state.sobj} avalidate={this.state.vobj} aclass=" formview-btn" atype="button" aresp={this.handleDeptDelete} >{this.props.t('btnnames.delete')}</AcButton>
                    </>
                    :
                    <>
                        {/* <AcButton eleid="savebtnlink" avariant="success" asubmit={submitCollection.saveDepatments} aobj={this.state.sobj} avalidate={this.state.vobj} aclass=" formview-btn" atype="button" aresp={e => this.handleDeptSave(e,1)} aloading={this.toggleLoading}>{this.props.t('btnnames.save')}</AcButton> */}
                        <Button variant="success" className="formview-btn" onClick={()=>{this.handleDeptSave(this.state.sobj)}} >{this.props.t('btnnames.save')}</Button>
                    </>
                    }
                </Modal.Footer>
            </Modal>

            <AcViewModal showmodal={this.state.loading} message={this.props.t('PLEASE_WAIT')}/>
        </>);
    }
}

const mapDispatchToProps = dispatch => ({
    setDeptPrevDetails: (payload) => dispatch(viewSetDeptPrevAction(payload)),
});

export default  withTranslation()(withRouter(connect(null,mapDispatchToProps)(DepartmentDetailsComponent)));