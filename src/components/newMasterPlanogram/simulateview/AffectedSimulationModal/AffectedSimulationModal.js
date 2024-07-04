import React, { Component } from 'react'
import { withTranslation } from 'react-i18next';
import { withRouter } from 'react-router-dom';
import { Button, Col, Modal } from 'react-bootstrap';
import './AffectedSimulation.css'
import { TooltipWrapper } from '../../AddMethods';
import { connect } from 'react-redux';
import { AffectedSimulationModalSetAction } from '../../../../actions/masterPlanogram/masterplanogram_action';
import Select from 'react-select'
import { submitSets } from '../../../UiComponents/SubmitSets';
import { submitCollection } from '../../../../_services/submit.service';
import { alertService } from '../../../../_services/alert.service';
class AffectedSimulationModal extends Component {
    constructor(props) {
        super(props)
        this._isMounted = false;
        this.state = {
            loadedcom:false,
            isallsimulatemodal:false,
            isAuiViewsAllow:false,
            defSaveObj:{},selectedsim:{},
            newSnapshotId:-1,
            selectedTagList:[],
            branches:[],
            departments:[],
            department_id:-1,
            branchid:-1,
            AffectedSimList:[],
            simulateCount:"",vmpversion:"",
        }
    }
    componentDidMount(){
        this._isMounted = true;
       
       
        if(this._isMounted){
            this.setState({AffectedSimList:this.props.AffectedSimList})
            this.loadBranches()
            this.loadDepartments()
        }
    }
    SimulatetoSnapshot=(val)=>{
        var reduxobj={
            department:{
                department_id:val.departmentId,department_name:val.departmentId
            },
            simulationSnapshotId:val.simulationSnapshotId,
            selectedTagList:val.tags,
            fieldCount:val.fieldCount,
            store:{
                id:val.storeId,name:val.storeName
            },
            fixed_percentage:val.fixed_percentage
        }
        this.props.setAffectedSimulationModalData(reduxobj)
        window.open("/masterplanograms", '_blank');
    }
    tagslistshow=(list)=>{
        var text=""
        for (let i = 0; i < list.length; i++) {
            const element = list[i];
            if(i===0){
                text=element.tagName
            }else{
                text=text+(","+element.tagName)
            }
           
        }
        return text
    }
      // load branches
    loadBranches=()=>{
        // var departmentId =(this.state.department_id)? this.state.department_id:-1
        var sobj={
            filterOpt: "",
            // isReqCount:false,
            isReqPagination:false
            // maxResult
            // startIndex
        }
        submitSets(submitCollection.getBranches, sobj, true).then(res => {
            if (res&&res.status) {
                let cbranches=[]
                res.extra.forEach(element => {
                    let obj=element
                    obj.storeName=element.name;
                    obj.storeId=element.branchId;
                    cbranches.push(obj)
                });
                this.setState({branches:cbranches},()=>{
                    this.setState({selectedBranchidx:  this.props.isopenfromAffectedSimList?(this.state.branches.length>0?this.state.branches.findIndex(x=>x.storeId===this.props.selectedBranch.id):-1):-1})
                })
            }else{
                alertService.error(this.props.t('DATA_LOADING_FAIL'))
            }
        })
    }
    // load loadDepartments
    loadDepartments=()=>{
        var svobj ={isReqPagination:false,name:""}
        submitSets(submitCollection.mpDepartmentList,svobj, true).then(res => {
            if (res&&res.status) {
                this.setState({departments:res.extra},()=>{
                   
                })
            }else{
                alertService.error(this.props.t('DATA_LOADING_FAIL'))
            }
        })
    }
    toggleDepartment=(evt)=>{
        this.setState({department_id:evt?evt.value:-1,
            // branches:[],branchid:-1
        },()=>{
            this.handleFilterResults()
            this.loadBranches()
        })
    }
    toggleBranches=(evt)=>{
        this.setState({branchid:evt?evt.value:-1},()=>{
            this.handleFilterResults()
        })
    }
    
    handleFilterResults = (ctxt,isReSerach) => {
        let list=structuredClone(this.props.AffectedSimList)
        const filteredByMultipleCriteria = filterObjects(list, { departmentId: this.state.department_id, storeId: this.state.branchid,fieldCount:this.state.simulateCount,mpVersionName:this.state.vmpversion });

        this.setState({AffectedSimList:filteredByMultipleCriteria})   
    }
    toggeletextinput=(evt,type)=>{
        console.log(evt.target.value);
        if(type==="count"){
            this.setState({simulateCount:evt.target.value>-1?evt.target.value:0},()=>{
                this.handleFilterResults()
            })
        }
        if(type==="vmp"){
            this.setState({vmpversion:evt.target.value},()=>{
                this.handleFilterResults()
            })
        }

    }
    render() {
        // var {AffectedSimList}=this.props
        var {branches,departments,AffectedSimList,branchid}=this.state
        let filterBranchList = (branches&&branches.length>0)?branches.map((item,i)=>{
            return {value:item.storeId,label:item.storeName,idx:i}
        }):[{value:-1,label:this.props.t("NO_RESULT_FOUND")}];

        let filterDepartments = (departments&&departments.length>0)?departments.map((item,i)=>{
            return {value:item.departmentId,label:item.departmentName,idx:i}
        }):[{value:-1,label:this.props.t("NO_RESULT_FOUND")}];
        return (
            <Modal className="planigo-Modal affectedsimmodal" dir={this.props.isRTL} size='xl' centered show={this.props.isShow}  backdrop="static"
            // onShow={()=>this.handlecomploaded()}
            onHide={()=>this.props.isShowHandle()}>
            <Modal.Body>
                <Modal.Header closeButton>
                    <Modal.Title>
                    {  this.props.t("Simulations_have_issues") }
                    </Modal.Title>
                    <Button className='btn-close' onClick={()=>this.props.isShowHandle()}></Button>
                </Modal.Header>
                <div>
                <div className='Aff-simModal-filters'>
                        <ul className='list-inline simulate-filters' 
                        // style={{paddingLeft:"15px", paddingRight: "15px"}}
                        >
                            <li className='list-inline-item filter-item'>
                                <div className='form-group'>
                                    <label>{this.props.t("FIELD_COUNT")}</label>
                                    <input type="number"  className='form-control form-control-sm fieldcount' 
                                    style={{minWidth: "auto",width: "120px"}} onChange={(e)=>this.toggeletextinput(e,"count")} value={this.state.simulateCount} onKeyDown={ (evt) => (evt.key === 'e'||evt.key === '.') && evt.preventDefault() }></input>
                                </div>
                            </li>
                            <li className='list-inline-item filter-item'>
                                <div className='form-group'>
                                    <label>{this.props.t("VMP")}</label>
                                    <input type="text" pattern="[0-9]*" className='form-control form-control-sm fieldcount' 
                                    style={{minWidth: "auto",width: "120px"}} onChange={(e)=>this.toggeletextinput(e,"vmp")} value={this.state.vmpversion}></input>
                                </div>
                            </li>
                            <li className='list-inline-item filter-item'>
                                <div className='form-group'>
                                    <label>
                                        {this.props.t("branch")} 
                                    </label>
                                    <Select 
                                        isClearable
                                        menuPlacement="bottom"
                                        placeholder={this.props.t("SELECT_BRANCH")} 
                                        options={filterBranchList} 
                                        onChange={(e)=>this.toggleBranches(e)} 
                                        value={branchid>-1?filterBranchList[branches.findIndex(x=>x.storeId===branchid)]:null} 
                                        className="filter-selec2" size="sm" classNamePrefix="searchselect-inner" 
                                        maxMenuHeight={160}    
                                        />
                                </div>
                            </li>
                            <li className='list-inline-item filter-item'>
                                <div className='form-group'>
                                    <label>
                                        {this.props.t("department")} 
                                    </label>
                                    <Select 
                                        isClearable
                                        menuPlacement="bottom"
                                        placeholder={this.props.t("selectdepartment")} 
                                        options={filterDepartments} 
                                        onChange={(e)=>this.toggleDepartment(e)} 
                                        // value={this.props.selectedBranchidx>-1?filterBranchList[this.props.selectedBranchidx]:null} 
                                        className="filter-selec2" size="sm" classNamePrefix="searchselect-inner" 
                                        maxMenuHeight={160}    
                                        />
                                </div>
                            </li>
                        </ul>
                    </div>
                    <div className='content'>
                        {AffectedSimList.length>0?<div>
                            {AffectedSimList.map((item, i) =>
                                <Col key={i} className='m-item' onClick={()=>this.SimulatetoSnapshot(item)}>
                                    <div className='count'>{item.fieldCount} {this.props.t("fields")}</div>
                                    
                                    <TooltipWrapper placement="bottom" text={item.mpVersionName} >
                                        <div className='mpname'>{item.mpVersionName}</div>
                                    </TooltipWrapper>
                                    <TooltipWrapper placement="bottom" text={item.departmentName} >
                                        <div className='dep'>{item.departmentName}</div>
                                    </TooltipWrapper>
                                    <TooltipWrapper placement="bottom" text={item.storeName} >
                                        <div className='Store'>{item.storeName}</div>
                                    </TooltipWrapper>
                                    
                                    <div className='tagsec'> 
                                        {item.tags.length>0?<TooltipWrapper placement="bottom" text={this.tagslistshow(item.tags)} >
                                            <span>{this.props.t("Tags_Available")} </span>
                                        </TooltipWrapper>:<></>}
                                    </div>
                                </Col>
                            )}
                        </div>:<div className='NoResults'>{this.props.t("NO_RESULT_FOUND")}</div>}
                    </div>
                    </div>
                
            </Modal.Body>
            </Modal>
        )
    }
}
function filterObjects(array, filterCriteria) {
    return array.filter(obj => {
      for (const key in filterCriteria) {
        const criteriaValue = filterCriteria[key];
        // Skip null or -1 criteria
        if (criteriaValue !== null && criteriaValue !== "" && criteriaValue !== -1) {
            if (typeof criteriaValue === 'string') {
                let object=JSON.stringify(obj[key])
                if(!(object.toLowerCase().includes(criteriaValue.toLowerCase()))){
                    return false;
                }
            }else
            if (obj[key] !== criteriaValue) {
                return false;
            }
        }
      }
      return true;
    });
  }

const mapDispatchToProps = dispatch => ({
    setAffectedSimulationModalData: (payload) => dispatch(AffectedSimulationModalSetAction(payload)),
});

export default withTranslation()(withRouter(connect(null, mapDispatchToProps)(AffectedSimulationModal)))