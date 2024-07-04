import React from 'react';
import { Button, Col, Form, Row } from 'react-bootstrap';
import FeatherIcon from 'feather-icons-react';
import { CopyToClipboard } from 'react-copy-to-clipboard'; //copy text to clipboard
// import { ChevronDownIcon } from '@primer/octicons-react';

import { TooltipWrapper } from '../../AddMethods';
import { InOutIcon } from '../../../../assets/icons/icons';
import { ProdSelectSearch, TypeSelectDrop, VerSelectDrop } from './additionalcomps';
import { alertService } from '../../../../_services/alert.service';
import { countTextCharacter, preventNumberInput } from '../../../../_services/common.service';
// import { NewProductEffect } from '../../../../enums/newProductEffectType';

export class SingleProdView extends React.Component {
    constructor(props) {
        super(props);

        this._ismounted = false;

        this.state = {
            testdays:0
        };
    }

    componentDidMount() {
        this._ismounted = true;

        if(this._ismounted){
        }
    }
   
    componentWillUnmount() {
        this._ismounted = false;
    }
    handleChangeTxt = (evt, isonblur, isfacingvalue, ckey) => {
        if(!isonblur && evt.which){
            let facingmethod = (this.props.proditem.facing && this.props.proditem.facing.method?this.props.proditem.facing.method:"num");
            let methodvalidation = (facingmethod === "perc"?evt.which !== 110 && evt.which !== 190:true);
            
            if(!(evt.ctrlKey && evt.which === 65) && evt.which !== 8 && methodvalidation && (evt.which < 37 || evt.which > 40) && (evt.which < 48 || evt.which > 57) && (evt.which < 96 || evt.which > 105)){
                evt.preventDefault();
            }
            
        }
       
  
        if(isonblur){
            if(isfacingvalue){
                if(evt.target.value&& preventNumberInput(evt.target.value,this.props.t('validation.NumberInputValidation'))){
                    evt.preventDefault();
                    return false;
                }
                // let evtxt = (evt.target.value !== ""?parseFloat(evt.target.value):0);
                let evtxt = evt.target.value;
                this.props.updateSingleProd(this.props.prodidx, this.props.gpidx, "value", evtxt);
            }else{
            //    let temp = JSON.parse(JSON.stringify(this.props.proditem))
                // let evtxt = (evt.target.innerText !== ""?parseFloat(evt.target.innerText):0);
                let evtxt = (ckey === "minFaceLimit"?evt.target.value:evt.target.value !== ""?evt.target.value:"");
                if(ckey === "minFaceLimit" ){
                    if(evtxt === ""){
                        alertService.error(this.props.t("ENTER_VALIDTES_Min_Facing_VALUE"));
                        evtxt = ""
                    }else{
                        if(parseInt(evtxt) <= 0){
                            alertService.error(this.props.t("ENTER_VALIDTES_Min_Facing_VALUE"));
                            return false;
                        }
                        if(evt.target.value && preventNumberInput(evt.target.value ,(this.props.t('validation.NumberInputValidation')))){
                            evt.preventDefault();
                            return false
                        }
                    }
                  
                }

                if(ckey === "testperiod"){
                    if(evt.target.value&& preventNumberInput(evt.target.value,this.props.t('validation.NumberInputValidation'))){
                        evt.preventDefault();
                        return false;
                    }
                }
                this.props.updateSingleProd(this.props.prodidx, this.props.gpidx, (ckey === "minFaceLimit"?"minFaceLimit":"testPeriod"), evtxt);
            }
        }
    }

    replaceProdUpdate = (isNew, prodObj, prodIdx, replaceidx,mandatoryOption) => {
        // console.log(isNew, prodObj, prodIdx);
        let replaceprodlist = (this.props.proditem.strategy?JSON.parse(JSON.stringify(this.props.proditem.strategy.replaceProductList)):[]);
        
        if(isNew){
            let isalreadyadded = replaceprodlist.findIndex(x => x.productId === prodObj.productId);
            
            if(isalreadyadded === -1){
                let newprodobj = prodObj;
                newprodobj["imgUrl"] = newprodobj.imageUrl;
                newprodobj["mandatoryOption"] = mandatoryOption?mandatoryOption:"none"
                replaceprodlist.push(newprodobj);

                this.props.updateSingleProd(this.props.prodidx, this.props.gpidx, "replaceProductList", replaceprodlist);
            } else{
                alertService.error(this.props.t("already_added"));
            }
        } else{
            replaceprodlist.splice(replaceidx, 1);
            
            this.props.updateSingleProd(this.props.prodidx, this.props.gpidx, "replaceProductList", replaceprodlist);
        }
    }   

    mutipleVerSelect = (isused, parentidx, childidx) => {
        let allVersionsList = this.props.allVersionsList;
        let curverlist = this.props.proditem.vmpVerList;

        if(isused){
            let isUsedChecked = (this.props.proditem.isUsedChecked?this.props.proditem.isUsedChecked:false);
            let allusedlist = allVersionsList.filter(z => z.type === "used");

            for (let i = 0; i < allusedlist.length; i++) {
                const newveritem = allusedlist[i];
                let isalreadyadded = curverlist.findIndex(x => x === newveritem.mpId);

                if(isUsedChecked){
                    if(isalreadyadded > -1){
                        curverlist.splice(isalreadyadded, 1);
                    }
                } else{
                    if(isalreadyadded === -1){
                        curverlist.push(newveritem.mpId);
                    }
                }
                
            }

            this.props.updateSingleProd(parentidx, childidx, "isUsedChecked", !isUsedChecked, null, true);
        } else{
            let isUnusedChecked = (this.props.proditem.isUnusedChecked?this.props.proditem.isUnusedChecked:false);
            let allunusedlist = allVersionsList.filter(z => z.type === "unused");

            for (let i = 0; i < allunusedlist.length; i++) {
                const newveritem = allunusedlist[i];
                let isalreadyadded = curverlist.findIndex(x => x === newveritem.mpId);

                if(isUnusedChecked){
                    if(isalreadyadded > -1){
                        curverlist.splice(isalreadyadded, 1);
                    }
                } else{
                    if(isalreadyadded === -1){
                        curverlist.push(newveritem.mpId);
                    }
                }
            }

            this.props.updateSingleProd(parentidx, childidx, "isUnusedChecked", !isUnusedChecked, null, true);
        }
        
        this.props.updateSingleProd(parentidx, childidx, "vmpVerList", curverlist, true);
    }
    
    render() {
        let { prodidx, gpidx, proditem, isDisabledChange } = this.props;
    
        let isProdSelected = (!this.props.isGroupItem?this.props.newGroupList.findIndex(zitem => zitem.prodobj.uuid === this.props.groupitem.uuid):false);
        return (<>
            <Col xs={12} md={this.props.isGroupItem?6:3} className='singleprod-content'>
                <Col  className={'inner-wrapper '+(this.props.isShowGrouping?"groupview":"")+(!this.props.isGroupItem && this.props.isShowGrouping && isProdSelected === -1?" selected":"")}>
                    {this.props.isShowGrouping?<div className='groupoverlay-wrapper' onClick={() => this.props.handleAddNewSelected(this.props.groupitem, prodidx)}></div>:<></>}

                    {!this.props.isGroupItem && !this.props.isShowGrouping?<>
                        <div className={'check-wrapper'+(proditem.isChecked?" active":"")}>
                            <ul className='list-inline'>
                                {!isDisabledChange?<li className='list-inline-item'><label onClick={() => this.props.handleProductSelect(prodidx, "isChecked", !this.props.groupitem.isChecked)} className={'checkicon'+(this.props.groupitem.isChecked?" active":"")}><FeatherIcon icon="check" size={20} /></label></li>:<></>}
                                {isDisabledChange?<li className='list-inline-item viewtypes'>
                                    <label className='delete-icon' onClick={() => this.props.handleCancelProd(proditem)} title={this.props.t("CANCEL_PRODSTATE")}><FeatherIcon icon="x" size={14} /></label>
                                </li>:<></>}
                            </ul>
                        </div>
                        {/* <div className={'check-wrapper'+(this.props.groupitem.isChecked?" active":"")}>
                            <label onClick={() => this.props.handleProductSelect(prodidx, "isChecked", !this.props.groupitem.isChecked)}><FeatherIcon icon="check" size={20} /></label>
                        </div> */}
                    </>:<></>} {/* active */}
                    <Col xs={12} className={'inner-content '+(this.props.isShowGrouping && isProdSelected === -1?"groupview":"")}>
                        {this.props.isGroupItem && isDisabledChange?
                            <label className='delete-icon-group' onClick={() => this.props.handleCancelProd(proditem)} title={this.props.t("CANCEL_PRODSTATE")}><FeatherIcon icon="x" size={14} /></label>
                        :<></>}
                        <small className='topcontent'><b>{proditem.productInfo.brand?proditem.productInfo.brand:"-"}</b> <span>{proditem.productInfo.createdDate?proditem.productInfo.createdDate:"-"}</span></small>
                        <Row>
                            <Col xs={7}>
                                <h5 className='title-txt'><TooltipWrapper text={proditem.productInfo.productName}>
                                    <label className='long-txt'>{proditem.productInfo.productName}</label>
                                    </TooltipWrapper> 
                                
                                    <CopyToClipboard text={proditem.productInfo.barcode} onCopy={() => this.props.copyToClipboard()}><small>{proditem.productInfo.barcode}</small></CopyToClipboard>
                                </h5>
                                {!this.props.isGroupItem || this.props.isProdFormShow?<Col className={'form-inline'+(isDisabledChange?" auinewproddisabled":"")}>
                                    <Form.Control as={"select"} value={proditem.facing?proditem.facing.method:"num"} 
                                    onChange={e => this.props.updateSingleProd(prodidx, gpidx, "method", e.target.value)} size='sm'>
                                        <option value={"num"}>Fc</option>
                                        <option value={"perc"}>Per</option>
                                    </Form.Control>
                                    <Form.Control type='text' value={proditem.facing?proditem.facing.value:0} 
                                    onKeyDown={e => this.handleChangeTxt(e, false, true, "facing")}
                                    onChange={e => this.handleChangeTxt(e, true, true, "facing")} size='sm' placeholder='num' />
                                </Col>:<></>}
                            </Col>
                            <Col xs={5} className='image-view' onClick={() => this.props.handleImagePreviewModal(proditem.productInfo,true)}>
                                <img src={proditem.productInfo.imgUrl} className={"img-resize-ver"} alt="" />
                            </Col>
                            {!this.props.isGroupItem || this.props.isProdFormShow?<Col xs={12}>
                                <ul className={'applytype-list list-inline'}>
                                    {!isDisabledChange || (isDisabledChange && proditem.selectionOption === "all")?<li className='list-inline-item'>
                                        <Button variant='outline-secondary' className={'all'+(isDisabledChange?" auinewproddisabled":"")} active={proditem.selectionOption === "all"}  
                                        onClick={() => this.props.updateSingleProd(prodidx, gpidx, "selectionOption", (proditem.selectionOption !== "all"?"all":"none"))} size='sm'>
                                            {this.props.t("APPLY_TYPES.ALL")}
                                        </Button>
                                    </li>:<></>}
                                    {!isDisabledChange || (isDisabledChange && proditem.selectionOption === "used")?<li className='list-inline-item'>
                                        <Button variant='outline-secondary' className={'used'+(isDisabledChange?" auinewproddisabled":"")} disabled={this.props.isUsedDisabled} active={proditem.selectionOption === "used"} 
                                        onClick={() => this.props.updateSingleProd(prodidx, gpidx, "selectionOption", (proditem.selectionOption !== "used"?"used":"none"))} size='sm'>
                                            {this.props.t("APPLY_TYPES.USED")}
                                        </Button>
                                    </li>:<></>}
                                    {!isDisabledChange || (isDisabledChange && proditem.selectionOption === "selected")?<li className='list-inline-item'>
                                        <VerSelectDrop t={this.props.t}
                                            isDisabledChange={isDisabledChange}
                                            prodidx={prodidx}
                                            gpidx={gpidx}
                                            proditem={proditem}
                                            allVersionsList={this.props.allVersionsList}
                                            updateSingleProd={this.props.updateSingleProd}
                                            mutipleVerSelect={this.mutipleVerSelect}
                                            />
                                    </li>:<></>}
                        
                                </ul>
                            </Col>:<></>}
                        </Row>
                    </Col>
                    {!this.props.isGroupItem || this.props.isProdFormShow?<><div className='dash-line'></div>
                    <Col xs={12} className='inner-content bottom-content'>
                        <TypeSelectDrop t={this.props.t}
                            isDisabledChange={isDisabledChange}
                            proditem={proditem}
                            prodidx={prodidx}
                            gpidx={gpidx}
                            groupitem={this.props.groupitem}
                            updateSingleProd={this.props.updateSingleProd}
                            />

                    {
                       proditem.strategy.option === "minSales" && 
                       <Col className='d-flex gap-2'>
                            <Form.Control type='text' className={(isDisabledChange?" auinewproddisabled":"")} value={proditem.strategy?proditem.strategy.minFaceLimit:'Min face limit'} 
                        onKeyDown={e => this.handleChangeTxt(e, false, false, "minFaceLimit")}
                        onChange={e => this.handleChangeTxt(e, true, false, "minFaceLimit")} size='sm' placeholder='Min face limit' />
                            {/* <Form.Control className={(isDisabledChange?" auinewproddisabled":"")} as={"select"} value={proditem?proditem.strategy.minFacingMethod:"days"} 
                            onChange={e => this.props.updateSingleProd(prodidx, gpidx, "minFacingMethod", e.target.value)} size='sm'>
                            <option value={"days"}>{this.props.t('days')}</option>
                            <option value={"weeks"}>{this.props.t('weeks')}</option>
                            <option value={"months"}>{this.props.t('months')}</option>
                            <option value={"years"}>{this.props.t('years')}</option>
                            </Form.Control> */}
                        </Col>
                      
                     }
                     {
                        proditem.strategy.option === "replace" || isDisabledChange === true  ?
                        <ProdSelectSearch t={this.props.t} 
                            isDisabledChange={isDisabledChange}
                            proditem={proditem}
                            prodidx={prodidx}
                            replaceProductList={proditem.strategy?proditem.strategy.replaceProductList:[]}
                            searchObj={this.props.searchObj}
                            allVersionsList={this.props.allVersionsList}
                            copyToClipboard={this.props.copyToClipboard}
                            handleImagePreviewModal={this.props.handleImagePreviewModal}
                            selectedcard={this.props.selectedcard}
                            replaceProdUpdate={this.replaceProdUpdate}
                            setclickedcarddetails={this.props.setclickedcarddetails}
                            />:<></>
                    }
                    </Col>

                    <Col xs={12} className={'inout-content'+(proditem.isInOutProduct?" active":"")+(isDisabledChange?" auinewproddisabled":"")}>
                        <h6>
                            {/* <Form.Control type='text'value={proditem.testPeriod} 
                            onKeyDown={e => this.handleChangeTxt(e, false, false, "testperiod")}
                            onChange={e => this.handleChangeTxt(e, true, false, "testperiod")} size='sm' /> */}
                            {/* <div className='editabletxt'  contentEditable={isDisabledChange === true?false:true} suppressContentEditableWarning={true} onKeyDown={e => this.handleChangeTxt(e)} onBlur={e => this.handleChangeTxt(e, true, false, "testperiod")}>
                                {this.state.testdays?this.state.testdays:0}
                           </div> */}
                           <input type='text' className='editabletxt' style={{width:`${countTextCharacter(this.props.proditem.testPeriod)+2}ch`}} value={this.props.proditem.testPeriod}  onKeyDown={e => this.handleChangeTxt(e)} onChange={e => this.handleChangeTxt(e, true, false, "testperiod")} onBlur={()=>this.props.testperiodfocusout(this.props.prodidx,gpidx)} />
                            {this.props.t("TEST_DAYS")}
                 
                        </h6>
                        <span className='icon-view' onClick={() => this.props.updateSingleProd(this.props.prodidx, this.props.gpidx, "isInOutProduct", !proditem.isInOutProduct)}><InOutIcon size={18} /></span>
                    </Col></>:<></>}
                </Col>
            </Col>
        </>);
    }
}
