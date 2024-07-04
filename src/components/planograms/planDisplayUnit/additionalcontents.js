import React, {useState, useRef} from 'react';
import { Modal, ListGroup, Col, Form, Row, InputGroup, ButtonGroup, Overlay, Tooltip, Button, Dropdown, Accordion, Badge } from 'react-bootstrap';
import { measureConverter, rotateStatus, roundOffDecimal, convertUomtoSym } from '../../../_services/common.service';
import { XIcon, SearchIcon, XCircleFillIcon, ListUnorderedIcon, ArrowSwitchIcon, IssueReopenedIcon, StopIcon, DiffAddedIcon, ChevronDownIcon, XCircleIcon, TrashIcon, PlusIcon } from '@primer/octicons-react';
import { useTranslation } from "react-i18next";
import PropTypes from 'prop-types';
import { CopyToClipboard } from 'react-copy-to-clipboard'; //copy text to clipboard
import { v4 as uuidv4 } from 'uuid'; //unique id
import Chart from "react-apexcharts";
// import randomColor from 'randomcolor';

import { TooltipWrapper } from '../../newMasterPlanogram/AddMethods';

//sort shelves by rank - desc
export function sortShelvesDesc ( a, b ) {
    if ( a.rank < b.rank ){
      return -1;
    }
    if ( a.rank > b.rank ){
      return 1;
    }
    return 0;
}
//sort shelves by rank - asc
export function sortShelvesAsc( a, b ) {
    if ( a.rank > b.rank ){
      return -1;
    }
    if ( a.rank < b.rank ){
      return 1;
    }
    return 0;
}

//find product is in block range
export function checkProductThoughBlock (x,y,prodobj,blockobj,isignoreprod,displayUOM,displayRatio,saftyMargin) {
    //check rotate details available
    var dragprodwidth = prodobj.width;
    var dragprodheight = prodobj.height;
    //check rotate object values available
    if(prodobj.rotatetype !== undefined && prodobj.rotatetype !== "" && prodobj.rotatetype !== rotateStatus.FN && prodobj.rotatetype !== rotateStatus.DFL){
        dragprodwidth = prodobj.rotatewidth;
        dragprodheight = prodobj.rotateheight;
    }
    //set xy,width/heights of product
    var sconvprodwidth = (measureConverter(prodobj.uom,displayUOM,dragprodwidth) * displayRatio);
    var sconvprodheight = (measureConverter(prodobj.uom,displayUOM,dragprodheight) * displayRatio);
    //add extra safty margin to check location in products
    var x1 = x - (saftyMargin + ((sconvprodwidth / 4) * 3));
    var y1 = y - (saftyMargin + ((sconvprodwidth / 4) * 3));
    var x2 = (x + sconvprodwidth) + (saftyMargin + ((sconvprodwidth / 4) * 3));
    var y2 = (y + sconvprodheight) + (saftyMargin + ((sconvprodwidth / 4) * 3));
    
    //check allow product in checking block
    var allowblock = false;
    if(blockobj){
        for (var i = 0; i < blockobj.productLocations.length; i++) {
            const locitem = blockobj.productLocations[i];
            if(!locitem.isDelete && (!isignoreprod || (isignoreprod !== locitem.id))){
                var xa = locitem.x;
                var ya = locitem.y;
                var xb = (locitem.x + locitem.drawWidth);
                var yb = (locitem.y + locitem.drawHeight);
                //check checking location safty margin in location inside location
                var isallowtoblock = checkThroughProductsTest(x1,y1,x2,y2,xa,ya,xb,yb);
                if(!isallowtoblock){
                    allowblock = true;
                }
            }
        }
    }
    return allowblock;
}
//check product location overlapping with looping location
export function checkThroughProductsTest (xa, ya, xb, yb, x1, y1, x2, y2) {

    var allowOnProducts = false;
    // console.log(x1 +"<"+ xb , x2 +">"+ xa , y1 +"<"+ yb , y2 +">"+ ya);
    if (x1 < xb && x2 > xa && y1 < yb && y2 > ya) {
        // console.log(x1 +"<"+ xb , x2 +">"+ xa , y1 +"<"+ yb , y2 +">"+ ya);
        allowOnProducts = true
    }

    return !allowOnProducts;
}

//check product is in bottom of field
export function checkProductIsInBottom (shelfy,shelfHeight,prody,prodHeight){
    var allowbottom = false
    var cshelvey = parseFloat((shelfy + shelfHeight)).toFixed(2);
    var cdelprody = (prody + prodHeight).toFixed(2);
    var saleSaftyMargon = 1; var saleSaftyMargon2 = 3;
    allowbottom = ((parseFloat(saleSaftyMargon2)+parseFloat(cshelvey)) > parseFloat(cdelprody) && (parseFloat(cshelvey) - parseFloat(saleSaftyMargon)) < parseFloat(cdelprody));
    return allowbottom
}

//check product available in current field
export function checkProdAvailabilityInFeild (prodId, csaveobj) {
    var available = false
    for (var m = 0; m < csaveobj.planogramShelfDto.length; m++) {
        const cshelveitem = csaveobj.planogramShelfDto[m];
        if(!cshelveitem.isDelete){
            for (var n = 0; n < cshelveitem.planogramProduct.length; n++) {
                const cpitem = cshelveitem.planogramProduct[n];
                if(!cpitem.isDelete && cpitem.productInfo.id === prodId){
                    for (var k = 0; k < cpitem.productBlock.length; k++) {
                        const prdblock = cpitem.productBlock[k];
                        if(!prdblock.isDelete){
                            for (let l = 0; l < prdblock.productLocations.length; l++) {
                                const prodLocation = prdblock.productLocations[l];
                                if(!prodLocation.isDelete){
                                    available = true
                                    break;
                                }
                            }
                        }
                    }
                }

            }
        }
    }

    return available
}

//update profit percentages
export function refreshRevProPercentages (cloadedrdlist) {
    //get current total revenues and sale info
    var draftingRevenue = cloadedrdlist["totalDraftingRevenue"]
    var draftingProfit = cloadedrdlist["totalDraftingProfit"]
    var prodList = cloadedrdlist["productSaleInformation"]
    //loop sale product list
    if(prodList && prodList.length > 0){
        for (let i = 0; i < prodList.length; i++) {
            var  prodSale = prodList[i];
            //if prod is in current field and effected sale info available
            if(prodSale.isInCurrentField && prodSale.effectedSaleInformation){
                var effectedSale = prodSale.effectedSaleInformation
                //get effected sale revenue/profit
                var totalrevenue = effectedSale["revenue"];
                var totalprofit = effectedSale["profit"];
                //calculate drafting profit percentage
                var cdraftprofit = draftingProfit
                var proPercentage = ((totalprofit / cdraftprofit) * 100);
                //calculate drafting revenue percentage
                var cdraftrevenue = draftingRevenue
                var revPercentage = ((totalrevenue / cdraftrevenue) * 100);
                //set percentages
                effectedSale["profitPercentage"] = (Number.isFinite(proPercentage)?proPercentage:0);
                effectedSale["totalRevenuePercentage"] = (Number.isFinite(revPercentage)?revPercentage:0);
                //update sale prod object
                prodSale.effectedSaleInformation = effectedSale
            }

            prodList[i] = prodSale
        }
    }
    
    return cloadedrdlist;
}

 //handle zoom feature
export function handleZoomInOut (viewid, iszoomin, isreset, viewWidth, missingwidth, zoomSizeX) {
    let svg = document.getElementById(viewid);
    
    if(iszoomin){
        /* if(iswidthchangezoom){
            viewBox.x = viewBox.x + (viewBox.width-missingwidth )/ 4;
            viewBox.y = viewBox.y + viewBox.height / 4;
            viewBox.width = (viewBox.width+missingwidth) / 2;
            viewBox.height = viewBox.height / 2;
        }else{
            viewBox.x = viewBox.x + viewBox.width / 4;
            viewBox.y = viewBox.y + viewBox.height / 4;
            viewBox.width = viewBox.width / 2;
            viewBox.height = viewBox.height / 2;
        } */

        svg.style.width = (viewWidth * (zoomSizeX + 1)) + 'px';
        
    } else if(isreset){
        /* viewBox.x = 0;
        viewBox.y = 0;
        viewBox.width = viewWidth+missingwidth;
        viewBox.height = viewHeight; */

        svg.style.width = (viewWidth + missingwidth) + 'px';
    } else{
        if(zoomSizeX > 0){
            /* viewBox.x = viewBox.x - viewBox.width / 2;
            viewBox.y = viewBox.y - viewBox.height / 2;
            viewBox.width = viewBox.width * 2;
            viewBox.height = viewBox.height * 2; */

            svg.style.width = (viewWidth + (zoomSizeX > 0?(viewWidth * zoomSizeX):0)) + 'px';
        }
    }
}

export function handlePanView (viewid, event, isAllowPan, drawzoomx, fielddetails) {
    //console.log(isAllowPan);
    if(isAllowPan){
       /*  let svg = document.getElementById(viewid);
        let viewBox = svg.viewBox.baseVal;

        //block more going more than layout size
        //get current viewbox x,y location change
        let newmovex = (viewBox.x - event.movementX);
        let newmovey = (viewBox.y - event.movementY);
        
        viewBox.x = newmovex;
        viewBox.y = newmovey; */

        let parent = document.getElementById(viewid);
            
        parent.scrollLeft = (parent.scrollLeft - event.movementX);
        parent.scrollTop = (parent.scrollTop - event.movementY);
    }
}
//preview modal for all items
export function PreviewProduct (props) {
    const { t } = useTranslation();

    //console.log(props.prodobj);
    return <Modal show={props.isshow} animation={false} centered onHide={props.togglePreviewModal} className="productitem-modal">
        <Modal.Header>
            <span className='close-icon' onClick={props.togglePreviewModal}><XIcon size={18} /></span>
            <Modal.Title><small>{props.prodobj.barcode}</small><br/>{props.prodobj.brandName !== "-"?props.prodobj.brandName:"N/A "}
            {props.prodobj.productName}</Modal.Title>
        </Modal.Header>
        <Modal.Body className="text-center">
            <img src={props.prodobj.imageUrl} className="img-fluid" alt="preview product" />

            <ListGroup horizontal>
                <ListGroup.Item><small>{t("width")}</small><br/><span id="rotatetxt_width">{(props.prodobj.width+props.prodobj.uom)}</span></ListGroup.Item>
                <ListGroup.Item><small>{t("height")}</small><br/><span id="rotatetxt_height">{(props.prodobj.height+props.prodobj.uom)}</span></ListGroup.Item>
                <ListGroup.Item><small>{t("depth")}</small><br/><span id="rotatetxt_depth">{(props.prodobj.depth+props.prodobj.uom)}</span></ListGroup.Item>
            </ListGroup>
        </Modal.Body>
    </Modal>;
}

/**
 * shows left and right browsing options if each side dealers available
 * when click side item it sends its side dealer to props.handleChangeLeftRightField function it redirects to that field
 *
 * @export
 * @param {*} props
 * @return {*} 
 */
 export function LeftRightToggle(props) {
  
    return <>
      <Col xs={12} className={"leftright-toggle "+(props.size?props.size:"")+(props.isRTL==="rtl"?" RTL":"")}>
        <ul className="list-inline">
          
          {props.saveobj && props.saveobj.leftSidePlanogramFieldDto && Object.keys(props.saveobj.leftSidePlanogramFieldDto).length>0?<li className="list-inline-item">
            <Col className="lrfield-left" onClick={() => props.handleChangeLeftRightField(props.saveobj.leftSidePlanogramFieldDto)}>
              <div className="overlay">{props.t("OPEN")}</div>{props.t("left_field")}<br/>
              <small>{(props.saveobj.leftSidePlanogramFieldDto.department?
                (props.saveobj.leftSidePlanogramFieldDto.department.name.substring(0,22)+(props.saveobj.leftSidePlanogramFieldDto.department.name.length > 22?"..":"")):
                props.t("no_dept"))+(props.saveobj.leftSidePlanogramFieldDto.noInFloorLayout > 0?(" : "+props.saveobj.leftSidePlanogramFieldDto.noInFloorLayout):"")}</small>
            </Col>
          </li>:<></>}
          {props.saveobj && props.saveobj.rightSidePlanogramFieldDto && Object.keys(props.saveobj.rightSidePlanogramFieldDto).length>0?<li className="list-inline-item">
            <Col className="lrfield-right" onClick={() => props.handleChangeLeftRightField(props.saveobj.rightSidePlanogramFieldDto)}>
              <div className="overlay">{props.t("OPEN")}</div>{props.t("right_field")}<br/>
              <small><small>{(props.saveobj.rightSidePlanogramFieldDto.department?
                (props.saveobj.rightSidePlanogramFieldDto.department.name.substring(0,22)+(props.saveobj.rightSidePlanogramFieldDto.department.name.length > 22?"..":"")):
                props.t("no_dept"))+(props.saveobj.rightSidePlanogramFieldDto.noInFloorLayout > 0?(" : "+props.saveobj.rightSidePlanogramFieldDto.noInFloorLayout):"")}</small></small>
            </Col>
          </li>:<></>}
        </ul>
      </Col>
    </>;
}

/**
 * #PLG-DU-IM-H02
 * shows improvement donut chart
 *
 * @export
 * @param {*} { value- current prop value, dmode- is dark mode }
 * @return {*} 
 */
 export function ImprovementProgress({ value, dmode, trans }) {
    //default values
    var percentage = (value?value:0);
    var showPercentage = "";
    
    //sets color of chart according to imporovement value
    if(percentage && percentage > 0){ //if its greater than zero - green
        showPercentage = percentage
    }else if(percentage && percentage < 0){ //lower than zero(minus values) - red
        showPercentage = percentage
        percentage = percentage * -1
    }else{
        showPercentage = "0"
        percentage = 0
    }

    return (<Col className="improveview-content">{/* <CircularProgressbar value={percentage} text={`${showPercentage}%`} strokeWidth={9}
        styles={buildStyles({ textColor: pathColor, textSize: '20px', strokeLinecap: 'butt', pathColor: pathColor, trailColor: trailColor })} />
        <input type="hidden" id="improveview-percnt" value={showPercentage} /> */}
        <h5><span>{showPercentage}%</span> {trans('improvement')}</h5>
    </Col>);
}
//suggestions
ImprovementProgress.propTypes = {
    value: PropTypes.number,
    dmode : PropTypes.bool
}

export function StoreTagsList(props) {

    return (<>
        <ul className='list-inline storetags-list'>
            {props.saveObj && props.saveObj.tagList && props.saveObj.tagList.length > 0?<>
                {props.saveObj.tagList.map((tagitem, tagidx) => {
                    return <li key={tagidx} className='list-inline-item singletag-item'>
                        <TooltipWrapper text={tagitem.name}><label>{tagitem.name.substring(0, 25)+(tagitem.name.length > 25?"..":"")}</label></TooltipWrapper> 
                        <span onClick={() => props.updateStoreTags(tagidx)}><XIcon size={14} /></span></li>
                })}
            </>:<></>}
        </ul>
    </>);
}

/**
 * active product right click popup view
 *
 * @export
 * @param {*} { xpos - x position, ypos - y position, viewProd - selected product, handlclose - close function, isRTL }
 * @return {*} 
 */
 export function ActiveContextMenu({ xpos, ypos, viewProd, handlclose, isRTL, copyToClipboard, handleProductImgPreview }) {//togglePreviewModal
    const { t } = useTranslation();

    return (<div className="pdunit-prodview-menu newcontext active-context" style={{ top: ypos, left: (xpos-(isRTL==="rtl"?280:0)) }}>
        <span onClick={() => handlclose()} className="closelink" style={{ position: "absolute", right: "8px", top: "1px", cursor: "pointer" }}><XIcon size={16} /></span>
        <div style={{display:'flex', flexDirection: 'row' }}>
            <div style={{width: 70, height:60,backgroundColor:'white',borderRadius:10,padding:5,justifyContent:'center',display:"inline-flex",textAlign:"center"}}>
                <img src={viewProd ? viewProd.imageUrl : ""} onClick={() => handleProductImgPreview(viewProd,true) } className="img-fluid" width="auto" height="100%" alt="product view"/>
            </div>
            <div style={(isRTL==="rtl"?{marginRight:5}:{marginLeft:5})}>
                <h4>
                    <small id="act_contextm_bcode">{viewProd ?<CopyToClipboard text={viewProd.barcode} onCopy={() => copyToClipboard()}><span className="copy-hover">{viewProd.barcode}</span></CopyToClipboard>: "-"}</small>
                    <br />
                    {viewProd ? ((viewProd.brandName&&viewProd.brandName!==""&&viewProd.brandName!=="-"?(viewProd.brandName+" "):(t("notavailable")+" "))+
                    (viewProd.productName.substring(0,15)+(viewProd.productName.length > 15?"..":""))) : "-"}
                </h4>
            </div>
        </div>
    </div>)
}

/**
 * using this to show product popup in planogram svg when user right on a product click
 * in this popup it shows product barcode and name
 * also shows expand(multiply), delete(single location) or delete all(all block)
 *
 * @export
 * @param {*} props currentprod - selected product details
 * @return {*} 
 */
 export function DrawContextMenu(props) {
    var xPos = props.xpos; //x position
    var yPos = props.ypos; //y position
    var showMenu = props.isview; //isshows popup view
    const { t } = useTranslation();
    //handle click a button. type: 1-expand, 2-delete, 3-close, 4-delete all
    const handleClick = (type) => {
        if(type === 5){
            props.handleselectblock();
        } else if(type === 4){
            props.handledeleteall();
        } else if(type === 2){
            props.handledelete();
        } else if(type === 1){
            props.handlexpand(true);
        } else{
            props.handlclose();
        }
    }
    const handleClickpodopen = (selproduct) => {
        if(selproduct&&selproduct.prod){
            props.handleopenDetailmodal(selproduct.prod.productInfo)
        }
    }
    if (showMenu){
      return (<div className="pdunit-prodcontext-menu pgdrawing-context" style={{ top: yPos, left: (xPos-(props.isRTL==="rtl"?280:0)), }}>
        <span className="viewmenu-span" id="contextm_close" onClick={() => handleClick(3)} style={{position:"absolute",right:"8px",top:"8px",cursor:"pointer"}}><XIcon size={16} /></span>
        
        <Row>
          <Col xs={2} >
            <div className="imgdiv" onClick={()=>(props.currentprod&&props.currentprod.prod?props.handleProductImgPreview(props.currentprod.prod.productInfo,true):null)}>
                <img src={(props.currentprod&&props.currentprod.prod?props.currentprod.prod.productInfo.imageUrl:"")} className='img-resize-ver' alt=""/>
            </div>
          </Col>
          <Col xs={10}>
            <h4>
                <small id="contextm_bcode">{props.currentprod&&props.currentprod.prod?<CopyToClipboard text={props.currentprod.prod.productInfo.barcode} onCopy={() => props.copyToClipboard()}><span className="copy-hover">{props.currentprod.prod.productInfo.barcode}</span></CopyToClipboard>:"-"}</small><br/>
                <div className='clicktitle' onClick={()=>handleClickpodopen(props.currentprod)}>
                {props.currentprod&&props.currentprod.prod?((props.currentprod.prod.productInfo.brandName&&props.currentprod.prod.productInfo.brandName!==""&&props.currentprod.prod.productInfo.brandName!=="-"?(props.currentprod.prod.productInfo.brandName+" "):(t("notavailable")+" "))+
                (props.currentprod.prod.productInfo.productName.substring(0,25)+(props.currentprod.prod.productInfo.productName.length > 25?"..":""))):"-"}
                </div>
                
            </h4>
          </Col>
        </Row>
        {!props.showFullScreenEditView && (props.fieldStatus === "ACTIVE" || props.fieldStatus === "DRAFT")?<>
            <hr style={{marginBottom:"5px",marginTop:"10px"}}/>
            <ul className="list-inline" style={{textAlign:(props.isRTL==="rtl"?"left":"right")}}>
            <li className={"list-inline-item "+(props.isRTL==="rtl"?"float-right":"float-left")} id="contextm_expand" onClick={() => handleClick(1)}><Button variant={(props.isexpand?"success":"secondary")} size="sm"><PlusIcon size={12}/></Button></li>
            
            <li className="list-inline-item" id="contextm_block" onClick={() => handleClick(5)}><Button variant="outline-info" size="sm"><DiffAddedIcon size={12}/> {props.t('btnnames.selectblock')}</Button></li>
            <li className="list-inline-item" id="contextm_delete" onClick={() => handleClick(2)}><Button variant="danger" size="sm"><TrashIcon size={12}/></Button></li>
            <li className="list-inline-item" id="contextm_deleteall" style={(props.isRTL==="rtl"?{marginRight:"8px"}:{})} onClick={() => handleClick(4)}><Button variant="danger" size="sm"><TrashIcon size={12}/> {t("ALL")}</Button></li>
            </ul>
        </>:<></>}
      </div>
      );
    } else return null;
}

export function checkhaveElementforxy(x,y,elem){
    let startX = elem.x;
    let startY = elem.y;
    let endY = (elem.y + elem.drawHeight);
    let endX = (elem.x + elem.drawWidth);

    let isinX = (x > startX && x < endX);
    let isinY = (y > startY && y < endY);
    
    return (isinX && isinY);
}

export function elmAccordingtoXY(x, y, x2, y2, viewObj, selectedblock){
    //x-pontx,y-point y, fields-fields structures,
    let objDetails = { field: null, startX: x};

    // check map 
    let selectedField = null;
    let selectedFieldKey = null;
    
    for (let i = 0; i < viewObj.fieldsList.length; i++) {
        const fielditem = viewObj.fieldsList[i];
        
        let rectx1 = roundOffDecimal(fielditem.startX,2);
        let recty1 = roundOffDecimal(fielditem.startY,2);
        let rectx2 = roundOffDecimal((fielditem.startX + fielditem.drawWidth),2);
        let recty2 = roundOffDecimal((fielditem.startY + fielditem.drawHeight),2);
        
        if(rectx1 <= x && recty1 <= y && rectx2 >= x && recty2 >= y){
            selectedField = fielditem;
            selectedFieldKey = i;
        }
    }
    
    if(selectedField){
        let starty = null; 
        let heightmargin = 0;
        let currank = 0;

        let lowestshelfrank = 0; let highestshelfrank = 0;
        let fieldcontainshelfs = [];

        let roundminStartX = roundOffDecimal(x,2);
        let roundminEndX = roundOffDecimal(x2,2);
        let roundminStartY = roundOffDecimal(y,2);
        let roundminEndY = roundOffDecimal(y2,2);

        for (let i = 0; i < selectedField.planogramShelfDto.length; i++) {
            const Dshlf = selectedField.planogramShelfDto[i];

            //if shelf overlapping available add that
            if(Dshlf.overLappingDto && Dshlf.overLappingDto.length > 0){
                let sortOverlapList = Dshlf.overLappingDto.sort((a, b) => b.x - a.x);
                // let firstXProd = roundOffDecimal((sortOverlapList[0].x + sortOverlapList[0].drawWidth),2);
                let firstXProd = sortOverlapList[0];

                let prodStart = roundOffDecimal(firstXProd.x, 10);
                let prodStartY = roundOffDecimal(firstXProd.y, 10);
                let prodEnd = roundOffDecimal((firstXProd.x + firstXProd.drawWidth), 10);
                let prodEndY = roundOffDecimal((firstXProd.y + firstXProd.drawHeight), 10);

                if(!checkThroughProductsTest(roundminStartX, roundminStartY, roundminEndX, roundminEndY, prodStart, prodStartY, prodEnd, prodEndY)){
                    x = prodEnd;
                }
                
                /* if(selectedField.startX <= x && firstXProd >= x){
                    x = firstXProd;
                } */
            }

            var insideshelf = checkhaveElementforxy(x,y,Dshlf);
            if(insideshelf){
                starty = Dshlf.y;
                currank = Dshlf.rank;
            }
            
            if(starty !== null){
                if(currank !== Dshlf.rank){
                    break;
                }else{
                    heightmargin = (heightmargin + Dshlf.drawHeight);
                    currank = (currank + 1);
                }
            }

            let findfieldshelf = selectedField.planogramShelfDto.findIndex(fieldshelf => fieldshelf.rank === Dshlf.rank);
            if(findfieldshelf > -1){
                let foundfieldshelf = selectedField.planogramShelfDto[findfieldshelf];
                let shelfheight = (foundfieldshelf.drawHeight + foundfieldshelf.drawGap);
                
                if((foundfieldshelf.y <= y && y <= (foundfieldshelf.y + shelfheight))){ //(foundfieldshelf.y <= y && (foundfieldshelf.y + shelfheight) <= y2) || 
                    lowestshelfrank = foundfieldshelf.rank;
                } 
                
                if((foundfieldshelf.y <= y2 && y2 <= (foundfieldshelf.y + shelfheight))){
                    highestshelfrank = foundfieldshelf.rank;
                }
            }
        }

        for (let j = 0; j < selectedField.planogramShelfDto.length; j++) {
            const shelfobj = selectedField.planogramShelfDto[j];
            if(shelfobj.rank >= lowestshelfrank && shelfobj.rank <= highestshelfrank){
                shelfobj["shelfidx"] = j;
                fieldcontainshelfs.push(shelfobj);
            }

            //if fullfilled selected block contain shelfs lenth break
            if(selectedblock && selectedblock.selectedshelves && selectedblock.selectedshelves.length > 0){
                if(fieldcontainshelfs.length >= selectedblock.selectedshelves.length){
                    break;
                }
            }
        }
        
        let sortedshelfslist = fieldcontainshelfs.sort((a, b) => (a.y - b.y));

        objDetails.field = {
            key:selectedFieldKey, obj: selectedField, 
            drawWidth: selectedField.drawWidth, drawHeight:selectedField.drawHeight, 
            x: selectedField.startX, y: selectedField.startY,
            contain_shelfs: sortedshelfslist
        }
        objDetails.startX = x;
    }
    
    // console.log(objDetails);
    return objDetails;
}

export function GetContainingProdsByBox(minStartX, minStartY, minEndX, minEndY, fieldobj, fieldidx, selectedblock){
    let selectedProds = [];
    let startLoc = null;
    
    let roundminStartX = roundOffDecimal(minStartX,2);
    let roundminEndX = roundOffDecimal(minEndX,2);
    let roundminStartY = roundOffDecimal(minStartY,2);
    let roundminEndY = roundOffDecimal(minEndY,2);
    
    let rectdetails = {x: -1, y: -1 , x2: -1, y2: -1, width: 0, height: 0};
    let shelflist = []; //group products by shelf
    
    if(fieldobj){
        let newfieldobj = structuredClone(fieldobj);

        let alreadyfixed = false;
        for (let i = 0; i < newfieldobj.planogramShelfDto.length; i++) {
            const shelfobj = newfieldobj.planogramShelfDto[i];

            //if shelf overlapping available add that
            if(shelfobj.overLappingDto && shelfobj.overLappingDto.length > 0){
                let sortOverlapList = shelfobj.overLappingDto.sort((a, b) => b.x - a.x);
                // let firstXProd = roundOffDecimal((sortOverlapList[0].x + sortOverlapList[0].drawWidth),2);
                let firstXProd = sortOverlapList[0];
                
                let prodStart = roundOffDecimal(firstXProd.x, 10);
                let prodStartY = roundOffDecimal(firstXProd.y, 10);
                let prodEnd = roundOffDecimal((firstXProd.x + firstXProd.drawWidth), 10);
                let prodEndY = roundOffDecimal((firstXProd.y + firstXProd.drawHeight), 10);

                if(!checkThroughProductsTest(roundminStartX, roundminStartY, roundminEndX, roundminEndY, prodStart, prodStartY, prodEnd, prodEndY)){
                    roundminStartX = prodEnd;
                }

                /* if(fieldobj.startX <= roundminStartX && firstXProd >= roundminStartX){
                    console.log(sortOverlapList[0]);
                    roundminStartX = firstXProd;
                } */
            }
            
            //if starty or endy of selected rect details 
            if(!alreadyfixed){
                if(shelfobj.y <= minStartY && minStartY <= (shelfobj.y + shelfobj.drawHeight)){
                    minStartY = (shelfobj.y + 1.5);
                    alreadyfixed = true;
                }

                if(shelfobj.y <= minEndY && minEndY <= (shelfobj.y + shelfobj.drawHeight)){
                    minEndY = ((shelfobj.y + shelfobj.drawHeight) - 1.5);
                }
            }
            
            for (let j = 0; j < shelfobj.planogramProduct.length; j++) {
                const prodobj = shelfobj.planogramProduct[j];
                
                if(!prodobj.isDelete){
                    for (let l = 0; l < prodobj.productBlock.length; l++) {
                        const blockobj = prodobj.productBlock[l];
                        
                        if(!blockobj.isDelete){
                            for (let k = 0; k < blockobj.productLocations.length; k++) {
                                const locobj = blockobj.productLocations[k];
                                
                                if(!locobj.isDelete){
                                    var prodStart = roundOffDecimal(locobj.x, 2);
                                    var prodStartY = roundOffDecimal(locobj.y, 2);
                                    var prodEnd = roundOffDecimal((locobj.x + locobj.drawWidth), 2);
                                    var prodEndY = roundOffDecimal((locobj.y + locobj.drawHeight), 2);

                                    if(roundminStartX > prodStart && roundminEndX < prodEnd){
                                        startLoc = locobj;
                                    }

                                    if(!checkThroughProductsTest(roundminStartX, minStartY, roundminEndX, minEndY, prodStart, prodStartY, prodEnd, prodEndY)){
                                        
                                        if(rectdetails.x === -1 || rectdetails.x > prodStart){
                                            rectdetails.x = prodStart;
                                        }
                
                                        if(rectdetails.x2 === -1 || rectdetails.x2 < prodEnd){
                                            rectdetails.x2 = prodEnd;
                                        }
                
                                        if(rectdetails.y === -1 || rectdetails.y > prodStartY){
                                            rectdetails.y = prodStartY;
                                        }
                
                                        if(rectdetails.y2 === -1 || rectdetails.y2 < prodEndY){
                                            rectdetails.y2 = prodEndY;
                                        }
                                        
                                        let newprodobj = locobj;
                                        newprodobj["fieldidx"] = fieldidx;
                                        newprodobj["shelfidx"] = i;
                                        newprodobj["shelfrank"] = shelfobj.rank;
                                        newprodobj["prodidx"] = j;
                                        newprodobj["blockidx"] = l;
                                        newprodobj["locidx"] = k;
                                        newprodobj["imageUrl"] = prodobj.productInfo.imageUrl;
                                        newprodobj["prodMdId"] = prodobj.productInfo.id; 
                                        newprodobj["gapFromBottom"] = ((shelfobj.y + shelfobj.drawHeight) - newprodobj.y); 
                                        
                                        selectedProds.push(newprodobj);

                                        //check shelf available
                                        let isshelfaddedidx = shelflist.findIndex(shelfitem => shelfitem.rank === shelfobj.rank);
                                        if(isshelfaddedidx > -1){
                                            shelflist[isshelfaddedidx].selectedProducts.push(newprodobj);
                                        } else{
                                            shelflist.push({ rank: shelfobj.rank, selectedProducts: [newprodobj] });
                                        }
                                    }
                                }
                                
                            }
                        }
                        
                    }    
                }
            }

            //if fullfilled selected block contain shelfs lenth break
            if(selectedblock && selectedblock.selectedshelves && selectedblock.selectedshelves.length > 0){
                if(shelflist.length >= selectedblock.selectedshelves.length){
                    break;
                }
            }
        }
    }
    
    rectdetails.width = (rectdetails.x2 - rectdetails.x);
    rectdetails.height = (rectdetails.y2 - rectdetails.y);
    
    return { selectedProds: selectedProds, rectDetails: rectdetails, startLoc: startLoc, selectedshelves: shelflist };
}

// Accepts the array and key
export function groupBy (array, key) {
    // Return the end result
    return array.reduce((result, currentValue) => {
        // If an array already present for key, push it to the array. Else create an array and push the object
        (result[currentValue[key]] = result[currentValue[key]] || []).push(
        currentValue
        );
        // Return the current iteration `result` value, this will be taken as next iteration `result` value and accumulate
        return result;
    }, {}); // empty object is the initial value for result object
};

//get snapping location
export function getSnappingLocation (clowestprodx, selectingField, movingObj, containshelfs){
    let fieldobj = (selectingField.obj?selectingField.obj:selectingField);

    let lowestprodx = clowestprodx;

    let lowXProds = [];
    let highestXProds = [];
    
    //sort field prod list and get lowest x and highest x prods
    for (let z = 0; z < fieldobj.planogramShelfDto.length; z++) {
        const shelfobj = fieldobj.planogramShelfDto[z];

        /* //if overlapping product available products cannot drop to that location
        //check last x prodx and set that x as dropping location
        if(shelfobj.overLappingDto && shelfobj.overLappingDto.length > 0){
            if(containshelfs.length > 0 && shelfobj.rank === containshelfs[0].rank){
                let sortOverlapList = shelfobj.overLappingDto.sort((a, b) => b.x - a.x);
                let firstXProd = roundOffDecimal((sortOverlapList[0].x + sortOverlapList[0].drawWidth),2);
    
                if(selectingField.startX <= lowestprodx && firstXProd >= lowestprodx){
                    lowestprodx = firstXProd;
                }
            }
        } */

        //get lowest and highest prods of dropping location
        for (let y = 0; y < shelfobj.planogramProduct.length; y++) {
            const prodobj = shelfobj.planogramProduct[y];
            
            if(!prodobj.isDelete){
                for (let k = 0; k < prodobj.productBlock.length; k++) {
                    const blockobj = prodobj.productBlock[k];
                    
                    if(!blockobj.isDelete){
                        let newlowprodx = lowestprodx;
                        //lowest prods
                        let lowXLocs = blockobj.productLocations.filter(z => !z.isDelete && (containshelfs.length > 0?(shelfobj.rank === containshelfs[0].rank):true) && (z.x < newlowprodx));
                        lowXProds = lowXProds.concat(lowXLocs);
                        //highest prods
                        let highestXLocs = blockobj.productLocations.filter(z => !z.isDelete && (containshelfs.length > 0?(shelfobj.rank === containshelfs[0].rank):true) && (z.x >= (newlowprodx+movingObj.drawWidth)));
                        highestXProds = highestXProds.concat(highestXLocs);
                    }
                }
            }
        }
    }
    //get dropping prods
    let newdrawingprods = (movingObj.newDrawingProducts?movingObj.newDrawingProducts:movingObj.products?movingObj.products:movingObj?[movingObj]:[]);
    //first drawing prod
    let firstdrawitem = (newdrawingprods && newdrawingprods.length > 0?newdrawingprods[0]:movingObj);
    
    if(highestXProds.length > 0){
        let sortxbylowest = highestXProds.sort((a,b) => a.x - b.x);
        
        let notdroppinglowest = null;
        for (let l = 0; l < sortxbylowest.length; l++) {
            const sortlitem = sortxbylowest[l];
            let isfindindrop = newdrawingprods.findIndex(k => k.id === sortlitem.id);

            if(isfindindrop === -1){
                notdroppinglowest = sortlitem;
                break;
            }
        }

        if(notdroppinglowest){
            let sortitemx1 = notdroppinglowest.x;
            let sortitemx2 = (notdroppinglowest.x + notdroppinglowest.drawWidth);
            
            let moveprodx2 = (lowestprodx + movingObj.drawWidth);
            let saftylowestx = (moveprodx2 + (firstdrawitem.drawWidth / 3));
            let sortitemx1safty = (sortitemx1 - (notdroppinglowest.drawWidth / 3));
            
            if((saftylowestx >= sortitemx1 || sortitemx1safty <= moveprodx2) && saftylowestx <= sortitemx2){ //
                lowestprodx = roundOffDecimal((notdroppinglowest.x - movingObj.drawWidth),2);
            }
        }
    }else{
        let saftyheighstx= (lowestprodx + movingObj.drawWidth + (firstdrawitem.drawWidth / 3));
        
        if(saftyheighstx >= (selectingField.startX + selectingField.drawWidth)){
            lowestprodx= ((selectingField.startX + selectingField.drawWidth) - movingObj.drawWidth)
        }
    }

    if(lowXProds.length > 0){
        let sortxbyhighest = lowXProds.sort((a,b) => b.x - a.x);
        
        let notdroppinghighest = null;
        for (let l = 0; l < sortxbyhighest.length; l++) {
            const sortlitem = sortxbyhighest[l];
            let isfindindrop = newdrawingprods.findIndex(k => k.id === sortlitem.id);

            if(isfindindrop === -1){
                notdroppinghighest = sortlitem;
                break;
            }
        }
        
        if(notdroppinghighest){
            let sortitemx1 = notdroppinghighest.x;
            let sortitemx2 = (notdroppinghighest.x + notdroppinghighest.drawWidth);
            
            let saftylowestx = (lowestprodx - (firstdrawitem.drawWidth / 3));
            let sortitemx2safty = (sortitemx2 + (notdroppinghighest.drawWidth / 3));
            
            if(saftylowestx >= sortitemx1 && (saftylowestx <= sortitemx2 || sortitemx2safty >= lowestprodx)){ //
                lowestprodx = roundOffDecimal((notdroppinghighest.x + notdroppinghighest.drawWidth),2);
            }
        }
        
    } else{
        let saftylowestx = (lowestprodx - (firstdrawitem.drawWidth / 3));
        
        if(saftylowestx <= selectingField.startX){
            lowestprodx = selectingField.startX;
        }
    }

    //check overlap prod
    for (let z = 0; z < fieldobj.planogramShelfDto.length; z++) {
        const shelfobj = fieldobj.planogramShelfDto[z];

        //if overlapping product available products cannot drop to that location
        //check last x prodx and set that x as dropping location
        if(shelfobj.overLappingDto && shelfobj.overLappingDto.length > 0){
            if(containshelfs.length > 0 && shelfobj.rank === containshelfs[0].rank){
                let sortOverlapList = shelfobj.overLappingDto.sort((a, b) => b.x - a.x);
                let firstXProd = roundOffDecimal((sortOverlapList[0].x + sortOverlapList[0].drawWidth),2);
    
                if(selectingField.startX <= lowestprodx && firstXProd >= lowestprodx){
                    lowestprodx = firstXProd;
                }
            }
        }
    }

    return lowestprodx;
}

//stack given block to top of given product block shelf
export function stackProdBlockToTop(blockobj, shelf, isStackableEnabled){
    if(isStackableEnabled){
        let newaddedlist = [];
        for (let i = 0; i < blockobj.productLocations.length; i++) {
            const locobj = blockobj.productLocations[i];
            
            if(!locobj.isDelete){
                let locx1 = locobj.x;
                let locx2 = (locobj.x + locobj.drawWidth);
                let locy1 = roundOffDecimal((locobj.y - locobj.drawHeight),10);
    
                if(shelf.y <= locy1){
                    let findtopprodavailable = blockobj.productLocations.findIndex(blockloc => {
                        let lowlocx1 = (blockloc.x - 2);
                        let hightlocx1 = (blockloc.x + 2);
    
                        let lowlocx2 = ((blockloc.x + blockloc.drawWidth) - 2);
                        let hightlocx2 = ((blockloc.x + blockloc.drawWidth) + 2);
    
                        return (blockloc.y < locobj.y && (lowlocx1 <= locx1 && hightlocx1 >= locx1) && (lowlocx2 <= locx2 && hightlocx2 >= locx2));
                    });
                    
                    if(findtopprodavailable === -1){
                        let prodlocgap = roundOffDecimal((locobj.y - shelf.y),10);
                        let prodlocheight = roundOffDecimal(locobj.drawHeight,10);
    
                        let newprodcount = Math.floor(prodlocgap / prodlocheight);
                        
                        for (let k = 0; k < newprodcount; k++) {
                            let newlocobj = JSON.parse(JSON.stringify(locobj));
                            
                            newlocobj["id"] = uuidv4();
                            newlocobj["isDelete"] = false;
                            newlocobj["isNew"] = true;
                            newlocobj["y"] = (locobj.y - (prodlocheight * (k + 1)));
    
                            newaddedlist.push(newlocobj);
                        }
                    }    
                }    
            }
        }
    
        blockobj["productLocations"] = blockobj.productLocations.concat(newaddedlist);
    }

    return blockobj;
}

//convert drawobj to original values
export function convertBackSaveObj(saveObj, displayRatio){
    let csaveobj = structuredClone(saveObj);

    for (let m = 0; m < csaveobj.fieldsList.length; m++) {
        const csobj = csaveobj.fieldsList[m];
        let reducewidth = csobj.startX;
        let reduceheight = csobj.startY;
        
        csobj["masterFieldWidth"] = parseFloat(csobj.masterFieldWidth);
        csobj["masterFieldHeight"] = parseFloat(csobj.masterFieldHeight);
        //sort draft field shelves
        csobj.planogramShelfDto.sort(sortShelvesDesc);
        
        //convert back converted x,y changes
        for (var i = 0; i < csobj.planogramShelfDto.length; i++) {
            const shelveobj = csobj.planogramShelfDto[i];
           
            for (var j = 0; j < shelveobj.planogramProduct.length; j++) {
                const prodobj = shelveobj.planogramProduct[j];
                
                for (var l = 0; l < prodobj.productBlock.length; l++) {
                    const blockobj = prodobj.productBlock[l];
                    blockobj.x = ((blockobj.x - reducewidth) / displayRatio);
                    blockobj.y = ((blockobj.y - reduceheight) / displayRatio);

                    for (var k = 0; k < blockobj.productLocations.length; k++) {
                        const plocobj = blockobj.productLocations[k];
                        
                        plocobj.x = ((plocobj.x - reducewidth) / displayRatio);
                        plocobj.y = ((plocobj.y - reduceheight) / displayRatio);

                        //overlap obj
                        if(plocobj.overLappingDto && Object.keys(plocobj.overLappingDto).length > 0){
                            plocobj.overLappingDto.x = ((plocobj.overLappingDto.x - (reducewidth - reduceheight)) / displayRatio);
                            plocobj.overLappingDto.y = (plocobj.overLappingDto.y / displayRatio);
                        }
                    }
                }
            }
        }
    }

    return csaveobj;
}

export function BottomSnapshotPieChart(props){
    let labels = [];
    let labeldata = [];
    let colorlist = [];

    for (let i = 0; i < props.showingSnapshotList.length; i++) {
        let snapitem = props.showingSnapshotList[i];

        if((!props.snapshotShowFieldOnly || (props.snapshotShowFieldOnly && snapitem.isshowitem)) && snapitem.space > 0){
            let nametxt = (props.filterLevel === "CAT"?snapitem.categoryName:props.filterLevel === "SCAT"?snapitem.subcategoryName:snapitem.brandName);
            
            labels.push(nametxt);
            labeldata.push(snapitem.space);
            colorlist.push(snapitem.color);
        }
    }
    // console.log(props.showingSnapshotList);

    /* const loadNotificationChartData = () => {
        if(props.pitem){
            labels = props.pitem.chartData.categories;
            if(props.pitem.calculationType === "sales"){
                labeldata = props.pitem.chartData.salesSeries;
            }else{
                labeldata = props.pitem.chartData.series;
            }
        }
    }

    loadNotificationChartData(); */

    var options = {
        chart: {
            toolbar: {
                show: false,
            },
        },
        legend: {
            show: false
        },
        colors: colorlist,
        labels: labels,
        dataLabels: {
            formatter: function (val, opts) {
                return roundOffDecimal(val, 2)+"%";
            },
        },
        plotOptions: {
            pie: {
              donut: {
                size: '55%'
              }
            }
        }
    };
    var series = labeldata;

    return (
        <>
            <Col className='snaplegend-content'>
                <ListGroup>
                    {labels.map((labelitem, labelidx) => {
                        return <ListGroup.Item key={labelidx}>
                            <TooltipWrapper text={labelitem}><span>{labelitem}</span></TooltipWrapper> 
                            <Badge bg="secondary" style={{background: colorlist[labelidx]}}>{roundOffDecimal(labeldata[labelidx],2)}%</Badge>
                        </ListGroup.Item>
                    })}
                </ListGroup>
            </Col>

            <Col xs={9}>
                <Chart className="mchart-view" options={options} series={series} type="donut" height={250} />
            </Col>

            <h5>* {props.t("CHART_GENERATED_BY_SPACE")}</h5>
        </>
    )
}
