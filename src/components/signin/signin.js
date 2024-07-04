import React from 'react';
import { Link, withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import {Card, Col, Container, Form } from 'react-bootstrap';
import { ArrowLeftIcon } from '@primer/octicons-react';

import { submitCollection } from '../../_services/submit.service';
import { alertService } from '../../_services/alert.service';
import { cversion, grantPermission, maxInputLengthforEmail, setCookie } from '../../_services/common.service';
import { noteInfoService } from '../../_services/noteinfo.service';
import { AcInput, AcButton, ValT } from '../UiComponents/AcImports';

import { logoutAction } from '../../actions/auth/login_action';

//import i18n from "i18next";
import { withTranslation } from "react-i18next";
import "../../_translations/i18n";

import './signin.css';
import { store } from '../../store/store';
import { Routers } from '../../enums/routesEnums';
/**
 * main signin page 
 * redirects from landing page/ logout options or signin details not avaiable
 * using custom component AcInput, AcButton for inputs, buttons and signin options
 *
 * @class SignInComponent
 * @extends {React.Component}
 */
export class SignInComponent extends React.Component{
    _isMounted = false;

    constructor(props){
        super(props);
        this.state = {
            lobj:{}, //login object
            lval:{}, //login validate object - needs to acbutton validations
            isloadingsign: false,
        }

        this.signinBtnElement = React.createRef(); //using ref to trigger on keyenter
    }

    componentDidMount(){
        this._isMounted = true;
        document.body.classList.add("s-page"); //add class to body for background and page styling

        if(this._isMounted){
            //remove firebase token
            this.props.removeFirebaseToken();
            //clears redux states
            this.props.setResetState("logout");
            noteInfoService.noteInfo(null);
        }
    }

    componentWillUnmount(){
        this._isMounted = false;
        document.body.classList.remove("s-page"); //removes added class
    }
    //#SIN-H01 signin response from back
    handleSignin = (resp) => {
        if(resp && resp.status === true){
            this.props.handleSignObj(resp.extra);
            //
            setCookie("userUUid", resp.extra&&resp.extra.userUUID?resp.extra.userUUID:-1);
            let clogobj = resp.extra;
            var newState = store.getState();
            var curuserobj = (newState.signState && newState.signState.signinDetails ? newState.signState.signinDetails : null);
            // console.log(curuserobj);
            const permittedRolePages = (curuserobj && curuserobj.userRolls ? curuserobj.userRolls.userAccessService : []);
            var defaccesspage=permittedRolePages.length>0?permittedRolePages[0].serviceName:undefined;

            // let isUserRestricted = (curuserobj && curuserobj.userUUID === "53bd6158-b53c-4032-9855-b6a9d0481da9"?true:false);
            let isUserRestricted = false;

            //check privileges to check user allowed to planograms or task
            if (isUserRestricted){
                this.props.history.push("/masterplanograms");
            } else if(clogobj.isAiUser && grantPermission("manualcomp")){
                this.props.history.push("/manualcompliance");
            } 
            else if(grantPermission("planogram")){
                this.props.history.push(Routers.planograms);
                defaccesspage="planograms"
            } else if(grantPermission("taskfeed")){
                this.props.history.push(Routers.tasks);
                defaccesspage="tasks"
            } else if(grantPermission("products")){
                defaccesspage="products"
                this.props.history.push(Routers.products);
            } 
            else
            {
                if(defaccesspage){
                    this.props.history.push(defaccesspage);
                }else{
                    this.props.setResetState("logout");
                    alertService.error("Access denied");
                }
                
            }
            this.props.setHomePageval(defaccesspage)
        } else{
            alertService.error(this.props.t("INVALID_USERNAME_OR_PASSWORD"));
        }
    }
    //onkey enter trigger signin button
    handleEnterTrigger = (resp) => {
        this.signinBtnElement.click();
    }
    //loading anime set
    handleLoadingAnime = (resp) => {
        if(this._isMounted){
            this.setState({ isloadingsign: resp });
        }
    }

    render(){
        return (<>
            <Col className={"landing-overlay overlay2 "+(this.props.isRTL==="rtl"?"RTL":"")}></Col>
            <Col xs={12} className={"signin-maincontainer "+(this.props.isRTL==="rtl"?"RTL":"")} dir={this.props.isRTL}>
                <Col xs={12} md={5} className="landing-content signin-txtcontent d-none d-lg-block">
                    <h1>{this.props.t('nextgen')}<br/><small>{this.props.t('insaletec')}</small></h1>
                </Col>
                <Container>
                    <img src="assets/img/logo_o.png" className="landing-logo" alt="planigo logo"/>

                    <Col xs={12} md={8} lg={5} className={"signin-content "+(this.props.isRTL==="rtl"?"float-left":"float-right")}>
                        <Card>
                            <Card.Body>
                                <Link to="/landing"><ArrowLeftIcon className="back-link" size={32}/></Link>
                                <h3>{this.props.t('sintoacc')}</h3>
                                <Form>
                                    <Form.Group controlId="formBasicEmail" style={{marginTop:"25px"}}>
                                        <AcInput atype="text" eleid="frm_username" aid="username" aobj={this.state.lobj} avset={this.state.lval} aplace={this.props.t('formfield.email')} avalidate={[ValT.empty,ValT.email]} akeyenter={this.handleEnterTrigger} showlabel={true} autofocus={true} characterValidate={maxInputLengthforEmail} t={this.props.t} msg={this.props.t('Character.email')}/>
                                    </Form.Group>
                                    <div id="formBasicPassword" className={"form-group"}> {/*  style={{width:"60%"}} */}
                                        <AcInput atype="password" eleid="frm_password" aid="password" aobj={this.state.lobj} avset={this.state.lval} aplace={this.props.t('formfield.pass')} avalidate={[ValT.empty]} akeyenter={this.handleEnterTrigger} showlabel={true} validateString={true} msg={this.props.t('Character.password')}/>
                                    </div>

                                    <span style={{marginLeft: "-10px"}}><AcButton eleid="signinbtn" aref={input => this.signinBtnElement = input} avariant="primary" atype="button" asubmit={submitCollection.login} aobj={this.state.lobj} avalidate={this.state.lval} aresp={this.handleSignin} aloading={this.handleLoadingAnime}>{this.props.t('siginbtn')}</AcButton></span>
                                    {/* <label className="link-label text-right"><Link to="#">{this.props.t('formfield.forgetpw')}</Link></label> */}

                                    <Col className={"signinanime-overlay "+(this.state.isloadingsign?"show-anime":"")}>
                                        <Col className='text-center'>
                                            <div className="loadanime-content">
                                                <div className="anime-container animation-4">
                                                <div className="shape shape1"></div>
                                                <div className="shape shape2"></div>
                                                <div className="shape shape3"></div>
                                                <div className="shape shape4"></div>
                                                </div>
                                            </div>
                                        </Col>    
                                    </Col>
                                    
                                    <Col xs={12} className="newaccount-footer">
                                        <h4>
                                            <small>{this.props.t('noaccyet')}</small><br/>
                                            <Link to="#">{this.props.t('cnewacc')}</Link>
                                        </h4>
                                    </Col>

                                    <Col xs={12} className="landing-footer" style={{borderBottomLeftRadius:"15px",borderBottomRightRadius:"15px"}}>
                                        <ul className="list-inline" style={{width:"100%"}}>
                                            <li className="list-inline-item">{this.props.t('support')}</li>
                                            <li className="list-inline-item">{this.props.t('toservice')}</li>
                                            <li className="list-inline-item">{this.props.t('ppolicy')}</li>
                                            <li className="list-inline-item float-right d-none d-sm-block" style={{color:"#ccc",fontSize:"10px"}}>v{(this.props.globsettingobj && this.props.globsettingobj.current_web_version)?this.props.globsettingobj.current_web_version:cversion}</li>
                                        </ul>
                                    </Col>
                                </Form>
                            </Card.Body>
                        </Card>
                    </Col>
                </Container>
            </Col>
        </>);
    }
}

const mapDispatchToProps = dispatch => ({
    setResetState: (payload) => dispatch(logoutAction(payload)),
});

export default withTranslation()(withRouter(connect(null,mapDispatchToProps)(SignInComponent)));
