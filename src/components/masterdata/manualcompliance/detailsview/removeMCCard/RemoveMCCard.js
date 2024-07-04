import { XIcon } from '@primer/octicons-react';
import React, { Component } from 'react'
import { Col, OverlayTrigger, Row, Tooltip } from 'react-bootstrap';
import { withTranslation } from 'react-i18next'
import { withRouter } from 'react-router-dom';
import Select from 'react-select';
import { alertService } from '../../../../../_services/alert.service';
import { submitCollection } from '../../../../../_services/submit.service';
import { submitSets } from '../../../../UiComponents/SubmitSets';

class RemoveMCCard extends Component {
    constructor(props) {
        super(props)

        this.state = {
            removesearchtText:"",
            isLoadingremovesearch:true,
            productList:[],
            getProdctcallsending:false,
            //pagination
            QstartIndex:0,
            QmaxResult:8,

        }
    }
    componentDidMount() {
        this._isMounted = true;

        if (this._isMounted) {
            this.getproductList();
        }
    }

    componentWillUnmount() {
        this._isMounted = false;
    }
    //load removing products
    getproductList=(type)=>{
        this.setState({getProdctcallsending:true,
            QstartIndex:(type==="onscroll")?this.state.QstartIndex:0
        },()=>{
            let psobj = { 
                chainId: this.props.chainDetails?this.props.chainDetails.chainId:-1,
                search: this.state.removesearchtText, 
                isReqPagination: true, 
                startIndex: this.state.QstartIndex,
                maxResult: this.state.QmaxResult, isReqCount: false,
            };
            submitSets(submitCollection.getSearchableProducts, psobj, true).then(res => {
                if(res && res.status ){
                    
                    var options = (type==="onscroll")?this.state.productList:[]
                    var prodlist = res.extra.length>0?res.extra:[];
                    for (let i = 0; i < prodlist.length; i++) {
                        const subele = prodlist[i];
                        options.push({ value: subele.productName, barcode:subele.barcode, label: subele.productName, id:subele.id });
                    }
                    this.setState({ productList:options,isLoadingremovesearch:false,getProdctcallsending:false });
                }else{
                    alertService.error(this.props.t('ERROR_OCCURRED'))
                    this.setState({ isLoadingremovesearch:false });
                }
            })

        })
        
    }
    handleremovesearch=(e)=>{
        this.setState({productList:[]},()=>{
            if(this.bctimeout){clearTimeout(this.bctimeout);} //clear timeout setted before

            this.bctimeout = setTimeout(() => {
                this.setState({removesearchtText:e.target.value,isLoadingremovesearch:true},()=>{
                    this.getproductList();
                })
            }, 700);

        })
       
        
        
    }
    scorll=()=>{
        if (!this.state.loadquestionnaire) {
             
            var startindex = this.state.QstartIndex + this.state.QmaxResult
            this.setState({ QstartIndex: startindex,isLoadingremovesearch:true }, () => {
                this.getproductList("onscroll")
            })
        }
        
    }
    
    render() {
        return (
            <Col className="addingproducts">
                <Row className="product_type_title remove">
                    <Col md={2}> 
                        <h6>{this.props.t("REMOVE")}</h6>
                    </Col>
                    {!this.props.isEdit&&<Col md={10} className="productclass">
                        <Select value="" 
                            placeholder={this.props.t('select')} 
                            className="filter-searchselect" 
                            classNamePrefix="searchselect-inner" 
                            onChange={(e)=>this.props.handleRemoveProductChange(this.props.imgd,e,this.props.i)}  
                            options={this.state.productList} getOptionLabel ={(option)=>option.value} 
                            getOptionValue ={(option)=>option.barcode} autosize={false} 
                            onKeyDown={(e)=>this.handleremovesearch(e)}
                            isLoading ={this.state.isLoadingremovesearch}
                            onMenuScrollToBottom={()=>this.scorll()}
                            // onMenuClose={()=>this.handleonMenuClose()}
                            />

                            {/* <ProductAsyncPaginate t={this.props.t}
                                imgd={imgd} i={i}
                                handleRemoveProductChange={this.props.handleRemoveProductChange}
                                chainDetails={this.props.chainDetails} 
                                /> */}
                    </Col>}
                </Row>
                <Col className="allimgs">
                    <Row>
                        {this.props.showAddproductcard(this.props.imgd.changeType,"remove").length>0?this.props.showAddproductcard(this.props.imgd.changeType,"remove").map((item,x)=>
                        <Col key={x} md={6}>
                            <Col className="columnimg" > 
                                <Col className="productName-col">
                                    <OverlayTrigger  overlay={<Tooltip id="tooltip-manualcomplance">{item.productName}</Tooltip>}>
                                        <div>
                                            <div className="name">{this.props.displayProductName(item.productName)}</div>
                                            <div className="barcode">{item.barcode}</div>
                                        </div>
                                    </OverlayTrigger> 
                                </Col>
                                {!this.props.isEdit?<span className="closebtn" onClick={()=>this.props.removeProductsChanges(this.props.imgd.changeNo,item,"remove",this.props.i)}><XIcon size={18}  /></span>:<></>}
                            </Col>
                        </Col>):<></>}                          
                    </Row>
                </Col>
            </Col>
        )
    }
}
export default withTranslation()(withRouter(RemoveMCCard));
