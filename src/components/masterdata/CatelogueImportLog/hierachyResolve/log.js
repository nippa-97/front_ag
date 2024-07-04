import { Component } from 'react';
import { withRouter,  } from 'react-router-dom';
import { withTranslation } from 'react-i18next';
import { Button  , Col} from 'react-bootstrap';
import FeatherIcon from 'feather-icons-react';

import {  getPager, } from "../../../../_services/common.service";
import "./hierachyResolve.css";
import moment from 'moment';

const pageLength = 8;

function convertDateTimeYMD(MyDate_String_Value, type) {
    var value = new Date(MyDate_String_Value);
    var rvalue=moment(value).format('YYYY-MM-DD HH:mm:ss')
    return rvalue
}

export class ResolvedLog extends Component {
    _isMounted = false;
    constructor(props) {
        super(props)
        this.state = {
            oridata:[],
            paginatedList:[],
            currentPage:1,
            totalPages: 0,
        }
    }

    componentDidMount(){
        this._isMounted = true;
        if(this._isMounted){
            this.loadData();
        }
    }

    componentWillUnmount(){
        this._isMounted = false;
    }

    loadData = () =>{
        this.setState({oridata:this.props.logdata},()=>{
            this.setPage(1);
        });
    }

    setPage = (cpage) => {
        var citems = JSON.parse(JSON.stringify(this.state.oridata));
        var pager = getPager(citems.length, cpage, pageLength);
        
        // check page isn't out of range
        if (cpage < 1 || cpage > pager.totalPages) {
            return;
        }
        var sspage = (pager.currentPage === 1 ? 0 : ((pager.currentPage - 1) * pageLength));
        var sepage = (pager.currentPage * pageLength);
        this.setState({
            paginatedList: citems.slice(sspage, sepage),
            currentPage: pager.currentPage,
            totalPages: pager.totalPages,
        });
    }

    render(){
        
       
        return(
           <>
                <Col xs={12} className={"white-container resolve-log-section "+(this.state.oridata.length>0?"":" d-none ")+(this.props.isRTL==="rtl" ? "RTL":"LTR")} style={{minHeight:"1px",paddingBottom:"1px"}}>
                    <table className='table filter-table table-sm table-striped resloved-log-tbl'>
                        <thead>
                            <tr>
                                <th>{this.props.t("department")}</th>
                                <th>{this.props.t("category")}</th>
                                <th>{this.props.t("subcategory")}</th>
                                <th>{this.props.t("RESOLVED_DATE")}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {
                                this.state.paginatedList.map((log,index)=>{
                                    return(<tr key={index}>
                                        <td>
                                            <h5>{(log.fixedDepartmentName ? log.fixedDepartmentName : "N/A")}</h5>
                                            <div className='refname-tag'><b>{this.props.t("IMPORT_NAME")}</b> {(log.importDepartmentRefName ? log.importDepartmentRefName : "N/A")}</div>
                                        </td>
                                        <td>
                                            <h5>{(log.fixedCategoryName ? log.fixedCategoryName : "N/A")}</h5>
                                            <div className='refname-tag'><b>{this.props.t("IMPORT_NAME")}</b> {(log.importCategoryRefName ? log.importCategoryRefName : "N/A")}</div>
                                        </td>
                                        <td>
                                            <h5>{(log.fixedSubCategoryName ? log.fixedSubCategoryName : "N/A")}</h5>
                                            <div className='refname-tag'><b>{this.props.t("IMPORT_NAME")}</b> {(log.importSubCategoryRefName ? log.importSubCategoryRefName : "N/A")}</div>
                                        </td>
                                        <td>{(log.fixedDate ? convertDateTimeYMD(log.fixedDate) : "-")}</td>
                                    </tr>)
                                })
                            }
                        </tbody>
                    </table>
                    <Col xs={12} className={"pagination-section "}>
                        <div className={"btn-group btn-group-sm pagination-main "+(this.props.isRTL==="rtl" ?"float-left":"float-right")}>
                            <span ><Button variant="outline-secondary" size="sm" onClick={() => this.setPage(1)} disabled={(this.state.currentPage === 1 ? true : false)} ><FeatherIcon size={14} icon="chevrons-left"/></Button></span>
                            <span ><Button variant="outline-secondary"  size="sm" onClick={() => this.setPage((this.state.currentPage - 1))} disabled={(this.state.currentPage === 1 ? true : false)}>
                                <span className=''><FeatherIcon size={14} icon="chevron-left"/></span>
                                
                            </Button></span>
                            <Button size="sm" variant='light' disabled={true}>{this.state.currentPage} / {this.state.totalPages}</Button>
                            <span ><Button variant="outline-secondary"  size="sm" onClick={() => this.setPage((this.state.currentPage + 1))} disabled={(this.state.currentPage === this.state.totalPages ? true : false)} >
                                <span className=''><FeatherIcon size={14} icon="chevron-right"/></span>
                                
                            </Button></span>
                            <span ><Button variant="outline-secondary" size="sm" onClick={() => this.setPage(this.state.totalPages)} disabled={(this.state.currentPage === this.state.totalPages ? true : false)} ><FeatherIcon size={14} icon="chevrons-right"/></Button></span>
                        </div>
                        {
                            this.props.isRTL==="rtl" ?
                            <div className='pagi-sum float-right'>מציג {this.state.paginatedList.length} מתוך {Math.ceil(this.state.oridata.length)} תוצאות</div>
                            :
                            <div className='pagi-sum float-left'>Showing {this.state.paginatedList.length} of {Math.ceil(this.state.oridata.length)} Results</div>

                        }
                    </Col>
                </Col>
                
                {
                    this.state.oridata.length ===0 ?
                    <h6 className='resolve_no_res_found_txt'>{this.props.t("NO_RESULT_FOUND")}</h6>:<></> 
                }  
           </>

                
        )
    }

}

export default withTranslation()(withRouter(ResolvedLog));