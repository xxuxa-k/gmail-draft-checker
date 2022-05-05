export interface Government {
  name: string;
  prefecture: string;
  isLocal: boolean;
}

export interface OnComposeEventObject {
  draftMetadata: DraftMetadata
}

export interface DraftMetadata {
  subject: string;
  toRecipients: string[];
  ccRecipients: string[];
  bccRecipients: string[];
}

export interface OnChangeActionsParameters {
  draftId?: string;
  messageId?: string;
}