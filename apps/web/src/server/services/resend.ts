import { Resend } from 'resend';
import * as React from 'react';


const resend = new Resend(process.env.RESEND_API_KEY);

export const sendEmail = async (to: string, subject: string, react: React.ReactNode) => {
    if (!process.env.RESEND_API_KEY) {
        throw new Error('RESEND_API_KEY is not set');
    }

    const { data, error } = await resend.emails.send({
        from: 'auri <support@hearauri.com>',
        to: [to],
        subject,
        react,
    });


    if (error) {
        throw new Error(`Resend failed: ${error.message}`);
    }

    return data;
};
