declare module GoogleAppsScript {
  // https://developers.google.com/apps-script/manifest/gmail-addons
  namespace Addons {
    interface GmailEventObject {
      draftMetadata?: DraftMetadata;
    }

    interface DraftMetadata {
      subject: string;
      toRecipients: string[];
      ccRecipients: string[];
      bccRecipients: string[];
    }

    interface OnChangeActionsParameters {
      draftId?: string;
      messageId?: string;
    }
  }
}

declare const dayjs: {
  dayjs(arg?: any): any;
}

declare const global: {
  onGmailCompose(arg?: any): GoogleAppsScript.Card_Service.Card;
  handleFormInput(arg?: any): void;
  handleSendButtonClick(arg?: any):GoogleAppsScript.Card_Service.Card | undefined;
  saveAttachments(arg?: any?): void;
  logger(text: string): void;
  governments: string[];
}