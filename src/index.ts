import {
    onGmailCompose,
    handleFormInput,
    handleSendButtonClick,
    saveAttachments
} from './gmail'
import { governments } from './governments'

global.onGmailCompose = onGmailCompose
global.handleFormInput = handleFormInput
global.handleSendButtonClick = handleSendButtonClick
global.saveAttachments = saveAttachments
global.governments = governments

