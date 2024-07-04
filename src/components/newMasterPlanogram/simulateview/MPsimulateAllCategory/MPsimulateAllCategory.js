import React, { Component } from 'react';
import { Button, Col, ButtonGroup, Row, Alert, Badge } from 'react-bootstrap'; //, Breadcrumb
import { withTranslation } from 'react-i18next';
import {  withRouter } from 'react-router-dom';
// import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import { KebabHorizontalIcon } from '@primer/octicons-react';
// import toImg from 'react-svg-to-image';
// import jsPDF from "jspdf";
// import moment from 'moment';
// import * as htmlToImage from 'html-to-image';
// import * as XLSX from "xlsx-js-style";

// import Select from 'react-select';
// import { v4 as uuidv4 } from 'uuid'; //unique id
import { measureConverter, preventNumberInput, roundOffDecimal } from '../../../../_services/common.service'; // detectLanguage, reverseString, 
// import { alertService } from '../../../../_services/alert.service';
//import { newsimulationbackdto } from '../../SampleData';
import EditSimulateCategory from './EditSimulateCategory/EditSimulateCategory';
import { submitSets } from '../../../UiComponents/SubmitSets';
import { submitCollection } from '../../../../_services/submit.service';
import { alertService } from '../../../../_services/alert.service';
import { AcViewModal } from '../../../UiComponents/AcImports';
import { AuiConvertedetailsSetAction, MPCategoryChangesSetAction, mpEditStackHistorySetAction, mpstackableMarkListAction, setNewProdCountCatAction, setNewProdCountSubCatAction } from '../../../../actions/masterPlanogram/masterplanogram_action';
import { connect } from 'react-redux';
// import FeatherIcon from 'feather-icons-react';
import './MPsimulateAllCategory.css';
import { confirmAlert } from 'react-confirm-alert';
import { catRectEnums, catRuleEnums, simulationPushMode, SimulationTypesFE } from '../../../../enums/masterPlanogramEnums'; // MPBoxType
import { compareAndGetFieldProds, getNameorIdorColorofBox, PrintCoverPageView } from '../../MPSimulationCommenMethods';
import { convertfieldstoFullScreen, convertProductstoFullScreen, makemapCatObj, makemapFieldObj, makemaProductsObj, makeRatiofromhieghestField } from './mpsimCommenMethods';
import { convertWidthPercent, TooltipWrapper } from '../../AddMethods';
import { MPWarnIcon, ExcelPrintIcon, PDFPrintIcon } from '../../../../assets/icons/icons';

// import { assistant_medium } from '../../../../assets/fontsjs/Assistant';
// import { FullRenderProdImage } from '../../renderProdImage';
import SimulationGenarationFilter from '../simulationgenarationFilter/simulationGenarationFilter';
import SimulationSummary from '../SimulationSummryView/SimulationSummary';
import warningicon from '../../../../assets/img/icons/warning-small.png';
import MPAlertBox from '../../alertBox/MPAlertBox';
import { TakeBackOverlapWarn } from '../../contimplement/continueimpl';

class MPsimulateAllCategory extends Component {
    constructor(props){
      
        super(props);
        this.Efullscreendiv=React.createRef();
        this.displaydiv = React.createRef();

        this._isMounted = false;
        
        this.state = {
            allCategoryData: [],
            Categories:[],
            divHeight: 310, displayUOM: "cm", displayRatio: 0,divsummeryHeight: 310,
            viewtype:1,
            selectedCatRect: null, notReleatedProdList: null,
            simulationObj: null, simulateSearchObj: null,
            selectedTag:[], defTagName: -1,
            simulateCount:0,
            loadinggif:false,
            branches:[],
            selectedBranchidx:-1,
            isDefaultFieldCount:true,
            getsimulatepayload:null,
            xrayActive:1,
            iscatdrawobjectCompletefirst:false,
            svgdrawDiemention:{drawWidth:0,drawHeight:0},
            nonSimulatedCatList:[],
            productEditWarningsList:[],
            replaceProdsList:[],
            isFieldCountDisable:false,
            isSaveReloadAvailable: false, reloadNewObj: null,
            logViewType: "category", selectedCat: null, selectedScat: null,
            summaryLoadObj: null, summaryViewObj: null,
            categoryPercentages: [], subCatPercentages: [], brandPercentages: [],
            isShowFullscreen:false,
            fullScreenRatio:0,
            fullscreenObj:null,
            fullscreenheight:0,
            fullscreensvgdrawDiemention:{drawWidth:0,drawHeight:0},
            PrintFullImg:null,
            printHeight:2480 ,
            printWidth:0 ,
            printRatio:1,
            printonepagewidthinPX:3508,
            isopenfirsttime:true,
            loadedprodcount:0,
            isPrioratizeUserPercentage:true,
            saleCycleProductList:[],
            chainSaleCycleProductList:[],
            isChainSaleCycle:false,
            productsWithAnomaly:[],
            isOpen:false,

            ConversionAvailabilityDetails:null,
            // isShowpush:false,
            selectedBrch:null,
            isSCycle:false,
            disableSCycle:false,
           
            isEnableTakeback: false, //enable take back option
            isNoTagAvailable: false, //no tag taggroup available
            isShowTakeBackError: false, takeBackErrorObj: null, //shows take back disable reason
            issloadsim:false,

            isCustomPushEnabled: true, //enable custom search obj

            isPDFPrintPending: false,
            isPrintPending: false,
            isFieldWisePDFPrint: false,

            //excel import data if it a stangdalone simulation
            importedDataObj: {
                isImportDataLoading: false,
                isDataShow: true,
                excelUploadList: [],
                paginationMaxCount: 150, 
                excelStartIndex: 0,
                totalExcelProdCount: 0,
                excelSearchText: "",
            },

            isSaleCycleUpdated: false,
            saleCycleMpObj: {
                mpFromDate: new Date(),
                mpToDate: new Date(),
            },
        }
    }

    componentDidMount(){
        this._isMounted = true;
        
        if(this._isMounted){
            var rdxobjauidetails=this.props.mpstate.auiConvertedDetails
            this.props.setMpEditStackHistory(null)
            this.ParentSelectedTagSet()
            this.ParentisFixedHandle()

            if(this.props.defSaveObj.mp_id!==-1){
                let reduceamount = (this.props.simType !== "AUI" || this.props.isShowFromPreview?130:60);
                let reduceamountsummary=10
                this.setState({divHeight:this.displaydiv.current ? ((this.displaydiv.current.offsetHeight-reduceamount)) : 0,
                    divsummeryHeight:this.displaydiv.current ? ((this.displaydiv.current.offsetHeight-reduceamountsummary)) : 0},()=>{
                    this.sendSimulationDefualtload()
                }) 
            }
            
            if(this.props.simType !== "AUI"){
                this.loadBranches()
                this.handleGetAUIConversionAvailability()
            }
            if(rdxobjauidetails){
                this.setState({isPrioratizeUserPercentage:rdxobjauidetails.isPrioratizeUserPercentage})
            }

            if(this.props.isFromStandaloneView || (!this.props.isFromStandaloneView && this.props.isKeepPreviousMpId)){
                this.loadImportProdList();
            }
        }

        if(this.props.simType === "AUI"){
            this.loadSaleCycleProductList();
        }
    }

    // componentDidUpdate(prevProps){    
    //     if(this.props.simType === "AUI"){
    //         if (prevProps.isSalesCycle !== this.props.isSalesCycle) {
    //             this.handleXrayDepView(1)
    //         }    
    //     }
    // }

    componentWillUnmount(){
        this._isMounted = false;
    }
    //setSelectedtags if parent pass in AUI
    ParentSelectedTagSet=()=>{
        if(this.props.simType === "AUI"||this.props.isopenfromAffectedSimList){
            var list = this.props.selectedTagList;
            
            var editedList = [];
            if(list && list.length > 0){
                for (let i = 0; i < list.length; i++) {
                    const item = list[i];
                    var obj={
                        id: item.id, tagName: item.name?item.name:item.tagName
                    }
                    editedList.push(obj)
                }
            }
            
            this.setState({ 
                selectedTag: editedList
            });
        }
    }
    
    ParentisFixedHandle=()=>{
        if(this.props.simType === "AUI"){
            var bool=this.props.isFixed
           
            this.setState({isPrioratizeUserPercentage:bool})
        }
    }
    //update changes available change
    updateSaveReloadStatus = (cstatus, cobj,notrelatedprods) => {
        // console.log(cstatus, cobj);
        this.setState({ isSaveReloadAvailable: cstatus, reloadNewObj: cobj },()=>{
            //non sure
            if(notrelatedprods){
                this.setState({  notReleatedProdList: notrelatedprods})
            }
        });
    }

    // load branches
    loadBranches=()=>{
        var departmentId =(this.props.department&&this.props.department.department_id)? this.props.department.department_id:-1
        submitSets(submitCollection.storeListWithDefaultFieldCount, "?departmentId=" + departmentId, true).then(res => {
            if (res&&res.status) {
                this.setState({branches:res.extra},()=>{
                    this.setState({selectedBranchidx:  this.props.isopenfromAffectedSimList?(this.state.branches.length>0?this.state.branches.findIndex(x=>x.storeId===this.props.selectedBranch.id):-1):-1})
                })
            }else{
                alertService.error(this.props.t('DATA_LOADING_FAIL'))
            }
        })
    }
    sendSimulationDefualtload=()=>{
        //check if field count 0 then not send call
        if(this.props.bottomFieldCount>0){
            this.setState({simulateCount:this.props.bottomFieldCount},()=>{
                // loadinggif:true,
                if(this.props.isDirectSimulation){
                    this.loadSaleCycleProductList()
                    this.getSimulationcall()
                }
                
                this.setState({isDefaultFieldCount:false})
            })
        }else{
            if(this.props.simType==="ISleAllocation" || this.props.isShowFromPreview){
                this.getSimulationcall()
            }
            this.setState({isDefaultFieldCount:false})
        }
        
    }
    //load simulate data call
    getSimulatePlanogram=()=>{
        this.resetDrawdSimulation();
        //validate simulate req
        if(this.state.simulateCount>0&&this.state.simulateCount!==null){
            this.loadSaleCycleProductList();
            this.getSimulationcall();
        } else {
            if(!(this.state.simulateCount > 0)){
                alertService.error(this.props.t("PLASE_SADD_FIELD_COUNT"))
            } 
        }
    }
    getSimulationcall = (isShowLoading) =>{
        let selectedBranch = (this.state.selectedBranchidx > -1?this.state.branches[this.state.selectedBranchidx]:null);
        let selectedBranchId = (selectedBranch?selectedBranch.storeId:-1);

        let cobj;

        // selectedTagGroup: taggroup,
        //   tagList: taggroup.tags,
        //   storeId: store.id,
        //   storeName: store.name,

        if(this.props.isopenfromAffectedSimList){
            cobj = {
                "snapshotId": this.props.newSnapshotId
            }
        }
        else if(this.props.storeId && this.props.storeId > 0 && this.props.newSnapshotId && this.props.newSnapshotId>-1){
            cobj = {
                "snapshotId": this.props.newSnapshotId,
                "storeId": this.props.storeId,
                "storeName": this.props.storeName,
                "selectedTagsId": this.state.selectedTag,
            }
        }else if(this.props.storeId && this.props.storeId > 0 && this.props.originatedSnapshotId && this.props.originatedSnapshotId>-1){
            cobj = {
                "snapshotId": this.props.originatedSnapshotId,
                "storeId": this.props.storeId,
                "storeName": this.props.storeName,
                "selectedTagsId": this.state.selectedTag,
            }
        }else if((this.props.selectedTagList&&this.props.selectedTagList.length)>0 && this.props.newSnapshotId && this.props.newSnapshotId>-1){
            cobj = {
                "snapshotId": this.props.newSnapshotId
            }
        }else{
            cobj = {
                "mpId": this.props.originatedMpId? this.props.originatedMpId>-1 ? this.props.originatedMpId : this.props.defSaveObj.mp_id : this.props.defSaveObj.mp_id,
                "selectedTagsId": this.state.selectedTag,
                "fieldCount": (this.state.simulateCount?parseInt(this.state.simulateCount):0),
                "isDefaultFieldCount":this.state.isDefaultFieldCount,
                "storeId":((this.props.simType === "AUI" || this.props.simType === "ISleAllocation")?this.props.storeId:selectedBranchId),
                "storeName": ((this.props.simType === "AUI" || this.props.simType === "ISleAllocation")?this.props.storeName:selectedBranch?selectedBranch.storeName:null),
                "isPrioratizeUserPercentage":this.state.isPrioratizeUserPercentage,
                "pushMode": (this.props.simType === "AUI"?"none":(this.state.isCustomPushEnabled?simulationPushMode.custom:simulationPushMode.branch_selection)),
                "newProductFilters": [],
            }

            if(this.props.isIsleSimulation){
                let islesimobj = this.props.isleSimObj;
                // console.log(islesimobj);

                cobj.fieldCount = islesimobj.fieldCount;
                cobj.isDefaultFieldCount = false;
                cobj.selectedTagsId = islesimobj.tagList;
            }

            if(this.props.isShowFromPreview){
                let previewobj = this.props.selectedSimPreviewObj;
                // console.log(previewobj);
                
                cobj.fieldCount = previewobj.fieldObj.fieldCount;
                cobj.isDefaultFieldCount = false;
                cobj.selectedTagsId = previewobj.tagObj.tags;
                cobj.storeId = previewobj.storeObj.id;
                cobj.storeName = previewobj.storeObj.name;
                cobj.mpId = previewobj.mpId;
                cobj.isPrioratizeUserPercentage = true;
                cobj.snapshotId = previewobj.snapshotId ? previewobj.snapshotId : -1;

                let previewProdList = [];
                if(previewobj.selectedProds && previewobj.selectedProds.length > 0){
                    for (let i = 0; i < previewobj.selectedProds.length; i++) {
                        const previewgroup = previewobj.selectedProds[i];
                        
                        previewProdList.push(previewgroup.uuid);
                    }
                }

                cobj.newProductFilters = previewProdList;
            }
        }
        
        this.toggleLoadingModal(true, () => {
            submitSets(submitCollection.mpSimulation, cobj, false).then(res => {
                if (res && res.status) {
                    this.toggleLoadingModal(false);

                    let responseSearchObj = (res.extra && res.extra.searchDto && Object.keys(res.extra.searchDto).length > 0?res.extra.searchDto:null);
                    
                    this.setState({ simulationObj:res.extra, simulateSearchObj: cobj,
                        simulateCount: (responseSearchObj && responseSearchObj.fieldCount > 0?responseSearchObj.fieldCount:this.state.simulateCount),
                        getsimulatepayload:cobj,
                        isopenfirsttime:true
                    },() => {
                        if(this.props.simType === "AUI"){
                            this.props.saveSimulationObjToSideBarComp(res.extra);
                            if(this.props.islookRelgramandclkIt){
                                this.props.updatestoreStatusAftersim()
                            }
                        }
                        this.enableTakeBack();
                        this.backdatatoFront(res.extra)
                        if(selectedBranchId>0&&res.extra.fieldCount===0){
                            this.showfieldcountzeroMessage()
                        }
                        
                        this.compareImportedProds();
                    })
                }else{
                    alertService.error(this.props.t("erroroccurred"));
                    this.toggleLoadingModal(false);
                }
            })    
        });
    }
    showfieldcountzeroMessage=()=>{
        confirmAlert({
            title: this.props.t('MANUALY_ENTER_FIELD_COUNT'),
            message: this.props.t("MANUALY_ENTER_FIELD_COUNT_description"),
            overlayClassName: (this.props.isRTL === "rtl" ? "alertrtl-content" : ""),
            buttons: [{
                label: this.props.t('OKAY'),
                onClick: () => {
                    return false;
                }
            }, ]
        });
    }
   
    handleViewType = (type) => {
        this.setState({ viewtype: type, logViewType: "category" }, () => {
            if(type === 2){
                this.loadSimSummaryData();
            }
        });
    }

    handleSCycle = (val) =>{
            this.setState({isSCycle:val});
    }

    //temp - load mpdata for summary 
    loadSimSummaryData = () => {
        let sobj = {
            chainHasDepartmentId: (this.props.department?(this.props.simType === "AUI" && this.props.department?this.props.department.id:this.props.department.department_id):-1),
        }

        this.setState({ loadinggif: true }, () => {
            submitSets(submitCollection.loadMp, sobj, false).then(res => {
                //console.log(res);
                if(res && res.status){
                    let newsaveobj = ((res.extra && Object.keys(res.extra).length > 0)?res.extra:null);
                    this.setState({ summaryLoadObj: newsaveobj }, () => {
                        this.createSummaryObj(newsaveobj); 
                    });
                } else{
                    alertService.error(this.props.t("ERROR_OCCURRED"));
                    this.setState({ loadinggif: false });
                }
            });    
        });
    }
    //temp - create summary object for view
    createSummaryObj = (loaddata) => {

        let newSumCats = []; let catruleids = [];
        if(loaddata && loaddata.categories && loaddata.categories.length > 0){
            for (let i = 0; i < loaddata.categories.length; i++) {
                const parentrect = loaddata.categories[i];
                for (let j = 0; j < parentrect.rects.length; j++) {
                    const catitem = parentrect.rects[j];
                    catitem["percentage"] = catitem.width;

                    if(catitem.type === catRectEnums.rule){
                        catruleids.push({ level: catitem.rule.level, id: getNameorIdorColorofBox(catitem, "num") });
                    }

                    for (let k = 0; k < catitem.sub_categories.length; k++) {
                        const subcatitem = catitem.sub_categories[k];
                        
                        let subcatper = 0;
                        let scatbrands = [];
                        for (let l = 0; l < subcatitem.rects.length; l++) {
                            const scatrect = subcatitem.rects[l];
                            subcatper += scatrect.width;

                            for (let z = 0; z < scatrect.brands.length; z++) {
                                const scrbrand = scatrect.brands[z];

                                let scrbrandper = scrbrand.rects.map(brect => brect.width).reduce((breprev, brenext) => breprev + brenext);
                                scrbrand["percentage"] = scrbrandper;

                                let isbrandadded = scatbrands.findIndex(bnditem => getNameorIdorColorofBox(bnditem,"num") === getNameorIdorColorofBox(scrbrand, "num"));
                                if(isbrandadded > -1){
                                    scatbrands[isbrandadded].percentage += scrbrand.percentage;
                                } else{
                                    scatbrands.push(scrbrand);
                                }
                            }
                        }
                        subcatitem["brands"] = scatbrands;
                        subcatitem["percentage"] = subcatper;
                    }

                    newSumCats.push(catitem);
                }
            }
            this.setState({ summaryViewObj: newSumCats  }, () => {
                this.getCategoryPercentages(newSumCats, catruleids);
            });
        } else{
            this.setState({ loadinggif: false });
        }
    }

    getCategoryPercentages = (fixdata, ruleids) => {
        let mpid = (this.props.originatedMpId? this.props.originatedMpId>-1 ? this.props.originatedMpId : this.props.defSaveObj ? this.props.defSaveObj.mp_id : -1 : this.props.defSaveObj ? this.props.defSaveObj.mp_id : -1);

        let svobj = { 
            mpId: mpid,
            chainHasDepartmentId: (this.props.department?this.props.department.department_id:-1),
            fromDate: this.props.chartFilterDates? this.props.chartFilterDates.fromdate:undefined,
            endDate:  this.props.chartFilterDates?this.props.chartFilterDates.todate:undefined,
            mpRuleIds: ruleids,
        };

        submitSets(submitCollection.mpCategoryPercentage, svobj).then(res => {
            if(res && res.status && res.extra){
                this.setState({ categoryPercentages: res.extra }, () => {
                    this.comparePercentagesData();
                    this.getNewProdCountOfCatLevel(svobj);
                });
            } else{
                this.getNewProdCountOfCatLevel(svobj);
                this.setState({ loadinggif: false });
            }
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

    comparePercentagesData = () => {
        let loadedcatpers = this.state.categoryPercentages;
        let loadedsubcats = this.state.summaryViewObj;

        for (let i = 0; i < loadedsubcats.length; i++) {
            const catitem = loadedsubcats[i];

            let isfindper = loadedcatpers.find(x => ((catitem.type === catRectEnums.default && !x.isRule && getNameorIdorColorofBox(catitem, "num") === x.id) || 
            (catitem.type === catRectEnums.rule && x.isRule && x.ruleLevel === catitem.rule.level && getNameorIdorColorofBox(catitem, "num") === x.id)));

            catitem["requiredPercentage"] = (isfindper?isfindper.suggestedPercentage:0);
        }

        this.setState({ loadinggif: false, summaryViewObj: loadedsubcats }, () => {
        });
    }
    
    // #MP-SML-01
    //convert back dealer nto a creating new dealr to front
    backdatatoFront=(obj,dontcloseloading)=>{
        var cobj = JSON.parse(JSON.stringify(obj));
        
        var cfieldList = cobj.fieldList;
        var cCatList = cobj.categoryList;
        var cproductList = cobj.products;
        var cmapfieldObj = null;
        let actualFieldsCounts = cobj.actualFieldStructures;

        // console.log(cobj.nonSimulateProducts);
        var dimention = makeRatiofromhieghestField(cfieldList,this.state.displayUOM,this.state.divHeight)
        this.setState({ displayRatio: dimention,
            nonSimulatedCatList:cobj.nonSimulateProducts,
            productEditWarningsList:cobj.productEditWarnings,//uncomment this to actual list show cobj.nonSimulateProducts,
            replaceProdsList:cobj.replaceProds }, () => {
            var mapF = makemapFieldObj(cfieldList,this.state.displayUOM,this.state.displayRatio,this.state.divHeight, actualFieldsCounts);
            cmapfieldObj = mapF.mapfieldObj;
            var cmapCatObj = makemapCatObj(cCatList,this.state.displayUOM,this.state.displayRatio,cmapfieldObj);
            
            var cmapproductsObj = makemaProductsObj(cproductList,this.state.displayUOM,this.state.displayRatio,cmapfieldObj);
            
            // if(this.props.simType === "AUI" || this.props.simType === "Normal"){
                // if(this.props.simType === "AUI"){
                    this.getProductAnomalies(cmapfieldObj, cmapCatObj, cmapproductsObj);
                // }
                // if(this.props.simType === "Normal" && this.state.selectedBrch !== null){
                    // this.getProductAnomalies(cmapfieldObj,cmapproductsObj);
                // }
            // }

            //loop fields
            this.setState({
                svgdrawDiemention: {drawWidth:mapF.svgWidth,drawHeight:0},
                mapFields: cmapfieldObj,
                mapCategories: cmapCatObj,
                mapProducts: cmapproductsObj,
                loadinggif: dontcloseloading?true:false,
                isSaveReloadAvailable: false,
                reloadNewObj: null,
                actualFieldStructures :cobj.actualFieldStructures 
            })
        })
        
        this.setState({ allCategoryData: cobj },()=>{
            this.settodrawobjects()
        });
    }


    getProductAnomalies = (fields, categories, products) => {

        const convertedCmapfieldObj = this.convertCmapFieldObj(fields);
        const convertedCmapproductObj = this.convertCmapproductObj(products, categories);

        let saleCyclePrdListObj = [];

       if(this.state.isChainSaleCycle){
           saleCyclePrdListObj = this.state.chainSaleCycleProductList;
        }else{
           saleCyclePrdListObj = this.state.saleCycleProductList;
       }

        const productQtyObj = this.getProductQty3d(convertedCmapfieldObj,convertedCmapproductObj);

        // const dayCount = this.getDayCount(this.props.defSaveObj.masterPlanogram ? this.props.defSaveObj.masterPlanogram.searchFromDate ?  this.props.defSaveObj.masterPlanogram.searchFromDate: this.props.defSaveObj.searchFromDate  : this.props.defSaveObj.searchFromDate, this.props.defSaveObj.masterPlanogram ? this.props.defSaveObj.masterPlanogram.searchToDate ? this.props.defSaveObj.masterPlanogram.searchToDate : this.props.defSaveObj.searchToDate : this.props.defSaveObj.searchToDate);
        
        // const dayCount = this.props.isNewProdSim 
        // ? this.getDayCount(this.props.selectedSimPreviewObj.mpFromDate, this.props.selectedSimPreviewObj.mpToDate)
        // : this.getDayCount(this.props.defSaveObj.masterPlanogram ? this.props.defSaveObj.masterPlanogram.searchFromDate ?  this.props.defSaveObj.masterPlanogram.searchFromDate: this.props.defSaveObj.searchFromDate  : this.props.defSaveObj.searchFromDate, this.props.defSaveObj.masterPlanogram ? this.props.defSaveObj.masterPlanogram.searchToDate ? this.props.defSaveObj.masterPlanogram.searchToDate : this.props.defSaveObj.searchToDate : this.props.defSaveObj.searchToDate)
 
        const dayCount = this.getDayCount(this.state.saleCycleMpObj.mpFromDate, this.state.saleCycleMpObj.mpToDate);

        // console.log("Day count =>",dayCount)
            
            //console.log
            // Create a lookup object using the second array
            // const lookupObject = convertedCmapproductObj.reduce((acc, obj) => {
            //     acc[obj.productId] = obj.barcode;
            //     return acc;
            // }, {});
            
            // Map over the first array and add the barcode property
            // const updatedArray = productQtyObj.map(obj => {
            //     return {
            //     ...obj,
            //     barcode: lookupObject[obj.productId] || null
            //     };
            // });
    
            // console.log("S =>",updatedArray)

        let productsOfSelectedStores=[];

        if(this.props.simType === "AUI"){
            
            if(this.props.isNewProdSim){
                productsOfSelectedStores = this.getSalesCycle(saleCyclePrdListObj,[this.props.selectedSimPreviewObj.storeObj.id], productQtyObj, dayCount);
            }else{

                const storesByTags = this.getStoresByTags(this.props.tagStoreGroup);
                
                if(this.props.selectedTagList.length === 0 && this.props.notagid === null && this.props.storeId === -1){
    
                    const desiredStoreIDs = storesByTags.reduce((acc, curr) => {
                        curr.storeID.forEach(storeID => {
                        if (!acc.has(storeID)) {
                            acc.add(storeID);
                        }
                        });
                        return acc;
                    }, new Set());
    
                    let allStoreId=[...desiredStoreIDs];
    
                    productsOfSelectedStores = this.getSalesCycle(saleCyclePrdListObj, allStoreId, productQtyObj, dayCount);
    
                }else{
    
                    if(this.props.storeId === -1){
    
                        const desiredStoreIDs = storesByTags.filter(store => {
                            const tagsMatch = JSON.stringify(store.tags) === JSON.stringify(this.props.selectedTagList);
                            return tagsMatch;
                        }).flatMap(store => store.storeID);
    
                        productsOfSelectedStores = this.getSalesCycle(saleCyclePrdListObj, desiredStoreIDs, productQtyObj, dayCount);
                    }else{
                        productsOfSelectedStores = this.getSalesCycle(saleCyclePrdListObj,[this.props.storeId], productQtyObj, dayCount);
                    }
                }

            }

        }

        if(this.props.simType === "Normal"){
            productsOfSelectedStores = this.getSalesCycle(saleCyclePrdListObj, [this.state.selectedBrch], productQtyObj, dayCount);
        }

        let quartiles = null;

        
        //Minimum 4 products needed to calculate quartiles otherwise it is crashing due to less products when products simulated less than 4
        if(productsOfSelectedStores.length>3 && productsOfSelectedStores.filter(obj => obj.salesAvailable).length>3){
            if(this.props.simType === "AUI"){
                if(this.props.isNewProdSim){
                    this.disableSCycle(false);
                }else{
                    this.props.disableSalesCycle(false);
                }
            }

            if(this.props.simType === "Normal"){
                this.disableSCycle(false);
            }

            quartiles = this.calculateQuartiles(productsOfSelectedStores);
        }else{
            quartiles = {q1: null, q2: null, q3: null}
            if(this.props.simType === "AUI"){
                if(this.props.isNewProdSim){
                    this.disableSCycle(true);
                }else{
                    this.props.disableSalesCycle(true);
                }
            }

            if(this.props.simType === "Normal"){
                this.disableSCycle(true);
            }
            
        }

        const productsWithAnomaly = this.getAnomalyObject(quartiles, productsOfSelectedStores);
     
        //console.log(quartiles, productsWithAnomaly ,storesByTags ,productQtyObj, saleCyclePrdListObj, dayCount);
        //console.log(productQtyObj,productsWithAnomaly,cmapproductsObj);
        if(productsWithAnomaly.length>1){
            productsWithAnomaly.sort((a, b) =>  b.salesCycle - a.salesCycle );
        }

        this.setState({productsWithAnomaly:productsWithAnomaly, isSaleCycleUpdated: true},()=>{
            // console.log(this.state.productsWithAnomaly)
        });
        
    }

    updateIsSaleCycleUpdated = (val) => {
        this.setState({isSaleCycleUpdated: val});
    }

    getSalesCycle = (salesCycleProductList, storeIdArray, productQtyObj, dayCount) => {

        const salesCycleObj = [];

        const consoleObj = [];

        // Loop through each object in the salesCycleProductList array
        salesCycleProductList.forEach((product) => {
            // Check if the product has any stores that match the storeIdArray
            let relevantStores ;

            if(this.state.isChainSaleCycle){
                relevantStores = product.stores;
            }else{
                relevantStores = product.stores.filter((store) => {
                    return storeIdArray.includes(store.storeId);
                });
            }

            // If there are relevant stores, sum the salesQty and create a new object with the desired format
            if (relevantStores.length > 0) {
                const totalSaleQty = relevantStores.reduce((acc, store) => {
                    return acc + store.storeSaleQty;
                }, 0);

                // Find the product in the productQtyObj array that matches the current product
                const relevantProduct = productQtyObj.find((p) => p.productId === product.product_id);

                // If there is a relevant product, calculate the sales cycle and create a new object with the desired format
                if (relevantProduct) {
                    // console.log("productId => ",relevantProduct.productId," barcode => ",product.product_barcode," totalSaleQty of Stores =>",totalSaleQty," Q(totalSaleQty/dayCount)=>" ,totalSaleQty/dayCount );
                    const printObj ={
                        productId : relevantProduct.productId,
                        barcode : product.product_barcode,
                        totalSaleQtyOfStores : totalSaleQty,
                        q : totalSaleQty/dayCount
                    }
                    consoleObj.push(printObj);

                    const salesCycle = relevantProduct.productQty / (totalSaleQty / dayCount);

                    const newObject = {
                    productId: product.product_id,
                    productName: relevantProduct.productName,
                    productBarcode: product.product_barcode,
                    height: relevantProduct.height,
                    width: relevantProduct.width,
                    imageUrl: relevantProduct.imageUrl,
                    salesCycle: salesCycle,
                    salesAvailable: true,
                    productNotAvailableInSCList: false,
                    prodQty: relevantProduct.productQty,
                    saleQty: totalSaleQty,
                    dayCount: dayCount,
                    categoryId:relevantProduct.categoryId,
                    categoryName:relevantProduct.categoryName,
                    subCategoryId:relevantProduct.subCategoryId,
                    subCategoryName:relevantProduct.subCategoryName,
                    brandId:relevantProduct.brandId,
                    brandName:relevantProduct.brandName,
                    supplierId:relevantProduct.supplierId,
                    supplierName:relevantProduct.supplierName
                    };

                    // Add the new object to the resultArray
                    salesCycleObj.push(newObject);
                }
            }else{

                const relevantProduct = productQtyObj.find((p) => p.productId === product.product_id);

                if (relevantProduct) {
                    const newObject = {
                        productId: product.product_id,
                        productName: relevantProduct.productName,
                        productBarcode: product.product_barcode,
                        height: relevantProduct.height,
                        width: relevantProduct.width,
                        imageUrl: relevantProduct.imageUrl,
                        salesCycle: null,
                        salesAvailable: false,
                        productNotAvailableInSCList: false,
                        prodQty: relevantProduct.productQty,
                        saleQty: 0,
                        dayCount: dayCount,
                        categoryId:relevantProduct.categoryId,
                        categoryName:relevantProduct.categoryName,
                        subCategoryId:relevantProduct.subCategoryId,
                        subCategoryName:relevantProduct.subCategoryName,
                        brandId:relevantProduct.brandId,
                        brandName:relevantProduct.brandName,
                        supplierId:relevantProduct.supplierId,
                        supplierName:relevantProduct.supplierName
                    };

                    salesCycleObj.push(newObject);
                }
            }
        });

        let productNotInSaleCycleList = productQtyObj.filter(prod => !salesCycleProductList.some(prd => prd.product_id === prod.productId));
         
        for (const prd of productNotInSaleCycleList) {
            const newObject = {
                productId: prd.productId,
                productName: prd.productName,
                productBarcode: prd.barcode,
                height: prd.height,
                width: prd.width,
                imageUrl: prd.imageUrl,
                salesCycle: null,
                salesAvailable: false,
                productNotAvailableInSCList: true,
                prodQty: prd.productQty,
                saleQty: 0,
                dayCount: dayCount,
                categoryId:prd.categoryId,
                categoryName:prd.categoryName,
                subCategoryId:prd.subCategoryId,
                subCategoryName:prd.subCategoryName,
                brandId:prd.brandId,
                brandName:prd.brandName,
                supplierId:prd.supplierId,
                supplierName:prd.supplierName
            };

            salesCycleObj.push(newObject);
        }

        // console.log("Q =>", consoleObj);

        return salesCycleObj;

    }

    disableSCycle = (val) => {
        if(val === true){
            this.setState({ disableSCycle: val, isSCycle: false });
        }else{
            this.setState({ disableSCycle: val });
        }
      }

    // Define a function to calculate the quartiles
    calculateQuartiles=(data) => {

        //getting only sales available data
        const filteredData = data.filter(obj => obj.salesAvailable);

        if(filteredData.length>0){
                            
            // Sort the data in ascending order
            filteredData.sort((a, b) => a.salesCycle - b.salesCycle);
            
            // Calculate the median (Q2)
            const medianIndex = Math.floor(filteredData.length / 2);

            if(medianIndex > 0){
                const q2 = filteredData.length % 2 === 0 ? (filteredData[medianIndex - 1].salesCycle + filteredData[medianIndex].salesCycle) / 2 : filteredData[medianIndex].salesCycle;
            
                // Calculate the lower and upper halves of the data
                const lowerHalf = filteredData.slice(0, medianIndex);
                const upperHalf = filteredData.slice(filteredData.length % 2 === 0 ? medianIndex : medianIndex + 1);
                
                // Calculate the lower quartile (Q1)
                // const q1Index = Math.floor(lowerHalf.length / 2);
                //const q1 = lowerHalf.length % 2 === 0 ? (lowerHalf[q1Index - 1].salesCycle + lowerHalf[q1Index].salesCycle) / 2 : lowerHalf[q1Index].salesCycle;
                const q1 = lowerHalf.length % 2 === 0 ? (lowerHalf[medianIndex / 2 - 1].salesCycle + lowerHalf[medianIndex / 2].salesCycle) / 2 : lowerHalf[Math.floor(medianIndex / 2)].salesCycle;
                
                // Calculate the upper quartile (Q3)
                //const q3Index = Math.floor(upperHalf.length / 2);
                //const q3 = upperHalf.length % 2 === 0 ? (upperHalf[q3Index - 1].salesCycle + upperHalf[q3Index].salesCycle) / 2 : upperHalf[q3Index].salesCycle;
                const q3 = upperHalf.length % 2 === 0 ? (upperHalf[upperHalf.length / 2 - 1].salesCycle + upperHalf[upperHalf.length / 2].salesCycle) / 2 : upperHalf[Math.floor(upperHalf.length / 2)].salesCycle;
                
                return { q1, q2, q3 };
            }else{
                return {q1: null, q2: null, q3: null}
            }        
        
        }else{
            return {q1: null, q2: null, q3: null}
        }

    }

    getAnomalyObject = (quartiles, productsOfSelectedStores) =>{
        productsOfSelectedStores.forEach(product => {
            if (product.salesCycle === null) {
              product.anomaly = "no_data";
            } else if (product.salesCycle < quartiles.q1) {
              product.anomaly = "low";
            } else if (product.salesCycle > quartiles.q3) {
              product.anomaly = "high";
            } else {
              product.anomaly = "no";
            }
          });

          return productsOfSelectedStores;
    }

    convertCmapFieldObj = (cmapfieldObj) =>{

        const convertedCmapfieldObj = [];

        for (const key in cmapfieldObj) {
            const { field_custom_id, depth, shelf} = cmapfieldObj[key];
            const newShelf = shelf.map(({ rank, height }) => ({ rank, height }));
            convertedCmapfieldObj.push({ field_custom_id, depth, shelf: newShelf });
          }

          return convertedCmapfieldObj
    }
    
    convertCmapproductObj = (cmapproductsObj, categories) =>{

        const convertedCmapproductObj = [];

        for(const key in cmapproductsObj){
            const { productId, name, barcode, imageUrl, width, height, depth, field_custom_id, shelfrank, isStackable, maxStackableCount  } = cmapproductsObj[key];

            let catObj = Object.values(categories).find(field => field.field_custom_id === cmapproductsObj[key].field_custom_id)

            let categoryId = catObj.type === "default" ? catObj.category.category_id : catObj.rule.level === "category" ? catObj.rule.category.categoryId : catObj.rule.level === "sub_category" ? catObj.rule.sub_category.subCategoryId :  catObj.rule.level === "brand" ? catObj.rule.brand.brandId : catObj.rule.supplier.supplierId;
            let categoryName = catObj.type === "default" ? catObj.category.category_name : catObj.rule.level === "category" ? catObj.rule.category.categoryName : catObj.rule.level === "sub_category" ? catObj.rule.sub_category.subCategoryName :  catObj.rule.level === "brand" ? catObj.rule.brand.brandName : catObj.rule.supplier.supplierName;

            let subCategoryId = cmapproductsObj[key].subcategory ? cmapproductsObj[key].subcategory.sub_category ? cmapproductsObj[key].subcategory.sub_category.subCategoryId : null : null;
            let subCategoryName = cmapproductsObj[key].subcategory ? cmapproductsObj[key].subcategory.sub_category ? cmapproductsObj[key].subcategory.sub_category.subCategoryName : null : null;

            let brandId = cmapproductsObj[key].productBrand ? cmapproductsObj[key].productBrand.brandId : null;
            let brandName = cmapproductsObj[key].productBrand ? cmapproductsObj[key].productBrand.brandName : null;

            let supplierId = cmapproductsObj[key].brand ? cmapproductsObj[key].brand.brand ? cmapproductsObj[key].brand.brand.supplier ? cmapproductsObj[key].brand.brand.supplier.supplierId : null : null : null;
            let supplierName = cmapproductsObj[key].brand ? cmapproductsObj[key].brand.brand ? cmapproductsObj[key].brand.brand.supplier ? cmapproductsObj[key].brand.brand.supplier.supplierName : null : null : null;

            convertedCmapproductObj.push({ productId, name, barcode, imageUrl, width, height, depth, field_custom_id, shelfrank, isStackable, maxStackableCount, categoryId, categoryName, subCategoryId, subCategoryName, brandId, brandName, supplierId, supplierName })
        }
        

        return convertedCmapproductObj
    }

    loadSaleCycleProductList = () => {

        this.setState({isChainSaleCycle: false},()=>{
            if(this.props.simType === "AUI" && !this.props.isNewProdSim){
                this.props.updateIsChainSaleCycle(false);
            }

            if(this.props.defSaveObj && this.props.defSaveObj.mp_id > 0){
    
              let sobj;
    
              if(this.props.isNewProdSim){
                  sobj = { mp_id: this.props.selectedSimPreviewObj.mpId}
              }else{
                  sobj = { mp_id: this.props.originatedMpId? this.props.originatedMpId>-1 ? this.props.originatedMpId : this.props.defSaveObj.mp_id : this.props.defSaveObj.mp_id }
              }
              
              submitSets(submitCollection.saleCycleProductList,sobj, false).then(res => {
                if(res && res.status){
                  if(res.extra && res.extra.mp && res.extra.products){

                    this.setState({saleCycleMpObj: { mpFromDate: res.extra.mp ? res.extra.mp.mpFromDate ? res.extra.mp.mpFromDate : new Date() : new Date(), mpToDate:  res.extra.mp ? res.extra.mp.mpToDate ? res.extra.mp.mpToDate : new Date() : new Date() }},()=>{

                        if(this.props.simType === "AUI"){
        
                            const storesByTags = this.getStoresByTags(this.props.tagStoreGroup);
        
                            if(this.props.isNewProdSim){
        
                                let selectedStore = this.props.selectedSimPreviewObj.storeObj.id;
        
                                let pdlist = res.extra.products;
            
                                let isAvail = false;
        
                                let filteredpdlist = pdlist.map(product => {
                                    const filteredStores = product.stores.filter(store => store.storeId === selectedStore);
                                    return { ...product, stores: filteredStores.length ? filteredStores : [] };
                                });
        
                                for (const prd of filteredpdlist) {
                                    if(prd.stores.length > 0){
                                        isAvail = true;
                                        break;
                                    }
                                }
        
                                if(isAvail){
                                    this.setState({saleCycleProductList: res.extra.products});
                                }else{
                                    this.setState({isChainSaleCycle:true, chainSaleCycleProductList: res.extra.products});
                                }
        
                            }else{
                                if(this.props.selectedTagList.length === 0 && this.props.notagid === null && this.props.storeId === -1){
                    
                                    const desiredStoreIDs = storesByTags.reduce((acc, curr) => {
                                        curr.storeID.forEach(storeID => {
                                        if (!acc.has(storeID)) {
                                            acc.add(storeID);
                                        }
                                        });
                                        return acc;
                                    }, new Set());
                    
                                    let allStoreId=[...desiredStoreIDs];
                    
                                    let pdlist = res.extra.products;
            
                                    let isAvail = false;
            
                                    for (const strId of allStoreId) {
            
                                        let filteredpdlist = pdlist.map(product => {
                                            const filteredStores = product.stores.filter(store => store.storeId === strId);
                                            return { ...product, stores: filteredStores.length ? filteredStores : [] };
                                        });
            
                                        for (const prd of filteredpdlist) {
                                            if(prd.stores.length > 0){
                                                isAvail = true;
                                                break;
                                            }
                                        }
                                        
                                    }
            
                                    if(isAvail){
                                        this.setState({saleCycleProductList: res.extra.products});
                                    }else{
                                        this.props.updateIsChainSaleCycle(true);
                                        this.setState({isChainSaleCycle:true, chainSaleCycleProductList: res.extra.products});
                                    }
                    
                                }else{
                    
                                    if(this.props.storeId === -1){
                    
                                        const desiredStoreIDs = storesByTags.filter(store => {
                                            const tagsMatch = JSON.stringify(store.tags) === JSON.stringify(this.props.selectedTagList);
                                            return tagsMatch;
                                        }).flatMap(store => store.storeID);
            
                                        let pdlist = res.extra.products;
            
                                        let isAvail = false;
            
                                        for (const strId of desiredStoreIDs) {
            
                                            let filteredpdlist = pdlist.map(product => {
                                                const filteredStores = product.stores.filter(store => store.storeId === strId);
                                                return { ...product, stores: filteredStores.length ? filteredStores : [] };
                                            });
            
                                            for (const prd of filteredpdlist) {
                                                if(prd.stores.length > 0){
                                                    isAvail = true;
                                                    break;
                                                }
                                            }
                                            
                                        }
            
                                        if(isAvail){
                                            this.setState({saleCycleProductList: res.extra.products});
                                        }else{
                                            this.props.updateIsChainSaleCycle(true);
                                            this.setState({isChainSaleCycle:true, chainSaleCycleProductList: res.extra.products});
                                        }
                    
                                        // productsOfSelectedStores = this.getSalesCycle(saleCyclePrdListObj, desiredStoreIDs, productQtyObj, dayCount);
                                    }else{
            
                                        let selecetedStoreId = this.props.storeId;
            
                                        let pdlist = res.extra.products;
            
                                        let isAvail = false;
            
                                        let filteredpdlist = pdlist.map(product => {
                                            const filteredStores = product.stores.filter(store => store.storeId === selecetedStoreId);
                                            return { ...product, stores: filteredStores.length ? filteredStores : [] };
                                        });
            
                                        for (const prd of filteredpdlist) {
                                            if(prd.stores.length > 0){
                                                isAvail = true;
                                                break;
                                            }
                                        }
            
                                        if(isAvail){
                                            this.setState({saleCycleProductList: res.extra.products});
                                        }else{
                                            this.props.updateIsChainSaleCycle(true);
                                            this.setState({isChainSaleCycle:true, chainSaleCycleProductList: res.extra.products});
                                        }
            
                                        // productsOfSelectedStores = this.getSalesCycle(saleCyclePrdListObj,[this.props.storeId], productQtyObj, dayCount);
                                    }
                                }
                                // this.setState({saleCycleProductList: res.extra.products});
                            }
                        }
                        if(this.props.simType === "Normal"){
        
                            let pdlist = res.extra.products;
                            let filteredpdlist = pdlist.map(product => {
                                const filteredStores = product.stores.filter(store => store.storeId === this.state.selectedBrch);
                                return { ...product, stores: filteredStores.length ? filteredStores : [] };
                            });
        
                            let isStore = false;
                            
                            for (const prd of filteredpdlist) {
                                if(prd.stores.length > 0){
                                    isStore = true;
                                    break;
                                }
                            }
        
                            if(isStore){
                                this.setState({saleCycleProductList: filteredpdlist});
                            }else{
                                this.setState({isChainSaleCycle:true, chainSaleCycleProductList: res.extra.products});
                            }
                        }
                    });
                  }
                }
              });
      
            }
        })
      
      }

    getProductQty3d = (convertedCmapfieldObj,convertedCmapproductObj) =>{
        const filterdconvertedCmapproductObj =convertedCmapproductObj.filter(f=>f.isDelete!==true)
        const outputObj = filterdconvertedCmapproductObj.reduce((acc, product) => {
            const field = convertedCmapfieldObj.find((field) => field.field_custom_id.toString() === product.field_custom_id.toString());
            if(field){
                const maxProductQty = Math.floor(field.depth / (product.depth > 0 ? product.depth : 0));
                //const maxProductQty = Math.floor(field.depth / (product.depth && product.depth > 0 ? product.depth : 0));
                let productQty = maxProductQty;
                
                if (product.isStackable) {
    
                // const shelf = convertedCmapfieldObj.find(field => field.shelf.find(shelf => shelf.rank === product.shelfrank)).shelf.find(shelf => shelf.rank === product.shelfrank);
                const shelf = field.shelf.find(shelf => shelf.rank === product.shelfrank);
                 
                // const maxStackableCount = product.maxStackableCount === 0 ? Math.floor(shelf.height /  (product.height > 0 ? product.height : 0)) - 1 : product.maxStackableCount;
                //   if ((product.height > 0 ? product.height : 0) * (maxStackableCount + 1) <= shelf.height) {
                //     productQty *= (maxStackableCount + 1);
                const maxStackableCount = product.maxStackableCount === 0 ? Math.floor(shelf.height /  (product.height > 0 ? product.height : 0)) : product.maxStackableCount;  
                if ((product.height > 0 ? product.height : 0) * (maxStackableCount) <= shelf.height) {
                    productQty *= (maxStackableCount);
                  } else if (maxStackableCount === 0 && (product.height > 0 ? product.height : 0) <= shelf.height) {
                    productQty = 1;
                  }
                  
                }
              
                if (!acc[product.field_custom_id]) {
                  acc[product.field_custom_id] = [];
                }
                acc[product.field_custom_id].push({ productId: product.productId, name: product.name, barcode:product.barcode, width:product.width, height: product.height, imageUrl: product.imageUrl, productQty, categoryId:product.categoryId, categoryName:product.categoryName, subCategoryId: product.subCategoryId, subCategoryName: product.subCategoryName, brandId: product.brandId, brandName: product.brandName, supplierId: product.supplierId, supplierName: product.supplierName });
              
            }
            return acc;
          }, {});
          
          const prdQty = Object.entries(outputObj).map(([field_custom_id, products]) => {
            return { field_custom_id, products };
          });
          
        //   return prdQty;

        // Use a nested lookup table to compute the total quantity for each product ID within each field_custom_id group
        const productQuantitiesByField = {};
        prdQty.forEach(prd => {
        const fieldCustomId = prd.field_custom_id;
        if (!productQuantitiesByField[fieldCustomId]) {
            productQuantitiesByField[fieldCustomId] = {};
        }
        prd.products.forEach(product => {
            const productId = product.productId;
            const productQty = product.productQty;
            if (!productQuantitiesByField[fieldCustomId][productId]) {
            productQuantitiesByField[fieldCustomId][productId] = productQty;
            } else {
            productQuantitiesByField[fieldCustomId][productId] += productQty;
            }
        });
        });

        // Convert the nested lookup table into an array of objects with field_custom_id and an array of unique product objects with the sum of productQty
        const uniqueProductsByField = Object.keys(productQuantitiesByField).map(fieldCustomId => {
        const productQuantities = productQuantitiesByField[fieldCustomId];
        const uniqueProducts = Object.keys(productQuantities).map(productId => {
            return {
            productId: parseInt(productId),
            productQty: productQuantities[productId]
            };
        });
        return {
            field_custom_id: fieldCustomId,
            products: uniqueProducts
        };
        });

        //return uniqueProductsByField;

        const result = [];

        for (const group of uniqueProductsByField) {
            for (const product of group.products) {
                let existingProduct = result.find(p => p.productId === product.productId);
                if (existingProduct) {
                    existingProduct.productQty += product.productQty;
                } else {
                    result.push({
                        productId: product.productId,
                        productQty: product.productQty
                    });
                }
            }
        }

        for (const prd of result) {
            let isFound = false;
            for (const field of prdQty) {
                for (const prod of field.products) {
                    if(prd.productId === prod.productId){
                        prd.productName = prod.name;
                        prd.barcode = prod.barcode;
                        prd.width = prod.width;
                        prd.height = prod.height;
                        prd.imageUrl = prod.imageUrl;
                        prd.categoryId = prod.categoryId;
                        prd.categoryName = prod.categoryName;
                        prd.subCategoryId = prod.subCategoryId;
                        prd.subCategoryName = prod.subCategoryName;
                        prd.brandId = prod.brandId;
                        prd.brandName = prod.brandName;
                        prd.supplierId = prod.supplierId;
                        prd.supplierName = prod.supplierName;
                        isFound = true
                        break;
                    }
                }
                if(isFound){
                    break;
                }
            }
        }

        return result;

    }

    getStoresByTags =(tagStoreList) => {

        const results = [];
        
        for (const obj of tagStoreList) {
            const storesGroup = obj.storesGroupByTags.map((group) => {
            
            const conStoreIdArr = group.connectedStores.map((store) => store.id)
            const disconStoreIdArr = group.disconnectedStores.map((store) => store.id)

            const combinedArr = [...conStoreIdArr,...disconStoreIdArr];

            const storeIdArr = [...new Set(combinedArr)];

                return {
                tags: group.tags,
                storeID: storeIdArr,
                };
            });
            results.push(...storesGroup);
        }

        return results;

    }

    getDayCount = (searchFromDate, searchToDate) => {
        let from = new Date(searchFromDate);
        let to = new Date(searchToDate);

        if(from.getTime() === to.getTime()){
            from.setHours(0, 0, 0, 0);
            to.setHours(23, 59, 59, 0);
        }else{
            from.setHours(0, 0, 0, 0);
            to.setHours(0, 0, 0, 0);
        }

        // Calculate the number of milliseconds between the two dates
        const diffInMs = to.getTime() - from.getTime();

        // Convert the number of milliseconds to days
        const diffInDays = diffInMs / (1000 * 60 * 60 * 24);

        return diffInDays;
    }

    //check product x,y endpoints are allowed to drag inside shelve
    checkOnShelfBox = (xa, ya, xb, yb, shelfObj, dpwidth, dpheight) => {
        let checkSaftyMargin = 0;
        var allowovrlflw = true;
        var overflowprodwidth = (allowovrlflw?((dpwidth / 4) * 3):0); //if overflow allowed 3/4 of product allow to overlap
        //get shelve x,y end points
        var p1 = (shelfObj.x - checkSaftyMargin); 
        var q1 = (shelfObj.y - checkSaftyMargin);
        var p2 = roundOffDecimal(((shelfObj.x + shelfObj.drawWidth) + overflowprodwidth + checkSaftyMargin),10);
        var q2 = roundOffDecimal((q1 + shelfObj.drawHeight + checkSaftyMargin),10);
        
        //check is it allowed
        var boxAllow = false;
        if (p1 <= xa && xb <= p2 && q1 <= ya && yb <= q2) {
            boxAllow = true;
        }
        //check is it overlap
        var p3 = (shelfObj.x - checkSaftyMargin);
        var p4 = ((shelfObj.x + shelfObj.drawWidth) + checkSaftyMargin);
        var isOverlap = true;
        var overlapX = 0;
        if (p3 <= xa && xb <= p4 && q1 <= ya && yb <= q2) {
            isOverlap = false;
        } else if(allowovrlflw){
            overlapX = ((shelfObj.x + shelfObj.drawWidth) - xa);
        }
        
        if(isOverlap){
            //isOverlap = (allowovrlflw?shelfObj["overlappingAllow"]:false);
            if(!allowovrlflw || !shelfObj.overlappingAllow){
                boxAllow = false;
            }
        }
        return {boxAllow:boxAllow, isOverlap: isOverlap, overlapX: overlapX};
    }
    
    //click on category
    clickCategory=(cat,catobj)=>{
       //disbale click category if simulte through isle allocation
       if(this.props.simType&&this.props.simType!==SimulationTypesFE.IsleAllocation){
        var non_simu_cat_list=this.state.nonSimulatedCatList
        var orireplaceProdsList=this.state.replaceProdsList
        var non_sim_cat=non_simu_cat_list.find(g=>g.categoryId===cat.id);
        var replaceProdsList_cat=  orireplaceProdsList.find(g=>g.categoryId===cat.id);//orireplaceProdsList[0] //comment this and take 1st if mock call 
        var originalobj=this.state.simulationObj
        var cfileds=originalobj.fieldList.filter(x=>x.virtualBoxId===cat.virtualBoxId)
        var allSelectedCats = originalobj.categoryList.filter(a=> a.id.toString() === catobj.split("_")[1]);

        let notrelatedprods = []; //using to filter not related products to selected category
        var selectetProducts = [];
        for (let i = 0; i < originalobj.products.length; i++) {
            const originprod = originalobj.products[i];
            if(allSelectedCats.length > 0 && allSelectedCats.some(a => originprod.categoryRectId === a.id)){
                selectetProducts.push(originprod);
            } else{
                notrelatedprods.push(originprod);
            }
        }
        
        //get rules list
        let selectedCatRules = originalobj.subCategoryRuleWrapperDtos.filter(z => (allSelectedCats.length > 0?allSelectedCats.some(b => z.categoryId === b.id):true));
        // console.log(  originalobj.subCategoryRuleWrapperDtos,allSelectedCats)
        var selectedObj = {
            selectedCat: cat,
            categoryList:allSelectedCats,
            fieldList:cfileds,
            non_sim_prodlist:non_sim_cat?non_sim_cat.nonSimulatedProducts:[],
            replaceProdList:replaceProdsList_cat?replaceProdsList_cat.replaceGroup:[],
            products:selectetProducts,
            rulesList: selectedCatRules,
        }
        // console.log(selectedCatRules)
        this.setState({selectedCatRect:selectedObj, notReleatedProdList: notrelatedprods},()=>{
            
            this.props.setMPCategoryChanges(null)
            this.props.setMPStackableProdListArray(null)
            this.props.toggleOneCategory();
        })
       }
        
    }
    //click on category
    settodrawobjects=(cat,catobj)=>{
        this.setState({issloadsim:false})
        //disbale click category if simulte through isle allocation
        // if(this.props.simType&&this.props.simType!==SimulationTypesFE.IsleAllocation){
         var non_simu_cat_list=this.state.nonSimulatedCatList
         var orireplaceProdsList=this.state.replaceProdsList
         var sreplaceProdlist=[]
        //  var nonsimlist=[]
        
        //  non_simu_cat_list.forEach(nonesim => {
        //     nonesim.nonSimulatedProducts.forEach(prd => {
        //         prd["categoryId"]=nonesim.categoryId
        //         nonsimlist.push(prd)
        //     });
        //  });
        
        // var non_sim_cat=nonsimlist
        var non_sim_cat=non_simu_cat_list
        //  .find(g=>g.categoryId===cat.id);
        orireplaceProdsList.forEach(rep => {
            if(rep.replaceGroup.length>0){
                rep.replaceGroup.forEach(grp => {
                    sreplaceProdlist.push(grp)
                });
                
            }
            
        });
         var replaceProdsList_cat=  sreplaceProdlist
         var originalobj=this.state.simulationObj
         var cfileds=originalobj.fieldList
         var allSelectedCats = originalobj.categoryList
         let notrelatedprods = []; //using to filter not related products to selected category
         var selectetProducts = [];
         for (let i = 0; i < originalobj.products.length; i++) {
             const originprod = originalobj.products[i];
             if(allSelectedCats.length > 0 && allSelectedCats.some(a => originprod.categoryRectId === a.id)){
                 selectetProducts.push(originprod);
             } else{
                 notrelatedprods.push(originprod);
             }
         }
         
         //get rules list
         let selectedCatRules = originalobj.subCategoryRuleWrapperDtos.filter(z => (allSelectedCats.length > 0?allSelectedCats.some(b => z.categoryId === b.id):true));
        //  console.log(   originalobj.subCategoryRuleWrapperDtos)
         var selectedObj = {
            //  selectedCat: cat,
             categoryList:allSelectedCats,
             fieldList:cfileds,
             non_sim_prodlist:(non_sim_cat && non_sim_cat.length > 0?non_sim_cat:[]),
             productEditWarningsList:this.state.productEditWarningsList,
             replaceProdList:replaceProdsList_cat?replaceProdsList_cat:[],
             products:selectetProducts,
             rulesList: selectedCatRules,
         }
         this.setState({selectedCatRect:selectedObj, notReleatedProdList: notrelatedprods,},()=>{
            this.setState({issloadsim:true},()=>{
                // console.log(this.state.mapProducts);
             this.props.setMPCategoryChanges(null)
             this.props.setMPStackableProdListArray(null)
            //  this.props.toggleOneCategory();
            })
             
         })
        // }
         
     }

    handleCategoryView = (ctype, selectobj) => {
        this.setState({ 
            logViewType: ctype, 
            selectedCat: (ctype === "scat" && selectobj?selectobj:this.state.selectedCat),
            selectedScat: (ctype === "brand" && selectobj?selectobj:this.state.selectedScat),
        }, () => {
            if(ctype === "scat"){
                this.getSubCatPercentages(this.state.selectedCat);
            } else if(ctype === "brand"){
                this.getBrandPercentages(this.state.selectedScat);
            }
        });
    }
    //load all sub category percentages of selected category
    getSubCatPercentages = (selectedCategory) => {
        var cdefSaveObj = this.props.defSaveObj;
        let mpid = (cdefSaveObj?cdefSaveObj.mp_id:-1);

        let rulebaselist = []; let ruleids = [];

        //temp - 
        if(selectedCategory && selectedCategory.sub_categories.length > 0){
            for (let k = 0; k < selectedCategory.sub_categories.length; k++) {
                const citem = selectedCategory.sub_categories[k];
                if(!citem.isDelete){
                    if(citem.type === catRectEnums.rule){
                        const isalreadyadded = rulebaselist.findIndex(z => z.id === citem.id);
                        if(isalreadyadded === -1){
                            rulebaselist.push(citem);
                            ruleids.push({level: citem.rule.level, id: getNameorIdorColorofBox(citem, "num")}); 
                        }
                    }
                }
            }
        }
        
        let selcatobj = selectedCategory;
        let catrectid = (selcatobj.type === catRectEnums.default?selcatobj.category.category_id:-1);
        let iscatrulebased = (selcatobj.type === catRectEnums.rule);

        let ruleobj = null;
        if(iscatrulebased){
            ruleobj = {
                level: selcatobj.rule.level,
                id: getNameorIdorColorofBox(selcatobj, "num"),
            }
        }
        
        let svobj = { 
            mpId: mpid,
            departmentId: (this.props.simType === "AUI" && this.props.department?this.props.department.department_id:this.props.department.department_id),
            categoryId: catrectid, 
            isCatRuleBased: (ruleobj?true:false),
            catRuleObj: (ruleobj?ruleobj:{}),
            mpRuleIds: ruleids,
            fromDate: this.props.chartFilterDates?this.props.chartFilterDates.fromdate:undefined,
            endDate: this.props.chartFilterDates?this.props.chartFilterDates.todate:undefined,
        };
        
        this.setState({ loadinggif: true }, () => {
            submitSets(submitCollection.mpSubCategoryPercentage, svobj).then(res => {

                if(res && res.status && res.extra){
                    this.setState({ subCatPercentages: res.extra }, () => {
                        this.compareSubCategoryData();
                        this.getNewProdCountOfSubCatLevel(svobj);
                    });
                } else{
                    this.getNewProdCountOfSubCatLevel(svobj);
                    this.setState({ loadinggif: false });
                }
            }); 
        });
    }

    getNewProdCountOfSubCatLevel = (svobj) => {

        submitSets(submitCollection.mpSubCategoryNewProdCount, svobj, false, null, true).then(res => {

                    if(res && res.status && res.extra){
                        this.props.setNewProdCountSubCat(res.extra);
                    }else{
                        // alertService.error((res.error && res.error && res.error.errorMessage)?res.error.errorMessage:this.props.t("ERROR_OCCURRED"));
                        this.props.setNewProdCountSubCat(null);
                    }
                });

    } 

    compareSubCategoryData = () => {
        let loadedcatpers = this.state.subCatPercentages;
        let selectedcat = this.state.selectedCat;

        for (let i = 0; i < selectedcat.sub_categories.length; i++) {
            const catitem = selectedcat.sub_categories[i];

            let isfindper = loadedcatpers.find(x => ((catitem.type === catRectEnums.default && !x.isRule && getNameorIdorColorofBox(catitem, "num") === x.id) || 
            (catitem.type === catRectEnums.rule && x.isRule && x.ruleLevel === catitem.rule.level && getNameorIdorColorofBox(catitem, "num") === x.id)));

            catitem["requiredPercentage"] = (isfindper?isfindper.suggestedPercentage:0);
        }

        this.setState({ loadinggif: false, selectedCat: selectedcat }, () => {
        });
    }

    getBrandPercentages = (isruleupdate) => {
        var cdefSaveObj = this.props.defSaveObj;
        let mpid = (cdefSaveObj?cdefSaveObj.mp_id:-1);

        let selcatobj = this.state.selectedCat;
        let catrectid = (selcatobj.type === catRectEnums.default?selcatobj.category.category_id:-1);
        let iscatrulebased = (selcatobj.type === catRectEnums.rule);

        let catruleobj = null;
        if(iscatrulebased){
            catruleobj = {
                level: selcatobj.rule.level,
                id: getNameorIdorColorofBox(selcatobj, "num"),
            }
        }

        let csubobj = this.state.selectedScat;
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
            departmentId: (this.props.simType === "AUI" && this.props.department?this.props.department.department_id:this.props.department.department_id),
            categoryId: catrectid,
            isCatRuleBased: iscatrulebased,
            catRuleObj: (catruleobj?catruleobj:{}),
            subCategoryId: subcatid, 
            isSubCatRuleBased: (ruleobj?true:false),
            subCatRuleObj: (ruleobj?ruleobj:{}),
            fromDate: this.props.chartFilterDates?this.props.chartFilterDates.fromdate:undefined,
            endDate: this.props.chartFilterDates?this.props.chartFilterDates.todate:undefined,
            mpRuleIds: (csubobj.otherMpRuleIds?csubobj.otherMpRuleIds:[]),
        };

        this.setState({ loadinggif: true }, () => {
            submitSets(submitCollection.mpBrandPercentage, svobj).then(res => {

                if(res && res.status && res.extra){
                    this.setState({ brandPercentages: res.extra }, () => {
                        this.compareBrandData(isruleupdate);
                    });
                } else{
                    this.setState({ loadinggif: false });
                }
            }); 
        });
    }

    compareBrandData = () => {
        let loadedcatpers = this.state.brandPercentages;
        let selectedscat = this.state.selectedScat;

        for (let i = 0; i < selectedscat.brands.length; i++) {
            const catitem = selectedscat.brands[i];

            let isfindper = loadedcatpers.find(x => (getNameorIdorColorofBox(catitem, "num") === x.id));

            catitem["requiredPercentage"] = (isfindper?isfindper.suggestedPercentage:0);
        }

        this.setState({ loadinggif: false, selectedScat: selectedscat }, () => {
        });
    }

    // tags change
    toggleTags = (val)=>{
        
        if(val && val.value > -1){
            let tags = this.state.selectedTag;
            let selectedTag = this.props.loadedTagsList.find(x=>x.id===val.value);
            let checkalreadyadded = tags.findIndex(x => x.id === selectedTag.id);

            if(checkalreadyadded === -1){
                tags.push({id: selectedTag.id, tagName: selectedTag.tagName});
                this.setState({selectedTag:tags},()=>{
                    // console.log(this.state.selectedTag);
                })
            }
        }
    }

    toggeleSimulateCount=(e)=>{
        let count = JSON.parse(JSON.stringify(this.state.simulateCount))
        var val=(e.target.validity.valid) ? e.target.value : this.state.simulateCount
        if(e && e.target.value && e.target.validity.valid){
            if(e && preventNumberInput(e.target.value,(this.props.t('validation.NumberInputValidation')))){
                val= count
            }
        }
        this.setState({simulateCount:val})
    }

    //handle back btn 
    handlebackinsaveChnages=()=>{
        this.props.toggleOneCategory()
        if(this.props.mpChnagesofOnecategoryDetail!==null){
            this.replacecatobjectbyChnages()
        }
    }
    replacecatobjectbyChnages=()=>{
        // console.log(this.props.mpstate.mpChnagesofOnecategoryDetail);
        var chnginCatdata=this.props.mpstate.mpChnagesofOnecategoryDetail
        var catdata=JSON.parse(JSON.stringify(this.state.allCategoryData))
     
        const field = chnginCatdata.field;
        //set filed draw with & height
        field["drawHeight"] = measureConverter(field.uom,this.state.displayUOM,field.height) * this.state.displayRatio;
        field["drawWidth"] = measureConverter(field.uom,this.state.displayUOM,field.width) * this.state.displayRatio;

        //loop shelf
        let prevGap = 0;
        for (let x = 0; x < field.shelf.length; x++) {
            const shelf = field.shelf[x];
            let drawHeight = measureConverter(field.uom,this.state.displayUOM,shelf.height) * this.state.displayRatio;
            let drawGap = measureConverter(field.uom,this.state.displayUOM,shelf.gap) * this.state.displayRatio;
            //pick x, y
            shelf.x = 0;
            shelf.y = prevGap;
            shelf.drawWidth = field.drawWidth;
            shelf.drawHeight = drawHeight;
            shelf.drawGap = drawGap;
            prevGap = prevGap + (drawHeight + drawGap);
            //loop brands
            for (let b = 0; b < shelf.brand.length; b++) {
                const brand = shelf.brand[b];
                
                //loop products
                for (let p = 0; p < brand.products.length; p++) {
                    const product = brand.products[p];
                    var drawPHeight=measureConverter(product.uom,this.state.displayUOM,product.height) * this.state.displayRatio;
                    
                    //find product draw width height
                    product.drawHeight=drawPHeight
                    product.drawWidth= measureConverter(product.uom,this.state.displayUOM,product.width) * this.state.displayRatio
                    product.isComplete=false
                    product.remainQty=product.qty
                    product.addedQty=0
                }
            }
        }

        var drawingprodIncludedCat = this.makedrawingProducts(chnginCatdata);
        for (let c = 0; c < catdata.length; c++) {
            const  cat= catdata[c];
            //check only changed catgory
            if(cat.category_id===chnginCatdata.category_id){
                
                //loop shelves
                
                cat.field=drawingprodIncludedCat.field
                this.setState({ allCategoryData: catdata });
                this.props.handlehaveChnagesinCat(false)
            }
        }
    }
    //remove added sim tag
    removeSimTag = (xidx) => {
        if(this.state.isCustomPushEnabled || (!this.state.isCustomPushEnabled && this.state.selectedBranchidx < 0)){
            let selectedtags = JSON.parse(JSON.stringify(this.state.selectedTag));
            selectedtags.splice(xidx,1);

            this.setState({ selectedTag: selectedtags });
        }
    }
    //toggleBranches
    toggleBranches=(e)=>{
        if(e&&e.idx > -1){
            var fieldCount = this.state.branches[e.idx].fieldCount;
            var storetags=this.state.branches[e.idx].storeTags
            this.setState({
                selectedBranchidx:e.idx,
                simulateCount:(!this.state.isCustomPushEnabled?((fieldCount>0)?fieldCount:0):this.state.simulateCount),
                isFieldCountDisable:(fieldCount>0)?true:false,
                selectedTag: (!this.state.isCustomPushEnabled?storetags:this.state.selectedTag),
                // isShowpush:((e.target.value>-1)&&fieldCount>0)?true:false
            },()=>{
                if(fieldCount>0){
                    let selectedBranch = (this.state.selectedBranchidx > -1?this.state.branches[this.state.selectedBranchidx]:null);
                    let selectedBranchId = (selectedBranch?selectedBranch.storeId:-1);
                    this.setState({ selectedBrch: selectedBranchId });

                    if(!this.state.isCustomPushEnabled){
                        // this.loadSaleCycleProductList();
                        this.getSimulatePlanogram();
                    }
                    //uncomment to send simulation call when switch a branch
                }else{
                    this.setState({ selectedBrch: null });

                    if(!this.state.isCustomPushEnabled){
                        this.resetDrawdSimulation();
                    }
                }    
            })
        }else {
            this.setState({selectedBranchidx:-1,//e.idx
                selectedTag:[],
                simulateCount: (this.state.simulateCount <= 0?this.props.bottomFieldCount:this.state.simulateCount),
                selectedBrch:null,
                isSCycle:false,
                // isShowpush:false
            },()=>{
                if(!this.state.isCustomPushEnabled){
                    this.getSimulatePlanogram();
                }
            })
        }
    }
    
   
    
    //reset drawed simulation of dep
    resetDrawdSimulation=()=>{
        this.setState({
            issloadsim:false,//resetting sim
            mapFields:undefined,
            mapCategories:undefined,
            mapProducts:undefined,
            simulationObj:null,
            actualFieldStructures :undefined,
            isChainSaleCycle: false,
        })
    }
    toggelePushBtn=()=>{
        confirmAlert({
            title: this.props.t('CONFIRM_TO_PUSH'),
            message: this.props.t("THIS_SIMULATION_IS_GOING_TO_PUSH_TO_BRANCH")+(this.state.selectedBranchidx>-1?this.state.branches[this.state.selectedBranchidx].storeName:""),
            overlayClassName: (this.props.isRTL === "rtl" ? "alertrtl-content" : ""),
            buttons: [{
                label: this.props.t('btnnames.yes'),
                onClick: () => {
                   
                    //do this
                    if(this.state.simulationObj.simulationSnapshotId>0){
                        //direct branch call
                        this.pushMpToBranchCall()
                    }else{
                        //first save and send branch call
                        this.savesnapshotcallandSendBranchcall()
                    }
                    
                }
            }, {
                label: this.props.t('btnnames.no'),
                onClick: () => {
                    return false;
                }
            }]
        });
    }
    //savesnapshotcallandSendBranchcall
    savesnapshotcallandSendBranchcall=()=>{
        var exportsaveobj=this.state.simulationObj
        this.setState({ loadinggif: true});
        submitSets(submitCollection.saveSimulationSnapshot, exportsaveobj, false, null, true).then(res => {
            
            if(res && res.status){
                alertService.success(this.props.t('SIMULATE_SAVE_SUCCESS'));

                if(res.extra && Object.keys(res.extra).length > 0){
                    let responseSearchObj = (res.extra && res.extra.searchDto && Object.keys(res.extra.searchDto).length > 0?res.extra.searchDto:null);
                    
                    this.setState({ simulationObj:res.extra,
                        simulateSearchObj: responseSearchObj,
                        simulateCount: (responseSearchObj && responseSearchObj.fieldCount > 0?responseSearchObj.fieldCount:this.state.simulateCount),
                        getsimulatepayload:responseSearchObj,
                        // nonSimulatedCatList:res.extra.nonSimulateProducts
                    },()=>{
                        this.enableTakeBack();
                        this.backdatatoFront(res.extra,true)
                        this.pushMpToBranchCall()
                        if(responseSearchObj.storeId>0&&res.extra.fieldCount===0){
                            this.showfieldcountzeroMessage()
                        }
                        
                        this.compareImportedProds();
                    })
                }
            } else{
                // alertService.error(res.extra && res.extra !== ""?res.extra:this.props.t('erroroccurred'));
            }
        });
    }

    //push call 
    pushMpToBranchCall=()=>{
        this.setState({loadinggif:true},() => {
            let selectedBranch = (this.state.selectedBranchidx > -1?this.state.branches[this.state.selectedBranchidx]:null);
            let selectedBranchId = (selectedBranch?selectedBranch.storeId:-1);

            let searchobj = this.state.simulateSearchObj;
            searchobj["storeId"] = ((this.props.simType === "AUI" || this.props.simType === "ISleAllocation")?this.props.storeId:selectedBranchId);

            let cobj = JSON.parse(JSON.stringify(this.state.simulationObj));
            cobj["searchDto"] = searchobj;
            
            submitSets(submitCollection.pushToStore, cobj, false, null, true).then(res => {
                if (res && res.status) {
                    this.setState({loadinggif:false})
                    alertService.success(this.props.t('SUCCESSFULLY_PUSHED_MP_TO_BRANCH'))
                }else{
                    this.setState({loadinggif:false})
                    // alertService.error((res.extra&&res.extra!=="")?res.extra:this.props.t('MP_PUSH_FAIL'))
                }
            });
        });
    }
    //check rule object and return name or id
    getRuleNameOrId = (ruleobj, returntype) => {
        let returnvalue = null;

        if(ruleobj.level === catRuleEnums.sup){ //supplier
            returnvalue = (returntype === "num"?ruleobj.supplier.supplierId:returntype === "color"?ruleobj.supplier.color:ruleobj.supplier.supplierName);

        } else if(ruleobj.level === catRuleEnums.subcat){ //sub category
            returnvalue = (returntype === "num"?ruleobj.sub_category.subCategoryId:returntype === "color"?ruleobj.sub_category.color:ruleobj.sub_category.subCategoryName);

        } else if(ruleobj.level === catRuleEnums.brand){ //sub category
            returnvalue = (returntype === "num"?ruleobj.brand.brandId:returntype === "color"?ruleobj.brand.color:ruleobj.brand.brandName);
        }

        return returnvalue;
    }
    
    handleXrayDepView=(type)=>{ 
        this.setState({xrayActive:type})
    }
    //toggle between all and single category
    toggleSingleCategory = (isresimulate) => {
        //if all category data re-render change available
        if(this.state.isSaveReloadAvailable && this.state.reloadNewObj){
            let creloadobj = JSON.parse(JSON.stringify(this.state.reloadNewObj));
            
            this.setState({ 
                simulationObj: creloadobj,
             }, () => {
                // console.log(this.state.simulationObj.products)
                this.enableTakeBack();
                this.backdatatoFront(this.state.simulationObj);
            });
        }
        //temp - if resimulate true trigger get simulate data from back
        
        if(!isresimulate){
            this.props.toggleOneCategory();
        }

        // if stackble change from edit category
        if(this.props.mpstate.mpStackableProdList){
            var prodlist=this.state.mapProducts
            //mark show products stack boolean
            for (let i = 0; i < prodlist.length; i++) {
                const prod = prodlist[i];
                var have=this.props.mpstate.mpStackableProdList.find(x=>x.productId===prod.productId)
                if(have){
                    prod.isStackable=have.isStackable
                }
            }

            var CsimulationObj=this.state.simulationObj
            var Csimulprodlist=CsimulationObj.products
            //mark show products stack boolean in original obj
            for (let i = 0; i < Csimulprodlist.length; i++) {
                const prods = Csimulprodlist[i];
                var haveinori=this.props.mpstate.mpStackableProdList.find(x=>x.productId===prods.productId)
                if(haveinori){
                    prods.isStackable=haveinori.isStackable
                }
            }
            CsimulationObj["products"] = Csimulprodlist;

            this.setState({
                mapProducts: prodlist,
                simulationObj: CsimulationObj,
            },() => {
                this.enableTakeBack();
                this.props.setMPStackableProdListArray(null)
            })
        }    
    }
    //clears not valid snapshots
    clearSimSnapshots = () => {
        confirmAlert({
            title: this.props.t('CONFIRM_TO_CLEAR_SNAPSHOT'),
            message: this.props.t("CONFIRM_TO_CLEAR_SNAPSHOT_MSG"),
            overlayClassName: (this.props.isRTL === "rtl" ? "alertrtl-content" : ""),
            buttons: [{
                label: this.props.t('btnnames.yes'),
                onClick: () => {
                    //do this
                    this.continueClearSimSnapshots();
                }
            }, {
                label: this.props.t('btnnames.no'),
                onClick: () => {
                    return false;
                }
            }]
        });
    }
    //continue clear snapshots
    continueClearSimSnapshots = () => {
        let snapshotId = (this.state.simulationObj?this.state.simulationObj.simulationSnapshotId:-1);
        
        if(snapshotId > -1){
            this.toggleLoadingModal(true,() => {
                submitSets(submitCollection.clearSimulationSnapshot, ("?snapshotId="+snapshotId), false).then(res => {
                    if (res && res.status) {
                        this.toggleLoadingModal(false);
                        this.getSimulationcall();
                    } else{
                        this.toggleLoadingModal(false);
                    }
                });
            });
        }
    }
    // setFullscreenShow=(value)=>{
    //     var cloadedprodcount=this.state.loadedprodcount
    //     if(value===false){
    //         cloadedprodcount=0
    //     }
    //     this.setState({isShowFullscreen:value,loadedprodcount:cloadedprodcount},()=>{
    //         if(value===true){
    //             this.calculateFullScreenDrawingobject()
    //         }
    //     })
    // }
    // calculateFullScreenDrawingobject=()=>{
    //     var cobj = JSON.parse(JSON.stringify(this.state.allCategoryData));
    //     var divheight = (this.Efullscreendiv.current?(this.Efullscreendiv.current.offsetHeight):0);
    //     // console.log(divheight);
    //     var cfieldList = cobj.fieldList;
    //     var cmapFields=JSON.parse(JSON.stringify(this.state.mapFields))
    //     var cmapproductList=JSON.parse(JSON.stringify(this.state.mapProducts))
    //     var dimention = makeRatiofromhieghestField(cfieldList,this.state.displayUOM,divheight)
    //     this.setState({ fullScreenRatio: dimention,fullscreenheight:divheight},()=>{
    //             var convertedfield=convertfieldstoFullScreen(cmapFields,this.state.displayRatio,this.state.fullScreenRatio, this.state.displayUOM, actualFieldsCounts)
    //             var convertedprods=convertProductstoFullScreen(cmapproductList,this.state.displayRatio,this.state.fullScreenRatio)
    //             var fullscreenobj={
    //               fields:convertedfield.fields,
    //               products:convertedprods
    //             }
    //             this.setState({
    //               fullscreensvgdrawDiemention:{drawWidth:convertedfield.svgWidth,drawHeight:0},
    //               fullscreenObj:fullscreenobj
    //             })
    //     })
    // }

    // printInit = (isexcelprint, isfullscreen) => {
    //     if(isexcelprint){
    //         this.excelPrint();
    //     } else{
    //         if(isfullscreen){
    //             this.handletoImage();
    //         } else{
    //             this.print();
    //         }
    //     }
    // }

    // excelPrint = () => {
    //     this.setState({ loadinggif: true }, () => {
    //         let parentobj = (this.state.simulationObj?JSON.parse(JSON.stringify(this.state.simulationObj.fieldList)):null);
    //         let allprodlist = JSON.parse(JSON.stringify(this.state.mapProducts));
    //         let exportData = compareAndGetFieldProds(parentobj, this.state.simulationObj, allprodlist);
    //         // console.log(exportData);

    //         const fileExtension = '.xlsx';
    //         // const cdate = new Date();
    //         //export data
    //         let csvData = [];
    //         let styles = { font: { bold: true }, fill: { fgColor: { rgb: "E9E9E9" } }, alignment: { wrapText: false } };

    //         let headerstyles = { font: { bold: true, sz: "16" }, alignment: { wrapText: false, horizontal: "center" } };
    //         let smallheaderstyles = { font: { bold: true, sz: "14" }, alignment: { wrapText: false, horizontal: "center" } };

    //         let chaindetails = (this.props.signedobj && this.props.signedobj.signinDetails?this.props.signedobj.signinDetails.chain:null);
    //         let departmentname = ((this.props.defSaveObj.department && this.props.defSaveObj.department.department_name)?(this.props.defSaveObj.department.department_name+" "+this.props.t("department")):"-");
    //         let userdetails = (this.props.signedobj && this.props.signedobj.signinDetails?this.props.signedobj.signinDetails.userDto:null);
    //         let fieldCount = ((this.state.simulateSearchObj&&this.state.simulateSearchObj.fieldCount)?this.state.simulateSearchObj.fieldCount:0);


    //         csvData.push([{v: "", s: headerstyles},{v: (chaindetails?chaindetails.chainName:"-"), s: headerstyles},{v: "", s: headerstyles},{v: "", s: headerstyles}]);
    //         csvData.push([{v: "", s: smallheaderstyles},{v: departmentname, s: smallheaderstyles},{v: "", s: smallheaderstyles},{v: "", s: smallheaderstyles}]);
    //         csvData.push([{v: ""}]);

    //         let subheaderstyles = { font: { bold: true }, fill: { fgColor: { rgb: "E9E9E9" } }, alignment: { wrapText: false, horizontal: "center" } };

    //         csvData.push([{v: "", s: subheaderstyles},
    //             {v: ((this.props.t("FIELD_COUNT")+":"+fieldCount)+" | "+(moment().format("MMMM DD YYYY")+" | "+moment().format("hh:mm:ss")+" | "+(userdetails?(userdetails.fName+" "+userdetails.lName):"-"))), s: subheaderstyles},
    //         {v: "", s: subheaderstyles},{v: "", s: subheaderstyles}]);
    //         csvData.push([{v: ""}]);
            
    //         let columnwidths = { barcode: 10, name: departmentname.length, supplier: 10, facing: 10 };

    //         if (exportData && exportData.length > 0) {
    //             exportData.forEach(exproditem => {
    //                 let fieldstyles = { font: { bold: true, sz: "13" }, fill: { fgColor: { rgb: "e3d4ff" } }, alignment: { wrapText: false } };
    //                 let fieldstylealign = { font: { bold: true, sz: "13" }, fill: { fgColor: { rgb: "e3d4ff" } }, alignment: { horizontal: "right" } };

    //                 csvData.push([{v: (this.props.t("Field_unit_no")+": "+exproditem.order), s: fieldstyles}, {v: "", s: fieldstyles}, {v: "", s: fieldstyles}, {v: exproditem.fieldName, s: fieldstylealign}]);
    //                 csvData.push([{v: ""}]);

    //                 if(columnwidths.facing < exproditem.fieldName.length){
    //                     columnwidths.facing = (exproditem.fieldName.length + 5);
    //                 }
                    
    //                 for (const shelfkey in exproditem.shelfprods) {
    //                     const fieldshelf = exproditem.shelfprods[shelfkey];
    //                     const shelfobj = exproditem.shelf[(shelfkey - 1)];

    //                     let shelfstyles = { font: { bold: true, sz: "13" }, fill: { fgColor: { rgb: "f2ebff" } }, alignment: { wrapText: false } };
    //                     let shelfstylealign = { font: { bold: true, sz: "13" }, fill: { fgColor: { rgb: "f2ebff" } }, alignment: { horizontal: "right" } };

    //                     csvData.push([{v: (this.props.t("Shelf_unit_no")+" "+shelfobj.rank), s: shelfstyles}, {v: "", s: shelfstyles}, {v: "", s: shelfstyles}, {v: exproditem.fieldName, s: shelfstylealign},]);
    //                     csvData.push([{v: this.props.t("barcode"), s: styles}, {v: this.props.t("PRODUCT_NAME"), s: styles}, {v: this.props.t("supname"),s:styles}, {v: this.props.t("FACING"), s: styles}]);

    //                     fieldshelf.forEach(shelfprod => {
    //                         let shelfprodsup = (shelfprod.brand && shelfprod.brand.brand && shelfprod.brand.brand.supplier?shelfprod.brand.brand.supplier.supplierName:"-");
    //                         csvData.push([shelfprod.barcode, shelfprod.name, shelfprodsup, shelfprod.qty]);
                        
    //                         if(columnwidths.barcode < shelfprod.barcode.length){
    //                             columnwidths.barcode = (shelfprod.barcode.length + 5);
    //                         }

    //                         if(columnwidths.name < shelfprod.name.length){
    //                             columnwidths.name = (shelfprod.name.length + 5);
    //                         }

    //                         if(columnwidths.supplier < shelfprodsup.length){
    //                             columnwidths.supplier = (shelfprodsup.length + 5);
    //                         }
    //                     });
    //                     csvData.push([{v: ""}]);
    //                 }
    //             });
    //         }

    //         const wb = XLSX.utils.book_new();
    //         const ws = XLSX.utils.aoa_to_sheet(csvData);
    //         //set column widths
    //         let wscols = [ {wch: columnwidths.barcode}, {wch: columnwidths.name}, {wch: columnwidths.supplier}, {wch: columnwidths.facing}];
    //         ws['!cols'] = wscols;

    //         XLSX.utils.book_append_sheet(wb, ws, "readme");

    //         let depname = (this.props.simType === "AUI" && this.props.department?this.props.department.name:this.props.department.department_name);
    //         // console.log(this.props.defSaveObj);
    //         let userlogged = (this.props.signedobj && this.props.signedobj.signinDetails&&this.props.signedobj.signinDetails.userDto?(this.props.signedobj.signinDetails.userDto.fName+"-"+this.props.signedobj.signinDetails.userDto.lName):"");
    //         let fieldcountz = (this.state.simulateSearchObj&&this.state.simulateSearchObj.fieldCount)?this.state.simulateSearchObj.fieldCount:0
    //         let filename = (depname+"_"+userlogged+"_"+fieldcountz+"Fields");
            
    //         // STEP 4: Write Excel file to browser
    //         XLSX.writeFile(wb, replaceSpecialChars(replaceSpecialChars(String(filename)))+fileExtension);   
    //         this.setState({ loadinggif: false });
    //     });
    // }

    // print=()=>{
    //     this.setState({printloading:true},()=>{
    //         this.setFullscreenShow(true)
    //         setTimeout(() => {
    //             this.setState({loadinggif:true})
    //         }, 50);
    //         if(this.state.mapProducts.length!==this.state.loadedprodcount){
    //             window.setTimeout(this.print, 100);
    //         }else{
    //             this.handletoImage()
    //         }
    //     })
    // }
    // handletoImage=()=>{
    //     this.setState({
    //         loadinggif: true
    //     }, () => {
    //         this.StartPrint();
    //     });
    // }
    // StartPrint = () => {
    //     let chaindetails = (this.props.signedobj && this.props.signedobj.signinDetails?this.props.signedobj.signinDetails.chain:null);
    //     let userdetails = (this.props.signedobj && this.props.signedobj.signinDetails?this.props.signedobj.signinDetails.userDto:null);

    //     // let starttime = new Date().getTime();
    //     toImg('.sim-preview-all-full', 'name', {
    //         quality: 0.01,
    //         download: false,
    //       }).then(fileData => {
    //         //do something with the data
    //         var calratio = CalculateRatio(this.state.fullscreenheight,this.state.printHeight)

    //         this.setState({ 
    //             PrintFullImg: fileData, 
    //             printRatio: calratio, 
    //             printWidth: (this.state.fullscreensvgdrawDiemention.drawWidth * calratio),
    //         },()=>{
    //             var canvas = document.getElementById("simfull-canvas");
    //             var ctx = canvas.getContext("2d");
    //             var image = new Image();

    //             let printallprods = compareAndGetFieldProds((this.state.fullscreenObj?this.state.fullscreenObj.fields:null), this.state.simulationObj,this.state.mapProducts);
    //             canvas.width=this.state.printWidth;
    //             canvas.height=this.state.printHeight;
                
    //             image.src = this.state.PrintFullImg;
    //             image.width = this.state.printWidth;
    //             image.height = this.state.printHeight;
    //             image.onload = () =>{
    //                 ctx.drawImage(image, 0, 0, this.state.printWidth, this.state.printHeight);

    //                 let fieldcropx = 0;
    //                 let newprintfields = [];
    //                 for (let k = 0; k < printallprods.length; k++) {
    //                     const printfieldobj = printallprods[k];
    //                     printfieldobj["imagearray"] = [];

    //                     let fieldtotalwidth = (printfieldobj.totalDrawWidth * calratio);
    //                     let fieldendx = (fieldcropx + fieldtotalwidth);

    //                     let printpagecount = Math.ceil(fieldtotalwidth / this.state.printonepagewidthinPX)

    //                     for (let z = 0; z < printpagecount; z++) {
    //                         let cropwidth = (
    //                         (((fieldcropx + this.state.printonepagewidthinPX) > fieldendx) || ((z + 1) === printpagecount && (fieldcropx + this.state.printonepagewidthinPX) < fieldendx))?(fieldendx - fieldcropx)
    //                         :this.state.printonepagewidthinPX);
    //                         let cropwidthper = convertWidthPercent(cropwidth, this.state.printonepagewidthinPX);

    //                         //check last one is less than 50% of print page size
    //                         let islastpageadded = false;
    //                         if((z + 2) === printpagecount){
    //                             let lastpagecropx = (fieldcropx + cropwidth);
    //                             let lastcropwidth = ((((lastpagecropx + this.state.printonepagewidthinPX) > fieldendx) || ((z + 1) === printpagecount && (lastpagecropx + this.state.printonepagewidthinPX) < fieldendx))?(fieldendx - lastpagecropx):this.state.printonepagewidthinPX);
    //                             let lastpageper = convertWidthPercent(lastcropwidth, this.state.printonepagewidthinPX);

    //                             if(lastpageper < 50){
    //                                 cropwidth = (cropwidth + lastcropwidth);
    //                                 islastpageadded = true;
    //                             }
    //                         }

    //                         if(cropwidthper > 1){
    //                             let outbase64 = this.createcanvasiandexportbase64(ctx, fieldcropx, cropwidth);
    //                             printfieldobj.imagearray.push({ 
    //                                 width: convertWidthPercent(cropwidth, this.state.printonepagewidthinPX), 
    //                                 imgsrc: outbase64 ,
    //                                 fieldName:printfieldobj.fieldName 
    //                             });
    //                         }

    //                         fieldcropx = (fieldcropx + cropwidth);

    //                         if(islastpageadded){
    //                             break;
    //                         }
    //                     }

    //                     if(printfieldobj.imagearray.length > 0){
    //                         newprintfields.push(printfieldobj);
    //                     }
    //                 }

    //                 printallprods = newprintfields;
                    
    //                 let generatedDate = moment().format("MMMM DD YYYY");
    //                 let generatedTime = moment().format("hh:mm:ss");

    //                 let callAddFont = function () {
    //                     this.addFileToVFS('Assistant-Medium-normal.ttf', assistant_medium);
    //                     this.addFont('Assistant-Medium-normal.ttf', 'Assistant-Medium', 'normal');
    //                 };

    //                 jsPDF.API.events.push(['addFonts', callAddFont])
                    
    //                 const pdf = new jsPDF({
    //                     orientation: "landscape",
    //                     unit: "px",
    //                     format:'a4',
    //                     // compress:true
    //                   })
    //                 let width = pdf.internal.pageSize.getWidth();
    //                 let height = pdf.internal.pageSize.getHeight();


    //                 pdf.setFont("Assistant-Medium", "normal");

    //                 let isrtlview = (this.props.isRTL === "rtl");

    //                 document.getElementById("simallprint-wrapper").style.display = "block";
    //                 htmlToImage.toPng(document.getElementById("simallprint-wrapper"), {
    //                     width: 1191, 
    //                     height: 842,
    //                     quality: 1,
    //                     cacheBust: true,
    //                 })
    //                 .then((coverimage) => {
    //                     document.getElementById("simallprint-wrapper").style.display = "none";

    //                     pdf.addImage(coverimage, 'PNG', 0, 0,width, height, "alias1", "FAST");
    //                     pdf.addPage();

    //                     //if rtl then set rtl
    //                     const optionsL = {
    //                         isInputVisual: false,
    //                         isOutputVisual: true,
    //                         isInputRtl: false,
    //                         isOutputRtl: false,
    //                         align: (isrtlview?"left":"right")
    //                       };
    //                       const optionsR = {
    //                         isInputVisual: false,
    //                         isOutputVisual: true,
    //                         isInputRtl: false,
    //                         isOutputRtl: false,
    //                         align: (isrtlview?"right":"left")
    //                       };


    //                     // Set some general padding to the document
    //                     const pageMargin = 45;
    //                     // Reduce width to get total table width
    //                     const reducetablewidth = (width - 90);

    //                     let pageno = 1; 
    //                     let tabledrawy = pageMargin;

    //                     let lastaddedpage = null;
    //                     // let ischecklast = false;
                        
    //                     for (let index = 0; index < printallprods.length; index++) {
    //                         let printOneField = printallprods[index];

    //                         pageno = (pageno + 1); 

    //                         for (let l = 0; l < printOneField.imagearray.length; l++) {
    //                             const imgData = printOneField.imagearray[l];

    //                             pdf.setTextColor(0, 0, 0);
    //                             //page no
    //                             pdf.setFontSize(11);
                               
    //                             pdf.text((this.props.t("PAGE")+" "+pageno), (isrtlview?(width - 40):40), 30, optionsR);
    //                             //shelf and field details
    //                             pdf.setFontSize(12);
    //                             pdf.text((this.props.t("Field_unit_no")+" "+(index + 1)), (isrtlview?(width - 40):40), 55, optionsR);
    //                             pdf.text(imgData.fieldName?imgData.fieldName:"-", (isrtlview?40:(width - 40)), 55, optionsL);
    //                             //line
    //                             pdf.setLineHeightFactor(5);
    //                             pdf.line(40, 60, (width - 40), 60,);
    //                             //field border and image
    //                             pdf.setDrawColor(0, 0, 0);
    //                             pdf.setFillColor(255, 255, 255);
    //                             pdf.rect(40, 70,(width - 80), (height - 110), 'FD');

    //                             let imageviewwidth = ((imgData.width <= 100)?(convertWidthPercent(imgData.width, width, true) - (imgData.width >= 80?80:0)):(width - 80));
    //                             pdf.addImage(imgData.imgsrc, 'PNG', 40, 70,imageviewwidth, (height - 110), ("alias"+(index+""+l)),"FAST");
    //                             //page footer details
    //                             let bottombranchtxt = (isrtlview?((this.state.simulateSearchObj && this.state.simulateSearchObj.storeName?(this.state.simulateSearchObj.storeName+" <"):"")+" "+(chaindetails?chaindetails.chainName:"-"))
    //                                 :((chaindetails?chaindetails.chainName:"-")+" "+(this.state.simulateSearchObj && this.state.simulateSearchObj.storeName?("> "+this.state.simulateSearchObj.storeName):"")));
    //                             pdf.text(bottombranchtxt, (isrtlview?(width - 40):40), (height - 20), optionsR);
                                
    //                             let bottomusertxt = (isrtlview?((userdetails?(userdetails.lName+" "+userdetails.fName):"-")+" | "+generatedTime+" | "+generatedDate)
    //                                 :(generatedDate+" | "+generatedTime+" | "+(userdetails?(userdetails.fName+" "+userdetails.lName):"-")))
    //                             pdf.text(bottomusertxt, (isrtlview?40:(width - 40)), (height - 20), optionsL);

    //                             if((l + 1) < printOneField.imagearray.length){
    //                                 pdf.addPage();
    //                                 pageno = (pageno + 1); 
    //                             }
    //                         }
                            
    //                         //auto table
    //                         if(printOneField && printOneField.shelfprods && Object.keys(printOneField.shelfprods).length > 0){
    //                             pdf.addPage();
    //                             pageno = (pageno + 1);
                                
    //                             // let shelfidx = 0;
    //                             for (const shelfkey in printOneField.shelfprods) {
    //                                 const fieldshelf = printOneField.shelfprods[shelfkey];

    //                                 let prodarrobj = [];
    //                                 for (let j = 0; j < fieldshelf.length; j++) {
    //                                     const shelfsingleobj = fieldshelf[j];
                                        
    //                                     let prodname = shelfsingleobj.name.toString();
    //                                     let prodsupname = (shelfsingleobj.brand && shelfsingleobj.brand.brand && shelfsingleobj.brand.brand.supplier?shelfsingleobj.brand.brand.supplier.supplierName:"-").toString();
                                        
    //                                     let newprodobj = isrtlview?[shelfsingleobj.qty, prodsupname, prodname, shelfsingleobj.barcode]:[shelfsingleobj.barcode, prodname, prodsupname, shelfsingleobj.qty];
    //                                     prodarrobj.push(newprodobj);
    //                                 }
    //                                 // Let's set up a standard padding that we can add to known coordinates
    //                                 const padding = 15;
    //                                 const xPositions = [];

    //                                 tabledrawy = (tabledrawy === 45 ?(tabledrawy + padding) : tabledrawy);

    //                                 let bottompagemargin = pageMargin * 2;
    //                                 if ((tabledrawy + bottompagemargin) > height) {
    //                                     pdf.addPage();
    //                                     tabledrawy = (pageMargin + padding);

    //                                     let newpageno = (pageno + 1);
    //                                     pageno = newpageno;
    //                                 }

    //                                 //headers
    //                                 pdf.setTextColor("#000000");
    //                                 pdf.setFontSize(12);
                                    
    //                                 pdf.text((this.props.t("Shelf_unit_no")+": "+shelfkey), (isrtlview?(width - pageMargin):pageMargin), tabledrawy,optionsR);
    //                                 pdf.text(((printOneField && printOneField.fieldName)?printOneField.fieldName:"-"), (isrtlview?pageMargin:(width - pageMargin)), tabledrawy, optionsL);
                                    
    //                                 //line
    //                                 pdf.setLineHeightFactor(5);
    //                                 pdf.line(pageMargin, (tabledrawy + 5), (width - pageMargin), (tabledrawy + 5));

    //                                 tabledrawy = (tabledrawy + 30);

    //                                 if (!lastaddedpage || lastaddedpage !== pageno) {
    //                                     lastaddedpage = pageno;

    //                                     // //page no
    //                                     pdf.setFontSize(11);
    //                                     pdf.text(((this.props.t("PAGE")+" "+pageno)), (isrtlview?(width - pageMargin):pageMargin), 30, optionsR);
                                        
    //                                     // //shelf and field details
    //                                     pdf.setFontSize(12);
    //                                     //page footer details
    //                                     let bottombranchtxt = (isrtlview?((this.state.simulateSearchObj && this.state.simulateSearchObj.storeName?(this.state.simulateSearchObj.storeName+" <"):"")+" "+(chaindetails?chaindetails.chainName:"-"))
    //                                         :((chaindetails?chaindetails.chainName:"-")+" "+(this.state.simulateSearchObj && this.state.simulateSearchObj.storeName?("> "+this.state.simulateSearchObj.storeName):"")));
    //                                     pdf.text(bottombranchtxt, (isrtlview?(width - pageMargin):pageMargin), (height - 20), optionsR);
                                    
    //                                     let bottomusertxt = (isrtlview?((userdetails?(userdetails.lName+" "+userdetails.fName):"-")+" | "+generatedTime+" | "+generatedDate)
    //                                         :(generatedDate+" | "+generatedTime+" | "+(userdetails?(userdetails.fName+" "+userdetails.lName):"-")))
    //                                     pdf.text(bottomusertxt, (isrtlview?pageMargin:(width - pageMargin)), (height - 20), optionsL);
    //                                 }

    //                                 //table
    //                                 let headers = [
    //                                     {key: "barcode", label: this.props.t("barcode"), width: 15},
    //                                     {key: "name", label: this.props.t("PRODUCT_NAME"), width: 45},
    //                                     {key: "distributor", label: this.props.t("supname"), width: 30},
    //                                     {key: "qty", label: this.props.t("FACING"), width: 10}
    //                                 ];

    //                                 let headerxpos = (isrtlview?(reducetablewidth + pageMargin):pageMargin); //default start
    //                                 let headernewy = tabledrawy;

    //                                 headers.forEach((heading, index) => {

    //                                     pdf.setTextColor("#000000");
    //                                     pdf.setFontSize(10);
    //                                     pdf.text(heading.label, (index === 0 ?headerxpos:(isrtlview?(headerxpos - padding):(headerxpos + padding))), headernewy, optionsR);

    //                                     xPositions.push(index === 0?(isrtlview?(headerxpos - 3):(headerxpos + 3)):(isrtlview?(headerxpos - padding):(headerxpos + padding)));

    //                                     //if last one reset to 45
    //                                     const xPositionForCurrentHeader = (isrtlview?(headerxpos - ((reducetablewidth / 100) * heading.width)):(headerxpos + ((reducetablewidth / 100) * heading.width)));
    //                                     let defxpos = (isrtlview?reducetablewidth:pageMargin);
    //                                     headerxpos = ((index + 1) === headers.length?defxpos:xPositionForCurrentHeader);
    //                                 });
                                    
    //                                 tabledrawy = (tabledrawy + 20);

    //                                 // ROWS
    //                                 let tablerowheight = 20;
    //                                 let tablecellpadding = 15;

    //                                 let newheadery = tabledrawy;
    //                                 let newpageno = pageno;
    //                                 let curlastaddedpage = lastaddedpage;

    //                                 fieldshelf.forEach((row, rIndex) => {
    //                                     const rowHeights = [];
    //                                     const rowRectHeights = [];
    //                                     newheadery = (newheadery === 45 ? (newheadery + padding) : newheadery);
                                        
    //                                     // COLUMNS
    //                                     let newrowcells = [];
    //                                     headers.forEach((column, cIndex) => {
    //                                         const xPositionForCurrentHeader = (((reducetablewidth / 100) * column.width) - tablecellpadding);

    //                                         const longText = ((column.key !== "barcode" && column.key !== "qty")?pdf.splitTextToSize(String(row[column.key]), xPositionForCurrentHeader):[String(row[column.key])]);
    //                                         // console.log(longText);

    //                                         const rowHeight = longText.length * tablerowheight;
    //                                         rowHeights.push(rowHeight);

    //                                         const rowRectHeight = (longText.length > 1 ? (longText.length * 16) : tablerowheight);
    //                                         rowRectHeights.push(rowRectHeight);

    //                                         let cellobj = { text: longText, xpos: xPositions[cIndex], ypos: newheadery};
    //                                         newrowcells.push(cellobj);
    //                                     });

    //                                     let nextrectrowheight = (Math.max(...rowRectHeights) > tablerowheight ? Math.max(...rowRectHeights) : tablerowheight);

    //                                     pdf.setFillColor(0, 0, 0, 0.05);
    //                                     pdf.rect(pageMargin, newheadery - 11, reducetablewidth, nextrectrowheight - 3, "F");

    //                                     let nextaddy = (Math.max(...rowHeights) > tablerowheight? Math.max(...rowHeights): tablerowheight);

    //                                     newrowcells.forEach((rowcell, rIndex) => {
    //                                         pdf.setTextColor("#555555");
    //                                         pdf.setFontSize(10);

    //                                         pdf.setLineHeightFactor(1.5);
    //                                         pdf.text(rowcell.text, rowcell.xpos, rowcell.ypos, optionsR);
    //                                     });

    //                                     let newcelly = (newheadery + nextaddy);
    //                                     newheadery = newcelly;

    //                                     let bottompagemargin = pageMargin * 2;
    //                                     if ((newcelly + bottompagemargin) > height && (rIndex + 1) < fieldshelf.length) {
    //                                         pdf.addPage();

    //                                         newheadery = (pageMargin + padding);
    //                                         newpageno = (newpageno + 1);

    //                                         //if last page add headers
    //                                             if (!curlastaddedpage || curlastaddedpage !== newpageno) {
    //                                                 curlastaddedpage = newpageno;

    //                                                 // //page no
    //                                                 pdf.setFontSize(11);
    //                                                 pdf.setTextColor("#000000");
    //                                                 pdf.text(((this.props.t("PAGE")+" "+curlastaddedpage)), (isrtlview?(width - pageMargin):pageMargin), 30, optionsR);
                                                    
    //                                                 // //shelf and field details
    //                                                 pdf.setFontSize(12);
    //                                                 //page footer details
    //                                                 let bottombranchtxt = (isrtlview?((this.state.simulateSearchObj && this.state.simulateSearchObj.storeName?(this.state.simulateSearchObj.storeName+" <"):"")+" "+(chaindetails?chaindetails.chainName:"-"))
    //                                                     :((chaindetails?chaindetails.chainName:"-")+" "+(this.state.simulateSearchObj && this.state.simulateSearchObj.storeName?("> "+this.state.simulateSearchObj.storeName):"")));
    //                                                 pdf.text(bottombranchtxt, (isrtlview?(width - pageMargin):pageMargin), (height - 20), optionsR);
                                                
    //                                                 let bottomusertxt = (isrtlview?((userdetails?(userdetails.lName+" "+userdetails.fName):"-")+" | "+generatedTime+" | "+generatedDate)
    //                                                     :(generatedDate+" | "+generatedTime+" | "+(userdetails?(userdetails.fName+" "+userdetails.lName):"-")))
    //                                                 pdf.text(bottomusertxt, (isrtlview?pageMargin:(width - pageMargin)), (height - 20), optionsL);
    //                                             }
    //                                         // }
    //                                     }
    //                                 });

    //                                 lastaddedpage = curlastaddedpage;

    //                                 pageno = newpageno;
    //                                 tabledrawy = (newheadery + 20);

    //                             }
    //                         }
                            
    //                         if((index + 1) < printallprods.length){
    //                             pdf.addPage();
    //                             tabledrawy = pageMargin;
    //                         }
    //                     }
    //                     //save file name
                       
    //                     var depname = (this.props.simType === "AUI" && this.props.department?this.props.department.name:this.props.department.department_name);
    //                     var userlogged = (this.props.signedobj && this.props.signedobj.signinDetails&&this.props.signedobj.signinDetails.userDto?(this.props.signedobj.signinDetails.userDto.fName+"-"+this.props.signedobj.signinDetails.userDto.lName):"");
    //                     var fieldcountz=(this.state.simulateSearchObj&&this.state.simulateSearchObj.fieldCount)?this.state.simulateSearchObj.fieldCount:0
    //                     var filename=(depname+"_"+userlogged+"_"+fieldcountz+"Fields")
                        
    //                     // window.open(pdf.output('bloburl', { filename: 'new-file.pdf' }), '_blank');
    //                     pdf.save(replaceSpecialChars(String(filename)));
    //                     this.setState({loadinggif:false,loadedprodcount:0,printloading:false},()=>{
    //                         this.setFullscreenShow(false)
    //                     })
    //                 });
    //             };    
    //         })
           
    //       });
    // }
    
    // createcanvasiandexportbase64=(ctx, x, desiredWidth)=>{
    //     var y = 0;
    //     var desiredHeight = this.state.printHeight;
    //     var imageContentRaw = ctx.getImageData(x,y,desiredWidth,desiredHeight);
    //     // create new canvas
    //     var canvas2 = document.createElement('canvas');
    //     // with the correct size
    //     canvas2.width = desiredWidth;
    //     canvas2.height = desiredHeight;
    //     // put there raw image data
    //     // expected to be faster as tere are no scaling, etc
    //     canvas2.getContext('2d').putImageData(imageContentRaw, 0, 0);
    //     // get image data (encoded as bas64)
    //     var result = canvas2.toDataURL("image/png", 0.8)//type,size
        
    //     return result
    // }
    toggleopenfirsttime=(val)=>{
        this.setState({isopenfirsttime:val})
    }
    // handleloadedprodcount=()=>{
    //     this.setState({loadedprodcount:(this.state.loadedprodcount+1)})
    // }
    handlePrioratizeUserPercentage=()=>{
        this.setState({isPrioratizeUserPercentage:!this.state.isPrioratizeUserPercentage})
    }


    handleMouseEnter = () => {
      this.setState({
        isOpen:true
      })
    };
  
     handleMouseLeave = () => {
        this.setState({
            isOpen:false
          })
    };
    handleGetAUIConversionAvailability=()=>{
        let defSaveObj = this.props.defSaveObj;
        var sobj ={
            "mpId" :defSaveObj.mp_id
        }
        submitSets(submitCollection.getAUIConversionAvailability, sobj).then(res => {
            if(res && res.status && res.extra){
                this.setState({
                    ConversionAvailabilityDetails: res.extra,
                });
            }
        });
    }
     //create new aui
     handleCreateNewAUI=()=>{
        if(this.props.mpstate.mpstackHistory&&this.props.mpstate.mpstackHistory.past&&this.props.mpstate.mpstackHistory.past.length>0 ){
            confirmAlert({
                title: this.props.t('There_are_unsaved_changes'),
                message: this.props.t("You_have_unsaved_changes_please_save_before_continue"),
                overlayClassName: (this.props.isRTL === "rtl" ? "alertrtl-content" : ""),
                buttons: [{
                    label: this.props.t('OKAY'),
                    onClick: () => {
                        return false;
                    }
                }]
            });
        }else{
            var ccount= this.state.ConversionAvailabilityDetails.currentConvertedCount
            if(ccount>0){
                //not first time
                this.haveplanoversionCreateNewAUI()
            }else{
                //first time
                confirmAlert({
                    title: this.props.t('you_sure'),
                    message: this.props.t("this_will_create_new_aui_version"),
                    overlayClassName: (this.props.isRTL === "rtl" ? "alertrtl-content" : ""),
                    buttons: [{
                        label: this.props.t('btnnames.yes'),
                        onClick: () => {
                            this.sendCreateNewAUICall()
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
    converttocomman=(array)=>{
        var obj=[]
        array.forEach(element => {
            var ob={
                id:element.id,
                name:element.tagName
            }
            obj.push(ob)
        });
        return obj
    }
    sendCreateNewAUICall=()=>{
        let allSimulationObj = JSON.parse(JSON.stringify(this.state.simulationObj));
        
        let defSaveObj = this.props.defSaveObj;
        var exportsaveobj={
            mpId : defSaveObj.mp_id,
            simulationSnapshotId : (allSimulationObj.simulationSnapshotId?allSimulationObj.simulationSnapshotId:-1)
        }
        // var cdefSaveObj=structuredClone(defSaveObj)
        // cdefSaveObj.isCustomPushEnabled=this.state.isCustomPushEnabled;
        // cdefSaveObj.simulateCount=this.state.simulateCount;
        // cdefSaveObj.selectedBrch=this.state.selectedBrch;
        // cdefSaveObj.selectedTags=this.converttocomman(this.state.selectedTag);
        // cdefSaveObj.isPrioratizeUserPercentage=this.state.isPrioratizeUserPercentage
        var cdefSaveObj={}
        var serchdto=structuredClone(this.state.simulationObj.searchDto)
        cdefSaveObj.isCustomPushEnabled=serchdto.pushMode===simulationPushMode.custom?true:false
        cdefSaveObj.simulateCount=serchdto.fieldCount;
        cdefSaveObj.selectedBrch=serchdto.storeId;
        cdefSaveObj.selectedTags=this.converttocomman(serchdto.selectedTagsId);
        cdefSaveObj.isPrioratizeUserPercentage=serchdto.isPrioratizeUserPercentage

        this.setState({ loadinggif: true});
        submitSets(submitCollection.convertToAUIVersion, exportsaveobj, false).then(res => {
            if(res && res.status){
                this.props.setAuiConvertedetails(cdefSaveObj)
                this.setState({ loadinggif: false,APverAlert:false},()=>{
                    this.props.toggleSimulateAllModal(true, true);
                    if(this.props.isDirectSimulation){
                        this.props.handleAuiRedirect(defSaveObj);
                       
                    } else{
                        // this.props.handleAuiOpen(true);
                    }
                });
            }else{
                this.setState({ loadinggif: false});
            }
        })
    }
    haveplanoversionCreateNewAUI=()=>{
        this.openHaveVerAlertBox(true)
    }
    openHaveVerAlertBox=(val)=>{
        this.setState({APverAlert:val})
    }
    closeCNAUIclose=()=>{
        this.setState({APverAlert:false})
    }
    //toggle loading modal
    toggleLoadingModal = (isshow, _callback) => {
        /* if(this.props.toggleLoadingModal){
            this.props.toggleLoadingModal(isshow, () => {
                if(_callback){
                    _callback();
                }
            });
        } else{ */
            this.setState({ loadinggif: isshow }, () => {
                if(_callback){
                    _callback();
                }
            });
        /* } */
    }
    //check availability for takeback
    checkTackbackAvailable = () => {
        confirmAlert({
            title: this.props.t('CONT_TAKE_BACK'),
            message: this.props.t("ARE_YOU_SURE_TO_CONTINUE_THIS_TASK"),
            overlayClassName: (this.props.isRTL === "rtl" ? "alertrtl-content" : ""),
            buttons: [{
                label: this.props.t('btnnames.yes'),
                onClick: () => {
                    let simulationObj = this.state.simulationObj;

                    let sobj = { simulationSnapshotId: simulationObj.simulationSnapshotId };

                    this.props.toggleLoadingModal(true, () => {
                        submitSets(submitCollection.auiTakeBackAvailability, sobj, false, null, true).then(res => {
                            if(res && res.status && res.extra){
                                if(res.extra.isParentBlocked === false){
                                    this.continueTakeBack(sobj);
                                } else{
                                    this.setState({
                                        isShowTakeBackError: true,
                                        takeBackErrorObj: res.extra.blockedSimulationSearchDto
                                    });
                                    this.props.toggleLoadingModal(false);
                                }
                            } else if(res.status === false){
                                // alertService.error(res.extra);
                                this.props.toggleLoadingModal(false);
                            } else{
                                this.props.toggleLoadingModal(false);
                            }
                        });    
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
    //continue takeback 
    continueTakeBack = (simobj) => {

        let storeobj;
        let taggroup;

        if(this.props.storeId >-1){
            let tagStoreObj =this.props.tagStoreGroup.map((item)=>item.storesGroupByTags)

            let flatObj = tagStoreObj.flatMap((subArray) => subArray)

            taggroup = flatObj.find((group) =>
                group.connectedStores.some((store) => store.id === this.props.storeId) ||
                group.disconnectedStores.some((store) => store.id === this.props.storeId)
                );

            let allStores = taggroup.connectedStores.concat(taggroup.disconnectedStores);
            
            storeobj = allStores.find((obj) => obj.id === this.props.storeId);

            let allStoreIds = allStores.map(str => str.id);

            let storeIds = allStoreIds.filter(itm => itm !== this.props.storeId);

            simobj["storeIds"] = storeIds;
        }

        this.props.toggleLoadingModal(true, () => {
            submitSets(submitCollection.auiTakeBack, simobj, false, null, true).then(res => {
                if(res && res.status){
                    alertService.success(this.props.t("TACKBACK_SUCCESS"));
                    // this.getSimulationcall();
                    if(this.props.storeId >-1){
                        this.props.reloadSimAndStore(storeobj, taggroup);
                        this.props.toggleLoadingModal(false);
                    }else{
                        this.props.reloadSimAndTag(this.props.selectedTagGroup);
                    }
                } else{
                    // alertService.error(res.extra?res.extra:this.props.t("erroroccurred"));
                    this.props.toggleLoadingModal(false);
                }
            });
        })
         
    }

    updateConDisJob = (type) => {

        let lastSimOption = this.props.selectedTagGroup.simOption;

        let taggroup;
            
        let storeobj;
  
        if(this.props.storeId >-1){

            let tagStoreObj =this.props.tagStoreGroup.map((item)=>item.storesGroupByTags)
    
            let flatObj = tagStoreObj.flatMap((subArray) => subArray)
    
            taggroup = flatObj.find((group) =>
                group.connectedStores.some((store) => store.id === this.props.storeId) ||
                group.disconnectedStores.some((store) => store.id === this.props.storeId)
                );
            
            storeobj = taggroup.connectedStores.concat(taggroup.disconnectedStores).find((obj) => obj.id === this.props.storeId)
        
            lastSimOption = storeobj.simOption;
        }
        
        confirmAlert({
            title: this.props.t('DISCONNECT'),
            message: (this.props.t('ARE_YOU_SURE_YOU_WANT_TO_DISCONNECT')),
            overlayClassName: (this.props.isRTL === "rtl" ? "alertrtl-content" : ""),
            buttons: [{
                label: this.props.t('btnnames.yes'),
                onClick: () => {   

                    let tagList = this.props.selectedTagList;

                    let refinedArray = [];

                    if(tagList && tagList.length > 0){
                        for(let i=0; i<tagList.length; i++){
                            let obj = {
                                id:tagList[i].id,
                                tagName:tagList[i].name
                            }

                            refinedArray.push(obj);
                        }
                    }
                    
                    let sobj ={
                        mpId: this.props.defSaveObj ? this.props.defSaveObj.mp_id : -1,
                        storeId: this.props.storeId ? this.props.storeId : -1 ,
                        snapshotId: this.state.simulationObj ? this.state.simulationObj.simulationSnapshotId : -1 ,
                        simOption:type,
                        fieldCount: this.state.simulationObj.searchDto.fieldCount ? this.state.simulationObj.searchDto.fieldCount : this.props.tagStoreGroup[0].fieldCount,
                        tags: refinedArray,
                        lastSimOption: lastSimOption
                    }
            
                    this.props.toggleLoadingModal(true, () => {
                        submitSets(submitCollection.updateConDisJob, sobj, false, null, true).then(res => {
                            if(res && res.status){
                                alertService.success(this.props.t("DISCONNECTED_SUCCESS"));
                                if(this.props.storeId >-1){
                                    this.props.reloadSimAndStore(storeobj, taggroup);
                                    this.props.toggleLoadingModal(false);
                                }else{
                                    this.props.reloadSimAndTag(this.props.selectedTagGroup);
                                }
                            } else{
                                // alertService.error(res.extra?res.extra:this.props.t("erroroccurred"));
                                this.props.toggleLoadingModal(false);
                            }
                        });
                    })   
                }
            }, {
                label: this.props.t('btnnames.no'),
                onClick: () => {   
                    return false
                }
            }]
        });

    }

    //toggle take back snapshot warning modal
    toggleTakebackWarnModal = (isshow, iscontinue) => {
        this.setState({ isShowTakeBackError: isshow }, () => {
            if(iscontinue){
                let simulationObj = this.state.simulationObj;
                let sobj = { simulationSnapshotId: simulationObj.simulationSnapshotId };
                
                this.continueTakeBack(sobj);
            }
        });
    }
    //enable takeback option
    enableTakeBack = () => {
        let simobj = this.state.simulationObj;
        let isenabletakeback = false;
        let isnotagavailable = false;
        
        if(this.props.simType === "AUI"){
            let taglist = this.props.selectedTagList;
            
            if((taglist && taglist.length > 0) || this.props.storeId > 0){
                if(simobj && simobj.simulationSnapshotId > 0){
                    isenabletakeback = true;
                }
            }

            //check notags available tag group available
            let tagGroupObj = this.props.tagStoreGroup;
            for (let i = 0; i < tagGroupObj.length; i++) {
                const tagGroupItem = tagGroupObj[i];
                let checkisnotagavailable = (tagGroupItem && tagGroupItem.storesGroupByTags?tagGroupItem.storesGroupByTags.find(x => x.tags.length === 0):null);
            
                if(checkisnotagavailable){
                    isnotagavailable = true;
                }
            }
        }
        
        this.setState({ isEnableTakeback: isenabletakeback, isNoTagAvailable: isnotagavailable });
    }

    //toggle simulate search type 
    toggleCustomPushOption = (state) => {
        this.setState({ isCustomPushEnabled: state }, () => {
            /* if(!this.state.isCustomPushEnabled && this.state.selectedBranchidx > -1){
                var fieldCount = this.state.branches[this.state.selectedBranchidx].fieldCount;
                var storetags = this.state.branches[this.state.selectedBranchidx].storeTags;

                this.setState({
                    simulateCount:(fieldCount>0)?fieldCount:0,
                    selectedTag:storetags
                });
            } */

            this.setState({
                selectedBranchidx: -1,
                selectedTag: [],
                simulateCount: (this.props.bottomFieldCount?this.props.bottomFieldCount:this.state.simulateCount),
                selectedBrch: null,
                isSCycle: false,
            }, () => {
                this.resetDrawdSimulation();
            });
        });
    }

    togglePrintPending = (type, status, isclearall, _callback, isfieldwiseprint) => {
        if(isclearall){
            this.setState({ isPrintPending: false, isPDFPrintPending: false });
        } else{
            if(type === "excel"){
                this.setState({ isPrintPending: status, isFieldWisePDFPrint: isfieldwiseprint });
            } else{
                this.setState({ isPDFPrintPending: status, isFieldWisePDFPrint: isfieldwiseprint });
            }
        }

        if(_callback){
            _callback();
        }
    }
    handleacknowledgeSimulationWarning=(obj)=>{
        if(obj){
            confirmAlert({
                title: this.props.t('Sure_to_aknowladge_warnining'),
                message: this.props.t("this_action__will_remove_this_warning_only_for_this_snapshot"),
                overlayClassName: (this.props.isRTL === "rtl" ? "alertrtl-content" : ""),
                buttons: [{
                    label: this.props.t('btnnames.yes'),
                    onClick: () => {
                        this.acknowledgeSimulationWarning(obj)
                    }
                }, {
                    label: this.props.t('btnnames.no'),
                    onClick: () => {
                        return false;
                    }}]
                });
        }else{
            confirmAlert({
                title: this.props.t('Sure_to_aknowladge_warnining'),
                message: this.props.t("this_action__will_remove_this_all_warning_only_for_this_snapshot"),
                overlayClassName: (this.props.isRTL === "rtl" ? "alertrtl-content" : ""),
                buttons: [{
                    label: this.props.t('btnnames.yes'),
                    onClick: () => {
                        this.acknowledgeSimulationWarning(obj)
                    }
                }, {
                    label: this.props.t('btnnames.no'),
                    onClick: () => {
                        return false;
                    }}]
                });
        }
       

    }
    acknowledgeSimulationWarning=(obj)=>{
        let sobj = {type : obj?"PRODUCT":"ALL",
        productId :  obj?obj.id:-1,
        simulationSnapshotId: this.state.simulationObj?this.state.simulationObj.simulationSnapshotId:-1}
        this.setState({loadinggif:true})
        submitSets(submitCollection.acknowledgeSimulationWarning, sobj, false).then(res => {
            if(res.status){
                var list=obj?this.state.productEditWarningsList.filter(x=>x.id!==obj.id):[]
                this.setState({productEditWarningsList:list,loadinggif:false})
            }else{
                alertService.error(res.extra);
            }
            this.setState({loadinggif:false})
            
        });
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
        let importedDataObj = (this.props.isKeepPreviousMpId?this.props.importedDataObj:this.state.importedDataObj);

        let mpId = (this.props.originatedMpId && this.props.originatedMpId > -1?this.props.originatedMpId:this.props.defSaveObj?this.props.defSaveObj.mp_id:-1);
        if(this.props.isShowFromPreview && this.props.selectedSimPreviewObj){
            mpId = this.props.selectedSimPreviewObj.mpId;
        }

        //mpid check if AUI view
        if(this.props.isKeepPreviousMpId){
            // console.log(mpId, importedDataObj.prevMpId);
            if(importedDataObj){
                if(importedDataObj.prevMpId > 0 && mpId === importedDataObj.prevMpId){
                    importedDataObj.isImportDataLoading = false;
                    this.props.updateImportedDataObj(importedDataObj);
                    
                    return false;
                } else{
                    importedDataObj.excelStartIndex = 0;
                    importedDataObj.excelSearchText = "";
                    importedDataObj.prevMpId = mpId;
                }
            }
        }

        let sendobj = {
            searchValue: importedDataObj.excelSearchText,
            mpId: mpId,
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

                if(this.props.isKeepPreviousMpId){
                    this.props.updateImportedDataObj(importedDataObj, () => {
                        this.compareImportedProds();
                    });
                } else{
                    this.updateImportedDataObj(importedDataObj, () => {
                        this.compareImportedProds();
                    });
                }

            });
        });
    }

    //compare imported prod list
    compareImportedProds = () => {
        let importedDataObj = (this.props.isFromStandaloneView?this.state.importedDataObj:this.props.importedDataObj);
        if(importedDataObj){
            let importedProds = importedDataObj.excelUploadList;
            for (let i = 0; i < importedProds.length; i++) {
                const importprod = importedProds[i];
    
                let mainObj = this.state.simulationObj;
                let productsList = (mainObj && mainObj.products && mainObj.products.length > 0?mainObj.products:[]);
                let isAdded = productsList.find(x => x.barcode === importprod.barcode && !x.isDelete);
                
                importprod.isAdded = (isAdded?true:false);
            }
    
            // console.log(importedProds);
            if(this.props.isFromStandaloneView){
                this.updateImportedDataObj(importedDataObj);
            } else{
                this.props.updateImportedDataObj(importedDataObj);
            }
        }
    }

    render() {
        var {branches,selectedCatRect,mapFields,mapProducts,selectedBranchidx,ConversionAvailabilityDetails,mapCategories}=this.state;
        var { openOneCategory, defSaveObj } = this.props; //isAuiViewsAllow
        let { selectedTag } = this.state;
        
        let isShowCleanSnapshotWarn = (this.state.simulationObj && this.state.simulationObj.simulationSnapshotId > -1 && this.state.simulationObj.isVmpEdited?true:false);
        
        return (
            <Col className={'simpreview'+(selectedTag && selectedTag.length > 0?" tagadded-view":"")}>
                <Row>
                {/* {this.state.simulationObj&&this.state.simulationObj.simulationSnapshotId>0?<span className='snapshot_span alldep'><FeatherIcon icon="bookmark"  size={16} />
                {this.props.t("SnapShot")}
                </span>:<></>} */}
                    {this.props.simType === "AUI" && !this.props.isShowFromPreview?
                        <Col className='aui-sim-title'>
                            <label>{defSaveObj && defSaveObj.department?(defSaveObj.department.name+" "):"- "}
                            {openOneCategory && this.state.selectedCatRect && this.state.selectedCatRect.categoryList && this.state.selectedCatRect.categoryList.length > 0?<>
                            {"  "}&#62; <span className={'badge badge-warning'} style={{background: getNameorIdorColorofBox(this.state.selectedCatRect.categoryList[0],"color"), color: "#fff"}}>
                                {getNameorIdorColorofBox(this.state.selectedCatRect.categoryList[0],"name")}
                                </span>
                            </>:<></>}
                            {"  "}
                            {this.props.selectedTagList && this.props.selectedTagList.length > 0?<>
                                    &#62;{' '}
                                    {this.props.selectedTagList.map((tags,tagskey)=>{
                                        return(<React.Fragment key={tagskey}>
                                            {tagskey < 2?<><TooltipWrapper text={tags.name} >
                                                <Badge className='tags-bg tags-selected-coloring'>{tags.name.slice(0, 8)}{tags.name.length > 8 && "..."}</Badge> 
                                            </TooltipWrapper> {' '}</>:<></>}
                                        </React.Fragment>)
                                    })}
                                    {this.props.selectedTagList.length > 2?<>
                                        <div className="dropdown aui-tag-dropdown" onMouseEnter={this.handleMouseEnter} onMouseLeave={this.handleMouseLeave}>
                                            <div className='dropdown-link'><KebabHorizontalIcon size={16} /></div>
                                            {this.state.isOpen && (
                                                <div className="dropdown-content">
                                                    <h6>{this.props.t("MORE_TAGS")}</h6>
                                                    {this.props.selectedTagList.map((tags,index)=>{
                                                        return(<React.Fragment key={index}>
                                                            {index > 1?<TooltipWrapper text={tags.name}>
                                                                <Badge className='tags-bg tags-selected-coloring'>{tags.name.substring(0,10)+(tags.name.length > 10?"..":"")}</Badge>
                                                            </TooltipWrapper>
                                                            :<></>}
                                                        </React.Fragment>)
                                                    })}
                                            </div>
                                            )}
                                        </div>
                                    </>:<></>}
                            </>:<>&#62; <Badge className='no-tags-bg tags-selected-coloring'>{this.props.t("NO_TAG")}</Badge></>}
                            </label>
                            
                            
                        </Col>
                    :<></>}
                </Row>
                {(((this.props.simType)!=="AUI")&&(this.props.simType)!=="ISleAllocation")?<SimulationGenarationFilter 
                        isopenfromAffectedSimList={this.props.isopenfromAffectedSimList}
                        branches={branches} selectedBranchidx={selectedBranchidx} mapFields={mapFields} selectedTag={[...this.state.selectedTag]} simulateCount={this.state.simulateCount} 
                        defTagName={this.state.defTagName} isPrioratizeUserPercentage={this.state.isPrioratizeUserPercentage} 
                        simulateSearchObj={this.state.simulateSearchObj} loadedTagsList={this.props.loadedTagsList}
                        isCustomPushEnabled={this.state.isCustomPushEnabled} toggeleSimulateCount={this.toggeleSimulateCount} 
                        toggleTags={this.toggleTags} toggleBranches={this.toggleBranches}
                        handlePrioratizeUserPercentage={this.handlePrioratizeUserPercentage} toggelePushBtn={this.toggelePushBtn} 
                        removeSimTag={this.removeSimTag} getSimulatePlanogram={this.getSimulatePlanogram}
                        selectedBrch={this.state.selectedBrch} isSCycle={this.state.isSCycle} handleSCycle={this.handleSCycle} 
                        toggleCustomPushOption={this.toggleCustomPushOption}
                        disableSCycle={this.state.disableSCycle}
                        />:<></>}
                <div className='snapshotclear-sim' >{isShowCleanSnapshotWarn?<>
                    {this.props.simType === "AUI"?<TooltipWrapper text={this.props.t("CLEAR_SNAPSHOTS_MSG")}>
                        <Col className="allcat-warning-aui">
                            <span><img src={warningicon} alt=""/> <Button variant="warning" onClick={this.clearSimSnapshots}>{this.props.t("CLEAR_SNAPSHOTS")}</Button></span>
                        </Col>
                    </TooltipWrapper>:
                    <Col xs={12} className="allcat-warning">
                        <Alert variant={"warning"}>
                            {this.props.t("CLEAR_SNAPSHOTS_MSG")}
                            <Button variant="warning" onClick={this.clearSimSnapshots}>{this.props.t("CLEAR_SNAPSHOTS")}</Button>
                        </Alert>
                    </Col>}
                </>:<></>}</div>

                {(this.props.simType)!=="AUI"?<div className='tab-prev-sim'><ButtonGroup className="btngroupview" 
                    style={{display:((this.props.simType)===SimulationTypesFE.IsleAllocation?"none":"block")}}>
                            <Button size="sm" className={this.state.viewtype===1?"active":""} onClick={()=>this.handleViewType(1)}>{this.props.t("preview")}</Button>
                            <Button size="sm" className={this.state.viewtype===2?"active":""} onClick={()=>this.handleViewType(2)}>{this.props.t("SUMMARY")}</Button>
                    </ButtonGroup></div>:<></>}
                    {
                        this.props.simType === "AUI" ?
                    <div className='aui-btngroup'>
                        <span className={`aui-content-title${this.state.viewtype===1?"-active":""}`} onClick={()=>this.handleViewType(1)}>{this.props.t('preview')}</span>
                        <span className={`aui-content-title${this.state.viewtype===2?"-active":""}`} onClick={()=>this.handleViewType(2)}>{this.props.t('SUMMARY')}</span>
                    </div>:""
                }
                {/* {console.log(this.state.divHeight)} */}
                {/* {!this.props.isIsleSimulation && !openOneCategory? */}
                    <Row>
                        {this.state.viewtype===1?
                        <div className='outereditsimcat'>
                            {/* /className="MPSimulateOneModal"     */}
                        {/* { this.props.simType!==SimulationTypesFE.AUI?<Col className='Simeditcatname'>{(this.state.selectedCatRect&&this.state.selectedCatRect.categoryList.length>0)?<span className="catname">{getNameorIdorColorofBox(this.state.selectedCatRect.categoryList[0],"name")}</span>:<></>}</Col>:<></>} */}
                        {this.state.issloadsim?<EditSimulateCategory 
                            actualFieldStructures={this.state.actualFieldStructures}
                            allCategoryData={this.state.allCategoryData}
                            productEditWarningsList={this.state.productEditWarningsList}
                            isopenfromAffectedSimList={this.props.isopenfromAffectedSimList}
                            
                            importedDataObj={this.props.isFromStandaloneView?this.state.importedDataObj:this.props.importedDataObj}
                            updateImportedDataObj={this.props.isFromStandaloneView?this.updateImportedDataObj:this.props.updateImportedDataObj}

                            isIsleSimulation={this.props.isIsleSimulation}
                            originatedMpName={this.props.originatedMpName}
                            originatedMpId={this.props.originatedMpId}
                            reloadSimAndTag={this.props.reloadSimAndTag}
                            reloadSimAndStore={this.props.reloadSimAndStore}
                            saveSimulationObjToSideBarComp={this.props.saveSimulationObjToSideBarComp}
                            tagStoreGroup={this.props.tagStoreGroup}
                            selectedTagGroup={this.props.selectedTagGroup}
                            storeId={this.props.storeId}
                            simOption={this.props.simOption} 
                            simulateCount={this.state.simulateCount}
                            newSnapshotId={this.props.newSnapshotId}
                            isEnableTakeback={this.state.isEnableTakeback}
                            isNoTagAvailable={this.state.isNoTagAvailable}
                            isStoreReset={this.props.isStoreReset}
                            toggleLoadingModal={this.props.toggleLoadingModal}
                            selectedTagList={this.props.selectedTagList}
                            openOneCategory={openOneCategory}
                            isAuiViewsAllow={this.props.isAuiViewsAllow}
                            isCustomPushEnabled={this.state.isCustomPushEnabled}
                            isSalesCycle={this.props.isSalesCycle}
                            isShowFromPreview={this.props.isShowFromPreview}
                            selectedSimPreviewObj={this.props.selectedSimPreviewObj}
                            simType={this.props.simType}
                            mpstate={this.props.mpstate}
                            bottomFieldCount={this.props.bottomFieldCount} 
                            isopenfirsttime={this.state.isopenfirsttime}
                            defSaveObj={this.props.defSaveObj}
                            getsimulatepayload={this.state.getsimulatepayload} 
                            selectedCatRect={selectedCatRect}
                            signedobj={this.props.signedobj}
                            toggleopenfirsttime={this.toggleopenfirsttime} 
                            toggleOneCategory={this.toggleSingleCategory} 
                            haveChnagesinCat={this.props.haveChnagesinCat} 
                            isRTL={this.props.isRTL} 
                            handlebackinsaveChnages={this.handlebackinsaveChnages} 
                            handlehaveChnagesinCat={this.props.handlehaveChnagesinCat}
                            simulationObj={this.state.simulationObj} 
                            notReleatedProdList={this.state.notReleatedProdList}
                            simulateSearchObj={this.state.simulateSearchObj} 
                            updateSaveReloadStatus={this.updateSaveReloadStatus} 
                            sendmarkStackableCall={this.props.sendmarkStackableCall} 
                            dmode={this.props.dmode}
                            toggleSimulateAllModal={this.props.toggleSimulateAllModal} 
                            handleAuiOpen={this.props.handleAuiOpen}
                            isFullscreenEditModal={this.props.isFullscreenEditModal}
                            productsWithAnomaly={this.state.productsWithAnomaly}
                            getProductAnomalies={this.getProductAnomalies}
                            mapFields={mapFields}
                            mapCategories={mapCategories}
                            mapProducts={mapProducts}
                            changeSaleCycleActive={this.props.changeSaleCycleActive}
                            selectedBrch={this.state.selectedBrch} 
                            isSCycle={this.state.isSCycle} 
                            handleSCycle={this.handleSCycle}
                            disableSalesCycleState={this.props.disableSalesCycleState}  
                            disableSCycle={this.state.disableSCycle}
                            ConversionAvailabilityDetails={ConversionAvailabilityDetails}
                            handleCreateNewAUI={this.handleCreateNewAUI}
                            isPrintPending={this.state.isPrintPending}
                            isPDFPrintPending={this.state.isPDFPrintPending}
                            isFieldWisePDFPrint={this.state.isFieldWisePDFPrint}
                            togglePrintPending={this.togglePrintPending}
                            isShowCleanSnapshotWarn={isShowCleanSnapshotWarn}
                            getSimulationcall={this.getSimulationcall}
                            handleacknowledgeSimulationWarning={this.handleacknowledgeSimulationWarning}
                            isNewProdSim={this.props.isNewProdSim}
                            isChainSaleCycle={this.state.isChainSaleCycle}
                            updateIsChainSaleCycle={this.props.updateIsChainSaleCycle}
                            isSaleCycleUpdated={this.state.isSaleCycleUpdated}
                            updateIsSaleCycleUpdated={this.updateIsSaleCycleUpdated}
                            // sendCreateNewAUICall={this.sendCreateNewAUICall}
                            // closeCNAUIclose={this.closeCNAUIclose}
                            // openHaveVerAlertBox={this.openHaveVerAlertBox}
                            />:
                            <Col xs={12} className="middle-section"  ref={this.displaydiv}>
                                 <Col xs={12} style={{textAlign:"center"}}>
                                    <Col className='Nopreview'>
                                            <h5>{this.props.t("NO_SIMULATION_PREVIEW")}</h5>
                                        </Col>
                                 </Col>
                            </Col>
                            }

                        </div>
                        :
                                    <SimulationSummary divHeight={this.state.divsummeryHeight} isRTL={this.props.isRTL} logViewType={this.state.logViewType}
                                        simType={this.props.simType}
                                        selectedScat={this.state.selectedScat} selectedCat={this.state.selectedCat}
                                        summaryViewObj={this.state.summaryViewObj}
                                        handleCategoryView ={this.handleCategoryView }
                                        />
                                    }
                    
                    </Row>
                    {/* : */}
                   
                {/* } */}

                {/* fullscreen modal */}
                {/* <Modal dialogClassName="modal-fullscreen sim-fullscreen"  show={this.state.isShowFullscreen} onHide={() => this.setFullscreenShow(false)}>
                    <Modal.Header closeButton>
                        <Modal.Title><span className="f-screenTitle">{this.props.t("Full_Screen")}</span>
                        {(this.props.department&&this.props.department.department_name)?<span className="catname">{this.props.department.department_name}</span>:<></>}
                        </Modal.Title>
                        <Dropdown drop='down'  title={this.props.t("PRINT_SIMULATION")} className='printdrop-down down'>
                            <Dropdown.Toggle variant="success">
                                <FeatherIcon icon="printer"  size={12} /> {this.props.t("PRINT_SIMULATION")}
                            </Dropdown.Toggle>

                            <Dropdown.Menu>
                                <ul className='list-inline'>
                                    <li className='list-inline-item' onClick={() => this.printInit(false, true)}><PDFPrintIcon size={26} /></li>
                                    <li className='list-inline-item' onClick={() => this.printInit(true, true)}><ExcelPrintIcon size={26} /></li>
                                </ul>
                            </Dropdown.Menu>
                        </Dropdown>
                    </Modal.Header>
                    <Modal.Body ref={this.Efullscreendiv}>
                        <React.Fragment>
                            {(fullscreenObj!==null&&fullscreenObj.fields&&Object.keys(fullscreenObj.fields).length>0)&&<Col  className="single-simitem" onContextMenu={e => e.preventDefault()} style={{width: "100%",height:(this.state.fullscreenheight+25)}}>
                                        
                                        <svg id="simulation-mainsvg-view" className="sim-preview-all-full" viewBox={"0 0 "+this.state.fullscreensvgdrawDiemention.drawWidth+" "+this.state.fullscreenheight} width={this.state.fullscreensvgdrawDiemention.drawWidth} height={this.state.fullscreenheight} style={{  border: '0px solid rgb(81, 40, 160)'}}
                                        version="1.1" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
                                                                
                                            {(fullscreenObj.fields&&Object.keys(fullscreenObj.fields).length>0)&&Object.keys(fullscreenObj.fields).map((Fld,f)=>{
                                                var fld=fullscreenObj.fields[Fld]
                                                return<React.Fragment key={f}>
                                                    <rect className=""  width={fld.drawWidth} height={fld.drawHeight} x={fld.x } y={fld.y } style={{ strokeWidth: 1, stroke: (this.props.dmode?'#2CC990':'#5128a0'), fill: 'transparent' }} 
                                                    />
                                                    {fld.separators&&fld.separators.length>0?fld.separators.map((sprtr,sp)=> <React.Fragment key={sp}> {sprtr.isCategoryEnd?<line x1={sprtr.drawX} y1={fld.y} x2={sprtr.drawX} y2={fld.y+fld.drawHeight} strokeWidth={4} stroke="red" strokeDasharray="6"  />:<line x1={sprtr.drawX} y1={fld.y} x2={sprtr.drawX} y2={fld.y+fld.drawHeight} strokeWidth={4} stroke={(this.props.dmode?'#2CC990':'#5128a0')} />} </React.Fragment>)
                                                                :<></>}
                                                    {fld.shelf.length>0?fld.shelf.map((shlf,g)=><React.Fragment key={g}>
                                                            <line x1={shlf.previewguid.startX} y1={shlf.y} x2={shlf.previewguid.startX} y2={shlf.y+shlf.drawHeight} strokeWidth={2} stroke="green" strokeDasharray="4" />
                                                            <line x1={shlf.previewguid.endX} y1={shlf.y} x2={shlf.previewguid.endX} y2={shlf.y+shlf.drawHeight} strokeWidth={2} stroke="green" strokeDasharray="4" />

                                                            <rect className={"sftrect"} width={shlf.drawWidth} height={shlf.drawHeight} x={shlf.x } y={shlf.y +0} style={{ strokeWidth: 1, stroke: (this.props.dmode?'#2CC990':'#5128a0'), fill: shlf.isDisable?'#897CA3':'transparent' }} 
                                                            />
                                                            <rect width={shlf.drawWidth} height={shlf.drawGap} x={shlf.x} y={(shlf.y + 0)+(shlf.drawHeight?shlf.drawHeight:0)} style={{ strokeWidth: 1, stroke: (this.props.dmode?'#2CC990':'#5128a0'), fill: (this.props.dmode?'#2CC990':'#5128a0') }} />
                                                        </React.Fragment>
                                                    ):<></>}
                                                    
                                                </React.Fragment>
                                            })}  
                                            {(fullscreenObj&&Object.keys(fullscreenObj.products).length>0)?Object.keys(fullscreenObj.products).map((Prod,prodt)=>{
                                                var product=fullscreenObj.products[Prod]
                                            
                                                return <React.Fragment key={prodt}>
                                                        { !product.isDelete&&<>
                                                            
                                                            <FullRenderProdImage prodObj={product}  handleloadedprodcount={this.handleloadedprodcount} />
                                                            {product.isStackable?<foreignObject  x={product.x} y={product.y-18} width={product.drawWidth} height={20}>
                                                                <div 
                                                                style={{textAlign: "center"}}>
                                                                    <FeatherIcon icon="chevrons-up"  color={"#ED327A"} size={18} />
                                                                </div>
                                                                
                                                            </foreignObject>:<></>}
                                                        </>}
                                                    </React.Fragment>
                                                }):<></>
                                            }
                                         </svg>
                                    </Col>
                                    }
                            </React.Fragment>

                    <canvas id="simfull-canvas" style={{display: "none"}}></canvas>

                    <PrintCoverPageView t={this.props.t} isRTL={this.props.isRTL}
                        simType={this.props.simType}
                        defSaveObj={this.props.defSaveObj}
                        mainid="simallprint-wrapper"
                        subid="simall-cover" 
                        chaindetails={(this.props.signedobj && this.props.signedobj.signinDetails?this.props.signedobj.signinDetails.chain:null)}
                        department={this.props.department}
                        signedobj={this.props.signedobj} 
                        searchobj={this.state.simulateSearchObj}
                        fieldCount={(this.state.simulateSearchObj&&this.state.simulateSearchObj.fieldCount)?this.state.simulateSearchObj.fieldCount:0}
                        isCatview={false}
                        categoryName={(this.state.selectedCatRect && this.state.selectedCatRect.selectedCat && this.state.selectedCatRect.selectedCat)?getNameorIdorColorofBox(this.state.selectedCatRect.selectedCat,"name"):""}
                        isFieldWisePDFPrint={this.state.isFieldWisePDFPrint}
                        />

                </Modal.Body>
                {this.state.printloading?<Col style={{background:"#f0f0f0",width:"100%",position:"absolute",height: "100%",}}></Col>:<></>}
                </Modal> */}
                
                <AcViewModal showmodal={this.state.loadinggif} message={this.props.t('PLEASE_WAIT')} />

                <MPAlertBox 
                isshow={this.state.APverAlert} 
                icon={<MPWarnIcon width={156} height={138} />}
                Normal_text={this.props.t("You_are_already_have_planogram_version")}
                bold_text={this.props.t("Please_select_what_to_do")}
                successbtnText={this.props.t("Add_this_one_also")}
                successBoderText={this.props.t("Keep_as_a_draft")}
                successbtnAction={this.sendCreateNewAUICall}
                successBoderAction={this.closeCNAUIclose}
                handleShowHide={this.openHaveVerAlertBox} />

                <TakeBackOverlapWarn t={this.props.t} isRTL={this.props.isRTL}
                    isShowTakeBackError={this.state.isShowTakeBackError}
                    takeBackErrorObj={this.state.takeBackErrorObj}
                    toggleTakebackWarnModal={this.toggleTakebackWarnModal}
                    />

            </Col>   
        );
    }
}

const mapDispatchToProps = dispatch => ({
    setAuiConvertedetails: (payload) => dispatch(AuiConvertedetailsSetAction(payload)),
    setMPCategoryChanges: (payload) => dispatch(MPCategoryChangesSetAction(payload)),
    setMPStackableProdListArray: (payload) => dispatch(mpstackableMarkListAction(payload)),
    setMpEditStackHistory: (payload) => dispatch(mpEditStackHistorySetAction(payload)),
    setNewProdCountCat: (payload) => dispatch(setNewProdCountCatAction(payload)),
    setNewProdCountSubCat: (payload) => dispatch(setNewProdCountSubCatAction(payload))
});
export default withTranslation()(withRouter(connect(null, mapDispatchToProps)(MPsimulateAllCategory)))
