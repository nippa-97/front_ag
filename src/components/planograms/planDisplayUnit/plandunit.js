//import dependencies
import React from 'react';
import { withRouter, Prompt } from 'react-router-dom';
import { connect } from 'react-redux';
import { Col, Button, Modal, Row} from 'react-bootstrap'; //Popover
import { ChevronLeftIcon, } from '@primer/octicons-react'; //InfoIcon,
import FeatherIcon from 'feather-icons-react';
import { withTranslation } from 'react-i18next'; //language support
// import { v4 as uuidv4 } from 'uuid'; //unique id
import { confirmAlert } from 'react-confirm-alert';

//import css 
import 'react-circular-progressbar/dist/styles.css';
import './plandunit.scss';
//import using services
import { submitCollection } from '../../../_services/submit.service'; //gets backend paths
import { alertService } from '../../../_services/alert.service'; //common alert services
import { submitSets } from '../../UiComponents/SubmitSets'; //backcalls handlers
import { AcViewModal } from '../../UiComponents/AcImports'; 
import { ghostOnDrag, removeGhostImage } from '../../common_layouts/ghostDragWrapper';

//redux actions
import { historyFieldAction, PDviewDataAction, setFieldOverlapAction, viewFieldAction, setFieldIsNewDraft, recprodsFieldAction } from '../../../actions/planogram/planogram_action';

//import sub components
import ProdMDModal from './prodmdedit'; //product masterdata edit modal
// import FieldDetailsEdit from './fielddetailsedit'; //field details edit sidebar
import BottomSalesContent from './bottomcontent/allbottomcontents'; //sales table
import ProductRotate from './productRotate'; //rotate change modal
import { checkProductIsInBottom, PreviewProduct, ImprovementProgress, StoreTagsList, checkProdAvailabilityInFeild, refreshRevProPercentages, convertBackSaveObj, sortShelvesDesc } from './additionalcontents'; //needed common functions sortShelvesDesc, 
import AllProductContents from './productcontent/allrproductcontents';
import { AspectRatioDrawBox, findBrowserType, measureConverter, roundOffDecimal, uomList } from '../../../_services/common.service';
import DisplayUnitDraw from './drawcontent/drawcontent';
import { FullScreenEditView } from './drawcontent/fullscreenview';
import { ProdsWarningSidebar, ProdWarningModal } from './productcontent/productwarning';
import ExportCSV from './productcontent/excelexport';

//import image files
// import loadinggif from '../../../assets/img/loading-sm.gif';
// import savemodalimg from '../../../assets/img/submit_modal_img.jpg';
import PreviewImage from '../../common_layouts/image_preview/imagePreview.js';

import PgDunitActions from './productcontent/dunitactions';
import MpDropProdAlertBox from '../../newMasterPlanogram/alertBox/MpDropProdAlertBox';
import { MPWarnIcon } from '../../../assets/icons/icons';
import { validateHeirarchyMissings } from '../../newMasterPlanogram/simulateview/MPsimulateAllCategory/mpsimCommenMethods';
import { AddNewItemComponent } from '../../masterdata/products/AddNew/addnew';
// import { layoutOriginTypes } from '../../../enums/planogramTypes';



/**
 * main planogram display unit component. shows active and current field views, sales, overview sales
 * options are can add new products to fields, remove change position, multiply, create blocks
 * also can edit fields, change shelve values and allow to overlap product
 * products edit/rotate and drop, undo/redo or reset to initial state
 *
 * @class PlanDunitComponent
 * @extends {React.Component}
 */
export class PlanDunitComponent extends React.Component{
    _isMounted = false;
    dheight; dwidth; //field div width/height
    adheight; adwidth; //active field div width/height
    bctimeout; //timeout object

    constructor(props){
        super(props);

        this.dragPreviewCanvas = React.createRef(); //drag preview canvas
        this.dragPreviewImage = new Image(); //temp stores dragging image
        this.oriPageXY = {isfirefox: false, x: 0, y: 0};
        this._facingCalcTimeout = null;
        this._importedScrollHeight = 0;

        this.state = {
            isEdit: false, statfieldid: 0,
            saveObj: null, bkpSaveObj: null, 
            fieldDeptList: [],
            activeFieldDeptList: [],
            activeViewObj: null, bkpActiveObj: null,
            savemodalshow: true, 
            isLoadingModalShow: false,
            fullScreenPreviewObj: null,
            displayRatio: 0, displayUOM: "cm",
            fieldStatus: "DRAFT", isActiveMode: false, 
            existnewprodlist: [],
            ischangesavailable: false,
            isReloadDraw: true,
            isReloadAll: true,
            isActiveFirstTimeLoaded: false, //using to prevent copying active draw details
            ghostWrapperObj: null, //using to redraw ghost wrapper of dragging with mouse
            isContentDragging: false,
            
            fieldHistory: {},
            AllRecentProdList: [],
            recentProdList: [],

            currentDraggableProd: null,

            rpchangedprodlist: [], //collects all revenue changes
            rploadedrevenue: [], rploadedoverview: [], //revenue/profit changes
            cursorttype: "revenue", cursortview: "DESC", //sales defult sort
            filterRevenueList: [], isrpdetailsloading: false, isrpoverviewloading: false, //sales details loading changes
            
            showNewTabType: "new", isProposeDataLoading: false, loadedProposeList: {}, trackedProposeChanges: [], isproposeavailable: false, proposeselecttab: "key-1", 
            propshowhighlight: {isshow: false, itemid: 0, type: 0}, //propose loaded list
            showrotateprod: false, selectedrotateprod: null, isshowrotateedit: true, //rotate product
            showdebuglog: false, debugLogList: [], selectedlocobj: null, //debug view
            selStoreId: 0, //current store id
            selStoreName: "-",
            
            showPreviewImageModal:false, productId:0, //image preview modal

            showWarningSidebar: false, warningProdList: [], //show product warning sidebar
            showSingleProdWarning: false, warningProdItem: null,
            
            showFullScreenEditView: false,

            clipBoardList: null, totalCutCount: 0,
            historyTabList: [],

            zoomDrawX: 0,

            datePeriodType: "VERSION",
            datePeriodRange: { fromDate: null, toDate: null },

            loadedStoreTags: [],
            issnapshotloading: true,
            bottomCatSubBrands: [],
            snapshotFilters: { departments: [], categories: [], subcategories: [] },
            addedFilters: { departmentId: 0, categoryId: 0, subcategoryId: 0 },
            filterLevel: "CAT",
            showingSnapshotList: [],
            allSnapshotBrandList: [],
            hightlightSnapShotList: { categories: [], subcategories: [], brands: [] },
            snapshotShowFieldOnly: false,

            userDetails: null,

            //print
            isPendingExport: false,
            isPrintRLView: false,
            selectedPrintDept: null,
            printType: "PDF",
            shareEmail: "",
            selectedDeptIdx: 0,

            //propose highlight
            proposeHighlightProd: null,

            //sale cycle
            currentAndOtherFieldsProductQty: [],
            otherFieldsProductQty: [],
            saleCycledatePeriodRange: { fromDate: null, toDate: null },
            saleCycleObj : [],

            //excel upload list
            excelUploadList: [],
            isImportDataLoading: false,
            allLayoutUsedProds: [],
            isDisableEdit: false, //disable edit for certain users
            
            //product warning modal
            isProductDropwarn: false,
            dropWarningList:[],
            selectedwarningdropprod: null,
            isShowPreviewModal: false,
            searchProdLoadedList: [], //get search results to parent component to update product details when update it from warn modal
            
            paginationMaxCount: 100, 
            excelStartIndex: 0,
            totalExcelProdCount: 0,
            excelSearchText: "",
            //excel upload pagination
            excelUploadPagination: { 
                totalCount: 0, 
                startIndex: 0,  
                available: 0, 
                notavailable: 0,
                availableBarcodes: [],
                uploadUUID: null,
            },

            snapshotDeptsList: [], //snapshot depts
        }
    }

    componentDidMount(){
        this._isMounted = true;

        if(this._isMounted){
            this.initOnloadData(); //onload load field/active field details

            //if firefox 
            if(findBrowserType() === "firefox"){
                document.addEventListener("dragover", this.getPageXYCords, false);
            }
        }
    }

    componentWillUnmount = () => {
        this._isMounted = false;
    }

    //init onload data calls
    initOnloadData = () => {
        //get redux state details
        let cisedit = (this.props.planogramState&&this.props.planogramState.pgramFieldDetails?true:false); //check is edit view
        let clayoutdetails = (this.props.planogramState && this.props.planogramState.PDplanogramDetails?this.props.planogramState.PDplanogramDetails:null);
        let cselstore = (this.props.planogramState&&this.props.planogramState.pgramStore? this.props.planogramState.pgramStore : 0); //get selected store
        
        let userDetails = (this.props.signedobj && this.props.signedobj.signinDetails?this.props.signedobj.signinDetails:null);
        // console.log(userDetails);

        let fromDate = new Date();
        let newFromDate = fromDate.setMonth(fromDate.getMonth() - 3);

        //set state
        this.setState({
            fieldHistory: this.defaultFieldHistory(), //default field history
            statfieldid: (cisedit?this.props.planogramState.pgramFieldDetails.id:0), //current field id
            saveObj: null, //set details field object
            bkpSaveObj: null, //creates backup save object for reset purpose
            activeViewObj: null, //active field details
            allowovrflwprod: (this.props.planogramState&&this.props.planogramState.pgramFieldAllowOverlap?this.props.planogramState.pgramFieldAllowOverlap:false), //get is allow to overflow boolean from redux if available
            selStoreId: cselstore, savemodalshow: true,  //sets current storeid 
            selStoreName: (clayoutdetails?clayoutdetails.storeName:"-"),
            userDetails: userDetails,
            datePeriodRange: { 
                fromDate: new Date(newFromDate), 
                toDate: new Date()
             },
        }, () => {
            //load field details from back
            this.getFieldDetails();
            //get recent added product list
            this.loadRecentProdList();
        });
    }

    //default cut list
    defaultCutList = () => {
        let saveobj = this.state.saveObj;

        let newCutGroupObj = {
            floorLayoutId: (saveobj?saveobj.floorLayoutId:-1),
            clipboardData: [] 
        }

        this.setState({ clipBoardList: newCutGroupObj }, () => {
            this.compareClipboardItems();
        });
    }
    
    //default save object
    defaultObjectLoad = () => {
        return {x: 0, y: 0, width: 0, height: 0, barcode: "", planogramShelfDto: [], uuid: 0, notes: "", fieldVer: 0};
    }

    //default field history
    defaultFieldHistory = () => {
        var dobj = { past: [], present: 0, future: [] };
        this.setState({fieldHistory: dobj});
        return dobj;
    }

    //#PLG-DU-PD-H03 load recent prod list
    loadRecentProdList = () => {
        let fieldList = (this.props.planogramState && this.props.planogramState.pgramFieldDetails?this.props.planogramState.pgramFieldDetails.fieldList:[]);
        // console.log(fieldList);

        let fieldrecentlist = [];
        let recentalllist = (this.props.planogramState&&this.props.planogramState.pgramFieldRecProds?this.props.planogramState.pgramFieldRecProds:[]);
        //console.log(recentalllist);
        
        for (let i = 0; i < fieldList.length; i++) {
            const fieldobj = fieldList[i];
            
            for (let i = 0; i < recentalllist.length; i++) {
                const recentitem = recentalllist[i];
                if(recentitem.fieldid && recentitem.fieldid === fieldobj.id){
                    fieldrecentlist.push(recentitem);
                }
            }
        }
        
        // console.log(fieldrecentlist);
        this.setState({ 
            recentProdList: fieldrecentlist, 
            AllRecentProdList: recentalllist 
        });
    }

    //add field history
    fieldHistoryAdd = (csobj, type) => {
        ///type=1 add item, type=2 delete item, type=3 move item, type=4 multiply item

        let chobj = this.state.fieldHistory;
        let cliplist = structuredClone(this.state.clipBoardList);
        let removelist = structuredClone(this.state.historyTabList);

        let salelist = structuredClone(this.state.rpchangedprodlist);
        let saleupdatedlist = structuredClone(this.state.rploadedrevenue);
        let saleoverviewdetails = structuredClone(this.state.rploadedoverview);

        //snapshot details 
        let snapshotlist = structuredClone(this.state.bottomCatSubBrands);
        let snapshotFilters = structuredClone(this.state.snapshotFilters);
        let addedFilters = structuredClone(this.state.addedFilters);
        let filterLevel = structuredClone(this.state.filterLevel);
        let showingSnapshotList = structuredClone(this.state.showingSnapshotList);
        let allSnapshotBrandList = structuredClone(this.state.allSnapshotBrandList);

        let saveSnapObj = {
            bottomCatSubBrands: snapshotlist,
            snapshotFilters: snapshotFilters,
            addedFilters: addedFilters,
            filterLevel: filterLevel,
            showingSnapshotList: showingSnapshotList,
            allSnapshotBrandList: allSnapshotBrandList
        };

        let phistry = (chobj.past?chobj.past:[]);
        phistry.push({ 
            type:type, 
            obj: csobj, 
            clipboard: cliplist, 
            historylist: removelist, 
            salelist: salelist,
            saleupdatedlist: saleupdatedlist, 
            saleoverviewdetails: saleoverviewdetails,
            snapshotlist: saveSnapObj,
        });

        chobj["present"] = 0;
        chobj["past"] = phistry; chobj["future"] = [];

        this.setState({ fieldHistory: chobj });
    }
    //undo field hisory
    fieldHistoryUndo = (isresetall) => {
        let chobj = this.state.fieldHistory;
        let cliplist = structuredClone(this.state.clipBoardList);
        let removelist = structuredClone(this.state.historyTabList);

        let salelist = structuredClone(this.state.rpchangedprodlist);
        let saleupdatedlist = structuredClone(this.state.rploadedrevenue);
        let saleoverviewdetails = structuredClone(this.state.rploadedoverview);

        //snapshot details 
        let snapshotlist = structuredClone(this.state.bottomCatSubBrands);
        let snapshotFilters = structuredClone(this.state.snapshotFilters);
        let addedFilters = structuredClone(this.state.addedFilters);
        let filterLevel = structuredClone(this.state.filterLevel);
        let showingSnapshotList = structuredClone(this.state.showingSnapshotList);
        let allSnapshotBrandList = structuredClone(this.state.allSnapshotBrandList);

        let saveSnapObj = {
            bottomCatSubBrands: snapshotlist,
            snapshotFilters: snapshotFilters,
            addedFilters: addedFilters,
            filterLevel: filterLevel,
            showingSnapshotList: showingSnapshotList,
            allSnapshotBrandList: allSnapshotBrandList,
        };

        let backidx = (isresetall?0:(chobj.present > 0?(chobj.present - 1):(chobj.past.length - 1)));
        let getsobj = chobj.past[backidx];

        let cfutureobj = { 
            type: getsobj.type, 
            obj: structuredClone(this.state.saveObj), 
            clipboard: cliplist, 
            historylist: removelist, 
            salelist: salelist, 
            saleupdatedlist: saleupdatedlist, 
            saleoverviewdetails: saleoverviewdetails,
            snapshotlist: saveSnapObj,
        };
        chobj.future.push(cfutureobj);
        chobj.past.splice(-1,1);

        if(isresetall){
            chobj.future = [];
            chobj.past = [];
        }
        
        this.setState({ 
            saveObj: getsobj.obj, 
            clipBoardList: getsobj.clipboard,
            historyTabList: getsobj.historylist,
            fieldHistory: chobj,
            rpchangedprodlist: getsobj.salelist,
            rploadedrevenue: getsobj.saleupdatedlist,
            rploadedoverview: getsobj.saleoverviewdetails,

            bottomCatSubBrands: getsobj.snapshotlist.bottomCatSubBrands,
            snapshotFilters: getsobj.snapshotlist.snapshotFilters,
            addedFilters: getsobj.snapshotlist.addedFilters,
            filterLevel: getsobj.snapshotlist.filterLevel,
            showingSnapshotList: getsobj.snapshotlist.showingSnapshotList,
            allSnapshotBrandList: getsobj.snapshotlist.allSnapshotBrandList,
        }, () => {
            this.updatePreviewGuid();
            this.compareClipboardItems();
            this.findExistingNewProductsCount(this.state.saveObj);
        });
    }
    //redo field hisory
    fieldHistoryRedo = () => {
        let chobj = this.state.fieldHistory;
        let cliplist = structuredClone(this.state.clipBoardList);
        let removelist = structuredClone(this.state.historyTabList);

        let salelist = structuredClone(this.state.rpchangedprodlist);
        let saleupdatedlist = structuredClone(this.state.rploadedrevenue);
        let saleoverviewdetails = structuredClone(this.state.rploadedoverview);
        
        //snapshot details 
        let snapshotlist = structuredClone(this.state.bottomCatSubBrands);
        let snapshotFilters = structuredClone(this.state.snapshotFilters);
        let addedFilters = structuredClone(this.state.addedFilters);
        let filterLevel = structuredClone(this.state.filterLevel);
        let showingSnapshotList = structuredClone(this.state.showingSnapshotList);
        let allSnapshotBrandList = structuredClone(this.state.allSnapshotBrandList);

        let saveSnapObj = {
            bottomCatSubBrands: snapshotlist,
            snapshotFilters: snapshotFilters,
            addedFilters: addedFilters,
            filterLevel: filterLevel,
            showingSnapshotList: showingSnapshotList,
            allSnapshotBrandList: allSnapshotBrandList
        };

        let backidx = (chobj.present>0?(chobj.present + 1):(chobj.future.length - 1));
        let getsobj = chobj.future[backidx];

        let cpastobj = { 
            type:getsobj.type, 
            obj: structuredClone(this.state.saveObj), 
            clipboard: cliplist, 
            historylist: removelist, 
            salelist: salelist, 
            saleupdatedlist: saleupdatedlist, 
            saleoverviewdetails: saleoverviewdetails,
            snapshotlist: saveSnapObj,
        };
        chobj.past.push(cpastobj);
        chobj.future.splice(-1,1);
        
        this.setState({ 
            saveObj: getsobj.obj, 
            clipBoardList: getsobj.clipboard,
            historyTabList: getsobj.historylist,
            fieldHistory: chobj,
            rpchangedprodlist: getsobj.salelist,
            rploadedrevenue: getsobj.saleupdatedlist,
            rploadedoverview: getsobj.saleoverviewdetails,
            
            bottomCatSubBrands: getsobj.snapshotlist.bottomCatSubBrands,
            snapshotFilters: getsobj.snapshotlist.snapshotFilters,
            addedFilters: getsobj.snapshotlist.addedFilters,
            filterLevel: getsobj.snapshotlist.filterLevel,
            showingSnapshotList: getsobj.snapshotlist.showingSnapshotList,
            allSnapshotBrandList: getsobj.snapshotlist.allSnapshotBrandList,
        }, () => {
            this.updatePreviewGuid();
            this.compareClipboardItems();
            this.findExistingNewProductsCount(this.state.saveObj);
        });
    }

    //get field details
    getFieldDetails = (ispaginate, newfieldlist, changeside) => {
        if(!this.props.istesting){
            let fieldList = (this.props.planogramState && this.props.planogramState.pgramFieldDetails?this.props.planogramState.pgramFieldDetails.fieldList:[]);
            // console.log(fieldList);

            let fieldIdList = (ispaginate?newfieldlist:fieldList.map((fielditem) => { return fielditem.id; }));
            let findobj = { floorLayoutHasFieldIds: fieldIdList };

            this.setState({ savemodalshow: true, isActiveFirstTimeLoaded: false }, () => {
                submitSets(submitCollection.findFloorLayoutBulkFieldByIdsWithRelation, findobj, true).then(res => {
                    // console.log(res);
                    if(res && res.status && res.extra){
                        var cresltobj = res.extra;
    
                        if(ispaginate){
                            this.updatePaginateField(cresltobj, changeside);
                        } else{
                            this.reinitSaveObj(cresltobj);   

                            setTimeout(() => {
                                //load imported prod list
                                this.loadImportProdList(cresltobj);
                            }, 500);
                        }
                    } else{
                        this.setState({ saveObj: null, savemodalshow:false, isloadedfielddet:true });
                    }
                });
            });
        }
    }

    //load clipboard data
    loadClipboardData = (saveobj, displayratio) => {
        let findobj = { 
            floorlayoutId: saveobj.floorLayoutId,
            departmentIds: [] 
        };

        for (let i = 0; i < saveobj.fieldsList.length; i++) {
            const fieldobj = saveobj.fieldsList[i];

            if(fieldobj){
                let isAlreadyAdded = findobj.departmentIds.find(x => x === fieldobj.department.departmentId);
                if(!isAlreadyAdded){
                    findobj.departmentIds.push(fieldobj.department.departmentId);
                }
            }
        }
        
        // this.setState({ savemodalshow: true }, () => {
            submitSets(submitCollection.loadPlanogramClipboardData, findobj, true).then(res => {
                // console.log(res);
                if(res && res.status && res.extra){
                    // console.log(res.extra);
                    this.convertCliboardData(res.extra, displayratio);
                } else{
                    //
                }
            });
        // });
    }

    //convert cliboard data when loads
    convertCliboardData = (clipboardlist, displayratio) => {
        if(clipboardlist && clipboardlist.length > 0){

            for (let i = 0; i < clipboardlist.length; i++) {
                const parentdata = clipboardlist[i];
                
                for (let j = 0; j < parentdata.clipboardData.length; j++) {
                    const deptdata = parentdata.clipboardData[j];
                    
                    for (let l = 0; l < deptdata.shelf.length; l++) {
                        const shelfdata = deptdata.shelf[l];
    
                        for (let k = 0; k < shelfdata.products.length; k++) {
                            const proddata = shelfdata.products[k];
                            
                            proddata.productName = (proddata.name?proddata.name:proddata.productName);
                            proddata.startingXPoint = roundOffDecimal((measureConverter((proddata.uom?proddata.uom:this.state.displayUOM), this.state.displayUOM, proddata.startingXPoint) * displayratio),2);
                            proddata.startingYPoint = roundOffDecimal((measureConverter((proddata.uom?proddata.uom:this.state.displayUOM), this.state.displayUOM, proddata.startingYPoint) * displayratio),2);
                            proddata.drawWidth = roundOffDecimal((measureConverter(proddata.uom,this.state.displayUOM,proddata.width) * displayratio),2);
                            proddata.drawHeight = roundOffDecimal((measureConverter(proddata.uom,this.state.displayUOM,proddata.height) * displayratio),2);
                        }
    
                        let sortprods = shelfdata.products.sort((a,b) => a.startingXPoint - b.startingXPoint);
                        let lowestxprod = structuredClone(sortprods[0]);
                        let highxprod = (sortprods[(sortprods.length - 1)].startingXPoint + sortprods[(sortprods.length - 1)].drawWidth);
    
                        shelfdata.width = (highxprod - lowestxprod.startingXPoint);
    
                        let sorttolowy = shelfdata.products.sort((a,b) => a.startingYPoint - b.startingYPoint);
                        let lowyprody = sorttolowy[0].startingYPoint;
                        let highprody = (sorttolowy[(sorttolowy.length - 1)].startingYPoint + sorttolowy[(sorttolowy.length - 1)].drawHeight);
                        
                        shelfdata.height = (highprody - lowyprody);
                    }
                }
            }
    
            let newCutGroupObj = {
                floorLayoutId: 0,
                clipboardData: clipboardlist 
            }
            
            this.setState({ clipBoardList: newCutGroupObj }, () => {
                this.compareClipboardItems();
            });
        }
    }

    //update new field with existing 
    updatePaginateField = (newfieldobj, changeside) => {
        let newFieldsList = newfieldobj.fieldsList[0];
        let newSaveObj = structuredClone(this.state.bkpSaveObj);

        if(changeside === "left"){
            newSaveObj.fieldsList.splice(-1);
            newSaveObj.fieldsList.unshift(newFieldsList);
        } else{
            newSaveObj.fieldsList.shift();
            newSaveObj.fieldsList.push(newFieldsList);
        }

        let redirectobj = structuredClone(newFieldsList);
        redirectobj["fieldList"] = newSaveObj.fieldsList;
        this.props.setFieldView(redirectobj);

        this.setState({ isReloadAll: false, bkpSaveObj: structuredClone(newSaveObj) }, () => {
            this.setState({ isReloadAll: true }, () => {
                this.reinitSaveObj(newSaveObj, true, newfieldobj, changeside);  
            });
        });
    }
    //reninit current field object
    reinitSaveObj = (cresltobj, ispaginate, searchobj, changeside) => {
        // let layoutdetails = (this.props.planogramState && this.props.planogramState.PDplanogramDetails?this.props.planogramState.PDplanogramDetails:null);

        //find heighest field
        let highestfield = null;
        
        let deptlist = [];
        let prodDeptList = [];
        if(cresltobj.fieldsList && cresltobj.fieldsList.length > 0){
            for (let i = 0; i < cresltobj.fieldsList.length; i++) {
                const fieldobj = cresltobj.fieldsList[i];

                for (let l = 0; l < fieldobj.planogramShelfDto.length; l++) {
                    const shelfobj = fieldobj.planogramShelfDto[l];
                    shelfobj["field_custom_id"] = i;

                    //if not first field
                    for (let k = 0; k < shelfobj.planogramProduct.length; k++) {
                        const shelfprod = shelfobj.planogramProduct[k];
                        
                        for (let m = 0; m < shelfprod.productBlock.length; m++) {
                            const blockobj = shelfprod.productBlock[m];
                            
                            for (let n = 0; n < blockobj.productLocations.length; n++) {
                                const prodlocobj = blockobj.productLocations[n];
                                
                                if(prodlocobj.uom === undefined || prodlocobj.uom === "none"){

                                }
                                
                                if(prodlocobj.overLappingDto){
                                    let changerightfield = cresltobj.fieldsList.findIndex(x => x.id === fieldobj.rightSidePlanogramFieldDto.id);
                                    let changerightshelf = (changerightfield > -1?cresltobj.fieldsList[changerightfield].planogramShelfDto.findIndex(x => x.id === prodlocobj.overLappingDto.shelfId):-1);
                
                                    if(changerightshelf > -1){
                                        let rightoverlaplist = cresltobj.fieldsList[changerightfield].planogramShelfDto[changerightshelf].overLappingDto;
                                        let findalreadyrightadded = rightoverlaplist.findIndex(x => x.id === prodlocobj.overLappingDto.id && !x.isDelete);
                
                                        if(findalreadyrightadded > -1){
                                            rightoverlaplist[findalreadyrightadded]["isAvailable"] = true;
                                        }
                                    }
                                }
                            }
                        }

                        if(shelfprod.productInfo){
                            let isProdDeptFound = prodDeptList.find(x => shelfprod.productInfo.departmentId === x.departmentId);

                            if(!isProdDeptFound){
                                let newProdDept = {
                                    departmentId: shelfprod.productInfo.departmentId,
                                    name: shelfprod.productInfo.departmentName,
                                    color: shelfprod.productInfo.departmentColor,
                                };
    
                                prodDeptList.push(newProdDept);
                            }
                        }
                    }

                    if(i !== 0){
                        for (let k = 0; k < shelfobj.overLappingDto.length; k++) {
                            const overlappingobj = shelfobj.overLappingDto[k];
                            
                            if(!overlappingobj.isAvailable){
                                overlappingobj["isDelete"] = true;
                            }
                        }
                    }
                }

                if(fieldobj.department){
                    let isNotAdded = deptlist.find(x => x.departmentId === fieldobj.department.departmentId);

                    if(!isNotAdded){
                        deptlist.push(fieldobj.department);
                    }
                }

                let highestHeight = (highestfield?measureConverter(highestfield.masterFieldUom,this.state.displayUOM,highestfield.masterFieldHeight):0);
                let fieldHeight = measureConverter(fieldobj.masterFieldUom, this.state.displayUOM, fieldobj.masterFieldHeight);
                if(highestHeight < fieldHeight){
                    highestfield = fieldobj;
                }
            }
        }
        
        let cfieldstatus = (highestfield.floorLayoutStatus?highestfield.floorLayoutStatus:"DRAFT");
        let cfieldactivemode = (cfieldstatus === "ACTIVE" || (highestfield.baseFloorLayoutId && highestfield.baseFloorLayoutId > 0)?true:false); //(layoutdetails && layoutdetails.layoutOrigin !== layoutOriginTypes.from_draft_version) && 
        // console.log(layoutdetails.layoutOrigin);

        let newsaveobj = cresltobj;
        newsaveobj.masterFieldUom = highestfield.masterFieldUom;
        newsaveobj.masterFieldWidth = highestfield.masterFieldWidth;
        newsaveobj.masterFieldHeight = highestfield.masterFieldHeight;

        // console.log(prodDeptList);

        this.setState({
            saveObj: newsaveobj, bkpSaveObj: structuredClone(newsaveobj), existnewprodlist: [],
            fieldDeptList: deptlist,
            snapshotDeptsList: prodDeptList,
            displayUOM: newsaveobj.masterFieldUom, 
            fieldStatus: cfieldstatus,
            isActiveMode: cfieldactivemode,
        }, () => {
            this.calculateRate(true);
            //clipboard default
            this.defaultCutList();
            
            if(cfieldactivemode){
                this.loadActivePlanogram(newsaveobj, ispaginate, searchobj, changeside); //load active field details
            } else{
                this.setState({savemodalshow: false});
            }
        });
    }
    //get active planogram details - if available
    loadActivePlanogram = (cresltobj, ispaginate, searchobj, changeside) => {

        var csobj = structuredClone(cresltobj);
        //if state is active no need to load from  backcall
        if(this.state.fieldStatus === "ACTIVE" || this.state.fieldStatus==="MERGE" || this.state.fieldStatus==="CONFIRMED"){
            this.setState({
                isAllowChangeField: false, 
                activeViewObj: csobj, 
                bkpActiveObj: structuredClone(csobj),
                savemodalshow: false,
                activeFieldDeptList: this.state.fieldDeptList,
            });
            this.loadCurrentAndOtherFieldsQty(csobj, false, null); //load other fields product qty for sales cyle
            // this.loadRDDetails(csobj); //load revenue details
            this.loadRDOverviewDetails(csobj); //load revenue details
            this.loadSnapshotDetails(csobj); //load snapshot details
        } else{
            this.setState({isAllowChangeField: true});
            var fieldBaseId = (cresltobj.fieldsList && cresltobj.fieldsList[0]?cresltobj.fieldsList[0].baseFloorLayoutId:0);
            
            let checkfieldobj = (ispaginate?searchobj:cresltobj);
            let fieldIdList = checkfieldobj.fieldsList.map((fielditem) => { return fielditem.uuid; });
            let findobj = {
                baseFloorLayoutId: fieldBaseId,
                fieldUUIDs: fieldIdList,
            }
            // console.log(findobj);

            submitSets(submitCollection.findActiveLayoutPlanogramBulkFieldByUUIDs, findobj, false).then(res => {
                this.setState({isloadedfielddet: true});

                if(res && res.status && res.extra){
                    if(ispaginate){
                        this.updateActiveFieldsList(changeside, res.extra);
                    } else{
                        let fielddeptlist = [];
                        if(res.extra && res.extra.fieldsList && res.extra.fieldsList.length > 0){
                            for (let i = 0; i < res.extra.fieldsList.length; i++) {
                                const fieldobj = res.extra.fieldsList[i];

                                if(fieldobj && fieldobj.department){
                                    let isNotAdded = fielddeptlist.find(x => x.departmentId === fieldobj.department.departmentId);

                                    if(!isNotAdded){
                                        fielddeptlist.push(fieldobj.department);
                                    }
                                }
                            }
                        }
                        
                        this.setState({ 
                            activeViewObj: res.extra, 
                            bkpActiveObj: structuredClone(res.extra),
                            activeFieldDeptList: fielddeptlist,
                            savemodalshow: false 
                        });
                    }

                    this.loadCurrentAndOtherFieldsQty(res.extra, false, null); //load other fields product qty for sales cyle
                    // this.loadRDDetails(res.extra); //load revenue details
                    this.loadRDOverviewDetails(res.extra); //load revenue details
                    this.loadSnapshotDetails(res.extra); //load snapshot details
                } else{
                    this.setState({savemodalshow: false});
                }
            });
        }
    }

    //update active fields list when paginate
    updateActiveFieldsList = (changeside, newfieldobj) => {
        let newFieldsList = newfieldobj.fieldsList[0];
        let newSaveObj = structuredClone(this.state.bkpActiveObj);

        if(changeside === "left"){
            newSaveObj.fieldsList.splice(-1);
            newSaveObj.fieldsList.unshift(newFieldsList);
        } else{
            newSaveObj.fieldsList.shift();
            newSaveObj.fieldsList.push(newFieldsList);
        }

        let fielddeptlist = [];
        if(newSaveObj.fieldsList && newSaveObj.fieldsList.length > 0){
            for (let i = 0; i < newSaveObj.fieldsList.length; i++) {
                const fieldobj = newSaveObj.fieldsList[i];

                if(fieldobj && fieldobj.department){
                    let isNotAdded = fielddeptlist.find(x => x.departmentId === fieldobj.department.departmentId);

                    if(!isNotAdded){
                        fielddeptlist.push(fieldobj.department);
                    }
                }
            }
        }

        this.setState({ 
            activeViewObj: newSaveObj, 
            bkpActiveObj: structuredClone(newSaveObj),
            activeFieldDeptList: fielddeptlist,
            savemodalshow: false 
        });
    }

    //floor draw dementions calculate
    calculateRate(isupdateexist) {
        //console.log(isactiveview);
        if(this.state.saveObj && Object.keys(this.state.saveObj).length > 0){
            var csobj = structuredClone(this.state.saveObj);
            //calculate dimention
            var addedwidth = (this.state.divWidth + 30);
            var dimention = AspectRatioDrawBox(csobj.masterFieldWidth,csobj.masterFieldHeight,addedwidth,this.state.divHeight);
            //current field width/height
            // this.dheight = measureConverter(csobj.masterFieldUom,this.state.displayUOM,csobj.masterFieldHeight) * dimention;
            // this.dwidth = measureConverter(csobj.masterFieldUom,this.state.displayUOM,csobj.masterFieldWidth) * dimention;
            
            this.setState({ viewHeight: this.dheight, displayRatio: dimention, ismdfieldset: false }, () => {
                this.setState({isloadedfielddet: true});
            });
        } 
    }
    //get existing,new products list 
    findExistingNewProductsCount = (mainobj) => {
        if(this._facingCalcTimeout){
            clearTimeout(this._facingCalcTimeout);
        }

        this._facingCalcTimeout = setTimeout(() => {
            this.continueExistingProdCount(mainobj);
        }, 800);
    }

    //continue get count changes
    continueExistingProdCount = (mainobj, _callback) => {
        let existprodlist =  []; //existing and newly added products list
        let warningprodlist = []; //warning product list
        let removedprodlist = this.compareRemovedProdList(true, this.state.historyTabList);
        
        //snapshot data
        let allSnapshotBrandList = this.state.allSnapshotBrandList;
        
        let cshelfs = [];
        if(mainobj && Object.keys(mainobj).length > 0){
            if(mainobj.fieldsList && mainobj.fieldsList.length > 0){
                for (let k = 0; k < mainobj.fieldsList.length; k++) {
                    const csobj  = mainobj.fieldsList[k];

                    //check for overlap products
                    let isOverlapProdAvailable = false;
                    
                    if (csobj.planogramShelfDto) {
                        cshelfs = (csobj.planogramShelfDto?csobj.planogramShelfDto:[]);
                        
                        for (let i = 0; i < cshelfs.length; i++) {
                            const shelf = cshelfs[i];
                            shelf.previewguid = {startX:-1,EndX:-1};
                            
                            shelf.deptWarnList = [];
                            shelf.recWarnList = [];

                            for (var j = 0; j < shelf.planogramProduct.length; j++) {
                                const prodobj = shelf.planogramProduct[j];
                                
                                let deletedProdsCount = 0;
                                //dept warn
                                let isDeptProdFound = false;
                                let deptWarnDetails = {x: 0, y: 0, drawWidth: 0, drawHeight: 0, width: 0, height: 0, uom: 0};
                                
                                let isRecPerWarnFound = false;
                                let firstLocDetails = {x: 0, y: 0, drawWidth: 0, drawHeight: 0};

                                if(!prodobj.isDelete){
                                    let frontfacingqty = 0; //total facing qty of product
                                    let totalprodqty = 0; //total qty of product
                                    let isproddelete = true; //check is product inside blocks/products deleted
                                    
                                    for (var l = 0; l < prodobj.productBlock.length; l++) {
                                        const blockobj = prodobj.productBlock[l];
                                        
                                        var isblockdelete = true; //check block inside locations deleted
                                        for (var m = 0; m < blockobj.productLocations.length; m++) {
                                            const plocobj = blockobj.productLocations[m];
                                            
                                            if(!plocobj.isDelete){
                                                isproddelete = false; 
                                                isblockdelete = false;
                    
                                                //check is bottom location and add width to front faceing totals
                                                var allowbottom = checkProductIsInBottom(shelf.y, shelf.drawHeight, plocobj.y, plocobj.drawHeight);
                                                if(allowbottom){ 
                                                    frontfacingqty = (frontfacingqty + 1); 
                                                }
                                                totalprodqty = totalprodqty + 1;

                                                //set as dept prod
                                                if(!isDeptProdFound && prodobj.productInfo.isDepartmentProduct){
                                                    isDeptProdFound = true;
                                                    // plocobj.showRecWarning = true;

                                                    deptWarnDetails.x = plocobj.x;
                                                    deptWarnDetails.y = plocobj.y;
                                                    deptWarnDetails.width = plocobj.productWidth;
                                                    deptWarnDetails.height = plocobj.productHeight;
                                                    deptWarnDetails.uom = plocobj.productUom;
                                                    deptWarnDetails.drawWidth = plocobj.drawWidth;
                                                    deptWarnDetails.drawHeight = plocobj.drawHeight;
                                                }

                                                if(!isRecPerWarnFound && firstLocDetails.drawWidth === 0){
                                                    isRecPerWarnFound = true;

                                                    firstLocDetails.x = plocobj.x;
                                                    firstLocDetails.y = plocobj.y;
                                                    firstLocDetails.drawWidth = plocobj.drawWidth;
                                                    firstLocDetails.drawHeight = plocobj.drawHeight;
                                                }

                                                if(plocobj.isRightSideOverLap && plocobj.overLappingDto && !plocobj.overLappingDto.isDelete){ //
                                                    isOverlapProdAvailable = true;
                                                }
                                                
                                            } else{
                                                deletedProdsCount = (deletedProdsCount + 1);
                                            }
                                        }
                                        if(isblockdelete){ 
                                            blockobj.isDelete = true; 
                                        }
                    
                                        if(!blockobj.isDelete){ 
                                            isproddelete = false; 
                                        }
                                    }

                                    prodobj["productFacingQty"] = frontfacingqty;
                                    prodobj["productTotalQty"] = totalprodqty;
                                    
                                    if(isproddelete){ 
                                        prodobj["isDelete"] = true; 
                                        prodobj["isNew"] = false; 
                                    }

                                    let pushProdObj = structuredClone(prodobj);
                                    if(!pushProdObj.isDelete){
                                        //add to existing prodlist
                                        let checkalrdyadded = existprodlist.findIndex(z => z.existviewtype === 1 && z.productInfo.id === pushProdObj.productInfo.id);
                                        
                                        if(checkalrdyadded === -1){
                                            if(!pushProdObj.isFieldCopy && pushProdObj.isNew){
                                                let checkalrdynew = existprodlist.findIndex(z => z.productInfo.id === pushProdObj.productInfo.id);

                                                if(checkalrdynew === -1){
                                                    pushProdObj["fieldUUID"] = csobj.f_uuid;
                                                    pushProdObj["existviewtype"] = 2; //if product is new item
                                                    existprodlist.push(pushProdObj); //this prod object use to show new prods and dragndrop
                                                } else{
                                                    let foundnewprod = existprodlist[checkalrdynew];
                                                    foundnewprod.productFacingQty = (foundnewprod.productFacingQty + pushProdObj.productFacingQty);
                                                    foundnewprod.productTotalQty = (foundnewprod.productTotalQty + pushProdObj.productTotalQty);
                                                    foundnewprod.loadingProductFacingQty = (foundnewprod.loadingProductFacingQty + (pushProdObj.loadingProductFacingQty?pushProdObj.loadingProductFacingQty:0));
                                                }
                                            } else{
                                                pushProdObj["fieldUUID"] = csobj.f_uuid;
                                                pushProdObj["existviewtype"] = 1; //if product is existing item
                                                existprodlist.push(pushProdObj); //this prod object use to show existing prods and dragndrop
                                            }
                                            
                                            //add prods to warning list
                                            let prodinfo = pushProdObj.productInfo;
                                            if(prodinfo && prodinfo.isDepartmentProduct){
                                                let newwarobj = { 
                                                    barcode: prodinfo.barcode, productId: prodinfo.id, productName: prodinfo.productName, 
                                                    department: (prodinfo.department?prodinfo.department:[]),
                                                    brandName: (prodinfo.brandName?prodinfo.brandName:"N/A"), imgUrl: prodinfo.imageUrl
                                                };
                                                warningprodlist.push(newwarobj);

                                                //dept warning
                                                // prodobj.showDeptWarning = true;
                                                // prodobj.deptWarnDetails = deptWarnDetails;
                                                shelf.deptWarnList.push(deptWarnDetails);
                                            }

                                            //rec% warn changes
                                            let findSnapObj = allSnapshotBrandList.find(x => (x.departmentId === prodobj.productInfo.departmentId && x.categoryId === prodobj.categoryLevel.categoryId && x.subcategoryId === prodobj.subcategoryLevel.subcategoryId && x.brandId === prodobj.brandLevel.brandId));
                                            // console.log(findSnapObj);
                                            
                                            if(findSnapObj){
                                                let recSpace = findSnapObj.recommendedSpace;

                                                if(recSpace === 0){
                                                    shelf.recWarnList.push(firstLocDetails);
                                                    // prodobj.showRecWarning = true;
                                                    // prodobj.recWarningDetails = firstLocDetails;
                                                }
                                            }

                                        } else{
                                            let foundexistprod = existprodlist[checkalrdyadded];
                                            foundexistprod.productFacingQty = (foundexistprod.productFacingQty + pushProdObj.productFacingQty);
                                            foundexistprod.productTotalQty = (foundexistprod.productTotalQty + pushProdObj.productTotalQty);
                                            foundexistprod.loadingProductFacingQty = (foundexistprod.loadingProductFacingQty + (pushProdObj.loadingProductFacingQty?pushProdObj.loadingProductFacingQty:0));
                                        }     
                                    }
                                } else{
                                    let deletedprodqty = 0;
                                    for (let l = 0; l < prodobj.productBlock.length; l++) {
                                        const blockobj = prodobj.productBlock[l];

                                        for (let m = 0; m < blockobj.productLocations.length; m++) {
                                            const plocobj = blockobj.productLocations[m];
                                            
                                            if(plocobj.isDelete){
                                                deletedprodqty = (deletedprodqty + 1);
                                            }
                                        }
                                    }
                                    deletedProdsCount = deletedprodqty;

                                    //add to existing prodlist
                                    let pushProdObj = structuredClone(prodobj);
                                    let checkalrdyadded = existprodlist.findIndex(z => z.existviewtype === 1 && z.productInfo.id === pushProdObj.productInfo.id);
                                    // console.log(checkalrdyadded);

                                    if(checkalrdyadded > -1){
                                        let foundexistprod = existprodlist[checkalrdyadded];
                                        foundexistprod.loadingProductFacingQty = (foundexistprod.loadingProductFacingQty + (pushProdObj.loadingProductFacingQty?pushProdObj.loadingProductFacingQty:0));
                                    }
                                }
                                
                                if(deletedProdsCount > 0){
                                    let pushProdObj = JSON.parse(JSON.stringify(prodobj));
                                    removedprodlist = this.compareRemovedProdList(false, removedprodlist, pushProdObj, deletedProdsCount);
                                }
                            }
                        }
                    } 
                    
                    csobj["isOverlapProdAvailable"] = isOverlapProdAvailable;
                }
            }
        }

        //all added prods of layout
        let allLayoutUsedProds = this.state.allLayoutUsedProds;

        //check existing prodlist for empty totalqty and remove item
        let newexistprods = [];
        for (let e = 0; e < existprodlist.length; e++) {
            if(existprodlist[e].productTotalQty > 0){
                newexistprods.push(existprodlist[e]);

                let isItInAllList = allLayoutUsedProds.find(x => x.barcode === existprodlist[e].productInfo.barcode);
                if(!isItInAllList){
                    allLayoutUsedProds.push({ 
                        barcode: existprodlist[e].productInfo.barcode,
                        facingQty: existprodlist[e].productFacingQty,
                        id: existprodlist[e].productInfo.id,
                        isNew: true
                    });
                }
            }
        }

        //update newly added prods
        let oldNewUsedProds = allLayoutUsedProds.filter(x => x.isNew);
        let newAllUsedProds = allLayoutUsedProds.filter(x => !x.isNew);

        for (let l = 0; l < oldNewUsedProds.length; l++) {
            const allusedprod = oldNewUsedProds[l];
            let isAvailableInExisting = existprodlist.find(x => x.productInfo.barcode === allusedprod.barcode);
            if(isAvailableInExisting){
                newAllUsedProds.push(allusedprod);
            }
        }

        let existingProdList = existprodlist.filter(z => z.existviewtype === 1);
        let newProdList = existprodlist.filter(z => z.existviewtype === 2);
        for (let i = 0; i < newProdList.length; i++) {
            const newprodobj = newProdList[i];
            let isAvailableInExisting = existingProdList.findIndex(x => x.productInfo.id === newprodobj.productInfo.id);

            if(isAvailableInExisting > -1){
                existingProdList[isAvailableInExisting].productFacingQty += newprodobj.productFacingQty;
                existingProdList[isAvailableInExisting].productTotalQty += newprodobj.productTotalQty;
            } else{
                existingProdList.push(newprodobj);
            }
        }
        newexistprods = existingProdList;

        if(_callback){
            _callback(newexistprods);
        } else{
            // console.log(mainobj);

            this.setState({ 
                saveObj: mainobj, 
                existnewprodlist: newexistprods, 
                warningProdList: warningprodlist, 
                historyTabList: removedprodlist,
                allLayoutUsedProds: newAllUsedProds,
            }, () => {
                this.compareImportedProds();
            });    
        }
    }
    //compare and add remove prod
    compareRemovedProdList = (isclear, removedprodlist, pushProdObj, deletedProdsCount) => {
        if(isclear){
            for (let i = 0; i < removedprodlist.length; i++) {
                removedprodlist[i]["prodRemoveQty"] = 0;
            }
        } else{
            let isprodremoveadded = removedprodlist.findIndex(rmvprod => rmvprod.id === pushProdObj.productInfo.id);
            
            if(isprodremoveadded > -1){
                let foundremoveprod = removedprodlist[isprodremoveadded];
                foundremoveprod.prodRemoveQty = (foundremoveprod.prodRemoveQty + deletedProdsCount);
            } else{
                let newprodobj = pushProdObj.productInfo;
                newprodobj["prodRemoveQty"] = deletedProdsCount;

                removedprodlist.push(newprodobj);
            }    
        }

        return removedprodlist;
    }
    //handle back link
    handleGoBack = () =>{
        this.props.history.push("/planograms/details");
    }

    loadCurrentAndOtherFieldsQty = (activeobj , isUpdating, nloadeddata) => {

        let saveObj = this.state.saveObj;

        let allFieldsProductQty = [];

        let floorLayoutId = saveObj.floorLayoutId;

        let fieldIdAndUUIds = [];

        //load current fields' products department wise

        let currentFieldsProductQty = [];

        const departmentMap = new Map();

        let baseFloorLayoutId = activeobj.floorLayoutId;

        for (const field of activeobj.fieldsList) {
            if(field){

                let fobj = {
                    id: field.id,
                    uuid: field.uuid
                }

                fieldIdAndUUIds.push(fobj);

                // console.log(field);

                let departmentId = field.department.departmentId;
                let masterFieldDepth = field.masterFieldDepth;
                let masterFieldUom = field.masterFieldUom;

                if (!departmentMap.has(departmentId)) {
                    departmentMap.set(departmentId, []);
                }

                for (const shelf of field.planogramShelfDto) {
                    
                    for (const product of shelf.planogramProduct) {
                        
                        const existingProduct = departmentMap.get(departmentId).find(p => p.productId === product.productInfo.id);
                        
                        if (existingProduct) {
                            existingProduct.productQty += ((Math.floor(measureConverter(masterFieldUom, uomList.cm, masterFieldDepth)/measureConverter(product.productUom, uomList.cm, product.productDepth))) * product.productTotalQty);
                        } else {
                            departmentMap.get(departmentId).push({ productId: product.productInfo.id, productQty: ((Math.floor(measureConverter(masterFieldUom, uomList.cm, masterFieldDepth)/measureConverter(product.productUom, uomList.cm, product.productDepth))) * product.productTotalQty) });
                        }

                    }

                }
            }
        }

        departmentMap.forEach((products, departmentId) => {
            currentFieldsProductQty.push({ departmentId, products });
        });
        
        //load other fields' products department wise

        let deptIds = this.state.fieldDeptList.map(x => x.departmentId);

        if(floorLayoutId && fieldIdAndUUIds.length>0 && deptIds.length>0){
            
            let fieldList = (this.props.planogramState && this.props.planogramState.pgramFieldDetails?this.props.planogramState.pgramFieldDetails.fieldList:[]);

            let reqObj = {
                floorLayoutId : floorLayoutId,
                currentFields : this.state.fieldStatus !== "DRAFT" ? fieldIdAndUUIds : fieldList.map((fielditem) => { return {id: fielditem.id, uuid: fielditem.uuid} }),
                departmentIds : deptIds,
                baseFloorLayoutId : baseFloorLayoutId
            }

            if(!isUpdating){

                this.setState({isrpdetailsloading: true});

                submitSets(submitCollection.getOtherFieldsProductQty, reqObj, false).then(res => {
                    if(res && res.status && res.extra){
    
                        let otherFieldsProductQty = [];
                        let activeDate = null;
                        let inactivatedDate = null;
    
                        otherFieldsProductQty =  res.extra.productQty ? res.extra.productQty : [];
                        activeDate =  res.extra.startDate ? new Date(res.extra.startDate) : null;
                        inactivatedDate =  res.extra.endDate ? new Date(res.extra.endDate) : null;
    
                        allFieldsProductQty = this.getAllFieldProductQty(currentFieldsProductQty, otherFieldsProductQty);
                        
                        this.setState({
                            currentAndOtherFieldsProductQty: allFieldsProductQty, 
                            otherFieldsProductQty: otherFieldsProductQty, 
                            saleCycledatePeriodRange: {fromDate: activeDate, toDate: inactivatedDate ? inactivatedDate : new Date()}
                        },()=>{
                            this.loadRDDetails(activeobj); //load revenue details
                        });
                    }
                });
                
            }else{

                let otherFieldsProductQty =  this.state.otherFieldsProductQty ? this.state.otherFieldsProductQty : [];

                allFieldsProductQty = this.getAllFieldProductQty(currentFieldsProductQty, otherFieldsProductQty);
                
                this.setState({currentAndOtherFieldsProductQty : allFieldsProductQty},()=>{
                    
                    this.calculateSaleCycleDepwise(nloadeddata);

                    /* var curprodlist = (nloadeddata&&nloadeddata.productSaleInformation?nloadeddata.productSaleInformation:[]);
                    
                    if(curprodlist.length > 0){
                        curprodlist = curprodlist.sort(this.sortRevenueList);

                        for (let i = 0; i < curprodlist.length; i++) {
                            const cproditem = curprodlist[i];
                            //if current sale info available
                            if(cproditem.currentSaleInformation){
                                cproditem.currentSaleInformation["oldProductQty"] = cproditem.currentSaleInformation.productQty;
                                
                            } 
                            //if effected sale info availble
                            if(cproditem.effectedSaleInformation){ 
                                cproditem.effectedSaleInformation["oldProductQty"] = cproditem.effectedSaleInformation.productQty;
                            }
                        }
                    }
                    nloadeddata["productSaleInformation"] = curprodlist; */

                    // this.setState({ rploadedrevenue: nloadeddata, isrpdetailsloading: false });

                });
            }
            
        }

    }

    getAllFieldProductQty = (currentFieldsProductQty, otherFieldsProductQty) => {

        //combining both arrays
        let allFieldsProductQty = [];

        let combinedArray = currentFieldsProductQty.concat(otherFieldsProductQty);

        let sumByDepartmentAndProdId = {};

        combinedArray.forEach((item) => {
            const departmentId = item.departmentId;
            item.products.forEach((product) => {
            const productId = product.productId;
            const productQty = product.productQty;
        
            if (!sumByDepartmentAndProdId[departmentId]) {
                sumByDepartmentAndProdId[departmentId] = { departmentId:departmentId, products: [] };
            }
        
            const existingProduct = sumByDepartmentAndProdId[departmentId].products.find(
                (p) => p.productId === productId
            );
        
            if (existingProduct) {
                existingProduct.productQty += productQty;
            } else {
                sumByDepartmentAndProdId[departmentId].products.push({
                productId:productId,
                productQty:productQty,
                saleQty:0,
                saleCycle:0
                });
            }
            });
        });

        allFieldsProductQty = Object.values(sumByDepartmentAndProdId);

        return allFieldsProductQty;
        
    }


    //#PLG-DU-PS-H01 load revenue details change details
    loadRDDetails = (activeobj) => {
        let saveobj = this.state.saveObj;
        let fieldobj = (this.props.planogramState && this.props.planogramState.pgramFieldDetails?this.props.planogramState.pgramFieldDetails:null);
        // console.log(fieldobj);

        if(fieldobj){
            let deptIds = [];
            for (let i = 0; i < fieldobj.fieldList.length; i++) {
                const allfieldobj = fieldobj.fieldList[i];
                if(allfieldobj.department){
                    deptIds.push(allfieldobj.department.departmentId);
                }
            }

            //search object
            let cdaterange = this.state.datePeriodRange;
            let obj = { 
                activeFloorLayoutId: activeobj.floorLayoutId,
                field: fieldobj.id,
                departmentIds: deptIds,
                startDate: (this.state.datePeriodType === "DATERANGE"?cdaterange.fromDate:null),
                endDate: (this.state.datePeriodType === "DATERANGE"?cdaterange.toDate:null)
            };

            //draftingFloorLayoutId
            if(this.state.fieldStatus === "DRAFT"){
                // console.log(saveobj.floorLayoutId);
                obj.draftingFloorLayoutId = saveobj.floorLayoutId;
            }

            var submitpath = submitCollection.findPlanogramCurrentSales;

            //if current field is a draft
            if(this.state.fieldStatus==="DRAFT"){ // || this.state.fieldStatus==="MERGE" || this.state.fieldStatus==="CONFIRMED"
                submitpath = submitCollection.findPlanogramEditmodeSales;
                obj["draftingFieldId"] = fieldobj.id;
            }

            this.setState({isrpdetailsloading: true}); //loading sale details gif shows
            submitSets(submitpath, obj, false).then(res => {
                this.setState({savemodalshow: false});
                // console.log(res);
                if(res && res.status && res.extra){
                    var nloadeddata = res.extra;
                    this.calculateSaleCycleDepwise(nloadeddata);
                    
                    if(nloadeddata && nloadeddata.length > 0){
                        for (let i = 0; i < nloadeddata.length; i++) {
                            const deptsaleitem = nloadeddata[i];
                            
                            let curprodlist = (deptsaleitem && deptsaleitem.productSaleInformation?deptsaleitem.productSaleInformation:[]);
                            curprodlist = curprodlist.sort(this.sortRevenueList);

                            for (let i = 0; i < curprodlist.length; i++) {
                                const cproditem = curprodlist[i];
                                //if current sale info available
                                if(cproditem.currentSaleInformation){
                                    cproditem.currentSaleInformation["oldProductQty"] = cproditem.currentSaleInformation.productQty;
                                    
                                } 
                                //if effected sale info availble
                                if(cproditem.effectedSaleInformation){ 
                                    cproditem.effectedSaleInformation["oldProductQty"] = cproditem.effectedSaleInformation.productQty;
                                }
                            }
                        }
                    }

                    // console.log(nloadeddata);
                    this.setState({ rploadedrevenue: nloadeddata, isrpdetailsloading: false }, () => {
                        this.changeRDProfitTotal();
                    });
                } else{
                    this.setState({ isrpdetailsloading: false });
                }
            });
        }
    }


    calculateSaleCycleDepwise = (saleProdListObj) => {

        let prdQtyObj = this.state.currentAndOtherFieldsProductQty;

        let dates = this.state.saleCycledatePeriodRange;
        
        let fromDate = new Date(dates.fromDate);
        let toDate = new Date(dates.toDate);

        if(fromDate > toDate){
            toDate = new Date();
        }

        // if(this.state.datePeriodType==="DATERANGE"){
        //     let daterangeObj = this.state.datePeriodRange;

        //     fromDate = new Date(daterangeObj.fromDate);
        //     toDate = new Date(daterangeObj.toDate);

        //     if(fromDate > toDate){
        //         toDate = new Date();
        //     }
        // }

        fromDate.setHours(0, 0, 0, 0);
        toDate.setHours(0, 0, 0, 0);

        let timeDiff = toDate.getTime() - fromDate.getTime();

        let dayCount = timeDiff / (1000 * 60 * 60 * 24);

        if(saleProdListObj && saleProdListObj.length>0){

            for (const dep of prdQtyObj) {
    
                let existDep = saleProdListObj.find((i)=> i.departmentId === dep.departmentId);

                if(existDep){
                    if(dep.products && dep.products.length > 0){
    
                        for (const prod of dep.products) {  
                            
                            let existPrd = existDep.productSaleInformation.find((i)=> i.productId === prod.productId);
    
                            if(existPrd){
                                let saleinfo = (existPrd.currentSaleInformation?existPrd.currentSaleInformation:existPrd.effectedSaleInformation);
                                // prod.saleQty = parseFloat((saleinfo.revenuePerProductQty).toFixed(2));
        
                                // prod.saleCycle = dayCount > 0 && prod.sale > 0 ? parseFloat(((prod.productQty)/((saleinfo.currentSale ? saleinfo.currentSale : saleinfo.revenue)/dayCount)).toFixed(2)) : 0;
                                prod.saleCycle = dayCount > 0 && saleinfo.currentSaleQty  > 0  ? parseFloat(((prod.productQty)/(saleinfo.currentSaleQty/dayCount)).toFixed(2)) : 0;
        
                                existPrd["saleCycle"] = prod.saleCycle;
                            }
    
                        }
    
                    }
                }

            }

        }

        this.setState({saleCycleObj : prdQtyObj});
    }

    //#PLG-DU-OV-H01 load revenue details change details
    loadRDOverviewDetails = (cobj) => {
        this.setState({isrpoverviewloading: true}, () => {
            let deptIds = this.state.fieldDeptList.map(x => x.departmentId);

            if(deptIds.length > 0){
                let cdaterange = this.state.datePeriodRange;
                let obj = {
                    departmentIds: deptIds, 
                    storeId: this.state.selStoreId, 
                    activeFloorLayoutId: cobj.floorLayoutId,
                    startDate: (this.state.datePeriodType === "DATERANGE"?cdaterange.fromDate:null),
                    endDate: (this.state.datePeriodType === "DATERANGE"?cdaterange.toDate:null)
                };

                submitSets(submitCollection.findPlanogramOverViewSalesCR, obj, false).then(res => {
                    // console.log(res);
                    if(res && res.status && res.extra && res.extra.length > 0){
                        this.setState({rploadedoverview: res.extra, isrpoverviewloading: false});
                    } else{
                        this.setState({isrpoverviewloading: false});
                    }
                });
            } else{
                this.setState({isrpoverviewloading: false});
            } 
        });
    }

    //load snapshot details for floor details
    loadSnapshotDetails = (activeobj) => {
        this.setState({issnapshotloading: true}, () => {
            let saveObj = this.state.saveObj;
            let deptIds = this.state.snapshotDeptsList.map(x => x.departmentId);
    
            // let fieldIdList = saveObj.fieldsList.map(x => x.id);
            // console.log(fieldIdList);
            
            if(deptIds.length > 0){
                let obj = {
                    departments: deptIds,  
                    floorlayoutId: saveObj.floorLayoutId,
                    activeFloorlayoutId: (activeobj?activeobj.floorLayoutId:0),
                    // floorLayoutHasFieldIds: fieldIdList
                };
                
                submitSets(submitCollection.loadPlanogramPercentageSuggestion, obj, false).then(res => {
                    // console.log(res);
                    if(res && res.status && res.extra && res.extra.departments && res.extra.departments.length > 0){
                        setTimeout(() => {
                            this.compareSnapshotDetails(res.extra.departments);
                        }, 1500);
                    } else{
                        this.setState({ 
                            bottomCatSubBrands: [],
                            hightlightSnapShotList: { categories: [], subcategories: [], brands: [] },
                            allSnapshotBrandList: [],
                            issnapshotloading: false
                        });
                    }
                });
            } else{
                this.setState({issnapshotloading: false});
            } 
        });
    }

    //compare loaded snapshot details
    compareSnapshotDetails = (deptlist) => {
        let datalist = { departments: [], categories: [], subcategories: [] };
        let addedFilters = { departmentId: 0, categoryId: 0, subcategoryId: 0 };
        let existingProdList = this.state.existnewprodlist;
        let showingSnapshotList = [];
        let allBrandsList = [];

        for (let i = 0; i < deptlist.length; i++) {
            const deptobj = deptlist[i];
            deptobj.departmentActualWidth = (measureConverter(deptobj.uom, this.state.displayUOM, deptobj.departmentActualWidth) * this.state.displayRatio);

            datalist.departments.push({ departmentId: deptobj.departmentId, departmentName: deptobj.departmentName });

            let availableCatsList = deptobj.categories.filter(x => x.space > 0);
            for (let j = 0; j < availableCatsList.length; j++) {
                const catobj = availableCatsList[j];
                catobj.categoryActualWidth = (measureConverter(deptobj.uom, this.state.displayUOM, catobj.categoryActualWidth) * this.state.displayRatio);

                catobj["departmentId"] = deptobj.departmentId;

                //check categories is in current viewing fields
                let iscatinfield = existingProdList.find(x => x.categoryLevel.categoryId === catobj.categoryId);
                catobj.isshowitem = (iscatinfield?true:false);

                let availableSCatsList = catobj.subcategories.filter(x => x.space > 0);
                for (let l = 0; l < availableSCatsList.length; l++) {
                    const scatobj = availableSCatsList[l];
                    scatobj.subcategoryActualWidth = (measureConverter(deptobj.uom, this.state.displayUOM, scatobj.subcategoryActualWidth) * this.state.displayRatio);

                    scatobj["departmentId"] = deptobj.departmentId;
                    scatobj["categoryId"] = catobj.categoryId;
                    scatobj["isCatRule"] = catobj.isRule;
                    scatobj["catRuleType"] = catobj.ruleType;

                    //check sub categories is in current viewing fields
                    let isscatinfield = existingProdList.find(x => x.categoryLevel.categoryId === catobj.categoryId && x.subcategoryLevel.subcategoryId === scatobj.subcategoryId);
                    scatobj.isshowitem = (isscatinfield?true:false);

                    let availableBrandList = scatobj.brands.filter(x => x.space > 0);
                    for (let k = 0; k < availableBrandList.length; k++) {
                        const brandobj = availableBrandList[k];
                        brandobj.brandActualWidth = (measureConverter(deptobj.uom, this.state.displayUOM, brandobj.brandActualWidth) * this.state.displayRatio);

                        brandobj["departmentId"] = deptobj.departmentId;

                        brandobj["categoryId"] = catobj.categoryId;
                        brandobj["isCatRule"] = catobj.isRule;
                        brandobj["catRuleType"] = catobj.ruleType;

                        brandobj["subcategoryId"] = scatobj.subcategoryId;
                        brandobj["isScatRule"] = scatobj.isRule;
                        brandobj["scatRuleType"] = scatobj.ruleType;

                        //check brand is in current viewing fields
                        let isbrandinfield = existingProdList.find(x => x.categoryLevel.categoryId === catobj.categoryId && x.subcategoryLevel.subcategoryId === scatobj.subcategoryId && x.brandLevel.brandId === brandobj.brandId);
                        brandobj.isshowitem = (isbrandinfield?true:false);

                        allBrandsList.push(brandobj);
                    }
                }

                if(i === 0 && catobj.space > 0){
                    datalist.categories.push({ categoryId: catobj.categoryId, categoryName: catobj.categoryName, space: catobj.space, isRule: catobj.isRule, ruleType: catobj.ruleType });
                }
            }

            deptobj.categories = availableCatsList;

            if(i === 0){
                addedFilters.departmentId = deptobj.departmentId;
                showingSnapshotList = deptobj.categories;
            }
        }
        
        // console.log(deptlist);
        this.setState({ 
            addedFilters: addedFilters,
            bottomCatSubBrands: deptlist, 
            showingSnapshotList: showingSnapshotList,
            snapshotFilters: datalist,
            hightlightSnapShotList: { categories: [], subcategories: [], brands: [] }, 
            allSnapshotBrandList: allBrandsList,
            issnapshotloading: false
        }, () => {
            this.continueExistingProdCount(this.state.saveObj);
        });
    }

    //#PLG-DU-PP-H01 view propose list
    handleViewProposeList = (isshow,isreset) => {
        if(isshow === "propose"){
          if(this.state.isproposeavailable && !isreset){
            this.setState({showNewTabType: isshow, proposeselecttab: "key-2"});
          } else{
            let fieldStatus = this.state.fieldStatus;
            let saveObj = this.state.saveObj;
            let activeObj = this.state.activeViewObj;

            if(fieldStatus === "ACTIVE" || (activeObj && activeObj.fieldsList && activeObj.fieldsList.length > 0)){
                let obj = {
                    floorLayoutId: saveObj.floorLayoutId,
                    fieldList: [],
                };

                for (let i = 0; i < saveObj.fieldsList.length; i++) {
                    const fieldobj = saveObj.fieldsList[i];
                    let AvailableActiveField = activeObj.fieldsList.find(x => x && x.f_uuid === fieldobj.f_uuid);

                    if(AvailableActiveField){
                        obj.fieldList.push({ 
                            draftingFloorFieldId: fieldobj.id,
                            activeFloorFieldId: AvailableActiveField.id,
                        });
                    } else{
                        obj.fieldList.push({ 
                            draftingFloorFieldId: fieldobj.id,
                            activeFloorFieldId: 0,
                        });
                    }
                }
    
                this.setState({isProposeDataLoading: true});
                //load current propose data
                submitSets(submitCollection.findFloorLayoutFloorFieldSuggestionProductsForBulkField, obj, false).then(res => {
                    this.setState({isProposeDataLoading: false});
                    if(res && res.extra && res.extra.fieldList && res.extra.fieldList.length > 0){
                        this.setState({
                            showNewTabType: isshow, 
                            loadedProposeList: res.extra, 
                            isproposeavailable: true, 
                            proposeselecttab: "key-2" 
                        }, () => {
                            this.checkProposeAlreadyAdded();
                        });
                    } else{
                      alertService.error(this.props.t("NOT_AVAILABLE_ANY_PROPOSAL_ITEMS"));
                    }
                });
            } else{
                alertService.error(this.props.t("ACTIVE_PG_DETAILS_NOT_FOUND"));
            }
          }
        } else{
          this.setState({showNewTabType: isshow});
        }
    }
    //#PLG-DU-PP-H02 check items removed/added before load propose data
    checkProposeAlreadyAdded = () => {
        let existprodlist = this.state.existnewprodlist;
        let allproposedata = this.state.loadedProposeList;

        for (let l = 0; l < allproposedata.fieldList.length; l++) {
            const cproposedata = allproposedata.fieldList[l];
            
            let removeproplist = (cproposedata&&cproposedata.removeItemArray?cproposedata.removeItemArray:[]);
            let addproplist = (cproposedata&&cproposedata.addingItemArray?cproposedata.addingItemArray:[]);
    
            //remove items
            for (let i = 0; i < removeproplist.length; i++) {
                const isalreadyremoved = existprodlist && existprodlist.length > 0?existprodlist.findIndex(x => x.productInfo.id === removeproplist[i].itemId):-1;
                if(isalreadyremoved === -1){
                    removeproplist[i]["applyStatus"] = "apply";
                }
            }
            
            //add items
            for (let j = 0; j < addproplist.length; j++) {
                const isalreadyremoved = existprodlist && existprodlist.length > 0?existprodlist.findIndex(x => x.productInfo.id === addproplist[j].itemId):-1;
                if(isalreadyremoved > -1){
                    addproplist[j]["applyStatus"] = "apply";
                }

                const cprod = addproplist[j];

                const newprodinfo = {
                    id: cprod.itemId, 
                    barcode: cprod.itemBarcode, 
                    productName: cprod.itemName, 
                    imageUrl: cprod.itemImageUrl, 
                    width: cprod.productWidth, 
                    height: cprod.productHeight, 
                    uom: cprod.productUom, 
                    depth: cprod.productDepth,
                    isStackable: cprod.isStackable,
                    maxStackableCount: cprod.maxStackableCount,
                    brandId: cprod.brandId,
                    brandName: cprod.brandName,
                    brandColor: cprod.brandColor,
                    supplierId: cprod.supplierId,
                    supplierName: cprod.supplierName,
                    departmentId: cprod.departmentId,
                    departmentName: cprod.departmentName,
                    departmentColor: cprod.departmentColor,
                    categoryId: cprod.categoryId,
                    categoryName: cprod.categoryName,
                    categoryColor: cprod.categoryColor,
                    subcategoryId: cprod.subcategoryId,
                    subcategoryName: cprod.subcategoryId,
                    subcategoryColor: cprod.subcategoryColor,
                    department: cprod.department,
                    isDepartmentProduct: cprod.isDepartmentProduct
                
                };
                addproplist[j]["productInfo"] = newprodinfo;
            }
        }

        this.setState({ loadedProposeList: allproposedata });
    }
    
    //copy barcode to clipboard message show
    copyToClipboard = (ctxt) => {
        alertService.info(this.props.t("COPIED_TO_CLIP_BOARD"));
    }

    //handle propose tabs
    handleProposeTabs = (selectevent) => {
      this.setState({ proposeselecttab: selectevent});
    }
    //handle change left right field
    handleChangeLeftRightField = (csideobj) => {
        //shows warning changes available when existing from current field
        if (this.state.ischangesavailable) {
            window.onbeforeunload = () => false
        } else {
            window.onbeforeunload = undefined
        }

        csideobj["isredirect"] = true;
        this.props.setFieldView(csideobj);
        this.props.history.push('/'); 
    }
    //preview product details with large image
    handleProductImgPreview = (prod, type) => {
        this.setState({ showPreviewImageModal: type, previewProductId: (prod?prod.id:0)});
    }
    //toggle department products warnings sidebar
    toggleWarningSidebar = () => {
        this.setState({ showWarningSidebar: !this.state.showWarningSidebar });
    }
    //add new item to warning list
    addItemstoWarning = (prodobj) => {
        if(prodobj && prodobj.isDepartmentProduct){
            let newwarobj = { barcode: prodobj.barcode, productId: prodobj.id, productName: prodobj.productName, department: prodobj.department,
            brandName: prodobj.brandName, imgUrl: prodobj.imageUrl};
            let allwarnlist = this.state.warningProdList;

            let findaddedidx = allwarnlist.findIndex(x => x.productId === newwarobj.productId);
            if(findaddedidx > -1){
                allwarnlist[findaddedidx] = newwarobj;
            } else{
                allwarnlist.push(newwarobj);
            }

            this.setState({ warningProdList: allwarnlist }, () => {
                //if not added already
                if(findaddedidx === -1){
                    this.toggleSingleProd(prodobj); //show warning modal if department available
                }
            });
        }
    }

    //toggle preview item
    toggleSingleProd = (warnobj) => {
        //console.log(warnobj);
        if(!warnobj || (warnobj && warnobj.isDepartmentProduct && warnobj.department.length > 0)){
            this.setState({ showSingleProdWarning: !this.state.showSingleProdWarning, warningProdItem: warnobj });
        }
    }

    toggleFullScreenView = (_callback, isshow) => {
        let viewFullSaveObj = structuredClone(this.state.saveObj);
        let fullscreenobj = (this.state.isPendingExport?this.state.fullScreenPreviewObj:convertBackSaveObj(viewFullSaveObj, this.state.displayRatio));
        // console.log(fullscreenobj);

        this.setState({ showFullScreenEditView: (isshow !== undefined?isshow:!this.state.showFullScreenEditView) }, () => {
            if(this.state.showFullScreenEditView){
                this.setState({ fullScreenPreviewObj: fullscreenobj });
            } else{
                this.setState({ saveObj: fullscreenobj });
            }

            if(_callback){
                _callback();
            }
        });
    }
    //
    updateSingleCutProduct = (dragprod, isremove, cidx, cparentidx) => {
        // console.log(dragprod);
        let cutarray = this.state.clipBoardList;

        if(!isremove){
            let changingParent = cutarray.clipboardData[dragprod.clipParent];
            let changingDept = changingParent.clipboardData[dragprod.clipDeptIdx];
            let changingShelf = changingDept.shelf[dragprod.clipShelfIdx];
            let changingitem = changingShelf.products[dragprod.clipProdIdx];

            let checkChangeItem = structuredClone(changingitem);

            if(changingitem.id > 0){
                changingitem.isDelete = true;
            } else{
                changingShelf.products.splice(dragprod.clipProdIdx,1);
            }

            //get save y level available prods
            let yLevelAvailableProds = changingShelf.products.filter(yitem => !yitem.isDelete && yitem.startingYPoint <= checkChangeItem.startingYPoint);
            if(yLevelAvailableProds.length === 0){
                let reduceyamount = roundOffDecimal(checkChangeItem.drawHeight, 2);
                for (let l = 0; l < changingShelf.products.length; l++) {
                    const shelfprod = changingShelf.products[l];
                    
                    if(!shelfprod.isDelete && checkChangeItem.startingYPoint < shelfprod.startingYPoint){
                        shelfprod.startingYPoint = (shelfprod.startingYPoint - reduceyamount);
                    }
                }
            }
            
            /* let reducexamount = 0;
            for (let l = 0; l < changingShelf.products.length; l++) {
                const shelfprod = changingShelf.products[l];
                
                if(l !== dragprod.clipProdIdx){
                    if(shelfprod.startingXPoint !== (newxstart - shelfprod.drawWidth)){
                        shelfprod.startingXPoint = newxstart;
                    
                        newxstart = (shelfprod.startingXPoint + shelfprod.drawWidth);
                    } else{
                        shelfprod.startingXPoint = newxstart;
                    }
                } else{
                    reducexamount = shelfprod.drawWidth;
                }
            } */

            let availableProdCount = changingShelf.products.filter(shelfprods => !shelfprods.isDelete); 
            
            if(availableProdCount.length > 0){
                // let prevwidth = structuredClone(changingShelf.width);
                // let prevheight = structuredClone(changingShelf.height);

                let sorttolowy = availableProdCount.sort((a,b) => a.startingYPoint - b.startingYPoint);
                let lowyprody = sorttolowy[0].startingYPoint;
                let highprody = (sorttolowy[(sorttolowy.length - 1)].startingYPoint + sorttolowy[(sorttolowy.length - 1)].drawHeight);
                let totalheight = (highprody - lowyprody);
                
                let sortprodsx = availableProdCount.sort((a,b) => a.startingXPoint - b.startingXPoint);
                let lowyprodx = sortprodsx[0].startingXPoint;
                let highprodx = (sortprodsx[(sortprodsx.length - 1)].startingXPoint + sortprodsx[(sortprodsx.length - 1)].drawWidth);
                let totalwidth = (highprodx - lowyprodx);
                
                //update product start x,y point with available min x,y positions
                // let newReduceWidth = (prevwidth - totalwidth);
                // let newReduceHeight = (prevheight - totalheight);
                for (let i = 0; i < availableProdCount.length; i++) {
                    const availableProd = availableProdCount[i];
                    if(!availableProd.isDelete){
                        availableProd.startingXPoint = (availableProd.startingXPoint - lowyprodx);
                        availableProd.startingYPoint = (availableProd.startingYPoint - lowyprody);
                    }
                }

                changingShelf["width"] = totalwidth;
                changingShelf["height"] = totalheight;
            } else{
                if(!changingShelf.isNew){
                    changingShelf.isDelete = true;
                } else{
                    changingDept.shelf.splice(dragprod.clipShelfIdx, 1);
                }
            }

            //check dept data
            let availableShelfCount = changingDept.shelf.filter(shelfitem => !shelfitem.isDelete);
            if(availableShelfCount.length === 0){
                if(!changingDept.isNew){
                    changingDept.isDelete = true;
                } else{
                    changingParent.clipboardData.splice(dragprod.clipDeptIdx, 1);
                }
            }

            let availableDeptCount = changingParent.clipboardData.filter(deptitem => !deptitem.isDelete);
            if(availableDeptCount.length === 0){
                if(!changingParent.isNew){
                    changingParent.isDelete = true;
                } else{
                    cutarray.clipboardData.splice(dragprod.clipParent, 1);
                }
            }

        } else{
            let removeGroup = cutarray.clipboardData[cparentidx].clipboardData[cidx];
            if(removeGroup.groupUUID !== -1){
                removeGroup.isDelete = true;
            } else{
                cutarray.clipboardData[cparentidx].clipboardData.splice(cidx, 1);
            }

            let availableshelfs = cutarray.clipboardData[cparentidx].clipboardData.filter(x => !x.isDelete);
            if(availableshelfs && availableshelfs.length === 0){
                cutarray.clipboardData[cparentidx].isDelete = true;
            }
        }
        
        // console.log(cutarray);
        this.setState({ clipBoardList: cutarray }, () => {
            this.compareClipboardItems();
        });
    }
    //update cut list
    updateCutList = (cutlist, isupdateall) => {
        if(isupdateall){
            this.setState({ clipBoardList: cutlist });
        } else{
            if(cutlist && cutlist.length > 0){
                let saveobj = this.state.saveObj;
                //sort cut shelf list by rank
                let newcutlist = cutlist.sort((a, b) => (a.rank - b.rank));

                let curcutlist = this.state.clipBoardList;

                let newCutGroupObj = {
                    departmentId: -1,
                    clipboardData: [],
                    isDelete: false,
                    isNew: true
                }

                let newCutObj = {
                    groupUUID: -1,
                    mode: "copy",
                    shelf: [],
                    width: 0,
                    height: 0,
                    uom: "cm",
                    isDelete: false,
                    isNew: true
                }

                for (let i = 0; i < newcutlist.length; i++) {
                    const cutshelf = structuredClone(newcutlist[i]);
                    
                    let newCutShelfObj = {
                        shelfRank: cutshelf.rank,
                        width: 0,
                        height: 0,
                        products: [],
                        isDelete: false,
                        isNew: true
                    }

                    let sorttolowy = cutshelf.prods.sort((a,b) => a.y - b.y);
                    let lowyprody = sorttolowy[0].y;
                    let highprody = (sorttolowy[(sorttolowy.length - 1)].y + sorttolowy[(sorttolowy.length - 1)].drawHeight);
                    
                    let sortprods = cutshelf.prods.sort((a,b) => a.x - b.x);

                    let lowestxprod = structuredClone(sortprods[0]);
                    let svgwidth = 0; 
                    let svgheight = (highprody - lowyprody);
                    
                    for (let j = 0; j < sortprods.length; j++) {
                        const sortitem = sortprods[j];
                        
                        let parentProdObj = structuredClone(saveobj.fieldsList[sortitem.fieldidx].planogramShelfDto[sortitem.shelfidx].planogramProduct[sortitem.prodidx]);
                        let selectedProdObj = parentProdObj.productInfo;
                        
                        selectedProdObj.productId = selectedProdObj.id;
                        selectedProdObj.id = -1;
                        selectedProdObj.x = sortitem.x;
                        selectedProdObj.y = sortitem.y;
                        selectedProdObj.drawWidth = roundOffDecimal(sortitem.drawWidth,10);
                        selectedProdObj.drawHeight = roundOffDecimal(sortitem.drawHeight,10);
                        //set current prod dimentions - otherwise masterdata dimensions setting can be updated
                        selectedProdObj.width = parentProdObj.productWidth;
                        selectedProdObj.height = parentProdObj.productHeight;
                        selectedProdObj.depth = parentProdObj.productDepth;
                        selectedProdObj.uom = parentProdObj.productUom;
                        // console.log(selectedProdObj);
                        
                        let gapbetweenlowest = (selectedProdObj.x - lowestxprod.x);
                        selectedProdObj["startingXPoint"] = roundOffDecimal(gapbetweenlowest,2);

                        let gapbetweenlowesty = (selectedProdObj.y - lowyprody);
                        selectedProdObj["startingYPoint"] = roundOffDecimal(gapbetweenlowesty, 2);
                        
                        svgwidth = (gapbetweenlowest + selectedProdObj.drawWidth);
                        // svgheight = (svgheight < selectedProdObj.drawHeight?selectedProdObj.drawHeight:svgheight);

                        //get selected field details
                        let fieldobj = saveobj.fieldsList[sortitem.fieldidx];
                        newCutGroupObj.departmentId = fieldobj.department.departmentId;
                        
                        selectedProdObj.isDelete = false;
                        selectedProdObj.isNew = true;

                        newCutShelfObj.products.push(selectedProdObj);
                    }
                    
                    newCutShelfObj.width = svgwidth;
                    newCutShelfObj.height = svgheight;
                    
                    newCutObj.shelf.push(newCutShelfObj);
                    newCutObj.width = (newCutShelfObj.width > newCutObj.width?newCutShelfObj.width:newCutObj.width);
                    newCutObj.height = (newCutObj.height + newCutShelfObj.height);
                    newCutObj.mode = (cutshelf.iscopy?"copy":"cut");
                }

                newCutGroupObj.clipboardData.push(newCutObj);
                
                //find dept already added
                let isDeptAdded = curcutlist.clipboardData.findIndex(deptClip => deptClip.departmentId === newCutGroupObj.departmentId);
                if(isDeptAdded > -1){
                    let availableClipList = curcutlist.clipboardData[isDeptAdded];
                    availableClipList.clipboardData = availableClipList.clipboardData.concat(newCutGroupObj.clipboardData);

                    let notDeletedItems = availableClipList.clipboardData.filter(x => !x.isDelete);
                    if(notDeletedItems.length > 0){
                        availableClipList.isDelete = false;
                    }
                } else{
                    curcutlist.clipboardData.push(newCutGroupObj);
                }
                // console.log(curcutlist.clipboardData);

                this.setState({ clipBoardList: curcutlist }, () => {
                    this.compareClipboardItems();
                });
            } else{
                this.compareClipboardItems();
            }
        }
        
    }

    compareClipboardItems = () => {
        let cutitemlist = this.state.clipBoardList;
        let totalCutCount = 0;

        for (let i = 0; i < cutitemlist.clipboardData.length; i++) {
            const cutitem = cutitemlist.clipboardData[i];
            
            if(!cutitem.isDelete){
                for (let j = 0; j < cutitem.clipboardData.length; j++) {
                    const cutgroup = cutitem.clipboardData[j];
                    
                    if(!cutgroup.isDelete){
                        let notDeletedShelfs = cutgroup.shelf.filter(flt => !flt.isDelete);
                        if(notDeletedShelfs.length > 0){
                            totalCutCount = (totalCutCount + 1);
                        }
                    }
                }
            }
        }

        this.setState({ totalCutCount: totalCutCount });
    }

    //
    updateZoomContent = (zoomxvalue) => {
        this.setState({ zoomDrawX: zoomxvalue });
    }
    //triggers on product drag start
    dragStart = (e, productObj, isd3move, cutidx, iscutsingle, singleidx, deptidx) => {
        if(!isd3move){
            e.dataTransfer.setDragImage(this.dragPreviewImage, 0,0); //set drag image we generated with canvas
        }
        if(productObj){
            let selectedProdObj = productObj;
            
            let draggingProduct = structuredClone(selectedProdObj);
            draggingProduct.cutidx = cutidx;
            draggingProduct.isSingleCut = iscutsingle;
            draggingProduct.singleidx = singleidx;
            draggingProduct.deptidx = deptidx;

            //set state
            this.setState({ currentDraggableProd: draggingProduct, isContentDragging: true });
        }
        // this.removeExpandOpts();
    }
    //draws green box with mouse when dragging product to indicate product size according to field size
    drawRectCanvas = (cprod,iscutsingle) => {
        const canvele = this.dragPreviewCanvas.current;
        // var draggingProduct = cprod;  //get dragging product
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
        // var currprod = {productInfo:draggingProduct};
        // this.setState({ view: { currentDeleteProd: currprod }, isviewcmenu: false, });
    }
    //get pagexy cords
    getPageXYCords = (evt) => {
        this.oriPageXY = {isfirefox: true, x: evt.clientX, y: evt.clientY};
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

    //draw dragging product rect
    dragProdView = (e, prod) => {
        var draggingProduct = structuredClone(prod);  //get dragging product

        var curwidth = (draggingProduct.rotatewidth?draggingProduct.rotatewidth:draggingProduct.width);
        var curheight = (draggingProduct.rotateheight?draggingProduct.rotateheight:draggingProduct.height);

        let prodwidth = (measureConverter(draggingProduct.uom,this.state.displayUOM,curwidth) * this.state.displayRatio);
        let prodheight = (measureConverter(draggingProduct.uom,this.state.displayUOM,curheight) * this.state.displayRatio);
        
        let drawzoomx = this.state.zoomDrawX;
        draggingProduct["drawWidth"] = prodwidth * (drawzoomx > 0?(drawzoomx > 1?(drawzoomx + 1):(drawzoomx * 2)):1);
        draggingProduct["drawHeight"] = prodheight * (drawzoomx > 0?(drawzoomx > 1?(drawzoomx + 1):(drawzoomx * 2)):1);
        // console.log(draggingProduct);

        ghostOnDrag(e, draggingProduct, this.oriPageXY);
    }
    //remove prod drag end
    prodDragEnd = () => {
        this.setState({ isContentDragging: false });
        removeGhostImage();
    }
    //update draw contents in parent
    updateConvertDetails = (saveobj, isupdate, displayratio, _callback) => {
        // console.log(saveobj);

        this.setState({ 
            saveObj: saveobj, 
            displayRatio: (displayratio?displayratio:this.state.displayRatio),
            ischangesavailable: (isupdate?isupdate:this.state.ischangesavailable),
        }, () => {
            if(displayratio && displayratio > 0){
                this.loadClipboardData(saveobj, displayratio);
            }
            
            this.findExistingNewProductsCount(saveobj);
            
            if(_callback){
                _callback();
            }
        });
    }

    //update draw details of active planogram
    updateActiveConvertDetails = (saveobj) => {
        let bkpSaveObj = structuredClone(this.state.bkpSaveObj);

        for (let i = 0; i < bkpSaveObj.fieldsList.length; i++) {
            const fieldobj = bkpSaveObj.fieldsList[i];
            
            let findfieldobj = (saveobj?saveobj.fieldsList.find(x => (x && x.uuid === fieldobj.uuid)):null);

            if(fieldobj && fieldobj.isFieldCopy === false && findfieldobj){
                fieldobj.planogramShelfDto.sort(sortShelvesDesc);

                for (let j = 0; j < fieldobj.planogramShelfDto.length; j++) {
                    const shelfobj = fieldobj.planogramShelfDto[j];
                    shelfobj.planogramProduct = findfieldobj.planogramShelfDto[j].planogramProduct;
                }
            }
        }
        // console.log(bkpSaveObj);

        this.setState({ 
            isActiveFirstTimeLoaded: true,
            activeViewObj: saveobj,
            bkpSaveObj: bkpSaveObj,
         });
    }

    changeDatePeriodType = (ctype) => {
        this.setState({ datePeriodType: ctype }, () => {
            // this.loadRDDetails(this.state.activeViewObj);
            this.loadCurrentAndOtherFieldsQty(this.state.saveObj, false, null);
            this.loadRDOverviewDetails(this.state.saveObj);
        });
    }

    changeDatePeriodRange = (datetype, value) => {
        let fromDate = new Date();
        let newFromDate = fromDate.setMonth(fromDate.getMonth() - 3);
        
        let cdaterange = this.state.datePeriodRange;
        if(datetype === "fromDate"){
            let changevalue = (value && value !== ""?new Date(value):newFromDate);
            if(cdaterange.toDate && new Date(cdaterange.toDate).getTime() < changevalue.getTime()){
                alertService.error(this.props.t("ENDDATE_LOWERTHAN_STARTDATE"));
                cdaterange[datetype] = newFromDate;
            } else{
                cdaterange[datetype] = value;
            }
        } else {
            let changevalue = (value && value !== ""?new Date(value):new Date());
            if(cdaterange.fromDate && new Date(cdaterange.fromDate).getTime() > changevalue.getTime()){
                alertService.error(this.props.t("ENDDATE_LOWERTHAN_STARTDATE"));
                cdaterange[datetype] = new Date();
            } else{
                cdaterange[datetype] = value;
            }
        }
        
        this.setState({ datePeriodRange: cdaterange }, () => {
            // this.loadRDDetails(this.state.activeViewObj);
            this.loadCurrentAndOtherFieldsQty(this.state.saveObj, false, null);
            this.loadRDOverviewDetails(this.state.saveObj);
        });
    }

    updateStoreTags = (cidx) => {
        let saveobj = this.state.saveObj;
        let cstoretags = saveobj.tagList;

        let removeTagObj = structuredClone(cstoretags[cidx]);
          
        let deleteobj = {
            tagList: [removeTagObj.id]
        };

        submitSets(submitCollection.deleteStoreTags, deleteobj, true).then(res => {
            // console.log(res);
            this.setState({ savemodalshow: false });
            if(res && res.status && res.extra){
                alertService.success(res.extra);

                cstoretags.splice(cidx, 1);

                //update layout tag list if available
                let clayoutdetails = (this.props.planogramState && this.props.planogramState.PDplanogramDetails?this.props.planogramState.PDplanogramDetails:null);
                if(clayoutdetails){
                    let findTagFromList = (clayoutdetails.planogramTags?clayoutdetails.planogramTags.findIndex(findtag => findtag.id === removeTagObj.id):-1);
                    if(findTagFromList){
                        clayoutdetails.planogramTags.splice(findTagFromList, 1);

                        this.props.setPLanogramdetailsView(clayoutdetails);
                    }
                }

                this.setState({ saveObj: saveobj });
            }
        });
        
    }

    handleRDChanges = (changesarr) => {
        let csaveobj = this.state.saveObj;
        let crplist = this.state.rpchangedprodlist; //update shelveobj changes
        // console.log(changesarr);

        for (let i = 0; i < changesarr.length; i++) {
            let cobj = changesarr[i];

            // if(cobj.type !== "POSITION_CHANGE"){
                let cchangeobj = {id:-1, floorShelfChangeType: cobj.type, planogramShelfId: csaveobj.fieldsList[cobj.fieldidx].planogramShelfDto[cobj.shelve].id, 
                    planogramShelfHasProductId: cobj.prodobj.id, planogramShelfHasProductF_UUID: cobj.prodobj.f_uuid, changeQty: cobj.changeqty, 
                    isNew: true, isDelete: false
                };
                crplist.push({field: cobj.fieldidx, shelve:cobj.shelve, changeobj:cchangeobj});
            // }
        }
        
        if(crplist){
            this.setState({rpchangedprodlist: crplist}, () => { //saveObj: csaveobj,
                if(this.state.isActiveMode){
                    this.checkRDChanges(changesarr);
                }
            });
        }
    }

    //#PLG-DU-PS-H03 check rd changes
    checkRDChanges = (changesarr) => {
        let csaveobj = structuredClone(this.state.saveObj);

        let cloadedrdlist = this.state.rploadedrevenue;
        
        let existprodlist = this.state.existnewprodlist;
        let warningprods = this.state.warningProdList;
        
        //snapshot percentages list
        let snapshotAllData = this.state.bottomCatSubBrands;
        
        for (let i = 0; i < changesarr.length; i++) {
            const cobj = changesarr[i];
            let cproduct = cobj.product; //current product
            // console.log(cobj);

            let curdeptsalesobj = null;
            if(cobj.fieldidx > -1){
                let changeField = csaveobj.fieldsList[cobj.fieldidx];
                let changeDeptObj = (changeField.department?changeField.department:null);

                if(changeDeptObj){
                    let selectedDeptIdx = cloadedrdlist.findIndex(x => x.departmentId === changeDeptObj.departmentId);
                    if(selectedDeptIdx > -1){
                        curdeptsalesobj = (cloadedrdlist[selectedDeptIdx]?cloadedrdlist[selectedDeptIdx]:null);
                    } else{
                        let newDeptSaleObj = {
                            productSaleInformation: [],
                            totalProfit: 0,
                            totalRevenue: 0,
                            totalBuy: 0,
                            activeDepartmentProfitPerFacingDay: 0,
                            activeDepartmentSalesPerFacingDay: 0,
                            departmentId: changeDeptObj.departmentId,
                            departmentName: changeDeptObj.name,
                            version: "",
                            newProfit: "0.00",
                            totalDraftingProfit: 0,
                            totalDraftingRevenue: 0
                        }
                        
                        cloadedrdlist.push(newDeptSaleObj);
                        curdeptsalesobj = cloadedrdlist[(cloadedrdlist.length - 1)]; //last one
                    }
                }
            }
            // console.log(curdeptsalesobj);
            
            let curprodlist = (curdeptsalesobj?curdeptsalesobj.productSaleInformation:[]);
            // console.log(curprodlist);

            if(cobj.type !== "POSITION_CHANGE"){
                snapshotAllData = this.updateSnapshotData(snapshotAllData, cobj);
            }
            
            //find total available qty of product
            let totalprodqty = 0;
            //existing total qty set
            let checkalrdyadded = existprodlist.findIndex(z => z.productInfo.id === cproduct.id);

            //count facing qty of current product
            let totalbottomqty = 0; //
            let bottomwidthtotal = 0;

            // let isOverlapProdAvailable = false;

            for (let z = 0; z < csaveobj.fieldsList.length; z++) {
                const cfieldobj = csaveobj.fieldsList[z];

                for (var b = 0; b < cfieldobj.planogramShelfDto.length; b++) {
                    const pshelf = cfieldobj.planogramShelfDto[b];
                    if(!pshelf.isDelete){
                        for (var n = 0; n < pshelf.planogramProduct.length; n++) {
                            const pprod = pshelf.planogramProduct[n];
                            if(pprod.productInfo.id === cproduct.id && !pprod.isDelete){
                                for (var m = 0; m < pprod.productBlock.length; m++) {
                                    const pblock = pprod.productBlock[m];
                                    if(!pblock.isDelete){
                                        for (var t = 0; t < pblock.productLocations.length; t++) {
                                            const plocation = pblock.productLocations[t];
                                            if(!plocation.isDelete){
                                                var allowbottom = checkProductIsInBottom(pshelf.y,pshelf.drawHeight,plocation.y,plocation.drawHeight)

                                                if(allowbottom){
                                                    totalbottomqty = totalbottomqty + 1;
                                                    bottomwidthtotal = bottomwidthtotal + plocation.productWidth;
                                                }

                                                /* if(plocation.isRightSideOverLap && plocation.overLappingDto && !plocation.overLappingDto.isDelete){ //
                                                    isOverlapProdAvailable = true;
                                                } */
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }    
            }
            // console.log(isOverlapProdAvailable);
            
            //if position change set changeqty to bottom qty
            if(cobj.type === "POSITION_CHANGE"){
                cobj["changeqty"] = totalbottomqty;
            }

            //existing/new product list and propose list update
            var existingproditem = null;
            if(checkalrdyadded === undefined || checkalrdyadded === -1){
                if(cobj.type === "QTY_ADD" || cobj.type === "ADD_NEW_BLOCK" || cobj.type === "POSITION_CHANGE"){
                    cobj.prodobj["existviewtype"] = 2;
                    cobj.prodobj["productFacingQty"] = totalbottomqty;
                    cobj.prodobj["loadingProductFacingQty"] = totalbottomqty;
                    existprodlist.push(cobj.prodobj); //this prod object use to show existing prods and dragndrop
                    
                    existingproditem = cobj.prodobj;

                    this.handleUpdateProposeList(2,cproduct);
                    //add new prod to warn list
                    this.addItemstoWarning(cproduct);
                }
            } else{
                if(cobj.type === "QTY_ADD" || cobj.type === "ADD_NEW_BLOCK"){
                    var cexistitem = existprodlist[checkalrdyadded];
                    cexistitem["productFacingQty"] = totalbottomqty;
                    existingproditem = cexistitem; 
                } else if(cobj.type === "QTY_REMOVE" || cobj.type === "REMOVE_BLOCK" || cobj.type === "REMOVE_PRODUCT"){
                    var cexistitem2 = existprodlist[checkalrdyadded];
                    existingproditem = cexistitem2;
                    if(totalbottomqty > 0){
                        cexistitem2["productFacingQty"] = totalbottomqty;
                    } else{
                        existprodlist.splice(checkalrdyadded,1);
                        this.handleUpdateProposeList(1,cproduct);

                        //remove from warning list
                        warningprods = warningprods.filter(x => x.productId !== cproduct.id);
                    }
                } else if(cobj.type === "POSITION_CHANGE"){
                    var cexistitem3 = existprodlist[checkalrdyadded];
                    cexistitem3["productFacingQty"] = totalbottomqty;
                    existingproditem = cexistitem3;
                }
            }
            
            if(this.state.isActiveMode && cobj.type !== "POSITION_CHANGE"){ // prevent go further for new draft layouts or position changes
                for (let i = 0; i < curprodlist.length; i++) {
                    const productSale = curprodlist[i];
                    if(productSale.productId === cproduct.id){
                        const effectedSale = productSale.effectedSaleInformation
                        if(effectedSale){
                            totalprodqty = totalprodqty + effectedSale.productQty;
                        }else{
                            const currentSale = productSale.currentSaleInformation
                            totalprodqty = totalprodqty + currentSale.productQty;
                        }
                    }
                }

                //pick chenged qty
                if(cobj.type === "QTY_REMOVE" || cobj.type === "REMOVE_BLOCK" || cobj.type === "REMOVE_PRODUCT"){
                    totalprodqty = totalprodqty - cobj.changeqty
                } else if(cobj.type === "QTY_ADD" || cobj.type === "ADD_NEW_BLOCK"){
                    totalprodqty = totalprodqty + cobj.changeqty
                } else if(cobj.type === "POSITION_CHANGE"){
                    totalprodqty = cobj.changeqty;
                }

                if(curdeptsalesobj){
                    var draftingProfit = (curdeptsalesobj.totalDraftingProfit ? curdeptsalesobj.totalDraftingProfit : curdeptsalesobj.totalProfit) //changed profit
                    var draftingRevenue = (curdeptsalesobj.totalDraftingRevenue ? curdeptsalesobj.totalDraftingRevenue : curdeptsalesobj.totalRevenue ) //changed revenue
                    // console.log(draftingRevenue);
    
                    //find product
                    var foundprodidx = curprodlist.findIndex(x => x.productId === cproduct.id);
                    // console.log(foundprodidx);
                    //if product found in current sales list
                    if(foundprodidx > -1){
                        var foundproduct = curprodlist[foundprodidx]; //get product details
                        // console.log(structuredClone(foundproduct));

                        var prodsaleinfo  = foundproduct.currentSaleInformation;
                        var effesaledetails = (foundproduct.effectedSaleInformation?foundproduct.effectedSaleInformation:{});
                        
                        //if current sale information available
                        if(prodsaleinfo){
                            //calculate current changed qty
                            var existingoldqty = (existingproditem?existingproditem.loadingProductFacingQty:0);
                            var reducedqty = (effesaledetails && effesaledetails.oldProductQty?effesaledetails.oldProductQty:prodsaleinfo.oldProductQty) - existingoldqty; //reduce changing qty from total qty
                            var addednewqty = reducedqty + totalbottomqty; //add new changed qty
                            // console.log((effesaledetails && effesaledetails.oldProductQty?effesaledetails.oldProductQty:prodsaleinfo.oldProductQty), existingoldqty, totalbottomqty);
                            
                            //init current changed revenue/profits
                            var revenuevalue = prodsaleinfo.salePerFacingDay;
                            var profitvalue = prodsaleinfo.profitPerFacingDay;
                            //if removing change
                            if(cobj.type === "QTY_REMOVE" || cobj.type === "REMOVE_BLOCK" || cobj.type === "REMOVE_PRODUCT"){
                                var additionDraftingRevenue = 0
    
                                if(cobj.changeqty > 0){
                                    //if showing, remove if not available
                                    let ccheckfield = csaveobj.fieldsList[cobj.fieldidx];
                                    if(!checkProdAvailabilityInFeild(cproduct.id,ccheckfield)){
                                        foundproduct['isInCurrentField'] = false;
                                    }
                                        
                                    //total revenue/profit set
                                    var totalrevenue = (revenuevalue * addednewqty);
                                    var totalprofit = (profitvalue * addednewqty);
    
                                    //drafttotal set
                                    var addingprofit = (profitvalue * cobj.changeqty);
                                    var cdraftprofit = (draftingProfit - addingprofit);
                                    //set total profit
                                    var efctprofitper = ((totalprofit / cdraftprofit) * 100);
    
                                    //revenur set
                                    additionDraftingRevenue = revenuevalue * (cobj.changeqty * -1)
                                    var cdraftrevenue = draftingRevenue + additionDraftingRevenue
                                    var revPercentage = ((totalrevenue / cdraftrevenue) * 100);
                                    //revenue faceqty
                                    var revfaceqtytotal = (totalrevenue>0?(totalrevenue / addednewqty):0);
                                    
                                    effesaledetails["productQty"] = addednewqty;
                                    effesaledetails["revenue"] = totalrevenue;
                                    effesaledetails["revenuePerProductFace"] = revfaceqtytotal;
                                    effesaledetails["singleSaleOfProduct"] = revfaceqtytotal;
                                    effesaledetails["profit"] = totalprofit;
                                    effesaledetails["profitPercentage"] = (Number.isFinite(efctprofitper)?efctprofitper:0);
                                    effesaledetails["totalRevenuePercentage"] = (Number.isFinite(revPercentage)?revPercentage:0);
                                    
                                    foundproduct["effectedSaleInformation"] = effesaledetails;
                                    // console.log(foundproduct);

                                    curdeptsalesobj["productSaleInformation"] = curprodlist;
                                    curdeptsalesobj["totalDraftingProfit"] = cdraftprofit;
                                    curdeptsalesobj["totalDraftingRevenue"] = cdraftrevenue;
                                    // console.log(draftingRevenue, additionDraftingRevenue);
                                }
                            }
                            else if(cobj.type === "QTY_ADD" || cobj.type === "ADD_NEW_BLOCK"){ //for add
                                if(cobj.changeqty > 0){
                                    //if not showing, show it
                                    foundproduct['isInCurrentField'] = true
    
                                    //total revenue/profit set
                                    var totalrevenue2 = (revenuevalue * addednewqty);
                                    var totalprofit2 = (profitvalue * addednewqty);
    
                                    //drafttotal set
                                    var addingprofit2 = (profitvalue * cobj.changeqty);
                                    var cdraftprofit2 = (draftingProfit + addingprofit2);
                                    //set total profit
                                    var efctprofitper2 = ((totalprofit2 / cdraftprofit2) * 100);
    
                                    //revenur set
                                    additionDraftingRevenue = revenuevalue * (cobj.changeqty * 1)
                                    var cdraftrevenue2 = draftingRevenue + additionDraftingRevenue
                                    var revPercentage2 = ((totalrevenue2 / cdraftrevenue2) * 100);
                                    //revenue faceqty
                                    var revfaceqtytotal2 = (totalrevenue2 / addednewqty);
    
                                    effesaledetails["productQty"] = addednewqty;
                                    effesaledetails["revenue"] = totalrevenue2;
                                    effesaledetails["revenuePerProductFace"] = revfaceqtytotal2;
                                    effesaledetails["singleSaleOfProduct"] = revfaceqtytotal2;
                                    effesaledetails["profit"] = totalprofit2;
                                    effesaledetails["profitPercentage"] = (Number.isFinite(efctprofitper2)?efctprofitper2:0);
                                    effesaledetails["totalRevenuePercentage"] = (Number.isFinite(revPercentage2)?revPercentage2:0);
                                    
                                    foundproduct["effectedSaleInformation"] = effesaledetails;
                                    curdeptsalesobj["productSaleInformation"] = curprodlist;
                                    curdeptsalesobj["totalDraftingProfit"] = cdraftprofit2;
                                    curdeptsalesobj["totalDraftingRevenue"] = cdraftrevenue2;
                                }
                            }
                            else if(cobj.type === "POSITION_CHANGE" && cobj.iscalc){
                                
                                if(cobj.changeqty > 0){
                                    foundproduct['isInCurrentField'] = true;
                                } else{
                                    foundproduct['isInCurrentField'] = false;
                                }
    
                                //profit set
                                var totalrevenue4 = (revenuevalue * addednewqty);
                                var totalprofit4 = (profitvalue * addednewqty);
    
                                //drafttotal set
                                var addingprofit4 = (profitvalue * cobj.changeqty);
                                var cdraftprofit4 = (draftingProfit + addingprofit4);
                                //set total profit
                                var efctprofitper4 = ((totalprofit4 / cdraftprofit4) * 100);
    
                                //revenur set
                                additionDraftingRevenue = revenuevalue * cobj.changeqty;
                                var cdraftrevenue5 = additionDraftingRevenue;
                                var revPercentage5 = ((totalrevenue4 / cdraftrevenue5) * 100);
                                //revenue faceqty
                                var revfaceqtytotal5 = (totalrevenue4 / addednewqty);
    
                                effesaledetails["productQty"] = addednewqty;
                                effesaledetails["revenue"] = totalrevenue4;
                                effesaledetails["revenuePerProductFace"] = revfaceqtytotal5;
                                effesaledetails["singleSaleOfProduct"] = revfaceqtytotal5;
                                effesaledetails["profit"] = totalprofit4;
                                effesaledetails["profitPercentage"] = (Number.isFinite(efctprofitper4)?efctprofitper4:0);
                                effesaledetails["totalRevenuePercentage"] = (Number.isFinite(revPercentage5)?revPercentage5:0);
    
                                foundproduct["effectedSaleInformation"] = effesaledetails;
                                curdeptsalesobj["productSaleInformation"] = curprodlist;
                                curdeptsalesobj["totalDraftingProfit"] = cdraftprofit4;
                                curdeptsalesobj["totalDraftingRevenue"] = cdraftrevenue5;
                            }
                        } else{ //sale info not found
                            var existingoldqty2 = (existingproditem?existingproditem.loadingProductFacingQty:0);
                            var reducedqty2 = effesaledetails.oldProductQty - existingoldqty2; //reduce changing qty from total qty
                            var addednewqty2 = reducedqty2 + totalbottomqty; //add new changed qty
                            //get active department revenue/profit facing day values
                            var singleRevenue = (curdeptsalesobj?curdeptsalesobj.activeDepartmentSalesPerFacingDay:0);
                            var singleProfit = (curdeptsalesobj?curdeptsalesobj.activeDepartmentProfitPerFacingDay:0);
                            //if not position change
                            if((cobj.type !== "POSITION_CHANGE" && cobj.changeqty > 0) || (cobj.type === "POSITION_CHANGE" && cobj.iscalc)){
    
                                var additionDraftingProfit = 0
                                var additionDraftingRevenue2 = 0
                                if(cobj.type === "QTY_REMOVE" || cobj.type === "REMOVE_BLOCK" || cobj.type === "REMOVE_PRODUCT"){
    
                                    //if showing, remove if not available
                                    let ccheckfield = csaveobj.fieldsList[cobj.fieldidx];
                                    if(!checkProdAvailabilityInFeild(cproduct.id,ccheckfield))
                                        foundproduct['isInCurrentField'] = false
    
                                    //addtion or emove draftiong rev nd prift
                                    additionDraftingProfit = singleProfit * (cobj.changeqty * -1)
                                    additionDraftingRevenue2 = singleRevenue * (cobj.changeqty * -1)
    
                                }else if(cobj.type === "QTY_ADD" || cobj.type === "ADD_NEW_BLOCK"){
                                    //if not showing, show it
                                    foundproduct['isInCurrentField'] = true
    
                                    //addtion or emove draftiong rev nd prift
                                    additionDraftingProfit = singleProfit * (cobj.changeqty * 1)
                                    additionDraftingRevenue2 = singleRevenue * (cobj.changeqty * 1)
    
                                }else if(cobj.type === "POSITION_CHANGE"){
                                    if(cobj.changeqty > 0){
                                        foundproduct['isInCurrentField'] = true;
                                    } else{
                                        foundproduct['isInCurrentField'] = false;
                                    }
    
                                    //addtion or remove draftiong rev nd prift
                                    additionDraftingProfit = singleProfit * cobj.changeqty;
                                    additionDraftingRevenue2 = singleRevenue * cobj.changeqty;
                                }
    
                                var totalrevenue3 = singleRevenue * addednewqty2;
                                var totalprofit3 = singleProfit * addednewqty2;
    
                                var cdraftprofit3 = draftingProfit + additionDraftingProfit;
                                var efctprofitper3 = ((totalprofit3 / cdraftprofit3) * 100);
    
                                var cdraftrevenue3 = draftingRevenue + additionDraftingRevenue2;
                                var revPercentage3 = ((totalrevenue3 / cdraftrevenue3) * 100);
                                //revenue faceqty
                                var revfaceqtytotal3 = (totalrevenue3 / addednewqty2);
    
                                //field details
                                effesaledetails["productQty"] = addednewqty2;
                                effesaledetails["revenue"] = totalrevenue3;
                                effesaledetails["revenuePerProductFace"] = revfaceqtytotal3;
                                effesaledetails["singleSaleOfProduct"] = revfaceqtytotal3;
                                effesaledetails["profit"] = totalprofit3;
                                effesaledetails["profitPercentage"] = (Number.isFinite(efctprofitper3)?efctprofitper3:0);
                                effesaledetails["totalRevenuePercentage"] = (Number.isFinite(revPercentage3)?revPercentage3:0);
                                
                                foundproduct["effectedSaleInformation"] = effesaledetails;
                                curdeptsalesobj["productSaleInformation"] = curprodlist;
                                curdeptsalesobj["totalDraftingProfit"] = cdraftprofit3;
                                curdeptsalesobj["totalDraftingRevenue"] = cdraftrevenue3;
                            }
                        }
                    } else{ //for new product
                        if(cobj.changeqty > 0){
                            //get active plgram facing revenue/profit details
                            var activerevenueface = (curdeptsalesobj?curdeptsalesobj.activeDepartmentSalesPerFacingDay:0);
                            var activeprofiteface = (curdeptsalesobj?curdeptsalesobj.activeDepartmentProfitPerFacingDay:0);
                            //multiply to get new revenue/profit details
                            var newprodrevenue = activerevenueface * cobj.changeqty;
                            var newprodprofit = activeprofiteface * cobj.changeqty;
                            //calc draft profit/revenue
                            var newproddraftprofit = draftingProfit + newprodprofit;
                            var newproddraftrevenue = draftingRevenue + newprodrevenue;
                            //calc draft profit/revenue details
                            var newproddraftprofitper = ((newprodprofit / newproddraftprofit) * 100);
                            var newproddraftrevenueper = ((newprodrevenue / newproddraftrevenue) * 100);
                            
                            //create new effected sale object
                            var newprodeffectedobj = {};
                            newprodeffectedobj["productQty"] = cobj.changeqty;
                            newprodeffectedobj["oldProductQty"] = cobj.changeqty;
                            newprodeffectedobj["revenue"] = newprodrevenue;
                            newprodeffectedobj["revenuePerProductFace"] = activerevenueface;
                            newprodeffectedobj["singleSaleOfProduct"] = activerevenueface;
                            newprodeffectedobj["profit"] = newprodprofit;
                            newprodeffectedobj["profitPercentage"] = (Number.isFinite(newproddraftprofitper)?newproddraftprofitper:0);
                            newprodeffectedobj["totalRevenuePercentage"] = (Number.isFinite(newproddraftrevenueper)?newproddraftrevenueper:0);
                            
                            var cnprod = {productId: cproduct.id, productName: cproduct.productName, productBarcode: cproduct.barcode, effectedSaleInformation: newprodeffectedobj, isInCurrentField:true, isshowitem: true };
                            curprodlist.push(cnprod);
    
                            curdeptsalesobj["productSaleInformation"] = curprodlist;
                            curdeptsalesobj["totalDraftingProfit"] = newproddraftprofit;
                            curdeptsalesobj["totalDraftingRevenue"] = newproddraftrevenue;
                        }
                    }    
                }
            }   
        }
        
        this.setState({ 
            rploadedrevenue: refreshRevProPercentages(cloadedrdlist),
            existnewprodlist: existprodlist, 
            warningProdList: warningprods,
            bottomCatSubBrands: snapshotAllData
        }, () => {
            this.changeRDProfitTotal();
            this.updateFiltersList(null, null, true, true);
        });
    }

    //using to update snapshot data object if product qty changed
    updateSnapshotData = (allsnapdata, prodobj) => {
        let allNewSnapData = (allsnapdata && allsnapdata.length > 0?allsnapdata:[]);
        // console.log(prodobj);
        
        // let saveobj = this.state.saveObj;
        // let fieldobj = saveobj.fieldsList[prodobj.fieldidx];
        // let fielddeptobj = (fieldobj?fieldobj.department:null);
        // console.log(fielddeptobj);

        //if change qty available
        let isProductFound = false;

        //old width calc
        // let prodwidth = (measureConverter(prodobj.prodobj.productUom, this.state.displayUOM, prodobj.prodobj.productWidth) * this.state.displayRatio);
        // let changeWidth = (prodwidth * prodobj.changeqty); 

        //new loc width calc
        let changeWidth = 0;
        if(prodobj.loclist && prodobj.loclist.length > 0){
            for (let i = 0; i < prodobj.loclist.length; i++) {
                const locobj = prodobj.loclist[i];
                
                let prodwidth = (measureConverter(locobj.productUom, this.state.displayUOM, locobj.productWidth) * this.state.displayRatio);
                changeWidth = (changeWidth + prodwidth);
            }
        }
        // console.log(prodobj.loclist, changeWidth);
        
        if(prodobj.type === "QTY_REMOVE" || prodobj.type === "REMOVE_BLOCK" || prodobj.type === "REMOVE_PRODUCT"){
            changeWidth = (Math.abs(changeWidth) * -1);
        }

        //new data objects
        let newcatobj = {
            id: -1,
            categoryId: prodobj.product.categoryId,
            categoryName: prodobj.product.categoryName,
            color: prodobj.product.categoryColor,
            isRule: false,
            ruleType: null,
            space: 100,
            simulatedSpace: 0,
            recommendedSpace: 0,
            notRecommendedSpace: 0,
            salesSpace: 0,
            averageSpace: 0,
            subcategories: [],
            categoryActualWidth: changeWidth,
            isNewCategory: true
        }

        let newscatobj = {
            id: -1,
            subcategoryId: prodobj.product.subCategoryId,
            subcategoryName: prodobj.product.subCategoryName,
            color: prodobj.product.subCategoryColor,
            isRule: false,
            ruleType: null,
            space: 100,
            simulatedSpace: 0,
            recommendedSpace: 0,
            notRecommendedSpace: 0,
            salesSpace: 0,
            averageSpace: 0,
            brands: [],
            subcategoryActualWidth: changeWidth,
            isNewSubcategory: true
        }

        let newbrandobj = {
            id: -1,
            brandId: prodobj.product.brandId,
            brandName: prodobj.product.brandName,
            color: prodobj.product.brandColor,
            space: 100,
            simulatedSpace: 0,
            recommendedSpace: 0,
            notRecommendedSpace: 0,
            salesSpace: 0,
            averageSpace: 0,
            brandActualWidth: changeWidth,
            isNewBrand: true
        }

        let createscatobj = newscatobj;
        createscatobj.brands = [newbrandobj];

        let createcatobj = newcatobj;
        createcatobj.subcategories.push(createscatobj);

        if(prodobj && prodobj.changeqty > 0){
            
            //find product
            if(allNewSnapData && allNewSnapData.length > 0){
                let foundDeptIdx = allNewSnapData.findIndex(x => x.departmentId === prodobj.product.departmentId);
                
                if(foundDeptIdx > -1){
                    const deptobj = allNewSnapData[foundDeptIdx];
                    let foundIdxes = { catIdx: -1, scatIdx: -1, brandIdx: -1 };

                    foundIdxes.catIdx = deptobj.categories.findIndex(x => (x.space > 0 && x.categoryId === prodobj.prodobj.categoryLevel.categoryId && ((!x.isRule && !prodobj.prodobj.categoryLevel.isRule) || (x.isRule && prodobj.prodobj.categoryLevel.isRule && x.ruleType === prodobj.prodobj.categoryLevel.ruleType)) ));
                    
                    if(foundIdxes.catIdx > -1){
                        let catobj = deptobj.categories[foundIdxes.catIdx];
            
                        foundIdxes.scatIdx = catobj.subcategories.findIndex(x => 
                            (x.space > 0 && x.subcategoryId === prodobj.prodobj.subcategoryLevel.subcategoryId && ((!x.isRule && !prodobj.prodobj.subcategoryLevel.isRule) || (x.isRule && prodobj.prodobj.subcategoryLevel.isRule && x.ruleType === prodobj.prodobj.subcategoryLevel.ruleType)))
                        );

                        if(foundIdxes.scatIdx > -1){
                            let scatobj = catobj.subcategories[foundIdxes.scatIdx];
            
                            foundIdxes.brandIdx = scatobj.brands.findIndex(x => x.space > 0 && x.brandId === prodobj.prodobj.brandLevel.brandId);
                            if(foundIdxes.brandIdx > -1){
                                let brandobj = scatobj.brands[foundIdxes.brandIdx];
                                // console.log(brandobj.brandName, structuredClone(brandobj.brandActualWidth), changeWidth, prodobj.changeqty);
                                brandobj.brandActualWidth = (brandobj.brandActualWidth + changeWidth);
            
                                isProductFound = true;
            
                            } else{
                                if(changeWidth > 0){
                                    scatobj.brands.push(newbrandobj);
                                    isProductFound = true;
                                }
                            }
            
                            if(isProductFound){
                                scatobj.subcategoryActualWidth = (scatobj.subcategoryActualWidth + changeWidth);
            
                                for (let l = 0; l < scatobj.brands.length; l++) {
                                    const changebrandobj = scatobj.brands[l];
                                    changebrandobj.space = roundOffDecimal(((changebrandobj.brandActualWidth / scatobj.subcategoryActualWidth) * 100),2);
                                }
                            }
                        } else{
                            if(changeWidth > 0){
                                catobj.subcategories.push(createscatobj); 
                                isProductFound = true;
                            }
                        }
            
                        if(isProductFound){
                            catobj.categoryActualWidth = (catobj.categoryActualWidth + changeWidth);
            
                            for (let l = 0; l < catobj.subcategories.length; l++) {
                                const changescatobj = catobj.subcategories[l];
                                changescatobj.space = roundOffDecimal(((changescatobj.subcategoryActualWidth / catobj.categoryActualWidth) * 100),2);
                            }
                        }
                    } else{
                        if(changeWidth > 0){
                            deptobj.categories.push(createcatobj); 
                            isProductFound = true;
                        }
                    }
            
                    if(isProductFound){
                        deptobj.departmentActualWidth = (deptobj.departmentActualWidth + changeWidth);
                        deptobj.isUpdatePercentages = true;
            
                        for (let l = 0; l < deptobj.categories.length; l++) {
                            const changecatobj = deptobj.categories[l];
                            changecatobj.space = roundOffDecimal(((changecatobj.categoryActualWidth / deptobj.departmentActualWidth) * 100),2);
                        }
                    }
                } else{
                    console.log("snapshot update - department not existing ("+prodobj.product.departmentName+")");

                    if(prodobj.type === "QTY_ADD" || prodobj.type === "ADD_NEW_BLOCK" || prodobj.type === "POSITION_CHANGE"){
                        if(prodobj.product && prodobj.product.departmentId > 0 && prodobj.product.subCategoryId > 0 && prodobj.product.brandId > 0){
                            let newdeptobj = {
                                color: prodobj.product.departmentColor,
                                departmentActualWidth: changeWidth,
                                departmentId: prodobj.product.departmentId,
                                departmentName: prodobj.product.departmentName,
                                mpId: null,
                                uom: prodobj.prodobj.productUom,
                                categories: [createcatobj],
                                isUpdatePercentages: true
                            };
                
                            allNewSnapData.push(newdeptobj);

                            console.log("snapshot update - new department added ("+prodobj.product.departmentName+")");
                        }
                    }
                }

            } else{
                /* if(prodobj.type === "QTY_ADD" || prodobj.type === "ADD_NEW_BLOCK" || prodobj.type === "POSITION_CHANGE"){
                    if(prodobj.product && prodobj.product.departmentId > 0 && prodobj.product.subCategoryId > 0){
                        let newdeptobj = {
                            color: fielddeptobj.color,
                            departmentActualWidth: changeWidth,
                            departmentId: fielddeptobj.departmentId,
                            departmentName: fielddeptobj.name,
                            mpId: null,
                            uom: prodobj.prodobj.productUom,
                            categories: [createcatobj],
                            isUpdatePercentages: true
                        };
            
                        allNewSnapData.push(newdeptobj);
                    }
                } */
            }
        }

        // console.log(allNewSnapData);
        return allNewSnapData;
    }

    //#PLG-DU-PP-H04 when changing product details if propose details available, update propose list
    handleUpdateProposeList = (ptype, prodobj) => {
        //ptype 1- remove item, ptype 2 - add item
        if(this.state.isproposeavailable){ //if propose data avaiable
            //get current propose list
            const cloadedlist = this.state.loadedProposeList;
            const cupdatelist = this.state.trackedProposeChanges; 
            //set ptyle arrays. reversing it to check other array also
            const cremoveaddlist = cloadedlist[(ptype===2?"addingItemArray":"removeItemArray")];
            const cotherlist = cloadedlist[(ptype===2?"removeItemArray":"addingItemArray")];
            //find index in both arrays
            const isfoundidx = (cremoveaddlist&&cremoveaddlist.length>0?cremoveaddlist.findIndex( x => x.itemId === prodobj.id && x.applyStatus === "pending" && x.applyStatus !== "ignore"):-1);
            const isfoundidx2 = (cotherlist&&cotherlist.length>0?cotherlist.findIndex( x => x.itemId === prodobj.id && x.applyStatus !== "ignore"):-1);
            //if found in remove array
            if(isfoundidx > -1){
                cremoveaddlist[isfoundidx]["applyStatus"] = "apply"; //set state to apply
                //add to tracked list if not found
                const isAlreadyAdded = cupdatelist.findIndex( x => x.itemId === prodobj.id);
                if(isAlreadyAdded === -1){
                    cupdatelist.push(cremoveaddlist[isfoundidx]);
                }
            } else if(isfoundidx2 > -1){ //if item removed item added or added item remove
                if(cotherlist[isfoundidx2]["applyStatus"] === "apply"){
                    cotherlist[isfoundidx2]["applyStatus"] = "pending";
                    //remove from tracked list
                    const isAlreadyAdded2 = cupdatelist.findIndex( x => x.itemId === prodobj.id);
                    cupdatelist.splice(isAlreadyAdded2,1)
                }
            }
            this.setState({ loadedProposeList: cloadedlist, trackedProposeChanges: cupdatelist });
        }
    }
    //#PLG-DU-IM-H01 update profit total improvement
    changeRDProfitTotal = () => {
        let cloadedrdlist = this.state.rploadedrevenue;
        let crddetails = (cloadedrdlist[this.state.selectedDeptIdx]?cloadedrdlist[this.state.selectedDeptIdx]:null);

        if(crddetails){
            let crdrevenue = crddetails.totalRevenue;
            //get current draft profit total
            let nrdrevenue = (crddetails.totalDraftingRevenue?crddetails.totalDraftingRevenue:crdrevenue);
            
            //calc new percentage
            let newimpvalue = (nrdrevenue - crdrevenue);
    
            let newprofitper = (crdrevenue !== 0?((newimpvalue / crdrevenue) * 100):0);
            crddetails["newProfit"] = newprofitper.toFixed(2);
            // console.log(crddetails);
            
            this.setState({rploadedrevenue: cloadedrdlist},()=>{
                setTimeout(()=>{
                    this.loadCurrentAndOtherFieldsQty(this.state.saveObj, true, cloadedrdlist);
                },1000)
            });
        }
    }

    //reset after reload
    resetReloadData = (_callback) => {
        this.setState({ 
            fieldHistory: [], 
            rpchangedprodlist:[], 
            ischangesavailable: false, 
            warningProdList: [],
            isReloadDraw: false
        }, () => {
            this.setState({ isReloadDraw: true }, () => {
                if(_callback){
                    _callback();
                }
            });
        });
    }

    //update shelf guidelines
    updatePreviewGuid = () => {
        let filedmapobj = this.state.saveObj;
        
        for (let i = 0; i < filedmapobj.fieldsList.length; i++) {
            const fieldobj = filedmapobj.fieldsList[i];
            
            for (let j = 0; j < fieldobj.planogramShelfDto.length; j++) {
                const fieldshelf = fieldobj.planogramShelfDto[j];
                
                fieldshelf["previewguid"] = {startX:-1,EndX:-1};
            }
        }
        
        this.setState({ saveObj: filedmapobj });
    }

    //toggle print view
    togglePrintFullScreen = (isexport, isreloview, _callback) => {
        this.setState({ 
            isPendingExport: isexport,
            isPrintRLView: (isreloview?isreloview:false),
        }, () => {
            this.toggleFullScreenView(() => {
                if(_callback){
                    _callback();
                }
            }, true);
        });
    }

    toggleLoadingModal = (_callback, isshow) => {
        let prevstate = structuredClone(this.state.savemodalshow);
        this.setState({ savemodalshow: false }, () => {
            this.setState({ savemodalshow: (isshow?isshow:!prevstate) }, () => {
                if(_callback){
                    _callback();
                }
            });
        });
    }

    toggleSubLoadingModal = ( isshow, _callback) => {
        this.setState({ isLoadingModalShow: isshow }, () => {
            if(_callback){
                _callback();
            }
        });
    }

    //set selected dept obj to print
    setPrintDept = (selectedeptidx, printtype, isrlview, isfullscreenview) => {
        let printsaveobj = structuredClone(this.state.saveObj);
        let saveobj = structuredClone((isrlview?this.state.bkpActiveObj:convertBackSaveObj(printsaveobj, this.state.displayRatio)));
        let activeobj = this.state.activeViewObj;

        let fieldDeptList = this.state.fieldDeptList;
        let selectedDept = fieldDeptList[selectedeptidx];

        // console.log(selectedDept);
        let sameIdDeptFields = saveobj.fieldsList.filter(x => x.department.departmentId === selectedDept.departmentId);

        let sendobj = {
            floorlayoutId: saveobj.floorLayoutId,
            departmentId: selectedDept.departmentId,
            isFromActiveLayout: isrlview,
            activeFloorLayoutId: (activeobj?activeobj.floorLayoutId:0),
            floorLayoutHasFieldIds: sameIdDeptFields.map(z => { return z.id }),
        };

        this.toggleLoadingModal(() => {
            //if full screen print close full screen view
            if(isfullscreenview){
                this.setState({ showFullScreenEditView: false }, () => {
                    this.continueLoadPrintingDepts(printtype, sendobj, sameIdDeptFields);
                });
            } else{
                this.continueLoadPrintingDepts(printtype, sendobj, sameIdDeptFields);
            }
        }, true);
    }

    //continue load printing depts
    continueLoadPrintingDepts = (printtype, sendobj, sameIdDeptFields) => {

        submitSets(submitCollection.loadDepartmentBulkField, sendobj, true).then(res => {
            // console.log(res);
            if(res && res.status){
                let resObj = res.extra;
                resObj.fieldsList = sameIdDeptFields.concat(resObj.fieldsList);

                resObj.fieldsList = this.compareFieldsListForAisleMerge(resObj.fieldsList);
                // console.log(resObj.fieldsList);

                let highestfield = null;
        
                if(resObj.fieldsList && resObj.fieldsList.length > 0){
                    for (let i = 0; i < resObj.fieldsList.length; i++) {
                        const fieldobj = resObj.fieldsList[i];
        
                        let highestHeight = (highestfield?measureConverter(highestfield.masterFieldUom,this.state.displayUOM,highestfield.masterFieldHeight):0);
                        let fieldHeight = measureConverter(fieldobj.masterFieldUom, this.state.displayUOM, fieldobj.masterFieldHeight);
                        
                        if(highestHeight < fieldHeight){
                            highestfield = fieldobj;
                        }
                    }
                }
                
                resObj.masterFieldUom = highestfield.masterFieldUom;
                resObj.masterFieldWidth = highestfield.masterFieldWidth;
                resObj.masterFieldHeight = highestfield.masterFieldHeight;
                // console.log(resObj);

                //check if prods available
                if(this.checkPrintProdAvailablity(resObj)){
                    this.setState({ 
                        fullScreenPreviewObj: resObj, 
                        printType: printtype,
                    }, () => {
                        this.togglePrintFullScreen(true, false);
                    });
                } else{
                    alertService.error(this.props.t("NO_PRODUCTS_AVAILABLE"));
                    this.toggleLoadingModal();
                }
                

            } else{
                this.toggleLoadingModal();
            }
        });
    }

    //compare fields list to merge aisle wise
    compareFieldsListForAisleMerge = (fieldsList) => {
        //sort field list by field no in floor layout 
        let groupedFieldsList = fieldsList.reduce((rv, x) => {
            (rv[x.aisleId] = rv[x.aisleId] || []).push(x);
            return rv;
        }, {});
        // console.log(groupedFieldsList);

        //sort fields by left right fields
        let newFieldsList = [];
        for (let key in groupedFieldsList) {
            const groupobj = groupedFieldsList[key].sort((a, b) => a.id - b.id);
            
            const findDistance = (obj1, obj2) => {
                if (!obj1 || !obj2) return Infinity; // If either object is not found, return Infinity
                return Math.abs(obj1.id - obj2.id);
            }

            // Custom sorting function
            let newSortedFields = groupobj.sort((a, b) => {
                let aLeftObject = (a.leftSidePlanogramFieldDto?groupobj.find(obj => obj.id === a.leftSidePlanogramFieldDto.id):undefined);
                let aRightObject = (a.rightSidePlanogramFieldDto?groupobj.find(obj => obj.id === a.rightSidePlanogramFieldDto.id):undefined);
                let bLeftObject = (b.leftSidePlanogramFieldDto?groupobj.find(obj => obj.id === b.leftSidePlanogramFieldDto.id):undefined);
                let bRightObject = (b.rightSidePlanogramFieldDto?groupobj.find(obj => obj.id === b.rightSidePlanogramFieldDto.id):undefined);

                let aLeftDistance = findDistance(a, aLeftObject);
                let aRightDistance = findDistance(a, aRightObject);
                let bLeftDistance = findDistance(b, bLeftObject);
                let bRightDistance = findDistance(b, bRightObject);

                let aMinDistance = Math.min(aLeftDistance, aRightDistance);
                let bMinDistance = Math.min(bLeftDistance, bRightDistance);

                return aMinDistance - bMinDistance;
            });

            newFieldsList = newFieldsList.concat(newSortedFields);
        }

        // console.log(newFieldsList);
        return newFieldsList;
    }

    //toggle propose highlight
    toggleProposeHighlight = (selectprodobj, fieldidx) => {
        let prodobj = null;
        if(selectprodobj){
            prodobj = structuredClone(selectprodobj);
            prodobj.fieldIdx = fieldidx;
        }

        this.setState({ proposeHighlightProd: prodobj });
    }

    //handle change email
    handleChangeShareEmail = (evt) => {
        this.setState({ shareEmail: evt.target.value });
    }

    updateFiltersList = (key, value, isreset, isnotclearall) => {
        // console.log(key, value, isreset);

        let bottomCatSubBrands = this.state.bottomCatSubBrands;
        let existingProdList = this.state.existnewprodlist;
        let filterobj = this.state.addedFilters;
        
        let datalist = structuredClone(this.state.snapshotFilters);
        let showingSnapshotList = (isnotclearall?this.state.showingSnapshotList:[]);
        let viewType = (isnotclearall?this.state.filterLevel:"CAT");

        if(isreset){
            if(!isnotclearall){
                filterobj.departmentId = (bottomCatSubBrands && bottomCatSubBrands.length > 0?bottomCatSubBrands[0].departmentId:0);
                filterobj.categoryId = 0;
                filterobj.subcategoryId = 0;
                
                //empty data lists
                datalist.departments = [];
            }
            
            datalist.categories = [];
            datalist.subcategories = [];

            for (let i = 0; i < bottomCatSubBrands.length; i++) {
                const deptobj = bottomCatSubBrands[i];

                if(!isnotclearall){
                    datalist.departments.push({ departmentId: deptobj.departmentId, departmentName: deptobj.departmentName });
                }

                if(!isnotclearall && i === 0){
                    showingSnapshotList = deptobj.categories;
                }

                for (let j = 0; j < deptobj.categories.length; j++) {
                    const catobj = deptobj.categories[j];
                    
                    if(catobj.space > 0){
                        let iscatinfield = existingProdList.find(x => x.categoryLevel.categoryId === catobj.categoryId);
                        catobj.isshowitem = (iscatinfield?true:false);

                        for (let l = 0; l < catobj.subcategories.length; l++) {
                            const scatobj = catobj.subcategories[l];

                            if(scatobj.space > 0){
                                let isscatinfield = existingProdList.find(x => x.categoryLevel.categoryId === catobj.categoryId && x.subcategoryLevel.subcategoryId === scatobj.subcategoryId);
                                scatobj.isshowitem = (isscatinfield?true:false);

                                for (let j = 0; j < scatobj.brands.length; j++) {
                                    const brandobj = scatobj.brands[j];
                                    
                                    if(brandobj.space > 0){
                                        let isbrandinfield = existingProdList.find(x => x.categoryLevel.categoryId === catobj.categoryId && x.subcategoryLevel.subcategoryId === scatobj.subcategoryId && x.brandLevel.brandId === brandobj.brandId);
                                        brandobj.isshowitem = (isbrandinfield?true:false);
                                    }
                                }
                            }
                        }

                        if(!isnotclearall){
                            if(deptobj.departmentId === filterobj.departmentId){
                                datalist.categories.push({ categoryId: catobj.categoryId, categoryName: catobj.categoryName, space: catobj.space, isRule: catobj.isRule, ruleType: catobj.ruleType});
                            }
                        }
                    }
                }
            }

            if(isnotclearall){
                for (let i = 0; i < bottomCatSubBrands.length; i++) {
                    const deptobj = bottomCatSubBrands[i];
    
                    if(deptobj.departmentId === filterobj.departmentId){
                        let isResetCatItem = false; 
                        
                        for (let j = 0; j < deptobj.categories.length; j++) {
                            const catobj = deptobj.categories[j];
                            
                            if(catobj.space > 0){
                                let isResetSubItem = false;

                                let iscatinfield = existingProdList.find(x => x.categoryLevel.categoryId === catobj.categoryId);
                                catobj.isshowitem = (iscatinfield?true:false);
        
                                for (let l = 0; l < catobj.subcategories.length; l++) {
                                    const scatobj = catobj.subcategories[l];
        
                                    if(scatobj.space > 0) {
                                        datalist.subcategories.push({ subcategoryId: scatobj.subcategoryId, subcategoryName: scatobj.subcategoryName, space: scatobj.space, isRule: scatobj.isRule, ruleType: scatobj.ruleType});

                                        if(viewType === "SCAT"){
                                            let selSCatIdx = showingSnapshotList.findIndex(x => x.categoryId === catobj.categoryId && x.subcategoryId === scatobj.subcategoryId);

                                            if(selSCatIdx > -1){
                                                showingSnapshotList[selSCatIdx].space = scatobj.space;
                                            }
                                        }

                                        for (let k = 0; k < scatobj.brands.length; k++) {
                                            const brandobj = scatobj.brands[k];
                                            
                                            if(viewType === "BRAND"){
                                                let selBrandIdx = showingSnapshotList.findIndex(x => x.categoryId === catobj.categoryId && x.subcategoryId === scatobj.subcategoryId && x.brandId === brandobj.brandId);
                                                
                                                if(selBrandIdx > -1){
                                                    if(brandobj.space > 0){
                                                        showingSnapshotList[selBrandIdx].space = brandobj.space;
                                                    } else{
                                                        showingSnapshotList.splice(selBrandIdx, 1);
                                                    }
                                                }
                                            }
                                        }
                                    } else{
                                        if(filterobj.subcategoryId > 0 && filterobj.subcategoryId === scatobj.subcategoryId){
                                            filterobj.subcategoryId = 0;
                                            isResetSubItem = true;
    
                                            viewType = "SCAT";
                                        }
                                    }
                                }

                                if(isResetSubItem){
                                    showingSnapshotList = catobj.subcategories;
                                }

                                datalist.categories.push({ categoryId: catobj.categoryId, categoryName: catobj.categoryName, space: catobj.space, isRule: catobj.isRule, ruleType: catobj.ruleType});

                                if(viewType === "CAT"){
                                    let selCatIdx = showingSnapshotList.findIndex(x => x.categoryId === catobj.categoryId);

                                    if(selCatIdx > -1){
                                        showingSnapshotList[selCatIdx].space = catobj.space;
                                    }
                                }

                            } else{
                                if(filterobj.categoryId > 0 && filterobj.categoryId === catobj.categoryId){
                                    filterobj.categoryId = 0;
                                    isResetCatItem = true;

                                    viewType = "CAT";
                                }
                            }
                        }

                        if(isResetCatItem){
                            showingSnapshotList = deptobj.categories;
                        }

                    }

                }
            }

            // console.log(datalist);

        } else{
            filterobj[key] = parseFloat(value);

            if(key === "departmentId"){
                filterobj.categoryId = 0;
                filterobj.subcategoryId = 0;
    
                datalist.categories = [];
                datalist.subcategories = [];
    
                let finddeptobj = bottomCatSubBrands.find(x => x.departmentId === filterobj.departmentId);
                if(finddeptobj){
                    showingSnapshotList = finddeptobj.categories;
                    
                    for (let i = 0; i < finddeptobj.categories.length; i++) {
                        const catobj = finddeptobj.categories[i];

                        if(catobj.space > 0){
                            datalist.categories.push({ categoryId: catobj.categoryId, categoryName: catobj.categoryName, space: catobj.space, isRule: catobj.isRule, ruleType: catobj.ruleType});
                        }
                    }
                }
            } else if(key === "categoryId"){
                filterobj.subcategoryId = 0;
                datalist.subcategories = [];
    
                let finddeptobj = bottomCatSubBrands.find(x => x.departmentId === filterobj.departmentId);
                if(finddeptobj){
                    if(filterobj.categoryId > 0){
                        viewType = "SCAT";
    
                        const findcatobj = finddeptobj.categories.find(x => x.categoryId === filterobj.categoryId);
                        if(findcatobj){
                            showingSnapshotList = findcatobj.subcategories;
                            
                            for (let k = 0; k < findcatobj.subcategories.length; k++) {
                                const scatobj = findcatobj.subcategories[k];

                                if(scatobj.space > 0){
                                    datalist.subcategories.push({ subcategoryId: scatobj.subcategoryId, subcategoryName: scatobj.subcategoryName, space: scatobj.space, isRule: scatobj.isRule, ruleType: scatobj.ruleType});
                                }
                            }
                        }
                    } else{
                        viewType = "CAT";
                        showingSnapshotList = finddeptobj.categories;
                    }
                }
            } else{
                let finddeptobj = bottomCatSubBrands.find(x => x.departmentId === filterobj.departmentId);
                if(finddeptobj){
                    const findcatobj = finddeptobj.categories.find(x => x.categoryId === filterobj.categoryId);
                    if(findcatobj){
                        if(filterobj.subcategoryId > 0){
                            viewType = "BRAND";
    
                            const findscatobj = findcatobj.subcategories.find(x => x.subcategoryId === filterobj.subcategoryId);
                            if(findscatobj){
                                showingSnapshotList = findscatobj.brands;
                            }
                        } else{
                            viewType = "SCAT";
                            showingSnapshotList = findcatobj.subcategories;
                        }
                    }
                }
            }
        }

        // console.log(bottomCatSubBrands);
        this.setState({ 
            addedFilters: filterobj,
            bottomCatSubBrands: bottomCatSubBrands,
            showingSnapshotList: showingSnapshotList,
            snapshotFilters: datalist,
            filterLevel: viewType,
            hightlightSnapShotList: { categories: [], subcategories: [], brands: [] }, 
        }, () => {
            this.continueExistingProdCount(this.state.saveObj);
        });
    }

    updateFilterRevenueList = (updatedlist) => {
        this.setState({ filterRevenueList: updatedlist });
    }

    //remove filtered sales item
    handleDeleteFilteredList = (type, idx) => {
        var cfilterlist = this.state.filterRevenueList;
        
        if(type === 1){
            cfilterlist = [];
        } else{
            cfilterlist.splice(idx,1);
        }

        this.setState({filterRevenueList: cfilterlist});
    }

    //undo unsaved changes
    resetUnsavedChanges = () => {
        if(this.state.ischangesavailable && this.state.fieldHistory && this.state.fieldHistory.past && this.state.fieldHistory.past.length > 0){
            confirmAlert({
                title: this.props.t('RESETUNSAVED'),
                message: this.props.t('SURETORESET_UNSAVED'),
                overlayClassName: (this.props.isRTL==="rtl"?"alertrtl-content":""),
                buttons: [{
                    label: this.props.t('btnnames.yes'),
                    onClick: () => {
                            this.fieldHistoryUndo(true);
                        }
                    }, {
                        label: this.props.t('btnnames.no')
                    }]
            });
        } else{
            alertService.error(this.props.t("NO_CHANGES_AVAILABLE"));
        }
    }

    //highlight list change
    toggleHightlightList = (selecteditem) => {
        let selectedlist = this.state.hightlightSnapShotList;
        let selectedtype = this.state.filterLevel;

        if(selectedtype === "CAT"){
            let isAlreadyAdded = selectedlist.categories.findIndex(x => x.categoryId === selecteditem.categoryId);
            if(isAlreadyAdded > -1){
                selectedlist.categories.splice(isAlreadyAdded, 1);
            } else{
                selectedlist.categories.push(selecteditem);
            }
        } else if(selectedtype === "SCAT"){
            let isAlreadyAdded = selectedlist.subcategories.findIndex(x => x.subcategoryId === selecteditem.subcategoryId);
            if(isAlreadyAdded > -1){
                selectedlist.subcategories.splice(isAlreadyAdded, 1);
            } else{
                selectedlist.subcategories.push(selecteditem);
            }
        } else{
            let isAlreadyAdded = selectedlist.brands.findIndex(x => x.brandId === selecteditem.brandId);
            if(isAlreadyAdded > -1){
                selectedlist.brands.splice(isAlreadyAdded, 1);
            } else{
                selectedlist.brands.push(selecteditem);
            }
        }

        // console.log(selectedlist);
        this.setState({ hightlightSnapShotList: selectedlist });
    }

    //unsave confirm message
    notsaveConfirm = (_callback) => {
        if(this.state.ischangesavailable){
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

    updateRecentAddedList = (draggingProduct, fieldid) => {
        let crecaddedlist = this.state.AllRecentProdList;
        let filterreclist = this.state.recentProdList;
        let isAlreadyAdded = false;

        for (var i = 0; i < crecaddedlist.length; i++) {
            if(crecaddedlist[i].id === draggingProduct.id){
                isAlreadyAdded = true;

                draggingProduct["fieldid"] = fieldid;
                crecaddedlist[i] = draggingProduct;
            }
        }

        //if not add product to it
        if(!isAlreadyAdded){
            draggingProduct["fieldid"] = fieldid;
            crecaddedlist.push(draggingProduct);
            filterreclist.push(draggingProduct);
        }

        //update recent product redux and state
        this.props.setFieldRecList(crecaddedlist);
        this.setState({ 
            recentProdList: filterreclist, 
            AllRecentProdList: crecaddedlist
        });
    }

    //close print full screen view after print complete
    togglePrintFullScreenView = () => {
        this.setState({ isPendingExport: false }, () => {
            this.toggleFullScreenView();
        });
    }

    //check for prod availability for export prod list
    checkPrintProdAvailablity = (printallprods) => {
        // console.log(printallprods);
        
        let totalprodcount = 0;
        if(printallprods.fieldsList && printallprods.fieldsList.length > 0){
            for (let i = 0; i < printallprods.fieldsList.length; i++) {
                const fieldobj = printallprods.fieldsList[i];
                
                for (let j = 0; j < fieldobj.planogramShelfDto.length; j++) {
                    const shelfobj = fieldobj.planogramShelfDto[j];
                    
                    for (let l = 0; l < shelfobj.planogramProduct.length; l++) {
                        const prodobj = shelfobj.planogramProduct[l];
                        
                        if(!prodobj.isDelete && prodobj.productFacingQty > 0){
                            totalprodcount = (totalprodcount + prodobj.productFacingQty);
                        }
                    }
                }
            }
        }
        console.log("available prods count - "+totalprodcount);

        return (totalprodcount > 0?true:false)
    }

    //change selected department
    setSelectedDeptIdx = (changevalue) => {
        this.setState({ selectedDeptIdx: changevalue });
    }

    //toggle snapshot view
    toggleSnapshotShowFieldOnly = (isshow) => {
        this.setState({ snapshotShowFieldOnly: isshow }, () => {
            // this.updateFiltersList(null, null, true);
        });
    }

    //update ghost wrapper details from child
    updateGhostViewObj = (obj) => {
        this.setState({ ghostWrapperObj: obj });
    }
    //
    sendExcelData = (prodlist, totalcount) => {
        if(totalcount > 0){
            this.setState({ 
                excelUploadList: [], 
                totalExcelProdCount: 0,
                excelStartIndex: 0,
                showNewTabType: "imported",
                proposeselecttab: "key-2",
                excelSearchText: "",
            }, () => {
                this.loadImportProdList();
            });
        }
    }
    //load imported prod list
    loadImportProdList = (fieldobj) => {
        this.updateImportScrollList(0);

        let saveobj = (fieldobj?fieldobj:this.state.saveObj);

        let sendobj = {
            searchValue: this.state.excelSearchText,
            floorlayoutId: saveobj.floorLayoutId,
            isReqPagination: true,
            isReqCount: false,
            maxResult: this.state.paginationMaxCount,
            startIndex: this.state.excelStartIndex,
        }

        this.setState({ isImportDataLoading: true }, () => {
            submitSets(submitCollection.getPlgImportedProdBarcodes, sendobj, false).then(res => {
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
                    let mergedProds = (sendobj.startIndex === 0?datalist:this.state.excelUploadList.concat(datalist));
                    
                    if(sendobj.startIndex === 0){
                        this.setState({ totalExcelProdCount: (res.count > 0?res.count:0) }, () => {
                            this.setImportedProds(mergedProds, true);
                        });
                    } else{
                        this.setImportedProds(mergedProds);
                    }

                    this.setState({ excelStartIndex: (this.state.excelStartIndex + (datalist.length > 0?datalist.length:0)) });
                }

                this.setState({ isImportDataLoading: false });
            });
        });
    }
    //set imported prods
    setImportedProds = (datalist, isReloadProds, isFEDelete, removelist) => {
        if(isFEDelete){
            // console.log(removeItem);
            let filteredUploadList = this.state.excelUploadList;
            for (let i = 0; i < removelist.length; i++) {
                filteredUploadList = filteredUploadList.filter(x => x.barcode !== removelist[i]);
            }

            this.setState({
                excelUploadList: filteredUploadList,
                excelStartIndex: ((this.state.excelStartIndex - removelist.length) > -1?(this.state.excelStartIndex - removelist.length):0),
                totalExcelProdCount: ((this.state.totalExcelProdCount - removelist.length) > -1?(this.state.totalExcelProdCount - removelist.length):0),
            });
        } else{
            this.setState({ excelUploadList: datalist }, () => {
                if(!isReloadProds && datalist.length > 0){
                    this.loadAllLayoutUsedProds();
                } else if(datalist.length > 0){
                    this.compareImportedProds();
                }
            });
        }
    }
    //get all added prods of current layout
    loadAllLayoutUsedProds = () => {
        let queryparam = "?floorlayoutId="+this.state.saveObj.floorLayoutId;

        submitSets(submitCollection.getPlgUsedProducts, queryparam, false).then(res => {
            // console.log(res);
            if(res && res.status){
                let datalist = (res.extra && res.extra.length > 0?res.extra:[]);
                // console.log(datalist);

                this.setState({ allLayoutUsedProds: datalist }, () => {
                    this.compareImportedProds();
                });
            }
        });
    }
    //compare imported prod list
    compareImportedProds = () => {
        let importedProds = this.state.excelUploadList;
        for (let i = 0; i < importedProds.length; i++) {
            const importprod = importedProds[i];
            let isAdded = this.state.allLayoutUsedProds.find(x => x.barcode === importprod.barcode && x.facingQty > 0);
            
            importprod.isAdded = (isAdded?true:false);
        }

        // console.log(importedProds);
        this.setState({ excelUploadList: importedProds });
    }
    cannotDropWarningHandle = (isUpdateDetails, warnList, selectedProduct) => {
        this.setState({ 
            dropWarningList: (isUpdateDetails && warnList?warnList:[]),
            selectedwarningdropprod: (isUpdateDetails && selectedProduct?selectedProduct:null),
            isProductDropwarn: !this.state.isProductDropwarn,
        });
    }
    
    getProductData = (citem ) => {
        if(citem){
            this.setState({isLoadingModalShow:true, selectedProduct:null,originalData:{}, isShowPreviewModal:false, snapId:(citem.snapId?citem.snapId:-1)},()=>{
                let svobj = "?productId="+citem.id;
                submitSets(submitCollection.findProdByID, svobj).then(res => {
                    //console.log(res.extra);
                    this.setState({isLoadingModalShow:false});
                    if(res && res.status && res.extra){
                        this.setState({selectedProduct: (res.extra?res.extra:null) , originalData: (res.extra?res.extra:null)},()=>{
                            this.toggleProductEditModal();
                        });
                    } else{
                        this.setState({isLoadingModalShow:false})
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
            this.getProductData(prod)
    }

    toggleProductEditModal = (type) =>{
        //get product details after complete
        if(type === "update" && this.state.isShowPreviewModal){
            this.reloadProdWarnModalDetails();

            //reload if imported prod list available
            /* if(this.state.totalExcelProdCount > 0){
                this.sendExcelData([], this.state.totalExcelProdCount);
            } */
        }

        this.setState({isShowPreviewModal:!this.state.isShowPreviewModal});
    }

    //update
    reloadProdWarnModalDetails = () => {
        let citem = this.state.selectedwarningdropprod?this.state.selectedwarningdropprod:this.state.selectedProduct;

        this.toggleSubLoadingModal(true, () => {
            let svobj = "?productId="+citem.id;
            submitSets(submitCollection.findProdByID, svobj).then(res => {
                // console.log(res.extra);
                
                if(res && res.status && res.extra){
                    let prodobj = res.extra;
                    let prodwarnlist = validateHeirarchyMissings(prodobj);
    
                    let searchProdList = this.state.searchProdLoadedList;
                    let selProdIdx = searchProdList.findIndex(x => x.id === prodobj.id);
                    // console.log(prodobj);
                    searchProdList[selProdIdx] = prodobj;
                    
                    let excelUploadList = this.state.excelUploadList;
                    let importedProdIdx = excelUploadList.findIndex(x => x.id === prodobj.id);

                    if(importedProdIdx > -1){
                        let oldobj = structuredClone(excelUploadList[importedProdIdx]);
                        // console.log(oldobj);
                        
                        excelUploadList[importedProdIdx] = prodobj;
                        excelUploadList[importedProdIdx].availabilityType = oldobj.availabilityType;
                    }

                    //propose list
                    let proposeList = structuredClone(this.state.loadedProposeList);
                    if(proposeList && proposeList.fieldList && proposeList.fieldList.length > 0){
                        for (let i = 0; i < proposeList.fieldList.length; i++) {
                            const proposeField = proposeList.fieldList[i];
                            
                            if(proposeField.addingItemArray && proposeField.addingItemArray.length > 0){
                                let proposeFindIndex = proposeField.addingItemArray.findIndex(x => x.itemId === prodobj.id);
                                
                                if(proposeFindIndex > -1){
                                    let foundprod = proposeField.addingItemArray[proposeFindIndex];
                                    foundprod.brandId = (prodobj.brandId?prodobj.brandId:-1);
                                    foundprod.brandName = (prodobj.brandName?prodobj.brandName:-1);
                                    foundprod.itemBarcode = prodobj.barcode;
                                    foundprod.itemName = prodobj.productName;
                                    foundprod.productInfo = prodobj;
                                }
                            }

                            if(proposeField.removeItemArray && proposeField.removeItemArray.length > 0){
                                let proposeFindIndex = proposeField.removeItemArray.findIndex(x => x.itemId === prodobj.id);
                                
                                if(proposeFindIndex > -1){
                                    let foundprod = proposeField.removeItemArray[proposeFindIndex];
                                    foundprod.brandId = (prodobj.brandId?prodobj.brandId:-1);
                                    foundprod.brandName = (prodobj.brandName?prodobj.brandName:-1);
                                    foundprod.itemBarcode = prodobj.barcode;
                                    foundprod.itemName = prodobj.productName;
                                }
                            }
                        }
                    }

                    //update warning list, imported prod list and product details states
                    this.setState({
                        dropWarningList: this.state.selectedwarningdropprod?prodwarnlist:this.state.dropWarningList,
                        excelUploadList: excelUploadList,
                        loadedProposeList: {},
                        selectedwarningdropprod: this.state.selectedwarningdropprod?prodobj:this.state.selectedwarningdropprod,
                        searchProdLoadedList: searchProdList,
                    }, () => {
                        this.setState({ loadedProposeList: proposeList });
                    });
    
                    //if no warnings available
                    if(prodwarnlist.length === 0&&this.state.selectedwarningdropprod){
                        this.setState({
                            dropWarningList: [], selectedwarningdropprod: null, isProductDropwarn: false,
                        });
                    }
                }

                this.toggleSubLoadingModal(false);
            });
        });
    }

    //update search prod list from child
    updateSearchProdList = (prodlist) => {
        this.setState({ searchProdLoadedList: prodlist });
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
        this.setState({ excelUploadList: updatedlist });
    }
    //update prod list
    updateExcelSearchText = (evt) => {
        //if enter
        if(evt.which === 13){
            this.setState({ 
                excelSearchText: evt.target.value,
                excelStartIndex: 0,
            }, () => {
                this.loadImportProdList();
            });
        } else{
            this.setState({ 
                excelSearchText: evt.target.value
            });
        }
    }
    //update imported scroll list
    updateImportScrollList = (scrollTop) => {
        this._importedScrollHeight = scrollTop;
    }    


    render(){
        let { isReloadDraw, isReloadAll, saveObj, isActiveMode } = this.state; 

        let cloadedrdlist = this.state.rploadedrevenue;
        let crddetails = (cloadedrdlist[this.state.selectedDeptIdx]?cloadedrdlist[this.state.selectedDeptIdx]:null);
        // console.log(this.state.rploadedrevenue);

        return (<>
            <React.Fragment>
                <Prompt when={(this.state.ischangesavailable === true)}
                message={this.props.t('YOU_HAVE_UNSAVED_CHANGES_SURE_TO_LEAVE')?this.props.t('YOU_HAVE_UNSAVED_CHANGES_SURE_TO_LEAVE'):""} />
            </React.Fragment>

            {isReloadAll?<Col xs={12} className={"main-content pg-dunitview "+(this.props.isRTL==="rtl"?"RTL":"")} dir={this.props.isRTL}>
                {this.state.noteinfomsg?<Col className={"noteinfo-msg"+(this.state.noteinfomsg.close?"":" active")}>{this.state.noteinfomsg.message}</Col>:<></>}
                
                <Col xs={12} className="white-container pdunit-content" style={{background:"transparent", boxShadow:"none", padding:"0px", marginBottom: "20px"}}>
                    <Col style={{marginBottom: "15px"}}>
                        <Button variant="light" type="button" className="backpg-link" onClick={this.handleGoBack} style={{textTransform:"uppercase",fontWeight:"600",padding:"2px 5px",marginRight:"5px"}}><ChevronLeftIcon size={22}/></Button>
                    
                        <StoreTagsList 
                            saveObj={saveObj}
                            updateStoreTags={this.updateStoreTags}
                            />
                    </Col>

                    <Row style={{marginTop:"5px"}}>

                        <Col xs={12} lg={4} className='prodactions-wrapper'>
                            <Col xs={12} className="contentview-main">
                                <AllProductContents t={this.props.t} isRTL={this.props.isRTL} dmode={this.props.dmode} 
                                    isproposeavailable={this.state.isproposeavailable}
                                    importedScrollHeight={this._importedScrollHeight}
                                    clipBoardList={this.state.clipBoardList}
                                    displayRatio={this.state.displayRatio}
                                    displayUOM={this.state.displayUOM}
                                    excelUploadList={this.state.excelUploadList}
                                    fieldStatus={this.state.fieldStatus}
                                    isImportDataLoading={this.state.isImportDataLoading}
                                    historyTabList={this.state.historyTabList}
                                    existnewprodlist={this.state.existnewprodlist}
                                    excelStartIndex={this.state.excelStartIndex}
                                    excelSearchText={this.state.excelSearchText}
                                    loadedProposeList={this.state.loadedProposeList}
                                    recentAddedProdList={this.state.recentProdList}
                                    showNewTabType={this.state.showNewTabType}
                                    saveObj={this.state.saveObj}
                                    searchProdLoadedList={this.state.searchProdLoadedList}
                                    totalExcelProdCount={this.state.totalExcelProdCount}
                                    totalCutCount={this.state.totalCutCount}
                                    proposeselecttab={this.state.proposeselecttab}
                                    zoompanactive={this.state.zoompanactive}
                                    zoomDrawX={this.state.zoomDrawX}
                                    copyToClipboard={this.copyToClipboard}
                                    dragStart={this.dragStart}
                                    drawRectCanvas={this.drawRectCanvas} 
                                    dragProdView={this.dragProdView}
                                    handleProposeTabs={this.handleProposeTabs}
                                    handleViewProposeList={this.handleViewProposeList}
                                    handlePreviewModal={this.handleProductImgPreview}
                                    ghostFromParent={this.ghostFromParent} 
                                    loadImportProdList={this.loadImportProdList}
                                    prodDragEnd={this.prodDragEnd}
                                    sendExcelData={this.sendExcelData}
                                    setImportedProds={this.setImportedProds}
                                    toggleLoadingModal={this.toggleSubLoadingModal}
                                    toggleProposeHighlight={this.toggleProposeHighlight}
                                    updateGhostViewObj={this.updateGhostViewObj}
                                    updateImportedList={this.updateImportedList}
                                    updateSingleCutProduct={this.updateSingleCutProduct}
                                    updateExcelSearchText={this.updateExcelSearchText}
                                    handleopenDetailmodal={this.handleopenDetailmodal}
                                    updateSearchProdList={this.updateSearchProdList}
                                    updateImportScrollList={this.updateImportScrollList}
                                    />

                                <Col xs={12}>
                                    <Row>
                                        {isActiveMode?
                                            <Col xs={12} lg={5} className={"improve-view subview-content"+((crddetails && crddetails.newProfit?(parseFloat(crddetails.newProfit)):0) < 0?" minus-highlight":"")} style={{marginBottom:"8px",paddingRight:"0px"}}>
                                                <ImprovementProgress value={(crddetails && crddetails.newProfit?(parseFloat(crddetails.newProfit)):0)} trans={this.props.t} dmode={this.props.dmode} />
                                            </Col>
                                        :<></>}
                                        
                                        <Col xs={12} lg={3}>
                                            <ul className='list-inline productcontrol-options'>

                                                <li className='list-inline-item singlestyle-li'>
                                                    <ExportCSV t={this.props.t} isRTL={this.props.isRTL}
                                                        activeViewObj={this.state.activeViewObj}
                                                        excelUploadPagination={this.state.excelUploadPagination}
                                                        exportData={this.state.existnewprodlist} 
                                                        excelStartIndex={this.state.excelStartIndex}
                                                        paginationMaxCount={this.state.paginationMaxCount}
                                                        saveObj={this.state.saveObj}
                                                        totalExcelProdCount={this.state.totalExcelProdCount}
                                                        bkpSaveObj={this.state.bkpSaveObj}
                                                        fieldDeptList={this.state.fieldDeptList}
                                                        compareFieldsListForAisleMerge={this.compareFieldsListForAisleMerge}
                                                        sendExcelData={this.sendExcelData}
                                                        setExcelUploadPagination={this.setExcelUploadPagination}
                                                        toggleLoadingModal={this.toggleSubLoadingModal}
                                                        />
                                                </li>
                                                
                                                {isActiveMode?
                                                    <li className='list-inline-item' onClick={() => this.resetUnsavedChanges()}><FeatherIcon icon="rotate-ccw" size={18}/></li>
                                                :<></>}
                                            </ul>
                                        </Col>
                                        
                                        <PgDunitActions t={this.props.t} isRTL={this.props.isRTL}
                                            activeViewObj={this.state.activeViewObj}
                                            bkpSaveObj={this.state.bkpSaveObj}
                                            bottomCatSubBrands={this.state.bottomCatSubBrands}
                                            clipBoardList={this.state.clipBoardList}
                                            displayRatio={this.state.displayRatio}
                                            fieldStatus={this.state.fieldStatus}
                                            isActiveMode={this.state.isActiveMode}
                                            ischangesavailable={this.state.ischangesavailable}
                                            isshowedit={this.state.isshowedit}
                                            isproposeavailable={this.state.isproposeavailable}
                                            isProposeDataLoading={this.state.isProposeDataLoading}
                                            loadedProposeList={this.state.loadedProposeList}
                                            rpchangedprodlist={this.state.rpchangedprodlist}
                                            saveObj={this.state.saveObj}
                                            convertCliboardData={this.convertCliboardData}
                                            handleViewProposeList={this.handleViewProposeList}
                                            history={this.props.history}
                                            reinitSaveObj={this.reinitSaveObj}
                                            setPLanogramdetailsView={this.props.setPLanogramdetailsView}
                                            setFieldIsNewDraftView={this.props.setFieldIsNewDraftView}
                                            resetReloadData={this.resetReloadData}
                                            />
                                    </Row>
                                </Col>
                            </Col>
                        </Col>

                        <Col xs={12} lg={8} className={"draftedit-view "+(this.state.isActiveMode?"active ":"")+((!this.state.isActiveMode && this.state.isShowProdView)?(this.props.isRTL === "rtl"?" mdiv-floatleft":" offset-lg-4"):"")}>
                            {isReloadDraw && !this.state.showFullScreenEditView && !this.state.savemodalshow && this.state.saveObj && Object.keys(this.state.saveObj).length > 0?<>
                                <ProdsWarningSidebar t={this.props.t} isRTL={this.props.isRTL} 
                                    showWarningSidebar={this.state.showWarningSidebar} 
                                    warningProdList={this.state.warningProdList} 
                                    copyToClipboard={this.copyToClipboard} 
                                    handleProductImgPreview={this.handleProductImgPreview} 
                                    toggleWarningSidebar={this.toggleWarningSidebar} 
                                    />

                                <DisplayUnitDraw 
                                    t={this.props.t} isRTL={this.props.isRTL} dmode={this.props.dmode} 
                                    activeFieldDeptList={this.state.activeFieldDeptList}
                                    allSnapshotBrandList={this.state.allSnapshotBrandList}
                                    activeViewObj={this.state.activeViewObj}
                                    bkpSaveObj={this.state.bkpSaveObj}
                                    clipBoardList={this.state.clipBoardList}
                                    currentDraggableProd={this.state.currentDraggableProd}
                                    history={this.props.history}
                                    fieldDeptList={this.state.fieldDeptList}
                                    fieldHistory={this.state.fieldHistory}
                                    filterRevenueList={this.state.filterRevenueList}
                                    filterLevel={this.state.filterLevel}
                                    ghostWrapperObj={this.state.ghostWrapperObj}
                                    hightlightSnapShotList={this.state.hightlightSnapShotList}
                                    isPendingExport={this.state.isPendingExport}
                                    isPrintRLView={this.state.isPrintRLView}
                                    isActiveFirstTimeLoaded={this.state.isActiveFirstTimeLoaded}
                                    isOverlapProdAvailable={this.state.isOverlapProdAvailable}
                                    isContentDragging={this.state.isContentDragging}
                                    proposeHighlightProd={this.state.proposeHighlightProd}
                                    saveObj={this.state.saveObj}
                                    showFullScreenEditView={this.state.showFullScreenEditView}
                                    showWarningSidebar={this.state.showWarningSidebar}
                                    selectedPrintDept={this.state.selectedPrintDept}
                                    selStoreName={this.state.selStoreName}
                                    shareEmail={this.state.shareEmail} 
                                    userDetails={this.state.userDetails}
                                    warningProdList={this.state.warningProdList}
                                    addItemstoWarning={this.addItemstoWarning}
                                    cannotDropWarningHandle={this.cannotDropWarningHandle}
                                    copyToClipboard={this.copyToClipboard}
                                    checkPrintProdAvailablity={this.checkPrintProdAvailablity}
                                    handlePreviewModal={this.handleProductImgPreview}
                                    handleRDChanges={this.handleRDChanges}
                                    handleChangeShareEmail={this.handleChangeShareEmail}
                                    getPageXYCords={this.getPageXYCords}
                                    getFieldDetails={this.getFieldDetails}
                                    fieldHistoryAdd={this.fieldHistoryAdd}
                                    fieldHistoryRedo={this.fieldHistoryRedo}
                                    fieldHistoryUndo={this.fieldHistoryUndo}
                                    notsaveConfirm={this.notsaveConfirm}
                                    prodDragEnd={this.prodDragEnd}
                                    setFieldView={this.props.setFieldView}
                                    setFieldOverlapAction={this.props.setFieldOverlapAction}
                                    setPrintDept={this.setPrintDept}
                                    toggleWarningSidebar={this.toggleWarningSidebar}
                                    toggleFullScreenView={this.toggleFullScreenView}
                                    togglePrintFullScreen={this.togglePrintFullScreen}
                                    toggleLoadingModal={this.toggleLoadingModal}
                                    togglePrintFullScreenView={this.togglePrintFullScreenView}
                                    updateCutList={this.updateCutList}
                                    updateActiveConvertDetails={this.updateActiveConvertDetails}
                                    updateConvertDetails={this.updateConvertDetails}
                                    updateGhostViewObj={this.updateGhostViewObj}
                                    updateSingleCutProduct={this.updateSingleCutProduct}
                                    updateZoomContent={this.updateZoomContent}
                                    updateFilterRevenueList={this.updateFilterRevenueList}
                                    updateRecentAddedList={this.updateRecentAddedList}
                                    handleopenDetailmodal={this.handleopenDetailmodal}
                                    />
                            </>:<></>}
                        </Col>
                    </Row>

                    {isActiveMode?<BottomSalesContent 
                        t={this.props.t} isRTL={this.props.isRTL} dmode={this.props.dmode} 
                        addedFilters={this.state.addedFilters}
                        changeDatePeriodType={this.changeDatePeriodType}
                        changeDatePeriodRange={this.changeDatePeriodRange}
                        datePeriodType={this.state.datePeriodType}
                        datePeriodRange={this.state.datePeriodRange}
                        handleDeleteFilteredList={this.handleDeleteFilteredList}
                        hightlightSnapShotList={this.state.hightlightSnapShotList}
                        isrpdetailsloading={this.state.isrpdetailsloading} 
                        isrpoverviewloading={this.state.isrpoverviewloading} 
                        issnapshotloading={this.state.issnapshotloading}
                        isActiveMode={isActiveMode}
                        filterLevel={this.state.filterLevel}
                        fieldDeptList={this.state.fieldDeptList}
                        filterrevlist={this.state.filterRevenueList} 
                        exprodlist={this.state.existnewprodlist} 
                        revobj={this.state.rploadedrevenue} 
                        activeViewObj={this.state.activeViewObj}
                        ovrobj={this.state.rploadedoverview}
                        bottomCatSubBrands={this.state.bottomCatSubBrands}
                        snapshotFilters={this.state.snapshotFilters}
                        showingSnapshotList={this.state.showingSnapshotList}
                        snapshotShowFieldOnly={this.state.snapshotShowFieldOnly}
                        selectedDeptIdx={this.state.selectedDeptIdx}
                        copyToClipboard={this.copyToClipboard}  
                        setSelectedDeptIdx={this.setSelectedDeptIdx}
                        toggleHightlightList={this.toggleHightlightList}
                        toggleSnapshotShowFieldOnly={this.toggleSnapshotShowFieldOnly}
                        updateFiltersList={this.updateFiltersList}
                        saleCycleObj={this.state.saleCycleObj}
                        />:<></>}

                    {/* {this.state.isenablefieldedit?<FieldDetailsEdit recheckoverlap={this.recheckOverlapField} iszoomactive={this.state.aczoompanactive} isRTL={this.props.isRTL} isshowedit={this.state.isshowedit} toggleeditview={this.toggleEditView} isenablefieldedit={this.state.isenablefieldedit} saveObj={this.state.saveObj} handlefieldedit={this.handleFieldEditChanges}/>:<></>} */}

                    {this.state.pemview?<ProdMDModal isRTL={this.props.isRTL} pemshow={this.state.pemview} pemobj={this.state.pemobj} saveobj={this.state.saveObj} handlepemview={this.handlePEMView} />:<></>}

                    {this.state.showrotateprod?<ProductRotate isRTL={this.props.isRTL} isshowrotateedit={this.state.isshowrotateedit} showrotateprod={this.state.showrotateprod} selectedrotateprod={this.state.selectedrotateprod} dmode={this.props.dmode} displayuom={this.state.displayUOM} viewrotateprod={this.toggleRotateProd} updaterotateprod={this.updateRotateProd} />:<></>}

                    <div style={{display:"none"}}>
                        <canvas ref={this.dragPreviewCanvas}></canvas>
                    </div>

                </Col>

                {this.state.isShowPreviewProd?<PreviewProduct isshow={this.state.isShowPreviewProd} prodobj={this.state.prodPreviewObj} togglePreviewModal={this.togglePreviewModal} />:<></>}
            
                <div className='draggable-ghost-wrapper' style={{width: 300, height: 100}}></div>
            </Col>:<></>}

            <Modal size={"lg"} show={this.state.showProductUpdateModal} className="prod-edit new-product-update-modal" dir={this.props.isRTL} onHide={()=>this.toggleProductUpdateModal()} backdrop="static" animation={false}>
                <Modal.Body style={{padding:"30px", background:"#F4F6F7"}}>
                    {
                        this.state.showProductUpdateModal === true ?
                        <>
                            <AddNewItemComponent
                                isRTL={this.props.isRTL}
                                prodState={this.state.selectedProduct}
                                ismodal={true}
                                hidemodal={this.toggleProductUpdateModal}
                                hidedelete={true} 
                                size="sm"
                            />
                        </>:
                        <></>
                    }
                </Modal.Body>
            </Modal>
            {this.state.selectedProduct && this.state.isShowPreviewModal===true?
                        <Modal  show={this.state.isShowPreviewModal} className="prod-edit new-product-update-modal" dir={this.props.isRTL} onHide={()=>this.toggleProductEditModal()} backdrop="static" animation={false}>
                            <Modal.Body style={{padding:"30px", background:"#F4F6F7"}}>
                            {
                                    this.state.isShowPreviewModal === true ?
                                    <>
                                        <AddNewItemComponent 
                                            getSimulationcall={this.props.getSimulationcall}
                                            isFromSimulation={false}
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
            {this.state.showPreviewImageModal===true ? 
                <PreviewImage 
                    productid={this.state.previewProductId} 
                    loadfromback={true} 
                    imgurl={""} 
                    isshow={this.state.showPreviewImageModal} 
                    isRTL={this.props.isRTL} 
                    handlePreviewModal={this.handleProductImgPreview} 
                    />
                :<></>
            }

            {this.state.showFullScreenEditView? 
                <FullScreenEditView 
                    showFullScreenEditView={this.state.showFullScreenEditView}
                    t={this.props.t} isRTL={this.props.isRTL} dmode={this.props.dmode} 
                    activeFieldDeptList={this.state.activeFieldDeptList}
                    activeViewObj={this.state.activeViewObj}
                    allSnapshotBrandList={this.state.allSnapshotBrandList}
                    bkpSaveObj={this.state.bkpSaveObj}
                    isPendingExport={this.state.isPendingExport}
                    isPrintRLView={this.state.isPrintRLView}
                    isActiveFirstTimeLoaded={this.state.isActiveFirstTimeLoaded}
                    fieldDeptList={this.state.fieldDeptList}
                    filterLevel={this.state.filterLevel}
                    filterRevenueList={this.state.filterRevenueList}
                    hightlightSnapShotList={this.state.hightlightSnapShotList}
                    printType={this.state.printType}
                    proposeHighlightProd={this.state.proposeHighlightProd}
                    selectedPrintDept={this.state.selectedPrintDept}
                    saveObj={this.state.fullScreenPreviewObj}
                    showWarningSidebar={this.state.showWarningSidebar}
                    selStoreName={this.state.selStoreName} 
                    shareEmail={this.state.shareEmail}
                    userDetails={this.state.userDetails}
                    warningProdList={this.state.warningProdList}
                    addItemstoWarning={this.addItemstoWarning}
                    copyToClipboard={this.copyToClipboard}
                    checkPrintProdAvailablity={this.checkPrintProdAvailablity}
                    handlePreviewModal={this.handleProductImgPreview}
                    notsaveConfirm={this.notsaveConfirm}
                    setPrintDept={this.setPrintDept}
                    handleChangeShareEmail={this.handleChangeShareEmail}
                    toggleWarningSidebar={this.toggleWarningSidebar}
                    toggleFullScreenView={this.toggleFullScreenView}
                    togglePrintFullScreen={this.togglePrintFullScreen}
                    toggleLoadingModal={this.toggleLoadingModal}
                    togglePrintFullScreenView={this.togglePrintFullScreenView}
                    updateActiveConvertDetails={this.updateActiveConvertDetails}
                    updateConvertDetails={this.updateConvertDetails}
                    updateZoomContent={this.updateZoomContent}
                    updateFilterRevenueList={this.updateFilterRevenueList}
                    />
                :<></>
            }

            {this.state.showSingleProdWarning?
                <ProdWarningModal isRTL={this.props.isRTL} t={this.props.t} 
                    showSingleProdWarning={this.state.showSingleProdWarning}
                    warningProdItem={this.state.warningProdItem}
                    copyToClipboard={this.copyToClipboard} 
                    handleProductImgPreview={this.handleProductImgPreview} 
                    toggleSingleProd={this.toggleSingleProd} 
                    />
            :<></>}

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

            <AcViewModal showmodal={(this.state.savemodalshow || this.state.isLoadingModalShow)} message={this.props.t('PLEASE_WAIT')} />
        </>);
    }
}

const mapDispatchToProps = dispatch => ({
    setFieldHistory: (payload) => dispatch(historyFieldAction(payload)),
    setPLanogramdetailsView: (payload) => dispatch(PDviewDataAction(payload)),
    setFieldOverlapAction: (payload) => dispatch(setFieldOverlapAction(payload)),
    setFieldView: (payload) => dispatch(viewFieldAction(payload)),
    setFieldIsNewDraftView: (payload) => dispatch(setFieldIsNewDraft(payload)),
    setFieldRecList: (payload) => dispatch(recprodsFieldAction(payload)),
});
export default withTranslation()(withRouter(connect(null,mapDispatchToProps)(PlanDunitComponent)));