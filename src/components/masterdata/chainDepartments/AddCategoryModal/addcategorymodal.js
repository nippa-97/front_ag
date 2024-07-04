import React from 'react';
import { withRouter } from 'react-router-dom';
import {Col, Modal, Form, Button, Row, Tab } from 'react-bootstrap'; //, Badge
import { XIcon } from '@primer/octicons-react';

import {  withTranslation } from "react-i18next";
import "../../../../_translations/i18n";

import { convertUomtoSym, maxInputLength,roundOffDecimal } from '../../../../_services/common.service';
import { AcInput, ValT} from '../../../UiComponents/AcImports'; //AcTable, 

import { CustomColorPicker } from '../../../common_layouts/color-picker';

import './addcategorymodal.scss';

export class AddCategoryFieldModal extends React.Component{
    _isMounted = false;

    constructor(props){
        super(props);

        this._mainFieldDiv = React.createRef();

        this.state = {
            
        }
    }

    componentDidMount(){
        this._isMounted = true;
        if(this._isMounted){
            this.setState({
                divWidth: 380,
                divHeight: 350,
            });
        }
    }

    componentWillUnmount(){
        this._isMounted = false;
    }

    //show dot label
    dotTxtShow = (ctype, cposition) => {
        var cobj = (this.props.fieldLevelObj?this.props.fieldLevelObj:null);
        var rtxt = '0';
        if(cobj && Object.keys(cobj).length > 0){
            var cmtxt = convertUomtoSym((cobj.uom));
            var cptxt = (cposition===1?"0":cposition===2?(parseFloat(cobj[ctype]) / 2).toFixed(1):(parseFloat(cobj[ctype]).toFixed(1)));
            rtxt = cptxt + cmtxt;
        }
        return rtxt;
    }

    removeCatField = () => {
        let catobj = this.props.catobj;
        catobj["isEyeLevelRank"] = 0;
        catobj["fieldId"] = -1;
        catobj["field"] = null;

        this.props.updateCatObjFromChild(catobj);
        this.props.handleSelectfield(null);
    }

    render(){
        return(
            <>
                <Modal show={this.props.showCatNewModal} className="tagmodal-view depatartment-category-modal" dir={this.props.isRTL} onShow={this.props.handleModalReset} onHide={this.props.handleModalToggle} backdrop="static">
                    <Modal.Header>
                        <span onClick={this.props.handleModalToggle} className='close-link'><XIcon size={22}/></span>
                        <Modal.Title style={{fontSize:"20px",fontWeight:"700"}}>{this.props.isUpdateField?this.props.t('btnnames.updatecategory'):this.props.t('addnewcategory')}</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                    <Tab.Container activeKey={this.props.activeTabKey}>
                            <Tab.Content>
                                <Tab.Pane eventKey="fieldselect">
                                    <div className='fieldsdiv'>
                                        <div className='SelectCategory'>
                                            <div className='categoryselect'>
                                                <Col xs={12} md={6} className="form-subcontent">
                                                    <Form.Group style={{marginBottom:"35px"}}>
                                                        <AcInput eleid="catnametxt" atype="text" aid="categoryName" adefval={this.props.catobj.categoryName} aobj={this.props.catobj} avset={this.props.vobj} avalidate={[ValT.empty]} aplace={this.props.t('categoryName')} showlabel={true} arequired={true} msg={this.props.t('Character.Cat')} characterValidate={maxInputLength} validateString={true}/>
                                                    </Form.Group>
                                                </Col>
                                                <Col xs={12} md={1}></Col>
                                                <Col xs={12} md={5} className="form-subcontent color-content">
                                                    <Form.Group className='colorpicker-view'>
                                                        {/* <AcInput atype="color" aid="color" adefval={this.props.catobj.color} aobj={this.props.catobj} avset={this.props.vobj} avalidate={[ValT.empty]} aplace={this.props.t('color')} showlabel={true}/> */}
                                                        <CustomColorPicker 
                                                            isRTL = {this.props.isRTL}
                                                            selectedColor={this.props.catobj.color}
                                                            label={this.props.t('color')}
                                                            isCompulsary={false}
                                                            changeColor = {this.props.changeCatColor}    
                                                            type={"category"}
                                                            departmentId={(this.props.departmentData ? this.props.departmentData.departmentId : -1)}
                                                            categoryId={-1}
                                                            isNew ={!this.props.isUpdateField}
                                                            t ={this.props.t}
                                                        />
                                                    </Form.Group>
                                                </Col>
                                            </div>

                                            {this.props.isUpdateField && (this.props.catobj && this.props.catobj.fieldId > 0)?<>
                                                <Col xs={6} style={{marginBottom:"50px"}}>
                                                    <Col className="fielddetails-content">
                                                        {/* <Button onClick={this.handleCatModalToggle} variant="secondary" className='update-link' size="sm"><PencilIcon size={12}/> {this.props.t('btnnames.update')}</Button> */}
                                                        <Button onClick={() =>this.removeCatField()} variant="secondary" size="sm"><XIcon size={12}/></Button>

                                                        <small>{this.props.t('dunitname')}</small>
                                                        <h5>{(this.props.catobj && this.props.catobj.fieldId > 0)?this.props.catobj.field.fieldName.substring(0,25):"No Field Selected"}</h5>
                                                        {(this.props.catobj && this.props.catobj.fieldId > 0)?<label>{this.props.t('EYE_LEVEL')+": "+this.props.catobj.isEyeLevelRank}</label>:<></>}
                                                    </Col>
                                                </Col>    
                                            </>:<></>}

                                            <Col xs={12} className="field" style={{marginTop:"0px"}}>
                                                <h6 className='field-title'>{this.props.t("selectfield")}</h6>
                                                <Row style={(this.props.isRTL === "rtl" ? { marginRight: "0px", width: "100%" } : { marginLeft: "0px", width: "100%" })}>
                                                    {(this.props.loadDunitList.length>0 ? this.props.loadDunitList.map((field, i) =>
                                                        <Col md={3} key={i}>
                                                            <Col className={"sub-item "+(field.isSelected?"active":"") } onClick={()=>this.props.handleSelectfield(field)}>
                                                                <Col xs={12} id={field.fieldId} style={{padding:"0px"}}>
                                                                    <Row>
                                                                        <Col xs={12} style={{background:"#FFF", marginTop:"-5px", height:"55px", borderBottom: "1px solid #ddd"}}>
                                                                            <div className="thumb-div">
                                                                                <img key={i} className="img-fluid" src={field.fieldImgUrl} alt="" />
                                                                            </div>
                                                                        </Col>
                                                                        <Col xs={12} className="fieldName" title={field.fieldName}>{field.fieldName.substring(0,22)+(field.fieldName.length > 22?"..":"")}</Col>
                                                                        
                                                                        <Col xs={4} className="field-value-title">{this.props.t("width")}</Col>
                                                                        <Col xs={4} className="field-value-title">{this.props.t("height")}</Col>
                                                                        <Col xs={4} className="field-value-title">{this.props.t("depth")}</Col>

                                                                        <Col xs={4} className="field-value">{roundOffDecimal(field.width,2)+field.uom }</Col>
                                                                        <Col xs={4} className="field-value">{roundOffDecimal(field.height,2)+field.uom}</Col>
                                                                        <Col xs={4} className="field-value">{roundOffDecimal(field.depth,2)+field.uom}</Col>

                                                                    </Row>
                                                                </Col>
                                                            </Col>
                                                        </Col>
                                                        ) : (<></>))}
                                                        
                                                    {this.props.loadDunitList.length < this.props.fieldTotalCount?<Button className="load-more-btn" onClick={()=>this.props.loadMoreDunits()}>{this.props.t("btnnames.loadmore")}</Button>:<></>}
                                                </Row>
                                            </Col>
                                        </div>
                                    </div>
                                </Tab.Pane>
                                <Tab.Pane eventKey="fielddraw">
                                    <Col className='NDUrowStructuredraw fielddraw-view'>
                                        <label style={{marginTop:"8px"}}>{this.props.t("select_eye_level_to_continue")}</label>

                                        {this.props.fieldLevelObj?<>
                                            <div className="measure-line vertical" dir="ltr" style={{width:"100%"}}>
                                                <div className="dot-txt" style={this.props.isRTL === "rtl"?{marginLeft:"86%"}:{}}>{this.dotTxtShow("width",1)}</div>
                                                <div className="dot-txt" style={{marginLeft:"42%",marginTop:"-15px"}}>{this.dotTxtShow("width",2)}</div>
                                                <div className="dot-txt" style={this.props.isRTL === "rtl"?{marginLeft:"0%",marginTop:"-15px"}:{marginLeft:"83%",marginTop:"-15px"}}>{this.dotTxtShow("width",3)}</div>
                                                <div className="dots"></div>
                                                <div className="dots" style={{marginLeft:"50%",marginTop:"-4px"}}></div>
                                                <div className="dots" style={{marginLeft:"99%",marginTop:"-4px"}}></div>
                                            </div>

                                            <div className="measure-line horizontal" dir="ltr" style={{height:this.state.divHeight+3, marginLeft: -10}}>
                                                <div className="dot-txt" style={{marginTop:(20)}}>{this.dotTxtShow("height",3)}</div>
                                                <div className="dot-txt" style={{marginTop:((this.state.divHeight / 2) - 2)}}>{this.dotTxtShow("height",2)}</div>
                                                <div className="dot-txt" style={{marginTop:(this.state.divHeight - 2)}}>{this.dotTxtShow("height",1)}</div>
                                                <div className="dots"></div>
                                                <div className="dots" style={{marginTop:(this.state.divHeight / 2)}}></div>
                                                <div className="dots" style={{marginTop:(this.state.divHeight - 5)}}></div>
                                            </div>
                                        </>:<></>}

                                        <div ref={this._mainFieldDiv} className="field-wrapper">
                                            {this.props.fieldLevelObj?<>
                                                <svg width={"100%"} height={this.state.divHeight} version="1.1" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
                                                    
                                                    <rect x={0} y={0} width={"100%"} height={this.props.fieldLevelObj.drawHeight} strokeWidth={3} fill="none" style={{ stroke: (this.props.dmode?'#2CC990':'#cfbbf3'),display:"block",margin:"auto" }} ></rect>
                                                    
                                                    {(this.props.fieldLevelObj.fieldShelves?this.props.fieldLevelObj.fieldShelves.map((shelf, i) => {
                                                        let cisselected = this.props.fieldEyeLevels.findIndex(x => x.rank === shelf.rank);
                                                        return <React.Fragment key={i}>
                                                            <rect className={"sftrect shelve-row"+(cisselected > -1?" active":"")} onClick={() => this.props.handleSelectRow(i, shelf) } width={"100%"} height={shelf.drawHeight} x={0} y={shelf.y} style={{ strokeWidth: 1, stroke: (this.props.dmode?'#2CC990':'#cfbbf3'), fill: 'transparent' }} />
                                                            <rect className="sftrect" width={"100%"} height={shelf.drawGap} x={0} y={shelf.y + (shelf.drawHeight?shelf.drawHeight:0)} style={{ fill: (this.props.dmode?'#2CC990':'#cfbbf3') }} />
                                                        </React.Fragment>;
                                                    }) : (<></>))}
                                                </svg>
                                            </>:<></>}
                                        </div>
                                    </Col>
                                </Tab.Pane>
                            </Tab.Content>
                        </Tab.Container>
                    </Modal.Body>
                    <Modal.Footer style={{height: "50px"}}>
                        {this.props.activeTabKey === "fieldselect"?<>
                            <Button variant="secondary" className='float-left btn-back-cat' onClick={this.props.handleModalToggle}>{this.props.t('btnnames.back')}</Button>
                            <Button className="btn-save-cat" onClick={()=>this.props.toggleActiveTab("fielddraw")}>{this.props.t("continue_btn")}</Button>
                        </>:<>
                            <Button variant="secondary" className='float-left btn-back-cat' onClick={()=>this.props.toggleActiveTab("fieldselect")}>{this.props.t("btnnames.back")}</Button>
                            
                            {this.props.isUpdateField?<>
                                <Button className="btn-save-cat" onClick={()=>this.props.UpdateCategory(2)}>{this.props.t("btnnames.update")}</Button>
                            </>:<>
                                <Button className="btn-save-cat" onClick={()=>this.props.AddCategory()}>{this.props.t("btnnames.addnewcat")}</Button>
                            </>}
                        </>}
                    </Modal.Footer>
                </Modal> 
        </>)
    }
}


export default  withTranslation()(withRouter(AddCategoryFieldModal));