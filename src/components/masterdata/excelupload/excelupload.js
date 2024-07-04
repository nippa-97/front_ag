import React from 'react';
import { Link, withRouter } from 'react-router-dom';
import { Col, Breadcrumb, Form, Button, Row } from 'react-bootstrap';
import { XIcon } from '@primer/octicons-react';

import { AcDropzone, AcViewModal } from '../../UiComponents/AcImports';
import { alertService } from '../../../_services/alert.service';
import { submitCollection } from '../../../_services/submit.service';
import { submitSets } from '../../UiComponents/SubmitSets';

import MDSidebarMenu from '../../common_layouts/mdsidebarmenu';

import excelthumbicon from '../../../assets/img/icons/xlsx.png';
import dbfilethumbicon from '../../../assets/img/icons/dbfile.png';

import './excelupload.scss';
import { withTranslation } from 'react-i18next';
import { TooltipWrapper } from '../../newMasterPlanogram/AddMethods';

//import worker from 'workerize-loader!./worker';
//const workerInstance = worker();


export class ExcelUploadComponent extends React.Component {
    _isMounted = false;
    constructor(props) {
        super(props);
        this.state = {
            uploadFileList: [], savemodalshow: false,
            floorlist: [],
            sobj: {},
        }
    }

    componentDidMount() {
        this._isMounted = true;

        if (this._isMounted) {

        }
    }

    componentWillUnmount() {
        this._isMounted = false;
    }
    //#EXL-UPL-H01 handle drop or select upload file
    handleDropImages = (ufiles) => {
        //console.log(ufiles);
        this.setState({ uploadFileList: ufiles });
    }
    //#EXL-UPL-H02 handle upload selected files
    handleUploadExcel = () => {
        if (this.state.uploadFileList && this.state.uploadFileList.length > 0) {

            var formData = new FormData();
            for (var i = 0; i < this.state.uploadFileList.length; i++) {
                formData.append("excel", this.state.uploadFileList[i]);
            }
            //console.log(formData);
            this.setState({ savemodalshow: true });
            submitSets(submitCollection.uploadExcel, formData, true, null, true).then(res => {
                //console.log(this.state.sobj);
                this.setState({ savemodalshow: false });
                if (res && res.status) {
                    alertService.success(this.props.t('EXCEL_DATA_UPLOADED_SUCCESSFULLY'));
                    this.setState({ uploadFileList: [] });
                } else {
                    // alertService.error((res && res.extra !== "" ? res.extra : this.props.t('ERROR_OCCURRED')));
                }
            });
        } else {
            alertService.error(this.props.t('ADD_EXCEL_FILE_TO_CONTINUE'));
        }
    }

    handleRemoveAddedXcel = (idx) => {
        var clist = this.state.uploadFileList;
        clist.splice(idx, 1);
        this.setState({ uploadFileList: clist });
    }
    
    render() {

        var thumbpreviews = <></>;
        
        return (<><Col xs={12} className={"main-content "+(this.props.isRTL==="rtl"?"RTL":"")} dir={this.props.isRTL}>
            <div>
                <Row>
                <MDSidebarMenu/>
                <Col xs={12} lg={10}>
                    <Breadcrumb dir="ltr">
                        {this.props.isRTL==="rtl"?<>
                        <Breadcrumb.Item active>{this.props.t('excelupload')}</Breadcrumb.Item>
                        <li className="breadcrumb-item"><Link to={"/"+this.props.HomePageVal} role="button">{this.props.t('home')}</Link></li></>:<>

                        <li className="breadcrumb-item"><Link to={"/"+this.props.HomePageVal} role="button">{this.props.t('home')}</Link></li>
                        <Breadcrumb.Item active>{this.props.t('excelupload')}</Breadcrumb.Item></>}
                    </Breadcrumb>
                    <Col className="white-container pdunit-content excelupload-content col-centered">
                        <Col xs={12} lg={9} className="col-centered">
                            {/* <h3 style={{ fontSize: "22px", fontWeight: 800 }}>{this.props.t('excelupload')}</h3> */}
                            <Col xs={12}>
                                <Form.Group as={Col} xs={12}>
                                    <AcDropzone acceptTypes={'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel, .db'} multiple={true} handleDropImage={this.handleDropImages} />
                                    <Col className="preview-thumbs"><aside>{thumbpreviews}</aside></Col>
                                </Form.Group>
                                <Col className="excelpreview-main"><ul className="list-inline">
                                    {this.state.uploadFileList && this.state.uploadFileList.length > 0?
                                    this.state.uploadFileList.map((xitem, x) => {
                                        return <li key={x} className="list-inline-item"><TooltipWrapper text={xitem.name}><div>
                                            <span className="float-right" onClick={() => this.handleRemoveAddedXcel(x)}><XIcon size={12} /></span>
                                            <img src={(xitem.type===""?dbfilethumbicon:excelthumbicon)} className="img-fluid" alt="excel thumb" /></div></TooltipWrapper></li>;
                                    }):<>
                                        <h3 className='text-center'>{this.props.t("NO_SELECTED_FILES")}</h3>
                                    </>}
                                </ul></Col>
                                <Button type="button" variant="success" size="sm" onClick={this.handleUploadExcel} className={"excelupload-link "+(this.props.isRTL==="rtl"?"float-left":"float-right")}>{this.props.t('btnnames.upload')}</Button>
                            </Col>
                            <Col id="tableau" xs={12} className="previewxcel-data d-none"></Col>
                        </Col>
                    </Col>    
                </Col>
                </Row>
            </div>
        </Col>
            <AcViewModal showmodal={this.state.savemodalshow} />
        </>);
    }
}

export default  withTranslation()(withRouter(ExcelUploadComponent));
