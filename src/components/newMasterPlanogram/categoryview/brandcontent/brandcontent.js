import React, { Component } from 'react';
import { Col, Row, Button, Dropdown, Breadcrumb, ButtonGroup, FormSelect } from 'react-bootstrap';
import { connect } from 'react-redux';
import { withTranslation } from 'react-i18next';
import { withRouter, Link, Prompt } from 'react-router-dom'; //
import { PlusIcon, XIcon, CopyIcon } from '@primer/octicons-react';
//import randomColor from 'randomcolor';
import { v4 as uuidv4 } from 'uuid'; //unique id
import FeatherIcon from 'feather-icons-react';
import Select from 'react-select';

import { selectedMasterPlanSetAction, selectedMPCategorySetAction, selectedMPCategoryRectSetAction, selectedMPSubCatSetAction, selectedMPBrandSetAction, setNewProdCountCatAction, setNewProdCountSubCatAction } from '../../../../actions/masterPlanogram/masterplanogram_action';

import { submitCollection } from '../../../../_services/submit.service';
import { submitSets } from '../../../UiComponents/SubmitSets';
import { AcViewModal } from '../../../UiComponents/AcImports';

import { checkColorIsLight, measureConverter, roundOffDecimal } from '../../../../_services/common.service';
import { reCheckSnapRects, saveObjDataConvert, getNameorIdorColorofBox, RuleWarningValidations, validateDeptSettings, 
    convertWidthPercent, getRectPercentage, findResolutionType, TooltipWrapper } from '../../AddMethods'; //, convertWidthPercent
import { catRectEnums, catRuleEnums } from '../../../../enums/masterPlanogramEnums';

import MPDrawing from './MPDrawing/MPDrawing';
import MPDeptMetaForm from '../../departmentview/deptquestions/formcontainer';
import DataRuleContent from '../DataRulesContent/druleContent';
import MpSliderContent from '../sliderContent';
import MPRulesAdd from '../rulesadd/rulesadd';

import CustomProgressBar from '../../../common_layouts/customProgressBar';
import { alertService } from '../../../../_services/alert.service';
import loaderanime from '../../../../assets/img/loading-sm.gif';

export class BrandContent extends Component {
    constructor(props){
        super(props);

        this.additemElement = React.createRef();
        this._loadingTimeout = null;
        this.perContentDiv = React.createRef();

        this.state = {
            defSaveObj: null, selectedCatgory: null, selectedCatRect: null, selectedRuleObj: {},
            isLoadDrules: false, ruleIdList: [],
            addselectcat: null, selectedSubCat: null, showbrand: null,
            isChangesAvailable: false,
            loadedAllBrandsList: [], selectBrandsList: [],
            percentagesLoadQueque: [], isPercentagesLoading: false,
            loadedBrandPercentages: [], bkpBrandPercentages: [],
            showNavigationView: false,
            iscatAddedOnetime: false,
            //
            loadedSuppliersList: [], selectSupplierList: [],

            activeDrawType: "subc", //subc, supp, brand
            isEnableDraw: true, selectedDraw: null, oneTimeConvert: true,
            divWidth: 0, divHeight: 0, displayUOM: "cm",
            showResolutionCount: 1,
            //history points
            historyData: { past: [], present: 0, future: [] },
            //toolbox actions
            activeTool: "default",
            isShowLoadingModal: false,
            percentageDropList: [], 
            //suppliers add
            isSupplierView: false, 
            //dept view toggle
            isDeptView: false, isonetimeload: true,
            //cut boxes
            cutBoxList: [],
            //bottom added list
            bottomAddedList: [], brandAddObj: {selectrect: 0, selectbrand: 0},

            brandDataPanelData: [], isDataPanelLoading: true,

            perContentWidth: 0,
        }
    }

    componentDidMount() {
        
        //console.log(this.props.masterPlanogramState);
        if(this.props.masterPlanogramState && this.props.masterPlanogramState.mpDetails){
            this.setState({ defSaveObj: this.props.masterPlanogramState.mpDetails });
        }
        
        if(this.props.masterPlanogramState && this.props.masterPlanogramState.mpCatDetails){
            this.setState({ selectedCatgory: JSON.parse(JSON.stringify(this.props.masterPlanogramState.mpCatDetails)) });
        }

        if(this.props.masterPlanogramState && this.props.masterPlanogramState.mpCatRectDetails){
            this.setState({ selectedCatRect: JSON.parse(JSON.stringify(this.props.masterPlanogramState.mpCatRectDetails)) });
        }

        if(this.props.masterPlanogramState && this.props.masterPlanogramState.mpSubCatDetails){
            let crescount = findResolutionType(1);

            let csubobj = this.props.masterPlanogramState.mpSubCatDetails;
            let iscatrulebased = (csubobj.type === catRectEnums.rule);
            
            let ruleobj = null;
            if(iscatrulebased){
                ruleobj = {
                    level: csubobj.rule.level,
                    id: getNameorIdorColorofBox(csubobj, "num"),
                    mpid: csubobj.rule.id
                }
            }
            
            this.setState({ 
                showResolutionCount: crescount,
                selectedSubCat: JSON.parse(JSON.stringify(this.props.masterPlanogramState.mpSubCatDetails)), 
                selectedRuleObj: ruleobj, 
                isShowLoadingModal: true,
                showNavigationView: true,
                perContentWidth: (this.perContentDiv.current && this.perContentDiv.current.offsetWidth?(this.perContentDiv.current.offsetWidth - 25):0)
            }, 
            () => {
                let subcatid = (csubobj.type === catRectEnums.default?csubobj.sub_category.subCategoryId:-1);
                
                this.getAllBrands(subcatid, csubobj.type, ruleobj);

                if(this.props.isneeddeptsettingvalid){
                    this.toggleDeptView(true, true);
                }

                //this.getAllSuppliers(subcatid, csubobj.type, ruleobj);
                setTimeout(() => {
                    this.setState({ isonetimeload: false });
                }, 200);
            });
        }
    }

    componentWillUnmount(){
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

    //load all brands of selected sub category
    getAllBrands = (subcatid, ctype, ruleobj) => {
        var cdefSaveObj = this.state.defSaveObj;
        // let selcat = this.state.selectedSubCat;
        // let supid = (selcat.type === catRectEnums.rule?getNameorIdorColorofBox(selcat, "num"):0);

        let selcatobj = this.state.selectedCatRect;
        let iscatrulebased = (selcatobj.type === catRectEnums.rule);

        let catruleobj = null;
        if(iscatrulebased){
            catruleobj = {
                level: selcatobj.rule.level,
                id: getNameorIdorColorofBox(selcatobj, "num"),
            }
        }

        let svobj = { 
            isCatRuleBased: iscatrulebased,
            catRuleObj: (catruleobj?catruleobj:{}),
            subCategoryId: subcatid, 
            isRuleBased: (ruleobj?true:false),
            mpRuleId: (ruleobj?ruleobj.mpid:0),
            departmentId: (cdefSaveObj?cdefSaveObj.department.department_id:-1)
        };

        submitSets(submitCollection.mpBrandList, svobj).then(res => {
            //console.log(res.extra);

            if(res && res.status && res.extra){
                let selectbrandlist = (res.extra.length > 0?res.extra.map((xitem, xidx) => {
                    return {value: xidx, label: xitem.brandName};
                }):[])

                this.setState({ loadedAllBrandsList: res.extra, selectBrandsList: selectbrandlist });
            }
        });

        //this.setState({ loadedAllBrandsList: samplebrandsarr });
    }
    //load all brands of selected sub category
    getBrandPercentages = (isruleupdate, isreloadall, isonload) => {
        if(isruleupdate){
            this._loadingTimeout = setTimeout(() => {
                var cdefSaveObj = this.state.defSaveObj;
                let mpid = (cdefSaveObj?cdefSaveObj.mp_id:-1);

                let selcatobj = this.state.selectedCatRect;
                let catrectid = (selcatobj.type === catRectEnums.default?selcatobj.category.category_id:-1);
                let iscatrulebased = (selcatobj.type === catRectEnums.rule);

                let catruleobj = null;
                if(iscatrulebased){
                    catruleobj = {
                        level: selcatobj.rule.level,
                        id: getNameorIdorColorofBox(selcatobj, "num"),
                    }
                }

                let csubobj = this.state.selectedSubCat;
                let subcatid = (csubobj.type === catRectEnums.default?csubobj.sub_category.subCategoryId:-1);
                let isscatrulebased = (csubobj.type === catRectEnums.rule);
                
                let ruleobj = null;
                if(isscatrulebased){
                    ruleobj = {
                        level: csubobj.rule.level,
                        id: getNameorIdorColorofBox(csubobj, "num"),
                    }
                }

                let svobj = { 
                    mpId: mpid,
                    departmentId: (cdefSaveObj?cdefSaveObj.department.department_id:-1),
                    categoryId: catrectid,
                    mpCatHasBoxId: selcatobj.id,
                    isCatRuleBased: iscatrulebased,
                    catRuleObj: (catruleobj?catruleobj:{}),
                    subCategoryId: subcatid,
                    mpHasCatHasSubCatid: csubobj.mpHasCatHasSubCatid, 
                    isSubCatRuleBased: (ruleobj?true:false),
                    subCatRuleObj: (ruleobj?ruleobj:{}),
                    fromDate: this.props.chartFilterDates.fromdate,
                    endDate: this.props.chartFilterDates.todate,
                    mpRuleIds: (csubobj.otherMpRuleIds?csubobj.otherMpRuleIds:[]),
                };

                if(!this.state.isPercentagesLoading){
                    this.continuePercentageLoad(svobj, isruleupdate, isonload);
                } else{
                    let searchobj = svobj;
                    searchobj["isruleupdate"] = isruleupdate;
                    searchobj["isonload"] = isonload;
                    this.setState({ percentagesLoadQueque: [searchobj] });
                }
            }, 500);
        } else{
            this.compareSubCategoryData(isreloadall, isonload);
        }
    }
    continuePercentageLoad = (svobj, isruleupdate, isonload) => {
        this.setState({ isPercentagesLoading: true }, () => {
            submitSets(submitCollection.mpBrandPercentage, svobj).then(res => {
                //console.log(res.extra);

                if(res && res.status && res.extra){
                    this.setState({ isPercentagesLoading: false, loadedBrandPercentages: res.extra, bkpBrandPercentages: res.extra, isShowLoadingModal: false }, () => {
                        this.compareSubCategoryData(isruleupdate, isonload);

                        //check percentages queque data available
                        if(this.state.percentagesLoadQueque && this.state.percentagesLoadQueque.length > 0){
                            let quequelist = JSON.parse(JSON.stringify(this.state.percentagesLoadQueque));
                            let firstquequeitem = quequelist[0];

                            this.setState({ percentagesLoadQueque: [] }, () => {
                                this.continuePercentageLoad(firstquequeitem, firstquequeitem.isruleupdate, firstquequeitem.isonload);
                            });
                        }
                    });
                } else{
                    this.setState({ isPercentagesLoading: false, percentagesLoadQueque: [], isShowLoadingModal: false });
                }
            });  
        });
    }
    //load all suppliers
    getAllSuppliers = (selcatid, ctype, ruleobj) => {
        var cdefSaveObj = this.state.defSaveObj;

        var csobj={
            isRuleBased: (ruleobj?true:false),
            mpRuleId: (ruleobj?ruleobj.id:0),
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
     //brands list compare with added brands list
     compareSubCategoryData = (isruleupdate, isonload) => {
        let selectedCatRect = this.state.selectedCatRect;
        let selectedSubCategory = this.state.selectedSubCat;
        let iscatAddedOnetime = this.state.iscatAddedOnetime;
        
        //get original percentage list from backup
        let loadedBrandPercentages = JSON.parse(JSON.stringify(this.state.bkpBrandPercentages));

        //sort by rec per highest 
        loadedBrandPercentages = loadedBrandPercentages.sort((a, b) => (b.suggestedPercentage - a.suggestedPercentage));

        //temp - 
        /* let tempbrandlist = [];
        for (let k = 0; k < selectedCatRect.sub_categories.length; k++) {
            const citem = selectedCatRect.sub_categories[k];
            if(!citem.isDelete && selectedSubCategory.id === citem.id){
                for (let l = 0; l < citem.rects.length; l++) {
                    const rectitem = citem.rects[l];
                    if(!rectitem.isDelete){
                        for (let z = 0; z < rectitem.brands.length; z++) {
                            const rbranditem = rectitem.brands[z];
                            if(!rbranditem.isDelete && rbranditem.type === catRectEnums.default){
                                let isbrandadded = tempbrandlist.filter( z => z.brandId === rbranditem.brand.brandId);

                                if(!isbrandadded || isbrandadded.length === 0){
                                    let tempbrandobj = JSON.parse(JSON.stringify(rbranditem.brand));
                                    tempbrandobj["suggestedPercentage"] = 0;
                                    tempbrandobj["percentage"] = 0;
                                    tempbrandlist.push(tempbrandobj);
                                }
                            }
                        }
                    }
                }
            }
        }
        loadedBrandPercentages = tempbrandlist; */
        //console.log(tempbrandlist);

        let rulebaselist = []; let bottomaddedlist = []; let ruleids = [];
        for (let i = 0; i < loadedBrandPercentages.length; i++) {
            const categoryitem = loadedBrandPercentages[i];
            
            let catfinditems = [];
            for (let k = 0; k < selectedCatRect.sub_categories.length; k++) {
                const citem = selectedCatRect.sub_categories[k];
                if(!citem.isDelete && selectedSubCategory.id === citem.id){
                    for (let l = 0; l < citem.rects.length; l++) {
                        const rectitem = citem.rects[l];
                        if(!rectitem.isDelete){
                            let findbranditem = [];
                            for (let z = 0; z < rectitem.brands.length; z++) {
                                const rbranditem = rectitem.brands[z];
                                if(!rbranditem.isDelete && rbranditem.type === catRectEnums.default && rbranditem.brand.brandId === categoryitem.id){
                                    rbranditem["subcatidx"] = k;
                                    rbranditem["subrectidx"] = l;
                                    rbranditem["brandidx"] = z;

                                    findbranditem.push(rbranditem);
                                }
                            }
                            
                            if(findbranditem && findbranditem.length > 0){
                                catfinditems = catfinditems.concat(findbranditem);
                            } else{
                                //find rule items
                                let findruleitems = rectitem.brands.filter(x => !x.isDelete && x.type === catRectEnums.rule);
                                //not already added items
                                let notaddedrules = [];
                                for (let x = 0; x < findruleitems.length; x++) {
                                    const isalreadyadded = rulebaselist.findIndex(z => z.id === findruleitems[x].id);
                                    if(isalreadyadded === -1){
                                        notaddedrules.push(findruleitems[x]);
                                        ruleids.push({level: findruleitems[x].rule.level, id: getNameorIdorColorofBox(findruleitems[x], "num"), isNew: (findruleitems[x].isNew === true?findruleitems[x].isNew:false)}); //, mpRuleId: (!findruleitems[x].isNew?findruleitems[x].rule.id:-1)
                                    }
                                }
                                rulebaselist = rulebaselist.concat(notaddedrules);
                            }
                        }
                    }
                    break;
                }
            }
            
            //console.log(catfinditems);
            if(catfinditems && catfinditems.length > 0){
                let totalcatitems = 0;
                for (let l = 0; l < catfinditems.length; l++) {
                    const catfinditem = catfinditems[l];
                    if(catfinditem.percentage > 0){
                        totalcatitems = (totalcatitems + catfinditem.percentage);
                    }
                }

                //create new object for added list
                let newbrandobj = {
                    brandId: categoryitem.id,
                    brandName: categoryitem.name,
                    brandColor: categoryitem.color,
                    brandItems: catfinditems,
                    percentage: roundOffDecimal(totalcatitems,2),
                };
                bottomaddedlist.push(newbrandobj);

                categoryitem["percentage"] = roundOffDecimal(totalcatitems,2);
            } else{
                categoryitem["percentage"] = 0;
            }
        }
        //console.log(rulebaselist);
        /* loadedBrandPercentages = loadedBrandPercentages.concat(rulebaselist); */

        //if only available one percentage and it's not added onload
        if(isonload && !iscatAddedOnetime && loadedBrandPercentages.length === 1 && loadedBrandPercentages[0].percentage === 0){
            let findselidx = this.state.loadedAllBrandsList.findIndex(x => x.brandId === (loadedBrandPercentages[0].brand?getNameorIdorColorofBox(loadedBrandPercentages[0], "num"):loadedBrandPercentages[0].id));
            if(findselidx > -1){
                iscatAddedOnetime = true;
                let brandAddObj = this.state.brandAddObj;
                brandAddObj.selectbrand = { value: findselidx, label: "-"};
                
                this.setState({ brandAddObj: brandAddObj, iscatAddedOnetime: iscatAddedOnetime }, () => {
                    this.addNewSubCategory();
                });
            }
        }
        
        /* if(isrulechange){
            this.props.clearDataCaches("product"); //clear data cache
        } */
        
        this.setState({ loadedBrandPercentages: loadedBrandPercentages, iscatAddedOnetime: iscatAddedOnetime, bottomAddedList: bottomaddedlist, isLoadDrules: !isruleupdate, ruleIdList: ruleids }, () => {
            this.setState({ isLoadDrules: true });
        });
    }

    setRects = (rects, cutlist, isruleupdate, isreloadall) => {
        let selsubcat = this.state.selectedSubCat;
        this.fieldHistoryAdd(JSON.parse(JSON.stringify(this.state.selectedCatRect)),1,JSON.parse(JSON.stringify(this.state.cutBoxList)));
        
        let ccatobj = this.state.selectedCatRect;
        ccatobj["sub_categories"] = [];
        
        for (let i = 0; i < rects.length; i++) {
            const subcatitem = rects[i];
            
            if(!subcatitem.isDelete && subcatitem.id === selsubcat.id){
                for (let l = 0; l < subcatitem.rects.length; l++) {
                    const rectitem = subcatitem.rects[l];
                    
                    if(!rectitem.isDelete){
                        for (let k = 0; k < rectitem.brands.length; k++) {
                            const branditem = rectitem.brands[k];
                            
                            if(!branditem.isDelete){
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

                                //get total percetange count
                                let totalbrandper = 0;
                                for (let x = 0; x < branditem.rects.length; x++) {
                                    const brectitem = branditem.rects[x];
                                    if(!brectitem.isDelete){
                                        totalbrandper = (totalbrandper + brectitem.percentage);
                                    }
                                }
                                branditem["percentage"] = roundOffDecimal(totalbrandper,2);
                            }
                            
                        }    
                    }
                    
                }
                break;    
            }
        }
        //console.log(rects);

        this.setState({ selectedCatRect: ccatobj,}, () => {
            ccatobj["sub_categories"] = rects;
            this.setState({ selectedCatRect: ccatobj }, () => {
                this.getBrandPercentages(isruleupdate, isreloadall);

                if(cutlist){
                    this.updateCutList(cutlist);
                }
            });
        });
    }

    handleGoBack = () => {
        this.props.history.push("/masterplanograms/details");
    }

    addNewSubCategory = (e) => {
        let defsaveobj = JSON.parse(JSON.stringify(this.state.defSaveObj));
        let bkpsaveobj = JSON.parse(JSON.stringify(this.state.selectedCatRect));

        let cparentcat = this.state.selectedCatgory;
        let csaveobj = this.state.selectedCatRect;
        
        let selectedbrandtxt = this.state.selectedSubCat.id;
        
        let rectidx = this.state.brandAddObj.selectrect;

        let brandidx = (this.state.brandAddObj.selectbrand?this.state.brandAddObj.selectbrand:null);
        
        if(brandidx){
            let brandobj = this.state.loadedAllBrandsList[(brandidx?brandidx.value:-1)];
            
            let subcitem = csaveobj.sub_categories.findIndex(z => z.id === selectedbrandtxt);
            let isalreadyadded = null; let brandnotdeleted = [];
            let totalrectwidth = 0;
            for (let i = 0; i < csaveobj.sub_categories[subcitem].rects.length; i++) {
                const rectitem = csaveobj.sub_categories[subcitem].rects[i];
                
                if(!rectitem.isDelete){
                    if(!isalreadyadded){
                        isalreadyadded = rectitem.brands.find(z => (!z.isDelete && z.type === catRectEnums.default && z.brand.brandId === brandobj.brandId));
                    }

                    let cbrandnotdeleted = (rectitem && rectitem.brands && rectitem.brands.length > 0?rectitem.brands.filter(bitem => !bitem.isDelete):[]);
                    brandnotdeleted = brandnotdeleted.concat(cbrandnotdeleted);

                    totalrectwidth = (totalrectwidth + (rectitem.width * rectitem.contain_shelves.length));
                }
            }
            
            if(!isalreadyadded){
                this.fieldHistoryAdd(bkpsaveobj,1,JSON.parse(JSON.stringify(this.state.cutBoxList)));
                
                //if only one brand and it's 100 percent
                let isRectCanDraw = false; let drawRectObj = [];
                let ismultipleRects = 0;
                let suggestedper = 0;
                if(brandnotdeleted && brandnotdeleted.length === 0 &&this.state.loadedBrandPercentages && this.state.loadedBrandPercentages.length > 0){
                    let findBrandPerMoreItems = this.state.loadedBrandPercentages.filter(peritem => peritem.suggestedPercentage > 0);

                    let findBrandPerItem = findBrandPerMoreItems.find(peritem => (peritem.id === brandobj.brandId));
                    suggestedper = (findBrandPerItem?findBrandPerItem.suggestedPercentage:0);

                    if(findBrandPerMoreItems && findBrandPerMoreItems.length === 1){
                        if(findBrandPerItem && findBrandPerItem.suggestedPercentage > 5){
                            let csubcatrects = JSON.parse(JSON.stringify(csaveobj.sub_categories[subcitem].rects));
                            ismultipleRects = csubcatrects.length;

                            for (let k = 0; k < csubcatrects.length; k++) {
                                const csubcatrect = csubcatrects[k];
                                
                                let newcontainShelfs = [];
                                csubcatrect.contain_shelves.forEach(ncontainshelf => {
                                    ncontainshelf["id"] = uuidv4();
                                    newcontainShelfs.push(ncontainshelf);
                                });
    
                                let bwidthperwidth = convertWidthPercent(findBrandPerItem.suggestedPercentage,csubcatrect.width,true);
                                
                                isRectCanDraw = true;

                                let newbrandobj = { 
                                    id: uuidv4(), isNew: true, isDelete: false, 
                                    x: csubcatrect.x, y: csubcatrect.y, width: bwidthperwidth, 
                                    height: csubcatrect.height,
                                    contain_shelves: newcontainShelfs, isSnapped: false, 
                                    box_width_percentage: csubcatrect.box_width_percentage, 
                                    percentage: csubcatrect.percentage, 
                                };

                                let checkpercentage = getRectPercentage(newbrandobj, totalrectwidth, csubcatrect, true);
                                newbrandobj.box_width_percentage = checkpercentage.box_percentage;
                                newbrandobj.percentage = checkpercentage.percentage;
                                
                                drawRectObj.push(newbrandobj);
                            }
                        }
                    }
                }

                let newbrandobj = {
                    id: uuidv4(),
                    brand: { brandId: brandobj.brandId, brandName: brandobj.brandName, color: (brandobj.brandColor?brandobj.brandColor:"#5128a0") },
                    isNew: true, isDelete: false,
                    type: catRectEnums.default,
                    rule: {}, 
                    rects: (isRectCanDraw && drawRectObj.length > 0?[drawRectObj[0]]:[]),
                    percentage: (isRectCanDraw && drawRectObj.length > 0?drawRectObj[0].percentage:0),
                    uuid: "", isSnapped: false
                }

                let findruleadded = RuleWarningValidations("brand", defsaveobj, brandobj.brandId, cparentcat.id, csaveobj.id, csaveobj.sub_categories[subcitem].id, false, catRuleEnums.brand);
                // console.log(findruleadded);
                newbrandobj["isRuleParentAdded"] = findruleadded.isAdded;
                newbrandobj["isRuleParentList"] = findruleadded.addedRuleList;
                // console.log(newbrandobj);
                
                if(findruleadded.isAdded && suggestedper === 0){
                    let firstitem = findruleadded.addedRuleList[0];
                    let firstleveltype = (" "+(firstitem.foundLevel === "cat"?this.props.t("category"):this.props.t("subcategory")));
                    let placename = (findruleadded.addedRuleList.length > 1?(" "+(findruleadded.addedRuleList.length)+" "+this.props.t("PLACES")):firstleveltype);
                    
                    alertService.warn(this.props.t("THIS_BRAND_IS_ALREADY_ADDED_RULE")+placename);
                    return false;
                }

                if(isRectCanDraw && ismultipleRects && drawRectObj.length > 1){
                    for (let m = 0; m < csaveobj.sub_categories[subcitem].rects.length; m++) {
                        const scubrect = csaveobj.sub_categories[subcitem].rects[m];

                        let newotherrectbrand = JSON.parse(JSON.stringify(newbrandobj));
                        newotherrectbrand.id = uuidv4();
                        newotherrectbrand.rects = (drawRectObj[m]?[drawRectObj[m]]:[]);
                        newotherrectbrand.percentage = (drawRectObj[m]?drawRectObj[m].percentage:0);

                        scubrect.brands.push(newotherrectbrand);
                    }
                } else{
                    csaveobj.sub_categories[subcitem].rects[rectidx].brands.push(newbrandobj);
                }
                //console.log(csaveobj);

                this.setState({ selectedCatRect: csaveobj }, () => {
                    if(!isRectCanDraw){
                        this.handleSelectDraw(newbrandobj,selectedbrandtxt);
                    }
                    this.getBrandPercentages(false, true);
                });
            } else{
                alertService.error(this.props.t("ALREADY_ADDED"));
                if(e){
                    e.preventDefault();
                }
            }
        } else{
            alertService.error(this.props.t("SELECT_BRAND"));
            if(e){
                e.preventDefault();
            }
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
        //console.log(getsobj);
        var cfutureobj = { type:getsobj.type, obj:JSON.parse(JSON.stringify(this.state.selectedCatRect)), cutlist: cutBoxList };
        chobj.future.push(cfutureobj);
        chobj.past.splice(-1,1);
        
        let isChangesAvailable = (chobj.past.length === 0?false:this.state.isChangesAvailable);

        this.setState({
            selectedCatRect: null, isChangesAvailable: isChangesAvailable
        }, () => {
            this.props.updateSavefromChild(null, isChangesAvailable);

            this.setState({ selectedCatRect: getsobj.obj, historyData: chobj, cutBoxList: getsobj.cutlist }, () => {
                clearTimeout(this._loadingTimeout);
                this.getBrandPercentages(false, true);
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
        
        this.setState({
            selectedCatRect: null,
        }, () => {
            this.setState({ selectedCatRect: getsobj.obj, historyData: chobj, cutBoxList: getsobj.cutlist }, () => {
                clearTimeout(this._loadingTimeout);
                this.getBrandPercentages(false, true);
            });
        });
    }
    //changes
    handleChangeBrandCat = (e, changetype) => {
        let selectobj = this.state.brandAddObj;
        selectobj[changetype] = e.target.value;

        this.setState({ brandAddObj: selectobj });
    }
    //toggle draw enable
    toggleEnableDraw = () => {
        this.setState({ isEnableDraw: !this.state.isEnableDraw });
    }
    //convert & save category objects
    saveCategoryObj = (isproductredirect, branditem, isbrandredirect, selbranditem, istogglesummary, sumtype, sumevt) => {
        // console.log("brand")
        //check brand draw available
        let selectedbrandid = -1;
        //let brandidarr = [];
        
        if(isproductredirect){
            if(branditem.brandItems && branditem.brandItems.length > 0){
                selectedbrandid = branditem.brandId;

                let isnoboxavailable = false;
                for (let l = 0; l < branditem.brandItems.length; l++) {
                    const brandrectitem = branditem.brandItems[l];
                    //add to brands id list
                    //brandidarr.push(brandrectitem.id);
                    //check not deleted rects count
                    if(branditem.brandItems.length === 1 || (brandrectitem.rects && brandrectitem.rects.length > 0)){
                        let notdeletedrectlist = brandrectitem.rects.filter(x => !x.isDelete);
                        if(!notdeletedrectlist || notdeletedrectlist.length === 0){
                            isnoboxavailable = true;
                        }
                    }
                }
                
                if(isnoboxavailable && !isbrandredirect){
                    alertService.error(this.props.t("drawboxesfirst"));
                    return false;
                }
            }
        }

        let exportsave = this.state.defSaveObj;
        let exportcat = JSON.parse(JSON.stringify(this.state.selectedCatgory));
        let exportcatrect = JSON.parse(JSON.stringify(this.state.selectedCatRect));
        
        //update main category object with new rect object
        let findcatrectidx = exportcat.rects.findIndex(x => x.id === exportcatrect.id);
        exportcat.rects[findcatrectidx] = exportcatrect;

        let exportsubcat = JSON.parse(JSON.stringify(this.state.selectedSubCat));
        
        //new category save obj
        let newsaveobj = {
            mpId: exportsave.mp_id, 
            mpCategoryBoxId: exportcatrect.id,
            mpCatHasSubCatId: exportsubcat.mpHasCatHasSubCatid,
            mpSubCategoryRects: [] 
        };

        let returncatobj = saveObjDataConvert(exportcat, false, this.state.divWidth, null, true, exportsubcat.id);
        let returnrectobj = returncatobj.rects[findcatrectidx];
        //console.log(returncatobj);
        
        if(this.state.isChangesAvailable){

            for (let i = 0; i < returnrectobj.sub_categories.length; i++) {
                const subcatitem = returnrectobj.sub_categories[i];
                
                if(subcatitem.id === exportsubcat.id ){
                    
                    for (let j = 0; j < subcatitem.rects.length; j++) {
                        const rectitem = subcatitem.rects[j];
                        
                        let newrectobj = {
                            mpSubCategoryRectId: rectitem.id, 
                            brands: []
                        };

                        for (let k = 0; k < rectitem.brands.length; k++) {
                            const branditem = rectitem.brands[k];
                            
                            let newruleobj = {};
                            if(branditem.type === catRectEnums.rule){
                                newruleobj = {
                                    id: branditem.rule.id,
                                    level: branditem.rule.level,
                                    supplier: (branditem.rule.level === catRuleEnums.sup?{ supplierId: getNameorIdorColorofBox(branditem, "num") }:{}),
                                    /* isNew: branditem.rule.isNew,
                                    isDelete: branditem.rule.isDelete, */
                                };
                            }

                            let newbrandobj = {
                                id: branditem.id,
                                brand: (branditem.type === catRectEnums.default?{brandId: branditem.brand.brandId}:{}),
                                type: branditem.type,
                                isNew: (branditem.isNew?branditem.isNew:false),
                                isDelete: (branditem.isDelete?branditem.isDelete:false),
                                rule: newruleobj,
                                rects: [],
                            };

                            if(branditem.rects && branditem.rects.length > 0){
                                let notdeletedrects = 0;
                                for (let z = 0; z < branditem.rects.length; z++) {
                                    const brectitem = branditem.rects[z];
                                    
                                    if(!brectitem.isDelete){
                                        notdeletedrects += 1;
                                    }

                                    let newbrandrectobj = {
                                        id: brectitem.id,
                                        x: brectitem.x,
                                        //width: (brectitem.width?brectitem.width:0),
                                        box_width_percentage: (brectitem.box_width_percentage?brectitem.box_width_percentage:0),
                                        width: (brectitem.width?brectitem.width:0),
                                        isSnapped: brectitem.isSnapped,
                                        contain_shelves: (brectitem.contain_shelves?brectitem.contain_shelves:[]),
                                        isNew: (brectitem.isNew?brectitem.isNew:false),
                                        isDelete: (brectitem.isDelete?brectitem.isDelete:false)
                                    }

                                    newbrandobj.rects.push(newbrandrectobj);
                                }
                                
                                if(!branditem.isDelete && notdeletedrects === 0){
                                    alertService.error(this.props.t("SOME_BRAND_NOBOXES"));
                                    return false;
                                }
                                
                                newrectobj.brands.push(newbrandobj);
                            } else{
                                if(!newbrandobj.isNew){
                                    newbrandobj.isDelete = true;
                                    newrectobj.brands.push(newbrandobj);
                                }
                            }
                        }

                        newsaveobj.mpSubCategoryRects.push(newrectobj);
                    }
                    break;
                }
            }

            //console.log(newsaveobj);
            //save
            this.setState({ isShowLoadingModal: true, activeTool: "default", selectedDraw: null }, () => {
                submitSets(submitCollection.saveMpBrands, newsaveobj, false, null, true).then(res => {
                    //console.log(res.extra);

                    if (res && res.status) {
                        this.setState({ isChangesAvailable: false }, () => {
                            this.props.clearDataCaches("all"); //clear data cache

                            alertService.success(this.props.t("brandssavedsuccess"));
                            this.loadMPDetails(isproductredirect, returncatobj, returnrectobj, exportsubcat, branditem, isbrandredirect, selbranditem, istogglesummary, sumtype, sumevt);
                        });
                    } else{
                        // alertService.error((res.error && res.error && res.error.errorMessage)?res.error.errorMessage:this.props.t("ERROR_OCCURRED"));
                        this.setState({ isShowLoadingModal: false });
                    }
                });
            });

        } else{
            if(isproductredirect || isbrandredirect){
                returncatobj["field_obj"] = returncatobj.bkpfield;
                returncatobj["sub_categories"] = returncatobj.bkpsubcats;
                
                this.redirectViewHandle(isproductredirect, returncatobj, returnrectobj, exportsubcat, selectedbrandid, isbrandredirect, selbranditem);
            } else{
                alertService.error(this.props.t("NO_CHANGES_AVAILABLE"));
            }
        }
    }
    //load mp details
    loadMPDetails = (isproductredirect, catobj, catrectobj, subcatobj, brandobj, isbrandredirect, selbranditem, istogglesummary, sumtype, sumevt) => {
        let csaveobj = this.state.defSaveObj;

        let svobj;
        if(csaveobj.mp_id > -1){
            svobj = { chainHasDepartmentId: csaveobj.department.department_id, mp_id: csaveobj.mp_id };
        } else{
            if(csaveobj.mp_id === -2){
                svobj = { chainHasDepartmentId: csaveobj.department.department_id, mp_id: csaveobj.mp_id };
            } else{
                svobj = { chainHasDepartmentId: csaveobj.department.department_id };        
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
                    }, () => {
                        //find new category object
                        let foundcatobj = newsaveobj.categories.find(x => x.id === catobj.id);
                        
                        if(foundcatobj){
                            let foundcatrect = foundcatobj.rects.find(x => x.id === catrectobj.id);

                            if(foundcatrect){
                                let foundsubcatobj = foundcatrect.sub_categories.find(x => x.id === subcatobj.id);
                                
                                if(foundsubcatobj){
                                    if(isproductredirect){
                                        let foundbrandarr = [];
                                        for (let i = 0; i < foundsubcatobj.rects.length; i++) {
                                            const selrectobj = foundsubcatobj.rects[i];
                                            if(!selrectobj.isDelete){
                                                let filterbranditems = selrectobj.brands.filter(x =>  (x.brand.brandId === brandobj.brandId));
                                                
                                                for (let j = 0; j < filterbranditems.length; j++) {
                                                    foundbrandarr.push(filterbranditems[j].id);
                                                }
                                            }
                                        }
                                        
                                        if(foundbrandarr && foundbrandarr.length > 0){
                                            this.redirectViewHandle(isproductredirect, foundcatobj, foundcatrect, foundsubcatobj, brandobj.brandId, isbrandredirect, selbranditem);
                                        } else{
                                            alertService.error(this.props.t("brandnotfound"));
                                        }
                                    } else{
                                        this.redirectViewHandle(isproductredirect, foundcatobj, foundcatrect, foundsubcatobj, null, isbrandredirect, selbranditem, istogglesummary, sumtype, sumevt);
                                    }
                                    
                                } else{
                                    alertService.error(this.props.t("subcatnotfound"));
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
    redirectViewHandle = (isproductredirect, exportcat, exportcatrect, exportsubcat, exportbrand, isbrandredirect, selbranditem, istogglesummary, sumtype, sumevt) => {
        //update redux
        this.props.setMPCategoryAction(exportcat);
        this.props.setMPCategoryRectAction(exportcatrect);
        this.props.setMPSubCatAction(exportsubcat);
        this.props.setMasterPlanAction(this.state.defSaveObj);
        
        if(isproductredirect){
            //filter rule list and added to the sub cat list
            let subcatrules = (exportcatrect && exportcatrect.sub_categories?exportcatrect.sub_categories.filter(x => !x.isDelete && x.id !== exportsubcat.id && x.type === catRectEnums.rule).map(z => {
                return {level: z.rule.level, id: getNameorIdorColorofBox(z, "num")};
            }):[]);
            exportsubcat["otherMpRuleIds"] = subcatrules;
            
            this.props.setMPSubCatAction(exportsubcat);
            this.props.setMPBrandAction(exportbrand);
            this.props.redirectToCategory("product", exportbrand)
            //this.props.history.push("/masterplanograms/productdetails");
        } else if(isbrandredirect){
            //filter rule list and added to the sub cat list
            let subcatrules = (exportcatrect && exportcatrect.sub_categories?exportcatrect.sub_categories.filter(x => !x.isDelete && x.id !== selbranditem.id && x.type === catRectEnums.rule).map(z => {
                return {level: z.rule.level, id: getNameorIdorColorofBox(z, "num")};
            }):[]);
            selbranditem["otherMpRuleIds"] = subcatrules;
            
            this.props.redirectToCategory("brand", selbranditem)
        } else if(istogglesummary){
            this.props.toggleSummary(sumtype, this.state.isChangesAvailable, sumevt);
        } else{
            //filter rule list and added to the sub cat list
            let subcatrules = (exportcatrect && exportcatrect.sub_categories?exportcatrect.sub_categories.filter(x => !x.isDelete && x.id !== exportsubcat.id && x.type === catRectEnums.rule).map(z => {
                return {level: z.rule.level, id: getNameorIdorColorofBox(z, "num")};
            }):[]);
            exportsubcat["otherMpRuleIds"] = subcatrules;
            
            //this.props.history.push("/masterplanograms/details");
            let subcatobj = JSON.parse(JSON.stringify(exportsubcat));

            this.setState({ selectedSubCat: null }, () => {
                this.setState({ 
                    selectedCategory: exportcat,
                    selectedCatRect: exportcatrect,
                    selectedSubCat: subcatobj,
                    oneTimeConvert: true,
                    historyData: { past: [], present: 0, future: [] },
                }, () => {
                    // this.getBrandPercentages(true);
                });
            });
        }
    }
    //update div details
    updateDivDetails = (cwidth, cheight) => {
        if(this.state.oneTimeConvert){
            let exportsaveobj = JSON.parse(JSON.stringify(this.state.defSaveObj));
            //get selected category and sub category
            let exportcat = JSON.parse(JSON.stringify(this.state.selectedCatgory));
            let exportcatrect = JSON.parse(JSON.stringify(this.state.selectedCatRect));

            //update main category object with new rect object
            let findcatrectidx = exportcat.rects.findIndex(x => x.id === exportcatrect.id);
            exportcat.rects[findcatrectidx] = exportcatrect;

            let exportfield = exportcat.field_obj;
            exportcat["bkpfield"] = JSON.parse(JSON.stringify(exportfield)); 
            exportcatrect["bkpsubcats"] = JSON.parse(JSON.stringify(exportcatrect.sub_categories));
            
            let exportscat = JSON.parse(JSON.stringify(this.state.selectedSubCat));
            //get selected sub category contains shelves
            /* let scontainshelves = exportscat.rects[0].contain_shelves;
            //get layout height and ratio
            let fieldshelves = []; let fieldheight = 0;
            for (let i = 0; i < exportfield.field_shelves.length; i++) {
                const fieldshelve = exportfield.field_shelves[i];
                let iscontains = scontainshelves.findIndex(x => x.rank === fieldshelve.rank);
                
                if(iscontains > -1){
                    let foundshelve = scontainshelves[iscontains];

                    fieldshelves.push(fieldshelve);
                    fieldheight = (fieldheight + (foundshelve.height + foundshelve.gap));
                }
            }
            exportfield["field_shelves"] = fieldshelves; */

            //calculate dimention
            let redicedheight = cheight;
            
            var dimention = (redicedheight / measureConverter(exportfield.field_uom,this.state.displayUOM,exportfield.field_height));
            
            let returncatobj = saveObjDataConvert(exportcat, true, cwidth, dimention, true, exportscat.id, exportsaveobj, this.state.displayUOM);
            let returnrectobj = returncatobj.rects[findcatrectidx];
            
            this.setState({ selectedCatgory: returncatobj, selectedCatRect: returnrectobj, divWidth: cwidth, divHeight: cheight, oneTimeConvert: false }, () => {
                this.getBrandPercentages(true);
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

    //remove added brand
    handleremoveBrand = (removeitem) => {
        //console.log(removeitem);
        this.fieldHistoryAdd(JSON.parse(JSON.stringify(this.state.selectedCatRect)),1,JSON.parse(JSON.stringify(this.state.cutBoxList)));

        let csaveobj = this.state.selectedCatRect;

        // let isruleitem = false;
        if(removeitem && removeitem.brandItems && removeitem.brandItems.length > 0){
            // isruleitem = (removeitem.brandItems[0].type === catRectEnums.rule);

            for (let i = 0; i < removeitem.brandItems.length; i++) {
                const branditem = removeitem.brandItems[i];
                //get remove item in save object
                let cremoveitem = csaveobj.sub_categories[branditem.subcatidx].rects[branditem.subrectidx].brands[branditem.brandidx];
                //check is it already saved item
                if(!cremoveitem.isNew){
                    cremoveitem["isDelete"] = true;
                } else{
                    csaveobj.sub_categories[branditem.subcatidx].rects[branditem.subrectidx].brands.splice(branditem.brandidx,1);
                }
            }
            
        }

        this.setState({ selectedCatRect: csaveobj }, () => {
            this.getBrandPercentages(false, true); // isruleitem
        });
    }
    //redirect view list
    redirectList = (isopen, viewitem, isDraw) => {
        //if(isopen){
            let filteritems = []; let parentitems = []; 
            let drawactive = false; let drawfilteritems = [];
            for (let i = 0; i < this.state.bottomAddedList.length; i++) {
                const brandparentitem = this.state.bottomAddedList[i];
                
                if(brandparentitem.brandId === viewitem.id){
                    parentitems.push(brandparentitem);
                }
                if(brandparentitem.brandItems && brandparentitem.brandItems.length > 0){
                    let filterbrands = brandparentitem.brandItems.filter((z,zidx) => {
                        return (!z.isDelete && getNameorIdorColorofBox(z,"num") === (viewitem.brand?getNameorIdorColorofBox(viewitem, "num"):viewitem.id));
                    });
                    
                    if(filterbrands.length > 0){
                        drawfilteritems = drawfilteritems.concat(filterbrands);

                        let newsortbrands = filterbrands.filter(x => x.rects.length > 0 );
                        drawactive = isDraw;
                        filteritems = filteritems.concat(newsortbrands);
                    }
                }
            }
            
            if(filteritems.length > 0 || (isDraw && drawactive)){
                if(isDraw){
                    if(!this.props.isAUIDisabled){
                        this.handleSelectDraw(drawfilteritems[0]);
                    }
                } else if(filteritems.length > 0){
                    let notdeletedrectlist = filteritems[0].rects.filter(x => !x.isDelete);
                    
                    if(notdeletedrectlist.length > 0 && notdeletedrectlist[0].percentage > 0){
                        
                        if(parentitems && parentitems.length > 0){
                            this.saveCategoryObj(true,parentitems[0]);
                        } else{
                            alertService.warn(this.props.t("brandnotfound"));
                        }
                    } else{
                        if(!this.props.isAUIDisabled){
                            alertService.error(this.props.t("drawboxesfirst"));
                            this.handleSelectDraw(filteritems[0]);
                        }
                    }
                }
                
                if(filteritems.length > 0){
                    filteritems = [filteritems[0]];
                }
            } 
            else if(filteritems.length === 0 && !this.props.isAUIDisabled){
                //if not add new
                //alertService.error(this.props.t("addbrandfirst"));
                //find selected brand index
                if(drawfilteritems && drawfilteritems.length > 0){
                    alertService.error(this.props.t("drawboxesfirst"));
                    this.handleSelectDraw(drawfilteritems[0]);
                } else{
                    let findselidx = this.state.loadedAllBrandsList.findIndex(x => x.brandId === (viewitem.brand?getNameorIdorColorofBox(viewitem, "num"):viewitem.id));
                    if(findselidx > -1){
                        let brandAddObj = this.state.brandAddObj;
                        brandAddObj.selectbrand = { value: findselidx, label: "-"};
                        
                        this.setState({ brandAddObj: brandAddObj }, () => {
                            this.addNewSubCategory();
                        });
                    } else{
                        alertService.warn(this.props.t("brandnotfound"));
                    }
                }
            }
            
            /* if(filteritems.length === 1){
                if(isDraw){
                    this.handleSelectDraw(filteritems[0]);
                } else{
                    if(filteritems[0].width > 0 && filteritems[0].percentage > 0){
                        this.saveCategoryObj(true,filteritems[0]);
                    } else{
                        alertService.error(this.props.t("drawboxesfirst"));
                        this.handleSelectDraw(filteritems[0]);
                    }
                }
            } */
            
            this.setState({ percentageDropList: filteritems });
        //}
    }
    //clear dropdown category
    handleDropOpen = (isshow) => {
        if(isshow){
            setTimeout(() => {
                let brandAddObj = this.state.brandAddObj;
                brandAddObj.selectrect = 0;
                brandAddObj.selectbrand = (this.state.showbrand?this.state.showbrand:this.state.selectBrandsList.length > 0?this.state.selectBrandsList[0]:null);
                //console.log(defbrandobj);
                // document.getElementById("newbrandrect-select").value = defscatobj;
                // document.getElementById("newbrand-select").value = defbrandobj;

                

                this.setState({ showbrand: null, brandAddObj: brandAddObj });
            }, 100);
        }
    }
    //change selected sub cat
    handleChangeBrand = (selitem) => {
        let brandAddObj = this.state.brandAddObj;
        brandAddObj.selectbrand = selitem;

        this.setState({ brandAddObj: brandAddObj });
    }
    //toggle between suppliers add and sub cat summary
    toggleSupplierView = () => {
        this.setState({ isSupplierView: !this.state.isSupplierView });
    }
    //toggle between dept view and cat
    toggleDeptView = (show, isonload) => {
        if(!isonload && !show){
            let deptsettings = this.props.deptsettings;
            if(this.props.isneeddeptsettingvalid && !validateDeptSettings(deptsettings, this.props.t, this.props.isneeddeptsettingvalid)){
                return false;
            }

            if(this.props.isdeptupdateavailable){
                alertService.error(this.props.t("UPDATE_DEP_CHANGES_FIRST")); 
                return false;
            }

            this.setState({ isDeptView: show });
            this.saveAndToggle("brand", this.state.isChangesAvailable);
            
        } else if(this.props.hasUnsavedProductsSidebarChanges){
            this.props.validateAndSaveProducts(false, true, (iscontinue) => {
                if(!iscontinue){
                    this.setState({ isDeptView: show });
                    this.saveAndToggle("brand", this.state.isChangesAvailable);
                }
            });
        } else{
            this.setState({ isDeptView: show });
            this.saveAndToggle("brand", this.state.isChangesAvailable);
        }
    }
    //
    updateCutList = (cutlist) => {
        for (let i = 0; i < cutlist.length; i++) {
            const cutitem = cutlist[i];

            let filtersamelist = cutlist.filter(x => !x.isDelete && getNameorIdorColorofBox(x, "num") === getNameorIdorColorofBox(cutitem.citem,"num"));
            
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
    //toggle views with redirect
    saveAndToggle = (rtype, ischangesavl, evt) => {
        if(evt){
            evt.preventDefault();
        }
        
        if(this.state.isChangesAvailable){
            this.saveCategoryObj(false, null, false, null, true, rtype, evt);
            // this.props.toggleSummary(rtype, this.state.isChangesAvailable, evt);
        } else{
            this.props.toggleSummary(rtype, this.state.isChangesAvailable, evt);
        }
    }

    //brand data panel data
    updateBrandDataPanel = (datalist, isloading) => {
        this.setState({ brandDataPanelData: datalist, isDataPanelLoading: isloading });
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
        //let curcat = this.state.selectedCatgory;
        
        let curcatrect = this.state.selectedCatRect;
        let isrectsupbased = (curcatrect?curcatrect.type === catRectEnums.rule:false);
        let currectname = (curcatrect?getNameorIdorColorofBox(curcatrect,"name"):"-");

        let cursubcat = this.state.selectedSubCat;
        let issubrulebased = (cursubcat?cursubcat.type === catRectEnums.rule:false);
        let cursubcatname = (cursubcat?getNameorIdorColorofBox(cursubcat,"name"):"-");
        
        let isdep = this.state.isDeptView;
        
        let deptid = (this.state.defSaveObj && this.state.defSaveObj.department?this.state.defSaveObj.department.department_id:-1);
        let catid = (curcatrect?curcatrect.id:-1);
        let scatid = (cursubcat?cursubcat.id:-1);

        //get rule id
        let scatruleid = (issubrulebased?getNameorIdorColorofBox(cursubcat, "num"):-1)
        //check rule type and assign rule id
        let scatsupruleid = (issubrulebased && cursubcat.rule.level === catRuleEnums.sup?scatruleid:-1);
        let scatbrandruleid = (issubrulebased && cursubcat.rule.level === catRuleEnums.brand?scatruleid:-1);


        return (<>

            <React.Fragment>
                <Prompt when={this.state.isChangesAvailable} 
                message={this.props.t('CHANGE_NOTBE_SAVED')} />
            </React.Fragment>

            <Col xs={12} dir={this.props.isRTL}>

                <Row className='topcontent-main' style={this.props.isRTL === "rtl"?{width: "100%", marginRight: "0px"}:{width: "100%", marginLeft: "0px"}}>
                    
                    {this.state.isLoadDrules && scatid !== -1 && this.props.drulesEnabled===true && !this.state.isDataPanelLoading?
                        <DataRuleContent 
                            isRTL={this.props.isRTL}
                            isonetimeload={this.state.isonetimeload}
                            isDataPanelLoading={this.state.isDataPanelLoading}
                            brandDataPanelData={this.state.brandDataPanelData}
                            issupbased={issubrulebased}
                            brandid={scatbrandruleid} 
                            supplierid={scatsupruleid}
                            noticeImgUrl={this.props.noticeImgUrl}
                            viewtype="brand" 
                            defSaveObj={this.state.defSaveObj}
                            deptid={deptid} 
                            deptsettings={this.props.deptsettings}
                            dataRuleSelectedTab={this.props.dataRuleSelectedTab}
                            catid={(catid !== -1 && !isrectsupbased?curcatrect.category.category_id:-1)} 
                            scatid={(cursubcat !== -1 && !issubrulebased?cursubcat.sub_category.subCategoryId:-1)} 
                            type={(cursubcat?cursubcat.type:catRectEnums.default)}
                            selectedCatgory= {this.state.selectedCatgory}
                            selectedCatRect={this.state.selectedCatRect}
                            selectedSubCat={this.state.selectedSubCat}
                            ruleobj={this.state.selectedRuleObj}
                            ruleIdList={this.state.ruleIdList}
                            changeChartFilterDates={this.props.changeChartFilterDates}
                            bottomAddedList={this.state.bottomAddedList}
                            chartFilterDates={this.props.chartFilterDates}
                            parentSaveObj={this.props.defSaveObj}
                            changeDataRuleActiveTab={this.props.changeDataRuleActiveTab}
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
                            <Breadcrumb.Item active>{this.props.t('brands')}</Breadcrumb.Item>
                            <li className={"breadcrumb-item"+(issubrulebased?" sup-based":"")}><Link to="#" onClick={(e) => this.saveAndToggle("scat", this.state.isChangesAvailable, e)} role="button">
                                <TooltipWrapper text={cursubcatname}><span>{cursubcat?(cursubcatname.substring(0,12)+(cursubcatname.length > 12?"..":"")):"-"}</span></TooltipWrapper>
                            </Link></li>
                            <li className={"breadcrumb-item"+(isrectsupbased?" sup-based":"")}><Link to="#" onClick={(e) => this.saveAndToggle("cat", this.state.isChangesAvailable, e)} role="button">
                                <TooltipWrapper text={currectname}><span>{curcatrect?(currectname.substring(0,12)+(currectname.length > 12?"..":"")):"-"}</span></TooltipWrapper>
                            </Link></li>
                            </>:<>
                            <li className={"breadcrumb-item"+(isrectsupbased?" sup-based":"")}><Link to="#" onClick={(e) => this.saveAndToggle("cat", this.state.isChangesAvailable, e)} role="button">
                                <TooltipWrapper text={currectname}><span>{curcatrect?(currectname.substring(0,12)+(currectname.length > 12?"..":"")):"-"}</span></TooltipWrapper>
                            </Link></li>
                            <li className={"breadcrumb-item"+(issubrulebased?" sup-based":"")}><Link to="#" onClick={(e) => this.saveAndToggle("scat", this.state.isChangesAvailable, e)} role="button">
                                <TooltipWrapper text={cursubcatname}><span>{cursubcat?(cursubcatname.substring(0,12)+(cursubcatname.length > 12?"..":"")):"-"}</span></TooltipWrapper>
                            </Link></li>
                            <Breadcrumb.Item active>{this.props.t('brands')}</Breadcrumb.Item>
                            </>}
                        </Breadcrumb>

                        <Col className='topview-navigatelinks'>
                            <Col id='navcatscroll-wrapper' className="topnav-wrapper">
                                {/* <ul className='list-inline'>
                                    {curcatrect && curcatrect.sub_categories?<>
                                        {curcatrect.sub_categories.map((xitem, xidx) => {
                                            //check is sub cat sup based
                                            let iscsubsupbased = (xitem?xitem.type === catRectEnums.rule:false);

                                            return <React.Fragment key={xidx}>{!xitem.isDelete?
                                                <li className={'list-inline-item'+((cursubcat && xitem.id === cursubcat.id)?" active":"")+(iscsubsupbased?" sup-item":'')} 
                                                title={getNameorIdorColorofBox(xitem,"name")} 
                                                onClick={() => ((cursubcat && xitem.id === cursubcat.id)?null:this.saveCategoryObj(false,null,true,xitem)) }>
                                                    
                                                    {getNameorIdorColorofBox(xitem,"name").substring(0,10)+(getNameorIdorColorofBox(xitem,"name").length>10?"..":"")}

                                                </li>:<></>}</React.Fragment>;
                                        })}
                                    </>:<></>}
                                </ul> */}

                                {this.state.isLoadDrules && this.state.showNavigationView && this.props.chartEnabled===true?
                                    <MpSliderContent 
                                        defSaveObj={this.state.defSaveObj} 
                                        deptid={deptid} 
                                        isRTL={this.props.isRTL}
                                        summaryViewType={"scat"} 
                                        issubnavview={true}
                                        redirectToCategory={this.props.redirectToCategory} 
                                        selectedCatgory= {this.state.selectedCatgory}
                                        selectedCatRect={this.state.selectedCatRect}
                                        selectedSubCat={this.state.selectedSubCat}
                                        type={(curcatrect?curcatrect.type:catRectEnums.default)}
                                        ruleobj={this.state.selectedRuleObj}
                                        ruleIdList={this.state.ruleIdList}
                                        chartFilterDates={this.props.chartFilterDates}
                                        sliderIndex = {this.props.sliderIndex}
                                        saveCategoryObj = {this.saveCategoryObj}
                                        />
                                :<></>}
                            </Col>
                        </Col>

                        <Col className='MPDrawing'>
                            {this.state.selectedSubCat?
                            <MPDrawing 
                                showResolutionCount={this.state.showResolutionCount}
                                selectedDraw={this.state.selectedDraw} 
                                selectedSubCat={this.state.selectedSubCat} 
                                isEnableDraw={this.state.isEnableDraw} 
                                isAUIDisabled={this.props.isAUIDisabled}
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
                                handleUndoRedo={this.handleUndoRedo}
                                setRects={this.setRects}
                                changeTool={this.changeTool} 
                                changeDrawType={this.changeDrawType}
                                updateDivDetails={this.updateDivDetails} 
                                saveCategoryObj={this.saveCategoryObj}
                                redirectList={this.redirectList}
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
                                        <li onClick={() => this.saveAndToggle("scat", this.state.isChangesAvailable)} className={'list-inline-item content-switch'}>{this.props.t("sub_category")}</li>
                                        <li onClick={() => this.toggleDeptView(false)} className={'list-inline-item content-switch'+(!isdep && (sumtype === "brand" || sumtype === "product")?" active":"")} style={this.props.isRTL === "rtl"?{marginLeft:"20px"}:{marginRight:"20px"}}>{this.props.t("brand")}</li>
                                        
                                        {/* <li className='list-inline-item'><Button variant='outline-warning' size="sm">{this.props.t("products")}</Button></li> */}
                                        <li className='list-inline-item'><Button variant='success' onClick={() => this.saveCategoryObj()} size="sm">{this.props.t("btnnames.save")}</Button></li>
                                    </ul>

                                    <h3 className='main-title'>
                                        {this.props.t("edit_brands")}
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
                                                    viewtype="brand"
                                                    defSaveObj={this.state.defSaveObj}
                                                    loadedSuppliersList={this.state.loadedSuppliersList} selectSupplierList={this.state.selectSupplierList}
                                                    loadedSubCatList={this.state.loadedSubCatList} selectSubCatList={this.state.selectSubCatList}
                                                    loadedBrandsList={this.state.loadedBrandsList} selectBrandsList={this.state.selectBrandsList}
                                                    loadDunitList={this.state.loadDunitList}

                                                    selectedCategory={this.state.selectedCatgory}
                                                    selectedCatRect={this.state.selectedCatRect}
                                                    selectedSubCat={this.state.selectedSubCat}

                                                    toggleSupplierView={this.toggleSupplierView}
                                                    updateFromChild={this.setRects}
                                                    t={this.props.t} isRTL={this.props.isRTL}
                                                    />
                                            </>:<>
                                                <Col>
                                                    <Col className='title-withline'>
                                                        <h5>{this.props.t("brands")}</h5>
                                                        <div className='text-line' style={{width:(this.state.showResolutionCount === 4?"85%":"80%")}}></div>
                                                    </Col>

                                                    <ul className='newcats-list list-inline'>
                                                        {this.state.bottomAddedList && this.state.bottomAddedList.length > 0?<>
                                                            {this.state.bottomAddedList.map((yitem, yidx) => {
                                                                let firstbranditem = yitem.brandItems[0];
                                                                let brandcolor = (yitem.brandColor?yitem.brandColor:"#F39C12");
                                                                let brandtxtcolor = (checkColorIsLight(brandcolor)?"#5128a0":"white");

                                                                return <React.Fragment key={yidx}>
                                                                    <li className={'newcats-item list-inline-item '+
                                                                        (this.state.selectedDraw?((yitem.brandId === this.state.selectedDraw.brand.brandId)?"active":""):'')} title={yitem.brandName}>
                                                                        <span className="remove-icon" onClick={()=>this.handleremoveBrand(yitem)}><XIcon size={12} /></span>
                                                                        <span className="remove-icon" onClick={()=>this.saveCategoryObj(true, yitem)} style={this.props.isRTL === "rtl"?{marginRight:"28px"}:{marginLeft:"28px"}}><CopyIcon size={12} /></span>
                                                                        <div onClick={() => (this.props.isAUIDisabled === true?this.saveCategoryObj(true, yitem):this.handleSelectDraw(firstbranditem))}>
                                                                            <Col className="sub-content" style={{background: brandcolor, borderColor: brandcolor}}>
                                                                                <h6 style={{color: brandtxtcolor}}>{yitem.brandName.substring(0,12)+(yitem.brandName.length > 12?"..":"")}</h6>
                                                                            </Col>    
                                                                        </div>
                                                                    </li>
                                                                </React.Fragment>
                                                            })}
                                                        </>:<></>}

                                                        <li className='newcats-item list-inline-item'>
                                                            <Dropdown drop='up' onToggle={this.handleDropOpen}>
                                                                <Dropdown.Toggle variant="default">
                                                                    <div>
                                                                        <Col className="sub-content add" ref={r => this.additemElement = r}>
                                                                            <PlusIcon size={14} />
                                                                        </Col>
                                                                        <h6>{this.props.t("btnnames.add")}</h6>
                                                                    </div>
                                                                </Dropdown.Toggle>

                                                                <Dropdown.Menu className={"newcat-drop"}>
                                                                    <Col style={{padding:"0px 15px"}}>
                                                                        <div className='d-none'>
                                                                            <label>{this.props.t("SELECT_RECT")}</label>
                                                                            <FormSelect id="newbrandrect-select" value={this.state.brandAddObj.selectrect} onChange={e => this.handleChangeBrandCat(e, "selectrect")} size="sm">
                                                                                {cursubcat?<>
                                                                                    {cursubcat.rects.map((zitem,zidx) => {
                                                                                        return <option key={zidx} value={zidx}>{cursubcatname} - {(zidx + 1)}</option>
                                                                                    })}
                                                                                </>:<></>}
                                                                            </FormSelect>    
                                                                        </div>
                                                                           
                                                                        <label>{this.props.t("brands")}</label>
                                                                        {/* <FormSelect id="newbrand-select" value={this.state.brandAddObj.selectbrand} onChange={e => this.handleChangeBrandCat(e, "selectbrand")} size="sm">
                                                                            {this.state.selectedSubCat?<>
                                                                            {this.state.loadedAllBrandsList.map((xitem,xidx) => {
                                                                                return <React.Fragment key={xidx}>
                                                                                    <option value={xidx}>{xitem.brandName}</option>
                                                                                </React.Fragment>;
                                                                            })}</>:<></>}
                                                                        </FormSelect> */}
                                                                        <Select options={this.state.selectBrandsList}  
                                                                        onChange={(e) => this.handleChangeBrand(e)}
                                                                        value={this.state.brandAddObj.selectbrand}
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

                                                    {/* <Col className='title-withline'>
                                                        <h5>{this.props.t("suppliers")}</h5>
                                                        <div className='text-line' style={{width:"80%"}}></div>
                                                    </Col>
                                                    
                                                    <ul className='newcats-list list-inline'>
                                                        {curcatrect && curcatrect.sub_categories?<>
                                                            {curcatrect.sub_categories.map((xitem, xidx) => {
                                                                return <React.Fragment key={xidx}>
                                                                    {cursubcat && xitem.id === cursubcat.id?<>
                                                                        {xitem.rects.map((yitem, yidx) => {
                                                                            return <React.Fragment key={yidx}>
                                                                                {yitem.brands && yitem.brands.length? yitem.brands.map((zitem,zidx) => {

                                                                                    let isbrandsupbased = (zitem.type === catRectEnums.rule);
                                                                                    
                                                                                    return <React.Fragment key={zidx}>{!zitem.isDelete && isbrandsupbased?<li className={'newcats-item list-inline-item '+
                                                                                        (this.state.selectedDraw?((zitem.id === this.state.selectedDraw.id)?"active":""):'')}>
                                                                                        <span className="remove-icon" onClick={()=>this.handleremoveBrand(xidx, yidx, zidx)}><XIcon size={12} /></span>
                                                                                        <span className="remove-icon" onClick={()=>this.saveCategoryObj(true, zitem)} style={this.props.isRTL === "rtl"?{marginRight:"28px"}:{marginLeft:"28px"}}><CopyIcon size={12} /></span>
                                                                                        <div onClick={() => this.handleSelectDraw(zitem,xitem.sub_category_id)}>
                                                                                            <Col className="sub-content sup-based">
                                                                                                <h6 title={getNameorIdorColorofBox(zitem,"name")}>
                                                                                                    {getNameorIdorColorofBox(zitem,"name").substring(0,12)+(getNameorIdorColorofBox(zitem,"name").length > 12?"..":"")}
                                                                                                </h6>
                                                                                            </Col>    
                                                                                        </div>
                                                                                    </li>:<></>}</React.Fragment>
                                                                                })
                                                                                :<></>}
                                                                            </React.Fragment>
                                                                        })}
                                                                    </>:<></>}
                                                                </React.Fragment>;
                                                            })}
                                                        </>:<></>}


                                                        <li className='newcats-item list-inline-item'>
                                                            <Col className="sub-content add" onClick={this.toggleSupplierView}><h6><PlusIcon size={14} /></h6></Col>
                                                        </li>
                                                    </ul>  */}

                                                </Col>    

                                                <Col xs={12} md={this.state.showResolutionCount === 4?5:6} className="light-purple sub-cat-prg-bars">
                                                    {this.state.isPercentagesLoading?<div className='perloading-overlap'>
                                                        <img src={loaderanime} alt="" />
                                                    </div>:<></>}

                                                    <Row>
                                                        <Col xs={6} className="title-col" ref={this.perContentDiv}>{this.props.t("EDIT_PORTION")}</Col>
                                                        <Col xs={2} className="title-col">{this.props.t("REC")}</Col>
                                                        <Col xs={2} className="title-col">{this.props.t("NOW")}</Col>
                                                        <Col xs={2} className="title-col">{this.props.t("PROD_QTY")}</Col>
                                                    </Row>    
                                                    <Row className="scroll-content">
                                                    {this.state.loadedBrandPercentages?<>
                                                        {this.state.loadedBrandPercentages.map((xitem, xidx) => {
                                                            /* let csubnametxt = (xitem.rule?(getNameorIdorColorofBox(xitem,"name").substring(0,15)+(getNameorIdorColorofBox(xitem,"name").length > 15?"..":""))
                                                            :(xitem.brandName.substring(0,15)+(xitem.brandName.length > 15?"..":""))); */
                                                            let cfullnametxt = (xitem.name?xitem.name:"-");
                                                            //let csubnametxt = (cfullnametxt?(cfullnametxt.substring(0, (Math.floor(this.state.perContentWidth / 7)))+(cfullnametxt.length > (Math.floor(this.state.perContentWidth / 7))?"..":"")):"-");
                                                            let csubnametxt = cfullnametxt;
                                                            let cbrandcolor = (xitem.color?xitem.color:"#dc3545");
                                                            let brandtxtcolor = (checkColorIsLight(cbrandcolor)?(this.props.dmode?"#29b485":"#5128a0"):"white");

                                                            return <React.Fragment key={xidx}><Col xs={(this.props.isAUIDisabled?6:4)} style={{padding:(this.props.isAUIDisabled?"0px 5px":"0px")}}>
                                                                    <CustomProgressBar showtooltip={true} fulltext={cfullnametxt} text={csubnametxt} mainbarcolor={cbrandcolor} mainbarpercentage={xitem.percentage} textcolor={brandtxtcolor} showsubbar="true" subbarpercentage={xitem.suggestedPercentage} />
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
                                                                                        {getNameorIdorColorofBox(zitem, "name").substring(0,15)+((getNameorIdorColorofBox(zitem, "name")).length>15?"..":"")}    
                                                                                    </Dropdown.Item>;
                                                                                })}
                                                                            </Dropdown.Menu>
                                                                        </Dropdown>
                                                                        <Dropdown drop='up' align={"end"} onClick={e => this.redirectList(e, xitem)}>
                                                                            <Dropdown.Toggle variant="primary" size='sm' title={this.props.t("open_products")}>
                                                                                <FeatherIcon icon="copy" size={12} />
                                                                            </Dropdown.Toggle>

                                                                            <Dropdown.Menu className={this.state.percentageDropList && this.state.percentageDropList.length <= 1?"d-none":""}>
                                                                                {this.state.percentageDropList.map((zitem, zidx) => {
                                                                                    let ispersupbased = (zitem.type === catRectEnums.rule);
                                                                                    return <Dropdown.Item key={zidx} href="#" onClick={() => this.saveCategoryObj(true,zitem) } className={ispersupbased?'sup-based':''}>
                                                                                        {getNameorIdorColorofBox(zitem, "name").substring(0,15)+((getNameorIdorColorofBox(zitem, "name")).length>15?"..":"")} 
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

                    <Col className="bottom-single slider-content" xs={12} lg={5}  style={this.props.isRTL === "rtl"?{paddingRight:"0px"}:{paddingLeft:"0px"}}>
                        <Col className='sub-content sub-wrapper' style={{padding:"15px 35px",paddingBottom: "0px"}}>
                            {this.state.isLoadDrules && this.state.showNavigationView && this.props.chartEnabled===true?
                                <MpSliderContent 
                                    defSaveObj={this.state.defSaveObj} 
                                    deptid={deptid} 
                                    isRTL={this.props.isRTL}
                                    summaryViewType={this.props.summaryViewType} 
                                    redirectToCategory={this.props.redirectToCategory} 
                                    selectedCatgory= {this.state.selectedCatgory}
                                    selectedCatRect={this.state.selectedCatRect}
                                    selectedSubCat={this.state.selectedSubCat}
                                    type={(cursubcat?cursubcat.type:catRectEnums.default)}
                                    ruleobj={this.state.selectedRuleObj}
                                    ruleIdList={this.state.ruleIdList}
                                    chartFilterDates={this.props.chartFilterDates}
                                    sliderIndex = {this.props.sliderIndex}
                                    bottomAddedList={this.state.bottomAddedList}
                                    saveCategoryObj = {this.saveCategoryObj}
                                    updateBrandDataPanel={this.updateBrandDataPanel}
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
    setMPBrandAction: (payload) => dispatch(selectedMPBrandSetAction(payload)),
    setNewProdCountCat: (payload) => dispatch(setNewProdCountCatAction(payload)),
    setNewProdCountSubCat: (payload) => dispatch(setNewProdCountSubCatAction(payload))
});

export default withTranslation()(withRouter(connect(mapStateToProps,mapDispatchToProps)(BrandContent)));