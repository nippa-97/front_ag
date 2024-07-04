import React from 'react';
import { Link, withRouter } from 'react-router-dom';
import { connect } from "react-redux";
import {Breadcrumb, Button, Col, Form, Row} from 'react-bootstrap';
// import FeatherIcon from 'feather-icons-react';
import './departments.css';

import { AcNoDataView, AcTable, AcViewModal } from '../../UiComponents/AcImports';
import { submitSets } from '../../UiComponents/SubmitSets';
import { submitCollection } from '../../../_services/submit.service';
import { viewSetChainDepAction , viewSetChainDepPrevAction} from '../../../actions/dept/dept_action';
import MDSidebarMenu from '../../common_layouts/mdsidebarmenu';
import {  withTranslation } from "react-i18next";
import "../../../_translations/i18n";
import { FindMaxResult, preventinputToString, preventinputotherthannumbers } from '../../../_services/common.service';
import { confirmAlert } from 'react-confirm-alert';
import { alertService } from '../../../_services/alert.service';
import ResultSummery from './resultSummery/resultSummery';
import StackableModal from './stackablemodal/stackableModal';
import { stackableLevels } from '../../../enums/departmentCategoriesEnums';
/**
 * using to show added departments list show or find
 * see documentation 2.1
 * 
 * @class DepartmentsComponent
 * @extends {React.Component}
 */
export class ChainDepartmentsComponent extends React.Component{
    _isMounted = false;

    constructor(props){
        super(props);
        this.whitecontainer=React.createRef();
        this.state = {
            loading:false,
            toridata:[], isnottesting: true, //all loaded table data with page
            isdataloaded: false, //is table data loaded
            ftablebody: [], //showing page table data
            sobj: this.defaultFilterObject(), //default search object
            startpage: 1, totalresults: 0, //startpage and total results 

            oneresultheight:55, maxShowresultcount:0,orimaxShowresultcount:0,//find max result varibles
            showresultSummeryModal:false,
            summeryres:null,
            showStackableModal:false,
        }
    }

    componentDidMount(){
        
        this._isMounted = true;
        if(this._isMounted){
            if(this.props.deptState.chainDepPrevData){
                let prevdata = this.props.deptState.chainDepPrevData;
                
                if(prevdata.viewType && prevdata.filters){
                    
                    if(prevdata.viewType==="delete"){
                        const stindx = (prevdata.filters.startIndex ? prevdata.filters.startIndex:0);
                        const maxresult = (prevdata.filters.maxResult? prevdata.filters.maxResult:8);
                        if(prevdata.tbodydata===1 && prevdata.startpage>1){
                            prevdata.filters.startIndex = (stindx - maxresult);
                            prevdata.startpage =  (prevdata.startpage - 1);
                        }
                    }
                    let prvmaxShowresultcount=prevdata.maxShowresultcount
                    this.setState({sobj:prevdata.filters, startpage:prevdata.startpage,maxShowresultcount:prvmaxShowresultcount,orimaxShowresultcount:prevdata.orimaxShowresultcount},()=>{
                        this.handleTableSearch(null,"click");  
                        this.props.setChainPrevFilters(null);  
                    });
                }
                else{
                    let CprvmaxShowresultcount=prevdata.maxShowresultcount
                    this.setState({ maxShowresultcount:CprvmaxShowresultcount,orimaxShowresultcount:prevdata.orimaxShowresultcount }, () => {
                        this.props.setChainPrevFilters(null); //added after
                        this.handleTableSearch(null,"click");   
                    }) 
                }
            }
            else{
                var maxresutcount=FindMaxResult(this.whitecontainer.current?(this.whitecontainer.current.offsetHeight) : 0,this.state.oneresultheight,145)
                this.setState({
                    maxShowresultcount:maxresutcount.maxresultCount,orimaxShowresultcount:maxresutcount.maxresultCount},()=>{
                        this.handleTableSearch(null,"click");
                    })
            }
            //onpage load trigger search call
        }
    }

    componentWillUnmount(){
        this._isMounted = false;
    }
    
    defaultFilterObject = () => {
        return { departmentName:"", isReqPagination:true, startIndex:0, maxResult:8 };
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
                        0: citem.departmentId,
                        // 1: {type:"checkbox", isChecked:true, action:"bulk-select", size:"sm", text:""},
                        1:citem.departmentName, 
                        2: (citem.hide?this.props.t("btnnames.yes"):this.props.t("btnnames.no")), 
                        3: {type:"color",color:citem.departmentColor},
                        4: {type:"button", variant:"secondary", action:"stack", size:"sm",title:this.props.t("IS_stackable"), icon:"layers", iconsize: 14, text:"",did:citem.departmentId},
                        // 4: {type:"button", variant:"secondary", action:"delete", size:"sm", icon:"trash-2", iconsize: 14, text:"",did:citem.departmentId},
                       
                    });
                     
                }
            }

        }
        this.setState({ ftablebody: cdata }, () => {
            this.setState({isdataloaded: true});
        });
    }
    //set filter object
    handleFilterObject = (evt,etype,ctype,msg) => {
        var cobj = this.state.sobj;

        if(etype === "departmentName"){
            if(!preventinputToString(evt,evt.target.value,msg)){
                evt.preventDefault()
                return
            }
        }
        if(etype !== null){
            cobj[etype] = evt.target.value;
        }
        cobj.startIndex = 0;

        this.setState({sobj:cobj}, () => {
            if(ctype === "click" || (ctype === "enter" && evt.which === 13)){
                this.setState({startpage: 1,toridata:[],totalresults:0}, () => {
                    this.handleTableSearch(null,"click");
                });
            }
        });
    }
    //filter search
    handleTableSearch = (evt,etype) => {
        if(etype === "click" || (etype === "enter" && evt.which === 13)){
            var maxresutcount=this.state.maxShowresultcount
            var csobj=this.state.sobj
            csobj.maxResult=maxresutcount
            this.setState({
                sobj:csobj,
                isdataloaded: false,
                loading:true
            });


            submitSets(submitCollection.searchChainDepatments, this.state.sobj, true).then(res => {
                var cdata = [];
                if(res && res.status){
                    var cpageidx = cdata.findIndex(x => x.page === this.state.startpage);
                    if(cpageidx > -1){
                        cdata[cpageidx].data = res.extra;
                    } else{
                        cdata.push({page:(this.state.startpage),data:res.extra});
                    }
                    
                    this.setState({
                        toridata: cdata,
                        totalresults: ((this.state.startpage === 1 || this.state.sobj.isReqCount===true)?res.count:this.state.totalresults),
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
    //onclick new department link clear redux object and redirect to add new view
    handleNewLink = () => {
        let filterobj = this.state.sobj;
        filterobj.isReqCount = true;
        let prevdata = {
            filters:filterobj, viewType:null, startpage:this.state.startpage, tbodydata:this.state.ftablebody.length,
            maxShowresultcount:this.state.maxShowresultcount,orimaxShowresultcount:this.state.orimaxShowresultcount
        };
        this.props.setChainPrevFilters(prevdata);
        this.props.setDunitView(null);
        this.props.history.push("/chaindepartments/addnewdepartment");
    }
    //on tablerow click handle set object to redux and redirect to edit view
    handleRowClick = (cidx, citem, caction) => {
      
        if(caction){
            if(caction==="delete"){
                this.handledeleteDepartment(this.state.ftablebody[cidx])
            }
            if(caction==="stack"){
                this.handleStackabledepproducts(this.state.ftablebody[cidx])
            }
            
            if(caction==="bulk-select"){
                this.handleBulkselect(this.state.ftablebody[cidx])
            }
        }else{
            var cfindList = this.state.toridata.find(x => x.page === this.state.startpage);
            if(cfindList){
                let finditem = cfindList.data.find(z => z.departmentId === citem[0]);
                
                if(finditem){
                    let filterobj = this.state.sobj;
                    filterobj.isReqCount = true;
                    let prevdata = {filters:filterobj, viewType:null, startpage:this.state.startpage, tbodydata:this.state.ftablebody.length, maxShowresultcount:this.state.maxShowresultcount,orimaxShowresultcount:this.state.orimaxShowresultcount};
                    this.props.setChainPrevFilters(prevdata);
                    this.props.setDunitView(cfindList.data[cidx]);
                    this.props.history.push("/chaindepartments/details");
                }
            }
        }
       
    }
    //handling stackable products marking or removing
    handleStackabledepproducts=(obj)=>{
        this.setState({showStackableModal:true,selectedrowid:obj[0],selectedName:obj[1]})
    }
    handleToggleStackableModal=()=>{
        this.setState({showStackableModal:false})
    }
    //handle bulk selection
    handleBulkselect=()=>{
       
    }
    //switching parent user
    handledeleteDepartment=(obj)=>{
        confirmAlert({
            title: this.props.t('suretodelete'),
            message: this.props.t('THIS_ACTION_WILL_DELETE_THIS_DEPARTMENT_SURE'),
            overlayClassName: (this.props.isRTL === "rtl" ? "alertrtl-content" : ""),
            buttons: [{
                label: this.props.t('btnnames.yes'),
                onClick: () => {
                   this.deletedBulkcall([{id:obj[4].did,name:obj[1]}])
                }
            }, {
                label: this.props.t('btnnames.no'),
                onClick: () => {
                    return false;
                }
            }]
        });
    }
    //deleet bulk call
    deletedBulkcall=(ids)=>{
    var payload={
        departmentIds:ids
    }
        this.setState({loading:true},()=>{
            submitSets(submitCollection.bulkDepartmentDelete, payload, true).then(res => {
                if(res&&res.status){
                    if(res.extra.length>1){
                        //bulk
                       
                    }else{
                        if(res.extra[0].success){
                            alertService.success(res.extra[0].response[0]?res.extra[0].response[0]:this.props.t("SUCCESSFULLY_DELETED"))
                            this.handleTableSearch(null, "click");
                            this.setState({loading:false})
                        }else{
                            alertService.error(res.extra[0].response[0]?res.extra[0].response[0]:this.props.t("erroroccurred"))
                            let respobj = { responseType: "department", prods: res.extra,actionType: "Delete", };
                            this.setState({loading:false,summeryres:respobj,showresultSummeryModal:true},()=>{
                                // this.handleresultSummeryModal()
                            })
                        }
                    }
                }else{
                    this.setState({loading:false})
                    alertService.error(this.props.t("erroroccurred"))
                }
            })
        })
    }
    //handleresultSummeryModal
    handleresultSummeryModal=()=>{
        this.setState({showresultSummeryModal:!this.state.showresultSummeryModal})
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

    handleShowingresults=(e, isonblur)=>{
        if(isonblur===true){
            this.setState({maxShowresultcount: (e.target.value!=="" && e.target.value>0)?e.target.value:this.state.orimaxShowresultcount})
        }
        else{
            this.setState({maxShowresultcount: e.target.value})
        }
    }

    render(){
        const ftableheaders = [{text: "", width: "1%"}, this.props.t('department'), this.props.t('is_hidden'), this.props.t('color'),{text: "", width: "1%"}]; 

        return (<>
            <Col xs={12} className={"main-content "+(this.props.isRTL==="rtl"?"RTL":"")} dir={this.props.isRTL}>
                <Row>
                  <MDSidebarMenu />
                  <Col xs={12} lg={10}>
                    <Breadcrumb dir="ltr">
                        {this.props.isRTL==="rtl"?<>
                        <Breadcrumb.Item active>{this.props.t('chaindepartments')}</Breadcrumb.Item>
                        <li className="breadcrumb-item"><Link to={"/"+this.props.HomePageVal} role="button">{this.props.t('home')}</Link></li>
                        </>:<>
                        <li className="breadcrumb-item"><Link to={"/"+this.props.HomePageVal} role="button">{this.props.t('home')}</Link></li>
                        <Breadcrumb.Item active>{this.props.t('chaindepartments')}</Breadcrumb.Item>
                        </>}
                    </Breadcrumb>      
                    <Col className="white-container additem-content departmantcat" ref={this.whitecontainer}>
                        <Col sm={12} lg={9} className="col-centered">

                            <nav className="breadcrumbs sub-breadscrumb">
                                <div className="breadcrumbs__item is-active">
                                    <div className='scub-span single'>{this.props.t("departments")}</div>
                                </div>
                                <div className="breadcrumbs__item is-disabled">
                                    <div className='scub-span single'>{this.props.t("categories")}</div>
                                </div>
                                <div className="breadcrumbs__item is-disabled">
                                    <div className='scub-span single'>{this.props.t("sub_categories")}</div>
                                </div>
                            </nav>

                            {/* <Button type="submit" className="highlight-btn" onClick={this.handleNewLink} variant="success">{this.props.t('btnnames.addnew')}</Button> */}
                            
                            <Col className="custom-filters form-inline" style={{marginTop: "20px"}}>
                                {/* <label className="filter-label">{this.props.t('departmentname')}</label> */}
                                <Form.Control placeholder={this.props.t('srchdep')} value={this.state.sobj.departmentName} onChange={e => this.handleFilterObject(e,"departmentName","change",this.props.t('Character.search_text'))} onKeyUp={e => this.handleFilterObject(e,"departmentName","enter")} onKeyDown={(e)=>preventinputToString(e,this.state.sobj.departmentName,(this.props.t('Character.search_text')))}/>
                                <span> <label className="filter-label">{this.props.t("SHOW_RESULTS")}</label>
                                <Form.Control style={{width:"60px"}} type="number"  value={this.state.maxShowresultcount} onChange={e => this.handleShowingresults(e,false)} onBlur={e => this.handleShowingresults(e,true)} onKeyDown={ (evt) => evt.key === "."? evt.preventDefault(): preventinputotherthannumbers(evt,this.state.maxShowresultcount,(this.props.t('Character.results'))) } /></span>
                                <Button type="button" variant="warning" className="search-link filter-btn" onClick={e => this.handleFilterObject(e,null,"click")}>{this.props.t('btnnames.search')}</Button>
                                <Button type="button" variant="outline-secondary" className="filter-btn" onClick={this.resetTableFilters}>{this.props.t('btnnames.reset')}</Button>
                            </Col>
                            {/* <Col className="bulkselection form-inline">
                                <Form.Check 
                                    type={"checkbox"}
                                    // id={`default-${type}`}
                                    label={"all"}
                                />
                                <Button size="sm" ><FeatherIcon size={16} icon="trash-2" /></Button>
                            </Col> */}
                            {this.state.isdataloaded && this.state.ftablebody && this.state.ftablebody.length > 0?
                                <AcTable isRTL={this.props.isRTL} t={this.props.t} aheaders={ftableheaders} totalresults={this.state.totalresults} startpage={this.state.startpage} alldata={this.state.toridata} asearchobj={this.state.sobj} abody={this.state.ftablebody} showpaginate={true} pagetype="ajax" pagecount={this.state.sobj.maxResult} handleRowClick={this.handleRowClick} handlePageChange={this.handlePageChange}/>
                            :this.state.isdataloaded?<>
                                <AcNoDataView />
                            </>:<></>}
                        </Col>
                       {this.state.showresultSummeryModal? <ResultSummery 
                        responseObj={this.state.summeryres}
                        toggleResponseModal={this.handleresultSummeryModal}
                        t={this.props.t} isRTL={this.props.isRTL} 
                        /> 
                        :<></>}
                    </Col>
                  </Col>
                </Row>
                <AcViewModal showmodal={this.state.loading} message={this.props.t('PLEASE_WAIT')}  />
                {this.state.showStackableModal?<StackableModal level={stackableLevels.department} isRTL={this.props.isRTL} selectedName={this.state.selectedName}
                 sid={this.state.selectedrowid} show={this.state.showStackableModal} handleClose={this.handleToggleStackableModal} />:<></>}
            </Col>
        </>);
    }
}

const mapDispatchToProps = dispatch => ({
    setChainPrevFilters: (payload) => dispatch(viewSetChainDepPrevAction(payload)),
    setDunitView: (payload) => dispatch(viewSetChainDepAction(payload)),
});

export default withTranslation()(withRouter(connect(null,mapDispatchToProps)(ChainDepartmentsComponent)));
