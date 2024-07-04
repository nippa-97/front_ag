import React from "react";
import { Col, Table, Form, Button, Row, OverlayTrigger,Tooltip } from 'react-bootstrap';
import { XIcon } from '@primer/octicons-react';
import Select from 'react-select';

import { COMPLIANCE_CHANGE_TYPE } from "../../../../enums/manualComplanceEnums";
// import ProductAsyncPaginate from "./asyncloadings/asyncpaginate";
import RemoveMCCard from "./removeMCCard/RemoveMCCard";

export default class ComplansChangestable extends React.Component{
    constructor(props) {
        super(props);
        this.state = {
            uploadFileList: [],
        }
    }

    componentDidMount() {
        this._isMounted = true;

        if (this._isMounted) {

        }
    }

    componentWillUnmount() {
        this._isMounted = false;
    }

    handleDropImages = (xfiles) => {
        var cfileslist = this.state.uploadFileList;
        var nfileslist = cfileslist.concat(xfiles);
        this.setState({ uploadFileList: nfileslist });
    }

    handleRemoveAddedImage = (xidx) => {
        var cfileslist = this.state.uploadFileList;
        cfileslist.splice(xidx,1);
        this.setState({ uploadFileList: cfileslist });
    }
    selectChangesType=(imgd,type)=>{
        var allow=false
        if(imgd.changeType){
            var valid=imgd.changeType.find(x=>x.changeType===type)
            if(valid){allow=true}
        }
      
        return allow
    }
    //check if allow product selection only have add in changes
    checkDisplayProduct=(changes)=>{
        var allow=false
        if(changes.length>0){
            var have=changes.find(x=>x.changeType===COMPLIANCE_CHANGE_TYPE.Add);
            if(have){
                allow=true
            }
        }
        return allow
    }
    //check if allow remove product selection only have add in changes
    checkDisplayRemoveProduct=(changes)=>{
        var allow=false
        if(changes.length>0){
            var have=changes.find(x=>x.changeType===COMPLIANCE_CHANGE_TYPE.Remove);
            if(have){
                allow=true
            }
        }
        return allow
    }
    //showing adding products
    showAddproductcard=(img,type)=>{
        var array=[]
        if(img.length>0){
            var have=undefined
            if(type==="add"){
                 have=img.find(x=>x.changeType===COMPLIANCE_CHANGE_TYPE.Add);
            }
            if(type==="remove"){
                have=img.find(x=>x.changeType===COMPLIANCE_CHANGE_TYPE.Remove);
           }

       
        if(have){
            array=have.products?have.products:[]}
        }
      
        return array
    }
    //product name shor display
    displayProductName=(cname)=>{
        var str = cname;
        if(str.length > 20) {str = str.substring(0,20)+"..."};
        return str
    }
    
    render() {
        return (<>
        <Col className="imagepreview-main">
            <Col className="excelpreview-main">
                <ul className="list-inline">
                    {this.state.uploadFileList && this.state.uploadFileList.map((xitem, x) => {
                        return <li key={x} className="list-inline-item"><div title={xitem.name}>
                            <span className="float-right" onClick={() => this.handleRemoveAddedImage(x)}><XIcon size={12} /></span>
                            <img src={xitem.preview} className="img-fluid" alt="preview thumb" /></div></li>;
                    })}
                </ul>
            </Col>

            <Table bordered striped   className="MCTable products-list-table" >
                <thead>
                    <tr>
                        <th width="5%">{this.props.t("NUMBER")}</th><th width="28%">{this.props.t("rectchanges")}</th>
                        <th width="40%">{this.props.t("product")}</th>
                        <th width="27%">{this.props.t("DESCRIPTION")}</th>
                        <th width="5%"></th>
                    </tr>
                </thead>
                <tbody>
                    {this.props.selectedAiImg&&this.props.selectedAiImg.changes.map((imgd,i)=>
                    <tr key={i}>
                        <td style={{textAlign:"center"}}> <span className="No">{imgd.changeNo}</span></td>
                        <td style={{pointerEvents:(this.props.isEdit?"none":"auto")}}>
                            <div className="changes">
                                {Object.keys(COMPLIANCE_CHANGE_TYPE).map(x => {
                                    return <Button className={COMPLIANCE_CHANGE_TYPE[x]} onClick={()=>this.props.handleChanges(imgd,COMPLIANCE_CHANGE_TYPE[x],i)} key={x} value={COMPLIANCE_CHANGE_TYPE[x]} active={this.selectChangesType(imgd,COMPLIANCE_CHANGE_TYPE[x])}>{COMPLIANCE_CHANGE_TYPE[x]}</Button>
                                })} 
                            </div> 
                        </td>
                        <td>
                        {this.checkDisplayProduct(imgd.changeType)?<Col className="addingproducts">
                            <Row className="product_type_title">
                                <Col md={2}> <h6>{this.props.t("ADD")}</h6></Col>
                                {!this.props.isEdit&&<Col md={10} className="productclass">
                                    <Select value="" placeholder={this.props.t('select')} className="filter-searchselect" classNamePrefix="searchselect-inner" onChange={(e)=>this.props.handleProductChange(imgd,e,i)}  options={this.props.addingProductList}  getOptionLabel ={(option)=>option.value}
                                        getOptionValue ={(option)=>option.barcode} autosize={false} /> 
                                </Col>}
                            </Row>
                            <Col className="allimgs aiaddingresults">
                                <Row>
                                    { this.showAddproductcard(imgd.changeType,"add").length>0?this.showAddproductcard(imgd.changeType,"add").map((item,x)=>
                                    <Col key={x} md={6}>
                                        <Col className="columnimg" >
                                            <Col className="productName-col"><OverlayTrigger overlay={<Tooltip id="tooltip-manualcomplance">{item.productName}</Tooltip>}><div>
                                                <div className="name">{this.displayProductName(item.productName)}</div>
                                                <div className="barcode">{item.barcode}</div>
                                                </div></OverlayTrigger> 
                                            </Col>
                                            {!this.props.isEdit?<span className="closebtn" onClick={()=>this.props.removeProductsChanges(imgd.changeNo,item,"add",i)}><XIcon size={18}  /></span>:<></>}
                                        </Col>
                                    </Col>):<></>}                          
                                </Row>
                            </Col>
                        </Col>:<></>}
                        {this.checkDisplayRemoveProduct(imgd.changeType)?
                        // <Col className="addingproducts">
                        //     <Row className="product_type_title remove">
                        //         <Col md={2}> 
                        //             <h6>{this.props.t("REMOVE")}</h6>
                        //         </Col>
                        //         {!this.props.isEdit&&<Col md={10} className="productclass">
                        //             <Select value="" 
                        //                 placeholder={this.props.t('select')} 
                        //                 lassName="filter-searchselect" 
                        //                 classNamePrefix="searchselect-inner" 
                        //                 onChange={(e)=>this.props.handleRemoveProductChange(imgd,e,i)}  
                        //                 options={this.props.productList} getOptionLabel ={(option)=>option.value} 
                        //                 getOptionValue ={(option)=>option.barcode} autosize={false} 
                        //                 onKeyDown={(e)=>this.props.handleremovesearch(e)}
                        //                 isLoading ={this.props.isLoadingremovesearch}
                        //                 />
                        //         </Col>}
                        //     </Row>
                        //     <Col className="allimgs">
                        //         <Row>
                        //             {this.showAddproductcard(imgd.changeType,"remove").length>0?this.showAddproductcard(imgd.changeType,"remove").map((item,x)=>
                        //             <Col key={x} md={6}>
                        //                 <Col className="columnimg" > 
                        //                     <Col className="productName-col">
                        //                         <OverlayTrigger  overlay={<Tooltip id="tooltip-manualcomplance">{item.productName}</Tooltip>}>
                        //                             <div>
                        //                                 <div className="name">{this.displayProductName(item.productName)}</div>
                        //                                 <div className="barcode">{item.barcode}</div>
                        //                             </div>
                        //                         </OverlayTrigger> 
                        //                     </Col>
                        //                     {!this.props.isEdit?<span className="closebtn" onClick={()=>this.props.removeProductsChanges(imgd.changeNo,item,"remove",i)}><XIcon size={18}  /></span>:<></>}
                        //                 </Col>
                        //             </Col>):<></>}                          
                        //         </Row>
                        //     </Col>
                        // </Col>
                        <RemoveMCCard isEdit={this.props.isEdit} imgd={imgd} i={i} chainDetails={this.props.chainDetails} showAddproductcard={this.showAddproductcard} removeProductsChanges={this.props.removeProductsChanges}
                         handleRemoveProductChange={this.props.handleRemoveProductChange} displayProductName ={this.displayProductName } />
                        :<></>
                        }
                        </td>
                        <td>
                            {!this.props.isEdit? <Form.Control as="textarea" disabled={this.props.isEdit} rows={2}  value={imgd.changeDesc} onChange={(e)=>this.props.handleDescription(imgd,e,i)} />:<span style={{textTransform:"capitalize"}}>{imgd.changeDesc}</span>}
                        </td>
                        <td style={{width:"6px",pointerEvents:(this.props.isEdit?"none":"auto")}}>
                            {!this.props.isEdit?<span className="closebtn" onClick={(e)=>this.props.deleteChange(imgd,e,i)}><XIcon size={18}  /></span>:<></>}
                        </td>
                    </tr>
                )}</tbody>
            </Table>

        </Col></>);    
    }
}
