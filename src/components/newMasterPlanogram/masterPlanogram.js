import React, { Component } from 'react';
import { Col, Breadcrumb, Button, Form,  } from 'react-bootstrap';
import { withTranslation } from 'react-i18next';
import { withRouter, Link } from 'react-router-dom';

import { AcTable, AcViewModal } from '../UiComponents/AcImports';
import { submitSets } from '../UiComponents/SubmitSets';
//import { submitCollection } from '../../_services/submit.service';

export class MasterPlanograms extends Component {
    constructor(props){
        super(props);
        this.state = {
            loading:false,
            toridata:[], //all loaded table data with page
            isdataloaded: true, //is table data loaded
            ftablebody: [
                {0:"", 1:"1", 2:"Sample planogram 2", 3:"0.0.1", 4:"Draft"},
                {0:"", 1:"2", 2:"Sample planogram 1", 3:"1.0.0", 4:"Published"},
            ], //showing page table data
            sobj: this.defaultFilterObject(), //default search object
            startpage: 1, totalresults: 2, //startpage and total results 
        }
    }

    componentDidMount(){
        this._isMounted = true;

        if(this._isMounted){
            //onpage load trigger search call
            //this.handleTableSearch(null,"click");
        }
    }

    componentWillUnmount(){
        this._isMounted = false;
    }
    
    defaultFilterObject = () => {
        return { query: "", isReqPagination:true, startIndex:0, maxResult:8 };
    }
    
    //reset table filters 
    resetTableFilters = () => {
        this.setState({ sobj: this.defaultFilterObject(), startpage: 1}, () => {
            //this.handleTableSearch(null,"click");
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
                    //const citem = cfindList.data[i];
                    cdata.push({0:"", 1:"",2:""});
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
    handleTableSearch = (evt,etype) => {
        if(etype === "click" || (etype === "enter" && evt.which === 13)){
            this.setState({
                isdataloaded: false,
                loading:true
            });
            submitSets({}, this.state.sobj, true).then(res => { 
                //console.log(res);
                var cdata = this.state.toridata;
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
    //onclick new department link clear redux object and redirect to add new view
    handleNewLink = () => {
        //this.props.setDunitView(null);
        this.props.history.push("/masterplanograms/selectdept");
    }
    //on tablerow click handle set object to redux and redirect to edit view
    handleRowClick = (cidx,citem) => {
        var cfindList = this.state.toridata.find(x => x.page === this.state.startpage);
        if(cfindList){
            if(citem && citem[0] && citem[0] !== ""){
                let finditem = cfindList.data.find(z => z.departmentId === citem[0]);
                //console.log(finditem);
                if(finditem){
                    //this.props.setDunitView(finditem);
                    this.props.history.push("/masterplanograms/details");
                }
            } else{
                //this.props.setDunitView(cfindList.data[cidx]);
                this.props.history.push("/masterplanograms/details");
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
    
    render() {

        const ftableheaders = ["", "Number", "Master Planogram", "Version", "Status"]; 

        return (<>
            <Col xs={12} className={"main-content "+(this.props.isRTL==="rtl"?"RTL":"")} dir={this.props.isRTL}>
                <Breadcrumb dir="ltr">
                    {this.props.isRTL==="rtl"?<>
                    <Breadcrumb.Item active>{this.props.t('master_planogram')}</Breadcrumb.Item>
                    <li className="breadcrumb-item"><Link to="/dashboard" role="button">{this.props.t('home')}</Link></li>
                    </>:<>
                    <li className="breadcrumb-item"><Link to="/dashboard" role="button">{this.props.t('home')}</Link></li>
                    <Breadcrumb.Item active>{this.props.t('master_planogram')}</Breadcrumb.Item>
                    </>}
                </Breadcrumb>      
                <Col className="white-container" style={{background:"transparent", boxShadow:"none", padding:"0px"}}>
                    <Col sm={12}>
                        <Button type="submit" className="highlight-btn" onClick={this.handleNewLink} variant="success">{this.props.t('newmasterplanogram')}</Button>
                        <Col className="custom-filters form-inline">
                            {/* <label className="filter-label">{this.props.t('departmentname')}</label> */}
                            <Form.Control placeholder={this.props.t('search')} value={this.state.sobj.name} onChange={e => this.handleFilterObject(e,"name","change")} onKeyUp={e => this.handleFilterObject(e,"name","enter")} />
                            <Button type="button" variant="warning" className="search-link filter-btn" onClick={e => this.handleFilterObject(e,null,"click")}>{this.props.t('btnnames.search')}</Button>
                            <Button type="button" variant="outline-secondary" className="filter-btn" onClick={this.resetTableFilters}>{this.props.t('btnnames.reset')}</Button>
                        </Col>
                        {this.state.isdataloaded?
                        <AcTable isRTL={this.props.isRTL} t={this.props.t} aheaders={ftableheaders} totalresults={this.state.totalresults} startpage={this.state.startpage} alldata={this.state.toridata} asearchobj={this.state.sobj} abody={this.state.ftablebody} showpaginate={true} pagetype="ajax" pagecount={this.state.sobj.maxResult} handleRowClick={this.handleRowClick} handlePageChange={this.handlePageChange}/>
                        :<></>}
                    </Col>
                </Col>
            </Col>

            <AcViewModal showmodal={this.state.loading} message={this.props.t('PLEASE_WAIT')} />
        </>);
    }
}

export default withTranslation()(withRouter(MasterPlanograms));