import { Component, } from 'react';
import { Col, Row} from 'react-bootstrap';
import { withTranslation } from 'react-i18next';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
// import FeatherIcon from 'feather-icons-react';
import { ChevronLeftIcon, ChevronRightIcon } from '@primer/octicons-react';

// import { submitSets } from '../../UiComponents/SubmitSets';
// import { submitCollection } from '../../../_services/submit.service';
import { roundOffDecimal } from '../../../_services/common.service';
import { Icons } from '../../../assets/icons/icons';

import { TooltipWrapper } from '../AddMethods';

import { selectedMasterPlanSetAction, mpDepartmentsSetAction, newRefresh } from '../../../actions/masterPlanogram/masterplanogram_action';

import './department-switch.css';
import { submitCollection } from '../../../_services/submit.service';
import { submitSets } from '../../UiComponents/SubmitSets';

import loaderanime from '../../../assets/img/loading-sm.gif';

class DepartmentSwitch extends Component {
    constructor(props){
        super(props);
        
        this._isMounted = false;
        
        this.state = {
            searchObj: this.getDefSearchObj(),
            defSaveObj: this.getDefSaveObj(),

            oriDepartmentList:[],
            departmentlist : [],
            sliderItems:[],
            sliderIndex:0,
            sliderDirection:"right",

            singleitemwidth: 40, slideritems: 12,
            slideritemwidth: 500, 

            startIndex:0, isDeptListLoading:false, allDepartmentsCount:0,
            loadedStartIndexes:[],
        }
    }

    componentDidMount() {
        this._isMounted = true;
        if (this._isMounted) {
            //if(this.props.deptlist && this.props.deptlist.length > 0){
                // this.calculateDeptDetails(this.props.deptlist);
            //}
                
            //console.log(this.props.loadedDeps);
            if(this.props.loadedDeps && this.props.loadedDeps!==null && this.props.loadedDeps!==undefined){
                var loadedDeps = this.props.loadedDeps;
                if(loadedDeps.totalresults && loadedDeps.totalresults > 0 && loadedDeps.departments &&  loadedDeps.departments.length > 0){

                    this.setState({isDeptListLoading:true},()=>{
                        this.setState({allDepartmentsCount:loadedDeps.totalresults, loadedStartIndexes:[0], startIndex:0, oriDepartmentList:loadedDeps.departments});
                        this.calculateDeptDetails(loadedDeps.departments);
                        setTimeout(() => {this.props.setLoadedDepsAction(null);}, 100);
                        this.setState({isDeptListLoading:false});
                    });

                }
                else{
                    this.getAllDepartments(0);
                }
            }
            else{
                this.getAllDepartments(0);
            }
        }
    }

    componentWillUnmount(){
        this._isMounted = false;
    }

    getAllDepartments = (stIndex) =>{
        // let ccachesearchobj = (this.props.mpDeptSearch?JSON.parse(JSON.stringify(this.props.mpDeptSearch)):null);

        // let svobj = { name: (ccachesearchobj?ccachesearchobj.name:""), isReqPagination:true, startIndex: stIndex, maxResult:12 };
        let svobj = { name: "", isReqPagination:true, startIndex: stIndex, maxResult:12 };

        this.setState({ isDeptListLoading: true }, () => {
            submitSets(submitCollection.mpDepartmentList, svobj, true).then(res => {
                if(res && res.status){
                    //set loaded items
                    let loadedstIndxs = this.state.loadedStartIndexes;
                    loadedstIndxs.push(stIndex);
                    this.setState({allDepartmentsCount:(res.count && res.count > 0 ? res.count : 0), loadedStartIndexes:loadedstIndxs, startIndex:stIndex});

                    //set department list array
                    let odeps = this.state.oriDepartmentList;
                    if(res.extra && res.extra.length > 0){
                        for (let i = 0; i < res.extra.length; i++) {
                            odeps.push(res.extra[i]);
                        }
                    }
                    this.calculateDeptDetails(odeps);

                } 
                this.setState({ isDeptListLoading: false });
            });
        });
        
    }
    //default search 
    getDefSearchObj = () => {
        return { name: "", isReqPagination: true, startIndex: 0, maxResult: 12 };
    }
    //default save obj
    getDefSaveObj = () => {
        return { mp_id: -1, is_new: true, is_delete: false, department: {}, categories: [] };
    }

    //loading dept details
    calculateDeptDetails = (arr) => {
        let viewdeptDetails = arr;
        for (let i = 0; i < viewdeptDetails.length; i++) {
            const deptitem = viewdeptDetails[i];
            // deptitem["percentage"] = roundOffDecimal(((deptitem.coveredCategoryCount / deptitem.categoryCount) * 100),2);
            deptitem["percentage"] = roundOffDecimal(deptitem.completedPercentage,2);
            deptitem["percentagecolor"] = (deptitem.percentage < 50 ? "#F5B041" :"#52BE80");
        }
        
        this.setState({ departmentlist: viewdeptDetails }, () => {
            this.groupToSliderItems();
        });
    }

    groupToSliderItems = () =>{
        let deplist = this.state.departmentlist;
        let reducecount = JSON.parse(JSON.stringify(this.state.slideritems));

        let newlist = [];
        var newsublist = {items: []};
        
        for (let i = 0; i < deplist.length; i++) {
            const depitem = deplist[i];
            
            newsublist.items.push(depitem);
            
            if( reducecount > 1){
                reducecount = (reducecount - 1);
                if((i + 1) === deplist.length){
                    newlist.push(newsublist);
                }
            } else{
                reducecount = 12;
                newlist.push(newsublist);

                newsublist = {items: []};
            }
        }

        let slideritemcount = (this.state.slideritems < deplist.length?this.state.slideritems:deplist.length);
        let slideritemwidth = (slideritemcount * this.state.singleitemwidth);
        this.setState({ sliderItems: newlist, slideritemwidth: slideritemwidth});
    }

    setSliderIndex = (isadd) => {
        let curindex = this.state.sliderIndex;
        if(isadd && (curindex + 1) === this.state.sliderLength){
            curindex = 0;
        } else if(isadd){
            curindex = (curindex + 1);
        } else if(curindex > 0){
            curindex = (curindex - 1);
        }

        this.setState({ sliderIndex: curindex });

        //check if deps for slider is loaded
        if(isadd===true){
            let loadedStIndxs = this.state.loadedStartIndexes;
            let nextStartIndex = (this.state.startIndex + 12);
            let isavl = loadedStIndxs.findIndex(idx => idx === nextStartIndex);
            
            this.setState({startIndex: nextStartIndex});
            if(isavl === -1){
                this.getAllDepartments(nextStartIndex);
            }
        }
        else{
            let prevStartIndex = (this.state.startIndex - 12);
            this.setState({startIndex: prevStartIndex});
        }

    }
    //change department 
    switchDepartment = (cdept) => {
        let csaveobj = this.state.defSaveObj;
        csaveobj.mp_id = (cdept.latestMpId > 0?cdept.latestMpId:-1);
        csaveobj.isLatestAvailable = (cdept.latestMpId > 0);
        csaveobj.department["department_id"] = cdept.departmentId;
        csaveobj.department["department_name"] = cdept.departmentName;
        csaveobj.categories = [];
        
        this.setState({ defSaveObj: csaveobj }, () => {
            this.handleRedirectView();
        });
    }

    handleRedirectView = () => {
        if(this.state.defSaveObj.department && this.state.defSaveObj.department.department_id > 0){
            this.props.setNewRefresh(false);
            this.props.setMasterPlanAction(this.state.defSaveObj);
            this.props.changeDepartmentAndLoadData(this.state.defSaveObj);
        }
    }

    loadDeptIcon = (depticon) => {
        let cdepticon = (depticon?depticon.departmentIconName:"DEP_DEFAULT");

        let returnicon = Icons.DepIconsLoad("DEP_DEFAULT", {size: 22, color: "#fff"});
        if(Icons.DepIconsLoad(cdepticon, {size:55, color:"#fff"})){
            returnicon = Icons.DepIconsLoad(cdepticon, {size: 22, color: "#fff"});
        }

        return returnicon;
    }

    render(){
        let sliderleftmargin = (this.state.sliderIndex > 0?(Math.abs((this.state.slideritemwidth * this.state.sliderIndex)) * -1):0);
        
        return(
            <>
                <Col className={'department-switch '+(this.state.allDepartmentsCount <= this.state.slideritems?' only-one ':'')+this.props.isRTL+(this.state.isDeptListLoading===true ?" d-none":"")} style={{position:"relative"}}>
                    <div className={'slider-indicator '+(this.state.sliderIndex>0?"":"d-none")} onClick={() => this.setSliderIndex(false)}><ChevronLeftIcon size={16}/></div>
                    <div className={'slider-indicator right '+(this.state.startIndex  >= (this.state.allDepartmentsCount - 12) ?"d-none":"")} onClick={() => this.setSliderIndex(true)}><ChevronRightIcon size={16}/></div>
                    {/* (this.state.allDepartmentsCount > this.state.slideritems && (this.state.sliderItems.length !== (this.state.sliderIndex+1))?"":"d-nonee") */}
                    {
                        
                        this.state.sliderItems.length > 0 ?
                            <Col className='slider-content carousel-content' style={{ width: this.state.slideritemwidth }}>
                                <Col className='slider-innercontent' style={this.props.isRTL === "rtl"?{marginRight:sliderleftmargin}:{marginLeft:sliderleftmargin}}>
                                    {this.state.sliderItems.map((xitem, xidx) => {
                                            return <Col className="slider-item" key={xidx} style={{width: this.state.slideritemwidth}}>
                                                <Col className='slider-caption' style={{width: this.state.slideritemwidth}}>
                                                    <Row>
                                                        {xitem.items.map((zitem, zidx) => {
                                                            return <Col className='d-inline sub-colr-item ' key={zidx} onClick={() => this.switchDepartment(zitem)}>
                                                                <Col className="dept-switch-single-item">
                                                                    <Col style={{width:"100%"}}>
                                                                        <Col className={"sub-content "}>
                                                                            <TooltipWrapper text={zitem.departmentName}>
                                                                                <Col xs={12} className="round-content">  
                                                                                    
                                                                                    <Col xs={12} className='img-div'>
                                                                                        <div className='dept-icon'>
                                                                                            {/* <FeatherIcon icon="archive" size={13} /> */}
                                                                                            {Icons.DepIconsLoad((zitem.departmentIcon? zitem.departmentIcon.departmentIconName : "DEP_DEFAULT") , {size:18, color:(this.props.dmode?"#29b485":"#5128a0")})}
                                                                                        </div>
                                                                                    </Col>   
                                                                                    <CircularProgressbar
                                                                                        className="prgbar"
                                                                                        value={zitem.percentage}
                                                                                        background
                                                                                        backgroundPadding={0}
                                                                                        styles={buildStyles({
                                                                                            backgroundColor: "#FFF",
                                                                                            pathColor: zitem.percentagecolor,
                                                                                            trailColor: "#5128A0",
                                                                                            strokeLinecap: 'butt',
                                                                                        })}
                                                                                        />
                                                                                </Col>
                                                                            </TooltipWrapper>
                                                                        </Col>
                                                                        
                                                                    </Col>
                                                                </Col>  
                                                            </Col>;
                                                        })}

                                                    </Row>
                                                </Col>
                                            </Col>
                                        })
                                    }    
                                </Col>
                                
                            </Col>
                        :<></>
                    }
                </Col>
                
                <Col className={'text-center deptswitch-anime '+(this.props.isRTL === "rtl"?"float-left ":"float-right ")+(this.state.isDeptListLoading===true ?" ":" d-none")} style={{ width: this.state.slideritemwidth, margin: (this.props.isRTL === "rtl"?"0px 0px 0px 50px":"0px 50px 0px 0px") }}>
                    <img src={loaderanime} alt="loading anime" />
                </Col>
            </>
        )
    }
}

const mapDispatchToProps = dispatch => ({
    setMasterPlanAction: (payload) => dispatch(selectedMasterPlanSetAction(payload)),
    setLoadedDepsAction: (payload) => dispatch(mpDepartmentsSetAction(payload)),
    setNewRefresh: (payload) => dispatch(newRefresh(payload)),
});

export default withTranslation()(withRouter(connect(null,mapDispatchToProps)(DepartmentSwitch)));



