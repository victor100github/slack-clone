import { useState, useEffect, Dispatch, SetStateAction } from "react";
import { createClient } from "@supabase/supabase-js";
import { Tables } from "@/database.types";
import { USER_NETWORK_STATUS } from "./constants";

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
  process.env.NEXT_PUBLIC_SUPABASE_KEY ?? "",
);

export type SupabaseMessageResponse = Tables<"messages"> & {
  author: SupabaseUserResponse;
};
export type SupabaseUserResponse = Tables<"users">;
export type SupabaseChannelsResponse = Tables<"channels">;
export type SupabaseUserRoleResponse = Tables<"user_roles">;

interface UseStoreProps {
  channelId: number;
}

export const useStore = (props: UseStoreProps) => {
  const [channels, setChannels] = useState<SupabaseChannelsResponse[]>([]);
  const [messages, setMessages] = useState<SupabaseMessageResponse[]>([]);
  const [users] = useState<Map<string, SupabaseUserResponse | null>>(new Map());
  const [newMessage, handleNewMessage] =
    useState<SupabaseMessageResponse | null>(null);
  const [newChannel, handleNewChannel] =
    useState<SupabaseChannelsResponse | null>(null);
  const [newOrUpdatedUser, handleNewOrUpdatedUser] =
    useState<SupabaseUserResponse | null>(null);
  const [deletedChannel, handleDeletedChannel] =
    useState<SupabaseChannelsResponse | null>(null);
  const [deletedMessage, handleDeletedMessage] =
    useState<SupabaseMessageResponse | null>(null);
  const [result, setResult] = useState({
    users,
    messages,
    channels,
  });

  // Load initial data and set up listeners
  useEffect(() => {
    // Get Channels
    fetchChannels(setChannels);
    // Listen for new and deleted messages
    const messageListener = supabase
      .from<SupabaseMessageResponse>("messages")
      .on("INSERT", (payload) => handleNewMessage(payload.new))
      .on("DELETE", (payload) => handleDeletedMessage(payload.old))
      .subscribe();
    // Listen for changes to our users
    const userListener = supabase
      .from<SupabaseUserResponse>("users")
      .on("*", (payload) => handleNewOrUpdatedUser(payload.new))
      .subscribe();
    // Listen for new and deleted channels
    const channelListener = supabase
      .from<SupabaseChannelsResponse>("channels")
      .on("INSERT", (payload) => handleNewChannel(payload.new))
      .on("DELETE", (payload) => handleDeletedChannel(payload.old))
      .subscribe();
    // Cleanup on unmount
    return () => {
      messageListener.unsubscribe();
      userListener.unsubscribe();
      channelListener.unsubscribe();
    };
  }, []);

  // Update when the route changes
  useEffect(() => {
    if (props?.channelId > 0) {
      fetchMessages(props.channelId, (messages) => {
        messages?.forEach((x) => users.set(x.user_id, x.author));
        setMessages(messages as SupabaseMessageResponse[]);
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.channelId]);

  useEffect(() => {
    if (newMessage && newMessage.channel_id === Number(props.channelId)) {
      const handleAsync = async () => {
        let authorId = newMessage.user_id;
        if (!users.get(authorId)) {
          const user = await fetchUser(authorId, (user) =>
            handleNewOrUpdatedUser(user),
          );
        }

        setMessages(messages.concat(newMessage));
      };
      handleAsync();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [newMessage]);

  useEffect(() => {
    if (deletedMessage)
      setMessages(
        messages.filter((message) => message.id !== deletedMessage.id),
      );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deletedMessage]);

  useEffect(() => {
    if (newChannel) setChannels(channels.concat(newChannel));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [newChannel]);

  useEffect(() => {
    if (deletedChannel)
      setChannels(
        channels.filter((channel) => channel.id !== deletedChannel.id),
      );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deletedChannel]);

  useEffect(() => {
    if (newOrUpdatedUser) users.set(newOrUpdatedUser.id, newOrUpdatedUser);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [newOrUpdatedUser]);

  useEffect(() => {
    setResult({
      users,
      messages: messages.map((x) => ({
        ...x,
        author: users.get(x.user_id) as SupabaseUserResponse,
      })),
      channels: channels !== null ? channels.sort((a, b) => a.id - b.id) : [],
    });
  }, [users, messages, channels, newOrUpdatedUser]);

  return result;
};

export const fetchChannels = async (
  setState: Dispatch<SetStateAction<SupabaseChannelsResponse[]>>,
) => {
  try {
    let { body } = await supabase
      .from<SupabaseChannelsResponse>("channels")
      .select("*");
    if (body && setState) setState(body);
    return body;
  } catch (error) {
    console.log("error", error);
  }
};

export const fetchUser = async (
  userId: string,
  setState: (x: SupabaseUserResponse) => void,
) => {
  try {
    let { body } = await supabase
      .from<SupabaseUserResponse>("users")
      .select(`*`)
      .eq("id", userId.toString());
    let user = body?.at(0);
    if (user && setState) setState(user);
    return user;
  } catch (error) {
    console.log("error", error);
  }
};

export const fetchUserRoles = async (
  setState: (x: SupabaseUserRoleResponse[] | null) => void,
) => {
  try {
    let { body } = await supabase
      .from<SupabaseUserRoleResponse>("user_roles")
      .select(`*`);
    if (setState) setState(body);
    return body ?? [];
  } catch (error) {
    console.log("error", error);
  }
};

export const updateUserStatus = async (
  userId: string,
  statusOnline: boolean = true,
) => {
  try {
    let { body } = await supabase
      .from<SupabaseUserResponse>("users")
      .update({
        status: statusOnline
          ? USER_NETWORK_STATUS.ONLINE
          : USER_NETWORK_STATUS.OFFLINE,
      })
      .eq("id", userId);
    return body;
  } catch (error) {
    console.log("error", error);
  }
};

export const fetchMessages = async (
  channelId: number,
  setState: (x: SupabaseMessageResponse[] | null) => void,
) => {
  try {
    let { body } = await supabase
      .from<SupabaseMessageResponse>("messages")
      .select(`*, author:user_id(*)`)
      .eq("channel_id", channelId)
      .order("inserted_at");
    if (setState) setState(body);
    return body;
  } catch (error) {
    console.log("error", error);
  }
};

export const addChannel = async (slug: string, user_id: string) => {
  try {
    let { body } = await supabase
      .from("channels")
      .insert([{ slug, created_by: user_id }]);
    return body;
  } catch (error) {
    console.log("error", error);
  }
};

export const addMessage = async (
  message: string,
  channel_id: number,
  user_id: string | undefined,
) => {
  try {
    let { body } = await supabase
      .from("messages")
      .insert([{ message, channel_id, user_id }]);
    return body;
  } catch (error) {
    console.log("error", error);
  }
};

export const deleteChannel = async (channel_id: number) => {
  try {
    let { body } = await supabase
      .from("channels")
      .delete()
      .match({ id: channel_id });
    return body;
  } catch (error) {
    console.log("error", error);
  }
};

export const deleteMessage = async (message_id: number) => {
  try {
    let { body } = await supabase
      .from("messages")
      .delete()
      .match({ id: message_id });
    return body;
  } catch (error) {
    console.log("error", error);
  }
};
