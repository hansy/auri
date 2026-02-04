import { task } from "@trigger.dev/sdk/v3";
import { sendEmail } from "../services/resend";

import * as React from "react";

import { EMAIL_CONFIG } from "@dictation/shared";
import {
    ConfirmEmail,
    ConfirmEmailProps,
    DailyLessonEmail,
    DailyLessonEmailProps
} from "@dictation/emails";


export type SendEmailPayload =
    | { template: "ConfirmEmail"; to: string; subject?: string; props: ConfirmEmailProps }
    | { template: "DailyLessonEmail"; to: string; subject?: string; props: DailyLessonEmailProps };

export const sendEmailTask = task({
    id: "send-email",
    run: async (payload: SendEmailPayload) => {
        const { to, template, props } = payload;

        let reactElement: React.ReactNode = null;
        let subject = payload.subject;

        switch (template) {
            case "ConfirmEmail":
                reactElement = React.createElement(ConfirmEmail, props);
                subject = subject || EMAIL_CONFIG.subjects.ConfirmEmail;
                break;
            case "DailyLessonEmail":
                reactElement = React.createElement(DailyLessonEmail, props);
                subject = subject || EMAIL_CONFIG.subjects.DailyLessonEmail(props.title);
                break;
            default:
                throw new Error(`Unknown email template: ${template}`);
        }

        await sendEmail(to, subject, undefined, reactElement);

        return { success: true };
    },
});
