import { task } from "@trigger.dev/sdk/v3";
import { sendEmail } from "../services/resend";

export const confirmEmailTask = task({
    id: "send-confirmation-email",
    run: async (payload: { email: string; token: string }) => {
        const { email, token } = payload;
        const confirmUrl = `${process.env.FRONTEND_URL}/confirm?token=${token}`;

        await sendEmail(
            email,
            "Confirm your Dictation subscription",
            `<p>Please confirm your subscription by clicking here: <a href="${confirmUrl}">${confirmUrl}</a></p>`
        );

        return { success: true };
    },
});
