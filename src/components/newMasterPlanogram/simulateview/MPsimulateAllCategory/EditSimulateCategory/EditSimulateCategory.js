import { DiffAddedIcon, ListUnorderedIcon, PlusIcon, SearchIcon, XCircleFillIcon, XIcon, TrashIcon, DashIcon } from '@primer/octicons-react';
import React, { Component, useRef, useState } from 'react';
import { Button, ButtonGroup, Col, Form, InputGroup, Overlay, Row, Tab, Tooltip, Nav, Modal, Dropdown } from 'react-bootstrap';
import { withTranslation } from 'react-i18next';
import { withRouter } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid'; //unique id
import { CopyToClipboard } from 'react-copy-to-clipboard'; //copy text to clipboard
import { connect } from 'react-redux'
import FeatherIcon from 'feather-icons-react';
import { confirmAlert } from 'react-confirm-alert';
import toImg from 'react-svg-to-image';
import jsPDF from 'jspdf';
import moment from 'moment';
import { PopoverWrapper, TooltipWrapper } from '../../../AddMethods';
// import html2canvas from 'html2canvas';
import * as htmlToImage from 'html-to-image';
import * as XLSX from "xlsx-js-style";

import { alertService } from '../../../../../_services/alert.service';
import { convertUomtoSym, measureConverter, roundOffDecimal, findBrowserType, FindMaxResult, CalculateRatio, replaceSpecialChars, checkColorIsLight, stringtrim, numOfDecimalsLimit } from '../../../../../_services/common.service'; //stringtrim
import { submitCollection } from '../../../../../_services/submit.service';
import { submitSets } from '../../../../UiComponents/SubmitSets';
import { checkAllowToAdd, getNameorIdorColorofBox, checkOnShelfBox, TooltipWrapperBrandnsubcat, convertWidthPercent } from '../../../AddMethods'; //TooltipWrapper, 
import { checkThroughProductsTest } from '../../../../planograms/planDisplayUnit/additionalcontents';
import { ghostOnDrag, removeGhostImage } from '../../../../common_layouts/ghostDragWrapper';
import {  BlockContextMenu, BlockRectangle, DimensionChangedProdComp, NoSimProductsComp, ReplaceProductsTab, RuleWarningsComp, SaleCycleComp, setGuidlineComman } from './EditSimulateCategoryComps' //ImageRectangle
import PreviewImage from '../../../../common_layouts/image_preview/imagePreview.js';
import EditSimulateClipBoard from './EditSimulateClipBoard'
import i18n from "../../../../../_translations/i18n"; 
import { products } from '../../../SampleData';
import { mpAftersaveFullScreenObjSetAction, MPCategoryChangesSetAction, mpEditStackHistorySetAction, 
    // mpsetClipBoardandotherforCatSetAction,
     mpstackableMarkListAction, 
     SimulationNewProductSearchDetailsSetAction} from '../../../../../actions/masterPlanogram/masterplanogram_action'
import loadinggif from '../../../../../assets/img/loading-sm.gif';
import { AcViewModal } from '../../../../UiComponents/AcImports';
import './EditSimulateCategory.css';
import {elmAccordingtoXY, GetContainingProdsByBox, makemapCatObj, makemapFieldObj, makemaProductsObj, makeRatiofromhieghestField,
getSnappingLocation, findRuleAvailableForBrand, getAllRuleWarnings, validateHeirarchyMissings, makemapactualFieldObj, 
// clipBoardRedrawObj , convertProductstoFullScreen, convertfieldstoFullScreen
 } from '../mpsimCommenMethods'; //exportSimulationToVMP, 
import { catRectEnums, catRuleEnums, MPBoxType, simulateSnapshotEnums, SimulationTypesFE } from '../../../../../enums/masterPlanogramEnums';
// import Productpreview from '../../../productsview/productdetails/productpreview';
import { compareAndGetFieldProds, PrintCoverPageView } from '../../../MPSimulationCommenMethods';
import { FullRenderProdImage } from '../../../renderProdImage';
import { assistant_medium } from '../../../../../assets/fontsjs/Assistant';
import SimEditToolBox from './simEditToolBOx/SimEditToolBox';
import FullScreenEditModal from './fullScreenEditModal/FullScreenEditModal';
import Switch from "react-switch";
import { InfoIcon, ExcelPrintIcon, PDFPrintIcon, NewReplaceProductIcon, Icons, MPWarnIcon, PDFFieldPrintIcon, ExcelPrintFieldWiseIcon } from '../../../../../assets/icons/icons';
import { TakeBackOverlapWarn } from '../../../contimplement/continueimpl';
import { NewProdStrategyApplyModal } from '../../../auisidebar/newproducts/additionalcomps';
import NoIMage from '../../../../../assets/img/noimage.png';
import MpDropProdAlertBox from '../../../alertBox/MpDropProdAlertBox';
import AddNewItemComponent from '../../../../masterdata/products/AddNew/addnew';
import ExportCSV from '../../../../planograms/planDisplayUnit/productcontent/excelexport';
import NewProductsTab from './newProductsTab';

class EditSimulateCategory extends Component {
    constructor(props){
        super(props);
        this.fullscreendiv=React.createRef();
        this.displaydiv = React.createRef();
        this.dragPreviewCanvas = React.createRef(); //drag preview canvas
        this.drawSVG = React.createRef(); //svg draw
        this.svgCreatePoint = null;
        this._isMounted = false;
        this.oriPageXY = {isfirefox: false, x: 0, y: 0};
        this._guideTimeout = null;
        this._dragcleartout=null;
        this._nosimulateprodTimeOut = null;
        this._scprodTimeOut = null;
        this._StackablecallTimeout = null;
        this._dropposition = {startX: 0, endX: 0};
        this._changingX=0
        this._changingY=0
        //cut drop object
        this._cutDragObj= { shelfobj: null, shelfidx: -1, fieldobj: null };
        this._importedScrollHeight = 0;
        
        this.state = {
            svgViewId: "simulation-mainsvg-view",
            wrapperId:"simulation-edit-wrapper",
            isAddProucts:false,
            newProducts:products,
            catDivHeight:360,
            displayUOM: "cm",
            displayRatio:0,
            loadProdList: [], recentProdList: [], filteredProdList: [], pstartpage: 0, ptotalresults: 0, pmaxcount: 5, //loaded products, recently added products and pagination details
            isListViewActive: "LIST",
            isAllowPan: false, activeTool: "drawBlock", zoomXRatio: 0,
            currentDraggableProd: null, checkSaftyMargin: 1.5, saftyMargin: 3, saleSaftyMargin: 1.5, 
            isviewcmenu: false, contxtmenu: {xpos:0, ypos: 0, xidx: 0, scatidx: 0},
            isviewcmenu2: false, contxtmenu2: {xpos:0, ypos: 0,},
            removedProductsCounter:[],
            addedProductsCounter:[],
            isselectprodblock: false,isblockmove: false, currentSelectedBlock: null,
            selectedlocobj: null, //debug view
            currentInternalDraggableProd: null, //field inside selected product 
            newrectstart: null,
            isshowdash: false, dashrect: { startx:0, starty: 0, x: 0, y: 0, width: 0, height: 0, percentage: 0 },
            selectedblockpos:null,
            showPreviewImageModal:false, productId:0,
            cutArray:[],
            cutNewArray:[],
            isClipboardreload:false,
            //history points
            historyData: { past: [], present: 0, future: [] },
            snappinglimitpx:10,
            clipBoardShow:false, productTab: "products",
            loadinggif:false,
            xrayActive:4,
            svgdrawDiemention:{drawWidth:0,drawHeight:0},
            mapFields: null,
            // isFieldsMatching: false,
            mapproductList: [],
            mapCatRects: [],
            isRuleWarn: {isshow: false, totalcount: 0}, mapRulesList: [],
            clipDragType: "MULTIPLE",
            isContentDragging: false, //triggers when content dragging inside svg or drop into svg
            nonfilteredNonEProducts:[],
            nonfilteredSCProducts:[],
            replaceProds:[],
            noSim_filter:"",
            sc_filter:"",
            selectedCatRect: null,
            isShowFullscreen:false,
            fullScreenRatio:0,
            fullscreenObj:null,
            fullscreenheight:0,
            fullscreensvgdrawDiemention:{drawWidth:0,drawHeight:0},
            PrintFullImg: null,
            printHeight: 2480 ,
            printWidth: 0,
            printRatio: 1,
            printonepagewidthinPX: 3508,            
            isShowPreviewModal:false,
            isFieldWisePDFPrint: false,
            selectedProduct:null,
            loadedTagsList:[],
            isFirstTimeDrawguid: false, guideProdList: [],
            loadedprodcount:0,
            printloading:false,
            markablestackable:false,
            stackablemarkArray:[],
            stackableCountofmark:"",
            IsShowStackables:true,
            isShowNewProds:false,
            loadingstackablecall:false,
            isStackableEdited:false,
            filteredOtherPrds: [],
            //fullscreen edit  modal
            isSetFullScreenEditModal:false,
            // APverAlert:false,
            isSalesCycle:this.props.isSalesCycle,
            isSCycle:this.props.isSCycle,

            fieldsWithAnomaly:[] ,
            isShowTakeBackError: false, takeBackErrorObj: null,
            TouchedCatRcetList:[],

            //preview new prods
            isShowPreviewNewProds: false,

            //strategy apply prods
            isShowStrategyModal: false,
            isShowStrategyHelp: false,
            isSaveApply: false,
            selectedSaveProds: [], notAvailableStrategy: 0,

            droppingShelfList: [],
            isNewClipBoardTouched:false,
            AUISideBarGap: (125+20),
            isDisableEDitingwithfullscreen:false,

            viewSimID: uuidv4(),
            //non sim filters
            nonsimFilter_categoryList:[{value:"-1", label:this.props.t("NONE")}],
            selectedNonSimFilterCat:{value:"-1", label:this.props.t("NONE")},
            nonsimFilter_subcategoryList:[{value:"-1", label:this.props.t("NONE")}],
            selectedNonSimFiltersubCat:{value:"-1", label:this.props.t("NONE")},
            nonsimFilter_brandsList:[{value:"-1", label:this.props.t("NONE")}],
            selectedNonSimFilterBrand:{value:"-1", label:this.props.t("NONE")},
            nonsimFilter_supplierList:[{value:"-1", label:this.props.t("NONE")}],
            selectedNonSimFilterSupp:{value:"-1", label:this.props.t("NONE")},
            isProductDropwarn:false,
            dropWarningList:[],
            selectedwarningdropprod:null,
            
            //sale cycle filters
            scFilter_categoryList:[{value:"-1", label:this.props.t("Any")}],
            selectedScFilterCat:{value:"-1", label:this.props.t("Any")},
            scFilter_subcategoryList:[{value:"-1", label:this.props.t("Any")}],
            selectedScFiltersubcat:{value:"-1", label:this.props.t("Any")},
            scFilter_brandsList:[{value:"-1", label:this.props.t("Any")}],
            selectedScFilterBrand:{value:"-1", label:this.props.t("Any")},
            scFilter_supplierList:[{value:"-1", label:this.props.t("Any")}],
            selectedScFilterSupp:{value:"-1", label:this.props.t("Any")},
            scFilter_statusList:[{value:"-1", label:this.props.t("Any")}],
            selectedScFilterStat:{value:"-1", label:this.props.t("Any")},
            selectedScProductId: -1,

            //fields count
            actualFieldsCounts: [],

            ghostWrapperObj: null,
            //prod view
            subcategorylist:[{value:"-1", label:"All Sub Categories"}],
            allBrands:[{value:"-1", label:"All Brands"}],
            // productEditWarningsList:[],
            productSearchText:"",
            isSearchprodutDefault:false,
            isDisableEdits:false,

            //imported view
            newProdTab: "newproducts",

            isDisableEdit: false, //disable edit for certain users

            //excel upload list
            paginationMaxCount: 100, 

            //excel upload pagination
            excelUploadPagination: { 
                totalCount: 0, 
                startIndex: 0,  
                available: 0, 
                notavailable: 0,
                availableBarcodes: [],
                uploadUUID: null,
            },

            spacefromtopsvgdraw:20,
        }
        
    }

    componentDidMount(){
        this._isMounted = true;
       
        if(this._isMounted){
            
            // let reduceamount = (this.props.simType !== "AUI" || this.props.isShowFromPreview?150:(this.props.isSetFullScreenEditModal?130:60));
            let reduceamount = 7;
            var ccatDivHeight=this.displaydiv.current ? ((this.displaydiv.current.offsetHeight - reduceamount)) : 0;
            var maxresult = FindMaxResult(ccatDivHeight,106,250)
            // console.log(this.props.mpstate);

            let simProdSearchData = this.props.mpstate.simulationProductSearchData;
            // console.log(simProdSearchData);

            this.setState({
                isClipboardreload:true,
                pmaxcount:maxresult.maxresultCount<6?5:maxresult.maxresultCount,
                catDivHeight: ccatDivHeight, 
                selectedCatRect: this.props.selectedCatRect,
                svgViewId: (this.props.mainViewId?this.props.mainViewId:this.state.svgViewId),
                wrapperId:(this.props.SimWrapperId?this.props.SimWrapperId:this.state.wrapperId),
                isDisableEDitingwithfullscreen:this.props.simType&&this.props.simType===SimulationTypesFE.IsleAllocation,
                isDisableEdits:this.isEditabledisable(),
                productSearchText:(simProdSearchData && simProdSearchData.text)?simProdSearchData.text:this.state.productSearchText,
                isAddProucts:(this.props.mpstate.simulationProductSearchData!==null)?true:this.state.isAddProucts,
                isSearchprodutDefault:(this.props.mpstate.simulationProductSearchData!==null)?true:false
            },()=>{
                //if warning prod details available
                if(simProdSearchData && simProdSearchData.warnProd){
                    this.setState({ selectedwarningdropprod: simProdSearchData.warnProd }, () => {
                        this.reloadProdWarnModalDetails(true);
                    });
                }

                //update edit disabled state
                if(typeof this.props.updateSimDisabled === "function"){
                    this.props.updateSimDisabled(this.state.isDisableEdits);
                }
                
                this.setState({nonfilteredSCProducts:this.props.productsWithAnomaly},()=>{
                    this.props.setSimulationNewProductSearchDetails(null)
                    this.mapobjectsdraw("firsttime");
                    this.getAllTags();
                    this.getbrandsforFilter()
                    this.getAllStatus();
                    this.getAllCategoriesFromDepartment()
                    this.getSupplierList()
                    this.getSubCategoriesnonSimFilter()
                    this.getAllSubCategories();
                    this.loadAllBrands();
                })
               
            })

            //handle keydown - arrows key actions
            document.addEventListener("keydown", this.typingKeyHandling, false);
            //if firefox 
            if(findBrowserType() === "firefox"){
                document.addEventListener("dragover", this.getPageXYCords, false);
            }
            if(this.props.isopenfirsttime) {
                this.warningifnotdefualt()
            }   
        }

        if(this.props.simType === "AUI" || this.props.simType === "Normal"){
            if(this.props.mapProducts){
                const filteredOtherProduct = this.props.selectedCatRect.selectedCat?this.props.mapProducts.filter(obj => obj.field_custom_id !== this.props.selectedCatRect.selectedCat.field_custom_id ):this.props.mapProducts;
                this.setState({filteredOtherPrds: filteredOtherProduct});
            }
        }
    }
    componentWillUnmount(){
        this._isMounted = false; 
        
        document.removeEventListener("keydown", this.typingKeyHandling, false);
        document.removeEventListener("dragover", this.getPageXYCords, false);
        if(this._nosimulateprodTimeOut){ clearTimeout(this._nosimulateprodTimeOut) }
        if(this._scprodTimeOut){ clearTimeout(this._scprodTimeOut) }
        if(this._guideTimeout){ clearTimeout(this._guideTimeout) }

        window.onbeforeunload = undefined
    }

    componentDidUpdate = () => {
        //shows warning changes available when existing from current field
        if (this.state.isStackableEdited) {
        window.onbeforeunload = (e) => {
            e.returnValue = 'wait';
            return false
        }
        } else {
        window.onbeforeunload = undefined
        }

        if(this.props.simType === "AUI" && !this.props.isNewProdSim && this.props.isSalesCycle === false && this.state.productTab === 'saleCycle'){
            this.setState({productTab: 'products', selectedScProductId: -1})
        }

        if(this.props.simType === "AUI" && this.props.isFullscreenEditModal && (this.props.isSalesCycle !== this.state.isSalesCycle)){
            this.setState({isSalesCycle: this.props.isSalesCycle});
        }

        if(this.props.simType === "AUI" && this.props.isNewProdSim && (this.props.isSCycle !== this.state.isSCycle)){
            this.setState({isSCycle: this.props.isSCycle},()=>{
                if(!this.state.isSCycle){
                    this.setState({productTab: 'products', selectedScProductId: -1})
                }
            })
        }

        if(this.props.simType === "Normal" && (this.props.isSCycle !== this.state.isSCycle)){
            this.setState({isSCycle: this.props.isSCycle},()=>{
                if(!this.state.isSCycle){
                    this.setState({productTab: 'products', selectedScProductId: -1})
                }
            })
        }

        if(this.props.isSaleCycleUpdated){
            this.setState({nonfilteredSCProducts: this.props.productsWithAnomaly}, () => {
                this.props.updateIsSaleCycleUpdated(false)
                this.handleFilterSCProducts("",true)
            })
        }
    }
    isEditabledisable = () => {
        var retunans = false;
        if(
            /* this.props.simType === "AUI" && 
            (
                (!this.props.isShowFromPreview && this.props.isSetFullScreenEditModal &&
                ((this.props.originatedMpId && this.props.originatedMpId === -1) || (this.props.originatedMpId === this.props.defSaveObj.mp_id)) &&
                ((this.props.storeId > -1) || (this.props.storeId === -1 && this.props.selectedTagList.length > 0))) || 
                
                (!this.props.isShowFromPreview && !this.props.isSetFullScreenEditModal && 
                ((this.props.originatedMpId && this.props.originatedMpId === -1) || (this.props.originatedMpId === this.props.defSaveObj.mp_id)) && 
                ((this.props.storeId > -1) || (this.props.storeId === -1 && this.props.selectedTagList.length > 0)))
            ) */

            this.props.simType === "AUI" && this.props.storeId && this.props.storeId > 0 && 
            this.props.originatedMpId > -1 && this.props.isStoreReset === false
        ){
            retunans = true;
        }
        
        return retunans;
    }
    loadAllBrands = () =>{
        let sobj = {isReqPagination:false}
        submitSets(submitCollection.searchBrand, sobj, false).then(res => {
            var cdata = [{value:0, label:""}];
            if(res && res.status){
                for (let i = 0; i < res.extra.length; i++) {
                    cdata.push({value:res.extra[i].brandId, label:res.extra[i].brandName});
                }
                this.setState({allBrands:cdata});
            } 
        });
    }
    getAllSubCategories = () =>{
        var obj = {isReqPagination:false};
        submitSets(submitCollection.getFullListOfSubCategories, obj, false).then(resp => {
            let arr = [{value:0, label:""}];
            if(resp && resp.status){
                for (let i = 0; i < resp.extra.length; i++) {
                    arr.push({
                        value:resp.extra[i].subCategoryId,
                        label:resp.extra[i].subCategoryName,
                    });
                    
                }
                this.setState({subcategorylist:arr});
            } 
        });
    }

    getAllStatus = () =>{

        let arr = [{value:0, label:""}];

        let statArr = ["Normal","High","Low","No Sales"];
        let enumArr = ["no","high","low","no_data"];

        for(let i=0; i<statArr.length; i++){
            let obj = {
                value: enumArr[i],
                label: statArr[i]
            }
            arr.push(obj);
        }

        this.setState({scFilter_statusList: arr})
    }

    TouchedCatListUpdate=(catid,isrest)=>{
        if(isrest){
            this.setState({TouchedCatRcetList:[]})
        }else{
            var alreadyhave=this.state.TouchedCatRcetList.includes(catid)
            var array=this.state.TouchedCatRcetList
            if(!alreadyhave){
                array.push(catid);
                this.setState({TouchedCatRcetList:array})
            }
        }
    }
    //show warning if sim count not equal to defualt or select any tag or branch
    warningifnotdefualt=()=>{
        var srobj=this.props.simulateSearchObj
        
        if(srobj && ((srobj.fieldCount!==this.props.bottomFieldCount)||(srobj.selectedTagsId.length>0)||srobj.storeId>0) && this.props.isopenfirsttime){
            // this.showvmpbackWarning()
            this.props.toggleopenfirsttime(false)
        }
    }
    showvmpbackWarning=()=>{
        confirmAlert({
            title: this.props.t('WARNING_S'),
            message: this.props.t("THIS_CHANGES_MAYBE_CANNOT_BACKTO_VMP"),
            overlayClassName: (this.props.isRTL === "rtl" ? "alertrtl-content" : ""),
            buttons: [{
                label: this.props.t('OKAY'),
                onClick: () => {
                    return false;
                }
            }]
        });
    }
    //load all tags
    getAllTags = () => {
        let sobj = {isReqPagination: false, type:"store", tagName: ""}
        submitSets(submitCollection.searchTags, sobj).then(res => {
            if(res && res.status && res.extra){
                this.setState({
                    loadedTagsList: res.extra,
                });
            }
        });
    }
    mapobjectsdraw=(type)=>{
        let simLoadedObj = this.props.allCategoryData;
        let actualFieldsCounts = (simLoadedObj?simLoadedObj.actualFieldStructures:[]);
        var cobj = JSON.parse(JSON.stringify(this.state.selectedCatRect));

        if(cobj && cobj.fieldList){
            var cfieldList=cobj.fieldList
            var cproductList=cobj.products
            var cCatList=cobj.categoryList
            // var disabledFeildList = disableFieldShelves(cfieldList,cobj)
            // cfieldList = disabledFeildList.fieldlist;;
            
            var dimention = makeRatiofromhieghestField(cfieldList, this.state.displayUOM, (this.state.catDivHeight - this.state.spacefromtopsvgdraw)); //- this.state.spacefromtopsvgdraw
            this.setState({ displayRatio: dimention }, () => {
                var mapF=makemapFieldObj(cfieldList,this.state.displayUOM,this.state.displayRatio,this.state.catDivHeight, actualFieldsCounts);
                var cmapfieldObj= mapF.mapfieldObj;
                // console.log(cmapfieldObj);
                var cactualFieldStructures=makemapactualFieldObj(structuredClone(this.props.actualFieldStructures),this.state.displayUOM,this.state.displayRatio,this.state.catDivHeight, actualFieldsCounts);
                let previewobj = this.props.selectedSimPreviewObj;
                let previewProdList = (previewobj && previewobj.selectedProds && previewobj.selectedProds.length > 0?previewobj.selectedProds:[]);
                var cmapproductsObj=makemaProductsObj(cproductList,this.state.displayUOM,this.state.displayRatio,cmapfieldObj, this.props.isShowFromPreview, previewProdList);
                var cmapCatList=makemapCatObj(cCatList,this.state.displayUOM,this.state.displayRatio,cmapfieldObj)

                let catRulesList = (cobj.rulesList?cobj.rulesList:[]);
                let cruleWarnings = getAllRuleWarnings(cmapCatList, catRulesList, cmapproductsObj, true);
                let cnotsimprods = (cobj && cobj.non_sim_prodlist?cobj.non_sim_prodlist:[]);
                let replaceProds= (cobj && cobj.replaceProdList?cobj.replaceProdList:[]);
                // var OriprevClipBoardnOtherArray=(this.props.mpstate.mpClipoardnOther.length>0)&&this.props.mpstate.mpClipoardnOther.find(x=>x.mp_id===this.props.defSaveObj.mp_id)
                // var prevClipBoardnOtherArray=OriprevClipBoardnOtherArray?clipBoardRedrawObj(OriprevClipBoardnOtherArray,this.state.displayRatio):undefined

                if(replaceProds.length > 0){
                    replaceProds = replaceProds.sort((a, b) => (a.replacedProducts[0].barcode - b.replacedProducts[0].barcode));
                }
                
                this.setState({
                    actualFieldStructures:cactualFieldStructures.mapfieldObj,
                    actualFieldsCounts: actualFieldsCounts,
                    nonfilteredNonEProducts: cnotsimprods,
                    // productEditWarningsList:cobj.productEditWarningsList?cobj.productEditWarningsList:[],
                    replaceProds:replaceProds,
                    svgdrawDiemention:{drawWidth:mapF.svgWidth,drawHeight:0},
                    mapFields:cmapfieldObj,
                    // isFieldsMatching: disabledFeildList.isfieldsmatching,
                    mapproductList:cmapproductsObj,
                    mapCatRects:cmapCatList,

                    isRuleWarn: cruleWarnings.iswarn,
                    mapRulesList: cruleWarnings.rulelist,
                    
                    historyData: { past: [], present: 0, future: [] },
                    currentInternalDraggableProd: null,
                    currentSelectedBlock: null, 
                    contxtmenu: { isexpand: false },
                    productTab: "products",
                    xrayActive: 4,
                    //clip board cache set commenting
                    // cutArray:prevClipBoardnOtherArray?prevClipBoardnOtherArray.cutpastelist:this.state.cutArray,
                    // removedProductsCounter:prevClipBoardnOtherArray?prevClipBoardnOtherArray.removeprodlist:this.state.removedProductsCounter,
                    // addedProductsCounter:prevClipBoardnOtherArray?prevClipBoardnOtherArray.addprodlist:this.state.addedProductsCounter,
                },()=>{  
                    if(this.state.isSearchprodutDefault){
                        this.handleFilterProducts({target:{value:this.state.productSearchText},nativeEvent:{which: 13}},true)
                    }  
                    if(type==="firsttime"&&(this.props.isFullScreenEdit)){
                        if(this.props.mpstate.mpStackableProdList){
                            var prodlist=this.state.mapproductList
                            //mark show products stack boolean
                            for (let i = 0; i < prodlist.length; i++) {
                                const prod = prodlist[i];
                                var have=this.props.mpstate.mpStackableProdList.find(x=>x.productId===prod.productId)
                                if(have){
                                    prod.isStackable=have.isStackable
                                }
                            }
                            this.setState({mapproductList:prodlist},()=>{
                                this.props.setMpEditStackHistory(null)
                                this.initSVGCreatePoint();
                            })
                        }else{
                            this.props.setMpEditStackHistory(null)
                            this.initSVGCreatePoint();
                        }
                    } else{
                        this.props.setMpEditStackHistory(null)
                        this.initSVGCreatePoint();
                    }  
                    
                    if(type === "firsttime"){
                        //if print pending
                        if(this.props.isPrintPending){
                            this.setState({ isFieldWisePDFPrint: this.props.isFieldWisePDFPrint }, () => {
                                this.excelPrint();
                            });
                        }
                
                        if(this.props.isPDFPrintPending){
                            this.setState({ isFieldWisePDFPrint: this.props.isFieldWisePDFPrint }, () => {
                                this.gotprintStart();
                            });
                        }
                
                        this.props.togglePrintPending(null, false, true);
                    }
                })
                this.drawClipboardfromback()
            })
        }
        
        
    }

    //get pagexy cords
    getPageXYCords = (evt) => {
        this.oriPageXY = {isfirefox: true, x: evt.clientX, y: evt.clientY};
    }
    //shortcuts and arrow key handlers
    typingKeyHandling = (evt) => {
        var ecode = evt.keyCode; //current key code
        if(ecode === 37){ //left arrow
            if(this.state.contxtmenu){
                evt.preventDefault();
                this.dragmultiplyProducts("left");
            }
        } else if(ecode === 39){ //right arrow
            if(this.state.contxtmenu){
                evt.preventDefault();
                this.dragmultiplyProducts("right");
            }
        } else if(ecode === 46){
            this.pressShortcuts("delete")

        } else  if ((evt.ctrlKey || evt.metaKey) && ecode === 88) {
            this.pressShortcuts("cut")
        } else  if ((evt.ctrlKey || evt.metaKey) && ecode === 67) {
            this.pressShortcuts("copy")
        }else  if ((evt.ctrlKey || evt.metaKey) && ecode === 90) {
            this.pressShortcuts("undo")
        }else  if ((evt.ctrlKey || evt.metaKey) && ecode === 89) {
            this.pressShortcuts("redo")
        }
        else{
           
           
        }
    }
    pressShortcuts=(type)=>{
        if(!(this.state.isviewcmenu||this.state.isviewcmenu2)){
            var selcurobj = this.state.currentInternalDraggableProd; 
            if(selcurobj&&this.state.currentSelectedBlock){
                if(type==="delete"){
                    this.handleBlockCut(false,true)
                }else if(type==="cut"){
                    this.handleBlockCut(false,false)
                }else if(type==="copy"){
                    this.handleBlockCut(true,false)
                }
            }
            if(type==="undo"){
                if(this.state.historyData.past.length>0 ){
                    this.fieldHistoryUndo()
                }
            }else{
                if(type==="redo"){
                    if(this.state.historyData.future.length>0 ){
                        this.fieldHistoryRedo()
                    }
                }
            }
        }
    }
    // cacheClipboardandOther=()=>{
    //     let removeprodlist = JSON.parse(JSON.stringify(this.state.removedProductsCounter));
    //     let addprodlist = JSON.parse(JSON.stringify(this.state.addedProductsCounter));
    //     let cutpastelist = JSON.parse(JSON.stringify(this.state.cutArray));
    //     var prevclipboardarray=this.props.mpstate.mpClipoardnOther
    //     // var filteredPrevclipboardarray=(prevclipboardarray.length>0)?prevclipboardarray.filter(x=>x.catId!==this.state.selectedCatRect.selectedCat.id):[]
    //     var filteredPrevclipboardarray=(prevclipboardarray.length>0)?prevclipboardarray.filter(x=>x.mp_id!==this.props.defSaveObj.mp_id):[]

    //     var obj={
    //         // catId:this.state.selectedCatRect.selectedCat.id,
    //         mp_id:this.props.defSaveObj.mp_id,
    //         addprodlist:addprodlist,
    //         removeprodlist:removeprodlist,
    //         cutpastelist:cutpastelist,
    //     }
    //     filteredPrevclipboardarray.push(obj)

    //     this.props.setMpClipBoardsforCats(filteredPrevclipboardarray)
    // }
    // cacheClipboardandOtherOnlyCutProdsReplace=()=>{
    //     let cutpastelist =this.state.cutArray;
    //     var prevclipboardarray=this.props.mpstate.mpClipoardnOther
    //     // var filteredPrevclipboardarray=(prevclipboardarray.length>0)?prevclipboardarray.filter(x=>x.catId!==this.state.selectedCatRect.selectedCat.id):[]
    //     // var havesamecat=(prevclipboardarray.length>0)?prevclipboardarray.find(y=>y.catId===this.state.selectedCatRect.selectedCat.id):undefined
    //     var filteredPrevclipboardarray=(prevclipboardarray.length>0)?prevclipboardarray.filter(x=>x.mp_id!==this.props.defSaveObj.mp_id):[]
    //     var havesamecat=(prevclipboardarray.length>0)?prevclipboardarray.find(y=>y.mp_id===this.props.defSaveObj.mp_id):undefined
    //     var obj={
    //         // catId:this.state.selectedCatRect.selectedCat.id,
    //         mp_id:this.props.defSaveObj.mp_id,
    //         addprodlist:[],
    //         removeprodlist:[],
    //         cutpastelist:cutpastelist,
    //     }
    //     if(havesamecat){
    //         var obj2=havesamecat
    //         obj2["cutpastelist"]=cutpastelist
    //         filteredPrevclipboardarray.push(obj2)

    //     }else{
    //         filteredPrevclipboardarray.push(obj)
    //     }
       

    //     this.props.setMpClipBoardsforCats(filteredPrevclipboardarray)
    // }
    //manage changes history
    fieldHistoryAdd = (csobj, type) => {
        ///type=1 add item, type=2 delete item, type=3 move item

        let removeprodlist = JSON.parse(JSON.stringify(this.state.removedProductsCounter));
        let addprodlist = JSON.parse(JSON.stringify(this.state.addedProductsCounter));
        // let cutpastelist = JSON.parse(JSON.stringify(this.state.cutArray));
        let cutnewpastelist = JSON.parse(JSON.stringify(this.state.cutNewArray));
        let rulelist = JSON.parse(JSON.stringify(this.state.mapRulesList));
        let isrulewarn = JSON.parse(JSON.stringify(this.state.isRuleWarn));
        let nonrelateprods = JSON.parse(JSON.stringify(this.state.nonfilteredNonEProducts));

        var chobj = this.state.historyData;
        var phistry = (chobj.past?chobj.past:[]);

        phistry.push({ type:type, obj:csobj, removeprodlist: removeprodlist, addprodlist: addprodlist, 
            // cutarray: cutpastelist,
             cutarray: cutnewpastelist,
             rulelist: rulelist, isrulewarn: isrulewarn, 
            nonrelateprods: nonrelateprods });
        chobj["present"] = 0;
        chobj["past"] = phistry; chobj["future"] = [];
        if(this.state.selectedCatRect.selectedCat){
            // chobj["CatId"]=this.state.selectedCatRect.selectedCat.id
            chobj["mp_id"]=this.props.defSaveObj.mp_id
        }
        
        this.setState({ historyData: chobj },()=>{
            this.props.setMpEditStackHistory(this.state.historyData)
            // this.cacheClipboardandOther()
            
        });
    }
    readandmarkStackblefromredux=()=>{
        if(this.props.mpstate.mpStackableProdList!==null&&this.props.mpstate.mpStackableProdList.length>0){
            var prodlist=this.state.mapproductList
            //mark show products stack boolean
            for (let i = 0; i < prodlist.length; i++) {
                const prod = prodlist[i];
                var have=this.props.mpstate.mpStackableProdList.find(x=>x.productId===prod.productId)
                if(have){
                    prod.isStackable=have.isStackable
                }
            }
            this.setState({mapproductList:prodlist},()=>{
            })
        }
    }
    //remark stackables in redo undo
    //undo changes hisory
    fieldHistoryUndo = () => {
        let removeprodlist = JSON.parse(JSON.stringify(this.state.removedProductsCounter));
        let addprodlist = JSON.parse(JSON.stringify(this.state.addedProductsCounter));
        let cutnewpastelist = JSON.parse(JSON.stringify(this.state.cutNewArray));
        let rulelist = JSON.parse(JSON.stringify(this.state.mapRulesList));
        let isrulewarn = JSON.parse(JSON.stringify(this.state.isRuleWarn));
        let nonrelateprods = JSON.parse(JSON.stringify(this.state.nonfilteredNonEProducts));

        var chobj = this.state.historyData;
        var backidx = (chobj.present>0?(chobj.present - 1):(chobj.past.length - 1));
        var getsobj = chobj.past[backidx];
        var cfutureobj = { type:getsobj.type, obj:JSON.parse(JSON.stringify(this.state.mapproductList)), removeprodlist: removeprodlist, addprodlist: addprodlist, 
            cutarray:cutnewpastelist,
             rulelist: rulelist, isrulewarn: isrulewarn,
            nonrelateprods: nonrelateprods };
        
        chobj.future.push(cfutureobj);
        chobj.past.splice(-1,1);
        // chobj["CatId"]=this.state.selectedCatRect.selectedCat.id
        chobj["mp_id"]=this.props.defSaveObj.mp_id
        
        this.setState({ mapproductList: null }, () => {
            this.setState({ 
                mapproductList: getsobj.obj, historyData: chobj,
                removedProductsCounter: getsobj.removeprodlist, addedProductsCounter: getsobj.addprodlist,
                cutNewArray:getsobj.cutarray,
                 mapRulesList: getsobj.rulelist, isRuleWarn: getsobj.isrulewarn, currentInternalDraggableProd: null, currentSelectedBlock: null, contxtmenu: { isexpand: false },
                nonfilteredNonEProducts: getsobj.nonrelateprods, 
            }, () => {
                if(this.props.simType === "AUI" || this.props.simType === "Normal"){
                    // const combinedPrds = this.state.mapproductList.concat(this.state.filteredOtherPrds).filter(prd=>prd.isDelete !== true)
                    const combinedPrds = this.state.mapproductList.filter(prd=>prd.isDelete !== true)
                    this.props.getProductAnomalies(this.props.mapFields, this.props.mapCategories, combinedPrds)
                }
                
                this.props.setMpEditStackHistory(this.state.historyData)
                // this.cacheClipboardandOther()
                this.handleFilterNoEProducts("");
                //remark stackable to display
                this.readandmarkStackblefromredux();
                //reload imported product update 
                this.compareImportedProds();
            });
        });
    }
    //redo changes hisory
    fieldHistoryRedo = () => {

        let removeprodlist = JSON.parse(JSON.stringify(this.state.removedProductsCounter));
        let addprodlist = JSON.parse(JSON.stringify(this.state.addedProductsCounter));
        // let cutpastelist = JSON.parse(JSON.stringify(this.state.cutArray));
        let cutnewpastelist = JSON.parse(JSON.stringify(this.state.cutNewArray));
        let rulelist = JSON.parse(JSON.stringify(this.state.mapRulesList));
        let isrulewarn = JSON.parse(JSON.stringify(this.state.isRuleWarn));
        let nonrelateprods = JSON.parse(JSON.stringify(this.state.nonfilteredNonEProducts));

        var chobj = this.state.historyData;
        var backidx = (chobj.present>0?(chobj.present + 1):(chobj.future.length - 1));
        var getsobj = chobj.future[backidx];
        var cpastobj = { type:getsobj.type, obj:JSON.parse(JSON.stringify(this.state.mapproductList)), removeprodlist: removeprodlist, addprodlist: addprodlist, 
            // cutarray: cutpastelist,
            cutarray:cutnewpastelist,
             rulelist: rulelist, isrulewarn: isrulewarn,
            nonrelateprods: nonrelateprods };
        
        chobj.past.push(cpastobj);
        chobj.future.splice(-1,1);
        // chobj["CatId"]=this.state.selectedCatRect.selectedCat.id
        chobj["mp_id"]=this.props.defSaveObj.mp_id
        this.setState({ mapproductList: null }, () => {
            this.setState({ mapproductList: getsobj.obj, historyData: chobj, 
                removedProductsCounter: getsobj.removeprodlist, addedProductsCounter: getsobj.addprodlist,
                // cutArray: getsobj.cutarray, 
                cutNewArray:getsobj.cutarray,
                mapRulesList: getsobj.rulelist, isRuleWarn: getsobj.isrulewarn, currentInternalDraggableProd: null, currentSelectedBlock: null, contxtmenu: { isexpand: false }, 
                nonfilteredNonEProducts: getsobj.nonrelateprods,
            }, () => {
                if(this.props.simType === "AUI" || this.props.simType === "Normal"){
                    // const combinedPrds = this.state.mapproductList.concat(this.state.filteredOtherPrds).filter(prd=>prd.isDelete !== true)
                    const combinedPrds = this.state.mapproductList.filter(prd=>prd.isDelete !== true)
                    this.props.getProductAnomalies(this.props.mapFields, this.props.mapCategories, combinedPrds)
                }

                this.props.setMpEditStackHistory(this.state.historyData)
                // this.cacheClipboardandOther()
                this.handleFilterNoEProducts("");
                //remark stackable to display
                this.readandmarkStackblefromredux();
                //reload imported product update 
                this.compareImportedProds();
            });
        });
    }
    fieldHistoryReset=(type,isFullSCEdit)=>{
        // let removeprodlist = JSON.parse(JSON.stringify(this.state.removedProductsCounter));
        // let addprodlist = JSON.parse(JSON.stringify(this.state.addedProductsCounter));
        // let cutpastelist = JSON.parse(JSON.stringify(this.state.cutArray));
        // let rulelist = JSON.parse(JSON.stringify(this.state.mapRulesList));
        // let isrulewarn = JSON.parse(JSON.stringify(this.state.isRuleWarn));
        // let nonrelateprods = JSON.parse(JSON.stringify(this.state.nonfilteredNonEProducts));

        var chobj = this.state.historyData;
        // var chobj =this.props.mpstate.mpstackHistory
        var getsobj = chobj.past[0];
        // var cfutureobj = { type:getsobj.type, obj:JSON.parse(JSON.stringify(this.state.mapproductList)), removeprodlist: removeprodlist, addprodlist: addprodlist, cutarray: cutpastelist, rulelist: rulelist, isrulewarn: isrulewarn,
        //     nonrelateprods: nonrelateprods };
        
        chobj.future=[]
        chobj.past=[]
        this.setState({ mapproductList: null }, () => {
            this.setState({ 
                mapproductList: getsobj.obj, historyData: chobj,
                removedProductsCounter: getsobj.removeprodlist, addedProductsCounter: getsobj.addprodlist,
                // cutArray: getsobj.cutarray,
                cutNewArray:getsobj.cutarray,
                 mapRulesList: getsobj.rulelist, isRuleWarn: getsobj.isrulewarn, currentInternalDraggableProd: null, currentSelectedBlock: null, contxtmenu: { isexpand: false },
                nonfilteredNonEProducts: getsobj.nonrelateprods, 
            }, () => {
                if(this.props.simType === "AUI" || this.props.simType === "Normal"){
                    // const combinedPrds = this.state.mapproductList.concat(this.state.filteredOtherPrds).filter(prd=>prd.isDelete !== true)
                    const combinedPrds = this.state.mapproductList.filter(prd=>prd.isDelete !== true)
                    this.props.getProductAnomalies(this.props.mapFields, this.props.mapCategories, combinedPrds)
                }

                if(type==="switchfullSCEdit"){
                    this.handleFullscreenEditMethodcall(isFullSCEdit)
                }

                
                this.props.setMpEditStackHistory(this.state.historyData)
                this.handleFilterNoEProducts("");
                //remark stackable to display
                this.readandmarkStackblefromredux();
                //reload imported product update 
                this.compareImportedProds();
            });
        });
    }
    //#MP-SML-E-03
    dragmultiplyProducts = (angle) => {
        var cprodlist = JSON.parse(JSON.stringify(this.state.mapproductList));
        var cisexpand = (this.state.contxtmenu && this.state.contxtmenu.isexpand?true:false);
        var selcurobj = this.state.currentInternalDraggableProd; //get current selected prod
        let selecteBlockobj = this.state.currentSelectedBlock;
     
        //is it selected
        let cshelf = null;
        if(cprodlist && selcurobj){
            var currentlySelectedProd = cprodlist[selcurobj.prodidx];
            
            if (currentlySelectedProd) {
                let selectedfield = this.state.mapFields[currentlySelectedProd.field_custom_id];
                cshelf = selectedfield.shelf.find(x => x.rank === currentlySelectedProd.shelfrank);

                //create new product object to check object
                var newProd = JSON.parse(JSON.stringify(currentlySelectedProd));
                
                newProd.id = uuidv4();
                newProd.productId = currentlySelectedProd.productId;
                newProd.isNew = true;
                
                if (angle === "left") {
                    newProd.x = currentlySelectedProd.x - (cisexpand?currentlySelectedProd.drawWidth:1);
                    newProd.y = currentlySelectedProd.y;

                } else if (angle === "right") {
                    newProd.x = currentlySelectedProd.x + (cisexpand?currentlySelectedProd.drawWidth:1);
                    newProd.y = currentlySelectedProd.y;
                    
                }

                if (newProd) {
                    //block change position otherwise
                    if(selecteBlockobj && Object.keys(selecteBlockobj).length > 0){
                        this.changeBlockPosition(cshelf, angle);
                        //move by arrows
                    } else{
                        if(this.state.contxtmenu && this.state.contxtmenu.isexpand){
                            //expand by arows
                            this.multiplyProductToDropZone(cshelf, newProd, currentlySelectedProd);
                        } else{
                            this.changeProdPosition(cshelf, newProd, currentlySelectedProd, angle);
                        }
                    }
                }
            }
        }
    }
    //change selected block position
    changeBlockPosition = (shelf, changeangle) => {
        let selecteBlockobj = this.state.currentSelectedBlock;
        let mapprodList = this.state.mapproductList;
        
        if(selecteBlockobj){
            let reduceamount = (changeangle === "left"?-1:1)

            if(selecteBlockobj.selectedshelves && selecteBlockobj.selectedshelves.length === 1){
                let shelfcontainlist = mapprodList.filter(x => !x.isDelete && x.shelfrank === shelf.rank);
                
                //check through products
                var allowToAdd = true;

                var xa1 = roundOffDecimal((selecteBlockobj.x + reduceamount),2);
                var ya1 = roundOffDecimal(selecteBlockobj.y,2);
                var xb1 = roundOffDecimal((selecteBlockobj.x + selecteBlockobj.drawWidth + reduceamount),2);
                var yb1 = roundOffDecimal((selecteBlockobj.y + selecteBlockobj.drawHeight),2);

                //check on box
                var shelveCheck = checkOnShelfBox(xa1, ya1, xb1, yb1, shelf, selecteBlockobj.drawWidth, selecteBlockobj.drawHeight, this.state.checkSaftyMargin);
                // console.log(shelveCheck);

                if(!shelveCheck.boxAllow){
                    let shelftx2 = (shelf.x + shelf.drawWidth);
                    let blockx2 = (selecteBlockobj.x + selecteBlockobj.drawWidth);

                    if((changeangle === "right" && (shelftx2 - blockx2) > 0 && (shelftx2 - blockx2) <= 1)){
                        reduceamount = (shelftx2 - blockx2);

                        xa1 = roundOffDecimal((xa1 + reduceamount),2);
                        xb1 = roundOffDecimal((xb1 + reduceamount),2);

                        shelveCheck.boxAllow = true;
                        // console.log(changeangle, reduceamount);
                    }

                    if((changeangle === "left" && (selecteBlockobj.x - shelf.x) > 0 && (selecteBlockobj.x - shelf.x) <= 1)){
                        reduceamount = (selecteBlockobj.x - shelf.x);

                        xa1 = roundOffDecimal((selecteBlockobj.x - reduceamount),2);
                        xb1 = roundOffDecimal(((selecteBlockobj.x + selecteBlockobj.drawWidth) - reduceamount),2);

                        shelveCheck.boxAllow = true;
                        // console.log(changeangle, reduceamount);

                        reduceamount = (reduceamount * -1);
                    }
                }

                if (shelveCheck.boxAllow) {
                    //check it's allow to move to that direction - see any products overlapping
                    for (let k = 0; k < shelfcontainlist.length; k++) {
                        const productLocation = shelfcontainlist[k];

                        //if not current product
                        let isidnotfound = selecteBlockobj.newDrawingProducts.findIndex(z => z.id === productLocation.id);
                        if (isidnotfound === -1) {
                            var x1 = roundOffDecimal(productLocation.x,2);
                            var y1 = roundOffDecimal(productLocation.y,2);
                            var x2 = roundOffDecimal((x1 + productLocation.drawWidth),2);
                            var y2 = roundOffDecimal((y1 + productLocation.drawHeight),2);

                            var checkProdOverlapping = checkThroughProductsTest(xa1, ya1, xb1, yb1, x1, y1, x2, y2)
                            if (!checkProdOverlapping) {
                                allowToAdd = false;

                                //if snapping missing from small space in products
                                let blockx2 = (selecteBlockobj.x + selecteBlockobj.drawWidth);

                                if((changeangle === "right" && (x1 - blockx2) > 0 && (x1 - blockx2) <= 1)){
                                    reduceamount = (x1 - blockx2);
            
                                    xa1 = roundOffDecimal((xa1 + reduceamount),2);
                                    xb1 = roundOffDecimal((xb1 + reduceamount),2);
            
                                    allowToAdd = true;
                                    // console.log(changeangle, reduceamount);
                                }
            
                                if((changeangle === "left" && (selecteBlockobj.x - x2) > 0 && (selecteBlockobj.x - x2) <= 1)){
                                    reduceamount = (selecteBlockobj.x - x2);
            
                                    xa1 = roundOffDecimal((xa1 - reduceamount),2);
                                    xb1 = roundOffDecimal((xb1 - reduceamount),2);
            
                                    allowToAdd = true;
                                    // console.log(changeangle, reduceamount);

                                    reduceamount = (reduceamount * -1);
                                }

                                break;
                            }
                        }
                    }

                    if (allowToAdd) {
                        this.TouchedCatListUpdate(selecteBlockobj.newDrawingProducts[0].categoryRectId)
                        this.fieldHistoryAdd(JSON.parse(JSON.stringify(this.state.mapproductList)),3);

                        for (let i = 0; i < selecteBlockobj.newDrawingProducts.length; i++) {
                            const newdrawprod = selecteBlockobj.newDrawingProducts[i];
                            mapprodList[newdrawprod.prodidx].x = (mapprodList[newdrawprod.prodidx].x + reduceamount);
                        }
        
                        selecteBlockobj.x = (selecteBlockobj.x + reduceamount);
        
                        this.setState({ currentSelectedBlock: selecteBlockobj, mapproductList: mapprodList },()=>{
                            if(this.props.simType === "AUI" || this.props.simType === "Normal"){
                                // const combinedPrds = this.state.mapproductList.concat(this.state.filteredOtherPrds)
                                const combinedPrds = this.state.mapproductList
                                this.props.getProductAnomalies(this.props.mapFields, this.props.mapCategories, combinedPrds)
                            }
                        });
                        this.props.handlehaveChnagesinCat(true);
                    }    
                }
                
            } else{
                alertService.error(this.props.t("CANNOT_CHANGEPOSITION_OF_MORETHANONE_SHELF"));
            }
        }
        
    }
    //change product position
    changeProdPosition = (shelf, changeLocation, selctedProd, changeangle) => {
        if (shelf && changeLocation) {
            var xa1 = roundOffDecimal(changeLocation.x,2);
            var ya1 = roundOffDecimal(changeLocation.y,2);
            var xb1 = roundOffDecimal((changeLocation.x + changeLocation.drawWidth),2);
            var yb1 = roundOffDecimal((changeLocation.y + changeLocation.drawHeight),2);

            //check on box
            var shelveCheck = checkOnShelfBox(xa1, ya1, xb1, yb1, shelf, changeLocation.drawWidth, changeLocation.drawHeight, this.state.checkSaftyMargin);
            
            if(!shelveCheck.boxAllow){
                let shelftx2 = (shelf.x + shelf.drawWidth);
                let prodx2 = (changeLocation.x + changeLocation.drawWidth);

                if((changeangle === "right" && (shelftx2 - prodx2) > 0 && (shelftx2 - prodx2) <= 1)){
                    let canSnapAmount = (shelftx2 - prodx2);

                    xa1 = roundOffDecimal((xa1 + canSnapAmount),10);
                    xb1 = roundOffDecimal((xb1 + canSnapAmount),10);

                    shelveCheck.boxAllow = true;
                    // console.log(changeangle, canSnapAmount);
                }

                if((changeangle === "left" && (changeLocation.x - shelf.x) > 0 && (changeLocation.x - shelf.x) <= 1)){
                    let canSnapAmount = (changeLocation.x - shelf.x);

                    xa1 = roundOffDecimal((xa1 - canSnapAmount),10);
                    xb1 = roundOffDecimal((xb1 - canSnapAmount),10);

                    shelveCheck.boxAllow = true;
                    // console.log(changeangle, canSnapAmount);
                }
            }

            if (shelveCheck.boxAllow) {
                let cprodlist = JSON.parse(JSON.stringify(this.state.mapproductList));

                let shelfcontainlist = cprodlist.filter(x => !x.isDelete && x.shelfrank === shelf.rank);

                //check through products
                var allowToAdd = true;

                //check it's allow to move to that direction - see any products overlapping
                for (let k = 0; k < shelfcontainlist.length; k++) {
                    const productLocation = shelfcontainlist[k];

                    //if not current product
                    if (productLocation.id !== selctedProd.id) {
                        var x1 = roundOffDecimal(productLocation.x,2);
                        var y1 = roundOffDecimal(productLocation.y,2);
                        var x2 = roundOffDecimal((x1 + productLocation.drawWidth),2);
                        var y2 = roundOffDecimal((y1 + productLocation.drawHeight),2);

                        var checkProdOverlapping = checkThroughProductsTest(xa1, ya1, xb1, yb1, x1, y1, x2, y2)
                        if (!checkProdOverlapping) {
                            allowToAdd = false;

                            //if snapping missing from small space in products
                            let prodx2 = (changeLocation.x + changeLocation.drawWidth);

                            if((changeangle === "right" && (x1 - prodx2) > 0 && (x1 - prodx2) <= 1)){
                                let canSnapAmount = (x1 - prodx2);
        
                                xa1 = roundOffDecimal((xa1 + canSnapAmount),10);
                                xb1 = roundOffDecimal((xb1 + canSnapAmount),10);
        
                                allowToAdd = true;
                                // console.log(changeangle, canSnapAmount);
                            }
        
                            if((changeangle === "left" && (productLocation.x - x2) > 0 && (productLocation.x - x2) <= 1)){
                                let canSnapAmount = (productLocation.x - x2);
        
                                xa1 = roundOffDecimal((xa1 - canSnapAmount),10);
                                xb1 = roundOffDecimal((xb1 - canSnapAmount),10);
        
                                allowToAdd = true;
                                // console.log(changeangle, canSnapAmount);
                            }

                            break;
                        }
                    }
                }
                
                if (allowToAdd) {
                    this.TouchedCatListUpdate(selctedProd.categoryRectId)
                    this.fieldHistoryAdd(JSON.parse(JSON.stringify(this.state.mapproductList)),3);

                    var cselprod = this.state.currentInternalDraggableProd;
                    var changeprod = cprodlist[cselprod.prodidx];

                    //update change location x,y
                    if(changeprod){
                        changeprod.x = xa1;
                        changeprod.y = changeLocation.y;
                    }

                    this.setState({ mapproductList: cprodlist },()=>{
                        if(this.props.simType === "AUI" || this.props.simType === "Normal"){
                            // const combinedPrds = this.state.mapproductList.concat(this.state.filteredOtherPrds)
                            const combinedPrds = this.state.mapproductList
                            this.props.getProductAnomalies(this.props.mapFields, this.props.mapCategories, combinedPrds)
                        }
                    });
                    this.props.handlehaveChnagesinCat(true);
                }
            }
        }
    }
    //multiply product validations
    multiplyProductToDropZone = (shelf, addingProduct, changeProduct) => {
        if (shelf && addingProduct) {
                var cprodlist = JSON.parse(JSON.stringify(this.state.mapproductList));
                let fieldobj = this.state.mapFields[shelf.field_custom_id];
                // console.log(fieldobj);

                //create x,y box of current product
                var xa1 = roundOffDecimal(addingProduct.x,2)
                var ya1 = roundOffDecimal(addingProduct.y,2)
                
                //check allow to add that location - retuns boolean
                let allowToAdd = checkAllowToAdd(null, shelf, addingProduct, xa1, ya1, this.state.checkSaftyMargin);
                //if allow to multiply product
                if (allowToAdd.allowToAdd) {
                    let findsameShelftItems = cprodlist.filter(z => !z.isDelete && z.shelfrank === shelf.rank);
                    
                    let checkx1 = roundOffDecimal((xa1 + this.state.checkSaftyMargin), 2);
                    let boxx2 = roundOffDecimal((xa1 + addingProduct.drawWidth - this.state.checkSaftyMargin),2);
                    let boxy2 = roundOffDecimal((ya1 + addingProduct.drawHeight),2);
                    
                    var containProds = GetContainingProdsByBox(checkx1, ya1, boxx2, boxy2, findsameShelftItems, fieldobj);
                    // console.log("loc 4",checkx1, ya1, boxx2, boxy2, findsameShelftItems, fieldobj)
                    if(containProds.selectedProds && containProds.selectedProds.length === 0){
                        this.fieldHistoryAdd(JSON.parse(JSON.stringify(this.state.mapproductList)),1);

                        //get current product details
                        var csprodobj = this.state.currentInternalDraggableProd;
                        
                        var plocobj = addingProduct;
                        plocobj.x = xa1;
                        plocobj.y = ya1;

                        //if is item sub cat is rule
                        let isruleupdating = false;
                        if(plocobj.subcategory && plocobj.subcategory.type === catRectEnums.rule){
                            //find if rule brand available
                            let scatruleid = getNameorIdorColorofBox(plocobj.subcategory, "num");
                            let scatrulelevel = (plocobj.subcategory.rule?plocobj.subcategory.rule.level:null);
                            
                            let findfromrules = findRuleAvailableForBrand(scatruleid, true, scatrulelevel, this.state.mapRulesList);
                            // console.log(findfromrules);

                            if(findfromrules.isavailable){
                                isruleupdating = {parentidx: findfromrules.ruleparentidx, ruleidx: findfromrules.ruleidx};
                            }
                        }
    
                        cprodlist.push(plocobj);
                       
                        csprodobj.prodidx = (cprodlist.length - 1);
                        csprodobj.prod = plocobj;
    
                        this.setState({ mapproductList: cprodlist, currentInternalDraggableProd: csprodobj }, () => {
                            //check non sim render count and display mange
                            this.nonSimProddropremoveCounterupdate("DropfromClipboard")
                            this.TouchedCatListUpdate(plocobj.categoryRectId)
                            //update rule list if item sub cat is rule

                            if(this.props.simType === "AUI" || this.props.simType === "Normal"){
                                // const combinedPrds = this.state.mapproductList.concat(this.state.filteredOtherPrds)
                                const combinedPrds = this.state.mapproductList.filter(prd => prd.isDelete !== true)
                                this.props.getProductAnomalies(this.props.mapFields, this.props.mapCategories, combinedPrds)
                            }

                            if(isruleupdating){
                                let updaterulelist = getAllRuleWarnings(this.state.mapCatRects, this.state.mapRulesList, this.state.mapproductList, false, true, isruleupdating);
                                // console.log(updaterulelist);
                                
                                this.setState({ mapRulesList: updaterulelist.rulelist, isRuleWarn: updaterulelist.iswarn });
                            }

                            //reload imported product update 
                            this.compareImportedProds();
                        });
                        this.props.handlehaveChnagesinCat(true);

                        if(changeProduct.isDropNew){
                            this.handleAddProductCounter(addingProduct, 1);
                        }
                    } else{
                        alertService.error(this.props.t("CANNOT_EXPAND_PROD_ANOTHER_EXIST"));
                    }
                }
        }

    }
    //changing screens of search and drop product panel and show log
    toggleprodAddNProdpanel=()=>{
        this.setState({isAddProucts:!this.state.isAddProucts, filteredProdList: []})
    }
    //click add product
    handleAddProduct=()=>{
        if(this.state.isStackableEdited){
            this.sendmarkStackableCall()
        }
        this.toggleprodAddNProdpanel();
    }
    //init svg create point
    initSVGCreatePoint = () => {
        if(this.drawSVG && this.drawSVG.createSVGPoint){
            this.svgCreatePoint = this.drawSVG.createSVGPoint();
        }
    }
    //onenter search prod list
    handleFilterProducts = (evt,isdefualt) => {
       
        var ctxt = evt.target.value;
        this.setState({productSearchText:ctxt})
        if(evt.nativeEvent.which === 13){
            this.setState({filteredProdList: [], pstartpage: 1,}, () => {
                this.searchProdList(ctxt,0,isdefualt);
            });
        }
    }
     //onenter search prod list
     handleFilterNoEProducts = (ctxt,isReSerach) => {
        let searchTxt = (ctxt && ctxt.length > 0?ctxt:"");

        this.setState({ noSim_filter: isReSerach?this.state.noSim_filter:searchTxt },()=>{
            if(this._nosimulateprodTimeOut){ clearTimeout(this._nosimulateprodTimeOut); }
          
            this._nosimulateprodTimeOut = setTimeout(() => {
                var nonladpros = JSON.parse(JSON.stringify(this.state.nonfilteredNonEProducts));

                for (let i = 0; i < nonladpros.length; i++) {
                    const nonladprod = nonladpros[i];
                    let nonSearchQuery = ((nonladprod.barcode?nonladprod.barcode.toLowerCase():"")+" "+(nonladprod.productName?nonladprod.productName.toLowerCase():""));
                    // nonladprod.isFilterd = !((nonladprod.productName.toLowerCase().includes(ctxt.toLowerCase()))||nonladprod.barcode.toLowerCase().includes(ctxt.toLowerCase()));
                    let isnotfiltered=(nonSearchQuery.includes(this.state.noSim_filter.toLowerCase()) 
                    && (parseInt(this.state.selectedNonSimFilterCat.value)===-1?true:nonladprod.categoryId===this.state.selectedNonSimFilterCat.value)
                    && (parseInt(this.state.selectedNonSimFiltersubCat.value)===-1?true:nonladprod.subCategoryId===this.state.selectedNonSimFiltersubCat.value)
                    && (parseInt(this.state.selectedNonSimFilterBrand.value)===-1?true:nonladprod.brandId===this.state.selectedNonSimFilterBrand.value)
                    && (parseInt(this.state.selectedNonSimFilterSupp.value)===-1?true:nonladprod.supplierId===this.state.selectedNonSimFilterSupp.value)
                    );

                    nonladprod.isFilterd = !isnotfiltered
                }
             
              // filteredNonEProducts:this.props.non_sim_prodlist
              this.setState({nonfilteredNonEProducts:nonladpros})
             }, 200);

        })
         
    }
     handleFilterSCProducts = (ctxt,isReSerach) => {
        let searchTxt = (ctxt && ctxt.length > 0?ctxt:"");

        this.setState({ sc_filter: isReSerach?this.state.sc_filter:searchTxt },()=>{
            if(this._scprodTimeOut){ clearTimeout(this._scprodTimeOut); }
          
            this._scprodTimeOut = setTimeout(() => {
                var scladprods = JSON.parse(JSON.stringify(this.props.productsWithAnomaly));

                for (let i = 0; i < scladprods.length; i++) {
                    const scladprod = scladprods[i];
                    let nonSearchQuery = ((scladprod.productBarcode?scladprod.productBarcode.toLowerCase():"")+" "+(scladprod.productName?scladprod.productName.toLowerCase():""));
                    let isnotfiltered=(nonSearchQuery.includes(this.state.sc_filter.toLowerCase()) 
                    && (parseInt(this.state.selectedScFilterCat.value)===-1?true:scladprod.categoryId===this.state.selectedScFilterCat.value)
                    && (parseInt(this.state.selectedScFiltersubcat.value)===-1?true:scladprod.subCategoryId===this.state.selectedScFiltersubcat.value)
                    && (parseInt(this.state.selectedScFilterBrand.value)===-1?true:scladprod.brandId===this.state.selectedScFilterBrand.value)
                    && (parseInt(this.state.selectedScFilterSupp.value)===-1?true:scladprod.supplierId===this.state.selectedScFilterSupp.value)
                    && (parseInt(this.state.selectedScFilterStat.value)===-1?true:scladprod.anomaly===this.state.selectedScFilterStat.value)
                    );

                    scladprod.isFilterd = !isnotfiltered
                }

                scladprods = scladprods.filter(x=>x.isFilterd===false);

                scladprods.sort((a, b) =>  b.salesCycle - a.salesCycle );
             
              this.setState({nonfilteredSCProducts:scladprods})
             }, 200);

        })
         
    }

    showSelectedSCProduct = (id) => {
        if(id === this.state.selectedScProductId){
            this.setState({selectedScProductId: -1});
        }else{
            this.setState({selectedScProductId: id});
        }
    }

    //search products list view
    searchProdList = (ctxt,startidx,isdefualt) => {
        // let defSaveObj = this.props.defSaveObj;
        let allcatrects = this.state.mapCatRects;

        if(allcatrects && Object.keys(allcatrects).length > 0){
           
            let psobj = {
                productName: ctxt,
                isReqPagination: true,
                startIndex: startidx,
                maxResult: this.state.pmaxcount, 
                withImageUrl: true,
                // departmentId: (defSaveObj && defSaveObj.department?(defSaveObj.department.department_id?defSaveObj.department.department_id:defSaveObj.department.id):-1),//no need of this to new call
                // category_id: selcatid,
                // isRuleBased: isrulebased,
                // rule: ruleobj
            }


            this.setState({srchprodsloading: true});
            // submitSets(submitCollection.findProdByCategoryLevel, psobj, true).then(res => {
            submitSets(submitCollection.getProductList, psobj, true).then(res => {
                var cdata = this.state.filteredProdList;
                this.setState({srchprodsloading: false,isSearchprodutDefault:isdefualt?false:this.state.isSearchprodutDefault});
                if(res && res.status){
                    for (var i = 0; i < res.extra.length; i++) {
                        cdata.push(res.extra[i]);
                    }
                    this.setState({ filteredProdList: cdata, pstartpage: startidx });
                    if(startidx === 0){
                        this.setState({ptotalresults: res.count});
                    }
                } else{
                    alertService.error(this.props.t('NO_RESULT_FOUND'));
                    this.setState({ filteredProdList: cdata });
                }
            });
        }
    }
     //copy barcode to clipboard message show
    copyToClipboard = (ctxt) => {
        alertService.info(this.props.t("COPIED_TO_CLIP_BOARD"));
    }
    //toggle products view
    toggleProdListView = (cstat) => {
        this.setState({isListViewActive: null}, () => {
            setTimeout(() => {
                this.setState({isListViewActive: cstat});
            }, 200);
        });
    }
    //onclick load more button in search
    loadMoreProds = () => {
        //add maxcount to current start index
        var cstarttxt = (this.state.pstartpage === 0?(this.state.pmaxcount):(this.state.pstartpage + this.state.pmaxcount));
        var ctxt = document.getElementById("filterprodtxt").value; //get filter typed value
        this.searchProdList(ctxt,cstarttxt);
    }
    //
    loadAGAINProds = () => {
        //add maxcount to current start index
        // var cstarttxt = (this.state.pstartpage === 0?(this.state.pmaxcount):(this.state.pstartpage + this.state.pmaxcount));
        var ctxt = document.getElementById("filterprodtxt").value; //get filter typed value
        this.setState({filteredProdList: []}, () => {
            this.searchProdList(ctxt,this.state.pstartpage);
            })
    }
    //draws green box with mouse when dragging product to indicate product size according to field size
    drawRectCanvas = (cprod,iscutsingle) => {
        const canvele = this.dragPreviewCanvas.current;
        var draggingProduct = cprod;  //get dragging product
        var ctx = canvele.getContext("2d");

        canvele.width = 1;
        canvele.height = 1;
        ctx.fillStyle = "white";
        ctx.fillRect(0,0,canvele.width,canvele.height);
        //convert canvas to data image object
        var canimg = this.dragPreviewCanvas.current.toDataURL("image/png");
        //create new image and se that image src data image object
        var img = new Image();
        img.src = canimg;
        this.dragPreviewImage = img; //and set that image to ref image

        //update state
        var currprod = {productInfo:draggingProduct};
        this.setState({ view: { currentDeleteProd: currprod }, isviewcmenu: false,isviewcmenu2:false,});
    }
    //triggers on product drag start
    dragStart = (e, productObj, isd3move, cutidx, iscutsingle, singleidx,cutshelfidx,clipprodid,clipShelfrank,clipGroupid) => {
        // console.log(e, productObj, isd3move, cutidx, iscutsingle, singleidx);
        if(!isd3move){
            e.dataTransfer.setDragImage(this.dragPreviewImage, 0,0); //set drag image we generated with canvas
        }
        if(productObj){
            var draggingProduct = JSON.parse(JSON.stringify(productObj));
            draggingProduct.cutidx = cutidx;
            draggingProduct["isSingleCut"] = iscutsingle;
            draggingProduct["singleidx"] = singleidx;
            draggingProduct["cutshelfidx"] = cutshelfidx;
            if(clipprodid){
                draggingProduct["clipprodid"] = clipprodid;
                draggingProduct["clipShelfrank"] = clipShelfrank;
                draggingProduct["clipGroupid"] = clipGroupid;
            }
            
            if(draggingProduct.is_cutitem){

                var cdraggingProduct=draggingProduct
                cdraggingProduct.shelf.forEach(slf => {
                    slf.selectedProducts=slf.products

                });
                cdraggingProduct.selectedshelves=draggingProduct.shelf
                cdraggingProduct.drawWidth=cdraggingProduct.width
                cdraggingProduct.drawHeight=cdraggingProduct.height
               

            }

            //set state
            this.setState({ currentDraggableProd: draggingProduct, isContentDragging: true });
        }
        this.removeExpandOpts();
    }
    //draw dragging product rect
    dragProdView = (e, prod) => {
        if((!this.state.isDisableEDitingwithfullscreen&&!this.state.isDisableEdits)){
            var draggingProduct = JSON.parse(JSON.stringify(prod));  //get dragging product
            var curwidth = (draggingProduct.rotatewidth?draggingProduct.rotatewidth:draggingProduct.width);
            var curheight = (draggingProduct.rotateheight?draggingProduct.rotateheight:draggingProduct.height);
            let drawzoomx = this.state.zoomXRatio;
            let prodwidth = (measureConverter(draggingProduct.uom,this.state.displayUOM,curwidth) * this.state.displayRatio);
            let prodheight = (measureConverter(draggingProduct.uom,this.state.displayUOM,curheight) * this.state.displayRatio);

            draggingProduct["drawWidth"] = prodwidth * (drawzoomx > 0?(drawzoomx * 2):1);
            draggingProduct["drawHeight"] = prodheight * (drawzoomx > 0?(drawzoomx * 2):1);
            
            ghostOnDrag(e, draggingProduct, this.oriPageXY);
        }
    }
    //trigger on product drag stops
    dragEnd = (e, shelfObj, shelfRef, isinsidemove, moveobj, isdrop, selectedShelfidx, fieldobj) => {
        if((!this.state.isDisableEDitingwithfullscreen&&!this.state.isDisableEdits)){
            if(!shelfObj.isDisable && (this.state.currentDraggableProd || this.state.currentInternalDraggableProd)){
                if(findBrowserType() === "firefox"){
                    this.getPageXYCords(e);
                }
                var xa = 0;
                var ya = 0;
                var Cwidth = 0;
                var Cheight = 0;
                
                let viewboxcoords = (!isinsidemove&&!moveobj)?this.getScreenPointer(e):null;
                var draggingProduct = moveobj?moveobj:isinsidemove?this.state.selectedlocobj:this.state.currentDraggableProd; //get draging product

                //set pruduct paste x,y locations
                // console.log(draggingProduct);
                if(draggingProduct.is_cutitem){
                    e.stopPropagation();
                    e.preventDefault();

                    //if drag from clip board
                    xa = viewboxcoords.x;
                    ya = viewboxcoords.y//(shelfObj.y + shelfObj.drawHeight) - (Cheight + this.state.checkSaftyMargin); //get bottom y point
                    Cwidth = draggingProduct.width;
                    Cheight = draggingProduct.height;
                    
                    var cdraggingProduct = structuredClone(draggingProduct);
                    cdraggingProduct.x = xa;
                    cdraggingProduct.y = ya;
                    var filtereddraggingshelves=cdraggingProduct.selectedshelves.filter(q=>q.isDelete!==true)
                    for (let i = 0; i < filtereddraggingshelves.length; i++) {
                        const shelfitem = filtereddraggingshelves[i];
                        for (let j = 0; j < shelfitem.selectedProducts.length; j++) {
                            const proditem = shelfitem.selectedProducts[j];
                            proditem.x = (parseFloat(xa) + parseFloat(proditem.x));
                            // proditem.y = roundOffDecimal((parseFloat(ya) + parseFloat(proditem.y)),2);
                        }
                    }
                    
                    if(this._changingX > 0 || this._changingY > 0){
                        let x1margin = (this._changingX - this.state.saftyMargin);
                        let x2margin = (this._changingX + this.state.saftyMargin);

                        let y1margin = (this._changingY - this.state.saftyMargin);
                        let y2margin = (this._changingY + this.state.saftyMargin);

                        if(x1margin > xa || x2margin < xa || y1margin > ya || y2margin < ya){
                            //if drag from clip board
                            
                            var coppycdraggingProduct=cdraggingProduct
                            coppycdraggingProduct.selectedshelves=filtereddraggingshelves

                            let props = {
                                cx: structuredClone(xa),
                                cy: structuredClone(ya), 
                                // selectBlockObj: cdraggingProduct,
                                selectBlockObj: coppycdraggingProduct,
                                mapFields: this.state.mapFields,
                                mapCatRects: this.state.mapCatRects,
                                mapproductList: this.state.mapproductList,
                                setPreviewGuid: this.setPreviewGuid,
                                updateGhostObjDetails:this.updateGhostObjDetails,
                            }
                            
                            this._changingX = props.cx;
                            this._changingY = props.cy;

                            this.guideLineDrawContinue(props, shelfObj, selectedShelfidx, fieldobj);
                        }    
                    } else{
                        this._changingX = xa;
                        this._changingY = ya;
                    }

                    //scroll parent with drag
                    this.scrollParentWithDrag(cdraggingProduct);

                }else{
                    
                    if(moveobj){
                        xa =e.x;
                        ya = (shelfObj.y + shelfObj.drawHeight)-(moveobj.drawHeight+ this.state.checkSaftyMargin);
                        Cwidth=moveobj.drawWidth;
                        Cheight=moveobj.drawHeight;

                    }else if(isinsidemove){
                        xa =e.x;
                        ya = (shelfObj.y + shelfObj.drawHeight)-(this.state.selectedlocobj.drawHeight+ this.state.checkSaftyMargin);
                        Cwidth=this.state.selectedlocobj.drawWidth;
                        Cheight=this.state.selectedlocobj.drawHeight;

                    }else{
                        if(draggingProduct.is_cutitem){
                            Cwidth = draggingProduct.width;
                            Cheight = draggingProduct.height;
                        } else{
                            Cwidth=measureConverter(draggingProduct.uom,this.state.displayUOM,draggingProduct.width) * this.state.displayRatio;
                            Cheight=measureConverter(draggingProduct.uom,this.state.displayUOM,draggingProduct.height) * this.state.displayRatio;
                        }
                        
                        xa = viewboxcoords.x;
                        ya = (shelfObj.y + shelfObj.drawHeight) - (Cheight + this.state.checkSaftyMargin); //get bottom y point
                    }
                    
                    draggingProduct.drawHeight=Cheight
                    draggingProduct.drawWidth=Cwidth
                    draggingProduct["x"] = xa;
                    draggingProduct["y"] = ya;

                    var allowToAdd = false;
                    var checkshelfobj=null
        
                    //
                    if(isdrop){
                        checkshelfobj = shelfObj;
                    }else{
                        if(this.state.currentInternalDraggableProd.shelveidx === selectedShelfidx){
                            //filter draw product array except not inside block selected
                            checkshelfobj = structuredClone(shelfObj);

                            var exprods = checkshelfobj.brand[this.state.currentInternalDraggableProd.brandidx].drawingProducts;
                            var toRemoveprods = this.state.currentSelectedBlock.drawingProducts;
                            var filterdprods = exprods.filter(ar => !toRemoveprods.find(rm => (rm.uuid === ar.uuid ) ));

                            checkshelfobj.brand[this.state.currentInternalDraggableProd.brandidx].drawingProducts = filterdprods;
                        } else{
                            checkshelfobj = shelfObj;
                        }
                    }
                    //console.log(checkshelfobj);

                    //prevent browser events
                    if(!isinsidemove){
                        e.stopPropagation();
                        e.preventDefault();
                    }

                    let bkpxa = structuredClone(xa);
                    let bkpxb = structuredClone((xa + Cwidth));

                    if(xa !== this._dropposition.startX && (xa + Cwidth) !== this._dropposition.endX){
                        // let isRightOverlapFixed = false;
                        if(draggingProduct !== undefined || draggingProduct !== null){
                            allowToAdd = checkAllowToAdd(e, checkshelfobj, draggingProduct, xa, ya, this.state.checkSaftyMargin); //check allow to add that location - retuns boolean
                            // console.log(allowToAdd);
            
                            //if cannot add to shelf and is inside shelf and overlapping from right side
                            let checkshelfy2 = (checkshelfobj.y + checkshelfobj.drawHeight + checkshelfobj.drawGap);
                            let checkshelfx2 = (checkshelfobj.x + checkshelfobj.drawWidth);
            
                            if(!allowToAdd.allowToAdd && checkshelfobj.y <= ya && (ya + Cheight) <= checkshelfy2 && xa < checkshelfx2 && (xa + Cwidth) > checkshelfx2){
                                // isRightOverlapFixed = true;

                                allowToAdd = { allowToAdd: true, shelfAllow: true };
                                xa = ((checkshelfx2 - Cwidth));
                            }
                        }
                        
                        //reset shelf highlight
                        /* for (let l = 0; l < document.getElementsByClassName("sftrect-notdis").length; l++) {
                            const element = document.getElementsByClassName("sftrect-notdis")[l];
                            element.style.fill = 'transparent';
                        } */

                        if(allowToAdd.allowToAdd && shelfRef) {
                            // shelfRef.style.fill = 'rgba(144, 255, 173, 0.5)'; //highlights shelve background color

                            //show drop guidelines of shelf
                            if(this._guideTimeout){ 
                                clearTimeout(this._guideTimeout); 
        
                                if(this.state.isFirstTimeDrawguid){
                                    this.setPreviewGuid(false, null, null, true);
                                }
                            }
                            
                            this._guideTimeout = setTimeout(() => {
                                let droppingXProd = null; 
                                let notDeletedProds = this.state.mapproductList.filter(f => 
                                    !f.isDelete && f.field_custom_id === fieldobj.field_custom_id && f.shelfrank === checkshelfobj.rank
                                );
                                // console.log(notDeletedProds);
                                    
                                for (let p = 0; p < notDeletedProds.length; p++) {
                                    const prod = notDeletedProds[p];
                                    
                                    if(prod.id !== draggingProduct.id){
                                        let prodstartx = (prod.x);
                                        let checkprodwidth = (((prod.drawWidth / 3) > 8)?(prod.drawWidth / 3):(prod.drawWidth / 2));
                                        let prodmiddlex = (prod.x + checkprodwidth);
                                        
                                        if(xa > prodstartx && xa < prodmiddlex){
                                            xa = prod.x;
                                        }

                                        if(prod.x <= xa && xa <= roundOffDecimal((prod.x + prod.drawWidth),2)){
                                            droppingXProd = prod;
                                        }
                                    }
                                }

                                if(!droppingXProd){
                                    xa = getSnappingLocation(xa, fieldobj, this.state.mapproductList, draggingProduct, [shelfObj]);
                                }
        
                                shelfObj.previewguid = {startX: xa, endX: (xa + Cwidth)};
                                
                                let previewShelves = [shelfObj];
                                let selectingField = (shelfObj.field_custom_id?this.state.mapFields[shelfObj.field_custom_id]:null);
                                
                                if(selectingField){
                                    selectingField["key"] = shelfObj.field_custom_id;
                                    this.setPreviewGuid(false, previewShelves, selectingField);
                                }
                            }, 200);  
                        } else{
                            if(this.state.isFirstTimeDrawguid){
                                this.setPreviewGuid(false, null, null, true);
                            }
                        }
                    }
        
                    this._dropposition = {startX: bkpxa, endX: bkpxb};
                    
                    if(isinsidemove||moveobj){
                        return allowToAdd;
                    }
                    
                    //scroll parent with drag
                    this.scrollParentWithDrag(draggingProduct);
                }
            
            } else{
                for (let l = 0; l < document.getElementsByClassName("sftrect-notdis").length; l++) {
                    const element = document.getElementsByClassName("sftrect-notdis")[l];
                    element.style.fill = 'transparent';
                }

                if(this.state.isFirstTimeDrawguid){
                    this.setPreviewGuid(false, null, null, true);
                }
            }
        }
    }

    //scroll parent handle
    scrollParentWithDrag = (evt) => {
        let saftyMargin = 20;
        let saftyOverlapMargin = 40; 

        //scroll parent div with d3 drag
        let parent = document.getElementById(this.state.wrapperId);
        let zoomXRatio = this.state.zoomXRatio;

        let w = parent.offsetWidth; 
        let h = parent.offsetHeight;
        let sL = parent.scrollLeft;
        let sT = parent.scrollTop;

        let movewidth = (evt.drawWidth + (zoomXRatio > 0?(zoomXRatio + 1):1));
        let moveheight = (evt.drawHeight + (zoomXRatio > 0?(zoomXRatio + 1):1));

        let x = ((evt.x > 0?(evt.x - saftyMargin):0) * (zoomXRatio > 0?(zoomXRatio + 1):1));
        let x2 = (((evt.x + saftyMargin) * (zoomXRatio > 0?(zoomXRatio + 1):1)) + movewidth);
        let y = ((evt.y > 0?(evt.y - saftyMargin):0) * (zoomXRatio > 0?(zoomXRatio + 1):1));
        let y2 = (((evt.y + saftyMargin) * (zoomXRatio > 0?(zoomXRatio + 1):1)) + moveheight);

        //if dragging horizontal
        if (((w + sL) + saftyOverlapMargin) > x2 && x2 > (w + sL)) {
            parent.scrollLeft = (x2 - w);  
        } else if (x < sL) {
            parent.scrollLeft = (x);
        }
        
        //if dragging vertical
        if (y2 > h + sT) {
          parent.scrollTop = (y2 - h);
        } else if (y < sT) {
          parent.scrollTop = (y);
        }
    }

    //guideline draw continue
    guideLineDrawContinue = (props, shelfobj, shelfidx, fieldobj) => {
        if(this._guideTimeout){ 
            clearTimeout(this._guideTimeout); 
            
            if(this.state.isFirstTimeDrawguid){
                this.setPreviewGuid(false, null, null, true, []);
            }
        }

        this._cutDragObj = { shelfobj: shelfobj, shelfidx: shelfidx, fieldobj };
        
        this._guideTimeout = setTimeout(() => {
            // console.log(this._changingX+" !== "+props.cx, this._changingY+" !== "+props.cy);
            setGuidlineComman(props);
        }, 150);
    }

    //clear drag out - removes green fill in shelves when can drop products to shelve(y edit)
    dragClear = (e, shelfObj, shelfRef) => {
        if(!shelfObj.isDisable&&this.state.xrayActive===1){
            shelfRef.style.fill = 'transparent';
        }

        if(this._dragcleartout){ clearTimeout(this._dragcleartout); }

        this._dragcleartout = setTimeout(() => {
            this.setPreviewGuid(false,null,null,true);
        }, 300);
        
        // this.setState({ isContentDragging: false });
    }
    //#MP-SML-E-DP-01
    //triggers on drop product to shelve
    dropproduct = (e, shelfObj, shelfRef, shelfIdx, isxpand, fieldobj) => {
        e.preventDefault(); //fixes firefox image dragging issue

        let viewboxcoords = this.xyChangeCoords(e);
        var xa = viewboxcoords.x;
        var draggingProduct = JSON.parse(JSON.stringify(this.state.currentDraggableProd)); //get current dragging product
       
        //checking drop validation
        let departmentId = (this.props.defSaveObj && this.props.defSaveObj.department?((this.props.simType === "AUI")?this.props.defSaveObj.department.id:this.props.defSaveObj.department.department_id):null);
        let departmentname = (this.props.defSaveObj && this.props.defSaveObj.department?(((this.props.simType === "AUI")?this.props.defSaveObj.department.name:this.props.defSaveObj.department.department_name)+" "+this.props.t("department")):"-");
        // console.log(deptObj);

        if(!draggingProduct.isSingleCut){
            var validateList = validateHeirarchyMissings(draggingProduct, departmentId, departmentname);
    
            /* if(!draggingProduct.width || !draggingProduct.height || !draggingProduct.uom || draggingProduct.uom === "" || !draggingProduct.depth){
                validateList.push({type:"Dimension",text:this.props.t('PROD_DIMENTIONS_NOTAVAILABLE')})
                // alertService.warn(this.props.t('PROD_DIMENTIONS_NOTAVAILABLE'));
                // return false;
            } if(!draggingProduct.imageUrl || draggingProduct.imageUrl === ""){
                validateList.push({type:"image",text:this.props.t('PROD_IMAGE_NOTFOUND')})
            } if(draggingProduct.hierarchyCompleteStatus==="HaveIssues"){
                validateList.push({type:"Hierarchy_Issue",text:this.props.t('Hierarchy_Issue')})
            } if(draggingProduct.mpUsageStatus==="Archived" ){
                validateList.push({type:"Archived",text:this.props.t('Product_is_Archived')})
            } if(draggingProduct.mpUsageStatus==="New" ){
                validateList.push({type:"New",text:this.props.t('Product_is_NewProduct')})
            } if(draggingProduct.mpUsageStatus==="None" ){
                validateList.push({type:"None",text:this.props.t('product_Didnt_sendto_dep')})
            } */
            
            if(validateList.length > 0){
                this.setState({
                    dropWarningList: validateList,
                    selectedwarningdropprod: draggingProduct
                },()=>{
                    this.cannotDropWarningHandle()
                })
                return false;
            }
        }
        
        draggingProduct.drawHeight=measureConverter(draggingProduct.uom,this.state.displayUOM,draggingProduct.height) * this.state.displayRatio;
        draggingProduct.drawWidth=measureConverter(draggingProduct.uom,this.state.displayUOM,draggingProduct.width) * this.state.displayRatio;
        //check dragging product available
        if (draggingProduct === undefined || draggingProduct === null) {
            alertService.warn(this.props.t('PRODUCT_NOT_SELECTED'))
            return;
        }

        //if isexpand
        if(isxpand && draggingProduct){
            xa = xa - ((measureConverter(draggingProduct.uom,this.state.displayUOM,draggingProduct.width) * this.state.displayRatio) / 2);
        }

        //check dragging product available and allowed to add
        if (draggingProduct && draggingProduct != null) { // && allowToAdd
            this.setState({ isviewcmenu: false,isviewcmenu2:false });
            //set product y position
            var newy = (shelfObj.y + shelfObj.drawHeight) - ((measureConverter(draggingProduct.uom,this.state.displayUOM,draggingProduct.height) * this.state.displayRatio)); //get bottom y point
            let checknewy = (newy + this.state.checkSaftyMargin)

            //find is product can added to bottom of shelve
            var allowToAddBottom = null;

            //is it allow to drop to bottom of shelve
            draggingProduct["isNew"] = true;
            draggingProduct["isDelete"] = false;

            // var cdrgprod = {shelveidx: shelfIdx, brandidx: null, prodidx: null, prod: null};

            // let isRightOverlapFixed = false;
            if(draggingProduct !== undefined || draggingProduct !== null){
                allowToAddBottom = checkAllowToAdd(e, shelfObj, draggingProduct, xa, checknewy, this.state.checkSaftyMargin); //check allow to add that location - retuns boolean
                // console.log(allowToAddBottom);

                //if cannot add to shelf and is inside shelf and overlapping from right side
                let checkshelfy2 = (shelfObj.y + shelfObj.drawHeight + shelfObj.drawGap);
                let checkshelfx2 = (shelfObj.x + shelfObj.drawWidth);

                if(!allowToAddBottom.allowToAdd && shelfObj.y <= newy && (newy + draggingProduct.drawHeight) <= checkshelfy2 && xa < checkshelfx2 && (xa + draggingProduct.drawWidth) > checkshelfx2){
                    // isRightOverlapFixed = true;

                    allowToAddBottom = { allowToAdd: true, shelfAllow: true };
                    xa = ((checkshelfx2 - draggingProduct.drawWidth));
                }
            }

            //if product can add to bottom of shelve
            if (allowToAddBottom.allowToAdd && shelfRef) {
                this.fieldHistoryAdd(JSON.parse(JSON.stringify(this.state.mapproductList)),1);
                
                let isruleupdating = false;

                //get current products list
                let prodlist = this.state.mapproductList;
                
                let brandobj = null;
                let subcatobj = null;

                if(draggingProduct.isSingleCut){
                    brandobj = draggingProduct.brand;

                    subcatobj = draggingProduct.subcategory;

                    if(subcatobj.type === catRectEnums.rule){
                        //find if rule brand available
                        let brandid = getNameorIdorColorofBox(subcatobj, "num");
                        let rulelevel = subcatobj.rule.level;

                        let findfromrules = findRuleAvailableForBrand(brandid, true, rulelevel, this.state.mapRulesList);
                        // console.log(findfromrules);

                        if(findfromrules.isavailable){
                            isruleupdating = {parentidx: findfromrules.ruleparentidx, ruleidx: findfromrules.ruleidx};
                        }
                    }
                } else{
                    if(draggingProduct.brandId && draggingProduct.brandId > 0){
                        let brandsupobj = (draggingProduct.supplierId && draggingProduct.supplierId > 0?{ supplierId: draggingProduct.supplierId, supplierName: draggingProduct.supplierName }:null);
                        brandobj = {
                            brand: {
                                brandName: draggingProduct.brandName,
                                color: draggingProduct.brandColor,
                                brandId: draggingProduct.brandId,
                                supplier: brandsupobj,
                            },
                            type: catRectEnums.default,
                            rule: null
                        }
                    }

                    if(draggingProduct.subCategoryId && draggingProduct.subCategoryId > 0){
                        subcatobj = {
                            sub_category: {
                                subCategoryName: draggingProduct.subCategoryName,
                                color: draggingProduct.subCategoryColor,
                                subCategoryId: draggingProduct.subCategoryId
                            },
                            type: catRectEnums.default,
                            rule: null
                        }

                        //find if rule supplier available
                        let supplierid = draggingProduct.supplierId;
                        if(supplierid > 0){
                            let findsupfromrules = findRuleAvailableForBrand(supplierid, true, catRuleEnums.sup, this.state.mapRulesList);
                            // console.log(findsupfromrules);

                            if(findsupfromrules.isavailable){
                                subcatobj = {
                                    sub_category: null,
                                    type: catRectEnums.rule,
                                    rule: {
                                        id: findsupfromrules.ruleobj.id,
                                        level: findsupfromrules.ruleobj.level,
                                        supplier: (findsupfromrules.ruleobj.level === catRuleEnums.sup?findsupfromrules.ruleobj.supplier:{}),
                                        brand: (findsupfromrules.ruleobj.level === catRuleEnums.brand?findsupfromrules.ruleobj.brand:{}),
                                    }
                                }
    
                                isruleupdating = {parentidx: findsupfromrules.ruleparentidx, ruleidx: findsupfromrules.ruleidx};
                            }
                        }
                        
                        //find if rule brand available
                        let brandid = getNameorIdorColorofBox(brandobj, "num");
                        
                        let findfromrules = findRuleAvailableForBrand(brandid, false, null, this.state.mapRulesList);
                        
                        if(findfromrules.isavailable){ // && findfromrules.ruleobj.ruleState !== "default"
                            subcatobj = {
                                sub_category: null,
                                type: catRectEnums.rule,
                                rule: {
                                    id: findfromrules.ruleobj.id,
                                    level: findfromrules.ruleobj.level,
                                    supplier: (findfromrules.ruleobj.level === catRuleEnums.sup?findfromrules.ruleobj.supplier:{}),
                                    brand: (findfromrules.ruleobj.level === catRuleEnums.brand?findfromrules.ruleobj.brand:{}),
                                }
                            }

                            isruleupdating = {parentidx: findfromrules.ruleparentidx, ruleidx: findfromrules.ruleidx};
                        }
                    }
                }
                //checking 
                    
                    var cisStackable=false
                    var drgprodid=draggingProduct.isSingleCut?draggingProduct.productId:draggingProduct.id
                    var drgprodisstack=draggingProduct.isSingleCut?draggingProduct.isStackable:draggingProduct.isStackable
                    for (let k = 0; k < this.state.mapproductList.length; k++) {
                        const oprod = this.state.mapproductList[k];
                        //console.log(oprod.productId,drgprodid);
                        if(oprod.productId===drgprodid){
                            cisStackable=oprod.isStackable
                            break
                        }else{
                            if(k===this.state.mapproductList.length){
                                cisStackable=drgprodisstack
                            }
                        }
                        
                    }

                //finddragging product drop to wich box
                let movingObj = JSON.parse(JSON.stringify(draggingProduct));
                
                var containElem = elmAccordingtoXY(xa,newy,movingObj.drawWidth,movingObj.drawHeight,this.state.mapFields,this.state.mapCatRects)
                //end
                //define location object
                var plocobj = {
                    id: uuidv4(), 
                    x: xa, y: newy,
                    width: draggingProduct.width, height: draggingProduct.height, depth: draggingProduct.depth,
                    drawWidth: measureConverter(draggingProduct.uom,this.state.displayUOM,draggingProduct.width) * this.state.displayRatio,
                    drawHeight: measureConverter(draggingProduct.uom,this.state.displayUOM,draggingProduct.height) * this.state.displayRatio,
                    imageUrl: draggingProduct.imageUrl,
                    barcode: draggingProduct.barcode,
                    productId: (draggingProduct.isSingleCut?draggingProduct.productId:draggingProduct.id),
                    name: (draggingProduct.isSingleCut?draggingProduct.name:draggingProduct.productName),
                    uom: draggingProduct.uom,
                    field_custom_id: fieldobj.field_custom_id,
                    virtualBoxId: fieldobj.virtualBoxId,
                    fuuid: uuidv4(), 
                    shelfrank: shelfObj.rank,
                    startingPoint: xa,
                    brand: brandobj,
                    subcategory: subcatobj,
                    prodidx: (prodlist.length),
                    isDropNew: (!draggingProduct.isSingleCut),
                    isNew: true,
                    isDelete: false,

                    brandRectId: -1,
                    subcategoryRectId: -1,
                    categoryRectId:  containElem.catrect.catrectId,
                    isStackable:cisStackable,//add droping product stackable
                    maxStackableCount:draggingProduct.maxStackableCount,
                };
                 
               
                let lowestprodx = xa;
                let droppingXProd = null; //to find prod available in dropping x1 position
                //new adition
                // lowestprodx = getSnappingLocation(lowestprodx, fieldobj, prodlist, plocobj, [shelfObj]);
                // plocobj.x = lowestprodx;

                //find product is overlapping other product
                var containProds = GetContainingProdsByBox(plocobj.x, plocobj.y, (plocobj.x + plocobj.drawWidth), (plocobj.y + plocobj.drawHeight), prodlist, fieldobj);
                // console.log("loc 5",plocobj.x, plocobj.y, (plocobj.x + plocobj.drawWidth), (plocobj.y + plocobj.drawHeight), prodlist, fieldobj);

                let cutshelfs = [];
                if(containProds.selectedProds && containProds.selectedProds.length > 0){
                    var notDeletedContainProds = containProds.selectedProds.filter(f => !f.isDelete && f.shelfrank === shelfObj.rank);

                    for (let j = 0; j < notDeletedContainProds.length; j++) {
                        const selcutitem = notDeletedContainProds[j];
                        
                        let checkprodwidth = (((selcutitem.drawWidth / 3) > 8)?(selcutitem.drawWidth / 3):(selcutitem.drawWidth / 2));
                        let prodmiddlex = (selcutitem.x + checkprodwidth);

                        let findshelfitemidx = cutshelfs.findIndex(x => x.rank === selcutitem.shelfrank);
                        if(findshelfitemidx > -1){
                            cutshelfs[findshelfitemidx].prods.push(selcutitem);
                        } else{
                            cutshelfs.push({ rank: selcutitem.shelfrank, prods: [selcutitem] });
                        }

                        prodlist[selcutitem.prodidx]["isDelete"] = true;

                        if(lowestprodx > selcutitem.x && lowestprodx < prodmiddlex){
                            lowestprodx = selcutitem.x;
                        }
    
                        if(selcutitem.x <= lowestprodx && lowestprodx <= roundOffDecimal((selcutitem.x + selcutitem.drawWidth),2)){
                            droppingXProd = selcutitem;
                        }
                    }
                }

                //if dropping position x not have product find last left product x to drop(need to check want o not)
                // console.log(droppingXProd);
                if(!droppingXProd){
                    lowestprodx = getSnappingLocation(lowestprodx, fieldobj, prodlist, plocobj, [shelfObj]);
                }
                
                plocobj.x = lowestprodx;
                
                prodlist.push(plocobj);
                this.TouchedCatListUpdate(plocobj.categoryRectId)
                //check non sim render count and display mange
                this.nonSimProddropremoveCounterupdate()
                
                //new product add counts change
                let cdrgprod = null;
                if(!draggingProduct.isSingleCut){
                    this.handleAddProductCounter(plocobj, 1);

                    cdrgprod =  { prodidx: (prodlist.length - 1), prod: plocobj};
                }
                
                this.setState({ mapproductList: prodlist, currentInternalDraggableProd: cdrgprod, currentSelectedBlock: null, contxtmenu: { isexpand: true }},() => {
                    if(this.props.simType === "AUI" || this.props.simType === "Normal"){
                        //console.log(this.state.mapproductList)
                        // const combinedPrds = this.state.mapproductList.concat(this.state.filteredOtherPrds).filter(prd=>prd.isDelete !== true)
                        const combinedPrds = this.state.mapproductList.filter(prd=>prd.isDelete !== true)
                        this.props.getProductAnomalies(this.props.mapFields, this.props.mapCategories, combinedPrds)
                    }
                    //reload imported product update 
                    this.compareImportedProds();
                    
                    this.props.handlehaveChnagesinCat(true);
                    
                    if(draggingProduct.isSingleCut){
                        //uncomment to remove single clip boad drop remove clip board coppy
                        
                        this.updateSingleCutProduct(draggingProduct);
                    } else{
                        this.updateRecentProdList(draggingProduct);
                    }

                    if(isruleupdating){
                        let updaterulelist = getAllRuleWarnings(this.state.mapCatRects, this.state.mapRulesList, this.state.mapproductList, false, true, isruleupdating);
                        // console.log(updaterulelist);

                        this.setState({ mapRulesList: updaterulelist.rulelist, isRuleWarn: updaterulelist.iswarn });
                    }
                    //making new clip board obj
                    if(cutshelfs.length>0){
                        var selfield=this.state.mapFields[cutshelfs[0].prods[0].field_custom_id]
                        var cshelfs=[{shelfrank:cutshelfs[0].rank,products:cutshelfs[0].prods}]
                        var objtopass={
                            groupUUID: uuidv4(),isNew:true, isDelete: false, mode: "cut" ,uom:selfield.uom,shelf:cshelfs
                        }
                        setTimeout(() => {
                            this.updateCutList(objtopass); 
                        }, 300);
                    }
                });

            } else { 
                alertService.error(this.props.t("CANNOT_ADD_TO_BOTTOM"));
            }

            //end drop
            if(shelfRef){ 
                shelfRef.style.fill = 'transparent'; 
            } 

            setTimeout(() => {
                this.setPreviewGuid(true);
            }, 500);
        }
    }
    //update recent added prod list
    updateRecentProdList = (prodobj) => {
        let recentList = this.state.recentProdList;
        let isalreadyadded = recentList.findIndex(x => x.id === prodobj.id);

        if(isalreadyadded === -1){
            recentList.push(prodobj);
        }

        this.setState({ recentProdList: recentList });
    }
    //update nonsim prods remove and add 
    nonSimProddropremoveCounterupdate=()=>{
        var nonesimProds=JSON.parse(JSON.stringify(this.state.nonfilteredNonEProducts));
        var cprodlist = JSON.parse(JSON.stringify(this.state.mapproductList));
        
        for (let index = 0; index < nonesimProds.length; index++) {
            const none_simProd = nonesimProds[index];
           
            var productexistindrawing=cprodlist.some(a=>a.isDelete!==true&&a.barcode===none_simProd.barcode);
            if(productexistindrawing){
                none_simProd.isAdded=true
            }else{
                none_simProd.isAdded=false
            }
        }
        this.setState({nonfilteredNonEProducts:nonesimProds})
            
       
    }
    //#MP-SML-E-BCU2
    dropCutblock=(e, shelfObj, shelfRef, shelfIdx, cutobj, cutidx, fieldobj) => {
        let viewboxcoords = this.xyChangeCoords(e);
        // console.log(viewboxcoords);

        var xa = viewboxcoords.x;
        var draggingProduct = this.state.currentDraggableProd; //get current dragging product
        let droppingShelfList = this.state.droppingShelfList;
        // console.log(this.state.droppingShelfList, fieldobj);
        
        draggingProduct.drawHeight = draggingProduct.height;
        draggingProduct.drawWidth = draggingProduct.width;

        //check dragging product available and allowed to add
        if (droppingShelfList && draggingProduct && draggingProduct != null) { // && allowToAdd
            this.setState({ isviewcmenu: false, isviewcmenu2: false });
            
            let noShelfAvailable = false;
            let notAllowBottom = false;

            let isruleupdating = false;
            let cutshelfs = {groupUUID: uuidv4(), isNew:true, isDelete: false, mode:"cut" , uom: this.state.displayUOM, shelf: []};
            let cProdList = structuredClone(this.state.mapproductList);

            var  filterddraggingProductshelfs =draggingProduct.shelf.filter(q=>q.isDelete!==true)
            for (let l = 0; l < filterddraggingProductshelfs.length; l++) {
                const cutShelfObj = filterddraggingProductshelfs[l];

                let dropshelf = droppingShelfList[l];
                if(dropshelf){
                    let selectedDropShelf = fieldobj.shelf.find(findshelf => findshelf.rank === dropshelf.rank);
                    cutshelfs.uom = selectedDropShelf.uom;

                    //temp set draw width/height
                    cutShelfObj["drawWidth"] = cutShelfObj.width;
                    cutShelfObj["drawHeight"] = cutShelfObj.height;

                    //set product y position
                    var newy = (selectedDropShelf.y + selectedDropShelf.drawHeight) - (cutShelfObj.drawHeight + this.state.checkSaftyMargin); //get bottom y point
                    
                    cutShelfObj["x"] = xa;
                    cutShelfObj["y"] = newy;

                    //find is product can added to bottom of shelve
                    var allowToAddBottom = checkAllowToAdd(e, selectedDropShelf, cutShelfObj, xa, newy, this.state.checkSaftyMargin);
                    // console.log(allowToAddBottom);

                    //if cannot add to shelf and is inside shelf and overlapping from right side
                    let checkshelfy2 = (selectedDropShelf.y + selectedDropShelf.drawHeight + selectedDropShelf.drawGap);
                    let checkshelfx2 = (selectedDropShelf.x + selectedDropShelf.drawWidth);
                    if(!allowToAddBottom.allowToAdd && selectedDropShelf.y <= newy && (newy + cutShelfObj.drawHeight) <= checkshelfy2 && xa < checkshelfx2 && (xa + draggingProduct.drawWidth) > checkshelfx2){
                        allowToAddBottom = { allowToAdd: true, shelfAllow: true };
                        xa = (checkshelfx2 - cutShelfObj.drawWidth);
                    }
                    //finddragging draging box drop to which box
                    let movingObj = structuredClone(cutShelfObj);
                                    
                    var containElem = elmAccordingtoXY(xa,newy,movingObj.drawWidth,movingObj.drawHeight,this.state.mapFields,this.state.mapCatRects)

                    //end
                    //if product can add to bottom of shelve
                    if(allowToAddBottom.allowToAdd) {
                        this.TouchedCatListUpdate(containElem.catrect.catrectId)
                        this.fieldHistoryAdd(structuredClone(this.state.mapproductList),1);
                        
                        let stratXpoint = 0;
                        let lowestprodx = xa;

                        //find product is overlapping other product
                        let boxx1 = roundOffDecimal(lowestprodx,2);
                        let boxy1 = roundOffDecimal(newy,2);
                        let boxx2 = roundOffDecimal((lowestprodx + cutShelfObj.width),2);
                        let boxy2 = roundOffDecimal((newy + cutShelfObj.height),2);

                        //find remove drop items from list
                        var containProds = GetContainingProdsByBox(boxx1, boxy1, boxx2, boxy2, cProdList, fieldobj);
                        // console.log("loc 1",boxx1, boxy1, boxx2, boxy2, cProdList, fieldobj)

                        let droppingXProd = null; //to find prod available in dropping x1 position
                        if(containProds.selectedProds && containProds.selectedProds.length > 0){
                            let notDeletedContainProds = containProds.selectedProds.filter(f => !f.isDelete);
                            
                            for (let j = 0; j < notDeletedContainProds.length; j++) {
                                const selcutitem = notDeletedContainProds[j];
                                
                                var ishaveinSlectedshleves = cutShelfObj.products.find(x=>x.id === selcutitem.id)
                                //check save moving produtcs not cutting
                                if(ishaveinSlectedshleves === undefined){
                                    let prodstartx = (selcutitem.x);
                                    let checkprodwidth = (((selcutitem.drawWidth / 3) > 8)?(selcutitem.drawWidth / 3):(selcutitem.drawWidth / 2));
                                    let prodmiddlex = (selcutitem.x + checkprodwidth);
                                    
                                    if(lowestprodx > prodstartx && lowestprodx < prodmiddlex){
                                        lowestprodx = selcutitem.x;
                                    }

                                    if(selcutitem.x <= xa && xa <= roundOffDecimal((selcutitem.x + selcutitem.drawWidth),2)){
                                        droppingXProd = selcutitem;
                                      }

                                }
                            }
                        }

                        if(!droppingXProd){
                            lowestprodx = getSnappingLocation(xa, fieldobj, cProdList, cutShelfObj, [selectedDropShelf]);
                            // console.log(xa,lowestprodx);
                        }

                        var maxEndX = 0;
                        stratXpoint = lowestprodx;
                        
                        for (let j = 0; j < cutShelfObj.products.length; j++) {
                            const cutprod = cutShelfObj.products[j];
                            var cisStackable=false
                            for (let k = 0; k < this.state.mapproductList.length; k++) {
                                const oprod = this.state.mapproductList[k];
                                if(oprod.productId===cutprod.productId){
                                    cisStackable=oprod.isStackable
                                    break
                                }else{
                                    if(k===this.state.mapproductList.length){
                                        cisStackable=cutprod.isStackable
                                    }
                                }
                                
                            }
                            cutprod.id = uuidv4();
                            cutprod.x = stratXpoint;
                            cutprod.y = ((selectedDropShelf.y + selectedDropShelf.drawHeight) - cutprod.drawHeight);
                            cutprod.uuid = uuidv4();
                            cutprod.shelfrank = selectedDropShelf.rank;
                            cutprod.field_custom_id = fieldobj.field_custom_id;
                            cutprod.categoryRectId=  containElem.catrect.catrectId;
                            cutprod.isNew = true;
                            cutprod.isDelete = cutprod.isDelete?cutprod.isDelete:false;
                            // cutprod.isDelete = false;
                            cutprod.isStackable =cisStackable

                            stratXpoint = stratXpoint + cutprod.drawWidth;

                            let curprodendx = (cutprod.x + cutprod.drawWidth);
                            if(curprodendx > maxEndX){
                                maxEndX = curprodendx
                            }

                            if(cutprod.subcategory && cutprod.subcategory.type === catRectEnums.rule){
                                isruleupdating = true;
                            }
                        }

                        //remove drop items from list
                        let newMOEndX = roundOffDecimal((stratXpoint - this.state.checkSaftyMargin),2);
                        var ccontainProds = GetContainingProdsByBox(boxx1, boxy1, newMOEndX, boxy2, this.state.mapproductList, fieldobj);
                        // console.log("loc 2",boxx1, boxy1, newMOEndX, boxy2, this.state.mapproductList, fieldobj)
                        
                        if(ccontainProds.selectedProds && ccontainProds.selectedProds.length > 0){
                            let notDeletedContainProds = ccontainProds.selectedProds.filter(f => !f.isDelete && f.shelfrank === selectedDropShelf.rank);
                            
                            for (let j = 0; j < notDeletedContainProds.length; j++) {
                                const selcutitem = notDeletedContainProds[j];
                                
                                let findshelfitemidx = cutshelfs.shelf.findIndex(x => x.rank === selcutitem.shelfrank);
                                if(findshelfitemidx > -1){
                                    cutshelfs.shelf[findshelfitemidx].products.push(selcutitem);
                                } else{
                                    cutshelfs.shelf.push({ rank: selcutitem.shelfrank, products: [selcutitem] });
                                }

                                cProdList[selcutitem.prodidx]["isDelete"] = true;

                                if(cProdList[selcutitem.prodidx].subcategory && cProdList[selcutitem.prodidx].subcategory.type === catRectEnums.rule){
                                    isruleupdating = true;
                                }
                            }
                        }
                        var filteredporducts=cutShelfObj.products.filter(x=>x.isDelete!==true)
                        cProdList.push(...filteredporducts);
                        // cProdList.push(...cutShelfObj.products);
                        
                    } else { 
                        notAllowBottom = true;
                    } 
                } else{
                    noShelfAvailable = true;
                }
                   
            }

            if(noShelfAvailable){
                alertService.warn(this.props.t("DROP_SHELF_NOT_AVAILABLE"));
            } else{
                if(notAllowBottom){
                    alertService.warn(this.props.t("CANNOT_ADD_TO_BOTTOM"));
                } else{
                    var newCutarray = this.state.cutArray;

                    //uncomment this to multiple clip board remove after drop 
                    // newCutarray.splice(cutidx,1)
                    //end on comment
                    // console.log(newCutarray);
                    this.setState({ 
                        mapproductList: cProdList, 
                        cutArray: newCutarray, 
                        currentSelectedBlock: null, currentInternalDraggableProd: null 
                    }, () => {
                        // console.log(this.state.cutArray);
                        if(this.props.simType === "AUI" || this.props.simType === "Normal"){
                            // const combinedPrds = this.state.mapproductList.concat(this.state.filteredOtherPrds).filter(prd=>prd.isDelete !== true)
                            const combinedPrds = this.state.mapproductList.filter(prd=>prd.isDelete !== true)
                            this.props.getProductAnomalies(this.props.mapFields, this.props.mapCategories, combinedPrds)
                        }

                        //reload imported product update 
                        this.compareImportedProds();

                        // console.log(cutshelfs);
                        this.updateSingleCutProduct(null, true, cutidx, draggingProduct.groupUUID);

                        if(cutshelfs.shelf.length > 0){
                            this.updateCutList(cutshelfs);
                        }

                        //check non sim render count and display mange
                        this.nonSimProddropremoveCounterupdate("cutdropBlock");
                        
                        //update rule list if item sub cat is rule
                        if(isruleupdating){
                            let updaterulelist = getAllRuleWarnings(this.state.mapCatRects, this.state.mapRulesList, this.state.mapproductList, false, false);
                            // console.log(updaterulelist);
                            
                            this.setState({ 
                                mapRulesList: updaterulelist.rulelist, 
                                isRuleWarn: updaterulelist.iswarn 
                            });
                        }
                    });
                }
            }
            
            //end drop
            if(shelfRef){ 
                shelfRef.style.fill = 'transparent'; 
            }
            setTimeout(() => {
                this.setPreviewGuid(true);
            }, 500);
        }
    }
    //triggers on drop product to shelve
    droppedNew = (e, shelfObj, shelfRef, shelfIdx, isxpand, fieldobj) => {
        if((!this.state.isDisableEDitingwithfullscreen&&!this.state.isDisableEdits)){
            //fixes firefox image dragging issue
            e.preventDefault();

            if(this.state.currentDraggableProd.is_cutitem){
                this.dropCutblock(e, shelfObj, shelfRef, shelfIdx, this.state.currentDraggableProd, this.state.currentDraggableProd.cutidx, fieldobj)
            }else{
                this.dropproduct(e, shelfObj, shelfRef, shelfIdx, isxpand, fieldobj)
            }

            this.setState({ isContentDragging: false });
            removeGhostImage();
        }
    }
    //remove expand
    removeExpandOpts = () => {
        this.setState({ isviewcmenu: false, contxtmenu: null});
    }
    //expand click
    handleExpandProd = () => {
        var cxobj = this.state.contxtmenu;
        this.setState({ isviewcmenu: false, contxtmenu: {xpos: cxobj.xpos, ypos: cxobj.ypos, isexpand: !cxobj.isexpand}, currentSelectedBlock: null });
    }
    //toggle context menu
    handleContextMenu = (isshow, citem,prodidx,e) => {
        // let editwrapper = document.getElementById(this.state.wrapperId);
        // let viewboxcoords = this.xyChangeCoords(e);
        
        // let zoomXRatio = this.state.zoomXRatio;
        // let reducescrolledgap = ((citem.x * zoomXRatio) - editwrapper.scrollLeft);  
        // console.log(e.pageX, e.pageY, e.clientX, e.clientY);
        
        // var cobj = {xpos: this.props.isRTL?(reducescrolledgap + 40):(reducescrolledgap + 50), 

        var isAuismallScreen=((!this.props.isShowFromPreview && !this.props.isFullscreenEditModal)&&(this.props.simType==="AUI"))?true:false
        var redY=0
        var contextX=e.clientX
        if(isAuismallScreen){
            var auiscroll=document.getElementById("aui-sim-scroll-main")
            redY=auiscroll.scrollTop
            contextX=this.props.isRTL === "rtl" ?(e.clientX-this.state.AUISideBarGap)-230:e.clientX-this.state.AUISideBarGap
        }
        var cobj = {xpos: contextX, 
            ypos: (e.clientY+redY)-110, //citem.y + 150
             prodidx: prodidx, citem: citem};
        
        //make temp dash rect     
        var prod=JSON.parse(JSON.stringify(this.state.mapproductList[prodidx]))
        prod["prodidx"]=prodidx
        var positionobj = elmAccordingtoXY(prod.x,prod.y, prod.drawWidth,prod.drawHeight,this.state.mapFields,this.state.mapCatRects);
        var drawingDetails = ((Object.keys(positionobj).length > 0)?positionobj:null);
        let tempdashrect= { drawingDetails:drawingDetails, startx: prod.x, starty: prod.y, x: prod.x, y:prod.y, width: prod.drawWidth, height: prod.drawHeight, percentage: 0 }
        
        this.setState({ isviewcmenu: isshow, contxtmenu: cobj, currentSelectedBlock: null, },()=>{
            this.setState({selectedblockpos:tempdashrect},()=>{
                this.setSelectedblock(true,prod)
            })
           
        });
    }
    //mark stackble products tempory before send call
    markingtempStackableprods=(e,mainitem,prodidx)=>{
        var prodlist=this.state.mapproductList
        var selectedprod=this.state.mapproductList[prodidx]
        var stackablemarkArray=this.state.stackablemarkArray
        var stackblebool=false
        //mark show products stack boolean
        for (let i = 0; i < prodlist.length; i++) {
            const prod = prodlist[i];
            if(selectedprod.productId===prod.productId){
                prod.isStackable=!prod.isStackable
                stackblebool=prod.isStackable
            }
        }
        //check selected product is in stack array
        var haveselectedproductinarray=stackablemarkArray.find(x=>x.productId===selectedprod.productId)
        if(haveselectedproductinarray){
            //remove from array
            var filterarray=stackablemarkArray.filter(x=>x.productId!==selectedprod.productId)
            stackablemarkArray=filterarray

            // for (let f = 0; f < stackablemarkArray.length; f++) {
            //     const ele = stackablemarkArray[f];
            //     ele.productId=selectedprod.productId
            //     if(ele.productId===selectedprod.productId){
            //         ele.isStackable=!ele.isStackable
            //     }
            // }
        }else{
            //add to array
            var obj={
                IsFromFE:true,
                productId : selectedprod.productId,
                isStackable : stackblebool,
                maxStackableCount : this.state.stackableCountofmark===""?0:parseInt(this.state.stackableCountofmark)
            }
            stackablemarkArray.push(obj)
        }

        if(this.props.simType === "AUI" || this.props.simType === "Normal"){
            // const combinedPrds = prodlist.concat(this.state.filteredOtherPrds).filter(prd=>prd.isDelete !== true)
            const combinedPrds = prodlist.filter(prd=>prd.isDelete !== true)
            this.props.getProductAnomalies(this.props.mapFields, this.props.mapCategories, combinedPrds)
        }

        this.setState({stackablemarkArray:stackablemarkArray},()=>{
            this.sendmarkStackableArray() 
        })
        // console.log(haveselectedproductinarray);
    }
    handleMouseClick = (e,mainitem,prodidx) => {
        if((!this.state.isDisableEDitingwithfullscreen&&!this.state.isDisableEdits)){
            //if stackable is on
            if(this.state.markablestackable){
                // if(this._StackablecallTimeout){ 
                //     clearTimeout(this._StackablecallTimeout); 
                // }
                
                // this._StackablecallTimeout = setTimeout(() => {
                // this.sendmarkStackableArray() 
                //     }, 1500);
                this.markingtempStackableprods(e,mainitem,prodidx)
            }
            //end of stackble is on
            //set dragging product
            var cdrgprod =  { prodidx:prodidx, prod: mainitem};

            this.setState({
                isblockmove:false,
                // selectedlocobj:JSON.parse(JSON.stringify(mainitem)),
                currentInternalDraggableProd: cdrgprod,
                isviewcmenu: false,isviewcmenu2:false, contxtmenu: {isexpand: false},
            });
            if(e.nativeEvent.which === 1){//left click
            
            } else if(e.nativeEvent.which === 3){ //right click
                this.handleContextMenu(true, mainitem,prodidx,e);
            }
        }  
    }
    //#MP-SML-E-02
    //delete umoverlap products
    handleDeleteProd=()=>{
        this.fieldHistoryAdd(JSON.parse(JSON.stringify(this.state.mapproductList)),2);
        
        var cmenu = this.state.contxtmenu;
        var cMapProdList = JSON.parse(JSON.stringify(this.state.mapproductList))
        cMapProdList[cmenu.prodidx]["isDelete"] = true;

        let plocobj = cMapProdList[cmenu.prodidx];
        //toched cat list added
        this.TouchedCatListUpdate(plocobj.categoryRectId)
        //if is item sub cat is rule
        let isruleupdating = false;
        if(plocobj.subcategory && plocobj.subcategory.type === catRectEnums.rule){
            //find if rule brand available
            let scatruleid = getNameorIdorColorofBox(plocobj.subcategory, "num");
            let scatrulelevel = (plocobj.subcategory.rule?plocobj.subcategory.rule.level:null);
            
            let findfromrules = findRuleAvailableForBrand(scatruleid, true, scatrulelevel, this.state.mapRulesList);
            // console.log(findfromrules);

            if(findfromrules.isavailable){
                isruleupdating = {parentidx: findfromrules.ruleparentidx, ruleidx: findfromrules.ruleidx};
            }
        }
        //remove counter
        this.handleRemoveProductCounter(cmenu.citem,1);
        
        this.setState({ currentInternalDraggableProd:null, mapproductList: cMapProdList, isviewcmenu: false,  contxtmenu: {xpos:0, ypos: 0, xidx: 0, scatidx: 0} }, () => {
           
            if(this.props.simType === "AUI" || this.props.simType === "Normal"){
                // const combinedPrds = this.state.mapproductList.concat(this.state.filteredOtherPrds).filter(prd => prd.isDelete !== true)
                const combinedPrds = this.state.mapproductList.filter(prd => prd.isDelete !== true)
                this.props.getProductAnomalies(this.props.mapFields, this.props.mapCategories, combinedPrds)
            }
            
            //update rule list if item sub cat is rule
            //check non sim render count and display mange
            this.nonSimProddropremoveCounterupdate("deleteProd")
            if(isruleupdating){
                let updaterulelist = getAllRuleWarnings(this.state.mapCatRects, this.state.mapRulesList, this.state.mapproductList, false, true, isruleupdating);
                // console.log(updaterulelist);
                
                this.setState({ mapRulesList: updaterulelist.rulelist, isRuleWarn: updaterulelist.iswarn });
            }

            //reload imported product update 
            this.compareImportedProds();
        });
         
        this.props.handlehaveChnagesinCat(true);
    }
    //delete all umoverlap products
    handleDeleteAllProds = () => {
        this.fieldHistoryAdd(JSON.parse(JSON.stringify(this.state.mapproductList)),2);
        
        var cmenu = this.state.contxtmenu;
        // console.log(cmenu);
        let deletedItemscount = 0;
        var cMapProdList = JSON.parse(JSON.stringify(this.state.mapproductList));
        let isaddcattouch=false
        let isruleupdating = false;
        for (let i = 0; i < cMapProdList.length; i++) {
            const proditem = cMapProdList[i];
            if(!proditem.isDelete && proditem.shelfrank === cmenu.citem.shelfrank && proditem.barcode === cmenu.citem.barcode){
                if(!isaddcattouch){
                    //cat rect chenged track
                    this.TouchedCatListUpdate(proditem.categoryRectId)
                    isaddcattouch=true
                }
                proditem["isDelete"] = true;
                
                deletedItemscount = (deletedItemscount + 1);

                if(proditem.subcategory && proditem.subcategory.type === catRectEnums.rule){
                    isruleupdating = true;
                }
            }
        }

        this.handleRemoveProductCounter(cmenu.citem, deletedItemscount);
        this.setState({ currentInternalDraggableProd:null, mapproductList: cMapProdList, isviewcmenu: false,  contxtmenu: {xpos:0, ypos: 0, xidx: 0, scatidx: 0} }, () => {
            
            if(this.props.simType === "AUI" || this.props.simType === "Normal"){
                // const combinedPrds = this.state.mapproductList.concat(this.state.filteredOtherPrds).filter(prd=>prd.isDelete !== true)
                const combinedPrds = this.state.mapproductList.filter(prd=>prd.isDelete !== true)
                this.props.getProductAnomalies(this.props.mapFields, this.props.mapCategories, combinedPrds)
            }
            
            //check non sim render count and display mange
             this.nonSimProddropremoveCounterupdate("deleteAllProds")
            //update rule list if item sub cat is rule
            if(isruleupdating){
                let updaterulelist = getAllRuleWarnings(this.state.mapCatRects, this.state.mapRulesList, this.state.mapproductList, false, false);
                // console.log(updaterulelist);
                
                this.setState({ mapRulesList: updaterulelist.rulelist, isRuleWarn: updaterulelist.iswarn });
            }

            //reload imported product update 
            this.compareImportedProds();
        });
        this.props.handlehaveChnagesinCat(true);
       
    }
    //counter of removed products
    handleRemoveProductCounter = (item, removecount) => {
        var toarraypush = true;
        var cremovedProductsCounter = this.state.removedProductsCounter;
        var caddedProductsCounter=this.state.addedProductsCounter
        for (let i = 0; i < cremovedProductsCounter.length; i++) {
            const rpord = cremovedProductsCounter[i];
            //is existing product in list
            if(rpord.barcode === item.barcode){
                toarraypush = false;
                rpord.qty = rpord.qty + (removecount?removecount:1)
                break
            }
        }
        //if empty or newe prosuct
        if(toarraypush){
            var sendobj={
                imageUrl:item.imageUrl,
                barcode: item.barcode,
                productName: item.productName,
                productId: item.productId,
                qty: (removecount?removecount:1)
            }
            cremovedProductsCounter.push(sendobj);
        }


        // adding
        if(caddedProductsCounter.length>0){
            for (let t = 0; t < caddedProductsCounter.length; t++) {
            const element = caddedProductsCounter[t];
            //is existing product in list
            if(element.productId === item.productId){
                
                toarraypush = false;
                element.qty = (((element.qty - (removecount?removecount:1))>-1)?(element.qty - (removecount?removecount:1)):0)
                break
            }
        }}
        this.setState({removedProductsCounter:cremovedProductsCounter,addedProductsCounter:caddedProductsCounter},()=>{
            this.props.handlehaveChnagesinCat(true);
        })
        
    }
    //counter of removed products
    handleAddProductCounter=(item, counts)=>{
        
        var toarraypush=true;
        var caddedProductsCounter=this.state.addedProductsCounter
        var cremovedProductsCounter = this.state.removedProductsCounter;
        for (let i = 0; i < caddedProductsCounter.length; i++) {
            const rpord = caddedProductsCounter[i];
            //is existing product in list
            if(rpord.barcode === item.barcode){
                toarraypush=false
                rpord.qty= (rpord.qty + counts);
                break
            }
        }
        //if empty or newe prosuct
        if(toarraypush){
            var sendobj={
                imageUrl:item.imageUrl,
                barcode: item.barcode,
                productName: item.productName,
                productId: item.productId,
                qty:1
            }
            caddedProductsCounter.push(sendobj);
        }

        //remove
        if(cremovedProductsCounter.length>0){
            for (let t = 0; t < cremovedProductsCounter.length; t++) {
                const rmprod = cremovedProductsCounter[t];
                rmprod.qty= ((rmprod.qty - counts)>-1)?rmprod.qty - counts:0;
            }
        }
        
        this.setState({addedProductsCounter:caddedProductsCounter,removedProductsCounter:cremovedProductsCounter});
    }
    //toggle zoom pan tool
    toggleZoompan = (evt,ismove,enablemove) => {
        if(ismove){
            this.setState({ isAllowPan: enablemove });
        } else{
            this.setState({ activeTool: (this.state.activeTool !== "pan"?"pan":"drawBlock") });
        }
    }
    //find real xy locations of clicking location according to svg viewbox
    xyChangeCoords = (evt) => {
        this.svgCreatePoint.x = evt.clientX;
        this.svgCreatePoint.y = evt.clientY;
    
        // The cursor point, translated into svg coordinates
        var cursorpt =  this.svgCreatePoint.matrixTransform(this.drawSVG.getScreenCTM().inverse());

        return {x: cursorpt.x, y: cursorpt.y};
    }
    //handle zoom feature
    handleZoomInOut = (iszoomin,isreset) => {

        // let editwrapper = document.getElementById(this.state.wrapperId);
        let svgdrawDiemention = this.state.svgdrawDiemention;
        
        // let fieldwidth = (this.state.zoomXRatio > 0 && (editwrapper.clientWidth > svgdrawDiemention.drawWidth)?editwrapper.clientWidth:svgdrawDiemention.drawWidth);
        // let fieldheight = this.state.catDivHeight;

        let svg = document.getElementById(this.state.svgViewId);
        // let viewBox = svg.viewBox.baseVal;
        let curInterDraggable = this.state.currentInternalDraggableProd; 
        let curSelectedBlock = this.state.currentSelectedBlock; 

        let zoomsizex = this.state.zoomXRatio;
        if(iszoomin){
            // viewBox.x = viewBox.x + viewBox.width / 4;
            // viewBox.y = viewBox.y + viewBox.height / 4;
            // viewBox.width = viewBox.width / 2;
            // viewBox.height = viewBox.height / 2;
            
            // if(zoomsizex === 0){
            //     viewBox.x = 0;
            //     viewBox.y = 0;
            // }

            // if(zoomsizex === 0 && (svgdrawDiemention.drawWidth ) < editwrapper.clientWidth){
            //     viewBox.width = (editwrapper.clientWidth / 2);
            // }
            
            zoomsizex = zoomsizex + 1;

            svg.style.width = (svgdrawDiemention.drawWidth * (zoomsizex + 1)) + 'px';

        } else if(isreset){
            // viewBox.x = 0;
            // viewBox.y = 0;
            // viewBox.width = svgdrawDiemention.drawWidth;
            // viewBox.height = fieldheight;

            zoomsizex = 0;

            svg.style.width = svgdrawDiemention.drawWidth + 'px';

            curInterDraggable = null; 
            curSelectedBlock = null;

            this.setState({ activeTool: "drawBlock" });
        } else{
            if(zoomsizex > 0){
                // viewBox.x = 0;
                // viewBox.y = 0;
                // viewBox.width = viewBox.width * 2;
                // viewBox.height = viewBox.height * 2;

                zoomsizex = zoomsizex - 1;
                
                svg.style.width = (svgdrawDiemention.drawWidth + (zoomsizex > 0?(svgdrawDiemention.drawWidth * zoomsizex):0)) + 'px';

                //reset to default view
                if(zoomsizex === 0){
                    // viewBox.x = 0;
                    // viewBox.y = 0;
                    // viewBox.width = svgdrawDiemention.drawWidth;
                    // viewBox.height = fieldheight;
        
                    zoomsizex = 0;

                    svg.style.width = svgdrawDiemention.drawWidth + 'px';
        
                    curInterDraggable = null; 
                    curSelectedBlock = null;

                    this.setState({ activeTool: "drawBlock" });
                }
            } else{
                // viewBox.x = 0;
                // viewBox.y = 0;
                // viewBox.width = svgdrawDiemention.drawWidth;
                // viewBox.height = fieldheight;

                svg.style.width = svgdrawDiemention.drawWidth + 'px';

                zoomsizex = 0;

                curInterDraggable = null; 
                curSelectedBlock = null;

                this.setState({ activeTool: "drawBlock" });
            }
        }
        this.setState({ zoomXRatio: zoomsizex, isviewcmenu: false, currentInternalDraggableProd: curInterDraggable, currentSelectedBlock: curSelectedBlock, contxtmenu: {isexpand: false} });
    }
    //enables pan
    handlePanView = (event) => { 
        if(this.state.isAllowPan && this.state.activeTool === "pan"){
            
            // let svg = document.getElementById(this.state.svgViewId);
            // let viewBox = svg.viewBox.baseVal;

            // //block more going more than layout size
            // //get current viewbox x,y location change
            // let newmovex = (viewBox.x - event.movementX);
            // let newmovey = (viewBox.y - event.movementY);
            
            // viewBox.x = newmovex;
            // viewBox.y = newmovey;

            let parent = document.getElementById(this.state.wrapperId);
            
            parent.scrollLeft= parent.scrollLeft-event.movementX
            parent.scrollTop= parent.scrollTop-event.movementY
        }
    }
    
    
    //back btn validate and redirect
    handlebackbtn=()=>{
        // handlehaveChnagesinCat
        
        if(this.state.historyData.past.length>0 ){
            if(this.state.isStackableEdited){
                this.sendmarkStackableCall()
            }
            confirmAlert({
                title: this.props.t('YOU_HAVE_UNSAVED_CHANGES'),
                message: this.props.t("YOU_HAVE_UNSAVED_CHANGES_SURE_TO_LEAVE"),
                overlayClassName: (this.props.isRTL === "rtl" ? "alertrtl-content" : ""),
                buttons: [{
                    label: this.props.t('btnnames.yes'),
                    onClick: () => {
                        // this.reSetNewProdsRemoveProdstoPrevious()
                        this.props.getProductAnomalies(this.props.mapFields, this.props.mapCategories, this.props.mapProducts)
                        this.props.setMpEditStackHistory(null)
                        this.props.handlehaveChnagesinCat(false)
                        this.props.toggleOneCategory()
                    }
                }, {
                    label: this.props.t('btnnames.no'),
                    onClick: () => {
                        return false;
                    }
                }]
            });
        }else{
            if(this.state.isStackableEdited&&this.props.mpstate.mpStackableProdList!==null?this.props.mpstate.mpStackableProdList.length>0:false){
                  //if markstackable have changes
                this.sendmarkStackableCall("back")
            }else{
                this.props.toggleOneCategory()
            }
        }
       
    }
    //new tools handle
    handleToolControls = (viewid,tooltype, event, startpan) => {
        let activezoompan = true;
        
        let svg = document.getElementById(viewid);
        let viewBox = svg.viewBox.baseVal;

        //view width/height
        let vwidth = this.state.viewWidth;
        let vheight = this.state.viewHeight;

        let iszpactive = this.state.zoompanactive;
        let actool = this.state.activeTool;
        let stpan = this.state.startpan;

        let zoomdrawx = this.state.zoomDrawX;
        let aczoomdrawx = this.state.aczoomDrawX;
        
        if(tooltype === "zoomin"){
            this.handleZoomInOut(viewid,true,false);

            zoomdrawx = zoomdrawx + 1;
            this.setState({ isShowProdView: false, isenablefieldedit: false, isviewvmenu: false });
        } else if(tooltype === "zoomout"){
            if(roundOffDecimal(vwidth,2) <= roundOffDecimal((viewBox.width * 2),2)){
                activezoompan = false;
                this.handleZoomInOut(viewid,false,true,vwidth,vheight);

                zoomdrawx = 0;
            } else{
                this.handleZoomInOut(viewid,false,false,vwidth);

                zoomdrawx = zoomdrawx - 1;
            }

        } else if(tooltype === "zoomreset"){
            activezoompan = false;
            this.handleZoomInOut(viewid,false,true,vwidth,vheight);

            this.setState({ activeTool: "drawBlock" });
            zoomdrawx = 0;

        }
        
        if(tooltype === "zoomin" || tooltype === "zoomout" || tooltype === "zoomreset"){
            //console.log(tooltype);
            this.setState({ zoomDrawX: zoomdrawx, aczoomDrawX: aczoomdrawx, isviewcmenu: false, contxtmenu:{isexpand: false} }, () => {
                if(zoomdrawx === 0){
                    this.checkEnableFieldEdit();
                }
            });
        }
        
        if(tooltype === "pan"){
            if(actool === "pantool" && stpan){
                let fielddetails = { drawWidth: this.state.viewWidth, drawHeight: this.state.viewHeight };
                this.handlePanView(viewid, event, iszpactive, this.state.zoomDrawX, fielddetails);
            }
        } else if(tooltype === "panstart"){
            this.setState({ startpan: startpan });
        } else if(tooltype === "pantool" || tooltype === "shelvemove"||tooltype==="drawBlock"){
            this.setState({ activeTool: (tooltype === actool?"drawBlock":tooltype) });
        } else{
            this.setState({ zoompanactive: activezoompan, allowovrflwprod: (activezoompan && this.state.allowovrflwprod?false:this.state.allowovrflwprod) });
        }
    }
    propComparator = (propName) =>(a, b) => a[propName] === b[propName] ? 0 : a[propName] < b[propName] ? -1 : 1

    updateSaveObjChild=(newfields,shelfIdx,BrandIdx)=>{
        this.setState({selectedlocobj:null, currentSelectedBlock: null, currentInternalDraggableProd: null, isblockmove: false});
    }

    nullselectedlocobjnull=()=>{
        this.setState({selectedlocobj:null})
    }
   
    //clickon svgMouseDown
    svgMouseDown=(e)=>{
        if(this.state.activeTool==="pan"){
            this.toggleZoompan(e,true,true)
        }else if(this.state.activeTool==="drawBlock"){
            this.startNewRect(e)
        }
        
    }
    //clickon svgMouseMove
    svgMouseMove=(e)=>{
        if(this.state.activeTool==="pan"){
            this.handlePanView(e)
        }else if(this.state.activeTool==="drawBlock"){
            this.changeDashRect(e)
        }
        
    }
    //clickon svgMouseUp
    svgMouseUp=(e)=>{
        if(this.state.activeTool==="pan"){
            this.toggleZoompan(e,true,false)
        }else if(this.state.activeTool==="drawBlock"){
            this.drawNewRect(e)
        }
    }
    startNewRect=(e)=>{
        if( e.nativeEvent.which === 1&& !this.state.markablestackable&&(!this.state.isDisableEDitingwithfullscreen&&!this.state.isDisableEdits)){ //only left mouse click
            let normalize_pointer = this.getScreenPointer(e);

            let newoffx = normalize_pointer.x;
            let newoffy = normalize_pointer.y;
            
            var positionobj = elmAccordingtoXY(newoffx,newoffy, 0, 0,this.state.mapFields,this.state.mapCatRects);
            var drawingDetails = ((Object.keys(positionobj).length > 0)?positionobj:null);
            
            this.setState({
                newrectstart: {x: newoffx, y:newoffy},
                isshowdash: true, 
                dashrect: { drawingDetails:drawingDetails, startx: newoffx, starty: newoffy, x: newoffx, y:newoffy, width: 0, height: 0, percentage: 0 }
            },()=>{
                // console.log(this.state.dashrect);
            });
        }
    }
    //get new x point
    getScreenPointer = (e) => {
        let svg = document.getElementById(this.state.svgViewId);
        let point = svg.createSVGPoint();
        point.x = e.nativeEvent.clientX;
        point.y = e.nativeEvent.clientY;
        let target = e.target;
        let ctm = (target.getScreenCTM?target.getScreenCTM():null);

        return (ctm?point.matrixTransform(ctm.inverse()):{x: 0, y: 0});
    }

    changeDashRect = (e) => {
        if (e && this.state.isshowdash) {
            var cobj = this.state.dashrect;
            
            if(cobj && cobj.drawingDetails && cobj.drawingDetails.catrect && cobj.drawingDetails.catrect.drawMarginstartY !== null){
                let normalize_pointer = this.getScreenPointer(e);
                
                let scrollobj = { x: normalize_pointer.x, y: normalize_pointer.y, drawWidth: 1, drawHeight: 1 };

                cobj["pointerX"] = normalize_pointer.x;
                cobj["pointerY"] = normalize_pointer.y;

                cobj["x"] = (cobj.startx < normalize_pointer.x?cobj.x:normalize_pointer.x);
                cobj["y"] = (cobj.starty < normalize_pointer.y?cobj.y:normalize_pointer.y);
                
                let boxwidth = (cobj.startx < normalize_pointer.x?Math.abs(normalize_pointer.x - cobj.startx):Math.abs(cobj.startx - normalize_pointer.x));
                cobj["width"] = boxwidth;

                let boxheight = (cobj.starty < normalize_pointer.y?Math.abs(normalize_pointer.y - cobj.starty):Math.abs(cobj.starty - normalize_pointer.y));
                cobj["height"] = boxheight;
                
                var dDetails = cobj.drawingDetails;
                if(dDetails.catrect){
                    /* if(dDetails.catrect.drawMarginstartY > cobj.y){
                        cobj["y"] = dDetails.catrect.drawMarginstartY;
                    } */
                    
                    // (dDetails.catrect.drawMarginstartY + dDetails.catrect.drawHeightMargin)
                    let fieldy2 = (dDetails.field && dDetails.field.drawHeight?(dDetails.field.y + dDetails.field.drawHeight):0);
                    if(fieldy2 < (cobj.y + cobj.height)){
                        // cobj["height"] = ((dDetails.catrect.drawMarginstartY + dDetails.catrect.drawHeightMargin) - cobj.y);
                        cobj["height"] = dDetails.field.drawHeight;
                    }

                    if(dDetails.catrect.x > cobj.x){
                        cobj["x"] = dDetails.catrect.x;
                    }

                    if((dDetails.catrect.x + dDetails.catrect.drawWidth) < (cobj.x + cobj.width)){
                        cobj["width"] = ((dDetails.catrect.x + dDetails.catrect.drawWidth) - cobj.x);
                    }
                    
                }

                //scroll parent with drag
                this.scrollParentWithDrag(scrollobj);
                
                this.setState({ dashrect: cobj });
            }
        } 
    }
    drawNewRect=(e)=>{
        if ( this.state.isshowdash) {
            if( e.nativeEvent.which === 1){ //only left mouse click
                var drawedSelectionRect=JSON.parse(JSON.stringify(this.state.dashrect));
                // console.log(drawedSelectionRect);
                this.setState({ 
                    selectedblockpos:drawedSelectionRect,
                    isshowdash: false, 
                    dashrect: { startx:0, starty: 0, x: 0, y: 0, width: 0, height: 0, percentage: 0 },
                    ghostWrapperObj: null,
                },()=>{
                    // console.log(this.state.selectedblockpos);
                    this.setSelectedblock()
                })
            }
        }
    }
   
    //#MP-SML-E-BS1
    setSelectedblock=(iscontextnmenu,contextProd)=>{
        var pselectedBlock = this.state.selectedblockpos;
        let fieldobj = (pselectedBlock.drawingDetails && pselectedBlock.drawingDetails.field?pselectedBlock.drawingDetails.field:null)
        if(fieldobj){
            var minStartX = pselectedBlock.x;
            var minStartY = pselectedBlock.y;
            var minEndY = roundOffDecimal((pselectedBlock.y+pselectedBlock.height),2);
            var minEndX = roundOffDecimal((pselectedBlock.x+pselectedBlock.width),2);
            var retrurnObj=null
            let checkfieldobj = this.state.mapFields[fieldobj.key];
            if(iscontextnmenu){
                var contextstruc={
                    isNoproducts:false,
                    selectedProds:[contextProd],
                    startProd:contextProd,
                }
                retrurnObj=contextstruc
            }else{
                retrurnObj = GetContainingProdsByBox(minStartX,minStartY,minEndX,minEndY,this.state.mapproductList, checkfieldobj);
            }
           
            // var retrurnObj = GetContainingProdsByBox(minStartX,minStartY,minEndX,minEndY,this.state.mapproductList, checkfieldobj);
            // console.log("loc 3",minStartX,minStartY,minEndX,minEndY,this.state.mapproductList, checkfieldobj);
            var containElem = elmAccordingtoXY(minStartX,minStartY,pselectedBlock.width,pselectedBlock.height,this.state.mapFields,this.state.mapCatRects)
            var containElemend = elmAccordingtoXY(minStartX+pselectedBlock.width,minStartY+pselectedBlock.height,pselectedBlock.width,pselectedBlock.height,this.state.mapFields,this.state.mapCatRects)//box end point
            // console.log(containElem.field.uom);
            if(!retrurnObj.isNoproducts){
                let notDeletedProds = retrurnObj.selectedProds.filter(x => !x.isDelete);
                
                // let cactivetool = JSON.parse(JSON.stringify(this.state.activeTool));
                if(notDeletedProds && notDeletedProds.length > 0){
                    this.setState({ activeTool: "default",
                     isviewcmenu: iscontextnmenu?this.state.isviewcmenu:false, contxtmenu: iscontextnmenu?this.state.contxtmenu:{isexpand: false}
                     }, () => { // 
                    
                        // var curselloc = notDeletedProds[0];
                        let newblockobj = {  drawingProducts: notDeletedProds,currfielduom:containElem.field?containElem.field.uom:containElemend.field };

                        if(notDeletedProds && notDeletedProds.length > 0){
                            var internalProd={
                                prodidx: notDeletedProds[0].prodidx,
                                prod: notDeletedProds[0]
                            }
                            
                            this.setState({
                                currentInternalDraggableProd: internalProd,
                                currentDraggableProd:notDeletedProds[0],
                                // activeTool: cactivetool, 
                                isselectprodblock: true, 
                                isblockmove: true, 
                                currentSelectedBlock: newblockobj, 
                                contxtmenu:iscontextnmenu?this.state.contxtmenu:{isexpand: false}, 
                                selectedlocobj: null
                            },()=>{
                                this.handleToolControls(this.state.svgViewId,"drawBlock")
                            });
                        } else{
                            alertService.error(this.props.t("PRODUCT_BLOCK_NOT_FOUND"));
                        }
                    });
                }
                
            }
        }
    }

    handlePreviewModal = (obj, type) =>{
        this.setState({productId:(obj?(obj.productId?obj.productId:obj.id):0), showPreviewImageModal:type});
    }

    handleBlockContextMenu=(e,isshow,x,y,width,height,selectedprods)=>{
        // let editwrapper = document.getElementById(this.state.wrapperId);
        // let viewboxcoords = this.getScreenPointer(e);
        // let reducescrolledgap = (viewboxcoords.x - editwrapper.scrollLeft); 

        var isAuismallScreen=((!this.props.isShowFromPreview && !this.props.isFullscreenEditModal)&&(this.props.simType==="AUI"))?true:false
        var redY=0
        var contextX=e.clientX
        if(isAuismallScreen){
            var auiscroll=document.getElementById("aui-sim-scroll-main")
            redY=auiscroll.scrollTop
            contextX=this.props.isRTL === "rtl" ?(e.clientX-this.state.AUISideBarGap)-230:e.clientX-this.state.AUISideBarGap
        }
        
        let cobj = {
            xpos: contextX,//e.clientX,
            ypos: (e.clientY+redY)-110,//e.clientY
        };
      
        //if block item have selected only one produc
        if(selectedprods&&selectedprods.length===1){
            let prodlist=this.state.mapproductList
            
            let index=prodlist.findIndex(p=>p.id.toString()===selectedprods[0].id.toString())
            cobj["prodidx"]=index
            cobj["citem"]=selectedprods[0]
            this.setState({ isviewcmenu: isshow, contxtmenu: cobj });
        }else{
            //block context menu display
            this.setState({ isviewcmenu2: isshow, contxtmenu2: cobj });
        }
        
    }
    confirmingDeleteSelecteBlock=()=>{
        this.handleSelectedBlockDelete();
    }
    //#MP-SML-E-BD1
    handleSelectedBlockDelete = () => {
        this.fieldHistoryAdd(JSON.parse(JSON.stringify(this.state.mapproductList)),2);

        let cprodlist = this.state.mapproductList;
        let selectedblock = JSON.parse(JSON.stringify(this.state.currentSelectedBlock));
        
        // let firstitem = selectedblock.newDrawingProducts[0];
        // let removecount = selectedblock.newDrawingProducts.length;
        //cat rect chenged track
        this.TouchedCatListUpdate(selectedblock.newDrawingProducts[0].categoryRectId)
        let isruleupdating = false;
        let deleteprodlist = [];
        for (let s = 0; s < selectedblock.newDrawingProducts.length; s++) {
            const selectedproditem = selectedblock.newDrawingProducts[s];
            cprodlist[selectedproditem.prodidx]["isDelete"] = true;

            if(selectedproditem.subcategory && selectedproditem.subcategory.type === catRectEnums.rule){
                isruleupdating = true;
            }

            let isalreadyadded = deleteprodlist.findIndex(x => x.prodobj.productId === selectedproditem.productId);
            if(isalreadyadded === -1){
                let removecount = selectedblock.newDrawingProducts.filter(z => z.productId === selectedproditem.productId);
                deleteprodlist.push({prodobj: selectedproditem, removecount: removecount.length});
            }
        }
        // console.log(deleteprodlist);
        
        this.setState({ mapproductList: cprodlist, currentSelectedBlock: null, isviewcmenu2: false, currentInternalDraggableProd: null }, () => {
            
            if(this.props.simType === "AUI" || this.props.simType === "Normal"){
                // const combinedPrds = this.state.mapproductList.concat(this.state.filteredOtherPrds).filter(prd=>prd.isDelete !== true)
                const combinedPrds = this.state.mapproductList.filter(prd=>prd.isDelete !== true)
                this.props.getProductAnomalies(this.props.mapFields, this.props.mapCategories, combinedPrds)
            }
            
            if(deleteprodlist.length > 0){
                for (let i = 0; i < deleteprodlist.length; i++) {
                    const delteproditem = deleteprodlist[i];
                    this.handleRemoveProductCounter(delteproditem.prodobj, delteproditem.removecount);
                }
            }
            
            this.props.handlehaveChnagesinCat(true);
            //check non sim render count and display mange
            this.nonSimProddropremoveCounterupdate("blockDelete")
            //update rule list if item sub cat is rule
            if(isruleupdating){
                let updaterulelist = getAllRuleWarnings(this.state.mapCatRects, this.state.mapRulesList, this.state.mapproductList, false, false);
                // console.log(updaterulelist);
                
                this.setState({ mapRulesList: updaterulelist.rulelist, isRuleWarn: updaterulelist.iswarn });
            }

            //reload imported product update 
            this.compareImportedProds();
        });
    }

    hadnleremoveblockcounter=(shelfIdx,brnadidx)=>{
        var  prods=this.state.currentSelectedBlock.drawingProducts
        for (let i = 0; i < prods.length; i++) {
            const prod = prods[i];
            this.handleRemoveProductCounter(prod,shelfIdx,brnadidx,1);
            
        }
    }
    //#MP-SML-E-BCU1
    //cut block
    handleBlockCut = (iscopy,isFromDelete) => {
        this.fieldHistoryAdd(JSON.parse(JSON.stringify(this.state.mapproductList)),2);
        // if(!iscopy){
        //     this.fieldHistoryAdd(JSON.parse(JSON.stringify(this.state.mapproductList)),2);
        // }

        let cprodlist = this.state.mapproductList;
        let selectedblock = this.state.currentSelectedBlock;
        //cat rect chenged track
        this.TouchedCatListUpdate(selectedblock.newDrawingProducts[0].categoryRectId)
        let selcutlist = null;
        let isruleupdating = false;
        var shelfs=[]
        //counter
        let deleteprodlist = [];
        //end

        for (let s = 0; s < selectedblock.selectedshelves.length; s++) {
            const shlfitem = selectedblock.selectedshelves[s];
            let products=shlfitem.selectedProducts 
            // products.forEach(prod => {
            //     prod["startingPointDraw"]=prod.x
            //     prod["startingPoint"]=prod.x/this.state.displayRatio
            //     prod.isNew= true
            //     prod.isDelete= false
            // });
            // selcutlist.push({ rank: shlfitem.rank, iscopy: iscopy, prods: shlfitem.selectedProducts });

            if(!iscopy){
                for (let j = 0; j < shlfitem.selectedProducts.length; j++) {
                    const sproditem = shlfitem.selectedProducts[j];
                    
                    cprodlist[sproditem.prodidx]["isDelete"] = true;

                    if(cprodlist[sproditem.prodidx].subcategory && cprodlist[sproditem.prodidx].subcategory.type === catRectEnums.rule){
                        isruleupdating = true;
                    }

                    //counter
                    let isalreadyadded = deleteprodlist.findIndex(x => x.prodobj.productId === sproditem.productId);
                    if(isalreadyadded === -1){
                        let removecount = selectedblock.newDrawingProducts.filter(z => z.productId === sproditem.productId);
                        deleteprodlist.push({prodobj: sproditem, removecount: removecount.length});
                    }
                     //end              
                }
            }
            shelfs.push({shelfrank:shlfitem.rank,products:products})
        }
        //making new clip board obj
        selcutlist={
            groupUUID: uuidv4(),isNew:true, isDelete: false, mode: isFromDelete?"delete":iscopy?"copy":"cut" ,uom:selectedblock.currfielduom,shelf:shelfs
        }
        
        this.updateCutList(selcutlist);
        this.setState({ mapproductList: cprodlist, currentSelectedBlock: null, isviewcmenu2: false, currentInternalDraggableProd: null }, () => {
            
            if(this.props.simType === "AUI" || this.props.simType === "Normal"){
                // const combinedPrds = this.state.mapproductList.concat(this.state.filteredOtherPrds).filter(prd=>prd.isDelete !== true)
                const combinedPrds = this.state.mapproductList.filter(prd=>prd.isDelete !== true)
                this.props.getProductAnomalies(this.props.mapFields, this.props.mapCategories, combinedPrds)
            }

            //counter
            if(deleteprodlist.length > 0){
                for (let i = 0; i < deleteprodlist.length; i++) {
                    const delteproditem = deleteprodlist[i];
                    this.handleRemoveProductCounter(delteproditem.prodobj, delteproditem.removecount);
                }
            }
            //end
            
            //check non sim render count and display mange
             this.nonSimProddropremoveCounterupdate("blockCut")
            //update rule list if item sub cat is rule
            if(isruleupdating){
                let updaterulelist = getAllRuleWarnings(this.state.mapCatRects, this.state.mapRulesList, this.state.mapproductList, false, false);
                // console.log(updaterulelist);
                
                this.setState({ mapRulesList: updaterulelist.rulelist, isRuleWarn: updaterulelist.iswarn });
            }

            // this.cacheClipboardandOtherOnlyCutProdsReplace()

            //reload imported product update 
            this.compareImportedProds();
        });
    }
     //cut block old
    //  handleBlockCutOld = (iscopy) => {
    //     // this.fieldHistoryAdd(JSON.parse(JSON.stringify(this.state.mapproductList)),2);
    //     if(!iscopy){
    //         this.fieldHistoryAdd(JSON.parse(JSON.stringify(this.state.mapproductList)),2);
    //     }

    //     let cprodlist = this.state.mapproductList;
    //     let selectedblock = this.state.currentSelectedBlock;
    //     //cat rect chenged track
    //     this.TouchedCatListUpdate(selectedblock.newDrawingProducts[0].categoryRectId)
    //     let selcutlist = [];
    //     let isruleupdating = false;
    //     for (let s = 0; s < selectedblock.selectedshelves.length; s++) {
    //         const shlfitem = selectedblock.selectedshelves[s];
    //         selcutlist.push({ rank: shlfitem.rank, iscopy: iscopy, prods: shlfitem.selectedProducts });

    //         if(!iscopy){
    //             for (let j = 0; j < shlfitem.selectedProducts.length; j++) {
    //                 const sproditem = shlfitem.selectedProducts[j];
                    
    //                 cprodlist[sproditem.prodidx]["isDelete"] = true;

    //                 if(cprodlist[sproditem.prodidx].subcategory && cprodlist[sproditem.prodidx].subcategory.type === catRectEnums.rule){
    //                     isruleupdating = true;
    //                 }
    //             }
    //         }
    //     }

        
    //     this.updateCutList(selcutlist);
    //     this.setState({ mapproductList: cprodlist, currentSelectedBlock: null, isviewcmenu2: false, currentInternalDraggableProd: null }, () => {
            
    //         if(this.props.simType === "AUI" || this.props.simType === "Normal"){
    //             const combinedPrds = this.state.mapproductList.concat(this.state.filteredOtherPrds).filter(prd=>prd.isDelete !== true)
    //             this.props.getProductAnomalies(this.props.mapFields,combinedPrds)
    //         }
            
    //         //check non sim render count and display mange
    //          this.nonSimProddropremoveCounterupdate("blockCut")
    //         //update rule list if item sub cat is rule
    //         if(isruleupdating){
    //             let updaterulelist = getAllRuleWarnings(this.state.mapCatRects, this.state.mapRulesList, this.state.mapproductList, false, false);
    //             // console.log(updaterulelist);
                
    //             this.setState({ mapRulesList: updaterulelist.rulelist, isRuleWarn: updaterulelist.iswarn });
    //         }

    //         this.cacheClipboardandOtherOnlyCutProdsReplace()
    //     });
    // }
      
    handleclipbordopen=(seltab)=>{
        if(this.state.isStackableEdited){
            this.sendmarkStackableCall()
        }

        this.setState({productTab: seltab},()=>{
            if(this.state.productTab!== "saleCycle" && seltab !== "saleCycle"){
                 this.setState({selectedScProductId: -1})
            }
            
            //close excel info popover
            this.closeExcelUploadFile();
        })
    }
    //load ghost from parent
    ghostFromParent = (evt, viewobj, isignore) => {
        let ghostviewobj = this.state.ghostWrapperObj;
        // console.log(ghostviewobj);

        if(!isignore && ghostviewobj){
            viewobj.drawWidth = ghostviewobj.width;
            viewobj.drawHeight = ghostviewobj.height;
        }

        ghostOnDrag(evt, viewobj, this.oriPageXY);
    }
    handleXrayDepView=(type)=>{ 
        this.setState({xrayActive:type})
    }
    updateProductList=(mapprodList, isruleupdating)=>{
        this.setState({mapproductList:mapprodList, currentSelectedBlock: null, currentInternalDraggableProd: null, isContentDragging: false}, () => {
            
            if(this.props.simType === "AUI" || this.props.simType === "Normal"){
                // const combinedPrds = this.state.mapproductList.concat(this.state.filteredOtherPrds).filter(prd=>prd.isDelete !== true)
                const combinedPrds = this.state.mapproductList.filter(prd=>prd.isDelete !== true)
                this.props.getProductAnomalies(this.props.mapFields, this.props.mapCategories, combinedPrds)
            }
            
            this.nonSimProddropremoveCounterupdate("updateprodList")
            //update rule list if item sub cat is rule
            //update rule list if item sub cat is rule
            if(isruleupdating){
                let updaterulelist = getAllRuleWarnings(this.state.mapCatRects, this.state.mapRulesList, this.state.mapproductList, false, false);
                // console.log(updaterulelist);
                
                this.setState({ mapRulesList: updaterulelist.rulelist, isRuleWarn: updaterulelist.iswarn });
            }
        });
        this.props.handlehaveChnagesinCat(true);
    }
    // newClipBoardToched=(value)=>{
    //     this.setState({isNewClipBoardTouched:value})
    // }
    //
    updateSingleCutProduct = (dragprod, isremove, cidx,groupUUID,ismanualRemove) => {
        // console.log(draggingProduct.singleidx);
        //                 console.log(draggingProduct.cutidx);
        //                 console.log(draggingProduct.cutshelfidx);
        // let cutarray = this.state.newCutarray;
        let cutarray = this.state.cutNewArray;

        if(!isremove){
            let selectedgroupidx=cutarray.findIndex(x=>x.groupUUID===dragprod.clipGroupid)
            let selectedshelfidx=cutarray[selectedgroupidx].shelf.findIndex(c=>c.shelfRank===dragprod.clipShelfrank)
            // let selectedprodidx=cutarray[selectedgroupidx].shelf[selectedshelfidx].products.findIndex(v=>v.id=dragprod.clipprodid)

            // let changingitem = cutarray[dragprod.cutidx].shelf[dragprod.cutshelfidx];
              let changingitem = cutarray[selectedgroupidx].shelf[selectedshelfidx];
            // let changingitem =cutarray.find(x=>x.groupUUID===dragprod.clipGroupid).find(c=>c.shelfRank===dragprod.clipShelfrank).find(v=>v.clipprodid)

            let cutitems = []; let reduceamount = 0;
            let totalwidth = 0;
            for (let i = 0; i < changingitem.products.length; i++) {
                const cutprod = changingitem.products[i];
                
                if(dragprod.singleidx !== i){
                    if(cutprod.isDelete!==true){
                        cutprod.x = (cutprod.x - reduceamount);
                        cutprod.startingPoint= cutprod.x/this.state.displayRatio
                        totalwidth = (cutprod.x + cutprod.drawWidth);
                    }
                   
                    cutitems.push(cutprod);
    
                    
                } else {
                    cutprod.isDelete=true
                    cutitems.push(cutprod);
                    reduceamount = cutprod.drawWidth;
                }
            }
            var filteredcutitems=cutitems.filter(x=>x.isDelete!==true)
            if(filteredcutitems.length > 0){
                changingitem.products = cutitems;
                changingitem["width"] = totalwidth;
            } else{
                
                // if(cutarray.isNew){
                //     cutarray.splice(selectedgroupidx, 1);
                // }else{
                    cutarray[selectedgroupidx].shelf[selectedshelfidx].isDelete=true
                    var filtershelves= cutarray[selectedgroupidx].shelf.filter(f=>f.isDelete!==true)
                    if(filtershelves.length===0){
                        cutarray[selectedgroupidx].isDelete=true
                    }
                // }
                
            }

            var notdeletedshelves=cutarray[selectedgroupidx].shelf.filter(c=>c.isDelete!==true)
            var notdeletedshelvesmaxwidthsort= notdeletedshelves.sort((a,b) =>  b.width - a.width);
            if(notdeletedshelvesmaxwidthsort.length>0){
                cutarray[selectedgroupidx].width=notdeletedshelvesmaxwidthsort[0].width
                var cheight=0
                notdeletedshelves.forEach(shlf => {
                    cheight=cheight+shlf.height
                });
                cutarray[selectedgroupidx].height=cheight
            }
            
        } else{
            var findixd = this.state.cutNewArray.findIndex(v=>v.groupUUID===groupUUID)

            if(ismanualRemove)  {
                confirmAlert({
                    title: this.props.t('SURE_TO_REMOVE_THIS'),
                    message: this.props.t('THIS_WILL_REMOVE_FROM_CLIPBOARD_AFTER_SAVE_PLANOGRAM_SURETO_CONTINUE'),
                    overlayClassName: (this.props.isRTL === "rtl" ? "alertrtl-content" : ""),
                    buttons: [{
                        label: this.props.t('btnnames.yes'),
                        onClick: () => {
                            this.setState({isClipboardreload:false},()=>{
                                // this.newClipBoardToched(true)
                                this.fieldHistoryAdd(JSON.parse(JSON.stringify(this.state.mapproductList)),2);
                                if(cutarray[findixd].isNew){
                                    cutarray.splice(findixd, 1);
                                }else{
                                    cutarray[findixd].isDelete=true
                                }
                                this.setState({
                                    isClipboardreload:true
                                })
                            })
                            
                        }
                    }, {
                        label: this.props.t('btnnames.no')
                    }]
                });

            }else{
                if(cutarray[findixd].isNew){
                    cutarray.splice(findixd, 1);
                }else{
                    cutarray[findixd].isDelete=true
                }
            }
                        
            

            
            
        }
        
        // this.setState({ cutArray: cutarray },()=>{
        this.setState({ cutNewArray: cutarray },()=>{
            // this.cacheClipboardandOtherOnlyCutProdsReplace()
        });
        this.props.handlehaveChnagesinCat(true);  
              
    }
    //update cut list
    updateCutList = (cutlist) => {
        // console.log(cutlist);
        // if(cutlist && cutlist.length > 0){
        if(cutlist&&cutlist.shelf.length>0 ){
            let curcutlist = this.state.cutNewArray;

            // for (let i = 0; i < cutlist.length; i++) {
                // const cutshelfobj = JSON.parse(JSON.stringify(cutlist[i]));
                const cutshelfobj = cutlist
                var maxwdithoftile=0
                var maxheightoftile=0
                cutshelfobj.shelf.forEach(cutshelf => {
                    // let sorttolowy = cutshelf.products.sort((a,b) => a.y - b.y);
                    cutshelf.shelfRank=cutshelf.shelfrank
                    let toheighstsortarray= JSON.parse(JSON.stringify(cutshelf.products))
                    let sorttomaxheight = toheighstsortarray.sort((a,b) =>  b.height - a.height);
                    // let lowyprody = sorttolowy[0].y;
                
                    let sortprods = cutshelf.products.sort((a,b) => a.x - b.x);

                    let lowestxprod = JSON.parse(JSON.stringify(sortprods[0]));
                    let svgwidth = 0; let svgheight = 0;
                    let maxheightofprod=0
                    for (let j = 0; j < sortprods.length; j++) {
                        const sortitem = sortprods[j];
                        
                        let gapbetweenlowest = (sortitem.x - lowestxprod.x);
                        sortitem["x"] = gapbetweenlowest;
                        sortitem["startingPointDraw"]=sortitem.x
                        sortitem["startingPoint"]=sortitem.x/this.state.displayRatio
                        sortitem.isNew= true
                        sortitem.isDelete= false
                        sortitem["xCoppy"] = gapbetweenlowest;
                        sortitem["drawWidthCoppy"] = sortitem.drawWidth;
                        sortitem["drawHeightCoppy"] = sortitem.drawHeight;
                        let gapbetweenlowesty = sorttomaxheight[0].drawHeight-sortitem.drawHeight//(sortitem.y - lowyprody);
                        sortitem["gaptolowy"] = gapbetweenlowesty;
                        
                        svgwidth = (gapbetweenlowest + sortitem.drawWidth);
                        svgheight = (svgheight < sortitem.drawHeight?sortitem.drawHeight:svgheight);
                        maxheightofprod=maxheightofprod<sortitem.drawHeight?sortitem.drawHeight:maxheightofprod
                    }
                    maxheightoftile=maxheightoftile+maxheightofprod
                    cutshelf["id"] = uuidv4();
                    cutshelf["width"] = svgwidth;
                    cutshelf["height"] = svgheight;
                    // cutshelf["widthCoppy"] = svgwidth;
                    // cutshelf["heightCoppy"] = svgheight;
                    // cutshelf["ratio"] = this.state.displayRatio;
                    
                    // cutshelf["added_categoryRectId"] = sortprods[0].categoryRectId;
                    cutshelf.products = sortprods;
                    maxwdithoftile=maxwdithoftile<cutshelf.width?cutshelf.width:maxwdithoftile
                    
                });
                cutshelfobj["width"]=maxwdithoftile
                cutshelfobj["height"]=maxheightoftile
                cutshelfobj["is_cutitem"] = true;
                curcutlist.push(cutshelfobj);
            // }
            // console.log(curcutlist);
            this.setState({ cutNewArray: curcutlist },()=>{
                // this.cacheClipboardandOtherOnlyCutProdsReplace()
            });
            this.props.handlehaveChnagesinCat(true);
        }
    }
     //update cut list
    //  updateCutListOld = (cutlist) => {
    //     // console.log(cutlist);

    //     if(cutlist && cutlist.length > 0){
    //         let curcutlist = this.state.cutArray;

    //         for (let i = 0; i < cutlist.length; i++) {
    //             const cutshelf = JSON.parse(JSON.stringify(cutlist[i]));

    //             let sorttolowy = cutshelf.prods.sort((a,b) => a.y - b.y);
    //             let lowyprody = sorttolowy[0].y;
                
    //             let sortprods = cutshelf.prods.sort((a,b) => a.x - b.x);

    //             let lowestxprod = JSON.parse(JSON.stringify(sortprods[0]));
    //             let svgwidth = 0; let svgheight = 0;
    //             for (let j = 0; j < sortprods.length; j++) {
    //                 const sortitem = sortprods[j];
                    
    //                 let gapbetweenlowest = (sortitem.x - lowestxprod.x);
    //                 sortitem["x"] = gapbetweenlowest;
    //                 sortitem["xCoppy"] = gapbetweenlowest;
    //                 sortitem["drawWidthCoppy"] = sortitem.drawWidth;
    //                 sortitem["drawHeightCoppy"] = sortitem.drawHeight;
    //                 let gapbetweenlowesty = (sortitem.y - lowyprody);
    //                 sortitem["gaptolowy"] = gapbetweenlowesty;
                    
    //                 svgwidth = (gapbetweenlowest + sortitem.drawWidth);
    //                 svgheight = (svgheight < sortitem.drawHeight?sortitem.drawHeight:svgheight);
    //             }
                
    //             cutshelf["id"] = uuidv4();
    //             cutshelf["width"] = svgwidth;
    //             cutshelf["height"] = svgheight;
    //             cutshelf["widthCoppy"] = svgwidth;
    //             cutshelf["heightCoppy"] = svgheight;
    //             cutshelf["ratio"] = this.state.displayRatio;
    //             cutshelf["is_cutitem"] = true;
    //             cutshelf["added_categoryRectId"] = sortprods[0].categoryRectId;
    //             cutshelf.prods = sortprods;

    //             curcutlist.push(cutshelf);
    //         }
            
    //         // console.log(curcutlist);
    //         this.setState({ cutArray: curcutlist },()=>{
    //             this.cacheClipboardandOtherOnlyCutProdsReplace()
    //         });
    //         this.props.handlehaveChnagesinCat(true);
    //     }
    // }
    //toggle clipboard drag type
    toggleClipDragType = (ctype) => {
        this.setState({ clipDragType: ctype });
    }
    
    setPreviewGuid = (isReset, previewShelves, field, isMoveClear, previewSendProdList) => {
        // console.log(structuredClone(previewShelves));
        
        let filedmapobj = this.state.mapFields;
        // let previewProdList = (previewSendProdList && previewSendProdList.length > 0?previewSendProdList:[]);
        let previewProdList = [];
        let ghostobj = { width: 0, height: 0 };

        if(isReset || isMoveClear){
            for (let key of Object.keys(filedmapobj)) {
                let fieldobj = filedmapobj[key];
    
                for (let i = 0; i < fieldobj.shelf.length; i++) {
                    const fieldshelf = fieldobj.shelf[i];
                    fieldshelf["previewguid"] = {startX:-1,EndX:-1};
                }
            }
            
            for (let l = 0; l < document.getElementsByClassName("sftrect-notdis").length; l++) {
                const element = document.getElementsByClassName("sftrect-notdis")[l];
                element.style.fill = 'transparent';
            }
            
            if(isMoveClear){
                this.setState({ isFirstTimeDrawguid: false });
            } else{
                this.setState({ isContentDragging: false, ghostWrapperObj: null });
            }
            

        } else if(field){
            let selectedfield = filedmapobj[field.key];
            // console.log(selectedfield);
            
            let availableDropShelfs = 0;
            for (let i = 0; i < selectedfield.shelf.length; i++) {
                let shelfitem = selectedfield.shelf[i];

                if(isReset){
                    shelfitem["previewguid"] = { startX: -1, EndX: -1 };
                } else{
                    let findshelffrompreview = previewShelves.findIndex(x => x.rank === shelfitem.rank);
        
                    if(findshelffrompreview > -1){
                        shelfitem = previewShelves[findshelffrompreview];
                        
                        if(shelfitem.previewguid.startX > -1){
                            availableDropShelfs += 1;
                            let gapbetweenguidelines = (shelfitem.previewguid.endX - shelfitem.previewguid.startX);

                            ghostobj.width = (gapbetweenguidelines > ghostobj.width?gapbetweenguidelines:ghostobj.width);
                            ghostobj.height += (shelfitem.drawHeight + shelfitem.drawGap);
                        }
                        
                        //find shelf preview guide inside prods list
                        if(previewProdList.length === 0){
                            let checkstartx = shelfitem.previewguid.startX;
                            let checkendx = shelfitem.previewguid.endX;
    
                            let selblock = this.state.currentSelectedBlock;
                            let selblockprods = (selblock && selblock.newDrawingProducts?selblock.newDrawingProducts:[]);
    
                            let filterprodlist = this.state.mapproductList.filter(proditem => {
                                let isnotignore = (proditem.shelfrank === shelfitem.rank?selblockprods.findIndex(bprod => bprod.id === proditem.id):0);
    
                                let checkprodx = (proditem.x + this.state.saftyMargin);
                                let checkprodx2 = ((proditem.x + proditem.drawWidth) - this.state.saftyMargin);
    
                                return (isnotignore === -1 && 
                                    ((proditem.x >= checkstartx && checkprodx2 <= checkendx) || 
                                    (checkprodx < checkstartx && checkstartx < checkprodx2) || 
                                    (checkprodx < checkendx && checkendx < checkprodx2))
                                );
                            });
    
                            // console.log(filterprodlist);
                            previewProdList = previewProdList.concat((filterprodlist && filterprodlist.length > 0?filterprodlist:[]));
                        }
                    } else{
                        shelfitem["previewguid"]={startX:-1,EndX:-1}
                    }
                }   
            }
            // console.log(previewheight);

            let blockcutitem = (this.state.currentDraggableProd && this.state.currentDraggableProd.is_cutitem?true:false);
            let blockshelfcount = (blockcutitem?this.state.currentDraggableProd.shelf:[]);
            
            if(!blockcutitem || (blockcutitem && blockshelfcount.length === availableDropShelfs)){
                this.setState({ isFirstTimeDrawguid: true});

            } else{
                for (let key of Object.keys(filedmapobj)) {
                    let fieldobj = filedmapobj[key];
        
                    for (let i = 0; i < fieldobj.shelf.length; i++) {
                        const fieldshelf = fieldobj.shelf[i];
                        fieldshelf["previewguid"] = {startX:-1,EndX:-1};
                    }
                }
                this.setState({ isFirstTimeDrawguid: false});
            }
        }
        
        this.setState({ 
            mapFields: filedmapobj, 
            guideProdList: previewProdList,
            droppingShelfList: previewShelves,
            ghostWrapperObj: (ghostobj.height > 0?ghostobj:this.state.ghostWrapperObj),
        });
    }
    //handle export to vmp 
    handleExportVMP = () => {
        var cobj = JSON.parse(JSON.stringify(this.state.selectedCatRect));
        // console.log(this.props.selectedCatRect);
        if(this.state.isStackableEdited){
            this.sendmarkStackableCall()
        }
        if(cobj && cobj.categoryList){
            confirmAlert({
                title: this.props.t('SIMULATE_CONVERT_VMP_CONFIRM'),
                message: this.props.t("SIMULATE_CONVERT_VMP_CONFIRM_MSG"),
                overlayClassName: (this.props.isRTL === "rtl" ? "alertrtl-content" : ""),
                buttons: [{
                    label: this.props.t('btnnames.yes'),
                    onClick: () => {
                       
                        // let svgdrawDimension = this.state.svgdrawDiemention;
                        // let editwrapper = document.getElementById("simulation-edit-wrapper");
                        
                        // let totaldivwidth = (this.state.zoomXRatio > 0 && (editwrapper.clientWidth > svgdrawDimension.drawWidth)?editwrapper.clientWidth:svgdrawDimension.drawWidth);

                        // let exportobj = exportSimulationToVMP(cobj.categoryList, this.state.mapFields, this.state.mapproductList, totaldivwidth, this.state.checkSaftyMargin);

                        // console.log(exportobj);

                        // this.props.handlehaveChnagesinCat(false);
                    }
                }, {
                    label: this.props.t('btnnames.no')
                }]
            });
        }
    }


    disconnectDecider = (type) => {

        this.saveSimulateConfirm(type);
  
    }


    //confirm save simulate changes
    saveSimulateConfirm = (type) => {
        if(this.state.isStackableEdited){
            this.sendmarkStackableCall()
        }

        if(type === "takeback"){

            this.checkAvailabilityTakeBack(type)
                        
        }else{

            confirmAlert({
                title: this.props.t(type === "disconnected"?'DISCONNECT':'SIMULATE_SAVE_CONFIRM'),
                message: this.props.t(type === "disconnected"?'ARE_YOU_SURE_YOU_WANT_TO_DISCONNECT' : "SIMULATE_SAVE_CONFIRM_MSG"),
                overlayClassName: (this.props.isRTL === "rtl" ? "alertrtl-content" : ""),
                buttons: [{
                    label: this.props.t('btnnames.yes'),
                    onClick: () => {
                            this.handleSaveMP(type);
                    }
                }, {
                    label: this.props.t('btnnames.no')
                }]
            });

        }
       
    }

    checkAvailabilityTakeBack = (type) => {
        confirmAlert({
            title: this.props.t('CONT_TAKE_BACK'),
            message: this.props.t("ARE_YOU_SURE_TO_CONTINUE_THIS_TASK"),
            overlayClassName: (this.props.isRTL === "rtl" ? "alertrtl-content" : ""),
            buttons: [{
                label: this.props.t('btnnames.yes'),
                onClick: () => {

                    let sobj;

                    if(this.props.storeId > -1){
                        let fieldCount = (this.props.tagStoreGroup.length > 0?this.props.tagStoreGroup[0].fieldCount:0);
    
                        let tagStoreObj =this.props.tagStoreGroup.map((item)=>item.storesGroupByTags)
    
                        let flatObj = tagStoreObj.flatMap((subArray) => subArray)
    
                        let tags = flatObj.find((group) =>
                        group.connectedStores.some((store) => store.id === this.props.storeId) ||
                        group.disconnectedStores.some((store) => store.id === this.props.storeId)
                        ).tags;
                        
                        let tagsWithName = tags.map(tg => {
                            return {
                                id: tg.id,
                                tagName: tg.name
                            };
                        });
    
                        if(this.props.simulationObj.simsimulationSnapshotId > -1){
                            sobj = { simulationSnapshotId: this.props.simulationObj.simulationSnapshotId };
                        }else{
                            sobj = {mpId: this.props.defSaveObj ? this.props.defSaveObj.mp_id : -1, storeId: this.props.storeId ? this.props.storeId : -1, tags: tagsWithName, fieldCount:fieldCount ? fieldCount : this.props.tagStoreGroup[0].fieldCount}
                        }

                    }else{

                        let tagList = this.props.selectedTagList;

                        let refinedArray = [];

                        for(let i=0; i<tagList.length; i++){
                            let obj = {
                                id:tagList[i].id,
                                tagName:tagList[i].name
                            }

                            refinedArray.push(obj);
                        }

                        // when taking back from tag level and authority level
                        if(this.props.simulationObj.simsimulationSnapshotId > -1){
                            sobj = { simulationSnapshotId: this.props.simulationObj.simulationSnapshotId };
                        }else{
                            sobj = {mpId: this.props.defSaveObj ? this.props.defSaveObj.mp_id : -1, storeId: -1, tags: refinedArray, fieldCount: this.props.simulationObj.searchDto.fieldCount ? this.props.simulationObj.searchDto.fieldCount : this.props.tagStoreGroup[0].fieldCount}
                        }
                    }
                    
                    this.props.toggleLoadingModal(true, () => {
                        submitSets(submitCollection.auiTakeBackAvailability, sobj, false, null, true).then(res => {
                            if(res && res.status && res.extra){
                                if(res.extra.isParentBlocked === false){
                                    this.handleSaveMP(type);
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

     //toggle take back snapshot warning modal
     toggleTakebackWarnModal = (isshow, iscontinue) => {
        this.setState({ isShowTakeBackError: isshow }, () => {
            if(iscontinue){
                this.handleSaveMP("takeback");
            }
        });
    }

    //handle save simulation changes
    handleSaveMP = (type, isCloseModal) => {
        // console.log(this.props.simulationObj);
        let cprodlist = JSON.parse(JSON.stringify(this.state.mapproductList));

        //set current prod list details on save
        let mapFields = this.state.mapFields;

        let searchDto = this.props.simulateSearchObj
        
        let exportprodlist = [];
        for (let i = 0; i < cprodlist.length; i++) {
            const proditem = cprodlist[i];

            let prodfield = mapFields[proditem.field_custom_id];
            let prodstartpoint = ((proditem.x - prodfield.x) / this.state.displayRatio);
            
            proditem["startingPoint"] = prodstartpoint;
            proditem["isDelete"] = (proditem.isDelete?proditem.isDelete:false);
            proditem["isNew"] = ((proditem.isNew || proditem.isDropNew)?proditem.isNew:false);

            if(!proditem.isNew || (proditem.isNew && !proditem.isDelete)){
                exportprodlist.push(proditem);
            }
        }

        let storeIds = [];

        let lastSimOption;

        if(type && type !== "none" && this.props.simType === "AUI" ){

            lastSimOption = this.props.selectedTagGroup.simOption;
    
            if(this.props.storeId > -1){
                // let tagStoreObj =this.props.tagStoreGroup.map((item)=>item.storesGroupByTags)
        
                // let flatObj = tagStoreObj.flatMap((subArray) => subArray)

                // let taggroup = flatObj.find((group) =>
                //     group.connectedStores.some((store) => store.id === this.props.storeId) ||
                //     group.disconnectedStores.some((store) => store.id === this.props.storeId)
                //     );

                let taggroup = this.props.selectedTagGroup;
        
                let allStores = taggroup.connectedStores.concat(taggroup.disconnectedStores);
                
                let allStoreIds = allStores.map(str => str.id);
        
                storeIds = allStoreIds.filter(itm => itm !== this.props.storeId);
    
                let storeObj = allStores.find((obj) => obj.id === this.props.storeId);
    
                lastSimOption = storeObj.simOption;
        
                if(!searchDto.storeId){
                    searchDto["storeId"] = storeObj.id;
                }
                
            }else{
                if(!searchDto.storeId){
                    searchDto["storeId"] = -1;
                }
            }
            
            let tagList = this.props.selectedTagList;
    
            let refinedArray = [];
    
            for(let i=0; i<tagList.length; i++){
                let obj = {
                    id:tagList[i].id,
                    tagName:tagList[i].name
                }
    
                refinedArray.push(obj);
            }
            
            if(!searchDto.fieldCount){
                searchDto["fieldCount"] = this.props.tagStoreGroup[0].fieldCount;
            }
    
            if(!searchDto.selectedTagsId){
                searchDto["selectedTagsId"] = refinedArray;
            } 
            
            if(!searchDto.mpId){
                searchDto["mpId"] = this.props.defSaveObj.mp_id;
            }
        }


        let notrelatedprods = JSON.parse(JSON.stringify(this.props.notReleatedProdList));
        
        let allSimulationObj = JSON.parse(JSON.stringify(this.props.simulationObj));

        let notrelatedrules = allSimulationObj.subCategoryRuleWrapperDtos.filter(ritem => (this.state.mapRulesList.length > 0?this.state.mapRulesList.some(mritem => mritem.categoryId !== ritem.categoryId):true));
        
        //preview apply prods
        let previewSelectedProds = [];
        if(this.props.isShowFromPreview){
            for (let i = 0; i < this.state.selectedSaveProds.length; i++) {
                const groupObj = this.state.selectedSaveProds[i];
                for (let j = 0; j < groupObj.products.length; j++) {
                    const prodObj = groupObj.products[j];
                    
                    previewSelectedProds.push({ prodId: prodObj.productInfo.productId, chainOption: prodObj.chainOption });
                }
            }
        }

        let exportsaveobj = {
            simulationSnapshotId: (allSimulationObj.simulationSnapshotId?allSimulationObj.simulationSnapshotId:-1),
            simulationSnapshotStatus: (allSimulationObj.simulationSnapshotStatus?allSimulationObj.simulationSnapshotStatus:simulateSnapshotEnums.normal),
            virtualBoxList: allSimulationObj.virtualBoxList,
            fieldList: allSimulationObj.fieldList,
            categoryList: allSimulationObj.categoryList,
            products: notrelatedprods.concat(exportprodlist),
            nonSimulateProducts: allSimulationObj.nonSimulateProducts,
            subCategoryRuleWrapperDtos: notrelatedrules.concat(this.state.mapRulesList),
            searchDto: searchDto,
            simOption: type,
            storeIds: storeIds,
            lastSimOption: lastSimOption,
            removedOldProductsDueToNewProducts: (allSimulationObj.removedOldProductsDueToNewProducts && allSimulationObj.removedOldProductsDueToNewProducts.length > 0?allSimulationObj.removedOldProductsDueToNewProducts:[]),
            previewSelectedProds: previewSelectedProds,
            // changedCategories:this.state.TouchedCatRcetList,
            clipboardData:this.state.cutNewArray,
            replaceProds: allSimulationObj.replaceProds,
            // changedCategories:this.state.TouchedCatRcetList
        };

        if(exportsaveobj.simulationSnapshotId > 0 && exportsaveobj.simulationSnapshotStatus === simulateSnapshotEnums.normal){
            exportsaveobj = {
                simulationSnapshotId: (allSimulationObj.simulationSnapshotId?allSimulationObj.simulationSnapshotId:-1),
                simulationSnapshotStatus: (allSimulationObj.simulationSnapshotStatus?allSimulationObj.simulationSnapshotStatus:simulateSnapshotEnums.normal),
                products: exportprodlist,
                subCategoryRuleWrapperDtos: this.state.mapRulesList,
                searchDto: searchDto,
                simOption: type,
                storeIds: storeIds,
                lastSimOption: lastSimOption,
                changedCategories:this.state.TouchedCatRcetList,
                removedOldProductsDueToNewProducts: (allSimulationObj.removedOldProductsDueToNewProducts && allSimulationObj.removedOldProductsDueToNewProducts.length > 0?allSimulationObj.removedOldProductsDueToNewProducts:[]),
                previewSelectedProds: previewSelectedProds,
                clipboardData:this.state.cutNewArray,
                replaceProds: allSimulationObj.replaceProds,
            }
        }

        // console.log(exportsaveobj);
        this.props.toggleLoadingModal(true, () => {
            submitSets(submitCollection.saveSimulationSnapshot, exportsaveobj, false, null, true).then(res => {
                if(res && res.status){
                    // this.newClipBoardToched(false)
                    let taggroup;
                    let storeobj;
    
                    if(this.props.storeId >-1){
                        let tagStoreObj =this.props.tagStoreGroup.map((item)=>item.storesGroupByTags)
            
                        let flatObj = tagStoreObj.flatMap((subArray) => subArray)
            
                        taggroup = flatObj.find((group) =>
                            group.connectedStores.some((store) => store.id === this.props.storeId) ||
                            group.disconnectedStores.some((store) => store.id === this.props.storeId)
                            );
            
                        let allStores = taggroup.connectedStores.concat(taggroup.disconnectedStores);
                        
                        storeobj = allStores.find((obj) => obj.id === this.props.storeId);
                    }        
    
                    if(type === "takeback"){
                        alertService.success(this.props.t('TACKBACK_SUCCESS'));
                        if(this.props.storeId > -1){
                            this.props.reloadSimAndStore(storeobj, taggroup);
                        }else{
                            this.props.reloadSimAndTag(this.props.selectedTagGroup);
                        }
                    }else if(type === "disconnected"){
                        alertService.success(this.props.t('Successfully_disconnected'));
                        if(this.props.storeId > -1){
                            this.props.reloadSimAndStore(storeobj, taggroup);
                        }else{
                            this.props.reloadSimAndTag(this.props.selectedTagGroup);
                        }
                    }else{
                        alertService.success(this.props.t('SIMULATE_SAVE_SUCCESS'));
                    }
    
                    if(res.extra && Object.keys(res.extra).length > 0){
    
                        if(this.props.saveSimulationObjToSideBarComp){
                            this.props.saveSimulationObjToSideBarComp(res.extra)
                        }
    
                        //set to redux
                        var obj={
                            exportsaveobj:exportsaveobj,
                            extra:res.extra,
                        }
                        this.props.setMpFullscreenchngesobj(obj)
                        //end
    
    
                        this.checkAndReloadProds(exportsaveobj, res.extra);
                        
                        this.props.toggleOneCategory(true);
                        // this.props.handlehaveChnagesinCat(false);
                    }
    
                    this.props.handlehaveChnagesinCat(false);
                    
                    if(this.state.isPrintPending){
                        this.excelPrint();
                    }
                    this.setState({ isPrintPending: false });
    
                    this.props.toggleLoadingModal(false);
    
                    if(isCloseModal){
                        this.props.toggleSimulateAllModal(true);
                    }
                } else{
                    this.props.toggleLoadingModal(false);
                    // alertService.error(res.extra && res.extra !== ""?res.extra:this.props.t('erroroccurred'));
                    this.props.togglePrintPending(null, false, true);
                }
            });
        });
    }
    // checkAndReloadProdsbackup = (exportsaveobj, response,type) => {
    //     let crectobj = this.state.selectedCatRect;
    //     let newresponseobj = {};
    //     // this.TouchedCatListUpdate(null,true)
    //     //update snapshot available updates only category items
    //     if(exportsaveobj.simulationSnapshotId > 0 && exportsaveobj.simulationSnapshotStatus === simulateSnapshotEnums.normal){
    //         var non_sim_cat=response.nonSimulateProducts.find(g=>g.categoryId===crectobj.selectedCat.id);
    //         let notrelatedprods = JSON.parse(JSON.stringify(this.props.notReleatedProdList));

    //         //console.log(response.products)

    //         newresponseobj = JSON.parse(JSON.stringify(this.props.simulationObj));
    //         newresponseobj["products"] = notrelatedprods.concat(response.products);
    //         newresponseobj["nonSimulateProducts"] = response.nonSimulateProducts;

            
    //         //rules list update
    //         let notrelatedrules = newresponseobj.subCategoryRuleWrapperDtos.filter(ritem => (this.state.mapRulesList.length > 0?this.state.mapRulesList.some(mritem => mritem.categoryId !== ritem.categoryId):true));
    //         let responseRules = (response.subCategoryRuleWrapperDtos && response.subCategoryRuleWrapperDtos.length > 0?response.subCategoryRuleWrapperDtos:[]);
    //         newresponseobj["subCategoryRuleWrapperDtos"] = notrelatedrules.concat(responseRules);
            
    //         let selectedObj = this.state.selectedCatRect;
    //         selectedObj["products"] = response.products;
    //         selectedObj["rulesList"] = responseRules;
    //         selectedObj["non_sim_prodlist"] = non_sim_cat?non_sim_cat.nonSimulatedProducts:[];

    //         this.setState({ selectedCatRect: selectedObj }, () => {
    //             this.mapobjectsdraw(); 
    //             this.props.updateSaveReloadStatus(true, newresponseobj );
    //         });

    //     } else{
           
    //         newresponseobj = response;
            
    //         let selectedcat = (crectobj && crectobj.selectedCat?crectobj.selectedCat:null);

    //         if(selectedcat){
    //             let allSelectedCats = response.categoryList.filter(a => 
    //                 (selectedcat.type === catRectEnums.default && a.type === catRectEnums.default && getNameorIdorColorofBox(a,"num") === getNameorIdorColorofBox(selectedcat, "num")) || 
    //                 (selectedcat.type === catRectEnums.rule && a.type === catRectEnums.rule && a.rule && selectedcat.rule && a.rule.level === selectedcat.rule.level && getNameorIdorColorofBox(a,"num") === getNameorIdorColorofBox(selectedcat, "num"))
    //             );
                
    //             if(allSelectedCats && allSelectedCats.length > 0){
    //                 let firstcatitem = allSelectedCats[0];

    //                 let non_simu_cat_list = (response.nonSimulateProducts?response.nonSimulateProducts:[]);
    //                 let non_sim_cat = non_simu_cat_list.find(g => g.categoryId === firstcatitem.id);

    //                 let cfileds = response.fieldList.filter(x => x.virtualBoxId === firstcatitem.virtualBoxId)
                    
    //                 let notrelatedprods = []; 
    //                 let selectetProducts = [];

    //                 for (let i = 0; i < response.products.length; i++) {
    //                     const originprod = response.products[i];

    //                     if(allSelectedCats.length > 0 && allSelectedCats.some(a => originprod.categoryRectId === a.id)){
    //                         selectetProducts.push(originprod);
    //                     } else{
    //                         notrelatedprods.push(originprod);
    //                     }
    //                 }
                    
    //                 //get rules list
    //                 let selectedCatRules = response.subCategoryRuleWrapperDtos.filter(z => (allSelectedCats.length > 0?allSelectedCats.some(b => z.categoryId === b.id):true));
                    
    //                 let selectedObj = {
    //                     selectedCat: firstcatitem,
    //                     categoryList:allSelectedCats,
    //                     fieldList: cfileds,
    //                     non_sim_prodlist: non_sim_cat?non_sim_cat.nonSimulatedProducts:[],
    //                     products:selectetProducts,
    //                     rulesList: selectedCatRules,
    //                 }
                    
    //                 this.setState({
    //                     selectedCatRect: selectedObj, nonfilteredNonEProducts: selectedObj.non_sim_prodlist,
    //                     //y
    //                     currentDraggableProd: null,
    //                     currentSelectedBlock:null,
    //                     currentInternalDraggableProd:null
    //                 }, () => {
    //                     this.mapobjectsdraw();  
    //                     this.props.updateSaveReloadStatus(true, newresponseobj, notrelatedprods );
    //                 });
    //             }
    //         }
    //     }
    //     if(type==="fullscreenedit"){
    //         this.props.setMpFullscreenchngesobj(null)
    //     }
    // }
    //check save response and reload changes
    checkAndReloadProds = (exportsaveobj, response,type) => {
        // let crectobj = this.state.selectedCatRect;
        let newresponseobj = {};
       
        //update snapshot available updates only category items
        if(exportsaveobj.simulationSnapshotId > 0 && exportsaveobj.simulationSnapshotStatus === simulateSnapshotEnums.normal){
            var non_sim_cat=null//response.nonSimulateProducts.find(g=>g.categoryId===crectobj.selectedCat.id);
            // let notrelatedprods = JSON.parse(JSON.stringify(this.props.notReleatedProdList));

            //console.log(response.products)
            var remainProducts=this.findproductexcludeCatrects(this.state.TouchedCatRcetList,this.props.simulationObj.products)
            newresponseobj = JSON.parse(JSON.stringify(this.props.simulationObj));
            // newresponseobj["products"] = notrelatedprods.concat(response.products);
            newresponseobj["products"] = remainProducts.excludeproducts.concat(response.products);
            newresponseobj["nonSimulateProducts"] = response.nonSimulateProducts;
            newresponseobj["clipboardData"] = response.clipboardData
            
            //rules list update
            let notrelatedrules = newresponseobj.subCategoryRuleWrapperDtos.filter(ritem => (this.state.mapRulesList.length > 0?this.state.mapRulesList.some(mritem => mritem.categoryId !== ritem.categoryId):true));
            let responseRules = (response.subCategoryRuleWrapperDtos && response.subCategoryRuleWrapperDtos.length > 0?response.subCategoryRuleWrapperDtos:[]);
            newresponseobj["subCategoryRuleWrapperDtos"] = notrelatedrules.concat(responseRules);
            
            let selectedObj = this.state.selectedCatRect;
            selectedObj["products"] = response.products;
            selectedObj["rulesList"] = responseRules;
            selectedObj["non_sim_prodlist"] = non_sim_cat?non_sim_cat.nonSimulatedProducts:[];
            selectedObj["clipboardData"] = response.clipboardData

            this.setState({ selectedCatRect: selectedObj }, () => {
                this.TouchedCatListUpdate(null,true)
                this.mapobjectsdraw(); 
                this.props.updateSaveReloadStatus(true, newresponseobj );

                //reload imported product update 
                this.compareImportedProds();
            });

        } else{
           
            newresponseobj = response;
            
            // let selectedcat = (crectobj && crectobj.selectedCat?crectobj.selectedCat:null);

            // if(selectedcat){
                let allSelectedCats = response.categoryList
                // let allSelectedCats = response.categoryList.filter(a => 
                //     (selectedcat.type === catRectEnums.default && a.type === catRectEnums.default && getNameorIdorColorofBox(a,"num") === getNameorIdorColorofBox(selectedcat, "num")) || 
                //     (selectedcat.type === catRectEnums.rule && a.type === catRectEnums.rule && a.rule && selectedcat.rule && a.rule.level === selectedcat.rule.level && getNameorIdorColorofBox(a,"num") === getNameorIdorColorofBox(selectedcat, "num"))
                // );
                if(allSelectedCats && allSelectedCats.length > 0){
                    let firstcatitem = allSelectedCats[0];

                    let non_simu_cat_list = (response.nonSimulateProducts?response.nonSimulateProducts:[]);
                    let non_sim_cat = non_simu_cat_list.find(g => g.categoryId === firstcatitem.id);

                    let cfileds = response.fieldList.filter(x => x.virtualBoxId === firstcatitem.virtualBoxId)
                    
                    let notrelatedprods = []; 
                    let selectetProducts = [];

                    for (let i = 0; i < response.products.length; i++) {
                        const originprod = response.products[i];

                        if(allSelectedCats.length > 0 && allSelectedCats.some(a => originprod.categoryRectId === a.id)){
                            selectetProducts.push(originprod);
                        } else{
                            notrelatedprods.push(originprod);
                        }
                    }
                    
                    //get rules list
                    let selectedCatRules = response.subCategoryRuleWrapperDtos.filter(z => (allSelectedCats.length > 0?allSelectedCats.some(b => z.categoryId === b.id):true));
                    
                    let selectedObj = {
                        selectedCat: firstcatitem,
                        categoryList:allSelectedCats,
                        fieldList: cfileds,
                        non_sim_prodlist: non_sim_cat?non_sim_cat.nonSimulatedProducts:[],
                        products:selectetProducts,
                        rulesList: selectedCatRules,
                    }
                    
                    this.setState({
                        selectedCatRect: selectedObj, nonfilteredNonEProducts: selectedObj.non_sim_prodlist,
                        //y
                        currentDraggableProd: null,
                        currentSelectedBlock:null,
                        currentInternalDraggableProd:null
                    }, () => {
                        this.mapobjectsdraw();  
                        this.props.updateSaveReloadStatus(true, newresponseobj, notrelatedprods );

                        //reload imported product update 
                        this.compareImportedProds();
                    });
                }
            // }
        }
        if(type==="fullscreenedit"){
            this.props.setMpFullscreenchngesobj(null)
        }

       
    }
    drawClipboardfromback=()=>{
        var  newresponseobj = JSON.parse(JSON.stringify(this.props.simulationObj));
        var clipboarddata=newresponseobj.clipboardData
        if(clipboarddata.length>0){
            let curcutlist = [];
            for (let i = 0; i < clipboarddata.length; i++) {
                const cdata = clipboarddata[i];
                // console.log(cdata);
                    let maxwdithoftile = 0;
                    let maxheightoftile = 0;
                    cdata.shelf.forEach(cutshelf => {
                        let toheighstsortarray= JSON.parse(JSON.stringify(cutshelf.products))
                        let sorttomaxheight = toheighstsortarray.sort((a,b) =>  b.height - a.height);
                        // let lowyprody = sorttolowy[0].y;
                        
                        let sortprods = cutshelf.products.sort((a,b) => a.startingPoint - b.startingPoint);
    
                        let lowestxprod = JSON.parse(JSON.stringify(sortprods[0]));
                        let svgwidth = 0; let svgheight = 0;
                        let maxheightofprod=0
                        // console.log("cdata");
                        for (let j = 0; j < sortprods.length; j++) {
                            
                            const sortitem = sortprods[j];
                            // console.log(cdata.uom,this.state.displayUOM,sortitem.width,this.state.displayRatio);
                            sortitem.drawWidth=measureConverter(cdata.uom,this.state.displayUOM,sortitem.width)*this.state.displayRatio
                            sortitem.drawHeight=measureConverter(cdata.uom,this.state.displayUOM,sortitem.height)*this.state.displayRatio
                            sortitem["x"]=measureConverter(cdata.uom,this.state.displayUOM,sortitem.startingPoint)*this.state.displayRatio 
                            
                            let gapbetweenlowest = (sortitem.x -  measureConverter(cdata.uom,this.state.displayUOM,lowestxprod.startingPoint)*this.state.displayRatio );
                            // console.log(sortitem.x,cdata.uom,this.state.displayUOM,lowestxprod.startingPoint);
                            // sortitem["xCoppy"] = gapbetweenlowest;
                            // sortitem["drawWidthCoppy"] = sortitem.drawWidth;
                            // sortitem["drawHeightCoppy"] = sortitem.drawHeight;
                            let maxproddrawHeight=measureConverter(cdata.uom,this.state.displayUOM,sorttomaxheight[0].height)*this.state.displayRatio
                            let gapbetweenlowesty =maxproddrawHeight-sortitem.drawHeight//(sortitem.y - lowyprody);
                            sortitem["gaptolowy"] = gapbetweenlowesty;
                            
                            svgwidth = (gapbetweenlowest + sortitem.drawWidth);
                            svgheight = (svgheight < sortitem.drawHeight?sortitem.drawHeight:svgheight);
                            maxheightofprod=maxheightofprod<sortitem.drawHeight?sortitem.drawHeight:maxheightofprod
                        }
                        maxheightoftile=maxheightoftile+maxheightofprod
                        cutshelf["id"] = uuidv4();
                        cutshelf["width"] = svgwidth;
                        cutshelf["height"] = svgheight;
                        // cutshelf["widthCoppy"] = svgwidth;
                        // cutshelf["heightCoppy"] = svgheight;
                        // cutshelf["ratio"] = this.state.displayRatio;
                        
                        // cutshelf["added_categoryRectId"] = sortprods[0].categoryRectId;
                        cutshelf.products = sortprods;
                        maxwdithoftile=maxwdithoftile<cutshelf.width?cutshelf.width:maxwdithoftile
                        
                    });
                    cdata["width"]=maxwdithoftile
                    cdata["height"]=maxheightoftile
                    cdata["is_cutitem"] = true;
                   
                    curcutlist.push(cdata);
                    // console.log(curcutlist);
            }
            this.setState({cutNewArray:curcutlist})
        }

    }
    findproductexcludeCatrects=(selectCatRects,products)=>{
        var filteredproducts = products.filter(x => !selectCatRects.includes( x.categoryRectId ));

        return {excludeproducts:filteredproducts}
    }
    //cut content item
    cutContextItem = (iscopy, citem,isFromDelete) => {
        this.fieldHistoryAdd(JSON.parse(JSON.stringify(this.state.mapproductList)),2);
        // if(!iscopy){
        //     this.fieldHistoryAdd(JSON.parse(JSON.stringify(this.state.mapproductList)),2);
        // }
        var cmenu = this.state.contxtmenu;
        let prodlist = JSON.parse(JSON.stringify(this.state.mapproductList));

        let isruleupdating = false;
        if(!iscopy){
            prodlist[citem.prodidx]["isDelete"] = true;

            let changeprodobj = prodlist[citem.prodidx];
             //cat rect chenged track
            this.TouchedCatListUpdate(changeprodobj.categoryRectId)
            if(changeprodobj.subcategory && changeprodobj.subcategory.type === catRectEnums.rule){
                let scatruleid = getNameorIdorColorofBox(changeprodobj.subcategory, "num");
                let scatrulelevel = changeprodobj.subcategory.rule.level;
                let findfromrules = findRuleAvailableForBrand(scatruleid, true, scatrulelevel, this.state.mapRulesList);

                if(findfromrules.isavailable){
                    isruleupdating = {parentidx: findfromrules.ruleparentidx, ruleidx: findfromrules.ruleidx};
                }
            }
        }
        // let newcutarray = [{ rank: citem.prod.shelfrank, iscopy: iscopy, prods: [citem.prod] }];
        //making new clip board obj
        var cuttingProduct=citem.prod
        // cuttingProduct["startingPointDraw"]=cuttingProduct.x
        // cuttingProduct["startingPoint"]=cuttingProduct.x/this.props.displayratio
        var cshelfs=[{shelfrank:citem.prod.shelfrank,products:[cuttingProduct]}]
        var selfield=this.state.mapFields[citem.prod.field_custom_id]
        var objtopass={
            groupUUID: uuidv4(),isNew:true, isDelete: false, mode: isFromDelete?"delete":iscopy?"copy":"cut" ,uom:selfield.uom,shelf:cshelfs
        }
        this.updateCutList(objtopass);

        this.handleRemoveProductCounter(cmenu.citem,1);

        this.setState({ mapproductList: prodlist, currentInternalDraggableProd: null, currentSelectedBlock: null, isviewcmenu: false, contxtmenu: { isexpand: false } }, () => {
            
            if(this.props.simType === "AUI" || this.props.simType === "Normal"){
                // const combinedPrds = this.state.mapproductList.concat(this.state.filteredOtherPrds).filter(prd=>prd.isDelete !== true)
                const combinedPrds = this.state.mapproductList.filter(prd=>prd.isDelete !== true)
                this.props.getProductAnomalies(this.props.mapFields, this.props.mapCategories, combinedPrds)
            }
            
            //check non sim render count and display mange
             this.nonSimProddropremoveCounterupdate("cutSingleItem")
            //update rule list if item sub cat is rule
            if(isruleupdating){
                let updaterulelist = getAllRuleWarnings(this.state.mapCatRects, this.state.mapRulesList, this.state.mapproductList, false, true, isruleupdating);
                
                this.setState({ mapRulesList: updaterulelist.rulelist, isRuleWarn: updaterulelist.iswarn });
            }

            // this.cacheClipboardandOtherOnlyCutProdsReplace()
            
            //reload imported product update 
            this.compareImportedProds();
        });
    }
    //remove prod drag end
    prodDragEnd = () => {
        this.setState({ isContentDragging: false, currentInternalDraggableProd: null, currentSelectedBlock: null, contxtmenu: { isexpand: false } });
        setTimeout(() => {
            this.setPreviewGuid(true);
        }, 500);
        removeGhostImage();
    }
    setFullscreenShow=(value)=>{
        var cloadedprodcount=this.state.loadedprodcount
        if(value===false){
            cloadedprodcount=0
            this.setState({fullscreenObj:null})// after save print prod image switching images fix only this line
        }
        this.setState({isShowFullscreen:value,loadedprodcount:cloadedprodcount},()=>{
            if(value===true){
                this.calculateDrawingobject()
            }
        })
    }
    calculateDrawingobject=()=>{
        var cobj = JSON.parse(JSON.stringify(this.props.selectedCatRect));

        var divheight=(this.fullscreendiv.current?(this.fullscreendiv.current.offsetHeight - 10) : 0)
        
        var cfieldList = cobj.fieldList;
        // var normalDimention = makeRatiofromhieghestField(cfieldList, this.state.displayUOM, this.state.catDivHeight);

        var dimentionforfullscreen = makeRatiofromhieghestField(cobj.fieldList, this.state.displayUOM, divheight)
        // var cmapFields = JSON.parse(JSON.stringify(this.state.mapFields))
        // var cmapproductList=JSON.parse(JSON.stringify(this.state.mapproductList));

        // let simLoadedObj = this.props.allCategoryData;
        // let actualFieldsCounts = (simLoadedObj?simLoadedObj.actualFieldStructures:[]);
        
        this.setState({
            fullScreenRatio: dimentionforfullscreen,
            fullscreenheight: divheight
        },()=>{
            // var convertedfield=convertfieldstoFullScreen(cmapFields, normalDimention, this.state.fullScreenRatio, this.state.displayUOM, actualFieldsCounts)
            // var convertedprods=convertProductstoFullScreen(cmapproductList, normalDimention, this.state.fullScreenRatio)

            //reconvert for full screen view
            var convertedfield = makemapFieldObj( cfieldList, this.state.displayUOM, dimentionforfullscreen, divheight, [] );
            // console.log(convertedfield);
            var cmapfieldObj= convertedfield.mapfieldObj;
          
            let previewobj = this.props.selectedSimPreviewObj;
            let previewProdList = (previewobj && previewobj.selectedProds && previewobj.selectedProds.length > 0?previewobj.selectedProds:[]);

            var convertedprods = makemaProductsObj(cobj.products, this.state.displayUOM, dimentionforfullscreen, cmapfieldObj, this.props.isShowFromPreview, previewProdList);
            // console.log(convertedprods);
          
            var fullscreenobj={
                fields: cmapfieldObj,
                products: convertedprods
            }

            this.setState({
                fullscreensvgdrawDiemention:{ drawWidth: convertedfield.svgWidth, drawHeight: 0 },
                fullscreenObj:fullscreenobj
            })
        })
    }
    toggleProductEditModal = (type) => {
        //get product details after complete
        if(type === "update" && this.state.isShowPreviewModal&&this.state.selectedwarningdropprod){
            this.reloadProdWarnModalDetails();
        }

        this.setState({isShowPreviewModal:!this.state.isShowPreviewModal});
    }
     //get data for product preview modal
     getProductData = (citem ) => {
        if(citem){
            this.setState({loadinggif:true, selectedProduct:null,originalData:{}, isShowPreviewModal:false, snapId:(citem.snapId?citem.snapId:-1)},()=>{
                let svobj = "?productId="+citem.id;
                submitSets(submitCollection.findProdByID, svobj).then(res => {
                    //console.log(res.extra);
                    this.setState({loadinggif:false});
                    if(res && res.status && res.extra){
                        this.setState({selectedProduct: (res.extra?res.extra:null) , originalData: (res.extra?res.extra:null)},()=>{
                            this.toggleProductEditModal();
                        });
                    } else{
                        this.setState({loadinggif:false})
                        alertService.error(this.props.t("PRODUCT_NOT_FOUND"));
                    }
                });
            });
            // if(!citem.isNew){
            // } else{
            //     this.setState({ isShowPreviewModal: false, selectedProduct: null });
            //     alertService.error(this.props.t("SAVE_PRODUCT_BEFORE_EDIT"));
            // }
        } else{
            this.setState({ isShowPreviewModal: false, selectedProduct: null });
        }
    }
    handleopenDetailmodal=(prod)=>{
        if(this.state.historyData.past.length > 0){
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
            this.getProductData(prod)
        }
    }
    //save product details
    handleSaveProduct = (saveobj, updateSnapshot) => {
        this.setState({isdataloading:true});

        let defSaveObj = this.props.defSaveObj;

        saveobj.mpId = defSaveObj.mp_id;
        saveobj.snapId = this.state.snapId;
        saveobj.isApprovedSnapshot = updateSnapshot;
        saveobj.isUpdateOnlyFlags = false;
        
        submitSets(submitCollection.updateProds, saveobj, false, null, true).then(res => {
            this.setState({isdataloading:false});
            if(res && res.status){
                alertService.success(this.props.t("PRODUCT_DETAILS_SUCCESSFULLY_UPDATED"));
                // this.sendmarkStackableCall()
                // if(updateSnapshot===true){
                //     this.updateSnapshots(saveobj,true);
                // }
                // else{
                //     this.props.loadSidebarProductList();
                // }
                this.loadAGAINProds()
                //search if have this prod
                var haveidx=this.state.mapproductList.findIndex(x=>x.productId===saveobj.id)
                if(haveidx>-1){
                    this.markingtempStackableprods(null,null,haveidx)
                }
               
                this.setState({ isShowPreviewModal: false, selectedProduct: null });
            } else{
                // alertService.error(res && res.extra?res.extra:this.props.t("erroroccurred"));
            }
        });
    }
    
    printInit = (isexcelprint, isfullscreen, isfieldwiseprint) => {
        this.setState({ isFieldWisePDFPrint: isfieldwiseprint }, () => {
            if(isexcelprint){
                this.checkExcelPrint(isfullscreen, isfieldwiseprint);
            } else{
                /* if(isfullscreen){
                    this.handletoImage();
                } else{
                    this.print();
                } */

                this.print(isfullscreen);
            }
        });
    }

    checkExcelPrint = (isfullscreen, isfieldwiseprint) => {
        if(!isfullscreen && this.state.historyData.past.length > 0){
            //have unsaved
            confirmAlert({
                title: this.props.t('There_are_unsaved_changes'),
                message: this.props.t("DO_YOU_WANT_TO_SAVE_AND_PRINT"),
                overlayClassName: (this.props.isRTL === "rtl" ? "alertrtl-content" : ""),
                buttons: [{
                    label: this.props.t('SavenPrint'),
                    onClick: () => {
                        // this.excelPrint();
                        this.props.togglePrintPending("excel", true, false, () => {
                            this.handleSaveMP();
                        }, this.state.isFieldWisePDFPrint);
                    }
                }, {
                    label: this.props.t('btnnames.close'),
                    /* onClick: () => {
                        this.excelPrint();
                    } */
                }]
            })
        }else{
            //no unsaved
            this.excelPrint();
        }
    }

    excelPrint = () => {
        this.setState({ loadinggif: true }, () => {
            let isFieldWisePrint = this.state.isFieldWisePDFPrint; //is print is seperate by field
            // let parentobj = (this.props.simulationObj?JSON.parse(JSON.stringify(this.props.simulationObj.fieldList)):null);
            let allprodlist = JSON.parse(JSON.stringify(this.state.mapproductList));
            let actualFieldsCounts = this.state.actualFieldsCounts;
            
            let selectedCatRect = this.props.selectedCatRect;

            let checkSaftyMargin = roundOffDecimal(this.state.displayRatio,2);
            let exportData = compareAndGetFieldProds(this.state.mapFields, selectedCatRect, allprodlist, isFieldWisePrint, actualFieldsCounts, 
                this.state.displayUOM,this.state.displayRatio, checkSaftyMargin);
            // console.log(exportData);

            const fileExtension = '.xlsx';
            // const cdate = new Date();
            //export data
            let csvData = [];
            let styles = { font: { bold: true }, fill: { fgColor: { rgb: "E9E9E9" } }, alignment: { wrapText: false } };

            let headerstyles = { font: { bold: true, sz: "16" }, fill: { fgColor: { rgb: "FFFF00" } }, alignment: { wrapText: false, horizontal: "center" } };
            let smallheaderstyles = { font: { bold: true, sz: "14" }, fill: { fgColor: { rgb: "FFFF00" } }, alignment: { wrapText: false, horizontal: "center" } };
            

            let chaindetails = (this.props.signedobj && this.props.signedobj.signinDetails?this.props.signedobj.signinDetails.chain:null);
            let departmentname = (this.props.defSaveObj && this.props.defSaveObj.department?(((this.props.simType === "AUI")?this.props.defSaveObj.department.name:this.props.defSaveObj.department.department_name)+" "+this.props.t("department")):"-");
            let userdetails = (this.props.signedobj && this.props.signedobj.signinDetails?this.props.signedobj.signinDetails.userDto:null);
            let fieldCount = (this.props.simulateCount > 0?this.props.simulateCount:0);
            let mpDetails = ((this.props.defSaveObj && this.props.defSaveObj.masterPlanogram)?this.props.defSaveObj.masterPlanogram:undefined);

            let MPVersion = (mpDetails?mpDetails.version:"");
            let MPVName = (this.props.originatedMpId > 0?this.props.originatedMpName:mpDetails?mpDetails.name:"");
            let isOriginatedMPAvailable = (this.props.originatedMpId > 0);

            csvData.push([{v: "", s: headerstyles},{v: "", s: headerstyles},{v: (chaindetails?chaindetails.chainName:"-"), s: headerstyles},{v: "", s: headerstyles},{v: "", s: headerstyles},{v: "", s: headerstyles}]);
            csvData.push([{v: "", s: smallheaderstyles},{v: "", s: smallheaderstyles},{v: (departmentname+" | "+(isOriginatedMPAvailable?MPVName:(MPVName+" | v"+MPVersion))), s: smallheaderstyles},{v: "", s: smallheaderstyles},{v: "", s: smallheaderstyles},{v: "", s: smallheaderstyles}]);
            csvData.push([{v: ""}]);

            let subheaderstyles = { font: { bold: true }, fill: { fgColor: { rgb: "E9E9E9" } }, alignment: { wrapText: false, horizontal: "center" } };
            let subheaderstyles2 = { font: { bold: true }, fill: { fgColor: { rgb: "ffc6dc" } }, alignment: { wrapText: false, horizontal: "center" } };

            csvData.push([{v: "", s: subheaderstyles},{v: "", s: subheaderstyles},
                {v: ((this.props.t("FIELD_COUNT")+":"+fieldCount)+" | "+(moment().format("MMMM DD YYYY")+" | "+moment().format("hh:mm:ss")+" | "+(userdetails?(userdetails.fName+" "+userdetails.lName):"-"))), s: subheaderstyles},
            {v: "", s: subheaderstyles},{v: "", s: subheaderstyles},{v: "", s: subheaderstyles}]);
            csvData.push([{v: "", s: subheaderstyles2},{v: "", s: subheaderstyles2}, {
                v: (this.state.isFieldWisePDFPrint?this.props.t("FIELD_WISE_PRINT"):this.props.t("CATEGORY_WISE_PRINT")), s: subheaderstyles2},
                {v: "", s: subheaderstyles2},{v: "", s: subheaderstyles2},{v: "", s: subheaderstyles2}]);
            csvData.push([{v: ""}]);
            
            let columnwidths = { barcode: 10, name: departmentname.length, supplier: 10, facing: 10 };

            if (exportData && exportData.length > 0) {
                exportData.forEach(exproditem => {
                    let fieldstyles = { font: { bold: true, sz: "13" }, fill: { fgColor: { rgb: "DA9694" } }, alignment: { wrapText: false } };
                    let fieldstylealign = { font: { bold: true, sz: "13" }, fill: { fgColor: { rgb: "DA9694" } }, alignment: { horizontal: "right" } };

                    //(!this.state.isFieldWisePDFPrint?(printOneField.category?(printOneField.category+": "+printOneField.categoryNo):"-"):(this.props.t("Field_unit_no")+" "+(index + 1)))
                    csvData.push([
                        {v: (!this.state.isFieldWisePDFPrint?(exproditem.category?(exproditem.category+": "+exproditem.categoryNo):"-"):(this.props.t("Field_unit_no")+": "+exproditem.order)), s: fieldstyles}, //(this.props.t("Field_unit_no")+": "+exproditem.order)
                        {v: "", s: fieldstyles}, {v: "", s: fieldstyles}, {v: (exproditem.fieldName?exproditem.fieldName:"-"), s: fieldstylealign}, {v: "", s: fieldstyles}, {v: "", s: fieldstyles}
                    ]); //exproditem.fieldName
                    csvData.push([{v: ""}]);

                    if(columnwidths.facing < exproditem.fieldName.length){
                        columnwidths.facing = (exproditem.fieldName.length + 5);
                    }
                    
                    for (const shelfkey in exproditem.shelfprods) {
                        const fieldshelf = exproditem.shelfprods[shelfkey];
                        const shelfobj = exproditem.shelf[(shelfkey - 1)];
                        // console.log(shelfobj);

                        if(shelfobj){
                            let shelfstyles = { font: { bold: true, sz: "13" }, fill: { fgColor: { rgb: "f2ebff" } }, alignment: { wrapText: false } };
                            let shelfstylealign = { font: { bold: true, sz: "13" }, fill: { fgColor: { rgb: "f2ebff" } }, alignment: { horizontal: "right" } };
    
                            csvData.push([{v: (this.props.t("Shelf_unit_no")+" "+shelfobj.rank), s: shelfstyles}, {v: "", s: shelfstyles}, {v: "", s: shelfstyles},{v: "", s: shelfstyles},{v: "", s: shelfstyles}, {v: "", s: shelfstylealign},]); //exproditem.fieldName
                            csvData.push([{v: this.props.t("barcode"), s: styles}, {v: this.props.t("PRODUCT_NAME"), s: styles}, {v: this.props.t("supname"),s:styles},{v: this.props.t("brand"),s:styles}, {v: this.props.t("FACING"), s: styles},{v: this.props.t("STACK_COUNT"), s: styles}]);
    
                            fieldshelf.forEach(shelfprod => {
                                let shelfprodsup = (shelfprod.productBrand && shelfprod.productBrand.supplier?shelfprod.productBrand.supplier.supplierName:"-");
                                let brandname =(shelfprod.productBrand && shelfprod.productBrand.brandName?shelfprod.productBrand.brandName:"-");
                                let stackcount=(shelfprod.maxStackableCount&&shelfprod.maxStackableCount>0)?(shelfprod.maxStackableCount):1
                                csvData.push([shelfprod.barcode, shelfprod.name, shelfprodsup, brandname,shelfprod.qty,stackcount]);
                            
                                if(columnwidths.barcode < shelfprod.barcode.length){
                                    columnwidths.barcode = (shelfprod.barcode.length + 5);
                                }
    
                                if(columnwidths.name < shelfprod.name.length){
                                    columnwidths.name = (shelfprod.name.length + 5);
                                }
    
                                if(columnwidths.supplier < shelfprodsup.length){
                                    columnwidths.supplier = (shelfprodsup.length + 5);
                                }
                            });
                            csvData.push([{v: ""}]);
                        }
                    }
                });
            }

            // const wb = XLSX.utils.book_new();
            const wb = { Workbook: { Views: [{ RTL: (this.props.isRTL === "rtl"?true:false) }] }, Sheets: {}, SheetNames: [] };

            const ws = XLSX.utils.aoa_to_sheet(csvData);//set column widths
            
            let wscols = [ {wch: columnwidths.barcode}, {wch: columnwidths.name}, {wch: columnwidths.supplier}, {wch: columnwidths.facing}];
            ws['!cols'] = wscols;

            XLSX.utils.book_append_sheet(wb, ws, "readme");

            let depname = (this.props.defSaveObj && this.props.defSaveObj.department?((this.props.simType === "AUI")?this.props.defSaveObj.department.name:this.props.defSaveObj.department.department_name):"");
            let userlogged = (this.props.signedobj && this.props.signedobj.signinDetails&&this.props.signedobj.signinDetails.userDto?(this.props.signedobj.signinDetails.userDto.fName+"-"+this.props.signedobj.signinDetails.userDto.lName):"");
            let filename=(depname+"_"+userlogged+"_"+fieldCount+"Fields");
            
            // STEP 4: Write Excel file to browser
            XLSX.writeFile(wb, replaceSpecialChars(replaceSpecialChars(String(filename)))+fileExtension); 
            
            this.setState({ loadinggif: false });   
        });
    }

    print = (isfullscreen) => {
        if(this.state.historyData.past.length > 0){ //!isfullscreen && 
            //have unsaved
            confirmAlert({
                title: this.props.t('There_are_unsaved_changes'),
                message: this.props.t("DO_YOU_WANT_TO_SAVE_AND_PRINT"),
                overlayClassName: (this.props.isRTL === "rtl" ? "alertrtl-content" : ""),
                buttons: [{
                    label: this.props.t('SavenPrint'),
                    onClick: () => {
                        // this.gotprintStart();
                        this.props.togglePrintPending("pdf", true, false, () => {
                            this.handleSaveMP();
                        }, this.state.isFieldWisePDFPrint);
                    }
                }, {
                    label: this.props.t('btnnames.close'),
                    /* onClick: () => {
                        this.gotprintStart()
                    } */
                }]
            })
        } else{
            //no unsaved
            this.gotprintStart();
        }
    }

    gotprintStart = () => {
        this.setState({ printloading: true }, () => {
            this.setFullscreenShow(true);
            setTimeout(() => {
                this.setState({ loadinggif2: true });
            }, 50);

            let filterdmapproductList = this.state.mapproductList.filter(x => x.isDelete !== true);
            // console.log(filterdmapproductList);
            
            if(filterdmapproductList.length !== this.state.loadedprodcount){
                // console.log("not loaded");
                window.setTimeout(this.gotprintStart, 100);
            }else{
                // console.log(" loaded");
                this.handletoImage()
            }
        });
    }
    handletoImage = () => {
        this.setState({
            loadinggif2: true
        }, () => {
            this.StartPrint();
        });
    }

    StartPrint = () => {
        let chaindetails = (this.props.signedobj && this.props.signedobj.signinDetails?this.props.signedobj.signinDetails.chain:null);
        let userdetails = (this.props.signedobj && this.props.signedobj.signinDetails?this.props.signedobj.signinDetails.userDto:null);

        toImg('.sim-catpreview-all-full', 'name', {
            quality: 0.01,
            download: false,
          }).then(fileData => {
            //do something with the data
            var calratio = CalculateRatio(this.state.fullscreenheight,this.state.printHeight)

            this.setState({ 
                PrintFullImg: fileData, 
                printRatio: calratio, 
                printWidth: (this.state.fullscreensvgdrawDiemention.drawWidth * calratio),
            },()=>{
                let isFieldWisePrint = this.state.isFieldWisePDFPrint; //is print is seperate by field
                
                // var imagearray = [];
                //create canvas to crop all simulation fields
                var canvas = document.getElementById("simcatfull-canvas");
                var ctx = canvas.getContext("2d");
                var image = new Image();
                //   console.log(this.state.fullscreenObj,JSON.parse(JSON.stringify(this.state.fullscreenObj)));
                let fullscreenFields = (this.state.fullscreenObj?this.state.fullscreenObj.fields:null);
                let fullscreenProds = (this.state.fullscreenObj?this.state.fullscreenObj.products:[]);

                let selectedCatRect = this.props.selectedCatRect;
                let actualFieldsCounts = this.state.actualFieldsCounts;

                let checkSaftyMargin = roundOffDecimal((this.state.isShowFullscreen?this.state.fullScreenRatio:this.state.displayRatio),2);
                let printallprods = compareAndGetFieldProds(fullscreenFields, selectedCatRect, fullscreenProds, isFieldWisePrint, actualFieldsCounts, 
                    this.state.displayUOM, (this.state.isShowFullscreen?this.state.fullScreenRatio:this.state.displayRatio), checkSaftyMargin);
                // console.log(printallprods);

                //set canvas width/height
                canvas.width=this.state.printWidth;
                canvas.height=this.state.printHeight;
                
                //crop image
                image.src = this.state.PrintFullImg;
                image.onload = () =>{
                    //after image loaded set image to canvas
                    ctx.drawImage(image, 0, 0, this.state.printWidth, this.state.printHeight);

                    //loop available fields
                    let fieldcropx = 0; //last crop x
                    let newprintfields = []; //new fields list after image cropping
                    for (let k = 0; k < printallprods.length; k++) {
                        const printfieldobj = printallprods[k];
                        //empty image array
                        printfieldobj["imagearray"] = [];

                        let fieldtotalwidth = (printfieldobj.totalDrawWidth * calratio);
                        // let fieldendx = (fieldtotalwidth * (k > 0?(k + 1):1));
                        let fieldendx = (fieldcropx + fieldtotalwidth);

                        let printpagecount = Math.ceil(fieldtotalwidth / this.state.printonepagewidthinPX);
                        // console.log(printpagecount, this.state.printWidth, fieldtotalwidth);
                        for (let z = 0; z < printpagecount; z++) {
                            let cropwidth = (
                            (((fieldcropx + this.state.printonepagewidthinPX) > fieldendx) || ((z + 1) === printpagecount && (fieldcropx + this.state.printonepagewidthinPX) < fieldendx))?(fieldendx - fieldcropx)
                            :this.state.printonepagewidthinPX);
                            let cropwidthper = convertWidthPercent(cropwidth, this.state.printonepagewidthinPX);

                            //check last one is less than 50% of print page size
                            let islastpageadded = false;
                            if((z + 2) === printpagecount){
                                let lastpagecropx = (fieldcropx + cropwidth);
                                let lastcropwidth = ((((lastpagecropx + this.state.printonepagewidthinPX) > fieldendx) || ((z + 1) === printpagecount && (lastpagecropx + this.state.printonepagewidthinPX) < fieldendx))?(fieldendx - lastpagecropx):this.state.printonepagewidthinPX);
                                let lastpageper = convertWidthPercent(lastcropwidth, this.state.printonepagewidthinPX);
                                
                                if(lastpageper < 50){
                                    cropwidth = (cropwidth + lastcropwidth);
                                    islastpageadded = true;
                                }
                            }
                            
                            if(cropwidthper > 1){
                                let outbase64 = this.createcanvasiandexportbase64(ctx, fieldcropx, cropwidth);
                                printfieldobj.imagearray.push({ 
                                    width: convertWidthPercent(cropwidth, this.state.printonepagewidthinPX), 
                                    imgsrc: outbase64,
                                    fieldName:printfieldobj.fieldName 
                                });
                            }

                            fieldcropx = (fieldcropx + cropwidth);

                            

                            if(islastpageadded){
                                break;
                            }
                        }
                        
                        if(printfieldobj.imagearray.length > 0){
                            newprintfields.push(printfieldobj);
                        }
                    }

                    printallprods = newprintfields;

                    // console.log(printallprods);

                    let generatedDate = moment().format("MMMM DD YYYY");
                    let generatedTime = moment().format("hh:mm:ss");

                    let callAddFont = function () {
                        this.addFileToVFS('Assistant-Medium-normal.ttf', assistant_medium);
                        this.addFont('Assistant-Medium-normal.ttf', 'Assistant-Medium', 'normal');
                    };
                    jsPDF.API.events.push(['addFonts', callAddFont])
                    // this.setState({loadinggif:false})
                    
                    const pdf = new jsPDF({
                        orientation: "landscape",
                        unit: "px",
                        format:'a4',
                        // compress: true
                    });

                    let width = pdf.internal.pageSize.getWidth();
                    let height = pdf.internal.pageSize.getHeight();

                    let isrtlview = (this.props.isRTL === "rtl");
                    
                    pdf.setFont("Assistant-Medium", "normal");
                    document.getElementById("simcatprint-wrapper").style.display = "block";
                    htmlToImage.toPng(document.getElementById("simcatprint-wrapper"), {
                        width: 1191, 
                        height: 842,
                        quality: 1,
                        cacheBust: true,
                    })
                    .then((coverimage) => {
                        if(document.getElementById("simcatprint-wrapper")){
                            document.getElementById("simcatprint-wrapper").style.display = "none";
                        }
                        
                        pdf.addImage(coverimage, 'PNG', 0, 0,width, height, "alias1", "FAST");
                        pdf.addPage();

                        //if rtl then set rtl
                        const optionsL = {
                            isInputVisual: false,
                            isOutputVisual: true,
                            isInputRtl: false,
                            isOutputRtl: false,
                            align: (isrtlview?"left":"right")
                          };
                          const optionsR = {
                            isInputVisual: false,
                            isOutputVisual: true,
                            isInputRtl: false,
                            isOutputRtl: false,
                            align: (isrtlview?"right":"left")
                          };


                        // Set some general padding to the document
                        const pageMargin = 45;
                        // Reduce width to get total table width
                        const reducetablewidth = (width - 90);

                        let pageno = 1; 
                        let tabledrawy = pageMargin;

                        let lastaddedpage = null; 
                        // let ischecklast = false;
                        for (let index = 0; index < printallprods.length; index++) {
                            let printOneField = printallprods[index];

                            pageno = (pageno + 1);  

                            for (let l = 0; l < printOneField.imagearray.length; l++) {
                                const imgData = printOneField.imagearray[l];

                                pdf.setTextColor(0, 0, 0);
                                //page no
                                pdf.setFontSize(11);
                                pdf.text((this.props.t("PAGE")+" "+pageno), (isrtlview?(width - 40):40), 30, optionsR);
                                //shelf and field details
                                pdf.setFontSize(12);
                                pdf.text(
                                    (!this.state.isFieldWisePDFPrint?(printOneField.category?(printOneField.category+": "+printOneField.categoryNo):"-"):(this.props.t("Field_unit_no")+" "+(index + 1))), 
                                    (isrtlview?(width - 40):40), 55, optionsR
                                ); //
                                pdf.text(imgData.fieldName?imgData.fieldName:"-", (isrtlview?40:(width - 40)), 55, optionsL);
                                //line
                                pdf.setLineHeightFactor(5);
                                pdf.line(40, 60, (width - 40), 60,);
                                //field border and image
                                pdf.setDrawColor(0, 0, 0);
                                pdf.setFillColor(255, 255, 255);
                                pdf.rect(40, 70,(width - 80), (height - 110), 'FD');

                                let imageviewwidth = ((imgData.width <= 100)?(convertWidthPercent(imgData.width, width, true) - (imgData.width >= 80?80:0)):(width - 80));
                                pdf.addImage(imgData.imgsrc, 'PNG', 40, 70,imageviewwidth, (height - 110), ("alias"+(index+""+l)),"FAST");
                                //page footer details
                                let bottombranchtxt = (isrtlview?((this.props.simulateSearchObj && this.props.simulateSearchObj.storeName?(this.props.simulateSearchObj.storeName+" <"):"")+" "+(chaindetails?chaindetails.chainName:"-"))
                                    :((chaindetails?chaindetails.chainName:"-")+" "+(this.props.simulateSearchObj && this.props.simulateSearchObj.storeName?("> "+this.props.simulateSearchObj.storeName):"")));
                                pdf.text(bottombranchtxt, (isrtlview?(width - 40):40), (height - 20), optionsR);
                                
                                let bottomusertxt = (isrtlview?((userdetails?(userdetails.lName+" "+userdetails.fName):"-")+" | "+generatedTime+" | "+generatedDate)
                                    :(generatedDate+" | "+generatedTime+" | "+(userdetails?(userdetails.fName+" "+userdetails.lName):"-")))
                                pdf.text(bottomusertxt, (isrtlview?40:(width - 40)), (height - 20), optionsL);

                                if((l + 1) < printOneField.imagearray.length){
                                    pdf.addPage();
                                    pageno = (pageno + 1);
                                }
                            }
                            
                            //auto table
                            if(printOneField && printOneField.shelfprods && Object.keys(printOneField.shelfprods).length > 0){
                                pdf.addPage();
                                pageno = (pageno + 1);
                                
                                // let shelfidx = 0;
                                for (const shelfkey in printOneField.shelfprods) {
                                    const fieldshelf = printOneField.shelfprods[shelfkey];
                                    
                                    let prodarrobj = [];
                                    for (let j = 0; j < fieldshelf.length; j++) {
                                        const shelfsingleobj = fieldshelf[j];
                                        
                                        let prodsupname = (shelfsingleobj.productBrand && shelfsingleobj.productBrand.supplier?shelfsingleobj.productBrand.supplier.supplierName:"-");
                                        let newprodobj = [shelfsingleobj.barcode, shelfsingleobj.name, prodsupname, shelfsingleobj.qty];
                                        prodarrobj.push(newprodobj);
                                    }
                                    // Let's set up a standard padding that we can add to known coordinates
                                    const padding = 15;
                                    const xPositions = [];

                                    tabledrawy = (tabledrawy === 45 ?(tabledrawy + padding) : tabledrawy);

                                    let bottompagemargin = pageMargin * 2;
                                    if ((tabledrawy + bottompagemargin) > height) {
                                        pdf.addPage();
                                        tabledrawy = (pageMargin + padding);

                                        let newpageno = (pageno + 1);
                                        pageno = newpageno;
                                    }

                                    //headers
                                    pdf.setTextColor("#000000");
                                    pdf.setFontSize(12);
                                    
                                    pdf.text((this.props.t("Shelf_unit_no")+": "+shelfkey), (isrtlview?(width - pageMargin):pageMargin), tabledrawy,optionsR);
                                    pdf.text(((printOneField && printOneField.fieldName)?printOneField.fieldName:"-"), (isrtlview?pageMargin:(width - pageMargin)), tabledrawy, optionsL);
                                    
                                    //line
                                    pdf.setLineHeightFactor(5);
                                    pdf.line(pageMargin, (tabledrawy + 5), (width - pageMargin), (tabledrawy + 5));

                                    tabledrawy = (tabledrawy + 30);

                                    if (!lastaddedpage || lastaddedpage !== pageno) {
                                        lastaddedpage = pageno;
                                        // //page no
                                        pdf.setFontSize(11);
                                        pdf.text(((this.props.t("PAGE")+" "+pageno)), (isrtlview?(width - pageMargin):pageMargin), 30, optionsR);
                                        
                                        // //shelf and field details
                                        pdf.setFontSize(12);
                                        //page footer details
                                        let bottombranchtxt = (isrtlview?((this.props.simulateSearchObj && this.props.simulateSearchObj.storeName?(this.props.simulateSearchObj.storeName+" <"):"")+" "+(chaindetails?chaindetails.chainName:"-"))
                                            :((chaindetails?chaindetails.chainName:"-")+" "+(this.props.simulateSearchObj && this.props.simulateSearchObj.storeName?("> "+this.props.simulateSearchObj.storeName):"")));
                                        pdf.text(bottombranchtxt, (isrtlview?(width - pageMargin):pageMargin), (height - 20), optionsR);
                                    
                                        let bottomusertxt = (isrtlview?((userdetails?(userdetails.lName+" "+userdetails.fName):"-")+" | "+generatedTime+" | "+generatedDate)
                                            :(generatedDate+" | "+generatedTime+" | "+(userdetails?(userdetails.fName+" "+userdetails.lName):"-")))
                                        pdf.text(bottomusertxt, (isrtlview?pageMargin:(width - pageMargin)), (height - 20), optionsL);
                                    }

                                    //table
                                    let headers = [
                                        {key: "barcode", label: this.props.t("barcode"), width: 15},
                                        {key: "name", label: this.props.t("PRODUCT_NAME"), width: 45},
                                        {key: "distributor", label: this.props.t("supname"), width: 30},
                                        {key: "qty", label: this.props.t("FACING"), width: 10}
                                    ];

                                    let headerxpos = (isrtlview?(reducetablewidth + pageMargin):pageMargin); //default start
                                    let headernewy = tabledrawy;

                                    headers.forEach((heading, index) => {

                                        pdf.setTextColor("#000000");
                                        pdf.setFontSize(10);
                                        pdf.text(heading.label, (index === 0 ?headerxpos:(isrtlview?(headerxpos - padding):(headerxpos + padding))), headernewy, optionsR);

                                        xPositions.push(index === 0?(isrtlview?(headerxpos - 3):(headerxpos + 3)):(isrtlview?(headerxpos - padding):(headerxpos + padding)));

                                        //if last one reset to 45
                                        const xPositionForCurrentHeader = (isrtlview?(headerxpos - ((reducetablewidth / 100) * heading.width)):(headerxpos + ((reducetablewidth / 100) * heading.width)));
                                        let defxpos = (isrtlview?reducetablewidth:pageMargin);
                                        headerxpos = ((index + 1) === headers.length?defxpos:xPositionForCurrentHeader);
                                    });
                                    
                                    tabledrawy = (tabledrawy + 20);

                                    // ROWS
                                    let tablerowheight = 20;
                                    let tablecellpadding = 15;

                                    let newheadery = tabledrawy;
                                    let newpageno = pageno;
                                    let curlastaddedpage = lastaddedpage;

                                    fieldshelf.forEach((row, rIndex) => {
                                        const rowHeights = [];
                                        const rowRectHeights = [];

                                        newheadery = (newheadery === 45 ? (newheadery + padding) : newheadery);
                                        
                                        // COLUMNS
                                        let newrowcells = [];
                                        headers.forEach((column, cIndex) => {
                                            const xPositionForCurrentHeader = (((reducetablewidth / 100) * column.width) - tablecellpadding);

                                            const longText = ((column.key !== "barcode" && column.key !== "qty")?pdf.splitTextToSize(String(row[column.key]), xPositionForCurrentHeader):[String(row[column.key])]);
                                            const rowHeight = longText.length * tablerowheight;
                                            rowHeights.push(rowHeight);

                                            const rowRectHeight = (longText.length > 1 ? (longText.length * 16) : tablerowheight);
                                            rowRectHeights.push(rowRectHeight);

                                            let cellobj = { text: longText, xpos: xPositions[cIndex], ypos: newheadery};
                                            newrowcells.push(cellobj);
                                        });

                                        let nextrectrowheight = (Math.max(...rowRectHeights) > tablerowheight ? Math.max(...rowRectHeights) : tablerowheight);

                                        pdf.setFillColor(0, 0, 0, 0.05);
                                        pdf.rect(pageMargin, newheadery - 11, reducetablewidth, nextrectrowheight - 3, "F");

                                        let nextaddy = (Math.max(...rowHeights) > tablerowheight? Math.max(...rowHeights): tablerowheight);

                                        newrowcells.forEach((rowcell, rIndex) => {
                                            pdf.setTextColor("#555555");
                                            pdf.setFontSize(10);

                                            pdf.setLineHeightFactor(1.5);
                                            pdf.text(rowcell.text, rowcell.xpos, rowcell.ypos, optionsR);
                                        });

                                        let newcelly = (newheadery + nextaddy);
                                        newheadery = newcelly;

                                        let bottompagemargin = pageMargin * 2;
                                        if ((newcelly + bottompagemargin) > height && (rIndex + 1) < fieldshelf.length) {
                                            pdf.addPage();

                                            newheadery = (pageMargin + padding);
                                            newpageno = (newpageno + 1);

                                            //if last page add headers
                                                if (!curlastaddedpage || curlastaddedpage !== newpageno) {
                                                    curlastaddedpage = newpageno;
                                                    // //page no
                                                    pdf.setFontSize(11);
                                                    pdf.setTextColor("#000000");
                                                    pdf.text(((this.props.t("PAGE")+" "+curlastaddedpage)), (isrtlview?(width - pageMargin):pageMargin), 30, optionsR);
                                                    
                                                    // //shelf and field details
                                                    pdf.setFontSize(12);
                                                    //page footer details
                                                    let bottombranchtxt = (isrtlview?((this.props.simulateSearchObj && this.props.simulateSearchObj.storeName?(this.props.simulateSearchObj.storeName+" <"):"")+" "+(chaindetails?chaindetails.chainName:"-"))
                                                        :((chaindetails?chaindetails.chainName:"-")+" "+(this.props.simulateSearchObj && this.props.simulateSearchObj.storeName?("> "+this.props.simulateSearchObj.storeName):"")));
                                                    pdf.text(bottombranchtxt, (isrtlview?(width - pageMargin):pageMargin), (height - 20), optionsR);
                                                
                                                    let bottomusertxt = (isrtlview?((userdetails?(userdetails.lName+" "+userdetails.fName):"-")+" | "+generatedTime+" | "+generatedDate)
                                                        :(generatedDate+" | "+generatedTime+" | "+(userdetails?(userdetails.fName+" "+userdetails.lName):"-")))
                                                    pdf.text(bottomusertxt, (isrtlview?pageMargin:(width - pageMargin)), (height - 20), optionsL);
                                                }
                                            // }
                                        }
                                    });
                                    lastaddedpage = curlastaddedpage;

                                    pageno = newpageno;
                                    tabledrawy = (newheadery + 20);
                                }
                            }
                            
                            if((index + 1) < printallprods.length){
                                pdf.addPage();
                                tabledrawy = pageMargin;
                            }
                        }
                        //file name
                        var catname=(this.state.selectedCatRect && this.state.selectedCatRect.selectedCat && this.state.selectedCatRect.selectedCat)?getNameorIdorColorofBox(this.state.selectedCatRect.selectedCat,"name"):"";
                        var depname=this.props.defSaveObj && this.props.defSaveObj.department?((this.props.simType === "AUI")?this.props.defSaveObj.department.name:this.props.defSaveObj.department.department_name):""
                        var userlogged = (this.props.signedobj && this.props.signedobj.signinDetails&&this.props.signedobj.signinDetails.userDto?(this.props.signedobj.signinDetails.userDto.fName+"-"+this.props.signedobj.signinDetails.userDto.lName):"");
                        var fieldcountz=(this.props.simulateCount > 0?this.props.simulateCount:0);
                        var filename=(catname+"_"+depname+"_"+userlogged+"_"+fieldcountz+"Fields")

                        // window.open(pdf.output('bloburl', { filename: 'new-file.pdf' }), '_blank');
                        pdf.save(replaceSpecialChars(String(filename)))
                        this.setState({loadinggif2:false,loadedprodcount:0,printloading:false},()=>{
                            //close fullscreen
                            this.setFullscreenShow(false)
                        })
                    });
                };    
            })
           
          });
    }

    createcanvasiandexportbase64=(ctx, x, desiredWidth)=>{
        var y = 0;
        var desiredHeight = this.state.printHeight;
        var imageContentRaw = ctx.getImageData(x,y,desiredWidth,desiredHeight);
        // create new canvas
        var canvas2 = document.createElement('canvas');
        // with the correct size
        canvas2.width = desiredWidth;
        canvas2.height = desiredHeight;
        // put there raw image data
        // expected to be faster as tere are no scaling, etc
        canvas2.getContext('2d').putImageData(imageContentRaw, 0, 0);
        // get image data (encoded as bas64)
        var result = canvas2.toDataURL("image/png", 1.0)//type,size
        
        return result
    }
    handleloadedprodcount=()=>{
        this.setState({loadedprodcount:(this.state.loadedprodcount+1)})
    }
    StackablemarkableToggle=(isclose)=>{
        this.setState({currentSelectedBlock:null})//unselect block if stackable turning on
        if(isclose){
            this.setState({markablestackable:false},)
        }else{
            if(this.state.markablestackable&&this.state.isStackableEdited){
                this.sendmarkStackableCall()
            }
            this.setState({markablestackable:!this.state.markablestackable,IsShowStackables:true})
        }
       
    }
    StackablemarkableAllToggle=()=>{
        var prodlist=this.state.mapproductList
        var stackablemarkArray=this.state.stackablemarkArray
       
        var isHaveatleastOneunstackable=prodlist.find(pr=>pr.isStackable!==true)
        //mark show products stack boolean
        for (let i = 0; i < prodlist.length; i++) {
            const prod = prodlist[i];
           if(isHaveatleastOneunstackable){
                if(!prod.isStackable){
                    prod.isStackable=true
                    let obj={
                        IsFromFE:true,
                        productId : prod.productId,
                        isStackable : prod.isStackable,
                        maxStackableCount : this.state.stackableCountofmark===""?0:parseInt(this.state.stackableCountofmark)
                    }
                

                    //check selected product is in stack array
                    let haveselectedproductinarrayidx=stackablemarkArray.findIndex(x=>x.productId===prod.productId)
                    // console.log(haveselectedproductinarrayidx);
                    if(haveselectedproductinarrayidx===-1){
                        stackablemarkArray.push(obj)
                    }
                }
           }else{
            if(prod.isStackable){
                prod.isStackable=false
                let obj={
                    IsFromFE:true,
                    productId : prod.productId,
                    isStackable : prod.isStackable,
                    maxStackableCount : this.state.stackableCountofmark===""?0:parseInt(this.state.stackableCountofmark)
                }
            

                //check selected product is in stack array
                let haveselectedproductinarrayidx=stackablemarkArray.findIndex(x=>x.productId===prod.productId)
                // console.log(haveselectedproductinarrayidx);
                if(haveselectedproductinarrayidx===-1){
                    stackablemarkArray.push(obj)
                }
            }
           }
            
        }

        if(this.props.simType === "AUI" || this.props.simType === "Normal"){
            // const combinedPrds = prodlist.concat(this.state.filteredOtherPrds).filter(prd=>prd.isDelete !== true)
            const combinedPrds = prodlist.filter(prd=>prd.isDelete !== true)
            this.props.getProductAnomalies(this.props.mapFields, this.props.mapCategories, combinedPrds)
        }

        this.setState({stackablemarkArray:stackablemarkArray},()=>{
            this.sendmarkStackableArray() 
        })
    }
    handletypemarkStackCout=(evt)=>{
        this.setState({stackableCountofmark:evt.target.value})
    }
    arraycombinestack=(newarray)=>{
        
        var oriarray=this.props.mpstate.mpStackableProdList!==null?this.props.mpstate.mpStackableProdList:[]
        var addeditems = [];
        for (var i = 0; i < oriarray.length; i++) {
            for (var k = 0; k < newarray.length; k++) {
              if (newarray[k].productId === oriarray[i].productId) {
                oriarray[i].isStackable = newarray[k].isStackable;
                addeditems.push(oriarray[i]);
              }
            }
        }

        let newitems = [];
        for (let j = 0; j < newarray.length; j++) {
            let findinadded = addeditems.findIndex(x => x.productId === newarray[j].productId);

            if(findinadded === -1){
                newitems.push(newarray[j]);
            }
        }
        oriarray = oriarray.concat(newitems);

        return oriarray;
    }
    sendmarkStackableArray=()=>{
        var sobj =this.state.stackablemarkArray
        var newproduts=this.arraycombinestack(sobj)
        this.props.setMPStackableProdListArray(newproduts)
        
        this.setState({stackablemarkArray:[], stackableCountofmark:"",isStackableEdited:true});
    }
    sendmarkStackableCall=(type)=>{
        if(this.props.mpstate.mpStackableProdList!==null&&this.props.mpstate.mpStackableProdList.length>0){
            this.setState({
                // loadinggif:true,loadingstackablecall:true,
                isStackableEdited:this.props.isFullScreenEdit?this.state.isStackableEdited:false},()=>{

                var prodlist=JSON.parse(JSON.stringify(this.state.mapproductList))
                //mark show products stack boolean
                for (let i = 0; i < prodlist.length; i++) {
                    const prod = prodlist[i];
                    var have=this.props.mpstate.mpStackableProdList.find(x=>x.productId===prod.productId)
                    if(have){
                        prod.isStackable=have.isStackable
                    }
                }
                this.setState({mapproductList:prodlist},()=>{
                })


                var sobj =this.props.mpstate.mpStackableProdList!==null?this.props.mpstate.mpStackableProdList:[]
                submitSets(submitCollection.bulkUpdateByProductClick, sobj, false, null, true).then(res => {
                    if(res && res.status){
                        // alertService.success(res.extra===""?this.props.t("SUCCESSFULLY_UPDATED"):res.extra)
                        this.setState({
                            // loadinggif: false,loadingstackablecall:false,
                            markablestackable:false, stackableCountofmark:"",},()=>{
                                //put drawing here if not work
                            
                        });
                    }else{
                        // alertService.error(res.extra===""?this.props.t("erroroccurred"):res.extra)
                        // this.setState({loadinggif: false,loadingstackablecall:false})
                    }
                });
                if(type==="back"){
                    this.props.toggleOneCategory()
                }
            })
        }
      
    }
    
    ToggleshowhideStack=()=>{
        this.setState({IsShowStackables:!this.state.IsShowStackables})
    }
    //edit screen in fullscreen mode
    handleFullscreenEdit=(val)=>{
        if(this.state.isStackableEdited){
           
            if(this.props.isFullScreenEdit){
                this.props.sendmarkStackableCallParent()
            }else{
                this.sendmarkStackableCall()
            }
            
        }
        if(this.props.mpstate.mpstackHistory!==null&&this.props.mpstate.mpstackHistory.past.length>0){
            confirmAlert({
                title: this.props.t('There_are_unsaved_changes'),
                message: (this.props.t('YOU_HAVE_UNSAVED_CHANGES_SURE_TO_LEAVE')),
                overlayClassName: (this.props.isRTL === "rtl" ? "alertrtl-content" : ""),
                buttons: [
                    {
                        label: this.props.t('btnnames.yes'),
                        onClick: () => {
                            if(val){
                                // this.reSetNewProdsRemoveProdstoPrevious()
                                this.fieldHistoryReset("switchfullSCEdit",val)
                            }else{
                                
                                this.handleFullscreenEditMethodcall(val)
                                // this.props.mapobjectsdraw("firsttime");
                            }
                        
                        }
                    },
                    {
                        label: this.props.t('btnnames.no'),
                        onClick: () => {   
                            return false
                        }
                    }]
                });
        }else{
            
           this.handleFullscreenEditMethodcall(val);
        //    if(!val){
        //     this.props.mapobjectsdraw("firsttime");
        //    }
        }
       
    }
    handleFullscreenEditMethodcall=(val) => {
        if(this.props.isFullScreenEdit){
            this.props.handleFullscreenEditMethodcall()
        }else{
            this.setState({isSetFullScreenEditModal:val},()=>{
                this.props.setMpEditStackHistory(null)
                if(this.props.mpstate.mpFullscreenEditObj!==null){
                    var Fobj=this.props.mpstate.mpFullscreenEditObj
                    if(Fobj&&!val){//!val only added
                        this.checkAndReloadProds(Fobj.exportsaveobj, Fobj.extra,"fullscreenedit");
                    }
                    
                }
                
                //reload imported product update 
                this.compareImportedProds();
            })
        }
    }

    handleSalesCycleAct = () =>{
        if(this.props.simType==="AUI" && !this.props.isNewProdSim){
            this.setState({isSalesCycle : !this.state.isSalesCycle},()=>{
                if(this.state.isSalesCycle === false && this.state.productTab === 'saleCycle'){
                    this.setState({productTab:'products', selectedScProductId: -1});
                }
                this.props.changeSaleCycleActive(this.state.isSalesCycle)  
            })
        }

        if(this.props.simType==="AUI" && this.props.isNewProdSim){
            this.setState({isSCycle : !this.state.isSCycle},()=>{
                if(this.state.isSCycle === false && this.state.productTab === 'saleCycle'){
                    this.setState({productTab:'products', selectedScProductId: -1});
                }
                this.props.handleSCycle(this.state.isSCycle)  
            })
        }

        if(this.props.simType==="Normal"){
            this.setState({isSCycle : !this.state.isSCycle},()=>{
                if(this.state.isSCycle === false && this.state.productTab === 'saleCycle'){
                    this.setState({productTab:'products', selectedScProductId: -1});
                }
                this.props.handleSCycle(this.state.isSCycle)  
            })
        }
    }
    
   
    // haveplanoversionCreateNewAUI=()=>{
    //     this.openHaveVerAlertBox(true)
    // }
    // openHaveVerAlertBox=(val)=>{
    //     this.setState({APverAlert:val})
    // }
    // closeCNAUIclose=()=>{
    //     this.setState({APverAlert:false})
    // }
    
    handleResetEdit=()=>{
        confirmAlert({
            title: this.props.t('Reset_Changes'),
            message: this.props.t("this_will_reset_your_unsaved_actions_are_you_sure_to_continue"),
            overlayClassName: (this.props.isRTL === "rtl" ? "alertrtl-content" : ""),
            buttons: [{
                label: this.props.t('btnnames.yes'),
                onClick: () => {
                    this.fieldHistoryReset()
                }
            }, {
                label: this.props.t('btnnames.no')
            }]
        });
    }
    // reSetNewProdsRemoveProdstoPrevious=()=>{
    //     if(this.props.mpstate.mpstackHistory!==null&&this.props.mpstate.mpstackHistory.past.length>0){
    //       let mpstackHistory = JSON.parse(JSON.stringify(this.props.mpstate.mpstackHistory));
    //       var clipboardArray=JSON.parse(JSON.stringify(this.props.mpstate.mpClipoardnOther))
         
    //       for (let i = 0; i < clipboardArray.length; i++) {
    //         const clip = clipboardArray[i];
    //         // if(clip.catId===mpstackHistory.CatId){
    //         if(clip.mp_id===mpstackHistory.mp_id){
    //           clip.removeprodlist=mpstackHistory.past[0].removeprodlist
    //           clip.addprodlist=mpstackHistory.past[0].addprodlist
    //         }
    //       }
          
    //       this.props.setMpClipBoardsforCats(clipboardArray)
    //     }
    //   }
    handleShowNewProducts=(val)=>{
        this.setState({isShowNewProds:val})
    }

    //handle click aui preview apply
    auiPreviewApply = () => {
        let previewobj = this.props.selectedSimPreviewObj;

        this.setState({ 
            isShowStrategyModal: true,
            selectedSaveProds: (previewobj && previewobj.selectedProds && previewobj.selectedProds.length > 0?previewobj.selectedProds:[])
         }, () => {
            this.compareStrategyItems();
         });
        //this.handleSaveMP("none", true);
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
    }

    getFieldsWithAnomaly = (products, productsWithAnomaly) => {

        // Get productIds where anomaly is high or low
        const filteredProductIds = productsWithAnomaly.filter(data => data.anomaly === 'high' || data.anomaly === 'low').map(data => data.productId);

        // Get field_custom_id values for filtered productIds
        const fieldCustomIds = [];

        products.forEach(obj => {
            if (filteredProductIds.includes(obj.productId) &&  !fieldCustomIds.includes(obj.field_custom_id)){
                fieldCustomIds.push(obj.field_custom_id);
            }
        });

        this.setState({fieldsWithAnomaly:fieldCustomIds},()=>{
            // console.log(this.state.fieldsWithAnomaly)
        })
    }

    //toggle preview new prod list
    toggleNewProdPreview = () => {
        this.setState({ isShowPreviewNewProds: !this.state.isShowPreviewNewProds });
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
            this.handleSaveMP("none", true);
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
    //filters for non simulated products
    //get categories call
    getAllCategoriesFromDepartment=()=>{
        let defSaveObj = this.props.defSaveObj;
        var csobj={
            isReqPagination:false,
            departmentId:(defSaveObj && defSaveObj.department?(defSaveObj.department.department_id?defSaveObj.department.department_id:defSaveObj.department.id):-1),
        }
        submitSets(submitCollection.getAllCategoriesFromDepartment, csobj, true).then(res => {
            var cdata = [{value:0, label:""}];
            if(res && res.status){
                for (let i = 0; i < res.extra.length; i++) {
                    cdata.push({value:res.extra[i].id, label:res.extra[i].categoryName});
                }
                this.setState({nonsimFilter_categoryList:cdata, scFilter_categoryList:cdata})
            }else{
                alertService.error(this.props.t("ERROR_OCCURED"));
            }
        })
    }
    getbrandsforFilter=()=>{
        var csobj={
            isReqPagination:false
        }
        submitSets(submitCollection.findAllBrands, csobj, true).then(res => {
            var cdata = [{value:0, label:""}];
            if(res && res.status){
                for (let i = 0; i < res.extra.length; i++) {
                    cdata.push({value:res.extra[i].brandId, label:res.extra[i].brandName});
                }
                this.setState({nonsimFilter_brandsList:cdata, scFilter_brandsList:cdata})
            }else{
                alertService.error(this.props.t("ERROR_OCCURED"));
            }
        })
    }
    getSupplierList=()=>{
        var csobj={
            isReqPagination:false
        }
        submitSets(submitCollection.searchSuppliers, csobj, true).then(res => {
            var cdata = [{value:0, label:""}];
            if(res && res.status){
                for (let i = 0; i < res.extra.length; i++) {
                    cdata.push({value:res.extra[i].supplierId, label:res.extra[i].supplierName});
                }
                this.setState({nonsimFilter_supplierList:cdata, scFilter_supplierList:cdata})
            }else{
                alertService.error(this.props.t("ERROR_OCCURED"));
            }
        })
    }
    getSubCategoriesnonSimFilter=()=>{
        let defSaveObj = this.props.defSaveObj;
        var csobj={
            isReqPagination:false,
            depCategoryId:this.state.selectedNonSimFilterCat.value,
            departmentId:(defSaveObj && defSaveObj.department?(defSaveObj.department.department_id?defSaveObj.department.department_id:defSaveObj.department.id):-1),
        }
        submitSets(submitCollection.getSubCategories, csobj, true).then(res => {
            var cdata = [{value:0, label:""}];
            if(res && res.status){
                for (let i = 0; i < res.extra.length; i++) {
                    cdata.push({value:res.extra[i].subCategoryId, label:res.extra[i].subCategoryName});
                }
                this.setState({nonsimFilter_subcategoryList:cdata, scFilter_subcategoryList:cdata})
            }else{
                alertService.error(this.props.t("ERROR_OCCURED"));
            }
        })
    }

    toggleSCFilter=(evt,type)=>{
        if(type==="cat"){
            this.setState({selectedScFilterCat:evt,selectedScFiltersubcat:{value:"-1", label:this.props.t("NONE")}}, () => {
                this.getSubCategoriesnonSimFilter();
            });
        }
        if(type==="brand"){
            this.setState({selectedScFilterBrand:evt})
        }
        if(type==="supllier"){
            this.setState({selectedScFilterSupp:evt})
        }
        if(type==="subcat"){
            this.setState({selectedScFiltersubcat:evt})
        }

        if(type==="status"){
            this.setState({selectedScFilterStat:evt})
        }

        this.handleFilterSCProducts("",true)
        
    }

    togglenonSimFilter=(evt,type)=>{
        if(type==="cat"){
            this.setState({selectedNonSimFilterCat:evt,selectedNonSimFiltersubCat:{value:"-1", label:this.props.t("NONE")}}, () => {
                this.getSubCategoriesnonSimFilter();
            });
        }
        if(type==="brand"){
            this.setState({selectedNonSimFilterBrand:evt})
        }
        if(type==="supllier"){
            this.setState({selectedNonSimFilterSupp:evt})
        }
        if(type==="subcat"){
            this.setState({selectedNonSimFiltersubCat:evt})
        }

        this.handleFilterNoEProducts("",true)
        
    }

    cannotDropWarningHandle=()=>{
        this.setState({isProductDropwarn:!this.state.isProductDropwarn})
    }
    // handleacknowledgeSimulationWarning=(obj)=>{
    //     if(obj){
    //         confirmAlert({
    //             title: this.props.t('Sure_to_aknowladge_warnining'),
    //             message: this.props.t("this_action__will_remove_this_warning_only_for_this_snapshot"),
    //             overlayClassName: (this.props.isRTL === "rtl" ? "alertrtl-content" : ""),
    //             buttons: [{
    //                 label: this.props.t('btnnames.yes'),
    //                 onClick: () => {
    //                     this.acknowledgeSimulationWarning(obj)
    //                 }
    //             }, {
    //                 label: this.props.t('btnnames.no'),
    //                 onClick: () => {
    //                     return false;
    //                 }}]
    //             });
    //     }else{
    //         confirmAlert({
    //             title: this.props.t('Sure_to_aknowladge_warnining'),
    //             message: this.props.t("this_action__will_remove_this_all_warning_only_for_this_snapshot"),
    //             overlayClassName: (this.props.isRTL === "rtl" ? "alertrtl-content" : ""),
    //             buttons: [{
    //                 label: this.props.t('btnnames.yes'),
    //                 onClick: () => {
    //                     this.acknowledgeSimulationWarning(obj)
    //                 }
    //             }, {
    //                 label: this.props.t('btnnames.no'),
    //                 onClick: () => {
    //                     return false;
    //                 }}]
    //             });
    //     }
       

    //update ghost object
    updateGhostObjDetails = (ghostobj) => {
        let checkghostobj = (ghostobj.width > 0 && ghostobj.height > 0?ghostobj:null);
        this.setState({ ghostWrapperObj: checkghostobj });
    }

    // }
    // acknowledgeSimulationWarning=(obj)=>{
    //     let sobj = {type : obj?"PRODUCT":"ALL",
    //     productId :  obj?obj.id:-1,
    //     simulationSnapshotId: this.props.simulationObj?this.props.simulationObj.simulationSnapshotId:-1}
    //     this.setState({loadinggif:true})
    //     submitSets(submitCollection.acknowledgeSimulationWarning, sobj, false).then(res => {
    //         if(res.status){
    //             var list=obj?this.state.productEditWarningsList.filter(x=>x.id!==obj.id):[]
    //             this.setState({productEditWarningsList:list,loadinggif:false})
    //         }else{
    //             alertService.error(res.extra);
    //         }
    //         this.setState({loadinggif:false})
            
    //     });
    // }

    //update
    reloadProdWarnModalDetails = (isshowmodal) => {
        let citem = this.state.selectedwarningdropprod;

        this.props.toggleLoadingModal(true, () => {
            let svobj = "?productId="+citem.id;
            submitSets(submitCollection.findProdByID, svobj).then(res => {
                // console.log(res.extra);
                
                if(res && res.status && res.extra){
                    let prodobj = res.extra;

                    let departmentId = (this.props.defSaveObj && this.props.defSaveObj.department?((this.props.simType === "AUI")?this.props.defSaveObj.department.id:this.props.defSaveObj.department.department_id):null);
                    let departmentname = (this.props.defSaveObj && this.props.defSaveObj.department?(((this.props.simType === "AUI")?this.props.defSaveObj.department.name:this.props.defSaveObj.department.department_name)+" "+this.props.t("department")):"-");
                    // console.log(deptObj);
                    let prodwarnlist = validateHeirarchyMissings(prodobj, departmentId, departmentname);
    
                    let searchProdList = this.state.filteredProdList;
                    let selProdIdx = searchProdList.findIndex(x => x.id === prodobj.id);
                    // console.log(prodobj);
                    searchProdList[selProdIdx] = prodobj;

                    let importedDataObj = this.props.importedDataObj;
                    let excelUploadList = importedDataObj.excelUploadList;
                    let importedProdIdx = excelUploadList.findIndex(x => x.id === prodobj.id);

                    if(importedProdIdx > -1){
                        let oldobj = structuredClone(excelUploadList[importedProdIdx]);
                        // console.log(oldobj);
                        
                        excelUploadList[importedProdIdx] = prodobj;
                        excelUploadList[importedProdIdx].availabilityType = oldobj.availabilityType;
                    }
                    
                    //update warning list, imported prod list and product details states
                    this.setState({
                        dropWarningList: prodwarnlist,
                        selectedwarningdropprod: prodobj,
                        filteredProdList: searchProdList,
                    }, () => {
                        this.props.updateImportedDataObj(importedDataObj);
                    });
    
                    //if no warnings available
                    if(prodwarnlist.length === 0){
                        this.setState({
                            dropWarningList: [], selectedwarningdropprod: null, isProductDropwarn: false,
                        });
                    } else{
                        if(isshowmodal){
                            this.setState({ isProductDropwarn: true });
                        }
                    }
                }

                this.props.toggleLoadingModal(false);
            });
        });
    }

    //
    toggleNewProdTab = (viewtab) => {
        this.setState({ newProdTab: viewtab });
    }
    //
    sendExcelData = (prodlist, totalcount, additionalIDs) => {
        if(totalcount > 0){
            let importedDataObj = this.props.importedDataObj;
            importedDataObj.excelUploadList = [];
            importedDataObj.totalExcelProdCount = 0;
            importedDataObj.excelStartIndex = 0;
            importedDataObj.excelSearchText = "";

            let additionalIDs = (this.props.isSetFullScreenEditModal || this.props.isShowFromPreview?"-fullview":"");
            this.setState({ 
                productTab: "products",
                newProdTab: ("imported"+additionalIDs),
            }, () => {
                this.loadImportProdList();
                this.props.updateImportedDataObj(importedDataObj);
            });
        }
    }
    //update imported scroll list
    updateImportScrollList = (scrollTop) => {
        this._importedScrollHeight = scrollTop;
    }
    //update prod list
    updateExcelSearchText = (evt, isreset, value) => {
        let importedDataObj = this.props.importedDataObj;

        //if enter
        if(isreset || evt.which === 13){
            importedDataObj.excelSearchText = (isreset?"":value);
            importedDataObj.excelStartIndex = 0;

            this.props.updateImportedDataObj(importedDataObj, () => {
                this.loadImportProdList();
            });
        }
    }
    //load imported prod list
    loadImportProdList = () => {
        this.updateImportScrollList(0);

        let importedDataObj = this.props.importedDataObj;

        let mpId = (this.props.originatedMpId && this.props.originatedMpId > -1?this.props.originatedMpId:this.props.defSaveObj?this.props.defSaveObj.mp_id:-1);
        if(this.props.isShowFromPreview && this.props.selectedSimPreviewObj){
            mpId = this.props.selectedSimPreviewObj.mpId;
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

        this.props.updateImportedDataObj(importedDataObj, () => {
            submitSets(submitCollection.getSimImportedProdBarcodes, sendobj, false).then(res => {
                // console.log(res);
                let mergedProds = [];
                if(res && res.status){
                    let datalist = (res.extra && res.extra.importedBarcodes && res.extra.importedBarcodes.length > 0?res.extra.importedBarcodes:[]);
                    
                    for (let i = 0; i < datalist.length; i++) {
                        const importedProd = datalist[i];
                        importedProd.subCategoryName = importedProd.subcategoryName;
                        importedProd.subCategoryColor = importedProd.subcategoryColor;
                        importedProd.subCategoryId = importedProd.subcategoryId;
                    }
                    // console.log(datalist);
                    mergedProds = (sendobj.startIndex === 0?datalist:importedDataObj.excelUploadList.concat(datalist));
                    
                    if(sendobj.startIndex === 0){
                        importedDataObj.totalExcelProdCount = (res.count > 0?res.count:0);
                    }

                    importedDataObj.excelStartIndex = (importedDataObj.excelStartIndex + (datalist.length > 0?datalist.length:0));
                }

                importedDataObj.isImportDataLoading = false;
                this.props.updateImportedDataObj(importedDataObj, () => {
                    this.setImportedProds(mergedProds);
                });
            });
        });
    }
    //set imported prods
    setImportedProds = (datalist, isReloadProds, isFEDelete, removelist) => {
        let importedDataObj = this.props.importedDataObj;

        if(isFEDelete){
            // console.log(removeItem);
            let filteredUploadList = importedDataObj.excelUploadList;
            
            for (let i = 0; i < removelist.length; i++) {
                filteredUploadList = filteredUploadList.filter(x => x.barcode !== removelist[i]);
            }

            importedDataObj.excelUploadList = filteredUploadList;
            importedDataObj.excelStartIndex = ((importedDataObj.excelStartIndex - removelist.length) > -1?(importedDataObj.excelStartIndex - removelist.length):0);
            importedDataObj.totalExcelProdCount = ((importedDataObj.totalExcelProdCount - removelist.length) > -1?(importedDataObj.totalExcelProdCount - removelist.length):0);

            this.props.updateImportedDataObj(importedDataObj);
        } else{
            importedDataObj.excelUploadList = datalist;
            this.props.updateImportedDataObj(importedDataObj, () => {
                //reload imported product update 
                this.compareImportedProds();
            });
        }
    }
    //compare imported prod list
    compareImportedProds = () => {
        let importedDataObj = this.props.importedDataObj;
        if(importedDataObj){
            let importedProds = importedDataObj.excelUploadList;
    
            for (let i = 0; i < importedProds.length; i++) {
                const importprod = importedProds[i];
                let isAdded = this.state.mapproductList.find(x => x.barcode === importprod.barcode && !x.isDelete);
                
                importprod.isAdded = (isAdded?true:false);
            }
    
            this.props.updateImportedDataObj(importedDataObj);
        }
    }
    //manage excel upload pagination details
    setExcelUploadPagination = (updateobj, _callback) => {
        this.setState({ excelUploadPagination: updateobj }, () => {
            if(_callback){
                _callback();
            }
        });
    }
    //update imported prod list
    updateImportedList = (updatedlist) => {
        let importedDataObj = this.props.importedDataObj;
        importedDataObj.excelUploadList = updatedlist;

        this.props.updateImportedDataObj(importedDataObj);
    }
    //close excel upload info
    closeExcelUploadFile = () => {
        let popoverelem = document.getElementById("productexport-examples");
        if(popoverelem && popoverelem.classList.contains("show")){
            document.getElementById("upload-info-link").click();
        }
    }

    setLableWidth=(drawwidthfield)=>{
        let retunval=0
        let maxWidth=250
        let lowWidth=25
        var percentageWidth=drawwidthfield*0.30
        if(lowWidth>percentageWidth){
            retunval=lowWidth
        }else if(maxWidth<percentageWidth){
            retunval=maxWidth
        }else{
            retunval=percentageWidth
        }
        return retunval
    }
    checkoverlapingprod=()=>{
        console.log(this.state.mapproductList);
        var filtedlist=this.state.mapproductList.filter(x=>x.isDelete!==true)
       // Find overlapping pairs of boxes
        const overlappingPairs = this.findOverlappingPairs(filtedlist);
        // Print the overlapping pairs
        if (overlappingPairs.length > 0) {
            console.log("Overlapping pairs:");
            overlappingPairs.forEach(pair => {
                console.log(`Box ${pair.box1.id} x:${pair.box1.x} xend:${pair.box1.x+pair.box1.drawWidth} overlaps with Box ${pair.box2.id} x:${pair.box2.x} xend:${pair.box2.x+pair.box2.drawWidth}`);
            });
        } else {
            console.log("No boxes overlap.");
        }
    }
    // Define a function to check if two boxes overlap
    boxesOverlap=(box1, box2)=> {
        return this.overlapOnXAxis(box1, box2) && this.overlapOnYAxis(box1, box2);
    }
    // Define a function to check if two boxes overlap along the X-axis
    overlapOnXAxis=(box1, box2) =>{
        const box1RightX = box1.x + box1.width;
        const box2RightX = box2.x + box2.width;
        return box1.x < box2RightX && box1RightX > box2.x;
    }
    // Define a function to check if two boxes overlap along the Y-axis
    overlapOnYAxis=(box1, box2)=> {
        const box1BottomY = box1.y + box1.height;
        const box2BottomY = box2.y + box2.height;
        return box1.y < box2BottomY && box1BottomY > box2.y;
    }
    // Function to check if any two boxes overlap in the array
    findOverlappingPairs=(boxes)=> {
        const overlappingPairs = [];
        for (let i = 0; i < boxes.length; i++) {
            for (let j = i + 1; j < boxes.length; j++) {
                if (this.boxesOverlap(boxes[i], boxes[j])) {
                    overlappingPairs.push({ box1: boxes[i], box2: boxes[j] });
                }
            }
        }
        return overlappingPairs;
    }
    render() {
        var {fullscreenObj,mapFields,mapproductList, isAddProucts,addedProductsCounter,
            svgdrawDiemention,fieldsWithAnomaly, isShowPreviewNewProds, isShowNewProds,
            cutNewArray, actualFieldStructures, isDisableEDitingwithfullscreen} = this.state;
        // let { isAuiViewsAllow, simulationObj, isSCycle, isSalesCycle, isShowFromPreview, ConversionAvailabilityDetails, isCustomPushEnabled,productEditWarningsList } = this.props;
        let { isAuiViewsAllow, simulationObj, isSCycle, isSalesCycle, isShowFromPreview, ConversionAvailabilityDetails, isCustomPushEnabled, productEditWarningsList } = this.props;
        let editwrapper = document.getElementById(this.state.wrapperId);
        var mapCategories = this.state.mapCatRects;
        let filteredcutNewArray = cutNewArray.filter(x=>x.isDelete!==true);
        //mapCatRects,mapSubCatRects,mapBrandrects, console.log((editwrapper?editwrapper.clientWidth:0));
        let reduceViewHeight = (this.props.simType !== "AUI" && this.props.isShowCleanSnapshotWarn?true:false);

        //imported prod list
        let importedDataObj = this.props.importedDataObj;
        // console.log(importedDataObj);
        let isFullscreenIdShow = (this.props.isIsleSimulation || this.props.isSetFullScreenEditModal);

        return (
            <Col className={"MPSimulateOneModal "+(isShowFromPreview?" previewShow ":"")+(this.props.simType==="AUI"?this.props.isSetFullScreenEditModal || this.props.isShowFromPreview?"preview-SimulateOneModal":"aiuMPSimulateOneModal-Aui":this.props.simType!==SimulationTypesFE.AUI?"normal-SimulateOneModal":"")}  >
                 {this.props.isFullScreenEdit?<Button className='CloseModal-FE-Internalbtn' onClick={() => this.handleFullscreenEdit(false)}><XIcon size={21} /></Button>:<></>}
                <Col className="simulate-edit-wrapper">
                {/* <Button onClick={()=>this.checkoverlapingprod()}>check</Button> */}
                    <Row>
                        <Col md={isDisableEDitingwithfullscreen?12:8}>
                            <div className={"lables-sim "+(this.props.simType === "AUI"?this.props.isFullScreenEdit?"auiFSedit":"auiedit":"normaledit")}>
                                { this.props.storeId ? this.props.storeId > 0 ? this.props.originatedMpId ? this.props.originatedMpId > -1 ? this.props.originatedMpName ? <div className='relogram-info'> {this.props.t("RELOGRAM")} : {this.props.originatedMpName}</div> : <></> : <></> : <></> : <></> : <></> }
                                {simulationObj&&simulationObj.simulationSnapshotId>0? <TooltipWrapper placement="bottom" text= {this.props.t("SnapShot")}><span className={'snapshot-icon-sim '+(this.props.simType !== "AUI"?"dep":"editcat")}><FeatherIcon icon="bookmark"  size={16} />
                                </span></TooltipWrapper>:<></>}
                            </div>
                            <Col xs={12} className={"middle-section "+(isShowFromPreview?" sim-previewview ":"")+(reduceViewHeight?" reduce-viewheight ":"")+(this.props.simType==="AUI"?"middle-section-Aui":"")} 
                            // ref={this.displaydiv}
                            >
                                {(this.props.isSalesCycle === false && this.props.isSCycle === false) ?<div className='xray xray-dep'>
                                    <ButtonGroup style={{marginTop:isDisableEDitingwithfullscreen?"20px":"0px"}}>
                                        <Button size="sm" className={this.state.xrayActive===4?"active":""}  onClick={()=>this.handleXrayDepView(4)}>{this.props.t("category")}</Button>
                                        <Button size="sm" className={this.state.xrayActive===2?"active":""}  onClick={()=>this.handleXrayDepView(2)}>{this.props.t("subcategory")}</Button>
                                        <Button size="sm" className={this.state.xrayActive===3?"active":""}  onClick={()=>this.handleXrayDepView(3)}>{this.props.t("brand")}</Button>
                                        <Button size="sm" className={this.state.xrayActive===1?"active":""}  onClick={()=>this.handleXrayDepView(1)}>{this.props.t("products")}</Button>
                                    </ButtonGroup>
                                </div>:<></>}
                                
                                {!isDisableEDitingwithfullscreen?<Col xs={12} className="svg-controllers controllerbox">
                                    <div style={{display:"flex"}}  >
                                        <SimEditToolBox 
                                            t={this.props.t} isRTL={this.props.isRTL}
                                            isDisableEDitingwithfullscreen={this.state.isDisableEDitingwithfullscreen}
                                            isDisableEdits={this.state.isDisableEdits}
                                            mapproductList={mapproductList} 
                                            contxtmenu={this.state.contxtmenu}
                                            zoomXRatio={this.state.zoomXRatio} 
                                            activeTool={this.state.activeTool}
                                            markablestackable={this.state.markablestackable} 
                                            loadingstackablecall={this.state.loadingstackablecall}
                                            IsShowStackables={this.state.IsShowStackables} 
                                            isshowedit={this.state.isshowedit}
                                            historyData={this.state.historyData}
                                            isAddProucts={isAddProucts}
                                            print={this.print}
                                            printInit={this.printInit}
                                            handleZoomInOut={this.handleZoomInOut} 
                                            toggleZoompan={this.toggleZoompan}
                                            StackablemarkableToggle={this.StackablemarkableToggle} 
                                            StackablemarkableAllToggle={this.StackablemarkableAllToggle}
                                            ToggleshowhideStack={this.ToggleshowhideStack} 
                                            handleToolControls={this.handleToolControls}
                                            fieldHistoryRedo={this.fieldHistoryRedo} 
                                            fieldHistoryUndo={this.fieldHistoryUndo}
                                            removeExpandOpts={this.removeExpandOpts}
                                            />
                                        <div className={"toolbox showingbox"+(this.state.contxtmenu&&this.state.contxtmenu.isexpand?" expand":"")}>
                                            <ul className={"svg-toolkit newpgtop-btnlist list-inline"} style={{marginTop:"-2px", paddingRight:"0px"}}>
                                                <li className={"list-inline-item tool-controls-list"} style={{marginRight:"5px"}}>
                                                    {this.state.IsShowStackables?<Button variant="outline-dark"   className={"btn-with-icon "} size="sm" onClick={()=>this.ToggleshowhideStack()} title={this.props.t("HideStackable")}><FeatherIcon icon="eye-off"   size={16} /></Button>:
                                                    <Button variant="outline-dark"   className={"btn-with-icon "} size="sm" onClick={()=>this.ToggleshowhideStack()} title={this.props.t("ShowStackable")}><FeatherIcon icon="eye"   size={16} /></Button>}
                                                </li>
                                               {isAuiViewsAllow? <li className={"list-inline-item tool-controls-list hver"} style={{marginRight:"0px"}}><Button active={this.state.isShowNewProds} title={this.props.t("showhidenewproducts")} variant="outline-dark" onClick={() => this.handleShowNewProducts(!this.state.isShowNewProds)} className={"btn-with-icon "} size="sm"><NewReplaceProductIcon   /></Button></li>:<></>}
                                            </ul>
                                        </div>

                                        <div className='othertools'>
                                            {this.props.isShowFromPreview?
                                                <Button style={{marginRight:"5px"}} onClick={() => this.toggleNewProdPreview()} variant='outline-dark' className={"btn-with-icon newprod-link"} active={isShowPreviewNewProds} size="sm" title={this.props.t("showhidenewproducts")}><NewReplaceProductIcon /></Button>
                                            :<></>}  

                                            <Button onClick={() => this.handleZoomInOut(true)} className={"btn-with-icon zoombtn"} size="sm" title={this.props.t("ZOOM_IN")}><PlusIcon size={16}  /></Button>
                                            <Button style={{marginLeft:"5px",marginRight:"5px"}} onClick={() => this.handleZoomInOut(false)} className={"btn-with-icon zoombtn"} size="sm" title={this.props.t("ZOOM_OUT")}><DashIcon  size={16} /></Button>
                                            {/* {this.props.simType === "Normal" && this.props.selectedBrch !== null && <label className={"pure-material-switch plg-check-edit"} >
                                                <input type="checkbox" checked={this.state.isSCycle} onChange={this.handleSalesCycleAct} />
                                                <span style={{color:(this.props.dmode?'#2CC990':'#5128a0')}}>{this.props.t('SALE_CYCLE')}</span>
                                            </label>} */}
                                            
                                            
                                            {(((this.props.simType === "AUI" && this.props.isFullscreenEditModal)||this.props.simType !== "AUI"))?<Button style={{marginLeft:"5px"}} onClick={() => this.setFullscreenShow(true)} className={"btn-with-icon zoombtn"} size="sm" title={this.props.t("Full_Screen")}><FeatherIcon icon="maximize"  size={16} /></Button>:<></>}
                                            {((!isShowFromPreview && !this.props.isFullscreenEditModal)&&(this.props.simType==="AUI"))?<Button style={{marginLeft:"5px"}} onClick={() => this.handleFullscreenEdit(true)} className={"btn-with-icon zoombtn"} size="sm" title={this.props.t("Full_Screen")}><FeatherIcon icon="maximize-2"  size={16} /></Button>:<></>}
                                            {((this.props.isFullscreenEditModal)&&(this.props.simType==="AUI"))?<Button style={{marginLeft:"5px"}} onClick={() => this.handleFullscreenEdit(false)} className={"btn-with-icon zoombtn"} size="sm" title={this.props.t("MINIMIZE_Screen")}><FeatherIcon icon="minimize-2"  size={16} /></Button>:<></>}
                                            {/* {((this.props.isFullscreenEditModal)&&(this.props.simType==="AUI"))?<label className={this.props.isFullscreenEditModal?"pure-material-switch plg-check-fullscreen":"pure-material-switch plg-check"} >
                                                <input type="checkbox" checked={this.state.isSalesCycle} onChange={this.handleSalesCycleAct} />
                                                <span style={{color:(this.props.dmode?'#2CC990':'#5128a0')}}>{this.props.t('SALE_CYCLE')}</span>
                                            </label>:<></>} */}

                                            {/* {(this.props.simType === "Normal" && !isCustomPushEnabled) && this.props.selectedBrch !== null && <label className={"pure-material-switch plg-check-edit"} > */}
                                            { ( this.props.simType!=="AUI" || (this.props.simType==="AUI" && this.props.isNewProdSim) ) && <label className={"pure-material-switch plg-check-edit"} >
                                                <div className='Scycle'>

                                                {
                                                this.props.disableSCycle ? 
                                                <TooltipWrapper placement="bottom" text={this.props.t('LESS_PRD')}>
                                                <div>
                                                    <span style={{color:(this.props.dmode?'#2CC990':'#4F4F4F')}}>{this.props.t('SALE_CYCLE')}</span>
                                                    <Switch disabled={this.props.disableSCycle} onChange={this.handleSalesCycleAct} checked={this.state.isSCycle} height={17} width={30} uncheckedIcon={true} checkedIcon={true}
                                                    handleDiameter={12} activeBoxShadow={"none"} className={"Scycleswitch"+(this.state.isSCycle?" checked":"")} onColor={"#f2f1ff"} offColor={"#f2f1ff"} offHandleColor={"#C2BFBF"} onHandleColor={this.props.dmode?"#2CC990":"#5128A0"} />
                                                    <InfoIcon size={16} color={"red"} />
                                                </div>
                                                </TooltipWrapper> : 
                                                <>
                                                    <span style={{color:(this.props.dmode?'#2CC990':'#4F4F4F')}}>{this.props.t('SALE_CYCLE')}</span>
                                                    <Switch onChange={this.handleSalesCycleAct} checked={this.state.isSCycle} height={17} width={30} uncheckedIcon={true} checkedIcon={true}
                                                    handleDiameter={12} activeBoxShadow={"none"} className={"Scycleswitch"+(this.state.isSCycle?" checked":"")} onColor={"#f2f1ff"} offColor={"#f2f1ff"} offHandleColor={"#C2BFBF"} onHandleColor={this.props.dmode?"#2CC990":"#5128A0"} />
                                                    {   this.state.isSCycle && this.props.isChainSaleCycle && 
                                                            <PopoverWrapper cusid="salecycle-pop" trigger={["hover","focus"]} 
                                                                text={
                                                                    <div>
                                                                          <h6>{this.props.t("SALECYCLE_MESSAGE")}</h6>
                                                                    </div>
                                                                } placement="top">
                                                                <FeatherIcon className="alrt" icon="alert-triangle" size={20}/>
                                                            </PopoverWrapper>
                                                    }
                                                </>
                                                
                                                }
                                                </div>
                                            </label>}

                                            {((this.props.isFullscreenEditModal)&&(this.props.simType==="AUI"))?<label className={"pure-material-switch plg-check-fullscreen"} >
                                                <div className='Scycle'>
                                                        {this.props.disableSalesCycleState ? 
                                                        <TooltipWrapper placement="bottom" text={this.props.t('LESS_PRD')}>
                                                            <div>
                                                                <span style={{color:(this.props.dmode?'#2CC990':'#4F4F4F')}}>{this.props.t('SALE_CYCLE')}</span>
                                                                <Switch disabled={this.props.disableSalesCycleState } onChange={this.handleSalesCycleAct} checked={this.state.isSalesCycle} height={17} width={30} uncheckedIcon={true} checkedIcon={true}
                                                                handleDiameter={12} activeBoxShadow={"none"} className={"Scycleswitch"+(this.state.isSalesCycle?" checked":"")} onColor={"#f2f1ff"} offColor={"#f2f1ff"} offHandleColor={"#C2BFBF"} onHandleColor={this.props.dmode?"#2CC990":"#5128A0"} />
                                                                <InfoIcon size={16} color={"red"} />
                                                            </div>
                                                        </TooltipWrapper>
                                                        :
                                                        <>
                                                            <span style={{color:(this.props.dmode?'#2CC990':'#4F4F4F')}}>{this.props.t('SALE_CYCLE')}</span>
                                                            <Switch onChange={this.handleSalesCycleAct} checked={this.state.isSalesCycle} height={17} width={30} uncheckedIcon={true} checkedIcon={true}
                                                            handleDiameter={12} activeBoxShadow={"none"} className={"Scycleswitch"+(this.state.isSalesCycle?" checked":"")} onColor={"#f2f1ff"} offColor={"#f2f1ff"} offHandleColor={"#C2BFBF"} onHandleColor={this.props.dmode?"#2CC990":"#5128A0"} />
                                                            {   this.state.isSalesCycle && this.props.isChainSaleCycle && 
                                                                <PopoverWrapper cusid="salecycle-pop" trigger={["hover","focus"]} 
                                                                    text={
                                                                        <div>
                                                                            <h6>{this.props.t("SALECYCLE_MESSAGE")}</h6>
                                                                        </div>
                                                                    } placement="top">
                                                                    <FeatherIcon className="alrt" icon="alert-triangle" size={20}/>
                                                               </PopoverWrapper>
                                                            }
                                                        </>
                                                        }
                                                        
                                                </div>
                                            </label>:<></>}
                                            {/* <Button style={{marginLeft:"5px"}} onClick={() => this.print()} className={"btn-with-icon zoombtn"} size="sm" title={this.props.t("print")}><FeatherIcon icon="print"  size={16} /></Button> */}
                                            {/* {!markablestackable?
                                                <Button  style={{marginLeft:"5px"}}  className={"btn-with-icon opendstackdivbt"} size="sm" >
                                                    <span onClick={()=>this.StackablemarkableToggle()} title={this.props.t("STACKABLE")}><FeatherIcon icon="layers"  size={16} /></span>
                                                {this.state.IsShowStackables?<span onClick={()=>this.ToggleshowhideStack()} title={this.props.t("HideStackable")}><FeatherIcon icon="eye-off"   size={16} /></span>:
                                                <span onClick={()=>this.ToggleshowhideStack()} title={this.props.t("ShowStackable")}><FeatherIcon icon="eye"   size={16} /></span>}
                                                    
                                                    </Button>
                                                    :<></>}
                                            {markablestackable?
                                                <Button  style={{marginLeft:"5px"}}  className={"btn-with-icon opendstackdivbt"} size="sm">
                                                <FeatherIcon icon="layers"  size={16} />
                                                    <input className='maxstackcount' type="number" value={this.state.stackableCountofmark} onChange={(e)=>this.handletypemarkStackCout(e)} onKeyDown={ (evt) => (evt.key === 'e'||evt.key === '-'||evt.key === '.') && evt.preventDefault() } />
                                                    <span className='actionbtn-ok' onClick={()=>this.sendmarkStackableCall()}> <FeatherIcon icon="check"  size={14} /></span>
                                                    <span className='actionbtn-x'> <FeatherIcon icon="x"  size={14} onClick={()=>this.StackablemarkableToggle(true)} /></span>
                                                    {this.state.stackablemarkArray.length>0&&<span className='unsaved'>{this.state.stackablemarkArray.length}</span>}
                                                </Button>
                                            :<></>} */}
                                        </div>
                                        
                                    </div>
                                </Col>:<></>}
                                
                                {this.state.isviewcmenu2?<BlockContextMenu isRTL={this.props.isRTL}   
                                    handlclose={() => this.setState({isviewcmenu2:false})} 
                                    // handleBlockDelete={this.confirmingDeleteSelecteBlock}
                                    handleBlockDelete={this.handleBlockCut}
                                    handleBlockCut={this.handleBlockCut}
                                    xpos={this.state.isviewcmenu2?this.state.contxtmenu2.xpos:0} ypos={this.state.isviewcmenu2?this.state.contxtmenu2.ypos:0}/>
                                :<></>}

                                {this.state.isviewcmenu?<ContextMenu isRTL={this.props.isRTL} citem={this.state.contxtmenu.citem} currentprod={this.state.currentInternalDraggableProd} handlechangeobj={this.handleChangeObj} 
                                    handledelete={this.handleDeleteProd} handleopenDetailmodal={this.handleopenDetailmodal}
                                    handledeleteall={this.handleDeleteAllProds} handlexpand={this.handleExpandProd} handlclose={() => this.setState({isviewcmenu:false})} 
                                    cutContextItem={this.cutContextItem} xpos={this.state.isviewcmenu?this.state.contxtmenu.xpos:0} ypos={this.state.isviewcmenu?this.state.contxtmenu.ypos:0} handlePreviewModal={this.handlePreviewModal} copyToClipboard={this.copyToClipboard} />
                                :<></>}
                                {/* {simulationObj&&simulationObj.simulationSnapshotId>0? <TooltipWrapper placement="bottom" text= {this.props.t("SnapShot")}><span className={'snapshot_span '+(this.props.simType === "AUI"?"onecataui":'onecat')}><FeatherIcon icon="bookmark"  size={16} />
                                </span></TooltipWrapper>:<></>} */}
                                <Col id={this.state.wrapperId} className={"sim-wrapper"+(isShowFromPreview?" sim-previewview":"")+(reduceViewHeight?" reduce-viewheight":"")} onScroll={this.removeExpandOpts}  ref={this.displaydiv}>  {/* style={{height:(this.state.catDivHeight+10)}} */} 
                                    <Col className="drawing-div">
                                        <React.Fragment>
                                            {(mapFields&&Object.keys(mapFields).length>0)&&<Col  className="single-simitem" onContextMenu={e => e.preventDefault()} style={{width: "100%"}}> {/* ,height:this.state.catDivHeight */}
                                                <svg id={this.state.svgViewId} viewBox={"0 0 "+svgdrawDiemention.drawWidth+" "+this.state.catDivHeight} width={(this.state.zoomXRatio > 0 && (editwrapper.clientWidth > svgdrawDiemention.drawWidth)?editwrapper.clientWidth:svgdrawDiemention.drawWidth)} style={{  border: '0px solid rgb(81, 40, 160)'}}
                                                onMouseDown={(e) => this.svgMouseDown(e)} onMouseMove={(e)=>this.svgMouseMove(e)} onMouseUp={(e) => this.svgMouseUp(e)} 
                                                ref={(ref) => this.drawSVG = ref} version="1.1" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">  {/* height={this.state.catDivHeight} */}
                                                                        
                                                    {(mapproductList&&Object.keys(mapproductList).length>0)?Object.keys(mapproductList).map((ProdS,prodtS)=>{
                                                        var Sproduct = mapproductList[ProdS];
                                                        
                                                        return <React.Fragment key={prodtS} >
                                                                { !Sproduct.isDelete&&<>
                                                                    {(Sproduct.isStackable&&this.state.IsShowStackables)?<foreignObject   x={Sproduct.x} y={Sproduct.y-18} width={Sproduct.drawWidth} height={20}>
                                                                        <div 
                                                                        // className='centered'
                                                                        style={{textAlign: "center"}}>
                                                                            <FeatherIcon icon="chevrons-up"  color={"#ED327A"} size={14} />
                                                                        </div>
                                                                        
                                                                    </foreignObject>:<></>}  
                                                                </>}
                                                            </React.Fragment>
                                                        }):<></>
                                                    }
                                                    
                                                    {(actualFieldStructures&&actualFieldStructures.length>0)&&actualFieldStructures.map((Afld,q)=>{
                                                        //  var Afld=actualFieldStructures[aFld]
                                                         return<React.Fragment key={q}>
                                                                    <rect width={this.setLableWidth(Afld.drawWidth)} height={this.state.spacefromtopsvgdraw} x={Afld.x } y={(Afld.y-this.state.spacefromtopsvgdraw) } fill="#5128A0" />
                                                                    <clipPath id={("simfieldN"+(this.props.isFullScreenEdit?"FC":"")+q)}>
                                                                    <rect width={this.setLableWidth(Afld.drawWidth)} height={this.state.spacefromtopsvgdraw} x={Afld.x } y={(Afld.y-this.state.spacefromtopsvgdraw) } fill="#5128A0" />
                                                                    </clipPath>
                                                                   
                                                                    <g clipPath={"url(#simfieldN"+(this.props.isFullScreenEdit?"FC":"")+((this.props.simType)===SimulationTypesFE.IsleAllocation?"AilseAllo":"")+q+")"}>
                                                                    <PopoverWrapper text={<div className='simdunit-name' >
                                                                            <div className='dname'>{Afld.fieldName}</div>
                                                                            {this.props.isRTL=== "rtl"?<div>{Afld.width+" "+Afld.field_uom} :{this.props.t("width")} </div>:
                                                                                <div>{this.props.t("width")}: {Afld.width+" "+Afld.field_uom}</div>
                                                                            }
                                                                            {this.props.isRTL=== "rtl"?<div>{Afld.height+" "+Afld.field_uom} :{this.props.t("height")}</div>
                                                                            :<div>{this.props.t("height")}: {Afld.height+" "+Afld.field_uom}</div>}
                                                                            {this.props.isRTL=== "rtl"?<div>{Afld.depth+" "+Afld.field_uom} :{this.props.t("depth")}</div>
                                                                            :<div>{this.props.t("depth")}: {Afld.depth+" "+Afld.field_uom}</div>}
                                                                        </div>
                                                                        } trigger={["hover","focus"]}>
                                                                            <text fill={"white"} x={(Afld.x+3) } y={(Afld.y-6)} className="small catnametag">{Afld.fieldName}</text>
                                                                        </PopoverWrapper>
                                                                    </g>
                                                                </React.Fragment>
                                                        })
                                                    } 
                                                    {(mapFields&&Object.keys(mapFields).length>0)&&Object.keys(mapFields).map((Fld,f)=>{
                                                        var fld=mapFields[Fld]
                                                        return<React.Fragment key={f}>
                                                            <rect className=""  width={fld.drawWidth} height={fld.drawHeight} x={fld.x } y={fld.y } style={{ strokeWidth: 0, stroke: (this.props.dmode?'#2CC990':'#5128a0'), fill: 'transparent' }} 
                                                            />
                                                            
                                                            {fld.separators&&fld.separators.length>0?fld.separators.map((sprtr,sp)=> <React.Fragment key={sp}> {sprtr.isCategoryEnd?<line x1={sprtr.drawX} y1={fld.y} x2={sprtr.drawX} y2={fld.y+fld.drawHeight} strokeWidth={4} stroke="red" strokeDasharray="6"  />:<line x1={sprtr.drawX} y1={fld.y} x2={sprtr.drawX} y2={fld.y+fld.drawHeight} strokeWidth={4} stroke={(this.props.dmode?'#2CC990':'#5128a0')} />} </React.Fragment>)
                                                            :<></>}
                                                            {fld.shelf.length>0?fld.shelf.map((shlf,g)=><React.Fragment key={g}>
                                                                    <line x1={shlf.previewguid.startX} y1={shlf.y} x2={shlf.previewguid.startX} y2={shlf.y+shlf.drawHeight} strokeWidth={2} stroke="green" strokeDasharray="4" />
                                                                    <line x1={shlf.previewguid.endX} y1={shlf.y} x2={shlf.previewguid.endX} y2={shlf.y+shlf.drawHeight} strokeWidth={2} stroke="green" strokeDasharray="4" />

                                                                    {/* <rect className={"sftrect"} width={shlf.drawWidth} height={shlf.drawHeight} x={shlf.x } y={shlf.y +0} style={{ strokeWidth: 1, stroke: (this.props.dmode?'#2CC990':'#5128a0'), fill: shlf.isDisable?'#897CA3':'transparent' }} 
                                                                    /> */}
                                                                    <rect width={shlf.drawWidth} height={shlf.drawGap} x={shlf.x} y={(shlf.y + 0)+(shlf.drawHeight?shlf.drawHeight:0)} style={{ strokeWidth: 1, stroke: (this.props.dmode?'#2CC990':'#5128a0'), fill: (this.props.dmode?'#2CC990':'#5128a0') }} />
                                                                </React.Fragment>
                                                            ):<></>}
                                                            
                                                        </React.Fragment>
                                                    })}  

                                                    {(!isSalesCycle && !isSCycle) && (mapCategories&&Object.keys(mapCategories).length>0)?Object.keys(mapCategories).map((cat,c)=>{
                                                            var catrect = mapCategories[cat];
                                                            let catrectcolor = (getNameorIdorColorofBox(catrect, "color")?getNameorIdorColorofBox(catrect, "color"):"#F39C12");
                                                            let cattxtcolor = (checkColorIsLight(catrectcolor)?"#5128a0":"white");

                                                            return <React.Fragment key={c}>
                                                            {this.state.xrayActive===1||this.state.xrayActive===4?
                                                            <React.Fragment>
                                                                {catrect.drawfromConShelf?<>
                                                                    {catrect.contain_shelves.map((crect,cr)=>{
                                                                        return <React.Fragment key={cr}>
                                                                        {crect.y > -1 && crect.height?<>
                                                                        <rect id={catrect.field_custom_id+"_"+catrect.id} className="category-box"   width={crect.drawWidth} height={crect.drawHeight} x={crect.x } y={crect.y +0} fill= {getNameorIdorColorofBox(catrect,"color")}  ref={(r) => this[cr] = r} />

                                                                        <clipPath id={("clip-"+(isFullscreenIdShow?"full-":"")+c+""+cr)}>
                                                                            <rect x={crect.x} y={crect.y} width={crect.drawWidth} height={20} />
                                                                        </clipPath>

                                                                        <g clipPath={"url(#clip-"+(isFullscreenIdShow?"full-":"")+(c+""+cr)+")"}>
                                                                            {/* <rect width={isSalesCycle && fieldsWithAnomaly.includes(catrect.field_custom_id)?68:54} height={20} x={crect.x+1 } y={crect.y +0} fill= {catrectcolor} id={c} ref={(r) => this[c] = r} />
                                                                            <text  fill={cattxtcolor} x={crect.x+5 } y={crect.y +13} className="small catnametag">{stringtrim(getNameorIdorColorofBox(catrect,"name"),10)} </text>
                                                                            {isSalesCycle && fieldsWithAnomaly.includes(catrect.field_custom_id) && Icons.Hazard(13,catrect.x+50,catrect.y +4)} */}
                                                                            { this.state.xrayActive===4 && catrect.type===MPBoxType.rule?
                                                                                <g>
                                                                                    <rect x={(crect.x +crect.drawWidth)- 17 } y={crect.y +0} fill={catrectcolor} height="15" width="15"></rect>
                                                                                    <text fill={cattxtcolor} x={(crect.x +crect.drawWidth)-13 } y={crect.y +12} className="small rule-label">R</text>
                                                                                </g>
                                                                            :<></> }
                                                                        </g></>:<></>}
                                                                        </React.Fragment>
                                                                    })}
                                                                </>:<>
                                                                    {/* {!isSalesCycle?<rect id={catrect.field_custom_id+"_"+catrect.id} className="category-box" onClick={()=>this.props.clickCategory(catrect,cat)}  width={catrect.drawWidth} height={catrect.drawHeight} x={catrect.x } y={catrect.y +0} fill= {getNameorIdorColorofBox(catrect,"color")}  ref={(r) => this[c] = r} />
                                                                    :<></>} */}
                                                                    <rect id={catrect.field_custom_id+"_"+catrect.id} className="category-box"   width={catrect.drawWidth} height={catrect.drawHeight} x={catrect.x } y={catrect.y +0} fill= {!isSalesCycle && !isSCycle?getNameorIdorColorofBox(catrect,"color"):"transparent"}  ref={(r) => this[c] = r} /> 
                                                                    <clipPath id={("clip-"+(isFullscreenIdShow?"full-":"")+c+"-nshelf")}>
                                                                        <rect width={catrect.drawWidth} x={catrect.x} y={catrect.y} height={20} />
                                                                    </clipPath>

                                                                    <g clipPath={"url(#clip-"+(isFullscreenIdShow?"full-":"")+c+"-nshelf)"}>
                                                                        {/* <rect  width={isSalesCycle && fieldsWithAnomaly.includes(catrect.field_custom_id)?68:54} height={20} x={catrect.x } y={catrect.y +0} fill= {catrectcolor} id={c} ref={(r) => this[c] = r} />
                                                                        <text  fill={cattxtcolor} x={catrect.x+5 } y={catrect.y +13} className="small catnametag">{stringtrim(getNameorIdorColorofBox(catrect,"name"),10)} </text>
                                                                        {isSalesCycle && fieldsWithAnomaly.includes(catrect.field_custom_id) && Icons.Hazard(13,catrect.x+50,catrect.y +4)} */}
                                                                        { this.state.xrayActive===4 && catrect.type===MPBoxType.rule?
                                                                        <g>
                                                                        <rect x={(catrect.x +catrect.drawWidth)-17 } y={catrect.y +0} fill={catrectcolor} height="15" width="15"></rect>
                                                                        <text  fill={cattxtcolor} x={(catrect.x +catrect.drawWidth)-13 } y={catrect.y +12} className="small rule-label">R</text>
                                                                        </g>
                                                                        :<></> }
                                                                    </g>
                                                                </>}
                                                                
                                                            </React.Fragment>
                                                         :<></>}
                                                    </React.Fragment>
                                                    }):<></>}

                                                    {(mapproductList&&Object.keys(mapproductList).length>0)?Object.keys(mapproductList).map((Prod,prodt)=>{
                                                        var product = mapproductList[Prod];
                                                        var cintrlprodloc = this.state.currentInternalDraggableProd;
                                                        var cimgcolor = (cintrlprodloc && cintrlprodloc.prod.id===product.id?true:false);
                                                        var productSheflItem = (product.field_custom_id ?mapFields[product.field_custom_id].shelf.find(x => x.rank === product.shelfrank):null)
                                                        
                                                        let isInGuideProds = (this.state.isFirstTimeDrawguid && this.state.guideProdList?this.state.guideProdList.findIndex(g => g.id === product.id):-1);
                                                        
                                                        let isHightlightNewProd = (isShowPreviewNewProds?product.isPreviewNewProd:false);

                                                        return <React.Fragment key={prodt} >
                                                                { !product.isDelete&&<>
                                                                    {/* {(product.isStackable&&this.state.IsShowStackables)?<foreignObject   x={product.x} y={product.y-18} width={product.drawWidth} height={product.drawHeight}>
                                                                        <div 
                                                                        // className='centered'
                                                                        style={{textAlign: "center"}}>
                                                                            <FeatherIcon icon="chevrons-up"  color={"#ED327A"} size={14} />
                                                                        </div>
                                                                        
                                                                    </foreignObject>:<></>} */}

                                                                    {/* <image onMouseDown={(e)=>this.handleMouseClick(e,product,prodt)} pointerEvents="all" preserveAspectRatio="none" x={product.x+((product.drawWidth/2)-0)} y={(product.y-6)} width={15} height={20} href={simStackable}  style={{outline: "solid 1px rgb(204, 204, 204)"}} /> */}
                                                                    {(this.props.isSalesCycle||this.props.isSCycle) && 
                                                                    this.props.productsWithAnomaly.map(data => data.productId).includes(product.productId)
                                                                    ? <g><TooltipWrapper placement="bottom" text={this.props.productsWithAnomaly.find(prd => prd.productId === product.productId && prd.salesAvailable)? isFinite(this.props.productsWithAnomaly.find(prd => prd.productId === product.productId && prd.salesAvailable).salesCycle) ? this.props.productsWithAnomaly.find(prd => prd.productId === product.productId && prd.salesAvailable).salesCycle.toFixed(2).replace(/\.?0+$/, '') : this.props.t("NO_SALES_DATA") : this.props.t("NO_SALES_DATA")} bcolor={this.props.productsWithAnomaly.find(prd => prd.productId === product.productId && prd.salesAvailable) ? isFinite(this.props.productsWithAnomaly.find(prd => prd.productId === product.productId && prd.salesAvailable).salesCycle) ? this.props.productsWithAnomaly.find(prd => prd.productId === product.productId && prd.salesAvailable).anomaly === "high" ? "red" : this.props.productsWithAnomaly.find(prd => prd.productId === product.productId && prd.salesAvailable).anomaly === "low" ? "blue" : "white" : undefined : undefined}>
                                                                            <g>
                                                                            <rect className="other-box" width={product.drawWidth} height={this.props.productsWithAnomaly.find(prd => prd.productId === product.productId && prd.salesAvailable) ?  this.props.productsWithAnomaly.find(prd => prd.productId === product.productId && prd.salesAvailable).anomaly === "high" || this.props.productsWithAnomaly.find(prd => prd.productId === product.productId && prd.salesAvailable).anomaly === "low" ? productSheflItem?(productSheflItem.drawHeight+productSheflItem.drawGap):0 : product.drawHeight  : product.drawHeight} x={product.x} 
                                                                            y={(this.props.productsWithAnomaly.find(prd => prd.productId === product.productId && prd.salesAvailable) ? this.props.productsWithAnomaly.find(prd => prd.productId === product.productId && prd.salesAvailable).anomaly === "high" || this.props.productsWithAnomaly.find(prd => prd.productId === product.productId && prd.salesAvailable).anomaly === "low" ? (productSheflItem?productSheflItem.y:0) : product.y   : product.y )} 
                                                                            fill= "transparent" 
                                                                            />  
                                                                            <image onMouseDown={(e)=>this.handleMouseClick(e,product,prodt)} pointerEvents="all" preserveAspectRatio="none" x={product.x} y={product.y} width={product.drawWidth} height={product.drawHeight} href={product.imageUrl}  style={{outline: (product.isStackable&&this.state.IsShowStackables)? this.state.selectedScProductId===product.productId ? this.props.dmode? "solid 2px #2CC990" : "solid 2px #5128a0" :"solid 1px #ED327A": this.state.selectedScProductId===product.productId ?  this.props.dmode? "solid 2px #2CC990" : "solid 2px #5128a0" : "solid 1px rgb(204, 204, 204)",opacity:(isShowNewProds || isShowPreviewNewProds?((product.isNewReplaced || isHightlightNewProd)?1:0.2):1)}} />
                                                                            </g>
                                                                        </TooltipWrapper>
                                                                        <rect className="other-box" width={product.drawWidth} height={this.props.productsWithAnomaly.find(prd => prd.productId === product.productId && prd.salesAvailable) ?  this.props.productsWithAnomaly.find(prd => prd.productId === product.productId && prd.salesAvailable).anomaly === "high" || this.props.productsWithAnomaly.find(prd => prd.productId === product.productId && prd.salesAvailable).anomaly === "low" ? productSheflItem?(productSheflItem.drawHeight+productSheflItem.drawGap):0 : product.drawHeight  : product.drawHeight} x={product.x} 
                                                                            y={(this.props.productsWithAnomaly.find(prd => prd.productId === product.productId && prd.salesAvailable) ? this.props.productsWithAnomaly.find(prd => prd.productId === product.productId && prd.salesAvailable).anomaly === "high" || this.props.productsWithAnomaly.find(prd => prd.productId === product.productId && prd.salesAvailable).anomaly === "low" ? (productSheflItem?productSheflItem.y:0) : product.y   : product.y )} 
                                                                            fill= {this.props.productsWithAnomaly.find(prd => prd.productId === product.productId && prd.salesAvailable) ?  this.props.productsWithAnomaly.find(prd => prd.productId === product.productId && prd.salesAvailable).anomaly === "high" ? "#E90041" : this.props.productsWithAnomaly.find(prd => prd.productId === product.productId && prd.salesAvailable).anomaly === "low" ? "#2F80ED" : "transparent" : "transparent"} 
                                                                            fillOpacity="0.3" opacity="0.7" pointerEvents="none"
                                                                            // onClick={()=>this.props.clickCategory(catrect,mapCategories)}
                                                                        />  
                                                                    </g>
                                                                    :
                                                                    <>
                                                                    <image onMouseDown={(e)=>this.handleMouseClick(e,product,prodt)} pointerEvents="all" preserveAspectRatio="none" x={product.x} y={product.y} width={product.drawWidth} height={product.drawHeight} href={product.imageUrl}  style={{outline: (product.isStackable&&this.state.IsShowStackables)?this.state.selectedScProductId===product.productId ?  this.props.dmode? "solid 2px #2CC990" : "solid 2px #5128a0" :"solid 1px #ED327A":this.state.selectedScProductId===product.productId ?  this.props.dmode? "solid 2px #2CC990" : "solid 2px #5128a0" :"solid 1px rgb(204, 204, 204)",opacity:(isShowNewProds || isShowPreviewNewProds?((product.isNewReplaced || isHightlightNewProd)?1:0.2):1)}} />
                                                                    </>}
                                                                    
                                                                    {(cimgcolor && !this.state.markablestackable) && <rect onMouseDown={(e)=>this.handleMouseClick(e,product,prodt)} x={product.x} y={product.y} width={product.drawWidth} height={product.drawHeight} style={{ fill: "#dc3545", fillOpacity:"0.4" }}  />}
                                                                    {/* {product.isStackable&& <rect onMouseDown={(e)=>this.handleMouseClick(e,product,prodt)} x={product.x} y={product.y} width={product.drawWidth} height={product.drawHeight} style={{ fill: "#dc3545", fillOpacity:"0.6" }}  />} */}
                                                                    {!this.props.isSalesCycle && ! this.props.isSCycle && this.state.xrayActive===3?<>
                                                                        <TooltipWrapperBrandnsubcat showdash={this.state.isshowdash} text={getNameorIdorColorofBox(product.brand,"name")}>
                                                                            <rect className="other-box"  width={product.drawWidth} height={productSheflItem?(productSheflItem.drawHeight+productSheflItem.drawGap):0} x={product.x} y={(productSheflItem?productSheflItem.y:0)} fill= {(product.brand?getNameorIdorColorofBox(product.brand,"color"):"red")}  />
                                                                        </TooltipWrapperBrandnsubcat>
                                                                    </>:<></>}
                                                                    {!this.props.isSalesCycle && ! this.props.isSCycle && this.state.xrayActive===2?<>
                                                                        <TooltipWrapperBrandnsubcat showdash={this.state.isshowdash} text={getNameorIdorColorofBox(product.subcategory,"name")}>
                                                                            <rect className="other-box" width={product.drawWidth} height={productSheflItem?(productSheflItem.drawHeight+productSheflItem.drawGap):0} x={product.x} y={(productSheflItem?productSheflItem.y:0)} fill= {(product.subcategory?getNameorIdorColorofBox(product.subcategory,"color"):"red")}  />
                                                                        </TooltipWrapperBrandnsubcat>
                                                                    </>:<></>}

                                                                    {isInGuideProds > -1?<>
                                                                        <rect className='redoverlap-box' width={product.drawWidth} height={product.drawHeight} x={product.x} y={product.y} fill="red" fillOpacity={0.8}></rect>
                                                                    </>:<></>}
                                                                </>}
                                                            </React.Fragment>
                                                        }):<></>
                                                    }

                                                    {(mapFields&&Object.keys(mapFields).length>0)&&Object.keys(mapFields).map((Fld,f)=>{
                                                        var fld = mapFields[Fld]
                                                        return<React.Fragment key={f}><g className={this.state.isContentDragging?'':'d-none'}>
                                                            {fld.shelf.length>0?fld.shelf.map((shlf,g)=><React.Fragment key={g}>
                                                                    <line x1={shlf.previewguid.startX} y1={shlf.y} x2={shlf.previewguid.startX} y2={shlf.y+shlf.drawHeight} strokeWidth={2} stroke="green" strokeDasharray="4" />
                                                                    <line x1={shlf.previewguid.endX} y1={shlf.y} x2={shlf.previewguid.endX} y2={shlf.y+shlf.drawHeight} strokeWidth={2} stroke="green" strokeDasharray="4" />

                                                                    <rect className={"sftrect "+(!shlf.isDisable?"sftrect-notdis":"")} ref={(r) => this[(f+""+g)] = r}
                                                                        onDragOver={(e) => this.dragEnd(e, shlf, this[(f+""+g)],false,null,true, g, fld)} 
                                                                        // onMouseOut={(e) => this.dragClear(e, shlf, this[(f+""+g)])}
                                                                        onDragLeave={(e)=>this.dragClear(e, shlf, this[(f+""+g)])}
                                                                        onDrop={(e) => this.droppedNew(e, shlf, this[(f+""+g)], g, false, fld)} width={shlf.drawWidth} height={shlf.drawHeight} x={shlf.x } y={shlf.y +0} style={{ strokeWidth: 1, stroke: (this.props.dmode?'#2CC990':'#5128a0'), fill: shlf.isDisable?'#897CA3':'transparent' }} 
                                                                    />
                                                                    <rect width={shlf.drawWidth} height={shlf.drawGap} x={shlf.x} y={(shlf.y + 0)+(shlf.drawHeight?shlf.drawHeight:0)} style={{ strokeWidth: 1, stroke: (this.props.dmode?'#2CC990':'#5128a0'), fill: (this.props.dmode?'#2CC990':'#5128a0') }} />
                                                                </React.Fragment>
                                                            ):<></>}
                                                        </g></React.Fragment>
                                                    })}
                                                    
                                                    {(mapCategories&&Object.keys(mapCategories).length>0)?Object.keys(mapCategories).map((cat,c)=>{
                                                        var catrect = mapCategories[cat];
                                                        let catrectcolor = (getNameorIdorColorofBox(catrect, "color")?getNameorIdorColorofBox(catrect, "color"):"#F39C12");
                                                        let cattxtcolor = (checkColorIsLight(catrectcolor)?"#5128a0":"white");
                                                    
                                                        return <React.Fragment key={c}>
                                                            {this.state.xrayActive===4?
                                                            <React.Fragment>
                                                                {catrect.drawfromConShelf?<>
                                                                    {catrect.contain_shelves.map((crect,cr)=>{
                                                                        return <React.Fragment key={cr}>
                                                                        {crect.y > -1 && crect.height?<>

                                                                        <g clipPath={"url(#clip-"+(isFullscreenIdShow?"full-":"")+(c+""+cr)+")"} >
                                                                            <rect width={(isSalesCycle || isSCycle) && fieldsWithAnomaly.includes(catrect.field_custom_id)?68:54} height={20} x={crect.x+1 } y={crect.y +0} fill= {catrectcolor} id={c} ref={(r) => this[c] = r} />
                                                                            <g><TooltipWrapper placement="bottom" text={getNameorIdorColorofBox(catrect,"name")}>
                                                                            <text  fill={cattxtcolor} x={crect.x+5 } y={crect.y +13} className="small catnametag">{stringtrim(getNameorIdorColorofBox(catrect,"name"),10)}</text>
                                                                            </TooltipWrapper></g>
                                                                            {(isSalesCycle || isSCycle) && fieldsWithAnomaly.includes(catrect.field_custom_id) && Icons.Hazard(13,catrect.x+50,catrect.y +4)}
                                                                        </g></>:<></>}
                                                                        </React.Fragment>
                                                                    })}
                                                                </>:<>
                                                                    <g clipPath={"url(#clip-"+(isFullscreenIdShow?"full-":"")+c+"-nshelf)"} >
                                                                        <rect  width={(isSalesCycle || isSCycle) && fieldsWithAnomaly.includes(catrect.field_custom_id)?68:54} height={20} x={catrect.x } y={catrect.y +0} fill= {catrectcolor} id={c} ref={(r) => this[c] = r} />
                                                                        <g>
                                                                            <TooltipWrapper placement="bottom" text={getNameorIdorColorofBox(catrect,"name")}>
                                                                                <text  fill={cattxtcolor} x={catrect.x+5 } y={catrect.y +13} className="small catnametag">{stringtrim(getNameorIdorColorofBox(catrect,"name"),10)}</text>
                                                                            </TooltipWrapper>
                                                                        </g>
                                                                        {(isSalesCycle || isSCycle) && fieldsWithAnomaly.includes(catrect.field_custom_id) && Icons.Hazard(13,catrect.x+50,catrect.y +4)}
                                                                    </g>
                                                                </>}
                                                                
                                                            </React.Fragment>
                                                         :<></>}
                                                    </React.Fragment>
                                                    }):<></>}
                                                    
                                                    {this.state.isshowdash?<>
                                                                <rect x={this.state.dashrect.x} y={this.state.dashrect.y} width={this.state.dashrect.width} height={this.state.dashrect.height} fill="none" stroke="green" strokeDasharray={[2,2]} strokeWidth={2}></rect>
                                                                {/* {this.state.dashrect.percentage > 1?<><rect fill="red" x={(this.state.dashrect.x+this.state.dashrect.width) - 50} y={this.state.dashrect.y} width={50} height={20}></rect>
                                                                    <text fill="white" x={(this.state.dashrect.x+this.state.dashrect.width) - 40} y={(this.state.dashrect.y + 13)} fontSize="12" fontWeight={"700"}>{this.state.dashrect.percentage}%</text></>:<></>} */}
                                                            </>:<></>
                                                    }
                                                    {(this.state.activeTool === "drawBlock" && this.state.currentInternalDraggableProd&&!this.state.markablestackable)?<>
                                                        <BlockRectangle checkSaftyMargin={this.state.checkSaftyMargin} 
                                                        wrapperId={this.state.wrapperId}
                                                        zoomXRatio={this.state.zoomXRatio}
                                                        mapFields={this.state.mapFields} mapCatRects={this.state.mapCatRects} mapproductList={this.state.mapproductList}
                                                        curitem={this.state.currentInternalDraggableProd} saleSaftyMargin={this.state.saleSaftyMargin} locobj={this.state.selectedlocobj} 
                                                        isblockmove={this.state.isblockmove} displayratio={this.state.displayRatio} displayuom={this.state.displayUOM} 
                                                        isFirstTimeDrawguid={this.state.isFirstTimeDrawguid}
                                                        currentSelectedBlock={this.state.currentSelectedBlock}
                                                        ghostWrapperObj={this.state.ghostWrapperObj} 
                                                        dragStart={this.dragStart} updateSaveObjChild={this.updateSaveObjChild} 
                                                        updateProductList={this.updateProductList} updateCutList={this.updateCutList} 
                                                        setPreviewGuid={this.setPreviewGuid}
                                                        handleBlockContextMenu={this.handleBlockContextMenu}
                                                        fieldHistoryAdd={this.fieldHistoryAdd}
                                                        TouchedCatListUpdate={this.TouchedCatListUpdate} 
                                                        updateGhostObjDetails={this.updateGhostObjDetails}
                                                        />
                                                    </>:<></>}

                                                    {this.state.isAllowPan && this.state.activeTool === "pan"?
                                                        <rect x={0} y={0} width={(this.state.zoomXRatio > 0 && (editwrapper.clientWidth > svgdrawDiemention.drawWidth)?editwrapper.clientWidth:svgdrawDiemention.drawWidth)} height={this.state.catDivHeight} fill="rgba(255, 255, 255, 0.2)" stroke="none"></rect>
                                                    :<></>}
                                                </svg>
                                            </Col>
                                            }
                                                            
                                        </React.Fragment>
                                    </Col>
                                </Col>
                            </Col>
                        </Col>
                        {!isDisableEDitingwithfullscreen?<Col md={4}>
                            <Col xs={12} style={{padding:"10px"}} className={"middle-section-cat"+(isShowFromPreview?" sim-previewview":"")+(reduceViewHeight?" reduce-viewheight":"")}> {/* ,height:this.state.catDivHeight+(this.props.simType !== "AUI"?130: (this.props.isSetFullScreenEditModal?130:70)) */}
                                <Tab.Container activeKey={this.state.productTab} onSelect={this.handleclipbordopen}>
                                    <Row>
                                        <Col className='editprod-view'>
                                            <Nav variant="pills" className="flex-row">
                                                <Nav.Item>
                                                    <Nav.Link eventKey="products">{this.props.t("products")}</Nav.Link>
                                                </Nav.Item>
                                                <Nav.Item>
                                                    <Nav.Link eventKey="clipboard">
                                                        {this.props.t("CLIPBOARD")}
                                                        {/* {this.state.cutArray.length>0?<span className='prevwCount'>{this.state.cutArray.length}</span>:<></>} */}
                                                        {filteredcutNewArray.length>0?<span className='prevwCount'>{filteredcutNewArray.length}</span>:<></>}
                                                        </Nav.Link>
                                                </Nav.Item>
                                                <Nav.Item>
                                                    <Nav.Link eventKey="notsimprods">
                                                        {this.props.t("NOT_SIM_PRODUCTS")}
                                                        {(this.state.nonfilteredNonEProducts.filter(p=> !p.isAdded && p.barcode && p.productName).length > 0)?<span className='prevwCount' 
                                                        // style={{left: "98px"}}
                                                        >{this.state.nonfilteredNonEProducts.filter(p=> !p.isAdded && p.barcode && p.productName).length}</span>:<></>}
                                                        </Nav.Link>
                                                </Nav.Item>
                                                <Nav.Item>
                                                    <Nav.Link eventKey="rulewarnings" className='paddingtab-link'>
                                                        {this.state.isRuleWarn.isshow?<span className='warn-icon'><FeatherIcon icon="alert-triangle"
                                                        color={(this.state.isRuleWarn.mainWarnStatus==="danger")?"red":(this.state.isRuleWarn.mainWarnStatus==="warning")?"orange":"green"} 
                                                        size={20} /></span>:<></>}
                                                        {this.props.t("rules")}
                                                    </Nav.Link>
                                                </Nav.Item>
                                                {isAuiViewsAllow || isShowFromPreview?<Nav.Item>
                                                    <Nav.Link eventKey="replaceProds">
                                                    {this.state.replaceProds&&this.state.replaceProds.length>0?<span className='prevwCount'>{this.state.replaceProds.length}</span>:<></>}
                                                    
                                                        {this.props.t("replaced")}
                                                    </Nav.Link>
                                                </Nav.Item>:<></>}
                                                 <Nav.Item>
                                                    <Nav.Link eventKey="changedProducts">
                                                        {this.props.t("Data_updated")}
                                                        {(productEditWarningsList.filter(p=> p.isDelete!==true).length > 0)?<span className='prevwCount' 
                                                        // style={{left: "98px"}}
                                                        >{productEditWarningsList.filter(p=> p.isDelete!==true).length}</span>:<></>}
                                                        </Nav.Link>
                                                </Nav.Item>
                                                {(this.state.isSCycle || this.props.isSalesCycle) ?<Nav.Item>
                                                    <Nav.Link eventKey="saleCycle">
                                                        {this.props.t('SALE_CYCLE')}
                                                    </Nav.Link>
                                                </Nav.Item>:<></>}
                                            </Nav>
                                        </Col>
                                        <Col xs={12} className="Hproductsdiv" style={{height:(this.state.catDivHeight-30)}}>
                                            <Tab.Content>
                                                <Tab.Pane eventKey="products">
                                                {isAddProucts?
                                                    <Col className='searchprodBox'>
                                                        <span className="custom-btn" onClick={()=>this.toggleprodAddNProdpanel()} style={this.props.isRTL=== "rtl"?{float:"left"}:{float:"right"}}> <XCircleFillIcon /></span>
                                                        <h4>{this.props.t('productslist')}</h4>
                                                        <InputGroup size="sm" className="mb-3 input-search">
                                                            <Form.Control id="filterprodtxt" aria-label="Small" placeholder={this.props.t('srchproduct')} aria-describedby="inputGroup-sizing-sm" value={this.state.productSearchText} onChange={e => this.handleFilterProducts(e)} onKeyUp={e => this.handleFilterProducts(e)}/>
                                                            <InputGroup.Text id="inputGroup-sizing-sm"><SearchIcon size={18}/></InputGroup.Text>
                                                        </InputGroup>

                                                        <ButtonGroup className={"pviewchange-list "+(this.props.isRTL=== "rtl"?"float-left":"float-right")}>
                                                            <Button variant="secondary" onClick={() => this.toggleProdListView("LIST")} className={(this.state.isListViewActive==="LIST"?"active":"")}><ListUnorderedIcon size={14} /></Button>
                                                            <Button variant="secondary" onClick={() => this.toggleProdListView("GRID")} className={(this.state.isListViewActive==="GRID"?"active":"")}><DiffAddedIcon size={14}/></Button>
                                                        </ButtonGroup>

                                                        {(this.state.isListViewActive!==null&&this.state.recentProdList&&this.state.filteredProdList.length===0?
                                                        <Col className="col-xs-12 div-con">
                                                            <h5> {this.props.t('recentlist')}</h5>
                                                            <Col xs={12} className="div-con subprod-list" style={{maxHeight:(this.state.catDivHeight-120)}}>
                                                                <Row style={this.props.isRTL === "rtl"?{marginRight:"0px",width:"100%"}:{marginLeft:"0px",width:"100%"}}>
                                                                        {(this.state.recentProdList? this.state.recentProdList.map((prod, i) =>
                                                                        <Col key={i} className={"sub-item"+(this.state.isListViewActive==="LIST"?"":" rectview")} xs={this.state.isListViewActive==="LIST"?12:4}><Col style={{ margin: 5}}>
                                                                    
                                                                        <div onClick={() => this.handlePreviewModal(prod,true)}>
                                                                            <ProdRectView t={this.props.t} isRTL={this.props.isRTL} viewtype={this.state.isListViewActive} prod={prod}>
                                                                                <div className="thumb-div" draggable id={prod.id} ref={(r) => this[prod.id] = r} onMouseDown={(e) => {this.drawRectCanvas(prod)}} onDragStart={(e) => this.dragStart(e, prod)} onDrag={e => this.dragProdView(e, prod)} onDragEnd={() => this.prodDragEnd()}>
                                                                                    {prod.imageUrl?<img key={i} src={prod.imageUrl} className={prod.width >= prod.height?"img-resize-ver":"img-resize-hor"} alt=""/>:
                                                                                    <img key={i} src={NoIMage} className={prod.width >= prod.height?"img-resize-ver":"img-resize-hor"} alt=""/>}
                                                                                </div>
                                                                            </ProdRectView>
                                                                        </div>
                                                                            {(this.state.isListViewActive==="LIST"?
                                                                        <><CopyToClipboard text={prod.barcode} onCopy={() => this.copyToClipboard()}><small style={{fontSize:"0.75rem"}}>{prod.barcode}</small></CopyToClipboard><br/>{prod.productName}<br/>
                                                                        <small>{this.props.t("brand")+": "}{prod.brandName&&prod.brandName!==""&&prod.brandName!=="-"?(prod.brandName+" "):(this.props.t("notavailable")+" ")}</small><br/>
                                                                        <small style={{fontSize:"0.75rem"}}><i>
                                                                            {this.props.t('WIDTH')}{(prod.width > 0?roundOffDecimal(prod.width,numOfDecimalsLimit):prod.width)+""+convertUomtoSym(prod.uom)}, 
                                                                            {this.props.t('HEIGHT')} {(prod.height > 0?roundOffDecimal(prod.height,numOfDecimalsLimit):prod.height)+""+convertUomtoSym(prod.uom)}</i></small></>:"")}
                                                                    </Col></Col>):(<></>))}

                                                                </Row>
                                                            </Col>
                                                        </Col>:<></>)}

                                                        {(this.state.isListViewActive!==null&&this.state.filteredProdList&&this.state.filteredProdList.length>0?
                                                        <Col className="col-xs-12 div-con">
                                                            <h5>{this.props.t('productslist')}</h5>
                                                            <Col xs={12} className="div-con subprod-list" style={{maxHeight:(this.state.catDivHeight-120)}}>
                                                                <Row style={this.props.isRTL === "rtl"?{marginRight:"0px",width:"100%"}:{marginLeft:"0px",width:"100%"}}>
                                                                    {(this.state.filteredProdList ? this.state.filteredProdList.map((prod, i) =>
                                                                    <Col key={i} className={"sub-item"+(this.state.isListViewActive==="LIST"?"":" rectview")} xs={this.state.isListViewActive==="LIST"?12:4}><Col style={{ margin: 5}}>
                                                                    
                                                                        <div onClick={() => this.handlePreviewModal(prod,true)}>
                                                                            <ProdRectView t={this.props.t} isRTL={this.props.isRTL} viewtype={this.state.isListViewActive} prod={prod}>
                                                                                <div className="thumb-div" draggable id={prod.id} ref={(r) => this[prod.id] = r} onMouseDown={(e) => {this.drawRectCanvas(prod)}} onDragStart={(e) => this.dragStart(e, prod)} onDrag={e => this.dragProdView(e, prod)} onDragEnd={() => this.prodDragEnd()}>
                                                                                    {prod.imageUrl?<img key={i} src={prod.imageUrl} className={prod.width >= prod.height?"img-resize-ver":"img-resize-hor"} alt=""/>:
                                                                                    <img key={i} src={NoIMage} className={prod.width >= prod.height?"img-resize-ver":"img-resize-hor"} alt=""/>}
                                                                                </div>
                                                                            </ProdRectView>
                                                                        </div>
                                                                        {(this.state.isListViewActive==="LIST"?
                                                                        <><CopyToClipboard text={prod.barcode} onCopy={() => this.copyToClipboard()}><small style={{fontSize:"0.75rem"}}>{prod.barcode}</small></CopyToClipboard><br/>
                                                                        <div style={{cursor:"pointer"}} onClick={()=>this.handleopenDetailmodal(prod)}>{prod.productName}<br/>
                                                                        <small >{this.props.t("brand")+": "}{prod.brandName&&prod.brandName!==""&&prod.brandName!=="-"?(prod.brandName+" "):(this.props.t("notavailable")+" ")}</small><br/>
                                                                        <small style={{fontSize:"0.75rem"}}><i>{this.props.t('width')}: {(prod.width?prod.width:" - ")+""+convertUomtoSym(prod.uom)}, {this.props.t('height')}: {(prod.height?prod.height:" - ")+""+convertUomtoSym(prod.uom)}</i></small>

                                                                        </div>
                                                                        
                                                                        </>:
                                                                        <></>)}
                                                                    </Col></Col>):(<></>))}
                                                                    {this.state.srchprodsloading?<Col xs={12} className="text-center" style={{marginBottom: "5px"}}><img src={loadinggif} className="img-fluid" style={{height:"20px"}} alt="" /></Col>:<></>}
                                                                </Row>
                                                                {this.state.filteredProdList.length < this.state.ptotalresults?
                                                                <Col xs={12} className="ploadmore-link text-center" onClick={() => {this.loadMoreProds()}}>{this.props.t('btnnames.loadmore')}</Col>:<></>}
                                                            </Col>
                                                        </Col>:<></>)}
                                                        {this.state.srchprodsloading && this.state.filteredProdList.length === 0?
                                                            <Col className='loadingprod-wrapper'><img src={loadinggif} className="img-fluid loadingProdPlanel" style={{height:"30px"}} alt="" /></Col>
                                                        :<></>}
                                                    </Col>
                                                    :
                                                    <Col className="prod_bar">
                                                        {this.props.simType !== SimulationTypesFE.IsleAllocation?<ExportCSV t={this.props.t} isRTL={this.props.isRTL} 
                                                            isSimView={true}
                                                            additionalIDs={(this.props.isSetFullScreenEditModal || this.props.isShowFromPreview?"-fullview":"")}
                                                            isShowFromPreview={this.props.isShowFromPreview}
                                                            selectedSimPreviewObj={this.props.selectedSimPreviewObj}
                                                            excelUploadPagination={this.state.excelUploadPagination}
                                                            paginationMaxCount={this.state.paginationMaxCount}
                                                            saveObj={this.props.defSaveObj}
                                                            bkpSaveObj={this.props.defSaveObj}
                                                            originatedMpId={this.props.originatedMpId}
                                                            handleAddProduct={this.handleAddProduct}
                                                            sendExcelData={this.sendExcelData}
                                                            setExcelUploadPagination={this.setExcelUploadPagination}
                                                            toggleLoadingModal={this.props.toggleLoadingModal}
                                                            />:<></>}
                                                        
                                                        <Col className='newprods'>
                                                            <NewProductsTab t={this.props.t} isRTL={this.props.t} 
                                                                addedProductsCounter={addedProductsCounter}
                                                                additionalIDs={(this.props.isSetFullScreenEditModal || this.props.isShowFromPreview?"-fullview":"")}
                                                                isShowFromPreview={this.props.isShowFromPreview}
                                                                selectedSimPreviewObj={this.props.selectedSimPreviewObj}
                                                                importedScrollHeight={this._importedScrollHeight}
                                                                importedDataObj={importedDataObj}
                                                                excelStartIndex={importedDataObj?importedDataObj.excelStartIndex:-1}
                                                                totalExcelProdCount={importedDataObj?importedDataObj.totalExcelProdCount:0}
                                                                excelUploadList={importedDataObj?importedDataObj.excelUploadList:null}
                                                                excelSearchText={importedDataObj?importedDataObj.excelSearchText:""}
                                                                displayUOM={this.state.displayUOM}
                                                                displayRatio={this.state.displayRatio}
                                                                isImportDataLoading={importedDataObj?importedDataObj.isImportDataLoading:false}
                                                                newProdTab={this.state.newProdTab}
                                                                simType={this.props.simType}
                                                                originatedMpId={this.props.originatedMpId}
                                                                saveObj={this.props.defSaveObj}
                                                                zoomDrawX={this.state.zoomDrawX}
                                                                drawRectCanvas={this.drawRectCanvas}
                                                                dragStart={this.dragStart}
                                                                ghostFromParent={this.ghostFromParent}
                                                                handlePreviewModal={this.handlePreviewModal}
                                                                loadImportProdList={this.loadImportProdList}
                                                                prodDragEnd={this.prodDragEnd}
                                                                setImportedProds={this.setImportedProds}
                                                                sendExcelData={this.sendExcelData}
                                                                toggleNewProdTab={this.toggleNewProdTab}
                                                                toggleLoadingModal={this.props.toggleLoadingModal}
                                                                updateImportedList={this.updateImportedList}
                                                                updateImportScrollList={this.updateImportScrollList}
                                                                updateExcelSearchText={this.updateExcelSearchText}

                                                                />
                                                        </Col>
                                                        {/* <Col className='removed_prods'>
                                                            <h6>{this.props.t("removeproducts")}</h6>
                                                            <Col md={12} className="prods">
                                                                <Row>
                                                                    {removedProductsCounter.length>0?removedProductsCounter.map((prod,i)=>
                                                                            <Col  className='prodbox' key={i} onClick={()=>this.handlePreviewModal(prod,true)}>
                                                                                <img draggable={false} src={prod.imageUrl } alt=""/>
                                                                                <span>{prod.qty}</span>
                                                                            </Col>
                                                                    ):<></>}
                                                                    
                                                                </Row>
                                                            </Col>
                                                        </Col> */}
                                                    </Col>}
                                                </Tab.Pane>
                                                <Tab.Pane eventKey="clipboard">
                                                    {this.state.isClipboardreload?<EditSimulateClipBoard 
                                                        catDivHeight={this.state.catDivHeight}
                                                        cutNewArray={filteredcutNewArray} 
                                                        cutArray={this.state.cutArray} 
                                                        clipDragType={this.state.clipDragType}
                                                        cutDragObj={this._cutDragObj}
                                                        displayRatio={this.state.displayRatio}
                                                        zoomXRatio={this.state.zoomXRatio}
                                                        dragStart={this.dragStart}
                                                        dropCutblock={this.dropCutblock}
                                                        drawRectCanvas={this.drawRectCanvas} 
                                                        ghostFromParent={this.ghostFromParent} 
                                                        setPreviewGuid={this.setPreviewGuid}
                                                        toggleClipDragType={this.toggleClipDragType}
                                                        updateSingleCutProduct={this.updateSingleCutProduct}
                                                        xyChangeCoords={this.xyChangeCoords}
                                                        />:<></>}
                                                </Tab.Pane>
                                                <Tab.Pane eventKey="notsimprods">
                                                    <NoSimProductsComp
                                                        handleopenDetailmodal={this.handleopenDetailmodal}
                                                        selectedNonSimFilterCat={this.state.selectedNonSimFilterCat}
                                                        selectedNonSimFiltersubCat={this.state.selectedNonSimFiltersubCat}
                                                        selectedNonSimFilterBrand={this.state.selectedNonSimFilterBrand}
                                                        selectedNonSimFilterSupp={this.state.selectedNonSimFilterSupp}
                                                        nonsimFilter_brandsList={this.state.nonsimFilter_brandsList}
                                                        nonsimFilter_categoryList={this.state.nonsimFilter_categoryList}
                                                        nonsimFilter_subcategoryList={this.state.nonsimFilter_subcategoryList}
                                                        nonsimFilter_supplierList={this.state.nonsimFilter_supplierList}
                                                        catDivHeight={this.state.catDivHeight}
                                                        noSim_filter={this.state.noSim_filter}
                                                        togglenonSimFilter={this.togglenonSimFilter}
                                                        drawRectCanvas={this.drawRectCanvas}
                                                        dragStart={this.dragStart}
                                                        dragProdView={this.dragProdView}
                                                        prodDragEnd={this.prodDragEnd}
                                                        handlePreviewModal={this.handlePreviewModal}
                                                        handleFilterNoEProducts={this.handleFilterNoEProducts}
                                                        copyToClipboard={this.copyToClipboard}
                                                        isRTL={this.props.isRTL} t={this.props.t} 
                                                        nonfilteredNonEProducts={this.state.nonfilteredNonEProducts}
                                                        />
                                                </Tab.Pane>
                                                <Tab.Pane eventKey="rulewarnings">
                                                    <RuleWarningsComp 
                                                    isRuleWarn={this.state.isRuleWarn}
                                                    mapRulesList={this.state.mapRulesList} 
                                                    isRTL={this.props.isRTL} trans={this.props.t} />
                                                </Tab.Pane>
                                                <Tab.Pane eventKey="changedProducts">
                                                    <DimensionChangedProdComp
                                                    handlePreviewModal={this.handlePreviewModal}
                                                    copyToClipboard={this.copyToClipboard} 
                                                    handleopenDetailmodal={this.handleopenDetailmodal} 
                                                    productEditWarningsList={productEditWarningsList}
                                                    isRuleWarn={this.state.isRuleWarn}
                                                    mapRulesList={this.state.mapRulesList} 
                                                    isRTL={this.props.isRTL} t={this.props.t}
                                                    catDivHeight={this.state.catDivHeight}
                                                    handleacknowledgeSimulationWarning={this.props.handleacknowledgeSimulationWarning} />
                                                </Tab.Pane>
                                                {isAuiViewsAllow || isShowFromPreview?<Tab.Pane eventKey="replaceProds">
                                                    <ReplaceProductsTab 
                                                    catDivHeight={this.state.catDivHeight}
                                                    isRuleWarn={this.state.isRuleWarn}
                                                    mapRulesList={this.state.mapRulesList} 
                                                    isRTL={this.props.isRTL} trans={this.props.t} 
                                                    replaceProds={this.state.replaceProds}
                                                    viewSimID={this.state.viewSimID}
                                                    copyToClipboard={this.copyToClipboard} 
                                                    getPageXYCords={this.getPageXYCords}
                                                    />
                                                </Tab.Pane>:<></>}
                                                <Tab.Pane eventKey="saleCycle">
                                                    <SaleCycleComp
                                                    isChainSaleCycle={this.props.isChainSaleCycle}
                                                    scFilter_brandsList={this.state.scFilter_brandsList}
                                                    scFilter_categoryList={this.state.scFilter_categoryList}
                                                    scFilter_subcategoryList={this.state.scFilter_subcategoryList}
                                                    scFilter_supplierList={this.state.scFilter_supplierList}
                                                    scFilter_statusList={this.state.scFilter_statusList}
                                                    selectedScFilterCat={this.state.selectedScFilterCat}
                                                    selectedScFiltersubcat={this.state.selectedScFiltersubcat}
                                                    selectedScFilterBrand={this.state.selectedScFilterBrand}
                                                    selectedScFilterSupp={this.state.selectedScFilterSupp}
                                                    selectedScFilterStat={this.state.selectedScFilterStat}
                                                    toggleSCFilter={this.toggleSCFilter}
                                                    sc_filter={this.state.sc_filter}
                                                    handleFilterSCProducts={this.handleFilterSCProducts}
                                                    nonfilteredSCProducts={this.state.nonfilteredSCProducts}
                                                    copyToClipboard={this.copyToClipboard}
                                                    handlePreviewModal={this.handlePreviewModal}
                                                    showSelectedSCProduct={this.showSelectedSCProduct}
                                                    selectedScProductId={this.state.selectedScProductId}
                                                    isRTL={this.props.isRTL} 
                                                    t={this.props.t} 
                                                    dmode={this.props.dmode}
                                                   />
                                                </Tab.Pane>
                                            </Tab.Content>
                                        </Col>
                                    </Row>
                                </Tab.Container>
                            </Col>
                            
                        </Col>:<></>}
                    </Row>

                    <div style={{display:"none"}}>
                        <canvas ref={this.dragPreviewCanvas}></canvas>
                    </div>
                   {!this.props.isShowFromPreview && !this.props.isSetFullScreenEditModal?<div className="editsimulate-buttonsset" style={{paddingTop:(this.props.simType === "AUI" && !this.props.isShowFromPreview?this.props.isSetFullScreenEditModal?"0px":"0px":"0px")}}>
                        {/* <Button variant="secondary" className={"btn-save-cat back-link"} onClick={()=>this.handlebackbtn()}>{this.props.t("btnnames.back")}</Button> */}
                        
                        {this.props.simType!=="AUI"&& isAuiViewsAllow?
                        <Button
                            style={{visibility:(mapFields?"visible":"hidden"),
                            display:((this.props.simType)===SimulationTypesFE.IsleAllocation?"none":(this.props.isopenfromAffectedSimList?"none":"block"))}}
                            variant='success' className={"btn-save-cat "+(this.props.isRTL === "rtl"?"float-left":"float-right")}
                            disabled={ConversionAvailabilityDetails===undefined || (ConversionAvailabilityDetails && ConversionAvailabilityDetails.convertableFullCount===undefined) || (ConversionAvailabilityDetails && ConversionAvailabilityDetails.currentConvertedCount===undefined) || (ConversionAvailabilityDetails && ConversionAvailabilityDetails.currentConvertedCount > ConversionAvailabilityDetails.convertableFullCount) || (ConversionAvailabilityDetails !== null && (ConversionAvailabilityDetails.isAlreadyConverted || (ConversionAvailabilityDetails && ConversionAvailabilityDetails.currentConvertedCount === ConversionAvailabilityDetails.convertableFullCount)))}
                            onClick={()=>this.props.handleCreateNewAUI()}
                            >
                                {this.props.t("Create_new_AUI_version")+" "+(ConversionAvailabilityDetails!==null?(ConversionAvailabilityDetails.currentConvertedCount+"/"+ConversionAvailabilityDetails.convertableFullCount):"")}
                        </Button>:<></>}

                        {this.props.simType === "AUI"?
                                     
                        ((this.props.originatedMpId && this.props.originatedMpId === -1) || (this.props.originatedMpId === this.props.defSaveObj.mp_id)) ?
                             
                        <>
                        { (this.props.storeId > -1) || (this.props.storeId === -1 && this.props.selectedTagList.length > 0 && this.props.isNoTagAvailable) ?
                            <>
                                <Button variant='success' className={(this.props.simOption === "disconnected" ? this.props.newSnapshotId === -1 ?"disconnect-button-aui-edit" : "disconnect-button-aui-edit-enabled" : "disconnect-button-aui-edit") + " back-link "+ (this.props.isRTL === "rtl"?"float-left":"float-right")} disabled={!this.state.historyData.past.length>0} onClick={()=>this.disconnectDecider("disconnected")}>{this.props.t("Disconnect")}</Button>       
                                {this.props.storeId > -1 || (this.props.storeId === -1 && this.props.isNoTagAvailable)?<Button variant='success' className={(this.props.simOption === "takeback" ? this.props.newSnapshotId === -1 ? "takeback-button-aui-edit" : "takeback-button-aui-edit-enabled" : "takeback-button-aui-edit") + " back-link "+ (this.props.isRTL === "rtl"?"float-left":"float-right")} disabled={!this.state.historyData.past.length>0} onClick={()=>this.saveSimulateConfirm("takeback")}>{this.props.t("TAKE_BACK")}</Button>:<></>}
                            </>
                            :
                            <Button variant='success' className={"btn-save-cat back-link "+(this.props.isRTL === "rtl"?"float-left":"float-right")} disabled={(!this.state.isNewClipBoardTouched&& this.state.historyData.past.length===0)} onClick={()=>this.saveSimulateConfirm("none")}>{this.props.t("btnnames.save")}</Button>
                        }
                        </>
                        :
                        <></>
                        :
                        <Button variant='success' className={"btn-save-cat back-link "+(this.props.isRTL === "rtl"?"float-left":"float-right")} disabled={(!this.state.isNewClipBoardTouched&& this.state.historyData.past.length===0)} onClick={()=>this.saveSimulateConfirm("none")}>{this.props.t("btnnames.save")}</Button>
                        }
                        {/* <Button variant='primary' className={"btn-save-cat "+(this.props.isRTL === "rtl"?"float-left":"float-right")} disabled={!this.state.isFieldsMatching} onClick={()=>this.handleExportVMP()}>{this.props.t("export_to_vmp")}</Button> */}
                    </div>:<></>}
                    {!this.props.isShowFromPreview && this.props.isSetFullScreenEditModal?<div className="editsimulate-buttonsset-AUIFullScreen" style={{paddingTop:(this.props.simType === "AUI"?this.props.isSetFullScreenEditModal?"0px":"20px":"0px")}}>
                        <Button variant='secondary' className={"btn-save-cat"} disabled={!this.state.historyData.past.length>0} onClick={()=>this.handleResetEdit()}>{this.props.t("btnnames.reset")}</Button>
                   
                        {this.props.simType === "AUI"?
                        
                        ((this.props.originatedMpId && this.props.originatedMpId === -1) || (this.props.originatedMpId === this.props.defSaveObj.mp_id)) ?
                        
                        <>
                         { (this.props.storeId > -1) || (this.props.storeId === -1 && this.props.selectedTagList.length > 0 && this.props.isNoTagAvailable) ?
                            <>
                                <Button variant='success' className={(this.props.simOption === "disconnected" ? this.props.newSnapshotId === -1 ?"disconnect-button-aui-edit-fs" : "disconnect-button-aui-edit-fs-enabled" : "disconnect-button-aui-edit-fs")} disabled={!this.state.historyData.past.length>0} onClick={()=>this.disconnectDecider("disconnected")}>{this.props.t("Disconnect")}</Button>
                                {this.props.storeId > -1 || (this.props.storeId === -1 && this.props.isNoTagAvailable)?<Button variant='success' className={(this.props.simOption === "takeback" ? this.props.newSnapshotId === -1 ? "takeback-button-aui-edit-fs" : "takeback-button-aui-edit-fs-enabled" : "takeback-button-aui-edit-fs")} disabled={!this.state.historyData.past.length>0} onClick={()=>this.saveSimulateConfirm("takeback")}>{this.props.t("TAKE_BACK")}</Button>:<></>}
                            </>
                            :
                            <Button variant='success' className={"btn-save-cat"} disabled={!this.state.historyData.past.length>0} onClick={()=>this.saveSimulateConfirm("none")}>{this.props.t("btnnames.save")}</Button>
                        }
                        </>
                        :
                        <></>
                        :
                        <Button variant='success' className={"btn-save-cat"} disabled={!this.state.historyData.past.length>0} onClick={()=>this.saveSimulateConfirm("none")}>{this.props.t("btnnames.save")}</Button>
                        }
                    </div>:<></>}

                    {this.props.isShowFromPreview?<div className="editsimulate-buttonsset auipreview">
                        <Button variant='success' className={"btn-save-cat"} onClick={() => this.auiPreviewApply()}>{this.props.t("SAVE_AND_APPLY")}</Button>
                    </div>:<></>}

                    {this.state.showPreviewImageModal===true ? 
                        <PreviewImage 
                            productid={this.state.productId ? this.state.productId : null} 
                            loadfromback={true} 
                            imgurl={""} 
                            isshow={this.state.showPreviewImageModal} 
                            isRTL={this.props.isRTL} 
                            handlePreviewModal={this.handlePreviewModal}
                            hideheaderlables={false}
                            />
                        :<></>
                    }

                    <div className='draggable-ghost-wrapper' style={{width: 300, height: 100}}></div>

                    <Modal dialogClassName="modal-fullscreen sim-fullscreen"  show={this.state.isShowFullscreen} onHide={() => this.setFullscreenShow(false)}>
                        <Modal.Header closeButton>
                            <Modal.Title><span className="f-screenTitle">{this.props.t("Full_Screen")}</span>
                                {/* {(this.props.selectedCatRect&&this.props.selectedCatRect.categoryList.length>0)?<span className="catname">{getNameorIdorColorofBox(this.props.selectedCatRect.categoryList[0],"name")}</span>:<></>} */}
                            </Modal.Title>
                            {/* <Button size="sm" className="print-btn" title={this.props.t("print")} onClick={()=>this.handletoImage()}><FeatherIcon icon="printer" size={12} /> {this.props.t("PRINT_SIMULATION")}</Button> */}
                            <Dropdown drop='down' title={this.props.t("PRINT_SIMULATION")} className='printdrop-down down'>
                                <Dropdown.Toggle variant="success">
                                    <FeatherIcon icon="printer"  size={12} /> {this.props.t("PRINT_SIMULATION")}
                                </Dropdown.Toggle>

                                <Dropdown.Menu>
                                    <ul className='list-inline'>
                                        <li className='list-inline-item' onClick={() => this.printInit(false, true, false)}><TooltipWrapper text={this.props.t("SIM_PRINT_PDF")}><span><PDFPrintIcon size={26} /></span></TooltipWrapper></li>
                                        <li className='list-inline-item simfield-print' onClick={() => this.printInit(false, true, true)}><TooltipWrapper text={this.props.t("SIM_PRINT_PDF_FIELDWISE")}><span><PDFFieldPrintIcon size={26} /></span></TooltipWrapper></li>
                                        <li className='list-inline-item' onClick={() => this.printInit(true, true, false)}><TooltipWrapper text={this.props.t("SIM_PRINT_EXCEL")}><span><ExcelPrintIcon size={26} /></span></TooltipWrapper></li>
                                        <li className='list-inline-item simfield-print' onClick={() => this.printInit(true, true, true)}><TooltipWrapper text={this.props.t("SIM_PRINT_EXCEL_FIELDWISE")}><span><ExcelPrintFieldWiseIcon size={26} /></span></TooltipWrapper></li>
                                    </ul>
                                </Dropdown.Menu>
                            </Dropdown>
                        </Modal.Header>
                        <Modal.Body ref={this.fullscreendiv}>
                            <Col className='fullscreenview-wrapper'>
                                <React.Fragment>
                                    {(fullscreenObj!==null&&fullscreenObj.fields&&Object.keys(fullscreenObj.fields).length>0)&&<Col  className="single-simitem" onContextMenu={e => e.preventDefault()} style={{width: "100%"}}> {/* ,height: (this.state.fullscreenheight-40) */}
                                                    
                                        <svg id={this.state.svgViewId} className="sim-catpreview-all-full" viewBox={"0 0 "+this.state.fullscreensvgdrawDiemention.drawWidth+" "+this.state.fullscreenheight} width={this.state.fullscreensvgdrawDiemention.drawWidth} style={{  border: '0px solid rgb(81, 40, 160)'}}
                                        version="1.1" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">  {/* height={this.state.fullscreenheight-40} */}
                                                                
                                            {(fullscreenObj.fields&&Object.keys(fullscreenObj.fields).length>0)&&Object.keys(fullscreenObj.fields).map((Fld,f)=>{
                                                var fld=fullscreenObj.fields[Fld]
                                                return<React.Fragment key={f}>
                                                    <rect className=""  width={fld.drawWidth} height={fld.drawHeight} x={fld.x } y={fld.y } style={{ strokeWidth: 0, stroke: (this.props.dmode?'#2CC990':'#5128a0'), fill: 'transparent' }} 
                                                    />
                                                     {fld.separators&&fld.separators.length>0?fld.separators.map((sprtr,sp)=> <React.Fragment key={sp}> {sprtr.isCategoryEnd?<line x1={sprtr.drawX} y1={fld.y} x2={sprtr.drawX} y2={fld.y+fld.drawHeight} strokeWidth={4} stroke="red" strokeDasharray="6"  />:<line x1={sprtr.drawX} y1={fld.y} x2={sprtr.drawX} y2={fld.y+fld.drawHeight} strokeWidth={4} stroke={(this.props.dmode?'#2CC990':'#5128a0')} />} </React.Fragment>)
                                                    // {fld.separators&&fld.separators.length>0?fld.separators.map((sprtr,sp)=> <React.Fragment key={sp}>  <line x1={sprtr.drawX} y1={fld.y} x2={sprtr.drawX} y2={fld.y+fld.drawHeight} strokeWidth={4} stroke={(this.props.dmode?'#2CC990':'#5128a0')} /></React.Fragment>)
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
                                                // var cintrlprodloc = this.state.currentInternalDraggableProd;
                                                // var cimgcolor = (cintrlprodloc && cintrlprodloc.prod.id===product.id?true:false);
                                                // var productSheflItem = (product.field_custom_id ?mapFields[product.field_custom_id].shelf.find(x => x.rank === product.shelfrank):null)
                                                return <React.Fragment key={prodt}>
                                                        { !product.isDelete&&<>
                                                            <FullRenderProdImage prodObj={product} handleloadedprodcount={this.handleloadedprodcount} />
                                                            {product.isStackable?<foreignObject  x={product.x} y={product.y-18} width={product.drawWidth} height={20}>
                                                                <div 
                                                                // className='centered'
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
                            </Col>
                            <canvas id="simcatfull-canvas" style={{display: "none"}}></canvas>
                            <PrintCoverPageView 
                                simType={this.props.simType}
                                defSaveObj={this.props.defSaveObj}
                                t={this.props.t} isRTL={this.props.isRTL}
                                mainid="simcatprint-wrapper"
                                subid="simcat-cover" 
                                originatedMpName={this.props.originatedMpName}
                                originatedMpId={this.props.originatedMpId}
                                chaindetails={(this.props.signedobj && this.props.signedobj.signinDetails?this.props.signedobj.signinDetails.chain:null)}
                                department={this.props.defSaveObj && this.props.defSaveObj.department?this.props.defSaveObj.department:null}
                                signedobj={this.props.signedobj} 
                                searchobj={this.props.simulateSearchObj}
                                fieldCount={this.props.simulateCount > 0?this.props.simulateCount:0}
                                isCatview={true}
                                categoryName={(this.state.selectedCatRect && this.state.selectedCatRect.selectedCat && this.state.selectedCatRect.selectedCat)?getNameorIdorColorofBox(this.state.selectedCatRect.selectedCat,"name"):""}
                                isFieldWisePDFPrint={this.state.isFieldWisePDFPrint}
                                />
                        </Modal.Body>
                        
                        {this.state.printloading?<Col style={{background:"#f0f0f0",width:"100%",position:"absolute",height: "100%",}}></Col>:<></>}
                    </Modal>

                    <AcViewModal showmodal={this.state.loadinggif} message={this.props.t('PLEASE_WAIT')} />
                    <AcViewModal showmodal={this.state.loadinggif2} message={this.props.t('PLEASE_WAIT')} />
                    <MpDropProdAlertBox
                        selectedwarningdropprod={this.state.selectedwarningdropprod}
                        isshow={this.state.isProductDropwarn}
                        icon={<MPWarnIcon width={127} height={107} />}
                        ListTitle={this.props.t("UnabletoDropProductbecuse")}
                        successBoderText={this.props.t("OKAY_NOTED")}
                        successBoderAction={this.cannotDropWarningHandle}
                        List={this.state.dropWarningList}
                        handleShowHide={this.cannotDropWarningHandle}
                        handleopenDetailmodal={this.handleopenDetailmodal}
                        reloadProdWarnModalDetails={this.reloadProdWarnModalDetails}
                         />
                    {/* {this.state.selectedProduct && this.state.isShowPreviewModal===true?
                        <Productpreview t={this.props.t} isRTL={this.props.isRTL} 
                            isshow={this.state.isShowPreviewModal}
                            showFullSidebar={true}
                            handleSaveProduct={this.handleSaveProduct} 
                            selectedProduct={this.state.selectedProduct} 
                            tagslist={this.state.tagslist} 
                            toggleProductEditModal={this.toggleProductEditModal} 
                            loadedTagsList={this.state.loadedTagsList}
                            handleImagePreviewModal={this.handlePreviewModal}
                        />
                        :<></>
                    } */}
                      {this.state.selectedProduct && this.state.isShowPreviewModal===true?
                        <Modal  show={this.state.isShowPreviewModal} className="prod-edit new-product-update-modal" dir={this.props.isRTL} onHide={()=>this.toggleProductEditModal()} backdrop="static" animation={false}>
                            <Modal.Body style={{padding:"30px", background:"#F4F6F7"}}>
                            {
                                    this.state.isShowPreviewModal === true ?
                                    <>
                                        <AddNewItemComponent 
                                            productSearchText={this.state.productSearchText}
                                            getSimulationcall={this.props.getSimulationcall}
                                            selectedwarningdropprod={this.state.selectedwarningdropprod}
                                            isFromSimulation={true}
                                            mpstate={this.props.mpstate}
                                            t={this.props.t}
                                            isRTL={this.props.isRTL} 
                                            // prodState={this.state.extended_prodObj} 
                                            prodState={ {prodDetails:this.state.selectedProduct}}
                                            ismodal={true} 
                                            hidemodal={this.toggleProductEditModal}
                                            subcategorylist={this.state.subcategorylist} 
                                            brands={this.state.allBrands} 
                                            hidedelete={false} 
                                            size="sm"
                                        />
                                    </>:
                                    <></>
                            }
                            </Modal.Body>
                        </Modal>:<></>
                      }
                    
                    
                    {/* <FullscreenSimModal isShowFullscreen={this.state.isShowFullscreen} setFullscreenShow={this.setFullscreenShow} /> */}
                    {this.state.isSetFullScreenEditModal?
                        <FullScreenEditModal
                            actualFieldStructures={this.props.actualFieldStructures}
                            allCategoryData={this.props.allCategoryData}
                            productEditWarningsList={productEditWarningsList}
                            isopenfromAffectedSimList={this.props.isopenfromAffectedSimList}

                            importedDataObj={this.props.importedDataObj}
                            updateImportedDataObj={this.props.updateImportedDataObj}

                            isAuiViewsAllow={isAuiViewsAllow}
                            isStoreReset={this.props.isStoreReset}
                            originatedMpName={this.props.originatedMpName}
                            originatedMpId={this.props.originatedMpId}
                            storeId={this.props.storeId}
                            reloadSimAndTag={this.props.reloadSimAndTag}
                            reloadSimAndStore={this.props.reloadSimAndStore}
                            tagStoreGroup={this.props.tagStoreGroup}
                            toggleLoadingModal={this.props.toggleLoadingModal}
                            selectedTagGroup={this.props.selectedTagGroup}
                            simOption={this.props.simOption} 
                            simulateCount={this.props.simulateCount}
                            newSnapshotId={this.props.newSnapshotId}
                            mapobjectsdraw={this.mapobjectsdraw}
                            isFullScreenEdit={true} 
                            selectedTagList={this.props.selectedTagList}
                            openOneCategory={this.props.openOneCategory}
                            isSetFullScreenEditModal={this.state.isSetFullScreenEditModal}
                            simType={this.props.simType}
                            handleFullscreenEdit={this.handleFullscreenEdit}
                            mpstate={this.props.mpstate}
                            bottomFieldCount={this.props.bottomFieldCount} isopenfirsttime={this.props.isopenfirsttime}
                            defSaveObj={this.props.defSaveObj}
                            getsimulatepayload={this.props.getsimulatepayload}
                            selectedCatRect={this.state.selectedCatRect}//selectedCatRect={this.props.selectedCatRect}
                            signedobj={this.props.signedobj}
                            toggleopenfirsttime={this.props.toggleopenfirsttime} 
                            toggleOneCategory={this.props.toggleOneCategory} 
                            haveChnagesinCat={this.props.haveChnagesinCat} isRTL={this.props.isRTL} 
                            handlebackinsaveChnages={this.props.handlebackinsaveChnages} 
                            handlehaveChnagesinCat={this.props.handlehaveChnagesinCat}
                            simulationObj={this.props.simulationObj} 
                            notReleatedProdList={this.props.notReleatedProdList}
                            simulateSearchObj={this.props.simulateSearchObj} 
                            updateSaveReloadStatus={this.props.updateSaveReloadStatus} 
                            sendmarkStackableCall={this.props.sendmarkStackableCall} 
                            dmode={this.props.dmode}
                            isSalesCycle={this.props.isSalesCycle}
                            isSCycle={this.props.isSCycle}
                            mapFields={this.props.mapFields}
                            mapCategories={this.props.mapCategories}
                            mapProducts={this.props.mapProducts}
                            productsWithAnomaly={this.props.productsWithAnomaly}
                            getProductAnomalies={this.props.getProductAnomalies} 
                            changeSaleCycleActive={this.props.changeSaleCycleActive}
                            disableSalesCycleState={this.props.disableSalesCycleState}  
                            sendmarkStackableCallParent={this.sendmarkStackableCall}
                            handleFullscreenEditMethodcall={this.handleFullscreenEditMethodcall} 
                            isShowFromPreview={this.props.isShowFromPreview}
                            selectedSimPreviewObj={this.props.selectedSimPreviewObj}
                            isPrintPending={this.props.isPrintPending}
                            isPDFPrintPending={this.props.isPDFPrintPending}
                            isFieldWisePDFPrint={this.props.isFieldWisePDFPrint}
                            togglePrintPending={this.props.togglePrintPending}
                            getSimulationcall={this.props.getSimulationcall}
                            handleacknowledgeSimulationWarning={this.props.handleacknowledgeSimulationWarning}
                            isNewProdSim={this.props.isNewProdSim}
                            isChainSaleCycle={this.props.isChainSaleCycle}
                            updateIsChainSaleCycle={this.props.updateIsChainSaleCycle}
                            isSaleCycleUpdated={this.props.isSaleCycleUpdated}
                            updateIsSaleCycleUpdated={this.props.updateIsSaleCycleUpdated}
                            selectedScProductId={this.state.selectedScProductId}
                            />
                        :<></>}
                </Col>

                <TakeBackOverlapWarn t={this.props.t} isRTL={this.props.isRTL}
                    isShowTakeBackError={this.state.isShowTakeBackError}
                    takeBackErrorObj={this.state.takeBackErrorObj}
                    toggleTakebackWarnModal={this.toggleTakebackWarnModal}
                    />

                {this.props.isShowFromPreview?<NewProdStrategyApplyModal t={this.props.t} isRTL={this.props.isRTL}
                    isShowStrategyModal={this.state.isShowStrategyModal}
                    selectedSaveProds={this.state.selectedSaveProds} 
                    chainOptionToAll={this.chainOptionToAll} 
                    continueNewProdApply={this.continueNewProdApply} 
                    handleChangeStrategy={this.handleChangeStrategy}
                    handleImagePreviewModal={this.handleImagePreviewModal}
                    toggleStrategyApplyModal={this.toggleStrategyApplyModal}
                    toggleStrategyHelpDrop={this.toggleStrategyHelpDrop}    
                    />:<></>}
            </Col>
        )
    }
}
//comment below  this if component breack
function ProdRectView(props) {
    const [show, setShow] = useState(false);
    const target = useRef(null);
    const prod = props.prod;
    const isshowview = (props.viewtype === "LIST"?false:true);
    const trans = props.t;
    return (
      <>
        <div ref={target} onMouseOver={() => setShow(isshowview)} onMouseOut={() => setShow(false)}>
          {props.children}
        </div>
        <Overlay target={target.current} transition={false} show={show} placement={props.isRTL==="rtl"?"left":"right"}>
          {(props) => (
            <Tooltip {...props}>
              <><small style={{fontSize:"0.75rem"}}>{prod.barcode&&prod.barcode}</small><br/>{(prod.brandName&&prod.brandName!==""&&prod.brandName!=="-"?(prod.brandName+" "):(i18n.t("notavailable")+" "))+prod.productName}<br/>
              <small style={{fontSize:"0.75rem"}}><i>{trans?trans('WIDTH'):"Width"} {prod.width+""+convertUomtoSym(prod.uom)}, {trans?trans('HEIGHT'):"Height"} {prod.height+""+convertUomtoSym(prod.uom)}</i></small></>
            </Tooltip>
          )}
        </Overlay>
      </>
    );
}
export function ContextMenu(props) {
  var xPos = props.xpos; //x position
  var yPos = props.ypos; //y position
  
  //handle click a button. 2-delete, type: 2-expand, 3-close
  const handleClick = (type,event) => {
      if(type === 1){
          props.handledelete();
      } if(type === 2){
          props.handlexpand();
      } else if(type === 4){
          props.handledeleteall();
      } else if(type === 5){
        props.handledeleteall();
    } else{
          props.handlclose();
      }
  }

  const handleCutItem = (iscopy,isFromDelete) => {
      props.cutContextItem(iscopy, props.currentprod,isFromDelete);
  }
  const viewproduct = (prod) => {
    let cprod=prod
    prod.id=prod.productId
    props.handleopenDetailmodal(cprod)
}

  let proddetails = (props.currentprod && props.currentprod.prod?props.currentprod.prod:null);
  
  return (<>
    <div className="pdunit-prodcontext-menu simcontext-menu" onContextMenu={(e)=>{ e.preventDefault()}} style={{ top: yPos, left: props.isRTL==="rtl"?(xPos-400):(xPos+5), }}>
    {/* top: yPos, left: (xPos-(props.isRTL==="rtl"?-380:0) */}
        <span className="viewmenu-span" id="contextm_close" onClick={() => handleClick(3)}><XIcon size={16} /></span>
        {props.currentprod?<Row>
            <Col xs={2}><div className="thumb-div" style={{padding:"2px"}} onClick={()=>props.handlePreviewModal(props.currentprod.prod,true)}>
                    <img src={props.currentprod.prod.imageUrl} className={proddetails?(proddetails.width >= proddetails.height?"img-resize-ver":"img-resize-hor"):""} alt="" style={{width:"95%"}}/>
                </div>
            </Col>
            <Col xs={10} style={{paddingTop:"10px"}}>
                <h4>
                    <small id="contextm_bcode">{props.currentprod&&props.currentprod.prod?<CopyToClipboard text={props.currentprod.prod.barcode} onCopy={() => props.copyToClipboard()}><span className="copy-hover">{props.currentprod.prod.barcode}</span></CopyToClipboard>:"-"}</small><br/>
                    <span className='SelNameLable' onClick={()=>viewproduct(props.currentprod.prod)}>{props.currentprod&&props.currentprod.prod?(props.currentprod.prod.name):"-"}</span>
                </h4>
            </Col>
        </Row>:<></>}
        
        <hr style={{marginBottom:"22px",marginTop:"6px"}}/>
        <ul className="list-inline" style={{textAlign:(props.isRTL==="rtl"?"left":"right"), paddingRight: "0px"}}>
            <li className={"list-inline-item "+(props.isRTL==="rtl"?"float-right":"float-left")} id="contextm_expand" onClick={() => handleClick(2)}><Button variant={(props.isexpand?"success":"secondary")} size="sm"><PlusIcon size={12}/> {i18n.t("expand")}</Button></li>
            
            <li className="list-inline-item" onClick={() => handleCutItem(true)}><Button variant="secondary" size="sm" title={"Copy"}><FeatherIcon icon={"copy"} size={12} /></Button></li>
            <li className="list-inline-item" onClick={() => handleCutItem()}><Button variant="secondary" size="sm" title={"Cut"}><FeatherIcon icon={"scissors"} size={12} /></Button></li>
            
            <li className="list-inline-item" id="contextm_delete" 
            // onClick={() => handleClick(1)}
            onClick={() => handleCutItem(false,true)}
            ><Button variant="danger" size="sm"><TrashIcon size={12}/></Button></li>
            {/* <li className="list-inline-item" id="contextm_deleteall" style={(props.isRTL==="rtl"?{marginRight:"8px"}:{})} onClick={() => handleClick(4)}><Button variant="danger" size="sm"><TrashIcon size={12}/> {i18n.t("btnnames.all")}</Button></li> */}
        </ul>
    </div>
  </>);
}
const mapDispatchToProps = dispatch => ({
    setMPCategoryChanges: (payload) => dispatch(MPCategoryChangesSetAction(payload)),
    setMPStackableProdListArray: (payload) => dispatch(mpstackableMarkListAction(payload)),
    setMpEditStackHistory: (payload) => dispatch(mpEditStackHistorySetAction(payload)),
    setMpFullscreenchngesobj: (payload) => dispatch(mpAftersaveFullScreenObjSetAction(payload)),
    // setMpClipBoardsforCats: (payload) => dispatch(mpsetClipBoardandotherforCatSetAction(payload)),
    setSimulationNewProductSearchDetails:(payload) => dispatch(SimulationNewProductSearchDetailsSetAction(payload)),
    
    
});
export default withTranslation()(withRouter(connect(null, mapDispatchToProps)(EditSimulateCategory)))

