import React, { Component } from 'react';
import { Col, Image, Row } from 'react-bootstrap';
import { Icons } from '../../../../../../assets/icons/icons';
import ReactImageVideoLightbox from "react-image-video-lightbox";
class QuestionnaireImage extends Component {
  componentDidMount() {

  }
  constructor(props) {
    super(props);
    this.state = {
      imagesdataready: false,
      data: [],
      mediaStartIndex: 0
    }
  }
  // checking video available and add play button
  addplayubutton = () => {
    var havevideo = false
    if (this.props.media && this.props.media.length) {
      havevideo = this.props.media.find(x => x.mediaType === "video");
    }
    if (havevideo) {
      return <Col className="videoplay canclickimg" onClick={(e) => this.openimagepreview(0, this.props.media)}>{Icons.PLayButton("white")}</Col>
    }
  }
  //image preview object set
  openimagepreview = (index, media) => {
    var newlist = [];
    media.forEach(element => {
      if (element.mediaType === "photo") {
        newlist.push({ url: element.url, type: "photo" })
      }
      if (element.mediaType === "video") {
        newlist.push({ url: element.url, type: "video" })
      }
    });
    this.setState({ data: newlist, mediaStartIndex: index }, () => {
      this.setState({ imagesdataready: true })
      this.props.handlelightbox();
    })
  }
  handlelightbox=()=>{
    this.setState({ imagesdataready: false,})
    this.props.handlelightbox()
  }
  render() {
    return (

      <Col md={12} style={{ width: "50px" }} className="thumbtasks">
        {/* {this.addplayubutton()} */}
        <Row >
          {(this.props.media && this.props.media.length > 0 ? this.props.media.slice(0, 3).map((img, i) =>
            <Col key={i} className="thumbimgcol canclickimg">
              <Image onClick={(e) => this.openimagepreview(i, this.props.media)} className={this.props.media && this.props.media.slice(0, 3).length === 1 ? "oneimg" : (this.props.media.slice(0, 3).length === 2 ? "twoimg" : "threeimg" + ((i < 2) ? "New" : ""))} src={img.mediaType === "video" ? img.thumbImageurl : (img.thumbImageurl?img.thumbImageurl:img.url)} />
            </Col>
          )
            : <Col className="thumbimgcol">
              {/* <Col className="oneimg noimagefd dotimage"   > <FeatherIcon style={{ color:"#C4C4C4",margin: "0px 2px", }} icon="image" size={23} /></Col> */}
            </Col>)}
        </Row>

        {(this.props.lightboxOpen && this.state.imagesdataready) && (
          <div className="lightboximage">
            <ReactImageVideoLightbox
            data={this.state.data}
            startIndex={this.state.mediaStartIndex}
            showResourceCount={true}
            onCloseCallback={() => this.handlelightbox()}
          />
          </div>
        )}
      </Col>
    )
  }
}

export default QuestionnaireImage;