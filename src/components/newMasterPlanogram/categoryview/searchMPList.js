import React, { Component } from 'react';
import { withTranslation } from 'react-i18next';
import { Col, Button, Row, Form, ButtonGroup, Modal } from 'react-bootstrap';
import { XIcon } from '@primer/octicons-react';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
// import { confirmAlert } from 'react-confirm-alert';

import { mpVersionName, selectedMasterPlanSetAction } from '../../../actions/masterPlanogram/masterplanogram_action';
import { convertDate, preventinputToString } from '../../../_services/common.service';
import { submitSets } from '../../UiComponents/SubmitSets';
import { submitCollection } from '../../../_services/submit.service';
import { alertService } from '../../../_services/alert.service';
import { TooltipWrapper } from '../AddMethods';

import loadinggif from '../../../assets/img/loading-sm.gif';
import { Icons } from '../../../assets/icons/icons';
import { AcInput,ValT } from '../../UiComponents/AcImports';

import "./searchMPList.css";


class SearchMPList extends Component {
    constructor(props) {
        super(props);

        this.state = {
            searchName: (this.props.defSaveObj && this.props.defSaveObj.name) ? this.props.defSaveObj.name === "" ? "" : this.props.defSaveObj.name : "" ,
            editName: null,
            itemSelected: null,
            showDropdown: false,
            editEnabled: null,
            mpList:[],
            allList:[],
            isDataLoading:false,
            fresh: true,

            isOneTimeLoad: true, //one time load

            lobj:{},
            lval:{},
            delmp:null,
            showDelModal:false,
            showPass: false,
            
            isEditConfirm: false,
        };

        this.searchBoxRef = React.createRef();
        this.dropdownRef = React.createRef();
        this.editRef = React.createRef();
        this.yesRef = React.createRef();

        this.handleInputChange = this.handleInputChange.bind(this);
        this.handleInputEditChange = this.handleInputEditChange.bind(this);
        this.handleNewClick = this.handleNewClick.bind(this);
        this.handleDeleteClick = this.handleDeleteClick.bind(this);
        this.handleDuplicateClick = this.handleDuplicateClick.bind(this);
        this.handleCancelClick = this.handleCancelClick.bind(this);
        this.handleClickOutside = this.handleClickOutside.bind(this);
        this.handleLoadMVP = this.handleLoadMVP.bind(this);
    }

    componentDidMount() {
        document.addEventListener("mousedown", this.handleClickOutside);
        
        if(this.props.defSaveObj && this.props.defSaveObj.mp_id === -1){
            let cobj = { name: ""} ;
            this.props.setVersionName(cobj);
            this.loadMPList();
        }
        
        if(this.props.defSaveObj && this.props.defSaveObj.mp_id === -2 && this.props.mpstate.mpVersionName && this.props.mpstate.mpVersionName.name === ""){
            this.props.VNRef.current.focus();
            this.setState({showDropdown: false});
            
        } else if(this.props.defSaveObj && this.props.defSaveObj.mp_id > 0){
            this.loadMPList();
        }
      }
    
      componentWillUnmount() {
        document.removeEventListener("mousedown", this.handleClickOutside);
      }

      handleClickOutside(event) {
        if(!this.state.isEditConfirm){
            if (
                (this.searchBoxRef && this.searchBoxRef.current && !this.searchBoxRef.current.contains(event.target)) && 
                (this.dropdownRef && this.dropdownRef.current && !this.dropdownRef.current.contains(event.target))
            ) {
                //if edit enabled trigger blur event to save if change available in version name
                if(this.state.editEnabled > -1){
                    document.querySelectorAll('.versionedit-txt').forEach(function(element){
                        if(element === document.activeElement) {
                            return element.blur();
                        }
                    });
                }

                this.setState({ showDropdown: false, itemSelected: null, editEnabled: null, mpList: this.state.allList,
                    searchName: (this.props.defSaveObj?(this.props.defSaveObj.mp_id !== -2 ? this.props.defSaveObj.name ? this.props.defSaveObj.name === "" ? "" : this.props.defSaveObj.name : "": (this.props.mpstate.mpVersionName?(this.props.mpstate.mpVersionName.name !== "" ? this.state.searchName : ""):"")):"") });
                    
            }
        }
      }

    handleInputChange(event,msg) {
        if(!preventinputToString(event,event.target.value,msg)){
            event.preventDefault()
            return
        }
        this.setState({ searchName: event.target.value });

        let defsaveobj = this.props.defSaveObj;
        let cobj = { name: null} ;
        cobj["name"] = event.target.value;

        this.props.setVersionName(cobj);

        let svobj = { chainHasDepartmentId: defsaveobj.chainHasDepartmentId, name:event.target.value, isAUIConverted:false, mp_id: -1 };
        if(this.props.isAUICon){    
            svobj.isAUIConverted = true;

            if(this.state.isOneTimeLoad){
                svobj.mp_id = (defsaveobj?defsaveobj.mp_id:-1);
            }
        }

        this.setState({ isDataLoading:true });
        
        submitSets(submitCollection.mpVerList, svobj, false).then(res => {
            let loadedversions = (res && res.extra && res.extra.length > 0?res.extra:[]);
            
            this.setState({ 
                mpList: loadedversions, 
                showDropdown: (res.extra && res.extra.length > 0),
                isOneTimeLoad: false 
            },()=>{
                this.setState({isDataLoading:false})
            });
        });
    }

    loadMPList(){
        let defsaveobj = this.props.defSaveObj;
        let svobj = { chainHasDepartmentId: defsaveobj.chainHasDepartmentId, isAUIConverted: false, mp_id: -1 };

        if(this.props.isAUICon){    
            svobj.isAUIConverted = true;

            // if(this.state.isOneTimeLoad){
            //     svobj.mp_id = (defsaveobj?defsaveobj.mp_id:-1);
            // }
        
        }

        submitSets(submitCollection.mpVerList, svobj, false).then(res => {
            let loadedversions = (res && res.extra && res.extra.length > 0?res.extra:[]);
            
            this.setState({ 
                mpList: loadedversions, 
                allList: loadedversions, 
                //isOneTimeLoad: false 
            });

            if(!res.extra || res.extra.length === 0){ 
                this.setState({ fresh: false});
            }
        });
    }

    handleInputEditChange(event) {
        this.setState({ editName: event.target.value });
    }

    handleDropdownItemClick = (key) => {
        if(key === this.state.itemSelected){
                this.setState({ itemSelected: null });
        }else{
            this.setState({ itemSelected: key });
        }
    }

    handleEditClick = (key, name, evt, mpid, mpdeptid) => {
        if(key === this.state.editEnabled){
            this.setState({ editEnabled: null });
            //update name onblur
            let selectedver = this.state.mpList[key];
            if(selectedver && selectedver.masterPlanogram && selectedver.masterPlanogram.name !== evt.target.value){
                this._handleKeyDown(true, evt, key, mpid, mpdeptid);
            }
        }else{
            this.setState({ isEditConfirm: true }, () => {
                this.props.notsaveConfirm((iscontinue) => {
                    if(iscontinue){
                        this.setState({ editEnabled: key, editName: name },()=>{
                            this.editRef.current.focus();
                        });
                    }

                    this.setState({ isEditConfirm: false });
                });
            });
        }  

        this.handleDropdownItemClick(key); 
    }

    handleDuplicateClick(mp){
        this.props.notsaveConfirm((iscontinue) => {
            if(iscontinue){
                if(this.props.isUpdatesAvailable && typeof this.props.resetUpdatesAvailable === "function"){
                    this.props.resetUpdatesAvailable(true);
                }
                this.props.showLoadingModal(true);

                let svobj = { mpId : mp.masterPlanogram.id }

                submitSets(submitCollection.vmpDuplicate, svobj, false).then(res => {

                    if(res && res.status){
                        alertService.success(this.props.t("MASTER_PLANOGRAM_DUPLICATED"));
                        let csaveobj = this.getDefSaveObj();
                        csaveobj.mp_id = res.extra.id;
                        csaveobj.department["department_id"] = res.extra.department.id;
                        csaveobj.department["department_name"] = res.extra.department.name;
                        csaveobj.categories = [];
                
                        this.setState({ defSaveObj: csaveobj }, () => {
                            this.handleRedirectView();
                            this.props.showLoadingModal(false);
                        });
                        
                    }else{
                        this.props.showLoadingModal(false);
                        alertService.error(this.props.t("ERROR_OCCURED"));
                    }


                });    
            }
        });   
    }

    handleDeleteYesTrigger =() =>{
        this.yesRef.current.click();
    }
    
    handleDeleteClick(mp) {
        this.props.notsaveConfirm((iscontinue) => {
            if(iscontinue){
                this.setState({lobj:{}, delmp:mp },()=>{
                    this.setState({showDelModal:true},()=>{
                        document.getElementById('frm_password').focus();
                    })
                    // confirmAlert({
                    //     title: "Hi",
                    //     message: (<>{this.props.t(`THIS WILL DELETE THE VERSION ${mp.masterPlanogram.name.length>15?mp.masterPlanogram.name.substring(0,15)+"...":mp.masterPlanogram.name}`)}
                    //    </>),
                    //     overlayClassName: (this.props.isRTL === "rtl" ? "alertrtl-content" : ""),
                    //     buttons: [{
                    //         label: this.props.t('btnnames.yes'),
                    //         onClick: () => {this.deleteMPVersion(mp)},
                    //     }, {
                    //         label: this.props.t('btnnames.no')
                    //     }]
                    // });
                });    
            }
        }); 
    }

    getDefSaveNewObj = () => {
        return { mp_id: -2, is_new: true, is_delete: false, department: {}, categories: [] };
    }

    deleteMPVersion = (mp) => {

        if(this.state.lobj.password){

            this.props.showLoadingModal(true);
    
            let svobj = { mp_id : mp.masterPlanogram.id, password : this.state.lobj.password}
    
            submitSets(submitCollection.deleteMpVer, svobj, false, null, true).then(res => {
    
                if(res && res.status){
                    if( this.props.defSaveObj.mp_id === mp.masterPlanogram.id){
                        
                        // if(this.props.isAUICon){
                        //     this.props.loadAuiVersionList("yes");
                        //     alertService.success("Deleted Version Successfully");
                        // }else{
                            let csobj = this.getDefSaveObj();
    
                            if(this.props.isAUICon){
                                csobj.department["department_id"] = this.props.defSaveObj.department.id;
                                csobj.department["department_name"] = this.props.defSaveObj.department.name;
                            }else{
                                csobj.department["department_id"] = this.props.defSaveObj.department.department_id;
                                csobj.department["department_name"] = this.props.defSaveObj.department.department_name;
                            }
                            csobj.categories = [];
    
                            // console.log(this.props.defSaveObj,csobj)
        
                            this.setState({ showDelModal:false, delmp:null ,defSaveObj: csobj }, () => {
                                this.props.setMasterPlanAction(csobj);
        
                                if(this.props.changeDepartmentAndLoadData){
                                    this.props.changeDepartmentAndLoadData(csobj);
                                }
                                
                                alertService.success(this.props.t('DELETED_VERSION_SUCCESSFULLY'));
                                
                            });
                        // }
                        
    
                    }else{
    
                        if(this.props.isAUICon && this.props.mainScreenMpId === mp.masterPlanogram.id){
                            
                            let csobj = this.getDefSaveObj();
    
                            if(this.props.isAUICon){
                                csobj.department["department_id"] = this.props.defSaveObj.department.id;
                                csobj.department["department_name"] = this.props.defSaveObj.department.name;
                            }else{
                                csobj.department["department_id"] = this.props.defSaveObj.department.department_id;
                                csobj.department["department_name"] = this.props.defSaveObj.department.department_name;
                            }
                            csobj.categories = [];
    
                            // console.log(this.props.defSaveObj,csobj)
        
                            this.setState({ showDelModal:false, delmp:null ,defSaveObj: csobj }, () => {
                                this.props.setMasterPlanAction(csobj);
        
                                if(this.props.changeDepartmentAndLoadData){
                                    this.props.changeDepartmentAndLoadData(csobj);
                                }
                                
                                alertService.success(this.props.t('DELETED_VERSION_SUCCESSFULLY'));
                                
                            });
    
                        }else{
                            this.props.showLoadingModal(false);
                            alertService.success(this.props.t('DELETED_VERSION_SUCCESSFULLY'));
                            this.setState({showDelModal:false,delmp:null},()=>{
                                this.loadMPList();
                            })    
                        }
    
                    }
    
                }else{
                    this.props.showLoadingModal(false);
                    // alertService.error(res.error.errorMessage);
                    this.setState({lobj:{}})
                }
    
            });

        }else{
            alertService.error(this.props.t('ENTER_PASSWORD_PLS'));
        }

    }

    handleNewClick(depDetails) {
        let cobj = { name: "" } ;
        this.props.setVersionName(cobj);

        let csobj = this.getDefSaveNewObj();
        csobj.department["department_id"] = depDetails.department_id;
        csobj.department["department_name"] = depDetails.department_name;
        csobj["chainHasDepartmentId"] = depDetails.department_id;
        csobj.categories = [];

        this.handleRedirectViewNew(csobj);
        
    }
    
    handleRedirectViewNew = (csobj) => {
        if(this.props.defSaveObj.department && this.props.defSaveObj.department.department_id > 0){
            this.props.notsaveConfirm((iscontinue) => {
                if(iscontinue){
                    if(this.props.isUpdatesAvailable && typeof this.props.resetUpdatesAvailable === "function"){
                        this.props.resetUpdatesAvailable(true, () => {
                            alertService.info(this.props.t('NEW_VERSION_EDIT'))
                            this.props.setMasterPlanAction(csobj);
                            
                            if(this.props.changeDepartmentAndLoadData){
                                this.props.changeDepartmentAndLoadData(csobj, true);
                            }  
                        });
                    } else{
                        alertService.info(this.props.t('NEW_VERSION_EDIT'))
                        this.props.setMasterPlanAction(csobj);
                        
                        if(this.props.changeDepartmentAndLoadData){
                            this.props.changeDepartmentAndLoadData(csobj, true);
                        } 
                    }  
                }
            });
        } else{
            alertService.error(this.props.t("selectdepartment"));
        }
    }

    getDefSaveObj = () => {
        return { mp_id: -1, is_new: true, is_delete: false, department: {}, categories: [] };
    }

    handleLoadMVP(mp){
        let csaveobj = this.getDefSaveObj();
        csaveobj.mp_id = mp.masterPlanogram.id;
        csaveobj["searchFromDate"] = mp.masterPlanogram.searchFromDate;
        csaveobj["searchToDate"] = mp.masterPlanogram.searchToDate;
        csaveobj.department["department_id"] = mp.department.id;
        csaveobj.department["department_name"] = mp.department.name;
        csaveobj.categories = [];

        this.setState({ defSaveObj: csaveobj }, () => {
            if(typeof this.props.setNewRefresh === "function"){
                this.props.setNewRefresh(false);
            }
            this.handleRedirectView();
        });    
    }

    handleRedirectView = () => {
        if(this.state.defSaveObj.department && this.state.defSaveObj.department.department_id > 0){
            this.props.setMasterPlanAction(this.state.defSaveObj);

            if(this.props.changeDepartmentAndLoadData){
                this.props.changeDepartmentAndLoadData(this.state.defSaveObj);
            }
        }
    }

    handleCancelClick() {
        this.setState({ selected: null });
    }

    _handleKeyDown = (istrigger, e, index, mpId, dId) => {
        if (istrigger || e.key === 'Enter') {
            let svobj = { chainHasDepartmentId:dId, mp_id:mpId, name: e.target.value };
            
            this.props.showLoadingModal(true);
            submitSets(submitCollection.editVerName, svobj, false).then(res => {
                
                if(res && res.status){
                    if(this.props.defSaveObj.mp_id === mpId){
                        this.setState({searchName: e.target.value});
                    }
                    
                    let viewdetails = {department:{department_id : dId},mp_id: mpId}
                    
                    if(this.props.defSaveObj.mp_id === mpId){
                         this.props.loadMPDetails(viewdetails);
                        // this.setState({showDropdown:false})
                        // let updatedList = this.state.mpList.map((mp, i) => {
                        //     if (i === index) {
                        //       return { ...mp, masterPlanogram:{ ...mp.masterPlanogram ,name: e.target.value } };
                        //     } else {
                        //       return mp;
                        //     }
                        //   });

                        //this.setState({mpList: updatedList})
                        //this.setState({searchName: e.target.value})
                        this.loadMPList();
                        // this.props.showLoadingModal(false);
                        
                    }else{
                        let updatedList = this.state.mpList.map((mp, i) => {
                            if (i === index) {
                                return { ...mp, masterPlanogram:{ ...mp.masterPlanogram, name: e.target.value } };
                            } else {
                                return mp;
                            }
                        });
                        
                        
                        this.setState({mpList: updatedList});
                        this.props.showLoadingModal(false);
                    }
                    
                    if(this.props.isUpdatesAvailable && typeof this.props.resetUpdatesAvailable === "function"){
                        this.props.resetUpdatesAvailable(true);
                    }
                    
                }else{                   
                    this.props.showLoadingModal(false);
                    alertService.error(this.props.t("SAME_OR_EXISTING_NAME"));
                }
                
                this.setState({editEnabled: null});
            });

        } else if(!istrigger){
            if(!istrigger && this.props.defSaveObj.mp_id === mpId){
                this.setState({searchName: e.target.value});
            }
        }
    }
    //in aui screen onclick aui version
    changeAUIVersion = (mp) => {
        this.setState({ showDropdown: false }, () => {
            this.props.changeAUIVersion(mp);
            this.setState({searchName: mp?mp.masterPlanogram.name?mp.masterPlanogram.name:"":""})
        });
    }

    handleAuiRedirect = (mp) => {
        this.props.notsaveConfirm((iscontinue) => {
            if(iscontinue){
                if(this.props.isUpdatesAvailable && typeof this.props.resetUpdatesAvailable === "function"){
                    this.props.resetUpdatesAvailable();
                }

                this.props.showLoadingModal(true);
                this.props.updateAUIMPObject(mp);    
            }
        });   
    }

    focusAutoCompleteOff=(e)=>{
        e.target.setAttribute('autocomplete', 'off');
        this.setState({ showDropdown: (this.props.defSaveObj.mp_id > 0) });
    }

    render() {
        const { searchName,showDropdown, editEnabled, editName, mpList,isDataLoading, fresh } = this.state;
        const { showNewButton, defSaveObj } = this.props;
        
        return (
            <Col className="planograms-filters-main">
                
                <Row className="filters-main-row">
                    <Col className="planograms-filters">
                        <Col className="sub-design">
                            <Col className='searchbox' ref={this.searchBoxRef}>
                             
                            <TooltipWrapper text={searchName} placement="top"> 
                                <Form.Control
                                    className="form-control"
                                    ref={this.props.VNRef}
                                    type="text"
                                    placeholder={this.props.t("planoname")}
                                    value={searchName}
                                    autoComplete='off'
                                    onChange={(e) => this.handleInputChange(e,this.props.t('Character.search_text'))}
                                    onFocus={(e)=>{this.focusAutoCompleteOff(e)}}
                                    onKeyDown={(evt)=> preventinputToString(evt,evt.target.value,(this.props.t('Character.search_text')))}

                                />
                            </TooltipWrapper>
                               
                                {Icons.SearchIcon("#4F4F4F", 16.62)}
                            </Col>
                        </Col>
                        {showNewButton && fresh && <Col xs={7} className="sub-design2">
                            <Button variant='outline-secondary' className='mainlist-btn' size='sm' onClick={()=>this.handleNewClick(defSaveObj.department)}>{this.props.t("NEW")}</Button>
                        </Col>}


                    </Col>
                </Row>
                <Row className='versiondata-wrapper'>
                    
                    <Col className="version-data">
                        {(defSaveObj.searchFromDate&&!this.props.isAUICon)?
                         <TooltipWrapper text={this.props.defSaveObj && this.props.defSaveObj.department?this.props.defSaveObj.department.department_name:"-"} placement="bottom"><Col className="department">
                         {this.props.defSaveObj && this.props.defSaveObj.department?this.props.defSaveObj.department.department_name:"-"}
                     </Col></TooltipWrapper>
                        :<></>}
                        {defSaveObj.searchFromDate?
                            <Col className="search-from" title={this.props.t("SEARCH_FROM_DATE")}>
                                {convertDate(defSaveObj.searchFromDate)}
                            </Col> 
                        :<></>}
                        {defSaveObj.searchToDate?
                            <Col className="search-to"  title={this.props.t("SEARCH_TO_DATE")}>
                                {convertDate(defSaveObj.searchToDate)}
                            </Col>
                        :<></>}
                        {defSaveObj.createdDate?
                            <Col className="created-date" title={this.props.t("CREATED_DATE")}>
                                {convertDate(defSaveObj.createdDate)}
                            </Col>
                        :<></>}
                        {defSaveObj.version?                          
                            <Col className="version" title={this.props.t("version")}>
                                {defSaveObj.version ? "v"+defSaveObj.version : ""}
                            </Col>
                        :<></>}
                        
                        {defSaveObj.edited_user?   
                            <Col className={this.props.isAUICon?"edited-user-aui":"edited-user"} title={this.props.t("EDITED_USER")}>
                                {defSaveObj.edited_user ? defSaveObj.edited_user : ""}
                            </Col>
                        :<></>}
                         
                    </Col>                   

                    {showDropdown && (
                        <Col className="mp-dropdown" ref={this.dropdownRef}>
                            <div className='dropdown-box'>
                                    
                                {!isDataLoading ? <div className='dropdown-box-wrapper'>
                                    
                                    {mpList && mpList.length > 0 ? 

                                    mpList.map((mp, index) => (         

                                    <div key={index} className={"dropdown-singleitem-wrapper "+(this.props.isAUICon?"auiview":mp?(!this.props.isAuiViewsAllow || !mp.masterPlanogram.isAUIConverted?"noauiview":""):"")+" "+(editEnabled !== index ? 'dropdown-item-l' : 'dropdown-item-sm')} >
                                        <div className={"dropdown-single-item "+(this.props.defSaveObj.mp_id === mp.masterPlanogram.id ? "dropdown-single-item-border":"")}>
                                            <div className='simulate-status'>
                                                {/* {mp?mp.masterPlanogram.implementedFloorLayouts.some(layout => {
                                                    return layout.status === 'online' && layout.floorLayout.floorStatus === 'ACTIVE' && layout.floorLayout.status === 'online';
                                                })
                                                ?Icons.SimulateIcon(21):<></>:<></>} */}
                                                {mp?mp.masterPlanogram.storeDepartmentAuiConnection.find(obj => obj.status = "online")
                                                ?Icons.SimulateIcon(21):<></>:<></>}
                                            </div>
                                            <div className='from-date'>
                                                {mp? new Date(mp.masterPlanogram.searchFromDate).toISOString().substr(5, 2) + '.' + new Date(mp.masterPlanogram.searchFromDate).getFullYear():""} -
                                            </div>
                                            {editEnabled !== index &&
                                            <TooltipWrapper text={mp? mp.masterPlanogram.name === "" || mp.masterPlanogram.name === null ? "noname":mp.masterPlanogram.name :""} placement="top">
                                            <div className='version-name-label'>
                                                {mp? mp.masterPlanogram.name === "" || mp.masterPlanogram.name === null ? "noname":((mp.masterPlanogram.name.substring(0,10))+(mp.masterPlanogram.name.length>10?"..":"")):""}
                                                <div className='version-edit' onClick={()=>this.handleEditClick(index,mp.masterPlanogram.name)}>
                                                    {Icons.EditIcon(12)}
                                                </div>
                                            </div>
                                           </TooltipWrapper>
                                            }
                                            {editEnabled === index && <div className='version-name-input'>
                                                <Form.Control
                                                    className="form-control versionedit-txt"
                                                    ref={this.editRef}
                                                    type="text"
                                                    value={editName}
                                                    onKeyDown={(e) => this._handleKeyDown(false, e, index, mp.masterPlanogram.id, mp.department.id)}
                                                    onFocus={ (e) => e.target.setAttribute('autocomplete', 'off')}
                                                    onChange={(e) => this.handleInputEditChange(e)}
                                                    onBlur={(e) => this.handleEditClick(index, mp.masterPlanogram.name, e, mp.masterPlanogram.id, mp.department.id)}
                                                />
                                                {/* <span className='closeedit-link' onClick={() => this.handleEditClick(index,mp.masterPlanogram.name)}><CheckIcon size={16} /></span> */}
                                            </div>}
                                            <TooltipWrapper text= {(this.props.t("MIN")+" "+ (mp?mp.min_revenue:"-"))} placement="top">
                                                <div className='min-count'>
                                                    {this.props.t("MIN")} {mp?mp.min_revenue:"-"}
                                                </div>
                                            </TooltipWrapper>
                                            <TooltipWrapper text= {(this.props.t("FACING")+" "+ (mp?mp.min_qty:"-"))} placement="top">
                                                <div className='facing-count'>
                                                    {mp?mp.min_qty:"-"} {this.props.t("FACING")}
                                                </div>
                                            </TooltipWrapper>
                                            <TooltipWrapper text= {(this.props.t("MVP")+" "+ (mp?mp.mvp_percentage:"-")+"%")} placement="top">
                                                <div className='mvp-count'>
                                                    {mp?mp.mvp_percentage:"-"}% {this.props.t("MVP")} 
                                                </div>
                                            </TooltipWrapper>
                                            
                                            

                                        </div>
                                            {!this.props.isAUICon?
                                                mp? 
                                                    mp.masterPlanogram.isAUIConverted && this.props.isAuiViewsAllow?
                                                    <>
                                                        <ButtonGroup vertical className='vmp-group-buttons'>
                                                        
                                                            <Button className="vmp-button" variant='outline-secondary' size='sm' onClick={() => (this.handleLoadMVP(mp))} title={this.props.t("VIEW_VMP")}>
                                                                {Icons.VMPIcon("#5128A0", 15)}
                                                            </Button>

                                                            <Button className="aui-button" variant='outline-secondary' size='sm' onClick={() => (this.handleAuiRedirect(mp))} title={this.props.t("VIEW_AUI")}>
                                                                {Icons.AUIIcon("#5128A0", 14)}
                                                            </Button>
                                                            
                                                        </ButtonGroup>

                                                        <ButtonGroup vertical className='vmp-group-buttons2'>

                                                            <Button className="duplicate-button" variant='outline-secondary' size='sm' onClick={() => this.handleDuplicateClick(mp)} title={this.props.t("DUPLICATE_VMP")}>{Icons.DuplicateIcon("#5128A0", 8)}</Button>
                                                            
                                                            <Button  className="delete-button" variant='outline-secondary' size='sm' onClick={() => this.handleDeleteClick(mp)} title={this.props.t("btnnames.delete")}>{Icons.BinIcon("#5128A0", 8)}</Button>
                                                        
                                                        </ButtonGroup>
                                                    </>
                                                    :<>
                                                        <ButtonGroup vertical >
                                                            
                                                            <Button className="vmp-button" variant='outline-secondary' size='sm' onClick={() => (this.handleLoadMVP(mp))} title={this.props.t("VIEW_VMP")}>
                                                                {Icons.VMPIcon("#5128A0", 15)}
                                                            </Button>

                                                            <Button className="duplicate-button" variant='outline-secondary' size='sm' onClick={() => this.handleDuplicateClick(mp)} title={this.props.t("DUPLICATE_VMP")}>{Icons.DuplicateIcon("#5128A0", 8)}</Button>
                                                            
                                                            <Button  className="delete-button" variant='outline-secondary' size='sm' onClick={() => this.handleDeleteClick(mp)} title={this.props.t("btnnames.delete")}>{Icons.BinIcon("#5128A0", 8)}</Button>

                                                        </ButtonGroup>
                                                    </>
                                                :<></>
                                            :<></>}
                                            
                                            {this.props.isAUICon?<ButtonGroup vertical>
                                                <Button className="aui-button" variant='outline-secondary' size='sm' onClick={() => (this.changeAUIVersion(mp))} title={this.props.t("VIEW_AUI")}>
                                                    {Icons.AUIIcon("#5128A0", 14)}
                                                </Button>
                                                <Button className="vmp-button" variant='outline-secondary' size='sm' onClick={() => (this.handleLoadMVP(mp))} title={this.props.t("VIEW_VMP")}>
                                                    {Icons.VMPIcon("#5128A0", 15)}
                                                </Button>
                                                <Button  className="delete-button" variant='outline-secondary' size='sm' onClick={() => this.handleDeleteClick(mp)} title={this.props.t("btnnames.delete")}>{Icons.BinIcon("#5128A0", 8)}</Button>
                                            </ButtonGroup>:<></>}
                                    </div>
                                    )) 
                                    :
                                    <div className='no-versions'>{this.props.t("NO_VERSIONS_AVAILABLE")}</div>
                                    }

                                </div> : <></> }

                                {isDataLoading?<Col className='loading-view'><img src={loadinggif} alt="dept loading" /></Col>:<></>}
                            </div>
                        </Col>
                    )}
                </Row>
                
                <Modal size="md" centered className={'new-notice-modal disstore-warn-modal '+(this.props.isRTL === "rtl" ? "RTL":"LTR")} show={this.state.showDelModal} onHide={() => this.props.toggleTagWarn()} backdrop="static">
                    <Modal.Body>
                        <div className='closebtn' onClick={() => this.setState({showDelModal:false, delmp:null})}><XIcon size={20} /></div>
                        <Row>
                            <Col xs={10} className="col-centered" style={{textAlign:"center",padding:"0px"}}>
                    
                                <Col className={'txt-label'}><span><b>{this.props.t('AREYOUSURE_YOU_WANT_TO_DELETE')}</b><br/><br/></span></Col>
                                <div><h6>{this.props.t(`THIS_WILL_DELETE_THE_VERSION`)}<b>{this.state.delmp?this.state.delmp.masterPlanogram.name:""}</b></h6>
                                </div>
                                <div id="formBasicPassword" className={"form-group"} style={{width:"90%"}}> {/*width:"100%*/}
                                    <button className='eyebtn' onClick={()=>{this.setState({showPass:!this.state.showPass})}}>{this.state.showPass? Icons.EyeIcon(20,"#5128A0") : Icons.EyeCloseIcon(20,"#5128A0")}</button>
                                    <AcInput atype={this.state.showPass?"text":"password"} eleid="frm_password" aid="password" aobj={this.state.lobj} avset={this.state.lval} aplace={this.props.t('formfield.enterpass')} avalidate={[ValT.empty]} akeyenter={this.handleDeleteYesTrigger} showlabel={false}/>
                                    {/* <AcInput atype="password" eleid="frm_password" aid="password" aobj={this.state.lobj} avset={this.state.lval} aplace={this.props.t('formfield.enterpass')} avalidate={[ValT.empty]}  showlabel={false}/> */}
                                </div>

                                <ul className='list-inline'>
                                    <li className='list-inline-item'>
                                        <Button className='backto-btn' ref={this.yesRef} onClick={()=>this.deleteMPVersion(this.state.delmp)}>{this.props.t("btnnames.yes")}</Button>
                                    </li>
                                    <li className='list-inline-item'>
                                        <Button className='gotit-btn' onClick={()=>this.setState({showDelModal:false, delmp:null})}>{this.props.t("btnnames.no")}</Button>
                                    </li>
                                </ul>
                            </Col>
                        </Row>
                    </Modal.Body>
                </Modal>

            </Col>
        );
    }
}

const mapDispatchToProps = dispatch => ({
    setMasterPlanAction: (payload) => dispatch(selectedMasterPlanSetAction(payload)),
    setVersionName: (payload) => dispatch(mpVersionName(payload))
});

export default withTranslation()(withRouter(connect(null,mapDispatchToProps)(SearchMPList)));

