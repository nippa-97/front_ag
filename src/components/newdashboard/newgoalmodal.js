import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Row, Col, Badge, FormSelect } from 'react-bootstrap';
import Select from 'react-select';
import { XIcon, ChevronDownIcon } from '@primer/octicons-react';

import { submitCollection } from '../../_services/submit.service';
import { alertService } from '../../_services/alert.service';
import { submitSets } from '../UiComponents/SubmitSets';
import { preventinputToString, preventinputotherthannumbers, restrictDecimalPoint } from '../../_services/common.service';

export default function NewGoalModal(props) {
    const [gsaveobj,setSaveObj] = useState({ filterId: -1, filterName: "", filterType: "None", condition: 0, value: 0, stores: [], departments: [], products: [], tags: [], filterStatus: "Pending", isDelete: false, isNew: true });
    const [isedit,setIsEdit] = useState(false);
    
    const defselval = -1;

    useEffect(() => {
        if(props.editFilterObj){ //gets edit filter object if available
            setSaveObj(props.editFilterObj);
            setIsEdit(true);
        }
    }, [props.editFilterObj]);

    const measurelist = {"SPF":props.t("SALE_PER_FACE"),"Sale":props.t("GENERAL_SALES")};
    const conditionsList = {"Equal":props.t("equal"),"NotEqual":props.t("notequal"),"GreaterThan":props.t("greaterthan"),"LessThan":props.t("lesserthan")};
    
    //onchange save object keys
    const handleChangeSaveobj = (ckey,cval,e) => {
        const csaveobj = JSON.parse(JSON.stringify(gsaveobj));
        csaveobj[ckey] = cval;
        if(ckey === "filterName"){
            if(!preventinputToString(e,e.target.value,(props.t('Character.filter_name')))){
                e.preventDefault()
                return
            }
        }
        if(ckey === "value"){
            if(restrictDecimalPoint(cval,3)){
                csaveobj[ckey] = gsaveobj[ckey];
            }
            if(!preventinputotherthannumbers(e,cval,props.t('Character.results_count'))){
                e.preventDefault()
                return
            }
        }
        setSaveObj(csaveobj);
    }
    //onchange save object list items
    const handleChangeListItem = (ctype,cval) => {
        const csaveobj = JSON.parse(JSON.stringify(gsaveobj));
        //console.log(props.mainProds);
        if(ctype === "store"){
            const nstoreobj = {filterStoreId: -1, storeId: props.mainStores[cval].id, storeName: props.mainStores[cval].name, isDelete: false };
            var isstoreadded = csaveobj.stores.findIndex(x => (!x.isDelete && x.storeId === nstoreobj.storeId));
            
            if(isstoreadded === -1){
                csaveobj.stores.push(nstoreobj);
                props.changeProdSearchFilters("storeId",props.mainStores[cval].id);
            } else{
                alertService.error(props.t("ALREADY_ADDED"));
            }
        } else if(ctype === "department"){
            const ndeptobj = {filterDepartmentId: -1, departmentId: props.mainDepartments[cval].id, departmentName: props.mainDepartments[cval].name, isDelete: false };
            const isdeptadded = csaveobj.departments.findIndex(x => (!x.isDelete && x.departmentId === ndeptobj.departmentId));

            if(isdeptadded === -1){
                csaveobj.departments.push(ndeptobj);
                props.changeProdSearchFilters("departmentId",props.mainDepartments[cval].id);
            } else{
                alertService.error(props.t("ALREADY_ADDED"));
            }
        } else if(ctype === "product"){
            const nprodobj = {filterProductId: -1, productId: props.mainProds[cval.value].id, productName: ((props.mainProds[cval.value].brandName&&props.mainProds[cval.value].brandName!==""?props.mainProds[cval.value].brandName+" ":"- ")+(props.mainProds[cval.value].productName.length>20?props.mainProds[cval.value].productName.substring(0,20)+"..":props.mainProds[cval.value].productName)), isDelete: false };
            const isprodadded = csaveobj.products.findIndex(x => (!x.isDelete && x.productId === nprodobj.productId));

            if(isprodadded === -1){
                csaveobj.products.push(nprodobj);
            } else{
                alertService.error(props.t("ALREADY_ADDED"));
            }
        } else if(ctype === "tag"){
            const ntagobj = {filterTagId: -1, tagId: props.mainStoreTags[cval].tagId, tagName: props.mainStoreTags[cval].tagName, isDelete: false };
            const istagadded = csaveobj.tags.findIndex(x => (!x.isDelete && x.tagId === ntagobj.tagId));

            if(istagadded === -1){
                csaveobj.tags.push(ntagobj);
            } else{
                alertService.error(props.t("ALREADY_ADDED"));
            }
        }
        setSaveObj(csaveobj);
    }
    //remove list item from saveobj
    const removeSaveListItem = (ctype,cidx) => {
        const csaveobj = JSON.parse(JSON.stringify(gsaveobj));
        //console.log(ctype,cidx);
        if(ctype === "store"){
            if(csaveobj.stores[cidx].filterStoreId > 0){
                csaveobj.stores[cidx]["isDelete"] = true;
            } else{
                csaveobj.stores.splice(cidx,1);
            }
        } else if(ctype === "department"){
            if(csaveobj.departments[cidx].filterDepartmentId > 0){
                csaveobj.departments[cidx]["isDelete"] = true;
            } else{
                csaveobj.departments.splice(cidx,1);
            }
        } else if(ctype === "product"){
            if(csaveobj.products[cidx].filterProductId > 0){
                csaveobj.products[cidx]["isDelete"] = true;
            } else{
                csaveobj.products.splice(cidx,1);
            }
        } else if(ctype === "tag"){
            if(csaveobj.tags[cidx].filterTagId > 0){
                csaveobj.tags[cidx]["isDelete"] = true;
            } else{
                csaveobj.tags.splice(cidx,1);
            }
        }
        setSaveObj(csaveobj);
    }
    //#DBD-H05
    const saveNewGoal = () => {
        //console.log(gsaveobj);
        const csaveobj = JSON.parse(JSON.stringify(gsaveobj));

        if(!csaveobj.filterName || csaveobj.filterName === ""){
            alertService.error(props.t("filter_namerequired"));
            return false;
        }

        if(!csaveobj.filterType || csaveobj.filterType === "None"){
            alertService.error(props.t("filter_measurerequired"));
            return false;
        }

        if(!csaveobj.condition || csaveobj.condition === ""){
            alertService.error(props.t("filter_conditionrequired"));
            return false;
        }
        
        if(csaveobj.value === null || csaveobj.value === ""){
            alertService.error(props.t("filter_valuerequired"));
            return false;
        }

        var saveurl = (isedit?submitCollection.dashboardFiltersEdit:submitCollection.dashboardFiltersSave);
        submitSets(saveurl, csaveobj, false).then(res => {
            //console.log(res);
            if(res && res.status){
                alertService.success(props.t("goalsuccesssaved"));
                props.resetGoalSearchFilters(isedit,csaveobj);
                props.handleToggleGoalModal();
            } else{
                alertService.error(props.t("erroroccurred"));
            }
        });
    }

    
    return (
        <Modal show={props.isShowGoalModal} animation={false} className={"goalmodal-view comview-modal "+(props.isRTL==="rtl"?"RTL":"")} dir={props.isRTL} onHide={props.handleToggleGoalModal} backdrop="static" keyboard={false} >
            <Modal.Header style={{padding:"10px 15px"}}>
                <Modal.Title style={{fontSize:"20px",fontWeight:"700"}}>{isedit?props.t("EDITNEWGOAL"):props.t("ADDNEWGOAL")}
                <span onClick={props.handleToggleGoalModal}><XIcon size={22}/></span></Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <small className="gmodal-label">{props.t("goalmeasurename")}</small>
                <Form.Control type="text" value={gsaveobj.filterName} onChange={e => handleChangeSaveobj("filterName",e.target.value,e)} placeholder={props.t("goalmeasurename")} />
                <Row>
                    <Col>
                        <small className="gmodal-label">{props.t("searchmeasure")}</small>
                        {/* <span className="chevdown-icon"><ChevronDownIcon size={16} /></span> */}
                        <FormSelect value={gsaveobj.filterType} onChange={e => handleChangeSaveobj("filterType",e.target.value)}>
                            <option value="None">{props.t("SELECT_MEASURE")}</option>
                            {Object.keys(measurelist).map((xitem,xidx) => {
                                return <option key={xidx} value={xitem}>{measurelist[xitem]}</option>;
                            })}
                        </FormSelect>
                    </Col>
                    <Col>
                        <small className="gmodal-label">{props.t("condition")}</small>
                        {/* <span className="chevdown-icon"><ChevronDownIcon size={16} /></span> */}
                        <FormSelect value={gsaveobj.condition} onChange={e => handleChangeSaveobj("condition",e.target.value)}>
                            <option value="">{props.t("SELECT_CONDTION")}</option>
                            {Object.keys(conditionsList).map((xitem,xidx) => {
                                return <option key={xidx} value={xitem}>{conditionsList[xitem]}</option>;
                            })}
                        </FormSelect>
                    </Col>
                    <Col>
                        <small className="gmodal-label">{props.t("NUMBER")}</small>
                        <Form.Control type="text" onKeyDown={(e)=> e.key === "."?e.preventDefault():preventinputotherthannumbers(e,gsaveobj.value,(props.t('Character.results_count')))}  value={gsaveobj.value} onChange={e => handleChangeSaveobj("value",e.target.value,e)} placeholder={props.t("NUMBER")} />
                    </Col>
                </Row>
                <Row>
                    <Col>
                        <small className="gmodal-label">{props.t("stores")}</small>
                        {/* <span className="chevdown-icon"><ChevronDownIcon size={16} /></span> */}
                        <FormSelect value={defselval} onChange={e => handleChangeListItem("store",e.target.value)}>
                            <option value="-1">{props.t("selastore")}</option>
                            {props.mainStores?props.mainStores.map((xitem,xidx) => {
                                return <option key={xidx} value={xidx}>{xitem.name}</option>;
                            }):<></>}
                        </FormSelect>
                    </Col>
                    <Col>
                        <small className="gmodal-label">{props.t("departments")}</small>
                        {/* <span className="chevdown-icon"><ChevronDownIcon size={16} /></span> */}
                        <FormSelect value={defselval} onChange={e => handleChangeListItem("department",e.target.value)}>
                            <option value="-1">{props.t("SELECT_DEPARTMENT")}</option>
                            {props.mainDepartments?props.mainDepartments.map((xitem,xidx) => {
                                return <option key={xidx} value={xidx}>{xitem.name}</option>;
                            }):<></>}
                        </FormSelect>
                    </Col>
                    <Col>
                        <small className="gmodal-label">{props.t("products")}</small>
                        <Select options={props.mainSelProds} placeholder={props.t("SELECT_PRODUCT")} value={defselval} onChange={e => handleChangeListItem("product",e)} className="filter-searchselect" classNamePrefix="searchselect-inner" components={{ IndicatorSeparator:() => null }}
                        noOptionsMessage={() => props.t("NO_RESULT_FOUND")}/>
                    </Col>
                </Row>
                <Row>
                    <Col xs={4} style={{padding:"0px"}}>
                        <Col>
                            <small className="gmodal-label">{props.t("storetags")}</small>
                            {/* <span className="chevdown-icon"><ChevronDownIcon size={16} /></span> */}
                            <FormSelect value={defselval} onChange={e => handleChangeListItem("tag",e.target.value)}>
                                <option value="-1">{props.t("SELECT_STORETAG")}</option>
                                {props.mainStoreTags?props.mainStoreTags.map((xitem,xidx) => {
                                    return <option key={xidx} value={xidx}>{xitem.tagName}</option>;
                                }):<></>}
                            </FormSelect>
                        </Col>
                    </Col>
                </Row>
                <Row>
                    {gsaveobj.stores.length > 0 || gsaveobj.departments.length > 0 || gsaveobj.products.length > 0 || gsaveobj.tags.length > 0?<>
                        <small className="gmodal-label tags">{props.t("addedtags")}</small>
                        <Col xs={12} className="addedfilter-list">
                            {gsaveobj.stores?gsaveobj.stores.map((xitem,xidx) => {
                                return <React.Fragment key={xidx}>{!xitem.isDelete?<Badge bg="primary">{xitem.storeName} <span onClick={() => removeSaveListItem("store",xidx)}><XIcon size={14}/></span></Badge>:<></>}</React.Fragment>;
                            }):<></>}

                            {gsaveobj.departments?gsaveobj.departments.map((xitem,xidx) => {
                                return <React.Fragment key={xidx}>{!xitem.isDelete?<Badge bg="primary" className="dept-badge">{xitem.departmentName} <span onClick={() => removeSaveListItem("department",xidx)}><XIcon size={14}/></span></Badge>:<></>}</React.Fragment>;
                            }):<></>}

                            {gsaveobj.products?gsaveobj.products.map((xitem,xidx) => {
                                return <React.Fragment key={xidx}>{!xitem.isDelete?<Badge bg="primary" className="prod-badge">{xitem.productName} <span onClick={() => removeSaveListItem("product",xidx)}><XIcon size={14}/></span></Badge>:<></>}</React.Fragment>;
                            }):<></>}

                            {gsaveobj.tags?gsaveobj.tags.map((xitem,xidx) => {
                                return <React.Fragment key={xidx}>{!xitem.isDelete?<Badge bg="primary" className="tag-badge">{xitem.tagName} <span onClick={() => removeSaveListItem("tag",xidx)}><XIcon size={14}/></span></Badge>:<></>}</React.Fragment>;
                            }):<></>}
                        </Col>
                    </>:<></>}
                </Row>
            </Modal.Body>
            <Modal.Footer style={{padding:"5px"}}>
                <Button variant="danger" size="sm" onClick={saveNewGoal} style={{borderRadius:"15px"}}>{isedit?props.t("UPDATEGOAL"):props.t("SAVEGOAL")}</Button>
            </Modal.Footer>
        </Modal>
    );
}