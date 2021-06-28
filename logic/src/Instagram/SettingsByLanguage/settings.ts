import { ElementProps, HTMLElementProperties } from '../../../src/ElementHandle';

export interface Settings {
  urls: {
    base: URL;
  };
  buttonFollow: {
    expectedProps: {
      preFollow: ElementProps<HTMLButtonElement, string>[];
      postFollow: ElementProps<HTMLButtonElement, string>[];
    };
  };
  buttonLike: {
    svg: {
      expectedProps: {
        preLike: ElementProps<HTMLOrSVGImageElement, string>[];
        postLike: ElementProps<HTMLOrSVGImageElement, string>[];
      };
      /**
       * XPath relative to buttonLike
       */
      XPath: string;
      /**
       * XPath relative to buttonLike
       */
      XPathPreLike: string;
      /**
       * XPath relative to buttonLike
       */
      XPathPostLike: string;
    };
  };
  notAvailablePage: {
    XPath: string;
  };
  waitForTimePage: {
    XPath: string;
  };
  profilePage: {
    elements: {
      privateProfile: {
        XPath: string;
      };
      buttonFollow: {
        XPath: string;
      };
      buttonAlreadyFollow: {
        XPath: string;
      };
      followedUsers: {
        XPath: string;
        containerToScroll: {
          XPath: string;
        };
        buttonFollow: {
          XPath: string;
        };
        buttonAlreadyFollow: {
          XPath: string;
        };
      };
    };
  };
  igPostPage: {
    elements: {
      buttonLike: {
        XPath: string;
      };
      buttonUnlike: {
        XPath: string;
      };
    };
  };
  pageOfStory: {
    elements: {
      barsOfStories: {
        XPath: string;
      };
      barsOfLoadingForStories: {
        XPath: string;
      };
      buttonForPermission: {
        XPath: string;
      };
      buttonToScrollStory: {
        expectedProps: HTMLElementProperties<HTMLButtonElement, string>;
        XPath: string;
      };
    };
  };
  genericLoggedInPage: {
    elements: {
      buttonForNewPost: {
        XPath: string;
      };
      inputToUploadMedia: {
        XPath: string;
      };
      buttonForNextOperation: {
        XPath: string;
      };
      textareaForDescription: {
        XPath: string;
      };
      buttonToShareMedia: {
        XPath: string;
      };
    };
  };
  loginPage: {
    elements: {
      inputForPassword: {
        XPath: string;
      };
      inputForId: {
        XPath: string;
      };
      buttonToLogin: {
        XPath: string;
      };
    };
  };
}
