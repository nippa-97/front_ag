import React from 'react';
import { Col } from 'react-bootstrap';

import { AristoSvgMap } from './svgmap';

import './mapcontents.css';

/**
 *
 *
 * @class AristoMapViewComponent
 * @extends {React.Component}
 */
export default class AristoMapViewComponent extends React.Component{
    constructor(props){
        super(props);

        this._ismounted = false;
        
        this.state = {
            
        }
    }
      
    componentDidMount() {
        this._ismounted = true;

        if(this._ismounted){
            
        }
    }
    
    componentWillUnmount() {
        this._ismounted = false;
    }

    render(){
        return (<>
            <Col xs={12} className="aristomapview-wrapper">
                <div className='map-wrapper'>
                    <AristoSvgMap />
                </div>
            </Col>
        </>);
    }
}
