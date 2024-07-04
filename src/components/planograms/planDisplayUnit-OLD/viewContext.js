import { XIcon } from "@primer/octicons-react";
import React from "react";
import { useTranslation } from "react-i18next";
import { CopyToClipboard } from 'react-copy-to-clipboard'; //copy text to clipboard

/**
 * active product right click popup view
 *
 * @export
 * @param {*} { xpos - x position, ypos - y position, viewProd - selected product, handlclose - close function, isRTL }
 * @return {*} 
 */
export default function ViewMenu({ xpos, ypos, viewProd, handlclose, isRTL, copyToClipboard,handleProductImgPreview }) {//togglePreviewModal
    const { t } = useTranslation();

    return (<div className="pdunit-prodview-menu pdunit-active-context" style={{ top: ypos, left: (xpos-(isRTL==="rtl"?280:0)) }}>
        <span onClick={() => handlclose()} className="closelink" style={{ position: "absolute", right: "8px", top: "1px", cursor: "pointer" }}><XIcon size={16} /></span>
        <div className="context-details">
            <div className="img-content">
                <img src={viewProd ? viewProd.imageUrl : ""} onClick={() => handleProductImgPreview(viewProd,true) } className={(viewProd && viewProd.width >= viewProd.height)?"img-resize-ver":"img-resize-hor"} width="auto" height="100%" alt="product view"/>
            </div>
            <div style={(isRTL==="rtl"?{marginRight:70}:{marginLeft:70})}>
                <h4>
                    <small id="act_contextm_bcode">{viewProd ?<CopyToClipboard text={viewProd.barcode} onCopy={() => copyToClipboard()}><span className="copy-hover">{viewProd.barcode}</span></CopyToClipboard>: "-"}</small>
                    <br />
                    {viewProd ? ((viewProd.brandName&&viewProd.brandName!==""&&viewProd.brandName!=="-"?(viewProd.brandName+" "):(t("notavailable")+" "))+viewProd.productName) : "-"}
                </h4>
            </div>
        </div>
    </div>)
}