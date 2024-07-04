import React from 'react';
import { withRouter } from 'react-router-dom';
import { withTranslation } from 'react-i18next';
import { Modal, Row, Col } from 'react-bootstrap';
import { XCircleFillIcon } from '@primer/octicons-react';

import { submitSets } from '../UiComponents/SubmitSets';
import { submitCollection } from '../../_services/submit.service';
import { alertService } from '../../_services/alert.service';

import './imagePreview.css';

export class ImagePreviewComponent extends React.Component{
    _isMounted = false;

    constructor(props){
        super(props);
        this.state = {
            isloaded:false, isImageLoaded:false,
            cobj: {barcode:"",productName:"",brandName:"", imageUrl:""},
        }
    }

    componentDidMount(){
        this._isMounted = true;
        if(this._isMounted){
            if(this.props.loadfromback===true){
                this.loadData(this.props.productid);
            }
            else{
                this.setState({isloaded:true,cobj:{barcode:"",productName:"", imageUrl:this.props.imgurl}});
            }
            
        }
    }

    componentWillUnmount(){
        this._isMounted = false;
    }

    loadData = (id) =>{
        if(id){
            submitSets(submitCollection.findProdImageData, ('?productId='+id), true).then(res => {
                this.setState({isloaded:true});
                if(res && res.status){
                    this.setState({cobj:res.extra});
                } else{
                    alertService.error("Error Occured!");
                    this.props.handlePreviewModal(null,false);
                }
            });
        }
        else{
            this.props.handlePreviewModal(null,false);
        }
    }

    handleImageLoader = (type) =>{
        this.setState({isImageLoaded:type});
    }

    handleImageLoadError = (e) =>{
        this.setState({isImageLoaded:true});
        alertService.error("Could not load the image");
    }

    render(){
        return(
            <>
                <Modal className="img-preview-modal" show={this.props.isshow} dir={this.props.isRTL} onHide={() => this.props.handlePreviewModal(null,false)} animation={false} backdrop="static">
                    <Modal.Body className="text-center">
                        <span onClick={() => this.props.handlePreviewModal(null,false)} style={{position:"absolute",right:"8px",cursor:"pointer"}}><XCircleFillIcon size={20}/></span>
                        {
                            this.state.isloaded === false ?
                            <Col className='loading-anim-div' style={{paddingTop:"16%"}}>
                                <div className="animewrapper animation-2 col-centered">
                                    <div className="shape shape1"></div>
                                    <div className="shape shape2"></div>
                                    <div className="shape shape3"></div>
                                    <div className="shape shape4"></div>
                                </div>
                            </Col>
                            :<></>
                        }

                        <Col className={this.state.isloaded === true ? "" :"d-none"}>
                            <Col className={'data-values ' +(this.props.hideheaderlables===true?"d-none":"")}>
                                <Row>
                                    <Col xs={3} className="label-field">{this.props.t('productname')} </Col>
                                    <Col xs={9} className="value-field">{this.state.cobj.productName}</Col>
                                </Row>
                                <Row>
                                    <Col xs={3} className="label-field">{this.props.t('productbrand')}</Col>
                                    <Col xs={9} className="value-field">{(this.state.cobj.brandName && this.state.cobj.brandName !== ""?this.state.cobj.brandName:this.props.t("notavailable"))}</Col>
                                </Row>
                                <Row>
                                    <Col xs={3} className="label-field">{this.props.t('barcode')}</Col>
                                    <Col xs={9} className="value-field">{this.state.cobj.barcode}</Col>
                                </Row>

                            </Col>

                            {
                                this.state.isImageLoaded === false ?
                                <div className='loading-anim-div' style={{paddingTop:(!this.props.hideheaderlables?"16%":"30%")}}>
                                    <div className="animewrapper animation-2 col-centered">
                                        <div className="shape shape1"></div>
                                        <div className="shape shape2"></div>
                                        <div className="shape shape3"></div>
                                        <div className="shape shape4"></div>
                                    </div>
                                </div>
                                :
                                <></>
                            }

                            <Col style={{marginTop:(this.props.hideheaderlables===true?"40px":"10px")}} className={"img-wrapper "+(this.state.isImageLoaded === true ? "" :"d-none")}>
                                <img 
                                    src={this.state.cobj.imageUrl} 
                                    onLoadStart={()=>this.handleImageLoader(false)}
                                    onLoad={()=>this.handleImageLoader(true)}
                                    onError={(this.state.cobj.imageUrl!=="" ? (e)=>this.handleImageLoadError(e) : undefined)}
                                    className={(this.state.cobj && this.state.cobj.width >= this.state.cobj.height)?"img-resize-ver":"img-resize-hor"} 
                                    style={{height:"15rem"}} 
                                    alt=""/>
                            </Col>
                        </Col> 
                    </Modal.Body>
                </Modal>
            </>
        )
    }

}

export default withTranslation()(withRouter(ImagePreviewComponent));