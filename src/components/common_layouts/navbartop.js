import React from 'react';
import { withRouter, Link } from 'react-router-dom';
import { connect } from 'react-redux';
import { Col, Dropdown, Form, FormSelect, Navbar } from 'react-bootstrap'; //Button DropdownButton, 
import { BellIcon, CircleIcon, MoonIcon, SyncIcon, XCircleFillIcon, AlertIcon } from '@primer/octicons-react'; //GearIcon, CommentIcon, ChevronRightIcon, CheckCircleIcon
import i18n from "i18next";
import FeatherIcon from 'feather-icons-react';

import { loginAction, logoutAction, notifiAction } from '../../actions/auth/login_action';
import { langList, convertDateTime, removeCookie } from '../../_services/common.service';
import { submitCollection } from '../../_services/submit.service';
import { noteInfoService } from '../../_services/noteinfo.service';
import { submitSets } from '../UiComponents/SubmitSets';
import { messaging } from '../../firebase';
import NoteInfos from './NoteInfos';

import planigologo from '../../assets/img/logo_o.png';
import planigologoinv from '../../assets/img/logo_o_inv.png';

import { withTranslation } from 'react-i18next';
import SalelogWaring from '../masterdata/salesLog/salelogWaring/salelogWaring';
import Select from 'react-select';
/**
 * main top navbar using to show notifications, user details/signout options, store details
 * imported in app.js and show/hide by checking signin object
 *
 * @class NavbarTop
 * @extends {React.Component}
 */

var notifitimeout;
export class NavbarTop extends React.Component {
    _isMounted = false;
    constructor(props){
        super(props);
        this.state = {
          toastList: [], oldtoken: null, msgtoken: null, islabelanime: false, nmaxresults: 5, //for notifications 
          webtokenlist: [], 
          selectedLang: "he",
        };

    }

    async componentDidMount(){
      this._isMounted = true;

      if(this._isMounted){
        //if signin details not found redirect to signin
        if(!this.props.signedobj || Object.keys(this.props.signedobj).length === 0 || !this.props.signedobj.signinDetails || Object.keys(this.props.signedobj.signinDetails).length === 0){
          this.props.history.push("/signin");
        }
        
        if(this.props.signedobj&&this.props.signedobj.signinDetails){
          const signindetails = this.props.signedobj.signinDetails;
          //get webtoken list
          const cwebtokenlist = (signindetails.webNotificationToken && signindetails.webNotificationToken.length>0?signindetails.webNotificationToken:[]);

          this.setState({ webtokenlist: cwebtokenlist }, () => {
            this.getNotifiData(signindetails); //show notifications
            // this.props.loadNewProductsCounts();//load new product count on load
          });
        }
        //load language
        if(localStorage.getItem("pglangobj")){
          var csellangobj = JSON.parse(localStorage.getItem("pglangobj"));
          this.setState({ selectedLang: (csellangobj?csellangobj.code:"he") });
        }

        //window.addEventListener("focus", this.onTabFocus);
      }
    }

    componentWillUnmount(){
      this._isMounted = false;
      //window.removeEventListener("focus", this.onTabFocus);
    }
    //onfocus tab
    onTabFocus = () => {
      if(this.props.signedobj&&this.props.signedobj.signinDetails){
        this.reloadallnotifications();
      }
    }
    //get notifications - from firebase
    getNotifiData = (useobject) => {
      try {
        messaging.requestPermission().then(async () => {
    			const token = await messaging.getToken();
          //console.log("token:"+token);
          this.setState({msgtoken : token}, () => {
            this.checkTokenAndUpdate(token,useobject);
          });
        }).catch((err) => {
          //console.log(err);
        });

        messaging.onMessage((payload) => {
          /* var cloadlist = (this.props.toastlist?this.props.toastlist:{startIndex:0, datalist: []});
          var ctoastList = (cloadlist&&cloadlist.datalist&&cloadlist.datalist.length>0?cloadlist.datalist:[]); */
          var cnotificatiob = payload.notification;
          //console.log(payload);
          try {
            const newmsgobj = { title: cnotificatiob.title, body: cnotificatiob.body, status: "unseen", notificationId: 0, receptId: 0, isDelete: false };
            noteInfoService.noteInfo(newmsgobj);
            /* ctoastList.unshift(newmsgobj); //unshift

            cloadlist["startIndex"] = (cloadlist.startIndex?(cloadlist.startIndex + 1):0);
            cloadlist["cloadlist"] = ctoastList;

            this.props.updateNotState(cloadlist.startIndex);
            this.props.setNotifiAction(cloadlist); */

            //load new product count
            if(payload.data){
              if(payload.data.payloadTypeId===7){
                this.props.loadNewProductsCounts();
              }
            }

            this.setState({islabelanime: true}, () => {
              if(notifitimeout){ clearTimeout(notifitimeout); }
              this.props.loadNotificationsList(0);
              notifitimeout = setTimeout(() => { 
                this.setState({ islabelanime: false });
              }, 1500);
            });
          } catch (e) {
            //
          }
        });
      } catch (error) {
        //
      }
    }
    //check token with old one - if changed update new one
    checkTokenAndUpdate = (ntoken, usrobject) => {
      //send update token details
      const ctokenlist = this.state.webtokenlist;
      const istokenavailable = ctokenlist.findIndex( x => x.token === ntoken); //find token
      //console.log(ntoken);
      /* console.log(ctokenlist); */
      if(istokenavailable === -1){
        const obj = [{ token: ntoken, tokenType: "web", isNew: true }];
        submitSets(submitCollection.saveNotificationToken, obj, false).then(res => {
          
          if(res.status){
            ctokenlist.push(res.extra[0]);
            this.setState({ webtokenlist: ctokenlist });
            //update user token list
            var cusrobj = usrobject;
            cusrobj["webNotificationToken"] = ctokenlist;
            this.props.setSigninObj(cusrobj);
          } else{
            //
          }
        });
      }

      //get added notifications
      if(this.props.signedobj!==null&&this.props.signedobj.notifiDetails!==null){
        this.setState({ toastList: this.props.signedobj.notifiDetails }, () => {
          this.props.checkNewNotsAvailable();
        });
      }
    }
    //handle logout
    handleLogout = () => {
      if(this.state.msgtoken && this.state.msgtoken.length > 0){
        const obj = { deviceToken: this.state.msgtoken };
        submitSets(submitCollection.deleteUserDeviceToken, obj, false).then(res => {
          removeCookie("userUUid")
          this.continueLogout();
        });  
      } else{
        this.continueLogout();
      }
    }
    //continue logout process
    continueLogout = () => {
      sessionStorage.removeItem("plgsearchfilters");
      noteInfoService.noteInfo(null);

      this.props.removeFirebaseToken();
      this.props.setLogoutState("logout");
      this.props.handleSignObj(null);
      this.props.history.push("/signin");
    }
    //#LAN-H01 change application language 
    handleChangeLang = (evt) => {
      this.setState({ selectedLang: evt.target.value});
      var curlangobj = langList.find(litem => litem.code === evt.target.value);
      if(curlangobj !== undefined){
        i18n.changeLanguage(curlangobj.code);
        localStorage.setItem("pglangobj",JSON.stringify(curlangobj));
        this.props.handleLangObj(curlangobj);
      }
    }
    //load more notifications
    handleLoadMoreNots = (e) => {
      if(e){
        e.preventDefault();
      }

      const cstartdix = this.props.nstartindex;
      const cmaxresults = this.props.nmaxresults;
      const newstartidx = (cstartdix + cmaxresults);

      this.props.loadNotificationsList(newstartidx);
    }
    //reload all notifications by clicking reload link
    reloadallnotifications = () => {
      this.props.loadNotificationsList(0);
      
      setTimeout(() => {
        if(document.getElementById('notifiref')){
          document.getElementById('notifiref').scrollTop = 0;
        }  
      }, 100);
    }
    //update notification status
    updateNotStatus = (e,nidx,isdelete) => {
      e.preventDefault();
      this.props.updateNotifiationStatus(nidx,isdelete);
    }
    //open notifications
    handleOpenNotifications = () => {
      setTimeout(() => {
      if(document.getElementById("notifidroptrigger")){
        document.getElementById("notifidroptrigger").click();
      }  
        setTimeout(() => {
          this.reloadallnotifications();
        }, 300);
      }, 200);
    }
    //on show notification refresh notifications
    handleToggleNotifications = (isshow) => {
      if(isshow){
        noteInfoService.noteInfo(null);
        this.reloadallnotifications();
      }
    }
    //onscroll load notifications
    getScrollPosition = (e) => {
      if(this.props.isnotsloading === false){
        if(this.props.ntotalcount && this.props.ntotalcount > (this.props.toastlist&&this.props.toastlist.datalist&&this.props.toastlist.datalist.length>0?this.props.toastlist.datalist.length:0)){
          let top = document.getElementById("notifiref").scrollTop;
          let sheight = document.getElementById("notifiref").scrollHeight;
          let position = (sheight - top);

          let clientHeight = e.target.clientHeight;
          position = Math.trunc((position - 1));
          
          if(position <= clientHeight){
              this.handleLoadMoreNots();
          }
        }
      }
    }

    render() {
      var {loadedBranchList}=this.props
      //current available languages list
      var langOptList = langList.map((litem,lidx) => {
          return <option key={lidx} value={litem.code} >{litem.text}</option>;
      });
      //user details to show in dropdown
      var cuserdetails = (this.props.signedobj && this.props.signedobj.signinDetails ? this.props.signedobj.signinDetails : null);
      var ufname = (cuserdetails && cuserdetails.userDto && cuserdetails.userDto.fName ? cuserdetails.userDto.fName : "");
      var ulname = (cuserdetails && cuserdetails.userDto && cuserdetails.userDto.lName ? cuserdetails.userDto.lName : "");
      var urolename = (cuserdetails && cuserdetails.userRolls && cuserdetails.userRolls.name ? cuserdetails.userRolls.name : "");
      
      let isaiuser = (this.props.signedobj && this.props.signedobj.signinDetails && this.props.signedobj.signinDetails.isAiUser);
      let filterBranchList = (loadedBranchList&&loadedBranchList.length>0)?loadedBranchList.map((item,i)=>{
          return {value:item.id,label:item.name,idx:i}
      }):[{value:-1,label:this.props.t("NO_RESULT_FOUND")}];
      return (
        <>
        <NoteInfos  opennotifications={this.handleOpenNotifications} />
        {this.props.signedobj && this.props.signedobj.signinDetails?
          <Col className={"navbar-main "+(this.props.isRTL==="rtl"?"RTL":"")} dir={this.props.isRTL}>
            <Navbar bg={this.props.dmode?"dark":"light"} variant={this.props.dmode?"dark":"light"}>
              <Col xs={2} style={{textAlign:(this.props.isRTL==="rtl"?"right":"left")}}>
                <Navbar.Brand><span className="d-none d-sm-block">
                  {this.props.dmode?<img src={planigologoinv} alt="Planigo logo" />:<img src={planigologo} alt="Planigo logo" />}
                </span></Navbar.Brand>
              </Col>
              <Col xs={10} style={{textAlign:"left"}}>
                <Col >
                {/* <DropdownButton
                     className="navbar-waringdropdown"
                     title="Dropdown end"
                     id="dropdown-menu-align-end"
                   >
                   <SalelogWaring />
             </DropdownButton> */}
                </Col>
                <Form inline="true" className="navbar-forminline" style={{marginTop:"-5px"}}>
                  {!isaiuser?<Select 
                      menuPlacement="bottom"
                      placeholder={this.props.t("selectstore")} 
                      options={filterBranchList} 
                      onChange={(e)=>this.props.handleChangeStoreBranch(e.value,2)} 
                      value={filterBranchList.find(x=>x.value===parseInt(this.props.selectedStore))}
                      className="filter-selec2 normalfont" size="sm" classNamePrefix="searchselect-inner" 
                      maxMenuHeight={160}    
                  />:<></>}
                  {/* {!isaiuser?<Form.Control as="select" size="sm" value={this.props.selectedStore} onChange={e => this.props.handleChangeStoreBranch(e.target.value,2)}>
                    <option value="-1">{this.props.t("selectstore")}</option>
                    {this.props.loadedBranchList&&this.props.loadedBranchList.length>0?this.props.loadedBranchList.map((bitem,bidx) => {
                      return <option key={bidx} value={bitem.id}>{bitem.name}</option>;
                    }):<></>}
                  </Form.Control>:<></>} */}
                </Form>
                <ul className="list-inline navbar-formlist">
                  <li className="list-inline-item usernav-link" style={{padding:"0px",marginRight:(this.props.isRTL==="rtl")?"0px":(isaiuser?"0px":"170px"),marginLeft:(this.props.isRTL==="rtl")?(isaiuser?"0px":"170px"):"0px",borderRight:"1px solid #eee",borderLeft:"1px solid #eee"}}>
                    {(!this.props.isUserRestricted && (this.props.signedobj && !this.props.signedobj.signinDetails.isAiUser)&&this.props.saleLogState.WarningDetails.length>0)?<Dropdown className="msgedrop-main">
                      <Dropdown.Toggle variant="" style={{padding:"18px 14px",marginTop:"-3px",color:"#f7a100"}}>
                        <AlertIcon size={16} />
                      </Dropdown.Toggle>

                      <SalelogWaring 
                        isRTL={this.props.isRTL}
                        saleLogState={this.props.saleLogState} 
                        issalewarningLoading={this.props.issalewarningLoading} 
                        GetSalesLogWarings={this.props.GetSalesLogWarings} 
                        />
                    </Dropdown>:<></>}
                  </li>
                  {/* <li className="list-inline-item"><Button variant="secondary" onClick={() => noteInfoService.noteInfo({ title: "test title", body:"test body" })} size="sm">notify</Button></li> */}
                  <li className="list-inline-item usernav-link" style={{padding: "0px", margin: "0px"}}>
                    <Dropdown className="msgedrop-main notifidrop-main" onToggle={this.handleToggleNotifications}>
                      <Dropdown.Toggle variant="" id="notifidroptrigger" style={{padding:"18px 14px",marginTop:"-3px"}}>
                        <div style={{position:"relative"}}>{this.props.isnewnotsavailable?<div className={"notifinew-label "+(this.state.islabelanime?"showanime":"")}></div>:<></>}
                        <BellIcon size={16} /></div>
                      </Dropdown.Toggle>
                      <Dropdown.Menu>
                        <h4>{this.props.t('notifications')}
                          <span className={(this.props.isRTL==="rtl"?"float-left":"float-right")} onClick={() => this.reloadallnotifications()} title={this.props.t('refreshnotifications')} style={{marginTop:"-5px"}}><SyncIcon size={16} className={(this.props.isnotsloading?"active-anime ":"")}/></span>
                        </h4>
                        <Col id="notifiref" className="sub-content" onScroll={(e) => this.getScrollPosition(e)}>
                          {this.props.toastlist&&this.props.toastlist.datalist&&this.props.toastlist.datalist.length>0?this.props.toastlist.datalist.map((nitem, nidx) => {
                            return <React.Fragment key={nidx}>{!nitem.isDelete?<div className={"msg-link dropdown-item "+(nitem.status==="unseen"?"active":"")}>
                            <Col style={{paddingLeft:"0px"}}><span className="deletenote-link" onClick={e => this.updateNotStatus(e,nidx,true)}><XCircleFillIcon size={12}/></span>
                            <Col className="subnote-col redirectnote-link" onClick={e => this.updateNotStatus(e,nidx,false)}>
                            <div className={"readstatus-div "+(nitem.status==="unseen"?"active":"")}></div> {/* <img src={notificationicon} alt="" /> */}
                            <span>{nitem.title?nitem.title:"-"}</span><br/><small>{nitem.body?nitem.body:"-"}</small>
                            {nitem.deliverdate?<small style={{display:"block",fontStyle:"italic",color:"#664E88",marginTop:"3px"}}>{convertDateTime(nitem.deliverdate)}</small>:<></>}</Col></Col></div>:<></>}</React.Fragment>;
                          }):<><h4 className="text-center" style={{marginTop:"30%",fontWeight:"300"}}>{this.props.t("NO_NOTIFICATIONS_FOUND")}</h4></>}
                        </Col>
                        <Dropdown.Divider />
                        {/* {this.props.ntotalcount && this.props.ntotalcount > (this.props.toastlist&&this.props.toastlist.datalist&&this.props.toastlist.datalist.length>0?this.props.toastlist.datalist.length:0)?
                        <label className="moreload-link" onClick={e => this.handleLoadMoreNots(e)}>{this.props.t('morenotifications')}</label>:<></>} */}
                      </Dropdown.Menu>
                    </Dropdown>
                  </li>
                  <li className="list-inline-item usernav-link" style={{padding:"0px"}}>
                    <Dropdown>
                      <Dropdown.Toggle variant="default" className='settings-toggle' style={{padding:"18px 14px",marginTop:"-3px"}}>
                        <FeatherIcon icon="settings" size={18} />
                      </Dropdown.Toggle>

                      <Dropdown.Menu>
                        <div className="userdetails-content" style={{ height: "45px", width: "95%", overflow: "hidden", position: "relative" }}>
                          <span className="userdet-view" style={{ fontWeight: "600", marginRight: "5px", position: "absolute", marginLeft: "15px", marginTop: "5px", lineHeight: "15px", width: "100%", color: "#888" }}>{ufname + " " + ulname}
                          <br /><small style={{ fontSize: "11px" }}>{urolename}</small></span>
                        </div>
                        <Link className="dropdown-item" to="/profilesettings">{this.props.t('profilesettings')}</Link>
                        <Dropdown.Divider />
                        <div style={{padding:"0px 15px"}}>
                          <small>{this.props.t('language')}</small>
                          <FormSelect size="sm" value={this.state.selectedLang} onChange={this.handleChangeLang} style={{marginLeft:"0px",fontFamily:"'Assistant', sans-serif"}}>
                            {langOptList}
                          </FormSelect>
                        </div>
                        <Dropdown.Divider />
                        <div style={{padding:"8px 15px",fontSize:"13px",fontWeight:"600"}}>{this.props.t('theme')}
                          <input type="checkbox" id="switch" onChange={()=>this.props.dmodeToggle()} checked={(this.props.dmode!=null?this.props.dmode:false)} style={{display:"none"}}/>
                          <div className="switch-app">
                              <label className="switch" htmlFor="switch">
                                <div className="toggle"></div>
                                <div className="names">
                                  <p className="light"><CircleIcon size="14"/></p>
                                  <p className="dark"><MoonIcon size="14"/></p>
                                </div>
                              </label>
                          </div>
                        </div>
                        <Dropdown.Divider />
                        <Dropdown.Item href="#" onClick={this.handleLogout} style={{color:"#dc3545",fontWeight:"800"}}>{this.props.t('logout')}</Dropdown.Item>
                      </Dropdown.Menu>
                    </Dropdown>
                  </li>
                </ul>
              </Col>
            </Navbar>
          </Col>
        :<></>}</>
      );
    }
}
//redux actions
const mapDispatchToProps = dispatch => ({
  setSigninObj: (payload) => dispatch(loginAction(payload)),
  setLogoutState: (payload) => dispatch(logoutAction(payload)),
  setNotifiAction: (payload) => dispatch(notifiAction(payload)),
});

export default withTranslation()(withRouter(connect(null,mapDispatchToProps)(NavbarTop)));
