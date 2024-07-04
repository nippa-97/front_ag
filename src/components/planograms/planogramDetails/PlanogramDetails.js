import React, { Component } from 'react'
import { connect } from 'react-redux';
import { Breadcrumb, Col, Row, Form, Modal, Button, InputGroup, ButtonGroup, Image, Table, Badge, Dropdown, OverlayTrigger, Tooltip } from 'react-bootstrap'
import { Link, withRouter } from 'react-router-dom';
import QRCode from 'qrcode.react';
import { SearchIcon, XCircleFillIcon, ListUnorderedIcon, DiffAddedIcon, XIcon, PlusIcon, GearIcon, InboxIcon, FileSymlinkFileIcon, PencilIcon, VersionsIcon } from '@primer/octicons-react';
import * as d3 from "d3";
import { v4 as uuidv4 } from 'uuid';
import axios from 'axios';
// import swal from 'sweetalert';

import i18n from "../../../_translations/i18n";
import Select from 'react-select';

import { submitSets } from '../../UiComponents/SubmitSets';
import { submitCollection } from '../../../_services/submit.service';
import { emailvalidator } from '../../UiComponents/ValidateSets';
import { CalculateRatio, measureConverter, roundOffDecimal, stringtrim, planigoDiableRoles, checkIsInsideofBox, floorAspectRatioDrawBoxbaseonwidth, floorAspectRatioDrawBox, preventinputToString, countTextCharacter, maxInputLengthforEmail } from '../../../_services/common.service';
import { isRectCollide } from './PDcollide';
import { getcornersfor, } from './PDgetconers';
import { AcViewModal } from '../../UiComponents/AcImports'; //AcButton, 
import { alertService } from '../../../_services/alert.service';
import { viewFieldAction, PDviewDataAction, viewSetAction, setFieldIsNewDraft, setDepGridDates } from '../../../actions/planogram/planogram_action';
import { viewSetAction as viewDunitSetAction } from '../../../actions/dunit/dunit_action';
// import { AcInput, ValT } from '../../UiComponents/AcImports';
import shelfimage from '../../../assets/img/shelf.png'
import loadinggif from '../../../assets/img/loading-sm.gif'
import rotright from '../../../assets/img/rotationright.png'
import rotleft from '../../../assets/img/rotationleft.png'
import FeatherIcon from 'feather-icons-react';

import OverviewChanges from './OverviewChanges';
import NewFieldMdView from './NewFieldMdAdd';

import * as htmlToImage from 'html-to-image';
import { confirmAlert } from 'react-confirm-alert';
import { withTranslation } from 'react-i18next';
import ActiveplanogramLayout from './activeplanogramlayout/activeplanogramLayout';
import { handleZoomInOut, handlePanView } from '../planDisplayUnit/additionalcontents';
import { BulkQRModal, RandomQRGenerator, StoreCopyModel } from './BulkQRComps';
import { AisleRect } from './aisleD3Comps';

import './PlanogramDetails.scss';

import defaultshelfimg from '../../../assets/img/icons/racks.png';
import { TooltipWrapper } from '../../newMasterPlanogram/AddMethods';
import { HaveLeftFieldIcon, HaveRightFieldIcon } from '../../../assets/icons/icons';
import loader from '../../../assets/img/loading-sm.gif';

export const colourOptions = [
    { value: 'ocean', label: 'Ocean', color: '#00B8D9', isFixed: true },
    { value: 'blue', label: 'Blue', color: '#0052CC', isDisabled: true },
    { value: 'purple', label: 'Purple', color: '#5243AA' },
    { value: 'red', label: 'Red', color: '#FF5630', isFixed: true },
    { value: 'orange', label: 'Orange', color: '#FF8B00' },
    { value: 'yellow', label: 'Yellow', color: '#FFC400' },
    { value: 'green', label: 'Green', color: '#36B37E' },
    { value: 'forest', label: 'Forest', color: '#00875A' },
    { value: 'slate', label: 'Slate', color: '#253858' },
    { value: 'silver', label: 'Silver', color: '#666666' },
];
var btnrotaion = false;
var dragrotation = false;
export class PlanogramDetails extends Component {


    constructor() {
        super();
        this.displaydiv = React.createRef();
        this.svgfile = React.createRef();
        this.testcanvas = React.createRef();
        this.whitecontainer = React.createRef();
        this.img = {};

        this._tagSearchTimeout = null;
        
        this.state = {
            selectedIslepreview: null,
            selectedIsle: null,
            planoLock: true,
            changeinplano: false,
            activePlanoShow: false,
            activeplanogram: null,
            snap: false,
            Feildnoshow: 1,
            selectedarray: {}, planFloorObj: null,
            imageurl: "",
            imagebase: '',
            imgloading: false,
            loadingscreen: false,
            viewHeight: 0, viewWidth: 0,
            isselectedfloor: false,
            isedit: false,
            sobj: {},
            floorlist: [],
            DunitList: [],
            rects: [], editObjId: 0,
            QRobj: {}, QRisle: {}, isFieldSaved: true,
            drawratio: 1,
            prodClickX: 0,
            prodClickY: 0,
            currentDraggableProd: null,
            isShowProdView: false,
            isshowQRpanel: false,
            QRrackIMG: "",
            isListViewActive: "LIST",
            loadDunitList: [], recentDUnitList: [], filteredDUnitList: [], filterTypeTxt: "",
            loadedDeptList: [],
            OriloadedDeptList:[],
            isviewcmenu: false,
            contxtmenu: null, //svg contxt menu
            rotateStart: false,
            rotationAngel: 0,
            rotationstartx: 0,
            currentSelectedRef: null,
            prevrotation: 0,
            stobj: { tagName: "", type:"planogram", isReqPagination: false, startIndex: 0, maxResult: 10 },
            toridata: [], addedTags: [], newtag: { tagName: "", type:"planogram" }, tagModalType: 1,
            imgAllow: true,
            shareModalShow: false, qrShareObj: { email: "", imgpath: "" },
            DrawUOM: "",
            toUploadImages: null,
            loadedFnamenumbers: [],
            alreadyloadedFnamenumbers: [2], deleteSecureModal: false, deleteSecureTxt: "", isShowDeptChanges: false, dcChangesBaseid: 0,
            loadedFieldChangesList: [], fcmaxresults: 5, fcallcount: 0, fcfromdate: "", fctodate: "", resetFromActiveDate: "", issaledataloading: false,
            rotationobj: null,
            layoutVersionList: [], selectVersionList: [], selStoreId: 0, verStartIndex: 0, verMaxCount: 8, verTotalCount: 0, //layout version changes
            isShowNewField: false, //field md add changes
            //new tools
            zoompanactive: false, activetool: "default", startpan: false, zoomDrawX: 0,
            windowheight:0,
            svgzoomissingwidth:0,

            printRectList: [], isPrintAllQRs: {isall: false, dept: null}, //bulk print qr list
            showBulkPrintModal: false,
            showStoreCopyModel:false,
            regions:[],

            isDisableEdit: false, //disable edit for certain users
            isIsleSelected:false,
            IsleRects:[],
            aisleRotateObj: null,

            departmentlist:[],
            mapWindowHeight:0,
            fittowidth:false,

            isverloading: false,

            layoutObj: null,
            loadingTagView: false,
        }
    }

    componentDidMount() {
        let curdivheight = (this.whitecontainer.current?(this.whitecontainer.current.offsetHeight - 260):0);
            
        let signedobj = (this.props.signedobj && this.props.signedobj.signinDetails?this.props.signedobj.signinDetails:false);

        // let filterDates = (this.props.planogramState && this.props.planogramState.pgrmDepGrid ? this.props.planogramState.pgrmDepGrid : { fcfromdate: "", fctodate: "" });

        // console.log(filterDates)

        this.setState({
            windowheight: ((window.innerHeight-280) + 'px'),
            isDisableEdit: (signedobj?planigoDiableRoles(signedobj):false),
            mapWindowHeight: curdivheight,
        });
        // console.log(this.props.signedobj);
        this.loadSelectedVersionData();

        // console.log(this.svgfile.current);
        document.addEventListener("keydown", this.arrowKeyHandling, false);
        // if(!this.state.imgloading){
        //     console.log(this.svgfile);

        //     this.svgfile.current.style.border = "none"
        // }
        //console.log(this.state.rects.length);
        this.loadRegions();
    }
    componentWillUnmount = () => {
        document.removeEventListener("keydown", this.arrowKeyHandling, false);
    }

    loadRegions = () => {
        submitSets(submitCollection.getRegions, { filterOpt: "", isReqPagination: false }, true).then(res => {
            if(res.status){
                this.setState({ regions: res.extra });
            }
        });
    }


    //version onchange data update changes
    loadSelectedVersionData = () => {
        var cissavededit = (this.props.planogramState.PDplanogramDetails === null ? false : true)
        var cisedit = (this.props.planogramState.planogramDetails === null ? false : true);
        var passobj = (cissavededit ? this.props.planogramState.PDplanogramDetails : this.props.planogramState.planogramDetails);
        let showfnumber = sessionStorage.getItem('showfno') ? parseInt(sessionStorage.getItem('showfno')) : 1;
        var cselstore = (this.props.planogramState.pgramStore !== null ? this.props.planogramState.pgramStore : 0);

        this.setState({
            Feildnoshow: showfnumber,
            divWidth: this.displaydiv.current ? this.displaydiv.current.offsetWidth : 0,
            divHeight: this.displaydiv.current ? (this.displaydiv.current.offsetHeight) : 0,
            isedit: (cisedit || cissavededit) ? true : false,
            editObjId: (passobj && (cisedit || cissavededit) ? passobj.id : -1),
            isselectedfloor: (cisedit || cissavededit) ? true : false,
            addedTags: (passobj && passobj.tags ? passobj.tags : []),
            selStoreId: cselstore,
        }, () => {
            this.getFieldDepartments();
            this.getProductList();
            this.getnumberinFlayout();
            this.loadAlllayoutVersions(null, false);
        }
        )
        submitSets(submitCollection.searchFloors, { isReqPagination: false, withImageUrl: true, storeId: cselstore }, true).then(res => {
            this.setState({ floorlist: res.extra });
            // console.log(this.state.floorlist);
        });
        // submitSets(submitCollection.searchDisplayUnit, { isReqPagination: false, withImageUrl: true }, true).then(res => {
        //     this.setState({ DunitList: res.extra });
        //     console.log(this.state.DunitList);
        // });

        if (cisedit === true || cissavededit === true) {
            var csvid = passobj && passobj.id;
            this.getSinglePanogram(csvid);
            this.loadFieldChangesList(csvid, 0);


        }
    }

    defaultobj = () => {
        return { id: -1, layoutStatus: "DRAFT" };
    }

    getnumberinFlayout = () => {
        var genrateno = new Array(101);
        var loadnnme = [];
        for (var i = 1; i < genrateno.length; i++) {
            loadnnme.push(i)
        }
        this.setState({ loadedFnamenumbers: loadnnme }, () => {
            // console.log(this.state.loadedFnamenumbers);
        })
    }
    //
    getFieldDepartments = () => {
        var cdobj = { isReqPagination: false, isIgnoreHide: true };
        submitSets(submitCollection.searchDepatments, cdobj, true).then(res => {
            //console.log(res);
            if (res && res.status) {
                this.setState({ loadedDeptList: res.extra,OriloadedDeptList:res.extra });
            }
        });
    }
    //load all layout versions list
    loadAlllayoutVersions = (startidx, isnewpgram) => {
        this.setState({ isverloading: true }, () => {
            var csobj = { storeId: this.state.selStoreId, isReqPagination: true, startIndex: (startidx ? (this.state.verStartIndex) : 0), maxResult: this.state.verMaxCount };
            submitSets(submitCollection.findPlanogramVersionList, csobj, true).then(res => {
                //console.log(res);
                if (res && res.status && res.extra && res.extra.length > 0) {
                    var cdatalist = (startidx ? this.state.layoutVersionList : []);
                    var ndatalist = cdatalist.concat(res.extra);
                    this.setState({ layoutVersionList: ndatalist, verStartIndex: (csobj.startIndex + csobj.maxResult), verTotalCount: (csobj.startIndex === 0 ? res.count : this.state.verTotalCount) }, () => {
                        //if new planggram get viewobj from version list
                        if (isnewpgram) {
                            var cviewobj = this.state.layoutVersionList.findIndex(xitem => xitem.id === this.state.editObjId);
                            if (cviewobj > -1) {
                                this.props.setPLanogramView(this.state.layoutVersionList[cviewobj]);
                            }
                        } else{
                            //console.log(this.props.planogramState);
                            if(this.props.planogramState && this.props.planogramState.pgrmIsNewDraft === true){ //load first one
                                this.props.setFieldIsNewDraftView(false);
                                this.handleVersionChange(this.state.layoutVersionList[0]);
                            }
                        }
                    });
                }

                this.setState({ isverloading: false });
            });
        });
    }
    //
    getSinglePanogram = (floorid, isrefreshobj) => {
        var drawobj;
        //console.log(drawobj)
        if (isrefreshobj || this.props.planogramState.PDplanogramDetails === null) {
            submitSets(submitCollection.findPLanogramByID, "?floorId=" + floorid, true).then(res => {
                if (res && res.status) {
                    drawobj = res.extra;
                    // set draw obj base locations
                    drawobj.aisles.forEach(aisle => {
                        aisle.fields.forEach(field => {
                            if (!field.baseLocationX || field.baseLocationX === null) {
                                field["baseLocationX"] = field.x
                            }
                            if (!field.baseLocationY || field.baseLocationY === null) {
                                field["baseLocationY"] = field.y
                            }

                        });
                    });


                    //console.log(drawobj);
                    this.props.setPLanogramdetailsView(res.extra);

                    this.loadLayoutDetails(drawobj);

                    if (drawobj.layoutStatus !== "INACTIVE" && (drawobj.layoutStatus === "ACTIVE" || drawobj.layoutOrigin === "from_active_version")) {
                        //set filter dates and load data
                        // var cfdate = new Date();
                        // var cnfdate = new Date(cfdate.setMonth((cfdate.getMonth() - 1)));
                        var ctdate = new Date();

                        var dchangebaseid = ((drawobj.layoutStatus === "DRAFT" || drawobj.layoutStatus === "CONFIRMED") && drawobj.layoutBaseVersionId ? drawobj.layoutBaseVersionId : floorid);

                        this.setState({ resetFromActiveDate: new Date(drawobj.activeDate), fcfromdate: new Date(drawobj.activeDate), fctodate: ctdate, isShowDeptChanges: true, dcChangesBaseid: dchangebaseid, loadingscreen: false, isviewcmenu: false }, () => {
                            this.loadDeptProdChangesList();

                        });
                    } else {
                        this.setState({ isShowDeptChanges: false });
                    }
                } else {
                    alertService.error(this.props.t("CANNOT_LOAD_PLANOGRAM_FLOOR_DETAILS"));
                    this.setState({ loadingscreen: false });
                }
                //console.log(this.state.DrawUOM);
            });
        } else {
            drawobj = this.props.planogramState.PDplanogramDetails;
            this.loadLayoutDetails(drawobj);

            if (drawobj.layoutStatus !== "INACTIVE" && (drawobj.layoutStatus === "ACTIVE" || drawobj.layoutOrigin === "from_active_version")) {
                //set filter dates and load data
                // var cfdate = new Date();
                // var cnfdate = new Date(cfdate.setMonth((cfdate.getMonth() - 1)));
                var ctdate = new Date();

                var dchangebaseid = ((drawobj.layoutStatus === "DRAFT" || drawobj.layoutStatus === "CONFIRMED") && drawobj.layoutBaseVersionId ? drawobj.layoutBaseVersionId : floorid);

                this.setState({ resetFromActiveDate: new Date(drawobj.activeDate), fcfromdate: new Date(drawobj.activeDate), fctodate: ctdate, isShowDeptChanges: true, dcChangesBaseid: dchangebaseid, loadingscreen: false }, () => {
                    this.loadDeptProdChangesList();
                });
            } else {
                this.setState({ isShowDeptChanges: false });
            }
        }
        this.setState({ isviewcmenu: false})
    }
    drawscreenfromfitswitch=()=>{
        var drawobj = this.props.planogramState.PDplanogramDetails;
        
        if(!drawobj){
            //if new planogram layout create object for continue convert
            var tobj = this.state.selectedarray;
            var displayratio = this.state.drawratio;

            let availableRects = (this.state.rects && this.state.rects.length > 0?structuredClone(this.state.rects):[]);
            for (let i = 0; i < availableRects.length; i++) {
                const aisleobj = availableRects[i];
                
                aisleobj.width = (aisleobj.width / displayratio);
                aisleobj.height = (aisleobj.height / displayratio);
                aisleobj.x = (aisleobj.x / displayratio);
                aisleobj.y = (aisleobj.y / displayratio);

                for (let j = 0; j < aisleobj.fields.length; j++) {
                    const fieldobj = aisleobj.fields[j];
                    
                    fieldobj.width = (fieldobj.width / displayratio);
                    fieldobj.height = (fieldobj.height / displayratio);
                    fieldobj.x = (fieldobj.x / displayratio);
                    fieldobj.y = (fieldobj.y / displayratio);
                }
            }

            drawobj = {
                id: -1,
                floor: { name: tobj.name, id: tobj.id },
                floorWidth: tobj.width,
                floorHeight: tobj.height,
                floorImageUrl: tobj.imageUrl,
                aisles: availableRects,
                uom: tobj.uom,
                planogramTags: this.state.addedTags,
            };
        }

        this.loadLayoutDetails(drawobj);
    }
    //load details
    loadLayoutDetails = (drawobj) => {
        
        if (drawobj) {
            // console.log(drawobj);
            
            var fobj = drawobj.floor;
            var reopenplanos = drawobj.aisles;
            var tobj = this.state.selectedarray;

            var cobj = {};
            cobj["FloorName"] = fobj.name;
            cobj["FloorId"] = fobj.id;
            cobj["floor"] = fobj.id;

            tobj.width = drawobj.floorWidth;
            tobj.height = drawobj.floorHeight;
            tobj.imageUrl = drawobj.floorImageUrl;

            
            this.setState({
                layoutObj: drawobj,
                editObjId: (drawobj.id > 0?drawobj.id:-1),
                planFloorObj: (drawobj.id > -1?drawobj:null), 
                addedTags: drawobj.planogramTags, 
                sobj: cobj, 
                DrawUOM: drawobj.uom, 
                loadingscreen: false 
            }, () => {
                if (this.state.floorlist && this.state.sobj && this.state.sobj.floor >= 0) {
                    this.setState({ 
                        selectedarray: (this.state.floorlist && this.state.floorlist.length > 0?this.state.floorlist[this.state.sobj.floor]:[]) 
                    }, () => {
                        var dimention = (this.state.fittowidth?
                            floorAspectRatioDrawBoxbaseonwidth(tobj.width, tobj.height, this.state.divWidth, this.state.divHeight)
                            :floorAspectRatioDrawBox(tobj.width, tobj.height, this.state.divWidth, this.state.divHeight)
                        );
                        
                        var ratio = CalculateRatio(tobj.width, dimention.dwidth)

                        this.setState({ viewHeight: dimention.dheight, viewWidth: dimention.dwidth, imageurl: tobj.imageUrl, drawratio: ratio }, () => {
                            this.handleToolControls('mainsvg-view',"zoomreset");
                            
                            var newupdate = this.reconverttoopn(reopenplanos);
                            this.setState({ selectedarray: tobj, rects: newupdate });
                            //this.svgfile.current.style.borderStyle = "solid"

                            this.loadFloorLayoutImage(tobj.imageUrl);
                        });
                    });
                }


            });
            let departments = [];
            for (const item of drawobj.aisles) {
                for (const fields of item.fields) {
                    if(fields.department && fields.department.departmentId > 0){
                        if(departments.length > 0){
                            let check_department = departments.filter((d)=>{return d.value === fields.department.departmentId});
                            if(check_department.length === 0){
                                let data ={value:fields.department.departmentId,label:fields.department.name }
                                departments.push(data);
                            }
                        } else {
                            let data ={value:fields.department.departmentId,label:fields.department.name }
                            departments.push(data);
                        }
                    }
                }
            }
            this.setState({
                departmentlist:departments
            })
        }

    }
    //load floor image
    loadFloorLayoutImage = async (imgUrl) => {
        var blobimage = (imgUrl ? await this.getBase64Image(imgUrl) : undefined);
        //console.log(blobimage);
        if (!imgUrl) {
            this.onloadimage();
        }
        this.setState({ imagebase: blobimage });
    }
    //get all Dunits
    getProductList = () => {
        var csobj = { isReqPagination: false, withImageUrl: true, storeId: this.state.selStoreId };

        submitSets(submitCollection.searchDisplayUnit, csobj, true).then(res => {
            //console.log(res);
            if (res && res.status) {
                this.setState({
                    loadDunitList: res.extra,
                    recentDUnitList: res.extra,
                }, () => {
                    //
                });
                //console.log(this.state.loadDunitList);
            } else {
                //
            }
            // console.log(this.state.loadDunitList);


        });
    }

    //filter prod list
    handleFilterProducts = (evt) => {
        var ctxt = evt.target.value;
        var cfilterlist = [];
        if (ctxt && ctxt.length > 0) {
            for (var i = 0; i < this.state.loadDunitList.length; i++) {
                const citem = this.state.loadDunitList[i];
                if (citem.fieldName.toLowerCase().includes(ctxt.toLowerCase())) {
                    cfilterlist.push(citem);
                }
            }
        }
        this.setState({ filteredDUnitList: cfilterlist, filterTypeTxt: ctxt });
    }

    //toggle products view
    toggleProdListView = (cstat) => {
        this.setState({ isListViewActive: null }, () => {
            setTimeout(() => {
                this.setState({ isListViewActive: cstat });
            }, 200);
        });
    }


    drawRect = (dunit) => {
        const canvasEle = this.testcanvas.current;

        canvasEle.width = measureConverter(dunit.uom, this.state.DrawUOM, dunit.width) * this.state.drawratio;

        canvasEle.height = measureConverter(dunit.uom, this.state.DrawUOM, dunit.depth) * this.state.drawratio;
        // console.log("my width" + dunit.width * this.state.drawratio);

        // get context of the canvas
        var ctx = canvasEle.getContext("2d");

        ctx.fillStyle = "#FF0000";
        // ctx.fillRect(0, 0, dunit.width * this.state.drawratio, dunit.depth * this.state.drawratio);
        ctx.fillRect(0, 0, canvasEle.width, canvasEle.height);
    }

    showModal = () => {
        var temstobj = this.state.stobj;
        temstobj.tagName = "";

        this.setState({ show: true, toridata: [], stobj: temstobj, newtag: { tagName: "", type:"planogram" }, tagModalType: 1 });

    };

    hideModal = () => {
        this.setState({ show: false });
    };
    //onselect new floorlayout
    handleFilterFloor(evt, etype) {
        var cobj = this.state.sobj;
        var isselected;
        if (evt.target.value !== null && evt.target.value > -1) {
            cobj[etype] = evt.target.value;
            if (evt.target.value !== -1) {
                isselected = true;
                cobj["FloorName"] = this.state.floorlist[evt.target.value].name;
                cobj["FloorId"] = this.state.floorlist[evt.target.value].id;

            } else {
                isselected = false;
            }
            // console.log(cobj);

            this.setState({ sobj: cobj, isselectedfloor: isselected, DrawUOM: this.state.floorlist[evt.target.value].uom });
            if (this.state.sobj.floor >= 0) {
                this.setState({ selectedarray: (this.state.floorlist[this.state.sobj.floor]) }, () => {
                    var dimention = {};
                    // dimention = floorAspectRatioDrawBox(this.state.selectedarray.width, this.state.selectedarray.height, this.state.divWidth, this.state.divHeight);
                    dimention =this.state.fittowidth? floorAspectRatioDrawBoxbaseonwidth(this.state.selectedarray.width, this.state.selectedarray.height, this.state.divWidth, this.state.divHeight): floorAspectRatioDrawBox(this.state.selectedarray.width, this.state.selectedarray.height, this.state.divWidth, this.state.divHeight);
                    // dimention = floorAspectRatioDrawBoxbaseonwidth(this.state.selectedarray.width, this.state.selectedarray.height, this.state.divWidth, this.state.divHeight);
                    var ratio = CalculateRatio(this.state.selectedarray.width, dimention.dwidth)
                    this.setState({ viewHeight: dimention.dheight, viewWidth: dimention.dwidth, imageurl: this.state.selectedarray.imageUrl, drawratio: ratio }, () => {
                        //console.log("ratio" + this.state.drawratio);
                        //this.svgfile.current.style.borderStyle = "solid";
                        //load baseimage for selected layout
                        this.loadFloorLayoutImage(this.state.selectedarray.imageUrl);
                    })

                });
            }
        } else {
            this.setState({ sobj: {}, isselectedfloor: false, DrawUOM: "", selectedarray: [], viewHeight: 0, viewWidth: 0, imageurl: "", drawratio: 0 });
        }
    }

    showsidebar = () => {
        this.setState({ isShowProdView: true, isshowQRpanel: false, rotationobj: null });
    }
    hidesidebar = () => {
        // console.log("yoohoo");

        this.setState({ isShowProdView: false });
    }

    showQRsidebar = () => {
        var selDep=this.state.QRobj && this.state.QRobj.department ? this.state.QRobj.department:null
        var orideplist=JSON.parse(JSON.stringify(this.state.loadedDeptList))
        if(selDep!==null){
            var haveDepinList=orideplist.find(x=>x.departmentId===selDep.departmentId)
            if(haveDepinList===undefined && selDep.departmentId>0){
                orideplist.push(selDep)
            }
        }
        
        this.setState({ isshowQRpanel: true, isShowProdView: false,loadedDeptList:orideplist });
    }
    hideQRsidebar = () => {
        this.setState({ isshowQRpanel: false, rotationobj: null, });

    }

    getUploadImage = (imgId) => {
        var imgObj = {};
        imgObj.id = imgId;

        submitSets(submitCollection.getImageGETURL, imgObj, true).then(res => {
            //console.log(res);
            if (res && res.status && res.extra) {
                var csobj = this.state.sobj;
                csobj["imagePath"] = res.extra.url;
                this.setState({
                    sobj: csobj
                });
            }
        });
    }
    dragclick = (e, dunit) => {
        this.drawRect(dunit);
        var canimg = this.testcanvas.current.toDataURL("image/png");
        // console.log(canimg);

        this.img = document.createElement("img");
        this.img.src = canimg;
    }
    dragStart = (e, dunit) => {

        e.dataTransfer.setDragImage(this.img, 0, 0);

        var x = e.nativeEvent.offsetX
        var y = e.nativeEvent.offsetY
        // console.log(x);
        
        this.setState({
            currentDraggableProd: dunit,
            prodClickX: x,
            prodClickY: y
        }, () => {
            // console.log(this.state.currentDraggableProd);

        })


    }
    dragEnd = (e, shelfObj) => {
        e.stopPropagation();
        e.preventDefault();

    }
    
    droppedNew = async (e, svg) => {
        if (!this.state.planoLock) {
            this.planoChangeHappen();
            // var drawHeight = svg.current.clientHeight;
            e.preventDefault();

            var xa = e.nativeEvent.offsetX
            // console.log(e.nativeEvent);

            var ya = e.nativeEvent.offsetY

            var draggingProduct = this.state.currentDraggableProd;

            if (draggingProduct && draggingProduct != null) {
                var dropDUWidth = measureConverter(draggingProduct.uom, this.state.DrawUOM, draggingProduct.width) * this.state.drawratio;
                var dropDUHeight = measureConverter(draggingProduct.uom, this.state.DrawUOM, draggingProduct.depth) * this.state.drawratio;

                var allowToAdd = this.checkAllowToAdd(e, svg, dropDUWidth, dropDUHeight, xa, ya);
                // console.log(this.state.snap);

                if (allowToAdd) {
                    // var newy = (drawHeight) - dropDUHeight;
                    var snap = this.snapallow(dropDUWidth, dropDUHeight, xa, ya)
                    var allow2ndcheck = this.checkAllowToAdd(e, svg, dropDUWidth, dropDUHeight, snap.x, snap.y);
                    var isInsideofFloor=checkIsInsideofBox(this.state.viewWidth, this.state.viewHeight, 0, 0,dropDUWidth, dropDUHeight, snap.x , snap.y ,0)
                    // console.log(isInsideofFloor);
                    // console.log(allow2ndcheck);

                    // this.snapondrop(xa, ya, xb, yb, rect);
                    // var allowToAddBottom = this.checkAllowToAdd(e, svg, dropDUWidth, dropDUHeight, xa, ya)
                    // if (allow2ndcheck) {
                    if (allow2ndcheck&&isInsideofFloor) {
                        var addedProds;
                        var cfieldlist = {
                            id: -1,
                            x: snap.x,
                            y: snap.y,
                            width: dropDUWidth,
                            height: dropDUHeight,
                            drawWidth: dropDUWidth,
                            drawDepth: dropDUHeight,
                            masterFieldUom: draggingProduct.uom,
                            rotation: 0,
                            department: { departmentId: -1, color: "#28a745" },
                            planogramShelfDto: [],
                            notes: "",
                            fieldDto: draggingProduct,
                            f_uuid: uuidv4(),
                            uuid: uuidv4(),
                            uom: this.state.DrawUOM,
                            isNew: true, isDelete: false,
                            fieldImageId: draggingProduct.imageId,
                            fieldImageUrl: draggingProduct.imagePath,
                            masterFieldWidth: draggingProduct.width,
                            masterFieldHeight: draggingProduct.height,
                            masterFieldDepth: draggingProduct.depth
                        }

                        var data_obj = {
                            id: -1,
                            f_uuid: uuidv4(),
                            // uuid: uuidv4(),
                            name: draggingProduct.fieldName,
                            x: snap.x,
                            y: snap.y,
                            uom: this.state.DrawUOM,
                            rotation: 0,
                            width: dropDUWidth,
                            height: dropDUHeight,
                            ftypeid: draggingProduct.id,
                            // src: draggingProduct.imageUrl,
                            fill: "red",

                            // shelfID: svg.id,
                            actualWidth: dropDUWidth,
                            actualHeight: dropDUHeight,
                            fields: [cfieldlist],
                            isNew: true, isDelete: false,
                        }
                        if (snap.bool) {
                            // console.log(data_obj);
                            var todropisle = this.state.rects.find(x => x.f_uuid === snap.rack)
                            var newcfieldlist = cfieldlist;
                            var newis;
                            var id = -1;
                            var isnewo = true;
                            var side;

                            if (snap.id > 0) {
                                newis = false
                            } else {
                                newis = true
                            }

                            if (snap.right) {
                                side = "left";
                                newcfieldlist["rightSideFieldDto"] = { rightFloorFieldId: snap.id, rightFloorFieldUUID: snap.right, isNew: newis };
                                newcfieldlist["isRightChange"] = true
                                this.setConnectedfielddet(snap.right, isnewo, id, side, newcfieldlist.f_uuid);
                            }
                            if (snap.left) {
                                side = "right";
                                newcfieldlist["leftSideFieldDto"] = { leftFloorFieldId: snap.id, leftFloorFieldUUID: snap.left, isNew: newis }
                                newcfieldlist["isLeftChange"] = true
                                this.setConnectedfielddet(snap.left, isnewo, id, side, newcfieldlist.f_uuid);
                            }

                            todropisle.fields.push(newcfieldlist);
                            var otherisles = this.state.rects.filter(x => x.f_uuid !== snap.rack)
                            otherisles.push(todropisle);
                            addedProds = otherisles
                            // console.log(todropisle);
                            // console.log(otherisles);

                        } else {

                            addedProds = this.state.rects
                            addedProds.push(data_obj);
                        }


                        
                        this.setState({
                            rects: addedProds,
                            currentDraggableProd: null,
                            //reset to field toggle when drop prodduct
                            isIsleSelected:false,IsleRects:[],
                        }, () => {
                            //console.log(this.state.rects);
                        })
                    }
                }
            }
        } else {
            alertService.warn(this.props.t("PLANOGRAMIS_LOCKED"))
        }
    }
    setConnectedfielddet = (thisfuid, isnew, id, side, nffuid) => {

        var filterIsles = this.state.rects;
        //console.log("in set other");
        for (let i = 0; i < filterIsles.length; i++) {

            var isitmfound = false;
            for (let index = 0; index < filterIsles[i].fields.length; index++) {
                //console.log(side, thisfuid);
                if (filterIsles[i].fields[index].f_uuid === thisfuid) {

                    if (side === "left") {
                        //console.log("llllllll left");
                        if (filterIsles[i].fields[index].leftSideFieldDto) {
                            if (id > 0) {
                                filterIsles[i].fields[index].leftSideFieldDto.leftFloorFieldId = id;
                            } else {
                                filterIsles[i].fields[index].leftSideFieldDto.leftFloorFieldUUID = nffuid;
                                filterIsles[i].fields[index].leftSideFieldDto.leftFloorFieldId = id
                            }


                            filterIsles[i].fields[index].leftSideFieldDto.isNew = false;
                            filterIsles[i].fields[index].leftSideFieldDto.isDelete = false
                            filterIsles[i].fields[index]["isLeftChange"] = true

                        } else {
                            filterIsles[i].fields[index].leftSideFieldDto = { leftFloorFieldId: id, leftFloorFieldUUID: nffuid, isNew: isnew, isDelete: false };
                            filterIsles[i].fields[index]["isLeftChange"] = true
                        }

                    } else {
                        // console.log("llllllll right");
                        if (filterIsles[i].fields[index].rightSideFieldDto) {
                            // console.log("llllllll right have");
                            if (id > 0) {
                                filterIsles[i].fields[index].rightSideFieldDto.rightFloorFieldId = id;
                            } else {
                                filterIsles[i].fields[index].rightSideFieldDto.rightFloorFieldUUID = nffuid;
                                filterIsles[i].fields[index].rightSideFieldDto.rightFloorFieldId = id
                            }


                            filterIsles[i].fields[index].rightSideFieldDto.isNew = false;
                            filterIsles[i].fields[index].rightSideFieldDto.isDelete = false
                            filterIsles[i].fields[index]["isRightChange"] = true

                        } else {

                            filterIsles[i].fields[index].rightSideFieldDto = { rightFloorFieldId: id, rightFloorFieldUUID: nffuid, isNew: isnew, isDelete: false };
                            filterIsles[i].fields[index]["isRightChange"] = true

                        }

                    }
                    isitmfound = true;
                    break;
                }
            }
            if (isitmfound) {
                break;
            }
        }
    }
    snapondrop = (xa, ya, xb, yb, prod) => {

        var x1 = prod.x
        var y1 = prod.y
        var x2 = x1 + prod.width
        // var y2 = y1 + prod.height
        // console.log(x1,xb);

        var snapping = { bool: false, x: xa, y: ya, };
        // console.log(prod.rotation);
        if (prod.rotation === 0) {
            //console.log("snapondrop");


            if ((x2 < xa && xa < (x2 + 6)) && ((y1 - prod.height) < ya && ya < (y1 + prod.height))) {
                // console.log("snap to left");
                snapping["bool"] = true
                snapping["x"] = (x2 + 0.01)
                snapping["y"] = y1
                snapping["right"] = prod.f_uuid
                snapping["id"] = prod.id

            } else if (((x1 - 6) < (xb + xa) && (xb + xa) < x1) && ((y1 - prod.height) < ya && ya < (y1 + prod.height))) {
                //console.log("snap 2 right");
                snapping["bool"] = true
                snapping["x"] = ((x1 - xb) - 0.01)
                snapping["y"] = y1
                snapping["left"] = prod.f_uuid
                snapping["id"] = prod.id
                //console.log("in 2nd else");


            }
            // console.log(prod.rotation);
        }


        // console.log(x1, x2, y1, y2, xa, ya, xb, yb);


        // if((x1<xb) && (x2<xa) && (y1<yb) && !(y2<ya)){
        //     console.log("drop work on rigt");
        //     console.log((x1<xb) , (x2<xa) , (y1<yb) , !(y2<ya));


        // }
        // if((x1<xb) && !(x2<xa) && (y1<yb) && !(y2<ya)){
        //     console.log("drop in top");


        // }


        // if (x1 < xb && (!(x2 > xa)) && y1 < yb && y2 > ya) {
        //     if (x2 < xa < x2 + 10) {
        //         console.log(xa);

        //         xa = x2;

        //     }
        //     console.log("drop work on rigt");
        // }
        // if ((!(x1 < xb)) && x2 > xa && y1 < yb && y2 > ya) {
        //     console.log("drop work on left");
        // }


        return snapping;

    }

    snapallow = (dropDUWidth, dropDUHeight, xa, ya) => {
        // var xb = xa + dropDUWidth
        // var yb = ya + dropDUHeight

        // console.log("snapondrop test");
        var allowToAdd = {};
        var snapping = {};
        var isles = this.state.rects;
        //remove itype preview
        var noprevisles = isles.filter(z => z.itype !== "preview");

        var filterIsles = noprevisles.filter(x => x.isDelete === false);
        if (filterIsles.length !== 0) {

            loop1:
            for (let index = 0; index < filterIsles.length; index++) {
                const rect = filterIsles[index];
                const filterFields = rect.fields.filter(x => x.isDelete === false);
                // console.log(rect);

                for (let i = 0; i < filterFields.length; i++) {
                    //console.log(filterFields[i]);
                    snapping = this.snapondrop(xa, ya, dropDUWidth, dropDUHeight, filterFields[i])

                    if (snapping.bool) {
                        // allowToAdd = false
                        //console.log(filterIsles[index]);
                        snapping["rack"] = filterIsles[index].f_uuid;
                        break loop1;
                    }

                }


            }
            allowToAdd = snapping
        } else {
            snapping["x"] = xa;
            snapping["y"] = ya
            allowToAdd = snapping
        }
        return allowToAdd;

    }
    checkAllowToAdd = (e, svg, dropDUWidth, dropDUHeight, xa, ya) => {
        //console.log(this.state.rects);
        // var xb = xa + dropDUWidth
        // var yb = ya + dropDUHeight
        var isles = this.state.rects;
        var filterIsles = isles.filter(x => x.isDelete === false);
        var allowToAdd = true;
        if (filterIsles.length !== 0) {

            for (let index = 0; index < filterIsles.length; index++) {
                const rect = filterIsles[index];
                const filterFields = rect.fields.filter(x => x.isDelete === false);
                //console.log(rect.fields[0]);
                for (let i = 0; i < filterFields.length; i++) {
                    var rectAllow = this.checkThroughProducts(xa, ya, dropDUWidth, dropDUHeight, filterFields[i])
                    //console.log("rec" + rect);
                    if (!rectAllow) {
                        allowToAdd = false
                        break;
                    }
                }
                if (!allowToAdd) {
                    break;
                }
            }
        }
        return allowToAdd;
    }


    checkThroughProducts = (xa, ya, dropDUWidth, dropDUHeight, prod) => {



        var x1 = prod.x + (prod.width / 2)
        var y1 = prod.y + (prod.height / 2)
        var xA = xa + (dropDUWidth / 2)
        var yA = ya + (dropDUHeight / 2)
        var rectA = { x: x1, y: y1, w: prod.width, h: prod.height, angle: prod.rotation }
        var rectB = { x: xA, y: yA, w: dropDUWidth, h: dropDUHeight, angle: 0 }
        var allowOnProducts = true;
        // console.log("prod");
        // console.log(rectA,rectB);
        var colliderect = isRectCollide(rectA, rectB);
        if (colliderect) {
            allowOnProducts = false
        }

        // if (x1 < xb && x2 > xa && y1 < yb && y2 > ya) {
        //     allowOnProducts = false
        // }
        // if (((x1 <= xa && xa <= x2) && (y1 <= ya && ya <= y2)) ||
        //     ((x1 <= xb && xb <= x2) && (y1 <= ya && ya <= y2)) ||
        //     ((x1 <= xa && xa <= x2) && (y1 <= yb && yb <= y2)) ||
        //     ((x1 <= xb && xb <= x2) && (y1 <= yb && yb <= y2)) ||

        //     ((xa <= x1 && x1 <= xb) && (ya <= y1 && y1 <= yb)) ||
        //     ((xa <= x2 && x2 <= xb) && (ya <= y1 && y1 <= yb)) ||
        //     ((xa <= x2 && x2 <= xb) && (ya <= y2 && y2 <= yb)) ||
        //     ((xa <= x1 && x1 <= xb) && (ya <= y2 && y2 <= yb))) {
        //     allowOnProducts = false
        // }
        // console.log(allowOnProducts);


        return allowOnProducts;
    }

    clickrack = (evt, clickobj, obj) => {
        if(!this.state.isIsleSelected){
            this.setState({loadedDeptList:JSON.parse(JSON.stringify(this.state.OriloadedDeptList))})
            var cclickbtn = evt.nativeEvent.which;
            // var clickobj = (obj.fields && obj.fields.length > 0 ? obj.fields[0] : null);
            //console.log(obj);
            this.setState({ QRrackIMG: (clickobj ? clickobj.fieldDto.imagePath : ""), QRobj: clickobj, QRisle: obj, prevrotation: clickobj.rotation, rotationobj: clickobj }, () => {
                if (cclickbtn === 3 && this.state.isDisableEdit === false) {
                    this.hideQRsidebar();
                    this.setState({ isviewcmenu: true, contxtmenu: { xpos: evt.nativeEvent.clientX - 20, ypos: evt.nativeEvent.pageY } });
                    // this.setState({ isviewcmenu: true, contxtmenu: { xpos: evt.nativeEvent.clientX-obj.fields[0].width, ypos: evt.nativeEvent.clientY } });
                } else if (cclickbtn === 1) {
                    this.setState({ isviewcmenu: false, contxtmenu: null ,isshowQRpanel:false},()=>{
                        this.showQRsidebar();
                    });
                    
                }
            });
        }
        
    }
    clickaisle = (evt, clickobj) => {
        this.setState({    prevrotation: clickobj.rotation, rotationobj: clickobj }, () => {
            // this.drawIsleRects()
        });
    }

    rectChangeHandle = (event, obj, mapleft, mapright) => {

        var newrects = this.state.rects;

        //var clickedone=this.state.rects.filter(x => x.uuid === obj.uuid);
        for (let i = 0; i < newrects.length; i++) {
            
            for (var index = 0; index < newrects[i].fields.length; index++) {
                //this changed uuid to fuid
                //if (newrects[i].fields[index].uuid === obj.uuid) {
                if (newrects[i].fields[index].f_uuid === obj.f_uuid) {
                    newrects[i].x = event.x;
                    newrects[i].y = event.y;
                    newrects[i].fields[index].x = event.x;
                    newrects[i].fields[index].y = event.y;
                    // newrects[i].fields[index].leftSideFieldDto =mapleft;
                    // newrects[i].fields[index].rightSideFieldDto =mapright;

                }
            }
        }

        this.setState({ 
            rects: newrects, 
        });
    }
    //#PLG-SVE-1
    savePlanogram = () => {
        var csobj = {};
        csobj.id = -1;
        csobj.aisles = this.state.rects;
        csobj.floor = { id: parseInt(this.state.sobj.FloorId) };
        var savepath = (submitCollection.savePlanogram);
        submitSets(savepath, csobj, true).then((res) => {
            if (res && res.status) {
                //alertService.success("Floor successfully ");
            } else {
                // alertService.error("Error occurred in "+(type===3?"delete":type===2?"update":"save")+" process");
            }
        });

    }

    reconverttoopn = (rectset) => {
        // console.log(this.state.DrawUOM);

        var newRects = JSON.parse(JSON.stringify(rectset))
        for (let i = 0; i < newRects.length; i++) {
            var element = newRects[i];
            element.width = (element.width * this.state.drawratio);
            element.height = (element.height * this.state.drawratio);
            element.x = (element.x * this.state.drawratio);
            element.y = (element.y * this.state.drawratio);

            for (let index = 0; index < element.fields.length; index++) {
                var element2 = element.fields[index];
                element2.width = (element2.width * this.state.drawratio);
                element2.height = (element2.height * this.state.drawratio);
                //console.log(element2.masterFieldUom, this.state.DrawUOM,element2.masterFieldDepth);
                const currentmsteruom = (element2.masterFieldUom && element2.masterFieldUom !== "none" ? element2.masterFieldUom : element2.fieldDto.uom);
                element2.drawDepth = measureConverter(currentmsteruom, this.state.DrawUOM, element2.masterFieldDepth) * this.state.drawratio;
                element2.drawWidth = measureConverter(currentmsteruom, this.state.DrawUOM, element2.masterFieldWidth) * this.state.drawratio;
                element2.x = (element2.x * this.state.drawratio);
                element2.y = (element2.y * this.state.drawratio);

                element.fields[index] = element2
            }

            newRects[i] = element
        }

        return newRects;


    }

    setdatafordb = (rectset) => {
        var newRects = rectset;
        for (var i = 0; i < newRects.length; i++) {
            var mrectitem = newRects[i];
            mrectitem.width = (mrectitem.width / this.state.drawratio);
            mrectitem.height = (mrectitem.height / this.state.drawratio);
            mrectitem.x = (mrectitem.x / this.state.drawratio);
            mrectitem.y = (mrectitem.y / this.state.drawratio);

            for (var index = 0; index < mrectitem.fields.length; index++) {
                var sfielditem = mrectitem.fields[index];
                sfielditem.width = (sfielditem.width / this.state.drawratio);
                sfielditem.height = (sfielditem.height / this.state.drawratio);
                sfielditem.x = (sfielditem.x / this.state.drawratio);
                sfielditem.y = (sfielditem.y / this.state.drawratio);
                sfielditem.masterFieldUom = (sfielditem.masterFieldUom && sfielditem.masterFieldUom !== "none" ? sfielditem.masterFieldUom : sfielditem.fieldDto.uom);
                //mrectitem.fields[index] = element2
            }
        }
        return newRects;
    }

    ExportImage = (type, isredirect, issidebar) => {
        //if edit check changes available
        if(type === 2 && !this.state.changeinplano){
            alertService.error(this.props.t("NO_CHANGES_AVAILABLE"));
            return false;
        }

        if (this.state.selectedIsle === null) {
            var rectset = JSON.parse(JSON.stringify(this.state.rects));
            var csobj = { aisles: rectset };

            var validation = this.validationplanogram(csobj);
            
            if (validation) {
                this.setState({ loadingscreen: true });
                var crespname = (this.state.toUploadImages && this.state.toUploadImages.length > 0 ? this.state.toUploadImages[0].name : "");
                var imgObj = {};
                imgObj.imageName = crespname;

                document.getElementById("rectimage").style.display = "none";
                htmlToImage.toBlob(document.getElementById('FloorMapbox'))
                    .then((blob) => {
                        var cdate = new Date();
                        var upfile = new File([blob], ("FLR_" + cdate.getTime() + ".png"), { type: "image/png", lastModified: cdate.getTime() });

                        this.handleGetUploadImage(type, upfile, isredirect, issidebar);
                        //window.saveAs(blob, 'my-node.png');
                    }).then(() => {
                        document.getElementById("rectimage").style.display = "block";
                    });    
            }
        } else {
            confirmAlert({
                title: this.props.t('ISLECHANGES_NOT_SET'),
                message: this.props.t('CHANGES_OF_ISLE_NOTSET_PLEASE_SETISLE_BEFORE'),
                overlayClassName: (this.props.isRTL === "rtl" ? "alertrtl-content" : ""),
                buttons: [{
                    label: this.props.t('btnnames.close')
                }]
            });
        }
    }

    handleGetUploadImage = (type, upfile, isredirect, issidebar) => {
        var crespname = (upfile ? upfile.name : "");
        var imgObj = {};
        imgObj.imageName = crespname;

        submitSets(submitCollection.getImagePutURL, imgObj, true).then(res => {
            if (res && res.status) {
                this.handleUploadImage(upfile, res.extra, type, isredirect, issidebar);
            } else {
                if (type) { this.handlesaveupdatedelete(type, isredirect, issidebar); }
            }
        });
    }

    handleUploadImage = (imgobj, urlobj, type, isredirect, issidebar) => {
        try {
            const coheaders = { "Content-Type": 'image/*' };
            axios({ url: urlobj.url, method: "PUT", data: imgobj, headers: coheaders }).then((res) => {
                if (res.status === 200) {
                    var csobj = this.state.sobj;
                    csobj["imageId"] = urlobj.id;
                    this.setState({ sobj: csobj });
                    if (type) { this.handlesaveupdatedelete(type, isredirect, issidebar); }
                } else {
                    if (type) { this.handlesaveupdatedelete(type, isredirect, issidebar); }
                }
            });
        } catch (error) {
            if (type) { this.handlesaveupdatedelete(type, isredirect, issidebar); }
        }
    }
    //onchange secure txt
    changeSecureTxt = (e) => {
        if(!preventinputToString(e,e.target.value,(this.props.t('version_no')))){
            e.preventDefault()
            return
        }
        this.setState({ deleteSecureTxt: e.target.value });
    }
    //delete secure modal
    toggleSecureDelete = () => {
        this.setState({ deleteSecureModal: !this.state.deleteSecureModal, deleteSecureTxt: "" });
    }
    //
    handlPlDelete = (type, isredirect, issidebar) => {
        if (type === 3) {
            var curpgstate = this.props.planogramState.PDplanogramDetails;
            var curverttxt = (this.state.deleteSecureTxt !== undefined?(this.state.deleteSecureTxt.replace(/ /g, '')).trim():"");
            
            if (curverttxt !== "" && curverttxt === curpgstate.mainVersion.replace(/ /g, '')) {
                this.setState({ deleteSecureModal: false });

                /* swal(this.props.t('ARE_YOU_SURE_DELETE_THIS_PLANOGRAM'), {
                    buttons: {
                        cancel: this.props.t('btnnames.no'),
                        catch: this.props.t('btnnames.yes')
                    },
                }).then((value) => {
                    console.log(value);
                }); */

                confirmAlert({
                    title: this.props.t('CONFIRM_DELETE_PLANOGRAM'),
                    message: this.props.t('ARE_YOU_SURE_DELETE_THIS_PLANOGRAM'),
                    overlayClassName: (this.props.isRTL === "rtl" ? "alertrtl-content" : ""),
                    buttons: [{
                        label: this.props.t('btnnames.yes'),
                        onClick: () => {
                            this.handlesaveupdatedelete(type, isredirect, issidebar)
                        }
                    }, {
                        label: this.props.t('btnnames.no'),
                        onClick: () => {
                            return false;
                        }
                    }]
                });
            } else {
                alertService.error(this.props.t('VERSION_NO_DIDNT_MATCH'));
            }

        }

    }
    //this only for test
    baseLchange = (csobj) => {
        var ret = ""
        csobj.aisles.forEach(ailse => {
            ailse.fields.forEach(field => {
                ret = ret + " id" + field.id + "=" + field.isFieldLocationChange + "  "
            });
        });

        return ret
    }
    //end
    //planogram change happenning
    planoChangeHappen = () => {
        this.setState({ changeinplano: true })
    }
    //validate before save
    validationplanogram = (csobj) => {
        //console.log(csobj.aisles);
        if (csobj.aisles.length === 0) {
            alertService.error(this.props.t('PLEASE_ADD_AT_LEASTONE_FIELD_TOSAVE'));
            return false
        }
        return true
    }
    //saveupdate delte
    handlesaveupdatedelete = (type, confrm, issidebar) => {

        this.setState({ loadingscreen: true });

        var csobj = {};
        if (type === 1) {
            csobj.id = -1;
        } else if (type === 2 || type === 3) {
            csobj.id = this.state.editObjId;
            //console.log("planogram");
            this.setState({ changeinplano: false })
        }

        if (this.state.sobj && Object.keys(this.state.sobj).length > 0 && this.state.sobj.imageId) {
            csobj["imageId"] = this.state.sobj.imageId;
        }
        //copy master data for floor in save
        if (this.state.isedit === false) {
            csobj["floorHeight"] = this.state.selectedarray.height
            csobj["floorWidth"] = this.state.selectedarray.width
            csobj["uom"] = this.state.selectedarray.uom
            csobj["floorImageId"] = this.state.selectedarray.imageId
        }
        //console.log(this.state.rects);
        var rectset = JSON.parse(JSON.stringify(this.state.rects));
        //console.log(rectset);
        var newrectset = this.setdatafordb(rectset);


        csobj.aisles = newrectset;
        csobj.floor = { id: parseInt(this.state.sobj.FloorId) };
        csobj.planogramTags = this.state.addedTags;

        //adding location change boolean
        // console.log(csobj);
        csobj.aisles.forEach(eleisle => {
            eleisle.fields.forEach(elefield => {
                if(eleisle.uuid===undefined || eleisle.uuid===eleisle.baseAisleUUID){
                    elefield["isFieldLocationChange"] = true
                }else{
                    if (elefield.baseLocationX || elefield.baseLocationY) {
                        //console.log(elefield.baseLocationX.toFixed(11), elefield.x.toFixed(11));
                        if (elefield.baseLocationX && elefield.baseLocationY) {
                            if (elefield.baseLocationX.toFixed(11) !== elefield.x.toFixed(11) || elefield.baseLocationY.toFixed(11) !== elefield.y.toFixed(11)|| elefield.isRotaionChange) {
                                elefield["isFieldLocationChange"] = true
                            } else {
                                // elefield["isFieldLocationChange"] = false
                            }
                        } else {
                            // elefield["isFieldLocationChange"] = false
                        }
                    } 
                }
                
            });
        });

        csobj["storeId"] = this.state.selStoreId //set current storeid

        // console.log(csobj);
        //alert(this.baseLchange(csobj))
        //end

        var validation = this.validationplanogram(csobj);
        if (validation) {
            var savepath = (type === 3 ? submitCollection.deleteFloorLayout : type === 2 ? submitCollection.updateFloorLayout : submitCollection.savePlanogram);
            submitSets(savepath, csobj, true).then(res => {
                if (res && res.status) {
                    if (confrm === "CONFIRMED") {
                        this.handleChangeStatus("CONFIRMED")
                    }
                    alertService.success(this.props.t('PLANOGRAM_SUCCESSFULLY') + (type === 3 ? "deleted" : type === 2 ? "updated" : "saved"));

                    if (res.extra && res.extra !== "") {
                        var caisleobj = this.state.QRisle;
                        var cfieldobj = this.state.QRobj;
                        var findindx = null; var findfobj = null;
                        for (var l = 0; l < res.extra.aisles.length; l++) {
                            const cisle = res.extra.aisles[l];
                            if (cisle.f_uuid === caisleobj.f_uuid) {
                                findindx = cisle;
                                for (var k = 0; k < cisle.fields.length; k++) {
                                    const cfield = cisle.fields[k];
                                    if (cfield.f_uuid === cfieldobj.f_uuid) {
                                        findfobj = cfield;
                                    }
                                }
                            }

                        }
                        this.props.setPLanogramdetailsView(res.extra);
                        this.setState({
                            QRisle: (findindx ? findindx : this.state.QRisle),
                            QRobj: (findfobj ? findfobj : this.state.QRobj),
                            isedit: true, editObjId: res.extra.id,
                            loadingscreen: false, isFieldSaved: true,
                        }, () => {
                            // console.log(this.state.loadingscreen);
                            /* if (issidebar) {
                                if (isredirect) {
                                    this.props.setFieldView(this.state.QRobj);
    
                                    this.props.history.push("/planograms/displayunit");
                                } else if (res.extra.id > 0) { //is sidebar and edit
                                    this.setState({ loadedFieldChangesList: [] }, () => {
                                        this.getSinglePanogram(res.extra.id);
                                        this.loadFieldChangesList(res.extra.id, 0);
                                        this.loadAlllayoutVersions();
                                    });
                                }
                            } else {
                                // console.log(issidebar);
                                // console.log(isredirect);
                                this.props.history.push("/planograms");
                            } */
                            if (type === 3) {
                                this.props.history.push("/planograms");
                            } else {
                                this.setState({ loadedFieldChangesList: [] }, () => {
                                    this.handleToolControls('mainsvg-view',"zoomreset");

                                    // this.props.setPLanogramdetailsView(null);
                                    this.getSinglePanogram(res.extra.id, true);
                                    this.loadFieldChangesList(res.extra.id, 0);
                                    this.loadAlllayoutVersions(null, (type === 1 ? true : false));
                                });
                            }
                        });
                    } else {
                        if(type === 2){
                            this.setState({ isFieldSaved: true }, () => {
                                this.getSinglePanogram((this.state.planFloorObj.id ? this.state.planFloorObj.id : 0), true)
                                this.loadFieldChangesList((this.state.planFloorObj.id ? this.state.planFloorObj.id : 0), 0);    
                            });
                        }else{
                            this.props.history.push("/planograms");
                        }
                        
                    }
                } else {
                    this.setState({ loadingscreen: false, isFieldSaved: true });
                    // alertService.error(res && res.extra && res.extra !== "" ? res.extra : ("Error occurred in " + (type === 3 ? "delete" : type === 2 ? "update" : "save") + " process"));

                    if(res && !res.status && res.validation){

                        let codeMessage = res.validation.code;

                        if(res.validation.msgParams && res.validation.msgParams.length > 0){
                            let filledMsg = codeMessage.replace(/\[\$\]/g, () => res.validation.msgParams.shift());
                            res.validation.type === "error" ? alertService.error(this.props.t(filledMsg)) : alertService.warn(this.props.t(filledMsg));
                        }else{
                            res.validation.type === "error" ? alertService.error(this.props.t(codeMessage)) : alertService.warn(this.props.t(codeMessage));
                        }

                    }else{
                        alertService.error(this.props.t('ERROR_OCCURRED_IN')+(type===3?"delete":type===2?"update":"save")+" process");
                    }
                }
            });
        } else {
            this.setState({ loadingscreen: false })
        }
    }

    handleRedirectField = () => {
        //console.log(this.state.QRobj);
        this.props.setFieldView(this.state.QRobj);

        this.props.history.push("/planograms/displayunit");
    }

    handleSaveFieldData = (ctype) => {
        //console.log(this.state.QRobj);
        if (ctype === 2) {
            //redirecting to display unit view
            if(!this.state.QRobj.department || !this.state.QRobj.department.departmentId || (!this.state.isFieldSaved && this.state.QRobj.department && this.state.QRobj.department.departmentId > 0)){
                alertService.error(this.props.t("selectsavedepartment"));
                return false;
            }

            if(!this.state.QRobj.noInFloorLayout || this.state.QRobj.noInFloorLayout <= 0){
                alertService.error(this.props.t("FIELD_NO_REQUIRED"));
                return false;
            }

            let viewFieldObj = this.state.QRobj;
            //calculate field list containing this field aisle
            viewFieldObj["fieldList"] = this.getAvailableFieldList(this.state.QRobj);
            viewFieldObj["layoutOrigin"] = this.state.layoutObj.layoutOrigin;
            
            for (let i = 0; i < viewFieldObj.fieldList.length; i++) {
                const fieldobj = viewFieldObj.fieldList[i];
                
                if(!fieldobj.department || !fieldobj.department.departmentId){
                    alertService.error(this.props.t("DEPT_NOTAVAILABLE_IN_AISLE"));
                    return false;
                }
            }

            this.props.setFieldView(viewFieldObj);

            this.props.history.push("/planograms/displayunit");
        } else {
            if(!this.state.QRobj.department || !this.state.QRobj.department.departmentId){
                alertService.error(this.props.t("selectdepartment"));
                return false;
            }
            // var cisle = this.state.QRisle;
            // cisle.fields[0] = this.state.QRobj;

            // var crects = this.state.rects;
            // for (var i = 0; i < crects.length; i++) {
            //     if (crects[i].id === cisle.id) {
            //         crects[i] = cisle;
            //     }
            // }
            // this.setState({ rects: crects }, () => {
            if (this.state.isedit) {
                this.ExportImage(2, false, true);
                // this.handlesaveupdatedelete(2, false, true);
            } else {
                this.ExportImage(1, false, true);
                // this.handlesaveupdatedelete(1, false, true);
            }
            this.hideQRsidebar();
            // });
        }
    }

    //get available field list
    getAvailableFieldList = (viewfieldobj) => {
        let aislelist = this.state.rects;
        
        let fieldlist = [];
        for (let i = 0; i < aislelist.length; i++) {
            const aisleobj = aislelist[i];
            
            let isavailable = aisleobj.fields.findIndex(x => x.uuid === viewfieldobj.uuid);
            if(isavailable > -1){
                //find next 4 fields
                let currentfield = aisleobj.fields[isavailable];
                fieldlist.push(structuredClone(currentfield));

                let isleftcheck = false;
                if(currentfield.rightSideFieldDto && currentfield.rightSideFieldDto.rightFloorFieldInfo){
                    let rightobj = aisleobj.fields.find(x => x.uuid === currentfield.rightSideFieldDto.rightFloorFieldInfo.uuid);
                    fieldlist.push(structuredClone(rightobj));

                    if(rightobj.rightSideFieldDto){
                        let rightobjnext = aisleobj.fields.find(x => x.uuid === rightobj.rightSideFieldDto.rightFloorFieldInfo.uuid);
                        fieldlist.push(structuredClone(rightobjnext));

                        if(rightobjnext.rightSideFieldDto){
                            let rightobjnext2 = aisleobj.fields.find(x => x.uuid === rightobjnext.rightSideFieldDto.rightFloorFieldInfo.uuid);
                            fieldlist.push(structuredClone(rightobjnext2));
                        } else{
                            isleftcheck = true;
                        }

                    } else{
                        isleftcheck = true;
                    }

                } else{
                    isleftcheck = true;
                }

                if(isleftcheck && currentfield.leftSideFieldDto && currentfield.leftSideFieldDto.leftFloorFieldInfo){
                    let leftobj = aisleobj.fields.find(x => x.uuid === currentfield.leftSideFieldDto.leftFloorFieldInfo.uuid);
                    fieldlist.unshift(structuredClone(leftobj));

                    if(fieldlist.length < 4 && leftobj.leftSideFieldDto){
                        let leftobjnext = aisleobj.fields.find(x => x.uuid === leftobj.leftSideFieldDto.leftFloorFieldInfo.uuid);
                        fieldlist.unshift(structuredClone(leftobjnext));

                        if(fieldlist.length < 4 && leftobjnext.leftSideFieldDto){
                            let leftobjnext2 = aisleobj.fields.find(x => x.uuid === leftobjnext.leftSideFieldDto.leftFloorFieldInfo.uuid);
                            fieldlist.unshift(structuredClone(leftobjnext2));
                        }
                    }
                }

                break;
            }
        }

        return structuredClone(fieldlist);
    }

    handleFieldBar = (evt, type) => {
        this.planoChangeHappen();
        var ctxt = type===1?evt.value:evt.target.value;
        var cobj = this.state.QRobj;
        if (type === 1) {
            ctxt = (ctxt > 0 ? parseFloat(ctxt) : 0);
            var depList = this.state.loadedDeptList.find(x => x.departmentId === ctxt);
            if (depList) {
                cobj.department = {
                    departmentId: depList.departmentId,
                    color: depList.color,
                    name: depList.name,
                    noInFloorLayout: null
                };
                cobj.noInFloorLayout = null;
                //locationchange
                cobj.isFieldLocationChange = true;
                // console.log(this.state.cobj);

            }
        } else if (type === 3) {
            var selectednames = [];

            for (var i = 0; i < this.state.rects.length; i++) {
                if(!this.state.rects[i].isDelete){
                    for (let index = 0; index < this.state.rects[i].fields.length; index++) {
                        if(!this.state.rects[i].fields[index].isDelete){
                            var department = this.state.rects[i].fields[index].department;
    
                            if (department) {
                                var departmentid = department.departmentId;
                                // console.log(departmentid);
                                // console.log(this.state.QRobj.department.departmentId);
                                // console.log(this.state.rects[i].fields[0]);
        
                                if (departmentid === this.state.QRobj.department.departmentId) {
                                    selectednames.push(this.state.rects[i].fields[index].noInFloorLayout)
                                    // console.log(this.state.rects[i].fields[0].noInFloorLayout);
        
                                }
                                // console.log(selectednames);
        
                            }
                        }
                       
    
                    }
                    // console.log(this.state.rects[i].fields[0].department);
                }
               
            }


            ctxt = (ctxt > 0 ? parseFloat(ctxt) : 0);
            // console.log(this.state.loadedFnamenumbers);
            // var loadedfno= this.state.loadedFnamenumbers.filter(el => {
            //     return selectednames.indexOf(el) < 0;
            // });
            var slename = selectednames.filter(x => x === ctxt);
            if (slename.length > 0) {
                alertService.warn(this.props.t('ALREADY_ADDED'));
                return false;
            } else {
                var depList2 = this.state.loadedFnamenumbers.find(x => x === ctxt);
                // console.log(depList);

                if (depList2) {
                    cobj.noInFloorLayout = depList2
                    cobj.isFieldLocationChange = true;

                }
            }
            // console.log(slename);
            /* for (var i = 0; i < selectednames.length; i++) {
                if (ctxt === selectednames[i]) {
                    alertService.warn("Already added")

                    cobj.noInFloorLayout = 15

                } else {

                    var depList = this.state.loadedFnamenumbers.find(x => x === ctxt);
                    // console.log(depList);

                    if (depList) {
                        cobj.noInFloorLayout = depList
                    }

                }
            } */

        }
        else if (type === 2) {
            cobj.notes = ctxt;
            //locationchange

        }
        // console.log(cobj);

        this.setState({ QRobj: cobj, isFieldSaved: false }, () => {
            // console.log(this.state.QRobj);

        });
    }

    // handlePlanogramDelete = (resp) => {
    //     if(resp && resp.status){
    //         alertService.success("Successfully product deleted");
    //         this.props.history.push("/products");
    //     } else{
    //         alertService.error((resp&&resp.extra?resp.extra:resp.msg?resp.msg:"Error occurred"));
    //     }
    // }

    rotatecartisean = (cx, cy, x, y, angle) => {
        var radians = (Math.PI / 180) * angle,
            cos = Math.cos(radians),
            sin = Math.sin(radians),
            nx = (cos * (x - cx)) + (sin * (y - cy)) + cx,
            ny = (cos * (y - cy)) - (sin * (x - cx)) + cy;
        return { x: nx, y: ny };
    }
    //select isle
    handleselectisle = () => {
        if (this.state.QRisle.fields.length > 1) {
            //if already select isle restore previous isle
            if (this.state.selectedIsle !== null) {
                alertService.warn("Please Save Isle movement")
            } else {
                //set previewrect
                var height = 0;
                var width = 0;
                var oriheight = 0;
                var oriwidth = 0;
                var rotation = 0;
                var x = 0; var y = 0;
                var x2 = 0; var y2 = 0;
                var cornewidth = 0; var cornerdepth = 0; var cornewidth2 = 0; var cornerdepth2 = 0;
                for (let i = 0; i < this.state.QRisle.fields.length; i++) {
                    const element = this.state.QRisle.fields[i];
                    //not get deleted one
                    if (!element.isDelete) {
                        oriheight = element.height;
                        oriwidth +=element.width;
                        height = element.drawDepth;
                        width += element.drawWidth;
                        rotation = element.rotation;
                    }
                    //find right side coner of isle
                    if (element.rightSideFieldDto === null || element.rightSideFieldDto === undefined || element.rightSideFieldDto.isDelete === true) {
                        x = element.x;
                        y = element.y;
                        cornewidth = element.drawWidth; cornerdepth = element.drawDepth
                    }
                    //find left side coner of isle
                    if (element.leftSideFieldDto === null || element.leftSideFieldDto === undefined || element.leftSideFieldDto.isDelete === true) {
                        x2 = element.x;
                        y2 = element.y;
                        cornewidth2 = element.drawWidth; cornerdepth2 = element.drawDepth
                    }
                }
                //centers of start and end fileds
                var cx = x + cornewidth / 2
                var cy = y + cornerdepth / 2
                var cx2 = x2 + cornewidth2 / 2
                var cy2 = y2 + cornerdepth2 / 2
                //get isles corner points
                var pointsforfieldstart = this.rotatecartisean(cx, cy, x, y + cornerdepth / 2, rotation * -1)
                var pointsforfieldend = this.rotatecartisean(cx2, cy2, x2, y2 + cornerdepth2 / 2, (rotation - 180) * -1)
                //isle's center points
                var islecenterx = (pointsforfieldend.x + pointsforfieldstart.x) / 2;
                var islecentery = (pointsforfieldend.y + pointsforfieldstart.y) / 2;
                // x=(x+cornewidth/2)-width/2
                // y=y+(width/2-cornewidth/2);
                var prevrect = {
                    itype: "preview",
                    f_uuid: this.state.QRisle.f_uuid,
                    isDelete: false,
                    fields: [{
                        isDelete: false,
                        drawDepth: height,
                        drawWidth: width,
                        height:oriheight,
                        width:oriwidth,
                        rotation: rotation,
                        x: islecenterx - width / 2,
                        y: islecentery - height / 2
                    }]
                }
                //remove selected isle from rects
                var rectswithoutselectedisle = this.state.rects.filter(x => x.f_uuid !== this.state.QRisle.f_uuid);
                rectswithoutselectedisle.push(prevrect);
                
                this.setState({ selectedIsle: this.state.QRisle, rects: rectswithoutselectedisle, selectedIslepreview: prevrect });
            }
        } else {
            alertService.warn("To select isle At least 2 fields needed")
        }
    }
    // set isle changesto fields
    handleislechange = () => {
        var rects = this.state.rects
        for (let i = 0; i < rects.length; i++) {
            const rect = rects[i];
            if (rect.itype) {
                this.setfielddetailsfromisle(rect.fields[0]);
                break
            }
        }
    }
    //set isle xy chnges to fields
    setfielddetailsfromisle = (rect) => {
        var cix = rect.x + rect.drawWidth / 2;
        var ciy = rect.y + rect.drawDepth / 2;
        var silsefields = this.state.selectedIsle.fields;
        var islestartcenter = this.rotatecartisean(cix, ciy, rect.x, rect.y + rect.drawDepth / 2, rect.rotation * -1);
        var firstfmiddlex = 0; var firstfmiddley = 0;
        var fdrawx = 0; var fdrawy = 0; var angleofstart = 0;
        var newfields = [];
        var nextid = null
        var fulldistance = 0
        for (let i = 0; i < silsefields.length; i++) {
            const field = silsefields[i];
            //geting 1st field
            if (field.rightSideFieldDto === null || field.rightSideFieldDto === undefined || field.rightSideFieldDto.isDelete === true) {
                firstfmiddlex = islestartcenter.x + (field.drawWidth / 2 * Math.cos((Math.PI / 180) * rect.rotation))
                firstfmiddley = islestartcenter.y + (field.drawWidth / 2 * Math.sin((Math.PI / 180) * rect.rotation))
                //drwingxy
                fdrawx = firstfmiddlex - field.drawWidth / 2;
                fdrawy = firstfmiddley - field.drawDepth / 2;
                nextid = (field.leftSideFieldDto.leftFloorFieldId === -1) ? field.leftSideFieldDto.leftFloorFieldUUID : field.leftSideFieldDto.leftFloorFieldId
                //push start field
                angleofstart = rect.rotation
                fulldistance = fulldistance + field.drawWidth / 2
                // console.log(field.drawWidth, fulldistance);
                field.rotation = rect.rotation;
                field.x = fdrawx;
                field.y = fdrawy;
                newfields.push(field);
                break;
            }
        }
        while (nextid !== null) {
            for (let i = 0; i < silsefields.length; i++) {
                const nfield = silsefields[i];
                if (nfield.f_uuid === nextid || nfield.id === nextid) {
                    //do setting x y
                    fulldistance = fulldistance + nfield.drawWidth / 2
                    var newmiddlex = firstfmiddlex + (fulldistance * Math.cos((Math.PI / 180) * angleofstart))
                    var newmiddley = firstfmiddley + (fulldistance * Math.sin((Math.PI / 180) * angleofstart))
                    nfield.rotation = angleofstart;
                    nfield.x = newmiddlex - nfield.drawWidth / 2;
                    nfield.y = newmiddley - nfield.drawDepth / 2;
                    newfields.push(nfield);
                    //setting nextid
                    if (nfield.leftSideFieldDto === null || nfield.leftSideFieldDto === undefined || nfield.leftSideFieldDto.isDelete === true) {
                        nextid = null
                    } else {
                        nextid = (nfield.leftSideFieldDto.leftFloorFieldId === -1) ? nfield.leftSideFieldDto.leftFloorFieldUUID : nfield.leftSideFieldDto.leftFloorFieldId
                    }
                    //remain distance half add
                    fulldistance = fulldistance + nfield.drawWidth / 2
                    break;
                }
            }
        }
        var selectedisle = this.state.selectedIsle
        selectedisle.fields = newfields
        var newrectset = this.state.rects.filter(x => x.itype !== "preview");
        newrectset.push(selectedisle);
        
        this.setState({ rects: newrectset, selectedIsle: null })
    }
    //delete field
    handleToggleDelete = () => {
        var curproduct = this.state.QRobj;
        var allowdelete = true

        if (curproduct.isProductOverLapping) {
            allowdelete = false;
        }
        if (curproduct.leftSideFieldDto) {
            if (curproduct.leftSideFieldDto.leftFloorFieldInfo) {
                if (curproduct.leftSideFieldDto.leftFloorFieldInfo.isProductOverLapping) {
                    allowdelete = false;
                }
            }
        }

        if (allowdelete) {
            confirmAlert({
                title: this.props.t('CONFIRM_TO_DELETE_FIELD'),
                message: this.props.t('ARE_YOU_SURE_REMOVE_THIS_FIELD_FROM_FLOOR'),
                overlayClassName: (this.props.isRTL === "rtl" ? "alertrtl-content" : ""),
                buttons: [{
                    label: this.props.t('btnnames.yes'),
                    onClick: () => {
                        var currprod = this.state.QRobj;
                        var middledelete = false;
                        var callrectdata = this.state.rects;
                        var prevleftbeforedelete;
                        var dlisle
                        this.planoChangeHappen();
                        for (var i = 0; i < callrectdata.length; i++) {

                            const element1 = callrectdata[i].fields;

                            // console.log(element1.length);
                            for (let index = 0; index < element1.length; index++) {

                                // const element = element1[index];
                                var side;
                                if (callrectdata[i].fields[index].f_uuid === currprod.f_uuid) {

                                    var filterdelem = element1.filter(x => x.isDelete === false);
                                    if (filterdelem.length > 1) {
                                        //var deletenow = false;
                                        if (element1[index].rightSideFieldDto || element1[index].leftSideFieldDto) {

                                            if ((element1[index].rightSideFieldDto && (element1[index].rightSideFieldDto.isDelete !== true)) && (element1[index].leftSideFieldDto && (element1[index].leftSideFieldDto.isDelete !== true))) {
                                                // if(element[index].rightSideFieldDto.isDelete==false){
                                                middledelete = true;
                                                var left = "left";
                                                var right = "right";
                                                dlisle = callrectdata[i]
                                                prevleftbeforedelete = element1[index].leftSideFieldDto
                                                this.removeconnection(element1[index].rightSideFieldDto.rightFloorFieldId, element1[index].rightSideFieldDto.rightFloorFieldUUID, left, callrectdata[i]);
                                                this.removeconnection(element1[index].leftSideFieldDto.leftFloorFieldId, element1[index].leftSideFieldDto.leftFloorFieldUUID, right, callrectdata[i]);


                                                // }

                                            } else {

                                                if (element1[index].rightSideFieldDto && (element1[index].rightSideFieldDto.isDelete !== true)) {
                                                    //console.log("this is rightside");
                                                    // var idofconnected = (element1[index].rightSideFieldDto.rightFloorFieldId > 0) ? element1[index].rightSideFieldDto.rightFloorFieldId : element1[index].rightSideFieldDto.rightFloorFieldUUID;
                                                    side = "left"

                                                    this.removeconnection(element1[index].rightSideFieldDto.rightFloorFieldId, element1[index].rightSideFieldDto.rightFloorFieldUUID, side, callrectdata[i]);
                                                    // if(element1[index].rightSideFieldDto.isDelete){

                                                    // element[index].rightSideFieldDto = {rightFloorFieldId:id,rightFloorFieldUUID:nffuid,isNew:isnew};
                                                    // }
                                                } else if (element1[index].leftSideFieldDto && (element1[index].leftSideFieldDto.isDelete !== true)) {
                                                    //console.log("this is leftside");
                                                    side = "right"
                                                    this.removeconnection(element1[index].leftSideFieldDto.leftFloorFieldId, element1[index].leftSideFieldDto.leftFloorFieldUUID, side, callrectdata[i]);
                                                }
                                            }

                                        } else {

                                        }

                                        if (callrectdata[i].fields[index].id > 0) {
                                            //console.log("field delete");
                                            callrectdata[i].fields[index].isDelete = true;
                                        } else {
                                            callrectdata[i].fields.splice(index, 1);
                                        }
                                    } else {


                                        //console.log("isle delete");


                                        if (callrectdata[i].id > 0) {
                                            callrectdata[i].isDelete = true;
                                        } else {
                                            callrectdata.splice(i, 1);
                                        }

                                    }
                                }

                            }

                        }





                        // console.log(callrectdata);
                        this.setState({ rects: callrectdata, isviewcmenu: false, contxtmenu: null }, () => {
                            //console.log(this.state.rects);
                        });
                        this.hideQRsidebar();
                        if (middledelete) {
                            this.newislemiddleremoveleft(prevleftbeforedelete, dlisle)
                        }

                    }
                }, {
                    label: this.props.t('btnnames.no')
                }
                ]
            });
        } else {
            alertService.error(this.props.t('CANNODELETE_HAS_OVELAP_PRODUCT'))
        }


    }

    newislemiddleremoveleft = (left, isle) => {
        //console.log(left);
        let thisLeft = left;
        // var leftid = thisLeft.leftFloorFieldId;
        var addlist = []
        var selectitem;
        // var isleftdto = true
        for (let i = 0; i < isle.fields.length; i++) {
            let curthisleft = thisLeft; //new - 22/09/02 added
            if (curthisleft) {
                if (curthisleft.leftFloorFieldId > 0) {
                    selectitem = isle.fields.find(x => x.id === curthisleft.leftFloorFieldId);
                } else {
                    selectitem = isle.fields.find(x => x.f_uuid === curthisleft.leftFloorFieldUUID);
                }
                //console.log(selectitem);
                if (selectitem) {
                    addlist.push(selectitem);
                    if ((selectitem.leftSideFieldDto) && (selectitem.leftSideFieldDto.isDelete !== true)) {
                        thisLeft = selectitem.leftSideFieldDto
                        selectitem = null;
                        i = 0;
                    } else {
                        break;
                    }
                }
            }
        }
        var filtered = isle.fields.filter(
            function (e) {
                return this.indexOf(e) < 0;
            },
            addlist
        );
        var existingislefields = filtered
        //console.log(existingislefields);
        var data_obj = {
            id: -1,
            f_uuid: uuidv4(),
            // uuid: uuidv4(),
            // name: draggingProduct.fieldName,
            // x: snap.x,
            // y: snap.y,
            uom: this.props.drawuom,
            rotation: 0,
            width: 0,
            height: 0,
            // ftypeid: draggingProduct.id,
            // src: draggingProduct.imageUrl,
            fill: "red",

            // shelfID: svg.id,
            // actualWidth: dropDUWidth,
            // actualHeight: dropDUHeight,
            fields: addlist,
            isNew: true, isDelete: false,
        }
        var dlteisle = this.state.rects.find(x => x.f_uuid === isle.f_uuid);
        dlteisle.fields = existingislefields;
        this.state.rects.push(data_obj)
        // console.log(dlteisle, data_obj, existingislefields);

    }

    removeconnection = (id, fuuid, side, isle) => {
        //console.log(id, fuuid, side, isle);
        for (let i = 0; i < isle.fields.length; i++) {
            const element = isle.fields[i];
            //console.log("iiiiiiiiii");
            if (id > 0) {

                if (element.id === id) {
                    if (side === "left") {
                        element.leftSideFieldDto.isDelete = true;
                        element.leftSideFieldDto.isNew = false;
                        element.isLeftChange = true;
                    } else {
                        element.rightSideFieldDto.isDelete = true;
                        element.rightSideFieldDto.isNew = false;
                        element.isRightChange = true;
                    }

                }
            } else {
                //console.log("hhhhhhhhhhhhhhhhj");
                if (element.f_uuid === fuuid) {

                    if (side === "left") {
                        //console.log("on left yass");
                        element.leftSideFieldDto = null
                    } else {
                        element.rightSideFieldDto = null
                    }

                }

            }

        }
    }

    handleViewField = () => {
        this.setState({ isviewcmenu: false, contxtmenu: null }, () => {
            this.showQRsidebar();
        });
    }

    qrPrintPDF = () => {
        // var cobj = this.state.QRobj;
        // var input = document.getElementById("qrcontent2");
        // const pdf = new jsPDF('p', 'mm', [100, 70]);
        // //pdf.setFontSize(10);
        // //pdf.text((cobj.uuid), 50, 55, 'right');
        // //pdf.text((cobj.department.name), 50, 60, 'right');
        // pdf.html(input, { html2canvas: { scale: 0.35 } }).then(() => {
        //   pdf.save(cobj.uuid+'.pdf');
        // });

        var cobj = this.state.QRobj;
        htmlToImage.toBlob(document.getElementById('qrcontent2'))
            .then(function (blob) {
                window.saveAs(blob, cobj.uuid + '.png');
            });
    }
    rotatetoleft = () => {
        if (!this.state.planoLock) { this.btnRotate(-45) } else { alertService.warn(this.props.t("PLANOGRAMIS_LOCKED")) }

    }
    rotatetoright = () => {
        if (!this.state.planoLock) { this.btnRotate(45) } else { alertService.warn(this.props.t("PLANOGRAMIS_LOCKED")) }
    }
    btnRotate = (side) => {
        // console.log( this.state.prevrotation);
        btnrotaion = true;
        let newRotation = this.state.prevrotation + side;
        // Need to offset by 1 before the modulo since it works between 0-359
        newRotation = (((newRotation) - 1) % 360) + 1;
        if (newRotation <= 0) newRotation += 360;
        var newr = (Math.round(newRotation / 15)) * 15;
        var rotobj = this.state.rotationobj;
        rotobj["rotation"] = (newr===360)?0:newr//newr


        var allowRotation=this.rotationCheckAllow(rotobj)
        if(!allowRotation){
            alertService.warn(this.props.t("ROTATE_OVERLAPPING_MESSAGE"))
            rotobj["rotation"] = JSON.parse(JSON.stringify(this.state.prevrotation));
        }else{
            //rotation add to change inplano
            rotobj["isRotaionChange"]=true
            this.planoChangeHappen()
        }
        //end
        
        //if isle rotation
        if(this.state.isIsleSelected){
            this.drawrotatedFieldsforAisle(rotobj.f_uuid)
        }
        this.setState({
            rotationobj: rotobj,
            prevrotation: (!allowRotation)?this.state.prevrotation:(newr===360)?0:newr// prevrotation: newr
        })
        btnrotaion = false;
    }
    rotationCheckAllow=(rotobj)=>{
        var allow=true
        //start check overlaping with other fields/isles
        var isles = this.state.rects
        var allowToAdd = true;
        
        if(this.state.isIsleSelected){
            //check overlaping with other isles
            var filterIsleRects = this.state.IsleRects.filter(x => x.isDelete !== true);
            if (filterIsleRects.length > 0) {
                    for (let i = 0; i < filterIsleRects.length; i++) {
                        var rectAllow = true;
                        if (filterIsleRects[i].f_uuid !== rotobj.f_uuid) {
                            rectAllow = this.checkThroughProducts2(rotobj.x, rotobj.y, rotobj.drawWidth, rotobj.drawDepth, filterIsleRects[i], rotobj.rotation);
                        }
                        if (!rectAllow) {
                            allowToAdd = false
                            break;
                        }
                    }
            }
        }else{
            //check overlaping with other fields
            var filterIsles = isles.filter(x => x.isDelete === false);
            if (filterIsles.length > 0) {
                for (let index = 0; index < filterIsles.length; index++) {
                    const rect = filterIsles[index];
                    const filterFields = rect.fields.filter(x => x.isDelete === false);
                    for (let i = 0; i < filterFields.length; i++) {
                        var rectAllow2 = true;
                        if (filterFields[i].f_uuid !== rotobj.f_uuid) {
                            rectAllow2 = this.checkThroughProducts2(rotobj.x, rotobj.y, rotobj.drawWidth, rotobj.drawDepth, filterFields[i], rotobj.rotation);
                        }
                        if (!rectAllow2) {
                            allowToAdd = false
                            break;
                        }
                    }
                }
            }
        }
         //check overlaping with margin of floor
        var isInsideofFloorSnap=checkIsInsideofBox(this.state.viewWidth, this.state.viewHeight, 0, 0,rotobj.drawWidth, rotobj.drawDepth, rotobj.x, rotobj.y,rotobj.rotation)

        if(!allowToAdd||!isInsideofFloorSnap){
            allow=false
        }
        return allow

    }

    handlerotationStart = (e, val, obj, ref, rot) => {
        //console.log(this.state.zoompanactive , this.state.startpan);
        if(this.state.zoompanactive && this.state.activetool === "pantool"){
            alertService.error(this.props.t("disable_pan"));
            return false;
        }

        btnrotaion = false;
        dragrotation = true;
        this.setState({ rotationAngel: rot }, () => {
            let checklist = (this.state.isIsleSelected?this.state.IsleRects:this.state.rects);

            let startrotate;
            for (let i = 0; i < checklist.length; i++) {
                let elem = checklist[i];

                if(this.state.isIsleSelected){
                    startrotate = (elem.f_uuid === obj.f_uuid?elem:startrotate);
                } else{
                    let findfieldavailable = elem.fields.find(x => x.f_uuid === obj.f_uuid);

                    if(findfieldavailable){
                        startrotate = findfieldavailable;
                    }
                }
            }
            
            this.setState({
                rotationobj: obj,
                rotateStart: val,
                rotationstartx: e.pageX,
                currentSelectedRef: ref,
                prevrotation: (startrotate ? startrotate.rotation : 0)

            })
        })

    }
    
    handleEndrotation = (e) => {
        //console.log(btnrotaion);
        if (btnrotaion === false && dragrotation === true) {
            if (this.state.rotationobj) {
                let obj = this.state.rotationobj;
                let checklist = (this.state.isIsleSelected?this.state.IsleRects:this.state.rects);

                let startrotate;
                for (var i = 0; i < checklist.length; i++) {
                    let elem = checklist[i];

                    if(this.state.isIsleSelected){
                        startrotate = (elem.f_uuid === obj.f_uuid?elem:startrotate);
                    } else{
                        let findfieldavailable = elem.fields.find(x => x.f_uuid === obj.f_uuid);
    
                        if(findfieldavailable){
                            startrotate = findfieldavailable;
                        }
                    }
                }
                obj["rotation"] = this.state.rotationAngel;

                // //check overlaping with other fields/isles
                // var isles = this.state.rects
                // var allowToAdd = true;
                
                // if(this.state.isIsleSelected){
                //     //check overlaping with other isles
                //     var filterIsleRects = this.state.IsleRects.filter(x => x.isDelete !== true);
                //     if (filterIsleRects.length > 0) {
                //             for (let i = 0; i < filterIsleRects.length; i++) {
                //                 var rectAllow = true;
                //                 if (filterIsleRects[i].f_uuid !== obj.f_uuid) {
                //                     rectAllow = this.checkThroughProducts2(obj.x, obj.y, obj.drawWidth, obj.drawDepth, filterIsleRects[i], obj.rotation);
                //                 }
                //                 if (!rectAllow) {
                //                     allowToAdd = false
                //                     break;
                //                 }
                //             }
                //     }
                // }else{
                //     //check overlaping with other fields
                //     var filterIsles = isles.filter(x => x.isDelete === false);
                //     if (filterIsles.length > 0) {
                //         for (let index = 0; index < filterIsles.length; index++) {
                //             const rect = filterIsles[index];
                //             const filterFields = rect.fields.filter(x => x.isDelete === false);
                //             for (let i = 0; i < filterFields.length; i++) {
                //                 // console.log(filterFields[i]);
                //                 var rectAllow2 = true;
                //                 if (filterFields[i].f_uuid !== obj.f_uuid) {
                //                     rectAllow2 = this.checkThroughProducts2(obj.x, obj.y, obj.drawWidth, obj.drawDepth, filterFields[i], obj.rotation);
                //                 }
                //                 if (!rectAllow2) {
                //                     allowToAdd = false
                //                     break;
                //                 }
                //             }
                //         }
                //     }
                // }
                //  //check overlaping with margin of floor
                // var isInsideofFloorSnap=checkIsInsideofBox(this.state.viewWidth, this.state.viewHeight, 0, 0,obj.drawWidth, obj.drawDepth, obj.x, obj.y,obj.rotation)

                // if(!allowToAdd||!isInsideofFloorSnap){
                //     obj["rotation"] = JSON.parse(JSON.stringify(this.state.prevrotation));
                // }
                // //

                var allowRotation=this.rotationCheckAllow(obj)
                if(!allowRotation){
                    obj["rotation"] = JSON.parse(JSON.stringify(this.state.prevrotation));
                }else{
                    obj["isRotaionChange"]=true
                    //rotation add to change inplano
                    this.planoChangeHappen()
                }

                this.setState({
                    rotationobj: obj,
                    rotateStart: false,
                    prevrotation: (startrotate ? startrotate.rotation : 0)

                }, () => {
                    if(this.state.isIsleSelected){
                        this.drawrotatedFieldsforAisle(this.state.rotationobj.f_uuid)
                    }
                })
            }
        }
        
        dragrotation = false;
    }
    drawrotatedFieldsforAisle=(ailefuuid,)=>{
        let aislerects=this.state.IsleRects
        let selectedAisle=aislerects.find(x=>x.f_uuid===ailefuuid)
        let allisles = this.state.rects;
        if(selectedAisle){
            // console.log(selectedAisle);
            for (let index = 0; index < allisles.length; index++) {
                const aisle = allisles[index];
                if(aisle.f_uuid===ailefuuid){
                    for (let i = 0; i < aisle.fields.length; i++) {
                        const field = aisle.fields[i];
                        let centeroffield={
                            x:field.x+(field.drawWidth/2),
                            y:field.y+(field.drawDepth/2)
                        }
                        // console.log(centeroffield);
                       
                        if(field.rotation!==0){
                            var rot=(360-field.rotation)
                            // console.log(rot);
                            let FieldnoangleNewCenter = this.XYpointfromTriangleAnglenRadiasnstartpoint(rot, centeroffield.x, centeroffield.y, selectedAisle.centerx, selectedAisle.centery)
                            centeroffield["x"]=FieldnoangleNewCenter.x
                            centeroffield["y"]=FieldnoangleNewCenter.y
                        }
                        // console.log(centeroffield);
                        // console.log(selectedAisle);
                        var rotaionofAisle=selectedAisle.rotation-field.rotation
                        // console.log(field.rotation);
                        // console.log(selectedAisle.rotation);
                        // console.log(rotaionofAisle);
                        var sendrotaion=0
                        if(field.rotation!==0){
                            sendrotaion=selectedAisle.rotation
                        }else{
                            sendrotaion=rotaionofAisle
                        }
                        let FieldNewCenter = this.XYpointfromTriangleAnglenRadiasnstartpoint(sendrotaion, centeroffield.x, selectedAisle.centery, selectedAisle.centerx, selectedAisle.centery)
                        // let newfieldX=FieldNewCenter.x-(field.drawWidth/2)
                        // let newfieldY=FieldNewCenter.y-(field.drawDepth/2)
                        let newfieldX=FieldNewCenter.x-(field.drawWidth/2)
                        let newfieldY=FieldNewCenter.y-(field.drawDepth/2)
                        field["x"]=newfieldX
                        field["y"]=newfieldY
                        field["rotation"]=selectedAisle.rotation
                        field["isRotaionChange"]=true
                    }
                    break
                }
                
            }
            this.setState({rects:allisles})
        }

    }
    handlerotation = (e) => {


        if (this.state.rotateStart === true) {

            // var startrotate=(this.state.rects).find(x=>x.f_uuid===this.state.rotationobj.f_uuid);
            // console.log((this.state.rects));
            // console.log("startx");
            // console.log((startrotate.rotation));
            //  this.state.rotationAngel=
            //  console.log(e.screenX-this.state.rotationstartx);

            const offset = 360 * (e.pageX - this.state.rotationstartx) / this.svgfile.current.clientWidth;
            //  console.log(this.svgfile.current.clientWidth);



            let newRotation = this.state.prevrotation + offset;
            // Need to offset by 1 before the modulo since it works between 0-359
            newRotation = (((newRotation) - 1) % 360) + 1;
            if (newRotation <= 0) newRotation += 360;

            var newr = (Math.round(newRotation / 15)) * 15;
            this.setState({ rotationAngel: (newr === 360) ? 0 : newr }, () => {
                var ref = this.state.currentSelectedRef
                // console.log(e);
                // console.log(this.state.rotationAngel);


                // console.log("ref", ref)
                if (ref) {
                    // ref.setAttribute('transform',"translate(" + (( this.state.rotationobj.x - this.state.rotationobj.width / 2)) + "," + (( this.state.rotationobj.y - this.state.rotationobj.height / 2)) + ") rotate(" + this.state.rotationAngel + " " + (this.state.rotationobj.x + this.state.rotationobj.width / 2) + " " + (this.state.rotationobj.y + this.state.rotationobj.height / 2) + ")")
                    // ref.transform =
                }
            });

            // console.log(this.state.rotationAngel);
            var rotobj = this.state.rotationobj;
            rotobj["rotation"] = this.state.rotationAngel
            this.setState({
                rotationobj: rotobj,


            }, () => {
                // console.log(this.state.rotationobj);
            })

        }
    }

    //filter search
    handleSearchTags = (searchtxt) => {
        if(this._tagSearchTimeout){
            clearTimeout(this._tagSearchTimeout);
        }
        /* if (this.state.stobj.tagName === "") {
            return false;
        } */

        this._tagSearchTimeout = setTimeout(() => {
            let searchobj = this.state.stobj;
            searchobj.tagName = searchtxt;

            this.setState({ loadingTagView: true, toridata: [] }, () => {
                submitSets(submitCollection.searchTags, searchobj, true).then(res => {
                    if (res.status === true) {
                        if (res.extra.length < 1) {
                            alertService.warn(this.props.t('NO_TAGS_FOUND'));
                        }
                        this.setState({ toridata: res.extra });
                    }

                    this.setState({ loadingTagView: false });
                });
            });
        }, 1000);
    }

    addTag(index) {
        var tAddedArray = (this.state.addedTags && this.state.addedTags.length > 0 ? this.state.addedTags : []);
        for (let i = 0; i < tAddedArray.length; i++) {
            if (tAddedArray[i].isDelete === false) {
                if (tAddedArray[i].tagDto.id === this.state.toridata[index].id) {
                    alertService.warn(this.props.t('ALREADY_ADDED'));
                    return false;
                }
            }
        }

        var tagobj = {};
        tagobj.id = -1;
        tagobj.tagDto = { id: this.state.toridata[index].id, tagName: this.state.toridata[index].tagName };
        tagobj.isNew = true;
        tagobj.isDelete = false;
        tAddedArray.push(tagobj);

        this.setState({ addedTags: tAddedArray }, () => {
            this.planoChangeHappen();
        });
    }


    removeTag(index) {
        var tAddedArray = this.state.addedTags;
        if (tAddedArray[index].isNew === true) {
            tAddedArray.splice(index, 1);
        } else {
            tAddedArray[index].isDelete = true;
        }
        
        this.setState({ addedTags: tAddedArray }, () => {
            this.planoChangeHappen();
        });
    }

    changeNewTag = (ctype, cvalue) => {
        let cnewobj = this.state.newtag;
        cnewobj[ctype] = cvalue;

        this.setState({ newtag: cnewobj });
    }

    handleTagSave(evt) {
        if(evt.which === 13){
            if(this.state.newtag && this.state.newtag.tagName && this.state.newtag.tagName !== ""){
                this.setState({ loadingTagView: true }, () => {
                    submitSets(submitCollection.saveTags, this.state.newtag, false).then(res => {
                        if (res.status === true) {
                            var temstobj = this.state.stobj;
                            temstobj.tagName = this.state.newtag.tagName;
    
                            this.setState({ stobj: temstobj, newtag: { tagName: "", type:"planogram" } });
                            this.handleSearchTags(temstobj.tagName);
                        } else {
                            // alertService.error(res.extra);

                            if(res.validation){
                            
                                let codeMessage = this.props.t(res.validation.code);
                    
                                if(res.validation.msgParams && res.validation.msgParams.length > 0){
                                    
                                    let filledMessage = codeMessage.replace(/\[\$\]/g, () => res.validation.msgParams.shift());
                    
                                    res.validation.type === "error" ? alertService.error(filledMessage) : alertService.warn(filledMessage);
                    
                                }else{
                                    res.validation.type === "error" ? alertService.error(codeMessage) : alertService.warn(codeMessage);
                                }
                    
                            }else{
                                alertService.error(this.props.t("ERROR_OCCURRED"));
                            }
                        }

                        this.setState({ loadingTagView: false });
                    });
                })
            }
        }
    }

    handleTagSwitch = () => {
        var type = (this.state.tagModalType === 1 ? 2 : 1);
        this.setState({ tagModalType: type, stobj: { tagName: "", type:"planogram" }, newtag: { tagName: "", type:"planogram" }, toridata: [] });
    }

    showShareModal = () => {
        this.setState({ shareModalShow: !this.state.shareModalShow });
    }

    hideShareModal = () => {
        this.setState({ shareModalShow: false });
    }

    qrShare = () => {
        var cqrobj = this.state.QRobj;
        var cqrshare = this.state.qrShareObj;

        if (cqrshare) {
            if (cqrshare.email && emailvalidator(cqrshare.email)) {
                htmlToImage.toBlob(document.getElementById('qrcontent2')).then((blob) => {
                    //console.log(blob);
                    //window.saveAs(blob, 'my-node.png');
                    var reader = new FileReader();
                    reader.readAsDataURL(blob);
                    reader.onloadend = () => {
                        var base64data = reader.result;
                        // var shtml = { email: base64data };
                        //var searchDisplayUnit = { ptype: "POST", url: "http://192.168.1.5:8080/service/planogram/sendmail", queryparam: false, data: true, auth: true };
                        var searchDisplayUnit = submitCollection.sendQREmail;

                        var cobj = { email: cqrshare.email, img: base64data, floorFieldId: cqrobj.id };

                        submitSets(searchDisplayUnit, cobj, true).then(res => {
                            if (res && res.status) {
                                alertService.success(this.props.t('SUCCESSFULLY_QR_DETAILS_EMAILD'));
                                cqrshare.email = "";
                                this.setState({ qrShareObj: cqrshare });
                                this.showShareModal();
                            } else {
                                alertService.error(this.props.t('ERROR_OCCURRED'));
                            }
                        });
                    }
                });
            } else {
                alertService.error(this.props.t('ENTER_VALID_EMAIL'));
            }
        }
    }

    handleChangeShareEmail = (event,value) => {
        // console.log("done")
        // var ctxt = event.target.value;
        const inputValue = event.target.value;
        let length = countTextCharacter(event.target.value);
        const atSymbolCount = (inputValue.match(/@/g) || []).length;

        if(length > maxInputLengthforEmail ){
          alertService.error(this.props.t('Character.email'))
          event.preventDefault()
          return
        }

        if(atSymbolCount > 1){
          event.preventDefault()
          return
        }
        var shareObj = {...this.state.qrShareObj};
        shareObj.email = value;
        this.setState({ qrShareObj: shareObj });
    }

    convertDateText = (datetxt) => {
        var months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        var datestring = ""
        if (datetxt !== null && datetxt !== undefined) {
            var mdate = new Date(datetxt);
            datestring = (months[mdate.getMonth()] + " " + ('0' + mdate.getDate()).slice(-2) + " " + mdate.getFullYear() + " " + ('0' + mdate.getHours()).slice(-2) + ":" + ('0' + mdate.getMinutes()).slice(-2) + ":" + ('0' + mdate.getSeconds()).slice(-2));
        }
        return datestring;
    }
    getBase64Image = async (img) => {
        const data = await fetch(img).catch(error => {
            return undefined;
        });
        const blob = (data ? await data.blob() : undefined);
        return (blob ? new Promise((resolve) => {
            const reader = new FileReader();
            reader.readAsDataURL(blob);
            reader.onload = () => {
                const base64data = reader.result;
                resolve(base64data);
            }
        }) : undefined);

        // var canvas = document.createElement("canvas");
        // canvas.width = img.width;
        // canvas.height = img.height;
        // var ctx = canvas.getContext("2d");
        // ctx.drawImage(img, 0, 0);
        // var dataURL = canvas.toDataURL("image/png");
        // return dataURL.replace(/^data:image\/(png|jpg);base64,/, "");
    }

    onloadimage = () => {
        this.setState({ imgloading: true })
    }

    onRadioChange = (e) => {
        this.setState({ Feildnoshow: parseInt(e.target.value) }, () => {
            sessionStorage.setItem('showfno', this.state.Feildnoshow);
            // console.log(this.state.Feildnoshow);
        })



    }
    updateisles = () => {
        //console.log("updateisles");
    }
    //activate planogram
    handleChangeStatus = (cstatus) => {
        confirmAlert({
            title: this.props.t('CHANGE_PLANOGRAM_STATUS'),
            message: this.props.t('DO_YOU_WANT_TO_CHANGE_LAYOUT_STATE_TO') + cstatus + '?',
            overlayClassName: (this.props.isRTL === "rtl" ? "alertrtl-content" : ""),
            buttons: [{
                label: this.props.t('btnnames.yes'),
                onClick: () => {
                    var sobj = {
                        floorLayoutId: (this.state.planFloorObj.id ? this.state.planFloorObj.id : 0),
                        status: cstatus
                    };
                    this.setState({ loadingscreen: true })
                    submitSets(submitCollection.changePlanogramStatus, sobj, false, null, true).then(res => {
                        //console.log(res);
                        if (res && res.status) {
                            alertService.success(this.props.t('planostatusupdatesuccess'));
                            //this.props.history.push("/planograms");
                            this.handleToolControls('mainsvg-view',"zoomreset");
                            
                            /* this.props.setPLanogramdetailsView(null); */
                            var dataloadingversion = (cstatus === "CONFIRMED" && res.extra > 0?res.extra:sobj.floorLayoutId)
                            this.getSinglePanogram(dataloadingversion, true);
                            this.loadFieldChangesList(dataloadingversion, 0);
                            this.loadAlllayoutVersions(null, false);

                            this.setState({ loadingscreen: false, isIsleSelected:false ,IsleRects:[] }, () => {
                                this.hideQRsidebar();
                            });
                            /* if (cstatus !== "CONFIRMED") {
                                this.setState({ loadingscreen: false });
                                
                            }else{
                                this.props.history.push("/planograms");
                            } */

                        } else {
                            this.setState({ loadingscreen: false })
                            // alertService.error((res && res.extra && res.error ? res.error.errorMessage : this.props.t('ERROR_OCCURRED')));
                        }
                    });
                }
            }, {
                label: this.props.t('btnnames.no')
            }]
        });
    }
    //load layout field changes list
    loadFieldChangesList = (csid, startidx) => {
        var sobj = { layoutId: csid, isReqPagination: true, startIndex: startidx, maxResult: this.state.fcmaxresults }
        if (sobj.layoutId > 0) {
            submitSets(submitCollection.findFloorLayoutChanges, sobj, false).then(res => {
                //console.log(res);
                if (res && res.status) {

                    var cfcount = (startidx === 0 ? res.count : this.state.fcallcount);
                    var cfclist = (startidx > 0 ? this.state.loadedFieldChangesList : []);
                    cfclist = cfclist.concat(res.extra);

                    //find add/remove available
                    if (cfclist && cfclist.length > 0) {
                        for (let i = 0; i < cfclist.length; i++) {
                            let isadd = false; let isremove = false;
                            const cfitem = cfclist[i];
                            for (let j = 0; j < cfitem.fieldChange.length; j++) {
                                const fielditem = cfitem.fieldChange[j];
                                for (let l = 0; l < fielditem.planogramShelfChangesDto.length; l++) {
                                    const shelfitem = fielditem.planogramShelfChangesDto[l];
                                    if (shelfitem.floorShelfChangeType === "qty_add" || shelfitem.floorShelfChangeType === "add_new_block") {
                                        isadd = true;
                                        shelfitem["isadd"] = true;
                                    }
                                    if (shelfitem.floorShelfChangeType === "qty_remove" || shelfitem.floorShelfChangeType === "remove_block" || shelfitem.floorShelfChangeType === "remove_product") {
                                        isremove = true;
                                        shelfitem["isremove"] = true;
                                    }
                                }
                            }
                            cfitem["isadd"] = isadd;
                            cfitem["isremove"] = isremove;
                        }
                    }
                    //console.log(cfclist);
                    this.setState({ loadedFieldChangesList: cfclist, fcallcount: cfcount });
                }
            });
        }
    }
    //handle load more changes
    handleLoadmoreChanges = (startidx) => {
        var csvid = this.props.planogramState.planogramDetails.id;
        this.loadFieldChangesList(csvid, startidx);
    }
    //#PLG-LAY-DS-H01 load departmentprodchanges list
    loadDeptProdChangesList = (isReset , isChange) => {
        // var cndate = new Date();

        var cfdate = null
        var ctdate = null;

        if(this.props.planogramState && this.props.planogramState.pgrmDepGrid && !isReset){
            cfdate = new Date(this.props.planogramState.pgrmDepGrid.fcfromdate ? this.props.planogramState.pgrmDepGrid.fcfromdate : this.state.fcfromdate);
            ctdate = new Date(this.props.planogramState.pgrmDepGrid.fctodate ? this.props.planogramState.pgrmDepGrid.fctodate : this.state.fctodate);

            if(isChange){
                cfdate = new Date(this.state.fcfromdate);
                ctdate = new Date(this.state.fctodate);
            }else{
                this.setState({fcfromdate: cfdate, fctodate: ctdate})
            }

        }else{

            if(isReset){
                this.props.setDepGridDates(null);
            }

            cfdate = new Date(this.state.fcfromdate);
            ctdate = new Date(this.state.fctodate);
        }

        var covfdate = cfdate.getFullYear() + "-" + ('0' + (cfdate.getMonth() + 1)).slice(-2) + "-" + ('0' + cfdate.getDate()).slice(-2);
        var covtdate = ctdate.getFullYear() + "-" + ('0' + (ctdate.getMonth() + 1)).slice(-2) + "-" + ('0' + ctdate.getDate()).slice(-2);

        // const sobj = { layoutId: this.state.dcChangesBaseid, storeId: this.state.selStoreId }; //salesFrom: covfdate, salesTo: covtdate
        const sobj = { storeId: this.state.selStoreId, fromDate: covfdate, toDate: covtdate }; //salesFrom: covfdate, salesTo: covtdate
        this.setState({ issaledataloading: true, departmentprodchanges: [] });
        submitSets(submitCollection.getFLDepartments, sobj, false).then(res => {
            //console.log(res);
            this.setState({ issaledataloading: false });
            if (res && res.status) {
                this.setState({ departmentprodchanges: res.extra });
            }else{
                alertService.error((res && res.extra && res.error ? res.error.errorMessage : this.props.t('ERROR_OCCURRED')));
            }
        });
    }
    //#PLG-LAY-DS-H04 handle sort departmentprodchanges
    changeDepProdList = (dplist) => {
        this.setState({ departmentprodchanges: dplist });
    }
    //change filter state
    changeFilterdate = (cstate, cdate) => {
        if(cdate){
            if (cstate === "fcfromdate") {
    
                if(new Date(cdate).getTime()>new Date(this.state.fctodate).getTime()){
                    alertService.error(this.props.t('PLEASE_SET_VALID_DATE_RANGE'))
                    return;
                }

                if(this.state.fctodate !== null || this.state.fctodate !== ""){
                    this.setState({ fcfromdate: cdate },()=>{
                        this.props.setDepGridDates({fcfromdate: cdate, fctodate: this.state.fctodate})
                        this.loadDeptProdChangesList(false, true);
                    });
                }else{
                    this.setState({ fcfromdate: cdate },()=>{
                        this.props.setDepGridDates({fcfromdate: cdate, fctodate: this.state.fctodate})
                    })
                }
    
            } else {
    
                if(new Date(this.state.fcfromdate).getTime()>new Date(cdate).getTime()){
                    alertService.error(this.props.t('PLEASE_SET_VALID_DATE_RANGE'))
                    return;
                }

                if(this.state.fcfromdate !== null || this.state.fcfromdate !== ""){
                    this.setState({ fctodate: cdate },()=>{
                        this.props.setDepGridDates({fcfromdate: this.state.fcfromdate, fctodate: cdate})
                        this.loadDeptProdChangesList(false, true);
                    });
                }else{
                    this.setState({ fctodate: cdate },()=>{
                        this.props.setDepGridDates({fcfromdate: this.state.fcfromdate, fctodate: cdate})
                    })
                }
    
            }
        }
    }

    //reset dates
    resetFilterdate = () => {
        this.setState({ fcfromdate: this.state.resetFromActiveDate, fctodate: new Date() },()=>{
            this.loadDeptProdChangesList(true);
        });
    }

    //handle confirm button
    handleConfirm = () => {
        if (this.state.changeinplano) {
            confirmAlert({
                title: this.props.t('UNSAVE_CHANGES'),
                message: this.props.t('HAVE_UNSAVE_CHANGES_UPPDATE_BEFORE_CONFIRM'),
                overlayClassName: (this.props.isRTL === "rtl" ? "alertrtl-content" : ""),
                buttons: [{
                    label: this.props.t('btnnames.close')
                }
                ]
            });
            // alert(this.props.t('HAVE_UNSAVE_CHANGES_UPPDATE_BEFORE_CONFIRM'))
        } else {

            // this.setState({ loadingscreen: true })
            // console.log(this.props.planogramState.PDplanogramDetails.isJustSimulated);
            // var isSimulatedPlanogram=this.props.planogramState.PDplanogramDetails.isJustSimulated
            // if(isSimulatedPlanogram){
            //     this.handleChangeStatus("CONFIRMED")
            // }else{
            //     this.getActiveLayoutCall();
            // }
            this.getActiveLayoutCall();
        }

    }
    //handle activate button
    handleActivate = () => {
        if (this.state.changeinplano) {
            confirmAlert({
                title: this.props.t('UNSAVE_CHANGES'),
                message: this.props.t('HAVE_UNSAVE_CHANGES_UPPDATE_BEFORE_THIS_TASK'),
                overlayClassName: (this.props.isRTL === "rtl" ? "alertrtl-content" : ""),
                buttons: [{
                    label: this.props.t('btnnames.close')
                }
                ]
            });

        } else {
            this.handleChangeStatus("ACTIVE")
        }

    }
    //getActiveLayoutCall
    getActiveLayoutCall = () => {
        var rectset = JSON.parse(JSON.stringify(this.state.rects));
        var newrectset = this.setdatafordb(rectset);
        // console.log(newrectset);
        submitSets(submitCollection.getActiveLayout, "?storeId=" + this.state.selStoreId, true).then(res => {
            if (res && res.status) {
                // console.log(res.extra);
                this.setState({ activeplanogram: res.extra })
                if (res.extra === "") {
                    // this.setState({loadingscreen:false})
                    this.handleChangeStatus("CONFIRMED")
                } else {
                    this.overlappingChecktoConfirm(res.extra, newrectset);
                }

            }
        })
    }
    overlappingChecktoConfirm = (activerects, nrects) => {
        // var colliderect = isRectCollide(rectA, rectB);
        var ispassed = true
        var ishaveduplfield = false
        var ishvedep = true
        var duplicatefield = {}
        var isSimulatedPlanogram=this.props.planogramState.PDplanogramDetails.isJustSimulated

        let changedFieldUUIDs = [];
        for (let i = 0; i < nrects.length; i++) {
            const nisle = nrects[i];
            changedFieldUUIDs = changedFieldUUIDs.concat(nisle.fields.filter(a=> a.isFieldLocationChange === true).map(a=> a.mainFieldUUID));
        }
        for (let i = 0; i < nrects.length; i++) {
            const nisle = nrects[i];
            for (let j = 0; j < nisle.fields.length; j++) {
                const nfield = nisle.fields[j];
                for (let k = 0; k < activerects.aisles.length; k++) {
                    const activeisle = activerects.aisles[k];
                    let filteredActiveFields=isSimulatedPlanogram?activeisle.fields.filter(x=>x.department.departmentId!==this.props.planogramState.PDplanogramDetails.aisles[0].fields[0].department.departmentId):activeisle.fields
                    //remove location changed fields from active arr , beacouse they need to ignore
                    let checkUuilds = changedFieldUUIDs.filter(c=> filteredActiveFields.some(d=> d.mainFieldUUID === c));
                    filteredActiveFields = filteredActiveFields.filter(a=> !checkUuilds.some(b=> b === a.mainFieldUUID));
                    for (let l = 0; l < filteredActiveFields.length; l++) {
                        const activefield = filteredActiveFields[l];
                        //chcek fields
                        var NFieldWidth=measureConverter(nfield.uom, this.state.DrawUOM, nfield.width)
                        var NFieldHeight=measureConverter(nfield.uom, this.state.DrawUOM, nfield.height)

                        var ActFieldWidth=measureConverter(activefield.uom, this.state.DrawUOM, activefield.width) 
                        var ActFieldHeight=measureConverter(activefield.uom, this.state.DrawUOM, activefield.height)

                        var xA = activefield.x + (ActFieldWidth / 2)
                        var yA = activefield.y + (ActFieldHeight / 2)

                        var xN = nfield.x + (NFieldWidth / 2)
                        var yN = nfield.y + (NFieldHeight / 2)
                        var margin = 0.125;
                        var rectB = { x: xA, y: yA, w: ActFieldWidth - margin, h: ActFieldHeight - margin, angle: activefield.rotation }
                        var rectA = { x: xN, y: yN, w: NFieldWidth - margin, h: NFieldHeight - margin, angle: nfield.rotation }
                        var colliderect = isRectCollide(rectA, rectB);
                        if (colliderect) {
                            if (activefield.mainFieldUUID !== nfield.mainFieldUUID) {
                            // if (activefield.mainFieldId !== nfield.mainFieldId) {
                                if (this.props.planogramState.PDplanogramDetails.deletedMainFieldInfo.length > 0) {
                                    var have = this.props.planogramState.PDplanogramDetails.deletedMainFieldInfo.find(x => x.id === activefield.mainFieldId);
                                    if (have === undefined || have === null) {
                                        activefield["overlap"] = true
                                        ispassed = false;
                                    }
                                } else {
                                    activefield["overlap"] = true
                                    ispassed = false;
                                    // break loop1
                                }

                            }

                        }

                        //check no same dep field no can available
                        var availableOnDeletedlist=this.props.planogramState.PDplanogramDetails.deletedMainFieldInfo.find(x=>x.uuid===activefield.uuid)
                        if(availableOnDeletedlist===undefined){
                            if (activefield.mainFieldUUID !== nfield.mainFieldUUID) {
                            // if (activefield.mainFieldId !== nfield.mainFieldId) {
                                if (nfield.department !== undefined) {
                                    if (activefield.noInFloorLayout === nfield.noInFloorLayout) {
    
                                        if (activefield.department.departmentId === nfield.department.departmentId) {
                                            ishaveduplfield = true
                                            // console.log("have duplacate id")
                                            //console.log(activefield, nfield);
                                            // console.log(activefield.noInFloorLayout,nfield.noInFloorLayout);
                                            duplicatefield = nfield
                                        }
    
                                    }
                                } else {
    
                                    ishvedep = false
                                }
    
                                // if ((activefield.noInFloorLayout === nfield.noInFloorLayout) && (activefield.department.departmentId === nfield.department.departmentId)) {
                                //     ishaveduplfield = true
                                //     // console.log("have duplacate id")
                                //     // console.log(activefield,nfield);
                                //     // console.log(activefield.noInFloorLayout,nfield.noInFloorLayout);
                                //     duplicatefield = nfield
    
                                // }
                                // console.log(activefield.noInFloorLayout,nfield.noInFloorLayout);
    
                            }
                        }
                        
                        // console.log(colliderect);
                    }
                }
            }
        }

        if(isSimulatedPlanogram){
            if (!ispassed) {
                confirmAlert({
                    title: this.props.t('OVELAP'),
                    message: this.props.t('CONFIRM_OVELAP_ERROR'),
                    overlayClassName: (this.props.isRTL === "rtl" ? "alertrtl-content" : ""),
                    buttons: [{
                        label: this.props.t('btnnames.close')
                    }
                    ]
                });
                // alertService.error(this.props.t('CONFIRM_OVELAP_ERROR'));
                this.setState({ activePlanoShow: true, loadingscreen: false })
            }else{
                if (ishvedep) {
                    // this.setState({loadingscreen:false})
                    //  this.handlesaveupdatedelete(2, "CONFIRMED")
                    this.handleChangeStatus("CONFIRMED")
                } else {
                    alertService.error("Field with No Department!");
                    this.setState({ loadingscreen: false })
                }
            }
        }else{
            if (ispassed) {
                if (ishaveduplfield) {
                    this.setState({ loadingscreen: false })
                    // alertService.error(this.props.t('SAME_FIELD_NUMBER_DUPLICATE'));
                    confirmAlert({
                        title: "Duplicating Field Number",
                        message: "Department :" + duplicatefield.department.name + " Duplicating Field No: " + duplicatefield.noInFloorLayout + " in Merge !",
                        overlayClassName: (this.props.isRTL === "rtl" ? "alertrtl-content" : ""),
                        buttons: [{
                            label: this.props.t('btnnames.close')
                        }
                        ]
                    });
                    // alertService.warn("Department :" + duplicatefield.department.name + " Duplicating Field No: " + duplicatefield.noInFloorLayout + " in Merge !");
    
                } else {
                    if (ishvedep) {
                        // this.setState({loadingscreen:false})
                        //  this.handlesaveupdatedelete(2, "CONFIRMED")
                        this.handleChangeStatus("CONFIRMED")
                    } else {
                        alertService.error("Field with No Department!");
                        this.setState({ loadingscreen: false })
                    }
    
                }
    
            } else {
                confirmAlert({
                    title: this.props.t('OVELAP'),
                    message: this.props.t('CONFIRM_OVELAP_ERROR'),
                    overlayClassName: (this.props.isRTL === "rtl" ? "alertrtl-content" : ""),
                    buttons: [{
                        label: this.props.t('btnnames.close')
                    }
                    ]
                });
                // alertService.error(this.props.t('CONFIRM_OVELAP_ERROR'));
                this.setState({ activePlanoShow: true, loadingscreen: false })
            }

        }

       
    }
    //rearrange planogram of confirm
    ReArrangeplano = () => {
        this.setState({
            activePlanoShow: false,
            activeplanogram: null,
        })
    }
    //handle version change
    handleVersionChange = (eitem) => {
        if (eitem) {
            // this.handleToolControls('mainsvg-view',"zoomreset");

            this.props.setPLanogramdetailsView(null);
            this.props.setPLanogramView(eitem);
            this.setState({ 
                loadingscreen: true, activePlanoShow: false, zoompanactive: false, zoomDrawX: 0, isIsleSelected: false, IsleRects:[],
                isshowQRpanel: false,
            }, () => {
                this.loadSelectedVersionData();
            });
        }
    }
    //new planogram changes
    handleNewPlanogram = () => {
        this.handleToolControls('mainsvg-view',"zoomreset");

        this.props.setPLanogramView(null);
        this.props.setPLanogramdetailsView(null);
        this.setState({ planFloorObj: null, rects: [], isShowDeptChanges: false, activePlanoShow: false, planoLock: false,isIsleSelected:false,
            IsleRects:[], }, () => {
            this.loadSelectedVersionData();
        });
    }
    //planogram lock handle
    handleplanoLock = () => {
        if (this.state.planoLock) {
            confirmAlert({
                title: this.props.t('REMOVELOCK_PLANO'),
                message: this.props.t('SURE_REMOVE_PLANO'),
                overlayClassName: (this.props.isRTL === "rtl" ? "alertrtl-content" : ""),
                buttons: [{
                    label: this.props.t('btnnames.yes'),
                    onClick: () => {
                        this.setState({ planoLock: false })
                    }
                }, {
                    label: this.props.t('btnnames.no'),
                    onClick: () => {
                        return false;
                    }
                }]
            });
        } else {
            this.setState({ planoLock: true })
        }
    }
    //toggle new field changes
    toggleFieldMdView = () => {
        this.props.setDunitView(null);
        this.setState({ isShowNewField: !this.state.isShowNewField });
    }
    //open edit/duplicate field details, opentype = 1: edit, opentype = 2: duplicate
    openEditCopyField = (opentype, selectedfield) => {
        const cfielddetails = JSON.parse(JSON.stringify(selectedfield));
        
        if(cfielddetails && cfielddetails.shelf && cfielddetails.shelf.length > 0){
            cfielddetails.shelf = cfielddetails.shelf.sort((a, b) => (a.rank - b.rank));
        }

        //if opentype copy
        if (opentype === 2) {
            cfielddetails["id"] = 0;
            cfielddetails["fieldName"] = (cfielddetails.fieldName + " " + this.props.t("COPY"))
        }

        this.props.setDunitView(cfielddetails);
        this.setState({ isShowNewField: !this.state.isShowNewField });
    }
    //new tools handle
    handleToolControls = (viewid,tooltype, event, startpan) => {
        let activezoompan = true;
        let zoomdrawx = this.state.zoomDrawX;

        if(tooltype === "zoomin"){
            zoomdrawx = (zoomdrawx + 1);

            handleZoomInOut(viewid, true, false, this.state.viewWidth, 0, zoomdrawx);
            
            this.setState({ isShowProdView: false });

        } else if(tooltype === "zoomout"){
            if((zoomdrawx - 1) <= 0){
                zoomdrawx = 0;
                activezoompan = false;

                handleZoomInOut(viewid, false, true, this.state.viewWidth, 0, zoomdrawx);
            } else{
                zoomdrawx = (zoomdrawx - 1);
                handleZoomInOut(viewid, true, false, this.state.viewWidth, 0, zoomdrawx);
            }

        } else if(tooltype === "zoomreset"){
            activezoompan = false;
            zoomdrawx = 0;

            this.setState({ svgzoomissingwidth: 0, activetool: "default" }, () => {
                handleZoomInOut(viewid, false, true, this.state.viewWidth, 0, zoomdrawx);
            });
        }

        this.setState({ zoomDrawX: zoomdrawx });

        if(tooltype === "pan"){
            if(this.state.activetool === "pantool" && this.state.startpan){
                let fielddetails = { drawWidth: this.state.viewWidth, drawHeight: this.state.viewHeight }
                handlePanView("FloorMapbox", event,this.state.zoompanactive,this.state.zoomDrawX,fielddetails);
            }
        } else if(tooltype === "panstart"){
            this.setState({ startpan: startpan });
        } else if(tooltype === "pantool"){
            this.setState({ activetool: (tooltype === this.state.activetool?"default":tooltype) });
        } else{
            this.setState({ zoompanactive: activezoompan, allowovrflwprod: (activezoompan && this.state.allowovrflwprod?false:this.state.allowovrflwprod) });
        }
    }

    updateLoadingModal = (cstate, _callback) => {
        this.setState({ loadingscreen: cstate }, () => {
            if(_callback){
                _callback();
            }
        });
    }

    triggerBulkQR = (rectlist, isallqrs, selecteddept) => {
        this.setState({ printRectList: rectlist, isPrintAllQRs: {isall: isallqrs, dept: selecteddept} }, () => {
            this.toggleBulkQRPrint();
            
            if(document.getElementById("bulkqrprintlink")){
                document.getElementById("bulkqrprintlink").click();
            }    
        });
    }

    toggleBulkQRPrint = (type) => {
        this.setState({ showBulkPrintModal: !this.state.showBulkPrintModal,isNonSimExport:type==="nonusedprod"?true:false });
    }
    HandleisIsleSelected=(val)=>{
        this.setState({isIsleSelected:val, rotationobj: null},()=>{
            if(val){
                this.drawIsleRects()
            }else{
                this.setState({ IsleRects:[]})
            }
        })
    }
    drawIsleRects=()=>{
        var Isles=this.state.rects
        var existIsles=Isles.filter(x=>x.isDelete!==true)
        var IsleRects=[]
        for (let i = 0; i < existIsles.length; i++) {
            const aisle = existIsles[i];
            var IsleRectObj = {};
            let totalwidth = 0;
            let totalheight = 0;
            let currotation = 0;
            let FilteredFields=aisle.fields.filter(x=>x.isDelete!==true)
            // console.log(aisle.fields,FilteredFields);
            for (let k = 0; k < FilteredFields.length; k++) {
                const field =  FilteredFields[k];

                totalwidth = (totalwidth + field.drawWidth);
                totalheight = (field.drawDepth > totalheight?field.drawDepth:totalheight);
                currotation = field.rotation;
                //check last field
                if(field.leftSideFieldDto === undefined||field.leftSideFieldDto ===null || (field.leftSideFieldDto&&field.leftSideFieldDto.isDelete === true)){
                    // isleobj["lastField"]=field

                    let center={ x: (field.x + (field.drawWidth / 2)), y: (field.y + (field.drawDepth / 2)) };
                    let newrotation = (field.rotation > 180?(field.rotation - 180):(field.rotation + 180))
                    
                    let islestartpoint = this.XYpointfromTriangleAnglenRadiasnstartpoint(newrotation, field.x, center.y, center.x, center.y)

                    IsleRectObj["endx"] = islestartpoint.x;
                    IsleRectObj["endy"] = islestartpoint.y;
                   
                }

                if(field.rightSideFieldDto === undefined ||field.rightSideFieldDto ===null || (field.rightSideFieldDto&&field.rightSideFieldDto.isDelete === true)){
                    // isleobj["firstField"]=field
                    let center={ x: (field.x + (field.drawWidth / 2)), y: (field.y + (field.drawDepth / 2)) };  
                    let islestartpoint = this.XYpointfromTriangleAnglenRadiasnstartpoint(field.rotation, field.x, center.y, center.x, center.y)

                    IsleRectObj["startx"] = islestartpoint.x;
                    IsleRectObj["starty"] = islestartpoint.y;
                }
            }

            IsleRectObj["drawWidth"] = totalwidth;
            IsleRectObj["drawDepth"] = totalheight;
            //rotation
            IsleRectObj["rotation"] = currotation;
            //get center point
            let middlepoints = this.getCenterPointofLine(IsleRectObj.startx, IsleRectObj.starty, IsleRectObj.endx, IsleRectObj.endy);
            
            IsleRectObj["centerx"] = middlepoints.x;
            IsleRectObj["centery"] = middlepoints.y;

            IsleRectObj["x"] = (IsleRectObj.centerx - (IsleRectObj.drawWidth / 2));
            IsleRectObj["y"] = (IsleRectObj.centery - (IsleRectObj.drawDepth / 2));

            IsleRectObj["f_uuid"] = aisle.f_uuid;

            IsleRects.push(IsleRectObj);
            // console.log(IsleRects);
        }

        this.setState({IsleRects:IsleRects})
    }
    //find x,y position from old postion and center details
    XYpointfromTriangleAnglenRadiasnstartpoint = (angle, oldX, oldY, centerX, centerY)=>{
        let piAngle = (angle * Math.PI / 180);

        let x1 = centerX + (oldX - centerX) * Math.cos(piAngle) - (oldY - centerY) * Math.sin(piAngle);
        let y1 = centerY + (oldX - centerX) * Math.sin(piAngle) + (oldY - centerY) * Math.cos(piAngle);
        
        return { x: x1, y: y1 };
    }
    //get middle point of line
    getCenterPointofLine = (x1, y1, x2, y2) => {

        // calculate the midpoint
        const centerX = (parseFloat(x1) + parseFloat(x2)) / 2;
        const centerY = (parseFloat(y1) + parseFloat(y2)) / 2;

        return { x: centerX, y: centerY };
    }

    checkThroughProducts2 = (xa, ya, w, h, prod, rot) => {
        var x1 = prod.x + (prod.drawWidth / 2)
        var y1 = prod.y + (prod.drawDepth / 2)
        var xA = xa + (w / 2)
        var yA = ya + (h / 2)

        var rectA = { x: x1, y: y1, w: prod.drawWidth, h: prod.drawDepth, angle: prod.rotation }
        var rectB = { x: xA, y: yA, w: w, h: h, angle: rot }
        var allowOnProducts = true;
        var colliderect = isRectCollide(rectA, rectB);
        if (colliderect) {
            allowOnProducts = false
        }
       
        return allowOnProducts;
    }
    //update isle location changes
    updateIsleMoveChanges = (isleidx, cevent, isleobj) => {
        let oldobj = JSON.parse(JSON.stringify(isleobj));

        let islelist = this.state.IsleRects;
        let selectedIsle = islelist[isleidx];

        selectedIsle["x"] = (cevent.x - (isleobj.drawWidth) / 2);
        selectedIsle["y"] = (cevent.y - (isleobj.drawDepth) / 2);

        let allisles = this.state.rects;
        // let selAllIsle = allisles[isleidx];
        let parentisleidx = allisles.findIndex(x => x.f_uuid === selectedIsle.f_uuid);
        let selAllIsle = allisles[parentisleidx];

        if(selAllIsle){
            for (let i = 0; i < selAllIsle.fields.length; i++) {
                const fieldobj = selAllIsle.fields[i];
                
                let fieldgapx = (fieldobj.x - oldobj.x);
                let fieldgapy = (fieldobj.y - oldobj.y);

                fieldobj["x"] = (selectedIsle.x + fieldgapx);
                fieldobj["y"] = (selectedIsle.y + fieldgapy);
            }
        }
        //after move updateaisle center xy
        selectedIsle["centerx"]=selectedIsle.x+(selectedIsle.drawWidth/2)
        selectedIsle["centery"]=selectedIsle.y+(selectedIsle.drawDepth/2)
        this.setState({ IsleRects: islelist, rects: allisles });
    }

    
    
    toggleStoreCopy = () => {
        this.setState({
            showStoreCopyModel:!this.state.showStoreCopyModel
        })
    }

    handlescreenfit=()=>{
        this.handleToolControls('mainsvg-view',"zoomreset")
        this.setState({ fittowidth:!this.state.fittowidth,loadingscreen:true},()=>{
            // this.getSinglePanogram((this.state.planFloorObj.id ? this.state.planFloorObj.id : 0), true)
            this.drawscreenfromfitswitch()
        })
    }

    getScrollPosition = (e) =>{
        if(this.state.isverloading === false && this.state.layoutVersionList.length < this.state.verTotalCount){
            var top = document.getElementById("pgversionlist").scrollTop;
            var sheight = document.getElementById("pgversionlist").scrollHeight;
            var position = (sheight - top);
            var clientHeight = e.target.clientHeight;
            position = Math.trunc(position); 

            if(position <= clientHeight){
                this.loadAlllayoutVersions(this.state.verStartIndex, false);
            }
        }
    }

    //using to check whether changes available or not
    /* changesAvailableCheck = () => {
        let isChangesAvailable = false;

        //find tag list changes available
        let notSavedTagList = this.state.addedTags.filter(x => (x.isNew || x.isDelete));
        if(notSavedTagList.length > 0){
            isChangesAvailable = true;
        }

        return isChangesAvailable;
    } */

    render() {
        var {loadedDeptList}=this.state
        // var viewDunits = this.state.DunitList.map((dunit, i) => {
        //     return <div key={i} value={i} className="PDFieldTypes"
        //         draggable
        //         id={dunit.id}
        //         ref={(r) => this[dunit.id] = r}
        //         onDragStart={(e) => this.dragStart(e, dunit)}
        //         onMouseDown={(e) => this.dragclick(e, dunit)}
        //     >
        //         <h6>{this.state.DunitList[i].fieldName}</h6>
        //         <Image src={this.state.DunitList[i].imagePath} thumbnail className="PDDunitimg" />

        //     </div>
        // });
        var selectfloor = (this.state.floorlist ? Object.keys(this.state.floorlist).map(x => {
            return <option key={x} value={x}>{this.state.floorlist[x].name}</option>
        }) : <></>);
        let filterBranchList = (loadedDeptList&&loadedDeptList.length>0)?loadedDeptList.map((item,i)=>{
            return {value:item.departmentId,label:item.name,idx:i}
        }):[{value:-1,label:this.props.t("NO_RESULT_FOUND")}];

        // console.log(this.state.viewWidth, this.state.svgzoomissingwidth);

        return (
            <div>
                <div className={`prodadd-sidebar pgdunit-sidebar sidebar-menu${(!this.state.zoompanactive && this.state.isShowProdView)? ' open' : ''} ` + ((this.props.isRTL === "rtl") ? "RTL" : "")} >
                    <div className="PDsidemenu" dir={this.props.isRTL}>
                        <h4 style={{ marginTop: "-10px", fontWeight: "800", color: "#5327a0" }}>{this.props.t('fieldtypes')}
                            <span className={("close-link "+((this.props.isRTL === "rtl") ? "float-left" : "float-right"))} onClick={this.hidesidebar}><XCircleFillIcon  size={16} /></span>
                        </h4>
                        <Row>
                            <Col xs={8}>
                                <InputGroup size="sm" className="mb-3 input-search search-content">
                                    <Form.Control  id="filterprodtxt" aria-describedby="inputGroup-sizing-sm"
                                    placeholder={this.props.t('btnnames.search')} aria-label="Search" onKeyUp={e => this.handleFilterProducts(e)} />
                                    <InputGroup.Text id="inputGroup-sizing-sm"><SearchIcon size={18} /></InputGroup.Text>
                                </InputGroup>
                            </Col>
                            <Col xs={4}>
                            <Button variant="danger" onClick={this.toggleFieldMdView} className="newfield-togglelist float-right" size={"sm"}><PlusIcon size={12} /> {this.props.t("newfield")}</Button>
                            </Col>
                        </Row>
                        
                        <ButtonGroup className={"pviewchange-list " + (this.props.isRTL === "rtl" ? "float-left" : "float-right")}>
                            <Button variant="secondary" onClick={() => this.toggleProdListView("LIST")} className={(this.props.isRTL === "rtl" ? "listlist " : "") + (this.state.isListViewActive === "LIST" ? "active" : "")}><ListUnorderedIcon size={14} /></Button>
                            <Button variant="secondary" onClick={() => this.toggleProdListView("GRID")} className={(this.props.isRTL === "rtl" ? "gridlist " : "") + (this.state.isListViewActive === "GRID" ? "active" : "")}><DiffAddedIcon size={14} /></Button>
                        </ButtonGroup>
                        
                        {(this.state.isListViewActive !== null && this.state.recentDUnitList && this.state.filteredDUnitList.length === 0 && this.state.filterTypeTxt === ""? <Col className="col-xs-12 div-con">
                            <h5>{this.props.t('allfields')}</h5>
                            <Col xs={12} className="div-con subprod-list" style={{ height: "calc(100vh - 225px)", overflow: "hidden", overflowY: "auto", padding: "0px 5px" }}>
                                <Row style={(this.props.isRTL === "rtl" ? { marginRight: "0px", width: "100%" } : { marginLeft: "0px", width: "100%" })}>
                                    {(this.state.recentDUnitList ? this.state.recentDUnitList.map((prod, i) =>
                                        <Col key={i} className={"sub-item" + (this.state.isListViewActive === "LIST" ? "" : " rectview")} xs={this.state.isListViewActive === "LIST" ? 12 : 6} style={{ height: (this.state.isListViewActive === "LIST" ? "75px" : " 115px") }}><Col style={{ margin: 5, position: "relative" }} draggable
                                            id={prod.id}
                                            ref={(r) => this[prod.id] = r}
                                            onDragStart={(e) => this.dragStart(e, prod)}
                                            onMouseDown={(e) => this.dragclick(e, prod)}>

                                            <div className={(this.state.isListViewActive === "LIST" ? "thumb-div" : "thumb-div d-none")} draggable style={{ left: "-2px" }}>
                                                <img key={i} className="img-fluid" src={(prod.imagePath && prod.imagePath !== ""?prod.imagePath:defaultshelfimg)} alt="" />
                                            </div>
                                            
                                            <div className={(this.state.isListViewActive === "LIST" ? "d-none" : "")} style={{ width: "100%" }}>
                                                <div className={"thumb-div"} style={{ width: "100%", marginLeft: "-33px" }} draggable>
                                                    <img key={i} className="img-fluid" src={(prod.imagePath && prod.imagePath !== ""?prod.imagePath:defaultshelfimg)} alt="" />
                                                </div>

                                                <TooltipWrapper text={prod.fieldName}>
                                                    <h6 className="fieldName" style={{ position: "absolute", left: "0px", textAlign: "center", maxWidth: "100%", fontSize: "13px", color: "#5327a0", fontWeight: "600", marginBottom: "0px" }}>{prod.fieldName}</h6>
                                                </TooltipWrapper>
                                            </div>

                                            <div className={(this.state.isListViewActive === "LIST" ? "" : "d-none")}>
                                                <span className="fieldedit-link" onClick={() => this.openEditCopyField(1, prod)} title="edit field"><PencilIcon size={14} /></span>
                                                <span className="fieldedit-link" onClick={() => this.openEditCopyField(2, prod)} title="duplicate field"><VersionsIcon size={14} /></span>
                                                
                                                <TooltipWrapper text={(this.state.isListViewActive === "LIST" ? prod.fieldName : "")}>
                                                    <h5 className="fieldName">{(this.state.isListViewActive === "LIST" ? prod.fieldName : "")}</h5>
                                                </TooltipWrapper>

                                                <Row className="PDdimention">
                                                    <Col md={4}><span className="PDdtitle"><small>{this.props.t('WIDTH')}</small><br />
                                                        <span className="PDuom">{(this.state.isListViewActive === "LIST" ? roundOffDecimal(prod.width,2) : "")}{(this.state.isListViewActive === "LIST" ? prod.uom : "")}</span>
                                                    </span>
                                                    </Col>
                                                    <Col md={4}><span className="PDdtitle"><small>{this.props.t('HEIGHT')}</small><br />
                                                        <span className="PDuom">{(this.state.isListViewActive === "LIST" ? roundOffDecimal(prod.height,2) : "")}{(this.state.isListViewActive === "LIST" ? prod.uom : "")}</span>
                                                    </span>
                                                    </Col>
                                                    <Col md={4}> <div className="PDdtitle" ><small>{this.props.t('DEPTH')}</small><br />
                                                        <span className="PDuom">{(this.state.isListViewActive === "LIST" ? roundOffDecimal(prod.depth,2) : "")}{(this.state.isListViewActive === "LIST" ? prod.uom : "")}</span>
                                                    </div>
                                                    </Col>
                                                </Row>
                                            </div>
                                        </Col></Col>) : (<></>))}
                                </Row>
                            </Col>
                        </Col> : <></>)}
                        {(this.state.isListViewActive !== null && this.state.filteredDUnitList && this.state.filteredDUnitList.length > 0? <Col className="col-xs-12 div-con">
                            <h5>{this.props.t('filteredfields')}</h5>
                            <Col xs={12} className="div-con subprod-list" style={{ height: "calc(100vh - 225px)", overflow: "hidden", overflowY: "auto", padding: "0px 5px" }}>
                                {this.state.filteredDUnitList.length > 0?
                                <Row style={(this.props.isRTL==="rtl"?{ marginRight: "0px", width: "100%" }:{ marginLeft: "0px", width: "100%" })}>
                                    {(this.state.filteredDUnitList ? this.state.filteredDUnitList.map((prod, i) =>
                                        <Col key={i} className={"sub-item" + (this.state.isListViewActive === "LIST" ? "" : " rectview")} xs={this.state.isListViewActive === "LIST" ? 12 : 6} style={{ height: (this.state.isListViewActive === "LIST" ? "85px" : " 120px") }}><Col style={{ margin: 5, position: "relative" }} draggable
                                            id={prod.id}
                                            ref={(r) => this[prod.id] = r}
                                            onDragStart={(e) => this.dragStart(e, prod)}
                                            onMouseDown={(e) => this.dragclick(e, prod)}>

                                            <div className={(this.state.isListViewActive === "LIST" ? "thumb-div" : "thumb-div d-none")} draggable style={{ left: "-2px" }}>
                                                <img key={i} className="img-fluid" src={prod.imagePath?prod.imagePath:defaultshelfimg} alt="" />
                                            </div>

                                            <div className={(this.state.isListViewActive === "LIST" ? "d-none" : "")} style={{ width: "100%" }}>
                                                <div className={"thumb-div"} style={{ width: "100%", marginLeft: "-33px" }} draggable>
                                                    <img key={i} className="img-fluid" src={prod.imagePath?prod.imagePath:defaultshelfimg} alt="" />
                                                </div>
                                                <h6 style={{ position: "absolute", left: "0px", textAlign: "center", width: "100%", fontSize: "13px", color: "#2980B9", fontWeight: "600" }}>{prod.fieldName}</h6>
                                            </div>

                                            <div className={(this.state.isListViewActive === "LIST" ? "" : "d-none")}>
                                                <span className="fieldedit-link" onClick={() => this.openEditCopyField(1, prod)} title="edit field"><PencilIcon size={14} /></span>
                                                <span className="fieldedit-link" onClick={() => this.openEditCopyField(2, prod)} title="duplicate field"><VersionsIcon size={14} /></span>
                                                <h5 className="fieldName">{(this.state.isListViewActive === "LIST" ? prod.fieldName : "")}</h5>

                                                <Row className="PDdimention">
                                                    <Col md={4}><span className="PDdtitle"><small>{this.props.t('WIDTH')}</small> 
                                                        {(this.state.isListViewActive === "LIST" ? roundOffDecimal(prod.width,2) : "")}
                                                        <span className="PDuom">{(this.state.isListViewActive === "LIST" ? prod.uom : "")}</span>
                                                    </span>
                                                    </Col>
                                                    <Col md={4}><span className="PDdtitle"><small>{this.props.t('HEIGHT')}</small><br />
                                                        <span className="PDuom">{(this.state.isListViewActive === "LIST" ? roundOffDecimal(prod.height,2) : "")}{(this.state.isListViewActive === "LIST" ? prod.uom : "")}</span>
                                                    </span>
                                                    </Col>
                                                    <Col md={4}> <div className="PDdtitle" ><small>{this.props.t('DEPTH')}</small> 
                                                        {(this.state.isListViewActive === "LIST" ? roundOffDecimal(prod.depth,2) : "")}
                                                        <span className="PDuom">{(this.state.isListViewActive === "LIST" ? prod.uom : "")}</span>
                                                    </div>
                                                    </Col>
                                                </Row>


                                            </div>
                                        </Col></Col>) : (<></>))}
                                </Row>
                                :<><h4 className="text-center noresults-txt">{this.props.t("NORESULTFOUNDSEARCH")} <span>"{this.state.filterTypeTxt}"</span></h4></>}
                            </Col>
                        </Col> : <></>)}
                        {/* {viewDunits} */}
                    </div>
                </div>

                <Col xs={12} className={"main-content pg-layoutview " + ((this.props.isRTL === "rtl") ? "RTL" : "")} dir={this.props.isRTL}>

                    <div>
                        <Breadcrumb dir="ltr">
                            {this.props.isRTL === "rtl" ? <>
                                <Breadcrumb.Item active>{this.props.t('storeview')}</Breadcrumb.Item>
                                <li className="breadcrumb-item"><Link to="/planograms" role="button">{this.props.t('planograms')}</Link></li>
                                {/* <li className="breadcrumb-item"><Link to={"/"+this.props.HomePageVal} role="button">{this.props.t('home')}</Link></li> */}
                            </> : <>
                                {/* <li className="breadcrumb-item"><Link to={"/"+this.props.HomePageVal} role="button">{this.props.t('home')}</Link></li> */}
                                <li className="breadcrumb-item"><Link to="/planograms" role="button">{this.props.t('planograms')}</Link></li>
                                <Breadcrumb.Item active>{this.props.t('storeview')}</Breadcrumb.Item>
                            </>}
                        </Breadcrumb>
                        <div className="displayunit_outerbox" style={{ marginBottom: "60px" }}>


                            <div className="white-container pdunit-content additem-content"  ref={this.whitecontainer} style={{ position: "unset", background: "transparent", boxShadow: "none", padding: "0px" }}>
                                {!this.state.isedit && !this.state.isselectedfloor &&
                                    <Form.Group className={this.state.isDisableEdit === true?'plg-disable':''}>
                                        <Form.Control className="PDselectfloor" as="select" value={this.state.sobj.floor} onChange={(e) => this.handleFilterFloor(e, "floor")} >
                                            <option value="-1">{this.props.t('selectafloor')}</option>
                                            {selectfloor}
                                        </Form.Control>
                                    </Form.Group>
                                }
                                {this.state.isselectedfloor &&
                                    <Row>
                                        <Col xs={12} md={8}>
                                            <div className="planotitlebar">
                                                {/* {this.state.isedit ? <h3>{this.state.sobj.FloorName && this.state.sobj.FloorName + " Planogram"}</h3> : <></>} */}
                                                {this.state.isedit ?  
                                                    <OverlayTrigger placement="bottom-start" overlay={<Tooltip>{(this.props.planogramState.PDplanogramDetails&&this.props.planogramState.PDplanogramDetails.storeName) &&  this.props.planogramState.PDplanogramDetails.storeName}</Tooltip>}>
                                                        <h3>{(this.props.planogramState.PDplanogramDetails&&this.props.planogramState.PDplanogramDetails.storeName)?
                                                        (this.props.planogramState.PDplanogramDetails.storeName.substring(0,80)+(this.props.planogramState.PDplanogramDetails.storeName.length > 80?"...":""))
                                                    :<></>}</h3>
                                                    </OverlayTrigger> : <></>}

                                            </div>
                                        </Col>

                                    </Row>

                                }

                                <Row>
                                    <Col xs={12} lg={8} onContextMenu={e => e.preventDefault()}>
                                        <RandomQRGenerator isRTl={this.props.isRTL} t={this.props.t} dmode={this.props.dmode}
                                            isPrintAllQRs={this.state.isPrintAllQRs}
                                            planFloorObj={this.state.planFloorObj}
                                            rects={this.state.printRectList} 
                                            updateLoadingModal={this.updateLoadingModal} 
                                            />
                                        {/* tagsection */}
                                        {this.state.isselectedfloor && <Col>
                                            <Col className="PDtagsetnBtn" style={{ background: "#fff", borderRadius: "8px", padding: "6px 8px" }}>
                                                <div className="PDtagset">
                                                    <label style={{ fontSize: "14px", fontWeight: "700", textTransform: "uppercase" }}>{this.props.t('tags')}</label>{' '}
                                                    
                                                    {(this.state.planFloorObj && this.state.planFloorObj.layoutStatus !== "ACTIVE" && this.state.planFloorObj.layoutStatus !== "INACTIVE")?
                                                        <button type="button" className={"btn btn-danger PDbtn-circle "+(this.state.isDisableEdit === true?'plg-disable':'')} style={{ padding: "0px 4px 0px 3px !important", marginTop: "3px" }} onClick={this.showModal}><PlusIcon size={14}/></button>
                                                    :<></>}{' '}
                                                    
                                                    {this.state.addedTags ? this.state.addedTags.map((item, index) => (
                                                        <React.Fragment key={index}>
                                                            <TooltipWrapper text={item.tagDto.tagName}>
                                                                <Badge className={item.isDelete === true ? "d-none" : ""} style={{ margin: "2px", padding: "8px 10px" }} key={index} variant="default">
                                                                    {stringtrim(item.tagDto.tagName,70)} 
                                                                    <span onClick={e => this.removeTag(index)} className="tagremovebtn"><XIcon size={14} /></span>
                                                                </Badge>
                                                            </TooltipWrapper>
                                                        </React.Fragment>
                                                    )) : <></>}
                                                </div>
                                            </Col>
                                            <Col className="planogramsettingtab" style={{ width: "200px", background: "#fff", borderRadius: "8px", padding: "6px 8px" }}>
                                                <Col className="planogramsettingtabinside">
                                                    {/* <div className="PDtagset">
                                                <label style={{ fontSize: "14px", fontWeight: "700", textTransform: "uppercase" }}>{this.props.t('tags')}</label>{' '}
                                                <button type="button" className="btn btn-danger PDbtn-circle" style={{ padding: "0px 4px 0px 3px !important", marginTop: "3px" }} onClick={this.showModal}>+</button>{' '}
                                                {this.state.addedTags ? this.state.addedTags.map((item, index) => (
                                                    <Badge className={item.isDelete === true ? "d-none" : ""} style={{ margin: "2px", padding: "8px 10px" }} key={index} variant="default">{item.tagDto.tagName} <span onClick={e => this.removeTag(index)} className="tagremovebtn"><XIcon size={14} /></span></Badge>
                                                )) : <></>}
                                            </div> */}
                                                    {(!this.state.planFloorObj || (this.state.planFloorObj && this.state.planFloorObj.layoutStatus !== "INACTIVE"))?<div className="tool-controls-list">
                                                        <ul className='list-inline'>
                                                            <li className='list-inline-item tool-title'><small>{this.props.t("TOOLS")}</small></li>
                                                            <li className='list-inline-item tool-item'><div className='tools-wrapper' onClick={() => this.handleToolControls('mainsvg-view',"zoomin")}><FeatherIcon icon="plus" size={18}/></div></li>
                                                            <li className='list-inline-item tool-item'><div className='tools-wrapper' onClick={() => this.handleToolControls('mainsvg-view',"zoomout")}><FeatherIcon icon="minus" size={18}/></div></li>
                                                            <li className='list-inline-item tool-item'><div className='tools-wrapper' onClick={() => this.handleToolControls('mainsvg-view',"zoomreset")}><FeatherIcon icon="x" size={18}/></div></li>
                                                            <li className={'list-inline-item tool-item'+(this.state.activetool === "pantool"?" active":"")} onClick={() => this.handleToolControls('mainsvg-view',"pantool")}><div className='tools-wrapper'><FeatherIcon icon="move" size={16}/></div></li>
                                                            <li className={'list-inline-item tool-item'+(this.state.fittowidth?" active":"")} onClick={() => this.handlescreenfit()}>
                                                                <TooltipWrapper placement="bottom" text={this.state.fittowidth?this.props.t('Normal'):this.props.t('Fit_To_Width')}>
                                                                    <div className='tools-wrapper'><FeatherIcon icon="monitor" size={18}/></div>
                                                                </TooltipWrapper>
                                                            </li>
                                                        </ul>
                                                    </div>:<></>}

                                                    {(!this.state.planFloorObj || (this.state.planFloorObj && this.state.planFloorObj.layoutStatus !== "INACTIVE")) ? <>
                                                        
                                                        {/* {this.props.isRTL === "rtl" ? <div className={"rotationbtn "+(this.state.isDisableEdit === true?'plg-disable':'')} style={{ visibility: ((this.state.rotationobj && (this.state.QRisle.fields.length === 1)) ? "visible" : "hidden") }}> */}
                                                        {this.props.isRTL === "rtl" ? <div className={"rotationbtn "+(this.state.isDisableEdit === true?'plg-disable':'')} style={{ visibility:this.state.isIsleSelected?this.state.rotationobj?"visible":"hidden": (((this.state.rotationobj && this.state.QRisle.fields) && (this.state.QRisle.fields.length === 1)) ? "visible" : "hidden") }}>
                                                            <Button className="rotationbtnstyle" variant="warning" size="sm" onClick={this.state.rotationobj && this.rotatetoright}><img className="rotbtn" src={rotright} alt="" /></Button>
                                                            <Button className="rotationbtnstyle" variant="warning" size="sm" onClick={this.state.rotationobj && this.rotatetoleft}><img className="rotbtn" src={rotleft} alt="" /></Button>
                                                        </div> :
                                                            <div className={"rotationbtn "+(this.state.isDisableEdit === true?'plg-disable':'')} style={{ visibility:this.state.isIsleSelected?this.state.rotationobj?"visible":"hidden": (((this.state.rotationobj && this.state.QRisle.fields) && (this.state.QRisle.fields.length === 1)) ? "visible" : "hidden") }}>
                                                                <Button className="rotationbtnstyle" variant="warning" size="sm" onClick={this.state.rotationobj && this.rotatetoleft}><img className="rotbtn" src={rotleft} alt="" /></Button>
                                                                <Button className="rotationbtnstyle" variant="warning" size="sm" onClick={this.state.rotationobj && this.rotatetoright}><img className="rotbtn" src={rotright} alt="" /></Button>
                                                            </div>}
                                                        {this.state.selectedIsle !== null && <Button variant="" size="sm" className={"isleselectbtn "+(this.state.isDisableEdit === true?'plg-disable ':'')+(this.state.zoompanactive?"disable-action":"")} onClick={() => this.handleislechange()}>{this.props.t("SET_ISLE")}</Button>}
                                                        <div className='aui-content-left-right'>
                                                            <ButtonGroup className='aui-per-toggle' style={{marginTop:"4px"}}>
                                                                <Button size='sm' active={!this.state.isIsleSelected } onClick={() => this.HandleisIsleSelected(!this.state.isIsleSelected)}>{this.props.t('FIELD')}</Button>
                                                                <Button size='sm' active={this.state.isIsleSelected } onClick={() => this.HandleisIsleSelected(!this.state.isIsleSelected)}>{this.props.t('AISLE')}</Button>
                                                            </ButtonGroup>
                                                        </div>
                                                        <Button variant="" size="sm" className={"planoLock "+(this.state.isDisableEdit === true?'plg-disable':'')} style={{ background: this.state.planoLock && "#DC3545" }} onClick={() => this.handleplanoLock()}><FeatherIcon icon={this.state.planoLock ? "lock" : "unlock"} size="14" /></Button>

                                                        <Button variant="warning" size="sm" className={"shelfbtn "+((this.state.planFloorObj && this.state.planFloorObj.layoutStatus === "CONFIRMED") || this.state.isDisableEdit === true?'plg-disable':'')} onClick={this.showsidebar} disabled={this.state.zoompanactive} style={{ background: "#dc3545", border: "none" }}><img src={shelfimage} className="btnimage" alt="" /></Button>

                                                        <Dropdown className={"layoutsettings-drop " + ((this.props.isRTL === "rtl") ? "RTL" : "")}>
                                                            <Dropdown.Toggle variant="secondary" className="planosettings" ><GearIcon size={14} /></Dropdown.Toggle>
                                                            <Dropdown.Menu style={{ left: "-150px", width: "230px", minWidth: "230px" }}>
                                                                <Col style={{ padding: "0px 15px" }}>
                                                                    <div className={(this.props.isRTL === "rtl" ? "settingbtnfno" : "")}  >
                                                                        <small style={{ fontSize: "12px", fontWeight: "700" }}>{this.props.t('fieldno')}</small><br />
                                                                    </div>


                                                                    <div className="btn-toggle-list">
                                                                        <div className="btn-group btn-group-sm" role="group" aria-label="Basic radio toggle button group" style={{ width: "100%" }}>
                                                                            <input className="btn-check " type="radio" name="formHorizontalRadios"
                                                                                id="formHorizontalRadios1"
                                                                                value="1"
                                                                                checked={this.state.Feildnoshow === 1 ? true : false}
                                                                                onChange={(e) => this.onRadioChange(e)} />
                                                                            <label className={"btn btn-outline-primary btn-sm fieldno_option " + (this.props.isRTL === "rtl" ? "settingvisiblebtnr" : "")} htmlFor="formHorizontalRadios1" style={{ width: "31%" }}><div className="fieldicon-view d1"></div></label>

                                                                            <input type="radio" className="btn-check"

                                                                                name="formHorizontalRadios"
                                                                                id="formHorizontalRadios2"
                                                                                value="2"
                                                                                checked={this.state.Feildnoshow === 2 ? true : false}
                                                                                onChange={(e) => this.onRadioChange(e)} />
                                                                            <label className="btn btn-outline-primary btn-sm fieldno_option" htmlFor="formHorizontalRadios2" style={{ width: "31%" }}><div className="fieldicon-view d3"></div></label>

                                                                            <input type="radio" className="btn-check "

                                                                                name="formHorizontalRadios"
                                                                                id="formHorizontalRadios3"
                                                                                value="3"
                                                                                checked={this.state.Feildnoshow === 3 ? true : false}
                                                                                onChange={(e) => this.onRadioChange(e)} />
                                                                            <label className={"btn btn-outline-primary btn-sm fieldno_option " + (this.props.isRTL === "rtl" ? "settingvisiblebtnl" : "")} htmlFor="formHorizontalRadios3" style={{ width: "31%" }}><div className="fieldicon-view d2"></div></label>
                                                                        </div>
                                                                    </div>
                                                                </Col>
                                                                
                                                                <div className={(this.state.isDisableEdit === true?'plg-disable ':'')+(this.props.isRTL === "rtl" ? "settingbtnfno" : "")} onClick={this.handleNewPlanogram}>
                                                                    <Dropdown.Divider />
                                                                    <Dropdown.Item id="addnewplanogram" href="#" style={{ color: (this.props.dmode ? "#2CC990" : "#5128a0"), fontWeight: "700", textTransform: "uppercase" }}>{this.props.t('newplanogram')}</Dropdown.Item></div>
                                                                {(this.state.planFloorObj && this.state.planFloorObj.layoutStatus !== "ACTIVE") && <>
                                                                    <div className={(this.state.isDisableEdit === true?'plg-disable ':'')+(this.props.isRTL === "rtl" ? "settingbtnfno" : "")}>
                                                                        <Dropdown.Divider />
                                                                        <Dropdown.Item href="#" onClick={() => this.handleActivate()} style={{ color: (this.props.dmode ? "#2CC990" : "#5128a0"), fontWeight: "700" }}>{this.props.t('activeplanogram')}</Dropdown.Item></div>
                                                                </>}
                                                                {this.state.isedit?<>
                                                                    <Dropdown.Divider />
                                                                    <div className={(this.props.isRTL === "rtl" ? "settingbtnfno" : "")}><Dropdown.Item href="#" onClick={() => this.toggleBulkQRPrint()} style={{ color: (this.props.dmode ? "#2CC990" : "#5128a0"), fontWeight: "700" }}>{this.props.t('BULKQR_PRINT')}</Dropdown.Item></div>
                                                                </>:<></>}
                                                                {this.state.isedit?<>
                                                                    <Dropdown.Divider />
                                                                    <div className={(this.props.isRTL === "rtl" ? "settingbtnfno" : "")}><Dropdown.Item href="#" onClick={() => this.toggleBulkQRPrint("nonusedprod")} style={{ color: (this.props.dmode ? "#2CC990" : "#5128a0"), fontWeight: "700" }}>{this.props.t('NONUSED_PROD_PRINT')}</Dropdown.Item></div>
                                                                </>:<></>}
                                                                {this.state.isedit?<>
                                                                    <Dropdown.Divider />
                                                                    <div className={(this.props.isRTL === "rtl" ? "settingbtnfno" : "")}><Dropdown.Item href="#" onClick={() => this.toggleStoreCopy()} style={{ color: (this.props.dmode ? "#2CC990" : "#5128a0"), fontWeight: "700" }}>{this.props.t('Planogram_Store_Copy')}</Dropdown.Item></div>
                                                                </>:<></>}
                                                                {this.state.isedit ? <div className={(this.state.isDisableEdit === true?'plg-disable ':'')+(this.props.isRTL === "rtl" ? "settingbtnfno" : "")}>
                                                                    <Dropdown.Divider />
                                                                    <Dropdown.Item href="#" id="deleteplano" onClick={() => this.toggleSecureDelete()} style={{ color: "#b52225", fontWeight: "700" }}>{this.props.t('deleteplanogram')}</Dropdown.Item></div> : <></>}
                                                            </Dropdown.Menu>
                                                        </Dropdown>
                                                    </> : <></>}
                                                </Col>
                                            </Col>
                                        </Col>}

                                        <Col className="form-subcontent floorscroll" style={{ 
                                            minHeight: "auto", background: "#fff", borderRadius: "8px",
                                            // maxHeight:this.state.windowheight,overflowY:"auto" 
                                            }}>
                                            <div className={"FloorMapbox"} style={{overflowY:"auto",maxHeight:this.state.fittowidth?(this.state.mapWindowHeight):"none"}} id="FloorMapbox" ref={this.displaydiv} onMouseMove={(e) => this.handlerotation(e)} onMouseUp={(e => this.handleEndrotation(e))}>
                                                {/* && this.state.viewWidth > 0 */}
                                                {this.state.isselectedfloor &&
                                                    <svg id="mainsvg-view" className={"PDmap"+(this.state.zoompanactive?" svgzoom-action":"")} ref={this.svgfile} preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg" viewBox={'0 0 '+this.state.viewWidth+' '+this.state.viewHeight} onMouseDown={e => this.handleToolControls('mainsvg-view',"panstart",e,true)} onMouseUp={e => this.handleToolControls('mainsvg-view',"panstart",e,false)} onMouseMove={e => this.handleToolControls('mainsvg-view',"pan",e)} width={this.state.viewWidth+this.state.svgzoomissingwidth} >
                                                        
                                                        <rect x={0} y={0} width={this.state.viewWidth} height={this.state.viewHeight} strokeWidth={4} fill="none" style={{ stroke: (this.props.dmode?'#2CC990':'#5128a0') }} />
                                                        
                                                        {this.state.imagebase !== undefined && this.state.imagebase !== "" ? <defs>
                                                            <pattern id="img1" patternUnits="userSpaceOnUse" width={this.state.viewWidth} height={this.state.viewHeight}>
                                                                <image href={this.state.imagebase} x="0" y="0" width={this.state.viewWidth} height={this.state.viewHeight} alt="" />
                                                            </pattern>
                                                        </defs> : <></>}
                                                        <rect id="rectimage" fill="url(#img1)" y="0" x="0" height={this.state.viewHeight} width={this.state.viewWidth} onDragOver={(e) => this.dragEnd(e)}
                                                            onDrop={(e) => this.droppedNew(e, this.svgfile)} />
                                                        <image style={{userSelect: "none"}} href={this.state.imagebase} x="0" y="0" width={this.state.viewWidth} height={this.state.viewHeight} alt="" onDragOver={(e) => this.dragEnd(e)}
                                                            onDrop={(e) => this.droppedNew(e, this.svgfile)} onLoad={this.onloadimage} onError={this.onloadimage}  />


                                                        <g>
                                                            {this.state.rects.map((rect, i) =>
                                                                <React.Fragment key={i} >{!rect.isDelete ?
                                                                    rect.fields.map((field, d) => {

                                                                        return !field.isDelete ?
                                                                            <Rect key={d} pointerEvents="all"
                                                                                fill="red" 
                                                                                width={field.drawWidth} height={field.drawDepth}
                                                                                x={(field.x)} y={(field.y)} rotation={(field.rotation)} draggable={false} obj={rect} field={field}
                                                                                clickrack={this.clickrack} rectchangehandle={this.rectChangeHandle}
                                                                                isDisableEdit={this.state.isDisableEdit}
                                                                                rotateStart={this.state.rotateStart}
                                                                                Feildnoshow={this.state.Feildnoshow}
                                                                                planoLock={this.state.planoLock}
                                                                                selectedIsle={this.state.selectedIsle}
                                                                                rects={this.state.rects}
                                                                                drawuom={this.state.DrawUOM}
                                                                                drawFloorWidth={this.state.viewWidth}
                                                                                drawFloorHeight={this.state.viewHeight}
                                                                                isIsleSelected={this.state.isIsleSelected}
                                                                                checkThroughProducts={this.checkThroughProducts2}
                                                                                setConnectedfielddet={this.setConnectedfielddet}
                                                                                handlerotationStart={this.handlerotationStart}
                                                                                updateisels={this.updateisles}
                                                                                isRTL={this.props.isRTL}
                                                                                newislemiddleremoveleft={this.newislemiddleremoveleft}
                                                                                planoChangeHappen={this.planoChangeHappen} />
                                                                            : <rect key={d} />

                                                                    })
                                                                    : <rect key={i} />}
                                                                </React.Fragment>
                                                            )}
                                                        </g>
                                                        <g>
                                                            {this.state.IsleRects.map((aislerect, i) =>
                                                                <React.Fragment key={i} >
                                                                    <AisleRect 
                                                                        aislerect={aislerect} 
                                                                        aisleidx={i}
                                                                        isleRects={this.state.IsleRects}
                                                                        isDisableEdit={this.state.isDisableEdit}
                                                                        drawFloorWidth={this.state.viewWidth}
                                                                        drawFloorHeight={this.state.viewHeight}
                                                                        planoLock={this.state.planoLock}
                                                                        checkThroughProducts={this.checkThroughProducts2}
                                                                        handlerotationStart={this.handlerotationStart}
                                                                        planoChangeHappen={this.planoChangeHappen}
                                                                        updateIsleMoveChanges={this.updateIsleMoveChanges}
                                                                        clickaisle={this.clickaisle}
                                                                        />
                                                                </React.Fragment>
                                                            )}
                                                        </g>
                                                        {this.state.activePlanoShow && <g>
                                                            {this.state.activeplanogram && this.state.activeplanogram.aisles.map((isleA, q) =>
                                                                <React.Fragment key={q} >
                                                                    {/* var isSimulatedPlanogram=this.props.planogramState.PDplanogramDetails.isJustSimulated */}
                                                                      {/* var filteredActiveFields=isSimulatedPlanogram?activeisle.fields.filter(x=>x.department.departmentId!==this.props.planogramState.PDplanogramDetails.aisles[0].fields[0].department.departmentId):activeisle.fields */}
                                                                    {isleA.fields.filter(x=> this.props.planogramState.PDplanogramDetails.isJustSimulated ?
                                                                     x.department.departmentId!==this.props.planogramState.PDplanogramDetails.aisles[0].fields[0].department.departmentId
                                                                     : true).map((fieldA, a) => {
                                                                        return <ActiveplanogramLayout key={a}
                                                                            x={fieldA.x * this.state.drawratio}
                                                                            y={(fieldA.y) * this.state.drawratio}
                                                                            width={measureConverter(fieldA.uom, this.state.DrawUOM, fieldA.width) * this.state.drawratio}
                                                                            height={measureConverter(fieldA.uom, this.state.DrawUOM, fieldA.height) * this.state.drawratio}
                                                                            rotation={(fieldA.rotation)}
                                                                            field={fieldA}
                                                                        />
                                                                    })}
                                                                </React.Fragment>
                                                            )
                                                            }
                                                        </g>}

                                                        {(this.state.activetool === "pantool" && this.state.zoompanactive && this.state.startpan)?<rect x={0} y={0}  width={this.state.viewWidth} height={this.state.viewHeight} fill={(this.props.dmode?'#2CC990':'#5128a0')} fillOpacity={0.15} />:<></>}

                                                    </svg>}
                                                {!(this.state.imagebase) && !this.state.imgloading && this.state.isedit ? <img className="imgloading" src={loadinggif} style={{ height: "20px" }} alt="loading..." /> : <></>}

                                                {this.state.isviewcmenu &&  (this.state.planFloorObj && this.state.planFloorObj!==null?this.state.planFloorObj.layoutStatus !== "CONFIRMED":true)? <ContextMenu isview={this.state.isviewcmenu} handledelete={this.handleToggleDelete} handleselectisle={this.handleselectisle} handlview={this.handleViewField} handlclose={() => this.setState({ isviewcmenu: false, contxtmenu: null })} xpos={this.state.isviewcmenu ? this.state.contxtmenu.xpos : 0}
                                                    ypos={this.state.isviewcmenu ? this.state.contxtmenu.ypos : 0} isexpand={this.state.contxtmenu ? this.state.contxtmenu.isexpand : false} /> : <></>}
                                            </div>

                                        </Col>
                                        <Link to="/planograms"><Button variant="light" type="button">{this.props.t('btnnames.back')}</Button></Link>
                                        {this.state.isDisableEdit === false && (!this.state.planFloorObj || (this.state.planFloorObj && this.state.planFloorObj.layoutStatus !== "INACTIVE")) ? <>
                                            {this.state.isedit ? <>
                                                {(this.state.planFloorObj && this.state.planFloorObj.layoutStatus !== "ACTIVE" && this.state.planFloorObj.layoutStatus !== "CONFIRMED" && this.state.planFloorObj.layoutStatus !== "MERGE") && <>
                                                    <span onClick={() => this.handleConfirm()}><Button variant="primary" className={(this.props.isRTL === "rtl" ? "float-left" : "float-right")} type="button" style={{ borderRadius: "100px", marginLeft: "5px", background: "#5128a0", borderColor: "#5128a0" }}>{this.props.t('btnnames.confirm')}</Button></span>
                                                </>}

                                                {this.state.planFloorObj && this.state.planFloorObj.layoutStatus !== "ACTIVE" && this.state.planFloorObj.layoutStatus !== "MERGE" ? <span onClick={() => { this.ExportImage(2, false, false) }}>
                                                    <Button variant="success" className={(this.props.isRTL === "rtl" ? "float-left" : "float-right")} type="button" style={{ borderRadius: "100px", marginLeft: "5px", background: "#78da5f", color: "#5128a0" }}>{this.props.t('btnnames.update')}</Button>
                                                </span> : <></>}
                                                {this.state.activePlanoShow ? <span onClick={() => this.ReArrangeplano()}><Button variant="success" className={(this.props.isRTL === "rtl" ? "float-left" : "float-right")} type="button" style={{ borderRadius: "100px", marginLeft: "5px", background: "#ffc107" }}>{this.props.t('REARRANGE')}</Button></span> : <></>}
                                            </> : this.state.isselectedfloor && <span onClick={() => { this.ExportImage(1, false, false) }}><Button avariant="success" className={(this.props.isRTL === "rtl" ? "float-left" : "float-right")} type="button" style={{ borderRadius: "100px", marginLeft: "5px", background: "#78da5f", color: "#5128a0" }}>{this.props.t('btnnames.save')}</Button></span>
                                            }
                                        </> : <></>}
                                    </Col>
                                    <Col xs={12} lg={4}>
                                        <Col className={"contentview-main " + (this.state.planFloorObj != null ? "" : "d-none")} style={{ marginBottom: "10px", background: "#fff", borderRadius: "8px", padding: "8px 15px", boxShadow: "none" }}>
                                            <Table size="sm" style={{ marginBottom: "0px" }}>
                                                <tbody>
                                                    <tr>

                                                        {/* <td className={"draftsect" + (this.props.isRTL === "rtl" ? "RTL" : "")} style={{ width: "45%" }}>
                                                            <small style={{ fontSize: "12px", fontWeight: "700", color: "#5128a0" }}>{this.props.t('status')}</small><br />
                                                            <span className={"badge " + (this.state.planFloorObj ? (this.state.planFloorObj.layoutStatus === "ACTIVE" ? "bg-success" : this.state.planFloorObj.layoutStatus === "INACTIVE" ? "bg-danger" : "bg-warning") : "badge-secondary")} style={{ width: "100%", padding: "7px 5px" }}>{(this.state.planFloorObj != null ? this.state.planFloorObj.layoutStatus : "")}</span>
                                                        </td>
                                                        <td className={"draftsect1" + (this.props.isRTL === "rtl" ? "RTL" : "")} style={{ width: "55%" }}>
                                                            <small style={{ fontSize: "12px", fontWeight: "700", color: "#5128a0" }}>{this.props.t('version')}</small><br />
                                                            <label className="datashowlblVersion">{(this.state.planFloorObj && this.state.planFloorObj.mainVersion ? this.state.planFloorObj.mainVersion.replace(/ /g, '') : "")}</label>
                                                        </td> */}
                                                        <td colSpan="2" className={"draftsect" + (this.props.isRTL === "rtl" ? "RTL" : "")}>
                                                            <small style={{ fontSize: "14px", fontWeight: "700", color: "#5128a0" }}>{this.props.t('version')}</small><br />
                                                            <Dropdown className="versionselect-drop">
                                                                <Dropdown.Toggle>
                                                                    {this.state.planFloorObj ? (this.state.planFloorObj.layoutStatus + " - " + this.state.planFloorObj.mainVersion.replace(/ /g, '')) : <></>}
                                                                </Dropdown.Toggle>
                                                                <Dropdown.Menu>
                                                                    <Col id="pgversionlist" className="sub-content" onScroll={(e)=>this.getScrollPosition(e)}>
                                                                        {this.state.layoutVersionList && this.state.layoutVersionList.length > 0 ? this.state.layoutVersionList.map((nitem, nidx) => {
                                                                            return <React.Fragment key={nidx}><Dropdown.Item href="#" onClick={e => this.handleVersionChange(nitem)} className={"msg-link dropdown-item " + (nitem.status === "unseen" ? "active" : "")}>
                                                                                <Col style={{ paddingLeft: "0px" }}>
                                                                                    <Col className="subnote-col">
                                                                                        <span>{nitem.floorStatus + " - " + nitem.mainVersion.replace(/ /g, '')}</span>
                                                                                    </Col>
                                                                                </Col></Dropdown.Item></React.Fragment>;
                                                                        }) : <><h4 className="text-center" style={{ marginTop: "30%", fontWeight: "300" }}>NO VERSIONS AVAILABLE</h4></>}

                                                                        {this.state.verTotalCount && this.state.verTotalCount > 0 && this.state.isverloading?<>
                                                                            <label className="moreload-link" style={{width: "95%", textAlign: "center"}}>{this.props.t('DATA_LOADING_PLEASE_WAIT')}</label>
                                                                        </>:<></>}
                                                                    </Col>
                                                                    {/* <Dropdown.Divider />
                                                                    {this.state.verTotalCount && this.state.verTotalCount > (this.state.layoutVersionList && this.state.layoutVersionList.length > 0 ? this.state.layoutVersionList.length : 0) ?
                                                                        <label className="moreload-link" onClick={() => this.loadAlllayoutVersions(this.state.verStartIndex, false)}>{this.props.t('MORE_VERSIONS')}</label> : <></>} */}
                                                                </Dropdown.Menu>
                                                            </Dropdown>
                                                        </td>
                                                    </tr>
                                                    <tr>
                                                        <td colSpan="2" style={{ border: "none" }}>
                                                            <small style={{ fontSize: "14px", fontWeight: "700", color: "#5128a0" }}>{(this.state.planFloorObj && this.state.planFloorObj.layoutStatus === "ACTIVE") ? this.props.t('activationdate') : this.props.t('date')}</small><br />
                                                            <span style={{ fontWeight: "700", color: "#5128a0" }}>{(this.state.planFloorObj != null ? (this.state.planFloorObj.layoutStatus === "ACTIVE" ? this.convertDateText((this.state.planFloorObj.activeDate ? this.state.planFloorObj.activeDate : this.state.planFloorObj.date)) : this.convertDateText(this.state.planFloorObj.date)) : "")}</span>
                                                        </td>
                                                    </tr>
                                                </tbody>
                                            </Table>
                                        </Col>
                                                                         
                                        {this.state.isShowDeptChanges ? <OverviewChanges isRTL={this.props.isRTL} loadDeptProdChangesList={this.loadDeptProdChangesList} issaledataloading={this.state.issaledataloading} changeFilterdate={this.changeFilterdate} resetFilterdate={this.resetFilterdate} fcfromdate={this.state.fcfromdate} fctodate={this.state.fctodate} changeDepProdList={this.changeDepProdList} departmentprodchanges={this.state.departmentprodchanges} dmode={this.props.dmode} handleloadmorefc={this.handleLoadmoreChanges} fcallcount={this.state.fcallcount} fieldchangeslist={this.state.loadedFieldChangesList} planogramDetails={this.props.planogramState} /> : <></>}

                                    </Col>
                                </Row>
                            </div>
                        </div>
                        <div style={{ display: "none" }}>
                            <canvas ref={this.testcanvas}></canvas>
                        </div>
                    </div>
                </Col>


                <Modal size="md" show={this.state.show} id="tagTbl" className='tagadd-modal' onHide={this.hideModal} dir={this.props.isRTL}>
                    <Modal.Header >
                        <div className={"btn btn-danger float-right tagswitch "+(this.props.isRTL === "rtl" ? "tswitchRTL" : "tswitch")+(this.state.tagModalType === 2?" activetab":"")} onClick={this.handleTagSwitch}>
                            <div className='bg-switchcolor'></div>
                            <label className='srchtag'>{this.props.t('srchtag')}</label>
                            <label className='newtag'>{this.props.t('newtag')}</label>
                        </div>
                        <Modal.Title>{this.props.t('addtags')}</Modal.Title>
                    </Modal.Header>
                    <Modal.Body style={{ padding: "15px 20px" }}>
                        {this.state.tagModalType === 1?<>
                            <InputGroup size="sm" className="mb-3 search-content">
                                <Form.Control aria-label="Small" placeholder={this.props.t('searchtagplace')} aria-describedby="inputGroup-sizing-sm" onKeyUp={e => this.handleSearchTags(e.target.value)}/>
                                <InputGroup.Text id="inputGroup-sizing-sm"><SearchIcon size={18}/></InputGroup.Text>
                            </InputGroup>
                        </>:<>
                            <InputGroup size="sm" className="mb-3 search-content">
                                <InputGroup.Text id="inputGroup-sizing-sm"><PlusIcon size={18}/></InputGroup.Text>
                                <Form.Control aria-label="Small" placeholder={this.props.t('newtagplace')} value={this.state.newtag.tagName} onChange={e => this.changeNewTag("tagName", e.target.value)} aria-describedby="inputGroup-sizing-sm" onKeyDown={e => this.handleTagSave(e)}/>
                            </InputGroup>
                        </>}
                        
                        <Col className='taglist-scroll'>
                            {/* <Table style={{ marginTop: "-15px", marginBottom: "0px" }}>
                                <tbody>
                                    <tr className={this.state.tagModalType === 1 ? "" : "d-none"}>
                                        <td width="400px" style={{ borderBottom: "none" }}>
                                            <Form.Group>
                                                <AcInput atype="text" aid="tagName" adefval={this.state.stobj.tagName} aobj={this.state.stobj} avset={this.state.vobj} avalidate={[ValT.empty]} akeyenter={this.handleSearchTags} aplace={this.props.t('srchtagname')} />
                                            </Form.Group>
                                        </td>
                                        <td style={{ borderBottom: "none" }}><Button variant="outline-danger" style={{ marginTop: "27px", textTransform: "uppercase" }} onClick={this.handleSearchTags}>{this.props.t('btnnames.search')}</Button></td>
                                    </tr>
                                    <tr className={this.state.tagModalType === 2 ? "" : "d-none"}>
                                        <td width="400px" style={{ borderBottom: "none" }}>
                                            <Form.Group>
                                                <AcInput atype="text" aid="tagName" adefval={this.state.newtag.tagName} aobj={this.state.newtag} avset={this.state.vobj} avalidate={[ValT.empty]} aplace="New Tag Name" showlabel={true} />
                                            </Form.Group>
                                        </td>
                                        <td style={{ borderBottom: "none" }}><label style={{ marginTop: "27px" }} ><AcButton avariant="outline-success" asubmit={submitCollection.saveTags} aobj={this.state.newtag} avalidate={this.state.vobj} aclass="f" atype="button" aresp={e => this.handleTagSave(e)}>ADD</AcButton></label></td>
                                    </tr>
                                </tbody>
                            </Table> */}

                            <Table striped bordered hover size="sm" className={this.state.toridata.length > 0 ? "" : "d-none"} style={{ marginTop: "-5px", marginBottom: "0px" }}>
                                <tbody>
                                    {this.state.toridata.map((item, index) => (
                                        <tr key={index}>
                                            <td width="500px" style={{ fontSize: "14px", fontWeight: "600", color: "#5327a0" }}>{item.tagName}</td>
                                            <td align="center"><Button variant="outline-danger" size="sm" onClick={e => this.addTag(index)} style={{ padding: "0px 4px 1px", borderRadius: "50%" }}><PlusIcon size={16} /></Button></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </Table>

                            {this.state.loadingTagView === true?
                                <Col xs={12} className="loading-col"><img className='loader-gif' src={loader} alt="loader"/></Col>
                            :
                                <Col className={'no-results-txt '+(this.state.toridata.length > 0 ?"d-none":"")}>{this.props.t("NO_RESULT_FOUND")}</Col>
                            }  
                        </Col>

                    </Modal.Body>
                    <Modal.Footer style={{ padding: "5px" }}>
                        <Button variant="light" size="sm" onClick={this.hideModal}>{this.props.t('btnnames.close')}</Button>
                    </Modal.Footer>
                </Modal>

                <Modal size="sm" dir={this.props.isRTL}
                    show={this.state.shareModalShow} onHide={this.hideShareModal} aria-labelledby="example-modal-sizes-title-sm">
                    <Modal.Header style={{ padding: "5px" }}>
                        <Modal.Title>{this.props.t('SHARE_QR')}</Modal.Title>
                    </Modal.Header>

                    <Modal.Body>
                        <Form.Group>
                            <Form.Label style={{ marginBottom: "0px" }}>{this.props.t('EMAIL')}</Form.Label>
                            <Form.Control  type="text" size="sm" onChange={(e)=>{this.handleChangeShareEmail(e,e.target.value)}} value={this.state.qrShareObj.email} id="qrshareemail" />
                        </Form.Group>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button size="sm" variant="success" onClick={this.qrShare}>{this.props.t('SHARE')}</Button>
                        <Button size="sm" variant="light" onClick={this.hideShareModal}>{this.props.t('btnnames.close')}</Button>
                    </Modal.Footer>
                </Modal>

                <Modal show={this.state.deleteSecureModal} dialogClassName="modal-50w" className='deletesecure-modal' style={{direction: this.props.isRTL}} onHide={this.toggleSecureDelete}>
                    <Modal.Header style={{ padding: "8px 15px" }}>
                        <Modal.Title style={{ fontWeight: "700", fontSize: "20px", color: "#5128a0" }}>{this.props.t('deleteplanogram')}</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <div className='curver-txt'>{this.props.t("current_version")}: <label>{this.props.planogramState && this.props.planogramState.PDplanogramDetails?this.props.planogramState.PDplanogramDetails.mainVersion:"-"}</label></div>
                        <Form.Group>
                            <Form.Label style={{ marginBottom: "0px", fontSize: "14px", fontWeight: "600" }}>{this.props.t('entervdlteplano')}</Form.Label>
                            <Form.Control id="entervno" type="text" value={this.state.deleteSecureTxt}  autoFocus onChange={(e) => this.changeSecureTxt(e)} />
                        </Form.Group>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button size="sm" variant="danger" style={{ borderRadius: "15px", fontWeight: "700", padding: "3px 15px" }} onClick={() => this.handlPlDelete(3, false, false)}>{this.props.t('btnnames.delete')}</Button>
                        <Button size="sm" variant="light" onClick={this.toggleSecureDelete}>{this.props.t('btnnames.close')}</Button>
                    </Modal.Footer>
                </Modal>

                {this.state.showBulkPrintModal?<BulkQRModal isRTL={this.props.isRTL} t={this.props.t} dmode={this.props.dmode}
                    showBulkPrintModal={this.state.showBulkPrintModal}
                    rects={this.state.rects}
                    floorlayoutId={(this.state.planFloorObj?this.state.planFloorObj.id:0)}
                    isNonSimExport={this.state.isNonSimExport}
                    triggerBulkQR={this.triggerBulkQR}
                    toggleBulkQRPrint={this.toggleBulkQRPrint}
                />:<></>}
                
                {this.state.showStoreCopyModel?<StoreCopyModel isRTL={this.props.isRTL} t={this.props.t} dmode={this.props.dmode}
                    showModel={this.state.showStoreCopyModel}
                    isNonSimExport={this.state.isNonSimExport}
                    triggerBulkQR={this.triggerBulkQR}
                    togglehide={this.toggleStoreCopy}
                    floorlayoutId={(this.state.planFloorObj?this.state.planFloorObj.id:0)}
                    storeId={this.props.storeId}
                    regions={this.state.regions}
                    departmentlist={this.state.departmentlist}
                />:<></>}


                <div className={`sidebar-menu2${this.state.isshowQRpanel === true ? ' open' : ''} ` + ((this.props.isRTL === "rtl") ? "RTL" : "")}>
                    <span className="close-link" onClick={this.hideQRsidebar}><XCircleFillIcon className={((this.props.isRTL === "rtl") ? "float-left" : "float-right")} size={16} /></span>


                    {this.state.isshowQRpanel?<div className="PDsidemenu" dir={this.props.isRTL}>
                        {(this.state.QRobj && this.state.QRobj.fieldDto ? <>
                            {/* <h4 className="fieldNo_title"> Field ID - {this.state.QRobj.fieldDto.id}</h4> */}
                            <TooltipWrapper text={("FLN "+(this.state.QRobj.noInFloorLayout > 0? this.state.QRobj.noInFloorLayout : "0")+" : "+(this.state.QRobj && this.state.QRobj.fieldDto ? this.state.QRobj.fieldDto.fieldName : this.state.QRobj.f_uuid))}>
                                <p className="fieldNo_id">FLN {this.state.QRobj ? this.state.QRobj.noInFloorLayout : "0"} : {this.state.QRobj && this.state.QRobj.fieldDto ? this.state.QRobj.fieldDto.fieldName : this.state.QRobj.f_uuid}
                                    {this.state.QRobj && this.state.QRobj.uuid ? <small style={{ color: "#555", fontSize: "12px", marginTop: "-4px", display: "block" }}>{this.state.QRobj.uuid}</small> : <></>}
                                </p>
                            </TooltipWrapper>

                            <Row className="imgrow">
                                <Col xs={6}>
                                    <Col className="view-wrapper image-wrapper " style={{ padding: "4px", background: "#fff", borderRadius: "4px", height: "148px", overflow: "hidden", border: "1px solid #5128a0" }}>
                                        <Image src={this.state.QRobj && this.state.QRobj.fieldDto && this.state.QRobj.fieldImageUrl? this.state.QRobj.fieldImageUrl : defaultshelfimg} fluid />
                                    </Col>
                                </Col>
                                <Col xs={6}>
                                    <Col id="qrcontent" className={"view-wrapper "+((this.state.QRobj && this.state.QRobj.uuid && this.state.QRobj.uuid !== "" && this.state.QRobj.id > 0 && this.state.QRobj.department && this.state.QRobj.department.departmentId > 0 && this.state.QRobj.noInFloorLayout > 0)? "" : "d-none")} style={{ padding: "8px", background: "#fff", border: "1px solid #5128a0", borderRadius: "4px", textAlign: 'center' }}>
                                        {this.state.QRobj && this.state.QRobj.uuid && this.state.QRobj.uuid !== ""?<QRCode value={this.state.QRobj ? (this.state.QRobj.uuid) : "QRID"} size={125} />
                                        :<><h6 style={{marginTop:"45%",fontSize:"14px"}}>{this.props.t("NO_UUID")}</h6></>}
                                    </Col>

                                    {this.state.QRobj && this.state.QRobj.uuid && this.state.QRobj.uuid !== "" && this.state.QRobj.id > 0 && this.state.QRobj.department && this.state.QRobj.department.departmentId > 0 && this.state.QRobj.noInFloorLayout > 0?
                                    <div style={{ textAlign: 'center', position: "absolute", top: "35px", opacity: "0", zIndex: "-10000" }}>
                                        <Col id="qrcontent2" style={{ padding: "25px", background: "#fff", borderRadius: "4px" }}>
                                            <QRCode style={{ float: "center" }} value={this.state.QRobj ? (this.state.QRobj.uuid) : "QRID"} size={512} /><br />
                                            {/* <label style={{ fontSize: "20px", float: "center", textTransform: "uppercase" }}>{this.state.QRobj ? this.state.QRobj.uuid : ""}</label><br /> */}
                                            <label style={{ fontSize: "32px", fontWeight: "700", float: "center" }}>{this.state.QRobj ? ((this.state.QRobj.department ? this.state.QRobj.department.name : "") + (this.state.QRobj.noInFloorLayout > 0 ? (" - " + this.state.QRobj.noInFloorLayout) : "")) : ""} </label>
                                        </Col>
                                    </div>:<></>}
                                </Col>
                            </Row>
                            <Row className={(this.state.QRobj && this.state.QRobj.uuid && this.state.QRobj.uuid !== "" && this.state.QRobj.id > 0 && this.state.QRobj.department && this.state.QRobj.department.departmentId > 0 && this.state.QRobj.noInFloorLayout > 0)? "" : "d-none"}>
                                <Col md={6}></Col>
                                <Col md={6} className="qrbtncol">
                                    <Button variant="outline-primary" onClick={this.qrPrintPDF} className="qrbtn" size="sm" title={this.props.t("Print_QR")}><InboxIcon size={14} /> {this.props.t("btnnames.download")}</Button>
                                    <Button variant="outline-secondary" onClick={this.showShareModal} className="qrbtn" size="sm" title={this.props.t("SHARE_QR")}><FileSymlinkFileIcon size={14} /> {this.props.t("btnnames.share")}</Button>
                                </Col>
                            </Row>

                            <Col className={"subcontent-div "+(this.state.isDisableEdit === true?'plg-readonly':'')} style={{ height: "calc(100vh - 370px)", border: "1px solid #ccc", marginTop: "8px", overflow: "hidden", overflowY: "auto", background: "#fff", padding: "10px" }}>
                                {/* {console.log(this.state.QRobj.id)} */}

                                {/* <Row className="form-vals">
                                    {this.state.QRobj.id && ((this.state.QRobj.id > 0) ? <Col md={6} style={{ marginBottom: "8px" }}><Form.Label style={{ marginBottom: "0px" }}>{this.props.t("fieldid")}:</Form.Label><Col style={{ padding: "0px" }}><span>{this.state.QRobj.id}</span></Col></Col> : <></>)}
                                </Row> */}
                                {/* <Row className="form-vals">
                                    {(this.state.QRobj.leftSideFieldDto && (this.state.QRobj.leftSideFieldDto.isDelete !== true)) ? <Col md={6} style={{ marginBottom: "8px" }}><Form.Label style={{ marginBottom: "0px" }}>{this.props.t("leftfield")}:</Form.Label><Col style={{ padding: "0px" }}><span>{(this.state.QRobj.leftSideFieldDto && (this.state.QRobj.leftSideFieldDto.isDelete !== true)) && (this.state.QRobj.leftSideFieldDto.leftFloorFieldId && (this.state.QRobj.leftSideFieldDto.leftFloorFieldId === -1) ? this.state.QRobj.leftSideFieldDto.leftFloorFieldUUID : this.state.QRobj.leftSideFieldDto.leftFloorFieldId)}</span></Col></Col> : <></>}
                                    {(this.state.QRobj.rightSideFieldDto && (this.state.QRobj.rightSideFieldDto.isDelete !== true)) ? <Col md={6} style={{ marginBottom: "8px" }}><Form.Label style={{ marginBottom: "0px" }}>{this.props.t("rightfield")}:</Form.Label><Col style={{ padding: "0px" }}><span>{(this.state.QRobj.rightSideFieldDto && (this.state.QRobj.rightSideFieldDto.isDelete !== true)) && (this.state.QRobj.rightSideFieldDto.rightFloorFieldId && (this.state.QRobj.rightSideFieldDto.rightFloorFieldId === -1) ? this.state.QRobj.rightSideFieldDto.rightFloorFieldUUID : this.state.QRobj.rightSideFieldDto.rightFloorFieldId)}</span></Col></Col> : <></>}
                                </Row> */}
                                {/* <Row className="form-vals">
                                    {(this.state.QRobj.isRightChange) ? <Col md={6} style={{ marginBottom: "8px" }}><Form.Label style={{ marginBottom: "0px" }}>{this.props.t("ISRIGHTCHANGE")}:</Form.Label><Col style={{ padding: "0px" }}><span>true</span></Col></Col> : <></>}
                                    {(this.state.QRobj.isLeftChange) ? <Col md={6} style={{ marginBottom: "8px" }}><Form.Label style={{ marginBottom: "0px" }}>{this.props.t("ISLEFTCHANGE")}:</Form.Label><Col style={{ padding: "0px" }}><span>true</span></Col></Col> : <></>}
                                </Row> */}

                                <Row className="form-vals">
                                    <Col md={12} style={{ marginBottom: "8px" }}>
                                        <Form.Label style={{ marginBottom: "0px" }}>{this.props.t('fieldtype')}</Form.Label>
                                        <Col style={{ padding: "0px" }}>
                                            <TooltipWrapper text={this.state.QRobj.fieldDto.fieldName}><span>{this.state.QRobj.fieldDto.fieldName}</span></TooltipWrapper>
                                        </Col>
                                        <Col className='leftrightfields'>
                                            {(this.state.QRobj.leftSideFieldDto && (this.state.QRobj.leftSideFieldDto.isDelete !== true)) ? <span title={this.props.t("have_left_field")}><HaveLeftFieldIcon /></span>: <></>}
                                            {(this.state.QRobj.rightSideFieldDto && (this.state.QRobj.rightSideFieldDto.isDelete !== true)) ? <span title={this.props.t("have_right_field")}><HaveRightFieldIcon /></span> : <></>}
                                        </Col>
                                    </Col>
                                   
                                    
                                </Row>
                                <Row>
                                    <Col md={4}><Form.Label>{this.props.t('width')}</Form.Label></Col>
                                    <Col md={4}> <Form.Label>{this.props.t('height')}</Form.Label></Col>
                                    <Col md={4}> <Form.Label>{this.props.t('depth')}</Form.Label></Col>
                                </Row>
                                <Row className="form-vals" style={{ marginTop: "-10px" }}>
                                    <Col md={4}><span>{(this.state.QRobj.masterFieldWidth)}{(this.state.QRobj.masterFieldUom && this.state.QRobj.masterFieldUom !== "none" ? this.state.QRobj.masterFieldUom : this.state.QRobj.fieldDto.uom)}</span></Col>
                                    <Col md={4}><span>{this.state.QRobj.masterFieldHeight}{this.state.QRobj.masterFieldUom && this.state.QRobj.masterFieldUom !== "none" ? this.state.QRobj.masterFieldUom : this.state.QRobj.fieldDto.uom}</span></Col>
                                    <Col md={4}><span>{this.state.QRobj.masterFieldDepth}{this.state.QRobj.masterFieldUom && this.state.QRobj.masterFieldUom !== "none" ? this.state.QRobj.masterFieldUom : this.state.QRobj.fieldDto.uom}</span></Col>
                                </Row>
                                <Form.Group className='form-group-new'>
                                    <Form.Label style={{ marginBottom: "0px" }}>{this.props.t('department')}</Form.Label>
                                    <Select 
                                        id="sbardepid"
                                        menuPlacement="bottom"
                                        placeholder={this.props.t("selectdepartment")} 
                                        options={filterBranchList} 
                                        onChange={(e)=>this.handleFieldBar(e, 1)} 
                                        value={filterBranchList.find(x=>x.value===(this.state.QRobj && this.state.QRobj.department ? this.state.QRobj.department.departmentId : -1))} //:filterBranchList[0]
                                        className="filter-selec2" size="sm" classNamePrefix="searchselect-inner" 
                                        maxMenuHeight={160}    
                                    />

                                    {/* <Form.Control id="sbardepid" size="sm" as="select" onChange={(e) => this.handleFieldBar(e, 1)} value={this.state.QRobj && this.state.QRobj.department ? this.state.QRobj.department.departmentId : -1}
                                    disabled={(this.state.planFloorObj && this.state.planFloorObj.layoutStatus === "CONFIRMED")}>
                                        <option value="-1">{this.props.t('selectdepartment')}</option>

                                        {this.state.loadedDeptList.map((ditem, didx) => {
                                            return <option key={didx} value={ditem.departmentId}>{ditem.name}</option>;
                                        })}
                                    </Form.Control> */}
                                </Form.Group>
                                <Form.Group className='form-group-new'>
                                    <Form.Label style={{ marginBottom: "0px" }}>{this.props.t('fieldno')}</Form.Label>
                                    <Form.Control id="sbardepid" size="sm" as="select" disabled={(this.state.planFloorObj && this.state.planFloorObj!==null? (this.state.planFloorObj.layoutStatus !== "CONFIRMED"):true) && (this.state.QRobj && this.state.QRobj.department && !(this.state.QRobj.department.departmentId === -1))? false : true} onChange={(e) => this.handleFieldBar(e, 3)} value={this.state.QRobj && this.state.QRobj.noInFloorLayout ? this.state.QRobj.noInFloorLayout : -1}>
                                        <option value="-1">{this.props.t('selctfieldno')}</option>

                                        {this.state.loadedFnamenumbers.map((ditem, didx) => {
                                            return <option key={didx} value={ditem}>{ditem}</option>;
                                        })}
                                    </Form.Control>
                                </Form.Group>
                                <Form.Group className='form-group-new'>
                                    <Form.Label style={{ marginBottom: "0px" }}>{this.props.t('notes')}</Form.Label>
                                    <Form.Control as="textarea" id="sbartxtarea" rows={2} onChange={(e) => this.handleFieldBar(e, 2)} value={this.state.QRobj.notes} 
                                    disabled={(this.state.planFloorObj && this.state.planFloorObj.layoutStatus === "CONFIRMED")} />
                                </Form.Group>
                            </Col>
                        </>
                            : <></>)}

                        <div className="qrsavediv" style={{ textAlign: "right" }}>
                            {(this.state.QRobj.id > 0 ? <Button variant="secondary" className={"vfieldbtn " + (this.props.isRTL === "rtl" ? "float-right" : "float-left")} size="sm" onClick={() => this.handleSaveFieldData(2)} style={{ borderRadius: "15px" }}>{this.props.t('viewfield')}</Button> : <></>)}
                            {this.state.isDisableEdit === false && (!this.state.planFloorObj || (this.state.planFloorObj && this.state.planFloorObj.layoutStatus !== "ACTIVE" && this.state.planFloorObj.layoutStatus !== "INACTIVE")) ? <>
                                {this.state.planFloorObj && this.state.planFloorObj.layoutStatus !== "CONFIRMED"?<>
                                    <Button variant="danger" className="vfieldbtn" size="sm" onClick={() => this.handleToggleDelete()} style={{ marginLeft: "20px", borderRadius: "15px" }}>{this.props.t('btnnames.delete')}</Button>
                                    <Button variant="success" className="vfieldbtn" size="sm" onClick={() => this.handleSaveFieldData(1)} style={{ borderRadius: "15px", background: "rgb(120, 218, 95)" }}>{this.props.t('btnnames.save')}</Button>
                                </>:<></>}
                            </> : <></>}
                        </div>


                    </div>:<></>}

                </div>

                <AcViewModal showmodal={this.state.loadingscreen} />

                {this.state.isShowNewField ? <NewFieldMdView dunitState={this.props.dunitState} selectedStore={this.state.selStoreId} showeditview={this.state.isShowNewField} getFieldsList={this.getProductList} togglefieldmd={this.toggleFieldMdView} dmode={this.props.dmode} isRTL={this.props.isRTL} /> : <></>}
            </div>
        )
    }
}

function ContextMenu(props) {


    var xPos = props.xpos;
    var yPos = props.ypos;
    var showMenu = props.isview;
    const handleClick = (type) => {
        if (type === 2) {
            props.handledelete();
        } else if (type === 1) {
            props.handlview();
        } else if (type === 4) {
            props.handleselectisle();
            props.handlclose();
        } else {
            props.handlclose();
        }
    }

    if (showMenu)
        return (<div className="prodcontext-menu" style={{ top: yPos, left: xPos, }}>
            <ul>
                {/* <li onClick={() => handleClick(1)}>View</li> */}
                <li onClick={() => handleClick(2)}>Delete</li>
                <hr />
                {/* <li onClick={() => handleClick(4)}>Select Isle</li>
                <hr /> */}
                <li onClick={() => handleClick(3)}>Close</li>
            </ul>
        </div>
        );
    else return null;
}

class Rect extends React.Component {
    constructor() {
        super();

        this.state = {
            rotationEnable: false,
            startx: 0,
            starty: 0,

            beforeremoveisle: {}

        }
    }
    makeisleobj=(Cfield,aisles)=>{
        var SField=Cfield
        var allaisle=aisles
        var isleobj=null
        for (let i = 0; i < allaisle.length; i++) {
            const aisle = allaisle[i];
            var haveField=aisle.fields.find(x=>x.f_uuid===SField.f_uuid)
            if(haveField){
                for (let k = 0; k < aisle.fields.length; k++) {
                    const field =  aisle.fields[k];
                    //check last field
                    if(field.leftSideFieldDto===undefined||field.leftSideFieldDto.isDelete===true){
                        isleobj["lastField"]=field
                    }
                    if(field.rightSideFieldDto===undefined||field.rightSideFieldDto.isDelete===true){
                        isleobj["firstField"]=field
                    }
                }
                // haveField.leftSideFieldDto&&haveField.leftSideFieldDto.isDelete!==true?
                break
            }
            
        }

    }
    componentDidMount() {
        //console.log(this.props.rects);
        //console.log("this one");
        // console.log(this.props.field);
        var dragthis = false;
        var isdrag = false;

        if(this.props.isDisableEdit === false){
            const handleDrag = d3.drag()

                .on('start', (event) => {
                    this.setState({ startx: this.props.field.x, starty: this.props.field.y })
                    // console.log(this.props.field);
                    // console.log(this.props.rects);
                    // this.makeisleobj(this.props.field,this.props.rects)
             

                })
                .on('drag', (event) => {
                    if (!this.props.planoLock&&!this.props.isIsleSelected) {
                        var allowdrag = true
                        if ((event.dx > -3 || event.dx < 3) && (event.dy > -3 || event.dy < 3)) {
                            dragthis = true
                            //console.log(event);
                        }
                        if (dragthis === true) {
                            // isdrag = true
                            var newEvent = Object.assign({}, event);
                            newEvent.x = event.x - (this.props.field.drawWidth) / 2;
                            newEvent.y = event.y - (this.props.field.drawDepth) / 2;
                            // console.log(this.props.field)
                            //check product over lapping
                            if (this.props.field.isProductOverLapping) {
                                allowdrag = false;
                            }
                            if (this.props.field.leftSideFieldDto) {
                                if (this.props.field.leftSideFieldDto.leftFloorFieldInfo) {
                                    if (this.props.field.leftSideFieldDto.leftFloorFieldInfo.isProductOverLapping) {
                                        allowdrag = false;
                                    }
                                }
                            }
                            if (allowdrag) {
                                isdrag = true
                                this.props.rectchangehandle(newEvent, this.props.field);
                            } else {
                                alertService.error(i18n.t("CANNOTDRAG_HAS_OVERLAP_PRODUCT"))
                            }
                        }
                        // }
                    }
                })
                .on('end', (event) => {
                    if (!this.props.planoLockk&&!this.props.isIsleSelected) {
                        // console.log(event.x, event.y);
                        if (isdrag === true) {
                            this.props.planoChangeHappen();
                            // console.log(this.props.rects);
                            var isles = this.props.rects
                            var filterIsles = isles.filter(x => x.isDelete === false);
                            var allowToAdd = true;
                            if (filterIsles.length > 0) {
                                for (let index = 0; index < filterIsles.length; index++) {
                                    const rect = filterIsles[index];
                                    const filterFields = rect.fields.filter(x => x.isDelete === false);
                                    for (let i = 0; i < filterFields.length; i++) {
                                        // console.log(filterFields[i]);
                                        var rectAllow = true;
                                        if (filterFields[i].f_uuid !== this.props.field.f_uuid) {
                                            rectAllow = this.props.checkThroughProducts((event.x - (this.props.field.drawWidth) / 2), (event.y - (this.props.field.drawDepth) / 2), this.props.field.drawWidth, this.props.field.drawDepth, filterFields[i], this.props.field.rotation);
                                        }
                                        if (!rectAllow) {
                                            allowToAdd = false
                                            break;
                                        }
                                    }
                                }
                            }
                            var newEvent = Object.assign({}, event);
                            var mapleft = {}
                            var mapright = {}
                          
                            if (allowToAdd) {
                                var snapdrag = this.snapdragallow(event.x, event.y);
                                //console.log(snapdrag);
                                if (snapdrag.snap) {
                                    var isInsideofFloorSnap=checkIsInsideofBox(this.props.drawFloorWidth, this.props.drawFloorHeight, 0, 0,this.props.field.drawWidth, this.props.field.drawDepth, snapdrag.x, snapdrag.y,this.props.field.rotation)
                                    //console.log("existing isle new pot");
                                    if(isInsideofFloorSnap){
                                        newEvent.x = snapdrag.x
                                        newEvent.y = snapdrag.y;
                                        this.removeconnections();
                                        // this.removefromisle(snapdrag);
                                        this.addtoexistingisle(snapdrag);
                                        //console.log(this.props.rects);
                                        this.addleftright(snapdrag);
                                    }else{
                                        newEvent.x = this.state.startx
                                        newEvent.y = this.state.starty;
                                    }
                                    

                                } else {
                                    var isInsideofFloor=checkIsInsideofBox(this.props.drawFloorWidth, this.props.drawFloorHeight, 0, 0,this.props.field.drawWidth, this.props.field.drawDepth, (event.x - (this.props.field.drawWidth) / 2), (event.y - (this.props.field.drawDepth) / 2),this.props.field.rotation)
                                    
                                    //if is inside floor
                                    if(isInsideofFloor){
                                        //console.log("new isle new pot");
                                        newEvent.x = event.x - (this.props.field.drawWidth) / 2;
                                        //console.log("n e:" + newEvent.x);
                                        newEvent.y = event.y - (this.props.field.drawDepth) / 2;
                                        this.removeconnections();
                                        this.newislecreate(snapdrag);
                                    }else{
                                        newEvent.x = this.state.startx
                                        newEvent.y = this.state.starty;
                                    }
                                    
                                    
                                }
                            }
                            else {
                                newEvent.x = this.state.startx
                                newEvent.y = this.state.starty;
                                //console.log("false part not allow drag");
                            }
                            this.props.rectchangehandle(newEvent, this.props.field, mapleft, mapright);
                        }
                        isdrag = false;
                        dragthis = false
                    }
                });
            // const node = ReactDOM.findDOMNode(this);
            // if (node) {
            handleDrag(d3.select(this[this.props.obj.f_uuid]))
            // }
        }
        
    }

    addleftright = (snap) => {
        var isles = this.props.rects;
        //console.log(isles);
        var updatefield = null;
        // var newis;
        var isnewo = snap.selected.isNew;
        //console.log(isnewo);
        var id = snap.selected.id

        for (let index = 0; index < isles.length; index++) {
            const field = isles[index].fields;
            var newcfieldlist = snap.selected;
            updatefield = field.find(x => x.f_uuid === snap.selected.f_uuid);
            //console.log(updatefield);
            if (updatefield !== undefined) {


                var haveright = false
                var haveleft = false
                if (snap.selected.rightSideFieldDto) {
                    haveright = true
                }
                if (snap.selected.leftSideFieldDto) {
                    haveleft = true
                }


                if (snap.right) {
                    //console.log(haveright, newcfieldlist)
                    var side = "left";
                    if (haveright === false) {
                        newcfieldlist["rightSideFieldDto"] = { rightFloorFieldId: snap.id, rightFloorFieldUUID: snap.right, isNew: true, isDelete: false };
                        newcfieldlist["isRightChange"] = true
                        //console.log("have right");
                    } else {
                        /* console.log("dont have right", snap.right)
                        console.log("snap.right", snap.right)
                        console.log("snap.idright", snap.id) */
                        newcfieldlist.rightSideFieldDto.rightFloorFieldUUID = snap.right
                        newcfieldlist.rightSideFieldDto.rightFloorFieldId = snap.id
                        newcfieldlist.rightSideFieldDto.isNew = false
                        newcfieldlist.rightSideFieldDto.isDelete = false

                    }

                    this.props.setConnectedfielddet(snap.right, isnewo, id, side, newcfieldlist.f_uuid);

                }
                if (snap.left) {
                    var side2 = "right";
                    if (haveleft === false) {
                        newcfieldlist["leftSideFieldDto"] = { leftFloorFieldId: snap.id, leftFloorFieldUUID: snap.left, isNew: true, isDelete: false }
                        newcfieldlist["isLeftChange"] = true
                        //console.log("have left");
                    } else {
                        /* console.log("dont have left", snap.left);
                        console.log("snap.id left", snap.id);
                        console.log("snap.left", snap.left); */
                        newcfieldlist.leftSideFieldDto.leftFloorFieldUUID = snap.left
                        newcfieldlist.leftSideFieldDto.leftFloorFieldId = snap.id
                        newcfieldlist.leftSideFieldDto.isNew = false
                        newcfieldlist.leftSideFieldDto.isDelete = false

                    }
                    // newcfieldlist["leftSideFieldDto"] = {id:snap.selected.rightSideFieldDto.id, leftFloorFieldId: snap.id, leftFloorFieldUUID: snap.left, isNew: newis, isDelete: false }
                    this.props.setConnectedfielddet(snap.left, isnewo, id, side2, newcfieldlist.f_uuid);
                }
                //console.log(isles);
                var newfields = field.filter(x => x.f_uuid !== snap.selected.f_uuid);
                //console.log(newfields);
                newfields.push(newcfieldlist)
                //console.log(newfields);
                //console.log(isles[index]);
                isles[index].fields = newfields
                //console.log(this.props.rects);
            }


        }



    }
    removefromisle = (snapdrag) => {
        var isles = this.props.rects;
        //var selectedisle = null;
        for (let i = 0; i < isles.length; i++) {
            const element = isles[i].fields;
            var celem = element.filter(x => x.f_uuid === snapdrag.selected);
            if (celem) {
                //selectedisle = isles[i].f_uuid
                var newfields = element.filter(x => x.f_uuid !== snapdrag.selected);
                element.push(newfields);
                break;
            }

            //console.log(isles);

        }

    }
    updateisels = () => {

    }
    newislecreate = (snap) => {
        //console.log(this.props.field, this.props.obj);
        if (this.props.obj.fields.length > 1) {
            // console.log(this.props.obj.fields.length);
            // var startisle = this.props.obj.f_uuid
            var data_obj = {
                id: -1,
                f_uuid: uuidv4(),
                // uuid: uuidv4(),
                // name: draggingProduct.fieldName,
                x: snap.x,
                y: snap.y,
                uom: this.props.drawuom,
                rotation: 0,
                width: 0,
                height: 0,
                // ftypeid: draggingProduct.id,
                // src: draggingProduct.imageUrl,
                fill: "red",

                // shelfID: svg.id,
                // actualWidth: dropDUWidth,
                // actualHeight: dropDUHeight,
                fields: [this.props.field],
                isNew: true, isDelete: false,
            }


            this.props.rects.push(data_obj);

            for (let i = 0; i < this.props.rects.length; i++) {

                if (this.props.rects[i].f_uuid === this.props.obj.f_uuid) {
                    var newfields = this.props.rects[i].fields.filter(x => x.f_uuid !== this.props.field.f_uuid);
                    //console.log(newfields);
                    this.props.rects[i].fields = newfields
                    if ((newfields.length < 2) && (newfields[0].isDelete === true)) {
                        this.props.rects[i].isDelete = true;
                    }
                    break

                }

                // const element = this.props.rects[i];

            }
        }


    }
    addtoexistingisle = (snapdrag) => {
        var tosnapfield = snapdrag.right ? snapdrag.right : snapdrag.left;
        //console.log(snapdrag.right, snapdrag.left);
        //console.log(snapdrag);
        var isles = this.props.rects;
        var settoisle;
        let selectedid;
        var selected;
        for (let i = 0; i < isles.length; i++) {
            const element = isles[i];
            selected = element.fields.filter(x => x.f_uuid === tosnapfield);
            if (selected.length > 0) {
                settoisle = isles[i].f_uuid;
                //console.log(snapdrag.selected.f_uuid);
                selectedid = snapdrag.selected.f_uuid;

                let curselectid = selectedid; //new - 22/09/02 added
                for (let j = 0; j < isles.length; j++) {
                    var filt = isles[j].fields.filter(x => x.f_uuid === curselectid);
                    if (filt.length > 0) {
                        //console.log("ffffffffffffffffoooooooooooooooo");
                        //console.log(isles[j].f_uuid, settoisle);
                        // if (isles[j].f_uuid !== settoisle) {

                        element.fields.push(snapdrag.selected)
                        //console.log(selected, selectedid, settoisle);
                        break;
                        // }

                    }

                }

            }
        }
        var removeIsle = -1
        for (let i = 0; i < isles.length; i++) {
            if (isles[i].f_uuid !== settoisle) {

                for (let x = 0; x < isles[i].fields.length; x++) {
                    const element2 = isles[i].fields[x];
                    if (element2.f_uuid === selectedid) {
                        if (isles[i].fields.length > 1) {
                            var newfields = isles[i].fields.filter(x => x.f_uuid !== selectedid);
                            isles[i].fields = newfields
                            //console.log("update isle", newfields);
                        } else {

                            //console.log("delete isle");
                            if (isles[i].id > 0) {
                                isles[i].fields = []
                                isles[i].isDelete = true;
                            } else {
                                removeIsle = i
                                // isles.splice(i, 1);
                            }
                        }
                    }

                }
            }
        }

        if (removeIsle > -1) {

            isles.splice(removeIsle, 1);
        }




    }
    removeconnections = () => {
        var currprod = this.props.field;
        //console.log(currprod);
        var callrectdata = this.props.rects;
        //console.log(callrectdata)
        for (var i = 0; i < callrectdata.length; i++) {

            const element1 = callrectdata[i].fields;
            //console.log(element1)
            // console.log(element1.length);
            for (let index = 0; index < element1.length; index++) {
                //console.log(element1[index]);
                //const element = element1[index];
                var side;
                if (callrectdata[i].fields[index].f_uuid === currprod.f_uuid) {
                    var filterdelem = element1.filter(x => x.isDelete === false);
                    this.setState({ beforeremoveisle: callrectdata[i] })
                    if (filterdelem.length > 1) {
                        //var deletenow = false;
                        if (element1[index].rightSideFieldDto || element1[index].leftSideFieldDto) {

                            if ((element1[index].rightSideFieldDto && (element1[index].rightSideFieldDto.isDelete !== true)) && (element1[index].leftSideFieldDto && (element1[index].leftSideFieldDto.isDelete !== true))) {
                                // if(element[index].rightSideFieldDto.isDelete==false){
                                var left = "left";
                                var right = "right";
                                var removeleft = JSON.parse(JSON.stringify(this.props.field.leftSideFieldDto))


                                this.removeconnection(element1[index].rightSideFieldDto.rightFloorFieldId, element1[index].rightSideFieldDto.rightFloorFieldUUID, left, callrectdata[i]);
                                this.removeconnection(element1[index].leftSideFieldDto.leftFloorFieldId, element1[index].leftSideFieldDto.leftFloorFieldUUID, right, callrectdata[i]);
                                //console.log("both side");
                                var movedmiddleisle = this.props.obj
                                this.props.newislemiddleremoveleft(removeleft, movedmiddleisle)
                                // }

                            } else {
                                //console.log("yasas");
                                if (element1[index].rightSideFieldDto && (element1[index].rightSideFieldDto.isDelete !== true)) {
                                    //console.log("this is rightside remove");
                                    //console.log(element1[index].rightSideFieldDto.rightFloorFieldId, element1[index].rightSideFieldDto.rightFloorFieldUUID);
                                    //var idofconnected = (element1[index].rightSideFieldDto.rightFloorFieldId > 0) ? element1[index].rightSideFieldDto.rightFloorFieldId : element1[index].rightSideFieldDto.rightFloorFieldUUID;
                                    side = "left"

                                    this.removeconnection(element1[index].rightSideFieldDto.rightFloorFieldId, element1[index].rightSideFieldDto.rightFloorFieldUUID, side, callrectdata[i]);
                                    // if(element1[index].rightSideFieldDto.isDelete){

                                    // element[index].rightSideFieldDto = {rightFloorFieldId:id,rightFloorFieldUUID:nffuid,isNew:isnew};
                                    // }
                                } else if (element1[index].leftSideFieldDto && (element1[index].leftSideFieldDto.isDelete !== true)) {
                                    //console.log("this is leftside remove");
                                    side = "right"
                                    this.removeconnection(element1[index].leftSideFieldDto.leftFloorFieldId, element1[index].leftSideFieldDto.leftFloorFieldUUID, side, callrectdata[i]);
                                }
                            }

                        }
                        if ((currprod.leftSideFieldDto && currprod.leftSideFieldDto.isDelete !== true) || (currprod.rightSideFieldDto && currprod.rightSideFieldDto.isDelete !== true)) {
                            if (currprod.leftSideFieldDto && currprod.leftSideFieldDto.isDelete !== true) {
                                if (currprod.leftSideFieldDto.id > 0) {
                                    currprod.leftSideFieldDto.isDelete = true;
                                    currprod.leftSideFieldDto.isNew = false;
                                    currprod.isLeftChange = true;
                                } else {
                                    currprod.leftSideFieldDto = null;
                                }
                            }
                            if (currprod.rightSideFieldDto && currprod.rightSideFieldDto.isDelete !== true) {
                                if (currprod.rightSideFieldDto.id > 0) {
                                    currprod.rightSideFieldDto.isDelete = true;
                                    currprod.rightSideFieldDto.isNew = false;
                                    currprod.isRightChange = true;
                                } else {
                                    currprod.rightSideFieldDto = null;
                                }
                            }
                        }
                        break
                    }
                }
            }
        }


    }
    removeconnection = (id, fuuid, side, isle) => {
        //console.log(id, fuuid, side, isle);
        for (let i = 0; i < isle.fields.length; i++) {
            const element = isle.fields[i];
            //console.log("iiiiiiiiii");
            if (id > 0) {

                if (element.id === id) {
                    if (side === "left") {
                        element.leftSideFieldDto.isDelete = true;
                        element.leftSideFieldDto.isNew = false;
                        element.isLeftChange = true;

                    } else {
                        element.rightSideFieldDto.isDelete = true;
                        element.rightSideFieldDto.isNew = false;
                        element.isRightChange = true;
                    }

                }
            } else {
                //console.log("hhhhhhhhhhhhhhhhj");
                if (element.f_uuid === fuuid) {

                    if (side === "left") {
                        //console.log("on left yass");
                        element.leftSideFieldDto = null
                        element.isLeftChange = true
                    } else {
                        element.rightSideFieldDto = null
                        element.isRightChange = true
                    }

                }

            }

        }
    }
    newlocationrote = () => {

    }
    snapdragallow = (xi, yi) => {
        var rectA = { x: xi, y: yi, w: this.props.field.drawWidth, h: this.props.field.drawDepth, angle: this.props.field.rotation }
        //console.log("yas");
        //var center = { x: this.props.field.x + (this.props.field.drawWidth / 2), y: this.props.field.y + (this.props.field.drawDepth / 2), w: this.props.field.drawWidth, h: this.props.field.drawDepth }
        //var corners = getcornersfor(rectA);

        var snap = { snap: false };
        var isles = this.props.rects;
        //remove previw isle
        var noprevisles=isles.filter(x => x.itype !== "preview");
        var filterIsles = noprevisles.filter(x => x.isDelete === false);
        //check select isle
        if (this.props.obj.itype) {
           snap = { snap: false };
        } else {
            for (let index = 0; index < filterIsles.length; index++) {
                const element = filterIsles[index];
                var celemfields = (element.fields && element.fields.length > 0 ? element.fields.filter(x => x.f_uuid !== this.props.field.f_uuid) : []);
                const filterFields = celemfields.filter(x => x.isDelete === false);

                for (let i = 0; i < filterFields.length; i++) {
                    //console.log("ppp");
                    if (filterFields[i].rotation === rectA.angle) {
                        snap = this.checkthroughfield(filterFields[i], this.props.field);
                        //console.log(filterFields[i])

                        if (snap.snap) {
                            //console.log("snappppppp" + snap.snap);
                            break;
                        }
                        // return snap
                    } else {
                        //console.log("in this false one");
                        snap = { snap: false }
                        // return snap
                    }

                    // const element2 = element[i];
                }
                if (snap.snap) {
                    break;
                }
            }
        }
        return snap
    }
    checkthroughfield = (prod, selected) => {
        //console.log(prod,selected);
        var x1 = prod.x + (prod.drawWidth / 2)
        var y1 = prod.y + (prod.drawDepth / 2)
        var xA = selected.x + (selected.drawWidth / 2)
        var yA = selected.y + (selected.drawDepth / 2)

        var rectBdash = { x: xA, y: yA, w: (selected.drawWidth + (selected.drawWidth / 4)), h: selected.drawDepth, angle: selected.rotation }
        var rectB = { x: xA, y: yA, w: (selected.drawWidth), h: selected.drawDepth, angle: selected.rotation }
        var rectA = { x: x1, y: y1, w: prod.drawWidth, h: prod.drawDepth, angle: prod.rotation }
        var colliderect = isRectCollide(rectA, rectBdash);
        var xdif;
        var ydif;
        var newcenterx
        var newcentery
        var xpos
        var ypos
        //console.log(rectA, rectBdash, colliderect, selected, prod);

        var newpoint = { snap: false };
        if (colliderect) {
            //console.log("this will snap");

            var rectAcorners = getcornersfor(rectA)
            var rectBcorners = getcornersfor(rectB)

            // console.log(rectA,rectB);
            // console.log(prod,selected,rectAcorners,rectBcorners);
            // console.log(rectBcorners[0].x);
            var centerx = selected.x + (selected.drawWidth / 2);
            var centery = selected.y + (selected.drawDepth / 2)
            var endtostartdistance = Math.sqrt(Math.pow((rectBcorners[0].x - rectAcorners[1].x), 2) + Math.pow((rectBcorners[0].y - rectAcorners[1].y), 2));
            var starttostartdistance = Math.sqrt(Math.pow((rectBcorners[0].x - rectAcorners[0].x), 2) + Math.pow((rectBcorners[0].y - rectAcorners[0].y), 2))
            // console.log(endtostartdistance,starttostartdistance);
            // console.log(centerx,centery);

            if (starttostartdistance > endtostartdistance) {
                //console.log("this snap to left");
                xdif = rectAcorners[1].x - rectBcorners[0].x
                ydif = rectAcorners[1].y - rectBcorners[0].y
                newcenterx = centerx + xdif;
                newcentery = centery + ydif;
                //    console.log(xdif,ydif);
                xpos = newcenterx - (selected.drawWidth / 2)
                ypos = newcentery - (selected.drawDepth / 2)
                //    console.log(newcenterx,newcentery);

                //    console.log(xpos,ypos);
                newpoint['x'] = xpos
                newpoint['y'] = ypos
                newpoint['snap'] = true
                newpoint['rack'] = prod
                newpoint['right'] = prod.f_uuid
                newpoint["id"] = prod.id
                newpoint["selected"] = selected
                // newpoint['rightFloorFieldId'] = prod.id
                // if(prod.id==-1){




                return newpoint


            } else {
                //console.log("this snap to left");
                var xdif2 = rectAcorners[0].x - rectBcorners[1].x
                var ydif2 = rectAcorners[0].y - rectBcorners[1].y
                var newcenterx2 = centerx + xdif2;
                var newcentery2 = centery + ydif2;
                var xpos2 = newcenterx2 - (selected.drawWidth / 2)
                var ypos2 = newcentery2 - (selected.drawDepth / 2)
                newpoint['x'] = xpos2
                newpoint['y'] = ypos2
                newpoint['snap'] = true
                newpoint['rack'] = prod
                newpoint['left'] = prod.f_uuid
                newpoint["id"] = prod.id
                newpoint["selected"] = selected
                //console.log(prod.f_uuid);

                return newpoint
            }


        } else {
            //console.log("this will no snap");
            return newpoint
        }



    }

    // getTransformedCoords = (coords) => {
    //     // console.log("work");


    //     let model = {
    //         ctx: {},
    //         canvas: {},

    //         angleInRad: 45
    //     };
    //     var angle = (model.angleInRad * -1);
    //     var x2 = coords.x;
    //     var y2 = coords.y;
    //     var cos = Math.cos(angle);
    //     var sin = Math.sin(angle);

    //     var newx = Math.floor(x2 * cos - y2 * sin);
    //     var newy = Math.floor(x2 * sin + y2 * cos);
    //     var newposition = { x: newx, y: newy }
    //     // console.log(newposition.x);

    //     return newposition;
    //     ;



    //     // return new Position(newx, newy);
    // }


    render() {
        return (
            <>
                {(this.props.obj != null) ? !this.props.obj.itype ? (
                    <g className="field-rect">
                        <rect fill={this.props.field && this.props.field.department ? this.props.field.department.color : "#444"} height={this.props.height} width={this.props.width} x={this.props.x} y={this.props.y} className="shelf"
                            transform={"rotate(" + this.props.rotation + " " + (this.props.x + this.props.width / 2) + " " + (this.props.y + this.props.height / 2) + ") "}
                            style={{ cursor: "pointer" }}
                            ref={(r) => this[this.props.obj.f_uuid] = r}
                            onClick={e => this.props.clickrack(e, this.props.field, this.props.obj)}
                            onMouseDown={e => this.props.clickrack(e, this.props.field, this.props.obj)}

                        />
                        <rect fill="#dc3545" stroke="#dc3545" height={(this.props.height) / 4} width={this.props.width} x={this.props.x} y={this.props.y}
                            transform={"rotate(" + this.props.rotation + " " + (this.props.x + this.props.width / 2) + " " + (this.props.y + this.props.height / 2) + ") "}
                            onClick={e => this.props.clickrack(e, this.props.field, this.props.obj)} />

                        {this.props.isDisableEdit === false?<circle className="field-circle" cx={(this.props.x)} cy={this.props.y} r="5" stroke="black" strokeWidth="1" fill="red"
                            transform={"rotate(" + this.props.rotation + " " + (this.props.x + this.props.width / 2) + " " + (this.props.y + this.props.height / 2) + ") "}
                            onMouseDown={(e) => (this.props.obj.fields.length === 1 && !this.props.planoLock&&!this.props.isIsleSelected) && this.props.handlerotationStart(e, true, this.props.field, this[this.props.obj.f_uuid], this.props.field.rotation)}
                        />:<></>}
                        {this.props.field.noInFloorLayout && <circle
                            cx={
                                // this.props.Feildnoshow === 2 ? 
                                // ((this.props.x + (this.props.width) / 2)) :
                                 (this.props.x + (this.props.width / 2) + 1)}
                            cy={
                                // this.props.Feildnoshow === 2 ? (this.props.y - 3)//(this.props.y - 23)
                                //  :
                                  (this.props.y + (this.props.height / 2))}
                            r="9" stroke="black" strokeWidth="1" fill="#f7e4a9"
                            className={(this.props.Feildnoshow === 2 ? "onhovertext" : "")}
                            onClick={e => this.props.clickrack(e, this.props.field, this.props.obj)}
                            style={{ display: (this.props.Feildnoshow === 1 ? "block" : "none"), cursor: "pointer" }}

                        />}


                        <text className={(this.props.Feildnoshow === 2 ? "onhovertext" : "")} fontSize="11" height={this.props.height} width={this.props.width}
                            x={
                                // this.props.Feildnoshow === 2 ?
                                //  (((this.props.x + (this.props.width) / 2) - 3)) :
                                (this.props.field.noInFloorLayout && (this.props.field.noInFloorLayout.toString().length === 1 ? (this.props.isRTL === "rtl" ? (this.props.x + (this.props.width / 2) + 4) : this.props.x + (this.props.width / 2) - 2) : (this.props.isRTL === "rtl" ? (this.props.x + (this.props.width / 2) + 6) : (this.props.x + (this.props.width / 2) - 4))))}
                            y={
                            //     this.props.Feildnoshow === 2 ?
                            //      (this.props.y + (this.props.height / 2) -8) //(this.props.y + (this.props.height / 2) - 25)
                            // : 
                            (this.props.y + (this.props.height / 2) + 4)}
                            fill="black" onClick={e => this.props.clickrack(e, this.props.field, this.props.obj)}
                            style={{ display: (this.props.Feildnoshow === 1 ? "block" : "none"), cursor: "pointer" }}
                        // transform={"rotate(" + this.props.rotation + " " + (this.props.x + this.props.width / 2) + " " + (this.props.y + this.props.height / 2) + ") "}

                        >{this.props.field.noInFloorLayout > 0 && this.props.field.noInFloorLayout}</text>
                    </g>
                ) :
                    //isle draw
                    <g className="field-rect">
                        <rect fill={this.props.field && this.props.field.department ? this.props.field.department.color : "#444"} height={this.props.height} width={this.props.width} x={this.props.x} y={this.props.y} className="shelf"
                            transform={"rotate(" + this.props.rotation + " " + (this.props.x + this.props.width / 2) + " " + (this.props.y + this.props.height / 2) + ") "}
                            style={{ cursor: "pointer" }}
                            ref={(r) => this[this.props.obj.f_uuid] = r}
                        />
                        {this.props.isDisableEdit === false?<circle className="field-circle" cx={(this.props.x)} cy={this.props.y} r="5" stroke="black" strokeWidth="1" fill="red"
                            transform={"rotate(" + this.props.rotation + " " + (this.props.x + this.props.width / 2) + " " + (this.props.y + this.props.height / 2) + ") "}
                            onMouseDown={(e) => (this.props.obj.fields.length === 1 && !this.props.planoLock) && this.props.handlerotationStart(e, true, this.props.field, this[this.props.obj.f_uuid], this.props.field.rotation)}
                        />:<></>}
                    </g>
                    : (
                        <></>
                    )}
            </>
        )
    }
}

const mapDispatchToProps = dispatch => ({
    setPLanogramView: (payload) => dispatch(viewSetAction(payload)),
    setPLanogramdetailsView: (payload) => dispatch(PDviewDataAction(payload)),
    setFieldView: (payload) => dispatch(viewFieldAction(payload)),
    setDunitView: (payload) => dispatch(viewDunitSetAction(payload)),
    setFieldIsNewDraftView: (payload) => dispatch(setFieldIsNewDraft(payload)),
    setDepGridDates: (payload) => dispatch(setDepGridDates(payload)),
});

export default withTranslation()(withRouter(connect(null, mapDispatchToProps)(PlanogramDetails)));
