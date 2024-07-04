import { DiffAddedIcon, ListUnorderedIcon, PlusIcon, XCircleFillIcon } from '@primer/octicons-react'
import React, { Component, useRef, useState } from 'react'
import { Button, ButtonGroup, Col, Form, InputGroup, Nav, Overlay, Row, Tab, Tooltip } from 'react-bootstrap'
import { convertUomtoSym } from '../../../../../../_services/common.service'
import { NoSimProductsComp, RuleWarningsComp } from '../EditSimulateCategoryComps'
import EditSimulateClipBoard from '../EditSimulateClipBoard'
import loadinggif from '../../../../../../assets/img/loading-sm.gif';
import FeatherIcon from 'feather-icons-react';
import { SearchIcon } from '../../../../../../assets/icons/icons'
import { CopyToClipboard } from 'react-copy-to-clipboard'; //copy text to clipboard
import i18n from "../../../../../../_translations/i18n"; 
import { withTranslation } from 'react-i18next'
import { withRouter } from 'react-router-dom';

class SimulationTabMenuSection extends Component {
    constructor(props) {
        super(props)

        this.state = {
            
        }
    }

    render() {
        return (
            <Col xs={12} style={{padding:"10px",height:this.props.catDivHeight+100}} className="middle-section-cat" >
                <Tab.Container activeKey={this.props.productTab} onSelect={this.props.handleclipbordopen}>
                    <Row>
                        <Col>
                            <Nav variant="pills" className="flex-row">
                                <Nav.Item>
                                    <Nav.Link eventKey="products">{this.props.t("products")}</Nav.Link>
                                </Nav.Item>
                                <Nav.Item>
                                    <Nav.Link eventKey="clipboard">
                                        {this.props.t("CLIPBOARD")}
                                        {this.props.cutArray.length>0?<span className='prevwCount'>{this.props.cutArray.length}</span>:<></>}
                                        </Nav.Link>
                                </Nav.Item>
                                <Nav.Item>
                                    <Nav.Link eventKey="notsimprods">
                                        {this.props.t("NOT_SIM_PRODUCTS")}
                                        {(this.props.nonfilteredNonEProducts.filter(p=>p.isAdded!==true).length>0)?<span className='prevwCount' style={{left: "98px"}}>{this.props.nonfilteredNonEProducts.filter(p=>p.isAdded!==true).length}</span>:<></>}
                                        </Nav.Link>
                                </Nav.Item>
                                <Nav.Item>
                                    <Nav.Link eventKey="rulewarnings">
                                        {this.props.isRuleWarn.isshow?<span className='warn-icon'><FeatherIcon icon="alert-triangle"
                                        color={(this.props.isRuleWarn.mainWarnStatus==="danger")?"red":(this.props.isRuleWarn.mainWarnStatus==="warning")?"yellow":"green"} 
                                        size={20} /></span>:<></>}
                                        {this.props.t("rules")}
                                    </Nav.Link>
                                </Nav.Item>
                            </Nav>
                        </Col>
                        <Col xs={12}>
                            <Tab.Content>
                                <Tab.Pane eventKey="products">
                                    {console.log(this.props.isAddProucts)}
                                {this.props.isAddProucts?
                                    <Col className='searchprodBox'>
                                        <span className="custom-btn" onClick={()=>this.props.toggleprodAddNProdpanel()} style={this.props.isRTL=== "rtl"?{float:"left"}:{float:"right"}}> <XCircleFillIcon /></span>
                                        <h4>{this.props.t('productslist')}</h4>
                                        <InputGroup size="sm" className="mb-3 input-search">
                                            <Form.Control id="filterprodtxt" aria-label="Small" placeholder={this.props.t('srchproduct')} aria-describedby="inputGroup-sizing-sm" onKeyUp={e => this.props.handleFilterProducts(e)}/>
                                            <InputGroup.Text id="inputGroup-sizing-sm"><SearchIcon size={18}/></InputGroup.Text>
                                        </InputGroup>

                                        <ButtonGroup className={"pviewchange-list "+(this.props.isRTL=== "rtl"?"float-left":"float-right")}>
                                            <Button variant="secondary" onClick={() => this.props.toggleProdListView("LIST")} className={(this.props.isListViewActive==="LIST"?"active":"")}><ListUnorderedIcon size={14} /></Button>
                                            <Button variant="secondary" onClick={() => this.props.toggleProdListView("GRID")} className={(this.props.isListViewActive==="GRID"?"active":"")}><DiffAddedIcon size={14}/></Button>
                                        </ButtonGroup>

                                        {(this.props.isListViewActive!==null&&this.props.recentProdList&&this.props.filteredProdList.length===0?
                                        <Col className="col-xs-12 div-con">
                                            <h5> {this.props.t('recentlist')}</h5>
                                            <Col xs={12} className="div-con subprod-list">
                                                <Row style={this.props.isRTL === "rtl"?{marginRight:"0px",width:"100%"}:{marginLeft:"0px",width:"100%"}}>
                                                        {(this.props.recentProdList? this.props.recentProdList.map((prod, i) =>
                                                        <Col key={i} className={"sub-item"+(this.props.isListViewActive==="LIST"?"":" rectview")} xs={this.props.isListViewActive==="LIST"?12:4}><Col style={{ margin: 5}}>
                                                        {/* <span className={"editlink "+(prod.rotatetype&&(prod.rotatetype!=="default"&&prod.rotatetype!=="front"?"highred":""))} title={prod.rotatetype?(prod.rotatetype.replace("_"," ")):"default"} onClick={() => this.toggleRotateProd(prod,true)} style={(this.props.isRTL==="rtl"?{left:"35px"}:{right:"35px"})}><IssueReopenedIcon size={14}/></span>
                                                            <span className="editlink" onClick={() => this.handlePEMView(true,prod,false)}><ArrowSwitchIcon size={14}/></span> */}
                                                        <div onClick={() => this.props.handlePreviewModal(prod,true)}>
                                                            <ProdRectView t={this.props.t} isRTL={this.props.isRTL} viewtype={this.props.isListViewActive} prod={prod}>
                                                                <div className="thumb-div" draggable id={prod.id} ref={(r) => this[prod.id] = r} onMouseDown={(e) => {this.drawRectCanvas(prod)}} onDragStart={(e) => this.dragStart(e, prod)} onDrag={e => this.dragProdView(e, prod)} onDragEnd={() => this.prodDragEnd()}>
                                                                    <img key={i} src={prod.imageUrl} className={prod.width >= prod.height?"img-resize-ver":"img-resize-hor"} alt=""/>
                                                                </div>
                                                            </ProdRectView>
                                                        </div>
                                                            {(this.props.isListViewActive==="LIST"?
                                                        <><CopyToClipboard text={prod.barcode} onCopy={() => this.props.copyToClipboard()}><small style={{fontSize:"0.75rem"}}>{prod.barcode}</small></CopyToClipboard><br/>{prod.productName}<br/>
                                                        <small>{this.props.t("brand")+": "}{prod.brandName&&prod.brandName!==""&&prod.brandName!=="-"?(prod.brandName+" "):(this.props.t("notavailable")+" ")}</small><br/>
                                                        <small style={{fontSize:"0.75rem"}}><i>{this.props.t('WIDTH')}{prod.width+""+convertUomtoSym(prod.uom)}, {this.props.t('HEIGHT')} {prod.height+""+convertUomtoSym(prod.uom)}</i></small></>:"")}
                                                    </Col></Col>):(<></>))}

                                                </Row>
                                            </Col>
                                        </Col>:<></>)}

                                        {(this.props.isListViewActive!==null&&this.props.filteredProdList&&this.props.filteredProdList.length>0?
                                        <Col className="col-xs-12 div-con">
                                            <h5>{this.props.t('productslist')}</h5>
                                            <Col xs={12} className="div-con subprod-list">
                                                <Row style={this.props.isRTL === "rtl"?{marginRight:"0px",width:"100%"}:{marginLeft:"0px",width:"100%"}}>
                                                    {(this.props.filteredProdList ? this.props.filteredProdList.map((prod, i) =>
                                                    <Col key={i} className={"sub-item"+(this.props.isListViewActive==="LIST"?"":" rectview")} xs={this.props.isListViewActive==="LIST"?12:4}><Col style={{ margin: 5}}>
                                                        {/* <span className={"editlink "+(prod.rotatetype&&(prod.rotatetype!=="default"&&prod.rotatetype!=="front"?"highred":""))} title={prod.rotatetype?(prod.rotatetype.replace("_"," ")):"default"} onClick={() => this.toggleRotateProd(prod,true)} style={(this.props.isRTL==="rtl"?{left:"35px"}:{right:"35px"})}><IssueReopenedIcon size={14}/></span>
                                                        <span className="editlink" onClick={() => this.handlePEMView(true,prod,false)}><ArrowSwitchIcon size={14}/></span> */}
                                                        <div onClick={() => this.props.handlePreviewModal(prod,true)}>
                                                            <ProdRectView t={this.props.t} isRTL={this.props.isRTL} viewtype={this.props.isListViewActive} prod={prod}>
                                                                <div className="thumb-div" draggable id={prod.id} ref={(r) => this[prod.id] = r} onMouseDown={(e) => {this.drawRectCanvas(prod)}} onDragStart={(e) => this.dragStart(e, prod)} onDrag={e => this.dragProdView(e, prod)} onDragEnd={() => this.prodDragEnd()}>
                                                                    <img key={i} src={prod.imageUrl} className={prod.width >= prod.height?"img-resize-ver":"img-resize-hor"} alt=""/>
                                                                </div>
                                                            </ProdRectView>
                                                        </div>
                                                        {(this.props.isListViewActive==="LIST"?
                                                        <><CopyToClipboard text={prod.barcode} onCopy={() => this.props.copyToClipboard()}><small style={{fontSize:"0.75rem"}}>{prod.barcode}</small></CopyToClipboard><br/>
                                                        <div style={{cursor:"pointer"}} onClick={()=>this.props.handleopenDetailmodal(prod)}>{prod.productName}<br/>
                                                        <small >{this.props.t("brand")+": "}{prod.brandName&&prod.brandName!==""&&prod.brandName!=="-"?(prod.brandName+" "):(this.props.t("notavailable")+" ")}</small><br/>
                                                        <small style={{fontSize:"0.75rem"}}><i>{this.props.t('width')}: {prod.width+""+convertUomtoSym(prod.uom)}, {this.props.t('height')}: {prod.height+""+convertUomtoSym(prod.uom)}</i></small>

                                                        </div>
                                                        
                                                        </>:
                                                        <></>)}
                                                    </Col></Col>):(<></>))}
                                                    {this.props.srchprodsloading?<Col xs={12} className="text-center" style={{marginBottom: "5px"}}><img src={loadinggif} className="img-fluid" style={{height:"20px"}} alt="" /></Col>:<></>}
                                                </Row>
                                                {this.props.filteredProdList.length < this.props.ptotalresults?
                                                <Col xs={12} className="ploadmore-link text-center" onClick={() => {this.props.loadMoreProds()}}>{this.props.t('btnnames.loadmore')}</Col>:<></>}
                                            </Col>
                                        </Col>:<></>)}
                                        {this.props.srchprodsloading?<Col className='loadingprod-wrapper'><img src={loadinggif} className="img-fluid loadingProdPlanel" style={{height:"30px"}} alt="" /></Col>:<></>}
                                    </Col>
                                    :
                                    <Col className="prod_bar">
                                        <Button className='addbtn' onClick={()=>this.props.handleAddProduct()}><PlusIcon size={16}  /></Button>
                                        <Col className='newprods'>
                                            <h6>{this.props.t("newproducts")}</h6>
                                            <Col md={12} className="prods">
                                                    <Row>
                                                        {console.log(this.props.addedProductsCounter)}
                                                        {this.props.addedProductsCounter.length>0?this.props.addedProductsCounter.map((prod,i)=>
                                                                <Col  className='prodbox' key={i} onClick={()=>this.props.handlePreviewModal(prod,true)}>
                                                                    <img draggable={false} src={prod.imageUrl } alt=""/>
                                                                    <span>{prod.qty}</span>
                                                                </Col>
                                                        ):<></>}
                                                        
                                                    </Row>
                                            </Col>
                                        </Col>
                                        <Col className='removed_prods'>
                                            <h6>{this.props.t("removeproducts")}</h6>
                                            <Col md={12} className="prods">
                                                <Row>
                                                    {this.props.removedProductsCounter.length>0?this.props.removedProductsCounter.map((prod,i)=>
                                                            <Col  className='prodbox' key={i} onClick={()=>this.props.handlePreviewModal(prod,true)}>
                                                                <img draggable={false} src={prod.imageUrl } alt=""/>
                                                                <span>{prod.qty}</span>
                                                            </Col>
                                                    ):<></>}
                                                    
                                                </Row>
                                            </Col>
                                        </Col>
                                    </Col>}
                                </Tab.Pane>
                                <Tab.Pane eventKey="clipboard">
                                    <EditSimulateClipBoard 
                                        cutArray={this.props.cutArray} 
                                        clipDragType={this.props.clipDragType}
                                        displayRatio={this.props.displayRatio} 
                                        zoomXRatio={this.props.zoomXRatio}
                                        dragStart={this.props.dragStart}
                                        drawRectCanvas={this.props.drawRectCanvas} 
                                        ghostFromParent={this.props.ghostFromParent} 
                                        setPreviewGuid={this.props.setPreviewGuid}
                                        toggleClipDragType={this.props.toggleClipDragType}
                                        updateSingleCutProduct={this.props.updateSingleCutProduct}
                                        />
                                </Tab.Pane>
                                <Tab.Pane eventKey="notsimprods">
                                    <NoSimProductsComp
                                        noSim_filter={this.props.noSim_filter}
                                        drawRectCanvas={this.props.drawRectCanvas}
                                        dragStart={this.props.dragStart}
                                        dragProdView={this.props.dragProdView}
                                        prodDragEnd={this.props.prodDragEnd}
                                        handlePreviewModal={this.props.handlePreviewModal}
                                        handleFilterNoEProducts={this.props.handleFilterNoEProducts}
                                        copyToClipboard={this.props.copyToClipboard}
                                        isRTL={this.props.isRTL} t={this.props.t} 
                                        nonfilteredNonEProducts={this.props.nonfilteredNonEProducts}
                                        />
                                </Tab.Pane>
                                <Tab.Pane eventKey="rulewarnings">
                                    <RuleWarningsComp 
                                    isRuleWarn={this.props.isRuleWarn}
                                    mapRulesList={this.props.mapRulesList} 
                                    isRTL={this.props.isRTL} trans={this.props.t} />
                                </Tab.Pane>
                            </Tab.Content>
                        </Col>
                    </Row>
                </Tab.Container>
            </Col>
        )
    }
}

function ProdRectView(props) {
    const [show, setShow] = useState(false);
    const target = useRef(null);
    const prod = props.prod;
    const isshowview = (props.viewtype === "LIST"?false:true);
    const trans = props.t;
    return (
      <>
        <div ref={target} onMouseOver={() => setShow(isshowview)} onMouseOut={() => setShow(false)}>
          {props.children}
        </div>
        <Overlay target={target.current} transition={false} show={show} placement={props.isRTL==="rtl"?"left":"right"}>
          {(props) => (
            <Tooltip {...props}>
              <><small style={{fontSize:"0.75rem"}}>{prod.barcode&&prod.barcode}</small><br/>{(prod.brandName&&prod.brandName!==""&&prod.brandName!=="-"?(prod.brandName+" "):(i18n.t("notavailable")+" "))+prod.productName}<br/>
              <small style={{fontSize:"0.75rem"}}><i>{trans?trans('WIDTH'):"Width"} {prod.width+""+convertUomtoSym(prod.uom)}, {trans?trans('HEIGHT'):"Height"} {prod.height+""+convertUomtoSym(prod.uom)}</i></small></>
            </Tooltip>
          )}
        </Overlay>
      </>
    );
}


export default withTranslation()(withRouter(SimulationTabMenuSection))