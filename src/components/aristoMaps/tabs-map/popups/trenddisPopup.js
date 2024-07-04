import React from 'react';
import { withTranslation } from 'react-i18next';
import { withRouter } from 'react-router-dom';
import { Badge, Button, ListGroup } from 'react-bootstrap';

class TrendsDiscoverPopup extends React.Component {
    constructor(props) {
        super(props)

        this.state = {
            
        }
    }

    componentDidMount(){
        // console.log(this.props.trendDisSelectedCard);
    }
    
    render() {
        let { trendDisSelectedCard } = this.props;

        return (
            <div className='trenddiscover-popup'>
                <div className='middle'>
                    <ListGroup>
                        <ListGroup.Item>
                            {trendDisSelectedCard.name} <Badge bg={trendDisSelectedCard.trendType === "Good"?"success":"danger"}>{(trendDisSelectedCard.trendType === "Good"?"+":"-")+" "+trendDisSelectedCard.trend}%</Badge>
                        </ListGroup.Item>
                        <ListGroup.Item>
                            Rest <Badge bg={trendDisSelectedCard.trendType === "Good"?"danger":"success"}>{(trendDisSelectedCard.trendType === "Good"?"-":"+")+" "+trendDisSelectedCard.restTotal}%</Badge>
                        </ListGroup.Item>
                    </ListGroup>
                </div>
                <div className='buttons-list'>
                    <Button variant='outline-success' size='sm'>{this.props.t("Execute")}</Button>
                    <Button variant='outline-danger' size='sm' onClick={() => this.props.removeTrendsDiscover()}>{this.props.t("Dismiss")}</Button>
                    <Button variant='primary' size='sm'>{this.props.t("Create_AUI_Version")}</Button>
                </div>
            </div>
        )
    }
}

export default withTranslation()(withRouter(TrendsDiscoverPopup))