import React, { Component } from 'react';
import { Button, Col, Form, Modal } from 'react-bootstrap';
import { withTranslation } from 'react-i18next';
import { withRouter } from 'react-router-dom';
import Select from 'react-select';

import './switchParentModal.scss';
class SwitchParentModal extends Component {
    constructor(props){
        super(props);
        this.state = {
            depratmentList: [{value :0, label:"-"}],
            catList: [{value :0, label:"-"}],
        }
    }
    componentDidMount(){
        this._isMounted = true;
        if(this._isMounted){
            if(this.props.dtype){
                if(this.props.dtype==="category"){
                    this.setState({
                        depratmentList:this.props.maindepartmentslist,
                        catList:this.props.departmentslist
                    })
                }
            }
        }
    }
    componentWillUnmount(){
        this._isMounted = false;
    }
    render() {
        return (
            <Modal dir={this.props.isRTL} className='switchdep-modal-body' show={this.props.showSwitchModal} onHide={this.props.handleSwitchModal} centered> 
                {/* <Modal.Header closeButton>
                <Modal.Title>Modal heading</Modal.Title>
                </Modal.Header> */}
                <Modal.Body>
                    <div className="current-section"><h6>
                        {this.props.dtype?(this.props.dtype==="department")?<>{(this.props.t("CATELOG_LOG_EX_LABLES.department")+":")}</>:<>{(this.props.t("CATELOG_LOG_EX_LABLES.category")+":")}</>:""} 
                        <label>{this.props.currentName}</label>
                    </h6></div>

                    {(this.props.dtype==="department")?<Col>
                            <Form.Group>
                                <Form.Label>
                                {(this.props.dtype==="department")?this.props.t("SELECTTO_CHANGE_DEP"):
                                    this.props.t("SELECT_TO_CHANGE_CAT")
                                }
                                </Form.Label>
                                <Select id="departmentId" name="departmentId" placeholder={(this.props.dtype==="department")?this.props.t("selectdepartment"):this.props.t("SELECT_CATEGORY")} options={this.props.departmentslist}  className="filter-deplist" size="sm" classNamePrefix="searchselect-inner" maxMenuHeight={200} data-validation-type="dep"
                                value={this.props.parentupdatebulkobj!==null?this.props.departmentslist.filter(option => option.value === this.props.parentupdatebulkobj.newDeptParent):-1} onChange={(e) => this.props.handleParentChange(e)}  />
                            </Form.Group>
                        </Col>
                    :
                        <Col>
                            <Form.Group>
                                <Form.Label>
                                {this.props.t("SELECTTO_CHANGE_DEP")}
                                </Form.Label>
                                <Select id="departmentId" name="departmentId" defaultValue={this.state.depratmentList[this.props.selectedDepindx]} placeholder={(this.props.dtype==="department")?this.props.t("selectdepartment"):this.props.t("SELECT_CATEGORY")} options={this.state.depratmentList}  className="filter-deplist" size="sm" classNamePrefix="searchselect-inner" maxMenuHeight={200} data-validation-type="dep"
                                onChange={(e) => this.props.handleswdepChange(e)}  />
                            </Form.Group>
                            <Form.Group>
                                <Form.Label>
                                    {this.props.t("SELECT_TO_CHANGE_CAT")}
                                </Form.Label>
                                <Select isLoading={this.props.iscatlistloading} id="departmentId" name="departmentId" value={this.props.parentupdatebulkobj!==null?this.props.departmentslist.filter(option => option.value === this.props.parentupdatebulkobj.newCatParent):-1} placeholder={(this.props.dtype==="department")?this.props.t("selectdepartment"):this.props.t("SELECT_CATEGORY")} options={this.props.departmentslist}  className="filter-deplist" size="sm" classNamePrefix="searchselect-inner" maxMenuHeight={200} data-validation-type="dep"
                                onChange={(e) => this.props.handleParentChange(e)}  />
                            </Form.Group>
                            
                        </Col>
                    }
                   
                </Modal.Body>
                <Modal.Footer className='switchdep-modal-footer'>
                    <Button variant="secondary" onClick={this.props.handleSwitchModal}>{this.props.t("btnnames.close")}</Button>
                    <Button variant="primary" onClick={()=>this.props.handleUpdate(this.props.dtype)} className={this.props.isRTL === "rtl"?"float-left":"float-right"}>{this.props.t("btnnames.save")}</Button>
                </Modal.Footer>
            </Modal>
        );
    }
}


export default  withTranslation()(withRouter(SwitchParentModal));