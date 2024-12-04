/** @odoo-module **/

import { registerInstancePatchModel } from '@mail/model/model_core';
import { replace } from '@mail/model/model_field_command';

// Register an instance patch on the `mail.activity` model
registerInstancePatchModel('mail.activity', 'sttl_multiple_files_activity/static/src/js/activity.js', {

    /**
     * Overriding the markAsDone method to add custom logic
     *
     * @param {Object} param0
     * @param {mail.attachment[]} [param0.attachments=[]]
     * @param {string|boolean} [param0.feedback=false]
     */
    async markAsDone({ attachments = [], feedback = false }) {

        const attachmentIds = attachments[0].map(attachment => attachment.localId);

        const extractedIds = attachmentIds.map(attachmentId => {
            const match = attachmentId.match(/id:\s*(\d+)/);
            return match ? parseInt(match[1], 10) : null;
        });
        await this.env.services.rpc({
            model: 'mail.activity',
            method: 'action_feedback',
            args: [[this.id]],
            kwargs: {
                attachment_ids: extractedIds,
                feedback,
            },
        });

        // Refresh the thread and delete the activity after the action
        this.thread.refresh();
        this.delete();
    },
});
