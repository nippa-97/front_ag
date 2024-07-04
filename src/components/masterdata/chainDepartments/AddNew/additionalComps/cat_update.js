import React from 'react';
import { Button, Col, Form, Modal } from 'react-bootstrap';

import { alertService } from '../../../../../_services/alert.service';
import { submitCollection } from '../../../../../_services/submit.service';
import { AcInput, AcViewModal, ValT } from '../../../../UiComponents/AcImports';
import { submitSets } from '../../../../UiComponents/SubmitSets';
import { CustomColorPicker } from '../../../../common_layouts/color-picker';

export class CategoryUpdate extends React.Component{
    constructor(props){
        super(props);

        this._isMounted = false;

        this.state = {
            loading:false,
            cdepobj: null,
            catobj: this.defaultCatObjectLoad(), // sub category
            vobj: {},
            isButtonDisable: false,
        }
    }

    componentDidMount(){
        this._isMounted = true;

        if(this._isMounted){
            let cdeptobj = (this.props.deptobj?this.props.deptobj: null);

            let newdeptobj = null;
            if(cdeptobj){
                newdeptobj = {
                    categories: [],
                    isDelete: false,
                    isNew: false,
                    chainDepartmentId: cdeptobj.departmentId,
                    departmentId: cdeptobj.departmentId,
                    departmentName: cdeptobj.departmentName,
                    departmentColor: "",
                    displayName: "",
                    hide: false
                }
            }

            this.setState({  
                cdepobj: newdeptobj,
                catobj: (this.props.catobj?this.props.catobj:this.defaultCatObjectLoad()),
                isButtonDisable: false,
            });
        }
    }

    componentWillUnmount(){
        this._isMounted = false;
    }

    //default category object
    defaultCatObjectLoad = () => {
        return {
            id: 0,
            chainDepartmentId: 0,
            categoryName: "",
            color: "#999999",
            subCategory: [],
            isDelete: false,
            isNew: true,
        };
    }

    AddCategory = () =>{
        if(this.state.catobj.categoryName !== ""){
            let catobj = this.state.catobj;
            catobj["isEyeLevelRank"] = 0;
            catobj["fieldId"] = -1;
            catobj["field"] = null;

            var depobj = this.state.cdepobj;
            depobj["categories"] = [catobj];
            
            this.setState({cdepobj: depobj}, () => {
                if(this.state.cdepobj.chainDepartmentId > 0){
                    this.handleDepartmentUpdate();
                } else{
                    //
                }  
            });
        }
        else{
            alertService.warn(this.props.t('enter_catgory_name_placeholder'));
        }
    }

    handleDepartmentUpdate = () =>{
        let sobj = this.state.cdepobj;
        
        this.setState({isButtonDisable:true, loading:true});
        submitSets(submitCollection.updateChainDepatments, sobj, true, null, true).then(resp => {
            this.setState({isButtonDisable:false, loading:false});

            if(resp && resp.status){
                alertService.success(this.props.t('SUCCESSFULLY_UPDATED'));
                this.props.handleModalToggle(true, resp.extra);
            } else{
                // alertService.error((resp.extra && resp.extra !== "")?resp.extra:this.props.t('ERROR_OCCORED_IN_PROCESS'));
            }
        });
    }

    changeColor = (color) =>{
        let ssobj = this.state.catobj;
        ssobj.color = color;
        this.setState({catobj:ssobj});
    }

    render(){
        return (<>
            <Modal show={this.props.showCatNewModal} className="tagmodal-view cd-subcat-modal" dir={this.props.isRTL} onHide={this.props.handleModalToggle} backdrop="static">
                <Modal.Header>
                    <Modal.Title style={{fontSize:"20px", fontWeight:"700", textAlign:"center", width:"100%"}}>{this.props.t('addcategory')}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Col className="formcontrol-main">
                        <>
                            <Col xs={12} className="form-subcontent">
                                <Form.Group className='parent-content'>
                                    <small>{this.props.t('parent_department')}</small>
                                    <h5>{this.state.cdepobj?this.state.cdepobj.departmentName:"-"}</h5>
                                </Form.Group><hr/>

                                <Form.Group style={{marginBottom:"30px"}}>
                                    <AcInput eleid="subcatnametxt" atype="text" aid="categoryName" adefval={this.state.catobj.categoryName} aobj={this.state.catobj} avset={this.state.vobj} avalidate={[ValT.empty]} aplace={this.props.t('categoryName')} showlabel={true} arequired={true}/>
                                </Form.Group>
                                <Form.Group style={{marginBottom:"30px"}}>
                                    {/* <AcInput atype="color" aid="color" adefval={this.state.catobj.color} aobj={this.state.catobj} avset={this.props.vobj} avalidate={[ValT.empty]} aplace={this.props.t('color')} showlabel={true}/> */}
                                    <CustomColorPicker 
                                        isRTL = {this.props.isRTL}
                                        selectedColor={this.state.catobj.color}
                                        label={this.props.t('color')}
                                        isCompulsary={true}
                                        changeColor = {this.changeColor}    
                                        type={"category"}
                                        departmentId={this.props.deptobj ? this.props.deptobj.departmentId : -1}
                                        categoryId={-1}
                                        isNew ={this.state.catobj.isNew}
                                        t ={this.props.t}
                                    />
                                </Form.Group>
                            </Col>
                        </>
                    <div>
                        <Button variant="secondary" onClick={()=> this.props.handleModalToggle()} type="button" className='back-link' style={{borderRadius:"25px"}}>{this.props.t('btnnames.close')}</Button>
                        <Button className={"formview-btn "+(this.props.isRTL==="rtl"?"float-left":"float-right")} disabled={this.state.isButtonDisable} variant="success" onClick={()=>this.AddCategory()} type="button" style={{borderRadius:"25px"}}>{this.props.t((this.state.catobj.isNew?'btnnames.add':'btnnames.update'))}</Button>
                        {/* <Button className={"formview-btn "+(this.props.isRTL==="rtl"?" float-left ":" float-right ")+(this.state.catobj.isNew?" d-none ":"")} disabled={this.props.isButtonDisable} variant="danger" onClick={() => this.handleSubCategoryDelete()} type="button" style={{borderRadius:"25px",margin:"0 5px"}}>{this.props.t('btnnames.delete')}</Button> */}
                    </div>
                    </Col>
                </Modal.Body>
            </Modal>

            <AcViewModal showmodal={this.state.loading} message={this.props.t('PLEASE_WAIT')}/>
        </>);
    }
}