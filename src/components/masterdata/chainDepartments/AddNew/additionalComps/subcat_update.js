import React from 'react';
import { Badge, Button, Col, Form, Modal, Row } from 'react-bootstrap';
import { confirmAlert } from 'react-confirm-alert';

import { alertService } from '../../../../../_services/alert.service';
import { submitCollection } from '../../../../../_services/submit.service';
import { AcInput, AcViewModal, ValT } from '../../../../UiComponents/AcImports';
import { submitSets } from '../../../../UiComponents/SubmitSets';

import { CustomColorPicker } from '../../../../common_layouts/color-picker';
import { maxInputLength } from '../../../../../_services/common.service';

export class SubCatUpdate extends React.Component{
    constructor(props){
        super(props);

        this._isMounted = false;

        this.state = {
            loading:false,
            cdepobj: null,
            ccatobj: null,
            subcatobj: this.defaultSubCatObjectLoad(), // sub category
            vobj: {},
            isButtonDisable: false,
        }
    }

    componentDidMount(){
        this._isMounted = true;

        if(this._isMounted){
            this.setState({  
                cdepobj: (this.props.deptobj?this.props.deptobj: null),
                ccatobj: (this.props.catobj?this.props.catobj: null),
                subcatobj: (this.props.subcatobj?this.props.subcatobj:this.defaultSubCatObjectLoad()),
                initalSubcatobj: (this.props.subcatobj?{...this.props.subcatobj}:this.defaultSubCatObjectLoad()),
                isButtonDisable: false,
             });
             //console.log(this.props.catobj);
        }
    }

    componentWillUnmount(){
        this._isMounted = false;
    }

    //default subcategory object
    defaultSubCatObjectLoad = () => {
        return {
            isDelete: false,
            isNew: true,
            brands: [],
            categoryId: 0,
            subCategoryId: 0,
            subCategoryName: "",
            color: "#999999",
        };
    }

    AddSubCat = (type) => {
        if(this.state.subcatobj.subCategoryName !== ""){

            if(type === 2){

                console.log(this.state.initalSubcatobj,this.state.subcatobj)

                let isNameChanged = false;
                let isColorChanged = false;

                if(this.state.initalSubcatobj.subCategoryName !== this.state.subcatobj.subCategoryName){
                    isNameChanged = true;
                }

                if(this.state.initalSubcatobj.color !== this.state.subcatobj.color){
                    isColorChanged = true;
                }

                if(!isNameChanged && !isColorChanged){
                    alertService.warn(this.props.t('NO_CHANGES_AVAILABLE'));
                    return false;
                }

            }

            this.setState({isButtonDisable:true, loading:true,});
            let catobj = this.props.catobj;

            catobj.subCategory = [this.state.subcatobj]
            submitSets(submitCollection.saveSubCategories, catobj, true, null, true).then(res => {
                this.setState({isButtonDisable:false, loading:false,});
                if(res && res.status){
                    alertService.success(this.props.t('SUCCESSFULLY_ADDED'));
                    
                    this.props.handleModalToggle(true, res.extra);
                } else{
                    // alertService.error((res.extra?res.extra:this.props.t('ERROR_OCCURRED')));
                }
            });
        }
        else{
            alertService.warn(this.props.t('ENTER_SUB_CATEGORY_NAME'));
        }
    }

    //sub category methods
    handleSubCategoryDelete = () => {
        confirmAlert({
            title: this.props.t('CONFIRM_TO_SUBMIT'),
            message: this.props.t('ARE_YOU_SURE_TO_CONTINUE_THIS_TASK'),
            buttons: [{
                label: this.props.t('btnnames.yes'),
                onClick: () => {
                    let subcatobj = this.state.subcatobj;
                    subcatobj.isDelete = true;
                    submitSets(submitCollection.deleteSubCategory, subcatobj, true, null, true).then(res => {
                        if(res && res.status){
                            alertService.success(this.props.t('SUCCESSFULLY_DELETED'));
                            
                            this.props.handleModalToggle(true, true);
                        } else{
                            // if(res&&res.extra==="CANT_DELETE_REFERENCE"){
                            //     alertService.error(this.props.t("CANT_DELETE_REFERENCE"));
                            // }
                            // else{
                            //     alertService.error((res&&res.extra?res.extra:this.props.t('ERROR_OCCURRED')));
                            // }
                        }
                    });
                }
            }, {
                label: this.props.t('btnnames.no')
            }]
        });
    }

    changeColor = (color) =>{
        let ssobj = this.state.subcatobj;
        ssobj.color = color;
        this.setState({subcatobj:ssobj});
    }

    render(){
        return (<>
            <Modal show={this.props.showSubCatNewModal} className="tagmodal-view cd-subcat-modal" dir={this.props.isRTL} onHide={this.props.handleModalToggle} backdrop="static">
                <Modal.Header>
                    <Modal.Title style={{fontSize:"20px", fontWeight:"700", textAlign:"center", width:"100%"}}>{this.props.t('addnewsubcategory')}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Col className="formcontrol-main">
                        <>
                        <Col xs={12} className="form-subcontent">
                            {this.props.isShowParents?
                            <><Col>
                                <Row>
                                    <Col>
                                        <Form.Group className='parent-content'>
                                            <small>{this.props.t('parent_department')}</small>
                                            <h5>{this.state.cdepobj && this.state.cdepobj.departmentId > 0?this.state.cdepobj.departmentName:"-"}</h5>
                                        </Form.Group>
                                    </Col>
                                    <Col>
                                        <Form.Group className='parent-content'>
                                            <small>{this.props.t('parent_category')}</small>
                                            <h5>{this.state.ccatobj?this.state.ccatobj.categoryName:"-"}</h5>
                                        </Form.Group>
                                    </Col>
                                </Row>
                            </Col><hr/></>:<></>}

                            <Form.Group style={{marginBottom:"30px"}}>
                                <AcInput eleid="subcatnametxt" atype="text" aid="subCategoryName" adefval={this.state.subcatobj.subCategoryName} aobj={this.state.subcatobj} avset={this.state.vobj} avalidate={[ValT.empty]} aplace={this.props.t('subCategory')} showlabel={true} arequired={true} msg={this.props.t('Character.sub_Cat')} characterValidate={maxInputLength} validateString={true}/>
                            </Form.Group>
                            {
                                this.state.subcatobj.importName && (this.state.subcatobj.importStatus==="None" || this.state.subcatobj.importStatus==="ReferenceUpdatePending") ?
                                    <div style={{marginTop:"-30px", marginBottom:"20px"}}>
                                        <Badge bg="warning" pill>{this.props.t("CATELOG_IMP_NAME")} : {this.state.subcatobj.importName}</Badge>
                                    </div>
                                :<></>
                            }
                            <Form.Group style={{marginBottom:"30px"}}>
                                {/* <AcInput atype="color" aid="color" adefval={this.state.subcatobj.color} aobj={this.state.subcatobj} avset={this.props.vobj} avalidate={[ValT.empty]} aplace={this.props.t('color')} showlabel={true}/> */}
                                <CustomColorPicker 
                                    isRTL = {this.props.isRTL}
                                    selectedColor={this.state.subcatobj.color}
                                    label={this.props.t('color')}
                                    isCompulsary={false}
                                    changeColor = {this.changeColor}    
                                    type={"sub_category"}
                                    departmentId={(this.props.catobj?this.props.catobj.chainDepartmentId: -1)}
                                    categoryId={(this.props.catobj?this.props.catobj.id: -1)}
                                    isNew ={this.state.subcatobj.isNew}
                                    t ={this.props.t}
                                />
                            </Form.Group>
                        </Col>
                        </>

                    <div>
                        <Button variant="secondary" onClick={()=> this.props.handleModalToggle()} type="button" className='back-link' style={{borderRadius:"25px"}}>{this.props.t('btnnames.close')}</Button>
                        <Button className={"formview-btn "+(this.props.isRTL==="rtl"?"float-left":"float-right")} disabled={this.state.isButtonDisable} variant="success" onClick={()=>this.AddSubCat(this.state.subcatobj.isNew===true?1:2)} type="button" style={{borderRadius:"25px"}}>{this.props.t((this.state.subcatobj.isNew===true?'btnnames.add':'btnnames.update'))}</Button>
                        {/* <Button className={"formview-btn "+(this.props.isRTL==="rtl"?" float-left ":" float-right ")+(this.state.subcatobj.isNew===true?" d-none ":"")} disabled={this.props.isButtonDisable} variant="danger" onClick={() => this.handleSubCategoryDelete()} type="button" style={{borderRadius:"25px",margin:"0 5px"}}>{this.props.t('btnnames.delete')}</Button> */}
                    </div>
                    </Col>
                </Modal.Body>
            </Modal>

            <AcViewModal showmodal={this.state.loading} message={this.props.t('PLEASE_WAIT')}/>
        </>);
    }
}