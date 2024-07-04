import React from "react";
import { ListGroup, Col , Tabs, Tab, Dropdown } from "react-bootstrap";
import { CheckCircleFillIcon, PlusIcon, DashIcon, StopIcon } from '@primer/octicons-react';
import { CopyToClipboard } from 'react-copy-to-clipboard';

import { alertService } from '../../../_services/alert.service';
import { roundOffDecimal } from '../../../_services/common.service';


/**
 * #PLG-DU-PP-H03
 * propose list what suggesting with active planogram of this field to improve sales
 * it shows what products to remove and add
 * adding product can drag and drop from this view
 * remove/add product are hightlighting when click each item - only hightlight one
 * when adding or removing this view shows is it added or removed by right icon (red or green)
 *
 * @param {*} props
 * @return {*} 
 */
function ViewProposeList(props) {
   //adding/removing list
    var removeproplist = (props.loadedproposelist&&props.loadedproposelist.removeItemArray?props.loadedproposelist.removeItemArray:[]);
    var addproplist = (props.loadedproposelist&&props.loadedproposelist.addingItemArray?props.loadedproposelist.addingItemArray:[]);
    
    //for add product - this draws green box to indicate product size when dropping product to field - helps to understand product size
    const handledrawRectCanvas = (prod,idx) => {
      if(prod){
        props.drawRectCanvas(prod,idx);
      } else{
        alertService.warn("Product information not found");
      }
    }
    //for add product - ondrag add product to field
    const handledragStart = (e, prod) => {
      props.dragStart(e, prod);
    }

    return (<Col className="proposeview-modal">
        <h3>{props.t("proposals")}</h3>
        <Col className="submain-content">
          <Tabs defaultActiveKey="add" id="uncontrolled-tab-example1" className="mb-6 prop-items-tabs">
            <Tab eventKey="add" title={<PlusIcon size={16} />}>
              <ListGroup>
              {
               addproplist.length>0 ?
               <>
                {addproplist.map((nitem, nidx) => {
                      return <ListGroup.Item key={nidx} className="add-item" style={{borderCorlor:"#77db61"}}><div className="props_high" onClick={() => props.handleprophighlight(2,nitem.itemId)} style={(props.isRTL==="rtl"?{paddingRight:"35px"}:{paddingRight:"0px"})}>
                          
                          {nitem.isDepartmentProduct?<span className="editlink warning-dept">
                              <Dropdown className='usingdept-list'>
                                  <Dropdown.Toggle variant="warning"><StopIcon size={14}/></Dropdown.Toggle>
                                  <Dropdown.Menu>
                                      <h6>{props.t("USED_DEPTS")}</h6>
                                      <ul className='com-list'>
                                          {nitem.department && nitem.department.length > 0?nitem.department.map((ditem,didx) => {
                                              return <li key={didx} title={ditem.departmentName}>{ditem.departmentName.substring(0,25)+(ditem.departmentName.length>25?"..":"")+
                                              (ditem.fieldNo?(" - "+ditem.fieldNo):"")}</li>;
                                          }):<></>}
                                      </ul>
                                  </Dropdown.Menu>
                              </Dropdown>
                          </span>:<></>}

                          <div className="viewicon-main"><PlusIcon size={14} /></div>
                          {nitem.applyStatus === "apply"?<span className="isadded-label"><CheckCircleFillIcon size={14} /></span>:<></>}
                          <div className="thumb-view" onClick={()=>props.handleProductImgPreview({id:nitem.itemId},true)} onMouseDown={(e) => {handledrawRectCanvas(nitem.productInfo,-1)}} onDragStart={(e) => handledragStart(e, nitem.productInfo)}><img src={nitem.itemImageUrl} draggable className="img-fluid" alt=""/></div>
                          <small><CopyToClipboard text={nitem.itemBarcode} onCopy={() => props.copytoclipboard()}><span>{nitem.itemBarcode}</span></CopyToClipboard></small>
                          {nitem.productBrand&&nitem.productBrand!==""&&nitem.productBrand!=="-"?(nitem.productBrand+" "):(props.t("notavailable")+" ")} {nitem.itemName}</div>
                          <span className="badge badge-warning" style={{fontSize:"10px", marginLeft:"35px"}}>{props.t("saleface_day")}: {nitem.salePerFacingDay?roundOffDecimal(nitem.salePerFacingDay,2):0}</span>
                      </ListGroup.Item>
                  })}
               </>
               :
               <ListGroup.Item className="prop-no-data-li">
                  {props.t("NO_ADDED_PRODUCTS_MSG")}
               </ListGroup.Item>
               
              }
              </ListGroup>
            </Tab>
            <Tab eventKey="remove" title={<DashIcon size={16} />}>
              <ListGroup>
                {
                  removeproplist.length>0 ?
                  <>
                    {removeproplist.map((nitem, nidx) => {
                        return <ListGroup.Item key={nidx} className="remove-item" style={{borderCorlor:"#dc3545"}}><div className="props_high" onClick={() => props.handleprophighlight(1,nitem.itemId)} style={(props.isRTL==="rtl"?{paddingRight:"35px"}:{paddingRight:"0px"})}>
                            <div className="viewicon-main"><DashIcon size={14} /></div>
                            {nitem.applyStatus === "apply"?<span className="isadded-label"><CheckCircleFillIcon size={14} /></span>:<></>}
                            <div className="thumb-view" onClick={()=>props.handleProductImgPreview({id:nitem.itemId},true)} onMouseDown={(e) => {props.handleEscapeClear()}} ><img src={nitem.itemImageUrl} draggable className="img-fluid" alt=""/></div>
                            <small><CopyToClipboard text={nitem.itemBarcode} onCopy={() => props.copytoclipboard()}><span>{nitem.itemBarcode}</span></CopyToClipboard></small>
                            {nitem.productBrand&&nitem.productBrand!==""&&nitem.productBrand!=="-"?(nitem.productBrand+" "):(props.t("notavailable")+" ")} {nitem.itemName}</div>
                            <span className="badge badge-warning" style={{fontSize:"10px", marginLeft:"35px"}}>{props.t("saleface_day")}: {nitem.salePerFacingDay?roundOffDecimal(nitem.salePerFacingDay,2):0}</span>
                        </ListGroup.Item>
                    })}
                  </>
                  :
                  <ListGroup.Item className="prop-no-data-li">
                      {props.t("NO_REMOVED_PRODUCTS_MSG")}
                  </ListGroup.Item>
                }
                  
              </ListGroup>
            </Tab>
          </Tabs>
        </Col>
</Col>);
}

export { ViewProposeList };
