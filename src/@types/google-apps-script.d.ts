declare namespace GoogleAppsScript {
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
      fromCheck?: string[];
      subjectCheck?: string[];
      toCheck?: string[];
      ccCheck?: string[];
      bccCheck?: string[];
      attachmentsCheck?: string[];
      urlCheck?: string[];
      governmentsCheck?: string[];
      summaryCheck?: string[];
    }
  }
}

declare const dayjs: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  dayjs(arg?: any): any;
}

declare const global: {
  onGmailCompose(e: GoogleAppsScript.Addons.GmailEventObject): GoogleAppsScript.Card_Service.Card;
  handleFormInput(e: { parameters: GoogleAppsScript.Addons.OnChangeActionsParameters}): void;
  handleSendButtonClick(e: { parameters: GoogleAppsScript.Addons.OnChangeActionsParameters}): GoogleAppsScript.Card_Service.Card | undefined;
  saveAttachments(e: { parameters: GoogleAppsScript.Addons.OnChangeActionsParameters}): void;
  logger(text: string): void;
  governments: string[];
}
