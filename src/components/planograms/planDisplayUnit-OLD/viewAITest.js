import React, {useState, useRef} from "react";
import { Modal, Tabs, Tab, ListGroup, Col, Button } from "react-bootstrap";
import { HorizontalRuleIcon, CircleIcon } from '@primer/octicons-react';
import { v4 as uuidv4 } from 'uuid';

import { alertService } from "../../../_services/alert.service";
import { roundOffDecimal } from '../../../_services/common.service';
import { AspectRatioDrawBox, measureConverter } from '../../../_services/common.service';
/**
 * using this modal to test ai generated field with products json to view - tesing purpose
 * options are paste a json, convert it to field obj or without converting preview field
 *
 * @export
 * @param {*} props
 * @return {*} 
 */
export default function ViewAITest(props) {
    //default values
    const [isviewmode, setViewMode] = useState(false);
    const [jsonviewtxt,setJsonViewTxt] = useState("");
    const [previewobj,setPreviewObj] = useState(null);
    const [drawmsglist, setDrawMsgList] = useState([]);

    var displaydiv = useRef(null); //previewing div of modal
    var saftymargin = 1;

    //convert json to preview
    const handlePreviewJSON = (evt) => {
        if(evt === "t2"){ //json preview toggle
            //setTimeout(() => {
                var cpreviewobj = null;
                try {
                    cpreviewobj = JSON.parse(jsonviewtxt);
                } catch (error) {
                    alertService.error(props.t('invalidjson'));
                }
                drawPreview(cpreviewobj);
            //}, 300);
        }
    }
    //draw preview
    const drawPreview = (previewobj) => {
        //console.log(isviewmode);
        if(previewobj){
            var csobj = previewobj;
            var cprodlist = props.prodlist;
            var cmsglist = []; //messages list shows why some product cannot draw in field

            var csaveobj = JSON.parse(JSON.stringify(props.saveobj));
            //init new object
            var mainuom = (csaveobj.masterFieldUom&&csaveobj.masterFieldUom!=="none"?csaveobj.masterFieldUom:csaveobj.fieldDto.uom);
            var divWidth = (displaydiv.current.offsetWidth - 50);
            var divHeight = displaydiv.current.offsetHeight;

            var dimention = AspectRatioDrawBox(csaveobj.masterFieldWidth,csaveobj.masterFieldHeight,divWidth,divHeight);

            var newobj = {
                masterFieldWidth: (csaveobj.masterFieldWidth>0?csaveobj.masterFieldWidth:csaveobj.fieldDto.width),
                masterFieldHeight: (csaveobj.masterFieldHeight>0?csaveobj.masterFieldHeight:csaveobj.fieldDto.height),
                masterFieldUom: mainuom,
                dheight: measureConverter(mainuom,mainuom,csaveobj.masterFieldHeight) * dimention,
                dwidth: measureConverter(mainuom,mainuom,csaveobj.masterFieldWidth) * dimention
            }
            
            if(!isviewmode){ //without converting show preview
                var cshelfs = [];
                if(csobj && Object.keys(csobj).length > 0 && csobj.planogramShelfDto){
                    cshelfs = (csaveobj.planogramShelfDto?csaveobj.planogramShelfDto:[]);
                    var prevy = 0; //var prevGap = 0;
                    for (let i = 0; i < cshelfs.length; i++) {
                        const shelf = cshelfs[i];
                        let drawHeight = shelf.height * dimention;
                        let drawGap = shelf.gap * dimention;
                        
                        shelf.drawWidth = newobj.dwidth;
                        shelf.drawHeight = drawHeight;
                        shelf.drawGap = drawGap;
                        shelf.x = 0;
                        shelf.y = prevy;
                        //prevGap = shelf.drawGap;
                        prevy = prevy + (drawHeight + drawGap);

                        //get all conveting products of current shelve
                        const cfoundidx = csobj.planogramShelfDto.find((jitem, jidx) => jidx === i); //csaveshelve.rank === (jitem.shelve - (jitem.shelve - (cidx + 1)))

                        shelf["planogramProduct"] = [];
                        var blockprodlist = []; //new products list

                        if(cfoundidx){
                            for (var j = 0; j < cfoundidx.planogramProduct.length; j++) {
                                const prodobj = cfoundidx.planogramProduct[j];
                                //const prodInfo = prodobj.productInfo;
                                var cviewitem2 = cprodlist.find(m => m.barcode === prodobj.productInfo.barcode);
                                if(cviewitem2){
                                    prodobj.productInfo = cviewitem2;

                                    for (var l = 0; l < prodobj.productBlock.length; l++) {
                                        const blockobj = prodobj.productBlock[l];
                                        blockobj.x = (blockobj.x * dimention);
                                        blockobj.y = (blockobj.y * dimention);

                                        blockobj.drawWidth = measureConverter(prodobj.productUom,mainuom,prodobj.productWidth) * dimention;
                                        blockobj.drawHeight = measureConverter(prodobj.productUom,mainuom,prodobj.productHeight) * dimention;
                                        blockobj.isDelete = false;

                                        for (var k = 0; k < blockobj.productLocations.length; k++) {
                                            const plocobj = blockobj.productLocations[k];
                                            plocobj.f_uuid = uuidv4();
                                            plocobj.x = (plocobj.x * dimention);
                                            plocobj.y = (plocobj.y * dimention);
                                            plocobj.isDelete = false;
                                            //check location x,y validation
                                            if(((plocobj.x + blockobj.drawWidth) > (shelf.drawWidth + saftymargin)) || (plocobj.x < (0 - saftymargin))){
                                                plocobj.isDelete = true;
                                                cmsglist.push({msg:(props.t('SHELVEM')+(cshelfs.length - i)+props.t('BARCODEM')+(cviewitem2.barcode)+props.t('BLOCKM')+(l)+props.t('LOCATIONM')+(k)+props.t('CANNOT_ADD_OVERFLOW_X'))});
                                            }
                                            if((plocobj.y < (shelf.y - saftymargin)) || ((plocobj.y + blockobj.drawHeight) > (shelf.y + shelf.drawHeight + saftymargin))){
                                                plocobj.isDelete = true;
                                                cmsglist.push({msg:(props.t('SHELVEM')+(cshelfs.length - i)+props.t('BARCODEM')+(cviewitem2.barcode)+props.t('BLOCKM')+(l)+props.t('LOCATIONM')+(k)+props.t('CANNOT_ADD_OVERFLOW_Y'))});
                                            }
                                        }
                                    }

                                    //validate it's overflow other products in shelve
                                    var cshelveobj = JSON.parse(JSON.stringify(shelf));
                                    var caddedprodlist = JSON.parse(JSON.stringify(blockprodlist));
                                    var caddingprod = JSON.parse(JSON.stringify(prodobj));
                                    caddedprodlist.push(caddingprod);
                                    cshelveobj["planogramProduct"] = caddedprodlist;

                                    for (var d = 0; d < prodobj.productBlock.length; d++) {
                                        const blcblock = prodobj.productBlock[d];
                                        for (var s = 0; s < blcblock.productLocations.length; s++) {
                                            const blcloc = blcblock.productLocations[s];
                                            blcloc.x = roundOffDecimal(blcloc.x,10);
                                            blcloc.y = roundOffDecimal(blcloc.y,10);
                                            var cdropproditem = {uom: prodobj.productUom, width: prodobj.productWidth, height: prodobj.productHeight};
                                            var checkallowadd = props.checkallowtoadd(null,cshelveobj,null,cdropproditem,blcloc.x,blcloc.y,dimention,true,blcloc);
                                            
                                            if(!checkallowadd){
                                                blcloc.isDelete = true;
                                                cmsglist.push({msg:(props.t('SHELVEM')+(cshelfs.length - i)+props.t('BARCODEM')+(cviewitem2.barcode)+props.t('BLOCKM')+(d)+props.t('LOCATIONM')+(s)+" cannot add. (overflow product)")});
                                            }
                                        }
                                    }

                                    blockprodlist.push(prodobj);
                                } else{
                                    cmsglist.push({msg:(props.t('SHELVEM')+(cshelfs.length - i)+props.t('BARCODEM')+(prodobj.productInfo.barcode)+props.t('NOT_FOUND'))});
                                }
                            }
                        }

                        shelf["planogramProduct"] = blockprodlist;
                        cshelfs[i] = shelf;
                    }
                    newobj["planogramShelfDto"] = cshelfs;
                    //console.log(csobj);
                    setPreviewObj(newobj);
                } else{
                    alertService.error(props.t('ENTER_VALID_JSON_O_TURN_ON_CONVERT_JSON_OPTION'));
                    setPreviewObj(null); setDrawMsgList([]);
                }
            } else{ //convert JSON to field object

                //add shelve list
                var cshelvelist = [];
                if(csaveobj.planogramShelfDto && csaveobj.planogramShelfDto.length){
                    var prevy2 = 0; //var prevGap2 = 0;
                    for (var i = 0; i < csaveobj.planogramShelfDto.length; i++) {
                        const csaveshelve = csaveobj.planogramShelfDto[i]; //const cidx = i;

                        let drawHeight2 = csaveshelve.height * dimention;
                        let drawGap2 = csaveshelve.gap * dimention;

                        csaveshelve.drawWidth = newobj.dwidth;
                        csaveshelve.drawHeight = drawHeight2;
                        csaveshelve.drawGap = drawGap2;
                        csaveshelve.x = 0;
                        csaveshelve.y = prevy2;
                        //prevGap2 = csaveshelve.drawGap;
                        prevy2 = prevy2 + (csaveshelve.drawHeight + csaveshelve.drawGap);
                        csaveshelve["planogramProduct"] = [];
                        //get all conveting products of current shelve
                        const cranknew = (csaveobj.planogramShelfDto.length - (csaveshelve.rank - 1));
                        const cfoundidx = (csobj&&csobj.products&&csobj.products.length>0?csobj.products.find((jitem, jidx) => jitem.shelve === cranknew):undefined); //csaveshelve.rank === (jitem.shelve - (jitem.shelve - (cidx + 1)))
                        
                        var blockprodlist2 = []; //new products list

                        if(cfoundidx){ //if shelve details found
                            if(cfoundidx.products && cfoundidx.products.length > 0){
                                var blockdrawx = 0; var blockdrawy = (csaveshelve.y + csaveshelve.drawHeight); //reset new col
                                var isnewprod = null;
                                for (var b = 0; b < cfoundidx.products.length; b++) {
                                    const cproditem = cfoundidx.products[b];

                                    for (var ckey of Object.keys(cproditem)) {
                                        var isnewcol = true;  var lastcolwidth = 0;
                                        //reset drawy to new col
                                        blockdrawy = (csaveshelve.y + csaveshelve.drawHeight);

                                        for (var t = 0; t < cproditem[ckey].length; t++) {
                                            const csubproditem = cproditem[ckey][t];
                                            //check barcode defined
                                            if(csubproditem.barcode !== null && csubproditem.barcode !== ""){
                                                var iscfound = blockprodlist2.findIndex(n => n.productInfo.barcode === csubproditem.barcode);

                                                if(iscfound > -1){ //add to existing block
                                                    var cmainprod = blockprodlist2[iscfound];

                                                    var lastblocidx = (isnewprod !== ckey?(cmainprod.productBlock.length - 1):-1);

                                                    if(lastblocidx > -1){
                                                        var cmainblock = cmainprod.productBlock[lastblocidx];
                                                        var cblockloc = cmainblock.productLocations;
                                                        var lastblockloc = cblockloc[(cblockloc.length - 1)]
                                                        //loop to qty count
                                                        if(csubproditem.qty && csubproditem.qty > 0){
                                                            for (var z = 0; z < csubproditem.qty; z++) {
                                                                blockdrawy = (isnewcol?(blockdrawy - cmainblock.drawHeight):(lastblockloc.y - cmainblock.drawHeight));

                                                                var citemisdelete = false;
                                                                if(((blockdrawx + cmainblock.drawWidth) > (csaveshelve.drawWidth + saftymargin)) || (blockdrawx < (0 - saftymargin))){
                                                                    citemisdelete = true;
                                                                    cmsglist.push({msg:(props.t('SHELVEM')+(csaveobj.planogramShelfDto.length - i)+props.t('COL')+(ckey)+props.t('BARCODEM')+(cmainprod.productInfo.barcode)+props.t('BLOCKM')+(lastblocidx)+props.t('LOCATIONM')+(z)+props.t('CANNOT_ADD_OVERFLOW_X'))});
                                                                }
                                                                if((blockdrawy < (csaveshelve.y - saftymargin)) || ((blockdrawy + cmainblock.drawHeight) > (csaveshelve.y + csaveshelve.drawHeight + saftymargin))){
                                                                    citemisdelete = true;
                                                                    cmsglist.push({msg:(props.t('SHELVEM')+(csaveobj.planogramShelfDto.length - i)+props.t('COL')+(ckey)+props.t('BARCODEM')+(cmainprod.productInfo.barcode)+props.t('BLOCKM')+(lastblocidx)+props.t('LOCATIONM')+(z)+props.t('CANNOT_ADD_OVERFLOW_Y'))});
                                                                }

                                                                var newexistblockloc = { id: -1, f_uuid: uuidv4(), isDelete: citemisdelete, x:blockdrawx, y:blockdrawy }
                                                                cblockloc.push(newexistblockloc);
                                                            }
                                                        }
                                                        //add last added product width
                                                        lastcolwidth = (cmainblock.drawWidth > lastcolwidth? cmainblock.drawWidth:lastcolwidth);
                                                    } else{
                                                        //new block item
                                                        var blockdrawWidth3 = measureConverter(cmainprod.productInfo.uom,newobj.masterFieldUom,cmainprod.productInfo.width) * dimention;
                                                        var blockdrawHeight3 = measureConverter(cmainprod.productInfo.uom,newobj.masterFieldUom,cmainprod.productInfo.height) * dimention;
                                                        //loop to qty count
                                                        var cloclist3 = [];
                                                        if(csubproditem.qty && csubproditem.qty > 0){
                                                            for (var p = 0; p < csubproditem.qty; p++) {
                                                                blockdrawy = blockdrawy - blockdrawHeight3;
                                                                //check location x,y validation
                                                                var citemisdelete3 = false;
                                                                if(((blockdrawx + blockdrawWidth3) > (csaveshelve.drawWidth + saftymargin)) || (blockdrawx < (0 - saftymargin))){
                                                                    citemisdelete3 = true;
                                                                    cmsglist.push({msg:(props.t('SHELVEM')+(csaveobj.planogramShelfDto.length - i)+props.t('COL')+(ckey)+props.t('BARCODEM')+(cmainprod.productInfo.barcode)+props.t('BLOCKM')+(cmainprod.productBlock.length)+props.t('LOCATIONM')+(p)+props.t('CANNOT_ADD_OVERFLOW_X'))});
                                                                }
                                                                if((blockdrawy < (csaveshelve.y - saftymargin)) || ((blockdrawy + blockdrawHeight3) > (csaveshelve.y + csaveshelve.drawHeight + saftymargin))){
                                                                    citemisdelete3 = true;
                                                                    cmsglist.push({msg:(props.t('SHELVEM')+(csaveobj.planogramShelfDto.length - i)+props.t('COL')+(ckey)+props.t('BARCODEM')+(cmainprod.productInfo.barcode)+props.t('BLOCKM')+(cmainprod.productBlock.length)+props.t('LOCATIONM')+(p)+props.t('CANNOT_ADD_OVERFLOW_Y'))});
                                                                }

                                                                cloclist3.push({
                                                                    id: -1, f_uuid: uuidv4(), isDelete: citemisdelete3,
                                                                    x:blockdrawx, y:blockdrawy
                                                                });
                                                            }
                                                            //add new prod item
                                                            cmainprod.productBlock.push({id: -1, f_uuid: uuidv4(), drawWidth: blockdrawWidth3, drawHeight: blockdrawHeight3, productLocations: cloclist3});
                                                        }
                                                        //add last added product width
                                                        lastcolwidth = (blockdrawWidth3 > lastcolwidth? blockdrawWidth3: lastcolwidth);
                                                    }

                                                } else{
                                                    var cviewitem = cprodlist.find(m => m.barcode === csubproditem.barcode); //get masterdata item details
                                                    if(cviewitem){
                                                        //convert width,height to main dimention
                                                        var blockdrawWidth = measureConverter(cviewitem.uom,newobj.masterFieldUom,cviewitem.width) * dimention;
                                                        var blockdrawHeight = measureConverter(cviewitem.uom,newobj.masterFieldUom,cviewitem.height) * dimention;
                                                        //loop to qty count
                                                        var cloclist = [];
                                                        if(csubproditem.qty && csubproditem.qty > 0){
                                                            for (var g = 0; g < csubproditem.qty; g++) {
                                                                blockdrawy = blockdrawy - blockdrawHeight;
                                                                //check location x,y validation
                                                                var citemisdelete2 = false;
                                                                if(((blockdrawx + blockdrawWidth) > (csaveshelve.drawWidth + saftymargin)) || (blockdrawx < (0 - saftymargin))){
                                                                    citemisdelete2 = true;
                                                                    cmsglist.push({msg:(props.t('SHELVEM')+(csaveobj.planogramShelfDto.length - i)+props.t('COL')+(ckey)+props.t('BARCODEM')+(cviewitem.barcode)+", block:0, location:"+(z)+props.t('CANNOT_ADD_OVERFLOW_X'))});
                                                                }
                                                                if((blockdrawy < (csaveshelve.y - saftymargin)) || ((blockdrawy + blockdrawHeight) > (csaveshelve.y + csaveshelve.drawHeight + saftymargin))){
                                                                    citemisdelete2 = true;
                                                                    cmsglist.push({msg:(props.t('SHELVEM')+(csaveobj.planogramShelfDto.length - i)+props.t('COL')+(ckey)+props.t('BARCODEM')+(cviewitem.barcode)+", block:0, location:"+(g)+props.t('CANNOT_ADD_OVERFLOW_Y'))});
                                                                }

                                                                cloclist.push({
                                                                    id: -1, f_uuid: uuidv4(), isDelete: citemisdelete2,
                                                                    x:blockdrawx, y:blockdrawy
                                                                });
                                                            }
                                                            //define new prod item
                                                            var newproditem = {
                                                                productWidth: cviewitem.width, productHeight: cviewitem.height, productUom: cviewitem.uom, isDelete: false, productInfo: cviewitem,
                                                                productBlock: [{id: -1, f_uuid: uuidv4(), drawWidth: blockdrawWidth, drawHeight: blockdrawHeight, productLocations: cloclist
                                                                }]
                                                            }
                                                            blockprodlist2.push(newproditem);
                                                        }
                                                        //add last added product width
                                                        lastcolwidth = (blockdrawWidth > lastcolwidth? blockdrawWidth: lastcolwidth);
                                                    } else{
                                                        cmsglist.push({msg:(props.t("SHELVEM")+(csaveobj.planogramShelfDto.length - i)+props.t("COL")+(ckey)+props.t("BARCODEM")+(csubproditem.barcode)+props.t("NOT_FOUND"))});
                                                    }
                                                }
                                            } else if(csubproditem.barcode === null){ //empty cols
                                                var emptydrawUom = (csubproditem.uom && csubproditem.uom !== "none"?(csubproditem.uom.toLowerCase()):"cm");
                                                var emptydrawWidth = measureConverter(emptydrawUom,newobj.masterFieldUom,(csubproditem.width?csubproditem.width:0)) * dimention;
                                                var emptydrawHeight = measureConverter(emptydrawUom,newobj.masterFieldUom,(csubproditem.height?csubproditem.height:0)) * dimention;

                                                //change common width and y details
                                                lastcolwidth = (emptydrawWidth>lastcolwidth?emptydrawWidth:lastcolwidth);
                                                blockdrawy = blockdrawy - emptydrawHeight;
                                            }
                                            isnewcol = false;
                                            if(isnewprod === null || isnewprod !== ckey){ isnewprod = ckey; }
                                        }

                                        blockdrawx = blockdrawx + lastcolwidth;
                                    }
                                }
                            }
                        }
                        csaveshelve["planogramProduct"] = blockprodlist2;
                        //console.log(csaveshelve);
                        cshelvelist.push(csaveshelve);
                    }
                }
                newobj["planogramShelfDto"] = cshelvelist;
                setPreviewObj(newobj);
            }
            setDrawMsgList(cmsglist);
        } else{
            setPreviewObj(null);
            setDrawMsgList([]);
        }
    }
    //validate and rettify json
    const prettifyJSON = (ctxt,ispaste) => {
        try {
            if(ispaste){
                //
            } else{
                setJsonViewTxt(ctxt);
            }
        } catch (e) {
            setJsonViewTxt(ctxt);
            alertService.error(props.t("invalidjson"));
        }
    }

    return (<Modal show={props.showview} onHide={() => props.handleview()} dialogClassName={"modal-aitestview "+(props.isRTL==="rtl"?"RTL":"")} dir={props.isRTL} backdrop="static">
      <Modal.Header>
          <Modal.Title>{props.t("aitest")}
            <div className="converjson-content" style={{padding:"8px 15px",fontSize:"13px",fontWeight:"600",position:"absolute",right:"90px",top:"20px"}}>{props.t("convertjson")}
                <input type="checkbox" id="mdlswitch" onChange={() => setViewMode(!isviewmode)} checked={isviewmode} style={{display:"none"}}/>
                <div className="switch-app" style={{marginLeft:"100px"}}>
                    <label className="switch" htmlFor="mdlswitch">
                    <div className="toggle"></div>
                    <div className="names">
                        <p className="light"><HorizontalRuleIcon size="14"/></p>
                        <p className="dark"><CircleIcon size="14"/></p>
                    </div>
                    </label>
                </div>
            </div>
          </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Tabs id="tabsaitest-view" defaultActiveKey="t1" onSelect={(e) => handlePreviewJSON(e)}>
            <Tab eventKey="t1" title={props.t("json")}>
                <textarea value={jsonviewtxt} onChange={e => prettifyJSON(e.target.value,false)} className="form-control jsontext-content"></textarea>
            </Tab>
            <Tab eventKey="t2" title={props.t("preview")}>
                <div id="fieldaitest-view" ref={displaydiv} style={{position:"relative",width:"650px",height:"450px",padding:"25px 55px",display:"block",margin:"auto"}}>
                    {previewobj?
                    <svg width={previewobj.dwidth} height={previewobj.dheight} style={{ outline: (props.dmode?'#2CC990':'#5128a0')+' solid 3px',display:"block",margin:"auto" }} >

                        {(previewobj&&previewobj.planogramShelfDto?previewobj.planogramShelfDto.map((shelf, i) => <g key={i}>
                            <rect className="sftrect" width={shelf.drawWidth} height={shelf.drawHeight} x={shelf.x} y={shelf.y} style={{ strokeWidth: 1, stroke: '#5128a0', fill: 'transparent', zIndex: -1 }} id={i} />
                            <rect width={shelf.drawWidth} height={shelf.drawGap} x={shelf.x} y={shelf.y+(shelf.drawHeight?shelf.drawHeight:0)} style={{ strokeWidth: 1, stroke: '#5128a0', fill: '#5128a0', zIndex: -1 }}></rect>
                            {(shelf.planogramProduct?shelf.planogramProduct.map((rect, x) => {
                                return <g key={x}>{rect.productBlock.map((subrect, z) => {
                                    return subrect.productLocations.map((locrect, n) => {
                                        //var filterlistcolor = false;
                                        return (!locrect.isDelete?<image pointerEvents="all" x={locrect.x} y={locrect.y} width={subrect.drawWidth} height={subrect.drawHeight} href={rect.productInfo.imageUrl} key={n} style={{outlineColor:"#ccc"}} />:<rect key={n}/>);
                                    });
                                })}</g>;
                            }) : (<></>))}
                        </g>) : (<></>))}
                    </svg>:<></>}
                </div>
                {drawmsglist && drawmsglist.length > 0?
                <Col style={{marginTop:"20px",marginBottom:"20px"}}>
                    <h4 style={{fontSize:"18px",fontWeight:"700"}}>{props.t('DRAW_ERRORS')}</h4>
                    <ListGroup>
                    {drawmsglist.map((xitem, xidx) => {
                        return <ListGroup.Item key={xidx}>{xitem.msg}</ListGroup.Item>;
                    })}
                </ListGroup></Col>:<></>}
            </Tab>
        </Tabs>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" size="sm" onClick={() => props.handleview()}>{props.t("btnnames.close")}</Button>
    </Modal.Footer>
  </Modal>);
}
