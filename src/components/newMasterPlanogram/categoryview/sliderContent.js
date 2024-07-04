import React, { Component } from 'react';
import { Row, Col, Carousel, Badge } from 'react-bootstrap';
import { withTranslation } from 'react-i18next';
import {  withRouter } from 'react-router-dom';
import { ChevronLeftIcon, ChevronRightIcon } from '@primer/octicons-react';
import { connect } from "react-redux";
import moment from 'moment';

import { catRectEnums } from '../../../enums/masterPlanogramEnums';
import { submitCollection } from '../../../_services/submit.service';
import { submitSets } from '../../UiComponents/SubmitSets';
import { alertService } from '../../../_services/alert.service';
import { TooltipWrapper, findResolutionShowCount, getNameorIdorColorofBox } from '../AddMethods';
// import { checkCategoryCompleted } from '../MPSimulationCommenMethods';

import { mpCategoryNavCacheSetAction, mpSubCategoryNavCacheSetAction, mpBrandNavCacheSetAction } from '../../../actions/masterPlanogram/masterplanogram_action';

import CustomProgressBar from '../../common_layouts/customProgressBar';

import loader from '../../../assets/img/loading-sm.gif';


class MpSliderContent extends Component {
    constructor(props){
        super(props);

        this._isMounted = false;
        
        this.state = {
            sliderItems: [],
            sliderIndex: 0, showCount: 2, sliderLength: 3, sliderItemCount:0,
            isloading: false,

            oriCatList: [], oriScatList: [], oriBrandList: [],
            catNewProductCount:[],
            subCatNewProductCount:[]
        }
    }

    componentDidMount(){
        this._isMounted = true;

        if (this._isMounted) {
            let crescount = findResolutionShowCount(this.state.showCount);
            this.setState({ showCount: crescount }, () => {
                this.initData();
            });
        }
    }

    componentWillUnmount(){
        this._isMounted = false;
    }

    //set cat, subcat, brand data
    initData = () => {

        if(this.props.defSaveObj){

            if(this.props.masterPlanogramState && this.props.masterPlanogramState.newProdCountCat){
                this.getNewProdCountOfCat(this.props.masterPlanogramState.newProdCountCat);
            }
            
            if(this.props.masterPlanogramState && this.props.masterPlanogramState.newProdCountSubCat){
                this.getNewProdCountOfSubCat(this.props.masterPlanogramState.newProdCountSubCat);
            }

            if(this.props.summaryViewType==="cat"){
                this.loadCacheCatData();
            }
            else if(this.props.summaryViewType==="scat"){
                this.loadCacheSubCatData();
            }
            else if(this.props.summaryViewType==="brand" || this.props.summaryViewType==="product"){
                this.loadCacheBrandData();
            }
        }
    }


    getNewProdCountOfCat = (viewdetails) => {

        this.setState({catNewProductCount : viewdetails})

    } 
    
    getNewProdCountOfSubCat = (viewdetails) => {

        this.setState({subCatNewProductCount : viewdetails})

    } 

    //load category data
    loadCategoryData = () => {
        let mpid = (this.props.defSaveObj?this.props.defSaveObj.mp_id:-1);

        let crulelist = (this.props.isnavview?[]:this.props.ruleIdList);
        if(this.props.isnavview && this.props.defSaveObj){
            for (let i = 0; i < this.props.defSaveObj.categories.length; i++) {
                const ccat = this.props.defSaveObj.categories[i];

                if(!ccat.isDelete && ccat.rects && ccat.rects.length > 0){
                    for (let j = 0; j < ccat.rects.length; j++) {
                        const ccatrect = ccat.rects[j];
                        
                        if(!ccatrect.isDelete && ccatrect.type === catRectEnums.rule){
                            crulelist.push({level: ccatrect.rule.level, id: getNameorIdorColorofBox(ccatrect, "num"), isNew: (ccatrect.isNew === true?true:false)});
                        }
                    }
                }
            }
        }

        let sobj = {
            mpId: mpid,
            fromDate: moment(this.props.chartFilterDates.fromdate).format("YYYY-MM-DD"),
            toDate: moment(this.props.chartFilterDates.todate).format("YYYY-MM-DD"),
            chainHasDepartmentId: this.props.deptid,
            mpRuleIds: crulelist,
            isDelete: this.props.isRulesDeleted,
        }

        if(this.props.updateCatDataPanel){
            this.props.updateCatDataPanel([], true);
        }

        this.setState({isloading:true});
        submitSets(submitCollection.loadCategoryCardsData, sobj).then(res => {
            this.setState({isloading:false});
            if(res && res.status){
                
                let loadedcatlist = (res.extra?res.extra:[]);
                /* for (let i = 0; i < loadedcatlist.length; i++) {
                    let catobj = loadedcatlist[i];

                    //check category completed
                    loadedcatlist[i] = checkCategoryCompleted("cat", this.props.defSaveObj, catobj);
                } */

                let cacheobj = { sobj: sobj, data: loadedcatlist }
                this.props.setMPCategoryNavCache(cacheobj);

                this.setCatSubCategoryAvailability(loadedcatlist);
            } else{
                if(this.props.updateCatDataPanel){
                    this.props.updateCatDataPanel([], false);
                }
            }
        });
    }
    //load cat data from cache
    loadCacheCatData = () => {
        if(this.props.masterPlanogramState && this.props.masterPlanogramState.mpCatNavCache){
            let cachedata = this.props.masterPlanogramState.mpCatNavCache;
            
            if(cachedata.sobj && cachedata.sobj.chainHasDepartmentId === this.props.deptid){
                this.setCatSubCategoryAvailability(cachedata.data);
            } else{
                this.loadCategoryData();
            }
        } else{
            this.loadCategoryData();
        }
    }
    //compare cat data
    setCatSubCategoryAvailability = (clist) =>{
        let cdatalist = clist.sort((a,b) => (b.percentageSuggestion - a.percentageSuggestion));

        if(this.props.updateCatDataPanel){
            this.props.updateCatDataPanel(cdatalist, false);
        }

        let catlist = JSON.parse(JSON.stringify(cdatalist));
        let defcatlist = (this.props.defSaveObj.categories ? this.props.defSaveObj.categories : [] );
        
        let newcatlist = [];
        for (let i = 0; i < catlist.length; i++) {
            let cardcat = catlist[i];
            cardcat.isAvailable = false;
            cardcat.isScatAvailable = false;

            for (let x = 0; x < defcatlist.length; x++) {
                if(!defcatlist[x].isDelete && !defcatlist[x].is_unallocated_view){
                    for (let j = 0; j < defcatlist[x].rects.length; j++) {
                        const catrectitem = defcatlist[x].rects[j];
                        if(!catrectitem.isDelete && ((!cardcat.isRule && catrectitem.type === catRectEnums.default && cardcat.categoryId === getNameorIdorColorofBox(catrectitem, "num")) ||
                        (cardcat.isRule && catrectitem.type === catRectEnums.rule && cardcat.categoryId === getNameorIdorColorofBox(catrectitem, "num"))
                        )){
                            cardcat.isAvailable = true;
                            cardcat.isScatAvailable = false;

                            let newscatitem = [];
                            for (let s = 0; s < cardcat.subcategories.length; s++) {
                                let carscat = cardcat.subcategories[s];
                                carscat.isAvailable = false;
                                carscat.isBrandAvailable = false;
                                carscat.isCompleted = false;

                                if(!carscat.isDelete){
                                    var isAvlIndx = catrectitem.sub_categories.findIndex(x => (!x.isDelete && ((!carscat.isRule && x.type === catRectEnums.default && getNameorIdorColorofBox(x,"num") === carscat.subcategoryId) || 
                                    (carscat.isRule && x.type === catRectEnums.rule && getNameorIdorColorofBox(x,"num") === carscat.subcategoryId))));
    
                                    carscat.isAvailable = (isAvlIndx > -1? true : carscat.isAvailable);
                                    cardcat.isScatAvailable = (isAvlIndx > -1? true : cardcat.isScatAvailable);
                                    
                                }
                                
                                if(carscat.isAvailable){
                                    newscatitem.push(carscat);
                                }
                            }
                            
                            cardcat.subcategories = newscatitem;
                        }
                    }
                }
            }

            if(cardcat.isAvailable){
                newcatlist.push(cardcat);
            }
        }
        // console.log(newcatlist);

        this.setState({ oriCatList: newcatlist });
        this.groupToSliderItems(newcatlist);

        //if navigation view focus to selected cat
        if(this.props.isnavview){
            setTimeout(() => {
                this.findSelectedCatPosition(newcatlist);
            }, 300);
        }
    }
    //selected cat pos
    findSelectedCatPosition = (newcatlist, issubcat) => {
        let singlecatwidth = 80;
        let navfocuswidth = 0;

        if(issubcat){
            let cselrect = this.props.selectedSubCat;
            for (let i = 0; i < newcatlist.length; i++) {
                const xitem = newcatlist[i];
                let curselrectactive = (cselrect && ((cselrect.type === catRectEnums.default && !xitem.isRule && getNameorIdorColorofBox(cselrect, "num") === xitem.subcategoryId) || 
                (cselrect.type === catRectEnums.rule && xitem.isRule && getNameorIdorColorofBox(cselrect, "num") === xitem.subcategoryId)));

                if(curselrectactive){
                    break;
                } else{
                    navfocuswidth = (navfocuswidth + singlecatwidth);
                }
            }      
        } else{
            let cselrect = this.props.selectedCatRect;
            for (let i = 0; i < newcatlist.length; i++) {
                const xitem = newcatlist[i];
                let curselrectactive = (cselrect && ((cselrect.type === catRectEnums.default && !xitem.isRule && getNameorIdorColorofBox(cselrect, "num") === xitem.categoryId) || 
                (cselrect.type === catRectEnums.rule && xitem.isRule && getNameorIdorColorofBox(cselrect, "num") === xitem.categoryId)));

                if(curselrectactive){
                    break;
                } else{
                    navfocuswidth = (navfocuswidth + singlecatwidth);
                }
            }    
        }

        //console.log(navfocuswidth);
        if(document.getElementById("navcatscroll-wrapper")){
            document.getElementById("navcatscroll-wrapper").scrollTo({
                top: 0,
                left: (this.props.isRTL === "rtl"?(-1 * navfocuswidth):navfocuswidth),
                behavior: 'smooth'
            });
        }
    }
    //load sub cat data
    loadSubCategoryData = () =>{
        let mpid = (this.props.defSaveObj?this.props.defSaveObj.mp_id:-1);
        let selcat = this.props.selectedCatRect;
        let iscatsupbased = (selcat.type === catRectEnums.rule);
        
        let csubrulelist = (this.props.issubnavview?[]:this.props.ruleIdList);
        let ruleobj = this.props.ruleobj;
        
        if(this.props.issubnavview && selcat){
            if(iscatsupbased){
                ruleobj = {
                    level: selcat.rule.level,
                    id: getNameorIdorColorofBox(selcat, "num"),
                    mpid: selcat.rule.id
                }
            }
            
            for (let i = 0; i < selcat.sub_categories.length; i++) {
                const csubcat = selcat.sub_categories[i];

                if(!csubcat.isDelete && csubcat.type === catRectEnums.rule){
                    csubrulelist.push({level: csubcat.rule.level, id: getNameorIdorColorofBox(csubcat, "num"), isNew: (csubcat.isNew === true?true:false)});
                }
            }
        }

        let sobj = {
            mpId: mpid,
            fromDate: moment(this.props.chartFilterDates.fromdate).format("YYYY-MM-DD"),
            toDate: moment(this.props.chartFilterDates.todate).format("YYYY-MM-DD"),
            departmentId: this.props.deptid,
            categoryId: (!iscatsupbased?selcat.category.category_id:0),
            isCatRuleBased: iscatsupbased,
            catRuleObj: (iscatsupbased?{ level: ruleobj.level, id: getNameorIdorColorofBox(selcat, "num") }:{}),
            mpRuleIds: csubrulelist,
            isDelete: this.props.isRulesDeleted,
        }
        
        if(this.props.updateSubCatDataPanel){
            this.props.updateSubCatDataPanel([], true);
        }

        this.setState({isloading:true});
        submitSets(submitCollection.loadSubCategoryCardsData, sobj).then(res => {
            this.setState({isloading:false});
            if(res && res.status){

                let loadedscatlist = (res.extra?res.extra:[]);
                /* for (let i = 0; i < loadedscatlist.length; i++) {
                    let subcatobj = loadedscatlist[i];

                    //check category completed
                    loadedscatlist[i] = checkCategoryCompleted("subcat", selcat, subcatobj);
                } */

                let cacheobj = { sobj: selcat, data: loadedscatlist }
                this.props.setMPSubCategoryNavCache(cacheobj);
                this.setSubCatBrandsAvailability(loadedscatlist);
            } else{
                if(this.props.updateSubCatDataPanel){
                    this.props.updateSubCatDataPanel([], true);
                }
            }
        });

    }
    //load cat data from cache
    loadCacheSubCatData = () => {
        if(this.props.masterPlanogramState && this.props.masterPlanogramState.mpScatNavCache){
            let selcat = this.props.selectedCatRect;
            let cachedata = this.props.masterPlanogramState.mpScatNavCache;
            
            if(cachedata.sobj && cachedata.sobj.id === selcat.id){
                this.setSubCatBrandsAvailability(cachedata.data);
            } else{
                this.loadSubCategoryData();
            }
        } else{
            this.loadSubCategoryData();
        }
    }
    //compare loaded sub cat data
    setSubCatBrandsAvailability = (slist) =>{
        let cdatalist = slist.sort((a,b) => (b.percentageSuggestion - a.percentageSuggestion));
        if(this.props.updateSubCatDataPanel){
            this.props.updateSubCatDataPanel(cdatalist, false);
        }

        let scatlist = JSON.parse(JSON.stringify(cdatalist));
        var defsubcatlist = this.props.selectedCatRect.sub_categories ? this.props.selectedCatRect.sub_categories : [];
        //console.log("A",scatlist);
        //console.log("B",defsubcatlist);

        let newscatlist = [];
        for (let i = 0; i < scatlist.length; i++) {
            let cardscat = scatlist[i];
            cardscat.isAvailable = false;
            cardscat.isBrandAvailable = false;

            for (let x = 0; x < defsubcatlist.length; x++) {
                if(!defsubcatlist[x].isDelete && ((!cardscat.isRule && defsubcatlist[x].type === catRectEnums.default && getNameorIdorColorofBox(defsubcatlist[x],"num") === cardscat.subcategoryId) || 
                (cardscat.isRule && defsubcatlist[x].type === catRectEnums.rule && getNameorIdorColorofBox(defsubcatlist[x],"num") === cardscat.subcategoryId))){
                    
                    cardscat.isAvailable = true;
                    // cardscat.isBrandAvailable = false;

                    let newbrandlist = [];
                    for (let b = 0; b < cardscat.brands.length; b++) {
                        let cardbrand = cardscat.brands[b];
                        let isAvlIndx = -1;
                        for (let r = 0; r < defsubcatlist[x].rects.length; r++) {
                            if(!defsubcatlist[x].rects[r].isDelete){
                                let rectbrandarr = (defsubcatlist[x].rects[r].brands ? defsubcatlist[x].rects[r].brands : []);
                                let newfindidx = rectbrandarr.findIndex(z => !z.isDelete && getNameorIdorColorofBox(z, "num") === cardbrand.brandId);

                                isAvlIndx = (isAvlIndx === -1?newfindidx:isAvlIndx);
                            }
                        }
                        
                        cardbrand.isAvailable = (isAvlIndx > -1? true : cardbrand.isAvailable);
                        cardscat.isBrandAvailable = (isAvlIndx > -1? true : cardscat.isBrandAvailable);
                        
                        if(cardbrand.isAvailable){
                            newbrandlist.push(cardbrand);
                        }
                    }
                    
                    cardscat.brands = newbrandlist;
                }
            }

            if(cardscat.isAvailable){
                newscatlist.push(cardscat);
            }
        }
        // console.log(newscatlist);

        this.setState({ oriScatList: newscatlist });
        this.groupToSliderItems(newscatlist);

        //if navigation view focus to selected cat
        if(this.props.issubnavview){
            setTimeout(() => {
                this.findSelectedCatPosition(newscatlist, true);
            }, 300);
        }
    }
    //load brand data
    loadBrandData = () => {
        let mpid = (this.props.defSaveObj?this.props.defSaveObj.mp_id:-1);
        let selcat = this.props.selectedCatRect;
        let catrectid = (selcat.type === catRectEnums.default?selcat.category.category_id:-1);
        let iscatrulebased = (selcat.type === catRectEnums.rule);

        let catruleobj = null;
        if(iscatrulebased){
            catruleobj = {
                level: selcat.rule.level,
                id: getNameorIdorColorofBox(selcat, "num"),
            }
        }

        let selsubcat = this.props.selectedSubCat;
        let isscatrulebased = (selsubcat.type === catRectEnums.rule);

        let sobj = {
            mpId: mpid,
            fromDate: moment(this.props.chartFilterDates.fromdate).format("YYYY-MM-DD"),
            toDate: moment(this.props.chartFilterDates.todate).format("YYYY-MM-DD"),
            departmentId: this.props.deptid,
            categoryId: catrectid,
            isCatRuleBased: iscatrulebased,
            catRuleObj: (catruleobj?catruleobj:{}),
            subcategoryId: (!isscatrulebased?selsubcat.sub_category.subCategoryId:-1),
            isSubCatRuleBased: (this.props.ruleobj?true:false),
            subCatRuleObj: (this.props.ruleobj?{ level: this.props.ruleobj.level, id: getNameorIdorColorofBox(selsubcat, "num") }:{}),
            mpRuleIds: (selsubcat.otherMpRuleIds?selsubcat.otherMpRuleIds:[]),
        }
        
        this.props.updateBrandDataPanel([], true);

        this.setState({isloading:true});
        submitSets(submitCollection.loadBrandCardsData, sobj).then(res => {
            this.setState({isloading:false});
            if(res && res.status){
                let cacheobj = { sobj: selsubcat, data: (res.extra?res.extra:[]) }
                this.props.setMPBrandNavCache(cacheobj);
                this.setBrandsAvailability((res.extra?res.extra:[]));
            } else{
                this.props.updateBrandDataPanel([], true);
            }
        });

    }
    //load brand data from cache
    loadCacheBrandData = () => {
        if(this.props.masterPlanogramState && this.props.masterPlanogramState.mpBrandNavCache){
            let selsubcat = this.props.selectedSubCat;
            let cachedata = this.props.masterPlanogramState.mpBrandNavCache;
            
            if(cachedata.sobj && cachedata.sobj.id === selsubcat.id){
                this.setBrandsAvailability(cachedata.data);
            } else{
                this.loadBrandData();
            }
        } else{
            this.loadBrandData();
        }
    }
    //compare brand data 
    setBrandsAvailability = (slist) => {
        let cdatalist = slist.sort((a,b) => (b.percentageSuggestion - a.percentageSuggestion));
        this.props.updateBrandDataPanel(cdatalist, false);

        let brandlist = JSON.parse(JSON.stringify(cdatalist));
        let defsubcatlist = this.props.selectedCatRect.sub_categories ? this.props.selectedCatRect.sub_categories : [];
        let selsubcat = this.props.selectedSubCat;
        
        let newbrandlist = [];
        for (let i = 0; i < brandlist.length; i++) {
            let cardbrand = brandlist[i];
            cardbrand.isAvailable = false;
            
            for (let x = 0; x < defsubcatlist.length; x++) {
                if(!defsubcatlist[x].isDelete && ((selsubcat.type === catRectEnums.default && defsubcatlist[x].type === catRectEnums.default && getNameorIdorColorofBox(defsubcatlist[x],"num") === getNameorIdorColorofBox(selsubcat,"num")) || 
                (selsubcat.type === catRectEnums.rule && defsubcatlist[x].type === catRectEnums.rule && getNameorIdorColorofBox(defsubcatlist[x],"num") === getNameorIdorColorofBox(selsubcat,"num")))){
                    
                    let isAvlIndx = -1; let isRectAvailable = false;
                    for (let r = 0; r < defsubcatlist[x].rects.length; r++) {
                        if(!defsubcatlist[x].rects[r].isDelete){
                            let rectbrandarr = (defsubcatlist[x].rects[r].brands ? defsubcatlist[x].rects[r].brands : []);
                            let selbrandidx = rectbrandarr.findIndex(z => !z.isDelete && getNameorIdorColorofBox(z, "num") === cardbrand.brandId);
                            let isselbrandrectavl = (selbrandidx > -1 && rectbrandarr[selbrandidx].rects?rectbrandarr[selbrandidx].rects.filter(l => !l.isDelete):[])

                            isRectAvailable = (isselbrandrectavl && isselbrandrectavl.length > 0?true:isRectAvailable);
                            isAvlIndx = (isAvlIndx === -1?selbrandidx:isAvlIndx);
                        }
                    }
                    
                    cardbrand.isAvailable = (isAvlIndx > -1 ? true : cardbrand.isAvailable);
                    cardbrand.isRectAvailable = isRectAvailable;

                    if(cardbrand.isAvailable){
                        newbrandlist.push(cardbrand);
                    }
                }
            }
        }
        // console.log(newbrandlist);
        brandlist = newbrandlist;
        
        this.setState({ oriBrandList: brandlist });
        this.groupToSliderItems(brandlist);
    }

    //group items two by two
    groupToSliderItems = (mlist) => {
        //console.log(mlist);
        //let mlist = (saveobj.categories && saveobj.categories.length > 0?saveobj.categories:[]);
        
        let reducecount = this.state.showCount;
        //console.log(mlist);
        let newlist = [];
        var newsublist = {items: []};
        for (let i = 0; i < mlist.length; i++) {
            const catitem = mlist[i];
            
            if(!catitem.isDelete && !catitem.is_unallocated_view && catitem.isAvailable){
                if(this.props.isRTL === "rtl"){
                    newsublist.items.unshift(catitem);
                } else{
                    newsublist.items.push(catitem);
                }
                
                if(!catitem.isDelete && reducecount > 1){
                    reducecount = (reducecount - 1);
    
                    if((i + 1) === mlist.length){
                        newlist.push(newsublist);
                    }
                } else{
                    reducecount = this.state.showCount;
                    newlist.push(newsublist);
    
                    newsublist = {items: []};
                }
            }
            
        }
        //console.log(newlist);
        this.setState({ sliderItems: newlist, sliderLength: newlist.length, sliderItemCount:mlist.length });
    }

    setSliderIndex = (isadd) => {
        let curindex = this.state.sliderIndex;
        if(isadd && (curindex + 1) === this.state.sliderLength){
            curindex = 0;
        } else if(isadd){
            curindex = (curindex + 1);
        } else if(curindex > 0){
            curindex = (curindex - 1);
        }

        this.setState({ sliderIndex: curindex });
    }

    initRedirect = (type, obj, sliderindex) =>{
        if(type==="cat"){
            var catlist = this.props.defSaveObj.categories ? this.props.defSaveObj.categories :[];
            let parentitem = null; let rectitem = null;

            for (let j = 0; j < catlist.length; j++) {
                const catitem = catlist[j];
                let rectindex = (!catitem.isDelete && catitem.rects && catitem.rects.length > 0?catitem.rects.findIndex(x => !x.isDelete && 
                    ((!obj.isRule && x.type === catRectEnums.default && getNameorIdorColorofBox(x, "num") === obj.categoryId) || (obj.isRule && x.type === catRectEnums.rule && obj.level === x.rule.level && getNameorIdorColorofBox(x, "num") === obj.categoryId))):-1);

                if(rectindex > -1){
                    parentitem = catitem;
                    rectitem = catitem.rects[rectindex];
                    break;
                }
            }
            
            if(parentitem){
                //this.props.redirectToCategory("scat", parentitem, sliderindex, rectitem);
                if(this.props.isnavview){
                    this.props.saveCategoryObj(false, null, true, parentitem, rectitem);
                } else{
                    this.props.saveCategoryObj(true, parentitem, rectitem);
                }
            }
            else{
                alertService.warn("Category is not available");
            }
        }
        else if(type==="scat"){
            var subcatlist = this.props.selectedCatRect.sub_categories ? this.props.selectedCatRect.sub_categories : [];
            var subcatindex = subcatlist.findIndex(x => !x.isDelete && 
                ((!obj.isRule && x.type === catRectEnums.default && getNameorIdorColorofBox(x, "num") === obj.subcategoryId) || (obj.isRule && x.type === catRectEnums.rule && obj.level === x.rule.level && getNameorIdorColorofBox(x, "num") === obj.subcategoryId)));
            
            if(subcatindex > -1){
                var subcatobj = subcatlist[subcatindex];
                //console.log(subcatobj);
               //this.props.redirectToCategory("brand", subcatobj, sliderindex);

               if(this.props.issubnavview){
                this.props.saveCategoryObj(false, null, true, subcatobj);
               } else{
                this.props.saveCategoryObj(true, subcatobj);
               }
               
            }
            else{
                alertService.warn("Sub Category is not available");
            }
        }
        else if(type==="brand"){
            let selectedSubCat = this.props.selectedSubCat;
            let subcatlist = this.props.selectedCatRect.sub_categories ? this.props.selectedCatRect.sub_categories : [];
            
            let subcatindex = subcatlist.findIndex(x => !x.isDelete && getNameorIdorColorofBox(x, "num") === getNameorIdorColorofBox(selectedSubCat, "num"));
            
            if(subcatindex > -1){
                let subcatobj = subcatlist[subcatindex];
                let subrects = subcatobj.rects ? subcatobj.rects : [];

                var brandsarr = [];
                for (let y = 0; y < subrects.length; y++) {
                    var blist = subrects[y].brands ? subrects[y].brands : [];
                    brandsarr = brandsarr.concat(blist);
                }
                
                var productindex = brandsarr.findIndex(x => !x.isDelete && getNameorIdorColorofBox(x, "num") === obj.brandId);
                //console.log(brandsarr);

                if(productindex>-1){
                    let brandobj = brandsarr[productindex];
                    let brandArrItem = this.props.bottomAddedList.find(x => x.brandId === brandobj.brand.brandId);

                    //this.props.redirectToCategory("product", prodobj, sliderindex);
                    if(brandArrItem){
                        this.props.saveCategoryObj(true, brandArrItem);
                    } else{
                        alertService.warn(this.props.t("brandnotfound"));
                    }
                }
                else{
                    alertService.warn(this.props.t("brandnotfound"));
                }
            } else{
                alertService.warn(this.props.t("subcatnotfound"));
            }
        }
    }
    
    
    render() {
        //console.log(this.props.defSaveObj);

        return(
            <Col xs={12} style={{padding:"0"}}>
                {!this.props.isnavview && this.state.isloading === true ? <Col xs={12} style={{textAlign:"center", paddingTop:"25%"}} className='loading-icon'><img style={{width:"25px"}} className='loader-gif' src={loader} alt="loader"/></Col>:<></>}
                <div className={this.state.isloading === true ? " d-none " : ""}>
                    
                    {!this.props.isnavview && !this.props.issubnavview && this.state.sliderItems && this.state.sliderItems.length > 1?<>
                        {this.state.sliderIndex > 0?<div className='carousel-indicator' onClick={() => this.setSliderIndex(false)}><ChevronLeftIcon size={16}/></div>:<></>}
                        {(this.state.sliderIndex + 1) !== this.state.sliderItems.length?<div className='carousel-indicator right' onClick={() => this.setSliderIndex(true)}><ChevronRightIcon size={16}/></div>:<></>}
                    </>:<></>}
                    
                    {
                        // Category View
                        this.state.sliderItems && this.state.sliderItems.length > 0 && this.props.summaryViewType==="cat" ?<>
                            {this.props.isnavview?
                                <ul className='list-inline'>
                                    {this.state.oriCatList && this.state.oriCatList.length > 0?<>
                                        {this.state.oriCatList.map((xitem, xidx) => {
                                            let cselrect = this.props.selectedCatRect;
                                            let curselrectactive = (cselrect && ((cselrect.type === catRectEnums.default && !xitem.isRule && getNameorIdorColorofBox(cselrect, "num") === xitem.categoryId) || 
                                            (cselrect.type === catRectEnums.rule && xitem.isRule && getNameorIdorColorofBox(cselrect, "num") === xitem.categoryId)));

                                            return <React.Fragment key={xidx}>{!xitem.isDelete && xitem.isAvailable?
                                                <><TooltipWrapper placement="bottom" text={xitem.categoryName}>
                                                    <li className={'list-inline-item'+(curselrectactive?" active":"")+(xitem.isRule?" sup-item":'')+(xitem.isPathCompleted?" complete-item":'')}
                                                    onClick={() => (curselrectactive?null:this.initRedirect("cat", xitem, null)) }>
                                                        {(xitem.categoryName.substring(0,10)+(xitem.categoryName.length>10?"..":""))}
                                                    </li>
                                                </TooltipWrapper>
                                                { this.state.catNewProductCount ? this.state.catNewProductCount.length>0 ? this.state.catNewProductCount.find(x => x.categoryId === xitem.categoryId) ? this.state.catNewProductCount.find(x => x.categoryId === xitem.categoryId).newProdCount > 0 ? <Badge className='new-prod-count-icon' variant='danger'>{this.state.catNewProductCount.find(x => x.categoryId === xitem.categoryId).newProdCount}</Badge> : <></> : <></> : <></> : <></> }
                                                </>:<></>}</React.Fragment>;
                                        })}
                                    </>:<></>}  
                                </ul>
                            :<Carousel className='carousel-content' interval={null} activeIndex={this.state.sliderIndex} controls={false} indicators={false}>
                                {this.state.sliderItems.map((xitem, xidx) => {
                                    //console.log(xitem)
                                    return <Carousel.Item key={xidx}>
                                        <Carousel.Caption>
                                            <Row>   
                                                {xitem.items.map((zitem, zidx) => {
                                                    return <Col xs={(this.state.showCount > 3?3:this.state.showCount > 2?4:6)} className='slider-minwrapper' key={zidx}>
                                                        <Col className={'slider-mincontent '+((zitem.isPathCompleted && zitem.subcategories.length > 0 && zitem.isScatAvailable)?"available":"")} onClick={() => this.initRedirect("cat", zitem, this.state.sliderIndex)}>
                                                            <TooltipWrapper text={zitem.categoryName}>
                                                                <h3>{zitem.categoryName} <div style={{background:(zitem.color?zitem.color:"#dc3545")}} className='content-color'></div></h3>
                                                            </TooltipWrapper>
                                                            {
                                                                zitem.subcategories.length>0 ?
                                                                <Col xs={12} className="sub-content-items">
                                                                    {
                                                                        zitem.subcategories.map((sitem,sindx) =>{

                                                                            let itemsaleper = (sitem.sales && sitem.sales.percentage ? sitem.sales.percentage : 0);
                                                                            let itemspaceper = (sitem.space && sitem.space.percentage ? sitem.space.percentage : 0);
                                                                            let itemprofper = (sitem.profit && sitem.profit.percentage ? sitem.profit.percentage : 0);
                                                                            
                                                                            let itemspacecolor = (itemspaceper > itemsaleper?"#EB5757":"#48a633"); 
                                                                            let itemname = (sitem.subcategoryName?sitem.subcategoryName:"-");
                                                                            let isconflictsavl = (sitem.isConflict && itemsaleper === 0 && itemspaceper === 0 && itemprofper === 0);

                                                                            return <React.Fragment key={sindx}>
                                                                                <Col className={'mini-subcontent subcat '+(sitem.isPathCompleted?"available":"")}>
                                                                                    <TooltipWrapper text={itemname}>
                                                                                        <h4 className={isconflictsavl?'no-margbottom':''}>{itemname} <div style={{background:(sitem.color?sitem.color:"#dc3545")}} className='round-color'></div></h4>
                                                                                    </TooltipWrapper>
                                                                                    
                                                                                    {!isconflictsavl?<>
                                                                                        <Col className='progress-margin'>
                                                                                            <CustomProgressBar text={this.props.t("MP_CHART_TITLES.sales")} mainbarcolor={"#48a633"} mainbarpercentage={itemsaleper} textcolor={"white"} showsubbar="true" showpercentage={true} subbarpercentage={0} />
                                                                                        </Col>
                                                                                        <Col className='progress-margin'>
                                                                                            <CustomProgressBar text={this.props.t("MP_CHART_TITLES.space")} mainbarcolor={itemspacecolor} mainbarpercentage={itemspaceper} textcolor={"white"} showsubbar="true" showpercentage={true} subbarpercentage={0} />
                                                                                        </Col>
                                                                                        <Col className='progress-margin'>
                                                                                            <CustomProgressBar text={this.props.t("MP_CHART_TITLES.profit")} mainbarcolor={"#48a633"} mainbarpercentage={itemprofper} textcolor={"white"} showsubbar="true" showpercentage={true} subbarpercentage={0} />
                                                                                        </Col>
                                                                                    </>:<></>}
                                                                                </Col>
                                                                            </React.Fragment>;
                                                                        })
                                                                    }
                                                                </Col>
                                                                :
                                                                <Col className='text-content no-content'>
                                                                    <p>{this.props.t("CLICK_TO_EDIT")}</p>
                                                                </Col>
                                                            }
                                                        </Col>
                                                    </Col>
                                                })}
                                            </Row>
                                        </Carousel.Caption>
                                    </Carousel.Item>
                                })}
                            </Carousel>}
                            
                        </>:
                        //Sub Category View
                        this.state.sliderItems && this.state.sliderItems.length > 0 && this.props.summaryViewType==="scat" ?<>
                            {this.props.issubnavview?
                                <ul className='list-inline'>
                                    {this.state.oriScatList && this.state.oriScatList.length > 0?<>
                                        {this.state.oriScatList.map((xitem, xidx) => {
                                            let cselrect = this.props.selectedSubCat;
                                            let curselrectactive = (cselrect && ((cselrect.type === catRectEnums.default && !xitem.isRule && getNameorIdorColorofBox(cselrect, "num") === xitem.subcategoryId) || 
                                            (cselrect.type === catRectEnums.rule && xitem.isRule && getNameorIdorColorofBox(cselrect, "num") === xitem.subcategoryId)));
                                            
                                            return <React.Fragment key={xidx}>{!xitem.isDelete && xitem.isAvailable?
                                                <><TooltipWrapper placement="bottom" text={xitem.subcategoryName}>
                                                    <li className={'list-inline-item'+(curselrectactive?" active":"")+(xitem.isRule?" sup-item":'')+(xitem.isPathCompleted?" complete-item":'')} title={xitem.subcategoryName} 
                                                    onClick={() => (curselrectactive?null:this.initRedirect("scat", xitem, null)) }>
                                                        {(xitem.subcategoryName.substring(0,10)+(xitem.subcategoryName.length>10?"..":""))}
                                                    </li>
                                                </TooltipWrapper>
                                                { this.state.subCatNewProductCount ? this.state.subCatNewProductCount.length>0 ? this.state.subCatNewProductCount.find(x => (x.id === xitem.subcategoryId  && x.name === xitem.subcategoryName)) ? this.state.subCatNewProductCount.find(x => (x.id === xitem.subcategoryId  && x.name === xitem.subcategoryName)).newProdCount > 0 ? <Badge className='new-prod-count-icon' variant='danger'>{this.state.subCatNewProductCount.find(x => (x.id === xitem.subcategoryId && x.name === xitem.subcategoryName)).newProdCount}</Badge> : <></> : <></> : <></> : <></> }
                                                </>:<></>}</React.Fragment>;
                                        })}
                                    </>:<></>}  
                                </ul>
                            :<Carousel className='carousel-content' interval={null} activeIndex={this.state.sliderIndex} controls={false} indicators={false}>
                                {this.state.sliderItems.map((xitem, xidx) => {
                                    //console.log(xitem)
                                    return <Carousel.Item key={xidx}>
                                        <Carousel.Caption>
                                            <Row>   
                                                {xitem.items.map((zitem, zidx) => {
                                                    return <Col xs={(this.state.showCount > 3?3:this.state.showCount > 2?4:6)} className='slider-minwrapper' key={zidx}>
                                                        <Col className={'slider-mincontent '+((zitem.isPathCompleted && zitem.brands.length > 0 && zitem.isBrandAvailable)?"available":"")} onClick={() => this.initRedirect("scat", zitem, this.state.sliderIndex)}>
                                                            <TooltipWrapper text={zitem.subcategoryName}>
                                                                <h3>{zitem.subcategoryName} <div style={{background:(zitem.color?zitem.color:"#dc3545")}} className='content-color'></div></h3>
                                                            </TooltipWrapper>
                                                            
                                                            {zitem.isBrandAvailable && zitem.brands.length > 0 ?
                                                                <Col xs={12} className="sub-content-items">
                                                                    {
                                                                        zitem.brands.map((sitem,sindx) =>{

                                                                            let itemsaleper = (sitem.sales && sitem.sales.percentage ? sitem.sales.percentage : 0);
                                                                            let itemspaceper = (sitem.space && sitem.space.percentage ? sitem.space.percentage : 0);
                                                                            let itemprofper = (sitem.profit && sitem.profit.percentage ? sitem.profit.percentage : 0);
                                                                            
                                                                            let itemspacecolor = (itemspaceper > itemsaleper?"#EB5757":"#48a633"); 
                                                                            let isconflictsavl = (sitem.isConflict && itemsaleper === 0 && itemspaceper === 0 && itemprofper === 0);

                                                                            return <React.Fragment key={sindx}>
                                                                                <Col className={'mini-subcontent brand '+(sitem.isPathCompleted?"available":"")}>
                                                                                    <TooltipWrapper text={sitem.brandName}>
                                                                                        <h4 className={isconflictsavl?'no-margbottom':''}>{sitem.brandName} <div style={{background:(sitem.color?sitem.color:"#dc3545")}} className='round-color'></div></h4>
                                                                                    </TooltipWrapper>
                                                                                    
                                                                                    {!isconflictsavl?<>
                                                                                        <Col className='progress-margin'>
                                                                                            <CustomProgressBar text={this.props.t("MP_CHART_TITLES.sales")} mainbarcolor={"#48a633"} mainbarpercentage={itemsaleper} textcolor={"white"} showsubbar="true" showpercentage={true} subbarpercentage={0} />
                                                                                        </Col>
                                                                                        <Col className='progress-margin'>
                                                                                            <CustomProgressBar text={this.props.t("MP_CHART_TITLES.space")} mainbarcolor={itemspacecolor} mainbarpercentage={itemspaceper} textcolor={"white"} showsubbar="true" showpercentage={true} subbarpercentage={0} />
                                                                                        </Col>
                                                                                        <Col className='progress-margin'>
                                                                                            <CustomProgressBar text={this.props.t("MP_CHART_TITLES.profit")} mainbarcolor={"#48a633"} mainbarpercentage={itemprofper} textcolor={"white"} showsubbar="true" showpercentage={true} subbarpercentage={0} />
                                                                                        </Col>
                                                                                    </>:<></>}
                                                                                </Col>
                                                                            </React.Fragment>;
                                                                        })
                                                                    }
                                                                </Col>
                                                                :
                                                                <Col className='text-content no-content'>
                                                                    <p>{this.props.t("CLICK_TO_EDIT")}</p>
                                                                </Col>
                                                            }
                                                        </Col>
                                                    </Col>
                                                })}
                                            </Row>
                                        </Carousel.Caption>
                                    </Carousel.Item>
                                })}
                            </Carousel>}
                        </>:

                        //Brand View
                        this.state.sliderItems && this.state.sliderItems.length > 0 && (this.props.summaryViewType==="brand" || this.props.summaryViewType==="product") ?
                        <Carousel className='carousel-content' interval={null} activeIndex={this.state.sliderIndex} controls={false} indicators={false}>
                            {this.state.sliderItems.map((xitem, xidx) => {
                                //console.log(xitem)
                                return <Carousel.Item key={xidx}>
                                    <Carousel.Caption>
                                        <Row>   
                                            {xitem.items.map((zitem, zidx) => {
                                                return <Col xs={(this.state.showCount > 3?3:this.state.showCount > 2?4:6)} className='slider-minwrapper' key={zidx}>
                                                    <Col className={'slider-mincontent '+(zitem.isPathCompleted?"available":"")} onClick={() => this.initRedirect("brand", zitem, this.state.sliderIndex)}>
                                                        <TooltipWrapper text={zitem.brandName}>
                                                            <h3>{zitem.brandName} <div style={{background:(zitem.color?zitem.color:"#dc3545")}} className='content-color'></div></h3>
                                                        </TooltipWrapper>
                                                        {zitem.isRectAvailable && zitem.products.length > 0 ?
                                                            <Col xs={12} className="sub-content-items">
                                                                {
                                                                    zitem.products.map((sitem,sindx) =>{

                                                                        let itemsaleper = (sitem.sales && sitem.sales.percentage ? sitem.sales.percentage : 0);
                                                                        let itemspaceper = (sitem.space && sitem.space.percentage ? sitem.space.percentage : 0);
                                                                        let itemprofper = (sitem.profit && sitem.profit.percentage ? sitem.profit.percentage : 0);
                                                                        
                                                                        let itemspacecolor = (itemspaceper > itemsaleper?"#EB5757":"#48a633"); 
                                                                        let isconflictsavl = (sitem.isConflict && itemsaleper === 0 && itemspaceper === 0 && itemprofper === 0);

                                                                        return <React.Fragment key={sindx}>
                                                                            <Col className='mini-subcontent'>
                                                                                <TooltipWrapper text={sitem.productName}>
                                                                                    <h4 className={isconflictsavl?'no-margbottom':''}>{sitem.productName} <div style={{background:(sitem.color?sitem.color:"#dc3545")}} className='round-color'></div></h4>
                                                                                </TooltipWrapper>
                                                                                
                                                                                {!isconflictsavl?<>
                                                                                    <Col className='progress-margin'>
                                                                                        <CustomProgressBar text={this.props.t("MP_CHART_TITLES.sales")} mainbarcolor={"#48a633"} mainbarpercentage={itemsaleper} textcolor={"white"} showsubbar="true" showpercentage={true} subbarpercentage={0} />
                                                                                    </Col>
                                                                                    <Col className='progress-margin'>
                                                                                        <CustomProgressBar text={this.props.t("MP_CHART_TITLES.space")} mainbarcolor={itemspacecolor} mainbarpercentage={itemspaceper} textcolor={"white"} showsubbar="true" showpercentage={true} subbarpercentage={0} />
                                                                                    </Col>
                                                                                    <Col className='progress-margin'>
                                                                                        <CustomProgressBar text={this.props.t("MP_CHART_TITLES.profit")} mainbarcolor={"#48a633"} mainbarpercentage={itemprofper} textcolor={"white"} showsubbar="true" showpercentage={true} subbarpercentage={0} />
                                                                                    </Col>
                                                                                </>:<></>}
                                                                            </Col>
                                                                        </React.Fragment>;
                                                                    })
                                                                }
                                                            </Col>
                                                            :
                                                            <Col className='text-content no-content'>
                                                                <p>{this.props.t("CLICK_TO_EDIT")}</p>
                                                            </Col>
                                                        }
                                                    </Col>
                                                </Col>
                                            })}
                                        </Row>
                                    </Carousel.Caption>
                                </Carousel.Item>
                            })}
                        </Carousel>      
                        :
                        <>
                            {!this.props.isnavview && !this.props.issubnavview?
                                <h5 className='noitems-txt'>{this.props.t("NO_NAVIGATION_ITEMS_FOUND")}</h5>
                            :<></>}
                        </>
                        
                    }
                    <Col className={'text-center count-label '+(this.state.sliderItems && this.state.sliderItems.length > 0 && this.state.isloading === false? "" : " d-none")}>
                        {this.props.isRTL === "ltr"?<label>{(this.state.sliderItemCount >= ((this.state.sliderIndex+1) * this.state.showCount) ? ((this.state.sliderIndex+1) * this.state.showCount) : this.state.sliderItemCount)+"/"+(this.state.sliderItemCount)} {this.props.t("items")}</label>:
                        <label>{this.props.t("items")} {(this.state.sliderItemCount)+"/"+(this.state.sliderItemCount >= ((this.state.sliderIndex+1) * this.state.showCount) ? ((this.state.sliderIndex+1) * this.state.showCount) : this.state.sliderItemCount)}</label>}
                    </Col>
                </div>
            </Col>
        )
    }
}

const mapStateToProps = state => ({
    ...state
});

const mapDispatchToProps = dispatch => ({
    setMPCategoryNavCache: (payload) => dispatch(mpCategoryNavCacheSetAction(payload)),
    setMPSubCategoryNavCache: (payload) => dispatch(mpSubCategoryNavCacheSetAction(payload)),
    setMPBrandNavCache: (payload) => dispatch(mpBrandNavCacheSetAction(payload)),
});

export default withTranslation()(withRouter((connect(mapStateToProps, mapDispatchToProps)(MpSliderContent))));