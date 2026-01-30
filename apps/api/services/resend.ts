import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendEmail = async (to: string, subject: string, html: string) => {
    if (!process.env.RESEND_API_KEY) {
        throw new Error('RESEND_API_KEY is not set');
    }

    const { data, error } = await resend.emails.send({
        from: 'Dictation App <lessons@dictation-app.com>', // Replace with verified domain
        to: [to],
        subject,
        html,
    });

    if (error) {
        throw new Error(`Resend failed: ${error.message}`);
    }

    return data;
};
