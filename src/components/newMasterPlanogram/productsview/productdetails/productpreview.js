import React, { Component } from 'react';
import { Button, Col, Modal, Row, Form, FormSelect } from 'react-bootstrap';
import { withTranslation } from 'react-i18next';
import {  withRouter } from 'react-router-dom';
import { XIcon } from '@primer/octicons-react';
import Select from 'react-select';
import { CopyToClipboard } from 'react-copy-to-clipboard'; //copy text to clipboard

import { submitSets } from '../../../UiComponents/SubmitSets';
import { submitCollection } from '../../../../_services/submit.service';
import { alertService } from '../../../../_services/alert.service';
import { ProductOptionIcons } from '../../../../assets/icons/icons';
import { shelfLifeEnums, paceScaleEnums } from '../../../../enums/masterPlanogramEnums';

//import { sampleprodtags } from '../../SampleData';

import './productpreview.css';
import {SnapshotWarning} from '../../../masterdata/products/AddNew/snapshotWarning';

class ProductPreview extends Component {
    constructor(props){
        super(props);

        this._isMounted = false;
        
        this.state = {
            alltags:[],
            selectedProduct: null,
            selectedTag:{tagId:0, tagName:""},
            adddedTags:[],
            
            snapshotAvailable:false,
            snapshotAvailableModal:false,
            snapshotsList:[{current: {label: ""},new: {label: ""}}],
            allProdData:null,
        }
    }

    componentDidMount(){
        this._isMounted = true;

        if (this._isMounted) {
            if(this.props.selectedProduct){
                this.setState({ selectedProduct: this.props.selectedProduct, adddedTags: (this.props.selectedProduct.productTags ? this.props.selectedProduct.productTags : [])});
            }
            if(this.props.loadedTagsList){
                var tagarr = [];
                for (let i = 0; i < this.props.loadedTagsList.length; i++) {
                    tagarr.push({ value: this.props.loadedTagsList[i].id, label:this.props.loadedTagsList[i].tagName},);
                }
                this.setState({alltags:tagarr});
            }
        }  
    }

    componentWillUnmount(){
        this._isMounted = false;
    }
    //change product object
    changeProductOpt = (key, value, isnumber) => {
        let selprod = JSON.parse(JSON.stringify(this.state.selectedProduct));
        
        //set override setting
        if(key === "isMvp"){
            //check override is activated
            if(!selprod.isManualAdded && !selprod.isMvp){
                alertService.error(this.props.t("ACTIVATE_OVERRIDE_TOCONTINUE")); 
                return false;
             }
             
            selprod.isManualAdded = true;
            selprod.isOnTop = false;

            if(value===false){
                selprod.isMandatory = false;
            }
        }
        if(key === "isOnTop"){
            //check override is activated
            if(!selprod.isManualAdded){
                alertService.error(this.props.t("ACTIVATE_OVERRIDE_TOCONTINUE")); 
                return false;
            }

            selprod.isManualAdded = true;
            selprod.isMvp = false;
            selprod.isMandatory = false;
        }
        if(key=== "isMandatory" && value===true){
            selprod.isManualAdded = true;
            selprod.isMvp = true;
            selprod.isOnTop = false;
        }
        //if mandatory selected true needs to be mvp product
        /* if(key === "isMandatory" && value === true && !selprod.isMvp){
            alertService.error(this.props.t("PRODUCT_NEEDS_TOBE_MVP"));
            return false;
        } */

        if(key === "isManualAdded"){
            if(selprod.isManualAdded){
                selprod.isOnTop = false;
                selprod.isMvp = false;
                selprod.isMandatory = false;
            }
        }

        if(isnumber){
            selprod[key] = (value !== "" && value > -1?value:0);
        } else{
            selprod[key] = value;
        }

        if(key === "isUseProdMinRev" && !value){
            selprod["minRevenue"] = 0;
        }
        
        this.setState({ selectedProduct: selprod });
    }
    //save product details
    handleSaveProduct = () => {
        let prodobj = this.state.selectedProduct;
        prodobj.productTags = this.state.adddedTags;
        this.props.handleSaveProduct(prodobj, this.state.snapshotAvailable);
    }

    //handle tag select change
    handleTagChange = (e) =>{
        let tempObj = this.state.selectedTag;
        tempObj.tagId = e.value;
        tempObj.tagName = e.label;
        this.setState({selectedTag:tempObj}, () => {
            this.addTag();
        });
    }

    //addNew Tag
    addTag = () =>{
        if(this.state.selectedTag.tagId && this.state.selectedTag.tagId>0){
            let seltag = this.state.selectedTag;
            let atags = this.state.adddedTags;
            for (let i = 0; i < atags.length; i++) {
                if(atags[i].tagId === seltag.tagId){
                    return false;
                }
            }
            atags.push(seltag);
            this.setState({adddedTags:atags,selectedTag:{tagId:0, tagName:""}});
        }
    }

    //remove tag
    removeTag = (i) =>{
        let atags = this.state.adddedTags;
        if(atags[i].productHasTagId){
            atags[i].isDelete = true;
        }
        else{
            atags.splice(i,1);
        }
        this.setState({adddedTags:atags});
    }

    //snapshot availabitlity check methods
    checkForSnapshotAvailability = () =>{
        var csobj = this.state.selectedProduct;
        if(csobj.isMvp === false && csobj.isOnTop === false && csobj.isManualAdded===true){
            alertService.error(this.props.t("CHECK_MVPONTOP_WHEN_OVERRIDE"));
            return false;
        }

        var tagsAvailable = false;
        for (let i = 0; i < csobj.productTags.length; i++) {
           if(csobj.productTags[i].isDelete!==true){tagsAvailable=true}
        }

        this.setState({loading:true, snapshotAvailable:false,});
        //console.log(tagsAvailable);
        //this.handleSnapshotAvailabilityModalToggle();
        
        //check if snapshots available , if it does pop up to the user to get input otherwise continue to product update
        var sobj = {
            subCategoryId: csobj.subCategoryId, brandId: csobj.brandId, productId: csobj.id, 
            flags: { isMvp: (csobj.isMvp?csobj.isMvp:false), isOnTop: (csobj.isOnTop?csobj.isOnTop:false), isMandatory: (csobj.isMandatory? csobj.isMandatory:false), isOnTopTag:tagsAvailable }
        }
        submitSets(submitCollection.hasSnapShot, sobj, true).then(resp => {
            this.setState({loading:false});
            if(resp && resp.status && resp.extra){
                if(resp.extra.isHasSnapShot===true){
                    var snapdata = resp.extra.snapDirection;
                    this.setState({snapshotAvailable:true, snapshotsList:snapdata});
                    this.handleSnapshotAvailabilityModalToggle();
                }
                else{
                   this.handleSaveProduct();
                }
            }
            else{
                //alertService.error((resp&&resp.msg?resp.msg:resp&&resp.extra?resp.extra:this.props.t('ERROR_OCCURRED')));
                this.handleSaveProduct();
            }
        });
    }

    continueToUpdateFromSnashotWarning = () =>{
        this.handleSnapshotAvailabilityModalToggle();
        this.handleSaveProduct();
    }

    handleSnapshotAvailabilityModalToggle = () =>{
        this.setState({snapshotAvailableModal:!this.state.snapshotAvailableModal});
    }

    copyToClipboard = () => {
        alertService.info(this.props.t("COPIED_TO_CLIP_BOARD"));
    }

    render() {

        let selprod = this.state.selectedProduct;

        return (
            <>
                <Modal className={"brandprod-preview "+(this.props.isRTL==="rtl"?"RTL":"LTR")+(!this.props.showFullSidebar?" mini-sidebar":"")} dir={this.props.isRTL} centered show={this.props.isshow} onHide={()=>this.props.toggleProductEditModal(false)} backdrop="static" animation={false}>
                    <Modal.Header closeButton>
                        {/* <Modal.Title>Add New Category</Modal.Title> */}
                    </Modal.Header>
                    <Modal.Body>
                        {selprod?<>
                            {
                                selprod.isOnTop===true ?
                                    <label className={"status-labeltxt"}>{this.props.t("isontopitem")}</label>
                                    : selprod.isMvp===true ?
                                        <label className={"status-labeltxt ismvp"}>{this.props.t("ismvpitem")}</label>
                                        :<></>
                            }
                            {/* <label className={"status-labeltxt "+(selprod.isMvp?"ismvp":"")}>{selprod.isMvp?this.props.t("ismvpitem"):this.props.t("isontopitem")}</label> */}
                            <Col className="summary-view">
                                <Col className="fieldview-thumb">
                                    <div className='preview-thumb' onClick={()=>this.props.handleImagePreviewModal({productId:(selprod.id?selprod.id:0)},true)}>
                                        <img src={selprod.imageUrl} className={(selprod.width >= selprod.height)?"img-resize-ver":"img-resize-hor"} alt="" />
                                    </div>
                                </Col>

                                <h4 className='summary-header'>
                                    <CopyToClipboard text={selprod.barcode} onCopy={() => this.copyToClipboard()}><small className='link-label'>{selprod.barcode}</small></CopyToClipboard>
                                    <br/>
                                    {selprod.brandName} - {selprod.productName}

                                </h4>
                            </Col>
                            
                            <Col className={"product-mddetails"} style={{pointerEvents: (this.props.isAUIDisabled === true?"none":"auto")}}>
                                <h4>{this.props.t("product_options")}</h4>
                                <Row>
                                    <Col xs={12} style={{padding:"0 5px"}}>
                                        <ul className="list-inline switch-formitems">
                                            <li className='list-inline-item'>
                                                <div className='content-dive'>
                                                    <div className={"text-content "+(selprod.isNOOS?"active":"")} onClick={() => this.changeProductOpt("isNOOS",!selprod.isNOOS)}>
                                                    <div className="icon-view"><ProductOptionIcons icontype="noos" size={36} /></div>{this.props.t('isnoos')} </div>
                                                </div>
                                            </li>
                                            <li className='list-inline-item'>
                                                <div className='content-dive'>
                                                    <div className={"text-content "+(selprod.isFavorite ?"active":"")} onClick={() => this.changeProductOpt("isFavorite",!selprod.isFavorite )}>
                                                    <div className="icon-view"><ProductOptionIcons icontype="favorite" size={36} /></div> {this.props.t('isfav')}</div>
                                                </div>
                                            </li>
                                            <li className='list-inline-item'>
                                                <div className='content-dive'>
                                                    <div className={"text-content "+(selprod.isPremium?"active":"")} onClick={() => this.changeProductOpt("isPremium",!selprod.isPremium)}>
                                                    <div className="icon-view"><ProductOptionIcons icontype="premium" size={36} /></div>{this.props.t('ispremium')}</div>
                                                </div>
                                            </li>
                                            <li className='list-inline-item'>
                                                <div className='content-dive'>
                                                    <div className={"text-content "+(selprod.isMandatory===true?"active":"")} onClick={() => this.changeProductOpt("isMandatory",!selprod.isMandatory)}>
                                                        <div className="icon-view"><ProductOptionIcons icontype="mandatory" size={32} /></div>
                                                        {this.props.t('IS_MANDATORY')}
                                                    </div>
                                                </div>
                                            </li>
                                            <li className='list-inline-item'>
                                                <div className='content-dive'>
                                                    <div className={"text-content "+(selprod.isStackable===true?"active":"")} onClick={() => this.changeProductOpt("isStackable",!selprod.isStackable)}>
                                                        <div className="icon-view"><ProductOptionIcons icontype="stackable" size={32} /></div>
                                                        {this.props.t('IS_stackable')}
                                                    </div>
                                                </div>
                                            </li>
                                            <li className='list-inline-item manualOverride'>
                                                <div className='content-dive'>
                                                    <div className={"text-content "+(selprod.isManualAdded===true?"active":"")} onClick={() => this.changeProductOpt("isManualAdded",!selprod.isManualAdded)}>
                                                        <div className="icon-view"><ProductOptionIcons icontype="manualOverride" size={32} /></div>
                                                        {this.props.t('manualOverride')}
                                                    </div>
                                                </div>
                                            </li>
                                            {selprod.isManualAdded?<>
                                                <li className='list-inline-item'>
                                                    <div className='content-dive'>
                                                        <div className={"text-content "+(selprod.isMvp?"active":"")} onClick={() => this.changeProductOpt("isMvp",!selprod.isMvp)}>
                                                        <div className="icon-view"><ProductOptionIcons icontype="mvp" size={36} /></div> {this.props.t('ismvp')}</div>
                                                    </div>
                                                </li>
                                                <li className='list-inline-item'>
                                                    <div className='content-dive'>
                                                        <div className={"text-content "+(selprod.isOnTop?"active":"")} onClick={() => this.changeProductOpt("isOnTop",!selprod.isOnTop)}>
                                                        <div className="icon-view"><ProductOptionIcons icontype="ontop" size={36} /></div> {this.props.t('isontop')}</div>
                                                    </div>
                                                </li>
                                            </>:<></>}
                                            <li className='list-inline-item'>
                                                <div className='content-dive'>
                                                    <div className={"text-content "+(selprod.isUseProdMinRev===true?"active":"")} onClick={() => this.changeProductOpt("isUseProdMinRev", !selprod.isUseProdMinRev)}>
                                                        <div className="icon-view"><ProductOptionIcons icontype="minRevenue" size={34} /></div>
                                                        {this.props.t('USE_MINREV_IN_PRODLEVEL')}
                                                    </div>
                                                </div>
                                            </li>
                                        </ul>
                                    </Col>
                                    <Col>
                                        <Row className="form-details">
                                            <Row>
                                                <Col xs={6}>
                                                    <label>{this.props.t('minqty')}</label>
                                                    <Form.Control type="number" size="sm" value={selprod.minQty} onChange={e => this.changeProductOpt("minQty",e.target.value,true)} />
                                                </Col>
                                                
                                                <Col xs={6}>
                                                    <label>{this.props.t('paceOfSalesInQty')}</label>
                                                    <div className='form-inline'>
                                                    <Form.Control type="number" size="sm" value={selprod.paceOfSalesInQty} onChange={e => this.changeProductOpt("paceOfSalesInQty",e.target.value,true)} />
                                                        <FormSelect size="sm" value={(selprod.paceOfSalesInQtyUot?selprod.paceOfSalesInQtyUot:"-1")} onChange={e => this.changeProductOpt("paceOfSalesInQtyUot",e.target.value)}>
                                                            {Object.keys(paceScaleEnums).map(xidx => {
                                                                return <option key={xidx} value={xidx}>{paceScaleEnums[xidx]}</option>
                                                            })}
                                                        </FormSelect>
                                                    </div>
                                                </Col>

                                                <Col xs={6}>
                                                    <label>{this.props.t('maxqty')}</label>
                                                    <Form.Control type="number" size="sm" value={selprod.maxQty} onChange={e => this.changeProductOpt("maxQty",e.target.value,true)} />
                                                </Col>

                                                <Col xs={6}>
                                                    <label>{this.props.t('shelvelife')}</label>
                                                    <div className='form-inline'>
                                                        <Form.Control type="number" size="sm" value={selprod.shelvesLife} onChange={e => this.changeProductOpt("shelvesLife",e.target.value,true)} />
                                                        <Form.Control as="select" size="sm" value={(selprod.shelveLifeUot ? selprod.shelveLifeUot : "-1")} onChange={e => this.changeProductOpt("shelveLifeUot",e.target.value)}>
                                                            {Object.keys(shelfLifeEnums).map(xidx => {
                                                                return <option key={xidx} value={xidx}>{shelfLifeEnums[xidx]}</option>
                                                            })}
                                                        </Form.Control>
                                                    </div>
                                                </Col>

                                                {/* <Col xs={6}>
                                                    <label>{this.props.t('maxrev')}</label>
                                                    <Form.Control type="number" size="sm" value={selprod.minRevenue} onChange={e => this.changeProductOpt("minRevenue",e.target.value,true)} />
                                                </Col> */}

                                                <Col xs={6} style={{display:(selprod.isUseProdMinRev?"block":"none")}}>
                                                    <label>{this.props.t('minrev')}</label>
                                                    <Form.Control type="number" size="sm" value={selprod.maxRevenue} onChange={e => this.changeProductOpt("maxRevenue",e.target.value,true)} />
                                                </Col>
                                                
                                                <Col xs={6} style={{display:(selprod.isStackable?"block":"none")}}>
                                                    <label>{this.props.t('maxstackablecount')}</label>
                                                    <Form.Control type="number" size="sm" value={selprod.maxStackableCount} onChange={e => this.changeProductOpt("maxStackableCount",e.target.value,true)} />
                                                </Col>
                                            </Row>
                                        </Row>
                                    </Col>
                                </Row>
                            </Col>
                           
                            
                            <Col className='product-mddetails maintagsdiv' style={{pointerEvents: (this.props.isAUIDisabled === true?"none":"auto")}}>
                                <h4>{this.props.t("tags")}</h4>
                                <div className='SelectCategory'>
                                    <div className='categoryselect'>
                                        <ul className="list-inline right-list">
                                            <li className="list-inline-item">
                                                {/* <Form.Control type="text" placeholder='Type here' style={{width: "250px"}} /> */}
                                                <Select id="tagDropdown" name="tagDropdown" placeholder={"Select a Tag"} menuPlacement={"auto"} options={this.state.alltags} 
                                                onChange={(e) => this.handleTagChange(e)} 
                                                value={null} 
                                                className="filter-tagslist" size="sm" classNamePrefix="searchselect-inner" maxMenuHeight={200} data-validation-type="tags" />
                                            </li>
                                            {/* <li className="list-inline-item"><Button variant="danger" onClick={()=>this.addTag()}><PlusIcon size={18} /></Button></li> */}
                                        </ul>
                                    </div>
                                    <Col xs={12} className="tagsdiv field" style={{marginTop:"8px"}}>
                                        <Row style={(this.props.isRTL === "rtl" ? { marginRight: "0px", width: "100%" } : { marginLeft: "0px", width: "100%" })}>
                                            {this.state.adddedTags.map((tagitem, i) =>
                                                tagitem.isDelete !== true ? 
                                                <Col md={3} key={i} style={{padding:"3px"}}>
                                                    <Col className={"tag-item sub-item" }>
                                                        {tagitem.tagName}
                                                        <span onClick={()=>this.removeTag(i)}><XIcon size={15} /></span>
                                                    </Col>
                                                </Col>
                                                :<span key={i} className="d-none"></span>
                                            )}
                                        </Row>
                                    </Col>
                                </div>
                            </Col>
                        </>:<></>}
                        
                    </Modal.Body>
                    <Modal.Footer>
                        {this.props.isAUIDisabled === false?<>
                            <Button className="btn-save-cat" onClick={()=>this.checkForSnapshotAvailability()}>{this.props.t('btnnames.save')}</Button>
                        </>:<></>}
                    </Modal.Footer>
                </Modal>
                                                
                {
                    this.state.snapshotAvailableModal === true ?
                        <SnapshotWarning
                            t={this.props.t}
                            isRTL={this.props.isRTL}
                            snapshotAvailableModal={this.state.snapshotAvailableModal}
                            snapshotsList={this.state.snapshotsList}
                            handleSnapshotAvailabilityModalToggle={this.handleSnapshotAvailabilityModalToggle}
                            continueToUpdateFromSnashotWarning= {this.continueToUpdateFromSnashotWarning}
                        />
                    :<></>
                }
            </>
            
            
        );
    }
}

export default withTranslation()(withRouter(ProductPreview));