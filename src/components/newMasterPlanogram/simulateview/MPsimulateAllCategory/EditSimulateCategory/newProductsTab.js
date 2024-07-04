import { useEffect, useState } from "react";
import { Col, Form, InputGroup, Nav, Row, Tab } from "react-bootstrap";
import { SearchIcon, XIcon } from "@primer/octicons-react";
import FeatherIcon from 'feather-icons-react';
import { confirmAlert } from 'react-confirm-alert';

import { measureConverter } from "../../../../../_services/common.service";
import { alertService } from "../../../../../_services/alert.service";
import { submitSets } from "../../../../UiComponents/SubmitSets";
import { submitCollection } from "../../../../../_services/submit.service";
import { removeGhostImage } from "../../../../common_layouts/ghostDragWrapper";
import { TooltipWrapper } from "../../../AddMethods";
import { SimulationTypesFE } from "../../../../../enums/masterPlanogramEnums";

import loadinggif from '../../../../../assets/img/loading-sm.gif';
import imagePlaceholder from '../../../../../assets/img/icons/default_W100_100.jpg';

export default function NewProductsTab(props) {
    const [excelSearchText, setExcelSearchText] = useState("");
    useEffect(() => {
        setExcelSearchText(props.excelSearchText);
    }, [props.excelSearchText, setExcelSearchText]);

    const handleGhostOnDrag = (e, obj) => {
        let viewobj = structuredClone(obj);
        // console.log(viewobj);
        let drawzoomx = props.zoomDrawX;

        let prodwidth = measureConverter(viewobj.uom, props.displayUOM, viewobj.width) * props.displayRatio;
        let prodheight = measureConverter(viewobj.uom, props.displayUOM, viewobj.height) * props.displayRatio;

        viewobj["drawWidth"] = prodwidth * (drawzoomx > 0?(drawzoomx * 2):1);
        viewobj["drawHeight"] = prodheight * (drawzoomx > 0?(drawzoomx * 2):1);
        
        props.ghostFromParent(e, viewobj, true);
    }

    //delete imported prods
    const deleteImportedProds = (prodlist, deleteType) => {
        let avaiablebarcodes = [];
        for (let i = 0; i < prodlist.length; i++) {
            if(deleteType === "SELECTED"){
                if(prodlist[i].isSelected){
                    avaiablebarcodes.push(prodlist[i].barcode);
                }
            } else{
                avaiablebarcodes.push(prodlist[i].barcode);
            }
        }

        if(deleteType === "SELECTED" && avaiablebarcodes.length === 0){
            alertService.error(props.t("NO_SELECTED_PRODUCTS"));
            return false;
        }

        confirmAlert({
            title: props.t('DELETE_IMPORTPRODS'),
            message: props.t('SURETO_DELETE_IMPORTED'),
            overlayClassName: (props.isRTL==="rtl"?"alertrtl-content":""),
            buttons: [{
                label: props.t('btnnames.yes'),
                onClick: () => {
                    props.toggleLoadingModal(true, () => {
                        //(props.originatedMpId && props.originatedMpId > -1?props.originatedMpId:props.saveObj?props.saveObj.mp_id:-1)
                        
                        let mpId = (props.originatedMpId && props.originatedMpId > -1?props.originatedMpId:props.saveObj?props.saveObj.mp_id:-1);
                        if(props.isShowFromPreview && props.selectedSimPreviewObj){
                            mpId = props.selectedSimPreviewObj.mpId;
                        }
                        
                        let sendobj = {
                            mpId: mpId,
                            barcodes: avaiablebarcodes,
                            isAll: (deleteType === "ALL"?true:false),
                        };
                
                        submitSets(submitCollection.deleteSimImportedBarcodes, sendobj, true).then(res => {
                            // console.log(res);
                            if(res && res.status){
                                // let datalist = (res.extra && res.extra.length > 0?res.extra:[]);
                                // console.log(datalist);
                                if(deleteType === "SINGLE"){
                                    props.setImportedProds([], true, true, avaiablebarcodes);
                                } else{
                                    props.sendExcelData([], props.totalExcelProdCount);
                                }
                            }
                
                            props.toggleLoadingModal(false);
                        });
                    });
                }
            }, {
                label: props.t('btnnames.no')
            }]
        });
    }

    const toggleExcelProdSelect = (issingle, prodidx, isnone) => {
        // e.stopPropagation();
        let prodlist = props.excelUploadList;
        if(issingle){
            prodlist[prodidx].isSelected = !prodlist[prodidx].isSelected; 
        } else{
            for (let i = 0; i < prodlist.length; i++) {
                prodlist[i].isSelected = (!isnone?true:false);
            }
        }
        
        props.updateImportedList(prodlist);
    }

    const getWarnScrollPosition = (e) => {
        if(props.isImportDataLoading === false && props.excelStartIndex < props.totalExcelProdCount){
            var top = document.getElementById("allupload-scrollcontent"+props.additionalIDs).scrollTop;
            var sheight = document.getElementById("allupload-scrollcontent"+props.additionalIDs).scrollHeight;

            var position = (sheight - top);
            var clientHeight = e.target.clientHeight;
            position = Math.trunc((position - 1)); 
            if(position <= clientHeight){
                props.loadImportProdList();
            }

            props.updateImportScrollList(top);
        }
    }

    const handleDragEnd = () => {
        removeGhostImage();
        props.prodDragEnd();
    }

    const updateExcelSearchText = () => {
        setExcelSearchText("");
        props.updateExcelSearchText(null, true);
    }

    return <>
    <Nav variant="pills" className="flex-row">
        <Nav.Item>
            <Nav.Link eventKey={"newproducts"+props.additionalIDs} active={props.newProdTab === ("newproducts"+props.additionalIDs)} onClick={() => props.toggleNewProdTab("newproducts"+props.additionalIDs)}>{props.t("newproducts")}</Nav.Link>
        </Nav.Item>
        <Nav.Item>
            <Nav.Link eventKey={"imported"+props.additionalIDs} active={props.newProdTab === ("imported"+props.additionalIDs)} onClick={() => props.toggleNewProdTab("imported"+props.additionalIDs)}>{props.t("IMPORTED")}</Nav.Link>
        </Nav.Item>
    </Nav>
    
    <Tab.Content>
        <Tab.Pane eventKey={"newproducts"+props.additionalIDs} active={props.newProdTab === ("newproducts"+props.additionalIDs)}>
            <Row>
                {props.addedProductsCounter.length>0?props.addedProductsCounter.map((prod,i)=>
                    <Col className={'prodbox'+(prod.qty===0?" hide-newprod":"")} key={i} onClick={()=>props.handlePreviewModal(prod,true)}>
                        <img draggable={false} src={prod.imageUrl } alt=""/>
                        <span>{prod.qty}</span>
                    </Col>
                ):<></>}
                
            </Row>
        </Tab.Pane>
        <Tab.Pane eventKey={"imported"+props.additionalIDs} active={props.newProdTab === ("imported"+props.additionalIDs)}>
            <Col style={{ position: "relative" }}>
                <InputGroup size="sm" className={"imported-searchwrapper"+(props.excelUploadList && props.excelUploadList.length > 0?"":" not-available")}>
                    <span className='searchicon-content'><SearchIcon size={18}/></span>
                    
                    {props.isImportDataLoading?
                        <img src={loadinggif} alt="loading animation" style={{height:"15px"}}/>
                    :<></>}

                    {!props.isImportDataLoading && excelSearchText && excelSearchText.length > 0?
                        <span className='close-link' onClick={() => updateExcelSearchText(null, true)}><XIcon size={18}/></span>
                    :<></>}
                    
                    <Form.Control id="filterprodtxt" placeholder={props.t('srchproduct')} 
                        value={excelSearchText} onFocus={e => e.target.select()} 
                        onChange={e => setExcelSearchText(e.target.value)} 
                        onKeyDown={e => props.updateExcelSearchText(e, false, excelSearchText)} />
                </InputGroup>
                
                {props.simType !== SimulationTypesFE.IsleAllocation?<>
                    {props.excelUploadList && props.excelUploadList.length > 0?<>
                        <ul className="imported-deleteoptions list-inline text-right">
                            <li className="list-inline-item" onClick={() => deleteImportedProds(props.excelUploadList, "SELECTED")}><FeatherIcon icon="trash" size={14} /> {props.t("APPLY_TYPES.SELECTED")}</li>
                            <li className="list-inline-item" onClick={() => deleteImportedProds([], "ALL")}><FeatherIcon icon="trash" size={14} /> {props.t("ALL")}</li>
                        </ul>
                    </>:<></>}
                    
                    {props.excelUploadList && props.excelUploadList.length > 0?<>
                        <span className='allupload-option' onClick={() => toggleExcelProdSelect(false, null, false)}>{props.t("SELECT_ALL")}</span>
                        <span className='allupload-option' onClick={() => toggleExcelProdSelect(false, null, true)}>{props.t("SELECT_NONE")}</span>
                    </>:<></>}
                </>:<></>}

                {/* {props.importedDataObj && props.importedDataObj.isDataShow? */}
                <ul id={"allupload-scrollcontent"+props.additionalIDs} className="list-inline pgview-addeditems imported" onScroll={(e)=> getWarnScrollPosition(e)}>
                    {props.excelUploadList && props.excelUploadList.length > 0?<>
                        {props.excelUploadList.map((npitem, npidx) => {
                            return <li key={npidx} className={"list-inline-item"+(npitem.isAdded?" added":"")} style={{marginRight:"2px",marginBottom:"4px"}}>
                                
                                {props.simType !== SimulationTypesFE.IsleAllocation?<>
                                    <span className='close-link' onClick={() => deleteImportedProds([npitem],"SINGLE")}><FeatherIcon icon="x" size={12} /></span>
                                    <input type='checkbox' className='select-check' checked={npitem.isSelected} onChange={e => toggleExcelProdSelect(true, npidx)} />
                                </>:<></>}
                                
                                <TooltipWrapper text={<>
                                    <small style={{fontSize:"0.75rem"}}>{npitem.barcode}</small><br/>{npitem.productName}<br/>
                                    <small>{props.t("brand")}: {(npitem.brandName && npitem.brandName !== "" && npitem.brandName!=="-"?(npitem.brandName+" "):(props.t("notavailable")+" "))}</small>
                                </>}>
                                    <div className="existnew-subview" onClick={(e)=> props.handlePreviewModal(npitem,true)}>
                                        <img src={(npitem.imageUrl?npitem.imageUrl:imagePlaceholder)} className="img-resize-ver" style={{height:"25px"}} alt="imported product" 
                                            onMouseDown={(e) => props.drawRectCanvas(npitem,-1)} 
                                            onDragStart={(e) => props.dragStart(e, npitem)}
                                            onDrag={e => handleGhostOnDrag(e, npitem)} 
                                            onDragEnd={() => handleDragEnd()}
                                            />
                                    </div>
                                </TooltipWrapper>
                            </li>;
                        })}
                    </>:<>
                        {props.isImportDataLoading?
                        <Col className="text-center" style={{paddingTop:"95px"}}><img src={loadinggif} alt="loading animation" style={{height:"20px"}}/></Col>
                        :<li className='list-inline-item text-center nocontent-txt'>{props.t("NO_CONTENT_FOUND")}</li>}
                    </>}

                    {props.isImportDataLoading && props.excelStartIndex > 0?
                        <Col className="text-center" style={{paddingTop:"10px", paddingBottom:"10px"}}><img src={loadinggif} alt="loading animation" style={{height:"20px"}}/></Col>
                    :<></>}
                </ul>
                {/* :<></>} */}    
            </Col>
        </Tab.Pane>
    </Tab.Content>
</>}