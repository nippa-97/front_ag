import React, { Component } from 'react';
import { Card, Col, Row } from 'react-bootstrap';
import { withTranslation } from 'react-i18next';
import { withRouter } from 'react-router-dom';
import FeatherIcon from 'feather-icons-react';

import { chainStatus, DateOrderStatus } from '../../../../enums/saleslogEnums';

import "./salelogDashboardTiles.scss";
import { CalendarIcon } from '@primer/octicons-react';

class SalelogDashboardTiles extends Component {
    render() {
        const {TiledateOrder,TileChainstatus,TileAllbranchsync,TileCurrbranchsync}=this.props
        var isoutofOrder=(TiledateOrder!==null&&TiledateOrder.status===DateOrderStatus.OUT_OF_ORDER)?true:false
        var isHaveissue=(TileChainstatus!==null&&TileChainstatus.status===chainStatus.HAVE_ISSUE)?true:false
        return (
            <Col className="salelog-dashboard-tiles">
                <Col>
                    <Row  xs={1} md={4} className="g-4">
                       
                            <Col>
                                <Card className={isoutofOrder?"danger-card":"success-card"}>
                                    <Card.Body >
                                    <Card.Title>{isoutofOrder?this.props.t("DATES_OUT_OF_ODER"):this.props.t("DATES_ORDER")}</Card.Title>
                                    <Card.Text>
                                        <span className='iconview'><FeatherIcon icon="x-square" size={22} /></span>
                                        {isoutofOrder?TiledateOrder.count:this.props.t("IN_ORDER")}
                                    </Card.Text>
                                    </Card.Body>
                                </Card>
                            </Col>
                            <Col>
                                <Card className={isHaveissue?"danger-card":"success-card"}>
                                    <Card.Body>
                                    <Card.Title>{this.props.t("ISSUES")}</Card.Title>
                                    <Card.Text>
                                        <span className='iconview'><FeatherIcon icon="file-minus" size={22} /></span>
                                        {isHaveissue?TileChainstatus.count:this.props.t("NO_ISSUE")}
                                    </Card.Text>
                                    </Card.Body>
                                </Card>
                            </Col>
                            <Col>
                                <Card>
                                    <Card.Body>
                                    <Card.Title>{this.props.t("CURRENT_BRANCH_LAST_SYNC")}</Card.Title>
                                    <Card.Text>
                                        <span className='iconview'><CalendarIcon size={20} /></span>
                                        {TileCurrbranchsync!==null?TileCurrbranchsync.date!=="Invalid date"?TileCurrbranchsync.date:this.props.t("NO_DATA"):""}
                                    </Card.Text>
                                    </Card.Body>
                                </Card>
                            </Col>
                            <Col>
                                <Card>
                                    <Card.Body>
                                    <Card.Title>{this.props.t("ALL_BRANCH_LASET_SYNC")}</Card.Title>
                                    <Card.Text>
                                        <span className='iconview'><CalendarIcon size={20} /></span>
                                        {TileAllbranchsync!==null?TileAllbranchsync.date!=="Invalid date"?TileAllbranchsync.date:this.props.t("NO_DATA"):""}
                                    </Card.Text>
                                    </Card.Body>
                                </Card>
                            </Col>
                    </Row>
                </Col>
            </Col>
        );
    }
}

export default withTranslation()(withRouter(SalelogDashboardTiles));