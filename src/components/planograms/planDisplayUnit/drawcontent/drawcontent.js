import React from 'react';
import { Col, Row, Button, ButtonGroup, Form, Modal } from 'react-bootstrap';
import FeatherIcon from 'feather-icons-react';
import { TrashIcon, StopIcon, XIcon, SignOutIcon } from '@primer/octicons-react';
import { v4 as uuidv4 } from 'uuid'; //unique id
import toImg from 'react-svg-to-image';
import jsPDF from 'jspdf';
import moment from 'moment';
import * as htmlToImage from 'html-to-image';
import axios from 'axios';

import { checkAllowToAdd, convertWidthPercent, PopoverWrapper, TooltipWrapper } from '../../../newMasterPlanogram/AddMethods';
import { CalculateRatio, checkColorIsLight, findBrowserType, measureConverter, replaceSpecialChars, rotateStatus, roundOffDecimal } from '../../../../_services/common.service';
import { alertService } from '../../../../_services/alert.service';
import { emailvalidator } from '../../../UiComponents/ValidateSets';
import { submitSets } from '../../../UiComponents/SubmitSets';
import { submitCollection } from '../../../../_services/submit.service';

import { checkProductIsInBottom, handlePanView, handleZoomInOut, sortShelvesDesc, ActiveContextMenu, DrawContextMenu, checkProductThoughBlock, checkThroughProductsTest, elmAccordingtoXY, GetContainingProdsByBox, getSnappingLocation } from '../additionalcontents';
import { compareSideToAllowDrop, OverlapSaftyView } from '../viewOverlapSafty';
import { confirmAlert } from 'react-confirm-alert';
import { BlockContextMenu, BlockRectangle } from './blockcontent';
// import { removeGhostImage } from '../../../common_layouts/ghostDragWrapper';
import { FullRenderProdImage, PrintCoverPageView } from './fullscreenview';

//fonts
import { assistant_medium } from '../../../../assets/fontsjs/Assistant';

import warningImage from '../../../../assets/img/icons/warn_full.png';
import warningImageRed from '../../../../assets/img/icons/warn_full_red.png';
import { StackableI } from '../../../../assets/icons/icons';
import { validateHeirarchyMissings } from '../../../newMasterPlanogram/simulateview/MPsimulateAllCategory/mpsimCommenMethods';


export default class DisplayUnitDraw extends React.Component {

    constructor(props){
        super(props);

        this._isMounted = false;
        this.displaydiv = React.createRef(); //main preview div
        this.actdisplaydiv = React.createRef(); //main active preview div
        this._dropposition = {startX: 0, endX: 0};
        this._dragcleartout = null;
        this._isshowoverlayshelf = false;

        this.dashrect = { startx:0, starty: 0, x: 0, y: 0, width: 0, height: 0, percentage: 0 };
        this.dashrectRef = React.createRef();

        this.state = {
            isShowRLView: false,
            isViewContextmenu: false, contxtMenu: null, //svg contxt menu

            divWidth: 0, divHeight: 0, actDivWidth: 0, actDivHeight: 0,
            viewHeight: 0, viewWidth: 0, aviewHeight: 0, aviewWidth: 0,  displayRatio: 0, adisplayRatio: 0, displayUOM: "cm",
            allowEditOverflwMargin: false,
            saftyMargin: 3, saleSaftyMargin: 1.5, checkSaftyMargin: 0, allowSaftyMargin: 0.01,
            isStackableEnabled: false,
            
            viewObj: null, activeViewObj: null,
            fieldStatus: "DRAFT", isActiveMode: false, 
            leftRightObj: null,

            isActViewvMenu: false, actViewMenu: null, curActViewableProd: null, 
            propShowHighlight: false,

            zoompanactive: false, activetool: "drawBlock", startpan: false,  zoomDrawX: 0, //draft

            isshowdash: false, newrectstart: null,
            selectedBlockPos: null,
            dropEffectingProds: [],
            
            currentInternalDraggableProd: null, //field inside selected product
            isBlockMove: false, currentSelectedBlock: null,
            isViewBlockContext: false, blockcontxt: { xpos:0, ypos: 0 },

            isFirstTimeDrawguid: false,
            
            allowovrflwprod: false,
            visibleProdIndicators: true,

            //export
            loadedProdCount: 0,
            isPrintPending: false,
            totalProdsForExport: 0,
            totalActiveProdForExport: 0,
            printHeight: 2480,
            printonepagewidthinPX: 3508,
            isPrintInProcess: false,
            isShowPrintDeptModal: false,
            selectedDept: 0,
            printType: "PDF",

            //overlap field
            isShowOverflowModal: false, 
            overlapFieldObj: null,
            overlapFieldIdx: -1,
        }
    }

    componentDidMount(){
        this._isMounted = true;

        if(this._isMounted){
            // console.log(this.props);
            this.setState({
                divWidth: (this.displaydiv.current && this.displaydiv.current.offsetWidth?(this.displaydiv.current.offsetWidth - 50):0),
                divHeight: (this.displaydiv.current && this.displaydiv.current.offsetHeight?(this.displaydiv.current.offsetHeight - 10):0),
                isPrintPending: (this.props.isFullScreenMode && this.props.isPendingExport?true:false),
            }, () => {
                let saveobj = structuredClone(this.props.saveObj);
                this.reinitSaveObj(saveobj); //onload load field/active field details

                if(this.state.isPrintPending){
                    this.setState({ isPrintInProcess: true });
                    this.props.toggleLoadingModal(null, true);
                }
            });

            //handle keydown - arrows key actions
            document.addEventListener("keydown", this.typingKeyHandling, false);
        }
    }

    componentWillUnmount() {
        this._isMounted = false;
        document.removeEventListener("keydown", this.typingKeyHandling, false);
    }

    //#PLG-DU-PD-H17 shortcuts and arrow key handlers
    typingKeyHandling = (evt) => {
        let ecode = evt.keyCode; //current key code
        let cdprod = this.state.currentInternalDraggableProd; //gets current selected product
        let fieldStatus = this.state.fieldStatus;
        
        if(fieldStatus === "ACTIVE" || fieldStatus === "DRAFT"){
            if(ecode === 37){ //left arrow
                evt.preventDefault();
                this.dragmultiplyProducts("left");

            } else if(ecode === 38){ //up arrow
                evt.preventDefault();
                this.dragmultiplyProducts("up");

            } else if(ecode === 39){ //right arrow
                evt.preventDefault();
                this.dragmultiplyProducts("right");

            } else if(ecode === 40){ //down arrow
                evt.preventDefault();
                this.dragmultiplyProducts("down");
                
            } else if(ecode === 46){ //delete
                evt.preventDefault();
                //toggle delete mode with block and single
                
                if(this.state.isBlockMove && this.state.currentSelectedBlock){
                    this.confirmingDeleteSelecteBlock();
                } else{
                    this.handleSingleProdDelete();
                }

            } else if(evt.ctrlKey && ecode === 77) { //ctrl + m - enables expand product
                evt.preventDefault();
                if(cdprod){
                    this.setState({ contxtMenu: {isexpand: true} });
                }
            }
        }
    }
    
    //#PLG-DU-PD-H18 multiply product on arrowkeys
    dragmultiplyProducts = (angle) => {
        let csobj = this.props.saveObj;
        let cisexpand = (this.state.contxtMenu && this.state.contxtMenu.isexpand);
        let selcurobj = structuredClone(this.state.currentInternalDraggableProd); //get current selected prod
        // console.log(selcurobj);
        
        //is it selected
        if(!this.state.isBlockMove && selcurobj){
            let shelf = csobj.fieldsList[selcurobj.fieldidx].planogramShelfDto[selcurobj.shelveidx];
            
            let mainProduct = shelf.planogramProduct[selcurobj.prodidx];
            let mainProductBlock = mainProduct.productBlock[selcurobj.blockidx];
            let currentlySelectedProd = mainProductBlock.productLocations[selcurobj.locidx];
            
            if (currentlySelectedProd) {
                //create new product object to check object
                var newProd = {
                    id: -1,
                    isNew: true,
                    drawWidth: currentlySelectedProd.drawWidth,
                    drawHeight: currentlySelectedProd.drawHeight,
                    uom: currentlySelectedProd.productUom,
                };
                
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
                    if(cisexpand){
                        this.multiplyProductToDropZone(shelf, newProd, mainProduct, currentlySelectedProd, angle);
                    } else{
                        this.changeProductOnShelf(shelf, newProd, mainProduct, currentlySelectedProd);
                    }
                }
            }
        } else{
            if(this.state.isBlockMove){
                if(angle === "left" || angle === "right"){
                    this.changeBlockOnShelf(angle);
                }
            }
        }
    }
    //#PLG-DU-PD-H19 multiply product validations
    multiplyProductToDropZone = async (shelf, addingProduct, mainProductBlock, mainProductLocation, cangle) => {
        // console.log(structuredClone(addingProduct));
        //check product available
        if (addingProduct === undefined || addingProduct === null) {
            alertService.warn(this.props.t('PRODUCT_NOT_SELECTED'))
            return false;
        }
        
        if (this.props.saveObj && shelf && addingProduct) {
            let reducesafty = this.state.allowSaftyMargin;
            //check on box
            let addProdX1 = roundOffDecimal((addingProduct.x),10);
            let addProdY1 = roundOffDecimal((addingProduct.y),10);
            let addProdX2 = roundOffDecimal(((addingProduct.x + mainProductLocation.drawWidth) - reducesafty),10);
            let addProdY2 = roundOffDecimal(((addingProduct.y + mainProductLocation.drawHeight) - reducesafty),10);

            let csprodobj = this.state.currentInternalDraggableProd;
            let spdobj = this.props.saveObj;
            let changefield = spdobj.fieldsList[csprodobj.fieldidx];

            let shelveCheck = this.checkOnShelfBox(addProdX1, addProdY1, addProdX2, addProdY2, shelf, mainProductLocation.drawWidth, mainProductLocation.drawHeight, changefield);
            // console.log(shelveCheck);

            var allowToAdd = true;
            if (shelveCheck.boxAllow) {
                //create x,y box of current product
                var xa1 = roundOffDecimal(addingProduct.x,10);
                var ya1 = roundOffDecimal(addingProduct.y,10);
                var xb1 = roundOffDecimal((addingProduct.x + mainProductLocation.drawWidth),10);
                var yb1 = roundOffDecimal((addingProduct.y + mainProductLocation.drawHeight),10);

                if (shelf) {
                    const planoshelf = shelf;

                    if(planoshelf.overLappingDto && planoshelf.overLappingDto.length > 0){
                        for (let i = 0; i < planoshelf.overLappingDto.length; i++) {
                            const overlapobj = planoshelf.overLappingDto[i];
                            
                            if(!overlapobj.isDelete){
                                let x1 = (planoshelf.x + overlapobj.x);
                                let y1 = overlapobj.y;
                                let x2 = x1 + overlapobj.drawWidth;
                                let y2 = y1 + overlapobj.drawHeight;

                                let rectAllow = checkThroughProductsTest(xa1, ya1, xb1, yb1, x1, y1, x2, y2);
                                if (!rectAllow) {
                                    allowToAdd = false;
                                    break;
                                }
                            }
                        }
                    }

                    //check through current shelve products
                    if(allowToAdd){
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
                                            var x1 = roundOffDecimal((productLocation.x),10);
                                            var y1 = roundOffDecimal((productLocation.y),10);
                                            var x2 = roundOffDecimal((x1 + productLocation.drawWidth),10);
                                            var y2 = roundOffDecimal((y1 + productLocation.drawHeight),10);
                                            //check product overlapping
                                            var rectAllow = checkThroughProductsTest(xa1, ya1, xb1, yb1, x1, y1, x2, y2);
                                            
                                            if (!rectAllow) {
                                                // console.log(x1 +"<"+ xb1 , x2 +">"+ xa1 , y1 +"<"+ yb1 , y2 +">"+ ya1);
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
                }
                
                //if allow to multiply product
                if (allowToAdd) {
                    this.props.fieldHistoryAdd(structuredClone(this.props.saveObj),4);
                    //get current product details
                    var cshelveobj = changefield.planogramShelfDto[csprodobj.shelveidx];
                    var addedProds = cshelveobj.planogramProduct;
                    var dragmainprod = cshelveobj.planogramProduct[csprodobj.prodidx];
                    var draggingProduct = cshelveobj.planogramProduct[csprodobj.prodidx].productInfo;

                    var prodfound = addedProds.findIndex(x => (x.productInfo.id === draggingProduct.id && x.isDelete === false));
                    var prodadded = {}; var prodblockidx = 0; var prodlocidx = 0;

                    //define location object
                    var coverflowobj = null;
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
                                shelfId: shelf.leftPlanogramShelfId, 
                                id: uuidv4(),
                                crossingWidth: shelveCheck.overlapX,
                                productWidth: mainProductLocation.productWidth, productHeight: mainProductLocation.productHeight, productDepth: mainProductLocation.productDepth,
                                productRotation: mainProductLocation.productRotation,
                                productUom: mainProductLocation.productUom,
                                drawWidth: measureConverter(mainProductLocation.productUom,this.state.displayUOM,mainProductLocation.productWidth) * this.state.displayRatio,
                                drawHeight: measureConverter(mainProductLocation.productUom,this.state.displayUOM,mainProductLocation.productHeight) * this.state.displayRatio,
                                qty: 1, sideType: "Left", fieldUom: this.state.displayUOM,
                                x: (Math.abs(shelveCheck.overlapX) * -1), y: mainProductLocation.y, isNew: true, isDelete: false,
                            };
                        }
                    }

                    var allowbottom = checkProductIsInBottom(cshelveobj.y, cshelveobj.drawHeight, ya1, mainProductLocation.drawHeight);
                    
                    var plocobj = {id: uuidv4(), f_uuid: uuidv4(), x: xa1, y: ya1,
                        productWidth: mainProductLocation.productWidth, 
                        productHeight: mainProductLocation.productHeight, 
                        productDepth: mainProductLocation.productDepth,
                        productRotation: mainProductLocation.productRotation,
                        drawWidth: mainProductLocation.drawWidth,
                        drawHeight: mainProductLocation.drawHeight,
                        isRightSideOverLap: shelveCheck.isOverlap, 
                        productUom: mainProductLocation.productUom,
                        isNew: true, 
                        isDelete: false,
                        isbottom: allowbottom,
                        overLappingDto: coverflowobj,
                        uom: this.state.displayUOM,
                    };

                    //add overlapping
                    if(plocobj.overLappingDto && changefield.rightSidePlanogramFieldDto){
                        let changerightfield = spdobj.fieldsList.findIndex(x => x.id === changefield.rightSidePlanogramFieldDto.id);
                        let changerightshelf = (changerightfield > -1?spdobj.fieldsList[changerightfield].planogramShelfDto.findIndex(x => x.id === plocobj.overLappingDto.shelfId):-1);

                        if(changerightshelf > -1){
                            let rightoverlaplist = spdobj.fieldsList[changerightfield].planogramShelfDto[changerightshelf].overLappingDto;
                            let findalreadyrightadded = rightoverlaplist.findIndex(x => x.id === plocobj.overLappingDto.id && !x.isDelete);
    
                            if(findalreadyrightadded > -1){
                                rightoverlaplist[findalreadyrightadded].crossingWidth = plocobj.overLappingDto.crossingWidth;
                                rightoverlaplist[findalreadyrightadded].x = plocobj.overLappingDto.x;
                                rightoverlaplist[findalreadyrightadded].y = plocobj.overLappingDto.y;
    
                            } else{
                                let rightoverlapobj = structuredClone(plocobj.overLappingDto);
                                rightoverlapobj["productDto"] = draggingProduct;
                                rightoverlaplist.push(rightoverlapobj);
                            }
                        }
                    }

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
                            cblockprods[blockfound].productLocations.push(plocobj);
                            prodblockidx = blockfound;

                            let allowbottom = checkProductIsInBottom(cshelveobj.y,cshelveobj.drawHeight,ya1,plocobj.drawHeight)

                            //add qty to block change - RD changes
                            let newrdobj = [{type:"QTY_ADD", loclist: (allowbottom?[plocobj]:[]), product: draggingProduct, fieldidx: csprodobj.fieldidx, shelve: csprodobj.shelveidx, prodobj: addedProds[prodfound], locobj: plocobj, changeqty: (allowbottom?1:0)}];
                            this.props.handleRDChanges(newrdobj);
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
                                isNew: true, 
                                isDelete: false,
                                uom: this.state.displayUOM,
                                productLocations: [plocobj]
                            };
                            cblockprods.push(cpobj);

                            let allowbottom = checkProductIsInBottom(cshelveobj.y,cshelveobj.drawHeight,ya1,plocobj.drawHeight)

                            // new block create change - RD changes
                            let newrdobj = [{type:"ADD_NEW_BLOCK", loclist: (allowbottom?[plocobj]:[]), product: draggingProduct, fieldidx: csprodobj.fieldidx, shelve: csprodobj.shelveidx, prodobj: addedProds[prodfound], locobj: plocobj, changeqty: (allowbottom?1:0)}];
                            this.props.handleRDChanges(newrdobj);
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
                                isNew: true, 
                                isDelete: false,
                                uom: this.state.displayUOM,
                                productLocations: [plocobj]
                            }]
                        };
                        prodfound = addedProds.length;
                        addedProds.push(data_obj2);
                        prodadded = data_obj2;

                        let allowbottom = checkProductIsInBottom(cshelveobj.y,cshelveobj.drawHeight,ya1,plocobj.drawHeight)

                        //new block create change - RD changes
                        let newrdobj = [{type:"ADD_NEW_BLOCK", loclist: (allowbottom?[plocobj]:[]), product: draggingProduct, fieldidx: csprodobj.fieldidx, shelve: csprodobj.shelveidx, prodobj: data_obj2, locobj: plocobj, changeqty: (allowbottom?1:0)}];
                        this.props.handleRDChanges(newrdobj);
                    }
                    spdobj.fieldsList[csprodobj.fieldidx].planogramShelfDto[csprodobj.shelveidx].planogramProduct = addedProds;

                    prodlocidx = addedProds[prodfound].productBlock[prodblockidx].productLocations.length;
                    var viewprodidx = (prodlocidx > 0?(prodlocidx - 1):0);
                    var cdrgprod = {fieldidx: csprodobj.fieldidx, shelveidx: csprodobj.shelveidx, prodidx: csprodobj.prodidx, blockidx: prodblockidx, locidx: viewprodidx, prod: prodadded};
                    
                    this.setState({ saveObj: spdobj, currentInternalDraggableProd: cdrgprod}, () => {
                        if(!this.props.showFullScreenEditView){
                            this.props.updateConvertDetails(spdobj, true);
                        }
                    });
                }

            }
        }

    }

    //check product x,y endpoints are allowed to drag inside shelve
    checkOnShelfBox = (xa, ya, xb, yb, shelfObj, dpwidth, dpheight, fieldobj) => {
        var allowovrlflw = this.state.allowovrflwprod;
        var overflowprodwidth = (allowovrlflw?((dpwidth / 4) * 3):0); //if overflow allowed 3/4 of product allow to overlap
        
        //get shelve x,y end points
        var p1 = roundOffDecimal((shelfObj.x - this.state.checkSaftyMargin),10); 
        var q1 = roundOffDecimal((shelfObj.y - this.state.checkSaftyMargin),10);
        var p2 = roundOffDecimal(((shelfObj.x + shelfObj.drawWidth) + overflowprodwidth + this.state.checkSaftyMargin),10);
        var q2 = roundOffDecimal((q1 + shelfObj.drawHeight + this.state.checkSaftyMargin),10);
        // console.log(xa, ya, xb, yb, p1, q1, p2, q2);

        //check is it allowed
        var boxAllow = false;
        // console.log(p1 +"<="+ xa , xb +"<="+ p2 , q1 +"<="+ ya , yb +"<="+ q2);
        if (p1 <= xa && xb <= p2 && q1 <= ya && yb <= q2) {
            boxAllow = true;
        }

        //check is it overlap
        var p3 = roundOffDecimal((shelfObj.x - this.state.checkSaftyMargin),10);
        var p4 = roundOffDecimal(((shelfObj.x + shelfObj.drawWidth) + this.state.checkSaftyMargin),10);
        var isOverlap = true;
        var overlapX = 0;
        
        // console.log(p3 +"<="+ xa, xb +"<="+ p4, q1 +"<="+ ya, yb +"<="+ q2);
        if (p3 <= xa && xb <= p4 && q1 <= ya && yb <= q2) {
            isOverlap = false;
        } else if(allowovrlflw){
            overlapX = ((shelfObj.x + shelfObj.drawWidth) - xa);
        }
        
        if(isOverlap){
            isOverlap = (allowovrlflw && shelfObj.overlappingAllow !== undefined?shelfObj.overlappingAllow:false);
            if(!allowovrlflw || !shelfObj.overlappingAllow){
                boxAllow = false;
            }

            if(isOverlap){
                let saveobj = this.props.saveObj;
                let leftfieldobj = saveobj.fieldsList.find(x => x.id === fieldobj.rightSidePlanogramFieldDto.id);
                let leftshelfobj = (leftfieldobj?leftfieldobj.planogramShelfDto.find(x => x.id === shelfObj.leftPlanogramShelfId):null);

                if(leftshelfobj){
                    for (let i = 0; i < leftshelfobj.planogramProduct.length; i++) {
                        const planoProduct = leftshelfobj.planogramProduct[i];

                        for (let j = 0; j < planoProduct.productBlock.length; j++) {
                            const planoBlock = planoProduct.productBlock[j];

                            for (let k = 0; k < planoBlock.productLocations.length; k++) {
                                const productLocation = planoBlock.productLocations[k];

                                if (!productLocation.isDelete) {
                                    //create current location x,y box
                                    var x1 = roundOffDecimal((productLocation.x),10);
                                    var y1 = roundOffDecimal((productLocation.y),10);
                                    var x2 = roundOffDecimal((x1 + productLocation.drawWidth),10);
                                    var y2 = roundOffDecimal((y1 + productLocation.drawHeight),10);
                                    //check product overlapping
                                    var rectAllow = checkThroughProductsTest(xa, ya, xb, yb, x1, y1, x2, y2);
                                    
                                    if (!rectAllow) {
                                        // console.log(x1 +"<"+ xb1 , x2 +">"+ xa1 , y1 +"<"+ yb1 , y2 +">"+ ya1);
                                        boxAllow = false
                                        break;
                                    }
                                }
                            }
                            if(!boxAllow){ break; }
                        }
                        if(!boxAllow){ break; }
                    }
                    // console.log(boxAllow);
                }
            }
        }
        
        return {boxAllow: boxAllow, isOverlap: isOverlap, overlapX: overlapX};
    }

    //when change position of product block validate block movement - that checks allow to move block
    changeBlockOnShelf = (cangle) => {
        let mainProductBlock = this.state.currentSelectedBlock;
        
        if (this.props.saveObj && mainProductBlock) {
            let newchangeprods = [];
            if(mainProductBlock && mainProductBlock.drawingProducts && mainProductBlock.drawingProducts.length > 0){
                // console.log(mainProductBlock);

                const field = structuredClone(this.props.saveObj);
                const changeMainBlock = structuredClone(mainProductBlock);

                let isblockallowtomove = true;
                
                for (let b = 0; b < changeMainBlock.drawingProducts.length; b++) {
                    const changeProd = changeMainBlock.drawingProducts[b];

                    let changefield = field.fieldsList[changeProd.fieldidx];
                    let cshelveobj = changefield.planogramShelfDto[changeProd.shelfidx];
                    let selectedMainProd = cshelveobj.planogramProduct[changeProd.prodidx];
                    let selctedProd = selectedMainProd.productBlock[changeProd.blockidx].productLocations[changeProd.locidx];

                    if(isblockallowtomove){ //if one item not allow to add reducing all loops by falsing thi boolean to reduce loop weight
                        let isprodAdded = newchangeprods.findIndex(x => x.product.id === selectedMainProd.productInfo.id);
                        if(isprodAdded === -1){
                            let newrdobj = {type:"POSITION_CHANGE", loclist: [], iscalc: false, product: selectedMainProd.productInfo, fieldidx: changeProd.fieldidx, shelve: changeProd.shelfidx, prodobj: selectedMainProd, locobj: null, changeqty: 0};
                            newchangeprods.push(newrdobj);
                        }

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
                        let shelveCheck = this.checkOnShelfBox(selctedProd.x, selctedProd.y, (selctedProd.x + selctedProd.drawWidth), roundOffDecimal((selctedProd.y + selctedProd.drawHeight),10), cshelveobj, selctedProd.drawWidth, selctedProd.drawHeight, changefield);
                        
                        if (shelveCheck.boxAllow) {
                            //check box allow to overlap on other field
                            if(this.state.allowovrflwprod && shelveCheck.isOverlap && shelveCheck.overlapX > 0){
                                let leftfieldobj = field.fieldsList[(changeProd.fieldidx + 1)];

                                if(leftfieldobj){
                                    let checkoverlapx = (leftfieldobj.startX + shelveCheck.overlapX);
                                    let nextfieldshelf = leftfieldobj.planogramShelfDto[changeProd.shelfidx];
                                    //loop shelf products and is overlapping current products
                                    for (let l = 0; l < nextfieldshelf.planogramProduct.length; l++) {
                                        const nextshelfprod = nextfieldshelf.planogramProduct[l];
                                        if(!nextshelfprod.isDelete){
                                            for (let k = 0; k < nextshelfprod.productBlock.length; k++) {
                                                const nextprodblock = nextshelfprod.productBlock[k];
                                                if(!nextprodblock.isDelete){
                                                    for (let j = 0; j < nextprodblock.productLocations.length; j++) {
                                                        const nextprodloc = nextprodblock.productLocations[j];
                                                        if(!nextprodloc.isDelete && nextprodloc.x <= checkoverlapx){
                                                            return false;
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                            
                            //isoverlap available
                            if(shelveCheck.isOverlap){
                                if(selctedProd.overLappingDto){ //if overlap obj avalable
                                    selctedProd.overLappingDto["crossingWidth"] = shelveCheck.overlapX;
                                    selctedProd.overLappingDto["x"] = (Math.abs(shelveCheck.overlapX) * -1);
                                    selctedProd.overLappingDto["y"] = selctedProd.y;
                                    selctedProd.overLappingDto["isDelete"] = false;
                                } else {
    
                                    var overlaplocobj = {
                                        shelfId: field.fieldsList[changeProd.fieldidx].planogramShelfDto[changeProd.shelfidx].leftPlanogramShelfId, 
                                        id: uuidv4(),
                                        crossingWidth: shelveCheck.overlapX,
                                        productWidth: selctedProd.productWidth, productHeight: selctedProd.productHeight, productDepth: selctedProd.productDepth,
                                        productRotation: selctedProd.productRotation,
                                        productUom: selctedProd.productUom,
                                        drawWidth: measureConverter(selctedProd.productUom,this.state.displayUOM,selctedProd.productWidth) * this.state.displayRatio,
                                        drawHeight: measureConverter(selctedProd.productUom,this.state.displayUOM,selctedProd.productHeight) * this.state.displayRatio,
                                        qty: 1, sideType: "Left", fieldUom: this.state.displayUOM,
                                        x: (Math.abs(shelveCheck.overlapX) * -1), y: selctedProd.y, 
                                        isNew: true, 
                                        isDelete: false
                                    };
    
                                    selctedProd["overLappingDto"] = overlaplocobj;
                                    selctedProd["isRightSideOverLap"] = true;
                                }
    
                                if(selctedProd.overLappingDto){
                                    //right field overlap object update
                                    let changerightfield = field.fieldsList.findIndex(x => x.id === changefield.rightSidePlanogramFieldDto.id);
                                    let changerightshelf = (changerightfield > -1?field.fieldsList[changerightfield].planogramShelfDto.findIndex(x => x.id === selctedProd.overLappingDto.shelfId):-1);
            
                                    if(changerightshelf > -1){
                                        let rightoverlaplist = field.fieldsList[changerightfield].planogramShelfDto[changerightshelf].overLappingDto;
                                        let findalreadyrightadded = rightoverlaplist.findIndex(x => x.id === selctedProd.overLappingDto.id && !x.isDelete);
                
                                        if(findalreadyrightadded > -1){
                                            rightoverlaplist[findalreadyrightadded].crossingWidth = selctedProd.overLappingDto.crossingWidth;
                                            rightoverlaplist[findalreadyrightadded].x = selctedProd.overLappingDto.x;
                                            rightoverlaplist[findalreadyrightadded].y = selctedProd.overLappingDto.y;
                
                                        } else{
                                            let rightoverlapobj = structuredClone(selctedProd.overLappingDto);
                                            rightoverlapobj["productDto"] = selectedMainProd.productInfo;
                                            rightoverlaplist.push(rightoverlapobj);
                                        }
                                    }
                                }
    
                            } else{
                                if(selctedProd.overLappingDto){
                                    if(!selctedProd.overLappingDto.isNew){
                                        selctedProd.overLappingDto["isDelete"] = true;
                                        selctedProd.overLappingDto["isNew"] = false;
        
                                        let changerightfield = field.fieldsList.findIndex(x => x.id === changefield.rightSidePlanogramFieldDto.id);
                                        let changerightshelf = (changerightfield > -1?field.fieldsList[changerightfield].planogramShelfDto.findIndex(x => x.id === selctedProd.overLappingDto.shelfId):-1);
                    
                                        if(changerightshelf > -1){
                                            let rightoverlaplist = field.fieldsList[changerightfield].planogramShelfDto[changerightshelf].overLappingDto;
                                            let findalreadyrightadded = rightoverlaplist.findIndex(x => x.id === selctedProd.overLappingDto.id && !x.isDelete);
                    
                                            if(findalreadyrightadded > -1){
                                                if(rightoverlaplist[findalreadyrightadded].isNew){
                                                    rightoverlaplist.splice(findalreadyrightadded, 1);
                                                } else{
                                                    rightoverlaplist[findalreadyrightadded].isDelete = true;
                                                }
                                            }
                                        }
                                    } else{
                                        selctedProd.overLappingDto = null;
                                    }
                                    
                                } else{
                                    selctedProd.overLappingDto = null;
                                }
                            }
                            
                            //check through products
                            var allowToAdd = true;

                            var xa1 = selctedProd.x;
                            var ya1 = selctedProd.y;
                            var xb1 = selctedProd.x + selctedProd.drawWidth;
                            var yb1 = selctedProd.y + selctedProd.drawHeight;

                            //check it's allow to move to that direction - see any products overlapping
                            if(cshelveobj){
                                const planoshelf = field.fieldsList[changeProd.fieldidx].planogramShelfDto[changeProd.shelfidx];

                                for (let i = 0; i < planoshelf.planogramProduct.length; i++) {
                                    const planoProduct = planoshelf.planogramProduct[i];

                                    for (let j = 0; j < planoProduct.productBlock.length; j++) {
                                        const planoBlock = planoProduct.productBlock[j];

                                        // var isblockmerging = false;
                                        if(planoBlock.id !== mainProductBlock.id && !planoBlock.isDelete){
                                            //filter products in shelve from moving side
                                            const filteredBlockProds = (planoBlock.productLocations?planoBlock.productLocations.filter(litem => (!litem.isDelete && ((cangle === "left" && litem.x < selctedProd.x) || (cangle === "right" && litem.x > selctedProd.x)
                                            || (cangle === "up" && litem.y < selctedProd.y) || (cangle === "down" && litem.y > selctedProd.y)))):[]);
                                            
                                            for (let k = 0; k < filteredBlockProds.length; k++) {
                                                const productLocation = filteredBlockProds[k];

                                                //if not current product
                                                let isprodnotinblock = changeMainBlock.drawingProducts.findIndex(drawprod => drawprod.id === productLocation.id);

                                                if (!productLocation.isDelete && isprodnotinblock === -1) {
                                                    const x1 = productLocation.x
                                                    const y1 = productLocation.y
                                                    const x2 = x1 + productLocation.drawWidth
                                                    const y2 = y1 + productLocation.drawHeight

                                                    var rectAllow = checkThroughProductsTest(xa1, ya1, xb1, yb1, x1, y1, x2, y2)
                                                    if (!rectAllow) {
                                                        allowToAdd = false;
                                                        isblockallowtomove = false;
                                                        break;

                                                    }
                                                }
                                            }
                                        }

                                        if(!allowToAdd){ break; }
                                    }
                                    if(!allowToAdd){ break; }
                                }

                                if(allowToAdd && planoshelf.overLappingDto && planoshelf.overLappingDto.length > 0){
                                    for (let i = 0; i < planoshelf.overLappingDto.length; i++) {
                                        const overlapobj = planoshelf.overLappingDto[i];
                                        
                                        if(!overlapobj.isDelete){
                                            let x1 = (planoshelf.x + overlapobj.x);
                                            let y1 = overlapobj.y;
                                            let x2 = x1 + overlapobj.drawWidth;
                                            let y2 = y1 + overlapobj.drawHeight;
            
                                            let rectAllow = checkThroughProductsTest(xa1, ya1, xb1, yb1, x1, y1, x2, y2);
                                            if (!rectAllow) {
                                                allowToAdd = false;
                                                isblockallowtomove = false;
                                                break;
                                            }
                                        }
                                    }
                                }
                            }

                        } else{
                            isblockallowtomove = false;
                        }
                    }
                }
                //is block allow to move
                if(isblockallowtomove){
                    this.props.fieldHistoryAdd(JSON.parse(JSON.stringify(this.props.saveObj)),3);

                    let selblockx = mainProductBlock.rectdetails.x;
                    let selblockx2 = mainProductBlock.rectdetails.x2;
                    if (cangle === "left") {
                        selblockx = (selblockx - 1);
                        selblockx2 = (selblockx2 =  - 1);

                    } else if (cangle === "right") {
                        selblockx = (selblockx + 1);
                        selblockx2 = (selblockx2 + 1);
                    }

                    mainProductBlock.rectdetails.x = selblockx;
                    mainProductBlock.rectdetails.x2 = selblockx2;

                    //add new block locations to curent block
                    /* if(isovernewblock && newlocationlist.length > 0){
                        const newlocmergelist = changeMainBlock.productLocations.concat(newlocationlist);
                        changeMainBlock.productLocations = newlocmergelist;
                    }

                    mainProductBlock = changeMainBlock; */

                    // var curmainprod = field.fieldsList[cselprod.fieldidx].planogramShelfDto[cselprod.shelveidx].planogramProduct[cselprod.prodidx];
                    // curmainprod.productBlock[cselprod.blockidx] = mainProductBlock;

                    this.setState({ 
                        currentSelectedBlock: mainProductBlock,
                        currentInternalDraggableProd: null
                    }, () => {
                        if(!this.props.showFullScreenEditView){
                            this.props.updateConvertDetails(field, true);

                            //block item location change - RD changes
                            this.props.handleRDChanges(newchangeprods);
                        }
                    });
                }
            }
        }
    }

    //when change position of product validate product movement
    changeProductOnShelf = (shelf, selctedProd, mainProductBlock, prodLocation) => {
        if (this.props.saveObj && selctedProd && shelf && mainProductBlock) {
            //check on box
            
            const field = this.props.saveObj;
            //find block if its close to a block
            let cselprod = this.state.currentInternalDraggableProd;
            let changefield = field.fieldsList[cselprod.fieldidx];
            let curmainshelf = changefield.planogramShelfDto[cselprod.shelveidx];
            let curmainprod = curmainshelf.planogramProduct[cselprod.prodidx];
            
            let fieldOldEndX = (changefield.startX + changefield.drawWidth);
            
            let cprodblock = curmainprod.productBlock[cselprod.blockidx];
            let cblockloc = cprodblock.productLocations[cselprod.locidx];
            
            var shelveCheck = this.checkOnShelfBox(selctedProd.x, selctedProd.y, (selctedProd.x + selctedProd.drawWidth), roundOffDecimal((selctedProd.y + selctedProd.drawHeight),10), shelf, selctedProd.drawWidth, selctedProd.drawHeight, changefield);
            
            if (shelveCheck.boxAllow) {
                //check through products
                var allowToAdd = true;

                var xa1 = selctedProd.x;
                var ya1 = selctedProd.y;
                var xb1 = selctedProd.x + selctedProd.drawWidth;
                var yb1 = selctedProd.y + selctedProd.drawHeight;

                // let prodAllowX = (this.props.allowovrflwprod?((selctedProd.drawWidth / 4) * 3):0);

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

                                        let rectAllow = checkThroughProductsTest(xa1, ya1, xb1, yb1, x1, y1, x2, y2)
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

                    // console.log(planoshelf);
                    if(allowToAdd && planoshelf.overLappingDto && planoshelf.overLappingDto.length > 0){
                        for (let i = 0; i < planoshelf.overLappingDto.length; i++) {
                            const overlapobj = planoshelf.overLappingDto[i];
                            
                            if(!overlapobj.isDelete){
                                let x1 = (planoshelf.x + overlapobj.x);
                                let y1 = overlapobj.y;
                                let x2 = x1 + overlapobj.drawWidth;
                                let y2 = y1 + overlapobj.drawHeight;

                                let rectAllow = checkThroughProductsTest(xa1, ya1, xb1, yb1, x1, y1, x2, y2)
                                if (!rectAllow) {
                                    allowToAdd = false
                                    break;
                                }
                            }
                        }
                    }

                    //check drop is overlapping right side field shelf prod list
                    if(allowToAdd){
                        if(xb1 > fieldOldEndX && changefield.rightSidePlanogramFieldDto){
                            let findrightsidefield = this.props.saveObj.fieldsList.find(x => x.id === changefield.rightSidePlanogramFieldDto.id);
                            
                            let findrightshelf = findrightsidefield.planogramShelfDto.find(x => x.id === curmainshelf.leftPlanogramShelfId);
                            
                            if(findrightshelf){
                                for (let l = 0; l < findrightshelf.planogramProduct.length; l++) {
                                    const shelfprod = findrightshelf.planogramProduct[l];
                
                                    if(!shelfprod.isDelete){
                                        for (let k = 0; k < shelfprod.productBlock.length; k++) {
                                            const prodblock = shelfprod.productBlock[k];
                                            
                                            if(!prodblock.isDelete){
                                                for (let j = 0; j < prodblock.productLocations.length; j++) {
                                                    const prodblockloc = prodblock.productLocations[j];
                                                    
                                                    if(!prodblockloc.isDelete){
                                                        let prodStart = roundOffDecimal(prodblockloc.x, 2);
                                                        let prodStartY = roundOffDecimal(prodblockloc.y, 2);
                                                        let prodEnd = roundOffDecimal((prodblockloc.x + prodblockloc.drawWidth), 2);
                                                        let prodEndY = roundOffDecimal((prodblockloc.y + prodblockloc.drawHeight), 2);
                                
                                                        if(!checkThroughProductsTest(xa1, ya1, xb1, yb1, prodStart, prodStartY, prodEnd, prodEndY)){
                                                            allowToAdd = false;
                                                            break;
                                                        }
                                                    }
                                                }
                                            }

                                            if(!allowToAdd){
                                                break;
                                            }
                                        }
                                    }

                                    if(!allowToAdd){
                                        break;
                                    }
                                }
                            }
                        }
                    }
                }
                
                if (allowToAdd) {
                    this.props.fieldHistoryAdd(structuredClone(this.props.saveObj),3);

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
                            } else {

                                var overlaplocobj = {
                                    shelfId: field.fieldsList[cselprod.fieldidx].planogramShelfDto[cselprod.shelveidx].leftPlanogramShelfId, 
                                    id: uuidv4(),
                                    crossingWidth: shelveCheck.overlapX,
                                    productWidth: cblockloc.productWidth, productHeight: cblockloc.productHeight, productDepth: cblockloc.productDepth,
                                    productRotation: cblockloc.productRotation,
                                    productUom: cblockloc.productUom,
                                    drawWidth: measureConverter(cblockloc.productUom,this.state.displayUOM,cblockloc.productWidth) * this.state.displayRatio,
                                    drawHeight: measureConverter(cblockloc.productUom,this.state.displayUOM,cblockloc.productHeight) * this.state.displayRatio,
                                    qty: 1, sideType: "Left", fieldUom: this.state.displayUOM,
                                    x: (Math.abs(shelveCheck.overlapX) * -1), y: selctedProd.y, 
                                    isNew: true, 
                                    isDelete: false
                                };

                                cblockloc["overLappingDto"] = overlaplocobj;
                                cblockloc["isRightSideOverLap"] = true;
                            }

                            if(cblockloc.overLappingDto){
                                //right field overlap object update
                                let changerightfield = field.fieldsList.findIndex(x => x.id === changefield.rightSidePlanogramFieldDto.id);
                                let changerightshelf = (changerightfield > -1?field.fieldsList[changerightfield].planogramShelfDto.findIndex(x => x.id === cblockloc.overLappingDto.shelfId):-1);
        
                                if(changerightshelf > -1){
                                    let rightoverlaplist = field.fieldsList[changerightfield].planogramShelfDto[changerightshelf].overLappingDto;
                                    let findalreadyrightadded = rightoverlaplist.findIndex(x => x.id === cblockloc.overLappingDto.id && !x.isDelete);
            
                                    if(findalreadyrightadded > -1){
                                        rightoverlaplist[findalreadyrightadded].crossingWidth = cblockloc.overLappingDto.crossingWidth;
                                        rightoverlaplist[findalreadyrightadded].x = cblockloc.overLappingDto.x;
                                        rightoverlaplist[findalreadyrightadded].y = cblockloc.overLappingDto.y;
            
                                    } else{
                                        let rightoverlapobj = structuredClone(cblockloc.overLappingDto);
                                        rightoverlapobj["productDto"] = curmainprod.productInfo;
                                        rightoverlaplist.push(rightoverlapobj);
                                    }
                                }
                            }

                        } else{
                            if(cblockloc.overLappingDto){
                                if(!cblockloc.overLappingDto.isNew){
                                    cblockloc.overLappingDto["isDelete"] = true;
                                    cblockloc.overLappingDto["isNew"] = false;
    
                                    let changerightfield = field.fieldsList.findIndex(x => x.id === changefield.rightSidePlanogramFieldDto.id);
                                    let changerightshelf = (changerightfield > -1?field.fieldsList[changerightfield].planogramShelfDto.findIndex(x => x.id === cblockloc.overLappingDto.shelfId):-1);
                
                                    if(changerightshelf > -1){
                                        let rightoverlaplist = field.fieldsList[changerightfield].planogramShelfDto[changerightshelf].overLappingDto;
                                        let findalreadyrightadded = rightoverlaplist.findIndex(x => x.id === cblockloc.overLappingDto.id && !x.isDelete);
                
                                        if(findalreadyrightadded > -1){
                                            if(rightoverlaplist[findalreadyrightadded].isNew){
                                                rightoverlaplist.splice(findalreadyrightadded, 1);
                                            } else{
                                                rightoverlaplist[findalreadyrightadded].isDelete = true;
                                            }
                                        }
                                    }
                                } else{
                                    cblockloc.overLappingDto = null;
                                }

                            } else{
                                cblockloc.overLappingDto = null;
                            }
                        }
                    }
                    
                    if(!this.props.showFullScreenEditView){
                        this.props.updateConvertDetails(field, true, null, () => {
                            if(this.bctimeout){clearTimeout(this.bctimeout);} //clear timeout setted before

                            //check moving product x,y and check block list to see if it's changed it's current block
                            this.bctimeout = setTimeout(() => {
                                //find block
                                var blockfound = -1;
                                for (var k = 0; k < curmainprod.productBlock.length; k++) {
                                    const blockitem = curmainprod.productBlock[k];
                                    var checkoriprod = {uom: curmainprod.productUom, width: curmainprod.productWidth, height: curmainprod.productHeight, rotatewidth: cblockloc.productWidth, rotateheight: cblockloc.productHeight, rotatetype: cblockloc.productRotation};
                                    var checkrslt = checkProductThoughBlock(xa1, ya1, checkoriprod, blockitem, cblockloc.id, this.state.displayUOM, this.state.displayRatio, this.state.checkSaftyMargin);
                                    if(checkrslt){
                                        blockfound = k;
                                    }
                                }
                                //if found a block
                                var noverlaplocobj = (shelveCheck.isOverlap && prodLocation.overLappingDto?JSON.parse(JSON.stringify(prodLocation.overLappingDto)):null); //overlapping obj avalable
                                if(noverlaplocobj){
                                    noverlaplocobj["id"] = uuidv4();
                                    noverlaplocobj["isNew"] = true;
                                    noverlaplocobj["isDelete"] = false;
                                }

                                var allowbottom = checkProductIsInBottom(curmainshelf.y, curmainshelf.drawHeight, selctedProd.y, prodLocation.drawHeight);
                                // console.log(cblockloc.isbottom, allowbottom);

                                let changesList = [];
                                if(cblockloc.isbottom !== undefined && cblockloc.isbottom !== allowbottom){
                                    if(allowbottom === true){
                                        changesList.push({
                                            type:"QTY_ADD", 
                                            loclist: [cblockloc],
                                            product: curmainprod.productInfo, 
                                            fieldidx: cselprod.fieldidx, 
                                            shelve: cselprod.shelveidx, 
                                            prodobj: curmainprod, 
                                            locobj: cblockloc, 
                                            changeqty: 1
                                        });
                                    } else{
                                        changesList.push({
                                            type:"QTY_REMOVE", 
                                            product: curmainprod.productInfo, 
                                            loclist: [cblockloc],
                                            fieldidx: cselprod.fieldidx, 
                                            shelve: cselprod.shelveidx, 
                                            prodobj: curmainprod, 
                                            locobj: cblockloc, 
                                            changeqty: 1
                                        });
                                    }
                                }
                                // console.log(changesList);

                                var nlocobj = {
                                    id:uuidv4(), f_uuid: uuidv4(), 
                                    uom: this.state.displayUOM, 
                                    x: selctedProd.x, y: selctedProd.y, 
                                    productWidth: prodLocation.productWidth, 
                                    productHeight: prodLocation.productHeight, 
                                    productDepth: prodLocation.productDepth,
                                    productRotation: prodLocation.productRotation, 
                                    drawWidth: prodLocation.drawWidth, 
                                    drawHeight: prodLocation.drawHeight,
                                    isRightSideOverLap: shelveCheck.isOverlap, 
                                    productUom: prodLocation.productUom, 
                                    isDelete: false, 
                                    isNew: true,
                                    isbottom: allowbottom,
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
                                    } else{
                                        cblockloc.isbottom = allowbottom;
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
                                
                                this.setState({ currentInternalDraggableProd: cselprod }, () => {
                                    if(!this.props.showFullScreenEditView){
                                        this.props.updateConvertDetails(field, true);
                                        this.props.handleRDChanges(changesList);
                                    }
                                });
                            }, 1100);        
                        });
                    }
                }
            }
        }
    }

    //reninit current field object
    reinitSaveObj = (mainresltobj) => {
        //check master data and set if not defined
        mainresltobj.masterFieldUom = (mainresltobj.masterFieldUom&&mainresltobj.masterFieldUom!=="none"?mainresltobj.masterFieldUom:mainresltobj.fieldDto.uom);
        mainresltobj.masterFieldWidth = (mainresltobj.masterFieldWidth&&mainresltobj.masterFieldWidth>0?mainresltobj.masterFieldWidth:mainresltobj.fieldDto.width);
        mainresltobj.masterFieldHeight = (mainresltobj.masterFieldHeight&&mainresltobj.masterFieldHeight>0?mainresltobj.masterFieldHeight:mainresltobj.fieldDto.height);
        
        //if shelves not defined yet
        var isallowfieldedit = false; //allow to edit field edit
        var isalloweditovrmargin = false; //allow to edit overlap margin

        var cfieldstatus = "DRAFT";
        var cfieldactivemode = false;

        let leftRightObj = { isavailable: false, left: null, right: null };

        let totalProdCountForExport = 0;
        for (let z = 0; z < mainresltobj.fieldsList.length; z++) {
            const cresltobj = mainresltobj.fieldsList[z];
            
            //rightside dealer available
            if(cresltobj.rightSidePlanogramFieldDto && Object.keys(cresltobj.rightSidePlanogramFieldDto).length > 0){
                isalloweditovrmargin = true;
                //is last field
                if((z + 1) === mainresltobj.fieldsList.length){
                    leftRightObj.isavailable = true;
                    leftRightObj.right = cresltobj.rightSidePlanogramFieldDto;
                }
            }
            
            //leftside dealer available
            if(cresltobj.leftSidePlanogramFieldDto && Object.keys(cresltobj.leftSidePlanogramFieldDto).length > 0){
                //is last field
                if(z === 0){
                    leftRightObj.isavailable = true;
                    leftRightObj.left = cresltobj.leftSidePlanogramFieldDto;
                }
            }

            //if shelve details not found
            if(cresltobj.id > 0 && cresltobj.planogramShelfDto.length === 0){
                var cshelflist = (cresltobj.fieldDto.shelf?cresltobj.fieldDto.shelf:[]);
                var nshelftlist = [];
                for (var i = 0; i < cshelflist.length; i++) {
                    var cvlist = cshelflist[i];
                    var devslvno = (cshelflist.length - i);
                    var scobj = { id: uuidv4(),f_uuid: uuidv4(),width: cvlist.width, height: cvlist.height, gap:  cvlist.gap, 
                        uom: cresltobj.masterFieldUom, rank: cvlist.rank, x: cvlist.x, y:cvlist.y, reverseRowNumber: devslvno, 
                        planogramProduct: [], planogramShelfChanges: [], isNew: true, isDelete: false
                    }
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

                                            totalProdCountForExport ++;
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
            
            cfieldstatus = (cresltobj.floorLayoutStatus?cresltobj.floorLayoutStatus:"DRAFT");
            cfieldactivemode = (cfieldstatus === "ACTIVE" || (cresltobj.baseFloorLayoutId && cresltobj.baseFloorLayoutId > 0)?true:false);
        }
        
        this.setState({
            viewObj: mainresltobj,
            displayUOM: mainresltobj.masterFieldUom, 
            fieldStatus: cfieldstatus,
            isActiveMode: cfieldactivemode,
            allowEditOverflwMargin: isalloweditovrmargin,
            leftRightObj: (leftRightObj.isavailable?leftRightObj:null),
            totalProdsForExport: totalProdCountForExport,
        }, () => {
            if(!this.props.showFullScreenEditView){
                this.props.updateConvertDetails(mainresltobj, false, null, () => {
                    this.setState({isenablefieldedit: (!this.state.isActiveMode?isallowfieldedit:false), isEdit: !isallowfieldedit});
                    this.calculateRate(true);
        
                    if(cfieldactivemode && !this.state.isPrintPending){
                        this.activeCalculateRate(); //load active field details
                    }
                });    
            } else{
                this.setState({isenablefieldedit: (!this.state.isActiveMode?isallowfieldedit:false), isEdit: !isallowfieldedit});
                this.calculateRate(true);
    
                if(cfieldactivemode && !this.state.isPrintPending){ // && !this.props.showFullScreenEditView
                    this.activeCalculateRate(); //load active field details
                }
            }
        });
    }

    //floor draw dementions calculate
    calculateRate() {
        //console.log(isactiveview);
        if(this.props.saveObj && Object.keys(this.props.saveObj).length > 0){
            var csobj = structuredClone(this.props.saveObj);
            //calculate dimention
            var dimention = ((this.state.divHeight - 55) / csobj.masterFieldHeight);
            //current field width/height
            // this.dheight = measureConverter(csobj.masterFieldUom,this.state.displayUOM,csobj.masterFieldHeight) * dimention;
            // this.dwidth = measureConverter(csobj.masterFieldUom,this.state.displayUOM,csobj.masterFieldWidth) * dimention;
            
            this.setState({ 
                displayRatio: dimention, 
                ismdfieldset: false 
            }, () => {
                this.drawRect();
            });
        } 
    }

    drawRect() {
        var mainobj = (this.props.showFullScreenEditView?this.state.viewObj:this.props.saveObj);
        let allSnapshotBrandList = this.props.allSnapshotBrandList;

        var cshelfs = [];
        //convert x,y,width,height to field ratio
        let viewWidth = 0;
        let viewHeight = 0;
        if(mainobj && Object.keys(mainobj).length > 0){
            let displayRatio = this.state.displayRatio;

            let startx = 0;
            for (let z = 0; z < mainobj.fieldsList.length; z++) {
                let csobj = mainobj.fieldsList[z];

                csobj["startX"] = startx;
                csobj["drawWidth"] = (measureConverter(csobj.masterFieldUom,this.state.displayUOM,csobj.masterFieldWidth) * displayRatio);
                csobj["drawHeight"] = (measureConverter(csobj.masterFieldUom,this.state.displayUOM,csobj.masterFieldHeight) * displayRatio);

                //starty to get margin from top
                let masterFieldDrawHeight = (mainobj.masterFieldHeight * displayRatio);
                let gapfromtop = ((masterFieldDrawHeight - csobj.drawHeight) + 20);
                csobj["startY"] = (gapfromtop);

                viewWidth = (viewWidth + csobj.drawWidth);
                viewHeight = (csobj.drawHeight > viewHeight?(csobj.drawHeight + 20):viewHeight);

                let fieldwidthx = (startx + csobj.drawWidth);

                if (csobj.planogramShelfDto) {
                    cshelfs = (csobj.planogramShelfDto?csobj.planogramShelfDto:[]);
                    
                    var prevGap = gapfromtop;
                    for (let i = 0; i < cshelfs.length; i++) {
                        const shelf = cshelfs[i];
                        let drawWidth = (measureConverter(csobj.masterFieldUom,this.state.displayUOM,shelf.width) * displayRatio);
                        let drawHeight = (measureConverter(csobj.masterFieldUom,this.state.displayUOM,shelf.height) * displayRatio);
                        let drawGap = (measureConverter(csobj.masterFieldUom,this.state.displayUOM,shelf.gap) * displayRatio);

                        //pick x, y
                        shelf.x = startx;
                        shelf.y = prevGap;
                        
                        shelf.drawWidth = drawWidth;
                        shelf.drawHeight = drawHeight;
                        shelf.drawGap = drawGap;
                        
                        if(shelf.isDelete === false){
                            prevGap = prevGap + (drawHeight + drawGap);
                        }

                        if(this.props.isFullScreenMode && !this.state.isPrintPending){
                            shelf.deptWarnList = [];
                            shelf.recWarnList = [];
                        }

                        //convert overlap values to draw
                        if(shelf.overLappingDto && shelf.overLappingDto.length > 0){
                            var curshelvey = (shelf.y + shelf.drawHeight);
                            const sortoverlaplist = shelf.overLappingDto.sort((a, b) => parseFloat(b.y) - parseFloat(a.y)); //descend array from y value
                            
                            for (let n = 0; n < sortoverlaplist.length; n++) {
                                const overlapitem = sortoverlaplist[n];
                                overlapitem.x = (startx - (measureConverter((overlapitem.fieldUom?overlapitem.fieldUom:this.state.displayUOM),this.state.displayUOM,overlapitem.crossingWidth) * this.state.displayRatio));
                                overlapitem.drawWidth = measureConverter(overlapitem.productUom,this.state.displayUOM,overlapitem.productWidth) * this.state.displayRatio;
                                overlapitem.drawHeight = measureConverter(overlapitem.productUom,this.state.displayUOM,overlapitem.productHeight) * this.state.displayRatio;
                                overlapitem.y = curshelvey - overlapitem.drawHeight;

                                curshelvey = overlapitem.y; //set curprod y to shelvey
                            }
                        }

                        for (var j = 0; j < shelf.planogramProduct.length; j++) {
                            const prodobj = shelf.planogramProduct[j];

                            //dept warn
                            let isDeptProdFound = false;
                            let deptWarnDetails = {x: 0, y: 0, drawWidth: 0, drawHeight: 0};
                            
                            let isRecPerWarnFound = false;
                            let firstLocDetails = {x: 0, y: 0, drawWidth: 0, drawHeight: 0};
                            
                            var frontfacingwidth = 0; var frontfacingqty = 0; var totaladdedqty = 0; var totalfacingwidth = 0;
                            for (var l = 0; l < prodobj.productBlock.length; l++) {
                                const blockobj = prodobj.productBlock[l];
                                
                                blockobj.x = (startx + (blockobj.x * this.state.displayRatio));
                                blockobj.y = (csobj.startY + (blockobj.y * this.state.displayRatio));
                                
                                blockobj.drawWidth = measureConverter(prodobj.productUom,this.state.displayUOM,prodobj.productWidth) * this.state.displayRatio;
                                blockobj.drawHeight = measureConverter(prodobj.productUom,this.state.displayUOM,prodobj.productHeight) * this.state.displayRatio;

                                for (var k = 0; k < blockobj.productLocations.length; k++) {
                                    const plocobj = blockobj.productLocations[k];

                                    plocobj.x = (startx + (plocobj.x * this.state.displayRatio));
                                    plocobj.y = (csobj.startY + (plocobj.y* this.state.displayRatio));
                                    //
                                    plocobj.drawWidth = measureConverter(plocobj.productUom,this.state.displayUOM,plocobj.productWidth) * this.state.displayRatio;
                                    plocobj.drawHeight = measureConverter(plocobj.productUom,this.state.displayUOM,plocobj.productHeight) * this.state.displayRatio;
                                    //overlap object convert
                                    if(plocobj.overLappingDto && Object.keys(plocobj.overLappingDto).length > 0){

                                        plocobj.overLappingDto.x = (startx + (plocobj.overLappingDto.x * this.state.displayRatio));
                                        plocobj.overLappingDto.y = (csobj.startY + (plocobj.overLappingDto.y * this.state.displayRatio));

                                        plocobj.overLappingDto.drawWidth = measureConverter(plocobj.overLappingDto.productUom,this.state.displayUOM,plocobj.overLappingDto.productWidth) * this.state.displayRatio;
                                        plocobj.overLappingDto.drawHeight = measureConverter(plocobj.overLappingDto.productUom,this.state.displayUOM,plocobj.overLappingDto.productHeight) * this.state.displayRatio;
                                    }

                                    //check is bottom location and add width to front faceing totals
                                    var allowbottom = checkProductIsInBottom(shelf.y,shelf.drawHeight,plocobj.y,plocobj.drawHeight);
                                    if(allowbottom){
                                        frontfacingwidth = frontfacingwidth + prodobj.productWidth; frontfacingqty = frontfacingqty + 1;
                                        plocobj["isbottom"] = true;
                                        totalfacingwidth = totalfacingwidth + plocobj.productWidth;
                                    } else{
                                        plocobj["isbottom"] = false;
                                    }
                                    totaladdedqty = totaladdedqty + 1;

                                    if(this.props.isFullScreenMode && !this.state.isPrintPending){
                                        //set as dept prod
                                        if(!isDeptProdFound && prodobj.productInfo.isDepartmentProduct){
                                            isDeptProdFound = true;
                                            // plocobj.showRecWarning = true;
    
                                            deptWarnDetails.x = plocobj.x;
                                            deptWarnDetails.y = plocobj.y;
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
                                    }

                                    //temp -
                                    /* if(shelf.rank === 2 && j === 0 && l === 0 && k === 0){
                                        plocobj["showRecWarning"] = true;
                                    } */
                                }
                            }
                            //prodobj["frontfacingwidth"] = frontfacingwidth;
                            prodobj["productFacingQty"] = frontfacingqty;
                            prodobj["loadingProductFacingQty"] = frontfacingqty;
                            prodobj["productTotalQty"] = totaladdedqty;
                            prodobj["productFacingWidth"] = roundOffDecimal(totalfacingwidth,10);
                            prodobj["tempoldqty"] = totaladdedqty;

                            if(this.props.isFullScreenMode && !this.state.isPrintPending && !prodobj.isDelete){
                                //add prods to warning list
                                let prodinfo = prodobj.productInfo;
                                if(isDeptProdFound && prodinfo && prodinfo.isDepartmentProduct){
                                    shelf.deptWarnList.push(deptWarnDetails);
                                }
    
                                //rec% warn changes
                                if(isRecPerWarnFound){
                                    let findSnapObj = allSnapshotBrandList.find(x => (x.departmentId === prodinfo.departmentId && x.categoryId === prodobj.categoryLevel.categoryId && x.subcategoryId === prodobj.subcategoryLevel.subcategoryId && x.brandId === prodobj.brandLevel.brandId));
                                    // console.log(findSnapObj);
                                    
                                    if(findSnapObj){
                                        let recSpace = findSnapObj.recommendedSpace;
    
                                        if(recSpace === 0){
                                            shelf.recWarnList.push(firstLocDetails);
                                        }
                                    }
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

                    //starty to get margin from top
                    let rightGapfromTop = ((masterFieldDrawHeight - crightobj.drawHeight) + 20);
                    
                    crightobj["startX"] = fieldwidthx;
                    crightobj["startY"] = rightGapfromTop;
                    
                    var prevGap2 = rightGapfromTop;
                    for (let i = 0; i < rightshelfs.length; i++) {
                        const shelf = rightshelfs[i];
                        let drawWidth = measureConverter(crightobj.masterFieldUom,csobj.masterFieldUom,shelf.width) * this.state.displayRatio;
                        let drawHeight = measureConverter(crightobj.masterFieldUom,csobj.masterFieldUom,shelf.height) * this.state.displayRatio;
                        let drawGap = measureConverter(crightobj.masterFieldUom,csobj.masterFieldUom,shelf.gap) * this.state.displayRatio;

                        //pick x, y
                        shelf.x = fieldwidthx;
                        shelf.y = prevGap2;

                        shelf.drawWidth = drawWidth;
                        shelf.drawHeight = drawHeight;
                        shelf.drawGap = drawGap;

                        if(shelf.isDelete === false){
                            prevGap2 = prevGap2 + (drawHeight + drawGap);
                        }
                    }
                }   

                startx = fieldwidthx;

                csobj["planogramShelfDto"] = cshelfs;

                //isallowed to overlap check
                if (csobj.rightSidePlanogramFieldDto) {
                    csobj = compareSideToAllowDrop(csobj, mainobj.fieldsList);
                }

            }
        }
        
        // console.log(mainobj);
        this.setState({ 
            viewObj: mainobj,
            viewWidth: viewWidth,
            viewHeight: viewHeight
        }, () => {
            if(!this.props.showFullScreenEditView){
                this.props.updateConvertDetails(mainobj, false, this.state.displayRatio);
            }
        });
    }

    //floor draw dementions calculate
    activeCalculateRate() {
        if(this.props.activeViewObj && Object.keys(this.props.activeViewObj).length > 0){
            let cdraftsobj = structuredClone(this.props.saveObj);
            let cactsobj = structuredClone(this.props.activeViewObj);
            // console.log(cactsobj);
            
            //get highest field
            let prevHeight = 0;
            let highestField = null;
            for (let i = 0; i < cactsobj.fieldsList.length; i++) {
                const fieldobj = cactsobj.fieldsList[i];
                if(fieldobj){
                    let fieldHeight = measureConverter(fieldobj.masterFieldUom, this.state.displayUOM, fieldobj.masterFieldHeight);
                    if(fieldHeight > prevHeight){
                        prevHeight = fieldHeight;
                        highestField = fieldobj;
                    }
                }
            }

            if(highestField){
                //active field width/height
                var actdimention = ((this.state.divHeight - 55) / highestField.masterFieldHeight);
    
                //active current field width/height
                // this.adheight = (measureConverter(highestField.masterFieldUom,this.state.displayUOM,highestField.masterFieldHeight) + 20) * actdimention;
                this.adwidth = measureConverter(highestField.masterFieldUom,this.state.displayUOM,highestField.masterFieldWidth) * actdimention;
                
                cactsobj.masterFieldUom = highestField.masterFieldUom;
                cactsobj.masterFieldWidth = highestField.masterFieldWidth;
                cactsobj.masterFieldHeight = highestField.masterFieldHeight;

                this.setState({ 
                    // aviewHeight: this.adheight, 
                    adisplayRatio: actdimention 
                }, () => {
                    this.drawActiveData(cdraftsobj, cactsobj);
                });
            }
        }
    }

    //convert loaded active planogra details to drawable width/height
    drawActiveData(draftobj, mainobj) {
        let cshelfs = []; 
        let draftshelfs = [];
        let totalWidth = 0;
        
        let viewHeight = 0;
        let totalprodcount = 0;
        
        let isDraftUpdated = false;

        let parentActiveObj = this.props.activeViewObj;
        // console.log(parentActiveObj);
        
        if(mainobj && Object.keys(mainobj).length > 0){
            let displayRatio = this.state.adisplayRatio;
            
            let startx = 0;
            for (let z = 0; z < mainobj.fieldsList.length; z++) {
                const csobj = mainobj.fieldsList[z];
                
                if(csobj){
                    csobj["startX"] = startx;
                    csobj["drawWidth"] = (measureConverter(csobj.masterFieldUom,this.state.displayUOM,csobj.masterFieldWidth) * displayRatio);
                    csobj["drawHeight"] = (measureConverter(csobj.masterFieldUom,this.state.displayUOM,csobj.masterFieldHeight) * displayRatio);

                    totalWidth = (totalWidth + csobj.drawWidth);
                    viewHeight = (csobj.drawHeight > viewHeight?(csobj.drawHeight + 20):viewHeight);

                    //starty to get margin from top
                    let masterFieldDrawHeight = (mainobj.masterFieldHeight * displayRatio);
                    let gapfromtop = ((masterFieldDrawHeight - csobj.drawHeight) + 20);
                    csobj["startY"] = (gapfromtop);
                    
                    let fieldwidthx = (startx + csobj.drawWidth);
    
                    //set width height details
                    var adwidth = measureConverter(csobj.masterFieldUom,this.state.displayUOM,csobj.masterFieldWidth) * displayRatio;
                    
                    if (csobj.planogramShelfDto) {
                        cshelfs = (csobj.planogramShelfDto?csobj.planogramShelfDto:[]);
                        cshelfs.sort(sortShelvesDesc);
                        //if draft shelve needs to be filled from active one
    
                        let draftfield = draftobj.fieldsList[z];
                        draftshelfs = (draftfield.planogramShelfDto?draftfield.planogramShelfDto:[]);
                        draftshelfs.sort(sortShelvesDesc);

                        //parent active object
                        let parentfieldobj = parentActiveObj.fieldsList[z];
                        let parentshelflist = (parentfieldobj?parentfieldobj.planogramShelfDto:[]);
                        parentshelflist.sort(sortShelvesDesc);
                        
                        var prevGap = gapfromtop;
                        for (let i = 0; i < cshelfs.length; i++) {
                            const shelf = cshelfs[i];
                            let drawHeight = measureConverter(csobj.masterFieldUom,this.state.displayUOM,shelf.height) * displayRatio;
                            let drawGap = measureConverter(csobj.masterFieldUom,this.state.displayUOM,shelf.gap) * displayRatio;
    
                            //if index more than 0. add draw height+ previus gap to shelve y axis
                            if (i > 0) {
                                for (let index = 0; index < cshelfs.length; index++) {
                                    const element = cshelfs[index];
                                    if (element.rank === (shelf.rank - 1)) {
                                        shelf.x = startx;
                                        shelf.y = element.y + (element.drawHeight + prevGap);
                                    }
                                }
                            } else{
                                shelf.x = startx;
                            }

                            //sets draw width/height of shelve
                            shelf.y = prevGap;
                            shelf.drawWidth = adwidth;
                            shelf.drawHeight = drawHeight;
                            shelf.drawGap = drawGap;
                            
                            if(shelf.isDelete === false){
                                prevGap = prevGap + (drawHeight + drawGap);
                            }

                            //convert overlap values to draw
                            let draftoverlaplist = [];
                            if(shelf.overLappingDto && shelf.overLappingDto.length > 0){
                                var curshelvey = (shelf.y + shelf.drawHeight);
                                const sortoverlaplist = shelf.overLappingDto.sort((a, b) => parseFloat(b.y) - parseFloat(a.y)); //descend array from y value
                                
                                for (let n = 0; n < sortoverlaplist.length; n++) {
                                    const overlapitem = sortoverlaplist[n];
                                    draftoverlaplist.push(structuredClone(overlapitem));

                                    overlapitem.x = (startx + (measureConverter((overlapitem.fieldUom?overlapitem.fieldUom:this.state.displayUOM),this.state.displayUOM,overlapitem.x) * this.state.adisplayRatio));
                                    overlapitem.drawWidth = measureConverter(overlapitem.productUom,this.state.displayUOM,overlapitem.productWidth) * this.state.adisplayRatio;
                                    overlapitem.drawHeight = measureConverter(overlapitem.productUom,this.state.displayUOM,overlapitem.productHeight) * this.state.adisplayRatio;
                                    overlapitem.y = curshelvey - overlapitem.drawHeight;

                                    curshelvey = overlapitem.y; //set curprod y to shelvey
                                }
                            }
                            
                            const newdraftprodlist = [];
                            for (var j = 0; j < shelf.planogramProduct.length; j++) {
                                const prodobj = shelf.planogramProduct[j];
                                //const prodInfo = prodobj.productInfo;
                                var tempoldqty = 0;
    
                                //new draft product
                                const draftprodobj = structuredClone(prodobj);
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
                                    blockobj.x = (startx + (blockobj.x * this.state.adisplayRatio));
                                    blockobj.y = (csobj.startY + (blockobj.y * this.state.adisplayRatio));
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
                                        plocobj.x = (startx + (plocobj.x * this.state.adisplayRatio));
                                        plocobj.y = (csobj.startY + (plocobj.y * this.state.adisplayRatio));
                                        plocobj.drawWidth = measureConverter(plocobj.productUom,this.state.displayUOM,plocobj.productWidth) * this.state.adisplayRatio;
                                        plocobj.drawHeight = measureConverter(plocobj.productUom,this.state.displayUOM,plocobj.productHeight) * this.state.adisplayRatio;
                                        
                                        //check is bottom location and add width to front faceing totals
                                        var allowbottom = checkProductIsInBottom(shelf.y,shelf.drawHeight,plocobj.y,plocobj.drawHeight);
                                        if(allowbottom){
                                            plocobj["isbottom"] = true;
                                        }
    
                                        draftblockobj.productLocations.push(draftplocobj);
                                        
                                        tempoldqty = tempoldqty + 1;
                                        totalprodcount++;
                                    }
    
                                    draftprodobj.productBlock.push(draftblockobj);
                                }
                                prodobj["tempoldqty"] = tempoldqty;
                                
                                // console.log(parentActiveObj.fieldsList[z].planogramShelfDto[i].planogramProduct[j]);
                                let parentshelfobj = (parentshelflist.length > 0?parentshelflist[i]:null);

                                if(parentshelfobj && parentshelfobj.planogramProduct[j]){
                                    parentshelfobj.planogramProduct[j].tempoldqty = tempoldqty;
                                }
    
                                newdraftprodlist.push(draftprodobj);
                            }
    
                            cshelfs[i] = shelf;

                            // console.log(csobj.isFieldCopy, draftfield.isFieldCopy);
                            if(this.state.fieldStatus === "DRAFT"){
                                if(draftfield.isFieldCopy === false && draftshelfs[i]){
                                    isDraftUpdated = true;
                                    draftshelfs[i].overLappingDto = draftoverlaplist;
                                    draftshelfs[i]["planogramProduct"] = newdraftprodlist;
                                }
                            }
                        }
                    } 
                    
                    startx = fieldwidthx;
    
                    csobj["planogramShelfDto"] = cshelfs;
                }
            }
        }
        
        // console.log(mainobj);
        this.setState({ 
            aviewHeight: viewHeight,
            activeViewObj: mainobj, 
            totalActiveProdForExport: totalprodcount,
            aviewWidth: totalWidth 
        }, () => {
            if(!this.props.isActiveFirstTimeLoaded && !this.props.showFullScreenEditView){
                this.props.updateActiveConvertDetails(parentActiveObj);
    
                //if draft view products needs to be draw from active field product details
                if(this.state.fieldStatus === "DRAFT" && isDraftUpdated){
                    //#PLG-DU-FE-H01
                    this.props.updateConvertDetails(draftobj, false, null, () => {
                        this.setState({ isenablefieldedit: false, alloweditoverflwmargin: false });
                        this.calculateRate(true);
                    });
                }
            }
        });
    }

    toggleRLView = (showstat) => {
        this.setState({ isShowRLView: showstat, loadedProdCount: 0 }, () => {
            this.handleToolControls("zoomreset");
        });
    }

    //new tools handle
    handleToolControls = (tooltype, event, startpan) => {
        let activezoompan = true;
        let isactiveview = this.state.isShowRLView;
        let viewid = (isactiveview?"ac-mainsvg-view":"mainsvg-view");

        //view width/height
        let vwidth = (isactiveview?this.state.aviewWidth:this.state.viewWidth);
        // let vheight = (isactiveview?this.state.aviewHeight:this.state.viewHeight);

        let iszpactive = this.state.zoompanactive;
        let actool = this.state.activetool;
        let stpan = this.state.startpan;

        let zoomdrawx = this.state.zoomDrawX;
        let aczoomdrawx = this.state.aczoomDrawX;
        
        if(tooltype === "zoomin"){
            zoomdrawx = (zoomdrawx + 1);

            handleZoomInOut(viewid, true, false, vwidth, 0, zoomdrawx);

            this.setState({ isShowProdView: false, isenablefieldedit: false, isviewvmenu: false });
        } else if(tooltype === "zoomout"){
            if((zoomdrawx - 1) <= 0){
                zoomdrawx = 0;
                activezoompan = false;

                handleZoomInOut(viewid, false, true, vwidth, 0, zoomdrawx);
            } else{
                zoomdrawx = (zoomdrawx - 1);
                handleZoomInOut(viewid, true, false, vwidth, 0, zoomdrawx);
            }

        } else if(tooltype === "zoomreset"){
            activezoompan = false;
            zoomdrawx = 0;

            handleZoomInOut(viewid, false, true, vwidth, 0, zoomdrawx);

            this.setState({ activetool: "drawBlock" }, () => {
                this.closeBlockContext();
            });
        }
        
        if(tooltype === "zoomin" || tooltype === "zoomout" || tooltype === "zoomreset"){
            this.setState({ 
                zoomDrawX: zoomdrawx, 
                aczoomDrawX: aczoomdrawx, 
                isViewContextmenu: false, 
                contxtMenu: { isexpand: false } 
            }, () => {
                this.props.updateZoomContent(this.state.zoomDrawX);
            });
        }
        
        if(tooltype === "pan"){
            if(actool === "pantool" && stpan){
                let fielddetails = { drawWidth: this.state.viewWidth, drawHeight: this.state.viewHeight };
                if(isactiveview){
                    fielddetails = { drawWidth: this.state.aviewWidth, drawHeight: this.state.aviewHeight };
                }
                
                let isShowRLView = (this.state.isPrintPending?this.props.isPrintRLView:this.state.isShowRLView);
                let checksvgid = (isShowRLView?"activedrawsvg-wrapper":"maindrawsvg-wrapper");
                
                handlePanView(checksvgid, event, iszpactive, this.state.zoomDrawX, fielddetails);
            }
        } else if(tooltype === "panstart"){
            this.setState({ startpan: startpan });

        } else if(tooltype === "pantool"){
            this.setState({ activetool: (tooltype === actool?"drawBlock":tooltype), isBlockMove: false, currentSelectedBlock: null });

        } else{
            this.setState({ zoompanactive: activezoompan, allowovrflwprod: (activezoompan && this.state.allowovrflwprod?false:this.state.allowovrflwprod) });

        }
    }
    //#PLG-DU-PS-H04 viewProduct details show
    viewProdOnClock = (e,prod) =>{
        e.preventDefault();
        
        if(e.shiftKey){ //on shiftkey - filter list
            var cfilterlist = this.props.filterRevenueList;
            var isalreadyadded = cfilterlist.findIndex(x => x.id === prod.id);

            if(isalreadyadded === -1){
                cfilterlist.push(prod);
            } else{
                cfilterlist.splice(isalreadyadded,1);
            }

            this.props.updateFilterRevenueList(cfilterlist);

        } else if(e.nativeEvent.which === 3){
            let editwrapper = document.body;

            // let normalize_pointer = this.getScreenPointer(e, 'ac-mainsvg-view');
            // let reducescrolledgap = ((normalize_pointer.x - editwrapper.scrollLeft) + 30);

            //reduce x if morethan body width
            // let cbodywidth = document.getElementById("maindraw-parent").clientWidth;
            // let totalcontextwidth = (reducescrolledgap + 280);

            // reducescrolledgap = (totalcontextwidth > cbodywidth?((reducescrolledgap - (totalcontextwidth - cbodywidth)) - 30):reducescrolledgap);

            let reduceXValue = ((e.clientX + 280) - editwrapper.clientWidth);
            
            this.setState({
                actViewMenu: {xpos: ((e.clientX - 80)-(reduceXValue > 0?reduceXValue:0)), ypos: (e.clientY - 60)},
                isActViewvMenu: !this.state.isActViewvMenu,
                curActViewableProd: prod
            });
        }
    }

    //clickon svgMouseDown
    svgMouseDown = (e) => {
        if(this.state.activetool === "pantool"){
            this.handleToolControls("panstart", e, true);
        } else if(this.state.activetool === "drawBlock"){
            let fieldStatus = this.state.fieldStatus;

            if(fieldStatus === "ACTIVE" || fieldStatus === "DRAFT"){
                this.startNewRect(e)
            }
        }
        
        /* this.setState({ isViewBlockContext: false, blockcontxt: {xpos: 0, ypos: 0} }); */
    }
    //clickon svgMouseMove
    svgMouseMove = (e) => {
        if(this.state.activetool === "pantool"){
            this.handleToolControls("pan", e);
        }else if(this.state.activetool === "drawBlock"){
            let fieldStatus = this.state.fieldStatus;
            
            if(fieldStatus === "ACTIVE" || fieldStatus === "DRAFT"){
                this.changeDashRect(e)
            }
        }
        
    }
    //clickon svgMouseUp
    svgMouseUp = (e) => {
        if(this.state.activetool === "pantool"){
            this.handleToolControls("panstart", e, false);
        } else if(this.state.activetool === "drawBlock"){
            let fieldStatus = this.state.fieldStatus;
            
            if(fieldStatus === "ACTIVE" || fieldStatus === "DRAFT"){
                if(!this.props.showFullScreenEditView && this.state.isshowdash){
                    this.drawNewRect(e);
                }
            }
        }
    }

    drawNewRect = (e, isautoselect)=>{
        if (this.state.isshowdash) {
            if(isautoselect || e.nativeEvent.which === 1){ //only left mouse click
                var drawedSelectionRect = structuredClone(this.dashrect);
                // console.log(drawedSelectionRect);

                this.setState({
                    selectedBlockPos: drawedSelectionRect,
                    isshowdash: false, 
                    isViewContextmenu: false, contxtMenu: null,
                    isActViewvMenu: false, actViewMenu: null,
                    isViewBlockContext: false, blockcontxt: { xpos: 0, ypos: 0 }, 
                },() => {
                    this.dashrect = { startx:0, starty: 0, x: 0, y: 0, width: 0, height: 0, percentage: 0 };
                    
                    if(this.dashrectRef && this.dashrectRef.current){
                        this.dashrectRef.current.setAttribute('x', this.dashrect.x);
                        this.dashrectRef.current.setAttribute('y', this.dashrect.y);
                        this.dashrectRef.current.setAttribute('width', this.dashrect.width);
                        this.dashrectRef.current.setAttribute('height', this.dashrect.height);
                    }

                    this.setSelectedblock();
                })
            }
        }
    }
   
    //#MP-SML-E-BS1
    setSelectedblock = () => {
        let pselectedBlock = this.state.selectedBlockPos;
        let fieldobj = (pselectedBlock.drawingDetails && pselectedBlock.drawingDetails.field?pselectedBlock.drawingDetails.field:null);

        if(fieldobj){
            let minStartX = pselectedBlock.x;
            let minStartY = pselectedBlock.y;
            let minEndY = roundOffDecimal((pselectedBlock.y + pselectedBlock.height),2);
            let minEndX = roundOffDecimal((pselectedBlock.x + pselectedBlock.width),2);

            let selectedxgap = (minEndX - minStartX);
            if(selectedxgap >= 5){
                let checkfieldobj = fieldobj.obj;
                let retrurnObj = GetContainingProdsByBox(minStartX, minStartY, minEndX, minEndY, checkfieldobj, fieldobj.key);
                // console.log(retrurnObj);
                
                if(!retrurnObj.isNoproducts){
                    let notDeletedProds = retrurnObj.selectedProds.filter(x => !x.isDelete);
                    
                    // let cactivetool = JSON.parse(JSON.stringify(this.state.activeTool));
                    if(notDeletedProds && notDeletedProds.length > 0){
                        this.setState({ activeTool: "default", isviewcmenu: false, contxtmenu: {isexpand: false} }, () => { 
                            let newblockobj = { fieldidx: fieldobj.key, rectdetails: retrurnObj.rectDetails, selectedShelves: retrurnObj.selectedshelves, drawingProducts: notDeletedProds };
                            
                            if(notDeletedProds && notDeletedProds.length > 0){
                                this.setState({ isBlockMove: false, currentSelectedBlock: null }, () => {
                                    this.setState({
                                        isBlockMove: true, 
                                        currentSelectedBlock: newblockobj,
                                        currentInternalDraggableProd: null,
                                        contxtMenu: null, 
                                    }); 
                                });
                            } else{
                                alertService.error(this.props.t("PRODUCT_BLOCK_NOT_FOUND"));
                                this.setState({ isBlockMove: false, currentSelectedBlock: null });
                            }
                        });
                    } else{
                        this.setState({ isBlockMove: false, currentSelectedBlock: null });
                    }
                } else{
                    this.setState({ isBlockMove: false, currentSelectedBlock: null });
                }    
            } else{
                this.setState({ isBlockMove: false, currentSelectedBlock: null });
            }
        }
    }
    
    startNewRect = (e) => {
        if(!this.props.showFullScreenEditView && e.nativeEvent.which === 1){ //only left mouse click
            let normalize_pointer = this.getScreenPointer(e, 'mainsvg-view');
            
            let newoffx = normalize_pointer.x;
            let newoffy = normalize_pointer.y;
        
            let positionobj = elmAccordingtoXY(newoffx, newoffy, null, null, this.props.saveObj);
            let drawingDetails = (positionobj && (Object.keys(positionobj).length > 0)?positionobj:null);
            // console.log(drawingDetails);

            this.setState({
                newrectstart: {x: newoffx, y:newoffy},
                isshowdash: true
            }, () => {
                this.dashrect = { drawingDetails:drawingDetails, startx: newoffx, starty: newoffy, x: newoffx, y:newoffy, width: 0, height: 0, percentage: 0 };

                if(this.dashrectRef && this.dashrectRef.current){
                    this.dashrectRef.current.setAttribute('x', this.dashrect.x);
                    this.dashrectRef.current.setAttribute('y', this.dashrect.y);
                    this.dashrectRef.current.setAttribute('width', this.dashrect.width);
                    this.dashrectRef.current.setAttribute('height', this.dashrect.height);
                }
            });
        }
    }
    
    //get new x point
    getScreenPointer = (e, svgid) => {
        let svg = document.getElementById(svgid);
        let point = svg.createSVGPoint();
        point.x = e.nativeEvent.clientX;
        point.y = e.nativeEvent.clientY;
        let target = e.target;
        let ctm = (target.getScreenCTM?target.getScreenCTM():null);

        return (ctm?point.matrixTransform(ctm.inverse()):{x: 0, y: 0});
    }

    changeDashRect = (e) => {
        if (!this.props.showFullScreenEditView && e && this.state.isshowdash) {
            let cobj = structuredClone(this.dashrect);
            
            if(cobj){
                let normalize_pointer = this.getScreenPointer(e, 'mainsvg-view');
                
                cobj["pointerX"] = normalize_pointer.x;
                cobj["pointerY"] = normalize_pointer.y;

                cobj["x"] = (cobj.startx < normalize_pointer.x?cobj.x:normalize_pointer.x);
                cobj["y"] = (cobj.starty < normalize_pointer.y?cobj.y:normalize_pointer.y);
                
                let boxwidth = (cobj.startx < normalize_pointer.x?Math.abs(normalize_pointer.x - cobj.startx):Math.abs(cobj.startx - normalize_pointer.x));
                cobj["width"] = boxwidth;

                let boxheight = (cobj.starty < normalize_pointer.y?Math.abs(normalize_pointer.y - cobj.starty):Math.abs(cobj.starty - normalize_pointer.y));
                cobj["height"] = boxheight;

                var dDetails = cobj.drawingDetails;
                if(dDetails && dDetails.field){
                    let fieldy2 = (dDetails.field && dDetails.field.drawHeight?(dDetails.field.y + dDetails.field.drawHeight):0);
                    if(fieldy2 < (cobj.y + cobj.height)){
                        cobj["height"] = dDetails.field.drawHeight;
                    }

                    if(dDetails.field.x > cobj.x){
                        cobj["x"] = dDetails.field.x;
                    }

                    if((dDetails.field.x + dDetails.field.drawWidth) < (cobj.x + cobj.width)){
                        cobj["width"] = ((dDetails.field.x + dDetails.field.drawWidth) - cobj.x);
                    }
                    
                }

                
                this.dashrect = cobj;

                if(this.dashrectRef && this.dashrectRef.current){
                    this.dashrectRef.current.setAttribute('x', this.dashrect.x);
                    this.dashrectRef.current.setAttribute('y', this.dashrect.y);
                    this.dashrectRef.current.setAttribute('width', this.dashrect.width);
                    this.dashrectRef.current.setAttribute('height', this.dashrect.height);
                }
            }
        } 
    }

    //triggers on added product drag start
    SingleProductDragStart = (e, currprod, fieldidx, shelveidx, prodidx, blockidx, locidx, locrect) => {
        e.preventDefault();
        let cdrgprod = {fieldidx: fieldidx, shelveidx: shelveidx, prodidx: prodidx, blockidx: blockidx, locidx: locidx, prod: currprod, locobj: locrect}; //set dragging product
        
        if (e.nativeEvent.which === 1) { //on left mouse key click
            this.setState({
                currentInternalDraggableProd: cdrgprod,
                isViewContextmenu: false, contxtMenu: {isexpand: false},
                isViewBlockContext: false, blockcontxt: { xpos: 0, ypos: 0 }, 
            });

        } else if (e.nativeEvent.which === 3) { //right mouse key click - shows delete modal
            let editwrapper = document.body;
            let reduceXValue = (this.props.isRTL === "rtl"?(0 - (e.clientX - 380)):((e.clientX + 380) - editwrapper.clientWidth));
            // console.log(reduceXValue);

            // let normalize_pointer = this.getScreenPointer(e, 'mainsvg-view');
            // let reducescrolledgap = ((normalize_pointer.x - editwrapper.scrollLeft) + 30);

            let cmenu = this.state.contxtMenu;

            //reduce x if morethan body width
            // let cbodywidth = document.getElementById("maindraw-parent").clientWidth;
            // let totalcontextwidth = (reducescrolledgap + 330);

            // reducescrolledgap = (totalcontextwidth > cbodywidth?((reducescrolledgap - (totalcontextwidth - cbodywidth)) - 30):reducescrolledgap);

            let xreducevalue = (reduceXValue > 0?(this.props.isRTL === "rtl"?reduceXValue:(reduceXValue * -1)):0);
            // console.log(xreducevalue);

            this.setState({
                contxtMenu: {xpos: ((e.clientX - 80)+xreducevalue), ypos: (e.clientY - 60), isexpand: (cmenu?cmenu.isexpand:false)},
                isViewContextmenu: !this.state.isViewContextmenu,
                currentInternalDraggableProd: cdrgprod,
            });
        }
    }

    //delete single product
    handleSingleProdDelete = () => {
        if (!this.state.currentInternalDraggableProd) {
            alertService.warn(this.props.t('PRODUCT_NOT_SELECTED'))
            return false;
        }

        const currprod = structuredClone(this.state.currentInternalDraggableProd);
        
        if(currprod){
            let prodetails = currprod.prod.productInfo;
            let prodname = (prodetails?((prodetails.brandName && prodetails.brandName !== "" && prodetails.brandName !== "-"?(prodetails.brandName+" "):(this.props.t("notavailable")+" "))+
            prodetails.productName)+"?" : "-");

            confirmAlert({
                title: this.props.t('deleteproduct'),
                message: (this.props.t('suretodelete')+" "+prodname),
                overlayClassName: (this.props.isRTL==="rtl"?"alertrtl-content":""),
                buttons: [{
                    label: this.props.t('btnnames.yes'),
                    onClick: () => {
                        const callrectdata = structuredClone(this.props.saveObj);
                        this.props.fieldHistoryAdd(JSON.parse(JSON.stringify(this.props.saveObj)),2);

                        let selectedfield = callrectdata.fieldsList[currprod.fieldidx];
                        const cpshelve = selectedfield.planogramShelfDto[currprod.shelveidx];
                        const cpprod = cpshelve.planogramProduct[currprod.prodidx];
                        const cpblock = (cpprod.productBlock[currprod.blockidx]);

                        const cprodloc = cpblock.productLocations[currprod.locidx];
                        const cdelprod = structuredClone(cprodloc);

                        //set needed data in update cut list function
                        currprod.x = cprodloc.x;
                        currprod.y = cprodloc.y;
                        currprod.drawWidth = cprodloc.drawWidth;
                        currprod.drawHeight = cprodloc.drawHeight;
                        currprod.shelfidx = currprod.shelveidx;

                        let cutobj = { rank: cpshelve.rank, iscopy: false, prods: [currprod] };

                        if(cprodloc.id > 0){ 
                            cprodloc["isDelete"] = true;
                            cprodloc["isNew"] = false;

                            if(cprodloc.overLappingDto){
                                if(!cprodloc.overLappingDto.isNew){
                                    cprodloc.overLappingDto["isDelete"] = true;
                                    cprodloc.overLappingDto["isNew"] = false;

                                    let changerightfield = callrectdata.fieldsList.findIndex(x => x.id === selectedfield.rightSidePlanogramFieldDto.id);
                                    let changerightshelf = (changerightfield > -1?callrectdata.fieldsList[changerightfield].planogramShelfDto.findIndex(x => x.id === cprodloc.overLappingDto.shelfId):-1);
                    
                                    if(changerightshelf > -1){
                                        let rightoverlaplist = callrectdata.fieldsList[changerightfield].planogramShelfDto[changerightshelf].overLappingDto;
                                        let findalreadyrightadded = rightoverlaplist.findIndex(x => x.id === cprodloc.overLappingDto.id && !x.isDelete);
                        
                                        if(findalreadyrightadded > -1){
                                            if(rightoverlaplist[findalreadyrightadded].isNew){
                                            rightoverlaplist.splice(findalreadyrightadded, 1);
                                            } else{
                                            rightoverlaplist[findalreadyrightadded].isDelete = true;
                                            }
                                        }
                                    }
                                } else{
                                    cprodloc.overLappingDto = null;
                                }
                            } else{
                                cprodloc.overLappingDto = null;
                            }

                        } else{
                            cpblock.productLocations.splice(currprod.locidx, 1);
                        }

                        let notDeletedProds = cpblock.productLocations.filter(pitem => !pitem.isDelete);

                        if(!notDeletedProds || notDeletedProds.length === 0){
                            if(cpblock.id > 0){ 
                                cpblock["isDelete"] = true;
                                cpblock["isNew"] = false;
                            } else{
                                cpprod.productBlock.splice(currprod.blockidx,1);
                            }   
                        }

                        //if block remove check main product change delete state
                        var notDeletedBlocks = cpprod.productBlock.filter(bitem => !bitem.isDelete);
                        if(!notDeletedBlocks || notDeletedBlocks.length === 0){
                            if(cpprod.id > 0 || cpprod.isFieldCopy){ 
                                cpprod["isDelete"] = true;
                                cpprod["isNew"] = false;
                            } else{
                                cpshelve.planogramProduct.splice(currprod.prodidx,1);
                            }
                        }

                        this.props.updateCutList([cutobj]);

                        this.setState({  
                            isselectprodblock: false, isBlockMove: false, isViewContextmenu: false, 
                            currentInternalDraggableProd: null, contxtMenu: null, 
                            isViewBlockContext: false, blockcontxt: { xpos: 0, ypos: 0 }, 
                        }, () => {
                            if(!this.props.showFullScreenEditView){

                                this.props.updateConvertDetails(callrectdata, true, null, () => {
                                    var allowbottom = checkProductIsInBottom(cpshelve.y, cpshelve.drawHeight, cdelprod.y, cdelprod.drawHeight);

                                    let newrdobj = [{type:"QTY_REMOVE", loclist: (allowbottom?[cdelprod]:[]), product: currprod.prod.productInfo, fieldidx: currprod.fieldidx, shelve: currprod.shelveidx, prodobj: cpprod, locobj: cdelprod, changeqty: (allowbottom?1:0)}];
                                    this.props.handleRDChanges(newrdobj);
                                });
                            }
                        });
                    }
                }, {
                    label: this.props.t('btnnames.no')
                }
                ]
            });
        }
    }

    //handle delete shelve prod block
    handleDeleteAllProd = () => {
        if (!this.state.currentInternalDraggableProd) {
            alertService.warn(this.props.t('PRODUCT_NOT_SELECTED'))
            return false;
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
                        const callrectdata = JSON.parse(JSON.stringify(this.props.saveObj));
                        this.props.fieldHistoryAdd(JSON.parse(JSON.stringify(this.props.saveObj)),2);

                        let selectedfield = callrectdata.fieldsList[currprod.fieldidx];
                        const cpshelve = selectedfield.planogramShelfDto[currprod.shelveidx];
                        const cpprod = cpshelve.planogramProduct[currprod.prodidx];
                        const cpblock = (cpprod.productBlock[currprod.blockidx]);

                        var totalbottomqty = 0;
                        let totalRemoveLocs = [];
                        for (var v = 0; v < cpblock.productLocations.length; v++) {
                            const cblcitem = cpblock.productLocations[v];

                            //block item remove change - RD changes
                            if(!cblcitem.isDelete){
                                var allowbottom = checkProductIsInBottom(cpshelve.y,cpshelve.drawHeight,cblcitem.y,cblcitem.drawHeight);
                                if(allowbottom){
                                    totalbottomqty = totalbottomqty + 1;
                                    totalRemoveLocs.push(structuredClone(cblcitem));
                                }
                            }
                        }
                        
                        //remove block locations
                        var prodlist = [];
                        //var isblockdelete = true;
                        for (var k = 0; k < cpblock.productLocations.length; k++) {
                            let prodloc = cpblock.productLocations[k];
                            if(prodloc.id > 0){ 
                                prodloc["isDelete"] = true;
                                prodloc["isNew"] = false;

                                if(prodloc.overLappingDto){
                                    if(!prodloc.overLappingDto.isNew){
                                        prodloc.overLappingDto["isDelete"] = true;
                                        prodloc.overLappingDto["isNew"] = false;

                                        let changerightfield = callrectdata.fieldsList.findIndex(x => x.id === selectedfield.rightSidePlanogramFieldDto.id);
                                        let changerightshelf = (changerightfield > -1?callrectdata.fieldsList[changerightfield].planogramShelfDto.findIndex(x => x.id === prodloc.overLappingDto.shelfId):-1);
                        
                                        if(changerightshelf > -1){
                                            let rightoverlaplist = callrectdata.fieldsList[changerightfield].planogramShelfDto[changerightshelf].overLappingDto;
                                            let findalreadyrightadded = rightoverlaplist.findIndex(x => x.id === prodloc.overLappingDto.id && !x.isDelete);
                            
                                            if(findalreadyrightadded > -1){
                                                if(rightoverlaplist[findalreadyrightadded].isNew){
                                                rightoverlaplist.splice(findalreadyrightadded, 1);
                                                } else{
                                                rightoverlaplist[findalreadyrightadded].isDelete = true;
                                                }
                                            }
                                        }
                                    } else{
                                        prodloc.overLappingDto = null;
                                    }
                                } else{
                                    prodloc.overLappingDto = null;
                                }
                                
                                prodlist.push(prodloc);
                            }
                        }
                        cpblock.productLocations = prodlist;

                        if(cpblock.id > 0){ 
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

                        this.setState({ 
                            isselectprodblock: false, isBlockMove: false, isViewContextmenu: false, 
                            currentInternalDraggableProd: null, contxtMenu: null, 
                            isViewBlockContext: false, blockcontxt: { xpos: 0, ypos: 0 }, 
                        }, () => {
                            if(!this.props.showFullScreenEditView){
                                this.props.updateConvertDetails(callrectdata, true, null, () => {
                                    //block remove change - RD changes
                                    let newrdobj = [{type:"REMOVE_BLOCK", loclist: totalRemoveLocs, product: currprodinfo, fieldidx: currprod.fieldidx, shelve: currprod.shelveidx, prodobj: cpprod, locobj: null, changeqty: totalbottomqty}];
                                    this.props.handleRDChanges(newrdobj);
                                });
                            }
                        });
                    }
                  }, {
                    label: this.props.t('btnnames.no')
                  }
                ]
            });
        }
    }

    //expand toggle
    handleExpandProd = (isenable) => {
        if(isenable){
            var cxobj = this.state.contxtMenu;

            this.setState({
                isViewContextmenu: false, 
                isViewBlockContext: false, blockcontxt: { xpos: 0, ypos: 0 }, 
                contxtMenu: { xpos: cxobj.xpos, ypos: cxobj.ypos, isexpand: !cxobj.isexpand },
                isBlockMove: false, currentSelectedBlock: null,
            });
        } else{
            this.setState({ 
                isViewContextmenu: false,
                isViewBlockContext: false, blockcontxt: { xpos: 0, ypos: 0 },  
                contxtMenu: null,
                isBlockMove: false, currentSelectedBlock: null,
            });
        }
    }

    handleSelectAllBlock = () => {
        let curselprod = this.state.currentInternalDraggableProd;

        if (!curselprod) {
            alertService.warn(this.props.t('PRODUCT_NOT_SELECTED'))
            return false;
        }

        if(curselprod){
            let viewobj = this.props.saveObj;
            let cblock = viewobj.fieldsList[curselprod.fieldidx].planogramShelfDto[curselprod.shelveidx].planogramProduct[curselprod.prodidx].productBlock[curselprod.blockidx];
            
            let totalwidth = 0;
            let totalheight = 0;
            for (let i = 0; i < cblock.productLocations.length; i++) {
                const blockprod = cblock.productLocations[i];
                
                totalwidth = (totalwidth + blockprod.drawWidth);
                totalheight = (totalheight < blockprod.drawHeight?blockprod.drawHeight:totalheight);
            }

            let sortlocsx = cblock.productLocations.sort((a, b) => (a.x - b.x));
            let lowestprodx = sortlocsx[0];

            let newoffx = lowestprodx.x;
            let newoffy = lowestprodx.y;
        
            let positionobj = elmAccordingtoXY(newoffx, newoffy, null, null, this.props.saveObj);
            let drawingDetails = (positionobj && (Object.keys(positionobj).length > 0)?positionobj:null);
            // console.log(drawingDetails);

            this.setState({
                newrectstart: {x: newoffx, y:newoffy},
                isshowdash: true,
                isViewContextmenu: false, contxtMenu: null,
                isViewBlockContext: false, blockcontxt: { xpos: 0, ypos: 0 }, 
            }, () => {
                this.dashrect = { drawingDetails:drawingDetails, startx: newoffx, starty: newoffy, x: newoffx, y:newoffy, width: totalwidth, height: totalheight, percentage: 0 };

                if(this.dashrectRef && this.dashrectRef.current){
                    this.dashrectRef.current.setAttribute('x', this.dashrect.x);
                    this.dashrectRef.current.setAttribute('y', this.dashrect.y);
                    this.dashrectRef.current.setAttribute('width', this.dashrect.width);
                    this.dashrectRef.current.setAttribute('height', this.dashrect.height);
                }

                this.drawNewRect(null, true);
            });
        }
    }

    //handle change left right field
    handleChangeLeftRightField = (changeside, redirectobj) => {
        //shows warning changes available when existing from current field
        this.props.notsaveConfirm((iscontinue) => {
            if(iscontinue && redirectobj){
                this.props.getFieldDetails(true, [redirectobj.id], changeside);
            }
        });
    }

    setPreviewGuid = (isReset, previewShelves, field, isMoveClear, isGuideOnly) => {
        let filedmapobj = this.props.saveObj;
        
        let ghostobj = { width: 0, height: 0 };

        if(isReset || isMoveClear){
            for (let i = 0; i < filedmapobj.fieldsList.length; i++) {
                const fieldobj = filedmapobj.fieldsList[i];
                
                for (let j = 0; j < fieldobj.planogramShelfDto.length; j++) {
                    const fieldshelf = fieldobj.planogramShelfDto[j];
                    
                    fieldshelf["previewguid"] = {startX:-1,EndX:-1};
                }
            }
            
            for (let l = 0; l < document.getElementsByClassName("sftrect-notdis").length; l++) {
                const element = document.getElementsByClassName("sftrect-notdis")[l];
                element.style.fill = 'transparent';
            }
            
            if(isMoveClear){
                this.setState({ isFirstTimeDrawguid: false, dropEffectingProds: [] });
            } else{
                this.setState({ isContentDragging: false, dropEffectingProds: [] });
                this.props.updateGhostViewObj(null);
            }

        } else if(field){
            let selectedfield = filedmapobj.fieldsList[field.key];
            
            let effectingProdList = [];
            for (let i = 0; i < selectedfield.planogramShelfDto.length; i++) {
                let shelfitem = selectedfield.planogramShelfDto[i];

                if(isReset){
                    shelfitem["previewguid"]={startX:-1,EndX:-1}
                }else{
                    let findshelffrompreview = previewShelves.findIndex(x => x.rank === shelfitem.rank);
        
                    if(findshelffrompreview > -1){
                        shelfitem = previewShelves[findshelffrompreview];
                        // console.log(shelfitem);

                        if(shelfitem.previewguid.startX > -1){
                            let gapbetweenguidelines = (shelfitem.previewguid.endX - shelfitem.previewguid.startX);

                            ghostobj.width = (gapbetweenguidelines > ghostobj.width?gapbetweenguidelines:ghostobj.width);
                            ghostobj.height += (shelfitem.drawHeight + shelfitem.drawGap);
                        }

                        if(!isGuideOnly){
                            //find shelf preview guide inside prods list
                            let checkstartx = shelfitem.previewguid.startX;
                            let checkendx = shelfitem.previewguid.endX;
    
                            let selblock = this.state.currentSelectedBlock;
                            let selblockprods = (selblock && selblock.drawingProducts?selblock.drawingProducts:[]);
                            // console.log(selblockprods);

                            for (let j = 0; j < shelfitem.planogramProduct.length; j++) {
                                const shelfprod = shelfitem.planogramProduct[j];
                                
                                for (let l = 0; l < shelfprod.productBlock.length; l++) {
                                    const prodblock = shelfprod.productBlock[l];
    
                                    for (let k = 0; k < prodblock.productLocations.length; k++) {
                                        const prodloc = prodblock.productLocations[k];
                                        
                                        let isnotignore = selblockprods.findIndex(selprod => selprod.id === prodloc.id);
    
                                        let checkprodx = (prodloc.x + this.state.saftyMargin);
                                        let checkprodx2 = ((prodloc.x + prodloc.drawWidth) - this.state.saftyMargin);
    
                                        if(isnotignore === -1){
                                            // console.log(prodloc.x +">="+ checkstartx, checkprodx2 +"<="+ checkendx);
                                        }
    
                                        if(isnotignore === -1 && 
                                            ((checkprodx >= checkstartx && checkprodx2 <= checkendx) || 
                                            (checkprodx < checkstartx && checkstartx < checkprodx2) || 
                                            (checkprodx < checkendx && checkendx < checkprodx2))){
                                                effectingProdList.push(prodloc);
                                        }
                                    }
                                }
                            }
                        }

                    } else{
                        shelfitem["previewguid"] = { startX: -1, EndX: -1 };
                    }
                }   
            }
            // console.log(effectingProdList);

            this.setState({ isFirstTimeDrawguid: true, dropEffectingProds: effectingProdList }, () => {
                this.props.updateGhostViewObj( (ghostobj.height > 0?ghostobj:this.props.ghostWrapperObj) );
            });
        }
        // console.log(filedmapobj);
        if(!this.props.showFullScreenEditView){
            this.props.updateConvertDetails(filedmapobj, false);
        }
    }

    updateProductList = (updateObj) => {
        // console.log(updateObj);
        this.setState({ isBlockMove: false, currentSelectedBlock: null }, () => {
            if(!this.props.showFullScreenEditView){
                this.props.updateConvertDetails(updateObj, true);
            }
        });
    }

    updateCutList = (cutshelfs) => {
        // console.log(cutshelfs);
        this.props.updateCutList(cutshelfs);
    }

    handleBlockContextMenu = (e, isshow, y, selectedprods) => {
        let editwrapper = document.body;
        // let normalize_pointer = this.getScreenPointer(e, 'mainsvg-view');
        // let reducescrolledgap = ((normalize_pointer.x - editwrapper.scrollLeft) + 60);

        // //reduce x if morethan body width
        // let cbodywidth = document.getElementById("maindraw-parent").clientWidth;
        // let totalcontextwidth = (reducescrolledgap + 65);

        // reducescrolledgap = (totalcontextwidth > cbodywidth?((reducescrolledgap - (totalcontextwidth - cbodywidth)) - 30):reducescrolledgap);

        let reduceXValue = (this.props.isRTL === "rtl"?(0 - (e.clientX - 100)):((e.clientX + 100) - editwrapper.clientWidth));
        let xreducevalue = (reduceXValue > 0?(this.props.isRTL === "rtl"?reduceXValue:(reduceXValue * -1)):0);
        
        let cobj = {xpos: ((e.clientX - 80)+xreducevalue), ypos: (e.clientY - 60)};
      
        //block context menu display
        this.setState({ isViewBlockContext: isshow, blockcontxt: cobj });
    }

    confirmingDeleteSelecteBlock = () => {
        this.handleSelectedBlockDelete();
    }
    //
    handleSelectedBlockDelete = () => {
        this.props.fieldHistoryAdd(structuredClone(this.props.saveObj),2);

        let csaveobj = this.props.saveObj;
        let selectedblock = structuredClone(this.state.currentSelectedBlock);
        
        let selectedfield = csaveobj.fieldsList[selectedblock.fieldidx];

        let selcutlist = [];
        for (let i = 0; i < selectedblock.selectedShelves.length; i++) {
            const shelfobj = selectedblock.selectedShelves[i];
            shelfobj.iscopy = false;

            selcutlist.push({ rank: shelfobj.rank, iscopy: false, prods: shelfobj.selectedProducts });
        }
        
        let newchangeprods = [];
        for (let s = 0; s < selectedblock.drawingProducts.length; s++) {
            const selectedproditem = selectedblock.drawingProducts[s];
            
            let prodshelf = selectedfield.planogramShelfDto[selectedproditem.shelfidx];
            let proddetails = prodshelf.planogramProduct[selectedproditem.prodidx];

            let prodloc = proddetails.productBlock[selectedproditem.blockidx].productLocations[selectedproditem.locidx];
            prodloc["isDelete"] = true;

            if(prodloc.overLappingDto){
                if(!prodloc.overLappingDto.isNew){
                    prodloc.overLappingDto["isDelete"] = true;

                    let changerightfield = csaveobj.fieldsList.findIndex(x => x.id === selectedfield.rightSidePlanogramFieldDto.id);
                    let changerightshelf = (changerightfield > -1?csaveobj.fieldsList[changerightfield].planogramShelfDto.findIndex(x => x.id === prodloc.overLappingDto.shelfId):-1);
    
                    if(changerightshelf > -1){
                      let rightoverlaplist = csaveobj.fieldsList[changerightfield].planogramShelfDto[changerightshelf].overLappingDto;
                      let findalreadyrightadded = rightoverlaplist.findIndex(x => x.id === prodloc.overLappingDto.id && !x.isDelete);
    
                      if(findalreadyrightadded > -1){
                        if(rightoverlaplist[findalreadyrightadded].isNew){
                          rightoverlaplist.splice(findalreadyrightadded, 1);
                        } else{
                          rightoverlaplist[findalreadyrightadded].isDelete = true;
                        }
                      }
                    }
                } else{
                    prodloc.overLappingDto = null;
                }
            }

            if(prodloc.isbottom){
                let isaddedtochanges = newchangeprods.findIndex(x => x.type === "QTY_REMOVE" && x.product.id === proddetails.productInfo.id);

                if(isaddedtochanges === -1){
                  let newrdobj = {type:"QTY_REMOVE", loclist: [prodloc], product: proddetails.productInfo, fieldidx: selectedproditem.fieldidx, shelve: selectedproditem.shelfidx, prodobj: proddetails, locobj: null, changeqty: 1};
                  newchangeprods.push(newrdobj);
                } else{
                  newchangeprods[isaddedtochanges].changeqty = (newchangeprods[isaddedtochanges].changeqty + 1);
                  newchangeprods[isaddedtochanges].loclist.push(prodloc);
                }
            }
        }
        // console.log(newchangeprods);
        this.props.updateCutList(selcutlist);
        
        this.setState({ 
            currentSelectedBlock: null, 
            isViewBlockContext: false, blockcontxt: { xpos: 0, ypos: 0 }, 
        }, () => {

            if(!this.props.showFullScreenEditView){
                this.props.handleRDChanges(newchangeprods);
                this.props.updateConvertDetails(csaveobj, true);
            }
        });
    }
    //cut block
    handleBlockCut = (iscopy) => {
        this.props.fieldHistoryAdd(structuredClone(this.props.saveObj),2);

        let csaveobj = this.props.saveObj;
        let selectedblock = this.state.currentSelectedBlock;
        // console.log(selectedblock);

        let selectedfield = csaveobj.fieldsList[selectedblock.fieldidx];

        let selcutlist = [];
        let newchangeprods = [];
        for (let s = 0; s < selectedblock.selectedShelves.length; s++) {
            const shlfitem = selectedblock.selectedShelves[s];
            selcutlist.push({ rank: shlfitem.rank, iscopy: iscopy, prods: shlfitem.selectedProducts });

            if(!iscopy){
                for (let j = 0; j < shlfitem.selectedProducts.length; j++) {
                    const selectedproditem = shlfitem.selectedProducts[j];
                    
                    let prodshelf = selectedfield.planogramShelfDto[selectedproditem.shelfidx];
                    let proddetails = prodshelf.planogramProduct[selectedproditem.prodidx];

                    let prodloc = proddetails.productBlock[selectedproditem.blockidx].productLocations[selectedproditem.locidx];
                    prodloc["isDelete"] = true;

                    if(prodloc.overLappingDto){
                        if(!prodloc.overLappingDto.isNew){
                            prodloc.overLappingDto["isDelete"] = true;

                            let changerightfield = csaveobj.fieldsList.findIndex(x => x.id === selectedfield.rightSidePlanogramFieldDto.id);
                            let changerightshelf = (changerightfield > -1?csaveobj.fieldsList[changerightfield].planogramShelfDto.findIndex(x => x.id === prodloc.overLappingDto.shelfId):-1);
            
                            if(changerightshelf > -1){
                              let rightoverlaplist = csaveobj.fieldsList[changerightfield].planogramShelfDto[changerightshelf].overLappingDto;
                              let findalreadyrightadded = rightoverlaplist.findIndex(x => x.id === prodloc.overLappingDto.id && !x.isDelete);
            
                              if(findalreadyrightadded > -1){
                                if(rightoverlaplist[findalreadyrightadded].isNew){
                                  rightoverlaplist.splice(findalreadyrightadded, 1);
                                } else{
                                  rightoverlaplist[findalreadyrightadded].isDelete = true;
                                }
                              }
                            }
                        } else{
                            prodloc.overLappingDto = null;
                        }
                    }

                    if(prodloc.isbottom){
                        let isaddedtochanges = newchangeprods.findIndex(x => x.type === "QTY_REMOVE" && x.product.id === proddetails.productInfo.id);
        
                        if(isaddedtochanges === -1){
                          let newrdobj = {type:"QTY_REMOVE", loclist: [prodloc], product: proddetails.productInfo, fieldidx: selectedproditem.fieldidx, shelve: selectedproditem.shelfidx, prodobj: proddetails, locobj: null, changeqty: 1};
                          newchangeprods.push(newrdobj);
                        } else{
                          newchangeprods[isaddedtochanges].changeqty = (newchangeprods[isaddedtochanges].changeqty + 1);
                          newchangeprods[isaddedtochanges].loclist.push(prodloc);
                        }
                    }
                }
            }
        }

        this.props.updateCutList(selcutlist);
        this.setState({ 
            currentSelectedBlock: null, 
            isViewBlockContext: false, blockcontxt: { xpos: 0, ypos: 0 }
        }, () => {
            if(!this.props.showFullScreenEditView){
                this.props.handleRDChanges(newchangeprods);
                this.props.updateConvertDetails(csaveobj, true);
            }
        });
    }

    //trigger on product drag stops
    dragEnd = (e, shelfObj, shelfRef, isinsidemove, moveobj, isdrop, selectedShelfidx, fieldobj) => {
        if(this.props.currentDraggableProd){
            
            if(findBrowserType() === "firefox"){
                this.props.getPageXYCords(e);
            }
               
            let viewboxcoords = (!isinsidemove && !moveobj)?this.getScreenPointer(e, 'mainsvg-view'):null;
            let draggingProduct = this.props.currentDraggableProd; //get draging product
            // console.log(draggingProduct);

            //set pruduct paste x,y locations
            let xa = 0;
            let ya = 0;
            let Cwidth = 0;
            let Cheight = 0;

            if(moveobj){
                xa = e.x;
                ya = (shelfObj.y + shelfObj.drawHeight)-(moveobj.drawHeight+ this.state.checkSaftyMargin);
                Cwidth=moveobj.drawWidth;
                Cheight=moveobj.drawHeight;
            } else if(isinsidemove){
                xa = e.x;
                ya = (shelfObj.y + shelfObj.drawHeight)-(this.state.selectedlocobj.drawHeight+ this.state.checkSaftyMargin);
                Cwidth=this.state.selectedlocobj.drawWidth;
                Cheight=this.state.selectedlocobj.drawHeight;
            } else{
                if(!draggingProduct.isSingleCut && draggingProduct.mode){
                    Cwidth = draggingProduct.width;
                    Cheight = draggingProduct.height;
                } else{
                    Cwidth = measureConverter(draggingProduct.uom,this.state.displayUOM,draggingProduct.width) * this.state.displayRatio;
                    Cheight = measureConverter(draggingProduct.uom,this.state.displayUOM,draggingProduct.height) * this.state.displayRatio;
                }
                
                xa = viewboxcoords.x;
                ya = (shelfObj.y + shelfObj.drawHeight) - (Cheight + this.state.checkSaftyMargin); //get bottom y point
            }

            draggingProduct.drawHeight = Cheight;
            draggingProduct.drawWidth = Cwidth;
            draggingProduct["x"] = xa;
            draggingProduct["y"] = ya;
            // console.log(draggingProduct);
            
            if(!isinsidemove){
                e.stopPropagation();
                e.preventDefault();
            }
            
            if(xa !== this._dropposition.startX && (xa + Cwidth) !== this._dropposition.endX){
                //show drop guidelines of shelf
                if(this._guideTimeout){ 
                    clearTimeout(this._guideTimeout); 
                    
                    if(this.state.isFirstTimeDrawguid){
                        this.setPreviewGuid(false, null, null, true);
                    }
                }
                
                this._guideTimeout = setTimeout(() => {
                    //get drop x with snap check
                    xa = getSnappingLocation(xa, fieldobj, draggingProduct, [shelfObj]);

                    if(draggingProduct.mode){
                        //current selected field
                        let selectingField = (fieldobj?fieldobj:null);
    
                        //if it's clipboard shelf drop
                        if(!draggingProduct.isSingleCut && draggingProduct.mode){

                            let previewShelves = [];
                            for (let i = 0; i < draggingProduct.shelf.length; i++) {
                                const shelfcutobj = draggingProduct.shelf[i];
                                
                                if(i > 0 && fieldobj.planogramShelfDto[selectedShelfidx - i]){
                                    let dropshelf = fieldobj.planogramShelfDto[selectedShelfidx - i];
    
                                    dropshelf.previewguid = {startX: xa, endX: (xa + shelfcutobj.width)};
                                    previewShelves.push(dropshelf);
                                } else if(i === 0){
                                    let dropshelf = fieldobj.planogramShelfDto[selectedShelfidx];
    
                                    dropshelf.previewguid = {startX: xa, endX: (xa + shelfcutobj.width)};
                                    previewShelves.push(dropshelf);
                                }
                            }
    
                            if(selectingField){
                                selectingField["key"] = shelfObj.field_custom_id;
                                this.setPreviewGuid(false, previewShelves, selectingField, false);
                            }
    
                        } else{
                            shelfObj.previewguid = {startX: xa, endX: (xa + Cwidth)};
                            let previewShelves = [shelfObj];
                            
                            if(selectingField){
                                selectingField["key"] = shelfObj.field_custom_id;
                                this.setPreviewGuid(false, previewShelves, selectingField, false, (draggingProduct.isSingleCut === true?false:true));
                            }
                        }
                    } else{
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
                        if(allowToAdd){
                            //product drop field
                            let filedmapobj = this.props.saveObj;
                            let dropfieldidx = filedmapobj.fieldsList.findIndex(x => x.id === fieldobj.id);
                            let dropfield = filedmapobj.fieldsList[dropfieldidx];
                            dropfield.key = dropfieldidx;
                            
                            //product drop shelf
                            let shelfobj = shelfObj;
                            shelfobj.previewguid = {startX: xa, endX: (xa + Cwidth)};
        
                            this.setPreviewGuid(false, [shelfobj], dropfield, false, true);
                        }
                    }
                }, 300);  
            }
            
            this._dropposition = {startX: xa, endX: (xa + Cwidth)};
            
            //scroll parent with drag
            this.scrollParentWithDrag(draggingProduct);

        } else{
            // for (let l = 0; l < document.getElementsByClassName("sftrect-notdis").length; l++) {
            //     const element = document.getElementsByClassName("sftrect-notdis")[l];
            //     element.style.fill = 'transparent';
            // }

            if(this.state.isFirstTimeDrawguid){
                this.setPreviewGuid(false, null, null, true);
            }
        }
        
    }
    //clear drag out - removes green fill in shelves when can drop products to shelve(y edit)
    dragClear = (e, shelfObj, shelfRef) => {
        if(this._dragcleartout){ clearTimeout(this._dragcleartout); }

        this._dragcleartout = setTimeout(() => {
            this._dropposition = {startX: 0, endX: 0};
            this.setPreviewGuid(false,null,null,true);
        }, 300);
    }
    //triggers on drop product to shelve
    droppedNew = (e, shelfObj, shelfRef, shelfIdx, isxpand, fieldobj, fieldidx) => {
        //fixes firefox image dragging issue
        e.preventDefault();
        
        if(this.props.currentDraggableProd.mode){
            this.dropCutblock(e, shelfObj, shelfRef, shelfIdx, this.props.currentDraggableProd, fieldobj, fieldidx);
        }else{
            this.dropproduct(e, shelfObj, shelfRef, shelfIdx, isxpand, fieldobj, fieldidx);
        }

        this.setState({ isContentDragging: false });

        this.props.prodDragEnd();
        // removeGhostImage();
   }
   //
   dropCutblock = (e, shelfObj, shelfRef, shelfIdx, cutobj, cfieldobj, fieldidx) => {
        let viewboxcoords = this.getScreenPointer(e, 'mainsvg-view'); //get drop location in svg
        
        let xa = viewboxcoords.x; //set drop position x
        let cutidx = cutobj.cutidx;
        // console.log(cutobj);
        
        //check dragging product available and allowed to add
        if (cutobj && cutobj != null) { // && allowToAdd
            this.setState({ isviewcmenu: false, isviewcmenu2: false });

            let isContinueSave = false;
            let cutshelfs = [];
            let clipboarLeftShelfs = [];
            let newchangeprods = [];

            let csaveobj = structuredClone(this.props.saveObj);
            let fieldobj = csaveobj.fieldsList[fieldidx];

            //loop dropping shelf list
            for (let k = 0; k < cutobj.shelf.length; k++) {
                const cutshelf = cutobj.shelf[k];

                //set width height as drawing width heights for common function checks
                cutshelf.drawHeight = cutshelf.height;
                cutshelf.drawWidth = cutshelf.width;
    
                //check drop shelf available
                let dropshelf = null;

                let checkShelfIdx = (k === 0?shelfIdx:(shelfIdx - k));
                if(k > 0 && fieldobj.planogramShelfDto[shelfIdx - k]){
                    dropshelf = fieldobj.planogramShelfDto[shelfIdx - k];
                } else if(k === 0){
                    dropshelf = fieldobj.planogramShelfDto[shelfIdx]
                }

                if(dropshelf){
                    //set product y position
                    var newy = (dropshelf.y + dropshelf.drawHeight) - cutshelf.drawHeight; //get bottom y point
                    
                    //find is product can added to bottom of shelve
                    cutshelf["x"] = roundOffDecimal(xa,2);
                    cutshelf["y"] = roundOffDecimal(newy,2);
        
                    //check shelf is allow to drop
                    var allowToAddBottom = checkAllowToAdd(e, dropshelf, cutshelf, xa, newy, this.state.checkSaftyMargin);
                    // console.log(allowToAddBottom);
                    
                    //if cannot add to shelf and is inside shelf and overlapping from right side
                    let checkshelfy2 = (dropshelf.y + dropshelf.drawHeight + dropshelf.drawGap);
                    let checkshelfx2 = (dropshelf.x + dropshelf.drawWidth);

                    if(!allowToAddBottom.allowToAdd && dropshelf.y <= newy && (newy + cutshelf.drawHeight) <= checkshelfy2 && xa < checkshelfx2 && (xa + cutshelf.drawWidth) > checkshelfx2){
                        allowToAddBottom = { allowToAdd: true, shelfAllow: true };
                        xa = (checkshelfx2 - cutshelf.drawWidth);
                    }

                    if(allowToAddBottom.allowToAdd) {
                        isContinueSave = true;

                        let startXpoint = 0;
                        let lowestprodx = getSnappingLocation(xa, fieldobj, cutshelf, [dropshelf]);
                        
                        //find product is overlapping other product
                        let boxx1 = roundOffDecimal(lowestprodx,2);
                        let boxy1 = roundOffDecimal(newy,2);
                        let boxx2 = roundOffDecimal((lowestprodx + cutshelf.width),2);
                        let boxy2 = roundOffDecimal((newy + cutshelf.height),2);
        
                        //find remove drop items from list
                        let containProds = GetContainingProdsByBox(boxx1, boxy1, boxx2, boxy2, fieldobj, fieldidx);
                        // console.log(containProds);
                        
                        if(containProds.selectedProds && containProds.selectedProds.length > 0){
                            let notDeletedContainProds = containProds.selectedProds.filter(f => !f.isDelete);
                            
                            for (let j = 0; j < notDeletedContainProds.length; j++) {
                                const selcutitem = notDeletedContainProds[j];
                                
                                var ishaveinSlectedshleves = cutshelf.products.find(x=>x.id === selcutitem.id);
                                //check save moving produtcs not cutting
                                if(!ishaveinSlectedshleves){
                                    //set lowest x point from available remove product list
                                    if(lowestprodx > selcutitem.x){
                                        lowestprodx = selcutitem.x;
                                    }
                                }
                            }
                        }
        
                        let cfieldobj = csaveobj.fieldsList[fieldidx];
                        let cshelfobj = cfieldobj.planogramShelfDto[checkShelfIdx];
                        let newshelfproducts = cshelfobj.planogramProduct;

                        let maxEndX = 0;
                        startXpoint = lowestprodx;
                        
                        let lowyprodlist = cutshelf.products.sort((a, b) => b.startingYPoint - a.startingYPoint);
                        let highestprody = (lowyprodlist[0].startingYPoint + lowyprodlist[0].drawHeight);
                        let lowprody = ((dropshelf.y + dropshelf.drawHeight) - highestprody);
                        
                        for (let j = 0; j < cutshelf.products.length; j++) {
                            const cutprod = cutshelf.products[j];
        
                            startXpoint = (lowestprodx + cutprod.startingXPoint);
        
                            cutprod.id = cutprod.productId;
                            cutprod.id = uuidv4();
                            cutprod.x = startXpoint;
                            cutprod.y = (lowprody + cutprod.startingYPoint);
                            cutprod.isNew = true;
                            cutprod.isDelete = false;
        
                            let curprodendx = (cutprod.startingXPoint + cutprod.drawWidth);
                            if(curprodendx > maxEndX){
                                maxEndX = curprodendx;
                            }
                        }
        
                        if(containProds.selectedProds && containProds.selectedProds.length > 0){
                            let notDeletedContainProds = containProds.selectedProds.filter(f => !f.isDelete);
                            // console.log(containProds.selectedProds, cutshelf);

                            for (let j = 0; j < notDeletedContainProds.length; j++) {
                                const selcutitem = notDeletedContainProds[j];
                                
                                let findshelfitemidx = cutshelfs.findIndex(x => x.rank === selcutitem.shelfrank);
                                
                                if(findshelfitemidx > -1){
                                    cutshelfs[findshelfitemidx].prods.push(selcutitem);
                                } else{
                                    cutshelfs.push({ rank: selcutitem.shelfrank, iscopy: false, prods: [selcutitem] });
                                }
        
                                let proddetails = newshelfproducts[selcutitem.prodidx];
                                let prodlocobj = proddetails.productBlock[selcutitem.blockidx].productLocations[selcutitem.locidx];
                                prodlocobj["isDelete"] = true;
        
                                if(prodlocobj.isbottom){
                                    let isaddedtochanges = newchangeprods.findIndex(x => x.type === "QTY_REMOVE" && x.product.id === proddetails.productInfo.id);
          
                                    if(isaddedtochanges === -1){
                                      let newrdobj = {type:"QTY_REMOVE", loclist: [prodlocobj], product: proddetails.productInfo, fieldidx: selcutitem.fieldidx, shelve: selcutitem.shelfidx, prodobj: proddetails, locobj: null, changeqty: 1};
                                      newchangeprods.push(newrdobj);
                                    } else{
                                      newchangeprods[isaddedtochanges].changeqty = (newchangeprods[isaddedtochanges].changeqty + 1);
                                      newchangeprods[isaddedtochanges].loclist.push(prodlocobj);
                                    }
                                }
                            }
                        }
                        
                        for (let j = 0; j < cutshelf.products.length; j++) {
                            const changeproditem = cutshelf.products[j];
                            changeproditem.id = changeproditem.productId;
                            // changeproditem.productName = changeproditem.name;

                            var allowbottom = checkProductIsInBottom(cshelfobj.y,cshelfobj.drawHeight,changeproditem.y,changeproditem.drawHeight);
                            changeproditem.isbottom = allowbottom;

                            let newprodlocobj = {
                                id: uuidv4(),
                                x: changeproditem.x,
                                y: changeproditem.y,
                                uom: this.state.displayUOM,
                                isDelete: false,
                                isNew: true,
                                f_uuid: uuidv4(),
                                productDepth: changeproditem.depth,
                                productHeight: changeproditem.height,
                                productRotation: "default",
                                productWidth: changeproditem.width,
                                productUom: changeproditem.uom,
                                drawWidth: changeproditem.drawWidth,
                                drawHeight: changeproditem.drawHeight,
                                isRightSideOverLap: false,
                                isbottom: allowbottom,
                                uuid: uuidv4(),
                            };
    
                            
                            let blockid = uuidv4();
                            let newprodblock = {
                                id: blockid,
                                oldid: blockid,
                                isDelete: false,
                                isNew: true,
                                productLocations: [newprodlocobj]
                            };
        
                            //find block available for selected product
                            let addedProdObj = null;
                            let isproductadded = newshelfproducts.findIndex(proditem => (!proditem.isDelete && proditem.productInfo.id === changeproditem.productId));
                            if(isproductadded > -1){
                                let foundprodobj = newshelfproducts[isproductadded];
                                foundprodobj.productBlock.push(newprodblock);
    
                                addedProdObj = foundprodobj;
                            } else{
                                let newprodobj = {
                                    id: uuidv4(),
                                    f_uuid: uuidv4(),
                                    productWidth: changeproditem.width, 
                                    productHeight: changeproditem.height, 
                                    productPadding: 0, 
                                    productDepth: changeproditem.depth, 
                                    productUom: changeproditem.uom,
                                    brandLevel: { 
                                        brandId: changeproditem.brandId,
                                        brandName: changeproditem.brandName,
                                        color: changeproditem.brandColor
                                    },
                                    categoryLevel: {
                                        categoryId: changeproditem.categoryId,
                                        categoryName: changeproditem.categoryName,
                                        color: changeproditem.categoryColor,
                                        isRule: false,
                                        ruleType: null
                                    },
                                    subcategoryLevel: {
                                        subcategoryId: changeproditem.subCategoryId,
                                        subcategoryName: changeproditem.subCategoryName,
                                        color: changeproditem.subCategoryColor,
                                        isRule: false,
                                        ruleType: null
                                    },
                                    productInfo: changeproditem,
                                    isNew: true, isDelete: false,
                                    productBlock: [newprodblock]
                                };
                                
                                newshelfproducts.push(newprodobj);
    
                                addedProdObj = newprodobj;
                            }
        
                            //add to change
                            if(changeproditem.isbottom){
                                let isaddedtochanges = newchangeprods.findIndex(x => x.type === "QTY_ADD" && x.product.id === changeproditem.productId);
        
                                if(isaddedtochanges === -1){
                                    let newrdobj = {type:"QTY_ADD", loclist: [newprodlocobj], product: addedProdObj.productInfo, fieldidx: fieldidx, shelve: checkShelfIdx, prodobj: addedProdObj, locobj: null, changeqty: 1};
                                    newchangeprods.push(newrdobj);
                                } else{
                                    newchangeprods[isaddedtochanges].changeqty = (newchangeprods[isaddedtochanges].changeqty + 1);
                                    newchangeprods[isaddedtochanges].loclist.push(newprodlocobj);
                                } 
                            }
                              
                        }
                        
                        // console.log(newshelfproducts);

                    } else { 
                        clipboarLeftShelfs.push(cutshelf);
                    }

                } else{
                    clipboarLeftShelfs.push(cutshelf);
                }
            }

            if(isContinueSave){
                this.props.fieldHistoryAdd(structuredClone(this.props.saveObj),1);

                //check if shelf that cannot drop available
                //if available in clipboard left available ones and remove drop ones
                var newCutarray = this.props.clipBoardList;
                if(clipboarLeftShelfs.length > 0){
                    let parentCutObj = newCutarray.clipboardData[cutobj.deptidx].clipboardData[cutidx];
                    
                    let newshelfs = [];
                    for (let i = 0; i < parentCutObj.shelf.length; i++) {
                        const clipshelf = parentCutObj.shelf[i];
                        let isleftshelf = clipboarLeftShelfs.findIndex(l => l.shelfRank === clipshelf.shelfRank);
    
                        if(isleftshelf > -1){
                            newshelfs.push(clipshelf);
                        } else{
                            if(clipshelf.isDelete){
                                clipshelf.isDelete = true;
                                newshelfs.push(clipshelf);
                            }
                        }
                    }
    
                    parentCutObj.shelf = newshelfs;
    
                } else{
                    if(!cutobj.isSingleCut){
                        if(!newCutarray.clipboardData[cutobj.deptidx].clipboardData[cutidx].isNew){
                            newCutarray.clipboardData[cutobj.deptidx].clipboardData[cutidx].isDelete = true;
                        } else{
                            newCutarray.clipboardData[cutobj.deptidx].clipboardData.splice(cutidx,1);
                        }
                    }
                }
    
                // console.log(cutshelfs);
                this.props.updateCutList(cutshelfs);
    
                this.setState({ currentSelectedBlock: null, currentInternalDraggableProd: null }, () => {
                    if(!this.props.showFullScreenEditView){
                        // console.log(newchangeprods);
                        this.props.handleRDChanges(newchangeprods);
                        this.props.updateConvertDetails(csaveobj, true);
                    }
    
                    if(cutobj.isSingleCut){
                        this.props.updateSingleCutProduct(cutobj.shelf[0].products[0]); 
                    }
                });
            }

            setTimeout(() => {
                this.setPreviewGuid(true);
            }, 500);
        }
    }

   dropproduct = (e, shelfObj, shelfRef, shelfIdx, isxpand, fieldobj, fieldidx) => {
        e.preventDefault(); //fixes firefox image dragging issue

        let spdobj = this.props.saveObj; //get current saveobj

        //get mouse drop x
        let viewboxcoords = this.getScreenPointer(e, 'mainsvg-view');
        let xa = viewboxcoords.x;

        //if shelf overlapping available add that
        if(shelfObj.overLappingDto && shelfObj.overLappingDto.length > 0){
            let sortOverlapList = shelfObj.overLappingDto.sort((a, b) => b.x - a.x);
            let firstXProd = roundOffDecimal((sortOverlapList[0].x + sortOverlapList[0].drawWidth),2);

            if(fieldobj.startX <= xa && firstXProd >= xa){
                xa = firstXProd;
            }
        }

        let draggingProduct = this.props.currentDraggableProd; //get current dragging product
        
        //check dragging product available
        if (draggingProduct === undefined || draggingProduct === null) {
            alertService.warn(this.props.t('PRODUCT_NOT_SELECTED'))
            return false;
        }

        //check product dimentions available to drop
        // if(!this.validateProdDetails(draggingProduct)){
        //     alertService.warn(this.props.t('PROD_DIMENTIONS_NOTAVAILABLE'));
        //     return false;
        // } else if(!draggingProduct.imageUrl || draggingProduct.imageUrl === ""){
        //     alertService.warn(this.props.t('PROD_IMAGE_NOTFOUND'));
        //     return false;
        // }

        if(!draggingProduct.isSingleCut){
            //checking drop validation
            var validateList = validateHeirarchyMissings(draggingProduct);
            
            if(validateList.length > 0){
                this.props.cannotDropWarningHandle(true, validateList, draggingProduct);
    
                return false;
            }
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

            if(draggingProduct.isSingleCut){
                draggingProduct["id"] = draggingProduct.productId;
                draggingProduct["productName"] = draggingProduct.name;
            }

            //set product y position
            let productDrawHeight = roundOffDecimal((measureConverter(draggingProduct.uom, this.state.displayUOM, draggingProduct.rotateheight) * this.state.displayRatio),10);
            let newy = roundOffDecimal(((shelfObj.y + shelfObj.drawHeight) - productDrawHeight),10); //get bottom y point
            
            //find is product can added to bottom of shelve
            var allowToAddBottom = this.checkAllowToAdd(e, shelfObj, shelfRef, draggingProduct, xa, newy, this.state.displayRatio);
            
            //is it allow to drop to bottom of shelve
            draggingProduct["isNew"] = true;
            draggingProduct["isDelete"] = false;
            //create object to set as selected product after product add
            var cdrgprod = { fieldidx: fieldidx, shelveidx: shelfIdx, prodidx: 0, blockidx: 0, locidx: 0, prod: null};
            //if product can add to bottom of shelve
            if (allowToAddBottom) {
                //find product in recent added list
                this.props.updateRecentAddedList(draggingProduct, fieldobj.id);

                //set history object before change current field details
                this.props.fieldHistoryAdd(JSON.parse(JSON.stringify(this.props.saveObj)),1);
                //get current shelve products list
                let selectedShelf = spdobj.fieldsList[fieldidx].planogramShelfDto[shelfIdx];
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
                let shelveCheck = this.checkOnShelfBox(xa, newy, xb3, yb3, shelfObj, dpwidth2, dpheight2, fieldobj);

                let cprodheight = measureConverter(draggingProduct.uom,this.state.displayUOM,draggingProduct.rotateheight) * this.state.displayRatio;
                let newprodcount = (this.state.isStackableEnabled && draggingProduct.isStackable?Math.floor((roundOffDecimal(selectedShelf.drawHeight,10) / roundOffDecimal(cprodheight,10))):1);
                
                let newprodlist = [];
                let newlocy = newy;
                for (let l = 0; l < newprodcount; l++) {
                    //define overlap object
                    let overlaplocobj = null; 
                    if(shelveCheck.isOverlap){
                        overlaplocobj = {
                            shelfId: shelfObj.leftPlanogramShelfId, 
                            id: uuidv4(),
                            crossingWidth: shelveCheck.overlapX,
                            productWidth: draggingProduct.rotatewidth, 
                            productHeight: draggingProduct.rotateheight, 
                            productDepth: draggingProduct.rotatedepth,
                            productRotation: draggingProduct.rotatetype,
                            productUom: draggingProduct.uom,
                            drawWidth: measureConverter(draggingProduct.uom,this.state.displayUOM,draggingProduct.rotatewidth) * this.state.displayRatio,
                            drawHeight: cprodheight,
                            qty: 1, 
                            sideType: "Left", 
                            fieldUom: this.state.displayUOM,
                            x: Math.abs(shelveCheck.overlapX) * -1, 
                            y: newlocy, 
                            isNew: true, 
                            isDelete: false
                        };
                    }
                    //define location object
                    let plocobj = {id:uuidv4(), f_uuid: uuidv4(), x: xa, y: newlocy,
                        productWidth: draggingProduct.rotatewidth, 
                        productHeight: draggingProduct.rotateheight, 
                        productDepth: draggingProduct.rotatedepth,
                        productRotation: draggingProduct.rotatetype,
                        drawWidth: measureConverter(draggingProduct.uom,this.state.displayUOM,draggingProduct.rotatewidth) * this.state.displayRatio,
                        drawHeight: cprodheight,
                        isRightSideOverLap: shelveCheck.isOverlap, 
                        productUom: draggingProduct.uom, 
                        isbottom: (l === 0?true:false), //bottom one
                        uom: this.state.displayUOM,
                        isNew: true, 
                        isDelete: false,
                        overLappingDto: overlaplocobj,
                    };  
                    
                    newprodlist.push(plocobj);

                    newlocy = (newlocy - cprodheight);
                }

                //if product already added to shelve
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
                        let newrdobj = [{type:"QTY_ADD", loclist: [cblockprods[blockfound].productLocations[cdrgprod.locidx]], product: draggingProduct, fieldidx: fieldidx, shelve: shelfIdx, prodobj: addedProds[prodfound], locobj: null, changeqty: 1}];
                        this.props.handleRDChanges(newrdobj);
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
                        var newrdobj = [{type:"ADD_NEW_BLOCK", loclist: [newprodlist[0]], product: draggingProduct, fieldidx: fieldidx, shelve: shelfIdx, prodobj: addedProds[prodfound], locobj: null, changeqty: 1}];
                        this.props.handleRDChanges(newrdobj);
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
                        brandLevel: { 
                            brandId: draggingProduct.brandId,
                            brandName: draggingProduct.brandName,
                            color: draggingProduct.brandColor
                        },
                        categoryLevel: {
                            categoryId: draggingProduct.categoryId,
                            categoryName: draggingProduct.categoryName,
                            color: draggingProduct.categoryColor,
                            isRule: false,
                            ruleType: null
                        },
                        subcategoryLevel: {
                            subcategoryId: draggingProduct.subCategoryId,
                            subcategoryName: draggingProduct.subCategoryName,
                            color: draggingProduct.subCategoryColor,
                            isRule: false,
                            ruleType: null
                        },
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
                    let newrdobj = [{type:"ADD_NEW_BLOCK", loclist: [newprodlist[0]], product: draggingProduct, fieldidx: fieldidx, shelve: shelfIdx, prodobj: data_obj, locobj: null, changeqty: 1}];
                    this.props.handleRDChanges(newrdobj);
                }
                
                let updateshelf = spdobj.fieldsList[fieldidx].planogramShelfDto[shelfIdx];
                updateshelf.planogramProduct = addedProds;
                updateshelf.previewguid = { startX: 0, endX: 0};
                
                this.setState({ 
                    isenablefieldedit: false, 
                    alloweditoverflwmargin: false, 
                    isselectprodblock: false, 
                    isBlockMove: false, currentSelectedBlock: null,
                    currentInternalDraggableProd: cdrgprod, 
                    isViewContextmenu: false, contxtMenu: {isexpand: true},
                    selectedlocobj: null,
                    dropEffectingProds: [],
                }, () => {
                    // this.checkEnableFieldEdit();
                    this.props.addItemstoWarning(draggingProduct); //add to warning list if already using in other departments
                    if(!this.props.showFullScreenEditView){
                        this.props.updateConvertDetails(spdobj, true);
                    }

                    if(draggingProduct.isSingleCut){
                        this.props.updateSingleCutProduct(draggingProduct);
                    }
                });

            } else { //else find nearest bottom
                var xa1 = (xa - this.state.checkSaftyMargin);
                var ya1 = (shelfObj.y - this.state.checkSaftyMargin);
                var xb1 = (xa + (measureConverter(draggingProduct.uom,this.state.displayUOM,draggingProduct.width) * this.state.displayRatio) + this.state.checkSaftyMargin);
                var yb1 = ((shelfObj.y + shelfObj.drawHeight) + this.state.checkSaftyMargin);

                let selectedShelf = spdobj.fieldsList[fieldidx].planogramShelfDto[shelfIdx];
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
                    //convert product x,y,width,height to field ratio
                    var dpwidth = (measureConverter(draggingProduct.uom,this.state.displayUOM,draggingProduct.rotatewidth) * this.state.displayRatio);
                    var dpheight = (measureConverter(draggingProduct.uom,this.state.displayUOM,draggingProduct.rotateheight) * this.state.displayRatio);
                    
                    xa1 = highestObj.x;
                    ya1 = roundOffDecimal((highestObj.y - dpheight),10); //highest object y - current drop product height gets current product y
                    xb1 = (xa1 + dpwidth);
                    yb1 = roundOffDecimal(highestObj.y,10);

                    //run shelf allow again to check setted values are inside shelve
                    let shelveCheck = this.checkOnShelfBox(xa1, ya1, xb1, yb1, shelfObj, dpwidth, dpheight, fieldobj); //check allow to add shelve
                    // console.log(shelveCheck);

                    //if product can add inside shelve
                    if(shelveCheck.boxAllow){
                        //find product in recent added list
                        this.props.updateRecentAddedList(draggingProduct, fieldobj.id);

                        //set histoty object
                        this.props.fieldHistoryAdd(structuredClone(this.props.saveObj),1);

                        let cprodheight = measureConverter(draggingProduct.uom,this.state.displayUOM,draggingProduct.rotateheight) * this.state.displayRatio;
                        let newprodcount = (this.state.isStackableEnabled && draggingProduct.isStackable?Math.floor((roundOffDecimal((highestObj.y - selectedShelf.y),10) / roundOffDecimal(cprodheight,10))):1);
                        
                        let newprodlist = [];
                        let newlocy = ya1;
                        for (let l = 0; l < newprodcount; l++) {
                            //define overlap object
                            let overlaplocobj = null;
                            if(shelveCheck.isOverlap){
                                overlaplocobj = {
                                    shelfId: shelfObj.leftPlanogramShelfId, 
                                    id: uuidv4(),
                                    crossingWidth: shelveCheck.overlapX,
                                    productWidth: draggingProduct.rotatewidth, 
                                    productHeight: draggingProduct.rotateheight, 
                                    productDepth: draggingProduct.rotatedepth,
                                    productRotation: draggingProduct.rotatetype,
                                    productUom: draggingProduct.uom,
                                    drawWidth: measureConverter(draggingProduct.uom,this.state.displayUOM,draggingProduct.rotatewidth) * this.state.displayRatio,
                                    drawHeight: cprodheight,
                                    qty: 1, sideType: "Left", fieldUom: this.state.displayUOM,
                                    x: Math.abs(shelveCheck.overlapX) * -1, 
                                    y: newlocy, 
                                    isNew: true, 
                                    isDelete: false
                                };
                            }

                            var allowbottom = checkProductIsInBottom(selectedShelf.y, selectedShelf.drawHeight, newlocy, cprodheight);

                            //define location object
                            let plocobj = {id:uuidv4(), f_uuid: uuidv4(), x: xa1, y: newlocy,
                                productWidth: draggingProduct.rotatewidth, 
                                productHeight: draggingProduct.rotateheight, 
                                productDepth: draggingProduct.rotatedepth,
                                productRotation: draggingProduct.rotatetype,
                                drawWidth: measureConverter(draggingProduct.uom,this.state.displayUOM,draggingProduct.rotatewidth) * this.state.displayRatio,
                                drawHeight: cprodheight,
                                isRightSideOverLap: shelveCheck.isOverlap, 
                                productUom: draggingProduct.uom, 
                                isNew: true, 
                                isDelete: false,
                                isbottom: allowbottom,
                                overLappingDto: overlaplocobj,
                                uom: this.state.displayUOM,
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
                                let newrdobj = [{type:"QTY_ADD", loclist: [], product: draggingProduct, fieldidx: fieldidx, shelve: shelfIdx, prodobj: addedProds2[prodfound2], locobj: null, changeqty: 0}];
                                this.props.handleRDChanges(newrdobj);
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
                                let newrdobj = [{type:"ADD_NEW_BLOCK", loclist: [], product: draggingProduct, fieldidx: fieldidx, shelve: shelfIdx, prodobj: addedProds2[prodfound2], locobj: null, changeqty: 0}];
                                this.props.handleRDChanges(newrdobj);
                            }
                            addedProds2[prodfound2].productBlock = cblockprods2;
                        } else{ //new product
                            var data_obj2 = {
                                id: uuidv4(), f_uuid: uuidv4(),
                                productWidth: draggingProduct.width, productHeight: draggingProduct.height, productPadding: 0, productDepth: draggingProduct.depth, productUom: draggingProduct.uom,
                                productInfo: draggingProduct,
                                isNew: true, isDelete: false,
                                brandLevel: { 
                                    brandId: draggingProduct.brandId,
                                    brandName: draggingProduct.brandName,
                                    color: draggingProduct.brandColor
                                },
                                categoryLevel: {
                                    categoryId: draggingProduct.categoryId,
                                    categoryName: draggingProduct.categoryName,
                                    color: draggingProduct.categoryColor,
                                    isRule: false,
                                    ruleType: null
                                },
                                subcategoryLevel: {
                                    subcategoryId: draggingProduct.subCategoryId,
                                    subcategoryName: draggingProduct.subCategoryName,
                                    color: draggingProduct.subCategoryColor,
                                    isRule: false,
                                    ruleType: null
                                },
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
                            let newrdobj = [{type:"ADD_NEW_BLOCK", loclist: [], product: draggingProduct, fieldidx: fieldidx, shelve: shelfIdx, prodobj: data_obj2, locobj: null, changeqty: 0}];
                            this.props.handleRDChanges(newrdobj);
                        }
                    }

                    let updateshelf = spdobj.fieldsList[fieldidx].planogramShelfDto[shelfIdx];
                    updateshelf.planogramProduct = addedProds2;
                    updateshelf.previewguid = { startX: 0, endX: 0};
                    
                    this.setState({ 
                        isenablefieldedit: false, 
                        alloweditoverflwmargin: false, 
                        isselectprodblock: false, 
                        isBlockMove: false, currentSelectedBlock: null,
                        currentInternalDraggableProd: cdrgprod,
                        isViewContextmenu: false, contxtMenu: {isexpand: true},
                        isViewBlockContext: false, blockcontxt: { xpos: 0, ypos: 0 }, 
                        dropEffectingProds: [],
                    }, () => {
                        this.props.addItemstoWarning(draggingProduct); //add to warning list if already using in other departments

                        if(!this.props.showFullScreenEditView){
                            this.props.updateConvertDetails(spdobj, true);
                        }

                        if(draggingProduct.isSingleCut){
                            this.props.updateSingleCutProduct(draggingProduct);
                        }
                    }); //isviewcmenu: false, contxtmenu: null
                }
            }

            //end drop
            /* if(shelfRef){ 
                shelfRef.style.fill = 'transparent'; 
            } */

        } else {
            //
        }
    }
    //validate product before add to dunit
    validateProdDetails = (prodDetails) => {
        let isallowtodrop = true;
        if(!prodDetails || !prodDetails.width || !prodDetails.height || !prodDetails.uom || prodDetails.uom === ""){
            isallowtodrop = false;
        }

        return isallowtodrop;
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
        let checkWidthMargin = (sconvprodwidth / 3);
        let checkHeightMargin = (sconvprodheight / 3);

        var snx1 = newx - checkWidthMargin;
        var sny1 = newy - checkHeightMargin;
        var snx2 = (newx + sconvprodwidth) + checkWidthMargin;
        var sny2 = (newy + sconvprodheight) + checkHeightMargin;
        
        //loop though product list
        var founditem = false;
        var snapAllowProducts = [];

        if(shelfObj && shelfObj.planogramProduct){
            for (var i = 0; i < shelfObj.planogramProduct.length; i++) {
                const proditem = shelfObj.planogramProduct[i];
                if(!proditem.isDelete){ // && proditem.productInfo.id === draggingProduct.id
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
    //check product allowed to add inside shelve
    checkAllowToAdd = (e, shelfObj, shelf, draggingProduct, xa, ya, cdisplayratio, ignorethis, checkloc) => {
        //check allowed
        var allowToAdd = true;

        if(draggingProduct){
          var dpwidth = (measureConverter(draggingProduct.uom,this.state.displayUOM,(draggingProduct.rotatewidth?draggingProduct.rotatewidth:draggingProduct.width)) * cdisplayratio);
          var dpheight = roundOffDecimal((measureConverter(draggingProduct.uom,this.state.displayUOM,(draggingProduct.rotateheight?draggingProduct.rotateheight:draggingProduct.height)) * cdisplayratio),10);
          var xb = roundOffDecimal((xa + dpwidth),10);
          var yb = roundOffDecimal(((ya + dpheight) - this.state.allowSaftyMargin),10);
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

    closeBlockContext = () => {
        this.setState({ 
            isViewBlockContext: false, blockcontxt: { xpos:0, ypos: 0 },
            isBlockMove: false, currentSelectedBlock: null
        });
    }

    //handle allow overflow
    handleAllowOverflow = () => {
        this.setState({ allowovrflwprod: !this.state.allowovrflwprod }, () => {
            this.props.setFieldOverlapAction(this.state.allowovrflwprod);
        });
    }

    //handle change overlap margin change
    handleChangeOverlapSafty = (csobj) => {
        if(!this.props.showFullScreenEditView){
            this.props.updateConvertDetails(csobj, true);
        }
    }

    fieldHistoryUndo = () => {
        this.setState({ currentSelectedBlock: null }, () => {
            this.props.fieldHistoryUndo();
        });
    }

    fieldHistoryRedo = () => {
        this.setState({ currentSelectedBlock: null }, () => {
            this.props.fieldHistoryRedo();
        });
    }

    //scroll parent handle
    scrollParentWithDrag = (evt) => {
        let saftyMargin = 10;

        //scroll parent div with d3 drag
        let isShowRLView = (this.state.isPrintPending?this.props.isPrintRLView:this.state.isShowRLView);
        let checksvgid = (isShowRLView?"activedrawsvg-wrapper":"maindrawsvg-wrapper");

        let parent = document.getElementById(checksvgid);
        let zoomDrawX = this.state.zoomDrawX;

        let w = parent.offsetWidth; 
        let h = parent.offsetHeight;
        let sL = parent.scrollLeft;
        let sT = parent.scrollTop;

        let movewidth = (evt.drawWidth + (zoomDrawX > 0?(zoomDrawX + 1):1));
        let moveheight = (evt.drawHeight + (zoomDrawX > 0?(zoomDrawX + 1):1));

        let x = ((evt.x + saftyMargin) * (zoomDrawX > 0?(zoomDrawX + 1):1));
        let x2 = (((evt.x + saftyMargin) * (zoomDrawX > 0?(zoomDrawX + 1):1)) + movewidth);
        let y = ((evt.y + saftyMargin) * (zoomDrawX > 0?(zoomDrawX + 1):1));
        let y2 = (((evt.y + saftyMargin) * (zoomDrawX > 0?(zoomDrawX + 1):1)) + moveheight);

        //if dragging horizontal
        if (x2 > w + sL) {
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

    //remove expand
    removeExpandOpts = () => {
        this.setState({ 
            isViewContextmenu: false, contxtMenu: null,
            isActViewvMenu: false, actViewMenu: null,
            isViewBlockContext: false, blockcontxt: { xpos: 0, ypos: 0 }, 
        });
    }

    //init print pdf - check if normal view
    initPrintPDF = () => {
        this.props.togglePrintFullScreen(false, null, () => {
            let isShowRLView = this.state.isShowRLView;
            this.props.togglePrintFullScreen(true,isShowRLView);
        });
    }
    
    //export pdf
    exportPDF = () => {
        let isShowRLView = (this.state.isPrintPending?this.props.isPrintRLView:this.state.isShowRLView);
        let printallprods = structuredClone(isShowRLView?this.state.activeViewObj:this.state.viewObj);
        let exportelem = (isShowRLView?".rlgram-view":".plgram-view");
        let userdetails = (this.props.userDetails?this.props.userDetails.userDto:null);

        this.setState({ isPrintInProcess: true }, () => {
            toImg(exportelem, 'name', {
                quality: 0.01,
                download: false,
            }).then(fileData => {
                // console.log(fileData);
                
                    let printHeight = (isShowRLView?this.state.aviewHeight:this.state.viewHeight);
                    let calratio = CalculateRatio(printHeight, this.state.printHeight);

                    let printWidth = (isShowRLView?this.state.aviewWidth:this.state.viewWidth);
                    let printWidthRatio = (printWidth * calratio);
                    
                    let canvas = document.getElementById("pgexport-canvas");
                    let ctx = canvas.getContext("2d");
                    
                    canvas.width = printWidthRatio;
                    canvas.height = this.state.printHeight;
                    
                    let image = new Image();
                    image.src = fileData;
                    image.onload = () => {
                        ctx.drawImage(image, 0, 0, printWidthRatio, this.state.printHeight);

                        let fieldcropx = 0;
                        let newprintfields = [];
                        for (let k = 0; k < printallprods.fieldsList.length; k++) {
                            const printfieldobj = printallprods.fieldsList[k];

                            if(printfieldobj){
                                printfieldobj["imagearray"] = [];
        
                                //get ratio converted value 
                                let fieldtotalwidth = (printfieldobj.drawWidth * calratio);
                                let fieldendx = (fieldcropx + fieldtotalwidth);
        
                                //image crop with field draw width
                                let printpagecount = Math.ceil(fieldtotalwidth / this.state.printonepagewidthinPX);
                                // console.log(k, printpagecount);
                                
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
                                            fieldName: ("Field-"+(k+1)) 
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
                        document.getElementById("pgexportprint-wrapper").style.display = "block";
                        htmlToImage.toPng(document.getElementById("pgexportprint-wrapper"), {
                            width: 1191, 
                            height: 842,
                            quality: 1,
                            cacheBust: true,
                        })
                        .then((coverimage) => {
                            if(document.getElementById("pgexportprint-wrapper")){
                                document.getElementById("pgexportprint-wrapper").style.display = "none";
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
                                    pdf.text((this.props.t("Field_unit_no")+" "+(index + 1)), (isrtlview?(width - 40):40), 55, optionsR);
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
                                    let bottomdepttxt = (isrtlview?(printOneField.department.name+" < "+printOneField.floorLayoutVersion)
                                        :(printOneField.floorLayoutVersion+" > "+printOneField.department.name));
                                    pdf.text(bottomdepttxt, (isrtlview?(width - 40):40), (height - 20), optionsR);
                                
                                    let bottomusertxt = (isrtlview?((userdetails?(userdetails.lName+" "+userdetails.fName):"-")+" | "+generatedTime+" | "+generatedDate)
                                        :(generatedDate+" | "+generatedTime+" | "+(userdetails?(userdetails.fName+" "+userdetails.lName):"-")))
                                    pdf.text(bottomusertxt, (isrtlview?40:(width - 40)), (height - 20), optionsL);

                                    if((l + 1) < printOneField.imagearray.length){
                                        pdf.addPage();
                                        pageno = (pageno + 1);
                                    }
                                }
                                
                                //auto table
                                if(printOneField && printOneField.planogramShelfDto && Object.keys(printOneField.planogramShelfDto).length > 0){
                                    let isshelfProdsAvailable = false;
                                    let sortshelflist = printOneField.planogramShelfDto.sort((a, b) => a.rank - b.rank);
                                    for (let l = 0; l < sortshelflist.length; l++) {
                                        const shelfobj = sortshelflist[l];
                                        
                                        let isprodsavailable = shelfobj.planogramProduct.filter(x => !x.isDelete && x.productFacingQty > 0);
                                        if(isprodsavailable.length > 0){
                                            isshelfProdsAvailable = true;
                                            shelfobj.isProdsAvailable = true;
                                        }
                                    }

                                    if(isshelfProdsAvailable){
                                        pdf.addPage();
                                        pageno = (pageno + 1);
                                        
                                        // let shelfidx = 0;
                                        for (const shelfkey in sortshelflist) {
                                            const fieldshelf = sortshelflist[shelfkey];
                                            
                                            if(fieldshelf.isProdsAvailable){
                                                let prodarrobj = [];
                                                for (let j = 0; j < fieldshelf.planogramProduct.length; j++) {
                                                    const shelfsingleobj = fieldshelf.planogramProduct[j];
                                                    
                                                    if(!shelfsingleobj.isDelete){
                                                        let prodsupname = (shelfsingleobj.productInfo && shelfsingleobj.productInfo.supplierName?shelfsingleobj.productInfo.supplierName:"-");
                                                        let newprodobj = [shelfsingleobj.productInfo.barcode, shelfsingleobj.productInfo.productName, prodsupname, shelfsingleobj.productFacingQty];
        
                                                        prodarrobj.push(newprodobj);
                                                    }
                                                }
                                                // console.log(prodarrobj);
        
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
                                                
                                                pdf.text((this.props.t("Shelf_unit_no")+": "+(parseFloat(shelfkey)+1)), (isrtlview?(width - pageMargin):pageMargin), tabledrawy,optionsR);
                                                pdf.text(((printOneField && printOneField.fieldDto.fieldName)?printOneField.fieldDto.fieldName:"-"), (isrtlview?pageMargin:(width - pageMargin)), tabledrawy, optionsL);
                                                
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
                                                    let bottomdepttxt = (isrtlview?(printOneField.department.name+" < "+printOneField.floorLayoutVersion)
                                                        :(printOneField.floorLayoutVersion+" > "+printOneField.department.name));
        
                                                    pdf.text(bottomdepttxt, (isrtlview?(width - pageMargin):pageMargin), (height - 20), optionsR);
                                                
                                                    let bottomusertxt = (isrtlview?((userdetails?(userdetails.lName+" "+userdetails.fName):"-")+" | "+generatedTime+" | "+generatedDate)
                                                        :(generatedDate+" | "+generatedTime+" | "+(userdetails?(userdetails.fName+" "+userdetails.lName):"-")))
                                                    pdf.text(bottomusertxt, (isrtlview?pageMargin:(width - pageMargin)), (height - 20), optionsL);
                                                }
        
                                                //table
                                                let headers = [
                                                    {key: "barcode", label: this.props.t("barcode"), width: 15},
                                                    {key: "name", label: this.props.t("PRODUCT_NAME"), width: 45},
                                                    {key: "supname", label: this.props.t("supname"), width: 30},
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
        
                                                prodarrobj.forEach((row, rIndex) => {
                                                    const rowHeights = [];
                                                    const rowRectHeights = [];
        
                                                    newheadery = (newheadery === 45 ? (newheadery + padding) : newheadery);
                                                    
                                                    // COLUMNS
                                                    let newrowcells = [];
                                                    headers.forEach((column, cIndex) => {
                                                        const xPositionForCurrentHeader = (((reducetablewidth / 100) * column.width) - tablecellpadding);
        
                                                        const longText = ((column.key !== "barcode" && column.key !== "qty")?pdf.splitTextToSize(String(row[cIndex]), xPositionForCurrentHeader):[String(row[cIndex])]);
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
        
                                                    let bottompagemargin = (pageMargin * 2);
        
                                                    if ((newcelly + bottompagemargin) > height && (rIndex + 1) < fieldshelf.planogramProduct.length) {
                                                        pdf.addPage();
        
                                                        newheadery = (pageMargin + padding);
                                                        newpageno = (newpageno + 1);
        
                                                        if (!curlastaddedpage || curlastaddedpage !== newpageno) {
                                                            curlastaddedpage = newpageno;
                                                            // //page no
                                                            pdf.setFontSize(11);
                                                            pdf.setTextColor("#000000");
                                                            pdf.text(((this.props.t("PAGE")+" "+curlastaddedpage)), (isrtlview?(width - pageMargin):pageMargin), 30, optionsR);
                                                            
                                                            // //shelf and field details
                                                            pdf.setFontSize(12);
        
                                                            //page footer details
                                                            let bottomdepttxt = (isrtlview?(printOneField.department.name+" < "+printOneField.floorLayoutVersion)
                                                                :(printOneField.floorLayoutVersion+" > "+printOneField.department.name));
        
                                                            pdf.text(bottomdepttxt, (isrtlview?(width - pageMargin):pageMargin), (height - 20), optionsR);
                                                        
                                                            let bottomusertxt = (isrtlview?((userdetails?(userdetails.lName+" "+userdetails.fName):"-")+" | "+generatedTime+" | "+generatedDate)
                                                                :(generatedDate+" | "+generatedTime+" | "+(userdetails?(userdetails.fName+" "+userdetails.lName):"-")))
                                                            pdf.text(bottomusertxt, (isrtlview?pageMargin:(width - pageMargin)), (height - 20), optionsL);
                                                        }
                                                    }
                                                });
                                                lastaddedpage = curlastaddedpage;
        
                                                pageno = newpageno;
                                                tabledrawy = (newheadery + 20);
                                            }
                                        }
                                    }
                                }
                                
                                if((index + 1) < printallprods.length){
                                    pdf.addPage();
                                    tabledrawy = pageMargin;
                                }
                            }

                            if(this.props.printType === "EMAIL"){
                                // console.log("email continue - "+this.props.shareEmail);
                                let outputPDF = pdf.output('arraybuffer');
                                this.continueEmailShare(outputPDF);

                            } else if(this.props.printType === "PRINT"){
                                pdf.autoPrint();
                                window.open(pdf.output('bloburl'), '_blank');
                            } else{
                                //file name
                                let filename = ("planogram_export_"+new Date().getTime());
                                pdf.save(replaceSpecialChars(String(filename)));
                            }

                            if(this.props.printType !== "EMAIL"){
                                setTimeout(() => {
                                    if(this.state.isPrintPending){
                                        this.props.togglePrintFullScreenView();
                                    }

                                    this.props.toggleLoadingModal();
                                    this.setState({ isPrintInProcess: false });
                                }, 300);
                            }
                        });
                    };  
            });    
        });
        
    }

    //continue email share
    continueEmailShare = (exportpdf) => {
        let saveObj = this.props.saveObj;
        let layoutversion = (saveObj.fieldsList && saveObj.fieldsList[0]?saveObj.fieldsList[0].floorLayoutVersion.toLowerCase().replace(/ /g, '_'):"");
        let curSelectedDept = this.props.fieldDeptList[this.state.selectedDept];
        let fileName= (layoutversion+"_-_"+(curSelectedDept && curSelectedDept.name?(curSelectedDept.name.toLowerCase().replace(/ /g, '_')):"display_Unit")+"_export_products_list.pdf");
        
        let imgObj = {
            imageName: fileName,
            subject: ((curSelectedDept && curSelectedDept.name?curSelectedDept.name:"_")+" - "+layoutversion),
            contentType: "application/pdf"
        };
        //console.log(imgObj);

        submitSets(submitCollection.getImagePutURL, imgObj, true).then(res => {
            if(res && res.status){
                // console.log(res);
                this.handleUploadPDF(exportpdf, res.extra, imgObj);
            } else{
                this.props.toggleLoadingModal();
                this.setState({ isPrintInProcess: false });
            }
        });
    }

    //upload pdf
    handleUploadPDF = (pdfobj, urlobj, sendobj) => {
        try {
            const coheaders = {"Content-Type": 'application/pdf'};
            axios({url: urlobj.url, method: "PUT", data: pdfobj, headers:coheaders}).then((res) => {
                if(res.status === 200){
                    this.sendShareEmail(urlobj, sendobj);
                } else{
                    this.props.toggleLoadingModal();
                    this.setState({ isPrintInProcess: false });
                }
            });
        } catch (error) {
            this.props.toggleLoadingModal();
            this.setState({ isPrintInProcess: false });
        }
    }

    sendShareEmail = (urlobj, prevsendobj) => {
        let sendobj = {
            fileId: urlobj.id,
            toMail: this.props.shareEmail,
            subject: prevsendobj.subject,
            fileName: prevsendobj.imageName,
            contentType: "application/pdf"
        }

        submitSets(submitCollection.sendEmailWithFile, sendobj, true).then(res => {
            if(res && res.status){
                // console.log(res);
                setTimeout(() => {
                    alertService.success(this.props.t("EMAIL_PRINTSHARE"));
                    
                    if(this.state.isPrintPending){
                        this.props.togglePrintFullScreenView();
                    }
                    
                    this.props.toggleLoadingModal();
                    this.setState({ isPrintInProcess: false });
                }, 300);
            } else{
                alertService.error(res && res.error?res.error.errorMessage:this.props.t("erroroccurred"));

                this.props.toggleLoadingModal();
                this.setState({ isPrintInProcess: false });
            }
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

    handleLoadedProdCount = () => {
        this.setState({ loadedProdCount: (this.state.loadedProdCount + 1) }, () => {
            let isShowRLView = (this.state.isPrintPending?this.props.isPrintRLView:this.state.isShowRLView);
            let checktotalcount = (isShowRLView?this.state.totalActiveProdForExport:this.state.totalProdsForExport);
            
            if(checktotalcount === this.state.loadedProdCount){
                console.log("all images converted");
                if(this.state.isPrintPending){
                    this.exportPDF();
                }
            }
        });
    }

    //#PLG-DU-FE-H02 delete all products
    deleteAllProds = () => {
        confirmAlert({
            title: this.props.t('deleteallproducts'),
            message: this.props.t('dlteallprodmessage'),
            overlayClassName: (this.props.isRTL==="rtl"?"alertrtl-content":""),
            buttons: [
              {
                label: this.props.t('btnnames.yes'),
                onClick: () => {
                    var saveObj = this.props.saveObj;
                    //add to history
                    this.props.fieldHistoryAdd(structuredClone(saveObj),2);

                    for (let z = 0; z < saveObj.fieldsList.length; z++) {
                        const csobj = saveObj.fieldsList[z];
                        
                        for (var i = 0; i < csobj.planogramShelfDto.length; i++) {
                            const pshelf = csobj.planogramShelfDto[i];
                            for (var j = 0; j < pshelf.planogramProduct.length; j++) {
                                const pprod = pshelf.planogramProduct[j];
                                pprod["isDelete"] = true;
                                pprod["isNew"] = false;
    
                                var removeqtytotal = 0;
                                let removeLocList = [];
                                for (var l = 0; l < pprod.productBlock.length; l++) {
                                    const pblock = pprod.productBlock[l];
                                    pblock["isDelete"] = true;
                                    pblock["isNew"] = false;
    
                                    //removeqtytotal = removeqtytotal + pblock.productLocations.length;
                                    for (var k = 0; k < pblock.productLocations.length; k++) {
                                        const plocation = pblock.productLocations[k];
                                        
                                        if(!plocation.isDelete){
                                            plocation["isDelete"] = true;
                                            plocation["isNew"] = false;
        
                                            if(plocation.overLappingDto){
    
                                                if(!plocation.overLappingDto.isNew){
                                                    plocation.overLappingDto["isDelete"] = true;
                                                    plocation.overLappingDto["isNew"] = false;
        
                                                    let changerightfield = saveObj.fieldsList.findIndex(x => x.id === csobj.rightSidePlanogramFieldDto.id);
                                                    let changerightshelf = (changerightfield > -1?saveObj.fieldsList[changerightfield].planogramShelfDto.findIndex(x => x.id === plocation.overLappingDto.shelfId):-1);
                                    
                                                    if(changerightshelf > -1){
                                                        let rightoverlaplist = saveObj.fieldsList[changerightfield].planogramShelfDto[changerightshelf].overLappingDto;
                                                        let findalreadyrightadded = rightoverlaplist.findIndex(x => x.id === plocation.overLappingDto.id && !x.isDelete);
                                        
                                                        if(findalreadyrightadded > -1){
                                                            if(rightoverlaplist[findalreadyrightadded].isNew){
                                                            rightoverlaplist.splice(findalreadyrightadded, 1);
                                                            } else{
                                                            rightoverlaplist[findalreadyrightadded].isDelete = true;
                                                            }
                                                        }
                                                    }
                                                } else{
                                                    plocation.overLappingDto = null;
                                                }
                                            }
        
                                            var allowbottom = checkProductIsInBottom(pshelf.y,pshelf.drawHeight,plocation.y,plocation.drawHeight)
        
                                            if(allowbottom){
                                                removeqtytotal = removeqtytotal + 1;
                                                removeLocList.push(plocation);
                                            }
                                        }
                                    }
                                }
    
                                //block remove change - RD changes
                                let newrdobj = [{type:"REMOVE_PRODUCT", loclist: removeLocList, product: pprod.productInfo, fieldidx: z, shelve: i, prodobj: pprod, locobj: null, changeqty:removeqtytotal}];
                                this.props.handleRDChanges(newrdobj);
                            }
                        }
                    }

                    this.setState({ 
                        isselectprodblock: false, 
                        isBlockMove: false, currentSelectedBlock: null,
                        isviewcmenu: false, 
                        contxtmenu: null, 
                        selectedlocobj: null 
                    }, () => {
                        // this.checkEnableFieldEdit();
                        this.props.updateConvertDetails(saveObj, true);
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

    togglePrintDeptModal = (printtype) => {
        this.setState({ 
            isShowPrintDeptModal: !this.state.isShowPrintDeptModal,
            printType: (printtype?printtype:this.state.printType)
        });
    }

    updateSelectDept = (evt) => {
        this.setState({ selectedDept: evt.target.value });
    }

    conitinuePrintDept = () => {
        this.togglePrintDeptModal();
        this.props.setPrintDept(this.state.selectedDept, this.state.printType, this.state.isShowRLView, this.props.isFullScreenMode);
    }

    //toggle email modal
    toggleShareEmailModal = () => {
        this.setState({ shareModalShow: !this.state.shareModalShow });
    }

    //toggle email
    shareEmailContinue = () => {
        if(this.props.shareEmail && emailvalidator(this.props.shareEmail)) {
            this.togglePrintDeptModal("EMAIL");
            this.toggleShareEmailModal();
        } else{
            alertService.error(this.props.t('ENTER_VALID_EMAIL'));
        }
    }

    stackablEnableToggle = () => {
        this.setState({ isStackableEnabled: !this.state.isStackableEnabled });
    }

    toggleDragShelfOverlap = (isshow) => {
        this._isshowoverlayshelf = isshow;
        // console.log(this._isshowoverlayshelf);
    }
    
    //toggle product indicators
    toggleProdIndicators = () => {
        this.setState({ visibleProdIndicators: !this.state.visibleProdIndicators });
    }

    //toggle overflow modal
    toggleOverflowModal = (isshow, fieldobj, idx) => {
        if(!this.state.isShowOverflowModal){
            if(!fieldobj.isOverlapProdAvailable){
                this.setState({ 
                    isShowOverflowModal: isshow, 
                    overlapFieldObj: fieldobj,
                    overlapFieldIdx: idx,
                });
            } else{
                alertService.warn(this.props.t("OVERLAP_PROD_AVAILABLE_REMOVE_TO_EDIT_SAFTY"));
            }
        } else{
            this.setState({ 
                isShowOverflowModal: isshow, overlapFieldObj: fieldobj, overlapFieldIdx: idx,
            });
        }
    }

    render(){
        let { 
            dropEffectingProds, activeViewObj, isPrintPending, leftRightObj, isStackableEnabled, fieldStatus, 
            visibleProdIndicators 
        } = this.state;
        let { proposeHighlightProd } = this.props;

        let showobj = (this.props.showFullScreenEditView?this.state.viewObj:this.props.saveObj);
        // console.log(showobj);

        let isShowRLView = (isPrintPending?this.props.isPrintRLView:this.state.isShowRLView);

        let viewDeptList = (isShowRLView?this.props.activeFieldDeptList:this.props.fieldDeptList);

        return <>
            {this.state.isActViewvMenu?
                <ActiveContextMenu 
                    isRTL={this.props.isRTL} 
                    viewProd={this.state.curActViewableProd}
                    xpos={this.state.isActViewvMenu?this.state.actViewMenu.xpos:0}
                    ypos={this.state.isActViewvMenu?this.state.actViewMenu.ypos:0} 
                    copyToClipboard={this.props.copyToClipboard} 
                    handlclose={() => this.setState({isActViewvMenu: false})} 
                    handleProductImgPreview={this.props.handlePreviewModal} 
                    showFullScreenEditView={this.props.showFullScreenEditView} 
                    togglePreviewModal={this.togglePreviewModal}
                    />
            :<></>}

            {this.state.isViewContextmenu?
                <DrawContextMenu t={this.props.t} isRTL={this.props.isRTL} 
                    xpos={this.state.isViewContextmenu && this.state.contxtMenu?this.state.contxtMenu.xpos:0}
                    ypos={this.state.isViewContextmenu && this.state.contxtMenu?this.state.contxtMenu.ypos:0} 
                    isexpand={this.state.contxtMenu?this.state.contxtMenu.isexpand:false} 
                    isview={this.state.isViewContextmenu} 
                    currentprod={this.state.currentInternalDraggableProd} 
                    copyToClipboard={this.props.copyToClipboard} 
                    fieldStatus={this.state.fieldStatus}
                    handleselectblock={this.handleSelectAllBlock}
                    handledelete={this.handleSingleProdDelete} 
                    handledeleteall={this.handleDeleteAllProd} 
                    handlexpand={this.handleExpandProd} 
                    handleProductImgPreview={this.props.handlePreviewModal}
                    handlclose={() => this.setState({isViewContextmenu: false})}  
                    showFullScreenEditView={this.props.showFullScreenEditView} 
                    togglePreviewModal={this.togglePreviewModal} 
                    handleopenDetailmodal={this.props.handleopenDetailmodal}
                    />
            :<></>}

            {this.state.isViewBlockContext?
                <BlockContextMenu isRTL={this.props.isRTL}   
                    handlclose={() => this.closeBlockContext()} 
                    handleBlockDelete={this.confirmingDeleteSelecteBlock}
                    handleBlockCut={this.handleBlockCut}
                    xpos={this.state.isViewBlockContext?this.state.blockcontxt.xpos:0} 
                    ypos={this.state.isViewBlockContext?this.state.blockcontxt.ypos:0}
                    showFullScreenEditView={this.props.showFullScreenEditView} 
                    />
            :<></>}

            <Col xs={12} id="maindraw-parent" className="contentview-main">

                {this.props.isFullScreenMode || !this.props.showFullScreenEditView || (!this.props.isFullScreenMode && this.props.showFullScreenEditView)?<>
                                
                    <ul className={"newpgtop-btnlist list-inline"} style={{marginTop:"-8px"}}>
                        {this.state.warningProdList && this.state.warningProdList.length > 0?<li className='list-inline-item deptprod-warnings'>
                            <Button variant="outline-warning" className="btn-with-icon" onClick={this.props.toggleWarningSidebar} size="sm" active={this.state.showWarningSidebar} title={this.props.t("WARN")}><StopIcon size={14}/> <span>{this.props.t("WARN")}</span></Button>
                        </li>:<></>}

                        <li className={"list-inline-item tool-controls-list"+(this.state.isshowedit?" fieldeditdisable":"")}><Button variant="outline-dark" onClick={() => this.handleToolControls("zoomin")} className={"btn-with-icon "} size="sm" title={this.props.t("ZOOM_IN")}><FeatherIcon icon="zoom-in" size={14}/></Button></li>
                        <li className={"list-inline-item tool-controls-list"+(this.state.isshowedit?" fieldeditdisable":"")}><Button variant="outline-dark" onClick={() => this.handleToolControls("zoomout")} className={"btn-with-icon "} size="sm" title={this.props.t("ZOOM_OUT")}><FeatherIcon icon="zoom-out" size={14}/></Button></li>
                        <li className={"list-inline-item tool-controls-list"+(this.state.isshowedit?" fieldeditdisable":"")} style={{marginRight:"10px"}}><Button variant="outline-dark" onClick={() => this.handleToolControls("zoomreset")} className={"btn-with-icon "} size="sm" title={this.props.t("resetZoom")} disabled={this.state.zoomDrawX === 0}><FeatherIcon icon="x-circle" size={14}/></Button></li>
                        <li className={"list-inline-item tool-controls-list"+(this.state.isshowedit?" fieldeditdisable":"")} style={{marginRight:"15px"}}><Button variant="outline-dark" onClick={() => this.handleToolControls("pantool")} className={"btn-with-icon "+(this.state.activetool === "pantool"?"active":"")} size="sm" title={this.props.t("ZoomPan")} disabled={this.state.zoomDrawX === 0}><FeatherIcon icon="move" size={14}/></Button></li>

                        
                        {!this.props.showFullScreenEditView && (fieldStatus === "ACTIVE" || fieldStatus === "DRAFT")?<>
                            <li className={"list-inline-item tool-controls-list rtlrotate-disable"} title={this.props.t("mark_stackable_onoff")}><Button variant="outline-dark"  onClick={()=>this.stackablEnableToggle()} className={"btn-with-icon"+(isStackableEnabled?" active":"")} size="sm"><StackableI /></Button></li>
                            
                            {/* {this.state.saveObj && this.state.saveObj.rightSidePlanogramFieldDto && Object.keys(this.state.saveObj.rightSidePlanogramFieldDto).length > 0?<li className={"list-inline-item "+(this.state.zoompanactive?"disable-action":"")}><Button variant={"outline-info"} className="btn-with-icon" size="sm" active={this.state.allowovrflwprod} onClick={this.handleAllowOverflow} style={{marginRight:"5px"}}>{this.props.t('ALLOW_OVERLAP')}</Button></li>:<></>} */}
                            <li className={"list-inline-item "+(this.state.contxtMenu&&this.state.contxtMenu.isexpand?"":"d-none")}><Button variant="outline-warning" className="btn-with-icon" size="sm" onClick={() => this.handleExpandProd()} style={{marginRight:"5px"}}><XIcon size={12}/> {this.props.t('expand')}</Button></li>
                            
                            <li className={"list-inline-item "}><Button variant="outline-danger" className="btn-with-icon" size="sm" onClick={() => this.deleteAllProds()} disabled={(showobj && showobj.fieldsList && showobj.fieldsList.length  >0)?false:true} style={{marginRight:"15px"}}><TrashIcon size={12}/> {this.props.t('btnnames.all')}</Button></li>
                            <li className={"list-inline-item "}><Button variant="outline-dark" className="btn-with-icon" size="sm" onClick={() => this.fieldHistoryUndo()} disabled={this.props.fieldHistory&&this.props.fieldHistory.past&&this.props.fieldHistory.past.length>0?false:true}><FeatherIcon icon="corner-up-left" size={14}/></Button></li>
                            <li className={"list-inline-item "}><Button variant="outline-dark" className="btn-with-icon" size="sm" onClick={() => this.fieldHistoryRedo()} disabled={this.props.fieldHistory&&this.props.fieldHistory.future&&this.props.fieldHistory.future.length>0?false:true}><FeatherIcon icon="corner-up-right" size={14}/></Button></li>
                        </>:<></>}

                        {!this.props.showFullScreenEditView && this.props.warningProdList && this.props.warningProdList.length > 0?<li className={"list-inline-item"} style={{marginLeft: "10px"}}>
                            <Button variant="outline-dark" onClick={this.props.toggleWarningSidebar} size="sm" active={this.state.showWarningSidebar} className="btn-with-icon warning-link"><FeatherIcon icon="alert-triangle" size={18}/></Button>
                        </li>:<></>}
                        
                        <li className={"list-inline-item"} style={{marginLeft: "5px"}}>
                            {this.props.isFullScreenMode?
                                <Button variant="outline-dark" onClick={() => this.props.toggleFullScreenView()} className="btn-with-icon" size="sm"><FeatherIcon icon="minimize" size={14}/></Button>
                            :
                                <Button variant="outline-dark" onClick={() => this.props.toggleFullScreenView()} className="btn-with-icon" size="sm"><FeatherIcon icon="maximize" size={14}/></Button>
                            }
                        </li>
                    </ul>

                    <ul className={"newpgtop-btnlist list-inline right-list"}>
                        {!this.props.showFullScreenEditView && (fieldStatus === "ACTIVE" || fieldStatus === "DRAFT")?<>
                            {showobj && showobj.fieldsList && showobj.fieldsList.length > 1?<li className={"list-inline-item"}>
                                <Button variant="outline-info" active={this.state.allowovrflwprod} size="sm" onClick={this.handleAllowOverflow} style={{marginRight:"5px"}}><SignOutIcon size={14} /> {this.props.t('ALLOW_OVERLAP')}</Button>
                                {/* <Dropdown as={ButtonGroup} className='overlap-btngroup'>
                                    <Button variant="outline-info" active={this.state.allowovrflwprod} size="sm" onClick={this.handleAllowOverflow} style={{marginRight:"5px"}}><SignOutIcon size={14} /> {this.props.t('ALLOW_OVERLAP')}</Button>
                                    <Dropdown.Toggle size="sm" split variant="outline-info" />

                                    <Dropdown.Menu align={"right"}>
                                        <OverlapSaftyView trans={this.props.t} 
                                            displayuom={this.state.displayUOM}
                                            saveobj={showobj} 
                                            handlechangesafty={this.handleChangeOverlapSafty}
                                            />
                                    </Dropdown.Menu>
                                </Dropdown> */}
                            </li>:<></>}
                        </>:<></>}
                        
                        <li className={"list-inline-item"}>
                            <Button variant="outline-dark" className="btn-with-icon" active={visibleProdIndicators} onClick={() => this.toggleProdIndicators()} size="sm">{visibleProdIndicators?<FeatherIcon icon="eye" size={14}/>:<FeatherIcon icon="eye-off" size={14}/>}</Button>
                        </li>
                        
                        {this.state.isActiveMode?<li className={"list-inline-item"}>
                            <ButtonGroup>
                                <Button variant="outline-primary" className={!isShowRLView?'active':''} onClick={() => this.toggleRLView(false)} size="sm">PL</Button>
                                <Button variant="outline-primary" className={isShowRLView?'active':''} size="sm" onClick={() => this.toggleRLView(true)}>RL</Button>
                            </ButtonGroup>
                        </li>:<></>}
                        <li className={"list-inline-item"} style={{marginLeft: "5px"}}>
                            <PopoverWrapper cusid="productexport-controllers" text={<ul className='list-inline'>
                                <li className='list-inline-item' onClick={() => this.togglePrintDeptModal("PRINT")}><FeatherIcon icon="printer" size={16}/></li>
                                <li className='list-inline-item' onClick={() => this.toggleShareEmailModal()}><FeatherIcon icon="mail" size={16}/></li>
                                <li className='list-inline-item' onClick={() => this.togglePrintDeptModal("PDF")}><FeatherIcon icon="download" size={16}/></li>
                            </ul>} placement="top" rootClose={true}><Button variant="outline-dark" className="btn-with-icon sharetoggle-link" size="sm"><FeatherIcon icon="share" size={14}/></Button></PopoverWrapper>
                        </li>
                        <li className={"list-inline-item"}>
                            <PopoverWrapper cusid="pghelp-drop" text={<>
                                <h5>{this.props.t("WARNING_TYPES")}</h5>
                                <ul className='warntypes-list'>
                                    <li><img src={warningImage} alt="" /> {this.props.t("DEPTWARNING_HELP")}</li>
                                    <li><img src={warningImageRed} alt="" /> {this.props.t("RECWARNING_HELP")}</li>
                                </ul>
                            </>} placement="bottom" trigger={["click"]} rootClose={true}>
                                <Button variant="outline-dark" className="btn-with-icon" size="sm"><FeatherIcon icon="alert-circle" size={14}/></Button>
                            </PopoverWrapper>
                        </li>
                        {this.props.isFullScreenMode?<li className="list-inline-item remove-link">
                            <Button variant="outline-dark" className="btn-with-icon" onClick={() => this.props.toggleFullScreenView()} size="sm"><FeatherIcon icon="x" size={24}/></Button>
                        </li>:<></>}
                    </ul>

                    <Row style={{width:"100%",margin:"0px"}}>
                        {!isShowRLView?
                        <Col className='drawview-wrapper pl-view' onContextMenu={e => e.preventDefault()}>
                            {!this.props.showFullScreenEditView?<>
                                {leftRightObj?<ul className='list-inline fieldnavigation-controllers'>
                                    <TooltipWrapper text={
                                        (this.props.t("left_field")+" - "+(leftRightObj.left?(leftRightObj.left.department.name+" - "+leftRightObj.left.noInFloorLayout):""))
                                    }>
                                        <li className={'list-inline-item'+(!leftRightObj.left?" d-none":"")} onClick={() => this.handleChangeLeftRightField("left", leftRightObj.left)}>
                                            <span><FeatherIcon icon="chevron-left" size={26}/></span>
                                        </li>
                                    </TooltipWrapper>

                                    <TooltipWrapper text={
                                        (this.props.t("right_field")+" - "+(leftRightObj.right?(leftRightObj.right.department.name+" - "+leftRightObj.right.noInFloorLayout):""))
                                    }>
                                        <li className={'list-inline-item'+(!leftRightObj.right?" d-none":"")} onClick={() => this.handleChangeLeftRightField("right", leftRightObj.right)}>
                                            <span><FeatherIcon icon="chevron-right" size={26}/></span>
                                        </li>
                                    </TooltipWrapper>
                                </ul>:<></>}
                            </>:<></>}
                            
                            <Col xs={12} id="maindrawsvg-wrapper" className={"NDUrowStructuredraw"+(this.state.contxtMenu&&this.state.contxtMenu.isexpand?" xpand":"")} onScroll={this.removeExpandOpts} dir="ltr" ref={this.displaydiv}>
                                <svg id="mainsvg-view" className={"plgram-view"+(this.state.zoompanactive?" svgzoom-action":"")} 
                                    viewBox={'0 0 '+this.state.viewWidth+' '+this.state.viewHeight} 
                                    width={(!this.state.zoompanactive?this.state.viewWidth:"100%")} 
                                    /* height={this.state.viewHeight} */ 
                                    style={{ display:"block",margin:"auto"}}  
                                    ref={(r) => this["mainsvg"] = r}
                                    onDragEnter={e => this.toggleDragShelfOverlap(true)}
                                    onMouseDown={e => this.svgMouseDown(e)} 
                                    onMouseUp={e => this.svgMouseUp(e)} 
                                    onMouseMove={e => this.svgMouseMove(e)} 
                                    onDrag={e => this.toggleDragShelfOverlap(false)}
                                    >

                                    {/* <rect x={0} y={0} width={this.state.viewWidth} height={this.state.viewHeight} strokeWidth={4} fill="none" style={{ stroke: (this.props.dmode?'#2CC990':'#5128a0') }} /> */}

                                    {showobj && showobj.fieldsList.length > 0?<>
                                        {showobj.fieldsList.map((fitem, fidx) => {

                                            let deptname = (fitem.department?fitem.department.name:"-");
                                            let deptcolor = (fitem.department?fitem.department.color:"rgb(81, 40, 160)");
                                            let depttxtcolor = (checkColorIsLight(deptcolor)?"#5128a0":"white");

                                            return <React.Fragment key={fidx}>
                                                {/* <rect x={fitem.startX} y={fitem.startY} width={fitem.drawWidth} height={fitem.drawHeight} strokeWidth={4} stroke={deptcolor} fill="none" /> */}

                                                <clipPath id={("clip-"+fidx+"-nfield")}>
                                                    <rect x={(fitem.startX > 0?fitem.startX:0)} y={(fitem.startY > 0?(fitem.startY - 20):0)} width={fitem.drawWidth} height={20} />
                                                </clipPath>

                                                <g clipPath={"url(#clip-"+fidx+"-nfield)"} >
                                                    <rect width={(10 * deptname.length)+15+(this.state.allowovrflwprod?20:0)} height={20} x={(fitem.startX > 0?fitem.startX:0)} y={(fitem.startY > 0?(fitem.startY - 20):0)} fill={deptcolor} />
                                                    <text fill={depttxtcolor} x={(fitem.startX > 0?fitem.startX:0)+8 } y={(fitem.startY > 0?(fitem.startY - 20):0)+15} className="small">{fitem.noInFloorLayout+" - "+deptname}</text>

                                                    {this.state.allowovrflwprod?<foreignObject x={(((fitem.startX > 0?fitem.startX:0) + (10 * deptname.length)+35) - 20)} y={(fitem.startY > 0?(fitem.startY - 23):0)} width={20} height={20}>
                                                        <span className='overlapallow-link' onClick={() => this.toggleOverflowModal(true, fitem, fidx)}><FeatherIcon icon="edit" size={12}/></span>
                                                    </foreignObject>:<></>}
                                                </g>

                                                {(fitem.planogramShelfDto?fitem.planogramShelfDto.map((shelf, i) => <g key={i} className={"shelve-"+shelf.id}>
                                                    {shelf.isDelete === false?<>
                                                        {(fidx === 0 && shelf.overLappingDto?shelf.overLappingDto.map((rect, x) => {
                                                            return <g key={x} className='pgoverlap-group'><image pointerEvents="all" preserveAspectRatio="none" href={rect.productDto.imageUrl} x={rect.x} y={rect.y} width={rect.drawWidth} height={rect.drawHeight} style={{opacity:"0.4"}} />
                                                            <rect x={rect.x} y={rect.y} width={rect.drawWidth} height={rect.drawHeight} fill="#B8B5FF" fillOpacity="0.5"></rect></g>;
                                                        }):<></>)}

                                                        {shelf.previewguid?<>
                                                            <line x1={shelf.previewguid.startX} y1={shelf.y} x2={shelf.previewguid.startX} y2={shelf.y+shelf.drawHeight} strokeWidth={2} stroke="green" strokeDasharray="4" />
                                                            <line x1={shelf.previewguid.endX} y1={shelf.y} x2={shelf.previewguid.endX} y2={shelf.y+shelf.drawHeight} strokeWidth={2} stroke="green" strokeDasharray="4" />
                                                        </>:<></>}

                                                        <rect className="sftrect" width={shelf.drawWidth} height={shelf.drawHeight} x={shelf.x} y={shelf.y} id={i} ref={(r) => this[(fidx+""+i)] = r}
                                                            onDragOver={(e) => this.dragEnd(e, shelf, this[(fidx+""+i)],false,null,true, i, fitem, fidx)} 
                                                            onDragLeave={(e)=> this.dragClear(e, shelf, this[(fidx+""+i)])}
                                                            onDrop={(e) => this.droppedNew(e, shelf, this[(fidx+""+i)], i, false, fitem, fidx)}
                                                            style={{ strokeWidth: 1, stroke: deptcolor, fill: 'transparent', zIndex: -1 }}
                                                            />

                                                        <rect width={shelf.drawWidth} height={shelf.drawGap} x={shelf.x} y={shelf.y+(shelf.drawHeight?shelf.drawHeight:0)} 
                                                            style={{ strokeWidth: 1, stroke: deptcolor, fill: deptcolor, zIndex: -1 }}
                                                            ></rect>

                                                        {(shelf.planogramProduct?shelf.planogramProduct.map((rect, x) => {
                                                            return <g key={x}>{(rect.isDelete === false?<>{rect.productBlock.map((subrect, z) => {
                                                                return (subrect.isDelete === false?subrect.productLocations.map((locrect, n) => {
                                                                    let cintrlprod = this.state.currentInternalDraggableProd;

                                                                    // let cblkobj = (this.state.isBlockMove && cintrlprod && cintrlprod.fieldidx === fidx && cintrlprod.shelveidx === i?cintrlprod.prod.productBlock[cintrlprod.blockidx]:null);
                                                                    let cintrlprodloc = (cintrlprod && cintrlprod.fieldidx === fidx && cintrlprod.shelveidx === i && Object.keys(cintrlprod).length > 0 && cintrlprod.prod?cintrlprod.prod.productBlock[cintrlprod.blockidx].productLocations[cintrlprod.locidx]:null);

                                                                    // let cblkcolor = (cblkobj && Object.keys(cblkobj).length > 0 && cblkobj.id === subrect.id?true:false);
                                                                    let cimgcolor = (cintrlprod && Object.keys(cintrlprod).length > 0 && (locrect.id?locrect.id:"-") === (cintrlprodloc && cintrlprodloc.id !== undefined?cintrlprodloc.id:""));

                                                                    let isEffectingProduct = dropEffectingProds.findIndex(effectprod => effectprod.id === locrect.id);

                                                                    if(proposeHighlightProd && proposeHighlightProd.fieldIdx === fidx && proposeHighlightProd.itemId === rect.productInfo.id){
                                                                        isEffectingProduct = 0;
                                                                    }

                                                                    return (locrect.isDelete === false?<g key={n}>
                                                                        {this.props.showFullScreenEditView?
                                                                            <FullRenderProdImage 
                                                                                prodObj={locrect} 
                                                                                prodInfo={rect.productInfo} 
                                                                                filterlistcolor={cimgcolor}
                                                                                handleLoadedProdCount={this.handleLoadedProdCount}
                                                                                viewProdOnClock={this.viewProdOnClock}
                                                                                />
                                                                        :
                                                                            <image pointerEvents="all" preserveAspectRatio="none" x={locrect.x} y={locrect.y} width={locrect.drawWidth} height={locrect.drawHeight} href={rect.productInfo.imageUrl} key={n} ref={(r) => this["LR"+subrect.id+locrect.id] = r} draggable={false}
                                                                            style={{outlineColor:(cimgcolor?"#28a745":"#ccc"), opacity: (locrect.overLappingDto && !locrect.overLappingDto.isDelete?0.6:1)}} 
                                                                            onMouseDown={(e) => this.SingleProductDragStart(e, rect, fidx, i, x, z, n, locrect)} />
                                                                        }
                                                    
                                                                        {cimgcolor?<rect x={locrect.x} y={locrect.y} onMouseDown={(e) => this.SingleProductDragStart(e, rect, fidx, i, x, z, n, locrect)} width={locrect.drawWidth} height={locrect.drawHeight} fill={"#28a745"} fillOpacity={0.4} />:<></>}
                                                                    
                                                                        {/* {locrect.showRecWarning?<image href={warningImage} x={((locrect.x + locrect.drawHeight) - 20)} y={(locrect.y - 5)} width={15} height={15} />:<></>} */}

                                                                        {isEffectingProduct > -1?<rect width={locrect.drawWidth} height={locrect.drawHeight} x={locrect.x} y={locrect.y} fill='red' fillOpacity={0.6}></rect>:<></>}

                                                                    </g>:<React.Fragment key={n}></React.Fragment>);

                                                                }):<React.Fragment key={z}></React.Fragment>);
                                                            })}

                                                            </>:<></>)}</g>;
                                                        }) : (<></>))}

                                                        {(shelf.planogramProduct?shelf.planogramProduct.map((rect, x) => {
                                                            return <g key={x}>{(rect.isDelete === false?<>{rect.productBlock.map((subrect, z) => {
                                                                return (subrect.isDelete === false?subrect.productLocations.map((locrect, n) => {
                                                                    
                                                                    //snapshot highlight
                                                                    let filterLevel = this.props.filterLevel;
                                                                    let snapHighList = this.props.hightlightSnapShotList;
                                                                    
                                                                    let isSnapHightlight = (
                                                                        filterLevel === "CAT"?snapHighList.categories.find(x => 
                                                                            (x.categoryId === rect.categoryLevel.categoryId && ((!x.isRule && !rect.categoryLevel.isRule) || (x.isRule && rect.categoryLevel.isRule && x.ruleType === rect.categoryLevel.ruleType)))
                                                                        ):
                                                                        filterLevel === "SCAT"?snapHighList.subcategories.find(x => 
                                                                            (x.categoryId === rect.categoryLevel.categoryId && ((!x.isCatRule && !rect.categoryLevel.isRule) || (x.isCatRule && rect.categoryLevel.isRule && x.catRuleType === rect.categoryLevel.ruleType))) && 
                                                                            (x.subcategoryId === rect.subcategoryLevel.subcategoryId && ((!x.isRule && !rect.subcategoryLevel.isRule) || (x.isRule && rect.subcategoryLevel.isRule && x.ruleType === rect.subcategoryLevel.ruleType)))
                                                                        ):
                                                                        snapHighList.brands.find(x => 
                                                                            (x.categoryId === rect.categoryLevel.categoryId && ((!x.isCatRule && !rect.categoryLevel.isRule) || (x.isCatRule && rect.categoryLevel.isRule && x.catRuleType === rect.categoryLevel.ruleType))) &&  
                                                                            (x.subcategoryId === rect.subcategoryLevel.subcategoryId && ((!x.isScatRule && !rect.subcategoryLevel.isRule) || (x.isScatRule && rect.subcategoryLevel.isRule && x.scatRuleType === rect.subcategoryLevel.ruleType))) && 
                                                                            (x.brandId === rect.brandLevel.brandId)
                                                                        )
                                                                    );

                                                                    return (locrect.isDelete === false?<g key={n}>
                                                                        {isSnapHightlight && locrect.isbottom?<rect width={locrect.drawWidth} height={shelf.drawHeight} x={locrect.x} y={shelf.y} fill={isSnapHightlight.color} fillOpacity={0.6}></rect>:<></>}
                                                                    </g>:<React.Fragment key={n}></React.Fragment>);

                                                                }):<React.Fragment key={z}></React.Fragment>);
                                                            })}

                                                            </>:<></>)}</g>;
                                                        }) : (<></>))}

                                                        {/* {this._isshowoverlayshelf && this.props.currentDraggableProd?
                                                            <rect className="sftrect" width={shelf.drawWidth} height={(shelf.drawHeight + shelf.drawGap)} x={shelf.x} y={shelf.y}
                                                            onDragOver={(e) => this.dragEnd(e, shelf, this[(fidx+""+i)],false,null,true, i, fitem, fidx)} 
                                                            onDragLeave={(e)=> this.dragClear(e, shelf, this[(fidx+""+i)])}
                                                            onDrop={(e) => this.droppedNew(e, shelf, this[(fidx+""+i)], i, false, fitem, fidx)}
                                                            style={{ strokeWidth: 1, stroke: deptcolor, fill: 'transparent', zIndex: -1 }}
                                                            />
                                                        :<></>} */}

                                                        {visibleProdIndicators?<>
                                                            {shelf.deptWarnList && shelf.deptWarnList.length > 0?<>
                                                                {shelf.deptWarnList.map((deptwarn, deptwarnidx) => {
                                                                    return <image key={deptwarnidx} href={warningImage} title={this.props.t("DEPT_WARN_PRODUCT")} x={((deptwarn.x + deptwarn.drawHeight) - 20)} y={(deptwarn.y - 5)} width={15} height={15} />;
                                                                })}
                                                            </>:<></>}

                                                            {shelf.recWarnList && shelf.recWarnList.length > 0?<>
                                                                {shelf.recWarnList.map((recwarn, recwarnidx) => {
                                                                    return <image key={recwarnidx} href={warningImageRed} title={this.props.t("RECTPER_WARN_PRODUCT")} x={((recwarn.x + recwarn.drawHeight) - 16)} y={(recwarn.y - 5)} width={15} height={15} />;
                                                                })}
                                                            </>:<></>}
                                                        </>:<></>}

                                                        {this.props.isContentDragging?<rect className="sftrect" width={shelf.drawWidth} height={shelf.drawHeight} x={shelf.x} y={shelf.y} id={i} ref={(r) => this[(fidx+""+i)] = r}
                                                            onDragOver={(e) => this.dragEnd(e, shelf, this[(fidx+""+i)],false,null,true, i, fitem, fidx)} 
                                                            onDragLeave={(e)=> this.dragClear(e, shelf, this[(fidx+""+i)])}
                                                            onDrop={(e) => this.droppedNew(e, shelf, this[(fidx+""+i)], i, false, fitem, fidx)}
                                                            style={{ strokeWidth: 1, stroke: deptcolor, fill: 'transparent', zIndex: -1 }}
                                                            />:<></>}

                                                    </>:<></>}
                                                </g>) : (<></>))}

                                                {/* {fitem.startX !== undefined && ((fidx + 1) < showobj.fieldsList.length)?<rect x={((fitem.startX + fitem.drawWidth) - 2)} y={0} width={2} height={fitem.drawHeight} fill={(this.props.dmode?'#2CC990':'#5128a0')} />:<></>} */}

                                            </React.Fragment>;
                                        })}
                                    </>:<></>}

                                    {showobj && showobj.fieldsList.length > 0?<>
                                        {showobj.fieldsList.map((fitem, fidx) => {
                                            let deptcolor = (fitem.department?fitem.department.color:"rgb(81, 40, 160)");
                                            let rightSideField = fitem.rightSidePlanogramFieldDto;
                                            
                                            return <React.Fragment key={fidx}>
                                                {!this.props.showFullScreenEditView && rightSideField?<>

                                                    {fitem.planogramShelfDto?fitem.planogramShelfDto.map((shelf, i) => {
                                                        return <g key={i}>{shelf.drawWidth > 0?<>
                                                            <rect width={2} height={shelf.drawHeight} x={((shelf.x + shelf.drawWidth) - 2)} y={shelf.y} 
                                                            style={{ strokeWidth: 1, stroke: (!shelf.overlappingAllow?"red":deptcolor), fill: 'transparent', zIndex: -1 }}
                                                            />

                                                            <rect width={5} height={shelf.drawGap} x={((shelf.x + shelf.drawWidth) - 5)} y={shelf.y+(shelf.drawHeight?shelf.drawHeight:0)} 
                                                            style={{ strokeWidth: 1, stroke: (!shelf.overlappingAllow?"red":deptcolor), fill: (!shelf.overlappingAllow?"red":deptcolor), zIndex: -1 }}
                                                            ></rect>
                                                        </>:<></>}
                                                        </g>
                                                    }):<></>}

                                                    {rightSideField.planogramShelfDto?rightSideField.planogramShelfDto.map((shelf, i) => {
                                                        let rightDeptColor = (rightSideField?(!shelf.overlappingAllow?"red":rightSideField.department?rightSideField.department.color:""):"");

                                                        return <g key={i}>{shelf.drawHeight > 0}
                                                            <rect width={1} height={shelf.drawHeight} x={shelf.x} y={shelf.y} 
                                                            style={{ strokeWidth: 1, stroke: rightDeptColor, fill: 'transparent', zIndex: -1 }}
                                                            />

                                                            <rect width={5} height={shelf.drawGap} x={shelf.x} y={shelf.y+(shelf.drawHeight?shelf.drawHeight:0)} 
                                                            style={{ strokeWidth: 1, stroke: (rightDeptColor), fill: rightDeptColor, zIndex: -1 }}
                                                            ></rect>
                                                        </g>
                                                    }):<></>}
                                                </>:<></>}

                                            </React.Fragment>;
                                        })}
                                    </>:<></>}
                                    
                                    {/* dash rectangle */}
                                    {/* {this.state.isshowdash?<rect x={0} y={0} width={this.state.viewWidth} height={this.state.viewHeight} fill='#fff' fillOpacity={0.1} ></rect>:<></>} */}

                                    <rect ref={this.dashrectRef} x={this.dashrect.x} y={this.dashrect.y} width={this.dashrect.width} height={this.dashrect.height} fill="none" stroke="green" strokeDasharray={[2,2]} visibility={this.state.isshowdash?"visible":"hidden"} strokeWidth={2}></rect>
                                    
                                    {(this.state.isBlockMove && this.state.currentSelectedBlock)?<>
                                        <BlockRectangle 
                                            allowovrflwprod={this.state.allowovrflwprod}
                                            checkSaftyMargin={this.state.checkSaftyMargin} 
                                            saveObj={showobj} 
                                            isblockmove={this.state.isBlockMove} 
                                            isFirstTimeDrawguid={this.state.isFirstTimeDrawguid}
                                            isStackableEnabled={isStackableEnabled}
                                            handleRDChanges={this.props.handleRDChanges}
                                            displayratio={this.state.displayRatio} 
                                            displayuom={this.state.displayUOM} 
                                            currentSelectedBlock={this.state.currentSelectedBlock} 
                                            saftyMargin={this.state.saftyMargin}
                                            zoomXRatio={this.state.zoomDrawX}
                                            setPreviewGuid={this.setPreviewGuid}
                                            handleBlockContextMenu={this.handleBlockContextMenu}
                                            fieldHistoryAdd={this.props.fieldHistoryAdd} 
                                            updateCutList={this.updateCutList} 
                                            updateProductList={this.updateProductList} 
                                            updateSaveObjChild={this.updateSaveObjChild} 
                                            />
                                    </>:<></>}

                                    {(this.state.activetool === "pantool" && this.state.zoompanactive && this.state.startpan)?<rect x={0} y={0}  width={this.state.viewWidth} height={this.state.viewHeight} fill={(this.props.dmode?'#2CC990':'#5128a0')} fillOpacity={0.15} />:<></>}
                                </svg>
                            </Col>
                        </Col>:
                        <Col className='drawview-wrapper rl-view' onContextMenu={e => e.preventDefault()}>
                            {!this.props.showFullScreenEditView?<>
                                {this.state.leftRightObj?<ul className='list-inline fieldnavigation-controllers'>
                                    <li className={'list-inline-item'+(!this.state.leftRightObj.left?" d-none":"")} onClick={() => this.handleChangeLeftRightField("left", this.state.leftRightObj.left)}><FeatherIcon icon="chevron-left" size={26}/></li>
                                    <li className={'list-inline-item'+(!this.state.leftRightObj.right?" d-none":"")} onClick={() => this.handleChangeLeftRightField("right", this.state.leftRightObj.right)}><FeatherIcon icon="chevron-right" size={26}/></li>
                                </ul>:<></>}
                            </>:<></>}
                            
                            <Col xs={12} id="activedrawsvg-wrapper" className={"NDUrowStructuredraw"} dir="ltr" ref={this.actdisplaydiv} onScroll={this.removeExpandOpts}>
                                <svg id="ac-mainsvg-view" className={"rlgram-view"+(this.state.zoompanactive?" svgzoom-action":"")} 
                                    viewBox={'0 0 '+this.state.aviewWidth+' '+this.state.aviewHeight} 
                                    width={(!this.state.zoompanactive?this.state.aviewWidth:"100%")} 
                                    /* height={this.state.aviewHeight} */ 
                                    style={{ display:"block",margin:"auto" }}  
                                    onMouseDown={e => this.handleToolControls("panstart", e, true)} 
                                    onMouseUp={e => this.handleToolControls("panstart", e, false)} 
                                    onMouseMove={e => this.handleToolControls("pan", e)} 
                                    >

                                    {activeViewObj && activeViewObj.fieldsList.length > 0?<>
                                        {activeViewObj.fieldsList.map((fitem, fidx) => {

                                            let deptname = (fitem && fitem.department?fitem.department.name:"-");
                                            let deptcolor = (fitem && fitem.department?fitem.department.color:"rgb(81, 40, 160)");
                                            let depttxtcolor = (checkColorIsLight(deptcolor)?"#5128a0":"white");
                                            
                                            return <React.Fragment key={fidx}>
                                                {fitem?<>
                                                    {/* <rect x={fitem.startX} y={fitem.startY} width={fitem.drawWidth} height={fitem.drawHeight} strokeWidth={4} stroke={deptcolor} fill="none" /> */}

                                                    <clipPath id={("clip-"+fidx+"-nfield")}>
                                                        <rect x={(fitem.startX > 0?fitem.startX:0)} y={(fitem.startY > 0?(fitem.startY - 20):0)} width={fitem.drawWidth} height={20} />
                                                    </clipPath>

                                                    <g clipPath={"url(#clip-"+fidx+"-nfield)"} >
                                                        <rect  width={((10 * deptname.length)+15)} height={20} x={(fitem.startX > 0?fitem.startX:0)} y={(fitem.startY > 0?(fitem.startY - 20):0)} fill={deptcolor} />
                                                        <text fill={depttxtcolor} x={(fitem.startX > 0?fitem.startX:0)+8 } y={(fitem.startY > 0?(fitem.startY - 20):0)+15} className="small">{fitem.noInFloorLayout+" - "+deptname}</text>
                                                    </g>

                                                    {(fitem.planogramShelfDto?fitem.planogramShelfDto.map((shelf, i) => <g key={i} className={"shelve-"+shelf.id}>
                                                        {shelf.isDelete === false?<>
                                                            {(fidx === 0 && shelf.overLappingDto?shelf.overLappingDto.map((rect, x) => {
                                                                return <g key={x}><image pointerEvents="all" preserveAspectRatio="none" href={rect.productDto.imageUrl} x={rect.x} y={rect.y} width={rect.drawWidth} height={rect.drawHeight} style={{opacity:"0.4"}} />
                                                                <rect x={rect.x} y={rect.y} width={rect.drawWidth} height={rect.drawHeight} fill="#B8B5FF" fillOpacity="0.5"></rect></g>;
                                                            }):<></>)}

                                                            <rect className="sftrect" width={shelf.drawWidth} height={shelf.drawHeight} x={shelf.x} y={shelf.y} id={i} ref={(r) => this[i] = r}
                                                                style={{ strokeWidth: 1, stroke: deptcolor, fill: 'transparent', zIndex: -1 }}
                                                                />

                                                            <rect width={shelf.drawWidth} height={shelf.drawGap} x={shelf.x} y={shelf.y+(shelf.drawHeight?shelf.drawHeight:0)} 
                                                                style={{ strokeWidth: 1, stroke: deptcolor, fill: deptcolor, zIndex: -1 }}
                                                                ></rect>

                                                            {(shelf.planogramProduct?shelf.planogramProduct.map((rect, x) => {
                                                                return <g key={x}>{(rect.isDelete === false?rect.productBlock.map((subrect, z) => {
                                                                    return (subrect.isDelete === false?subrect.productLocations.map((locrect, n) => {
                                                                        let filterlistcolor = (this.state.filterRevenueList&&this.state.filterRevenueList.length>0?(this.state.filterRevenueList.filter(l => l.id === rect.productInfo.id).length>0):false);
                                                                        let isProdFiltered = this.props.filterRevenueList.find(filteritem => filteritem.id === rect.productInfo.id);
                                                                        
                                                                        return (locrect.isDelete === false?<g key={n}>
                                                                            {this.props.showFullScreenEditView?
                                                                                <FullRenderProdImage 
                                                                                    prodObj={locrect} 
                                                                                    prodInfo={rect.productInfo} 
                                                                                    filterlistcolor={filterlistcolor}
                                                                                    handleLoadedProdCount={this.handleLoadedProdCount}
                                                                                    viewProdOnClock={this.viewProdOnClock} 
                                                                                    />
                                                                            :
                                                                                <image pointerEvents="all" preserveAspectRatio="none" x={locrect.x} y={locrect.y} width={locrect.drawWidth} height={locrect.drawHeight} href={rect.productInfo.imageUrl}
                                                                                onMouseDown={(e) => this.viewProdOnClock(e, rect.productInfo)} style={{outlineColor:(filterlistcolor?"#dc3545":"#ccc")}} />
                                                                            }

                                                                            {isProdFiltered?<rect x={locrect.x} y={locrect.y} width={locrect.drawWidth} height={locrect.drawHeight} fill="#77db61" fillOpacity={0.6} />:<></>}
                                                                        </g>:<rect key={n} />);

                                                                    }):<rect key={z} />);
                                                                }):<></>)}</g>;
                                                            }) : (<></>))}
                                                        </>:<></>}
                                                    </g>) : (<></>))}

                                                    {/* <clipPath id={("clip-"+fidx+"-nfield")}>
                                                        <rect x={(fitem.startX > 0?fitem.startX:0)} y={(fitem.startY > 0?fitem.startY:0)} width={fitem.drawWidth} height={20} />
                                                    </clipPath>

                                                    <g clipPath={"url(#clip-"+fidx+"-nfield)"} >
                                                        <rect  width={75} height={20} x={(fitem.startX > 0?fitem.startX:0)} y={(fitem.startY > 0?fitem.startY:0)} fill={deptcolor} />
                                                        <text fill={depttxtcolor} x={(fitem.startX > 0?fitem.startX:0)+5 } y={(fitem.startY > 0?fitem.startY:0)+13} className="small">{stringtrim(deptname,10)}</text>
                                                    </g> */}

                                                    {/* {fitem.startX !== undefined && ((fidx + 1) < showobj.fieldsList.length)?<rect x={((fitem.startX + fitem.drawWidth) - 2)} y={0} width={2} height={fitem.drawHeight} fill={(this.props.dmode?'#2CC990':'#5128a0')} />:<></>} */}
                                                </>:<></>}
                                                

                                            </React.Fragment>;
                                        })}
                                    </>:<></>}

                                    {(this.state.activetool === "pantool" && this.state.zoompanactive && this.state.startpan)?<rect x={0} y={0}  width={this.state.aviewWidth} height={this.state.aviewHeight} fill={(this.props.dmode?'#2CC990':'#5128a0')} fillOpacity={0.15} />:<></>}
                                </svg>
                            </Col>
                        </Col>
                        }
                    </Row>
                </>:<></>}
            </Col>

            <canvas id="pgexport-canvas" style={{display: "none"}}></canvas>

            {this.state.isPrintInProcess?<Col style={{background:"#f0f0f0", width:"100%", position:"fixed", top:"0px", left:"0px", height:"100%", zIndex: "9"}}></Col>:<></>}

            {this.props.isFullScreenMode?
                <PrintCoverPageView 
                    t={this.props.t} isRTL={this.props.isRTL}
                    mainid="pgexportprint-wrapper"
                    subid="pgexportprint-cover"
                    isShowRLView={isShowRLView}
                    selStoreName={this.props.selStoreName} 
                    userDetails={this.props.userDetails}
                    viewObj={this.state.viewObj}
                    activeViewObj={this.state.activeViewObj} 
                    selectedPrintDept={this.props.selectedPrintDept}
                    />
            :<></>}
             
            <Modal className="contimplement-modal pgPrintDeptsModal" show={this.state.isShowPrintDeptModal} centered onHide={()=>this.togglePrintDeptModal()}>
                <Modal.Body>
                    <div className='closebtn' onClick={() => this.togglePrintDeptModal()}><XIcon size={30} /></div>

                    <h3 className='issue-header'>{this.props.t("PRINT_PGDEPARTMENTS")}</h3>

                    <h5>{this.props.t("PLEASE_SELECT_A_DEPTTO_CONTINUE")}</h5>

                    <Col>
                        <Form.Control as={"select"} value={this.state.selectedDept} onChange={e => this.updateSelectDept(e)}>
                            {viewDeptList.map((fielddept, fielddeptidx) => {
                                return <option value={fielddeptidx} key={fielddeptidx}>{fielddept.name}</option>
                            })}
                        </Form.Control>
                    </Col>
                </Modal.Body>
                <Modal.Footer style={{display:"initial", textAlign:"right"}}>
                    <Button type="button" variant="secondary" size="sm" className={(this.props.isRTL==="rtl"?"float-left":"float-right")} onClick={() => this.togglePrintDeptModal()} style={{borderRadius:"15px"}}>{this.props.t('btnnames.close')}</Button>
                    <Button type="button" variant="primary" size="sm" className={(this.props.isRTL==="rtl"?"float-left":"float-right")} onClick={() => this.conitinuePrintDept()} style={{borderRadius:"15px"}}>{this.props.t('continue_btn')}</Button>
                </Modal.Footer>
            </Modal>

            <Modal size="sm" className='share-emailmodal' dir={this.props.isRTL} show={this.state.shareModalShow} centered onHide={this.toggleShareEmailModal}>
                <Modal.Header>
                    <Modal.Title>{this.props.t('SHARE_PGDEPARTMENTS')}</Modal.Title>
                </Modal.Header>

                <Modal.Body>
                    <Form.Group>
                        <Form.Label>{this.props.t("formfield.email")}</Form.Label>
                        <Form.Control type="text" onChange={(e) => this.props.handleChangeShareEmail(e)} value={this.props.shareEmail} />
                    </Form.Group>
                </Modal.Body>
                <Modal.Footer>
                    <Button size="sm" variant="primary" onClick={this.shareEmailContinue}>{this.props.t('SHARE')}</Button>
                    <Button size="sm" variant="light" onClick={this.toggleShareEmailModal}>{this.props.t('btnnames.close')}</Button>
                </Modal.Footer>
            </Modal>

            {this.state.isShowOverflowModal?<OverlapSaftyView 
                isRTL={this.props.isRTL}
                isShowOverflowModal={this.state.isShowOverflowModal}
                overlapFieldObj={this.state.overlapFieldObj}
                overlapFieldIdx={this.state.overlapFieldIdx}
                trans={this.props.t} 
                displayuom={this.state.displayUOM}
                saveobj={showobj} 
                handlechangesafty={this.handleChangeOverlapSafty}
                toggleOverflowModal={this.toggleOverflowModal}
                />
            :<></>}
        </>;
    }
}