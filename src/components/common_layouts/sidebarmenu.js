// import React, {useState} from 'react';
import { useLocation, withRouter } from 'react-router-dom';
import { Col } from 'react-bootstrap'; //, Collapse
import {ContainerIcon, BellIcon } from '@primer/octicons-react'; //
// import FeatherIcon from 'feather-icons-react';

import planigologo from '../../assets/img/logo_wt.png';
import { useTranslation } from 'react-i18next';

import { grantPermission, cversion, usrRoles } from '../../_services/common.service';
import { DashboardIcon, PlanogramIcon, ProductIcon, MasterdataIcon, FeedIcon, Feed2Icon, NewProductsIcon, UsersIcon } from './sidebaricons';
/**
 *#SIN-H02 main sidebar of applications
 * in props mainly sending signin object to show/hide sidebar inside and after logout(sigin/landing screens)
 * 
 * @param {*} props
 * @return {*} 
 */
function SidebarMenu(props) {
  const { t } = useTranslation(); //translation object
  const location = useLocation(); //react router dom location

  // const [isProdcollpase, setProdcollpase] = useState(false);
  //redirect function, using cpath to set push location
  const handleRedirect = (cpath) => {
    props.history.push(cpath);
  }
  //checks current location is contains cpath - for active purpose
  const checkUrlContains = (cpath) => {
    return location.pathname.includes(cpath);
  }
  const getmasterdatatotCount= () => {
    var totcount=0
    var catlogimpcount=props.catelogImportLogCountState.count
    totcount=catlogimpcount
    return totcount
  }
  //toggle collapse menu
  /* const setOpenCollapse = (ctype, isshow) => {
     if(ctype === "products"){
      setProdcollpase(isshow);
    }
  } */
  
  let newprodscount = (props.newprodscount && props.newprodscount.count ? props.newprodscount.count : 0);
  let masterdataTotCount= getmasterdatatotCount();

  let isAUIAllow = (props.signedobj && props.signedobj.signinDetails?props.signedobj.signinDetails.isAUION:false);
  let isUserRestricted = props.isUserRestricted;

  //user check for AUI allow
  /* if(isAUIAllow && props.signedobj && props.signedobj.signinDetails){
    let userobj = props.signedobj.signinDetails;

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
  
  return (
    <>{props.signedobj !== null && props.signedobj.signinDetails ?
      <Col className={"sidebar-main "+(props.isRTL==="rtl"?"RTL":"")} dir={props.isRTL}>
        <img src={planigologo} className="d-block d-sm-none" alt="Planigo logo" />
        
        <ul className="submenu-items">

          <li className={"menu-title" + (grantPermission("masterPlanogram")?"":" d-none")} style={{ marginTop: "15px",marginBottom:"5px"}}>{t("MC.BUILD")}</li>
          <li className={"menu-item" + (checkUrlContains("/masterplanograms") ? " active" : "") + (grantPermission("masterPlanogram")?"":" d-none")} onClick={e => handleRedirect("/masterplanograms")}><div className="content-main"><div className="content-text">{isUserRestricted?t("SIMULATOR"):t("master_planogram")}</div> <ContainerIcon size={16} /></div></li>

          {!isUserRestricted?<>
            <li className={"menu-title" + (grantPermission("taskfeed")?"":" d-none")}>{t("MC.IMPLEMENT")}</li>
            <li className={"menu-item" + (checkUrlContains("/task") ? " active" : "") + (grantPermission("taskfeed")?"":" d-none")} onClick={e => handleRedirect("/tasks")}><div className="content-main"><div className="content-text">{t("FEED_BACK")}</div> <FeedIcon /></div></li>

            <li className={"menu-title" + (grantPermission("dashboard")?"":" d-none")} >{t("MC.ANALYSIS")}</li>
            <li className={"menu-item" + (checkUrlContains("/dashboard") ? " active" : "") + (grantPermission("dashboard")?"":" d-none")} onClick={e => handleRedirect("/dashboard")}><div className="content-main"><div className="content-text">{t("dashboard")}</div> <DashboardIcon /></div></li>
            <li className={"menu-item" + (checkUrlContains("/planograms") ? " active" : "") + (grantPermission("planogram")?"":" d-none")} onClick={e => handleRedirect("/planograms")}><div className="content-main"><div className="content-text">{t("planograms")}</div> <PlanogramIcon /></div></li>
            
            {isAUIAllow?<>
              <li className={"menu-title" + (grantPermission("masterPlanogram")?"":" d-none")} >{t("MC.RECOMMEND")}</li>
              <li className={"menu-item" + (checkUrlContains("/prodnotifications") ? " active" : "") + (grantPermission("masterPlanogram")?"":" d-none")} onClick={e => handleRedirect("/prodnotifications")}><div className="content-main"><div className="content-text">{t("ARISTO_NOTIFICATIONS")}</div>{props.notificationCount > 0?<div className={'indicator'}>{props.notificationCount}</div>:<></>} <BellIcon size={16} /></div></li>
              {/* <li className={"menu-item" + (checkUrlContains("/aristomaps") ? " active" : "") + (grantPermission("masterPlanogram")?"":" d-none")} onClick={e => handleRedirect("/aristomaps")}><div className="content-main"><div className="content-text">{t("ARISTO_MAPS")}</div><FeatherIcon icon="map" size={16} /></div></li> */}
            </>:<></>}
            
            <li className={"menu-title" + (grantPermission("dashboard")?"":" d-none")} >{t("MC.SETTINGS")}</li>
          </>:<></>}
          
          {isUserRestricted?
            <li className={"menu-item"+(checkUrlContains("/brands")?" active":"") + (grantPermission("brands")?"":" d-none")} onClick={e => handleRedirect("/brands")}><div className="content-main"><div className="content-text">{t("masterdata")} </div><MasterdataIcon /></div></li>
          :
            <li className={"menu-item"+(checkUrlContains("/users")?" active":"") + (grantPermission("users")?"":" d-none")} onClick={e => handleRedirect("/users")}><div className="content-main"><div className="content-text">{t("masterdata")} </div><div className={'indicator '+(masterdataTotCount<=0 ? " d-none ":"")}>{(masterdataTotCount>99 ? "99+" : masterdataTotCount)}</div> <MasterdataIcon /></div></li>
          }

          <li className={"menu-item" + (checkUrlContains("/products") ? " active" : "") + (grantPermission("products")?"":" d-none")} onClick={e => handleRedirect("/products")}><div className="content-main"><div className="content-text">{t("products")}</div> <ProductIcon /></div></li>

          {!isUserRestricted?<>
            <li className={"menu-item new-products" + (checkUrlContains("/newProducts") ? " active" : "") + (grantPermission("newProducts")?"":" d-none")} onClick={e => handleRedirect("/newProducts")}><div className="content-main"> <div className="content-text">{t("NEW_PRODUCTS")} </div> <div className={'indicator '+(newprodscount<=0 ? " d-none ":"")}>{(newprodscount>99 ? "99+" : newprodscount)}</div> <NewProductsIcon size={20} /> </div></li>
            <li className={"menu-item" + (checkUrlContains("/questionlist") ? " active" : "") + (grantPermission("taskfeed")?"":" d-none")} onClick={e => handleRedirect("/questionlist")}><div className="content-main"><div className="content-text">{t("questionnaire")}</div> <Feed2Icon /></div></li>
          </>:<></>}

          {/* <li className={"menu-item" + (checkUrlContains("/manualcompliance") ? " active" : "") + (grantPermission("manualcomp")?"":" d-none")} onClick={e => handleRedirect("/manualcompliance")}><div className="content-main"><div className="content-text">{t("manual_compliance")}</div> <CopyIcon size={18} /></div></li>
          <li className={"menu-item"+(checkUrlContains("/departments")?" active":"") + (!grantPermission("users")&&grantPermission("departments")?"":" d-none")} onClick={e => handleRedirect("/departments")}><div className="content-main"><div className="content-text">{t("masterdata")} </div> <MasterdataIcon /></div></li>
          <li className={"menu-title" + (grantPermission("taskfeed")?"":" d-none")}>{t("FEED_BACK")}</li>
          <li className={"menu-item" + (checkUrlContains("/questionlist") ? " active" : "") + (grantPermission("taskfeed")?"":" d-none")} onClick={e => handleRedirect("/questionlist")}><div className="content-main"><div className="content-text">{t("questionnaire")}</div> <Feed2Icon /></div></li>
          <li className={"menu-item new-products" + (checkUrlContains("/newProducts") ? " active" : "") + (grantPermission("newProducts")?"":" d-none")} onClick={e => handleRedirect("/newProducts")}><div className="content-main"> <div className="content-text">{t("NEW_PRODUCTS")} </div> <div className={'indicator '+(newprodscount<=0 ? " d-none ":"")}>{(newprodscount>99 ? "99+" : newprodscount)}</div> <NewProductsIcon size={20} /> </div></li> */}
        </ul>

        {/* <ul className="submenu-items">
          <li onMouseOver={() => setOpenCollapse("build", true)} onMouseOut={() => setOpenCollapse("build", false)} className={"menu-item " +(isProdcollpase?"prodcollape":"")} >
            <div className="content-main"><div className="content-text">{t("MC.BUILD")}<span className="float-right caretdown"><ChevronDownIcon size={16}/></span></div> <FeatherIcon icon="grid" size={16} />
            <Collapse in={isProdcollpase}>
              <ul className="main-collpse">
                <li onClick={e => handleRedirect("/products")}>{t("MASTER_PRODUCTS")}</li>
                <li onClick={e => handleRedirect("/newProducts")}>{t("NEW_PRODUCTS")}</li>
              </ul>
            </Collapse>
            </div>
          </li>
          <li onMouseOver={() => setOpenCollapse("implement", true)} onMouseOut={() => setOpenCollapse("implement", false)} className={"menu-item " +(isProdcollpase?"prodcollape":"")} >
            <div className="content-main"><div className="content-text">{t("MC.IMPLEMENT")}<span className="float-right caretdown"><ChevronDownIcon size={16}/></span></div> <FeatherIcon icon="map" size={16} />
            <Collapse in={isProdcollpase}>
              <ul className="main-collpse">
                <li onClick={e => handleRedirect("/products")}>{t("MASTER_PRODUCTS")}</li>
                <li onClick={e => handleRedirect("/newProducts")}>{t("NEW_PRODUCTS")}</li>
              </ul>
            </Collapse>
            </div>
          </li>
          <li onMouseOver={() => setOpenCollapse("analysis", true)} onMouseOut={() => setOpenCollapse("analysis", false)} className={"menu-item " +(isProdcollpase?"prodcollape":"")} >
            <div className="content-main"><div className="content-text">{t("MC.ANALYSIS")}<span className="float-right caretdown"><ChevronDownIcon size={16}/></span></div> <ProductIcon />
            <Collapse in={isProdcollpase}>
              <ul className="main-collpse">
                <li onClick={e => handleRedirect("/products")}>{t("MASTER_PRODUCTS")}</li>
                <li onClick={e => handleRedirect("/newProducts")}>{t("NEW_PRODUCTS")}</li>
              </ul>
            </Collapse>
            </div>
          </li>
          <li onMouseOver={() => setOpenCollapse("recommend", true)} onMouseOut={() => setOpenCollapse("recommend", false)} className={"menu-item " +(isProdcollpase?"prodcollape":"")} >
            <div className="content-main"><div className="content-text">{t("MC.RECOMMEND")}<span className="float-right caretdown"><ChevronDownIcon size={16}/></span></div> <ProductIcon />
            <Collapse in={isProdcollpase}>
              <ul className="main-collpse">
                <li onClick={e => handleRedirect("/products")}>{t("MASTER_PRODUCTS")}</li>
                <li onClick={e => handleRedirect("/newProducts")}>{t("NEW_PRODUCTS")}</li>
              </ul>
            </Collapse>
            </div>
          </li>
          <li onMouseOver={() => setOpenCollapse("settings", true)} onMouseOut={() => setOpenCollapse("settings", false)} className={"menu-item " +(isProdcollpase?"prodcollape":"")} >
            <div className="content-main"><div className="content-text">{t("MC.SETTINGS")}<span className="float-right caretdown"><ChevronDownIcon size={16}/></span></div> <ProductIcon />
            <Collapse in={isProdcollpase}>
              <ul className="main-collpse">
                <li onClick={e => handleRedirect("/products")}>{t("MASTER_PRODUCTS")}</li>
                <li onClick={e => handleRedirect("/newProducts")}>{t("NEW_PRODUCTS")}</li>
              </ul>
            </Collapse>
            </div>
          </li>
        </ul> */}
        
        <span className="d-none d-sm-block" style={{ position: "absolute", bottom: "5px", left: "20px", fontSize: "10px", color: "#ccc" }}>v{(props.globsettingobj && props.globsettingobj.current_web_version)?props.globsettingobj.current_web_version:cversion}</span>
      </Col>
      : <></>}
    </>);
}

export default withRouter(SidebarMenu);