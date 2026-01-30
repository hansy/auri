import { task } from "@trigger.dev/sdk/v3";
import { sendEmailTask } from "./sendEmail";

export const confirmEmailTask = task({
    id: "send-confirmation-email",
    run: async (payload: { email: string; token: string }) => {
        const { email, token } = payload;
        const confirmUrl = `${process.env.FRONTEND_URL}/confirm?token=${token}`;

        await sendEmailTask.trigger({
            to: email,
            template: "ConfirmEmail",
            props: { confirmUrl },
        });

        return { success: true };
    },
});
