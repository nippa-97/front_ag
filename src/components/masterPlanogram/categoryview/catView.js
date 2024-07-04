import React, { Component } from 'react';
import { Col, Breadcrumb, Button, ButtonGroup, Row, Dropdown } from 'react-bootstrap';
import { withTranslation } from 'react-i18next';
import { withRouter, Link } from 'react-router-dom';
import { ChevronLeftIcon, PlusIcon, XIcon } from '@primer/octicons-react';
import { connect } from 'react-redux';
import { v4 as uuidv4 } from 'uuid'; //unique id
import FeatherIcon from 'feather-icons-react';

import { selectedMasterPlanSetAction, selectedMPCategorySetAction, setNewProdCountCatAction, setNewProdCountSubCatAction } from '../../../actions/masterPlanogram/masterplanogram_action';

import { alertService } from '../../../_services/alert.service';
import { submitCollection } from '../../../_services/submit.service';
import { submitSets } from '../../UiComponents/SubmitSets';
import { AcViewModal } from '../../UiComponents/AcImports';

import CatDrawing from './CatDrawing/CatDrawing';
import MPselectcategory from './MPselectCategory/MPselectcategory';
import MPsimulateAllCategory from './MPsimulateAllCategory/MPsimulateAllCategory';

//import { samplecatarr } from '../SampleData';

import './catview.css';
import { CalculateRatio, measureConverter, roundOffDecimal } from '../../../_services/common.service';
import { convertWidthPercent, findHeightFromShelves, saveObjDataConvert } from '../AddMethods';
import { confirmAlert } from 'react-confirm-alert';
import CustomProgressBar from '../../common_layouts/customProgressBar';

export class MPCategoryView extends Component {
    constructor(props){
        super(props);

        this._isMounted = false;
        
        this.state = {
            defSaveObj: null, isUpdatesAvailable: false,
            isaddcatmodal: false, loadedSuppliersList: [], showcatiteminmodal: null,
            loadDunitList:[], 
            loadedCategoryList: [], loadedCatPercentages: [],
            loadedTagsList: [],
            isallsimulatemodal:false,
            openOneCategory:false,

            fieldStartIdx: 0, fieldMaxResults: 12, fieldTotalCount: 0,
            singleFieldWidth: 350, singleFieldHeight: 300, minWidthCheckValue: 200, oldCatLength: 0,
            haveChnagesinCat:false, isShowLoadingModal: false,
            percentageDropList: [],
            isNotFisrtimeSimulation:false,
        }
    }

    componentDidMount() {
        this._isMounted = true;

        if (this._isMounted) {
            //console.log(this.props.mpstate);
            //md load
            this.getDunits();
            this.getAllSuppliers();
            this.getAllTags();

            if(this.props.mpstate && this.props.mpstate.mpDetails){
                //console.log(this.props.mpstate.mpDetails);
                this.setState({ defSaveObj: this.props.mpstate.mpDetails, isShowLoadingModal: true },()=>{
                    //let csobj = this.state.defSaveObj;
                    this.getcategoriescall();
                });
            }  
              
        }
    }

    componentWillUnmount(){
        this._isMounted = false;
    }
    // get categories for department call
    getcategoriescall=()=>{
        var cdefSaveObj=this.state.defSaveObj
        var ccategories=[]
        //call for back and set reponse of back call to ccategories
        var extra=this.props.mpstate.mpDetails.categories
        if(extra.length>0){
            ccategories = extra;
        }
        cdefSaveObj.categories = ccategories;

        this.setState({defSaveObj:cdefSaveObj, oldCatLength: cdefSaveObj.categories.length},()=>{
            this.getAllCategories(cdefSaveObj.department.department_id);
            this.getCategoryPercentages(cdefSaveObj.department.department_id);
            // console.log(this.state.defSaveObj);
        })
    }
    //load all suppliers
    getAllSuppliers = () => {
        var csobj={
            isSupplierSpecific: false,
            categoryId: 0,
        }
        submitSets(submitCollection.mpSupplierList, csobj).then(res => {
            //console.log(res);
           
            if(res && res.status && res.extra){
                this.setState({
                    loadedSuppliersList: res.extra,
                });
            }
        });

        //this.setState({ loadedSuppliersList: samplesupparr, });
    }
    //load all tags
    getAllTags = () => {
        let sobj = {isReqPagination: false, type:"", tagName: ""}
        submitSets(submitCollection.searchTags, sobj).then(res => {
            //console.log(res.extra);

            if(res && res.status && res.extra){
                if(this._isMounted){
                    this.setState({ loadedTagsList: res.extra });
                }
            }
        });
    }
    //load all categories of selected department
    getAllCategories = (deptid) => {
        console.log("yap 1");
        let svobj = { chainHasDepartmentId: deptid };
        submitSets(submitCollection.mpCategoryList, svobj).then(res => {
            //console.log(res);

            if(res && res.status && res.extra){
                this.setState({ loadedCategoryList: res.extra });
            }
        });

        /* this.setState({ loadedCategoryList: samplecatarr }, () => {
            this.loadMPDetails();
        }); */
    }
    //load all category percentages of selected department
    getCategoryPercentages = (deptid) => {
        let svobj = { chainHasDepartmentId: deptid };
        submitSets(submitCollection.mpCategoryPercentage, svobj).then(res => {
            //console.log(res);

            if(res && res.status && res.extra){
                this.setState({ loadedCatPercentages: res.extra }, () => {
                    this.loadMPDetails();
                    this.getNewProdCountOfCatLevel(svobj);
                });
            } else{
                this.loadMPDetails();
                this.getNewProdCountOfCatLevel(svobj);
            }
        });
    }

    getNewProdCountOfCatLevel = (svobj) => {

        submitSets(submitCollection.mpCategoryNewProdCount, svobj, false, null, true).then(res => {

                    if(res && res.status && res.extra){
                        this.props.setNewProdCountCat(res.extra);
                    }else{
                        // alertService.error((res.error && res.error && res.error.errorMessage)?res.error.errorMessage:this.props.t("ERROR_OCCURRED"));
                        this.props.setNewProdCountCat(null);
                    }
                });

    } 

    //caterory list compare with added category list
    compareCategoryData = (loadeddata, isonload) => {
        let saveobj = this.state.defSaveObj;
        let oldfieldwidth = (this.state.singleFieldWidth * this.state.oldCatLength)

        let notdeletedcatlist = saveobj.categories.filter(x => !x.is_delete);
        let totalfieldwidth = (this.state.singleFieldWidth * notdeletedcatlist.length);
        
        let olditemper = roundOffDecimal(convertWidthPercent(this.state.singleFieldWidth,oldfieldwidth),2);
        let singleitemper = roundOffDecimal(convertWidthPercent(this.state.singleFieldWidth,totalfieldwidth),2);
        
        //calculate category box percentage
        for (let j = 0; j < saveobj.categories.length; j++) {
            const catitem = saveobj.categories[j];
            if(!catitem.is_delete){
                if(totalfieldwidth !== this.state.singleFieldWidth && catitem.box_width_percentage !== 0 && catitem.box_width_percentage !== olditemper && catitem.box_width_percentage !== singleitemper){
                    //if width avalilable - refind percentage from earlier width
                    if(oldfieldwidth > 0 && catitem.box_width_percentage > 0){
                        let findoldwidth = roundOffDecimal(convertWidthPercent(catitem.box_width_percentage,oldfieldwidth,true),2);
                        
                        let refindper = roundOffDecimal(convertWidthPercent(findoldwidth,totalfieldwidth),2);
                        catitem["box_width_percentage"] = refindper;
                    }
                    
                    catitem["width"] = roundOffDecimal(convertWidthPercent(catitem.box_width_percentage,totalfieldwidth,true),2);
                } else{
                    catitem["box_width_percentage"] = singleitemper;
                    catitem["width"] = this.state.singleFieldWidth;
                }
            }
        }
        
        for (let i = 0; i < loadeddata.length; i++) {
            const categoryitem = loadeddata[i];
            
            let catfinditems = saveobj.categories.filter(x => x.category_id === categoryitem.categoryId && !x.is_delete); // && !x.is_supplier_based
            
            if(catfinditems && catfinditems.length > 0){
                let pertotal = 0;
                for (let i = 0; i < catfinditems.length; i++) {
                    pertotal = (pertotal + catfinditems[i].box_width_percentage);
                }
                //console.log(catfinditems);
                if(pertotal > 0){
                    categoryitem["percentage"] = roundOffDecimal(pertotal,2);
                }
            } else{
                categoryitem["percentage"] = 0;
            }
        }

        this.setState({ loadedCatPercentages: loadeddata, defSaveObj: saveobj, oldCatLength: notdeletedcatlist.length, 
            isUpdatesAvailable: !isonload}, () => {
            this.redrawfieldsToRatio();
        });
    }
    //redraw fields to ratio
    redrawfieldsToRatio=()=>{
        var cdefSaveObj = JSON.parse(JSON.stringify(this.state.defSaveObj));
        var ccatgories=cdefSaveObj.categories;

        var fielddrawboxheight = this.state.singleFieldHeight;

        //check min field width - get min width
        let minwidthitem = null;
        for (let m = 0; m < ccatgories.length; m++) {
            const checkcatitem = ccatgories[m];
            if(!minwidthitem || checkcatitem.width < minwidthitem.width){
                minwidthitem = checkcatitem;
            }
        }

        let notdeletedcatlist = cdefSaveObj.categories.filter(x => !x.is_delete);
        let oldtotalfieldwidth = (this.state.singleFieldWidth * notdeletedcatlist.length);
        let singleitemper = roundOffDecimal(convertWidthPercent(this.state.singleFieldWidth,oldtotalfieldwidth),2);

        var fielddrawboxwidth = this.state.singleFieldWidth;
        //if min width item is less than chceck width re adjuest whole widths
        if(minwidthitem && minwidthitem.width < this.state.minWidthCheckValue){
            let getminoneper = roundOffDecimal((this.state.minWidthCheckValue / minwidthitem.box_width_percentage),2);
            let gethunperwidth = roundOffDecimal((getminoneper * singleitemper),2);
            //console.log(getminoneper,gethunperwidth);

            fielddrawboxwidth = gethunperwidth;
        }

        
        let totalfieldwidth = (fielddrawboxwidth * notdeletedcatlist.length);

        var currentusinguom="meters";
        var drawingRatio=0;
        var maxHight={height:0,uom:null}
        //find heighest field
        ccatgories.forEach(cat => {
            var heightinmeters=measureConverter(cat.field_obj.field_uom, currentusinguom, cat.field_obj.field_height)
            var mheight=measureConverter(maxHight.uom,currentusinguom,maxHight.height)
            // console.log(heightinmeters+">"+mheight);
            if(heightinmeters>mheight){
                maxHight={height:cat.field_obj.field_height,uom:cat.field_obj.field_uom}    
            }
        });
        //console.log(ccatgories);
        //calculate uom
        drawingRatio=CalculateRatio(measureConverter(maxHight.uom,currentusinguom,maxHight.height),fielddrawboxheight)
        //loop and set field draw height width
        for (let i = 0; i < ccatgories.length; i++) {
            const ccat = ccatgories[i];
            ccat.field_obj["drawHeight"] = measureConverter(ccat.field_obj.field_uom,currentusinguom,ccat.field_obj.field_height)*drawingRatio
            ccat.field_obj["drawWidth"] = convertWidthPercent(ccat.box_width_percentage,totalfieldwidth,true);
            
            // loop shelves and set draw
            let prevGap = 0;
            ccat.field_obj.field_shelves.forEach(shelve => {
                let drawHeight = measureConverter(shelve.uom,currentusinguom,shelve.height)*drawingRatio
                let drawGap=measureConverter(shelve.uom,currentusinguom,shelve.gap)*drawingRatio
                //pick x, y
                shelve.x = 0;
                shelve.y = prevGap;
                shelve["drawHeight"]=drawHeight
                shelve["drawWidth"]=ccat.field_obj.drawWidth;
                shelve["drawGap"]=drawGap
                prevGap = prevGap + (drawHeight + drawGap);
            });
            
            //check subcategories if available and fix draw values
            if(ccat.sub_categories.length>0){
                ccat.sub_categories.forEach(subcat => {
                    subcat.rects.forEach(subrect => {
                        //subcategories rects set draw values
                        let getyheightfromcontains = findHeightFromShelves(subrect.contain_shelves,ccat.field_obj);
                        //console.log(getyheightfromcontains);
                        subrect["drawHeight"]=measureConverter(ccat.field_obj.field_uom,currentusinguom,getyheightfromcontains.height)*drawingRatio;
                        subrect["drawY"]=measureConverter(ccat.field_obj.field_uom,currentusinguom,getyheightfromcontains.y)*drawingRatio;

                        subrect["drawX"]=convertWidthPercent(subrect.x,ccat.field_obj.drawWidth,true);
                        subrect["drawWidth"]=convertWidthPercent(subrect.box_width_percentage,ccat.field_obj.drawWidth,true);

                        //check if brands is there then add draw values
                        if(subrect.brands.length > 0){
                            subrect.brands.forEach(brnd => {
                                let getyheightfromcontains2 = findHeightFromShelves(brnd.contain_shelves,ccat.field_obj);
                                //console.log(brnd);
                                brnd["drawHeight"]=measureConverter(ccat.field_obj.field_uom,currentusinguom,getyheightfromcontains2.height)*drawingRatio;
                                brnd["drawY"]=measureConverter(ccat.field_obj.field_uom,currentusinguom,getyheightfromcontains2.y)*drawingRatio;
                                
                                let getbrandxwidth = convertWidthPercent(brnd.x,subrect.drawWidth,true);
                                brnd["drawX"]= (subrect.drawX + getbrandxwidth);
                                brnd["drawWidth"]=convertWidthPercent(brnd.box_width_percentage,subrect.drawWidth,true);
                            });
                        }
                    });
                });
            }
        }
        //console.log(ccatgories);
        //setting copy obj to original
        cdefSaveObj.categories = ccatgories;
        this.setState({defSaveObj:null},()=>{
            this.setState({defSaveObj:cdefSaveObj});
        })
    }
    //get all Dunits
    getDunits = () => {
        var csobj = { isReqPagination: true, startIndex: this.state.fieldStartIdx, maxResult: this.state.fieldMaxResults };
        submitSets(submitCollection.mpFieldList, csobj).then(res => {
            //console.log(res.extra);

            if (res && res.status) {
                var list = this.state.loadDunitList.concat(res.extra);
                list.forEach(ele => { ele["isSelected"] = false });

                this.setState({ 
                    loadDunitList: list, 
                    fieldTotalCount: (this.state.fieldStartIdx === 0?res.count:this.state.fieldTotalCount),
                });
            }
        });

        /* var list = sampledisplayunits;
        list.forEach(ele => { ele["isSelected"] = false });

        this.setState({ loadDunitList: list }); */
    }

    loadMoreDunits = () => {
        this.setState({ fieldStartIdx: (this.state.fieldStartIdx + this.state.fieldMaxResults) }, () => {
            this.getDunits();
        });
    }

    toggleCategoryModal = (isshowcat) => {
        this.setState({ isaddcatmodal: !this.state.isaddcatmodal, showcatiteminmodal: (isshowcat?this.state.showcatiteminmodal:null) });
    }

    toggleSimulateAllModal = () => {
        if(this.state.isallsimulatemodal){
            //close model
            confirmAlert({
                title: this.props.t('CLOSE_SIMULATION'),
                message: "",
                overlayClassName: (this.props.isRTL === "rtl" ? "alertrtl-content" : ""),
                buttons: [{
                    label: this.props.t('btnnames.yes'),
                    onClick: () => {
                        this.setState({ isallsimulatemodal: !this.state.isallsimulatemodal,openOneCategory:false });
                    }
                }, {
                    label: this.props.t('btnnames.no'),
                    onClick: () => {
                        return false;
                    }
                }]
            });
        }else{
            //open model
           
            this.setState({ isallsimulatemodal: !this.state.isallsimulatemodal,openOneCategory:false });
        }
       
    }

    SimulateCallSend=()=>{

    }

    redirectToCategory = (catitem) => {
        this.props.setMPCategoryAction(catitem);
        this.props.setMasterPlanAction(this.state.defSaveObj);
        this.props.history.push("/masterplanograms/details");
    }

    handleGoBack = () => {
        this.props.history.push("/masterplanograms");
    }

    //selecting field
    handleSelectfield=(field)=>{
        var list=this.state.loadDunitList
        for (let i = 0; i < list.length; i++) {
            const ele = list[i];
         if(field && ele.fieldId === field.fieldId){
            ele.isSelected=true
         } else{
            ele.isSelected=false
         }  
        }
        this.setState({loadDunitList:list})
    }

    //category add btn click
    handleAddCateory=(selectedCategory,selectedSupplier)=>{
        //console.log(selectedCategory);
        let selectedfield = this.state.loadDunitList.find(x => x.isSelected);

        if(selectedCategory && selectedCategory.categoryId){

            let cdefsaveobj = this.state.defSaveObj;
            let findalreadyadded = cdefsaveobj.categories.find(xitem => 
                !xitem.is_delete &&
                ((!selectedSupplier && !xitem.is_supplier_based && xitem.category_id === selectedCategory.categoryId) ||
                (selectedSupplier && xitem.is_supplier_based && xitem.supplier_obj.supplier_id === selectedSupplier.supplier_id && xitem.category_id === selectedCategory.categoryId))
            );
            //console.log(findalreadyadded);
            if(!findalreadyadded){
                if(selectedfield){
                    this.handleAddNewCat(selectedCategory,selectedSupplier)
                } else{
                    alertService.error(this.props.t("selectfield"));
                }
            } else{
                alertService.error(this.props.t("catalreadyadded"));
            }
        } else{
            alertService.error(this.props.t("SELECT_CATEGORY"));
        }
    }

    handleAddNewCat = (selcat,selsup) => {
        let cdefsaveobj = this.state.defSaveObj;

        let selectedfield = this.state.loadDunitList.find(x => x.isSelected);
        //console.log(selectedfield);

        let newshelvelist = selectedfield.fieldShelves.map((xitem, xidx) => {
            return { id: -1, shelve_id: xitem.shelfId, gap: xitem.gap,
                height: xitem.height, rank: xitem.rank,
                reverseRowNumber: xitem.reverseRowNumber, uom: xitem.uom, width: xitem.width, x: xitem.x, y: xitem.y,
                is_new: true, is_delete: false
            };
        });

        let newfieldobj = {
            id: -1,
            field_id: selectedfield.fieldId,
            field_width: selectedfield.width,
            field_height: selectedfield.height,
            field_depth: selectedfield.depth,
            field_uom: selectedfield.uom,
            field_shelves: newshelvelist,
            is_new: true, is_delete: false
        };

        let issupplier = (selsup?true:false);
        let suppobj = (selsup?{id: -1, supplier_id: selsup.supplier_id, supplier_name: selsup.supplier_name}:null);

        let notdeletedcatlist = cdefsaveobj.categories.filter(x => !x.is_delete);
        let catnewobj = { id: uuidv4(), category_id: selcat.categoryId, category_name: selcat.categoryName, 
            is_supplier_based: issupplier, supplier_obj: suppobj, 
            is_new: true, is_delete: false, 
            field_obj: newfieldobj,
            sub_categories: [], rank: (notdeletedcatlist.length + 1),
            box_width_percentage: 0,
            // sub_categories:subcat
        };

        cdefsaveobj.categories.push(catnewobj);
        //console.log(catnewobj);

        this.setState({ defSaveObj: cdefsaveobj }, () => {
            //console.log(cdefsaveobj);
            this.toggleCategoryModal();
            this.compareCategoryData(this.state.loadedCatPercentages);
        });
    }
    //toggle onecategory open: 
    toggleOneCategory=()=>{
        this.setState({openOneCategory:!this.state.openOneCategory})
    }
    //remove category 
    handleremoveCategory=(item, idx)=>{
        var cdefSaveObj=this.state.defSaveObj
        var ccategoryitem = cdefSaveObj.categories[idx];
        
        if(!ccategoryitem.is_new){
            ccategoryitem["is_delete"] = true;
        } else{
            cdefSaveObj.categories.splice(idx,1);
        }

        this.setState({defSaveObj:cdefSaveObj},()=>{
            this.compareCategoryData(this.state.loadedCatPercentages);
        })
    }
    //update categories from child
    updateFromChild = (rects) => {
        let saveobj = this.state.defSaveObj;
        saveobj.categories = rects;
        
        this.setState({ defSaveObj: null }, () => {
            this.setState({ defSaveObj: saveobj });
        });
    }
     // change haveChnagesinCat
     handlehaveChnagesinCat=(val)=>{
        this.setState({haveChnagesinCat:val})
    }

    changeCatProps = (cidx, ctype, cgap) => {
        //console.log(cidx, ctype, cgap);
        let csaveobj = JSON.parse(JSON.stringify(this.state.defSaveObj));
        let ccatitem = csaveobj.categories[cidx];

        //find next/prev items
        let nextcatidx = null; let prevcatidx = null;
        csaveobj.categories.forEach((xitem, xidx) => {
            if(!nextcatidx && !xitem.is_delete && xidx > cidx){
                nextcatidx = xidx;
            }

            if(!xitem.is_delete && xidx < cidx){
                prevcatidx = xidx;
            }
        });
        let nextcat = (nextcatidx?csaveobj.categories[nextcatidx]:null);
        let prevcat = (prevcatidx?csaveobj.categories[prevcatidx]:null);
        //console.log(nextcatidx,prevcatidx);

        let notdeletedcatlist = csaveobj.categories.filter(x => !x.is_delete);
        let totalfieldwidth = (this.state.singleFieldWidth * notdeletedcatlist.length);
        
        if(ctype === "width"){
            if(cgap !== 0){
                let curcwidth = (ccatitem.width + cgap);
                
                let curcper = convertWidthPercent(curcwidth,totalfieldwidth);
                
                ccatitem["width"] = curcwidth;
                ccatitem["box_width_percentage"] = curcper;
                
                //update right field if available
                if(nextcat){
                    let newcwidth = (nextcat.width - cgap);
                    let newcper = convertWidthPercent(newcwidth,totalfieldwidth);

                    nextcat["width"] = newcwidth;
                    nextcat["box_width_percentage"] = newcper;
                } 
                else if(!nextcat && prevcat){
                    let newcwidth = (prevcat.width - cgap);
                    let newcper = convertWidthPercent(newcwidth,totalfieldwidth);

                    prevcat["width"] = newcwidth;
                    prevcat["box_width_percentage"] = newcper;
                }
                //disable 
                if(ccatitem.box_width_percentage < 1){
                    return false;
                }
            }
        } else if(ctype === "percentage"){
            
        }

        let totalwidthper = 0;
        for (let i = 0; i < csaveobj.categories.length; i++) {
            const catitem = csaveobj.categories[i];
            if(!catitem.is_delete){
                totalwidthper = totalwidthper + catitem.box_width_percentage;
            }
        }
        
        //if total width of cats more or less than 100 reduce width from current cat
        let roundtotalwidth = roundOffDecimal(totalwidthper,2);
        if(roundtotalwidth > 100){
            let getmorehunvalue = roundOffDecimal((roundtotalwidth - 100),2);
            let morehunwidth = convertWidthPercent(getmorehunvalue,totalfieldwidth,true);
            
            ccatitem["width"] = (ccatitem.width - morehunwidth);
            ccatitem["box_width_percentage"] = (ccatitem.box_width_percentage - getmorehunvalue);
        } else if(roundtotalwidth < 100){
            let getmorehunvalue = roundOffDecimal((100 - roundtotalwidth),2);
            let morehunwidth = convertWidthPercent(getmorehunvalue,totalfieldwidth,true);
            
            ccatitem["width"] = (ccatitem.width + morehunwidth);
            ccatitem["box_width_percentage"] = (ccatitem.box_width_percentage + getmorehunvalue);
        }
        
        this.setState({ defSaveObj: csaveobj }, () => {
            this.compareCategoryData(this.state.loadedCatPercentages);
        });
    }
    //convert & save category objects
    saveCategoryObj = (isredirect, catobj) => {
        let exportsave = JSON.parse(JSON.stringify(this.state.defSaveObj));
        
        if(exportsave.categories && exportsave.categories.length > 0){
            //only save if changes available
            if(this.state.isUpdatesAvailable){
                let notdeletedcatlist = exportsave.categories.filter(x => !x.is_delete);
                let totalfieldwidth = (this.state.singleFieldWidth * notdeletedcatlist.length);
                //new category save obj
                let newsaveobj = {mpId: exportsave.mp_id, chainHasDepartmentId: exportsave.department.department_id, categories: [] };

                let newrank = 1;
                for (let i = 0; i < exportsave.categories.length; i++) {
                    const exportcat = exportsave.categories[i];
                    let returncatobj = saveObjDataConvert(exportcat,false,totalfieldwidth);
                    
                    let newcatobj = {
                        mpHasCategoryId: returncatobj.id,
                        selectedCategoryId: returncatobj.category_id,
                        selectedFieldId: returncatobj.field_obj.field_id,
                        supplierId: (returncatobj.is_supplier_based?returncatobj.supplier_obj.supplier_id:-1),
                        rank: newrank,
                        box_width_percentage: returncatobj.box_width_percentage,
                        isNew: returncatobj.is_new,
                        isDelete: returncatobj.is_delete,
                    };

                    newsaveobj.categories.push(newcatobj);

                    if(!returncatobj.is_delete){
                        newrank = (newrank + 1);
                    }
                }
                
                //save
                this.setState({ isShowLoadingModal: true}, () => {
                    submitSets(submitCollection.saveNewCategories, newsaveobj, false, null, true).then(res => {
                        //console.log(res.extra);
        
                        if (res && res.status) {
                            alertService.success(this.props.t("catsavedsuccess"));
                            this.loadMPDetails(isredirect, catobj);
                        } else{
                            // alertService.error((res.error && res.error && res.error.errorMessage)?res.error.errorMessage:this.props.t("ERROR_OCCURRED"));
                            this.setState({ isShowLoadingModal: false });
                        }
                    });
                });
            } else{
                if(catobj!==undefined){
                    this.redirectToCategory(catobj);
                }
            }
        } else{
            alertService.error(this.props.t("addcatsfirst"));
        }
    }
    //load mp details
    loadMPDetails = (isredirect, catobj) => {
        let svobj = { chainHasDepartmentId:this.state.defSaveObj.department.department_id };
        //let svobj = { chainHasDepartmentId:7 };
            
        this.setState({ isShowLoadingModal: true }, () => {
            submitSets(submitCollection.loadMp, svobj, false).then(res => {
                //console.log(res);
                if(res && res.status){
                    let newsaveobj = ((res.extra && Object.keys(res.extra).length > 0)?res.extra:this.state.defSaveObj);
                    
                    this.setState({
                        isShowLoadingModal: false, defSaveObj: newsaveobj, oldCatLength: 0,isNotFisrtimeSimulation:true
                    }, () => {
                        if(isredirect){
                            //find new category object
                            let foundcatobj = newsaveobj.categories.find(x => 
                                (!catobj.is_supplier_based && !x.is_supplier_based && x.category_id === catobj.category_id) ||
                                (catobj.is_supplier_based && x.is_supplier_based && x.category_id === catobj.category_id && x.supplier_obj.supplier_id === catobj.supplier_obj.supplier_id)
                            );
                            
                            if(foundcatobj){
                                this.redirectToCategory(foundcatobj);
                            } else{
                                alertService.error(this.props.t("catnotfound")); 
                            }
                        } else{
                            this.compareCategoryData(this.state.loadedCatPercentages, true);
                        }
                    });    
                } else{
                    alertService.error(this.props.t("ERROR_OCCURRED"));
                    this.setState({ isShowLoadingModal: false });
                }
            });    
        });
    }
    //redirect view list
    redirectList = (isopen, viewitem) => {
        if(isopen){
            let defSaveObj = this.state.defSaveObj;
            let filteritems = defSaveObj.categories.filter(x => !x.is_delete && x.category_id === viewitem.categoryId );
            
            //console.log(filteritems);
            if(filteritems.length === 1){
                this.saveCategoryObj(true,filteritems[0]);

            } else if(filteritems.length === 0){
                this.setState({ showcatiteminmodal: viewitem }, () => {
                    alertService.error(this.props.t("addcatfirst"));
                    this.toggleCategoryModal(true);
                });
            }

            this.setState({ percentageDropList: filteritems });
        }
    }
    handleIsSimulateFirsttime=()=>{
        this.setState({isNotFisrtimeSimulation:false})
    }

    render() {
        return (<>
            <Col xs={12} className={"main-content mpview-main "+(this.props.isRTL==="rtl"?"RTL":"")} dir={this.props.isRTL}>
                <Breadcrumb dir="ltr">
                    {this.props.isRTL==="rtl"?<>
                    <Breadcrumb.Item active>{this.props.t('details')}</Breadcrumb.Item>
                    {/* <li className="breadcrumb-item"><Link to="/masterplanograms/selectdept" role="button">{this.props.t('selectdept')}</Link></li> */}
                    <li className="breadcrumb-item"><Link to="/masterplanograms" role="button">{this.props.t('master_planogram')}</Link></li>
                    <li className="breadcrumb-item"><Link to="/dashboard" role="button">{this.props.t('home')}</Link></li>
                    </>:<>
                    <li className="breadcrumb-item"><Link to="/dashboard" role="button">{this.props.t('home')}</Link></li>
                    <li className="breadcrumb-item"><Link to="/masterplanograms" role="button">{this.props.t('master_planogram')}</Link></li>
                    {/* <li className="breadcrumb-item"><Link to="/masterplanograms/selectdept" role="button">{this.props.t('selectdept')}</Link></li> */}
                    <Breadcrumb.Item active>{this.props.t('details')}</Breadcrumb.Item>
                    </>}
                </Breadcrumb>

                <Col>
                    <h3 className="mainheader-txt">
                        <Button variant="light" type="button" className="backpg-link" onClick={this.handleGoBack} style={{textTransform:"uppercase",fontWeight:"600",padding:"2px 5px",marginRight:"5px"}}><ChevronLeftIcon size={22}/></Button>
                        {this.state.defSaveObj && this.state.defSaveObj.department?(this.state.defSaveObj.department.department_name+" "+(this.props.t("department"))):"Default Department"}

                        <ul className="topbtn-list list-inline float-right">
                            <li className="list-inline-item">
                                <Button variant="warning" size="sm" onClick={()=>this.toggleSimulateAllModal()} style={{textTransform:"uppercase"}}>{this.props.t("Simulate")}</Button>
                            </li>
                        </ul>
                    </h3>
                </Col>
                
                {this.state.defSaveObj?<Col className='MPDrawing'><CatDrawing rectsets={this.state.defSaveObj?this.state.defSaveObj.categories:[]} changeCatProps={this.changeCatProps} updateFromChild={this.updateFromChild} toggleAddCategory={this.toggleAddCategory} redirectToCategory={this.saveCategoryObj} /></Col>:<></>}

                <Row className="bottomcontent-main">
                    <Col className="bottom-single" xs={12} lg={4}>
                        <Col className='sub-content'>
                            <h3>{this.props.t("dept_rules")}</h3>
                        </Col>
                    </Col>
                    <Col className="bottom-single purple-bg">
                        <Col className='sub-content'>
                            <Row>
                                <Col>
                                    <h3>{this.props.t("all_categories")}</h3>
                                    
                                    <ul className='newcats-list list-inline'>
                                        {this.state.defSaveObj && this.state.defSaveObj.categories?<>
                                            {this.state.defSaveObj.categories.map((xitem, xidx) => {
                                                return <React.Fragment key={xidx}>{!xitem.is_delete?<li className='newcats-item list-inline-item'>
                                                    <span className="remove-icon" onClick={()=>this.handleremoveCategory(xitem, xidx)}><XIcon size={12} /></span>
                                                    <Col onClick={() => this.saveCategoryObj(true,xitem) } className="sub-content" style={{borderColor: (xitem.is_supplier_based?"lightcoral":"orange")}}></Col>
                                                    <h6 onClick={() => this.saveCategoryObj(true,xitem) }>
                                                        {(xitem.is_supplier_based?(xitem.supplier_obj.supplier_name.substring(0,10)+(xitem.supplier_obj.supplier_name.length>10?"..":""))
                                                    :(xitem.category_name.substring(0,10)+(xitem.category_name.length>10?"..":"")))}</h6>
                                                </li>:<></>}</React.Fragment>;
                                            })}
                                        </>:<></>}
                                        <li className='newcats-item list-inline-item' onClick={this.toggleCategoryModal}>
                                            <Col className="sub-content add">
                                                <PlusIcon size={22} />
                                            </Col>
                                            <h6>{this.props.t("btnnames.add")}</h6>
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
                                    {this.state.loadedCatPercentages?<>
                                        {this.state.loadedCatPercentages.map((xitem, xidx) => {
                                            let csubnametxt = (xitem.categoryName.substring(0,15)+(xitem.categoryName.length > 15?"..":""));

                                            return <React.Fragment key={xidx}><Col xs={7} style={{padding:"0px"}}>
                                                    <CustomProgressBar text={csubnametxt} mainbarcolor={"rgb(237, 50, 122)"} mainbarpercentage={xitem.percentage} textcolor={"white"} showsubbar="true" subbarpercentage={xitem.suggestedSpace} />
                                                </Col>
                                                <Col xs={1} className="val-col links">
                                                    <ButtonGroup>
                                                        <Dropdown drop='up' alignRight={true} onToggle={e => this.redirectList(e, xitem)}>
                                                            <Dropdown.Toggle variant="primary" size='sm' title={this.props.t("open_subcategory")}>
                                                                <FeatherIcon icon="copy" size={12} />
                                                            </Dropdown.Toggle>

                                                            <Dropdown.Menu className={this.state.percentageDropList && this.state.percentageDropList.length <= 1?"d-none":""}>
                                                                {this.state.percentageDropList.map((zitem, zidx) => {
                                                                    return <Dropdown.Item key={zidx} href="#" onClick={() => this.saveCategoryObj(true,zitem) } className={zitem.is_supplier_based?'sup-based':''}>
                                                                        {(zitem.is_supplier_based?(zitem.supplier_obj.supplier_name.substring(0,15)+(zitem.supplier_obj.supplier_name.length>15?"..":""))
                                                                        :(zitem.category_name.substring(0,15)+(zitem.category_name.length>15?"..":"")))}    
                                                                    </Dropdown.Item>;
                                                                })}
                                                            </Dropdown.Menu>
                                                        </Dropdown>
                                                    </ButtonGroup>
                                                </Col>
                                                <Col xs={2} className="val-col">{xitem.percentage?xitem.percentage:0}%</Col>
                                                <Col xs={2} className="val-col light">{xitem.suggestedSpace?xitem.suggestedSpace:0}%</Col>
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
                        <li className={'list-inline-item '+(this.props.isRTL==="rtl"?"float-left":"float-right")}>
                            <Button variant="success" disabled={!this.state.isUpdatesAvailable} onClick={() => this.saveCategoryObj(false)}>{this.props.t("btnnames.save")}</Button>
                        </li>
                    </ul>
                </Col>
            </Col>

            {this.state.isaddcatmodal?
            <MPselectcategory loadDunitList={this.state.loadDunitList} loadedSuppliersList={this.state.loadedSuppliersList} loadedCategoryList={this.state.loadedCategoryList} isaddcatmodal={this.state.isaddcatmodal} isRTL={this.props.isRTL} 
            showcatiteminmodal={this.state.showcatiteminmodal} fieldTotalCount={this.state.fieldTotalCount} loadMoreDunits={this.loadMoreDunits} toggleCategoryModal={this.toggleCategoryModal} toggleAddCategory={this.toggleAddCategory} handleSelectfield={this.handleSelectfield} handleAddCateory={this.handleAddCateory} />
            :<></>}
            {this.state.isallsimulatemodal?
            <MPsimulateAllCategory 
                isSalesCycle={false} 
                SimulateCallSend={this.SimulateCallSend} 
                isNotFisrtimeSimulation={this.state.isNotFisrtimeSimulation} 
                handleIsSimulateFirsttime={this.handleIsSimulateFirsttime} 
                defSaveObj={this.state.defSaveObj} 
                mpstate={this.props.mpstate} 
                isallsimulatemodal={this.state.isallsimulatemodal} 
                isRTL={this.props.isRTL} 
                toggleSimulateAllModal={this.toggleSimulateAllModal} 
                loadedTagsList={this.state.loadedTagsList} 
                openOneCategory={this.state.openOneCategory} 
                haveChnagesinCat={this.state.haveChnagesinCat} 
                toggleOneCategory={this.toggleOneCategory} 
                handlehaveChnagesinCat={this.handlehaveChnagesinCat} 
                />
            :<></>}
        
            <AcViewModal showmodal={this.state.isShowLoadingModal} />
        </>);
    }
}

const mapDispatchToProps = dispatch => ({
    setMasterPlanAction: (payload) => dispatch(selectedMasterPlanSetAction(payload)),
    setMPCategoryAction: (payload) => dispatch(selectedMPCategorySetAction(payload)),
    setNewProdCountCat: (payload) => dispatch(setNewProdCountCatAction(payload)),
    setNewProdCountSubCat: (payload) => dispatch(setNewProdCountSubCatAction(payload))
});

export default withTranslation()(withRouter(connect(null,mapDispatchToProps)(MPCategoryView)));