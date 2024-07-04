import React, { Component } from 'react';
import { Col } from 'react-bootstrap';
import { CopyToClipboard } from 'react-copy-to-clipboard'; //copy text to clipboard
// import { convertUomtoSym } from '../../../../_services/common.service';

import i18n from "../../../../_translations/i18n"; 
import { ProdRectView } from './productsidebar';

export default class PgHistoryTabView extends Component {
    render() {
        return (
            <div className="historytab-view container-sidebar prodadd-sidebar">
                <Col className='subprod-list'>
                    {(this.props.historyTabList && this.props.historyTabList.length > 0)?<>
                        <Col className="scroll-content" style={{width:"100%"}}>
                            <ul className="list-inline pgview-addeditems">
                                {this.props.historyTabList.map((prod, prodidx) => {
                                    return <React.Fragment key={prodidx}>
                                        <Col className={"sub-item"} xs={12}><Col style={{ margin: 5}}>
                                            <div onClick={() => this.props.handleProductImgPreview(prod,true)}>
                                                <ProdRectView t={i18n.t} isRTL={this.props.isRTL} viewtype={"LIST"} prod={prod}>
                                                    <div className="thumb-div">
                                                        <img src={prod.imageUrl} className="img-fluid" alt=""/>
                                                    </div>
                                                </ProdRectView>
                                            </div>

                                            <div className='text-content'>
                                                <CopyToClipboard text={prod.barcode} onCopy={() => this.props.copyToClipboard()}><small className='barcode-txt' style={{fontSize:"0.75rem"}}>{prod.barcode}</small></CopyToClipboard><br/>
                                                <>{prod.productName}<br/>
                                                <small>{i18n.t("brand")+": "}{prod.brandName&&prod.brandName!==""&&prod.brandName!=="-"?(prod.brandName+" "):(i18n.t("notavailable")+" ")}</small><br/>
                                                {/* <small style={{fontSize:"0.75rem"}}><i>{i18n.t('width')}: {prod.width+""+convertUomtoSym(prod.uom)}, {i18n.t('height')}: {prod.height+""+convertUomtoSym(prod.uom)}</i></small> */}</>
                                            </div>
                                        </Col></Col>
                                    </React.Fragment>;
                                })}
                            </ul>
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