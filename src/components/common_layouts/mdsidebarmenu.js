import React, {useState} from 'react';
import { useLocation, withRouter } from 'react-router-dom';
import { Col, Collapse } from 'react-bootstrap';
import { GrabberIcon, ChevronDownIcon } from '@primer/octicons-react';

import { useTranslation, withTranslation } from "react-i18next";
import "../../_translations/i18n";

import { grantPermission } from '../../_services/common.service';
import { connect } from 'react-redux';
import { store } from '../../store/store';
/**
 * masterdata sidebar to show all master data pages
 * props using signin object user roles to filter menu items
 *
 * @param {*} props
 * @return {*} 
 */
function MDSidebarMenu(props) {
    const { t } = useTranslation();
    var reduxstate = store.getState();
    const [isgeneralcollapse, setGeneralColps] = useState(true); //general collapse
    const [ispgcollpase, setPlanigoColps] = useState(true); //planogram collapse
    const [ismpcollpase, setMasterPlanoColps] = useState(true); //planogram collapse
    const location = useLocation(); //curent location from react router dom
    //redirect to page
    const handleRedirect = (cpath) => {
      props.history.push(cpath);
    }
    //check current url contains page path - active purpose
    const checkUrlContains = (cpath) => {
      return location.pathname.includes(cpath);
    }
    //toggle collapse menu
    const setOpenCollapse = (ctype) => {
      if(ctype === "general"){
        setGeneralColps(!isgeneralcollapse);
      } else if(ctype === "planogram"){
        setPlanigoColps(!ispgcollpase);
      }  else if(ctype === "masterplanogram"){
        setMasterPlanoColps(!ismpcollpase);
        console.log(ismpcollpase);
      }
    }
    let catelogImportcount = (reduxstate.catelogImportLogCountState && reduxstate.catelogImportLogCountState.count ?reduxstate.catelogImportLogCountState.count : 0);
    
    let isAUIAllow = (props.signState && props.signState.signinDetails?props.signState.signinDetails.isAUION:false);
    // let isUserRestricted = (props.signState && props.signState.signinDetails && props.signState.signinDetails.userUUID === "53bd6158-b53c-4032-9855-b6a9d0481da9"?true:false);
    let isUserRestricted = false;

    //user check for AUI allow
    /* if(isAUIAllow && props.signState && props.signState.signinDetails){
      let userobj = props.signState.signinDetails;

      if(userobj.userRolls){
          let userrole = userobj.userRolls.systemMainRoleType;
          // console.log(userrole);

          if(userrole === usrRoles.CM){
            isAUIAllow = true;
          } else{
            isAUIAllow = false;
          }
      }
    } */
    
    return (<>
    <Col xs={12} lg={2} className="md-sidebar-main">
      {/* {console.log(reduxstate )} */}
      <Col className="sidebar-subcontent">
        {!isUserRestricted?<>
          {(grantPermission("hierarchy") || grantPermission("regions") || grantPermission("branches") || grantPermission("users"))?<>
            <h5 onClick={() => setOpenCollapse("general")}>{t("general")} <span className="float-right caretdown"><ChevronDownIcon size={16}/></span></h5>
            <Collapse in={isgeneralcollapse}>
              <ul className="submenu-items">
                <li className={"menu-item"+(checkUrlContains("/hierarchy")?" active":"") + (grantPermission("hierarchy")?"":" d-none")} onClick={e => handleRedirect("/hierarchy")}><GrabberIcon size={16}/> {t("userheirachy")}</li>
                <li className={"menu-item"+(checkUrlContains("/regions")?" active":"") + (grantPermission("regions")?"":" d-none")} onClick={e => handleRedirect("/regions")}><GrabberIcon size={16}/> {t("regions")}</li>
                <li className={"menu-item"+(checkUrlContains("/branches")?" active":"") + (grantPermission("branches")?"":" d-none")} onClick={e => handleRedirect("/branches")}><GrabberIcon size={16}/> {t("branches")}</li>
                <li className={"menu-item"+(checkUrlContains("/users")?" active":"") + (grantPermission("users")?"":" d-none")} onClick={e => handleRedirect("/users")}><GrabberIcon size={16}/> {t("USERS")}</li>
                <li className={"menu-item"+(checkUrlContains("/usergroups")?" active":"") + (grantPermission("usergroups")?"":" d-none")} onClick={e => handleRedirect("/usergroups")}><GrabberIcon size={16}/> {t("usergroups")}</li>
                <li className={"menu-item"+(checkUrlContains("/salesLog")?" active":"") + (grantPermission("salesLog")?"":" d-none")} onClick={e => handleRedirect("/salesLog")}><GrabberIcon size={16}/> 
                {t("SALES_LOG")}
                </li>
                
                {/* <li className={"menu-item"+(checkUrlContains("/newProducts")?" active":"") + (grantPermission("newProducts")?"":" d-none")} onClick={e => handleRedirect("/newProducts")}><GrabberIcon size={16}/> {t("NEWPRODUCTS")}</li> */}
                <li className={"menu-item"+(checkUrlContains("/catelogueImport")?" active":"") + (grantPermission("catelogueImport")?"":" d-none")} onClick={e => handleRedirect("/catelogueImport")}><GrabberIcon size={16}/> {t("CATELOGUE_IMPORT")}
                <div className={'indicator-no '+(catelogImportcount<=0 ? " d-none ":"")}>{catelogImportcount>99 ? "99+" :catelogImportcount}</div>
                </li>
                {/* <li className={"menu-item"+(checkUrlContains("/catelogueDataApprovals")?" active":"") + (grantPermission("catelogueDataApprovals")?"":" d-none")} onClick={e => handleRedirect("/catelogueDataApprovals")}><GrabberIcon size={16}/> {t("CATELOGUE_APPROVALS")}</li> */}
                <li className={"menu-item"+(checkUrlContains("/storeProducts")?" active":"") + (grantPermission("storeProducts")?"":" d-none")} onClick={e => handleRedirect("/storeProducts")}><GrabberIcon size={16}/> {t("STORE_PRODUCTS")}</li>
              </ul>
            </Collapse>
          </>:<></>}
          
          {isAUIAllow?<>
            <h5 onClick={() => setOpenCollapse("masterplanogram")}>{t("master_planogram")} <span className="float-right caretdown"><ChevronDownIcon size={16}/></span></h5>
            <Collapse in={ismpcollpase}>
              <ul className="submenu-items">
                <li className={"menu-item"+(checkUrlContains("/newproductlogs")?" active":"") + (grantPermission("masterPlanogram")?"":" d-none")} onClick={e => handleRedirect("/newproductlogs")}><GrabberIcon size={16}/> {t("NEWPROD_LOGS")}</li>
              </ul>
            </Collapse>
          </>:<></>}
        </>:<></>}


        <h5 onClick={() => setOpenCollapse("planogram")}>{t("planogram")} <span className="float-right caretdown"><ChevronDownIcon size={16}/></span></h5>
        <Collapse in={ispgcollpase}>
          <ul className="submenu-items">

            {!isUserRestricted?<>
              <li className={"menu-item"+(checkUrlContains("/departments")?" active":"") + (grantPermission("departments")?"":" d-none")} onClick={e => handleRedirect("/departments")}><GrabberIcon size={16}/> {t("departments")}</li>
              <li className={"menu-item"+(checkUrlContains("/chaindepartments")?" active":"") + (grantPermission("chaindepartments")?"":" d-none")} onClick={e => handleRedirect("/chaindepartments")}><GrabberIcon size={16}/> {t("chaindepartments")}</li>
              <li className={"menu-item"+(checkUrlContains("/tags")?" active":"") + (grantPermission("tags")?"":" d-none")} onClick={e => handleRedirect("/tags")}><GrabberIcon size={16}/> {t("tags")}</li>
            </>:<></>}

            <li className={"menu-item"+(checkUrlContains("/brands")?" active":"") + (grantPermission("brands")?"":" d-none")} onClick={e => handleRedirect("/brands")}><GrabberIcon size={16}/> {t("brands")}</li>
            <li className={"menu-item"+(checkUrlContains("/suppliers")?" active":"") + (grantPermission("suppliers")?"":" d-none")} onClick={e => handleRedirect("/suppliers")}><GrabberIcon size={16}/> {t("suppliers")}</li>
            <li className={"menu-item"+(checkUrlContains("/displayunits")?" active":"") + (grantPermission("displayunits")?"":" d-none")} onClick={e => handleRedirect("/displayunits")}><GrabberIcon size={16}/> {t("dunits")}</li>
            
            {!isUserRestricted?<>
              <li className={"menu-item"+(checkUrlContains("/floors")?" active":"") + (grantPermission("floors")?"":" d-none")} onClick={e => handleRedirect("/floors")}><GrabberIcon size={16}/> {t("floors")}</li>
              <li className={"menu-item"+(checkUrlContains("/excelupload")?" active":"") + (grantPermission("excelupload")?"":" d-none")} onClick={e => handleRedirect("/excelupload")}><GrabberIcon size={16}/> {t("excelupload")}</li>
            </>:<></>}
          </ul>
        </Collapse>
      </Col>
    </Col>
    </>);
}

const mapStateToProps = state => ({
  ...state
});
export default withTranslation()(withRouter(connect(mapStateToProps, null)(MDSidebarMenu)))

