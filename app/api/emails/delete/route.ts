import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { GmailService } from "@/lib/gmail";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.accessToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { emailId } = await request.json();

    if (!emailId) {
      return NextResponse.json({ error: "Email ID required" }, { status: 400 });
    }

    const gmailService = new GmailService(session.accessToken);
    await gmailService.deleteEmail(emailId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting email:", error);
    return NextResponse.json(
      { error: "Failed to delete email" },
      { status: 500 }
    );
  }
}
