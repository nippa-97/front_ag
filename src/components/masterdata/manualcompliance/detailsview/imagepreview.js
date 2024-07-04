import React from "react";
import { Col, Button } from 'react-bootstrap';
import { DownloadIcon } from '@primer/octicons-react';

import samplefieldimage from '../../../assets/img/sample/0_JS245524643.jpg';

export default function ImagePreview (){
    
    return (<Col className="imagepreview-main">
        <Col className="preview-view">
            <ul className="list-inline download-links">
                <li className="list-inline-item">
                    <Button size="sm" title="Download Image"><DownloadIcon size={16}/></Button>
                </li>
                <li className="list-inline-item">
                    <Button size="sm" title="Download All Images"><DownloadIcon size={16}/> ALL</Button>
                </li>
            </ul>
            <img src={samplefieldimage} className="img-fluid" alt=""/>
        </Col>
        <ul className="list-inline">
            <li className="list-inline-item">
                <Col className="thumb-preview"><img src={samplefieldimage} className="img-fluid" alt=""/></Col>
            </li>
            <li className="list-inline-item">
                <Col className="thumb-preview"><img src={samplefieldimage} className="img-fluid" alt=""/></Col>
            </li>
        </ul>
    </Col>); 
}
