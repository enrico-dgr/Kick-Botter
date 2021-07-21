export interface Settings {
  urls: {
    base: URL;
  };
  dialogLink: {
    returnXPath: (interlocutor: string) => string;
  };
  message: {
    returnXPath: (interlocutor: string, mustContainText: string) => string;
  };
  dialog: {
    elements: {
      textArea: {
        xpath: string;
      };
    };
  };
  loginPage: {
    elements: {
      buttonToSwitchToAccessByNumber: {
        XPath: string;
      };
      inputForNumber: {
        XPath: string;
      };
      buttonToGoToOTP: {
        XPath: string;
      };
      inputForOTP: {
        XPath: string;
      };
    };
  };
}
