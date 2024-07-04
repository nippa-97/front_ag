import { Component } from 'react';
import { Link } from 'react-router-dom';
import { Card,Form, Col, Container } from 'react-bootstrap';
import './ResetPassword.css'
import {ArrowLeftIcon} from '@primer/octicons-react'
import { withRouter } from 'react-router-dom';
import { AcInput, AcButton, ValT } from '../UiComponents/AcImports';
import { withTranslation } from 'react-i18next';

export class ResetPassword extends Component {
    constructor(props){
        super(props);
        this.state = {
            robj:{}, rval:{}
        }
    }

    componentDidMount(){
        document.body.classList.add("s-page");
    }

    componentWillUnmount(){
        document.body.classList.remove("s-page");
    }

    render() {
        return (<>
            <Col className="landing-overlay"></Col>
            <Col xs={12}>
                <Container>
                    <img src="assets/img/logo_o_inv.png" className="landing-logo" alt="planigo logo"/>
                    <Col xs={12} md={5} className="signin-content float-right">
                        <Card>
                            <Card.Body>
                                <Link to="/signin"><ArrowLeftIcon className="back-link" size={32}/></Link>
                                <h3>{this.props.t('FORGOT_ACCOUNT_PW')}</h3>
                                <p>{this.props.t('ENTER_EMAIL_USED_TO_REGISTER_WITH_PLANIGO')}</p>
                                <Form>
                                    <Form.Group controlId="formBasicEmail">
                                        <Form.Label>{this.props.t('formfield.email')}</Form.Label>
                                        <AcInput atype="text" aid="uname" aobj={this.state.robj} avset={this.state.rval} aplace="Enter email" avalidate={[ValT.empty,ValT.email]} showlabel={true}/>
                                    </Form.Group>
                                    <Link to="/confirmation"><AcButton avariant="primary" atype="button" aobj={this.state.robj} avalidate={this.state.rval}>{this.props.t('RESET_ACCOUNT')}</AcButton></Link>
                                    
                                    <Col xs={12} className="landing-footer">
                                        <Container>
                                            <ul className="list-inline">
                                                <li className="list-inline-item">{this.props.t('support')}</li>
                                                <li className="list-inline-item">{this.props.t('toservice')}</li>
                                                <li className="list-inline-item">{this.props.t('ppolicy')}</li>
                                            </ul>
                                        </Container>
                                    </Col>
                                </Form>
                            </Card.Body>
                        </Card>
                    </Col>        
                </Container>
            </Col>
            
        </>
        )
    }
}

export default  withTranslation()(withRouter(ResetPassword))