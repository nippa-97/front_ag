import React, { useState, useEffect } from "react";
import { Badge, Button, Col, Form, Row } from "react-bootstrap";
import { v4 as uuidv4 } from 'uuid';
import { XCircleFillIcon, PencilIcon } from '@primer/octicons-react';
import { useTranslation } from "react-i18next";
import { confirmAlert } from 'react-confirm-alert';

import { alertService } from '../../../_services/alert.service';
/**
 * using this to edit field height or adjust shelve heights
 * it validates when closing this sidebar miss matching shelve heights to field height - needs to be exact
 *
 * @export
 * @param {*} props
 * @return {*} 
 */
export default function FieldDetailsEdit(props) {
    const { t } = useTranslation();

    const [cfieldobj, setFieldObj] = useState(null);

    useEffect(() => {
      if(props.saveObj){ //gets current field details
        setFieldObj(JSON.parse(JSON.stringify(props.saveObj)));
      }
    }, [props.saveObj]);
    
    //#PLG-DU-FE-H04 onchange height value validate and set to state
    const handlemaindim = (evt, type) => {
      const re = /^[0-9]*\.?[0-9]*$/;
      if (evt.target.value === '' || re.test(evt.target.value)) { //check its empty or a number
        var csobj = JSON.parse(JSON.stringify(cfieldobj));
        var ctxt = (evt.target.value);
        csobj[type] = ctxt;
        setFieldObj(csobj);
        //updates main object
        props.handlefieldedit(csobj); 
      }
    }
    //reset currently done changes - undo to first open state
    const resetEditData = () => {
      confirmAlert({
          title: t("RESET_EDIT_FIELD_DETAILS"),
          message: t("DO_YOU_WANTS_TO_RESET_ADDED_CHANGES"),
          buttons: [{
              label: t("btnnames.yes"),
              onClick: () => {
                let bkpobj = JSON.parse(JSON.stringify(props.bkpSaveObj));
                setFieldObj(bkpobj);
                props.handlefieldedit(bkpobj);
              }
          }, {
              label: t("btnnames.no")
          }]
      });
    }
    //#PLG-DU-FE-H04 onchange shelve values. evt-current changing element, idx- index of shelve, type- width,height or gap
    const handleShelfChange = (evt, idx, type) => {
      const re = /^[0-9]*\.?[0-9]*$/;
      if (evt.target.value === '' || re.test(evt.target.value)) {
        var csobj = JSON.parse(JSON.stringify(cfieldobj));
        var ctxt = (evt.target.value);
        csobj.planogramShelfDto[idx][type] = ctxt;
        setFieldObj(csobj);
        props.handlefieldedit(csobj);
      }
    }
    //remove a shelve. checks it already saved shelve(contains id)
    const handleRemoveshelf = (idx) => {
      var csobj = JSON.parse(JSON.stringify(cfieldobj));
      if(csobj && Object.keys(csobj).length > 0){
          var shelves = []; var viewshelvelist = [];
          for (var i = 0; i < csobj.planogramShelfDto.length; i++) {
            const shelveobj = csobj.planogramShelfDto[i];
            shelveobj.f_uuid = uuidv4();
            if(i === idx){
              if(shelveobj.id > 0){
                shelveobj.isDelete = true;
                shelves.push(shelveobj);
              }
            } else{
              shelves.push(shelveobj);

              if(!shelveobj.isDelete){
                viewshelvelist.push(shelveobj);
              }
            }
          }
          //reset row rank number and reverserownumber
          for (var j = 0; j < shelves.length; j++) {
            const viewshelve = shelves[j];
            viewshelve.rank = (viewshelvelist.length>0?(viewshelvelist.findIndex(l => l.f_uuid === viewshelve.f_uuid)+1):0);
            viewshelve.reverseRowNumber =  (viewshelvelist.length - (viewshelvelist.length>0?viewshelvelist.findIndex(l => l.f_uuid === viewshelve.f_uuid):0));
          }

          csobj["planogramShelfDto"] = shelves;
          setFieldObj(csobj);
          props.handlefieldedit(csobj);
      }
    }
    //add new shelve to field
    const handleAddshelf = () => {
      var nextid = 1;
      var csobj = JSON.parse(JSON.stringify(cfieldobj));
      var cshelfs = [];

      if (csobj.planogramShelfDto) {
        var count = csobj.planogramShelfDto.length + 1;
        nextid = count;
      }

      cshelfs = (csobj.planogramShelfDto ? csobj.planogramShelfDto : []);
      var scobj = { id: uuidv4(), f_uuid: uuidv4(), width: csobj.masterFieldWidth, height: 0, gap: 0, uom: (csobj.masterFieldUom && csobj.masterFieldUom !== "none" ? csobj.masterFieldUom : csobj.fieldDto.uom), rank: nextid, x: 0, y: 0, reverseRowNumber: nextid, planogramProduct: [], isNew: true, isDelete: false }
      cshelfs.push(scobj);

      var viewshelvelist = [];
      for (var i = 0; i < cshelfs.length; i++) {
        const shelveobj = cshelfs[i];
        shelveobj.f_uuid = uuidv4();
        if (!shelveobj.isDelete) {
          viewshelvelist.push(shelveobj);
        }
      }
      //reset row rank number and reverserownumber
      for (var j = 0; j < cshelfs.length; j++) {
        const viewshelve = cshelfs[j];
        viewshelve.rank = (viewshelvelist.length > 0 ? (viewshelvelist.findIndex(l => l.f_uuid === viewshelve.f_uuid) + 1) : 0);
        viewshelve.reverseRowNumber = (viewshelvelist.length - (viewshelvelist.length > 0 ? viewshelvelist.findIndex(l => l.f_uuid === viewshelve.f_uuid) : 0));
      }
      
      csobj["planogramShelfDto"] = cshelfs;
      setFieldObj(csobj);
      props.handlefieldedit(csobj);
    }
    //#PLG-DU-FE-H03 toggle edit sidebar
    const checkToggleView = () => {
      if (props.isshowedit && !validateShelveHeights()) { //if true check height values before close
        return false;
      }
      props.toggleeditview(!props.isshowedit);
    }
    //#PLG-DU-FE-H06 check height values match height
    const validateShelveHeights = () => {
      var csobj = JSON.parse(JSON.stringify(cfieldobj));
      
      if(csobj && Object.keys(csobj).length > 0){
        //field details check
        if (parseFloat(csobj.masterFieldWidth) <= 0 || parseFloat(csobj.masterFieldHeight) <= 0) {
          alertService.error(t("WIDTH_HEIGHT_OF_FIELD_CANNOT_LOWER_ZERO"));
          return false;
        }
        //shelve heights check
        var mheight = parseFloat(csobj.masterFieldHeight);
        var totShelfWidth = 0; var isEmptyRows = false;
        var totShelefHeight = 0;

        for (var p = 0; p < csobj.planogramShelfDto.length; p++) {
          if (csobj.planogramShelfDto[p].isDelete === false) {
            if (csobj.planogramShelfDto[p].height <= 0 || csobj.planogramShelfDto[p].gap <= 0) {
              isEmptyRows = true;
            }
            totShelfWidth = totShelfWidth + parseFloat(csobj.planogramShelfDto[p].width);
            totShelefHeight = totShelefHeight + (parseFloat(csobj.planogramShelfDto[p].height) + parseFloat(csobj.planogramShelfDto[p].gap));
          }
        }
        totShelefHeight = parseFloat(totShelefHeight.toFixed(4));

        if (isEmptyRows) {
          alertService.error(t("HEIGHT_GAP_NOT_ADDED_ROWS_FOUND_ADD_H_G_REMOVE_UNWANTED_ROWS"));
          return false;
        } else if (mheight !== totShelefHeight) {
          alertService.error(t("HEIGHT_GAPS_OF_SHELVES_DOESNT_MATCH_DUINT_HEIGHT"));
          return false;
        } 

      } else{
        return false;
      }
      
      return true;
    }

    return (props.isenablefieldedit?<>
      <Col xs={12} md={4} className="fieldedit-sidebar" style={(props.isRTL==="rtl"?{left:(props.isshowedit?"0px":"-440px")}:{right:(props.isshowedit?"0px":"-440px")})}>
        <div onClick={() => checkToggleView()} className="edit-toggle"><PencilIcon size={14}/></div>
        <h5>{t("editfdetails")}
          <ul className={"list-inline "+(props.isRTL==="rtl"?"float-left":"float-right")} style={{marginTop:"-3px"}}>
            <li className="list-inline-item"><Button variant="warning" id="resetedit-fdetails" size="sm" onClick={() => resetEditData()} style={(props.isRTL==="rtl"?{marginLeft:"5px"}:{})}>{t("btnnames.reset")}</Button></li>
            <li className="list-inline-item"><Button variant="secondary" size="sm" onClick={() => checkToggleView()}>{t("btnnames.close")}</Button></li>
          </ul>
        </h5>
        <Row>
          <Col xs={12} lg={6}>
              <Form.Group>
                  <Form.Label >{t("height")} <small>({cfieldobj?(cfieldobj.masterFieldUom&&cfieldobj.masterFieldUom!=="none"?cfieldobj.masterFieldUom:cfieldobj.fieldDto.uom):"-"})</small><span style={{color:"red"}}>*</span></Form.Label>
                  <Form.Control id="fedit-height" type="text" value={cfieldobj?cfieldobj.masterFieldHeight:0} onChange={(e) => handlemaindim(e,"masterFieldHeight")} style={{fontWeight:"700",color:"#dc3545"}}/>
              </Form.Group>
          </Col>
        </Row>
        <Col style={{marginTop:"20px"}}>
          <div className="NDUrowHieghts">
              <span>{t("rowheights")} <small style={{fontSize:"10px",textTransform:"lowercase"}}>({cfieldobj?(cfieldobj.masterFieldUom&&cfieldobj.masterFieldUom!=="none"?cfieldobj.masterFieldUom:cfieldobj.fieldDto.uom):"-"})</small></span>
              <Button id="ndfedit-addshelve" variant="warning" type="button" size="sm" onClick={() => handleAddshelf(true,false)}>+ {t("newrow")}</Button>
          </div>

          {cfieldobj&&cfieldobj.planogramShelfDto&&cfieldobj.planogramShelfDto.length > 0?<>
              <Col style={{padding:"0px 15px"}}>
                <Row>
                    <Col style={{width:"30%"}}></Col>
                    {/* <Col xs={3} style={{padding:"0px"}}> <Badge bg="light" style={{ color: "#142a33" }}>Name</Badge></Col> */}
                    <Col className="row-headers" style={{width:"20%"}}><Badge bg="light" style={{ color: "#142a33" }}>{t("length")}</Badge></Col>
                    <Col className="row-headers" style={{width:"20%"}}><Badge bg="light" style={{ color: "#142a33" }}>{t("height")}</Badge></Col>
                    <Col className="row-headers" style={{width:"20%"}}><Badge bg="light" style={{ color: "#142a33" }}>{t("s_gap")}</Badge></Col>
                    <Col className="row-headers" style={{maxWidth:"30px"}}></Col>
                </Row>
              </Col>

              <Col style={{paddingRight:"12px",maxHeight:"calc(100vh - 280px)",overflowX:"hidden",overflowY:"scroll",marginRight:"-15px"}}>
                {cfieldobj&&cfieldobj.planogramShelfDto?cfieldobj.planogramShelfDto.map((shelf, idx) => (
                  <React.Fragment key={idx}>
                    {shelf.isDelete === false?
                    <div className="NDUrackparams">
                        <Row className="NDUshelfdetails">
                            <Col style={{maxWidth:"24%"}} className="NDUrowname">{t("row")} {shelf.reverseRowNumber}:</Col>
                            {/* <Col xs={3} style={{padding:"0px"}}> <Form.Control as="select" value={shelf.reverseRowNumber}
                                onChange={this.handleShelfNameChange(idx)}>
                                    <option value="">Select</option>
                                    {props.loadedFnamenumbers.map((ditem, didx) => {
                                        return <option key={didx} value={ditem}>{ditem}</option>;
                                    })}
                                </Form.Control></Col> */}
                            <Col style={{maxWidth:"25%"}} className="NDUrowvalue"><Form.Control type="text" className="feditrow-width" size="sm" value={shelf.width}
                                onChange={e => handleShelfChange(e,idx,"width")} disabled/></Col>
                            <Col style={{maxWidth:"25%"}} className="NDUrowvalue"><Form.Control type="text" className="feditrow-height" size="sm" value={shelf.height}
                                onChange={e => handleShelfChange(e,idx,"height")}/></Col>
                            <Col style={{maxWidth:"25%"}} className="NDUrowvalue"><Form.Control type="text" className="feditrow-gap" size="sm" value={shelf.gap}
                                onChange={e => handleShelfChange(e,idx,"gap")}/></Col>
                            <Col className="NDUremovevalue"><label className="removerow-link" onClick={() => handleRemoveshelf(idx)}><XCircleFillIcon /></label></Col>
                        </Row>
                    </div>:<></>}
                  </React.Fragment>

                )):<></>}
              </Col>
          </>:<></>}
        </Col>
      </Col>
    </>:<></>);
}
