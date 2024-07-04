import { shallow, mount } from 'enzyme';
//import {useTranslation} from 'react-i18next'

import ProdMDModal from '../../../components/planograms/planDisplayUnit/prodmdedit';

/* jest.mock('react-i18next', () => ({
    useTranslation: () => {
      return {
        t: (str) => str,
      };
    },
})); */

let sampleprodobj = {
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
  "imageUrl": ""
}

let props = {
  pemshow: true,
  isRTL: "rtl",
  pemobj: sampleprodobj,
  saveobj: { planogramShelfDto: [] },
  handlepemview: jest.fn(),
};

describe("planogram field product edit works without errors", () => {
  const wrapper = shallow(<ProdMDModal {...props} />);

  it("planogram field product edit data renders", () => {
    //console.log(wrapper.debug());
    //expect(wrapper.find(".baseview-modal .img-fluid").prop("src")).toBe(props.baseaiimage);
  });

  /* it("planogram field product edit toggle modal close", () => {
    wrapper.find(".pgram-editproduct").simulate("click");
  }); */
});