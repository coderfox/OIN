import { Responsive, ResponsiveWidthShorthand } from 'semantic-ui-react';

const _parseInt = (from?: string | number) =>
  typeof from === 'undefined' ? 0 :
    (typeof from === 'number' ? from : parseInt(from, 10));
export const onlyMobile = Responsive.onlyMobile;
export const onlyTablet = Responsive.onlyTablet;
export const onlyComputer = Responsive.onlyComputer;
export const mobileAndTablet: ResponsiveWidthShorthand = {
  minWidth: onlyMobile.minWidth,
  maxWidth: onlyTablet.maxWidth,
};
export const computerAndMore: ResponsiveWidthShorthand = {
  minWidth: onlyComputer.minWidth,
};
export const isMobileOrTablet = () =>
  window.innerWidth >= _parseInt(mobileAndTablet.minWidth) && window.innerWidth <= _parseInt(mobileAndTablet.maxWidth);
export const isComputer = () =>
  window.innerWidth >= _parseInt(computerAndMore.minWidth);
