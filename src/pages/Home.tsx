import { User } from "@supabase/supabase-js";
import { useCallback, useEffect, useState } from "react";
import RecoverPassword from "../components/auth/RecoverPassword";
import { supabase } from "../lib/api";
import { Link } from "react-router-dom";
import Navbar from "../components/layouts/Navbar";

interface IResults {
  access_token: string;
  refresh_token: string;
  expires_in: string;
  token_type: string;
  type: string;
}

interface IRooms {
  created_at: Date;
  updated_at: Date;
  latest_chat: string;
  id: number;
  name: string;
}

const Home = ({ user }: { user: User }) => {
  const [recoveryToken, setRecoveryToken] = useState<string | null>(null);
  const [roomsData, setRoomsData] = useState<Array<IRooms> | null>([]);

  useEffect(() => {
    /* Recovery url is of the form
     * <SITE_URL>#access_token=x&refresh_token=y&expires_in=z&token_type=bearer&type=recovery
     * Read more on https://supabase.com/docs/reference/javascript/reset-password-email#notes
     */
    let url = window.location.hash;

    let query = url.slice(1);

    let result: IResults = {
      access_token: "",
      refresh_token: "",
      expires_in: "",
      token_type: "",
      type: "",
    };

    query.split("&").forEach((part) => {
      const item = part.split("=");
      result[item[0] as keyof IResults] = decodeURIComponent(item[1]);
    });

    if (result.type === "recovery") {
      setRecoveryToken(result.access_token);
    }
  }, []);

  const fetchMessages = useCallback(async () => {
    const { data, error } = await supabase
      .from("rooms")
      .select("*")
      .order("created_at", { ascending: true });

    if (error) {
      console.log(error);
    }

    setRoomsData(data);
  }, []);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);
  return recoveryToken ? (
    <RecoverPassword
      setRecoveryToken={setRecoveryToken}
      token={recoveryToken}
    />
  ) : (
    <div className="flex flex-col items-center justify-center w-screen min-h-screen bg-gray-100 text-gray-800 p-10">
      <div className="flex flex-col flex-grow w-full max-w-xl bg-white shadow-xl rounded-lg overflow-hidden">
        <Navbar user={user} />
        {roomsData?.length ? (
          <div className="flex flex-col flex-grow h-0 p-4 overflow-auto">
            {roomsData.map((i) => (
              <Link key={i.id} to={"/room/" + i.id}>
                <div className="flex items-center justify-start gap-3 pb-2 border-b-2 border-gray-500">
                  <div className="flex-shrink-0 h-14 w-14 rounded-full bg-gray-300"></div>
                  <div>
                    <p className="font-semibold">{i.name}</p>
                    <div className="flex w-full mt-2 items-center justify-between space-x-3 max-w-xs bg-gray-300 p-3 rounded-r-lg rounded-bl-lg">
                      <p className="text-sm">{i.latest_chat}</p>
                      <span className="text-xs text-gray-500 leading-none">
                        {new Date(i.created_at).toLocaleTimeString()}
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="flex min-h-[80vh] w-full justify-center items-center">
            <h1>Loading...</h1>
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
