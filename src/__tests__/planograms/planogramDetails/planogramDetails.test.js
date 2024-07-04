import { shallow } from 'enzyme';
import PlanogramDetails, { PlanogramDetails as PlanogramDetailsOriginal } from '../../../components/planograms/planogramDetails/PlanogramDetails';
import { createMemoryHistory } from 'history';
const historyMock = createMemoryHistory({ initialEntries: ['/planograms/details'] });


const reduxstate = {
    "changeinplano": true,
    "activePlanoShow": false,
    "activeplanogram": null,
    "snap": false,
    "Feildnoshow": 1,
    "selectedarray": {
        "width": 20,
        "height": 10
    },
    "planFloorObj": {
        "planogramTags": [],
        "aisles": [
            {
                "fields": [
                    {
                        "planogramShelfDto": [],
                        "id": 2874,
                        "x": 5.568326947637293,
                        "y": 3.090676883780332,
                        "width": 2,
                        "height": 0.5,
                        "uuid": "3a25fb52-0495-4bb6-a8a6-d85cf7d7541f",
                        "notes": "",
                        "fieldVer": 0,
                        "uom": "meters",
                        "rotation": 0,
                        "isDelete": false,
                        "isNew": false,
                        "f_uuid": "7c6c5dc0-b4dd-4faf-acb1-e748877337af",
                        "positionNumberInAisle": 0,
                        "noInFloorLayout": 1,
                        "depth": 0,
                        "masterFieldDepth": 0.5,
                        "masterFieldHeight": 1,
                        "masterFieldWidth": 2,
                        "masterFieldUom": "meters",
                        "isHasAiImage": false,
                        "isFieldLocationChange": false,
                        "isFieldProductChange": false,
                        "isLeftChange": true,
                        "isRightChange": false,
                        "baseLocationX": 5.568326947637293,
                        "baseLocationY": 3.090676883780332,
                        "isFieldCopy": false,
                        "fieldSafetyMargin": 0,
                        "isProductOverLapping": false,
                        "department": {
                            "startIndex": 0,
                            "maxResult": 0,
                            "departmentId": 11,
                            "name": "DP-01",
                            "color": "#00ff4c"
                        },
                        "mainFieldId": 192,
                        "mainFieldUUID": "3a25fb52-0495-4bb6-a8a6-d85cf7d7541f",
                        "fieldDto": {
                            "shelf": [],
                            "fieldName": "DP-01",
                            "width": 2,
                            "height": 1,
                            "depth": 0.5,
                            "uom": "meters",
                            "id": 40,
                            "remark": ""
                        },
                        "leftSideFieldDto": {
                            "id": 3651,
                            "leftFloorFieldId": 2875,
                            "leftFloorFieldInfo": {
                                "planogramShelfDto": [],
                                "id": 2875,
                                "uuid": "2e286817-2717-4eac-90b4-1dd68a1764f6",
                                "isProductOverLapping": false
                            }
                        }
                    },
                    {
                        "planogramShelfDto": [],
                        "id": 2875,
                        "x": 7.568326947637291,
                        "y": 3.090676883780332,
                        "width": 2,
                        "height": 0.5,
                        "uuid": "2e286817-2717-4eac-90b4-1dd68a1764f6",
                        "notes": "",
                        "fieldVer": 2,
                        "uom": "meters",
                        "rotation": 0,
                        "isDelete": false,
                        "isNew": false,
                        "f_uuid": "49a0672a-a427-4aca-9649-8908aebc384a",
                        "positionNumberInAisle": 0,
                        "noInFloorLayout": 2,
                        "depth": 0,
                        "masterFieldDepth": 0.5,
                        "masterFieldHeight": 1,
                        "masterFieldWidth": 2,
                        "masterFieldUom": "meters",
                        "isHasAiImage": false,
                        "isFieldLocationChange": true,
                        "isFieldProductChange": true,
                        "isLeftChange": true,
                        "isRightChange": true,
                        "baseLocationX": 7.568582375478927,
                        "baseLocationY": 3.090676883780332,
                        "isFieldCopy": true,
                        "fieldSafetyMargin": 0,
                        "isProductOverLapping": false,
                        "department": {
                            "startIndex": 0,
                            "maxResult": 0,
                            "departmentId": 11,
                            "name": "DP-01",
                            "color": "#00ff4c"
                        },
                        "mainFieldId": 193,
                        "mainFieldUUID": "2e286817-2717-4eac-90b4-1dd68a1764f6",
                        "fieldDto": {
                            "shelf": [],
                            "fieldName": "DP-01",
                            "width": 2,
                            "height": 1,
                            "depth": 0.5,
                            "uom": "meters",
                            "id": 40,
                            "remark": ""
                        },
                        "leftSideFieldDto": {
                            "id": 3652,
                            "leftFloorFieldId": 2876,
                            "leftFloorFieldInfo": {
                                "planogramShelfDto": [],
                                "id": 2876,
                                "uuid": "bc8c925a-9b46-4a94-90f4-3e5a8bf6a0af",
                                "isProductOverLapping": false
                            }
                        },
                        "rightSideFieldDto": {
                            "id": 3712,
                            "rightFloorFieldId": 2874,
                            "rightFloorFieldInfo": {
                                "planogramShelfDto": [],
                                "id": 2874,
                                "uuid": "3a25fb52-0495-4bb6-a8a6-d85cf7d7541f",
                                "isProductOverLapping": false
                            }
                        }
                    },
                    {
                        "planogramShelfDto": [],
                        "id": 2876,
                        "x": 9.56832694763729,
                        "y": 3.090676883780332,
                        "width": 2,
                        "height": 0.5,
                        "uuid": "bc8c925a-9b46-4a94-90f4-3e5a8bf6a0af",
                        "notes": "",
                        "fieldVer": 2,
                        "uom": "meters",
                        "rotation": 0,
                        "isDelete": false,
                        "isNew": false,
                        "f_uuid": "337b21de-1899-4793-910d-3735460bcd68",
                        "positionNumberInAisle": 0,
                        "noInFloorLayout": 3,
                        "depth": 0,
                        "masterFieldDepth": 0.5,
                        "masterFieldHeight": 1,
                        "masterFieldWidth": 2,
                        "masterFieldUom": "meters",
                        "isHasAiImage": false,
                        "isFieldLocationChange": true,
                        "isFieldProductChange": true,
                        "isLeftChange": false,
                        "isRightChange": true,
                        "baseLocationX": 9.568837803320562,
                        "baseLocationY": 3.090676883780332,
                        "isFieldCopy": true,
                        "fieldSafetyMargin": 0,
                        "isProductOverLapping": false,
                        "department": {
                            "startIndex": 0,
                            "maxResult": 0,
                            "departmentId": 11,
                            "name": "DP-01",
                            "color": "#00ff4c"
                        },
                        "mainFieldId": 196,
                        "mainFieldUUID": "bc8c925a-9b46-4a94-90f4-3e5a8bf6a0af",
                        "fieldDto": {
                            "shelf": [],
                            "fieldName": "DP-01",
                            "width": 2,
                            "height": 1,
                            "depth": 0.5,
                            "uom": "meters",
                            "id": 40,
                            "remark": ""
                        },
                        "rightSideFieldDto": {
                            "id": 3713,
                            "rightFloorFieldId": 2875,
                            "rightFloorFieldInfo": {
                                "planogramShelfDto": [],
                                "id": 2875,
                                "uuid": "2e286817-2717-4eac-90b4-1dd68a1764f6",
                                "isProductOverLapping": false
                            }
                        }
                    }
                ],
                "id": 1288,
                "width": 2,
                "height": 0.5,
                "x": 9.56832694763729,
                "y": 3.090676883780332,
                "uuid": "e5364614-c30b-4dfc-9a12-72b6f581cd72",
                "no": 0,
                "aisleVer": 0,
                "uom": "meters",
                "f_uuid": "12ef4a7c-99b3-4ce8-9654-1c4015df5b28",
                "rotation": 0,
                "isDelete": false,
                "isNew": false
            },
            {
                "fields": [
                    {
                        "planogramShelfDto": [],
                        "id": 2877,
                        "x": 5.568326947637293,
                        "y": 4.980842911877395,
                        "width": 2,
                        "height": 0.5,
                        "uuid": "2bc68013-f46b-42d3-a800-19f54755a301",
                        "notes": "",
                        "fieldVer": 0,
                        "uom": "meters",
                        "rotation": 0,
                        "isDelete": false,
                        "isNew": false,
                        "f_uuid": "44b3c971-2b73-4967-ae2b-d75f455c45cd",
                        "positionNumberInAisle": 0,
                        "noInFloorLayout": 1,
                        "depth": 0,
                        "masterFieldDepth": 0.5,
                        "masterFieldHeight": 1,
                        "masterFieldWidth": 2,
                        "masterFieldUom": "meters",
                        "isHasAiImage": false,
                        "isFieldLocationChange": false,
                        "isFieldProductChange": false,
                        "isLeftChange": false,
                        "isRightChange": false,
                        "baseLocationX": 5.568326947637293,
                        "baseLocationY": 4.980842911877395,
                        "isFieldCopy": false,
                        "fieldSafetyMargin": 0,
                        "isProductOverLapping": false,
                        "department": {
                            "startIndex": 0,
                            "maxResult": 0,
                            "departmentId": 10,
                            "name": "Beauty",
                            "color": "#e71818"
                        },
                        "mainFieldId": 194,
                        "mainFieldUUID": "2bc68013-f46b-42d3-a800-19f54755a301",
                        "fieldDto": {
                            "shelf": [],
                            "fieldName": "DP-01",
                            "width": 2,
                            "height": 1,
                            "depth": 0.5,
                            "uom": "meters",
                            "id": 40,
                            "remark": ""
                        },
                        "leftSideFieldDto": {
                            "id": 3653,
                            "leftFloorFieldId": 2878,
                            "leftFloorFieldInfo": {
                                "planogramShelfDto": [],
                                "id": 2878,
                                "uuid": "bc48859e-9d8f-4579-ab3b-15c4640d4ca4",
                                "isProductOverLapping": false
                            }
                        }
                    },
                    {
                        "planogramShelfDto": [],
                        "id": 2878,
                        "x": 7.568582375478927,
                        "y": 4.980842911877395,
                        "width": 2,
                        "height": 0.5,
                        "uuid": "bc48859e-9d8f-4579-ab3b-15c4640d4ca4",
                        "notes": "",
                        "fieldVer": 1,
                        "uom": "meters",
                        "rotation": 0,
                        "isDelete": false,
                        "isNew": false,
                        "f_uuid": "f4677efc-5eaf-4de1-82ea-c9c2ea6be767",
                        "positionNumberInAisle": 0,
                        "noInFloorLayout": 2,
                        "depth": 0,
                        "masterFieldDepth": 0.5,
                        "masterFieldHeight": 1,
                        "masterFieldWidth": 2,
                        "masterFieldUom": "meters",
                        "isHasAiImage": false,
                        "isFieldLocationChange": false,
                        "isFieldProductChange": true,
                        "isLeftChange": false,
                        "isRightChange": false,
                        "baseLocationX": 7.568582375478927,
                        "baseLocationY": 4.980842911877395,
                        "isFieldCopy": true,
                        "fieldSafetyMargin": 0,
                        "isProductOverLapping": false,
                        "department": {
                            "startIndex": 0,
                            "maxResult": 0,
                            "departmentId": 10,
                            "name": "Beauty",
                            "color": "#e71818"
                        },
                        "mainFieldId": 195,
                        "mainFieldUUID": "bc48859e-9d8f-4579-ab3b-15c4640d4ca4",
                        "fieldDto": {
                            "shelf": [],
                            "fieldName": "DP-01",
                            "width": 2,
                            "height": 1,
                            "depth": 0.5,
                            "uom": "meters",
                            "id": 40,
                            "remark": ""
                        },
                        "rightSideFieldDto": {
                            "id": 3714,
                            "rightFloorFieldId": 2877,
                            "rightFloorFieldInfo": {
                                "planogramShelfDto": [],
                                "id": 2877,
                                "uuid": "2bc68013-f46b-42d3-a800-19f54755a301",
                                "isProductOverLapping": false
                            }
                        }
                    }
                ],
                "id": 1289,
                "width": 2,
                "height": 0.5,
                "x": 5.568326947637293,
                "y": 4.980842911877395,
                "uuid": "19584acb-29fe-4868-8aab-e297585d1dbe",
                "no": 0,
                "aisleVer": 0,
                "uom": "meters",
                "f_uuid": "3baabd54-8984-4492-98c6-c7e4e88650cc",
                "rotation": 0,
                "isDelete": false,
                "isNew": false
            }
        ],
        "deletedMainFieldInfo": [],
        "aisleVer": 0,
        "blockVer": 0,
        "canvasData": null,
        "fieldVer": 0,
        "flowLayoutVer": 0,
        "id": 459,
        "layoutHeight": null,
        "layoutOrigin": "from_active_version",
        "layoutStatus": "DRAFT",
        "layoutWidth": null,
        "mainVersion": "1.1.0 draft - 12",
        "productLocationVer": 0,
        "productVer": 0,
        "shelfVer": 0,
        "uom": "meters",
        "isDelete": false,
        "isNew": false,
        "date": "2021-10-07T04:13:41.659Z",
        "floorSvg": null,
        "floorX": 0,
        "floorY": 0,
        "floorImageX": 0,
        "floorImageY": 0,
        "floorImageWidth": 0,
        "floorImageHeight": 0,
        "floorHeight": 10,
        "floorWidth": 20,
        "layoutBaseVersionId": 170,
        "activeDate": "2021-09-22T12:41:24.000Z",
        "imageId": 9097,
        "imageUrl": "https://staging-res.s3.eu-west-3.amazonaws.com/temp/ZCRZeNxtexcquv00x2d9dFLR_1633669172665.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=AKIARRBCRW2FIEQDSZOR%2F20211013%2Feu-west-3%2Fs3%2Faws4_request&X-Amz-Date=20211013T120824Z&X-Amz-Expires=604800&X-Amz-Signature=c5b078bb6c0d827c28958b572017d7ec8f9e06f95ce6cb0914da6b5a7266002b&X-Amz-SignedHeaders=host",
        "floor": {
            "flowWidth": 20,
            "flowHeight": 10,
            "id": 36,
            "uom": "meters",
            "svg": "<svg preserveAspectRatio=\"none\" xmlns=\"http://www.w3.org/2000/svg\" class=\"PDmap\" height=\"310\" width=\"620\" style=\"border: 2px solid rgb(204, 204, 204);\"><defs><pattern id=\"img1\" patternUnits=\"userSpaceOnUse\" width=\"620\" height=\"310\"><image x=\"0\" y=\"0\" width=\"620\" height=\"310\"></image></pattern></defs><rect fill=\"url(#img1)\" y=\"0\" x=\"0\" height=\"310\" width=\"620\"></rect></svg>",
            "x": 0,
            "y": 0,
            "name": "FL-01",
            "imageWidth": 0,
            "imageHeight": 0,
            "imageX": 0,
            "imageY": 0
        }
    },
    "imgloading": true,
    "loadingscreen": false,
    "viewHeight": 391.5,
    "viewWidth": 783,
    "isselectedfloor": true,
    "isedit": true,
    "sobj": {
        "FloorName": "FL-01",
        "FloorId": 36,
        "floor": 36
    },
    "floorlist": [
        {
            "startIndex": 0,
            "maxResult": 0,
            "id": 36,
            "name": "FL-01",
            "width": 20,
            "height": 10,
            "uom": "meters"
        }
    ],
    "DunitList": [],
    "rects": [
        {
            "fields": [
                {
                    "planogramShelfDto": [],
                    "id": 2874,
                    "x": 218,
                    "y": 120.99999999999999,
                    "width": 78.3,
                    "height": 19.575,
                    "uuid": "3a25fb52-0495-4bb6-a8a6-d85cf7d7541f",
                    "notes": "",
                    "fieldVer": 0,
                    "uom": "meters",
                    "rotation": 0,
                    "isDelete": false,
                    "isNew": false,
                    "f_uuid": "7c6c5dc0-b4dd-4faf-acb1-e748877337af",
                    "positionNumberInAisle": 0,
                    "noInFloorLayout": 1,
                    "depth": 0,
                    "masterFieldDepth": 0.5,
                    "masterFieldHeight": 1,
                    "masterFieldWidth": 2,
                    "masterFieldUom": "meters",
                    "isHasAiImage": false,
                    "isFieldLocationChange": false,
                    "isFieldProductChange": false,
                    "isLeftChange": true,
                    "isRightChange": false,
                    "baseLocationX": 5.568326947637293,
                    "baseLocationY": 3.090676883780332,
                    "isFieldCopy": false,
                    "fieldSafetyMargin": 0,
                    "isProductOverLapping": false,
                    "department": {
                        "startIndex": 0,
                        "maxResult": 0,
                        "departmentId": 11,
                        "name": "DP-01",
                        "color": "#00ff4c"
                    },
                    "mainFieldId": 192,
                    "mainFieldUUID": "3a25fb52-0495-4bb6-a8a6-d85cf7d7541f",
                    "fieldDto": {
                        "shelf": [],
                        "fieldName": "DP-01",
                        "width": 2,
                        "height": 1,
                        "depth": 0.5,
                        "uom": "meters",
                        "id": 40,
                        "remark": ""
                    },
                    "leftSideFieldDto": {
                        "id": 3651,
                        "leftFloorFieldId": 2875,
                        "leftFloorFieldInfo": {
                            "planogramShelfDto": [],
                            "id": 2875,
                            "uuid": "2e286817-2717-4eac-90b4-1dd68a1764f6",
                            "isProductOverLapping": false
                        }
                    },
                    "drawDepth": 19.575,
                    "drawWidth": 78.3
                },
                {
                    "planogramShelfDto": [],
                    "id": 2875,
                    "x": 296.29999999999995,
                    "y": 120.99999999999999,
                    "width": 78.3,
                    "height": 19.575,
                    "uuid": "2e286817-2717-4eac-90b4-1dd68a1764f6",
                    "notes": "",
                    "fieldVer": 2,
                    "uom": "meters",
                    "rotation": 0,
                    "isDelete": false,
                    "isNew": false,
                    "f_uuid": "49a0672a-a427-4aca-9649-8908aebc384a",
                    "positionNumberInAisle": 0,
                    "noInFloorLayout": 2,
                    "depth": 0,
                    "masterFieldDepth": 0.5,
                    "masterFieldHeight": 1,
                    "masterFieldWidth": 2,
                    "masterFieldUom": "meters",
                    "isHasAiImage": false,
                    "isFieldLocationChange": true,
                    "isFieldProductChange": true,
                    "isLeftChange": true,
                    "isRightChange": true,
                    "baseLocationX": 7.568582375478927,
                    "baseLocationY": 3.090676883780332,
                    "isFieldCopy": true,
                    "fieldSafetyMargin": 0,
                    "isProductOverLapping": false,
                    "department": {
                        "startIndex": 0,
                        "maxResult": 0,
                        "departmentId": 11,
                        "name": "DP-01",
                        "color": "#00ff4c"
                    },
                    "mainFieldId": 193,
                    "mainFieldUUID": "2e286817-2717-4eac-90b4-1dd68a1764f6",
                    "fieldDto": {
                        "shelf": [],
                        "fieldName": "DP-01",
                        "width": 2,
                        "height": 1,
                        "depth": 0.5,
                        "uom": "meters",
                        "id": 40,
                        "remark": ""
                    },
                    "leftSideFieldDto": {
                        "id": 3652,
                        "leftFloorFieldId": 2876,
                        "leftFloorFieldInfo": {
                            "planogramShelfDto": [],
                            "id": 2876,
                            "uuid": "bc8c925a-9b46-4a94-90f4-3e5a8bf6a0af",
                            "isProductOverLapping": false
                        }
                    },
                    "rightSideFieldDto": {
                        "id": 3712,
                        "rightFloorFieldId": 2874,
                        "rightFloorFieldInfo": {
                            "planogramShelfDto": [],
                            "id": 2874,
                            "uuid": "3a25fb52-0495-4bb6-a8a6-d85cf7d7541f",
                            "isProductOverLapping": false
                        }
                    },
                    "drawDepth": 19.575,
                    "drawWidth": 78.3
                },
                {
                    "planogramShelfDto": [],
                    "id": 2876,
                    "x": 374.5999999999999,
                    "y": 120.99999999999999,
                    "width": 78.3,
                    "height": 19.575,
                    "uuid": "bc8c925a-9b46-4a94-90f4-3e5a8bf6a0af",
                    "notes": "",
                    "fieldVer": 2,
                    "uom": "meters",
                    "rotation": 0,
                    "isDelete": false,
                    "isNew": false,
                    "f_uuid": "337b21de-1899-4793-910d-3735460bcd68",
                    "positionNumberInAisle": 0,
                    "noInFloorLayout": 3,
                    "depth": 0,
                    "masterFieldDepth": 0.5,
                    "masterFieldHeight": 1,
                    "masterFieldWidth": 2,
                    "masterFieldUom": "meters",
                    "isHasAiImage": false,
                    "isFieldLocationChange": true,
                    "isFieldProductChange": true,
                    "isLeftChange": false,
                    "isRightChange": true,
                    "baseLocationX": 9.568837803320562,
                    "baseLocationY": 3.090676883780332,
                    "isFieldCopy": true,
                    "fieldSafetyMargin": 0,
                    "isProductOverLapping": false,
                    "department": {
                        "startIndex": 0,
                        "maxResult": 0,
                        "departmentId": 11,
                        "name": "DP-01",
                        "color": "#00ff4c"
                    },
                    "mainFieldId": 196,
                    "mainFieldUUID": "bc8c925a-9b46-4a94-90f4-3e5a8bf6a0af",
                    "fieldDto": {
                        "shelf": [],
                        "fieldName": "DP-01",
                        "width": 2,
                        "height": 1,
                        "depth": 0.5,
                        "uom": "meters",
                        "id": 40,
                        "remark": ""
                    },
                    "rightSideFieldDto": {
                        "id": 3713,
                        "rightFloorFieldId": 2875,
                        "rightFloorFieldInfo": {
                            "planogramShelfDto": [],
                            "id": 2875,
                            "uuid": "2e286817-2717-4eac-90b4-1dd68a1764f6",
                            "isProductOverLapping": false
                        }
                    },
                    "drawDepth": 19.575,
                    "drawWidth": 78.3
                }
            ],
            "id": 1288,
            "width": 78.3,
            "height": 19.575,
            "x": 374.5999999999999,
            "y": 120.99999999999999,
            "uuid": "e5364614-c30b-4dfc-9a12-72b6f581cd72",
            "no": 0,
            "aisleVer": 0,
            "uom": "meters",
            "f_uuid": "12ef4a7c-99b3-4ce8-9654-1c4015df5b28",
            "rotation": 0,
            "isDelete": false,
            "isNew": false
        },
        {
            "fields": [
                {
                    "planogramShelfDto": [],
                    "id": 2877,
                    "x": 218,
                    "y": 195,
                    "width": 78.3,
                    "height": 19.575,
                    "uuid": "2bc68013-f46b-42d3-a800-19f54755a301",
                    "notes": "",
                    "fieldVer": 0,
                    "uom": "meters",
                    "rotation": 0,
                    "isDelete": false,
                    "isNew": false,
                    "f_uuid": "44b3c971-2b73-4967-ae2b-d75f455c45cd",
                    "positionNumberInAisle": 0,
                    "noInFloorLayout": 1,
                    "depth": 0,
                    "masterFieldDepth": 0.5,
                    "masterFieldHeight": 1,
                    "masterFieldWidth": 2,
                    "masterFieldUom": "meters",
                    "isHasAiImage": false,
                    "isFieldLocationChange": false,
                    "isFieldProductChange": false,
                    "isLeftChange": true,
                    "isRightChange": false,
                    "baseLocationX": 5.568326947637293,
                    "baseLocationY": 4.980842911877395,
                    "isFieldCopy": false,
                    "fieldSafetyMargin": 0,
                    "isProductOverLapping": false,
                    "department": {
                        "startIndex": 0,
                        "maxResult": 0,
                        "departmentId": 10,
                        "name": "Beauty",
                        "color": "#e71818"
                    },
                    "mainFieldId": 194,
                    "mainFieldUUID": "2bc68013-f46b-42d3-a800-19f54755a301",
                    "fieldDto": {
                        "shelf": [],
                        "fieldName": "DP-01",
                        "width": 2,
                        "height": 1,
                        "depth": 0.5,
                        "uom": "meters",
                        "id": 40,
                        "remark": ""
                    },
                    "leftSideFieldDto": {
                        "id": 3653,
                        "leftFloorFieldId": 2878,
                        "leftFloorFieldInfo": {
                            "planogramShelfDto": [],
                            "id": 2878,
                            "uuid": "bc48859e-9d8f-4579-ab3b-15c4640d4ca4",
                            "isProductOverLapping": false
                        },
                        "isDelete": true,
                        "isNew": false
                    },
                    "drawDepth": 19.575,
                    "drawWidth": 78.3
                }
            ],
            "id": 1289,
            "width": 78.3,
            "height": 19.575,
            "x": 330.85,
            "y": 203.2125,
            "uuid": "19584acb-29fe-4868-8aab-e297585d1dbe",
            "no": 0,
            "aisleVer": 0,
            "uom": "meters",
            "f_uuid": "3baabd54-8984-4492-98c6-c7e4e88650cc",
            "rotation": 0,
            "isDelete": false,
            "isNew": false
        },
        {
            "id": -1,
            "f_uuid": "5b161c43-58da-4195-952f-161d726b602d",
            "x": 354.85,
            "y": 210.2125,
            "uom": "meters",
            "rotation": 0,
            "fill": "red",
            "fields": [
                {
                    "planogramShelfDto": [],
                    "id": 2878,
                    "x": 354.85,
                    "y": 210.2125,
                    "width": 78.3,
                    "height": 19.575,
                    "uuid": "bc48859e-9d8f-4579-ab3b-15c4640d4ca4",
                    "notes": "",
                    "fieldVer": 1,
                    "uom": "meters",
                    "rotation": 0,
                    "isDelete": false,
                    "isNew": false,
                    "f_uuid": "f4677efc-5eaf-4de1-82ea-c9c2ea6be767",
                    "positionNumberInAisle": 0,
                    "noInFloorLayout": 2,
                    "depth": 0,
                    "masterFieldDepth": 0.5,
                    "masterFieldHeight": 1,
                    "masterFieldWidth": 2,
                    "masterFieldUom": "meters",
                    "isHasAiImage": false,
                    "isFieldLocationChange": false,
                    "isFieldProductChange": true,
                    "isLeftChange": false,
                    "isRightChange": true,
                    "baseLocationX": 7.568582375478927,
                    "baseLocationY": 4.980842911877395,
                    "isFieldCopy": true,
                    "fieldSafetyMargin": 0,
                    "isProductOverLapping": false,
                    "department": {
                        "startIndex": 0,
                        "maxResult": 0,
                        "departmentId": 10,
                        "name": "Beauty",
                        "color": "#e71818"
                    },
                    "mainFieldId": 195,
                    "mainFieldUUID": "bc48859e-9d8f-4579-ab3b-15c4640d4ca4",
                    "fieldDto": {
                        "shelf": [],
                        "fieldName": "DP-01",
                        "width": 2,
                        "height": 1,
                        "depth": 0.5,
                        "uom": "meters",
                        "id": 40,
                        "remark": ""
                    },
                    "rightSideFieldDto": {
                        "id": 3714,
                        "rightFloorFieldId": 2877,
                        "rightFloorFieldInfo": {
                            "planogramShelfDto": [],
                            "id": 2877,
                            "uuid": "2bc68013-f46b-42d3-a800-19f54755a301",
                            "isProductOverLapping": false
                        },
                        "isDelete": true,
                        "isNew": false
                    },
                    "drawDepth": 19.575,
                    "drawWidth": 78.3
                }
            ],
            "isNew": true,
            "isDelete": false
        }
    ],
    "editObjId": 459,
    "QRobj": {},
    "QRisle": {},
    "drawratio": 39.15,
    "prodClickX": 0,
    "prodClickY": 0,
    "currentDraggableProd": null,
    "isShowProdView": false,
    "isshowQRpanel": false,
    "QRrackIMG": "",
    "isListViewActive": "LIST",
    "loadDunitList": [
        {
            "shelf": [
                {
                    "width": 2,
                    "height": 0.4,
                    "uom": "meters",
                    "gap": 0.1,
                    "x": 0,
                    "y": 0,
                    "rank": 1,
                    "id": 269,
                    "reverseRowNumber": 2
                },
                {
                    "width": 2,
                    "height": 0.4,
                    "uom": "meters",
                    "gap": 0.1,
                    "x": 0,
                    "y": 163,
                    "rank": 2,
                    "id": 270,
                    "reverseRowNumber": 1
                }
            ],
            "fieldName": "DP-01",
            "width": 2,
            "height": 1,
            "depth": 0.5,
            "uom": "meters",
            "id": 40,
            "remark": ""
        }
    ],
    "recentDUnitList": [
        {
            "shelf": [
                {
                    "width": 2,
                    "height": 0.4,
                    "uom": "meters",
                    "gap": 0.1,
                    "x": 0,
                    "y": 0,
                    "rank": 1,
                    "id": 269,
                    "reverseRowNumber": 2
                },
                {
                    "width": 2,
                    "height": 0.4,
                    "uom": "meters",
                    "gap": 0.1,
                    "x": 0,
                    "y": 163,
                    "rank": 2,
                    "id": 270,
                    "reverseRowNumber": 1
                }
            ],
            "fieldName": "DP-01",
            "width": 2,
            "height": 1,
            "depth": 0.5,
            "uom": "meters",
            "id": 40,
            "remark": ""
        }
    ],
    "filteredDUnitList": [],
    "loadedDeptList": [
        {
            "startIndex": 0,
            "maxResult": 0,
            "departmentId": 12,
            "name": "DP-02",
            "color": "#00a19d"
        },
        {
            "startIndex": 0,
            "maxResult": 0,
            "departmentId": 11,
            "name": "DP-01",
            "color": "#00ff4c"
        },
        {
            "startIndex": 0,
            "maxResult": 0,
            "departmentId": 10,
            "name": "Beauty",
            "color": "#e71818"
        },
        {
            "startIndex": 0,
            "maxResult": 0,
            "departmentId": 9,
            "name": "שימורים",
            "color": "#faff00"
        },
        {
            "startIndex": 0,
            "maxResult": 0,
            "departmentId": 8,
            "name": "Milk Department",
            "color": "#3e00ff"
        },
        {
            "startIndex": 0,
            "maxResult": 0,
            "departmentId": 7,
            "name": "Chocalate Department",
            "color": "#28ffef"
        }
    ],
    "isviewcmenu": false,
    "contxtmenu": null,
    "rotateStart": false,
    "rotationAngel": 0,
    "rotationstartx": 0,
    "currentSelectedRef": null,
    "prevrotation": 0,
    "stobj": {
        "tagName": "",
        "isReqPagination": false,
        "startIndex": 0,
        "maxResult": 10
    },
    "toridata": [],
    "addedTags": [],
    "newtag": {
        "tagName": ""
    },
    "tagModalType": 1,
    "imgAllow": true,
    "shareModalShow": false,
    "qrShareObj": {
        "email": "",
        "imgpath": ""
    },
    "DrawUOM": "meters",
    "toUploadImages": null,
    "loadedFnamenumbers": [
        1,
        2,
        3,
        4,
        5,
        6,
        7,
        8,
        9,
        10,
        11,
        12,
        13,
        14,
        15,
        16,
        17,
        18,
        19,
        20,
        21,
        22,
        23
    ],
    "alreadyloadedFnamenumbers": [
        2
    ],
    "deleteSecureModal": false,
    "deleteSecureTxt": "",
    "isShowDeptChanges": true,
    "dcChangesBaseid": 170,
    "loadedFieldChangesList": [
        {
            "fieldChange": [
                {
                    "planogramShelfChangesDto": [
                        {
                            "id": 26087,
                            "floorShelfChangeType": "qty_add",
                            "planogramShelfHasProductId": 17930,
                            "facingQty": 1,
                            "totalQty": 1,
                            "planogramShelfId": 8864,
                            "changeQty": 1,
                            "productBarcode": "7290112492777",
                            "productId": 1216,
                            "productName": "2 ב-1 שמפו ומרכך למניעת קשקשים"
                        }
                    ],
                    "floorFieldNumber": 2,
                    "floorFieldId": 2875,
                    "fieldUUID": "2e286817-2717-4eac-90b4-1dd68a1764f6"
                }
            ],
            "departmentName": "DP-01",
            "departmentId": 11
        }
    ],
    "fcmaxresults": 5,
    "fcallcount": 0,
    "fcfromdate": "2021-09-13T12:08:23.821Z",
    "fctodate": "2021-10-13T12:08:23.821Z",
    "issaledataloading": false,
    "rotationobj": null,
    "layoutVersionList": [
        {
            "tags": [],
            "aisleVer": 0,
            "blockVer": 0,
            "fieldVer": 0,
            "flowLayoutVer": 0,
            "id": 459,
            "mainVersion": "1.1.0 draft - 12",
            "productLocationVer": 0,
            "productVer": 0,
            "shelfVer": 0,
            "width": null,
            "height": null,
            "date": "2021-10-07T04:13:41.659Z",
            "floorStatus": "DRAFT"
        },
        {
            "tags": [],
            "aisleVer": 0,
            "blockVer": 0,
            "fieldVer": 0,
            "flowLayoutVer": 0,
            "id": 458,
            "mainVersion": "0.0.0 draft - 11",
            "productLocationVer": 0,
            "productVer": 0,
            "shelfVer": 0,
            "width": null,
            "height": null,
            "date": "2021-10-07T03:58:30.508Z",
            "floorStatus": "DRAFT"
        },
        {
            "tags": [],
            "aisleVer": 0,
            "blockVer": 0,
            "fieldVer": 0,
            "flowLayoutVer": 0,
            "id": 415,
            "mainVersion": "1.1.0 draft - 10",
            "productLocationVer": 0,
            "productVer": 0,
            "shelfVer": 0,
            "width": null,
            "height": null,
            "date": "2021-09-30T12:37:04.023Z",
            "floorStatus": "DRAFT"
        },
        {
            "tags": [],
            "aisleVer": 0,
            "blockVer": 0,
            "fieldVer": 0,
            "flowLayoutVer": 0,
            "id": 412,
            "mainVersion": "1.1.0 draft - 9",
            "productLocationVer": 0,
            "productVer": 0,
            "shelfVer": 0,
            "width": null,
            "height": null,
            "date": "2021-09-30T12:30:49.038Z",
            "floorStatus": "DRAFT"
        },
        {
            "tags": [],
            "aisleVer": 0,
            "blockVer": 0,
            "fieldVer": 0,
            "flowLayoutVer": 0,
            "id": 299,
            "mainVersion": "0.0.0 draft - 8",
            "productLocationVer": 0,
            "productVer": 0,
            "shelfVer": 0,
            "width": null,
            "height": null,
            "date": "2021-09-29T10:49:59.304Z",
            "floorStatus": "DRAFT"
        },
        {
            "tags": [],
            "aisleVer": 0,
            "blockVer": 0,
            "fieldVer": 0,
            "flowLayoutVer": 0,
            "id": 297,
            "mainVersion": "0.0.0 draft - 7",
            "productLocationVer": 0,
            "productVer": 0,
            "shelfVer": 0,
            "width": null,
            "height": null,
            "date": "2021-09-29T10:37:34.024Z",
            "floorStatus": "DRAFT"
        },
        {
            "tags": [],
            "aisleVer": 0,
            "blockVer": 0,
            "fieldVer": 0,
            "flowLayoutVer": 0,
            "id": 296,
            "mainVersion": "0.0.0 draft - 6",
            "productLocationVer": 0,
            "productVer": 0,
            "shelfVer": 0,
            "width": null,
            "height": null,
            "date": "2021-09-29T10:22:01.474Z",
            "floorStatus": "DRAFT"
        },
        {
            "tags": [],
            "aisleVer": 0,
            "blockVer": 0,
            "fieldVer": 0,
            "flowLayoutVer": 0,
            "id": 169,
            "mainVersion": "1.0.0 draft - 3",
            "productLocationVer": 0,
            "productVer": 0,
            "shelfVer": 0,
            "width": null,
            "height": null,
            "date": "2021-09-22T12:38:15.065Z",
            "floorStatus": "MERGE"
        }
    ],
    "selectVersionList": [],
    "selStoreId": 16,
    "verStartIndex": 8,
    "verMaxCount": 8,
    "verTotalCount": 9,
    "divWidth": 783,
    "divHeight": 400,
    "departmentprodchanges": [
        {
            "departmentName": "DP-01",
            "sale": 0,
            "salePercentage": 0,
            "profit": 0,
            "profitPercentage": 0,
            "departmentId": 11,
            "revenuePerFacing": 0,
            "revenuePerFacingQty": 0,
            "profitPerSqFt": 0
        }
    ]
}

it("renders PlanogramDetails without crashing", () => {
    shallow(<PlanogramDetails />);
});

describe("test in edit", () => {
    let props;
    props = {
        t: jest.fn(),
        history: historyMock,
        planogramState: { PDplanogramDetails: null },
        ...props
    };
    const wrapper = shallow(<PlanogramDetailsOriginal     {...props} />);
    wrapper.setState(
        reduxstate
    );
    it("New planogram direct works", (done) => {
        // const settings = wrapper.find('.planosettings');
        // settings.simulate('click');
        console.log( wrapper.find('#addnewplanogram').simulate('click'))
        // console.log(wrapper.instance());
        // expect(props.history.location.pathname).toEqual('/home');
        done();
    });
    it("versionselect exist", (done) => {
         const settings = wrapper.find('.planosettings');
        settings.simulate('click');
        wrapper.find('#addnewplanogram').simulate('click')
        const version = wrapper.find('.versionselect-drop');
        // console.log(version.debug());

        done();
    });

});

