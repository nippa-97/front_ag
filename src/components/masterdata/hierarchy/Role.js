import React, { useEffect, useState } from 'react';
import { Card, Form, Button, Col } from 'react-bootstrap';
import { PlusIcon, XIcon } from '@primer/octicons-react';
import {preventinputToString, usrLevels, usrRoles } from '../../../_services/common.service';
import { useTranslation } from 'react-i18next';
//import randomColor from 'randomcolor';

var heirachyzindex = 1;
export default function Role(props) {
  const { t } = useTranslation();
  const side = false;
  const [selectEmployee, setSelectEmployee] = useState([]);

  useEffect(() => {
    setSelectEmployee(props.Selectdata)
  }, [props.Selectdata]);

  const handleEmprole = (evt, node, uuid) => {
    if (evt.target.value !== null && (evt.target.value !== "-1")) {
      props.updatenameNodeInTree(node, uuid, evt.target.value, "systemUserRoleType");

    }
    // console.log( selectEmployee[evt.target.value].name);
  }
  const handleUserLevel = (evt, node, uuid) => {
    if (evt.target.value !== null && (evt.target.value !== "-1")) {
      props.updatenameNodeInTree(node,uuid, evt.target.value,"rollUserLevel");
     
    }

  }


  const handletextbox = (evt, node, uuid) => {
    if(!preventinputToString(evt,evt.target.value,(props.t('Character.name')))){
      evt.preventDefault()
      return
    }
    props.updatenameNodeInTree(node, uuid, evt.target.value, "name");
  }
  //select user level list
  var userlevellist = Object.keys(usrLevels).map(x => {
    return <option key={x} value={usrLevels[x]}>{usrLevels[x]}</option>
  });

  //select employee data set
  var selectEmployees = (selectEmployee && selectEmployee.length > 0 ? selectEmployee.map(x => {
    return (!props.ischildrow || (props.ischildrow && x !== usrRoles.CM) ? <option key={x} value={x}>{x.replace(/_/g, " ")}</option> : <React.Fragment key={x}></React.Fragment>);
  }) : <></>);

  //var crandomcolor = randomColor({luminosity: 'light'});
  heirachyzindex = heirachyzindex + 0.2;
  return (
    <>
      {props.data && props.data.map((item, i) => {
        return (!item.isDelete ? <Col key={i}>
          {props.ischildrow && props.data.length === (i + 1) ? <div className="lastitem-content" style={{ zIndex: (heirachyzindex) }}></div> : <></>}
          <Card className={props.ischildrow ? ("sub-content") : ""}>
            {!side ? <div className="cardt-add" onClick={() => props.insertNodeIntoTree(item, item.uuid, "Employee")}><PlusIcon size={18} /></div> : <></>}
            <div className="cardt">
              <div className="cardt-submain" style={(props.isRTL === "rtl" ? { borderRightColor: item.color } : { borderLeftColor: item.color })}>
                <div className="cardt-overlay"></div>
                <div className="cardtop">
                  <Col className="roleselect-main">
                    <small>{props.t("name")}</small>
                    <Form.Control  size="sm" type="text" placeholder="Name" className="roleselectbox" value={item.name} onChange={(e) => handletextbox(e, item, item.uuid)} style={(props.isRTL === "rtl" ? { marginLeft: "10px", cursor: "text" } : { marginRight: "10px", cursor: "text" })} />

                    <small style={(props.isRTL === "rtl" ? { marginRight: "33%" } : { marginLeft: "33%" })}>{props.t("roletype")}</small>
                    <Form.Control size="sm" as="select" className="roleselectbox" onChange={(e) => handleEmprole(e, item, item.uuid)} value={item.systemUserRoleType}>
                      <option value="-1">{t('SELECT')}</option>
                      {selectEmployees}
                    </Form.Control>


                    <small style={(props.isRTL === "rtl" ? { marginRight: "63%" } : { marginLeft: "63%" })}>{props.t("USER_LEVEL")}</small>
                    <Form.Control size="sm" as="select" className="roleselectbox" onChange={(e) => handleUserLevel(e, item, item.uuid)} value={item.rollUserLevel}>
                      <option value="-1">{t('SELECT')}</option>
                      {userlevellist}
                    </Form.Control>
                  </Col>
                  <br />
                  {/* <Form.Group controlId="formBasicCheckbox">
                                <Form.Check type="checkbox" label="Side" checked={side}
                                    onChange={(e) => { setSide(e.target.checked) }} />
                            </Form.Group> */}
                  {props.ischildrow ? <Button variant="outline-danger" className="addremove-btn" size="sm" onClick={() => props.deleteNodeFromTree(item, item.uuid)}><XIcon size={8} /></Button> : <></>}
                </div>
              </div>
            </div>
          </Card>
          <Col className="cardsub-view">
            {item.children?.length > 0 ? <Role t={props.t} isRTL={props.isRTL} data={item.children} ischildrow={true} Selectdata={props.Selectdata} insertNodeIntoTree={props.insertNodeIntoTree} deleteNodeFromTree={props.deleteNodeFromTree} updatenameNodeInTree={props.updatenameNodeInTree} /> : <></>}
          </Col>
        </Col> : <React.Fragment key={i}></React.Fragment>)
      })}


    </>

  )
}
