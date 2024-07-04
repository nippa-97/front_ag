import React from 'react';
import { Button, Modal, Nav, Tab, Table } from 'react-bootstrap';
import Chart from "react-apexcharts";
import { XIcon, GraphIcon, ThreeBarsIcon } from '@primer/octicons-react';
import { useTranslation } from 'react-i18next';

import { alertService } from '../../_services/alert.service';

export default React.memo(function TaskStackChart(props) {
    const { t } = useTranslation();
    //#TSK-STP-H03
    var options =  {
        chart: {
          type: 'bar',
          height: 350,
          stacked: true,
          toolbar: {
            show: false
          },
          zoom: {
            enabled: false
          },
          events: {
            dataPointSelection: (event, chartContext, config) => {
              if(props.oristackdata[config.dataPointIndex].storeDto.storeName && props.oristackdata[config.dataPointIndex].storeDto.storeName !== "Other"){
                chartClickHandler(props.oristackdata[config.dataPointIndex],(config.seriesIndex === 0?"urgent":config.seriesIndex === 1?"late":"inprogress"));
              } else{
                alertService.error("No Store Details Found");
              }
            }
          }
        },
        plotOptions: {
          bar: {
            horizontal: false,
            borderRadius: 0,
            dataLabels: {
              hideOverflowingLabels: true,
            }
          },
        },
        xaxis: {
          categories: (props.fixedstackdata.categories?props.fixedstackdata.categories:[]),
          labels: {
              show: true,
              rotate: -45,
              rotateAlways: true,
              style: {
                  colors: (props.dmode?"#2CC990":"#5128a0"),
                  fontWeight:700,
                  fontSize:12,
                  fontFamily: "'Assistant', 'SimplerPro', sans-serif",
              }
          },
          title: {
            text: (props.isRTL==="rtl"?"חנויות":"Stores"),
            offsetY: -10,
            style: {
              color: (props.dmode?"#2CC990":"#BAACE2"),
              fontSize:16,
              fontWeight:600,
              fontFamily: "'Assistant', 'SimplerPro', sans-serif",
            }
          }
        },
        yaxis: {
          labels: {
              show: true,
              minWidth: 60,
              style: {
                  colors: (props.dmode?"#2CC990":"#5128a0"),
                  fontWeight:700,
                  fontSize:12,
                  fontFamily: "'Assistant', 'SimplerPro', sans-serif",
              },
              offsetX: -30,
              formatter: (val) => {
                return parseInt(val);
              }
          },
          title: {
            text: (props.isRTL==="rtl"?"סופר":"Counts"),
            offsetX: -20,
            style: {
              color: (props.dmode?"#2CC990":"#BAACE2"),
              fontSize:16,
              fontWeight:600,
              fontFamily: "'Assistant', 'SimplerPro', sans-serif",
            }
          }
      },
        legend: {
            show: true,
            position: "top",
            fontFamily: "'Assistant', 'SimplerPro', sans-serif",
            fontWeight: 600,
            fontSize:16,
            labels: {
              colors: (props.dmode?"#2CC990":"#5128a0"),
            },
            markers: {
              radius: 12,
            },
            itemMargin: {
              horizontal: 10,
            },
            onItemClick: {
              toggleDataSeries: false
            },
        },
        fill: {
          opacity: 1
        },
        grid: {
          show: true,
          xaxis: {
              lines: {
                  show: true
              }
          },   
          yaxis: {
              lines: {
                  show: true
              }
          }, 
          padding: {
            top: -10,
            left: -10,
            bottom: -10,
          }
        },
        colors: ["#FF7600","#FF4848","#f7d460"],
    };

    var series = (props.fixedstackdata.series?props.fixedstackdata.series:[]);

    const chartClickHandler = (csobj, type) => {
      const cobj = {storeobj: csobj, state: type};
      props.handleClickChartPoint(cobj);
    }

    const tableClickHandler = (csobj, type) => {
      if(csobj.storeDto.storeName && csobj.storeDto.storeName !== "Other"){
        const cobj = {storeobj: csobj, state: type};
        props.handleClickChartPoint(cobj);
      } else{
        alertService.error("No Store Details Found");
      }
    }

    return (
        <Modal show={props.showmodal} animation={false} className={"stackchart-modal "+(props.isRTL==="rtl"?"RTL":"")} dir={props.isRTL} onHide={props.handleToggleChartView} backdrop="static" keyboard={false} >
            <Modal.Header>
                <Modal.Title>{t("STORE_TASK_PROGRESS")}</Modal.Title>
                <Button variant="secondary" size="sm" onClick={props.handleToggleChartView} className="float-right" ><XIcon size={24} /></Button>
            </Modal.Header>
            <Modal.Body>
                <Tab.Container defaultActiveKey="first">
                  <Nav variant="pills" className="stackchart-tabs">
                    <Nav.Item>
                      <Nav.Link eventKey="first"><GraphIcon size={16} /> {t("chartview")}</Nav.Link>
                    </Nav.Item>
                    <Nav.Item>
                      <Nav.Link eventKey="second"><ThreeBarsIcon size={16} /> {t("tableview")}</Nav.Link>
                    </Nav.Item>
                  </Nav>
                  <Tab.Content>
                      <Tab.Pane eventKey="first">
                        <div dir="ltr">
                          <Chart className="mchart-view" options={options} series={series} type="bar" height={420} />
                        </div> 
                      </Tab.Pane>
                      <Tab.Pane eventKey="second">
                        <Table striped bordered size="sm" className="stackchart-table">
                            <thead>
                              <tr>
                                <th>{t("STORE")}</th>
                                <th width="20%">{t("URGENT")}</th>
                                <th width="20%">{t("LATE")}</th>
                                <th width="20%">{t("IN_PROGRESS")}</th>
                              </tr>
                            </thead>
                            <tbody>
                              {props.oristackdata?props.oristackdata.map((xitem,xidx) => {
                                return <tr key={xidx}><td>{props.fixedstackdata.categories[xidx]}</td><td onClick={() => (xitem.urgentCount>0?tableClickHandler(xitem,"urgent"):null)} className={xitem.urgentCount>0?"click-link":""}>{xitem.urgentCount}</td>
                                <td onClick={() => (xitem.lateCount>0?tableClickHandler(xitem,"late"):null)} className={xitem.lateCount>0?"click-link":""}>{xitem.lateCount}</td><td onClick={() => (xitem.inProgressCount>0?tableClickHandler(xitem,"inprogress"):null)} className={xitem.inProgressCount>0?"click-link":""}>{xitem.inProgressCount}</td></tr>
                              }):<></>}
                            </tbody>
                          </Table>
                      </Tab.Pane>
                  </Tab.Content>  
                </Tab.Container>
            </Modal.Body>
        </Modal>
    )
});