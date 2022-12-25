import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import {
  multiParser,
  FormFile,
} from "https://deno.land/x/multiparser@0.114.0/mod.ts";

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

  const request = await multiParser(req);
  const user_id = request.fields.user_id;
  const room_id = parseInt(request.fields.room_id);
  const message = request.fields.message;

  const image = request.files.file;

  const imagePrefix = Math.floor(Math.random() * (999 - 100 + 1)) + 1;

  const uploadImage = await supabase.storage
    .from("images")
    .upload(imagePrefix + image.filename, image.content, {
      cacheControl: "3600",
      upsert: false,
    });

  const body = {
    img:
      "https://xlugjnervpmhwjxghmtp.supabase.co/storage/v1/object/public/images/" +
      uploadImage.data.path,
    user: user_id,
    room_id,
    message,
  };

  const updateLatestMessage = supabase
    .from("rooms")
    .update({ latest_chat: message })
    .eq("id", room_id);
  const newMessage = supabase.from("messages").insert(body);

  const result = await Promise.all([updateLatestMessage, newMessage]);

  return new Response(JSON.stringify(result), {
    headers: { ...corsHeaders },
  });
});
