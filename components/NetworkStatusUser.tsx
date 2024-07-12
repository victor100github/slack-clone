import { parseEmail } from "@/lib";
import { USER_NETWORK_STATUS } from "@/lib/constants";
import { SupabaseMessageResponse, SupabaseUserResponse } from "@/lib/Store";

export const NetworkStatusUser: React.FC<{
    messages: SupabaseMessageResponse[];
    users: Map<string, SupabaseUserResponse | null>;
  }> = ({ messages, users }) => {
    const userList = Array.from(new Set(messages.map((ls) => ls.author.id)));
    const networkStatusUser = userList.map((ls) => {
      const user = users.get(ls);
      return {
        name: parseEmail(user?.username ?? "") as string,
        status: user?.status === USER_NETWORK_STATUS.ONLINE,
      };
    });
  
    return (
      <>
        {networkStatusUser.map((ls, idx) => {
          return (
            <div key={idx} className="my-2 pl-7 font-bold text-primary">
              <span className={!ls.status ? "text-red-500" : "text-green-500"}>
                {ls.status ? "Online" : "Offline"}
              </span>
              {" - "}
              {ls.name}
            </div>
          );
        })}
      </>
    );
  };