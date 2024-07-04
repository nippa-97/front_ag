import { shallow, mount } from 'enzyme';
import {useTranslation} from 'react-i18next'

import ViewBaseImage from '../../../components/planograms/planDisplayUnit/viewBaseImage';

jest.mock('react-i18next', () => ({
    useTranslation: () => {
      return {
        t: (str) => str,
      };
    },
}));

let props = {
    showbaseimageview: true,
    baseaiimage: "testimage.jpg",
    viewbaseimage: jest.fn(),
};

describe("planogram field base image data loads without errors", () => {
  const wrapper = shallow(<ViewBaseImage {...props} />);
  it("planogram field base image data renders", () => {
    expect(wrapper.find(".baseview-modal .img-fluid").prop("src")).toBe(props.baseaiimage);
  });

  it("base image close modal closes without errors", () => {
      wrapper.find(".baseview-modal .close-link").simulate("click");
  });

  it("planogram field base image no data renders", () => {
    props.baseaiimage = null;
    const ndetwrapper = shallow(<ViewBaseImage {...props} />);
    expect(ndetwrapper.find(".baseview-modal h3").text()).toBe("IMAGE_CANNOT_LOAD");
  });
});