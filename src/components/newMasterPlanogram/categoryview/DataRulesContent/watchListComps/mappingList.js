import React from 'react';
import { withTranslation } from 'react-i18next';
import { withRouter } from 'react-router-dom';
import { Row, Col , ListGroup, OverlayTrigger, Tooltip } from 'react-bootstrap';
import FeatherIcon from 'feather-icons-react';
// import moment from 'moment';

import { stringtrim , convertDate, convertDateTime}  from "../../../../../_services/common.service";
import { submitCollection } from '../../../../../_services/submit.service';
import { submitSets } from '../../../../UiComponents/SubmitSets';
// import { alertService } from '../../../../../_services/alert.service';
import { AcViewModal } from '../../../../UiComponents/AcImports';

import HierachyResolve from '../../../../masterdata/CatelogueImportLog/hierachyResolve/hierachyResolve';

import loader from '../../../../../assets/img/loading-sm.gif';

const pageLength = 5;

class MappingItemList extends React.Component {
    constructor(props){
        super(props);
        this._isMounted = false;
        this.state = {
            isloading:false,
            ismainListRefresh:false,
            isDepartmentLoading:false,
            issueObject:null,
            showProductEditModal:false,
            mainList:[],
            sobj:this.defaultSearchObj(),
            totalResultCount:-1,

            showHierachyModal:false,
            departmentList:[],
        }
    }

    componentDidMount() {
        this._isMounted = true;
        if (this._isMounted) {
            this.loadMainList(this.state.sobj);

            if(this.props.departmentList){
                this.setState({departmentList:this.props.departmentList});
            }
        }
    }

    componentWillUnmount(){
        this._isMounted = false;
    }

    defaultSearchObj = () =>{
        return {
            isReqPagination:true,
            isReqCount:false,
            maxResult:pageLength, 
            startIndex:0,
            
            mpId:this.props.mp_id,
            depId:this.props.deptid,
            catId:this.props.catid,
            subCatId:this.props.scatid,
            supId:this.props.supplierid,
            brandId:this.props.brandid,

            // mpId:-1,
            // depId:-1,
            // catId:-1,
            // subCatId:-1,
            // supId:-1,
        };
    }

    loadMainList = (sobj)=>{
        this.setState({isloading:true});
        sobj.startDate = convertDate(this.props.chartFilterDates.fromdate);
        sobj.endDate = convertDate(this.props.chartFilterDates.todate);

        submitSets(submitCollection.getvmpHierarchyIssues, sobj, true).then(res => {
            
            if(res && res.status){
                if(res.count && res.count>0){this.setState({totalResultCount:res.count})}

                let responseArray = res.extra;
                let clist = JSON.parse(JSON.stringify(this.state.mainList));
                
                for (let i = 0; i < responseArray.length; i++) {
                    responseArray[i]["searchStartIndex"] = JSON.parse(JSON.stringify(sobj.startIndex));
                    clist.push(responseArray[i]);
                }
                
                this.setState({mainList:clist},()=>{
                    this.setState({isloading:false});
                });
            }
        });
    }

    refreshMainListAfterAction = (sobj, id) =>{
        this.setState({ismainListRefresh:true});
        
        sobj.startDate = convertDate(this.props.chartFilterDates.fromdate);
        sobj.endDate = convertDate(this.props.chartFilterDates.todate);

        submitSets(submitCollection.getvmpHierarchyIssues, sobj, true).then(res => {
            this.setState({ismainListRefresh:false});
            if(res && res.status){
                let mlist = JSON.parse(JSON.stringify(this.state.mainList));
                var clist = res.extra;
                //var idx = clist.findIndex(x => x.catelogId === id);

                // if(idx > -1){
                //     var sidx = mlist.findIndex(x => x.catelogId === id);
                //     if(sidx > -1){
                //         console.log("item updated");
                //         mlist[sidx] = clist[idx];
                //     }
                // }
                // else if(idx < 0){
                //     var sdidx = mlist.findIndex(x => x.catelogId === id);
                //     if(sdidx > -1){
                //         console.log("item removed");
                //         mlist.splice(sdidx, 1);
                //     }
                // }
                
                // if(res.count && res.count>0){
                //     this.setState({totalResultCount:res.count},()=>{
                //         this.setState({mainList:mlist});
                //     })
                // }
                // else{
                //     this.setState({mainList:mlist});
                // }

                let temlist = [];
                for (let i = 0; i < mlist.length; i++) {
                    if(mlist[i].searchStartIndex < sobj.startIndex){
                        temlist.push(mlist[i]);
                    }
                }

                for (let x = 0; x < clist.length; x++) {
                    clist[x]["searchStartIndex"] = sobj.startIndex;
                    temlist.push(clist[x]);
                }
                
                let csobj = this.state.sobj;
                csobj.startIndex = sobj.startIndex;
                
                this.setState({sobj:csobj, totalResultCount:res.count},()=>{
                    this.setState({mainList:temlist});
                });
            }
        });
    }

    getScrollPosition = (e) =>{
        //console.log(this.state.isloading , this.state.mainList.length , this.state.totalResultCount);
        if(this.state.isloading === false && this.state.mainList.length < this.state.totalResultCount){
            var top = document.getElementById("mappinglist").scrollTop;
            var sheight = document.getElementById("mappinglist").scrollHeight;
            var position = (sheight - top);
            var clientHeight = e.target.clientHeight;
            position = Math.trunc((position - 1)); 
            
            if(position <= clientHeight ){
                let csobj = this.state.sobj;
                csobj.startIndex = (csobj.startIndex + pageLength);
                this.setState({sobj:csobj},()=>{ 
                    this.loadMainList(this.state.sobj);
                });
            }
        }
    }

    handleIssueClick = (item) =>{
        this.setState({issueObject:item},()=>{
            if(this.state.departmentList.length===0){
                let svobj = { name:"", isReqPagination:false, startIndex: 0, maxResult:0 };
                this.setState({isDepartmentLoading:true});
                submitSets(submitCollection.searchDepatments, svobj, true, null, true).then(res => {
                    this.setState({isDepartmentLoading:false});
                    if(res && res.status){
                        let clist = [];
                        for (let i = 0; i < res.extra.length; i++) {
                            clist.push({value:res.extra[i].departmentId, label:res.extra[i].name});
                        }

                        this.props.setAllDepartmentList(clist);
                        this.setState({departmentList:clist},()=>{
                            this.toggleHierachyModal();
                        });
                    } 
                    else{
                        // alertService.error(res.error ? res.error :this.props.t("erroroccurred"));
                    }
                });
            }
            else{
                this.toggleHierachyModal();
            }
        });
    }

    toggleHierachyModal = () =>{
        this.setState({showHierachyModal: !this.state.showHierachyModal});
    }

    refreshList = (isonlyreload) =>{
        let issueObj = this.state.issueObject;
        let sobj = this.defaultSearchObj();
        sobj.startIndex = issueObj.searchStartIndex;
        sobj.isReqCount = true;
        this.refreshMainListAfterAction(sobj, issueObj.catelogId );
        this.props.loadIssuesCount(isonlyreload);
        
        //reload vmp
        this.props.dRulesreload(false, true);
    }
    
    loadAllDepartments = () => {}

    updateAllDepartments = (newdeptobj) => {
        let calldepts = this.state.departmentList;
        calldepts.push({value:newdeptobj.departmentId, label:newdeptobj.name});
        
        this.props.setAllDepartmentList(calldepts);
        this.setState({ departmentList: calldepts });
    }
    
    setDepartmentsList = (list) =>{
        this.props.setAllDepartmentList(list);
        this.setState({departmentList:list});
    }

    render(){
        return(
            <>
                {this.state.ismainListRefresh===true ?<Col xs={12} className="loading-col refresh"><img className='loader-gif' src={loader} alt="loader"/></Col>:<></>}

                <Col xs={12} id="mappinglist" className={"list-main "+(this.state.ismainListRefresh===true?"refreshing":"")} onScroll={(e)=>this.getScrollPosition(e)}>
                    <ListGroup className={(this.state.mainList.length > 0?"":"d-none")}>
                        {
                            this.state.mainList.map((item,index)=>{
                                return (
                                    <ListGroup.Item key={index}>
                                        <Row>
                                            <Col xs={11} className="details-col" style={{paddingTop:"0px"}}>
                                                <OverlayTrigger placement="top" overlay={<Tooltip className={"resolve-content-item-tooltip "}><label>{item.description}</label></Tooltip>}>
                                                    <h6 className='main-title'>{stringtrim(item.description, (this.props.isRTL==="rtl" ? 40 : 45))}</h6>
                                                </OverlayTrigger>
                                                <small className='sub-title'>{(item.importedDate?convertDateTime(item.importedDate):"-")}</small>
                                            </Col>
                                            <Col xs={1} className='btns-col' style={{paddingTop:"5px"}}>
                                                <OverlayTrigger placement="top" overlay={<Tooltip className={"resolve-content-item-tooltip "}><label>{this.props.t("EDIT")}</label></Tooltip>}><FeatherIcon onClick={()=>this.handleIssueClick(item)} icon="edit" size="12"/></OverlayTrigger>
                                            </Col>
                                        </Row>
                                    </ListGroup.Item>
                                )
                            })
                        }
                        
                    </ListGroup>
                    
                    {
                        this.state.isloading===true ?
                            <Col xs={12} className="loading-col"><img className='loader-gif' src={loader} alt="loader"/></Col>
                        :
                            <Col className={'no-results-txt '+(this.state.mainList.length > 0 ?"d-none":"")}>{this.props.t("NO_RESULT_FOUND")}</Col>
                    }  
                </Col>


                {
                    this.state.showHierachyModal === true ?
                        <HierachyResolve 
                            isRTL={this.props.isRTL}
                            catelogId={this.state.issueObject.catelogId}
                            showHierachyModal={this.state.showHierachyModal}
                            departmentList = {this.state.departmentList}
                            toggleHierachyModal={this.toggleHierachyModal}
                            loadAllDepartments={this.loadAllDepartments} 
                            updateAllDepartments={this.updateAllDepartments}  
                            mainSearch = {this.refreshList}
                            issueState={"NeedUserInput"}
                            logObj={this.state.issueObject}
                            setDepartmentsList={this.setDepartmentsList}
                            isVMPView={true}
                            resetResolveSearch={this.props.resetResolveSearch}
                            setHeirarchyIssue={this.props.setHeirarchyIssue}
                        />
                    :<></>
                }

                <AcViewModal showmodal={this.state.isDepartmentLoading} message={this.props.t('PLEASE_WAIT')} />
            </>
        ) 
    }
}
export default withTranslation()(withRouter((MappingItemList)));