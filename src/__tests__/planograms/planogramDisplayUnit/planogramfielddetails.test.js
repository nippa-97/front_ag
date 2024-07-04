import { shallow, mount } from 'enzyme';
import { PlanDunitComponent } from '../../../components/planograms/planDisplayUnit/plandunit';
import { MemoryRouter } from 'react-router-dom';
import ReactApexChart from "react-apexcharts";

import { AspectRatioDrawBox, measureConverter } from '../../../_services/common.service';
import { submitSets } from '../../../components/UiComponents/SubmitSets';
import { checkProductIsInBottom } from '../../../components/planograms/planDisplayUnit/additionalcontents';
import { compareSideToAllowDrop } from '../../../components/planograms/planDisplayUnit/viewOverlapSafty';

//moc back calls
jest.mock('../../../components/UiComponents/SubmitSets');

//mocking chart in sales details
jest.mock("react-apexcharts", () =>
  jest.fn(() => {
    return null;
  })
);

const defdraftfieldobj = {
    "planogramShelfDto": [],
    "id": 3311,
    "x": 9.85,
    "y": 5.6,
    "width": 1,
    "height": 0.43,
    "uuid": "87899127-c804-49ef-8c91-1f84f5adbb05",
    "notes": "",
    "fieldVer": 0,
    "uom": "meters",
    "rotation": 0,
    "isDelete": false,
    "isNew": false,
    "f_uuid": "6d1edd6e-d798-4c46-aab7-d1bebd9571ab",
    "positionNumberInAisle": 0,
    "noInFloorLayout": 1,
    "depth": 0,
    "masterFieldDepth": 43,
    "masterFieldHeight": 200,
    "masterFieldWidth": 100,
    "masterFieldUom": "cm",
    "isHasAiImage": false,
    "isFieldLocationChange": true,
    "isFieldProductChange": false,
    "isLeftChange": false,
    "isRightChange": false,
    "baseLocationX": 0,
    "baseLocationY": 0,
    "isFieldCopy": true,
    "fieldSafetyMargin": 0,
    "isProductOverLapping": false,
    "storeId": 10,
    "floorLayoutId": 535,
    "floorLayoutStatus": "DRAFT",
    "isHaveBaseFloorVersion": false,
    "baseFloorLayoutId": 0,
    "baseFloorLayoutVersion": "",
    "floorLayoutVersion": "0.0.0 draft - 6",
    "department": {
        "startIndex": 0,
        "maxResult": 0,
        "departmentId": 12,
        "name": "DP-02",
        "color": "#00a19d"
    },
    "fieldDto": {
        "shelf": [
            {
                "width": 100,
                "height": 24,
                "uom": "cm",
                "gap": 4,
                "x": 0,
                "y": 0,
                "rank": 1,
                "id": 252,
                "reverseRowNumber": 7
            },
            {
                "width": 100,
                "height": 24,
                "uom": "cm",
                "gap": 4,
                "x": 0,
                "y": 56,
                "rank": 2,
                "id": 253,
                "reverseRowNumber": 6
            },
            {
                "width": 100,
                "height": 24,
                "uom": "cm",
                "gap": 4,
                "x": 0,
                "y": 112,
                "rank": 3,
                "id": 254,
                "reverseRowNumber": 5
            },
            {
                "width": 100,
                "height": 24,
                "uom": "cm",
                "gap": 4,
                "x": 0,
                "y": 168,
                "rank": 4,
                "id": 255,
                "reverseRowNumber": 4
            },
            {
                "width": 100,
                "height": 24,
                "uom": "cm",
                "gap": 4,
                "x": 0,
                "y": 224,
                "rank": 5,
                "id": 256,
                "reverseRowNumber": 3
            },
            {
                "width": 100,
                "height": 24,
                "uom": "cm",
                "gap": 4,
                "x": 0,
                "y": 280,
                "rank": 6,
                "id": 257,
                "reverseRowNumber": 2
            },
            {
                "width": 100,
                "height": 28,
                "uom": "cm",
                "gap": 4,
                "x": 0,
                "y": 336,
                "rank": 7,
                "id": 258,
                "reverseRowNumber": 1
            }
        ],
        "fieldName": "Store 10 Canned Food",
        "width": 100,
        "height": 200,
        "depth": 43,
        "uom": "cm",
        "id": 36,
        "remark": ""
    },
    "floorId": 32,
    "floorName": "Store 10"
}

var defactivefieldobj = {
    "planogramShelfDto": [
        {
            "planogramShelfChanges": [],
            "overLappingDto": [],
            "planogramProduct": [
                {
                    "productBlock": [
                        {
                            "productLocations": [
                                {
                                    "id": 99452,
                                    "x": 0,
                                    "y": 15,
                                    "uom": "none",
                                    "isDelete": false,
                                    "isNew": false,
                                    "f_uuid": "fd31d6cd-6db6-44e2-a429-ea2b61831671",
                                    "productDepth": 10,
                                    "productHeight": 25,
                                    "productRotation": "default",
                                    "productWidth": 10,
                                    "productUom": "cm",
                                    "isRightSideOverLap": false
                                },
                                {
                                    "id": 99453,
                                    "x": 10,
                                    "y": 15,
                                    "uom": "none",
                                    "isDelete": false,
                                    "isNew": false,
                                    "f_uuid": "de773ce7-df75-4079-ae16-c588625e1924",
                                    "productDepth": 10,
                                    "productHeight": 25,
                                    "productRotation": "default",
                                    "productWidth": 10,
                                    "productUom": "cm",
                                    "isRightSideOverLap": false
                                },
                                {
                                    "id": 99454,
                                    "x": 20,
                                    "y": 15,
                                    "uom": "none",
                                    "isDelete": false,
                                    "isNew": false,
                                    "f_uuid": "bf66a910-0a50-4060-9621-baceb9fb2e5a",
                                    "productDepth": 10,
                                    "productHeight": 25,
                                    "productRotation": "default",
                                    "productWidth": 10,
                                    "productUom": "cm",
                                    "isRightSideOverLap": false
                                },
                                {
                                    "id": 99455,
                                    "x": 30,
                                    "y": 15,
                                    "uom": "none",
                                    "isDelete": false,
                                    "isNew": false,
                                    "f_uuid": "4c7206ea-b0ba-403d-bc1f-3c9ca705819f",
                                    "productDepth": 10,
                                    "productHeight": 25,
                                    "productRotation": "default",
                                    "productWidth": 10,
                                    "productUom": "cm",
                                    "isRightSideOverLap": false
                                }
                            ],
                            "id": 53667,
                            "x": 0,
                            "y": 15,
                            "width": 10,
                            "height": 25,
                            "blockVer": null,
                            "uom": "cm",
                            "isDelete": false,
                            "isNew": false,
                            "f_uuid": "e278ba8a-18e5-41c6-8d0d-57d636718c98"
                        }
                    ],
                    "id": 19606,
                    "isDelete": false,
                    "isNew": false,
                    "f_uuid": "efd9f9a5-101e-41d0-b683-064d10d3089c",
                    "productWidth": 10,
                    "productHeight": 25,
                    "productPadding": 0,
                    "productDepth": 10,
                    "productUom": "cm",
                    "productFacingQty": 4,
                    "productTotalQty": 4,
                    "previousQty": 4,
                    "productInfo": {
                        "productImage": [],
                        "id": 1295,
                        "width": 10,
                        "height": 25,
                        "uom": "cm",
                        "depth": 10,
                        "barcode": "1010101101010100011110101",
                        "productSource": "direct",
                        "gs1Code": "",
                        "posMappingId": null,
                        "lastPriceOfProduct": null,
                        "productName": "Juice",
                        "brandName": "MD",
                        "imageId": 9226,
                        "imageUrl": "https://d3ginyfiwc1r8i.cloudfront.net/main/4/1010101101010100011110101/5gJh8ntEQyXNUrE-qBl2J_W100_100.png"
                    }
                }
            ],
            "id": 11064,
            "width": 250,
            "gap": 5,
            "x": 0,
            "y": 0,
            "rank": 1,
            "height": 40,
            "uom": "cm",
            "isDelete": false,
            "isNew": false,
            "f_uuid": null,
            "reverseRowNumber": 5
        },
        {
            "planogramShelfChanges": [],
            "overLappingDto": [],
            "planogramProduct": [
                {
                    "productBlock": [
                        {
                            "productLocations": [
                                {
                                    "id": 99456,
                                    "x": 0,
                                    "y": 60,
                                    "uom": "none",
                                    "isDelete": false,
                                    "isNew": false,
                                    "f_uuid": "d70edf41-b908-4f0d-b554-172cc5fd7bbc",
                                    "productDepth": 10,
                                    "productHeight": 25,
                                    "productRotation": "default",
                                    "productWidth": 10,
                                    "productUom": "cm",
                                    "isRightSideOverLap": false
                                },
                                {
                                    "id": 99457,
                                    "x": 10,
                                    "y": 60,
                                    "uom": "none",
                                    "isDelete": false,
                                    "isNew": false,
                                    "f_uuid": "36def901-1235-44fc-8dfd-e63368861596",
                                    "productDepth": 10,
                                    "productHeight": 25,
                                    "productRotation": "default",
                                    "productWidth": 10,
                                    "productUom": "cm",
                                    "isRightSideOverLap": false
                                },
                                {
                                    "id": 99458,
                                    "x": 20,
                                    "y": 60,
                                    "uom": "none",
                                    "isDelete": false,
                                    "isNew": false,
                                    "f_uuid": "20ec5f9c-0805-4a20-91af-a4cb72d6efb3",
                                    "productDepth": 10,
                                    "productHeight": 25,
                                    "productRotation": "default",
                                    "productWidth": 10,
                                    "productUom": "cm",
                                    "isRightSideOverLap": false
                                },
                                {
                                    "id": 99459,
                                    "x": 30,
                                    "y": 60,
                                    "uom": "none",
                                    "isDelete": false,
                                    "isNew": false,
                                    "f_uuid": "d0d0ac01-f08d-4bef-a0f9-68ece2388c85",
                                    "productDepth": 10,
                                    "productHeight": 25,
                                    "productRotation": "default",
                                    "productWidth": 10,
                                    "productUom": "cm",
                                    "isRightSideOverLap": false
                                }
                            ],
                            "id": 53668,
                            "x": 0,
                            "y": 60,
                            "width": 10,
                            "height": 25,
                            "blockVer": null,
                            "uom": "cm",
                            "isDelete": false,
                            "isNew": false,
                            "f_uuid": "cab5c87d-0b1e-4c84-8526-0731967c83fe"
                        }
                    ],
                    "id": 19607,
                    "isDelete": false,
                    "isNew": false,
                    "f_uuid": "4bd9dc98-438e-4fa0-99aa-f2e877e70005",
                    "productWidth": 10,
                    "productHeight": 25,
                    "productPadding": 0,
                    "productDepth": 10,
                    "productUom": "cm",
                    "productFacingQty": 4,
                    "productTotalQty": 4,
                    "previousQty": 4,
                    "productInfo": {
                        "productImage": [],
                        "id": 1295,
                        "width": 10,
                        "height": 25,
                        "uom": "cm",
                        "depth": 10,
                        "barcode": "1010101101010100011110101",
                        "productSource": "direct",
                        "gs1Code": "",
                        "posMappingId": null,
                        "lastPriceOfProduct": null,
                        "productName": "Juice",
                        "brandName": "MD",
                        "imageId": 9226,
                        "imageUrl": "https://d3ginyfiwc1r8i.cloudfront.net/main/4/1010101101010100011110101/5gJh8ntEQyXNUrE-qBl2J_W100_100.png"
                    }
                }
            ],
            "id": 11065,
            "width": 250,
            "gap": 5,
            "x": 0,
            "y": 57.96,
            "rank": 2,
            "height": 40,
            "uom": "cm",
            "isDelete": false,
            "isNew": false,
            "f_uuid": null,
            "reverseRowNumber": 4
        },
        {
            "planogramShelfChanges": [],
            "overLappingDto": [],
            "planogramProduct": [],
            "id": 11066,
            "width": 250,
            "gap": 5,
            "x": 0,
            "y": 115.92,
            "rank": 3,
            "height": 40,
            "uom": "cm",
            "isDelete": false,
            "isNew": false,
            "f_uuid": null,
            "reverseRowNumber": 3
        },
        {
            "planogramShelfChanges": [],
            "overLappingDto": [],
            "planogramProduct": [],
            "id": 11067,
            "width": 250,
            "gap": 5,
            "x": 0,
            "y": 173.88,
            "rank": 4,
            "height": 40,
            "uom": "cm",
            "isDelete": false,
            "isNew": false,
            "f_uuid": null,
            "reverseRowNumber": 2
        },
        {
            "planogramShelfChanges": [],
            "overLappingDto": [],
            "planogramProduct": [],
            "id": 11068,
            "width": 250,
            "gap": 5,
            "x": 0,
            "y": 231.84,
            "rank": 5,
            "height": 40,
            "uom": "cm",
            "isDelete": false,
            "isNew": false,
            "f_uuid": null,
            "reverseRowNumber": 1
        }
    ],
    "id": 3730,
    "x": 5.693103448275863,
    "y": 5.9514687100894,
    "width": 2.5,
    "height": 0.5,
    "uuid": "445f270c-83df-423d-9517-2b5c39965090",
    "notes": "",
    "fieldVer": 2,
    "uom": "meters",
    "rotation": 0,
    "isDelete": false,
    "isNew": false,
    "f_uuid": "3fc0b4eb-2270-4a9d-9b66-3472038160e7",
    "positionNumberInAisle": 0,
    "noInFloorLayout": 2,
    "depth": 0,
    "masterFieldDepth": 50,
    "masterFieldHeight": 225,
    "masterFieldWidth": 250,
    "masterFieldUom": "cm",
    "isHasAiImage": false,
    "isFieldLocationChange": true,
    "isFieldProductChange": true,
    "isLeftChange": false,
    "isRightChange": true,
    "baseLocationX": 0,
    "baseLocationY": 0,
    "isFieldCopy": true,
    "fieldSafetyMargin": 0,
    "isProductOverLapping": false,
    "storeId": 32,
    "floorLayoutId": 610,
    "floorLayoutStatus": "ACTIVE",
    "isHaveBaseFloorVersion": true,
    "baseFloorLayoutId": 609,
    "baseFloorLayoutVersion": "0.1.1 draft - 5",
    "floorLayoutVersion": "0.2.1",
    "department": {
        "startIndex": 0,
        "maxResult": 0,
        "departmentId": 12,
        "name": "DP-02",
        "color": "#00a19d"
    },
    "fieldDto": {
        "shelf": [
            {
                "width": 250,
                "height": 40,
                "uom": "cm",
                "gap": 5,
                "x": 0,
                "y": 0,
                "rank": 1,
                "id": 474,
                "reverseRowNumber": 5
            },
            {
                "width": 250,
                "height": 40,
                "uom": "cm",
                "gap": 5,
                "x": 0,
                "y": 117.36000000000004,
                "rank": 2,
                "id": 475,
                "reverseRowNumber": 4
            },
            {
                "width": 250,
                "height": 40,
                "uom": "cm",
                "gap": 5,
                "x": 0,
                "y": 234.72000000000008,
                "rank": 3,
                "id": 476,
                "reverseRowNumber": 3
            },
            {
                "width": 250,
                "height": 40,
                "uom": "cm",
                "gap": 5,
                "x": 0,
                "y": 352.0800000000001,
                "rank": 4,
                "id": 477,
                "reverseRowNumber": 2
            },
            {
                "width": 250,
                "height": 40,
                "uom": "cm",
                "gap": 5,
                "x": 0,
                "y": 469.4400000000001,
                "rank": 5,
                "id": 478,
                "reverseRowNumber": 1
            }
        ],
        "fieldName": "DU-01",
        "width": 250,
        "height": 225,
        "depth": 50,
        "uom": "cm",
        "id": 93,
        "remark": ""
    },
    "floorId": 54,
    "floorName": "FL-01",
    "isHasBaseField": false,
    "rightSidePlanogramFieldDto": {
        "planogramShelfDto": [
            {
                "planogramShelfChanges": [],
                "overLappingDto": [],
                "planogramProduct": [],
                "id": 11059,
                "width": 250,
                "gap": 5,
                "x": 0,
                "y": 0,
                "rank": 1,
                "height": 35,
                "uom": "cm",
                "isDelete": false,
                "isNew": false,
                "f_uuid": null,
                "reverseRowNumber": 5
            },
            {
                "planogramShelfChanges": [],
                "overLappingDto": [],
                "planogramProduct": [],
                "id": 11060,
                "width": 250,
                "gap": 5,
                "x": 0,
                "y": 57.96,
                "rank": 2,
                "height": 35,
                "uom": "cm",
                "isDelete": false,
                "isNew": false,
                "f_uuid": null,
                "reverseRowNumber": 4
            },
            {
                "planogramShelfChanges": [],
                "overLappingDto": [],
                "planogramProduct": [],
                "id": 11061,
                "width": 250,
                "gap": 5,
                "x": 0,
                "y": 115.92,
                "rank": 3,
                "height": 50,
                "uom": "cm",
                "isDelete": false,
                "isNew": false,
                "f_uuid": null,
                "reverseRowNumber": 3
            },
            {
                "planogramShelfChanges": [],
                "overLappingDto": [],
                "planogramProduct": [],
                "id": 11062,
                "width": 250,
                "gap": 5,
                "x": 0,
                "y": 173.88,
                "rank": 4,
                "height": 40,
                "uom": "cm",
                "isDelete": false,
                "isNew": false,
                "f_uuid": null,
                "reverseRowNumber": 2
            },
            {
                "planogramShelfChanges": [],
                "overLappingDto": [],
                "planogramProduct": [],
                "id": 11063,
                "width": 250,
                "gap": 5,
                "x": 0,
                "y": 231.84,
                "rank": 5,
                "height": 40,
                "uom": "cm",
                "isDelete": false,
                "isNew": false,
                "f_uuid": null,
                "reverseRowNumber": 1
            }
        ],
        "id": 3729,
        "x": 3.192848020434228,
        "y": 5.9514687100894,
        "width": 2.5,
        "height": 0.5,
        "uuid": "0fb4d339-3b6d-4348-b0c1-aab3283befdf",
        "notes": "",
        "fieldVer": 1,
        "uom": "meters",
        "rotation": 0,
        "isDelete": false,
        "isNew": false,
        "f_uuid": "5b6b7090-dc79-4274-8c48-9290cfd15103",
        "positionNumberInAisle": 0,
        "noInFloorLayout": 1,
        "depth": 0,
        "masterFieldDepth": 50,
        "masterFieldHeight": 235,
        "masterFieldWidth": 250,
        "masterFieldUom": "cm",
        "isHasAiImage": false,
        "isFieldLocationChange": true,
        "isFieldProductChange": true,
        "isLeftChange": true,
        "isRightChange": false,
        "baseLocationX": 0,
        "baseLocationY": 0,
        "isFieldCopy": true,
        "fieldSafetyMargin": 0,
        "isProductOverLapping": false,
        "department": {
            "startIndex": 0,
            "maxResult": 0,
            "departmentId": 12,
            "name": "DP-02",
            "color": "#00a19d"
        },
        "fieldDto": {
            "shelf": [],
            "fieldName": "DU-01",
            "width": 250,
            "height": 225,
            "depth": 50,
            "uom": "cm",
            "id": 93,
            "remark": ""
        }
    },
    "leftSidePlanogramFieldDto": {"department":{"name":"Department 1"}, "noInFloorLayout": 1},
};

let props = {
    t: jest.fn(),
    isRTL: "rtl",
    dmode: true,
    history: { listen: jest.fn(), push: jest.fn() },
    planogramState: { pgramFieldDetails: defactivefieldobj },
    istesting: true,
    setFieldRecList: jest.fn(),
    setPLanogramdetailsView: jest.fn(),
    setFieldOverlapAction: jest.fn(),
    setFieldView: jest.fn(),
};

it("planogram display unit page renders without crashing", () => {
    submitSets.mockResolvedValue(Promise.resolve({ status: false, extra: null }));
    shallow(<PlanDunitComponent {...props} />);
});

describe("planogram draft display unit drawing without errors", () => {
    submitSets.mockResolvedValue(Promise.resolve({ status: false, extra: null }));
    const wrapper = mount(<MemoryRouter><PlanDunitComponent {...props} /></MemoryRouter>);
    const subwrapper = wrapper.find(PlanDunitComponent);

    subwrapper.setState({ isloadedfielddet: true, isnottesting: false, divWidth: 500, divHeight: 600 });
    subwrapper.instance().reinitSaveObj(defdraftfieldobj);

    it("generating aspect ratio is correct", () => {
        var aspectratio = AspectRatioDrawBox(defdraftfieldobj.masterFieldWidth,defdraftfieldobj.masterFieldHeight,500,600);
        expect(aspectratio).toBe(3);
    });

    it("generating measure convert is correct", () => {
        var measurewidth = measureConverter(defdraftfieldobj.masterFieldUom,defdraftfieldobj.masterFieldUom,defdraftfieldobj.masterFieldWidth);
        expect(measurewidth).toBe(100);
    });

    it("draw aspect ratio width/height is correct", () => {
        expect(subwrapper.state().viewHeight).toBe(600);
        expect(subwrapper.state().viewWidth).toBe(300);
    });

    it("shelve list width/height are correctly generating", () => {
        //generating shelve count correct
        expect(subwrapper.state().saveObj.planogramShelfDto.length).toBe(7);
        //first shelve
        expect(subwrapper.state().saveObj.planogramShelfDto[0].drawWidth).toBe(300);
        expect(subwrapper.state().saveObj.planogramShelfDto[0].drawHeight).toBe(72);
    });
});

describe("planogram change left/right without errors", () => {
    submitSets.mockResolvedValue(Promise.resolve({ status: false, extra: null }));
    const wrapper = mount(<MemoryRouter><PlanDunitComponent {...props} /></MemoryRouter>);
    const subwrapper = wrapper.find(PlanDunitComponent);

    subwrapper.setState({ isloadedfielddet: true, isnottesting: false, divWidth: 500, divHeight: 600 });
    subwrapper.instance().reinitSaveObj(defdraftfieldobj);

    it("planogram change left side field", () => {
        subwrapper.find("Col.lrfield-left").simulate("click");
    });

    it("planogram change right side field", () => {
        subwrapper.find("Col.lrfield-right").simulate("click");
    });
});

describe("planogram active display unit drawing without errors", () => {
    submitSets.mockResolvedValue(Promise.resolve({ status: false, extra: null }));
    const wrapper = mount(<MemoryRouter><PlanDunitComponent {...props} /></MemoryRouter>);
    const subwrapper = wrapper.find(PlanDunitComponent);

    subwrapper.setState({ isloadedfielddet: true, isnottesting: false, divWidth: 500, divHeight: 600 });
    subwrapper.instance().reinitSaveObj(defactivefieldobj);
    
    it("generating aspect ratio is correct", () => {
        var aspectratio = AspectRatioDrawBox(defactivefieldobj.masterFieldWidth,defactivefieldobj.masterFieldHeight,500,600);
        expect(aspectratio).toBe(1.6);
    });

    it("generating measure convert is correct", () => {
        var measurewidth = measureConverter(defactivefieldobj.masterFieldUom,defactivefieldobj.masterFieldUom,defactivefieldobj.masterFieldWidth);
        expect(measurewidth).toBe(250);
    });

    it("draw aspect ratio width/height is correct", () => {
        expect(subwrapper.state().viewHeight).toBe(360);
        expect(subwrapper.state().viewWidth).toBe(400);
    });

    it("shelve list width/height are correctly generating", () => {
        //generating shelve count correct
        expect(subwrapper.state().saveObj.planogramShelfDto.length).toBe(5);
        //first shelve
        expect(subwrapper.state().saveObj.planogramShelfDto[0].drawWidth).toBe(400);
        expect(subwrapper.state().saveObj.planogramShelfDto[0].drawHeight).toBe(64);
    });

    it("existing product list finding correctly", () => {
        expect(subwrapper.state().existnewprodlist.length).toBe(1);
    });
});

describe("planogram display unit generally using function works without errors", () => {
    it("checks product is in bottom correctly", () => {
        //check product not in bottom
        var notinbottom = checkProductIsInBottom(0,64,32,15);
        expect(notinbottom).toBeFalsy();
        //check product is in bottom
        var isinbottom = checkProductIsInBottom(0,64,50,14);
        expect(isinbottom).toBeTruthy();
    });
});

var addingproductobj = {
    "productImage": [],
    "id": 1271,
    "width": 10,
    "height": 19.5,
    "uom": "cm",
    "depth": 5,
    "barcode": "7290108354911",
    "productSource": "gs1",
    "gs1Code": "7290108354911",
    "posMappingId": null,
    "lastPriceOfProduct": null,
    "productName": "3 שמפו וג'ל רחצה וגילוחIN1 ק.מן",
    "brandName": "קרמה מן",
    "imageId": 8620,
    "imageUrl": "https://d3ginyfiwc1r8i.cloudfront.net/main/1/7290108354911/795083_W100_100.jpg"
}

var addingshelveobj = {
    planogramShelfChanges: [],
    overLappingDto: [],
    planogramProduct: [],
    id: 11068,
    width: 250,
    gap: 5,
    x: 0,
    y: 288,
    rank: 5,
    height: 40,
    uom: 'cm',
    isDelete: false,
    isNew: false,
    f_uuid: null,
    reverseRowNumber: 1,
    drawWidth: 400,
    drawHeight: 64,
    drawGap: 8,
    bottomY: 5,
    overlappingAllow: true,
    leftPlanogramShelfId: 11063,
    leftPlanogramShelfHeight: 40,
    rightPlanogramShelfId: -1,
    rightPlanogramShelfHeight: 0
  }

var eventmock = { preventDefault: jest.fn(), nativeEvent: { offsetX: 20 } }
var highesteventmock = { preventDefault: jest.fn(), nativeEvent: { offsetX: 20 } }

describe("planogram drop new product works without errors", () => {
    const wrapper = mount(<MemoryRouter><PlanDunitComponent {...props} /></MemoryRouter>);
    const subwrapper = wrapper.find(PlanDunitComponent);

    subwrapper.setState({ isloadedfielddet: true, isnottesting: false, allowovrflwprod: true, divWidth: 500, divHeight: 600, currentDraggableProd: addingproductobj });
    subwrapper.instance().reinitSaveObj(defactivefieldobj);

    it("product added to bottom validates correctly", () => {
        var allowToAddBottom = subwrapper.instance().checkAllowToAdd(eventmock, addingshelveobj, null, addingproductobj, 10, 320.8, 1.6);
        expect(allowToAddBottom).toBeTruthy();
    });

    it("product added overlap leftside position validates correctly", () => {
        var notallowToAddBottom = subwrapper.instance().checkAllowToAdd(eventmock, addingshelveobj, null, addingproductobj, -10, 320.8, 1.6);
        expect(notallowToAddBottom).toBeFalsy();
    });

    it("product added to position correctly", () => {
        subwrapper.instance().droppedNew(eventmock, addingshelveobj, null, 0, false);

        var updatedsaveobj = subwrapper.state().saveObj.planogramShelfDto;
        var addedlocationobj = updatedsaveobj[0].planogramProduct[0].productBlock[0].productLocations[0];
        expect(updatedsaveobj[0].planogramProduct.length).toBe(1);
        expect(addedlocationobj.x).toBe(20);
        expect(addedlocationobj.y).toBe(320.8);
    });

    /* it("product added to highest position correctly", () => {
        
    }); */
});

describe("planogram display unit product overpping works without errors", () => {
    const returnoverlapobj = compareSideToAllowDrop(defactivefieldobj);
    it("shows overlapping shelves correctly", () => {
        expect(returnoverlapobj.planogramShelfDto[0].overlappingAllow).toBeTruthy();
        expect(returnoverlapobj.planogramShelfDto[3].overlappingAllow).toBeFalsy();
    });
});
