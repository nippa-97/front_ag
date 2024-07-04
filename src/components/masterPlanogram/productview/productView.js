import React, { Component } from 'react';
import { Col, Breadcrumb, Button, Row } from 'react-bootstrap'; //Dropdown, Form
import { connect } from 'react-redux';
import { withTranslation } from 'react-i18next';
import { withRouter, Link } from 'react-router-dom';
import { ChevronRightIcon, UnfoldIcon } from '@primer/octicons-react'; //PlusIcon, 
//import randomColor from 'randomcolor';
import {sortableContainer, sortableElement, SortableHandle} from 'react-sortable-hoc';


import { measureConverter } from '../../../_services/common.service';
import { convertWidthPercent } from '../AddMethods';

import { submitCollection } from '../../../_services/submit.service';
import { submitSets } from '../../UiComponents/SubmitSets';

import { selectedMasterPlanSetAction, selectedMPCategorySetAction } from '../../../actions/masterPlanogram/masterplanogram_action';
//import { samplebrandprods } from '../SampleData';

import ProductPreview from './productdetails/productpreview';

import CustomProgressBar from '../../common_layouts/customProgressBar';
import { alertService } from '../../../_services/alert.service';
import { AcViewModal } from '../../UiComponents/AcImports';

import sampleFieldImg from '../../../assets/img/sample/field-sample1.jpg';
import PreviewImage from '../../image_preview/imagePreview.js';

import './productview.css';

const SortableItem = sortableElement(({rownumber, name,suggestedSpace,preAddedSuggestedSpace, handlePerentageChange, handlePerentageOnBlur, togglePreviewModal, productid, isrtl}) => 
    <Row className="sortable-row-product">
        <Col xs={7} style={{padding:"0px"}} onClick={(e)=>togglePreviewModal(true,{productId:productid})}>
            <CustomProgressBar isRTL={isrtl} text={name} mainbarcolor={"rgb(237 50 122)"} mainbarpercentage={suggestedSpace} showsubbar="true" subbarpercentage={preAddedSuggestedSpace} />
        </Col>
        <Col xs={2} className="val-col">{(suggestedSpace?(suggestedSpace%1===0?suggestedSpace:suggestedSpace.toFixed(2)):0)}%</Col>
        <Col xs={2} className="val-col-input form-inline"><input type="number" value={preAddedSuggestedSpace} onBlur={(e)=> handlePerentageOnBlur(e,rownumber)} onChange={(e) => handlePerentageChange(e,rownumber)} /><span className="permark">%</span></Col>
        <Col xs={1}><RowHandler/></Col>
    </Row>
);

const RowHandler = SortableHandle(() => <div className="handle"><UnfoldIcon size={15}/></div>);

const SortableContainer = sortableContainer(({children}) => {
  return <div>{children}</div>;
});

const arrayMoveMutate = (array, from, to) => {
    array.splice(to < 0 ? array.length + to : to, 0, array.splice(from, 1)[0]);
};

const arrayMove = (array, from, to) => {
    array = array.slice();
    arrayMoveMutate(array, from, to);
    //rechange rankNo number
    for (let i = 0; i < array.length; i++) {
        array[i].rankNo = (i+1);
    }
    //console.log(array);
    return array;
    
};

export class ProductDrawView extends Component {
    constructor(props){
        super(props);
        this.state = {
            isdataloading:false,
            defSaveObj: null, selectedCatgory: null, addselectcat: null, 
            loadedMvpProds: [], loadedTopProds: [], loadedProductPercentages: [],loadedAllProducts:[],
            selectedSubCat: null,
            selectedBrand: null,
            selectedProduct: null, isShowPreviewModal: false,

            lastSearchedBrandId:0,
            showPreviewImageModal:false, productId:0,
        }
    }

    componentDidMount() {
        if(this.props.mpstate && this.props.mpstate.mpDetails){
            //console.log(this.props.mpstate.mpDetails);
            this.setState({ defSaveObj: this.props.mpstate.mpDetails });
        }
        
        if(this.props.mpstate && this.props.mpstate.mpCatDetails){
            this.setState({ selectedCatgory: JSON.parse(JSON.stringify(this.props.mpstate.mpCatDetails)) });
        }

        if(this.props.mpstate && this.props.mpstate.mpSubCatDetails){
            this.setState({ selectedSubCat: JSON.parse(JSON.stringify(this.props.mpstate.mpSubCatDetails)) });
        }

        if(this.props.mpstate && this.props.mpstate.mpBrandDetails){
            let cselbrand = this.props.mpstate.mpBrandDetails;
            this.setState({ selectedBrand: JSON.parse(JSON.stringify(this.props.mpstate.mpBrandDetails)) }, () => {
                this.getAllProducts(cselbrand.id);
                //this.getProductPercentages(cselbrand.id);
            });
        }

        // this.loadAllTags();
    }

    //load all tags
    /* loadAllTags = () =>{
        let sobj = {isReqPagination:false,type:"",tagName: ""}
        submitSets(submitCollection.searchTags, sobj, true).then(res => {
            if(res && res.status){
                var arr = [];
                for (let i = 0; i < res.extra.length; i++) {
                    arr.push({value:res.extra[i].id, label:res.extra[i].tagName});
                }
                this.setState({tagslist:arr});
            } 
        });
    } */

    //load all products of selected brand
    getAllProducts = (cbrandid) => {
        this.setState({isdataloading:true, lastSearchedBrandId:cbrandid});
        let svobj = { mpSubCategoryBoxHasBrandId: cbrandid };
        submitSets(submitCollection.mpProductList, svobj).then(res => {
            this.setState({isdataloading:false});
            if(res && res.status && res.extra){
                let mvpProds = [];
                let onTopProds = [];
                let allProds = [];//res.extra;
                for (let i = 0; i < res.extra.length; i++) {
                    if(res.extra[i].isMvp === true){
                        mvpProds.push(res.extra[i]);
                    }
                    else{
                        onTopProds.push(res.extra[i]);
                    }

                    //
                    let cobj = res.extra[i];
                    cobj.preAddedSuggestedSpace = (cobj.mpProdChangeId<0 ? (cobj.suggestedSpace%1===0?cobj.suggestedSpace:cobj.suggestedSpace.toFixed(2)) : cobj.preAddedSuggestedSpace);
                    allProds.push(cobj);//cobj.suggestedSpace%1===0?cobj.suggestedSpace:cobj.suggestedSpace.toFixed(2)
                }
                
                this.setState({
                    loadedMvpProds: mvpProds,//mvpProds,
                    loadedTopProds: onTopProds,
                    loadedAllProducts:allProds,
                },()=>{
                    //console.log(this.state.loadedTopProds);
                    
                });
            }

            //let mvpprods = samplebrandprods.filter(x => x.isMvp);
            //let ontopprods = samplebrandprods.filter(x => !x.isMvp);
        });


        // this.setState({
        //     loadedMvpProds: mvpprods,
        //     loadedTopProds: ontopprods
        // },()=>{this.setState({isdataloading:false});});
    }

    //load all products of selected brand
    // getProductPercentages = (cbrandid) => {
    //     let svobj = { brandId: cbrandid };
    //     submitSets(submitCollection.mpProductPercentage, svobj).then(res => {
    //         //console.log(res.extra);

    //         if(res && res.status){
    //             this.setState({ loadedProductPercentages: res.extra });
    //         }
    //     })
    // }

    //convert & save category objects
    saveCategoryObj = (isbrandredirect, branditem) => {
        let exportcat = JSON.parse(JSON.stringify(this.state.selectedCatgory));
        let exportfield = exportcat.field_obj;
        //calculate dimention
        let redicedheight = (this.state.divHeight - 80);
        
        var dimention = (redicedheight / measureConverter(exportfield.field_uom,this.state.displayUOM,exportfield.field_height));
        //console.log(dimention);
        for (let i = 0; i < exportcat.sub_categories.length; i++) {
            const scatitem = exportcat.sub_categories[i];
            for (let j = 0; j < scatitem.rects.length; j++) {
                const rectitem = scatitem.rects[j];
                rectitem.x = convertWidthPercent(rectitem.x,this.state.divWidth);
                rectitem.width = convertWidthPercent(rectitem.width,this.state.divWidth);
                rectitem.y = measureConverter(this.state.displayUOM,exportfield.field_uom,(rectitem.y / dimention));
                rectitem.height = measureConverter(this.state.displayUOM,exportfield.field_uom,(rectitem.height / dimention));
            }

            for (let l = 0; l < scatitem.brands.length; l++) {
                const branditem = scatitem.brands[l];
                branditem.x = convertWidthPercent(branditem.x,this.state.divWidth);
                branditem.width = convertWidthPercent(branditem.width,this.state.divWidth);
                branditem.y = measureConverter(this.state.displayUOM,exportfield.field_uom,(branditem.y / dimention));
                branditem.height = measureConverter(this.state.displayUOM,exportfield.field_uom,(branditem.height / dimention));
            }
        }

        //console.log(exportcat);
        
        //temp - update redux category object
        let csaveobj = this.state.defSaveObj;
        let findcatidx = csaveobj.categories.findIndex(x => x.category_id === exportcat.category_id);
        //update obj with new details
        csaveobj.categories[findcatidx] = exportcat;

        //update redux
        this.props.setMPCategoryAction(exportcat);
        this.props.setMasterPlanAction(csaveobj);
        
        if(isbrandredirect){
            this.props.setMPBrandAction(branditem);
            this.props.history.push("/masterplanograms/productdetails");
        } else{
            this.props.history.push("/masterplanograms/details");
        }
    }
    //toggle product preview modal
    togglePreviewModal = (isshow, citem, ismvp) => {
        if(isshow){
            this.setState({isdataloading:true});
            let svobj = "?productId="+citem.productId;
            submitSets(submitCollection.findProdByID, svobj).then(res => {
                //console.log(res.extra);
                this.setState({isdataloading:false});
                if(res && res.status && res.extra){
                    this.setState({ isShowPreviewModal: true, selectedProduct: (res.extra?res.extra:null) });
                } else{
                    alertService.error(this.props.t("PRODUCT_DETAILS_NOT_FOUND"));
                }
            });
        } else{
            this.setState({ isShowPreviewModal: false, selectedProduct: null });
        }
    }
    //save product details
    handleSaveProduct = (saveobj) => {
        let csaveobj = saveobj;
        csaveobj["mpId"] = null;

        submitSets(submitCollection.updateProds, csaveobj, false, null, true).then(res => {
            //console.log(res.extra);

            if(res && res.status){
                alertService.success(this.props.t("SUCCESSFULLY_PRODUCT_DETAILS_SAVED"));
                this.setState({ isShowPreviewModal: false, selectedProduct: null });
            } else{
                // alertService.error(res && res.extra?res.extra:"Error occurred");
            }
        });
    }
    //
    switchLoadingDetails = (issub, cidx, xidx, yidx) => {
        let selectedsub = this.state.selectedCatgory.sub_categories[cidx];
        
        if(issub){
            if(selectedsub.rects && selectedsub.rects.length > 0){
                let findfirstbrand = null;
                for (let i = 0; i < selectedsub.rects.length; i++) {
                    const rectitem = selectedsub.rects[i];
                    
                    if(rectitem.brands && rectitem.brands.length > 0){
                        findfirstbrand = rectitem.brands[0];
                    }
                }

                if(findfirstbrand){
                    this.setState({
                        selectedSubCat: selectedsub,
                        selectedBrand: findfirstbrand
                    },()=>{
                        this.getAllProducts(findfirstbrand.id);
                    });
                }else{
                    alertService.error("No brands found");
                }
            } else{
                alertService.error("No brands found");
            }
        } else{
            if(selectedsub.rects && selectedsub.rects.length > 0){
                if(selectedsub.rects[xidx].brands && selectedsub.rects[xidx].brands.length > 0){
                    let selectedbrand = selectedsub.rects[xidx].brands[yidx];
                    
                    this.setState({ selectedBrand: selectedbrand },()=>{
                        this.getAllProducts(selectedbrand.id);
                    });
                }
            }
        }
    }

    onSortEnd = ({oldIndex, newIndex}) => {
        this.setState(({loadedAllProducts}) => ({
            loadedAllProducts: arrayMove(loadedAllProducts, oldIndex, newIndex),
        }));
    };

    handlePerentageChange = (e,index) =>{
        let plist = this.state.loadedAllProducts;
        plist[index].preAddedSuggestedSpace  = (e.target.value);
        // if(e.target.value>=0 && e.target.value<=100){
        // }
        // else{
        //     plist[index].preAddedSuggestedSpace = (plist[index].suggestedSpace%1===0?plist[index].suggestedSpace:plist[index].suggestedSpace.toFixed(2));
        //     //plist[index].suggestedSpace%1===0?plist[index].suggestedSpace:cobj.suggestedSpace.toFixed(2)
        //     //alertService.warn("Invalid value! Please enter a value between "+plist[index].suggestedSpace +" & 100");
        // }
        this.setState({loadedAllProducts:plist});
    }

    handlePerentageOnBlur = (e,index) =>{
        // let plist = this.state.loadedAllProducts;
       
        // if(e.target.value>=0 && e.target.value<=100 && e.target.value!=="" && parseFloat(e.target.value)!==NaN && (plist[index].suggestedSpace<=e.target.value) && (plist[index].suggestedSpace + parseFloat(e.target.value)) <= 100){
        //     plist[index].preAddedSuggestedSpace  = e.target.value;
        // }
        // else{
        //     plist[index].preAddedSuggestedSpace = (plist[index].suggestedSpace%1===0?plist[index].suggestedSpace:plist[index].suggestedSpace.toFixed(2));
        //     //alertService.warn("Invalid value! Please enter a value between "+plist[index].suggestedSpace +" & 100");
        // }
        // this.setState({loadedAllProducts:plist});
    }

    saveProdutsData = () =>{
        let obj = {};
        obj.mpSubCategoryBoxHasBrandId = this.state.lastSearchedBrandId;
        obj.products = this.state.loadedAllProducts;

        let plist = this.state.loadedAllProducts;
        let totalval = 0;
        //console.log(plist);
        for (let i = 0; i < plist.length; i++) {
            if(plist[i].preAddedSuggestedSpace === ""||
                isNaN(plist[i].preAddedSuggestedSpace) || 
                     plist[i].preAddedSuggestedSpace < 0 || 
                        plist[i].preAddedSuggestedSpace > 100)
            {
                alertService.warn("Invalid value for "+ plist[i].productName +"");
                return false;    
            }
            else{
                totalval += (Math.trunc(plist[i].preAddedSuggestedSpace));
            }
            
        }
        //alert(totalval);
        if(totalval<99 || totalval>101){
            alertService.warn("Invalid total. Please check the values.");
            return false; 
        }
        
        //console.log(obj);
        this.setState({isdataloading:true});
        submitSets(submitCollection.updateProductListChangesAgainstBrand, obj, false, null, true).then(res => {
            //console.log(res.extra);
            this.setState({isdataloading:false});
            if(res && res.status){
                alertService.success(this.props.t("SUCCESSFULLY_SAVED"));
                this.getAllProducts(this.state.lastSearchedBrandId);    
            } else{
                // alertService.error((res.error?res.error:"Error Occured"));
            }
        });
    }

    handlePreviewModal = (obj,type) =>{
        this.setState({productId:(obj?obj.productId:0), showPreviewImageModal:type});
    }

    render() {
        return (<>
            <Col xs={12} className={"main-content mp-prodview mpview-main catdetails-view "+(this.props.isRTL==="rtl"?"RTL":"")} dir={this.props.isRTL}>
                <Breadcrumb dir="ltr">
                    {this.props.isRTL==="rtl"?<>
                    <Breadcrumb.Item active>{this.props.t('PRODUCT_DETAILS')}</Breadcrumb.Item>
                    <li className="breadcrumb-item"><Link to="/masterplanograms/branddetails" role="button">{this.props.t('brands')}</Link></li>
                    <li className="breadcrumb-item"><Link to="/masterplanograms/details" role="button">{this.props.t('sub_category')}</Link></li>
                    <li className="breadcrumb-item"><Link to="/masterplanograms/selectcat" role="button">{this.props.t('category')}</Link></li>
                    <li className="breadcrumb-item"><Link to="/masterplanograms" role="button">{this.props.t('master_planogram')}</Link></li>
                    <li className="breadcrumb-item"><Link to="/dashboard" role="button">{this.props.t('home')}</Link></li>
                    </>:<>
                    <li className="breadcrumb-item"><Link to="/dashboard" role="button">{this.props.t('home')}</Link></li>
                    <li className="breadcrumb-item"><Link to="/masterplanograms" role="button">{this.props.t('master_planogram')}</Link></li>
                    <li className="breadcrumb-item"><Link to="/masterplanograms/selectcat" role="button">{this.props.t('category')}</Link></li>
                    <li className="breadcrumb-item"><Link to="/masterplanograms/details" role="button">{this.props.t('sub_category')}</Link></li>
                    <li className="breadcrumb-item"><Link to="/masterplanograms/branddetails" role="button">{this.props.t('brands')}</Link></li>
                    <Breadcrumb.Item active>{this.props.t('PRODUCT_DETAILS')}</Breadcrumb.Item>
                    </>}
                </Breadcrumb>

                {/* <Col>
                    <h3 className="mainheader-txt">
                        <Button variant="light" type="button" className="backpg-link" onClick={this.handleGoBack} style={{textTransform:"uppercase",fontWeight:"600",padding:"2px 5px",marginRight:"5px"}}><ChevronLeftIcon size={22}/></Button>
                        {this.state.selectedCatgory?(this.state.selectedCatgory.category_name+" Category"):"Default Category"}
                        {this.state.selectedSubCat?(<><ChevronRightIcon size={16}/> {this.state.selectedSubCat.sub_category_name}</>):"Default Sub Category"}
                        {this.state.selectedBrand?(<><ChevronRightIcon size={16}/> {this.state.selectedBrand.brand_name}</>):"Default Brand"}
                    </h3>
                </Col> */}
                
                <Row className="bottomcontent-main">

                    <Col className="bottom-single summary-view" xs={12}>
                        <Col className='sub-content' style={{ minHeight: "auto" }}>
                            <Col className="fieldview-thumb">
                                <div className='preview-thumb'>
                                    <img src={sampleFieldImg} alt="field" />
                                </div>
                            </Col>

                            <h4 className='summary-header'>
                                {this.state.selectedSubCat?(<>{this.state.selectedSubCat.sub_category_name}</>):"Default Sub Category"}
                                {this.state.selectedBrand?(<><ChevronRightIcon size={16}/> {this.state.selectedBrand.brand_name}</>):"Default Brand"}
                            </h4>

                            <h6 style={{marginTop:"15px"}}>{this.props.t('sub_categories')}</h6>
                            <ul className='list-inline tags-list subcat-list'>
                                {this.state.selectedCatgory && this.state.selectedCatgory.sub_categories?<>
                                    {this.state.selectedCatgory.sub_categories.map((xitem, xidx) => {
                                        return <React.Fragment key={xidx}><li onClick={() => this.switchLoadingDetails(true,xidx)} className={"list-inline-item "+(
                                            (!this.state.selectedSubCat.is_supplier_based && xitem.sub_category_id === this.state.selectedSubCat.sub_category_id) ||
                                            (this.state.selectedSubCat.is_supplier_based && xitem.is_supplier_based && xitem.supplier_obj.supplier_id === this.state.selectedSubCat.supplier_obj.supplier_id && xitem.sub_category_id === this.state.selectedSubCat.sub_category_id)
                                            ?"active":"")}>
                                            <h6 title={xitem.sub_category_name}>
                                                {xitem.is_supplier_based?
                                                (xitem.sub_category_name.substring(0,12)+(xitem.sub_category_name.length > 12?"..":"")):
                                                (xitem.sub_category_name.substring(0,12)+(xitem.sub_category_name.length > 12?"..":""))}
                                            </h6>
                                        </li></React.Fragment>;
                                    })}
                                </>:<></>}
                            </ul>
                        </Col>
                    </Col>

                    <Col className="bottom-single" xs={12}>
                        <Col className='sub-content' style={{background: "transparent", minHeight: "auto", marginBottom: "5px", padding: "15px 0px"}}>
                            <ul className='list-inline link-list brands-list'>
                                {this.state.selectedCatgory && this.state.selectedCatgory.sub_categories?<>
                                    {this.state.selectedCatgory.sub_categories.map((xitem, xidx) => {
                                        return <React.Fragment key={xidx}>
                                            {xitem.sub_category_id === this.state.selectedSubCat.sub_category_id?<>
                                            {xitem.rects.map((yitem,yidx) => {
                                                return <React.Fragment key={yidx}>
                                                    {yitem.brands.map((zitem,zidx) => {
                                                        return <React.Fragment key={zidx}>
                                                            <li onClick={() => this.switchLoadingDetails(false,xidx,yidx,zidx)} className={'newcats-item list-inline-item '+(zitem.brand_id === this.state.selectedBrand.brand_id?"active":"")}>
                                                        <h6 title={zitem.brand_name}>{zitem.brand_name.substring(0,12)+(zitem.brand_name.length > 12?"..":"")}</h6>
                                                    </li></React.Fragment>
                                                    })}
                                                </React.Fragment>;
                                            })}
                                            </>:<></>}
                                        </React.Fragment>;
                                    })}
                                </>:<></>}
                            </ul>
                        </Col>
                    </Col>

                    <Col className="bottom-single" xs={12} lg={8}>
                        <Col className='sub-content' style={{background: "transparent", padding: "15px 0px"}}>
                            <div className={this.state.loadedTopProds.length>0?"":"d-none"}>
                                <h3 style={{marginBottom: "10px"}}>{this.props.t("on_top_products")}</h3>
                                <Row className='prodsview-list'>
                                    {this.state.loadedTopProds.map((xitem, xidx) => {
                                        return <React.Fragment key={xidx}>
                                            {xitem.isMvp===false?
                                            <Col xs={3} className=''>
                                                <Col className='proddet-view'>
                                                    <div className="image-view" onClick={()=>this.handlePreviewModal(xitem,true)}>
                                                        <img src={xitem.imgUrl} alt=""/>
                                                    </div>
                                                    <div className="prod-details" onClick={() => this.togglePreviewModal(true,xitem,false)}>
                                                        <label className="prod-txt">
                                                            <small>{xitem.barcode}</small>
                                                            {(xitem.productName.substring(0,35)+(xitem.productName.length > 35?"..":""))}
                                                        </label>
                                                    </div>
                                                    <div className='bottom-values' onClick={() => this.togglePreviewModal(true,xitem,false)}>
                                                        <label>{(xitem.suggestedSpace?(xitem.suggestedSpace%1===0?xitem.suggestedSpace:xitem.suggestedSpace.toFixed(2)):0)}%</label><span>Now</span>
                                                    </div>
                                                </Col>
                                            </Col>:<></>}
                                    </React.Fragment>
                                    })}
                                </Row>
                            </div>
                            
                            <br/>
                            
                            <div className={this.state.loadedMvpProds.length>0?"":"d-none"}>
                                <h3 style={{marginBottom: "10px", }}>{this.props.t("mvp_products")}</h3>
                                <Row className='prodsview-list'>
                                    {this.state.loadedMvpProds.map((xitem, xidx) => {
                                        return <React.Fragment key={xidx}>
                                            {xitem.isMvp===true?
                                            <Col xs={3} className=''>
                                                <Col className='proddet-view'>
                                                    <div className="image-view" onClick={()=>this.handlePreviewModal(xitem,true)}>
                                                        <img src={xitem.imgUrl} alt=""/>
                                                    </div>
                                                    <div className="prod-details" onClick={() => this.togglePreviewModal(true,xitem,true)}>
                                                        <label className="prod-txt">
                                                            <small>{xitem.barcode}</small>
                                                            {(xitem.productName.substring(0,35)+(xitem.productName.length > 35?"..":""))}
                                                        </label>
                                                    </div>
                                                    <div className='bottom-values' onClick={() => this.togglePreviewModal(true,xitem,true)}>
                                                        <label>{(xitem.suggestedSpace?(xitem.suggestedSpace%1===0?xitem.suggestedSpace:xitem.suggestedSpace.toFixed(2)):0)}%</label><span>Now</span>
                                                    </div>
                                                </Col>
                                            </Col>:<></>}
                                    </React.Fragment>
                                    })}
                                </Row>

                            </div>
                        </Col>
                    </Col>

                    <Col className={"bottom-single purple-bg "+(this.state.loadedAllProducts.length>0 ? "" :"d-none")} style={{marginBottom:"20px"}}>
                        <Col className='sub-content product-percentage-section' style={{height:"100%"}}>
                            <Col className="sub-cat-prg-bars">
                                <Row>
                                    <Col xs={7} className="title-col"></Col>
                                    <Col xs={2} className="title-col">Now</Col>
                                    <Col xs={2} className="title-col">Rec</Col>
                                    <Col xs={1} className="title-col"></Col>
                                </Row>    
                                <Row>
                                    <SortableContainer onSortEnd={this.onSortEnd} useDragHandle={true}>
                                    {this.state.loadedAllProducts.map((xitem, xidx) => {
                                        return (
                                        // <React.Fragment key={xidx}>
                                        //     <Col xs={8} style={{padding:"0px"}}>
                                        //         <CustomProgressBar text={xitem.productName} mainbarcolor={"rgb(237 50 122)"} mainbarpercentage={xitem.percentage} showsubbar="true" subbarpercentage={xitem.req_percentage} />
                                        //     </Col>
                                        //     <Col xs={2} className="val-col">{xitem.percentage}%</Col>
                                        //     <Col xs={2} className="val-col light">{xitem.req_percentage}%</Col>
                                        // </React.Fragment>

                                        <SortableItem key={xidx} index={xidx} rownumber={xidx} name={xitem.productName} suggestedSpace={xitem.suggestedSpace} preAddedSuggestedSpace={xitem.preAddedSuggestedSpace} handlePerentageChange={this.handlePerentageChange} handlePerentageOnBlur={this.handlePerentageOnBlur} togglePreviewModal={this.togglePreviewModal} productid={xitem.productId} isrtl={this.props.isRTL}/>
                                        );
                                    })}                     

                                    </SortableContainer>
                                </Row> 
                            </Col>

                            {/* <ul className="list-inline progress-control">
                                <li className="list-inline-item">
                                    <Button variant="danger" size="sm">Next</Button>
                                </li>
                            </ul> */}
                        </Col>
                    </Col>
                </Row>

                <Col style={{marginBottom:"70px"}}>
                    <ul className='list-inline'>
                        <li className={'list-inline-item '+(this.props.isRTL==="rtl" ?"float-right":"float-left")} style={{marginRight:"-40px"}}>
                            <Link to="/masterplanograms/branddetails" role="button"><Button variant="secondary">{this.props.t("btnnames.back")}</Button></Link>
                        </li>
                        
                        <li className={'list-inline-item '+(this.props.isRTL==="rtl" ?" float-left ":" float-right ")+(this.state.loadedAllProducts.length>0 ? "" :"d-none")}>
                            <Button variant="success" onClick={() => this.saveProdutsData()}>{this.props.t("btnnames.save")}</Button>
                        </li>
                    </ul>
                </Col>
                
                {this.state.selectedProduct?<ProductPreview isRTL={this.props.isRTL} isshow={this.state.isShowPreviewModal} handleSaveProduct={this.handleSaveProduct} togglePreviewModal={this.togglePreviewModal} selectedProduct={this.state.selectedProduct} tagslist={this.props.loadedTagsList} handlePreviewModal={this.handlePreviewModal} />:<></>}
                
                {this.state.showPreviewImageModal===true ? 
                    <PreviewImage 
                        productid={this.state.productId ? this.state.productId : null} 
                        loadfromback={true} 
                        imgurl={""} 
                        isshow={this.state.showPreviewImageModal} 
                        isRTL={this.props.isRTL} 
                        handlePreviewModal={this.handlePreviewModal}
                        hideheaderlables={false}
                        />
                    :<></>
                }

                <AcViewModal showmodal={this.state.isdataloading} />
            </Col>

        </>);
    }
}

const mapDispatchToProps = dispatch => ({
    setMasterPlanAction: (payload) => dispatch(selectedMasterPlanSetAction(payload)),
    setMPCategoryAction: (payload) => dispatch(selectedMPCategorySetAction(payload)),
});

export default withTranslation()(withRouter(connect(null,mapDispatchToProps)(ProductDrawView)));