import React from 'react'
import { Link, withRouter } from 'react-router-dom';
import { Col, Breadcrumb, Button, Form, Table, Row, OverlayTrigger, Popover, Pagination, Badge ,Tooltip} from 'react-bootstrap'
import { connect } from 'react-redux';
import { PlusIcon, SearchIcon, TrashIcon, PencilIcon, MultiSelectIcon, ChevronLeftIcon, ChevronRightIcon, XIcon } from '@primer/octicons-react'; //ListUnorderedIcon, 
import FeatherIcon from 'feather-icons-react';
import { confirmAlert } from 'react-confirm-alert';

import { submitSets } from '../../components/UiComponents/SubmitSets';
import { submitCollection } from '../../_services/submit.service';
import { alertService } from '../../_services/alert.service';
import { FindMaxResult, getPager, preventinputToString, preventinputotherthannumbers } from '../../_services/common.service';
import { QUEST_STATUS } from '../../enums/taskfeedEnums';
import { AcNoDataView, AcViewModal } from '../UiComponents/AcImports';

import { withTranslation } from 'react-i18next';

import { viewQuestionSetAction, selectedQuestionSetAction } from '../../actions/questionear/quest_action';

import './questionear.css';
import loadinggif from '../../assets/img/loading-sm.gif';



export const DetailsPopover = (details) => {

    const DetailsOverlay = (props) => {
        const popover = (
            <Popover {...props} className="quest-popover">
                <Popover.Body>
                    <ul>
                        {details.items.map((xitem,xidx) => {
                            return <li key={xidx}>{xitem.taskName}</li>;
                        })}
                    </ul>
                </Popover.Body>
            </Popover>
        );
        return popover;
    };

    return (
        <>
        {details.items && details.items.length>0?<div style={{position:"relative"}}><OverlayTrigger trigger={['click']} rootClose placement="bottom" transition={false} overlay={DetailsOverlay}>
            <Button variant="default" style={{padding:"20px 30px",paddingBottom:"0px"}}>{details.count}</Button>
        </OverlayTrigger></div>
        :<><Button variant="default" style={{padding:"20px 30px",paddingBottom:"0px"}}>{details.count}</Button></>}
        </>
    );
}

/**
 * questionear list view 
 *
 * @class QuestionearList
 * @extends {React.Component}
 */
export class QuestionearList extends React.Component {
    _isMounted = false;

    constructor(props) {
        super(props);
        this.whitecontainer=React.createRef();
        this.state = {
            //data loading
            ismocktesting: false,
            toridata: [], isdataloaded: true, ftablebody: [],
            sobj: this.defaultFilterObject(),
            startpage: 1, totalresults: 0,
            totalPages: 0, //pagination
            //selected questinear
            isLoadingQuestnear: false, selectedQuestnear: null, viewloadingmodal: false,
            oneresultheight: 65, maxShowresultcount: 0, orimaxShowresultcount: 0, //find max result varibles
        }

    }

    componentDidMount() {
        this._isMounted = true;

        if(this._isMounted){
            //check search saved object available
            if(sessionStorage.getItem("qustsearchfilters")){
                var cfilterobj = JSON.parse(sessionStorage.getItem("qustsearchfilters"));
                this.setState({sobj: cfilterobj.sobj, startpage: cfilterobj.startpage, totalresults: cfilterobj.totalresults, totalPages: cfilterobj.totalpages,maxShowresultcount: cfilterobj.maxShowresultcount, orimaxShowresultcount: cfilterobj.orimaxShowresultcount,}, () => {
                    this.handleTableSearch(null, "click");
                });
            } else{
                var maxresutcount=FindMaxResult(this.whitecontainer.current?(this.whitecontainer.current.offsetHeight) : 0,this.state.oneresultheight,185)
                this.setState({
                    maxShowresultcount:(maxresutcount.maxresultCount>8?maxresutcount.maxresultCount:8),orimaxShowresultcount:(maxresutcount.maxresultCount>8?maxresutcount.maxresultCount:8)
                },()=>{
                    this.handleTableSearch(null, "click");
                })
            }

            //load new task if questnear selected object available
            if(this.props.questionState && this.props.questionState.selectedQuestionear && this.props.questionState.selectedQuestionear.obj){
                const cselectedobj = JSON.parse(JSON.stringify(this.props.questionState.selectedQuestionear));
                this.handleRowClick(cselectedobj.obj);
                this.props.setSelectedQuesionear(null);
            }
        }
    }

    componentWillUnmount(){
        this._isMounted = false;
    }

    defaultFilterObject = () => {
        return { searchName: "", isReqPagination: true, startIndex: 0, maxResult: 6, isReqCount: false };
    }
    //reset table filters 
    resetTableFilters = () => {
        this.setState({ sobj: this.defaultFilterObject(), startpage: 1, totalPages: 0, toridata: [] }, () => {
            this.handleTableSearch(null,"click");
        });
    }
    //load table data
    loadTableData = () => {
        var cdata = [];
        if (this.state.toridata && this.state.toridata.length > 0) {
            var cfindList = this.state.toridata.find(x => x.page === this.state.startpage);
            cdata = (cfindList.data && cfindList.data.length > 0?cfindList.data:[]);
        }
        this.setState({ ftablebody: cdata }, () => {
            this.setState({ isdataloaded: true });
            if(this.state.startpage > 1){
                this.setPage(this.state.startpage,false);
            } else{
                this.setPage(1,false);
            }
        });
        // this.saveFilterObject(this.state.startpage,this.state.sobj,this.state.totalresults,this.state.totalPages);
    }

    //filter search
    handleTableSearch = (evt, etype) => {
        if (!this.state.ismocktesting && (etype === "click" || (etype === "enter" && evt.which === 13))) {
            var maxresutcount = this.state.maxShowresultcount;
            var cCsobj=this.state.sobj
            cCsobj.maxResult = maxresutcount;
            this.setState({ isdataloaded: false });
            sessionStorage.removeItem("qustsearchfilters");
            submitSets(submitCollection.getQuestionnaireList, cCsobj, false).then(res => {
                //console.log(res);
                var cdata = [];
                //reset isreqcount
                var csobj = cCsobj;
                csobj.isReqCount = false;
                this.setState({ sobj: csobj });

                if (res && res.status) {
                    cdata.push({ page: (this.state.startpage), data: res.extra });
                    this.setState({
                        toridata: cdata,
                        totalresults: (this.state.startpage === 1 ? res.count : this.state.totalresults),
                    }, () => {
                        this.loadTableData();
                    });
                } else {
                    this.setState({
                        toridata: cdata,
                    }, () => {
                        this.loadTableData();
                    });
                }
            });
        }
    }
    //save filter object
    saveFilterObject = (startpage,sobj,totalresults,totalpages) => {
        const sfobj = {startpage: startpage, sobj: sobj, totalresults: totalresults, totalpages: totalpages,maxShowresultcount: this.state.maxShowresultcount, orimaxShowresultcount: this.state.orimaxShowresultcount,};
        sessionStorage.setItem("qustsearchfilters", JSON.stringify(sfobj));
    }
    //set filter object
    handleFilterObject = (evt, etype, ctype,msg) => {
        var cobj = this.state.sobj;
        var cstartpage = this.state.startpage;
        var ctotalresults = this.state.totalresults;
        if(etype === "searchName"){
            if(!preventinputToString(evt,evt.target.value,msg)){
                evt.preventDefault()
                return
              }
        }
        if(evt){
            cobj[etype] = evt.target.value;
        }
        if(ctype === "click" || ctype === "enter"){
            cobj["startIndex"] = 0;

            cstartpage = 1;
            ctotalresults = 0;
        }
        
        this.setState({ sobj: cobj, startpage: cstartpage, totalresults: ctotalresults }, () => {
            if (ctype === "click" || (ctype === "enter" && evt.which === 13)) {
                this.handleTableSearch(null, "click");
            }
        });
    }
    //pager
    setPage = (cpage,isnewpage) => {
        var pageLength = (this.state.sobj.maxResult?this.state.sobj.maxResult:0);
        var pager = getPager(this.state.totalresults,cpage,pageLength);
        
        // check page isn't out of range
        if (cpage < 1 || cpage > pager.totalPages) {
            this.setState({ ftablebody: [], startpage: 1, totalPages: 0 });
            return;
        }
        
        if(isnewpage){
            var cfindList = (this.state.toridata?this.state.toridata.find(x => x.page === cpage):undefined);
            
            if(cfindList&&cfindList){
                this.setState({ ftablebody: cfindList.data, selectedQuestnear: null });
                this.props.setSelectedQuesionear(null);
            } else{
                this.handlePageChange(cpage);
            }
        }

        this.setState({ startpage: pager.currentPage, totalPages: pager.totalPages });
    }
    //page change
    handlePageChange = (cstartpage) => {
        var cfindList = this.state.toridata.find(x => x.page === cstartpage);

        var csobj = this.state.sobj;
        csobj.isReqCount = (this.state.totalPages === cstartpage?true:false);
        csobj.startIndex = (cstartpage !== 1?((cstartpage - 1) * this.state.sobj.maxResult):0);
       
        this.setState({ sobj: csobj, startpage: cstartpage, isdataloaded: false, selectedQuestnear: null }, () => {
            this.props.setSelectedQuesionear(null);
            
            if (cfindList) {
                this.setState({ isdataloaded: true });
                this.loadTableData();
            } else {
                this.handleTableSearch(null, "click");
            }
        });
    }
    //table row click
    handleRowClick = (cobj,iseditview,iscloseview) => {
        if(iscloseview){
            this.setState({ selectedQuestnear: null, isLoadingQuestnear: false, viewloadingmodal: false });
        } else{
            if(!this.state.isLoadingQuestnear){
                var isshowloading = (iseditview?true:false);
                this.setState({ isLoadingQuestnear: true, viewloadingmodal: isshowloading }, () => {
                    submitSets(submitCollection.getSpecificQuestionnaire, { questionnaireId: cobj.questionnaireId }, false).then(res => {
                        //console.log(res);
                        if (res && res.status && res.extra) {
                            this.setState({ selectedQuestnear: res.extra, isLoadingQuestnear: false, viewloadingmodal: false }, () => {
                                //handle edit redirect questionear
                                if(iseditview){
                                    this.props.setQuestionDetailsView(res.extra);
                                    this.props.history.push("/questionlist/details");
                                }
                            });
                        } else {
                            this.setState({ selectedQuestnear: null, isLoadingQuestnear: false, viewloadingmodal: false });
                        }
                    });
                });    
            } else{
                alertService.warn(this.props.t("ALREADYLOADING"));
            }    
        }
        this.saveFilterObject(this.state.startpage,this.state.sobj,this.state.totalresults,this.state.totalPages);
    }
    //handle delete questionear
    handleDeleteQuestionear = (cobj,cidx) => {
        confirmAlert({
            title: this.props.t("deleteaquestionear"),
            message: this.props.t("areyousuretodeletethisquestionear"),
            overlayClassName: (this.props.isRTL==="rtl"?"alertrtl-content":""),
            buttons: [{
                label: this.props.t('btnnames.yes'),
                onClick: () => {
                    submitSets(submitCollection.deleteSpecificQuestionnaire, { questionnaireId: cobj.questionnaireId }, false, null, true).then(res => {
                        // console.log(res);
                        if (res && res.status) {
                            alertService.success(this.props.t("succesfullyquestioneardeleted"));
                            this.setState({ selectedQuestnear: null }, () => {
                                this.resetTableFilters();
                            });
                        } else {
                            // alertService.error(res && res.extra && res.extra !== ""?res.extra:this.props.t("erroroccurred"));
                        }
                    });
                }
            }, {
                label: this.props.t('btnnames.no')
            }]
        });
    }
    //new questionear link
    handleNewQueastionear = () => {
        this.props.setQuestionDetailsView(null);
        this.props.history.push("/questionlist/details");
    }
    //redirect to new task
    redirectNewTask = () => {
        var cselobj = { isshowmodal: true, obj: this.state.selectedQuestnear};
        this.props.setSelectedQuesionear(cselobj);
        this.props.history.push("/tasks");
    }

    handleShowingresults=(e, isonblur)=>{
        if(isonblur===true){
            this.setState({maxShowresultcount: (e.target.value!=="" && e.target.value>0)?e.target.value:this.state.orimaxShowresultcount})
        }
        else{
            this.setState({maxShowresultcount: e.target.value})
        }
    }

    handleResultsCOuntKeyUp = (e) =>{
        if(e.key==="Enter"){
            this.setState({maxShowresultcount: (e.target.value!=="" && e.target.value>0)?e.target.value:this.state.orimaxShowresultcount},()=>{
                this.handleTableSearch(null, "click");
            })
        }
    }
    handleText = (text)=>{
        let result = text;
        if(typeof(text) === "string"){
            if(text.length > 30){

                result = (
                <OverlayTrigger placement="top" overlay={<Tooltip>{text}</Tooltip>}>
                    <span> {text.substring(0,30) + "..."}</span> 
                </OverlayTrigger>
                )
            }
        }
        return result
    }

    render() {

        //pagecounts
        var cpcount = (this.state.sobj.maxResult?this.state.sobj.maxResult:0);
        var ptotalresults = (this.state.totalresults?this.state.totalresults:0);
        var pstartcount = (this.state.startpage > 1?((cpcount * (this.state.startpage - 1))):1);
        var pendcount = (ptotalresults > (cpcount * this.state.startpage)?((cpcount * this.state.startpage)):ptotalresults);
        
        return (
            <Col xs={12} className={"main-content "+(this.props.isRTL==="rtl"?"RTL":"")} dir={this.props.isRTL}>
                <div>
                    <Breadcrumb dir="ltr">
                        {this.props.isRTL==="rtl"?<>
                        <Breadcrumb.Item active>{this.props.t('questionnaire')}</Breadcrumb.Item>
                        <li className="breadcrumb-item"><Link to={"/"+this.props.HomePageVal} role="button">{this.props.t('home')}</Link></li>
                        </>:<>
                        <li className="breadcrumb-item"><Link to={"/"+this.props.HomePageVal} role="button">{this.props.t('home')}</Link></li>
                        <Breadcrumb.Item active>{this.props.t('questionnaire')}</Breadcrumb.Item>
                        </>}
                    </Breadcrumb>
                    <div>
                        <Col className="white-container questionear-container" ref={this.whitecontainer}>
                            <Col className='custom-filters'>
                                <Col className="form-inline">
                                    <Col className="search-inline">
                                        {this.state.sobj.searchName !== ""?<span className='remove-link' onClick={this.resetTableFilters}><XIcon size={14} /></span>:<span><SearchIcon size={14} /></span>}
                                        <Form.Control  placeholder={this.props.t('FREE_SEARCH')} value={this.state.sobj.searchName} onChange={e => this.handleFilterObject(e, "searchName", "change",this.props.t('Character.search_text'))} onKeyUp={e => (e.which ===13? this.handleFilterObject(e, "searchName", "enter"):null)}  onKeyDown={(e)=>preventinputToString(e,e.target.value,(this.props.t('Character.search_text')))}/>
                                </Col>
                                
                                    <Button type="button" variant="warning" className="search-link filter-btn" onClick={this.handleNewQueastionear}><PlusIcon size={14} /> {this.props.t('addnewquestionear')}</Button>
                                    {/* <Button type="button" variant="outline-primary" className="filter-btn"><ListUnorderedIcon size={14} /> {this.props.t('activitylog')}</Button> */}
                                </Col>
                                <Col className='form-inline result'>
                                    <label className="filter-label">{this.props.t("SHOW_RESULTS")}</label>
                                    <Form.Control style={{width:"60px"}} type="number"  value={this.state.maxShowresultcount} onChange={e => this.handleShowingresults(e,false)} onBlur={e => this.handleShowingresults(e,true)} onKeyUp={(e) => this.handleResultsCOuntKeyUp(e)} onKeyDown={ (evt) => evt.key === "."?evt.preventDefault(): preventinputotherthannumbers(evt,this.state.maxShowresultcount,(this.props.t('Character.results'))) } />
                                </Col>    
                            </Col>
                            {this.state.isdataloaded && this.state.ftablebody && this.state.ftablebody.length > 0?<>
                                <Row>
                                    <Col md={(this.state.selectedQuestnear?7:12)} lg={(this.state.selectedQuestnear?8:12)} className="tableview-content questnear-table">
                                        <Table hover>
                                            <thead>
                                                <tr><th width="5%"><FeatherIcon icon="check-square" size={14} /></th><th>{this.props.t('QUESTNAME')}</th>
                                                <th width="100px" className="text-center">{this.props.t('version')}</th><th width="120px" className="text-center">{this.props.t('status')}</th><th width="130px" className="text-center">{this.props.t('NUMBEROFQUESTIONS')}</th>
                                                <th width={(this.state.selectedQuestnear?"13%":"20%")}>{this.props.t('CREATEDBY')}</th><th width="110px" className="text-center">{this.props.t('USEDINTASKS')}</th><th width="50px"></th><th width="50px"></th></tr>
                                            </thead>    
                                            <tbody>
                                                {this.state.ftablebody && this.state.ftablebody.length > 0?this.state.ftablebody.map((xitem,xidx) => {
                                                    return <React.Fragment key={xidx}><tr className={this.state.selectedQuestnear&&this.state.selectedQuestnear.questionnaireId === xitem.questionnaireId?"active":""}>
                                                        <td><FeatherIcon icon="check-square" size={14} /></td><td className="title-txt" onClick={() => this.handleRowClick(xitem)}>{this.handleText(xitem.questionnaireName) }</td>
                                                        <td width="5%" className="num-txt" onClick={() => this.handleRowClick(xitem)}>{xitem.versionNo}</td>
                                                        <td className="text-center" onClick={() => this.handleRowClick(xitem)}><label className={"bg "+(xitem.questionnaireStatus === QUEST_STATUS.Published?"bg-success":xitem.questionnaireStatus === QUEST_STATUS.Replaced?"bg-danger":"bg-warning")}>{this.props.t(xitem.questionnaireStatus.toLowerCase())}</label></td>
                                                        <td className="num-txt" onClick={() => this.handleRowClick(xitem)}>{xitem.noOfQuestion}</td><td onClick={() => this.handleRowClick(xitem)}>{xitem.createdBy}</td>
                                                        <td className="num-txt" style={{padding:"0px"}}><DetailsPopover xidx={xidx} count={xitem.taskList?xitem.taskList.length:0} items={xitem.taskList?xitem.taskList:[]} /></td>
                                                        <td className="text-center"><span className="icon-links" onClick={() => this.handleDeleteQuestionear(xitem,xidx)}><TrashIcon size={18}/></span></td>
                                                        <td className="text-center"><span className="icon-links" onClick={() => this.handleRowClick(xitem,true)}><PencilIcon size={18}/></span></td>
                                                    </tr>
                                                    <tr className="bottom-row"><td colSpan="8"></td></tr></React.Fragment>
                                                }):<>
                                                    <tr><td colSpan={9} className="text-center">{this.props.t("NO_CONTENT_FOUND")}</td></tr>
                                                </>}
                                            </tbody>
                                        </Table>
                                        {this.state.ftablebody.length > 0?<>
                                            <Badge bg="light" className="filtertable-showttxt" style={{color:"#142a33"}}>
                                                {this.props.isRTL==="rtl"?<>{this.props.t("results")} {ptotalresults} {this.props.t("of")} {pendcount} {this.props.t("to")} {pstartcount} {this.props.t("showing")}</>
                                                :<>{this.props.t("showing")} {pstartcount} {this.props.t("to")} {pendcount} {this.props.t("of")} {ptotalresults} {this.props.t("results")}</>}
                                            </Badge>
                                            <Pagination>
                                                <Pagination.Item onClick={() => this.setPage(1,true)} disabled={(this.state.startpage === 1?true:false)}><ChevronLeftIcon/><ChevronLeftIcon/></Pagination.Item>
                                                <Pagination.Item onClick={() => this.setPage((this.state.startpage - 1),true)} disabled={(this.state.startpage === 1?true:false)}><ChevronLeftIcon/></Pagination.Item>
                                                <label>{this.state.startpage} / {(this.state.totalPages?this.state.totalPages:0)}</label>
                                                <Pagination.Item onClick={() => this.setPage((this.state.startpage + 1),true)} disabled={(this.state.startpage === this.state.totalPages?true:false)}><ChevronRightIcon/></Pagination.Item>
                                                <Pagination.Item onClick={() => this.setPage(this.state.totalPages,true)} disabled={(this.state.startpage === this.state.totalPages?true:false)}><ChevronRightIcon/><ChevronRightIcon/></Pagination.Item>
                                            </Pagination>
                                        </>:<></>}
                                    </Col>
                                    <Col md={5} lg={4} className={"questionear-summary-content "+(this.state.selectedQuestnear?"active":"")}>
                                        <Col className="sub-content" style={{paddingBottom:"50px"}}>
                                            {this.state.isLoadingQuestnear?<Col className="question-loading"><img src={loadinggif} className="img-fluid" alt="loading animation"/></Col>
                                            :this.state.selectedQuestnear?<>
                                            <h3>{this.handleText(this.state.selectedQuestnear.questionnaireName)}</h3>
                                            <Col className="questionlist-content questnearview-list" style={{minHeight:"calc(100vh - 290px)"}}>
                                                <Row className="list-titles"><Col>{this.props.t("STAGEQUESTION")}</Col><Col xs={4} className="text-center">{this.props.t("FEEDBACK_TYPE")}</Col></Row>
                                                <ul>
                                                    {this.state.selectedQuestnear.questionList && this.state.selectedQuestnear.questionList.length > 0?this.state.selectedQuestnear.questionList.map((xitem,xidx) => {
                                                        return <li key={xidx} className="quest-list-item"><label style={{ width: "65%", fontSize: "13px", fontWeight:"700" }}>{this.handleText(xitem.question)}</label>
                                                        <Badge className="quest-badge">{xitem.feedbackTypeId===1?this.props.t('COMMENT'):xitem.feedbackTypeId===2?this.props.t('NUMBER'):xitem.feedbackTypeId===3?this.props.t('CHECK_LIST')
                                                        :xitem.feedbackTypeId===4?this.props.t('SELECT_FROM_A_LIST'):xitem.feedbackTypeId===8?this.props.t('branch'):"-"}</Badge></li>;
                                                    }):<></>}
                                                </ul>
                                            </Col>
                                            {this.state.selectedQuestnear && this.state.selectedQuestnear.questionnaireStatus === QUEST_STATUS.Published?<Button type="button" variant="outline-primary" className="bottom-btn questview-btn" onClick={this.redirectNewTask}><MultiSelectIcon size={14} /> {this.props.t('addtonewtask')}</Button>:<></>}
                                            <Button type="button" variant="outline-secondary" onClick={() => this.handleRowClick(null,null,true)} className="bottom-btn questview-btn left">{this.props.t("btnnames.close")}</Button></>
                                            :<Col className="noselected-txt"><h4 className="text-center">{this.props.t('NOSELECTEDQUEST')}</h4></Col>}
                                        </Col>
                                    </Col>    
                                </Row>
                            </>
                            :this.state.isdataloaded?<>
                                <AcNoDataView />
                            </>:<></>}
                        </Col>
                    </div>
                </div>
                
                <AcViewModal showmodal={(this.state.viewloadingmodal || !this.state.isdataloaded)} />
            </Col>
        )
    }
}
//set redux actions
const mapDispatchToProps = dispatch => ({
    setQuestionDetailsView: (payload) => dispatch(viewQuestionSetAction(payload)),
    setSelectedQuesionear: (payload) => dispatch(selectedQuestionSetAction(payload)),
});
export default withTranslation()(withRouter(connect(null, mapDispatchToProps)(QuestionearList)));
