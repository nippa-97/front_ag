import { shallow, mount } from 'enzyme';
import { NewDashboardComponent } from '../../components/newdashboard/newdashboard';
import ChartjsDynamicChart from '../../components/newdashboard/chartjsdynamicchart';

let props = {
    t: jest.fn(),
    setSearchObj: jest.fn(),
    dashState: { dashboardSearch: { chartSearchObj: { saleType: "salePerFace", isReqChainChart: true, fromDate: "", endDate: "", dateRange: 1, isShowTimeRange: true, isShowVersions: false, storeId: "", departmentId: "", productId: "" }, 
    tableSearchObj: {}, selectedStore: 0, selectedDept: 0, selectedProd: 0 } }
};

it("new dashboard renders without crashing", () => {
    shallow(<NewDashboardComponent {...props} />);
});

const wrapper = shallow(<NewDashboardComponent {...props} />);

describe("filters works without errors", () => {
    var defsearchobj = { saleType: "sale", isReqChainChart: true, fromDate: "", endDate: "", dateRange: 2, isShowTimeRange: true, isShowVersions: false, storeId: "", departmentId: "", productId: "" };
    wrapper.setState({ chartSearchObj: defsearchobj });
    wrapper.update();

    it("changing explore filters", () => {
        const checklist = wrapper.find({name: 'saleTypeRadios'});
        expect(checklist.at(0).prop('checked')).toBe(false);
        expect(checklist.at(1).prop('checked')).toBe(true);
    });
    it("changing time range select", () => {
        const timerangeitem = wrapper.find(".timerange-select");
        expect(timerangeitem.prop('value')).toBe(2);
    });
    it("showing changed time range", () => {
        const component = wrapper.instance();
        //trigger method and set dates
        component.handleChangeSearch("dateRange",defsearchobj.dateRange);
        //console.log(component.state.chartSearchObj);
        expect(component.state.chartSearchObj.fromDate).not.toBe("");
        expect(component.state.chartSearchObj.endDate).not.toBe("");
    });
});

let chartprops = { categories: ["2021-10-10","2021-10-11","2021-10-12"],
    series: [{label: "data set 1", data:[25,10,23]},{label: "data set 2", data:[15,18,28]}]};

describe("chart data loading without errors", () => {
    const chartwrapper = shallow(<NewDashboardComponent {...props} />);
    chartwrapper.setState({ loadingChartDetails: chartprops });
    chartwrapper.update();

    it("chart rendering without issues", () => {
        expect(chartwrapper.exists("#linechart-canvas")).toBeTruthy();
    });
    it("categories data matching", () => {
        const component = chartwrapper.instance();
        expect(component.state.loadingChartDetails.categories[1]).toBe("2021-10-11");
    });
    
});

var defstoredata = [{dates: [], salesAvg: -86.6482867270579, spf: 43.23979591836735, spm: 339, storeId: 29, storeName: "UK-R-002_B06", isTop: false}];
var defdeptdata = [{avgStoreRevenue: 0, departmentId: 11, departmentName: "DP-01", spf: 276.02040816326536, spfVsAvg: 0, isTop: false}];
var defproddata = [{avgStoreRevenue: 0, facingQtyPercentage: 0, productBarcode: "123456789", productId: 35, productName: "Raththi Milk Box", spf: 0, spfVsAvg: 0, departmentId: 10, isTop: false}];

describe("table data loading without errors", () => {
    const tablewrapper = shallow(<NewDashboardComponent {...props} />);
    tablewrapper.setState({ loadedStoreData: defstoredata, isStoreDataLoading: false,
        loadedDeptData: defdeptdata, isDeptDataLoading: false, loadedProdData: defproddata, isProdDataLoading: false });
        tablewrapper.update();

    it("store data loading", () => {
        const row = tablewrapper.find('#storedata-table tbody tr');
        expect(row).toHaveLength(defstoredata.length);
    });
    it("department data loading", () => {
        const row = tablewrapper.find('#deptdata-table tbody tr');
        expect(row).toHaveLength(defdeptdata.length);
    });
    it("product data loading", () => {
        const row = tablewrapper.find('#proddata-table tbody tr');
        expect(row).toHaveLength(defproddata.length);
    });
});

it("table row click works without errors", () => {
    wrapper.setState({ loadedProdData: defproddata, isProdDataLoading: false });
    wrapper.update();
    
    const component = wrapper.instance();
    const componentitem = wrapper.find('#proddata-table tbody tr');
    componentitem.at(0).simulate('click');
    //console.log(component.state);
    expect(component.state.chartSearchObj.departmentId).toBe(10);
    expect(component.state.chartSearchObj.productId).toBe(35);
});

let chartdetailsprops = {
    dmode: true,
    loadedChartData: {categories: ["Category 1", "Category 2"], series: [23,65]},
    oridLineData: []
}

it("chart details loading without errors", () => {
    let chartwrapper = shallow(<ChartjsDynamicChart {...chartdetailsprops} />);

    expect(chartwrapper.find("ForwardRef").prop("height")).toBe(340);
});

//check component snapshot without errors
/* it("new dashboard details snapshot renders without crashing", () => {
    expect(wrapper).toMatchSnapshot();
}); */