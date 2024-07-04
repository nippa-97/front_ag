import {useState, useRef} from 'react';
import { Col, Row, InputGroup, ButtonGroup, Dropdown, Form, Button, Overlay, Tooltip } from 'react-bootstrap';
import { XIcon, SearchIcon, ListUnorderedIcon, DiffAddedIcon, StopIcon, IssueReopenedIcon, ArrowSwitchIcon, CheckCircleFillIcon } from '@primer/octicons-react'; //
import { CopyToClipboard } from 'react-copy-to-clipboard'; //copy text to clipboard

import { convertUomtoSym } from '../../../../_services/common.service';
import { TooltipWrapper } from '../../../newMasterPlanogram/AddMethods';

import loadinggif from '../../../../assets/img/loading-sm.gif';
import NoIMage from '../../../../assets/img/noimage.png';


//#PLG-DU-PD-H01 products add sidebar view
export function ProdsAddSidebar (props){
    return <>
        <Col xs={12} className={"container-sidebar prodadd-sidebar "+(props.isShowProdView?" active":"")}>
            <span className="close-link float-right" onClick={props.toggleProdView}><XIcon size={16}/></span>
            <h4>{props.t('productslist')}</h4>
            <InputGroup size="sm" className="mb-3">
                <span className='searchicon-content'><SearchIcon size={18}/></span>
                <Form.Control id="filterprodtxt" aria-label="Small" placeholder={props.t('srchproduct')} aria-describedby="inputGroup-sizing-sm" onFocus={e => e.target.select()} onKeyUp={e => props.handleFilterProducts(e)}/>
            </InputGroup>

            <ButtonGroup className="float-right pviewchange-list">
                <Button variant="secondary" onClick={() => props.toggleProdListView("LIST")} className={(props.isListViewActive==="LIST"?"active":"")}><ListUnorderedIcon size={14} /></Button>
                <Button variant="secondary" onClick={() => props.toggleProdListView("GRID")} className={(props.isListViewActive==="GRID"?"active":"")}><DiffAddedIcon size={14}/></Button>
            </ButtonGroup>

            <Col xs={12} className='prodsidebar-wrapper'>
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
                                        <Dropdown.Toggle variant="warning"><StopIcon size={15}/></Dropdown.Toggle>
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

                                {prod.prodalreadyadded?<span className="editlink two"><CheckCircleFillIcon size={15}/></span>:<></>}
                                <span className={"editlink one "+(prod.rotatetype && (prod.rotatetype!=="default"&&prod.rotatetype!=="front")?"highred":"")} title={prod.rotatetype?(prod.rotatetype.replace("_"," ")):"default"} onClick={() => props.toggleRotateProd(prod,true)} style={(props.isRTL==="rtl"?{left:"25px"}:{right:"35px"})}><IssueReopenedIcon size={14}/></span>
                                <span className="editlink" onClick={() => props.handlePEMView(true,prod,false)}><ArrowSwitchIcon size={14}/></span>
                                
                                <div onClick={() => props.handleProductImgPreview(prod,true)}>
                                    <ProdRectView t={props.t} isRTL={props.isRTL} viewtype={props.isListViewActive} prod={prod}>
                                        <div className="thumb-div" draggable id={prod.id} 
                                        onMouseDown={(e) => {props.drawRectCanvas(prod,i)}} 
                                        onDragStart={(e) => props.dragStart(e, prod)}
                                        onDrag={e => props.dragProdView(e, prod)} 
                                        onDragEnd={() => props.prodDragEnd()}>
                                            {prod.imageUrl?<img key={i} src={prod.imageUrl} className={prod.width >= prod.height?"img-resize-ver":"img-resize-hor"} alt=""/>
                                            :<img key={i} src={NoIMage} className={prod.width >= prod.height?"img-resize-ver":"img-resize-hor"} alt=""/>}
                                        </div>
                                    </ProdRectView>
                                </div>
                                <div className='text-content'>
                                    {(props.isListViewActive==="LIST"?
                                    <>{prod.productName}<br/>
                                    <small>{props.t("brand")+": "}{prod.brandName&&prod.brandName!==""&&prod.brandName!=="-"?(prod.brandName+" "):(props.t("notavailable")+" ")}</small><br/>
                                    <small style={{fontSize:"0.75rem"}}><i>{props.t('WIDTH')}{(prod.width?prod.width:" - ")+""+convertUomtoSym(prod.uom)}, {props.t('HEIGHT')} {(prod.height?prod.height:" - ")+""+convertUomtoSym(prod.uom)}</i></small></>:"")}
                                </div>
                            </Col></Col>):(<></>))}
                        </Row>
                    </Col>
                </Col>:<></>)}

                {(props.isListViewActive!==null&&props.filteredProdList&&props.filteredProdList.length>0?<Col className="col-xs-12 div-con">
                    <h5>{props.t('productslist')}({props.filteredProdList.length}/{props.ptotalresults})</h5>
                    <Col xs={12} className="div-con subprod-list" id="pgprodlistlist" onScroll={(e)=>props.getScrollPosition(e)}>
                        <Row style={{marginLeft:"0px",width:"100%"}}>
                            {(props.filteredProdList ? props.filteredProdList.map((prod, i) =>
                            <Col key={i} className={"sub-item"+(props.isListViewActive==="LIST"?"":" rectview")} xs={props.isListViewActive==="LIST"?12:4}><Col style={{ margin: 5}}>
                                {props.isListViewActive==="LIST"?
                                    <CopyToClipboard text={prod.barcode} onCopy={() => props.copyToClipboard()}><small className='barcode-txt' style={{fontSize:"0.75rem"}}>{prod.barcode}</small></CopyToClipboard>
                                :<></>}
                                {prod.isDepartmentProduct?<span className="editlink warning-dept">
                                    <Dropdown className='usingdept-list'>
                                        <Dropdown.Toggle variant="warning"><StopIcon size={15}/></Dropdown.Toggle>
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

                                {prod.prodalreadyadded?<TooltipWrapper text={props.t("ALREADY_ADDED")}><span className="editlink two"><CheckCircleFillIcon size={15}/></span></TooltipWrapper>:<></>}
                                <span className={"editlink one "+(prod.rotatetype&&(prod.rotatetype!=="default"&&prod.rotatetype!=="front"?"highred":""))} title={prod.rotatetype?(prod.rotatetype.replace("_"," ")):"default"} onClick={() => props.toggleRotateProd(prod,true)} style={(props.isRTL==="rtl"?{left:"25px"}:{right:"35px"})}><IssueReopenedIcon size={14}/></span>
                                <span className="editlink" onClick={() => props.handlePEMView(true,prod,false)}><ArrowSwitchIcon size={14}/></span>
                                
                                <div onClick={() => props.handleProductImgPreview(prod,true)}>
                                    <ProdRectView t={props.t} isRTL={props.isRTL} viewtype={props.isListViewActive} prod={prod}>
                                        <div className="thumb-div" draggable id={prod.id} 
                                        onMouseDown={(e) => {props.drawRectCanvas(prod,i)}} 
                                        onDragStart={(e) => props.dragStart(e, prod)}
                                        onDrag={e => props.dragProdView(e, prod)} 
                                        onDragEnd={() => props.prodDragEnd()}>
                                            {prod.imageUrl?<img key={i} src={prod.imageUrl} className={prod.width >= prod.height?"img-resize-ver":"img-resize-hor"} alt=""/>:
                                            <img key={i} src={NoIMage} className={prod.width >= prod.height?"img-resize-ver":"img-resize-hor"} alt=""/>}
                                        </div>
                                    </ProdRectView>
                                </div>

                                <div className='text-content'>
                                    {(props.isListViewActive==="LIST"?
                                    <><div className='productnameclick-span' onClick={()=>props.handleopenDetailmodal(prod)}>{prod.productName}<br/>
                                    <small>{props.t("brand")+": "}{prod.brandName&&prod.brandName!==""&&prod.brandName!=="-"?(prod.brandName+" "):(props.t("notavailable")+" ")}</small><br/>
                                    <small style={{fontSize:"0.75rem"}}><i>{props.t('width')}: {(prod.width?prod.width:" - ")+""+convertUomtoSym(prod.uom)}, {props.t('height')}: {(prod.height?prod.height:" - ")+""+convertUomtoSym(prod.uom)}</i></small></div></>:
                                    <></>)}
                                </div>

                            </Col></Col>):(<></>))}
                            
                        </Row>
                    
                    </Col>
                </Col>:<></>)}
                
                {props.srchprodsloading?
                    <Col xs={12} className="text-center prodloading-overlay"><img src={loadinggif} className="img-fluid" style={{height:"20px"}} alt="" /></Col>
                :<></>}
            </Col>
        </Col>
    </>;
}

export function ProdRectView(props) {
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
              <small style={{fontSize:"0.75rem"}}><i>{trans?trans('WIDTH'):"Width"} {(prod.width?prod.width:" - ")+""+convertUomtoSym(prod.uom)}, {trans?trans('HEIGHT'):"Height"} {(prod.height?prod.height:" - ")+""+convertUomtoSym(prod.uom)}</i></small></>
            </Tooltip>
          )}
        </Overlay>
      </>
    );
}