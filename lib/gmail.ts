import { google } from "googleapis";
import { Email } from "@/types/email";

export class GmailService {
  private gmail;

  constructor(accessToken: string) {
    const auth = new google.auth.OAuth2();
    auth.setCredentials({ access_token: accessToken });
    this.gmail = google.gmail({ version: "v1", auth });
  }

  async getEmails(maxResults: number = 100): Promise<Email[]> {
    try {
      const response = await this.gmail.users.messages.list({
        userId: "me",
        maxResults,
        labelIds: ["INBOX"],
      });

      const messages = response.data.messages || [];
      const emails: Email[] = [];

      for (const message of messages) {
        if (message.id) {
          const detail = await this.gmail.users.messages.get({
            userId: "me",
            id: message.id,
            format: "full",
          });

          const headers = detail.data.payload?.headers || [];
          const subject = headers.find((h) => h.name === "Subject")?.value || "No Subject";
          const from = headers.find((h) => h.name === "From")?.value || "Unknown Sender";
          const date = headers.find((h) => h.name === "Date")?.value || new Date().toISOString();

          // Get email body preview
          let preview = "";
          if (detail.data.snippet) {
            preview = detail.data.snippet;
          }

          // Check if email is unread
          const isRead = !detail.data.labelIds?.includes("UNREAD");

          emails.push({
            id: message.id,
            from,
            subject,
            preview,
            date: new Date(date).toISOString().split("T")[0],
            isRead,
          });
        }
      }

      return emails;
    } catch (error) {
      console.error("Error fetching emails:", error);
      throw error;
    }
  }

  async deleteEmail(emailId: string): Promise<void> {
    try {
      await this.gmail.users.messages.trash({
        userId: "me",
        id: emailId,
      });
    } catch (error) {
      console.error("Error deleting email:", error);
      throw error;
    }
  }

  async archiveEmail(emailId: string): Promise<void> {
    try {
      await this.gmail.users.messages.modify({
        userId: "me",
        id: emailId,
        requestBody: {
          removeLabelIds: ["INBOX"],
        },
      });
    } catch (error) {
      console.error("Error archiving email:", error);
      throw error;
    }
  }

  async markAsRead(emailId: string): Promise<void> {
    try {
      await this.gmail.users.messages.modify({
        userId: "me",
        id: emailId,
        requestBody: {
          removeLabelIds: ["UNREAD"],
        },
      });
    } catch (error) {
      console.error("Error marking email as read:", error);
      throw error;
    }
  }
}
