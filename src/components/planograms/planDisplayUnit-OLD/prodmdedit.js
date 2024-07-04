import React,{useState, useEffect} from "react";
import { Accordion, Alert, Button, Card, Col, Form, Modal, Row, Table } from "react-bootstrap";
import { ArrowSwitchIcon } from '@primer/octicons-react';
import { confirmAlert } from 'react-confirm-alert';

import { alertService } from '../../../_services/alert.service';
import { submitCollection } from '../../../_services/submit.service';
import { submitSets } from '../../UiComponents/SubmitSets';

import loadinggif from '../../../assets/img/loading-sm.gif';
import { useTranslation } from "react-i18next";

/**
 * #PLG-DU-PD-H08
 * changes product masterdata values - caution this updates main product masterdata values
 * this contains options to toggle(between width,height,depth) or type width height of product
 * when user changing this values it goes to backend call to get currently using fields of this product
 * this not effecting already added products
 * can access this by clicking double arrow icon in products sidebar
 *
 * @export
 * @param {*} props
 * @return {*} 
 */
export default function ProdMDModal(props) {
    //default states
    const [loadingpgrams, setLoadingPgrams] = useState(false);
    const [isshowwarning, setShowWarning] = useState(false);
    const [cvprodobj, setProdObj] = useState(null);
    const [ispgramdataloaded, setPgramDataLoad] = useState(false);
    const { t } = useTranslation();

    useEffect(() => {
      if(props.pemobj){ //getting current editing product
        setProdObj(JSON.parse(JSON.stringify(props.pemobj)));
      }
    }, [props.pemobj]);

    //toggle product edit modal
    const toggleClose = () => {
        props.handlepemview(!props.pemshow,null);
    }
    //onchange value by typing. evt- element, type- object key(width,height,depth)
    const handlevalchange = (evt,type) => {
      if(evt.target.value && evt.target.value >= 0){
        var csobj = cvprodobj;
        csobj[type] = evt.target.value;
        checkchange(csobj);
      }
    }
    //#PLG-DU-PD-H09 onclick flip button. type 1- w/h, type 2-h/d, type 3-w/d
    const handleFlip = (type) => {
      var csobj = JSON.parse(JSON.stringify(cvprodobj));
      if(type === 1){
        csobj["width"] = cvprodobj.height;
        csobj["height"] = cvprodobj.width;
      } else if(type === 2){
        csobj["height"] = cvprodobj.depth;
        csobj["depth"] = cvprodobj.height;
      } else if(type === 3){
        csobj["width"] = cvprodobj.depth;
        csobj["depth"] = cvprodobj.width;
      }
      //check product details already added
      checkchange(csobj);
    }
    //reset prod values
    const resetProdEdit = () => {
      setProdObj(JSON.parse(JSON.stringify(props.pemobj)));
      setPgramDataLoad(false); 
      setShowWarning(false);
    }
    //check and change prod details
    const checkchange = (obj) => {
      //check product already added
      var isalreadyadded = false;
      if(props.saveobj){
        for (var i = 0; i < props.saveobj.planogramShelfDto.length; i++) {
          const shelveitem = props.saveobj.planogramShelfDto[i];
          for (var j = 0; j < shelveitem.planogramProduct.length; j++) {
            const proditem = shelveitem.planogramProduct[j];
            if(proditem.isDelete === false && proditem.productInfo.id === props.pemobj.id && proditem.productBlock.length > 0){
              for (var k = 0; k < proditem.productBlock.length; k++) {
                const prodblock = proditem.productBlock[k];
                if(prodblock.isDelete === false && prodblock.productLocations.length > 0){
                  for (var c = 0; c < prodblock.productLocations.length; c++) {
                    const prodloc = prodblock.productLocations[c];
                    if(prodloc.isDelete === false){
                      isalreadyadded = true;
                    }
                  }
                }
              }
            }
          }
        }
      }
      //if already added needs to remove before changing values. otherwise cannot change product values in already added field
      if(isalreadyadded){
        alertService.error(t('PRODUCT_ALREADY_ADDED_REMOVE_ADDED_PRODUCTS_TO_CHANGE'));
        return false;
      }
      
      setProdObj(null);
      setTimeout(() => { setProdObj(obj); }, 10);
      viewPgramDetails(obj);
    }

    var loadpgramtimeout;
    //#PLG-DU-PD-H10 load product warning details
    const viewPgramDetails = (obj) => {
      //check product added to early planograms
      if(loadpgramtimeout){ clearTimeout(loadpgramtimeout); }
      if(!ispgramdataloaded){
        setLoadingPgrams(true);
        loadpgramtimeout = setTimeout(() => {
          submitSets(submitCollection.getProdUsage, obj, true).then(res => {
              setPgramDataLoad(true);
              setLoadingPgrams(false);
              if(res.status && res.extra && res.extra.length > 0){
                setShowWarning(res.extra);
              } else{
                setShowWarning(false);
              }
          });

        }, 1200);  
      }
    }
    //#PLG-DU-PD-H11 update masterdata values with current changed values
    const handleProdUpdate = () => {
      if(cvprodobj){
        confirmAlert({
            title: t('UPDATE_PRODUCT_DETAILS'),
            message: t('ARE_YOU_SURE_TO_UPDTAE_PRODUCT_DETAILS'),
            buttons: [{
                label: t('btnnames.yes'),
                onClick: () => {
                  submitSets(submitCollection.updateProdDimention, cvprodobj, true).then(resp => {
                      //console.log(res);
                      if(resp && resp.status){
                          alertService.success(t('PRODUCT_DETAILS_SUCCESSFULLY_UPDATED'));
                          props.handlepemview(false,cvprodobj);
                      } else{
                          alertService.error((resp&&resp.extra?resp.extra:resp.msg?resp.msg:t("ERROR_OCCURRED")));
                      }
                  });
                }
              },
              {
                label: t('btnnames.no'),
                onClick: () => {
                  props.handlepemview(false,null);
                }
              }
            ]
        });    
      }
    }

    return (<Modal show={props.pemshow} className="pgram-editproduct" animation={false} onHide={toggleClose} backdrop="static" keyboard={false} dir={props.isRTL}>
      <Modal.Header>
        <Modal.Title style={{fontWeight:"800",color:"#5128a0"}}><small>{cvprodobj?cvprodobj.productName:"-"}</small></Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Row>
          <Col>
            <Form.Group>
              <Form.Label style={{fontWeight:"600",color:"#5128a0",fontSize:"14px",textTransform:"uppercase"}}>{t('width')}</Form.Label>
              <Form.Control type="number" value={cvprodobj?cvprodobj.width:0} onChange={e => handlevalchange(e,"width")} style={{fontWeight:"600"}} />
              <Button type="button" variant="outline-danger" size="sm" onClick={() => handleFlip(1)} style={{width:"100%",marginTop:"10px",borderRadius:"15px",fontWeight:"700"}}>W <ArrowSwitchIcon size={14}/> H </Button>
            </Form.Group>  
          </Col> 
          <Col>
            <Form.Group>
              <Form.Label style={{fontWeight:"600",color:"#5128a0",fontSize:"14px",textTransform:"uppercase"}}>{t('height')}</Form.Label>
              <Form.Control type="number" value={cvprodobj?cvprodobj.height:0} onChange={e => handlevalchange(e,"height")} style={{fontWeight:"600"}} />
              <Button type="button" variant="outline-danger" size="sm" onClick={() => handleFlip(2)} style={{width:"100%",marginTop:"10px",borderRadius:"15px",fontWeight:"700"}}>H <ArrowSwitchIcon size={14}/> B </Button>
            </Form.Group>  
          </Col> 
          <Col>
            <Form.Group>
              <Form.Label style={{fontWeight:"600",color:"#5128a0",fontSize:"14px",textTransform:"uppercase"}}>{t('breadth')}</Form.Label>
              <Form.Control type="number" value={cvprodobj?cvprodobj.depth:0} onChange={e => handlevalchange(e,"depth")} style={{fontWeight:"600"}} />
              <Button type="button" variant="outline-danger" size="sm" onClick={() => handleFlip(3)} style={{width:"100%",marginTop:"10px",borderRadius:"15px",fontWeight:"700"}}>W <ArrowSwitchIcon size={14}/> B </Button>
            </Form.Group>  
          </Col> 
        </Row>
        <Col>
          {loadingpgrams?<Col className="text-center"><img src={loadinggif} alt="loading gif" /></Col>:<></>}
          {isshowwarning?<Alert variant="warning" style={{position:"relative",borderLeft:"4px solid #664d03"}}>
            {t('THIS_NOT_EFFECT_ELIER_PLANO_ONLY_FOR_THIS_AND_FUTURE_PLANO')}
            <Accordion>
              <Card>
                <Accordion.Toggle as={Card.Header} eventKey="0" style={{cursor:"pointer"}}>{t('VIEW_USED_PLANOGRAMS')}</Accordion.Toggle>
                <Accordion.Collapse eventKey="0">
                  <Card.Body style={{padding:"5px",maxHeight:"150px",overflowY:"auto"}}>
                    <Table>
                      <tbody>
                        {isshowwarning&&isshowwarning.map((x,idx) => {
                          return <tr key={idx}><td style={{padding:"5px"}}>{x.storeName?x.storeName:"-"}</td><td style={{padding:"5px"}}>{x.floorName}</td><td style={{padding:"5px"}}>{x.floorLayoutVersion}</td></tr>
                        })}
                      </tbody>
                    </Table>
                  </Card.Body>
                </Accordion.Collapse>
              </Card>
            </Accordion>
          </Alert>:<></>}
        </Col>
      </Modal.Body>
      <Modal.Footer style={{display:"initial",textAlign:"right"}}>
        <Button type="button" variant="light" size="sm" className={(props.isRTL==="rtl"?"float-right":"float-left")} onClick={resetProdEdit} disabled={loadingpgrams}>{t('btnnames.reset')}</Button>
        <Button type="button" variant="secondary" size="sm" className={(props.isRTL==="rtl"?"float-left":"float-right")} onClick={toggleClose} disabled={loadingpgrams} style={{borderRadius:"15px"}}>{t('btnnames.close')}</Button>
        <Button type="button" variant="danger" size="sm" className={(props.isRTL==="rtl"?"float-left":"float-right")} onClick={handleProdUpdate} disabled={loadingpgrams} style={{borderRadius:"15px"}}>{t('btnnames.update')}</Button>
      </Modal.Footer>
    </Modal>);
}