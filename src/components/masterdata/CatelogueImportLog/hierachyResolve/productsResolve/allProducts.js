import React, { Component } from 'react';
import { withRouter,  } from 'react-router-dom';
import { withTranslation } from 'react-i18next';
import { Button, Row, Col, Table, Form} from 'react-bootstrap';
import FeatherIcon from 'feather-icons-react';

import { submitCollection } from '../../../../../_services/submit.service';
import { submitSets } from '../../../../UiComponents/SubmitSets';
//import { alertService } from '../../../../../_services/alert.service';

import {  getPager, maxInputLength, } from "../../../../../_services/common.service";
import "./productsResolve.css";

const pageLength = 5;

export class AllProducts extends Component {
    _isMounted = false;
    constructor(props) {
        super(props)
        this.state = {
            oridata:[],
            paginatedList:[],
            currentPage:1,
            totalPages: 0,
            filterText:"",
        }
    }

    componentDidMount(){
        this._isMounted = true;
        if(this._isMounted){
            if(this.props.allProducts){
                this.setState({oridata:this.props.allProducts},()=>{
                    this.setPage(1);
                });
            } 
        }
    }

    componentWillUnmount(){
        this._isMounted = false;
    }

    loadData = () =>{//Not using
        let sobj = { search: "", isReqPagination: false, importHierarchyIssueId: this.props.importHierarchyIssueId }
        submitSets(submitCollection.loadHierachyIssueProducts, sobj, true).then(res => {
            //console.log(res);
            if (res && res.status && res.extra && typeof res.extra !== "string") {
                this.setState({oridata:res.extra},()=>{
                    this.setPage(1);
                });
            }
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

    productSelectChange = (ischecked, pobj) =>{
        let temaddedprods = this.props.temporarySelectedItems;
        if(ischecked===true){
            temaddedprods.push(pobj);
            this.props.settemporarySelectedProducts(temaddedprods);
        }
        else if(ischecked===false){
            let avlindx = temaddedprods.findIndex(x => x.id ===pobj.id);
            if(avlindx>-1){
                temaddedprods.splice(avlindx,1);
                this.props.settemporarySelectedProducts(temaddedprods);
            }
        }
        
    }

    changeSearchFilter = (e) =>{
        let filteredData = [];
        let allprods = this.props.allProducts;
        let text = e.target.value.toLowerCase();
        this.setState({filterText:e.target.value});

        if(text!==""){
            for (let i = 0; i < allprods.length; i++) {
                let barcode = allprods[i].barcode.toLowerCase();
                let name = allprods[i].productName.toLowerCase();
    
                if(barcode.includes(text) || name.includes(text)){
                    filteredData.push(allprods[i]);
                }
            }

        }
        else{
            filteredData = allprods;
        }

        this.setState({oridata:filteredData, paginatedList:(filteredData.length===0?[]:this.state.paginatedList)},()=>{
            this.setPage(1);
        });
    }

    render(){
        return(
           <>
                <Col xs={12} className={"white-container "+(this.props.isRTL==="rtl" ? "RTL":"LTR")} style={{minHeight:"1px",paddingBottom:"35px"}}>
                    <Row>
                        <Col xs={2}></Col>
                        <Col xs={8} className='all-products-section'>
                            <Col>
                                {this.props.allProducts.length > 0?<Row className='table-options'>
                                    <Col xs={6}>
                                        <Form.Check type="checkbox" className={"filter-selectAllProds "+(this.props.isRTL==="rtl" ? "RTL":"LTR")} id="filter-selectAllProds" label={this.props.t("multiselect.all")}
                                            checked={(this.props.selectAllChecked && this.props.temporarySelectedItems.length === this.props.allProducts.length)} onChange={(e)=>this.props.handleSelectAllProduct(e.target.checked)} />
                                            
                                    </Col>
                                    <Col xs={6}>
                                        <input maxLength={maxInputLength} type={"text"} onChange={(e) =>this.changeSearchFilter(e)} value={this.state.filterText} className="form-control find-text" placeholder={this.props.t("searchproduct")}/>
                                    </Col>
                                </Row>:<></>}

                                <Col className='products-list'>
                                    <Table size='small' hover>
                                        <tbody>
                                            {
                                                this.state.paginatedList.map((item,index)=>{
                                                    let avl = false;
                                                    let selectedItems = this.props.temporarySelectedItems;
                                                    let avlindx = selectedItems.findIndex(x => x.id ===item.id);
                                                    avl = (avlindx > -1 ? true : false);

                                                    //onChange={(e)=>this.productSelectChange(e.target.checked, item)}

                                                    return(<React.Fragment key={index}><tr onClick={(e)=>this.productSelectChange(!avl, item)}>
                                                        <td className='checkbox'><input type={"checkbox"} name={"allproditem-"+index} checked={avl} onChange={e => null}  /></td>
                                                        <td className='barcode'>{item.barcode}</td>
                                                        <td className='name'>{item.productName}</td>
                                                    </tr><tr className='empty-row'><td colSpan={3}></td></tr></React.Fragment>);
                                                })
                                            }
                                        </tbody>
                                    </Table>
                                    
                                    {
                                        this.state.oridata.length > 0 && this.props.temporarySelectedItems.length>0 ?
                                            <h6 className='selected-product-count'>{this.props.temporarySelectedItems.length} {this.props.t("SELECTED_PRODUCT_COUNT_TXT")}</h6>
                                        :<></>
                                    }

                                    {
                                        this.state.oridata.length ===0 ?
                                        <h6 className='resolve_no_res_found_txt'>{this.props.t("NO_PRODUCTS_AVAILABLE")}</h6>:<></> 
                                    } 
                                </Col>

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
                                {/* {
                                    this.props.isRTL==="rtl" ?
                                    <div className='pagi-sum float-right'>מציג {this.state.paginatedList.length} מתוך {Math.ceil(this.state.oridata.length)} תוצאות</div>
                                    :
                                    <div className='pagi-sum float-left'>Showing {this.state.paginatedList.length} of {Math.ceil(this.state.oridata.length)} Results</div>

                                } */}

                            </Col>

                            {this.state.paginatedList && this.state.paginatedList.length > 0?
                                <Button onClick={()=>this.props.AddProducts()} className={"products-add-btn "+(this.props.isRTL==="rtl" ?"float-left":"float-right")}>{this.props.t("btnnames.add")}</Button>
                            :<></>}
                            
                        </Col>
                        <Col xs={2}></Col>

                    </Row>
                </Col>

           </>

                
        )
    }

}

export default withTranslation()(withRouter(AllProducts));

