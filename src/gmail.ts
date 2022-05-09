// import { governments } from "./governments"
import { logger } from './slack'

function onGmailCompose(e: GoogleAppsScript.Addons.GmailEventObject) {
  const draftCandidates: GoogleAppsScript.Gmail.GmailMessage[] = GmailApp.getDraftMessages().filter(message => {
    return e.draftMetadata
    && e.draftMetadata.subject === message.getSubject()
    && e.draftMetadata.toRecipients.every(r => message.getTo().split(",").some((to: string) => to.includes(r)))
    && e.draftMetadata.ccRecipients.every(r => message.getCc().split(",").some((cc: string) => cc.includes(r)))
    && e.draftMetadata.bccRecipients.every(r => message.getBcc().split(",").some((bcc: string) => bcc.includes(r)))
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

  const fromCheckSection = CardService.newCardSection()
  .addWidget(
    CardService.newDecoratedText()
    .setText('From')
    .setWrapText(true)
    .setSwitchControl(
      CardService.newSwitch()
      .setFieldName('from_check')
      .setValue('ok')
      .setOnChangeAction(
        CardService.newAction()
        .setFunctionName('handleFormInput')
      )
    )
  )
  .addWidget(
    CardService.newTextParagraph()
    .setText(draft.getFrom())
  )

  const subjectCheckSection = CardService.newCardSection()
  .addWidget(
    CardService.newDecoratedText()
    .setText('件名')
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
    .setText('To')
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
    .setText('Cc')
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
    .setText('Bcc')
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
    .setText('URL')
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
  urls.forEach((url: string) => {
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
    .setText('自治体名')
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
    .setText(governments.map((g: string) => {
      if (draft.getPlainBody().indexOf(g) !== -1) {
        return g
      }
    }).filter(v => v).join('\n'))
  )

  const attachementsCheckSection = CardService.newCardSection()
  .addWidget(
    CardService.newDecoratedText()
    .setText('添付ファイル')
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
    .setText(summary)
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
  .addSection(fromCheckSection)
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

function handleFormInput(e: { parameters: GoogleAppsScript.Addons.OnChangeActionsParameters }) {
  logger(JSON.stringify(e))
  return
}

function handleSendButtonClick(e: { parameters: GoogleAppsScript.Addons.OnChangeActionsParameters }) {
  const draft = GmailApp.getDrafts().filter(draft => draft.getMessageId() === e.parameters.messageId)
  if (draft.length !== 1) {
    return
  }
  // draft[0].send()
  // もとのカードに戻れないようにしたい
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

function saveAttachments(e: { parameters: GoogleAppsScript.Addons.OnChangeActionsParameters }) {
  const messageId = e.parameters?.messageId || ''
  const message = GmailApp.getMessageById(messageId)
  if (!message) {
    return
  }
  const now = dayjs.dayjs().format("YYYY-MM-DD HH:mm:ss")
  const folder = DriveApp.createFolder(`GmailDraftCheckerAttachments_${message.getSubject()}_${now}`)
  message.getAttachments().forEach(attachment => {
    if (attachment.isGoogleType()) {
      return
    }
    const blob = attachment.copyBlob()
    folder.createFile(blob)
  })
}

