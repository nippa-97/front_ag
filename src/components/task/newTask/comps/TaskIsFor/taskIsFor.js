import React, { Component } from 'react'
import { withRouter } from 'react-router-dom';
import { Col, Form, Tab, Tabs } from 'react-bootstrap'
import { withTranslation } from 'react-i18next';
import { usrLevels, } from '../../../../../_services/common.service';
import AssignAdvFilter from '../../taskAssignto/assignAdvFilter';
import { TooltipWrapper } from '../../../../newMasterPlanogram/AddMethods';

class TaskIsFor extends Component {
    _isMounted = false;
    constructor(props) {
        super(props);
        this.state = {
            level: null
        }
    }
    componentDidMount() {
        this._isMounted = true;
        if (this._isMounted) {

        }
    }
    handleAllocation = (reciver, type, isdelete, arraylist) => {
        this.props.handleIsUpdated();
        this.props.handleAllocation(reciver, type, isdelete, arraylist);
        this.props.getAllocationLevel();
    }
    selectedReciever = (mtype) => {
        var select = false
        for (let i = 0; i < this.props.sobj.taskAllocationDtoList.length; i++) {
            const alocator = this.props.sobj.taskAllocationDtoList[i];
            for (let j = 0; j < alocator.taskAllcationDetailDto.length; j++) {
                const reciever = alocator.taskAllcationDetailDto[j];
                if ((reciever.reciverUuid === mtype.userUUID) && !reciever.isDelete) {
                    select = true
                    break;
                }
            }
        }
        return select
    }
    handleallocationCassgin=(obj, type, isclear, arraylist)=>{
        this.props.handleIsUpdated();
        this.props.handleAllocation(obj, type, isclear)
    }
    render() {
        return (
            <div className="aprovertask newtasks">
                <h4>{this.props.t('WHO_WILL_ALLOCATE_THE_TASK')}</h4>
                <Tabs defaultActiveKey={this.props.signedobj.signinDetails.userRolls.userLevel === usrLevels.CN ? "region" : this.props.signedobj.signinDetails.userRolls.userLevel === usrLevels.RG ? "stores" : "workers"} id="uncontrolled-tab-example" className="mb-3 tasktab">
                    {this.props.signedobj.signinDetails.userRolls.userLevel === usrLevels.CN && <Tab eventKey="region" title={this.props.t('regions')}
                        // disabled={this.props.level !== "Region" && this.props.level !== null}
                        >
                        <div className="selection">
                            {/* <button className="btn" onClick={(e) => this.handleAllocation(this.props.regionList[0],"array",false,this.props.regionList)}>Select All Regions</button>
                            <button className="btn pinkcolor" onClick={(e) => this.handleAllocation(this.props.regionList[0],"array",true,[])}>Select None</button> */}
                            <button className="btn" onClick={() => this.props.selectAll("region")}>{this.props.t('SELECT_ALL_REGIONS')}</button>
                            <button className="btn pinkcolor" onClick={() => this.props.taskisforAllNone()}>{this.props.t('SELECT_NONE')}</button>
                        </div>
                        <Col className="tscrolltisfor">
                            {this.props.regionList && this.props.regionList.map((region, i) =>
                                <Col className="whentask" key={i}>
                                    <div className='form-check'><Form.Check type="checkbox" onChange={(e) => this.handleAllocation(region, "obj", false)} checked={this.selectedReciever(region)} disabled={region.isAllocate === undefined ? false : region.isAllocate} /></div>
                                    <TooltipWrapper text={region.regionName}><span className='taskadd-labeltxt'>{region.regionName}</span></TooltipWrapper>
                                </Col>
                            )}</Col>

                    </Tab>}
                    {!(this.props.signedobj.signinDetails.userRolls.userLevel === usrLevels.ST) && <Tab eventKey="stores" title={this.props.t('stores')}
                        // disabled={this.props.level !== "Store" && this.props.level !== null}
                        >
                        <div className="selection"><button className="btn" onClick={() => this.props.selectAll("store")}>{this.props.t('SELECT_ALL_STORES')}</button><button className="btn pinkcolor" onClick={() => this.props.taskisforAllNone()}>{this.props.t('SELECT_NONE')}</button></div>
                        <Col className="tscrolltisfor">
                            {this.props.storeList && this.props.storeList.map((store, i) =>
                                <Col className="whentask" key={i}>
                                    <div className='form-check'><Form.Check type="checkbox" onChange={(e) => this.handleAllocation(store, "obj", false)} checked={this.selectedReciever(store)} disabled={store.isAllocate === undefined ? false : store.isAllocate} /></div>
                                    <TooltipWrapper text={store.storeName}><span className='taskadd-labeltxt'>{store.storeName}</span></TooltipWrapper>
                                </Col>
                            )}</Col>
                    </Tab>}
                    <Tab eventKey="workers" title={this.props.t('WORKERS')}
                        // disabled={this.props.level !== " Worker" && this.props.level !== null}
                        >
                        <div className="selection"><button className="btn" onClick={() => this.props.selectAll("worker")}>{this.props.t('SELECT_ALL_WORKERS')}</button><button className="btn pinkcolor" onClick={() => this.props.taskisforAllNone()}>{this.props.t('SELECT_NONE')}</button></div>
                        <Col className="tscrolltisfor">
                            {this.props.workerList && this.props.workerList.map((worker, i) =>
                                <Col className="whentask" key={i}>
                                    <div className='form-check'><Form.Check type="checkbox" onChange={(e) => this.handleAllocation(worker, "obj", false)} checked={this.selectedReciever(worker)} disabled={worker.isAllocate === undefined ? false : worker.isAllocate} /></div>
                                    <TooltipWrapper text={worker.userFirstName+" "+worker.userLastName}><span className='taskadd-labeltxt'>{worker.userFirstName} {worker.userLastName}</span></TooltipWrapper>
                                </Col>
                            )}</Col>
                    </Tab>
                    {/* all tab */}
                    <Tab eventKey="all" title={this.props.t('ALL')} >
                      <AssignAdvFilter taskFeedState={this.props.taskFeedState} setgroupsformain={this.props.setgroupsformain} existinggroups={this.props.existinggroups} signedobj={this.props.signedobj} filterboxopen={this.props.filterboxopen} 
                      sobj={this.props.sobj} handleAllocation={this.handleallocationCassgin}
                      regionList={this.props.regionList} 
                      clickFilter={this.props.clickFilter}  />
                    </Tab>
                </Tabs>
            </div>
        )
    }
}


export default withTranslation()(withRouter(TaskIsFor));