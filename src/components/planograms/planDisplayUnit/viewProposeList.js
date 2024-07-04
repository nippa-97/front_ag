import React from "react";
import { ListGroup, Col , Tab, Dropdown } from "react-bootstrap";
import { CheckCircleFillIcon, PlusIcon, DashIcon, StopIcon } from '@primer/octicons-react';
import { CopyToClipboard } from 'react-copy-to-clipboard';

import { alertService } from '../../../_services/alert.service';
import { roundOffDecimal } from '../../../_services/common.service';
import { TooltipWrapper } from '../../newMasterPlanogram/AddMethods';
// import { removeGhostImage } from "../../common_layouts/ghostDragWrapper";


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
        <Col className="submain-content">
          
          <Tab.Container activeKey={"add"} className="mb-6 prop-items-tabs">
            <Tab.Content>
              <Tab.Pane eventKey="add">
                <ListGroup>
                  {props.loadedproposelist && props.loadedproposelist.fieldList.length > 0?<>
                    {props.loadedproposelist.fieldList.map((proposefield, proposefieldidx) => {
                      //adding/removing list
                      let removeproplist = (proposefield && proposefield.removeItemArray?proposefield.removeItemArray:[]);
                      let addproplist = (proposefield && proposefield.addingItemArray?proposefield.addingItemArray:[]);
                      
                      return <React.Fragment key={proposefieldidx}>
                        <h5>{props.t("FIELD")+" "+(proposefieldidx + 1)}</h5>
                        {props.tabActiveKey === "add"?<>
                          {addproplist.length > 0?<>
                            {addproplist.map((nitem, nidx) => {
                                  return <ListGroup.Item key={nidx} className="add-item" style={{borderCorlor:"#77db61"}}>
                                    <div className="props_high" style={(props.isRTL==="rtl"?{paddingRight:"35px"}:{paddingRight:"0px"})}>
                                      
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
                                      <div className="thumb-view" 
                                        onClick={()=>props.handleProductImgPreview({id:nitem.itemId},true)} 
                                        onMouseDown={(e) => {handledrawRectCanvas(nitem.productInfo,-1)}} 
                                        onDragStart={(e) => handledragStart(e, nitem.productInfo)}
                                        onDrag={e => props.handleGhostOnDrag(e, nitem.productInfo)} 
                                        onDragEnd={() => props.prodDragEnd()}
                                      >
                                        <img src={nitem.itemImageUrl} draggable className="img-fluid" alt=""/>
                                      </div>
                                      <small><CopyToClipboard text={nitem.itemBarcode} onCopy={() => props.copytoclipboard()}><span>{nitem.itemBarcode}</span></CopyToClipboard></small>
                                      {nitem.productBrand&&nitem.productBrand!==""&&nitem.productBrand!=="-"?(nitem.productBrand+" "):(props.t("notavailable")+" ")} 
                                      
                                      <TooltipWrapper text={nitem.itemName}>
                                        <span>{nitem.productBrand&&nitem.productBrand!==""&&nitem.productBrand!=="-"?(nitem.productBrand+" "):(props.t("notavailable")+" ")} 
                                        {(nitem.itemName.substring(0,25)+(nitem.itemName.length > 25?"...":""))}</span>
                                      </TooltipWrapper>
          
                                      <span className="badge badge-warning salefc-txt" style={{fontSize:"10px", marginLeft:"35px"}}>{props.t("saleface_day")}: {nitem.salePerFacingDay?roundOffDecimal(nitem.salePerFacingDay,2):0}</span>
                                    </div>
                                  </ListGroup.Item>
                              })}
                          </>
                          :
                          <ListGroup.Item className="prop-no-data-li">{props.t("NO_ADDED_PRODUCTS_MSG")}</ListGroup.Item>
                          }
                        </>:<></>}

                        {props.tabActiveKey === "remove"?<>
                          {removeproplist.length > 0?
                            <>
                              {removeproplist.map((nitem, nidx) => {
                                  return <ListGroup.Item key={nidx} className="remove-item" style={{borderCorlor:"#dc3545"}}>
                                    <div className="props_high" style={(props.isRTL==="rtl"?{paddingRight:"35px"}:{paddingRight:"0px"})}>
                                      <div className="viewicon-main"><DashIcon size={14} /></div>
                                      {nitem.applyStatus === "apply"?<span className="isadded-label"><CheckCircleFillIcon size={14} /></span>:<></>}
                                      <div className="thumb-view" 
                                        onClick={()=>props.handleProductImgPreview({id:nitem.itemId},true)}
                                        onMouseEnter={() => props.toggleProposeHighlight(nitem, proposefieldidx)}
                                        onMouseLeave={() => props.toggleProposeHighlight(null)}
                                      >
                                        <img src={nitem.itemImageUrl} draggable className="img-fluid" alt=""/>
                                      </div>
                                      <small><CopyToClipboard text={nitem.itemBarcode} onCopy={() => props.copytoclipboard()}><span>{nitem.itemBarcode}</span></CopyToClipboard></small>
                                      
                                      <TooltipWrapper text={nitem.itemName}>
                                        <span>{nitem.productBrand&&nitem.productBrand!==""&&nitem.productBrand!=="-"?(nitem.productBrand+" "):(props.t("notavailable")+" ")} 
                                        {(nitem.itemName.substring(0,25)+(nitem.itemName.length > 25?"...":""))}</span>
                                      </TooltipWrapper>
                                    </div>

                                    <span className="badge badge-warning salefc-txt" style={{fontSize:"10px", marginLeft:"35px"}}>{props.t("saleface_day")}: {nitem.salePerFacingDay?roundOffDecimal(nitem.salePerFacingDay,2):0}</span>
                                  </ListGroup.Item>
                              })}
                            </>
                            :
                            <ListGroup.Item className="prop-no-data-li">{props.t("NO_REMOVED_PRODUCTS_MSG")}</ListGroup.Item>
                          }
                        </>:<></>}
                      </React.Fragment>
                    })}
                  </>:<></>}
                </ListGroup>
              </Tab.Pane>
            </Tab.Content>
          </Tab.Container>
        </Col>
</Col>);
}

export { ViewProposeList };