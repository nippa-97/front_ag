import React, { Component } from 'react';
import { Col, Button } from 'react-bootstrap'; //, Button, ButtonGroup
import FeatherIcon from 'feather-icons-react';
import { v4 as uuidv4 } from 'uuid'; //unique id

import './MPDrawing.css';

import { measureConverter, roundOffDecimal, findBrowserType } from '../../../../../_services/common.service'; //AspectRatioDrawBox, 

import { Rect, ContextMenu } from '../../../D3Comps';
import { checkDrawRectInShelve, checkSnapAllow, getRectPercentage, DrawViewClipboard, getNameorIdorColorofBox } from '../../../AddMethods'; //
import { checkThroughProductsTest } from '../../../../planograms/planDisplayUnit/additionalcontents';
import { alertService } from '../../../../../_services/alert.service';
import { ghostOnDrag, removeGhostImage } from '../../../../common_layouts/ghostDragWrapper';

import MPToolBox from './ToolBox';

export default class MPDrawing extends Component {
    constructor(props){
        super(props);

        this._isMounted = false;
        this.displaydiv = React.createRef(); //main preview div
        this.dragPreviewCanvas = React.createRef(); //drag preview canvas
        this.oriPageXY = {isfirefox: false, x: 0, y: 0};

        this.state = {
            newrectstart: null,
            // isviewcmenu: false, contxtmenu: {xpos:0, ypos: 0, xidx: 0},
            isshowdash: false, dashrect: { startx:0, starty: 0, x: 0, y: 0, width: 0, height: 0, percentage: 0, pointerX: 0, pointerY: 0 },
            selectedCategory: {},  selectedCatRect: {},
            viewfieldobj: null,
            newCatView: { width: 200, height: 305, x: "100%", y: 0}, 
            divWidth: 0, divHeight: 0, displayUOM: "cm", displayRatio: 0,
            svgwidth: "100%", svgheight: 300,
            //rect draw
            isAllowPan: false, zoomDrawX: 0,
            isviewcmenu: false, contxtmenu: {xpos:0, ypos: 0, xidx: 0, scatidx: 0},
            //cut boxes
            isShowClipboard: false, cutDragEnabled: false, isAllowCutDrop: false,
            selectedCutItem: null, cutItemIdx: 0, droppedLocation: null,
        }
    }

    componentDidMount() {
        this._isMounted = true;

        if (this._isMounted) {
            let crescount = this.props.showResolutionCount;
            this.setState({ svgheight: (crescount === 4?540:crescount === 3?240:crescount > 1?340:300) }, () => {
                this.setState({
                    divWidth: (this.displaydiv.current && this.displaydiv.current.offsetWidth?(this.displaydiv.current.offsetWidth - 10):0),
                    divHeight: (this.displaydiv.current && this.displaydiv.current.offsetHeight?(this.displaydiv.current.offsetHeight):0),
    
                    selectedCategory: (this.props.selectedCategory?this.props.selectedCategory:{}),
                    selectedCatRect: (this.props.selectedCatRect?this.props.selectedCatRect:{}),
                }, () => {
                    this.props.updateDivDetails(this.state.divWidth, this.state.divHeight);
                    this.setState({
                        viewfieldobj: (this.props.selectedCategory && this.props.selectedCategory.field_obj?this.calcFieldObject(this.props.selectedCategory.field_obj,0):null)
                    }, () => {
                        //console.log(this.state.viewfieldobj);
                    });
                });
            });
            
            //handle keydown - arrows key actions
            document.addEventListener("keydown", this.typingKeyHandling, false);

            //if firefox 
            if(findBrowserType() === "firefox"){
                document.addEventListener("dragover", this.getPageXYCords, false);
            }
        }
    }

    componentWillUnmount(){
        this._isMounted = false;
        document.removeEventListener("dragover", this.getPageXYCords, false);
        document.removeEventListener("keydown", this.typingKeyHandling, false);
    }
    //get pagexy cords
    getPageXYCords = (evt) => {
        this.oriPageXY = {isfirefox: true, x: evt.clientX, y: evt.clientY};
    }
    //load ghost from parent
    ghostFromParent = (evt, viewobj) => {
        ghostOnDrag(evt, viewobj, this.oriPageXY);
    }

    //shortcuts and arrow key handlers
    typingKeyHandling = (evt) => {
        var ecode = evt.keyCode; //current key code

        if(evt.ctrlKey && ecode === 68) { //ctrl + d - enables draw tool
            evt.preventDefault();
            this.props.changeDrawType("subc");
            
        } else if(evt.ctrlKey && ecode === 77) { //ctrl + m - enables move tool
            evt.preventDefault();
            this.props.changeTool("pan")
            
        } else if(evt.ctrlKey && ecode === 221) { //ctrl + + - enables zoom-in
            evt.preventDefault();

            this.handleZoomInOut(true);
            
        } else if(evt.ctrlKey && ecode === 219) { //ctrl + - - enables zoom-out
            evt.preventDefault();

            this.handleZoomInOut(false);
            
        } else if(evt.ctrlKey && ecode === 90) { //ctrl + z - enables undo
            evt.preventDefault();

            if(this.props.historyData && this.props.historyData.past.length > 0){
                this.props.handleUndoRedo("undo");
            }
            
        } else if(evt.ctrlKey && ecode === 89) { //ctrl + y - enables redo
            evt.preventDefault();
            
            if(this.props.historyData && this.props.historyData.future.length > 0){
                this.props.handleUndoRedo("redo");
            }
        }
    }

    startNewRect = (e) => {
        if(this.props.activeTool === "draw"){
            if(this.props.selectedDraw){
                if(this.props.isEnableDraw && e.nativeEvent.which === 1){ //only left mouse click
                    let newoffx = e.nativeEvent.offsetX;
                    let newoffy = e.nativeEvent.offsetY;

                    //let svg = document.getElementById('mainsvg-view');
                    //let viewBox = svg.viewBox.baseVal;
                    
                    //if(this.state.divWidth > viewBox.width){
                        /* newoffx = (newoffx - (viewBox.x + (viewBox.width / 2)));
                        newoffy = (newoffy - (viewBox.y + (viewBox.height / 2))); */
                        
                        let normalize_pointer = this.getScreenPointer(e);

                        //console.log("normalizeX, normalizeY = ", normalize_pointer.x,  normalize_pointer.y);
                        newoffx = normalize_pointer.x;
                        newoffy = normalize_pointer.y;
                    //}

                    this.setState({
                        newrectstart: {x: newoffx, y:newoffy},
                        isshowdash: true, dashrect: { startx: newoffx, starty: newoffy, x: newoffx, y:newoffy, width: 0, height: 0, percentage: 0, pointerX: 0, pointerY: 0 }
                    });
                }
            } else{
                alertService.error(this.props.t("notselectedbrand"));
            }    
        } else if(this.props.activeTool === "pan"){
            this.setState({ isAllowPan: true });
        }
    }
    //get new x point
    getScreenPointer = (e) => {
        let svg = document.getElementById('mainsvg-view');
        let point = svg.createSVGPoint();
        point.x = e.nativeEvent.clientX;
        point.y = e.nativeEvent.clientY;
        let target = e.target;
        let ctm = target.getScreenCTM();

        return point.matrixTransform(ctm.inverse());
    }

    changeDashRect = (e) => {
        if (this.props.isEnableDraw && this.state.isshowdash) {
            var cobj = this.state.dashrect;
            let normalize_pointer = this.getScreenPointer(e);

            cobj["pointerX"] = normalize_pointer.x;
            cobj["pointerY"] = normalize_pointer.y;

            cobj["x"] = (cobj.startx < normalize_pointer.x?cobj.x:normalize_pointer.x);
            cobj["y"] = (cobj.starty < normalize_pointer.y?cobj.y:normalize_pointer.y);
            
            let boxwidth = (cobj.startx < normalize_pointer.x?Math.abs(normalize_pointer.x - cobj.startx):Math.abs(cobj.startx - normalize_pointer.x));
            cobj["width"] = boxwidth;

            let boxheight = (cobj.starty < normalize_pointer.y?Math.abs(normalize_pointer.y - cobj.starty):Math.abs(cobj.starty - normalize_pointer.y));
            cobj["height"] = boxheight;

            let creactlist = JSON.parse(JSON.stringify(this.props.rectsets));
            let selectedscat = this.props.selectedSubCat;
            let cselectedcat = creactlist.findIndex(x => (x.id === selectedscat.id));

            let crectidx = -1;
            for (let l = 0; l < creactlist[cselectedcat].rects.length; l++) {
                const rectitem = creactlist[cselectedcat].rects[l];
                
                if(!rectitem.isDelete){
                    let cbrandidx = rectitem.brands.findIndex(z => (z.id === this.props.selectedDraw.id) && !z.isDelete);
                    if(cbrandidx > -1){
                        crectidx = l;
                        break;
                    }  
                }
            }

            let totalrectwidth = 0;
            for (let l = 0; l < creactlist[cselectedcat].rects.length; l++) {
                const srectitem = creactlist[cselectedcat].rects[l];
                
                if(!srectitem.isDelete){
                    totalrectwidth = (totalrectwidth + (srectitem.width * srectitem.contain_shelves.length));
                }
            }

            let parentsub = creactlist[cselectedcat].rects[crectidx];
            let returnobj = checkDrawRectInShelve(this.state.viewfieldobj, parentsub, this.state.divWidth, true, cobj);
            
            let snappingobj = checkSnapAllow(returnobj, this.state.divWidth, false, parentsub.brands, parentsub);
            
            if(snappingobj){
                returnobj.x = roundOffDecimal(snappingobj.x,2);
                returnobj.width = roundOffDecimal(snappingobj.width,2);
            }

            let returnper = getRectPercentage(returnobj, totalrectwidth, parentsub, true);
            cobj["percentage"] = returnper.percentage;
            
            this.setState({ dashrect: cobj });

        } else if(this.props.activeTool === "pan"){
            this.handlePanView(e);
        }
    }
    drawNewRect=(e, iscutitem)=>{
        let seletedcutobj = this.state.selectedCutItem;
        let selectedscat = this.props.selectedSubCat;
        
        //console.log(this.props.activeTool,this.props.selectedDraw);
        if(iscutitem || (this.props.activeTool === "draw" && this.props.selectedDraw)){
            let newdroplocation = this.getScreenPointer(e);
            let creactlist = JSON.parse(JSON.stringify(this.props.rectsets));
            //find main sub category
            let cselectedcat = (iscutitem?seletedcutobj.scatidx:creactlist.findIndex(x => (x.id === selectedscat.id)));
            if(iscutitem && !creactlist[cselectedcat]){
                cselectedcat = -1;
            }

            let crectidx = -1; let cbrandidx = -1;
            let returnobj = false;
            let cutlist = JSON.parse(JSON.stringify(this.props.cutBoxList));
            
            //if sub cat available and draw enabled
            if(cselectedcat > -1 && (iscutitem || (this.props.isEnableDraw && e.nativeEvent.which === 1))){ //only left mouse click
                var newrectstart = this.state.newrectstart; //dash rect start values

                let normalize_pointer = (iscutitem?newdroplocation:this.getScreenPointer(e));
                var newrectend = {x: normalize_pointer.x, y:normalize_pointer.y}; //dash rect end values
                
                if(!iscutitem){
                    for (let l = 0; l < creactlist[cselectedcat].rects.length; l++) {
                        const rectitem = creactlist[cselectedcat].rects[l];
                        
                        if(!rectitem.isDelete){
                            cbrandidx = rectitem.brands.findIndex(z => (z.id === this.props.selectedDraw.id) && !z.isDelete);
                            if(cbrandidx > -1){
                                crectidx = l;
                                break;
                            }  
                        }
                    }
                } else{
                    crectidx = seletedcutobj.rectidx;
                    cbrandidx = seletedcutobj.xidx;
                }
                
                //select brand object
                let parentsub = creactlist[cselectedcat].rects[crectidx];
                //var rectobj = JSON.parse(JSON.stringify(parentsub.brands[cbrandidx]));

                var newbrandrect = { 
                    id: uuidv4(), isNew: true, isDelete: false, 
                    x: 0, width: 0,
                    contain_shelves: [], isSnapped: false, 
                    box_width_percentage: 0, 
                };
                //view sizes
                if(iscutitem){
                    newbrandrect = seletedcutobj.brectitem;
                    newbrandrect.id = uuidv4();
                    newbrandrect.isNew = true;
                    newbrandrect.isDelete = false;
                    newbrandrect.contain_shelves = [];
                }

                //if dash rect start/end values not matching
                let isallowchangetool = true;
                if(iscutitem || (newrectstart && newrectstart.x !== newrectend.x && newrectstart.y !== newrectend.y)){
                    if(!iscutitem){
                        newbrandrect.x = roundOffDecimal((newrectstart.x < newrectend.x?newrectstart.x:newrectend.x),2);
                        newbrandrect.y = roundOffDecimal((newrectstart.y < newrectend.y?newrectstart.y:newrectend.y),2);
                        newbrandrect.width = roundOffDecimal((newrectstart.x < newrectend.x?(newrectend.x-newrectstart.x):(newrectstart.x-newrectend.x)),2);
                        newbrandrect.height = roundOffDecimal((newrectstart.y < newrectend.y?(newrectend.y-newrectstart.y):(newrectstart.y-newrectend.y)),2);
                    } else{
                        newbrandrect.x = roundOffDecimal(normalize_pointer.x,2);
                        newbrandrect.y = roundOffDecimal(normalize_pointer.y,2);
                    }
                    let srectx1 = roundOffDecimal(newbrandrect.x,2);
                    let srecty1 = roundOffDecimal(newbrandrect.y,2);
                    let srectx2 = roundOffDecimal((newbrandrect.x + newbrandrect.width),2);
                    let srecty2 = roundOffDecimal((newbrandrect.y + newbrandrect.height),2);
                    
                    //validate overlapping
                    let isoverlapping = false;
                    let cviewrect = creactlist[cselectedcat].rects[crectidx];

                    let snrectx1 = roundOffDecimal(cviewrect.x,2);
                    let snrecty1 = roundOffDecimal(cviewrect.y,2);
                    let snrectx2 = roundOffDecimal((cviewrect.x + cviewrect.width),2);
                    let snrecty2 = roundOffDecimal((cviewrect.y + cviewrect.height),2);
                    
                    if(iscutitem){
                        //validating size details are setting to inside sub rect details
                        let isinsideparentbox = checkThroughProductsTest(srectx1, srecty1, srectx2, srecty2, snrectx1, snrecty1, snrectx2, snrecty2);

                        if(!isinsideparentbox){
                            //let newcygap = roundOffDecimal((snrecty2 - srecty1),2);

                            newbrandrect.width = (srectx1 < snrectx1?(newbrandrect.width + srectx1):srectx2 > snrectx2?(snrectx2 - srectx1):newbrandrect.width);
                            //newbrandrect.height = (newcygap < findinfield.drawHeight?findinfield.drawHeight:lastallowobj.height);
                            
                            newbrandrect.x = roundOffDecimal((srectx1 < snrectx1?snrectx1:srectx2 > snrectx2?(snrectx2 - newbrandrect.width):normalize_pointer.x),2);
                            newbrandrect.y = roundOffDecimal((srecty1 < snrecty1?snrecty1:srecty2 > snrecty2?(snrecty2 - newbrandrect.height):normalize_pointer.y),2);
                            
                            srectx1 = (srectx1 >= snrectx1?srectx1:snrectx1);
                            srectx2 = (srectx2 <= snrectx2?srectx2:snrectx2);
                            srecty1 = (srecty1 >= snrecty1?srecty1:snrecty1);
                            srecty2 = (srecty2 <= snrecty2?srecty2:snrecty2);
                        }
                    }
                    
                    //check start or end of rect inside sub cat rect
                    if(srectx1 < snrectx1 || srectx1 > snrectx2 || srecty1 > snrecty2 || srecty1 < snrecty1 || srectx2 > snrectx2 || srecty2 > snrecty2){
                        //let snshelveoverpping = checkThroughProductsTest(srectx1, srecty1, srectx2, srecty2, snrectx1, snrecty1, snrectx2, snrecty2);
                        //console.log(srectx1 < snrectx1 , srecty1 < snrecty1 , srectx2 > snrectx2 , srecty2 > snrecty2);
                        isoverlapping = true;   
                        //check is it inside other box of sub category
                        for (let k = 0; k < creactlist.length; k++) {
                            const subcatitem = creactlist[k];

                            if(!subcatitem.isDelete && getNameorIdorColorofBox(subcatitem, "num") === getNameorIdorColorofBox(selectedscat, "num")){
                                for (let j = 0; j < subcatitem.rects.length; j++) {
                                    const parentrect = subcatitem.rects[j];
                                    
                                    let prectx1 = roundOffDecimal(parentrect.x,2);
                                    let precty1 = roundOffDecimal(parentrect.y,2);
                                    let prectx2 = roundOffDecimal((parentrect.x + parentrect.width),2);
                                    let precty2 = roundOffDecimal((parentrect.y + parentrect.height),2);

                                    if(srectx1 <= prectx2 && srectx2 > prectx1 && srecty1 <= precty2 && srecty2 > precty1){
                                        let newbrandobj = JSON.parse(JSON.stringify(creactlist[cselectedcat].rects[crectidx].brands[cbrandidx]));
    
                                        isoverlapping = false;  
                                        crectidx = j;
                                        cviewrect = creactlist[cselectedcat].rects[crectidx];
    
                                        //check brand available in new rect
                                        let checkbrandobj = (iscutitem?seletedcutobj.citem:this.props.selectedDraw);
                                        let checkbrandavailabe = creactlist[cselectedcat].rects[crectidx].brands.findIndex(x => !x.isDelete && x.brand.brandId === checkbrandobj.brand.brandId);
                                        if(checkbrandavailabe > -1){
                                            cbrandidx = checkbrandavailabe;
                                        } else{
                                            newbrandobj["id"] =  uuidv4();
                                            newbrandobj["isNew"] = true; 
                                            newbrandobj["isDelete"] = false;
                                            newbrandobj["rects"] = [];
                                            
                                            cbrandidx = creactlist[cselectedcat].rects[crectidx].brands.length;
                                            
                                            creactlist[cselectedcat].rects[crectidx].brands.push(newbrandobj);
                                        }
    
                                        break;
                                    }
                                }
                            }
                           
                        }
                    } 
                    
                    //else{
                        //if(iscutitem){
                            for (let k = 0; k < cviewrect.brands.length; k++) {
                                const branditem = cviewrect.brands[k];
                                
                                if(!branditem.isDelete && branditem.percentage > 0){
                                    for (let l = 0; l < branditem.rects.length; l++) {
                                        const rectitem = branditem.rects[l];
                                        if(!rectitem.isDelete && rectitem.width > 0 && rectitem.percentage > 0){
                                            let bnrectx1 = roundOffDecimal(rectitem.x,2);
                                            let bnrecty1 = roundOffDecimal(rectitem.y,2);
                                            let bnrectx2 = roundOffDecimal((rectitem.x + rectitem.width),2);
                                            let bnrecty2 = roundOffDecimal((rectitem.y + rectitem.height),2);
                                            
                                            let issubcoverlap = checkThroughProductsTest(srectx1, srecty1, srectx2, srecty2, bnrectx1, bnrecty1, bnrectx2, bnrecty2);
                                            
                                            if(!issubcoverlap){
                                                isoverlapping = true;  
                                            }        
                                        }
                                    }
                                }
                            }
                        //}
                    //}

                    let totalrectwidth = 0; let totalrectheight = 0;
                    for (let l = 0; l < creactlist[cselectedcat].rects.length; l++) {
                        const srectitem = creactlist[cselectedcat].rects[l];
                        
                        if(!srectitem.isDelete){
                            totalrectwidth = (totalrectwidth + (srectitem.width * srectitem.contain_shelves.length));
                            totalrectheight = (totalrectheight + srectitem.height);
                        }
                    }
                    //console.log(isoverlapping);
                    if(!isoverlapping){
                        let snappingobj = checkSnapAllow(newbrandrect, this.state.divWidth, false, cviewrect.brands, cviewrect);
                        
                        if(snappingobj){
                            newbrandrect.x = roundOffDecimal(snappingobj.x,2);
                            newbrandrect.width = roundOffDecimal(snappingobj.width,2);

                            if(snappingobj.isrightsnap){
                                newbrandrect.isSnapped = true;
                            } else if(snappingobj.isleftsnap > -1){
                                creactlist[cselectedcat].rects[crectidx].brands[snappingobj.isleftsnap].isSnapped = true;
                            }
                        } 
                        
                        parentsub = creactlist[cselectedcat].rects[crectidx];
                        returnobj = checkDrawRectInShelve(this.state.viewfieldobj, parentsub, this.state.divWidth, true, newbrandrect);
                        //console.log(returnobj);

                        //check resize is more than contain shelves
                        let allowtodraw = true;
                        if(returnobj && returnobj.contain_shelves && returnobj.contain_shelves.length > 0){
                            for (let l = 0; l < returnobj.contain_shelves.length; l++) {
                            const cfieldshelve = returnobj.contain_shelves[l];

                            let iscshelvecontains = (parentsub?parentsub.contain_shelves.findIndex(x => x.rank === cfieldshelve.rank):-1);
                            
                            if(iscshelvecontains === -1){
                                allowtodraw = false; 
                            }
                            }
                        } else{
                            allowtodraw = false; 
                        }
                        // console.log(allowtodraw);

                        if(allowtodraw && returnobj && returnobj.contain_shelves && returnobj.contain_shelves.length > 0){
                            if(returnobj.contain_shelves && returnobj.contain_shelves.length > 0){
                                //get rect perentage
                                let checkpercentage = getRectPercentage(returnobj, totalrectwidth, creactlist[cselectedcat].rects[crectidx], true);
                                returnobj["percentage"] = roundOffDecimal(checkpercentage.percentage,2);
                                returnobj["box_width_percentage"] = roundOffDecimal(checkpercentage.box_percentage,2);
                                //returnobj.percentage = convertWidthPercent(returnobj.width, totalrectwidth);
                                
                                let selectedBrandItem = creactlist[cselectedcat].rects[crectidx].brands[cbrandidx];
                                selectedBrandItem.rects.push(returnobj);
                                
                                //if cutitem remove add item from list
                                if(iscutitem){
                                    cutlist.splice(this.state.cutItemIdx,1);
                                    this.setState({ droppedLocation: null, selectedCutItem: null, cutItemIdx: 0 });
                                }
                            } else{
                                alertService.error(this.props.t("oveflowinglayout"));
                                isallowchangetool = false;
                                this.resetDashDrawRect();

                                return false;
                            }
                            
                        } else{
                            alertService.error(this.props.t("overflowlayoutornoselected"));
                            isallowchangetool = false;
                            this.resetDashDrawRect();

                            return false;
                        }
                    } else{
                        alertService.error(this.props.t("oveflowinglayout"));
                        isallowchangetool = false;
                        this.resetDashDrawRect();

                        return false;
                    }
                } 
                //console.log(creactlist[cselectedcat]);
                this.resetDashDrawRect();
                this.props.setRects(creactlist, cutlist, false, true);

                if(isallowchangetool){
                    this.props.changeTool("default");
                }

            } else{
                this.resetDashDrawRect();
            } 
        } else if(this.props.activeTool === "pan"){
            this.setState({ isAllowPan: false });
        }
    }
    //reset dashrect 
    resetDashDrawRect = () => {
        this.setState({ isshowdash: false, dashrect: { startx: 0, starty: 0, x: 0, y: 0, width: 0, height: 0, percentage: 0, pointerX: 0, pointerY: 0 } });
    }
    // creating field
    calcFieldObject = (fieldObj,curidx) => {
        let exportfield = JSON.parse(JSON.stringify(fieldObj));

        let redicedheight = this.state.divHeight;
        
        var dimention = (redicedheight / measureConverter(exportfield.field_uom,this.state.displayUOM,exportfield.field_height));
        
        //current field width/height
        exportfield["drawHeight"] = measureConverter(exportfield.field_uom,this.state.displayUOM,exportfield.field_height) * dimention;
        exportfield["drawWidth"] = measureConverter(exportfield.field_uom,this.state.displayUOM,exportfield.field_width) * dimention;
        //console.log(exportfield);
        if (exportfield.field_shelves) {
            let cshelfs = (exportfield.field_shelves?exportfield.field_shelves:[]);
            
            let prevGap = 0;
            for (let i = 0; i < cshelfs.length; i++) {
                const shelf = cshelfs[i];
                let drawHeight = measureConverter(exportfield.field_uom,this.state.displayUOM,shelf.height) * dimention;
                let drawGap = measureConverter(exportfield.field_uom,this.state.displayUOM,shelf.gap) * dimention;

                //pick x, y
                shelf.x = 0;
                shelf.y = roundOffDecimal(prevGap,2);
                
                shelf.drawWidth = exportfield.drawWidth;
                shelf.drawHeight = roundOffDecimal(drawHeight,2);
                shelf.drawGap = roundOffDecimal(drawGap,2);

                shelf["isAllowEdit"] = true;

                prevGap = prevGap + (drawHeight + drawGap);
            }
        }

        if(curidx === 0){
            this.setState({ displayRatio: dimention });
        }

        //console.log(exportfield);
        return exportfield;
    }

    changePositionObj = (fidx, sidx, cobj, isvalidate) => {
        //console.log(cobj);
    }

    validateRectMove = (cidx,cval1,cval2) => {

    }

    updateRectProps = (crectlist) => {
        this.props.setRects(crectlist);
    }

    //toggle context menu
    handleContextMenu = (isshow, citem, cidx, pidx, ridx, e, islayoutclick, parentitem, boxno, brectidx, rectitem) => {
        let normalize_pointer = this.getScreenPointer(e);
        
        let svg = document.getElementById('mainsvg-view');
        let viewBox = svg.viewBox.baseVal;
        let zoomdrawx = this.state.zoomDrawX;

        let newx = (normalize_pointer.x - viewBox.x) * (zoomdrawx > 0?(zoomdrawx * 2):1);
        let newy = (normalize_pointer.y - viewBox.y) * (zoomdrawx > 0?(zoomdrawx * 2):1);
        //console.log(zoomdrawx);

        //let setxpos = (this.props.isRTL === "rtl"?(citem.x + -40):(citem.x + citem.width));
        var cobj = {xpos: (newx + 5), ypos: (newy + 10), xidx: cidx, citem: citem, scatidx: pidx, rectidx: ridx, brectidx: brectidx,
            brectitem: rectitem, islayoutclick: islayoutclick, 
            parentitem: parentitem, boxno: boxno};
        this.setState({ isviewcmenu: isshow, contxtmenu: cobj });
    }

    //handle delete rect
    handleDeleteRect = () => {
        var cmenu = this.state.contxtmenu;
        //console.log(cmenu);
        if(cmenu && cmenu.xidx > -1){
            let callrects = JSON.parse(JSON.stringify(this.props.rectsets));
            let cbranditem = callrects[cmenu.scatidx].rects[cmenu.rectidx].brands[cmenu.xidx];
            let cbrandrectitem = cbranditem.rects[cmenu.brectidx];
            //callrects[cmenu.scatidx].brands.splice(cmenu.xidx,1);
            if(cbrandrectitem.isNew){
                callrects[cmenu.scatidx].rects[cmenu.rectidx].brands[cmenu.xidx].rects.splice(cmenu.brectidx,1);
            } else{
                cbrandrectitem["isDelete"] = true;
            }

            //if no brand rects available
            let notdeletedrectlist = cbranditem.rects.filter(x => !x.isDelete);
            if(!notdeletedrectlist || notdeletedrectlist.length === 0){
                if(cbranditem.isNew){
                    callrects[cmenu.scatidx].rects[cmenu.rectidx].brands.splice(cmenu.xidx,1);
                } else{
                    cbranditem["isDelete"] = true;
                }
            }

            this.props.setRects(callrects, null, false, true);
            this.setState({ isviewcmenu: false,  contxtmenu: {xpos:0, ypos: 0, xidx: 0, scatidx: 0} });
        }
    }
    //handle zoom feature
    handleZoomInOut = (iszoomin,isreset) => {
        let svg = document.getElementById('mainsvg-view');
        let viewBox = svg.viewBox.baseVal;
        let zoomdrawx = this.state.zoomDrawX;
        
        if(iszoomin){
            viewBox.x = viewBox.x + viewBox.width / 4;
            viewBox.y = viewBox.y + viewBox.height / 4;
            viewBox.width = viewBox.width / 2;
            viewBox.height = viewBox.height / 2;

            zoomdrawx = zoomdrawx + 1;
        } else if(isreset){
            viewBox.x = 0;
            viewBox.y = 0;
            viewBox.width = this.state.divWidth;
            viewBox.height = this.state.divHeight;

            zoomdrawx = 0;
        } else{
            if(this.state.divWidth >= (viewBox.width * 2)){
                viewBox.x = viewBox.x - viewBox.width / 2;
                viewBox.y = viewBox.y - viewBox.height / 2;
                viewBox.width = viewBox.width * 2;
                viewBox.height = viewBox.height * 2;

                zoomdrawx = zoomdrawx - 1;
            } else{
                zoomdrawx = 0;
            }
        }

        this.setState({ zoomDrawX: zoomdrawx });
    }
    //enables pan
    handlePanView = (event) => {
        if(this.state.isAllowPan && this.props.activeTool === "pan"){
            let svg = document.getElementById('mainsvg-view');
            let viewBox = svg.viewBox.baseVal;

            viewBox.x = viewBox.x - event.movementX;
            viewBox.y = viewBox.y - event.movementY;
        }
    }
    //cut boxes
    handleCutBox = () => {
        let contextitem = this.state.contxtmenu;
        let callrects = JSON.parse(JSON.stringify(this.props.rectsets));
        
        let branditem = callrects[contextitem.scatidx].rects[contextitem.rectidx].brands[contextitem.xidx];
        let cutitem = branditem.rects[contextitem.brectidx];
        if(cutitem.isNew){
            callrects[contextitem.scatidx].rects[contextitem.rectidx].brands[contextitem.xidx].rects.splice(contextitem.brectidx,1);
        } else{
            cutitem["isDelete"] = true;
        }

        /* let notdeletedrectlist = branditem.rects.filter(x => !x.isDelete);
        if(!notdeletedrectlist || notdeletedrectlist.length === 0){
            if(branditem.isNew){
                callrects[contextitem.scatidx].rects[contextitem.rectidx].brands.splice(contextitem.xidx,1);
            } else{
                branditem["isDelete"] = true;
            }
        } */
        
        let cutlist = JSON.parse(JSON.stringify(this.props.cutBoxList));
        cutlist.push(contextitem);
        //console.log(cutlist);
        this.setState({ isviewcmenu: false,  contxtmenu: {xpos:0, ypos: 0, xidx: 0, scatidx: 0} });
        //this.props.updateCutList(cutlist);
        this.props.setRects(callrects, cutlist, false, true);
    }
    //
    handleLayoutClick = (e) => {
        //only right click
        /* if(e.nativeEvent.which === 3){
            this.handleContextMenu(true,null, null, null, null, e, true)
        } */
    }
    //
    toggleClipBoard = () => {
        this.setState({ isShowClipboard: !this.state.isShowClipboard });
    }
    //draws green box with mouse when dragging product to indicate product size according to field size
    drawRectCanvas = (xitem, xidx) => {
        const canvele = this.dragPreviewCanvas.current;
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

        this.setState({ selectedCutItem: xitem, cutItemIdx: xidx, droppedLocation: null });

        setTimeout(() => {
            this.toggleClipBoard();
        }, 300);
    }
    //triggers on product drag start
    dragStart = (e) => {
        e.dataTransfer.setDragImage(this.dragPreviewImage, 0,0); //set drag image we generated with canvas
        this.setState({ cutDragEnabled: true });
    }
    //
    droppedCutItem = (e) => {
        removeGhostImage();

        if(e){
            this.drawNewRect(e, true);
        }
        this.setState({ cutDragEnabled: false });
    }
    //
    changeDroppedLocation = (e) => {
        let normalize_pointer = this.getScreenPointer(e);
        let selectedcutitem = this.state.selectedCutItem;
        let parentitem = selectedcutitem.parentitem;
        
        let isallowcutdrop = false;
        for (let i = 0; i < parentitem.rects.length; i++) {
            const parentrect = parentitem.rects[i];
            
            let prectx1 = roundOffDecimal(parentrect.x,2);
            let precty1 = roundOffDecimal(parentrect.y,2);
            let prectx2 = roundOffDecimal((parentrect.x + parentrect.width),2);
            let precty2 = roundOffDecimal((parentrect.y + parentrect.height),2);

            if(prectx1 <= normalize_pointer.x && prectx2 >= normalize_pointer.x && precty1 <= normalize_pointer.y && precty2 >= normalize_pointer.y){
                e.stopPropagation();
                e.preventDefault();
    
                isallowcutdrop = true;
            }
        }

        this.setState({ isAllowCutDrop: isallowcutdrop });
    }

    render() {
        let cursubcat = this.props.selectedSubCat;
        
        return (<>
            <MPToolBox 
                actype={this.props.activeDrawType} 
                activeTool={this.props.activeTool} 
                zoomDrawX={this.state.zoomDrawX}
                t={this.props.t} 
                isRTL={this.props.isRTL}
                handleZoomInOut={this.handleZoomInOut}
                historyData={this.props.historyData} 
                handleUndoRedo={this.props.handleUndoRedo} 
                changeTool={this.props.changeTool} 
                changeDrawType={this.props.changeDrawType} 
                />

            <Col className='drawcontent-wrapper'>

                <ul className="list-inline svg-toolkit">
                    {this.props.cutBoxList && this.props.cutBoxList.length > 0?
                        <li className="list-inline-item right-item">
                            <Button variant="secondary" onClick={this.toggleClipBoard} size="sm"><FeatherIcon icon={"scissors"} size={16} /> {this.props.t("CLIPBOARD")}</Button>

                            <DrawViewClipboard isBrandView={true} isShowClipboard={this.state.isShowClipboard} cutBoxList={this.props.cutBoxList} t={this.props.t}
                            displayRatio={this.state.displayRatio} isAllowCutDrop={this.state.isAllowCutDrop} 
                            dragStart={this.dragStart}
                            droppedCutItem={this.droppedCutItem}
                            ghostFromParent={this.ghostFromParent}
                            drawRectCanvas={this.drawRectCanvas} />
                        </li>
                    :<></>}
                </ul>

                <Col className="mainsvg-content" id="mainsvg-content" ref={this.displaydiv} onContextMenu={e => e.preventDefault()}>
                    {this.state.isviewcmenu?<ContextMenu isRTL={this.props.isRTL} citem={this.state.contxtmenu.citem} handlechangeobj={this.handleChangeObj} handledelete={this.handleDeleteRect} handlclose={() => this.setState({isviewcmenu:false})} 
                    handleCutBox={this.handleCutBox} xpos={this.state.isviewcmenu?this.state.contxtmenu.xpos:0} ypos={this.state.isviewcmenu?this.state.contxtmenu.ypos:0} />:<></>}

                    {this.state.viewfieldobj?<>
                        <svg id="mainsvg-view" className={"drawsvg "+((this.props.activeTool === "draw" && this.props.isEnableDraw) || this.props.activeTool?this.props.activeTool:"")} style={{cursor: this.state.activeTool, direction: "ltr"}} viewBox={"0 0 "+this.state.divWidth+" "+this.state.divHeight} onMouseDown={this.startNewRect} onMouseMove={this.changeDashRect} onMouseUp={this.drawNewRect} width={this.state.divWidth} height={this.state.svgheight} version="1.1" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
                            
                            <rect color={(this.props.dmode?'#2CC990':'#5128a0')} width={this.state.divWidth} height={this.state.viewfieldobj.drawHeight} fill="none" />
                            <rect x={this.state.viewfieldobj.drawX} y={0} width={this.state.divWidth} height={this.state.viewfieldobj.drawHeight} strokeWidth={3} fill="none" style={{ stroke: (this.props.dmode?'#2CC990':'#cfbbf3'),display:"block",margin:"auto" }} ></rect>
                            
                            {(this.state.viewfieldobj.field_shelves?this.state.viewfieldobj.field_shelves.map((shelf, i) => <React.Fragment key={i}>
                                <rect className="sftrect" width={this.state.divWidth} height={shelf.drawHeight} x={0} y={shelf.y} style={{ strokeWidth: 1, stroke: (this.props.dmode?'#2CC990':'#cfbbf3'), fill: 'transparent', fillOpacity: 1 }} id={i} ref={(r) => this[i] = r} />
                                {/* <GapRect fidx={0} sidx={i} unqid={0+""+i} shelfitem={shelf} width={this.state.divWidth} height={shelf.drawGap} x={0} y={shelf.y + (shelf.drawHeight?shelf.drawHeight:0)} field={this.state.viewfieldobj} validateShelveMove={this.validateShelveMove} changePositionObj={this.changePositionObj} dmode={this.props.dmode} /> */}
                                <rect width={this.state.divWidth} height={shelf.drawGap} x={0} y={shelf.y + (shelf.drawHeight?shelf.drawHeight:0)} 
                                style={{ strokeWidth: 1, stroke: (shelf.isEyeLevel?'#5128a0':this.props.dmode?'#2CC990':'#cfbbf3'), fill: (shelf.isEyeLevel?'#5128a0':this.props.dmode?'#2CC990':'#bba2eb'), fillOpacity: 0.6 }} />
                            </React.Fragment>) : (<></>))}
                            
                            {this.props.rectsets && this.props.rectsets.length > 0?<>
                                {this.props.rectsets.map((xitem,xidx) => {

                                    let rectno = 0;
                                    let isviewactive = (this.props.selectedSubCat?getNameorIdorColorofBox(xitem,"num") === getNameorIdorColorofBox(this.props.selectedSubCat,"num"):false);
                                    
                                    return <React.Fragment key={xidx}>
                                        {!xitem.isDelete && xitem.id === cursubcat.id && xitem.rects && xitem.rects.length > 0?<>
                                            {xitem.rects.map((zitem,zidx) => {
                                                //console.log(zitem);
                                                rectno = (!zitem.isDelete && zitem.width > 0 && zitem.height > 0?(rectno + 1):rectno);

                                                return <React.Fragment key={zidx}>
                                                    {zitem.width > 0 && zitem.height > 0?<g> 

                                                        <Rect 
                                                            isEdit={this.props.isEdit} 
                                                            isshowcontrols={false} 
                                                            curno={zidx} parentidx={xidx} 
                                                            isOpacityReduce={!isviewactive} 
                                                            viewWidth={this.state.divWidth} 
                                                            viewHeight={380} isbrand={false} 
                                                            fidx={"rct-"+xidx+""+zidx} 
                                                            x={zitem.x} y={zitem.y} width={zitem.width} height={zitem.height} 
                                                            rectsets={this.props.rectsets} 
                                                            handleContextMenu={this.handleContextMenu} 
                                                            mainitem={zitem} parentitem={xitem} 
                                                            boxno={rectno} 
                                                            isRTL={this.props.isRTL} 
                                                            isAUIDisabled={this.props.isAUIDisabled}
                                                            parentWidth={this.state.divWidth} 
                                                            parentHeight={this.state.viewfieldobj.drawHeight} 
                                                            fieldObj={this.state.viewfieldobj} 
                                                            layoutWidth={this.state.divWidth} 
                                                            allrects={this.props.rectsets} 
                                                            validateRectMove={this.validateRectMove} 
                                                            updateRectProps={this.updateRectProps} 
                                                            setbforemove={this.setbforemove} 
                                                            />

                                                    </g>:<></>}
                                                </React.Fragment>;

                                            })}
                                        </>:<></>}
                                    </React.Fragment>
                                })}
                            </>:<></>}

                            {this.props.rectsets && this.props.rectsets.length > 0?<>
                                {this.props.rectsets.map((xitem,xidx) => {

                                    let rectno = 0;
                                    let isviewactive = (this.props.selectedSubCat?getNameorIdorColorofBox(xitem,"num") === getNameorIdorColorofBox(this.props.selectedSubCat,"num"):false);
                                    
                                    return <React.Fragment key={xidx}>
                                        {!xitem.isDelete && xitem.id === cursubcat.id && xitem.rects && xitem.rects.length > 0?<>
                                            {xitem.rects.map((zitem,zidx) => {
                                                //console.log(zitem);
                                                rectno = (!zitem.isDelete && zitem.width > 0 && zitem.height > 0?(rectno + 1):rectno);

                                                return <React.Fragment key={zidx}>
                                                    {zitem.width > 0 && zitem.height > 0?<g> 

                                                        {zitem.brands.map((yitem,yidx) => {
                                                            return <React.Fragment key={yidx}>
                                                                {!yitem.isDelete?<>
                                                                    {yitem.rects.map((ritem, ridx) => {
                                                                        return <React.Fragment key={ridx}>
                                                                            {!ritem.isDelete && ritem.width > 0 && ritem.height > 0?<g> 
                                                                                <Rect 
                                                                                    isEdit={this.props.isEdit} 
                                                                                    isshowcontrols={isviewactive} 
                                                                                    brectidx={ridx} curno={yidx} parentidx={xidx} rectidx={zidx} 
                                                                                    isOpacityReduce={!isviewactive} 
                                                                                    viewWidth={(xitem.x + xitem.width)} 
                                                                                    viewHeight={(xitem.y + xitem.height)} 
                                                                                    isbrand={true} 
                                                                                    isAUIDisabled={this.props.isAUIDisabled}
                                                                                    fidx={"bnd-rct-"+xidx+""+zidx+""+yidx+""+ridx} 
                                                                                    x={ritem.x} y={ritem.y} width={ritem.width} height={ritem.height} 
                                                                                    rectsets={this.props.rectsets} 
                                                                                    handleContextMenu={this.handleContextMenu} 
                                                                                    rectitem={ritem} 
                                                                                    mainitem={yitem} 
                                                                                    parentitem={xitem} 
                                                                                    warningRedirect={this.props.warningRedirect} 
                                                                                    trans={this.props.t} 
                                                                                    saveCategoryObj={this.props.saveCategoryObj} 
                                                                                    redirectList={this.props.redirectList} 
                                                                                    zoomDrawX={this.state.zoomDrawX} 
                                                                                    isRTL={this.props.isRTL} 
                                                                                    parentWidth={xitem.width} 
                                                                                    parentHeight={xitem.height} 
                                                                                    subrectitem={zitem} 
                                                                                    layoutWidth={this.state.divWidth} 
                                                                                    fieldObj={this.state.viewfieldobj} 
                                                                                    validateRectMove={this.validateRectMove} 
                                                                                    updateRectProps={this.updateRectProps} 
                                                                                    setbforemove={this.setbforemove} 
                                                                                    />
                                                                            </g>:<></>}
                                                                        </React.Fragment>;            
                                                                    })}
                                                                </>:<></>}
                                                            </React.Fragment>;
                                                        })}
                                                        
                                                    </g>:<></>}
                                                </React.Fragment>;

                                            })}
                                        </>:<></>}
                                    </React.Fragment>
                                })}
                            </>:<></>}
                            
                            {this.state.isshowdash?<>
                                <rect x={this.state.dashrect.x} y={this.state.dashrect.y} width={this.state.dashrect.width} height={this.state.dashrect.height} fill="none" stroke="red" strokeDasharray={[2,2]} strokeWidth={2}></rect>

                                <line x1={this.state.dashrect.pointerX} y1={0} x2={this.state.dashrect.pointerX} y2={(this.state.dashrect.pointerY + 300)} style={{stroke: "red", strokeWidth: "2px", strokeDasharray:[1,1]}} />
                                <line x1={0} y1={this.state.dashrect.pointerY} x2={(this.state.dashrect.pointerY + this.state.divWidth)} y2={this.state.dashrect.pointerY} style={{stroke: "red", strokeWidth: "2px", strokeDasharray:[1,1]}} />

                                {this.state.dashrect.percentage > 0?<>
                                <rect fill="red" x={(this.state.dashrect.x+this.state.dashrect.width) - 50} y={(this.state.dashrect.y + this.state.dashrect.height) - 20} width={50} height={20}></rect>
                                <text fill="white" x={(this.state.dashrect.x+this.state.dashrect.width) - 43} y={(this.state.dashrect.y + this.state.dashrect.height) - 5} fontSize="12" fontWeight={"700"}>{this.state.dashrect.percentage}%</text>
                                </>:<></>}
                            </>:<></>}
                            
                            {this.props.isEnableDraw && (this.props.activeTool === "draw" || this.props.activeTool === "pan")?<rect x={0} y={0} 
                            width={this.state.divWidth} height={this.state.divHeight} fill="rgba(255, 255, 255, 0.2)" stroke="none"></rect>:<></>}

                            {this.state.cutDragEnabled?<rect onDragOver={(e) => this.changeDroppedLocation(e)} onDrop={e => this.droppedCutItem(e)} onMouseDown={e => this.handleLayoutClick(e)} x={0} y={0} width={this.state.divWidth} height={this.state.divHeight} fill="rgba(255, 255, 255, 0.1)" stroke="none"></rect>:<></>}
                        </svg>
                    </>:<></>}
                </Col>
            </Col>

            <div style={{display:"none"}}>
                <canvas ref={this.dragPreviewCanvas}></canvas>
            </div>

            <div className='draggable-ghost-wrapper' style={{width: 300, height: 100}}></div>
        </>);
    }
}



