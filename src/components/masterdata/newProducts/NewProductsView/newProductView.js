import React, { Component } from 'react'
import { withRouter } from 'react-router-dom';
import { Button, Col, Table, Pagination, Badge , Form, OverlayTrigger, Tooltip } from 'react-bootstrap'; //
import { withTranslation } from 'react-i18next';
import { Icons } from '../../../../assets/icons/icons';
import { ChevronLeftIcon, ChevronRightIcon } from '@primer/octicons-react';
import { confirmAlert } from 'react-confirm-alert';
import { connect } from 'react-redux';

import { submitSets } from '../../../UiComponents/SubmitSets';
import { submitCollection } from '../../../../_services/submit.service';
import { FindMaxResult, getPager, preventinputToString,numOfDecimalsLimit,roundOffDecimal, preventinputotherthannumbers, restrictDecimalPoint } from '../../../../_services/common.service';
import { AcViewModal,AcNoDataView } from '../../../UiComponents/AcImports';
import { alertService } from '../../../../_services/alert.service';
import { MPProductMissingTypes, ProductSearchCritieriaTypes } from '../../../../enums/productsEnum';

import { setNewProdCountAction } from '../../../../actions/newProductCount/newProductCount_action';

import NewProductsFilter from '../newProductsFilter/newProductsFilter';
import { MultipleSelectList, ResponseProdsModal } from '../newproductCommen';

// import { samplenewprods } from '../newprodSampledata';

import './NewProductsView.css';

class NewProductView extends Component {
    _isMounted = false;
    constructor(props) {
        super(props);
        this.state = {
            loading:false,
            sobj:this.props.defaultSearchObjLoad(),

            startpage: 1, 
            totalresults: 0,
            defaultPageCount: 8, 
            currentPage: 1, 
            totalPages: 0,
            ftablebody: [],
            pageItemsList: [],
            isdataloaded: false,
            categoryList: [{value:"-1", label:this.props.t("NONE")}],
            subCategoryList: [{value:"-1", label:this.props.t("NONE")}],
            missingtypes: [],
            isdropdownopen: false,
            oneresultheight: 60, maxShowresultcount: 0, orimaxShowresultcount: 0, //find max result varibles

            sendToDepObj: this.defSendTodep(), 
            archiveObj: this.defArchiveobj(),
            isShowResponseModal: false, responseObj: { responseType: "sendtodep", prods: [] },

        }
    }
    
    componentDidMount() {
        this._isMounted = true;

        if(this._isMounted){
            this.setState({ftablebody:this.props.newprodsTemfbodydata});

            if(this.props.filterDataObj){
                let tsobj = JSON.parse(JSON.stringify(this.props.filterDataObj));
                tsobj.date = (tsobj.date ? new Date(tsobj.date) :null);
                tsobj.isReqCount = true;

                let maxresutcount=FindMaxResult(this.props.whitecontainer.current?(this.props.whitecontainer.current.offsetHeight) : 0,this.state.oneresultheight,203)
                this.setState({sobj:tsobj, currentPage:(tsobj.currentPage ? tsobj.currentPage : 1),maxShowresultcount:((maxresutcount.maxresultCount>8)?maxresutcount.maxresultCount:8),orimaxShowresultcount:((maxresutcount.maxresultCount>8)?maxresutcount.maxresultCount:8)},()=>{
                    this.handleTableSearch();
                });

            } else{
                let maxresutcount=FindMaxResult(this.props.whitecontainer.current?(this.props.whitecontainer.current.offsetHeight) : 0,this.state.oneresultheight,203)
                
                this.setState({
                    maxShowresultcount:((maxresutcount.maxresultCount>8)?maxresutcount.maxresultCount:8),orimaxShowresultcount:((maxresutcount.maxresultCount>8)?maxresutcount.maxresultCount:8)
                },()=>{
                    this.handleTableSearch();
                })
            }

            this.setMissingtypes();
        }
    }

    componentWillUnmount() {
        this._isMounted = false;
    }

    defSendTodep = () => {
        return { isUpdateAll: false, isFromNewProduct: true, searchFilter: null, productIds: [], isSingleProd: false, isEnableMultiple: false };
    }

    defArchiveobj = () => {
        return { isUpdateAll: false, isFromNewProduct: true, searchFilter: null, productIds: [], isSingleProd: false, isEnableMultiple: false };
    }

    handleTags = (evt) => {
        var tagList = this.props.tagList;

        let searchObj = this.state.sobj;
        var selectedtags = searchObj.moreFilter.displayTags;

        var selectedobj = tagList.find(x=>x.value === parseInt(evt.value));
        var alreadyAdded = selectedtags.find(c => c.id === selectedobj.value);

        if(alreadyAdded){
            alertService.warn(this.props.t("ALREADY_ADDED"))
        } else{
            selectedtags.push({
                id:selectedobj.value,
                tagName:selectedobj.label
            })
            
            this.setState({ sobj: searchObj });
        }
    }
    //remove added tag
    removeTag = (xidx) => {
        let searchObj = this.state.sobj;

        let selectedtags = searchObj.moreFilter.displayTags;
        selectedtags.splice(xidx,1);

        this.setState({ sobj: searchObj });
    }

    setMissingtypes = (isclear) => {
        let defsettings = this.props.defaultSearchObjLoad();
        let defmissingTypes = defsettings.moreFilter.productMissingTypes;
        
        var types = [];
        Object.keys(MPProductMissingTypes).map(x => {
            var obj = MPProductMissingTypes[x];
            let isdeftype = defmissingTypes.findIndex(mtype => mtype === obj);

            var cobj = {
                Name: obj,
                isCheck: (!isclear && isdeftype > -1?true:false),
                isProdType: (obj === MPProductMissingTypes.Dimension_Missing),
                enum: obj
            }
            types.push(cobj);

            return cobj;
        });

        this.setState({missingtypes:types})
    }

    changeDate = (key, value) => {
        let sobj = this.state.sobj;
        sobj[key] = value;
        this.setState({ sobj: sobj })
    }

    changeFilters = (key, value, isnotreloading, isvalidate,msg,evt) => {


        let sobj = this.state.sobj;
        if(key === "freeSearchValue"){
            if(!preventinputToString(evt,evt.target.value,msg)){
                evt.preventDefault()
                return
              }
        }
        if(key==="searchbtn"){

        }else{
            sobj[key] = value;
        }
       
        this.setState({ sobj: sobj },()=>{
            if(!isnotreloading && key !== "freeSearchValue"){
                this.props.setFilterData("newProductFilters", sobj);
                this.handleTableSearch(isvalidate);
            }
        });
    }

    triggerrSearch = () =>{
        this.props.setFilterData("newProductFilters", this.state.sobj);
        this.handleTableSearch();
    }

    resetFilters=()=>{
        this.setState({ sobj: this.props.defaultSearchObjLoad(), currentPage:1, missingtypes:[], },()=>{
            this.props.setFilterData("newProductFilters", this.props.defaultSearchObjLoad());
            this.setMissingtypes();
            this.handleTableSearch();

            this.props.updateDeptList(this.props.defaultSearchObjLoad());

            this.props.updateMultiSelect("newProds", true, null);
        });
    }

    handleTableSearch = (isvalidate) => {
        var maxresutcount = this.state.maxShowresultcount;
        var csobj = this.state.sobj;
        csobj.maxResult = maxresutcount;
        var cdisplaytag = csobj.moreFilter.displayTags;

        let existtags = cdisplaytag.map((obj) => obj.id);
        csobj.moreFilter.productTags = existtags;

        csobj.moreFilter.dimensions.depth.lowerBound=csobj.moreFilter.dimensions.depth.lowerBound===""?0:parseFloat(csobj.moreFilter.dimensions.depth.lowerBound)
        csobj.moreFilter.dimensions.depth.upperBound=csobj.moreFilter.dimensions.depth.upperBound===""?0:parseFloat(csobj.moreFilter.dimensions.depth.upperBound)

        if(csobj.moreFilter.dimensions.depth.searchCriteria === ProductSearchCritieriaTypes.Range){
            if(!(csobj.moreFilter.dimensions.depth.lowerBound <= csobj.moreFilter.dimensions.depth.upperBound)){
                alertService.error(this.props.t("PLEASE_SET_VALID_Depth_RANGE"));
                return false;
            }
        }

        csobj.moreFilter.dimensions.height.lowerBound=csobj.moreFilter.dimensions.height.lowerBound===""?0:parseFloat(csobj.moreFilter.dimensions.height.lowerBound)
        csobj.moreFilter.dimensions.height.upperBound=csobj.moreFilter.dimensions.height.upperBound===""?0:parseFloat(csobj.moreFilter.dimensions.height.upperBound)

        if(csobj.moreFilter.dimensions.height.searchCriteria === ProductSearchCritieriaTypes.Range){
            if(!(csobj.moreFilter.dimensions.height.lowerBound <= csobj.moreFilter.dimensions.height.upperBound)){
                alertService.error(this.props.t("PLEASE_SET_VALID_height_RANGE"));
                return false;
            }
        }

        csobj.moreFilter.dimensions.width.lowerBound=csobj.moreFilter.dimensions.width.lowerBound===""?0:parseFloat(csobj.moreFilter.dimensions.width.lowerBound)
        csobj.moreFilter.dimensions.width.upperBound=csobj.moreFilter.dimensions.width.upperBound===""?0:parseFloat(csobj.moreFilter.dimensions.width.upperBound)
        
        if(csobj.moreFilter.dimensions.width.searchCriteria === ProductSearchCritieriaTypes.Range){
            if(!(csobj.moreFilter.dimensions.width.lowerBound <= csobj.moreFilter.dimensions.width.upperBound)){
                alertService.error(this.props.t("PLEASE_SET_VALID_width_RANGE"));
                return false;
            }
        }

        csobj.moreFilter.saleDateCount=csobj.moreFilter.saleDateCount===""?0:parseInt(csobj.moreFilter.saleDateCount)
        if(isvalidate){
            // if(csobj.moreFilter.searchDateType === FilterDateSearchTypes.dateRange){
                let setfromdate = csobj.moreFilter.createdDateRange.fromDate;
                let settodate = csobj.moreFilter.createdDateRange.toDate;

                let cfromdate = new Date(setfromdate);
                let ctodate = new Date(settodate);
                
                /* if(!settodate || settodate === "") {
                    alertService.error(this.props.t("PLEASE_SET_TO_DATE"));
                    return false;

                } else{ */
                    if((setfromdate && !settodate) || (!setfromdate && settodate) || (setfromdate && setfromdate !== "" && settodate && settodate !== "" && ctodate.getTime() < cfromdate.getTime())){ 
                        alertService.error(this.props.t("PLEASE_SET_VALID_DATE_RANGE"));
                        return false;
                    } else{
                        csobj.moreFilter.createdDateRange["isHasSelectedDateRange"] = ((setfromdate && setfromdate !== "" && settodate && settodate !== "")?true:false);
                    }
                // }
            // } 
            /* else if(csobj.moreFilter.searchDateType === FilterDateSearchTypes.dateCount && (!csobj.moreFilter.dateCount || csobj.moreFilter.dateCount <= 0)){
                alertService.error(this.props.t("PLEASE_SET_VALID_DATE_COUNT"));
                return false;
            } */
        }

        this.props.handleEditClose();
        
        this.setState({isdataloaded: false, loading: true, sobj: csobj});
        submitSets(submitCollection.searchMPProducts, this.state.sobj, true).then(res => {
            var cdata = [];
            if (res && res.status) {
                var cpageidx = cdata.findIndex(x => x.page === this.state.startpage);
                if (cpageidx > -1) {
                    cdata[cpageidx].data = res.extra;
                } else {
                    cdata.push({ page: (this.state.startpage), data: res.extra });
                }
                this.setState({
                    isdropdownopen:false,
                    isdataloaded: true, loading: false,
                    toridata: cdata,
                    totalresults: ((this.state.startpage === 1 || this.state.sobj.isReqCount) ? res.count : this.state.totalresults),
                }, () => {
                    this.loadTableData();
                });

                //save filter obj
                let filterobj = this.state.sobj;
                filterobj.currentPage = this.state.currentPage;
                filterobj.pagtotal = (res.extra ? res.extra.length : 0);
                this.props.setFilterData("newProductFilters", filterobj);

            } else {
                this.setState({
                    isdataloaded: true, loading: false,
                    toridata: cdata,
                }, () => {
                    
                    this.loadTableData();
                });
            }
        });
    }

    //table data load
    loadTableData = () => {
        var cdata = [];
        if (this.state.toridata && this.state.toridata.length > 0) {
            var cfindList = this.state.toridata.find(x => x.page === this.state.startpage);
            if (cfindList) {
                cdata = cfindList.data
            }
        }
        this.setState({ ftablebody: cdata }, () => {
            this.props.setTemporaryftabledata(cdata);
            if (this.state.currentPage > 1) {
                this.setPage(this.state.currentPage, false);
            } else {
                this.setPage(1, false);
            }
        });
    }

    //page change
    handlePageChange = (cstartpage) => {
        //var cfindList = this.state.toridata.find(x => x.page === cstartpage);
        var csobj = this.state.sobj;
        //request 
        if (cstartpage === this.state.totalPages) {
            csobj["isReqCount"] = true
        } else {
            csobj["isReqCount"] = false
        }
        // csobj["isReqCount"] = true;
        csobj.startIndex = ((cstartpage - 1) * this.state.sobj.maxResult);
        this.setState({ sobj: csobj, startpage: cstartpage, isdataloaded: false }, () => {
            // if (cfindList) {
            //     this.setState({ isdataloaded: true });
            //     this.loadTableData();
            // } else {
            // }//used when paginations items are stored in state

            this.handleTableSearch(null, "click");
        });
    }
    //pager
    setPage = (cpage, isnewpage) => {
        var pageLength = (this.state.sobj.maxResult ? this.state.sobj.maxResult : this.state.defaultPageCount);
        var citems = (this.state.ftablebody ? JSON.parse(JSON.stringify(this.state.ftablebody)) : []);
        var pager = getPager(this.state.totalresults, cpage, pageLength);
        // check page isn't out of range
        if (cpage < 1 || cpage > pager.totalPages) {
            this.setState({
                pageItemsList: [],
                currentPage: 1,
                totalPages: 0
            });
            return;
        }
        var cfindList = (this.state.toridata ? this.state.toridata.find(x => x.page === this.state.newstartpage) : undefined);
        if (isnewpage) {
            if (cfindList && cfindList) {
                this.setState({
                    ftablebody: cfindList.data
                });
                this.props.setTemporaryftabledata(cfindList.data);
            } else {
                this.handlePageChange(cpage);
            }
        }
        this.setState({
            pageItemsList: citems,
            currentPage: pager.currentPage,
            totalPages: pager.totalPages,
            isonloadtable: false,
        });
    }

    clickEdit = (pobj) =>{
        this.setState({loading: true});
        submitSets(submitCollection.findProdByID, ('?productId='+pobj.productId), true, null, true).then(res => {//
            this.setState({loading: false});
            if(res && res.status){
                var pobj = res.extra;
                pobj.subCategoryId = (pobj.subCategoryId ? pobj.subCategoryId : 0);
                pobj.brandId = (pobj.brandId ? pobj.brandId : 0);

                pobj.width = (pobj.width > 0?roundOffDecimal(pobj.width,numOfDecimalsLimit):pobj.width);
                pobj.height = (pobj.height > 0?roundOffDecimal(pobj.height,numOfDecimalsLimit):pobj.height);
                pobj.depth = (pobj.depth > 0?roundOffDecimal(pobj.depth,numOfDecimalsLimit):pobj.depth);
                pobj.sensitivity = (pobj.sensitivity > 0?roundOffDecimal(pobj.sensitivity,numOfDecimalsLimit):pobj.sensitivity);

                this.props.handleTableEditBtn(pobj);
                window.scrollTo(0, 0);
            } else{
                // alertService.error((res&&res.msg?res.msg:res&&res.extra?res.extra:this.props.t('ERROR_OCCURRED')));
            }
        });
    }

    singleProdArchive = (pobj) => {
        let arcObj = this.state.archiveObj;

        let arcprods = [];
        let isthisprodincludes = false;
        if(this.props.multiSelectList.newProds && this.props.multiSelectList.newProds.length > 0){
            for (let i = 0; i < this.props.multiSelectList.newProds.length; i++) {
                const newproditem = this.props.multiSelectList.newProds[i];
                
                arcprods.push(newproditem.productId);

                if(newproditem.productId === pobj.productId){
                    isthisprodincludes = true;
                }
            }
        }

        if(!isthisprodincludes && arcprods.length > 0){
            alertService.warn(this.props.t("SELECTED_PRODS_AVAILABLE"), 5000);
        }

        arcObj["isSingleProdIncludes"] = (isthisprodincludes && arcprods.length > 1);
        arcObj.productIds = ((isthisprodincludes === true)?arcprods:[pobj.productId]);
        arcObj.singleprodIds = [pobj.productId];
        arcObj.isEnableMultiple = isthisprodincludes;
        arcObj.isSingleProd = !isthisprodincludes;

        this.archive(arcObj);
    }

    archive = (arcObj) => {
        let btnlist = [];
        
        if(!arcObj.isSingleProd && !arcObj.isSingleProdIncludes){
            btnlist.push({
                label: this.props.t('multiselect.archiveall'),
                onClick: () => {
                    this.continueArchive(arcObj,true);
                }
            });
        }

        // if(arcObj.isEnableMultiple || arcObj.isSingleProd){
            let continuemsg = (arcObj.isSingleProd && !arcObj.isSingleProdIncludes?this.props.t('btnnames.yes'):(this.props.t('multiselect.archiveselected')+(" ("+(arcObj.productIds && arcObj.productIds.length > 0?arcObj.productIds.length:0)+")")));
            btnlist.push({
                label: continuemsg,
                onClick: () => {
                    this.continueArchive(arcObj,false);
                }
            });
        // }

        if(arcObj.isSingleProdIncludes === true){
            let continuemsg = this.props.t('multiselect.onlythisprod');
            btnlist.push({
                label: continuemsg,
                onClick: () => {
                    this.continueArchive(arcObj, false, true);
                }
            });  
        }

        btnlist.push({
            label: (arcObj.isSingleProd && !arcObj.isSingleProdIncludes?this.props.t('btnnames.no'):this.props.t('btnnames.close')),
            onClick: () => {
                return false;
            }
        });

        let archivemsg = (arcObj.isSingleProd && !arcObj.isSingleProdIncludes?this.props.t("NEW_PROD_ARCHIVE_CONFIRM"):this.props.t("ARE_YOU_SURE_TO_ARCHIVE"));
        confirmAlert({
            title: this.props.t("CONFIRM_TO_SUBMIT"),
            message: archivemsg,
            overlayClassName: ("newprod-confirm"+(this.props.isRTL === "rtl" ? " alertrtl-content" : "")),
            buttons: btnlist
        });
    }

    continueArchive = (arcObj, isAllItems, onlysingleprod) => {
        arcObj.isUpdateAll = isAllItems;
        arcObj.searchFilter = this.state.sobj;

        if(!isAllItems && (!arcObj.productIds || arcObj.productIds.length === 0)){
            alertService.error(this.props.t("NO_SELECTED_PRODUCTS"));
            return false;
        }

        if(onlysingleprod){
            arcObj.isSingleProd = true;
            arcObj.isEnableMultiple = false;
            arcObj.productIds = arcObj.singleprodIds;
        }

        this.setState({ loading:true});
        submitSets(submitCollection.archiveProduct, arcObj, true, null, true).then(resp => {
            this.setState({ loading:false});
            if(resp && resp.status){
                alertService.success(this.props.t("succussfuly")+" " +this.props.t("saved"));
                this.props.handleEditClose();
                this.loadNewProductsCounts();
                
                let serachobj = this.state.sobj;
                const stindx = serachobj.startIndex;
                const maxresult = serachobj.maxResult;
                
                if(this.state.ftablebody.length === 1 && this.state.startpage > 1 ){
                    serachobj.startIndex = (stindx - maxresult);
                    this.setState({sobj:serachobj, arcObj: this.defArchiveobj(), startpage:(this.state.startpage - 1),  currentPage:(this.state.currentPage - 1)},()=>{
                        this.handleTableSearch();
                    });
                } else {
                    this.setState({sobj: serachobj, arcObj: this.defArchiveobj() },()=>{
                        this.handleTableSearch();
                    });
                }

                if(resp.extra && Array.isArray(resp.extra) && resp.extra.length > 0){
                    if(resp.extra.length === 1){
                        let firstitem = resp.extra[0];
                        if(firstitem.success){
                            alertService.success(this.props.t("succussfuly")+" "+firstitem.productName+" "+this.props.t("ARCHIVED"));
                        } else{
                            alertService.error(firstitem.response);
                        }
                    } else{
                        let respobj = { responseType: "archive", prods: resp.extra };
                        this.setState({ isShowResponseModal: true, responseObj: respobj });
                    }
                } else{
                    if(arcObj.productIds.length > 5){
                        alertService.info(this.props.t("TAKESOMETIMETO_COMPLETE"));
                    }
                }

                this.props.updateMultiSelect("newProds", true);
            }
            else{
                // alertService.error((resp&&resp.msg?resp.msg:resp&&resp.extra?resp.extra:this.props.t('ERROR_OCCURRED')));
            }
        });
    }

    singleProdSendtoDep = (pobj) => {
        let stdObj = this.state.sendToDepObj;

        let stdprods = [];
        let isthisprodincludes = false;
        if(this.props.multiSelectList.newProds && this.props.multiSelectList.newProds.length > 0){
            for (let i = 0; i < this.props.multiSelectList.newProds.length; i++) {
                const newproditem = this.props.multiSelectList.newProds[i];
                
                stdprods.push(newproditem.productId);

                if(newproditem.productId === pobj.productId){
                    isthisprodincludes = true;
                }
            }
        }

        if(!isthisprodincludes && stdprods.length > 0){
            alertService.warn(this.props.t("SELECTED_PRODS_AVAILABLE"),5000);
        }

        stdObj["isSingleProdIncludes"] = (isthisprodincludes && stdprods.length > 1);
        stdObj.productIds = ((isthisprodincludes === true)?stdprods:[pobj.productId]);
        stdObj.singleprodIds = [pobj.productId];
        stdObj.isEnableMultiple = isthisprodincludes;
        stdObj.isSingleProd = !isthisprodincludes;

        this.sendToDep(stdObj);
    }

    sendToDep = (stdObj) => {
        let btnlist = [];
        if(!stdObj.isSingleProd && !stdObj.isSingleProdIncludes){
            btnlist.push({
                label: this.props.t('multiselect.sendall'),
                onClick: () => {
                    this.continueSendtoDep(stdObj, true);
                }
            });
        }

        // if(stdObj.isEnableMultiple || stdObj.isSingleProd){
            let continuelbtntxt = ((stdObj.isSingleProd && !stdObj.isSingleProdIncludes)?this.props.t('btnnames.yes'):(this.props.t('multiselect.sendselected')+(" ("+(stdObj.productIds && stdObj.productIds.length > 0?stdObj.productIds.length:0)+")")));
            btnlist.push({
                label: continuelbtntxt,
                onClick: () => {
                    this.continueSendtoDep(stdObj, false);
                }
            });    
        // }

        if(stdObj.isSingleProdIncludes === true){
            let continuemsg = this.props.t('multiselect.onlythisprod');
            btnlist.push({
                label: continuemsg,
                onClick: () => {
                    this.continueSendtoDep(stdObj, false, true);
                }
            });  
        }

        //push close btn
        btnlist.push({
            label: ((stdObj.isSingleProd && !stdObj.isSingleProdIncludes)?this.props.t('btnnames.no'):this.props.t('btnnames.close')),
            onClick: () => {
                return false;
            }
        });

        let confirmmsg = ((stdObj.isSingleProd && !stdObj.isSingleProdIncludes)?this.props.t("NEW_PROD_SENDTODEP_CONFIRM"):this.props.t("PRODS_SENDTODEP_CONFIRM"));

        confirmAlert({
            title: this.props.t("CONFIRM_TO_SUBMIT"),
            message: confirmmsg,
            overlayClassName: ("newprod-confirm"+(this.props.isRTL === "rtl" ? " alertrtl-content" : "")),
            buttons: btnlist
        });
    }

    continueSendtoDep = (stdObj, isAllItems, onlysingleprod) => {
        stdObj.isUpdateAll = isAllItems;
        stdObj.searchFilter = this.state.sobj;

        if(!isAllItems && (!stdObj.productIds || stdObj.productIds.length === 0)){
            alertService.error(this.props.t("NO_SELECTED_PRODUCTS"));
            return false;
        }

        if(onlysingleprod){
            stdObj.isSingleProd = true;
            stdObj.isEnableMultiple = false;
            stdObj.productIds = stdObj.singleprodIds;
        }

        this.setState({ loading:true});
        submitSets(submitCollection.sendProductToMP, stdObj, true, null, true).then(resp => {
            this.setState({ loading:false});
            if(resp && resp.status){
                alertService.success(this.props.t("succussfuly")+" " +this.props.t("saved"));
                this.props.handleEditClose();
                this.loadNewProductsCounts();

                let serachobj = this.state.sobj;
                const stindx = serachobj.startIndex;
                const maxresult = serachobj.maxResult;
                
                if(this.state.ftablebody.length===1 && this.state.startpage>1 ){
                    serachobj.startIndex = (stindx - maxresult);
                    this.setState({sobj:serachobj, sendToDepObj: this.defSendTodep(), startpage:(this.state.startpage - 1),  currentPage:(this.state.currentPage - 1)},()=>{
                        this.handleTableSearch();
                    });
                }
                else{
                    this.setState({ sobj: serachobj, sendToDepObj: this.defSendTodep() },()=>{
                        this.handleTableSearch();
                    });
                }

                if(resp.extra && Array.isArray(resp.extra) && resp.extra.length > 0){
                    if(resp.extra.length === 1){
                        let firstitem = resp.extra[0];
                        if(firstitem.success){
                            alertService.success(this.props.t("succussfuly")+" "+firstitem.productName+" "+this.props.t("SENDTODEP"));
                        } else{
                            alertService.error(firstitem.response);
                        }
                    } else{
                        let respobj = { responseType: "sendtodep", prods: resp.extra };
                        this.setState({ isShowResponseModal: true, responseObj: respobj });
                    }
                } else{
                    if(stdObj.productIds.length > 5){
                        alertService.info(this.props.t("TAKESOMETIMETO_COMPLETE"));
                    }
                }
                
                this.props.updateMultiSelect("newProds", true);

            } else{
                // alertService.error((resp&&resp.msg?resp.msg:resp&&resp.extra?resp.extra:this.props.t('ERROR_OCCURRED')));
            }
        });
    }

    loadNewProductsCounts = () =>{
        submitSets(submitCollection.getMPNewProductsCount, null).then(res => {
          if(res && res.status && res.extra){
              this.props.setNewProdCountAction(res.extra);
          } else{
              this.props.setNewProdCountAction(0);
          }
        });
    }
    handleFilterSwitchChange = (check,type,filterType) =>{
        let cobj = this.state.sobj;
        if(filterType==="combFilter"){
            cobj.moreFilter[type] = check;
        }else{
            cobj.moreFilter.swiches[type] = check;
        }
       
        this.setState({sobj:cobj});
    }
    //toggle departmet filter: 
    toggleDepCatSubCatFilter=(evt,etype,dtype)=>{
   
        var cobj = this.state.sobj;
        if(etype==="supplierId"||etype==="brandId"){
            if(etype !== null){
                cobj.moreFilter.mappings[etype]=evt.value
            }
            this.setState({sobj:cobj})
        }
        if(dtype==="dep"){
            if(etype !== null){
                cobj.moreFilter.mappings.categoryId=-1
                cobj.moreFilter.mappings.subCategoryId=-1
                cobj.moreFilter.mappings[etype] = evt.value;
            }
            // cobj.startIndex = 0;
    
            this.setState({sobj:cobj,subCategoryList:[{value:"-1", label:this.props.t("NONE")}],categoryList:[{value:"-1", label:this.props.t("NONE")}]}, () => {
                this.getCategories();
            });
        }
        if(dtype==="cat"){
            if(etype !== null){
                cobj.moreFilter.mappings.subCategoryId=-1
                cobj.moreFilter.mappings[etype] = evt.value;
            }
            // cobj.startIndex = 0;
    
            this.setState({sobj:cobj,subCategoryList:[{value:"-1", label:this.props.t("NONE")}]}, () => {
                this.getSubCategories();
            });
        }
        if(dtype==="subcat"){
            if(etype !== null){
                cobj.moreFilter.mappings[etype] = evt.value;
            }
            // cobj.startIndex = 0;
    
            this.setState({sobj:cobj}, () => {
              
            });
        }
        
    }
    //get categories call
    getCategories=()=>{
        
        var csobj={
            isReqPagination:false,
            departmentId:this.state.sobj.moreFilter.mappings.departmentId,
        }
        submitSets(submitCollection.getAllCategoriesFromDepartment, csobj, true).then(res => {
            var cdata = [{value:0, label:""}];
            if(res && res.status){
                for (let i = 0; i < res.extra.length; i++) {
                    cdata.push({value:res.extra[i].id, label:res.extra[i].categoryName});
                }
                this.setState({categoryList:cdata})
            }else{
                alertService.error(this.props.t("ERROR_OCCURED"));
            }
        })

        
    }
    getSubCategories=()=>{
        var csobj={
            isReqPagination:false,
            depCategoryId:this.state.sobj.moreFilter.mappings.categoryId,
        }
        submitSets(submitCollection.getSubCategories, csobj, true).then(res => {
            var cdata = [{value:0, label:""}];
            if(res && res.status){
                for (let i = 0; i < res.extra.length; i++) {
                    cdata.push({value:res.extra[i].subCategoryId, label:res.extra[i].subCategoryName});
                }
                this.setState({subCategoryList:cdata})
            }else{
                alertService.error(this.props.t("ERROR_OCCURED"));
            }
        })
    }
    //handle dialmentions of product
    handleDiamentions=(val,diemntiontype,boundype,isCritieria,event,msg)=>{
        var cobj = this.state.sobj;
        var diamention=cobj.moreFilter.dimensions

        if((diemntiontype === 'width' || diemntiontype === 'height' || diemntiontype === 'depth') && boundype !== ""){
            if(restrictDecimalPoint(event.target.value,3)){
                event.preventDefault()
                return
            }
            if(!preventinputotherthannumbers(event,event.target.value,msg)){
                event.preventDefault()
                return
            }
        }


        if(isCritieria){
            diamention[diemntiontype].searchCriteria=val
        }else{
            if(boundype==="lbound"){
                diamention[diemntiontype].lowerBound=(val===""?"":val>=0)?val:""
            }else if(boundype==="ubound"){
                diamention[diemntiontype].upperBound=(val===""?"":val>=0)?val:""
            }
        }
        this.setState({sobj:cobj})
    }
    handleFilterObjectdropdown = (evt, etype, ischildkey, parenttype, isnumber) => {
        var cobj = this.state.sobj;
        if(etype === "completeStatus" && evt.target.value !== "None"){
            cobj.moreFilter.productMissingTypes = [];
        }

        if(etype === "shouldIgnoreHiddenDepartment"){
            cobj.moreFilter.mappings.categoryId = -1;
            cobj.moreFilter.mappings.departmentId = -1;
            cobj.moreFilter.mappings.subCategoryId = -1;
        }

        if(etype === "fromDate" || etype === "toDate"){

            if(etype === "fromDate"){
                if(cobj.moreFilter.createdDateRange.toDate && cobj.moreFilter.createdDateRange.toDate !== ""){
                    if(new Date(evt) >= new Date(cobj.moreFilter.createdDateRange.toDate)){
                        alertService.error(this.props.t("PLEASE_SET_VALID_DATE_RANGE"));
                        return;
                    }
                }
            }

            if(etype === "toDate"){
                if(cobj.moreFilter.createdDateRange.fromDate && cobj.moreFilter.createdDateRange.from !== ""){
                    if(new Date(cobj.moreFilter.createdDateRange.fromDate) >= new Date(evt)){
                        alertService.error(this.props.t("PLEASE_SET_VALID_DATE_RANGE"));
                        return;
                    }
                }else{
                    alertService.error(this.props.t("PLEASE_SET_A_FROM_DATE"));
                    return;
                }
            }

        }

        if(etype !== null){
            if(evt && !evt.target){
                if(ischildkey){
                    cobj.moreFilter[parenttype][etype] = evt;
                } else{
                    cobj.moreFilter[etype] = evt;
                }
            } else if(evt && evt.target){
                cobj.moreFilter[etype] = (isnumber?(evt.target.value===""?"":parseFloat(evt.target.value) > 0?parseFloat(evt.target.value):0):evt.target.value);
            } else{
                if(ischildkey){
                    cobj.moreFilter[parenttype][etype] = null;
                } else{
                    cobj.moreFilter[etype] = null;
                }
            }
        }
        cobj.startIndex = 0;

        this.setState({sobj: cobj}, () => {
            if(etype === "completeStatus" && evt.target.value !== "None"){
                this.setState({missingtypes: []},() => {
                    this.setMissingtypes(true);
                })
            }

            this.props.updateDeptList(cobj);
        });
    }
    handleMissingSwitchChange = (item) => {
        var csobj = this.state.sobj;

        var cmissingtypes = this.state.missingtypes;
        for (let i = 0; i < cmissingtypes.length; i++) {
            const mtype = cmissingtypes[i];
            if(mtype.enum === item.enum){
                mtype.isCheck=!item.isCheck
            }
        }

        //setting serch obj
        var missingtypes = [];
        cmissingtypes.forEach(element => {
            if(element.isCheck){
                missingtypes.push(element.enum)
            }
            
        });

        csobj.moreFilter.productMissingTypes = missingtypes;

        this.setState({missingtypes: cmissingtypes, sobj: csobj})
    }

    onToggleHandler = (isOpen, e, metadata) => {
        // if  (metadata.source != 'select') {
           this.setState({isdropdownopen:isOpen})
        // }
    }
    //select table row
    toggleSelectTableRow = (prod, prodidx) => {
        this.props.updateMultiSelect("newProds", false, [prod]);
    }
    //select all table rows
    selectAllProds = (isreset) => {
        if(isreset){
            this.props.updateMultiSelect("newProds", true);
        } else{
            let addedlist = (this.props.multiSelectList && this.props.multiSelectList.newProds?this.props.multiSelectList.newProds:[]);
        
            let newaddlist = [];
            for (let i = 0; i < this.state.ftablebody.length; i++) {
                const proditem = this.state.ftablebody[i];
                
                let isalreadyadded = addedlist.findIndex(x => x.productId === proditem.productId);
                if(isalreadyadded === -1){
                    newaddlist.push(proditem);
                }
            }
    
            if(newaddlist.length > 0){
                this.props.updateMultiSelect("newProds", false, newaddlist);
            }
        }
    }
    //trigger all action
    triggerAllAction = () => {
        //-1 = none, 1 = send to dep, 2 = archive, 3 = restore
        // console.log(this.props.multiSelectList.allAction);
        let actiontype = (this.props.multiSelectList && this.props.multiSelectList.allAction?parseInt(this.props.multiSelectList.allAction):0);
        
        if(actiontype > 0){
            if(this.props.multiSelectList.newProds && this.props.multiSelectList.newProds.length > 0){
                let caction = parseFloat(this.props.multiSelectList.allAction);

                if(caction === 1){ //send to dep
                    let cstdobj = this.state.sendToDepObj;
                    let stdprods = [];

                    for (let i = 0; i < this.props.multiSelectList.newProds.length; i++) {
                        const newproditem = this.props.multiSelectList.newProds[i];
                        
                        // if(newproditem.completeStatus === "FullData" && newproditem.mpUsageStatus === "None"){
                            stdprods.push(newproditem.productId);
                        // }
                    } 

                    cstdobj.isSingleProdIncludes = false;
                    cstdobj.isEnableMultiple = false;
                    cstdobj.isSingleProd = false;
                    cstdobj.productIds = stdprods;

                    if(stdprods.length > 0){
                        cstdobj.isEnableMultiple = true;
                    }

                    this.sendToDep(cstdobj);

                } else if(caction === 2){
                    let carchiveobj = this.state.archiveObj;
                    let archiveprods = [];

                    for (let i = 0; i < this.props.multiSelectList.newProds.length; i++) {
                        const newproditem = this.props.multiSelectList.newProds[i];
                        archiveprods.push(newproditem.productId);
                    }

                    carchiveobj.isSingleProdIncludes = false;
                    carchiveobj.isEnableMultiple = false;
                    carchiveobj.isSingleProd = false;
                    carchiveobj.productIds = archiveprods;

                    if(archiveprods.length > 0){
                        carchiveobj.isEnableMultiple = true;
                    }

                    this.archive(carchiveobj);
                }
            } else{
                alertService.error(this.props.t("NO_SELECTED_PRODUCTS"));
            }
        } else{
            alertService.error(this.props.t("SELECT_ACTION"));
        }
    }
    //multi select action
    multiSelectAction = (action) => {
        //1 = send to dep, 2 = archive, 3 = restore

        console.log(action);
    }
    
    handleShowingresults=(e)=>{
        this.setState({maxShowresultcount: (e.target.value!==""&&e.target.value>0)?e.target.value:this.state.orimaxShowresultcount})
    }

    toggleResponseModal = () => {
        this.setState({ isShowResponseModal: !this.state.isShowResponseModal });
    }

    render() {
        var cpcount = (this.state.sobj.maxResult ? this.state.sobj.maxResult : this.state.defaultPageCount);
        var ptotalresults = (this.state.totalresults?this.state.totalresults:0);
        var pstartcount = (this.state.currentPage > 1?((cpcount * (this.state.currentPage - 1))):1);
        var pendcount = (ptotalresults > (cpcount * this.state.currentPage)?((cpcount * this.state.currentPage)):ptotalresults);

        return (
            <Col className="newprods-view">
                {/* <Button variant="default" onClick={() => this.toggleResponseModal()}>test response</Button> */}
                <Col md={12} >
                        <NewProductsFilter 
                            maxShowresultcount={this.state.maxShowresultcount}
                            isdropdownopen={this.state.isdropdownopen}
                            isRTL={this.props.isRTL}
                            type={"newproducts"} 
                            supplierList={this.props.supplierList}
                            brandsList={this.props.brandsList}
                            tagList={this.props.tagList}
                            missingtypes={this.state.missingtypes}
                            DepartmetList={this.props.DepartmetList}
                            oriDeptList={this.props.oriDeptList}
                            categoryList={this.state.categoryList}
                            subCategoryList={this.state.subCategoryList}
                            subcategorylist={this.props.subcategorylist} 
                            brands={this.props.brands} 
                            searchObj = {this.state.sobj}   
                            changeFilters= {this.changeFilters} 
                            resetFilters={this.resetFilters}
                            triggerrSearch={this.triggerrSearch}
                            handleFilterSwitchChange={this.handleFilterSwitchChange}
                            toggleDepCatSubCatFilter={this.toggleDepCatSubCatFilter}
                            handleDiamentions={this.handleDiamentions}
                            handleFilterObjectdropdown={this.handleFilterObjectdropdown}
                            handleMissingSwitchChange={this.handleMissingSwitchChange}
                            handleTags={this.handleTags}
                            removeTag={this.removeTag}
                            changeDate={this.changeDate}
                            onToggleHandler={this.onToggleHandler}
                            handleShowingresults={this.handleShowingresults}
                        />
                </Col>

                <MultipleSelectList  t={this.props.t} viewtype="newProds"
                    EditProdEnable={this.props.EditProdEnable}
                    multiSelectList={this.props.multiSelectList}
                    multiSelectAction={this.multiSelectAction}
                    selectAllProds={this.selectAllProds} 
                    triggerAllAction={this.triggerAllAction}
                    updateMultiSelect={this.props.updateMultiSelect}
                    />

                <Col className={"list product-list "+(this.state.ftablebody.length === 0?"nores-avail":"")}>
                    {(this.state.isdataloaded && this.state.ftablebody && this.state.ftablebody.length > 0)?
                    <>
                        <Table hover>
                            <tbody>
                                {this.props.multiSelectList && this.props.multiSelectList.newProds?<>
                                    {this.state.ftablebody.map((prod, i) =>{
                                        let isRowSelected = this.props.multiSelectList.newProds.findIndex(nprod => nprod.productId === prod.productId);
                                        
                                        return <React.Fragment  key={i}>
                                            <tr>
                                                <td className="lefttd" style={{ width: this.props.EditProdEnable?"30%":"40%" }}> 
                                                    <label className='details icons-col' htmlFor={"newprod-rowselect-"+i}>
                                                        <Form.Check type="checkbox" name={"newprod-rowselect"} id={"newprod-rowselect-"+i}
                                                            checked={isRowSelected > -1} onChange={()=>this.toggleSelectTableRow(prod,i)}
                                                            />
                                                        <span>{(prod.completeStatus==="FullData" && prod.mpUsageStatus==="None" ?Icons.NewProdTick("color",20):Icons.NewProdX("color",20))}</span>
                                                        <OverlayTrigger placement="bottom-start" overlay={<Tooltip>{prod.productName}</Tooltip>}>
                                                            <span className='cell-txt' style={this.props.isRTL === "rtl"?{paddingRight:"6px"}:{paddingLeft:"6px"}}>{prod.productName}</span>
                                                        </OverlayTrigger>
                                                    </label>
                                                </td>
                                                <td><Col className='details'>{prod.barcode}</Col></td>
                                                <td><Col className='details'>{prod.completeStatus==="FullData"?this.props.t("FULL_DATA"):prod.completeStatus==="DataMissig"?this.props.t("DATA_MISSING"):this.props.t("CatelogImportLogTypes.Other")}</Col></td>
                                                <td><Col className='details'><Button className="tablebtn archivebtn" onClick={()=>this.singleProdArchive(prod)}>{this.props.t("ARCHIVE")}</Button></Col></td>
                                                <td><Col className='details'><Button className="tablebtn" style={{background:"#F39C12"}} onClick={()=>this.clickEdit(prod)}>{this.props.t("EDIT")}</Button></Col></td>
                                                <td>
                                                    <Col className='details '>
                                                        {
                                                            (prod.completeStatus==="FullData" && prod.mpUsageStatus==="None") ?
                                                                <Button className={"tablebtn senddep "} onClick={()=>this.singleProdSendtoDep(prod)}>{this.props.t("SEND_TO_DEP")}</Button>
                                                            :
                                                                <Button className={"tablebtn senddep deactivate"}>{this.props.t("SEND_TO_DEP")}</Button>
                                                        }
                                                    </Col>
                                                </td>
                                            </tr>
                                            <tr className="bottom-row"><td colSpan="8"></td></tr>
                                        </React.Fragment>
                                    })}
                                </>:<></>}
                            </tbody>
                        </Table>
                    </>
                    :this.state.isdataloaded?<>
                        <AcNoDataView />
                    </>:<></>}
                </Col>

                {this.state.ftablebody.length > 0 ? <>
                    <Badge bg="light" className="filtertable-showttxt" style={{color:"#142a33"}}>
                        {this.props.isRTL===""?<>{this.props.t("results")} {ptotalresults} {this.props.t("of")} {pendcount} {this.props.t("to")} {pstartcount} {this.props.t("showing")}</>:<>{this.props.t("showing")} {pstartcount} {this.props.t("to")} {pendcount} {this.props.t("of")} {ptotalresults} {this.props.t("results")}</>}
                    </Badge>
                    <Pagination>
                        <Pagination.Item onClick={() => this.setPage(1, true)} disabled={(this.state.currentPage === 1 ? true : false)}><ChevronLeftIcon /><ChevronLeftIcon /></Pagination.Item>
                        <Pagination.Item onClick={() => this.setPage((this.state.currentPage - 1), true)} disabled={(this.state.currentPage === 1 ? true : false)}><ChevronLeftIcon /></Pagination.Item>
                        <label>{this.state.currentPage} / {(this.state.totalPages ? this.state.totalPages : 0)}</label>
                        <Pagination.Item onClick={() => this.setPage((this.state.currentPage + 1), true)} disabled={(this.state.currentPage === this.state.totalPages ? true : false)}><ChevronRightIcon /></Pagination.Item>
                        <Pagination.Item onClick={() => this.setPage(this.state.totalPages, true)} disabled={(this.state.currentPage === this.state.totalPages ? true : false)}><ChevronRightIcon /><ChevronRightIcon /></Pagination.Item>
                    </Pagination>

                </> : <></>}

                <AcViewModal showmodal={this.state.loading} message={this.props.t('PLEASE_WAIT')} />

                {this.state.isShowResponseModal?<ResponseProdsModal t={this.props.t} isRTL={this.props.isRTL} 
                    responseObj={this.state.responseObj} 
                    toggleResponseModal={this.toggleResponseModal}
                    />
                :<></>}
            </Col>
        )
    }
}

const mapDispatchToProps = dispatch => ({
    setNewProdCountAction:(payload) => dispatch(setNewProdCountAction(payload)),
});

export default withTranslation()(withRouter(connect(null,mapDispatchToProps)(NewProductView)));
