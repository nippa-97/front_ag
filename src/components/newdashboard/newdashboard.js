import React, { useState } from "react";
import { withRouter } from "react-router-dom";
import {Col,Row,Table,Form,Modal,Button,Collapse,InputGroup, FormSelect,} from "react-bootstrap"; //Dropdown
import { withTranslation } from "react-i18next";
import i18n from "i18next";
import { connect } from "react-redux";
import {XIcon,ChevronDownIcon,PencilIcon,SearchIcon,PlusIcon, LinkExternalIcon} from "@primer/octicons-react";
import { confirmAlert } from "react-confirm-alert";
//import randomColor from 'randomcolor';

import { submitSets } from "../UiComponents/SubmitSets";
import { submitCollection } from "../../_services/submit.service";
import { convertDate, roundOffDecimal, hexToRGB, dateRangeList, numberWithCommas, preventinputToString, preventinputotherthannumbers } from "../../_services/common.service";
import { alertService } from "../../_services/alert.service";

import { searchSetAction } from "../../actions/dashboard/dashboard_action";
import { PDviewDataAction, viewSetAction, viewFieldAction, setFieldStoreAction } from '../../actions/planogram/planogram_action';

import "react-datepicker/dist/react-datepicker.css";
import "./newdashboard.scss";

import loadinggif from "../../assets/img/loading-sm.gif";

//import MainDynamicChart from './maindynamicchart';
import ChartjsDynamicChart from "./chartjsdynamicchart";
import NewGoalModal from "./newgoalmodal";

/**
 * shows table row with collapse option each row in changes modal
 * using seperate functional component to toggle collapse option available for each row
 * @param {*} props
 * @return {*} 
 */
function FieldSubList(props) {
  //toggle collapse
  const [open, setOpen] = useState(false);

  return (
    <tr key={props.idx}>
      <td width="39%">
        <Col className="trrow-txt" onClick={() => setOpen(!open)}>
          {props.item.departmentName}
          <span className="float-right" style={{ marginTop: "-3px" }}>
            <ChevronDownIcon size={12} />
          </span>
        </Col>
        <Collapse in={open} animation="false" className="trrow-collapse">
          <Col>
            <ul>
              {props.item.productChanges &&
                props.item.productChanges.length > 0 ? (
                <>
                  {props.item.productChanges.map((xitem, xidx) => {
                    return (
                      <li key={xidx}>
                        <label>{xitem.barcode ? xitem.barcode : "-"}</label><br/>
                        <label className="changeprod-name">{xitem.productName ? xitem.productName : "-"}</label>
                        <small className={xitem.productChangeType}>
                          {props.t(xitem.productChangeType)}
                        </small>
                      </li>
                    );
                  })}
                </>
              ) : (
                <></>
              )}
            </ul>
          </Col>
        </Collapse>
      </td>
    </tr>
  );
}

/**
 * this component using to show sales dashboard details with chart using MainDynamicChart sub component to show chart data
 * see documentation
 *
 * @class DashboardComponent
 * @extends {React.Component}
 */
export class NewDashboardComponent extends React.Component {

  _isMounted = false;
  constructor(props) {
    super(props);
    this.state = {
      //search objects
      chartSearchObj: this.getDefaultSearchObj(),
      tableSearchObj: null,

      datestBetweenRange: [],
      linecolors: ["#FB3569","#00C1D4","#FF7600","#FD2EB3","#B61AAE","#00BBF0","#F43B86","#FF4C29","#FFAA4C","#5D8233","#7868E6","#FF6363","#005F99","#799351","#F37121","#B590CA",],
      conditionslist: {Equal: "equal",NotEqual: "notequal",GreaterThan: "greaterthan",LessThan: "lesserthan",},
      goalConditionColors: {Equal: "#005792",NotEqual: "#FF7600",GreaterThan: "#1FB57B",LessThan: "#FF2442",},
      
      //loaded data objects
      oridLineData: [],
      loadedChartData: null,
      chainChartData: null,
      hideChainList: [],
      loadingChartDetails: false,
      loadedStoreData: [],
      isStoreDataLoading: true,
      loadedDeptData: [],
      isDeptDataLoading: true,
      loadedProdData: [],
      isProdDataLoading: true,
      annotationsList: {},

      //selected table objects
      selectedStore: null,
      selectedDept: null,
      selectedProd: null,

      //layout changes
      selectedLayout: null,
      isShowChangesModal: false,
      loadedLayoutChanges: [],

      //goal changes
      isShowGoalModal: false,
      goalsSearchObj: { filterName: "", filterStatus: "Pending" },
      goalList: [],
      editFilterObj: null,
      mainDepartments: [],
      mainStores: [],
      mainStoreTags: [],
      goalFilterProd: {storeId: null,departmentId: null,isReqPagination: true,startIndex: 0,maxResult: 15,},
      mainProds: [],
      mainSelProds: [],
      
      //custom filters
      isCustomerFiltersUse: false,
      currentCutomFilerId: null
    };
  }

  componentDidMount() {
    this._isMounted = true;

    if (this._isMounted) {
      //default search objects
      var defsearchobj = this.getDefaultSearchObj();
      var deftablesearch = this.getDefaultTableObj();
      var defSelStore = null;
      var defSelDept = null;
      var defSelProd = null;

      //#DBD-H01 if redux saved object available
      if (this.props.dashState && this.props.dashState.dashboardSearch) {
        //if chart search data available
        if (this.props.dashState.dashboardSearch.chartSearchObj) {
          defsearchobj = this.props.dashState.dashboardSearch.chartSearchObj;
        }
        //if table search data available
        if (this.props.dashState.dashboardSearch.tableSearchObj) {
          let ctablesobj = this.props.dashState.dashboardSearch.tableSearchObj;
          if (ctablesobj.dashboardFilterResultType && ctablesobj.dashboardResultCount) {
            deftablesearch = this.props.dashState.dashboardSearch.tableSearchObj;
          }
        }
        //if search selected store from bottom table available
        if (this.props.dashState.dashboardSearch.selectedStore) {
          defSelStore = this.props.dashState.dashboardSearch.selectedStore;
        }
        //if search selected department from bottom table available
        if (this.props.dashState.dashboardSearch.selectedDept) {
          defSelDept = this.props.dashState.dashboardSearch.selectedDept;
        }
        //if search selected product from bottom table available
        if (this.props.dashState.dashboardSearch.selectedProd) {
          defSelProd = this.props.dashState.dashboardSearch.selectedProd;
        }
      }

      this.setState({ chartSearchObj: defsearchobj, tableSearchObj: deftablesearch, selectedStore: defSelStore, selectedDept: defSelDept, selectedProd: defSelProd }, () => {
          if (this.state.chartSearchObj.filterId !== 0) {
            this.setState({ isCustomerFiltersUse: true })
          }

          //onload set default search from/todates to search object
          this.handleChangeSearch("dateRange", defsearchobj.dateRange, true);
          //get goal masterdata
          this.loadFilterMasterdata();
      });
    }
  }

  componentWillUnmount() {
    this._isMounted = false;
  }
  
  //get default search object
  getDefaultSearchObj = () => {
    return {
      saleType: "salePerFace",
      isReqChainChart: true,
      fromDate: new Date(new Date().setDate(new Date().getDate() - 14)),
      endDate: new Date(),
      dateRange: 1,
      isShowTimeRange: true,
      isShowVersions: false,
      storeId: "",
      departmentId: "",
      productId: "",
      filterId: 0,
      filterName: "",
      dashboardFilterResultType: "All",
      dashboardResultCount: 3,
    };
  };
  //reset all dashboard search filters
  handleResetAll = () => {
    this.handleChangeSearch("dashboardFilterResultType", "All", true);

    this.setState({
      //search objects
      chartSearchObj: this.getDefaultSearchObj(),
      tableSearchObj: this.getDefaultTableObj(),
      annotationsList: [],
      //selected table objects
      selectedStore: null,
      selectedDept: null,
      selectedProd: null,
      //custom filters
      isCustomerFiltersUse: false,
      currentCutomFilerId: null
    })
    
    this.handleChangeTableRow(1, this.state.selectedStore, false);
    this.handleChangeTableRow(2, this.state.selectedDept, false);
    this.handleChangeTableRow(3, this.state.selectedProd, false);
  }
  //get default table search object
  getDefaultTableObj = () => {
    return { storeId: "", departmentId: "", productId: "", dashboardFilterResultType: "All", dashboardResultCount: 3 };
  }
  //DBD-H01 load filter master data list
  loadFilterMasterdata = (pdata) => {
    //load all departments
    submitSets(submitCollection.getDepartments, true).then((res) => {
      this.setState({
        mainDepartments: res.extra && res.extra.length > 0 ? res.extra : [],
      });
    });
    //load all stores
    const getstoredata =
      pdata && pdata["storelist"] ? pdata["storelist"] : false;
    if (getstoredata) {
      this.setState({
        mainStores: getstoredata && getstoredata.length > 0 ? getstoredata : [],
      });
    } else {
      submitSets(submitCollection.getStores, true).then((res) => {
        this.setState({
          mainStores: res.extra && res.extra.length > 0 ? res.extra : [],
        });
      });
    }
    //load all tags
    submitSets(submitCollection.getStoreTags, true).then((res) => {
      this.setState({
        mainStoreTags: res.extra && res.extra.length > 0 ? res.extra : [],
      });
    });

    this.getAllFilters(true);
  };
  //reset goal search filters
  resetGoalSearchFilters = (isedit, cobj) => {
    //update annotation details if edit
    const cannolist = this.state.annotationsList;
    if (isedit && cannolist[cobj.filterId]) {
      cannolist[cobj.filterId].yMin = cobj.value;
      cannolist[cobj.filterId].yMax = cobj.value;
    }

    this.setState({ loadingChartDetails: isedit ? false : true }, () => {
      setTimeout(() => {
        this.setState(
          {
            goalsSearchObj: { filterName: "", filterStatus: "Pending" },
            annotationsList: cannolist,
            loadingChartDetails: true,
          },
          () => {
            this.getAllFilters();
          }
        );
      }, 300);
    });
  };
  //changee goal search filters
  changeGoalSearchFilters = (cval, ckey,e) => {
    const cfilterobj = this.state.goalsSearchObj;
    if(ckey === "filterName"){
      if(!preventinputToString(e,e.target.value,(this.props.t('Character.filter_name')))){
        e.preventDefault()
        return
     }
    }

    cfilterobj[ckey] = cval;

    this.setState({ goalsSearchObj: cfilterobj });

  };
  //load all filters
  getAllFilters = (isonload) => {
    submitSets(submitCollection.dashboardFiltersFind, this.state.goalsSearchObj, true).then((res) => {
      const cgoallist = res.status && res.extra && res.extra.length > 0 ? res.extra : [];

      const csearchobj = this.state.chartSearchObj;
      const cannolist = this.state.annotationsList;

      if (isonload) {
        if (csearchobj.filterId && csearchobj.filterId > 0) {
          const cgoalitem = cgoallist.find((x) => x.filterId === csearchobj.filterId);

          if (cgoalitem) {
            cannolist[csearchobj.filterId] = { type: "line", yMin: cgoalitem.value, yMax: cgoalitem.value, borderColor: this.state.goalConditionColors[cgoalitem.condition], borderWidth: 2,
              label: { content: (ctx) => (this.props.t(this.state.conditionslist[cgoalitem.condition]) + ": " + cgoalitem.filterName),
                enabled: true, position: "end", yPadding: 3,
                backgroundColor: hexToRGB( this.state.goalConditionColors[cgoalitem.condition],  0.8 ),
                borderRadius: 1,
              },
            };
          }
        }
      }

      this.setState({ goalList: cgoallist, annotationsList: cannolist });
    });
  };
  //change product search filters
  changeProdSearchFilters = (ctype, cval) => {
    const cfilterobj = JSON.parse(JSON.stringify(this.state.goalFilterProd));
    cfilterobj[ctype] = cval;

    if (ctype === "storeId") {
      cfilterobj["departmentId"] = null;
    }

    this.setState({ goalFilterProd: cfilterobj }, () => {
      this.loadFilterProductdata();
    });
  };
  //load product master data list
  loadFilterProductdata = () => {
    this.setState({ mainProds: [], mainSelProds: [] });
    submitSets(
      submitCollection.findAllProductsOfSpecificStoreOrDepartment,
      this.state.goalFilterProd,
      true
    ).then((res) => {
      const cextraprods = res.extra && res.extra.length > 0 ? res.extra : [];
      const csellist = cextraprods.map((xitem, xidx) => {
        return {
          value: xidx,
          label:
            (xitem.brandName && xitem.brandName !== ""
              ? xitem.brandName + " "
              : "- ") + xitem.productName,
        };
      });
      this.setState({ mainProds: cextraprods, mainSelProds: csellist });
    });
  };
  /*
   * onclick table row or remove toggle lable this function handles store/dept/prod object in state
   * using params type,obj. type = 1:store/ 2:department/ 3:product, obj selecting item object
   */
  handleChangeTableRow = (type, obj, isReset) => {
    var cchartsearchobj = this.state.chartSearchObj;
    var ctablesearchobj = this.state.tableSearchObj;

    if (!isReset) {
      return false;
    } else if (cchartsearchobj.filterId && cchartsearchobj.filterId > 0) {
      alertService.error(this.props.t("afilterselected"));
      return false;
    }

    //if type 1:store
    if (type === 1) {
      var newstoreobj = null;
      if (
        !this.state.selectedStore ||
        (this.state.selectedStore &&
          this.state.selectedStore.storeId !== obj.storeId)
      ) {
        //check already added with same object toggle and removes it
        newstoreobj = obj;
      }
      ctablesearchobj.storeId = newstoreobj ? newstoreobj.storeId : "";
      this.setState(
        { selectedStore: newstoreobj, tableSearchObj: ctablesearchobj },
        () => {
          this.filterSearchData();
        }
      );
    } else if (type === 2) {
      //type 2: department
      if (
        !this.state.selectedDept &&
        this.state.selectedProd &&
        this.state.selectedProd.departmentId !== obj.departmentId
      ) {
        //check selected dept available and its matching selected product dept id
        alertService.error(this.props.t("SELDEPT_AVAILABLE"));
        return false;
      }
      var newdeptobj = null;
      if (
        !this.state.selectedDept ||
        (this.state.selectedDept &&
          this.state.selectedDept.departmentId !== obj.departmentId)
      ) {
        //check already added with same object toggle and removes it
        newdeptobj = obj;
      }
      //find department object avaiable or product object available
      cchartsearchobj.departmentId = newdeptobj
        ? newdeptobj.departmentId
        : this.state.selectedProd
          ? this.state.selectedProd.departmentId
          : "";
      ctablesearchobj.departmentId = newdeptobj
        ? newdeptobj.departmentId
        : this.state.selectedProd
          ? this.state.selectedProd.departmentId
          : "";

      this.setState(
        {
          selectedDept: newdeptobj,
          tableSearchObj: ctablesearchobj,
          chartSearchObj: cchartsearchobj,
        },
        () => {
          this.filterSearchData();
        }
      );
    } else {
      //type 3: product
      var newprodobj = null;
      if (
        !this.state.selectedProd ||
        (this.state.selectedProd &&
          this.state.selectedProd.prodid !== obj.prodid)
      ) {
        //check already added with same object toggle and removes it
        newprodobj = obj;
      }
      //set product id
      cchartsearchobj.productId = newprodobj ? newprodobj.productId : "";
      ctablesearchobj.productId = newprodobj ? newprodobj.productId : "";
      //set product department id or selected department object id
      cchartsearchobj.departmentId = newprodobj
        ? newprodobj.departmentId
        : this.state.selectedDept
          ? this.state.selectedDept.departmentId
          : "";
      ctablesearchobj.departmentId = newprodobj
        ? newprodobj.departmentId
        : this.state.selectedDept
          ? this.state.selectedDept.departmentId
          : "";

      this.setState(
        {
          selectedProd: newprodobj,
          tableSearchObj: ctablesearchobj,
          chartSearchObj: cchartsearchobj,
        },
        () => {
          this.filterSearchData();
        }
      );
    }
  };
  /*
   * #DBD-H02 onchange search object items this using to change object in state and search again
   * using params type,cval. type = search object key, cval = current changing value
   */
  handleChangeSearch = (type, cval, isonloading) => {
    //validate value not minus
    if (type === "dashboardResultCount" && cval <= 0) {
      return false;
    }

    const csobj = this.state.chartSearchObj;
    const ctsobj = this.state.tableSearchObj;
    csobj[type] = cval;
    ctsobj[type] = cval;

    //if daterange set from/to dates
    if (type === "dateRange") {
      var tdate = new Date();
      var fdate = new Date();
      var backdate = "";

      if (parseInt(cval) === 1) {
        backdate = new Date(fdate.setDate(fdate.getDate() - 14));
      } else if (parseInt(cval) === 2) {
        backdate = new Date(fdate.setMonth(fdate.getMonth() - 1));
      } else if (parseInt(cval) === 3) {
        backdate = new Date(fdate.setMonth(fdate.getMonth() - 3));
      } else if (parseInt(cval) === 4) {
        backdate = new Date(fdate.setMonth(fdate.getMonth() - 6));
      } else if (parseInt(cval) === 5) {
        backdate = new Date(fdate.setFullYear(fdate.getFullYear() - 1));
      }

      csobj["fromDate"] = backdate;
      csobj["endDate"] = tdate;
    }
    const cursearchobj = JSON.parse(JSON.stringify(csobj));
    const datelist = this.getDatesBetweenRange(new Date(cursearchobj.fromDate), new Date(cursearchobj.endDate));

    this.setState( { chartSearchObj: csobj, datestBetweenRange: datelist }, () => {
        if (type !== "isShowTimeRange" && type !== "isShowVersions") {
          this.filterSearchData(isonloading);
        }
      }
    );
  };
  //#DBD-H03 get dates array between selected dates
  getDatesBetweenRange = (startDate, stopDate) => {
    var currentDate = startDate;

    var dateArray = [];
    while (currentDate <= stopDate) {
      dateArray.push(convertDate(currentDate));
      currentDate = startDate.setDate(startDate.getDate() + 1);
    }
    return dateArray;
  };
  //#DBD-H04 using to send searchobject to back and get data from back
  filterSearchData = (isonloading) => {
    this.props.setSearchObj({
      chartSearchObj: this.state.chartSearchObj,
      tableSearchObj: this.state.tableSearchObj,
      selectedStore: this.state.selectedStore,
      selectedDept: this.state.selectedDept,
      selectedProd: this.state.selectedProd,
    });

    const csearchobj = this.state.chartSearchObj;

    //load chart data
    this.loadChartDataSearch();
    
    //if filter not available
    if (isonloading || !csearchobj.filterId || csearchobj.filterId === 0) {
      //get store data
      this.setState({ isStoreDataLoading: true }, () => {
        const storesearchobj = JSON.parse(JSON.stringify(this.state.tableSearchObj));

        if (storesearchobj.productId !== "" && storesearchobj.productId > 0) {
          storesearchobj["departmentId"] = "";
        }
        submitSets(submitCollection.findStoreData, storesearchobj, false).then((res) => {
            //console.log(res);
            var cstorelist = [];
            if (res && res.status && res.extra) {
              cstorelist = res.extra;
            }
            cstorelist.sort(this.sortItemsDesc);
            this.setState({
              loadedStoreData: cstorelist,
              isStoreDataLoading: false,
            });
          }
        );
      });
      //get department data
      this.setState({ isDeptDataLoading: true }, () => {
        const deptsearchobj = JSON.parse(JSON.stringify(this.state.tableSearchObj));
        deptsearchobj["productId"] = "";
        submitSets(submitCollection.findDepartmentData, deptsearchobj, false ).then((res) => {
          //console.log(res);
          var cdeptlist = [];
          if (res && res.status && res.extra) {
            cdeptlist = res.extra;
          }
          cdeptlist.sort(this.sortItemsDesc);
          this.setState({
            loadedDeptData: cdeptlist,
            isDeptDataLoading: false,
          });
        });
      });
      //get product data
      this.setState({ isProdDataLoading: true }, () => {
        const prodsearchobj = JSON.parse(JSON.stringify(this.state.tableSearchObj));
        submitSets(submitCollection.findProductData, prodsearchobj, false).then((res) => {
            //console.log(res);
            var cprodlist = [];
            if (res && res.status && res.extra) {
              cprodlist = res.extra;
            }
            cprodlist.sort(this.sortItemsDesc);
            this.setState({
              loadedProdData: cprodlist,
              isProdDataLoading: false,
            });
          }
        );
      });
    }
  };
  //load chart data from back
  loadChartDataSearch = () => {
    const csearchobj = this.state.chartSearchObj;
    let searchurl = submitCollection.findLineChart;
    //load chart data for filter
    if (csearchobj.filterId && csearchobj.filterId > 0) {
      searchurl = submitCollection.findFilterWiseLineChart;
    }
    this.setState({ loadingChartDetails: false });
    submitSets( searchurl, this.state.chartSearchObj, false).then((res) => {
      //console.log(res);
      this.setLoadedChartData(res);
    });
  };
  //sort and set state from loaded chart data
  setLoadedChartData = (res) => {
    var csobj = this.state.chartSearchObj;
    var cchartdata = [];
    var cchaindata = null;
    var fchartdata = { categories: this.state.datestBetweenRange, series: [] };
    var chidelist = []; //markers hide list
    const cextradata = res.extra;
    if (res && res.status && res.extra) {
      if (cextradata.lineChartChainDto) {
        //if chain data available
        var seriesobj = {
          label: cextradata.lineChartChainDto.chainName,
          data: [],
          pointRadius: [],
          pointHoverRadius: 0,
          pointBackgroundColor: this.props.dmode ? "#2f353e" : "#fff",
          fill: false,
          borderColor: this.props.dmode ? "#2CC990" : "#5128a0",
          spanGaps: true,
          borderWidth: 3,
        }; //chart obj
        var mseriesobj = {
          label: cextradata.lineChartChainDto.chainName,
          data: [],
        }; //modal obj

        cchaindata = cextradata.lineChartChainDto;

        for (let j = 0; j < fchartdata.categories.length; j++) {
          const ccatitem = fchartdata.categories[j];
          var issubalreadyexist =
            cextradata.lineChartChainDto.chainDate.findIndex(
              (x) => convertDate(x.date) === ccatitem
            ); //find date already added to categories
          if (issubalreadyexist > -1) {
            seriesobj.data.push(
              csobj.saleType === "sale"
                ? cextradata.lineChartChainDto.chainDate[issubalreadyexist].sale
                : cextradata.lineChartChainDto.chainDate[issubalreadyexist]
                  .salePerFace
            );
            mseriesobj.data.push(
              cextradata.lineChartChainDto.chainDate[issubalreadyexist]
            );
          } else {
            seriesobj.data.push(null);
            mseriesobj.data.push(null);
          }
          seriesobj.pointRadius.push(0);
          chidelist.push({ seriesIndex: 0, dataPointIndex: j, size: 0 });
        }

        fchartdata.series.push(seriesobj);
        cchartdata.push(mseriesobj);
      }

      if (
        cextradata.lineChartStoreDto &&
        cextradata.lineChartStoreDto.length > 0
      ) {
        //if store data available

        for (let i = 0; i < cextradata.lineChartStoreDto.length; i++) {
          const cstoreitem = cextradata.lineChartStoreDto[i];

          var sseriesobj = {
            label: cstoreitem.storeName,
            data: [],
            pointRadius: [],
            pointHoverRadius: 8,
            pointBackgroundColor: this.props.dmode ? "#2f353e" : "#fff",
            fill: false,
            borderColor: this.state.linecolors[i],
            spanGaps: true,
            borderWidth: 3,
          }; //chart obj
          var smseriesobj = { name: cstoreitem.storeName, data: [] }; //modal obj

          for (let j = 0; j < fchartdata.categories.length; j++) {
            const ccatitem = fchartdata.categories[j];
            var issubalreadyadded = cstoreitem.dates.findIndex(
              (x) => convertDate(x.date) === ccatitem
            ); //find date already added to categories
            if (issubalreadyadded > -1) {
              sseriesobj.data.push(
                csobj.saleType === "sale"
                  ? cstoreitem.dates[issubalreadyadded].sale
                  : cstoreitem.dates[issubalreadyadded].salePerFace
              );
              sseriesobj.pointRadius.push(6);
              smseriesobj.data.push(cstoreitem.dates[issubalreadyadded]);
            } else {
              sseriesobj.data.push(null);
              sseriesobj.pointRadius.push(0);
              smseriesobj.data.push(null);
              chidelist.push({
                seriesIndex: fchartdata.series.length,
                dataPointIndex: j,
                size: 0,
              });
            }
          }

          fchartdata.series.push(sseriesobj);
          cchartdata.push(smseriesobj);
        }
      }
    }
    /* console.log(fchartdata);
        console.log(chidelist); */
    this.setState({
      oridLineData: cchartdata,
      loadedChartData: fchartdata,
      chainChartData: cchaindata,
      hideChainList: chidelist,
      loadingChartDetails: true,
    });
  };
  
  sortItemsDesc(a, b) {
    if (a.isTop < b.isTop) {
      return -1;
    }
    if (a.isTop > b.isTop) {
      return 1;
    }
    return 0;
  }
  //set layout obj and load changes
  handleViewChanges = (cobj) => {
    this.setState({ selectedLayout: cobj }, () => {
      //get layout changes
      submitSets(submitCollection.findLayoutChanges,{ layoutId: cobj.layoutId },false).then((res) => {
        //console.log(res);
        var clayoutchanges = [];
        if (res && res.status && res.extra) {
          clayoutchanges = res.extra;
        }
        if (clayoutchanges.length > 0) {
          this.setState({ loadedLayoutChanges: clayoutchanges }, () => {
            this.handleToggleChangesModal();
          });
        } else {
          alertService.error(this.props.t("NO_RESULT_FOUND"));
        }
      });
    });
  };
  //toggle layout changes modal
  handleToggleChangesModal = () => {
    this.setState({ isShowChangesModal: !this.state.isShowChangesModal });
  };
  //toggle goal add modal
  handleToggleGoalModal = (isedit, cobj) => {
    this.setState({
      isShowGoalModal: !this.state.isShowGoalModal,
      editFilterObj: isedit ? cobj : null,
    });
  };
  //remove goal item
  handleRemoveGoalItem = (cobj, cidx) => {
    confirmAlert({
      title: this.props.t("remove_dashboard_filter"),
      message: this.props.t("areyousure_remove_filter"),
      overlayClassName: this.props.isRTL === "rtl" ? "alertrtl-content" : "",
      buttons: [
        {
          label: this.props.t("btnnames.yes"),onClick: () => {
            const csaveobj = cobj;
            csaveobj["isDelete"] = true;
            //remove subitems
            if (csaveobj.stores && csaveobj.stores.length > 0) {
              for (let i = 0; i < csaveobj.stores.length; i++) {
                csaveobj.stores[i].isDelete = true;
              }
            }
            if (csaveobj.departments && csaveobj.departments.length > 0) {
              for (let j = 0; j < csaveobj.departments.length; j++) {
                csaveobj.departments[j].isDelete = true;
              }
            }
            if (csaveobj.products && csaveobj.products.length > 0) {
              for (let l = 0; l < csaveobj.products.length; l++) {
                csaveobj.products[l].isDelete = true;
              }
            }
            if (csaveobj.tags && csaveobj.tags.length > 0) {
              for (let k = 0; k < csaveobj.tags.length; k++) {
                csaveobj.tags[k].isDelete = true;
              }
            }

            submitSets(submitCollection.dashboardFiltersDelete, csaveobj, false).then((res) => {
              //console.log(res);
              if (res && res.status) {
                alertService.success(this.props.t("goalsuccessdeleted"));
                //this.getAllFilters();

                //remove frpm search object and annotations
                const cchartsearchobj = this.state.chartSearchObj;
                const ctablesearchobj = this.state.tableSearchObj;
                const cgoallist = this.state.goalList;
                const cannolist = {};

                if (cchartsearchobj.filterId === csaveobj.filterId) {
                  cchartsearchobj.filterId = 0;
                  cchartsearchobj["dashboardFilterResultType"] = "All";
                  ctablesearchobj["dashboardFilterResultType"] = "All";
                }
                cgoallist.splice(cidx, 1);

                this.setState(
                  {
                    goalList: cgoallist,
                    annotationsList: cannolist,
                    chartSearchObj: cchartsearchobj,
                    tableSearchObj: ctablesearchobj
                  },
                  () => {
                    this.filterSearchData();
                  }
                );
              } else {
                alertService.error(this.props.t("erroroccurred"));
              }
            });
          },
        },
        {
          label: this.props.t("btnnames.no"),
        },
      ],
    });
  };
  //select new goal
  handleSelectGoalItem = (cidx) => {
    const cchartsearchobj = this.state.chartSearchObj;
    const ctablesearchobj = this.state.tableSearchObj;

    const cgoallist = this.state.goalList;
    const cannolist = {};

    //set current item filterid to search dealer
    const cgoalitem = cgoallist[cidx];
    if (cchartsearchobj.filterId !== cgoalitem.filterId) {
      cchartsearchobj.filterId = cgoalitem.filterId;
    } else {
      cchartsearchobj.filterId = 0;
    }

    cchartsearchobj["dashboardFilterResultType"] = "All";
    ctablesearchobj["dashboardFilterResultType"] = "All";

    if (cchartsearchobj.filterId === cgoalitem.filterId) {
      cchartsearchobj.saleType =
        cgoalitem.filterType === "SPF" ? "salePerFace" : "sale";
      //add item to annotations in chart
      cannolist[cgoalitem.filterId] = {
        type: "line",
        yMin: cgoalitem.value,
        yMax: cgoalitem.value,
        borderColor: this.state.goalConditionColors[cgoalitem.condition],
        borderWidth: 2,
        label: {
          content: (ctx) =>
            this.props.t(this.state.conditionslist[cgoalitem.condition]) +
            ": " +
            cgoalitem.filterName,
          enabled: true,
          position: "end",
          yPadding: 3,
          backgroundColor: hexToRGB(
            this.state.goalConditionColors[cgoalitem.condition],
            0.8
          ),
          borderRadius: 1,
        },
      };
    }

    //console.log(cchartsearchobj.filterId);
    this.setState(
      {
        goalList: cgoallist,
        annotationsList: cannolist,
        chartSearchObj: cchartsearchobj,
        tableSearchObj: ctablesearchobj,
        isCustomerFiltersUse: (cchartsearchobj.filterId > 0?true:false),
        currentCutomFilerId: cidx,
      },
      () => {
        this.filterSearchData();
      }
    );
  };
  //
  handleChangeFilter = () => { };

  //handle redirect planogram views
  handleRedirectPlanogram = (rtype, robj) => {
    //if store
    if(rtype === 1){
      if(robj && robj.activeLayoutId > 0){
        confirmAlert({
          title: this.props.t("redirect_from_dashboard"),
          message: this.props.t("areyousure_redirect_tolayout"),
          overlayClassName: this.props.isRTL === "rtl" ? "alertrtl-content" : "",
          buttons: [
            {
              label: this.props.t("btnnames.yes"),
              onClick: () => {
                //console.log(robj);
                const spgobj = { id: parseInt(robj.activeLayoutId), tags: [], isnotsredirect: true };

                this.props.setFieldStore(robj.storeId);
                this.props.setPLanogramdetailsView(null);
                this.props.setFieldView(null);
                this.props.setPLanogramView(spgobj);

                this.props.history.push('/');
              },
            },
            {
              label: this.props.t("btnnames.no"),
            },
          ],
        });
      } else{
        alertService.error(this.props.t("storeactive_planogram_notfound"));
      }
    }
  }

  render() {
    return (
      <Col xs={12} className={"main-content " + (this.props.isRTL === "rtl" ? "RTL" : "")} >
        <Col xs={12} className={"newdashboard-content " + (this.props.isRTL === "rtl" ? "rtl" : "")} dir={this.props.isRTL} >
          <h3 className="maintitle-txt">{this.props.t("dashboard")}</h3>
          <h4 className="subtitle-txt">
            {this.props.t("WHAT_YOU_WANT_EXPLORE")}
            <ul className="list-inline">
              <li className="list-inline-item">
                <label className="typeselect">
                  <Form.Check type="radio" name="saleTypeRadios" checked={ this.state.chartSearchObj && this.state.chartSearchObj.saleType === "salePerFace" } onChange={() => this.handleChangeSearch("saleType", "salePerFace") } disabled={this.state.isCustomerFiltersUse} />
                  {this.props.t("SALE_PER_FACE")}
                </label>
              </li>
              <li className="list-inline-item">
                <label className="typeselect">
                  <Form.Check type="radio" name="saleTypeRadios" checked={ this.state.chartSearchObj && this.state.chartSearchObj.saleType === "sale" } onChange={() => this.handleChangeSearch("saleType", "sale")} disabled={this.state.isCustomerFiltersUse} />
                  {this.props.t("GENERAL_SALES")}
                </label>
              </li>

              <Button type="button" size="sm" variant="danger" className="sub-title-btn" onClick={this.handleResetAll} >
                {this.props.t("RESETALL")}
              </Button>

              {this.state.chartSearchObj.dashboardFilterResultType &&
                this.state.chartSearchObj.dashboardFilterResultType !== "All" ? (
                <li className="list-inline-item sortby-main sb-count form-inline">
                  <label>{this.props.t("resultscount")} </label>
                  <Form.Control type="number" size="sm" value={this.state.chartSearchObj.dashboardResultCount} onChange={(e) => this.handleChangeSearch("dashboardResultCount",e.target.value)} className="resultcount-select" 
                   onKeyDown={ (evt) => preventinputotherthannumbers(evt,this.state.chartSearchObj.dashboardResultCount, this.props.t("RESULTSCOUNT_LIMIT"), 2)} />
                </li>
              ) : (<></>)}

              <li className="list-inline-item sortby-main form-inline">
                <label>{this.props.t("showresults")} </label>
                <span className="chevdown-icon"><ChevronDownIcon size={16} /></span>
                <FormSelect size="sm" value={this.state.chartSearchObj.dashboardFilterResultType} onChange={(e) => this.handleChangeSearch("dashboardFilterResultType",e.target.value)} className="sortby-select" >
                  <option value="All">{this.props.t("ALL")}</option>
                  <option value="Best">{this.props.t("BEST")}</option>
                  <option value="Worst">{this.props.t("WORST")}</option>
                  <option value="WorstAndBest">
                    {this.props.t("BESTNWORST")}
                  </option>
                </FormSelect>
              </li>

            </ul>
          </h4>

          <Row>
            <Col xs={12} lg={3} className="dashboard-filters-sidebar">
              <label className="sub-title" style={{ marginTop: "-10px", display: "block" }} >
                {this.props.t("SEL_TIME_RANGE")}
              </label>
              <Col className="selview-main">
                <ChevronDownIcon size={16} />
                <select className="form-control timerange-select " value={ this.state.chartSearchObj && this.state.chartSearchObj.dateRange ? this.state.chartSearchObj.dateRange : "" } onChange={(e) => this.handleChangeSearch("dateRange", e.target.value)} >
                  {Object.keys(dateRangeList).map((xitem, xidx) => {
                    return (
                      <option key={xidx} value={xitem}>
                        {i18n.language === "he"? dateRangeList[xitem].he: dateRangeList[xitem].en}
                      </option>
                    );
                  })}
                </select>
              </Col>

              {this.state.chartSearchObj &&
                this.state.chartSearchObj.isShowTimeRange ? (
                <Col className="timerange-view">
                  <h4>{this.props.t("SELTED_TIME_RANGE")}</h4>
                  <Row>
                    <Col>
                      <small>{this.props.t("FROM_DATETIME")}</small>
                      <h5>{convertDate(this.state.chartSearchObj.fromDate)}</h5>
                    </Col>
                    <Col>
                      <small>{this.props.t("TO_DATETIME")}</small>
                      <h5>{convertDate(this.state.chartSearchObj.endDate)}</h5>
                    </Col>
                  </Row>
                </Col>
              ) : (
                <></>
              )}

              <Col className="goallist-main">
                <label className="sub-title" style={{ marginTop: "15px", display: "block" }} >
                  {this.props.t("filter")}
                </label>

                <Col className={"goalfilter-search " +(this.state.goalsSearchObj.filterName.length > 0? "active": "")}>
                  <Form.Control type="text" size="sm" value={this.state.goalsSearchObj.filterName} onChange={(e) => this.changeGoalSearchFilters(e.target.value, "filterName",e)} onKeyDown={(e) => e.which === 13 ? this.getAllFilters() : null} placeholder={this.props.t("btnnames.search")} />
                  <InputGroup.Text><SearchIcon size={12} /></InputGroup.Text>
                </Col>

                <Button type="button" size="sm" variant="danger" className="sub-title-btn" onClick={this.handleToggleGoalModal} >
                  <PlusIcon size={12} /> {this.props.t("NEW")}
                </Button>

                <Col className="sub-list">
                  {this.state.goalList && this.state.goalList.length > 0 ? (
                    this.state.goalList.map((xitem, xidx) => {
                      return (
                        <Col key={xidx} className={"typeselect-main " + (this.state.chartSearchObj.filterId === xitem.filterId? "checked-filter": "")} >
                          <label className="typeselect" title={xitem.filterName} >
                            <Form.Check type="radio" name="chartFilterRadios" checked={ this.state.chartSearchObj.filterId === xitem.filterId? true : false} onChange={() => this.handleChangeFilter()} onClick={() => this.handleSelectGoalItem(xidx)} />{" "}
                            {xitem.filterName}
                          </label>
                          <span onClick={() => this.handleToggleGoalModal(true, xitem)} className={"editview-link"+(this.state.chartSearchObj.filterId === xitem.filterId ? " d-none" : "")} >
                            <PencilIcon size={14} />
                          </span>
                          <span onClick={() => this.handleRemoveGoalItem(xitem, xidx) } className={(this.state.chartSearchObj.filterId === xitem.filterId ? "d-none" : "")} >
                            <XIcon size={16} />
                          </span>
                        </Col>
                      );
                    })
                  ) : (
                    <></>
                  )}
                </Col>
              </Col>
            </Col>
            <Col xs={12} lg={9} className={"chartview-main " + (this.state.chartSearchObj && this.state.chartSearchObj.filterId > 0? "withfilter-div": "")}>
              {this.state.loadingChartDetails ? (<>
                  <ChartjsDynamicChart id="linechart-canvas" t={this.props.t} dmode={this.props.dmode} annotationsList={this.state.annotationsList} chartSearchObj={this.state.chartSearchObj} handleViewChanges={this.handleViewChanges} oridLineData={this.state.oridLineData} loadedChartData={this.state.loadedChartData} />
              </>) : (
                <Col className="text-center" style={{ paddingTop: "170px" }}>
                  <img src={loadinggif} style={{ height: "25px" }} alt="loading animation" />
                </Col>
              )}
            </Col>
          </Row>

          <Row style={{ marginTop: "10px" }}>
            <Col className="minicontent-main table1" xs={12} sm={6} md={6} lg={4} style={{ paddingRight: "0px", width: "28%" }} >
              <h3>
                {this.props.t("stores")}
                {this.state.selectedStore ? (
                  <div className="selected-label" title={this.state.selectedStore.storeName} >
                    <label className="label-txt" onClick={() => this.handleRedirectPlanogram(1, this.state.selectedStore) }>{this.state.selectedStore.storeName.substring(0, 20)+(this.state.selectedStore.storeName.length > 20? "..": "")}
                    <span>
                      <LinkExternalIcon size={12} />
                    </span></label>
                    <span onClick={() => this.handleChangeTableRow(1, this.state.selectedStore, true) }>
                      <XIcon size={12} />
                    </span>
                  </div>
                ) : (<></>)}
              </h3>
              <Col className="sub-content" style={{ minHeight: "275px" }}>
                <Table size="sm">
                  <thead>
                    <tr>
                      <th width="35%">{this.props.t("stores")}</th>
                      <th width="15%">SPF</th>
                      <th width="20%">{this.props.t("persalesfromrevenue")}</th>
                      <th width="15%">SPM</th>
                      <th width="15%">{this.props.t("changeFromAvg")}</th>
                    </tr>
                  </thead>
                </Table>
                {!this.state.isStoreDataLoading ? (
                  <Col style={this.props.isRTL === "rtl"? {maxHeight: "200px",overflowY: "scroll",marginLeft: "-6px"}:{maxHeight: "200px",overflowY: "scroll",marginRight: "-6px",}}>
                    <Table id="storedata-table" striped size="sm">
                      <tbody>
                        {this.state.loadedStoreData &&
                          this.state.loadedStoreData.length > 0 ? (
                          this.state.loadedStoreData.map((xitem, xidx) => {
                            return (
                              <tr key={xidx} dir="ltr" onClick={() => this.handleChangeTableRow(1, xitem, true)}>
                                <td width="35%" className={ (this.state.selectedStore && this.state.selectedStore.storeId === xitem.storeId ? "selected" : "") + (!xitem.isTop ? " redtitle" : "")} >
                                  {xitem.storeName}
                                </td>
                                <td  width="15%" className={xitem.spf < 0 ? "highlight" : ""}>{numberWithCommas(roundOffDecimal(xitem.spf, 2))}</td>
                                <td width="20%" className={ xitem.salesAvg < 0 ? "highlight" : ""}>
                                  {roundOffDecimal(xitem.salesAvg, 2)}%
                                </td>
                                <td width="15%" className={xitem.spm < 0 ? "highlight" : ""}>
                                  {numberWithCommas(roundOffDecimal(xitem.spm, 2))}
                                </td>
                                <td width="15%" className={xitem.changeFromAvg < 0 ? "highlight" : ""}>
                                  {roundOffDecimal(xitem.changeFromAvg, 2)}%
                                </td>
                              </tr>
                            );
                          })
                        ) : (<></>)}
                      </tbody>
                    </Table>
                  </Col>
                ) : (
                  <Col className="text-center" style={{ paddingTop: "80px" }}>
                    <img src={loadinggif} style={{ height: "20px" }} alt="loading animation" />
                  </Col>
                )}
              </Col>
            </Col>
            <Col
              className="minicontent-main table2" xs={12} sm={6} lg={4} style={{ paddingRight: "0px", width: "30%" }} >
              <h3>
                {this.props.t("departments")}
                {this.state.selectedDept ? (
                  <div className="selected-label" title={this.state.selectedDept.departmentName} >
                    {this.state.selectedDept.departmentName.substring(0, 20) +
                      (this.state.selectedDept.departmentName.length > 20? "..": "")}
                    <span onClick={() => this.handleChangeTableRow(2, this.state.selectedDept, true) } >
                      <XIcon size={12} />
                    </span>
                  </div>
                ) : ( <></> )}
              </h3>
              <Col className="sub-content" style={{ minHeight: "275px" }}>
                <Table size="sm">
                  <thead>
                    <tr>
                      <th width="32%">{this.props.t("departments")}</th>
                      <th width="20%">{this.props.t("perfromsimilarstore")}</th>
                      <th width="16%">SPF</th>
                      <th width="16%">{this.props.t("changefromavgspf")}</th>
                      <th width="16%">{this.props.t("changeFromAvg")}</th>
                    </tr>
                  </thead>
                </Table>
                {!this.state.isDeptDataLoading ? (
                  <Col style={  this.props.isRTL === "rtl" ? {maxHeight: "200px",overflowY: "scroll",marginLeft: "-6px"}: {maxHeight: "200px", overflowY: "scroll", marginRight: "-6px"}}>
                    <Table id="deptdata-table" striped size="sm">
                      <tbody>
                        {this.state.loadedDeptData &&
                          this.state.loadedDeptData.length > 0 ? (
                          this.state.loadedDeptData.map((xitem, xidx) => {
                            return (
                              <tr key={xidx} dir="ltr" onClick={() => this.handleChangeTableRow(2, xitem, true) } >
                                <td width="32%" className={ (this.state.selectedDept && this.state.selectedDept.departmentId === xitem.departmentId ? "selected": "") + (!xitem.isTop ? " redtitle" : "") } >
                                  {xitem.departmentName}
                                </td>
                                <td width="20%" className={ xitem.avgStoreRevenue < 0 ? "highlight" : ""}>
                                  {roundOffDecimal(xitem.avgStoreRevenue, 2)}%
                                </td>
                                {/* <td width="20%" className={xitem.nextstore<0?"highlight":""}>{xitem.nextstore}%</td> */}
                                <td width="16%" className={xitem.spf < 0 ? "highlight" : ""} >
                                  {numberWithCommas(roundOffDecimal(xitem.spf, 2))}
                                </td>
                                <td width="16%" className={ xitem.spfVsAvg < 0 ? "highlight" : "" } >
                                  {roundOffDecimal(xitem.spfVsAvg, 2)}%
                                </td>
                                <td width="16%" className={ xitem.spfVsAvg < 0 ? "highlight" : "" } >
                                  {roundOffDecimal(xitem.changeFromAvg, 2)}%
                                </td>
                              </tr>
                            );
                          })
                        ) : (
                          <></>
                        )}
                      </tbody>
                    </Table>
                  </Col>
                ) : (
                  <Col className="text-center" style={{ paddingTop: "80px" }}>
                    <img src={loadinggif} style={{ height: "20px" }} alt="loading animation" />
                  </Col>
                )}
              </Col>
            </Col>
            <Col className="minicontent-main table3" xs={12} sm={6} lg={4} style={{ paddingRight: "0px", width: "42%" }} >
              <h3> {this.props.t("products")} {this.state.selectedProd ? ( <div className="selected-label" title={this.state.selectedProd.productName} >
                    {this.state.selectedProd.productName.substring(0, 20) + (this.state.selectedProd.productName.length > 20 ? ".." : "")}
                    <span onClick={() => this.handleChangeTableRow(3, this.state.selectedProd, true) } >
                      <XIcon size={12} />
                    </span>
                  </div>
                ) : (<></>)}
              </h3>
              <Col className="sub-content" style={{ minHeight: "275px" }}>
                <Table size="sm">
                  <thead>
                    <tr>
                      <th width="35%">{this.props.t("products")}</th>
                      <th width="19%">{this.props.t("perfromsimilarstore")}</th>
                      <th width="16%">{this.props.t("perofavgfacingqty")}</th>
                      <th width="15%">SPF</th>
                      <th width="15%">SPF vs AVG SPF</th>
                    </tr>
                  </thead>
                </Table>
                {!this.state.isProdDataLoading ? (
                  <Col style={ this.props.isRTL === "rtl" ? { maxHeight: "200px", overflowY: "scroll", marginLeft: "-6px", } : {maxHeight: "200px", overflowY: "scroll", marginRight: "-6px",}} >
                    <Table id="proddata-table" striped size="sm">
                      <tbody>
                        {this.state.loadedProdData &&
                          this.state.loadedProdData.length > 0 ? (
                          this.state.loadedProdData.map((xitem, xidx) => {
                            
                            return (
                              <tr key={xidx} dir="ltr" onClick={() => this.handleChangeTableRow(3, xitem, true) } >
                                <td width="35%" className={(this.state.selectedProd && this.state.selectedProd.productId === xitem.productId? "selected" : "") + (!xitem.isTop ? " redtitle" : "") }
                                  title={xitem.productName} >
                                  {(xitem.productBarcode ? xitem.productBarcode : "")}<br/>
                                  {xitem.productName.substring(0, 25) +
                                    (xitem.productName.length > 25 ? ".." : "")}
                                </td>
                                <td width="19%" className={xitem.avgStoreRevenue < 0 ? "highlight" : ""}>
                                  {roundOffDecimal(xitem.avgStoreRevenue, 2)}%
                                </td>
                                <td width="16%" className={ xitem.facingQtyPercentage < 0 ? "highlight" : "" } >
                                  {roundOffDecimal( xitem.facingQtyPercentage,2)} %
                                </td>
                                <td width="15%" className={xitem.spf < 0 ? "highlight" : ""} >
                                  {numberWithCommas(roundOffDecimal(xitem.spf, 2))}
                                </td>
                                <td width="15%" className={ xitem.spfVsAvg < 0 ? "highlight" : "" } >
                                  {numberWithCommas(roundOffDecimal(xitem.spfVsAvg, 2))}
                                </td>
                              </tr>
                            );
                          })
                        ) : (<></>)}
                      </tbody>
                    </Table>
                  </Col>
                ) : (
                  <Col className="text-center" style={{ paddingTop: "80px" }}>
                    <img src={loadinggif} style={{ height: "20px" }} alt="loading animation" />
                  </Col>
                )}
              </Col>
            </Col>
          </Row>
        </Col>

        {this.state.isShowGoalModal ? (
          <NewGoalModal isShowGoalModal={this.state.isShowGoalModal} editFilterObj={this.state.editFilterObj} mainSelProds={this.state.mainSelProds} mainDepartments={this.state.mainDepartments}
            mainStores={this.state.mainStores} mainStoreTags={this.state.mainStoreTags} mainProds={this.state.mainProds} resetGoalSearchFilters={this.resetGoalSearchFilters} changeProdSearchFilters={this.changeProdSearchFilters} handleToggleGoalModal={this.handleToggleGoalModal}
            isRTL={this.props.isRTL} t={this.props.t} />) : (<></>)}

        <Modal show={this.state.isShowChangesModal} animation={false} className="changesmodal-view comview-modal" dir={this.props.isRTL} onHide={this.handleToggleChangesModal} >
          <Modal.Header style={{ padding: "10px 15px" }}>
            <Modal.Title style={{ fontSize: "20px", fontWeight: "700" }}>
              {this.state.selectedLayout? this.state.selectedLayout.series +" - v" +this.state.selectedLayout.version: ""}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {this.state.loadedLayoutChanges &&
              this.state.loadedLayoutChanges.length > 0 ? (
              <>
                <Col className="overview-content" style={{ borderRadius: "8px", boxShadow: "none", position: "relative" }} >
                  <Col style={{ maxHeight: "280px", overflowY: "auto" }}>
                    <Table className="sumview-table changesview-table" style={{ marginBottom: "0px" }} >
                      <tbody>
                        {this.state.loadedLayoutChanges.map((item, idx) => {
                          return (
                            <React.Fragment key={idx}>
                              <FieldSubList t={this.props.t} item={item} idx={idx} />
                            </React.Fragment>
                          );
                        })}
                      </tbody>
                    </Table>
                  </Col>
                </Col>
              </>
            ) : (<></>)}
          </Modal.Body>
          <Modal.Footer style={{ padding: "5px" }}>
            <Button variant="secondary" size="sm" onClick={this.handleToggleChangesModal} style={{ borderRadius: "15px" }} >
              {this.props.t("btnnames.close")}
            </Button>
          </Modal.Footer>
        </Modal>
      </Col>
    );
  }
}

const mapDispatchToProps = (dispatch) => ({
  setSearchObj: (payload) => dispatch(searchSetAction(payload)),

  setPLanogramView: (payload) => dispatch(viewSetAction(payload)),
  setPLanogramdetailsView: (payload) => dispatch(PDviewDataAction(payload)),
  setFieldView: (payload) => dispatch(viewFieldAction(payload)),
  setFieldStore: (payload) => dispatch(setFieldStoreAction(payload)),
});

export default withTranslation()(
  withRouter(connect(null, mapDispatchToProps)(NewDashboardComponent))
);
