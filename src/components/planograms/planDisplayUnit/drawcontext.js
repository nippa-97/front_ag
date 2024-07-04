import React from "react";
import { Button,Col,Row } from "react-bootstrap";
import { PlusIcon, TrashIcon, XIcon } from '@primer/octicons-react';
import { useTranslation } from "react-i18next";
import { CopyToClipboard } from 'react-copy-to-clipboard'; //copy text to clipboard

/**
 * using this to show product popup in planogram svg when user right on a product click
 * in this popup it shows product barcode and name
 * also shows expand(multiply), delete(single location) or delete all(all block)
 *
 * @export
 * @param {*} props currentprod - selected product details
 * @return {*} 
 */
export default function DrawContextMenu(props) {
    var xPos = props.xpos; //x position
    var yPos = props.ypos; //y position
    var showMenu = props.isview; //isshows popup view
    const { t } = useTranslation();
    //handle click a button. type: 1-expand, 2-delete, 3-close, 4-delete all
    const handleClick = (type) => {
        if(type === 4){
            props.handledeleteall();
        } else if(type === 2){
            props.handledelete();
        } else if(type === 1){
            props.handlexpand();
        } else{
            props.handlclose();
        }
    }
    
    if (showMenu){
      let prodDetails = (props.currentprod&&props.currentprod.prod&&props.currentprod.prod.productInfo?props.currentprod.prod.productInfo:null);

      return (<div className="pdunit-prodcontext-menu" style={{ top: yPos, left: (xPos-(props.isRTL==="rtl"?280:0)), }}>
        <span className="viewmenu-span" id="contextm_close" onClick={() => handleClick(3)} style={{position:"absolute",right:"8px",top:"8px",cursor:"pointer"}}><XIcon size={16} /></span>
        
        <Row>
          <Col xs={2} >
            <div className="imgdiv" onClick={()=>(props.currentprod&&props.currentprod.prod?props.handleProductImgPreview(props.currentprod.prod.productInfo,true):null)}>
              <img src={(props.currentprod&&props.currentprod.prod?props.currentprod.prod.productInfo.imageUrl:"")} className={(prodDetails && prodDetails.width >= prodDetails.height)?"img-resize-ver":"img-resize-hor"} alt="prodimg"/>
            </div>
          </Col>
          <Col xs={10}>
            <h4><small id="contextm_bcode">{props.currentprod&&props.currentprod.prod?<CopyToClipboard text={props.currentprod.prod.productInfo.barcode} onCopy={() => props.copyToClipboard()}><span className="copy-hover">{props.currentprod.prod.productInfo.barcode}</span></CopyToClipboard>:"-"}</small><br/>
            {props.currentprod&&props.currentprod.prod?((props.currentprod.prod.productInfo.brandName&&props.currentprod.prod.productInfo.brandName!==""&&props.currentprod.prod.productInfo.brandName!=="-"?(props.currentprod.prod.productInfo.brandName+" "):(t("notavailable")+" "))
            +props.currentprod.prod.productInfo.productName):"-"}</h4>
          </Col>
        </Row>
        
        <hr style={{marginBottom:"5px",marginTop:"10px"}}/>
        <ul className="list-inline" style={{textAlign:(props.isRTL==="rtl"?"left":"right")}}>
          <li className={"list-inline-item "+(props.isRTL==="rtl"?"float-right":"float-left")} id="contextm_expand" onClick={() => handleClick(1)}><Button variant={(props.isexpand?"success":"secondary")} size="sm"><PlusIcon size={12}/></Button></li>
          <li className="list-inline-item" id="contextm_delete" onClick={() => handleClick(2)}><Button variant="danger" size="sm"><TrashIcon size={12}/></Button></li>
          <li className="list-inline-item" id="contextm_deleteall" style={(props.isRTL==="rtl"?{marginRight:"8px"}:{})} onClick={() => handleClick(4)}><Button variant="danger" size="sm"><TrashIcon size={12}/> {t("ALL")}</Button></li>
        </ul>
      </div>
      );
    }else { return null; }
}