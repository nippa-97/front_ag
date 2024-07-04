import React, { Component } from 'react'
import { Button, Modal } from 'react-bootstrap'
import './MPAlertBox.css'

class MPAlertBox extends Component {
    constructor(props) {
        super(props)

        this.state = {
            
        }
    }

    render() {
        var {Normal_text,bold_text,successbtnText,successBoderText,icon,List,ListTitle}=this.props
        return (
            <Modal className={"MPAlertBox"+(List?" Listhave":"")} show={this.props.isshow} onHide={()=>this.props.handleShowHide(false)}
                size="md" aria-labelledby="contained-modal-title-vcenter" centered >
                <Modal.Header closeButton>
                    <Modal.Title></Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div className='messagediv'>
                        {icon?<div className='icondiv'>{icon}</div>:<></>}
                        {Normal_text||bold_text?<h4>
                            {(Normal_text&&Normal_text!=="")?<span className='Normal_text'> {Normal_text}.{" "}</span>:<></>}
                            <br />
                            {(bold_text&&bold_text!=="")?<span className='bold_text'>{bold_text}</span>:<></>}
                        </h4>:<></>}
                        {List&&List.length>0?<div className='listing'>
                            {(ListTitle!=="")?<div className='bold_text'><span>{ListTitle}</span></div>:<></>}
                            <ul>
                            {List.map((item,i)=><li key={i}>{item}</li>)}
                            </ul>
                        </div>:<></>}
                    </div>
                </Modal.Body>
                <Modal.Footer>
                    {successBoderText?<Button  className='btn noaction' onClick={()=>this.props.successBoderAction()}>{successBoderText}</Button>:<></>}
                    {successbtnText?<Button className='btn action'  onClick={()=>this.props.successbtnAction()}>{successbtnText}</Button>:<></>}
                </Modal.Footer>
            </Modal>
        )
    }
}

export default MPAlertBox