import React, { Component } from 'react'
import { Button, Modal, OverlayTrigger, Tooltip } from 'react-bootstrap'
import FeatherIcon from 'feather-icons-react';
import i18n from "../../../_translations/i18n";
import { confirmAlert } from 'react-confirm-alert';

import { submitCollection } from '../../../_services/submit.service';
import { submitSets } from '../../UiComponents/SubmitSets';
import { alertService } from '../../../_services/alert.service';

import './MPAlertBox.css'

import { AcViewModal } from '../../UiComponents/AcImports';
class MpDropProdAlertBox extends Component {
    constructor(props) {
        super(props)

        this.state = {
            actionLoading: false,
        }
    }
    handleclickshortcut=(item)=>{
    var seltype=item.type
    var selproduct=this.props.selectedwarningdropprod
    if(seltype === "image" || seltype === "Hierarchy_Issue" || seltype === "Dimension" || seltype === "Department"){
        //product edit modal
        this.props.handleopenDetailmodal(selproduct)
    }else if(seltype==="Archived"){
        //restore
        this.restore(selproduct)
    }else if(seltype==="New"){
        // Mark as Old (Button)
        this.updateProductStatusToOld(selproduct)
    }else if(seltype==="None"){
        this.sendToDep(selproduct)
        //Send to dep (Button)
    }
    
    }
    
    returnButton=(item)=>{
        var seltype=item.type
        // return <Button onClick={()=>this.handleclickshortcut(item)}>cli</Button>
        if(seltype === "image" || seltype === "Hierarchy_Issue" || seltype === "Dimension" || seltype === "Department"){
            return <OverlayTrigger placement="top" overlay={<Tooltip className={"resolve-content-item-tooltip "}><label>{i18n.t("EDIT")}</label></Tooltip>}><Button onClick={()=>this.handleclickshortcut(item)}><FeatherIcon icon="edit" size="12"/></Button></OverlayTrigger>
        }else if(seltype==="Archived"){
            //restore
            return <OverlayTrigger placement="top" overlay={<Tooltip className={"resolve-content-item-tooltip "}><label>{i18n.t("btnnames.restore")}</label></Tooltip>}><Button onClick={()=>this.handleclickshortcut(item)}><FeatherIcon icon="rotate-ccw" size="12"/></Button></OverlayTrigger>
        }else if(seltype==="New"){
            // Mark as Old (Button)
            return <OverlayTrigger placement="top" overlay={<Tooltip className={"resolve-content-item-tooltip "}><label>{i18n.t("Mark_as_old")}</label></Tooltip>}><Button onClick={()=>this.handleclickshortcut(item)}><FeatherIcon icon="bookmark" size="12"/></Button></OverlayTrigger>
        }else if(seltype==="None"){
            //Send to dep (Button)
            return <OverlayTrigger placement="top" overlay={<Tooltip className={"resolve-content-item-tooltip "}><label>{i18n.t("SEND_TO_DEP")}</label></Tooltip>}><Button onClick={()=>this.handleclickshortcut(item)}><FeatherIcon icon="navigation" size="12"/></Button></OverlayTrigger>
        }
    }
    sendToDep = (pobj) =>{
        confirmAlert({
            title: i18n.t("CONFIRM_TO_SUBMIT"),
            message: i18n.t("NEW_PROD_SENDTODEP_CONFIRM"),
            overlayClassName: (this.props.isRTL === "rtl" ? "alertrtl-content" : ""),
            buttons: [{
                label: i18n.t('btnnames.yes'),
                onClick: () => {
                    let sobj ={};
                    sobj.id = pobj.id;
                    sobj.productId = pobj.id;
                    sobj.isFromNewProduct = true;

                    sobj.isUpdateAll = false;
                    sobj.productIds = [pobj.id];


                    this.setState({ actionLoading:true});
                    submitSets(submitCollection.updateProductStatusToOldAndSendToDep, sobj, true).then(resp => { //updateProductStatusToOld
                        this.setState({ actionLoading:false}); //
                        if(resp && resp.status){
                            alertService.success(i18n.t("succussfuly")+" " +i18n.t("saved"));
                            
                            if(typeof this.props.reloadProdWarnModalDetails !== undefined){
                                this.props.reloadProdWarnModalDetails();
                            }
                        }
                        else{
                            alertService.error((resp&&resp.extra?resp.extra:i18n.t('ERROR_OCCURRED')));
                        }
                    });
                    return false;
                }
                
            }, {
                label: i18n.t('btnnames.no'),
                onClick: () => {
                    return false;
                }
            }]
        });
    }
    updateProductStatusToOld=(pobj)=>{
        confirmAlert({
            title: i18n.t("CONFIRM_TO_SUBMIT"),
            message: i18n.t("SURE_TO_MARK_AS_OLD"),
            overlayClassName: (this.props.isRTL === "rtl" ? "alertrtl-content" : ""),
            buttons: [{
                label: i18n.t('btnnames.yes'),
                onClick: () => {
                    let sobj ={productId:pobj.id};

                    this.setState({ actionLoading:true});
                    submitSets(submitCollection.updateProductStatusToOld, sobj, true).then(resp => {
                        this.setState({ actionLoading:false});
                        if(resp && resp.status){
                            alertService.success(i18n.t("succussfuly")+" " +i18n.t("saved"));

                            if(typeof this.props.reloadProdWarnModalDetails !== undefined){
                                this.props.reloadProdWarnModalDetails();
                            }
                        }
                        else{
                            alertService.error((resp&&resp.msg?resp.msg:resp&&resp.extra?resp.extra:i18n.t('ERROR_OCCURRED')));
                        }
                    });
                    return false;
                }
                
            }, {
                label: i18n.t('btnnames.no'),
                onClick: () => {
                    return false;
                }
            }]
        });
    }
    restore = (pobj) =>{
        confirmAlert({
            title: i18n.t("CONFIRM_TO_RESTORE"),
            message: i18n.t("NEW_PROD_RESTORE_CONFIRM"),
            overlayClassName: (this.props.isRTL === "rtl" ? "alertrtl-content" : ""),
            buttons: [{
                label: i18n.t('btnnames.yes'),
                onClick: () => {
                    let sobj ={};
                    sobj.id = pobj.id;
                    sobj.productId = pobj.id;
                    sobj.isFromNewProduct = true;

                    sobj.isUpdateAll = false;
                    sobj.productIds = [pobj.id];

                    this.setState({ actionLoading:true});
                    submitSets(submitCollection.restoreProduct, sobj, true).then(resp => {
                        this.setState({ actionLoading:false});
                        if(resp && resp.status){
                            alertService.success(i18n.t("succussfuly")+" " +i18n.t("saved"));

                            if(typeof this.props.reloadProdWarnModalDetails !== undefined){
                                this.props.reloadProdWarnModalDetails();
                            }
                        }
                        else{
                            alertService.error((resp&&resp.msg?resp.msg:resp&&resp.extra?resp.extra:i18n.t('ERROR_OCCURRED')));
                        }
                    });
                    return false;
                }
                
            }, {
                label: i18n.t('btnnames.no'),
                onClick: () => {return false;}
            }]
        });
    }

    render() {
        var {Normal_text,bold_text,successbtnText,successBoderText,icon,List,ListTitle, selectedwarningdropprod}=this.props
        return (<>
            <Modal className={"dropwarning MPAlertBox"+(List?" Listhave":"")} show={this.props.isshow} onHide={()=>this.props.handleShowHide(false)}
                size="md" aria-labelledby="contained-modal-title-vcenter" centered backdrop="static" >
                <Modal.Header closeButton>
                    <Modal.Title></Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div className='messagediv'>
                        {icon?<div className='icondiv'>{icon}</div>:<></>}
                        {Normal_text||bold_text?<h4>
                            {(Normal_text&&Normal_text!=="")?<span className='Normal_text'> {Normal_text}.{" "}</span>:<></>}
                            <br />
                            {(bold_text&&bold_text!=="")?<span className='bold_text'>{bold_text}</span>:<></>}
                        </h4>:<></>}
                        {List&&List.length>0?<div className='listing'>
                            {(ListTitle!=="")?<div className='bold_text'><span>{ListTitle}</span></div>:<></>}
                            <ul>
                            {List.map((item,i)=>{
                                return <React.Fragment key={i}>
                                    <li className={(item.type === "None" && selectedwarningdropprod.completeStatus !== "FullData"?"disabled":"")}><div className={'listdiv'}><span style={{maxWidth:"87%"}}>{item.text}</span>{this.returnButton(item)}</div></li>
                                </React.Fragment>
                            })}
                            </ul>
                        </div>:<></>}
                    </div>
                </Modal.Body>
                <Modal.Footer>
                    {successBoderText?<Button  className='btn noaction' onClick={()=>this.props.successBoderAction()}>{successBoderText}</Button>:<></>}
                    {successbtnText?<Button className='btn action'  onClick={()=>this.props.successbtnAction()}>{successbtnText}</Button>:<></>}
                </Modal.Footer>
            </Modal>

            <AcViewModal showmodal={this.state.actionLoading} message={i18n.t('PLEASE_WAIT')} />
        </>)
    }
}

export default MpDropProdAlertBox