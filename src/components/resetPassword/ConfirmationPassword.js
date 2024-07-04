import { Component } from 'react'
import { Button, Col, Container } from 'react-bootstrap';
import { withTranslation } from 'react-i18next';
import { withRouter } from 'react-router-dom';
import './ConfirmationPassword.css'

export class ConfirmationPassword extends Component {
   
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
                    <Col className="signin-content">
                        <div className="confirmebox">
                        <div className="MailSent">{this.props.t('EMAIL_CONFIRMATION_DETAILS_SENT')}</div>
                        <div className="checkmail">{this.props.t('CHECK_YOUR_EMAIL_FOR_CONFIRMATION_MESSAGE')}</div>
                            <Button variant="success" size="sm" className="confirmbtn" onClick={() => this.props.history.push('/signin')}>{this.props.t('continue')}</Button>
                        </div>    
                    </Col>
                    
                </Container>
            </Col>
        </>
            
        )
    }
}

export default withTranslation()(withRouter(ConfirmationPassword));