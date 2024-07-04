export const addressPoints = [
    { lat: -31.56391, lng: 147.154312, versionAnalysis: {spfpd: 456}, id: 1, name: "store 1" },
    { lat: -33.718234, lng: 150.363181, versionAnalysis: {spfpd: 789}, id: 2, name: "store 2" },
    { lat: -33.727111, lng: 150.371124, versionAnalysis: {spfpd: 678}, id: 3, name: "store 3" },
    { lat: -33.848588, lng: 151.209834, versionAnalysis: {spfpd: 234}, id: 4, name: "store 4" },
    { lat: -33.851702, lng: 151.216968, versionAnalysis: {spfpd: 123}, id: 5, name: "store 5" },
    { lat: -34.671264, lng: 150.863657, versionAnalysis: {spfpd: 345}, id: 6, name: "store 6" },
    { lat: -35.304724, lng: 148.662905, versionAnalysis: {spfpd: 890}, id: 7, name: "store 7" },
    { lat: -36.817685, lng: 175.699196, versionAnalysis: {spfpd: 753}, id: 8, name: "store 8" },
    { lat: -36.828611, lng: 175.790222, versionAnalysis: {spfpd: 542}, id: 9, name: "store 9" },
    { lat: -37.75, lng: 145.116667, versionAnalysis: {spfpd: 874}, id: 10, name: "store 10" },
    { lat: -37.759859, lng: 145.128708, versionAnalysis: {spfpd: 875}, id: 11, name: "store 11" },
    { lat: -37.765015, lng: 145.133858, versionAnalysis: {spfpd: 765}, id: 12, name: "store 12" },
    { lat: -37.770104, lng: 145.143299, versionAnalysis: {spfpd: 412}, id: 13, name: "store 13" },
    { lat: -37.7737, lng: 145.145187, versionAnalysis: {spfpd: 212}, id: 14, name: "store 14" }
];

export const arisonotficationextra = [
    {
        "productId": 928046,
        "productName": "Apple",
        "barcode": "12345678901234567890",
        "createdDate": "09-06-23",
        "supplierName": "QA Planner Ni supplier",
        "imgUrl": "https://d3ginyfiwc1r8i.cloudfront.net/main/1/12345678901234567890/U19WnVOFewpX8bmlwMdvv_W100_100.jpg",
        "testPeriodStatus": "TestPeriodOver",
        "brandName": "QA1",
        "testStartOption": "C",
        "testStartDate": "2023-06-19",
        "isNotAppliedABCOption": true,
        "testPeriod": 30,
        "isOngoing": false,
        "testEndDate": "2023-07-19",
        "storeCount": {
            "totalStoreCount": 0,
            "coveredStoreCount": 0
        },
        "replaceImpact": 200000,
        "categoryPSSPercentage": {
            "profitPercentage": 0,
            "sharePercentage": 0,
            "salesPercentage": 0
        },
        "subCategoryPSSPercentage": {
            "profitPercentage": 0,
            "sharePercentage": 0,
            "salesPercentage": 0
        },
        "brandPSSPercentage": {
            "profitPercentage": 0,
            "sharePercentage": 0,
            "salesPercentage": 0
        },
        "sales": {
            "brandPercentage": 0,
            "departmentPercentage": 0,
            "categoryPercentage": 0,
            "subCategoryPercentage": 0
        },
        "profit": {
            "brandPercentage": 0,
            "departmentPercentage": 0,
            "categoryPercentage": 0,
            "subCategoryPercentage": 0
        },
        "growthPercentage": -12,
        "suggestionMessage": "Give it more time!",
        "suggestionDescription": "Lets try it for cupple more days an well deside together what to do"
    }
]

// enum(Department, Category, SubCategory, Brand, Supplier)
// enum(Good, Bad)
export const trendsSampleData = [
    {	
        name: "Snacks",	
        id: 10,	
        trend: 71.8,	
        type: "Department",	
        trendType : "Good", 	
        rest: 	[
            {
                name : "Pasta",
                id : 11,
                trendType : "Bad",
                trend : 18.2
            },
            {
                name: "Cereals",
                id: 12,
                trendType: "Good",
                trend: 9.9
            }
        ]
    },
    {	
        name: "Drinks",	
        id: 13,	
        trend: 12.7,	
        type: "Department",	
        trendType : "Bad", 	
        rest: 	[
            {
                name : "Beer",
                id : 14,
                trendType : "Good",
                trend : 68.7
            },
            {
                name: "Baby's",
                id: 15,
                trendType: "Good",
                trend: 18.5
            }
        ]
    },
    {	
        name: "Chips Snacks",	
        id: 16,	
        trend: 38.9,	
        type: "SubCategory",	
        trendType : "Good", 	
        rest: 	[
            {
                name : "Cone corn snacks",
                id : 17,
                trendType : "Good",
                trend : 22.6
            },
            {
                name: "Salty snacks for children",
                id: 18,
                trendType: "Good",
                trend: 17.4
            },
            {
                name: "Peanut snacks",
                id: 19,
                trendType: "Good",
                trend: 21.1
            }
        ]
    }
]

export const sampleTrendStores = [
    {
        "storeUuid": "a55d4c4e-340a-4705-b2fc-ea2940716851",
        "name": "Aachen",
        "latitude": "50.769631",
        "longtitue": "6.036774",
        "city": {
            "name": "Aachen",
            "latitude": "50.769631",
            "longtitue": "6.036774"
        },
        "country": {
            "name": "Germany",
            "longtitue": "10.074205",
            "latitude": "51.098179"
        },
        "region": {
            "name": "West",
            "latitude": "51.263465",
            "longtitue": "8.008776"
        },
        "trendsDiscover": {
            "name": "Snacks",
            "trend": 71.8,
            "trendType": "Good",
            "restTotal": 28.1
        },
    },
    {
        "storeUuid": "e9d32c7d-bf14-4d6d-9927-26dd4e692bde",
        "name": "Berlin",
        "latitude": "52.541062",
        "longtitue": "13.412327",
        "city": {
            "name": "Berlin",
            "latitude": "52.541062",
            "longtitue": "13.412327"
        },
        "country": {
            "name": "Germany",
            "longtitue": "10.074205",
            "latitude": "51.098179"
        },
        "region": {
            "name": "north",
            "latitude": "52.470906",
            "longtitue": "9.920397"
        },
        "trendsDiscover": {
            "name": "Snacks",
            "trend": 71.8,
            "trendType": "Good",
            "restTotal": 28.1
        },
    },
    {
        "storeUuid": "745b3576-34bd-43b6-8b32-06f338c3b180",
        "name": "ISR-B001",
        "latitude": "31.768207",
        "longtitue": "35.227173",
        "city": {
            "name": "ISR-B001",
            "latitude": "31.768207",
            "longtitue": "35.227173"
        },
        "country": {
            "name": "Israel",
            "longtitue": "34.681884",
            "latitude": "31.050321"
        },
        "region": {
            "name": "ISR-REGION",
            "latitude": "31.524123",
            "longtitue": "34.809881"
        },
        "trendsDiscover": {
            "name": "Snacks",
            "trend": 71.8,
            "trendType": "Good",
            "restTotal": 28.1
        },
    },
    {
        "storeUuid": "ff69ed74-b617-4ccf-aeb4-14bd9d366a7e",
        "name": "Kassel",
        "latitude": "51.314213",
        "longtitue": "9.480181",
        "city": {
            "name": "Kassel",
            "latitude": "51.314213",
            "longtitue": "9.480181"
        },
        "country": {
            "name": "Germany",
            "longtitue": "10.074205",
            "latitude": "51.098179"
        },
        "region": {
            "name": "center",
            "latitude": "51.070574",
            "longtitue": "10.271959"
        },
        "trendsDiscover": {
            "name": "Snacks",
            "trend": 71.8,
            "trendType": "Good",
            "restTotal": 28.1
        },
    },
    {
        "storeUuid": "14792836-0269-486b-9b7c-fc810ff37a72",
        "name": "Munich",
        "latitude": "48.133717",
        "longtitue": "11.584395",
        "city": {
            "name": "Munich",
            "latitude": "48.133717",
            "longtitue": "11.584395"
        },
        "country": {
            "name": "Germany",
            "longtitue": "10.074205",
            "latitude": "51.098179"
        },
        "region": {
            "name": "South",
            "latitude": "48.880797",
            "longtitue": "9.261217"
        },
        "trendsDiscover": {
            "name": "Snacks",
            "trend": 71.8,
            "trendType": "Good",
            "restTotal": 28.1
        },
    },
    {
        "storeUuid": "80264d17-493a-449b-a141-ac359105cf1e",
        "name": "טסט אבישג",
        "latitude": "51.263465",
        "longtitue": "8.008776",
        "city": {
            "name": "עיר",
            "latitude": "51.263465",
            "longtitue": "8.008776"
        },
        "country": {
            "name": "Germany",
            "longtitue": "10.074205",
            "latitude": "51.098179"
        },
        "region": {
            "name": "West",
            "latitude": "51.263465",
            "longtitue": "8.008776"
        },
        "trendsDiscover": {
            "name": "Snacks",
            "trend": 71.8,
            "trendType": "Good",
            "restTotal": 28.1
        },
    }
]