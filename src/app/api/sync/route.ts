import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase";

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { items } = body;

    // Sync items from extension/mobile to backend
    for (const item of items) {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/items`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${user.id}`,
        },
        body: JSON.stringify(item),
      });

      if (!response.ok) {
        console.error("Failed to sync item:", item);
      }
    }

    return NextResponse.json({ success: true, synced: items.length });
  } catch (error) {
    console.error("Sync error:", error);
    return NextResponse.json({ error: "Sync failed" }, { status: 500 });
  }
}