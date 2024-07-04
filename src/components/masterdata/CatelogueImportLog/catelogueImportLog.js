import { Component,createRef } from 'react';
import { connect } from 'react-redux';
import { Breadcrumb, Col, Row, Card, Button, Tab, Tabs, Form, Modal, Table  } from 'react-bootstrap';
import MDsidebarmenu from '../../common_layouts/mdsidebarmenu';
import { Link, withRouter } from 'react-router-dom';
import { withTranslation } from 'react-i18next';
import DatePicker from 'react-datepicker';
import { CalendarIcon, InfoIcon, XIcon } from '@primer/octicons-react';
import { AcNoDataView, AcTable, AcViewModal } from '../../UiComponents/AcImports';
import FileErrorLog from './fileErrorLog';
import { confirmAlert } from 'react-confirm-alert';
import FeatherIcon from 'feather-icons-react';
import CryptoJS from "crypto-js";

import { submitSets } from '../../UiComponents/SubmitSets';
import { submitCollection } from '../../../_services/submit.service';

import { viewSetAction } from '../../../actions/prod/prod_action';
import { viewDepSetAction } from '../../../actions/dept/dept_action';
import { viewSetChainDepAction } from '../../../actions/dept/dept_action';
import { setNavigationAction } from '../../../actions/navigate_actions/navigate_action';

import "./catelogueImportLog.scss";
import moment from 'moment';
import { alertService } from '../../../_services/alert.service';

import SubcategoryApprove from './newMappings/subCategoryApprove';
import BrandApprove from './newMappings/brandApprove';
import SupplierApprove from './newMappings/supplierApprove';
import UpdateData from './updateData';
import CompleteSummaryModal from './completeSummaryModal';
import { AddNewItemComponent } from '../../masterdata/products/AddNew/addnew';

import HierachyResolve from './hierachyResolve/hierachyResolve';
import { setCatelogimportCountAction } from '../../../actions/catelogueimportLog/cateloueImportLog_action';
import { FindMaxResult, maxInputLength, preventinputotherthannumbers } from '../../../_services/common.service';
import { Icons } from '../../../assets/icons/icons';
import imagePlaceholder from '../../../assets/img/icons/default_W100_100.jpg';
import loadinggif from '../../../assets/img/loading-sm.gif';
import { PopoverWrapper, TooltipWrapper } from '../../newMasterPlanogram/AddMethods';

const CatelogImportLogTypes = ["All","Department","Category","SubCategory","Brand","Supplier","Product","Other"];
const CatelogImportIssueTypes = ["PlanigoMapping", "NoIssue", "MappingIssue"];
const CatelogImportLogStatus  = ["All","ConfirmPending","NeedUserInput","PlanigoCompleted", "Other"];


export class CatelogueImport extends Component {
    _isMounted = false;
    constructor(props) {
        super(props);
        this.whitecontainer=createRef();
        this.state = {
            isdataloaded:true,
            isDataLoading:false,
            searchobj:this.defaultSearchObj(),
            toridata: [],
            ftablebody: [],
            startpage: 1, totalresults: 0,
            
            maindata:[],selectedItems:[],
            

            dashboardData:{
                allCount:0,
                confirmPending: 0,
                needUserInput: 0,
                planigoCompleted: 0,
                allCompleted: 0,
            },

            showFileErrorLog:false,
            fileErrorLogFIlters:null,
            selectAllSelected:false,

            //new mappings
            showSubcategoryApproveModal:false,
            showBrandApproveModal:false,
            showSupplierAppovalModal:false,
            departmentList: [], departmentIconsShowList: [],
            brandsList:[],
            //supplierList:[],
            mappingObj:null,

            //update data 
            showUpdateDataModal:false,
            updateObj:null,

            //complete summary modal
            showCompleteSumaryModal:false,
            sumObj:null,

            //hierachy resolve
            showHierachyModal:false,
            c_logId:-1, issueState:"",sellogobj:null,
            oneresultheight: 55, maxShowresultcount: 0, orimaxShowresultcount: 0, //find max result varibles

            //secure manual sync
            manualSyncSecureModal: false,
            // manualSyncCheckPw: "aac1eaffc21487c13735c470773da1c7",
            manualSyncPwTxt: "",

            //resolve prod pagination
            isShowResolveModal: false,
            selectedHeirachyIssue: null,
            resolveProdPagination: { 
                totalCount: 0, 
                startIndex: 0, 
                maxResults: 10,
                searchTxt: "", 
                products: [],
            },
            isResolvePaginating: false,

            //product edit
            productObject:null,
            showProductEditModal:false,
        }
    }

    componentDidMount(){
        this._isMounted = true;
        if(this._isMounted){
           this.initPage();
           this.loadAllDepartments(true);
        }
    }
    componentWillUnmount(){
        this._isMounted = false;
    }

    initPage = () =>{
        const queryParams = new URLSearchParams(window.location.search);
        const isSavedLog = queryParams.get('isSavedLog');
        if(isSavedLog==="true"){
            if(this.props.navigatedata){
                this.setState({searchobj:this.props.navigatedata.serch_filters},()=>{
                    this.handleTableSearch();
                    this.getDashboardData();
                    this.props.setNavigationAction(null);
                });
            }
            else{
                this.getDashboardData();
                this.handleTableSearch();
            }
        }
        else{
            this.getDashboardData();
            var maxresutcount=FindMaxResult(this.whitecontainer.current?(this.whitecontainer.current.offsetHeight) : 0,this.state.oneresultheight,170)               
            this.setState({
                maxShowresultcount:(maxresutcount.maxresultCount>8?maxresutcount.maxresultCount:8),orimaxShowresultcount:(maxresutcount.maxresultCount>8?maxresutcount.maxresultCount:8)
            },()=>{
                this.handleTableSearch();
            })
        }
    }

    getDashboardData = () =>{
        let sobj = JSON.parse(JSON.stringify(this.state.searchobj));;
        if(sobj.fromDate> sobj.toDate){
            alertService.warn("From date should be prior to End date");
            return false;
        }
        var fdate = moment(sobj.fromDate).format("YYYY-MM-DD");
        var todate = moment(sobj.toDate).format("YYYY-MM-DD");
        sobj.fromDate = fdate;
        sobj.toDate = todate;
        submitSets(submitCollection.getCatelogImportStatusLogStat,sobj, true).then(res => {
            if(res && res.status){
                if(res.extra){
                    this.setState({dashboardData:res.extra});
                }
            }
        });
    }

    defaultSearchObj = () =>{
        const now = new Date();
        var obj = {
            "fromDate":new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7),
            "toDate":new Date(),
            "logType": "All",
            "issueType": "",
            "logStatus": "All",
            "startIndex":0,
            "maxResult":8,
            "isReqPagination": true,
            "isReqCount":false,
        }
       
        return obj;
    }

    changeFilterValues = (type,value) =>{
        if(type!=="reset"){
            let sobj = this.state.searchobj;
            sobj[type] = value;
            this.setState({searchobj:sobj});
        }
        else{
            this.setState({searchobj:this.defaultSearchObj()},()=>{
                this.mainSearch();
            });
        }
    }

    changeDateFilterValues = (type,value) =>{
        let sobj = this.state.searchobj;
        if(type==="fromDate"){
            if(value > sobj.toDate && sobj.toDate!==null){
                sobj.fromDate= sobj.toDate;
                alertService.warn(this.props.t("FROM_DATE_SHOULD_BE_PRIOR_TO_END_DATE"));
            }
            else{
                sobj[type] = value;
            }
        }
        if(type==="toDate"){
            if(value<sobj.fromDate && sobj.fromDate!==null){
                sobj.toDate= sobj.fromDate;
                alertService.warn(this.props.t("FROM_DATE_SHOULD_BE_PRIOR_TO_END_DATE"));
            }
            else{
                sobj[type] = value;
            }
        }
        
        this.setState({searchobj:sobj});
    }

    mainSearch = () =>{
        var sobj = this.state.searchobj;
        sobj.startIndex = 0;
        this.setState({searchobj:sobj,startpage: 1,toridata:[],totalresults:0},()=>{
            this.handleTableSearch();
            this.getDashboardData();
        });
    }

    refreshCurrentPage = () =>{
        var sobj = this.state.searchobj;
        sobj.isReqCount = true;
        if(sobj.logType!=="All" || sobj.logStatus!=="All" || sobj.issueType!==""){
            const stindx = sobj.startIndex;
            const maxresult = sobj.maxResult;

            if(this.state.ftablebody.length===1 && this.state.startpage>1 ){
                sobj.startIndex = (stindx - maxresult);
                this.setState({searchobj:sobj, startpage:(this.state.startpage - 1)},()=>{
                    this.handleTableSearch(null,"click");
                    this.getDashboardData();
                });
            }
            else{
                this.setState({searchobj:sobj},()=>{
                    this.handleTableSearch(null,"click");
                    this.getDashboardData();
                });
            }
        }
        else{
            this.setState({searchobj:sobj},()=>{
                this.handleTableSearch();
                this.getDashboardData();
            });
        }
        
    }

    //filter search
    handleTableSearch = () => {
        var maxresutcount = this.state.maxShowresultcount;
        var sobj = JSON.parse(JSON.stringify(this.state.searchobj));
        
        if(sobj.fromDate> sobj.toDate){
            alertService.warn(this.props.t("FROM_DATE_SHOULD_BE_PRIOR_TO_END_DATE"));
            return false;
        }
        var fdate = moment(sobj.fromDate).format("YYYY-MM-DD");
        var todate = moment(sobj.toDate).format("YYYY-MM-DD");
        sobj.fromDate = fdate;
        sobj.toDate = todate;
        sobj.maxResult = maxresutcount;
        
        this.toggleLoadingModal();
        submitSets(submitCollection.getCatelogImportStatusLog, sobj, true).then(res => {//searchProds
            this.toggleLoadingModal();
            var cdata =[];//this.state.toridata;
            if(res && res.status){
                //
                let csearchobj = JSON.parse(JSON.stringify(this.state.searchobj));
                csearchobj.fromDate = new Date(csearchobj.fromDate);
                csearchobj.toDate = new Date(csearchobj.toDate);
                csearchobj.maxResult = maxresutcount;
                this.setState({searchobj:csearchobj});

                this.loadCatelogimportlogCounts()
                var cpageidx = cdata.findIndex(x => x.page === this.state.startpage);
                if(cpageidx > -1){
                    cdata[cpageidx].data = res.extra;
                } else{
                    cdata.push({page:(this.state.startpage),data:res.extra});
                }
                this.addToMainData(res.extra);
                this.setState({
                    isReqCount:false,
                    toridata: cdata,
                    totalresults: (this.state.startpage === 1 || sobj.isReqCount===true ? res.count:this.state.totalresults),
                }, () => {
                    this.loadTableData();
                });
            } else{
                this.setState({
                    toridata: cdata,
                }, () => {
                    this.loadTableData();
                });
            }
        });
    }
    //load catelog import count
    loadCatelogimportlogCounts = () =>{
        submitSets(submitCollection.getCatelogImportCount, null).then(res => {
            if(res && res.status===true && res.extra){
                this.props.setCatelogimportCountAction(res.extra);
            } else{
                this.props.setCatelogimportCountAction(0);
            }
          });
    }
    //load showing table data
    loadTableData = () => {
        var cdata = [];
        if(this.state.toridata && this.state.toridata.length > 0){
            var cfindList = this.state.toridata.find(x => x.page === this.state.startpage);

            if(cfindList){
                for (var i = 0; i < cfindList.data.length; i++) {
                    const citem = cfindList.data[i];
                    cdata.push({
                        0:citem.logId, 
                        // 1:{type:"checkbox", action: "check", isChecked:false},
                        1:(citem.logType?this.props.t("CatelogImportLogTypes."+citem.logType):""), 
                        2:(citem.issueType ? this.props.t("CatelogImportIssueTypes."+citem.issueType) : "-"), 
                        3:(citem.logStatus ? this.props.t("CatelogImportLogStatus."+citem.logStatus) : "-"), 
                        4:(citem.description ? citem.description : "-"), 
                        5:(citem.reportedDate ? citem.reportedDate : "-"), 
                    });
                }
            }

        }
        this.setState({ ftablebody: cdata }, () => {
            this.setState({isdataloaded: false},()=>{
                this.setState({isdataloaded:true});
            });
        });
    }

    addToMainData = (list) =>{
        let mlist = this.state.maindata;
        mlist = mlist.concat(list);
        this.setState({maindata:mlist});
    }

    //page change
    handlePageChange = (cstartpage) => {
        var cfindList = this.state.toridata.find(x => x.page === cstartpage);
        var csobj = this.state.searchobj;
        csobj.startIndex = ((cstartpage - 1) * this.state.searchobj.maxResult);

        this.setState({ searchobj: csobj, startpage: cstartpage, selectedItems:[] }, () => {
            if(cfindList){
                this.setState({ isdataloaded: true });
                this.loadTableData();
            } else{
                this.handleTableSearch();
            }
            this.setState({selectAllSelected:false});
        });
    }

    handleRowClick = (cidx,citem,caction) =>{
        if(caction==="check"){//checkbox change
            let tbodydata = this.state.ftablebody;
            tbodydata[cidx][1].isChecked = !tbodydata[cidx][1].isChecked;
            this.setState({ftablebody:tbodydata},()=>{
                this.checkAllSelected()
            });
        }else{//row click
            var cfindList = this.state.toridata.find(x => x.page === this.state.startpage);
            let selobj = null;
            if(cfindList){
                if(citem && citem[0] && citem[0] !== ""){
                    let finditem = cfindList.data.find(z => z.logId === citem[0]);
                    selobj = JSON.parse(JSON.stringify(finditem));
                } else{
                    selobj = JSON.parse(JSON.stringify(cfindList.data[cidx]));
                }
            }

            if(selobj){
                if(selobj.isNewItem){
                    if(selobj.referenceId){
                        if(selobj.logStatus==="ConfirmPending"){
                            this.initApproveMappingForNew(selobj);
                        }
                        else if(selobj.logStatus==="PlanigoCompleted"){
                            this.initSummaryModal(selobj);
                        }
                    }
                    else{
                        alertService.warn(this.props.t("REFERENCE_NOT_AVAILABLE"));
                    }
                }
                else{
                    if(selobj.referenceId){
                        if(selobj.issueType!=="MappingIssue"){
                            this.initUpdateDataSet(selobj);
                        }
                        else{
                            this.setState({c_logId:selobj.logId, issueState:selobj.logStatus, sellogobj:selobj}, ()=>{
                                this.toggleHierachyModal();
                            });
                        }
                    }
                    else{
                        alertService.warn(this.props.t("REFERENCE_NOT_AVAILABLE"));
                    }
                }
                //this.navigate(maindatalist[mindx]);
            }
        }
    }

    navigate = (cobj) =>{
        //console.log(cobj);
        if(cobj.logType === "Product"){
            this.setState({isDataLoading:true});
            submitSets(submitCollection.findProdByID, ('?productId='+3678), true).then(res => {
                this.setState({isDataLoading:false});
                if(res && res.status){
                    let pobj = res.extra;
                    pobj.subCategoryId = (pobj.subCategoryId ? pobj.subCategoryId : 0);
                    pobj.brandId = (pobj.brandId ? pobj.brandId : 0);

                    let navobj = {serch_filters:this.state.searchobj, main_type:"Product"}
                    this.props.setNavigationAction(navobj);
                    
                    this.props.setProdView(pobj);
                    //this.props.history.push('/products/details?isFromLog=true');
                } 
            });
        }
        else if(cobj.logType === "Department"){
            let dobj = {
                    color: "#383fff",
                    departmentIconId: 5,
                    departmentIconName: "DEP_MEAT",
                    departmentId: 48,
                    maxResult: 0,
                    name: "Wipes",
                    startIndex: 0,
            }
            let navobj = {serch_filters:this.state.searchobj, main_type:"Department"}
            this.props.setNavigationAction(navobj);

            this.props.setDunitView(dobj);
            //this.props.history.push("/departments/details?isFromLog=true");
        }
        else if(cobj.logType === "Brand"){
            let bobj = {
                "supplierId": 32,
                "brandId": 52,
                "brandName": "B - 01",
                "supplierName": "SUP - 01",
                "supplierCode": "SUP - 01",
                "color": "#1fea92"
            }
            let navobj = {serch_filters:this.state.searchobj, main_type:"Brand", main_obj:bobj}
            this.props.setNavigationAction(navobj);
            this.props.history.push("/brands?isFromLog=true");
        }
        else if(cobj.logType === "Supplier"){
            let sobj = {
                "supplierId": 11,
                "supplierCode": "Baking S01",
                "supplierName": "Baking S01",
                "color": "red"
            }
            let navobj = {serch_filters:this.state.searchobj, main_type:"Supplier", main_obj:sobj}
            this.props.setNavigationAction(navobj);
            //this.props.history.push("/suppliers?isFromLog=true");
        }
        else if(cobj.logType === "Category"){
            let dobj = {
                "categories": [],
                "isDelete": false,
                "isNew": false,
                "chainDepartmentId": 48,
                "departmentId": 48,
                "departmentName": "Wipes",
                "departmentColor": "#383fff",
                "displayName": ""
            }

            let catobj = {
                "subCategory": [],
                "isDelete": false,
                "isNew": false,
                "id": 67,
                "chainDepartmentId": 48,
                "categoryName": "ZA",
                "color": "red",
                "departmentId": 48
            }


            let navobj = {serch_filters:this.state.searchobj, main_type:"Category", main_obj:{category:catobj, subCategory:null}}
            this.props.setNavigationAction(navobj);
            this.props.setChainDepVew(dobj);
            //this.props.history.push("/chaindepartments/details?isFromLog=true");
        }
        else if(cobj.logType === "SubCategory"){
            let dobj = {
                "categories": [],
                "isDelete": false,
                "isNew": false,
                "chainDepartmentId": 48,
                "departmentId": 48,
                "departmentName": "Wipes",
                "departmentColor": "#383fff",
                "displayName": ""
            }

            let catobj = {
                "subCategory": [],
                "isDelete": false,
                "isNew": false,
                "id": 67,
                "chainDepartmentId": 48,
                "categoryName": "ZA",
                "color": "red",
                "departmentId": 48
            }

            let subcatobj = {
                "isDelete": false,
                "isNew": false,
                "subCategoryId": 142,
                "categoryId": 67,
                "subCategoryName": "AA",
                "color": "#999999"
            } 

            let navobj = {serch_filters:this.state.searchobj, main_type:"SubCategory", main_obj:{category:catobj, subCategory:subcatobj}}
            this.props.setNavigationAction(navobj);
            this.props.setChainDepVew(dobj);
            //this.props.history.push("/chaindepartments/details?isFromLog=true");
        }

        
    }

    checkAllSelected = () =>{
        let tbodydata = this.state.ftablebody;
        let selcount = 0;
        for (let i = 0; i < tbodydata.length; i++) {
            if(tbodydata[i][1].isChecked === true){
                ++selcount
            }
        }
        
        this.setState({selectAllSelected:(selcount>0 && this.state.ftablebody.length===selcount ? true : false)});
    }

    handleAllCheckboxes = (e) =>{
        let tbodydata = this.state.ftablebody;
        for (let i = 0; i < tbodydata.length; i++) {
            tbodydata[i][1].isChecked = e.target.checked;
        }
        this.setState({ftablebody:tbodydata, selectAllSelected:!this.state.selectAllSelected});
    }

    approveConfirm = () =>{
        let marked_arr = [];
        for (let i = 0; i < this.state.ftablebody.length; i++) {
            if(this.state.ftablebody[i][1].isChecked===true){
                marked_arr.push({logId:this.state.ftablebody[i][0]});
            }
        }

        if(marked_arr.length>0){
            confirmAlert({
                title: this.props.t("CONFIRM_TO_SUBMIT"),
                message: this.props.t("CATELOGUE_ARE_YOU_SURE_CONT_APPROVE_MSG"),
                overlayClassName: (this.props.isRTL === "rtl" ? "alertrtl-content" : ""),
                buttons: [{
                    label: this.props.t('btnnames.yes'),
                    onClick: () => {
                        this.approveSet(marked_arr);
                    }
                }, {
                    label: this.props.t('btnnames.no'),
                    onClick: () => {
                        return false;
                    }
                }]
            });
        }
        else{
            alertService.warn(this.props.t("CATELOGUE_ERR_MARK_ITEMS"));
        }
    }

    approveSet = (list) =>{
        this.setState({isDataLoading:true});
        submitSets(submitCollection.markAsApprovedErrorLog, list, true).then(res => {
            this.setState({isDataLoading:false});
            if(res && res.status){
               alertService.success(this.props.t("SUCCESSFULLY_APPROVED"));
               this.mainSearch();
            } else{
               alertService.error(this.props.t("ERROR_OCCURRED"));
            }
        });
        
    }

    //manual trigger pw confirm modal toggle
    clickManualTrigger = () => {
        this.toggleSecureManualSync();
    }

    toggleSecureManualSync = () => {
        this.setState({ manualSyncSecureModal: !this.state.manualSyncSecureModal });
    }

    continueManualTrigger = () =>{
        confirmAlert({
            title: this.props.t("CONFIRM_TO_SUBMIT"),
            message: this.props.t("CATELOGUE_SYNC_MSG"),
            overlayClassName: (this.props.isRTL === "rtl" ? "alertrtl-content" : ""),
            buttons: [{
                label: this.props.t('btnnames.yes'),
                onClick: () => {
                    this.setState({isDataLoading:true});
                    submitSets(submitCollection.pickAndImportProductCatelogFiles).then(res => {
                        this.setState({isDataLoading:false});
                        if(res && res.status){
                           alertService.success(this.props.t("SUCCESSFULLY_SYNCED"));
                           this.mainSearch();
                           this.setState({showFileErrorLog:false},()=>{this.setState({showFileErrorLog:true})})
                        } else{
                           alertService.error(this.props.t("ERROR_OCCURRED"));
                        }
                    });
                }
            }, {
                label: this.props.t('btnnames.no'),
                onClick: () => {
                    return false;
                }
            }]
        });
    }

    //mapping approvals
    loadAllDepartments = (loadicons) =>{
        let sobj = {isReqPagination: false, departmentName: "", isIgnoreHide: false}
        this.setState({departmentList:[]});
        submitSets(submitCollection.searchDepatments, sobj, true).then(res => {
            if(res && res.status && res.extra){
                let temarr = [];
                for (let i = 0; i < res.extra.length; i++) {
                    temarr.push({value:res.extra[i].departmentId, label:res.extra[i].name});
                }
                this.setState({departmentList:temarr});
                if(loadicons === true){this.getDepartmentIcons()}
            }
            this.loadBrands();
        });
    }

    setDepartmentsList = (dlist) =>{
        this.setState({departmentList:dlist});
    }

    updateAllDepartments = (newdeptobj) => {
        let calldepts = this.state.departmentList;
        calldepts.push({value:newdeptobj.departmentId, label:newdeptobj.name});

        this.setState({ departmentList: calldepts });
    }

    getDepartmentIcons = () =>{
        submitSets(submitCollection.getDepartmentIcons, null,null).then(res => {
            if(res && res.status){
               this.setState({departmentIconsShowList:res.extra});
            } 
        });
    }

    loadBrands = () =>{
        let sobj = {isReqPagination:false}
        this.setState({brandsList:[]});
        submitSets(submitCollection.searchBrand, sobj, true).then(res => {
            if(res && res.status && res.extra){
                let temarr = [];
                for (let i = 0; i < res.extra.length; i++) {
                   temarr.push({value:res.extra[i].brandId, label:res.extra[i].brandName});
                }
                this.setState({brandsList:temarr});

            }
        });
    }

    initApproveMappingForNew = (cobj) =>{
        if(cobj.logType === "SubCategory"){
            let mobj = cobj.subCatAppprove;
            mobj.catelogId = cobj.logId;
            this.setState({mappingObj:mobj},()=>{
                this.toggleApproveModals("showSubcategoryApproveModal",true);
            });
        }
        else if(cobj.logType === "Brand"){
            let mobj = cobj.brandApprove;
            mobj.catelogId = cobj.logId;
            mobj.isNewBrand = true;
            mobj.brandId = -1;
            this.setState({mappingObj:mobj},()=>{
                this.toggleApproveModals("showBrandApproveModal",true);
            })
        }
        else if(cobj.logType === "Supplier"){
            let mobj = cobj.supplierApprove;
            mobj.catelogId = cobj.logId;
            mobj.isNewSupplier = true;
            mobj.supplierId = -1;
            this.setState({mappingObj:mobj},()=>{
                this.toggleApproveModals("showSupplierAppovalModal",true);
            });
        }
    }

    initSummaryModal = (cobj) =>{
        if(cobj.logType === "SubCategory"){
            let mobj = cobj;
            this.setState({sumObj:mobj},()=>{
                this.toggleSummaryModal();
            });
        }
        else if(cobj.logType === "Brand"){
            let mobj = cobj;
            this.setState({sumObj:mobj},()=>{
                this.toggleSummaryModal();
            })
        }
        else if(cobj.logType === "Supplier"){
            let mobj = cobj;
            this.setState({sumObj:mobj},()=>{
                this.toggleSummaryModal();
            });
        }
    }

    toggleSummaryModal = ()=>{
        this.setState({showCompleteSumaryModal:!this.state.showCompleteSumaryModal});
    }

    initUpdateDataSet = (cobj) =>{
        this.setState({updateObj:cobj},()=>{
            this.toggleUpdateDataModal();
        });
    }

    toggleApproveModals = (type,show) =>{
        this.setState({[type]: show});
    }
    
    toggleUpdateDataModal = () =>{
        this.setState({showUpdateDataModal:!this.state.showUpdateDataModal});
    }

    toggleLoadingModal = (isshow, _callback)=>{
        this.setState({isDataLoading: !this.state.isDataLoading}, () => {
            if(_callback){
                _callback();
            }
        });
    }

    tabToggle = (type) =>{
        if(type==="cat_log"){
            this.mainSearch();
        }
        else{
            this.setState({showFileErrorLog:false},()=>{
                this.setState({showFileErrorLog:true});
            });
        }

    }

    setFileErrorLogFilters = (fobj) =>{
        this.setState({fileErrorLogFIlters:fobj});
    }

    toggleHierachyModal = () =>{
        this.setState({showHierachyModal: !this.state.showHierachyModal});
    }

    handleShowingresults=(e, isonblur)=>{
        if(isonblur===true){
            this.setState({maxShowresultcount: (e.target.value!=="" && e.target.value>0)?e.target.value:this.state.orimaxShowresultcount})
        }
        else{
            this.setState({maxShowresultcount: e.target.value})
        }
    }

    //onchange manual sync txt
    changeSecureTxt = (e) => {
        this.setState({ manualSyncPwTxt: e });
    } 

    //manualsync secure continue
    handleSecureManualSync = () => {
        let checkpw = this.props.globsettingobj?.password;;
        let ctxt = CryptoJS.MD5(this.state.manualSyncPwTxt).toString();

        if(checkpw === ctxt){
            this.toggleSecureManualSync();
            this.continueManualTrigger();
        } else{
            alertService.error(this.props.t("invalid_pw"));
        }

        this.changeSecureTxt("");
    }
    
    handleKeyDown = (event) => {
        if(!(/[0-9/]/.test(event.key) || parseInt(event.keyCode) === 8  || parseInt(event.keyCode) === 37 || parseInt(event.keyCode) === 39)){
            event.preventDefault();
        }
    }

    findProductData = (item) =>{
        this.toggleLoadingModal(true, () => {
            submitSets(submitCollection.findProdByID, ('?productId='+item.productId), true).then(res => {
                if(res && res.status){
                    let pobj = res.extra;

                    this.setState({productObject:{ prodDetails: pobj }},() => {
                        this.setState({showProductEditModal:true});
                    });

                } else{
                    alertService.error((res&&res.msg?res.msg:res&&res.extra?res.extra:this.props.t('ERROR_OCCURRED')));
                }

                this.toggleLoadingModal(false);
            });
        });
    }

    toggleProductEditModal = (type) =>{
        this.setState({ showProductEditModal: !this.state.showProductEditModal }, () => {
            if(type !== false && this.state.isShowResolveModal){
                this.resetResolveSearch(() => {
                    this.loadResolveProds(true);      
                });
            }
        });
    }

    selectAllToggle = (isselectall) => {
        let resolveProdPagination = this.state.resolveProdPagination;

        for (let i = 0; i < resolveProdPagination.products.length; i++) {
            const resolveobj = resolveProdPagination.products[i];
            
            if(resolveobj.canSendToDep){
                resolveobj.isSelected = isselectall;
            } else{
                resolveobj.isSelected = false;
            }
        }

        this.setState({ resolveProdPagination: resolveProdPagination });
    }

    toggleProdCheck = (xidx) => {
        let resolveProdPagination = this.state.resolveProdPagination;
        
        let selectedProd = resolveProdPagination.products[xidx];
        
        if(selectedProd.canSendToDep){
            selectedProd.isSelected = !selectedProd.isSelected;
        } else{
            selectedProd.isSelected = false;
        }

        this.setState({ resolveProdPagination: resolveProdPagination });
    }

    toggleResolveModal = (isshow) => {
        this.setState({ isShowResolveModal: isshow });
    }

    getResScrollPosition = (e) => {
        let resolveProdPagination = this.state.resolveProdPagination;
        
        if(this.state.isResolvePaginating === false && resolveProdPagination.products.length < resolveProdPagination.totalCount){
            var top = document.getElementById("uploadres-scrollcontent").scrollTop;
            var sheight = document.getElementById("uploadres-scrollcontent").scrollHeight;
            var position = (sheight - top);
            var clientHeight = e.target.clientHeight;
            position = Math.trunc((position - 1));
            
            if(position <= clientHeight ){
                resolveProdPagination.startIndex = (resolveProdPagination.startIndex + resolveProdPagination.maxResults);
                
                this.setState({ resolveProdPagination: resolveProdPagination },()=>{
                    this.loadResolveProds();
                });
            }
        }
    }

    sendToDepAll = (isrefresh) => {
        let resolveProdPagination = this.state.resolveProdPagination;
        let selectedProds = resolveProdPagination.products.filter(x => x.isSelected).map(x => { return x.productId });

        if(selectedProds.length > 0){
            this.sendToDep(selectedProds, isrefresh);
        } else{
            alertService.error(this.props.t("NO_SELECTED_PRODUCTS"));
        }
    }

    resetResolveSearch = (_callback, issearch) => {
        let resolveProdPagination = this.state.resolveProdPagination;

        let resetobj = { 
            totalCount: 0, 
            startIndex: 0, 
            maxResults: 10,
            searchTxt: (issearch?resolveProdPagination.searchTxt:""), 
            products: [],
        }

        this.setState({ resolveProdPagination: resetobj },() => {
            if(_callback){
                _callback();
            }
        });
    }

    setHeirarchyIssue = (issueobj) => {
        this.setState({ selectedHeirachyIssue: issueobj }, () => {
            this.setState({ isdataloaded: false }, () => {
                setTimeout(() => {
                    this.loadResolveProds(true);      
                }, 1000);  
            });
        });
    }

    loadResolveProds = (isopen) => {
        let hierachyIssueObj = this.state.selectedHeirachyIssue;
        let resolveProdPagination = this.state.resolveProdPagination;

        let searchObj = {
            importHierarchyIssueId: -1,
            catelogueImportId: hierachyIssueObj.catelogueImportId,
            isReqCount: true,
            isReqPagination: true,
            maxResult: resolveProdPagination.maxResults,
            search: resolveProdPagination.searchTxt,
            startIndex: resolveProdPagination.startIndex,
            isNeedResolvedProducts: true
        }

        this.setState({ isdataloaded: false }, () => {
            submitSets(submitCollection.loadHierachyIssueProducts, searchObj, true).then(res => {
                if(res && res.status){
                    let pobj = res.extra;
                    
                    if(resolveProdPagination.startIndex === 0){
                        resolveProdPagination.totalCount = res.count;
                        resolveProdPagination.products = pobj;
                    } else{
                        resolveProdPagination.products = resolveProdPagination.products.concat(pobj);
                    }
    
                    this.setState({ resolveProdPagination: resolveProdPagination }, () => {
                        if(isopen && pobj.length > 0){
                            this.toggleResolveModal(true);
                        } else if(isopen){
                            this.toggleResolveModal(false);
                        }
                    });
                } else{
                    
                }
    
                this.setState({ isdataloaded: true });
            });
        });
    }

    //handle change search text
    handleSearchChange = (evt) => {
        let resolveProdPagination = this.state.resolveProdPagination;
        resolveProdPagination.searchTxt = evt.target.value;

        this.setState({ resolveProdPagination: resolveProdPagination });
    }   
    //handle enter search
    handleEnterSeach = (evt) => {
        if(evt.which === 13){
            this.resetResolveSearch(() => {
                this.loadResolveProds();
            }, true);
        }
    }

    sendToDep = (prodids, isrefresh) => {
        confirmAlert({
            title: this.props.t("CONFIRM_TO_SUBMIT"),
            message: this.props.t((isrefresh?"NEW_PROD_SENDTODEP_CONFIRM_REFRESH":"NEW_PROD_SENDTODEP_CONFIRM")),
            overlayClassName: (this.props.isRTL === "rtl" ? "alertrtl-content" : ""),
            buttons: [{
                label: this.props.t('btnnames.yes'),
                onClick: () => {
                    let sobj = {
                        isUpdateAll: false,
                        isSingleProd: false,
                        isEnableMultiple: true,
                        productIds: prodids
                    };

                    this.setState({ loading: true });
                    submitSets(submitCollection.sendProductToMP, sobj, true).then(resp => {
                        this.setState({ loading: false });

                        if(resp && resp.status){
                            alertService.success(this.props.t("SUCCESSFULLY_UPDATED"));
                            
                            this.mainSearch();
                            
                            this.resetResolveSearch(() => {
                                this.loadResolveProds(true);      
                            });
                        }
                        else{
                            alertService.error((resp&&resp.msg?resp.msg:resp&&resp.extra?resp.extra:this.props.t('ERROR_OCCURRED')));
                        }
                    });
                }
                
            }, {
                label: this.props.t('btnnames.no')
            }]
        });
    }

    render(){
        let { isShowResolveModal, resolveProdPagination, isResolvePaginating, showProductEditModal } = this.state;

        let canSendToDepResolveList = (resolveProdPagination && resolveProdPagination.products && resolveProdPagination.products.length > 0?
            resolveProdPagination.products.filter(x => x.canSendToDep):[]);
        
        const ftableheaders = ["",this.props.t('CATELOGUE_FILTERS.type'), this.props.t('CATELOGUE_FILTERS.issueType'), this.props.t('CATELOGUE_FILTERS.status'), this.props.t('CATELOGUE_FILTERS.colDetails'),this.props.t('CATELOGUE_FILTERS.dateReported')];
        return(
            <Col xs={12} className={"main-content mdatacontent-main catelogue-log "+(this.props.isRTL==="rtl"?"RTL":"LTR")} dir={this.props.isRTL}>
                <Row>
                    <MDsidebarmenu />
                    <Col xs={12} lg={10}>
                        <Breadcrumb dir="ltr">
                        {this.props.isRTL==="rtl"?<>
                            <Breadcrumb.Item active>{this.props.t('CATELOGUE_IMPORT')}</Breadcrumb.Item>
                            <li className="breadcrumb-item"><Link to={"/"+this.props.HomePageVal} role="button">{this.props.t('home')}</Link></li>
                            </>:<>
                                <li className="breadcrumb-item"><Link to={"/"+this.props.HomePageVal} role="button">{this.props.t('home')}</Link></li>
                                <Breadcrumb.Item active>{this.props.t('CATELOGUE_IMPORT')}</Breadcrumb.Item>
                            </>}
                        </Breadcrumb>
                        <Col className="white-container" ref={this.whitecontainer}>
                            <Button className='sync-btn' onClick={()=>this.clickManualTrigger()}>{this.props.t("MANUAL_TRIGGER")}</Button>
                            <Tabs defaultActiveKey="catelogueTab">
                                <Tab eventKey="catelogueTab" title={this.props.t("CATELOGUE_IMPORT")} onEntered={()=>this.tabToggle("cat_log")}>
                                    <Col xs={12} className="dashboard-section"> 
                                        <DashboardSection x={3} y={5} dashboardData={this.state.dashboardData} t={this.props.t} />
                                    </Col>
                                    <Col xs={12} className="filter-section">
                                        {/* <Button variant='outline-success' className='d-inline' onClick={()=>this.toggleHierachyModal()}> Open Hierachy</Button> */}
                                        <Filters handleKeyDown={this.handleKeyDown} maxShowresultcount={this.state.maxShowresultcount} searchobj={this.state.searchobj} changeFilterValues={this.changeFilterValues} changeDateFilterValues={this.changeDateFilterValues}  t={this.props.t} mainSearch={this.mainSearch} approveConfirm={this.approveConfirm} handleShowingresults={this.handleShowingresults} />
                                    </Col>
                                    <Col xs={12} className="body-section">
                                        {this.state.isdataloaded === true && this.state.ftablebody && this.state.ftablebody.length > 0 ?
                                            <Col xs={12} className="main-table-col catelog-log-main-table">
                                                {/* <ButtonGroup aria-label="Basic example" className='btn-action-group'>
                                                    <Button variant="outline-warning"><PencilIcon size={15}/></Button>
                                                    <Button variant="outline-success"><CheckCircleFillIcon size={15}/></Button>
                                                </ButtonGroup> */}
                                                {/* <input type="checkbox" className='form-check-input select-all-table-rows-chk' checked={this.state.selectAllSelected===true?"checked":""} onChange={(e)=>this.handleAllCheckboxes(e)} /> */}
                                                <AcTable isRTL={this.props.isRTL} t={this.props.t} aheaders={ftableheaders} totalresults={this.state.totalresults} startpage={this.state.startpage} alldata={this.state.toridata} asearchobj={this.state.searchobj} abody={this.state.ftablebody} showpaginate={true} pagetype="ajax" pagecount={this.state.searchobj.maxResult} handleRowClick={this.handleRowClick} handlePageChange={this.handlePageChange}   />
                                            </Col>
                                        :this.state.isdataloaded?<>
                                            <AcNoDataView />
                                        </>:<></>}

                                        {/* <Col xs={12} className={"no_recs_msg "+(this.state.isdataloaded===false?"d-none":"")}>{this.props.t("NO_RESULT_FOUND")}</Col> */}

                                        <AcViewModal showmodal={!this.state.isdataloaded} message={this.props.t('PLEASE_WAIT')} />
                                    </Col>
                                </Tab>

                                <Tab eventKey="fileErrorLog" className='fileErrorLog' title={this.props.t("FILE_ERROR_LOG")} onEntered={()=>this.tabToggle("file_error")}>
                                    {
                                        this.state.showFileErrorLog === true && this._isMounted===true?
                                            <FileErrorLog isRTL = {this.props.isRTL} setFileErrorLogFilters={this.setFileErrorLogFilters} fileErrorLogFIlters={this.state.fileErrorLogFIlters} whitecontainer={this.whitecontainer}/>
                                        :<></>
                                    }
                                </Tab>  
                            </Tabs>
                                    
                            {
                                this.state.showSubcategoryApproveModal === true ?
                                    <SubcategoryApprove 
                                        isRTL={this.props.isRTL} 
                                        showSubcategoryApproveModal={this.state.showSubcategoryApproveModal} 
                                        toggleApproveModals={this.toggleApproveModals}
                                        departmentList = {this.state.departmentList}   
                                        departmentIconsShowList = {this.state.departmentIconsShowList}
                                        loadAllDepartments = {this.loadAllDepartments} 
                                        mappingObj = {this.state.mappingObj}
                                        mainSearch = {this.refreshCurrentPage}
                                        toggleLoadingModal = {this.toggleLoadingModal}
                                    />
                                :<></>
                            }
                            

                            {
                                this.state.showBrandApproveModal === true ?
                                    <BrandApprove 
                                        isRTL={this.props.isRTL} 
                                        brandsList = {this.state.brandsList}
                                        // supplierList = {this.state.supplierList}
                                        showBrandApproveModal = {this.state.showBrandApproveModal}
                                        toggleApproveModals={this.toggleApproveModals}
                                        loadBrands = {this.loadBrands}
                                        // loadSuppliers = {this.loadSuppliers}
                                        mappingObj = {this.state.mappingObj}
                                        mainSearch = {this.refreshCurrentPage}
                                        toggleLoadingModal = {this.toggleLoadingModal}
                                    />
                                :<></>
                            }
                                

                            {
                                this.state.showSupplierAppovalModal === true ?
                                    <SupplierApprove
                                        isRTL={this.props.isRTL} 
                                        // supplierList = {this.state.supplierList}
                                        showSupplierAppovalModal = {this.state.showSupplierAppovalModal}
                                        toggleApproveModals={this.toggleApproveModals}
                                        // loadSuppliers = {this.loadSuppliers}
                                        mappingObj = {this.state.mappingObj}
                                        mainSearch = {this.refreshCurrentPage}
                                        toggleLoadingModal = {this.toggleLoadingModal}
                                    />
                                :<></>
                            }

                            {
                                this.state.showUpdateDataModal === true ?
                                    <UpdateData 
                                        isRTL={this.props.isRTL} 
                                        updateObj={this.state.updateObj} 
                                        showUpdateDataModal={this.state.showUpdateDataModal} 
                                        toggleUpdateDataModal={this.toggleUpdateDataModal}
                                        departmentList = {this.state.departmentList}   
                                        departmentIconsShowList = {this.state.departmentIconsShowList}
                                        loadAllDepartments = {this.loadAllDepartments} 
                                        brandsList = {this.state.brandsList}
                                        loadBrands = {this.loadBrands}
                                        mainSearch = {this.refreshCurrentPage}
                                    />
                                :<></>
                            }

                            {
                                this.state.showCompleteSumaryModal === true ?
                                    <CompleteSummaryModal isRTL={this.props.isRTL} sumobj={this.state.sumObj} showCompleteSumaryModal={this.state.showCompleteSumaryModal} toggleSummaryModal={this.toggleSummaryModal}/>
                                :<></>
                            }
                            
                            
                            {
                                this.state.showHierachyModal === true ?
                                    <HierachyResolve 
                                        isRTL={this.props.isRTL}
                                        catelogId={this.state.c_logId}
                                        showHierachyModal={this.state.showHierachyModal}
                                        departmentList = {this.state.departmentList}
                                        toggleHierachyModal={this.toggleHierachyModal}
                                        loadAllDepartments={this.loadAllDepartments} 
                                        updateAllDepartments={this.updateAllDepartments}  
                                        mainSearch = {this.refreshCurrentPage}
                                        issueState={this.state.issueState}
                                        logObj={this.state.sellogobj}
                                        setDepartmentsList={this.setDepartmentsList}
                                        setHeirarchyIssue={this.setHeirarchyIssue}
                                    />
                                :<></>
                            }


                        </Col>
                    </Col>
                </Row>
                <AcViewModal showmodal={this.state.isDataLoading} message={this.props.t('PLEASE_WAIT')} />

                <Modal show={this.state.manualSyncSecureModal} centered dialogClassName="modal-50w" className='deletesecure-modal' style={{direction: this.props.isRTL}} onHide={this.toggleSecureManualSync}>
                    <Modal.Header style={{ padding: "8px 15px" }}>
                        <Modal.Title style={{ fontWeight: "700", fontSize: "20px", color: "#5128a0" }}>{this.props.t('CONFIRM_SYNC')}</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <Form.Group>
                            <Form.Label style={{ marginBottom: "0px", fontSize: "14px", fontWeight: "600" }}>{this.props.t('entermanualsyncpw')}</Form.Label>
                            <Form.Control maxLength={maxInputLength} type="password" value={this.state.manualSyncPwTxt} autoFocus onChange={e => this.changeSecureTxt(e.target.value)} autoComplete='new-password' />
                        </Form.Group>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button size="sm" variant="danger" style={{ borderRadius: "15px", fontWeight: "700", padding: "3px 15px" }} onClick={() => this.handleSecureManualSync()}>{this.props.t('continue')}</Button>
                        <Button size="sm" variant="light" onClick={this.toggleSecureManualSync}>{this.props.t('btnnames.close')}</Button>
                    </Modal.Footer>
                </Modal>

                {isShowResolveModal?
                    <Modal className="contimplement-modal pgPrintDeptsModal pgImportBarcodeListModal simResolveLogModal resolve" 
                    show={isShowResolveModal} centered onHide={() => this.toggleResolveModal(!isShowResolveModal)}>
                    <Modal.Body>
                        <div className='closebtn' onClick={() => this.toggleResolveModal(false)}><XIcon size={30} /></div>

                        <PopoverWrapper text={<>
                            <h4>{this.props.t("ONLY_USAGESTATUS_NONE_PRODS")}</h4>
                        </>} cusid="resolvelog-info" trigger={["hover", "focus"]}>
                            <span className='info-icon'><InfoIcon size={20} /></span>
                        </PopoverWrapper>

                        <h3 className='issue-header'>{this.props.t("RESOLVED_PRODLIST")}</h3>

                        <Col className='searchbox' ref={this.searchBoxRef}>
                            <Form.Control
                                className="form-control"
                                type="text"
                                placeholder={this.props.t("searchproduct")}
                                autoComplete='off'
                                value={resolveProdPagination.searchTxt}
                                onChange={(e) => this.handleSearchChange(e)}
                                onKeyDown={(e) => this.handleEnterSeach(e)}
                            />
                            {Icons.SearchIcon("#4F4F4F", 14)}
                        </Col>

                        {resolveProdPagination.products.length > 0?<>
                            <h5>{this.props.t("Total")+(": "+resolveProdPagination.totalCount+" ")+this.props.t("items")}</h5>
                            
                            <ul className={'list-inline selectall-list '+(canSendToDepResolveList.length === 0?" disable-select":"")}>
                                <li className='list-inline-item' onClick={() => this.selectAllToggle(true)}>{this.props.t("SELECT_ALL")}</li>
                                <li className='list-inline-item' onClick={() => this.selectAllToggle(false)}>{this.props.t("SELECT_NONE")}</li>
                            </ul>
                        </>:<></>}

                        <Col>
                            <Table size='sm' style={{marginBottom: "0px"}}>
                                <thead>
                                    <tr><th>{this.props.t("product")}</th><th width="30%">{this.props.t("ACTIONS")}</th></tr>
                                </thead>
                            </Table>
                        </Col>
                        <Col id="uploadres-scrollcontent" className='scroll-content' onScroll={(e)=> this.getResScrollPosition(e)}>
                            <Table size='sm' style={{paddingBottom:"10px"}}>
                                <tbody>
                                    {resolveProdPagination.products.map((xitem, xidx) => {
                                        return <tr key={xidx}>
                                            <td>
                                                <Form.Check checked={xitem.isSelected} onChange={() => this.toggleProdCheck(xidx)} disabled={!xitem.canSendToDep} />
                                                <div className='img-view'>
                                                    <img src={xitem.imgUrl?xitem.imgUrl:imagePlaceholder} onClick={() => this.findProductData(xitem)} className={"img-resize-hor"} alt=""/>   
                                                </div>
                                                <div className='barcodeprod-details'>
                                                    <small>{xitem.barcode}</small>
                                                    {xitem.productName}
                                                </div>
                                            </td>
                                            <td className='text-center' width="30%">
                                                <ul className='list-inline'>
                                                    {xitem.canSendToDep?<li className='list-inline-item'>
                                                        <TooltipWrapper text={this.props.t("SEND_TO_DEP")}>
                                                            <Button variant='success' onClick={() => this.sendToDep([xitem.productId])} size='sm'><FeatherIcon icon="send" size={14}/></Button>
                                                        </TooltipWrapper>
                                                    </li>:<></>}
                                                    <li className='list-inline-item'>
                                                        <TooltipWrapper text={this.props.t("EDIT")}>
                                                            <Button variant='info' onClick={() => this.findProductData(xitem)} size='sm'><FeatherIcon icon="edit" size={14}/></Button>
                                                        </TooltipWrapper>
                                                    </li>
                                                </ul>
                                            </td>
                                        </tr>;
                                    })}
                                </tbody>
                            </Table>

                            {isResolvePaginating?<>
                                <Col className="text-center" style={{paddingBottom:"10px"}}><img src={loadinggif} alt="loading animation" style={{height:"20px"}}/></Col>
                            </>:<></>}
                        </Col>
                    </Modal.Body>
                    <Modal.Footer style={{display:"initial", textAlign:"right"}}>
                        <Button type="button" variant="secondary" size="sm" className={(this.props.isRTL==="rtl"?"float-right":"float-left")} onClick={() => this.toggleResolveModal(false)} style={{borderRadius:"15px"}}>{this.props.t('btnnames.close')}</Button>

                        <Button variant='success' onClick={()=>this.sendToDepAll(false)}>{this.props.t('SEND_TO_DEP')}</Button>
                    </Modal.Footer>
                </Modal>:<></>}

                <Modal show={showProductEditModal} className="prod-edit new-product-update-modal" dir={this.props.isRTL} onHide={()=>this.toggleProductEditModal()} backdrop="static" animation={false}>
                    <Modal.Body style={{padding:"30px", background:"#F4F6F7"}}>
                        {showProductEditModal === true?<>
                            <AddNewItemComponent 
                                isRTL={this.props.isRTL} 
                                prodState={this.state.productObject} 
                                ismodal={true} 
                                hidemodal={this.toggleProductEditModal}
                                hidedelete={false} 
                                size="sm"
                                t={this.props.t}
                                />
                        </>:<></>}
                    </Modal.Body>
                </Modal>
            </Col>
        )
    }
}

const mapDispatchToProps = dispatch => ({
    setProdView: (payload) => dispatch(viewSetAction(payload)),
    setNavigationAction: (payload) => dispatch(setNavigationAction(payload)),
    setDunitView: (payload) => dispatch(viewDepSetAction(payload)),
    setChainDepVew: (payload) => dispatch(viewSetChainDepAction(payload)),
    setCatelogimportCountAction:(payload) => dispatch(setCatelogimportCountAction(payload)),
});

export default withTranslation()(withRouter(connect(null,mapDispatchToProps)(CatelogueImport)));

function DashboardSection(props){
    return(
        <Row>
            <Col className={"dashboard-item"}>
                <Card bg='danger'>
                    <Card.Body>
                        <h5>{props.t("CATELOGUE_DASHBOARD.allCount")}</h5>
                        <span className='iconview'><FeatherIcon icon="list" size={22} /></span>
                        <h3>{props.dashboardData.allCount}</h3>
                    </Card.Body>
                </Card>
            </Col>
            <Col className={"dashboard-item"}>
                <Card bg='warning'>
                    <Card.Body>
                        <h5>{props.t("CATELOGUE_DASHBOARD.confirmPending")}</h5>
                        <span className='iconview'><FeatherIcon icon="pause" size={22} /></span>
                        <h3>{props.dashboardData.confirmPending}</h3>
                    </Card.Body>
                </Card>
            </Col>
            <Col className={"dashboard-item"}>
                <Card bg='info'>
                    <Card.Body>
                        <h5>{props.t("CATELOGUE_DASHBOARD.needUserInput")}</h5>
                        <span className='iconview'><FeatherIcon icon="user-check" size={22} /></span>
                        <h3>{props.dashboardData.needUserInput}</h3>
                    </Card.Body>
                </Card>
            </Col>
            <Col className={"dashboard-item"}>
                <Card bg='success'>
                    <Card.Body>
                        <h5>{props.t("CATELOGUE_DASHBOARD.planigoCompleted")}</h5>
                        <span className='iconview'><FeatherIcon icon="check-circle" size={22} /></span>
                        <h3>{props.dashboardData.planigoCompleted}</h3>
                    </Card.Body>
                </Card>
            </Col>
            {/* <Col className={"dashboard-item"}>
                <Card bg='secondary'>
                    <Card.Body>
                        <h5>{props.t("CATELOGUE_DASHBOARD.allCompleted")}</h5>
                        <h3>{props.dashboardData.allCompleted}</h3>
                    </Card.Body>
                </Card>
            </Col> */}
        </Row>
    )
}

function Filters(props){

    return(
        <Row className='filters'>
            <Col xs={5}>
                <Row>
                    <Col xs={4} className="filter-item">
                        <label>{props.t("CATELOGUE_FILTERS.type")}</label>
                        <select className='form-control' value={props.searchobj.logType} onChange={(e)=>props.changeFilterValues("logType",e.target.value)}>
                            {
                                CatelogImportLogTypes.map((type,i)=>{
                                    return(
                                        <option key={i} value={type}>{props.t("CatelogImportLogTypes."+type)}</option>
                                    )
                                })
                            }
                        </select>
                    </Col>
                    <Col xs={4} className="filter-item">
                        <label>{props.t("CATELOGUE_FILTERS.issueType")}</label>
                        <select className='form-control' value={props.searchobj.issueType} onChange={(e)=>props.changeFilterValues("issueType",e.target.value)}>
                            <option value={""}>{props.t("CatelogImportLogTypes.All")}</option>
                            {
                                CatelogImportIssueTypes.map((type,i)=>{
                                    return(
                                        <option key={i} value={type}>{props.t("CatelogImportIssueTypes."+type)}</option>
                                    )
                                })
                            }
                        </select>
                    </Col>
                    <Col xs={4} className="filter-item">
                        <label>{props.t("CATELOGUE_FILTERS.status")}</label>
                        <select className='form-control' value={props.searchobj.logStatus} onChange={(e)=>props.changeFilterValues("logStatus",e.target.value)}>
                            {
                                CatelogImportLogStatus.map((type,i)=>{
                                    return(
                                        <option key={i} value={type}>{props.t("CatelogImportLogStatus."+type)}</option>
                                    )
                                })
                            }
                        </select>
                    </Col>

                </Row>
            </Col>
            <Col xs={3} className="filter-item ">
                <Row>
                    <Col xs={6} className="filter-item datebox">
                        <label>{props.t("CATELOGUE_FILTERS.from")}</label><br/>
                        <DatePicker
                            dateFormat="dd/MM/yyyy"
                            placeholderText="DD/MM/YYYY"
                            popperPlacement="bottom-start"
                            showYearDropdown
                            className="datepicker-txt"
                            selected={props.searchobj.fromDate}
                            onChange={(e)=>props.changeDateFilterValues("fromDate",e)}
                            onKeyDown={props.handleKeyDown}
                        />
                        <CalendarIcon size={15} />
                    </Col>
                    <Col xs={6} className="filter-item datebox">
                        <label>{props.t("CATELOGUE_FILTERS.end")}</label><br/>
                        <DatePicker
                            dateFormat="dd/MM/yyyy"
                            placeholderText="DD/MM/YYYY"
                            popperPlacement="bottom-start"
                            showYearDropdown
                            className="datepicker-txt"
                            selected={props.searchobj.toDate}
                            onChange={(e)=>props.changeDateFilterValues("toDate",e)}
                            onKeyDown={props.handleKeyDown}
                        />
                        <CalendarIcon size={15} />
                    </Col>
                    

                </Row>
            
            </Col>
            <Col xs={1} className="filter-item ">
                        <label className="filter-label">{props.t("SHOW_RESULTS")}</label>
                        <Form.Control style={{width:"60px"}} type="number"  value={props.maxShowresultcount} onChange={e => props.handleShowingresults(e,false)} onBlur={e => props.handleShowingresults(e,true)} onKeyDown={ (evt) => evt.key === "."?evt.preventDefault(): preventinputotherthannumbers(evt,props.maxShowresultcount,(props.t('Character.results'))) } />
            </Col>
            <Col xs={3} className="filter-item main-btns buttons">
                <Button variant='light' className='d-inline reset' onClick={()=>props.changeFilterValues("reset",null)}>{props.t("CATELOGUE_FILTERS.reset")}</Button>
                <Button variant='danger' className='d-inline' onClick={()=>props.mainSearch()}>{props.t("CATELOGUE_FILTERS.search")}</Button>
            </Col>
        </Row>
    )
}