import React, { Component } from 'react';
import { Button, Form, Row, Col, FormSelect } from 'react-bootstrap';
import { withTranslation } from 'react-i18next';
import {  withRouter } from 'react-router-dom';
//import Select from 'react-select';
import moment from 'moment';
import DatePicker from "react-datepicker";

import { connect } from 'react-redux';

import { submitCollection } from '../../../../_services/submit.service';
import { submitSets } from '../../../UiComponents/SubmitSets';

import { alertService } from '../../../../_services/alert.service';
// import { shelfLifeEnums, paceScaleEnums } from '../../../../enums/masterPlanogramEnums';
import { validateDeptSettings } from '../../AddMethods';

import './deptquestions.css';

import loadinggif from '../../../../assets/img/loading-sm.gif';
import { preventNumberInput, preventinputotherthannumbers, restrictDecimalPoint, roundOffDecimal } from '../../../../_services/common.service';
import { AcViewModal } from '../../../UiComponents/AcImports';


import { newRefresh, selectedMasterPlanSetAction } from '../../../../actions/masterPlanogram/masterplanogram_action';
import { CalendarIcon } from '@primer/octicons-react';

class MPDeptMetaForm extends Component {
    constructor(props){
        super(props);

        this._isMounted = false;
        this.state = {
            bkpSettingObj: null,
            isShowLoadingModal: false,
            errors:{},
        }
    }

    componentDidMount(){
        this._isMounted = true;

        if (this._isMounted) {
            this.setState({ bkpSettingObj: JSON.parse(JSON.stringify(this.props.deptsettings)) }, () => {
                if(this.props.isneeddeptsettingvalid){
                    this.setDefaultDeptSetting(this.props.deptsettings);
                } else{
                    this.checkForExpantials(this.props.deptsettings);
                }
            });
        }
    }

    componentWillUnmount(){
        this._isMounted = false;
    }
    //check for scientific numbers and convert it to decimals
    checkForExpantials =(csetting, isdataloading, isreset) => {
        if(csetting){
            if(csetting.min_qty.toExponential()){
                csetting.min_qty = roundOffDecimal(csetting.min_qty,3);
            }

            // if(csetting.max_qty.toExponential()){
            //     csetting.max_qty = roundOffDecimal(csetting.max_qty,3);
            // }

            if(csetting.min_revenue.toExponential()){
                csetting.min_revenue = roundOffDecimal(csetting.min_revenue,3);
            }

            // if(csetting.max_revenue.toExponential()){
            //     csetting.max_revenue = roundOffDecimal(csetting.max_revenue,3);
            // }

            // if(csetting.shelf_life.toExponential()){
            //     csetting.shelf_life = roundOffDecimal(csetting.shelf_life,3);
            // }

            // if(csetting.pace_of_sale_qty.toExponential()){
            //     csetting.pace_of_sale_qty = roundOffDecimal(csetting.pace_of_sale_qty,3);
            // }

            if(csetting.mvp_percentage.toExponential()){
                csetting.mvp_percentage = roundOffDecimal(csetting.mvp_percentage,3);
            }
        }

        this.props.updatedeptobj(csetting, false, true);
    }
    
    setDefaultDeptSetting = (csetting, _callback) => {
        //if chain settings available
        let chainDetails = null;
        if(this.props.signedDetails && this.props.signedDetails.chain && this.props.signedDetails.chain.sale_weight_percentage !== undefined){
            chainDetails = this.props.signedDetails.chain;
        }
        // console.log(this.props.signedDetails);

        csetting["min_qty"] = 1;
        csetting["max_qty"] = 10000;
        csetting["min_revenue"] = 1;
        csetting["max_revenue"] = 10000;
        csetting["shelf_life"] = 1;
        csetting["pace_of_sale_qty"] = 1;
        csetting["mvp_percentage"] = 80;
        csetting["sale_weight_percentage"] = (chainDetails?chainDetails.sale_weight_percentage:50);
        csetting["profit_weight_percentage"] = (chainDetails?chainDetails.profit_weight_percentage:30);
        csetting["sold_qty_weight_percentage"] = (chainDetails?chainDetails.sold_qty_weight_percentage:10);
        csetting["searchFromDate"] = this.getCalculatedDate(new Date());
        csetting["searchToDate"] = new Date();
        
        this.props.updatedeptobj(csetting);

        if(_callback){
            _callback(csetting);
        }
    }

    getCalculatedDate = (dt) =>{
        var requiredDate= dt.setMonth(dt.getMonth() - 6);
        return new Date(requiredDate)
    }

    //increase/decrease object
    handleIncrease = (key, isincrease) => {
        let settingobj = this.props.deptsettings;
        let selectvalue = parseFloat(settingobj[key]);
        let changevalue = (isincrease?(selectvalue + 1):(selectvalue - 1));
    
        if(key === "mvp_percentage" ||key === "sale_weight_percentage" ||key === "profit_weight_percentage" || key === "sold_qty_weight_percentage"){
            if( changevalue && (parseInt(changevalue) > 100)){
                alertService.error(this.props.t('NumberInputValidation'));
                return true;
            }
        }
        
        settingobj[key] = (changevalue > 0?changevalue:0);

        this.props.updatedeptobj(settingobj);
    }
    
    validateDecimalValue = (evt) => {
        let regex = new RegExp(/^\d*\.?\d{0,3}$/g);
        let specialKeys = ['Backspace', 'Tab', 'End', 'ArrowLeft', 'ArrowRight', 'Del', 'Delete'];

        // Allow Backspace, tab, end, and home keys
        if (specialKeys.indexOf(evt.key) !== -1) {
          return false;
        }

        let current = evt.target.value;
        const position = evt.target.selectionStart;

        const next = [current.slice(0, position), evt.key === 'Decimal' ? '.' : evt.key, current.slice(position)].join('');
        return (next && !next.match(regex));
    }
    //change setting object
    handleChanges = (key, value, isnumber, evt,msg) => {
        let tempObj = structuredClone(this.props.deptsettings);
        let settingobj = this.props.deptsettings

        let changevalue = (isnumber && !isNaN(value) && value !== ""?value:value);
        // settingobj[key] = (isnumber && !isNaN(value)?value:value);
  
        if(key === "mvp_percentage"){
            if( value && (parseFloat(value) > 100)){
                alertService.error(this.props.t('validation.NumberInputValidation'));
                return true;
            }
        }

        if(key === "min_revenue"){
            if(evt && !preventinputotherthannumbers(evt,evt.target.value,(this.props.t('Character.min_rev')))){
                evt.preventDefault()
                alertService.error(this.props.t('Character.min_rev'));
                return ;
            }
        }

        if(key === "min_qty"){
            if(evt && preventNumberInput(value,(this.props.t('validation.NumberInputValidation')))){
                changevalue = tempObj[key]
                // settingobj[key] = tempObj[key]
                
            }
        }

        if(evt && restrictDecimalPoint(value,3)){
            // settingobj[key] = tempObj[key]
            changevalue = tempObj[key]
        }
        if(isnumber && key === "min_qty"){
            this.validateNumberField(key,value)
        }
        if(settingobj[key] !== changevalue){
            settingobj[key] = changevalue;//(value > 0?parseFloat(value):0);
            if(evt && this.validateDecimalValue(evt)){
                return false;
            }
            if(key === "mvp_percentage" || key === "sale_weight_percentage" || key === "profit_weight_percentage" || key === "sold_qty_weight_percentage" || key === "min_revenue" || key === "min_qty"){

                if(key === "min_revenue" || key === "min_qty"){
                    if(!preventinputotherthannumbers(evt,value,msg)){
                        return false
                    }
                }else{
                    if( value && (parseFloat(value) > 100)){
                        alertService.error(this.props.t('NumberInputValidation'));
                        return true;
                    }
                }
            }
            this.props.updatedeptobj(settingobj);
        }
        // this.props.updatedeptobj(settingobj);
    }
    
    validateNumberField = (key,value) =>{
        let errorObj = this.state.errors
        let msg = ""
        if(value === "" || value.length === 0){
            if(key === "min_qty"){
                msg = (this.props.t('validation.min_qty'));
            }else if(key === "mvp_percentage"){
                msg = (this.props.t('validation.mvp_percentage'));
            }else if(key === "min_revenue"){
                msg = (this.props.t('validation.min_revenue'));
            }
                
        }
        errorObj[key] = msg; 
        this.setState({
            error:errorObj
        })
    }

    validateNumberField = (key,value) =>{
        let errorObj = this.state.errors
        let msg = ""
        if(value === "" || value.length === 0){
            if(key === "min_qty"){
                msg = (this.props.t('min_qty_require'));
            }else if(key === "mvp_percentage"){
                msg = (this.props.t('mvp_percentage_require'));
            }else if(key === "min_revenue"){
                msg = (this.props.t('min_revenue_require'));
            }else if(key === "sale_weight_percentage"){
                msg = (this.props.t('sale_weight_percentage_require'));
            }else if(key === "profit_weight_percentage"){
                msg = (this.props.t('profit_weight_percentage_require'));
            }else if(key === "sold_qty_weight_percentage"){
                msg = (this.props.t('sold_qty_weight_percentage_require'));
            }
                
        }
        errorObj[key] = msg; 
        this.setState({
            error:errorObj
        })
    }
    
    inputNumberBlur = (key, value) => {

        let settingobj = this.props.deptsettings;
        let nval = (value===""?"":value);

        if(settingobj[key] !== parseFloat(nval)){
            settingobj[key] = (nval > 0?roundOffDecimal(parseFloat(nval),3):nval);
            
            // if(settingobj[key].toExponential()){
            //     settingobj[key] = roundOffDecimal(settingobj[key],3);
            // }
        }
        this.validateNumberField(key,value);

        //check for 100%
        if(key === "sale_weight_percentage" || key === "profit_weight_percentage" || key === "sold_qty_weight_percentage"){
            let salePer = (settingobj.sale_weight_percentage > 0?parseFloat(settingobj.sale_weight_percentage):0);
            let profitPer = (settingobj.profit_weight_percentage > 0?parseFloat(settingobj.profit_weight_percentage):0);
            let soldPer = (settingobj.sold_qty_weight_percentage > 0?parseFloat(settingobj.sold_qty_weight_percentage):0);

            let totalPer = (salePer + profitPer + soldPer);
            
            if(totalPer > 100){
                let reducePer = (totalPer - 100);
                settingobj[key] = roundOffDecimal((settingobj[key] - reducePer),2);

                alertService.warn(this.props.t("TOTAL_WEIGHT_CANNOT_BE_MORETHAN_100"));
            }
        }
        this.validateNumberField(key,value)
    }

    handleSave = (isskip) => {
        let defSaveObj = this.props.defSaveObj;
        //check empty
        var settingobj=this.props.deptsettings
        if(settingobj.min_qty===""||settingobj.min_revenue===""||settingobj.mvp_percentage===""||settingobj.profit_weight_percentage===""||
        settingobj.sale_weight_percentage===""||settingobj.sold_qty_weight_percentage===""){
            alertService.warn(this.props.t("FILL_ALL_REQ_FIELDS"))
        }else{
            if(defSaveObj.mp_id === -1 || defSaveObj.mp_id === -2 ){
                if(this.props.mpstate.mpVersionName && this.props.mpstate.mpVersionName.name !== ""){
    
                    let settingobj = this.props.deptsettings;
                    settingobj["mpId"] = defSaveObj.mp_id;
        
                    let svobj = { 
                        chainHasDepartmentId:settingobj.chain_has_department_id, 
                        name:(this.props.mpstate.mpVersionName?this.props.mpstate.mpVersionName.name:""), 
                        searchFromDate:settingobj.searchFromDate?settingobj.searchFromDate:new Date(moment().subtract(6, 'months').format()), 
                        searchToDate:settingobj.searchToDate?settingobj.searchToDate:new Date()
                    };
    
                    var cfdate = new Date(settingobj.searchFromDate);
                    var ctdate = new Date(settingobj.searchToDate);
    
                    if(settingobj.searchFromDate && settingobj.searchFromDate !== "" && settingobj.searchToDate && settingobj.searchToDate !== ""){
                        if(cfdate.getTime() > ctdate.getTime()){
                            alertService.error(this.props.t("ENDDATE_LOWERTHAN_STARTDATE"));
                            return false;
                        }
                    } else{
                        alertService.error(this.props.t("STARTEND_DATES_REQUIRED"));
                        return false;
                    }
                    
        
                    /* if(defSaveObj.mp_id === -2){
                        //console.log(this.props.mpstate.filterDates)
                        svobj = { 
                            chainHasDepartmentId:settingobj.chain_has_department_id, 
                            name:(this.props.mpstate.mpVersionName?this.props.mpstate.mpVersionName.name:""), 
                            //searchFromDate:(this.props.mpstate.filterDates && this.props.mpstate.filterDates !== null ? this.props.mpstate.filterDates.dates.fromdate : new Date(moment().subtract(6, 'months').format())), 
                            //searchToDate:(this.props.mpstate.filterDates && this.props.mpstate.filterDates !== null ? this.props.mpstate.filterDates.dates.todate : new Date())
                        };
                    }else{
                        svobj = { 
                            chainHasDepartmentId:settingobj.chain_has_department_id, 
                            name:(this.props.mpstate.mpVersionName?this.props.mpstate.mpVersionName.name:""), 
                            //searchFromDate:(this.props.mpstate.filterDates && this.props.mpstate.filterDates !== null ? this.props.mpstate.filterDates.dates.fromdate : new Date(moment().subtract(6, 'months').format())), 
                            //searchToDate:(this.props.mpstate.filterDates && this.props.mpstate.filterDates !== null ? this.props.mpstate.filterDates.dates.todate : new Date())
                        };
                    } */
        
                    let cobj = { mpObj: svobj, depMetaObj: settingobj }
                    // console.log(cobj);
                    
                    this.setState({ isShowLoadingModal: true }, () => {
                        submitSets(submitCollection.newMpVer, cobj ,false).then(res => {
                            //console.log(res);
                            this.props.updatedeptobj(null,false);
                            
                            if(res && res.status){
                                this.props.setMasterPlanAction(res.extra);
                                //console.log(this.props.mpstate)
                                this.props.updateSavefromChild(res.extra);
                                this.props.updatedeptobj(null,true);
    
                                if(this.props.ismodalview){
                                    this.props.handleRedirectView();
                                    
                                }
    
                                /* if(defSaveObj.mp_id === -1){
                                    this.props.setNewRefresh(true);
                                } */
    
                                if(this.props.dRulesreload){
                                    this.props.dRulesreload(true);
                                }
                            } else{
                                alertService.error(res && res.error?res.error.errorMessage:"Error");
                                this.props.updatedeptobj(null,true);
                            }
        
                            this.setState({ isShowLoadingModal: false });
                        });     
                    });
                }else{
                    //focus version name input
                    this.props.onNewUpdateClick();
                    alertService.warn(this.props.t("Enter_a_Version_Name"));
                }
    
                 
                // if(this.props.dRulesreload){
                //         this.props.updatedeptobj(null,true);
                //         this.props.dRulesreload();
                // }
    
            }else{
    
                let settingobj = this.props.deptsettings;
                settingobj["mpId"] = defSaveObj.mp_id;
                settingobj["fromDate"] = moment(this.props.chartFilterDates.fromdate).format("YYYY-MM-DD");
                settingobj["toDate"] = moment(this.props.chartFilterDates.todate).format("YYYY-MM-DD");
                settingobj["mp_id"] = this.props.defSaveObj.mp_id;
    
                if(!isskip){
                    if(!validateDeptSettings(settingobj, this.props.t, true)){
                        return false;
                    }
                    
                    this.props.updatedeptobj(null,false);
    
                    this.setState({ isShowLoadingModal: true }, () => {
                        submitSets(submitCollection.updateDepartmentMetaData, settingobj, false, null, true).then(res => {
                            //console.log(res);
                            
                            if(res && res.status){
                                this.props.updatedeptobj(null,true);
                                if(this.props.ismodalview){
                                    this.props.handleRedirectView();
                                    
                                }
                                if(this.props.dRulesreload){
                                    this.props.dRulesreload();
                                }
                            } else{
                                // alertService.error(res && res.extra?res.extra:"Error occurred");
                                this.props.updatedeptobj(null,true);
                            }
    
                            this.setState({ isShowLoadingModal: false });
                        });    
                    });
                      
                } else{
                    if(this.props.ismodalview){
                        this.props.handleRedirectView();
                    }
                }
            }
        }

    }

    handleCloseView = () => {
        let settingobj = this.props.deptsettings;

        if(this.props.isneeddeptsettingvalid && !validateDeptSettings(settingobj, this.props.t, true)){
            return false;
        }
        
        if(!this.props.isdeptupdateavailable){
            this.props.toggleDeptView(false);
        } else{
            alertService.error(this.props.t("UPDATE_DEP_CHANGES_FIRST"));
        }
    }

    handleResetView = () => {
        let defSaveObj = this.props.defSaveObj;
        let cbkpobj = JSON.parse(JSON.stringify(this.state.bkpSettingObj));
        this.setState({errors:{}})
        if(defSaveObj && defSaveObj.mp_id > -1){
            this.checkForExpantials(cbkpobj, false, true);
        } else{
            this.setDefaultDeptSetting(cbkpobj, (csettings) => {
                this.checkForExpantials(csettings, false, true);
            });
        }
    }
    handleKeyDown = (event) => {
        if(!(/[0-9/]/.test(event.key) || parseInt(event.keyCode) === 8  || parseInt(event.keyCode) === 37 || parseInt(event.keyCode) === 39)){
            event.preventDefault();
        }
    }
    render() {
        let defSaveObj = this.props.defSaveObj;

        return (<><Col xs={12} className="mpdep-fieldwrapper">
            <div className={'mpdep-fieldsdiv'+(!this.props.ismodalview?" layout-view":"")}>
                {!this.props.isdepdataloaded?<Col className="overlay-loading">
                    <img src={loadinggif} className="img-fluid" alt="loading" />
                </Col>:<></>}
                <Col className='SelectCategory'>
                    <Col className={'categoryselect'+(this.props.isAUIDisabled?" plg-readonly":"")}>
                        <Row>
                            <Col>
                                <Col xs={12}>
                                    {defSaveObj && defSaveObj.mp_id < 0?<div className="sub-item">
                                        <label>{this.props.t("FILTER_ITEMS.startdate")}</label>
                                        <div className="input-number" style={{width: "100%"}}>
                                            <span className='form-icon'><CalendarIcon size={16}/></span>
                                            <DatePicker showYearDropdown className="datepicker-txt" 
                                                onChange={(e) => this.handleChanges("searchFromDate",e)} 
                                                selected={this.props.deptsettings.searchFromDate} 
                                                popperProps={{ positionFixed: true }} 
                                                dateFormat="dd/MM/yyyy" popperPlacement="bottom" popperModifiers={{ flip: { behavior: ["bottom"] }, preventOverflow: { enabled: false }, hide: { enabled: false } }} 
                                                onKeyDown={this.handleKeyDown}
                                                placeholderText={"(DD/MM/YYYY)"}
                                                />
                                        </div>
                                    </div>:<></>}
                                    <div className="sub-item">
                                        <label>{this.props.t("minqty")}</label>
                                        <div className="input-number" style={{width: "100%"}}>
                                            {this.props.ismodalview?<>
                                                <button type="button" className='input-controls' onClick={e => this.handleIncrease("min_qty")}>&minus;</button>
                                                <Form.Control type="text" value={this.props.deptsettings.min_qty}  onChange={e => this.handleChanges("min_qty",e.target.value,true, e)} onKeyDown={(e)=>preventinputotherthannumbers(e,this.props.deptsettings.min_qty,(this.props.t('Character.min_qty')))}/>
                                                <button type="button" className='input-controls' onClick={e => this.handleIncrease("min_qty", true)}>&#43;</button>  
                                            </>:<ul className='list-inline num-select'>
                                                <li className='list-inline-item'><div  onClick={e => this.handleChanges("min_qty",1,true)} className={'num-view'+(parseInt(this.props.deptsettings.min_qty) === 1?" active":"")}>1</div></li>
                                                <li className='list-inline-item'><div onClick={e => this.handleChanges("min_qty",2,true)} className={'num-view'+(parseInt(this.props.deptsettings.min_qty) === 2?" active":"")}>2</div></li>
                                                <li className='list-inline-item'><div onClick={e => this.handleChanges("min_qty",3,true)} className={'num-view'+(parseInt(this.props.deptsettings.min_qty) === 3?" active":"")}>3</div></li>
                                                <li className='list-inline-item'><div onClick={e => this.handleChanges("min_qty",4,true)} className={'num-view'+(parseInt(this.props.deptsettings.min_qty) === 4?" active":"")}>4</div></li>
                                                <li className='list-inline-item'><div onClick={e => this.handleChanges("min_qty",5,true)} className={'num-view'+(parseInt(this.props.deptsettings.min_qty) === 5?" active":"")}>5</div></li>

                                                <li className='list-inline-item input-txt'>
                                                    <Form.Control type="number" value={this.props.deptsettings.min_qty} onBlur={e=> this.inputNumberBlur("min_qty",e.target.value)} onChange={e => this.handleChanges("min_qty",e.target.value,true, e,(this.props.t('min_qty_Validation')))} onKeyDown={(e)=>preventinputotherthannumbers(e,this.props.deptsettings.min_qty,(this.props.t('Character.min_qty')))} />   
                                                </li>               
                                            </ul>}   
                                        </div>
                                        <div className="errorMsg minQty-msg">{this.state.errors.min_qty}</div>  
                                    </div>
                                    <div className="sub-item">
                                        <label>{this.props.t("minrev")}</label>
                                        <div className="input-number" style={{width: "100%"}}>
                                            <button type="button" className='input-controls' onClick={e => this.handleIncrease("min_revenue")}>&minus;</button>
                                            <Form.Control type="text" value={this.props.deptsettings.min_revenue} onChange={e => this.handleChanges("min_revenue", e.target.value, true, e, (this.props.t('Min_Revenue_Validation')))} onBlur={e=> this.inputNumberBlur("min_revenue",e.target.value)} onKeyDown={(e)=>preventinputotherthannumbers(e,e.target.value,(this.props.t('Character.min_rev')))}/>
                                            <button type="button" className='input-controls' onClick={e => this.handleIncrease("min_revenue", true)}>&#43;</button>         
                                        </div>
                                        <div className="errorMsg">{this.state.errors.min_revenue}</div> 
                                    </div>
                                    <div className="sub-item">
                                        <label>{this.props.t("MVP")} %</label>
                                        <div className="input-number" style={{width: "100%"}}>
                                            <button type="button" className='input-controls' onClick={e => this.handleIncrease("mvp_percentage")}>&minus;</button>
                                            <Form.Control type='text'  value={this.props.deptsettings.mvp_percentage} onChange={e => this.handleChanges("mvp_percentage",e.target.value,true, e,(this.props.t('MVP_Validation')))} onBlur={e=> this.inputNumberBlur("mvp_percentage",e.target.value)} />
                                            <button type="button" className='input-controls' onClick={e => this.handleIncrease("mvp_percentage", true)}>&#43;</button>     
                                        </div>
                                        <div className="errorMsg">{this.state.errors.mvp_percentage}</div> 
                                    </div>
                                    {/* <div className="sub-item">
                                        <label>{this.props.t("shelvelife")}</label>
                                        <div className='inline-form'>
                                            <div className="input-number">
                                                <button type="button" className='input-controls' onClick={e => this.handleIncrease("shelf_life")}>&minus;</button>
                                                <Form.Control type="number" value={this.props.deptsettings.shelf_life} onChange={e => this.handleChanges("shelf_life",e.target.value,true, e)} onBlur={e=> this.inputNumberBlur("shelf_life",e.target.value)} onKeyDown={ (evt) => (evt.key === 'e'||evt.key === '-') && evt.preventDefault() } />
                                                <button type="button" className='input-controls' onClick={e => this.handleIncrease("shelf_life", true)}>&#43;</button>     
                                            </div>
                                            <div className='input-select'>
                                                <FormSelect value={this.props.deptsettings.shelf_life_uom} onChange={e => this.handleChanges("shelf_life_uom",e.target.value)}>
                                                    {Object.keys(shelfLifeEnums).map(xidx => {
                                                        return <option key={xidx} value={xidx}>{this.props.t(xidx)}</option>
                                                    })}
                                                </FormSelect>
                                            </div>    
                                        </div>
                                    </div> */}
                                    
                                </Col>
                            </Col>
                            <Col>
                                <Col xs={12}>
                                    {defSaveObj && defSaveObj.mp_id < 0?<div className="sub-item">
                                        <label>{this.props.t("FILTER_ITEMS.enddate")}</label>
                                        <div className="input-number" style={{width: "100%"}}>
                                            <span className='form-icon'><CalendarIcon size={16}/></span>
                                            <DatePicker showYearDropdown className="datepicker-txt" 
                                                onChange={(e) => this.handleChanges("searchToDate", e)} 
                                                selected={this.props.deptsettings.searchToDate} 
                                                popperProps={{ positionFixed: true }} 
                                                dateFormat="dd/MM/yyyy" popperPlacement="bottom" popperModifiers={{ flip: { behavior: ["bottom"] }, preventOverflow: { enabled: false }, hide: { enabled: false } }} 
                                                onKeyDown={this.handleKeyDown}
                                                placeholderText={"(DD/MM/YYYY)"}
                                                />
                                        </div>
                                    </div>:<></>}
                                    
                                    <div className='weight-wrapper'>
                                        <h3 className='title-txt'>{this.props.t("WEIGHT")}</h3>

                                        <div className="sub-item">
                                            <label>{this.props.t("sale")} %</label>
                                            <div className="input-number" style={{width: "100%"}}>
                                                <button type="button" className='input-controls' onClick={e => this.handleIncrease("sale_weight_percentage")}>&minus;</button>
                                                <Form.Control type="text" value={this.props.deptsettings.sale_weight_percentage}  onChange={e => this.handleChanges("sale_weight_percentage",e.target.value,true, e,this.props.t('Sale_Weight_Validation'))} onBlur={e=> this.inputNumberBlur("sale_weight_percentage",e.target.value)} />
                                                <button type="button" className='input-controls' onClick={e => this.handleIncrease("sale_weight_percentage", true)}>&#43;</button>     
                                            </div>
                                            <div className="errorMsg">{this.state.errors.sale_weight_percentage}</div> 
                                        </div>
                                        <div className="sub-item " style={{marginTop:"14.2px"}}>
                                            <label>{this.props.t("profit")} %</label>
                                            <div className="input-number" style={{width: "100%"}}>
                                                <button type="button" className='input-controls' onClick={e => this.handleIncrease("profit_weight_percentage")}>&minus;</button>
                                                <Form.Control type="text" value={this.props.deptsettings.profit_weight_percentage} onChange={e => this.handleChanges("profit_weight_percentage",e.target.value,true, e,(this.props.t('Profit_Weight_Validation')))} onBlur={e=> this.inputNumberBlur("profit_weight_percentage",e.target.value)} />
                                                <button type="button" className='input-controls' onClick={e => this.handleIncrease("profit_weight_percentage", true)}>&#43;</button>     
                                            </div>
                                            <div className="errorMsg">{this.state.errors.profit_weight_percentage}</div> 
                                        </div>
                                        <div className="sub-item" style={{marginTop:"9px"}}>
                                            <label>{this.props.t("soldQty")} %</label>
                                            <div className="input-number" style={{width: "100%"}}>
                                                <button type="button" className='input-controls' onClick={e => this.handleIncrease("sold_qty_weight_percentage")}>&minus;</button>
                                                <Form.Control  type="text"   value={this.props.deptsettings.sold_qty_weight_percentage} onChange={e => this.handleChanges("sold_qty_weight_percentage",e.target.value,true, e,(this.props.t('Sold_Qty_Validation')))} onBlur={e=> this.inputNumberBlur("sold_qty_weight_percentage",e.target.value)} />
                                                <button type="button" className='input-controls' onClick={e => this.handleIncrease("sold_qty_weight_percentage", true)}>&#43;</button>     
                                            </div>
                                            <div className="errorMsg">{this.state.errors.sold_qty_weight_percentage}</div>
                                        </div>
                                    </div>
                                    {/* <div className="sub-item">
                                        <label>{this.props.t("maxqty")}</label>
                                        <div className="input-number" style={{width: ("100%")}}>
                                            <button type="button" className='input-controls' onClick={e => this.handleIncrease("max_qty")}>&minus;</button>
                                            <Form.Control type="number" value={this.props.deptsettings.max_qty} onChange={e => this.handleChanges("max_qty",e.target.value,true, e)} onBlur={e=> this.inputNumberBlur("max_qty",e.target.value)} onKeyDown={ (evt) => (evt.key === 'e'||evt.key === '-') && evt.preventDefault() } />
                                            <button type="button" className='input-controls' onClick={e => this.handleIncrease("max_qty", true)}>&#43;</button>     
                                        </div>
                                    </div> */}
                                    {/* <div className="sub-item">
                                        <label>{this.props.t("maxrev")}</label>
                                        <div className="input-number" style={{width: ("100%")}}>
                                            <button type="button" className='input-controls' onClick={e => this.handleIncrease("max_revenue")}>&minus;</button>
                                            <Form.Control type="number" value={this.props.deptsettings.max_revenue} onChange={e => this.handleChanges("max_revenue",e.target.value,true, e)} onBlur={e=> this.inputNumberBlur("max_revenue",e.target.value)} onKeyDown={ (evt) => (evt.key === 'e'||evt.key === '-') && evt.preventDefault() } />
                                            <button type="button" className='input-controls' onClick={e => this.handleIncrease("max_revenue", true)}>&#43;</button>     
                                        </div>
                                    </div> */}
                                    {/* <div className="sub-item">
                                        <label>{this.props.t("paceOfSalesInQty")}</label>
                                        <div className='inline-form'>
                                            <div className="input-number">
                                                <button type="button" className='input-controls' onClick={e => this.handleIncrease("pace_of_sale_qty")}>&minus;</button>
                                                <Form.Control type="number" value={this.props.deptsettings.pace_of_sale_qty} onChange={e => this.handleChanges("pace_of_sale_qty",e.target.value,true, e)} onBlur={e=> this.inputNumberBlur("pace_of_sale_qty",e.target.value)} onKeyDown={ (evt) => (evt.key === 'e'||evt.key === '-') && evt.preventDefault() } />
                                                <button type="button" className='input-controls' onClick={e => this.handleIncrease("pace_of_sale_qty", true)}>&#43;</button>     
                                            </div>
                                            <div className='input-select'>
                                                <FormSelect value={this.props.deptsettings.pace_of_sale_qty_uom} onChange={e => this.handleChanges("pace_of_sale_qty_uom",e.target.value)}>
                                                    {Object.keys(paceScaleEnums).map(xidx => {
                                                        return <option key={xidx} value={xidx}>{this.props.t(xidx)}</option>
                                                    })}
                                                </FormSelect>
                                            </div>    
                                        </div>
                                    </div> */}
                                </Col>
                            </Col>
                        </Row>
                        
                    </Col>
                </Col>
            </div>

            <Col className={'footer-btns'+(!this.props.ismodalview?" layout-view":"")}>
                {this.props.ismodalview?<>
                    <Button className="btn-save-cat float-left back" onClick={()=>this.props.toggleDeptModal()}>{this.props.t("btnnames.back")}</Button>
                    <Button className="btn-save-cat" onClick={()=>this.handleSave()}>{this.props.t("continue_btn")}</Button>
                    <Button className="btn-save-cat skip" onClick={()=>this.handleSave(true)}>{this.props.t("skip_btn")}</Button>
                </>:<>
                    <Button className={"btn-save-cat back "+(this.props.isAUIDisabled?"plg-disable ":"")+(this.props.isRTL === "rtl"?"float-right":"float-left")} variant='danger' onClick={()=>this.handleResetView()} style={{margin: "auto 10px"}}>{this.props.t("btnnames.reset")}</Button>

                    {defSaveObj && defSaveObj.mp_id > -1?<Button className="btn-save-cat back" variant='secondary' onClick={()=>this.handleCloseView()} style={{margin: "auto 10px"}}>{this.props.t("btnnames.close")}</Button>:<></>}
                    <Button className={"btn-save-cat"+(this.props.isAUIDisabled?" plg-disable":"")} size="sm" ref={this.props.buttonRefUpdDepRuleRef} onClick={()=>this.handleSave()}>{this.props.t("btnnames.update")}</Button>
                </>}
            </Col>
        </Col>
        
        <AcViewModal showmodal={this.state.isShowLoadingModal} message={this.props.t("PLEASE_WAIT")} />
        </>);
    }
}

const mapDispatchToProps = dispatch => ({
    setMasterPlanAction: (payload) => dispatch(selectedMasterPlanSetAction(payload)),
    setNewRefresh: (payload) => dispatch(newRefresh(payload)),
});

export default withTranslation()(withRouter(connect(null,mapDispatchToProps)(MPDeptMetaForm)));