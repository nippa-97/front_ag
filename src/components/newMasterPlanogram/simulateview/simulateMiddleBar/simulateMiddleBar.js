import { Component } from 'react';
import { Col, Button, Row } from 'react-bootstrap';
import { withRouter } from 'react-router-dom';
import { withTranslation } from 'react-i18next';
import { connect } from 'react-redux';
// import { submitSets } from '../../../UiComponents/SubmitSets';
// import { submitCollection } from '../../../../_services/submit.service';
//import { alertService } from '../../../../_services/alert.service';
import './simulateMiddleBar.css';
import { XIcon } from '@primer/octicons-react';

export class simulateMiddleBar extends Component {
    constructor(props){
        super(props);

        this._isMounted = false;
        
        this.state = {
            loadedTagsList:[],
            addedTags:[],
            simulateFilterObj:{fieldCount:"",selectedTagsId:[], saleStartDate:"",saleEndDate:""}
        }
    }

    componentDidMount() {
        this._isMounted = true;

        if (this._isMounted) {
            //console.log(this.props.isRTL);
            // this.getAllTags();
        }
    }

    componentWillUnmount(){
        this._isMounted = false;
    }

    //load all tags
    /* getAllTags = () => {
        let sobj = {isReqPagination: false, type:"", tagName: ""}
        submitSets(submitCollection.searchTags, sobj).then(res => {
            if(res && res.status && res.extra){
                this.setState({
                    loadedTagsList: res.extra,
                });
            }
        });
    } */

    onChangeValues = (event, type) =>{
        var sobj = this.state.simulateFilterObj;
        if(type==="fcount"){
            sobj.fieldCount = event.target.value;
            this.setState({simulateFilterObj:sobj});
        }
        else if(type==="tagchange"){
            if(event.target.value && event.target.value > -1){
                let tags = this.state.addedTags;
                let selectedTag = this.state.loadedTagsList[event.target.value];
                let checkalreadyadded = tags.findIndex(x => x.id === selectedTag.id);
                //console.log(tags);
                if(checkalreadyadded === -1){
                    tags.push({id: selectedTag.id, tagName: selectedTag.tagName});
                    this.setState({addedTags:tags});
                    sobj.selectedTagsId = tags;
                    this.setState({simulateFilterObj:sobj});
                }
            }
        }
        else if(type==="startdate"){
            sobj.saleStartDate = event;
            this.setState({simulateFilterObj:sobj});
        }
        else if(type==="enddate"){
            sobj.saleEndDate = event;
            this.setState({simulateFilterObj:sobj});
        }
       
    }

    //remove added sim tag
    removeSimTag = (xidx) => {
        var sobj = this.state.simulateFilterObj;
        let selectedtags = this.state.addedTags;
        selectedtags.splice(xidx,1);

        this.setState({ addedTags: selectedtags });
        sobj.selectedTagsId = selectedtags;
        this.setState({simulateFilterObj:sobj});
    }

    render(){
        let viewtype = this.props.summaryViewType;
        let viewtxt = (viewtype === "cat"?this.props.t("category"):viewtype === "scat"?this.props.t("subcategory"):this.props.t("brand"));

        return(
            <Row className="simulation-MiddleBar-row">
                <Col xs={12} className={"simulation-MiddleBar-section " +(this.props.isRTL==="rtl"?"RTL":"")}>
                    <h5>{this.props.t("youre_nowediting")} <span>{viewtxt}</span> {this.props.t("LEVEL")}</h5>
                    <ul className="topbtn-list list-inline">
                        {/* <li className="list-inline-item">
                            <label className='d-inline'>{this.props.t("FIELD_COUNT")}</label>
                            <input className='d-inline' type={"number"} value={this.state.simulateFilterObj.fieldCount} onChange={(e)=>this.onChangeValues(e,"fcount")} />
                        </li>
                        <li className="list-inline-item">
                            <label className='d-inline'>{this.props.t("tags")}</label>
                            <select className='d-inline' onChange={(e)=>this.onChangeValues(e,"tagchange")} value={"-1"}>
                                <option value="-1">{this.props.t("Select_tags")}</option>
                                {this.state.loadedTagsList && this.state.loadedTagsList.length > 0?<>
                                    {this.state.loadedTagsList.map((xitem, xidx) => {
                                        return <option key={xidx} value={xidx}>{xitem.tagName}</option>
                                    })}
                                </>:<></>}
                            </select>
                        </li> */}
                        {/* <li className="list-inline-item">
                            <label className='d-inline'>{this.props.t("sale_start_date")}</label>
                            <Col className='datebox d-inline'><DatePicker showYearDropdown className="datepicker-txt" onChange={(e) => this.onChangeValues(e, "startdate")} selected={this.state.simulateFilterObj.saleStartDate} dateFormat="dd/MM/yyyy"/></Col>
                        </li>
                        <li className="list-inline-item">
                            <label className='d-inline'>{this.props.t("sale_end_date")}</label>
                            <Col className='datebox d-inline'><DatePicker showYearDropdown className="datepicker-txt" onChange={(e) => this.onChangeValues(e, "enddate")} selected={this.state.simulateFilterObj.saleEndDate} dateFormat="dd/MM/yyyy"/></Col>
                        </li> */}
                        {<li className={"list-inline-item "+(this.props.isRTL==="rtl" ? "float-left" :"float-right")}>
                            <Button variant="warning" onClick={()=>this.props.getSimulatePlanogram(this.state.simulateFilterObj)} size="sm" style={{textTransform:"uppercase"}} disabled={(this.props.categories.length > 0)?false:true}>{this.props.t("Simulate")}</Button>
                        </li>}
                    </ul>

                    {
                        this.state.addedTags.length>0 ?
                            <Col xs={12}>
                                <ul className='list-inline mpsim-tags'>
                                    {this.state.addedTags.map((xitem, xidx) => {
                                        return <li key={xidx} className='list-inline-item' title={xitem.tagName}>
                                            <span className='close-icon' onClick={() => this.removeSimTag(xidx)}><XIcon size={16} /></span>
                                            {xitem.tagName.substring(0,25)+(xitem.tagName.length > 25?"..":"")}
                                        </li>
                                    })}
                                </ul>
                            </Col>
                        :<></>
                    }
                </Col>
            </Row>
        )
    }
}

export default withTranslation()(withRouter(connect(null)(simulateMiddleBar)));

