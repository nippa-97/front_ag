import { Col, Accordion, Card, Badge, ListGroup, Modal, Button } from 'react-bootstrap';
import { XCircleFillIcon, ChevronDownIcon } from '@primer/octicons-react';
import { CopyToClipboard } from 'react-copy-to-clipboard'; //copy text to clipboard

//products warnings sidebar
export function ProdsWarningSidebar (props){
    return <>
        <Col xs={12} md={3} className="fieldedit-sidebar warnings-sidebar" style={(props.isRTL==="rtl"?{left:(props.showWarningSidebar?"5px":"-500px")}:{right:(props.showWarningSidebar?"5px":"-500px")})}>
            <h4 className='warning-header'>
                <span>{props.t("DEPARTMENT_WARN")}</span>
                <span className='close-link' onClick={() => props.toggleWarningSidebar()}><XCircleFillIcon size={16} /></span>
                <div className='warnicon-content'></div>
            </h4>
            <Col className="warning-wrapper">
                <Accordion className='warning-list' defaultActiveKey={1}>
                    {props.warningProdList && props.warningProdList.length > 0?props.warningProdList.map((xitem,xidx) => {
                        return <Accordion.Item key={xidx} eventKey={(xidx+1)}>
                        <Accordion.Header>
                            <Badge bg="warning">{xitem.department.length} <ChevronDownIcon size={14} /></Badge>
                            <Accordion.Button as={Button} variant="link" eventKey={(xidx+1)}>
                            <div className="thumb-div" onClick={() => props.handleProductImgPreview({id:xitem.productId},true)}>
                                <img src={xitem.imgUrl} className="img-resize-ver" alt=""/>
                            </div>
                            
                            <div className='txt-content'>
                                <CopyToClipboard text={xitem.barcode} onCopy={() => props.copyToClipboard()}><small className='barcode-txt'>{xitem.barcode}</small></CopyToClipboard>
                                {xitem.productName}
                                <small>{props.t("brand")}: {xitem.brandName && xitem.brandName !== ""?xitem.brandName:props.t("notavailable")}</small></div>
                            </Accordion.Button>
                        </Accordion.Header>
                        {/* <Accordion.Collapse eventKey={(xidx+1)}> */}
                            <Accordion.Body >
                                <h6>{props.t("USED_DEPTS")}:</h6>
                                <Col className='depts-list'>
                                    {xitem.department?xitem.department.map((zitem, zidx) => {
                                        return <span key={zidx} title={zitem.departmentName}>{(zitem.departmentName.substring(0,15)+(zitem.departmentName.length > 15?"..":"")) +(zitem.fieldNo?(" - "+zitem.fieldNo):"")} {(zidx + 1) < xitem.department.length?"|":""}</span>;
                                    })
                                    :<></>}
                                </Col>
                            </Accordion.Body>
                        {/* </Accordion.Collapse> */}
                    </Accordion.Item>
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