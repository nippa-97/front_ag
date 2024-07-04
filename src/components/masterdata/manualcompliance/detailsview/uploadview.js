import React from "react";
import { Col, Table, Form, Button } from 'react-bootstrap';
import { XIcon } from '@primer/octicons-react';

import { AcDropzone } from '../../../UiComponents/AcImports';

//import samplefieldimage from '../../../assets/img/sample/0_JS245524643.jpg';

export default class UploadImageview extends React.Component{
    constructor(props) {
        super(props);
        this.state = {
            uploadFileList: [],
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

    handleDropImages = (xfiles) => {
        //console.log(xfiles);
        var cfileslist = this.state.uploadFileList;
        var nfileslist = cfileslist.concat(xfiles);
        this.setState({ uploadFileList: nfileslist });
    }

    handleRemoveAddedImage = (xidx) => {
        var cfileslist = this.state.uploadFileList;
        cfileslist.splice(xidx,1);
        this.setState({ uploadFileList: cfileslist });
    }

    render() {
        return (<><Col className="imagepreview-main">
            {/* <Col className="preview-view">
                <img src={samplefieldimage} className="img-fluid" alt=""/>
            </Col>*/}

            <Col className="excelpreview-main"><ul className="list-inline">
                {this.state.uploadFileList && this.state.uploadFileList.map((xitem, x) => {
                    return <li key={x} className="list-inline-item"><div title={xitem.name}>
                        <span className="float-right" onClick={() => this.handleRemoveAddedImage(x)}><XIcon size={12} /></span>
                        <img src={xitem.preview} className="img-fluid" alt="preview thumb" /></div></li>;
                })}
            </ul></Col>

            <AcDropzone acceptTypes={"image/png, image/jpeg, image/jpg, image/webp, image/avif"} multiple={true} handleDropImage={this.handleDropImages} />


            <Col className="form-inline add-products-form">
                <Form.Control placeholder="NO." style={{width:"50px"}} />
                <Form.Control placeholder="Product" />
                <Form.Control placeholder="Changes" />
                <Button type="button" variant="primary" className="search-link filter-btn">ADD</Button>
            </Col>

            <Table bordered className="products-list-table" >
                <thead>
                    <tr>
                        <th>NO.</th><th>Product</th><th>Changes</th><th width="25px"></th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>01</td><td>Product 1</td>
                        <td>
                            <ul className="list-inline tags">
                                <li className="list-inline-item">
                                    <label>Rotate <XIcon size={14} /></label>
                                </li>
                                <li className="list-inline-item">
                                    <label>Move <XIcon size={14} /></label>
                                </li>
                            </ul>
                        </td>
                        <td><XIcon size={14} /></td>
                    </tr>
                    <tr>
                        <td>02</td><td>Product 2</td>
                        <td>
                            <ul className="list-inline tags">
                                <li className="list-inline-item">
                                    <label>Rotate <XIcon size={14} /></label>
                                </li>
                            </ul>
                        </td>
                        <td><XIcon size={14} /></td>
                    </tr>
                </tbody>
            </Table>

        </Col></>);    
    }
}
