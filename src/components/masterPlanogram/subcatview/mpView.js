import React, { Component } from 'react';
import { Col, Breadcrumb, Button, Row, Dropdown, Form, ButtonGroup } from 'react-bootstrap';
import { connect } from 'react-redux';
import { withTranslation } from 'react-i18next';
import { withRouter, Link } from 'react-router-dom';
import { ChevronLeftIcon, PlusIcon, XIcon, CopyIcon } from '@primer/octicons-react';
//import randomColor from 'randomcolor';
import { v4 as uuidv4 } from 'uuid'; //unique id
import FeatherIcon from 'feather-icons-react';
import { confirmAlert } from 'react-confirm-alert'; //confirm alert

import { selectedMasterPlanSetAction, selectedMPCategorySetAction, selectedMPSubCatSetAction } from '../../../actions/masterPlanogram/masterplanogram_action';

import { measureConverter, roundOffDecimal, checkColorIsLight } from '../../../_services/common.service';
import { submitCollection } from '../../../_services/submit.service';
import { submitSets } from '../../UiComponents/SubmitSets';
import { AcViewModal } from '../../UiComponents/AcImports'; 

import { reCheckSnapRects, saveObjDataConvert } from '../AddMethods'; //convertWidthPercent, 

import MPDrawing from './MPDrawing/MPDrawing';
import MPToolBox from './MPDrawing/ToolBox';

import CustomProgressBar from '../../common_layouts/customProgressBar';
import { alertService } from '../../../_services/alert.service';

//import { samplesubcatarr } from '../SampleData'; //, samplesupparr

import './mcview.css';

export class MasterPlanogramView extends Component {
    constructor(props){
        super(props);

        this.additemElement = React.createRef();

        this.state = {
            defSaveObj: null, selectedCatgory: null, addselectcat: null, showsubcat: null,
            isChangesAvailable: false,
            loadedSubCategoryList: [], loadedSubCatPercentages: [],
            loadedSuppliersList: [],
            activeDrawType: "subc", //subc, supp, brand
            isEnableDraw: true, selectedDraw: null, oneTimeConvert: true,
            divWidth: 0, divHeight: 0, displayUOM: "cm",
            //history points
            historyData: { past: [], present: 0, future: [] },
            //toolbox actions
            activeTool: "default",
            isShowLoadingModal: false, ishavesubcategories: false,
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
            this.setState({ selectedCatgory: JSON.parse(JSON.stringify(this.props.mpstate.mpCatDetails)) }, () => {
                let selcatobj = this.state.selectedCatgory;
                this.getAllSubCategories(selcatobj.category_id);
                this.getSubCatPercentages(selcatobj.category_id);

                this.getAllSuppliers();
            });
        }
    }
    //load all sub categories of selected category
    getAllSubCategories = (catid) => {
        let selcat = this.state.selectedCatgory;
        let supid = (selcat.is_supplier_based?selcat.supplier_obj.supplier_id:0);

        let svobj = { categoryId: catid, supplierId: supid };
        submitSets(submitCollection.mpSubCategoryList, svobj).then(res => {
            //console.log(res.extra);

            if(res && res.status && res.extra){
                this.setState({ loadedSubCategoryList: res.extra });
            }
        });

        //this.setState({ loadedSubCategoryList: samplesubcatarr });
    }
    //load all sub category percentages of selected category
    getSubCatPercentages = (catid) => {
        let defSaveObj = this.state.defSaveObj;
        let selcat = this.state.selectedCatgory;
        let supid = (selcat.is_supplier_based?selcat.supplier_obj.supplier_id:0);
        
        let svobj = { categoryId: catid, departmentId: defSaveObj.department.department_id, supplierId: supid };
        submitSets(submitCollection.mpSubCategoryPercentage, svobj).then(res => {
            //console.log(res.extra);

            if(res && res.status && res.extra){
                this.setState({ loadedSubCatPercentages: res.extra }, () => {
                    this.compareSubCategoryData(this.state.loadedSubCatPercentages);
                    this.getNewProdCountOfSubCatLevel(svobj);
                });
            }else{
                this.getNewProdCountOfSubCatLevel(svobj);
            }
        });
    }

    getNewProdCountOfSubCatLevel = (svobj) => {

        submitSets(submitCollection.mpSubCategoryNewProdCount, svobj, false, null, true).then(res => {

                    if(res && res.status && res.extra){
                        this.props.setNewProdCountSubCat(res.extra);
                    }else{
                        // alertService.error((res.error && res.error && res.error.errorMessage)?res.error.errorMessage:this.props.t("ERROR_OCCURRED"));
                        this.props.setNewProdCountSubCat(null);
                    }
                });

    } 

    //sub caterory list compare with added sub category list
    compareSubCategoryData = (loadeddata) => {
        let selectedCategory = this.state.selectedCatgory;
        
        for (let i = 0; i < loadeddata.length; i++) {
            const categoryitem = loadeddata[i];
            
            let catfinditems = selectedCategory.sub_categories.find(x => x.sub_category_id === categoryitem.subCategoryId && !x.is_delete); // && !x.is_supplier_based
            
            if(catfinditems){
                let totalrectper = 0;
                for (let j = 0; j < catfinditems.rects.length; j++) {
                    const rectitem = catfinditems.rects[j];
                    if(!rectitem.is_delete){
                        totalrectper = (rectitem.percentage + totalrectper);
                    }
                }
                
                if(totalrectper > 0){
                    categoryitem["percentage"] = roundOffDecimal(totalrectper,2);
                } else{
                    categoryitem["percentage"] = 0;
                }
            } else{
                categoryitem["percentage"] = 0;
            }
        }
        
        this.setState({ loadedSubCatPercentages: loadeddata });
    }
    
    //load all suppliers
    getAllSuppliers = () => {
        var csobj={
            isSupplierSpecific: true,
            categoryId: this.state.selectedCatgory.category_id,
        }
        submitSets(submitCollection.mpSupplierList, csobj).then(res => {
            //console.log(res);

            if(res && res.status && res.extra){
                this.setState({
                    loadedSuppliersList: res.extra,
                });
            }
        });

        //this.setState({ loadedSuppliersList: samplesupparr });
    }

    setRects = (rects, cutlist) => {
        this.fieldHistoryAdd(JSON.parse(JSON.stringify(this.state.selectedCatgory)),1,JSON.parse(JSON.stringify(this.state.cutBoxList)));
        let ccatobj = this.state.selectedCatgory;

        for (let i = 0; i < rects.length; i++) {
            const subcatitem = rects[i];
            
            if(!subcatitem.is_delete){
                for (let l = 0; l < subcatitem.rects.length; l++) {
                    const rectitem = subcatitem.rects[l];
                    
                    if(!rectitem.is_delete){
                        let snappingobj = reCheckSnapRects(rectitem, i, l, rects, true);
                        //console.log(snappingobj);

                        rectitem.isSnapped = false;
                        if(snappingobj){
                            if(snappingobj.isrightsnap){
                                rectitem.isSnapped = true;
                            } else if(snappingobj.isleftsnap > -1){
                                rects[snappingobj.leftparent].rects[snappingobj.isleftsnap].isSnapped = true;
                            }
                        }
                    }
                    
                }
            }
        }
        //console.log(rects);
        ccatobj["sub_categories"] = rects;
        
        //this.setState({ selectedCatgory: null }, () => {
            this.setState({ selectedCatgory: ccatobj }, () => {
                this.compareSubCategoryData(this.state.loadedSubCatPercentages);

                if(cutlist){
                    this.updateCutList(cutlist);
                }
            });
        //});
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
                        this.props.history.push("/masterplanograms/selectcat");
                    }
                  },
                  {
                    label: this.props.t('btnnames.no'),
                    onClick: () => {}
                  }
                ]
            });
        } else{
            this.props.history.push("/masterplanograms/selectcat");  
        }
    }

    addNewSubCategory = (e, isautoadd, subcat) => {
        this.fieldHistoryAdd(JSON.parse(JSON.stringify(this.state.selectedCatgory)),1,JSON.parse(JSON.stringify(this.state.cutBoxList)));
        
        let csaveobj = this.state.selectedCatgory;

        let selectedtxt = -1; let selectedsuptxt = -1;

        if(isautoadd){
            selectedtxt = subcat.subCategoryId;
            selectedsuptxt = -1;
        } else{
            selectedtxt = parseInt(document.getElementById("newcat-select").value);
            selectedsuptxt = parseInt(document.getElementById("newsup-select").value);
        }

        let issupplier = (selectedsuptxt > 0);

        let subcitem = this.state.loadedSubCategoryList.find(z => z.subCategoryId === selectedtxt);
        let isalreadyadded = csaveobj.sub_categories.find(x => (
            !x.is_delete &&
            ((!issupplier && !x.is_supplier_based && x.sub_category_id === selectedtxt) ||
            (issupplier && x.is_supplier_based && x.supplier_obj.supplier_id === selectedsuptxt && x.sub_category_id === selectedtxt))
        ));
        //console.log(subcitem);

        if(subcitem){
            let findsupitem = (issupplier?this.state.loadedSuppliersList.find(z => z.supplier_id === selectedsuptxt):null);
            let newsupobj = (findsupitem?{ id: -1, supplier_id: findsupitem.supplier_id, supplier_name: findsupitem.supplier_name }:null);
            
            if(!isalreadyadded){
                this.fieldHistoryAdd(JSON.parse(JSON.stringify(this.state.selectedCatgory)),1,JSON.parse(JSON.stringify(this.state.cutBoxList)));

                let scatobj = {id: uuidv4(),
                    sub_category_id: subcitem.subCategoryId, sub_category_name: subcitem.subCategoryName, 
                    is_supplier_based: issupplier, supplier_obj: newsupobj,
                    x: 0, y: 0, width: 0, height: 0, 
                    percentage: 0,
                    is_new: true, is_delete: false, color: (subcitem.subCategoryColor?subcitem.subCategoryColor:"#5128a0"), rects: [],
                };
                //console.log(scatobj);
                csaveobj.sub_categories.push(scatobj);
                this.setState({ selectedCatgory: csaveobj }, () => {
                    this.compareSubCategoryData(this.state.loadedSubCatPercentages);

                    //if(isautoadd){ 
                        this.handleSelectDraw(scatobj);
                    //}
                });
            } else{
                alertService.error(this.props.t("ALREADY_ADDED"));
                if(e){ e.preventDefault(); }
            }    
        } else{
            alertService.error(this.props.t("selectasubcategory"));
            if(e){ e.preventDefault(); }
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
    handleSelectDraw = (sitem) => {
        //if(this.state.activeTool === "draw"){
            this.setState({ selectedDraw: sitem, activeTool: "draw" });
        // } else{
        //     alertService.error(this.props.t("activatedrawtool"));
        // }
    }
    //manage changes history
    fieldHistoryAdd = (csobj, type, cutBoxList) => {
        ///type=1 add item, type=2 delete item, type=3 move item
        //console.log(cutBoxList);
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
        
        var cfutureobj = { type:getsobj.type, obj:JSON.parse(JSON.stringify(this.state.selectedCatgory)), cutlist: cutBoxList };
        chobj.future.push(cfutureobj);
        chobj.past.splice(-1,1);
        
        let ccatobj = this.state.selectedCatgory;
        ccatobj["sub_categories"] = [];
        
        let isChangesAvailable = (chobj.past.length === 0?false:this.state.isChangesAvailable);

        this.setState({ selectedCatgory: ccatobj, isChangesAvailable: isChangesAvailable }, () => {
            this.setState({ selectedCatgory: getsobj.obj, historyData: chobj, cutBoxList: getsobj.cutlist }, () => {
                this.compareSubCategoryData(this.state.loadedSubCatPercentages);
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
        
        let ccatobj = this.state.selectedCatgory;
        ccatobj["sub_categories"] = [];

        this.setState({ selectedCatgory: ccatobj }, () => {
            this.setState({ selectedCatgory: getsobj.obj, historyData: chobj, cutBoxList: getsobj.cutlist }, () => {
                this.compareSubCategoryData(this.state.loadedSubCatPercentages);
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
    saveCategoryObj = (isbrandredirect,selsubcat) => {
        let notdeletedcatlist = null;
        if(isbrandredirect){
            notdeletedcatlist = selsubcat.rects.filter(x => !x.is_delete) 
        }
        
        if(!isbrandredirect || (notdeletedcatlist && notdeletedcatlist.length > 0)){
            
            let exportsave = this.state.defSaveObj;
            let exportcat = JSON.parse(JSON.stringify(this.state.selectedCatgory));
            
            //new category save obj
            let newsaveobj = {mpId: exportsave.mp_id, mpHasCategoryId: exportcat.id, subCategories: [] };

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
                                this.saveContinue(isbrandredirect, selsubcat, newsaveobj, returncatobj);    
                            }
                          },
                          {
                            label: this.props.t('btnnames.no'),
                            onClick: () => {}
                          }
                        ]
                    });
                } else{
                    this.saveContinue(isbrandredirect, selsubcat, newsaveobj, returncatobj);  
                }
            } else{
                this.redirectViewHandle(isbrandredirect, returncatobj, selsubcat);
            }
        } else{
            alertService.error(this.props.t("drawboxesfirst"));
        }
    }
    //save continue 
    saveContinue = (isbrandredirect, selsubcat, newsaveobj, returncatobj) => {
        for (let i = 0; i < returncatobj.sub_categories.length; i++) {
            const subcatitem = returncatobj.sub_categories[i];
            
            let newsubcatobj = {
                id: subcatitem.id,
                sub_category_id: subcatitem.sub_category_id,
                supplier_id: (subcatitem.is_supplier_based?subcatitem.supplier_obj.supplier_id:-1),
                isNew: (subcatitem.is_new?subcatitem.is_new:false),
                isDelete: (subcatitem.is_delete?subcatitem.is_delete:false),
                rects: []
            };
            
            for (let j = 0; j < subcatitem.rects.length; j++) {
                const rectitem = subcatitem.rects[j];
                
                let newrectobj = {
                    id: rectitem.id,
                    x: rectitem.x,
                    width: rectitem.width,
                    box_width_percentage: rectitem.box_width_percentage,
                    isSnapped: rectitem.isSnapped,
                    isNew: (rectitem.is_new?rectitem.is_new:false),
                    isDelete: (rectitem.is_delete?rectitem.is_delete:false),
                    contain_shelves: []
                };

                for (let l = 0; l < rectitem.contain_shelves.length; l++) {
                    const conshelves = rectitem.contain_shelves[l];
                    
                    newrectobj.contain_shelves.push({id: -1, rank: conshelves.rank});
                }

                newsubcatobj.rects.push(newrectobj);
            }

            newsaveobj.subCategories.push(newsubcatobj);
        }
        
        //console.log(newsaveobj);
        //save
        this.setState({ isShowLoadingModal: true}, () => {
            submitSets(submitCollection.saveSubCategory, newsaveobj, false, null, true).then(res => {
                //console.log(res.extra);

                if (res && res.status) {
                    alertService.success(this.props.t("subcatsavesuccess"));
                    this.loadMPDetails(isbrandredirect, returncatobj, selsubcat);
                } else{
                    // alertService.error((res.error && res.error && res.error.errorMessage)?res.error.errorMessage:"Error occurred");
                    this.setState({ isShowLoadingModal: false });
                }
            });
        }); 
    }
    //load mp details
    loadMPDetails = (isredirect, catobj, subcatobj) => {
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
                            let foundsubcatobj = null;
                            if(isredirect){
                                foundsubcatobj = foundcatobj.sub_categories.find(x => 
                                    (!subcatobj.is_supplier_based && !x.is_supplier_based && x.sub_category_id === subcatobj.sub_category_id) ||
                                    (subcatobj.is_supplier_based && x.is_supplier_based && x.sub_category_id === subcatobj.sub_category_id && x.supplier_obj.supplier_id === subcatobj.supplier_obj.supplier_id)
                                );    
                                //console.log(foundsubcatobj);
                                if(foundsubcatobj){
                                    this.redirectViewHandle(isredirect, foundcatobj, foundsubcatobj);
                                } else{
                                    alertService.error(this.props.t("subcatnotfound"));
                                }
                            } else{
                                this.redirectViewHandle(isredirect, foundcatobj, null);
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
    redirectViewHandle = (isbrandredirect, exportcat, exportsubcat) => {
        //update redux
        this.props.setMPCategoryAction(exportcat);
        this.props.setMasterPlanAction(this.state.defSaveObj);

        if(isbrandredirect){
            this.props.setMPSubCatAction(exportsubcat);
            this.props.history.push("/masterplanograms/branddetails");
        } else{
            this.props.history.push("/masterplanograms/selectcat");
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
                this.compareSubCategoryData(this.state.loadedSubCatPercentages);
            });    
        }
    }
    //remove added sub category
    handleremoveSubCategory = (xitem,xidx) => {
        this.fieldHistoryAdd(JSON.parse(JSON.stringify(this.state.selectedCatgory)),2,JSON.parse(JSON.stringify(this.state.cutBoxList)));

        let csaveobj = this.state.selectedCatgory;
        
        if(csaveobj.sub_categories[xidx].id > 0){
            csaveobj.sub_categories[xidx].is_delete = true;
        } else{
            csaveobj.sub_categories.splice(xidx,1);
        }
        
        this.setState({ selectedCategory: csaveobj }, () => {
            this.compareSubCategoryData(this.state.loadedSubCatPercentages);
        });
    }
    //clear dropdown category
    handleDropOpen = (isshow) => {
        if(isshow){
            setTimeout(() => {
                let curcat = this.state.selectedCatgory;

                let defcatobj = (this.state.showsubcat?this.state.showsubcat:this.state.loadedSubCategoryList.length > 0?this.state.loadedSubCategoryList[0].subCategoryId:-1);
                let defsupobj = (curcat && curcat.is_supplier_based?curcat.supplier_obj.supplier_id:-1);

                document.getElementById("newcat-select").value = defcatobj;
                document.getElementById("newsup-select").value = defsupobj;

                this.setState({ showsubcat: null });
            }, 100);
        }
    }
    //redirect view list
    redirectList = (isopen, viewitem, isDraw) => {
        //if(isopen){
            let selectedcat = this.state.selectedCatgory;
            let filteritems = selectedcat.sub_categories.filter(x => !x.is_delete && x.sub_category_id === viewitem.subCategoryId );
            
            
            if(filteritems.length === 1){
                if(isDraw){
                    this.handleSelectDraw(filteritems[0]);
                } else{
                    //if boxes available
                    var undeletedfilterdrects=filteritems[0].rects.length > 0?filteritems[0].rects.filter(x=>x.is_delete!==true):filteritems[0].rects
                    
                    if(undeletedfilterdrects.length > 0){
                        this.saveCategoryObj(true,filteritems[0]);
                    } else{
                        this.handleSelectDraw(filteritems[0]);
                        alertService.error(this.props.t("drawboxesfirst"));
                    }
                }
            } else if(filteritems.length === 0){
                //if not add new
                this.addNewSubCategory(null, true, viewitem);
                /* alertService.error(this.props.t("addsubcatfirst"));
                this.setState({ showsubcat: viewitem.subCategoryId }, () => {
                    this.additemElement.click();
                }); */
            }

            this.setState({ percentageDropList: filteritems });
        //}
    }
    //
    updateCutList = (cutlist) => {
        for (let i = 0; i < cutlist.length; i++) {
            const cutitem = cutlist[i];
            let filtersamelist = cutlist.filter(x => x.parentitem.sub_category_id === cutitem.parentitem.sub_category_id);
            
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
        return (<>
            <Col xs={12} className={"main-content mpview-main catdetails-view "+(this.props.isRTL==="rtl"?"RTL":"")} dir={this.props.isRTL}>
                <Breadcrumb dir="ltr">
                    {this.props.isRTL==="rtl"?<>
                    <Breadcrumb.Item active>{this.props.t('details')}</Breadcrumb.Item>
                    <li className="breadcrumb-item"><Link to="/masterplanograms/selectcat" role="button">{this.props.t('category')}</Link></li>
                    {/* <li className="breadcrumb-item"><Link to="/masterplanograms/selectdept" role="button">{this.props.t('selectdept')}</Link></li> */}
                    <li className="breadcrumb-item"><Link to="/masterplanograms" role="button">{this.props.t('master_planogram')}</Link></li>
                    <li className="breadcrumb-item"><Link to="/dashboard" role="button">{this.props.t('home')}</Link></li>
                    </>:<>
                    <li className="breadcrumb-item"><Link to="/dashboard" role="button">{this.props.t('home')}</Link></li>
                    <li className="breadcrumb-item"><Link to="/masterplanograms" role="button">{this.props.t('master_planogram')}</Link></li>
                    {/* <li className="breadcrumb-item"><Link to="/masterplanograms/selectdept" role="button">{this.props.t('selectdept')}</Link></li> */}
                    <li className="breadcrumb-item"><Link to="/masterplanograms/selectcat" role="button">{this.props.t('category')}</Link></li>
                    <Breadcrumb.Item active>{this.props.t('details')}</Breadcrumb.Item>
                    </>}
                </Breadcrumb>

                <Col>
                    <h3 className="mainheader-txt">
                        <Button variant="light" type="button" className="backpg-link" onClick={this.handleGoBack} style={{textTransform:"uppercase",fontWeight:"600",padding:"2px 5px",marginRight:"5px"}}><ChevronLeftIcon size={22}/></Button>
                        {curcat?(curcat.is_supplier_based?(curcat.supplier_obj.supplier_name):(curcat.category_name+" "+this.props.t("category"))):"Default Category"}
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

                    {this.state.selectedCatgory?<MPDrawing selectedDraw={this.state.selectedDraw} changeTool={this.changeTool} updateDivDetails={this.updateDivDetails} isEnableDraw={this.state.isEnableDraw} activeTool={this.state.activeTool} actype={this.state.activeDrawType} selectedCategory={this.state.selectedCatgory} rectsets={this.state.selectedCatgory?this.state.selectedCatgory.sub_categories:[]} 
                    setRects={this.setRects} cutBoxList={this.state.cutBoxList}
                    updateCutList={this.updateCutList} isRTL={this.props.isRTL} t={this.props.t} />:<></>}
                </Col>

                <Row className="bottomcontent-main">
                    <Col className="bottom-single" xs={12} lg={4}>
                        <Col className='sub-content'>
                            <h3>{this.props.t("cat_rules")}</h3>
                        </Col>
                    </Col>
                    <Col className="bottom-single purple-bg subview">
                        <Col className='sub-content'>
                            <Row>
                                <Col>
                                    <h3>{this.props.t("sub_category")}</h3>
                                    <ul className='newcats-list list-inline'>
                                        {this.state.selectedCatgory && this.state.selectedCatgory.sub_categories?<>
                                            {this.state.selectedCatgory.sub_categories.map((xitem, xidx) => {
                                                let cdrawitm = this.state.selectedDraw;
                                                return <React.Fragment key={xidx}>{!xitem.is_delete?
                                                    <li className={'newcats-item list-inline-item '+
                                                    (cdrawitm?(
                                                        (!cdrawitm.is_supplier_based && !xitem.is_supplier_based && xitem.sub_category_id === cdrawitm.sub_category_id) || 
                                                        (cdrawitm.is_supplier_based && xitem.is_supplier_based && xitem.supplier_obj.supplier_id === cdrawitm.supplier_obj.supplier_id && xitem.sub_category_id === cdrawitm.sub_category_id)?"active":"")
                                                        :xitem.is_supplier_based?"supview":'')}>
                                                        <span className="remove-icon" onClick={()=>this.handleremoveSubCategory(xitem,xidx)}><XIcon size={12} /></span>
                                                        <span className="remove-icon" onClick={()=>this.saveCategoryObj(true,xitem)} style={this.props.isRTL === "rtl"?{marginRight:"28px"}:{marginLeft:"28px"}}><CopyIcon size={12} /></span>
                                                        <div onClick={() => this.handleSelectDraw(xitem)}>
                                                            <Col className="sub-content"></Col>
                                                            <h6 title={(curcat && !curcat.is_supplier_based) && xitem.is_supplier_based?xitem.supplier_obj.supplier_name:xitem.sub_category_name}>
                                                                {(curcat && !curcat.is_supplier_based) && xitem.is_supplier_based?
                                                                (xitem.supplier_obj.supplier_name.substring(0,10)+(xitem.supplier_obj.supplier_name.length>10?"..":""))
                                                                :(xitem.sub_category_name.substring(0,12)+(xitem.sub_category_name.length > 12?"..":""))}
                                                            </h6>    
                                                        </div>
                                                </li>:<></>}</React.Fragment>;
                                            })}
                                        </>:<></>}
                                        <li className='newcats-item list-inline-item'>
                                            <Dropdown drop='up' onToggle={this.handleDropOpen}>
                                                <Dropdown.Toggle variant="default" ref={r => this.additemElement = r}>
                                                    <div>
                                                        <Col className="sub-content add">
                                                            <PlusIcon size={22} />
                                                        </Col>
                                                        <h6>{this.props.t("btnnames.add")}</h6>
                                                    </div>
                                                </Dropdown.Toggle>

                                                <Dropdown.Menu className={"newcat-drop subcat-drop"}>
                                                   <Col style={{padding:"0px 15px"}}>
                                                        <label>{this.props.t("SELECT_CATEGORY")}</label>
                                                        <Form.Control as="select" id="newcat-select" size="sm">
                                                            {this.state.loadedSubCategoryList.map((xitem,xidx) => {
                                                                return <option key={xidx} value={xitem.subCategoryId}>{xitem.subCategoryName}</option>
                                                            })}
                                                        </Form.Control>

                                                        <label>{this.props.t("SELECT_SUPPLIER")}</label>
                                                        <Form.Control as="select" id="newsup-select" size="sm" disabled={(curcat && curcat.is_supplier_based)}>
                                                            {curcat && !curcat.is_supplier_based?<option value="-1">{this.props.t("SELECT_SUPPLIER")}</option>:<></>}
                                                            {this.state.loadedSuppliersList.map((xitem,xidx) => {
                                                                return <option key={xidx} value={xitem.supplier_id}>{xitem.supplier_name}</option>
                                                            })}
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
                                <Col xs={12} lg={6} className="light-purple sub-cat-prg-bars">
                                    <Row>
                                        <Col xs={8} className="title-col"></Col>
                                        <Col xs={2} className="title-col">{this.props.t("NOW")}</Col>
                                        <Col xs={2} className="title-col">{this.props.t("REC")}</Col>
                                    </Row>    
                                    <Row className="scroll-content">
                                    {this.state.loadedSubCatPercentages?<>
                                        {this.state.loadedSubCatPercentages.map((xitem, xidx) => {
                                            let csubnametxt = (xitem.subCategoryName.substring(0,15)+(xitem.subCategoryName.length > 15?"..":""));
                                            let viewcolor = (xitem.subCategoryColor?xitem.subCategoryColor:"#5128a0");
                                            let iscolorlight = checkColorIsLight(viewcolor);
                                            
                                            return <React.Fragment key={xidx}><Col xs={6} style={{padding:"0px"}}>
                                                    <CustomProgressBar text={csubnametxt} mainbarcolor={viewcolor} textcolor={iscolorlight?"#5128a0":"#fff"} mainbarpercentage={xitem.percentage > 0?xitem.percentage:0} showsubbar="true" subbarpercentage={xitem.suggestedSpace} />
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
                                                                        :(zitem.sub_category_name.substring(0,15)+(zitem.sub_category_name.length>15?"..":"")))}    
                                                                    </Dropdown.Item>;
                                                                })}
                                                            </Dropdown.Menu>
                                                        </Dropdown>
                                                        <Dropdown drop='up' alignRight={true} onClick={e => this.redirectList(e, xitem)}>
                                                            <Dropdown.Toggle variant="primary" size='sm' title={this.props.t("open_brand")}>
                                                                <FeatherIcon icon="copy" size={12} />
                                                            </Dropdown.Toggle>

                                                            <Dropdown.Menu className={this.state.percentageDropList && this.state.percentageDropList.length <= 1?"d-none":""}>
                                                                {this.state.percentageDropList.map((zitem, zidx) => {
                                                                    return <Dropdown.Item key={zidx} href="#" onClick={() => this.saveCategoryObj(true,zitem) } className={zitem.is_supplier_based?'sup-based':''}>
                                                                        {(zitem.is_supplier_based?(zitem.supplier_obj.supplier_name.substring(0,15)+(zitem.supplier_obj.supplier_name.length>15?"..":""))
                                                                        :(zitem.sub_category_name.substring(0,15)+(zitem.sub_category_name.length>15?"..":"")))}    
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
                    <ul className='list-inline' style={{paddingRight:"0px"}}>
                        <li className='list-inline-item'>
                            <Button variant="secondary" onClick={this.handleGoBack}>{this.props.t("btnnames.back")}</Button>
                        </li>
                        {/* <li className='list-inline-item float-right' style={{marginLeft:"10px"}}>
                            <Button variant="primary">Activate</Button>
                        </li> */}
                        <li className={'list-inline-item '+(this.props.isRTL === "rtl"?'float-left':'float-right')}>
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
    setNewProdCountCat: (payload) => dispatch(setNewProdCountCatAction(payload)),
    setNewProdCountSubCat: (payload) => dispatch(setNewProdCountSubCatAction(payload))
});

export default withTranslation()(withRouter(connect(null,mapDispatchToProps)(MasterPlanogramView)));