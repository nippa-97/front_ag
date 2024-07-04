import React, { Component } from 'react';
import { Col, Row, Button, Modal } from 'react-bootstrap'; // 
import { withTranslation } from 'react-i18next';
import { withRouter } from 'react-router-dom';
import { XIcon, ChevronLeftIcon } from '@primer/octicons-react';
import { connect } from 'react-redux';

import { selectedMasterPlanSetAction, selectedMPCategorySetAction, selectedMPCategoryRectSetAction, selectedMPSubCatSetAction, selectedMPBrandSetAction,
    mpCategoryDataCacheSetAction, mpSubCategoryDataCacheSetAction, mpBrandDataCacheSetAction, mpCategoryNavCacheSetAction, mpSubCategoryNavCacheSetAction, mpBrandNavCacheSetAction, newRefresh, mpEditStackHistorySetAction, setNewProdCountSubCatAction, setNewProdCountCatAction } from '../../../actions/masterPlanogram/masterplanogram_action';

import { submitSets } from '../../UiComponents/SubmitSets';
import { submitCollection } from '../../../_services/submit.service';
import { alertService } from '../../../_services/alert.service';
import { AcViewModal } from '../../UiComponents/AcImports';
import { getNameorIdorColorofBox, validateDeptSettings } from '../AddMethods';
import { catRectEnums } from '../../../enums/masterPlanogramEnums';
import { roundOffDecimal } from '../../../_services/common.service';

// import CatDrawing from './CatDrawing/CatDrawing';
// import BottomContent from './BottomContent/bottomContent';
// import DataRuleContent from './DataRulesContent/druleContent';
import CategoryContent from './categorycontent/catContent';
import SubcatContent from './scategorycontent/scatcontent';
import BrandContent from './brandcontent/brandcontent';
//import SimulateFilter from './simulateFilter/simulateFilter';
import ProductsSidebar from '../productsview/productsSideBar';
import DepartmentSwitch from './department-switchers';

import PagesList from '../../../pages';

import './catview.scss';
import SimulateMiddleBar from '../simulateview/simulateMiddleBar/simulateMiddleBar';
import { confirmAlert } from 'react-confirm-alert';
// import AuiSideBar from '../auisidebar/AuiSideBar';
import AllSimulationModal from '../simulateview/AllSimulationModal/AllSimulationModal';
import SearchMPList from './searchMPList';
import AuiSideBarComponent from '../auisidebar/AuiSideBarComponent';

//import loaderanime from '../../../assets/img/loading-sm.gif';
import newImg from '../../../assets/img/new-mp.png';


const arrayMoveLTR = (array, from, to) => {
    array = array.slice();
    arrayMoveMutate(array, from, to);
    //rechange rank number
    for (let i = 0; i < array.length; i++) {
        array[i].rank = (i+1);
    }
    //console.log(array);
    return array;
    
};

// const arrayMoveRTL = (array, from, to) => {
//     array = array.slice();
//     arrayMoveMutate(array, from, to);
//     //rechange rank number
//     for (let i = 0; i < array.length; i++) {
//         array[i].rank = (i+1);
//     }
    
//     return array;
    
// };

const arrayMoveMutate = (array, from, to) => {
    array.splice(to < 0 ? array.length + to : to, 0, array.splice(from, 1)[0]);
};

const history_max_length = 50;

const getCalculatedDate = (dt) =>{
    var requiredDate= dt.setMonth(dt.getMonth() - 6);
    return new Date(requiredDate)
}

export class MPCategoryView extends Component {
    constructor(props){
        super(props);
        
        this._isMounted = false;
        this.VNRef = React.createRef();
        
        this.state = {
            defSaveObj: null,
            auiMpObj: null,
            isShowLoadingModal: false, loadingReqCount: 0,
            summaryViewType: "cat",
            isallsimulatemodal:false,
            openOneCategory:false,
            loadedTagsList: [],
            haveChnagesinCat:false,

            showSidebar:false,  showFullSidebar: false, showFullSidebarSizeChange:false,
            brandsList:[], selectedCat: null, selectedSubCat: null, selectedBrand: null,
            isProductsLoaded:false,
            loadedNewProducts:[], loadedNewTestingProds: [], loadedTopProds:[], onTopHasTagsIndexes:[] ,loadedMvpProds:[], mvpMandatoryIndexes: [],
            loadedSidebarBrands: [],
            loadedCatsList: [],
            //drawing
            drawChangesAvailable: false,
            singleFieldWidth: 300, singleFieldHeight: 265, minWidthCheckValue: 160, oldCatLength: 0,

            productSidebarhistoryList :[],//for storing product sidebar history

            chartFilterDates:{fromdate:getCalculatedDate(new Date()),todate:new Date(), isUpdated: false,},
            chartEnabled:true,drulesEnabled:true,
            sliderIndex:0,

            //
            bottomFieldCount: 0, dateLoadOneTime: true,
            fieldCountCallOver:false,
            isUpdatesAvailable: false,

            //dept settings
            deptsettings: this.defDepSettings(), isdeptdataloading: true,
            isdepdataloaded: false, isdeptupdateavailable: false,
            isneeddeptsettingvalid: false,

            isHasSnap:false,
            hasUnsavedProductsSidebarChanges:false,
            snapshotSaveCallLoading:false,
            snapshostCallsPendingDataList:[],

            isDeptListLoading: false, mpDepartmentList: [],
            dataRuleSelectedTab: "datatab",
            watchTabCountLoaded: false,
            noticeImgUrl: null,
            depDirectType: "", isShowNewProdOnload: false,
            //aui
            isAuiOpen:false,
            showNew: true,
            showNewNoticeModal:false,
            isAUIDisabled: false,
            mainScreenMpId: null,
            isAuiViewsAllow:false,
            
            //excel import data
            importedDataObj: {
                isImportDataLoading: false,
                excelUploadList: [],
                paginationMaxCount: 150, 
                excelStartIndex: 0,
                totalExcelProdCount: 0,
                excelSearchText: "",
                prevMpId: null,
            }
        }
    }

    componentDidMount() {
        this._isMounted = true;
        
        if (this._isMounted) {
            let isUserAUIAllowed = true; //false
            //user check for AUI allow
            /* if(this.props.signedobj && this.props.signedobj.signinDetails){
                let userobj = this.props.signedobj.signinDetails;

                if(userobj.userRolls){
                    let userrole = userobj.userRolls.systemMainRoleType;
                    // console.log(userrole);

                    if(userrole === usrRoles.CM){
                        isUserAUIAllowed = true;
                    }
                }
            } */

            this.setState({ 
                isAuiViewsAllow: (isUserAUIAllowed && this.props.signedDetails.isAUION!==undefined?this.props.signedDetails.isAUION:false)
            });

            this.props.setMpEditStackHistory(null);
            this.getAllTags();

            if(this.props.mpstate && this.props.mpstate.mpDetails){

                let viewdetails = this.props.mpstate.mpDetails;
                
                this.setState({
                    depDirectType: viewdetails.directType,
                    isShowNewProdOnload: viewdetails.isShowNewProd
                },()=>{
                    if(viewdetails.isLatestAvailable === false && viewdetails.mp_id > -1){
                        this.setState({ 
                            defSaveObj: viewdetails, 
                            isAUIDisabled: (viewdetails.isAUIConverted === true?true:false)
                        });
                        //load field count for bottom view label
                        this.loadFieldCount(viewdetails);
                        this.loadSettingDetails(viewdetails);
                    } else{
                        this.loadMPDetails(viewdetails);
                    }
                });
            }
        }
    }

    componentWillUnmount(){
        this._isMounted = false;
    }
    
    defDepSettings = () => {
        //return { chain_has_department_id: 0, min_qty: 0, max_qty: 0, min_revenue: 0, max_revenue: 0, shelf_life: 0, pace_of_sale_qty: 0, shelf_life_uom: "days", pace_of_sale_qty_uom: "per_day" };
        return { chain_has_department_id: 0, min_qty: 0, min_revenue: 0 };
    }
    //get chain dept meta data onload of modal
    loadSettingDetails = (viewdetails, isnewshow, isOnlyMPLoad) => {
        if(viewdetails){

            if(viewdetails.mp_id > -1){

                if(this.props.mpstate.newRefresh && this.props.mpstate.newRefresh === true){
                    this.setState({ showNew: true }); // showNewNoticeModal: true, 
                    let datesobj = {
                        fromdate: viewdetails.searchFromDate ? new Date(viewdetails.searchFromDate) : new Date(new Date().setMonth(new Date().getMonth() - 6)),
                        todate: viewdetails.searchToDate ? new Date(viewdetails.searchToDate) : new Date(), 
                        isUpdated: false,
                    }
                    this.changeChartFilterDates(datesobj, true);
                }

                let checkobj = "?chainHasDepartmentId="+viewdetails.department.department_id+"&mp_id="+viewdetails.mp_id;
                
                this.setState({ isdeptdataloading: (isOnlyMPLoad === true?false:true) }, () => {
                    submitSets(submitCollection.getDepartmentMetaData, checkobj, false).then(res => {
                        // console.log(res);
            
                        if(res && res.status){
                            this.setState({ deptsettings: res.extra, isdepdataloaded: true, isdeptdataloading: false }, () => {
                                // console.log(this.state.deptsettings);
                                
                                    if(!validateDeptSettings(this.state.deptsettings)){
                                        this.setState({ isneeddeptsettingvalid: true });
                                    } else{
                                        this.setState({ isneeddeptsettingvalid: false });
                                    }
                               
                                
                            });
                        } else{
                            let defdeptsettings = this.defDepSettings();
                            defdeptsettings["chain_has_department_id"] = viewdetails.department.department_id;
                            this.setState({ deptsettings: defdeptsettings, isdepdataloaded: true, isdeptdataloading: false, isneeddeptsettingvalid: true });
                        }
                        // this.setState({ isAuiOpen:(this.state.depDirectType==="AUI")?true:false})
                    });
                });
            }else{

                let defdeptsettings = this.defDepSettings();
                defdeptsettings["chain_has_department_id"] = viewdetails.department.department_id;

                // console.log(this.props.signedDetails);
                //default chain values

                if(this.props.signedDetails && this.props.signedDetails.chain && this.props.signedDetails.chain.sale_weight_percentage !== undefined){
                    let chainDetails = this.props.signedDetails.chain;

                    defdeptsettings["profit_weight_percentage"] = chainDetails.profit_weight_percentage;
                    defdeptsettings["sale_weight_percentage"] = chainDetails.sale_weight_percentage;
                    defdeptsettings["sold_qty_weight_percentage"] = chainDetails.sold_qty_weight_percentage;
                }
                // console.log(structuredClone(defdeptsettings));

                this.setState({ deptsettings: defdeptsettings, isdepdataloaded: true, isdeptdataloading: false, isneeddeptsettingvalid: true });
            }
            
        }
    }
    //update department object
    updateDeptObject = (settingobj, isdataloading, isreset) => {
        if(settingobj){
            this.setState({ isdepdataloaded: false }, () => {
                this.setState({ deptsettings: settingobj, isdepdataloaded: true, isdeptupdateavailable: (isreset?false:true) });
            });
        }
        if(isdataloading !== undefined){
            this.setState({ isdepdataloaded: isdataloading, isdeptupdateavailable: false, isneeddeptsettingvalid: false, 
                watchTabCountLoaded: (isdataloading && isreset?false:this.state.watchTabCountLoaded), 
            });
        }
    }

    //load all departments for dept switch
    // getAllDepartments = () =>{
    //     let svobj = { name:"", isReqPagination:false, startIndex: 0, maxResult:0 };

    //     this.setState({ isDeptListLoading: true }, () => {
    //         submitSets(submitCollection.mpDepartmentList, svobj, true).then(res => {
    //             if(res && res.status){
    //                 this.setState({ mpDepartmentList: (res.extra && res.extra.length > 0?res.extra:[]) });
    //             } 
    //             this.setState({ isDeptListLoading: false });
    //         });
    //     });
        
    // }

    loadMPDetails = (viewdetails, isnewrefresh, isshowaui, isOnlyMPLoad) => {
        this.props.setNewProdCountCat(null);
        this.props.setNewProdCountSubCat(null);
        let svobj;
        if(viewdetails.mp_id > -1){
            svobj = { chainHasDepartmentId:viewdetails.department.department_id, mp_id:viewdetails.mp_id };
            this.setState({showNew: true});
        }else{
            if(viewdetails.mp_id === -2){
                svobj = { chainHasDepartmentId:viewdetails.department.department_id, mp_id:viewdetails.mp_id };
                this.setState({showNew: false});
            }else{
                svobj = { chainHasDepartmentId:viewdetails.department.department_id };        
            }
        }
          
        this.setState({ isShowLoadingModal: true }, () => {

            if(viewdetails.mp_id !== -2){

                submitSets(submitCollection.loadMp, svobj, false).then(res => {
                    //console.log(res);
                    if(res && res.status){
                        let newsaveobj = ((res.extra && Object.keys(res.extra).length > 0)?res.extra:viewdetails);
                        //print mpversion details 
                        var mpDetail={
                            name:newsaveobj.name,
                            version:newsaveobj.version
                        }
                        newsaveobj["masterPlanogram"]=mpDetail
                        //end
                        //if new refresh upload
                        if(isnewrefresh){
                            this.props.setNewRefresh(true);
                        }

                        //show aui screen
                        /* if(isshowaui){
                            this.handleAuiOpen(true);
                        } */
                        this.props.setMasterPlanAction(newsaveobj);
                        this.setState({
                            isShowLoadingModal: false, 
                            defSaveObj: newsaveobj,
                            mainScreenMpId:newsaveobj.mp_id,
                            showNew: true,
                            depDirectType: (isshowaui?"AUI":this.state.depDirectType),
                            isAUIDisabled: (viewdetails.isAUIConverted === true?true:false)
                        }, () => {
                            
                            // this.getNewProdCountOfLevels(newsaveobj);
                            //load field count for bottom view label
                            this.loadFieldCount(newsaveobj);
                            this.loadSettingDetails(newsaveobj, false, isOnlyMPLoad);
                            
                            //load imported prod list
                            let importedDataObj = this.state.importedDataObj;
                            importedDataObj.excelStartIndex = 0;
                            importedDataObj.excelSearchText = "";

                            this.setState({ importedDataObj: importedDataObj }, () => {
                                this.loadImportProdList();
                            });

                        });    
                    } else{
                        alertService.error(this.props.t("ERROR_OCCURRED"));
                        this.setState({ 
                            isShowLoadingModal: false, 
                            watchTabCountLoaded: true 
                        });
                    }
                });    
            }else{
                //print mpversion details 
                var mpDetail={
                    name:viewdetails.name,
                    version:viewdetails.version
                }
                viewdetails["masterPlanogram"]=mpDetail
                //end
                this.props.setMasterPlanAction(viewdetails);
                this.setState({
                    isShowLoadingModal: false, 
                    defSaveObj: viewdetails,
                    isAUIDisabled: (viewdetails.isAUIConverted === true?true:false),
                    watchTabCountLoaded: true
                }, () => {
                    
                    //load field count for bottom view label
                    this.loadFieldCount(viewdetails);
                    this.loadSettingDetails(viewdetails);
                });    
            }
        });
    }
    //load field count
    loadFieldCount = (viewdetails) => {
        //set date if available
        if(this.state.dateLoadOneTime){
            if(viewdetails.searchFromDate && viewdetails.searchFromDate !== "" && viewdetails.searchToDate && viewdetails.searchToDate !== ""){
                let datesobj = {
                    fromdate: viewdetails.searchFromDate ? new Date(viewdetails.searchFromDate) : new Date(new Date().setMonth(new Date().getMonth() - 6)),
                    todate: viewdetails.searchToDate ? new Date(viewdetails.searchToDate) : new Date(), 
                    isUpdated: false,
                }
                this.changeChartFilterDates(datesobj, true);
            }else{

                if(viewdetails.mp_id === -2){
                    let datesobj = {
                        fromdate:  new Date(new Date().setMonth(new Date().getMonth() - 6)),
                        todate:  new Date(), 
                        isUpdated: false,
                    }
                    this.changeChartFilterDates(datesobj, true);    
                }
            }
            
            this.setState({ dateLoadOneTime: false,fieldCountCallOver:false });
        }
        

        let svobj = { chainHasDepartmentId:viewdetails.department.department_id };

        submitSets(submitCollection.mostFrequentlyUsedFieldCount, svobj, false).then(res => {
            //console.log(res);
            if(res && res.status && res.extra){
                  this.setState({ bottomFieldCount: res.extra,fieldCountCallOver:true });
            }else{
                this.setState({fieldCountCallOver:true });
            }
        });
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

    //update save obj from child
    updateSavefromChild = (viewobj, isupdatesavailable, isupdatedates, savefilterobj, chartDates) => {
        let checkupdatesavailable = (isupdatesavailable?isupdatesavailable:false);
        let csaveobj = (viewobj?viewobj:this.state.defSaveObj);
        //print mpversion details 
        var mpDetail={
            name:csaveobj.name,
            version:csaveobj.version
        }
        csaveobj["masterPlanogram"]=mpDetail
        //end
        this.setState({ 
            defSaveObj: csaveobj, 
            isUpdatesAvailable: checkupdatesavailable,
            isAUIDisabled: (csaveobj.isAUIConverted === true?true:false)
        }, () => {
            if(isupdatedates){
                this.updateProductDateRanges(savefilterobj, chartDates);
            }
        });
    }

    //reset update available
    resetUpdatesAvailable = (isonlystate, _callback) => {

        this.setState({ isUpdatesAvailable: false }, () => {
            if(!isonlystate){
                this.setState({ summaryViewType: null }, () => {
                    this.setState({ summaryViewType: "cat" }, () => {
                        if(_callback){
                            _callback();
                        }
                    });
                });
            } else{
                if(_callback){
                    _callback();
                }
            }
        });
    }

    // change haveChnagesinCat
    handlehaveChnagesinCat=(val)=>{
        this.setState({haveChnagesinCat:val})
    }
    //#MP-MW-01 set redux details and change main view
    redirectToCategory = (type, selobj, sliderIndex, selrectobj) => {
        if(this.state.hasUnsavedProductsSidebarChanges===true){
            confirmAlert({
                title: this.props.t('UNSAVE_CHANGES'),
                message: (this.props.t('YOU_HAVE_UNSAVED_CHANGES_SURE_TO_LEAVE')),
                overlayClassName: (this.props.isRTL === "rtl" ? "alertrtl-content" : ""),
                buttons: [{
                    label: this.props.t('btnnames.yes'),
                    onClick: () => {    
                        this.navigateProcess(type, selobj, sliderIndex, selrectobj);
                    }
                }, {
                    label: this.props.t('btnnames.no')
                }]
            });
        }
        else{
            this.navigateProcess(type, selobj, sliderIndex, selrectobj);
        }

        
    }

    navigateProcess = (type, selobj, sliderIndex, selrectobj) =>{
        //console.log(type,selobj);
        if(type === "scat"){
            this.props.setMPCategoryAction(selobj);
            this.props.setMPCategoryRectAction(selrectobj);
        }else if(type === "brand"){
            if(!selobj.rects || selobj.rects.length === 0){
                alertService.error(this.props.t("cannot_redirect_without_boxes"));
                return false;
            }
            this.props.setMPSubCategoryAction(selobj);
        }  else if(type === "product"){
            this.props.setMPBrandAction(selobj);
            setTimeout(() => {
                this.toggleSidebar(true);
            }, 100);
        }
        

        // let prevviewtype = JSON.parse(JSON.stringify(this.state.summaryViewType)); 
        this.setState({ summaryViewType: null, sliderIndex:(sliderIndex ? sliderIndex : 0), hasUnsavedProductsSidebarChanges:false }, () => {
            /* if(type === "product"){
                this.setState({ summaryViewType: prevviewtype });
            } else{
                this.setState({ summaryViewType: type });
            } */
            this.setState({ summaryViewType: type });
        });
    }

    //#MP-MW-03 department reset and reload
    changeDepartmentAndLoadData = (viewdetails, isnewrefresh) => {
        this.clearDataCaches("all");
        this.setState({ dateLoadOneTime: true });

        if(this.state.isUpdatesAvailable){
            this.notsaveConfirm((iscontinue) => {
                if(iscontinue){
                    this.setState({ 
                        defSaveObj: null, 
                        isShowLoadingModal: false, 
                        summaryViewType: "cat", 
                        isAuiOpen: false,
                        watchTabCountLoaded: false,
                        showNew: true,
                        isAUIConverted: false,
                        depDirectType: ""
                    }, () => {
                        if(!isnewrefresh){
                            this.loadMPDetails(viewdetails, isnewrefresh);
                        } else{
                            this.resetForNewVersion(viewdetails);
                        }
                    });
                    
                    // this.loadSettingDetails(viewdetails); 
                }
            });
        } else{
            this.setState({
                defSaveObj: null, 
                isShowLoadingModal: false, 
                summaryViewType: "cat", 
                isAuiOpen: false,
                watchTabCountLoaded: false,
                showNew: true,
                isAUIConverted: false,
                depDirectType: ""
            }, () => {
                if(isnewrefresh){
                    this.resetForNewVersion(viewdetails);
                } else{
                    this.loadMPDetails(viewdetails, isnewrefresh); 
                }
            });

            // this.loadSettingDetails(viewdetails); 
        }
    }
    //reset vmp view for new version
    resetForNewVersion = (csaveobj) => {
        //print mpversion details 
        var mpDetail={
            name:csaveobj.name,
            version:csaveobj.version
        }
        csaveobj["masterPlanogram"]=mpDetail
        //end
        this.setState({
            defSaveObj: csaveobj,
            summaryViewType: "cat",
            showNew: false,
            watchTabCountLoaded: true,
            isAUIDisabled: (csaveobj.isAUIConverted === true?true:false)
        }, () => {
            this.props.setNewRefresh(true);
            this.loadSettingDetails(csaveobj, true);
        });
    }
    //
    handleGoBack = () => {
        this.props.history.push("/masterplanograms");
    }
    //toggle onecategory open: 
    toggleOneCategory=()=>{
        this.setState({openOneCategory:!this.state.openOneCategory})
    }
    //load all tags
    getAllTags = () => {
        let sobj = {isReqPagination: false, type:"store", tagName: ""}
        submitSets(submitCollection.searchTags, sobj).then(res => {
            //console.log(res.extra);

            if(res && res.status && res.extra){
                this.setState({
                    loadedTagsList: res.extra,
                });
            }
        });
    }
    //#MP-MW-02 toggle showing view
    toggleSummary = (ctype, isChangesAvailable, evt) => {
        if(evt){
            evt.preventDefault();
        }

        let deptsettings = this.state.deptsettings;
        if(!validateDeptSettings(deptsettings, this.props.t, true)){
            return false;
        }
        
        if(isChangesAvailable){
            this.notsaveConfirm((iscontinue) => {
                if(iscontinue){
                    this.navigateToggleSummary(ctype);
                }
            });
        } else{
            this.navigateToggleSummary(ctype);
        }
    }
    
    navigateToggleSummary = (ctype)=>{
        if(this.state.hasUnsavedProductsSidebarChanges===true){
            confirmAlert({
                title: this.props.t('UNSAVE_CHANGES'),
                message: (this.props.t('YOU_HAVE_UNSAVED_CHANGES_SURE_TO_LEAVE')),
                overlayClassName: (this.props.isRTL === "rtl" ? "alertrtl-content" : ""),
                buttons: [{
                    label: this.props.t('btnnames.yes'),
                    onClick: () => {    
                        this.setState({ summaryViewType: ctype, hasUnsavedProductsSidebarChanges:false });
                    }
                }, {
                    label: this.props.t('btnnames.no')
                }]
            });
        }
        else{
            this.setState({ summaryViewType: ctype, hasUnsavedProductsSidebarChanges:false });
        }
    }

    showLoadingModal = (val) =>{
        // console.log(val);
        this.setState({ isShowLoadingModal:val });
    }

    //filter simulation methods
    toggleSimulateAllModal = (isNoConfirm, isLoadDetails) =>{
        if(this.state.isallsimulatemodal){
            //check unsaved changes
        if(this.props.mpstate.mpstackHistory&&this.props.mpstate.mpstackHistory.past&&this.props.mpstate.mpstackHistory.past.length>0){
            //have unsavedchnages
            confirmAlert({
                title: this.props.t('UNSAVE_CHANGES'),
                message: (this.props.t('YOU_HAVE_UNSAVED_CHANGES_SURE_TO_LEAVE')),
                overlayClassName: (this.props.isRTL === "rtl" ? "alertrtl-content" : ""),
                buttons: [{
                    label: this.props.t('btnnames.yes'),
                    onClick: () => {  
                        setTimeout(() => {
                            this.closeSimulationModal(isNoConfirm, isLoadDetails,true)
                        }, 50);  
                        
                    }
                }, {
                    label: this.props.t('btnnames.no')
                }]
            });
        }else{
            //no unsaved changes
            this.closeSimulationModal(isNoConfirm, isLoadDetails)
        }
           
            
        }else{
            //open model

            if(this.state.isUpdatesAvailable){
                //unsave changes in vmp
                confirmAlert({
                    title: this.props.t('UNSAVE_CHANGES'),
                    message: (this.props.t('VMP_NOT_SAVED_SAVE_BEFORE_CONTINIUE')),
                    overlayClassName: (this.props.isRTL === "rtl" ? "alertrtl-content" : ""),
                    buttons: [ {
                        label: this.props.t('OKAY')
                    }]
                });
            }else{
                this.setState({ isallsimulatemodal: !this.state.isallsimulatemodal,openOneCategory:false });
            }
           
        }
       
    }
    closeSimulationModal=(isNoConfirm, isLoadDetails,isclosewithoutask)=>{
        this.sendmarkStackableCall()
            //close model
            if(isNoConfirm){
                this.setState({ isallsimulatemodal: !this.state.isallsimulatemodal,openOneCategory:false }, () => {
                    if(isLoadDetails){
                        let cdefSaveObj = JSON.parse(JSON.stringify(this.state.defSaveObj));

                        this.setState({ 
                            defSaveObj: null, 
                            isShowLoadingModal: false, 
                            summaryViewType: "cat", 
                            watchTabCountLoaded: true,
                            showNew: true,
                            isAuiOpen: false,
                        }, () => {
                            this.loadMPDetails(cdefSaveObj, false, true);
                        });
                    }
                });
            }else{
                if(isclosewithoutask){
                    this.setState({ isallsimulatemodal: !this.state.isallsimulatemodal,openOneCategory:false });
                }else{
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

                }
                

            }
    }
    sendmarkStackableCall=(type)=>{
        if(this.props.mpstate.mpStackableProdList!==null&&this.props.mpstate.mpStackableProdList.length>0){
            this.setState({
                // loadinggif:true,loadingstackablecall:true,
                isStackableEdited:false},()=>{
                var sobj =this.props.mpstate.mpStackableProdList!==null?this.props.mpstate.mpStackableProdList:[]
                submitSets(submitCollection.bulkUpdateByProductClick, sobj, false, null, true).then(res => {
                    if(res && res.status){
                        // alertService.success(res.extra===""?this.props.t("SUCCESSFULLY_UPDATED"):res.extra)
                        this.setState({
                            // loadinggif: false,loadingstackablecall:false,
                            markablestackable:false, stackableCountofmark:"",},()=>{
                            
                        });
                    }else{
                        // alertService.error(res.extra===""?this.props.t("erroroccurred"):res.extra)
                        // this.setState({loadinggif: false,loadingstackablecall:false})
                    }
                });
                if(type==="back"){
                    this.toggleOneCategory()
                }
            })
        }
      
    }

    //#MP-MW-04 ******chart date change****** //
    changeChartFilterDates = (dateobj, isonload) => {
        this.setState({chartEnabled: this.compareDatesList(this.state.chartFilterDates,dateobj)},()=>{ //, drulesEnabled: false
            this.clearDataCaches("all"); //clear data cache

            if(!isonload){
                dateobj["isUpdated"] = true;
            }

            this.setState({chartFilterDates: dateobj, chartEnabled: true}, () => { //, drulesEnabled: true
                if(!isonload){
                    this.dRulesreload();
                }
            });
        });
    }

    compareDatesList = (cutlist, newlist) => {
        let curfdate = new Date(cutlist.fromdate).getTime();
        let curtdate = new Date(cutlist.todate).getTime();

        let newfdate = new Date(newlist.fromdate).getTime();
        let newtdate = new Date(newlist.todate).getTime();

        return (curfdate === newfdate && curtdate === newtdate);
    }

    chartsFilterContinue = () =>{
        this.setState({chartEnabled:false, drulesEnabled:false},()=>{
            this.setState({chartEnabled:true, drulesEnabled:true})
        });
    }

    dRulesreload = (isnewrefresh, isOnlyMPLoad) => {
        if(isOnlyMPLoad){
            let cdefSaveObj = JSON.parse(JSON.stringify(this.state.defSaveObj));
            this.loadMPDetails(cdefSaveObj, false, false, true);
        } else{
            this.clearDataCaches("all"); //clear data cache
            this.setState({drulesEnabled: false},()=>{
                this.setState({drulesEnabled: true, watchTabCountLoaded: false});
                //reset with data
                let defSaveObj;
                if(this.state.defSaveObj && this.state.defSaveObj.mp_id === -2){
                    defSaveObj = this.props.mpstate.mpDetails;
                }else{
                    defSaveObj = this.state.defSaveObj
                }
                
                this.changeDepartmentAndLoadData(defSaveObj, isnewrefresh);
            });
        }
    }    

    // ******side product bar methods******* //
    toggleSidebar = (isshow) =>{
        this.setState({showSidebar:(isshow !== undefined?isshow:!this.state.showSidebar), showFullSidebar: false},()=>{
            if(this.state.showSidebar === true) {
                let catrectdetails = (this.props.mpstate && this.props.mpstate.mpCatRectDetails?this.props.mpstate.mpCatRectDetails:null);
                let subcatdetails = (this.props.mpstate && this.props.mpstate.mpSubCatDetails?this.props.mpstate.mpSubCatDetails:null);
                let branddetails = (this.props.mpstate && this.props.mpstate.mpBrandDetails?this.props.mpstate.mpBrandDetails:null);
                
                let brandslist = [];
                if(subcatdetails){
                    for (let i = 0; i < subcatdetails.rects.length; i++) {
                        const rectitem = subcatdetails.rects[i];
                        let rectbrandslist = rectitem.brands;
                        //check is it already added
                        for (let j = 0; j < rectbrandslist.length; j++) {
                            const branditem = rectbrandslist[j];
                            let brandmditem = branditem.brand;

                            let alreadyaddedidx = brandslist.findIndex(x => x.brandId === brandmditem.brandId);

                            if(alreadyaddedidx > -1){
                                brandslist[alreadyaddedidx].brandItems.push(branditem);
                            } else{
                                //create new object for added list
                                let newbrandobj = {
                                    brandId: brandmditem.brandId,
                                    brandName: brandmditem.brandName,
                                    brandColor: brandmditem.color,
                                    brandItems: [branditem],
                                    newProdCount: 0
                                };
                                brandslist.push(newbrandobj);
                            }
                        }
                    }
                }
                
                this.setState({ brandsList: brandslist, selectedCat: catrectdetails, selectedBrand:branddetails, selectedSubCat: subcatdetails }, () => {
                    this.loadSidebarProductList();
                    // this.loadSidebarBrandList();
                    this.loadSideBarBrandNewProductCount();
                });
            }
            
        });
    }
    //toggle for full screen
    toggleFullSidebar = () => {
        this.setState({ showFullSidebar: !this.state.showFullSidebar });

        if(this.state.showFullSidebarSizeChange===true){
            setTimeout(() => {this.setState({showFullSidebarSizeChange:!this.state.showFullSidebarSizeChange});}, 450);
        }

        if(this.state.showFullSidebarSizeChange===false){
            setTimeout(() => {this.setState({showFullSidebarSizeChange:!this.state.showFullSidebarSizeChange});}, 150);
        }
    }

    changeSidebarBrand = (branddetails) =>{
        if(this.state.hasUnsavedProductsSidebarChanges===true){
            confirmAlert({
                title: this.props.t('UNSAVE_CHANGES'),
                message: (this.props.t('YOU_HAVE_UNSAVED_CHANGES_SURE_TO_LEAVE')),
                overlayClassName: (this.props.isRTL === "rtl" ? "alertrtl-content" : ""),
                buttons: [{
                    label: this.props.t('btnnames.yes'),
                    onClick: () => {    
                        this.setState({selectedBrand:branddetails.brandId},()=>{
                            this.props.setMPBrandAction(branddetails.brandId);
                            this.loadSidebarProductList();
                        });
                    }
                }, {
                    label: this.props.t('btnnames.no')
                }]
            });

        }
        else{
            this.setState({selectedBrand:branddetails.brandId},()=>{
                this.props.setMPBrandAction(branddetails.brandId);
                this.loadSidebarProductList();
            });
        }
    }
    //load sidebar brand list with counts
    // loadSidebarBrandList = () => {
    //     let selectedsubcat = this.state.selectedSubCat;
    //     let subcatmpid = (selectedsubcat?selectedsubcat.id:-1);

    //     this.setState({ loadedSidebarBrands: [] }, () => {
    //         submitSets(submitCollection.newProductCountsForBrands, ("?mpSubCatid="+subcatmpid)).then(res => {
    //             // console.log(res);
    //             let brandlist = this.state.brandsList;
    //             if(res && res.status && res.extra){
    //                 let newcountlist = (res.extra && res.extra.length > 0?res.extra:[]);

    //                 for (let i = 0; i < this.state.brandsList.length; i++) {
    //                     const branditem = this.state.brandsList[i];
                        
    //                     let foundcountitem = newcountlist.find(x => x.brandId === branditem.brandId);
                        
    //                     if(foundcountitem){
    //                         branditem["newProdCount"] = foundcountitem.newProdCount;
    //                     } else{
    //                         branditem["newProdCount"] = 0;
    //                     }
    //                 }
    //             }
                
    //             this.setState({ loadedSidebarBrands: brandlist });
    //         });
    //     });
    // }

    loadSideBarBrandNewProductCount = () => {

        let cdefSaveObj = this.state.defSaveObj;
        let mpid = (cdefSaveObj?cdefSaveObj.mp_id:-1);

        let selcatobj = this.state.selectedCat;
        
        let catrectid = (selcatobj.type === catRectEnums.default?selcatobj.category.category_id:-1);
        let catmpid = selcatobj.id;
        let iscatrulebased = (selcatobj.type === catRectEnums.rule);

        let catruleobj = null;
        if(iscatrulebased){
            catruleobj = {
                level: selcatobj.rule.level,
                id: getNameorIdorColorofBox(selcatobj, "num"),
            }
        }

        let selectedsubcat = this.state.selectedSubCat;
        let subcatid = (selectedsubcat.type === catRectEnums.default?selectedsubcat.sub_category.subCategoryId:-1);
        let isscatrulebased = (selectedsubcat.type === catRectEnums.rule);
        
        // let selectedbrand = this.state.selectedBrand;

        let ruleobj = null;
        if(isscatrulebased){
            ruleobj = {
                level: selectedsubcat.rule.level,
                id: getNameorIdorColorofBox(selectedsubcat, "num"),
            }
        }

        let svobj = { 
            catRuleObj: (catruleobj?catruleobj:{}),
            categoryId: catrectid,
            departmentId: (cdefSaveObj?cdefSaveObj.department.department_id:-1),
            endDate: this.state.chartFilterDates.todate, 
            fromDate: this.state.chartFilterDates.fromdate,
            isCatRuleBased: iscatrulebased,
            isSubCatRuleBased: (ruleobj?true:false),
            mpCatHasBoxId: catmpid,
            mpHasCatHasSubCatId:(selectedsubcat.mpHasCatHasSubCatid ? selectedsubcat.mpHasCatHasSubCatid : -1),
            mpId: mpid,
            mpHasCategoryId: -1, //catmpid
            mpRuleIds: (selectedsubcat.otherMpRuleIds?selectedsubcat.otherMpRuleIds:[]),
            subCatRuleObj: (ruleobj?ruleobj:{}),
            subCategoryId: subcatid
        };

        this.setState({ loadedSidebarBrands: [] }, () => {
            submitSets(submitCollection.mpBrandNewProdCount, svobj).then(res => {
                // console.log(res);
                let brandlist = this.state.brandsList;
                if(res && res.status && res.extra){
                    let newcountlist = (res.extra && res.extra.length > 0?res.extra:[]);

                    for (let i = 0; i < this.state.brandsList.length; i++) {
                        const branditem = this.state.brandsList[i];
                        
                        let foundcountitem = newcountlist.find(x => x.brandId === branditem.brandId);
                        
                        if(foundcountitem){
                            branditem["newProdCount"] = foundcountitem.newProdCount;
                        } else{
                            branditem["newProdCount"] = 0;
                        }
                    }
                }
                
                this.setState({ loadedSidebarBrands: brandlist });
            });
        });

    }

    //load sidebar product list
    loadSidebarProductList = ()=>{
        let cdefSaveObj = this.state.defSaveObj;
        let mpid = (cdefSaveObj?cdefSaveObj.mp_id:-1);

        let selcatobj = this.state.selectedCat;
        
        let catrectid = (selcatobj.type === catRectEnums.default?selcatobj.category.category_id:-1);
        let catmpid = selcatobj.id;
        let iscatrulebased = (selcatobj.type === catRectEnums.rule);

        let catruleobj = null;
        if(iscatrulebased){
            catruleobj = {
                level: selcatobj.rule.level,
                id: getNameorIdorColorofBox(selcatobj, "num"),
            }
        }

        let selectedsubcat = this.state.selectedSubCat;
        let subcatid = (selectedsubcat.type === catRectEnums.default?selectedsubcat.sub_category.subCategoryId:-1);
        let isscatrulebased = (selectedsubcat.type === catRectEnums.rule);
        
        let selectedbrand = this.state.selectedBrand;

        let ruleobj = null;
        if(isscatrulebased){
            ruleobj = {
                level: selectedsubcat.rule.level,
                id: getNameorIdorColorofBox(selectedsubcat, "num"),
            }
        }

        let svobj = { 
            mpId: mpid,
            departmentId: (cdefSaveObj?cdefSaveObj.department.department_id:-1),
            mpHasCategoryId: -1, //catmpid
            mpCategoryBoxId: catmpid,
            categoryId: catrectid,
            isCatRuleBased: iscatrulebased,
            catRuleObj: (catruleobj?catruleobj:{}),
            subCategoryId: subcatid,
            isSubCatRuleBased: (ruleobj?true:false),
            subCatRuleObj: (ruleobj?ruleobj:{}),
            brandId: (selectedbrand?selectedbrand:-1),
            fromDate: this.state.chartFilterDates.fromdate,
            toDate: this.state.chartFilterDates.todate, 
            mpRuleIds: (selectedsubcat.otherMpRuleIds?selectedsubcat.otherMpRuleIds:[]),
            mpCatHasSubCatId:(selectedsubcat.mpHasCatHasSubCatid ? selectedsubcat.mpHasCatHasSubCatid : -1),
        };
        
        this.setState({
            snapshostCallsPendingDataList:[],
            snapshotSaveCallLoading:false
        });

        this.setState({
            isProductsLoaded:false, 
            loadedNewProducts:[], 
            loadedNewTestingProds: [], 
            loadedTopProds:[], 
            loadedMvpProds:[], 
            productSidebarhistoryList:[], 
            isHasSnap: false, 
            hasUnsavedProductsSidebarChanges: false
        });
        
        submitSets(submitCollection.mpProductPercentage, svobj).then(res => {
            this.setState({isProductsLoaded:true});
            if(res && res.status && res.extra){
                let resobj = res.extra;
                this.setState({isHasSnap:(res.extra.isHasSnap?res.extra.isHasSnap:false)});
                //new object arrays
                let mvpProds = [];

                //ontop products
                //let onTopProds = (resobj.onTopProducts && resobj.onTopProducts.length > 0?resobj.onTopProducts:[]);
                let onTopProds = [];
                let onTopHasTagidxes = [];
                for (let o = 0; o < resobj.onTopProducts.length; o++) {
                    let ttobj = resobj.onTopProducts[o];
                    ttobj.rank = (o+1);
                    ttobj.preAddedSuggestedSpace = (ttobj.preAddedSuggestedSpace?(ttobj.preAddedSuggestedSpace%1===0?ttobj.preAddedSuggestedSpace:ttobj.preAddedSuggestedSpace.toFixed(2)):0)
                    // if(ttobj.isOnTopTag===false){
                    //     ttobj.isOnTopTag = (ttobj.isHasTags ? ttobj.isHasTags : false);
                    // }

                    onTopProds.push(ttobj);
                    if(ttobj.isHasTags){
                        onTopHasTagidxes.push(ttobj.productId);
                    }
                }

                let newProds = (resobj.newProducts && resobj.newProducts.newPendingProducts && resobj.newProducts.newPendingProducts.length > 0?resobj.newProducts.newPendingProducts:[]);
                let newTestingProds = (resobj.newProducts && resobj.newProducts.newTestingProducts && resobj.newProducts.newTestingProducts.length > 0?resobj.newProducts.newTestingProducts:[]);

                //mvp products
                let mandatoryIdxes = [];
                if(resobj.mvpProducts && resobj.mvpProducts.length > 0){
                    if(resobj.mvpProducts && resobj.mvpProducts.length > 0){
                        for (let i = 0; i < resobj.mvpProducts.length; i++) {
                            let cobj = resobj.mvpProducts[i];
                            cobj.preAddedSuggestedSpace = (cobj.preAddedSuggestedSpace?(cobj.preAddedSuggestedSpace%1===0?cobj.preAddedSuggestedSpace:cobj.preAddedSuggestedSpace.toFixed(2)):0);
                            mvpProds.push(cobj);

                            if(cobj.isMandatory){
                                mandatoryIdxes.push(cobj.productId);
                            }
                        }
                    }
                }
                
                this.setState({
                    loadedMvpProds: mvpProds,
                    loadedTopProds: onTopProds,
                    loadedNewProducts: newProds,
                    loadedNewTestingProds: newTestingProds,
                    mvpMandatoryIndexes: mandatoryIdxes,
                    onTopHasTagsIndexes:onTopHasTagidxes,
                }, () => {
                    // this.loadSidebarBrandList();
                    this.resetNewProdList();
                });
            }
        });
    }

    //if unsaved changes ara available, save snapshot - NOT using
    saveUnsavedProductSidebarChanges = () =>{
        if(this.state.hasUnsavedProductsSidebarChanges===true){
            this.saveBrandProductSnapshot(null,null,null,true,false,false,false);
        }
    }

    //handle product sbar change - 
    triggerProdSidebarChange = (e) =>{
        this.setState({hasUnsavedProductsSidebarChanges:e});
    }

    //get get allocated percentage total
    getallocatedPercentageTotal = (list) =>{
        let total = 0;
        for (let i = 0; i < list.length; i++) {
            var obj = list[i];
            var perval = (obj.preAddedSuggestedSpace && obj.preAddedSuggestedSpace!=="" ? parseFloat(obj.preAddedSuggestedSpace):0);
            total = (total+perval)
        }
        return total.toFixed(2);
    }
    //validate and save product sidebar
    validateAndSaveProducts = (isarchive, isvalidreturn, _callback) => {
        let mvpprodlist = this.state.loadedMvpProds;
        let topprodlist = this.state.loadedTopProds;
        let newprodlist = this.state.loadedNewProducts;

        let totalpers = 0;
        for (let i = 0; i < mvpprodlist.length; i++) {
            const mvpitem = mvpprodlist[i];
            mvpitem["isArchive"] = (isarchive && mvpitem.isArchive?mvpitem.isArchive:false);

            let itemper = (mvpitem.preAddedSuggestedSpace?parseFloat(mvpitem.preAddedSuggestedSpace):0)
            totalpers += itemper;
        }

        for (let i = 0; i < topprodlist.length; i++) {
            const ontopitem = topprodlist[i];
            ontopitem["isArchive"] = (isarchive && ontopitem.isArchive?ontopitem.isArchive:false);

            let itemper = (ontopitem.preAddedSuggestedSpace?parseFloat(ontopitem.preAddedSuggestedSpace):0)
            totalpers += itemper;
        }
        
        if(roundOffDecimal(totalpers,2) > 100 && isarchive!==true){
            alertService.error(this.props.t("cannot_change_morethan_100"));
            if(isvalidreturn){
                _callback(true);
            }
            return false;
        }

        this.saveBrandProductSnapshot(mvpprodlist,topprodlist,newprodlist,false,false,!isarchive,isarchive);
    }
    //save product panel snapshot
    saveBrandProductSnapshot = (mvplist,ontoplist,newlist,hassnap,isreset,issave,isarchive) => {
        //show loading modal if reset, save, archive
        if(isreset===true || issave===true || isarchive===true){
            this.setState({isShowLoadingModal:true});
        }

        //check if currently a back call is on the way and save it for later calling
        if(this.state.snapshotSaveCallLoading===true){
            let que = [];//this.state.snapshostCallsPendingDataList
            que.push({
                mvplist:mvplist,
                ontoplist:ontoplist,
                newlist:newlist,
                hassnap:hassnap,
                isreset:isreset,
                issave:issave,
                isarchive:isarchive,
            });
            this.setState({snapshostCallsPendingDataList:que});
            return false;
        }

        let mvpprodlist = (mvplist?mvplist:this.state.loadedMvpProds);
        let topprodlist = (ontoplist?ontoplist:this.state.loadedTopProds);
        let newprodlist = (newlist?newlist:[]);
        let newtestingprodlist = this.state.loadedNewTestingProds;

        let mvpontoptotalarray = mvpprodlist.concat(topprodlist);
        let totalPercBoth = this.getallocatedPercentageTotal(mvpontoptotalarray);
        
        if(totalPercBoth>100){
            if(isarchive!==true){
                this.triggerProdSidebarChange(true);
                return false;
            }
        }

        let cdefSaveObj = this.state.defSaveObj;
        let selcatobj = this.state.selectedCat;
        
        let catrectid = (selcatobj.type === catRectEnums.default?selcatobj.category.category_id:-1);
        let catmpid = selcatobj.id;
        let iscatrulebased = (selcatobj.type === catRectEnums.rule);

        let catruleobj = null;
        if(iscatrulebased){
            catruleobj = {
                level: selcatobj.rule.level,
                id: getNameorIdorColorofBox(selcatobj, "num"),
            }
        }

        let selectedsubcat = this.state.selectedSubCat;
        let subcatid = (selectedsubcat.type === catRectEnums.default?selectedsubcat.sub_category.subCategoryId:-1);
        let isscatrulebased = (selectedsubcat.type === catRectEnums.rule);

        let selectedbrand = JSON.parse(JSON.stringify(this.state.selectedBrand));

        let ruleobj = null;
        if(isscatrulebased){
            ruleobj = {
                level: selectedsubcat.rule.level,
                id: getNameorIdorColorofBox(selectedsubcat, "num"),
            }
        }
        
        if(isarchive!==true){
            mvpprodlist.map(a=>a.isArchive=false);
            topprodlist.map(b=>b.isArchive=false);
            newprodlist.map(c=>c.isArchive=false);
        }

        let saveObj = {
            mpId:cdefSaveObj.mp_id,
            departmentId: (cdefSaveObj?cdefSaveObj.department.department_id:-1),
            mpCategoryBoxId: catmpid,
            mpCatHasSubCatId:(selectedsubcat.mpHasCatHasSubCatid ? selectedsubcat.mpHasCatHasSubCatid : -1),
            categoryId: catrectid,
            isCatRuleBased: iscatrulebased,
            catRuleObj: (catruleobj?catruleobj:{}),
            subcategoryId: subcatid,
            isSubCatRuleBased: (ruleobj?true:false),
            subCatRuleObj: (ruleobj?ruleobj:{}),
            brandId: (selectedbrand?selectedbrand:-1),
            isHasSnap:true,
            isReset:(isreset?isreset:false),

            mvpProducts: (mvpprodlist?mvpprodlist:[]),
            onTopProducts: (topprodlist?topprodlist:[]),
            newProducts:{
                newPendingProducts: newprodlist,
                newTestingProducts: newtestingprodlist,
            },
        }

        //ontop/mvp prod list
        /* let isNewProductUpdate = false;

        let mvpNewProdList = saveObj.mvpProducts.filter(x => x.snapId -1 && x.isNewProduct === true && x.isNew === true);
        let ontopNewProdList = saveObj.onTopProducts.filter(x => x.snapId -1 && x.isNewProduct === true && x.isNew === true);

        if(mvpNewProdList.length > 0 || ontopNewProdList.length > 0){
            isNewProductUpdate = true;
        } */

        this.triggerProdSidebarChange(false);
        //console.log(saveObj);
        this.setState({snapshotSaveCallLoading:true}, () => {
            submitSets(submitCollection.saveMpProductChanges, saveObj, false, null, true).then(res => {
                this.setState({snapshotSaveCallLoading:false},()=>{
                    if(res && res.status===true){
                        this.clearDataCaches("all"); //clear data cache

                        this.setState({isHasSnap:res.extra.isHasSnap, hasUnsavedProductsSidebarChanges:false});
                        
                        if(isreset===true || issave===true || isarchive===true){
                            this.setState({isShowLoadingModal:false});
                            this.loadSidebarProductList();

                            //reload watch panel counts
                            if(isarchive){
                                this.setState({ isdeptdataloading: true }, () => {
                                    this.setState({ isdeptdataloading: false });
                                    this.dRulesreload(false, true);
                                });
                            }
                        }
                        else{
                            if(saveObj.brandId === this.state.selectedBrand){
                                let resmvp = (res.extra.mvpProducts?res.extra.mvpProducts:[]);
                                let resotop = (res.extra.onTopProducts?res.extra.onTopProducts:[]);
                                let resnewprodcount = (res.extra.newProductCount?res.extra.newProductCount:0);
                                //set snapIds for main array - oldMvp,oldOntop,newMvp,newOntop
                                let nobj = this.setSnapIdForProducts(this.state.loadedMvpProds, this.state.loadedTopProds, resmvp ,resotop);
                                this.setState({loadedMvpProds: nobj.mvpProds,loadedTopProds: nobj.ontopProds,});
    
                                //check for pending back call
                                this.initSnapshotCallQueCheck(resmvp ,resotop);
                                this.updateNewProdCountBrand(saveObj.brandId, resnewprodcount);
                                this.resetNewProdList();
                            }

                            /* if(isNewProductUpdate){
                                this.setState({ isdeptdataloading: true }, () => {
                                    this.setState({ isdeptdataloading: false });
                                    this.dRulesreload(false, true);
                                });
                            } */
                        }
                    }
                    else{
                        if(isreset!==true || issave===true || isarchive===true){
                            this.setState({isShowLoadingModal:false});
                            this.initSnapshotCallQueCheck([],[]);
                        }
                        // alertService.error((res&&res.extra?res.extra:this.props.t('ERROR_OCCURRED')));
                    }
                });
            });
        });
    }

    resetNewProdList = () => {
        let curnewprods = this.state.loadedNewProducts;
        for (let i = 0; i < curnewprods.length; i++) {
            curnewprods[i]["isUndo"] = false;
        }

        this.setState({ loadedNewProducts: curnewprods });
    }

    initSnapshotCallQueCheck = (resmvp, resotop) =>{
        if(this.state.snapshostCallsPendingDataList.length>0){
            let que = this.state.snapshostCallsPendingDataList;
            let currentCall = que[0];
            //que.shift();
            this.setState({snapshostCallsPendingDataList:[]});

            //set snapIds for calls array - oldMvp,oldOntop,newMvp,newOntop
            let nobj = this.setSnapIdForProducts(currentCall.mvplist, currentCall.ontoplist, resmvp,resotop);
            
            this.saveBrandProductSnapshot(nobj.mvpProds, nobj.ontopProds, currentCall.newlist, currentCall.hassnap, currentCall.isreset, currentCall.issave, currentCall.isarchive);
        }
    }

    setSnapIdForProducts = (oldMvp_p,oldOntop_p,newMvp_p,newOntop_p) => {
        let oldMvp = (oldMvp_p?oldMvp_p:[]);
        let oldOntop = (oldOntop_p?oldOntop_p:[]);
        let newMvp = (newMvp_p?newMvp_p:[]);
        let newOntop = (newOntop_p?newOntop_p:[]);

        for (let i = 0; i < oldMvp.length; i++) {
            let newomvprod =  newMvp.find(nmvpitem => nmvpitem.productId === oldMvp[i].productId);
            if(newomvprod){
                oldMvp[i].snapId = newomvprod.snapId;
            } else{
                let newotopprod =  newOntop.find(otopitem => otopitem.productId === oldMvp[i].productId);
                if(newotopprod){
                    oldMvp[i].snapId = newotopprod.snapId;
                }
            }
        }

        for (let i = 0; i < oldOntop.length; i++) {
            let newotopprod = newOntop.find(otopitem => otopitem.productId === oldOntop[i].productId);
            if(newotopprod){
                oldOntop[i].snapId = newotopprod.snapId;
            } else{
                let newomvprod = newMvp.find(nmvpitem => nmvpitem.productId === oldOntop[i].productId);
                if(newomvprod){
                    oldOntop[i].snapId = newomvprod.snapId;
                }
            }
        }

        return { mvpProds: oldMvp, ontopProds: oldOntop };
    }

    //find dropping idx is overlapping mandatory or mandatory idx adding to normal one
    // checkProductIdx = (olditem, newidx, oldidx) => {
    //     let mandatoryidxs = this.state.mvpMandatoryIndexes;
    //     let isOverlappingMandatory = mandatoryidxs.includes(newidx);

    //     let newreturnidx = newidx; //return index
        
    //     if((olditem.isMandatory && !isOverlappingMandatory) || (!olditem.isMandatory && isOverlappingMandatory)){
    //         newreturnidx = oldidx;

    //         if(olditem.isMandatory && !isOverlappingMandatory){
    //             // newreturnidx = (mandatoryidxs[(mandatoryidxs - 1)] + 1);
    //             alertService.warn(this.props.t("cannot_change_mandatory_to_normal"));
    //         } else{
    //             alertService.warn(this.props.t("cannot_change_normal_to_mandatory"));
    //         }
    //     }

    //     return newreturnidx;
    // }

    //find dropping idx is overlapping mandatory or mandatory idx adding to normal one
    checkProductIdx = (olditem, newitem ,newidx, oldidx) => {
        let mandatoryidxs = this.state.mvpMandatoryIndexes;
        let isOverlappingMandatory = mandatoryidxs.includes(newitem.productId);

        let newreturnidx = newidx; //return index
        
        if((olditem.isMandatory && !isOverlappingMandatory) || (!olditem.isMandatory && isOverlappingMandatory)){
            newreturnidx = oldidx;

            if(olditem.isMandatory && !isOverlappingMandatory){
                // newreturnidx = (mandatoryidxs[(mandatoryidxs - 1)] + 1);
                alertService.warn(this.props.t("cannot_change_mandatory_to_normal"));
            } else{
                alertService.warn(this.props.t("cannot_change_normal_to_mandatory"));
            }
        }

        return newreturnidx;
    }

    //remove mandatory index
    removeMandatoryIndex = (index) =>{
        let mindxs = this.state.mvpMandatoryIndexes;
        mindxs.splice(index,1);
        //console.log(mindxs);
        this.setState({mvpMandatoryIndexes:mindxs});
    }

    //find dropping idx is overlapping on top has tag or on top has tag idx adding to normal one
    // checkProductIdxOnTop = (olditem, newidx, oldidx) => {
    //     let hasTagidxs = this.state.onTopHasTagsIndexes;
    //     let isOverlappingHasTags = hasTagidxs.includes(newidx);

    //     let newreturnidx = newidx; //return index
        
    //     if((olditem.isOnTopTag && !isOverlappingHasTags) || (!olditem.isOnTopTag && isOverlappingHasTags)){
    //         newreturnidx = oldidx;

    //         if(olditem.isOnTopTag && !isOverlappingHasTags){
    //             // newreturnidx = (hasTagidxs[(hasTagidxs - 1)] + 1);
    //             alertService.warn(this.props.t("cannot_change_hastags_to_normal"));
    //         } else{
    //             alertService.warn(this.props.t("cannot_change_normal_to_hastags"));
    //         }
    //     }

    //     return newreturnidx;
    // }

    //find dropping idx is overlapping on top has tag or on top has tag idx adding to normal one
    checkProductIdxOnTop = (olditem, newitem,newidx, oldidx) => {
        let hasTagidxs = this.state.onTopHasTagsIndexes;
        let isOverlappingHasTags = hasTagidxs.includes(newitem.productId);

        let newreturnidx = newidx; //return index
        
        if((olditem.isHasTags && !isOverlappingHasTags) || (!olditem.isHasTags && isOverlappingHasTags)){
            newreturnidx = oldidx;

            if(olditem.isHasTags && !isOverlappingHasTags){
                // newreturnidx = (hasTagidxs[(hasTagidxs - 1)] + 1);
                alertService.warn(this.props.t("cannot_change_hastags_to_normal"));
            } else{
                alertService.warn(this.props.t("cannot_change_normal_to_hastags"));
            }
        }

        return newreturnidx;
    }

    //sort product sidebar items - mvp items
    onSortEnd = (oldIndex, newIndex) => {
        
        let olditem = this.state.loadedMvpProds[oldIndex];
        let newitem = this.state.loadedMvpProds[newIndex];
        let newfixidx = this.checkProductIdx(olditem,newitem, newIndex, oldIndex);
        
        this.setState(({loadedMvpProds}) => ({
            loadedMvpProds: arrayMoveLTR(loadedMvpProds, oldIndex, newfixidx),
        }),()=>{
            if(oldIndex !== newfixidx){
                this.AddHistory();
                this.saveBrandProductSnapshot(null,null,null,true,false,false,false);
            }
        });
        if(this.props.isRTL==="ltr"){
        }
        else if(this.props.isRTL==="rtl"){
            // var prodlist = JSON.parse(JSON.stringify(this.state.loadedMvpProds));
            // var prodlistReversed = prodlist.reverse();

            // var oldid = prodlistReversed[oldIndex].productId;
            // var newid = prodlistReversed[newIndex].productId;
            
            // var newOldIndx = prodlist.map(function(e) { return e.productId; }).reverse().indexOf(oldid);
            // var newNewIndx = prodlist.map(function(e) { return e.productId; }).reverse().indexOf(newid);
            
            // let olditem = prodlistReversed[oldIndex];
            // let newitem = prodlistReversed[newIndex];
            // //console.log(oldIndex, newIndex);
            // let newfixidx = this.checkProductIdx(olditem, newitem, newNewIndx, newOldIndx );
            
            // this.setState(({loadedMvpProds}) => ({
            //     loadedMvpProds: arrayMoveRTL(loadedMvpProds, newOldIndx, newfixidx),
            // }),()=>{
            //     if(newOldIndx !== newfixidx){
            //         this.AddHistory();
            //         this.saveBrandProductSnapshot(null,null,null,true,false,false,false);
            //     }
            // });
        }
    };

    //sort product sidebar items - on top items
    onSortEndOnTop = (oldIndex, newIndex) => {
        let olditem = this.state.loadedTopProds[oldIndex];
        let newitem = this.state.loadedTopProds[newIndex];
        let newfixidx = this.checkProductIdxOnTop(olditem, newitem, newIndex, oldIndex); //this.checkProductIdxOnTop(olditem, newIndex, oldIndex);
        
        this.setState(({loadedTopProds}) => ({
            loadedTopProds: arrayMoveLTR(loadedTopProds, oldIndex, newfixidx),
        }),()=>{
            if(oldIndex !== newfixidx){
                this.AddHistory();
                this.saveBrandProductSnapshot(null,null,null,true,false,false,false);
            }
        });
        if(this.props.isRTL==="ltr"){
        }
        else if(this.props.isRTL==="rtl"){
            // var prodlist = JSON.parse(JSON.stringify(this.state.loadedTopProds));
            // var prodlistReversed = prodlist.reverse();

            // var oldid = prodlistReversed[oldIndex].productId;
            // var newid = prodlistReversed[newIndex].productId;
            
            // var newOldIndx = prodlist.map(function(e) { return e.productId; }).reverse().indexOf(oldid);
            // var newNewIndx = prodlist.map(function(e) { return e.productId; }).reverse().indexOf(newid);
            
            // let olditem = prodlistReversed[oldIndex];
            // let newitem = prodlistReversed[newIndex];
            // let newfixidx = this.checkProductIdxOnTop(olditem,newitem, newNewIndx, newOldIndx);

            // this.setState(({loadedTopProds}) => ({
            //     loadedTopProds: arrayMoveRTL(loadedTopProds, newOldIndx, newfixidx),
            // }),()=>{
            //     if(newOldIndx !== newfixidx){
            //         this.AddHistory();
            //         this.saveBrandProductSnapshot(null,null,null,true,false,false,false);
            //     }
            // });
        }
    };

    setMainProductArrays = (arraysSet, mvpmanindexes, ontopTagsIndexes) =>{
        this.setState({
            loadedMvpProds: arraysSet.loadedMvpProds,
            loadedTopProds: arraysSet.loadedTopProds,
            loadedNewProducts: arraysSet.loadedNewProducts,
            loadedNewTestingProds: arraysSet.loadedNewTestingProds,
            mvpMandatoryIndexes: (mvpmanindexes?mvpmanindexes:this.state.mvpMandatoryIndexes),
            onTopHasTagsIndexes: (ontopTagsIndexes? ontopTagsIndexes : this.state.onTopHasTagsIndexes)
        });
    }

    AddHistory = (cutommvp)=> {
        let mvpProds = (cutommvp ? cutommvp : JSON.parse(JSON.stringify(this.state.loadedMvpProds)));
        var onTopProds = JSON.parse(JSON.stringify(this.state.loadedTopProds));
        var newProds = JSON.parse(JSON.stringify(this.state.loadedNewProducts));
        var newTestingProds = JSON.parse(JSON.stringify(this.state.loadedNewTestingProds));
        
        var arraySet = {
            loadedMvpProds:mvpProds,
            loadedTopProds:onTopProds,
            loadedNewProducts:newProds,
            loadedNewTestingProds:newTestingProds,
            mvpMandatoryIndexes: (this.state.mvpMandatoryIndexes?this.state.mvpMandatoryIndexes:[]),
            onTopHasTagsIndexes:(this.state.onTopHasTagsIndexes?this.state.onTopHasTagsIndexes:[]),
        }
        
        var history_list = this.state.productSidebarhistoryList;
        if(history_list.length === history_max_length){
            history_list.shift();
            history_list.push(arraySet);
            this.setState({productSidebarhistoryList:history_list});
        }
        if(history_list.length < history_max_length){
            history_list.push(arraySet);
            this.setState({productSidebarhistoryList:history_list});
        }
        //console.log(history_list);
    }

    productUndoChanges = (isreset) =>{
            if(isreset){
                confirmAlert({
                    title: this.props.t('RESET_NEW_CHANGES'),
                    message: (this.state.isHasSnap===true?this.props.t("SNAPSHOT_AFFECT_MSG"):"")+(this.props.t('ARE_YOU_SURE_TO_RESET_ALL_NEW_CHANGES') +"\n"+(this.props.t("SNAPSHOT_EXTRA_MSG"))),
                    overlayClassName: (this.props.isRTL === "rtl" ? "alertrtl-content" : ""),
                    buttons: [{
                        label: this.props.t('btnnames.yes'),
                        onClick: () => {
                            this.setState({productSidebarhistoryList:[]});
                            this.saveBrandProductSnapshot([],[],[],false,true,false,false,false );
                        }
                    }, {
                        label: this.props.t('btnnames.no')
                    }]
                });
            } else{
                if(this.state.productSidebarhistoryList.length > 0){
                    let curnewprods = JSON.parse(JSON.stringify(this.state.loadedNewProducts));

                    var indx = (this.state.productSidebarhistoryList.length - 1);
                    let undoListObj = this.state.productSidebarhistoryList[indx];

                    let undonewprodlist = undoListObj.loadedNewProducts;
                    for (let i = 0; i < undonewprodlist.length; i++) {
                        const undonewprod = undonewprodlist[i];
                        let isnotavailable = curnewprods.findIndex(x => x.productId === undonewprod.productId);

                        undonewprod["isUndo"] = (isnotavailable === -1?true:false);
                    }

                    this.setMainProductArrays(undoListObj);
                    this.saveBrandProductSnapshot(
                        undoListObj.loadedMvpProds,
                        undoListObj.loadedTopProds,
                        undoListObj.loadedNewProducts,false,false,false,false
                    );

                    //set mvp and ontopp special ids
                    this.setState({
                        onTopHasTagsIndexes: undoListObj.onTopHasTagsIndexes, 
                        mvpMandatoryIndexes: undoListObj.mvpMandatoryIndexes
                    });

                    var hlist = this.state.productSidebarhistoryList;
                    hlist.pop();
                    this.setState({ productSidebarhistoryList: hlist });
                }
            }
    }

    //warning item redirect
    warningRedirect = (redirectitem) => {
        let exportsaveobj = JSON.parse(JSON.stringify(this.state.defSaveObj));

        if(redirectitem.foundLevel === "cat"){
            let exportcat = exportsaveobj.categories[redirectitem.catIdx];
            let exportcatrect = exportcat.rects[redirectitem.catRectIdx];

            this.redirectToCategory("scat", exportcat, null, exportcatrect);
        } else if(redirectitem.foundLevel === "scat"){
            let exportcat = exportsaveobj.categories[redirectitem.catIdx];
            let exportcatrect = exportcat.rects[redirectitem.catRectIdx];

            let exportscatobj = exportcat.rects[redirectitem.catRectIdx].sub_categories[redirectitem.scatIdx];

            this.props.setMPCategoryAction(exportcat);
            this.props.setMPCategoryRectAction(exportcatrect);

            this.redirectToCategory("brand", exportscatobj, null, null);
        }
        
    }
    //clear data caches
    clearDataCaches = (cleartype) => {
        // console.log(cleartype);
        
        if(cleartype === "scat"){
            this.props.setMPSubCategoryDataCache(null);
            this.props.setMPSubCategoryNavCache(null);

            this.props.setMPBrandDataCache(null);
            this.props.setMPBrandNavCache(null);

        } else if(cleartype === "brand"){
            this.props.setMPBrandDataCache(null);
            this.props.setMPBrandNavCache(null);

        } else if(cleartype === "all"){
            this.props.setMPCategoryDataCache(null);
            this.props.setMPCategoryNavCache(null);

            this.props.setMPSubCategoryDataCache(null);
            this.props.setMPSubCategoryNavCache(null);

            this.props.setMPBrandDataCache(null);
            this.props.setMPBrandNavCache(null);
        }
    }

    setWatchTabCountStatus = (type) =>{
        this.setState({watchTabCountLoaded:type});
    }

    changeDataRuleActiveTab =(key)=>{
        this.setState({ dataRuleSelectedTab: key});
    }
    //update range and product sales when date range change
    updateProductDateRanges = (savefilterobj, chartDates) => {
        let defSaveObj = this.state.defSaveObj;

        let csavefilterobj = savefilterobj;
        csavefilterobj["mpId"] = defSaveObj.mp_id;

        this.setState({ isShowLoadingModal: true }, () => {
            submitSets(submitCollection.updateProductType, csavefilterobj, false).then(res => {
                // console.log(res);

                this.setState({ isShowLoadingModal: false }, () => {
                    if(res && res.status ){
                        alertService.success(this.props.t("SUCCESSFULLY_UPDATED"));
                    }

                    this.changeChartFilterDates(chartDates);    
                });
            });
        });
    }

    getBase64FromUrl = async (url) => {
        const data = await fetch(url);
        const blob = await data.blob();

        return new Promise((resolve) => {
          const reader = new FileReader();
          reader.readAsDataURL(blob); 
          reader.onloadend = () => {
            const base64data = reader.result;   
            resolve(base64data);
          }
        });
    }
    //get notice image
    getNoticeImageForWatch = (noticeImg) => {
        this.getBase64FromUrl(noticeImg).then(returnimage => {
            /* let cprodobj = this.props.prodObj;
            cprodobj["baseUrl"] = returnimage; */
            this.setState({ noticeImgUrl: returnimage });
        });
    }
    //aui
    handleAuiOpen = (val) => {
        if(!val){
            this.sendmarkStackableCall();
        }
        
        this.setState({ isAuiOpen: val, depDirectType: "AUI" }); 
    }
    //
    toggleLoadingModal = (isshow, _callback) => {
        //manage loading modal request count for multiple loading modal requests to close modal after last isshow false request
        let loadingcount = this.state.loadingReqCount;
        if(isshow === true){
            loadingcount = (loadingcount + 1);
        } else{
            loadingcount = (loadingcount - 1);
        }

        let cisshow = isshow;
        let isshowfresh = false;

        if(isshow === false){
            if(loadingcount > 0){
                cisshow = true;
            } else{
                let cdefSaveObj = this.state.defSaveObj;
                if(cdefSaveObj && cdefSaveObj.mp_id > 0 && this.props.mpstate.newRefresh  && this.props.mpstate.newRefresh === true){
                    isshowfresh = true;
                }
            }
        }

        this.setState({ isShowLoadingModal: cisshow, loadingReqCount: loadingcount, showNewNoticeModal: isshowfresh }, () => {
            if(isshowfresh){
                this.props.setNewRefresh(false);
            }

            if(_callback){
                _callback();
            }
        });
    }

    handleVersionNameFocus = () => {
        this.VNRef.current.focus();
    }

    initGotIt = () =>{
        this.setState({showNewNoticeModal:false},()=>{
            this.props.setNewRefresh(false);
        })
    }
    //update depDirectType state
    updateDepDirectType = (ctype) => {
        this.setState({ depDirectType: ctype });
    }

    //update loaded newprod count of prod sidebar brandlist
    updateNewProdCountBrand = (brandid, newprodcount) => {
        let allbrandlist = this.state.loadedSidebarBrands;
        let findselbrand = allbrandlist.findIndex(x => x.brandId === brandid);

        if(findselbrand > -1){
            allbrandlist[findselbrand]["newProdCount"] = newprodcount;
        }

        this.setState({ loadedSidebarBrands: allbrandlist });
    }

    updateAUIMPObject = (mp) => {
        this.setState({ auiMpObj: mp });
    //
    }
    updateShowNewProd = (isshow) => {
        this.setState({ isShowNewProdOnload: isshow });
    }

    //unsave confirm message
    notsaveConfirm = (_callback) => {
        if(this.state.isUpdatesAvailable){
            confirmAlert({
                title: this.props.t('UNSAVE_CHANGES'),
                message: (this.props.t('YOU_HAVE_UNSAVED_CHANGES_SURE_TO_LEAVE')),
                overlayClassName: (this.props.isRTL === "rtl" ? "alertrtl-content" : ""),
                buttons: [{
                    label: this.props.t('btnnames.yes'),
                    onClick: () => {    
                        _callback(true);
                    }
                }, {
                    label: this.props.t('btnnames.no'),
                    onClick: () => {    
                        _callback(false);
                    }
                }]
            });
        } else{
            _callback(true);
        }
    }

    //update categories md from child
    updateParentCatList = (catslist) => {
        // console.log(catslist);
        this.setState({ loadedCatsList: catslist });
    }

    //update imported data object
    updateImportedDataObj = (updateobj, _callback) => {
        let updateingObj = structuredClone(updateobj);
        // this.setState({ importedDataObj: null }, () => {
            this.setState({ importedDataObj: updateingObj }, () => {
                if(_callback){ _callback(); }
            });
        // });
    }

    //load imported prod list
    loadImportProdList = () => {
        let importedDataObj = this.state.importedDataObj;

        let sendobj = {
            searchValue: importedDataObj.excelSearchText,
            mpId: (this.state.defSaveObj?this.state.defSaveObj.mp_id:-1),
            isReqPagination: true,
            isReqCount: false,
            maxResult: importedDataObj.paginationMaxCount,
            startIndex: importedDataObj.excelStartIndex,
        }

        importedDataObj.isImportDataLoading = true;

        this.setState({ importedDataObj: importedDataObj }, () => {
            submitSets(submitCollection.getSimImportedProdBarcodes, sendobj, false).then(res => {
                // console.log(res);
                if(res && res.status){
                    let datalist = (res.extra && res.extra.importedBarcodes && res.extra.importedBarcodes.length > 0?res.extra.importedBarcodes:[]);
                    
                    for (let i = 0; i < datalist.length; i++) {
                        const importedProd = datalist[i];
                        importedProd.subCategoryName = importedProd.subcategoryName;
                        importedProd.subCategoryColor = importedProd.subcategoryColor;
                        importedProd.subCategoryId = importedProd.subcategoryId;
                    }
                    // console.log(datalist);
                    let mergedProds = (sendobj.startIndex === 0?datalist:importedDataObj.excelUploadList.concat(datalist));
                    
                    if(sendobj.startIndex === 0){
                        importedDataObj.totalExcelProdCount = (res.count > 0?res.count:0);
                    }

                    importedDataObj.excelUploadList = mergedProds;
                    importedDataObj.excelStartIndex = (importedDataObj.excelStartIndex + (datalist.length > 0?datalist.length:0));
                }

                importedDataObj.isImportDataLoading = false;
                this.updateImportedDataObj(importedDataObj);
            });
        });
    }

    render() {
        let defsaveobj = this.state.defSaveObj;
        var {isAuiViewsAllow}=this.state
        // console.log(this.props)

        return (<>
            <Col xs={12} className={"main-content mpview-main "+(defsaveobj && defsaveobj.isAUIConverted?"aui-readonly ":"")+(this.props.isRTL==="rtl"?"RTL":"")} dir={this.props.isRTL}>{/*  */}
                
                <Col>
                    <Button variant="light" type="button" className="backpg-link" onClick={this.handleGoBack} style={{textTransform:"uppercase",fontWeight:"600",padding:"2px 5px",marginRight:"5px"}}><ChevronLeftIcon size={22}/></Button>
                    <Row>
                        {defsaveobj?
                            <SearchMPList isRTL={this.props.isRTL} dmode={this.props.dmode} 
                                showNewButton={this.state.showNew} 
                                isAUICon={false} 
                                isAuiViewsAllow={this.state.isAuiViewsAllow}
                                defSaveObj={this.state.defSaveObj} 
                                isUpdatesAvailable={this.state.isUpdatesAvailable}
                                loadMPDetails={this.loadMPDetails} 
                                showLoadingModal={this.showLoadingModal} 
                                changeDepartmentAndLoadData={this.changeDepartmentAndLoadData} 
                                mpstate={this.props.mpstate} VNRef={this.VNRef} 
                                updateAUIMPObject={this.updateAUIMPObject}
                                resetUpdatesAvailable={this.resetUpdatesAvailable}
                                notsaveConfirm={this.notsaveConfirm}
                                setNewRefresh={this.props.setNewRefresh}
                                />
                        :<Col className='planograms-filters-main'></Col>}
                        
                        <Col xs={7} className="deptswitch-wrapper">
                            <DepartmentSwitch isRTL={this.props.isRTL} dmode={this.props.dmode}
                                mpDeptSearch={this.props.mpstate.mpDeptSearch}
                                loadedDeps={this.props.mpstate.mpLoadedDepartments} 
                                deptlist={this.state.mpDepartmentList} 
                                changeDepartmentAndLoadData={this.changeDepartmentAndLoadData} 
                                />
                        </Col>
                    </Row>
                    
                    {defsaveobj?<>
                        <SimulateMiddleBar categories={this.state.defSaveObj.categories} fieldCountCallOver={this.state.fieldCountCallOver} summaryViewType={this.state.summaryViewType} isRTL={this.props.isRTL} getSimulatePlanogram={this.toggleSimulateAllModal} />

                        {this.state.isAUIDisabled?
                            <Col xs={12} className="auilocked-version text-center">
                                <h6>{this.props.t("VMP_AUI_LOCKED")}</h6>
                            </Col>
                        :<></>}
                    </>:<></>}
                </Col>

                {defsaveobj?<>
                    {!this.state.isdeptdataloading?<>
                        {(this.state.summaryViewType === "scat"?
                            <PagesList.SubcatContent 
                                isRTL={this.props.isRTL}
                                dmode={this.props.dmode}
                                summaryViewType={this.state.summaryViewType}
                                chartFilterDates={this.state.chartFilterDates}
                                chartEnabled={this.state.chartEnabled}
                                noticeImgUrl={this.state.noticeImgUrl}
                                sliderIndex = {this.state.sliderIndex}
                                dataRuleSelectedTab={this.state.dataRuleSelectedTab}
                                drulesEnabled={this.state.drulesEnabled}
                                bottomFieldCount={this.state.bottomFieldCount}
                                deptsettings={this.state.deptsettings}
                                defSaveObj={this.state.defSaveObj}
                                isdepdataloaded={this.state.isdepdataloaded}
                                isdeptupdateavailable={this.state.isdeptupdateavailable}
                                isneeddeptsettingvalid={this.state.isneeddeptsettingvalid}
                                isAUIDisabled={this.state.isAUIDisabled}
                                clearDataCaches={this.clearDataCaches}
                                changeDataRuleActiveTab={this.changeDataRuleActiveTab}
                                getNoticeImageForWatch={this.getNoticeImageForWatch}
                                updatedeptobj={this.updateDeptObject}
                                toggleSummary={this.toggleSummary} 
                                toggleLoadingModal={this.toggleLoadingModal}
                                updateProductDateRanges={this.updateProductDateRanges}
                                updateSavefromChild={this.updateSavefromChild}
                                redirectToCategory={this.redirectToCategory} 
                                changeChartFilterDates={this.changeChartFilterDates}
                                dRulesreload={this.dRulesreload}
                                warningRedirect={this.warningRedirect}
                                resetUpdatesAvailable={this.resetUpdatesAvailable}
                                notsaveConfirm={this.notsaveConfirm}
                                />
                        :(this.state.summaryViewType === "brand" || this.state.summaryViewType === "product")?
                            <PagesList.BrandContent 
                                isRTL={this.props.isRTL}
                                dmode={this.props.dmode}
                                summaryViewType={this.state.summaryViewType} 
                                chartFilterDates={this.state.chartFilterDates}
                                chartEnabled={this.state.chartEnabled}
                                noticeImgUrl={this.state.noticeImgUrl}
                                hasUnsavedProductsSidebarChanges={this.state.hasUnsavedProductsSidebarChanges}
                                sliderIndex = {this.state.sliderIndex}
                                dataRuleSelectedTab={this.state.dataRuleSelectedTab}
                                drulesEnabled={this.state.drulesEnabled}
                                bottomFieldCount={this.state.bottomFieldCount}
                                deptsettings={this.state.deptsettings}
                                defSaveObj={this.state.defSaveObj}
                                isdepdataloaded={this.state.isdepdataloaded}
                                isdeptupdateavailable={this.state.isdeptupdateavailable}
                                isneeddeptsettingvalid={this.state.isneeddeptsettingvalid}
                                isAUIDisabled={this.state.isAUIDisabled}
                                clearDataCaches={this.clearDataCaches}
                                changeDataRuleActiveTab={this.changeDataRuleActiveTab}
                                getNoticeImageForWatch={this.getNoticeImageForWatch}
                                updatedeptobj={this.updateDeptObject}
                                toggleSummary={this.toggleSummary} 
                                toggleLoadingModal={this.toggleLoadingModal}
                                updateProductDateRanges={this.updateProductDateRanges}
                                updateSavefromChild={this.updateSavefromChild}
                                redirectToCategory={this.redirectToCategory} 
                                changeChartFilterDates={this.changeChartFilterDates}
                                dRulesreload={this.dRulesreload}
                                validateAndSaveProducts = {this.validateAndSaveProducts}
                                warningRedirect={this.warningRedirect}
                                resetUpdatesAvailable={this.resetUpdatesAvailable}
                                notsaveConfirm={this.notsaveConfirm}
                                />
                        :(this.state.summaryViewType === "cat")?
                            <PagesList.CategoryContent 
                                depDirectType={this.state.depDirectType}
                                isRTL={this.props.isRTL}
                                dmode={this.props.dmode}
                                summaryViewType={this.state.summaryViewType} 
                                chartFilterDates={this.state.chartFilterDates}
                                chartEnabled={this.state.chartEnabled}
                                dataRuleSelectedTab={this.state.dataRuleSelectedTab}
                                drulesEnabled={this.state.drulesEnabled}
                                bottomFieldCount={this.state.bottomFieldCount}
                                deptsettings={this.state.deptsettings}
                                isdepdataloaded={this.state.isdepdataloaded}
                                noticeImgUrl={this.state.noticeImgUrl}
                                defSaveObj={this.state.defSaveObj}
                                isdeptupdateavailable={this.state.isdeptupdateavailable}
                                isneeddeptsettingvalid={this.state.isneeddeptsettingvalid}
                                isAUIDisabled={this.state.isAUIDisabled}
                                clearDataCaches={this.clearDataCaches}
                                changeDataRuleActiveTab={this.changeDataRuleActiveTab}
                                updatedeptobj={this.updateDeptObject}
                                getNoticeImageForWatch={this.getNoticeImageForWatch}
                                dRulesreload={this.dRulesreload}
                                toggleSummary={this.toggleSummary} 
                                toggleLoadingModal={this.toggleLoadingModal}
                                updateProductDateRanges={this.updateProductDateRanges}
                                updateSavefromChild={this.updateSavefromChild}
                                redirectToCategory={this.redirectToCategory} 
                                changeChartFilterDates={this.changeChartFilterDates}
                                setWatchTabCountStatus = {this.setWatchTabCountStatus}
                                watchTabCountLoaded = {this.state.watchTabCountLoaded}
                                onNewUpdateClick = {this.handleVersionNameFocus} 
                                resetUpdatesAvailable={this.resetUpdatesAvailable}
                                notsaveConfirm={this.notsaveConfirm}
                                updateParentCatList={this.updateParentCatList}
                                />
                        :<></>)}
                    </>:<></>}
                
                </>:<></>}
             
            </Col>
        
            {this.state.defSaveObj && this.state.defSaveObj.mp_id > 0?<>
                {/* <AuiSideBar 
                    department_name={this.state.defSaveObj.department.department_name} 
                    department_id={this.state.defSaveObj.department.department_id}
                    deptsettings={this.state.deptsettings}
                    t={this.props.t} 
                     /> */}
                {isAuiViewsAllow?<AuiSideBarComponent 
                    isAuiViewsAllow={isAuiViewsAllow}
                    isShowLoadingModal={this.state.isShowLoadingModal}

                    importedDataObj={this.state.importedDataObj}
                    updateImportedDataObj={this.updateImportedDataObj}

                    defSaveObj={this.state.defSaveObj}
                    auiMpObj={this.state.auiMpObj}
                    updateAUIMPObject={this.updateAUIMPObject}
                    department_name={this.state.defSaveObj.department.department_name} 
                    department_id={this.state.defSaveObj.department.department_id}
                    deptsettings={this.state.deptsettings}
                    depDirectType={this.state.depDirectType}
                    isShowNewProdOnload={this.state.isShowNewProdOnload}
                    isUpdatesAvailable={this.state.isUpdatesAvailable}
                    t={this.props.t}
                    isRTL={this.props.isRTL} 
                    dmode={this.props.dmode}
                    mpstate={this.props.mpstate}
                    signedobj={this.props.signedobj}
                    isAuiOpen={this.state.isAuiOpen}
                    chartFilterDates={this.state.chartFilterDates}
                    loadedCatsList={this.state.loadedCatsList}
                    changeDepartmentAndLoadData={this.changeDepartmentAndLoadData}
                    handleAuiOpen={this.handleAuiOpen}
                    toggleLoadingModal={this.toggleLoadingModal}
                    toggleSimulateAllModal={this.toggleSimulateAllModal} 
                    updateDepDirectType={this.updateDepDirectType}
                    showLoadingModal={this.showLoadingModal}
                    updateShowNewProd={this.updateShowNewProd}
                    mainScreenMpId={this.state.mainScreenMpId}
                    resetUpdatesAvailable={this.resetUpdatesAvailable}
                    notsaveConfirm={this.notsaveConfirm}
                    />:<></>}
                {this.state.showSidebar && this.state.summaryViewType === "product"?<ProductsSidebar 
                    isRTL={this.props.isRTL} 
                    showSidebar={this.state.showSidebar} 
                    showFullSidebar={this.state.showFullSidebar}
                    showFullSidebarSizeChange={this.state.showFullSidebarSizeChange}
                    chartFilterDates={this.state.chartFilterDates}
                    brandsList={this.state.brandsList} 
                    defSaveObj={this.state.defSaveObj}
                    isAUIDisabled={this.state.isAUIDisabled}
                    selectedCat={this.state.selectedCat}
                    selectedSubCat={this.state.selectedSubCat}
                    selectedBrand={this.state.selectedBrand} 
                    toggleFullSidebar={this.toggleFullSidebar}
                    changeSidebarBrand={this.changeSidebarBrand} 
                    toggleSidebar={this.toggleSidebar} 
                    toggleLoadingModal={this.toggleLoadingModal}
                    isProductsLoaded ={this.state.isProductsLoaded}
                    loadedNewProducts={this.state.loadedNewProducts}
                    loadedNewTestingProds={this.state.loadedNewTestingProds} 
                    loadedTopProds={this.state.loadedTopProds}
                    loadedMvpProds={this.state.loadedMvpProds}
                    loadedTagsList={this.state.loadedTagsList}
                    loadedSidebarBrands={this.state.loadedSidebarBrands}
                    mvpMandatoryIndexes={this.state.mvpMandatoryIndexes}
                    onSortEnd={this.onSortEnd}
                    setMainProductArrays={this.setMainProductArrays}
                    AddHistory={this.AddHistory}
                    productUndoChanges={this.productUndoChanges}
                    historyList = {this.state.productSidebarhistoryList}
                    loadSidebarProductList={this.loadSidebarProductList}
                    // loadSidebarBrandList={this.loadSidebarBrandList}
                    onSortEndOnTop = {this.onSortEndOnTop}
                    removeMandatoryIndex = {this.removeMandatoryIndex}
                    onTopHasTagsIndexes = {this.state.onTopHasTagsIndexes}
                    validateAndSaveProducts = {this.validateAndSaveProducts}
                    saveBrandProductSnapshot = {this.saveBrandProductSnapshot}
                    isHasSnap={this.state.isHasSnap}
                    triggerProdSidebarChange={this.triggerProdSidebarChange}
                    updateNewProdCountBrand={this.updateNewProdCountBrand}
                    hasUnsavedProductsSidebarChanges={this.state.hasUnsavedProductsSidebarChanges}
                    />:<></>}

                    {/* uncommetto break */}
                    {this.state.isallsimulatemodal?
                    <AllSimulationModal 
                        isAuiViewsAllow={isAuiViewsAllow}
                        isSalesCycle={false}
                        isFromStandaloneView={false}
                        importedDataObj={this.state.importedDataObj}
                        simType="Normal"
                        department={this.state.defSaveObj.department}
                        bottomFieldCount={this.state.bottomFieldCount}
                        defSaveObj={this.state.defSaveObj} 
                        mpstate={this.props.mpstate} 
                        chartFilterDates={this.state.chartFilterDates}
                        isallsimulatemodal={this.state.isallsimulatemodal} 
                        isRTL={this.props.isRTL} 
                        dmode={this.props.dmode}
                        loadedTagsList={this.state.loadedTagsList} 
                        openOneCategory={this.state.openOneCategory} 
                        haveChnagesinCat={this.state.haveChnagesinCat}
                        signedobj={this.props.signedobj} 
                        handlehaveChnagesinCat={this.handlehaveChnagesinCat}
                        toggleOneCategory={this.toggleOneCategory} 
                        toggleSimulateAllModal={this.toggleSimulateAllModal} 
                        toggleLoadingModal={this.toggleLoadingModal}
                        sendmarkStackableCall={this.sendmarkStackableCall}
                        handleAuiOpen={this.handleAuiOpen}
                        updateImportedDataObj={this.updateImportedDataObj}
                        changeSaleCycleActive={this.props.changeSaleCycleActive}
                        />
                    :<></> }
            </>:<></>}
            
            <AcViewModal showmodal={this.state.isShowLoadingModal || !this.state.watchTabCountLoaded} />  {/* */}
            
            <Modal size="md" centered={true} className={'new-notice-modal '+(this.props.isRTL === "rtl" ? "RTL":"LTR")} show={this.state.showNewNoticeModal===true} onHide={() => this.setState({showNewNoticeModal:false})} animation={false} backdrop="static" backdropClassName="new-notice-modal-backdrop">
                <Modal.Body>
                    <div className='closebtn' onClick={() => this.initGotIt()}><XIcon size={20} /></div>
                    
                    <Row>
                        <Col xs={1}></Col>
                        <Col xs={10} style={{textAlign:"center"}}>
                            <img className='notice-png' src={newImg} alt="notice" /><br/>
                            
                                <Col className={'txt-label'}><span>{this.props.t("FRESH_MODAL")}</span></Col>
                            
                            <Button className='gotit-btn' onClick={()=>this.initGotIt()}>{this.props.t("GOT_IT")}</Button>
                        </Col>
                        <Col xs={1}></Col>
                    </Row>
                </Modal.Body>
            </Modal>
            
        </>);
    }
}

const mapDispatchToProps = dispatch => ({
    setMasterPlanAction: (payload) => dispatch(selectedMasterPlanSetAction(payload)),
    setMPCategoryAction: (payload) => dispatch(selectedMPCategorySetAction(payload)),
    setMPCategoryRectAction: (payload) => dispatch(selectedMPCategoryRectSetAction(payload)),
    setMPSubCategoryAction: (payload) => dispatch(selectedMPSubCatSetAction(payload)),
    setMPBrandAction: (payload) => dispatch(selectedMPBrandSetAction(payload)),

    setMPCategoryDataCache: (payload) => dispatch(mpCategoryDataCacheSetAction(payload)),
    setMPSubCategoryDataCache: (payload) => dispatch(mpSubCategoryDataCacheSetAction(payload)),
    setMPBrandDataCache: (payload) => dispatch(mpBrandDataCacheSetAction(payload)),
    setMPCategoryNavCache: (payload) => dispatch(mpCategoryNavCacheSetAction(payload)),
    setMPSubCategoryNavCache: (payload) => dispatch(mpSubCategoryNavCacheSetAction(payload)),
    setMPBrandNavCache: (payload) => dispatch(mpBrandNavCacheSetAction(payload)),
    setNewRefresh: (payload) => dispatch(newRefresh(payload)),
    setMpEditStackHistory: (payload) => dispatch(mpEditStackHistorySetAction(payload)),
    setNewProdCountCat: (payload) => dispatch(setNewProdCountCatAction(payload)),
    setNewProdCountSubCat: (payload) => dispatch(setNewProdCountSubCatAction(payload))
});

export default withTranslation()(withRouter(connect(null,mapDispatchToProps)(MPCategoryView)));