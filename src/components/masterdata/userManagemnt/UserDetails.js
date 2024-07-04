import React, { Component } from 'react'
import { Link, withRouter } from 'react-router-dom';
import { Col, Button, Breadcrumb, Row, Form, Modal, Badge, FormSelect } from 'react-bootstrap'
import MDSidebarMenu from '../../common_layouts/mdsidebarmenu';
import { withTranslation } from 'react-i18next';
import { connect } from "react-redux";
import { confirmAlert } from 'react-confirm-alert';
import { SyncIcon, XIcon } from '@primer/octicons-react'; //EyeIcon, EyeClosedIcon
import { CopyToClipboard } from 'react-copy-to-clipboard';

import { setUserPrevDetails } from '../../../actions/users/users_actions';

import './UserDetails.scss';

import { submitSets } from '../../UiComponents/SubmitSets';
import { emailvalidator } from '../../UiComponents/ValidateSets';
import { submitCollection } from '../../../_services/submit.service';
import { alertService } from '../../../_services/alert.service';
import { countTextCharacter, makeUniqueID, usrRoles, preventinputophone, preventinputToString, maxInputLengthforEmail, preventinputToEmail } from '../../../_services/common.service';
import { isValidPhoneNumber,AsYouType } from 'libphonenumber-js';
import { AcViewModal } from '../../UiComponents/AcImports'
import * as isoCountries from 'i18n-iso-countries';
isoCountries.registerLocale(require("i18n-iso-countries/langs/he.json"));
isoCountries.registerLocale(require("i18n-iso-countries/langs/en.json"));

export class UserDetails extends Component {
    _isMounted = false;
    loggedUser = {};
    constructor(props) {
        super(props);

        this.state = {
            isedit: false,
            isDepartment: false,
            sobj: this.defaultSaveObject(), isshowpw: false, 
            isshowresetmodal: false, resettedpw: "",
            roles: [], usergroupslist: [], selectedGroup: -1,
            regions: [],
            branches: [],
            displayRegions: false,
            displayBranch: false,
            displayDepartment: false,
            countryCodes:[],
            prevpagedetails: null,
            errors:{},
            isUpdated: false,
            savemodalshow: false,
        }
    }

    componentDidMount() {
        this._isMounted = true;
        this.loggedUser = this.props.signedDetails.signinDetails.userRolls

        if (this._isMounted) {
            var cisedit = (this.props.userDetails && this.props.userDetails.selecteduserDetails ? true : false);
            let prepagedetails = (this.props.userDetails && this.props.userDetails.userPrevPage?this.props.userDetails.userPrevPage:null);

            this.setState({
                isedit: cisedit,
                prevpagedetails: prepagedetails,
            }, () => {
                this.loadsaveobj();
            });
        }
    
        const countries = isoCountries.getAlpha2Codes();
        let tempobj = [];
        for (const key in countries) {
            tempobj.push({'key':key,'value':countries[key]})
        }
        this.setState({
            countryCodes:tempobj
        })

    }
    loadsaveobj = () => {
        var csobj = this.defaultSaveObject();

        if (this.state.isedit) {
            csobj = this.props.userDetails.selecteduserDetails;
            this.loadBranches(csobj.regionId)
        }
        
        this.setState({ sobj:  csobj}, () => {
            this.loadRoles();
            this.loadUserGroups();
        });
    }

    defaultSaveObject = () => {
        return { firstName: "",email:"", lastName: "", phone: "", regionId: null, roleId: -1, branchId: null, isNew: true, isResetPassword:false, userLevel: "", password: makeUniqueID(4), departments: [], userHasGroupDto: [] ,countryCode:this.props.countryCode?this.props.countryCode:"AF" ,address:""};
    }

    handlecheck = () => {
        var departmant;
        if (this.state.isDepartment === true) {
            departmant = false
        } else {
            departmant = true
        }
        this.setState({ isDepartment: departmant })
    }

    loadRoles = () => {
        submitSets(submitCollection.getUserRoles).then(res => {
            this.setState({ roles: res.extra }, () => {
                if(this.state.isedit){
                    this.handleroleChange(this.state.sobj.roleId);
                }
            });
        });
    }
    //get user groups
    loadUserGroups = () => {
        submitSets(submitCollection.findGroupOnly,{ groupId:"", isReqPagination:false }).then(res => {
            if(res && res.status && res.extra.length > 0){
                this.setState({ usergroupslist: res.extra });
            }
        });
    }

    editrole = (evtval) => {
        this.setState({ isUpdated: true });
        this.handleroleChange(evtval);
    }

    //#USR-H01
    handleroleChange = (evtval) => {
      
        if(evtval > -1){
            var cobj = this.state.sobj;
            const rid = evtval;
            //console.log(this.state.roles);
            var Role = this.state.roles.find(x => x.roleId === parseInt(rid));
           
            cobj["roleId"] = (Role&&Role.roleId?evtval:-1);
            cobj["userLevel"] = (Role&&Role.rollUserLevel?Role.rollUserLevel:-1);
            //console.log(Role);
            this.setState({ sobj: cobj }, () => {
                const id = this.state.sobj.roleId;
                var selectedRole = this.state.roles.find(x => x.roleId === parseInt(id));

                //console.log(selectedRole);
                if (this.loggedUser.userLevel === "Chain") {
                    var region = this.state.displayRegions;
                    var branch = this.state.displayBranch;
                    var dep = this.state.displayDepartment;

                    if (selectedRole && (selectedRole.rollUserLevel === "Chain")) {
                        region = false;
                        branch = false;
                        dep = false;
                    } else{
                        if (selectedRole && (selectedRole.rollUserLevel === "Region")) {
                            region = true;
                            branch = false;
                            dep = false;
                        } else{
                            if (selectedRole && (selectedRole.rollUserLevel === "Store")) {
                                region = true;
                                branch = true;
                                dep = true;
                            } else {
                                region = false;
                                branch = false;
                                dep = false;
                            }
                        }
                    }
                    this.loadRegions(region, branch, dep);

                } else if (this.loggedUser.userLevel === "Region" || this.loggedUser.userLevel === "Store") {
                    if (selectedRole && (selectedRole.rollUserLevel === "Store")) {
                        region = true;
                        branch = true;
                        dep = true;
                    } else {
                        region = false;
                        branch = false;
                        dep = false;
                    }

                    this.loadRegions(region, branch, dep);
                }
            });
        }
    }
    handleCountryCode = (text)=>{
        let sobj = this.state.sobj;
        if(text !== ""){
            sobj.countryCode = text
            this.setState({
                sobj:sobj,
                isUpdated: true
            },()=>{
                if(this.state.sobj.phone !== ""){
                    let cobj = this.state.sobj;
                    cobj['phone'] =  new AsYouType(this.state.sobj.countryCode).input(this.state.sobj.phone);
                    this.setState({
                        sobj:cobj
                    },()=>{
                        this.validateField("phone",this.state.sobj.phone)
                    })
                }
            })
        }
        
    }
    loadRegions = (region, branch, dep) => {
        //console.log(region, branch, dep);
        this.setState({ displayRegions: region, displayBranch: branch, displayDepartment: dep }, () => {
            if (region === true) {
                submitSets(submitCollection.getRegions, { filterOpt: "", isReqPagination: false }, true).then(res => {
                    this.setState({ regions: res.extra });
                });
            }
        });
    }

    handleRegionChange = (evt) => {
        //console.log(evt.target.value);
        var oldid = this.state.sobj.regionId;
        var cobj = JSON.parse(JSON.stringify(this.state.sobj));
        //console.log(cobj);
        
        if(evt.target.value > 0){
            const id = this.state.sobj.roleId;
            var selectedRole = this.state.roles.find(x => x.roleId === parseInt(id));

            if(selectedRole.systemUserRoleType === usrRoles.RM){
                cobj["regionId"] = evt.target.value;
                this.setState({ sobj: cobj, isUpdated: true }, () => {
                    this.checkRSHasUser(1,evt.target.value,cobj,(isallow) => {
                        if(isallow){
                            confirmAlert({
                                title: this.props.t('CONFIRM_TO_CHANGE_USER_REGION'),
                                message: this.props.t('THIS_HAVE_REGION_MANAGER_SURE_TO_SET'),
                                overlayClassName: (this.props.isRTL === "rtl" ? "alertrtl-content" : ""),
                                buttons: [{
                                    label: this.props.t('btnnames.yes')
                                }, {
                                    label: this.props.t('btnnames.no'),
                                    onClick: () => {
                                        cobj["regionId"] = (oldid?oldid:-1);
                                        this.setState({ sobj: cobj });                    
                                    }
                                }]
                            });
                        }
                    });    
                });                
            } else{
                cobj["regionId"] = evt.target.value;
                var regionid = evt.target.value;
                this.setState({ sobj: cobj }, () => {
                    this.loadBranches(regionid)
                });         
            }
        } else{
            cobj["regionId"] = evt.target.value;
            this.setState({ sobj: cobj });         
        }
    }

    checkRSHasUser = (ctype,cval,cobj,_callback) => {
        var checkid = "/"+cval;
        var savepath = submitCollection.checkRegionHasManager;
        if(ctype === 2){
            savepath = submitCollection.checkBranchHasManager;
        }

        submitSets(savepath, checkid, true).then(res => {
            //console.log(res);
            if(res && res.status && res.extra && typeof res.extra !== "string"){
                _callback(ctype === 2?res.extra.branchManagerExist:res.extra.regionManagerExist);
            } else{
                _callback(undefined);
            }
        });
    }

    loadBranches = (regionid) => {
        submitSets(submitCollection.getUserBranches, "?regionId=" + (regionid), true).then(res => {
            this.setState({ branches: res.extra });
        });
    }

    handleBranch = (evt) => {
        //console.log(evt.target.value);
        var oldid = this.state.sobj.branchId;
        var cobj = JSON.parse(JSON.stringify(this.state.sobj));
        
        if(evt.target.value > 0){
            const id = this.state.sobj.roleId;
            var selectedRole = this.state.roles.find(x => x.roleId === parseInt(id));

            if(selectedRole.systemUserRoleType === usrRoles.SM){
                cobj["branchId"] = evt.target.value;
                this.setState({ sobj: cobj, isUpdated: true }, () => {
                    this.checkRSHasUser(2,evt.target.value,cobj,(isallow) => {
                        if(isallow){
                            confirmAlert({
                                title: this.props.t('CONFIRM_TO_CHANGE_USER_BRANCH'),
                                message: this.props.t('CONFIRM_TO_CHANGE_USER_BRANCH_MESSAGE'),
                                overlayClassName: (this.props.isRTL === "rtl" ? "alertrtl-content" : ""),
                                buttons: [{
                                    label: this.props.t('btnnames.yes')
                                }, {
                                    label: this.props.t('btnnames.no'),
                                    onClick: () => {
                                        cobj["branchId"] = (oldid?oldid:-1);
                                        this.setState({ sobj: cobj });                    
                                    }
                                }]
                            });
                        }
                    });    
                });                
            } else{
                cobj["branchId"] = evt.target.value;
                this.setState({ sobj: cobj });         
            }
        } else{
            cobj["branchId"] = evt.target.value;
            this.setState({ sobj: cobj });         
        }
    }

    handleinputs = (evt, type,msg) => {
        var cobj = this.state.sobj;
        // cobj[type] = evt.target.value;
        // this.setState({ sobj: cobj });

        // let input = evt.target;
        // let errors = this.validateInput(input, false);
        // this.setState({ ...this.state, [input.name]: input.value, errors: errors });
        if(type !== "email"){
            if(!preventinputToString(evt,evt.target.value,msg)){
                evt.preventDefault()
                return
            }
        }
        if(type === "email" || type === "phone"){
            if(type === "phone"){
                cobj[type] = new AsYouType(this.state.sobj.countryCode).input(evt.target.value);
            }else if (type === "email" ){
                const inputValue = evt.target.value;
                const atSymbolCount = (inputValue.match(/@/g) || []).length;
                let length = countTextCharacter(evt.target.value);
                if(atSymbolCount > 1){
                    evt.preventDefault()
                    return
                }
                if(length >= maxInputLengthforEmail){
                   alertService.error(this.props.t('Character.email')) 
                    evt.preventDefault()
                    return
                }
                cobj[type] = evt.target.value;
            }
        }else{
            cobj[type] = evt.target.value;
        }
     
        this.setState({ sobj: cobj, isUpdated: true});
    }
    //on blur
    // onBlur = (e, issetname, nametxt) => {
    //     let input = e.target;
    //     this.setState({ ...this.state, [(issetname ? nametxt : input.name)]: input.value });
    //     if (!input.contains(document.activeElement)) {
    //     let errors = this.validateInput(input, issetname, nametxt); // run validation against this input, and return error object
    //     this.setState({ errors: errors }); // update state with returned errors
    //     }
    // };

    handlesave = (type,isresetpw) => {
        var newobj = this.state.sobj;
        this.setState({ sobj: newobj }, () => {
            //console.log(this.state.sobj);
        });
        if (this.state.sobj) {
            var csobj = this.state.sobj;
            if(!isresetpw){

                if(type === 2 && !this.state.isUpdated){
                    alertService.warn(this.props.t('NO_CHANGES_AVAILABLE'));
                    return false;
                }

                if (!this.state.sobj.firstName || this.state.sobj.firstName === "") {
                    alertService.error(this.props.t('firstnamerequired'));
                    return false;
                }
                if (!this.state.sobj.lastName || this.state.sobj.lastName === "") {
                    alertService.error(this.props.t('lastNamerequired'));
                    return false;
                }
                if (!this.state.sobj.phone || this.state.sobj.phone === "") {
                    alertService.error(this.props.t('phonerequired'));
                    return false;
                }

                if(!isValidPhoneNumber(this.state.sobj.phone, this.state.sobj.countryCode)){
                    alertService.error(this.props.t("entervalidtelephone"));
                    return false;
                }

                if (!this.state.sobj.email || this.state.sobj.email === "") {
                    alertService.error(this.props.t('emailrequired'));
                    return false;
                }

                if(!emailvalidator(this.state.sobj.email)){
                    alertService.error(this.props.t('entervalidemail'));
                    return false;
                }

                if (!this.state.sobj.address || this.state.sobj.address === "") {
                    alertService.error(this.props.t('addressrequired'));
                    return false;
                }
                //#USR-H02
                if (!this.state.sobj.roleId || this.state.sobj.roleId < 0) {
                    alertService.error(this.props.t('rolerequ'));
                    return false;
                }
                if (this.state.displayRegions && (!this.state.sobj.regionId || this.state.sobj.regionId < 0)) {
                    alertService.error(this.props.t('regionIdrequ'));
                    return false;
                }
                if (this.state.displayBranch && (!this.state.sobj.branchId || this.state.sobj.branchId < 0)) {
                    alertService.error(this.props.t('branchreqrequ'));
                    return false;
                }
                //check pw if new
                if(!this.state.isedit && (!this.state.sobj.password || this.state.sobj.password.length < 4)){
                    alertService.error(this.props.t('passrequired'));
                    return false;
                }
            }
             
            //console.log("sent");
            if (type === 1) {
                this.updtatesavedelete(csobj, type);
            }
            if (type === 3) {
                var cobj = this.state.sobj;
                cobj["isDelete"] = true;
                this.setState({ sobj: cobj })
                //console.log("delete");
                confirmAlert({
                    title: this.props.t('CONFIRM_TO_DELETE_USER'),
                    message: this.props.t('CONFIRM_TO_DELETE_USER_MESSGAE'),
                    overlayClassName: (this.props.isRTL === "rtl" ? "alertrtl-content" : ""),
                    buttons: [{
                        label: this.props.t('btnnames.yes'),
                        onClick: () => {
                            this.updtatesavedelete(csobj, type);
                        }
                    }, {
                        label:  this.props.t('btnnames.no'),
                        onClick: () => {
                            return false;
                        }
                    }]
                });
            } else{
                if (type === 2) {
                    var cobj2 = this.state.sobj;
                    cobj2["isNew"] = false;
                    cobj2["isResetPassword"] = false;
                    if(isresetpw){
                        cobj2["isResetPassword"] = true;
                    }
                    this.setState({ sobj: cobj2, isUpdated: false})
                    this.updtatesavedelete(csobj, type, isresetpw);
                }
            }
        }

    }

    updtatesavedelete = (csobj, type, isresetpw) => {
        this.setState({ savemodalshow: true }, () => {
            submitSets(submitCollection.UserCrud, csobj, true).then(res => {
                //console.log(res);
                this.setState({ savemodalshow: false });
                if (res && res.status) {
                    if(isresetpw){
                        alertService.success(this.props.t('SUCCESSFULL_UPDATE_PASSWORD'));
                        this.setState({ resettedpw: csobj.password, isshowresetmodal: true});
                    } else{
                        let cprevdetails = this.state.prevpagedetails;
                        if(cprevdetails){
                            cprevdetails["viewtype"] = (type === 3?"delete":type === 2?"update":"new");
                            this.props.setPrevDetails(cprevdetails);
                        }
                        
                        alertService.success((type === 3?this.props.t("DELETE_USER_DETAILS"):type === 2?this.props.t("SAVE_USER_DETAILS"):this.props.t("UPDATE_USER_DETAILS")));
                        this.props.history.push("/users");    
                    }
                    
                } else {
                    // alertService.error(res&&res.extra&&res.extra!==""?res.extra:(this.props.t('ERROR_OCCURRED_IN') + (type === 3 ? "delete" : type === 2 ? "update" : "save") + " process"));

                    if(res && !res.status && res.validation){

                        let codeMessage = res.validation.code;

                        if(res.validation.msgParams && res.validation.msgParams.length > 0){
                            let filledMsg = codeMessage.replace(/\[\$\]/g, () => res.validation.msgParams.shift());
                            res.validation.type === "error" ? alertService.error(this.props.t(filledMsg)) : alertService.warn(this.props.t(filledMsg));
                        }else{
                            res.validation.type === "error" ? alertService.error(this.props.t(codeMessage)) : alertService.warn(this.props.t(codeMessage));
                        }

                    }else{
                        alertService.error(this.props.t('ERROR_OCCURRED_IN')+(type===3?this.props.t("btnnames.delete"):type===2?this.props.t("btnnames.update"):this.props.t("btnnames.save")));
                    }
                }
            });
        });
    }

    toggleHiddenPW = () => {
        var cviewobj = this.state.sobj;
        cviewobj["hiddenpw"] = (!this.state.isshowpw?cviewobj.password:("**"+cviewobj.password.slice(-2)));
        this.setState({ isshowpw: !this.state.isshowpw, sobj: cviewobj });
    }
    //copy pw to clipboard
    copyToClipboard = (ctxt) => {
        alertService.info(this.props.t("COPIED_TO_CLIP_BOARD"));
    }
    //handle reset pw
    handleresetpw = () => {
        confirmAlert({
            title: this.props.t('CONFIRM_RESET_USERPASSWORD'),
            message: this.props.t('CONFIRM_RESET_USERPASSWORD_MESSAGE'),
            overlayClassName: (this.props.isRTL === "rtl" ? "alertrtl-content" : ""),
            buttons: [{
                label: this.props.t('btnnames.yes'),
                onClick: () => {
                    var cviewobj = this.state.sobj;
                    cviewobj["password"] = makeUniqueID(4);

                    this.setState({ sobj: cviewobj }, () => {
                        this.handlesave(2,true);
                    });
                }
            }, {
                label: this.props.t('btnnames.no')
            }]
        });
    }
    //handdle reset pwmodal
    handleResetPwToggle = () => {
        this.setState({ isshowresetmodal: !this.state.isshowresetmodal }, () => {
            this.backLinkSet("/users", true);
        });
    }
    //generate new pw 
    generateNewPw = () => {
        const csobj = this.state.sobj;
        csobj["password"] = makeUniqueID(4);

        this.setState({ sobj: csobj });
    }
    //handle add new user group
    handleGroupAdd = (cidx) => {
        if(cidx > -1){
            const groupobj = this.state.usergroupslist[cidx];
            const csaveobj = this.state.sobj;
            //find already exists
            const isalreadyadded = csaveobj.userHasGroupDto.findIndex(x => x.groupDto.id === groupobj.id);
            if(isalreadyadded === -1){
                csaveobj.userHasGroupDto.push({ id: 0, groupDto: groupobj, isDelete: false, isNew: true });
                this.setState({ sobj: csaveobj, selectedGroup: -1, isUpdated: true});
            } else{
                alertService.error("Already existing");
            }
        } else{
            this.setState({ selectedGroup: -1 });
        }
    }
    //handle groups remove 
    handleGroupRemove = (cidx) => {
        const csaveobj = this.state.sobj;
        const groupobj = csaveobj.userHasGroupDto[cidx];
        
        if(groupobj.id > 0){
            groupobj.isDelete = true;
        } else{
            csaveobj.userHasGroupDto.splice(cidx,1);
        }
        this.setState({ sobj: csaveobj, isUpdated: true});
    }

    backLinkSet = (backpath, iscurrent) => {
        let cprevdetails = this.state.prevpagedetails;
        if(iscurrent && cprevdetails){
            let cprevdetails = this.state.prevpagedetails;
            cprevdetails["viewtype"] = "back";
            this.props.setPrevDetails(cprevdetails);
    
            this.props.history.push(backpath);
        }
    }
      // validation
  validateInput = (input, issetname, nametxt) => {
     console.log(input);
    let errors = this.state.errors;
    let validationType = (issetname ? nametxt : input.getAttribute("data-validation-type"));
    //console.log("input validation attr:"+ validationType);
    let errorName = (issetname ? nametxt : input.name) + "Error";
    errors[errorName] = "";
    if (!issetname && (input.value === "" || input.value.length === 0)) {
      errors[errorName] = this.props.t("fieldisrequired");
    } else if (validationType === "phone") {
        if (!this.state.sobj.phone || this.state.sobj.phone === "" || this.state.sobj.phone.length <= 8) {
        errors[errorName] = this.props.t("entervalidtelephone");
      }
    } else if (validationType === "email") {
        if (!this.state.sobj.email || this.state.sobj.email === "" || !emailvalidator(this.state.sobj.email)) {
        errors[errorName] = this.props.t("entervalidemail");
      }
    }
    return errors;
  }
    validateField = (key,value) =>{
        let errorObj = this.state.errors
        let msg = ""
        if(value === "" || value.length === 0){
         msg = (this.props.t('fieldisrequired'))
                
        }
        if(key === "email"){
            if(value !== "" &&  value.length > 0){
                if(!emailvalidator(value)){
                    msg = (this.props.t('entervalidemail'))
                }
            }
           
        }
        if(key === "phone"){
            if(value !== "" && value.length > 0){
                if(!(isValidPhoneNumber(value,this.state.sobj.countryCode))){
                    msg = (this.props.t('entervalidtelephone'))
                }
            }
        }
        
        errorObj[key] = msg; 
        this.setState({
            error:errorObj
        })
    }
    
    render() {
        var rolelist = (this.state.roles ? Object.keys(this.state.roles).map(x => {
            return <option key={x} value={this.state.roles[x].roleId}>{this.state.roles[x].name}</option>
        }) : <></>);
        var usergroupslist = (this.state.usergroupslist ? Object.keys(this.state.usergroupslist).map(x => {
            return <option key={x} value={x}>{this.state.usergroupslist[x].groupName}</option>
        }) : <></>);
        var regionList = (this.state.regions ? Object.keys(this.state.regions).map(x => {
            return <option key={x} value={this.state.regions[x].regionId}>{this.state.regions[x].name}</option>
        }) : <></>);
        var branchList = (this.state.branches ? Object.keys(this.state.branches).map(x => {
            return <option key={x} value={this.state.branches[x].branchId}>{this.state.branches[x].name}</option>
        }) : <></>);
       
        var countryList = this.state.countryCodes.map(x=>{
            return <option key={x.key} value={x.key}>{isoCountries.getName(x.key,(this.props.isRTL === "rtl" ? "he" : "en"))}</option>
        })
        return (<>
            <Col xs={12} className={"main-content " + (this.props.isRTL === "rtl" ? "RTL" : "")} dir={this.props.isRTL}>
                <div>
                    
                    <div>
                        <Row>
                            <MDSidebarMenu />
                            <Col xs={12} lg={10}>
                                <Breadcrumb dir="ltr">
                                    {this.props.isRTL === "rtl" ? <>
                                        <Breadcrumb.Item active>{this.props.t('details')}</Breadcrumb.Item>
                                        <li className="breadcrumb-item"><Link to="/users" onClick={() => this.backLinkSet("/users", true)} role="button">{this.props.t('USERS')}</Link></li>
                                        <li className="breadcrumb-item"><Link to={"/"+this.props.HomePageVal} onClick={() => this.backLinkSet("/"+this.props.HomePageVal)} role="button">{this.props.t('home')}</Link></li>
                                    </> : <>
                                        <li className="breadcrumb-item"><Link to={"/"+this.props.HomePageVal} onClick={() => this.backLinkSet("/"+this.props.HomePageVal)} role="button">{this.props.t('home')}</Link></li>
                                        <li className="breadcrumb-item"><Link to="/users" onClick={() => this.backLinkSet("/users", true)} role="button">{this.props.t('USERS')}</Link></li>
                                        <Breadcrumb.Item active>{this.props.t('details')}</Breadcrumb.Item>
                                    </>}
                                </Breadcrumb>
                                <Col className="white-container additem-content userman-content">
                                    <Col xs={12} className='user-details'>
                                        <Col className="form-subcontent formvalidation" style={{ minHeight: "auto", marginTop:"0px" }}>
                                            <Row>
                                                <Col xs={12} md={4}>
                                                    <h5>{this.props.t("personaldet")}</h5>
                                                    <Form.Group>
                                                        <Form.Label >{this.props.t('FIRST_NAME')} <span style={{ color: "red" }}>*</span></Form.Label>
                                                        <Form.Control  id="firstname-text" size="sm" type="text" onChange={(e) => this.handleinputs(e, "firstName",this.props.t('Character.first_name'))} onBlur={(e)=>this.validateField("firstName",e.target.value)} value={this.state.sobj.firstName} onKeyDown={(e)=>preventinputToString(e,this.state.sobj.firstName,(this.props.t('Character.first_name')))}/>
                                                        <div className="errorMsg">{this.state.errors.firstName}</div>  
                                                    </Form.Group>
                                                    <div className="errorMsg">{this.state.errors.firstNameError}</div>
                                                    <Form.Group>
                                                        <Form.Label >{this.props.t('LAST_NAME')} <span style={{ color: "red" }}>*</span></Form.Label>
                                                        <Form.Control  size="sm" type="text" onChange={(e) => this.handleinputs(e, "lastName",this.props.t('Character.lastName'))} value={this.state.sobj.lastName} onBlur={(e)=>this.validateField("lastName",e.target.value)} onKeyDown={(e)=>preventinputToString(e,this.state.sobj.lastName,(this.props.t('Character.lastName')))} />
                                                        <div className="errorMsg">{this.state.errors.lastName}</div>  
                                                    </Form.Group>
                                                    <div className="errorMsg">{this.state.errors.lastNameError}</div>
                                                    <Form.Group>
                                                        <Form.Label >{this.props.t('telephone')} <span style={{ color: "red" }}>*</span></Form.Label>
                                                        <div className='d-flex gap-2'>
                                                            <div className='w-50'> 
                                                                <Form.Control  as="select" value={this.state.sobj.countryCode} onChange={(e) => this.handleCountryCode(e.target.value)}>
                                                                    {countryList}
                                                                </Form.Control>
                                                            </div>
                                                            <div className='w-50'>
                                                                <Form.Control size="sm" type="tel"  onChange={(e) => this.handleinputs(e, "phone",this.props.t('Character.telephone'))} onBlur={(e)=>this.validateField("phone",e.target.value)} value={this.state.sobj.phone} onKeyDown={(e)=>preventinputophone(e,this.state.sobj.phone,(this.props.t('Character.telephone')))}/>
                                                                <div className="errorMsg tel-error">{this.state.errors.phone}</div> 
                                                            </div>
                                                        </div>
                                   
                                                    </Form.Group>
                                                    <div className="errorMsg">{this.state.errors.phoneError}</div>
                                                    <Form.Group>
                                                        <Form.Label >{this.props.t('EMAIL')} <span style={{ color: "red" }}>*</span></Form.Label>
                                                        <Form.Control size="sm" type="email" required onChange={(e) => this.handleinputs(e, "email",this.props.t('Character.email'))} value={this.state.sobj.email}  onBlur={(e)=>this.validateField("email",e.target.value)} onKeyDown={(e)=> preventinputToEmail(e,this.state.sobj.email,this.props.t('Character.email'))}/>
                                                        <div className="errorMsg">{this.state.errors.email}</div>  
                                                    </Form.Group>
                                                    <div className="errorMsg">{this.state.errors.emailError}</div>
                                                    <Form.Group>
                                                        <Form.Label >{this.props.t('address')} <span style={{ color: "red" }}>*</span></Form.Label>
                                                        <Form.Control size="sm" as="textarea" rows={3} value={this.state.sobj.address} onChange={(e) => this.handleinputs(e, "address",this.props.t('Character.address'))} style={{height:"auto"}}  onBlur={(e)=>this.validateField("address",e.target.value)} onKeyDown={(e)=>preventinputToString(e,this.state.sobj.address,(this.props.t('Character.address')))}/>
                                                        <div className="errorMsg">{this.state.errors.address}</div>  
                                                    </Form.Group>
                                                    <div className="errorMsg">{this.state.errors.addressError}</div>
                                                </Col>
                                                <Col xs={12} md={4}>
                                                    <h5>{this.props.t("roletype")+"/"+this.props.t("location")}</h5>
                                                    {!this.state.isedit && <Col className="passwordfield-main">
                                                        {/* <Form.Group>
                                                            <Form.Label >{this.props.t('USER_NAME')}</Form.Label>
                                                            <Form.Control size="sm" type="text" onChange={(e) => this.handleHeight(e)} />
                                                        </Form.Group> */}
                                                        {/* <CopyToClipboard text={prod.barcode} onCopy={() => this.copyToClipboard()}></CopyToClipboard> */}
                                                        <Form.Group>
                                                            <Form.Label >{this.props.t('formfield.pass')} <span style={{ color: "red" }}>*</span></Form.Label>
                                                            <Col xs={12} style={{position:"relative"}}>
                                                                {/* <div className="hiddenpw-icon" onClick={this.toggleHiddenPW}>{this.state.isshowpw?<EyeClosedIcon size={14}/>:<EyeIcon size={14}/>}</div> */}
                                                                <div className="hiddenpw-icon" onClick={this.generateNewPw} title="generate new password"><SyncIcon size={14}/></div>
                                                                <Form.Control  size="sm" type="text" className="hiddenpw-text" onChange={(e) => this.handleinputs(e, "password",this.props.t('Character.password'))} value={this.state.sobj.password} autoComplete="new-password" onBlur={(e)=>this.validateField("password",e.target.value)} onKeyDown={(e)=>preventinputToString(e,this.state.sobj.password,(this.props.t('Character.password')))}/>
                                                            </Col>
                                                            <div className="errorMsg">{this.state.errors.password}</div>  
                                                        </Form.Group>
                                                    </Col>}
                                                    <Form.Group>
                                                        <Form.Label >{this.props.t('ROLE')} <span style={{ color: "red" }}>*</span></Form.Label>
                                                        <FormSelect value={this.state.sobj.roleId} onChange={(e) => this.editrole(e.target.value)}>
                                                            <option value="-1">{this.props.t("select")}</option>
                                                            {rolelist}
                                                        </FormSelect>
                                                    </Form.Group>
                                                    {this.state.displayRegions && <Form.Group>
                                                        <Form.Label >{this.props.t('region')} <span style={{ color: "red" }}>*</span></Form.Label>
                                                        <FormSelect value={this.state.sobj.regionId} onChange={(e) => this.handleRegionChange(e)}>
                                                            <option value="-1">{this.props.t("select")}</option>
                                                            {regionList}
                                                        </FormSelect>
                                                    </Form.Group>}
                                                    {this.state.displayBranch && <Form.Group>
                                                        <Form.Label >{this.props.t('BRANCH')} <span style={{ color: "red" }}>*</span></Form.Label>
                                                        <FormSelect onChange={(e) => this.handleBranch(e)} value={this.state.sobj.branchId}>
                                                            <option value="-1">{this.props.t("select")}</option>
                                                            {branchList}
                                                        </FormSelect>
                                                    </Form.Group>}
                                                    {/* {this.state.displayDepartment && <Form.Group className="departmentcheck">
                                                        <Form.Check type="checkbox" checked={this.state.isDepartment} onChange={this.handlecheck} />
                                                        <Form.Label >{this.props.t('DEPARTMENT')} </Form.Label>

                                                    </Form.Group>}
                                                    {this.state.isDepartment && <Card>

                                                        <FormSelect onChange={(e) => this.handlevchange(e, "uom")}>
                                                            <option value="-1">{this.props.t("select")}</option>
                                                        </FormSelect>
                                                        <Card.Body>
                                                            Snack <Button>-</Button>
                                                        </Card.Body>
                                                    </Card>} */}
                                                </Col>
                                                <Col xs={12} md={4}>
                                                    <h5>{this.props.t('usergroups')}</h5>
                                                    <Form.Group className="usergroups-main">
                                                        <select id="usergroups-select" className="form-control" value={this.state.selectedGroup} onChange={(e) => this.handleGroupAdd(e.target.value)} >
                                                            <option value="-1">{this.props.t("selagroup")}</option>
                                                            {usergroupslist}
                                                        </select>
                                                        
                                                        {this.state.sobj && this.state.sobj.userHasGroupDto && this.state.sobj.userHasGroupDto.length > 0?<>
                                                        <Form.Label style={{marginBottom:"5px",marginTop:"15px"}}>{this.props.t('addedgroups')}</Form.Label>
                                                        {this.state.sobj.userHasGroupDto.map((xitem, xidx) => {
                                                            return <React.Fragment key={xidx}>{!xitem.isDelete?<Badge className="group-badge" pill bg="default">{xitem.groupDto.groupName} 
                                                            <span className="remove-link" onClick={() => this.handleGroupRemove(xidx) }><XIcon size={12}/></span></Badge>:<></>}</React.Fragment>
                                                        })}</>:<></>}
                                                    </Form.Group>
                                                </Col>
                                            </Row>
                                        </Col>
                                        <Link to="/users" onClick={() => this.backLinkSet("/users", true)}><Button variant="light" type="button">{this.props.t('btnnames.back')}</Button></Link>
                                        {this.state.isedit ? <>
                                            <Button variant="success" className={"formview-btn " + (this.props.isRTL === "rtl" ? "float-left mx-2" : "float-right")} type="button" onClick={() => this.handlesave(2)}>{this.props.t('btnnames.update')}</Button>
                                            <Button variant="secondary" onClick={() => this.handleresetpw()} className={"formview-btn " + (this.props.isRTL === "rtl" ? "float-left mx-2" : "float-right")} type="button" style={{ marginRight: "10px" }}>{this.props.t('resetpassword')}</Button>
                                            <Button variant="danger" className={"formview-btn " + (this.props.isRTL === "rtl" ? "float-left" : "float-right")} type="button" onClick={() => this.handlesave(3)} style={{ marginRight: "15px" }}>{this.props.t('btnnames.delete')}</Button>
                                        </> : <Button variant="success" className={"formview-btn " + (this.props.isRTL === "rtl" ? "float-left" : "float-right")} type="button" onClick={() => this.handlesave(1)} >{this.props.t('btnnames.save')}</Button>}
                                    </Col>

                                </Col>    
                            </Col>
                        </Row>
                    </div>
                </div>
            </Col>

            <Modal show={this.state.isshowresetmodal} centered animation={false} className="reserpw-modal" onHide={ e => { this.handleResetPwToggle() }}>
                <Modal.Header>
                <Modal.Title>{this.props.t("New_User_Password")}</Modal.Title>
                </Modal.Header>
                <Modal.Body><CopyToClipboard text={this.state.resettedpw} onCopy={() => this.copyToClipboard()}><h2 className="text-center">{this.state.resettedpw}</h2></CopyToClipboard></Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" size="sm" onClick={ e => { this.handleResetPwToggle() }}>{this.props.t("btnnames.close")}</Button>
                </Modal.Footer>
            </Modal>

            <AcViewModal showmodal={this.state.savemodalshow} />
        </>)
    }
}

const mapDispatchToProps = dispatch => ({
    setPrevDetails: (payload) => dispatch(setUserPrevDetails(payload)),
  });

export default withTranslation()(withRouter(connect(null,mapDispatchToProps)(UserDetails)))
