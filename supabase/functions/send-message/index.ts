import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

export const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req: any) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const supabase = createClient(
    "https://xlugjnervpmhwjxghmtp.supabase.co",
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhsdWdqbmVydnBtaHdqeGdobXRwIiwicm9sZSI6ImFub24iLCJpYXQiOjE2NzE0MjUwODgsImV4cCI6MTk4NzAwMTA4OH0.gSj8d4AD1Vi1RQKXHutYPM2lSAIkYlKasU96HXJFwto"
  );

  const { user_id, room_id, message } = await req.json();

  const body = {
    user: user_id,
    room_id: room_id,
    message: message,
  };

  const updateLatestMessage = supabase
    .from("rooms")
    .update({ latest_chat: message })
    .eq("id", room_id);
  const newMessage = supabase.from("messages").insert(body);

  const result = await Promise.all([updateLatestMessage, newMessage]);

  return new Response(JSON.stringify(result), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
