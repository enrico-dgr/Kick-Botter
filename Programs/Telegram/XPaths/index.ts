export const dialogLink = (dialogName: string) =>
  `//a[@class='im_dialog' and contains(., '${dialogName}')]`;
export const messageWithText = (dialogName: string, text: string) =>
  `//div[@class='im_content_message_wrap im_message_in' and contains(., '${dialogName}') and contains(.,'${text}')]`;
