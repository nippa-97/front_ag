import React, { Component } from 'react';
import { Button, Col, Table, Pagination, Badge , Form } from 'react-bootstrap'; //
import { withTranslation } from 'react-i18next';
import { withRouter } from 'react-router-dom';
import NewProductsFilter from '../newProductsFilter/newProductsFilter';
import { ChevronLeftIcon, ChevronRightIcon } from '@primer/octicons-react';
import { confirmAlert } from 'react-confirm-alert';
import { connect } from 'react-redux';

import { submitSets } from '../../../UiComponents/SubmitSets';
import { submitCollection } from '../../../../_services/submit.service';
import { FindMaxResult, getPager, preventinputToString, preventinputotherthannumbers, restrictDecimalPoint } from '../../../../_services/common.service';
import { AcViewModal,AcNoDataView } from '../../../UiComponents/AcImports';
import { alertService } from '../../../../_services/alert.service';
import { MultipleSelectList, ResponseProdsModal } from '../newproductCommen';

import { setNewProdCountAction } from '../../../../actions/newProductCount/newProductCount_action';
import { MPProductMissingTypes, ProductSearchCritieriaTypes } from '../../../../enums/productsEnum';
// import { samplenewprods } from '../newprodSampledata';

import './archiveProductsView.css';

const separatecamelCaseWords=(str)=>{
    if(str){
        let txt = str.replace(/([a-z])([A-Z])/g, '$1 $2');
        return txt;
    }
    else{
        return "N/A";
    }
}

class ArchiveProductsView extends Component {
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
            ftablebody:[],
            pageItemsList:[],
            isdataloaded:false,

            missingtypes:[],
            categoryList:[{value:"-1", label:this.props.t("NONE")}],
            isdropdownopen:false,
            oneresultheight: 60, maxShowresultcount: 0, orimaxShowresultcount: 0, //find max result varibles

            restoreObj: this.defArchiveObj(),
            isShowResponseModal: false, responseObj: { responseType: "sendtodep", prods: [] },

        }
    }

    componentDidMount(){
        this._isMounted = true;
        if(this._isMounted){
          if(this.props.filterDataObj){
            let tsobj = JSON.parse(JSON.stringify(this.props.filterDataObj));
            tsobj.date = tsobj.date ? new Date(tsobj.date) : null;
            //tsobj.startIndex = 0;
            tsobj.isReqCount = true;
            
            let maxresutcount=FindMaxResult(this.props.whitecontainer.current?(this.props.whitecontainer.current.offsetHeight) : 0,this.state.oneresultheight,203)
            this.setState({sobj:tsobj, currentPage:(tsobj.currentPage ? tsobj.currentPage : 1), maxShowresultcount:((maxresutcount.maxresultCount>8)?maxresutcount.maxresultCount:8),orimaxShowresultcount:((maxresutcount.maxresultCount>8)?maxresutcount.maxresultCount:8)},()=>{
                this.handleTableSearch();    
            });
          }
          else{
            let maxresutcount=FindMaxResult(this.props.whitecontainer.current?(this.props.whitecontainer.current.offsetHeight) : 0,this.state.oneresultheight,203)
                
            this.setState({
                maxShowresultcount:((maxresutcount.maxresultCount>8)?maxresutcount.maxresultCount:8),orimaxShowresultcount:((maxresutcount.maxresultCount>8)?maxresutcount.maxresultCount:8)
            },()=>{
              this.handleTableSearch();
            })
          }
          this.setMissingtypes()
        }
    }

    defArchiveObj = () => {
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
    //get categories call
    getCategories = () => {
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
        });
    }

    getSubCategories = () => {
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

    changeFilters = (key, value, isnotreloading, isvalidate,msg,evt) => {
        let sobj = this.state.sobj;
        if(key === "freeSearchValue"){
            if(!preventinputToString(evt,evt.target.value,msg)){
                evt.preventDefault()
                return
              }
        }
        sobj[key] = value;
        
        this.setState({ sobj: sobj },() => {
            if(!isnotreloading && key !== "freeSearchValue"){
                this.props.setFilterData("archivedProductFilters", sobj);
                this.handleTableSearch(isvalidate);
            }
        });
    }

    triggerrSearch = () =>{
        this.props.setFilterData("archivedProductFilters", this.state.sobj);
        this.handleTableSearch();
    }

    resetFilters=()=>{
        this.setState({ sobj: this.props.defaultSearchObjLoad(), currentPage:1, missingtypes:[],},()=>{
            this.props.setFilterData("archivedProductFilters", this.props.defaultSearchObjLoad());
            this.setMissingtypes();
            this.handleTableSearch();

            this.props.updateDeptList(this.props.defaultSearchObjLoad());

            this.props.updateMultiSelect("archive", true, null);
        });
    }

    handleTableSearch = (isvalidate) =>{
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

                } else  */
                if((setfromdate && !settodate) || (!setfromdate && settodate) || (setfromdate && setfromdate !== "" && settodate && settodate !== "" && ctodate.getTime() < cfromdate.getTime())){
                    alertService.error(this.props.t("PLEASE_SET_VALID_DATE_RANGE"));
                    return false;
                } else{
                    csobj.moreFilter.createdDateRange["isHasSelectedDateRange"] = ((setfromdate && setfromdate !== "" && settodate && settodate !== "")?true:false);
                }
            // } 
            /* else if(csobj.moreFilter.searchDateType === FilterDateSearchTypes.dateCount && (!csobj.moreFilter.dateCount || csobj.moreFilter.dateCount <= 0)){
                alertService.error(this.props.t("PLEASE_SET_VALID_DATE_COUNT"));
                return false;
            } */
        }

        this.props.handleEditClose();

        this.setState({isdataloaded: false, loading: true,sobj:csobj,isdropdownopen:false},()=>{
            submitSets(submitCollection.searchMPProducts, this.state.sobj, true).then(res => {
                // var cdata = this.state.toridata;
                var cdata = [];
                if (res && res.status) {
                    var cpageidx = cdata.findIndex(x => x.page === this.state.startpage);
                    if (cpageidx > -1) {
                        cdata[cpageidx].data = res.extra;
                    } else {
                        cdata.push({ page: (this.state.startpage), data: res.extra });
                    }
                    this.setState({
                        isdataloaded: true, loading: false,
                        toridata: cdata,
                        totalresults: ((this.state.startpage === 1 || this.state.sobj.isReqCount) ? res.count : this.state.totalresults),
                        // totalresults: (res.count ? res.count : 0),
                    }, () => {
                        this.loadTableData();
                    });
    
                    //save filter obj
                    let filterobj = this.state.sobj;
                    filterobj.currentPage = this.state.currentPage;
                    filterobj.pagtotal = (res.extra ? res.extra.length : 0);
                    this.props.setFilterData("archivedProductFilters", filterobj);
    
                } else {
                    this.setState({
                        isdataloaded: true, loading: false,
                        toridata: cdata,
                    }, () => {
                        this.loadTableData();
                    });
                }
            });
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
            if (this.state.currentPage > 1) {
                this.setPage(this.state.currentPage, false);
            } else {
                this.setPage(1, false);
            }
        });
    }

    //page change
    handlePageChange = (cstartpage) => {
        var csobj = this.state.sobj;
        
        csobj["isReqCount"] = false;
        csobj.startIndex = ((cstartpage - 1) * this.state.sobj.maxResult);
        this.setState({ sobj: csobj, startpage: cstartpage, isdataloaded: false }, () => {
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

    singleProdRestore = (pobj) => {
        let restoreObj = this.state.restoreObj;

        let restoreprods = [];
        let isthisprodincludes = false;
        if(this.props.multiSelectList.archive && this.props.multiSelectList.archive.length > 0){
            for (let i = 0; i < this.props.multiSelectList.archive.length; i++) {
                const newproditem = this.props.multiSelectList.archive[i];
                restoreprods.push(newproditem.productId);

                if(newproditem.productId === pobj.productId){
                    isthisprodincludes = true;
                }
            }
        }

        if(!isthisprodincludes && restoreprods.length > 0){
            alertService.warn(this.props.t("SELECTED_PRODS_AVAILABLE"), 5000);
        }

        restoreObj["isSingleProdIncludes"] = (isthisprodincludes && restoreprods.length > 1);
        restoreObj.productIds = ((isthisprodincludes === true)?restoreprods:[pobj.productId]);
        restoreObj.singleprodIds = [pobj.productId];
        restoreObj.isEnableMultiple = isthisprodincludes;
        restoreObj.isSingleProd = !isthisprodincludes;

        this.restore(restoreObj);
    }

    restore = (restoreObj) =>{
        let btnlist = [];
        
        if(!restoreObj.isSingleProd && !restoreObj.isSingleProdIncludes){
            btnlist.push({
                label: this.props.t('multiselect.restoreAll'),
                onClick: () => {
                    this.continueRestore(restoreObj, true);
                }
            });
        }

        // if(restoreObj.isEnableMultiple || restoreObj.isSingleProd){
            let continuemsg = (restoreObj.isSingleProd && !restoreObj.isSingleProdIncludes?this.props.t('btnnames.yes'):(this.props.t('multiselect.restoreSelected')+(" ("+(restoreObj.productIds && restoreObj.productIds.length > 0?restoreObj.productIds.length:0)+")")));
            btnlist.push({
                label: continuemsg,
                onClick: () => {
                    this.continueRestore(restoreObj, false);
                }
            });    
        // }

        if(restoreObj.isSingleProdIncludes === true){
            let continuemsg = this.props.t('multiselect.onlythisprod');
            btnlist.push({
                label: continuemsg,
                onClick: () => {
                    this.continueRestore(restoreObj, false, true);
                }
            });  
        }

        //push close btn
        btnlist.push({
            label: (restoreObj.isSingleProd && !restoreObj.isSingleProdIncludes?this.props.t('btnnames.no'):this.props.t('btnnames.close')),
            onClick: () => {
                return false;
            }
        });

        let restoremsg = (restoreObj.isSingleProd && !restoreObj.isSingleProdIncludes?this.props.t("NEW_PROD_RESTORE_CONFIRM"):this.props.t("PRODS_RESTORE_CONFIRM"));
        confirmAlert({
            title: this.props.t("CONFIRM_TO_RESTORE"),
            message: restoremsg,
            overlayClassName: ("newprod-confirm"+(this.props.isRTL === "rtl" ? " alertrtl-content" : "")),
            buttons: btnlist
        });
    }

    continueRestore = (restoreObj, isAllItems, onlysingleprod) => {
        restoreObj.isUpdateAll = isAllItems;
        restoreObj.searchFilter = this.state.sobj;

        if(!isAllItems && (!restoreObj.productIds || restoreObj.productIds.length === 0)){
            alertService.error(this.props.t("NO_SELECTED_PRODUCTS"));
            return false;
        }
        
        if(onlysingleprod){
            restoreObj.isSingleProd = true;
            restoreObj.isEnableMultiple = false;
            restoreObj.productIds = restoreObj.singleprodIds;
        }

        this.setState({ loading:true});
        submitSets(submitCollection.restoreProduct, restoreObj, true, null, true).then(resp => {
            this.setState({ loading:false});
            if(resp && resp.status){
                alertService.success(this.props.t("succussfuly")+" " +this.props.t("saved"));
                this.loadNewProductsCounts();

                let serachobj = this.state.sobj;
                const stindx = serachobj.startIndex;
                const maxresult = serachobj.maxResult;
                serachobj.isReqCount = true;

                if(this.state.ftablebody.length===1 && this.state.startpage>1 ){
                    serachobj.startIndex = (stindx - maxresult);
                    this.setState({sobj:serachobj, restoreObj: this.defArchiveObj(), startpage:(this.state.startpage - 1),  currentPage:(this.state.currentPage - 1)},()=>{
                        this.handleTableSearch();
                    });
                }
                else{
                    this.setState({sobj: serachobj, restoreObj: this.defArchiveObj() },()=>{
                        this.handleTableSearch();
                    });
                }

                if(resp.extra && Array.isArray(resp.extra) && resp.extra.length > 0){
                    if(resp.extra.length === 1){
                        let firstitem = resp.extra[0];
                        if(firstitem.success){
                            alertService.success(this.props.t("succussfuly")+" "+firstitem.productName+" "+this.props.t("RESTORED"));
                        } else{
                            alertService.error(firstitem.response);
                        }
                    } else{
                        let respobj = { responseType: "restore", prods: resp.extra };
                        this.setState({ isShowResponseModal: true, responseObj: respobj });
                    }
                } else{
                    if(restoreObj.productIds.length > 5){
                        alertService.info(this.props.t("TAKESOMETIMETO_COMPLETE"));
                    }
                }

                this.props.updateMultiSelect("archive", true);
            }
            else{
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
    
    handleMissingSwitchChange=(item)=>{
        var csobj= this.state.sobj
        var cmissingtypes=this.state.missingtypes
        for (let i = 0; i < cmissingtypes.length; i++) {
            const mtype = cmissingtypes[i];
            if(mtype.enum===item.enum){
                mtype.isCheck=!item.isCheck
            }
        }
        //setting serch obj
        var missingtypes=[]
        cmissingtypes.forEach(element => {
            if(element.isCheck){
                missingtypes.push(element.enum)
            }
            
        });
        csobj.moreFilter.productMissingTypes=missingtypes

        this.setState({missingtypes:cmissingtypes,sobj:csobj})
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
        this.setState({sobj:cobj},()=>{
            
        })
    }

    changeDate = (key, value) => {
        let sobj = this.state.sobj;
        sobj[key] = value;
        this.setState({ sobj: sobj })
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

        this.setState({sobj:cobj}, () => {
            if(etype === "completeStatus" && evt.target.value !== "None"){
                this.setState({missingtypes: []},() => {
                    this.setMissingtypes(true);
                })
            }

            this.props.updateDeptList(cobj);
        });
    }

    onToggleHandler = (isOpen, e, metadata) => {
        // if  (metadata.source != 'select') {
        this.setState({isdropdownopen:isOpen})
        // }
    }
    //select table row
    toggleSelectTableRow = (prod, prodidx) => {
        this.props.updateMultiSelect("archive", false, [prod]);
    }
    //select all table rows
    selectAllProds = (isreset) => {
        if(isreset){
            this.props.updateMultiSelect("archive", true);
        } else{
            let addedlist = (this.props.multiSelectList && this.props.multiSelectList.archive?this.props.multiSelectList.archive:[]);
        
            let newaddlist = [];
            for (let i = 0; i < this.state.ftablebody.length; i++) {
                const proditem = this.state.ftablebody[i];
                
                let isalreadyadded = addedlist.findIndex(x => x.productId === proditem.productId);
                if(isalreadyadded === -1){
                    newaddlist.push(proditem);
                }
            }
    
            if(newaddlist.length > 0){
                this.props.updateMultiSelect("archive", false, newaddlist);
            }
        }
    }
    //trigger all action
    triggerAllAction = () => {
        //-1 = none, 1 = send to dep, 2 = archive, 3 = restore
        let actiontype = (this.props.multiSelectList && this.props.multiSelectList.allAction?parseInt(this.props.multiSelectList.allAction):0);
        
        if(actiontype > 0){
            if(this.props.multiSelectList.archive && this.props.multiSelectList.archive.length > 0){
                let caction = parseFloat(this.props.multiSelectList.allAction);

                if(caction === 3){ //restore
                    let crestoreobj = this.state.restoreObj;
                    let restoreprods = [];

                    for (let i = 0; i < this.props.multiSelectList.archive.length; i++) {
                        const newproditem = this.props.multiSelectList.archive[i];
                        restoreprods.push(newproditem.productId);
                    }

                    crestoreobj.isSingleProdIncludes = false;
                    crestoreobj.isEnableMultiple = false;
                    crestoreobj.isSingleProd = false;
                    crestoreobj.productIds = restoreprods;

                    if(restoreprods.length > 0){
                        crestoreobj.isEnableMultiple = true;
                    }

                    this.restore(crestoreobj);
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
                <Col md={12} >
                    <NewProductsFilter 
                        maxShowresultcount={this.state.maxShowresultcount}
                        isdropdownopen={this.state.isdropdownopen}
                        isRTL={this.props.isRTL}
                        supplierList={this.props.supplierList}
                        brandsList={this.props.brandsList}
                        type={"archivedproducts"} 
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

                <MultipleSelectList  t={this.props.t} viewtype="archive"
                    EditProdEnable={this.props.EditProdEnable}
                    multiSelectList={this.props.multiSelectList}
                    multiSelectAction={this.multiSelectAction}
                    selectAllProds={this.selectAllProds} 
                    triggerAllAction={this.triggerAllAction}
                    updateMultiSelect={this.props.updateMultiSelect}
                    />

                <Col className={"archive-list product-list "+(this.state.ftablebody.length === 0?"nores-avail":"")}>
                   
                    {(this.state.ftablebody.length > 0)?
                    <>
                        <Table hover>
                            <tbody>
                                {this.props.multiSelectList && this.props.multiSelectList.archive?<>
                                    {this.state.ftablebody.map((prod, i) =>{
                                        let isRowSelected = this.props.multiSelectList.archive.findIndex(nprod => nprod.productId === prod.productId);

                                        return <React.Fragment  key={i}>
                                            <tr>
                                                <td className="lefttd" style={{ width: this.props.EditProdEnable?"30%":"40%" }}>
                                                    <label className='details icons-col' htmlFor={"newprod-rowselect-"+i}>
                                                        <Form.Check type="checkbox" name={"newprod-rowselect"} id={"newprod-rowselect-"+i}
                                                            checked={isRowSelected > -1} onChange={()=>this.toggleSelectTableRow(prod,i)}
                                                            />
                                                        <span style={{paddingLeft:"6px"}}>{prod.productName}</span>
                                                    </label>
                                                </td>
                                                <td><Col className='details'>{prod.barcode}</Col></td>
                                                <td><Col className='details'>{prod.completeStatus==="DataMissig"?separatecamelCaseWords("DataMissing") :separatecamelCaseWords(prod.completeStatus)}</Col></td>
                                            
                                                <td><Col className='details'><Button className="tablebtn" style={{background:"#F39C12"}} onClick={()=>this.singleProdRestore(prod)}>{this.props.t("btnnames.restore")}</Button></Col></td>

                                            </tr>
                                            <tr className="bottom-row"><td colSpan="8"></td></tr></React.Fragment>
                                        })
                                    }
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
        );
    }
}

const mapDispatchToProps = dispatch => ({
    setNewProdCountAction:(payload) => dispatch(setNewProdCountAction(payload)),
});

//export default  withTranslation()(withRouter(ArchiveProductsView));
export default withTranslation()(withRouter(connect(null,mapDispatchToProps)(ArchiveProductsView)));