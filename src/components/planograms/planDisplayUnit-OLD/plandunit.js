//import dependencies
import React from 'react';
import { withRouter, Link, Prompt } from 'react-router-dom';
import { connect } from 'react-redux';
import {Breadcrumb, Col, Button, Modal, Row, Tab, Nav, Badge} from 'react-bootstrap'; //Popover
import { v4 as uuidv4 } from 'uuid'; //unique id
import { DiffAddedIcon, ChevronLeftIcon, TrashIcon, XIcon, PlusIcon, PlusCircleIcon, ImageIcon, StopIcon } from '@primer/octicons-react'; //InfoIcon,
import FeatherIcon from 'feather-icons-react';
import { confirmAlert } from 'react-confirm-alert'; //confirm alert
import { withTranslation } from 'react-i18next'; //language support
//import css 
import 'react-circular-progressbar/dist/styles.css';
import './plandunit.css';
//import using services
import { AspectRatioDrawBox, measureConverter, convertUomtoSym, roundOffDecimal, rotateStatus, planigoDiableRoles } from '../../../_services/common.service';
import { submitCollection } from '../../../_services/submit.service'; //gets backend paths
import { alertService } from '../../../_services/alert.service'; //common alert services
import { submitSets } from '../../UiComponents/SubmitSets'; //backcalls handlers
import { AcViewModal } from '../../UiComponents/AcImports'; 
//redux actions
import { historyFieldAction, recprodsFieldAction, PDviewDataAction, setFieldOverlapAction, viewFieldAction, setFieldIsNewDraft } from '../../../actions/planogram/planogram_action';
//import sub components
import ContextMenu from './drawcontext'; //right click popup of field product
import ProdMDModal from './prodmdedit'; //product masterdata edit modal
import FieldDetailsEdit from './fielddetailsedit'; //field details edit sidebar
import ViewRevenueDetails from './viewrevenuedet'; //sales table
import ViewMenu from './viewContext'; //active field right click product popup
// import ViewAITest from './viewAITest'; //ai json test modal
import ViewBaseImage from './viewBaseImage'; //ai base image show modal
import { ViewProposeList } from './viewProposeList'; //propose list
import ProductRotate from './productRotate'; //rotate change modal
import { compareSideToAllowDrop, OverlapSaftyView } from './viewOverlapSafty'; //overlap compare function and overlap safty margin change view
import LeftRightToggle from './leftrighttoggle'; //left right field browse view
import ExportCSV from './excelExport'; //excel export button
import { handleZoomInOut, handlePanView, sortShelvesDesc, checkProductThoughBlock, checkThroughProductsTest, checkProductIsInBottom, checkProdAvailabilityInFeild, refreshRevProPercentages, PreviewProduct,
    ProdsAddSidebar, ProdsWarningSidebar, ProdWarningModal } from './additionalcontents'; //needed common functions

import ImprovementProgress from './improvementProgress'; //improvements view
//import image files
import loadinggif from '../../../assets/img/loading-sm.gif';
import savemodalimg from '../../../assets/img/submit_modal_img.jpg';
import PreviewImage from '../../image_preview/imagePreview.js';
import AddNewItemComponent from '../../products/AddNew/addnew';


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

        this.displaydiv = React.createRef(); //main preview div
        this.actdisplaydiv = React.createRef(); //main active preview div
        this.dragPreviewCanvas = React.createRef(); //drag preview canvas
        this.propviewref = React.createRef(); //propose view link
        this.dragPreviewImage = new Image(); //temp stores dragging image

        this.state = {
            divWidth: 0, divHeight: 0, actDivWidth: 0, actDivHeight: 0, isnottesting: true, 
            viewHeight: 0, viewWidth: 0, aviewHeight: 0, aviewWidth: 0,  displayRatio: 0, adisplayRatio: 0, displayUOM: "cm",
            saveObj: null, viewObj: null, isEdit: false, isListViewActive: "LIST", statfieldid: 0, isAllowChangeField: false, bkpSaveObj: null,
            bkpFieldEditObj: null,
            activeViewObj: null, fieldStatus: "DRAFT", isActiveMode: false, existnewprodlist: [],
            fieldHistory: {}, savemodalshow: true, saftyMargin: 3, saleSaftyMargin: 1.5, checkSaftyMargin: 0, isloadedfielddet: false,

            currentDraggableProd: null, //current dropping product from product sidebar
            currentInternalDraggableProd: null, //field inside selected product 
            allowovrflwprod: false, ovrflwprodlist: [], alloweditoverflwmargin: false, //product overlap
            view: { showDeleteModal: false, currentDeleteProd: null }, //right click product popup
            isShowProdView: false, srchprodsloading: false,
            isShowPreviewProd: false, prodPreviewObj: null,
            loadProdList: [], AllRecentProdList: [], recentProdList: [], filteredProdList: [], pstartpage: 0, ptotalresults: 0, pmaxcount: 5, //loaded products, recently added products and pagination details
            showWarningSidebar: false, warningProdList: [], //show product warning sidebar
            isviewcmenu: false, contxtmenu: null, //svg contxt menu
            ischangesavailable: false, noteinfomsg: null,//auto save
            isselectprodblock: false, isblockmove: false, currentSelectedBlock: null,
            pemview: false, pemobj: null, //product edit view
            isenablefieldedit: false, ismdfieldset: true, //enable field rows edit
            rpchangedprodlist: [], rploadedrevenue: [], rploadedoverview: [], rprecyclelist: [], //revenue/profit changes
            cursorttype: "revenue", cursortview: "DESC", //sales defult sort
            savemodalview: false, savemodalmsg: "", //save waiting modal
            filterRevenueList: [], isrpdetailsloading: false, isrpoverviewloading: false, //sales details loading changes
            showTestAiview: false, isshowedit: false, //ai view
            showbaseimageview: false, baseimagepath: null, //base image show
            showproposelist: false, isProposeDataLoading: false, loadedProposeList: {}, trackedProposeChanges: [], isproposeavailable: false, proposeselecttab: "key-1", propshowhighlight: {isshow: false, itemid: 0, type: 0}, //propose loaded list
            showrotateprod: false, selectedrotateprod: null, isshowrotateedit: true, //rotate product
            showdebuglog: false, debugLogList: [], selectedlocobj: null, //debug view
            selStoreId: 0, //current store id
            //new tools
            zoompanactive: false, activetool: "default", startpan: false,  zoomDrawX: 0, //draft
            aczoompanactive: false, acactivetool: "default", acstartpan: false, aczoomDrawX: 0, //draft

            showPreviewImageModal:false,//image preview modal
            productId:0,

            showSingleProdWarning: false, warningProdItem: null,
            
            showProductUpdateModal:false,selectedProduct:null,

            isDisableEdit: false, //disable edit for certain users
        }
    }

    componentDidMount(){
        this._isMounted = true;

        if(this._isMounted){
            let signedobj = (this.props.signedobj && this.props.signedobj.signinDetails?this.props.signedobj.signinDetails:false);

            this.setState({
                divWidth: (this.displaydiv.current && this.displaydiv.current.offsetWidth?(this.displaydiv.current.offsetWidth - 50):0),
                divHeight: (this.displaydiv.current && this.displaydiv.current.offsetHeight?(this.displaydiv.current.offsetHeight):0),

                actDivWidth: (this.actdisplaydiv.current && this.actdisplaydiv.current.offsetWidth?(this.actdisplaydiv.current.offsetWidth - 50):0),
                actDivHeight: (this.actdisplaydiv.current && this.actdisplaydiv.current.offsetHeight?(this.actdisplaydiv.current.offsetHeight):0),

                isDisableEdit: (signedobj?planigoDiableRoles(signedobj):false),
            }, () => {
                this.initOnloadData(); //onload load field/active field details
            });
            //handle keydown - arrows key actions
            document.addEventListener("keydown", this.typingKeyHandling, false);
        }
    }

    componentWillUnmount = () => {
        this._isMounted = false;
        document.removeEventListener("keydown", this.typingKeyHandling, false);
        window.onbeforeunload = undefined
    }

    componentDidUpdate = () => {
        //shows warning changes available when existing from current field
        if (this.state.ischangesavailable) {
          window.onbeforeunload = () => false
        } else {
          window.onbeforeunload = undefined
        }
    }

    //init onload data calls
    initOnloadData = () => {
        //get redux state details
        var cisedit = (this.props.planogramState&&this.props.planogramState.pgramFieldDetails?true:false); //check is edit view
        var cselstore = (this.props.planogramState&&this.props.planogramState.pgramStore? this.props.planogramState.pgramStore : 0); //get selected store
        //set state
        this.setState({
            statfieldid: (cisedit?this.props.planogramState.pgramFieldDetails.id:0), //current field id
            saveObj: (cisedit?this.props.planogramState.pgramFieldDetails:this.defaultObjectLoad()), //set details field object
            bkpSaveObj: (cisedit?this.props.planogramState.pgramFieldDetails:this.defaultObjectLoad()), //creates backup save object for reset purpose
            fieldHistory: this.defaultFieldHistory(), //default field history
            activeViewObj: null, //active field details
            allowovrflwprod: (this.props.planogramState&&this.props.planogramState.pgramFieldAllowOverlap?this.props.planogramState.pgramFieldAllowOverlap:false), //get is allow to overflow boolean from redux if available
            selStoreId: cselstore, savemodalshow: true,  //sets current storeid 
        }, () => {
            //load field details from back
            this.getFieldDetails(this.state.statfieldid);
            //get recent added product list
            this.loadRecentProdList(this.state.statfieldid);
        });
    }

    //#PLG-DU-PD-H17 shortcuts and arrow key handlers
    typingKeyHandling = (evt) => {
        var ecode = evt.keyCode; //current key code
        var cdprod = this.state.currentInternalDraggableProd; //gets current selected product
        if(ecode === 9){ //tab - shows product sidebar
            if(!this.state.showTestAiview && !this.state.isenablefieldedit){ //only show if test ai view or field edit view closed
                evt.preventDefault();
                if((!this.state.isActiveMode || this.state.isAllowChangeField)){ this.toggleProdView(); }
            }
        } else if(ecode === 27){ //esc - clears all opened sidebars or modals
            evt.preventDefault();
            this.handleEscapeClear();
        } else if(ecode === 37){ //left arrow
            if(!this.state.showTestAiview && !this.state.isenablefieldedit){
                if(this.state.contxtmenu && this.state.contxtmenu.isexpand){
                    evt.preventDefault();
                }
                this.dragmultiplyProducts("left");
            }
        } else if(ecode === 38){ //up arrow
            if(!this.state.showTestAiview && !this.state.isenablefieldedit){
                evt.preventDefault();
                this.dragmultiplyProducts("up");
            }
        } else if(ecode === 39){ //right arrow
            if(!this.state.showTestAiview && !this.state.isenablefieldedit){
                evt.preventDefault();
                this.dragmultiplyProducts("right");
            }
        } else if(ecode === 40){ //down arrow
            if(!this.state.showTestAiview && !this.state.isenablefieldedit){
                evt.preventDefault();
                this.dragmultiplyProducts("down");
            }
        } else if(ecode === 46){ //delete
            if(this.state.isDisableEdit === false && !this.state.showTestAiview && !this.state.isenablefieldedit){
                evt.preventDefault();
                if(cdprod){
                    this.setState({view: { showDeleteModal: true, currentDeleteProd: cdprod.prod }});
                }
            }
        } else if(evt.ctrlKey && ecode === 77) { //ctrl + m - enables expand product
            evt.preventDefault();
            if(this.state.isDisableEdit === false && cdprod){
                this.setState({contxtmenu: {isexpand: true }});
            }
        }
    }
    //default field history
    defaultFieldHistory = () => {
        var dobj = { past: [], present: 0, future: [] };
        this.setState({fieldHistory: dobj});
        return dobj;
    }
    //default save object
    defaultObjectLoad = () => {
        return {x: 0, y: 0, width: 0, height: 0, barcode: "", planogramShelfDto: [], uuid: 0, notes: "", fieldVer: 0};
    }
    //clear active states
    handleEscapeClear = () => {
        this.setState({isviewcmenu: false, contxtmenu:{isexpand: false}, currentDraggableProd: null, currentInternalDraggableProd: null, isselectprodblock: false, isblockmove: false});
    }
    //#PLG-DU-PD-H15 draws green box with mouse when dragging product to indicate product size according to field size
    drawRectCanvas = (cprod,idx) => {
        const canvele = this.dragPreviewCanvas.current;
        var draggingProduct = cprod;  //get dragging product
        //get its width, height
        var curwidth = (draggingProduct.rotatewidth?draggingProduct.rotatewidth:draggingProduct.width);
        var curheight = (draggingProduct.rotateheight?draggingProduct.rotateheight:draggingProduct.height);
        //convert it to field ratio and set to canvas width height
        canvele.width = (measureConverter(draggingProduct.uom,this.state.displayUOM,curwidth) * this.state.displayRatio);
        canvele.height = (measureConverter(draggingProduct.uom,this.state.displayUOM,curheight) * this.state.displayRatio);

        var ctx = canvele.getContext("2d");
        ctx.fillStyle = "#33b87f";
        ctx.fillRect(0,0,canvele.width,canvele.height);
        //convert canvas to data image object
        var canimg = this.dragPreviewCanvas.current.toDataURL("image/png");
        //create new image and se that image src data image object
        var img = new Image();
        img.src = canimg;
        this.dragPreviewImage = img; //and set that image to ref image

        //reset earlier clicked product border
        var ctumbdivs = document.getElementsByClassName("thumb-div");
        for (var i = 0; i < ctumbdivs.length; i++) {
            ctumbdivs[i].style.border = "1px solid #eee"
        }
        //add new product border color - green border
        if(idx > -1)
            document.getElementsByClassName("thumb-div")[idx].style.border = "2px solid #ffc107";

        //update state
        var currprod = {productInfo:draggingProduct};
        this.setState({view: { showDeleteModal: false, currentDeleteProd: currprod },isviewcmenu: false, contxtmenu: {isexpand: true }});
    }
    //get field details
    getFieldDetails = (fieldId) => {
        if(!this.props.istesting){
            submitSets(submitCollection.getSingleFloorFieldByRelation, "?floorLayoutHasFieldId="+fieldId, true).then(res => {
                //console.log(res);
                if(res && res.status && res.extra){
                    var cresltobj = res.extra;
                    this.reinitSaveObj(cresltobj);
                    //load product warnings of existing products
                    //this.loadProductWarnings(this.state.statfieldid);
                } else{
                    this.setState({ saveObj: null, savemodalshow:false, isloadedfielddet:true });
                }
            });
        }
    }
    //load product warnings
    // loadProductWarnings = () => {
    //     if(!this.props.istesting){
    //         let saveobj = this.state.saveObj;
    //         let searchobj = { floorLayoutAisleHasFieldId: saveobj.id }
    //         submitSets(submitCollection.findFieldDepartmentProduct, searchobj, false).then(res => {
    //             //console.log(res);
    //             if(res && res.status && res.extra){
    //                 this.setState({ warningProdList: res.extra });
    //             }
    //         });
    //     }
    // }

    //#PLG-DU-PD-H03 load recent prod list
    loadRecentProdList = (fieldid) => {
        let fieldrecentlist = [];
        let recentalllist = (this.props.planogramState&&this.props.planogramState.pgramFieldRecProds?this.props.planogramState.pgramFieldRecProds:[]);
        //console.log(recentalllist);
        let getfirstitem = (recentalllist.length > 0?recentalllist[0]:false);
        if(getfirstitem && getfirstitem.fieldid === fieldid){
            for (let i = 0; i < recentalllist.length; i++) {
                const recentitem = recentalllist[i];
                if(recentitem.fieldid && recentitem.fieldid === fieldid){
                    fieldrecentlist.push(recentitem);
                }
            }
        } else{
            recentalllist = [];
        }
        //console.log(fieldrecentlist);
        this.setState({ recentProdList: fieldrecentlist, AllRecentProdList: recentalllist });
        this.props.setFieldRecList(recentalllist);
    }
    //get active planogram details - if available
    loadActivePlanogram = () => {
        var csobj = JSON.parse(JSON.stringify(this.state.saveObj));
        //if state is active no need to load from  backcall
        if(this.state.fieldStatus === "ACTIVE"){
            this.setState({isAllowChangeField: false, savemodalshow: false});
            this.loadRDDetails(csobj); //load revenue details
            this.loadRDOverviewDetails(csobj); //load revenue details
        } else{
            this.setState({isAllowChangeField: true});
            var fieldUUID = (this.state.saveObj.uuid?this.state.saveObj.uuid:"");
            var fieldBaseId = (this.state.saveObj.baseFloorLayoutId?this.state.saveObj.baseFloorLayoutId:0);
            submitSets(submitCollection.findActiveFieldByUUID, "?fieldUUID="+fieldUUID+"&baseFloorLayoutId="+fieldBaseId, false).then(res => {
                this.setState({isloadedfielddet: true});
                if(res && res.status && res.extra){
                    //this.drawActiveData(csobj,res.extra);
                    this.setState({ activeViewObj: res.extra }, () => {
                        this.activeCalculateRate();
                    });
                    this.loadRDDetails(csobj,res.extra); //load revenue details
                    this.loadRDOverviewDetails(csobj); //load revenue details
                } else{
                    this.setState({savemodalshow: false});
                    if(this.state.fieldStatus !== "ACTIVE"){
                        this.setState({isActiveMode: false}, () => {
                            this.checkEnableFieldEdit();
                        });
                    }
                }
            });
        }
    }
    //convert loaded active planogra details to drawable width/height
    drawActiveData(draftobj,csobj) {
        var cshelfs = []; var draftshelfs = []; var isalloweditview = true; var isoverlapmarginedit = true;
        if(csobj && Object.keys(csobj).length > 0){
            //set width height details
            var adheight = measureConverter(csobj.masterFieldUom,this.state.displayUOM,csobj.masterFieldHeight) * this.state.adisplayRatio;
            var adwidth = measureConverter(csobj.masterFieldUom,this.state.displayUOM,csobj.masterFieldWidth) * this.state.adisplayRatio;
            
            if (csobj.planogramShelfDto) {
                cshelfs = (csobj.planogramShelfDto?csobj.planogramShelfDto:[]);
                cshelfs.sort(sortShelvesDesc);
                //if draft shelve needs to be filled from active one
                draftshelfs = (draftobj.planogramShelfDto?draftobj.planogramShelfDto:[]);
                draftshelfs.sort(sortShelvesDesc);
                
                var prevGap = 0;
                for (let i = 0; i < cshelfs.length; i++) {
                    const shelf = cshelfs[i];
                    let drawHeight = shelf.height * this.state.adisplayRatio;
                    let drawGap = shelf.gap * this.state.adisplayRatio;



                    //if index more than 0. add draw height+ previus gap to shelve y axis
                    if (i > 0) {
                        for (let index = 0; index < cshelfs.length; index++) {
                            const element = cshelfs[index];
                            if (element.rank === (shelf.rank - 1)) {
                                shelf.x = 0;
                                shelf.y = element.y + (element.drawHeight + prevGap);
                            }
                        }
                    }
                    //sets draw width/height of shelve
                    shelf.drawWidth = adwidth;
                    shelf.drawHeight = drawHeight;
                    shelf.drawGap = drawGap;
                    prevGap = shelf.drawGap;
                    //draft obj draw details set
                    // if(this.state.fieldStatus === "DRAFT" && draftobj.isFieldCopy === false){
                    //     if(draftshelfs[i]){
                    //         draftshelfs[i]["drawWidth"] = adwidth;
                    //         draftshelfs[i]["drawHeight"] = drawHeight;
                    //         draftshelfs[i]["drawGap"] = drawGap;
                    //         draftshelfs[i]["x"] = shelf.x;
                    //         draftshelfs[i]["y"] = shelf.y;
                    //     }
                    // }

                    //if overlapping products available
                    if(shelf.overLappingDto && shelf.overLappingDto.length > 0){
                        isalloweditview = false;
                    }
                    
                    const newdraftprodlist = [];
                    for (var j = 0; j < shelf.planogramProduct.length; j++) {
                        const prodobj = shelf.planogramProduct[j];
                        //const prodInfo = prodobj.productInfo;
                        var tempoldqty = 0;

                        //new draft product
                        const draftprodobj = JSON.parse(JSON.stringify(prodobj));
                        draftprodobj["id"] = uuidv4();
                        draftprodobj["f_uuid"] = uuidv4();
                        draftprodobj["isNew"] = true;
                        draftprodobj["productBlock"] = [];
                        draftprodobj["isFieldCopy"] = true;

                        for (var l = 0; l < prodobj.productBlock.length; l++) {
                            const blockobj = prodobj.productBlock[l];

                            //new draft block
                            const draftblockobj = JSON.parse(JSON.stringify(blockobj));
                            draftblockobj["id"] = uuidv4();
                            draftblockobj["f_uuid"] = uuidv4();
                            draftblockobj["isNew"] = true;
                            draftblockobj["productLocations"] = [];
                            draftblockobj["isFieldCopy"] = true;

                            //convert block x,y to ratio - used in earlier versions
                            blockobj.x = (blockobj.x * this.state.adisplayRatio);
                            blockobj.y = (blockobj.y * this.state.adisplayRatio);
                            //convert block width/height to ratio - used in earlier versions
                            blockobj.drawWidth = measureConverter(prodobj.productUom,this.state.displayUOM,prodobj.productWidth) * this.state.adisplayRatio;
                            blockobj.drawHeight = measureConverter(prodobj.productUom,this.state.displayUOM,prodobj.productHeight) * this.state.adisplayRatio;

                            for (var k = 0; k < blockobj.productLocations.length; k++) {
                                const plocobj = blockobj.productLocations[k];

                                //new draft location
                                const draftplocobj = JSON.parse(JSON.stringify(plocobj));
                                draftplocobj["id"] = uuidv4();
                                draftplocobj["f_uuid"] = uuidv4();
                                draftplocobj["isNew"] = true;
                                draftplocobj["isFieldCopy"] = true;

                                if(draftplocobj.overLappingDto && Object.keys(draftplocobj.overLappingDto).length > 0){
                                    draftplocobj.overLappingDto["id"] = -1;
                                    draftplocobj.overLappingDto["isNew"] = true;
                                }

                                //convert x,y,width,height to ratio
                                plocobj.x = (plocobj.x * this.state.adisplayRatio);
                                plocobj.y = (plocobj.y * this.state.adisplayRatio);
                                plocobj.drawWidth = measureConverter(plocobj.productUom,this.state.displayUOM,plocobj.productWidth) * this.state.adisplayRatio;
                                plocobj.drawHeight = measureConverter(plocobj.productUom,this.state.displayUOM,plocobj.productHeight) * this.state.adisplayRatio;
                                
                                //check is bottom location and add width to front faceing totals
                                var allowbottom = checkProductIsInBottom(shelf.y,shelf.drawHeight,plocobj.y,plocobj.drawHeight);
                                if(allowbottom){
                                    plocobj["isbottom"] = true;
                                }

                                draftblockobj.productLocations.push(draftplocobj);
                                
                                tempoldqty = tempoldqty + 1;
                                isalloweditview = false;

                                if(plocobj.overLappingDto && !plocobj.overLappingDto.isDelete){
                                    isoverlapmarginedit = false;
                                }
                            }

                            draftprodobj.productBlock.push(draftblockobj);
                        }
                        prodobj["tempoldqty"] = tempoldqty;

                        newdraftprodlist.push(draftprodobj);
                    }

                    cshelfs[i] = shelf;
                    if(this.state.fieldStatus === "DRAFT" && draftobj.isFieldCopy === false){
                        if(draftshelfs[i]){
                            draftshelfs[i]["planogramProduct"] = newdraftprodlist;
                        }
                    }
                }
            }
        }
        csobj["planogramShelfDto"] = cshelfs;

        if(this.state.fieldStatus === "DRAFT" && draftobj.isFieldCopy === false){
            draftobj["fieldSafetyMargin"] = csobj.fieldSafetyMargin;
            draftobj["planogramShelfDto"] = draftshelfs;
        }
        
        this.setState({ activeViewObj: csobj, aviewHeight: adheight, aviewWidth: adwidth, isActiveMode: true}, () => {
            //if draft view products needs to be draw from active field product details
            if(this.state.fieldStatus === "DRAFT" && draftobj.isFieldCopy === false){
                //#PLG-DU-FE-H01
                this.setState({ saveObj: draftobj, isenablefieldedit: isalloweditview, alloweditoverflwmargin: isoverlapmarginedit }, () => {
                    this.calculateRate(true);
                });
            }
        });
    }
    //reninit current field object
    reinitSaveObj = (cresltobj) => {
        //check master data and set if not defined
        cresltobj.masterFieldUom = (cresltobj.masterFieldUom&&cresltobj.masterFieldUom!=="none"?cresltobj.masterFieldUom:cresltobj.fieldDto.uom);
        cresltobj.masterFieldWidth = (cresltobj.masterFieldWidth&&cresltobj.masterFieldWidth>0?cresltobj.masterFieldWidth:cresltobj.fieldDto.width);
        cresltobj.masterFieldHeight = (cresltobj.masterFieldHeight&&cresltobj.masterFieldHeight>0?cresltobj.masterFieldHeight:cresltobj.fieldDto.height);

        //if shelves not defined yet
        var isallowfieldedit = false; //allow to edit field edit
        var isalloweditovrmargin = false; //allow to edit overlap margin

        //rightside dealer available
        if(cresltobj.rightSidePlanogramFieldDto && Object.keys(cresltobj.rightSidePlanogramFieldDto).length > 0){
            isalloweditovrmargin = true;
        }
        //if shelve details not found
        if(cresltobj.id > 0 && cresltobj.planogramShelfDto.length === 0){
            var cshelflist = (cresltobj.fieldDto.shelf?cresltobj.fieldDto.shelf:[]);
            var nshelftlist = [];
            for (var i = 0; i < cshelflist.length; i++) {
                var cvlist = cshelflist[i];
                var devslvno = (cshelflist.length - i);
                var scobj = {id: uuidv4(),f_uuid: uuidv4(),width: cvlist.width, height: cvlist.height, gap:  cvlist.gap, uom: cresltobj.masterFieldUom, rank: cvlist.rank, x: cvlist.x, y:cvlist.y, reverseRowNumber: devslvno, planogramProduct: [], planogramShelfChanges: [], isNew: true, isDelete: false}
                nshelftlist.push(scobj);
            }
            cresltobj["planogramShelfDto"] = nshelftlist;
            isallowfieldedit = true; isalloweditovrmargin = false;

        } else if(cresltobj.id > 0 && cresltobj.planogramShelfDto.length > 0){
            isallowfieldedit = true;

            for (var l = 0; l < cresltobj.planogramShelfDto.length; l++) {
                const cshelveobj = cresltobj.planogramShelfDto[l];

                //if overlap items available
                if(cshelveobj.overLappingDto && cshelveobj.overLappingDto.length > 0){
                    isallowfieldedit = false;
                }

                if(!cshelveobj.reverseRowNumber){ //if reverse row number not found
                    var devslvno2 = (cresltobj.planogramShelfDto.length - l);
                    cshelveobj.reverseRowNumber = devslvno2;
                }
                
                //check products added - for field edit purpose
                for (var k = 0; k < cshelveobj.planogramProduct.length; k++) {
                    const plgmprod = cshelveobj.planogramProduct[k];
                    var tempoldqty = 0;
                    if(!plgmprod.isDelete){
                        for (var m = 0; m < plgmprod.productBlock.length; m++) {
                            const prodblock = plgmprod.productBlock[m];
                            if(!prodblock.isDelete){
                                for (var n = 0; n < prodblock.productLocations.length; n++) {
                                    const prodloc = prodblock.productLocations[n];
                                    if(!prodloc.isDelete){
                                        tempoldqty = tempoldqty + 1;
                                        isallowfieldedit = false;
                                        //if overlap object available
                                        if(prodloc.overLappingDto && !prodloc.overLappingDto.isDelete){
                                            isalloweditovrmargin = false;
                                        }
                                    }
                                }
                            }
                        }
                    }
                    plgmprod["tempoldqty"] = tempoldqty;
                }
            }
            cresltobj.planogramShelfDto.sort(sortShelvesDesc); //sort shelves
            
            if(cresltobj.rightSidePlanogramFieldDto){
                cresltobj.rightSidePlanogramFieldDto.planogramShelfDto.sort(sortShelvesDesc);
            }
        }
        
        var cfieldstatus = (cresltobj.floorLayoutStatus?cresltobj.floorLayoutStatus:"DRAFT");
        var cfieldactivemode = (cfieldstatus === "ACTIVE" || (cresltobj.baseFloorLayoutId && cresltobj.baseFloorLayoutId > 0)?true:false);
        
        this.setState({
            saveObj: cresltobj, bkpSaveObj: JSON.parse(JSON.stringify(cresltobj)), existnewprodlist: [],
            displayUOM: cresltobj.masterFieldUom, 
            fieldStatus: cfieldstatus,
            isActiveMode: (cfieldstatus === "ACTIVE"?true:false),
            alloweditoverflwmargin: isalloweditovrmargin,
        }, () => {
            this.setState({isenablefieldedit: (!this.state.isActiveMode?isallowfieldedit:false), isEdit: !isallowfieldedit});
            this.calculateRate(true);

            if(cfieldactivemode){
                this.loadActivePlanogram(); //load active field details
            } else{
                this.setState({savemodalshow: false});
            }
        });
    }
    //#PLG-DU-PD-H02 toggle product view sidebar
    toggleProdView = () => {
        if(this.state.isshowedit){
            alertService.error(this.props.t('CLOSE_FIELD_DETAILS_EDIT_VIEW_FIRST'));
            return false;
        }

        document.getElementById("filterprodtxt").value = "";
        this.setState({
            filteredProdList: [], isShowProdView: !this.state.isShowProdView,
            isviewcmenu: false, contxtmenu: null, isselectprodblock: false, isblockmove: false,
        });
    }
    //onenter search prod list
    handleFilterProducts = (evt) => {
        var ctxt = evt.target.value;
        if(evt.nativeEvent.which === 13){
            this.setState({filteredProdList: [], pstartpage: 1}, () => {
                this.searchProdList(ctxt,0);
            });
        }
    }
    //#PLG-DU-PD-H04 search products list view
    searchProdList = (ctxt,startidx) => {
        let fieldid = this.state.statfieldid;
        let psobj = { productName: ctxt, isReqPagination:true, startIndex:startidx, maxResult:this.state.pmaxcount, withImageUrl:true, floorLayoutAisleHasFieldId:fieldid }
        this.setState({srchprodsloading: true});
        submitSets(submitCollection.searchProds, psobj, true).then(res => {
            //console.log(res);
            var cdata = this.state.filteredProdList;
            this.setState({srchprodsloading: false});
            if(res && res.status){
                for (var i = 0; i < res.extra.length; i++) {
                    cdata.push(res.extra[i]);
                }
                this.setState({ filteredProdList: cdata, pstartpage: startidx });
                if(startidx === 0){
                    this.setState({ptotalresults: res.count});
                }

                //load product modal if the product is from GS1
                if(res.extra.length===1){
                    let pobj = res.extra[0];
                    if(pobj.fromProductLookup===true ){
                        //pobj.fromProductLookup=true;
                        this.setState({selectedProduct:{prodDetails:pobj}},()=>{this.toggleProductUpdateModal()});
                    }
                }

            } else{
                alertService.error(this.props.t('NO_RESULT_FOUND'));
                this.setState({ filteredProdList: cdata });
            }
        });
    }
    //#PLG-DU-PD-H05 onclick load more button in search
    loadMoreProds = () => {
        //add maxcount to current start index
        var cstarttxt = (this.state.pstartpage === 0?(this.state.pmaxcount):(this.state.pstartpage + this.state.pmaxcount));
        var ctxt = document.getElementById("filterprodtxt").value; //get filter typed value
        this.searchProdList(ctxt,cstarttxt);
    }
    //#PLG-DU-PD-H16 triggers on product drag start
    dragStart = (e, productObj, isd3move) => {
        if(!isd3move){
            e.dataTransfer.setDragImage(this.dragPreviewImage, 0,0); //set drag image we generated with canvas
        }
        var draggingProduct = productObj;
        
        //set state
        this.setState({ currentDraggableProd: draggingProduct });
    }
    //trigger on product drag stops
    dragEnd = (e, shelfObj, shelfRef, isinsidemove) => {
        var draggingProduct = this.state.currentDraggableProd; //get draging product
        //set pruduct paste x,y locations
        var xa = (isinsidemove? e.x: e.nativeEvent.offsetX); // - (cpwidth / 2)
        var ya = (isinsidemove? e.y: e.nativeEvent.offsetY);

        var allowToAdd = false;

        if(draggingProduct !== undefined || draggingProduct !== null){
            allowToAdd = this.checkAllowToAdd(e, shelfObj, shelfRef, draggingProduct, xa, ya, this.state.displayRatio); //check allow to add that location - retuns boolean
        }
        //var allowToAdd = true;
        if(!isinsidemove){
            e.stopPropagation();
            e.preventDefault();
        }
        //console.log(xa, ya, draggingProduct);
        for (var l = 0; l < document.getElementsByClassName("sftrect").length; l++) {
            const element = document.getElementsByClassName("sftrect")[l];
            element.style.fill = 'transparent';
        }
        if (allowToAdd) {
            shelfRef.style.fill = 'rgba(144, 255, 173, 0.5)'; //highlights shelve background color
        }
    }
    //clear drag out - removes green fill in shelves when can drop products to shelve
    dragClear = (e, shelfObj, shelfRef) => {
        shelfRef.style.fill = 'transparent';
    }
    //#PLG-DU-PD-H20 triggers on drop product to shelve
    droppedNew = (e, shelfObj, shelfRef, shelfIdx, isxpand) => {
        e.preventDefault(); //fixes firefox image dragging issue
        this.handlePropHighlight(); //sets product highlights

        if(this.state.isDisableEdit === true){
            this.setState({ currentDraggableProd: null });
            return false;
        }

        var spdobj = this.state.saveObj; //get current saveobj

        //get mouse drop x
        var xa = e.nativeEvent.offsetX;

        var draggingProduct = this.state.currentDraggableProd; //get current dragging product
        //check dragging product available
        if (draggingProduct === undefined || draggingProduct === null) {
            alertService.warn(this.props.t('PRODUCT_NOT_SELECTED'))
            return;
        }   
        //check product dimentions available to drop
        if(!this.validateProdDetails(draggingProduct)){
            alertService.warn(this.props.t('PROD_DIMENTIONS_NOTAVAILABLE'));
            return false;
        } else if(!draggingProduct.imageUrl || draggingProduct.imageUrl === ""){
            alertService.warn(this.props.t('PROD_IMAGE_NOTFOUND'));
            return false;
        }

        //check rotate details available
        if(draggingProduct.rotatetype !== undefined && draggingProduct.rotatetype !== "" && draggingProduct.rotatetype !== rotateStatus.FN && draggingProduct.rotatetype !== rotateStatus.DFL){
    
        } else{
            //check is product already added, if true use that product details - product details edit 
            draggingProduct["rotatetype"] = rotateStatus.DFL;
            draggingProduct["rotatewidth"] = draggingProduct.width;
            draggingProduct["rotateheight"] = draggingProduct.height;
            draggingProduct["rotatedepth"] = draggingProduct.depth;
        }

        //if isexpand
        if(isxpand && draggingProduct){
            xa = xa - ((measureConverter(draggingProduct.uom,this.state.displayUOM,draggingProduct.rotatewidth) * this.state.displayRatio) / 2);
        }

        //check dragging product available and allowed to add
        if (draggingProduct && draggingProduct != null) { // && allowToAdd
            //find product in recent added list
            var crecaddedlist = this.state.AllRecentProdList;
            var filterreclist = this.state.recentProdList;
            var isAlreadyAdded = false;

            for (var i = 0; i < crecaddedlist.length; i++) {
                if(crecaddedlist[i].id === draggingProduct.id && crecaddedlist[i].fieldid === this.state.statfieldid){
                    isAlreadyAdded = true;
                    draggingProduct["fieldid"] = spdobj.id;
                    crecaddedlist[i] = draggingProduct;
                }
            }
            //if not add product to it
            if(isAlreadyAdded === false){
                draggingProduct["fieldid"] = spdobj.id;
                crecaddedlist.push(draggingProduct);
                filterreclist.push(draggingProduct);
            }
            //update recent product redux and state
            this.props.setFieldRecList(crecaddedlist);
            this.setState({ recentProdList: filterreclist, AllRecentProdList: crecaddedlist, isviewcmenu: false });

            //set product y position
            var newy = (shelfObj.y + shelfObj.drawHeight) - ((measureConverter(draggingProduct.uom,this.state.displayUOM,draggingProduct.rotateheight) * this.state.displayRatio) + this.state.checkSaftyMargin); //get bottom y point
            
            //find is product can added to bottom of shelve
            var allowToAddBottom = this.checkAllowToAdd(e, shelfObj, shelfRef, draggingProduct, xa, newy, this.state.displayRatio);
            //console.log(allowToAddBottom);
            //is it allow to drop to bottom of shelve
            draggingProduct["isNew"] = true;
            draggingProduct["isDelete"] = false;
            //create object to set as selected product after product add
            var cdrgprod = {shelveidx: shelfIdx, prodidx: 0, blockidx: 0, locidx: 0, prod: null};
            //if product can add to bottom of shelve
            if (allowToAddBottom) {
                //set history object before change current field details
                this.fieldHistoryAdd(JSON.parse(JSON.stringify(this.state.saveObj)),1,JSON.parse(JSON.stringify(this.state.rploadedrevenue)),JSON.parse(JSON.stringify(this.state.rploadedoverview)),JSON.parse(JSON.stringify(this.state.rpchangedprodlist)),JSON.parse(JSON.stringify(this.state.existnewprodlist)),JSON.parse(JSON.stringify(this.state.trackedProposeChanges)),JSON.parse(JSON.stringify(this.state.loadedProposeList)));
                //get current shelve products list
                let selectedShelf = spdobj.planogramShelfDto[shelfIdx];
                var addedProds = selectedShelf.planogramProduct;
                //find current product available in shelve products list
                var prodfound = addedProds.findIndex(x => (x.productInfo.id === draggingProduct.id && x.isDelete === false));

                //snap - check product snapping in near product of shelve
                var prodavailable = this.checkSnapAllow(xa,newy,draggingProduct,shelfObj);
                //if snapping set snapping starting or ending x,y to current product
                if(prodavailable){
                    xa = prodavailable.x;
                    newy = prodavailable.y;
                } else{
                    if(isxpand && draggingProduct){
                        xa = xa + ((measureConverter(draggingProduct.uom,this.state.displayUOM,draggingProduct.rotatewidth) * this.state.displayRatio) / 2);
                    }
                }

                var dpwidth2 = (measureConverter(draggingProduct.uom,this.state.displayUOM,draggingProduct.rotatewidth) * this.state.displayRatio);
                var dpheight2 = (measureConverter(draggingProduct.uom,this.state.displayUOM,draggingProduct.rotateheight) * this.state.displayRatio);
                var xb3 = xa + dpwidth2;
                var yb3 = roundOffDecimal(newy,10);
                //run shelf allow again to check setted values are inside shelve
                let shelveCheck = this.checkOnShelfBox(xa, newy, xb3, yb3, shelfObj, dpwidth2, dpheight2);
                //if product already added to shelve

                let cprodheight = measureConverter(draggingProduct.uom,this.state.displayUOM,draggingProduct.rotateheight) * this.state.displayRatio;
                let maxstackcount = (draggingProduct.maxStackableCount && draggingProduct.maxStackableCount > 0?draggingProduct.maxStackableCount:0);
                let shelfstackcount = Math.floor((roundOffDecimal(selectedShelf.drawHeight,10) / cprodheight));
                let newprodcount = (draggingProduct.isStackable?(maxstackcount > 0 && shelfstackcount >= maxstackcount?maxstackcount:shelfstackcount):1);
                
                let newprodlist = [];
                let newlocy = newy;
                for (let l = 0; l < newprodcount; l++) {
                    //define overlap object
                    let overlaplocobj = null; 
                    if(shelveCheck.isOverlap){
                        overlaplocobj = {
                            shelfId: shelfObj.leftPlanogramShelfId, id: -1,
                            crossingWidth: shelveCheck.overlapX,
                            productWidth: draggingProduct.rotatewidth, productHeight: draggingProduct.rotateheight, productDepth: draggingProduct.rotatedepth,
                            productRotation: draggingProduct.rotatetype,
                            productUom: draggingProduct.uom,
                            drawWidth: measureConverter(draggingProduct.uom,this.state.displayUOM,draggingProduct.rotatewidth) * this.state.displayRatio,
                            drawHeight: cprodheight,
                            qty: 1, sideType: "Left", fieldUom: this.state.displayUOM,
                            x: Math.abs(shelveCheck.overlapX) * -1, y: newlocy, isNew: true, isDelete: false,};
                    }
                    //define location object
                    let plocobj = {id:uuidv4(), f_uuid: uuidv4(), x: xa, y: newlocy,
                        productWidth: draggingProduct.rotatewidth, productHeight: draggingProduct.rotateheight, productDepth: draggingProduct.rotatedepth,
                        productRotation: draggingProduct.rotatetype,
                        drawWidth: measureConverter(draggingProduct.uom,this.state.displayUOM,draggingProduct.rotatewidth) * this.state.displayRatio,
                        drawHeight: cprodheight,
                        isRightSideOverLap: shelveCheck.isOverlap, productUom: draggingProduct.uom, isbottom: true,
                        isNew: true, isDelete: false,
                        overLappingDto: overlaplocobj,
                    };  
                    
                    newprodlist.push(plocobj);

                    newlocy = (newlocy - cprodheight);
                }

                if(prodfound > -1){
                    cdrgprod.prodidx = prodfound;
                    cdrgprod.prod = addedProds[prodfound];
                    //find block if its close to a block3
                    var blockfound = -1;
                    for (var k = 0; k < addedProds[prodfound].productBlock.length; k++) {
                        const blockitem = addedProds[prodfound].productBlock[k];
                        var checkrslt = checkProductThoughBlock(xa, newy, draggingProduct, blockitem, false, this.state.displayUOM, this.state.displayRatio, this.state.saftyMargin);
                        if(checkrslt){
                            blockfound = k;
                        }
                    }
                    
                    //if block found for current product location 
                    var cblockprods = addedProds[prodfound].productBlock;
                    if(blockfound > -1){
                        cblockprods[blockfound].productLocations = cblockprods[blockfound].productLocations.concat(newprodlist);
                        cdrgprod.blockidx = blockfound;
                        cdrgprod.locidx = (cblockprods[blockfound].productLocations.length - 1);

                        //add qty to block change - RD changes
                        var newrdobj1 = {type:"QTY_ADD", product: draggingProduct, shelve: shelfIdx, prodobj: addedProds[prodfound], locobj: null, changeqty: 1};
                        this.handleRDChanges(newrdobj1);
                    } else{ //if block not found create new block
                        var cpobj = {
                            id: uuidv4(),
                            f_uuid: uuidv4(),
                            x: xa, y: newy,
                            width: measureConverter(draggingProduct.uom,this.state.displayUOM,draggingProduct.width),
                            height: measureConverter(draggingProduct.uom,this.state.displayUOM,draggingProduct.height),
                            drawWidth: measureConverter(draggingProduct.uom,this.state.displayUOM,draggingProduct.width) * this.state.displayRatio,
                            drawHeight: measureConverter(draggingProduct.uom,this.state.displayUOM,draggingProduct.height) * this.state.displayRatio,
                            isNew: true, isDelete: false,
                            uom: draggingProduct.uom,
                            productLocations: newprodlist};
                        cblockprods.push(cpobj);
                        cdrgprod.blockidx = (cblockprods.length - 1);

                        //new block create change - RD changes
                        var newrdobj2 = {type:"ADD_NEW_BLOCK", product: draggingProduct, shelve: shelfIdx, prodobj: addedProds[prodfound], locobj: null, changeqty: 1};
                        this.handleRDChanges(newrdobj2);
                    }
                    addedProds[prodfound].productBlock = cblockprods;
                } else{
                    //create new product object
                    var data_obj = {
                        id: uuidv4(),
                        f_uuid: uuidv4(),
                        productWidth: draggingProduct.width, productHeight: draggingProduct.height, productPadding: 0, productDepth: draggingProduct.depth, productUom: draggingProduct.uom,
                        productInfo: draggingProduct,
                        isNew: true, isDelete: false,
                        productBlock: [{
                            id: uuidv4(),
                            f_uuid: uuidv4(),
                            x: xa,
                            y: newy,
                            width: measureConverter(draggingProduct.uom,this.state.displayUOM,draggingProduct.width),
                            height: measureConverter(draggingProduct.uom,this.state.displayUOM,draggingProduct.height),
                            drawWidth: measureConverter(draggingProduct.uom,this.state.displayUOM,draggingProduct.width) * this.state.displayRatio,
                            drawHeight: measureConverter(draggingProduct.uom,this.state.displayUOM,draggingProduct.height) * this.state.displayRatio,
                            isNew: true, isDelete: false,
                            uom: draggingProduct.uom,
                            productLocations: newprodlist
                        }]
                    }
                    //push new product
                    addedProds.push(data_obj);
                    cdrgprod.prodidx = (addedProds.length - 1);
                    cdrgprod.prod = data_obj;

                    //new block create change - RD changes
                    var newrdobj3 = {type:"ADD_NEW_BLOCK", product: draggingProduct, shelve: shelfIdx, prodobj: data_obj, locobj: null, changeqty: newprodcount};
                    this.handleRDChanges(newrdobj3);
                }
                
                spdobj.planogramShelfDto[shelfIdx].planogramProduct = addedProds;
                
                this.setState({ saveObj: spdobj, isenablefieldedit: false, alloweditoverflwmargin: false, ischangesavailable: true, isselectprodblock: false, isblockmove: false, currentInternalDraggableProd: cdrgprod, selectedlocobj: null }, () => {
                    this.checkEnableFieldEdit();
                    this.addItemstoWarning(draggingProduct); //add to warning list if already using in other departments
                });

            } else { //else find nearest bottom
                var xa1 = (xa - this.state.checkSaftyMargin);
                var ya1 = (shelfObj.y - this.state.checkSaftyMargin);
                var xb1 = (xa + (measureConverter(draggingProduct.uom,this.state.displayUOM,draggingProduct.width) * this.state.displayRatio) + this.state.checkSaftyMargin);
                var yb1 = ((shelfObj.y + shelfObj.drawHeight) + this.state.checkSaftyMargin);

                var spdobj2 = this.state.saveObj;
                let selectedShelf = spdobj2.planogramShelfDto[shelfIdx];
                var addedProds2 = selectedShelf.planogramProduct;
                //if product cannot drop to bottom of shelve, find what is near bottom position that can add this product
                var highestObj;
                if (addedProds2.length > 0) {
                    for (var index = 0; index < addedProds2.length; index++) {
                        const rect = addedProds2[index].productBlock;
                        //console.log(rect);
                        for (var l = 0; l < rect.length; l++) {
                            const subrect = rect[l];
                            if(subrect.isDelete === false){
                                for (var v = 0; v < subrect.productLocations.length; v++) {
                                    const locrect = subrect.productLocations[v];
                                    if(locrect.isDelete === false){
                                        var xa2 = locrect.x;
                                        var ya2 = locrect.y;
                                        var xb2 = (locrect.x + subrect.drawWidth);
                                        var yb2 = (locrect.y + subrect.drawHeight);

                                        var rectAllow = checkThroughProductsTest(xa1, ya1, xb1, yb1, xa2, ya2, xb2, yb2);
                                        if (!rectAllow && highestObj === undefined) {
                                            highestObj = locrect;
                                        }

                                        //pick highest
                                        if (!rectAllow && highestObj !== undefined && highestObj.y > locrect.y) {
                                            highestObj = locrect;
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
                //if found a position that can add this product
                if (highestObj) {
                    //set histoty object
                    this.fieldHistoryAdd(JSON.parse(JSON.stringify(this.state.saveObj)),1,JSON.parse(JSON.stringify(this.state.rploadedrevenue)),JSON.parse(JSON.stringify(this.state.rploadedoverview)),JSON.parse(JSON.stringify(this.state.rpchangedprodlist)),JSON.parse(JSON.stringify(this.state.existnewprodlist)),JSON.parse(JSON.stringify(this.state.trackedProposeChanges)),JSON.parse(JSON.stringify(this.state.loadedProposeList)));
                    //convert product x,y,width,height to field ratio
                    var dpwidth = (measureConverter(draggingProduct.uom,this.state.displayUOM,draggingProduct.rotatewidth) * this.state.displayRatio);
                    var dpheight = (measureConverter(draggingProduct.uom,this.state.displayUOM,draggingProduct.rotateheight) * this.state.displayRatio);
                    xa1 = highestObj.x;
                    ya1 = highestObj.y - dpheight; //highest object y - current drop product height gets current product y
                    xb1 = xa1 + dpwidth;
                    yb1 = roundOffDecimal(highestObj.y,10);
                    //run shelf allow again to check setted values are inside shelve
                    var shelveCheck = this.checkOnShelfBox(xa1, ya1, xb1, yb1, shelfObj, dpwidth, dpheight); //check allow to add shelve
                    //if product can add inside shelve
                    if(shelveCheck.boxAllow){
                        let cprodheight = measureConverter(draggingProduct.uom,this.state.displayUOM,draggingProduct.rotateheight) * this.state.displayRatio;
                        let maxstackcount = (draggingProduct.maxStackableCount && draggingProduct.maxStackableCount > 0?draggingProduct.maxStackableCount:0);
                        let shelfstackcount = Math.floor((roundOffDecimal((highestObj.y - selectedShelf.y),10) / cprodheight));
                        let newprodcount = (draggingProduct.isStackable?(maxstackcount > 0 && shelfstackcount >= maxstackcount?maxstackcount:shelfstackcount):1);
                        
                        let newprodlist = [];
                        let newlocy = ya1;
                        for (let l = 0; l < newprodcount; l++) {
                            //define overlap object
                            let overlaplocobj = null;
                            if(shelveCheck.isOverlap){
                                overlaplocobj = {
                                    shelfId: shelfObj.leftPlanogramShelfId, id: -1,
                                    crossingWidth: shelveCheck.overlapX,
                                    productWidth: draggingProduct.rotatewidth, productHeight: draggingProduct.rotateheight, productDepth: draggingProduct.rotatedepth,
                                    productRotation: draggingProduct.rotatetype,
                                    productUom: draggingProduct.uom,
                                    drawWidth: measureConverter(draggingProduct.uom,this.state.displayUOM,draggingProduct.rotatewidth) * this.state.displayRatio,
                                    drawHeight: cprodheight,
                                    qty: 1, sideType: "Left", fieldUom: this.state.displayUOM,
                                    x: Math.abs(shelveCheck.overlapX) * -1, y: newlocy, isNew: true, isDelete: false,};
                            }
                            //define location object
                            let plocobj = {id:uuidv4(), f_uuid: uuidv4(), x: xa1, y: newlocy,
                                productWidth: draggingProduct.rotatewidth, productHeight: draggingProduct.rotateheight, productDepth: draggingProduct.rotatedepth,
                                productRotation: draggingProduct.rotatetype,
                                drawWidth: measureConverter(draggingProduct.uom,this.state.displayUOM,draggingProduct.rotatewidth) * this.state.displayRatio,
                                drawHeight: cprodheight,
                                isRightSideOverLap: shelveCheck.isOverlap, productUom: draggingProduct.uom, isNew: true, isDelete: false,
                                overLappingDto: overlaplocobj,
                            }  
                            
                            newprodlist.push(plocobj);

                            newlocy = (newlocy - cprodheight);
                        }
                        
                        //find product in shelve products list
                        var prodfound2 = addedProds2.findIndex(x => (x.productInfo.id === draggingProduct.id && x.isDelete === false));
                        //if found product in shelve list
                        if(prodfound2 > -1){
                            cdrgprod.prodidx = prodfound2;
                            cdrgprod.prod = addedProds2[prodfound2];
                            //find block if its close to a block3
                            var blockfound2 = -1;
                            for (var t = 0; t < addedProds2[prodfound2].productBlock.length; t++) {
                                const blockitem2 = addedProds2[prodfound2].productBlock[t];
                                var checkrslt2 = checkProductThoughBlock(xa1, ya1, draggingProduct, blockitem2, false, this.state.displayUOM, this.state.displayRatio, this.state.saftyMargin);

                                if(checkrslt2){
                                    blockfound2 = t;
                                }
                            }

                            //if block found
                            var cblockprods2 = addedProds2[prodfound2].productBlock;
                            if(blockfound2 > -1){
                                cblockprods2[blockfound2].productLocations = cblockprods2[blockfound2].productLocations.concat(newprodlist);
                                cdrgprod.blockidx = blockfound2;
                                cdrgprod.locidx = (cblockprods2[blockfound2].productLocations.length - 1);

                                //add qty to block change - RD changes
                                var newrdobj4 = {type:"QTY_ADD", product: draggingProduct, shelve: shelfIdx, prodobj: addedProds2[prodfound2], locobj: null, changeqty: 0};
                                this.handleRDChanges(newrdobj4);
                            } else{ //if not create new block
                                var cpobj2 = {
                                    id: uuidv4(), f_uuid: uuidv4(),
                                    x: xa1,
                                    y: ya1,
                                    width: measureConverter(draggingProduct.uom,this.state.displayUOM,draggingProduct.width),
                                    height: measureConverter(draggingProduct.uom,this.state.displayUOM,draggingProduct.height),
                                    drawWidth: measureConverter(draggingProduct.uom,this.state.displayUOM,draggingProduct.width) * this.state.displayRatio,
                                    drawHeight: measureConverter(draggingProduct.uom,this.state.displayUOM,draggingProduct.height) * this.state.displayRatio,
                                    isNew: true, isDelete: false,
                                    uom: draggingProduct.uom,
                                    productLocations: newprodlist
                                };
                                cblockprods2.push(cpobj2);
                                cdrgprod.blockidx = (cblockprods2.length - 1);

                                //new block create change - RD changes
                                var newrdobj5 = {type:"ADD_NEW_BLOCK", product: draggingProduct, shelve: shelfIdx, prodobj: addedProds2[prodfound2], locobj: null, changeqty: 0};
                                this.handleRDChanges(newrdobj5);
                            }
                            addedProds2[prodfound2].productBlock = cblockprods2;
                        } else{ //new product
                            var data_obj2 = {
                                id: uuidv4(), f_uuid: uuidv4(),
                                productWidth: draggingProduct.width, productHeight: draggingProduct.height, productPadding: 0, productDepth: draggingProduct.depth, productUom: draggingProduct.uom,
                                productInfo: draggingProduct,
                                isNew: true, isDelete: false,
                                productBlock: [{
                                    id: uuidv4(),
                                    f_uuid: uuidv4(),
                                    x: xa1,
                                    y: ya1,
                                    width: measureConverter(draggingProduct.uom,this.state.displayUOM,draggingProduct.width),
                                    height: measureConverter(draggingProduct.uom,this.state.displayUOM,draggingProduct.height),
                                    drawWidth: measureConverter(draggingProduct.uom,this.state.displayUOM,draggingProduct.width) * this.state.displayRatio,
                                    drawHeight: measureConverter(draggingProduct.uom,this.state.displayUOM,draggingProduct.height) * this.state.displayRatio,
                                    isNew: true, isDelete: false,
                                    uom: draggingProduct.uom,
                                    productLocations: newprodlist
                                }]
                            };

                            addedProds2.push(data_obj2);
                            cdrgprod.prodidx = (addedProds2.length - 1);
                            cdrgprod.prod = data_obj2;
                            //new block create change - RD changes
                            var newrdobj6 = {type:"ADD_NEW_BLOCK", product: draggingProduct, shelve: shelfIdx, prodobj: data_obj2, locobj: null, changeqty: 0};
                            this.handleRDChanges(newrdobj6);
                        }
                    }
                    spdobj2.planogramShelfDto[shelfIdx].planogramProduct = addedProds2;
                    
                    this.setState({ saveObj: spdobj2, isenablefieldedit: false, alloweditoverflwmargin: false, ischangesavailable: true, isselectprodblock: false, isblockmove: false, currentInternalDraggableProd: cdrgprod }, () => {
                        this.addItemstoWarning(draggingProduct); //add to warning list if already using in other departments
                    }); //isviewcmenu: false, contxtmenu: null
                }
            }
            //end drop
            if(shelfRef){ shelfRef.style.fill = 'transparent'; }
        } else {
            //
        }
    }
    //check snap allow - using to check product that adding is near of already added near product location
    //or near of walls of dropping shelve
    checkSnapAllow = (newx, newy, draggingProduct, shelfObj) => {
        //check rotate details available
        var dragprodwidth = draggingProduct.width;
        var dragprodheight = draggingProduct.height;
        //check rotate object values available
        if(draggingProduct.rotatetype !== undefined && draggingProduct.rotatetype !== "" && draggingProduct.rotatetype !== rotateStatus.FN && draggingProduct.rotatetype !== rotateStatus.DFL){
            dragprodwidth = draggingProduct.rotatewidth;
            dragprodheight = draggingProduct.rotateheight;
        }
        //snap - find nearest product same as this product
        var sconvprodwidth = (measureConverter(draggingProduct.uom,this.state.displayUOM,dragprodwidth) * this.state.displayRatio);
        var sconvprodheight = (measureConverter(draggingProduct.uom,this.state.displayUOM,dragprodheight) * this.state.displayRatio);
        //create product box from product width,height
        var xa = newx;
        var ya = newy;
        var xb = newx + sconvprodwidth;
        var yb = newy + sconvprodheight;
        //with safty margin
        var snx1 = newx - sconvprodwidth;
        var sny1 = newy - sconvprodheight;
        var snx2 = newx + sconvprodwidth + sconvprodwidth;
        var sny2 = newy + sconvprodheight + sconvprodheight;
        
        //loop though product list
        var founditem = false;
        var snapAllowProducts = [];

        if(shelfObj && shelfObj.planogramProduct){
            for (var i = 0; i < shelfObj.planogramProduct.length; i++) {
                const proditem = shelfObj.planogramProduct[i];
                if(!proditem.isDelete && proditem.productInfo.id === draggingProduct.id){ //check same
                    for (var l = 0; l < proditem.productBlock.length; l++) {
                        const blockitem = proditem.productBlock[l];
                        if(!blockitem.isDelete){
                            for (var k = 0; k < blockitem.productLocations.length; k++) {
                                const locitem = blockitem.productLocations[k];
                                if(!locitem.isDelete){
                                    //check snap side - snap should work if it's on left/right side
                                    var locx1 = roundOffDecimal(locitem.x,10);
                                    var locy1 = roundOffDecimal((locitem.y - this.state.saleSaftyMargin),10);
                                    var locx2 = roundOffDecimal((locitem.x + locitem.drawWidth),10);
                                    var locy2 = roundOffDecimal((locitem.y + locitem.drawHeight),10);

                                    var snapAllow = checkThroughProductsTest(snx1, sny1, snx2, sny2, locx1, locy1, locx2, locy2)

                                    if(!snapAllow){
                                        snapAllowProducts.push({planoLocation :locitem, shelf: shelfObj});
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }

        //loop and find nearest product that snapping. otherwise there can be invalid snap
        var nearest = null
        var previousGapBetweenaddingProd = 0
        if(snapAllowProducts.length === 1){
            nearest = snapAllowProducts[0]
        }else{
            for (let i = 0; i < snapAllowProducts.length; i++) {
                const snapAllowProd = snapAllowProducts[i];
                const prodLocation = snapAllowProd.planoLocation;

                var gapBetweenaddingProd = prodLocation.x - newx;

                //if minuse we have to plus it, sort purposes
                if(gapBetweenaddingProd < 0){
                    gapBetweenaddingProd = gapBetweenaddingProd * -1
                }

                if(i === 0){
                    nearest = snapAllowProducts[i]                 
                    previousGapBetweenaddingProd = gapBetweenaddingProd
                }else{
                    if(gapBetweenaddingProd < previousGapBetweenaddingProd){
                        nearest = snapAllowProducts[i]
                        previousGapBetweenaddingProd = gapBetweenaddingProd
                    }
                }    
            }
        }

        //pick nearest snappign prod
        if(nearest!=null){
            const prodLocation = nearest.planoLocation;
            
            var x1 = roundOffDecimal(prodLocation.x,10);
            var y1 = roundOffDecimal((prodLocation.y - this.state.saleSaftyMargin),10);
            var x2 = roundOffDecimal((prodLocation.x + prodLocation.drawWidth),10);
            var y2 = roundOffDecimal((prodLocation.y + prodLocation.drawHeight),10);

            //right side snap
            if (x1 < xb && ((x2 > xa) === false) && y1 < yb && y2 > ya) {
                founditem = {"x":((prodLocation.x + prodLocation.drawWidth)), "y": ((prodLocation.y + prodLocation.drawHeight) - sconvprodheight)};
            }

            //left side snap
            if (((x1 < xb) === false) && x2 > xa && y1 < yb && y2 > ya) {
                founditem = {"x":((prodLocation.x - sconvprodwidth)), "y": ((prodLocation.y + prodLocation.drawHeight) - sconvprodheight)};
            }
        }

        //if false find it near a shelve end
        if(!founditem){
           var allwovrlow = this.state.allowovrflwprod; //only right side allowed
            //is it left
            if(snx1 < (shelfObj.x) && snx2 < (shelfObj.x + shelfObj.drawWidth)){
                var slx1 = shelfObj.x;
                var sly1 = ((shelfObj.y + shelfObj.drawHeight) - sconvprodheight);
                founditem = {"x":slx1, "y": sly1};
            }
            //is it right
            else if(snx1 > shelfObj.x && snx2 > (shelfObj.x + shelfObj.drawWidth)){
                var slx2 = (allwovrlow && (snx1 < (shelfObj.x + shelfObj.drawWidth))?newx:((shelfObj.x + shelfObj.drawWidth) - sconvprodwidth));
                var sly2 = ((shelfObj.y + shelfObj.drawHeight) - sconvprodheight);
                founditem = {"x":slx2, "y": sly2};
            }
            if(founditem){
                var notoverlappingprod = this.checkAllowToAdd(null, shelfObj, null, draggingProduct, founditem.x, founditem.y, this.state.displayRatio);
                if(!notoverlappingprod){
                    founditem = false;
                }
            }
        }
        return founditem;
    }
    //#PLG-DU-PD-H18 multiply product on arrowkeys
    dragmultiplyProducts = (angle) => {
        var csobj = this.state.saveObj;
        var cisexpand = (this.state.contxtmenu && this.state.contxtmenu.isexpand?true:false);
        var selcurobj = this.state.currentInternalDraggableProd; //get current selected prod
        //is it selected
        if(selcurobj){
            var shelf = csobj.planogramShelfDto[selcurobj.shelveidx];

            var mainProduct = shelf.planogramProduct[selcurobj.prodidx].productBlock[selcurobj.blockidx];
            var mainProductBlock = shelf.planogramProduct[selcurobj.prodidx].productBlock[selcurobj.blockidx];
            var currentlySelectedProd = mainProductBlock.productLocations[selcurobj.locidx];
            
            if (currentlySelectedProd) {
                //create new product object to check object
                var newProd = {}
                newProd.id = -1;
                newProd.isNew = true;
                newProd.drawWidth = currentlySelectedProd.drawWidth;
                newProd.drawHeight = currentlySelectedProd.drawHeight;
                newProd.uom = currentlySelectedProd.productUom;
                
                //if it's not multiplying add f_uuid to new object
                if(!cisexpand){
                    newProd.id = currentlySelectedProd.id;
                }

                if (angle === "left") {
                    newProd.x = currentlySelectedProd.x - (cisexpand?currentlySelectedProd.drawWidth:1)
                    newProd.y = currentlySelectedProd.y
                } else if (angle === "up") {
                    newProd.x = currentlySelectedProd.x
                    newProd.y = currentlySelectedProd.y - (cisexpand?currentlySelectedProd.drawHeight:1)
                } else if (angle === "right") {
                    newProd.x = currentlySelectedProd.x + (cisexpand?currentlySelectedProd.drawWidth:1)
                    newProd.y = currentlySelectedProd.y
                } else if (angle === "down") {
                    newProd.x = currentlySelectedProd.x
                    newProd.y = currentlySelectedProd.y + (cisexpand?currentlySelectedProd.drawHeight:1)
                }
                if (newProd) {
                    //check it's multiplying or moving
                    if(this.state.contxtmenu && this.state.contxtmenu.isexpand){
                        this.multiplyProductToDropZone(shelf, newProd, mainProduct, currentlySelectedProd, angle);
                    } else{
                        if(this.state.isselectprodblock && this.state.isblockmove){
                            if(angle === "left" || angle === "right"){
                                this.changeBlockOnShelf(shelf, mainProductBlock, angle, currentlySelectedProd);
                            }
                        } else{
                            this.changeProductOnShelf(shelf, newProd, mainProduct, currentlySelectedProd);
                        }
                    }
                }
            }
        }
    }
    //when change position of product block validate block movement - that checks allow to move block
    changeBlockOnShelf = (shelf, mainProductBlock, cangle, prodLocation) => {
        if (this.state.saveObj && shelf && mainProductBlock) {
            if(mainProductBlock && mainProductBlock.productLocations && mainProductBlock.productLocations.length > 0){
                const field = JSON.parse(JSON.stringify(this.state.saveObj));
                const cselprod = JSON.parse(JSON.stringify(this.state.currentInternalDraggableProd));
                var isblockallowtomove = true;
                const changeMainBlock = JSON.parse(JSON.stringify(mainProductBlock));

                var isovernewblock = false; var newlocationlist = [];
                for (let b = 0; b < changeMainBlock.productLocations.length; b++) {
                    const selctedProd = changeMainBlock.productLocations[b];

                    if(isblockallowtomove){ //if one item not allow to add reducing all loops by falsing thi boolean to reduce loop weight
                        //change product x,y to angle
                        if (cangle === "left") {
                            selctedProd.x = (selctedProd.x - 1);
                        } else if (cangle === "up") {
                            selctedProd.y = (selctedProd.y - 1);
                        } else if (cangle === "right") {
                            selctedProd.x = (selctedProd.x + 1);
                        } else if (cangle === "down") {
                            selctedProd.y = (selctedProd.y + 1);
                        }

                        //check on box
                        var shelveCheck = this.checkOnShelfBox(selctedProd.x, selctedProd.y, (selctedProd.x + selctedProd.drawWidth), roundOffDecimal((selctedProd.y + selctedProd.drawHeight),10), shelf, selctedProd.drawWidth, selctedProd.drawHeight);
                        
                        if (shelveCheck.boxAllow) {
                            //isoverlap available
                            if(shelveCheck.isOverlap){
                                if(selctedProd.overLappingDto){ //if overlap obj avalable
                                    selctedProd.overLappingDto["crossingWidth"] = shelveCheck.overlapX;
                                    selctedProd.overLappingDto["x"] = (Math.abs(shelveCheck.overlapX) * -1);
                                    selctedProd.overLappingDto["y"] = selctedProd.y;
                                    selctedProd.overLappingDto["isDelete"] = false;
                                } else{
                                    var overlaplocobj = {
                                        shelfId: shelf.leftPlanogramShelfId, id: -1,
                                        crossingWidth: shelveCheck.overlapX,
                                        productWidth: selctedProd.productWidth, productHeight: selctedProd.productHeight, productDepth: selctedProd.productDepth,
                                        productRotation: selctedProd.productRotation,
                                        productUom: selctedProd.productUom,
                                        drawWidth: measureConverter(selctedProd.productUom,this.state.displayUOM,selctedProd.productWidth) * this.state.displayRatio,
                                        drawHeight: measureConverter(selctedProd.productUom,this.state.displayUOM,selctedProd.productHeight) * this.state.displayRatio,
                                        qty: 1, sideType: "Left", fieldUom: this.state.displayUOM,
                                        x: (Math.abs(shelveCheck.overlapX) * -1), y: selctedProd.y, isNew: true, isDelete: false,};
                                        selctedProd["overLappingDto"] = overlaplocobj;
                                }
                            } else{
                                if(selctedProd.overLappingDto){
                                    selctedProd.overLappingDto["isDelete"] = true;
                                    selctedProd.overLappingDto["isNew"] = false;
                                } else{
                                    selctedProd["overLappingDto"] = null;
                                }
                            }
                            
                            //check through products
                            var allowToAdd = true;

                            var xa1 = selctedProd.x;
                            var ya1 = selctedProd.y;
                            var xb1 = selctedProd.x + selctedProd.drawWidth;
                            var yb1 = selctedProd.y + selctedProd.drawHeight;

                            //check it's allow to move to that direction - see any products overlapping
                            if(shelf){
                                const planoshelf = field.planogramShelfDto[cselprod.shelveidx];

                                for (let i = 0; i < planoshelf.planogramProduct.length; i++) {
                                    const planoProduct = planoshelf.planogramProduct[i];

                                    for (let j = 0; j < planoProduct.productBlock.length; j++) {
                                        const planoBlock = planoProduct.productBlock[j];

                                        var isblockmerging = false;
                                        if(planoBlock.id !== mainProductBlock.id && !planoBlock.isDelete){
                                            //filter products in shelve from moving side
                                            const filteredBlockProds = (planoBlock.productLocations?planoBlock.productLocations.filter(litem => (cangle === "left" && litem.x < selctedProd.x) || (cangle === "right" && litem.x > selctedProd.x)
                                            || (cangle === "up" && litem.y < selctedProd.y) || (cangle === "down" && litem.y > selctedProd.y)):[]);
                                            
                                            for (let k = 0; k < filteredBlockProds.length; k++) {
                                                const productLocation = filteredBlockProds[k];

                                                //if not current product
                                                if (!productLocation.isDelete && productLocation.id !== selctedProd.id) {
                                                    const x1 = productLocation.x
                                                    const y1 = productLocation.y
                                                    const x2 = x1 + productLocation.drawWidth
                                                    const y2 = y1 + productLocation.drawHeight

                                                    var rectAllow = checkThroughProductsTest(xa1, ya1, xb1, yb1, x1, y1, x2, y2)
                                                    if (!rectAllow) {
                                                        allowToAdd = false;
                                                        isblockallowtomove = false;
                                                        break;

                                                    } else{ //check block merge
                                                        if(planoProduct.productInfo.id === cselprod.prod.productInfo.id){ //same product
                                                            const cpx1 = (selctedProd.x - this.state.saleSaftyMargin);
                                                            const cpx2 = ((selctedProd.x + mainProductBlock.drawWidth) + this.state.saleSaftyMargin);
                                                            //find loc in x range
                                                            if((x1 < cpx1 && x2 > cpx1) || (x1 < cpx2 && x2 > cpx2)){
                                                                isblockmerging = true;
                                                            }
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                        if(isblockmerging){
                                            //remove current block loc and add to new arr
                                            for (let b = 0; b < planoBlock.productLocations.length; b++) {
                                                const nblockloc = planoBlock.productLocations[b];

                                                const newlocobj = JSON.parse(JSON.stringify(nblockloc));
                                                newlocobj["id"] = uuidv4(); newlocobj["f_uuid"] = uuidv4(); newlocobj["isNew"] = true;
                                                if(newlocobj.overLappingDto){
                                                    newlocobj.overLappingDto["id"] = uuidv4();
                                                    newlocobj.overLappingDto["isNew"] = true;
                                                } 
                                                newlocationlist.push(newlocobj);
                                                nblockloc["isDelete"] = true;
                                                nblockloc["isNew"] = false;
                                                if(nblockloc.overLappingDto){
                                                    nblockloc.overLappingDto["isDelete"] = true;
                                                    nblockloc.overLappingDto["isNew"] = false;
                                                }
                                            }

                                            planoBlock["isDelete"] = true;
                                            planoBlock["isNew"] = false;
                                            isovernewblock = true;
                                        }

                                        if(!allowToAdd){ break; }
                                    }
                                    if(!allowToAdd){ break; }
                                }
                            }

                        } else{
                            isblockallowtomove = false;
                        }
                    }
                }
                //is block allow to move
                if(isblockallowtomove){
                    this.fieldHistoryAdd(JSON.parse(JSON.stringify(this.state.saveObj)),3,JSON.parse(JSON.stringify(this.state.rploadedrevenue)),JSON.parse(JSON.stringify(this.state.rploadedoverview)),JSON.parse(JSON.stringify(this.state.rpchangedprodlist)),JSON.parse(JSON.stringify(this.state.existnewprodlist)),JSON.parse(JSON.stringify(this.state.trackedProposeChanges)),JSON.parse(JSON.stringify(this.state.loadedProposeList)));

                    //add new block locations to curent block
                    if(isovernewblock && newlocationlist.length > 0){
                        const newlocmergelist = changeMainBlock.productLocations.concat(newlocationlist);
                        changeMainBlock.productLocations = newlocmergelist;
                    }

                    mainProductBlock = changeMainBlock;

                    var curmainprod = field.planogramShelfDto[cselprod.shelveidx].planogramProduct[cselprod.prodidx];
                    var draggingProduct = cselprod.prod.productInfo;

                    curmainprod.productBlock[cselprod.blockidx] = mainProductBlock;

                    this.setState({ saveObj: field });

                    //block item location change - RD changes
                    var newrdobj7 = {type:"POSITION_CHANGE", iscalc: false, product: draggingProduct, shelve: cselprod.shelveidx, prodobj: cselprod.prod, locobj: null, changeqty: 0};
                    this.handleRDChanges(newrdobj7);
                }

            }
        }
    }
    //when change position of product validate product movement
    changeProductOnShelf = (shelf, selctedProd, mainProductBlock, prodLocation) => {
        if (this.state.saveObj && selctedProd && shelf && mainProductBlock) {

            //check on box
            var shelveCheck = this.checkOnShelfBox(selctedProd.x, selctedProd.y, (selctedProd.x + selctedProd.drawWidth), roundOffDecimal((selctedProd.y + selctedProd.drawHeight),10), shelf, selctedProd.drawWidth, selctedProd.drawHeight);

            if (shelveCheck.boxAllow) {
                //check through products
                var allowToAdd = true;

                var xa1 = selctedProd.x;
                var ya1 = selctedProd.y;
                var xb1 = selctedProd.x + selctedProd.drawWidth;
                var yb1 = selctedProd.y + selctedProd.drawHeight;
                //check it's allow to move to that direction - see any products overlapping
                if (shelf) {
                    const planoshelf = shelf;

                    for (let i = 0; i < planoshelf.planogramProduct.length; i++) {
                        const planoProduct = planoshelf.planogramProduct[i];

                        for (let j = 0; j < planoProduct.productBlock.length; j++) {
                            const planoBlock = planoProduct.productBlock[j];

                            if(!planoBlock.isDelete){
                                for (let k = 0; k < planoBlock.productLocations.length; k++) {
                                    const productLocation = planoBlock.productLocations[k];

                                    //if not current product
                                    if (!productLocation.isDelete && productLocation.id !== selctedProd.id) {
                                        var x1 = productLocation.x
                                        var y1 = productLocation.y
                                        var x2 = x1 + productLocation.drawWidth
                                        var y2 = y1 + productLocation.drawHeight

                                        var rectAllow = checkThroughProductsTest(xa1, ya1, xb1, yb1, x1, y1, x2, y2)
                                        if (!rectAllow) {
                                            allowToAdd = false
                                            break;
                                        }
                                    }
                                }
                            }
                            if(!allowToAdd){ break; }
                        }
                        if(!allowToAdd){ break; }
                    }
                }
                
                if (allowToAdd) {
                    const field = this.state.saveObj;
                    this.fieldHistoryAdd(JSON.parse(JSON.stringify(this.state.saveObj)),3,JSON.parse(JSON.stringify(this.state.rploadedrevenue)),JSON.parse(JSON.stringify(this.state.rploadedoverview)),JSON.parse(JSON.stringify(this.state.rpchangedprodlist)),JSON.parse(JSON.stringify(this.state.existnewprodlist)),JSON.parse(JSON.stringify(this.state.trackedProposeChanges)),JSON.parse(JSON.stringify(this.state.loadedProposeList)));

                    //find block if its close to a block
                    var cselprod = this.state.currentInternalDraggableProd;
                    var curmainprod = field.planogramShelfDto[cselprod.shelveidx].planogramProduct[cselprod.prodidx];
                    var draggingProduct = cselprod.prod.productInfo;

                    var cprodblock = curmainprod.productBlock[cselprod.blockidx];
                    var cblockloc = cprodblock.productLocations[cselprod.locidx];

                    //update current location x,y
                    if(cblockloc){
                        cblockloc.x = selctedProd.x;
                        cblockloc.y = selctedProd.y;
                        
                        if(shelveCheck.isOverlap){
                            if(cblockloc.overLappingDto){ //if overlap obj avalable
                                cblockloc.overLappingDto["crossingWidth"] = shelveCheck.overlapX;
                                cblockloc.overLappingDto["x"] = (Math.abs(shelveCheck.overlapX) * -1);
                                cblockloc.overLappingDto["y"] = selctedProd.y;
                                cblockloc.overLappingDto["isDelete"] = false;
                            } else{
                                var overlaplocobj = {
                                    shelfId: field.planogramShelfDto[cselprod.shelveidx].leftPlanogramShelfId, id: -1,
                                    crossingWidth: shelveCheck.overlapX,
                                    productWidth: cblockloc.productWidth, productHeight: cblockloc.productHeight, productDepth: cblockloc.productDepth,
                                    productRotation: cblockloc.productRotation,
                                    productUom: cblockloc.productUom,
                                    drawWidth: measureConverter(cblockloc.productUom,this.state.displayUOM,cblockloc.productWidth) * this.state.displayRatio,
                                    drawHeight: measureConverter(cblockloc.productUom,this.state.displayUOM,cblockloc.productHeight) * this.state.displayRatio,
                                    qty: 1, sideType: "Left", fieldUom: this.state.displayUOM,
                                    x: (Math.abs(shelveCheck.overlapX) * -1), y: selctedProd.y, isNew: true, isDelete: false,};
                                cblockloc["overLappingDto"] = overlaplocobj;
                            }
                        } else{
                            if(cblockloc.overLappingDto){
                                cblockloc.overLappingDto["isDelete"] = true;
                                cblockloc.overLappingDto["isNew"] = false;
                            } else{
                                cblockloc["overLappingDto"] = null;
                            }
                        }
                    }
                    this.setState({ saveObj: field });

                    //block item location change - RD changes
                    var newrdobj7 = {type:"POSITION_CHANGE", iscalc: false, product: draggingProduct, shelve: cselprod.shelveidx, prodobj: cselprod.prod, locobj: cblockloc, changeqty: 0};
                    this.handleRDChanges(newrdobj7);

                    if(this.bctimeout){clearTimeout(this.bctimeout);} //clear timeout setted before

                    //check moving product x,y and check block list to see if it's changed it's current block
                    this.bctimeout = setTimeout(() => {
                        //find block
                        var blockfound = -1;
                        for (var k = 0; k < curmainprod.productBlock.length; k++) {
                            const blockitem = curmainprod.productBlock[k];
                            var checkoriprod = {uom: curmainprod.productUom, width: curmainprod.productWidth, height: curmainprod.productHeight, rotatewidth: cblockloc.productWidth, rotateheight: cblockloc.productHeight, rotatetype: cblockloc.productRotation};
                            var checkrslt = checkProductThoughBlock(xa1, ya1, checkoriprod, blockitem, cblockloc.id, this.state.displayUOM, this.state.displayRatio, this.state.saftyMargin);
                            if(checkrslt){
                                blockfound = k;
                            }
                        }
                        //if found a block
                        var noverlaplocobj = (shelveCheck.isOverlap && prodLocation.overLappingDto?JSON.parse(JSON.stringify(prodLocation.overLappingDto)):null); //overlapping obj avalable
                        if(noverlaplocobj){
                            noverlaplocobj["id"] = -1;
                            noverlaplocobj["isNew"] = true;
                            noverlaplocobj["isDelete"] = false;
                        }
                        
                        var nlocobj = {id:uuidv4(), f_uuid: uuidv4(), uom: cblockloc.uom, x: selctedProd.x, y: selctedProd.y, 
                            productWidth: prodLocation.productWidth, productHeight: prodLocation.productHeight, productDepth: prodLocation.productDepth,
                            productRotation: prodLocation.productRotation, drawWidth: prodLocation.drawWidth, drawHeight: prodLocation.drawHeight,
                            isRightSideOverLap: shelveCheck.isOverlap, productUom: prodLocation.productUom, isDelete: false, isNew: true,
                            overLappingDto: noverlaplocobj,
                        };
                        
                        if(blockfound > -1){
                            var foundprodblock = curmainprod.productBlock[blockfound];
                            //add to new one and remove from older one
                            if(cprodblock.id !== foundprodblock.id){
                                foundprodblock.productLocations.push(nlocobj);
                                //and remove current location from block
                                if(cblockloc.id > 0){
                                    cblockloc.isDelete = true;
                                    cblockloc.isNew = false;
                                    if(cblockloc.overLappingDto){
                                        cblockloc.overLappingDto["isDelete"] = true;
                                        cblockloc.overLappingDto["isNew"] = false;
                                    }
                                } else{
                                    cprodblock.productLocations.splice(cselprod.locidx,1);
                                }
                            }
                        } else{ //not found a block
                            var newblkobj = {
                                id: uuidv4(), f_uuid: uuidv4(), isDelete: false, isNew: true,
                                x: selctedProd.x, y: selctedProd.y, uom: cprodblock.uom, width: cprodblock.width, height: cprodblock.height, drawWidth: cprodblock.drawWidth, drawHeight: cprodblock.drawHeight,
                                productLocations: [nlocobj]
                            };
                            
                            curmainprod.productBlock.push(newblkobj);
                            //and remove current location from block
                            if(cblockloc.id > 0){
                                cblockloc.isDelete = true;
                                cblockloc.isNew = false;
                                if(cblockloc.overLappingDto){
                                    cblockloc.overLappingDto["isDelete"] = true;
                                    cblockloc.overLappingDto["isNew"] = false;
                                }
                            } else{
                                cprodblock.productLocations.splice(cselprod.locidx,1);
                            }
                        }
                        //remove emptied blocks
                        var filtredBlklist = [];
                        for (let z = 0; z < curmainprod.productBlock.length; z++) {
                            const csblck = curmainprod.productBlock[z];
                            if(csblck.productLocations.length > 0){
                                filtredBlklist.push(csblck);
                            } else{
                                if(csblck.id > 0){
                                    csblck["isDelete"] = true;
                                    csblck["isNew"] = false;
                                    filtredBlklist.push(csblck);
                                }
                            }
                        }
                        curmainprod.productBlock = filtredBlklist;
                        //find current object is exists
                        if(!curmainprod.productBlock[cselprod.blockidx]){
                            cselprod = null;
                        }
                        this.setState({saveObj: field, currentInternalDraggableProd: cselprod});
                    }, 1100);
                }
            }
        }
    }
    //#PLG-DU-PD-H19 multiply product validations
    multiplyProductToDropZone = async (shelf, addingProduct, mainProductBlock, mainProductLocation, cangle) => {
        //check product available
        if (addingProduct === undefined || addingProduct === null) {
            alertService.warn(this.props.t('PRODUCT_NOT_SELECTED'))
            return;
        }

        if (this.state.saveObj && shelf && addingProduct) {
            //check on box
            var shelveCheck = this.checkOnShelfBox(addingProduct.x, roundOffDecimal(addingProduct.y,10), (addingProduct.x + mainProductLocation.drawWidth), roundOffDecimal((addingProduct.y + mainProductLocation.drawHeight),10),shelf,mainProductLocation.drawWidth,mainProductLocation.drawHeight)
            
            var allowToAdd = true
            if (shelveCheck.boxAllow) {
                //create x,y box of current product
                var xa1 = addingProduct.x;
                var ya1 = addingProduct.y;
                var xb1 = addingProduct.x + mainProductLocation.drawWidth;
                var yb1 = addingProduct.y + mainProductLocation.drawHeight;

                let isallowstack = true;
                var botxa1 = addingProduct.x;
                var botya1 = shelf.y;
                var botxb1 = addingProduct.x + mainProductLocation.drawWidth;
                var botyb1 = (shelf.y + shelf.drawHeight);

                //get current product details
                var csprodobj = this.state.currentInternalDraggableProd;
                var spdobj = this.state.saveObj;
                var cshelveobj = spdobj.planogramShelfDto[csprodobj.shelveidx];
                var addedProds = cshelveobj.planogramProduct;
                var dragmainprod = cshelveobj.planogramProduct[csprodobj.prodidx];
                var draggingProduct = cshelveobj.planogramProduct[csprodobj.prodidx].productInfo;

                let foundloclist = [];
                if (shelf) {
                    const planoshelf = shelf;
                    //check through current shelve products
                    for (let i = 0; i < planoshelf.planogramProduct.length; i++) {
                        const planoProduct = planoshelf.planogramProduct[i];

                        for (let j = 0; j < planoProduct.productBlock.length; j++) {
                            const planoBlock = planoProduct.productBlock[j];

                            for (let k = 0; k < planoBlock.productLocations.length; k++) {
                                const productLocation = planoBlock.productLocations[k];

                                if (!productLocation.isDelete) {

                                    if (planoshelf.id === shelf.id) {
                                        var ploc = productLocation;
                                        ploc.drawWidth = productLocation.drawWidth;
                                        ploc.drawHeight = productLocation.drawHeight;
                                        //create current location x,y box
                                        var x1 = productLocation.x
                                        var y1 = productLocation.y
                                        var x2 = x1 + productLocation.drawWidth
                                        var y2 = y1 + productLocation.drawHeight
                                        //check product overlapping
                                        var rectAllow = checkThroughProductsTest(xa1, ya1, xb1, yb1, x1, y1, x2, y2);

                                        //check bottom product available
                                        // if(planoProduct.productInfo.id !== draggingProduct.id){
                                            var botrectAllow = checkThroughProductsTest(botxa1, botya1, botxb1, botyb1, x1, y1, x2, y2);
                                            if(!botrectAllow){
                                                foundloclist.push(JSON.parse(JSON.stringify(productLocation)));
                                                isallowstack = false;
                                            }    
                                        // } else{
                                        //     foundloclist.push(JSON.parse(JSON.stringify(productLocation)));
                                        // }
                                        
                                        if (!rectAllow) {
                                            allowToAdd = false
                                            break;
                                        }
                                    }
                                }
                            }
                            if(!allowToAdd){ break; }
                        }
                        if(!allowToAdd){ break; }
                    }
                }
                // console.log(foundloclist);

                //if allow to multiply product
                if (allowToAdd) {
                    this.fieldHistoryAdd(JSON.parse(JSON.stringify(this.state.saveObj)),4,JSON.parse(JSON.stringify(this.state.rploadedrevenue)),JSON.parse(JSON.stringify(this.state.rploadedoverview)),JSON.parse(JSON.stringify(this.state.rpchangedprodlist)),JSON.parse(JSON.stringify(this.state.existnewprodlist)),JSON.parse(JSON.stringify(this.state.trackedProposeChanges)),JSON.parse(JSON.stringify(this.state.loadedProposeList)));
                    
                    var prodfound = addedProds.findIndex(x => (x.productInfo.id === draggingProduct.id && x.isDelete === false));
                    var prodadded = {}; var prodblockidx = 0; var prodlocidx = 0;

                    //define location object
                    let bottomcount = 0;
                    let coverflowobj = null;
                    if(mainProductLocation.overLappingDto){
                        if(shelveCheck.isOverlap){
                            coverflowobj = JSON.parse(JSON.stringify(mainProductLocation.overLappingDto));
                            coverflowobj["id"] = -1;
                            coverflowobj["y"] = ya1;
                            coverflowobj["isNew"] = true;
                            coverflowobj["isDelete"] = false;
                        }
                    } else{
                        if(shelveCheck.isOverlap){
                            coverflowobj = {
                                shelfId: shelf.leftPlanogramShelfId, id: -1,
                                crossingWidth: shelveCheck.overlapX,
                                productWidth: mainProductLocation.productWidth, productHeight: mainProductLocation.productHeight, productDepth: mainProductLocation.productDepth,
                                productRotation: mainProductLocation.productRotation,
                                productUom: mainProductLocation.productUom,
                                drawWidth: measureConverter(mainProductLocation.productUom,this.state.displayUOM,mainProductLocation.productWidth) * this.state.displayRatio,
                                drawHeight: measureConverter(mainProductLocation.productUom,this.state.displayUOM,mainProductLocation.productHeight) * this.state.displayRatio,
                                qty: 1, sideType: "Left", fieldUom: this.state.displayUOM,
                                x: (Math.abs(shelveCheck.overlapX) * -1), y: mainProductLocation.y, isNew: true, isDelete: false,};
                        }
                    }

                    let plocobj = {id:uuidv4(), f_uuid: uuidv4(), x: xa1, y: ya1,
                        productWidth: mainProductLocation.productWidth, productHeight: mainProductLocation.productHeight, productDepth: mainProductLocation.productDepth,
                        productRotation: mainProductLocation.productRotation,
                        drawWidth: mainProductLocation.drawWidth,
                        drawHeight: mainProductLocation.drawHeight,
                        isRightSideOverLap: shelveCheck.isOverlap, productUom: mainProductLocation.productUom,
                        isNew: true, isDelete: false,
                        overLappingDto: coverflowobj,
                    };

                    let allowbottom = checkProductIsInBottom(cshelveobj.y,cshelveobj.drawHeight,ya1,plocobj.drawHeight);
                    if(allowbottom){
                        bottomcount += 1;
                    }

                    let newprodlist = [plocobj];
                    if((isallowstack || foundloclist.length > 0) && draggingProduct.isStackable){
                        
                        //check allows to stack
                        let cprodheight = roundOffDecimal(plocobj.drawHeight,10);
                        let maxstackcount = (draggingProduct.maxStackableCount && draggingProduct.maxStackableCount > 0?draggingProduct.maxStackableCount:0);
                        let shelfstackcount = Math.floor((roundOffDecimal(cshelveobj.drawHeight,10) / cprodheight));
                        let newprodcount = (draggingProduct.isStackable?(maxstackcount > 0 && shelfstackcount >= maxstackcount?maxstackcount:shelfstackcount):1);
                        
                        //check expand position from bottom can add count
                        let cpostobottomheight = (botyb1 - plocobj.y);
                        let cpostobotcount = Math.floor((roundOffDecimal(cpostobottomheight,10) / cprodheight));
                        //if ccount less than early calculated count
                        newprodcount = (newprodcount < cpostobotcount?cpostobotcount:newprodcount);
                        
                        let newlocy = (botyb1 - cprodheight);

                        if(!isallowstack && foundloclist.length > 0){
                            let sortfoundloclist = foundloclist.sort((a, b) => (b.y - a.y)).filter(xitem => (xitem.y < plocobj.y));
                            let sortfoundbottomlist = foundloclist.sort((a, b) => (a.y - b.y)).filter(xitem => (xitem.y > plocobj.y));
                            
                            let lowestyloc = sortfoundloclist[0];
                            let highestyloc = sortfoundbottomlist[0];

                            newlocy = (highestyloc.y - cprodheight);
                         
                            //check expand position from bottom can add count
                            let cpostopy = roundOffDecimal((lowestyloc?(lowestyloc.y + lowestyloc.drawHeight):roundOffDecimal(shelf.y,10)),10);
                            let curprody = roundOffDecimal((cpostopy < plocobj.y?cpostopy:roundOffDecimal(shelf.y,10)),10);

                            let cpostobottomheight = ((highestyloc?highestyloc.y:botyb1) - curprody);
                            let cpostobotcount = Math.floor((roundOffDecimal(cpostobottomheight,10) / cprodheight));
                            //set new loc count
                            newprodcount = cpostobotcount;
                        }
                        // console.log(newprodcount);

                        if(newprodcount > 1){
                            newprodlist = [];
                            for (let l = 0; l < newprodcount; l++) {
                                //define location object
                                let coverflowobj = null;
                                if(mainProductLocation.overLappingDto){
                                    if(shelveCheck.isOverlap){
                                        coverflowobj = JSON.parse(JSON.stringify(mainProductLocation.overLappingDto));
                                        coverflowobj["id"] = -1;
                                        coverflowobj["y"] = newlocy;
                                        coverflowobj["isNew"] = true;
                                        coverflowobj["isDelete"] = false;
                                    }
                                } else{
                                    if(shelveCheck.isOverlap){
                                        coverflowobj = {
                                            shelfId: shelf.leftPlanogramShelfId, id: -1,
                                            crossingWidth: shelveCheck.overlapX,
                                            productWidth: mainProductLocation.productWidth, productHeight: mainProductLocation.productHeight, productDepth: mainProductLocation.productDepth,
                                            productRotation: mainProductLocation.productRotation,
                                            productUom: mainProductLocation.productUom,
                                            drawWidth: measureConverter(mainProductLocation.productUom,this.state.displayUOM,mainProductLocation.productWidth) * this.state.displayRatio,
                                            drawHeight: measureConverter(mainProductLocation.productUom,this.state.displayUOM,mainProductLocation.productHeight) * this.state.displayRatio,
                                            qty: 1, sideType: "Left", fieldUom: this.state.displayUOM,
                                            x: (Math.abs(shelveCheck.overlapX) * -1), y: newlocy, isNew: true, isDelete: false,};
                                    }
                                }

                                let plocobj = {id:uuidv4(), f_uuid: uuidv4(), x: xa1, y: newlocy,
                                    productWidth: mainProductLocation.productWidth, productHeight: mainProductLocation.productHeight, productDepth: mainProductLocation.productDepth,
                                    productRotation: mainProductLocation.productRotation,
                                    drawWidth: mainProductLocation.drawWidth,
                                    drawHeight: mainProductLocation.drawHeight,
                                    isRightSideOverLap: shelveCheck.isOverlap, productUom: mainProductLocation.productUom,
                                    isNew: true, isDelete: false,
                                    overLappingDto: coverflowobj,
                                };    

                                let allowbottom = checkProductIsInBottom(cshelveobj.y,cshelveobj.drawHeight,newlocy,plocobj.drawHeight);
                                if(allowbottom){
                                    bottomcount += 1;
                                }
                                
                                newprodlist.push(plocobj);

                                newlocy = (newlocy - cprodheight);
                            }
                        }
                            
                    }
                    // console.log(newprodlist);
                    
                    if(prodfound > -1){
                        //find block if its close to a block3
                        var blockfound = -1;
                        for (var k = 0; k < addedProds[prodfound].productBlock.length; k++) {
                            const blockitem = addedProds[prodfound].productBlock[k];
                            var checkoriprod = {uom: dragmainprod.productUom, width: dragmainprod.productWidth, height: dragmainprod.productHeight, rotatewidth: mainProductLocation.productWidth, rotateheight: mainProductLocation.productHeight, rotatetype: mainProductLocation.productRotation};
                            var checkrslt = checkProductThoughBlock(xa1, ya1, checkoriprod, blockitem, false, this.state.displayUOM, this.state.displayRatio, this.state.saftyMargin);
                            if(checkrslt){
                                blockfound = k;
                            }
                        }
                        
                        var cblockprods = addedProds[prodfound].productBlock;

                        if(blockfound > -1){
                            cblockprods[blockfound].productLocations = cblockprods[blockfound].productLocations.concat(newprodlist);
                            prodblockidx = blockfound;

                            //add qty to block change - RD changes
                            var newrdobj8 = {type:"QTY_ADD", product: draggingProduct, shelve: csprodobj.shelveidx, prodobj: addedProds[prodfound], locobj: plocobj, changeqty: (bottomcount > 0?1:0)};
                            this.handleRDChanges(newrdobj8);
                        } else{
                            prodblockidx = (cblockprods.length > 0?(cblockprods.length - 1):0);
                            var cpobj = {
                                id: uuidv4(), f_uuid: uuidv4(),
                                x: xa1,
                                y: ya1,
                                width: addingProduct.drawWidth / this.state.displayRatio,
                                height: addingProduct.drawHeight / this.state.displayRatio,
                                drawWidth: addingProduct.drawWidth,
                                drawHeight: addingProduct.drawHeight,
                                isNew: true, isDelete: false,
                                uom: this.state.displayUOM,
                                productLocations: newprodlist
                            };
                            cblockprods.push(cpobj);

                            //new block create change - RD changes
                            var newrdobj9 = {type:"ADD_NEW_BLOCK", product: draggingProduct, shelve: csprodobj.shelveidx, prodobj: addedProds[prodfound], locobj: plocobj, changeqty: (bottomcount > 0?1:0)};
                            this.handleRDChanges(newrdobj9);
                        }

                        addedProds[prodfound].productBlock = cblockprods;
                        prodadded = addedProds[prodfound];
                    } else{
                        var data_obj2 = {
                            id: uuidv4(), f_uuid: uuidv4(),
                            productWidth: draggingProduct.width, productHeight: draggingProduct.height, productPadding: 0, productDepth: draggingProduct.depth, productUom: draggingProduct.uom,
                            productInfo: draggingProduct,
                            isNew: true, isDelete: false,
                            productBlock: [{
                                id: uuidv4(),
                                f_uuid: uuidv4(),
                                x: xa1,
                                y: ya1,
                                width: addingProduct.drawWidth / this.state.displayRatio,
                                height: addingProduct.drawHeight / this.state.displayRatio,
                                drawWidth: addingProduct.drawWidth,
                                drawHeight: addingProduct.drawHeight,
                                isNew: true, isDelete: false,
                                uom: this.state.displayUOM,
                                productLocations: newprodlist
                            }]
                        };
                        prodfound = addedProds.length;
                        addedProds.push(data_obj2);
                        prodadded = data_obj2;

                        //new block create change - RD changes
                        var newrdobj10 = {type:"ADD_NEW_BLOCK", product: draggingProduct, shelve: csprodobj.shelveidx, prodobj: data_obj2, locobj: plocobj, changeqty: (bottomcount > 0?1:0)};
                        this.handleRDChanges(newrdobj10);
                    }
                    spdobj.planogramShelfDto[csprodobj.shelveidx].planogramProduct = addedProds;

                    prodlocidx = addedProds[prodfound].productBlock[prodblockidx].productLocations.length;
                    var viewprodidx = (prodlocidx > 0?(prodlocidx - 1):0);
                    var cdrgprod = {shelveidx: csprodobj.shelveidx, prodidx: csprodobj.prodidx, blockidx: prodblockidx, locidx: viewprodidx, prod: prodadded};
                    
                    this.setState({ saveObj: spdobj, ischangesavailable: true, currentInternalDraggableProd: cdrgprod});
                }

            }
        }

    }
    //check product allowed to add inside shelve
    checkAllowToAdd = (e, shelfObj, shelf, draggingProduct, xa, ya, cdisplayratio, ignorethis, checkloc) => {
        //check allowed
        var allowToAdd = true;

        if(draggingProduct){
          var dpwidth = (measureConverter(draggingProduct.uom,this.state.displayUOM,(draggingProduct.rotatewidth?draggingProduct.rotatewidth:draggingProduct.width)) * cdisplayratio);
          var dpheight = (measureConverter(draggingProduct.uom,this.state.displayUOM,(draggingProduct.rotateheight?draggingProduct.rotateheight:draggingProduct.height)) * cdisplayratio);
          var xb = roundOffDecimal((xa + dpwidth),10);
          var yb = roundOffDecimal((ya + dpheight),10);
          var shelveCheck = (!ignorethis?this.checkOnShelfBox(xa, ya, xb, yb, shelfObj, dpwidth, dpheight):{boxAllow:true}); //check allow to add shelve
            
          //loop through shelve object products list
          if (shelfObj.planogramProduct.length > 0) {
              for (var i = 0; i < shelfObj.planogramProduct.length; i++) {
                  const rect = shelfObj.planogramProduct[i].productBlock;
                  for (var l = 0; l < rect.length; l++) {
                      const subrect = rect[l];
                      if(subrect.isDelete === false){
                          for (var k = 0; k < subrect.productLocations.length; k++) {
                              const locrect = subrect.productLocations[k];
                              if(locrect.isDelete === false && (!ignorethis || (ignorethis && checkloc.f_uuid !== locrect.f_uuid))){
                                  var xa2 = roundOffDecimal(locrect.x,10);
                                  var ya2 = roundOffDecimal(locrect.y,10);
                                  var xb2 = roundOffDecimal((locrect.x + (locrect.drawWidth)),10);
                                  var yb2 = roundOffDecimal((locrect.y + (locrect.drawHeight)),10);
                                  var rectAllow = checkThroughProductsTest(xa, ya, xb, yb, xa2, ya2, xb2, yb2); //
                                  if (!rectAllow) {
                                      allowToAdd = false;
                                      break;
                                  }
                              }
                          }
                      }
                      if(!allowToAdd){ break; }
                  }
                  if(!allowToAdd){ break; }
              }
          }
          allowToAdd = (allowToAdd && shelveCheck.boxAllow);
        } else{
          allowToAdd = false;
        }

        return allowToAdd;
    }
    //check product x,y endpoints are allowed to drag inside shelve
    checkOnShelfBox = (xa, ya, xb, yb, shelfObj, dpwidth, dpheight) => {
        var allowovrlflw = this.state.allowovrflwprod;
        var overflowprodwidth = (allowovrlflw?((dpwidth / 4) * 3):0); //if overflow allowed 3/4 of product allow to overlap
        //get shelve x,y end points
        var p1 = (shelfObj.x - this.state.checkSaftyMargin); 
        var q1 = (shelfObj.y - this.state.checkSaftyMargin);
        var p2 = roundOffDecimal(((shelfObj.x + shelfObj.drawWidth) + overflowprodwidth + this.state.checkSaftyMargin),10);
        var q2 = roundOffDecimal((q1 + shelfObj.drawHeight + this.state.checkSaftyMargin),10);
        //console.log(xa, ya, xb, yb, p1, q1, p2, q2);
        //check is it allowed
        var boxAllow = false;
        if (p1 <= xa && xb <= p2 && q1 <= ya && yb <= q2) {
            boxAllow = true;
        }
        //check is it overlap
        var p3 = (shelfObj.x - this.state.checkSaftyMargin);
        var p4 = ((shelfObj.x + shelfObj.drawWidth) + this.state.checkSaftyMargin);
        var isOverlap = true;
        var overlapX = 0;
        if (p3 <= xa && xb <= p4 && q1 <= ya && yb <= q2) {
            isOverlap = false;
        } else if(allowovrlflw){
            overlapX = ((shelfObj.x + shelfObj.drawWidth) - xa);
        }
        
        if(isOverlap){
            isOverlap = (allowovrlflw?shelfObj["overlappingAllow"]:false);
            if(!allowovrlflw || !shelfObj.overlappingAllow){
                boxAllow = false;
            }
        }

        return {boxAllow:boxAllow, isOverlap: isOverlap, overlapX: overlapX};
    }
    //triggers on added product drag start
    SingleProductDragStart = (e, currprod, prodRef, shelveidx, prodidx, blockidx, locidx, locrect) => {
        e.preventDefault();
        var cdrgprod = {shelveidx: shelveidx, prodidx: prodidx, blockidx: blockidx, locidx: locidx, prod: currprod}; //set dragging product
        
        if (e.nativeEvent.which === 1) { //on left mouse key click
            this.setState({
                currentInternalDraggableProd: cdrgprod,
                isviewcmenu: false, contxtmenu: {isexpand: false},
                selectedlocobj: locrect
            });
        } else if (e.nativeEvent.which === 3 && this.state.isDisableEdit === false) { //right mouse key click - shows delete modal
            var scrolledheight = document.documentElement.scrollTop;
            var cmenu = this.state.contxtmenu;
            this.setState({
                view: { showDeleteModal: false, currentDeleteProd: currprod },
                contxtmenu: {xpos:(e.nativeEvent.x + 5), ypos: (e.nativeEvent.y + scrolledheight), isexpand: (cmenu?cmenu.isexpand:false)},
                isviewcmenu: !this.state.isviewcmenu,
                currentInternalDraggableProd: cdrgprod,
                ischangesavailable: true
            });
        }
        this.setState({isselectprodblock: true, isblockmove: false, currentSelectedBlock: null});
        var ctumbdivs = document.getElementsByClassName("thumb-div");
        for (var z = 0; z < ctumbdivs.length; z++) {
            ctumbdivs[z].style.border = "1px solid #eee"
        }
    }
    //toggle view delete product modal
    handleToggleDelete = () => {
        this.setState({view: {showDeleteModal: !this.state.view.showDeleteModal, currentDeleteProd: this.state.view.currentDeleteProd}, isviewcmenu: false});
    }
    //expand click
    handleExpandProd = () => {
        var cxobj = this.state.contxtmenu;
        this.setState({isviewcmenu: false, contxtmenu: {xpos: cxobj.xpos, ypos: cxobj.ypos, isexpand: !cxobj.isexpand}, isselectprodblock: false, isblockmove: false,});
    }
    //onclick on shelve check expand available. if true goes to add new product
    expandProdCheck = (evt, shelfObj, shelfRef, sidx) => {
        if(this.state.contxtmenu && this.state.contxtmenu.isexpand){
            if(this.state.view.currentDeleteProd){
                this.setState({
                    currentDraggableProd: this.state.view.currentDeleteProd.productInfo,
                }, () => {
                    this.droppedNew(evt, shelfObj, shelfRef, sidx, true);
                });
            }
        }
    }
    //check current draggable object available
    draggingDealerValidityCheck = (currentInternalDraggableProd) =>{
        var valid =true
        if(currentInternalDraggableProd === undefined || currentInternalDraggableProd === null){
            valid = false
            return valid
        }
        return valid;
    }
    //delete product on right click
    handleDelete = () => {
        const callrectdata = JSON.parse(JSON.stringify(this.state.saveObj));
        if (!this.draggingDealerValidityCheck(this.state.currentInternalDraggableProd)) {
            alertService.warn(this.props.t('PRODUCT_NOT_SELECTED'))
            this.setState({
                view: { showDeleteModal: false, currentDeleteProd: null},
                saveObj: callrectdata, currentInternalDraggableProd: null,
                isselectprodblock: false, isblockmove: false, isviewcmenu: false, contxtmenu: null, ischangesavailable: true,
            });
            return;
        }

        const currprod = JSON.parse(JSON.stringify(this.state.currentInternalDraggableProd));
        this.fieldHistoryAdd(JSON.parse(JSON.stringify(this.state.saveObj)),2,JSON.parse(JSON.stringify(this.state.rploadedrevenue)),JSON.parse(JSON.stringify(this.state.rploadedoverview)),JSON.parse(JSON.stringify(this.state.rpchangedprodlist)),JSON.parse(JSON.stringify(this.state.existnewprodlist)),JSON.parse(JSON.stringify(this.state.trackedProposeChanges)),JSON.parse(JSON.stringify(this.state.loadedProposeList)));
        const shelveObj = callrectdata.planogramShelfDto[currprod.shelveidx];
        const addedProds = shelveObj.planogramProduct;

        var cdelblock = addedProds[currprod.prodidx].productBlock[currprod.blockidx];
        if(cdelblock.productLocations[currprod.locidx] === undefined){
            alertService.warn(this.props.t('PRODUCT_NOT_SELECTED'))
            this.setState({
                view: { showDeleteModal: false, currentDeleteProd: null},
                saveObj: callrectdata, currentInternalDraggableProd: null,
                isselectprodblock: false, isblockmove: false, isviewcmenu: false, contxtmenu: null, ischangesavailable: true,
            });
            return;
        }
        const cdelprod = JSON.parse(JSON.stringify(cdelblock.productLocations[currprod.locidx]));

        if(cdelblock.productLocations[currprod.locidx].id > 0){ // && this.state.fieldStatus !== "ACTIVE"
            cdelblock.productLocations[currprod.locidx]["isDelete"] = true;
            cdelblock.productLocations[currprod.locidx]["isNew"] = false;
            //if overlap object available
            if(cdelblock.productLocations[currprod.locidx].overLappingDto){
                if(cdelblock.productLocations[currprod.locidx].id > 0){
                    cdelblock.productLocations[currprod.locidx].overLappingDto["isDelete"] = true;
                    cdelblock.productLocations[currprod.locidx].overLappingDto["isNew"] = false;
                } else{
                    cdelblock.productLocations[currprod.locidx].overLappingDto = null;
                }
            }
        } else{
            cdelblock.productLocations.splice(currprod.locidx,1);
        }

        var allowbottom = checkProductIsInBottom(shelveObj.y,shelveObj.drawHeight,cdelprod.y,cdelprod.drawHeight)

        var newrdobj11 = {type:"QTY_REMOVE", product: currprod.prod.productInfo, shelve: currprod.shelveidx, prodobj: addedProds[currprod.prodidx], locobj: cdelprod, changeqty: (allowbottom?1:0)};
        this.handleRDChanges(newrdobj11);

        //if block are empty remove product
        var availableloc = cdelblock.productLocations.find((xloc) => xloc.isDelete === false);
        if(availableloc === undefined || availableloc.lenth === 0){
            if(cdelblock.id > 0){ // && this.state.fieldStatus !== "ACTIVE"
                cdelblock["isDelete"] = true;
                cdelblock["isNew"] = false;
            } else{
               addedProds[currprod.prodidx].productBlock.splice(currprod.blockidx, 1);
            }

            //block remove change - RD changes
            var newrdobj12 = {type:"REMOVE_BLOCK", product: currprod.prod.productInfo, shelve: currprod.shelveidx, prodobj: addedProds[currprod.prodidx], locobj: null, changeqty: 0};
            this.handleRDChanges(newrdobj12);
        }
        //if block are remove product
        var availableblc = addedProds[currprod.prodidx].productBlock.find((xblc) => xblc.isDelete === false);
        if(availableblc === undefined || availableblc.lenth === 0){
            if(addedProds[currprod.prodidx].id > 0 || addedProds[currprod.prodidx].isFieldCopy){ // && this.state.fieldStatus !== "ACTIVE"
                addedProds[currprod.prodidx]["isDelete"] = true;
                addedProds[currprod.prodidx]["isNew"] = false;
            } else{
                addedProds.splice(currprod.prodidx, 1);
            }
        }

        callrectdata.planogramShelfDto[currprod.shelveidx].planogramProduct = addedProds;

        this.setState({
            view: { showDeleteModal: false, currentDeleteProd: null},
            saveObj: callrectdata, currentInternalDraggableProd: null,
            isselectprodblock: false, isblockmove: false, isviewcmenu: false, contxtmenu: null, ischangesavailable: true, selectedlocobj: null,
        }, () => {
            this.checkEnableFieldEdit();
        });
        //check moving product x,y and check block list to see if it's changed it's current block
        if(this.bctimeout){ clearTimeout(this.bctimeout); }

        this.bctimeout = setTimeout(() => {
            var curmainprod = addedProds[currprod.prodidx];
            if(curmainprod){

                var cprodblock = addedProds[currprod.prodidx].productBlock[currprod.blockidx];
                var cblockloc = cdelprod;
                
                //set top/bottom extra margins
                var cpx1 = (cblockloc.x + (cblockloc.drawWidth / 2));
                //find closest top/bottom locations of removed item
                var ccloseset = [];
                if(cprodblock){
                    for (var i = 0; i < cprodblock.productLocations.length; i++) {
                        const clocitem = cprodblock.productLocations[i];
                        if(clocitem.id !== cblockloc.id && clocitem.isDelete === false){
                            var cx1 = clocitem.x;
                            var cx2 = cx1 + clocitem.drawWidth;
                            //find loc in x range
                            if(cx1 < cpx1 && cx2 > cpx1){
                                ccloseset.push(clocitem);
                            }
                        }
                    }
                }
                //if entire y block empty
                if(ccloseset && ccloseset.length === 0){
                    var blckgroup1 = [];
                    var blckgroup2 = [];

                    if(cprodblock){
                        for (var j = 0; j < cprodblock.productLocations.length; j++) {
                            const cbloc = cprodblock.productLocations[j];
                            if(cbloc.isDelete === false && cbloc.id !== cblockloc.id && cbloc.x > cpx1){ //if it's x greater than current location x push to group 2
                                var nlocobj = JSON.parse(JSON.stringify(cbloc));
                                if(cbloc.id > 0){ // && this.state.fieldStatus !== "ACTIVE"
                                    cbloc.isDelete = true;
                                    if(cbloc.overLappingDto){
                                        if(cbloc.overLappingDto.id > 0){
                                            cbloc.overLappingDto["isDelete"] = true;
                                            cbloc.overLappingDto["isNew"] = false;
                                        } else{
                                            cbloc.overLappingDto = null;
                                        }
                                    }
                                    blckgroup1.push(cbloc);
                                }
                                nlocobj.id = uuidv4();
                                nlocobj.isNew = true; nlocobj.isDelete = false;
                                if(nlocobj.overLappingDto){ //if overlap obj availble
                                    nlocobj.overLappingDto["id"] = uuidv4();
                                    nlocobj.overLappingDto["isDelete"] = false;
                                    nlocobj.overLappingDto["isNew"] = true;
                                }
                                blckgroup2.push(nlocobj);
                            } else {
                                blckgroup1.push(cbloc);
                            }
                        }
                        //set block details
                        cprodblock.productLocations = blckgroup1;
                        if(blckgroup2.length > 0){
                            var newblkobj = {
                                id: uuidv4(), f_uuid: uuidv4(), isDelete: false, isNew: true,
                                x: cprodblock.x, y: cprodblock.y, uom: cprodblock.uom, width: cprodblock.width, height: cprodblock.height, drawWidth: cprodblock.drawWidth, drawHeight: cprodblock.drawHeight,
                                productLocations: blckgroup2
                            };
                            curmainprod.productBlock.push(newblkobj);
                        }
                    }
                    this.setState({saveObj: callrectdata});
                }
            }
        }, 500);
    }
    //handle delete shelve prod block
    handleDeleteAllProd = () => {
        if (this.state.currentInternalDraggableProd === undefined || this.state.currentInternalDraggableProd === null) {
            alertService.warn(this.props.t('PRODUCT_NOT_SELECTED'))
            return;
        }

        const currprod = JSON.parse(JSON.stringify(this.state.currentInternalDraggableProd));

        if(currprod){
            const currprodinfo = currprod.prod.productInfo;
            confirmAlert({
                title: this.props.t('confirmdlteproblock'),
                message: this.props.t('suretoremoveprodshelve'),
                overlayClassName: (this.props.isRTL==="rtl"?"alertrtl-content":""),
                buttons: [{
                    label: this.props.t('btnnames.yes'),
                    onClick: () => {
                        const callrectdata = JSON.parse(JSON.stringify(this.state.saveObj));
                        this.fieldHistoryAdd(JSON.parse(JSON.stringify(this.state.saveObj)),2,JSON.parse(JSON.stringify(this.state.rploadedrevenue)),JSON.parse(JSON.stringify(this.state.rploadedoverview)),JSON.parse(JSON.stringify(this.state.rpchangedprodlist)),JSON.parse(JSON.stringify(this.state.existnewprodlist)),JSON.parse(JSON.stringify(this.state.trackedProposeChanges)),JSON.parse(JSON.stringify(this.state.loadedProposeList)));

                        const cpshelve = callrectdata.planogramShelfDto[currprod.shelveidx];
                        const cpprod = cpshelve.planogramProduct[currprod.prodidx];
                        const cpblock = (cpprod.productBlock[currprod.blockidx]);

                        var totalbottomqty = 0;
                        for (var v = 0; v < cpblock.productLocations.length; v++) {
                            const cblcitem = cpblock.productLocations[v];
                            //block item remove change - RD changes
                            if(!cblcitem.isDelete){

                                var allowbottom = checkProductIsInBottom(cpshelve.y,cpshelve.drawHeight,cblcitem.y,cblcitem.drawHeight)

                                if(allowbottom){
                                    totalbottomqty = totalbottomqty + 1;
                                }
                            }
                        }
                        
                        //remove block locations
                        var prodlist = [];
                        //var isblockdelete = true;
                        for (var k = 0; k < cpblock.productLocations.length; k++) {
                            if(cpblock.productLocations[k].id > 0){ // && this.state.fieldStatus !== "ACTIVE"
                                cpblock.productLocations[k]["isDelete"] = true;
                                cpblock.productLocations[k]["isNew"] = false;
                                if(cpblock.productLocations[k].overLappingDto){
                                    if(cpblock.productLocations[k].overLappingDto.id > 0){
                                        cpblock.productLocations[k].overLappingDto["isDelete"] = true;
                                        cpblock.productLocations[k].overLappingDto["isNew"] = false;
                                    } else{
                                        cpblock.productLocations[k].overLappingDto = null;
                                    }
                                }
                                prodlist.push(cpblock.productLocations[k]);
                            }
                        }
                        cpblock.productLocations = prodlist;

                        if(cpblock.id > 0){ // && this.state.fieldStatus !== "ACTIVE"
                            cpblock["isDelete"] = true;
                            cpblock["isNew"] = false;
                        } else{
                            cpprod.productBlock.splice(currprod.blockidx,1);
                        }

                        //if block remove check main product change delete state
                        var isproddelete = true;
                        for (var m = 0; m < cpprod.productBlock.length; m++) {
                            const cpblock = cpprod.productBlock[m];
                            if(cpblock.isDelete === false){
                                isproddelete = false;
                            }
                        }
                        if(isproddelete){
                            if(cpprod.id > 0 || cpprod.isFieldCopy){ 
                                cpprod["isDelete"] = true;
                                cpprod["isNew"] = false;
                            } else{
                                cpshelve.planogramProduct.splice(currprod.prodidx,1);
                            }
                        }

                        this.setState({ saveObj: callrectdata, isselectprodblock: false, isblockmove: false, isviewcmenu: false, currentInternalDraggableProd: null,contxtmenu: null, ischangesavailable: true, selectedlocobj: null}, () => {
                            //block remove change - RD changes
                            var newrdobj13 = {type:"REMOVE_BLOCK", product: currprodinfo, shelve: currprod.shelveidx, prodobj: cpprod, locobj: null, changeqty: totalbottomqty};
                            this.handleRDChanges(newrdobj13);
                            //check enable field edit
                            this.checkEnableFieldEdit();
                        });
                    }
                  }, {
                    label: this.props.t('btnnames.no')
                  }
                ]
            });
        }
    }
    //floor draw dementions calculate
    calculateRate(isupdateexist) {
        //console.log(isactiveview);
        if(this.state.saveObj && Object.keys(this.state.saveObj).length > 0){
            var csobj = JSON.parse(JSON.stringify(this.state.saveObj));
            //calculate dimention
            var addedwidth = (this.state.divWidth + 30);
            var dimention = AspectRatioDrawBox(csobj.masterFieldWidth,csobj.masterFieldHeight,addedwidth,this.state.divHeight);
            //current field width/height
            this.dheight = measureConverter(csobj.masterFieldUom,this.state.displayUOM,csobj.masterFieldHeight) * dimention;
            this.dwidth = measureConverter(csobj.masterFieldUom,this.state.displayUOM,csobj.masterFieldWidth) * dimention;
            
            this.setState({ viewHeight: this.dheight, viewWidth: this.dwidth, displayRatio: dimention, ismdfieldset: false }, () => {
                this.drawRect(isupdateexist);
            });
        } 
    }
    //floor draw dementions calculate
    activeCalculateRate() {
        //console.log(isactiveview);
        if(this.state.activeViewObj && Object.keys(this.state.activeViewObj).length > 0){
            var cdraftsobj = JSON.parse(JSON.stringify(this.state.saveObj));
            var cactsobj = JSON.parse(JSON.stringify(this.state.activeViewObj));
            //active field width/height
            var actaddedwidth = (this.state.actDivWidth + 30);
            var actdimention = AspectRatioDrawBox(cactsobj.masterFieldWidth,cactsobj.masterFieldHeight,actaddedwidth,this.state.actDivHeight);

            //active current field width/height
            this.adheight = measureConverter(cactsobj.masterFieldUom,this.state.displayUOM,cactsobj.masterFieldHeight) * actdimention;
            this.adwidth = measureConverter(cactsobj.masterFieldUom,this.state.displayUOM,cactsobj.masterFieldWidth) * actdimention;
           
            this.setState({ aviewHeight: this.adheight, aviewWidth: this.adwidth, adisplayRatio: actdimention }, () => {
                this.drawActiveData(cdraftsobj,cactsobj);
            });
        }
    }
    //calculate product shelves and locations draw width,height,x,y to current field ratio
    drawRect(isupdateexist,isnotcheckxy) {
        var csobj = this.state.saveObj;
        var existprodlist =  this.state.existnewprodlist; //existing and newly added products list
        var warningprodlist = this.state.warningProdList; //warning product list
        //console.log(this.state.displayRatio, this.state.adisplayRatio);

        var cshelfs = [];
        //convert x,y,width,height to field ratio
        if(csobj && Object.keys(csobj).length > 0){
            if (csobj.planogramShelfDto) {
                cshelfs = (csobj.planogramShelfDto?csobj.planogramShelfDto:[]);
                
                var prevGap = 0;
                for (let i = 0; i < cshelfs.length; i++) {
                    const shelf = cshelfs[i];
                    let drawHeight = shelf.height * this.state.displayRatio;
                    let drawGap = shelf.gap * this.state.displayRatio;

                    //pick x, y
                    shelf.x = 0;
                    shelf.y = prevGap;
                    
                    shelf.drawWidth = this.state.viewWidth;
                    shelf.drawHeight = drawHeight;
                    shelf.drawGap = drawGap;

                    if(shelf.isDelete === false){
                        prevGap = prevGap + (drawHeight + drawGap);
                    }

                    //convert overlap values to draw
                    if(shelf.overLappingDto && shelf.overLappingDto.length > 0){
                        var curshelvey = (shelf.y + shelf.drawHeight);
                        const sortoverlaplist = shelf.overLappingDto.sort((a, b) => parseFloat(b.y) - parseFloat(a.y)); //descend array from y value
                        
                        for (let n = 0; n < sortoverlaplist.length; n++) {
                            const overlapitem = sortoverlaplist[n];
                            overlapitem.x = (measureConverter((overlapitem.fieldUom?overlapitem.fieldUom:this.state.displayUOM),this.state.displayUOM,overlapitem.x) * this.state.displayRatio);
                            overlapitem.drawWidth = measureConverter(overlapitem.productUom,this.state.displayUOM,overlapitem.productWidth) * this.state.displayRatio;
                            overlapitem.drawHeight = measureConverter(overlapitem.productUom,this.state.displayUOM,overlapitem.productHeight) * this.state.displayRatio;
                            overlapitem.y = curshelvey - overlapitem.drawHeight;

                            curshelvey = overlapitem.y; //set curprod y to shelvey
                        }
                    }

                    for (var j = 0; j < shelf.planogramProduct.length; j++) {
                        const prodobj = shelf.planogramProduct[j];
                        
                        var frontfacingwidth = 0; var frontfacingqty = 0; var totaladdedqty = 0; var totalfacingwidth = 0;
                        for (var l = 0; l < prodobj.productBlock.length; l++) {
                            const blockobj = prodobj.productBlock[l];
                            if(!isnotcheckxy){
                                blockobj.x = (blockobj.x * this.state.displayRatio);
                                blockobj.y = (blockobj.y * this.state.displayRatio);
                            }
                            
                            blockobj.drawWidth = measureConverter(prodobj.productUom,this.state.displayUOM,prodobj.productWidth) * this.state.displayRatio;
                            blockobj.drawHeight = measureConverter(prodobj.productUom,this.state.displayUOM,prodobj.productHeight) * this.state.displayRatio;

                            for (var k = 0; k < blockobj.productLocations.length; k++) {
                                const plocobj = blockobj.productLocations[k];
                                if(!isnotcheckxy){
                                    plocobj.x = (plocobj.x * this.state.displayRatio);
                                    plocobj.y = (plocobj.y * this.state.displayRatio);
                                }
                                //
                                plocobj.drawWidth = measureConverter(plocobj.productUom,this.state.displayUOM,plocobj.productWidth) * this.state.displayRatio;
                                plocobj.drawHeight = measureConverter(plocobj.productUom,this.state.displayUOM,plocobj.productHeight) * this.state.displayRatio;
                                //overlap object convert
                                if(plocobj.overLappingDto && Object.keys(plocobj.overLappingDto).length > 0){
                                    if(!isnotcheckxy){
                                        plocobj.overLappingDto.x = (plocobj.overLappingDto.x * this.state.displayRatio);
                                        plocobj.overLappingDto.y = (plocobj.overLappingDto.y * this.state.displayRatio);
                                    }
                                    plocobj.overLappingDto.drawWidth = measureConverter(plocobj.overLappingDto.productUom,this.state.displayUOM,plocobj.overLappingDto.productWidth) * this.state.displayRatio;
                                    plocobj.overLappingDto.drawHeight = measureConverter(plocobj.overLappingDto.productUom,this.state.displayUOM,plocobj.overLappingDto.productHeight) * this.state.displayRatio;
                                }

                                //check is bottom location and add width to front faceing totals
                                var allowbottom = checkProductIsInBottom(shelf.y,shelf.drawHeight,plocobj.y,plocobj.drawHeight);
                                if(allowbottom){
                                    frontfacingwidth = frontfacingwidth + prodobj.productWidth; frontfacingqty = frontfacingqty + 1;
                                    plocobj["isbottom"] = true;
                                    totalfacingwidth = totalfacingwidth + plocobj.productWidth;
                                }
                                totaladdedqty = totaladdedqty + 1;
                            }
                        }
                        //prodobj["frontfacingwidth"] = frontfacingwidth;
                        prodobj["productFacingQty"] = frontfacingqty;
                        prodobj["loadingProductFacingQty"] = frontfacingqty;
                        prodobj["productTotalQty"] = totaladdedqty;
                        prodobj["productFacingWidth"] = roundOffDecimal(totalfacingwidth,10);

                        //add to existing prodlist
                        if(isupdateexist){
                          var checkalrdyadded = existprodlist.findIndex(z => z.productInfo.id === prodobj.productInfo.id);
                          if(checkalrdyadded === undefined || checkalrdyadded === -1){
                              prodobj["existviewtype"] = 1;
                              existprodlist.push(prodobj); //this prod object use to show existing prods and dragndrop

                              //add prods to warning list
                              let prodinfo = prodobj.productInfo;
                              if(prodinfo && prodinfo.isDepartmentProduct){
                                let newwarobj = { barcode: prodinfo.barcode, productId: prodinfo.id, productName: prodinfo.productName, department: (prodinfo.department?prodinfo.department:[]),
                                    brandName: (prodinfo.brandName?prodinfo.brandName:"N/A"), imgUrl: prodinfo.imageUrl};
                                  warningprodlist.push(newwarobj);
                              }
                          } else{
                              var cexistitem = existprodlist[checkalrdyadded];
                              cexistitem["productFacingQty"] = cexistitem.productFacingQty + frontfacingqty;
                              cexistitem["loadingProductFacingQty"] = cexistitem.productFacingQty + frontfacingqty;
                              cexistitem["productTotalQty"] = cexistitem.productTotalQty + totaladdedqty;
                              prodobj["productFacingWidth"] = roundOffDecimal((cexistitem.productFacingWidth + totalfacingwidth),10);
                          }
                        }
                    }

                    cshelfs[i] = shelf;
                }
            }
            //if right object available
            if (csobj.rightSidePlanogramFieldDto) {
                var rightshelfs = (csobj.rightSidePlanogramFieldDto.planogramShelfDto?csobj.rightSidePlanogramFieldDto.planogramShelfDto:[]);
                
                var crightobj = csobj.rightSidePlanogramFieldDto;
                crightobj["drawHeight"] = measureConverter(crightobj.masterFieldUom,csobj.masterFieldUom,crightobj.masterFieldHeight) * this.state.displayRatio;
                crightobj["drawWidth"] = measureConverter(crightobj.masterFieldUom,csobj.masterFieldUom,crightobj.masterFieldWidth) * this.state.displayRatio;

                var prevGap2 = 0;
                for (let i = 0; i < rightshelfs.length; i++) {
                    const shelf = rightshelfs[i];
                    let drawWidth = measureConverter(crightobj.masterFieldUom,csobj.masterFieldUom,shelf.width) * this.state.displayRatio;
                    let drawHeight = measureConverter(crightobj.masterFieldUom,csobj.masterFieldUom,shelf.height) * this.state.displayRatio;
                    let drawGap = measureConverter(crightobj.masterFieldUom,csobj.masterFieldUom,shelf.gap) * this.state.displayRatio;

                    //pick x, y
                    shelf.x = 0;
                    shelf.y = prevGap2;

                    shelf.drawWidth = drawWidth;
                    shelf.drawHeight = drawHeight;
                    shelf.drawGap = drawGap;

                    if(shelf.isDelete === false){
                        prevGap2 = prevGap2 + (drawHeight + drawGap);
                    }
                }
            }
        }
        csobj["planogramShelfDto"] = cshelfs;

        //isallowed to overlap check
        if (csobj.rightSidePlanogramFieldDto) {
            const returncobj = compareSideToAllowDrop(csobj);
            csobj = returncobj;
        }

        if(!this.state.viewObj){ //set viewobj
            this.setState({viewObj: (this.state.viewObj!==null?this.state.viewObj:JSON.parse(JSON.stringify(csobj)))});
        }
        //console.log(this.state.fieldStatus);
        if(this.state.fieldStatus === "ACTIVE"){
            this.setState({activeViewObj: JSON.parse(JSON.stringify(this.state.bkpSaveObj))}, () => {
                this.activeCalculateRate();
            });
        }
        //check existing prodlist for empty totalqty and remove item
        var newexistprods = [];
        for (var e = 0; e < existprodlist.length; e++) {
            if(existprodlist[e].productTotalQty > 0){
                newexistprods.push(existprodlist[e]);
            }
        }
        //set state
        //console.log(warningprodlist);
        this.setState({ saveObj: csobj, existnewprodlist: newexistprods, warningProdList: warningprodlist}, () => {
            setTimeout(() => {
                this.setState({isloadedfielddet: true});
            }, 100);
        });
    }
    //#PLG-DU-SU-H01 save/update dunit details
    handleDunitObj = () => {
        //check field details edit view opened. if true not letting to continue
        if(this.state.isshowedit){
            alertService.error(this.props.t('PROPERLY_EDIT_AND_CLOSE_FIELD_DETAILS_EDIT_VIEW_TO_CONTINUE'));
            return false;
        }
        //get current save field object
        var csobj = JSON.parse(JSON.stringify(this.state.saveObj));
        var actobj = (this.state.activeViewObj&&Object.keys(this.state.activeViewObj).length>0?JSON.parse(JSON.stringify(this.state.activeViewObj)):null);
        //sort active field shelves
        if(actobj){
            actobj.planogramShelfDto.sort(sortShelvesDesc);
        }
        
        csobj["masterFieldWidth"] = parseFloat(csobj.masterFieldWidth);
        csobj["masterFieldHeight"] = parseFloat(csobj.masterFieldHeight);
        //sort draft field shelves
        csobj.planogramShelfDto.sort(sortShelvesDesc);
        
        var isprodoverlapping = false; //check products overlapping
        //convert back converted x,y changes
        for (var i = 0; i < csobj.planogramShelfDto.length; i++) {
            const shelveobj = csobj.planogramShelfDto[i];
            const ccheckidx = i;
            //find changes available
            var chelvechanges = (shelveobj.planogramShelfChanges?shelveobj.planogramShelfChanges:[]);
            var addedshelvechanges = this.state.rpchangedprodlist.filter((xitem) => xitem.shelve === ccheckidx).map((xobj) => { return xobj.changeobj; });
            var cshelvechanges = [];
            
            for (var j = 0; j < shelveobj.planogramProduct.length; j++) {
                const prodobj = shelveobj.planogramProduct[j];
                var frontfacingqty = 0; //total facing qty of product
                var totalprodqty = 0; //total qty of product
                var isproddelete = true; //check is product inside blocks/products deleted
                for (var l = 0; l < prodobj.productBlock.length; l++) {
                    const blockobj = prodobj.productBlock[l];
                    blockobj.x = (blockobj.x / this.state.displayRatio);
                    blockobj.y = (blockobj.y / this.state.displayRatio);

                    var isblockdelete = true; //check block inside locations deleted
                    for (var k = 0; k < blockobj.productLocations.length; k++) {
                        const plocobj = blockobj.productLocations[k];
                        const oriprody = plocobj.y; //need drawed y to check isinbottom
                        plocobj.x = (plocobj.x / this.state.displayRatio);
                        plocobj.y = (plocobj.y / this.state.displayRatio);

                        //overlap obj
                        if(plocobj.overLappingDto && Object.keys(plocobj.overLappingDto).length > 0){
                            plocobj.overLappingDto.x = (plocobj.overLappingDto.x / this.state.displayRatio);
                            plocobj.overLappingDto.y = (plocobj.overLappingDto.y / this.state.displayRatio);

                            if(!plocobj.overLappingDto.isDelete){
                                isprodoverlapping = true;
                            }
                        }

                        if(!plocobj.isDelete){
                            isproddelete = false; isblockdelete = false;

                            //check is bottom location and add width to front faceing totals
                            var allowbottom = checkProductIsInBottom(shelveobj.y,shelveobj.drawHeight,oriprody,plocobj.drawHeight);
                            if(allowbottom){ frontfacingqty = frontfacingqty + 1; }
                            //frontfacingwidth = frontfacingwidth + prodobj.productWidth;
                            totalprodqty = totalprodqty + 1;
                        }
                    }
                    if(isblockdelete){ blockobj.isDelete = true; }

                    if(!blockobj.isDelete){ isproddelete = false; }
                }

                prodobj["productFacingQty"] = frontfacingqty;
                prodobj["productTotalQty"] = totalprodqty;
                if(isproddelete){ 
                    prodobj["isDelete"] = true; 
                    prodobj["isNew"] = false; 
                }
                
                //check add/remov product qty for new shelve change
                var cfieldactivemode = (csobj.floorLayoutStatus === "ACTIVE" || (csobj.baseFloorLayoutId && csobj.baseFloorLayoutId > 0)?true:false);
                
                if(cfieldactivemode){
                    //find active object tempqty 
                    let actviewobj = (actobj&&actobj.planogramShelfDto[i]?actobj.planogramShelfDto[i].planogramProduct.find(oitem => oitem.productInfo.id === prodobj.productInfo.id):undefined);
                    
                    if(actobj && actviewobj && Object.keys(actviewobj).length > 0){ //if found existing product
                        const actobjqty = (actviewobj?actviewobj.tempoldqty:0);
                        
                        if(actobjqty > 0){
                            var actchangeqty = 0;
                            var actchangetype = "";
                            var actnochange = false;
                            //check actobjqty more than or less than totalprodqty
                            if(totalprodqty < actobjqty){
                                actchangeqty = actobjqty - totalprodqty;
                                actchangetype = "QTY_REMOVE";
                            } else if(totalprodqty > actobjqty){
                                actchangeqty = totalprodqty - actobjqty;
                                actchangetype = "QTY_ADD";
                            } else if(totalprodqty === actobjqty){
                                //check changes available for this product
                                var ischangesavlble = addedshelvechanges.filter((yitem) => yitem.planogramShelfHasProductId === prodobj.id);

                                if(ischangesavlble && ischangesavlble.length > 0){
                                    actnochange = true;
                                }
                            }
                            
                            //if new changeqty available add that change with
                            if(actchangeqty > 0 || actnochange){
                                var cchangeobj = {id:-1, floorShelfChangeType: actchangetype, planogramShelfId: shelveobj.id, planogramShelfHasProductId: prodobj.id, planogramShelfHasProductF_UUID: prodobj.f_uuid, changeQty: actchangeqty, noChange:actnochange, isNew: true, isDelete: false};
                                cshelvechanges.push(cchangeobj);
                            }
                        }
                    } else{
                        var actchangeqty2 = 0;
                        var actchangetype2 = "";
                        var actnochange2 = false;
                        
                        if(totalprodqty > 0){
                            actchangeqty2 = totalprodqty;
                            actchangetype2 = "QTY_ADD";
                        } else{
                            actnochange2 = true;
                        }
                        var cchangeobj2 = {id:-1, floorShelfChangeType: actchangetype2, planogramShelfId: shelveobj.id, planogramShelfHasProductId: prodobj.id, planogramShelfHasProductF_UUID: prodobj.f_uuid, changeQty: actchangeqty2, noChange: actnochange2, isNew: true, isDelete: false};
                        cshelvechanges.push(cchangeobj2);
                    }
                    
                }
            }
            
            shelveobj.planogramShelfChanges = chelvechanges.concat(cshelvechanges !== undefined?cshelvechanges:[]);
            //console.log(shelveobj.planogramShelfChanges);
        }
        csobj["isProductOverLapping"] = isprodoverlapping;

        if(csobj.rightSidePlanogramFieldDto){
            csobj.rightSidePlanogramFieldDto.planogramShelfDto.sort(sortShelvesDesc);
        }
        
        //#PLG-DU-PP-H05 add propose data if available
        if(this.state.isproposeavailable && this.state.loadedProposeList && Object.keys(this.state.loadedProposeList).length > 0){
          csobj["suggestionDto"] = this.state.loadedProposeList;
        }
        //edit save changes - new object changes
        var nsaveobj = JSON.parse(JSON.stringify(csobj));
        var savepathobj = submitCollection.crudSingleFloorField;
        if(this.state.fieldStatus === "ACTIVE"){
            nsaveobj = {id:csobj.floorLayoutId, fieldDto: csobj};
            savepathobj = submitCollection.newSavePlanogram;
        }
        
        this.setState({savemodalshow: true});
        submitSets(savepathobj, nsaveobj, true).then(res => {

            this.setState({savemodalshow: false});
            if(res && res.status){
                var cmsg = this.props.t('draftfielddetails')+(csobj.isNew?this.props.t('saved'):this.props.t('updated'))+this.props.t('succussfuly');
                if(this.state.fieldStatus === "ACTIVE"){
                    cmsg = this.props.t('newdraftlayoutcreated');
                }
                alertService.success(cmsg);
                this.setState({ fieldHistory: [], rpchangedprodlist:[], ischangesavailable: false, warningProdList: [] }, () => {
                    this.props.setPLanogramdetailsView(null);
                    if(this.state.fieldStatus === "ACTIVE"){
                        this.props.setFieldIsNewDraftView(true);
                        this.props.history.push("/planograms/details");
                    } else{
                        this.reinitSaveObj(res.extra);
                        this.setState({savemodalmsg: cmsg, savemodalview: true});
                        //reload propose data if already loaded
                        if(this.state.isproposeavailable){
                          this.handleViewProposeList(true,true);
                        }
                    }
                });
            } else{
                alertService.error((res&&res.error&&res.error.errorMessage?res.error.errorMessage:"error occurred"));
            }
        });
    }
    //#PLG-DU-PD-H06 toggle products view
    toggleProdListView = (cstat) => {
        this.setState({isListViewActive: null}, () => {
            setTimeout(() => {
                this.setState({isListViewActive: cstat});
            }, 200);
        });
    }
    //remove expand
    removeExpandOpts = () => {
        this.setState({ isselectprodblock: false, isblockmove: false, isviewcmenu: false, contxtmenu: null});
        var ctumbdivs = document.getElementsByClassName("thumb-div");
        for (var z = 0; z < ctumbdivs.length; z++) {
            ctumbdivs[z].style.border = "1px solid #eee"
        }
    }
    //#PLG-DU-FE-H02 delete all products
    deleteAllProds = (saveobj) => {
        confirmAlert({
            title: this.props.t('deleteallproducts'),
            message: this.props.t('dlteallprodmessage'),
            overlayClassName: (this.props.isRTL==="rtl"?"alertrtl-content":""),
            buttons: [
              {
                label: this.props.t('btnnames.yes'),
                onClick: () => {
                    var csobj = saveobj;
                    for (var i = 0; i < csobj.planogramShelfDto.length; i++) {
                        const pshelf = csobj.planogramShelfDto[i];
                        for (var j = 0; j < pshelf.planogramProduct.length; j++) {
                            const pprod = pshelf.planogramProduct[j];
                            pprod["isDelete"] = true;
                            pprod["isNew"] = false;

                            var removeqtytotal = 0;
                            for (var l = 0; l < pprod.productBlock.length; l++) {
                                const pblock = pprod.productBlock[l];
                                pblock["isDelete"] = true;
                                pblock["isNew"] = false;

                                //removeqtytotal = removeqtytotal + pblock.productLocations.length;
                                for (var k = 0; k < pblock.productLocations.length; k++) {
                                    const plocation = pblock.productLocations[k];
                                    plocation["isDelete"] = true;
                                    plocation["isNew"] = false;

                                    if(plocation.overLappingDto){
                                        plocation.overLappingDto["isDelete"] = true;
                                        plocation.overLappingDto["isNew"] = false;
                                    }

                                    var allowbottom = checkProductIsInBottom(pshelf.y,pshelf.drawHeight,plocation.y,plocation.drawHeight)

                                    if(allowbottom){
                                        removeqtytotal = removeqtytotal + 1;
                                    }
                                }
                            }

                            //block remove change - RD changes
                            var newrdobj14 = {type:"REMOVE_PRODUCT", product: pprod.productInfo, shelve: i, prodobj: pprod, locobj: null, changeqty: removeqtytotal};
                            this.handleRDChanges(newrdobj14);
                        }
                    }
                    this.setState({ saveObj: csobj, isselectprodblock: false, isblockmove: false, isviewcmenu: false, contxtmenu: null, selectedlocobj: null }, () => {
                        this.checkEnableFieldEdit();
                    });
                }
              },
              {
                label: this.props.t('btnnames.no'),
                onClick: () => {}
              }
            ]
        });
    }
    //add field history
    fieldHistoryAdd = (csobj,type,rplist,rpoverview,rpchangeslist,existnewprods,trackproposelist,loadedproposelist) => {
        ///type=1 add item, type=2 delete item, type=3 move item, type=4 multiply item
        let cwarnlist = JSON.parse(JSON.stringify(this.state.warningProdList));

        var chobj = this.state.fieldHistory;
        var phistry = (chobj.past?chobj.past:[]);
        phistry.push({type:type, obj:csobj, rdchangeslist: rpchangeslist, rdlist: rplist, rdoverview: rpoverview, existnewprods: existnewprods, trackproposelist: trackproposelist, loadedproposelist: loadedproposelist, warnlist: cwarnlist});
        chobj["present"] = 0;
        chobj["past"] = phistry; chobj["future"] = [];

        this.setState({ fieldHistory: chobj });
    }
    //undo field hisory
    fieldHistoryUndo = () => {
        var chobj = this.state.fieldHistory;
        var backidx = (chobj.present>0?(chobj.present - 1):(chobj.past.length - 1));
        var getsobj = chobj.past[backidx];
        var cfutureobj = {type:getsobj.type, obj:JSON.parse(JSON.stringify(this.state.saveObj)), rdchangeslist: this.state.rpchangedprodlist, rdlist: this.state.rploadedrevenue, rdoverview: this.state.rploadedoverview, existnewprods: this.state.existnewprodlist, trackproposelist: this.state.trackedProposeChanges, loadedproposelist: this.state.loadedProposeList, warnlist: this.state.warningProdList};
        chobj.future.push(cfutureobj);
        chobj.past.splice(-1,1);
        
        this.setState({ saveObj: getsobj.obj, fieldHistory: chobj, rpchangedprodlist: getsobj.rdchangeslist,
        rploadedrevenue: getsobj.rdlist, rploadedoverview: getsobj.rdoverview, existnewprodlist: getsobj.existnewprods, trackedProposeChanges: getsobj.trackproposelist, loadedProposeList: getsobj.loadedproposelist, warningProdList: getsobj.warnlist}, () => {
            this.checkEnableFieldEdit();
        });
    }
    //redo field hisory
    fieldHistoryRedo = () => {
        var chobj = this.state.fieldHistory;
        var backidx = (chobj.present>0?(chobj.present + 1):(chobj.future.length - 1));
        var getsobj = chobj.future[backidx];
        var cpastobj = {type:getsobj.type, obj:JSON.parse(JSON.stringify(this.state.saveObj)), rdchangeslist: this.state.rpchangedprodlist, rdlist: this.state.rploadedrevenue, rdoverview: this.state.rploadedoverview, existnewprods: this.state.existnewprodlist, trackproposelist: this.state.trackedProposeChanges, loadedproposelist: this.state.loadedProposeList, warnlist: this.state.warningProdList};
        chobj.past.push(cpastobj);
        chobj.future.splice(-1,1);
        
        this.setState({ saveObj: getsobj.obj, fieldHistory: chobj, rpchangedprodlist: getsobj.rdchangeslist,
            rploadedrevenue: getsobj.rdlist, rploadedoverview: getsobj.rdoverview, existnewprodlist: getsobj.existnewprods, trackproposelist: getsobj.trackproposelist, loadedProposeList: getsobj.loadedproposelist, warningProdList: getsobj.warnlist }, () => {
                this.checkEnableFieldEdit();
        });
    }
    //show dot label
    dotTxtShow = (ctype, cposition) => {
        var cobj = (this.state.saveObj?this.state.saveObj:null);
        var rtxt = '0';
        if(cobj && Object.keys(cobj).length > 0){
            var cmtxt = convertUomtoSym((cobj.masterFieldUom?cobj.masterFieldUom:cobj.fieldDto.uom));
            var cptxt = (cposition===1?"0":cposition===2?(parseFloat(cobj[ctype]) / 2).toFixed(1):(parseFloat(cobj[ctype]).toFixed(1)));
            rtxt = cptxt + cmtxt;
        }
        return rtxt;
    }
    //handle back link
    handleGoBack = () =>{
        this.props.history.push("/planograms/details");
    }
    //select all block of selected product
    selectAllBlock = () => {
        var curselprod = this.state.currentInternalDraggableProd;
        if(curselprod){
            if(this.state.isblockmove){
                this.setState({isblockmove: false, currentSelectedBlock: null, contxtmenu:{isexpand:false}, selectedlocobj: null});
            } else{
                var curselblock = curselprod.prod.productBlock[curselprod.blockidx];
                this.setState({isselectprodblock: true, isblockmove: true, currentSelectedBlock: curselblock, contxtmenu:{isexpand:false}, selectedlocobj: null});
            }
        }
    }
    //handle allow overflow
    handleAllowOverflow = () => {
        this.setState({ allowovrflwprod: !this.state.allowovrflwprod }, () => {
            this.props.setFieldOverlapAction(this.state.allowovrflwprod);
        });
    }
    //#PLG-DU-PD-H07 handle product edit modal view
    handlePEMView = (view, obj, isdrag) => {
        //if it's update and close - update filtered/recent product list
        if(!view && obj && Object.keys(obj).length > 0){
            let saveobj = this.state.saveObj;
            var cfilprods = this.state.filteredProdList;
            var crecprods = this.state.AllRecentProdList;
            var filrecprods = this.state.recentProdList;

            //update filtered list
            for (var i = 0; i < cfilprods.length; i++) {
                if(cfilprods[i].id === obj.id){
                    obj["fieldid"] = saveobj.id;
                    cfilprods[i] = obj;
                }
            }
            //update all recent list
            for (var j = 0; j < crecprods.length; j++) {
                if(crecprods[j].id === obj.id && crecprods[j].fieldid === this.state.statfieldid){
                    obj["fieldid"] = saveobj.id;
                    crecprods[j] = obj;
                }
            }
            //update recent list
            for (var l = 0; l < filrecprods.length; l++) {
                if(filrecprods[l].id === obj.id){
                    obj["fieldid"] = saveobj.id;
                    filrecprods[l] = obj;
                }
            }
            //set state/redux
            this.props.setFieldRecList(crecprods);
            this.setState({filteredProdList: cfilprods, recentProdList: filrecprods, AllRecentProdList: crecprods});

            if(isdrag){
                this.setState({isShowProdView: false});
            }
        }

        this.setState({pemview: view, pemobj: obj});
    }
    //toggle field edit view
    toggleEditView = (cshowedit) => {
        let saveobj = JSON.parse(JSON.stringify(this.state.saveObj));
        if(this.state.isShowProdView){
            alertService.error(this.props.t('CLOSE_PRODUCT_VIEW_TO_CONTINUE'));
            return false;
        }
        this.setState({isshowedit: cshowedit, bkpFieldEditObj: saveobj });
    }
    //check enable edit field details/overlap margin
    checkEnableFieldEdit = () => {
        var csaveobj = this.state.saveObj;
        var isshoweditview = true; var isshowoverlapmargin = true;

        for (var i = 0; i < csaveobj.planogramShelfDto.length; i++) {
            const shelveobj = csaveobj.planogramShelfDto[i];

            if(shelveobj.overLappingDto && shelveobj.overLappingDto.length > 0){
                isshoweditview = false;
            }

            for (var j = 0; j < shelveobj.planogramProduct.length; j++) {
                const prodobj = shelveobj.planogramProduct[j];
                for (var k = 0; k < prodobj.productBlock.length; k++) {
                    const blockobj = prodobj.productBlock[k];
                    for (var l = 0; l < blockobj.productLocations.length; l++) {
                        const locobj = blockobj.productLocations[l];
                        if(locobj.isDelete === false){
                            isshoweditview = false;

                            if(locobj.overLappingDto && !locobj.overLappingDto.isDelete){
                                isshowoverlapmargin = false;
                            }
                        }
                    }
                }
            }
        }
        this.setState({ isenablefieldedit: isshoweditview, alloweditoverflwmargin: isshowoverlapmargin});
    }
    //#PLG-DU-FE-H05 handle field details edit
    handleFieldEditChanges = (obj) => {
        this.props.setPLanogramdetailsView(null);
        this.setState({saveObj: obj, isloadedfielddet: false}, () => {
            this.calculateRate(false);
        });
    }
    //view edit field
    handleViewChangeField = () => {
        this.setState({isAllowChangeField:true});
    }
    //#PLG-DU-PS-H02 handle data changes and update revenue details
    handleRDChanges = (cobj) => {
        if(this.state.fieldStatus === "INACTIVE"){
            return false;
        }

        var csaveobj = this.state.saveObj;

        //update shelveobj changes
        var crplist = this.state.rpchangedprodlist;

        if(cobj.type !== "POSITION_CHANGE"){
            var cchangeobj = {id:-1, floorShelfChangeType: cobj.type, planogramShelfId: csaveobj.planogramShelfDto[cobj.shelve].id, planogramShelfHasProductId: cobj.prodobj.id, planogramShelfHasProductF_UUID: cobj.prodobj.f_uuid, changeQty: cobj.changeqty, isNew: true, isDelete: false};
            crplist.push({shelve:cobj.shelve, changeobj:cchangeobj});
        }
        
        if(crplist){
            this.setState({rpchangedprodlist: crplist}, () => { //saveObj: csaveobj,
                this.checkRDChanges(cobj); 
            });
        }
    }
    //#PLG-DU-PS-H03 check rd changes
    checkRDChanges = (cobj) => {
        var csaveobj = JSON.parse(JSON.stringify(this.state.saveObj));
        var cproduct = cobj.product;
        var cloadedrdlist = this.state.rploadedrevenue;
        var curprodlist = (cloadedrdlist&&cloadedrdlist.productSaleInformation?cloadedrdlist.productSaleInformation:[]);
        
        //find total available qty of product
        var totalprodqty = 0;
        var existprodlist = this.state.existnewprodlist;
        var warningprods = this.state.warningProdList;
        //existing total qty set
        var checkalrdyadded = existprodlist.findIndex(z => z.productInfo.id === cproduct.id);

        //count facing qty of current product
        var cbottomqty = 0; var bottomwidthtotal = 0;
        for (var b = 0; b < csaveobj.planogramShelfDto.length; b++) {
            const pshelf = csaveobj.planogramShelfDto[b];
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
                                            cbottomqty = cbottomqty + 1;
                                            bottomwidthtotal = bottomwidthtotal + plocation.productWidth;
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
        //if position change set changeqty to bottom qty
        if(cobj.type === "POSITION_CHANGE"){
            cobj["changeqty"] = cbottomqty;
        }

        //existing/new product list and propose list update
        var existingproditem = null;
        if(checkalrdyadded === undefined || checkalrdyadded === -1){
            if(cobj.type === "QTY_ADD" || cobj.type === "ADD_NEW_BLOCK" || cobj.type === "POSITION_CHANGE"){
                cobj.prodobj["existviewtype"] = 2;
                cobj.prodobj["productFacingQty"] = cbottomqty;
                cobj.prodobj["loadingProductFacingQty"] = cbottomqty;
                existprodlist.push(cobj.prodobj); //this prod object use to show existing prods and dragndrop
                
                existingproditem = cobj.prodobj;

                this.handleUpdateProposeList(2,cproduct);

                //add new prod to warn list
                this.addItemstoWarning(cproduct);
            }
        } else{
            if(cobj.type === "QTY_ADD" || cobj.type === "ADD_NEW_BLOCK"){
                var cexistitem = existprodlist[checkalrdyadded];
                cexistitem["productFacingQty"] = cbottomqty;
                existingproditem = cexistitem;
            } else if(cobj.type === "QTY_REMOVE" || cobj.type === "REMOVE_BLOCK" || cobj.type === "REMOVE_PRODUCT"){
                var cexistitem2 = existprodlist[checkalrdyadded];
                existingproditem = cexistitem2;
                if(cbottomqty > 0){
                    cexistitem2["productFacingQty"] = cbottomqty;
                } else{
                    existprodlist.splice(checkalrdyadded,1);
                    this.handleUpdateProposeList(1,cproduct);

                    //remove from warning list
                    let newwarnlist = warningprods.filter(x => x.productId !== cproduct.id);
                    this.setState({ warningProdList: newwarnlist });
                }
            } else if(cobj.type === "POSITION_CHANGE"){
                var cexistitem3 = existprodlist[checkalrdyadded];
                cexistitem3["productFacingQty"] = cbottomqty;
                existingproditem = cexistitem3;
            }
        }
        this.setState({ existnewprodlist: existprodlist});

        if(!this.state.isActiveMode){ // prevent go further for new draft layouts
            return false;
        }
        //if postion change not calc
        if(cobj.type === "POSITION_CHANGE"){
            return false;
        }

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

        var draftingProfit = (cloadedrdlist.totalDraftingProfit ? cloadedrdlist.totalDraftingProfit : cloadedrdlist.totalProfit) //changed profit
        var draftingRevenue = (cloadedrdlist.totalDraftingRevenue ? cloadedrdlist.totalDraftingRevenue : cloadedrdlist.totalRevenue ) //changed revenue
        
        //find product
        var foundprodidx = curprodlist.findIndex(x => x.productId === cproduct.id);
        //if product found in current sales list
        if(foundprodidx > -1){
            var foundproduct = curprodlist[foundprodidx]; //get product details
            var prodsaleinfo  = foundproduct.currentSaleInformation;
            var effesaledetails = (foundproduct.effectedSaleInformation?foundproduct.effectedSaleInformation:{});
            //if current sale information available
            if(prodsaleinfo){
                //calculate current changed qty
                var existingoldqty = (existingproditem?existingproditem.loadingProductFacingQty:0);
                var reducedqty = (effesaledetails&&effesaledetails.oldProductQty?effesaledetails.oldProductQty:prodsaleinfo.oldProductQty) - existingoldqty; //reduce changing qty from total qty
                var addednewqty = reducedqty + cbottomqty; //add new changed qty
                
                //init current changed revenue/profits
                var revenuevalue = prodsaleinfo.salePerFacingDay;
                var profitvalue = prodsaleinfo.profitPerFacingDay;
                //if removing change
                if(cobj.type === "QTY_REMOVE" || cobj.type === "REMOVE_BLOCK" || cobj.type === "REMOVE_PRODUCT"){
                    var additionDraftingRevenue = 0

                    if(cobj.changeqty > 0){
                        //if showing, remove if not available
                        if(!checkProdAvailabilityInFeild(cproduct.id,csaveobj)){
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

                        cloadedrdlist["productSaleInformation"] = curprodlist;
                        cloadedrdlist["totalDraftingProfit"] = cdraftprofit;
                        cloadedrdlist["totalDraftingRevenue"] = cdraftrevenue;

                        this.setState({rploadedrevenue: refreshRevProPercentages(cloadedrdlist)}, () => {
                            this.changeRDProfitTotal();
                        });
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
                        cloadedrdlist["productSaleInformation"] = curprodlist;
                        cloadedrdlist["totalDraftingProfit"] = cdraftprofit2;
                        cloadedrdlist["totalDraftingRevenue"] = cdraftrevenue2;

                        this.setState({rploadedrevenue: refreshRevProPercentages(cloadedrdlist)}, () => {
                            this.changeRDProfitTotal();
                        });
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
                    cloadedrdlist["productSaleInformation"] = curprodlist;
                    cloadedrdlist["totalDraftingProfit"] = cdraftprofit4;
                    cloadedrdlist["totalDraftingRevenue"] = cdraftrevenue5;

                    this.setState({rploadedrevenue: refreshRevProPercentages(cloadedrdlist)}, () => {
                        this.changeRDProfitTotal();
                    });
                }
            } else{ //sale info not found
                var existingoldqty2 = (existingproditem?existingproditem.loadingProductFacingQty:0);
                var reducedqty2 = effesaledetails.oldProductQty - existingoldqty2; //reduce changing qty from total qty
                var addednewqty2 = reducedqty2 + cbottomqty; //add new changed qty
                //get active department revenue/profit facing day values
                var singleRevenue = (cloadedrdlist?cloadedrdlist.activeDepartmentSalesPerFacingDay:0);
                var singleProfit = (cloadedrdlist?cloadedrdlist.activeDepartmentProfitPerFacingDay:0);
                //if not position change
                if((cobj.type !== "POSITION_CHANGE" && cobj.changeqty > 0) || (cobj.type === "POSITION_CHANGE" && cobj.iscalc)){

                    var additionDraftingProfit = 0
                    var additionDraftingRevenue2 = 0
                    if(cobj.type === "QTY_REMOVE" || cobj.type === "REMOVE_BLOCK" || cobj.type === "REMOVE_PRODUCT"){

                        //if showing, remove if not available
                        if(!checkProdAvailabilityInFeild(cproduct.id,csaveobj))
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
                    cloadedrdlist["productSaleInformation"] = curprodlist;
                    cloadedrdlist["totalDraftingProfit"] = cdraftprofit3;
                    cloadedrdlist["totalDraftingRevenue"] = cdraftrevenue3;

                    this.setState({rploadedrevenue: refreshRevProPercentages(cloadedrdlist)},()=>{
                        this.changeRDProfitTotal();
                    });
                }
            }
        } else{ //for new product
            if(cobj.changeqty > 0){
                //get active plgram facing revenue/profit details
                var activerevenueface = (cloadedrdlist?cloadedrdlist.activeDepartmentSalesPerFacingDay:0);
                var activeprofiteface = (cloadedrdlist?cloadedrdlist.activeDepartmentProfitPerFacingDay:0);
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

                cloadedrdlist["productSaleInformation"] = curprodlist;
                cloadedrdlist["totalDraftingProfit"] = newproddraftprofit;
                cloadedrdlist["totalDraftingRevenue"] = newproddraftrevenue;
                this.setState({rploadedrevenue: refreshRevProPercentages(cloadedrdlist)},()=>{
                    this.changeRDProfitTotal();
                });
            }
        }
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
        var crddetails = this.state.rploadedrevenue;
        var crdrevenue = crddetails.totalRevenue;
        //get current draft profit total
        var nrdrevenue = (crddetails.totalDraftingRevenue?crddetails.totalDraftingRevenue:crdrevenue);
        
        //calc new percentage
        var newimpvalue = (nrdrevenue - crdrevenue);

        var newprofitper = (crdrevenue !== 0?((newimpvalue / crdrevenue) * 100):0);
        crddetails["newProfit"] = newprofitper.toFixed(2);
        
        this.setState({rploadedrevenue: crddetails});
    }
    //#PLG-DU-PS-H01 load revenue details change details
    loadRDDetails = (cobj, nobj) => {
        var deptid = (cobj&&cobj.department?cobj.department.departmentId:0);

        if(deptid > 0){
            //search object
            var obj = {department: deptid};
            var submitpath = submitCollection.findPlanogramCurrentSales;
            //if current field is a draft/merge/confirmed 
            if(this.state.fieldStatus==="DRAFT" || this.state.fieldStatus==="MERGE" || this.state.fieldStatus==="CONFIRMED"){
                submitpath = submitCollection.findPlanogramEditmodeSales;
                obj["draftingFieldId"] = cobj.id;
                obj["activeFloorLayoutId"] = nobj.floorLayoutId;
                obj["field"] = nobj.id;
            } else{ //if active layout
                obj["activeFloorLayoutId"] = cobj.floorLayoutId;
                obj["field"] = cobj.id;
            }

            this.setState({isrpdetailsloading: true}); //loading sale details gif shows
            submitSets(submitpath, obj, false).then(res => {
                this.setState({savemodalshow: false});
                if(res && res.status && res.extra){
                    var nloadeddata = res.extra;
                    var curprodlist = (nloadeddata&&nloadeddata.productSaleInformation?nloadeddata.productSaleInformation:[]);
                    
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
                    nloadeddata["productSaleInformation"] = curprodlist;

                    this.setState({rploadedrevenue: nloadeddata, isrpdetailsloading: false}, () =>{
                        this.changeRDProfitTotal();
                    });
                }
            });
        }
    }
    //#PLG-DU-OV-H01 load revenue details change details
    loadRDOverviewDetails = (cobj) => {
        this.setState({isrpoverviewloading: true});
        setTimeout(() => {
            var deptid = (cobj&&cobj.department?cobj.department.departmentId:0);

            if(deptid > 0){
                var obj = {department: deptid, storeId: this.state.selStoreId, activeFloorLayoutId:(this.state.fieldStatus==="ACTIVE"?cobj.floorLayoutId:cobj.baseFloorLayoutId)};
                
                submitSets(submitCollection.findPlanogramOverViewSales, obj, false).then(res => {
                    if(res && res.status && res.extra && Object.keys(res.extra).length > 0){
                        this.setState({rploadedoverview: res.extra, isrpoverviewloading: false});
                    } else{
                        this.setState({isrpoverviewloading: false});
                    }
                });
            } else{
                this.setState({isrpoverviewloading: false});
            } 
        }, 1000);
    }
    //clear all new changes
    handleResetNewPgram = () => {
        if(this.state.fieldHistory&&this.state.fieldHistory.past&&this.state.fieldHistory.past.length>0){
            confirmAlert({
                title: this.props.t('RESET_NEW_CHANGES'),
                message: this.props.t('ARE_YOU_SURE_TO_RESET_ALL_NEW_CHANGES'),
                overlayClassName: (this.props.isRTL==="rtl"?"alertrtl-content":""),
                buttons: [{
                    label: this.props.t('btnnames.yes'),
                    onClick: () => {
                        var cpastlist = this.state.fieldHistory.past;
                        var rsaveobj = cpastlist[0];
                        this.setState({saveObj: rsaveobj.obj, rploadedrevenue: rsaveobj.rdlist, rploadedoverview: rsaveobj.rdoverview, fieldHistory: {}, existnewprodlist: rsaveobj.existnewprods}, () => {
                            this.checkEnableFieldEdit();
                        });
                    }
                }, {
                    label: this.props.t('btnnames.no')
                }]
            });
        }
    }
    //sort revenue by current sort type
    sortRevenueList = ( a, b ) => {
        if(this.state.cursorttype === "productName"){
          if(this.state.cursortview === "DESC"){
            if ( a.productName > b.productName ){ return -1; }
            if ( a.productName < b.productName ){ return 1; }
          } else{
            if ( a.productName < b.productName ){ return -1; }
            if ( a.productName > b.productName ){ return 1; }
          }
        } else{
            var ainfo = (a.effectedSaleInformation?a.effectedSaleInformation[this.state.cursorttype]:a.currentSaleInformation?a.currentSaleInformation[this.state.cursorttype]:0);
            var binfo = (b.effectedSaleInformation?b.effectedSaleInformation[this.state.cursorttype]:b.currentSaleInformation?b.currentSaleInformation[this.state.cursorttype]:0);
            if(this.state.cursortview === "DESC"){
                if ( ainfo > binfo ){ return -1; }
                if ( ainfo < binfo ){ return 1; }
            } else{
                if ( ainfo < binfo ){ return -1; }
                if ( ainfo > binfo ){ return 1; }
            }
        }
        return 0;
    }
    //#PLG-DU-PS-H06 sort revenue table data
    handleTableSort = (ctype,sorttype) => {
        if(this.state.rploadedrevenue && this.state.rploadedrevenue.productSaleInformation){
            this.setState({cursorttype: ctype, cursortview: sorttype}, () => {
                var cloadeddat = this.state.rploadedrevenue;
                var curprodlist = cloadeddat.productSaleInformation.sort(this.sortRevenueList);
                cloadeddat["productSaleInformation"] = curprodlist;
                this.setState({rploadedrevenue: cloadeddat});
            });
        }
    }
    //waiting modal toggle
    handleToggleSaveModal = () => {
        this.setState({savemodalview: !this.state.savemodalview});
    }
    //#PLG-DU-PS-H04 viewProduct details show
    viewProdOnClock = (e,prod) =>{
        e.preventDefault();
        if(e.shiftKey){ //on shiftkey - filter list
            var cfilterlist = this.state.filterRevenueList;
            var isalreadyadded = cfilterlist.findIndex(x => x.id === prod.id);
            if(isalreadyadded === -1){
                cfilterlist.push(prod);
            } else{
                cfilterlist.splice(isalreadyadded,1);
            }
            this.setState({filterRevenueList: cfilterlist});
        } else{
            if(!this.state.isviewvmenu){
                if(this.state.aczoompanactive && this.state.acactivetool === "pantool"){
                    alertService.error(this.props.t("disable_pan"));
                    return false;
                }
            }

            var scrolledheight = document.documentElement.scrollTop;
            this.setState({
                viewmenu: { xpos:(e.nativeEvent.x + 5), ypos: (e.nativeEvent.y + scrolledheight) },
                isviewvmenu: !this.state.isviewvmenu,
                currentViewableProd: prod
            });
        }
    }
    //remove filtered item
    handleDeleteFilteredList = (type, idx) => {
        var cfilterlist = this.state.filterRevenueList;
        if(type === 1){
            cfilterlist = [];
        } else{
            cfilterlist.splice(idx,1);
        }
        this.setState({filterRevenueList: cfilterlist});
    }
    //show test ai view
    handleViewTestAI = () => {
        this.setState({ showTestAiview: !this.state.showTestAiview});
    }
    //get ai baseimage
    handleViewBaseImage = (isshow) => {
        if(isshow){
          if(this.state.baseimagepath === null){
            submitSets(submitCollection.findFloorFieldWithAiImage, ("?floorFieldId="+this.state.saveObj.id), false).then(res => {
                //console.log(res);
                if(res && res.status && res.extra && res.extra.aiImageUrl){
                    this.setState({showbaseimageview: isshow, baseimagepath: res.extra.aiImageUrl});
                } else{
                    this.setState({showbaseimageview: isshow, baseimagepath: null});
                }
            });
          } else{
            this.setState({showbaseimageview: isshow });
          }
        } else{
            this.setState({showbaseimageview: isshow});
        }
    }
    //#PLG-DU-PP-H01 view propose list
    handleViewProposeList = (isshow,isreset) => {
        if(isshow){
          if(this.state.isproposeavailable && !isreset){
            this.setState({showproposelist: isshow},() => {
              if(this.propviewref){ this.propviewref.current.click(); }
            });
          } else{
            var obj = {};
            if(this.state.fieldStatus==="DRAFT" || this.state.fieldStatus==="MERGE" || this.state.fieldStatus==="CONFIRMED"){
                if(this.state.activeViewObj&&this.state.activeViewObj.id > 0){
                    obj["draftingFloorFieldId"] = this.state.saveObj.id;
                    obj["activeFloorFieldId"] = this.state.activeViewObj.id;
                } else{
                    alertService.error("Active planogram details not found");
                    return false;
                }
            } else{
                obj["draftingFloorFieldId"] = 0;
                obj["activeFloorFieldId"] = this.state.saveObj.id;
            }
            this.setState({isProposeDataLoading: true});
            //load current propose data
            submitSets(submitCollection.findFloorFloorFieldSuggestionProducts, obj, false).then(res => {
                this.setState({isProposeDataLoading: false});
                if(res && res.extra){
                  if((res.extra.addingItemArray && res.extra.addingItemArray.length > 0) || (res.extra.removeItemArray && res.extra.removeItemArray.length > 0)){
                    this.setState({showproposelist: isshow, loadedProposeList: res.extra, isproposeavailable:true }, () => {
                      this.checkProposeAlreadyAdded();
                      if(this.propviewref){ this.propviewref.current.click(); }
                    });
                  } else{
                    alertService.error(this.props.t("NOT_AVAILABLE_ANY_PROPOSAL_ITEMS"));
                  }
                } else{
                  alertService.error(this.props.t("NOT_AVAILABLE_ANY_PROPOSAL_ITEMS"));
                }
            });
          }
        } else{
          this.setState({showproposelist: isshow}, () => {
            if(this.propviewref){ this.propviewref.current.click(); }
          });
        }
    }
    //#PLG-DU-PP-H02 check items removed/added before load propose data
    checkProposeAlreadyAdded = () => {
      var cproposedata = this.state.loadedProposeList;
      var removeproplist = (cproposedata&&cproposedata.removeItemArray?cproposedata.removeItemArray:[]);
      var addproplist = (cproposedata&&cproposedata.addingItemArray?cproposedata.addingItemArray:[]);

      //remove items
      for (let i = 0; i < removeproplist.length; i++) {
        const isalreadyremoved = this.state.existnewprodlist&&this.state.existnewprodlist.length>0?this.state.existnewprodlist.findIndex(x => x.productInfo.id === removeproplist[i].itemId):-1;
        if(isalreadyremoved === -1){
          removeproplist[i]["applyStatus"] = "apply";
        }
      }
      //add items
      for (let j = 0; j < addproplist.length; j++) {
        const isalreadyremoved = this.state.existnewprodlist&&this.state.existnewprodlist.length>0?this.state.existnewprodlist.findIndex(x => x.productInfo.id === addproplist[j].itemId):-1;
        if(isalreadyremoved > -1){
          addproplist[j]["applyStatus"] = "apply";
        }
        const cprod = addproplist[j];
        const newprodinfo = {id: cprod.itemId, barcode: cprod.itemBarcode, productName: cprod.itemName, imageUrl: cprod.itemImageUrl, width: cprod.productWidth, height: cprod.productHeight, uom: cprod.productUom, depth: cprod.productDepth}
        addproplist[j]["productInfo"] = newprodinfo;
      }
      this.setState({ loadedProposeList: cproposedata });
    }
    //copy barcode to clipboard message show
    copyToClipboard = (ctxt) => {
        alertService.info(this.props.t("COPIED_TO_CLIP_BOARD"));
    }
    //highlight view
    handlePropHighlight = (ctype, citemid) => {
      var cobj = this.state.propshowhighlight;
      if(citemid && citemid > 0){
        cobj.isshow = true;
        cobj.itemid = citemid;
        cobj.type = ctype;
      } else{
        cobj = {isshow: false, itemid: 0, type: 0};
      }
      this.setState({ propshowhighlight: cobj });
    }
    //handle propose tabs
    handleProposeTabs = (selectevent) => {
      this.setState({ proposeselecttab: selectevent});
    }
    //#PLG-DU-PD-H12 toggle rotate product modal
    toggleRotateProd = (cprod,isshowedit) => {
        this.setState({ showrotateprod: !this.state.showrotateprod, selectedrotateprod: (cprod?cprod:null), isshowrotateedit: isshowedit });
    }
    //update rotate product
    updateRotateProd = (cprod) => {
        this.handlePEMView(false,cprod);
        this.setState({showrotateprod: false});
    }
    //update debug details
    updatedebuglog = (type, msg) => {
        var cloglist = this.state.debugLogList;
        cloglist.push({type: type, msg: msg});
        this.setState({ debugLogList: cloglist });
    }
    //toggle debug view
    toggledebugview = () => {
        this.setState({ showdebuglog: !this.state.showdebuglog });
    }
    //handle change overlap margin change
    handleChangeOverlapSafty = (csobj) => {
        this.setState({ saveObj: csobj});
    }
    //recheck overlap field
    recheckOverlapField = () => {
        var csobj = this.state.saveObj;
        if(csobj && csobj.rightSidePlanogramFieldDto){
            var returnobj = compareSideToAllowDrop(csobj);
            this.setState({ saveObj: returnobj });
        }
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
    //new tools handle
    handleToolControls = (viewid,tooltype, event, startpan) => {
        let activezoompan = true;
        let isactiveview = (viewid === "ac-mainsvg-view");

        let svg = document.getElementById(viewid);
        let viewBox = svg.viewBox.baseVal;

        //view width/height
        let vwidth = (isactiveview?this.state.aviewWidth:this.state.viewWidth);
        let vheight = (isactiveview?this.state.aviewHeight:this.state.viewHeight);

        let iszpactive =(isactiveview?this.state.aczoompanactive:this.state.zoompanactive);
        let actool = (isactiveview?this.state.acactivetool:this.state.activetool);
        let stpan = (isactiveview?this.state.acstartpan:this.state.startpan);

        let zoomdrawx = this.state.zoomDrawX;
        let aczoomdrawx = this.state.aczoomDrawX;
        //aczoompanactive: false, acactivetool: "default", acstartpan: false,
        if(tooltype === "zoomin"){
            handleZoomInOut(viewid,true,false);

            if(isactiveview){
                aczoomdrawx = aczoomdrawx + 1;
            } else{
                zoomdrawx = zoomdrawx + 1;
            }

            this.setState({ isShowProdView: false, isenablefieldedit: false, isviewvmenu: false });
        } else if(tooltype === "zoomout"){
            if(roundOffDecimal(vwidth,2) <= roundOffDecimal((viewBox.width * 2),2)){
                activezoompan = false;
                handleZoomInOut(viewid,false,true,vwidth,vheight);

                if(isactiveview){
                    aczoomdrawx = 0;
                } else{
                    zoomdrawx = 0;
                }
            } else{
                handleZoomInOut(viewid,false,false,vwidth);

                if(isactiveview){
                    aczoomdrawx = aczoomdrawx - 1;
                } else{
                    zoomdrawx = zoomdrawx - 1;
                }
            }

        } else if(tooltype === "zoomreset"){
            activezoompan = false;
            handleZoomInOut(viewid,false,true,vwidth,vheight);

            if(isactiveview){
                this.setState({ acactivetool: "default" });
                aczoomdrawx = 0;
            } else{
                this.setState({ activetool: "default" });
                zoomdrawx = 0;
            }

        }
        
        if(tooltype === "zoomin" || tooltype === "zoomout" || tooltype === "zoomreset"){
            //console.log(zoomdrawx,aczoomdrawx);
            this.setState({ zoomDrawX: zoomdrawx, aczoomDrawX: aczoomdrawx, isviewcmenu: false, contxtmenu:{isexpand: false} }, () => {
                if(!isactiveview && zoomdrawx === 0){
                    this.checkEnableFieldEdit();
                }
            });
        }
        
        if(tooltype === "pan"){
            if(actool === "pantool" && stpan){
                let fielddetails = { drawWidth: this.state.viewWidth, drawHeight: this.state.viewHeight };
                if(isactiveview){
                    fielddetails = { drawWidth: this.state.aviewWidth, drawHeight: this.state.aviewHeight };
                }
                handlePanView(viewid, event, iszpactive, this.state.zoomDrawX, fielddetails);
            }
        } else if(tooltype === "panstart"){
            if(isactiveview){
                this.setState({ acstartpan: startpan });
            } else{
                this.setState({ startpan: startpan });
            }
        } else if(tooltype === "pantool"){
            if(isactiveview){
                this.setState({ acactivetool: (tooltype === actool?"default":tooltype) });
            } else{
                this.setState({ activetool: (tooltype === actool?"default":tooltype) });
            }
        } else{
            if(isactiveview){
                this.setState({ aczoompanactive: activezoompan, allowovrflwprod: (activezoompan && this.state.allowovrflwprod?false:this.state.allowovrflwprod) });
            } else{
                this.setState({ zoompanactive: activezoompan, allowovrflwprod: (activezoompan && this.state.allowovrflwprod?false:this.state.allowovrflwprod) });
            }
        }
    }
    //preview product details
    togglePreviewModal = (isshow, obj) => {
        //console.log(isshow);
        this.setState({ isShowPreviewProd: isshow, prodPreviewObj: obj });
    }
    //
    handleProductImgPreview = (prod,type)=>{
        this.setState({showPreviewImageModal:type, productId:(prod?prod.id:0)});
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

    //toggle prod update modal
    toggleProductUpdateModal = (isrefresh) =>{
        this.setState({showProductUpdateModal:!this.state.showProductUpdateModal},()=>{
            if(isrefresh===true){
                this.setState({filteredProdList: []},()=>{
                    let ctxt = document.getElementById("filterprodtxt").value;
                    this.searchProdList(ctxt,0);
                });
            } else if(isrefresh==="delete"){
                this.setState({filteredProdList: []},()=>{
                    document.getElementById("filterprodtxt").value = "";
                    //this.searchProdList("",0);
                })
            }   
        });
    }
    //validate product before add to dunit
    validateProdDetails = (prodDetails) => {
        let isallowtodrop = true;
        if(!prodDetails || !prodDetails.width || !prodDetails.height || !prodDetails.uom || prodDetails.uom === ""){
            isallowtodrop = false;
        }

        return isallowtodrop;
    }

    render(){
        return (<>
            <React.Fragment>
                <Prompt when={this.state.ischangesavailable}
                message={this.props.t('YOU_HAVE_UNSAVED_CHANGES_SURE_TO_LEAVE')?this.props.t('YOU_HAVE_UNSAVED_CHANGES_SURE_TO_LEAVE'):""} />
            </React.Fragment>
            <Col xs={12} className={"main-content pg-dunitview "+(this.props.isRTL==="rtl"?"RTL":"")} dir={this.props.isRTL}>
                {this.state.noteinfomsg?<Col className={"noteinfo-msg"+(this.state.noteinfomsg.close?"":" active")}>{this.state.noteinfomsg.message}</Col>:<></>}
                
                {!this.state.isActiveMode?<LeftRightToggle saveobj={this.state.saveObj} size="large" t={this.props.t} isRTL={this.props.isRTL} handleChangeLeftRightField={this.handleChangeLeftRightField} />:<></>}

                {this.state.isviewcmenu?<ContextMenu handleProductImgPreview={this.handleProductImgPreview} isRTL={this.props.isRTL} togglePreviewModal={this.togglePreviewModal} isview={this.state.isviewcmenu} copyToClipboard={this.copyToClipboard} currentprod={this.state.currentInternalDraggableProd} handledelete={this.handleToggleDelete} handledeleteall={this.handleDeleteAllProd} handlexpand={this.handleExpandProd} handlclose={() => this.setState({isviewcmenu:false})} xpos={this.state.isviewcmenu?this.state.contxtmenu.xpos:0}
                         ypos={this.state.isviewcmenu?this.state.contxtmenu.ypos:0} isexpand={this.state.contxtmenu?this.state.contxtmenu.isexpand:false} />:<></>}
                {this.state.isviewvmenu?<ViewMenu handleProductImgPreview={this.handleProductImgPreview} isRTL={this.props.isRTL} togglePreviewModal={this.togglePreviewModal} copyToClipboard={this.copyToClipboard} viewProd={this.state.currentViewableProd} handlclose={() => this.setState({isviewvmenu:false})} xpos={this.state.isviewvmenu?this.state.viewmenu.xpos:0}
                         ypos={this.state.isviewvmenu?this.state.viewmenu.ypos:0} />:<></>}

                <Col xs={12} className="white-container pdunit-content" style={{background:"transparent",boxShadow:"none",padding:"0px"}}>
                    <Col>
                        <h3>
                            <Button variant="light" type="button" className="backpg-link" onClick={this.handleGoBack} style={{textTransform:"uppercase",fontWeight:"600",padding:"2px 5px",marginRight:"5px"}}><ChevronLeftIcon size={22}/></Button>
                            {this.state.saveObj?(this.state.saveObj.department?(this.state.saveObj.department.name.substring(0,25)+(this.state.saveObj.department.name.length > 25?"..":"")):"")+(this.state.saveObj.noInFloorLayout > 0?(" : "+this.state.saveObj.noInFloorLayout):""):"Display Unit"}
                            {this.state.saveObj&&this.state.saveObj.isHasAiImage?<Button variant="info" size="sm" className="float-right baseimg-link" onClick={() => this.handleViewBaseImage(true)}><ImageIcon size={12} /> AI IMAGE</Button>:<></>}
                        </h3>
                        <Breadcrumb dir="ltr" className="dunit-breadscrumb">
                            {this.props.isRTL==="rtl"?<>
                            <li className="breadcrumb-item"><Link to="/planograms/details" role="button">{this.props.t('storeview')}</Link></li>
                            <li className="breadcrumb-item"><Link to="/planograms" role="button">{this.props.t('planograms')}</Link></li>
                            {/* <li className="breadcrumb-item"><Link to="/dashboard" role="button">{this.props.t('home')}</Link></li> */}
                            </>:<>
                            {/* <li className="breadcrumb-item"><Link to="/dashboard" role="button">{this.props.t('home')}</Link></li> */}
                            <li className="breadcrumb-item"><Link to="/planograms" role="button">{this.props.t('planograms')}</Link></li>
                            <li className="breadcrumb-item"><Link to="/planograms/details" role="button">{this.props.t('storeview')}</Link></li>
                            </>}
                        </Breadcrumb>
                    </Col>

                    <ProdsAddSidebar t={this.props.t} isRTL={this.props.isRTL} toggleProdListView={this.toggleProdListView} handleFilterProducts={this.handleFilterProducts}
                    handlePEMView={this.handlePEMView} toggleRotateProd={this.toggleRotateProd} handleProductImgPreview={this.handleProductImgPreview} drawRectCanvas={this.drawRectCanvas} dragStart={this.dragStart} loadMoreProds={this.loadMoreProds}
                    copyToClipboard={this.copyToClipboard} toggleProdView={this.toggleProdView} recentProdList={this.state.recentProdList} filteredProdList={this.state.filteredProdList} isShowProdView={this.state.isShowProdView}
                    isListViewActive={this.state.isListViewActive} ptotalresults={this.state.ptotalresults}
                     />

                    <ProdsWarningSidebar t={this.props.t} isRTL={this.props.isRTL} showWarningSidebar={this.state.showWarningSidebar} warningProdList={this.state.warningProdList} 
                    toggleWarningSidebar={this.toggleWarningSidebar} copyToClipboard={this.copyToClipboard} handleProductImgPreview={this.handleProductImgPreview} />

                    <Col xs={12} lg={4} style={{height:0, overflow:"hidden"}}>
                        <div ref={this.actdisplaydiv} style={{minHeight:"390px"}}></div>
                    </Col>

                    <Row style={{marginTop:"5px"}} onContextMenu={e => e.preventDefault()}>

                        <Col xs={12} lg={4} className={this.state.isActiveMode?"":"d-none"}>
                            <Col xs={12} className="contentview-main" style={{background:"rgba(255,255,255,.2)",position:"relative"}}>

                                <ul className={"newpgtop-btnlist list-inline "+(this.props.isRTL === "rtl"?"float-left":"float-right")} style={{marginTop:"-8px"}}>
                                    <li className="list-inline-item tool-controls-list"><Button variant="outline-dark" onClick={() => this.handleToolControls('ac-mainsvg-view',"zoomin")} className="btn-with-icon" size="sm" title={this.props.t("ZOOM_IN")}><FeatherIcon icon="zoom-in" size={14}/></Button></li>
                                    <li className="list-inline-item tool-controls-list"><Button variant="outline-dark" onClick={() => this.handleToolControls('ac-mainsvg-view',"zoomout")} className="btn-with-icon" size="sm" title={this.props.t("ZOOM_OUT")}><FeatherIcon icon="zoom-out" size={14}/></Button></li>
                                    <li className="list-inline-item tool-controls-list" style={{marginRight:"10px"}}><Button variant="outline-dark" onClick={() => this.handleToolControls('ac-mainsvg-view',"zoomreset")} className={"btn-with-icon "} size="sm" title={this.props.t("resetZoom")}><FeatherIcon icon="x-circle" size={14}/></Button></li>
                                    <li className="list-inline-item tool-controls-list"><Button variant="outline-dark" onClick={() => this.handleToolControls('ac-mainsvg-view',"pantool")} className={"btn-with-icon "+(this.state.acactivetool === "pantool"?"active":"")} size="sm" title={this.props.t("ZoomPan")}><FeatherIcon icon="move" size={14}/></Button></li>
                                </ul>

                                <h5>{this.props.t('existingplanogram')}</h5>
                                <div className={"NDUrowStructuredraw"} dir="ltr" style={{minHeight:"390px",padding:"20px 15px",paddingLeft:"15px"}}>
                                    {!this.state.isloadedfielddet?<Col className="text-center" style={{position:"absolute",top:"45%",left:"45%"}}><img src={loadinggif} style={{height:"20px"}} alt="field loading gif"/></Col>:<></>}

                                    {this.state.isloadedfielddet?<>
                                        {this.state.aviewHeight > 0 &&<>
                                        <svg id="ac-mainsvg-view" className={(this.state.aczoompanactive?"svgzoom-action":"")} viewBox={'0 0 '+this.state.aviewWidth+' '+this.state.aviewHeight} onMouseDown={e => this.handleToolControls('ac-mainsvg-view',"panstart",e,true)} onMouseUp={e => this.handleToolControls('ac-mainsvg-view',"panstart",e,false)} onMouseMove={e => this.handleToolControls('ac-mainsvg-view',"pan",e)} 
                                        width={(!this.state.aczoompanactive?this.state.aviewWidth:"100%")} height={(!this.state.aczoompanactive?this.state.aviewHeight:"350px")} 
                                        style={{ display:"block",margin:"auto", outline: (!this.state.aczoompanactive?(this.props.dmode?'#2CC990':'#5128a0')+' solid 3px':'none') }} >

                                            {this.state.aczoompanactive?<rect x={0} y={0} width={this.state.aviewWidth} height={this.state.aviewHeight} strokeWidth={4} fill="none" style={{ stroke: (this.props.dmode?'#2CC990':'#5128a0') }} />:<></>}

                                            {(this.state.activeViewObj&&this.state.activeViewObj.planogramShelfDto?this.state.activeViewObj.planogramShelfDto.map((shelf, i) => <g key={i}>
                                                <rect className="sftrect" width={shelf.drawWidth} height={shelf.drawHeight} x={shelf.x} y={shelf.y} style={{ strokeWidth: 1, stroke: (this.props.dmode?'#2CC990':'#5128a0'), fill: 'transparent', zIndex: -1 }} id={i} />
                                                <rect width={shelf.drawWidth} height={shelf.drawGap} x={shelf.x} y={shelf.y+(shelf.drawHeight?shelf.drawHeight:0)} style={{ strokeWidth: 1, stroke: (this.props.dmode?'#2CC990':'#5128a0'), fill: (this.props.dmode?'#2CC990':'#5128a0'), zIndex: -1 }}></rect>
                                                {(shelf.planogramProduct?shelf.planogramProduct.map((rect, x) => {
                                                    return <g key={x}>{(rect.isDelete === false?rect.productBlock.map((subrect, z) => {
                                                        return (subrect.isDelete === false?subrect.productLocations.map((locrect, n) => {

                                                            var filterlistcolor = (this.state.filterRevenueList&&this.state.filterRevenueList.length>0?(this.state.filterRevenueList.filter(l => l.id === rect.productInfo.id).length>0):false);

                                                            return (locrect.isDelete === false?<image pointerEvents="all" preserveAspectRatio="none" x={locrect.x} y={locrect.y} width={locrect.drawWidth} height={locrect.drawHeight} href={rect.productInfo.imageUrl} key={n} style={{outlineColor:(filterlistcolor?"#77db61":"#ccc")}} onMouseDown={(e)=>this.viewProdOnClock(e,rect.productInfo)}/>:<rect key={n} />);

                                                        }):<rect key={z} />);
                                                    }):<></>)}</g>;
                                                }) : (<></>))}
                                            </g>) : (<></>))}

                                            {(this.state.acactivetool === "pantool" && this.state.aczoompanactive && this.state.acstartpan)?<rect x={0} y={0}  width={this.state.aviewWidth} height={this.state.aviewHeight} fill={(this.props.dmode?'#2CC990':'#5128a0')} fillOpacity={0.15} />:<></>}
                                        </svg>
                                        {/* <Col className="col-centered " style={{width:((this.state.viewWidth+6)+"px"),height:"15px", borderLeft: ('3px solid '+(this.props.dmode?'#2CC990':'#5128a0')), borderRight: ('3px solid '+(this.props.dmode?'#2CC990':'#5128a0'))}}></Col> */}
                                        </>}

                                    </>:<></>}
                                </div>
                            </Col>
                        </Col>

                        <Col xs={12} lg={8} className={((this.state.isActiveMode && !this.state.isAllowChangeField)?"":" d-none")}>
                            <Col xs={12} className={"contentview-main newpg-content "+(this.state.isActiveMode?"active":"")} style={{ height: (this.state.viewHeight + (this.state.isActiveMode?110:140))}}>
                                <h2 className="text-center" onClick={() => this.handleViewChangeField()}><PlusCircleIcon size={39}/><br/> {this.props.t('newplanogram')}</h2>
                            </Col>
                        </Col>

                        <Col xs={12} lg={8} className={"draftedit-view "+(this.state.isActiveMode?"active ":"")+((!this.state.isActiveMode && this.state.isShowProdView)?(this.props.isRTL === "rtl"?" mdiv-floatleft":" offset-lg-4"):this.state.isActiveMode?"":" col-centered")+((!this.state.isActiveMode || this.state.isAllowChangeField)?"":" d-none")}>
                            <Col xs={12} className="contentview-main">
                                
                                <ul className={"newpgtop-btnlist list-inline "+(this.props.isRTL === "rtl"?"float-left":"float-right")} style={{marginTop:"-8px"}}>
                                    {this.state.warningProdList && this.state.warningProdList.length > 0?<li className='list-inline-item deptprod-warnings'>
                                        <Button variant="outline-warning" className="btn-with-icon" onClick={this.toggleWarningSidebar} size="sm" active={this.state.showWarningSidebar} title={this.props.t("WARN")}><StopIcon size={14}/> <span>{this.props.t("WARN")}</span></Button>
                                    </li>:<></>}

                                    <li className={"list-inline-item tool-controls-list"+(this.state.isshowedit?" fieldeditdisable":"")}><Button variant="outline-dark" onClick={() => this.handleToolControls('mainsvg-view',"zoomin")} className={"btn-with-icon "} size="sm" title={this.props.t("ZOOM_IN")}><FeatherIcon icon="zoom-in" size={14}/></Button></li>
                                    <li className={"list-inline-item tool-controls-list"+(this.state.isshowedit?" fieldeditdisable":"")}><Button variant="outline-dark" onClick={() => this.handleToolControls('mainsvg-view',"zoomout")} className={"btn-with-icon "} size="sm" title={this.props.t("ZOOM_OUT")}><FeatherIcon icon="zoom-out" size={14}/></Button></li>
                                    <li className={"list-inline-item tool-controls-list"+(this.state.isshowedit?" fieldeditdisable":"")} style={{marginRight:"10px"}}><Button variant="outline-dark" onClick={() => this.handleToolControls('mainsvg-view',"zoomreset")} className={"btn-with-icon "} size="sm" title={this.props.t("resetZoom")}><FeatherIcon icon="x-circle" size={14}/></Button></li>
                                    <li className={"list-inline-item tool-controls-list"+(this.state.isshowedit?" fieldeditdisable":"")} style={{marginRight:"15px"}}><Button variant="outline-dark" onClick={() => this.handleToolControls('mainsvg-view',"pantool")} className={"btn-with-icon "+(this.state.activetool === "pantool"?"active":"")} size="sm" title={this.props.t("ZoomPan")}><FeatherIcon icon="move" size={14}/></Button></li>
                                    
                                    {this.state.isDisableEdit === false && this.state.fieldStatus !== "INACTIVE" && this.state.isloadedfielddet?<>
                                        {this.state.saveObj&&this.state.saveObj.rightSidePlanogramFieldDto&&Object.keys(this.state.saveObj.rightSidePlanogramFieldDto).length>0?<li className={"list-inline-item "+(this.state.zoompanactive?"disable-action":"")}><Button variant={"outline-info"} className="btn-with-icon" size="sm" active={this.state.allowovrflwprod} onClick={this.handleAllowOverflow} style={{marginRight:"5px"}}>{this.props.t('ALLOW_OVERLAP')}</Button></li>:<></>}
                                        <li className={"list-inline-item "+(this.state.isselectprodblock?"":"d-none")}><Button variant={this.state.isblockmove?"outline-danger":"outline-info"} className="btn-with-icon selectblock-btn" size="sm" onClick={this.selectAllBlock} style={{marginRight:"5px"}}><DiffAddedIcon size={12}/> <span>{this.state.isblockmove?this.props.t('btnnames.deselectblock'):this.props.t('btnnames.selectblock')}</span></Button></li>
                                        <li className={"list-inline-item "+(this.state.contxtmenu&&this.state.contxtmenu.isexpand?"":"d-none")}><Button variant="outline-warning" className="btn-with-icon" size="sm" onClick={this.removeExpandOpts} style={{marginRight:"5px"}}><XIcon size={12}/> {this.props.t('expand')}</Button></li>
                                        {((!this.state.isActiveMode || this.state.isAllowChangeField)?<>
                                            <li className={"list-inline-item "}><Button variant="outline-danger" className="btn-with-icon" size="sm" onClick={() => this.deleteAllProds(this.state.saveObj)} disabled={(this.state.saveObj&&this.state.saveObj.planogramShelfDto&&this.state.saveObj.planogramShelfDto.length>0)?false:true} style={{marginRight:"15px"}}><TrashIcon size={12}/> {this.props.t('btnnames.all')}</Button></li>
                                            <li className={"list-inline-item "}><Button variant="outline-dark" className="btn-with-icon" size="sm" onClick={this.fieldHistoryUndo} disabled={this.state.fieldHistory&&this.state.fieldHistory.past&&this.state.fieldHistory.past.length>0?false:true}><FeatherIcon icon="corner-up-left" size={14}/></Button></li>
                                            <li className={"list-inline-item "}><Button variant="outline-dark" className="btn-with-icon" size="sm" onClick={this.fieldHistoryRedo} disabled={this.state.fieldHistory&&this.state.fieldHistory.future&&this.state.fieldHistory.future.length>0?false:true}><FeatherIcon icon="corner-up-right" size={14}/></Button></li>
                                        </>:<></>)}
                                    </>:<></>}
                                </ul>
                                <h5>{this.props.t('newplanogram')}</h5>

                                {this.state.selectedlocobj?<Badge bg="secondary" className="overflowbadge-view" onClick={() => this.toggleRotateProd(this.state.selectedlocobj,false)}>{this.props.t("rotation")}: {this.state.selectedlocobj.productRotation?this.props.t(this.state.selectedlocobj.productRotation):this.props.t("default")}</Badge>:<></>}
                                {!this.state.isloadedfielddet?<Col className="text-center" style={{position:"absolute",top:"41%",left:"49%"}}><img src={loadinggif} style={{height:"20px"}} alt="field loading gif"/></Col>:<></>}


                                <Row style={{width:"100%",margin:"0px"}}>
                                    <Col xs={12} lg={7} className={"NDUrowStructuredraw"+(this.state.contxtmenu&&this.state.contxtmenu.isexpand?" xpand":"")} dir="ltr" ref={this.displaydiv} style={{minHeight:"415px",padding:"35px 35px",overflow:"hidden"}}>
                                        {((this.props.istesting || (!this.props.istesting && this.dheight > 0)) && this.state.isloadedfielddet) &&<>
                                        
                                        {!this.state.zoompanactive?<>
                                            <div className="measure-line vertical" dir="ltr" style={{width:this.state.viewWidth+3}}>
                                                <div className="dot-txt">{this.dotTxtShow("masterFieldWidth",1)}</div>
                                                <div className="dot-txt" style={{marginLeft:((this.state.viewWidth / 2) - 20),marginTop:"-15px"}}>{this.dotTxtShow("masterFieldWidth",2)}</div>
                                                <div className="dot-txt" style={{marginLeft:(this.state.viewWidth - 40),marginTop:"-15px"}}>{this.dotTxtShow("masterFieldWidth",3)}</div>
                                                <div className="dots"></div>
                                                <div className="dots" style={{marginLeft:(this.state.viewWidth / 2),marginTop:"-4px"}}></div>
                                                <div className="dots" style={{marginLeft:(this.state.viewWidth),marginTop:"-4px"}}></div>
                                            </div>
                                            <div className="measure-line horizontal" dir="ltr" style={{height:this.state.viewHeight+3,marginLeft:(((this.state.divWidth - this.state.viewWidth) / 2) - 22 )}}>
                                                <div className="dot-txt" style={{marginTop:(20)}}>{this.dotTxtShow("masterFieldHeight",1)}</div>
                                                <div className="dot-txt" style={{marginTop:((this.state.viewHeight / 2) - 2)}}>{this.dotTxtShow("masterFieldHeight",2)}</div>
                                                <div className="dot-txt" style={{marginTop:(this.state.viewHeight - 32)}}>{this.dotTxtShow("masterFieldHeight",3)}</div>
                                                <div className="dots"></div>
                                                <div className="dots" style={{marginTop:(this.state.viewHeight / 2)}}></div>
                                                <div className="dots" style={{marginTop:(this.state.viewHeight - 5)}}></div>
                                            </div>
                                        </>:<></>}

                                        {this.state.allowovrflwprod?<>
                                        {this.state.saveObj&&this.state.saveObj.rightSidePlanogramFieldDto?<>
                                        <div className="overlap-gradiant" style={{position:"absolute",marginLeft:(((this.state.divWidth + this.state.viewWidth) / 2) + 45),width:"35px",height:(this.state.saveObj.rightSidePlanogramFieldDto.drawHeight+10),marginTop:(this.state.viewHeight>this.state.saveObj.rightSidePlanogramFieldDto.drawHeight?(this.state.viewHeight-this.state.saveObj.rightSidePlanogramFieldDto.drawHeight-5)+"px":this.state.viewHeight<this.state.saveObj.rightSidePlanogramFieldDto.drawHeight?"-"+(this.state.saveObj.rightSidePlanogramFieldDto.drawHeight-this.state.viewHeight+5)+"px":"-5px"),zIndex:"2"}}></div>
                                        <svg width={80} height={this.state.saveObj.rightSidePlanogramFieldDto.drawHeight} style={{position:"absolute",marginLeft:(((this.state.divWidth + this.state.viewWidth) / 2) + -5 ),
                                        marginTop:(this.state.viewHeight-this.state.saveObj.rightSidePlanogramFieldDto.drawHeight)+"px",opacity:"0.6", outline: (!this.state.zoompanactive?(this.props.dmode?'#2CC990':'#5128a0')+' solid 3px':'none')}}>

                                            {this.state.zoompanactive?<rect x={0} y={0} width={80} height={this.state.saveObj.rightSidePlanogramFieldDto.drawHeight} strokeWidth={4} fill="none" style={{ stroke: (this.props.dmode?'#2CC990':'#5128a0') }} />:<></>}

                                            {(this.state.saveObj&&this.state.saveObj.rightSidePlanogramFieldDto&&this.state.saveObj.rightSidePlanogramFieldDto.planogramShelfDto?this.state.saveObj.rightSidePlanogramFieldDto.planogramShelfDto.map((shelf, i) => <g key={i} className={"shelve-"+shelf.id}>
                                                {shelf.isDelete === false?<>
                                                    <rect width={shelf.drawWidth} height={shelf.drawHeight} x={shelf.x} y={shelf.y} style={{ strokeWidth: 1, stroke: (this.props.dmode?'#2CC990':'#5128a0'), fill: (shelf.overlappingAllow?'transparent':'#dc3545'), zIndex: -1 }} />
                                                    <rect width={shelf.drawWidth} height={shelf.drawGap} x={shelf.x} y={shelf.y+(shelf.drawHeight?shelf.drawHeight:0)} style={{ strokeWidth: 1, stroke: (this.props.dmode?'#2CC990':'#5128a0'), fill: (this.props.dmode?'#2CC990':'#5128a0'), zIndex: -1 }}></rect>
                                                </>:<></>}
                                            </g>) : (<></>))}

                                        </svg></>:<></>}</>:<></>}

                                        {this.state.allowovrflwprod?<>
                                        {this.state.saveObj&&this.state.saveObj.planogramShelfDto?<>
                                        <svg width={80} height={this.state.viewHeight} style={{position:"absolute",marginLeft:(((this.state.divWidth + this.state.viewWidth) / 2) + -5 ),opacity:"0.6"}}>
                                            
                                            {(this.state.saveObj&&this.state.saveObj.planogramShelfDto?this.state.saveObj.planogramShelfDto.map((shelf, i) => <g key={i}>
                                                {shelf.isDelete === false?<>
                                                    {(shelf.planogramProduct?shelf.planogramProduct.map((rect, x) => {
                                                        return <g key={x}>{(rect.isDelete === false?rect.productBlock.map((subrect, z) => {
                                                            return (subrect.isDelete === false?subrect.productLocations.map((locrect, n) => {
                                                                return (locrect.isDelete === false && locrect.overLappingDto && Object.keys(locrect.overLappingDto).length > 0?<g key={n}>
                                                                  {!locrect.overLappingDto.isDelete?<image pointerEvents="all" preserveAspectRatio="none" x={(locrect.overLappingDto.x - 6)} y={locrect.overLappingDto.y} width={locrect.overLappingDto.drawWidth} height={locrect.overLappingDto.drawHeight} href={rect.productInfo.imageUrl} key={n} draggable={false} style={{outlineColor:"#ccc"}} />:<></>}
                                                                </g>:<rect key={n} />);
                                                            }):<rect key={z} />);
                                                        }):<></>)}</g>;
                                                    }) : (<></>))}
                                                </>:<></>}
                                            </g>) : (<></>))}

                                        </svg></>:<></>}</>:<></>}

                                        <svg id="mainsvg-view" className={(this.state.zoompanactive?"svgzoom-action":"")} viewBox={'0 0 '+this.state.viewWidth+' '+this.state.viewHeight} width={(!this.state.zoompanactive?this.state.viewWidth:"100%")} height={(!this.state.zoompanactive?this.state.viewHeight:"100%")} onMouseDown={e => this.handleToolControls('mainsvg-view',"panstart",e,true)} onMouseUp={e => this.handleToolControls('mainsvg-view',"panstart",e,false)} onMouseMove={e => this.handleToolControls('mainsvg-view',"pan",e)} onMouseOver={() => this.handlePropHighlight()} style={{ display:"block",margin:"auto", outline: (!this.state.zoompanactive?(this.props.dmode?'#2CC990':'#5128a0')+' solid 3px':'none') }}  ref={(r) => this["mainsvg"] = r} >

                                            <rect x={0} y={0} width={this.state.viewWidth} height={this.state.viewHeight} strokeWidth={4} fill="none" style={{ stroke: (this.props.dmode?'#2CC990':'#5128a0') }} />

                                            {(this.state.saveObj&&this.state.saveObj.planogramShelfDto?this.state.saveObj.planogramShelfDto.map((shelf, i) => <g key={i} className={"shelve-"+shelf.id}>
                                                {shelf.isDelete === false?<>
                                                    {(shelf.overLappingDto?shelf.overLappingDto.map((rect, x) => {
                                                        return <g key={x}><image pointerEvents="all" preserveAspectRatio="none" href={rect.productDto.imageUrl} x={rect.x} y={rect.y} width={rect.drawWidth} height={rect.drawHeight} style={{opacity:"0.4"}} />
                                                        <rect x={rect.x} y={rect.y} width={rect.drawWidth} height={rect.drawHeight} fill="#B8B5FF" fillOpacity="0.5"></rect></g>;
                                                    }):<></>)}

                                                    <rect className="sftrect" width={shelf.drawWidth} height={shelf.drawHeight} x={shelf.x} y={shelf.y} style={{ strokeWidth: 1, stroke: (this.props.dmode?'#2CC990':'#5128a0'), fill: 'transparent', zIndex: -1 }} id={i} ref={(r) => this[i] = r}
                                                    onDragOver={(e) => this.dragEnd(e, shelf, this[i])} onMouseOut={(e) => this.dragClear(e, shelf, this[i])}
                                                    onDrop={(e) => this.droppedNew(e, shelf, this[i], i, false)}
                                                    onClick={(e) => this.expandProdCheck(e,shelf,this[i],i)} />
                                                    <rect width={shelf.drawWidth} height={shelf.drawGap} x={shelf.x} y={shelf.y+(shelf.drawHeight?shelf.drawHeight:0)} style={{ strokeWidth: 1, stroke: (this.props.dmode?'#2CC990':'#5128a0'), fill: (this.props.dmode?'#2CC990':'#5128a0'), zIndex: -1 }}></rect>

                                                    {(shelf.planogramProduct?shelf.planogramProduct.map((rect, x) => {
                                                        return <g key={x}>{(rect.isDelete === false?rect.productBlock.map((subrect, z) => {
                                                            return (subrect.isDelete === false?subrect.productLocations.map((locrect, n) => {
                                                                var cintrlprod = this.state.currentInternalDraggableProd;
                                                                var cblkobj = (this.state.isblockmove?this.state.currentSelectedBlock:null);
                                                                var cintrlprodloc = (cintrlprod && Object.keys(cintrlprod).length > 0 && cintrlprod.prod?cintrlprod.prod.productBlock[cintrlprod.blockidx].productLocations[cintrlprod.locidx]:null);

                                                                var cblkcolor = (cblkobj && Object.keys(cblkobj).length > 0 && cblkobj.id === subrect.id?true:false);
                                                                var cimgcolor = (cintrlprod && Object.keys(cintrlprod).length > 0 && (locrect.id?locrect.id:"-") === (cintrlprodloc && cintrlprodloc.id !== undefined?cintrlprodloc.id:""));

                                                                var chightlightobj = this.state.propshowhighlight;

                                                                //var overLappingWidth = (locrect.overLappingDto?locrect.overLappingDto.crossingWidth:locrect.drawWidth);

                                                                return (locrect.isDelete === false?<g key={n}>
                                                                    {(cblkcolor || cimgcolor)?<rect x={locrect.x} y={locrect.y} width={locrect.drawWidth} height={locrect.drawHeight} fill={cblkcolor?"#28a745":"#dc3545"} />:<></>}
                                                                  <image pointerEvents="all" preserveAspectRatio="none" x={locrect.x} y={locrect.y} width={locrect.drawWidth} height={locrect.drawHeight} href={rect.productInfo.imageUrl} key={n} ref={(r) => this["LR"+subrect.id+locrect.id] = r} draggable={false}
                                                                onMouseDown={(e) => this.SingleProductDragStart(e, rect, this["LR"+subrect.id+locrect.id], i, x, z, n, locrect)}
                                                                style={{outlineColor:(cblkcolor?"#28a745":cimgcolor?"#dc3545":"#ccc")}} opacity={(cblkcolor || cimgcolor)?0.7:1} />
                                                                {chightlightobj.isshow&&chightlightobj.itemid>0&&chightlightobj.itemid===rect.productInfo.id?<rect x={locrect.x} y={locrect.y} width={locrect.drawWidth} height={locrect.drawHeight} fill={chightlightobj.type===1?"#dc3545":"#77db61"} fillOpacity="0.6"/>:<></>}
                                                                </g>:<rect key={n} />);

                                                            }):<rect key={z} />);
                                                        }):<></>)}</g>;
                                                    }) : (<></>))}
                                                </>:<></>}
                                            </g>) : (<></>))}

                                            <rect x={(this.state.viewWidth + 2)} y={0} width={this.state.viewWidth} height={this.state.viewHeight} fill="#efefef" />

                                            {(this.state.activetool === "pantool" && this.state.zoompanactive && this.state.startpan)?<rect x={0} y={0}  width={this.state.viewWidth} height={this.state.viewHeight} fill={(this.props.dmode?'#2CC990':'#5128a0')} fillOpacity={0.15} />:<></>}
                                        </svg>
                                        
                                        </>}

                                    </Col>
                                    {this.state.isloadedfielddet&&this.state.saveObj&&this.state.saveObj.planogramShelfDto?
                                    <Col xs={12} lg={5} style={(this.props.isRTL==="rtl"?{marginTop:"5px",paddingRight:"45px"}:{marginTop:"5px",paddingLeft:"45px"})}>
                                        {this.state.isActiveMode?<LeftRightToggle saveobj={this.state.saveObj} size="small" t={this.props.t} isRTL={this.props.isRTL} handleChangeLeftRightField={this.handleChangeLeftRightField} />:<></>}

                                        {this.state.allowovrflwprod && this.state.saveObj.rightSidePlanogramFieldDto && this.state.alloweditoverflwmargin?<OverlapSaftyView displayratio={this.state.displayRatio} displayuom={this.state.displayUOM} trans={this.props.t} saveobj={this.state.saveObj} handlechangesafty={this.handleChangeOverlapSafty} />:<></>}
                                      <Tab.Container transition={false} defaultActiveKey={this.state.proposeselecttab} onSelect={this.handleProposeTabs}>
                                        {this.state.isproposeavailable?<Col>
                                          <Nav variant="pills" className="flex-column" style={{display:"block"}}>
                                            <Nav.Item><Nav.Link eventKey="key-1">{this.props.t('product')}</Nav.Link></Nav.Item>
                                            <Nav.Item><Nav.Link eventKey="key-2" ref={this.propviewref}>{this.props.t('btnnames.propose')}</Nav.Link></Nav.Item>
                                          </Nav>
                                        </Col>:<></>}
                                        <Col>
                                          <Tab.Content className={(this.state.zoompanactive?"disable-action":"")}>
                                            <Tab.Pane eventKey="key-1">
                                              <h4>{this.props.t('newproducts')}
                                              {(this.state.isDisableEdit === false && (this.state.fieldStatus !== "INACTIVE" && this.state.fieldStatus !== "MERGE" && this.state.fieldStatus !== "CONFIRMED") && (!this.state.isActiveMode || this.state.isAllowChangeField)?<><Button variant="warning" className="float-right" onClick={this.toggleProdView} style={{padding:"1px 8px 5px",fontWeight:"600",fontSize:"14px",marginRight:"0px",marginTop:"-5px",background:"#ed317b",border:"none",color:"#fff",borderRadius:"50%"}}><PlusIcon size={12}/></Button></>:<></>)}</h4>
                                              <ul className="list-inline pgview-addeditems">
                                                  {this.state.existnewprodlist.map((npitem, npidx) => {
                                                      return <React.Fragment key={npidx}>{npitem.existviewtype===2?<li className="list-inline-item" style={{marginRight:"2px",marginBottom:"4px"}}><div className="existnew-subview" onClick={(e)=>this.handleProductImgPreview(npitem.productInfo,true)}>
                                                          <div className="circleview-content">{npitem.productFacingQty}</div>
                                                          <img src={npitem.productInfo.imageUrl} className="img-fluid" style={{height:"25px"}} title={(npitem.productInfo.brandName&&npitem.productInfo.brandName!==""&&npitem.productInfo.brandName!=="-"?(npitem.productInfo.brandName+" "):(this.props.t("notavailable")+" "))+npitem.productInfo.productName} alt="new product" onMouseDown={(e) => {this.drawRectCanvas(npitem.productInfo,-1)}} onDragStart={(e) => this.dragStart(e, npitem.productInfo)}/>
                                                      </div></li>:<></>}</React.Fragment>;
                                                  })}
                                              </ul>
                                              <h4>{this.props.t('existingproducts')}</h4>
                                              <ul className="list-inline pgview-addeditems">
                                                  {this.state.existnewprodlist.map((npitem, npidx) => {
                                                      
                                                      return <React.Fragment key={npidx}>{npitem.existviewtype===1?<li className="list-inline-item" style={{marginRight:"2px",marginBottom:"4px"}}><div className="existnew-subview" onClick={(e)=>this.handleProductImgPreview(npitem.productInfo,true)}>
                                                          <div className="circleview-content">{npitem.productFacingQty}</div>
                                                          <img src={npitem.productInfo.imageUrl} className="img-fluid" style={{height:"25px"}} title={(npitem.productInfo.brandName&&npitem.productInfo.brandName!==""&&npitem.productInfo.brandName!=="-"?((npitem.productInfo.barcode ? (npitem.productInfo.barcode + " - "):"") + npitem.productInfo.brandName+" "):(this.props.t("notavailable")+" "))+npitem.productInfo.productName} alt="new product" onMouseDown={(e) => {this.drawRectCanvas(npitem.productInfo,-1)}} onDragStart={(e) => this.dragStart(e, npitem.productInfo)}/>
                                                      </div></li>:<></>}</React.Fragment>;
                                                  })}
                                              </ul>
                                            </Tab.Pane>
                                            <Tab.Pane eventKey="key-2">
                                              {this.state.showproposelist?<ViewProposeList t={this.props.t} isRTL={this.props.isRTL} handleprophighlight={this.handlePropHighlight} handleEscapeClear={this.handleEscapeClear} drawRectCanvas={this.drawRectCanvas} dragStart={this.dragStart} showproposeview={this.state.showproposelist} copytoclipboard={this.copyToClipboard} loadedproposelist={this.state.loadedProposeList} viewproposelist={this.handleViewProposeList} handleProductImgPreview={this.handleProductImgPreview} />:<></>}
                                            </Tab.Pane>
                                          </Tab.Content>
                                          <Row>
                                              <Col xs={12} lg={7} className={"improve-view subview-content "+(this.state.isActiveMode?"":"d-none")} style={{marginBottom:"8px",position:"relative",borderRadius:"4px"}}>
                                                  <Col className="round-content" style={{width:"90px",height:"90px",fontSize:"15px",textAlign:"center",padding:"6px",display:"block",margin:"auto"}}>
                                                      <ImprovementProgress value={(this.state.rploadedrevenue&&this.state.rploadedrevenue.newProfit?(parseFloat(this.state.rploadedrevenue.newProfit)):0)} dmode={this.props.dmode}/>
                                                  </Col>
                                                  <h5 style={{fontSize: "16px",marginTop:"5px",marginBottom:"5px",fontWeight:"700",textAlign:"center",border:"none"}}>{this.props.t('improvement')}</h5>
                                              </Col>

                                              <Col xs={12} lg={(this.state.isActiveMode?5:12)} className="btn-list">
                                                  {this.state.fieldStatus !== "INACTIVE"?<>
                                                      <Row>
                                                          <Col xs={12} className={this.state.isDisableEdit === true?'plg-disable':''} lg={(this.state.isActiveMode?12:6)} style={{padding:"0px",paddingRight:"5px"}}>
                                                              <Button variant="outline-secondary" type="button" style={{width:"100%",borderRadius:"15px",fontSize:"12px"}} onClick={this.handleResetNewPgram}>{this.props.t('btnnames.reset')}</Button>
                                                          </Col>
                                                          <Col xs={12} lg={(this.state.isActiveMode?12:6)} className="d-none" style={{padding:"0px",paddingRight:"5px"}}>
                                                              <Button variant="outline-danger" type="button" style={{width:"100%",borderRadius:"15px",fontSize:"12px"}} onClick={this.handleViewTestAI}>{this.props.t('btnnames.testai')}</Button>
                                                          </Col>
                                                          {this.state.isDisableEdit === false && this.state.isActiveMode && !this.state.showproposelist && this.state.fieldStatus !== "MERGE" && this.state.fieldStatus !== "CONFIRMED"?<Col xs={12} lg={(this.state.isActiveMode?12:6)} style={{padding:"0px",paddingRight:"5px"}} disabled={this.state.isProposeDataLoading?true:false}>
                                                            <Button variant="outline-primary" type="button" style={{width:"100%",borderRadius:"15px",fontSize:"12px"}} onClick={() => this.handleViewProposeList(true,false)}>
                                                                  {(this.state.isProposeDataLoading?<img src={loadinggif} style={{height:"18px"}} alt="propose loading"/>:this.props.t('btnnames.propose'))}
                                                            </Button>
                                                          </Col>:<></>}
                                                          {this.state.existnewprodlist && this.state.existnewprodlist.length > 0?
                                                          <Col xs={12} lg={(this.state.isActiveMode?12:6)} style={{padding:"0px",paddingRight:"5px"}}>
                                                              <ExportCSV exportData={this.state.existnewprodlist} t={this.props.t} fileName={(this.state.saveObj?(this.state.saveObj.department&&this.state.saveObj.department.name?(this.state.saveObj.department.name.toLowerCase().replace(/ /g, '_')):"")+(this.state.saveObj.noInFloorLayout > 0?("_"+this.state.saveObj.noInFloorLayout):""):"display_Unit")+"_export_products_list"}/>
                                                          </Col>:<></>}
                                                          {this.state.isDisableEdit === false && (this.state.fieldStatus !== "CONFIRMED" && this.state.fieldStatus !== "MERGE")?<Col xs={12} lg={(this.state.isActiveMode?12:6)} style={{padding:"0px",paddingRight:"5px"}}>
                                                              <Button variant="success" type="button" style={{width:"100%",borderRadius:"15px",fontSize:"12px"}} onClick={this.handleDunitObj}>{this.props.t('btnnames.save')}</Button>
                                                          </Col>:<></>}
                                                      </Row>
                                                  </>:<></>}
                                              </Col>
                                          </Row>
                                        </Col>
                                      </Tab.Container>
                                    </Col>:<></>}
                                </Row>
                            </Col>
                        </Col>
                    </Row>

                    {this.state.isActiveMode?<ViewRevenueDetails isRTL={this.props.isRTL} copyToClipboard={this.copyToClipboard} dmode={this.props.dmode} isrpdetailsloading={this.state.isrpdetailsloading} isrpoverviewloading={this.state.isrpoverviewloading} handletablesort={this.handleTableSort} handledeletefilterlist={this.handleDeleteFilteredList} filterrevlist={this.state.filterRevenueList} exprodlist={this.state.existnewprodlist} viewobj={this.state.viewObj} activeViewObj={this.state.activeViewObj} revobj={this.state.rploadedrevenue} ovrobj={this.state.rploadedoverview}/>:<></>}

                    {this.state.isenablefieldedit?<FieldDetailsEdit recheckoverlap={this.recheckOverlapField} iszoomactive={this.state.aczoompanactive} isRTL={this.props.isRTL} isshowedit={this.state.isshowedit} toggleeditview={this.toggleEditView} isenablefieldedit={this.state.isenablefieldedit} saveObj={this.state.saveObj} bkpSaveObj={this.state.bkpFieldEditObj} handlefieldedit={this.handleFieldEditChanges}/>:<></>}

                    {/* {this.state.showTestAiview?<ViewAITest isRTL={this.props.isRTL} t={this.props.t} showview={this.state.showTestAiview} checkallowtoadd={this.checkAllowToAdd} saveobj={this.state.saveObj} prodlist={this.props.prodState&&this.props.prodState.prodList?this.props.prodState.prodList:[]} handleview={() => this.handleViewTestAI()}/>:<></>} */}

                    {this.state.showbaseimageview?<ViewBaseImage isRTL={this.props.isRTL} showbaseimageview={this.state.showbaseimageview} baseaiimage={this.state.baseimagepath} viewbaseimage={this.handleViewBaseImage}/>:<></>}

                    {/* <DebugLogView showdebugview={this.state.showdebuglog} debuglist={this.state.debugLogList} toggledebugview={this.toggledebugview} /> */}

                    <Modal show={this.state.view.showDeleteModal} animation={false} onHide={this.handleToggleDelete} dir={this.props.isRTL}>
                        <Modal.Header>
                            <Modal.Title>{this.props.t('deleteproduct')}</Modal.Title>
                        </Modal.Header>
                        <Modal.Body>
                            <p>{this.props.t('suretodelete')} <b>{this.state.view.currentDeleteProd && this.state.view.currentDeleteProd.productInfo? ((this.state.view.currentDeleteProd.productInfo.brandName&&this.state.view.currentDeleteProd.productInfo.brandName!==""&&this.state.view.currentDeleteProd.productInfo.brandName!=="-"?(this.state.view.currentDeleteProd.productInfo.brandName+" "):(this.props.t("notavailable")+" "))+
                            this.state.view.currentDeleteProd.productInfo.productName) : "-"}</b>.</p>
                        </Modal.Body>
                        <Modal.Footer style={{padding:"5px"}}>
                            <Button variant="danger" size="sm" onClick={this.handleDelete}>{this.props.t('btnnames.delete')}</Button>
                            <Button variant="secondary" size="sm" onClick={this.handleToggleDelete}>{this.props.t('btnnames.close')}</Button>
                        </Modal.Footer>
                    </Modal>

                    <Modal show={this.state.savemodalview} animation={false} onHide={this.handleToggleSaveModal} className="submitview-modal">
                        <Modal.Body className="text-center">
                            <span className={this.props.isRTL==="rtl"?"float-left":"float-right"} onClick={() => this.handleToggleSaveModal()}><XIcon size={28} /></span>
                            <img src={savemodalimg} className="img-fluid" alt="submit save modal"/>
                            <h4>{this.state.savemodalmsg}</h4>
                            <Button variant="warning" size="sm" onClick={() => this.props.history.push("/planograms/details")}>{this.props.t('backtomngmt')}</Button>
                        </Modal.Body>
                    </Modal>

                    {this.state.showSingleProdWarning?<ProdWarningModal isRTL={this.props.isRTL} t={this.props.t} showSingleProdWarning={this.state.showSingleProdWarning} warningProdItem={this.state.warningProdItem} copyToClipboard={this.copyToClipboard} handleProductImgPreview={this.handleProductImgPreview} toggleSingleProd={this.toggleSingleProd} />:<></>}

                    {this.state.pemview?<ProdMDModal isRTL={this.props.isRTL} pemshow={this.state.pemview} pemobj={this.state.pemobj} saveobj={this.state.saveObj} handlepemview={this.handlePEMView} />:<></>}

                    {this.state.showrotateprod?<ProductRotate isRTL={this.props.isRTL} isshowrotateedit={this.state.isshowrotateedit} showrotateprod={this.state.showrotateprod} selectedrotateprod={this.state.selectedrotateprod} dmode={this.props.dmode} displayuom={this.state.displayUOM} viewrotateprod={this.toggleRotateProd} updaterotateprod={this.updateRotateProd} />:<></>}

                    <div style={{display:"none"}}>
                        <canvas ref={this.dragPreviewCanvas}></canvas>
                    </div>

                </Col>

                {this.state.isShowPreviewProd?<PreviewProduct isshow={this.state.isShowPreviewProd} prodobj={this.state.prodPreviewObj} togglePreviewModal={this.togglePreviewModal} />:<></>}
            </Col>

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

            {this.state.showPreviewImageModal===true ? 
                <PreviewImage 
                    productid={this.state.productId} 
                    loadfromback={true} 
                    imgurl={""} 
                    isshow={this.state.showPreviewImageModal} 
                    isRTL={this.props.isRTL} 
                    handlePreviewModal={this.handleProductImgPreview} />
                :<></>
            }

            <AcViewModal showmodal={this.state.savemodalshow} message={this.props.t('PLEASE_WAIT')} />
        </>);
    }
}

const mapDispatchToProps = dispatch => ({
    setFieldHistory: (payload) => dispatch(historyFieldAction(payload)),
    setFieldRecList: (payload) => dispatch(recprodsFieldAction(payload)),
    setPLanogramdetailsView: (payload) => dispatch(PDviewDataAction(payload)),
    setFieldOverlapAction: (payload) => dispatch(setFieldOverlapAction(payload)),
    setFieldView: (payload) => dispatch(viewFieldAction(payload)),
    setFieldIsNewDraftView: (payload) => dispatch(setFieldIsNewDraft(payload)),
});
export default withTranslation()(withRouter(connect(null,mapDispatchToProps)(PlanDunitComponent)));
