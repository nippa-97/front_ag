import React from "react";
import { Col, Modal } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import { XCircleFillIcon } from '@primer/octicons-react';

import DisplayUnitView from '../../masterdata/displayUnits/newDisplayUnit/DisplayUnitView';
/**
 * using to add new fields to planogram store 
 *
 * @export
 * @param {*} props
 * @return {*} 
 */
export default function NewFieldMdView(props) {
    const { t } = useTranslation();
    const isdunitstate = (props.dunitState && props.dunitState.dunitDetails?props.dunitState.dunitDetails.id:null);
    return <>
    <Modal show={props.showeditview} dir={props.isRTL} animation={false} onHide={() => props.togglefieldmd()} className={"pgfieldmd-modal "+(props.isRTL==="rtl"?"RTL":"")} backdrop="static" keyboard={false} >
        <Modal.Header>
            <Modal.Title>{isdunitstate&&isdunitstate>0?t("editdunitfield"):t("newfieldadd")}</Modal.Title>
            <span className={"closemodl-link "+(props.isRTL?"float-left":"float-right")} onClick={() => props.togglefieldmd()}><XCircleFillIcon size={22}/></span>
        </Modal.Header>
        <Modal.Body>
            <Col className="white-container additem-content" style={{padding:"0px"}}>
                <DisplayUnitView ismdview={false} selectedStore={props.selectedStore} dunitState={props.dunitState} minHeight={"350px"} getFieldsList={props.getFieldsList} togglefieldmd={props.togglefieldmd} isRTL={props.isRTL} dmode={props.dmode} t={t} />
            </Col>
        </Modal.Body>
    </Modal>
    </>;
}
