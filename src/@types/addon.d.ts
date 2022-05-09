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
