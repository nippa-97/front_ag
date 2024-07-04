import { CopyIcon, XIcon } from "@primer/octicons-react";
import { Button } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import { alertService } from "../../../../_services/alert.service";
/**
 * active product right click popup view
 *
 * @export
 * @param {*} { xpos - x position, ypos - y position, viewProd - selected product, handlclose - close function, isRTL }
 * @return {*} 
 */
export default function ActiveViewMenu({ xpos, ypos, viewProd, handlclose, isRTL }) {
    const { t } = useTranslation();
    function copytoClipboard(txt) {
        navigator.clipboard.writeText(txt)
        alertService.info(t("COPIED_TO_CLIP_BOARD"))
    }
    return (<div className="pdunit-prodview-menu" style={{ top: ypos, left: (xpos-(isRTL==="rtl"?280:0)) }}>
        <span onClick={() => handlclose()} className="closelink" style={{ position: "absolute", right: "8px", top: "1px", cursor: "pointer" }}><XIcon size={16} /></span>
        <div style={{display:'flex', flexDirection: 'row' }}>
            <div style={{width: 70, height:60,backgroundColor:'white',borderRadius:10,padding:5,justifyContent:'center',display:"inline-flex",textAlign:"center"}}>
                <img src={viewProd ? viewProd.imageUrl : ""} className="img-fluid img-resize-ver" width="auto" height="100%" alt="product view"/>
            </div>
            <div style={(isRTL==="rtl"?{marginRight:5}:{marginLeft:5})}>
                <h4>
                    <small id="act_contextm_bcode">{viewProd ? viewProd.barcode : "-"}</small><Button onClick={() => copytoClipboard(viewProd ? viewProd.barcode : "-")}><CopyIcon size={16} /></Button>
                    <br />
                    {viewProd ? ((viewProd.brandName&&viewProd.brandName!==""&&viewProd.brandName!=="-"?(viewProd.brandName+" "):(t("notavailable")+" "))+viewProd.productName) : "-"}<Button onClick={() => copytoClipboard(viewProd ? viewProd.productName : "-")}><CopyIcon size={16} /></Button>
                </h4>
            </div>
        </div>
    </div>)
}
