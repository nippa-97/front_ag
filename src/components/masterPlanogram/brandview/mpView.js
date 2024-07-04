import React, { Component } from 'react';
import { Col, Breadcrumb, Button, Row, Dropdown, Form, ButtonGroup } from 'react-bootstrap';
import { connect } from 'react-redux';
import { withTranslation } from 'react-i18next';
import { withRouter, Link } from 'react-router-dom';
import { ChevronLeftIcon, PlusIcon, ChevronRightIcon, XIcon, CopyIcon } from '@primer/octicons-react';
//import randomColor from 'randomcolor';
import { v4 as uuidv4 } from 'uuid'; //unique id
import FeatherIcon from 'feather-icons-react';
import { confirmAlert } from 'react-confirm-alert'; //confirm alert

import { selectedMasterPlanSetAction, selectedMPCategorySetAction, selectedMPSubCatSetAction, selectedMPBrandSetAction } from '../../../actions/masterPlanogram/masterplanogram_action';

import { submitCollection } from '../../../_services/submit.service';
import { submitSets } from '../../UiComponents/SubmitSets';
import { AcViewModal } from '../../UiComponents/AcImports';

import { measureConverter, roundOffDecimal, checkColorIsLight } from '../../../_services/common.service';
import { reCheckSnapRects, saveObjDataConvert } from '../AddMethods';

import MPDrawing from './MPDrawing/MPDrawing';
import MPToolBox from './MPDrawing/ToolBox';
//import { samplebrandsarr } from '../SampleData';
import CustomProgressBar from '../../common_layouts/customProgressBar';
import { alertService } from '../../../_services/alert.service';

import './mcview.css';

export class BrandDrawView extends Component {
    constructor(props){
        super(props);

        this.additemElement = React.createRef();

        this.state = {
            defSaveObj: null, selectedCatgory: null, addselectcat: null, selectedSubCat: null, showbrand: null,
            isChangesAvailable: false,
            loadedAllBrandsList: [], loadedBrandPercentages: [],
            ishavebrands: false, //for dropdown css issue
            activeDrawType: "subc", //subc, supp, brand
            isEnableDraw: true, selectedDraw: null, oneTimeConvert: true,
            divWidth: 0, divHeight: 0, displayUOM: "cm",
            //history points
            historyData: { past: [], present: 0, future: [] },
            //toolbox actions
            activeTool: "default",
            isShowLoadingModal: false,
            percentageDropList: [],

            //cut boxes
            cutBoxList: [],
        }
    }

    componentDidMount() {
        
        //console.log(this.props.mpstate);
        if(this.props.mpstate && this.props.mpstate.mpDetails){
            this.setState({ defSaveObj: this.props.mpstate.mpDetails });
        }
        
        if(this.props.mpstate && this.props.mpstate.mpCatDetails){
            this.setState({ selectedCatgory: JSON.parse(JSON.stringify(this.props.mpstate.mpCatDetails)) });
        }

        if(this.props.mpstate && this.props.mpstate.mpSubCatDetails){
            let csubobj = this.props.mpstate.mpSubCatDetails;
            
            let ishavebrands = false;
            
            for (let i = 0; i < csubobj.rects.length; i++) {
                const rectitem = csubobj.rects[i];
                if(!rectitem.is_delete && rectitem.brands && rectitem.brands.length > 0){
                    ishavebrands = true;
                }
            }

            this.setState({ selectedSubCat: JSON.parse(JSON.stringify(this.props.mpstate.mpSubCatDetails)), ishavebrands: ishavebrands }, () => {
                this.getAllBrands(csubobj.sub_category_id);
                this.getBrandPercentages(csubobj.sub_category_id);
            });
        }
    }
    //load all brands of selected sub category
    getAllBrands = (subcatid) => {
        let selcat = this.state.selectedSubCat;
        let supid = (selcat.is_supplier_based?selcat.supplier_obj.supplier_id:0);

        let svobj = { subCategoryId: subcatid, supplierId: supid };
        submitSets(submitCollection.mpBrandList, svobj).then(res => {
            //console.log(res.extra);

            if(res && res.status && res.extra){
                this.setState({ loadedAllBrandsList: res.extra });
            }
        });

        //this.setState({ loadedAllBrandsList: samplebrandsarr });
    }
    //load all brands of selected sub category
    getBrandPercentages = (subcatid) => {
        let defSaveObj = this.state.defSaveObj;
        let selcat = this.state.selectedSubCat;
        let supid = (selcat.is_supplier_based?selcat.supplier_obj.supplier_id:0);

        let svobj = { subCategoryId: subcatid, departmentId: defSaveObj.department.department_id, supplierId: supid };
        submitSets(submitCollection.mpBrandPercentage, svobj).then(res => {
            //console.log(res.extra);

            if(res && res.status && res.extra){
                this.setState({ loadedBrandPercentages: res.extra }, () => {
                    this.compareSubCategoryData(this.state.loadedBrandPercentages);
                });
            }
        });
    }
     //brands list compare with added brands list
     compareSubCategoryData = (loadeddata) => {
        let selectedCategory = this.state.selectedCatgory;
        let selectedSubCategory = this.state.selectedSubCat;
        
        for (let i = 0; i < loadeddata.length; i++) {
            const categoryitem = loadeddata[i];
            
            let catfinditems = null;
            for (let k = 0; k < selectedCategory.sub_categories.length; k++) {
                const citem = selectedCategory.sub_categories[k];
                if(!citem.is_delete && selectedSubCategory.id === citem.id){
                    for (let l = 0; l < citem.rects.length; l++) {
                        const rectitem = citem.rects[l];
                        if(!rectitem.is_delete){
                            let findbranditem = rectitem.brands.find(x => x.brand_id === categoryitem.brandId && !x.is_delete && x.width > 0);
                            
                            if(findbranditem){
                                catfinditems = findbranditem;
                            }
                        }
                    }
                    break;
                }
            }
            //console.log(catfinditems);
            if(catfinditems){
                if(catfinditems.percentage > 0){
                    categoryitem["percentage"] = roundOffDecimal(catfinditems.percentage,2);
                } else{
                    categoryitem["percentage"] = 0;
                }
            } else{
                categoryitem["percentage"] = 0;
            }
        }
        
        this.setState({ loadedSubCategoryList: loadeddata });
    }

    setRects = (rects, cutlist) => {
        let selsubcat = this.state.selectedSubCat;
        this.fieldHistoryAdd(JSON.parse(JSON.stringify(this.state.selectedCatgory)),1,JSON.parse(JSON.stringify(this.state.cutBoxList)));
        
        let ccatobj = this.state.selectedCatgory;
        ccatobj["sub_categories"] = [];
        
        for (let i = 0; i < rects.length; i++) {
            const subcatitem = rects[i];
            
            if(!subcatitem.is_delete && subcatitem.id === selsubcat.id){
                for (let l = 0; l < subcatitem.rects.length; l++) {
                    const rectitem = subcatitem.rects[l];
                    
                    if(!rectitem.is_delete){
                        for (let k = 0; k < rectitem.brands.length; k++) {
                            const branditem = rectitem.brands[k];
                            
                            if(!branditem.is_delete){
                                let snappingobj = reCheckSnapRects(branditem, null, k, rectitem.brands, false);
                                //console.log(snappingobj);

                                branditem.isSnapped = false;
                                if(snappingobj){
                                    if(snappingobj.isrightsnap){
                                        branditem.isSnapped = true;
                                    } else if(snappingobj.isleftsnap > -1){
                                        rectitem.brands[snappingobj.isleftsnap].isSnapped = true;
                                    }
                                } 
                            }
                            
                        }    
                    }
                    
                }
                break;    
            }
        }
        //console.log(rects);

        this.setState({
            selectedCatgory: ccatobj,
        }, () => {
            ccatobj["sub_categories"] = rects;
            this.setState({ selectedCatgory: ccatobj }, () => {
                this.compareSubCategoryData(this.state.loadedBrandPercentages);

                if(cutlist){
                    this.updateCutList(cutlist);
                }
            });
        });
    }

    handleGoBack = () => {
        if(this.state.cutBoxList && this.state.cutBoxList.length > 0){
            confirmAlert({
                title: this.props.t('CUT_ITEMS_AVAILABLE'),
                message: this.props.t('CUT_LIST_WILL_BE_DELETED'),
                overlayClassName: (this.props.isRTL==="rtl"?"alertrtl-content":""),
                buttons: [
                  {
                    label: this.props.t('btnnames.yes'),
                    onClick: () => {
                        this.props.history.push("/masterplanograms/details");
                    }
                  },
                  {
                    label: this.props.t('btnnames.no'),
                    onClick: () => {}
                  }
                ]
            });
        } else{
            this.props.history.push("/masterplanograms/details");
        }
    }

    addNewSubCategory = (e, isautoadd, selbrand) => {
        this.fieldHistoryAdd(JSON.parse(JSON.stringify(this.state.selectedCatgory)),1,JSON.parse(JSON.stringify(this.state.cutBoxList)));

        let csaveobj = this.state.selectedCatgory;
        let selsubcat = this.state.selectedSubCat;
        let selectedbrandtxt = selsubcat.id;
        
        let rectidx = 0; let brandidx = 0;
        if(isautoadd){
            brandidx = this.state.loadedAllBrandsList.findIndex(x => x.brandId === selbrand.brandId);
        } else{
            rectidx = document.getElementById("newbrandrect-select").value;
            brandidx = document.getElementById("newbrand-select").value;
        }
        
        if(brandidx !== undefined && brandidx > -1){
            let brandobj = this.state.loadedAllBrandsList[brandidx];
            
            let subcitem = csaveobj.sub_categories.findIndex(z => z.id === selectedbrandtxt);
            let isalreadyadded = null;
            for (let i = 0; i < csaveobj.sub_categories[subcitem].rects.length; i++) {
                const rectitem = csaveobj.sub_categories[subcitem].rects[i];
                
                if(!rectitem.is_delete && !isalreadyadded){
                    isalreadyadded = rectitem.brands.find(z => (!z.is_delete && z.brand_id === brandobj.brandId));
                }
            }
            
            if(!isalreadyadded){
                let newbrandobj = {
                    id: uuidv4(),
                    brand_id: brandobj.brandId,
                    brand_name: brandobj.brandName,
                    x: 0, y: 0, width: 0, height: 0, is_new: true, is_delete: false,
                    percentage: 0,
                    log:{}, contain_shelves: [], products: [],
                    color: (brandobj.brandColor?brandobj.brandColor:"#5128a0"),
                    uuid: "", isSnapped: false
                }

                csaveobj.sub_categories[subcitem].rects[rectidx].brands.push(newbrandobj);
                //console.log(csaveobj);
                this.setState({ selectedCatgory: csaveobj, ishavebrands: true }, () => {
                    this.handleSelectDraw(newbrandobj,selectedbrandtxt);
                    this.compareSubCategoryData(this.state.loadedBrandPercentages);
                });
            } else{
                alertService.error(this.props.t("ALREADY_ADDED"));
                if(e){ e.preventDefault(); }
            }
        } else{
            alertService.error(this.props.t("brandnotfound"));
        }
    }

    changeDrawType = (ctype) => {
        let settool = (this.state.activeTool === "draw"?"default":"draw");
        this.setState({ activeDrawType: (ctype), activeTool: settool, selectedDraw: null });
    }
    //handle change tool
    changeTool = (ctype) => {
        this.setState({ activeTool: (this.state.activeTool === ctype?"default":ctype) });
    }
    //handle undo/redo
    handleUndoRedo = (urtype) => {
        if(urtype === "undo"){
            this.fieldHistoryUndo();
        } else{
            this.fieldHistoryRedo();
        }
    }
    //select drawing item
    handleSelectDraw = (sitem, brandcid) => {
        //if(this.state.activeTool === "draw"){
            let scatobj = sitem;
            if(brandcid){
                scatobj["subCategoryId"] = brandcid;
            }
            this.setState({ selectedDraw: scatobj, activeTool: "draw" });
        // } else{
        //     alertService.error(this.props.t("activatedrawtool"));
        // }
    }
    //manage changes history
    fieldHistoryAdd = (csobj, type, cutBoxList) => {
        ///type=1 add item, type=2 delete item, type=3 move item
        
        var chobj = this.state.historyData;
        var phistry = (chobj.past?chobj.past:[]);
        phistry.push({ type:type, obj:csobj, cutlist: cutBoxList });

        chobj["present"] = 0;
        chobj["past"] = phistry; chobj["future"] = [];

        this.setState({ historyData: chobj, isChangesAvailable: true });
    }
    //undo changes hisory
    fieldHistoryUndo = () => {
        let cutBoxList = JSON.parse(JSON.stringify(this.state.cutBoxList));
        var chobj = this.state.historyData;
        var backidx = (chobj.present>0?(chobj.present - 1):(chobj.past.length - 1));
        var getsobj = chobj.past[backidx];
        //console.log(getsobj);
        var cfutureobj = { type:getsobj.type, obj:JSON.parse(JSON.stringify(this.state.selectedCatgory)), cutlist: cutBoxList };
        chobj.future.push(cfutureobj);
        chobj.past.splice(-1,1);
        
        let isChangesAvailable = (chobj.past.length === 0?false:this.state.isChangesAvailable);

        this.setState({
            selectedCatgory: null, isChangesAvailable: isChangesAvailable
        }, () => {
            this.setState({ selectedCatgory: getsobj.obj, historyData: chobj, cutBoxList: getsobj.cutlist }, () => {
                this.compareSubCategoryData(this.state.loadedBrandPercentages);
            });
        });
    }
    //redo changes hisory
    fieldHistoryRedo = () => {
        let cutBoxList = JSON.parse(JSON.stringify(this.state.cutBoxList));
        var chobj = this.state.historyData;
        var backidx = (chobj.present>0?(chobj.present + 1):(chobj.future.length - 1));
        var getsobj = chobj.future[backidx];

        var cpastobj = { type:getsobj.type, obj:JSON.parse(JSON.stringify(this.state.selectedCatgory)), cutlist: cutBoxList };
        chobj.past.push(cpastobj);
        chobj.future.splice(-1,1);
        
        this.setState({
            selectedCatgory: null,
        }, () => {
            this.setState({ selectedCatgory: getsobj.obj, historyData: chobj, cutBoxList: getsobj.cutlist }, () => {
                this.compareSubCategoryData(this.state.loadedBrandPercentages);
            });
        });
    }
    //changes
    handleChangeBrandCat = (e) => {
        this.setState({ addselectcat: e.target.value });
    }
    //toggle draw enable
    toggleEnableDraw = () => {
        this.setState({ isEnableDraw: !this.state.isEnableDraw });
    }
    //convert & save category objects
    saveCategoryObj = (isbrandredirect, branditem) => {
        //check brand draw available
        if(isbrandredirect && (branditem.width <= 0 || branditem.height <= 0)){
            alertService.error(this.props.t("drawboxesfirst"));
            return false;
        }

        let exportsave = this.state.defSaveObj;
        let exportcat = JSON.parse(JSON.stringify(this.state.selectedCatgory));
        let exportsubcat = JSON.parse(JSON.stringify(this.state.selectedSubCat));
        
        //new category save obj
        let newsaveobj = {mpId: exportsave.mp_id, mpSubCategoryRects: [] };

        let returncatobj = saveObjDataConvert(exportcat,false,this.state.divWidth);
        //console.log(returncatobj);

        if(this.state.isChangesAvailable){
            if(this.state.cutBoxList && this.state.cutBoxList.length > 0){
                confirmAlert({
                    title: this.props.t('CUT_ITEMS_AVAILABLE'),
                    message: this.props.t('CUT_LIST_WILL_BE_DELETED'),
                    overlayClassName: (this.props.isRTL==="rtl"?"alertrtl-content":""),
                    buttons: [
                      {
                        label: this.props.t('btnnames.yes'),
                        onClick: () => {
                            this.saveContinue(isbrandredirect, branditem, exportsubcat, newsaveobj, returncatobj); 
                        }
                      },
                      {
                        label: this.props.t('btnnames.no'),
                        onClick: () => {}
                      }
                    ]
                });
            } else{
                this.saveContinue(isbrandredirect, branditem, exportsubcat, newsaveobj, returncatobj); 
            }
        } else{
            this.redirectViewHandle(isbrandredirect, returncatobj, exportsubcat, branditem);
        }
    }
    //save continue
    saveContinue = (isbrandredirect, branditem, exportsubcat, newsaveobj, returncatobj) => {
        for (let i = 0; i < returncatobj.sub_categories.length; i++) {
            const subcatitem = returncatobj.sub_categories[i];
            
            if(subcatitem.id === exportsubcat.id ){
                
                for (let j = 0; j < subcatitem.rects.length; j++) {
                    const rectitem = subcatitem.rects[j];
                    
                    let newrectobj = {
                        mpSubCategoryRectId: rectitem.id, 
                        brands: []
                    };

                    for (let k = 0; k < rectitem.brands.length; k++) {
                        const branditem = rectitem.brands[k];
                        
                        let newbrandobj = {
                            id: branditem.id,
                            brand_id: branditem.brand_id,
                            x: branditem.x,
                            width: (branditem.width?branditem.width:0),
                            box_width_percentage: (branditem.box_width_percentage?branditem.box_width_percentage:0),
                            isSnapped: branditem.isSnapped,
                            contain_shelves: [],
                            isNew: (branditem.is_new?branditem.is_new:false),
                            isDelete: (branditem.is_delete?branditem.is_delete:false)
                        };

                        for (let m = 0; m < branditem.contain_shelves.length; m++) {
                            const conshelf = branditem.contain_shelves[m];
                            
                            newbrandobj.contain_shelves.push({ id: -1, rank: conshelf.rank });
                        }

                        newrectobj.brands.push(newbrandobj);
                    }

                    newsaveobj.mpSubCategoryRects.push(newrectobj);
                }
                break;
            }
        }

        //console.log(newsaveobj);
        //save
        this.setState({ isShowLoadingModal: true}, () => {
            submitSets(submitCollection.saveMpBrands, newsaveobj, false, null, true).then(res => {
                //console.log(res.extra);

                if (res && res.status) {
                    alertService.success(this.props.t("brandssavedsuccess"));
                    this.loadMPDetails(isbrandredirect, returncatobj, exportsubcat, branditem);
                } else{
                    // alertService.error((res.error && res.error && res.error.errorMessage)?res.error.errorMessage:this.props.t("ERROR_OCCURRED"));
                    this.setState({ isShowLoadingModal: false });
                }
            });
        }); 
    }
    //load mp details
    loadMPDetails = (isbrandredirect, catobj, subcatobj, brandobj) => {
        let svobj = { chainHasDepartmentId:this.state.defSaveObj.department.department_id };
        
        this.setState({ isShowLoadingModal: true }, () => {
            submitSets(submitCollection.loadMp, svobj, false).then(res => {
                //console.log(res);
                if(res && res.status){
                    let newsaveobj = ((res.extra && Object.keys(res.extra).length > 0)?res.extra:this.state.defSaveObj);
                    
                    this.setState({
                        isShowLoadingModal: false, defSaveObj: newsaveobj,
                    }, () => {
                        //find new category object
                        let foundcatobj = newsaveobj.categories.find(x => 
                            (!catobj.is_supplier_based && !x.is_supplier_based && x.category_id === catobj.category_id) ||
                            (catobj.is_supplier_based && x.is_supplier_based && x.category_id === catobj.category_id && x.supplier_obj.supplier_id === catobj.supplier_obj.supplier_id)
                        );
                        
                        if(foundcatobj){
                            let foundsubcatobj = foundcatobj.sub_categories.find(x => 
                                (!subcatobj.is_supplier_based && !x.is_supplier_based && x.sub_category_id === subcatobj.sub_category_id) ||
                                (subcatobj.is_supplier_based && x.is_supplier_based && x.sub_category_id === subcatobj.sub_category_id && x.supplier_obj.supplier_id === subcatobj.supplier_obj.supplier_id)
                            );
                            
                            if(foundsubcatobj){
                                let foundbrandobj = null;
                                if(isbrandredirect){
                                    for (let i = 0; i < foundsubcatobj.rects.length; i++) {
                                        const selrectobj = foundsubcatobj.rects[i];
                                        if(!foundbrandobj && !selrectobj.is_delete){
                                            foundbrandobj = selrectobj.brands.find(x =>  (x.brand_id === brandobj.brand_id));
                                        }
                                    }
                                    
                                    if(foundbrandobj){
                                        this.redirectViewHandle(isbrandredirect, foundcatobj, foundsubcatobj, foundbrandobj);
                                    } else{
                                        alertService.error(this.props.t("brandnotfound"));
                                    }
                                } else{
                                    this.redirectViewHandle(isbrandredirect, foundcatobj, foundsubcatobj, null);
                                }
                                
                            } else{
                                alertService.error(this.props.t("subcatnotfound"));
                                //temp -
                                this.redirectViewHandle(isbrandredirect, catobj, subcatobj, brandobj);
                            }
                        } else{
                            alertService.error(this.props.t("catnotfound")); 
                        }
                    });    
                } else{
                    alertService.error(this.props.t("ERROR_OCCURRED"));
                    this.setState({ isShowLoadingModal: false });
                }
            });    
        });
        
    }
    //
    redirectViewHandle = (isproductredirect, exportcat, exportsubcat, exportbrand) => {
        //update redux
        this.props.setMPCategoryAction(exportcat);
        this.props.setMPSubCatAction(exportsubcat);
        this.props.setMasterPlanAction(this.state.defSaveObj);
        
        if(isproductredirect){
            this.props.setMPBrandAction(exportbrand);
            this.props.history.push("/masterplanograms/productdetails");
        } else{
            this.props.history.push("/masterplanograms/details");
        }
    }
    //update div details
    updateDivDetails = (cwidth, cheight) => {
        if(this.state.oneTimeConvert){
            let exportcat = JSON.parse(JSON.stringify(this.state.selectedCatgory));
            let exportfield = exportcat.field_obj;
            //calculate dimention
            let redicedheight = (cheight - 70);
            
            var dimention = (redicedheight / measureConverter(exportfield.field_uom,this.state.displayUOM,exportfield.field_height));

            let returncatobj = saveObjDataConvert(exportcat,true,cwidth,dimention);
            //console.log(returncatobj);

            this.setState({ selectedCatgory: returncatobj, divWidth: cwidth, divHeight: cheight, oneTimeConvert: false }, () => {
                this.compareSubCategoryData(this.state.loadedBrandPercentages);
            });    
        }
    }

    //remove added brand
    handleremoveBrand = (subcidx,rectidx,cidx) => {
        this.fieldHistoryAdd(JSON.parse(JSON.stringify(this.state.selectedCatgory)),1,JSON.parse(JSON.stringify(this.state.cutBoxList)));

        let csaveobj = this.state.selectedCatgory;
        let cremoveitem = csaveobj.sub_categories[subcidx].rects[rectidx].brands[cidx];

        if(!cremoveitem.is_new){
            cremoveitem["is_delete"] = true;
        } else{
            csaveobj.sub_categories[subcidx].rects[rectidx].brands.splice(cidx,1);
        }

        let isbrandsavailable = false;
        for (let i = 0; i < csaveobj.sub_categories[subcidx].rects.length; i++) {
            const rectitem = csaveobj.sub_categories[subcidx].rects[i];
            if(!rectitem.is_delete && rectitem.brands && rectitem.brands.length > 0){
                isbrandsavailable = true;
            }
        }

        this.setState({ selectedCategory: csaveobj, ishavebrands: isbrandsavailable }, () => {
            this.compareSubCategoryData(this.state.loadedBrandPercentages);
        });
    }
    //redirect view list
    redirectList = (isopen, viewitem, isDraw) => {
        //if(isopen){
            let selectedcat = this.state.selectedCatgory;
            let selectedscat = this.state.selectedSubCat;
            let subitems = selectedcat.sub_categories.filter(x => x.id === selectedscat.id );
            
            let filteritems = [];
            for (let i = 0; i < subitems.length; i++) {
                const subitem = subitems[i];
                if(!subitem.is_delete && subitem.rects && subitem.rects.length > 0){
                    for (let i = 0; i < subitem.rects.length; i++) {
                        const rectitem = subitem.rects[i];
                        if(!rectitem.is_delete){
                            let filterbrands = rectitem.brands.filter(z => !z.is_delete && z.brand_id === viewitem.brandId);

                            if(filterbrands.length > 0){
                                for (let l = 0; l < filterbrands.length; l++) {
                                    const fbitem = filterbrands[l];
                                    fbitem["rectid"] = rectitem.id;
                                    fbitem["subcatid"] = selectedscat.sub_category_id;
                                }

                                filteritems = filteritems.concat(filterbrands);
                            }
                        }
                        
                    }
                }
            }
            
            //console.log(filteritems);
            if(filteritems.length === 1){
                if(isDraw){
                    this.handleSelectDraw(filteritems[0],filteritems[0].subcatid);
                } else{
                    //if boxes available
                    if(filteritems[0].width > 0 && filteritems[0].percentage > 0){
                        this.saveCategoryObj(true,filteritems[0]);
                    } else{
                        // this.handleSelectDraw(filteritems[0]);
                        this.handleSelectDraw(filteritems[0],filteritems[0].subcatid);
                        alertService.error(this.props.t("drawboxesfirst"));
                    }
                }
            } else if(filteritems.length === 0){
                //if not add new
                //if more than one rect
                if(selectedscat.rects && selectedscat.rects.length > 1){
                    //find selected brand index
                    let findselidx = this.state.loadedAllBrandsList.findIndex(x => x.brandId === viewitem.brandId);
                    if(findselidx > -1){
                        this.setState({ showbrand: findselidx }, () => {
                            this.additemElement.click();
                        });
                    }
                } else{
                    this.addNewSubCategory(null, true, viewitem);
                }
                
                //alertService.error(this.props.t("addbrandfirst"));
                
            }

            this.setState({ percentageDropList: filteritems });
        //}
    }
    //clear dropdown category
    handleDropOpen = (isshow) => {
        if(isshow){
            setTimeout(() => {
                let defscatobj = 0;
                let defbrandobj = (this.state.showbrand?this.state.showbrand:0);
                //console.log(defbrandobj);
                document.getElementById("newbrandrect-select").value = defscatobj;
                document.getElementById("newbrand-select").value = defbrandobj;

                this.setState({ showbrand: null });
            }, 100);
        }
    }
    //
    updateCutList = (cutlist) => {
        for (let i = 0; i < cutlist.length; i++) {
            const cutitem = cutlist[i];
            let filtersamelist = cutlist.filter(x => x.citem.brand_id === cutitem.citem.brand_id);
            
            if(filtersamelist.length === 1){
                cutitem["cutno"] = 1;
            } else{
                for (let j = 0; j < filtersamelist.length; j++) {
                    const sameitem = filtersamelist[j];
                    sameitem["cutno"] = (j + 1);
                }
            }
        }

        this.setState({ cutBoxList: cutlist });
    }

    render() {
        let curcat = this.state.selectedCatgory;
        let cursubcat = this.state.selectedSubCat;
        
        return (<>
            <Col xs={12} className={"main-content mpview-main catdetails-view "+(this.props.isRTL==="rtl"?"RTL":"")} dir={this.props.isRTL}>
                <Breadcrumb dir="ltr">
                    {this.props.isRTL==="rtl"?<>
                    <Breadcrumb.Item active>{this.props.t('brands')}</Breadcrumb.Item>
                    <li className="breadcrumb-item"><Link to="/masterplanograms/details" role="button">{this.props.t('sub_category')}</Link></li>
                    <li className="breadcrumb-item"><Link to="/masterplanograms/selectcat" role="button">{this.props.t('category')}</Link></li>
                    {/* <li className="breadcrumb-item"><Link to="/masterplanograms/selectdept" role="button">{this.props.t('selectdept')}</Link></li> */}
                    <li className="breadcrumb-item"><Link to="/masterplanograms" role="button">{this.props.t('master_planogram')}</Link></li>
                    <li className="breadcrumb-item"><Link to="/dashboard" role="button">{this.props.t('home')}</Link></li>
                    </>:<>
                    <li className="breadcrumb-item"><Link to="/dashboard" role="button">{this.props.t('home')}</Link></li>
                    <li className="breadcrumb-item"><Link to="/masterplanograms" role="button">{this.props.t('master_planogram')}</Link></li>
                    {/* <li className="breadcrumb-item"><Link to="/masterplanograms/selectdept" role="button">{this.props.t('selectdept')}</Link></li> */}
                    <li className="breadcrumb-item"><Link to="/masterplanograms/selectcat" role="button">{this.props.t('category')}</Link></li>
                    <li className="breadcrumb-item"><Link to="/masterplanograms/details" role="button">{this.props.t('sub_category')}</Link></li>
                    <Breadcrumb.Item active>{this.props.t('brands')}</Breadcrumb.Item>
                    </>}
                </Breadcrumb>

                <Col>
                    <h3 className="mainheader-txt">
                        <Button variant="light" type="button" className="backpg-link" onClick={this.handleGoBack} style={{textTransform:"uppercase",fontWeight:"600",padding:"2px 5px",marginRight:"5px"}}><ChevronLeftIcon size={22}/></Button>
                        {this.props.isRTL === "rtl"?<span className='rtl-text'>
                            {cursubcat?(<>{(cursubcat.is_supplier_based?(cursubcat.supplier_obj.supplier_name):cursubcat.sub_category_name)+" "+this.props.t("subcategory")} <ChevronRightIcon size={16}/></>):"Default Sub Category"}
                            {curcat?(curcat.is_supplier_based?(curcat.supplier_obj.supplier_name):(curcat.category_name+" "+this.props.t("category"))):"Default Category"}
                        </span>:<>
                        {curcat?(curcat.is_supplier_based?(curcat.supplier_obj.supplier_name):(curcat.category_name+" ")+this.props.t("category")):"Default Category"}
                        {cursubcat?(<><ChevronRightIcon size={16}/> {(cursubcat.is_supplier_based?(cursubcat.supplier_obj.supplier_name):cursubcat.sub_category_name)+" "+this.props.t("subcategory")}</>):"Default Sub Category"}
                        </>}
                    </h3>
                </Col>
                
                <Col className='MPDrawing'>
                    <Col style={{position:"relative"}}>
                        <ul className='list-inline toptools-list' style={{position:"absolute", right:"0px", marginTop:"-40px"}}>
                            <li className='list-inline-item'>
                                {/* {this.state.selectedDraw?<label>Selected Draw: 
                                    <label>{this.state.activeDrawType==="brand"?"":this.state.selectedDraw.sub_category_name}</label>
                                </label>:<></>} */}
                                {/* <ButtonGroup>
                                    <Button variant="primary" size="sm" onClick={() => this.changeDrawType("subc")} className={this.state.activeDrawType === "subc"?"active":""}>Sub Category</Button>
                                    <Button variant="primary" size="sm" onClick={() => this.changeDrawType("supp")} className={this.state.activeDrawType === "supp"?"active":""}>Suppliers</Button>
                                </ButtonGroup> */}
                            </li>
                            <li className='list-inline-item' style={{display:"inline-flex"}}>
                                {/* <Button variant="primary" size="sm" onClick={() => this.changeDrawType("brand")} className={this.state.activeDrawType === "brand"?"active":""}>Brands</Button> */}
                                {/* <Form.Control as="select" size="sm" style={{marginLeft:"5px", width:"150px"}}></Form.Control> */}
                            </li>
                            {/* <li className='list-inline-item' style={{marginRight: "50px"}}>
                                <Button variant={this.state.isEnableDraw?"danger":"warning"} size="sm" onClick={this.toggleEnableDraw}>{this.state.isEnableDraw?"Draw Disable":"Draw Enable"}</Button>
                            </li> */}
                        </ul>
                    </Col>
                    
                    <MPToolBox actype={this.state.activeDrawType} activeTool={this.state.activeTool} t={this.props.t} historyData={this.state.historyData} handleUndoRedo={this.handleUndoRedo} changeTool={this.changeTool} changeDrawType={this.changeDrawType} />

                    {this.state.selectedCatgory?<MPDrawing selectedDraw={this.state.selectedDraw} selectedSubCat={this.state.selectedSubCat} changeTool={this.changeTool} updateDivDetails={this.updateDivDetails} isEnableDraw={this.state.isEnableDraw} activeTool={this.state.activeTool} actype={this.state.activeDrawType} selectedCategory={this.state.selectedCatgory} rectsets={this.state.selectedCatgory?this.state.selectedCatgory.sub_categories:[]} 
                    cutBoxList={this.state.cutBoxList} updateCutList={this.updateCutList} setRects={this.setRects} isRTL={this.props.isRTL} t={this.props.t} />:<></>}
                </Col>

                <Row className="bottomcontent-main">
                    <Col className="bottom-single" xs={12} lg={4}>
                        <Col className='sub-content'>
                            <h3>{this.props.t("subcat_rules")}</h3>
                        </Col>
                    </Col>
                    <Col className="bottom-single purple-bg">
                        <Col className='sub-content'>
                            <Row>
                                <Col>
                                    <h3>{this.props.t("brands")}</h3>
                                    <ul className='newcats-list list-inline'>
                                        {this.state.selectedCatgory && this.state.selectedCatgory.sub_categories?<>
                                            {this.state.selectedCatgory.sub_categories.map((xitem, xidx) => {
                                                return <React.Fragment key={xidx}>
                                                    {xitem.id === this.state.selectedSubCat.id?<>
                                                    {xitem.rects.map((yitem, yidx) => {
                                                        return <React.Fragment key={yidx}>
                                                            {yitem.brands && yitem.brands.length?
                                                            yitem.brands.map((zitem,zidx) => {
                                                                return <React.Fragment key={zidx}>{!zitem.is_delete?<li className={'newcats-item list-inline-item '+
                                                                    (this.state.selectedDraw?((zitem.brand_id === this.state.selectedDraw.brand_id)?"active":""):'')}>
                                                                    <span className="remove-icon" onClick={()=>this.handleremoveBrand(xidx,yidx,zidx)}><XIcon size={12} /></span>
                                                                    <span className="remove-icon" onClick={()=>this.saveCategoryObj(true,zitem)} style={this.props.isRTL === "rtl"?{marginRight:"28px"}:{marginLeft:"28px"}}><CopyIcon size={12} /></span>
                                                                    <div onClick={() => this.handleSelectDraw(zitem,xitem.sub_category_id)}>
                                                                        <Col className="sub-content"></Col>
                                                                        <h6 title={zitem.brand_name}>{zitem.brand_name.substring(0,12)+(zitem.brand_name.length > 12?"..":"")}</h6>    
                                                                    </div>
                                                                </li>:<></>}</React.Fragment>
                                                            })
                                                            :<></>}
                                                        </React.Fragment>
                                                    })}</>:<></>}
                                                </React.Fragment>;
                                            })}
                                        </>:<></>}
                                        <li className='newcats-item list-inline-item'>
                                            <Dropdown drop='up' onToggle={this.handleDropOpen}>
                                                <Dropdown.Toggle variant="default">
                                                    <div>
                                                        <Col className="sub-content add" ref={r => this.additemElement = r}>
                                                            <PlusIcon size={22} />
                                                        </Col>
                                                        <h6>{this.props.t("btnnames.add")}</h6>
                                                    </div>
                                                </Dropdown.Toggle>

                                                <Dropdown.Menu className={"newcat-drop"}>
                                                    <Col style={{padding:"0px 15px"}}>
                                                        <label>{this.props.t("SELECT_RECT")}</label>
                                                        <Form.Control as="select" id="newbrandrect-select" onChange={this.handleChangeBrandCat} size="sm">
                                                            {cursubcat?<>
                                                                {cursubcat.rects.map((zitem,zidx) => {
                                                                    return <option key={zidx} value={zidx}>{cursubcat.sub_category_name} - {(zidx + 1)}</option>
                                                                })}
                                                            </>:<></>}
                                                        </Form.Control>

                                                        <label>{this.props.t("brands")}</label>
                                                        <Form.Control as="select" id="newbrand-select" size="sm">
                                                            {this.state.selectedSubCat?<>
                                                            {this.state.loadedAllBrandsList.map((xitem,xidx) => {
                                                                return <React.Fragment key={xidx}>
                                                                    <option value={xidx}>{xitem.brandName}</option>
                                                                </React.Fragment>;
                                                            })}</>:<></>}
                                                        </Form.Control>
                                                    </Col>
                                                    <Dropdown.Item href="#">
                                                        <Button variant="success" onClick={e => this.addNewSubCategory(e)} size="sm">{this.props.t("btnnames.save")}</Button>
                                                    </Dropdown.Item>
                                                </Dropdown.Menu>
                                            </Dropdown>
                                        </li>
                                    </ul>
                                </Col>
                                <Col xs={5} className="light-purple sub-cat-prg-bars">
                                    <Row>
                                        <Col xs={8} className="title-col"></Col>
                                        <Col xs={2} className="title-col">{this.props.t("NOW")}</Col>
                                        <Col xs={2} className="title-col">{this.props.t("REC")}</Col>
                                    </Row>    
                                    <Row className="scroll-content">
                                    {this.state.loadedBrandPercentages?<>
                                        {this.state.loadedBrandPercentages.map((xitem, xidx) => {
                                            let csubnametxt = (xitem.brandName.substring(0,15)+(xitem.brandName.length > 15?"..":""));
                                            let iscolorlight = checkColorIsLight((xitem.brandColor?xitem.brandColor:"#5128a0"));
                                            
                                            return <React.Fragment key={xidx}><Col xs={6} style={{padding:"0px"}}>
                                                    <CustomProgressBar text={csubnametxt} mainbarcolor={xitem.brandColor?xitem.brandColor:"#5128a0"} textcolor={iscolorlight?"#5128a0":"#fff"} mainbarpercentage={xitem.percentage > 0?xitem.percentage:0} showsubbar="true" subbarpercentage={xitem.suggestedSpace} />
                                                </Col>
                                                <Col xs={2} className="val-col links">
                                                    <ButtonGroup>
                                                        <Dropdown drop='up' alignRight={true} onClick={e => this.redirectList(e, xitem, true)}>
                                                            <Dropdown.Toggle variant="primary" size='sm' title={this.props.t("enable_draw")}>
                                                                <FeatherIcon icon="layout" size={12} />
                                                            </Dropdown.Toggle>

                                                            <Dropdown.Menu className={this.state.percentageDropList && this.state.percentageDropList.length <= 1?"d-none":""}>
                                                                {this.state.percentageDropList.map((zitem, zidx) => {
                                                                    return <Dropdown.Item key={zidx} href="#" onClick={() => this.handleSelectDraw(zitem) } className={zitem.is_supplier_based?'sup-based':''}>
                                                                        {(zitem.is_supplier_based?(zitem.supplier_obj.supplier_name.substring(0,15)+(zitem.supplier_obj.supplier_name.length>15?"..":""))
                                                                        :(zitem.brand_name.substring(0,15)+(zitem.brand_name.length>15?"..":"")))}    
                                                                    </Dropdown.Item>;
                                                                })}
                                                            </Dropdown.Menu>
                                                        </Dropdown>
                                                        <Dropdown drop='up' alignRight={true} onClick={e => this.redirectList(e, xitem)}>
                                                            <Dropdown.Toggle variant="primary" size='sm' title={this.props.t("open_products")}>
                                                                <FeatherIcon icon="copy" size={12} />
                                                            </Dropdown.Toggle>

                                                            <Dropdown.Menu className={this.state.percentageDropList && this.state.percentageDropList.length <= 1?"d-none":""}>
                                                                {this.state.percentageDropList.map((zitem, zidx) => {
                                                                    return <Dropdown.Item key={zidx} href="#" onClick={() => this.saveCategoryObj(true,zitem) } className={zitem.is_supplier_based?'sup-based':''}>
                                                                        {(zitem.is_supplier_based?(zitem.supplier_obj.supplier_name.substring(0,15)+(zitem.supplier_obj.supplier_name.length>15?"..":""))
                                                                        :(zitem.brand_name.substring(0,15)+(zitem.brand_name.length>15?"..":"")))}    
                                                                    </Dropdown.Item>;
                                                                })}
                                                            </Dropdown.Menu>
                                                        </Dropdown>
                                                    </ButtonGroup>
                                                </Col>
                                                <Col xs={2} className="val-col">{xitem.percentage > 0?xitem.percentage:0}%</Col>
                                                <Col xs={2} className="val-col light">{xitem.suggestedSpace}%</Col>
                                            </React.Fragment>;
                                        })}
                                    </>:<></>}                      
                                    </Row> 
                                </Col>
                            </Row>
                        </Col>
                    </Col>
                </Row>

                <Col style={{marginBottom:"40px"}}>
                    <ul className='list-inline' style={{paddingRight: "0px"}}>
                        <li className='list-inline-item'>
                            <Button variant="secondary" onClick={this.handleGoBack}>{this.props.t("btnnames.back")}</Button>
                        </li>
                        {/* <li className='list-inline-item float-right' style={{marginLeft:"10px"}}>
                            <Button variant="primary">Activate</Button>
                        </li> */}
                        <li className={'list-inline-item '+(this.props.isRTL==="rtl"?"float-left":"float-right")}>
                            <Button variant="success" onClick={() => this.saveCategoryObj()}>{this.props.t("btnnames.save")}</Button>
                        </li>
                    </ul>
                </Col>
            </Col>

            <AcViewModal showmodal={this.state.isShowLoadingModal} />
        </>);
    }
}

const mapDispatchToProps = dispatch => ({
    setMasterPlanAction: (payload) => dispatch(selectedMasterPlanSetAction(payload)),
    setMPCategoryAction: (payload) => dispatch(selectedMPCategorySetAction(payload)),
    setMPSubCatAction: (payload) => dispatch(selectedMPSubCatSetAction(payload)),
    setMPBrandAction: (payload) => dispatch(selectedMPBrandSetAction(payload)),
});

export default withTranslation()(withRouter(connect(null,mapDispatchToProps)(BrandDrawView)));