import React, { Component, } from 'react'
import { Link, withRouter } from 'react-router-dom';
import { Col, Breadcrumb, Row, Form, Button, Modal, FormSelect } from 'react-bootstrap'
import ReactCrop from 'react-image-crop';
import axios from 'axios';
import { connect } from "react-redux";
import { withTranslation } from 'react-i18next';
import { confirmAlert } from 'react-confirm-alert';


import { setFloorPrevDetails } from '../../../../actions/floors/floor_action';

import { floorAspectRatioDrawBox, restrictDecimalPoint, preventinputotherthannumbers, preventinputToString} from '../../../../_services/common.service';
import { submitCollection } from '../../../../_services/submit.service';
import { alertService } from '../../../../_services/alert.service';
import { uomList } from '../../../../_services/common.service';
import { submitSets } from '../../../UiComponents/SubmitSets';
import { AcViewModal } from '../../../UiComponents/AcImports';

import MDSidebarMenu from '../../../common_layouts/mdsidebarmenu';

import 'react-image-crop/dist/ReactCrop.css';
import './Floordetails.scss';

export class FloorDetails extends Component {
  _isMounted = false;
  constructor(props) {
    super(props);
    this.displaydiv = React.createRef();
    this.svgfile = React.createRef();
    this.state = {
      sobj: this.defaultObjectLoad(), savemodalshow: false,
      viewHeight: 0, viewWidth: 0,
      isedit: false, toUploadImages: null,

      displayWidth: 0,
      displayHeight: 0,
      src: null,
      crop: {
        unit: '%',
        width: 90,
        height: 90,
        x: 5,
        y: 5,
        aspect: "",
        },
      show: false,

      prevpagedetails: null,
      errors:{},
      isUpdated: false,
    }
  }

  componentDidMount() {
    this._isMounted = true;

    if(this._isMounted){
      var cisedit = (this.props.floorState && this.props.floorState.floorDetails ? true : false);
      let prepagedetails = (this.props.floorState && this.props.floorState.floorPrevDetails?this.props.floorState.floorPrevDetails:null);
      //console.log(this.props);

        this.setState({
          divWidth: (this.displaydiv.current?this.displaydiv.current.offsetWidth:0),
          divHeight: (this.displaydiv.current?this.displaydiv.current.offsetHeight:0),
          isedit: cisedit,
          sobj: (cisedit ? this.props.floorState.floorDetails : this.defaultObjectLoad()),
          prevpagedetails: prepagedetails,
        }, () => {
          this.drawFloorplanBox();
          if(this.state.sobj.imageId){
              this.getUploadImage(this.state.sobj.imageId);
          }
      });
    }
  };

  componentWillUnmount(){
    this._isMounted = false;
  }

  defaultObjectLoad = () => {
    return { name: "", flowWidth: 0, flowHeight: 0, uom: "", imagePath: "", remark: "", svg: "", x: 0, y: 0, imageWidth: 0, imageHeight: 0, imageX: 0, imageY: 0 };
  }

  showModal = () => {
    this.setState({ show: true });
  };

  hideModal = () => {
    this.setState({ show: false, isUpdated: true});
  };

  drawFloorplanBox() {
    if (this.state.sobj && Object.keys(this.state.sobj).length > 0) {
      var dimention = floorAspectRatioDrawBox(this.state.sobj.flowWidth,this.state.sobj.flowHeight, this.state.divWidth, this.state.divHeight);
      this.setState({ viewHeight: dimention.dheight, viewWidth: dimention.dwidth });
    }
  }

  onSelectFile = e => {
    if (e.target.files && e.target.files.length > 0) {
      const reader = new FileReader();
      reader.addEventListener('load', () => {
        this.setState({
          src: reader.result ,
          crop: { unit: '%', width: 90, height: 90, x: 5, y: 5, aspect: "" },
        })
      });
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  // If you setState the crop in here you should return false.
  onImageLoaded = image => {
    this.imageRef = image;
  };

  onCropComplete = crop => {
    this.makeClientCrop(crop);
  };

  onCropChange = (crop, percentCrop) => {
    // You could also use percentCrop:
    // this.setState({ crop: percentCrop });
    this.setState({ crop });
  };

  async makeClientCrop(crop) {
    if (this.imageRef && crop.width && crop.height) {
      //console.log(this.imageRef);
      const croppedImageUrl = await this.getCroppedImg(
        this.imageRef,
        crop,
        'newFile.jpeg'
      );
      //console.log(croppedImageUrl);
      this.setState({ croppedImageUrl });
    }
  }

  dataURItoBlob = (dataURI) => {
    // convert base64/URLEncoded data component to raw binary data held in a string
    var byteString;
    if (dataURI.split(',')[0].indexOf('base64') >= 0)
        byteString = atob(dataURI.split(',')[1]);
    else
        byteString = unescape(dataURI.split(',')[1]);
    // separate out the mime component
    var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];
    // write the bytes of the string to a typed array
    var ia = new Uint8Array(byteString.length);
    for (var i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
    }
    return new Blob([ia], {type:mimeString});
  }


  getCroppedImg(image, crop, fileName) {
    
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;

    const canvas = document.createElement('canvas');
    canvas.width = Math.ceil(crop.width*scaleX);
    canvas.height = Math.ceil(crop.height*scaleY);

    const ctx = canvas.getContext('2d');
    ctx.drawImage(
      image,
      crop.x * scaleX,
      crop.y * scaleY,
      crop.width * scaleX,
      crop.height * scaleY,
      0,
      0,
      crop.width*scaleX,
      crop.height*scaleY,
    );

    // Convert canvas image to Base64
    var img = canvas.toDataURL('image/jpeg');
    // Convert Base64 image to binary
    var convfile = this.dataURItoBlob(img);
    var cfileArr = [convfile];
    this.setState({ toUploadImages: cfileArr });

    return new Promise((resolve, reject) => {
      canvas.toBlob(blob => {
        if (!blob) {
          //reject(new Error('Canvas is empty'));
          //console.error('Canvas is empty');
          return;
        }
        blob.name = fileName;

        window.URL.revokeObjectURL(this.fileUrl);
        this.fileUrl = window.URL.createObjectURL(blob);

        resolve(this.fileUrl);

      }, 'image/jpeg');
    });
  }
  //
  handlevchange = (evt, etype,msg) => {    
    var cobj = this.state.sobj;

    if(etype === "name"){
      if(!preventinputToString(evt,evt.target.value,msg)){
        evt.preventDefault()
        return
      }
    }
    if(etype === "flowWidth" || etype === "flowHeight"){
      let decimalLimitCheck = restrictDecimalPoint(evt.target.value,3);
    
      if(!preventinputotherthannumbers(evt,evt.target.value,msg)){
        evt.preventDefault()
        return
      }
      if(decimalLimitCheck){
          evt.preventDefault()
          return
      }
      cobj[etype] =  evt.target.value ;
    } else{
      cobj[etype] = evt.target.value;
    }

    this.setState({sobj: cobj, isUpdated: true}, () => {
      if(etype === "flowWidth" || etype === "flowHeight"){
        this.drawFloorplanBox();
      }
    });
  }

  handleGetUploadImage = (type) => {

      if(type === 2){
        if(!this.state.isUpdated){
            alertService.warn(this.props.t('NO_CHANGES_AVAILABLE'));
            return false;
        }
      }

      var crespname = (this.state.toUploadImages&&this.state.toUploadImages.length>0&&this.state.toUploadImages[0].name?this.state.toUploadImages[0].name:"floorImage.jpg");
      var imgObj = {};
      imgObj.imageName = crespname;
      if(type !== 3 && this.state.toUploadImages){
          //validate save object
          if(!this.state.sobj.name || this.state.sobj.name === ""){
            alertService.error(this.props.t('FLOOR_NAME_REQUIRED'));
            return false;
          }
          if(!this.state.sobj.flowWidth || this.state.sobj.flowWidth === 0 || this.state.sobj.flowWidth === ""){
            alertService.error(this.props.t('FLOOR_WIDTH_REQUIRED'));
            return false;
          }
          if(!this.state.sobj.flowHeight || this.state.sobj.flowHeight === 0 || this.state.sobj.flowHeight === ""){
            alertService.error(this.props.t('FLOOR_HEIGHT_REQUIRED'));
            return false;
          }
          if(!this.state.sobj.uom || this.state.sobj.uom === ""){
            alertService.error(this.props.t('UNIT_OF_MESSURE_REQUIRED'));
            return false;
          }

          this.setState({savemodalshow: true});
          submitSets(submitCollection.getImagePutURL, imgObj, true).then(res => {
              if(res && res.status){
                  this.handleUploadImage(this.state.toUploadImages[0],res.extra,type);
              } else{
                  if(type){ this.handleFieldSave(type); }
              }
          });
      } else{
        // console.log("delete");
          //   if(type){ this.handleFieldSave(type); }
          if(type===3){
            confirmAlert({
              title: this.props.t('CONFIRM_TO_DELETE_FLOOR'),
              message: this.props.t('CONFIRM_TO_DELETE_FLOOR_MSG'),
              overlayClassName: (this.props.isRTL==="rtl"?"alertrtl-content":""),
              buttons: [{
                  label: this.props.t("btnnames.yes"),
                  onClick: () => {
                    this.handleFieldSave(type)
                  }
              }, {
                  label: this.props.t("btnnames.no"),
                  onClick: () => {
                      return false;
                  }
              }]
          });
          }
          else{ this.handleFieldSave(type); }

      }
  }

  handleUploadImage = (imgobj, urlobj, type) => {
      try {
          const coheaders = {"Content-Type": 'image/*'};
          axios({url: urlobj.url,method: "PUT",data: imgobj,headers:coheaders}).then((res) => {
              if(res.status === 200){
                  var csobj = this.state.sobj;
                  csobj["imageId"] = urlobj.id;
                  this.setState({
                      sobj: csobj
                  });
                  if(type){ this.handleFieldSave(type); }
              } else{
                  if(type){ this.handleFieldSave(type); }
              }
          });
      } catch (error) {
          if(type){ this.handleFieldSave(type); }
      }
  }

  getUploadImage = (imgId) => {
      var imgObj = {};
      imgObj.id = imgId;

      submitSets(submitCollection.getImageGETURL, imgObj, true).then(res => {
          //console.log(res);
          if(res && res.status && res.extra){
              this.setState({
                  croppedImageUrl: res.extra.url
              });
          }
      });
  }

  handleFieldSave = (type) => {
    var newobj = this.state.sobj;
    newobj["svg"] = this.svgfile.current.outerHTML;

    this.setState({ sobj: newobj });
    //console.log(this.state.sobj);

    if(this.state.sobj){
      var csobj= this.state.sobj;
      if(this.state.sobj.name === ""){
        alertService.error(this.props.t('FLOOR_NAME_REQUIRED'));
        return false;
      }
      if(this.state.sobj.flowWidth === 0 || this.state.sobj.flowWidth === ""){
        alertService.error(this.props.t('FLOOR_WIDTH_REQUIRED'));
        return false;
      }
      if(this.state.sobj.flowHeight === 0 || this.state.sobj.flowHeight === ""){
        alertService.error(this.props.t('FLOOR_HEIGHT_REQUIRED'));
        return false;
      }
      if(this.state.sobj.uom === ""){
        alertService.error(this.props.t('UNIT_OF_MESSURE_REQUIRED'));
        return false;
      }
      // if(this.state.croppedImageUrl == null){
      //   alertService.error("Please Upload Floor Plan");
      // }
      else{
        var savepath = (type === 3?submitCollection.deleteFloors:type === 2?submitCollection.updateFloors:submitCollection.saveFloors);
        submitSets(savepath, csobj, true).then(res => {
            //console.log(res);
            this.setState({savemodalshow: false});
            if(res && res.status){
                alertService.success(this.props.t('SUCCESSFULLY_FLOOR_DETAILS')+(type===3?this.props.t("DELETED"):type===2?this.props.t("updated"):this.props.t("saved")));

                let cprevdetails = this.state.prevpagedetails;
                if(cprevdetails){
                  cprevdetails["viewtype"] = (type === 3?"delete":type === 2?"update":"new");
                  this.props.setPrevDetails(cprevdetails);
                }
                
                this.props.history.push("/floors");
            } else{
                alertService.error(res && res.extra?res.extra:(this.props.t('ERROR_OCCURRED_IN')+(type===3?"delete":type===2?"update":"save")+" process"));
            }
        });
      }
    }
  }

  backLinkSet = (backpath, iscurrent) => {
    let cprevdetails = this.state.prevpagedetails;
    if(iscurrent && cprevdetails){
        let cprevdetails = this.state.prevpagedetails;
        cprevdetails["viewtype"] = "back";
        this.props.setPrevDetails(cprevdetails);

        this.props.history.push(backpath);
    }
  }
  validateField = (key,value) =>{
    let errorObj = this.state.errors
    let msg = ""
    if(value === "" || value.length === 0){
     msg = (this.props.t('fieldisrequired'))
            
    }
    errorObj[key] = msg; 
    this.setState({
        error:errorObj
    })
  }

  render() {
    var cvlist = Object.keys(uomList).map(x => {
      return <option key={x} value={x}>{this.props.t("uomlist."+x)}</option>
    });

    return (<>
        <Col xs={12} className={"main-content "+(this.props.isRTL==="rtl"?"RTL":"")} dir={this.props.isRTL}>

          <div>
            
            <div className="displayunit_outerbox">
              <Row>
                <MDSidebarMenu />
                <Col xs={12} lg={10}>
                    <Breadcrumb dir="ltr">
                        {this.props.isRTL==="rtl"?<>
                        <Breadcrumb.Item active>{this.props.t('details')}</Breadcrumb.Item>
                        <li className="breadcrumb-item"><Link to="/floors" onClick={() => this.backLinkSet("/floors", true)} role="button">{this.props.t('floors')}</Link></li>
                        <li className="breadcrumb-item"><Link to="/dashboard" onClick={() => this.backLinkSet("/dashboard")} role="button">{this.props.t('home')}</Link></li>
                        </>:<>
                        <li className="breadcrumb-item"><Link to="/dashboard" onClick={() => this.backLinkSet("/dashboard")} role="button">{this.props.t('home')}</Link></li>
                        <li className="breadcrumb-item"><Link to="/floors" onClick={() => this.backLinkSet("/floors", true)} role="button">{this.props.t('floors')}</Link></li>
                        <Breadcrumb.Item active>{this.props.t('details')}</Breadcrumb.Item>
                        </>}
                    </Breadcrumb>
                    <Col className="white-container additem-content">
                      <Row className='f-details'>
                        <Col xs={12} sm={6} lg={4}>
                          {this.state.sobj?<Col className="form-subcontent" style={{ minHeight: "auto" }}>
                          {/* <Form.Group className="NDUgroup nocollapseinput">
                              <AcInput eleid="name" atype="text" aid="name" adefval={this.state.sobj.name} aobj={this.state.sobj} avset={{}} avalidate={[ValT.empty]} aplace={this.props.t('floorname')} showlabel={true} arequired={true} onChange={(e) => this.handlevchange(e,"name")}  />
                            </Form.Group > */}
                            <Form.Group>  
                            <Form.Label >{this.props.t('floorname')} </Form.Label>
                              <Form.Control id="floornametxt" size="sm" type="text" required value={this.state.sobj.name} onChange={(e) => this.handlevchange(e,"name",this.props.t('Character.floorName'))}  onBlur={(e=>this.validateField('name',e.target.value))} onKeyDown={(e)=>preventinputToString(e,e.target.value,(this.props.t('Character.floorName')))}/>
                              <div className="errorMsg">{this.state.errors.name}</div>  
                            </Form.Group>
                            <Row>
                              <Col xs={12} md={6}>
                                <Form.Group>
                                  <Form.Label >{this.props.t('FLOOR_WIDTH')} <span style={{ color: "red" }}>*</span></Form.Label>
                                  <Form.Control id="floorwidthtxt" size="sm" type="text"  onBlur={(e=>this.validateField('width',e.target.value))} value={this.state.sobj.flowWidth} onChange={(e) => this.handlevchange(e,"flowWidth",(this.props.t('Character.width')))} onKeyDown={(e)=>preventinputotherthannumbers(e,this.state.sobj.flowWidth,(this.props.t('Character.width')))}/>
                                  <div className="errorMsg">{this.state.errors.width}</div>                                  
                                </Form.Group>
                              </Col>
                              <Col xs={12} md={6}>
                                <Form.Group>
                                  <Form.Label >{this.props.t('FLOOR_HEIGHT')} <span style={{ color: "red" }}>*</span></Form.Label>
                                  <Form.Control id="floorheighttxt" size="sm" type="text"  onBlur={(e=>this.validateField('height',e.target.value))}required value={this.state.sobj.flowHeight} onChange={(e) => this.handlevchange(e,"flowHeight",(this.props.t('Character.height')))} onKeyDown={(e)=>preventinputotherthannumbers(e,this.state.sobj.flowHeight,(this.props.t('Character.height')))}/>
                                  <div className="errorMsg">{this.state.errors.height}</div>  
                                </Form.Group>
                              </Col>
                              <Col xs={6}>
                                <Form.Group>
                                  <Form.Label >{this.props.t('uomeasure')} <span style={{ color: "red" }}>*</span></Form.Label>
                                  <FormSelect id="flooruomtxt" value={this.state.sobj.uom} onChange={(e) => this.handlevchange(e, "uom")}>
                                    <option value="">{this.props.t("SELECT")}</option>
                                    {cvlist}
                                  </FormSelect>
                                </Form.Group>
                              </Col>
                            </Row>
                          </Col>:<></>}
                          <Link to="/floors" onClick={() => this.backLinkSet("/floors", true)}><Button variant="secondary" type="button">{this.props.t('btnnames.back')}</Button></Link>
                          {this.state.isedit ? <>
                            <Button id="btnupdatelink" variant="success" className={"formview-btn "+(this.props.isRTL==="rtl"?"float-left mx-2":"float-right")} type="button" onClick={() => this.handleGetUploadImage(2)}>{this.props.t('btnnames.update')}</Button>
                            <Button id="btndeletelink" variant="danger" className={"formview-btn "+(this.props.isRTL==="rtl"?"float-left":"float-right") }type="button" onClick={() => this.handleGetUploadImage(3)} style={{ marginRight: "10px" }}>{this.props.t('btnnames.delete')}</Button>
                          </> :  <Button id="btnsavelink" variant="success" className={"formview-btn "+(this.props.isRTL==="rtl"?"float-left":"float-right")} type="button" onClick={() => this.handleGetUploadImage(1)} >{this.props.t('btnnames.save')}</Button>}

                        </Col>
                        <Col xs={12} lg={8}>
                          <div className="Fdetailsbuttonset">
                            <div className="FloorDetailsbuttonset">
                              <Button size="sm" variant="outline-secondary" disabled={!(this.state.viewWidth&& this.state.viewHeight)} onClick={this.showModal}>{this.props.t('btnnames.upload')}</Button>

                            </div>
                          </div>
                          <Col className="form-subcontent">
                            <div className="FloorMapbox" ref={this.displaydiv} >
                              <svg ref={this.svgfile} preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg" className={(this.state.viewHeight > 0 && this.state.viewHeight > 0)?"PDmap":""} style={{border:"2px solid #ccc"}} height={this.state.viewHeight} width={this.state.viewWidth}>
                                <defs>
                                  <pattern id="img1" patternUnits="userSpaceOnUse" width={this.state.viewWidth} height={this.state.viewHeight}>
                                    <image href={this.state.croppedImageUrl} x="0" y="0" width={this.state.viewWidth} height={this.state.viewHeight} />
                                  </pattern>
                                </defs>
                                <rect  fill="url(#img1)"  y="0" x="0" height={this.state.viewHeight} width={this.state.viewWidth}  />

                              </svg>
                            </div>
                          </Col>

                        </Col>
                      </Row>
                    </Col>
                </Col>
              </Row>

            </div>

          </div>

        </Col>
        <Modal size="lg" show={this.state.show} onHide={this.hideModal} className='floorimage-update-modal' dir={this.props.isRTL}>
          <Modal.Header >
            <Modal.Title style={{width: "100%"}}>
              <h5 style={{marginBottom:"0px"}}>{this.props.t('cropimg')}
              <label className={"btn btn-danger btn-file  "+(this.props.isRTL==="rtl"?"brwsbtnRTL":"brwsbtn")} style={{position:"absolute", top:"9px"}}>
              {this.props.t('browsimg')} <input type="file" accept="image/png, image/jpeg" onChange={this.onSelectFile} style={{display:"none"}} />
              </label>
              </h5>
            </Modal.Title>
          </Modal.Header>
          <Modal.Body style={{minHeight:"calc(100vh - 200px)"}}>
            <div className="FDimagecrop-box">
            {this.state.src && (
              <ReactCrop className="crop-plan-image"
                src={this.state.src}
                crop={this.state.crop}
                ruleOfThirds
                onImageLoaded={this.onImageLoaded}
                onComplete={this.onCropComplete}
                onChange={this.onCropChange}
              />
            )}
            {/* {this.state.croppedImageUrl && (
          <img alt="Crop" style={{ maxWidth: '100%' }} src={this.state.croppedImageUrl} />
        )} */}
            </div>

          </Modal.Body>
          <Modal.Footer>
            <Button variant="default" onClick={this.hideModal}>{this.props.t('btnnames.close')}</Button>
            <Button variant="primary" className={this.props.isRTL === "rtl"?"float-left":"float-right"} onClick={this.hideModal}>{this.props.t('continue')}</Button>
          </Modal.Footer>
        </Modal>

        <AcViewModal showmodal={this.state.savemodalshow} />
      </>
    )
  }
}

const mapDispatchToProps = dispatch => ({
  setPrevDetails: (payload) => dispatch(setFloorPrevDetails(payload)),
});

export default withTranslation()(withRouter(connect(null,mapDispatchToProps)(FloorDetails)));
