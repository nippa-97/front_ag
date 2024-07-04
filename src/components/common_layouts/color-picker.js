import React from 'react';
import {Col, Dropdown, Row } from 'react-bootstrap';

// import { alertService } from '../../_services/alert.service';
import { submitSets } from '../UiComponents/SubmitSets';
import { submitCollection } from '../../_services/submit.service';
import { withTranslation } from "react-i18next";
import { SketchPicker } from 'react-color';
import { AcViewModal } from '../UiComponents/AcImports';

//const colors = ["#CD6155", "#AF7AC5", "#5499C7", "#48C9B0", "#7DCEA0", "#F7DC6F", "#E59866", "#85929E", "#DE3163", "#6495ED", "#F08080" , "#FFBF00", "#CCCCFF", "#FF7F50", "#85925E", "#F9E79F", "#F9EBEA", "#E8DAEF", "#0B5345", "#212F3C", "#6C3483"];

export class CustomColorPicker extends React.Component{
    _isMounted = false;

    constructor(props){
        super(props);
        this.state = {
            loading:false,
            type:true,
            oriColorsList:[],
            colorsList:[],
        }
    }

    componentDidMount(){
        this._isMounted = true;
    
        if(this._isMounted){    
            this.loadColors();
        }
    }

    componentWillUnmount(){
        this._isMounted = false;
    }
    
    loadColors = () =>{
        let sobj = {
            type:this.props.type,
            departmentId:this.props.departmentId,
            categoryId:this.props.categoryId
        }
        this.setState({loading: true });
        submitSets(submitCollection.loadDynamicColors, sobj, true, null, true).then(res => {
            this.setState({loading: false });
            let ccolors = []; let notUsedColors = [];
            if(res && res.status){
                for (const item of res.extra) {
                    ccolors.push(item.color);

                    if(item.isUsed===false){
                        notUsedColors.push(item.color);
                    }
                }
                this.setState({oriColorsList:res.extra});
                ccolors = ccolors.sort(a=> a);

                //console.log("original "+res.extra.length);
                var rgbArr = ccolors.map(this.hexToRgb);
                var sortedRgbArr = this.sortColors(rgbArr);
                var finalArray = sortedRgbArr.map(this.rgbToHex);
                ccolors = finalArray;
                //console.log("final "+ccolors.length);

                let sortedColorsList = [];
                for (let i = 0; i < ccolors.length; i++) {
                    let idx = this.state.oriColorsList.findIndex(x => x.color ===ccolors[i]);
                    if(idx > -1){
                        sortedColorsList.push(this.state.oriColorsList[idx]);
                    }
                }
                
                this.setState({colorsList:sortedColorsList});
                
                if(this.props.isNew===true && notUsedColors.length > 0){
                    let clength = (notUsedColors.length - 1);
                    let rndInt = Math.floor(Math.random() * clength) + 0;
                    this.handleChangeColor({hex:notUsedColors[rndInt]});
                }

            } else{
                // alertService.error(res.error?res.error:this.props.t("erroroccurred"));
            }
        });
    }

    changeType = () =>{
        this.setState({type:!this.state.type});
    }

    handleChangeColor = (colorObj) =>{
        this.props.changeColor(colorObj.hex);
    }

    handleChangeComplete = (colorObj) =>{
        this.props.changeColor(colorObj.hex);
    }

    /// sort colors
    hexToRgb(hex) {
        hex = hex.substring(1, hex.length);
        var r = parseInt((hex).substring(0, 2), 16);
        var g = parseInt((hex).substring(2, 4), 16);
        var b = parseInt((hex).substring(4, 6), 16);
        
        return [r, g, b];
    }
    
    rgbToHex(rgb) {
        return "#" + ((1 << 24) + (rgb[0] << 16) + (rgb[1] << 8) + rgb[2]).toString(16).slice(1);
    }
    
    colorDistance(color1, color2) {
        // This is actually the square of the distance but
        // this doesn't matter for sorting.
        var result = 0;
        for (var i = 0; i < color1.length; i++)
            result += (color1[i] - color2[i]) * (color1[i] - color2[i]);
        return result;
    }
    
    sortColors(colors) {
        // Calculate distance between each color
        var distances = [];
        for (var i = 0; i < colors.length; i++) {
            distances[i] = [];
            for (var j = 0; j < i; j++)
                distances.push([colors[i], colors[j], this.colorDistance(colors[i], colors[j])]);
        }
        distances.sort(function(a, b) {
            return a[2] - b[2];
        });
    
        // Put each color into separate cluster initially
        var colorToCluster = {};
        for (var k = 0; k < colors.length; k++)
            colorToCluster[colors[k]] = [colors[k]];
    
        // Merge clusters, starting with lowest distances
        var lastCluster;
        for (var x = 0; x < distances.length; x++) {
            var color1 = distances[x][0];
            var color2 = distances[x][1];
            var cluster1 = colorToCluster[color1];
            var cluster2 = colorToCluster[color2];
            if (!cluster1 || !cluster2 || cluster1 === cluster2)
                continue;
    
            // Make sure color1 is at the end of its cluster and
            // color2 at the beginning.
            if (color1 !== cluster1[cluster1.length - 1])
                cluster1.reverse();
            if (color2 !== cluster2[0])
                cluster2.reverse();
     
            // Merge cluster2 into cluster1
            cluster1.push.apply(cluster1, cluster2);
            delete colorToCluster[color1];
            delete colorToCluster[color2];
            colorToCluster[cluster1[0]] = cluster1;
            colorToCluster[cluster1[cluster1.length - 1]] = cluster1;
            lastCluster = cluster1;
        }
    
        // By now all colors should be in one cluster
        return lastCluster;
    }
    ////sort end

    render(){
        return(
            <>
                <Col xs={12} className={"custom-color-picker "+(this.props.isRTL==="rtl" ? "RTL":"LTR")}>
                    <label className="form__label">{this.props.label}<span className={"form_label_reqstar "+(this.props.isCompulsary===true?"":"d-none")}>*</span></label>
                    {/* <Col xs={12} className={"selected-color-col"} style={{background:(this.props.selectedColor?this.props.selectedColor:"#CCC")}}></Col> */}
                    <Dropdown drop='down'>
                        <Dropdown.Toggle className={"selected-color"} style={{background:(this.props.selectedColor?this.props.selectedColor:"#CCC")}}></Dropdown.Toggle>

                        <Dropdown.Menu>
                            {
                                this.state.type===true?
                                    <>
                                        {/*
                                            this.state.colorsList.length>0 ?
                                                <Col xs={12} className="picker-col">
                                                    <CirclePicker width={"240px"} colors={this.state.colorsList} onChange={ this.handleChangeColor } />
                                                </Col>
                                            :
                                            <Col xs={12} className="no-colors-msg">{this.props.t("COLORS_NOT_AVAILABLE")}</Col>
                                        */}

                                        <Col xs={12} className="picker-col">
                                            <Row>
                                                <Col xs={12} className="used-colors-lbl d-inline"><div></div>&nbsp;{this.props.t("USED_COLORS")}</Col>
                                                {
                                                    this.state.colorsList.map((item,index)=>{
                                                        return(
                                                            <Col xs={3} key={index} className="color-box-main ">
                                                                <Col xs={12} className={"color-circle "+(this.props.selectedColor===item.color ? "selected":"")} onClick={ ()=> this.handleChangeColor({hex:item.color}) } style={{background:item.color}}>
                                                                    {(item.isUsed===true ? <div className='used-lbl'></div>:<></>)}
                                                                </Col>
                                                            </Col>
                                                        )
                                                    })
                                                }
                                                
                                            </Row>
                                        </Col>
                                    </>
                                :
                                    <Col xs={12} className="picker-col sketch-picker">
                                        <SketchPicker 
                                            width={"240px"}
                                            height = {"100px"}
                                            color={this.props.selectedColor}
                                            onChange={ this.handleChangeComplete } 
                                            disableAlpha ={true}
                                        />
                                    </Col>
                            }


                            <Col className='footer' onClick={()=>this.changeType()}>
                                {this.state.type===true?this.props.t("PICK_CUSTOM_COLOR_TXT"):this.props.t("btnnames.back")}
                            </Col>
                        </Dropdown.Menu>
                    </Dropdown>
                </Col>
                
                <AcViewModal showmodal={this.state.loading} message={this.props.t('PLEASE_WAIT')} />
            </>
        )
    }
}

export default  withTranslation()(CustomColorPicker);