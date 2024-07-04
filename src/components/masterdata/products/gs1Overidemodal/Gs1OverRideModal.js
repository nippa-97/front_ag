import React, { Component } from 'react'
import { withRouter } from 'react-router-dom';
import { Button, Col, Modal } from 'react-bootstrap'
import { withTranslation } from 'react-i18next'
import './Gs1OverRideModal.css'
import Switch from "react-switch";
import { ArrowRightIcon } from '@primer/octicons-react';
import { submitSets } from '../../../UiComponents/SubmitSets';
import { submitCollection } from '../../../../_services/submit.service';
import { AcViewModal } from '../../../UiComponents/AcImports';
class Gs1OverRideModal extends Component {
    constructor(props) {
        super(props)

        this.state = {
            ProductDetails:null,
            loading:false,
            dataloading:false,
        }
    }
    componentDidMount(){
        this._isMounted = true;

        if(this._isMounted){
            // this.loaddata()
        }
    }
    componentWillUnmount(){
        this._isMounted = false;
    }
    loaddata=()=>{
        this.setState({loading:true,});
        submitSets(submitCollection.getOverrideGs1ProductInfo, ('?productId='+this.props.productId), true).then(res => {
            this.setState({loading:false,dataloading:true});
            if(res && res.status){
                this.setState({ProductDetails:res.extra});
            }
        });
    }
    checkisAllDimensionDisable=()=>{
        var bool= false
        var ProductDetails=this.props.ProductDetails
        var widthequal=((ProductDetails.dimensions.width.currentObj.dimension=== ProductDetails.dimensions.width.newObj.dimension))&&((ProductDetails.dimensions.width.currentObj.uom=== ProductDetails.dimensions.width.newObj.uom))
        var heightequal=((ProductDetails.dimensions.height.currentObj.dimension=== ProductDetails.dimensions.height.newObj.dimension))&&((ProductDetails.dimensions.height.currentObj.uom=== ProductDetails.dimensions.height.newObj.uom))
        var depthequal=((ProductDetails.dimensions.depth.currentObj.dimension=== ProductDetails.dimensions.depth.newObj.dimension))&&((ProductDetails.dimensions.depth.currentObj.uom=== ProductDetails.dimensions.depth.newObj.uom))
        bool=(widthequal&&heightequal&&depthequal)
        return bool
    }
    isUpdateEnable=()=>{
        var allow=true
        var ProductDetails=this.props.ProductDetails
        if(ProductDetails.product.isUpdate||ProductDetails.image.isUpdate||ProductDetails.brand.isUpdate||
            ProductDetails.dimensions.depth.isUpdate||ProductDetails.dimensions.height.isUpdate||ProductDetails.dimensions.width.isUpdate){
                allow=false
            }
        return allow
    }
    render() {
        var {ProductDetails,isdimensionAll,isupdateAll}=this.props
        var isNameCardDisable=(ProductDetails.product.currentName===ProductDetails.product.newName)?true:false
        var isAllDimensionDisable=this.checkisAllDimensionDisable()
        var isWidthDisable=((ProductDetails.dimensions.width.currentObj.dimension=== ProductDetails.dimensions.width.newObj.dimension))&&((ProductDetails.dimensions.width.currentObj.uom=== ProductDetails.dimensions.width.newObj.uom))
        var isHeightDisable=((ProductDetails.dimensions.height.currentObj.dimension=== ProductDetails.dimensions.height.newObj.dimension))&&((ProductDetails.dimensions.height.currentObj.uom=== ProductDetails.dimensions.height.newObj.uom))
        var isDepthDisable=((ProductDetails.dimensions.depth.currentObj.dimension=== ProductDetails.dimensions.depth.newObj.dimension))&&((ProductDetails.dimensions.depth.currentObj.uom=== ProductDetails.dimensions.depth.newObj.uom))
        return (
            <Modal className="Gs1OverideModal" backdrop="static"  dir={this.props.isRTL}  show={this.props.isShow} onHide={()=>this.props.handleShow(false)}>
                <Modal.Header closeButton>
                <Modal.Title>{this.props.t("GS1_Override")}
                </Modal.Title>
                </Modal.Header>
                {(ProductDetails!==null)?<Modal.Body>
                    <Col className='namebarcodediv'>
                        <label>{this.props.barcode}</label><label>{this.props.productName}</label>
                    </Col>
                    <div className='allmarkupdate'>
                        <label>{this.props.t("UPDATE_ALL")}</label><span >
                            <Switch onColor="#52299C" className={'toggle-switch'+(isupdateAll?" checked":"")} height={18} width={36} checked={isupdateAll} onChange={()=>this.props.handleChangeAllUpdate(!isupdateAll,)}   />
                            </span>
                    </div>
                    <Col className={'card '+(isAllDimensionDisable?"disable":"")} >
                        <Col className='title '>
                            <div  className='name'> {this.props.t("DIMENSION")}</div>
                            <div >
                                <label>{this.props.t("UPDATE_ALL_DIMENSION")}</label><span >
                                    <Switch disabled={isAllDimensionDisable} onColor="#52299C" className={'toggle-switch'+(isdimensionAll?" checked":"")} height={18} width={36} checked={isdimensionAll} onChange={()=>this.props.handleChangeAlldimention(!isdimensionAll,"dimensions")}   />
                                    </span>
                            </div>
                        </Col>
                        <Col className='dimension-t-details'>
                            <div style={{width:"360px"}}>{this.props.t("type")}</div>
                            <div >{this.props.t("Current")}</div>
                            <div ></div>
                            <div >{this.props.t("NEW")}</div>
                            <div ></div>
                        </Col>
                        <Col className={'dimension-t-details detail '+(isWidthDisable?"disable":"")}>
                            <div style={{width:"360px"}}>{this.props.t("width")}</div>
                            <div >{ProductDetails.dimensions.width.currentObj.dimension} {ProductDetails.dimensions.width.currentObj.uom}</div>
                            <div style={{textAlign:"center",color:"#52299C"}}><ArrowRightIcon size={16} /></div>
                            <div >{ProductDetails.dimensions.width.newObj.dimension} {ProductDetails.dimensions.width.newObj.uom}</div>
                            <div >
                            <span><Switch disabled={isWidthDisable} onColor="#52299C" className={'toggle-switch'+(ProductDetails.dimensions.width.isUpdate?" checked":"")} height={18} width={36} checked={ProductDetails.dimensions.width.isUpdate} onChange={()=>this.props.handleChangeProdAttr(!ProductDetails.dimensions.width.isUpdate,"dimensions","width")} /></span>
                            </div>
                        </Col>
                        <Col className={'dimension-t-details detail '+(isHeightDisable?"disable":"")}>
                            <div style={{width:"360px"}}>{this.props.t("height")}</div>
                            <div >{ProductDetails.dimensions.height.currentObj.dimension} {ProductDetails.dimensions.height.currentObj.uom}</div>
                            <div style={{textAlign:"center",color:"#52299C"}}><ArrowRightIcon size={16} /></div>
                            <div >{ProductDetails.dimensions.height.newObj.dimension} {ProductDetails.dimensions.height.newObj.uom}</div>
                            <div >
                            <span><Switch disabled={isHeightDisable} onColor="#52299C" className={'toggle-switch'+(ProductDetails.dimensions.height.isUpdate?" checked":"")} height={18} width={36} checked={ProductDetails.dimensions.height.isUpdate} onChange={()=>this.props.handleChangeProdAttr(!ProductDetails.dimensions.height.isUpdate,"dimensions","height")}  /></span>
                            </div>
                        </Col>
                        <Col className={'dimension-t-details detail '+(isDepthDisable?"disable":"")}>
                            <div style={{width:"360px"}}>{this.props.t("depth")}</div>
                            <div >{ProductDetails.dimensions.depth.currentObj.dimension} {ProductDetails.dimensions.depth.currentObj.uom}</div>
                            <div style={{textAlign:"center",color:"#52299C"}}><ArrowRightIcon size={16} /></div>
                            <div >{ProductDetails.dimensions.depth.newObj.dimension} {ProductDetails.dimensions.depth.newObj.uom}</div>
                            <div >
                            <span><Switch disabled={isDepthDisable} onColor="#52299C" className={'toggle-switch'+(ProductDetails.dimensions.depth.isUpdate?" checked":"")} height={18} width={36}  checked={ProductDetails.dimensions.depth.isUpdate} onChange={()=>this.props.handleChangeProdAttr(!ProductDetails.dimensions.depth.isUpdate,"dimensions","depth")} /></span>
                            </div>
                        </Col>
                       
                    </Col>
                    <Col className='card' >
                        <Col className='title'>
                            <span  className='name'> {this.props.t("IMAGE")}</span>
                            <span >
                                <label>{this.props.t("btnnames.update")}</label><span ><Switch onColor="#52299C" className={'toggle-switch'+(ProductDetails.image.isUpdate?" checked":"")} height={18} width={36} checked={ProductDetails.image.isUpdate} onChange={()=>this.props.handleChangeProdAttr(!ProductDetails.image.isUpdate,"image")}  /></span>
                            </span>
                        </Col>
                        <Col className='card-details'>
                            <div>{this.props.t("Current")}</div>
                            <div className='middle'></div>
                            <div>{this.props.t("NEW")}</div>
                        </Col>
                        <Col className='card-details'>
                            <div className='drawedbox'>{ProductDetails.image.currentImg?this.props.t("Image_Available"):this.props.t("No_Image_Available")}</div>
                            <div className='middle'><ArrowRightIcon size={22} /></div>
                            <div className='drawedbox'>{ProductDetails.image.newImg?this.props.t("New_Image_Available"):this.props.t("No_Image_Available")}</div>
                        </Col>
                    </Col>
                    <Col className={'card'} style={{display:(ProductDetails.brand.currentName===null?"block":"none")}} >
                        <Col className='title'>
                            <span  className='name'> {this.props.t("brand")}</span>
                            <span >
                                <label>{this.props.t("btnnames.update")}</label><span ><Switch disabled={ProductDetails.brand.currentName===null?false:true} onColor="#52299C" className={'toggle-switch'+(ProductDetails.brand.isUpdate?" checked":"")} height={18} width={36}  checked={ProductDetails.brand.isUpdate} onChange={()=>this.props.handleChangeProdAttr(!ProductDetails.brand.isUpdate,"brand")} /></span>
                            </span>
                        </Col>
                        <Col className='card-details'>
                            <div>{this.props.t("Current")}</div>
                            <div className='middle'></div>
                            <div>{this.props.t("NEW")}</div>
                        </Col>
                        <Col className='card-details'>
                            <div className='drawedbox'>{ProductDetails.brand.currentName!==null?ProductDetails.brand.currentName:"N/A"}</div>
                            <div className='middle'><ArrowRightIcon size={22} /></div>
                            <div className='drawedbox'>{ProductDetails.brand.newName!==null?ProductDetails.brand.newName:"N/A"}</div>
                        </Col>
                    </Col>
                    <Col className={'card '+(isNameCardDisable?"disable":"")} >
                        <Col className='title'>
                            <span  className='name'> {this.props.t("productname")}</span>
                            <span >
                                <label>{this.props.t("btnnames.update")}</label><span ><Switch disabled={isNameCardDisable} onColor="#52299C" className={'toggle-switch'+(ProductDetails.product.isUpdate?" checked":"")} height={18} width={36} checked={ProductDetails.product.isUpdate} onChange={()=>this.props.handleChangeProdAttr(!ProductDetails.product.isUpdate,"product")} /></span>
                            </span>
                        </Col>
                        <Col className='card-details'>
                            <div>{this.props.t("Current")}</div>
                            <div className='middle'></div>
                            <div>{this.props.t("NEW")}</div>
                        </Col>
                        <Col className='card-details'>
                            <div className='drawedbox'>{ProductDetails.product.currentName!==null?ProductDetails.product.currentName:"N/A"}</div>
                            <div className='middle'><ArrowRightIcon size={22} /></div>
                            <div className='drawedbox'>{ProductDetails.product.newName!==null?ProductDetails.product.newName:"N/A"}</div>
                        </Col>
                    </Col>
                </Modal.Body>:<></>}
                <Modal.Footer>
                    <Button onClick={()=>this.props.handleShow(false)} >{this.props.t("btnnames.close")}</Button>
                    <Button className='success' disabled={this.isUpdateEnable()} onClick={()=>this.props.clickUpdateGsiOveride()}>{this.props.t("btnnames.update")}</Button>
                </Modal.Footer>
                <AcViewModal showmodal={this.state.loading} />
            </Modal>
        )
    }
}


export default withTranslation()(withRouter(Gs1OverRideModal));