declare const global: {
  onGmailCompose(e: GoogleAppsScript.Addons.GmailEventObject): GoogleAppsScript.Card_Service.Card;
  handleFormInput(e: { parameters: GoogleAppsScript.Addons.OnChangeActionsParameters}): void;
  handleSendButtonClick(e: { parameters: GoogleAppsScript.Addons.OnChangeActionsParameters}): GoogleAppsScript.Card_Service.Card | undefined;
  saveAttachments(e: { parameters: GoogleAppsScript.Addons.OnChangeActionsParameters}): void;
  logger(text: string): void;
  governments: string[];
}
