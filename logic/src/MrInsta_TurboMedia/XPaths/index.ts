export const XPaths = {
  followProfilesList: `//div[@class='follow-profiles-list']`,
  /**
   * "activate free followers plan" button
   */
  actFFPButton: `//div[contains(.,'Free Followers')]/*/*/*/button[@type='submit' and @class='btn btn-primary red']`,
  primaryFollow: `//a[@class='btn btn-primary' and contains(.,'Follow Profile')]`,
  successConfirm: `//button[@class='btn btn-success' and contains(.,'Confirm')]`,
};
export const plansPage = {
  freeFollower: `//div[contains(.,'Free Followers')]/*/*/*/button[@type='submit' and @class='btn btn-primary red']`,
};

export const freeFollower = {
  followProfileButton: `//div[@class='follow-list d-flex']//a[text()='Follow Profile']`,
  confirmButton: `//div[@class='follow-list d-flex']//button[contains(.,'Confirm')]`,
  hiddenConfirmButton: `//div[@class='follow-list d-flex']//div[@class='d-flex' and @style="display: none !important;"]//button[contains(.,'Confirm')]`,
  validate: `//button[text()='Validate']`,
};
