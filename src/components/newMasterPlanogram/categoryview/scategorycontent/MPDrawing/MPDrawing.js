import React, { Component } from 'react';
import { Col, Button } from 'react-bootstrap'; //, Button, ButtonGroup
import FeatherIcon from 'feather-icons-react';
//import * as d3 from "d3";
import { v4 as uuidv4 } from 'uuid'; //unique id

import './MPDrawing.css';

import { measureConverter, roundOffDecimal, findBrowserType } from '../../../../../_services/common.service'; //AspectRatioDrawBox, 

import { Rect, ContextMenu } from '../../../D3Comps';
import { checkDrawRectInShelve, checkSnapAllow, getRectPercentage, DrawViewClipboard, getReduceSizeValue, getNameorIdorColorofBox } from '../../../AddMethods'; //
import { checkThroughProductsTest } from '../../../../planograms/planDisplayUnit/additionalcontents';
import { alertService } from '../../../../../_services/alert.service';
import { ghostOnDrag, removeGhostImage } from '../../../../common_layouts/ghostDragWrapper';

import MPToolBox from './ToolBox';
// import { catRectEnums } from '../../../../../enums/masterPlanogramEnums';

export default class MPDrawing extends Component {
    constructor(props){
        super(props);

        this._isMounted = false;
        this.displaydiv = React.createRef(); //main preview div
        this.dragPreviewCanvas = React.createRef(); //drag preview canvas
        this.dragPreviewImage = new Image(); //temp stores dragging image
        this.oriPageXY = {isfirefox: false, x: 0, y: 0};

        this.state = {
            newrectstart: null,
            // isviewcmenu: false, contxtmenu: {xpos:0, ypos: 0, xidx: 0},
            isshowdash: false, dashrect: { startx:0, starty: 0, x: 0, y: 0, width: 0, height: 0, percentage: 0, pointerX: 0, pointerY: 0 },
            selectedCategory: {}, selectedCatRect: {},
            viewfieldobj: null, 
            divWidth: 0, divHeight: 0, displayUOM: "cm", displayRatio: 0,
            svgwidth: "100%", svgheight: 300,
            //rect draw
            isAllowPan: false, zoomDrawX: 0,
            isviewcmenu: false, contxtmenu: {xpos:0, ypos: 0, xidx: 0, scatidx: 0},
            //cut boxes
            isShowClipboard: false, cutDragEnabled: false,
            selectedCutItem: null, cutItemIdx: 0, droppedLocation: null,
        }
    }

    componentDidMount() {
        this._isMounted = true;

        if (this._isMounted) {
            //console.log(this.props.selectedCategory);
            
            let crescount = this.props.showResolutionCount;
            this.setState({ svgheight: (crescount === 4?540:crescount === 3?240:crescount > 1?340:300) }, () => {
                this.setState({
                    divWidth: (this.displaydiv.current && this.displaydiv.current.offsetWidth?(this.displaydiv.current.offsetWidth - 10):0),
                    divHeight: (this.displaydiv.current && this.displaydiv.current.offsetHeight?(this.displaydiv.current.offsetHeight):0),

                    selectedCategory: (this.props.selectedCategory?this.props.selectedCategory:{}),
                    selectedCatRect: (this.props.selectedCatRect?this.props.selectedCatRect:{}),
                }, () => {
                    let fieldconvobj = (this.props.selectedCategory && this.props.selectedCategory.field_obj?this.calcFieldObject(this.props.selectedCategory.field_obj,0):null);

                    this.props.updateDivDetails(this.state.divWidth, this.state.divHeight, fieldconvobj);
                    this.setState({
                        viewfieldobj: fieldconvobj
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
                alertService.error(this.props.t("notselectedsubcat"));
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
            let creactlist = JSON.parse(JSON.stringify(this.props.rectsets));

            //let drawzoomx = this.state.zoomDrawX;
            let cobj = this.state.dashrect;
            let normalize_pointer = this.getScreenPointer(e);
            
            cobj["pointerX"] = normalize_pointer.x;
            cobj["pointerY"] = normalize_pointer.y;

            cobj["x"] = (cobj.startx < normalize_pointer.x?cobj.x:normalize_pointer.x);
            cobj["y"] = (cobj.starty < normalize_pointer.y?cobj.y:normalize_pointer.y);
            
            let boxwidth = (cobj.startx < normalize_pointer.x?Math.abs(normalize_pointer.x - cobj.startx):Math.abs(cobj.startx - normalize_pointer.x));
            cobj["width"] = boxwidth;

            let boxheight = (cobj.starty < normalize_pointer.y?Math.abs(normalize_pointer.y - cobj.starty):Math.abs(cobj.starty - normalize_pointer.y));
            cobj["height"] = boxheight;

            let selrectitem = JSON.parse(JSON.stringify(this.props.selectedCatRect));
            let returnobj = checkDrawRectInShelve(this.state.viewfieldobj, selrectitem, this.state.divWidth, false, cobj);
            
            let snappingobj = checkSnapAllow(returnobj, this.state.divWidth, true, creactlist);

            if(snappingobj){
                returnobj.x = snappingobj.x;
                returnobj.width = snappingobj.width;
            } 

            let returnper = getRectPercentage(returnobj, this.state.divWidth, this.state.viewfieldobj);
            cobj["percentage"] = returnper.percentage;

            this.setState({ dashrect: cobj });

        } else if(this.props.activeTool === "pan"){
            this.handlePanView(e);
        }
    }
    drawNewRect=(e, iscutitem)=>{
        let seletedcutobj = (this.state.selectedCutItem?JSON.parse(JSON.stringify(this.state.selectedCutItem)):null);
        
        if(iscutitem || (this.props.activeTool === "draw" && this.props.selectedDraw)){
            let newdroplocation = this.getScreenPointer(e);
            let selrectitem = this.props.selectedCatRect;
            let creactlist = JSON.parse(JSON.stringify(this.props.rectsets));
            let selectedDraw = this.props.selectedDraw;
            
            let issubcategory = (this.props.actype === "subc"?true:false);
            //find main sub category
            let cselectedcat = (iscutitem && seletedcutobj?seletedcutobj.scatidx:creactlist.findIndex(x => !x.isDelete && x.id === selectedDraw.id));
            if(iscutitem && !creactlist[cselectedcat]){
                cselectedcat = -1;
            }

            //let cbrandidx = -1;
            let returnobj = false;
            let cutlist = JSON.parse(JSON.stringify(this.props.cutBoxList));
            
            //if sub cat available and draw enabled
            if(cselectedcat > -1 && ((iscutitem) || (this.props.isEnableDraw && e.nativeEvent.which === 1))){ //only left mouse click
                /* let notdeletedsubrects = ((creactlist[cselectedcat].rects && creactlist[cselectedcat].rects.length > 0)?creactlist[cselectedcat].rects.filter(x => !x.is_delete):false)
                
                if(notdeletedsubrects && notdeletedsubrects.length > 0){
                    alertService.error(this.props.t("Only allow one sub category box to draw"));
                    this.setState({ isshowdash: false, dashrect: { startx: 0, starty: 0, x: 0, y: 0, width: 0, height: 0, percentage: 0, pointerX: 0, pointerY: 0 }, droppedLocation: null, selectedCutItem: null, cutItemIdx: 0 });
                    return false;
                } */

                var newrectstart = this.state.newrectstart; //dash rect start values
                
                let normalize_pointer = (iscutitem?newdroplocation:this.getScreenPointer(e));
                var newrectend = {x: normalize_pointer.x, y:normalize_pointer.y}; //dash rect end values
                //new rect object
                var rectobj = {id: uuidv4(), x:0, y:0, width: 0, height: 0, color: "", brands: [], contain_shelves: [], isSnapped: false, isNew: true, isDelete: false};
                //view sizes
                let oldrectobj = null;
                if(iscutitem){
                    rectobj = seletedcutobj.citem;
                    rectobj.id = uuidv4();
                    rectobj.isNew = true;
                    rectobj.isDelete = false;
                    
                    oldrectobj = JSON.parse(JSON.stringify(rectobj));
                }

                //if dash rect start/end values not matching
                let isallowchangetool = true;
                if(iscutitem || (newrectstart && newrectstart.x !== newrectend.x && newrectstart.y !== newrectend.y)){
                    //
                    if(!iscutitem){
                        rectobj.color = creactlist[cselectedcat].color;
                        rectobj.x = roundOffDecimal((newrectstart.x < newrectend.x?newrectstart.x:newrectend.x),2);
                        rectobj.y = roundOffDecimal((newrectstart.y < newrectend.y?newrectstart.y:newrectend.y),2);
                        rectobj.width = roundOffDecimal((newrectstart.x < newrectend.x?(newrectend.x-newrectstart.x):(newrectstart.x-newrectend.x)),2);
                        rectobj.height = roundOffDecimal((newrectstart.y < newrectend.y?(newrectend.y-newrectstart.y):(newrectstart.y-newrectend.y)),2);
                    } else{
                        rectobj.x = roundOffDecimal(normalize_pointer.x,2);
                        rectobj.y = roundOffDecimal(normalize_pointer.y,2);
                    }
                    
                    let srectx1 = roundOffDecimal(rectobj.x,2);
                    let srecty1 = roundOffDecimal(rectobj.y,2);
                    let srectx2 = roundOffDecimal((rectobj.x + rectobj.width),2);
                    let srecty2 = roundOffDecimal((rectobj.y + rectobj.height),2);

                    //validate overlapping other rects
                    let isoverlapping = false;
                    for (let i = 0; i < creactlist.length; i++) {
                        const csubcatitem = creactlist[i];
                        if(!csubcatitem.isDelete){
                            for (let k = 0; k < csubcatitem.rects.length; k++) {
                                const crectitem = csubcatitem.rects[k];
                                
                                if(!crectitem.isDelete){
                                    let crectx1 = roundOffDecimal(crectitem.x,2);
                                    let crecty1 = roundOffDecimal(crectitem.y,2);
                                    let crectx2 = roundOffDecimal((crectitem.x + crectitem.width),2);
                                    let crecty2 = roundOffDecimal((crectitem.y + crectitem.height),2);

                                    let shelveoverpping = checkThroughProductsTest(srectx1, srecty1, srectx2, srecty2, crectx1, crecty1, crectx2, crecty2);
                                    //console.log(shelveoverpping);
                                    if(!shelveoverpping){
                                        isoverlapping = true;
                                    } 
                                }
                                
                            }    
                        }
                    }
                    
                    if(!isoverlapping){
                        //check is snapping
                        let snappingobj = checkSnapAllow(rectobj, this.state.divWidth, issubcategory, creactlist);
                        if(snappingobj){
                            rectobj.x = snappingobj.x;
                            rectobj.width = snappingobj.width;
                            
                            if(snappingobj.isrightsnap){
                                rectobj.isSnapped = true;
                            } else if(snappingobj.isleftsnap > -1){
                                creactlist[snappingobj.leftparent].rects[snappingobj.isleftsnap].isSnapped = true;
                            }
                        } 
                        
                        returnobj = checkDrawRectInShelve(this.state.viewfieldobj, selrectitem, this.state.divWidth, false, rectobj);
                        //console.log(returnobj);

                        //check resize is more than contain shelves
                        let allowtodraw = true;
                        if(returnobj && returnobj.contain_shelves && returnobj.contain_shelves.length > 0){
                            for (let l = 0; l < returnobj.contain_shelves.length; l++) {
                            const cfieldshelve = returnobj.contain_shelves[l];

                            let iscshelvecontains = (selrectitem?selrectitem.contain_shelves.findIndex(x => x.rank === cfieldshelve.rank):-1);
                            
                            if(iscshelvecontains === -1){
                                allowtodraw = false; 
                            }
                            }
                        } else{
                            allowtodraw = false; 
                        }
                        // console.log(allowtodraw);

                        if(allowtodraw && returnobj && returnobj.contain_shelves && returnobj.contain_shelves.length > 0){
                            if(iscutitem && returnobj.height < rectobj.height && returnobj.contain_shelves.length !== rectobj.contain_shelves.length){
                                alertService.error(this.props.t("CANNOT_CHANGE_BRANDS_AVAILABLE"));
                                return false;
                            }

                            //get rect perentage
                            let checkpercentages = getRectPercentage(returnobj, this.state.divWidth, this.state.viewfieldobj);
                            returnobj["percentage"] = roundOffDecimal(checkpercentages.percentage,2);
                            returnobj["box_width_percentage"] = roundOffDecimal(checkpercentages.box_percentage,2);
                            
                            if(iscutitem){
                                //get gap between last
                                let reducevalue = roundOffDecimal((returnobj.width - oldrectobj.width),2);
                                // let reducexvalue = roundOffDecimal((returnobj.x - oldrectobj.x),2);

                                if(returnobj.brands && returnobj.brands.length > 0){
                                    let returnmainy = roundOffDecimal(returnobj.y,2);
                                    let returnmainheight = roundOffDecimal((returnobj.y + returnobj.height),2);
                                    //let islowerthanbrands = false;
                                    
                                    for (let i = 0; i < returnobj.brands.length; i++) {
                                        const branditem = returnobj.brands[i];
                                        branditem.id = uuidv4();
                                        branditem.isNew = true;
                                        branditem.isDelete = false;

                                        //change xy locations according to new sub cat location
                                        // let oldbxgap = (branditem.x - oldrectobj.x);
                                        // let newreducex = (oldbxgap > 0?(reducevalue !== 0?reducevalue:reducexvalue):reducexvalue);
                                        
                                        // let reducex = getReduceSizeValue(oldbxgap, oldrectobj.width, newreducex); //get how much should change
                                        // branditem.x = roundOffDecimal((reducex !== 0?(branditem.x + reducex):(branditem.x + reducexvalue)),2);
                                        
                                        for (let l = 0; l < branditem.rects.length; l++) {
                                            const brandrectitem = branditem.rects[l];
                                            brandrectitem.id = uuidv4();
                                            brandrectitem.isNew = true;
                                            brandrectitem.isDelete = false;

                                            let oldbxgap = (brandrectitem.x - oldrectobj.x);
                                            brandrectitem.x = (returnobj.x + oldbxgap);

                                            let oldbygap = (brandrectitem.y - oldrectobj.y);
                                            brandrectitem.y = roundOffDecimal((returnobj.y + oldbygap),2);

                                            //change brand width
                                            let reducewidth = getReduceSizeValue(brandrectitem.width, oldrectobj.width, reducevalue);
                                            brandrectitem.width = roundOffDecimal((brandrectitem.width + reducewidth),2);

                                            let brandyheight = roundOffDecimal((brandrectitem.y + brandrectitem.height),2);
                                            
                                            if(returnmainy > brandrectitem.y || returnmainheight < brandyheight){
                                                //islowerthanbrands = true;
                                            }

                                            let returnbrandobj = checkDrawRectInShelve(this.state.viewfieldobj, returnobj, this.state.divWidth, true, brandrectitem);
                                            //console.log(returnbrandobj);
                                            if(returnbrandobj){
                                                branditem.rects[l] = returnbrandobj;
                                            }    
                                        }       
                                    }
                                    
                                    /* if(islowerthanbrands){
                                        alertService.error(this.props.t("cannot_resize_minimum_brands"));
                                        return false;
                                    } */  
                                }
                                
                            }
                            
                            creactlist[cselectedcat].rects.push(returnobj);
                            //console.log(creactlist[cselectedcat]);
                            let totalrectper = 0;
                            for (let i = 0; i < creactlist[cselectedcat].rects.length; i++) {
                                const rectitem = creactlist[cselectedcat].rects[i];
                                if(!rectitem.isDelete){
                                    totalrectper = (totalrectper + rectitem.percentage);
                                }
                            }
                            creactlist[cselectedcat].percentage = totalrectper;
                            
                            //if cutitem remove add item from list
                            if(iscutitem){
                                cutlist.splice(this.state.cutItemIdx,1);

                                this.setState({ droppedLocation: null, selectedCutItem: null, cutItemIdx: 0 });
                                this.props.updateCutList(cutlist);
                            }
                        } else{
                            alertService.error(this.props.t("oveflowinglayout"));
                            isallowchangetool = false;
                            this.setState({ droppedLocation: null, selectedCutItem: null, cutItemIdx: 0 });
                            this.resetDashDrawRect();
                            
                            return false;
                        }
                    } else{
                        alertService.error(this.props.t("oveflowinglayout"));
                        isallowchangetool = false;
                        this.setState({ droppedLocation: null, selectedCutItem: null, cutItemIdx: 0 });
                        this.resetDashDrawRect();

                        return false;
                    }
                } 
                
                this.resetDashDrawRect();
                
                this.props.setRects(creactlist, cutlist, false, null, false, true);

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
        let curselrect = this.state.selectedCatRect;
        //console.log(curselrect);
        let exportfield = JSON.parse(JSON.stringify(fieldObj));
        //calculate dimention(is this wrong? hama field ekakma ration eka eka ewa hadenwa)
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

                //find is it contain in rect
                let isshelvecontain = (curselrect && curselrect.contain_shelves && curselrect.contain_shelves.length > 0?curselrect.contain_shelves.findIndex(x => x.rank === shelf.rank):-1);
                shelf["isAllowEdit"] = (isshelvecontain > -1);

                prevGap = prevGap + (drawHeight + drawGap);
            }
        }

        if(curidx === 0){
            this.setState({ displayRatio: dimention });
        }
        
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
    handleContextMenu = (isshow, citem, cidx, pidx, ridx, e, islayoutclick, parentitem, boxno) => {
        let normalize_pointer = this.getScreenPointer(e);
        
        let svg = document.getElementById('mainsvg-view');
        let viewBox = svg.viewBox.baseVal;
        let zoomdrawx = this.state.zoomDrawX;

        let newx = (normalize_pointer.x - viewBox.x) * (zoomdrawx > 0?(zoomdrawx * 2):1);
        let newy = (normalize_pointer.y - viewBox.y) * (zoomdrawx > 0?(zoomdrawx * 2):1);
        //console.log(viewBox,normalize_pointer);

        //let setxpos = (this.props.isRTL === "rtl"?(citem.x + -40):(citem.x + citem.width));
        var cobj = {xpos: (newx + 5), ypos: (newy + 10), xidx: cidx, citem: citem, scatidx: pidx, islayoutclick: islayoutclick, 
        parentitem: parentitem, boxno: boxno};
        this.setState({ isviewcmenu: isshow, contxtmenu: cobj });
    }

    //handle delete rect
    handleDeleteRect = () => {
        let cmenu = this.state.contxtmenu;
        //console.log(cmenu);
        if(cmenu && cmenu.xidx > -1){
            let callrects = JSON.parse(JSON.stringify(this.props.rectsets));
            
            if(callrects[cmenu.scatidx].rects[cmenu.xidx].id > 0){
                let rectitem = callrects[cmenu.scatidx].rects[cmenu.xidx];
                rectitem.isDelete = true;
                //remove brand details - need to remove by its parent sub category rect inside ones
                if(rectitem.brands && rectitem.brands.length > 0){
                    for (let i = 0; i < rectitem.brands.length; i++) {
                        const branditem = rectitem.brands[i];
                        branditem.isDelete = true;
                    }
                }
            } else{
                callrects[cmenu.scatidx].rects.splice(cmenu.xidx,1);
            }
            
            let totalrectper = 0;
            for (let i = 0; i < callrects[cmenu.scatidx].rects.length; i++) {
                const rectitem = callrects[cmenu.scatidx].rects[i];
                if(!rectitem.isDelete){
                    totalrectper = (totalrectper + rectitem.percentage);
                }
            }
            callrects[cmenu.scatidx].percentage = totalrectper;

            let isruledeleted = false;
            /* if(totalrectper === 0){
                let isruleitem = callrects[cmenu.scatidx].type === catRectEnums.rule;
                if(isruleitem){
                    isruledeleted = true;
                }

                if(callrects[cmenu.scatidx].isNew){
                    callrects.splice(cmenu.scatidx,1);
                } else{
                    callrects[cmenu.scatidx].isDelete = true;
                }
            } */

            this.props.setRects(callrects, null, false, null, false, true, isruledeleted);
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
        
        let cutitem = callrects[contextitem.scatidx].rects[contextitem.xidx];

        /* let filterrectbrands = cutitem.brands.filter(x => !x.isDelete && x.width > 0 && x.percentage > 0);
        if(filterrectbrands && filterrectbrands.length > 0){
          alertService.error(this.props.t("CANNOT_CUT_BRANDS_AVAILABLE"));
          this.setState({ isviewcmenu: false,  contxtmenu: {xpos:0, ypos: 0, xidx: 0, scatidx: 0} });
          return false;
        } */

        if(cutitem.isNew){
            callrects[contextitem.scatidx].rects.splice(contextitem.xidx,1);
        } else{
            cutitem["isDelete"] = true;
        }

        let isruledeleted = false;
        /* let notdeletedrects = callrects[contextitem.scatidx].rects.filter(x => !x.isDelete);

        if(!notdeletedrects || notdeletedrects.length === 0){
            let isruleitem = (callrects[contextitem.scatidx].type === catRectEnums.rule);
            if(isruleitem){
                isruledeleted = true;
            }

            if(callrects[contextitem.scatidx].isNew){
                callrects.splice(contextitem.scatidx, 1);
            } else{
                callrects[contextitem.scatidx]["isDelete"] = true;
            }
        } */
        
        let cutlist = JSON.parse(JSON.stringify(this.props.cutBoxList));
        cutlist.push(contextitem);
        //console.log(cutlist);
        this.setState({ isviewcmenu: false,  contxtmenu: {xpos:0, ypos: 0, xidx: 0, scatidx: 0} });
        //this.props.updateCutList(cutlist);
        this.props.setRects(callrects, cutlist, false, null, false, true, isruledeleted);
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
        e.stopPropagation();
        e.preventDefault();

        // let normalize_pointer = this.getScreenPointer(e);
        // this.setState({ droppedLocation: normalize_pointer });
    }
    
    render() {
        
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

                            <DrawViewClipboard isShowClipboard={this.state.isShowClipboard} cutBoxList={this.props.cutBoxList} t={this.props.t}
                            displayRatio={this.state.displayRatio}
                            dragStart={this.dragStart}
                            droppedCutItem={this.droppedCutItem}
                            ghostFromParent={this.ghostFromParent}
                            drawRectCanvas={this.drawRectCanvas} />
                        </li>
                    :<></>}
                </ul>

                <Col className="mainsvg-content" id="mainsvg-content" ref={this.displaydiv} onContextMenu={e => e.preventDefault()}>
                    {this.state.isviewcmenu?
                        <ContextMenu isRTL={this.props.isRTL} citem={this.state.contxtmenu.citem} 
                            handlechangeobj={this.handleChangeObj} 
                            handledelete={this.handleDeleteRect} 
                            handleCutBox={this.handleCutBox}
                            handlclose={() => this.setState({isviewcmenu:false})} 
                            xpos={this.state.isviewcmenu?this.state.contxtmenu.xpos:0} 
                            ypos={this.state.isviewcmenu?this.state.contxtmenu.ypos:0} />:<></>}

                    {this.state.viewfieldobj?<>
                        <svg id="mainsvg-view" className={"drawsvg "+((this.props.activeTool === "draw" && this.props.isEnableDraw) || this.props.activeTool?this.props.activeTool:"")} style={{cursor: this.state.activeTool, direction: "ltr"}} viewBox={"0 0 "+this.state.divWidth+" "+this.state.divHeight} 
                        onMouseDown={this.startNewRect} onMouseMove={this.changeDashRect} onMouseUp={this.drawNewRect} 
                        width={this.state.divWidth} height={this.state.svgheight} version="1.1" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
                            
                            <rect color={(this.props.dmode?'#2CC990':'#5128a0')} width={this.state.divWidth} height={this.state.viewfieldobj.drawHeight} fill="none" />
                            <rect x={this.state.viewfieldobj.drawX} y={0} width={this.state.divWidth} height={this.state.viewfieldobj.drawHeight} strokeWidth={3} fill="none" style={{ stroke: (this.props.dmode?'#2CC990':'#cfbbf3'),display:"block",margin:"auto" }} ></rect>
                            
                            {(this.state.viewfieldobj.field_shelves?this.state.viewfieldobj.field_shelves.map((shelf, i) => <React.Fragment key={i}>
                                <rect className={"sftrect"+(!shelf.isAllowEdit?" notallow-edit":"")} width={this.state.divWidth} height={shelf.drawHeight} x={0} y={shelf.y} style={{ strokeWidth: 1, stroke: (this.props.dmode?'#2CC990':'#cfbbf3'), fill: 'transparent', fillOpacity: (shelf.isEyeLevel?0.3:1) }}id={i} ref={(r) => this[i] = r} />
                                {/* <GapRect fidx={0} sidx={i} unqid={0+""+i} shelfitem={shelf} width={this.state.divWidth} height={shelf.drawGap} x={0} y={shelf.y + (shelf.drawHeight?shelf.drawHeight:0)} field={this.state.viewfieldobj} validateShelveMove={this.validateShelveMove} changePositionObj={this.changePositionObj} dmode={this.props.dmode} /> */}
                                <rect width={this.state.divWidth} height={shelf.drawGap} x={0} y={shelf.y + (shelf.drawHeight?shelf.drawHeight:0)} 
                                style={{ strokeWidth: 1, stroke: (!shelf.isAllowEdit?"#555":shelf.isEyeLevel?'#5128a0':this.props.dmode?'#2CC990':'#cfbbf3'), strokeOpacity: (!shelf.isAllowEdit?0.2:1), fill: (!shelf.isAllowEdit?"#555":shelf.isEyeLevel?'#5128a0':this.props.dmode?'#2CC990':'#bba2eb'), fillOpacity: 0.6 }} />
                            </React.Fragment>) : (<></>))}

                            {this.state.cutDragEnabled?<rect className='cutdrag-rect' onDragOver={(e) => this.changeDroppedLocation(e)} onDrop={(e) => this.droppedCutItem(e)} onMouseDown={e => this.handleLayoutClick(e)} x={0} y={0} width={this.state.divWidth} height={this.state.divHeight} fill="rgba(255, 255, 255, 0.1)" stroke="none"></rect>:<></>}
                            
                            {!this.props.isReloadingItems && this.props.rectsets && this.props.rectsets.length > 0?<>
                                {this.props.rectsets.map((xitem,xidx) => {
                                    let rectno = 0;
                                    return <React.Fragment key={xidx}>
                                        {!xitem.isDelete && xitem.rects && xitem.rects.length > 0?<>
                                            
                                            {xitem.rects.map((zitem,zidx) => {
                                                rectno = (!zitem.isDelete && zitem.width > 0 && zitem.height > 0?(rectno + 1):rectno);
                                                return <React.Fragment key={zidx}>
                                                    {!zitem.isDelete && zitem.width > 0 && zitem.height > 0?<g> 
                                                        {zitem.brands.map((yitem,yidx) => {
                                                            let bgfillcolor = getNameorIdorColorofBox(yitem, "color");
                                                            return <React.Fragment key={yidx}>
                                                                {!yitem.isDelete && yitem.rects && yitem.rects.length > 0?<> 
                                                                    {yitem.rects.map((ritem,ridx) => {
                                                                        return <React.Fragment key={ridx}>
                                                                            {!ritem.isDelete && ritem.width > 0 && ritem.height > 0?<>
                                                                                <rect x={ritem.x} y={ritem.y} width={ritem.width} height={ritem.height} stroke={bgfillcolor} strokeWidth="2" strokeOpacity={0.3} fill={bgfillcolor} fillOpacity={0.1} />
                                                                            </>:<></>}
                                                                        </React.Fragment>
                                                                    })}
                                                                    
                                                                </>:<></>}
                                                            </React.Fragment>;
                                                        })}

                                                        <Rect isEdit={this.props.isEdit} isshowcontrols={true} curno={zidx} parentidx={xidx} 
                                                            isbrand={false} 
                                                            fidx={"rct-"+xidx+""+zidx} 
                                                            x={zitem.x} y={zitem.y} width={zitem.width} height={zitem.height} 
                                                            isAUIDisabled={this.props.isAUIDisabled}
                                                            perContentWidth={this.props.perContentWidth}
                                                            rectsets={this.props.rectsets} 
                                                            viewWidth={this.state.divWidth} 
                                                            viewHeight={380} 
                                                            handleContextMenu={this.handleContextMenu} 
                                                            mainitem={zitem} 
                                                            parentitem={xitem} 
                                                            warningRedirect={this.props.warningRedirect} 
                                                            trans={this.props.t} 
                                                            saveCategoryObj={this.props.saveCategoryObj} 
                                                            catrectitem={this.props.selectedCatRect} 
                                                            boxno={rectno} isRTL={this.props.isRTL} 
                                                            parentWidth={this.state.divWidth} 
                                                            parentHeight={this.state.viewfieldobj.drawHeight} 
                                                            fieldObj={this.state.viewfieldobj} 
                                                            layoutWidth={this.state.divWidth} 
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



