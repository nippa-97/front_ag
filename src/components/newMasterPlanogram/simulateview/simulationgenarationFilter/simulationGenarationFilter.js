import React, { Component } from 'react'
import { withTranslation } from 'react-i18next';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux'
import { Button, ButtonGroup, Col, Row } from 'react-bootstrap';
import { InfoIcon, XIcon } from '@primer/octicons-react';
import Select from 'react-select'
import { TooltipWrapper } from '../../AddMethods';
import { preventinputotherthannumbers } from '../../../../_services/common.service';
// import Switch from "react-switch";
// import { TooltipWrapper } from '../../AddMethods';
// import { InfoIcon } from '../../../icons/icons';
class SimulationGenarationFilter extends Component {
    constructor(props) {
        super(props)

        this.state = {
            isSalesCycle:this.props.isSCycle
        }
    }

    handleIsSalesCycle = () => {
        this.setState({isSalesCycle:!this.state.isSalesCycle},()=>{
            this.props.handleSCycle(this.state.isSalesCycle)
        })
    }

    render() {
        let {branches,selectedBranchidx,selectedTag,mapFields} = this.props; //mapFields, selectedBrch,
        let filterTagList = (this.props.loadedTagsList&&this.props.loadedTagsList.length>0)?this.props.loadedTagsList.map((item,i)=>{
            return {value:item.id,label:item.tagName}
        }):[{value:-1,label:this.props.t("NO_RESULT_FOUND")}];
        let filterBranchList = (branches&&branches.length>0)?branches.map((item,i)=>{
            return {value:item.storeId,label:item.storeName,idx:i}
        }):[{value:-1,label:this.props.t("NO_RESULT_FOUND")}];
        var {isopenfromAffectedSimList}=this.props
        return (
            <div>
                <ul className='list-inline simulate-filters' style={{paddingLeft:"15px", paddingRight: "15px"}}>
                    <li className='list-inline-item filter-item '>
                        <div className='form-group'>
                            <label style={{marginBottom: "15px"}}>{this.props.t("Simulate")}</label>
                            <div className='aui-content-left-right'>
                                <ButtonGroup className='aui-per-toggle'>
                                    <Button disabled={isopenfromAffectedSimList} size='sm' active={this.props.isCustomPushEnabled} onClick={(e) => this.props.toggleCustomPushOption(true)}>{this.props.t('custom')}</Button>
                                    <Button disabled={isopenfromAffectedSimList} size='sm' active={!this.props.isCustomPushEnabled} onClick={(e) => this.props.toggleCustomPushOption(false)}>{this.props.t('BY_BRANCH')}</Button>
                                </ButtonGroup>
                            </div>    
                        </div>
                    </li>
                    <li className='list-inline-item filter-item'>
                        <div className='form-group'>
                            <label>{this.props.t("FIELD_COUNT")}</label>
                            <input type="text" pattern="[0-9]*" className='form-control form-control-sm fieldcount' disabled={!this.props.isCustomPushEnabled && selectedBranchidx > -1 && this.props.branches[this.props.selectedBranchidx].fieldCount>0} onChange={(e)=>this.props.toggeleSimulateCount(e)} value={this.props.simulateCount}
                            style={{minWidth: "auto",width: "120px"}} onKeyDown={(e)=>preventinputotherthannumbers(e,e.target.value,(this.props.t('Character.FIELD_COUNT')))}></input>
                        </div>
                    </li>
                    <li className='list-inline-item filter-item'>
                        <div className='form-group'>
                            <label>{this.props.t("tags")}</label>
                            <Select 
                                isDisabled={isopenfromAffectedSimList}
                                menuPlacement="bottom"
                                placeholder={this.props.t("Select_tags")} 
                                options={filterTagList} 
                                onChange={(e)=>this.props.toggleTags(e)} 
                                value={this.props.defTagName} 
                                className="filter-selec2" size="sm" classNamePrefix="searchselect-inner" 
                                maxMenuHeight={160}    
                                />
                        </div>
                    </li>
                    <li className='list-inline-item filter-item'>
                        <div className='form-group'>
                            
                            <label>
                                {this.props.t("branch")} 
                                {this.props.isCustomPushEnabled?<TooltipWrapper text={this.props.t("CUSTOM_BRANCH_INFO")}>
                                    <span className='branchwarn-icon'><InfoIcon size={16} /></span>
                                </TooltipWrapper>:<></>}
                            </label>
                            <Select 
                                isDisabled={isopenfromAffectedSimList}
                                isClearable
                                menuPlacement="bottom"
                                placeholder={this.props.t("SELECT_BRANCH")} 
                                options={filterBranchList} 
                                onChange={(e)=>this.props.toggleBranches(e)} 
                                value={this.props.selectedBranchidx>-1?filterBranchList[this.props.selectedBranchidx]:null} 
                                className="filter-selec2" size="sm" classNamePrefix="searchselect-inner" 
                                maxMenuHeight={160}    
                                />
                        </div>
                    </li>
                    <li className='list-inline-item filter-item '>
                        <div className='aui-content-left-right'>
                            <ButtonGroup className='aui-per-toggle'>
                                <Button disabled={isopenfromAffectedSimList} size='sm' active={!this.props.isPrioratizeUserPercentage } onClick={(e) => this.props.handlePrioratizeUserPercentage()}>{this.props.t('products')}</Button>
                                <Button disabled={isopenfromAffectedSimList} size='sm' active={this.props.isPrioratizeUserPercentage } onClick={(e) => this.props.handlePrioratizeUserPercentage()}>{this.props.t('FIXED_PER')}</Button>
                            </ButtonGroup>
                        </div>
                    </li>
                    <li className='list-inline-item filter-item'>
                        <Button disabled={isopenfromAffectedSimList}  className="btn-simulate" onClick={()=>this.props.getSimulatePlanogram()}>{this.props.t("Simulate")}</Button>        
                    </li>
                    {/* uncomment only this to work push */}
                    <li className='list-inline-item filter-item'>
                        {( (this.props.selectedBranchidx>-1) && this.props.simulateCount === (this.props.simulateSearchObj?this.props.simulateSearchObj.fieldCount:0) && mapFields)?<Button className="btn-simulate btn-push" onClick={()=>this.props.toggelePushBtn()}>{this.props.t("PUSH")}</Button> :<></> }
                    </li>
                </ul>
                <Row className="simulate-filters">
                    <Col xs={12}>
                        <ul className='list-inline mpsim-tags' style={{marginTop: "0px"}}>
                            {selectedTag.map((xitem, xidx) => {
                                return <li key={xidx} className={'list-inline-item'+(isopenfromAffectedSimList?" disable":"")} title={xitem.tagName}>
                                   {isopenfromAffectedSimList?<></>: <span className='close-icon' style={{opacity:(!this.props.isCustomPushEnabled && this.props.selectedBranchidx > 0)?"0.1":"1"}} onClick={() => this.props.removeSimTag(xidx)}><XIcon size={16} /></span>}
                                    {xitem&&xitem.tagName?xitem.tagName.substring(0,25)+(xitem.tagName.length > 25?"..":""):""}
                                </li>
                            })}
                        </ul>
                    </Col>
                </Row>
            </div>
        )
    }
}

const mapDispatchToProps = dispatch => ({
    
});
export default withTranslation()(withRouter(connect(null, mapDispatchToProps)(SimulationGenarationFilter)))
