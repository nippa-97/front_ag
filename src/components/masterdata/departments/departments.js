import React from 'react';
import { Link, withRouter } from 'react-router-dom';
import { connect } from "react-redux";
import {Breadcrumb, Button, Col, Form, Row} from 'react-bootstrap';

import './departments.css';

import { AcNoDataView, AcTable, AcViewModal } from '../../UiComponents/AcImports';
import { submitSets } from '../../UiComponents/SubmitSets';
import { submitCollection } from '../../../_services/submit.service';

import { viewDepSetAction, viewSetDeptPrevAction } from '../../../actions/dept/dept_action';

import MDSidebarMenu from '../../common_layouts/mdsidebarmenu';

import {  withTranslation } from "react-i18next";
import "../../../_translations/i18n";
import { FindMaxResult, preventinputToString, preventinputotherthannumbers } from '../../../_services/common.service';
import { DepartmentDetailsComponent } from './AddNew/addnew';

/**
 * using to show added departments list show or find
 * see documentation 2.1
 * 
 * @class DepartmentsComponent
 * @extends {React.Component}
 */
export class DepartmentsComponent extends React.Component{
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
            oneresultheight: 55, maxShowresultcount: 0, orimaxShowresultcount: 0, //find max result varibles

            isShowUpdateModal: false, selectedDept: null,
        }
    }

    componentDidMount(){
        this._isMounted = true;

        if(this._isMounted){
            //onpage load trigger search call
            //if prev details available
            if(this.props.deptState && this.props.deptState.deptPrevDetails){
                let prevdetails = this.props.deptState.deptPrevDetails;
                let prevviewtype = prevdetails.viewtype;

                if(prevviewtype){
                    let isresetting = false;
                    if(prevviewtype === "delete" || prevviewtype === "new"){
                        if(prevviewtype === "new"){
                            isresetting = true;
                        } else{
                            prevdetails["isReqCount"] = true;
                        }
                        
                        let prevftable = (prevdetails.ftablebody?prevdetails.ftablebody:[]);
                        if(prevviewtype === "delete" && prevftable.length === 1 && prevdetails.prevpage > 1){
                            const stindx = prevdetails.startIndex;
                            const maxresult = prevdetails.maxResult;
    
                            prevdetails.startIndex = (stindx - maxresult);
                            prevdetails.prevpage = (prevdetails.prevpage - 1);
                        }

                    } else{
                        prevdetails["isReqCount"] = true;
                    }
                    prevdetails["ftablebody"] = [];

                    let pstartpage = (!isresetting?prevdetails.prevpage:1);
                    let ptotalresults = (!isresetting?prevdetails.totalresults:0);
                    let psearchobj = (!isresetting?prevdetails:this.defaultFilterObject());
                    let prvmaxShowresultcount=prevdetails.maxShowresultcount
                    this.setState({ sobj: psearchobj, startpage: pstartpage, totalresults: ptotalresults,maxShowresultcount:prvmaxShowresultcount,orimaxShowresultcount:prevdetails.orimaxShowresultcount }, () => {
                        this.props.setDeptPrevDetails(null);
                        this.handleTableSearch(null,"click");
                    });
                } else{
                    let CprvmaxShowresultcount=prevdetails.maxShowresultcount
                    this.setState({ maxShowresultcount:CprvmaxShowresultcount,orimaxShowresultcount:prevdetails.orimaxShowresultcount }, () => {
                        this.props.setDeptPrevDetails(null);
                        this.handleTableSearch(null,"click");
                    })
                }
            } else{
                var maxresutcount=FindMaxResult(this.whitecontainer.current?(this.whitecontainer.current.offsetHeight) : 0,this.state.oneresultheight,145)
                
                this.setState({
                    maxShowresultcount:maxresutcount.maxresultCount,orimaxShowresultcount:maxresutcount.maxresultCount
                },()=>{
                    this.handleTableSearch(null,"click");
                })
                    
                       
            }
        }
    }

    componentWillUnmount(){
        this._isMounted = false;
    }
    
    defaultFilterObject = () => {
        return { name:"", isReqPagination:true, startIndex:0, maxResult:8, isReqCount: false, isIgnoreHide: false };
    }
    //export prev object
    exportPrevDetails = (viewtype) => {
        let cviewtype = this.state.sobj;
        cviewtype["prevpage"] = this.state.startpage;
        cviewtype["totalresults"] = this.state.totalresults;
        cviewtype["viewtype"] = viewtype;
        cviewtype["ftablebody"] = this.state.ftablebody;
        cviewtype["maxShowresultcount"] = this.state.maxShowresultcount;
        cviewtype["orimaxShowresultcount"] = this.state.orimaxShowresultcount;

        return cviewtype;
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
                    cdata.push({0:citem.departmentId, 1:citem.name, 2: (citem.hide?this.props.t("btnnames.yes"):this.props.t("btnnames.no")), 3:{type:"color",color:citem.color}});
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
        if(etype === "name"){
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
            var maxresutcount = this.state.maxShowresultcount;

            var csobj = this.state.sobj;
            csobj.maxResult = maxresutcount;
            
            this.setState({ sobj: csobj, isdataloaded: false, loading: true });
            submitSets(submitCollection.searchDepatments, this.state.sobj, true).then(res => {
                //console.log(res);
                var cdata = [];
                if(res && res.status){
                    var cpageidx = cdata.findIndex(x => x.page === this.state.startpage);
                    if(cpageidx > -1){
                        cdata[cpageidx].data = res.extra;
                    } else{
                        cdata.push({page:(this.state.startpage),data:res.extra});
                    }
                    
                    let sobj = this.state.sobj;
                    
                    this.setState({
                        toridata: cdata,
                        totalresults: (this.state.startpage === 1 || sobj.isReqCount?res.count:this.state.totalresults),
                        loading:false
                    }, () => {
                        this.loadTableData();

                        sobj.isReqCount = false;
                        this.setState({ sobj: sobj, });
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
        // this.props.setDeptView(null);
        // this.props.setDeptPrevDetails(this.exportPrevDetails(null));
        // this.props.history.push("/departments/details");

        this.setState({ selectedDept: null }, () => {
            this.handleUpdateModalToggle();
        });
    }
    //on tablerow click handle set object to redux and redirect to edit view
    handleRowClick = (cidx,citem) => {
        var cfindList = this.state.toridata.find(x => x.page === this.state.startpage);
        if(cfindList){
            if(citem && citem[0] && citem[0] !== ""){
                let finditem = cfindList.data.find(z => z.departmentId === citem[0]);
                //console.log(finditem);
                if(finditem){
                    // this.props.setDeptView(finditem);
                    // this.props.setDeptPrevDetails(this.exportPrevDetails(null));
                    // this.props.history.push("/departments/details");

                    this.setState({ selectedDept: finditem }, () => {
                        this.handleUpdateModalToggle();
                    });
                }
            } else{
                // this.props.setDeptView(cfindList.data[cidx]);
                // this.props.setDeptPrevDetails(this.exportPrevDetails(null));
                // this.props.history.push("/departments/details");

                this.setState({ selectedDept: cfindList.data[cidx] }, () => {
                    this.handleUpdateModalToggle();
                });
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
            // this.handleTableSearch(null, "click");
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

    handleUpdateModalToggle = (isreload, isdelete) => {
        this.setState({ isShowUpdateModal: !this.state.isShowUpdateModal }, () => {
            if(isreload){
                let serachobj = this.state.sobj;
                const stindx = serachobj.startIndex;
                const maxresutcount = this.state.maxShowresultcount;

                if(isdelete){
                    if(isdelete && this.state.ftablebody.length === 1 && this.state.startpage > 1){
                        serachobj.startIndex = (stindx - maxresutcount);
                        serachobj.isReqCount = true;

                        this.setState({sobj: serachobj, startpage: (this.state.startpage - 1)},()=>{
                            this.handleTableSearch(null,"click");
                        });
                    }
                    else{
                        serachobj.isReqCount = true;
                        this.setState({sobj: serachobj , startpage: (this.state.startpage - 1)},()=>{
                            this.handleTableSearch(null,"click");
                        });
                    }
                } else{
                    serachobj.isReqCount = true;
                    this.setState({sobj: serachobj},()=>{
                        this.handleTableSearch(null,"click");
                    });
                }
                
            }   
        });
    }

    render(){
        const ftableheaders = [{text: "", width: "1%"}, this.props.t('departmentname'), this.props.t('is_hidden'), this.props.t('color')]; 

        return (<>
            <Col xs={12} className={"main-content "+(this.props.isRTL==="rtl"?"RTL":"")} dir={this.props.isRTL}>
                <Row>
                  <MDSidebarMenu />
                  <Col xs={12} lg={10}>
                    <Breadcrumb dir="ltr">
                        {this.props.isRTL==="rtl"?<>
                        <Breadcrumb.Item active>{this.props.t('departments')}</Breadcrumb.Item>
                        <li className="breadcrumb-item"><Link to={"/"+this.props.HomePageVal} role="button">{this.props.t('home')}</Link></li>
                        </>:<>
                        <li className="breadcrumb-item"><Link to={"/"+this.props.HomePageVal} role="button">{this.props.t('home')}</Link></li>
                        <Breadcrumb.Item active>{this.props.t('departments')}</Breadcrumb.Item>
                        </>}
                    </Breadcrumb>      
                    <Col className="white-container rg-mdview" ref={this.whitecontainer}>
                        <Col sm={12} lg={8} className="col-centered">
                            <Col className="custom-filters form-inline">
                                {/* <label className="filter-label">{this.props.t('departmentname')}</label> */}
                                <Form.Control  placeholder={this.props.t('srchdep')} value={this.state.sobj.name} onChange={e => this.handleFilterObject(e,"name","change",this.props.t('Character.search_text'))} onKeyUp={e => this.handleFilterObject(e,"name","enter")} onKeyDown={(e)=>preventinputToString(e,this.state.sobj.name,(this.props.t('Character.search_text')))}/>
                                <span> <label className="filter-label">{this.props.t("SHOW_RESULTS")}</label>
                                <Form.Control style={{width:"60px"}} type="number"  value={this.state.maxShowresultcount} onChange={e => this.handleShowingresults(e,false)} onBlur={e => this.handleShowingresults(e,true)} onKeyDown={ (evt) => evt.key === "."? evt.preventDefault(): preventinputotherthannumbers(evt,this.state.maxShowresultcount,(this.props.t('Character.results'))) } /></span>
                                <Button type="button" variant="warning" className="search-link filter-btn" onClick={e => this.handleFilterObject(e,null,"click")}>{this.props.t('btnnames.search')}</Button>
                                <Button type="button" variant="outline-secondary" className="filter-btn" onClick={this.resetTableFilters}>{this.props.t('btnnames.reset')}</Button>
                            </Col>
                            <Button type="submit" className="highlight-btn" onClick={this.handleNewLink} variant="success">{this.props.t('btnnames.addnew')}</Button>
                            
                            {this.state.isdataloaded && this.state.ftablebody && this.state.ftablebody.length > 0?
                                <AcTable isRTL={this.props.isRTL} t={this.props.t} aheaders={ftableheaders} totalresults={this.state.totalresults} startpage={this.state.startpage} alldata={this.state.toridata} asearchobj={this.state.sobj} abody={this.state.ftablebody} showpaginate={true} pagetype="ajax" pagecount={this.state.sobj.maxResult} handleRowClick={this.handleRowClick} handlePageChange={this.handlePageChange}/>
                            :this.state.isdataloaded?<>
                                <AcNoDataView />
                            </>:<></>}
                        </Col>
                    </Col>
                  </Col>
                </Row>
            </Col>

            {this.state.isShowUpdateModal?
            <DepartmentDetailsComponent t={this.props.t}
                isRTL = {this.props.isRTL}
                isShowUpdateModal={this.state.isShowUpdateModal}
                selectedDept={this.state.selectedDept} 
                handleUpdateModalToggle={this.handleUpdateModalToggle}
                />
            :<></>}

            <AcViewModal showmodal={this.state.loading} message={this.props.t('PLEASE_WAIT')} />
        </>);
    }
}

const mapDispatchToProps = dispatch => ({
    setDeptView: (payload) => dispatch(viewDepSetAction(payload)),
    setDeptPrevDetails: (payload) => dispatch(viewSetDeptPrevAction(payload)),
});

export default withTranslation()(withRouter(connect(null,mapDispatchToProps)(DepartmentsComponent)));