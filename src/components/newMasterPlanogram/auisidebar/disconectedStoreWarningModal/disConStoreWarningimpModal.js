import { XIcon } from '@primer/octicons-react'
import React from 'react'
import { Button, Col, Form, Modal, Row } from 'react-bootstrap'
import "./disConStoreWarningimpModal.css"
import {  MPWarnIcon } from '../../../../assets/icons/icons'
import { DisconnectWarningArrowRight, DisconnectWarningsmallArrowRight, DisconnectWarningsmallArrowleft } from '../../../../assets/icons/auiIcons'
import Switch from "react-switch";
import { CopyToClipboard } from 'react-copy-to-clipboard'; //copy text to clipboard
import i18n from "../../../../_translations/i18n"; 

function DisConStoreWarningimpModal(props) {
    var {selectedstorecon,
        // disconnectWarningobj
        }=props
    return (
        <Modal centered  size="lg" className={'contimplement-modal aui-disconstorewarning-modal '+(props.isRTL === "rtl" ? "RTL":"LTR")}  show={props.isshow} 
        // dir={props.isRTL}
         onHide={() => this.props.handlePreviewModal(null,false)} animation={false} backdrop="static">
            {(selectedstorecon!==null)?<Modal.Body>
                <div className='content'>
                    {/* <div className='btngroup'>
                        {disconnectWarningobj.length>0?disconnectWarningobj.map((store,s)=><span key={s} className={`content-title${(store.storeId===selectedstorecon.storeId)?"-active":""}`} onClick={()=>props.handleConfStoretab(s)}>{store.storeName}</span>):<></>
                        }
                    </div> */}
                    <div className='closebtn' onClick={() => props.hadleAuiMarkImpStoreWarning(false)}><XIcon size={35} /></div>
                    <div >
                        <div className='top-set'>
                            <MPWarnIcon width={70} height={62} />
                            <div className='messageContainer'>
                                <div className='message'>
                                    {i18n.t("MISSING_NEW_PRODUCTS_AVAILABLE_IN")} <b>{selectedstorecon.storeName?selectedstorecon.storeName:"No Store"}</b> {i18n.t("WHEN_PUSHING_TO_NEW_VERSION_SHOWING_BELOW")}
                                </div>
                                <div>
                                    <div className='cardsec-titile'>
                                        <Row>
                                            <Col><span>{i18n.t("CURRENT_VERSION")}</span></Col>
                                            <Col></Col>
                                            <Col>{i18n.t("UPDTING_VERSION")}</Col>
                                        </Row>
                                    </div>
                                    <div className='cardsec'>
                                        <Row>
                                            <Col className='versioncard'>
                                                <span>{selectedstorecon.currentVersionName}</span> {selectedstorecon.currentVersionNumber?selectedstorecon.currentVersionNumber:"-"}<span></span> </Col>
                                            <Col><DisconnectWarningArrowRight /></Col>
                                            <Col className='versioncard'>
                                                <span>{selectedstorecon.updatingVersionName}</span> {selectedstorecon.updatingVersionNumber?selectedstorecon.updatingVersionNumber:"-"}<span></span>
                                            </Col>
                                        </Row>
                                    </div>
                                </div>
                        
                            </div>
                        </div>
                    </div>
                    <div className='productsection'>
                        <div className='selectalldiv'>
                            <div>
                                <span>{i18n.t("SELECT_ALL")}</span>
                                <Switch 
                                    onChange={() => props.handlemarkselectingconflictmodalAll()}
                                    checked={props.selectedstorecon.selectAll?props.selectedstorecon.selectAll:false} 
                                    height={17} width={30} uncheckedIcon={true} checkedIcon={true}
                                    handleDiameter={12} activeBoxShadow={"none"} 
                                    className="Scycleswitch"
                                    //   className={"Scycleswitch"+(this.state.isSalesCycle?" checked":"")} 
                                    onColor={"#f2f1ff"} offColor={"#f2f1ff"} offHandleColor={"#C2BFBF"} 
                                    //   onHandleColor={this.props.dmode?"#2CC990":"#5128A0"}
                                    />
                            </div>
                        </div>
                        <div className='list'>
                            <Row className='titles'>
                                <Col>
                                    <span>V{selectedstorecon.currentVersionNumber}</span>
                                    <span className='middle'><DisconnectWarningsmallArrowRight /></span>
                                    <span>V{selectedstorecon.updatingVersionNumber?selectedstorecon.updatingVersionNumber:"-"}</span>
                                </Col>
                                <Col>
                                    <span>V{selectedstorecon.currentVersionNumber}</span>
                                    <span className='middle'><DisconnectWarningsmallArrowleft /></span>
                                    <span>V{selectedstorecon.updatingVersionNumber?selectedstorecon.updatingVersionNumber:"-"}</span></Col>
                                <Col>{i18n.t("COMMAN")}</Col>
                            </Row>
                            <div className='prodlistdiv'>
                                <Row>
                                    <Col >
                                        {(selectedstorecon.oldToNewList&&selectedstorecon.oldToNewList)?selectedstorecon.oldToNewList.map((onplist,o)=>
                                            <div className='prodcard' key={o}>
                                                <div className='insideboxnameboxcard'>
                                                    <Form.Check type="checkbox"
                                                        checked={onplist.isSelected?onplist.isSelected:false}
                                                        onChange={() => props.handlemarkselectingconflictmodal(o,"oldToNewList")}
                                                        />
                                                     <div>
                                                        {onplist.products.length>0?onplist.products.map((onlist,q)=><div style={{display:"flex"}} key={q}>
                                                                <div className="thumb-div">
                                                                    <img  src={onlist.imgUrl} className={"img-resize-hor"} alt=""/>
                                                                </div>
                                                                <div className='text'><CopyToClipboard text="d00000000" onCopy={() => props.copyToClipboard()}><small style={{fontSize:"0.75rem"}}>{onlist.productBarcode}</small></CopyToClipboard>
                                                                <h2 style={{fontSize:"0.75rem"}}>{onlist.productName}</h2>
                                                                </div>
                                                        </div>):<></>}
                                                    </div>
                                                </div>
                                            </div>)
                                        :<></>}
                                    </Col>
                                    <Col >
                                    {(selectedstorecon.newToOldList&&selectedstorecon.newToOldList)?selectedstorecon.newToOldList.map((noplist,k)=><div className='prodcard'>
                                                <div key={k} className='insideboxnameboxcard'>
                                                    <Form.Check type="checkbox"
                                                    checked={noplist.isSelected?noplist.isSelected:false}
                                                    onChange={() => props.handlemarkselectingconflictmodal(k,"newToOldList")}
                                                    />
                                                    <div>
                                                        {noplist.products.length>0?noplist.products.map((nolist,q)=><div style={{display:"flex"}} key={q}>
                                                            <div className="thumb-div">
                                                                <img  src={nolist.imgUrl} className={"img-resize-hor"} alt=""/>
                                                            </div>
                                                            <div className='text'><CopyToClipboard text="d00000000" onCopy={() => props.copyToClipboard()}><small style={{fontSize:"0.75rem"}}>{nolist.productBarcode}</small></CopyToClipboard>
                                                            <h2 style={{fontSize:"0.75rem"}}>{nolist.productName}</h2>
                                                            </div>
                                                        </div>):<></>}
                                                    </div>
                                                </div>
                                            </div>)
                                        :<></>}
                                    </Col>
                                    <Col >
                                    {(selectedstorecon.commonList&&selectedstorecon.commonList)?selectedstorecon.commonList.map((complist,i)=><div className='prodcard'>
                                                <div key={i} className='insideboxnameboxcard'>
                                                    <Form.Check type="checkbox"
                                                    checked={complist.isSelected?complist.isSelected:false}
                                                    onChange={() => props.handlemarkselectingconflictmodal(i,"commonList")}
                                                    />
                                                    <div>
                                                        {complist.products.length>0?complist.products.map((comlist,q)=><div style={{display:"flex"}} key={q}>
                                                            <div className="thumb-div">
                                                                <img  src={comlist.imgUrl} className={"img-resize-hor"} alt=""/>
                                                            </div>
                                                            <div className='text'><CopyToClipboard text="d00000000" onCopy={() => props.copyToClipboard()}><small style={{fontSize:"0.75rem"}}>{comlist.productBarcode}</small></CopyToClipboard>
                                                            <h2 style={{fontSize:"0.75rem"}}>{comlist.productName}</h2>
                                                            </div>
                                                        </div>):<></>}
                                                    </div>
                                                </div>
                                                </div>)
                                        :<></>}
                                    </Col>
                                </Row>
                            </div>
                            
                            
                        </div>
                        <div style={{textAlign:"right"}}><Button onClick={()=>props.ClickApplyDiscon()} >{i18n.t("APPLY")}</Button></div>
                        
                    </div>
                </div>
                    
            </Modal.Body>:<></>}
                    <Modal.Body className="text-center"></Modal.Body>
        </Modal>
    )
}

export default DisConStoreWarningimpModal
