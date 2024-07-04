import React from "react";
import { v4 as uuidv4 } from 'uuid'; //unique id
import { Button, Col } from 'react-bootstrap';
import FeatherIcon from 'feather-icons-react';

import { AspectRatioDrawBox, measureConverter, roundOffDecimal } from '../../../../_services/common.service';
import { submitCollection } from '../../../../_services/submit.service'; //gets backend paths
import { submitSets } from '../../../UiComponents/SubmitSets'; //backcalls handlers

import { handlePanView, handleZoomInOut, sortShelvesDesc } from '../../../planograms/planDisplayUnit/additionalcontents'; //needed common functions
import { compareSideToAllowDrop } from '../../../planograms/planDisplayUnit/viewOverlapSafty'; //overlap compare function and overlap safty margin change view

import ActiveViewMenu from './activerightclickmenu';

export default class ActiveDisplayUnitView extends React.Component{
    constructor(props) {
        super(props);

        this.displaydiv = React.createRef(); //main preview div

        this.state = {
            divWidth: 0, divHeight: 0,
            viewHeight: 0, viewWidth: 0, displayRatio: 0, displayUOM: "cm",
            saveObj: null, 

            aczoompanactive: false, acactivetool: "default", acstartpan: false, aczoomDrawX: 0,
        }
    }

    componentDidMount() {
        this._isMounted = true;

        if (this._isMounted) {
            this.setState({
                divWidth: (this.displaydiv.current && this.displaydiv.current.offsetWidth?(this.displaydiv.current.offsetWidth - 50):0),
                divHeight: (this.displaydiv.current && this.displaydiv.current.offsetHeight?(this.displaydiv.current.offsetHeight):0),
            }, () => {
                //console.log(this.props);
                if(this.props.compdetails && this.props.compdetails.fieldDto){
                    this.getFieldDetails(this.props.compdetails.fieldDto.fieldId); //onload load field field details
                }
            });
        }
    }

    componentWillUnmount() {
        this._isMounted = false;
    }

    //get field details
    getFieldDetails = (fieldId) => {
        if(!this.props.istesting){
            submitSets(submitCollection.getSingleFloorFieldByRelation, "?floorLayoutHasFieldId="+fieldId, true).then(res => {
                //console.log(res);
                if(res && res.status && res.extra){
                    var cresltobj = res.extra;
                    this.reinitSaveObj(cresltobj);
                } else{
                    this.setState({ saveObj: null });
                }
            });
        }
    }

    //reninit current field object
    reinitSaveObj = (cresltobj) => {
        //check master data and set if not defined
        cresltobj.masterFieldUom = (cresltobj.masterFieldUom&&cresltobj.masterFieldUom!=="none"?cresltobj.masterFieldUom:cresltobj.fieldDto.uom);
        cresltobj.masterFieldWidth = (cresltobj.masterFieldWidth&&cresltobj.masterFieldWidth>0?cresltobj.masterFieldWidth:cresltobj.fieldDto.width);
        cresltobj.masterFieldHeight = (cresltobj.masterFieldHeight&&cresltobj.masterFieldHeight>0?cresltobj.masterFieldHeight:cresltobj.fieldDto.height);

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

        } else if(cresltobj.id > 0 && cresltobj.planogramShelfDto.length > 0){
            for (var l = 0; l < cresltobj.planogramShelfDto.length; l++) {
                const cshelveobj = cresltobj.planogramShelfDto[l];

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
                                    }
                                }
                            }
                        }
                    }
                    plgmprod["tempoldqty"] = tempoldqty;
                }
            }
            cresltobj.planogramShelfDto.sort(sortShelvesDesc); //sort shelves
        }
        
        this.setState({
            saveObj: cresltobj, bkpSaveObj: cresltobj, existnewprodlist: [],
            displayUOM: cresltobj.masterFieldUom, 
        }, () => {
            this.calculateRate(true);
        });
    }
    //floor draw dementions calculate
    calculateRate(isupdateexist) {
        if(this.state.saveObj && Object.keys(this.state.saveObj).length > 0){
            var csobj = this.state.saveObj;
            //calculate dimention
            var dimention = AspectRatioDrawBox(csobj.masterFieldWidth,csobj.masterFieldHeight,this.state.divWidth,this.state.divHeight);
            //current field width/height
            var dheight = measureConverter(csobj.masterFieldUom,this.state.displayUOM,csobj.masterFieldHeight) * dimention;
            var dwidth = measureConverter(csobj.masterFieldUom,this.state.displayUOM,csobj.masterFieldWidth) * dimention;
            
            this.setState({ viewHeight: dheight, viewWidth: dwidth, displayRatio: dimention }, () => {
                this.drawRect(isupdateexist);
            });
        }
    }
    //calculate product shelves and locations draw width,height,x,y to current field ratio
    drawRect(isupdateexist,isnotcheckxy) {
        var csobj = this.state.saveObj;
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
        
        //set state
        this.setState({ saveObj: csobj});
    }

    //viewProduct details show
    viewProdOnClick = (e,prod,isclose) => {
        setTimeout(() => {
            if(isclose){
                this.props.viewProdOnClick(null,null,isclose);
            } else{
                e.preventDefault();
                if(e.nativeEvent.which === 1){ 
                    this.props.viewProdOnClick(e,prod,isclose);
                }    
            }    
        }, 200);
    }

    //new tools handle
    handleToolControls = (viewid,tooltype, event, startpan) => {
        let activezoompan = true;

        let svg = document.getElementById(viewid);
        let viewBox = svg.viewBox.baseVal;

        //view width/height
        let vwidth = this.state.viewWidth;
        let vheight = this.state.viewHeight;

        let iszpactive = this.state.aczoompanactive;
        let actool = this.state.acactivetool;
        let stpan = this.state.acstartpan;

        let aczoomdrawx = this.state.aczoomDrawX;
        //aczoompanactive: false, acactivetool: "default", acstartpan: false,
        if(tooltype === "zoomin"){
            handleZoomInOut(viewid,true,false);

            aczoomdrawx = aczoomdrawx + 1;
            this.setState({ isShowProdView: false, isenablefieldedit: false, isviewvmenu: false });
        } else if(tooltype === "zoomout"){
            if(roundOffDecimal(vwidth,2) <= roundOffDecimal((viewBox.width * 2),2)){
                activezoompan = false;
                handleZoomInOut(viewid,false,true,vwidth,vheight);
                aczoomdrawx = 0;
            } else{
                handleZoomInOut(viewid,false,false,vwidth);
                aczoomdrawx = aczoomdrawx - 1;
            }

        } else if(tooltype === "zoomreset"){
            activezoompan = false;
            handleZoomInOut(viewid,false,true,vwidth,vheight);

            this.setState({ acactivetool: "default" });
            aczoomdrawx = 0;
        }
        
        if(tooltype === "zoomin" || tooltype === "zoomout" || tooltype === "zoomreset"){
            this.setState({ aczoomDrawX: aczoomdrawx, isviewcmenu: false, contxtmenu:{isexpand: false} });
        }
        
        if(tooltype === "pan"){
            if(actool === "pantool" && stpan){
                let fielddetails = { drawWidth: this.state.aviewWidth, drawHeight: this.state.aviewHeight };
                handlePanView(viewid, event, iszpactive, this.state.zoomDrawX, fielddetails);
            }
        } else if(tooltype === "panstart"){
            this.setState({ acstartpan: startpan });
        } else if(tooltype === "pantool"){
            this.setState({ acactivetool: (tooltype === actool?"default":tooltype) });
        } else{
            this.setState({ aczoompanactive: activezoompan, allowovrflwprod: (activezoompan && this.state.allowovrflwprod?false:this.state.allowovrflwprod) });
        }
    }

    render() {
        return (<>
            <ul className={"newpgtop-btnlist list-inline "+(this.props.isRTL === "rtl"?"float-left":"float-right")} style={{marginTop:"-8px"}}>
                <li className="list-inline-item tool-controls-list"><Button variant="outline-dark" onClick={() => this.handleToolControls('ac-mainsvg-view',"zoomin")} className="btn-with-icon" size="sm" title="Zoom-in"><FeatherIcon icon="zoom-in" size={14}/></Button></li>
                <li className="list-inline-item tool-controls-list"><Button variant="outline-dark" onClick={() => this.handleToolControls('ac-mainsvg-view',"zoomout")} className="btn-with-icon" size="sm" title="Zoom-out"><FeatherIcon icon="zoom-out" size={14}/></Button></li>
                <li className="list-inline-item tool-controls-list" style={{marginRight:"10px"}}><Button variant="outline-dark" onClick={() => this.handleToolControls('ac-mainsvg-view',"zoomreset")} className={"btn-with-icon "} size="sm" title="Zoom-reset"><FeatherIcon icon="x-circle" size={14}/></Button></li>
                <li className="list-inline-item tool-controls-list"><Button variant="outline-dark" onClick={() => this.handleToolControls('ac-mainsvg-view',"pantool")} className={"btn-with-icon "+(this.state.acactivetool === "pantool"?"active":"")} size="sm" title="Zoom-pan"><FeatherIcon icon="move" size={14}/></Button></li>
            </ul>

            <Col className={"NDUrowStructuredraw"} onContextMenu={e => e.preventDefault()} dir="ltr" ref={this.displaydiv} style={{minHeight:"400px",padding:"35px 55px", paddingTop:"5px",overflow:"hidden"}}>
            {(this.state.viewHeight > 0) &&<>

            {this.props.isviewvmenu?<ActiveViewMenu isRTL={this.props.isRTL} viewProd={this.props.viewmenu.item} handlclose={e => this.viewProdOnClick(e,null,true)} xpos={this.props.isviewvmenu?this.props.viewmenu.xpos:0} 
            ypos={this.props.isviewvmenu?this.props.viewmenu.ypos:0} />:<></>}
            
            <svg id="ac-mainsvg-view" ref={(r) => this["mainsvg"] = r} 
                width={(!this.state.aczoompanactive?this.state.viewWidth:"100%")} 
                height={(!this.state.aczoompanactive?this.state.viewHeight:"400px")}  
                viewBox={'0 0 '+this.state.viewWidth+' '+this.state.viewHeight}
                onMouseDown={e => this.handleToolControls('ac-mainsvg-view',"panstart",e,true)} 
                onMouseUp={e => this.handleToolControls('ac-mainsvg-view',"panstart",e,false)} 
                onMouseMove={e => this.handleToolControls('ac-mainsvg-view',"pan",e)}
                style={{ outline: (this.props.dmode?'#2CC990':'#5128a0')+' solid 3px',display:"block",margin:"auto" }} 
                >

                {(this.state.saveObj&&this.state.saveObj.planogramShelfDto?this.state.saveObj.planogramShelfDto.map((shelf, i) => <g key={i} className={"shelve-"+shelf.id}>
                    {shelf.isDelete === false?<>
                        {(shelf.overLappingDto?shelf.overLappingDto.map((rect, x) => {
                            return <g key={x}><image pointerEvents="all" preserveAspectRatio="none" href={rect.productDto.imageUrl} x={rect.x} y={rect.y} width={rect.drawWidth} height={rect.drawHeight} style={{opacity:"0.4"}} />
                            <rect x={rect.x} y={rect.y} width={rect.drawWidth} height={rect.drawHeight} fill="#B8B5FF" fillOpacity="0.5"></rect></g>;
                        }):<></>)}

                        <rect className="sftrect" width={shelf.drawWidth} height={shelf.drawHeight} x={shelf.x} y={shelf.y} style={{ strokeWidth: 1, stroke: (this.props.dmode?'#2CC990':'#5128a0'), fill: 'transparent', zIndex: -1 }} id={i} ref={(r) => this[i] = r} />
                        <rect width={shelf.drawWidth} height={shelf.drawGap} x={shelf.x} y={shelf.y+(shelf.drawHeight?shelf.drawHeight:0)} style={{ strokeWidth: 1, stroke: (this.props.dmode?'#2CC990':'#5128a0'), fill: (this.props.dmode?'#2CC990':'#5128a0'), zIndex: -1 }}></rect>

                        {(shelf.planogramProduct?shelf.planogramProduct.map((rect, x) => {
                            return <g key={x}>{(rect.isDelete === false?rect.productBlock.map((subrect, z) => {
                                return (subrect.isDelete === false?subrect.productLocations.map((locrect, n) => {
                                    var cintrlprod = this.state.currentInternalDraggableProd;
                                    var cblkobj = (this.state.isblockmove?this.state.currentSelectedBlock:null);
                                    var cintrlprodloc = (cintrlprod && Object.keys(cintrlprod).length > 0 && cintrlprod.prod?cintrlprod.prod.productBlock[cintrlprod.blockidx].productLocations[cintrlprod.locidx]:null);

                                    var cblkcolor = (cblkobj && Object.keys(cblkobj).length > 0 && cblkobj.id === subrect.id?true:false);
                                    var cimgcolor = (cintrlprod && Object.keys(cintrlprod).length > 0 && (locrect.id?locrect.id:"-") === (cintrlprodloc && cintrlprodloc.id !== undefined?cintrlprodloc.id:""));

                                    return (locrect.isDelete === false?<g key={n}>
                                        <image pointerEvents="all" preserveAspectRatio="none" x={locrect.x} y={locrect.y} width={locrect.drawWidth} height={locrect.drawHeight} href={rect.productInfo.imageUrl} onMouseDown={(e)=>this.viewProdOnClick(e,rect.productInfo)} key={n} ref={(r) => this["LR"+subrect.id+locrect.id] = r} draggable={false} style={{outlineColor:(cblkcolor?"#28a745":cimgcolor?"#dc3545":"#ccc")}} />
                                    </g>:<rect key={n} />);
                                }):<rect key={z} />);
                            }):<></>)}</g>;
                        }) : (<></>))}
                    </>:<></>}
                </g>) : (<></>))}

                {(this.state.acactivetool === "pantool" && this.state.aczoompanactive && this.state.acstartpan)?<rect x={0} y={0}  width={this.state.viewWidth} height={this.state.viewHeight} fill={(this.props.dmode?'#2CC990':'#5128a0')} fillOpacity={0.15} />:<></>}
            </svg>
            <Col className="col-centered" style={{width:((this.state.viewWidth+6)+"px"),marginLeft:"-3px", height:"15px", borderLeft: '3px solid '+(this.props.dmode?'#2CC990':'#5128a0'), borderRight: '3px solid '+(this.props.dmode?'#2CC990':'#5128a0')}}></Col></>}

        </Col>
        </>);    
    }
}
