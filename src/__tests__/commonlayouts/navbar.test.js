import { shallow, mount } from 'enzyme';
import { MemoryRouter } from 'react-router-dom';
import { NavbarTop } from '../../components/common_layouts/navbartop';

import { submitSets } from '../../components/UiComponents/SubmitSets';

jest.mock('../../components/UiComponents/SubmitSets');

const defaultnotificationslist = {datalist:[{"status": "unseen","receptId": 4825,"readDate": null,"deliverdate": "2021-12-15T10:37:35.000Z","notificationId": 1980,"title": "Planogram Active","body": "Hi, planogram from Store 8/DP-02 (1.1.2) is active now and recording sales has started! , Take a look!","payloadData": {"planogramId": "627","payloadTypeId": "4"},"payloadDatatypeId": 4},{"status": "unseen","receptId": 4815,"readDate": null,"deliverdate": "2021-12-15T10:10:55.000Z","notificationId": 1976,"title": "Planogram Active","body": "Hi, planogram from Store 8/DP-02 (1.1.1) is active now and recording sales has started! , Take a look!","payloadData": {"planogramId": "625","payloadTypeId": "4"},"payloadDatatypeId": 4}]};

let props = {
    t: jest.fn(),
    history: { listen: jest.fn(), push: jest.fn() },
    handleLangObj: jest.fn(),
    toastlist: defaultnotificationslist,
    nstartindex: 0, nmaxresults: 8,
    signedobj: { signinDetails: {
            "webNotificationToken": [],
            "id": 20,
            "userUUID": "20",
            "storeId": 9,
            "storeName": "Store 9",
            "storeAddress": null,
            "storeTel": "0112121235",
            "userRolls": {
                "userAccessService": [],
                "parentUserRoles": [],
                "chieldsUserRoles": [],
                "storeName": "Store 9",
                "storeUUID": "9",
                "storeId": 9,
                "name": "CEO",
                "rank": 1,
                "rollUUID": "2",
                "systemMainRoleType": "CEO",
                "uuid": "2",
                "userLevel": "Chain"
            },
            "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyQWNjZXNzU2VydmljZSI6bnVsbCwiY2hhaW5VVUlEIjoiMSIsInVzZXJVVUlEIjoiMjAiLCJ1c2VySWQiOjIwLCJpbWFnZVJlc29sdXRpb24iOiJXMTAwXzEwMCIsImZpcnN0TmFtZSI6ImNlbyIsImxhc3ROYW1lIjoiY2VvIGxhc3QiLCJzdG9yZVVVSUQiOiI5Iiwic3RvcmVJZCI6OSwidXNlclJvbGxzIjpudWxsLCJpYXQiOjE2Mzk1NjU3MzYsImV4cCI6MTY0NzM0MTczNn0.L2qzGok9a4axL5172OdWQxTblNzWk2mc9EcFkJPv5K0",
            "userDto": {
                "email": "planigoCeo@outlook.com",
                "fName": "ceo",
                "lName": "ceo last"
            }
        },
        notifiDetails: [],
    },
    updateNotifiationStatus: jest.fn(),
    removeFirebaseToken: jest.fn(),
    setLogoutState: jest.fn(),
    handleSignObj: jest.fn(),
    loadNotificationsList: jest.fn(),
    setSigninObj: jest.fn(),
    checkNewNotsAvailable:jest.fn(),
    dmode: true, isRTL: "rtl",
    loadedBranchList: [],
};

it("navbar renders without crashing", () => {
    shallow(<NavbarTop {...props} />);
});

const wrapper = mount(<MemoryRouter><NavbarTop {...props} /></MemoryRouter>);
const subwrapper = wrapper.find(NavbarTop);

it("change language without errors", () => {
    subwrapper.instance().handleChangeLang({ target: { value: "he" } });
    wrapper.update();

    expect(subwrapper.state().selectedLang).toBe("he");
});

describe("signin details loads without errors", () => {
    it("check logout works without errors", () => {
        subwrapper.instance().handleLogout();

        expect(subwrapper.instance().props.history.push).toBeCalledWith("/signin");
    });
});

describe("notifications works without errors", () => {
    it("load notifications to notifications view", () => {
        wrapper.find("Button#notifidroptrigger").simulate('click');
        expect(wrapper.find("#notifiref .msg-link").length).toBe(2);
    });

    it("load more notifications", () => {
        let mockevent = { preventDefault: jest.fn() };
        subwrapper.instance().handleLoadMoreNots(mockevent);

        expect(subwrapper.instance().props.loadNotificationsList).toBeCalledWith(8);
    });

    it("reload notifications", () => {
        subwrapper.instance().reloadallnotifications();

        expect(subwrapper.instance().props.loadNotificationsList).toBeCalledWith(0);
    });

    it("click on a notification works", () => {
        wrapper.find("#notifiref .msg-link").at(0).find("div.redirectnote-link").simulate('click');
    });

    it("reload notifications", () => {
        var sampletokeobj = { token: "TKNTEST0123" };
        submitSets.mockReturnValueOnce(Promise.resolve({ status: true, extra: [sampletokeobj] }));
        subwrapper.instance().checkTokenAndUpdate("TKNTEST0123", {});
        
        //expect(subwrapper.instance().props.setSigninObj).toBeCalled();
    });
});

//check component snapshot without errors
/* it("navbar snapshot renders without crashing", () => {
    expect(wrapper).toMatchSnapshot();
}); */
