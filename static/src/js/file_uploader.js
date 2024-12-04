/* @odoo-module */

import { FileUploader } from '@mail/components/file_uploader/file_uploader';
import { patch } from "@web/core/utils/patch";
import { replace } from '@mail/model/model_field_command';

const geAttachmentNextTemporaryId = (function () {
    let tmpId = 0;
    return () => {
        tmpId -= 1;
        return tmpId;
    };
})();

patch(FileUploader.prototype, 'sttl_multiple_files_activity/static/src/js/file_uploader',{

    /**
     * @override
     */
    async _performUpload({ composer, files, thread }) {
        const uploadingAttachments = new Map();
        // Prepare uploading attachment objects
        for (const file of files) {
            uploadingAttachments.set(file, this.messaging.models['mail.attachment'].insert({
                composer: composer && replace(composer),
                filename: file.name,
                id: geAttachmentNextTemporaryId(),
                isUploading: true,
                mimetype: file.type,
                name: file.name,
                originThread: (!composer && thread) ? replace(thread) : undefined,
            }));
        }

        const attachments = [];
        const uploadedAttachments = [];

        // Start the upload process for each file
        for (const file of files) {
            const uploadingAttachment = uploadingAttachments.get(file);
            if (!uploadingAttachment.exists()) {
                continue;
            }

            // Handle case where composer or thread is not valid
            if ((composer && !composer.exists()) || (thread && !thread.exists())) {
                return;
            }

            try {
                const response = await this.env.browser.fetch('/mail/attachment/upload', {
                    method: 'POST',
                    body: this._createFormData({ composer, file, thread }),
                    signal: uploadingAttachment.uploadingAbortController.signal,
                });

                const attachmentData = await response.json();

                // Clean up the uploading attachment
                if (uploadingAttachment.exists()) {
                    uploadingAttachment.delete();
                }

                // Handle case where composer or thread is no longer valid
                if ((composer && !composer.exists()) || (thread && !thread.exists())) {
                    return;
                }

                // Process the uploaded attachment
                const attachment = await this._onAttachmentUploaded({ attachmentData, composer, thread });
                if (attachment) {
                    uploadedAttachments.push(attachment);
                }

            } catch (e) {
                // Abort error handling
                if (e.name !== 'AbortError') {
                    throw e;
                }
            }
        }

        // Insert uploaded attachments into the system
        for (const data of uploadedAttachments) {
            const attachment = this.messaging.models['mail.attachment'].insert(data);
            attachments.push(attachment);
        }

        // Trigger attachment created event
        this.trigger('o-attachment-created', { attachment: attachments });
    },

    /**
     * @override
     */
    async _onAttachmentUploaded({ attachmentData, composer, thread }) {
        if (attachmentData.error || !attachmentData.id) {
            // Notify the user about the error
            this.env.services['notification'].notify({
                type: 'danger',
                message: attachmentData.error,
            });
            return;
        }

        // Return the processed attachment data
        return {
            composer: composer && replace(composer),
            originThread: (!composer && thread) ? replace(thread) : undefined,
            ...attachmentData,
        };
    }

});


