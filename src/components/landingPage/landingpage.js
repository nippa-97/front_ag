import React from 'react';
import { Link, withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import {Button, Col, Container, Dropdown} from 'react-bootstrap';
import { ArrowRightIcon } from '@primer/octicons-react';

import { logoutAction } from '../../actions/auth/login_action';

import { langList } from '../../_services/common.service';
import { noteInfoService } from '../../_services/noteinfo.service';

import i18n from "i18next";
import { useTranslation } from "react-i18next";
import "../../_translations/i18n";

import './landingpage.css';

export const ViewLandingPage = (props) => {
    //current available language list
    var langOptList = langList.map((litem,lidx) => {
        return <Dropdown.Item href="#" key={lidx} onClick={e => props.handleLang(lidx,e)} >{litem.text}</Dropdown.Item>;
    });
    const { t } = useTranslation(); //translate object
    
    return (
      <>
        <Col className={"landing-overlay "+(props.isRTL==="rtl"?"RTL":"")}></Col>
        <Col xs={12} className="landing-main-container">
            <Col xs={12} className={"landing-inner-content "+(props.isRTL==="rtl"?"RTL":"")} dir={props.isRTL}>
                <Col xs={12} className="landing-content">
                    <h1><small>{t("letsmake")}</small><br/>{t("moreprofit")}</h1>

                    <h4>{t("createaccount")}</h4>
                    <Link to="/signin"><Button variant="warning" className="landing-gsbtn">{t("getstart")} <ArrowRightIcon size={24} /></Button></Link>
                </Col>
                <Container>
                    <img src="assets/img/logo_o.png" className="landing-logo" alt=""/>
                    <Dropdown>
                        <Dropdown.Toggle variant="success" id="dropdown-languagelist" style={{borderRadius:"25px",padding:"0px 25px",background:"linear-gradient(-45deg, rgb(76 226 172), rgb(44, 201, 144))",border:"none"}}> {props.selLang?props.selLang.text:""} </Dropdown.Toggle>
                        <Dropdown.Menu>{langOptList}</Dropdown.Menu>
                    </Dropdown>
                    <Link to="/signin"><Button variant="warning" className="landing-signlink">{t("siginbtn")}</Button></Link>

                </Container>
            </Col>
            <Col xs={12} className={"landing-footer "+(props.isRTL==="rtl"?"RTL":"")} dir={props.isRTL}>
                <ul className="list-inline" style={{marginLeft:"6rem"}}>
                    <li className="list-inline-item">{t("support")}</li>
                    <li className="list-inline-item">{t("toservice")}</li>
                    <li className="list-inline-item">{t("ppolicy")}</li>
                </ul>
            </Col>    
        </Col>
      </>
    );
};
/**
 * landing page component, home page of application 
 * landing when sign in details not available and not logout
 * landing from redirect page
 *
 * @class LandingPage
 * @extends {React.Component}
 */
export class LandingPage extends React.Component{
    _isMounted = false;
    constructor(props){
        super(props);
        this.state = {
            selectedLang: { code: "he", text: "Hebrew (עִברִית)" }, //default language
        }
    }

    componentDidMount(){
        this._isMounted = true;

        if(this._isMounted){
            document.body.classList.add("l-page"); //add class to body to background styles

            //if localstorage keeps language object
            if(localStorage.getItem("pglangobj")){
                const clangobj = JSON.parse(localStorage.getItem("pglangobj"));
                i18n.changeLanguage(clangobj.code);
            }
            
            //check saved language object available in redux
            if(localStorage.getItem("pglangobj")){
                var csellangobj = JSON.parse(localStorage.getItem("pglangobj"));
                this.setState({ selectedLang: csellangobj });
            }

            //remove firebase token
            //this.props.removeFirebaseToken();
            //clears redux states
            this.props.setResetState("logout");
            noteInfoService.noteInfo(null);
        }
    }

    componentWillUnmount(){
        this._isMounted = false;
        document.body.classList.remove("l-page"); //removes added class when going from landing page
    }
    //when change language update redux and localstorage
    handleLang = (lcode, evt) => {
        evt.preventDefault();
        this.setState({ selectedLang: langList[lcode]});
        i18n.changeLanguage(langList[lcode].code);
        this.props.handleLangObj(langList[lcode]);
        localStorage.setItem("pglangobj",JSON.stringify(langList[lcode]));
    }

    render(){
        //landing page view contents
        return (<ViewLandingPage handleLang={this.handleLang} selLang={this.state.selectedLang} {...this.props}/>);
    }
}

const mapDispatchToProps = dispatch => ({
    setResetState: (payload) => dispatch(logoutAction(payload)),
});

export default withRouter(connect(null,mapDispatchToProps)(LandingPage));
