import React, { Component } from 'react';
import { Badge, Button, Col, Modal , Form, Table} from 'react-bootstrap';
import { withTranslation } from 'react-i18next';
import { withRouter } from 'react-router-dom';
import FeatherIcon from 'feather-icons-react';
import './resultSummery.css'
import { getPager } from '../../../../_services/common.service';
import { Icons } from '../../../../assets/icons/icons';

class ResultSummery extends Component {
    constructor(props){
        super(props);

        this._isMounted = false;

        this.state = {
            oridata:[], bkpOriData: [],
            paginatedList:[],
            currentPage: 1,
            totalPages: 0,

            pageLength: 8,
            freeSearchTxt: "",
        }
    }

    componentDidMount(){
        this._isMounted = true;

        if(this._isMounted){
            if(this.props.responseObj){
                let prods = (this.props.responseObj?this.props.responseObj.prods:[]);
                this.setState({ oridata: prods, bkpOriData: prods },()=>{
                    this.setPage(1);
                });
            } 
        }
    }

    componentWillUnmount(){
        this._isMounted = false;
    }

    setPage = (cpage) => {
        var citems = JSON.parse(JSON.stringify(this.state.oridata));
        var pager = getPager(citems.length, cpage, this.state.pageLength);

        // check page isn't out of range
        if (cpage < 1 || cpage > pager.totalPages) {
            return;
        }
        var sspage = (pager.currentPage === 1 ? 0 : ((pager.currentPage - 1) * this.state.pageLength));
        var sepage = (pager.currentPage * this.state.pageLength);
        this.setState({
            paginatedList: citems.slice(sspage, sepage),
            currentPage: pager.currentPage,
            totalPages: pager.totalPages,
        });
    }

    changeSearchFilter = (etxt) =>{
        let filteredData = [];
        let allprods = JSON.parse(JSON.stringify(this.state.bkpOriData));
        let text = etxt.toLowerCase();
        this.setState({ freeSearchTxt: etxt });

        if(text !== ""){
            for (let i = 0; i < allprods.length; i++) {
                // let barcode = allprods[i].barcode.toLowerCase();
                let name = allprods[i].name.toLowerCase();
    
                if( name.includes(text)){
                    filteredData.push(allprods[i]);
                }
            }

        } else{
            filteredData = allprods;
        }
        
        this.setState({oridata:filteredData, paginatedList:(filteredData.length===0?[]:this.state.paginatedList)},()=>{
            this.setPage(1);
        });
    }

    _handleKeyDown = (evt) => {
        let charCode = ((evt.which) ? evt.which : evt.keyCode);

        if (charCode > 31 && (charCode < 48 || charCode > 57)){
            return false;
        }
        return true;
    }

    changeFilters = (type, value) => {
        if(type === "freeSearchValue"){
            this.changeSearchFilter(value);
        } 
        else if(type === "resultsCount"){
            this.setState({ pageLength: (parseFloat(value) > 100?100:parseFloat(value) > 0?parseFloat(value):1) }, () => {
                this.setPage(1);
            });
        }
    }
    render() {
        let acttype = (this.props.responseObj && this.props.responseObj.actionType?this.props.responseObj.actionType:"")
        let resptype = (this.props.responseObj && this.props.responseObj.responseType?this.props.responseObj.responseType:"")
        // const {summeryres}=this.props
        return (
            <Modal show={true}  className="store-product-adding-modal responseprods-modal-N " dir={this.props.isRTL} onHide={this.props.toggleResponseModal} backdrop="static">
                <Modal.Header>
                    <Modal.Title style={{fontSize:"22px",fontWeight:"700"}}>
                        {resptype === "department"?this.props.t('department'):resptype === "category"?this.props.t('category'):this.props.t('subcategory')}
                        
                        {" "+(acttype === "Delete"?this.props.t('btnnames.delete'):acttype === "changeParent"?this.props.t('CHANGE_PARENT'):this.props.t('SENT_DEPPRODS'))}
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Col className="newproducts-filters">
                        <Col xs={6} className="sub-design">
                            <Col className='searchbox' >
                                <Form.Control 
                                    type="text" 
                                    placeholder={this.props.t("btnnames.search")} 
                                    onFocus={e => e.target.select()}
                                    onChange={(e) => this.changeFilters("freeSearchValue",e.target.value)}  
                                    value={this.state.freeSearchTxt}
                                />
                                {Icons.SearchIcon("#4F4F4F",14)}
                            </Col>    
                        </Col>
                        <Col xs={6} className="sub-design text-right">
                            <Col className='searchbox number float-right'>
                                <label>{this.props.t("resultscount")}</label>
                                <Form.Control 
                                    type="number" 
                                    placeholder={this.props.t("resultscount")} 
                                    onFocus={e => e.target.select()}
                                    onChange={(e) => this.changeFilters("resultsCount",e.target.value)}  
                                    value={this.state.pageLength}
                                    onKeyDown={this._handleKeyDown}
                                />
                            </Col>   
                        </Col>
                    </Col>

                    <Col className='products-list'>
                        <Table size='small'>
                            {this.state.oridata.length > 0?
                                <thead>
                                    <tr><th width="160px">{this.props.t("name")}</th><th>{this.props.t("REASON")}</th><th className='text-center' width="25px">{this.props.t("CATELOGUE_FILTERS.status")}</th></tr>
                                </thead>
                            :<></>}
                            <tbody>{
                                this.state.paginatedList.map((item,index)=>{
                                    return(<React.Fragment key={index}>
                                        <tr>
                                            <td >{item.name}</td>
                                            <td className='name'>
                                                <Col  className="reson">
                                                    <ul style={{color:(item.success?"#198754":"#dc3545 ")}}>
                                                        {item.response?item.response.map((res,r)=><Col key={r}>
                                                            <li>{res}</li>
                                                        </Col>
                                                        ):<></>}
                                                    </ul>
                                                </Col>
                                                {/* {!item.success?<Alert variant={'danger'}>{item.response}</Alert>:<></>} */}
                                            </td>
                                            <td className='status'>{item.success?<Badge bg='success'>{this.props.t("SUCCESS")}</Badge>:<Badge bg='danger'>{this.props.t("FAIL")}</Badge>}</td>
                                        </tr>
                                        <tr className='empty-row'><td colSpan={3}></td></tr>
                                    </React.Fragment>);
                                })
                            }</tbody>
                        </Table>
                        {this.state.oridata.length === 0?
                            <h6 className='resolve_no_res_found_txt'>{this.props.t("NORESULTFOUNDSEARCH")}</h6>:<></> 
                        } 
                    </Col>

                    <Col xs={12} className={"pagination-section "+(this.state.paginatedList.length>0?"":"d-none")}>
                        <div className={"btn-group btn-group-sm pagination-main "+(this.props.isRTL==="rtl" ?"float-right":"float-left")}>
                            <span ><Button variant="outline-secondary" size="sm" onClick={() => this.setPage(1)} disabled={(this.state.currentPage === 1 ? true : false)} ><FeatherIcon size={14} icon="chevrons-left"/></Button></span>
                            <span ><Button variant="outline-secondary"  size="sm" onClick={() => this.setPage((this.state.currentPage - 1))} disabled={(this.state.currentPage === 1 ? true : false)}>
                                <span className=''><FeatherIcon size={14} icon="chevron-left"/></span>
                            </Button></span>
                            <Button size="sm" className='total' variant='light' disabled={true}>{this.state.currentPage} / {this.state.totalPages}</Button>
                            <span ><Button variant="outline-secondary"  size="sm" onClick={() => this.setPage((this.state.currentPage + 1))} disabled={(this.state.currentPage === this.state.totalPages ? true : false)} >
                                <span className=''><FeatherIcon size={14} icon="chevron-right"/></span>
                                
                            </Button></span>
                            <span ><Button variant="outline-secondary" size="sm" onClick={() => this.setPage(this.state.totalPages)} disabled={(this.state.currentPage === this.state.totalPages ? true : false)} ><FeatherIcon size={14} icon="chevrons-right"/></Button></span>
                        </div>
                    </Col>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="danger" disabled={(this.state.isSaveLoading===true ? true : false)} onClick={this.props.toggleResponseModal} type="button" style={{borderRadius:"25px"}}>{this.props.t('OKAY_NOTED')}</Button>     
                </Modal.Footer>
            </Modal>
        //     <Modal className='reultsummery-modal-body' size="md"  show={this.props.showresultSummeryModal} onHide={this.props.handleresultSummeryModal} centered> 
            
        //     <Modal.Body>
                
        //         <Col>
        //         {summeryres!==null?summeryres.map((item,i)=><Col key={i} className="bulk-oneitem">
        //                 <Row >
        //                     <Col md={4} classname="title">
        //                        <h4>{item.name}</h4>
        //                     </Col>
        //                     <Col md={5} className="reson">
        //                         <ul style={{color:(item.success?"#198754":"#dc3545 ")}}>
        //                             {item.response?item.response.map((res,r)=><Col key={r}>
        //                                 <li>{res}</li>
        //                             </Col>
        //                             ):<></>}
        //                         </ul>
        //                     </Col>
        //                     <Col md={3}>
        //                   {item.success?<><span className="dot" style={{background:"#198754"}}></span><span style={{color: "#198754"}}>{this.props.t("SUCCESS")}</span></>:
        //                   <><span className="dot" style={{background:"#dc3545 "}}></span><span style={{color: "#dc3545 "}}>{this.props.t("FAIL")}</span></> }
        //                     </Col>
        //                 </Row>
        //             </Col>
        //         ):<></>
        //         }
        //         </Col>
               
        //     </Modal.Body>
        //     <Modal.Footer className='summryresult-modal-footer'>
        //         <Button variant="secondary" onClick={this.props.handleresultSummeryModal}>{this.props.t("OKAY")}</Button>
        //     </Modal.Footer>
        // </Modal>
        );
    }
}


export default  withTranslation()(withRouter(ResultSummery));