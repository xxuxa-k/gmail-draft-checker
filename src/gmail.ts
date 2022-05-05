interface Government {
  name: string;
  prefecture: string;
  isLocal: boolean;
}

interface OnComposeEventObject {
  draftMetadata: DraftMetadata
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

function onGmailCompose(e: OnComposeEventObject) {
  // GmailApp.getDraftMessages() => GmailApp.GmailMessage[]
  // logger(`onGmailCompose\n${JSON.stringify(e)}`)
  const draftCandidates = GmailApp.getDraftMessages().filter(message => {
    return e.draftMetadata.subject === message.getSubject()
    && e.draftMetadata.toRecipients.every(r => message.getTo().split(",").some(to => to.includes(r)))
    && e.draftMetadata.ccRecipients.every(r => message.getCc().split(",").some(cc => cc.includes(r)))
    && e.draftMetadata.bccRecipients.every(r => message.getBcc().split(",").some(bcc => bcc.includes(r)))
  })
  const draft = draftCandidates.length === 1 ? draftCandidates[0] : null
  if (!draft) {
    return CardService.newCardBuilder()
    .addSection(
      CardService.newCardSection()
      .addWidget(
        CardService.newTextParagraph()
        .setText('下書き情報が特定できませんでした。\nエラーが発生したか、件名や宛先が一致した下書きが2件以上存在する可能性があります。')
      )
    )
    .build()
  }

  const subjectCheckSection = CardService.newCardSection()
  .addWidget(
    CardService.newDecoratedText()
    .setText('件名は問題ありませんか？')
    .setWrapText(true)
    .setSwitchControl(
      CardService.newSwitch()
      .setFieldName('subject_check')
      .setValue('ok')
      .setOnChangeAction(
        CardService.newAction()
        .setFunctionName('handleFormInput')
      )
    )
  )
  .addWidget(
    CardService.newTextParagraph()
    .setText(draft.getSubject() ? draft.getSubject() : '(件名無し)')
  )

  const toCheckSection = CardService.newCardSection()
  .addWidget(
    CardService.newDecoratedText()
    .setText('送り先(to)は問題ありませんか？')
    .setWrapText(true)
    .setSwitchControl(
      CardService.newSwitch()
      .setFieldName('to_check')
      .setValue('ok')
      .setOnChangeAction(
        CardService.newAction()
        .setFunctionName('handleFormInput')
      )
    )
  )
  .addWidget(
    CardService.newTextParagraph()
    .setText(draft.getTo().replaceAll('<', '(').replaceAll('>', ')').replaceAll(',', '\n'))
  )

  const cc = draft.getCc() ? draft.getCc().replaceAll('<', '(').replaceAll('>', ')').replaceAll(',', '\n') : ''
  const ccCheckSection = CardService.newCardSection()
  .addWidget(
    CardService.newDecoratedText()
    .setText('送り先(cc)は問題ありませんか？')
    .setWrapText(true)
    .setSwitchControl(
      CardService.newSwitch()
      .setFieldName('cc_check')
      .setValue('ok')
      .setSelected(!cc)
      .setOnChangeAction(
        CardService.newAction()
        .setFunctionName('handleFormInput')
      )
    )
  )
  .addWidget(
    CardService.newTextParagraph()
    .setText(cc)
  )

  const bcc = draft.getBcc() ? draft.getBcc().replaceAll('<', '(').replaceAll('>', ')').replaceAll(',', '\n') : ''
  const bccCheckSection = CardService.newCardSection()
  .addWidget(
    CardService.newDecoratedText()
    .setText('送り先(bcc)は問題ありませんか？')
    .setWrapText(true)
    .setSwitchControl(
      CardService.newSwitch()
      .setFieldName('bcc_check')
      .setValue('ok')
      .setSelected(!bcc)
      .setOnChangeAction(
        CardService.newAction()
        .setFunctionName('handleFormInput')
      )
    )
  )
  .addWidget(
    CardService.newTextParagraph()
    .setText(bcc)
  )

  const urlCheckSection = CardService.newCardSection()
  .addWidget(
    CardService.newDecoratedText()
    .setText('URLとして記載された内容は送信先に適したものになっていますか？')
    .setWrapText(true)
    .setSwitchControl(
      CardService.newSwitch()
      .setFieldName('url_check')
      .setValue('ok')
      .setOnChangeAction(
        CardService.newAction()
        .setFunctionName('handleFormInput')
      )
    )
  )
  const urls = draft.getPlainBody().match(/http(s)?:\/\/([\w-]+\.)+[\w-]+(\/[\w-./?%&=]*)?/g) || []
  urls.forEach(url => {
    urlCheckSection.addWidget(
      CardService.newDecoratedText()
      .setText(url)
      .setWrapText(true)
      .setOpenLink(
        CardService.newOpenLink()
        .setUrl(url)
        .setOpenAs(CardService.OpenAs.OVERLAY)
        .setOnClose(CardService.OnClose.NOTHING)
      )
    )
  })

  const governmentsCheckSection = CardService.newCardSection()
  .addWidget(
    CardService.newDecoratedText()
    .setText('本文に記載された自治体名は問題ありませんか？')
    .setWrapText(true)
    .setSwitchControl(
      CardService.newSwitch()
      .setFieldName('governments_check')
      .setValue('ok')
      .setOnChangeAction(
        CardService.newAction()
        .setFunctionName('handleFormInput')
      )
    )
  )
  .addWidget(
    CardService.newTextParagraph()
    // .setText(getGovernmentsFromBody(draft.getPlainBody()).join('\n'))
    .setText(goverments.map(go => {
      if (draft.getPlainBody().indexOf(go) !== -1) {
        return go
      }
    }).filter(v => v).join('\n'))
  )

  const attachementsCheckSection = CardService.newCardSection()
  .addWidget(
    CardService.newDecoratedText()
    .setText('添付ファイルは問題ありませんか？')
    .setWrapText(true)
    .setSwitchControl(
      CardService.newSwitch()
      .setFieldName('attachment_check')
      .setValue('ok')
      .setSelected(draft.getAttachments().length === 0)
      .setOnChangeAction(
        CardService.newAction()
        .setFunctionName('handleFormInput')
      )
    )
  )
  if (draft.getAttachments().length > 0) {
    attachementsCheckSection
    .addWidget(
      CardService.newTextParagraph()
      .setText(draft.getAttachments().map(a => a.getName()).join('\n'))
    )
    .addWidget(
      CardService.newTextButton()
      .setText('マイドライブに添付ファイルを保存する')
      .setOnClickAction(
        CardService.newAction()
        .setFunctionName('saveAttachments')
        .setParameters({
          messageId: draft.getId()
        })
      )
    )
  }

  const summary = draft.getPlainBody().split('\n').slice(0, 10).join('\n')
  const summaryCheckSection = CardService.newCardSection()
  .addWidget(
    CardService.newDecoratedText()
    .setText('契約内容と本文は一致していますか？')
    .setWrapText(true)
    .setSwitchControl(
      CardService.newSwitch()
      .setFieldName('summary_check')
      .setValue('ok')
      .setOnChangeAction(
        CardService.newAction()
        .setFunctionName('handleFormInput')
      )
    )
  )
  .addWidget(
    CardService.newTextParagraph()
    .setText(`(本文先頭10行):\n${summary}`)
  )

  const sendButtonSection = CardService.newCardSection()
  .addWidget(
    CardService.newTextButton()
    .setText('メール送信')
    .setOnClickAction(
      CardService.newAction()
      .setFunctionName('handleSendButtonClick')
      .setParameters({
        messageId: draft.getId()
      })
    )
  )

  return CardService.newCardBuilder()
  .addSection(subjectCheckSection)
  .addSection(toCheckSection)
  .addSection(ccCheckSection)
  .addSection(bccCheckSection)
  .addSection(urlCheckSection)
  .addSection(governmentsCheckSection)
  .addSection(attachementsCheckSection)
  .addSection(summaryCheckSection)
  .addSection(sendButtonSection)
  .build()
}

function handleFormInput(e) {
  return
}

function handleSendButtonClick(e: { parameters: OnChangeActionsParameters }) {
  const draft = GmailApp.getDrafts().filter(draft => draft.getMessageId() === e.parameters.messageId)
  if (draft.length !== 1) {
    return
  }
  // draft[0].send()
  return CardService.newCardBuilder()
  .addSection(
    CardService.newCardSection()
    .addWidget(
      CardService.newTextParagraph()
      .setText('メールを送信しました。画面を閉じてください。')
    )
  )
  .build()
}

function saveAttachments(e: { parameters: OnChangeActionsParameters }) {
  const messageId = e.parameters?.messageId || ''
  const message = GmailApp.getMessageById(messageId)
  if (!message) {
    return
  }
  const folder = DriveApp.createFolder(`GmailDraftCheckerAttachments_${message.getSubject()}`)
  message.getAttachments().forEach(attachment => {
    if (attachment.isGoogleType()) {
      return
    }
    const blob = attachment.copyBlob()
    folder.createFile(blob)
  })
}


function logger(text: string) {
  UrlFetchApp.fetch('https://hooks.slack.com/services/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', {
    method: 'post',
    headers: {
      'Content-Type': 'application/json'
    },
    muteHttpExceptions: true,
    payload: JSON.stringify({
      'text': text
    })
  })
}