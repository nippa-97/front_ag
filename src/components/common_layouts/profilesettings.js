import React from 'react';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import { Col, Row, Button, Modal, Form } from 'react-bootstrap';
import { withTranslation } from "react-i18next";
import FeatherIcon from 'feather-icons-react';

import { alertService } from '../../_services/alert.service';
import { submitCollection } from '../../_services/submit.service';
import { usrLevels } from '../../_services/common.service';

import { submitSets } from '../UiComponents/SubmitSets';

import { logoutAction } from '../../actions/auth/login_action';
/**
 * profile settings page using to show user details and update password
 *
 * @class ProfileSettingsComponent
 * @extends {React.Component}
 */
export class ProfileSettingsComponent extends React.Component{
    _isMounted = false;

    constructor(props){
        super(props);
        this.state = {
            userdetails: null,
            isshowmodal: false, sobj: this.defaultValuesLoad(),

            tabtype: "tab1",
        }
    }
      
    componentDidMount(){
        this._isMounted = true;

        if(this._isMounted){
            //get user details
            if(this.props.signedDetails && this.props.signedDetails.signinDetails && Object.keys(this.props.signedDetails.signinDetails).length > 0){
                this.setState({ userdetails: this.props.signedDetails.signinDetails });
            }
        }
    }

    componentWillUnmount(){
        this._isMounted = false;
    }
    //default password change object
    defaultValuesLoad = () => {
        return {oldPassword: "", newPassword: "", confirmPassword: ""};
    }
    //password change modal toggle
    handleResetPwToggle = () => {
        this.setState({ isshowmodal: !this.state.isshowmodal, sobj: this.defaultValuesLoad() });
    }
    //onchange password reset saveobject, ctype-object key, cval-current value
    handleChangeReset = (cval,ctype) => {
        var cobj = this.state.sobj;
        cobj[ctype] = cval
        this.setState({ sobj: cobj });
    }
    //validate and save change password
    handleUpdatePw = () => {
        var oldPassword = (this.state.sobj.oldPassword?this.state.sobj.oldPassword.trim():"");
        var newPassword = (this.state.sobj.newPassword?this.state.sobj.newPassword.trim():"");
        var confirmPassword = (this.state.sobj.confirmPassword?this.state.sobj.confirmPassword.trim():"");

        if(oldPassword === ""){
            alertService.error(this.props.t("OLDPASSWORD_REQ"));
            return false;
        }
        if(newPassword === "" || newPassword.length < 4){
            alertService.error(this.props.t("NEWPW_REQ_MIN4LENGTH"));
            return false;
        }
        if(confirmPassword === ""){
            alertService.error(this.props.t("CONFIRM_PW_REQ"));
            return false;
        }

        if(oldPassword === newPassword){
            alertService.error(this.props.t("NEWPW_CANNOT_SAME_OLD"));
            return false;
        }

        if(newPassword !== confirmPassword){
            alertService.error(this.props.t("CONFIRM_PW_DOESNT_MATCH_NEWPW"));
            return false;
        }

        //add additional obj keys
        const saveobj = this.state.sobj;
        saveobj["logoutFromOtherDevice"] = true;

        submitSets(submitCollection.userresetpw, saveobj, false, null, true).then(res => {
            if (res && res.status) {
                alertService.success(this.props.t("New_password_details_successfully_saved"));
                this.handleLogout();
            } else {
                // alertService.error(res&&res.extra&&res.extra!==""?res.extra:"Error occurred");
            }
        });
    }
    //after save logout
    handleLogout = () => {
        this.props.setLogoutState("logout");
        this.props.handleSignObj(null);
        this.props.history.push("/signin");
    }
    //toggle tab type
    toggleTabType = (ctype) => {
        this.setState({ tabtype: ctype });
    }


    render(){
        let { tabtype } = this.state;

        return (<>
            <Col xs={12} className={"main-content "+(this.props.isRTL==="rtl"?"RTL":"")} dir={this.props.isRTL}>
                <Col xs={12} className="userprofile-container">
                    {this.state.userdetails?<>
                        <Col xs={12} sm={10} md={8} className="col-centered">
                            <h4>{this.props.t("personaldet")}<br/> <small>{this.props.t("CHANGE_PROFILESETTING")}</small></h4>
                            <Col xs={12} className="uprofile-subcomponent">
                                <Row>
                                    <Col xs={3} className='menuitem-list'>
                                        <ul>
                                            <li onClick={() => this.toggleTabType("tab1")} className={tabtype === "tab1"?'active':''}><FeatherIcon icon="user" size={16} /> {this.props.t("PROFILE")}</li>
                                            <li onClick={() => this.toggleTabType("tab2")} className={tabtype === "tab2"?'active':''}><FeatherIcon icon="lock" size={16} /> {this.props.t("formfield.pass")}</li>
                                            {/* <li onClick={() => this.toggleTabType("tab3")} className={tabtype === "tab3"?'active':''}><FeatherIcon icon="bell" size={16} /> Notifications</li> */}
                                        </ul>
                                    </Col>
                                    <Col xs={9} className='menu-content'>
                                        {tabtype === "tab1"?<>
                                            <h5 style={{marginTop: "5px"}}>{this.props.t("PROFILE_INFO")}</h5>
                                            <Row>
                                                <Col xs={12} lg={6}>
                                                    <label>{this.props.t("FIRST_NAME")}</label>
                                                    <p>{this.state.userdetails.userDto?this.state.userdetails.userDto.fName:"-"}</p>
                                                </Col>
                                                <Col xs={12} lg={6}>
                                                    <label>{this.props.t("LAST_NAME")}</label>
                                                    <p>{this.state.userdetails.userDto?this.state.userdetails.userDto.lName:"-"}</p>
                                                </Col>
                                            </Row>
                                            <Col xs={12}>
                                                <label>{this.props.t("formfield.email")}</label>
                                                <p>{this.state.userdetails.userDto?this.state.userdetails.userDto.email:"-"}</p>
                                            </Col>
                                            <Row>
                                                {this.state.userdetails.userRolls && (this.state.userdetails.userRolls.userLevel === usrLevels.RG || this.state.userdetails.userRolls.userLevel === usrLevels.ST || this.state.userdetails.userRolls.userLevel === usrLevels.DP)?<>
                                                    <Col xs={12} lg={6}>
                                                        <label>{this.props.t("region")}</label>
                                                        <p>{this.state.userdetails.userRolls.regionName}</p>
                                                    </Col>
                                                </>:<></>}
                                                {this.state.userdetails.userRolls && (this.state.userdetails.userRolls.userLevel === usrLevels.ST || this.state.userdetails.userRolls.userLevel === usrLevels.DP)?<>
                                                    <Col xs={12} lg={6}>
                                                        <label>{this.props.t("STORE_NAME")}</label>
                                                        <p>{this.state.userdetails.userRolls.storeName}</p>
                                                    </Col>
                                                </>:<></>}
                                                <Col xs={12} lg={6}>
                                                    <label>{this.props.t("ROLE")}</label>
                                                    <p>{this.state.userdetails.userRolls?this.state.userdetails.userRolls.name:"-"}</p>
                                                </Col>
                                            </Row>
                                            {/* <Col className={this.props.isRTL==="rtl"?"text-left":"text-right"}>
                                                <Button variant="danger" onClick={this.handleResetPwToggle} size="sm" style={{borderRadius:"25px", padding:"5px 15px"}}>{this.props.t("resetpassword")}</Button>
                                            </Col> */}  
                                        </>:tabtype === "tab2"?<>
                                            <Col xs={12} md={7} className='reserpw-form'>
                                                <h5>{this.props.t("changepw")}</h5>
                                                <Form>
                                                    <label>{this.props.t("oldpw")}</label>
                                                    <Form.Control id="curpassword" type="password" value={this.state.sobj.oldPassword} onChange={ e => this.handleChangeReset(e.target.value,"oldPassword") } autoComplete="new-password" />
                                                    <label>{this.props.t("newpw")}</label>
                                                    <Form.Control id="newpassword" type="password" value={this.state.sobj.newPassword} onChange={ e => this.handleChangeReset(e.target.value,"newPassword") } autoComplete="new-password" />
                                                    <label>{this.props.t("confirmpw")}</label>
                                                    <Form.Control id="conpassword" type="password" value={this.state.sobj.confirmPassword} onChange={ e => this.handleChangeReset(e.target.value,"confirmPassword") } autoComplete="new-password" />    
                                                </Form>

                                                <Button id="updatepwbtn" variant="success" size="sm" onClick={ () => { this.handleUpdatePw() }} style={{borderRadius:"25px", padding:"5px 15px"}}>{this.props.t("btnnames.update")}</Button>
                                            </Col>
                                        </>:<>
                                        
                                        </>}      
                                    </Col>
                                </Row>
                            </Col>
                        </Col>
                    </>:<></>}
                </Col>
            </Col>

            <Modal show={this.state.isshowmodal} centered animation={false} dir={this.props.isRTL} className="reserpw-modal ps" onHide={ e => { this.handleResetPwToggle() }}>
                <Modal.Header>
                <Modal.Title>{this.props.t("changepw")}</Modal.Title>
                </Modal.Header>
                {/* <Modal.Body>
                    <Form>
                        <label>{this.props.t("oldpw")}</label>
                        <Form.Control id="curpassword" type="password" value={this.state.sobj.oldPassword} onChange={ e => this.handleChangeReset(e.target.value,"oldPassword") } autoComplete="new-password" />
                        <label>{this.props.t("newpw")}</label>
                        <Form.Control id="newpassword" type="password" value={this.state.sobj.newPassword} onChange={ e => this.handleChangeReset(e.target.value,"newPassword") } autoComplete="new-password" />
                        <label>{this.props.t("confirmpw")}</label>
                        <Form.Control id="conpassword" type="password" value={this.state.sobj.confirmPassword} onChange={ e => this.handleChangeReset(e.target.value,"confirmPassword") } autoComplete="new-password" />    
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button id="updatepwbtn" variant="success" size="sm" onClick={ () => { this.handleUpdatePw() }} style={{borderRadius:"25px", padding:"5px 15px"}}>{this.props.t("btnnames.update")}</Button>
                    <Button id="resetpwbtn" variant="secondary" size="sm" onClick={ () => { this.handleResetPwToggle() }} style={{borderRadius:"25px", padding:"5px 15px"}}>{this.props.t("btnnames.close")}</Button>
                </Modal.Footer> */}
            </Modal>
        </>);
    }
}

const mapDispatchToProps = dispatch => ({
    setLogoutState: (payload) => dispatch(logoutAction(payload)),
});

export default withTranslation()(withRouter(connect(null,mapDispatchToProps)(ProfileSettingsComponent)));
