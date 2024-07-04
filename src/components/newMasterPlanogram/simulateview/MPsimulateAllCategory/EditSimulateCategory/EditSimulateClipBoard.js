import React, { Component } from 'react';
import { Col, ButtonGroup, Button } from 'react-bootstrap';
import FeatherIcon from 'feather-icons-react';
import { VersionsIcon, XCircleFillIcon } from '@primer/octicons-react';

import i18n from "../../../../../_translations/i18n"; 

import { removeGhostImage } from '../../../../common_layouts/ghostDragWrapper';

class EditSimulateClipBoard extends Component {

    handleGhostOnDrag = (e, obj) => {
        let viewobj = JSON.parse(JSON.stringify(obj));
        let drawzoomx = this.props.zoomXRatio;
        let prodwidth = (this.props.clipDragType === "SINGLE"?obj.drawWidth:obj.width);
        let prodheight = (this.props.clipDragType === "SINGLE"?obj.drawHeight:obj.height);

        viewobj["drawWidth"] = prodwidth * (drawzoomx > 0?(drawzoomx * 2):1);
        viewobj["drawHeight"] = prodheight * (drawzoomx > 0?(drawzoomx * 2):1);
        
        this.props.ghostFromParent(e, viewobj);
    }

    removeSingleGhost = (iscutparent, e, cutobj, cutidx) => {
        this.props.setPreviewGuid(true);
        removeGhostImage();

        if(iscutparent && e){
            /* let clientxy = this.props.xyChangeCoords(e);
            
            let cutexportobj = cutobj;
            cutexportobj["x"] = clientxy.x;
            cutexportobj["y"] = clientxy.y;

            let cutdragobj = this.props.cutDragObj;
            this.props.dropCutblock(e, cutdragobj.shelfobj, null, cutdragobj.shelfidx, cutexportobj, cutidx, cutdragobj.fieldobj); */
        }
    }

    render() {
        let divHeight = this.props.catDivHeight;

        return (
            <div className="clipboard-simulate">
                {/* <h4>{i18n.t("CLIP_BOARD")}</h4> */}

                {/* <Col>
                    {(this.props.cutArray && this.props.cutArray.length>0)?<>
                        
                        <Col style={{height:"5px",marginTop:"10px"}}>
                            <ButtonGroup style={{direction:"ltr"}} className={"pviewchange-list "+(this.props.isRTL=== "rtl"?"float-left":"float-right")}>
                                <Button variant="secondary" onClick={() => this.props.toggleClipDragType("SINGLE")} className={(this.props.clipDragType==="SINGLE"?"active":"")} title="Single item drag"><FeatherIcon icon="square" size={14} /></Button>
                                <Button variant="secondary" onClick={() => this.props.toggleClipDragType("MULTIPLE")} className={(this.props.clipDragType==="MULTIPLE"?"active":"")} title="Multiple items drag"><VersionsIcon size={16} /></Button>
                            </ButtonGroup>
                        </Col>
                        <Col className="scroll-content" style={{marginTop:"15px",width:"100%"}}>
                            {this.props.cutArray.map((obj,i)=>{
                                return <Col className={"block-out"+(obj.iscopy?" copy-item":"")} key={i} draggable={this.props.clipDragType==="MULTIPLE"}
                                onDragStart={e => (this.props.clipDragType==="MULTIPLE"?this.props.dragStart(e,obj,false,i):null)} 
                                onMouseDown={(e) => (this.props.clipDragType==="MULTIPLE"?this.props.drawRectCanvas(obj):null)}
                                onDrag={e => (this.props.clipDragType==="MULTIPLE"?this.handleGhostOnDrag(e,obj):null)} 
                                onDragEnd={() => (this.props.clipDragType==="MULTIPLE"?this.removeSingleGhost():null)}>

                                    <div className='img-wrapper' style={{width: (obj.width + 10), height: (obj.height + 10),direction: "ltr" }}>
                                        <span className='close-link' onClick={() => this.props.updateSingleCutProduct(null, true, i)}><XCircleFillIcon size={12} /></span>

                                        {(obj.prods && obj.prods.length>0)?obj.prods.map((imge,f)=>{
                                            return <React.Fragment key={f}>
                                                <img src={imge.imageUrl} height={imge.drawHeight} width={imge.drawWidth} style={{marginLeft: imge.x, marginTop: imge.gaptolowy}} alt=""
                                                    draggable={this.props.clipDragType==="SINGLE"}
                                                    onDragStart={e => (this.props.clipDragType==="SINGLE"?this.props.dragStart(e, imge, false, i, true, f):null)} 
                                                    onMouseDown={(e) => (this.props.clipDragType==="SINGLE"?this.props.drawRectCanvas(imge):null)}
                                                    onDrag={e => (this.props.clipDragType==="SINGLE"?this.handleGhostOnDrag(e,imge):null)} 
                                                    onDragEnd={() => (this.props.clipDragType==="SINGLE"?this.removeSingleGhost(imge):null)}
                                                    /> 

                                            </React.Fragment>
                                        }):<></>}
                                    </div>
                                </Col>
                            })}
                        </Col>
                        
                    </>:<><Col xs={12} className="text-center" style={{paddingTop:"10px"}}><h5 className='noclip-txt'>{i18n.t("NO_CLIPBOARD_ITEMS")}</h5></Col></>}
                </Col> */}
                <Col>
                {(this.props.cutNewArray && this.props.cutNewArray.length>0)?<>
                        
                        <Col style={{height:"5px",marginTop:"10px"}}>
                            <ButtonGroup style={{direction:"ltr"}} className={"pviewchange-list "+(this.props.isRTL=== "rtl"?"float-left":"float-right")}>
                                <Button variant="secondary" onClick={() => this.props.toggleClipDragType("SINGLE")} className={(this.props.clipDragType==="SINGLE"?"active":"")} title="Single item drag"><FeatherIcon icon="square" size={14} /></Button>
                                <Button variant="secondary" onClick={() => this.props.toggleClipDragType("MULTIPLE")} className={(this.props.clipDragType==="MULTIPLE"?"active":"")} title="Multiple items drag"><VersionsIcon size={16} /></Button>
                            </ButtonGroup>
                        </Col>
                        <Col className="scroll-content" style={{marginTop:"15px",width:"100%",maxHeight:(divHeight > 0?(divHeight - 30):0)}}>
                            {this.props.cutNewArray.map((obj,i)=>{
                                var filteredshelf=obj.shelf.filter(c=>c.isDelete!==true)
                                return <Col className={"block-out"+(obj.mode==="copy"?" copy-item":"")} key={i} draggable={this.props.clipDragType==="MULTIPLE"}
                                onDragStart={e => (this.props.clipDragType==="MULTIPLE"?this.props.dragStart(e,obj,false,i):null)} 
                                onMouseDown={(e) => (this.props.clipDragType==="MULTIPLE"?this.props.drawRectCanvas(obj):null)}
                                onDrag={e => (this.props.clipDragType==="MULTIPLE"?this.handleGhostOnDrag(e,obj):null)} 
                                onDragEnd={(e) => (this.props.clipDragType==="MULTIPLE"?this.removeSingleGhost(true, e, obj, i):null)}
                                >
                                    {
                                        obj.mode==="delete"?<span className='option-icon' ><FeatherIcon icon={"trash"} size={10} strokeWidth={3} /></span>:
                                        obj.mode==="cut"?<span className='option-icon' ><FeatherIcon icon={"scissors"} size={10} strokeWidth={3} /></span>:
                                        obj.mode==="copy"? <span className='option-icon' ><FeatherIcon icon={"copy"} size={10} strokeWidth={3} /></span>:
                                        <></>
                                    }
                                                
                                    <div className='innerdiv'>
                                        <span className='close-link' onClick={() => this.props.updateSingleCutProduct(null, true, i,obj.groupUUID,true)}><XCircleFillIcon size={12} /></span>
                                        {(filteredshelf && filteredshelf.length>0)?filteredshelf.map((shlf,k)=>{
                                            return <div key={k} className='img-wrapper'
                                            style={{
                                               width: (shlf.width + 10), 
                                               height: (shlf.height + 10),
                                               direction: "ltr"
                                                }}>
                                                
                                                {(shlf.products && shlf.products.length>0)?shlf.products.map((imge,f)=>{
                                                    return <React.Fragment key={f}>
                                                        {imge.isDelete!==true?<img src={imge.imageUrl} height={imge.drawHeight} width={imge.drawWidth} style={{marginLeft: imge.x, marginTop: imge.gaptolowy}} alt=""
                                                            draggable={this.props.clipDragType==="SINGLE"}
                                                            onDragStart={e => (this.props.clipDragType==="SINGLE"?this.props.dragStart(e, imge, false, i, true, f,k,imge.id,shlf.shelfRank,obj.groupUUID):null)} 
                                                            onMouseDown={(e) => (this.props.clipDragType==="SINGLE"?this.props.drawRectCanvas(imge):null)}
                                                            onDrag={e => (this.props.clipDragType==="SINGLE"?this.handleGhostOnDrag(e,imge):null)} 
                                                            onDragEnd={() => (this.props.clipDragType==="SINGLE"?this.removeSingleGhost(imge):null)}
                                                            />:<></> }

                                                    </React.Fragment>
                                                }):<></>}
                                            </div>
                                        }):<></>}
                                        
                                    </div>
                                </Col>
                            })}
                        </Col>
                        
                    </>:<><Col xs={12} className="text-center" style={{paddingTop:"10px"}}><h5 className='noclip-txt'>{i18n.t("NO_CLIPBOARD_ITEMS")}</h5></Col></>}
                </Col>
            </div>
        );
    }
}

export default EditSimulateClipBoard;