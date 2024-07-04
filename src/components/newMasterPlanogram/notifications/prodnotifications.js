import React from 'react';
import { withRouter } from 'react-router-dom';
import { Button, ButtonGroup, Col, Dropdown, Form } from 'react-bootstrap';
import FeatherIcon from 'feather-icons-react';
import DatePicker from 'react-datepicker';
import { withTranslation } from 'react-i18next';
import Select from 'react-select';
import Switch from "react-switch";
import { confirmAlert } from 'react-confirm-alert';
import moment from 'moment';

import { PopoverWrapper, TooltipWrapper } from '../AddMethods';
import { ArigoRobotIcon,SortASCIcon, SortDESCIcon } from '../../../assets/icons/icons';
import { alertService } from '../../../_services/alert.service';
import PreviewImage from '../../common_layouts/image_preview/imagePreview';
import { submitCollection } from '../../../_services/submit.service';
import { submitSets } from '../../UiComponents/SubmitSets';
import { FindMaxResult, getPager, preventNumberInput, preventinputToString } from '../../../_services/common.service';
import { AcViewModal,AcNoDataView } from '../../UiComponents/AcImports';
// import { ExpandDropDown, SingleProdLineChart } from './additionalcontents';

import './prodnotifications.css';

// import { sampleAristoNotifications } from './samplecontents';
// import AristoMapViewComponent from './mapcontents/mapcontents';
import SingleNotificationComponent from './singlenotification';

// import { samplenotifications } from '../auisidebar/newproducts/sampledata';


/**
 * 
 * @class ProdNotificationsComponent
 * @extends {React.Component}
 */
class ProdNotificationsComponent extends React.Component{
    constructor(props){
        super(props);

        this._ismounted = false;
        this.whitecontainer = React.createRef();

        this.state = {
            sobj: this.defaultSearchObj(false),
            notificationsList: [], totalProdCount: 0, totalLoadedCount: 0,
            oneResultHeight: 200,
            loadedPages: [], totalPages: 0, currentPage: 1, pagerDetails: null, isBottomDataAdd: true,
            isDataLoading: false,
            allDepartment:[], allCatList: [], allSubCatsList: [], allBrandsList: [],
            isShowLoadingModal: false,
            isFiltersShow: false, isSortShow: false,

            showPreviewImageModal: false, productId: 0,

            viewTab: "PRODUCT",
        }
    }
      
    componentDidMount() {
        this._ismounted = true;

        if(this._ismounted){
            this.loadAllDepartment();
            this.loadAllBrands();

            this.setState({
                sobj: this.defaultSearchObj(true),
                // notificationsList: samplenotifications
            }, () => {
                this.loadFilterData(true);
            });
        }
    }
    
    componentWillUnmount() {
        this._ismounted = false;
    }

    defaultSearchObj = (isCalcCount) => {
        let defMaxResults = 10;
        if(isCalcCount){
            let checkMaxCounts = FindMaxResult((this.whitecontainer.current?this.whitecontainer.current.offsetHeight:0), this.state.oneResultHeight, 150);
            // console.log(checkMaxCounts); 
            defMaxResults = (checkMaxCounts && checkMaxCounts.maxresultCount > defMaxResults?checkMaxCounts.maxresultCount:defMaxResults);
        }
       
        return { 
            searchBy: "", 
            filterBy: { 
                departmentId: -1,
                categoryId: -1, 
                subcategoryId: -1,
                brandId: -1, 
                creationFromDate: "", 
                creationToDate: "",
                calculationBy: "profit",
                calculationType: false,
                prodTestType: "NONE",
                dateFilterBy:""
            },
            sortBy: { 
                category: false,
                subCategory: false,
                brand: false,
                creationDate: false,
                orderType: "NONE"
            },
            isSort: false,
            isReqPagination: true,
            maxResult: defMaxResults,
            startIndex: 0,
            isOngoingProducts: false,
            moreFiltersAvl: false,
            moreSortAvl: false,
        };
    }

    handleImagePreviewModal = (obj,type) =>{
        this.setState({productId:(obj?obj.productId:0), showPreviewImageModal:type});
    }

     //load all brands
    loadAllDepartment = () => {
        submitSets(submitCollection.getDepartmentList,true).then(res => {
            if(res && res.status){
                
                let department = res.extra; 
                let tempdepartments = [{value : -1, label: this.props.t("any_department")}];
                for (let i = 0; i < department.length; i++) {
                    tempdepartments.push({value :department[i].departmentId, label:department[i].name, obj: department[i] });
                }

                this.setState({ allDepartment: tempdepartments }, () => {
                    this.loadAllCategories();
                    this.loadAllSubCats();
                });
            } 
        });
    }

    loadAllCategories = () => {
        let searchobj = this.state.sobj;
        var obj = { chainHasDepartmentId: searchobj.filterBy.departmentId, isReqPagination: false};
    
        submitSets(submitCollection.mpCategoryList, obj).then(resp => {
          if(resp && resp.status){
            let arr = [{value:-1, label: this.props.t("any_category")}];
            for (let i = 0; i < resp.extra.length; i++) {
                arr.push({
                  value: resp.extra[i].categoryId, 
                  label: resp.extra[i].categoryName,
                  obj: resp.extra[i]
                });
            }
            this.setState({ allCatList: arr });
          } 
        });
    }

    loadAllSubCats = () => {
        let searchobj = this.state.sobj;
        var obj = { 
            departmentId: searchobj.filterBy.departmentId, 
            depCategoryId: searchobj.filterBy.categoryId,
            isReqPagination: false
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

    //load all brands
    loadAllBrands = () => {
        let sobj = {isReqPagination:false }
        submitSets(submitCollection.findAllBrands, sobj).then(res => {
            if(res && res.status){
                let brnd = res.extra; 
                let tempbrands = [{value : -1, label: this.props.t("any_brand")}];
                for (let i = 0; i < brnd.length; i++) {
                    tempbrands.push({value :brnd[i].brandId, label:brnd[i].brandName, obj: brnd[i] });
                }

                this.setState({ allBrandsList: tempbrands });
            } 
        });
    }

    getScrollPosition = (e) => {
        if(this.state.totalProdCount > 0 && this.state.isDataLoading === false){
            var top = document.getElementById("newprodlist-scroll").scrollTop;
            var sheight = document.getElementById("newprodlist-scroll").scrollHeight;
            var position = (sheight - top);
            var clientHeight = e.target.clientHeight;
            position = Math.trunc((position - 1));
            
            //if bottom
            if(this.state.totalProdCount > this.state.notificationsList.length && position <= clientHeight){
                this.loadMoreProds(true);
            } 
            /* else if(top === 0){
                this.loadMoreProds(false);
            } */
        }
    }

    loadMoreProds = () => {
        let searchobj = JSON.parse(JSON.stringify(this.state.sobj));
        
        let curpage = JSON.parse(JSON.stringify(this.state.currentPage));
        let loadedpages = this.state.loadedPages;
        let isbottomadd = true;
        
        curpage = (loadedpages.length > 0?(loadedpages[(loadedpages.length - 1)].page + 1):1);
        searchobj.startIndex = (((curpage - 1) > 0?(curpage - 1):0) * searchobj.maxResult);

        // console.log("bottom", curpage);

        this.setState({ sobj: searchobj, currentPage: curpage, isBottomDataAdd: isbottomadd }, () => {
            this.loadFilterData(false, true);
        });  
    }

    loadFilterData = (isclearall, ispaginateloading) => {
        this.toggleLoadingModal(true, () => {
            this.setState({ isDataLoading: true }, () => {
                submitSets(submitCollection.findAristoNotificationProducts, this.state.sobj, true, null, true).then(res => {
                    let isbottomadd = JSON.parse(JSON.stringify(this.state.isBottomDataAdd));
                    // console.log(isbottomadd);

                    if(res && res.status){
                        let allprodlist = (isclearall?[]:this.state.notificationsList);

                        //temp - sample data for show
                        /* if(this.state.sobj.startIndex === 0){
                            let sampleNotifiData = sampleAristoNotifications;
                            //let notifiWithSamples = sampleAristoNotifications.concat((this.state.notificationsList && this.state.notificationsList.length > 0?this.state.notificationsList:[]));
                            allprodlist = sampleNotifiData;
                        } */

                        let notificationlist = (res.extra && res.extra.length > 0?res.extra:[]);
                        
                        let mergeprodlist = (!isbottomadd?notificationlist.concat(allprodlist):allprodlist.concat(notificationlist));

                        let showCurPage = this.state.currentPage;
                        showCurPage = (notificationlist.length === 0?(isbottomadd?((showCurPage - 1) > 0?(showCurPage - 1):showCurPage):(showCurPage + 1)):showCurPage);
                        
                        this.setState({
                            notificationsList: mergeprodlist,
                            totalProdCount: (isclearall?res.count:this.state.totalProdCount),
                            isBottomDataAdd: true,
                            currentPage: showCurPage
                        }, () => {
                            if(notificationlist.length > 0){
                                if(isclearall){
                                    this.setPager(this.state.currentPage, notificationlist, isbottomadd);
                                } else{
                                    this.updateLoadedPage(this.state.currentPage, notificationlist, isbottomadd);
                                }
                            }
                        });
                    } else{
                        if(isclearall){
                            this.setState({ notificationsList: [], totalProdCount: 0, isShowGrouping: false, newGroupList: [] });
                        }
                        // alertService.error(res.extra && res.extra !== null?res.extra:this.props.t("erroroccurred"));
                    }

                    this.setState({ isDataLoading: false }, () => {
                        if(ispaginateloading){
                            this.setScrollGapfromTopBottom(isbottomadd);
                        }
                    });
                    this.toggleLoadingModal(false);
                });      
            });
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

    handleFilterObject = (evt, ckey, ctype, msg, e) => {
        // console.log(evt);
        let prevsearch = JSON.parse(JSON.stringify(this.state.sobj));
        let searchobj = this.state.sobj;
        let isTriggerSearch = false;

        if(ckey === "searchBy"){
            if(!preventinputToString(e,e.target.value,msg)){
                e.preventDefault()
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

        if(ckey === "searchBy" || ckey === "isOngoingProducts" || ckey === "isSort"){
            searchobj[ckey] = evt;
        } else if(ckey === "departmentId" || ckey === "categoryId" || ckey === "subcategoryId" || ckey === "brandId" || ckey === "creationFromDate" || ckey === "creationToDate" || ckey === "calculationBy" || ckey === "calculationType" || ckey === "prodTestType"|| ckey === "dateFilterBy"){
            searchobj.filterBy[ckey] = (((ckey === "creationFromDate" || ckey === "creationToDate") && !evt)?"":evt);
            //reset catid, subcatid
            if(ckey === "departmentId"){
                searchobj.filterBy["categoryId"] = -1;
                searchobj.filterBy["subcategoryId"] = -1;
            }
            //reset subcatid
            if(ckey === "categoryId"){
                searchobj.filterBy["subcategoryId"] = -1;
            }

        } else if(ckey === "category" || ckey === "subCategory" || ckey === "brand" || ckey === "creationDate" || ckey === "orderType"){
            searchobj.sortBy[ckey] = evt;

            if(ckey !== "orderType" && ckey !== "groupOrder"){
                if(!searchobj.sortBy.category && !searchobj.sortBy.subCategory && !searchobj.sortBy.brand && !searchobj.sortBy.creationDate){
                    searchobj.sortBy.orderType = "NONE";
                } else{
                    searchobj.sortBy.orderType = "ASC";
                }
            }
        }

        if(ckey === "dateFilterBy"){
            if(evt === ""){
                searchobj.filterBy.creationFromDate = "";
                searchobj.filterBy.creationToDate = "";
            }
        }
        
        if(ckey === "creationFromDate" || ckey === "creationToDate" || ckey === "dateFilterBy"){
            if(searchobj.filterBy.creationFromDate !== "" && searchobj.filterBy.creationToDate !== ""){
                let cfromdate = new Date(searchobj.filterBy.creationFromDate);
                let ctodate = new Date(searchobj.filterBy.creationToDate);

                if(cfromdate.getTime() <= ctodate.getTime()){
                    isTriggerSearch = true;
                } else{
                    alertService.error(this.props.t("PLEASE_SET_VALID_DATE_RANGE"));
                }
                
            } else if(searchobj.filterBy.creationFromDate === "" && searchobj.filterBy.creationToDate === ""){
                isTriggerSearch = (ckey === "dateFilterBy" && evt === ""?true:false);
                
                if(ckey === "dateFilterBy" && evt !== ""){
                    alertService.info(this.props.t("DATEFILTER_DATE_RANGE_WARN"));
                }
            } else{
                if(ckey === "dateFilterBy" && evt !== "" && (searchobj.filterBy.creationFromDate !== "" || searchobj.filterBy.creationToDate !== "")){
                    alertService.info(this.props.t("DATEFILTER_DATE_RANGE_WARN"));
                }
            }
        }

        searchobj.startIndex = 0;
        // console.log(searchobj);

        //if more filters applied
        searchobj.moreFiltersAvl = false;
        if(searchobj.filterBy.departmentId > 0 || searchobj.filterBy.categoryId > 0 || searchobj.filterBy.subcategoryId > 0 || searchobj.filterBy.brandId > 0){
            searchobj.moreFiltersAvl = true;
        }

        //if sort options enabled
        searchobj.moreSortAvl = false;
        if(searchobj.sortBy.brand === true || searchobj.sortBy.category === true || searchobj.sortBy.subCategory === true || searchobj.sortBy.creationDate === true || searchobj.sortBy.orderType === true){
            searchobj.moreSortAvl = true;
        }

        this.setState({ 
            sobj: searchobj,
            loadedPages: [], totalPages: 0, currentPage: 1, pagerDetails: null, isBottomDataAdd: true,
        }, () => {
            if(ctype === "enter" || ctype === "click" || isTriggerSearch){
                if(ckey === "isOngoingProducts"){
                    this.setState({
                        notificationsList: [], totalProdCount: 0, totalLoadedCount: 0, isShowGrouping: false, newGroupList: [],
                        loadedPages: [], totalPages: 0, currentPage: 1, pagerDetails: null, isBottomDataAdd: true,
                    }, () => {
                        this.loadFilterData(true);
                    });
                } else{
                    this.loadFilterData(true);
                }
            }

            if(ckey === "departmentId" && searchobj.filterBy.departmentId !== prevsearch.filterBy.departmentId){
                this.loadAllCategories();
                this.loadAllSubCats();

            } else if(ckey === "categoryId"){
                this.loadAllSubCats();
            }
        });
    }
    
    toggleLoadingModal = (isshow, _callback) => {
        this.setState({ isShowLoadingModal: isshow }, () => {
            if(_callback){
                _callback();
            }
        });
    }

    resetSearch = (isnotresetall) => {
        let prevsearch = JSON.parse(JSON.stringify(this.state.sobj));

        this.setState({ 
            sobj: (isnotresetall?this.state.sobj:this.defaultSearchObj()), 
            totalProdCount: 0, totalLoadedCount: 0,
            loadedPages: [], totalPages: 0, currentPage: 1, pagerDetails: null, isBottomDataAdd: true,
        }, () => {
            if(!isnotresetall){
                if(prevsearch.filterBy.departmentId > 0){
                    this.loadAllCategories();
                }
                
                if(prevsearch.filterBy.departmentId > 0 || prevsearch.filterBy.categoryId > 0){
                    this.loadAllSubCats();
                }
            }

            this.loadFilterData(true);
        });
    }

    handleNewProdState = (prodstate, prodidx) => {
        // console.log(prodstate);
        var title = "";
        var confirmMsg = "";
        if(prodstate === "KEEP"){
            title=this.props.t("SURE_TO_KEEP");
            confirmMsg=this.props.t("ARE_YOU_SURE_TO_KEEP_THIS_PRODUCT");
        }else if(prodstate === "REMOVE"){
            title=this.props.t("SURE_TO_REMOVE");
            confirmMsg=this.props.t("ARE_YOU_SURE_TO_REMOVE_THIS_PRODUCT");
        }

        confirmAlert({
            title: title,
            message:confirmMsg,
            overlayClassName: (this.props.isRTL === "rtl" ? "alertrtl-content" : ""),
            buttons: [{
                label: this.props.t('btnnames.yes'),
                onClick: () => {   
                    this.handleNewProdStatecall(prodstate, prodidx);
                }
            }, {
                label: this.props.t('btnnames.no')
            }]
        });
    }
    handleNewProdStatecall=(prodstate, prodidx)=>{
        let allnotlist = this.state.notificationsList;
        let selectedprod = allnotlist[prodidx];

        let sobj = { productId: selectedprod.productId };
        var removeKeepPassMessage=""
        if(prodstate === "EXPAND"){
            sobj["extendPeriod"] = prodstate.expandTestCount;
        }
        if(prodstate === "REMOVE"){
            removeKeepPassMessage=this.props.t("PRODUCT_SUCCESSFULLY_REMOVED")
        }else if(prodstate === "KEEP"){
            removeKeepPassMessage=this.props.t("PRODUCT_SUCCESSFULLY_KEEP")
        }

        let urlobj = (prodstate === "KEEP"?submitCollection.keepTestProduct:prodstate === "REMOVE"?submitCollection.removeTestNewProduct:submitCollection.extendTestPeriod);
        submitSets(urlobj, sobj, false, null, true).then(res => {
            if(res && res.status){
                alertService.success(removeKeepPassMessage);
                //reload
                this.loadFilterData(true);
            } else{
                // alertService.error(res.extra && res.extra !== null?res.extra:this.props.t("erroroccurred"));
            }
        });
    }

    handleChangeItem = (cidx, ckey, cvalue) => {
        let allprodlist = this.state.notificationsList;
        
        let selproditem = allprodlist[cidx];
        selproditem[ckey] = cvalue;

        if(ckey === "isShowChart" && cvalue){

            selproditem["chartLoading"] = true;

            this.setState({ notificationsList : allprodlist},()=>{

                if(!selproditem.chartData){
    
                    let sobj = {
                        barcode: selproditem.barcode,
                        productId : selproditem.productId,
                        createdDate : selproditem.createdDate,
                        testEndDate : selproditem.testEndDate,
                        testPeriod : selproditem.testPeriod,
                        testStartDate : selproditem.testStartDate
                    }
    
                    submitSets(submitCollection.loadChartData, sobj).then(res => {
                        if(res && res.status){
                            selproditem["chartLoading"] = false;
                            selproditem["chartData"] = res.extra;
                               
                            this.setState({ notificationsList: allprodlist });
                        } else{
                            alertService.error(this.props.t("erroroccurred"));
                        }
                    });
    
                }else{
                    selproditem["chartLoading"] = false;
                    this.setState({ notificationsList: allprodlist });
                }

            })
        }else{
            this.setState({ notificationsList: allprodlist });
        }

    }

    handleTestStartToggle = (isclose, pidx) => {
        if(isclose){
            this.continueStartTest(isclose, pidx);
        } else{
            confirmAlert({
                title: this.props.t('TESTPERIOD_START'),
                message: (this.props.t('ARE_YOU_SURETO_CONTINUE_TESTPERIOD')),
                overlayClassName: (this.props.isRTL === "rtl" ? "alertrtl-content" : ""),
                buttons: [{
                    label: this.props.t('btnnames.yes'),
                    onClick: () => {   
                    this.continueStartTest(isclose, pidx);
                    }
                }, {
                    label: this.props.t('btnnames.no'),
                    onClick: () => {   
                        return false
                    }
                }]
            });
        }
    }

    continueStartTest = (isclose, pidx) => {
        let allnotlist = this.state.notificationsList;
        let selectedprod = allnotlist[pidx];

        let sobj = { productIds: [selectedprod.productId] };
        let urlobj = (isclose?null:submitCollection.updateManuallyTestStartDate);
        submitSets(urlobj, sobj, false, null, true).then(res => {
            if(res && res.status){
                alertService.success(this.props.t("TESTPERIOD_SUCCESSFULLY_UPDATED"));
                this.resetSearch(true);
                this.props.ongoingCount()
            } else{
                // alertService.error(res.extra && res.extra !== null?res.extra:this.props.t("erroroccurred"));
            }
        });
    }

    moreFiltersToggle = (isshow) => {
        this.setState({ isFiltersShow: isshow });
    }

    moreSortToggle = (isshow) => {
        this.setState({ isSortShow: isshow });
    }

    handleExpandDayCount=(idx,ctext)=>{
        var text=ctext>-1?ctext:0
        var notfiList=this.state.notificationsList
        var tempList = JSON.parse(JSON.stringify(this.state.notificationsList)) 
        notfiList[idx]["extendPeriod"]=text
        if(text && preventNumberInput(text,this.props.t('validation.NumberInputValidation'))){
            notfiList[idx]["extendPeriod"]=tempList[idx]["extendPeriod"]
        }
        this.setState({notificationsList:notfiList})
    }
    SendExpandDaysCall=(idx)=>{
        var selectedObj=this.state.notificationsList[idx]
        //console.log(selectedObj.extendPeriod);

        if(selectedObj.extendPeriod===""||selectedObj.extendPeriod===undefined){
            alertService.warn(this.props.t("ENTER_VALIDTESTPERIOD_VALUE"));
        }else{
            var sobj={
                "productId":selectedObj.productId,
                "extendPeriod":selectedObj.extendPeriod?parseInt(selectedObj.extendPeriod):0
            }
            let urlobj = submitCollection.extendTestPeriod;
            submitSets(urlobj, sobj, false, null, true).then(res => {
                if(res && res.status){
                    alertService.success(this.props.t("TESTPERIOD_SUCCESSFULLY_UPDATED"));
                    this.loadFilterData(true);
                } else{
                    // alertService.error(res.extra && res.extra !== null?res.extra:this.props.t("erroroccurred"));
                }
            });
        }
    }
    
    testCompleteDatesCount = (cobj, ispercentage) => {
        let datetxt = (ispercentage?0:"0/0");
        if(cobj.testStartDate && cobj.testPeriod > 0){

            // let tsdate = new Date(cobj.testStartDate);
            // let cdate = new Date();
            // let diffTime = Math.abs(cdate - tsdate);
            // let diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 

            let tsdate = moment(cobj.testStartDate);
            let cdate = moment();
            let diffDays = parseInt(moment.duration(cdate.diff(tsdate)).asDays());
            
            datetxt = (ispercentage?((diffDays / cobj.testPeriod) * 100):((diffDays > cobj.testPeriod?cobj.testPeriod:diffDays)+"/"+cobj.testPeriod));
        }

        return datetxt;
    }

    changeSinglePerView = (cidx, ctype) => {
        let allnotlist = this.state.notificationsList;
        
        let selnotitem = allnotlist[cidx];
        selnotitem["pssType"] = ctype;
        
        this.setState({ notificationsList: allnotlist });
    }

    toggleViewTab = (changetab) => {
        this.setState({ viewTab: changetab });
    }

    handleKeyDown = (event) => {
        if(!(/[0-9/]/.test(event.key) || parseInt(event.keyCode) === 8  || parseInt(event.keyCode) === 37 || parseInt(event.keyCode) === 39)){
            event.preventDefault();
        }
    }
    render(){
        let { sobj, allDepartment, allCatList, allSubCatsList, allBrandsList } = this.state;

        let allProdTestTypes=  [
            { value: "NONE", label: this.props.t("TESTTYPES.ANY") }, 
            { value: "PENDING", label: this.props.t("TESTTYPES.PENDING") },
            { value: "ONGOING", label: this.props.t("TESTTYPES.ONGOING") }, 
            { value: "EXPIRE", label: this.props.t("TESTTYPES.ENDED") },  
        ];

        let DateFilterTypes = [
            { value: "", label: this.props.t("NONE") }, 
            { value: "appliedDate", label: this.props.t("NEWPROD_START.appliedDate") },
            { value: "TaskDoneDate", label: this.props.t("NEWPROD_START.doneDate") }, 
            { value: "StartDate", label: this.props.t("FILTER_ITEMS.startdate") }, 
        ];

        return (<>
            <Col xs={12} className="main-content notificationlist-wrapper">
                <Col xs={12}>
                    <h2 className='prodnot-header'>{this.props.t("aristo")} <b>{this.props.t("notifications")}</b></h2>
                </Col>
                <Col xs={12} className="white-container notification-content aui-newprod-content">
                    {/* <Col className='tablist-list'>
                        <ul className='list-inline'>
                            <li className={'list-inline-item'+(viewTab === "PRODUCT"?' active':'')} onClick={() => this.toggleViewTab("PRODUCT")}>{this.props.t("products")}</li>
                            <li className={'list-inline-item'+(viewTab === "MAPPING"?' active':'')} onClick={() => this.toggleViewTab("MAPPING")}>{this.props.t("MAPPING")}</li>
                        </ul>
                    </Col> */}

                    {/* {viewTab === "PRODUCT"?<> */}
                        <Col className="custom-filters prod-search-list form-inline">
                            <span className='input-wrapper inline-search'>
                                <label className="filter-label">{this.props.t('FREE_SEARCH')}</label>
                                <FeatherIcon icon="search" size={18} />
                                <Form.Control placeholder={this.props.t('SEARCH_PROD_PLACEHOLDER')} value={sobj.searchBy} onChange={e => this.handleFilterObject(e.target.value, "searchBy", "change", this.props.t('Character.search_text'), e)} onKeyUp={e => (e.which ===13? this.handleFilterObject(e.target.value, "searchBy", "enter", this.props.t('Character.search_text'), e):null)} onKeyDown={(e)=>preventinputToString(e,e.target.value,(this.props.t('Character.search_text')))} />
                            </span>

                            <label className="filter-label">{this.props.t("FILTER_BY")}</label>
                            <span>
                            <small className='filtername-prodnot'>{this.props.t("status")}</small>
                                <Select placeholder={this.props.t("TESTTYPES.ANY")} options={allProdTestTypes}
                                    value={allProdTestTypes.filter(option => option.value === (sobj.filterBy.prodTestType?sobj.filterBy.prodTestType:null))} 
                                    onChange={(e) => this.handleFilterObject(e.value,"prodTestType","click")} 
                                    className="auinewprod-searchselect" size="sm" classNamePrefix="searchselect-inner" maxMenuHeight={180}    
                                />
                            </span>
                            <span >
                                <small className='filtername-prodnot'>{this.props.t("DateFilter")}</small>
                                <Select placeholder={this.props.t("NONE")} options={DateFilterTypes}
                                    value={DateFilterTypes.filter(option => option.value === (sobj.filterBy.dateFilterBy?sobj.filterBy.dateFilterBy:null))} 
                                    onChange={(e) => this.handleFilterObject(e.value,"dateFilterBy","change")} 
                                    className="auinewprod-searchselect" size="sm" classNamePrefix="searchselect-inner" maxMenuHeight={180}    
                                    />
                            </span>

                            {sobj.filterBy.dateFilterBy&&sobj.filterBy.dateFilterBy!==""?<>
                                <span className='input-wrapper'>
                                    <small className='filtername-prodnot'>{this.props.t("CATELOGUE_FILTERS.from")}</small>
                                    <FeatherIcon icon="calendar" size={18} />
                                    <DatePicker dateFormat="dd/MM/yyyy" placeholderText={"(DD/MM/YYYY)"} popperPlacement="bottom-start" showYearDropdown
                                        className="datepicker-txt" selected={(sobj.filterBy && sobj.filterBy.creationFromDate?new Date(sobj.filterBy.creationFromDate):null)}
                                        onChange={(e)=>this.handleFilterObject(e, "creationFromDate", "change")}
                                        onKeyDown={this.handleKeyDown}
                                        />    
                                </span>
                                <span className='input-wrapper'>
                                    <small className='filtername-prodnot'>{this.props.t("CATELOGUE_FILTERS.todate")}</small>
                                    <FeatherIcon icon="calendar" size={18} />
                                    <DatePicker dateFormat="dd/MM/yyyy" placeholderText={"(DD/MM/YYYY)"} popperPlacement="bottom-start" showYearDropdown
                                        className="datepicker-txt" selected={(sobj.filterBy && sobj.filterBy.creationToDate?new Date(sobj.filterBy.creationToDate):null)}
                                        onChange={(e)=>this.handleFilterObject(e, "creationToDate", "change")}
                                        onKeyDown={this.handleKeyDown}
                                        />    
                                </span>
                            </>:<></>}
                           

                            {/* <span className='input-wrapper switch-wrapper mainfilter-switch'>
                                <label className='switchtxt' style={{color:(this.props.dmode?'#2CC990':'#4F4F4F')}}>{this.props.t('IS_ONGOING')}
                                <Switch onChange={() => this.handleFilterObject(!this.state.sobj.isOngoingProducts, "isOngoingProducts", "click")} checked={this.state.sobj.isOngoingProducts} height={17} width={30} uncheckedIcon={true} checkedIcon={true}
                                handleDiameter={12} activeBoxShadow={"none"} className={"Scycleswitch"+(this.state.sobj.isOngoingProducts?" checked":"")} onColor={"#f2f1ff"} offColor={"#f2f1ff"} offHandleColor={"#C2BFBF"} onHandleColor={this.props.dmode?"#2CC990":"#5128A0"} />
                                </label>
                            </span> */}

                            <Dropdown className='morefilterbtn' show={this.state.isFiltersShow} onToggle={(isOpen) => this.moreFiltersToggle(isOpen)}>
                                <Dropdown.Toggle variant="outline-primary" size='sm'>
                                    {this.props.t("MORE_FILTERS")}
                                    {sobj.moreFiltersAvl === true?<div className='red-dot-more-filters'></div>:<></>}
                                </Dropdown.Toggle>

                                <Dropdown.Menu>
                                    <Col xs={12} className="form-subcontent">
                                        <Col xs={12} className="form-section">
                                            <small>{this.props.t("department")}</small>
                                            <Select placeholder={this.props.t("any_department")} options={allDepartment} 
                                                value={allDepartment.filter(option => option.value === (sobj.filterBy.departmentId?sobj.filterBy.departmentId:null))} 
                                                onChange={(e) => this.handleFilterObject(e.value,"departmentId","click")} 
                                                className="auinewprod-searchselect" size="sm" classNamePrefix="searchselect-inner" maxMenuHeight={180}    
                                                />

                                            <small>{this.props.t("category")}</small>
                                            <Select placeholder={this.props.t("any_category")} options={allCatList}
                                                value={allCatList.filter(option => option.value === (sobj.filterBy.categoryId?sobj.filterBy.categoryId:null))} 
                                                onChange={(e) => this.handleFilterObject(e.value,"categoryId","click")} 
                                                className="auinewprod-searchselect" size="sm" classNamePrefix="searchselect-inner" maxMenuHeight={180}    
                                                />

                                            <small>{this.props.t("subcategory")}</small>
                                            <Select placeholder={this.props.t("any_subcategory")} options={allSubCatsList}
                                                value={allSubCatsList.filter(option => option.value === (sobj.filterBy.subcategoryId?sobj.filterBy.subcategoryId:null))} 
                                                onChange={(e) => this.handleFilterObject(e.value,"subcategoryId","click")} 
                                                className="auinewprod-searchselect" size="sm" classNamePrefix="searchselect-inner" maxMenuHeight={180}    
                                                />

                                            <small>{this.props.t("FileImportErrorLogFilterTypes.Brand")}</small>
                                            <Select placeholder={this.props.t("any_brand")} options={allBrandsList}
                                                value={allBrandsList.filter(option => option.value === (sobj.filterBy.brandId?sobj.filterBy.brandId:null))} 
                                                onChange={(e) => this.handleFilterObject(e.value,"brandId","click")} 
                                                className="auinewprod-searchselect" size="sm" classNamePrefix="searchselect-inner" maxMenuHeight={180}    
                                                />
                                        </Col>
                                    </Col>
                                </Dropdown.Menu>
                            </Dropdown>

                            <Dropdown className='morefilterbtn sortby ' show={this.state.isSortShow} onToggle={(isOpen) => this.moreSortToggle(isOpen)}>
                                <Dropdown.Toggle variant="outline-primary" size='sm'>
                                    {this.props.t("SORT_BY")}
                                    {sobj.moreSortAvl === true?<div className='red-dot-more-filters'></div>:<></>}
                                </Dropdown.Toggle>

                                <Dropdown.Menu>
                                    <Col xs={12} className="form-subcontent">
                                        <Col xs={12} className="form-section">
                                            <span className='input-wrapper switch-wrapper'>
                                                <label className='switchtxt' style={{color:(this.props.dmode?'#2CC990':'#4F4F4F')}}>{this.props.t('category')}
                                                <Switch onChange={() => this.handleFilterObject(!sobj.sortBy.category, "category", "enter")} checked={sobj.sortBy.category} height={17} width={30} uncheckedIcon={true} checkedIcon={true}
                                                handleDiameter={12} activeBoxShadow={"none"} className={"Scycleswitch"+(sobj.sortBy.category?" checked":"")} onColor={"#f2f1ff"} offColor={"#f2f1ff"} offHandleColor={"#C2BFBF"} onHandleColor={this.props.dmode?"#2CC990":"#5128A0"} />
                                                </label>
                                            </span>

                                            <span className='input-wrapper switch-wrapper'>
                                                <label className='switchtxt' style={{color:(this.props.dmode?'#2CC990':'#4F4F4F')}}>{this.props.t('subcategory')}
                                                <Switch onChange={() => this.handleFilterObject(!sobj.sortBy.subCategory, "subCategory", "enter")} checked={sobj.sortBy.subCategory} height={17} width={30} uncheckedIcon={true} checkedIcon={true}
                                                handleDiameter={12} activeBoxShadow={"none"} className={"Scycleswitch"+(sobj.sortBy.subCategory?" checked":"")} onColor={"#f2f1ff"} offColor={"#f2f1ff"} offHandleColor={"#C2BFBF"} onHandleColor={this.props.dmode?"#2CC990":"#5128A0"} />
                                                </label>
                                            </span>

                                            <span className='input-wrapper switch-wrapper'>
                                                <label className='switchtxt' style={{color:(this.props.dmode?'#2CC990':'#4F4F4F')}}>{this.props.t('brand')}
                                                <Switch onChange={() => this.handleFilterObject(!sobj.sortBy.brand, "brand", "enter")} checked={sobj.sortBy.brand} height={17} width={30} uncheckedIcon={true} checkedIcon={true}
                                                handleDiameter={12} activeBoxShadow={"none"} className={"Scycleswitch"+(sobj.sortBy.brand?" checked":"")} onColor={"#f2f1ff"} offColor={"#f2f1ff"} offHandleColor={"#C2BFBF"} onHandleColor={this.props.dmode?"#2CC990":"#5128A0"} />
                                                </label>
                                            </span>

                                            <span className='input-wrapper switch-wrapper'>
                                                <label className='switchtxt' style={{color:(this.props.dmode?'#2CC990':'#4F4F4F')}}>{this.props.t('CREATED_DATE')}
                                                <Switch onChange={() => this.handleFilterObject(!sobj.sortBy.creationDate, "creationDate", "enter")} checked={sobj.sortBy.creationDate} height={17} width={30} uncheckedIcon={true} checkedIcon={true}
                                                handleDiameter={12} activeBoxShadow={"none"} className={"Scycleswitch"+(sobj.sortBy.creationDate?" checked":"")} onColor={"#f2f1ff"} offColor={"#f2f1ff"} offHandleColor={"#C2BFBF"} onHandleColor={this.props.dmode?"#2CC990":"#5128A0"} />
                                                </label>
                                            </span>
                                            
                                            <span className='input-wrapper switch-wrapper groupsort'>
                                                <label className='switchtxt' style={{color:(this.props.dmode?'#2CC990':'#4F4F4F')}}>{this.props.t('GROUP_SORT')}
                                                    <ButtonGroup className='aui-per-toggle sortasc-view' title=''>
                                                        <Button size='sm' onClick={()=>this.handleFilterObject("ASC", "orderType", "click")} active={sobj.sortBy.orderType === "ASC"} disabled={sobj.sortBy.orderType === "NONE"}><SortASCIcon size={16} /></Button>
                                                        <Button size='sm' onClick={()=>this.handleFilterObject("DESC", "orderType", "click")} active={sobj.sortBy.orderType === "DESC"} disabled={sobj.sortBy.orderType === "NONE"}><SortDESCIcon size={16} /></Button>
                                                    </ButtonGroup>
                                                </label>
                                            </span>
                                        </Col>
                                    </Col>
                                </Dropdown.Menu>
                            </Dropdown>

                            <Button variant='outline-secondary' onClick={() => this.resetSearch()} className='reset-link' size='sm'>{this.props.t("btnnames.reset")}</Button>
                    
                            {/* <ul className='list-inline togglenots-list'>
                                <li className='list-inline-item per-item'><Button variant='outline-primary' onClick={()=>this.handleFilterObject(!sobj.filterBy.calculationType, "calculationType", "click")} active={sobj.filterBy.calculationType} size='sm'>%</Button></li>
                                <li className='list-inline-item'>
                                    <ButtonGroup size='sm'>
                                        <Button variant='outline-secondary' onClick={()=>this.handleFilterObject("profit", "calculationBy", "click")} active={sobj.filterBy.calculationBy === "profit"}>{this.props.t("MP_CHART_TITLES.profit")}</Button>
                                        <Button variant='outline-secondary' onClick={()=>this.handleFilterObject("sales", "calculationBy", "click")} active={sobj.filterBy.calculationBy === "sales"}>{this.props.t("MP_CHART_TITLES.sales")}</Button>
                                    </ButtonGroup>
                                </li>
                            </ul> */}

                            <label className='totalcount-txt'>{this.props.t("TOTAL_COUNT")} {this.state.totalProdCount}</label>
                        </Col>
                        
                        <Col className='notification-list' ref={this.whitecontainer}>
                            <Col id="newprodlist-scroll" className='notifi-list' onScroll={(e) => this.getScrollPosition(e)}>
                                {this.state.notificationsList && this.state.notificationsList.length > 0?<>
                                    {this.state.notificationsList.map((pitem, pidx) => {
                                        return <React.Fragment key={pidx}>
                                        <SingleNotificationComponent t={this.props.t} isRTL={this.props.isRTL} dmode={this.props.dmode}
                                            sobj={this.state.sobj}
                                            pidx={pidx} pitem={pitem}
                                            copyToClipboard={this.copyToClipboard}
                                            changeSinglePerView={this.changeSinglePerView}
                                            handleChangeItem={this.handleChangeItem}
                                            handleExpandDayCount={this.handleExpandDayCount}
                                            handleNewProdState={this.handleNewProdState}
                                            handleImagePreviewModal={this.handleImagePreviewModal}
                                            handleTestStartToggle={this.handleTestStartToggle}
                                            SendExpandDaysCall={this.SendExpandDaysCall}
                                            testCompleteDatesCount={this.testCompleteDatesCount}
                                            />
                                        </React.Fragment>
                                    })}
                                </>:<>
                                    {!this.state.isDataLoading?<AcNoDataView />:<></>}
                                </>}

                                {/* {this.state.isDataLoading?<>
                                    <Col className="prodnots-loading"><img src={loadinggif} className="img-fluid" alt="loading animation"/></Col>
                                </>:<></>} */}
                            </Col>    
                        </Col>
                    {/* </>
                    :viewTab === "MAPPING"?<>
                        <AristoMapViewComponent t={this.props.t} dmode={this.props.dmode} />
                    </>:<></>} */}
                </Col>    
            </Col>

            <AcViewModal showmodal={this.state.isShowLoadingModal} />

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
        </>);
    }
}

export default withTranslation()(withRouter(ProdNotificationsComponent));