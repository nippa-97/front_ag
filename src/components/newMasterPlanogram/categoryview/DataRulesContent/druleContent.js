import React from 'react';
import { withTranslation } from 'react-i18next';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import { Row, Col, Tab, Nav, Dropdown, Form, Table , Modal, Button, Accordion, Card, OverlayTrigger, Tooltip, Badge, Alert } from 'react-bootstrap'; //
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar'; 
import DatePicker from "react-datepicker";
import FeatherIcon from 'feather-icons-react';
import * as FileSaver from 'file-saver';
import * as XLSX from 'xlsx';
import { XIcon, ChevronDownIcon, ChevronUpIcon, InfoIcon } from '@primer/octicons-react'; //
import { confirmAlert } from 'react-confirm-alert';

import { submitCollection } from '../../../../_services/submit.service';
import { submitSets } from '../../../UiComponents/SubmitSets';
import { PopoverWrapper, TooltipWrapper, getNameorIdorColorofBox } from '../../AddMethods';
import { catRectEnums } from '../../../../enums/masterPlanogramEnums';
import { numberWithCommas } from '../../../../_services/common.service';

import { AcViewModal } from '../../../UiComponents/AcImports';

import { mpCategoryDataCacheSetAction, mpSubCategoryDataCacheSetAction, mpBrandDataCacheSetAction, filterDates } from '../../../../actions/masterPlanogram/masterplanogram_action';

import './druleContent.scss';
import loader from '../../../../assets/img/loading-sm.gif'
import moment from 'moment';
import { alertService } from '../../../../_services/alert.service';
import noticeImg from '../../../../assets/img/vmp-issues-notice.png';
import { ExcelExportIcon, Icons, NewReplaceProductIcon } from '../../../../assets/icons/icons';
import imagePlaceholder from '../../../../assets/img/icons/default_W100_100.jpg';
import loadinggif from '../../../../assets/img/loading-sm.gif';

import MappingItemList from './watchListComps/mappingList';
import ProductsList from './watchListComps/productsList';
import NewProductsList from './watchListComps/newProductsList';
import ArchiveProductsList from './watchListComps/archiveProductList';
import { AddNewItemComponent } from '../../../masterdata/products/AddNew/addnew';

const getCalculatedDate = (dt) =>{
    var requiredDate= dt.setMonth(dt.getMonth() - 6);
    return new Date(requiredDate)
}

class DataRuleContent extends React.Component {
    constructor(props){
        super(props);

        this._isMounted = false;

        this.state = {
            isloading:false,
            category : [],
            subcategory : [],
            brand : [],
            
            deptsettings:null,isruleloading:false,isrulesloaded:false,
            chartFilterDates:{fromdate:getCalculatedDate(new Date()),todate:new Date()},

            activeWatchSection:-2,
            watchCount:0,
            showIssuesNoticeModal:false,
            departmentList:[],
            watchCounts:{mappingCount:0, issueProductCount:0, newProductCount:0, archivedProductCount:0},
            isCountsLoad:false,
            // noticeImgUrl: null,
            isShowModel:false,

            isShowResolveLogModal: false,
            //resolve prod log pagination
            resolveProdLogPagination: { 
                totalCount: 0, 
                startIndex: 0,  
                maxResults: 10,
                searchTxt: "",
                products: [],
            },
            isResolveLogPaginating: false,
            isShowResolveModal: false,

            //resolve prod pagination
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

    componentDidMount() {
        this._isMounted = true;

        this.props.setfilterDates(null);

        if (this._isMounted) {
            this.props.getNoticeImageForWatch(noticeImg);
            
            /* if(this.props.isonetimeload){
                
            } */

            if(this.props.dataRuleSelectedTab === "watchtab"){
                this.initGotIt();
            }
            else if(this.props.dataRuleSelectedTab === "ruletab"){
                this.loadRules();
            }

            if(this.props.chartFilterDates){
                this.setState({chartFilterDates:this.props.chartFilterDates});
            }
            
            this.filterData();
            this.loadIssuesCount();
        }
    }

    componentWillUnmount(){
        this._isMounted = false;
    }

    handleMainTabChange = (e)=>{
        this.props.changeDataRuleActiveTab(e);
        this.setState({activeWatchSection:-2},()=>{
            this.initSelectedWatchSection();
        });
    }

    changeChartFilterDates = (evt, type) => {
        var dates = this.state.chartFilterDates;

        if(type === "fromdate"){
            if(dates.todate !== null || dates.todate !== ""){
                if(new Date(evt).getTime() >= new Date(dates.todate).getTime()){
                    alertService.error(this.props.t("PLEASE_SET_VALID_DATE_RANGE"));
                    return;
                }
            }
        }

        if(type === "todate"){
            if(dates.fromdate !== null || dates.fromdate !== ""){
                if(new Date(dates.fromdate).getTime() >= new Date(evt).getTime()){
                    alertService.error(this.props.t("PLEASE_SET_VALID_DATE_RANGE"));
                    return;
                }
            }else{
                alertService.error(this.props.t("PLEASE_SET_A_FROM_DATE"));
                return;
            }

        }

        dates[type] = evt;
        let cobj = { dates } ;
        this.props.setfilterDates(cobj);
        this.setState({chartFilterDates:dates});
    }

    searchMethod = () =>{
        var cfdate = this.state.chartFilterDates.fromdate;
        var ctdate = this.state.chartFilterDates.todate;

        let mp_id = this.props.defSaveObj.mp_id;

        if(mp_id > -1){

            if(cfdate <= ctdate){
                let savefilterobj = { departmentId: this.props.deptid, fromDate: cfdate, toDate: ctdate };
    
                this.props.updateProductDateRanges(savefilterobj, this.state.chartFilterDates);
            }
            else{
                alertService.error(this.props.t("ENDDATE_LOWERTHAN_STARTDATE"));
            }
        }else{
            this.props.onDepButtonClick();
            alertService.error(this.props.t("ENTER_DEPT_RULES_UPDATE"));
        }

    }

    handleDateChangeRaw = (event) => {
        if(!(/[0-9/]/.test(event.key) || parseInt(event.keyCode) === 8  || parseInt(event.keyCode) === 37 || parseInt(event.keyCode) === 39)){
            event.preventDefault();
        }
    }

    filterData = () =>{
        if(this.props.viewtype==="cat"){
            this.loadCacheCatData();
        }
        else if(this.props.viewtype==="scat"){
            this.loadCacheSubCatData();
        }
        else if(this.props.viewtype==="brand"){
            this.loadCacheBrandData()
        }
    }
    //load category data
    getCatgoryData = () =>{
        let mpid = (this.props.defSaveObj?this.props.defSaveObj.mp_id:-1);

        var sobj = {
            mpId: mpid,
            fromDate: moment(this.props.chartFilterDates.fromdate).format("YYYY-MM-DD"),
            toDate: moment(this.props.chartFilterDates.todate).format("YYYY-MM-DD"),
            chainHasDepartmentId: this.props.deptid,
            mpRuleIds: this.props.ruleIdList,
        }
        //console.log("cat");
        this.setState({isloading:true});
        submitSets(submitCollection.loadCategoryData, sobj).then(res => {
            this.setState({isloading:false});
            if(res && res.status && res.extra){
                let cacheobj = { sobj: sobj, data: (res.extra?res.extra:[]) }
                this.props.setMPCategoryDataCache(cacheobj);
                this.setCatSubCategoryAvailability((res.extra ? res.extra : []));
            }
            else{
                this.setState({category:[]});
            }
        });
    }
    //load cat data from cache
    loadCacheCatData = () => {
        if(this.props.catDataPanelData && this.props.catDataPanelData.length > 0){
            /* let cachedata = this.props.masterPlanogramState.mpCatDataCache;

            if(cachedata.sobj && cachedata.sobj.chainHasDepartmentId === this.props.deptid){
                this.setCatSubCategoryAvailability(cachedata.data);
            } else{
                this.getCatgoryData();
            } */
            this.setCatSubCategoryAvailability(this.props.catDataPanelData);

        } else{
            // this.getCatgoryData();
        }
    }
    //compare cat data
    setCatSubCategoryAvailability = (clist) =>{
        let catlist = clist;

        let defcatlist = (this.props.defSaveObj && this.props.defSaveObj.categories ? this.props.defSaveObj.categories : [] );
        
        let catavlitems = [];
        for (let i = 0; i < catlist.length; i++) {
            let cardcat = catlist[i];
            for (let x = 0; x < defcatlist.length; x++) {
                if(!defcatlist[x].isDelete && !defcatlist[x].is_unallocated_view){
                    for (let j = 0; j < defcatlist[x].rects.length; j++) {
                        const catrectitem = defcatlist[x].rects[j];
                        if(!catrectitem.isDelete && ((!cardcat.isRule && catrectitem.type === catRectEnums.default && cardcat.categoryId === getNameorIdorColorofBox(catrectitem, "num")) ||
                        (cardcat.isRule && catrectitem.type === catRectEnums.rule && cardcat.categoryId === getNameorIdorColorofBox(catrectitem, "num")))
                        ){
                            cardcat.isAvailable = true;
                            catavlitems.push(cardcat);
                        }
                    }
                }
            }
        }
        // console.log(catlist);
        this.setState({category: catavlitems});
    }
    //load sub cat data
    getSubCatgoryData = () =>{
        let mpid = (this.props.defSaveObj?this.props.defSaveObj.mp_id:-1);
        let selcat = this.props.selectedCatRect;

        var sobj = {
            mpId: mpid,
            fromDate: moment(this.props.chartFilterDates.fromdate).format("YYYY-MM-DD"),
            toDate: moment(this.props.chartFilterDates.todate).format("YYYY-MM-DD"),
            departmentId: this.props.deptid,
            categoryId: this.props.catid,
            isCatRuleBased: (this.props.ruleobj?true:false),
            catRuleObj: (this.props.ruleobj?{ level: this.props.ruleobj.level, id: getNameorIdorColorofBox(selcat, "num") }:{}),
            mpRuleIds: this.props.ruleIdList,
        }
        //console.log("scat");
        this.setState({isloading:true});
        submitSets(submitCollection.loadSubCategoryData, sobj).then(res => {
            this.setState({isloading:false});
            if(res && res.status && res.extra){
                let cacheobj = { sobj: selcat, data: (res.extra?res.extra:[]) }
                this.props.setMPSubCategoryDataCache(cacheobj);
                this.setSubCatBrandsAvailability((res.extra ? res.extra : []));
            }
            else{
                this.setState({subcategory: []});
            }
        });
    }
    //load cat data from cache
    loadCacheSubCatData = () => {
        if(this.props.subCatDataPanelData && this.props.subCatDataPanelData.length > 0){
           /*  let selcat = this.props.selectedCatRect;
            let cachedata = this.props.masterPlanogramState.mpScatDataCache;

            if(cachedata.sobj && cachedata.sobj.id === selcat.id){
                this.setSubCatBrandsAvailability(cachedata.data);
            } else{
                this.getSubCatgoryData();
            } */
            
            this.setSubCatBrandsAvailability(this.props.subCatDataPanelData);
        } else{
            // this.getSubCatgoryData();
        }
    }
    //compare loaded sub cat data
    setSubCatBrandsAvailability = (slist) =>{
        let scatlist = slist;
        var defsubcatlist = this.props.selectedCatRect.sub_categories ? this.props.selectedCatRect.sub_categories : [];
        
        let scatavlitems = [];
        for (let i = 0; i < scatlist.length; i++) {
            let cardscat = scatlist[i];
            for (let x = 0; x < defsubcatlist.length; x++) {
                if(!defsubcatlist[x].isDelete && ((!cardscat.isRule && defsubcatlist[x].type === catRectEnums.default && getNameorIdorColorofBox(defsubcatlist[x],"num") === cardscat.subcategoryId) || 
                (cardscat.isRule && defsubcatlist[x].type === catRectEnums.rule && getNameorIdorColorofBox(defsubcatlist[x],"num") === cardscat.subcategoryId))){
                    cardscat.isAvailable = true;
                    scatavlitems.push(cardscat);
                }
            }
        }
        
        this.setState({subcategory: scatavlitems});
    }
    //load brand data
    getBrandData = () =>{
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

        var sobj = {
            mpId: mpid,
            fromDate: moment(this.props.chartFilterDates.fromdate).format("YYYY-MM-DD"),
            toDate: moment(this.props.chartFilterDates.todate).format("YYYY-MM-DD"),
            departmentId: this.props.deptid,
            categoryId: catrectid,
            isCatRuleBased: iscatrulebased,
            catRuleObj: (catruleobj?catruleobj:{}),
            subcategoryId: this.props.scatid,
            isSubCatRuleBased: (this.props.ruleobj?true:false),
            subCatRuleObj: (this.props.ruleobj?{ level: this.props.ruleobj.level, id: getNameorIdorColorofBox(selsubcat, "num") }:{}),
            mpRuleIds: (selsubcat.otherMpRuleIds?selsubcat.otherMpRuleIds:[]),
        }
        //console.log("brand");
        this.setState({isloading:true});
        submitSets(submitCollection.loadBrandData, sobj).then(res => {
            this.setState({isloading:false});
            if(res && res.status && res.extra){
                let cacheobj = { sobj: selsubcat, data: (res.extra?res.extra:[]) }
                this.props.setMPBrandDataCache(cacheobj);
                this.setBrandsAvailability((res.extra ? res.extra : []));
            }
            else{
                this.setState({brand: []});
            }
        });
    }
    //load brand data from cache
    loadCacheBrandData = () => {
        if(this.props.brandDataPanelData && this.props.brandDataPanelData.length > 0){
            /* let selsubcat = this.props.selectedSubCat;
            let cachedata = this.props.masterPlanogramState.mpBrandDataCache;

            if(cachedata.sobj && cachedata.sobj.id === selsubcat.id){
                this.setBrandsAvailability(cachedata.data);
            } else{
                this.getBrandData();
            } */
            
            this.setBrandsAvailability(this.props.brandDataPanelData);

        } else{
            // this.getBrandData();
        }
    }
    //compare brand data 
    setBrandsAvailability = (brandlist) => {
        let addedbrandlist = [];
        for (let i = 0; i < brandlist.length; i++) {
            const branditem = brandlist[i];
            let isbrandadded = this.props.bottomAddedList.findIndex(x => x.brandId === branditem.brandId);

            if(isbrandadded > -1){
                addedbrandlist.push(branditem);
            }
        }

        this.setState({brand: addedbrandlist});
    }   


    loadRules = () =>{
        if(this.props.defSaveObj.mp_id>-1){
            //console.log(this.props.defSaveObj.mp_id)
            if(this.props.deptid && this.props.deptid>0){
                    this.setState({deptsettings:null, isruleloading:true});
                    let checkobj = "?chainHasDepartmentId="+this.props.deptid+",&mp_id="+this.props.defSaveObj.mp_id;
                    submitSets(submitCollection.getDepartmentMetaData, checkobj, false).then(res => {
                        if(res && res.status){
                            this.setState({ deptsettings: res.extra, isruleloading: false, isrulesloaded:true });
                        } 
                        else{
                            this.setState({ deptsettings:null, isruleloading: false, isrulesloaded:false });
                        }
                    });
    
                
            }
            else{
                this.setState({ deptsettings:null, isruleloading: false, isrulesloaded:false });
            }
        }else{
            this.setState({ deptsettings:null, isruleloading: false, isrulesloaded:false });
        }   
    }

    changeActiveWatchSection = (type) =>{
        this.setState({activeWatchSection:(this.state.activeWatchSection===type?-1:type)});
    }

    loadIssuesCount = (isonlyreload) => {
        let csaveobj = this.props.defSaveObj;

        if(csaveobj && csaveobj.mp_id > -2){
            let sobj = {
                mpId: (csaveobj? csaveobj.mp_id : -1),
                depId: (this.props.deptid ? this.props.deptid : -1),
                catId: (this.props.catid ? this.props.catid : -1),
                subCatId: (this.props.scatid ? this.props.scatid : -1),
                supId: (this.props.supplierid ? this.props.supplierid : -1),
                brandId: (this.props.brandid ? this.props.brandid : -1),
            }

            submitSets(submitCollection.getvmpIssueCount, sobj).then(res => {
                if(res && res.status){
                    let resobj = (res.extra?res.extra:null);
                    let newprodcount = (resobj && resobj.newProductCount > 0?resobj.newProductCount:0);
                    // let arcprodcount = (resobj && resobj.archivedProductCount > 0?resobj.archivedProductCount:0);
                    let mappingCount = (resobj && resobj.mappingCount > 0?resobj.mappingCount:0);
                    // console.log(resobj);

                    let totalwatchcount = (newprodcount + mappingCount);

                    this.setState({ watchCount : totalwatchcount });

                    if(res.extra && res.extra !== ""){
                        this.setState({watchCounts: res.extra}, () => {
                            // console.log(this.state.watchCounts);
                            if(!isonlyreload){
                                let cwcounts = this.state.watchCounts;
                                //only change to watch tab if any of issue counts available
                                if(cwcounts.newProductCount > 0 || cwcounts.archivedProductCount > 0){
                                    this.handleMainTabChange("watchtab");
                                } else{
                                    this.handleMainTabChange("datatab");
                                }
                            }
                        });
                    }

                    if(totalwatchcount > 0 && this.props.viewtype === "cat" && this.props.watchTabCountLoaded === false && this.props.depDirectType!=="AUI"){
                        // console.log(this.props.depDirectType==="AUI");
                        this.setState({showIssuesNoticeModal:true});
                    }

                    if(this.props.setWatchTabCountStatus){
                        this.props.setWatchTabCountStatus(true);
                    }
                }
                else{
                    if(this.props.setWatchTabCountStatus){
                        this.props.setWatchTabCountStatus(true);
                    }
                }
            });
        } else{
            this.handleMainTabChange("datatab");
        }
    }

    setAllDepartmentList = (dlist) =>{
        this.setState({departmentList:dlist});
    }

    initSelectedWatchSection = () =>{
        let cwobj = this.state.watchCounts;

        /* if(cwobj.mappingCount > 0){
            this.changeActiveWatchSection("0");
        }
        else if(cwobj.issueProductCount > 0){
            this.changeActiveWatchSection("1");
        }
        else  */
        
        if(cwobj.newProductCount > 0){
            this.changeActiveWatchSection("2");
        }
        else if(cwobj.archivedProductCount > 0){
            this.changeActiveWatchSection("3");
        }
        else if(cwobj.issueProductCount > 0){
            this.changeActiveWatchSection("1");
        }
        else{
            this.changeActiveWatchSection("0");
        }
    }

    initGotIt = () =>{
        this.setState({showIssuesNoticeModal:false},()=>{
            this.props.changeDataRuleActiveTab("watchtab");
            // this.initSelectedWatchSection();
        })
    }
    //copy barcode to clipboard message show
    copyToClipboard = (ctxt) => {
        alertService.info(this.props.t("COPIED_TO_CLIP_BOARD"));
    }

    //watch Tab export
     watchTabExport = async (props) =>{
        this.setState({
            isShowModel: true
        })
        let data = this.props.defSaveObj
        const chainName = this.props.signState.signinDetails.chain.chainName
        let mappingProducts = [[(this.props.t('Hierarchy_Issue')),(this.props.t('CATELOGUE_FILTERS.created'))]];
        let products = [[(this.props.t('barcode')),(this.props.t('productname')),(this.props.t('CATELOGUE_FILTERS.issueType')),(this.props.t('Sale_Total'))]];
        let newProducts = [[(this.props.t('barcode')),(this.props.t('productname'))]];
        let archiveProducts = [[(this.props.t('barcode')),(this.props.t('productname'))]];


        let startDate = moment(data.searchFromDate).format("YYYY-MM-DD").toString();
        let endDate = moment(data.searchToDate).format("YYYY-MM-DD").toString();
        let sobj = {
            catId:(this.props.catid ? this.props.catid : -1),
            depId:(this.props.deptid ? this.props.deptid : -1),
            endDate:endDate,
            isReqCount:false,
            isReqPagination:false,
            maxResult:-1,
            mpId:data.mp_id?data.mp_id:-1,
            startDate:startDate,
            startIndex:-1,
            subCatId: (this.props.scatid ? this.props.scatid : -1),
            supId:(this.props.supplierid ? this.props.supplierid : -1)
        };

        //mapping data
       await submitSets(submitCollection.getvmpHierarchyIssues, sobj, true).then(res => {
            if(res && res.status){
              if(res.extra && res.extra.length > 0){
                    let result = res.extra
                    for (const val of result) {
                        mappingProducts.push([val.description, moment(val.importedDate).format("YYYY-MM-DD").toString()])
                    }
              }
            }
        });

        //products list
        await submitSets(submitCollection.vmpGetDepartmentProducts, sobj, true).then(res => {
            if(res && res.status){
                if(res.extra && res.extra.length > 0){
                      let result = res.extra
                      for (const val of result) {                       
                        products.push([val.barcode,val.name,(this.props.t(val.issueType)),val.saleTotal])
                      }
                }
            }
        });

        //newproducts
       await submitSets(submitCollection.vmpGetDepartmentNewProducts, sobj, true).then(res => {
            if(res && res.status){
                if(res.extra && res.extra.length > 0){
                      let result = res.extra
                      for (const val of result) {
                        newProducts.push([val.barcode, val.name])
                      }
                }
            }
        });

      //archive
      await submitSets(submitCollection.vmpGetDepartmentArchivedProducts, sobj, true).then(res => {
            if(res && res.status){
                if(res.extra && res.extra.length > 0){
                      let result = res.extra
                      for (const val of result) {
                        archiveProducts.push([val.barcode,val.name])
                      }
                }
            }
        });

        if(mappingProducts.length > 1 || products.length > 1 || newProducts.length > 1 || archiveProducts.length > 1){

            const fileType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
            const fileExtension = '.xlsx';

            const cdate = moment().format("YYYY-MM-DD h.mm a")


            const sheet1 =  XLSX.utils.json_to_sheet(mappingProducts,{ skipHeader: true });
            const sheet2 =  XLSX.utils.json_to_sheet(products,{ skipHeader: true });
            const sheet3 =  XLSX.utils.json_to_sheet(newProducts,{ skipHeader: true });
            const sheet4 =  XLSX.utils.json_to_sheet(archiveProducts,{ skipHeader: true });

            const sheet1Name = this.props.t('Mapping_Products');
            const sheet2Name = this.props.t('products')
            const sheet3Name = this.props.t('newproducts')
            const sheet4Name = this.props.t('Archive_Products')

            const wb = { Sheets: { [sheet1Name]: sheet1,[sheet2Name]: sheet2,[sheet3Name]: sheet3,[sheet4Name]: sheet4 }, SheetNames: [sheet1Name,sheet2Name,sheet3Name,sheet4Name]};
            const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
            const exportData = new Blob([excelBuffer], { type: fileType });
            FileSaver.saveAs(exportData,(chainName)+" - "+(data.department.department_name)+` (V${data.version}) ` + (cdate) + fileExtension);
            this.setState({
                isShowModel:false
            })
        }else{
            this.setState({
                isShowModel: false
            },()=>{
                alertService.error(this.props.t("NO_RESULT_FOUND"));
            })
        }
 
    }
    //reset resolve log
    resetResolveLogSearch = (_callback, issearch) => {
        let resolveProdLogPagination = this.state.resolveProdLogPagination;

        let resetobj = { 
            totalCount: 0, 
            startIndex: 0,  
            maxResults: 10,
            searchTxt: (issearch?resolveProdLogPagination.searchTxt:""),
            products: [],
        }

        this.setState({ resolveProdLogPagination: resetobj },() => {
            if(_callback){
                _callback();
            }
        });
    }
    //load resolve log
    loadResolveLogModal = (isshow) => {
        let defSaveObj = this.props.defSaveObj;
        let resolveProdLogPagination = this.state.resolveProdLogPagination;
        
        if(isshow){
            resolveProdLogPagination.startIndex = 0;
            resolveProdLogPagination.searchTxt = "";
            resolveProdLogPagination.totalCount = 0;
        }
        
        let sobj = {
            isReqCount: true,
            isReqPagination: true,
            maxResult: resolveProdLogPagination.maxResults,
            startIndex: resolveProdLogPagination.startIndex,
            departmentId: (this.props.deptid ? this.props.deptid : -1),
            mpId: (defSaveObj? defSaveObj.mp_id : -1),
            searchKey: resolveProdLogPagination.searchTxt
        }

        this.props.toggleLoadingModal(isshow, () => {
            this.setState({ isResolveLogPaginating: true }, () => {
                submitSets(submitCollection.findVMPResolvedProductLog, sobj).then(res => {
                    if(res && res.status){
                        let resobj = (res.extra?res.extra:null);
                        
                        if(resolveProdLogPagination.startIndex === 0){
                            resolveProdLogPagination.totalCount = res.count;
                            resolveProdLogPagination.products = resobj;
                        } else{
                            resolveProdLogPagination.products = resolveProdLogPagination.products.concat(resobj);
                        }
        
                        this.setState({ resolveProdLogPagination: resolveProdLogPagination }, () => {
                            if(isshow && resobj.length > 0){
                                this.toggleResolveLogModal(true);
                            }
                        });
    
                    } else{
                        
                    }

                    this.setState({ isResolveLogPaginating: false });
                    this.props.toggleLoadingModal(false);
                });
            });
        });
    }

    toggleResolveLogModal = (isshow) => {
        this.setState({ isShowResolveLogModal: isshow });
    }

    getResLogScrollPosition = (e) => {
        let resolveProdLogPagination = this.state.resolveProdLogPagination;
        
        if(this.state.isResolveLogPaginating === false && resolveProdLogPagination.products.length < resolveProdLogPagination.totalCount){
            var top = document.getElementById("uploadlog-scrollcontent").scrollTop;
            var sheight = document.getElementById("uploadlog-scrollcontent").scrollHeight;
            var position = (sheight - top);
            var clientHeight = e.target.clientHeight;
            position = Math.trunc((position - 1));
            
            if(position <= clientHeight ){
                resolveProdLogPagination.startIndex = (resolveProdLogPagination.startIndex + resolveProdLogPagination.maxResults);
                
                this.setState({ resolveProdLogPagination: resolveProdLogPagination },()=>{
                    this.loadResolveLogModal();
                });
            }
        }
    }

    //refresh vmp with updating dept meta data
    refreshVMP = () => {
        confirmAlert({
            title: this.props.t('REFRESH_VMP'),
            message: this.props.t('SURETO_REFRESHVMP'),
            overlayClassName: (this.props.isRTL==="rtl"?"alertrtl-content":""),
            buttons: [{
                label: this.props.t('btnnames.yes'),
                onClick: () => {
                    this.updateDepartmentMetaData();
                }
            }, {
                label: this.props.t('btnnames.no')
            }]
        });
    }
    //continue metadata update
    updateDepartmentMetaData = () => {
        let settingobj = this.props.deptsettings;
        settingobj["mpId"] = (this.props.defSaveObj?this.props.defSaveObj.mp_id:-1);
        settingobj["fromDate"] = moment(this.props.chartFilterDates.fromdate).format("YYYY-MM-DD");
        settingobj["toDate"] = moment(this.props.chartFilterDates.todate).format("YYYY-MM-DD");
        settingobj["mp_id"] = (this.props.defSaveObj?this.props.defSaveObj.mp_id:-1);

        this.props.updatedeptobj(null,false);

        this.props.toggleLoadingModal(true, () => {
            submitSets(submitCollection.updateDepartmentMetaData, settingobj, false).then(res => {
                //console.log(res);
                
                if(res && res.status){
                    alertService.success(this.props.t("VMP_SUCCESSFULLY_REFRESHED"));

                    this.props.updatedeptobj(null,true);
                    this.props.dRulesreload();
                } else{
                    alertService.error(res && res.extra?res.extra:"Error occurred");
                    this.props.updatedeptobj(null,true);
                }

                this.props.toggleLoadingModal(false);
            });    
        }); 
    }
    //handle change search text
    handleLogSearchChange = (evt) => {
        let resolveProdLogPagination = this.state.resolveProdLogPagination;
        resolveProdLogPagination.searchTxt = evt.target.value;

        this.setState({ resolveProdLogPagination: resolveProdLogPagination });
    }   
    //handle enter search
    handleLogEnterSeach = (evt, isreset) => {
        if(isreset || evt.which === 13){
            this.resetResolveLogSearch(() => {
                this.loadResolveLogModal();
            }, true);
        }
    }

    findProductData = (item) =>{
        this.props.toggleLoadingModal(true, () => {
            submitSets(submitCollection.findProdByID, ('?productId='+item.productId), true).then(res => {
                if(res && res.status){
                    let pobj = res.extra;

                    this.setState({productObject:{ prodDetails: pobj }},() => {
                        this.setState({showProductEditModal:true});
                    });

                } else{
                    alertService.error((res&&res.msg?res.msg:res&&res.extra?res.extra:this.props.t('ERROR_OCCURRED')));
                }

                this.props.toggleLoadingModal(false);
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
            this.resetResolveSearch(() => {
                this.setState({ isShowModel: true }, () => {
                    setTimeout(() => {
                        this.loadResolveProds(true);      
                    }, 1000);
                });
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

        this.setState({ isShowModel: true }, () => {
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
                }
    
                this.setState({ loading: false, isShowModel: false });
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
                            
                            this.props.updatedeptobj(null,true);
                            this.props.dRulesreload();
                            
                            this.resetResolveSearch(() => {
                                this.loadResolveProds(true);      
                            });

                            this.loadIssuesCount(true);

                            if(isrefresh){
                                this.toggleResolveModal(false);
                                this.updateDepartmentMetaData();
                            }
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

    render() {
        let defSaveObj = this.props.parentSaveObj;

        let { 
            isShowResolveLogModal, isResolveLogPaginating, resolveProdLogPagination, showProductEditModal,
            isShowResolveModal, resolveProdPagination, isResolvePaginating
        } = this.state;

        let canSendToDepResolveList = (resolveProdPagination && resolveProdPagination.products && resolveProdPagination.products.length > 0?
            resolveProdPagination.products.filter(x => x.canSendToDep):[]);
        

        return (<>
            <Col className="bottom-single datarule-wrapper" xs={12} lg={3} style={this.props.isRTL === "rtl"?{paddingRight:"0px"}:{paddingLeft:"0px"}}>
                <Col className={'sub-content sub-wrapper datarule-content'+(defSaveObj && defSaveObj.isRequiredToRefresh?' show-warn':'')}>
                    {defSaveObj && defSaveObj.mp_id > -1?<>
                        {defSaveObj.isRequiredToRefresh?<Col className='vmp-refresh-warn' xs={12}>
                            <span>{this.props.t("THIS_VMP_NEEDS_TOREFRESH")}</span>
                            <Button variant='warning' size='sm' onClick={() => this.loadResolveLogModal(true)}><FeatherIcon icon="file-text" size={14}/></Button>
                            <Button variant='warning' size='sm' onClick={() => this.refreshVMP()}>{this.props.t("REFRESH")}</Button>
                        </Col>:<></>}

                        <Tab.Container activeKey={this.props.dataRuleSelectedTab} onSelect={(e)=> this.handleMainTabChange(e)}>
                            <Row className='tab-list'>
                                <Col sm={12} className="text-center nav-links">
                                    <Nav variant="pills">
                                        <Nav.Item>
                                            <Nav.Link eventKey="datatab">{this.props.t("data")}</Nav.Link>
                                        </Nav.Item>
                                        <Nav.Item>
                                            <Nav.Link eventKey="ruletab" onClick={()=>this.loadRules()}>{this.props.t("rules")}</Nav.Link>
                                        </Nav.Item>
                                        <Nav.Item>
                                            <Nav.Link eventKey="watchtab" className={'watch-tab '+(this.state.watchCount>0 ? "available":"" )} onClick={()=>this.initSelectedWatchSection()}>
                                                {(this.state.watchCount>0 ?<label className='watch-count'>{this.state.watchCount}</label>:<></>)}
                                                {this.props.t("WATCH")}
                                            </Nav.Link>
                                        </Nav.Item>
                                    </Nav>
                                </Col>
                                <Col style={{padding:"0px"}}>

                                    <Tab.Content>
                                        <Tab.Pane eventKey="datatab">
                                            <Dropdown className='datefilters-drop' drop='down' align={this.props.isRTL === "rtl"?"end":"start"}>
                                                <Dropdown.Toggle variant="secondary" size='sm'>
                                                    {this.props.t("FILTER_BY_DATE")}
                                                </Dropdown.Toggle>

                                                <Dropdown.Menu>
                                                    <h6>{this.props.t("FILTER_ITEMS.title1")}</h6>

                                                    <Form.Group>
                                                        <label>{this.props.t("FILTER_ITEMS.startdate")}</label><br/>
                                                        <DatePicker showYearDropdown className="datepicker-txt" onKeyDown={this.handleDateChangeRaw} onChange={(e) => this.changeChartFilterDates(e, "fromdate")} selected={this.state.chartFilterDates.fromdate} 
                                                        dateFormat="dd/MM/yyyy" popperPlacement="bottom" popperModifiers={{ flip: { behavior: ["bottom"] }, preventOverflow: { enabled: false }, hide: { enabled: false } }} 
                                                        placeholderText={"(DD/MM/YYYY)"}
                                                        />
                                                    </Form.Group>
                                                    
                                                    <Form.Group>
                                                        <label>{this.props.t("FILTER_ITEMS.enddate")}</label><br/>
                                                        <DatePicker showYearDropdown className="datepicker-txt" onKeyDown={this.handleDateChangeRaw} onChange={(e) => this.changeChartFilterDates(e, "todate")} selected={this.state.chartFilterDates.todate} dateFormat="dd/MM/yyyy" 
                                                        popperPlacement="bottom" popperModifiers={{ flip: { behavior: ["bottom"] }, preventOverflow: { enabled: false }, hide: { enabled: false } }} 
                                                        placeholderText={"(DD/MM/YYYY)"} />
                                                    </Form.Group>

                                                    <Dropdown.Item className='filter-btn' onClick={()=>this.searchMethod()}>
                                                        {this.props.t("filter")}
                                                    </Dropdown.Item>

                                                </Dropdown.Menu>
                                            </Dropdown>
                                            <Col className='datalist-wrapper'><Row>
                                                {this.state.isloading === true ? <div className='loading-icon'><img className='loader-gif' src={loader} alt="loader"/></div>:<></>}
                                                {this.props.viewtype==="cat" && this.state.category.length===0 && this.state.isloading===false ? <div className='no-data-msg'>{this.props.t("CHART_MSG.no_cat")}</div>:<></>}
                                                {this.props.viewtype==="scat" && this.state.subcategory.length===0 && this.state.isloading===false ? <div className='no-data-msg'>{this.props.t("CHART_MSG.no_subcat")}</div>:<></>}
                                                {this.props.viewtype==="brand" && this.state.brand.length===0 && this.state.isloading===false ? <div className='no-data-msg'>{this.props.t("CHART_MSG.no_brand")}</div>:<></>}
                                                
                                                {this.props.viewtype === "cat" && this.state.isloading !== true && this.state.category.length > 0?
                                                    this.state.category.map((item,i)=>{

                                                        let itemsaleper = (item.sales && item.sales.percentage ? item.sales.percentage : 0);
                                                        let itemspaceper = (item.space && item.space.percentage ? item.space.percentage : 0);
                                                        let itemprofper = (item.profit && item.profit.percentage ? item.profit.percentage : 0);
                                                        
                                                        let itemspacecolor = (itemspaceper > itemsaleper?"#EB5757":"#48a633"); 

                                                        return(
                                                            <Col xs={12} md={6} lg={12} className="single-log-content" key={i}>
                                                                <Col className="inner-content">
                                                                    <h6><div className='round-box' style={{background:item.color}}></div><div className='title-text'>{item.categoryName}</div></h6>
                                                                    <Row>
                                                                        <Col xs={4} className='round-wrapper'>
                                                                            <Col className="round-content">
                                                                                <label>{this.props.t("MP_CHART_TITLES.space")}</label>
                                                                                <CircularProgressbar value={itemspaceper} text={itemspaceper+"%"} strokeWidth={6} styles={buildStyles({textColor: '#5128A0',textSize: '22px',strokeLinecap: 'butt',pathColor: itemspacecolor,trailColor: '#f3edff'})} />
                                                                                <label className={'per-txt'+(itemspaceper > itemsaleper?' down':'')}> {item.space.facingQty ? item.space.facingQty : 0} FC</label>
                                                                            </Col>
                                                                        </Col>
                                                                        <Col xs={4} className='round-wrapper'>
                                                                            <Col className="round-content">
                                                                                <label>{this.props.t("MP_CHART_TITLES.sales")}</label>
                                                                                <CircularProgressbar value={itemsaleper} text={itemsaleper+"%"} strokeWidth={6} styles={buildStyles({textColor: '#5128A0',textSize: '22px',strokeLinecap: 'butt',pathColor: `#48a633`,trailColor: '#f3edff'})} />
                                                                                <label className='per-txt'>₪ {item.sales.sales ? numberWithCommas(item.sales.sales.toFixed(2)): 0}</label>
                                                                                
                                                                            </Col>
                                                                        </Col>
                                                                        <Col xs={4} className='round-wrapper'>
                                                                            <Col className="round-content">
                                                                                <label>{this.props.t("MP_CHART_TITLES.profit")}</label>
                                                                                <CircularProgressbar value={itemprofper} text={itemprofper+"%"} strokeWidth={6} styles={buildStyles({textColor: '#5128A0',textSize: '22px',strokeLinecap: 'butt',pathColor: `#48a633`,trailColor: '#f3edff'})} />
                                                                                <label className='per-txt'>₪ {item.profit.profit ? numberWithCommas(item.profit.profit.toFixed(2)) : 0} </label>
                                                                                
                                                                            </Col>
                                                                        </Col>
                                                                    </Row>    
                                                                </Col>
                                                            </Col>

                                                        )
                                                    })
                                                :<></>}


                                                {this.props.viewtype === "scat" && this.state.isloading !== true && this.state.subcategory.length > 0?
                                                    this.state.subcategory.map((item,i)=>{
                                                            
                                                        let itemsaleper = (item.sales && item.sales.percentage ? item.sales.percentage : 0);
                                                        let itemspaceper = (item.space && item.space.percentage ? item.space.percentage : 0);
                                                        let itemprofper = (item.profit && item.profit.percentage ? item.profit.percentage : 0);
                                                        
                                                        let itemspacecolor = (itemspaceper > itemsaleper?"#EB5757":"#48a633"); 

                                                        return(
                                                            <Col xs={12} md={6} lg={12} className="single-log-content" key={i}>
                                                                <Col className="inner-content">
                                                                    <h6><div className='round-box' style={{background:item.color}}></div><div className='title-text'>{item.subcategoryName}</div></h6>
                                                                    <Row>
                                                                        <Col xs={4} className='round-wrapper'>
                                                                            <Col className="round-content">
                                                                                <label>{this.props.t("MP_CHART_TITLES.space")}</label>
                                                                                <CircularProgressbar value={itemspaceper} text={itemspaceper+"%"} strokeWidth={6} styles={buildStyles({textColor: '#5128A0',textSize: '22px',strokeLinecap: 'butt',pathColor: itemspacecolor,trailColor: '#f3edff'})} />
                                                                                <label className={'per-txt'+(itemspaceper > itemsaleper?' down':'')}> {item.space.facingQty} FC</label>
                                                                            </Col>
                                                                        </Col>
                                                                        <Col xs={4} className='round-wrapper'>
                                                                            <Col className="round-content">
                                                                                <label>{this.props.t("MP_CHART_TITLES.sales")}</label>
                                                                                <CircularProgressbar value={itemsaleper} text={itemsaleper+"%"} strokeWidth={6} styles={buildStyles({textColor: '#5128A0',textSize: '22px',strokeLinecap: 'butt',pathColor: `#48a633`,trailColor: '#f3edff'})} />
                                                                                <label className='per-txt'>₪ {item.sales.sales ? numberWithCommas(item.sales.sales.toFixed(2)) : 0}</label>
                                                                                
                                                                            </Col>
                                                                        </Col>
                                                                        <Col xs={4} className='round-wrapper'>
                                                                            <Col className="round-content">
                                                                                <label>{this.props.t("MP_CHART_TITLES.profit")}</label>
                                                                                <CircularProgressbar value={itemprofper} text={itemprofper+"%"} strokeWidth={6} styles={buildStyles({textColor: '#5128A0',textSize: '22px',strokeLinecap: 'butt',pathColor: `#48a633`,trailColor: '#f3edff'})} />
                                                                                <label className='per-txt'>₪ {item.profit.profit ? numberWithCommas(item.profit.profit.toFixed(2)) : 0}</label>
                                                                                
                                                                            </Col>
                                                                        </Col>
                                                                    </Row>    
                                                                </Col>
                                                            </Col>

                                                        )
                                                    })
                                                :<></>}
                                                
                                                {this.props.viewtype === "brand" && this.state.isloading !== true && this.state.brand.length > 0?
                                                    this.state.brand.map((item,i) => {

                                                        let itemsaleper = (item.sales && item.sales.percentage ? item.sales.percentage : 0);
                                                        let itemspaceper = (item.space && item.space.percentage ? item.space.percentage : 0);
                                                        let itemprofper = (item.profit && item.profit.percentage ? item.profit.percentage : 0);
                                                        
                                                        let itemspacecolor = (itemspaceper > itemsaleper?"#EB5757":"#48a633"); 

                                                        return(
                                                            <Col xs={12} md={6} lg={12} className="single-log-content" key={i}>
                                                                <Col className="inner-content">
                                                                    <h6><div className='round-box' style={{background:item.color}} ></div><div className='title-text'>{item.brandName}</div></h6>
                                                                    <Row>
                                                                        <Col xs={4} className='round-wrapper'>
                                                                            <Col className="round-content">
                                                                                <label>{this.props.t("MP_CHART_TITLES.space")}</label>
                                                                                <CircularProgressbar value={itemspaceper} text={itemspaceper+"%"} strokeWidth={6} styles={buildStyles({textColor: '#5128A0',textSize: '26px',strokeLinecap: 'butt',pathColor: itemspacecolor,trailColor: '#f3edff'})} />
                                                                                <label className={'per-txt'+(itemspaceper > itemsaleper?' down':'')}> {item.space.facingQty} FC</label>
                                                                            </Col>
                                                                        </Col>
                                                                        <Col xs={4} className='round-wrapper'>
                                                                            <Col className="round-content">
                                                                                <label>{this.props.t("MP_CHART_TITLES.sales")}</label>
                                                                                <CircularProgressbar value={itemsaleper} text={itemsaleper+"%"} strokeWidth={6} styles={buildStyles({textColor: '#5128A0',textSize: '26px',strokeLinecap: 'butt',pathColor: `#48a633`,trailColor: '#f3edff'})} />
                                                                                <label className='per-txt'>₪ {item.sales.sales ? numberWithCommas(item.sales.sales.toFixed(2)): 0}</label>
                                                                                
                                                                            </Col>
                                                                        </Col>
                                                                        <Col xs={4} className='round-wrapper'>
                                                                            <Col className="round-content">
                                                                                <label>{this.props.t("MP_CHART_TITLES.profit")}</label>
                                                                                <CircularProgressbar value={itemprofper} text={itemprofper+"%"} strokeWidth={6} styles={buildStyles({textColor: '#5128A0',textSize: '26px',strokeLinecap: 'butt',pathColor: `#48a633`,trailColor: '#f3edff'})} />
                                                                                <label className='per-txt'>₪ {item.profit.profit ? numberWithCommas(item.profit.profit.toFixed(2)): 0}</label>
                                                                                
                                                                            </Col>
                                                                        </Col>
                                                                    </Row>    
                                                                </Col>
                                                            </Col>
                                                        )
                                                    })
                                                :<></>}
                                                </Row>
                                            </Col>
                                            
                                        </Tab.Pane>
                                        <Tab.Pane eventKey="ruletab">
                                            <Col xs={12} className='datalist-wrapper rules'>
                                                {this.state.isruleloading === true ? <div className='loading-icon'><img className='loader-gif' src={loader} alt="loader"/></div>:<></>}
                                                
                                                {
                                                    this.state.deptsettings!==null ?
                                                        <Table className='rules-main-tbl'>
                                                            <tbody>
                                                                <tr>
                                                                    <td style={{width:"50%"}} className="rule-box">
                                                                        <Col xs={12} className="rule-content">
                                                                            <h5 className='title'>{this.props.t("minqty")}</h5>
                                                                            <h5 className='value'>{this.state.deptsettings.min_qty?numberWithCommas(this.state.deptsettings.min_qty):0}</h5>
                                                                        </Col>
                                                                    </td>
                                                                    {/* <td style={{width:"50%"}} className="rule-box">
                                                                        <Col xs={12} className="rule-content">
                                                                            <h5 className='title'>{this.props.t("maxqty")}</h5>
                                                                            <h5 className='value'>{this.state.deptsettings.max_qty?numberWithCommas(this.state.deptsettings.max_qty):0}</h5>
                                                                        </Col>
                                                                    </td> */}
                                                                    <td style={{width:"50%"}} className="rule-box">
                                                                        <Col xs={12} className="rule-content">
                                                                            <h5 className='title'>{this.props.t("sale")} %</h5>
                                                                            <h5 className='value'>
                                                                                {this.state.deptsettings.sale_weight_percentage?this.state.deptsettings.sale_weight_percentage:0}
                                                                            </h5>
                                                                        </Col>
                                                                    </td>
                                                                </tr>
                                                                {/* <tr>
                                                                    
                                                                    <td style={{width:"50%"}} className="rule-box">
                                                                        <Col xs={12} className="rule-content">
                                                                            <h5 className='title'>{this.props.t("maxrev")}</h5>
                                                                            <h5 className='value' style={(this.state.deptsettings.max_revenue ? (this.state.deptsettings.max_revenue.toString().length > 15? {fontSize:"12px"} : this.state.deptsettings.max_revenue.toString().length > 10? {fontSize:"14px"} : {fontSize:"18px"}) : {fontSize:"18px"})}>
                                                                                {this.state.deptsettings.max_revenue?numberWithCommas(this.state.deptsettings.max_revenue.toFixed(2)):0}
                                                                            </h5>
                                                                        </Col>
                                                                    </td>
                                                                </tr> */}
                                                                {/* <tr>
                                                                    <td style={{width:"50%"}} className="rule-box">
                                                                        <Col xs={12} className="rule-content">
                                                                            <h5 className='title'>{this.props.t("shelvelife")}</h5>
                                                                            <h5 className='value'>
                                                                                {this.state.deptsettings.shelf_life?numberWithCommas(this.state.deptsettings.shelf_life):0}
                                                                                {this.state.deptsettings.shelf_life_uom?" "+(this.props.t(this.state.deptsettings.shelf_life_uom)):""}
                                                                            </h5>
                                                                        </Col>
                                                                    </td>
                                                                    <td style={{width:"50%"}} className="rule-box">
                                                                        <Col xs={12} className="rule-content">
                                                                            <h5 className='title'>{this.props.t("paceOfSalesInQty")}</h5>
                                                                            <h5 className='value'>
                                                                                {this.state.deptsettings.pace_of_sale_qty?numberWithCommas(this.state.deptsettings.pace_of_sale_qty):0}
                                                                                {this.state.deptsettings.pace_of_sale_qty_uom?" "+(this.props.t(this.state.deptsettings.pace_of_sale_qty_uom)):""}
                                                                            </h5>
                                                                        </Col>
                                                                    </td>
                                                                </tr> */}
                                                                <tr>
                                                                    <td style={{width:"50%"}} className="rule-box">
                                                                        <Col xs={12} className="rule-content">
                                                                            <h5 className='title'>{this.props.t("MVP")} %</h5>
                                                                            <h5 className='value'>
                                                                                {this.state.deptsettings.mvp_percentage?this.state.deptsettings.mvp_percentage:0}
                                                                            </h5>
                                                                        </Col>
                                                                    </td>
                                                                    <td style={{width:"50%"}} className="rule-box">
                                                                        <Col xs={12} className="rule-content">
                                                                            <h5 className='title'>{this.props.t("profit")} %</h5>
                                                                            <h5 className='value'>
                                                                                {this.state.deptsettings.profit_weight_percentage?this.state.deptsettings.profit_weight_percentage:0}
                                                                            </h5>
                                                                        </Col>
                                                                    </td>
                                                                </tr>

                                                                <tr>
                                                                    <td style={{width:"50%"}} className="rule-box">
                                                                        <Col xs={12} className="rule-content">
                                                                            <h5 className='title'>{this.props.t("minrev")}</h5>
                                                                            <h5 className='value' style={(this.state.deptsettings.min_revenue ? (this.state.deptsettings.min_revenue.toString().length > 15? {fontSize:"12px"} :this.state.deptsettings.min_revenue.toString().length > 10? {fontSize:"14px"} : {fontSize:"18px"}) : {fontSize:"18px"})}>
                                                                                {this.state.deptsettings.min_revenue?numberWithCommas(this.state.deptsettings.min_revenue.toFixed(2)):0}
                                                                            </h5>
                                                                        </Col>
                                                                    </td>
                                                                    <td style={{width:"50%"}} className="rule-box">
                                                                        <Col xs={12} className="rule-content">
                                                                            <h5 className='title'>{this.props.t("soldQty")} %</h5>
                                                                            <h5 className='value'>
                                                                                {this.state.deptsettings.sold_qty_weight_percentage?this.state.deptsettings.sold_qty_weight_percentage:0}
                                                                            </h5>
                                                                        </Col>
                                                                    </td>
                                                                </tr>
                                                            </tbody>
                                                        </Table>
                                                    :<div className={'no-rules-msg '+(this.state.isruleloading===true ? "d-none": "")}>{this.props.t("CHART_MSG.no_rule")}</div>
                                                }
                                            
                                            </Col>
                                        </Tab.Pane>
                                        
                                        <Tab.Pane eventKey="watchtab" className='watch-tab'>
                                            <div className='d-flex flex-row-reverse' style={{ marginTop:"-20px"}}>
                                                <OverlayTrigger placement={"bottom"} overlay={<Tooltip id={`tooltip-bottom`}>{this.props.t("btnnames.exporttoexcel")}</Tooltip> }>
                                                    <Button size='sm' variant="outline-primary"  className='task-exportexcel-link plg-export-link watchTabExportBtn' disabled={(this.state.watchCounts.archivedProductCount + this.state.watchCounts.issueProductCount + this.state.watchCounts.mappingCount + this.state.watchCounts.newProductCount) > 0?false:true} onClick={this.watchTabExport}><ExcelExportIcon size={22}  color={this.props.dmode?"#2CC990":"#5128a0"}/></Button>
                                                </OverlayTrigger>
                                            </div>
                                            {
                                                this.state.activeWatchSection !== -2 ?
                                                    <Accordion defaultActiveKey={this.state.activeWatchSection}>
                                                        <Accordion.Item eventKey="0">
                                                            <Accordion.Header eventKey="0" style={{cursor:"pointer"}} onClick={()=>this.changeActiveWatchSection("0")}>
                                                            {this.props.t("MAPPING")}
                                                                <label className={'count-indicater-mapping '+(this.state.watchCounts.mappingCount>0 ?"":"d-none")}>{this.state.watchCounts.mappingCount}</label>
                                                                {/* <span className={(this.props.isRTL === "rtl" ? "float-left" : "float-right")}>
                                                                    {this.state.activeWatchSection==="0" ? <ChevronUpIcon size={15}/> :<ChevronDownIcon size={15}/>}
                                                                </span> */}
                                                            </Accordion.Header>
                                                            
                                                            <Accordion.Body>
                                                                    {
                                                                        this.state.activeWatchSection === "0" && this.props.dataRuleSelectedTab === "watchtab"?
                                                                            <MappingItemList
                                                                                mp_id={(this.props.defSaveObj ? this.props.defSaveObj.mp_id : -1)}
                                                                                brandid={(this.props.brandid?this.props.brandid:-1)}
                                                                                deptid={(this.props.deptid ? this.props.deptid : -1)}
                                                                                catid={(this.props.catid ? this.props.catid : -1)}
                                                                                scatid={(this.props.scatid ? this.props.scatid : -1)}
                                                                                supplierid={(this.props.supplierid ? this.props.supplierid : -1)}
                                                                                dRulesreload={this.props.dRulesreload}
                                                                                loadIssuesCount={this.loadIssuesCount}
                                                                                chartFilterDates = {this.props.chartFilterDates}
                                                                                departmentList={this.state.departmentList}
                                                                                setAllDepartmentList={this.setAllDepartmentList}
                                                                                isRTL={this.props.isRTL}
                                                                                resetResolveSearch={this.resetResolveSearch}
                                                                                setHeirarchyIssue={this.setHeirarchyIssue}
                                                                            />
                                                                        :<></>
                                                                    }
                                                            </Accordion.Body>
                                                        </Accordion.Item>
                                                        <Accordion.Item eventKey="1">
                                                            <Accordion.Header style={{cursor:"pointer"}} onClick={()=>this.changeActiveWatchSection("1")}>
                                                                {this.props.t("products")+(this.state.watchCounts.issueProductCount>0 ?(" - ("+this.state.watchCounts.issueProductCount+")"):"")}
                                                                {/* <label className={'count-indicater '+(this.state.watchCounts.issueProductCount>0 ?"":"d-none")}>{this.state.watchCounts.issueProductCount}</label> */}
                                                                {/* <span className={(this.props.isRTL === "rtl" ? "float-left" : "float-right")}>
                                                                    {this.state.activeWatchSection==="1" ? <ChevronUpIcon size={15}/> :<ChevronDownIcon size={15}/>}
                                                                </span> */}
                                                            </Accordion.Header>
                                                            
                                                            <Accordion.Body>
                                                                {
                                                                    this.state.activeWatchSection === "1" ?
                                                                        <ProductsList
                                                                            mp_id={(this.props.defSaveObj ? this.props.defSaveObj.mp_id : -1)}
                                                                            brandid={(this.props.brandid?this.props.brandid:-1)}
                                                                            deptid={(this.props.deptid ? this.props.deptid : -1)}
                                                                            catid={(this.props.catid ? this.props.catid : -1)}
                                                                            scatid={(this.props.scatid ? this.props.scatid : -1)}
                                                                            supplierid={(this.props.supplierid ? this.props.supplierid : -1)}
                                                                            chartFilterDates = {this.props.chartFilterDates}
                                                                            isRTL={this.props.isRTL}
                                                                            copyToClipboard={this.copyToClipboard}
                                                                            loadIssuesCount={this.loadIssuesCount}
                                                                        />
                                                                    :<></>
                                                                }
                                                            </Accordion.Body>
                                                        </Accordion.Item>
                                                        <Accordion.Item eventKey="2">
                                                            <Accordion.Header style={{cursor:"pointer"}} onClick={()=>this.changeActiveWatchSection("2")}>
                                                                {this.props.t("newproducts")}
                                                                <label className={'count-indicater '+(this.state.watchCounts.newProductCount>0 ?"":"d-none")}>{this.state.watchCounts.newProductCount}</label>
                                                                {/* <span className={(this.props.isRTL === "rtl" ? "float-left" : "float-right")}>
                                                                    {this.state.activeWatchSection==="2" ? <ChevronUpIcon size={15}/> :<ChevronDownIcon size={15}/>}
                                                                </span> */}    
                                                            </Accordion.Header>
                                                            
                                                            <Accordion.Body>
                                                                {
                                                                    this.state.activeWatchSection === "2" ? 
                                                                        <NewProductsList
                                                                            mp_id={(this.props.defSaveObj ? this.props.defSaveObj.mp_id : -1)}
                                                                            brandid={(this.props.brandid?this.props.brandid:-1)}
                                                                            deptid={(this.props.deptid ? this.props.deptid : -1)}
                                                                            catid={(this.props.catid ? this.props.catid : -1)}
                                                                            scatid={(this.props.scatid ? this.props.scatid : -1)}
                                                                            supplierid={(this.props.supplierid ? this.props.supplierid : -1)}
                                                                            dRulesreload={this.props.dRulesreload}
                                                                            updatedeptobj={this.props.updatedeptobj}
                                                                            loadIssuesCount={this.loadIssuesCount}
                                                                            isRTL={this.props.isRTL}
                                                                            copyToClipboard={this.copyToClipboard}
                                                                        />
                                                                    :<></>
                                                                }
                                                            </Accordion.Body>
                                                        </Accordion.Item>
                                                        <Accordion.Item eventKey="3">
                                                            <Accordion.Header style={{cursor:"pointer"}} onClick={()=>this.changeActiveWatchSection("3")}>
                                                                {this.props.t("ARCHIVE")+(this.state.watchCounts.archivedProductCount>0 ?(" - ("+this.state.watchCounts.archivedProductCount+")"):"")}
                                                                {/* <label className={'count-indicater '+(this.state.watchCounts.archivedProductCount>0 ?"":"d-none")}>{this.state.watchCounts.archivedProductCount}</label> */}
                                                                {/* <span className={(this.props.isRTL === "rtl" ? "float-left" : "float-right")}>
                                                                    {this.state.activeWatchSection==="3" ? <ChevronUpIcon size={15}/> :<ChevronDownIcon size={15}/>}
                                                                </span> */}
                                                            </Accordion.Header>
                                                            
                                                            <Accordion.Body>
                                                                {
                                                                    this.state.activeWatchSection === "3" ?
                                                                        <ArchiveProductsList 
                                                                            mp_id={(this.props.defSaveObj ? this.props.defSaveObj.mp_id : -1)}
                                                                            brandid={(this.props.brandid?this.props.brandid:-1)}
                                                                            deptid={(this.props.deptid ? this.props.deptid : -1)}
                                                                            catid={(this.props.catid ? this.props.catid : -1)}
                                                                            scatid={(this.props.scatid ? this.props.scatid : -1)}
                                                                            supplierid={(this.props.supplierid ? this.props.supplierid : -1)}
                                                                            dRulesreload={this.props.dRulesreload}
                                                                            updatedeptobj={this.props.updatedeptobj}
                                                                            loadIssuesCount={this.loadIssuesCount}
                                                                            isRTL={this.props.isRTL}
                                                                            copyToClipboard={this.copyToClipboard}
                                                                            />
                                                                    :<></>
                                                                }
                                                            </Accordion.Body>
                                                        </Accordion.Item>
                                                        
                                                    </Accordion>
                                                :<></>

                                            }
                                        </Tab.Pane>
                                    </Tab.Content>
                                </Col>
                            </Row>
                        </Tab.Container>
                    </>:<>
                        <h6 className='text-center noresults-txt'>{this.props.t("NO_CONTENT_FOUND")}</h6>
                    </>}
                </Col>
                
            </Col>
            <AcViewModal showmodal={this.state.isShowModel} />                               
            <Modal size="md" centered={true} className={'issues-notice-modal '+(this.props.isRTL === "rtl" ? "RTL":"LTR")} show={this.state.showIssuesNoticeModal===true && this.props.noticeImgUrl!==null } onHide={() => this.setState({showIssuesNoticeModal:false})} animation={false} backdrop="static" backdropClassName="issues-notice-modal-backdrop">
                <Modal.Body>
                    <div className='closebtn' onClick={() => this.setState({showIssuesNoticeModal:false})}><XIcon size={20} /></div>
                    
                    <Row>
                        <Col xs={1}></Col>
                        <Col xs={10} style={{textAlign:"center"}}>
                            <img className='notice-png' src={this.props.noticeImgUrl} alt="notice" /><br/>
                            {
                                this.props.isRTL === "ltr" ?
                                <Col className={'txt-label'}>Check <span>{this.state.watchCount}</span> issues in <br/> the <span className='link' onClick={()=>this.initGotIt()}><u>Watch</u></span> tab</Col>
                                :
                                <Col className={'txt-label'}>בדוק <span>{this.state.watchCount}</span> בעיות בכרטיסייה <br/><span className='link' onClick={()=>this.initGotIt()}><u>צפה</u></span></Col>
                            }
                            
                            <Button className='gotit-btn' onClick={()=>this.initGotIt()}>{this.props.t("GOT_IT")}</Button>
                        </Col>
                        <Col xs={1}></Col>
                    </Row>
                </Modal.Body>
            </Modal>

            {isShowResolveLogModal?<Modal className="contimplement-modal pgPrintDeptsModal pgImportBarcodeListModal simResolveLogModal" 
                show={isShowResolveLogModal} centered onHide={() => this.toggleResolveLogModal(!isShowResolveLogModal)}>
                <Modal.Body>
                    <div className='closebtn' onClick={() => this.toggleResolveLogModal(false)}><XIcon size={30} /></div>

                    <PopoverWrapper cusid="resolvelog-info" text={<>
                        <h4 style={{ marginBottom: "15px" }}>{this.props.t("ELIGIBILITY_BASED_ON")}</h4>
                        <div className='highlight-content text-center'>
                            <h3>{this.props.t("sale")} &#62;= {this.props.t("minrev")}</h3>
                        </div>
                        <p className='text-center'>{this.props.t("OR")}</p>
                        <div className='highlight-content text-center'>
                            <h3>{this.props.t("MANDATORY")}</h3>
                        </div>
                        <p className='text-center'>{this.props.t("OR")}</p>
                        <div className='highlight-content text-center'>
                            <h3>{this.props.t("manualOverride")}</h3>
                        </div>

                        <small>{this.props.t("IF_PRODS_MISSING_IN_RESOLVE")}</small>
                    </>} placement="bottom">
                        <div className='closebtn info'><InfoIcon size={18} /></div>
                    </PopoverWrapper>

                    <h3 className='issue-header'>{this.props.t("RESOLVED_PRODLIST")}</h3>

                    <Col className='searchbox' ref={this.searchBoxRef}>
                        <Form.Control
                            className="form-control"
                            type="text"
                            placeholder={this.props.t("searchproduct")}
                            autoComplete='off'
                            value={resolveProdLogPagination.searchTxt}
                            onChange={(e) => this.handleLogSearchChange(e)}
                            onKeyDown={(e) => this.handleLogEnterSeach(e)}
                        />
                        {Icons.SearchIcon("#4F4F4F", 14)}
                    </Col>

                    {resolveProdLogPagination.totalCount > 0?
                        <h5>{this.props.t("Total")+(": "+resolveProdLogPagination.totalCount+" ")+this.props.t("items")}</h5>
                    :<></>}

                    {resolveProdLogPagination.products.length > 0?<>
                        <Col>
                            <Table size='sm' style={{marginBottom: "0px"}}>
                                <thead>
                                    <tr><th>{this.props.t("product")}</th><th width="25%">{this.props.t("status")}</th><th width="15%">{this.props.t("INOUT_STATUS.inout")}</th></tr>
                                </thead>
                            </Table>
                        </Col>
                        <Col id="uploadlog-scrollcontent" className='scroll-content' onScroll={(e)=> this.getResLogScrollPosition(e)}>
                            <Table size='sm' style={{paddingBottom:"10px"}}>
                                <tbody>
                                    {resolveProdLogPagination.products.map((xitem, xidx) => {
                                        return <tr key={xidx}>
                                            <td>
                                                <div className='img-view'>
                                                    <img src={xitem.imgUrl?xitem.imgUrl:imagePlaceholder} className={"img-resize-hor"} alt=""/>   
                                                </div>
                                                <div className='barcodeprod-details'>
                                                    <small>{xitem.barcode}</small>
                                                    {xitem.productName}

                                                    {xitem.isDeleteProduct?
                                                        <Alert variant="danger" size={"sm"}>{this.props.t("DELETED")}</Alert>
                                                    :xitem.notEligibleReason?<>
                                                        <Alert variant="danger" size={"sm"}>
                                                            {this.props.t(xitem.notEligibleReason)}
                                                        </Alert>
                                                    </>:<></>}
                                                </div>
                                            </td>
                                            <td className='text-center' width="25%">
                                                {!xitem.isNewProduct?<>
                                                    {xitem.eligibleStatus?
                                                        <Badge bg={xitem.isDeleteProduct?"warning":xitem.eligibleStatus === "ineligible"?"danger":"success"}>{xitem.isDeleteProduct?this.props.t('DELETED'):this.props.t('ELIGIBLE_STATUS.'+xitem.eligibleStatus)}</Badge>
                                                    :<label className='new-icon' style={{marginTop: "25px"}}>-</label>}
                                                </>:
                                                    <label className='new-icon'><NewReplaceProductIcon /></label>
                                                }
                                            </td>
                                            <td className='text-center' width="15%">
                                                {xitem.isConsiderToVmp && xitem.isConsiderToVmp !== "none"?<>
                                                <Badge bg={xitem.isConsiderToVmp === "out"?"danger":"success"}>{this.props.t('INOUT_STATUS.'+xitem.isConsiderToVmp)}</Badge>
                                                </>:<></>}
                                            </td>
                                        </tr>;
                                    })}
                                </tbody>
                            </Table>
                        </Col>
                    </>:!isResolveLogPaginating?<>
                        <Col className="text-center nodata-content">{this.props.t("NO_PRODUCTS_AVAILABLE")}</Col>
                    </>:<></>}

                    {isResolveLogPaginating?<>
                        <Col className={"text-center"+(resolveProdLogPagination.products.length === 0?" nodata-content":"")}>
                            <img src={loadinggif} alt="loading animation" style={{height:"20px"}}/>
                        </Col>
                    </>:<></>}

                </Modal.Body>
                <Modal.Footer style={{display:"initial", textAlign:"right"}}>
                    <Button type="button" variant="secondary" size="sm" className={(this.props.isRTL==="rtl"?"float-left":"float-right")} onClick={() => this.toggleResolveLogModal(false)} style={{borderRadius:"15px"}}>{this.props.t('btnnames.close')}</Button>
                </Modal.Footer>
            </Modal>:<></>}

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
                                                    <img src={xitem.imgUrl?xitem.imgUrl:imagePlaceholder} onClick={() => this.findProductData(xitem, true)} className={"img-resize-hor"} alt=""/>   
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
                        <Button variant='success' onClick={()=>this.sendToDepAll(true)}>{this.props.t('SEND_TO_DEP_AND_REFRESH')}</Button>
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

            {/* <AcViewModal showmodal={this.props.noticeImgUrl===null} /> */}
            
        </>);
    }
}

const mapStateToProps = state => ({
    ...state
});

const mapDispatchToProps = dispatch => ({
    setMPCategoryDataCache: (payload) => dispatch(mpCategoryDataCacheSetAction(payload)),
    setMPSubCategoryDataCache: (payload) => dispatch(mpSubCategoryDataCacheSetAction(payload)),
    setMPBrandDataCache: (payload) => dispatch(mpBrandDataCacheSetAction(payload)),
    setfilterDates: (payload) => dispatch(filterDates(payload))
});

export default withTranslation()(withRouter(connect(mapStateToProps, mapDispatchToProps)(DataRuleContent)));



