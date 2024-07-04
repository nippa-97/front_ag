import React, { Component } from 'react';
import { Button, Modal, Form, Row, Col } from 'react-bootstrap';
import { withTranslation } from 'react-i18next';
import {  withRouter } from 'react-router-dom';
//import Select from 'react-select';

import { submitCollection } from '../../../../_services/submit.service';
import { submitSets } from '../../../UiComponents/SubmitSets';

import { alertService } from '../../../../_services/alert.service';
import { shelfLifeEnums, paceScaleEnums } from '../../../../enums/masterPlanogramEnums';

import './deptquestions.css';

import loadinggif from '../../../../assets/img/loading-sm.gif';

class MPDeptQuestionsModal extends Component {
    constructor(props){
        super(props);

        this._isMounted = false;
        
        this.state = {
            deptsettings: { chain_has_department_id: 0, min_qty: 0, max_qty: 0, min_revenue: 0, max_revenue: 0, shelf_life: 0, pace_of_sale_qty: 0 },
            isdataloaded: false,
        }
    }

    componentDidMount(){
        this._isMounted = true;

        if (this._isMounted) {
            this.loadSettingDetails();
        }
    }

    componentWillUnmount(){
        this._isMounted = false;
    }
    //get chain dept meta data onload of modal
    loadSettingDetails = () => {
        if(this.props.defSaveObj){
            let checkobj = "?chainHasDepartmentId="+this.props.defSaveObj.department.department_id+",&mp_id="+this.props.defSaveObj.mp_id;
            
            submitSets(submitCollection.getDepartmentMetaData, checkobj, false).then(res => {
                //console.log(res);
    
                if(res && res.status){
                    this.setState({ deptsettings: res.extra, isdataloaded: true });
                } else{
                    let defdeptsettings = this.state.deptsettings;
                    defdeptsettings["chain_has_department_id"] = this.props.defSaveObj.department.department_id;
                    this.setState({ deptsettings: defdeptsettings, isdataloaded: true });
                }
            });
        }
    }
    //increase/decrease object
    handleIncrease = (key, isincrease) => {
        let settingobj = this.state.deptsettings;
        let selectvalue = parseFloat(settingobj[key]);
        let changevalue = (isincrease?(selectvalue + 1):(selectvalue - 1));
        
        settingobj[key] = (changevalue > 0?changevalue:0);

        this.setState({ deptsettings: settingobj });
    }
    //change setting object
    handleChanges = (key, value, isnumber) => {
        let settingobj = this.state.deptsettings;
        settingobj[key] = (value > 0?parseFloat(value):0);
        
        this.setState({ deptsettings: settingobj });
    }

    handleSave = (isskip) => {
        let settingobj = this.state.deptsettings;
        if(!isskip){
            if(settingobj.min_qty <= 0){
                alertService.error(this.props.t("required_minqty"));
                return false;
            }
            if(settingobj.max_qty <= 0 || settingobj.max_qty < settingobj.min_qty){
                alertService.error(this.props.t("required_maxqty"));
                return false;
            }
            if(settingobj.min_revenue <= 0){
                alertService.error(this.props.t("required_minrev"));
                return false;
            }
            if(settingobj.max_revenue <= 0 || settingobj.max_revenue < settingobj.min_revenue){
                alertService.error(this.props.t("required_maxrev"));
                return false;
            }
            if(settingobj.shelf_life <= 0){
                alertService.error(this.props.t("required_shelflife"));
                return false;
            }
            if(settingobj.pace_of_sale_qty <= 0){
                alertService.error(this.props.t("required_pacesale"));
                return false;
            }

            this.setState({ isdataloaded: false }, () => {
                submitSets(submitCollection.updateDepartmentMetaData, settingobj, false, null, true).then(res => {
                    //console.log(res);
    
                    if(res && res.status){
                        this.setState({ isdataloaded: true }, () => {
                            this.props.handleRedirectView();
                        });
                    } else{
                        // alertService.error(res && res.extra?res.extra:"Error occurred");
                        this.setState({ isdataloaded: true });
                    }
                });    
            });
        } else{
            this.props.handleRedirectView();
        }
    }

    render() {

        return (
            
                <Modal className={"MPDeptQuestionsModal"} size="lg" dir={this.props.isRTL} centered show={this.props.isshow} onHide={()=>this.props.toggleDeptModal()}>
                    {!this.state.isdataloaded?<Col className="overlay-loading">
                        <img src={loadinggif} className="img-fluid" alt="loading" />
                    </Col>:<></>}
                    <Modal.Body>
                        <Modal.Header closeButton>
                            <Modal.Title>{this.props.t("department_meta_data")}</Modal.Title>
                        </Modal.Header>

                        <div className='fieldsdiv'>
                            <div className='SelectCategory'>
                                <div className='categoryselect'>
                                    <Row>
                                        <Col>
                                            <div className="sub-item">
                                                <label>{this.props.t("minqty")}</label>
                                                <div className="input-number">
                                                    <button type="button" onClick={e => this.handleIncrease("min_qty")}>&minus;</button>
                                                    <Form.Control type="number" value={this.state.deptsettings.min_qty} onChange={e => this.handleChanges("min_qty",e.target.value,true)} />
                                                    <button type="button" onClick={e => this.handleIncrease("min_qty", true)}>&#43;</button>     
                                                </div>
                                            </div>
                                            <div className="sub-item">
                                                <label>{this.props.t("minrev")}</label>
                                                <div className="input-number">
                                                    <button type="button" onClick={e => this.handleIncrease("min_revenue")}>&minus;</button>
                                                    <Form.Control type="number" value={this.state.deptsettings.min_revenue} onChange={e => this.handleChanges("min_revenue",e.target.value,true)} />
                                                    <button type="button" onClick={e => this.handleIncrease("min_revenue", true)}>&#43;</button>     
                                                </div>
                                            </div>
                                            <div className="sub-item">
                                                <label>{this.props.t("shelvelife")}</label>
                                                <div className="input-number">
                                                    <button type="button" onClick={e => this.handleIncrease("shelf_life")}>&minus;</button>
                                                    <Form.Control type="number" value={this.state.deptsettings.shelf_life} onChange={e => this.handleChanges("shelf_life",e.target.value,true)} />
                                                    <button type="button" onClick={e => this.handleIncrease("shelf_life", true)}>&#43;</button>     
                                                </div>
                                                <div className='input-select'>
                                                    <Form.Control as="select" value={this.state.deptsettings.shelf_life_uom} onChange={e => this.handleChanges("shelf_life_uom",e.target.value)}>
                                                        {Object.keys(shelfLifeEnums).map(xidx => {
                                                            return <option key={xidx} value={xidx}>{this.props.t(xidx)}</option>
                                                        })}
                                                    </Form.Control>
                                                </div>
                                            </div>
                                        </Col>
                                        <Col>
                                            <div className="sub-item">
                                                <label>{this.props.t("maxqty")}</label>
                                                <div className="input-number">
                                                    <button type="button" onClick={e => this.handleIncrease("max_qty")}>&minus;</button>
                                                    <Form.Control type="number" value={this.state.deptsettings.max_qty} onChange={e => this.handleChanges("max_qty",e.target.value,true)} />
                                                    <button type="button" onClick={e => this.handleIncrease("max_qty", true)}>&#43;</button>     
                                                </div>
                                            </div>
                                            <div className="sub-item">
                                                <label>{this.props.t("maxrev")}</label>
                                                <div className="input-number">
                                                    <button type="button" onClick={e => this.handleIncrease("max_revenue")}>&minus;</button>
                                                    <Form.Control type="number" value={this.state.deptsettings.max_revenue} onChange={e => this.handleChanges("max_revenue",e.target.value,true)} />
                                                    <button type="button" onClick={e => this.handleIncrease("max_revenue", true)}>&#43;</button>     
                                                </div>
                                            </div>
                                            <div className="sub-item">
                                                <label>{this.props.t("paceOfSalesInQty")}</label>
                                                <div className="input-number">
                                                    <button type="button" onClick={e => this.handleIncrease("pace_of_sale_qty")}>&minus;</button>
                                                    <Form.Control type="number" value={this.state.deptsettings.pace_of_sale_qty} onChange={e => this.handleChanges("pace_of_sale_qty",e.target.value,true)} />
                                                    <button type="button" onClick={e => this.handleIncrease("pace_of_sale_qty", true)}>&#43;</button>     
                                                </div>
                                                <div className='input-select'>
                                                    <Form.Control as="select" value={this.state.deptsettings.pace_of_sale_qty_uom} onChange={e => this.handleChanges("pace_of_sale_qty_uom",e.target.value)}>
                                                        {Object.keys(paceScaleEnums).map(xidx => {
                                                            return <option key={xidx} value={xidx}>{this.props.t(xidx)}</option>
                                                        })}
                                                    </Form.Control>
                                                </div>
                                            </div>
                                        </Col>
                                    </Row>
                                    
                                </div>
                            </div>
                        </div>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button className="btn-save-cat float-left back" onClick={()=>this.props.toggleDeptModal()}>{this.props.t("btnnames.back")}</Button>
                        <Button className="btn-save-cat" onClick={()=>this.handleSave()}>{this.props.t("continue_btn")}</Button>
                        <Button className="btn-save-cat skip" onClick={()=>this.handleSave(true)}>{this.props.t("skip_btn")}</Button>
                    </Modal.Footer>
        </Modal>
            
        );
    }
}

export default withTranslation()(withRouter(MPDeptQuestionsModal));