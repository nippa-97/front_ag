import React, { useState } from "react";
import { Modal } from "react-bootstrap";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import { XCircleIcon } from '@primer/octicons-react';
import { useTranslation } from "react-i18next";

/**
 * shows ai generated image if available
 * options can zoom in/out with mouse wheel
 *
 * @export
 * @param {*} props
 * @return {*} 
 */
export default function ViewBaseImage(props) {
    const { t } = useTranslation();
    const [isImageLoaded, setImageLoaded] = useState(false);
    const imageStyle = { display: "none" };

    return (<Modal show={props.showbaseimageview} animation={false} onHide={() => props.viewbaseimage(false)} className="baseview-modal">
        <span className="close-link" onClick={() => props.viewbaseimage(false)}><XCircleIcon size={28} /></span>
    <Modal.Body className="text-center">
        {props.baseaiimage?
        <>{!isImageLoaded?<h5 style={{color:"#fff",fontWeight:"700",marginTop:"30%"}}>{t('IMAGE_LOADING')} </h5>:<></>}<TransformWrapper>
            <TransformComponent>
                <img src={props.baseaiimage} style={!isImageLoaded?imageStyle:{}} className="img-fluid" onLoad={() => setImageLoaded(true)} alt="base ai"/>
            </TransformComponent>
        </TransformWrapper></>
        :<><h3>{t('IMAGE_CANNOT_LOAD')}</h3></>}
    </Modal.Body>
</Modal>);
}
