import { Fragment, useCallback, useEffect, useState, useRef } from "react";
import { supabase } from "../lib/api";
import { useParams } from "react-router-dom";
import { User } from "@supabase/supabase-js";
import Navbar from "../components/layouts/Navbar";
import {
  REACT_APP_SUPABASE_FUNCTION_BASE_URL,
  REACT_APP_SUPABASE_KEY,
} from "../lib/constants";
import { GrAttachment, GrSend } from "react-icons/gr";

interface IMessage {
  created_at: Date;
  id: number;
  message: string;
  room_id: number;
  user: string;
  img?: string;
}

const ChatPages = ({ user }: { user: User | null }) => {
  const [messages, setMessages] = useState<Array<IMessage> | null>(null);
  const [inputMessage, setInputMessage] = useState("");
  const [changes, setChanges] = useState(0);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const { room_id } = useParams();

  const fetchMessages = useCallback(async () => {
    const { data, error } = await supabase
      .from("messages")
      .select("*")
      .eq("room_id", room_id)
      .order("created_at", { ascending: true });

    if (error) {
      console.log(error);
    }

    setMessages(data);
  }, [room_id]);

  const handleSendMessage = async () => {
    const body = {
      user: user?.id,
      room_id: parseInt(room_id!),
      message: inputMessage,
    };

    const newMessage = supabase.from("messages").insert(body);
    const updateLatestMessage = supabase
      .from("rooms")
      .update({ latest_chat: inputMessage })
      .eq("id", room_id);

    await Promise.all([newMessage, updateLatestMessage]);

    setInputMessage("");
  };

  const handleSendMessageFromEdgeFunctions = async () => {
    if (fileInputRef.current?.files?.length) {
      const data = new FormData();
      data.append("file", fileInputRef.current?.files[0]);
      data.append("message", inputMessage);
      data.append("room_id", room_id!);
      data.append("user_id", user?.id!);

      fetch(REACT_APP_SUPABASE_FUNCTION_BASE_URL + "/upload-image", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${REACT_APP_SUPABASE_KEY}`,
        },
        body: data,
      })
        .then((res) => res.json())
        .then((result) => console.log(result))
        .catch((err) => console.log(err));

      setInputMessage("");
    } else {
      const body = {
        user_id: user?.id,
        room_id: parseInt(room_id!),
        message: inputMessage,
      };

      fetch(REACT_APP_SUPABASE_FUNCTION_BASE_URL + "/send-message", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${REACT_APP_SUPABASE_KEY}`,
        },
        body: JSON.stringify(body),
      })
        .then((res) => res.json())
        .then((result) => console.log(result))
        .catch((err) => console.log(err));

      setInputMessage("");
    }
  };

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages, changes]);

  useEffect(() => {
    supabase
      .channel("*")
      .on("postgres_changes", { event: "*", schema: "*" }, (payload: any) => {
        setChanges((current) => current + 1);
        const sendedUser = payload.new.user;
        if (sendedUser !== user?.id) {
          Notification.requestPermission().then((permission) => {
            if (permission === "granted") {
              new Notification("New Message", {
                body: payload.new.message,
              });
            }
          });
        }
      })
      .subscribe();
  }, [user?.id]);

  return (
    <div className="flex flex-col items-center justify-center w-screen min-h-screen bg-gray-100 text-gray-800 p-10">
      <div className="flex flex-col flex-grow w-full max-w-xl bg-white shadow-xl rounded-lg overflow-hidden">
        <Navbar user={user} />
        {messages?.length ? (
          <div className="flex flex-col flex-grow h-0 p-4 overflow-auto">
            <>
              {messages.map((i) => (
                <Fragment key={i.id}>
                  {i.user !== user?.id ? (
                    <div className="flex w-full mt-2 space-x-3 max-w-xs">
                      <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-300"></div>
                      <div>
                        {i.img ? (
                          <div>
                            <img
                              className="w-52 h-32 object-cover"
                              src={i.img}
                              alt={i.message}
                            />
                          </div>
                        ) : null}
                        <div className="bg-gray-300 p-3 rounded-r-lg rounded-bl-lg">
                          <p className="text-sm">{i.message}</p>
                        </div>
                        <span className="text-xs text-gray-500 leading-none">
                          {new Date(i.created_at).toLocaleTimeString()}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="flex w-full mt-2 space-x-3 max-w-xs ml-auto justify-end">
                      <div>
                        {i.img ? (
                          <div>
                            <img
                              className="w-52 h-32 object-cover"
                              src={i.img}
                              alt={i.message}
                            />
                          </div>
                        ) : null}
                        <div className="bg-blue-600 text-white p-3 rounded-l-lg rounded-br-lg">
                          <p className="text-sm">{i.message}</p>
                        </div>
                        <span className="text-xs text-gray-500 leading-none">
                          {new Date(i.created_at).toLocaleTimeString()}
                        </span>
                      </div>
                      <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-300"></div>
                    </div>
                  )}
                </Fragment>
              ))}
            </>
          </div>
        ) : (
          <div className="flex min-h-[80vh] w-full justify-center items-center">
            <h1>Loading...</h1>
          </div>
        )}

        <div className="bg-gray-300 p-4 flex items-center gap-3">
          <div className="flex items-center justify-center bg-grey-lighter">
            <label className="text-blue rounded-lg tracking-wide uppercase cursor-pointer hover:bg-blue-500 hover:text-white">
              <GrAttachment className="text-xl" />
              <input type="file" ref={fileInputRef} className="hidden" />
            </label>
          </div>
          <input
            onKeyDown={(e) =>
              e.key === "Enter" && handleSendMessageFromEdgeFunctions()
            }
            onChange={(e) => setInputMessage(e.target.value)}
            value={inputMessage}
            className="flex items-center h-10 w-full rounded px-3 text-sm"
            type="text"
            placeholder="Type your message…"
          />
          <GrSend
            onClick={handleSendMessageFromEdgeFunctions}
            className="text-xl"
          />
        </div>
      </div>
    </div>
  );
};

export default ChatPages;
