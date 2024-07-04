import { Component } from 'react';
import { withRouter,  } from 'react-router-dom';
import { withTranslation } from 'react-i18next';
import { Button  , Col, Modal, Table} from 'react-bootstrap';

import "./hierachyResolve.css";
import moment from 'moment';
import { AcViewModal } from '../../../UiComponents/AcImports';
import { submitSets } from '../../../UiComponents/SubmitSets';
import { submitCollection } from '../../../../_services/submit.service';
import { alertService } from '../../../../_services/alert.service';

function convertDateTimeYMD(MyDate_String_Value, type) {
    var value = new Date(MyDate_String_Value);
    var rvalue=moment(value).format('YYYY-MM-DD HH:mm:ss')
    return rvalue;
}

export class NoLongerValidLog extends Component {
    _isMounted = false;
    constructor(props) {
        super(props)
        this.state = {
            loading:false,
            showLogModal:false,
            logdata:[],
        }
    }

    componentDidMount(){
        this._isMounted = true;
        if(this._isMounted){
            this.loadData();
        }
    }

    componentWillUnmount(){
        this._isMounted = false;
    }

    loadData = () =>{
        this.setState({loading:true,});
        submitSets(submitCollection.importHierarchyIssueChangedLog, "?importHierarchyIssueId="+this.props.importHierarchyIssueId, null, null, true).then(res => {
            this.setState({loading:false});
            if(res && res.status){
                if(res.extra.length > 0){
                    this.setState({logdata: res.extra, showLogModal:true});
                }
                else{
                    alertService.warn(this.props.t("NO_DATA"));
                    this.props.toggleNoLongerValidLogModal();
                }
                //this.setState({logdata: res.extra, showLogModal:true});
            }
            else{
                // alertService.error(res.error ? res.error :this.props.t("erroroccurred"));
                this.props.toggleNoLongerValidLogModal();
            }
        });
    }

    

    render(){
        var issueObj = this.props.issue;
        var header_depname = (issueObj.issueDepartment ?("D : "+issueObj.issueDepartment.departmentName) :"");
        var header_catname = (issueObj.issueCategory ?("C : "+issueObj.issueCategory.categoryName) :"");
        var header_scatname = (this.props.subcat ?("SC : "+this.props.subcat.subCategoryName) :"");
       
        return(
           <>
                <Modal dir={this.props.isRTL} size='lg' show={this.state.showLogModal} className={"nolongervalidlog-modal "+(this.props.isRTL==="rtl" ? "RTL":"LTR")} onHide={ e => { this.props.toggleNoLongerValidLogModal(null) }} backdrop="static" animation={false}>
                    <Modal.Header>
                        <Modal.Title>
                            <div>{this.props.logObj ? this.props.logObj.description : this.props.t("AFFETCED_CHANGES")}</div>
                            <small>{header_depname+" | "+header_catname+" | "+header_scatname}</small>
                        </Modal.Title>
                    </Modal.Header> 
                    <Modal.Body>
                        <Col className='white-container'>
                            <Table className='filter-table' size='sm'>
                                <thead>
                                    <tr>
                                        <th>{this.props.t("USER_NAME")}</th>
                                        <th>{this.props.t("DESCRIPTION")}</th>
                                        <th>{this.props.t("date")}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {
                                        this.state.logdata.map((item,index)=>{
                                            return(
                                                <tr key={index}>
                                                    <td>{item.userFirstName + " "+item.userLastName}</td>
                                                    <td>{item.description}</td>
                                                    <td>{(item.changedDate? convertDateTimeYMD(item.changedDate):"-")}</td>
                                                </tr>
                                            )
                                        })
                                    }
                                </tbody>
                            </Table>
                        
                        </Col>

                        
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant='secondary' className='reset' onClick={()=>this.props.toggleNoLongerValidLogModal()}>{this.props.t('btnnames.close')}</Button>
                    </Modal.Footer>
                </Modal>
                

                <AcViewModal showmodal={this.state.loading}/>
           </>

                
        )
    }

}

export default withTranslation()(withRouter(NoLongerValidLog));