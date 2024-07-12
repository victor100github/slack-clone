import { useContext } from "react";
import UserContext from "@/lib/UserContext";
import { deleteMessage, SupabaseMessageResponse } from "@/lib/Store";
import TrashIcon from "@/components/TrashIcon";
import { twMerge } from "tailwind-merge";
import moment from "moment";
import { Roles } from "@/lib/constants";
import { parseEmail } from "@/lib";

const Message: React.FC<{
  message: SupabaseMessageResponse;
  self: boolean;
}> = ({ message, self }) => {
  const { user, userRoles } = useContext(UserContext);
  const superUser = [Roles.ADMIN] as string[];

  return (
    <div
      className={twMerge([
        "layout__message-chat group",
        !self && "layout__message-chat--self",
      ])}
    >
      {(user?.id === message.user_id ||
        userRoles?.some((ls) => superUser.includes(ls))) && (
        <button
          onClick={() => deleteMessage(message?.id)}
          className={
            self
              ? "layout__channel-chat-icon--left"
              : "layout__channel-chat-icon--right"
          }
        >
          <TrashIcon />
        </button>
      )}

      <div className={"layout__channel-chat-message"}>
        <p
          className={twMerge([
            "layout__channel-chat-title",
            self && "layout__channel-chat-title--right",
          ])}
        >
          {parseEmail(message?.author?.username)}
          <span>{moment(message?.inserted_at).format("hh:mmA")}</span>
        </p>
        <p
          className={twMerge([
            "layout__channel-chat-message-info",
            self && "layout__channel-chat-message-info--right",
          ])}
        >
          {message.message}
        </p>
      </div>
    </div>
  );
};

export default Message;
