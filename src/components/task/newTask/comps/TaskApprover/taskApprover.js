import React, { Component } from 'react'
import {  Button, Col, Form,   Tab,Tabs } from 'react-bootstrap'
import { withTranslation } from 'react-i18next';
import {  withRouter } from 'react-router-dom';
import { usrLevels,  } from '../../../../../_services/common.service';
import ApproverAdvFilter from './filter/approverAdvFilter';
import FeatherIcon from 'feather-icons-react';
import { TooltipWrapper } from '../../../../newMasterPlanogram/AddMethods';

class TaskApprover extends Component {

    constructor(props) {
        super(props);
        this.state = { }
    }
   componentDidMount(){
 
   }
    render() {
        return (
            <div className="aprovertask newtasks">
                <h4>{this.props.t('WHO_WILL_APPROVE_THE_TASK')}</h4>
                <Col className="Approverlabelbox">
                {this.props.sobj.taskApproversDtoList.length > 0 && this.props.sobj.taskApproversDtoList.map((user, i) =>
                            <span>{!user.isDelete&&<span className="tag" key={i}>{user.viewName}<Button className="closetag" onClick={()=>this.props.removeUser(user)}><FeatherIcon icon="x" size={14} /></Button></span>}</span>
                        )}
                </Col>
                <Tabs defaultActiveKey={this.props.signedobj.signinDetails.userRolls.userLevel===usrLevels.CN?"region":this.props.signedobj.signinDetails.userRolls.userLevel===usrLevels.RG?"stores":"workers"} id="uncontrolled-tab-example" className="mb-3 tasktab">
                    {this.props.signedobj.signinDetails.userRolls.userLevel===usrLevels.CN&&<Tab eventKey="region" title={this.props.t('regions')}
                    //  disabled={this.props.level !== "Region" && this.props.level !== null}
                     >
                        <div className="selection"><button className="btn" onClick={()=>this.props.selectAllApprovers("region")}>{this.props.t('SELECT_ALL_REGIONS')}</button><button className="btn pinkcolor" onClick={()=>this.props.approveSNone()}>{this.props.t('SELECT_NONE')}</button></div>
                        <Col className="tscroll">
                        {this.props.regionList&&this.props.regionList.map((region,i)=>
                            <Col className="whentask" key={i}>
                                <div className='form-check'><Form.Check type="checkbox" onChange={(e) => this.props.handleApproverList(region)} checked={this.props.sobj.taskApproversDtoList&&this.props.sobj.taskApproversDtoList.find(x=>x.approverUuid===region.userUUID&&x.isDelete!==true) !== undefined} /></div>
                                <TooltipWrapper text={region.regionName}><span className='taskadd-labeltxt'>{region.regionName}</span></TooltipWrapper>
                            </Col>
                        )}</Col> 
                    </Tab>}
                    {!(this.props.signedobj.signinDetails.userRolls.userLevel===usrLevels.ST)&&<Tab eventKey="stores" title={this.props.t('stores')}
                    // disabled={this.props.level !== "Store" && this.props.level !== null}
                    >
                        <div className="selection"><button className="btn" onClick={()=>this.props.selectAllApprovers("store")}>{this.props.t('SELECT_ALL_STORES')}</button><button className="btn pinkcolor"  onClick={()=>this.props.approveSNone()}>{this.props.t('SELECT_NONE')}</button></div>
                        <Col className="tscroll">
                        {this.props.storeList&&this.props.storeList.map((store,i)=>
                            <Col className="whentask" key={i}>
                                <div className='form-check'><Form.Check type="checkbox" onChange={(e) => this.props.handleApproverList(store)} checked={this.props.sobj.taskApproversDtoList&&this.props.sobj.taskApproversDtoList.find(x=>x.approverUuid===store.userUUID&&x.isDelete!==true) !== undefined} /></div>
                                <TooltipWrapper text={store.storeName}><span className='taskadd-labeltxt'>{store.storeName}</span></TooltipWrapper>
                            </Col>
                        )}</Col>
                    </Tab>}
                    <Tab eventKey="workers" title={this.props.t('WORKERS')} 
                    //  disabled={this.props.level !== " Worker" && this.props.level !== null}
                     >
                        <div className="selection"><button className="btn" onClick={()=>this.props.selectAllApprovers("worker")}>{this.props.t('SELECT_ALL_WORKERS')}</button><button className="btn pinkcolor"  onClick={()=>this.props.approveSNone()}>{this.props.t('SELECT_NONE')}</button></div>
                        <Col className="tscroll">
                        {this.props.workerList&&this.props.workerList.map((worker,i)=>
                            <Col className="whentask" key={i}>
                                <div className='form-check'><Form.Check type="checkbox" onChange={(e) => this.props.handleApproverList(worker)} checked={this.props.sobj.taskApproversDtoList&&this.props.sobj.taskApproversDtoList.find(x=>x.approverUuid===worker.userUUID&&x.isDelete!==true) !== undefined} /></div>
                                <TooltipWrapper text={worker.userFirstName+" "+worker.userLastName}><span className='taskadd-labeltxt'>{worker.userFirstName} {worker.userLastName}</span></TooltipWrapper>
                            </Col>
                        )}</Col>
                    </Tab>
                    <Tab eventKey="all" title={this.props.t('ALL')} >
                        <ApproverAdvFilter handleAllocation={this.props.handleAllocation} sobj={this.props.sobj} filterboxopen={this.props.filterboxopen}   signedobj={this.props.signedobj} existinggroups={[] } clickFilter={this.props.clickFilter} regionList={this.props.regionList}   />
                    </Tab>
                </Tabs>
                {/* <Button size="sm" className="highlight-btn " variant="success" onClick={this.handleNewLink}>Apply</Button> */}
            </div>
        )
    }
}


export default withTranslation()(withRouter(TaskApprover));
