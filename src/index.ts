import {
    onGmailCompose,
    handleFormInput,
    handleSendButtonClick,
    saveAttachments
} from './gmail'
import { logger } from './slack'
import { governments } from './governments'

global.onGmailCompose = onGmailCompose
global.handleFormInput = handleFormInput
global.handleSendButtonClick = handleSendButtonClick
global.saveAttachments = saveAttachments
global.logger = logger
global.governments = governments

