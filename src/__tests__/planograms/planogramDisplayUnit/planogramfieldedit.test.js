import { shallow, mount } from 'enzyme';
import {useTranslation} from 'react-i18next';

import FieldDetailsEdit from '../../../components/planograms/planDisplayUnit/fielddetailsedit';

jest.mock('react-i18next', () => ({
    useTranslation: () => {
      return {
        t: (str) => str,
      };
    },
}));

let testsaveobj = {
    "planogramShelfDto": [
        {
            "planogramShelfChanges": [],
            "overLappingDto": [],
            "planogramProduct": [],
            "id": 12125,
            "width": 3,
            "gap": 0.1,
            "x": 0,
            "y": 0,
            "rank": 1,
            "height": 0.5,
            "uom": "meters",
            "isDelete": false,
            "isNew": false,
            "f_uuid": null,
            "reverseRowNumber": 3
        },
        {
            "planogramShelfChanges": [],
            "overLappingDto": [],
            "planogramProduct": [],
            "id": 12126,
            "width": 3,
            "gap": 0.1,
            "x": 0,
            "y": 130.4,
            "rank": 2,
            "height": 0.5,
            "uom": "meters",
            "isDelete": false,
            "isNew": false,
            "f_uuid": null,
            "reverseRowNumber": 2
        },
        {
            "planogramShelfChanges": [],
            "overLappingDto": [],
            "planogramProduct": [],
            "id": 12127,
            "width": 3,
            "gap": 0.1,
            "x": 0,
            "y": 260.8,
            "rank": 3,
            "height": 0.5,
            "uom": "meters",
            "isDelete": false,
            "isNew": false,
            "f_uuid": null,
            "reverseRowNumber": 1
        }
    ],
    "id": 3926,
    "x": 0.825,
    "y": 1.115234375,
    "width": 3,
    "height": 0.5,
    "uuid": "1b24eaf5-3a79-441d-ba4e-8f717362a245",
    "notes": "",
    "fieldVer": 0,
    "uom": "meters",
    "rotation": 0,
    "isDelete": false,
    "isNew": false,
    "f_uuid": "a25b16fe-c615-42cc-84aa-46ada656d806",
    "positionNumberInAisle": 0,
    "noInFloorLayout": 2,
    "depth": 0,
    "masterFieldDepth": 0.5,
    "masterFieldHeight": 1.8,
    "masterFieldWidth": 3,
    "masterFieldUom": "meters",
    "isHasAiImage": false,
    "isFieldLocationChange": true,
    "isFieldProductChange": false,
    "isLeftChange": true,
    "isRightChange": false,
    "baseLocationX": 0,
    "baseLocationY": 0,
    "isFieldCopy": true,
    "fieldSafetyMargin": 0,
    "isProductOverLapping": false,
    "storeId": 12,
    "floorLayoutId": 602,
    "floorLayoutStatus": "DRAFT",
    "isHaveBaseFloorVersion": false,
    "baseFloorLayoutId": 0,
    "baseFloorLayoutVersion": "",
    "floorLayoutVersion": "0.0.0 draft - 1",
    "department": {
        "startIndex": 0,
        "maxResult": 0,
        "departmentId": 8,
        "name": "Milk Department",
        "color": "#3e00ff"
    },
    "fieldDto": {
        "shelf": [
            {
                "width": 3,
                "height": 0.5,
                "uom": "meters",
                "gap": 0.1,
                "x": 0,
                "y": 0,
                "rank": 1,
                "id": 428,
                "reverseRowNumber": 3
            },
            {
                "width": 3,
                "height": 0.5,
                "uom": "meters",
                "gap": 0.1,
                "x": 0,
                "y": 130.4,
                "rank": 2,
                "id": 429,
                "reverseRowNumber": 2
            },
            {
                "width": 3,
                "height": 0.5,
                "uom": "meters",
                "gap": 0.1,
                "x": 0,
                "y": 260.8,
                "rank": 3,
                "id": 430,
                "reverseRowNumber": 1
            }
        ],
        "fieldName": "MRT-DU-02",
        "width": 3,
        "height": 1.8,
        "depth": 0.5,
        "uom": "meters",
        "id": 87,
        "remark": ""
    },
    "floorId": 52,
    "floorName": "THE",
    "leftSidePlanogramFieldDto": {
        "planogramShelfDto": [],
        "id": 3927,
        "x": 3.825,
        "y": 1.115234375,
        "width": 3,
        "height": 0.5,
        "uuid": "224cdc62-0cad-48b7-96a3-f708d23a2283",
        "notes": "",
        "fieldVer": 0,
        "uom": "meters",
        "rotation": 0,
        "isDelete": false,
        "isNew": false,
        "f_uuid": "cd64ce39-157e-4d4a-8d85-20ff9f3d0ba4",
        "positionNumberInAisle": 0,
        "noInFloorLayout": 3,
        "depth": 0,
        "masterFieldDepth": 0.5,
        "masterFieldHeight": 1.8,
        "masterFieldWidth": 3,
        "masterFieldUom": "meters",
        "isHasAiImage": false,
        "isFieldLocationChange": true,
        "isFieldProductChange": false,
        "isLeftChange": false,
        "isRightChange": true,
        "baseLocationX": 0,
        "baseLocationY": 0,
        "isFieldCopy": true,
        "fieldSafetyMargin": 0,
        "isProductOverLapping": false,
        "department": {
            "startIndex": 0,
            "maxResult": 0,
            "departmentId": 8,
            "name": "Milk Department",
            "color": "#3e00ff"
        },
        "fieldDto": {
            "shelf": [],
            "fieldName": "MRT-DU-02",
            "width": 3,
            "height": 1.8,
            "depth": 0.5,
            "uom": "meters",
            "id": 87,
            "remark": ""
        }
    }
}

let props = {
    t: jest.fn(),
    isRTL: "rtl",
    dmode: true,
    isenablefieldedit: true,
    isshowedit: true,
    bkpSaveObj: testsaveobj,
    saveObj: testsaveobj,
    toggleeditview: jest.fn(),
    handlefieldedit: jest.fn(),
};

describe("planogram field edit data loads without errors", () => {
    const wrapper = mount(<FieldDetailsEdit {...props} />);
    
    it("planogram field edit data loading without renders", () => {
        expect(wrapper.find("input#fedit-height").prop("value")).toBe(1.8);
        expect(wrapper.find(".NDUrackparams").length).toBe(3);
    });

    it("planogram field edit height edit without renders", () => {
        wrapper.find("input#fedit-height").simulate("change", {target: { value: 2.0 }});
        expect(wrapper.find("input#fedit-height").prop("value")).toBe(2.0);
    });

    it("planogram field edit row details edit without renders", () => {
        wrapper.find(".NDUrackparams").at(0).find("input.feditrow-height").simulate("change", {target: { value: 0.6 }});
        expect(wrapper.find(".NDUrackparams").at(0).find("input.feditrow-height").prop("value")).toBe(0.6);
    });

    it("planogram field edit new shelve add works without renders", () => {
        wrapper.find("Button#ndfedit-addshelve").simulate("click");
        expect(wrapper.find(".NDUrackparams").length).toBe(4);
    });

    it("planogram field edit shelve remove works without renders", () => {
        wrapper.find(".NDUrackparams").at(3).find(".removerow-link").simulate("click");
        expect(wrapper.find(".NDUrackparams").length).toBe(3);
    });

    it("planogram field edit data validate works without renders", () => {
        wrapper.find(".edit-toggle").simulate("click");
    });

    it("planogram field edit reset details works without renders", () => {
        wrapper.find("Button#resetedit-fdetails").simulate("click");
    });
});