import {
    Body,
    Container,
    Head,
    Heading,
    Html,
    Link,
    Preview,
    Section,
    Text,
} from "@react-email/components";
// import * as React from "react";

export interface ConfirmEmailProps {
    confirmUrl: string;
}

export const ConfirmEmail = ({ confirmUrl }: ConfirmEmailProps) => (
    <Html>
        <Head />
        <Preview>Confirm your auri subscription</Preview>
        <Body style={main}>
            <Container style={container}>
                <Heading style={h1}>Welcome to auri!</Heading>
                <Text style={text}>
                    Please confirm your subscription by clicking the link below:
                </Text>
                <Section style={section}>
                    <Link style={link} href={confirmUrl}>
                        Confirm Subscription
                    </Link>
                </Section>
                <Text style={footer}>
                    If you didn't request this email, you can safely ignore it.
                </Text>
            </Container>
        </Body>
    </Html>
);

export default ConfirmEmail;

const main = {
    backgroundColor: "#f6f9fc",
    fontFamily:
        '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
    backgroundColor: "#ffffff",
    margin: "0 auto",
    padding: "20px 0 48px",
    marginBottom: "64px",
};

const h1 = {
    color: "#333",
    fontSize: "24px",
    fontWeight: "bold",
    textAlign: "center" as const,
    margin: "30px 0",
};

const text = {
    color: "#333",
    fontSize: "16px",
    lineHeight: "26px",
    textAlign: "center" as const,
};

const section = {
    textAlign: "center" as const,
    margin: "32px 0",
};

const link = {
    backgroundColor: "#007bff",
    borderRadius: "5px",
    color: "#fff",
    fontSize: "16px",
    fontWeight: "bold",
    textDecoration: "none",
    textAlign: "center" as const,
    display: "inline-block",
    padding: "12px 24px",
};

const footer = {
    color: "#8898aa",
    fontSize: "12px",
    lineHeight: "16px",
    textAlign: "center" as const,
    marginTop: "16px",
};
