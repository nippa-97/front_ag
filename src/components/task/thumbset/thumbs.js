import React, { Component } from 'react'
import { Col, Image, Row } from 'react-bootstrap'
import FeatherIcon from 'feather-icons-react';
import { Icons } from '../../../assets/icons/icons';

export default class thumbs extends Component {
    componentDidMount() {
       
    }
    // checking video available
    addplayubutton=()=>{
        var havevideo=false
        if(this.props.media.length){
             havevideo=this.props.media.find(x=>x.feedBackType==="video");
            
        }
        if(havevideo){
            return  <Col className="videoplay">{Icons.PLayButton("white")}</Col>
        }
      
    }
    render() {
        return (
            
                <Col md={12} style={{width:"50px"}} className="thumbtasks">
                  {this.addplayubutton()}
                                <Row >
                                {/* <Col>sdsd</Col> */}    
                        {(this.props.media.length>0 ? this.props.media.slice(0, 3).map((img, i) =>
                                <Col key={i} className="thumbimgcol">
                                    <Image className={this.props.media.slice(0, 3).length === 1 ? "oneimg" : (this.props.media.slice(0, 3).length === 2 ? "twoimg" : "threeimg"+((i<2)?"New":""))} src={img.feedBackType === "video" ? img.mediaThumUrl : (img.mediaThumUrl?img.mediaThumUrl:img.mediaUrl)}   />
                                </Col>
                            
                        )
                            : <Col className="thumbimgcol ">
                            <Col className="oneimg noimagefd dotimage"   > <FeatherIcon style={{ color:"#C4C4C4",margin: "0px 2px", }} icon="image" size={23} /></Col>
                            </Col>)}
                            </Row>
                  
                   
                </Col>
            
        )
    }
}
