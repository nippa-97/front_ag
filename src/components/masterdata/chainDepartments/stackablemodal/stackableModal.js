import React, { PureComponent } from 'react'
import { Button, Col, Form, Modal, OverlayTrigger, Row, Tooltip } from 'react-bootstrap'
import { withTranslation } from 'react-i18next'
import { AcInput, AcViewModal, ValT } from '../../../UiComponents/AcImports'
import { withRouter } from 'react-router-dom';
import { confirmAlert } from 'react-confirm-alert';
import { InfoIcon } from '@primer/octicons-react';

import { alertService } from '../../../../_services/alert.service';
import { submitCollection } from '../../../../_services/submit.service';
import { submitSets } from '../../../UiComponents/SubmitSets';

import './stackableModal.scss';

class StackableModal extends PureComponent {
    constructor(props) {
        super(props)

        this.state = {
            maxStackableCount:0,
            sobj: {},
            vobj: {},
            showstackable:false,
        }
    }
    componentDidMount(){
        this._isMounted = true;

        if(this._isMounted){
            this.setState({
                sobj:this.defaultObjectLoad()
            })
        }
    }
    componentWillUnmount(){
        this._isMounted = false;
    }
    //default product object
    defaultObjectLoad = () => {
        return {
            level: this.props.level,
            id: this.props.sid,
            isStackable: false,
            isAffectedToAll: false,
            maxStackableCount:0,
        };//, 
    }
    handleChangeDetails = (ctxt, ctype) => {
        setTimeout(() => {
            var csobj = this.state.sobj;
            csobj[ctype] = (ctxt===""?ctxt:ctxt > 0?ctxt:0);
            this.setState({sobj: csobj});
        }, 100);
    }
    handlebools=(val, ctype)=>{
        var csobj = this.state.sobj;
        csobj[ctype]=val
       
        this.setState({sobj: csobj});
        if(ctype==="isStackable"){
            this.setState({showstackable: val});
        }
    }
    sendBulkStackableApproval=()=>{
        var csobj=this.state.sobj
        csobj["maxStackableCount"]=(this.state.sobj.maxStackableCount===""?0:csobj.maxStackableCount)
      
        this.setState({loading:true},()=>{
            submitSets(submitCollection.getBulkStackableApproval, csobj, true).then(res => {
                if(res && res.status){
                    if(res.extra.haveToUpdateProdCount>0){
                        this.handlesendBulkStackableApprovalResp(res.extra.haveToUpdateProdCount)
                        this.setState({loading:false,hidestackmodal:true})
                    }else{
                        alertService.error(this.props.t("NO_PRODUCTS_AVAILABLE"))
                        this.setState({loading:false,hidestackmodal:false})
                    }
                   
                }else{
                    alertService.error(this.props.t("erroroccurred"))
                    this.setState({loading:false})
                }
    
            })
        })
        
    }
    handlesendBulkStackableApprovalResp=(count)=>{
        confirmAlert({
            title: this.props.t('This will affect '+count+" products. Are you sure?"),
            message: "",
            overlayClassName: (this.props.isRTL === "rtl" ? "alertrtl-content" : ""),
            buttons: [{
                label: this.props.t('btnnames.yes'),
                onClick: () => {
                    this.sendupdateStackableByBulkMode()
                }
            }, {
                label: this.props.t('btnnames.no'),
                onClick: () => {
                    this.setState({hidestackmodal:false})
                    return false;
                }
            }]
        });
    }
    sendupdateStackableByBulkMode=()=>{
        var csobj=this.state.sobj
        csobj["maxStackableCount"]=(this.state.sobj.maxStackableCount===""?0:csobj.maxStackableCount)
    
        this.setState({loading:true},()=>{
            submitSets(submitCollection.updateStackableByBulkMode, csobj, true).then(res => {
                if(res && res.status){
                    this.setState({loading:false}) 
                    alertService.success(this.props.t("PRODUCT_DETAILS_SUCCESSFULLY_UPDATED"))
                    this.props.handleClose()
                }else{
                    alertService.error(this.props.t("erroroccurred"))
                    this.setState({loading:false})
                }
    
            })
        })
    }
    render() {
        return (
            <Modal className={'planigo-Modal stackablemodal-depcat '+(this.props.isRTL==="rtl"?"RTL":"")} size='sm'  dir={this.props.isRTL}  show={this.props.show} onHide={this.props.handleClose} animation={false}  centered>
                <Modal.Header style={{display:this.state.hidestackmodal?"none":""}} closeButton>
                <Modal.Title>{this.props.selectedName}</Modal.Title>
                </Modal.Header>
                <Modal.Body style={{display:this.state.hidestackmodal?"none":""}}>
                    <Row>
                        <Col xs={8} className="stackable-lable"><Col>{this.props.t("MARK_PRODUCTS")}</Col></Col>
                        <Col xs={4} className="siwtchdiv">
                            <label className="switch-ONOffText switch-ONOffText-purple">
                                <input type="checkbox" className="switch-ONOffText-input" value={this.state.sobj.isStackable} onClick={(e)=>this.handlebools(!this.state.sobj.isStackable,"isStackable")} />
                                <span className="switch-ONOffText-label" data-on={this.props.t("STACKABLE")} data-off={this.props.t("NONSTACKABLE")}></span>
                                <span className="switch-ONOffText-handle"></span>
                            </label>

                        </Col>
                    </Row>
                    <hr></hr>
                    <Col style={{display:this.state.showstackable?"":"none"}}>
                        <Form.Group as={Col} xs={12} >
                            <OverlayTrigger
                                overlay={
                                    <Tooltip >
                                    {this.props.t("Max_Stack_count_zero_or_empty_means_no_stack_count")}
                                    </Tooltip>
                                }
                                >
                                <Button variant="secondary"  className='stackwarn-warn'><InfoIcon size={15} /></Button>
                            </OverlayTrigger>
                            <AcInput atype="number" aid="maxStackableCount" aplace={this.props.t('maxstackablecount')} adefval={this.state.sobj.maxStackableCount} aobj={this.state.sobj} avset={this.state.vobj} avalidate={[ValT.empty,ValT.number]} achange={e => this.handleChangeDetails(e, "maxStackableCount")} showlabel={true} isFull={true} msg={this.props.t('Character.StackableCount')} removeSpecialCharacter={true}/>
                        </Form.Group>
                        <hr></hr>
                    </Col>

                        <Col className="prodlist-container">
                            <Col className="form-subcontent">
                                <Form.Check type="checkbox" name="affectall" id="markallprods-to-stack" label={this.props.t('CHANGE_ALL_PRODUCTS_TO_NEW_MARKED_STATE')}
                                value={this.state.sobj.isAffectedToAll} onChange={(e) => this.handlebools(!this.state.sobj.isAffectedToAll,"isAffectedToAll")}
                                    />
                            </Col>
                        </Col>
                        
                </Modal.Body>
                <Modal.Footer style={{display:this.state.hidestackmodal?"none":""}}>
                    <Button variant="secondary" onClick={this.props.handleClose} size='sm' className={this.props.isRTL === "rtl"?"float-left":"float-right"}>{this.props.t("btnnames.close")}</Button>
                    <Button variant="primary" onClick={()=>this.sendBulkStackableApproval()} className={this.props.isRTL === "rtl"?"float-left":"float-right"}>{this.props.t("btnnames.save")}</Button>
                </Modal.Footer>
                <AcViewModal showmodal={this.state.loading} message={this.props.t('PLEASE_WAIT')} />
            </Modal>
        )
    }
}



export default withTranslation()(withRouter(StackableModal));