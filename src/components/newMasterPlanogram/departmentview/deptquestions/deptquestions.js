import React, { Component } from 'react';
import { Modal } from 'react-bootstrap';
import { withTranslation } from 'react-i18next';
import {  withRouter } from 'react-router-dom';

import MPDeptMetaForm from './formcontainer';

import './deptquestions.css';

class MPDeptQuestionsModal extends Component {
    constructor(props){
        super(props);

        this._isMounted = false;
        
        this.state = {
            
        }
    }

    componentDidMount(){
        this._isMounted = true;

        if (this._isMounted) {
            
        }
    }

    componentWillUnmount(){
        this._isMounted = false;
    }
    
    render() {

        return (
            
                <Modal className={"MPDeptQuestionsModal"} size="lg" dir={this.props.isRTL} centered show={this.props.isshow} onHide={()=>this.props.toggleDeptModal()}>
                    <Modal.Body>
                        <Modal.Header closeButton>
                            <Modal.Title>{this.props.t("department_meta_data")}</Modal.Title>
                        </Modal.Header>

                        <MPDeptMetaForm ismodalview={true} handleRedirectView={this.props.handleRedirectView} defSaveObj={this.props.defSaveObj}  />

                    </Modal.Body>
        </Modal>
            
        );
    }
}

export default withTranslation()(withRouter(MPDeptQuestionsModal));