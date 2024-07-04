import React, { PureComponent } from 'react'
import { withTranslation } from 'react-i18next';
import {  withRouter } from 'react-router-dom';
import Select from 'react-select'
import { submitCollection } from '../../../_services/submit.service';
import { submitSets } from '../../UiComponents/SubmitSets';
import { alertService } from '../../../_services/alert.service';
import { LastDays } from '../../../enums/mapenums';
class VersionAnalysisMap extends PureComponent {
    constructor(props) {
        super(props)

        this.state = {
            lastDays:{value:LastDays.all,label:"All"},
            depList:[],
            selectedDepartment:null,
            versionList:[],
            VANODATAplaceholder:this.props.t(""),
        }
    }
    componentDidMount(){
        this._isMounted = true;
        if(this._isMounted){
            this.getDepartmentList()
        }
    }
    componentWillUnmount(){
        this._isMounted = false;
    }
    getDepartmentList=()=>{
        var cobj={
            name:"",
            isReqPagination: false,
            maxResult: 10,
            startIndex: 0
        }
        submitSets(submitCollection.loadDepList, cobj, false, null, true).then(res => {
            if (res && res.status) {
                this.setState({depList:res.extra})
            }else{
                // alertService.error(res.extra!==""?res.extra:this.props.t("erroroccurred"))
            }
        })
    }
    toggleLastDaysList=(e)=>{
        this.setState({lastDays:e},()=>{
            if(this.state.selectedDepartment!==null){
                this.loadversions()
            }
        })
    }
    toggleDepartmentList=(e)=>{
        this.setState({selectedDepartment:e},()=>{
            this.loadversions()
        })
    }
    loadversions=()=>{
        this.setState({VANODATAplaceholder:this.props.t("DATA_LOADING_PLEASE_WAIT")})
        var cobj={
            departmentId:this.state.selectedDepartment.value,
            lastDays:this.state.lastDays.value,
            isReqPagination: true,
            maxResult: 12,
            startIndex: 0
        }
        submitSets(submitCollection.loadVersions, cobj, false, null, true).then(res => {
            if (res && res.status) {
                if(res.extra.length===0){
                    this.setState({VANODATAplaceholder:this.props.t("NO_RESULTS")})
                }
                this.setState({versionList:res.extra})
            }else{
                // alertService.error(res.extra!==""?res.extra:this.props.t("erroroccurred"))
            }
        })
    }

    render() {
        var {depList,selectedDepartment,versionList,VANODATAplaceholder}=this.state
        let filterLastDaysList =[{value:LastDays.thirty,label:"last 30 Days"},{value:LastDays.sixty,label:"last 60 Days"},{value:LastDays.all,label:"All"}];
        
        let DepartmentList = (depList&&depList.length>0)?depList.map((item,i)=>{
            return {value:item.departmentId,label:item.departmentName}
        }):[{value:-1,label:"Select"}];
        return (
            <div className='versionAnalysis-map'>
                <div className='title-map-tab'>{this.props.t("VERSIONANALYSIS")}</div>
                <div className='filters'>
                    <Select 
                        menuPlacement="auto"
                        placeholder={this.props.t("department")}
                        className="filter-selec2" size="sm" classNamePrefix="searchselect-inner" 
                        maxMenuHeight={200}    
                        options={DepartmentList}
                        value={selectedDepartment}
                        onChange={(e)=>this.toggleDepartmentList(e)}
                        />

                    <Select 
                        isSearchable={false}
                        menuPlacement="auto"
                        placeholder="Last Days"
                        className="filter-selec2" size="sm" classNamePrefix="searchselect-inner" 
                        maxMenuHeight={200}    
                        options={filterLastDaysList}
                        value={this.state.lastDays}
                        onChange={(e)=>this.toggleLastDaysList(e)}
                        />
                </div>
                {VANODATAplaceholder!==""?<div className='maplistdiv-map' style={{maxHeight:this.props.viewheight-230}}>
                    {versionList.length>0?versionList.map((ver,v)=>
                        <div className={"dropdown-single-item "} key={v} onClick={() => this.props.handleClickVersion(ver, selectedDepartment)}>
                            <div className='version-name-label'>
                                {ver?ver.versionName:"-"}
                            </div>
                            <div className='tags'>
                                <div className='min-count'>
                                    {this.props.t("MIN")} {ver?ver.depMetaData.minRevenue:"-"}
                                </div>
                                <div className='min-count'>
                                {ver?ver.depMetaData.minQty:"-"} {this.props.t("FACING")}
                                </div>
                                <div className='min-count'>
                                {ver?ver.depMetaData.mvpPercentage:"-"}% {this.props.t("MVP")} 
                                </div>
                            </div>
                            <div className='from-date'>
                                {ver? new Date(ver.searchFromDate).toISOString().substr(5, 2) + '.' + new Date(ver.searchFromDate).getFullYear():""} - 
                                {ver? new Date(ver.searchToDate).toISOString().substr(5, 2) + '.' + new Date(ver.searchToDate).getFullYear():""}
                            </div>
                    </div>):<div className='NOResultdivholder' >{VANODATAplaceholder}</div>}
                </div>:<></>}
                
            </div>
        )
    }
}

export default withTranslation()(withRouter(VersionAnalysisMap))