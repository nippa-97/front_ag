import React from 'react';
import { Accordion, Button, ButtonGroup, Col, Dropdown, Form, ListGroup, Modal, Row } from 'react-bootstrap';
import FeatherIcon from 'feather-icons-react';
import DatePicker from 'react-datepicker';
import { v4 as uuidv4 } from 'uuid';
import Select from 'react-select';
import Switch from "react-switch";
import { confirmAlert } from 'react-confirm-alert';
import { CopyToClipboard } from 'react-copy-to-clipboard'; //copy text to clipboard

import { alertService } from '../../../../_services/alert.service';
import PreviewImage from '../../../common_layouts/image_preview/imagePreview';
import { SingleProdView } from './singleitem';
import { BrokenConnectionIcon, GroupProdIcon, InOutIcon, MoreLayersIcon, SortASCIcon, SortDESCIcon, SortGroupsIcon } from '../../../../assets/icons/icons';
import { ChevronDownIcon, XIcon } from '@primer/octicons-react';

import { submitSets } from '../../../UiComponents/SubmitSets';
import { submitCollection } from '../../../../_services/submit.service';
import { NewProdStrategyApplyModal, ProdSelectSearch, TypeSelectDrop, VerSelectDrop } from './additionalcomps';
import { countTextCharacter, getPager, preventNumberInput, preventinputToString } from '../../../../_services/common.service';

import "./newproducts.css";
import { MandatoryOption } from '../../../../enums/newProductsEnums';
import { NewProdsSidebarView } from './newprodsidebar';
import{NewProductApplyDetailsModel} from "../../../masterdata/newProducts/newproductCommen";

// import { samplenewprods } from './sampledata';


/**
 *  Using to show available new products in aui screen
 *
 * @export
 * @class NewProdsView
 * @extends {React.Component}
 */
export class NewProdsView extends React.Component {
    constructor(props) {
        super(props);

        this._ismounted = false;
        this.whitecontainer = React.createRef();
        this._facingTimeout = null;

        this.state = {
            sobj: this.defaultSearchObj(false),
            oneResultWidth: 270, oneResultHeight: 320,

            allSubCatsList: [], 
            newProdList: [], totalProdCount: 0, totalLoadedCount: 0,
            loadedPages: [], totalPages: 0, currentPage: 1, pagerDetails: null, isBottomDataAdd: true,
            isDataLoading: false,
            isShowGrouping: false, newGroupList: [],

            showPreviewImageModal: false, productId: 0,

            isOngoingSave: false, pendingSaveQueque: [],

            cancelProds: [], isShowCancelModal: false, isProdCanceling: false,
            isGroupSave: false,
            selectedcard: null,
            responseObj:[],
            isApplyModel:false,

            //strategy apply prods
            isShowStrategyModal: false,
            isShowStrategyHelp: false,
            isSaveApply: false,
            selectedSaveProds: [], notAvailableStrategy: 0,
            isDatePicker1Focused: false,
            isDatePicker2Focused: false,

        };
    }

    componentDidMount() {
        this._ismounted = true;

        if(this._ismounted){
            this.loadAllSubCats();

            this.setState({ sobj: this.defaultSearchObj(true) }, () => {
                this.loadFilterData(true);
            });
        }
    }
    
    componentWillUnmount() {
        this._ismounted = false;
    }
    
    defaultSearchObj = (isCalcCount) => {
        let defsaveobj = this.props.defSaveObj;
        
        let defMaxResults = 12;
        let defColumnCount = 4;
        if(isCalcCount){
            let resultviewwidth = (this.whitecontainer.current?(this.whitecontainer.current.offsetWidth):0);
            let totalrowcount = parseInt(resultviewwidth / this.state.oneResultWidth);
            
            defMaxResults = (totalrowcount * 3);
            defColumnCount = (totalrowcount > defColumnCount?totalrowcount:defColumnCount);
        }
        
        return { 
            searchBy: "", 
            filterBy: { 
                categoryId: -1, 
                subcategoryId: -1,
                brandId: -1, 
                creationFromDate: "", 
                creationToDate: "" 
            },
            sortBy: { 
                category: false,
                subCategory: false,
                brand: false,
                creationDate: false,
                orderType: "NONE",
                groupOrder: "first",
            },
            isSort: true,
            isReqPagination: true,
            maxResult: defMaxResults,
            maxColumnCount: defColumnCount,
            startIndex: 0,
            isInAppliedSection: false,
            departmentId: (defsaveobj?defsaveobj.department.department_id:-1),
        };
    }

    handleFilterObject = (evt, ckey, ctype,msg,e) => {
        let defsaveobj = this.props.defSaveObj;
        let searchobj = this.state.sobj;
        let isTriggerSearch = false;

        if(ckey === "searchBy"){
            if(!preventinputToString(e,e.target.value,msg)){
                e.preventDefault();
                return
            }
        }
        
        if(ckey === "creationFromDate" || ckey === "creationToDate"){

            if(ckey === "creationFromDate"){
                if(searchobj.filterBy.creationToDate !== ""){
                    if(new Date(evt).getTime() >= new Date(searchobj.filterBy.creationToDate).getTime()){
                        alertService.error(this.props.t("PLEASE_SET_VALID_DATE_RANGE"));
                        return;
                    }else{
                        searchobj.filterBy[ckey] = evt;
                    }
                }else{
                    searchobj.filterBy[ckey] = evt;
                }
            }

            if(ckey === "creationToDate"){

                if(searchobj.filterBy.creationFromDate !== ""){
                    if(new Date(searchobj.filterBy.creationFromDate).getTime() >= new Date(evt).getTime()){
                        alertService.error(this.props.t("PLEASE_SET_VALID_DATE_RANGE"));
                        return;
                    }else{
                        searchobj.filterBy[ckey] = evt;
                    }
                }else{
                    alertService.error(this.props.t("PLEASE_SET_A_FROM_DATE"));
                    return;
                }
            }

        }

        if(ckey === "searchBy" || ckey === "isInAppliedSection" || ckey === "isSort"){
            searchobj[ckey] = evt;
        } else if(ckey === "categoryId" || ckey === "subcategoryId" || ckey === "brandId" || ckey === "creationFromDate" || ckey === "creationToDate"){
            searchobj.filterBy[ckey] = (((ckey === "creationFromDate" || ckey === "creationToDate") && !evt)?"":evt);

            if(ckey === "categoryId"){
                let findscatobj = this.state.allSubCatsList.find(x => x.value === searchobj.filterBy.subcategoryId);
                
                if(findscatobj.obj && findscatobj.obj.categoryId !== searchobj.filterBy.categoryId){
                    searchobj.filterBy.subcategoryId = -1;
                }
            }
            
        } else if(ckey === "heirarchy"){
            if(evt.value > -1){
                let selobj = evt.obj;
                
                searchobj.filterBy["hierarchy"] = {
                    departmentId: (defsaveobj?defsaveobj.department.department_id:-1), 
                    categoryId: selobj.categoryId, 
                    subcategoryId: selobj.subCategoryId
                };
            } else{
                searchobj.filterBy.hierarchy = null;
            }
        } else if(ckey === "category" || ckey === "subCategory" || ckey === "brand" || ckey === "creationDate" || ckey === "orderType" || ckey === "groupOrder"){
            searchobj.sortBy[ckey] = evt;

            if(ckey !== "orderType" && ckey !== "groupOrder"){
                if(!searchobj.sortBy.category && !searchobj.sortBy.subCategory && !searchobj.sortBy.brand && !searchobj.sortBy.creationDate){
                    searchobj.sortBy.orderType = "NONE";
                } else{
                    searchobj.sortBy.orderType = "ASC";
                }
            }
        }
        
        if(ckey === "creationFromDate" || ckey === "creationToDate"){
            if(searchobj.filterBy.creationFromDate !== "" && searchobj.filterBy.creationToDate !== ""){
                let cfromdate = new Date(searchobj.filterBy.creationFromDate);
                let ctodate = new Date(searchobj.filterBy.creationToDate);

                if(cfromdate.getTime() <= ctodate.getTime()){
                    isTriggerSearch = true;
                } else{
                    alertService.error(this.props.t("PLEASE_SET_VALID_DATE_RANGE"));
                }
            } else if(searchobj.filterBy.creationFromDate === "" && searchobj.filterBy.creationToDate === ""){
                isTriggerSearch = true;
            }
        }
        searchobj.startIndex = 0;
        // console.log(searchobj);

        this.setState({ 
            sobj: searchobj, //isShowGrouping: false, newGroupList: [],
            // totalProdCount: 0, totalLoadedCount: 0,
            // loadedPages: [], totalPages: 0, currentPage: 1, pagerDetails: null, isBottomDataAdd: true,
        }, () => {
            if(ctype === "enter" || ctype === "click" || isTriggerSearch){
                this.setState({
                    newProdList: [], totalProdCount: 0, totalLoadedCount: 0,
                    loadedPages: [], totalPages: 0, currentPage: 1, pagerDetails: null, isBottomDataAdd: true,
                }, () => {
                    this.loadFilterData(true);
                });
            }

            if(ckey === "categoryId"){
                this.loadAllSubCats();
            }
        });
    }

    loadFilterData = (isclearall, ispaginateloading) => {
        this.props.toggleLoadingModal(true, () => {
            this.setState({ isDataLoading: true }, () => {
                submitSets(submitCollection.findNewProduct, this.state.sobj, true, null, true).then(res => {
                    let isbottomadd = JSON.parse(JSON.stringify(this.state.isBottomDataAdd));
                    // console.log(isbottomadd);

                    if(res && res.status){
                        let allprodlist = (isclearall?[]:this.state.newProdList);
                        let newprodlist = (res.extra && res.extra.length > 0?res.extra:[]);
                        
                        let mergeprodlist = (!isbottomadd?newprodlist.concat(allprodlist):allprodlist.concat(newprodlist));

                        let showCurPage = this.state.currentPage;
                        showCurPage = (newprodlist.length === 0?(isbottomadd?((showCurPage - 1) > 0?(showCurPage - 1):showCurPage):(showCurPage + 1)):showCurPage);
                        
                        this.setState({
                            newProdList: this.compareLoadedData(mergeprodlist),
                            totalProdCount: (isclearall?res.count:this.state.totalProdCount),
                            /* isShowGrouping: false, newGroupList: [], */
                            isBottomDataAdd: true,
                            currentPage: showCurPage
                        }, () => {
                            if(newprodlist.length > 0){
                                if(isclearall){
                                    this.setPager(this.state.currentPage, newprodlist, isbottomadd);
                                } else{
                                    this.updateLoadedPage(this.state.currentPage, newprodlist, isbottomadd);
                                }
                            }
                        });
                    } else{
                        if(isclearall){
                            this.setState({ newProdList: [], totalProdCount: 0 }); // , isShowGrouping: false, newGroupList: []
                        }
                        // alertService.error(res.extra && res.extra !== null?res.extra:this.props.t("erroroccurred"));
                    }

                    this.setState({ isDataLoading: false }, () => {
                        if(ispaginateloading){
                            this.setScrollGapfromTopBottom(isbottomadd);
                        }
                    });
                    this.props.toggleLoadingModal(false);
                });      
            });
        });
    }

    //
    setPager = (curpage, newitems, isbottomadd) => {
        let pager = getPager(this.state.totalProdCount, curpage, this.state.sobj.maxResult);
        // console.log(pager);

        this.setState({ totalPages: pager.totalPages, pagerDetails: pager, loadedPages: [], currentPage: curpage }, () => {
            this.updateLoadedPage(curpage, newitems, isbottomadd);
        });
    }

    //
    updateLoadedPage = (curpage, newitems, isbottomadd) => {
        let loadedpages = this.state.loadedPages;

        let isalreadyadded = loadedpages.findIndex(x => x.page === curpage);
        if(isalreadyadded > -1){
            loadedpages[isalreadyadded].items = newitems;
        } else{
            if(isbottomadd){
                loadedpages.push({ page: curpage, items: newitems });
            } else{
                loadedpages.unshift({ page: curpage, items: newitems });
            }
        }
        
        // console.log(loadedpages);
        this.setState({ loadedPages: loadedpages });
    }

    resetSearch = () => {
        this.setState({ 
            sobj: this.defaultSearchObj(), 
            totalProdCount: 0, totalLoadedCount: 0,
            loadedPages: [], totalPages: 0, currentPage: 1, pagerDetails: null, isBottomDataAdd: true,
        }, () => {
            this.loadAllSubCats();
            this.props.getNewProdCount();
            this.loadFilterData(true);
        });
    }

    //set scroll gap from top or bottom to after loading
    setScrollGapfromTopBottom = (isbottomscroll) => {
        let prodlistscroll = document.getElementById("newprodlist-scroll");
        // console.log("is bottom - "+(isbottomscroll?"true":"false"));

        if(isbottomscroll === true){
            // prodlistscroll.scrollTop = (prodlistscroll.scrollHeight - 50);
        } else{
            prodlistscroll.scrollTop = 50;
        }
    }

    compareLoadedData = (loadeddata, isAutoSave) => {
        // let allVersionsList = this.props.allVersionsList;
        // let allusedlist = allVersionsList.filter(z => z.type === "used");
        // let allunusedlist = allVersionsList.filter(z => z.type === "unused");

        let preProdList = this.state.newProdList;

        let totalloadedcount = 0;
        for (let i = 0; i < loadeddata.length; i++) {
            const singleitem = loadeddata[i];

            if(isAutoSave){
                let foundidx = preProdList.findIndex(x => x.uuid === singleitem.uuid);
                if(foundidx > -1){
                    singleitem.isChecked = (preProdList[foundidx].isChecked?preProdList[foundidx].isChecked:false);
                }
            }
            
            totalloadedcount = (totalloadedcount + singleitem.products.length);

            if(singleitem.type === "group"){
                let firstproditem = singleitem.products[0];

                singleitem.strategy = firstproditem.strategy;
                singleitem.selectionOption = firstproditem.selectionOption;
                singleitem.facing = firstproditem.facing;
                singleitem.testPeriod = firstproditem.testPeriod;
                singleitem.isInOutProduct = firstproditem.isInOutProduct;
                singleitem.vmpVerList = firstproditem.vmpVerList;
                // singleitem.mandatoryOption=firstproditem.mandatoryOption
                singleitem.chainOption = firstproditem.chainOption;

                 //vaidation auto all box
                 for (let j = 0; j < singleitem.products.length; j++) {
                    // const singleprod = singleitem.products[j];
                    let usedlist=this.props.allVersionsList.filter(x=>x.type==="used")
                    let unusedlist=this.props.allVersionsList.filter(x=>x.type==="unused")
                    let newusedlist=[]
                    let newunusedlist=[]
                    for (let i = 0; i < singleitem.vmpVerList.length; i++) {
                        const vid = singleitem.vmpVerList[i];
                        var haveinusedgroupn=usedlist.find(x=>x.mpId===vid)
                        if(haveinusedgroupn){
                            newusedlist.push(haveinusedgroupn)
                        }else{
                            var haveinunusedgroupn=unusedlist.find(x=>x.mpId===vid)
                            if(haveinunusedgroupn){
                                newunusedlist.push(haveinunusedgroupn)
                            }
                        }
                    }
                    if(newunusedlist.length===0){
                        //unused list all remove, all tick remove
                        singleitem["isUnusedChecked"] = false;
                    }else if(newunusedlist.length===unusedlist.length){
                        singleitem["isUnusedChecked"] = true;
                    }else{
                        singleitem["isUnusedChecked"] = false;
                    }

                    if(newusedlist.length===0){
                        //used list all remove, all tick remove
                        singleitem["isUsedChecked"] = false;
                    }else  if(newusedlist.length===usedlist.length){
                        singleitem["isUsedChecked"] = true;
                    }else{
                        singleitem["isUsedChecked"] = false;
                    }
                }
            }else{
                //vaidation auto all box
                for (let j = 0; j < singleitem.products.length; j++) {
                    const singleprod = singleitem.products[j];
                    let usedlist=this.props.allVersionsList.filter(x=>x.type==="used")
                    let unusedlist=this.props.allVersionsList.filter(x=>x.type==="unused")
                    let newusedlist=[]
                    let newunusedlist=[]
                    for (let i = 0; i < singleprod.vmpVerList.length; i++) {
                        const vid = singleprod.vmpVerList[i];
                        var haveinusedgroup=usedlist.find(x=>x.mpId===vid)
                        if(haveinusedgroup){
                            newusedlist.push(haveinusedgroup)
                        }else{
                            var haveinunusedgroup=unusedlist.find(x=>x.mpId===vid)
                            if(haveinunusedgroup){
                                newunusedlist.push(haveinunusedgroup)
                            }
                        }
                    }
                    if(newunusedlist.length===0){
                        //unused list all remove, all tick remove
                        singleprod["isUnusedChecked"] = false;
                    }else if(newunusedlist.length===unusedlist.length){
                        singleprod["isUnusedChecked"] = true;
                    }else{
                        singleprod["isUnusedChecked"] = false;
                    }

                    if(newusedlist.length===0){
                        //used list all remove, all tick remove
                        singleprod["isUsedChecked"] = false;
                    }else  if(newusedlist.length===usedlist.length){
                        singleprod["isUsedChecked"] = true;
                    }else{
                        singleprod["isUsedChecked"] = false;
                    }
                }
                
            }
            

            /* for (let j = 0; j < singleitem.products.length; j++) {
                const singleprod = singleitem.products[j];
                
                let isallunsedselected = false;
                for (let k = 0; k < allusedlist.length; k++) {
                    const element = allusedlist[k];
                    
                }
            } */
        }

        this.setState({ totalLoadedCount: totalloadedcount });

        //console.log(loadeddata);
        return loadeddata;
    }

    //load all subcats
    loadAllSubCats = () => {
        let defsaveobj = this.props.defSaveObj;
        var obj = { 
            departmentId: (defsaveobj?defsaveobj.department.department_id:0), 
            depCategoryId: this.state.sobj.filterBy.categoryId,
            isReqPagination:false
        };

        submitSets(submitCollection.getSubCategories, obj).then(resp => {
        if(resp && resp.status){
            let arr = [{value:-1, label: this.props.t("any_subcategory")}];
            for (let i = 0; i < resp.extra.length; i++) {
                arr.push({
                    value:resp.extra[i].subCategoryId,
                    label:resp.extra[i].subCategoryName,
                    obj: resp.extra[i]
                });
            }
            this.setState({ allSubCatsList: arr });
        } 
        })
    }

    handleProductSelect = (prodidx, changetype, changevalue, ischild, childidx) => {
        // console.log(prodidx, changetype, changevalue, ischild, childidx);
        let prodlist = this.state.newProdList;

        if(ischild){
            prodlist[prodidx].products[childidx][changetype] = changevalue;
        } else{
            prodlist[prodidx][changetype] = changevalue;
        }
        // console.log(prodlist[prodidx]);
        
        this.setState({ newProdList: prodlist }, () => {
            if(changetype !== "isChecked"){
                this.autoSaveChanges();
            }
        });
    }

    toggleGroupingMode = () => {
        //check products available to group
        if(!this.state.isShowGrouping){
            let availProdList = this.state.newProdList.filter(x => !x.isDelete); //&& (x.type === "normal" || x.type === "none")
            if(availProdList.length === 0){
                alertService.warn(this.props.t("NO_PRODS_TO_GROUP"));
                return false;
            }
        }

        this.setState({ isShowGrouping: !this.state.isShowGrouping, newGroupList: [] });
    }

    copyToClipboard = (ctxt) => {
        alertService.info(this.props.t("COPIED_TO_CLIP_BOARD"));
    }

    handleImagePreviewModal = (obj, type, evt) => {
        if(evt){
            evt.stopPropagation();
        }

        this.setState({productId:(obj?obj.productId:0), showPreviewImageModal:type});
    }

    handleAddNewSelected = (pobj, pidx) => {
        let selectedProdList = this.state.newGroupList;

        /* let isAllowContinue = true;
        if(selectedProdList && selectedProdList.length > 0){
            let firstitem = selectedProdList[0].prodobj;
            if(firstitem.brand && (firstitem.brand.brandId !== pobj.brand.brandId || firstitem.categoryId !== pobj.categoryId || firstitem.subCategoryId !== pobj.subCategoryId)){
                isAllowContinue = false;
            }
        } */

        // if(isAllowContinue){
            let isalreadyadded = selectedProdList.findIndex(x => x.prodobj.uuid === pobj.uuid);

            if(isalreadyadded > -1){
                selectedProdList.splice(isalreadyadded, 1);
            } else{
                selectedProdList.push({ prodobj: pobj, prodidx: pidx });
            }
            
            // console.log(selectedProdList);
            this.setState({ newGroupList: selectedProdList });
        /* } else{
            alertService.error(this.props.t("GROUPDETAILS_NOT_MATCHING"));
        } */
    }

    mergeSelectedProds = () => {
        let searchobj = this.state.sobj;
        let selectedProdlist = JSON.parse(JSON.stringify(this.state.newGroupList));
        
        if(selectedProdlist.length > 1){
            let firstselitem = selectedProdlist[0].prodobj;
            let newProdList = this.state.newProdList;

            let newuuid = uuidv4();
            let newgroupitem = { 
                type: "group", 
                groupId: -1, categoryId: firstselitem.categoryId, subCategoryId: firstselitem.subCategoryId, 
                brand: firstselitem.brand, 
                products: [], 
                isNew: true,
                uuid: newuuid,
            };
            //
            newgroupitem = this.resetMetaData(newgroupitem);

            //find groups available
            let findfirstgroupidx = selectedProdlist.findIndex(x => (x.prodobj.type === "group" || x.prodobj.type === "separateGroup"));
            if(findfirstgroupidx > -1){
                newgroupitem = JSON.parse(JSON.stringify(selectedProdlist[findfirstgroupidx].prodobj));
                newgroupitem["isNew"] = true;
            }
            
            for (let i = 0; i < selectedProdlist.length; i++) {
                const selitem = selectedProdlist[i];
                
                if(findfirstgroupidx === -1 || i !== findfirstgroupidx){
                    for (let j = 0; j < selitem.prodobj.products.length; j++) {
                        let selsubprod = selitem.prodobj.products[j];
                        
                        selsubprod["parentId"] = selitem.prodobj.uuid;
                        selsubprod = this.resetMetaData(selsubprod);
                        // console.log(selsubprod);
                        // newgroupitem.brand = (selitem.prodobj.brand?selitem.prodobj.brand:{ brandId: -1, brandName: "-" });
                        newgroupitem.products.push(selsubprod);    
                    }  
                }

                let finditeminlist = newProdList.findIndex(x => x.uuid === selitem.prodobj.uuid);
                if(finditeminlist > -1){
                    newProdList[finditeminlist].isDelete = true;
                }
            }

            if(searchobj.sortBy.groupOrder === "first"){
                newProdList.unshift(newgroupitem);
            } else{
                newProdList.push(newgroupitem);
            }
            
            this.setState({ newProdList: newProdList, isShowGrouping: false, newGroupList: [] }, () => {
                let prodlistscroll = document.getElementById("newprodlist-scroll");
                if(searchobj.sortBy.groupOrder === "first"){
                    prodlistscroll.scrollTop = 20;
                } else{
                    prodlistscroll.scrollTop = (prodlistscroll.scrollHeight - 50);
                }
                
                this.autoSaveChanges(true);
                // this.toggleGroupingMode();
            });
        } else{
            alertService.warn(this.props.t("SELECT_MORETHAN_ONEPRODS"));
        }
    }

    resetMetaData = (prodobj) => {
        prodobj.isChecked = false;
        prodobj.strategy = {
            option: "replace",
            level: "brand",
            replaceProductList: [],
            minFaceLimit: 30,
        };
        prodobj.selectionOption = "none";
        prodobj.facing = {
            method: "num",
            value: 0
        };
        prodobj.testPeriod = 0;
        prodobj.isInOutProduct = false;
        prodobj.vmpVerList = [];

        return prodobj;
    }

    //remove new added group
    handleSeparateGroup = (groupidx) => {
        confirmAlert({
            title: this.props.t('REMOVE_PRODGROUP'),
            message: (this.props.t('ARE_YOU_SURE_TO_CONTINUE_REMOVEGROUP')),
            overlayClassName: (this.props.isRTL === "rtl" ? "alertrtl-content" : ""),
            buttons: [{
                label: this.props.t('btnnames.yes'),
                onClick: () => {   
                    this.continueRemoveGroup(groupidx);
                }
            }, {
                label: this.props.t('btnnames.no')
            }]
        });
    }

    continueRemoveGroup = (groupidx) => {
        let prodlist = this.state.newProdList;
        let groupobj = prodlist[groupidx];
        for (let i = 0; i < groupobj.products.length; i++) {
            const grouprod = groupobj.products[i];
            // grouprod["newProductMetaId"] = -1;

            /* let findprodidx = this.state.newProdList.findIndex(x => x.uuid === grouprod.parentId);
            if(findprodidx > -1){
                let foudgroupitem = prodlist[findprodidx];
                foudgroupitem.isDelete = false;

                let foundprod = foudgroupitem.products[0];

                foundprod.strategy = grouprod.strategy;
                // foundprod.strategy.option = grouprod.strategy.option;
                // foundprod.strategy.level = grouprod.strategy.level;
                // foundprod.strategy.replaceProductList = grouprod.strategy.replaceProductList;

                foundprod.selectionOption = grouprod.selectionOption;

                foundprod.facing = grouprod.facing;
                // foundprod.facing.method = grouprod.facing.method;
                // foundprod.facing.value = grouprod.facing.value;

                foundprod.testPeriod = grouprod.testPeriod;
                foundprod.isInOutProduct = grouprod.isInOutProduct;
                foundprod.vmpVerList = grouprod.vmpVerList;
            } */

            let newuuid = uuidv4();
            let newgroupitem = { 
                type: "normal", 
                groupId: -1, categoryId: groupobj.categoryId, subCategoryId: groupobj.subCategoryId, 
                brand: groupobj.brand, 
                products: [grouprod], 
                isNew: true,
                uuid: newuuid,
            };

            prodlist.push(newgroupitem);
        }

        prodlist.splice(groupidx, 1);

        this.setState({ newProdList: prodlist }, () => {
            this.autoSaveChanges(true);
        });
    }

    //apply new prod changes
    applyNewProds = (isApply, allnewprods) => {
        if(isApply && this.state.isShowGrouping){
            alertService.error(this.props.t("CLOSE_GROUPVIEW_TOCONTINUE"));
            return false;
        }
        
        // let allnewprods = this.state.newProdList;
        let selectedList = allnewprods.filter(x => ((!isApply && x.isNew) || (isApply && x.isChecked)) && !x.isDelete);
        //validate prod list details
        let validateProdList = this.validateApplyProdList(selectedList, isApply, false);
        if(!validateProdList.iscontinue){
            return false;
        } else{
            selectedList = validateProdList.prodlist;
        }
        

        var CselectedList=JSON.parse(JSON.stringify(selectedList))
        CselectedList.forEach(ele => {
            ele.products.forEach(prod => {
                var havenewmandatoryoptionidx=prod.strategy.replaceProductList.findIndex(x=>x.mandatoryOption===MandatoryOption.newmandatory)
                prod.strategy["isNewMandatory"]=(havenewmandatoryoptionidx>-1)?true:false;
            });
            
        });

        // console.log(JSON.parse(JSON.stringify(CselectedList)));
        if(CselectedList.length > 0){
            this.setState({ 
                selectedSaveProds: CselectedList,
                isSaveApply: isApply,
                isShowStrategyModal: isApply
            }, () => {
                if(!isApply){
                    this.continueApplyModal();
                } else{
                    this.compareStrategyItems();
                }
            });
            
        } else{
            alertService.warn(this.props.t("SELECT_PRODSTO_CONTINUE"));
        }
    }

    validateApplyProdList = (selectedList, isApply, isPreview) => {
        // console.log(selectedList);

        let iscontinue = true;
        for (let i = 0; i < selectedList.length; i++) {
            const proditem = selectedList[i];
            
            for (let j = 0; j < proditem.products.length; j++) {
                const singleprod = proditem.products[j];
                if(isApply ){
                    if(!isPreview){
                        if(singleprod.selectionOption === "none"){
                            alertService.error(this.props.t("SELECT_SELECTOPTION"));
                            iscontinue = false;
                            
                        } /* else if(singleprod.selectionOption === "selected" && singleprod.vmpVerList.length === 0){
                            alertService.error(this.props.t("SELECT_SELECTOPTION"));
                            iscontinue = false;
                        } */
                    }
                    

                    if(singleprod.strategy.option === "minSales"){
                        if(singleprod.strategy.minFaceLimit <= 0){
                            alertService.error(this.props.t("ENTER_VALIDTES_Min_Facing_VALUE"));
                            iscontinue = false;
                        }
                    }
                   
                }
               

                if(!singleprod.strategy){
                    singleprod.strategy = {
                        option: "replace",
                        level: "brand",
                        replaceProductList: [],
                    }
                } else{
                    if(isApply && singleprod.strategy.option === "replace" && singleprod.strategy.replaceProductList.length === 0){
                        alertService.error(this.props.t("SELECT_REPLACE_PRODS"));
                        iscontinue = false;
                    }
                }

                if(!singleprod.facing){
                    singleprod.facing = {
                        method: "num",
                        value: 0
                    }
                }

                if(isApply && (!singleprod.facing || (singleprod.facing && singleprod.facing.value === 0))){
                    /* singleprod.facing = {
                        method: "num",
                        value: 0
                    } */

                    alertService.error(this.props.t("SELECT_FACINGVALUES"));
                    iscontinue = false;
                } 

                if(isApply && (singleprod.testPeriod === "" || singleprod.testPeriod <= 0)){
                    alertService.error(this.props.t("ENTER_VALIDTESTPERIOD_VALUE"));
                    iscontinue = false;
                }   
            }
            
        }

        return { iscontinue: iscontinue, prodlist: selectedList };
    }

    //compare strategy items
    compareStrategyItems = () => {
        let selecteditems = this.state.selectedSaveProds;

        let notSelectedCount = 0;
        for (let i = 0; i < selecteditems.length; i++) {
            const groupitem = selecteditems[i];
            
            if(!groupitem.isDelete){
                if(groupitem.type === "group"){
                    if(groupitem.isChecked && !groupitem.chainOption){
                        notSelectedCount = (notSelectedCount + 1);

                        groupitem.chainOption = "A";
                    }
                } else{
                    for (let j = 0; j < groupitem.products.length; j++) {
                        const prodobj = groupitem.products[j];
                        
                        if(!prodobj.isDelete && prodobj.isChecked && !groupitem.chainOption){
                            notSelectedCount = (notSelectedCount + 1);

                            groupitem.chainOption = "A";
                        }
                    }
                }
            }
        }

        // console.log(selecteditems, notSelectedCount);
        this.setState({ notAvailableStrategy: notSelectedCount });
    }

    //continue apply new prods
    continueApplyModal = () => {
        let isApply = this.state.isSaveApply;

        this.props.toggleLoadingModal(isApply, () => {
            let defsaveobj = this.props.defSaveObj;
            let searchobj = this.state.sobj;

            let sobj = { 
                departmentId: (defsaveobj?defsaveobj.department.department_id:0), 
                appliedNewProducts: this.state.selectedSaveProds,
                isApplied: isApply, 
                isInAppliedSection: searchobj.isInAppliedSection,
                filter: searchobj
            };
            // console.log(sobj);

            this.setState({ isOngoingSave: true }, () => {
                submitSets(submitCollection.applyNewProducts, sobj, true, null, true).then(res => {
                    if(res && res.status){
                        if(isApply){
                            // alertService.success(this.props.t("SUCCESSFULLY_UPDATED"));
                            let obj = res.extra.applyDetatils?res.extra.applyDetatils:[];
                          
                            this.setState({
                                responseObj: obj
                            },()=>{
                                if(this.state.responseObj){
                                    this.setState({
                                        isApplyModel:true
                                    })
                                }
                            });
                            this.props.notificationCount();
                        }
                        
                        let searchobj = this.state.sobj;
                        searchobj.startIndex = 0;

                        this.setState({ sobj: searchobj }, () => {
                            if(isApply){
                                let searchobj = this.state.sobj;
                                searchobj.startIndex = 0;

                                this.setState({ sobj: searchobj, newProdList: [], totalProdCount: 0 }, () => {
                                    this.loadFilterData(true);
                                    this.props.getNewProdCount();

                                    this.props.toggleLoadingModal(false);
                                });
                            } else{
                                if(this.state.isGroupSave){
                                    let saveresponse = (res.extra && res.extra.products.length > 0?res.extra.products:null);
                                    if(saveresponse){
                                        this.setState({ 
                                            newProdList: this.compareLoadedData(saveresponse, true),
                                            totalProdCount: (res.count > 0?res.count:0),
                                        }, () => {
                                            this.props.getNewProdCount();
                                            this.setScrollGapfromTopBottom(this.state.isBottomDataAdd);
                                            this.setPager(this.state.currentPage, saveresponse, this.state.isBottomDataAdd);

                                            this.props.toggleLoadingModal(false);
                                        });
                                    }  
                                } else{
                                    if(this.state.pendingSaveQueque && this.state.pendingSaveQueque.length > 0){
                                        let csaveobj = structuredClone(this.state.newProdList);
                                        this.applyNewProds(false, csaveobj);
                                    }
                                    this.props.toggleLoadingModal(false);
                                }
                            }
                        });
                    } else{
                        // if(isApply){
                            // alertService.error(res.extra && res.extra !== null?res.extra:this.props.t("erroroccurred"));
                            this.props.toggleLoadingModal(false);
                        // }
                    }

                    this.setState({ isOngoingSave: false, isGroupSave: false, pendingSaveQueque: [] });
                });     
            });
        });
    }

    //update single prod change details
    updateSingleProd = (parentidx, childidx, ckey, cvalue, islist, isdisablesave,proditem) => {
        let newprodlist = this.state.newProdList;
        let isUpdateAvailable = false;
        if(ckey === "option" || ckey === "level" || ckey === "replaceProductList" || ckey === "minFaceLimit" ){
            //if(ckey !== "option" || (ckey === "option" && cvalue === "replace")){
                if(childidx > -1){
                    let newstretgy = newprodlist[parentidx].products[childidx].strategy;

                    if(newstretgy){
                        newstretgy[ckey] = cvalue;
                    } else{
                        newstretgy = { option: "replace", level: "brand", minFaceLimit: 1, replaceProductList: [] };
                        newstretgy[ckey] = cvalue;
                    }

                    if(ckey === "option"){
                        newstretgy = { option: "replace", level: "brand", minFaceLimit: 1, replaceProductList: [] };
                        newstretgy[ckey] = cvalue;
                    }

                    newprodlist[parentidx].products[childidx].strategy = newstretgy;
                    isUpdateAvailable = true;
                } else{
                    let newstretgy = newprodlist[parentidx].strategy;
                    
                    if(newstretgy){
                        newstretgy[ckey] = cvalue;
                    } else{
                        newstretgy = { option: "replace", level: "brand", minFaceLimit: 30, replaceProductList: [] };
                        newstretgy[ckey] = cvalue;
                    }

                    if(ckey === "option"){
                        newstretgy = { option: "replace", level: "brand", minFaceLimit: 30, replaceProductList: [] };
                        newstretgy[ckey] = cvalue;
                    }

                    newprodlist[parentidx].strategy = newstretgy;
                    isUpdateAvailable = true;
                }
            //}
        } else if(ckey === "method" || ckey === "value" ){
            if(childidx > -1){
                let ctxtvalue = parseFloat(cvalue);
                let cfacingvalue = newprodlist[parentidx].products[childidx].facing;

                let newvalue = cvalue;
                if(ckey === "value"){
                    // newvalue = (cfacingvalue?cfacingvalue.value:0);

                    if(cfacingvalue && cfacingvalue.method === "perc" && cvalue !== "" && (ctxtvalue < 0 || ctxtvalue > 100)){
                        return false;
                    } else if(cvalue !== "" && !isNaN(ctxtvalue)){
                        // newvalue = (cvalue !== "" && !isNaN(ctxtvalue)?parseFloat(cvalue):cvalue);
                    }
                    
                    if(!cfacingvalue){
                        cfacingvalue = {method: "num", value: 0};
                    }

                } else{
                    if(!cfacingvalue){
                        cfacingvalue = {method: "num", value: 0};
                    } else{
                        cfacingvalue["value"] = 0;
                    }
                }
                cfacingvalue[ckey] = newvalue;

                newprodlist[parentidx].products[childidx].facing = cfacingvalue;

            } else{
                let ctxtvalue = parseFloat(cvalue);
                let cfacingvalue = newprodlist[parentidx].facing;
                
                let newvalue = cvalue;
                if(ckey === "value"){
                    // newvalue = (cfacingvalue?cfacingvalue.value:0);
                    
                    if(cfacingvalue.method === "perc" && cvalue !== "" && (ctxtvalue < 0 || ctxtvalue > 100)){
                        return false;
                    } else if(cvalue !== "" && !isNaN(ctxtvalue)){
                        // newvalue = (cvalue !== "" && !isNaN(ctxtvalue)?parseFloat(cvalue):cvalue);
                    }

                    if(!cfacingvalue){
                        cfacingvalue = {method: "num", value: 0};
                    }
                    
                } else{
                    if(!cfacingvalue){
                        cfacingvalue = {method: "num", value: 0};
                    } else{
                        cfacingvalue["value"] = 0;
                    }
                }
                cfacingvalue[ckey] = newvalue;

                newprodlist[parentidx].facing = cfacingvalue;
            }
            isUpdateAvailable = true;

        } else if(ckey === "vmpVerList"){
            let updateselectoption1 = newprodlist[parentidx];
            if(childidx > -1){
                if(islist){
                    newprodlist[parentidx].products[childidx][ckey] = cvalue;
                    newprodlist[parentidx].products[childidx]["selectionOption"] = (cvalue && cvalue.length > 0?"selected":"none");

                } else{
                    let cverlist = newprodlist[parentidx].products[childidx][ckey];
                    let isalreadyadded = cverlist.findIndex(x => x === cvalue);
                    // console.log(isalreadyadded, cvalue);
                    if(isalreadyadded > -1){
                        cverlist.splice(isalreadyadded, 1);
                    } else{
                        cverlist.push(cvalue);
                    }   
                    
                    newprodlist[parentidx].products[childidx]["selectionOption"] = (cverlist && cverlist.length > 0?"selected":"none");
                }

                //validate select all auto update when manual clicks
                if(proditem){
                    let usedlist=this.props.allVersionsList.filter(x=>x.type==="used")
                    let unusedlist=this.props.allVersionsList.filter(x=>x.type==="unused")
            
                    let newusedlist=[]
                    let newunusedlist=[]
                    for (let i = 0; i < proditem.vmpVerList.length; i++) {
                        const vid = proditem.vmpVerList[i];
                        var haveinused=usedlist.find(x=>x.mpId===vid)
                        if(haveinused){
                            newusedlist.push(haveinused)
                        }else{
                            var haveinunused=unusedlist.find(x=>x.mpId===vid)
                            if(haveinunused){
                                newunusedlist.push(haveinunused)
                            }
                        }
                    }
            
                    if(newunusedlist.length===0){
                        //unused list all remove, all tick remove
                        updateselectoption1.products[childidx]["isUnusedChecked"] = false;
                    }else if(newunusedlist.length===unusedlist.length){
                        updateselectoption1.products[childidx]["isUnusedChecked"] = true;
                    }else{
                        updateselectoption1.products[childidx]["isUnusedChecked"] = false;
                    }
                    
                    if(newusedlist.length===0){
                        //used list all remove, all tick remove
                        updateselectoption1.products[childidx]["isUsedChecked"] = false;
                    }else  if(newusedlist.length===usedlist.length){
                        updateselectoption1.products[childidx]["isUsedChecked"] = true;
                    }else{
                        updateselectoption1.products[childidx]["isUsedChecked"] = false;
                    }
                }

                updateselectoption1.products[childidx].strategy.replaceProductList = [];

            } else{
                if(islist){
                    newprodlist[parentidx][ckey] = cvalue;
                    newprodlist[parentidx]["selectionOption"] = (cvalue && cvalue.length > 0?"selected":"none");

                } else{
                    let cverlist = newprodlist[parentidx][ckey];
                    let isalreadyadded = cverlist.findIndex(x => x === cvalue);
                    
                    if(isalreadyadded > -1){
                        cverlist.splice(isalreadyadded, 1);
                    } else{
                        cverlist.push(cvalue);
                    } 
                    
                    newprodlist[parentidx]["selectionOption"] = (cverlist && cverlist.length > 0?"selected":"none");
                }

                //validate select all auto update when manual clicks
                if(proditem){
                    let usedlist=this.props.allVersionsList.filter(x=>x.type==="used")
                    let unusedlist=this.props.allVersionsList.filter(x=>x.type==="unused")
            
                    let newusedlist=[]
                    let newunusedlist=[]
                    for (let i = 0; i < proditem.vmpVerList.length; i++) {
                        const vid = proditem.vmpVerList[i];
                        var haveinusedgroup=usedlist.find(x=>x.mpId===vid)
                        if(haveinusedgroup){
                            newusedlist.push(haveinusedgroup)
                        }else{
                            var haveinunusedgroup=unusedlist.find(x=>x.mpId===vid)
                            if(haveinunusedgroup){
                                newunusedlist.push(haveinunusedgroup)
                            }
                        }
                    }
            
                    if(newunusedlist.length===0){
                        //unused list all remove, all tick remove
                        updateselectoption1["isUnusedChecked"] = false;
                    }else if(newunusedlist.length===unusedlist.length){
                        updateselectoption1["isUnusedChecked"] = true;
                    }else{
                        updateselectoption1["isUnusedChecked"] = false;
                    }

                    if(newusedlist.length===0){
                        //used list all remove, all tick remove
                        updateselectoption1["isUsedChecked"] = false;
                    }else  if(newusedlist.length===usedlist.length){
                        updateselectoption1["isUsedChecked"] = true;
                    }else{
                        updateselectoption1["isUsedChecked"] = false;
                    }
                    
                }

                updateselectoption1.strategy.replaceProductList = [];
            }
            
            isUpdateAvailable = true;
            
        } else{
            let updateselectoption = newprodlist[parentidx];
            if(childidx > -1){
                updateselectoption = newprodlist[parentidx].products[childidx];
            }
            
            if(ckey === "selectionOption"){
                let allverlist = this.props.allVersionsList;

                if(cvalue === "all"){
                    let allverids = [];
                    for (let i = 0; i < allverlist.length; i++) {
                        allverids.push(allverlist[i].mpId);
                    }
                    
                    updateselectoption["vmpVerList"] = allverids;
                    
                } else if(cvalue === "used"){
                    let usedverids = [];
                    for (let i = 0; i < allverlist.length; i++) {
                        if(allverlist[i].type === "used"){
                            usedverids.push(allverlist[i].mpId);
                        }
                        
                    }

                    updateselectoption["vmpVerList"] = usedverids;

                } else if(cvalue === "selected" && updateselectoption.selectionOption !== cvalue){
                    updateselectoption["vmpVerList"] = [];
                    
                } else{ //if none
                    updateselectoption["vmpVerList"] = [];
                    updateselectoption["isUsedChecked"] = false;
                    updateselectoption["isUnusedChecked"] = false;
                }

                updateselectoption.strategy.replaceProductList = [];

                // console.log(updateselectoption);
            }

            if(ckey === "isUsedChecked" || ckey === "isUnusedChecked"){
                updateselectoption.strategy.replaceProductList = [];
            }

            if(childidx > -1){
                newprodlist[parentidx].products[childidx][ckey] = cvalue;
            } else{
                newprodlist[parentidx][ckey] = cvalue;
            }
            isUpdateAvailable = true;
        }

        if(isUpdateAvailable){
            newprodlist[parentidx]["isNew"] = true;
        }
        
        //if group item changing changing child prods as well
        if(ckey === "type" || (ckey !== "type" && childidx === -1)){
            let parentobj = newprodlist[parentidx];
            
            if(ckey === "type"){
                for (let i = 0; i < parentobj.products.length; i++) {
                    const prodobj = parentobj.products[i];
                    prodobj.strategy.replaceProductList = [];
                }

            } else if(parentobj.type === "group"){
                for (let i = 0; i < parentobj.products.length; i++) {
                    const prodobj = parentobj.products[i];

                    if(parentobj.strategy && Object.keys(parentobj.strategy).length > 0){
                        prodobj.strategy.option = parentobj.strategy.option;
                        prodobj.strategy.level = parentobj.strategy.level;
                        prodobj.strategy.replaceProductList = parentobj.strategy.replaceProductList;
                        prodobj.strategy.minFaceLimit = parentobj.strategy.minFaceLimit;
                        // prodobj.strategy.minFacingMethod = parentobj.strategy.minFacingMethod;
                    } else{
                        prodobj.strategy = { option: "replace", level: "brand", replaceProductList: [], minFaceLimit: 0 };
                    }

                    prodobj.selectionOption = parentobj.selectionOption;

                    if(prodobj.facing && Object.keys(prodobj.facing).length > 0){
                        prodobj.facing.method = parentobj.facing.method;
                        prodobj.facing.value = parentobj.facing.value;
                    } else{
                        prodobj.facing = { method: "num", value: 0 };
                    }

                    prodobj.testPeriod = parentobj.testPeriod;
                    prodobj.isInOutProduct = parentobj.isInOutProduct;
                    prodobj.vmpVerList = parentobj.vmpVerList;
                    
                }
            }
        }

        // console.log(newprodlist);
        
        let comparedProdList = newprodlist;
        //compare if types changing
        if(ckey === "type"){
            comparedProdList = this.compareLoadedData(newprodlist);
        }
        this.setState({ newProdList: comparedProdList }, () => {
            if(!isdisablesave){
                let curchangeitem = this.state.newProdList.find(x => x.isNew && !x.isDelete);
                // console.log(curchangeitem);
                let findwhichpage = -1;
                for (let i = 0; i < this.state.loadedPages.length; i++) {
                    const pageitem = this.state.loadedPages[i];
                    let finditeminlist = pageitem.items.findIndex(z => z.uuid === curchangeitem.uuid);

                    if(finditeminlist > -1){
                        findwhichpage = ((pageitem.page - 1) > 0?(pageitem.page - 1):1);
                    }
                }
                if(findwhichpage > 0){
                    let searchobj = this.state.sobj;
                    searchobj.startIndex = (findwhichpage > 1?((findwhichpage - 1) * searchobj.maxResult):0);

                    this.setState({ sobj: searchobj, currentPage: findwhichpage }, () => {
                        if(ckey === "minFaceLimit" ||ckey === "testPeriod" ){
                            if(cvalue === ""){
                                return
                            }
                        }
                        if(ckey === "value"){
                            if(this._facingTimeout){
                                clearTimeout(this._facingTimeout); 
                            }
                    
                            this._facingTimeout = setTimeout(() => {
                                this.autoSaveChanges();
                            }, 1000);
                        } else{
                            this.autoSaveChanges();
                        }
                    });
                } else{
                    this.autoSaveChanges();
                }
            }
        });
    }

    handleChangeTxt = (evt, isonblur, prodidx, isfacingvalue, ckey) => {
        if(!isonblur && evt.which){
            let newprodlist = this.state.newProdList;
            let facingmethod = (newprodlist[prodidx].facing && newprodlist[prodidx].facing.method?newprodlist[prodidx].facing.method:"num");
            let methodvalidation = (facingmethod === "perc"?evt.which !== 110 && evt.which !== 190:true);
            
            if(!(evt.ctrlKey && evt.which === 65) && evt.which !== 8 && methodvalidation && (evt.which < 37 || evt.which > 40) && (evt.which < 48 || evt.which > 57) && (evt.which < 96 || evt.which > 105)){
                evt.preventDefault();
            }
        }
        
        if(isonblur){
            if(isfacingvalue){
                // let evtxt = (evt.target.value !== ""?parseFloat(evt.target.value):0);
                if(evt.target.value&& preventNumberInput(evt.target.value,this.props.t('validation.NumberInputValidation'))){
                    evt.preventDefault();
                    return false;
                }
                let evtxt = evt.target.value;
                this.updateSingleProd(prodidx, -1, "value", evtxt);
            } else{
                let temp = JSON.parse(JSON.stringify(this.state.newProdList))
                // let evtxt = (evt.target.innerText !== ""?parseFloat(evt.target.innerText):0);
                let evtxt = (ckey === "minFaceLimit"?evt.target.value:evt.target.value !== ""?evt.target.value:"");
                // console.log(ckey)
                if(ckey === "minFaceLimit" ){

                    if(evtxt === ""){
                        alertService.error(this.props.t("ENTER_VALIDTES_Min_Facing_VALUE"));
                        evtxt = ""
                    }else{
                        if(parseInt(evtxt) <= 0 ){
                            alertService.error(this.props.t("ENTER_VALIDTES_Min_Facing_VALUE"));
                            return false;
                        }
                        if(evt.target.value && preventNumberInput(evt.target.value ,(this.props.t('validation.NumberInputValidation')))){
                            evtxt = temp.strategy.minFaceLimit
                        }
                    }
                    
                }else{
                    if(evt.target.value&& preventNumberInput(evt.target.value,this.props.t('validation.NumberInputValidation'))){
                        evt.preventDefault();
                        return false
                    }
                }
                this.updateSingleProd(prodidx, -1, (ckey === "minFaceLimit"?"minFaceLimit":"testPeriod"), evtxt);
                // this.updateSingleProd(prodidx, -1, "minFaceLimit", evtxt);
            }
        }
    }

    replaceProdUpdate = (isNew, prodObj, prodIdx, replaceidx,mandatoryOption) => {
        let replaceprodlist = (this.state.newProdList[prodIdx].strategy?JSON.parse(JSON.stringify(this.state.newProdList[prodIdx].strategy.replaceProductList)):[]);
        if(isNew){
            let isalreadyadded = replaceprodlist.findIndex(x => x.productId === prodObj.productId);
            
            if(isalreadyadded === -1){
                let newprodobj = prodObj;
                newprodobj["imgUrl"] = newprodobj.imageUrl;
                newprodobj["mandatoryOption"] = mandatoryOption?mandatoryOption:"none"
                replaceprodlist.push(newprodobj);
                this.updateSingleProd(prodIdx, -1, "replaceProductList", replaceprodlist);
            } else{
                alertService.error(this.props.t("already_added"));
            }
        } else{
            replaceprodlist.splice(replaceidx, 1);

            this.updateSingleProd(prodIdx, -1, "replaceProductList", replaceprodlist);
        }
    }

    loadMoreProds = (isBottom) => {
        let searchobj = JSON.parse(JSON.stringify(this.state.sobj));
        
        let curpage = JSON.parse(JSON.stringify(this.state.currentPage));
        let loadedpages = this.state.loadedPages;
        let isContinue = false;
        let isbottomadd = true;
        if(isBottom){
            curpage = (loadedpages.length > 0?(loadedpages[(loadedpages.length - 1)].page + 1):1);
            isContinue = true;

            searchobj.startIndex = (((curpage - 1) > 0?(curpage - 1):0) * searchobj.maxResult);

            // console.log("bottom", curpage);
        } else{
            curpage = (loadedpages.length > 0?(loadedpages[0].page - 1):1);

            let findAlreadyLoaded = this.state.loadedPages.findIndex(x => x.page === curpage);
            // console.log("top", curpage, findAlreadyLoaded);
            
            if(curpage > 0 && findAlreadyLoaded === -1){
                isContinue = true;
                isbottomadd = false;

                searchobj.startIndex = (((curpage - 1) > 0?(curpage - 1):0) * searchobj.maxResult);
            }
        }

        if(isContinue){
            this.setState({ sobj: searchobj, currentPage: curpage, isBottomDataAdd: isbottomadd }, () => {
                this.loadFilterData(false, true);
            });    
        }
    }

    mutipleVerSelect = (isused, parentidx, childidx) => {
        let allVersionsList = this.props.allVersionsList;

        let selproditem = this.state.newProdList[parentidx];
        let curverlist = selproditem.vmpVerList;

        if(isused){
            let isUsedChecked = (selproditem.isUsedChecked?selproditem.isUsedChecked:false);
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

            this.updateSingleProd(parentidx, childidx, "isUsedChecked", !isUsedChecked, null, true);
        } else{
            let isUnusedChecked = (selproditem.isUnusedChecked?selproditem.isUnusedChecked:false);
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

            this.updateSingleProd(parentidx, childidx, "isUnusedChecked", !isUnusedChecked, null, true);
        }
        
        // this.updateSingleProd(parentidx, childidx, "selectionOption", (curverlist && curverlist.length > 0?true:false));
        this.updateSingleProd(parentidx, childidx, "vmpVerList", curverlist, true);
    }

    //auto save changes
    autoSaveChanges = (isgroupsave) => {
        let csaveobj = JSON.parse(JSON.stringify(this.state.newProdList));
        let pendingqueque = [csaveobj];
        
        if(!isgroupsave && this.state.isOngoingSave){
            this.setState({ pendingSaveQueque: pendingqueque });
        } else{
            this.setState({ pendingSaveQueque: [], isGroupSave: (isgroupsave?true:false) }, () => {
                this.applyNewProds(false, csaveobj);
            });
        }
    }

    //cancel prod item
    handleCancelProd = (selproditem) => {
        this.setState({
            cancelProds: [selproditem],
            isShowCancelModal: true,
        });
    }

    //toggle cancel modal
    toggleCancelModal = (showtype) => {
        this.setState({ isShowCancelModal: showtype });
    }

    //continue cancel option
    continueCancelOption = (calceltype) => {
        let cancelmsg = (calceltype === "old"?"SURETO_CANCEL_OLD":"SURETO_CANCEL_NEWPENDING");

        confirmAlert({
            title: this.props.t('CANCEL_PRODSTATE'),
            message: (this.props.t(cancelmsg)),
            overlayClassName: (this.props.isRTL === "rtl" ? "alertrtl-content" : ""),
            buttons: [{
                label: this.props.t('btnnames.yes'),
                onClick: () => {   
                    let cancelprodids = [];
                    let cancelprodlist = [];
                    for (let i = 0; i < this.state.cancelProds.length; i++) {
                        cancelprodids.push(this.state.cancelProds[i].productInfo.productId);
                        cancelprodlist.push(this.state.cancelProds[i]);
                    }

                    let sobj = {
                        cancellationOption: calceltype,
                        productIds: cancelprodids,
                        products: cancelprodlist
                    }

                    // this.setState({ isProdCanceling: true }, () => {
                        this.props.toggleLoadingModal(true, () => {
                        submitSets(submitCollection.cancelNewProduct, sobj, false, null, true).then(res => {
                            if(res && res.status){
                                alertService.success(this.props.t("SUCCESSFULLY_CANCELLED"));
                                
                                let searchobj = this.state.sobj;
                                searchobj.startIndex = 0;

                                this.setState({ 
                                    sobj: searchobj, newProdList: [], totalProdCount: 0,
                                    loadedPages: [], totalPages: 0, currentPage: 1, pagerDetails: null, isBottomDataAdd: true, 
                                }, () => {
                                    this.loadFilterData(true);
                                    this.props.getNewProdCount();
                                    this.toggleCancelModal();
                                    this.props.notificationCount();
                                });
                            } else{
                                // alertService.error(res.extra && res.extra !== null?res.extra:this.props.t("erroroccurred"));
                                this.toggleCancelModal();
                            }
                            this.props.toggleLoadingModal(false)
                            // this.setState({ isProdCanceling: false });
                        });     
                    });       
                }
            }, {
                label: this.props.t('btnnames.no')
            }]
        });
    }

    getScrollPosition = (e) => {
        if(this.state.totalProdCount > 0 && this.state.isDataLoading === false){ //this.state.isShowGrouping === false && 
            var top = document.getElementById("newprodlist-scroll").scrollTop;
            var sheight = document.getElementById("newprodlist-scroll").scrollHeight;
            var position = (sheight - top);
            var clientHeight = e.target.clientHeight;
            position = Math.trunc((position - 1));
            
            //if bottom
            if(this.state.totalProdCount > this.state.newProdList.length && position <= clientHeight){
                this.loadMoreProds(true);
            } else if(top === 0){
                this.loadMoreProds(false);
            }
        }
    }

    /* groupColCalc = (groupobj) => {
        let searchobj = this.state.sobj;
        if(searchobj.maxColumnCount){
            console.log(parseInt(searchobj.maxColumnCount / 2));
        }

        return 6;
    } */

    toggleGroupAccordian = (gidx) => {
        let cgrouplist = this.state.newGroupList;
        cgrouplist[gidx]["isAccordianOpen"] = (cgrouplist[gidx].isAccordianOpen?false:true);

        this.setState({ newGroupList: cgrouplist });
    }

    setclickedcarddetails=(isNew, prodObj, prodIdx, replaceidx)=>{
        var obj={
            isNew:isNew,
            prodObj:prodObj,prodIdx:prodIdx,replaceidx:replaceidx
        }
        this.setState({selectedcard:obj})
    }

    toggleSimPreviewView = (storetype, storeidx, tagidx, fieldidx, mpid, snpshotId, dataobj,mpversionname, mpFromDate, mpToDate) => {
        let selectedList = this.state.newProdList.filter(x => x.isChecked && !x.isDelete);
        //console.log(selectedList);

        let validateProdList = this.validateApplyProdList(selectedList, true, false);
        if(!validateProdList.iscontinue){
            return false;
        } else{
            selectedList = validateProdList.prodlist;
        }

        if(selectedList && selectedList.length > 0){
            this.props.toggleSimPreviewView(false, storetype, storeidx, tagidx, fieldidx, selectedList, mpid, snpshotId, dataobj,mpversionname, mpFromDate, mpToDate);
        } else{
            alertService.warn(this.props.t("SELECT_PRODSTO_CONTINUE"));
        }
    }

    //toggle strategy apply modal
    toggleStrategyApplyModal = () => {
        this.setState({ isShowStrategyModal: !this.state.isShowStrategyModal });
    }

    //apply strategy for all items
    chainOptionToAll = (type) => {
        //console.log(type); 

        if(type !== "NONE"){
            let selecteditems = this.state.selectedSaveProds;

            for (let i = 0; i < selecteditems.length; i++) {
                const groupitem = selecteditems[i];
                
                if(!groupitem.isDelete && groupitem.isChecked){
                    if(groupitem.type === "group"){
                        groupitem.chainOption = type;
                    } else{
                        for (let j = 0; j < groupitem.products.length; j++) {
                            const prodobj = groupitem.products[j];
                            
                            if(!prodobj.isDelete){
                                prodobj.chainOption = type;
                            }
                        }
                    }
                }
            }

            //console.log(selecteditems);
            this.setState({ selectedSaveProds: selecteditems });
        }
    }

    //update single item strategy
    handleChangeStrategy = (isparent, groupidx, prodidx, type) => {
        //console.log(isparent, groupidx, prodidx, type);

        let selecteditems = this.state.selectedSaveProds;

        if(isparent){
            selecteditems[groupidx].chainOption = type;
        } else{
            selecteditems[groupidx].products[prodidx].chainOption = type;
        }

        this.setState({ selectedSaveProds: selecteditems });
    }

    //continue save new prod strategy
    continueNewProdApply = () => {
        //console.log(this.state.selectedSaveProds);
        this.setState({ isShowStrategyModal: false }, () => {
            this.continueApplyModal();
        });
    }
    
    handleApplyModel = ()=>{
        this.setState({
            isApplyModel:false,
            responseObj:[]
        })
    }

    //toggle strategy help modal
    toggleStrategyHelpDrop = (isshow) => {
        this.setState({ isShowStrategyHelp: isshow });
    }

    handleKeyDown = (event) => {
        if(!(/[0-9/]/.test(event.key) || parseInt(event.keyCode) === 8  || parseInt(event.keyCode) === 37 || parseInt(event.keyCode) === 39)){
            event.preventDefault();
        }
    }
    handleFocusChange=(datepicker,value)=>{
        if(datepicker === 'isDatePicker1Focused'){
            this.setState({
                isDatePicker1Focused:value
            })
        } else if (datepicker === 'isDatePicker2Focused'){
            this.setState({
                isDatePicker2Focused:value
            })
        }
    }
    testperiodfocusout=(idx,gidx,isgroup)=>{
        let cnewProdList = this.state.newProdList;
        if(isgroup){
            if(cnewProdList[idx].testPeriod===""){
                this.updateSingleProd(idx, -1, "testPeriod", 0)
            }
        }else{
            var prod=cnewProdList[idx].products[gidx]
            if(prod.testPeriod===""){
                this.updateSingleProd(idx, gidx, "testPeriod", 0)
            }
        }
    }
    render() {
        let isDisabledChange = (this.state.sobj.isInAppliedSection === true);
        let { allSubCatsList, isOngoingSave, sobj } = this.state;
        let { allCatList, allBrandsList } = this.props;

        let availUsedVersions = this.props.allVersionsList.filter(veritem => veritem.type === "used");
        let isUsedDisabled = (availUsedVersions.length === 0?true:false);

        return (<>
            {/* {this.props.newProdsCount > 0? */}
            <Col xs={(sobj && !sobj.isInAppliedSection)?10:12} className={'aui-newprod-content'+(sobj && !sobj.isInAppliedSection?" sidebar-space":"")}> {/*  */}
                {(this.state.isGroupSave && this.state.isOngoingSave)?<Col className='ongoingsave-disable-overlay'></Col>:<></>}

                <Col className="custom-filters prod-search-list form-inline">
                    <span className='input-wrapper'>
                        <label className="filter-label">{this.props.t('FREE_SEARCH')}</label>
                        <FeatherIcon icon="search" size={18} />
                        <Form.Control placeholder={this.props.t('SEARCH_PROD_PLACEHOLDER')} value={this.state.sobj.searchBy} onChange={e => this.handleFilterObject(e.target.value, "searchBy", "change",this.props.t('Character.search_text'),e)} onKeyDown={e => (e.which ===13? this.handleFilterObject(e.target.value, "searchBy", "enter"):preventinputToString(e,e.target.value,(this.props.t('Character.search_text'))))} />
                    </span>

                    <label className="filter-label">{this.props.t("FILTER_BY")}</label>

                    {/* <ButtonGroup className='aui-per-toggle sorttype-toggle'>
                        <Button size='sm' active={this.state.sobj.isSort} onClick={() => this.handleFilterObject(true,"isSort","click")}>{this.props.t('SORT_BY')}</Button>
                        <Button size='sm' active={!this.state.sobj.isSort} onClick={() => this.handleFilterObject(false,"isSort","click")}>{this.props.t('FILTER_BY')}</Button>
                    </ButtonGroup> */}

                    <Select placeholder={this.props.t("any_category")} options={allCatList} 
                        onChange={(e) => this.handleFilterObject(e.value,"categoryId","click")} 
                        value={allCatList.filter(option => option.value === (this.state.sobj.filterBy.categoryId?this.state.sobj.filterBy.categoryId:null))} 
                        className="auinewprod-searchselect" size="sm" classNamePrefix="searchselect-inner" maxMenuHeight={180}    
                        />

                    <Select placeholder={this.props.t("any_subcategory")} options={allSubCatsList} 
                        onChange={(e) => this.handleFilterObject(e.value,"subcategoryId","click")} 
                        value={allSubCatsList.filter(option => option.value === (this.state.sobj.filterBy.subcategoryId?this.state.sobj.filterBy.subcategoryId:null))} 
                        className="auinewprod-searchselect" size="sm" classNamePrefix="searchselect-inner" maxMenuHeight={180}    
                        />

                    <Select placeholder={this.props.t("any_brand")} options={allBrandsList} 
                        onChange={(e) => this.handleFilterObject(e.value,"brandId","click")} 
                        value={allBrandsList.filter(option => option.value === this.state.sobj.filterBy.brandId)} 
                        className="auinewprod-searchselect" size="sm" classNamePrefix="searchselect-inner" maxMenuHeight={180}    
                        />

                    <span className='input-wrapper'>
                        <FeatherIcon icon="calendar" size={18} />
                        <DatePicker dateFormat="dd/MM/yyyy" placeholderText={this.state.isDatePicker1Focused === true?'(DD/MM/YYYY)':this.props.t("CATELOGUE_FILTERS.from")} popperPlacement="bottom-start" showYearDropdown
                            className="datepicker-txt" selected={(this.state.sobj.filterBy && this.state.sobj.filterBy.creationFromDate?new Date(this.state.sobj.filterBy.creationFromDate):null)}
                            onChange={(e)=>this.handleFilterObject(e, "creationFromDate", "change")}
                            onKeyDown={this.handleKeyDown}
                            onFocus={() => this.handleFocusChange('isDatePicker1Focused',true)}
                            onBlur={() => this.handleFocusChange('isDatePicker1Focused',false)}
                            />    
                    </span>
                    <span className='input-wrapper'>
                        <FeatherIcon icon="calendar" size={18} />
                        <DatePicker dateFormat="dd/MM/yyyy" placeholderText={this.state.isDatePicker2Focused === true?'(DD/MM/YYYY)':this.props.t("CATELOGUE_FILTERS.todate")} popperPlacement="bottom-start" showYearDropdown
                            className="datepicker-txt" selected={(this.state.sobj.filterBy && this.state.sobj.filterBy.creationToDate?new Date(this.state.sobj.filterBy.creationToDate):null)}
                            onChange={(e)=>this.handleFilterObject(e, "creationToDate", "change")}
                            onKeyDown={this.handleKeyDown}
                            onFocus={() => this.handleFocusChange('isDatePicker2Focused',true)}
                            onBlur={() => this.handleFocusChange('isDatePicker2Focused',false)}
                            />    
                    </span>
                    <span className='input-wrapper switch-wrapper applied-check'>
                        <label className='switchtxt' style={{color:(this.props.dmode?'#2CC990':'#4F4F4F')}}>{this.props.t('IS_APPLIED')}
                        <Switch onChange={() => this.handleFilterObject(!this.state.sobj.isInAppliedSection, "isInAppliedSection", "click")} checked={this.state.sobj.isInAppliedSection} height={17} width={30} uncheckedIcon={true} checkedIcon={true}
                        handleDiameter={12} activeBoxShadow={"none"} className={"Scycleswitch"+(this.state.sobj.isInAppliedSection?" checked":"")} onColor={"#f2f1ff"} offColor={"#f2f1ff"} offHandleColor={"#C2BFBF"} onHandleColor={this.props.dmode?"#2CC990":"#5128A0"} />
                        </label>
                    </span>

                    <Col className='sortitem-list'>
                        <label className="filter-label">{this.props.t("SORT_BY")}</label>

                        <span className='input-wrapper switch-wrapper'>
                            <label className='switchtxt' style={{color:(this.props.dmode?'#2CC990':'#4F4F4F')}}>{this.props.t('category')}
                            <Switch onChange={() => this.handleFilterObject(!this.state.sobj.sortBy.category, "category", "enter")} checked={this.state.sobj.sortBy.category} height={17} width={30} uncheckedIcon={true} checkedIcon={true}
                            handleDiameter={12} activeBoxShadow={"none"} className={"Scycleswitch"+(this.state.sobj.sortBy.category?" checked":"")} onColor={"#f2f1ff"} offColor={"#f2f1ff"} offHandleColor={"#C2BFBF"} onHandleColor={this.props.dmode?"#2CC990":"#5128A0"} />
                            </label>
                        </span>

                        <span className='input-wrapper switch-wrapper'>
                            <label className='switchtxt' style={{color:(this.props.dmode?'#2CC990':'#4F4F4F')}}>{this.props.t('subcategory')}
                            <Switch onChange={() => this.handleFilterObject(!this.state.sobj.sortBy.subCategory, "subCategory", "enter")} checked={this.state.sobj.sortBy.subCategory} height={17} width={30} uncheckedIcon={true} checkedIcon={true}
                            handleDiameter={12} activeBoxShadow={"none"} className={"Scycleswitch"+(this.state.sobj.sortBy.subCategory?" checked":"")} onColor={"#f2f1ff"} offColor={"#f2f1ff"} offHandleColor={"#C2BFBF"} onHandleColor={this.props.dmode?"#2CC990":"#5128A0"} />
                            </label>
                        </span>

                        <span className='input-wrapper switch-wrapper'>
                            <label className='switchtxt' style={{color:(this.props.dmode?'#2CC990':'#4F4F4F')}}>{this.props.t('brand')}
                            <Switch onChange={() => this.handleFilterObject(!this.state.sobj.sortBy.brand, "brand", "enter")} checked={this.state.sobj.sortBy.brand} height={17} width={30} uncheckedIcon={true} checkedIcon={true}
                            handleDiameter={12} activeBoxShadow={"none"} className={"Scycleswitch"+(this.state.sobj.sortBy.brand?" checked":"")} onColor={"#f2f1ff"} offColor={"#f2f1ff"} offHandleColor={"#C2BFBF"} onHandleColor={this.props.dmode?"#2CC990":"#5128A0"} />
                            </label>
                        </span>

                        <span className='input-wrapper switch-wrapper'>
                            <label className='switchtxt' style={{color:(this.props.dmode?'#2CC990':'#4F4F4F')}}>{this.props.t('CREATED_DATE')}
                            <Switch onChange={() => this.handleFilterObject(!this.state.sobj.sortBy.creationDate, "creationDate", "enter")} checked={this.state.sobj.sortBy.creationDate} height={17} width={30} uncheckedIcon={true} checkedIcon={true}
                            handleDiameter={12} activeBoxShadow={"none"} className={"Scycleswitch"+(this.state.sobj.sortBy.creationDate?" checked":"")} onColor={"#f2f1ff"} offColor={"#f2f1ff"} offHandleColor={"#C2BFBF"} onHandleColor={this.props.dmode?"#2CC990":"#5128A0"} />
                            </label>
                        </span>

                        <ButtonGroup className='aui-per-toggle sortasc-view' title=''>
                            <Button size='sm' onClick={()=>this.handleFilterObject("ASC", "orderType", "click")} active={this.state.sobj.sortBy.orderType === "ASC"} disabled={this.state.sobj.sortBy.orderType === "NONE"}><SortASCIcon size={16} /></Button>
                            <Button size='sm' onClick={()=>this.handleFilterObject("DESC", "orderType", "click")} active={this.state.sobj.sortBy.orderType === "DESC"} disabled={this.state.sobj.sortBy.orderType === "NONE"}><SortDESCIcon size={16} /></Button>
                        </ButtonGroup>

                        <ButtonGroup className='aui-per-toggle sortasc-view' title={this.props.t("GROUP_SORT")}>
                            <Button size='sm' onClick={()=>this.handleFilterObject("first", "groupOrder", "click")} active={this.state.sobj.sortBy.groupOrder === "first"} className='rotate-group'><SortGroupsIcon size={16} /></Button>
                            <Button size='sm' onClick={()=>this.handleFilterObject("last", "groupOrder", "click")} active={this.state.sobj.sortBy.groupOrder === "last"}><SortGroupsIcon size={16} /></Button>
                        </ButtonGroup>

                        <Button variant='outline-secondary' onClick={() => this.resetSearch()} className='reset-link' size='sm'>{this.props.t("btnnames.reset")}</Button>
                    
                        {this.state.isShowGrouping && this.state.newGroupList.length > 0?<Dropdown className={'grouplist-dropdown'}>
                            <Dropdown.Toggle variant='primary' size='sm'>{this.state.newGroupList.length+" "+this.props.t("ITEMS_SELECTED")}</Dropdown.Toggle>
                            <Dropdown.Menu>
                                <ListGroup className='scrollable-list'>
                                    {this.state.newGroupList && this.state.newGroupList.length > 0?
                                        this.state.newGroupList.map((gsitem, gsidx) => {
                                            return <ListGroup.Item key={gsidx} className='groupitem-view'>
                                                {gsitem.prodobj.type === "group" || gsitem.prodobj.type === "separateGroup"?<>
                                                <Accordion>
                                                    <Accordion.Item eventKey="0">
                                                        <Accordion.Header onClick={() => this.toggleGroupAccordian(gsidx)}>
                                                        {/* <Accordion.Button  variant="link" eventKey="0" onClick={() => this.toggleGroupAccordian(gsidx)}> */}
                                                            <span className={"close-link"} onClick={() => this.handleAddNewSelected(gsitem.prodobj, -1)}><FeatherIcon icon="x" size={20} /></span>
                                                            <label className='group-label'>
                                                                <GroupProdIcon size={20} /> 
                                                                {this.props.t("GROUP_ITEM")} - {(gsitem.prodobj.products && gsitem.prodobj.products.length > 0?gsitem.prodobj.products.length:0)+" "+this.props.t("ITEMS_AVAILABLE")}
                                                                <span className={'chevrondown-icon'+(gsitem.isAccordianOpen?" open":"")}><ChevronDownIcon size={18}/></span>
                                                            </label>
                                                        {/* </Accordion.Button> */}
                                                        {/* <Accordion.Toggle as={Button} variant="link" onClick={() => this.toggleGroupAccordian(gsidx)}>
                                                            <span className={"close-link"} onClick={() => this.handleAddNewSelected(gsitem.prodobj, -1)}><FeatherIcon icon="x" size={20} /></span>
                                                            <label className='group-label'>
                                                                <GroupProdIcon size={20} /> 
                                                                {this.props.t("GROUP_ITEM")} - {(gsitem.prodobj.products && gsitem.prodobj.products.length > 0?gsitem.prodobj.products.length:0)+" "+this.props.t("ITEMS_AVAILABLE")}
                                                                <span className={'chevrondown-icon'+(gsitem.isAccordianOpen?" open":"")}><ChevronDownIcon size={18}/></span>
                                                            </label>
                                                        </Accordion.Toggle> */}
                                                        </Accordion.Header>
                                                        {/* <Accordion.Collapse eventKey="0"> */}
                                                        <Accordion.Body>
                                                            <ListGroup>
                                                                {gsitem.prodobj.products.map((gspitem, gspidx) => {
                                                                    return <ListGroup.Item key={gspidx}><div className='proditem-view'>
                                                                        <div className="thumb-div" onClick={() => this.handleImagePreviewModal(gspitem.productInfo, true)}>
                                                                            <img src={gspitem.productInfo.imgUrl} className="img-resize-ver" alt=""/>
                                                                        </div>
                                                                        <h5><CopyToClipboard text={gspitem.productInfo} onCopy={() => this.copyToClipboard()}><small style={{fontSize:"0.75rem"}}>{gspitem.productInfo.barcode}</small></CopyToClipboard><br/>{gspitem.productInfo.productName}</h5>
                                                                    </div></ListGroup.Item>;
                                                                })}
                                                            </ListGroup>
                                                        </Accordion.Body>
                                                        {/* </Accordion.Collapse> */}
                                                    </Accordion.Item>
                                                </Accordion>
                                                </>:<div className='proditem-view'>
                                                    <span className={"close-link"} onClick={() => this.handleAddNewSelected(gsitem.prodobj, -1)}><FeatherIcon icon="x" size={20} /></span>
                                                    <div className="thumb-div" onClick={() => this.handleImagePreviewModal(gsitem.prodobj.products[0].productInfo, true)}>
                                                        <img src={gsitem.prodobj.products[0].productInfo.imgUrl} className="img-resize-ver" alt=""/>
                                                    </div>
                                                    <h5><CopyToClipboard text={gsitem.prodobj.products[0].productInfo} onCopy={() => this.copyToClipboard()}><small style={{fontSize:"0.75rem"}}>{gsitem.prodobj.products[0].productInfo.barcode}</small></CopyToClipboard><br/>{gsitem.prodobj.products[0].productInfo.productName}</h5>   
                                                </div>}
                                            </ListGroup.Item>;
                                        })
                                    :<></>}
                                </ListGroup>
                                
                            </Dropdown.Menu>
                        </Dropdown>:<></>}
                    </Col>
                </Col>
                <label className='totalcount-txt'>{this.props.t("TOTAL_COUNT")}  {this.state.totalProdCount}</label>
                {/* {console.log(this.state.newProdList)} */}

                <Col xs={12} id="newprodlist-scroll" className='prodlist-wrapper' onScroll={(e) => this.getScrollPosition(e)} ref={this.whitecontainer}>
                    {this.state.totalProdCount > 0?<Row>
                        {this.state.newProdList.map((proditem, prodidx) => {
                            let isProdSelected = (!this.state.isGroupItem?this.state.newGroupList.findIndex(zitem => zitem.prodobj.uuid === proditem.uuid):false);

                            return <React.Fragment key={prodidx}>
                                {!proditem.isDelete?<>
                                    {(proditem.type === "group" || proditem.type === "separateGroup")?<>
                                        <Col xs={12} md={6} className='groupprod-wrapper'>
                                            <Col xs={12} className={'groupprod-content'+(isDisabledChange?" appliedview":"")+(this.state.isShowGrouping?" groupview":"")+(this.state.isShowGrouping && isProdSelected > -1?" selected":"")}>
                                                {this.state.isShowGrouping?<div className='groupoverlay-wrapper' onClick={() => this.handleAddNewSelected(proditem, prodidx)}></div>:<></>}

                                                {!this.state.isShowGrouping?<div className={'groupcheck-wrapper'+(proditem.isChecked?" active":"")}>
                                                    <ul className='list-inline'>
                                                        {!isDisabledChange?<><li className='list-inline-item'><label onClick={() => this.handleProductSelect(prodidx, "isChecked", !proditem.isChecked)} className={'checkicon'+(proditem.isChecked?" active":"")}><FeatherIcon icon="check" size={20} /></label></li>
                                                        <li className={'list-inline-item viewtypes'+(isDisabledChange?" auinewproddisabled":"")}>
                                                            <label className={'morelayer-icon'+(proditem.type === "separateGroup"?" typeactive":"")} onClick={() => this.updateSingleProd(prodidx, -1, "type", (proditem.type === "separateGroup"?"group":"separateGroup"))} title={this.props.t("SEPERATE_GROUP")}><MoreLayersIcon size={14} /></label>
                                                            <label className={'groupremove-icon'+(isOngoingSave?" ongoing-save":"")} onClick={() => this.handleSeparateGroup(prodidx)} title={this.props.t("DISCONNECTED_GROUP")}><BrokenConnectionIcon size={14} /></label>

                                                            {/* <label className='delete-icon' onClick={() => this.handleSeparateGroup(prodidx)} title='Remove group'><FeatherIcon icon="trash" size={14} /></label> */}
                                                        </li></>:<></>}
                                                    </ul>
                                                </div>:<></>}

                                                <Col className='groupprod-list'><Row>{proditem.products.map((gprod, gpidx) => {
                                                    return <React.Fragment key={gpidx}><SingleProdView t={this.props.t} isRTL={this.props.isRTL} dmode={this.props.dmode}
                                                        allVersionsList={this.props.allVersionsList}
                                                        isGroupItem={true}
                                                        isShowGrouping={this.state.isShowGrouping}
                                                        isProdFormShow={(proditem.type === "separateGroup"?true:false)}
                                                        isUsedDisabled={isUsedDisabled}
                                                        isDisabledChange={isDisabledChange}
                                                        groupitem={proditem}
                                                        proditem={gprod} prodidx={prodidx} gpidx={gpidx}
                                                        newGroupList={this.state.newGroupList}
                                                        searchObj={this.state.sobj}
                                                        selectedcard={this.state.selectedcard}
                                                        copyToClipboard={this.copyToClipboard}
                                                        handleAddNewSelected={this.handleAddNewSelected}
                                                        handleCancelProd={this.handleCancelProd}
                                                        handleProductSelect={this.handleProductSelect}
                                                        handleImagePreviewModal={this.handleImagePreviewModal}
                                                        setclickedcarddetails={this.setclickedcarddetails}
                                                        updateSingleProd={this.updateSingleProd}
                                                        testperiodfocusout={this.testperiodfocusout}
                                                        />
                                                </React.Fragment>})}</Row></Col>

                                                {proditem.type === "group"?<Col xs={12} className='groupcommon-wrapper'>
                                                    <div className='dash-line'></div>
                                                    <Col className={'form-inline group-inlinelist'+(isDisabledChange?" auinewproddisabled":"")}>
                                                        <Form.Control as={"select"} value={proditem.facing?proditem.facing.method:"num"} 
                                                        onChange={e => this.updateSingleProd(prodidx, -1, "method", e.target.value)} size='sm'>
                                                            <option value={"num"}>Fc</option>
                                                            <option value={"perc"}>Per</option>
                                                        </Form.Control>
                                                        <Form.Control type='text' value={proditem.facing?proditem.facing.value:0}
                                                        onKeyDown={e => this.handleChangeTxt(e, false, prodidx, true)} 
                                                        onChange={e => this.handleChangeTxt(e, true, prodidx, true)} size='sm' placeholder='num' />
                                                    </Col>

                                                    <Col xs={12}>
                                                        <ul className={'applytype-list list-inline'}>
                                                            {!isDisabledChange || (isDisabledChange && proditem.selectionOption === "all")?<li className='list-inline-item'>
                                                                <Button variant='outline-secondary' className={'all'+(isDisabledChange?" auinewproddisabled":"")} active={proditem.selectionOption === "all"} 
                                                                onClick={() => this.updateSingleProd(prodidx, -1, "selectionOption", (proditem.selectionOption !== "all"?"all":"none"))} size='sm'>
                                                                    {this.props.t("APPLY_TYPES.ALL")}
                                                                </Button>
                                                            </li>:<></>}
                                                            {!isDisabledChange || (isDisabledChange && proditem.selectionOption === "used")?<li className='list-inline-item'>
                                                                <Button variant='outline-secondary' className={'used'+(isDisabledChange?" auinewproddisabled":"")} disabled={isUsedDisabled} active={proditem.selectionOption === "used"} 
                                                                onClick={() => this.updateSingleProd(prodidx, -1, "selectionOption", (proditem.selectionOption !== "used"?"used":"none"))} size='sm'>
                                                                    {this.props.t("APPLY_TYPES.USED")}
                                                                </Button>
                                                            </li>:<></>}
                                                            {!isDisabledChange || (isDisabledChange && proditem.selectionOption === "selected")?<li className='list-inline-item'>
                                                                <VerSelectDrop t={this.props.t}
                                                                    prodidx={prodidx}
                                                                    gpidx={-1} gpitem={proditem}
                                                                    proditem={proditem}
                                                                    isDisabledChange={isDisabledChange}
                                                                    allVersionsList={this.props.allVersionsList}
                                                                    updateSingleProd={this.updateSingleProd}
                                                                    mutipleVerSelect={this.mutipleVerSelect}
                                                                    />
                                                            </li>:<></>}
                                                        </ul>
                                                    </Col>   
                                                    
                                                    <Col xs={12} className='inner-content bottom-content'>
                                                        <TypeSelectDrop t={this.props.t}
                                                            isDisabledChange={isDisabledChange}
                                                            prodidx={prodidx}
                                                            gpidx={-1}
                                                            proditem={proditem}
                                                            updateSingleProd={this.updateSingleProd}
                                                            />
                                                        {
                                                          proditem.strategy.option === "minSales" && 
                                                          <Col className='d-flex gap-2 maxFaceWithMinSales-group ' style={{borderBottom:"1px solid #4F4F4F"}}>
                                                               <Form.Control type='text' className={(isDisabledChange?" auinewproddisabled":"")} value={proditem.strategy?proditem.strategy.minFaceLimit:0} 
                                                           onKeyDown={e => this.handleChangeTxt(e, false, prodidx, false ,"minFaceLimit")}
                                                           onChange={e => this.handleChangeTxt(e, true, prodidx, false,  "minFaceLimit")} size='sm' placeholder='Min face limit'/>
                                                               {/* <Form.Control className={(isDisabledChange?" auinewproddisabled":"")} as={"select"} value={proditem?proditem.strategy.minFacingMethod:"days"} 
                                                               onChange={e => this.updateSingleProd(prodidx, -1, "minFacingMethod", e.target.value)} size='sm'>
                                                               <option value={"days"}>{this.props.t('days')}</option>
                                                               <option value={"weeks"}>{this.props.t('weeks')}</option>
                                                               <option value={"months"}>{this.props.t('months')}</option>
                                                               <option value={"years"}>{this.props.t('years')}</option>
                                                               </Form.Control> */}
                                                           </Col>

                                                            
                                                        }
                                                        {
                                                            proditem.strategy.option === "replace" || isDisabledChange === true ?
                                                            <ProdSelectSearch t={this.props.t} 
                                                                isDisabledChange={isDisabledChange}
                                                                proditem={proditem}
                                                                prodidx={prodidx}
                                                                replaceProductList={proditem.strategy?proditem.strategy.replaceProductList:[]}
                                                                searchObj={this.state.sobj}
                                                                selectedcard={this.state.selectedcard}
                                                                allVersionsList={this.props.allVersionsList}
                                                                copyToClipboard={this.copyToClipboard}
                                                                handleImagePreviewModal={this.handleImagePreviewModal}
                                                                replaceProdUpdate={this.replaceProdUpdate}
                                                                setclickedcarddetails={this.setclickedcarddetails}
                                                                /> :<></>
                                                        }
                                                            
                                                           
                                                    </Col>

                                                    <Col xs={12} className={'inout-content'+(proditem.isInOutProduct?" active":"")+(isDisabledChange?" auinewproddisabled":"")}>
                                                        <h6>
                                                            {/* <div className='editabletxt' contentEditable={isDisabledChange === true?false:true} suppressContentEditableWarning={true} onKeyDown={e => this.handleChangeTxt(e, false, prodidx)} onBlur={e => this.handleChangeTxt(e, true, prodidx)}>
                                                            {proditem.testPeriod}</div> {this.props.t("TEST_DAYS")} */}
                                                            <input type='text' className='editabletxt' style={{width:`${countTextCharacter(proditem.testPeriod)+2}ch`}} value={proditem.testPeriod} onKeyDown={e => this.handleChangeTxt(e, false, prodidx)} onChange={e => this.handleChangeTxt(e, true, prodidx)} onBlur={()=>this.testperiodfocusout(prodidx,null,true)} />
                                                            {this.props.t("TEST_DAYS")}
                                                        </h6>
                                                        
                                                        <span className='icon-view' onClick={() => this.updateSingleProd(prodidx, -1, "isInOutProduct", !proditem.isInOutProduct)}><InOutIcon size={18} /></span>
                                                    </Col>
                                                </Col>:<></>}    
                                            </Col>
                                        </Col>
                                    </>:<>
                                    {proditem.products.map((gprod, gpidx) => {
                                        return <React.Fragment key={gpidx}>
                                            <SingleProdView t={this.props.t} isRTL={this.props.isRTL} dmode={this.props.dmode}
                                            allVersionsList={this.props.allVersionsList}
                                            isShowGrouping={this.state.isShowGrouping}
                                            isDisabledChange={isDisabledChange}
                                            isUsedDisabled={isUsedDisabled}
                                            groupitem={proditem}
                                            proditem={gprod} prodidx={prodidx} gpidx={gpidx}
                                            newGroupList={this.state.newGroupList}
                                            searchObj={this.state.sobj}
                                            copyToClipboard={this.copyToClipboard}
                                            handleAddNewSelected={this.handleAddNewSelected}
                                            handleCancelProd={this.handleCancelProd}
                                            handleProductSelect={this.handleProductSelect}
                                            handleImagePreviewModal={this.handleImagePreviewModal}
                                            setclickedcarddetails={this.setclickedcarddetails}
                                            selectedcard={this.state.selectedcard}
                                            updateSingleProd={this.updateSingleProd}
                                            testperiodfocusout={this.testperiodfocusout}
                                            />  
                                        </React.Fragment>})}  
                                    </>}
                                
                                </>:<></>}
                            </React.Fragment>;
                    })}

                        {/* {this.state.totalProdCount > this.state.newProdList.length?<Col xs={12} className='text-center'><Button variant='outline-danger' className='loadmore-btn' onClick={() => this.loadMoreProds()}>{this.props.t("btnnames.loadmore")}</Button></Col>:<></>} */}
                    </Row>:<>
                    {this.state.isDataLoading?<h3 className='noprods-txt text-center'>{this.props.t("DATA_LOADING_PLEASE_WAIT")}</h3>:<h3 className='noprods-txt text-center'>{this.props.t("NO_RESULT_FOUND")}</h3>}
                        
                    </>}

                    {/* <div className='overlay-gradiant'></div> */}
                </Col>

                {this.state.totalProdCount > 0?<>
                    {this.state.isShowGrouping?<div className='makegroup-wrapper'>
                        <Button variant='success' onClick={() => this.mergeSelectedProds()} size='sm'>{this.props.t("MAKE_GROUP")}</Button>
                    </div>:<></>}
                    
                    <Col className='newprodbtn-list'>
                        <ul className='list-inline'>
                            <li className='list-inline-item'>
                                {!isDisabledChange?<Button variant='outline-success' onClick={() => this.toggleGroupingMode()} disabled={isOngoingSave} size='sm'>{this.props.t(this.state.isShowGrouping?"GROUP_CLOSE":"GROUP_PRODS")}</Button>:<></>}
                            </li>
                            {!isDisabledChange?<li className='list-inline-item savetxt-wrapper'><Button variant='success' onClick={() => this.applyNewProds(true, structuredClone(this.state.newProdList))} disabled={isOngoingSave} size='sm'>{this.props.t("APPLY")}</Button></li>:<></>}
                            <li className='list-inline-item'>
                                <label className={'saveanime-txt'+(isOngoingSave?" anime":"")}>{this.props.t("SAVING")}</label>
                            </li>
                        </ul>
                    </Col>
                </>:<></>}
                
            </Col>

            {sobj && !sobj.isInAppliedSection?<NewProdsSidebarView isRTL={this.props.isRTL} t={this.props.t} 
                defSaveObj={this.props.defSaveObj}
                dataObj={this.props.dataObj}
                isOngoingSave={isOngoingSave}
                toggleSimPreviewView={this.toggleSimPreviewView}
                />
            :<></>}

            {/* :<>
                <h3 className='noprods-txt text-center'>{this.props.t("NO_NEW_PRODS")}</h3>
            </>} */}

            {this.state.showPreviewImageModal===true ? 
                <PreviewImage 
                    productid={this.state.productId ? this.state.productId : null} 
                    loadfromback={true} 
                    imgurl={""} 
                    isshow={this.state.showPreviewImageModal} 
                    isRTL={this.props.isRTL} 
                    handlePreviewModal={this.handleImagePreviewModal}
                    hideheaderlables={false}
                    />
                :<></>
            }

            {
              this.state.isApplyModel &&<NewProductApplyDetailsModel isRTL={this.props.isRTL} t={this.props.t} responseObj={this.state.responseObj} toggleResponseModal={this.handleApplyModel} />
            }
            

            <Modal className="contimplement-modal auiNewprodCancelModal" show={this.state.isShowCancelModal} centered onHide={()=>this.toggleCancelModal(false)}>
                <Modal.Body>
                    <div className='closebtn' onClick={() => this.toggleCancelModal(false)}><XIcon size={30} /></div>

                    <h3 className='issue-header'>{this.props.t("CANCEL_SELPRODS")} <small>{this.state.cancelProds.map((citem, cidx) => {
                        return <React.Fragment key={cidx}>{citem.productInfo.productName}</React.Fragment>
                    })}</small></h3>

                    <h5>{this.props.t("PLEASE_SELECT_CANCELOPTION")}</h5>

                    <Col xs={12} className='canceloption-list'>
                        <ul>
                            <li>
                                <Button variant='outline-danger' onClick={() => this.continueCancelOption("newPending")} size='sm'>{this.props.t("singleprodcancel.newpending")}</Button>
                            </li>
                            <li>
                                <Button variant='outline-danger' onClick={() => this.continueCancelOption("old")} size='sm'>{this.props.t("singleprodcancel.old")}</Button>
                            </li>
                            
                        </ul>
                    </Col>
                </Modal.Body>
            </Modal>

            <NewProdStrategyApplyModal t={this.props.t} isRTL={this.props.isRTL}
                isShowStrategyModal={this.state.isShowStrategyModal}
                selectedSaveProds={this.state.selectedSaveProds} 
                chainOptionToAll={this.chainOptionToAll} 
                continueNewProdApply={this.continueNewProdApply} 
                handleChangeStrategy={this.handleChangeStrategy}
                handleImagePreviewModal={this.handleImagePreviewModal}
                toggleStrategyApplyModal={this.toggleStrategyApplyModal}
                toggleStrategyHelpDrop={this.toggleStrategyHelpDrop}    
                />
        </>);
    }
}
