import React, { Component } from 'react';
import { Col, Button, Row, ButtonGroup, Dropdown } from 'react-bootstrap';
import { withTranslation } from 'react-i18next';
import { withRouter, Prompt } from 'react-router-dom';
import { PlusIcon, XIcon, BookmarkFillIcon, ThreeBarsIcon, PencilIcon } from '@primer/octicons-react';
import { connect } from 'react-redux';
import { v4 as uuidv4 } from 'uuid'; //unique id
import FeatherIcon from 'feather-icons-react';
import Select from 'react-select';

import { selectedMasterPlanSetAction, selectedMPCategorySetAction, selectedMPCategoryRectSetAction, setNewProdCountCatAction, setNewProdCountSubCatAction } from '../../../../actions/masterPlanogram/masterplanogram_action';

import { alertService } from '../../../../_services/alert.service';
import { submitCollection } from '../../../../_services/submit.service';
import { submitSets } from '../../../UiComponents/SubmitSets';
// import { AcViewModal } from '../../../UiComponents/AcImports';
import { catRectEnums, catRuleEnums } from '../../../../enums/masterPlanogramEnums';

import MPDeptMetaForm from '../../departmentview/deptquestions/formcontainer';
import CatDrawing from './CatDrawing/CatDrawing';
import MPselectcategory from './addcategorymodal/addcatmodal';
import DataRuleContent from '../DataRulesContent/druleContent';
import MpSliderContent from '../sliderContent';
import MPRulesAdd from '../rulesadd/rulesadd';

import { CalculateRatio, checkColorIsLight, measureConverter, roundOffDecimal } from '../../../../_services/common.service';
import { convertWidthPercent, findHeightFromShelves, saveObjDataConvert, getNameorIdorColorofBox, validateDeptSettings, findResolutionType } from '../../AddMethods';
import { confirmAlert } from 'react-confirm-alert';
import CustomProgressBar from '../../../common_layouts/customProgressBar';

import loaderanime from '../../../../assets/img/loading-sm.gif';

export class CategoryContent extends Component {
    constructor(props){
        super(props);

        this._isMounted = false;
        this._loadingTimeout = null;
        this.buttonRefUpdDepRule = React.createRef();
        this.perContentDiv = React.createRef();
        
        this.state = {
            
            defSaveObj: null, isUpdatesAvailable: false, isLoadDrules: false, ruleIdList: [],
            isCardsShow: false, 
            isaddcatmodal: false, showcatiteminmodal: null,
            isupdatecategory: false, updateCategoryObj: null, updateCatIdx: {idx: 0, recidx: 0}, 
            //
            loadedSuppliersList: [], selectSupplierList: [],
            loadedSubCatList: [], selectSubCatList: [],
            loadedBrandsList: [], selectBrandsList: [],
            
            loadDunitList:[], 
            loadedCategoryList: [], selectCategoryList: [], defaultSelectCat: null,
            percentagesLoadQueque: [], isPercentagesLoading: false,
            loadedCatPercentages: [], bkpCatPercentages: [], totalPercentage: 0, isRulesDeleted: false,
            isallsimulatemodal:false,
            openOneCategory:false,
            //history points
            historyData: { past: [], present: 0, future: [] },
            //new category add
            fieldStartIdx: 0, fieldMaxResults: 12, fieldTotalCount: 0,
            singleFieldWidth: 300, singleFieldHeight: 285, minWidthCheckValue: 160, oldCatLength: 0,
            showResolutionCount: 1,
            haveChnagesinCat:false,
            percentageDropList: [],
            //suppliers add
            isSupplierView: false, 
            
            isDeptView: false, isonetimeload: true,
            //categories draw
            isDrawEnabled: false, selectedDrawCategory: null,

            catDataPanelData: [], isDataPanelLoading: true,

            perContentWidth: 0,
        }
    }

    componentDidMount() {
        this._isMounted = true;

        if (this._isMounted) {
            //console.log(this.props.masterPlanogramState);
            
            let crescount = findResolutionType(1);
            this.setState({ 
                singleFieldWidth: (crescount === 4?500:300),
                singleFieldHeight: (crescount === 4?530:crescount === 3?240:crescount > 1?335:285),
                showResolutionCount: crescount,
                perContentWidth: (this.perContentDiv.current && this.perContentDiv.current.offsetWidth?(this.perContentDiv.current.offsetWidth - 25):0)
            }, () => {
                if(this.props.masterPlanogramState && this.props.masterPlanogramState.mpDetails){
                    this.props.toggleLoadingModal(true, () => {
                        this.setState({ defSaveObj: this.props.masterPlanogramState.mpDetails },() => {

                            if(this.state.defSaveObj && this.state.defSaveObj.mp_id > -2){
                                //master data load
                                this.getDunits(); //all display units for categories field add modal

                                //get all categories list
                                this.getcategoriescall();
                                //for rule based add
                                this.getAllSubCategories();
                                this.getAllBrands();
                                this.getAllSuppliers();

                                if(this.props.isneeddeptsettingvalid){
                                    this.toggleDeptView(true, true);
                                }

                                setTimeout(() => {
                                    this.setState({ isonetimeload: false });
                                }, 200);    
                            } else{
                                this.props.toggleLoadingModal(false);

                                if(this.props.isneeddeptsettingvalid){
                                    this.toggleDeptView(true, true);
                                }
                            }
                        });
                    })
                    
                }  
            });
        }
    }

    componentWillUnmount(){
        this._isMounted = false;
        clearTimeout(this._loadingTimeout);
    }

    componentDidUpdate = () => {
        //shows warning changes available when reload page
        /* if (this.state.isUpdatesAvailable) {
          window.onbeforeunload = () => false
        } else {
          window.onbeforeunload = undefined
        } */
    }

    //#MP-CAT-01 get categories for department call
    getcategoriescall=()=>{
        var cdefSaveObj=this.state.defSaveObj
        var ccategories=[]
        //call for back and set reponse of back call to ccategories
        var extra = this.props.masterPlanogramState.mpDetails.categories;
        if(extra.length>0){
            ccategories = extra;
        }
        cdefSaveObj.categories = ccategories;

        let availablecatitems = cdefSaveObj.categories.filter(x => !x.isDelete && !x.is_unallocated_view);

        this.setState({defSaveObj:cdefSaveObj, oldCatLength: availablecatitems.length},()=>{
            this.getAllCategories(cdefSaveObj.department.department_id);
            this.checkSaveDetailsLoad();
            // console.log(this.state.defSaveObj);
        })
    }
    //onload change need to load mp details
    checkSaveDetailsLoad = () => {
        if(this.props.masterPlanogramState && this.props.masterPlanogramState.mpDetails){
            let csaveobj = this.props.masterPlanogramState.mpDetails;
            //console.log(csaveobj);
            if(csaveobj.mp_id > -1){
                this.setState({ defSaveObj: csaveobj }, () => {
                    this.compareCategoryData(this.state.loadedCatPercentages, true, false, null, true);
                });
            } else{
                this.loadMPDetails(false, csaveobj);
            }
        }
    }
    //load all suppliers
    getAllSuppliers = () => {
        var cdefSaveObj = this.state.defSaveObj;

        let csobj={ 
            departmentId: (cdefSaveObj?cdefSaveObj.department.department_id:-1),
            isRuleBased: false, 
            categoryId: 0, 
            mpRuleId: 0 
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
    //load all sub categories of selected category
    getAllSubCategories = () => {
        var cdefSaveObj = this.state.defSaveObj;

        let svobj = { 
            departmentId: cdefSaveObj.department.department_id
        };

        submitSets(submitCollection.mpSubCategoryList, svobj).then(res => {
            
            if(res && res.status && res.extra){
                let selectscatlist = (res.extra.length > 0?res.extra.map((xitem, xidx) => {
                    return {value: xidx, label: xitem.subCategoryName};
                }):[])

                this.setState({ loadedSubCatList: res.extra, selectSubCatList: selectscatlist });
            }
        });
    }
    //load all brands of selected sub category
    getAllBrands = () => {
        var cdefSaveObj = this.state.defSaveObj;

        let svobj = { 
            departmentId: cdefSaveObj.department.department_id
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
    }
    //display unit load more items
    loadMoreDunits = () => {
        this.setState({ fieldStartIdx: (this.state.fieldStartIdx + this.state.fieldMaxResults) }, () => {
            this.getDunits();
        });
    }
    //load all categories of selected department
    getAllCategories = (deptid) => {
        let svobj = { chainHasDepartmentId: deptid };

        submitSets(submitCollection.mpCategoryList, svobj).then(res => {
            //console.log(res);

            if(res && res.status && res.extra){
                let selectcatlist = (res.extra.length > 0?res.extra.map((xitem, xidx) => {
                    return {
                        value: xidx, 
                        label: xitem.categoryName,
                        obj: xitem
                    };
                }):[])

                this.setState({ loadedCategoryList: res.extra, selectCategoryList: selectcatlist }, () => {
                    this.props.updateParentCatList(selectcatlist);
                });
            }
        });
    }
    //#MP-CAT-04 load all category percentages of selected department
    getCategoryPercentages = (deptid, ruleids, isruledeleted) => {
        this._loadingTimeout = setTimeout(() => {
            let mpid = (this.state.defSaveObj?this.state.defSaveObj.mp_id:-1);
            
            let svobj = { 
                mpId: mpid,
                chainHasDepartmentId: deptid,
                fromDate: this.props.chartFilterDates.fromdate,
                endDate: this.props.chartFilterDates.todate,
                mpRuleIds: ruleids,
                isDelete: this.state.isRulesDeleted,
            };
            
            if(!this.state.isPercentagesLoading){
                this.continuePercentageLoad(svobj);
            } else{
                this.setState({ percentagesLoadQueque: [svobj] });
            }
        }, 500);
    }
    //continue load category percentages
    continuePercentageLoad = (svobj) => {
        this.setState({ isPercentagesLoading: true }, () => {
            submitSets(submitCollection.mpCategoryPercentage, svobj).then(res => {
                //console.log(res);

                if(res && res.status && res.extra){
                    this.setState({ 
                        isPercentagesLoading: false, loadedCatPercentages: res.extra, ruleIdList: svobj.mpRuleIds, bkpCatPercentages: res.extra,
                    }, () => {
                        this.comparePercentagesData(false, 1);

                        this.getNewProdCountOfCatLevel(svobj);

                        //check percentages queque data available
                        if(this.state.percentagesLoadQueque && this.state.percentagesLoadQueque.length > 0){
                            let quequelist = JSON.parse(JSON.stringify(this.state.percentagesLoadQueque));
                            let firstquequeitem = quequelist[0];

                            this.setState({ percentagesLoadQueque: [] }, () => {
                                this.continuePercentageLoad(firstquequeitem);
                            });
                        }
                    });
                } else{
                    this.comparePercentagesData(false, 2);

                    this.getNewProdCountOfCatLevel(svobj);

                    this.setState({ isPercentagesLoading: false, percentagesLoadQueque: [] });
                }
            });    
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


    //#MP-CAT-05 compare added details with loaded percentages
    comparePercentagesData = (iscardsreload, callplace) => {
        let cdefSaveObj = JSON.parse(JSON.stringify(this.state.defSaveObj));
        let allpercentagedata = JSON.parse(JSON.stringify(this.state.bkpCatPercentages));

        //sort by rec per highest 
        allpercentagedata = allpercentagedata.sort((a, b) => (b.suggestedPercentage - a.suggestedPercentage));
        
        let totalper = 0;
        for (let i = 0; i < allpercentagedata.length; i++) {
            const categoryitem = allpercentagedata[i];
            
            let catfinditems = [];
            for (let j = 0; j < cdefSaveObj.categories.length; j++) {
                const catitem = cdefSaveObj.categories[j];
                
                if(!catitem.isDelete && !catitem.is_unallocated_view){
                    let filtercatitems = [];
                    for (let v = 0; v < catitem.rects.length; v++) {
                        const filterrectitem = catitem.rects[v];
                        //if default category or rule item find from category rect list
                        if(!filterrectitem.isDelete && (
                            (!categoryitem.isRule && filterrectitem.type === catRectEnums.default && filterrectitem.category.category_id === categoryitem.id) ||
                            (categoryitem.isRule && filterrectitem.type === catRectEnums.rule && filterrectitem.rule.level === categoryitem.ruleLevel && getNameorIdorColorofBox(filterrectitem, "num") === categoryitem.id)
                        )){
                            filterrectitem["parentidx"] = j;
                            filterrectitem["rectidx"] = v;
                            filterrectitem["isShelfCat"] = (catitem.field_obj && filterrectitem.contain_shelves && filterrectitem.contain_shelves.length !== catitem.field_obj.field_shelves.length);

                            filterrectitem.contain_shelves.forEach( contshelve => {
                                contshelve["category_id"] = catitem.id;
                            });

                            filtercatitems.push(filterrectitem);
                        }
                    }

                    catfinditems = catfinditems.concat(filtercatitems);
                }
            }
            //found same category added rect list
            if(catfinditems && catfinditems.length > 0){
                //get first item of that list - only one available
                let firstruleitem = catfinditems[0];
                categoryitem["catrect"] = firstruleitem;

                let pertotal = 0;
                for (let i = 0; i < catfinditems.length; i++) {
                    pertotal = (pertotal + catfinditems[i].percentage);
                }
                //console.log(catfinditems);
                if(pertotal > 0){
                    categoryitem["percentage"] = roundOffDecimal(pertotal,2);
                } else{
                    categoryitem["percentage"] = 0;
                }
            } else{
                categoryitem["percentage"] = 0;
            }
            
            totalper = (totalper + categoryitem.percentage);
        }
        // console.log(callplace, iscardsreload);

        this.setState({ loadedCatPercentages: allpercentagedata }, () => {
            this.props.toggleLoadingModal(false);
            this.removeSelectShelve();

            // if(iscardsreload === false){
                this.setState({ isCardsShow: false }, () => {
                    this.setState({ isCardsShow: true });
                });
            // }
        });
    }
    //manage changes history
    fieldHistoryAdd = (csobj, type) => {
        ///type=1 add item, type=2 delete item, type=3 move item
        //console.log(cutBoxList);
        var chobj = this.state.historyData;
        var phistry = (chobj.past?chobj.past:[]);
        phistry.push({ type:type, obj:csobj });

        chobj["present"] = 0;
        chobj["past"] = phistry; chobj["future"] = [];
        
        this.setState({ historyData: chobj, isUpdatesAvailable: true }, () => {
            this.props.updateSavefromChild(null, true);
        });
    }
    //undo changes hisory
    fieldHistoryUndo = () => {
        var chobj = this.state.historyData;
        var backidx = (chobj.present>0?(chobj.present - 1):(chobj.past.length - 1));
        var getsobj = chobj.past[backidx];
        
        var cfutureobj = { type:getsobj.type, obj:JSON.parse(JSON.stringify(this.state.defSaveObj)) };
        chobj.future.push(cfutureobj);
        chobj.past.splice(-1,1);

        let notdeletedcatlist = (getsobj.obj?getsobj.obj.categories.filter(x => !x.isDelete && !x.is_unallocated_view && x.field_obj):[]);
        let isUpdatesAvailable = (chobj.past.length === 0?false:this.state.isUpdatesAvailable);

        this.setState({ defSaveObj: null }, () => {
            this.props.updateSavefromChild(null, isUpdatesAvailable);
            this.setState({ defSaveObj: getsobj.obj, historyData: chobj, oldCatLength: notdeletedcatlist.length, 
                isUpdatesAvailable: isUpdatesAvailable 
            }, () => {
                clearTimeout(this._loadingTimeout);

                this.props.clearDataCaches("all"); //clear data cache
                
                this.compareCategoryData(this.state.loadedCatPercentages, false, false, null, true);
            });    
        });
    }
    //redo changes hisory
    fieldHistoryRedo = () => {
        var chobj = this.state.historyData;
        var backidx = (chobj.present>0?(chobj.present + 1):(chobj.future.length - 1));
        var getsobj = chobj.future[backidx];

        var cpastobj = { type:getsobj.type, obj:JSON.parse(JSON.stringify(this.state.defSaveObj)) };
        chobj.past.push(cpastobj);
        chobj.future.splice(-1,1);
        
        let notdeletedcatlist = (getsobj.obj?getsobj.obj.categories.filter(x => !x.isDelete && !x.is_unallocated_view && x.field_obj):[]);

        this.setState({ defSaveObj: null }, () => {
            this.setState({ defSaveObj: getsobj.obj, historyData: chobj, oldCatLength: notdeletedcatlist.length }, () => {
                clearTimeout(this._loadingTimeout);

                this.props.clearDataCaches("all"); //clear data cache

                this.compareCategoryData(this.state.loadedCatPercentages, false, false, null, true);
            });    
        });
    }
    //handle undo/redo
    handleUndoRedo = (urtype) => {
        if(urtype === "undo"){
            this.fieldHistoryUndo();
        } else{
            this.fieldHistoryRedo();
        }
    }
    //#MP-CAT-02 caterory list compare with added category list
    compareCategoryData = (loadeddata, isonload, isresize, catidx, isperload) => {
        let saveobj = this.state.defSaveObj;
        let notdeletedcatlist = saveobj.categories.filter(x => !x.isDelete && !x.is_unallocated_view && x.field_obj);
        
        // let oldcatlength = (this.state.oldCatLength > 0?this.state.oldCatLength:notdeletedcatlist.length);
        // let oldfieldwidth = (this.state.singleFieldWidth * oldcatlength)

        let totalfieldwidth = (this.state.singleFieldWidth * notdeletedcatlist.length);
        
        // let olditemper = roundOffDecimal(convertWidthPercent(this.state.singleFieldWidth,oldfieldwidth),2);
        let singleitemper = roundOffDecimal(convertWidthPercent(this.state.singleFieldWidth,totalfieldwidth),2);
        
        //calculate category box percentage
        let totalwidthper = 0; let unallocatedidx = -1;
        let highestfieldheight = null;
        //
        let lastnotdeletedidx = -1;

        let totalunallowwidth = 0; 
        let totalshelfcount = 0; let totalshelfwidth = 0;
        
        for (let l = 0; l < saveobj.categories.length; l++) {
            const catitem = saveobj.categories[l];
            
            if(!catitem.isDelete && catitem.field_obj && !catitem.is_unallocated_view){
                totalshelfcount += catitem.field_obj.field_shelves.length;
                
                let firstrectitem = catitem.rects[0];
                let firstrectwidth = firstrectitem.width;
                
                if(isonload && !firstrectitem.percentage){
                    firstrectwidth = convertWidthPercent(firstrectitem.box_width_percentage,totalfieldwidth,true);
                } else  if(!firstrectwidth){
                    let shelfpercentage = convertWidthPercent(catitem.field_obj.field_shelves.length,totalshelfcount);
                    let shelfwidth = convertWidthPercent(shelfpercentage,totalfieldwidth,true);

                    firstrectwidth = shelfwidth;
                }
                
                totalshelfwidth += (firstrectwidth * catitem.field_obj.field_shelves.length);
            }
        }
        
        saveobj["totalshelfcount"] = totalshelfcount;
        saveobj["totalshelfwidth"] = totalshelfwidth;

        for (let j = 0; j < saveobj.categories.length; j++) {
            const catitem = saveobj.categories[j];

            //find rules contains this category
            let findrulesavailable = false; let findrulecontains = []; let totalrulelength = 0;
            if(!catitem.isDelete && !catitem.is_unallocated_view){
                for (let i = 0; i < catitem.rects.length; i++) {
                    const rectitem = catitem.rects[i];
                    
                    if(!rectitem.isDelete){ // && rectitem.type === catRectEnums.rule && rectitem.rule.isShelfRule
                        findrulecontains.push(rectitem);
                        findrulesavailable = (findrulesavailable + 1);
                        totalrulelength = (totalrulelength + rectitem.contain_shelves.length);
                    }
                }

                lastnotdeletedidx = j;
            }

            if(catitem.is_unallocated_view){
                unallocatedidx = j;
            }
            
            if(!catitem.isDelete && catitem.field_obj){
                let addonetime = true;

                let shelfpercentage = convertWidthPercent(catitem.field_obj.field_shelves.length,totalshelfcount);
                let shelfwidth = convertWidthPercent(shelfpercentage,totalfieldwidth,true);

                for (let i = 0; i < catitem.rects.length; i++) {
                    const rectitem = catitem.rects[i];
                    
                    if(!rectitem.isDelete){
                        //if not deleted item list is more than 1 and percentage is not zero(new item) and
                        //percentage not equal new single item percentage
                        if(notdeletedcatlist.length > 1 && rectitem.box_width_percentage !== 0 && rectitem.box_width_percentage !== shelfpercentage){
                            // rectitem.box_width_percentage !== olditemper && 
                            //if width avalilable - refind percentage from earlier width
                            /* if(oldfieldwidth > 0 && rectitem.box_width_percentage > 0){
                                let findoldwidth = roundOffDecimal(convertWidthPercent(rectitem.box_width_percentage,oldfieldwidth,true),2);
                                
                                let refindper = roundOffDecimal(convertWidthPercent(findoldwidth,totalfieldwidth),2);
                                rectitem["box_width_percentage"] = refindper;
                            } */
                            
                            // rectitem["width"] = roundOffDecimal(convertWidthPercent(rectitem.box_width_percentage,totalfieldwidth,true),2);
                            if(isonload && !rectitem.isconverted){
                                rectitem.width = convertWidthPercent(rectitem.box_width_percentage,totalfieldwidth,true);
                                rectitem["isconverted"] = true;
                            }
                            
                            let newshelfpercentage = (rectitem.width && shelfwidth !== rectitem.width?convertWidthPercent(rectitem.width,totalfieldwidth):shelfpercentage);
                            // let newshelfpercentage = (rectitem.width && shelfwidth !== rectitem.width?shelfpercentage:rectitem.box_width_percentage);
                            
                            rectitem["width"] = convertWidthPercent(newshelfpercentage,totalfieldwidth,true);
                            rectitem["box_width_percentage"] = newshelfpercentage;
                            
                        } else{
                            // rectitem["box_width_percentage"] = shelfpercentage;
                            rectitem["box_width_percentage"] = singleitemper;
                            rectitem["width"] = this.state.singleFieldWidth;
                            // rectitem["width"] = shelfwidth;
                            //rectitem["percentage"] = shelfpercentage;
                        }
                        
                        rectitem["totalwidth"] = (rectitem.width * catitem.field_obj.field_shelves.length);

                        if(addonetime){
                            if(this.state.singleFieldWidth > rectitem.width){
                                let lowwidthgap = (this.state.singleFieldWidth - rectitem.width);
                                totalunallowwidth += (lowwidthgap * catitem.field_obj.field_shelves.length);
                            }

                            // totalwidthper = (totalwidthper + rectitem.box_width_percentage);
                            totalwidthper = (totalwidthper + rectitem.box_width_percentage);
                            addonetime = false;
                        }
                    }
                }
                
                if(!highestfieldheight || (highestfieldheight.field_height < catitem.field_obj.field_height)){
                    highestfieldheight = JSON.parse(JSON.stringify(catitem.field_obj));
                }

            }
        }
        // console.log(totalwidthper);

        saveobj["totalunallowwidth"] = totalunallowwidth;
        
        //if total width of cats more or less than 100 reduce width from current cat
        let roundtotalwidth = roundOffDecimal(totalwidthper,2);
        
        if(roundtotalwidth > 100){
            let getmorehunvalue = roundOffDecimal((roundtotalwidth - 100),2);
            let morehunwidth = convertWidthPercent(getmorehunvalue,totalfieldwidth,true);
            
            if(isresize){
                for (let j = 0; j < saveobj.categories[catidx].rects.length; j++) {
                    const rectitem = saveobj.categories[catidx].rects[j];
                    
                    rectitem["width"] = (rectitem.width - morehunwidth);
                    rectitem["box_width_percentage"] = (rectitem.box_width_percentage - getmorehunvalue);
                }    

                alertService.warn(this.props.t("cannot_change_morethan_100"));
            } else{
                const lastcatitem = saveobj.categories[lastnotdeletedidx];

                if(lastcatitem){
                    for (let j = 0; j < lastcatitem.rects.length; j++) {
                        const rectitem = lastcatitem.rects[j];
                        
                        rectitem["width"] = (rectitem.width - morehunwidth);
                        rectitem["box_width_percentage"] = (rectitem.box_width_percentage - getmorehunvalue);
                    }  
                }
            }

            roundtotalwidth = 100;
        }
        //if total percentage is less than 100 per, create or update unallocated category
        if(roundtotalwidth < 100){
            let unallocatedvalue = roundOffDecimal((100 - roundtotalwidth),2);
            //find unallocated cat available
            if(unallocatedidx > -1){
                saveobj.categories.splice(unallocatedidx, 1);
            }
            
            if(roundtotalwidth > 0 && saveobj.categories.length > 0){
                let newunallowobj = {
                    id: uuidv4(),
                    rank: (saveobj.categories.length + 1),
                    width: convertWidthPercent(unallocatedvalue,totalfieldwidth,true),
                    height: highestfieldheight.field_height,
                    uom: highestfieldheight.field_uom,
                    box_width_percentage: unallocatedvalue,
                    isDelete: false, isNew: false,
                    is_unallocated_view: true,
                    totalwidth: totalunallowwidth,
                }
                saveobj.categories.push(newunallowobj);
            }
        } else{
            if(unallocatedidx > -1){
                saveobj.categories.splice(unallocatedidx,1);
            }
        }
        
        // console.log(saveobj.categories);
        
        this.setState({ defSaveObj: saveobj, oldCatLength: notdeletedcatlist.length, isUpdatesAvailable: !isonload}, () => {
            this.redrawfieldsToRatio(isperload);
            this.props.updateSavefromChild(null, !isonload);
        });
    }
    //#MP-CAT-03 redraw fields to ratio
    redrawfieldsToRatio = (isperload) => {
        var cdefSaveObj = JSON.parse(JSON.stringify(this.state.defSaveObj));
        var ccatgories = cdefSaveObj.categories.sort((a, b) => a.rank - b.rank);
        //console.log(ccatgories);

        var fielddrawboxheight = this.state.singleFieldHeight;
        var fielddrawboxwidth = this.state.singleFieldWidth;

        let notdeletedcatlist = cdefSaveObj.categories.filter(x => !x.isDelete && !x.is_unallocated_view && x.field_obj); //not deleted categories
        let totalfieldwidth = (fielddrawboxwidth * notdeletedcatlist.length); //box width by not deleted categories
        
        //not deleted box width with shelves
        // let totalshelfcount = 0;
        /* let totalperwidth = (notdeletedcatlist.length > 0?notdeletedcatlist.map(item => {
            // totalshelfcount += item.field_obj.field_shelves.length;
            // let firstrectwidth = (item.rects?item.rects[0].width:0);
            return (fielddrawboxwidth * item.field_obj.field_shelves.length);
        }).reduce((prev, next) => prev + next):0); */

        let currentusinguom = "meters";
        let maxHight = { height: 0,uom: null };
        
        // let avgshelfcount = (totalshelfcount / notdeletedcatlist.length);
        // console.log(avgshelfcount);

        //find heighest field
        ccatgories.forEach(cat => {
            if(cat.field_obj){
                var heightinmeters = measureConverter(cat.field_obj.field_uom, currentusinguom, cat.field_obj.field_height)
                var mheight = measureConverter(maxHight.uom,currentusinguom,maxHight.height)
                // console.log(heightinmeters+">"+mheight);
                if(heightinmeters > mheight){
                    maxHight = {height:cat.field_obj.field_height,uom:cat.field_obj.field_uom}    
                }
            }
        });
        //console.log(ccatgories);

        //calculate field ratio
        //var drawingRatio = CalculateRatio(measureConverter(maxHight.uom,currentusinguom,maxHight.height),fielddrawboxheight);
        
        //loop and set field draw height width
        let rulesperlist = []; 
        let ruleids = []; let isRulesDeleted = false;

        let fieldcontainids = [];
        let totalPercentage = 0; let unallocatedidx = -1;

        for (let i = 0; i < ccatgories.length; i++) {
            const ccat = ccatgories[i];

            //find rules contains this category
            let findrulesavailable = false; let findrulecontains = []; let totalrulelength = 0;
            if(!ccat.isDelete && !ccat.is_unallocated_view){
                for (let i = 0; i < ccat.rects.length; i++) {
                    const rectitem = ccat.rects[i];
                    
                    if(!rectitem.isDelete){ // && rectitem.type === catRectEnums.rule && rectitem.rule.isShelfRule
                        findrulecontains.push(rectitem);
                        findrulesavailable = (findrulesavailable + 1);
                        totalrulelength = (totalrulelength + rectitem.contain_shelves.length);
                    }
                }
            }

            if(!ccat.isDelete && ccat.field_obj){
                //get first rectobject
                let notdeletedrectlist = (ccat && !ccat.is_unallocated_view && ccat.rects.length > 0?ccat.rects.filter(x => !x.isDelete):null);
                let firstrectitem = (notdeletedrectlist && notdeletedrectlist.length?notdeletedrectlist[0]:null);

                //single category ratio
                let singleRatio = CalculateRatio(measureConverter(ccat.field_obj.field_uom, currentusinguom, ccat.field_obj.field_height),fielddrawboxheight);

                // let shelfpercentage = (ccat.field_obj.defaultPercentage?ccat.field_obj.defaultPercentage:convertWidthPercent(ccat.field_obj.field_shelves.length,cdefSaveObj.totalshelfcount));
                // let shelfwidth = convertWidthPercent(shelfpercentage,totalfieldwidth,true);

                //convert field object details
                ccat.field_obj["drawHeight"] = (measureConverter(ccat.field_obj.field_uom, currentusinguom, ccat.field_obj.field_height) * singleRatio);
                if(firstrectitem){
                    ccat.field_obj["drawWidth"] = convertWidthPercent(firstrectitem.box_width_percentage, totalfieldwidth, true);
                    // ccat.field_obj["drawWidth"] = shelfwidth;
                }
                // console.log(firstrectitem.box_width_percentage, totalfieldwidth);

                // loop shelves and set draw
                let prevGap = 0;
                ccat.field_obj.field_shelves.forEach(shelve => {
                    let drawHeight = measureConverter(shelve.uom, currentusinguom, shelve.height) * singleRatio;
                    let drawGap=measureConverter(shelve.uom, currentusinguom, shelve.gap) * singleRatio;
                    //pick x, y
                    shelve.x = 0;
                    shelve.y = prevGap;
                    shelve["drawHeight"]=drawHeight
                    shelve["drawWidth"]=ccat.field_obj.drawWidth;
                    shelve["drawGap"]=drawGap
                    prevGap = prevGap + (drawHeight + drawGap);
                });
                
                //check subcategories if available and fix draw values
                let totalrectper = 0; let isonetime = true;
                for (let j = 0; j < ccat.rects.length; j++) {
                    const rectitem = ccat.rects[j];

                    if(!rectitem.isDelete){
                        if(rectitem.sub_categories.length > 0){
                            rectitem.sub_categories.forEach(subcat => {
                                subcat.rects.forEach(subrect => {
                                    //subcategories rects set draw values
                                    let getyheightfromcontains = findHeightFromShelves(subrect.contain_shelves, ccat.field_obj);
                                    
                                    subrect["drawHeight"]=measureConverter(ccat.field_obj.field_uom, currentusinguom, getyheightfromcontains.height) * singleRatio;
                                    subrect["drawY"]=measureConverter(ccat.field_obj.field_uom, currentusinguom, getyheightfromcontains.y) * singleRatio;

                                    subrect["drawX"]=convertWidthPercent(subrect.x, ccat.field_obj.drawWidth, true);
                                    subrect["drawWidth"]=convertWidthPercent(subrect.box_width_percentage, ccat.field_obj.drawWidth,true);

                                    //check if brands is there then add draw values
                                    if(subrect.brands.length > 0){
                                        subrect.brands.forEach(brnd => {
                                            brnd.rects.forEach(brandrect => {
                                                let getyheightfromcontains2 = findHeightFromShelves(brandrect.contain_shelves, ccat.field_obj);
                                                
                                                brandrect["drawHeight"] = measureConverter(ccat.field_obj.field_uom, currentusinguom, getyheightfromcontains2.height) * singleRatio;
                                                brandrect["drawY"] = measureConverter(ccat.field_obj.field_uom, currentusinguom, getyheightfromcontains2.y) * singleRatio;
                                                
                                                let getbrandxwidth = convertWidthPercent(brandrect.x, subrect.drawWidth,true);
                                                brandrect["drawX"] = (subrect.drawX + getbrandxwidth);
                                                brandrect["drawWidth"] = convertWidthPercent(brandrect.box_width_percentage, subrect.drawWidth, true);    
                                            });
                                        });
                                    }
                                });
                            });
                        }

                        // let singlecatwidth = convertWidthPercent(rectitem.box_width_percentage, totalfieldwidth, true);
                        let totalcontainshelves = rectitem.contain_shelves.length;
                        // rectitem["contain_percentage"] = roundOffDecimal(convertWidthPercent(totalcontainshelves,cdefSaveObj.totalshelfcount),2);
                        rectitem["percentage"] = roundOffDecimal(((rectitem.box_width_percentage / ccat.field_obj.field_shelves.length) * totalcontainshelves),2);
                        // console.log(rectitem.contain_percentage);
                        totalPercentage += rectitem.percentage;

                        if(isonetime){
                            //totalPercentage += rectitem.percentage;
                            isonetime = false;
                        }

                        totalrectper = (totalrectper + rectitem.percentage);
                    }

                    if(rectitem.type === catRectEnums.rule){
                        if(!rectitem.isDelete){
                            rectitem.contain_shelves.forEach( contshelve => {
                                contshelve["category_id"] = ccat.id;
                            });

                            rectitem["parentidx"] = i;
                            rectitem["rectidx"] = j;

                            rulesperlist.push(rectitem);
                            ruleids.push({level: rectitem.rule.level, id: getNameorIdorColorofBox(rectitem, "num"), isNew: (rectitem.isNew === true?true:false)}); //, mpRuleId: (!rectitem.isNew?rectitem.rule.id:-1)
                        } else{
                            // isRulesDeleted = true;
                        }
                    }    
                }

                ccat["total_percentage"] = totalrectper;

                ccat["is_rules_available"] = (findrulesavailable > 1);
                
                for (let v = 0; v < ccat.field_obj.field_shelves.length; v++) {
                    const fieldshelf = ccat.field_obj.field_shelves[v];
                    //console.log(findrulecontains);
                    if(findrulesavailable > 0){
                        let foundnewrule = false;
                        for (let l = 0; l < findrulecontains.length; l++) {
                            const contitem = findrulecontains[l];
                            let findshelve = contitem.contain_shelves.findIndex(x => x.rank === fieldshelf.rank);
                            
                            if(findshelve > -1){
                                foundnewrule = contitem;
                            }
                        }

                        fieldshelf["contain_rule"] = (foundnewrule?foundnewrule:null);

                        if(foundnewrule){
                            let contid = getNameorIdorColorofBox(foundnewrule, "num");
                            let iscontadded = fieldcontainids.findIndex(x => x === contid)
                            
                            let lastaddedcontid = (fieldcontainids.length > 0?fieldcontainids[(fieldcontainids.length - 1)]:null);
                            fieldcontainids.push(getNameorIdorColorofBox(foundnewrule, "num"));
                            
                            fieldshelf["isFirstContain"] = (iscontadded === -1?true:false);
                            fieldshelf["lastAddedIsSame"] = (lastaddedcontid && lastaddedcontid > 0 && lastaddedcontid === contid?true:false);
                        }
                        
                    } else{
                        fieldshelf["contain_rule"] = null;
                    }
                }

            } else if(!ccat.isDelete && ccat.rects && ccat.rects.length > 0){
                for (let j = 0; j < ccat.rects.length; j++) {
                    const rectitem = ccat.rects[j];

                    if(rectitem.type === catRectEnums.rule){
                        if(!rectitem.isDelete){
                            rectitem.contain_shelves.forEach( contshelve => {
                                contshelve["category_id"] = ccat.id;
                            });

                            rectitem["parentidx"] = i;
                            rectitem["rectidx"] = j;

                            rulesperlist.push(rectitem);
                            ruleids.push({level: rectitem.rule.level, id: getNameorIdorColorofBox(rectitem, "num"), isNew: (rectitem.isNew === true?true:false)});
                        } else{
                            // isRulesDeleted = true;
                        }
                    }  
                }
            } else if(ccat.isDelete){
                // let deletedrectslist = ccat.rects.filter(rectitem => rectitem.type === catRectEnums.rule);
                // isRulesDeleted = (deletedrectslist && deletedrectslist.length > 0);
            }

            //unallocated view width calculate
            if(!ccat.isDelete && ccat.is_unallocated_view){
                //single category ratio
                let singleRatio = CalculateRatio(measureConverter(ccat.uom, currentusinguom, ccat.height),fielddrawboxheight);

                ccat["drawWidth"] = convertWidthPercent(ccat.box_width_percentage,totalfieldwidth,true);
                ccat["drawHeight"] = (measureConverter(ccat.uom, currentusinguom, ccat.height) * singleRatio);

                unallocatedidx = i;
            }
        }
        
        if(totalPercentage < 100 && unallocatedidx > -1){
            ccatgories[unallocatedidx]["percentage"] = roundOffDecimal((100 - totalPercentage),2);
        }

        // console.log(ccatgories);
        
        //setting copy obj to original
        cdefSaveObj.categories = ccatgories;

        /* if(isperload){
            this.props.clearDataCaches("scat"); //clear data cache
        } */
        this.setState({defSaveObj: null, isLoadDrules: !isperload, ruleIdList: ruleids},()=>{
            this.setState({defSaveObj:cdefSaveObj, isLoadDrules:true}, () => {
                // console.log(isperload);
                if(isperload){
                    this.getCategoryPercentages(cdefSaveObj.department.department_id, ruleids, isRulesDeleted);
                } else{
                    this.comparePercentagesData(!isperload, 3);
                }
            });
        })
    }
    //toggle categories add modal
    toggleCategoryModal = (isshowcat) => {
        this.setState({ isaddcatmodal: !this.state.isaddcatmodal, showcatiteminmodal: (isshowcat?this.state.showcatiteminmodal:null),
            isupdatecategory: false, updateCategoryObj: null, updateCatIdx: {idx: 0, recidx: 0},
        });
    }
    //toggle simulation view modal
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
    //handle go back button changes
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
    handleAddCateory=(selectedCategory, selectedSupplier, selectedEyeLevel)=>{
        //console.log(selectedCategory);
        let selectedfield = this.state.loadDunitList.find(x => x.isSelected);

        if(selectedCategory && selectedCategory.categoryId){
            let findalreadyadded = this.findItemExists(catRectEnums.default, null, true, selectedCategory.categoryId);
            //console.log(findalreadyadded);

            if(!findalreadyadded.isexists){
                if(selectedfield){
                    //console.log(selectedfield);

                    this.handleAddNewCat(selectedCategory, selectedfield, selectedEyeLevel)
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
    //find items exists in current save object
    findItemExists = (findtype, findruletype, checkmainid, finditemid) => {
        let cdefsaveobj = this.state.defSaveObj;
        
        let isitemexists = false;
        let foundidx = -1; let parentidx = -1;
        let foundItem = null;
        
        for (let i = 0; i < cdefsaveobj.categories.length; i++) {
            const categoryitem = cdefsaveobj.categories[i];
            
            if(!categoryitem.isDelete && !categoryitem.is_unallocated_view){
                
                if(findtype === catRectEnums.parent){
                    if(categoryitem.id === finditemid){
                        isitemexists = true;
                        foundidx = i;  
                        foundItem = categoryitem;
                    }
                } else{
                    for (let j = 0; j < categoryitem.rects.length; j++) {
                        const catrect = categoryitem.rects[j];
                        
                        if(!catrect.isDelete){
                            let iscurexists = getNameorIdorColorofBox(catrect, "num") === finditemid;

                            if(iscurexists){
                                isitemexists = true;
                                foundidx = j;  
                                parentidx = i;
                                foundItem = catrect;
                            }
                        }
                        
                        if(isitemexists){
                            break;
                        }
                    }    
                }
            }

            if(isitemexists){
                break;
            }
            
        }

        return { isexists: isitemexists, foundidx: foundidx, founditem: foundItem, parentidx: parentidx }
    }

    handleButtonUpdDepRuleFocus = () => {
        this.buttonRefUpdDepRule.current.focus();
      }

    //add from drop down
    handleAddFromDrop = () => {
        let selectedCategory = (this.state.defaultSelectCat?this.state.loadedCategoryList[this.state.defaultSelectCat.value]:null);

        if(selectedCategory && selectedCategory.categoryId){
            let findalreadyadded = this.findItemExists(catRectEnums.default, null, true, selectedCategory.categoryId);
            //console.log(findalreadyadded);

            if(!findalreadyadded.isexists){
                let selectedfield = selectedCategory.field;

                if(selectedfield){
                    let selectedEyeLevel = selectedfield.shelf.find(x => x.isEyeLevel);

                    this.handleAddNewCat(selectedCategory, selectedfield, selectedEyeLevel, true);
                } else{
                    // alertService.error(this.props.t("selectfield"));

                    this.setState({ showcatiteminmodal: selectedCategory }, () => {
                        this.toggleCategoryModal(true);
                    });
                }
            } else{
                alertService.error(this.props.t("catalreadyadded"));
            }
        } else{
            alertService.error(this.props.t("SELECT_CATEGORY"));
        }
    }
    //add new category
    handleAddNewCat = (selcat, selectedfield, seleyelevel, isdropadd) => {
        this.fieldHistoryAdd(JSON.parse(JSON.stringify(this.state.defSaveObj)),1);

        let cdefsaveobj = this.state.defSaveObj;

        //field shelfs'
        let catcontains = [];
        let checkFieldShelves = (selectedfield.fieldShelves?selectedfield.fieldShelves:selectedfield.shelf);
        let newshelvelist = checkFieldShelves.map((xitem, xidx) => {
            
            catcontains.push({ id: uuidv4(), gap: xitem.gap, height: xitem.height, rank: xitem.rank, uom: xitem.uom});
            
            let iseyelevel = (seleyelevel?(seleyelevel.rank === xitem.rank):false)

            return { id: -1, shelve_id: xitem.shelfId, gap: xitem.gap,
                height: xitem.height, rank: xitem.rank,
                reverseRowNumber: xitem.reverseRowNumber, uom: xitem.uom, width: xitem.width, x: xitem.x, y: xitem.y,
                isNew: true, isDelete: false,
                isEyeLevel: iseyelevel
            };
        });
        //new field object
        let newfieldobj = {
            id: -1,
            field_id: (selectedfield.fieldId?selectedfield.fieldId:selectedfield.id),
            field_width: selectedfield.width,
            field_height: selectedfield.height,
            field_depth: selectedfield.depth,
            field_uom: selectedfield.uom,
            field_shelves: newshelvelist,
            isNew: true, isDelete: false
        };
        //new field rule obj
        let newrectobj = {
            id: uuidv4(),
            category: {category_id: selcat.categoryId, category_name: selcat.categoryName, color: selcat.categoryColor },
            box_width_percentage: 0,
            contain_shelves: catcontains,
            type: catRectEnums.default,
            isNew: true, isDelete: false,
            rule: {},
            sub_categories: []
        }

        let notdeletedcatlist = cdefsaveobj.categories.filter(x => !x.isDelete && !x.is_unallocated_view);
        let catnewobj = { id: uuidv4(), 
            isNew: true, isDelete: false, field_obj: newfieldobj, 
            rank: (notdeletedcatlist.length + 1),
            rects: [newrectobj]
        };

        cdefsaveobj.categories.push(catnewobj);
        //console.log(cdefsaveobj);

        this.setState({ defSaveObj: cdefsaveobj }, () => {
            if(!isdropadd){
                this.toggleCategoryModal();
            }
            this.compareCategoryData(this.state.loadedCatPercentages, false, false, null, false);
        });
    }
    //toggle onecategory open: 
    toggleOneCategory=()=>{
        this.setState({openOneCategory:!this.state.openOneCategory})
    }
    //remove category 
    handleremoveCategory=(idx, recidx)=>{
        this.fieldHistoryAdd(JSON.parse(JSON.stringify(this.state.defSaveObj)),2);

        let cdefSaveObj=this.state.defSaveObj;

        let ccategoryitem = cdefSaveObj.categories[idx];
        //if available more than one rect
        let notdeletedrectlist = ccategoryitem.rects.filter(x => !x.isDelete);
        // let deleteruleitems = ccategoryitem.rects.filter(x => x.type === catRectEnums.rule);

        // let isruleitem = (deleteruleitems && deleteruleitems.length > 0);

        let crectitem = ccategoryitem.rects[recidx];
        let isruleitem = (crectitem && crectitem.type === catRectEnums.rule);
            
        if(this.state.isDrawEnabled){
            if(this.state.selectedDrawCategory && crectitem.id === this.state.selectedDrawCategory.id){
                alertService.error(this.props.t("close_shelvedrawview_first"));
                return false;
            }
        }

        if(notdeletedrectlist.length > 1){
            
            if(!crectitem.isNew){
                crectitem["isDelete"] = true;
            } else{
                ccategoryitem.rects.splice(recidx,1);
            }  
            //check not deleted rect count again for set field shelves
            let checknotdeletedagain = ccategoryitem.rects.filter(x => !x.isDelete);
            //if its equal one set all rects to the one rect
            if(checknotdeletedagain.length === 1){
                let findleftitemidx = ccategoryitem.rects.findIndex(x => !x.isDelete);
                let ccatrectitem = ccategoryitem.rects[findleftitemidx];
                let newcontaishelves = [];
                for (let i = 0; i < ccategoryitem.field_obj.field_shelves.length; i++) {
                    const shelfitem = ccategoryitem.field_obj.field_shelves[i];

                    let shelveobj = { rank : shelfitem.rank, height : shelfitem.height , gap : shelfitem.gap, uom : shelfitem.uom, category_id: ccategoryitem.id };
                    newcontaishelves.push(shelveobj);        
                }
                ccatrectitem["contain_shelves"] = newcontaishelves;
            }
        } else{

            if(!ccategoryitem.isNew){
                ccategoryitem["isDelete"] = true;
            } else{
                cdefSaveObj.categories.splice(idx,1);
            }    
        }
 
        if(isruleitem){
            this.props.clearDataCaches("all"); //clear data cache
        }
        
        this.setState({defSaveObj: cdefSaveObj, isRulesDeleted: (isruleitem?true:this.state.isRulesDeleted)},()=>{
            if(isruleitem){
                this.saveCategoryObj(false, null, null, true);
            } else{
                this.compareCategoryData(this.state.loadedCatPercentages, false, false, null, false);
            }
        })
    }
    handleeditCategory = (idx, catitem, recidx, recitem) => {
        let notdeletedrectlist = (catitem && catitem.rects?catitem.rects.filter(x => !x.isDelete):[]);
        let issubcatsavailable = false;

        for (let i = 0; i < notdeletedrectlist.length; i++) {
            const catrectitem = notdeletedrectlist[i];
            if(!catrectitem.isDelete && catrectitem.sub_categories.length > 0){
                issubcatsavailable = true;
            }
        }

        if(notdeletedrectlist.length === 1){
            if(!issubcatsavailable){
                this.setState({ 
                    isaddcatmodal: true, showcatiteminmodal: null,
                    isupdatecategory: true, updateCategoryObj: catitem, updateCatIdx: { idx: idx, recidx: recidx } 
                });
            } else{
                alertService.error(this.props.t("subcategories_available_in_rects"));
            }
        } else if(notdeletedrectlist.length > 1){
            alertService.error(this.props.t("multiple_category_boxes_available"));
        }
    }
    //#MP-CAT-12 update categories from child
    updateFromChild = (rects, isruleadd, nohistoryadd, isruledeleted) => {
        if(!nohistoryadd){
            this.fieldHistoryAdd(JSON.parse(JSON.stringify(this.state.defSaveObj)),1);
        }

        if(isruleadd){
            this.props.clearDataCaches("all"); //clear data cache
        }

        let saveobj = this.state.defSaveObj;
        saveobj.categories = rects;
        
        this.setState({ defSaveObj: null }, () => {
            this.setState({ 
                defSaveObj: saveobj, 
                isRulesDeleted: (isruledeleted && saveobj.categories && saveobj.categories.length > 0?true:this.state.isRulesDeleted) 
            }, () => {
                if(isruledeleted){
                    if(saveobj && saveobj.categories && saveobj.categories.length > 0){
                        this.saveCategoryObj(false, null, null, true);
                    }
                } else{
                    this.compareCategoryData(this.state.loadedCatPercentages, false, false, null, false);
                }
            });
        });
    }
     // change haveChnagesinCat
     handlehaveChnagesinCat=(val)=>{
        this.setState({haveChnagesinCat:val})
    }

    changeCatProps = (cidx, ctype, cgap, cscrollstart) => {
        this.fieldHistoryAdd(JSON.parse(JSON.stringify(this.state.defSaveObj)),1);

        //console.log(cidx, ctype, cgap);
        let csaveobj = JSON.parse(JSON.stringify(this.state.defSaveObj));
        let ccatitem = csaveobj.categories[cidx];

        let notdeletedcatlist = csaveobj.categories.filter(x => !x.isDelete && !x.is_unallocated_view);
        let totalfieldwidth = (this.state.singleFieldWidth * notdeletedcatlist.length);
        //if change type is width
        if(ctype === "width"){
            //and changed gap is not zero
            if(cgap !== 0){
                //updates current changing main category item inside rect percentages
                for (let j = 0; j < ccatitem.rects.length; j++) {
                    const rectitem = ccatitem.rects[j];
                    
                    let curcwidth = (rectitem.width + cgap);
                    let curcper = convertWidthPercent(curcwidth,totalfieldwidth);
                    
                    rectitem["width"] = curcwidth;
                    rectitem["box_width_percentage"] = curcper;
                    
                    //disable 
                    if(rectitem.box_width_percentage < 1){
                        return false;
                    }    
                }
            }
        } else if(ctype === "percentage"){
            
        }

        //console.log(csaveobj.categories);
        
        this.setState({ defSaveObj: csaveobj }, () => {
            this.compareCategoryData(this.state.loadedCatPercentages, false, true, cidx, false);

            if(cscrollstart && cscrollstart > 0){
                setTimeout(() => {
                    let editwrapper = document.getElementById("catset-scroll");
                    if(editwrapper){
                        editwrapper.scrollTo(cscrollstart,0);
                    }
                }, 10);
            }
        });
    }
    //convert & save category objects
    saveCategoryObj = (isredirect, catobj, rectobj, isrulesave) => {
        let exportsave = JSON.parse(JSON.stringify(this.state.defSaveObj));
        
        //check contain shelves available
        if(rectobj && rectobj.contain_shelves && rectobj.contain_shelves.length === 0){
            alertService.error(this.props.t("no_selected_contain_shelfs_available"));
            return false;
        }

        //draw view open validate
        if(this.state.isDrawEnabled){
            alertService.error(this.props.t("close_shelvedrawview_first"));
            return false;
        }
        //supplier view open validate
        if(!isrulesave && this.state.isSupplierView){
            alertService.error(this.props.t("close_rulesview_first"));
            return false;
        }
        
        if(exportsave.categories && exportsave.categories.length > 0){
            //only save if changes available
            if((this.props.chartFilterDates && this.props.chartFilterDates.isUpdated) || this.state.isUpdatesAvailable){
                let notdeletedcatlist = exportsave.categories.filter(x => !x.isDelete && !x.is_unallocated_view);
                let totalfieldwidth = (this.state.singleFieldWidth * notdeletedcatlist.length);
                //new category save obj
                let newsaveobj = {
                    mpId: exportsave.mp_id, 
                    chainHasDepartmentId: exportsave.department.department_id, 
                    categories: [],
                    dateUpdated: this.props.chartFilterDates.isUpdated,
                    searchFromDate: this.props.chartFilterDates.fromdate,
                    searchToDate: this.props.chartFilterDates.todate,
                };
                
                let newrank = 1;
                for (let i = 0; i < exportsave.categories.length; i++) {
                    const exportcat = exportsave.categories[i];
                    
                    let newcatrects = [];
                    if(!exportcat.is_unallocated_view){
                        let returncatobj = saveObjDataConvert(exportcat, false, totalfieldwidth);

                        for (let k = 0; k < returncatobj.rects.length; k++) {
                            const returnrect = returncatobj.rects[k];
                            let isrectsupbased = (returnrect.type === catRectEnums.rule);

                            let newruleobj = {};
                            if(returnrect.rule && Object.keys(returnrect.rule).length > 0){
                                newruleobj = {
                                    id: returnrect.rule.id,
                                    level: returnrect.rule.level,
                                    supplier: (returnrect.rule.level === catRuleEnums.sup?{ supplierId: getNameorIdorColorofBox(returnrect, "num") }:null),
                                    category: (returnrect.rule.level === catRuleEnums.cat?{ categoryId: getNameorIdorColorofBox(returnrect, "num") }:null),
                                    sub_category: (returnrect.rule.level === catRuleEnums.subcat?{ subCategoryId: getNameorIdorColorofBox(returnrect, "num") }:null),
                                    brand: (returnrect.rule.level === catRuleEnums.brand?{ brandId: getNameorIdorColorofBox(returnrect, "num") }:null),
                                    isShelfRule: returnrect.rule.isShelfRule,
                                    isNew: returnrect.rule.isNew,
                                    isDelete: returnrect.rule.isDelete,
                                };
                            }

                            let newcatrect = {
                                id: returnrect.id,
                                selectedCategoryId: (!isrectsupbased?returnrect.category.category_id:-1),
                                box_width_percentage: returnrect.box_width_percentage,
                                width: returnrect.percentage,
                                type: returnrect.type,
                                contain_shelves: returnrect.contain_shelves,
                                rule: (returnrect.type === catRectEnums.rule?newruleobj:null),
                                isNew: returnrect.isNew,
                                isDelete: returnrect.isDelete
                            };

                            newcatrects.push(newcatrect);
                        }

                        let newcatobj = {
                            mpHasCategoryId: returncatobj.id,
                            selectedField: (returncatobj.field_obj?returncatobj.field_obj:{}),
                            rank: newrank,
                            isNew: returncatobj.isNew,
                            isDelete: returncatobj.isDelete,
                            rects: newcatrects,
                        };

                        newsaveobj.categories.push(newcatobj);

                        if(!returncatobj.isDelete){
                            newrank = (newrank + 1);
                        }
                    }
                    
                }

                if(newsaveobj.mpId <= 0){
                    newsaveobj["suggestedCategories"] = this.state.bkpCatPercentages;
                }
                
                //save
                //console.log(newsaveobj);
                this.props.toggleLoadingModal(true, () => {
                    submitSets(submitCollection.saveNewCategories, newsaveobj, false, null, true).then(res => {
                        //console.log(res.extra);
        
                        if (res && res.status) {
                            this.setState({ isUpdatesAvailable: false }, () => {
                                this.props.clearDataCaches("all"); //clear data cache
                                
                                alertService.success(this.props.t("catsavedsuccess"));
                                this.loadMPDetails(isredirect, catobj, rectobj);
                                
                                //update date list
                                let chartdates = this.props.chartFilterDates;
                                chartdates["isUpdated"] = false;
    
                                this.props.changeChartFilterDates(chartdates, true);
                            });
                        } else{
                            // alertService.error((res.error && res.error && res.error.errorMessage)?res.error.errorMessage:this.props.t("ERROR_OCCURRED"));
                            this.props.toggleLoadingModal(false);
                        }
                    });
                });
            } else{
                this.props.setMasterPlanAction(exportsave);
                if(isredirect){
                    this.props.redirectToCategory("scat", catobj, null, rectobj);
                } else{
                    if(!isrulesave){
                        alertService.error(this.props.t("NO_CHANGES_AVAILABLE"));
                    }
                }
            }
        } else{
            alertService.error(this.props.t("addcatsfirst"));
        }
    }
    //load mp details
    loadMPDetails = (isredirect, catobj, rectobj) => {
        let csaveobj = this.state.defSaveObj;

        let svobj;
        if(csaveobj.mp_id > -1){
            svobj = { chainHasDepartmentId:csaveobj.department.department_id, mp_id:csaveobj.mp_id };
        }else{
            if(csaveobj.mp_id === -2){
                svobj = { chainHasDepartmentId:csaveobj.department.department_id, mp_id:csaveobj.mp_id };
            } else{
                svobj = { chainHasDepartmentId:csaveobj.department.department_id };        
            }
        }
        //let svobj = { chainHasDepartmentId:7 };

        //find index of selected category
        let selectedcatidx = -1;
        if(isredirect){
            let notdeletedcatlist = csaveobj.categories.filter(x => !x.isDelete && !x.is_unallocated_view);
            selectedcatidx = notdeletedcatlist.findIndex(z => z.id === catobj.id);
        }
        
        this.props.toggleLoadingModal(true, () => {
            submitSets(submitCollection.loadMp, svobj, false).then(res => {
                //console.log(res);
                if(res && res.status){
                    let newsaveobj = ((res.extra && Object.keys(res.extra).length > 0)?res.extra:csaveobj);
                    
                    this.props.updateSavefromChild(newsaveobj);
                    // this.getNewProdCountOfLevels(newsaveobj);
                    this.props.toggleLoadingModal(false);
                    this.setState({
                        defSaveObj: newsaveobj, oldCatLength: 0,
                        historyData: { past: [], present: 0, future: [] },
                        isRulesDeleted: false,
                    }, () => {
                        
                        if(csaveobj.mp_id !== -2){
                            this.props.setMasterPlanAction(newsaveobj);
                        }
                        
                        if(isredirect){
                            let sortcatlist = newsaveobj.categories.sort((a,b) => a.rank - b.rank);
                            let foundcatobj = sortcatlist[selectedcatidx];
                            
                            //find new category object
                            if(foundcatobj){
                                let foundcatrect = foundcatobj.rects.find(z => 
                                    (rectobj.type === catRectEnums.default && z.type === catRectEnums.default && getNameorIdorColorofBox(z, "num") === getNameorIdorColorofBox(rectobj, "num")) ||
                                    (rectobj.type === catRectEnums.rule && z.type === catRectEnums.rule && rectobj.rule.level === z.rule.level && getNameorIdorColorofBox(z, "num") === getNameorIdorColorofBox(rectobj, "num"))
                                );
                                
                                if(foundcatrect){
                                    this.props.redirectToCategory("scat", foundcatobj, null, foundcatrect);
                                } else{
                                    alertService.error(this.props.t("catnotfound")); 
                                }
                            } else{
                                alertService.error(this.props.t("catnotfound")); 
                            }
                        } else{
                            this.compareCategoryData(this.state.loadedCatPercentages, true, false, null, true);
                        }
                    });    
                } else{
                    alertService.error(this.props.t("ERROR_OCCURRED"));
                    this.props.toggleLoadingModal(false);
                }
            }); 
        });
    }
    //redirect view list
    redirectList = (isopen, viewitem) => {
        //if(isopen){
            let defSaveObj = this.state.defSaveObj;

            let filteritems = [];
            for (let i = 0; i < defSaveObj.categories.length; i++) {
                const catitem = defSaveObj.categories[i];
            
                if(!catitem.isDelete && !catitem.is_unallocated_view){
                    let catrectitems = catitem.rects.filter(z => {
                        return (!z.isDelete && (
                        (viewitem.isRule && z.type === catRectEnums.rule && z.rule.level === viewitem.ruleLevel && getNameorIdorColorofBox(z,"num") === viewitem.id) || 
                        (!viewitem.isRule && z.type === catRectEnums.default && getNameorIdorColorofBox(z,"num") === viewitem.id)));
                    });

                    let rectparentitem = JSON.parse(JSON.stringify(catitem));
                    for (let j = 0; j < catrectitems.length; j++) {
                        const filterrectitem = catrectitems[j];
                        filterrectitem["catitem"] = rectparentitem;
                    }
                    
                    filteritems = filteritems.concat(catrectitems);    
                }
            }
            
            // console.log(filteritems);
            if(filteritems.length === 1){
                this.saveCategoryObj(true,filteritems[0].catitem,filteritems[0]);

            } else if(filteritems.length === 0 && !this.props.isAUIDisabled){
                let selectedCatIdx = this.state.loadedCategoryList.findIndex(x => x.categoryId === viewitem.id);
                
                if(this.state.loadedCategoryList[selectedCatIdx] && this.state.loadedCategoryList[selectedCatIdx].field){
                    this.setState({ defaultSelectCat: { value: selectedCatIdx, label: viewitem.name } }, () => {
                        this.handleAddFromDrop();
                    });
                } else{
                    this.setState({ showcatiteminmodal: this.state.loadedCategoryList[selectedCatIdx] }, () => {
                        // alertService.error(this.props.t("addcatfirst"));
                        this.toggleCategoryModal(true);
                    });
                }
            }

            this.setState({ percentageDropList: filteritems });
        //}
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


    //#MP-RUL-02 toggle between rules add and cat summary
    toggleSupplierView = () => {
        let defSaveObj = this.state.defSaveObj;
        
        //if closing validate rule data
        if(this.state.isSupplierView){
            //find rules percentage field details not added fields available
            let findpernofield = false; let findshelveno = false;
            
            for (let i = 0; i < defSaveObj.categories.length; i++) {
                const catitem = defSaveObj.categories[i];
                
                if(!catitem.isDelete && !catitem.is_unallocated_view && !catitem.field_obj){
                    let nofieldavailable = catitem.rects.filter(x => !x.isDelete && x.type === catRectEnums.rule && !x.rule.isShelfRule);
                    if(nofieldavailable && nofieldavailable.length > 0){
                        findpernofield = true;
                    }
                    
                    let noshelveavailable = catitem.rects.filter(x => !x.isDelete && x.type === catRectEnums.rule && (!x.contain_shelves || x.contain_shelves.length === 0));
                    if(noshelveavailable && noshelveavailable.length > 0){
                        findshelveno = true;
                    }
                }
            }   

            if(findpernofield){
                alertService.error(this.props.t("no_field_rules_available"));
                return false;
            }

            //find supplier shelves type shelves not selected 
            if(findshelveno){
                alertService.error(this.props.t("no_shelves_rules_available"));
                return false;
            }
        }

        this.setState({ isSupplierView: !this.state.isSupplierView }, () => {
            if(!this.state.isSupplierView){
                // this.props.clearDataCaches("all"); //clear data cache
                // this.compareCategoryData(this.state.loadedCatPercentages, false, false, null, true);

                if(defSaveObj && defSaveObj.categories && defSaveObj.categories.length > 0){
                    this.saveCategoryObj(false,null,null,true);
                }
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

        if(!show){
            this.props.toggleSummary("cat", this.state.isUpdatesAvailable);
        } else{
            if(this.state.isUpdatesAvailable){
                this.saveCategoryObj(false);
            }
        }
    }
    //enable draw view
    toggleDrawShelveView = (isshow, selectitem, catidx, rectidx) => {
        this.fieldHistoryAdd(JSON.parse(JSON.stringify(this.state.defSaveObj)),1);
        
        let cdefSaveObj = JSON.parse(JSON.stringify(this.state.defSaveObj));
        let selectviewitem = this.state.selectedDrawCategory;
        
        if(!isshow){
            //check contain shelves available
            if(selectviewitem.contain_shelves && selectviewitem.contain_shelves.length > 0){
                //get category and rect details from selected indexes
                let fountcatitem = cdefSaveObj.categories[selectviewitem.parentidx]
                let fountrectitem = fountcatitem.rects[selectviewitem.rectidx];
                //update contain shelves list
                fountrectitem["contain_shelves"] = selectviewitem.contain_shelves;

                let containranklist = selectviewitem.contain_shelves.map(x => x.rank);
                
                //check is it not in current category
                let containfirstitem = selectviewitem.contain_shelves[0];
                if(containfirstitem.category_id !== fountcatitem.id){
                    //find category item
                    let findcategoryitem = this.findItemExists(catRectEnums.parent, null, true, containfirstitem.category_id);

                    if(findcategoryitem.isexists){
                        let newcatitem = cdefSaveObj.categories[findcategoryitem.foundidx];
                        
                        //get first not deleted item
                        let notdeletedrectlist = newcatitem.rects.filter(x => !x.isDelete);
                        let firstnotdeleteitem = (notdeletedrectlist.length > 0?JSON.parse(JSON.stringify(notdeletedrectlist[0])):null);

                        //if selected shelfs are equal to all field object shelves, converting parent category to rule base
                        if(fountrectitem.contain_shelves.length === newcatitem.field_obj.field_shelves.length){
                            //remove other rects from category
                            let leftrectlist = [];
                            for (let l = 0; l < newcatitem.rects.length; l++) {
                                const rectitem = newcatitem.rects[l];
                                if(!rectitem.isNew){
                                    rectitem["isDelete"] = true;
                                    leftrectlist.push(rectitem);
                                }
                            }
                            newcatitem.rects = leftrectlist;

                            if(fountrectitem.rule){
                                fountrectitem.rule.isShelfRule = false;
                            }
                        } else{
                            //remove contain shelves from other rects
                            let leftrectitems = [];
                            for (let l = 0; l < newcatitem.rects.length; l++) {
                                const selrectitem = newcatitem.rects[l];

                                let leftcontains = selrectitem.contain_shelves.filter(x => !containranklist.includes(x.rank));
                                selrectitem.contain_shelves = leftcontains;

                                if(leftcontains.length > 0){
                                    leftrectitems.push(selrectitem);
                                } else{
                                    if(!selrectitem.isNew){
                                        selrectitem['isDelete'] = true;
                                        leftrectitems.push(selrectitem);
                                    }
                                }
                            }
                            newcatitem.rects = leftrectitems;
                        }
                        
                        let newrectitem = JSON.parse(JSON.stringify(fountrectitem));
                        newrectitem["id"] = uuidv4();
                        newrectitem["isNew"] = true;
                        newrectitem["box_width_percentage"] = (firstnotdeleteitem?firstnotdeleteitem.box_width_percentage:0);
                        newrectitem["width"] = (firstnotdeleteitem?firstnotdeleteitem.width:0);
                        newcatitem.rects.push(newrectitem);
                        
                        //remove existing item
                        if(fountrectitem.isNew){
                            fountcatitem.rects.splice(selectviewitem.rectidx,1);
                        } else{
                            fountrectitem["isDelete"] = true;
                        }

                        //if parent category of existing item rects are empty
                        let updatednotdeletedrects = fountcatitem.rects.filter(x => !x.isDelete);
                        if(updatednotdeletedrects && updatednotdeletedrects.length === 0){
                            if(fountcatitem.isNew){
                                cdefSaveObj.categories.splice(selectviewitem.parentidx,1);
                            } else{
                                fountcatitem["isDelete"] = true;
                            }
                        }

                        //check category rects contain shelfs are close with each other
                        for (let m = 0; m < newcatitem.rects.length; m++) {
                            const catrectitem = newcatitem.rects[m];
                            
                            if(!catrectitem.isDelete && catrectitem.contain_shelves && catrectitem.contain_shelves.length > 1){
                                for (let n = 0; n < catrectitem.contain_shelves.length; n++) {
                                    const catrectcontain = catrectitem.contain_shelves[n];
                                    
                                    let checkmorethanranks = catrectitem.contain_shelves.find(z => z.rank === (catrectcontain.rank + 1));
                                    let checklessthanranks = catrectitem.contain_shelves.find(z => z.rank === (catrectcontain.rank - 1));
            
                                    if(!checkmorethanranks && !checklessthanranks){
                                        alertService.error(this.props.t("contains_shelfs_between_othershelfs"));
                                        return false;
                                    }
                                }
                            }
                        }

                        // console.log(newcatitem);
                    }
                } else{
                    //if selected shelfs are equal to all field object shelves, converting parent category to rule base
                    if(fountrectitem.contain_shelves.length === fountcatitem.field_obj.field_shelves.length){
                        //remove other rects from category
                        let leftrectlist = [];
                        for (let l = 0; l < fountcatitem.rects.length; l++) {
                            const rectitem = fountcatitem.rects[l];
                            
                            if(rectitem.id !== fountrectitem.id){
                                if(!rectitem.isNew){
                                    rectitem["isDelete"] = true;
                                    leftrectlist.push(rectitem);
                                }
                            } else{
                                if(rectitem.rule){
                                    rectitem.rule["isShelfRule"] = false;
                                }
                                leftrectlist.push(rectitem);
                            }
                        }
                        fountcatitem.rects = leftrectlist;
                    } else{
                        //remove contain shelves from other rects
                        let leftrectitems = []; let leftallcontains = [];
                        let lastnotitemidx = -1;
                        for (let l = 0; l < fountcatitem.rects.length; l++) {
                            const selrectitem = fountcatitem.rects[l];

                            if(selrectitem.id !== fountrectitem.id){
                                
                                let leftcontains = selrectitem.contain_shelves.filter(x => !containranklist.includes(x.rank));
                                selrectitem.contain_shelves = leftcontains;

                                if(leftcontains.length > 0){
                                    leftallcontains = leftallcontains.concat(selrectitem.contain_shelves);

                                    lastnotitemidx = leftrectitems.length;
                                    leftrectitems.push(selrectitem);

                                } else{
                                    if(!selrectitem.isNew){
                                        selrectitem['isDelete'] = true;
                                        leftrectitems.push(selrectitem);
                                    }
                                }
                            } else{
                                leftallcontains = leftallcontains.concat(selrectitem.contain_shelves);
                                leftrectitems.push(selrectitem);
                            }
                        }
                        
                        fountcatitem.rects = leftrectitems;

                        // console.log(leftallcontains);
                        if(lastnotitemidx > -1 && leftallcontains.length > 0 && fountcatitem.field_obj){
                            let notassignshelves = [];
                            for (let k = 0; k < fountcatitem.field_obj.field_shelves.length; k++) {
                                const fieldshelveitem = fountcatitem.field_obj.field_shelves[k];
                                
                                let findshelveisadded = leftallcontains.filter(x => x.rank === fieldshelveitem.rank);
                                if(!findshelveisadded || findshelveisadded.length === 0){
                                    notassignshelves.push(fieldshelveitem);
                                }
                            }
                            // console.log(notassignshelves);

                            /* if(notassignshelves.length > 0){
                                let newshelvelist = [];
                                for (let z = 0; z < notassignshelves.length; z++) {
                                    const notshelveobj = notassignshelves[z];
                                    newshelvelist.push({ id: uuidv4(), gap: notshelveobj.gap, height: notshelveobj.height, rank: notshelveobj.rank, uom: notshelveobj.uom});
                                }
    
                                let lastnotitem = fountcatitem.rects[lastnotitemidx];
                                lastnotitem.contain_shelves = lastnotitem.contain_shelves.concat(newshelvelist);
                            } */
                        }
                    }
                    
                    //check category rects contain shelfs are close with each other
                    for (let m = 0; m < fountcatitem.rects.length; m++) {
                        const catrectitem = fountcatitem.rects[m];
                        
                        if(!catrectitem.isDelete && catrectitem.contain_shelves && catrectitem.contain_shelves.length > 1){
                            for (let n = 0; n < catrectitem.contain_shelves.length; n++) {
                                const catrectcontain = catrectitem.contain_shelves[n];
                                
                                let checkmorethanranks = catrectitem.contain_shelves.find(z => z.rank === (catrectcontain.rank + 1));
                                let checklessthanranks = catrectitem.contain_shelves.find(z => z.rank === (catrectcontain.rank - 1));
        
                                if(!checkmorethanranks && !checklessthanranks){
                                    alertService.error(this.props.t("contains_shelfs_between_othershelfs"));
                                    return false;
                                }
                            }
                        }
                    }

                    // console.log(fountcatitem);
                }
            } else{
                alertService.error(this.props.t("no_selected_contain_shelfs_available"));
                return false;
            }

        } else{
            //save category idx details
            selectitem["parentidx"] = catidx;
            selectitem["rectidx"] = rectidx;
        }
        
        this.setState({ defSaveObj: cdefSaveObj, isDrawEnabled: isshow, selectedDrawCategory: (isshow?selectitem:null) }, () => {
            if(!isshow){
                this.compareCategoryData(this.state.loadedCatPercentages, false);
            }
        });
    }
    //remove selected shelve draw
    removeSelectShelve = () => {
        this.setState({ isDrawEnabled: false, selectedDrawCategory: null });
    }
    //#MP-CAT-13
    updateDrawSelectShelves = (catitem, shelveidx, shelveitem) => {
        //console.log(catitem, shelveidx, shelveitem);
        // let defSaveObj = JSON.parse(JSON.stringify(this.state.defSaveObj));
        let selecteddraw = JSON.parse(JSON.stringify(this.state.selectedDrawCategory));
        let adddedshelves = (selecteddraw.contain_shelves?selecteddraw.contain_shelves:[]);
        
        //sort to lowest rank
        adddedshelves = adddedshelves.sort((a, b) => a.rank - b.rank);

        // let parentCatItem = defSaveObj.categories[selecteddraw.parentidx];
        // let parentRectItem = parentCatItem.rects[selecteddraw.rectidx];
        
        /* if(parentCatItem && parentCatItem.field_obj){
            if(parentCatItem.id !== catitem.id){
                alertService.error(this.props.t("shelf_is_in_othercategory"));
                return false;
            }
        } */
        
        let newshelveobj = {
            gap: shelveitem.gap,
            height: shelveitem.height,
            id: uuidv4(),
            rank: shelveitem.rank,
            uom: shelveitem.uom,
            category_id: catitem.id
        }

        //find is it on other category
        if(adddedshelves.length > 0){
            let firstshelveitem = adddedshelves[0];
            
            if(firstshelveitem.category_id !== catitem.id){
                alertService.error(this.props.t("shelf_is_in_othercategory"));
                return false;
            }
        }
        
        //check shelve is contain sub categories
        let isshelvecontainsub = false; let isrectcontainshelve = false;
        
        for (let l = 0; l < catitem.rects.length; l++) {
            const rectitem = catitem.rects[l];
            
            /* if(!rectitem.isDelete && rectitem.id !== selecteddraw.id){
                //check rect contain selecting shelve
                if(rectitem.rule && rectitem.rule.isShelfRule){
                    for (let v = 0; v < rectitem.contain_shelves.length; v++) {
                        const contshelve = rectitem.contain_shelves[v];
                        if(contshelve.rank === shelveitem.rank){
                            isrectcontainshelve = true;
                        }
                    }    
                }
            } */    

            //check sub categories available
            for (let j = 0; j < rectitem.sub_categories.length; j++) {
                const subitem = rectitem.sub_categories[j];
                if(!subitem.isDelete){
                    for (let i = 0; i < subitem.rects.length; i++) {
                        const rectitem = subitem.rects[i];
                        let issubcontain = rectitem.contain_shelves.findIndex(x => x.rank === shelveitem.rank);
                        if(issubcontain > -1){
                            isshelvecontainsub = true;
                        }     
                    }
                }
            }
        }
        
        if(isrectcontainshelve){
            alertService.error(this.props.t("shelf_is_already_assign_to_otherrect"));
            return false;
        } else{
            if(isshelvecontainsub){
                alertService.error(this.props.t("shelf_is_contain_subcategories"));
                return false;
            } else{
                //check is already added
                let isalreadyadded = adddedshelves.findIndex(x => (!x.isDelete && x.rank === shelveitem.rank));

                if(isalreadyadded > -1){
                    //find is available rank more than or less than remove rank
                    let checkmorethanranks = adddedshelves.filter(z => z.rank > adddedshelves[isalreadyadded].rank);
                    let checklessthanranks = adddedshelves.filter(z => z.rank < adddedshelves[isalreadyadded].rank);

                    if((checkmorethanranks && checkmorethanranks.length > 0) && (checklessthanranks && checklessthanranks.length > 0)){
                        alertService.error(this.props.t("cannot_remove_middle_shelf"));
                        return false;
                    }

                    adddedshelves.splice(isalreadyadded,1)
                } else{
                    //check previous or next shelf rank is closest one
                    let checkmorethanranks = adddedshelves.find(z => z.rank === (newshelveobj.rank + 1));
                    let checklessthanranks = adddedshelves.find(z => z.rank === (newshelveobj.rank - 1));

                    if(adddedshelves.length > 0 && !checkmorethanranks && !checklessthanranks){
                        alertService.error(this.props.t("cannot_select_between_othershelfs"));
                        return false;
                    }

                    adddedshelves.push(newshelveobj);
                }
            }    
        }
        
        selecteddraw["contain_shelves"] = adddedshelves;
        //console.log(selecteddraw);
        
        this.setState({ selectedDrawCategory: selecteddraw })
    }
    //change selected cat
    handleChangeCat = (selitem) => {
        this.setState({ defaultSelectCat: selitem });
    }
    //clear dropdown category
    handleDropOpen = (isshow, issup) => {
        if(isshow){
            setTimeout(() => {
                let defcatobj = (this.state.showcat?this.state.showcat:this.state.selectCategoryList.length > 0?this.state.selectCategoryList[0]:null);
                
                this.setState({ showcat: null, defaultSelectCat: defcatobj });
            }, 100);
        }
    }
    //cat data panel data
    updateCatDataPanel = (datalist, isloading) => {
        this.setState({ catDataPanelData: datalist, isDataPanelLoading: isloading });
    }
    //add categories from child
    addCategoriesFromChild = (saveobj) => {
        this.setState({ defSaveObj: saveobj, oldCatLength: saveobj.categories.length, isUpdatesAvailable: true, isLoadDrules: false, isDataPanelLoading: true}, () => {
            this.redrawfieldsToRatio(false);
            this.props.updateSavefromChild(null, true);
            this.setState({ isLoadDrules: true });
        });
    }
    //update chart dates with confirm if updates available
    updateProductDateRanges = (savefilterobj, chartDates) => {
        if(this.state.isUpdatesAvailable){
            this.props.notsaveConfirm((iscontinue) => {
                if(iscontinue){
                    this.setState({ isUpdatesAvailable: false }, () => {
                        this.props.resetUpdatesAvailable(true);
                        this.props.updateSavefromChild(null, false, true, savefilterobj, chartDates);
                    });    
                }
            });
        } else{
            this.props.updateProductDateRanges(savefilterobj, chartDates);
        }
    }
    
    render() {
        let sumtype = this.props.summaryViewType;
        let isdep = this.state.isDeptView;

        let defmpid = (this.state.defSaveObj && this.state.defSaveObj?this.state.defSaveObj.mp_id:-1);
        let deptid = (this.state.defSaveObj && this.state.defSaveObj.department?this.state.defSaveObj.department.department_id:-1);

        return (<>
            <React.Fragment>
                <Prompt when={this.state.isUpdatesAvailable}
                message={this.props.t('CHANGE_NOTBE_SAVED')} />
            </React.Fragment>

            <Col xs={12} dir={this.props.isRTL}>
                
                <Row className='topcontent-main' style={this.props.isRTL === "rtl"?{width: "100%", marginRight: "0px"}:{width: "100%", marginLeft: "0px"}}>
                    
                    {(defmpid === -2 || (this.state.isCardsShow === true && this.props.drulesEnabled === true && !this.state.isDataPanelLoading))?
                        <DataRuleContent 
                            depDirectType={this.props.depDirectType}
                            isRTL={this.props.isRTL}
                            isonetimeload={this.state.isonetimeload} 
                            isDataPanelLoading={this.state.isDataPanelLoading}
                            noticeImgUrl={this.props.noticeImgUrl}
                            catDataPanelData={this.state.catDataPanelData}
                            viewtype="cat" 
                            defSaveObj={this.state.defSaveObj}
                            deptid={deptid} 
                            deptsettings={this.props.deptsettings}
                            changeChartFilterDates={this.props.changeChartFilterDates}
                            changeDataRuleActiveTab={this.props.changeDataRuleActiveTab}
                            chartFilterDates={this.props.chartFilterDates}
                            dataRuleSelectedTab={this.props.dataRuleSelectedTab}
                            ruleIdList={this.state.ruleIdList}
                            parentSaveObj={this.props.defSaveObj}
                            getNoticeImageForWatch={this.props.getNoticeImageForWatch}
                            setWatchTabCountStatus = {this.props.setWatchTabCountStatus}
                            dRulesreload={this.props.dRulesreload}
                            toggleLoadingModal={this.props.toggleLoadingModal}
                            updatedeptobj={this.props.updatedeptobj}
                            updateProductDateRanges={this.updateProductDateRanges}
                            watchTabCountLoaded = {this.props.watchTabCountLoaded}
                            onDepButtonClick={this.handleButtonUpdDepRuleFocus}
                            dmode={this.props.dmode}
                            />
                    :<>
                        <Col className="bottom-single datarule-wrapper" xs={12} lg={3} style={this.props.isRTL === "rtl"?{paddingRight:"0px"}:{paddingLeft:"0px"}}>
                            <Col className='sub-content sub-wrapper datarule-content'>
                                <div className='loading-icon' style={{marginTop: "30%"}}><img className='loader-gif' src={loaderanime} alt="loader"/></div>
                            </Col>
                        </Col>
                    </>}

                    <Col xs={12} lg={9} className="drawparent-wrapper" style={{padding:"0px"}}>
                        <Col className='MPDrawing'>
                            {/* #MP-CAT-06 */}
                            {this.state.defSaveObj?
                                <CatDrawing 
                                    defSaveObj={this.state.defSaveObj}
                                    isAUIDisabled={this.props.isAUIDisabled}
                                    perContentWidth={this.state.perContentWidth}
                                    singleFieldWidth={this.state.singleFieldWidth}
                                    loadedCategoryList={this.state.loadedCategoryList}
                                    rectsets={this.state.defSaveObj?this.state.defSaveObj.categories:[]} 
                                    isDrawEnabled={this.state.isDrawEnabled}
                                    selectedDrawCategory={this.state.selectedDrawCategory}
                                    historyData={this.state.historyData}
                                    loadedCatPercentages={this.state.loadedCatPercentages}
                                    addCategoriesFromChild={this.addCategoriesFromChild}
                                    changeCatProps={this.changeCatProps} 
                                    fieldHistoryAdd={this.fieldHistoryAdd}
                                    handleUndoRedo={this.handleUndoRedo}
                                    redirectToCategory={this.saveCategoryObj}
                                    updateFromChild={this.updateFromChild} 
                                    updateDrawSelectShelves={this.updateDrawSelectShelves} />
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
                                        <li onClick={() => this.toggleDeptView(false)} className={'list-inline-item content-switch'+(!isdep && sumtype === "cat"?" active":"")}>{this.props.t("category")}</li>
                                        <li className={'list-inline-item content-switch disabled'}>{this.props.t("sub_category")}</li>
                                        <li className={'list-inline-item content-switch disabled'} style={this.props.isRTL === "rtl"?{marginLeft:"20px"}:{marginRight:"20px"}}>{this.props.t("brand")}</li>
                                        
                                        {/* <li className='list-inline-item'><Button variant='outline-warning' size="sm">{this.props.t("products")}</Button></li> */}
                                        {this.state.defSaveObj && this.state.defSaveObj.mp_id > -1?<>
                                            <li className='list-inline-item'><Button variant='success' onClick={() => this.saveCategoryObj(false)} size="sm">{this.props.t("btnnames.save")}</Button></li>
                                        </>:<></>}
                                    </ul>

                                    <h3 className='main-title'>
                                        {this.state.isDeptView?this.props.t("dept_rules"):this.props.t("edit_categories")} 
                                        {this.props.bottomFieldCount > 0?<><small className='fieldcount-txt'><label>{this.props.bottomFieldCount}</label> {this.props.t("fields")}</small></>:<></>}
                                    </h3>
                                </Col>
                                
                                <Col className='dark-wrapper'>
                                    {this.state.isDeptView?
                                        <MPDeptMetaForm ismodalview={false} 
                                        isRTL={this.props.isRTL}
                                        isneeddeptsettingvalid={this.props.isneeddeptsettingvalid}
                                        chartFilterDates={this.props.chartFilterDates}
                                        defSaveObj={this.state.defSaveObj} 
                                        deptsettings={this.props.deptsettings}
                                        isdepdataloaded={this.props.isdepdataloaded}
                                        isdeptupdateavailable={this.props.isdeptupdateavailable}
                                        updatedeptobj={this.props.updatedeptobj}
                                        isAUIDisabled={this.props.isAUIDisabled}
                                        toggleDeptView={this.toggleDeptView} 
                                        dRulesreload={this.props.dRulesreload}
                                        buttonRefUpdDepRuleRef={this.buttonRefUpdDepRule}
                                        mpstate={this.props.masterPlanogramState}
                                        onNewUpdateClick={this.props.onNewUpdateClick}
                                        updateSavefromChild={this.props.updateSavefromChild}
                                        signedDetails={this.props.signState?this.props.signState.signinDetails:null}
                                         />
                                    :
                                        <Row>
                                            {this.state.isSupplierView?<>
                                                <MPRulesAdd 
                                                    viewtype="cat"
                                                    defSaveObj={this.state.defSaveObj}
                                                    loadedCategoryList={this.state.loadedCategoryList} selectCategoryList={this.state.selectCategoryList}
                                                    loadedSuppliersList={this.state.loadedSuppliersList} selectSupplierList={this.state.selectSupplierList}
                                                    loadedSubCatList={this.state.loadedSubCatList} selectSubCatList={this.state.selectSubCatList}
                                                    loadedBrandsList={this.state.loadedBrandsList} selectBrandsList={this.state.selectBrandsList}
                                                    fieldTotalCount={this.state.fieldTotalCount} 
                                                    loadDunitList={this.state.loadDunitList}
                                                    isDrawEnabled={this.state.isDrawEnabled} selectedDrawCategory={this.state.selectedDrawCategory}
                                                    
                                                    clearDataCaches={this.props.clearDataCaches}
                                                    loadMoreDunits={this.loadMoreDunits} 
                                                    toggleSupplierView={this.toggleSupplierView}
                                                    toggleDrawShelveView={this.toggleDrawShelveView}
                                                    removeSelectShelve={this.removeSelectShelve}
                                                    updateFromChild={this.updateFromChild}
                                                    t={this.props.t} isRTL={this.props.isRTL} 
                                                    />
                                            </>:<>
                                                <Col>
                                                    <Col className='title-withline'>
                                                        <h5>{this.props.t("categories")}</h5>
                                                        <div className='text-line' style={{width:(this.state.showResolutionCount === 4?"85%":this.state.showResolutionCount === 3?"65%":"80%")}}></div>
                                                    </Col>

                                                    <ul className='newcats-list list-inline'>
                                                        {this.state.defSaveObj && this.state.defSaveObj.categories?<>
                                                            {this.state.defSaveObj.categories.map((xitem, xidx) => {
                                                                return <React.Fragment key={xidx}>
                                                                    {!xitem.isDelete && !xitem.is_unallocated_view?<>
                                                                        {xitem.rects.map((ritem, ridx) => {
                                                                            let catrectcolor = (getNameorIdorColorofBox(ritem, "color")?getNameorIdorColorofBox(ritem, "color"):"#F39C12");
                                                                            let catrecttxtcolor = (checkColorIsLight(catrectcolor)?(this.props.dmode?"#29b485":"#5128a0"):"white");
                                                                            //
                                                                            return <React.Fragment key={ridx}>
                                                                                {!ritem.isDelete && ritem.type === catRectEnums.default?
                                                                                    <li className='newcats-item list-inline-item' title={ritem.category.category_name}>
                                                                                        <span className="remove-icon" onClick={()=>this.handleremoveCategory(xidx, ridx)}><XIcon size={12} /></span>
                                                                                        <span className="remove-icon edit" onClick={()=>this.handleeditCategory(xidx, xitem, ridx, ritem)}><PencilIcon size={12} /></span>
                                                                                        <Col className="sub-content" onClick={() => this.saveCategoryObj(true, xitem, ritem) } style={{background: catrectcolor, borderColor: catrectcolor, color: catrecttxtcolor}}>
                                                                                            <h6>{(ritem.category.category_name.substring(0,10)+(ritem.category.category_name.length>10?"..":""))}</h6>
                                                                                        </Col>
                                                                                    </li>        
                                                                                :<></>}
                                                                            </React.Fragment>;
                                                                        })}
                                                                    </>:<></>}
                                                                </React.Fragment>;
                                                            })}
                                                        </>:<></>}

                                                        {/* <li className='newcats-item list-inline-item'>
                                                            <Col className="sub-content add" onClick={this.toggleCategoryModal}><h6><PlusIcon size={14} /></h6></Col>
                                                        </li> */}


                                                        <li className='newcats-item list-inline-item'>
                                                            <Dropdown drop='up' onToggle={e => this.handleDropOpen(e,false)}>
                                                                <Dropdown.Toggle variant="default">
                                                                    <Col className="sub-content add"><PlusIcon size={14} /></Col>
                                                                </Dropdown.Toggle>
                                
                                                                <Dropdown.Menu className={"newcat-drop subcat-drop"}>
                                                                    <Col style={{padding:"0px 15px"}}>
                                                                        <label>{this.props.t("SELECT_CATEGORY")}</label>

                                                                        <Select options={this.state.selectCategoryList}  
                                                                        onChange={(e) => this.handleChangeCat(e)}
                                                                        value={this.state.defaultSelectCat}
                                                                        className="filter-searchselect" classNamePrefix="searchselect-inner" 
                                                                        components={{ IndicatorSeparator: () => null }} maxMenuHeight={120} required />
                                                                    </Col>
                                                                    <Dropdown.Item href="#">
                                                                        <Button variant="success" onClick={e => this.handleAddFromDrop(e)} size="sm">{this.props.t("btnnames.save")}</Button>
                                                                    </Dropdown.Item>
                                                                </Dropdown.Menu>
                                                            </Dropdown>
                                                        </li>
                                                    </ul> 

                                                    <Col className='title-withline'>
                                                        <h5>{this.props.t("cat_rules")}</h5>
                                                        <div className='text-line' style={{width:(this.state.showResolutionCount === 4?"82%":this.state.showResolutionCount === 3?"55%":"72%")}}></div>
                                                    </Col>

                                                    <ul className='newcats-list list-inline'>
                                                        {this.state.defSaveObj && this.state.defSaveObj.categories?<>
                                                            {this.state.defSaveObj.categories.map((xitem, xidx) => {
                                                                return <React.Fragment key={xidx}>
                                                                    {!xitem.isDelete && !xitem.is_unallocated_view?<>
                                                                        {xitem.rects.map((ritem, ridx) => {
                                                                            let catrectcolor = (getNameorIdorColorofBox(ritem, "color")?getNameorIdorColorofBox(ritem, "color"):"#F39C12");
                                                                            let catrecttxtcolor = (checkColorIsLight(catrectcolor)?(this.props.dmode?"#29b485":"#5128a0"):catrectcolor);
                                                                            //
                                                                            return <React.Fragment key={ridx}>
                                                                                {!ritem.isDelete && ritem.type === catRectEnums.rule?
                                                                                    <li className='newcats-item list-inline-item' title={getNameorIdorColorofBox(ritem, "name")}>
                                                                                        <span className="remove-icon" onClick={()=>this.handleremoveCategory(xidx, ridx)}><XIcon size={12} /></span>
                                                                                        <Col className="sub-content sup-based" onClick={() => this.saveCategoryObj(true, xitem, ritem) } style={{borderColor: catrectcolor, color: catrecttxtcolor}}>
                                                                                            <h6>{(getNameorIdorColorofBox(ritem, "name").substring(0,10)+(getNameorIdorColorofBox(ritem, "name").length>10?"..":""))}</h6>
                                                                                        </Col>
                                                                                    </li>        
                                                                                :<></>}
                                                                            </React.Fragment>;
                                                                        })}
                                                                    </>:<></>}    
                                                                </React.Fragment>;
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
                                                    {this.state.loadedCatPercentages?<>
                                                        {this.state.loadedCatPercentages.map((xitem, xidx) => {
                                                            /* let csubnametxt = (xitem.rule?(getNameorIdorColorofBox(xitem, "name").substring(0,15) + (getNameorIdorColorofBox(xitem, "name").length > 15?"..":""))
                                                            :(xitem.categoryName.substring(0,15)+(xitem.categoryName.length > 15?"..":""))); */
                                                            let cfullnametxt = (xitem.name?xitem.name:"-")
                                                            let csubnametxt = (cfullnametxt?cfullnametxt:"-");
                                                            let ccatcolor = (xitem.color?xitem.color:"rgb(237, 50, 122)");
                                                            let cscattxtcolor = (checkColorIsLight(ccatcolor)?(this.props.dmode?"#29b485":"#5128a0"):xitem.isRule?ccatcolor:"white");
                                                            
                                                            let shelfreducewidth = (xitem.catrect && xitem.catrect.isShelfCat?25:0);
                                                            if(xitem.isRule){
                                                                // csubnametxt = ((csubnametxt.substring(0, (Math.floor((this.state.perContentWidth - shelfreducewidth) / 9)))+(csubnametxt.length > (Math.floor((this.state.perContentWidth - shelfreducewidth) / 9))?"..":"")) +" - "+(xitem.ruleLevel?xitem.ruleLevel.substring(0,3):"-").toUpperCase());
                                                                csubnametxt = (this.props.isRTL === "rtl"?((xitem.ruleLevel?xitem.ruleLevel.substring(0,3):"-").toUpperCase()+" - "+csubnametxt):(csubnametxt+" - "+(xitem.ruleLevel?xitem.ruleLevel.substring(0,3):"-").toUpperCase()));

                                                            } /* else{
                                                                csubnametxt = (csubnametxt.substring(0, (Math.floor((this.state.perContentWidth - shelfreducewidth) / 7)))+(csubnametxt.length > (Math.floor((this.state.perContentWidth - shelfreducewidth) / 7))?"..":""));
                                                            } */
                                                            
                                                            return <React.Fragment key={xidx}><Col xs={(this.props.isAUIDisabled?6:4)} className={"percentage-title"+(xitem.isRule?" ruletxt":"")+(shelfreducewidth > 0?" shelftxt":"")} style={{padding:(this.props.isAUIDisabled?"0px 5px":"0px"),paddingLeft:20,position:"relative"}}>
                                                                    {xitem.isRule?<span className="rule-flag" style={{color: cscattxtcolor}}><BookmarkFillIcon size={14} /></span>:<></>}
                                                                    {xitem.catrect && xitem.catrect.isShelfCat?<span className="shelfitem-tag" style={{color: cscattxtcolor}}>{xitem.catrect.contain_shelves?xitem.catrect.contain_shelves.length:0} <ThreeBarsIcon size={10} /></span>:<></>}
                                                                    <CustomProgressBar showtooltip={true} fulltext={csubnametxt} text={csubnametxt} mainbarcolor={ccatcolor} isborder={xitem.isRule} mainbarpercentage={xitem.percentage} textcolor={cscattxtcolor} showsubbar="true" subbarpercentage={xitem.suggestedPercentage} />
                                                                </Col>
                                                                <Col xs={2} className="val-col aui-disable links">
                                                                    <ButtonGroup>
                                                                        {xitem.rule?<>
                                                                            {this.state.isDrawEnabled && this.state.selectedDrawCategory && xitem.id === this.state.selectedDrawCategory.id?<>
                                                                                    <Button variant="warning" onClick={() => this.toggleDrawShelveView(false)} size="sm"><FeatherIcon icon="check" size={12} /></Button>
                                                                                    <Button variant="danger" onClick={() => this.removeSelectShelve()} size="sm"><FeatherIcon icon="x" size={12} /></Button>
                                                                                </>:<>
                                                                                    <Button variant="primary" className='aui-disable' onClick={() => this.toggleDrawShelveView(true, xitem, xitem.parentidx, xitem.rectidx)} size="sm"><FeatherIcon icon="layout" size={12} /></Button>
                                                                                    <Button variant="primary" onClick={e => this.redirectList(e, xitem)} size="sm"><FeatherIcon icon="copy" size={12} /></Button>
                                                                                </>}
                                                                        </>:<></>}

                                                                        <>
                                                                            {xitem.catrect && this.state.isDrawEnabled && this.state.selectedDrawCategory && xitem.catrect.id === this.state.selectedDrawCategory.id?<>
                                                                                <Button variant="warning" onClick={() => this.toggleDrawShelveView(false)} size="sm"><FeatherIcon icon="check" size={12} /></Button>
                                                                                <Button variant="danger" onClick={() => this.removeSelectShelve()} size="sm"><FeatherIcon icon="x" size={12} /></Button>
                                                                            </>:<>
                                                                                {xitem.catrect?<Button variant="primary" className='aui-disable' onClick={() => this.toggleDrawShelveView(true, xitem.catrect, xitem.catrect.parentidx, xitem.catrect.rectidx)} size="sm"><FeatherIcon icon="layout" size={12} /></Button>:<></>}
                                                                                <Button variant="primary" onClick={e => this.redirectList(e, xitem)} size="sm"><FeatherIcon icon="copy" size={12} /></Button>
                                                                            </>}
                                                                        </>

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
                    <Col className="bottom-single slider-content" xs={12} lg={5}  style={this.props.isRTL === "rtl"?{paddingRight:"0px"}:{paddingLeft:"0px"}}>
                        <Col className='sub-content sub-wrapper' style={{padding:"15px 35px",paddingBottom: "0px"}}>
                            {this.state.isCardsShow && this.props.chartEnabled===true?<>
                                <MpSliderContent 
                                    defSaveObj={this.state.defSaveObj} 
                                    deptid={deptid} 
                                    isRTL={this.props.isRTL}
                                    isRulesDeleted={this.state.isRulesDeleted}
                                    summaryViewType={this.props.summaryViewType} 
                                    redirectToCategory={this.props.redirectToCategory} 
                                    selectedCatgory={this.state.selectedCatgory}
                                    chartFilterDates={this.props.chartFilterDates}
                                    sliderIndex = {this.props.sliderIndex}
                                    ruleIdList={this.state.ruleIdList}
                                    saveCategoryObj= {this.saveCategoryObj} 
                                    updateCatDataPanel={this.updateCatDataPanel}
                                />
                            </>:<></>}
                        </Col>
                    </Col>
                </Row>

            </Col>

            {this.state.isaddcatmodal?
            <MPselectcategory 
                defSaveObj={this.state.defSaveObj} 
                loadDunitList={this.state.loadDunitList} 
                loadedSuppliersList={this.state.loadedSuppliersList} 
                loadedCategoryList={this.state.loadedCategoryList} 
                isaddcatmodal={this.state.isaddcatmodal} 
                isRTL={this.props.isRTL} 
                showcatiteminmodal={this.state.showcatiteminmodal} 
                fieldTotalCount={this.state.fieldTotalCount} 
                isupdatecategory={this.state.isupdatecategory}
                updateCategoryObj={this.state.updateCategoryObj} 
                updateCatIdx={this.state.updateCatIdx}
                loadMoreDunits={this.loadMoreDunits} 
                toggleCategoryModal={this.toggleCategoryModal} 
                handleSelectfield={this.handleSelectfield} 
                handleAddCateory={this.handleAddCateory} 
                updateFromChild={this.updateFromChild}
                />
            :<></>}

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
    setNewProdCountCat: (payload) => dispatch(setNewProdCountCatAction(payload)),
    setNewProdCountSubCat: (payload) => dispatch(setNewProdCountSubCatAction(payload))
});

export default withTranslation()(withRouter(connect(mapStateToProps,mapDispatchToProps)(CategoryContent)));