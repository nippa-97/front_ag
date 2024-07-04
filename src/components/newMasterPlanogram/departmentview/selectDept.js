import React, { Component } from 'react';
import { Col, Breadcrumb, Row, Button, Form } from 'react-bootstrap';
import { withTranslation } from 'react-i18next';
import { withRouter, Link } from 'react-router-dom';
import FeatherIcon from 'feather-icons-react';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import { connect } from 'react-redux';

import { submitSets } from '../../UiComponents/SubmitSets';
import { submitCollection } from '../../../_services/submit.service';
import { alertService } from '../../../_services/alert.service';
import { AcNoDataView, AcViewModal } from '../../UiComponents/AcImports';
import { preventinputToString, roundOffDecimal } from '../../../_services/common.service';
import { FindMPMaxResult, findResolutionShowCountfoDep, TooltipWrapper } from '../AddMethods';

import { selectedMasterPlanSetAction, mpDepartmentsSetAction, mpDeptSearchSetAction, newRefresh, AffectedSimulationModalSetAction } from '../../../actions/masterPlanogram/masterplanogram_action';
import { AUINavigateIcon, Icons, SimulationShortcutIcon } from '../../../assets/icons/icons';

import loadinggif from '../../../assets/img/loading-sm.gif';

import './selectdept.css';
import { confirmAlert } from 'react-confirm-alert';
import AllSimulationModal from '../simulateview/AllSimulationModal/AllSimulationModal';
import { SearchIcon, XIcon } from '@primer/octicons-react';


/**
 * select department for new master planogram
 *
 * @export
 * @class SelectDept
 * @extends {Component}
 */
export class SelectDept extends Component {
    _isMounted = false;

    constructor(props){
        super(props);
        this.state = {
            //search depts
            searchObj: this.getDefSearchObj(),
            startidx: 0, totalresults: 0, //startpage and total results 
            maxResult: 12,
            //loaded data
            deptList: [],
            defSaveObj: this.getDefSaveObj(),
            isShowDeptModal: false, isShowLoadingModal: false,
            isDeptDataLoading: true,

            //simulation direct
            isallsimulatemodal:false,
            bottomFieldCount:0,
            openOneCategory:false,
            isAuiViewsAllow:false,
            newSnapshotId:-1,
            isopenfromAffectedSimList:false,
            selectedBranch:null,
            isFixed:false,
        }
    }
    //toggle onecategory open: 
    toggleOneCategory=()=>{
        this.setState({openOneCategory:!this.state.openOneCategory})
    }

    componentDidMount(){
        this._isMounted = true;

        if(this._isMounted){
            var cviewwidth = (window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth);
            let scrollcontent = document.getElementById("depscroll-content");
            let scrollcontheight = (scrollcontent && scrollcontent.offsetHeight?scrollcontent.offsetHeight:500);
            
            let maxresultcount = FindMPMaxResult(scrollcontheight, cviewwidth> 2500?250:175, 0);
            let totalmaxresults = (maxresultcount > 0?(maxresultcount * findResolutionShowCountfoDep(6)):this.state.maxResult);
            
            let ccachesearchobj = (this.props.mpstate && this.props.mpstate.mpDeptSearch?JSON.parse(JSON.stringify(this.props.mpstate.mpDeptSearch)):null);
            //reset startidx if search obj available
            if(ccachesearchobj){
                ccachesearchobj.startIndex = 0;
            }

            let isUserAUIAllowed = true; //false
            //user check for AUI allow
            /* if(this.props.signedobj && this.props.signedobj.signinDetails){
                let userobj = this.props.signedobj.signinDetails;

                if(userobj.userRolls){
                    let userrole = userobj.userRolls.systemMainRoleType;
                    // console.log(userrole);

                    if(userrole === usrRoles.CM){
                        isUserAUIAllowed = true;
                    }
                }
            } */

            this.setState({ 
                maxResult: totalmaxresults, 
                searchObj: (ccachesearchobj?ccachesearchobj:this.getDefSearchObj()),
                isAuiViewsAllow: (isUserAUIAllowed && this.props.signedDetails.isAUION!==undefined?this.props.signedDetails.isAUION:false) 
            }, () => {
                this.props.setDeptSearchAction(null); //reset search
                this.loadAllDepartments(true);
                // console.log(this.props.mpstate.AffectedSimulationsModalData);
                if(this.props.mpstate&&this.props.mpstate.AffectedSimulationsModalData){
                    let rdx=this.props.mpstate.AffectedSimulationsModalData
                    //opening direct sim but with redux sim data
                    let csaveobj =rdx;
                    this.setState({ 
                        bottomFieldCount: rdx.fieldCount,defSaveObj:csaveobj,newSnapshotId:rdx.simulationSnapshotId,selectedBranch:rdx.store,
                        isopenfromAffectedSimList:true,isFixed:rdx.fixed_percentage// fieldCountCallOver:true 
                    },() => {
                        this.toggleSimulateAllModal()
                        this.props.setAffectedSimulationModalData(null)
                    });
                    //after setting
                    
                }
            });

            this.getAllTags();
        }

        this.props.setNewRefresh(false);
    }

    componentWillUnmount(){
        this._isMounted = false;
    }
    //default search 
    getDefSearchObj = () => {
        return { name: "", isReqPagination: true, startIndex: 0, maxResult: 8 };
    }
    //default save object
    getDefSaveObj = () => {
        return { mp_id: -1, is_new: true, is_delete: false, department: {}, categories: [] };
    }
    //#MP-DEP-03 select department and triggers redirect
    handleChangeDepartment = (cdept, directType, isshownewprod) => {
        let isUserRestricted = this.props.isUserRestricted;

        if(isUserRestricted){
            if(cdept.isSingleCatCompleted){
                this.ClickdirectSimulation(null,cdept);
            } else{
                alertService.warn(this.props.t("SIMULATOR_NOT_AVAILABLE"));
            }
        } else{
            let csaveobj = this.getDefSaveObj();
            csaveobj.mp_id = (cdept.latestMpId > 0?cdept.latestMpId:-1);
            csaveobj.isLatestAvailable = (cdept.latestMpId > 0);
            csaveobj.department["department_id"] = cdept.departmentId;
            csaveobj.department["department_name"] = cdept.departmentName;
            csaveobj.categories = [];
            csaveobj.directType = (directType?directType:"");
            csaveobj.isShowNewProd = isshownewprod;
    
            let depslist = JSON.parse(JSON.stringify(this.state.deptList));
            let totresults = this.state.totalresults;
            let loadedDepsObj = {};
            loadedDepsObj.totalresults = totresults;
            loadedDepsObj.departments = [];
    
            if(totresults === depslist.length){
                loadedDepsObj.departments = [];
            }
            if(totresults > 12 && depslist.length <12){
                loadedDepsObj = null;
            }
            if(totresults > 12 && depslist.length > 12){
                depslist.length = 12;
                loadedDepsObj.departments = depslist;
            }
            //console.log(loadedDepsObj);
            this.props.setLoadedDepsAction(loadedDepsObj);
            this.setState({ defSaveObj: csaveobj }, () => {
                //console.log(this.state.defSaveObj);
                this.handleRedirectView();
            });
        }
    }
    //redirect to layout view
    handleRedirectView = () => {
        if(this.state.defSaveObj.department && this.state.defSaveObj.department.department_id > 0){
            this.props.setDeptSearchAction(this.state.searchObj);
            this.props.setMasterPlanAction(this.state.defSaveObj);
            this.props.history.push("/masterplanograms/layoutview");
        } else{
            alertService.error(this.props.t("selectdepartment"));
        }
    }
    //#MP-DEP-01 load all departments
    loadAllDepartments = (isonload,isLoadMore) => {
        let svobj = this.state.searchObj;
        svobj.startIndex = this.state.startidx;
        svobj.maxResult = this.state.maxResult;

        this.setState({ isDeptDataLoading: true }, () => {
            this.scrollTolDivBottom();
            submitSets(submitCollection.mpDepartmentList, svobj, true).then(res => {
                //console.log(res);

                let calldepts = this.state.deptList;
                if(res && res.status){
                    let newdeptlist = isLoadMore?calldepts.concat(res.extra):res.extra;
                    this.setState({
                        deptList: newdeptlist,
                        totalresults: (this.state.startidx === 0?res.count:this.state.totalresults),
                        isDeptDataLoading: false,
                    }, () => {
                        this.calculateDeptDetails(isonload);
                    });
                } else{
                    this.setState({ isDeptDataLoading: false });
                }
            });    
        });
        
    }
    //div scroll to bottom
    scrollTolDivBottom = () => {
        var scrollDiv = document.getElementById("depscroll-content");
        scrollDiv.scrollTop = scrollDiv.scrollHeight;
    }
    //#MP-DEP-02 loading dept details
    calculateDeptDetails = (isonload) => {
        let viewdeptDetails = this.state.deptList;
        for (let i = 0; i < viewdeptDetails.length; i++) {
            const deptitem = viewdeptDetails[i];
            // deptitem["percentage"] = roundOffDecimal(((deptitem.coveredCategoryCount / deptitem.categoryCount) * 100),2);
            deptitem["percentage"] = roundOffDecimal(deptitem.completedPercentage,2);
            deptitem["percentagecolor"] = (deptitem.percentage < 50 ? "#F5B041" :"#5FAF4E");
        }
        
        this.setState({ deptList: viewdeptDetails }, () => {
            if(!isonload){
                this.scrollTolDivBottom();
            }
        });
    }
    //load more departments to department list
    handleLoadMoreDepartments = () =>{
        this.setState({startidx: this.state.startidx + this.state.maxResult},()=>{
            this.loadAllDepartments(false,true);
        });
    }
    //direct simulation
    
    ClickdirectSimulation=(e,item)=>{

        let svobj = { mp_id: item.latestMpId };

        this.setState({ isShowLoadingModal: true },()=>{
            
            submitSets(submitCollection.getMp, svobj, false, null, true).then(res => {
                   
                   if(res && res.status){
                        let csaveobj = this.state.defSaveObj;
                        csaveobj.department["department_id"] = item.departmentId;
                        csaveobj.department["department_name"] = item.departmentName;
                        csaveobj["mp_id"] = item.latestMpId;
                        csaveobj["masterPlanogram"] = res.extra;
                        csaveobj.categories = [];
                        // csaveobj.version=item.latestMpVersion
                        this.setState({ defSaveObj: csaveobj }, () => {
                            // console.log(this.state.defSaveObj);
                            this.getfieldcount(item);
                        });
                    }else{
                        // alertService.error(res.extra===""?this.props.t("erroroccurred"):res.extra);
                        this.setState({isShowLoadingModal: false });
                    }   
            });
        })
       
       

        // let depslist = JSON.parse(JSON.stringify(this.state.deptList));
        // let totresults = this.state.totalresults;
        // let loadedDepsObj = {};
        // loadedDepsObj.totalresults = totresults;
        // loadedDepsObj.departments = [];

        // if(totresults === depslist.length){
        //     loadedDepsObj.departments = [];
        // }
        // if(totresults > 12 && depslist.length <12){
        //     loadedDepsObj = null;
        // }
        // if(totresults > 12 && depslist.length > 12){
        //     depslist.length = 12;
        //     loadedDepsObj.departments = depslist;
        // }
        //console.log(loadedDepsObj);
        // this.props.setLoadedDepsAction(loadedDepsObj);
        
    }
    getfieldcount=(item)=>{
        let svobj = { chainHasDepartmentId:item.departmentId }; //nee change  chainHasDepartmentId:818 delete and add mpId:item.latestMpId

        submitSets(submitCollection.mostFrequentlyUsedFieldCount, svobj, false).then(res => {
            //console.log(res);
            if(res && res.status){
                this.setState({ bottomFieldCount: res.extra,fieldCountCallOver:true },() => {
                    this.toggleSimulateAllModal()
                });
            }else{
                this.setState({fieldCountCallOver:true });
            }
        });
    }
    toggleSimulateAllModal=(isNoConfirm, isLoadDetails)=>{
        if(this.state.isallsimulatemodal){
            if(this.props.mpstate.mpstackHistory&&this.props.mpstate.mpstackHistory.past&&this.props.mpstate.mpstackHistory.past.length>0){
                //have unsavedchnages
                confirmAlert({
                    title: this.props.t('UNSAVE_CHANGES'),
                    message: (this.props.t('YOU_HAVE_UNSAVED_CHANGES_SURE_TO_LEAVE')),
                    overlayClassName: (this.props.isRTL === "rtl" ? "alertrtl-content" : ""),
                    buttons: [{
                        label: this.props.t('btnnames.yes'),
                        onClick: () => {  
                            setTimeout(() => {
                                this.closeSimulationModal(isNoConfirm, isLoadDetails,true)
                            }, 50);  
                            
                        }
                    }, {
                        label: this.props.t('btnnames.no')
                    }]
                });
            }else{
                //no unsaved changes
                this.closeSimulationModal(isNoConfirm, isLoadDetails)
            }
          
        }else{
            //open model
            this.setState({ isallsimulatemodal: !this.state.isallsimulatemodal,openOneCategory:false, isShowLoadingModal: false });
        }
    }
    closeSimulationModal=(isNoConfirm, isLoadDetails,isclosewithoutask)=>{
        this.sendmarkStackableCall()
            if(isNoConfirm){
                this.setState({ isallsimulatemodal: !this.state.isallsimulatemodal,openOneCategory:false, isShowLoadingModal: false });
            }else{
                //close model
                if(isclosewithoutask){
                    this.setState({ isallsimulatemodal: !this.state.isallsimulatemodal,openOneCategory:false, isShowLoadingModal: false,
                        newSnapshotId:-1,isopenfromAffectedSimList:false, //reseeting snapshot id when modal close
                     });
                }else{
                    confirmAlert({
                        title: this.props.t('CLOSE_SIMULATION'),
                        message: "",
                        overlayClassName: (this.props.isRTL === "rtl" ? "alertrtl-content" : ""),
                        buttons: [{
                            label: this.props.t('btnnames.yes'),
                            onClick: () => {
                                this.setState({ isallsimulatemodal: !this.state.isallsimulatemodal,openOneCategory:false, isShowLoadingModal: false,
                                    newSnapshotId:-1,isopenfromAffectedSimList:false, //reseeting snapshot id when modal close
                                 });
                            }
                        }, {
                            label: this.props.t('btnnames.no'),
                            onClick: () => {
                                return false;
                            }
                        }]
                    });
                }
            }
    }
    //load all tags
    getAllTags = () => {
        let sobj = {isReqPagination: false, type:"store", tagName: ""}
        submitSets(submitCollection.searchTags, sobj).then(res => {
            //console.log(res.extra);

            if(res && res.status && res.extra){
                this.setState({
                    loadedTagsList: res.extra,
                });
            }
        });
    }
    sendmarkStackableCall=(type)=>{
        if(this.props.mpstate.mpStackableProdList!==null&&this.props.mpstate.mpStackableProdList.length>0){
            this.setState({
                // loadinggif:true,loadingstackablecall:true,
                isStackableEdited:false},()=>{
                var sobj =this.props.mpstate.mpStackableProdList!==null?this.props.mpstate.mpStackableProdList:[]
                submitSets(submitCollection.bulkUpdateByProductClick, sobj, false, null, true).then(res => {
                    if(res && res.status){
                        // alertService.success(res.extra===""?this.props.t("SUCCESSFULLY_UPDATED"):res.extra)
                        this.setState({
                            // loadinggif: false,loadingstackablecall:false,
                            markablestackable:false, stackableCountofmark:"",},()=>{
                            
                        });
                    }else{
                        // alertService.error(res.extra===""?this.props.t("erroroccurred"):res.extra)
                        // this.setState({loadinggif: false,loadingstackablecall:false})
                    }
                });
                if(type==="back"){
                    this.toggleOneCategory()
                }
            })
        }
      
    }
    // change haveChnagesinCat
    handlehaveChnagesinCat=(val)=>{
        this.setState({haveChnagesinCat:val})
    }
    toggleLoadingModal = (isshow, _callback) => {
        this.setState({ isShowLoadingModal: isshow }, () => {
            if(_callback){
                _callback();
            }
        });
    }

    changeSearchObj = (ckey, cval,e,msg) => {
        if(!preventinputToString(e,e.target.value,msg)){
            e.preventDefault()
            return
        }
        let csaveobj = this.state.searchObj;
        csaveobj[ckey] = cval;
        csaveobj.startIndex = 0;

        this.setState({ searchObj: csaveobj });
    }

    triggerSearchObj = (ctype, evt) => {
        if((ctype === "keydown" && evt.which === 13) || ctype === "reset"){
            let csearchobj = this.state.searchObj;
            if(ctype === "reset"){
                csearchobj.name = "";
            }
            
            this.setState({ searchObj: csearchobj, startidx: 0, deptList: [], totalresults: 0 }, () => {
                this.loadAllDepartments();
            })
        }else{
            preventinputToString(evt,evt.target.value,(this.props.t('Character.search_text')))
        }
    }

    handleAuiRedirect = (defsaveobj) => {
        let newdeptobj = {
            latestMpId: defsaveobj.mp_id,
            departmentId: defsaveobj.department.department_id,
            departmentName: defsaveobj.department.department_name
        }

        this.handleChangeDepartment(newdeptobj, "AUI");
    }
    clicknewproductshortcut=(cdept, directType, isshownewpro)=>{
        if(this.state.isAuiViewsAllow){
            this.handleChangeDepartment(cdept, directType, isshownewpro);
        }
        
    }

    loadDeptIcon = (depticon) => {
        let cdepticon = (depticon?depticon.departmentIconName:"DEP_DEFAULT");

        let returnicon = Icons.DepIconsLoad("DEP_DEFAULT", {size:55, color:"#fff"});
        if(Icons.DepIconsLoad(cdepticon, {size:55, color:"#fff"})){
            returnicon = Icons.DepIconsLoad(cdepticon, {size:55, color:"#fff"});
        }

        return returnicon;
    }

    render() {
        let isUserRestricted = this.props.isUserRestricted;

        return (
            <Col xs={12} className={"main-content dept-select-main "+(this.props.isRTL==="rtl"?"RTL":"")} dir={this.props.isRTL}>
                <Breadcrumb dir="ltr">
                    {this.props.isRTL==="rtl"?<>
                    <Breadcrumb.Item active>{isUserRestricted?this.props.t("SIMULATOR"):this.props.t('master_planograms')}</Breadcrumb.Item>
                    <li className="breadcrumb-item"><Link to={"/"+this.props.HomePageVal} role="button">{this.props.t('home')}</Link></li>
                    </>:<>
                    <li className="breadcrumb-item"><Link to={"/"+this.props.HomePageVal} role="button">{this.props.t('home')}</Link></li>
                    <Breadcrumb.Item active>{isUserRestricted?this.props.t("SIMULATOR"):this.props.t('master_planograms')}</Breadcrumb.Item>
                    </>}
                </Breadcrumb>  

                <Col xs={12}>
                    <Col xs={12} md={10} lg={8} className="col-centered col-xxl-11 dept-select-content">
                        <Col xs={12} className="dep-search-section">
                            <Col className='form-inline'>
                                <Form.Control type='text' 
                                    value={this.state.searchObj.name} 
                                    onChange={e => this.changeSearchObj("name", e.target.value,e,this.props.t('Character.search_text'))} 
                                    onKeyDown={e => this.triggerSearchObj("keydown", e)}
                                    placeholder={this.props.t("TYPE_HERE_TO_SEARCH")} 

                                    />
                                {this.state.searchObj.name !== ""?<span className='close-link' onClick={() => this.triggerSearchObj("reset")}><XIcon size={18} /></span>:<></>}
                                <SearchIcon size={18} />
                            </Col>
                        </Col>

                        <h2><span>{this.props.t("THIS_IS_YOUR")}</span>{isUserRestricted?this.props.t("SIMULATOR"):this.props.t("master_planogram")}</h2>
                        
                        <Col xs={12} id="depscroll-content" className="dep-section">
                            <Row>
                                {this.state.deptList && this.state.deptList.length > 0?<>
                                    {this.state.deptList.map((xitem,xidx) => {
                                        return <React.Fragment key={xidx}>
                                            <Col xs={12} sm={3} lg={2} className="dept-single-item">
                                                <Col className='single-dept-wrapper' style={{width:"100%"}}>
                                                    
                                                    {!isUserRestricted?<>
                                                        <Col className={"simulate-shortcut "+(xitem.isSingleCatCompleted?"":" d-none")} onClick={(e) =>this.ClickdirectSimulation(e,xitem)}><SimulationShortcutIcon size={30}/></Col>
                                                        {this.state.isAuiViewsAllow?<Col className={"simulate-shortcut auiplay "+((xitem.isSingleCatCompleted && xitem.latestMpId > 0)?"":" d-none")} onClick={() => this.handleChangeDepartment(xitem,"AUI")}><AUINavigateIcon size={30}/></Col>:<></>}
                                                        <div className={(xitem.departmentNewProdCount>0?(xitem.isSingleCatCompleted?"count-l":"count"):" d-none")} onClick={() => this.clicknewproductshortcut(xitem, "AUI", true)}>{xitem.departmentNewProdCount}</div>
                                                    </>:<></>}

                                                    <Col className={"sub-content "+(this.state.defSaveObj.department && this.state.defSaveObj.department.department_id === xitem.departmentId?"active":"")} onClick={() => this.handleChangeDepartment(xitem)}>
                                                       <Col xs={12} className="round-content">  
                                                            <div>
                                                                <Col xs={12} className='img-div'>
                                                                    <div className='dept-icon'>
                                                                        {Icons.DepIconsLoad((xitem.departmentIcon? xitem.departmentIcon.departmentIconName : "DEP_DEFAULT") , {size:55, color:"#fff"})}
                                                                    </div>
                                                                </Col>   
                                                                <CircularProgressbar
                                                                    className="prgbar"
                                                                    value={xitem.percentage}
                                                                    background
                                                                    backgroundPadding={0}
                                                                    styles={buildStyles({
                                                                    backgroundColor: "#744ac5",
                                                                    pathColor: xitem.percentagecolor,
                                                                    trailColor: "transparent",
                                                                    strokeLinecap: 'butt'
                                                                    })}
                                                                />
                                                            </div>
                                                        </Col>
                                                        <TooltipWrapper text={xitem.departmentName}>
                                                            <h5>{(xitem.departmentName.substring(0,20)+(xitem.departmentName.length > 20?"..":""))}</h5>
                                                        </TooltipWrapper>
                                                </Col>
                                                    
                                                </Col>
                                            </Col>  
                                        </React.Fragment>;
                                    })}
                                </>:!this.state.isDeptDataLoading?
                                    <AcNoDataView />
                                :<></>}   

                                {this.state.isDeptDataLoading?<Col className='deptloading-view'><img src={loadinggif} alt="dept loading" /></Col>:<></>} 
                            </Row>
                        
                        </Col>
                        <Col xs={12} className="deptbottom-btns" style={{textAlign:"center"}}>
                            {this.state.deptList.length < this.state.totalresults?<Button className="load-more-btn" onClick={()=>this.handleLoadMoreDepartments()}>{this.props.t("btnnames.loadmore")}</Button>:<></>}
                            {!isUserRestricted?<Link to="/departments" className="adddept-link"><Button className="float-right btn-add-department"><FeatherIcon icon="plus" size={30} /></Button></Link>:<></>}
                        </Col>
                    </Col>   
                </Col>  
                {this.state.isallsimulatemodal?<AllSimulationModal
                    isFixed={this.state.isFixed}
                    selectedBranch={this.state.selectedBranch}
                    isFromStandaloneView={true}
                    isopenfromAffectedSimList={this.state.isopenfromAffectedSimList}
                    selectedTagList={this.state.defSaveObj.selectedTagList}
                    newSnapshotId={this.state.newSnapshotId}
                    isAuiViewsAllow={this.state.isAuiViewsAllow}
                    isSalesCycle={false} 
                    simType="Normal"
                    department={this.state.defSaveObj.department}
                    bottomFieldCount={this.state.bottomFieldCount}
                    defSaveObj={this.state.defSaveObj} 
                    mpstate={this.props.mpstate} 
                    chartFilterDates={this.state.chartFilterDates}
                    isallsimulatemodal={this.state.isallsimulatemodal} 
                    isRTL={this.props.isRTL} 
                    dmode={this.props.dmode}
                    loadedTagsList={this.state.loadedTagsList} 
                    openOneCategory={this.state.openOneCategory} 
                    haveChnagesinCat={this.state.haveChnagesinCat}
                    signedobj={this.props.signedobj} 
                    isDirectSimulation={true}
                    handleAuiRedirect={this.handleAuiRedirect}
                    handlehaveChnagesinCat={this.handlehaveChnagesinCat}
                    toggleOneCategory={this.toggleOneCategory} 
                    toggleLoadingModal={this.toggleLoadingModal}
                    toggleSimulateAllModal={this.toggleSimulateAllModal} 
                    sendmarkStackableCall={this.sendmarkStackableCall}
                    
                    />:<></> }
                <AcViewModal showmodal={this.state.isShowLoadingModal} />
            </Col>
        );
    }
}

const mapDispatchToProps = dispatch => ({
    setMasterPlanAction: (payload) => dispatch(selectedMasterPlanSetAction(payload)),
    setLoadedDepsAction: (payload) => dispatch(mpDepartmentsSetAction(payload)),
    setDeptSearchAction: (payload) => dispatch(mpDeptSearchSetAction(payload)),
    setNewRefresh: (payload) => dispatch(newRefresh(payload)),
    setAffectedSimulationModalData: (payload) => dispatch(AffectedSimulationModalSetAction(payload)),
});

export default withTranslation()(withRouter(connect(null,mapDispatchToProps)(SelectDept)));