import React, { useState } from "react";
import { Button, Col, Dropdown, Form, ListGroup, Modal } from "react-bootstrap";
import FeatherIcon from 'feather-icons-react';
import { ChevronDownIcon, XIcon } from '@primer/octicons-react';
import { CopyToClipboard } from 'react-copy-to-clipboard'; //copy text to clipboard

import { submitSets } from "../../../UiComponents/SubmitSets";
import { submitCollection } from "../../../../_services/submit.service";

import { AUICheckboxIcons, InfoIcon, NewProductHalf, NewProductFull } from '../../../../assets/icons/icons';

// import { samplenotifications } from './sampledata';
import { convertDate } from "../../../../_services/common.service";
import { alertService } from "../../../../_services/alert.service";
import { v4 as uuidv4 } from 'uuid';
import { PopoverWrapper, TooltipWrapper } from "../../AddMethods";
import { MandatoryOption } from "../../../../enums/newProductsEnums";


export function TypeSelectDrop(props){
    let { gpidx, prodidx, proditem } = props;
    let [showDropdown, setShowDropDown] = useState(false);

    return <Dropdown className={'typelist-dropdown'+(props.isDisabledChange?" auinewproddisabled":"")} show={showDropdown} onToggle={() => setShowDropDown(!showDropdown)}>
        <Dropdown.Toggle variant='outline-secondary' size='sm'>
            {proditem.strategy?proditem.strategy.option ==="maxFace"?props.t("STRGY_TYPES.maxfaceprod"):proditem.strategy.option ==="minSales"?props.t("STRGY_TYPES.minsaleprod"):proditem.strategy.option ==="maxFaceWithMinSales"?props.t("STRGY_TYPES.maxfaceminsale"):proditem.strategy.option ==="linear"?props.t("STRGY_TYPES.linear"):proditem.strategy.option ==="attached"?props.t("STRGY_TYPES.attached"):proditem.strategy.option ==="block"?props.t("STRGY_TYPES.block"):props.t("STRGY_TYPES.replace"):props.t("STRGY_TYPES.replace")} <ChevronDownIcon size={18} />
            {proditem.strategy?proditem.strategy.level !== ""?<div className='typelist-level'>{proditem.strategy.level.substring(0,1)}</div>:<></>:<div className='typelist-level'>B</div>}
        </Dropdown.Toggle>
        <Dropdown.Menu>
            <ul>
                <li href="#" onClick={(e) => props.updateSingleProd(prodidx, gpidx, "option", "linear", e)} className={proditem.strategy && proditem.strategy.option === "linear"?'active':''}>
                    {props.t("STRGY_TYPES.linear")}  <span><PopoverWrapper subcontent="strategyInfo-sub" cusid="strategyInfo" trigger={['hover', 'focus']} placement="right" text={
                    <>
                    <div className="d-flex gap-2"> 
                        <span><InfoIcon size={20} color="white" /></span>   
                        <span class="strategy-title">{props.t("STRGY_TYPES.linear")}</span>  
                    </div>
                    <div className="d-flex gap-2">
                        <span> </span>
                        <span className="strategy-content">
                            {props.t("STRGY_TYPES_Content.linear")}
                        </span>
                    </div>
                    </>
                    } ><FeatherIcon icon="help-circle" size={16} /></PopoverWrapper></span>
                </li>
                <li href="#" onClick={(e) => props.updateSingleProd(prodidx, gpidx, "option", "replace", e)} className={(!proditem.strategy || (proditem.strategy && proditem.strategy.option === "replace"))?'active':''}>
                    {props.t("STRGY_TYPES.replace")} <span><PopoverWrapper subcontent="strategyInfo-sub" cusid="strategyInfo" trigger={['hover', 'focus']} placement="right" text={
                    <>
                    <div className="d-flex gap-2"> 
                        <span><InfoIcon size={20} color="white" /></span>   
                        <span class="strategy-title">{props.t("STRGY_TYPES.replace")}</span>  
                    </div>
                    <div className="d-flex gap-2">
                        <span> </span>
                        <span className="strategy-content">
                        {props.t("STRGY_TYPES_Content.replace")}
                        </span>
                    </div>
                    </>
                    } ><FeatherIcon icon="help-circle" size={16} /></PopoverWrapper></span>
                </li>
                <li href="#" onClick={(e) => props.updateSingleProd(prodidx, gpidx, "option", "maxFace", e)} className={proditem.strategy && proditem.strategy.option === "maxFace"?'active':''}>
                    {props.t("STRGY_TYPES.maxfaceprod")} <span><PopoverWrapper subcontent="strategyInfo-sub" cusid="strategyInfo" trigger={['hover', 'focus']} placement="right" text={
                    <>
                    <div className="d-flex gap-2"> 
                        <span><InfoIcon size={20} color="white" /></span>   
                        <span class="strategy-title"> {props.t("STRGY_TYPES.maxfaceprod")}</span>  
                    </div>
                    <div className="d-flex gap-2">
                        <span> </span>
                        <span className="strategy-content">
                        {props.t("STRGY_TYPES_Content.maxfaceprod")}
                        </span>
                    </div>
                    </>
                    } ><FeatherIcon icon="help-circle" size={16} /></PopoverWrapper></span>
                </li>
                <li href="#" onClick={(e) => props.updateSingleProd(prodidx, gpidx, "option", "minSales", e)} className={proditem.strategy && proditem.strategy.option === "minSales"?'active':''}>
                    {props.t("STRGY_TYPES.minsaleprod")} <span><PopoverWrapper subcontent="strategyInfo-sub" cusid="strategyInfo" trigger={['hover', 'focus']} placement="right" text={
                    <>
                    <div className="d-flex gap-2"> 
                        <span><InfoIcon size={20} color="white" /></span>   
                        <span class="strategy-title">{props.t("STRGY_TYPES.minsaleprod")}</span>  
                    </div>
                    <div className="d-flex gap-2">
                        <span> </span>
                        <span className="strategy-content">
                        {props.t("STRGY_TYPES_Content.minsaleprod")} 
                        </span>
                    </div>
                    </>
                    } ><FeatherIcon icon="help-circle" size={16} /></PopoverWrapper></span>
                </li>
                <li href="#" onClick={(e) => props.updateSingleProd(prodidx, gpidx, "option", "maxFaceWithMinSales", e)} className={proditem.strategy && proditem.strategy.option === "maxFaceWithMinSales"?'active':''}>
                    {props.t("STRGY_TYPES.maxfaceminsale")} <span><PopoverWrapper subcontent="strategyInfo-sub" cusid="strategyInfo" trigger={['hover', 'focus']} placement="right" text={
                    <>
                    <div className="d-flex gap-2"> 
                        <span><InfoIcon size={20} color="white" /></span>   
                        <span class="strategy-title">{props.t("STRGY_TYPES.maxfaceminsale")}</span>  
                    </div>
                    <div className="d-flex gap-2">
                        <span> </span>
                        <span className="strategy-content">
                        {props.t("STRGY_TYPES_Content.maxfaceminsale")} 
                        </span>
                    </div>
                    </>
                    } ><FeatherIcon icon="help-circle" size={16} /></PopoverWrapper></span>
                </li>
                {/* <li href="#" onClick={(e) => props.updateSingleProd(prodidx, gpidx, "option", "attached")} className={proditem.strategy && proditem.strategy.option === "attached"?'active':''}>
                    {props.t("STRGY_TYPES.attached")} <span><FeatherIcon icon="help-circle" size={16} /></span>
                </li> */}
                <li href="#" onClick={(e) => props.updateSingleProd(prodidx, gpidx, "option", "block", e)} className={proditem.strategy && proditem.strategy.option === "block"?'active':''}>
                    {props.t("STRGY_TYPES.block")}<span><PopoverWrapper subcontent="strategyInfo-sub" cusid="strategyInfo" trigger={['hover', 'focus']} placement="right" text={
                    <>
                    <div className="d-flex gap-2"> 
                        <span><InfoIcon size={20} color="white" /></span>   
                        <span class="strategy-title">{props.t("STRGY_TYPES.block")}</span>  
                    </div>
                    <div className="d-flex gap-2">
                        <span> </span>
                        <span className="strategy-content">
                        {props.t("STRGY_TYPES_Content.block")} 
                        </span>
                    </div>
                    </>
                    } ><FeatherIcon icon="help-circle" size={16} /></PopoverWrapper></span>
                </li>
                <Dropdown.Divider />

                <small>{props.t("LEVEL")}:</small>
                <li href="#" onClick={(e) => props.updateSingleProd(prodidx, gpidx, "level", "brand", e)} className='level-select'>
                    <Button variant='outline-secondary' active={!proditem.strategy || (proditem.strategy && proditem.strategy.level === "brand")} size='sm'>{props.t('NewProductStrategyLevel.Brand')}</Button>
                </li>
                <li href="#" disabled={(proditem.strategy.option==="block" || proditem.strategy.option==="linear")? true : false } onClick={(e) => props.updateSingleProd(prodidx, gpidx, "level", "category", e)} className='level-select'>
                    <Button variant='outline-secondary' className={(proditem.strategy.option==="block" || proditem.strategy.option==="linear")?"linearANDblock ":""} active={proditem.strategy && proditem.strategy.level === "category"} size='sm'>{props.t('category')}</Button>
                </li>
                <li href="#" disabled={(proditem.strategy.option==="block" || proditem.strategy.option==="linear")? true : false } onClick={(e) => props.updateSingleProd(prodidx, gpidx, "level", "subcategory", e)} className='level-select'>
                    <Button variant='outline-secondary' className={(proditem.strategy.option==="block" || proditem.strategy.option==="linear")?"linearANDblock ":""} active={proditem.strategy && proditem.strategy.level === "subcategory"} size='sm'>{props.t('subcategory')}</Button>
                </li>
                <li  href="#" disabled={(proditem.strategy.option==="block" || proditem.strategy.option==="linear")? true : false } onClick={(e) => props.updateSingleProd(prodidx, gpidx, "level", "department", e)} className={'level-select'}>
                    <Button className={(proditem.strategy.option==="block" || proditem.strategy.option==="linear")?"linearANDblock ":""} variant='outline-secondary' active={proditem.strategy && proditem.strategy.level === "department"} size='sm'>{props.t('departments')}</Button>
                </li>    
            </ul>

        </Dropdown.Menu>
    </Dropdown>;
}

export function VerSelectDrop(props){
    let [isShowDrop, toggleDropView] = useState(false);
    let { gpidx, prodidx, proditem, allVersionsList, isDisabledChange } = props;

    let totalusedlist = allVersionsList.filter(z => z.type === "used");
    let totalunusedlist = allVersionsList.filter(z => z.type === "unused");

    const toggleDropDown = (isshow, isopen) => {
        // console.log(isshow);

        if(isopen){
            if(isshow && proditem.selectionOption !== "selected"){
                props.updateSingleProd(prodidx, gpidx, "selectionOption", "none");
            } else{
                // props.updateSingleProd(prodidx, gpidx, "selectionOption", "none");
            }
            toggleDropView(isshow);
        } else{
            toggleDropView(isshow);
        }
    }

    const removeSelected = () => {
        props.updateSingleProd(prodidx, gpidx, "selectionOption", "none");
        toggleDropView(false);
    }

    return <Dropdown className='verlist-dropdown' show={isShowDrop} onToggle={(isshow) => toggleDropDown(isshow)}> {/* (isshow && proditem.selectionOption !== "selected"?props.updateSingleProd(prodidx, gpidx, "selectionOption", "selected"): */}
        <Dropdown.Toggle variant='outline-secondary' onClick={() => toggleDropDown(!isShowDrop, true)} disabled={isDisabledChange && proditem.selectionOption !== "selected"} active={proditem.selectionOption === "selected"} size='sm'>
            {props.t("APPLY_TYPES.SELECTED")} ({proditem.selectionOption === "selected" && proditem.vmpVerList.length > 0?proditem.vmpVerList.length:0})
        </Dropdown.Toggle>
        <Dropdown.Menu>
            {!isDisabledChange && proditem.selectionOption === "selected"?<Button variant="danger" size="sm" onClick={() => removeSelected()}>{props.t("REMOVE_SELECTED")}</Button>:<></>}

            <Col className="verlist-scrollcontent">
                <Col className={"ver-wrapper"+(isDisabledChange?" disable-check":"")}>
                    {totalusedlist && totalusedlist.length > 0?<>
                        <div className={"el-checkbox titletxt-check"} style={{marginTop: "2px"}}>
                            <input type="checkbox" name="check" onClick={() => props.mutipleVerSelect(true, prodidx, gpidx)} id={("tagtag_used_"+props.prodidx)} />

                            <label htmlFor={("tagtag_used_"+props.prodidx)}>
                                {!isDisabledChange?<>
                                    {proditem.isUsedChecked?<AUICheckboxIcons icon="rounded-check" size={16} color={"#4F4F4F"} />
                                    :<AUICheckboxIcons icon="rounded" size={16} color={"#4F4F4F"} />}
                                </>:<>
                                    {proditem.isUsedChecked?<FeatherIcon icon="check" size={18} />:<></>}
                                </>}

                                {props.t("APPLY_TYPES.USED")}: <div className='title-line'></div>
                            </label>
                        </div>
                        
                        <ListGroup className='verlist-grouplist'>
                            {allVersionsList.map((vitem, vidx) => {
                                let ischecked = (proditem.vmpVerList && proditem.vmpVerList.length > 0?proditem.vmpVerList.findIndex(fitem => fitem === vitem.mpId):-1);
                                let randomuuid=uuidv4();
                                return <React.Fragment key={vidx}>
                                    {vitem.type === "used"?<ListGroup.Item>
                                        <div className={"el-checkbox"} style={{marginTop: "2px"}}>
                                            <input type="checkbox" name="check" id={("tagtag_used_u_"+randomuuid)} onChange={() => props.updateSingleProd(prodidx, gpidx, "vmpVerList", vitem.mpId,undefined,undefined,proditem)} />

                                            <label htmlFor={("tagtag_used_u_"+randomuuid)}>
                                                {!isDisabledChange?<>
                                                    {ischecked > -1?<AUICheckboxIcons icon="rounded-check" size={16} color={"#4F4F4F"} />
                                                    :<AUICheckboxIcons icon="rounded" size={16} color={"#4F4F4F"} />}
                                                </>:<>
                                                    {ischecked > -1?<FeatherIcon icon="check" size={18} />:<></>}
                                                </>}

                                                <span>{vitem.version}</span>
                                                <small>{props.t("RESPONSE_STAT.updated")} {convertDate(vitem.updatedDate)} | {vitem.userName}</small>
                                            </label>
                                        </div>
                                    </ListGroup.Item>:<></>}
                                </React.Fragment>;
                            })}
                        </ListGroup>
                    </>:<></>}

                    {totalunusedlist && totalunusedlist.length > 0?<>
                        <div className={"el-checkbox titletxt-check orange"} style={{marginTop: "2px"}}>
                            <input type="checkbox" name="check" onClick={() => props.mutipleVerSelect(false, prodidx, gpidx)} id={("tagtag_unused_"+props.prodidx)} />

                            <label htmlFor={("tagtag_unused_"+props.prodidx)}>
                                {!isDisabledChange?<>
                                    {proditem.isUnusedChecked?<AUICheckboxIcons icon="rounded-check" size={16} color={"#4F4F4F"} />
                                    :<AUICheckboxIcons icon="rounded" size={16} color={"#4F4F4F"} />}
                                </>:<>
                                    {proditem.isUnusedChecked?<FeatherIcon icon="check" size={18} />:<></>}
                                </>}

                                {props.t("UNUSED")}: <div className='title-line'></div>
                            </label>
                        </div>

                        <ListGroup className='verlist-grouplist'>
                            {allVersionsList.map((vitem, vidx) => {
                                let ischecked = (proditem.vmpVerList && proditem.vmpVerList.length > 0?proditem.vmpVerList.findIndex(fitem => fitem === vitem.mpId):-1);
                                let randomuuid2=uuidv4();
                                return <React.Fragment key={vidx}>
                                    {vitem.type === "unused"?<ListGroup.Item>
                                        <div className={"el-checkbox"} style={{marginTop: "2px"}}>
                                            <input type="checkbox" name="check" id={("tagtag_used_un_"+randomuuid2)} onChange={() => props.updateSingleProd(prodidx, gpidx, "vmpVerList", vitem.mpId,undefined,undefined,proditem)} />

                                            <label htmlFor={("tagtag_used_un_"+randomuuid2)}>
                                                {!isDisabledChange?<>
                                                    {ischecked > -1?<AUICheckboxIcons icon="rounded-check" size={16} color={"#4F4F4F"} />
                                                    :<AUICheckboxIcons icon="rounded" size={16} color={"#4F4F4F"} />}
                                                </>:<>
                                                    {ischecked > -1?<FeatherIcon icon="check" size={18} />:<></>}
                                                </>}

                                                <span>{vitem.version}</span>
                                                <small>{props.t("RESPONSE_STAT.updated")} {convertDate(vitem.updatedDate)} | {vitem.userName}</small>
                                            </label>
                                        </div>
                                    </ListGroup.Item>:<></>}
                                </React.Fragment>;
                            })}
                        </ListGroup>
                    </>:<></>}     
                </Col>
                   
            </Col>
        </Dropdown.Menu>
    </Dropdown>
}

export function ProdSelectSearch(props){
    let prodUnqId = ("replacescroll_"+props.prodidx+"_"+props.gpidx);
    let [prodtab, setProdTab] = useState("selected");
    let [searchKeyword, setSearchKeyword] = useState("");
    let [isProdSearching, setProdSearching] = useState(false);

    let maxSearchResults = 12;
    let [searchResultsList, setSearchProdList] = useState([]);
    let [totalProdCount, setTotalProdCount] = useState(0);
    let [isReplaceOptionModal, setIsReplaceOptionModal] = useState(false);

    const handleFilterObject = (cvalue, ctype) => {
        if(ctype === "enter" || ctype === "click"){
            // console.log(props.proditem);
            
            let filteredArray1 = props.allVersionsList.filter(el => props.proditem.vmpVerList.includes(el.mpId));
            let totalusedlist = filteredArray1.filter(z => z.type === "used");
            let totalunusedlist = filteredArray1.filter(z => z.type === "unused");
            let totalusedlistnew = []
            let totalunusedlistnew=[]
            let cnewProductMetaId=[]
            if(props.proditem.type==="group"){
                if(props.proditem.products.length>0){
                    props.proditem.products.forEach(prod => {
                        cnewProductMetaId.push(prod.newProductMetaId)
                    });
                }
                
            }else{
                cnewProductMetaId.push(props.proditem.newProductMetaId)
            }
            totalusedlist.forEach(used => {
                totalusedlistnew.push(used.mpId)
            });
            totalunusedlist.forEach(used => {
                totalunusedlistnew.push(used.mpId)
            });

            let sobj = {
                departmentId: (props.searchObj?props.searchObj.departmentId:0),
                categoryId: (props.groupitem?props.groupitem.categoryId:0),
                subCategoryId: (props.groupitem?props.groupitem.subCategoryId:0),
                brandId: (props.groupitem?props.groupitem.brand.brandId:0),
                searchKeyword: searchKeyword,
                isReqPagination: true,
                maxResult: maxSearchResults,
                vmpList:{used:totalusedlistnew,unused:totalunusedlistnew},
                startIndex: (ctype === "enter"?0:searchResultsList.length),
                newProductMetaId:cnewProductMetaId,
                strategyLevel:props.proditem.strategy.level
            }

            setProdSearching(true);

            if(sobj.startIndex === 0){
                setSearchProdList([]); setTotalProdCount(0);
            }
            submitSets(submitCollection.loadReplaceProductList, sobj, true).then(res => {
                if(res && res.status){
                    // console.log(res);

                    if(res.extra && res.extra.length > 0){
                        let allsearchlist = (sobj.startIndex === 0?[]:searchResultsList);
                        let newprodlist = allsearchlist.concat(res.extra);
                        
                        setSearchProdList(newprodlist);
                        markSelectedItems(newprodlist);
    
                        if(sobj.startIndex === 0){
                            setTotalProdCount(res.count);
                        }
                    } else{
                        if(props.proditem.selectionOption === "none"){
                            alertService.error(props.t("VMP_VERSION_LIST_SELECTED"));
                        } else{
                            alertService.error(props.t("SELECTED_VER_NO_PRODUCTS"));
                        }
                    }
                }

                setProdSearching(false);
            });
        }
    }

    //check product already added 
    const markSelectedItems = (curSearchlist) => {
        let replaceprodlist = (props.replaceProductList && props.replaceProductList.length > 0?props.replaceProductList:[]);
        for (let i = 0; i < curSearchlist.length; i++) {
            const selitem = curSearchlist[i];
            
            let isalreadyadded = replaceprodlist.findIndex(x => x.productId === selitem.productId);
            selitem["isAdded"] = (isalreadyadded > -1); 
        }
        
        setSearchProdList(curSearchlist);
    }

    const changeProdTab = (changetab) => {
        setProdTab(changetab);

        if(changetab === "search"){
            markSelectedItems(searchResultsList);
        }
    }

    const replaceProdUpdate = (isNew, prodObj, prodIdx, replaceidx) => {
        if(isNew && props.replaceProductList && props.replaceProductList.length > 0){
            alertService.error(props.t("ALREADY_REPLACEPROD_ADDED"));
        } else{
            if(prodObj.isMandatory&&isNew){
                //popup
                props.setclickedcarddetails(isNew, prodObj, prodIdx, replaceidx)
                ReplaceOptionPopup()
            }else{
                addreplaceProducttoreplaceProdUpdate(isNew, prodObj, prodIdx, replaceidx)
            }
            
            setProdTab("selected");
            clearSearchList();
        }
    }

    const clearSearchList = () => {
        setSearchKeyword("");
        setSearchProdList([]);
        setTotalProdCount(0);
    }

    const addreplaceProducttoreplaceProdUpdate=(isNew, prodObj, prodIdx, replaceidx,type) => {
        props.replaceProdUpdate(isNew, prodObj, prodIdx, replaceidx,type);

        let curSearchlist = searchResultsList;
        let findCurSelected = curSearchlist.findIndex(x => x.productId === prodObj.productId);

        if(findCurSelected > -1){
            curSearchlist[findCurSelected]["isAdded"] = (isNew?true:false);
            // curSearchlist[findCurSelected]["mandatoryOption"] = type?type:"none"
            setSearchProdList(curSearchlist);
        }
    }
    const ReplaceOptionPopup = () => {
        handleReplaceOptionModal(true)

    }
    const handleReplaceOptionModal = (val) =>{
        setIsReplaceOptionModal(val)
    }
    const toggleDropDown = (isshow) => {
        if(isshow && searchResultsList.length > 0){
            handleFilterObject(null, "enter");
        }
    }

    const barcodeClick = (evt) => {
        evt.stopPropagation();
    }
    const HandleMandotoryOption =(type)=>{
        var selected=props.selectedcard
        // addreplaceProducttoreplaceProdUpdate(props.selectedcard.isNew, props.selectedcard.prodObj, props.selectedcard.prodIdx, props.selectedcard.replaceidx,type)
        addreplaceProducttoreplaceProdUpdate(selected.isNew, selected.prodObj, selected.prodIdx, selected.replaceidx,type)
        handleReplaceOptionModal(false)
    }
    return <Dropdown className='prodlist-dropdown' onToggle={(isshow) => toggleDropDown(isshow)}>
        <Dropdown.Toggle variant='outline-secondary' size='sm'>{props.proditem.strategy && props.proditem.strategy.replaceProductList && props.proditem.strategy.replaceProductList.length > 0?(props.proditem.strategy.replaceProductList.length+" "+props.t("SELECTED_PRODUCTS")):props.t("CHOOSE_FROM_LIST")} <ChevronDownIcon size={18} /></Dropdown.Toggle>
        <ReplaceOptionModal isShowContImpleModal={isReplaceOptionModal} isRtl={props.isRTL} t={props.t} handleReplaceOptionModal={handleReplaceOptionModal} HandleMandotoryOption={HandleMandotoryOption} />
        <Dropdown.Menu>
            <Col className='prodsearch-wrapper'>
                <Col className={"titlelist-wrapper"+(props.isDisabledChange?" d-none":"")}>
                    <ul className='list-inline ul'>
                        <li className={`list-inline-item prodcontent-title${prodtab === "selected"?" active":""}`} onClick={()=>{changeProdTab("selected")}}>
                            {props.t('APPLY_TYPES.SELECTED')} {props.replaceProductList && props.replaceProductList.length > 0?<div className="tabdot"></div>:<></>}
                        </li>
                        <li className={`list-inline-item prodcontent-title${prodtab === "search"?" active":""}`} onClick={()=>{changeProdTab("search")}}>{props.t('btnnames.search')}</li>
                    </ul>
                </Col>
                
                {prodtab === "selected"?<Col className="tab-container">
                    <h5>{(props.replaceProductList && props.replaceProductList.length > 0?props.replaceProductList.length:0)+" "+props.t("SELECTED_PRODUCTS")}</h5>
                    <Col className="prodlist-scroll">
                        {props.replaceProductList && props.replaceProductList.length > 0?<>
                            {props.replaceProductList.map((ritem, ridx) => { 
                                return <Col key={ridx} className="sub-item"><Col style={{ margin: 5}}>  
                                    <span className={"close-link"+(props.isDisabledChange?" d-none":"")} onClick={() => replaceProdUpdate(false, ritem, props.prodidx, ridx,"remove")}><FeatherIcon icon="x" size={18} /></span>                                     
                                    <div className="thumb-div" onClick={() => props.handleImagePreviewModal(ritem, true)}>
                                        <img src={ritem.imgUrl} className="img-resize-ver" alt=""/>
                                       
                                    </div>
                                    <div className="prod-indication">
                                        <CopyToClipboard text={ritem.barcode} onCopy={() => props.copyToClipboard()}><small  style={{fontSize:"0.73em"}}>{ritem.barcode}</small></CopyToClipboard>
                                       
                                      {ritem.indication === "half" && 
                                          <TooltipWrapper text={props.t("Half")}>
                                          <span><NewProductHalf  size={24} /></span> 
                                                 </TooltipWrapper> }
                                       {ritem.indication === "full" && 
                                       <TooltipWrapper text={props.t("Full")}>
                                         <span><NewProductFull size={24} /></span> 
                                        </TooltipWrapper>}
                                    </div>
                                    <span style={{display:"block",lineHeight:"15px"}}>{ritem.productName}</span>
                                    <span style={{fontSize:"11px",color:"#888"}}>{ritem.storeName}</span><br/>
                                    <span style={{fontSize:"11px",color:"#888"}}>{props.t("brand")}: {ritem.brandName?ritem.brandName:"N/A"}</span>
                                </Col></Col>;
                            })}
                        </>:<><h6 className="noresults-txt">{props.t("NO_SELECTED_PRODUCTS")}</h6></>}    
                    </Col>
                    
                </Col>:<Col className="tab-container">
                    <Col className='input-wrapper'>
                        <FeatherIcon icon="search" size={18} />
                        <Form.Control placeholder={props.t('searchproduct')} value={searchKeyword} disabled={isProdSearching} onChange={e => setSearchKeyword(e.target.value)} onKeyUp={e => (e.which ===13? handleFilterObject(e, "enter"):null)} />
                    </Col>
                    <h5>{totalProdCount+" "+props.t("SEARCHED_PRODUCTS")}</h5>

                    <Col ic={prodUnqId} className="prodlist-scroll">
                        {searchResultsList.map((pitem, pidx) => { 
                            return <Col key={pidx} className={"sub-item"+(pitem.isAdded?" added":"")} onClick={() => replaceProdUpdate(true, pitem, props.prodidx)}><Col style={{ margin: 5}}>                                          
                                <span className="badge badge-danger rplistbadge">
                                    {pitem.facingPercentage?pitem.facingPercentage+"%":"N/A"}
                                </span>
                                <div className="thumb-div" onClick={(e) => props.handleImagePreviewModal(pitem, true, e)}>
                                    <img src={pitem.imageUrl} className="img-resize-ver" alt=""/>
                                </div>
                                <CopyToClipboard text={pitem.barcode} onCopy={(e) => props.copyToClipboard(e)}><small onClick={(e) => barcodeClick(e)} style={{fontSize:"0.75rem"}}>{pitem.barcode}</small></CopyToClipboard><br/>{pitem.productName}
                                <br/>{props.t("brand")}: {pitem.brandName?pitem.brandName:"N/A"}
                            </Col></Col>;
                        })}

                        {searchResultsList.length > 0 && totalProdCount > searchResultsList.length?<>
                            <Button variant="danger" onClick={() => handleFilterObject(null, "click")}>{props.t("btnnames.loadmore")}</Button>
                        </>:<></>}    
                    </Col>
                </Col>}
            </Col>
        </Dropdown.Menu>
    </Dropdown>
}

export function ReplaceOptionModal(props){
    return <Modal className="contimplement-modal auiNewprodCancelModal mandotory" show={props.isShowContImpleModal} centered onHide={()=> props.handleReplaceOptionModal(false)} backdrop="static">
        <Modal.Body>
            <div className='closebtn' onClick={() => props.handleReplaceOptionModal(false)}><XIcon size={30} /></div>

            <h3 className='issue-header'>{props.t("MandatoryOptions")} 
            {/* <small>{this.state.cancelProds.map((citem, cidx) => {
                return <React.Fragment key={cidx}>{citem.productInfo.productName}</React.Fragment>
            })}</small> */}
            </h3>

            <h5>{props.t("this_mandotory_please_select_option_to_continue")}</h5>

            <Col xs={12} className='canceloption-list'>
                <ul>
                    <li>
                        <Button variant='outline-danger' onClick={() => props.HandleMandotoryOption(MandatoryOption.newmandatory)} size='sm'>{props.t("Mandotoryoption.newmandatory")}</Button>
                    </li>
                    <li>
                        <Button variant='outline-danger' onClick={() => props.HandleMandotoryOption(MandatoryOption.oldremovemandatory)} size='sm'>{props.t("Mandotoryoption.oldremovemandatory")}</Button>
                    </li>
                    <li>
                        <Button variant='outline-danger' onClick={() => props.HandleMandotoryOption(MandatoryOption.replaceoldmandatory)} size='sm'>{props.t("Mandotoryoption.replaceoldmandatory")}</Button>
                    </li>
                    <li>
                        <Button variant='outline-danger' onClick={()=> props.handleReplaceOptionModal(false)} size='sm'>{props.t("GO_BACK")}</Button>
                    </li>
                    
                </ul>
            </Col>
        </Modal.Body>
    </Modal>
}

export class NewProdStrategyApplyModal extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            strategyList: {A: "A", B: "B", C: "C", E:"E"},
        }
    }


    render() {
        let { strategyList } = this.state;
        let { 
            isShowStrategyModal, selectedSaveProds, 
            chainOptionToAll, continueNewProdApply, handleChangeStrategy, handleImagePreviewModal, toggleStrategyApplyModal, toggleStrategyHelpDrop, 
        } = this.props;

        return (<Modal className="contimplement-modal newprodstrategy-modal" show={isShowStrategyModal} centered onHide={()=> toggleStrategyApplyModal()}>
        <Modal.Body>
            <div className='closebtn' onClick={() => toggleStrategyApplyModal()}><XIcon size={30} /></div>

            <h3 className='issue-header text-center'>{this.props.t("UPDATE_STRATEGIES")} <small>{this.props.t("SELECT_STRATEGY_OF_SELECTEDITEM")}</small></h3>

            <Col xs={12} className='strategyselect-list'>
                <h5 className='smalltitle-content'>
                    {/* <span>{this.state.notAvailableStrategy+" "+this.props.t("ITEMS_PENDING")}</span> */}
                    <Form.Control as={"select"} value={"NONE"} onChange={e => chainOptionToAll(e.target.value)}>
                        <option value="NONE">{this.props.t("APPLY_TOALL")}</option>
                        {Object.keys(strategyList).map((stratitem, stratidx) => {
                            return <option key={stratidx} value={stratitem}>{strategyList[stratitem]} {this.props.t("STRATEGY")}</option>
                        })}
                    </Form.Control>
                    <span className='infodetails-link'>
                        <Dropdown show={this.state.isShowStrategyHelp} onMouseEnter={() => toggleStrategyHelpDrop(true)} onMouseLeave={() => toggleStrategyHelpDrop(false)}>
                            <Dropdown.Toggle variant="success"><FeatherIcon icon="help-circle" size={26} /></Dropdown.Toggle>
                            <Dropdown.Menu onMouseEnter={() => toggleStrategyHelpDrop(true)}>
                                <h4 className='text-center'>{this.props.t("STRATEGY_DESC")}</h4>
                                <ListGroup>
                                    <ListGroup.Item><div className='strat-icon'>A</div> <b>{this.props.t("STRATEGY")}</b>{this.props.t("CHAINOPTIONS.A")}</ListGroup.Item>
                                    <ListGroup.Item><div className='strat-icon'>B</div> <b>{this.props.t("STRATEGY")}</b>{this.props.t("CHAINOPTIONS.B")}</ListGroup.Item>
                                    <ListGroup.Item><div className='strat-icon'>C</div> <b>{this.props.t("STRATEGY")}</b>{this.props.t("CHAINOPTIONS.C")}</ListGroup.Item>
                                    <ListGroup.Item><div className='strat-icon'>D</div> <b>{this.props.t("STRATEGY")}</b>{this.props.t("CHAINOPTIONS.D")}</ListGroup.Item>
                                    <ListGroup.Item><div className='strat-icon'>E</div> <b>{this.props.t("STRATEGY")}</b>{this.props.t("CHAINOPTIONS.E")}</ListGroup.Item>
                                </ListGroup>
                            </Dropdown.Menu>
                        </Dropdown>
                    </span>
                </h5>

                <ListGroup className='checkselected-list'>
                    {isShowStrategyModal && selectedSaveProds && selectedSaveProds.length > 0?selectedSaveProds.map((proditem, prodidx) => {
                        return <React.Fragment key={prodidx}>
                            {!proditem.isDelete && proditem.isChecked?<>
                                {(proditem.type === "group" || proditem.type === "separateGroup")?<>
                                    <ListGroup.Item className='single-wrapper'><div className='single-groupitem'>
                                        <h4 className='group-title'>{this.props.t(proditem.type === "group"?"GROUP":"SEPERATE_GROUP")} <small>({(proditem.products && proditem.products.length > 0?proditem.products.length:0)+" "+this.props.t("products")})</small>
                                        {proditem.type === "group"?<Form.Control as={"select"} value={proditem.chainOption} onChange={e => handleChangeStrategy(true, prodidx, null, e.target.value)}>
                                            {Object.keys(strategyList).map((stratitem, stratidx) => {
                                                return <option key={stratidx} value={stratitem}>{strategyList[stratitem]} {this.props.t("STRATEGY")}</option>
                                            })}
                                        </Form.Control>:<></>}
                                        </h4>

                                        <ListGroup>
                                            {proditem.products.map((gprod, gpidx) => {
                                                return <React.Fragment key={gpidx}>
                                                    {!gprod.isDelete?<ListGroup.Item><div className='single-proditem'>
                                                        <div className="thumb-div" style={{padding:"2px"}} onClick={() => handleImagePreviewModal(gprod.productInfo,true)}>
                                                            <img src={gprod.productInfo.imgUrl} className="img-resize-ver" alt="" style={{width:"95%"}}/>
                                                        </div>
                                                        <h4><small>{gprod.productInfo.barcode}</small>{gprod.productInfo.productName}
                                                        {proditem.type === "separateGroup"?<Form.Control as={"select"} value={gprod.chainOption} onChange={e => handleChangeStrategy(false, prodidx, gpidx, e.target.value)}>
                                                            {Object.keys(strategyList).map((stratitem, stratidx) => {
                                                                return <option key={stratidx} value={stratitem}>{strategyList[stratitem]} {this.props.t("STRATEGY")}</option>
                                                            })}
                                                        </Form.Control>:<></>}
                                                        </h4>
                                                    </div></ListGroup.Item>:<></>}
                                                </React.Fragment>}
                                            )}
                                        </ListGroup>
                                    </div></ListGroup.Item>
                                </>:<>
                                {proditem.products.map((gprod, gpidx) => {
                                    return <React.Fragment key={gpidx}>
                                        {!gprod.isDelete?<ListGroup.Item><div className='single-proditem'>
                                            <div className="thumb-div" style={{padding:"2px"}} onClick={() => handleImagePreviewModal(gprod.productInfo,true)}>
                                                <img src={gprod.productInfo.imgUrl} className="img-resize-ver" alt="" style={{width:"95%"}}/>
                                            </div>
                                            <h4><small>{gprod.productInfo.barcode}</small>{gprod.productInfo.productName}
                                            <Form.Control as={"select"} value={gprod.chainOption} onChange={e => handleChangeStrategy(false, prodidx, gpidx, e.target.value)}>
                                                {Object.keys(strategyList).map((stratitem, stratidx) => {
                                                    return <option key={stratidx} value={stratitem}>{strategyList[stratitem]} {this.props.t("STRATEGY")}</option>
                                                })}
                                            </Form.Control></h4>
                                        </div></ListGroup.Item>:<></>}
                                    </React.Fragment>})}  
                                </>}
                            
                            </>:<></>}
                        </React.Fragment>;
                    }):<></>}
                </ListGroup>
            </Col>
            <Col xs={12} className='strategy-btns'>
                <ul className='list-inline'>
                    <li className='list-inline-item'>
                        <Button variant='success' onClick={() => continueNewProdApply()}>{this.props.t("continue_btn")}</Button>
                    </li>
                </ul>
            </Col>
        </Modal.Body>
    </Modal>);
    }
}