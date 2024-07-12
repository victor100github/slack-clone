import Layout from "@/components/Layout";
import Message from "@/components/Message";
import MessageInput from "@/components/MessageInput";
import { useRouter } from "next/router";
import {
  useStore,
  addMessage,
} from "@/lib/Store";
import { useContext, useEffect, useRef } from "react";
import UserContext from "@/lib/UserContext";
import { Auth } from "@/components/Auth";
import { twMerge } from "tailwind-merge";
import { isMobileView } from "@/lib";
import { IconArrowLeft } from "@tabler/icons-react";
import { NetworkStatusUser } from "@/components/NetworkStatusUser";

export default function ChannelsPage() {
  const router = useRouter();
  const { id: channelId } = router.query;
  const chId = channelId ? parseInt(channelId as string) : 0;
  const { user, showUser, toggleShowUser } = useContext(UserContext);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { messages, channels, users } = useStore({ channelId: chId });
  const isUserIncludedInChat = messages.filter((ls) => ls.user_id === user?.id);
  const isUserChannelChat =
    channels.filter((ls) => ls.id === chId)?.at(0)?.created_by === user?.id;

  useEffect(() => {
    if (!messagesEndRef.current || isMobileView()) return;
    messagesEndRef.current.scrollIntoView({
      block: "start",
      behavior: "smooth",
    });
  }, [messages]);

  useEffect(() => {
    if (!channels.some((channel) => channel.id === chId)) {
      router.replace("/channels/1");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [channels, channelId]);

  return (
    <Auth>
      <Layout channels={channels} activeChannelId={chId} users={users}>
        {!isUserIncludedInChat.length && chId !== 1 && !isUserChannelChat && (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-white bg-opacity-55 text-sm backdrop-blur-lg xl:text-base">
            <p className="text-primary">
              Please first chat to join the private channel!
            </p>
          </div>
        )}
        <div className="layout__inner-message">
          {showUser ? (
            <div className="h-dvh overflow-y-auto px-5 pt-[95px]">
              <button
                onClick={toggleShowUser}
                className="mb-6 flex items-center justify-center gap-2"
              >
                <IconArrowLeft /> Back
              </button>
              <NetworkStatusUser messages={messages} users={users} />
            </div>
          ) : (
            <>
              <div className="layout__inner-message__scroll">
                <div>
                  {messages.map((x) => {
                    const self = user?.id === x.user_id;
                    return (
                      <div
                        key={x.id}
                        className={twMerge([
                          "w-full",
                          self && "flex justify-end",
                        ])}
                      >
                        <Message message={x} self={self} />
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} style={{ height: 0 }} />
                </div>
              </div>
              <div className="layout__inner-message__message">
                <MessageInput
                  onSubmit={async (text) => addMessage(text, chId, user?.id)}
                />
              </div>
            </>
          )}
        </div>
      </Layout>
    </Auth>
  );
}
