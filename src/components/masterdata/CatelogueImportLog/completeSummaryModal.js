import { Component } from 'react';
import { Modal , Button, Form , Col} from 'react-bootstrap';
import { withRouter } from 'react-router-dom';
import { withTranslation } from 'react-i18next';
import { XIcon } from '@primer/octicons-react';

export class CompleteSummaryModal extends Component {
    _isMounted = false;
    constructor(props) {
        super(props)
        this.state = {
            mtype:"",
            summaryObj:null,
        }
    }

    componentDidMount(){
        this._isMounted = true;
        if(this._isMounted){
          
          if(this.props.sumobj.logType==="SubCategory"){
            this.setState({summaryObj:this.props.sumobj.subCatAppprove, mtype:this.props.sumobj.logType});
          }
          else if(this.props.sumobj.logType==="Brand"){
            this.setState({summaryObj:this.props.sumobj.brandApprove, mtype:this.props.sumobj.logType});
          }
          else if(this.props.sumobj.logType==="Supplier"){
            this.setState({summaryObj:this.props.sumobj.supplierApprove, mtype:this.props.sumobj.logType});
          }
        }
    }

    componentWillUnmount(){
        this._isMounted = false;
    }

    render(){
        return(
            <>
                {
                    this.state.mtype==="SubCategory" ?
                        <Modal show={true} className={"approve-modal approve-summary-modal "+(this.props.isRTL==="rtl" ? "RTL":"LTR")} onHide={ e => { this.props.toggleSummaryModal("showBrandAddModal",false) }} backdrop="static" dir={this.props.isRTL}>
                            <Modal.Header>
                                <Modal.Title>
                                    <h6>{this.props.t("subcategory")}</h6>
                                    {this.state.summaryObj ? this.state.summaryObj.importName : "N/A" }
                                </Modal.Title>
                                <button className="close-btn" onClick={ () => this.props.toggleSummaryModal("showBrandAddModal",false)} ><XIcon size={20}/></button>
                            </Modal.Header>
                            <Modal.Body>
                                <Form.Group className='form-group'>
                                    <h5>{this.props.t("department")}</h5>
                                    <Col xs={12} className="complete-summary-val">{this.state.summaryObj ? this.state.summaryObj.departmentName : "N/A" }</Col>
                                </Form.Group>
                                <Form.Group className='form-group'>
                                    <h5>{this.props.t("category")}</h5>
                                    <Col xs={12} className="complete-summary-val">{this.state.summaryObj ? this.state.summaryObj.categoryName : "N/A" }</Col>
                                </Form.Group>
                                <Form.Group className='form-group'>
                                    <h5>{this.props.t("subcategory")}</h5>
                                    <Col xs={12} className="complete-summary-val">{this.state.summaryObj ? this.state.summaryObj.subCategoryName : "N/A" }</Col>
                                </Form.Group>
                            </Modal.Body>
                            <Modal.Footer>
                                <Button variant='secondary' onClick={()=>this.props.toggleSummaryModal()}>{this.props.t('btnnames.close')}</Button>
                            </Modal.Footer>
                        </Modal>
                    
                    : this.state.mtype==="Brand" ?
                        <Modal show={true} className={"approve-modal approve-summary-modal "+(this.props.isRTL==="rtl" ? "RTL":"LTR")} onHide={ e => { this.props.toggleSummaryModal("showBrandAddModal",false) }} backdrop="static" dir={this.props.isRTL}>
                            <Modal.Header>
                                <Modal.Title>
                                    <h6>{this.props.t("brand")}</h6>
                                    {this.state.summaryObj ? this.state.summaryObj.importName : "N/A" }
                                </Modal.Title>
                                <button className="close-btn" onClick={ () => this.props.toggleSummaryModal("showBrandAddModal",false)} ><XIcon size={20}/></button>
                            </Modal.Header>
                            <Modal.Body>
                                <Form.Group className='form-group'>
                                    <h5>{this.props.t("brand")}</h5>
                                    <Col xs={12} className="complete-summary-val">{this.state.summaryObj.brandName ? this.state.summaryObj.brandName : "N/A" }</Col>
                                </Form.Group>
                                <Form.Group className='form-group'>
                                    <h5>{this.props.t("suplable")}</h5>
                                    <Col xs={12} className="complete-summary-val">{this.state.summaryObj.supplierName ? this.state.summaryObj.supplierName : "N/A" }</Col>
                                </Form.Group>
                                
                            </Modal.Body>
                            <Modal.Footer>
                                <Button variant='secondary' onClick={()=>this.props.toggleSummaryModal()}>{this.props.t('btnnames.close')}</Button>
                            </Modal.Footer>
                        </Modal>
                    : this.state.mtype==="Supplier" ?
                        <Modal show={true} className={"approve-modal approve-summary-modal supplier "+(this.props.isRTL==="rtl" ? "RTL":"LTR")} onHide={ e => { this.props.toggleSummaryModal("showBrandAddModal",false) }} backdrop="static" dir={this.props.isRTL}>
                            <Modal.Header>
                                <Modal.Title>
                                    <h6>{this.props.t("suplable")}</h6>
                                    {this.state.summaryObj ? this.state.summaryObj.importName : "N/A" }
                                </Modal.Title>
                                <button className="close-btn" onClick={ () => this.props.toggleSummaryModal("showBrandAddModal",false)} ><XIcon size={20}/></button>
                            </Modal.Header>
                            <Modal.Body>
                                <Form.Group className='form-group'>
                                    <h5>{this.props.t("suplable")}</h5>
                                    <Col xs={12} className="complete-summary-val">{this.state.summaryObj.supplierName ? this.state.summaryObj.supplierName : "N/A" }</Col>
                                </Form.Group>
                            </Modal.Body>
                            <Modal.Footer>
                                <Button variant='secondary' onClick={()=>this.props.toggleSummaryModal()}>{this.props.t('btnnames.close')}</Button>
                            </Modal.Footer>
                        </Modal>
                    :<></>
                }
            
            </>
        )
    }
}

export default withTranslation()(withRouter(CompleteSummaryModal));