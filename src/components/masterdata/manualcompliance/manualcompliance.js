import React from 'react';
import { withRouter } from 'react-router-dom';
import { connect } from "react-redux";
import {Breadcrumb, Button, Col, Row, Form} from 'react-bootstrap';

import {  withTranslation } from "react-i18next";
import "../../../_translations/i18n";

import { submitSets } from '../../UiComponents/SubmitSets';
import { AcTable } from '../../UiComponents/AcImports';
import { submitCollection } from '../../../_services/submit.service';
import { convertDateTime, FindMaxResult } from '../../../_services/common.service';
import { alertService } from '../../../_services/alert.service';
import { complianceIDSetAction, complianceSearchAction } from '../../../actions/manualCompliance/manualCompliance_action';
import { ComplianceStatus } from '../../../enums/manualComplanceEnums';

import './manualcompliance.css';

export class ManualComplianceComponent extends React.Component{
    _isMounted = false;

    constructor(props){
        super(props);
        this.whitecontainer=React.createRef();
        this.state = {
            storeList:[],
            departmentList:[],
            chainList:[],
            loading:false,
            toridata:[], isnottesting: true, //all loaded table data with page
            isdataloaded: false, //is table data loaded
            ftablebody: [], //showing page table data
            sobj: this.defaultFilterObject(), //default search object
            startpage: 1, totalresults: 0, //startpage and total results 

            oneresultheight: 55, maxShowresultcount: 0, orimaxShowresultcount: 0, //find max result varibles
        }
    }

    componentDidMount(){
        this._isMounted = true;

        if(this._isMounted){
            // console.log(this.props.manCompState);

            //onpage load trigger search call
            this.loadChainList();
            // this.loadDepartmentList();
            // this.loadStoreList();

            if(this.props.manCompState && this.props.manCompState.manualComSearch){
                let csearchobj = JSON.parse(JSON.stringify(this.props.manCompState.manualComSearch));

                let CprvmaxShowresultcount=csearchobj.maxShowresultcount
                this.setState({
                    startpage: csearchobj.startpage,
                    totalresults: csearchobj.totalresults,
                    sobj: csearchobj.sobj,
                    maxShowresultcount:CprvmaxShowresultcount,orimaxShowresultcount:csearchobj.orimaxShowresultcount,
                    departmentList:csearchobj.departmentList,
                    storeList:csearchobj.storeList
                }, () => {
                    this.props.setManualComplianceSearch(null);
                    this.handleTableSearch(null,"click",true);
                });
            } else{
                var maxresutcount=FindMaxResult(this.whitecontainer.current?(this.whitecontainer.current.offsetHeight) : 0,this.state.oneresultheight,145)
                this.setState({
                    maxShowresultcount:maxresutcount.maxresultCount,orimaxShowresultcount:maxresutcount.maxresultCount
                },()=>{
                    this.props.setManualComplianceSearch(null);
                    this.handleTableSearch(null,"click");
                })
            }
        }
    }

    componentWillUnmount(){
        this._isMounted = false;
    }
    
    defaultFilterObject = () => {
        return { chainId:-1,departmentId:-1,storeId:-1, isReqPagination:true, startIndex:0, maxResult:8 };
    }
    loadChainList=()=>{
        submitSets(submitCollection.getChainList).then(res => {
            if(res.status){
                this.setState({ chainList: res.extra })
            }else{
                alertService.error(this.props.t('ERROR_OCCURRED'));
            } 
        })
    }
    loadDepartmentList=(id)=>{
        let checkobj = "?chainId="+id;
        submitSets(submitCollection.findDepartmentsByChainId, checkobj, false).then(res => {

            if(res.status){
                this.setState({ departmentList: res.extra })
            }else{
                alertService.error(this.props.t('ERROR_OCCURRED'));
            } 
        })
    }
    //loading store list
    loadStoreList=(id)=>{
        let checkobj = "?chainId="+id;
        submitSets(submitCollection.loadStoresByChainId, checkobj, false).then(res => {
            if(res.status){
                this.setState({ storeList: res.extra })
            }else{
                alertService.error(this.props.t('ERROR_OCCURRED'));
            } 
        })
    }
    convertMCStatus=(status)=>{
        var cstatus=""
        if(status===ComplianceStatus.COMPLIED){
            cstatus="Complied"
        }
        if(status===ComplianceStatus.NOT_COMPILED){
            cstatus="Not Complied"
        }
        if(status===ComplianceStatus.REDO_REQUESTED){
            cstatus="Redo Requested"
        }
        if(status===ComplianceStatus.PENDING){
            cstatus="Pending"
        }
        return cstatus
    }
    
    //reset table filters 
    resetTableFilters = () => {
        this.setState({ sobj: this.defaultFilterObject(), startpage: 1}, () => {
            this.handleTableSearch(null,"click");
        });
    }
    //on pagination page change or after tabledata loaded, 
    //this function use to select current selected page table data from toridata
    loadTableData = () => {
        var cdata = [];
        if(this.state.toridata && this.state.toridata.length > 0){
            var cfindList = this.state.toridata.find(x => x.page === this.state.startpage);

            if(cfindList){
                 for (var i = 0; i < cfindList.data.length; i++) {
                    const citem = cfindList.data[i];
                    cdata.push({ 
                    0:citem.complienceId?citem.complienceId:"",    
                    1:citem.jobNumber?citem.jobNumber:"",
                    2:citem.chain.chainName?citem.chain.chainName:"",
                    3:citem.store.storeName?citem.store.storeName:"",
                    4:citem.department.name?citem.department.name:"",
                    5:citem.field?citem.field.fieldNo:"",
                    6:citem.requestedUser?citem.requestedUser.userName:"",
                    7:citem.requestDatenTime?convertDateTime(citem.requestDatenTime):"",
                    8:citem.status?this.convertMCStatus(citem.status):"",
                });
                } 
            }

        }
        this.setState({ ftablebody: cdata }, () => {
            this.setState({isdataloaded: true});
        });
    }
    //set filter object
    handleFilterObject = (evt,etype,ctype) => {
        var cobj = this.state.sobj;
        if(etype !== null){
            cobj[etype] = evt.target.value;
        }
        cobj.startIndex = 0;

        this.setState({sobj:cobj,startpage: 1,toridata:[],totalresults:0}, () => {
            if(ctype === "click" || (ctype === "enter" && evt.which === 13)){
                this.handleTableSearch(null,"click");
            }
        });
    }
    //filter search
    handleTableSearch = (evt, etype, iscountreq) => {
        if(etype === "click" || (etype === "enter" && evt.which === 13)){
            var maxresutcount = this.state.maxShowresultcount;
            this.setState({
                isdataloaded: false,
                loading:true
            });
            var csobj = this.state.sobj;
            csobj.maxResult = maxresutcount;
            submitSets(submitCollection.fieldComplienceList, csobj, true).then(res => {
                //console.log(res);
                var cdata = []; //this.state.toridata
                if(res && res.status){
                    var cpageidx = cdata.findIndex(x => x.page === this.state.startpage);
                    if(cpageidx > -1){
                        cdata[cpageidx].data = res.extra;
                    } else{
                        cdata.push({page:(this.state.startpage),data:res.extra});
                    }
                    
                    this.setState({
                        toridata: cdata,
                        totalresults: (this.state.startpage === 1?res.count:this.state.totalresults),
                        loading:false
                    }, () => {
                        this.loadTableData();
                    });
                } else{
                    this.setState({
                        toridata: cdata,loading:false
                    }, () => {
                        this.loadTableData();
                    });
                }
            });
        }
    }
    //onclick link clear redux object and redirect to add new view
    handleNewLink = () => {
        this.props.setManualComplianceId(null)
        this.props.history.push("/manualcompliance/details");
    }
    //on tablerow click handle set object to redux and redirect to edit view
    handleRowClick = (cidx,citem) => {
        var cfindList = this.state.toridata.find(x => x.page === this.state.startpage);
        if(cfindList){
            if(citem && citem[0] && citem[0] !== ""){
                let finditem = cfindList.data.find(z => z.complienceId === citem[0]);
                //console.log(finditem);
                if(finditem){
                    this.props.setManualComplianceId(finditem.complienceId);
                    this.saveFilterObject();
                    this.props.history.push("/manualcompliance/details");
                }
            } else{
                this.props.setManualComplianceId(cfindList.data[cidx].complienceId);
                this.saveFilterObject();
                this.props.history.push("/manualcompliance/details");
            }
        }
    }
    //pagination page change handle
    handlePageChange = (cstartpage) => {
        var cfindList = this.state.toridata.find(x => x.page === cstartpage);
        var csobj = this.state.sobj;
        csobj.startIndex = ((cstartpage - 1) * this.state.sobj.maxResult);

        this.setState({ sobj: csobj, startpage: cstartpage, isdataloaded: false }, () => {
            if(cfindList){
                this.loadTableData();
            } else{
                this.handleTableSearch(null, "click");
            }
        });
    }
    handleMFilters=(e,type)=>{
        var csobj=this.state.sobj
        if(type==="chain"){
            csobj.chainId=e.target.value===""?-1:e.target.value
            if(e.target.value!==""){
                this.loadDepartmentList(e.target.value)
                this.loadStoreList(e.target.value)
            }else{
                csobj.departmentId=-1
                csobj.storeId=-1
                this.setState({
                    sobj:csobj,
                    storeList:[],
                    departmentList:[],
                })
            }
            
        }
        if(type==="department"){
            csobj.departmentId=e.target.value===""?-1:e.target.value
        }
        if(type==="store"){
            csobj.storeId=e.target.value===""?-1:e.target.value
        }
        this.setState({sobj:csobj})
    }
    //save filter object
    saveFilterObject = () => {
        const sfobj = {startpage: this.state.startpage, sobj: this.state.sobj, totalresults: this.state.totalresults,
            maxShowresultcount: this.state.maxShowresultcount,orimaxShowresultcount:this.state.orimaxShowresultcount,
            departmentList:this.state.departmentList,storeList:this.state.storeList
             };
        this.props.setManualComplianceSearch(sfobj);
    }
    handleShowingresults=(e, isonblur)=>{
        if(isonblur===true){
            this.setState({maxShowresultcount: (e.target.value!=="" && e.target.value>0)?e.target.value:this.state.orimaxShowresultcount})
        }
        else{
            this.setState({maxShowresultcount: e.target.value})
        }
    }
    render(){
        var chainlist = Object.keys(this.state.chainList).map(x => {
            return <option key={x} value={this.state.chainList[x].chainId}>{this.state.chainList[x].chainName}</option>
          });
          var departmentList = Object.keys(this.state.departmentList).map(x => {
            return <option key={x} value={this.state.departmentList[x].departmentId}>{this.state.departmentList[x].name}</option>
          });
          var storelist = Object.keys(this.state.storeList).map(x => {
            return <option key={x} value={this.state.storeList[x].storeId}>{this.state.storeList[x].storeName}</option>
          });
        const ftableheaders = ["",this.props.t("jobno"),this.props.t("chain"),this.props.t("STORE"),this.props.t("department"),this.props.t("fieldno"),this.props.t("request_by"),this.props.t("requested_datetime"),this.props.t("status")]; 

        return (<>
            <Col xs={12} className={"main-content "+(this.props.isRTL==="rtl"?"RTL":"")} dir={this.props.isRTL}>
                <Row>
                  <Col xs={12}>
                    <Breadcrumb dir="ltr">
                        {this.props.isRTL==="rtl"?<>
                        <Breadcrumb.Item active>{this.props.t("manual_compliance")}</Breadcrumb.Item>
                        {/* <li className="breadcrumb-item"><Link to="/dashboard" role="button">{this.props.t('home')}</Link></li> */}
                        </>:<>
                        {/* <li className="breadcrumb-item"><Link to="/dashboard" role="button">{this.props.t('home')}</Link></li> */}
                        <Breadcrumb.Item active>{this.props.t("manual_compliance")}</Breadcrumb.Item>
                        </>}
                    </Breadcrumb>      
                    <Col className="white-container" ref={this.whitecontainer}>
                        <Col sm={12}>
                            {/* <Button type="submit" className="highlight-btn" onClick={this.handleNewLink} variant="success">TEST</Button> */}
                            <Col className="custom-filters form-inline">
                                <label className="filter-label">{this.props.t("chain")}</label>
                                <Form.Control
                                    as="select"
                                    style={{ width: '140px' }}
                                    onChange={(e) => this.handleMFilters(e,"chain")} 
                                    value={this.state.sobj.chainId}
                                >
                                    <option value="">
                                        {this.props.t('ALL')}
                                    </option>
                                    {chainlist}
                                </Form.Control>
                                <label className="filter-label">{this.props.t("STORE")}</label>
                                <Form.Control
                                    as="select"
                                    style={{ width: '140px' }}
                                    onChange={(e) => this.handleMFilters(e,"store")} 
                                    value={this.state.sobj.storeId}
                                >
                                    <option value="">
                                        {this.props.t('ALL')}
                                    </option>
                                    {storelist}
                                </Form.Control>
                                <label className="filter-label">{this.props.t("department")}</label>
                                <Form.Control
                                    as="select"
                                    style={{ width: '140px' }}
                                    onChange={(e) => this.handleMFilters(e,"department")} 
                                    value={this.state.sobj.departmentId}
                                >
                                    <option value="">
                                        {this.props.t('ALL')}
                                    </option>
                                    {departmentList}
                                </Form.Control>
                                <span> <label className="filter-label">{this.props.t("SHOW_RESULTS")}</label>
                                <Form.Control style={{width:"60px"}} type="number"  value={this.state.maxShowresultcount} onChange={e => this.handleShowingresults(e,false)} onBlur={e => this.handleShowingresults(e,true)} onKeyDown={ (evt) => (evt.key === 'e'||evt.key === '.') && evt.preventDefault() } /></span>
                                {/* <Form.Control value={this.state.sobj.name} onChange={e => this.handleFilterObject(e,"name","change")} onKeyUp={e => this.handleFilterObject(e,"name","enter")} /> */}
                                <Button type="button" variant="warning" className="search-link filter-btn" onClick={e => this.handleFilterObject(e,null,"click")}>{this.props.t('btnnames.search')}</Button>
                                <Button type="button" variant="outline-secondary" className="filter-btn" onClick={this.resetTableFilters}>{this.props.t('btnnames.reset')}</Button>
                            </Col>
                            {this.state.isdataloaded?
                            <AcTable isRTL={this.props.isRTL} t={this.props.t} aheaders={ftableheaders} totalresults={this.state.totalresults} startpage={this.state.startpage} alldata={this.state.toridata} asearchobj={this.state.sobj} abody={this.state.ftablebody} showpaginate={true} pagetype="ajax" pagecount={this.state.sobj.maxResult} handleRowClick={this.handleRowClick} handlePageChange={this.handlePageChange}/>
                            :<></>}
                        </Col>
                    </Col>
                  </Col>
                </Row>
            </Col>
        </>);
    }
}



const mapDispatchToProps = dispatch => ({
    setManualComplianceId: (payload) => dispatch(complianceIDSetAction(payload)),
    setManualComplianceSearch: (payload) => dispatch(complianceSearchAction(payload)),
});

export default withTranslation()(withRouter(connect(null,mapDispatchToProps)(ManualComplianceComponent)));
