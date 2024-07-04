import React, { Component } from 'react';
import { Col, ButtonGroup, Button } from 'react-bootstrap';
import FeatherIcon from 'feather-icons-react';
import { VersionsIcon, XCircleFillIcon } from '@primer/octicons-react';

import i18n from "../../../../_translations/i18n"; 

// import { removeGhostImage } from '../../../common_layouts/ghostDragWrapper';

export default class PgDunitClipBoard extends Component {

    handleGhostOnDrag = (e, obj) => {
        let viewobj = structuredClone(obj);
        let drawzoomx = this.props.zoomDrawX;

        let prodwidth = 0;
        let prodheight = 0;

        if(this.props.clipDragType === "MULTIPLE"){
            for (let i = 0; i < obj.shelf.length; i++) {
                const shelfobj = obj.shelf[i];
                
                if(!shelfobj.isDelete){
                    prodwidth = (prodwidth < shelfobj.width?shelfobj.width:prodwidth);
                    prodheight = (prodheight + shelfobj.height);
                }
            }
        } else{
            prodwidth = obj.drawWidth;
            prodheight = obj.drawHeight;
        }

        viewobj["drawWidth"] = prodwidth * (drawzoomx > 0?(drawzoomx * 2):1);
        viewobj["drawHeight"] = prodheight * (drawzoomx > 0?(drawzoomx * 2):1);
        
        this.props.ghostFromParent(e, viewobj);
    }

    removeSingleGhost = () => {
        this.props.prodDragEnd();
        // removeGhostImage();
    }

    singleProdDragStart = (evt, prodobj, parentIdx, deptIdx, shelfIdx, prodIdx) => {
        let sendProdObj = structuredClone(prodobj);
        sendProdObj["clipParent"] = parentIdx;
        sendProdObj["clipDeptIdx"] = deptIdx;
        sendProdObj["clipShelfIdx"] = shelfIdx;
        sendProdObj["clipProdIdx"] = prodIdx;
        sendProdObj["startingXPoint"] = 0;
        sendProdObj["startingYPoint"] = 0;

        let newcutobj = {
            cutidx: parentIdx,
            deptidx: deptIdx,
            shelfidx: shelfIdx,
            singleidx: prodIdx,
            mode: "copy",
            x: 0, y: 0,
            drawWidth: prodobj.drawWidth,
            drawHeight: prodobj.drawHeight,
            width: prodobj.width,
            height: prodobj.height,
            uom: prodobj.uom,
            shelf: [{
                x: 0, y: 0,
                drawWidth: prodobj.drawWidth,
                drawHeight: prodobj.drawHeight,
                width: prodobj.width,
                height: prodobj.height,
                products: [sendProdObj],
            }],
        };
        // console.log(newcutobj);

        this.props.dragStart(evt, newcutobj, false, parentIdx, true, prodIdx, deptIdx);
    }

    render() {
        let { cutArray, totalCutCount } = this.props;
        
        return (
            <div className="clipboard-simulate">
                <Col>
                    {(totalCutCount && totalCutCount > 0)?<>
                        
                        <Col style={{height:"5px",marginTop:"35px"}}>
                            <ButtonGroup style={{direction:"ltr"}} className={"pviewchange-list "+(this.props.isRTL=== "rtl"?"float-left":"float-right")}>
                                <Button variant="secondary" onClick={() => this.props.toggleClipDragType("SINGLE")} className={(this.props.clipDragType==="SINGLE"?"active":"")} title="Single item drag"><FeatherIcon icon="square" size={14} /></Button>
                                <Button variant="secondary" onClick={() => this.props.toggleClipDragType("MULTIPLE")} className={(this.props.clipDragType==="MULTIPLE"?"active":"")} title="Multiple items drag"><VersionsIcon size={16} /></Button>
                            </ButtonGroup>
                        </Col>
                        <Col className="scroll-content" style={{marginTop:"10px",width:"100%"}}>
                            {cutArray && cutArray.clipboardData?<>
                                {cutArray.clipboardData.map((deptClip, deptClipIdx) => {
                                    return <React.Fragment key={deptClipIdx}>
                                        {!deptClip.isDelete?<>
                                            {deptClip.clipboardData.map((obj,i) => {
                                                return <React.Fragment key={i}>
                                                    {!obj.isDelete?<>
                                                        <Col className={"block-out"+(obj.mode === "copy"?" copy-item":"")} draggable={this.props.clipDragType==="MULTIPLE"}
                                                        onDragStart={e => (this.props.clipDragType==="MULTIPLE"?this.props.dragStart(e,obj,false,i,false,i,deptClipIdx):null)} 
                                                        onMouseDown={(e) => (this.props.clipDragType==="MULTIPLE"?this.props.drawRectCanvas(obj):null)}
                                                        onDrag={e => (this.props.clipDragType==="MULTIPLE"?this.handleGhostOnDrag(e,obj):null)} 
                                                        onDragEnd={() => (this.props.clipDragType==="MULTIPLE"?this.removeSingleGhost():null)}>
                                                            <span className='close-link' onClick={() => this.props.updateSingleCutProduct(null, true, i, deptClipIdx)}><XCircleFillIcon size={12} /></span>
                    
                                                            {obj.shelf.map((shelfClipObj, shelfClipIdx) => {
                                                                return <React.Fragment key={shelfClipIdx}>
                                                                    {!shelfClipObj.isDelete?<div className='img-wrapper' style={{width: (shelfClipObj.width + 10), height: (shelfClipObj.height + 10),direction: "ltr" }}>
                                                                        {(shelfClipObj.products && shelfClipObj.products.length>0)?shelfClipObj.products.map((imge,f)=>{
                                                                            return <React.Fragment key={f}>
                                                                                {!imge.isDelete?<img src={imge.imageUrl} height={imge.drawHeight} width={imge.drawWidth} style={{marginLeft: imge.startingXPoint, marginTop: imge.startingYPoint}} alt=""
                                                                                    draggable={this.props.clipDragType==="SINGLE"}
                                                                                    onDragStart={e => (this.props.clipDragType==="SINGLE"?this.singleProdDragStart(e, imge, deptClipIdx, i, shelfClipIdx, f):null)} 
                                                                                    onMouseDown={(e) => (this.props.clipDragType==="SINGLE"?this.props.drawRectCanvas(imge):null)}
                                                                                    onDrag={e => (this.props.clipDragType==="SINGLE"?this.handleGhostOnDrag(e,imge):null)} 
                                                                                    onDragEnd={() => (this.props.clipDragType==="SINGLE"?this.removeSingleGhost(imge):null)}
                                                                                    />:<></>}
                                                                            </React.Fragment>
                                                                        }):<></>}
                                                                    </div>:<></>}
                                                                </React.Fragment>;
                                                            })}
                                                        </Col>
                                                    </>:<></>}
                                                </React.Fragment>
                                            })}
                                        </>:<></>}
                                    </React.Fragment>
                                })}
                            </>:<></>}
                        </Col>
                        
                    </>:<>
                        <ul className="list-inline pgview-addeditems">
                            <li className='list-inline-item text-center nocontent-txt'>{i18n.t("NO_CONTENT_FOUND")}</li>
                        </ul>
                    </>}
                </Col>
            </div>
        );
    }
}