import React, { useState, useEffect } from "react";
import { Modal, Col, Row, Button, ListGroup } from "react-bootstrap";
import { useTranslation } from "react-i18next";

import { rotateStatus } from '../../../_services/common.service';
/**
 * #PLG-DU-PD-H13
 * using this to change selected product rotation values
 * when adding a new product to some position their can be not enough space to drop that product.
 * if user rotates the product to can droppable side it can be added to that space. that what this modal using for.
 * when user changing rotation side in the bottom show what exactly values changing
 *
 * @export
 * @param {*} props
 * @return {*} 
 */
export default function ProductRotate(props) {
    //default states
    const [selectedProd, setSelProd] = useState(null);
    const [selectedSide, setSelSide] = useState(rotateStatus.FN);

    useEffect(() => {
        if(props.selectedrotateprod){ //gets current rotating product
            setSelProd(JSON.parse(JSON.stringify(props.selectedrotateprod)));
            setSelSide(props.selectedrotateprod.rotatetype?props.selectedrotateprod.rotatetype:props.selectedrotateprod.productRotation?props.selectedrotateprod.productRotation:rotateStatus.FN);
        }
    }, [props.selectedrotateprod]);

    const { t } = useTranslation();
    
    //#PLG-DU-PD-H14 onselecting a rotation side
    //when selecting new rotation this function first get product original width,height,depth and find what rotation is selected
    //and changes rotation values according to rotation type
    const handleRotate = (type) => {
        const cselprod = selectedProd;
        setSelSide(type); //set rotation side

        if(type === rotateStatus.FN){ //front or default
            cselprod["rotatewidth"] = null;
            cselprod["rotateheight"] = null;
            cselprod["rotatedepth"] = null;
            cselprod["rotatetype"] = rotateStatus.FN;
        } else if(type === rotateStatus.FNR){ //front rotate
            cselprod["rotatewidth"] = cselprod.height;
            cselprod["rotateheight"] = cselprod.width;
            cselprod["rotatedepth"] = cselprod.depth;
            cselprod["rotatetype"] = type;
        } else if(type === rotateStatus.SD){ //side
            cselprod["rotatewidth"] = cselprod.depth;
            cselprod["rotateheight"] = cselprod.height;
            cselprod["rotatedepth"] = cselprod.width;
            cselprod["rotatetype"] = type;
        } else if(type === rotateStatus.SDR){ //side rotate
            cselprod["rotatewidth"] = cselprod.height;
            cselprod["rotateheight"] = cselprod.depth;
            cselprod["rotatedepth"] = cselprod.width;
            cselprod["rotatetype"] = type;
        } else if(type === rotateStatus.TP){ //top
            cselprod["rotatewidth"] = cselprod.depth;
            cselprod["rotateheight"] = cselprod.width;
            cselprod["rotatedepth"] = cselprod.height;
            cselprod["rotatetype"] = type;
        } else if(type === rotateStatus.TPR){ //top rotate
            cselprod["rotatewidth"] = cselprod.width;
            cselprod["rotateheight"] = cselprod.depth;
            cselprod["rotatedepth"] = cselprod.height;
            cselprod["rotatetype"] = type;
        }

        setSelProd(cselprod); //set product with changed values
        //when click save btn this selectedProd product object send with parent updaterotateprod function to update product details
    }

    return (<Modal show={props.showrotateprod} dir={props.isRTL} animation={false} onHide={() => props.viewrotateprod(false)} className={"rotateprod-modal "+(props.isRTL==="rtl"?"RTL":"")}>
    <Modal.Header>
        <Modal.Title>{selectedProd?selectedProd.productName:""}</Modal.Title>
    </Modal.Header>
    <Modal.Body className="text-center">
        <h5 style={{marginTop:"0px"}}>{t("selectrotation")}</h5>
        <Col className={"rotatebtn-content "+(props.isshowrotateedit?"":"disableedit")}>
            <Row>
                <Col xs={4} className="singlebtn-content"><Button variant={selectedSide===rotateStatus.FN || selectedSide===rotateStatus.DFL?"outline-danger":"outline-secondary"} size="sm" id="rotateimg_front" onClick={() => handleRotate(rotateStatus.FN)}><div className="rotate-image front"></div><label>{t("front")}</label></Button></Col>
                <Col xs={4} className="singlebtn-content"><Button variant={selectedSide===rotateStatus.FNR?"outline-danger":"outline-secondary"} size="sm" id="rotateimg_frontr" onClick={() => handleRotate(rotateStatus.FNR)}><div className="rotate-image frontr"></div><label>{t("front_rotate")}</label></Button></Col>
                <Col xs={4} className="singlebtn-content"><Button variant={selectedSide===rotateStatus.SD?"outline-danger":"outline-secondary"} size="sm" id="rotateimg_side" onClick={() => handleRotate(rotateStatus.SD)}><div className="rotate-image side"></div><label>{t("side")}</label></Button></Col>
            </Row>
            <Row>
                <Col xs={4} className="singlebtn-content"><Button variant={selectedSide===rotateStatus.SDR?"outline-danger":"outline-secondary"} size="sm" id="rotateimg_sider" onClick={() => handleRotate(rotateStatus.SDR)}><div className="rotate-image sider"></div><label>{t("side_rotate")}</label></Button></Col>
                <Col xs={4} className="singlebtn-content"><Button variant={selectedSide===rotateStatus.TP?"outline-danger":"outline-secondary"} size="sm" id="rotateimg_top" onClick={() => handleRotate(rotateStatus.TP)}><div className="rotate-image top"></div><label>{t("top")}</label></Button></Col>
                <Col xs={4} className="singlebtn-content"><Button variant={selectedSide===rotateStatus.TPR?"outline-danger":"outline-secondary"} size="sm" id="rotateimg_topr" onClick={() => handleRotate(rotateStatus.TPR)}><div className="rotate-image topr"></div><label>{t("top_rotate")}</label></Button></Col>
            </Row>
        </Col>

        <h5>{t("currentdimentions")}</h5>
        <ListGroup horizontal>
            <ListGroup.Item><small>{t("width")}</small><br/><span id="rotatetxt_width">{selectedProd?(!props.isshowrotateedit?(selectedProd.productWidth+selectedProd.productUom):((selectedProd.rotatewidth?selectedProd.rotatewidth:selectedProd.width)+selectedProd.uom)):""}</span></ListGroup.Item>
            <ListGroup.Item><small>{t("height")}</small><br/><span id="rotatetxt_height">{selectedProd?(!props.isshowrotateedit?(selectedProd.productHeight+selectedProd.productUom):(selectedProd.rotateheight?selectedProd.rotateheight:selectedProd.height)+selectedProd.uom):""}</span></ListGroup.Item>
            <ListGroup.Item><small>{t("depth")}</small><br/><span id="rotatetxt_depth">{selectedProd?(!props.isshowrotateedit?(selectedProd.productDepth+selectedProd.productUom):(selectedProd.rotatedepth?selectedProd.rotatedepth:selectedProd.depth)+selectedProd.uom):""}</span></ListGroup.Item>
        </ListGroup>
    </Modal.Body>
    <Modal.Footer>
        {props.isshowrotateedit?<Button variant="danger" id="btnrotate_save" size="sm" onClick={() => props.updaterotateprod(selectedProd)} style={{borderRadius:"25px"}}>{t("btnnames.save")}</Button>:<></>}
        <Button variant="outline-secondary" size="sm" id="btnrotate_close" onClick={() => props.viewrotateprod()} style={{borderRadius:"25px"}}>{t("btnnames.close")}</Button>
    </Modal.Footer>
</Modal>);
}
