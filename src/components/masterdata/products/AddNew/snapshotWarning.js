import React from 'react';
import { withRouter } from 'react-router-dom';
import {Col, Button, Row, Modal, ListGroup } from 'react-bootstrap';
import { withTranslation } from 'react-i18next';
import FeatherIcon from 'feather-icons-react';

import './addnew.scss';

export class SnapshotWarning extends React.Component{
    _isMounted = false;

    constructor(props){
        super(props);
        this.state = {
            
        }
    }

    componentDidMount(){
        this._isMounted = true;

        if(this._isMounted){
            
        }
    }

    render(){
        return(
            <Modal size="md" dir={this.props.isRTL} className={'snapshotavlModal '+this.props.isRTL} show={this.props.snapshotAvailableModal} onHide={() => this.handleSnapshotAvailabilityModalToggle()} aria-labelledby="example-modal-sizes-title-lg" backdrop="static" animation={false}>
                <Modal.Header>
                    <Modal.Title style={{fontSize:"20px",fontWeight:"700"}}><FeatherIcon icon="alert-octagon" size={20}/> {this.props.t('SNAPSHOT_AVL_MODAL_TITLE')}</Modal.Title>
                    </Modal.Header>
                <Modal.Body style={{ minHeight:"100px", maxHeight: "550px", overflow: "auto", overflowX: "hidden" }}>
                    <ListGroup>
                    {
                        this.props.snapshotsList.length ? 
                            this.props.snapshotsList.map((i, index) => {
                                return i.isOnlyHasNew ? 
                                    <div key={index}>
                                        { index > 0 ? <br></br> : <></> }
                                        <h6 style={{ color: "#4F4F4F", fontWeight:"700"}}>{i.new.mpName}</h6>
                                        <ListGroup.Item> 
                                            <Row dir={this.props.isRTL}>
                                                <Col xs={1} className="icon-col green"><FeatherIcon icon="trending-up" size={20}/></Col>
                                                <Col xs={11} className="name-col">{i.new.label}</Col>
                                            </Row>
                                        </ListGroup.Item> 
                                    </div>
                                :
                                    <div key={index}>
                                        { index > 0 ? <br></br> : <></> }
                                        <h6 style={{ color: "#4F4F4F", fontWeight:"700"}}>{i.current.mpName}</h6>
                                        <ListGroup.Item >
                                            <Row dir={this.props.isRTL}>
                                                <Col xs={1} className="icon-col red"><FeatherIcon icon="trending-down" size={20}/></Col>
                                                <Col xs={11} className="name-col">{i.current.label}</Col>
                                            </Row>
                                        </ListGroup.Item>
                                        
                                        {i.new ?    
                                            <ListGroup.Item> 
                                                <Row dir={this.props.isRTL}>
                                                    <Col xs={1} className="icon-col green"><FeatherIcon icon="trending-up" size={20}/></Col>
                                                    <Col xs={11} className="name-col">{i.new.label}</Col>
                                                </Row>
                                            </ListGroup.Item> : <></>     
                                        }
                                    </div>  
                            }) : <></>
                    }
                    </ListGroup>
                </Modal.Body>
                <Modal.Footer>
                    <span className='btns-set'>
                        <Button className={"formview-btn "+(this.props.isRTL==="rtl"?"float-left":"float-right")} onClick={() => this.props.continueToUpdateFromSnashotWarning()} variant="success">{this.props.t('continue_btn')}</Button>                          
                        <Button className={"formview-btn "+(this.props.isRTL==="rtl"?"float-left":"float-right")} onClick={() => this.props.handleSnapshotAvailabilityModalToggle()} variant="secondary">{this.props.t('CANCEL')}</Button>
                    </span>         
                    
                </Modal.Footer>
            </Modal>
        )
    }
}

export default withTranslation()(withRouter(SnapshotWarning));