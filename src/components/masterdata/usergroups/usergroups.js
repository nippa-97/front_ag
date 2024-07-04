import React from 'react';
import { Link, withRouter } from 'react-router-dom';
import {Breadcrumb, Button, Col, Form, Modal, Row, ListGroup, Badge, FormSelect} from 'react-bootstrap';
import Select from 'react-select';
import { XIcon, FilterIcon } from '@primer/octicons-react';
import { confirmAlert } from 'react-confirm-alert';

import {  withTranslation } from "react-i18next";
import "../../../_translations/i18n";

import { submitCollection } from '../../../_services/submit.service';
import { alertService } from '../../../_services/alert.service';
import { submitSets } from '../../UiComponents/SubmitSets';
import { AcNoDataView, AcTable, AcViewModal } from '../../UiComponents/AcImports';

import MDSidebarMenu from '../../common_layouts/mdsidebarmenu';

import './usergroups.scss';
import { FindMaxResult, preventinputToString, preventinputotherthannumbers } from '../../../_services/common.service';

export class UserGroupsComponent extends React.Component{
    _isMounted = false;
    constructor(props){
        super(props);
        this.whitecontainer=React.createRef();
        this.state = {
            //table data and pagination details
            toridata:[], isdataloaded: false, ismocktesting: false,
            ftablebody: [],
            sfilterobj: this.defaultFilterObject(),
            startpage: 1, totalresults: 0,
            //get users list
            regions:[], branches:[], usrRoles: [],
            usersfilterobj: this.defaultUserFilterObject(),
            alluserslist: [], selectuserslist: [], selcteduser: null,
            //modal details
            showmodal: false, isedit: false,
            modalUsersFilter: this.defaultModalFilterObject(),
            //save object
            saveobj: this.defaultObject(),
            oneresultheight: 55, maxShowresultcount: 0, orimaxShowresultcount: 0, //find max result varibles
            loading:false,
            errors:{},
            isUpdated: false,
        }

    };

    componentDidMount(){
      this._isMounted = true;

      if(this._isMounted){
        //get masterdata
        this.loadRoles();
        this.loadRegions();
        this.loadBranches();
        //filter search
        var maxresutcount=FindMaxResult(this.whitecontainer.current?(this.whitecontainer.current.offsetHeight) : 0,this.state.oneresultheight,145)
                
        this.setState({
            maxShowresultcount:(maxresutcount.maxresultCount>8?maxresutcount.maxresultCount:8),orimaxShowresultcount:(maxresutcount.maxresultCount>8?maxresutcount.maxresultCount:8)
        },()=>{
            this.handleTableSearch(null,"click");
        })
      }
    }

    componentWillUnmount(){
        this._isMounted = false;
    }
    //default save object
    defaultObject = () => {
        return { id: 0, groupName: "", userHasGroup: [], isDelete: false, isNew: true };
    }
    //default user filter object
    defaultUserFilterObject = () => {
        return { storeId: [], searchName: "", regionId: [], userRollIds: [], mainUserRollTypes: [] };
    }
    //default modal data keep user filter object
    defaultModalFilterObject = () => {
        return {role: "", branch:"", region:"", roles: [], regions: [], branches: []};
    }
    //get user roles
    loadRoles = () => {
        submitSets(submitCollection.getUserRoles).then(res => {
            var cusrroles = [];
            if(res && res.status && Array.isArray(res.extra) && res.extra.length > 0){
                cusrroles = res.extra;
            }
            this.setState({ usrRoles: cusrroles });
        });
    }
    defaultFilterObject = () => {
        return { name: "", groupId:"", isReqPagination:true, startIndex:0, maxResult: 8, isReqCount: false };
      }
    //reset table filters 
    resetTableFilters = () => {
        this.setState({ sfilterobj:this.defaultFilterObject(), startpage: 1}, () => {
            this.handleTableSearch(null,"click");
        });
    }
    //
    loadRegions = () => {
        submitSets(submitCollection.getRegions, { filterOpt: "", isReqPagination: false }, true).then(res => {
            if(res.status){
                this.setState({ regions: res.extra });
            }
        });
    }
    loadBranches = (regionid) => {
        var reid = null;
        if(regionid!==undefined){
            reid = regionid;
        }
       
        submitSets(submitCollection.getUserBranches, "?regionId=" + (reid), true).then(res => {
           if(res.status){
            var cbranchlist = [];
            if(res.extra && res.extra.length > 0){
                for (let i = 0; i < res.extra.length; i++) {
                    const cbranchitem = res.extra[i];
                    cbranchitem["regionId"] = reid;
                    cbranchlist.push(cbranchitem);
                }
            }
            this.setState({ branches: cbranchlist });
           }
        });
    }
    handleBranchChange = (evt) => {
        var cobj = this.state.modalUsersFilter;
        
        if(evt.target.value && evt.target.value > 0){
            //cobj["storeId"] = parseInt(evt.target.value);
        } 

        this.setState({ modalUsersFilter: cobj }, () => {
            this.handleTableSearch(null, "click");
        })
    }
    //set filter object
    handleFilterObject = (evt,etype,ctype,msg) => {
        var cobj = this.state.sfilterobj;
        if(etype === "name"){
            if(!preventinputToString(evt,evt.target.value,msg)){
                evt.preventDefault()
                return
              }
        }
        if(etype !== null){
            cobj[etype] = evt.target.value;
        }
        cobj.startIndex = 0;

        this.setState({sfilterobj:cobj}, () => {
            if(ctype === "click" || (ctype === "enter" && evt.which === 13)){
                this.setState({ startpage: 1, toridata:[], totalresults:0}, () => {
                    this.handleTableSearch(null,"click");
                });
            }
        });
    }
    //filter search
    handleTableSearch = (evt,etype) => {
        if(!this.state.ismocktesting){
            if(etype === "click" || (etype === "enter" && evt.which === 13)){
                var maxresutcount = this.state.maxShowresultcount;
                var csobj = this.state.sfilterobj;
                csobj.maxResult = maxresutcount;
                this.setState({ isdataloaded: false });
                submitSets(submitCollection.findGroupOnly, csobj, true).then(res => {
                    //console.log(res);
                    var cdata = this.state.toridata;
                    if(res && res.status){
                        var cfindList = cdata.findIndex(x => x.page === this.state.startpage);
                        if(cfindList > -1){
                            cdata[cfindList].data = res.extra;
                        } else{
                            cdata.push({page:(this.state.startpage),data:res.extra});
                        }

                        let searchobj = this.state.sfilterobj;
                        
                        this.setState({
                            toridata: cdata,
                            totalresults: ((this.state.startpage === 1 || searchobj.isReqCount)?res.count:this.state.totalresults),
                        }, () => {
                            this.loadTableData();

                            
                            searchobj.isReqCount = false;
                            this.setState({ sfilterobj: searchobj, });
                        });
                    } else{
                        this.setState({
                            toridata: cdata,
                        }, () => {
                            this.loadTableData();
                        });
                    }
                });
            }
        } else{
            this.setState({ isdataloaded: true });
        }
    }

    loadTableData = () => {
        var cdata = [];
        if(this.state.toridata && this.state.toridata.length > 0){
            var cfindList = this.state.toridata.find(x => x.page === this.state.startpage);
            if(cfindList){
                for (var i = 0; i < cfindList.data.length; i++) {
                    const citem = cfindList.data[i];
                    cdata.push({ 0:citem.id, 1:citem.groupName, 2: "" });
                }
            }
        }

        this.setState({ ftablebody: cdata }, () => {
            this.setState({ isdataloaded: true });
        });
    }

    handleModalToggle = (isedit) => {
        this.setState({showmodal: !this.state.showmodal, isedit: (isedit?true:false), modalUsersFilter: this.defaultModalFilterObject(), usersfilterobj: this.defaultUserFilterObject(), isUpdated: false }, () => {
            if(!isedit){
                this.setState({ saveobj: this.defaultObject() });
            }
            if(this.state.showmodal === true){
                this.getAllUsers(); //get users
            }
        });

        this.setState({
            errors:{}
        })
    }
    //#USR-GRP-H01 onchange users filter
    changeUserFilter = (ctxt, objkey) => {
        const csobj = this.state.modalUsersFilter;
        const cval = (objkey === "role"?ctxt:parseInt(ctxt));

        const usersfilterobj = this.state.usersfilterobj;
        if(objkey === "role"){
            if(cval !== ""){
                var findroleobj = this.state.usrRoles[ctxt];
                //find exists
                var isroleadded = csobj.roles.findIndex(x => x.roleId === findroleobj.roleId);
                if(isroleadded === -1){
                    usersfilterobj.userRollIds.push(findroleobj.roleId);
                    csobj.roles.push(findroleobj);
                }
            }
        } else if(objkey === "region"){
            if(cval !== ""){
                 //find exists
                var isregionadded = usersfilterobj.regionId.findIndex(x => x === cval);
                if(isregionadded === -1){
                    usersfilterobj.regionId.push(cval);
                    //get region object
                    var getregionobj = this.state.regions.find(z => z.regionId === cval);
                    if(getregionobj){
                        csobj.regions.push(getregionobj);
                    }
                    this.loadBranches(cval);
                }
            }
        } else if(objkey === "branch"){
            if(cval !== ""){
                //find exists
                var isbranchadded = usersfilterobj.storeId.findIndex(x => x === cval);
                if(isbranchadded === -1){
                    usersfilterobj.storeId.push(cval);
                    //get region object
                    var getbranchobj = this.state.branches.find(z => z.branchId === cval);
                    if(getbranchobj){
                        csobj.branches.push(getbranchobj);
                    }
                }
            }
        }
        /* console.log(usersfilterobj);
        console.log(csobj); */
        this.setState({ modalUsersFilter: csobj, usersfilterobj: usersfilterobj }, () => {
            this.getAllUsers(); //get users
        });
    }
    //page change
    handlePageChange = (cstartpage) => {
        // var cfindList = this.state.toridata.find(x => x.page === cstartpage);
        var csobj = this.state.sfilterobj;
        csobj.startIndex = ((cstartpage - 1) * this.state.sfilterobj.maxResult);
        
        this.setState({ sfilterobj: csobj, startpage: cstartpage, isdataloaded: false }, () => {
            /* if(cfindList){
                this.loadTableData();
            } else{
                this.handleTableSearch(null, "click");
            } */
            this.handleTableSearch(null, "click");
        });
    }
    //table row click
    onRowClicked = (cidx,citem) => {
        var cfindList = this.state.toridata.find(x => x.page === this.state.startpage);
        if(cfindList){
            if(citem && citem[0] && citem[0] !== ""){
                let finditem = cfindList.data.find(z => z.id === citem[0]);
                //console.log(finditem);
                if(finditem){
                    this.loadRowDetails(finditem);
                }
            } else{
                this.loadRowDetails(cfindList.data[cidx]);
            }
        }
    }
    //
    loadRowDetails = (rowobj) => {
        this.setState({loading:true})
        submitSets(submitCollection.findAllGroup, { groupId: rowobj.id }, false).then(res => {
            //console.log(res);
            if (res && res.status && res.extra && typeof res.extra !== "string" && res.extra.length > 0) {
                this.setState({saveobj: res.extra[0], isedit:true, isUpdated: false,loading:false},() => {
                    this.handleModalToggle(true);
                }); 
            } 
        });
    }
    //#USR-GRP-H02 get all chain users
    getAllUsers = () => {
        var csearchobj = this.state.usersfilterobj;
        submitSets(submitCollection.findAllUsersByFilter, csearchobj, false).then(res => {
            //console.log(res);
            if (res && res.status && res.extra && typeof res.extra !== "string") {
                var cuserlist = res.extra;
                var nuserlist = [];
                for (let i = 0; i < cuserlist.length; i++) {
                    var crtype = cuserlist[i].systemMainRoleType;
                    nuserlist.push({ value: cuserlist[i].userId, label: cuserlist[i].userFirstName+" "+cuserlist[i].userLastName+
                    " ( "+((crtype!=="CEO"||crtype!=="COO"||crtype!=="Planner") && cuserlist[i].regionName?(cuserlist[i].regionName+" "):"")+
                    ((crtype!=="CEO"||crtype!=="COO"||crtype!=="Planner"||crtype!=="Region_Manager") && cuserlist[i].storeName?(cuserlist[i].storeName+" "):"")+" "+cuserlist[i].rollName+")" });
                }
                this.setState({ alluserslist: cuserlist, selectuserslist: nuserlist });
            } else{
                this.setState({ alluserslist: [], selectuserslist: [] });
            }
        });
    }
    //remove user filter item
    removeUserFilterItem = (ctype,cidx) => {
        const cmodalfilterobj = this.state.modalUsersFilter;
        const cuserfilterobj = this.state.usersfilterobj;

        var cbranchlist = this.state.branches;
        var clastregion = 0;
        if(ctype === "role"){
            cmodalfilterobj.roles.splice(cidx,1);
            cuserfilterobj.userRollIds.splice(cidx,1);
        } else if(ctype === "region"){
            const cremovingregion = JSON.parse(JSON.stringify(cuserfilterobj.regionId[cidx]));
            cmodalfilterobj.regions.splice(cidx,1);
            cuserfilterobj.regionId.splice(cidx,1);
            cbranchlist = [];
            //add last region id
            if(cuserfilterobj.regionId.length > 0){
                clastregion = cuserfilterobj.regionId[(cuserfilterobj.regionId.length - 1)];
            }
            //remove branches of removing region
            var newfilterbranches = [];
            var newstoreids = [];
            for (let i = 0; i < cmodalfilterobj.branches.length; i++) {
                const caddedbranch = cmodalfilterobj.branches[i];
                if(caddedbranch.regionId !== cremovingregion){
                    newfilterbranches.push(caddedbranch);
                    newstoreids.push(caddedbranch.branchId);
                }
            }
            cmodalfilterobj.branches = newfilterbranches;
            cuserfilterobj.storeId = newstoreids;
        } else if(ctype === "branch"){
            cmodalfilterobj.branches.splice(cidx,1);
            cuserfilterobj.storeId.splice(cidx,1);
        }

        this.setState({ modalUsersFilter: cmodalfilterobj, usersfilterobj: cuserfilterobj, branches: cbranchlist }, () => {
            this.getAllUsers();
            if(ctype === "region" && clastregion > 0){
                this.loadBranches(clastregion);
            }
        });
    }
    //handle change save object
    handleChangeSave = (cvalue, objkey,msg,e) => {
        const csaveobj = this.state.saveobj;
        if(objkey === "groupName"){
            if(!preventinputToString(e,e.target.value,msg)){
                e.preventDefault()
                return
            }
        }
        csaveobj[objkey] = cvalue;
        this.setState({ saveobj: csaveobj, isUpdated: true });
    }
    //handle add new user
    addNewUser = (selecteduobj) => {
        //find user object from loaded users list
        const cuserobj = this.state.alluserslist.find( x => x.userId === selecteduobj.value );
        //change save object
        const csobj = this.state.saveobj;
        //check already added
        const findexists = csobj.userHasGroup.findIndex(z => (z.isDelete === false && z.userDto.userId === cuserobj.userId));
        if(findexists === -1){
            this.setState({ isUpdated: true });

            cuserobj["firstName"] = cuserobj.userFirstName;
            cuserobj["lastName"] = cuserobj.userLastName;
            cuserobj["userRolls"] = {name: cuserobj.rollName, regionName: cuserobj.regionName, storeName: cuserobj.storeName};
            csobj.userHasGroup.push({id:0, userDto: cuserobj, isDelete: false, isNew: true });
        } else{
            alertService.error("Already exists");
        }
        //console.log(csobj.userHasGroup);
        this.setState({ saveobj: csobj });
    }
    //remove group item
    removeGroupItem = (cindex) => {
        const csaveobj = this.state.saveobj;
        if(csaveobj.userHasGroup[cindex].id > 0){
            csaveobj.userHasGroup[cindex].isDelete = true;
        } else{
            csaveobj.userHasGroup.splice(cindex,1);
        }
        this.setState({ saveobj: csaveobj, isUpdated: true });
    }
    //delete region
    handleUserGroup= ()=>{
        confirmAlert({
            title: this.props.t("confirmdeletegroup"),
            message: this.props.t("confirmdeletegroupsub"),
            overlayClassName: (this.props.isRTL === "rtl" ? "alertrtl-content" : ""),
            buttons: [{
                label: this.props.t("btnnames.yes"),
                onClick: () => {
                    this.handleSave(3);                          
                }
            }, {
                label: this.props.t("btnnames.no")
            }]
        });
    }
    //save user group
    handleSave = (savetype) => {
        const csaveobj = this.state.saveobj;
        //console.log(csaveobj);
        
        if(savetype === 2){
            if(!this.state.isUpdated){
                alertService.warn(this.props.t('NO_CHANGES_AVAILABLE'));
                return false;
            }
        }


        if(savetype === 3){
            csaveobj.isDelete = true;
            csaveobj.isNew = false;
        } else if(savetype === 1 || savetype === 2){
            let userscount = 0;
            for (let i = 0; i < csaveobj.userHasGroup.length; i++) {
                const usrgrup = csaveobj.userHasGroup[i];
                if(!usrgrup.isDelete){
                    userscount = userscount + 1;
                }
            }

            if (!csaveobj.groupName || csaveobj.groupName === "") {
                alertService.error(this.props.t("USER_NAME_IS_REQUIRED"));
                return false;
            } else if (!csaveobj.userHasGroup || csaveobj.userHasGroup.length === 0 || userscount === 0) {
                alertService.error(this.props.t("ADD_ATLEASE_ONEUSER_REQUIRED"));
                return false;
            }
        }

        submitSets(submitCollection.crudGroup, csaveobj, false).then(res => {
            //console.log(res);
            if(res && res.status){
                alertService.success(savetype === 3?this.props.t("DELETE_USERGROUP_DETAILS"):savetype === 2?this.props.t("UPDATE_USERGROUP_DETAILS"):this.props.t("SAVE_USERGROUP_DETAILS"));

                this.setState({ isUpdated: false })
                
                if(savetype === 1 || savetype === 3){
                    let cstartpage = this.state.startpage;
                    let searchobj = this.state.sfilterobj;
                    searchobj.isReqCount = true;
                    
                    if(savetype === 3 && this.state.ftablebody.length === 1 && this.state.startpage > 1){
                        const stindx = searchobj.startIndex;
                        const maxresult = searchobj.maxResult;

                        searchobj.startIndex = (stindx - maxresult);
                        cstartpage = (cstartpage - 1);
                    }

                    this.setState({sfilterobj: searchobj, startpage: cstartpage},()=>{
                        this.handleTableSearch(null,"click");
                    });
                } else{
                    this.handleTableSearch(null,"click");
                }

                this.handleModalToggle();
            } else{
                // alertService.error(res&&res.extra&&res.extra!==""?res.extra:"Error occurred on "+(savetype === 3?"deleted":savetype === 2?"updated":"saved")+" proces");

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
    }

    handleShowingresults=(e, isonblur)=>{
        if(isonblur===true){
            this.setState({maxShowresultcount: (e.target.value!=="" && e.target.value>0)?e.target.value:this.state.orimaxShowresultcount})
        }
        else{
            this.setState({maxShowresultcount: e.target.value})
        }
    }
    validateField = (key,value) =>{
        let errorObj = this.state.errors
        let msg = ""
        if(value === "" || value.length === 0){
         msg = (this.props.t('fieldisrequired'))
                
        }
        errorObj[key] = msg; 
        this.setState({
            error:errorObj
        })
    }

    render(){
        const ftableheaders = [{text: "", width: "1%"},this.props.t('groupname'),""];

        const rolelist = (this.state.usrRoles? this.state.usrRoles.map((xitem,xidx) => {
            return <option key={xidx} value={xidx}>{xitem.name}</option>
        }) : <></>);

        var regionList = (this.state.regions ? Object.keys(this.state.regions).map(x => {
            return <option key={x} value={this.state.regions[x].regionId}>{this.state.regions[x].name}</option>
        }) : <></>);

        var branchList = (this.state.branches ? Object.keys(this.state.branches).map(x => {
            return <option key={x} value={this.state.branches[x].branchId}>{this.state.branches[x].name}</option>
        }) : <></>);

        return (<>
        <Col xs={12} className={"main-content compmain-content rg-mdview "+(this.props.isRTL==="rtl"?"RTL":"")} dir={this.props.isRTL}>
                <div>
                    <Row>
                        <MDSidebarMenu />
                        <Col xs={12} lg={10}>
                            <Breadcrumb dir="ltr">
                            {this.props.isRTL==="rtl"?<>
                                <Breadcrumb.Item active>{this.props.t('usergroups')}</Breadcrumb.Item>
                                <li className="breadcrumb-item"><Link to={"/"+this.props.HomePageVal} role="button">{this.props.t('home')}</Link></li>
                                </>:<>
                                    <li className="breadcrumb-item"><Link to={"/"+this.props.HomePageVal} role="button">{this.props.t('home')}</Link></li>
                                    <Breadcrumb.Item active>{this.props.t('usergroups')}</Breadcrumb.Item>
                                </>}
                            </Breadcrumb>
                            <Col className="white-container pdunit-content" ref={this.whitecontainer}>
                                <Col xs={12} lg={8} className="col-centered">
                                    <Col className="custom-filters form-inline">
                                        <Form.Control  placeholder={this.props.t('btnnames.search')} value={this.state.sfilterobj.name} onChange={e => this.handleFilterObject(e,"name","change",this.props.t('Character.search_text'))} onKeyUp={e => this.handleFilterObject(e,"name","enter")} onKeyDown={(e)=>preventinputToString(e,this.state.sfilterobj.name,(this.props.t('Character.search_text')))}/>
                                        <span> <label className="filter-label">{this.props.t("SHOW_RESULTS")}</label>
                                        <Form.Control style={{width:"60px"}} type="number"  value={this.state.maxShowresultcount} onChange={e => this.handleShowingresults(e,false)} onBlur={e => this.handleShowingresults(e,true)} onKeyDown={ (evt) => evt.key === "."?evt.preventDefault(): preventinputotherthannumbers(evt,this.state.maxShowresultcount,(this.props.t('Character.results'))) } /></span>
                                        <Button type="button" variant="warning" className="search-link filter-btn" onClick={e => this.handleFilterObject(e,null,"click")}>{this.props.t('btnnames.search')}</Button>
                                        <Button type="button" variant="outline-secondary" className="filter-btn" onClick={this.resetTableFilters}>{this.props.t('btnnames.reset')}</Button>
                                    </Col>
                                    <Button type="submit" className="highlight-btn" onClick={() => this.handleModalToggle()} variant="success">{this.props.t('btnnames.addnew')}</Button>

                                    {this.state.isdataloaded && this.state.ftablebody && this.state.ftablebody.length > 0?
                                        <AcTable isRTL={this.props.isRTL} t={this.props.t} aheaders={ftableheaders} totalresults={this.state.totalresults} startpage={this.state.startpage} alldata={this.state.toridata} asearchobj={this.state.sfilterobj} abody={this.state.ftablebody} showpaginate={true} pagetype="ajax" pagecount={this.state.sfilterobj.maxResult} handleRowClick={this.onRowClicked} handlePageChange={this.handlePageChange}/>
                                    :this.state.isdataloaded?<>
                                        <AcNoDataView />
                                    </>:<></>}
                                </Col>
                            </Col>    
                        </Col>
                    </Row>
                </div>

                <Modal show={this.state.showmodal} backdrop="static" keyboard={false} onHide={() => this.handleModalToggle()} className={"usrgroupmodal-view "+(this.props.isRTL==="rtl"?"RTL":"")} dir={this.props.isRTL}>

                  <Modal.Header>
                  {(this.state.isedit)?(<>
                    <Modal.Title><b> {this.props.t('editusergroup')}</b></Modal.Title>
                  </>):(<>
                    <Modal.Title> <b> {this.props.t('addnewusergroup')}</b></Modal.Title>
                  </> )}
                  </Modal.Header>

                  <Modal.Body>
                      <Col className="formcontrol-main nocollapseinput"><>
                          <Col xs={12} className="rform-subcontent">
                              <Row className="form-subcontent">
                                <Col xs={5} >
                                {/* <Form.Group style={{marginBottom:"25px"}}>
                                        <AcInput eleid="tagnametxt" atype="text" aid="groupName" adefval={this.state.saveobj.groupName} aobj={this.state.saveobj} avset={{}} avalidate={[ValT.empty]} aplace={this.props.t('groupname')} showlabel={true} arequired={true} onChange={e => { this.handleChangeSave(e.target.value,"groupName")}}  /> */}
                                    <Form.Group>
                                        <Form.Label >{this.props.t('groupname')} <span style={{ color: "red" }}>*</span></Form.Label>
                                        <Form.Control  size="sm" type="text" onChange={e => { this.handleChangeSave(e.target.value,"groupName",this.props.t('Character.groupname'),e)}} value={this.state.saveobj.groupName}  placeholder={this.props.t("typegroupname")} onKeyDown={(e)=>preventinputToString(e,this.state.saveobj.groupName,(this.props.t('Character.groupname')))} onBlur={(e)=>this.validateField("groupName",e.target.value)} />
                                        <div className="errorMsg">{this.state.errors.groupName}</div>  
                                    </Form.Group>
                                    
                                    <Col className="filterusers-main">
                                        <label className="form-label" style={{marginTop:"10px"}}><FilterIcon size={16} /> {this.props.t('FILTER_USERS')}</label><br />
                                        
                                        <Col>
                                            <small>{this.props.t("ROLES")}</small>
                                            <FormSelect size="sm" value={this.state.modalUsersFilter.role} onChange={e => this.changeUserFilter(e.target.value,"role")} style={{fontSize:"14px"}} >
                                                <option value="">{this.props.t("selarole")}</option>
                                                {rolelist}
                                            </FormSelect>

                                            <Col xs={12} className="usrfilterbadge-list">
                                                {this.state.modalUsersFilter.roles.map((xitem, xidx) => {
                                                    return <Badge key={xidx} variant="secondary" className="role-item">{xitem.name} <span onClick={() => this.removeUserFilterItem("role",xidx)}><XIcon size={12}/></span></Badge>
                                                })}
                                            </Col>
                                        </Col>
                                        <Col style={{marginTop:"5px"}}>
                                            <small>{this.props.t("regions")}</small>
                                            <FormSelect size="sm" value={this.state.modalUsersFilter.role} onChange={e => this.changeUserFilter(e.target.value,"region")} style={{fontSize:"14px"}} >
                                                <option value="">{this.props.t("selaregion")}</option>
                                                {regionList}
                                            </FormSelect>

                                            <Col xs={12} className="usrfilterbadge-list">
                                                {this.state.modalUsersFilter.regions.map((xitem, xidx) => {
                                                    return <Badge key={xidx} variant="secondary" className="region-item">{xitem.name} <span onClick={() => this.removeUserFilterItem("region",xidx)}><XIcon size={12}/></span></Badge>
                                                })}
                                            </Col>
                                        </Col>
                                        <Col style={{marginTop:"5px"}}>
                                            <small>{this.props.t("stores")}</small>
                                            <FormSelect size="sm" value={this.state.modalUsersFilter.role} onChange={e => this.changeUserFilter(e.target.value,"branch")} style={{fontSize:"14px"}} >
                                                <option value="">{this.props.t("selastore")}</option>
                                                {branchList}
                                            </FormSelect>
                                            <Col xs={12} className="usrfilterbadge-list">
                                                {this.state.modalUsersFilter.branches.map((xitem, xidx) => {
                                                    return <Badge key={xidx} variant="secondary" className="branch-item">{xitem.name} <span onClick={() => this.removeUserFilterItem("branch",xidx)}><XIcon size={12}/></span></Badge>
                                                })}
                                            </Col>
                                        </Col>
                                    </Col>     
                                </Col>
                                <Col xs={7}>
                                    <Col xs={12}>
                                        <Form.Group>
                                            <Form.Label >{this.props.t("USERS")}</Form.Label>
                                            <Select placeholder={this.props.t("selectusers")} options={this.state.selectuserslist} value={this.state.selcteduser} onChange={e => this.addNewUser(e)} className="filter-searchselect" classNamePrefix="searchselect-inner" components={{ IndicatorSeparator:() => null }} noOptionsMessage={() => "No users found"} />
                                        </Form.Group>
                                    </Col>
                                    <Col xs={12} style={{marginTop:"10px"}}>
                                        {this.state.saveobj && this.state.saveobj.userHasGroup && this.state.saveobj.userHasGroup.length > 0?<>
                                        <Form.Label>{this.props.t("ADDED_USERS")}</Form.Label>
                                        <ListGroup id="modaluserslist">
                                            {this.state.saveobj.userHasGroup.map((xitem, xidx) => {
                                            return <React.Fragment key={xidx}>{!xitem.isDelete?<ListGroup.Item><label>{xitem.userDto.firstName+" "+xitem.userDto.lastName}</label>
                                            <span onClick={() => this.removeGroupItem(xidx)}><XIcon size={14}/></span>
                                            <small>{(xitem.userDto.userRolls && xitem.userDto.userRolls.regionName?xitem.userDto.userRolls.regionName+" ":"")+(xitem.userDto.userRolls && xitem.userDto.userRolls.storeName?xitem.userDto.userRolls.storeName+" ":"")}</small>
                                            <small style={{display:"block",marginTop:"-3px"}}>{"( "+(xitem.userDto.userRolls?xitem.userDto.userRolls.name:"-")+")"}</small></ListGroup.Item>:<></>}</React.Fragment>;  
                                            })}
                                        </ListGroup></>:<></>}
                                    </Col>
                                </Col>
                              </Row>
                          </Col>
                      </></Col>
                </Modal.Body>

                <Modal.Footer>
                    <Button variant="secondary" className={"bbackbutton"+(this.props.isRTL === "rtl"?" float-left":" float-right")} onClick={() => this.handleModalToggle()} size="sm" type="button">{this.props.t('btnnames.close')}</Button>
                    {(this.state.isedit)?(<>
                      <Button variant="danger" className={"btn btn-danger"+(this.props.isRTL === "rtl"?" float-left":" float-right")} size="sm" type="button" onClick={() => this.handleUserGroup()}>{this.props.t('btnnames.delete')}</Button>
                      <Button variant="sucess" className={"btn btn-success"+(this.props.isRTL === "rtl"?" float-left":" float-right")} size="sm" type="button" onClick={() => this.handleSave(2)}>{this.props.t('btnnames.update')}</Button>
                     </>):(<>
                       <Button  variant="sucess" className={"btn btn-success"+(this.props.isRTL === "rtl"?" float-left":" float-right")} size="sm" type="button" onClick={() => this.handleSave(1)}>{this.props.t('btnnames.save')}</Button>
                    </> )}
                </Modal.Footer>
            </Modal>
          </Col>
          <AcViewModal showmodal={this.state.loading} message={this.props.t('PLEASE_WAIT')} />
          <AcViewModal showmodal={!this.state.isdataloaded} />
      </>);
   }
 }

export default withTranslation()(withRouter(UserGroupsComponent));
