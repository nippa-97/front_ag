import React, { Component } from 'react';
import { withRouter,  } from 'react-router-dom';
import { withTranslation } from 'react-i18next';
import { Button, Row, Col, Table} from 'react-bootstrap';
import FeatherIcon from 'feather-icons-react';

//import { alertService } from '../../../../../_services/alert.service';

import {  getPager, } from "../../../../../_services/common.service";
import "./productsResolve.css";

const pageLength = 5;

export class ResolveProductList extends Component {
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
            if(this.props.subcat){
                let prods = (this.props.subcat[0] ? this.props.subcat[0].issueProducts : []);
                this.setState({oridata:prods},()=>{
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

    changeSearchFilter = (e) =>{
        let filteredData = [];
        let allprods = this.props.products;
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
    
    deleteproduct =(obj, issueIndex, pindex)=>{
        this.props.deleteAddedProduct(obj, issueIndex, pindex);

        // let oridata = this.state.oridata;
        // let avlindex = oridata.findIndex(x => x.id ===obj.id);
        // console.log(oridata);
        // if(avlindex>-1){
        //     oridata.splice(avlindex,1);
        //     this.setState({oridata:oridata, filterText:""},()=>{
        //         this.setPage(1);
        //     });
        // }
    }

    render(){
        
       
        return(
           <>
                <Col xs={12} className={"white-container "+(this.props.isRTL==="rtl" ? "RTL":"LTR")} style={{minHeight:"1px",paddingBottom:"10px",marginBottom:"10px"}}>
                    <Row>
                        <Col xs={2}></Col>
                        <Col xs={8} className='all-products-section'>
                            <Col className='products-list'>
                                {/* <Row>
                                    <Col xs={6}></Col>
                                    <Col xs={6}>
                                        <input type={"text"} onChange={(e) =>this.changeSearchFilter(e)} value={this.state.filterText} className="form-control find-text" placeholder={this.props.t("searchproduct")}/>
                                    </Col>
                                </Row> */}
                                <Table size='small' hover>
                                    <tbody>
                                    {
                                        this.state.paginatedList.map((item,index)=>{
                                            return(<React.Fragment key={index}>
                                                <tr>
                                                    <td className='barcode'>{item.barcode}</td>
                                                    <td className='name'>{item.productName}</td>
                                                    <td className='remove'>
                                                        <Button variant="default" onClick={()=>this.deleteproduct(item, this.props.issueindex, index)} size="sm"><FeatherIcon icon="x" size={12}/></Button>
                                                    </td>
                                                </tr>
                                                <tr className='empty-row'><td colSpan={3}></td></tr>
                                            </React.Fragment>);
                                        })
                                    }
                                    </tbody>
                                </Table>
                                {
                                    this.state.oridata.length ===0 ?
                                    <h6 className='resolve_no_res_found_txt'>{this.props.t("NO_ADDED_PRODUCTS_MSG")}</h6>:<></> 
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
                                {/* {
                                    this.props.isRTL==="rtl" ?
                                    <div className='pagi-sum float-right'>מציג {this.state.paginatedList.length} מתוך {Math.ceil(this.state.oridata.length)} תוצאות</div>
                                    :
                                    <div className='pagi-sum float-left'>Showing {this.state.paginatedList.length} of {Math.ceil(this.state.oridata.length)} Results</div>

                                } */}

                            </Col>
                            
                        </Col>
                        <Col xs={2}></Col>
                    </Row>
                    
                </Col>

           </>

                
        )
    }

}

export default withTranslation()(withRouter(ResolveProductList));

