import React, { Component } from 'react';
import { Col, Button, Row, Dropdown, Breadcrumb, ButtonGroup } from 'react-bootstrap';
import { connect } from 'react-redux';
import { withTranslation } from 'react-i18next';
import { withRouter, Link, Prompt } from 'react-router-dom'; //
import { XIcon, CopyIcon, PlusIcon, BookmarkFillIcon } from '@primer/octicons-react';
//import randomColor from 'randomcolor';
import { v4 as uuidv4 } from 'uuid'; //unique id
import FeatherIcon from 'feather-icons-react';
import Select from 'react-select';

import { selectedMasterPlanSetAction, selectedMPCategorySetAction, selectedMPCategoryRectSetAction, selectedMPSubCatSetAction, setNewProdCountCatAction, setNewProdCountSubCatAction } from '../../../../actions/masterPlanogram/masterplanogram_action';

import { checkColorIsLight, measureConverter, roundOffDecimal } from '../../../../_services/common.service';
import { submitCollection } from '../../../../_services/submit.service';
import { submitSets } from '../../../UiComponents/SubmitSets';
import { AcViewModal } from '../../../UiComponents/AcImports'; 
import { catRectEnums, catRuleEnums } from '../../../../enums/masterPlanogramEnums';

import { reCheckSnapRects, saveObjDataConvert, getNameorIdorColorofBox, RuleWarningValidations, validateDeptSettings, 
    convertWidthPercent, getRectPercentage, findResolutionType, TooltipWrapper  } from '../../AddMethods'; //, convertWidthPercent 

import MPDrawing from './MPDrawing/MPDrawing';
import MPDeptMetaForm from '../../departmentview/deptquestions/formcontainer';
import DataRuleContent from '../DataRulesContent/druleContent';
import MpSliderContent from '../sliderContent';
import MPRulesAdd from '../rulesadd/rulesadd';

import CustomProgressBar from '../../../common_layouts/customProgressBar';
import { alertService } from '../../../../_services/alert.service';

import loaderanime from '../../../../assets/img/loading-sm.gif';

export class SubcatContent extends Component {
    constructor(props){
        super(props);

        this.additemElement = React.createRef();
        this._loadingTimeout = null;
        this.perContentDiv = React.createRef();

        this.state = {
            defSaveObj: null, selectedCatgory: null, selectedCatRect: null, selectedRuleObj: {}, isReloadingItems: false,
            isLoadDrules: false, ruleIdList: [],
            addselectcat: null, showsubcat: null,
            isChangesAvailable: false,
            loadedSubCategoryList: [], selectSubCategoryList: [], defaultSelectSubCat: null,
            percentagesLoadQueque: [], isPercentagesLoading: false,
            loadedSubCatPercentages: [], bkpSubCatPercentages: [], isRulesDeleted: false,
            showNavigationView: false,
            iscatAddedOnetime: false,
            //
            loadedSuppliersList: [], selectSupplierList: [],
            loadedBrandsList: [], selectBrandsList: [],
            
            activeDrawType: "subc", //subc, supp, brand
            isEnableDraw: true, selectedDraw: null, oneTimeConvert: true,
            divWidth: 0, divHeight: 0, displayUOM: "cm",
            showResolutionCount: 1,
            //history points
            historyData: { past: [], present: 0, future: [] },
            //toolbox actions
            activeTool: "default",
            isShowLoadingModal: false, ishavesubcategories: false,
            percentageDropList: [],
            //suppliers add
            isSupplierView: false, 
            
            isDeptView: false, isonetimeload: true,
            
            //cut boxes
            cutBoxList: [],

            subCatDataPanelData: [], isDataPanelLoading: true,

            perContentWidth: 0,
        }
    }

    componentDidMount() {
        //console.log(this.props);
        if(this.props.masterPlanogramState && this.props.masterPlanogramState.mpDetails){
            this.setState({ defSaveObj: this.props.masterPlanogramState.mpDetails });
        }
        
        if(this.props.masterPlanogramState && this.props.masterPlanogramState.mpCatDetails){
            let crescount = findResolutionType(1);

            let selcatobj = this.props.masterPlanogramState.mpCatRectDetails;
            let catrectid = (selcatobj.type === catRectEnums.default?selcatobj.category.category_id:-1);
            let iscatrulebased = (selcatobj.type === catRectEnums.rule);

            let ruleobj = null;
            if(iscatrulebased){
                ruleobj = {
                    level: selcatobj.rule.level,
                    id: getNameorIdorColorofBox(selcatobj, "num"),
                    mpid: selcatobj.rule.id
                }
            }

            this.setState({ 
                showResolutionCount: crescount,
                selectedCatgory: JSON.parse(JSON.stringify(this.props.masterPlanogramState.mpCatDetails)), 
                selectedCatRect: JSON.parse(JSON.stringify(this.props.masterPlanogramState.mpCatRectDetails)),
                selectedRuleObj: ruleobj, 
                isShowLoadingModal: true,
                showNavigationView: true,
                perContentWidth: (this.perContentDiv.current && this.perContentDiv.current.offsetWidth?(this.perContentDiv.current.offsetWidth - 25):0)
            }, () => {
                this.getAllSubCategories(catrectid, selcatobj.type, ruleobj);

                //for rule based add
                this.getAllBrands(catrectid, selcatobj.type, ruleobj);
                this.getAllSuppliers(catrectid, selcatobj.type, ruleobj);

                if(this.props.isneeddeptsettingvalid){
                    this.toggleDeptView(true, true);
                }

                setTimeout(() => {
                    this.setState({ isonetimeload: false });
                }, 200);
            });
        }
    }

    componentWillUnmount() {
        clearTimeout(this._loadingTimeout);
    }

    componentDidUpdate = () => {
        //shows warning changes available when reload page
        /* if (this.state.isChangesAvailable) {
          window.onbeforeunload = () => false
        } else {
          window.onbeforeunload = undefined
        } */
    }

    //load all sub categories of selected category
    getAllSubCategories = (catid, ctype, ruleobj) => {
        var cdefSaveObj = this.state.defSaveObj;
        // let selcat = this.state.selectedCatRect;
        // let supid = (selcat.type === catRectEnums.rule?getNameorIdorColorofBox(selcat, "num"):0);

        let svobj = { 
            categoryId: catid, 
            isRuleBased: (ruleobj?true:false),
            mpRuleId: (ruleobj?ruleobj.mpid:0),
            departmentId: (cdefSaveObj?cdefSaveObj.department.department_id:-1)
        };

        submitSets(submitCollection.mpSubCategoryList, svobj).then(res => {
            //console.log(res.extra);

            if(res && res.status && res.extra){
                let selectscatlist = (res.extra.length > 0?res.extra.map((xitem, xidx) => {
                    return {value: xidx, label: xitem.subCategoryName};
                }):[])

                this.setState({ loadedSubCategoryList: res.extra, selectSubCategoryList: selectscatlist });
            }
        });

        //this.setState({ loadedSubCategoryList: samplesubcatarr });
    }
    //load all brands of selected sub category
    getAllBrands = (catid, ctype, ruleobj) => {
        var cdefSaveObj = this.state.defSaveObj;

        let svobj = { 
            categoryId: catid, 
            isRuleBased: (ruleobj?true:false),
            mpRuleId: (ruleobj?ruleobj.mpid:0),
            departmentId: (cdefSaveObj?cdefSaveObj.department.department_id:-1)
        };

        submitSets(submitCollection.mpBrandList, svobj).then(res => {
            
            if(res && res.status && res.extra){
                let selectbrandlist = (res.extra.length > 0?res.extra.map((xitem, xidx) => {
                    return {value: xidx, label: xitem.brandName};
                }):[])

                this.setState({ loadedBrandsList: res.extra, selectBrandsList: selectbrandlist });
            }
        });
    }
    //load all sub category percentages of selected category
    getSubCatPercentages = (isrulechange, isreloadall, isonload) => {
        var cdefSaveObj = this.state.defSaveObj;
        let mpid = (cdefSaveObj?cdefSaveObj.mp_id:-1);

        let selectedCategory = this.state.selectedCatRect;
        let rulebaselist = []; 
        let ruleids = []; 
        // let isRulesDeleted = false;

        //temp - 
        if(selectedCategory && selectedCategory.sub_categories.length > 0){
            for (let k = 0; k < selectedCategory.sub_categories.length; k++) {
                const citem = selectedCategory.sub_categories[k];
                
                if(citem.type === catRectEnums.rule){
                    if(!citem.isDelete){
                        const isalreadyadded = rulebaselist.findIndex(z => z.id === citem.id);
                        if(isalreadyadded === -1){
                            rulebaselist.push(citem);
                            ruleids.push({level: citem.rule.level, id: getNameorIdorColorofBox(citem, "num"), isNew: (citem.isNew === true?true:false)}); 
                        }
                    } else{
                        // isRulesDeleted = true;
                    }
                }
            }
        }
        
        if(isrulechange){
            this._loadingTimeout = setTimeout(() => {
                let selcatobj = this.state.selectedCatRect;
                let catrectid = (selcatobj.type === catRectEnums.default?selcatobj.category.category_id:-1);
                let iscatrulebased = (selcatobj.type === catRectEnums.rule);

                let ruleobj = null;
                if(iscatrulebased){
                    ruleobj = {
                        level: selcatobj.rule.level,
                        id: getNameorIdorColorofBox(selcatobj, "num"),
                    }
                }
                
                let svobj = { 
                    mpId: mpid,
                    departmentId: (cdefSaveObj?cdefSaveObj.department.department_id:-1),
                    categoryId: catrectid, 
                    mpCatHasBoxId: selcatobj.id,
                    isCatRuleBased: (ruleobj?true:false),
                    catRuleObj: (ruleobj?ruleobj:{}),
                    mpRuleIds: ruleids,
                    fromDate: this.props.chartFilterDates.fromdate,
                    endDate: this.props.chartFilterDates.todate,
                    isDelete: this.state.isRulesDeleted,
                };
                
                if(!this.state.isPercentagesLoading){
                    this.continuePercentageLoad(svobj, ruleids, isonload);
                } else{
                    let searchobj = svobj;
                    searchobj["isonload"] = isonload;
                    this.setState({ percentagesLoadQueque: [searchobj] });
                }
            }, 500);
        } else{
            this.setState({ isShowLoadingModal: false, ruleIdList: ruleids }, () => {
                this.compareSubCategoryData(isreloadall, isonload);
            });
        }
    }
    //continue sub categories percentage load
    continuePercentageLoad = (svobj, ruleids, isonload) => {
        this.setState({ isPercentagesLoading: true }, () => {
            submitSets(submitCollection.mpSubCategoryPercentage, svobj).then(res => {
                //console.log(res.extra);

                if(res && res.status && res.extra){
                    this.setState({ 
                        isPercentagesLoading: false, 
                        loadedSubCatPercentages: res.extra, bkpSubCatPercentages: res.extra, 
                        isShowLoadingModal: false, ruleIdList: ruleids,
                    }, () => {
                        this.compareSubCategoryData(true, isonload);

                        this.getNewProdCountOfSubCatLevel(svobj);

                        //check percentages queque data available
                        if(this.state.percentagesLoadQueque && this.state.percentagesLoadQueque.length > 0){
                            let quequelist = JSON.parse(JSON.stringify(this.state.percentagesLoadQueque));
                            let firstquequeitem = quequelist[0];

                            this.setState({ percentagesLoadQueque: [] }, () => {
                                this.continuePercentageLoad(firstquequeitem, firstquequeitem.mpRuleIds, firstquequeitem.isonload);
                            });
                        }
                    });
                } else{
                    this.getNewProdCountOfSubCatLevel(svobj);
                    this.setState({ isPercentagesLoading: false, percentagesLoadQueque: [], isShowLoadingModal: false, ruleIdList: ruleids });
                }
            });  
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
    compareSubCategoryData = (isrulechange, isonload) => {
        let selectedCategory = this.state.selectedCatRect;
        let iscatAddedOnetime = this.state.iscatAddedOnetime;

        //percentage totals add
        //console.log(creactlist[cselectedcat]);
        for (let j = 0; j < selectedCategory.sub_categories.length; j++) {
            const subcatitem = selectedCategory.sub_categories[j];
            
            let totalrectper = 0;
            for (let i = 0; i < subcatitem.rects.length; i++) {
                const rectitem = subcatitem.rects[i];
                if(!rectitem.isDelete){
                    totalrectper = (totalrectper + rectitem.percentage);
                }
            }
            subcatitem["percentage"] = totalrectper;
        }
        
        let loadedSubCatPercentages = JSON.parse(JSON.stringify(this.state.bkpSubCatPercentages));

        //sort by rec per highest 
        loadedSubCatPercentages = loadedSubCatPercentages.sort((a, b) => (b.suggestedPercentage - a.suggestedPercentage));
        
        for (let i = 0; i < loadedSubCatPercentages.length; i++) {
            const categoryitem = loadedSubCatPercentages[i];
            
            let catfinditems = selectedCategory.sub_categories.filter(x => !x.isDelete && (
                (!categoryitem.isRule && x.type === catRectEnums.default && x.sub_category.subCategoryId === categoryitem.id) || 
                (categoryitem.isRule && x.type === catRectEnums.rule && x.rule.level === categoryitem.ruleLevel && getNameorIdorColorofBox(x,"num") === categoryitem.id)
            )); 
            
            if(catfinditems && catfinditems.length > 0){
                let totalrectper = 0;
                for (let l = 0; l < catfinditems.length; l++) {
                    const catfinditem = catfinditems[l];
                    for (let j = 0; j < catfinditem.rects.length; j++) {
                        const rectitem = catfinditem.rects[j];
                        if(!rectitem.isDelete){
                            totalrectper = (rectitem.percentage + totalrectper);
                        }
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
        //if only available one percentage and it's not added onload
        if(isonload && !iscatAddedOnetime && loadedSubCatPercentages.length === 1 && loadedSubCatPercentages[0].percentage === 0){
            iscatAddedOnetime = true;

            this.addNewSubCategory(null, true, loadedSubCatPercentages[0], false, true);
        }

        /* if(isrulechange){
            this.props.clearDataCaches("brand"); //clear data cache
        } */

        this.setState({ loadedSubCatPercentages: loadedSubCatPercentages, iscatAddedOnetime: iscatAddedOnetime, selectedCatRect: selectedCategory, isLoadDrules: false }, () => {
            this.setState({ isLoadDrules: true });
        });
    }
    
    //load all suppliers
    getAllSuppliers = (selcatid, ctype, ruleobj) => {
        var cdefSaveObj = this.state.defSaveObj;
        
        var csobj={
            isRuleBased: (ruleobj?true:false),
            mpRuleId: (ruleobj?ruleobj.mpid:0),
            categoryId: selcatid,
            departmentId: (cdefSaveObj?cdefSaveObj.department.department_id:-1)
        }
        submitSets(submitCollection.mpSupplierList, csobj).then(res => {
            //console.log(res);

            if(res && res.status && res.extra){
                let loadedcatlist = (res.extra?res.extra:[]);
                let filtercatlist = loadedcatlist.map((xitem, xidx) => {return {value: xidx, label: xitem.supplier_name}; });
                
                this.setState({
                    loadedSuppliersList: res.extra, selectSupplierList: filtercatlist,
                });
            }
        });
    }

    setRects = (rects, cutlist, isDrawSelect, drawSelectItem, isruleupdate, isreloadall, isruledeleted) => {
        this.fieldHistoryAdd(JSON.parse(JSON.stringify(this.state.selectedCatRect)),1,JSON.parse(JSON.stringify(this.state.cutBoxList)));
        let ccatobj = this.state.selectedCatRect;

        for (let i = 0; i < rects.length; i++) {
            const subcatitem = rects[i];
            
            if(!subcatitem.isDelete){
                for (let l = 0; l < subcatitem.rects.length; l++) {
                    const rectitem = subcatitem.rects[l];
                    
                    if(!rectitem.isDelete){
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
        this.setState({ isReloadingItems: true }, () => {
            this.setState({ selectedCatRect: ccatobj, isReloadingItems: false, 
                isRulesDeleted: (isruledeleted?true:this.state.isRulesDeleted),
            }, () => {
                if(isruleupdate){
                    this.props.clearDataCaches("all"); //clear data cache
                }

                // this.getSubCatPercentages(isruleupdate, isreloadall);
                if(isruledeleted){
                    this.saveCategoryObj(false,null,false,null,null,false,null,null,true);
                } else{
                    this.compareSubCategoryData(false);
                }

                //if cut items list available to update
                if(cutlist){
                    this.updateCutList(cutlist);
                }
                //if draw item available to enable draw
                if(isDrawSelect){
                    this.handleSelectDraw(drawSelectItem)
                }
            });
        });
    }

    handleGoBack = () => {
        this.props.history.push("/masterplanograms/selectcat");
    }

    addNewSubCategory = (e, isautoadd, subcat, issupp, isfulldraw) => {
        let defsaveobj = JSON.parse(JSON.stringify(this.state.defSaveObj));
        let bkpsaveobj = JSON.parse(JSON.stringify(this.state.selectedCatRect));
        
        let cparentcat = this.state.selectedCatgory;
        let csaveobj = this.state.selectedCatRect;
        
        let selectedtxt = -1;

        if(isautoadd){
            selectedtxt = subcat.id;
        } else{
            //selectedtxt = parseInt(document.getElementById("newcat-select").value);
            let selectscatitem = (this.state.defaultSelectSubCat?this.state.loadedSubCategoryList[this.state.defaultSelectSubCat.value]:null);
            selectedtxt = (selectscatitem?parseInt(selectscatitem.subCategoryId):-1);
            //selectedsuptxt = parseInt(document.getElementById("newsup-select").value);
        }

        let subcitem = this.state.loadedSubCategoryList.find(z => z.subCategoryId === selectedtxt);
        let isalreadyadded = csaveobj.sub_categories.find(x => (!x.isDelete && x.type === catRectEnums.default && x.sub_category.subCategoryId === selectedtxt));
        //console.log(subcitem);

        if(subcitem){
            if(!isalreadyadded){
                this.fieldHistoryAdd(bkpsaveobj,1,JSON.parse(JSON.stringify(this.state.cutBoxList)));

                //if only one brand and it's 100 percent
                let isRectCanDraw = false; let drawRectObj = []; let totalscatper = 0;
                let suggestedper = 0;
                if(this.state.loadedSubCatPercentages && this.state.loadedSubCatPercentages.length > 0){
                    let findScatPerMoreItems = this.state.loadedSubCatPercentages.filter(peritem => peritem.suggestedPercentage > 0);

                    let findScatPerItem = findScatPerMoreItems.find(peritem => (!peritem.isRule && peritem.id === subcitem.subCategoryId));
                    suggestedper = (findScatPerItem?findScatPerItem.suggestedPercentage:0);

                    if(isfulldraw || (findScatPerMoreItems && findScatPerMoreItems.length === 1)){
                        if(isfulldraw || (findScatPerItem && findScatPerItem.suggestedPercentage > 5)){
                            let suggestper = (isfulldraw?100:findScatPerItem.suggestedPercentage);
                            let ccatrect = JSON.parse(JSON.stringify(csaveobj));
                            let scatnotdeleted = (ccatrect && ccatrect.sub_categories && ccatrect.sub_categories.length > 0?ccatrect.sub_categories.filter(bitem => !bitem.isDelete):[]);
    
                            if(scatnotdeleted && scatnotdeleted.length === 0){

                                if(cparentcat.field_obj && cparentcat.field_obj.allowShelfGroups && cparentcat.field_obj.allowShelfGroups.length > 0){
                                    for (let m = 0; m < cparentcat.field_obj.allowShelfGroups.length; m++) {
                                        const allowgroupitem = cparentcat.field_obj.allowShelfGroups[m];
                                        
                                        let newcontainShelfs = [];
                                        allowgroupitem.contains.forEach(ncontainshelf => {
                                            ncontainshelf["id"] = uuidv4();
                                            newcontainShelfs.push(ncontainshelf);
                                        });
                                        
                                        let scwidthperwidth = convertWidthPercent(suggestper,this.state.divWidth,true);
                                        
                                        isRectCanDraw = true;
                                        let newdrawRectObj = { 
                                            id: uuidv4(), isNew: true, isDelete: false, 
                                            x: 0, y: allowgroupitem.y, width: scwidthperwidth, 
                                            height: allowgroupitem.height,
                                            contain_shelves: newcontainShelfs, isSnapped: false, 
                                            box_width_percentage: suggestper, 
                                            percentage: suggestper, 
                                            brands: [],
                                        };

                                        let returnper = getRectPercentage(newdrawRectObj, this.state.divWidth, cparentcat.field_obj);
                                        newdrawRectObj.box_width_percentage = returnper.box_percentage;
                                        newdrawRectObj.percentage = returnper.percentage;

                                        drawRectObj.push(newdrawRectObj);

                                        totalscatper += newdrawRectObj.percentage;
                                    }
                                }

                                
                            }
                        }
                    }
                }
                
                let scatobj = {id: uuidv4(),
                    sub_category: { subCategoryId: subcitem.subCategoryId, subCategoryName: subcitem.subCategoryName, color: (subcitem.subCategoryColor?subcitem.subCategoryColor:"#5128a0") }, 
                    type: catRectEnums.default, rule: {},
                    isNew: true, isDelete: false, 
                    rects: (isRectCanDraw && drawRectObj.length > 0?drawRectObj:[]),
                    percentage: (isRectCanDraw && drawRectObj.length > 0?totalscatper:0),
                };

                let findruleadded = RuleWarningValidations("scat", defsaveobj, subcitem.subCategoryId, cparentcat.id, csaveobj.id, null, false, catRuleEnums.subcat);
                // console.log(findruleadded);
                scatobj["isRuleParentAdded"] = findruleadded.isAdded;
                scatobj["isRuleParentList"] = findruleadded.addedRuleList;
                // console.log(scatobj);
                
                if(findruleadded.isAdded && suggestedper === 0){
                    alertService.warn(this.props.t("THIS_SCAT_IS_ALREADY_ADDED_RULE")+(" "+this.props.t("category")));
                    return false;
                }

                //console.log(scatobj);
                csaveobj.sub_categories.push(scatobj);

                this.setState({ selectedCatRect: csaveobj }, () => {
                    this.getSubCatPercentages(false, true);

                    if(!isRectCanDraw){ 
                        this.handleSelectDraw(scatobj);
                    }
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
        this.setState({ activeDrawType: (ctype), activeTool: settool, selectedDraw: (settool === "draw" && this.state.selectedDraw?this.state.selectedDraw:null) });
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
        
        this.setState({ historyData: chobj, isChangesAvailable: true }, () => {
            this.props.updateSavefromChild(null, true);
        });
    }
    //undo changes hisory
    fieldHistoryUndo = () => {
        let cutBoxList = JSON.parse(JSON.stringify(this.state.cutBoxList));
        var chobj = this.state.historyData;
        var backidx = (chobj.present>0?(chobj.present - 1):(chobj.past.length - 1));
        var getsobj = chobj.past[backidx];
        
        var cfutureobj = { type:getsobj.type, obj:JSON.parse(JSON.stringify(this.state.selectedCatRect)), cutlist: cutBoxList };
        chobj.future.push(cfutureobj);
        chobj.past.splice(-1,1);
        
        let ccatobj = this.state.selectedCatRect;
        ccatobj["sub_categories"] = [];
        
        let isChangesAvailable = (chobj.past.length === 0?false:this.state.isChangesAvailable);

        this.setState({ selectedCatRect: ccatobj, isChangesAvailable: isChangesAvailable }, () => {
            this.props.updateSavefromChild(null, isChangesAvailable);

            this.setState({ selectedCatRect: getsobj.obj, historyData: chobj, cutBoxList: getsobj.cutlist }, () => {
                clearTimeout(this._loadingTimeout);

                this.props.clearDataCaches("all"); //clear data cache
                
                this.getSubCatPercentages(true);
            });
        });
    }
    //redo changes hisory
    fieldHistoryRedo = () => {
        let cutBoxList = JSON.parse(JSON.stringify(this.state.cutBoxList));
        var chobj = this.state.historyData;
        var backidx = (chobj.present>0?(chobj.present + 1):(chobj.future.length - 1));
        var getsobj = chobj.future[backidx];

        var cpastobj = { type:getsobj.type, obj:JSON.parse(JSON.stringify(this.state.selectedCatRect)), cutlist: cutBoxList };
        chobj.past.push(cpastobj);
        chobj.future.splice(-1,1);
        
        let ccatobj = this.state.selectedCatRect;
        ccatobj["sub_categories"] = [];

        this.setState({ selectedCatRect: ccatobj }, () => {
            this.setState({ selectedCatRect: getsobj.obj, historyData: chobj, cutBoxList: getsobj.cutlist }, () => {
                clearTimeout(this._loadingTimeout);

                this.props.clearDataCaches("all"); //clear data cache

                this.getSubCatPercentages(true);
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
    saveCategoryObj = (isbrandredirect, selsubcat, issubcategory, selcatobj, selcatrect, istogglesummary, sumtype, sumevt, isrulesave) => {
        // console.log("scat")
        //supplier view open validate
        if(!isrulesave && this.state.isSupplierView){
            alertService.error(this.props.t("close_rulesview_first"));
            return false;
        }

        let notdeletedcatlist = null;
        if(isbrandredirect){
            notdeletedcatlist = selsubcat.rects.filter(x => !x.isDelete) 
        }
        
        if(!isbrandredirect || (notdeletedcatlist && notdeletedcatlist.length > 0)){
            let exportsave = this.state.defSaveObj;
            let exportcat = JSON.parse(JSON.stringify(this.state.selectedCatgory));
            let exportcatrect = JSON.parse(JSON.stringify(this.state.selectedCatRect));
            
            //update main category object with new rect object
            let findcatrectidx = exportcat.rects.findIndex(x => x.id === exportcatrect.id);
            exportcat.rects[findcatrectidx] = exportcatrect;

            //new category save obj
            let newsaveobj = { 
                mpId: exportsave.mp_id, 
                mpHasCategoryId: exportcat.id, 
                mpHasCategoryHasRectId: exportcatrect.id, 
                subCategories: [] 
            };

            let returncatobj = saveObjDataConvert(exportcat, false, this.state.divWidth);
            let returnrectobj = returncatobj.rects[findcatrectidx];
            
            if(this.state.isChangesAvailable){
                for (let i = 0; i < returnrectobj.sub_categories.length; i++) {
                    const subcatitem = returnrectobj.sub_categories[i];
                    
                    let newruleobj = {};
                    if(subcatitem.type === catRectEnums.rule){
                        newruleobj = {
                            id: subcatitem.rule.id,
                            level: subcatitem.rule.level,
                            supplier: (subcatitem.rule.level === catRuleEnums.sup?{ supplierId: getNameorIdorColorofBox(subcatitem, "num") }:null),
                            brand: (subcatitem.rule.level === catRuleEnums.brand?{ brandId: getNameorIdorColorofBox(subcatitem, "num") }:null),
                            isNew: subcatitem.rule.isNew,
                            isDelete: subcatitem.rule.isDelete,
                        };
                    }

                    let newsubcatobj = {
                        id: subcatitem.id,
                        sub_category: (subcatitem.type === catRectEnums.default?{ subCategoryId: subcatitem.sub_category.subCategoryId }:null),
                        type: subcatitem.type,
                        isNew: (subcatitem.isNew?subcatitem.isNew:false),
                        isDelete: (subcatitem.isDelete?subcatitem.isDelete:false),
                        rule: newruleobj,
                        rects: []
                    };
                    
                    let notdeletedrects = 0;
                    for (let j = 0; j < subcatitem.rects.length; j++) {
                        const rectitem = subcatitem.rects[j];

                        if(!rectitem.isDelete){
                            notdeletedrects += 1;
                        }

                        //new save rect object
                        let newrectobj = {
                            id: rectitem.id,
                            x: rectitem.x,
                            //width: rectitem.width,
                            box_width_percentage: rectitem.box_width_percentage,
                            width: rectitem.width,
                            isSnapped: rectitem.isSnapped,
                            isNew: (rectitem.isNew?rectitem.isNew:false),
                            isDelete: (rectitem.isDelete?rectitem.isDelete:false),
                            contain_shelves: [],
                            brands: []
                        };
                        //loop rank details to add rect object
                        for (let l = 0; l < rectitem.contain_shelves.length; l++) {
                            const conshelves = rectitem.contain_shelves[l];
                            
                            newrectobj.contain_shelves.push({id: -1, rank: conshelves.rank});
                        }
                        //loop brand details to add rect object
                        for (let k = 0; k < rectitem.brands.length; k++) {
                            const branditem = rectitem.brands[k];
                            
                            let newbrandobj = {
                                id: branditem.id,
                                brand: (branditem.type === catRectEnums.default?{brandId: branditem.brand.brandId}:{}),
                                type: branditem.type,
                                isNew: (branditem.isNew?branditem.isNew:false),
                                isDelete: (branditem.isDelete?branditem.isDelete:false),
                                rule: {},
                                rects: [],
                            };

                            if(branditem.rects && branditem.rects.length > 0){
                                for (let z = 0; z < branditem.rects.length; z++) {
                                    const brectitem = branditem.rects[z];
                                    if(!brectitem.isDelete){
                                        let newbrandrectobj = {
                                            id: brectitem.id,
                                            x: brectitem.x,
                                            width: (brectitem.width?brectitem.width:0),
                                            box_width_percentage: (brectitem.box_width_percentage?brectitem.box_width_percentage:0),
                                            isSnapped: brectitem.isSnapped,
                                            contain_shelves: (brectitem.contain_shelves?brectitem.contain_shelves:[]),
                                            isNew: (brectitem.isNew?brectitem.isNew:false),
                                            isDelete: (brectitem.isDelete?brectitem.isDelete:false),
                                        }

                                        newbrandobj.rects.push(newbrandrectobj);
                                    }
                                }

                                newrectobj.brands.push(newbrandobj);
                            } else{
                                if(!newbrandobj.isNew){
                                    newbrandobj.isDelete = true;
                                    newrectobj.brands.push(newbrandobj);
                                }
                            }
                        }

                        newsubcatobj.rects.push(newrectobj);
                    }
                    
                    if(!subcatitem.isDelete && notdeletedrects === 0){
                        alertService.error(this.props.t("SOME_SUBCAT_NOBOXES"));
                        return false;
                    }

                    newsaveobj.subCategories.push(newsubcatobj);
                }
                
                //console.log(newsaveobj);
                //save
                this.setState({ isShowLoadingModal: true, activeTool: "default", selectedDraw: null }, () => {
                    submitSets(submitCollection.saveSubCategory, newsaveobj, false, null, true).then(res => {
                        //console.log(res.extra);
        
                        if (res && res.status) {
                            this.setState({ isChangesAvailable: false }, () => {
                                this.props.clearDataCaches("all"); //clear data cache
                                
                                alertService.success(this.props.t("subcatsavesuccess"));
                                this.loadMPDetails(isbrandredirect, returncatobj, returnrectobj, selsubcat, issubcategory, selcatobj, selcatrect, istogglesummary, sumtype, sumevt);
                            });
                        } else{
                            // alertService.error((res.error && res.error && res.error.errorMessage)?res.error.errorMessage:"Error occurred");
                            this.setState({ isShowLoadingModal: false });
                        }
                    });
                });

            } else{
                if(isbrandredirect || issubcategory){
                    this.redirectViewHandle(isbrandredirect, returncatobj, returnrectobj, selsubcat, issubcategory, selcatobj, selcatrect);
                } else{
                    if(!isrulesave){
                        alertService.error(this.props.t("NO_CHANGES_AVAILABLE"));
                    }
                }
            }
        } else{
            alertService.error(this.props.t("drawboxesfirst"));
        }
    }
    //load mp details
    loadMPDetails = (isredirect, catobj, catrectobj, subcatobj, issubcategory, selcatobj, selcatrect, istogglesummary, sumtype, sumevt) => {
        let csaveobj = this.state.defSaveObj;

        let svobj;
        if(csaveobj.mp_id > -1){
            svobj = { chainHasDepartmentId:csaveobj.department.department_id, mp_id:csaveobj.mp_id };
        } else{
            if(csaveobj.mp_id === -2){
                svobj = { chainHasDepartmentId:csaveobj.department.department_id, mp_id:csaveobj.mp_id };
            } else{
                svobj = { chainHasDepartmentId:csaveobj.department.department_id };        
            }
        }
        
        this.setState({ isShowLoadingModal: true }, () => {
            submitSets(submitCollection.loadMp, svobj, false).then(res => {
                //console.log(res);
                if(res && res.status){
                    let newsaveobj = ((res.extra && Object.keys(res.extra).length > 0)?res.extra:this.state.defSaveObj);
                    
                    this.props.updateSavefromChild(newsaveobj);
                    // this.getNewProdCountOfLevels(newsaveobj);
                    this.setState({
                        isShowLoadingModal: false, defSaveObj: newsaveobj,
                        isRulesDeleted: false,
                    }, () => {
                        //find new category object
                        let foundcatobj = newsaveobj.categories.find(x => x.id === catobj.id);
                        
                        if(foundcatobj){
                            let foundcatrect = foundcatobj.rects.find(x => x.id === catrectobj.id);

                            if(foundcatrect){
                                let foundsubcatobj = null;
                                if(isredirect){
                                    foundsubcatobj = foundcatrect.sub_categories.find(x => 
                                        (subcatobj.type === catRectEnums.default && x.type === catRectEnums.default && getNameorIdorColorofBox(x, "num") === getNameorIdorColorofBox(subcatobj, "num")) ||
                                        (subcatobj.type === catRectEnums.rule && x.type === catRectEnums.rule && subcatobj.rule.level === x.rule.level && getNameorIdorColorofBox(x, "num") === getNameorIdorColorofBox(subcatobj, "num"))
                                    );    
                                    //console.log(foundsubcatobj);
                                    if(foundsubcatobj){
                                        this.redirectViewHandle(isredirect, foundcatobj, foundcatrect, foundsubcatobj, issubcategory, selcatobj, selcatrect);
                                    } else{
                                        alertService.error(this.props.t("subcatnotfound"));
                                    }
                                } else{
                                    this.redirectViewHandle(isredirect, foundcatobj, foundcatrect, null, issubcategory, selcatobj, selcatrect, istogglesummary, sumtype, sumevt);
                                }
                            } else{
                                alertService.error(this.props.t("catrectnotfound")); 
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
    redirectViewHandle = (isbrandredirect, exportcat, exportrect, exportsubcat, issubcategory, selcatobj, selcatrect, istogglesummary, sumtype, sumevt) => {
        //update redux
        this.props.setMPCategoryAction(exportcat);
        this.props.setMPCategoryRectAction(exportrect);
        this.props.setMasterPlanAction(this.state.defSaveObj);

        if(isbrandredirect){
            //filter rule list and added to the sub cat list
            let subcatrules = (exportrect && exportrect.sub_categories?exportrect.sub_categories.filter(x => !x.isDelete && x.id !== exportsubcat.id && x.type === catRectEnums.rule).map(z => {
                return {level: z.rule.level, id: getNameorIdorColorofBox(z, "num")};
            }):[]);
            exportsubcat["otherMpRuleIds"] = subcatrules;
            // console.log(exportsubcat);

            this.props.setMPSubCatAction(exportsubcat);
            // this.props.history.push("/masterplanograms/branddetails");
            this.props.redirectToCategory("brand", exportsubcat);
        } else if(issubcategory){
            this.props.redirectToCategory("scat", selcatobj, null, selcatrect);
        } else if(istogglesummary){
            this.props.toggleSummary(sumtype, this.state.isChangesAvailable, sumevt);
        } else{
            //this.props.history.push("/masterplanograms/selectcat");

            let catrectobj = JSON.parse(JSON.stringify(exportrect));

            this.setState({ selectedCatRect: null }, () => {
                this.setState({ 
                    selectedCategory: exportcat,
                    selectedCatRect: catrectobj,
                    selectedSubCat: exportsubcat,
                    oneTimeConvert: true,
                    historyData: { past: [], present: 0, future: [] },
                }, () => {
                    // this.getSubCatPercentages(true);
                });
            });
        }
    }
    //update div details
    updateDivDetails = (cwidth, cheight, cfieldobj) => {
        
        if(this.state.oneTimeConvert){
            let exportsaveobj = JSON.parse(JSON.stringify(this.state.defSaveObj));
            let exportcat = JSON.parse(JSON.stringify(this.state.selectedCatgory));
            let exportcatrect = JSON.parse(JSON.stringify(this.state.selectedCatRect));

            //update main category object with new rect object
            let findcatrectidx = exportcat.rects.findIndex(x => x.id === exportcatrect.id);
            exportcat.rects[findcatrectidx] = exportcatrect;

            exportcat["field_obj"] = (cfieldobj?cfieldobj:exportcat.field_obj);
            let exportfield = exportcat.field_obj;
            //calculate dimention
            let redicedheight = cheight;
            
            var dimention = (redicedheight / measureConverter(exportfield.field_uom,this.state.displayUOM,exportfield.field_height));

            let returncatobj = saveObjDataConvert(exportcat, true, cwidth, dimention, false, null, exportsaveobj, this.state.displayUOM);
            let returnrectobj = returncatobj.rects[findcatrectidx];
            // console.log(returncatobj);

            this.setState({ selectedCatgory: returncatobj, selectedCatRect: returnrectobj, divWidth: cwidth, divHeight: cheight, oneTimeConvert: false }, () => {
                this.getSubCatPercentages(true, false, true);
            });    
        }
    }

    // getNewProdCountOfLevels = (viewdetails) => {

    //     let departmentId = viewdetails.department.department_id;

    //     let catLevelRect = viewdetails.categories.map(cat=>cat.rects? cat.rects : null);
        
    //     let catLevelRects = catLevelRect.filter(cat => cat !== null)

    //     let catBoxIds = catLevelRects.flatMap(innerArray => innerArray.map(obj => obj.id));
    //     let subCatBoxIds = catLevelRects.flatMap(arr => arr.flatMap(obj => obj.sub_categories.map(id => id.mpHasCatHasSubCatid)));

    //     let svobj = {
    //         depId: departmentId,
    //         catIds: catBoxIds,
    //         subCatIds : subCatBoxIds
    //     }

    //     submitSets(submitCollection.mpCatNewProductCount, svobj).then(res => {

    //                 if(res && res.status && res.extra){
    //                     // this.setState({ catNewProductCount: res.extra.catNewProductCount, subCatNewProductCount: res.extra.subCatNewProductCount  });
    //                     // console.log(res.extra); 
    //                     this.props.setNewProdCountLevels(res.extra);
    //                 }
    //             });

    // } 


    //remove added sub category
    handleremoveSubCategory = (xitem,xidx) => {
        this.fieldHistoryAdd(JSON.parse(JSON.stringify(this.state.selectedCatRect)),2,JSON.parse(JSON.stringify(this.state.cutBoxList)));

        let csaveobj = this.state.selectedCatRect;
        
        let isruleitem = (csaveobj.sub_categories[xidx].type === catRectEnums.rule);
        if(csaveobj.sub_categories[xidx].id > 0){
            csaveobj.sub_categories[xidx].isDelete = true;
        } else{
            csaveobj.sub_categories.splice(xidx,1);
        }

        if(isruleitem){
            this.props.clearDataCaches("all"); //clear data cache
        }
        
        this.setState({ selectedCatRect: csaveobj, 
            isRulesDeleted: (isruleitem?true:this.state.isRulesDeleted), 
            activeTool: "default", selectedDraw: null 
        }, () => {
            // this.getSubCatPercentages(true);
            if(isruleitem){
                this.saveCategoryObj(false,null,false,null,null,false,null,null,true);
            } else{
                this.compareSubCategoryData(false);
            }
        });
    }
    //clear dropdown category
    handleDropOpen = (isshow, issup) => {
        if(isshow){
            setTimeout(() => {
                //let curcatrect = this.state.selectedCatRect;

                let defcatobj = (this.state.showsubcat?this.state.showsubcat:this.state.selectSubCategoryList.length > 0?this.state.selectSubCategoryList[0]:null);
                //document.getElementById("newcat-select").value = defcatobj;
                
                this.setState({ showsubcat: null, defaultSelectSubCat: defcatobj });
            }, 100);
        }
    }
    //change selected sub cat
    handleChangeSubCat = (selitem) => {
        this.setState({ defaultSelectSubCat: selitem });
    }
    //redirect view list
    redirectList = (isopen, viewitem, isDraw) => {
        //if(isopen){
            let selectedcat = this.state.selectedCatRect;
            let filteritems = selectedcat.sub_categories.filter(z => {
                return (!z.isDelete && (
                (viewitem.isRule && z.type === catRectEnums.rule && z.rule.level === viewitem.ruleLevel && getNameorIdorColorofBox(z,"num") === viewitem.id) || 
                (!viewitem.isRule && z.type === catRectEnums.default && getNameorIdorColorofBox(z,"num") === viewitem.id)));
            });
            
            if(filteritems.length === 1){
                if(isDraw){
                    if(!this.props.isAUIDisabled){
                        this.handleSelectDraw(filteritems[0]);
                    }
                } else{
                    //if boxes available
                    var undeletedfilterdrects = filteritems[0].rects.length > 0?filteritems[0].rects.filter(x=>x.isDelete!==true):filteritems[0].rects
                    
                    if(undeletedfilterdrects.length > 0){
                        this.saveCategoryObj(true,filteritems[0]);
                    } else{
                        if(!this.props.isAUIDisabled){
                            this.handleSelectDraw(filteritems[0]);
                            alertService.error(this.props.t("drawboxesfirst"));
                        }
                    }
                }
            } else if(filteritems.length === 0 && !this.props.isAUIDisabled){
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
    //toggle between suppliers add and sub cat summary
    toggleSupplierView = () => {
        //if validate rule data when open/closing
        let returnrectobj = this.state.selectedCatRect;
        for (let i = 0; i < returnrectobj.sub_categories.length; i++) {
            const subcatitem = returnrectobj.sub_categories[i];
            
            let notdeletedrects = 0;
            for (let j = 0; j < subcatitem.rects.length; j++) {
                const rectitem = subcatitem.rects[j];

                if(!rectitem.isDelete){
                    notdeletedrects += 1;
                }
            }

            if(!subcatitem.isDelete && notdeletedrects === 0){
                alertService.error(this.props.t("SOME_SUBCAT_NOBOXES"));
                return false;
            }
        }   
        
        this.setState({ isSupplierView: !this.state.isSupplierView }, () => {
            if(!this.state.isSupplierView){
                this.saveCategoryObj(false,null,false,null,null,false,null,null,true);
            }
        });
    }
    //toggle between dept view and cat
    toggleDeptView = (show, isonload) => {
        //supplier view open validate
        if(!isonload && this.state.isSupplierView){
            alertService.error(this.props.t("close_rulesview_first"));
            return false;
        }

        if(!isonload && !show){
            let deptsettings = this.props.deptsettings;
            if(this.props.isneeddeptsettingvalid && !validateDeptSettings(deptsettings, this.props.t, this.props.isneeddeptsettingvalid)){
                return false;
            }

            if(this.props.isdeptupdateavailable){
                alertService.error(this.props.t("UPDATE_DEP_CHANGES_FIRST"));
                return false;
            }
        }

        this.setState({ isDeptView: show });

        // if(!show){
            this.saveAndToggle("scat", this.state.isChangesAvailable);
        // }
    }
    //toggle views with redirect
    saveAndToggle = (rtype, ischangesavl, evt) => {
        if(evt){
            evt.preventDefault();
        }

        if(this.state.isChangesAvailable){
            this.saveCategoryObj(false, null, false, null, null, true, rtype, evt);
            // this.props.toggleSummary(rtype, this.state.isChangesAvailable, evt);
        } else{
            this.props.toggleSummary(rtype, this.state.isChangesAvailable, evt);
        }
    }

    //sub cat data panel data
    updateSubCatDataPanel = (datalist, isloading) => {
        this.setState({ subCatDataPanelData: datalist, isDataPanelLoading: isloading });
    }
    //update chart dates with confirm if updates available
    updateProductDateRanges = (savefilterobj, chartDates) => {
        if(this.state.isChangesAvailable){
            this.props.notsaveConfirm((iscontinue) => {
                if(iscontinue){
                    this.props.resetUpdatesAvailable(true);
                    this.props.updateProductDateRanges(savefilterobj, chartDates);
                }
            });
        } else{
            this.props.updateProductDateRanges(savefilterobj, chartDates);
        }
    }

    render() {
        let sumtype = this.props.summaryViewType;
        // let saveobj = this.state.defSaveObj;
        //let curcat = this.state.selectedCatgory;
        
        let curcatrect = this.state.selectedCatRect;
        let iscatrulebased = (curcatrect?curcatrect.type === catRectEnums.rule:false);

        let isdep = this.state.isDeptView;
        
        let deptid = (this.state.defSaveObj && this.state.defSaveObj.department?this.state.defSaveObj.department.department_id:-1);
        let catid = (curcatrect?curcatrect.id:-1);
        
        //get rule id
        let catruleid = (iscatrulebased?getNameorIdorColorofBox(curcatrect, "num"):-1)
        //check rule type and assign rule id
        let catbrandruleid = (iscatrulebased && curcatrect.rule.level === catRuleEnums.brand?catruleid:-1);
        let catsubcatruleid = (iscatrulebased && curcatrect.rule.level === catRuleEnums.subcat?catruleid:-1);
        let catsupruleid = (iscatrulebased && curcatrect.rule.level === catRuleEnums.sup?catruleid:-1);
        
        return (<>
            <React.Fragment>
                <Prompt when={this.state.isChangesAvailable}
                message={this.props.t('CHANGE_NOTBE_SAVED')} />
            </React.Fragment>

            <Col xs={12} dir={this.props.isRTL}>
                
                <Row className='topcontent-main' style={this.props.isRTL === "rtl"?{width: "100%", marginRight: "0px"}:{width: "100%", marginLeft: "0px"}}>
                    
                    {this.state.isLoadDrules && catid !== -1 && this.props.drulesEnabled === true && !this.state.isDataPanelLoading?
                        <DataRuleContent 
                            isRTL={this.props.isRTL}
                            isonetimeload={this.state.isonetimeload} 
                            issupbased={iscatrulebased} 
                            brandid={catbrandruleid}
                            supplierid={catsupruleid}
                            scatid={catsubcatruleid}
                            isDataPanelLoading={this.state.isDataPanelLoading}
                            subCatDataPanelData={this.state.subCatDataPanelData}
                            noticeImgUrl={this.props.noticeImgUrl}
                            viewtype="scat" 
                            defSaveObj={this.state.defSaveObj}
                            deptid={deptid} 
                            deptsettings={this.props.deptsettings}
                            dataRuleSelectedTab={this.props.dataRuleSelectedTab}
                            catid={(catid !== -1 && !iscatrulebased?curcatrect.category.category_id:-1)}
                            type={(curcatrect?curcatrect.type:catRectEnums.default)}
                            selectedCatgory={this.state.selectedCatRect}
                            selectedCatRect={this.state.selectedCatRect}
                            ruleobj={this.state.selectedRuleObj}
                            ruleIdList={this.state.ruleIdList}
                            parentSaveObj={this.props.defSaveObj}
                            changeChartFilterDates={this.props.changeChartFilterDates}
                            changeDataRuleActiveTab={this.props.changeDataRuleActiveTab}
                            chartFilterDates={this.props.chartFilterDates}
                            getNoticeImageForWatch={this.props.getNoticeImageForWatch}
                            updateProductDateRanges={this.updateProductDateRanges}
                            dRulesreload={this.props.dRulesreload}
                            toggleLoadingModal={this.props.toggleLoadingModal}
                            updatedeptobj={this.props.updatedeptobj}
                            />
                    :<>
                        <Col className="bottom-single datarule-wrapper" xs={12} lg={3} style={this.props.isRTL === "rtl"?{paddingRight:"0px"}:{paddingLeft:"0px"}}>
                            <Col className='sub-content sub-wrapper datarule-content'>
                                <div className='loading-icon' style={{marginTop: "30%"}}><img className='loader-gif' src={loaderanime} alt="loader"/></div>
                            </Col>
                        </Col>
                    </>}

                    <Col xs={12} lg={9} className="drawingmain-content">
                        <Breadcrumb dir="ltr" className={'draw-breadscrub'+(this.state.cutBoxList && this.state.cutBoxList.length > 0?" margin":"")}>
                            {this.props.isRTL==="rtl"?<>
                            <Breadcrumb.Item active>{this.props.t('sub_categories')}</Breadcrumb.Item>
                            <li className={"breadcrumb-item"+(curcatrect && curcatrect.type === catRectEnums.rule?" sup-based":"")}><Link to="#" onClick={(e) => this.saveAndToggle("cat", this.state.isChangesAvailable, e)} role="button">
                                <TooltipWrapper text={curcatrect?getNameorIdorColorofBox(curcatrect, "name"):"-"}>
                                    <span>{curcatrect?(getNameorIdorColorofBox(curcatrect, "name").substring(0,12)+" "+(getNameorIdorColorofBox(curcatrect, "name").length > 12?"..":"")):"-"}</span>
                                </TooltipWrapper>
                            </Link></li>
                            </>:<>
                            <li className={"breadcrumb-item"+(curcatrect && curcatrect.type === catRectEnums.rule?" sup-based":"")}><Link to="#" onClick={(e) => this.saveAndToggle("cat", this.state.isChangesAvailable, e)} role="button">
                                <TooltipWrapper text={curcatrect?getNameorIdorColorofBox(curcatrect, "name"):"-"}>
                                    <span>{curcatrect?((getNameorIdorColorofBox(curcatrect, "name").substring(0,12)+" "+(getNameorIdorColorofBox(curcatrect, "name").length > 12?"..":""))):"-"}</span>
                                </TooltipWrapper>
                            </Link></li>
                            <Breadcrumb.Item active>{this.props.t('sub_categories')}</Breadcrumb.Item>
                            </>}
                        </Breadcrumb>

                        <Col className='topview-navigatelinks'>
                            <Col id='navcatscroll-wrapper' className="topnav-wrapper">
                                {/* <ul className='list-inline'>
                                    {saveobj && saveobj.categories && saveobj.categories.length > 0?<>
                                        {saveobj.categories.map((zitem, zidx) => {
                                            return <React.Fragment key={zidx}>
                                                {zitem && zitem.rects?<>
                                                    {zitem.rects.map((xitem, xidx) => {
                                                        return <React.Fragment key={xidx}>{!xitem.isDelete?
                                                            <li className={'list-inline-item'+((curcatrect && xitem.id === curcatrect.id)?" active":"")+(xitem.type === catRectEnums.rule?" sup-item":'')} 
                                                            title={curcatrect?getNameorIdorColorofBox(xitem, "name"):"-"} 
                                                            onClick={() => ((curcatrect && xitem.id === curcatrect.id)?null:this.saveCategoryObj(false, null, true, zitem, xitem)) }>
                                                                
                                                                {(getNameorIdorColorofBox(xitem, "name").substring(0,10)+(getNameorIdorColorofBox(xitem, "name").length>10?"..":""))}

                                                            </li>:<></>}</React.Fragment>;
                                                    })}
                                                </>:<></>}            
                                            </React.Fragment>;
                                        })}
                                    </>:<></>}
                                </ul> */}

                                {this.state.isLoadDrules && this.state.showNavigationView && this.props.chartEnabled===true?
                                    <MpSliderContent 
                                        defSaveObj={this.state.defSaveObj}
                                        deptid={deptid}  
                                        isRTL={this.props.isRTL}
                                        isRulesDeleted={false}
                                        summaryViewType={"cat"} 
                                        isnavview={true}
                                        selectedCatRect={this.state.selectedCatRect}
                                        redirectToCategory={this.props.redirectToCategory} 
                                        ruleIdList={this.state.ruleIdList}
                                        chartFilterDates={this.props.chartFilterDates}
                                        sliderIndex = {this.props.sliderIndex}
                                        saveCategoryObj = {this.saveCategoryObj}
                                        />
                                :<></>}


                            </Col>
                        </Col>

                        <Col className='MPDrawing'>
                            {this.state.selectedCatRect?
                            <MPDrawing 
                                showResolutionCount={this.state.showResolutionCount}
                                selectedDraw={this.state.selectedDraw} 
                                isEnableDraw={this.state.isEnableDraw} 
                                isAUIDisabled={this.props.isAUIDisabled}
                                perContentWidth={this.state.perContentWidth}
                                activeTool={this.state.activeTool} 
                                activeDrawType={this.state.activeDrawType}
                                actype={this.state.activeDrawType} 
                                selectedCategory={this.state.selectedCatgory} 
                                selectedCatRect={this.state.selectedCatRect}
                                rectsets={this.state.selectedCatRect?this.state.selectedCatRect.sub_categories:[]} 
                                historyData={this.state.historyData}
                                isRTL={this.props.isRTL} 
                                t={this.props.t} 
                                cutBoxList={this.state.cutBoxList}
                                updateCutList={this.updateCutList}
                                setRects={this.setRects} 
                                isReloadingItems={this.state.isReloadingItems}
                                handleUndoRedo={this.handleUndoRedo}
                                changeTool={this.changeTool} 
                                changeDrawType={this.changeDrawType}
                                updateDivDetails={this.updateDivDetails} 
                                saveCategoryObj={this.saveCategoryObj}
                                warningRedirect={this.props.warningRedirect}
                                />
                            :<></>}
                        </Col>
                    </Col>
                </Row>

                <Row className="bottomcontent-main">
                    <Col className="bottom-single purple-bg">
                        <Col className='sub-content sub-wrapper'>
                            <Row>
                                <Col xs={12}>
                                    
                                    <ul className='list-inline top-navigatelist'>
                                        <li onClick={() => this.toggleDeptView(true)} className={'list-inline-item content-switch'+(isdep?" active":"")}>{this.props.t("dep_rules")}</li>
                                        <li onClick={() => this.saveAndToggle("cat", this.state.isChangesAvailable)} className={'list-inline-item content-switch'}>{this.props.t("category")}</li>
                                        <li onClick={() => this.toggleDeptView(false)} className={'list-inline-item content-switch'+(!isdep && sumtype === "scat"?" active":"")}>{this.props.t("sub_category")}</li>
                                        <li className={'list-inline-item content-switch disabled'} style={this.props.isRTL === "rtl"?{marginLeft:"20px"}:{marginRight:"20px"}}>{this.props.t("brand")}</li>
                                        
                                        {/* <li className='list-inline-item'><Button variant='outline-warning' size="sm">{this.props.t("products")}</Button></li> */}
                                        <li className='list-inline-item'><Button variant='success' onClick={() => this.saveCategoryObj()} size="sm">{this.props.t("btnnames.save")}</Button></li>
                                    </ul>

                                    <h3 className='main-title'>
                                        {this.props.t("edit_subcategories")}
                                        {this.props.bottomFieldCount > 0?<><small className='fieldcount-txt'><label>{this.props.bottomFieldCount}</label> {this.props.t("fields")}</small></>:<></>}
                                    </h3>
                                </Col>
                                
                                <Col className='dark-wrapper'>
                                    {this.state.isDeptView?
                                        <MPDeptMetaForm 
                                            ismodalview={false} 
                                            isRTL={this.props.isRTL}
                                            isneeddeptsettingvalid={this.props.isneeddeptsettingvalid}
                                            isAUIDisabled={this.props.isAUIDisabled}
                                            chartFilterDates={this.props.chartFilterDates}
                                            defSaveObj={this.state.defSaveObj}
                                            deptsettings={this.props.deptsettings}
                                            isdepdataloaded={this.props.isdepdataloaded}
                                            isdeptupdateavailable={this.props.isdeptupdateavailable}
                                            updatedeptobj={this.props.updatedeptobj} 
                                            toggleDeptView={this.toggleDeptView} 
                                            dRulesreload={this.props.dRulesreload}
                                            updateSavefromChild={this.props.updateSavefromChild}
                                            signedDetails={this.props.signState?this.props.signState.signinDetails:null}
                                            />
                                    :
                                        <Row>
                                            {this.state.isSupplierView?<>
                                                <MPRulesAdd 
                                                    viewtype="scat"
                                                    defSaveObj={this.state.defSaveObj}
                                                    loadedSuppliersList={this.state.loadedSuppliersList} selectSupplierList={this.state.selectSupplierList}
                                                    loadedSubCatList={this.state.loadedSubCatList} selectSubCatList={this.state.selectSubCatList}
                                                    loadedBrandsList={this.state.loadedBrandsList} selectBrandsList={this.state.selectBrandsList}
                                                    loadDunitList={this.state.loadDunitList}
                                                    selectedDraw={this.state.selectedDraw}

                                                    selectedCategory={this.state.selectedCatgory}
                                                    selectedCatRect={this.state.selectedCatRect}
                                                    
                                                    clearDataCaches={this.props.clearDataCaches}
                                                    handleSelectDraw={this.handleSelectDraw}
                                                    toggleSupplierView={this.toggleSupplierView}
                                                    updateFromChild={this.setRects}
                                                    t={this.props.t} isRTL={this.props.isRTL}
                                                    />
                                            </>:<>
                                                <Col>
                                                    <Col className='title-withline'>
                                                        <h5>{this.props.t("sub_categories")}</h5>
                                                        <div className='text-line' style={{width:(this.state.showResolutionCount === 4?"80%":"65%")}}></div>
                                                    </Col>
                                
                                                    <ul className='newcats-list list-inline'>
                                                        {curcatrect && curcatrect.sub_categories?<>
                                                            {curcatrect.sub_categories.map((xitem, xidx) => {
                                                                let scatrectcolor = (getNameorIdorColorofBox(xitem, "color")?getNameorIdorColorofBox(xitem, "color"):"#F39C12");
                                                                let scattxtcolor = (checkColorIsLight(scatrectcolor)?"#5128a0":"white");
                                                                let cdrawitm = this.state.selectedDraw;
                                                                let isscatsupbased = (xitem.type === catRectEnums.rule);

                                                                return <React.Fragment key={xidx}>{!xitem.isDelete && !isscatsupbased?<li className={'newcats-item list-inline-item'+
                                                                (cdrawitm && cdrawitm.id === xitem.id?" active":"")} title={xitem.sub_category.subCategoryName}>
                                                                    <span className="remove-icon" onClick={()=>this.handleremoveSubCategory(xitem,xidx)}><XIcon size={12} /></span>
                                                                    <span className="remove-icon" onClick={()=>this.saveCategoryObj(true,xitem)} style={this.props.isRTL === "rtl"?{marginRight:"28px"}:{marginLeft:"28px"}}><CopyIcon size={12} /></span>
                                                                    <Col className="sub-content" onClick={() => (this.props.isAUIDisabled === true?this.saveCategoryObj(true,xitem):this.handleSelectDraw(xitem))} style={{background: scatrectcolor, borderColor: scatrectcolor, color: scattxtcolor}}>
                                                                        <h6>{(xitem.sub_category.subCategoryName.substring(0,10)+(xitem.sub_category.subCategoryName.length>10?"..":""))}</h6>
                                                                    </Col>
                                                                </li>:<></>}</React.Fragment>;
                                                            })}
                                                        </>:<></>}
                                
                                                        <li className='newcats-item list-inline-item'>
                                                            <Dropdown drop='up' onToggle={e => this.handleDropOpen(e,false)}>
                                                                <Dropdown.Toggle variant="default">
                                                                    <Col className="sub-content add"><PlusIcon size={14} /></Col>
                                                                </Dropdown.Toggle>
                                
                                                                <Dropdown.Menu className={"newcat-drop subcat-drop"}>
                                                                    <Col style={{padding:"0px 15px"}}>
                                                                        <label>{this.props.t("selectasubcategory")}</label>
                                                                        {/* <FormSelect id="newcat-select" size="sm">
                                                                            {this.state.loadedSubCategoryList.map((xitem,xidx) => {
                                                                                return <option key={xidx} value={xitem.subCategoryId}>{xitem.subCategoryName}</option>
                                                                            })}
                                                                        </FormSelect> */}
                                                                        <Select options={this.state.selectSubCategoryList}  
                                                                        onChange={(e) => this.handleChangeSubCat(e)}
                                                                        value={this.state.defaultSelectSubCat}
                                                                        className="filter-searchselect" classNamePrefix="searchselect-inner" 
                                                                        components={{ IndicatorSeparator: () => null }} maxMenuHeight={120} required />
                                                                    </Col>
                                                                    <Dropdown.Item href="#">
                                                                        <Button variant="success" onClick={e => this.addNewSubCategory(e)} size="sm">{this.props.t("btnnames.save")}</Button>
                                                                    </Dropdown.Item>
                                                                </Dropdown.Menu>
                                                            </Dropdown>
                                                        </li>
                                                    </ul> 
                                
                                                    <Col className='title-withline'>
                                                        <h5>{this.props.t("subcat_rules")}</h5>
                                                        <div className='text-line' style={{width:(this.state.showResolutionCount === 4?"75%":"60%")}}></div>
                                                    </Col>
                                
                                                    <ul className='newcats-list list-inline'>
                                                        {curcatrect && curcatrect.sub_categories?<>
                                                            {curcatrect.sub_categories.map((xitem, xidx) => {
                                                                let scatrectcolor = (getNameorIdorColorofBox(xitem, "color")?getNameorIdorColorofBox(xitem, "color"):"#F39C12");
                                                                let cdrawitm = this.state.selectedDraw;
                                                                let isscatsupbased = (xitem.type === catRectEnums.rule);

                                                                return <React.Fragment key={xidx}>{!xitem.isDelete && isscatsupbased?<li className={'newcats-item list-inline-item'+
                                                                (cdrawitm && cdrawitm.id === xitem.id?" active":"")} title={getNameorIdorColorofBox(xitem,"name")}>
                                                                    <span className="remove-icon" onClick={()=>this.handleremoveSubCategory(xitem,xidx)}><XIcon size={12} /></span>
                                                                    <span className="remove-icon" onClick={()=>this.saveCategoryObj(true,xitem)} style={this.props.isRTL === "rtl"?{marginRight:"28px"}:{marginLeft:"28px"}}><CopyIcon size={12} /></span>
                                                                    <Col className="sub-content sup-based" onClick={() => this.handleSelectDraw(xitem)} style={{borderColor: scatrectcolor, color: scatrectcolor}}>
                                                                        <h6>{(getNameorIdorColorofBox(xitem,"name").substring(0,10)+(getNameorIdorColorofBox(xitem,"name").length>10?"..":""))}</h6>
                                                                    </Col>
                                                                </li>:<></>}</React.Fragment>;
                                                            })}
                                                        </>:<></>}

                                                        <li className='newcats-item list-inline-item'>
                                                            <Col className="sub-content add" onClick={this.toggleSupplierView}><h6><PlusIcon size={14} /></h6></Col>
                                                        </li>
                                                    </ul> 
                                
                                                </Col>
                                                <Col xs={12} md={this.state.showResolutionCount === 4?5:6} className="light-purple sub-cat-prg-bars">
                                                    {this.state.isPercentagesLoading?<div className='perloading-overlap'>
                                                        <img src={loaderanime} alt="" />
                                                    </div>:<></>}
                                                    
                                                    <Row>
                                                        <Col xs={(this.props.isAUIDisabled?6:4)} className="title-col" ref={this.perContentDiv}>{this.props.t("EDIT_PORTION")}</Col>
                                                        {!this.props.isAUIDisabled?<Col xs={2} className="title-col"></Col>:<></>}
                                                        <Col xs={2} className="title-col">{this.props.t("REC")}</Col>
                                                        <Col xs={2} className="title-col">{this.props.t("NOW")}</Col>
                                                        <Col xs={2} className="title-col">{this.props.t("PROD_QTY")}</Col>
                                                    </Row>    
                                                    
                                                    <Row className="scroll-content">
                                                    {this.state.loadedSubCatPercentages?<>
                                                        {this.state.loadedSubCatPercentages.map((xitem, xidx) => {
                                                            /* let csubnametxt = (xitem.rule?(getNameorIdorColorofBox(xitem, "name").substring(0,15) + (getNameorIdorColorofBox(xitem, "name").length > 15?"..":""))
                                                            :(xitem.subCategoryName.substring(0,15)+(xitem.subCategoryName.length > 15?"..":""))); */
                                                            let cfullnametxt = (xitem.name?xitem.name:"-");
                                                            let csubnametxt = (cfullnametxt?cfullnametxt:"-");
                                                            let cscatcolor = (xitem.color?xitem.color:"#dc3545");
                                                            let cscattxtcolor = (checkColorIsLight(cscatcolor)?(this.props.dmode?"#29b485":"#5128a0"):xitem.isRule?cscatcolor:"white");

                                                            if(xitem.isRule){
                                                                //csubnametxt = ((csubnametxt.substring(0, (Math.floor(this.state.perContentWidth / 9)))+(csubnametxt.length > (Math.floor(this.state.perContentWidth / 9))?"..":"")) +" - "+(xitem.ruleLevel?xitem.ruleLevel.substring(0,3):"-").toUpperCase())
                                                                csubnametxt = (this.props.isRTL === "rtl"?((xitem.ruleLevel?xitem.ruleLevel.substring(0,3):"-").toUpperCase()+" - "+csubnametxt):(csubnametxt+" - "+(xitem.ruleLevel?xitem.ruleLevel.substring(0,3):"-").toUpperCase()));
                                                            } else{
                                                                //csubnametxt = (csubnametxt.substring(0, (Math.floor(this.state.perContentWidth / 7)))+(csubnametxt.length > (Math.floor(this.state.perContentWidth / 7))?"..":""));
                                                            }

                                                            return <React.Fragment key={xidx}>
                                                                <Col xs={(this.props.isAUIDisabled?6:4)} className={"percentage-title"+(xitem.isRule?" ruletxt":"")} style={{padding:(this.props.isAUIDisabled?"0px 5px":"0px"),paddingLeft:20,position:"relative"}}>
                                                                    {xitem.isRule?<span className="rule-flag" style={{color: "#dc3545"}}><BookmarkFillIcon size={14} /></span>:<></>}
                                                                    <CustomProgressBar showtooltip={true} fulltext={csubnametxt} text={csubnametxt} mainbarcolor={cscatcolor} isborder={xitem.isRule} mainbarpercentage={xitem.percentage} textcolor={cscattxtcolor} showsubbar="true" subbarpercentage={xitem.suggestedPercentage} />
                                                                </Col>
                                                                <Col xs={2} className="val-col aui-disable links">
                                                                    <ButtonGroup>
                                                                        <Dropdown className='aui-disable' drop='up' align={"end"} onClick={e => this.redirectList(e, xitem, true)}>
                                                                            <Dropdown.Toggle variant="primary" size='sm' title={this.props.t("enable_draw")}>
                                                                                <FeatherIcon icon="layout" size={12} />
                                                                            </Dropdown.Toggle>

                                                                            <Dropdown.Menu className={this.state.percentageDropList && this.state.percentageDropList.length <= 1?"d-none":""}>
                                                                                {this.state.percentageDropList.map((zitem, zidx) => {
                                                                                    let ispersupbased = (zitem.type === catRectEnums.rule);
                                                                                    return <Dropdown.Item key={zidx} href="#" onClick={() => this.handleSelectDraw(zitem) } className={ispersupbased?'sup-based':''}>
                                                                                        {getNameorIdorColorofBox(zitem,"name").substring(0,15)+(getNameorIdorColorofBox(zitem,"name").length>15?"..":"")}    
                                                                                    </Dropdown.Item>;
                                                                                })}
                                                                            </Dropdown.Menu>
                                                                        </Dropdown>
                                                                        <Dropdown drop='up' align={"end"} onClick={e => this.redirectList(e, xitem)}>
                                                                            <Dropdown.Toggle variant="primary" size='sm' title={this.props.t("open_brand")}>
                                                                                <FeatherIcon icon="copy" size={12} />
                                                                            </Dropdown.Toggle>

                                                                            <Dropdown.Menu className={this.state.percentageDropList && this.state.percentageDropList.length <= 1?"d-none":""}>
                                                                                {this.state.percentageDropList.map((zitem, zidx) => {
                                                                                    let ispersupbased = (zitem.type === catRectEnums.rule);
                                                                                    return <Dropdown.Item key={zidx} href="#" onClick={() => this.saveCategoryObj(true,zitem) } className={ispersupbased?'sup-based':''}>
                                                                                        {getNameorIdorColorofBox(zitem,"name").substring(0,15)+(getNameorIdorColorofBox(zitem,"name").length>15?"..":"")}   
                                                                                    </Dropdown.Item>;
                                                                                })}
                                                                            </Dropdown.Menu>
                                                                        </Dropdown>
                                                                    </ButtonGroup>
                                                                </Col>
                                                                <Col xs={2} className="val-col light">{xitem.suggestedPercentage?xitem.suggestedPercentage:0}%</Col>
                                                                <Col xs={2} className="val-col">{xitem.percentage?xitem.percentage:0}%</Col>
                                                                <Col xs={2} className="normal-text-opacity">{xitem.productQty?xitem.productQty:0}</Col>
                                                            </React.Fragment>;
                                                        })}
                                                    </>:<></>}                  
                                                    </Row> 
                                                </Col>  
                                            </>}  
                                        </Row>
                                    }
                                </Col>
                            </Row>
                        </Col>
                    </Col>

                    <Col className="bottom-single slider-content" xs={12} lg={5} style={this.props.isRTL === "rtl"?{paddingRight:"0px"}:{paddingLeft:"0px"}}>
                        <Col className='sub-content sub-wrapper' style={{padding:"15px 35px",paddingBottom: "0px"}}>
                            {this.state.isLoadDrules && this.state.showNavigationView && this.props.chartEnabled===true?
                                <MpSliderContent 
                                    defSaveObj={this.state.defSaveObj}
                                    deptid={deptid}  
                                    isRTL={this.props.isRTL}
                                    isRulesDeleted={this.state.isRulesDeleted}
                                    summaryViewType={this.props.summaryViewType} 
                                    redirectToCategory={this.props.redirectToCategory} 
                                    selectedCatgory={this.state.selectedCatRect}
                                    selectedCatRect={this.state.selectedCatRect}
                                    type={(curcatrect?curcatrect.type:catRectEnums.default)}
                                    ruleobj={this.state.selectedRuleObj}
                                    ruleIdList={this.state.ruleIdList}
                                    chartFilterDates={this.props.chartFilterDates}
                                    sliderIndex = {this.props.sliderIndex}
                                    saveCategoryObj = {this.saveCategoryObj}
                                    updateSubCatDataPanel={this.updateSubCatDataPanel}
                                    />
                            :<></>}
                        </Col>
                    </Col>
                </Row>

            </Col>

            <AcViewModal showmodal={this.state.isShowLoadingModal} />
        </>);
    }
}

const mapStateToProps = state => ({
    ...state
});

const mapDispatchToProps = dispatch => ({
    setMasterPlanAction: (payload) => dispatch(selectedMasterPlanSetAction(payload)),
    setMPCategoryAction: (payload) => dispatch(selectedMPCategorySetAction(payload)),
    setMPCategoryRectAction: (payload) => dispatch(selectedMPCategoryRectSetAction(payload)),
    setMPSubCatAction: (payload) => dispatch(selectedMPSubCatSetAction(payload)),
    setNewProdCountCat: (payload) => dispatch(setNewProdCountCatAction(payload)),
    setNewProdCountSubCat: (payload) => dispatch(setNewProdCountSubCatAction(payload))
});

export default withTranslation()(withRouter(connect(mapStateToProps,mapDispatchToProps)(SubcatContent)));