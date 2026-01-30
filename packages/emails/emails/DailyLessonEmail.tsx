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
import * as React from "react";

export interface DailyLessonEmailProps {
    title: string;
    lessonUrl: string;
}

export const DailyLessonEmail = ({
    title,
    lessonUrl,
}: DailyLessonEmailProps) => (
    <Html>
        <Head />
        <Preview>Your Daily Lesson: {title}</Preview>
        <Body style={main}>
            <Container style={container}>
                <Heading style={h1}>Today's Lesson: {title}</Heading>
                <Text style={text}>Your new lesson is ready! Take a few minutes to practice your listening and dictation.</Text>
                <Section style={section}>
                    <Link style={link} href={lessonUrl}>
                        Start Lesson
                    </Link>
                </Section>
                <Text style={footer}>
                    Consistency is key to language learning. See you tomorrow!
                </Text>
            </Container>
        </Body>
    </Html>
);

export default DailyLessonEmail;

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
    backgroundColor: "#28a745",
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
