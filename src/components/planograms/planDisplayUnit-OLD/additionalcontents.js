import {useState, useRef} from 'react';
import { Modal, ListGroup, Col, Form, Row, InputGroup, ButtonGroup, Overlay, Tooltip, Button, Dropdown, Accordion, Card, Badge } from 'react-bootstrap';
import { measureConverter, rotateStatus, roundOffDecimal, convertUomtoSym } from '../../../_services/common.service';
import { XIcon, SearchIcon, XCircleFillIcon, ListUnorderedIcon, ArrowSwitchIcon, IssueReopenedIcon, StopIcon, DiffAddedIcon, ChevronDownIcon, XCircleIcon } from '@primer/octicons-react';
import { useTranslation } from "react-i18next";
import { CopyToClipboard } from 'react-copy-to-clipboard'; //copy text to clipboard

import loadinggif from '../../../assets/img/loading-sm.gif';

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
    //console.log(x1 +"<"+ xb , x2 +">"+ xa , y1 +"<"+ yb , y2 +">"+ ya);
    if (x1 < xb && x2 > xa && y1 < yb && y2 > ya) {
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

    return cloadedrdlist;
}

 //handle zoom feature
export function handleZoomInOut (viewid,iszoomin,isreset,viewWidth,viewHeight,iswidthchangezoom,missingwidth) {
    let svg = document.getElementById(viewid);
    let viewBox = svg.viewBox.baseVal;
    
    if(iszoomin){
        if(iswidthchangezoom){
            viewBox.x = viewBox.x + (viewBox.width-(missingwidth?missingwidth:0) )/ 4;
            viewBox.y = viewBox.y + viewBox.height / 4;
            viewBox.width = (viewBox.width+(missingwidth?missingwidth:0)) / 2;
            viewBox.height = viewBox.height / 2;
        }else{
            viewBox.x = viewBox.x + viewBox.width / 4;
            viewBox.y = viewBox.y + viewBox.height / 4;
            viewBox.width = viewBox.width / 2;
            viewBox.height = viewBox.height / 2;
        }
        
    } else if(isreset){
        viewBox.x = 0;
        viewBox.y = 0;
        viewBox.width = viewWidth+(missingwidth?missingwidth:0);
        viewBox.height = viewHeight;
    } else{
        if(roundOffDecimal(viewWidth,2) >= roundOffDecimal((viewBox.width * 2),2)){
            viewBox.x = viewBox.x - viewBox.width / 2;
            viewBox.y = viewBox.y - viewBox.height / 2;
            viewBox.width = viewBox.width * 2;
            viewBox.height = viewBox.height * 2;
        }
    }
}

export function handlePanView (viewid,event,isAllowPan,drawzoomx,fielddetails) {
    //console.log(isAllowPan);
    if(isAllowPan){
        let svg = document.getElementById(viewid);
        let viewBox = svg.viewBox.baseVal;

        //block more going more than layout size
        //get current viewbox x,y location change
        let newmovex = (viewBox.x - event.movementX);
        let newmovey = (viewBox.y - event.movementY);
        
        viewBox.x = newmovex;
        viewBox.y = newmovey;
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

//#PLG-DU-PD-H01 products add sidebar view
export function ProdsAddSidebar (props){
    return <>
        <Col xs={12} className={"container-sidebar prodadd-sidebar "+(props.isShowProdView?" active":"")}>
            <span className="close-link" onClick={props.toggleProdView}><XCircleIcon className="float-right" size={20}/></span>
            <h4>{props.t('productslist')}</h4>
            <InputGroup size="sm" className="mb-3 input-search">
                <Form.Control id="filterprodtxt" aria-label="Small" placeholder={props.t('srchproduct')} aria-describedby="inputGroup-sizing-sm" onKeyUp={e => props.handleFilterProducts(e)}/>
                {/* <InputGroup.Prepend> */}
                    <InputGroup.Text id="inputGroup-sizing-sm"><SearchIcon size={18}/></InputGroup.Text>
                {/* </InputGroup.Prepend> */}
            </InputGroup>

            <ButtonGroup className="float-right pviewchange-list">
                <Button variant="secondary" onClick={() => props.toggleProdListView("LIST")} className={(props.isListViewActive==="LIST"?"active":"")}><ListUnorderedIcon size={14} /></Button>
                <Button variant="secondary" onClick={() => props.toggleProdListView("GRID")} className={(props.isListViewActive==="GRID"?"active":"")}><DiffAddedIcon size={14}/></Button>
            </ButtonGroup>

            {(props.isListViewActive!==null&&props.recentProdList&&props.filteredProdList.length===0?<Col className="col-xs-12 div-con">
                <h5> {props.t('recentlist')}</h5>
                <Col xs={12} className="div-con subprod-list">
                    <Row style={{marginLeft:"0px",width:"100%"}}>
                        {(props.recentProdList? props.recentProdList.map((prod, i) =>
                        <Col key={i} className={"sub-item"+(props.isListViewActive==="LIST"?"":" rectview")} xs={props.isListViewActive==="LIST"?12:4}><Col style={{ margin: 5}}>
                            {props.isListViewActive==="LIST"?
                                <CopyToClipboard text={prod.barcode} onCopy={() => props.copyToClipboard()}><small className='barcode-txt' style={{fontSize:"0.75rem"}}>{prod.barcode}</small></CopyToClipboard>
                            :<></>}
                            {prod.isDepartmentProduct?<span className="editlink warning-dept">
                                <Dropdown className='usingdept-list'>
                                    <Dropdown.Toggle variant="warning"><StopIcon size={14}/></Dropdown.Toggle>
                                    <Dropdown.Menu>
                                        <h6>{props.t("USED_DEPTS")}</h6>
                                        <ul className='com-list'>
                                            {prod.department && prod.department.length > 0?prod.department.map((ditem,didx) => {
                                                return <li key={didx} title={ditem.departmentName}>{ditem.departmentName.substring(0,25)+(ditem.departmentName.length>25?"..":"")+
                                                (ditem.fieldNo?(" - "+ditem.fieldNo):"")}</li>;
                                            }):<></>}
                                        </ul>
                                    </Dropdown.Menu>
                                </Dropdown>
                            </span>:<></>}
                            <span className={"editlink one "+(prod.rotatetype && (prod.rotatetype!=="default"&&prod.rotatetype!=="front")?"highred":"")} title={prod.rotatetype?(prod.rotatetype.replace("_"," ")):"default"} onClick={() => props.toggleRotateProd(prod,true)} style={(props.isRTL==="rtl"?{left:"25px"}:{right:"35px"})}><IssueReopenedIcon size={14}/></span>
                            <span className="editlink" onClick={() => props.handlePEMView(true,prod,false)}><ArrowSwitchIcon size={14}/></span>
                            <div onClick={() => props.handleProductImgPreview(prod,true)}>
                                <ProdRectView t={props.t} isRTL={props.isRTL} viewtype={props.isListViewActive} prod={prod}>
                                    <div className="thumb-div" draggable id={prod.id} onMouseDown={(e) => {props.drawRectCanvas(prod,i)}} onDragStart={(e) => props.dragStart(e, prod)}>
                                        <img key={i} src={prod.imageUrl} className={(prod.width >= prod.height)?"img-resize-ver":"img-resize-hor"} alt=""/>
                                    </div>
                                </ProdRectView>
                            </div>
                            <div className='text-content'>
                                {(props.isListViewActive==="LIST"?
                                <>{prod.productName}<br/>
                                <small>{props.t("brand")+": "}{prod.brandName&&prod.brandName!==""&&prod.brandName!=="-"?(prod.brandName+" "):(props.t("notavailable")+" ")}</small><br/>
                                <small style={{fontSize:"0.75rem"}}><i>{props.t('WIDTH')}{prod.width+""+convertUomtoSym(prod.uom)}, {props.t('HEIGHT')} {prod.height+""+convertUomtoSym(prod.uom)}</i></small></>:"")}
                            </div>
                        </Col></Col>):(<></>))}
                    </Row>
                </Col>
            </Col>:<></>)}
            {(props.isListViewActive!==null&&props.filteredProdList&&props.filteredProdList.length>0?<Col className="col-xs-12 div-con">
                <h5>{props.t('productslist')}</h5>
                <Col xs={12} className="div-con subprod-list">
                    <Row style={{marginLeft:"0px",width:"100%"}}>
                        {(props.filteredProdList ? props.filteredProdList.map((prod, i) =>
                        <Col key={i} className={"sub-item"+(props.isListViewActive==="LIST"?"":" rectview")} xs={props.isListViewActive==="LIST"?12:4}><Col style={{ margin: 5}}>
                            {props.isListViewActive==="LIST"?
                                <CopyToClipboard text={prod.barcode} onCopy={() => props.copyToClipboard()}><small className='barcode-txt' style={{fontSize:"0.75rem"}}>{prod.barcode}</small></CopyToClipboard>
                            :<></>}
                            {prod.isDepartmentProduct?<span className="editlink warning-dept">
                                <Dropdown className='usingdept-list'>
                                    <Dropdown.Toggle variant="warning"><StopIcon size={14}/></Dropdown.Toggle>
                                    <Dropdown.Menu>
                                        <h6>{props.t("USED_DEPTS")}</h6>
                                        <ul className='com-list'>
                                            {prod.department && prod.department.length > 0?prod.department.map((ditem,didx) => {
                                                return <li key={didx} title={ditem.departmentName}>{ditem.departmentName.substring(0,25)+(ditem.departmentName.length>25?"..":"")+
                                                (ditem.fieldNo?(" - "+ditem.fieldNo):"")}</li>;
                                            }):<></>}
                                        </ul>
                                    </Dropdown.Menu>
                                </Dropdown>
                            </span>:<></>}
                            <span className={"editlink one "+(prod.rotatetype&&(prod.rotatetype!=="default"&&prod.rotatetype!=="front"?"highred":""))} title={prod.rotatetype?(prod.rotatetype.replace("_"," ")):"default"} onClick={() => props.toggleRotateProd(prod,true)} style={(props.isRTL==="rtl"?{left:"25px"}:{right:"35px"})}><IssueReopenedIcon size={14}/></span>
                            <span className="editlink" onClick={() => props.handlePEMView(true,prod,false)}><ArrowSwitchIcon size={14}/></span>
                            <div onClick={() => props.handleProductImgPreview(prod,true)}>
                                <ProdRectView t={props.t} isRTL={props.isRTL} viewtype={props.isListViewActive} prod={prod}>
                                    <div className="thumb-div" draggable id={prod.id} onMouseDown={(e) => {props.drawRectCanvas(prod,i)}} onDragStart={(e) => props.dragStart(e, prod)}>
                                        <img key={i} src={prod.imageUrl} className={(prod.width >= prod.height)?"img-resize-ver":"img-resize-hor"} alt=""/>
                                    </div>
                                </ProdRectView>
                            </div>
                            <div className='text-content'>
                                {(props.isListViewActive==="LIST"?
                                <>{prod.productName}<br/>
                                <small>{props.t("brand")+": "}{prod.brandName&&prod.brandName!==""&&prod.brandName!=="-"?(prod.brandName+" "):(props.t("notavailable")+" ")}</small><br/>
                                <small style={{fontSize:"0.75rem"}}><i>{props.t('width')}: {prod.width+""+convertUomtoSym(prod.uom)}, {props.t('height')}: {prod.height+""+convertUomtoSym(prod.uom)}</i></small></>:
                                <></>)}
                            </div>
                        </Col></Col>):(<></>))}
                        {props.srchprodsloading?<Col xs={12} className="text-center" style={{marginBottom: "5px"}}><img src={loadinggif} className="img-fluid" style={{height:"20px"}} alt="" /></Col>:<></>}
                    </Row>
                    {props.filteredProdList.length < props.ptotalresults?
                    <Col xs={12} className="ploadmore-link text-center" onClick={() => {props.loadMoreProds()}}>{props.t('btnnames.loadmore')}</Col>:<></>}
                </Col>
            </Col>:<></>)}
        </Col>
    </>;
}

function ProdRectView(props) {
    const [show, setShow] = useState(false);
    const target = useRef(null);
    const prod = props.prod;
    const isshowview = (props.viewtype === "LIST"?false:true);
    const trans = props.t;
    return (
      <>
        <span ref={target} onMouseOver={() => setShow(isshowview)} onMouseOut={() => setShow(false)}>
          {props.children}
        </span>
        <Overlay target={target.current} transition={false} show={show} placement={props.isRTL==="rtl"?"left":"right"}>
          {(props) => (
            <Tooltip {...props}>
              <><small style={{fontSize:"0.75rem"}}>{prod.barcode}</small><br/>{prod.productName}<br/>
              <small>{trans("brand")}: {(prod.brandName&&prod.brandName!==""&&prod.brandName!=="-"?(prod.brandName+" "):((trans?trans("notavailable"):"N/A")+" "))}</small><br/>
              <small style={{fontSize:"0.75rem"}}><i>{trans?trans('WIDTH'):"Width"} {prod.width+""+convertUomtoSym(prod.uom)}, {trans?trans('HEIGHT'):"Height"} {prod.height+""+convertUomtoSym(prod.uom)}</i></small></>
            </Tooltip>
          )}
        </Overlay>
      </>
    );
}
//products warnings sidebar
export function ProdsWarningSidebar (props){
    return <>
        <Col xs={12} md={3} className="fieldedit-sidebar warnings-sidebar" style={(props.isRTL==="rtl"?{left:(props.showWarningSidebar?"0px":"-440px")}:{right:(props.showWarningSidebar?"0px":"-440px")})}>
            <h4 className='warning-header'>
                <span>{props.t("DEPARTMENT_WARN")}</span>
                <span className='close-link' onClick={() => props.toggleWarningSidebar()}><XCircleFillIcon size={16} /></span>
            </h4>
            <Col className="warning-wrapper">
                <Accordion className='warning-list' defaultActiveKey={1}>
                    {props.warningProdList && props.warningProdList.length > 0?props.warningProdList.map((xitem,xidx) => {
                        return <Card key={xidx}>
                        <Card.Header>
                            <Badge bg="warning">{xitem.department.length} <ChevronDownIcon size={14} /></Badge>
                            <Accordion.Toggle as={Button} variant="link" eventKey={(xidx+1)}>
                            <CopyToClipboard text={xitem.barcode} onCopy={() => props.copyToClipboard()}><small>{xitem.barcode}</small></CopyToClipboard><br/> 
                            <div className="thumb-div" onClick={() => props.handleProductImgPreview({id:xitem.productId},true)}><img src={xitem.imgUrl} className="img-fluid" alt=""/></div>
                            <div className='txt-content'>{xitem.productName}<br/>
                            <small>{props.t("brand")}: {xitem.brandName && xitem.brandName !== ""?xitem.brandName:props.t("notavailable")}</small></div>
                            </Accordion.Toggle>
                        </Card.Header>
                        <Accordion.Collapse eventKey={(xidx+1)}>
                            <Card.Body>
                                <h6>{props.t("USED_DEPTS")}:</h6>
                                <ListGroup>
                                    {xitem.department?xitem.department.map((zitem, zidx) => {
                                        return <ListGroup.Item key={zidx}>{zitem.departmentName+(zitem.fieldNo?(" - "+zitem.fieldNo):"")}</ListGroup.Item>;
                                    })
                                    :<></>}
                                </ListGroup>
                            </Card.Body>
                        </Accordion.Collapse>
                    </Card>
                    }):<></>}
                </Accordion>
            </Col>
        </Col>
    </>;
}
//product warning modal
export function ProdWarningModal (props) {
    //console.log(props.warningProdItem);
    let warnitem = props.warningProdItem;
    return <>
        <Modal show={props.showSingleProdWarning} animation={false} onHide={() => props.toggleSingleProd(null)} className={"singleprodwarning-modal "+props.isRTL}>
            <Modal.Body>
                <div className='warn-text'>{props.t("WARN_PROD_BEEN_USED")}</div>
                <div className='thumb-div' onClick={() => props.handleProductImgPreview(warnitem,true)}>
                    <img src={warnitem.imageUrl} className="img-fluid" alt=""/>
                </div>
                <div className='text-content'>
                    <h4><CopyToClipboard text={warnitem.barcode} onCopy={() => props.copyToClipboard()}><small>{warnitem.barcode}</small></CopyToClipboard><br/> 
                    <span>{warnitem.productName}</span><br/>
                    <small>{props.t("brand")}: {warnitem.brandName && warnitem.brandName !== ""?warnitem.brandName:props.t("notavailable")}</small></h4>
                </div>
                <div className='dept-content'>
                    <h6>{props.t("USED_DEPTS")}</h6>
                    <ListGroup>
                        {warnitem.department && warnitem.department.length > 0?warnitem.department.map((xitem, xidx) =>{
                            return <ListGroup.Item key={xidx}>{xitem.departmentName+(xitem.fieldNo?(" - "+xitem.fieldNo):"")}</ListGroup.Item>;
                        })
                        :<></>}
                    </ListGroup>
                    <Col className='text-center'>
                        <Button type='button' variant='danger' onClick={() => props.toggleSingleProd(null)}>{props.t("OKAY_NOTED")}</Button>
                    </Col>
                </div> 
            </Modal.Body>
        </Modal>
    </>;
}