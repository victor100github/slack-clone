import Link from "next/link";
import { ReactNode, useContext, useState } from "react";
import UserContext from "@/lib/UserContext";
import TrashIcon from "@/components/TrashIcon";
import {
  addChannel,
  deleteChannel,
  SupabaseChannelsResponse,
  SupabaseUserResponse,
} from "@/lib/Store";
import { User } from "@supabase/supabase-js";
import {
  IconHash,
  IconLogout2,
  IconMenu3,
  IconPlus,
} from "@tabler/icons-react";
import Image from "next/image";
import { Roles } from "@/lib/constants";
import { twMerge } from "tailwind-merge";

const ActiveUserIndicator: React.FC<{ total: string; onClick: () => void }> = (
  props,
) => {
  return (
    <div
      className="layout__user-indicator cursor-pointer"
      onClick={props.onClick}
    >
      <div className="bg-primary">S</div>
      <div className="translate-x-[-15px] bg-red-500">V</div>
      <div className="translate-x-[-30px] bg-green-500">{props.total}</div>
    </div>
  );
};

const SidebarItem: React.FC<{
  channel: SupabaseChannelsResponse;
  isActiveChannel: boolean;
  user: User | null | undefined;
  userRoles: string[] | undefined;
  onClick: () => void;
}> = ({ channel, isActiveChannel, user, userRoles, onClick }) => (
  <>
    <li className="layout__channel-list__link">
      <Link
        href="/channels/[id]"
        as={`/channels/${channel.id}`}
        className="w-full"
        onClick={onClick}
      >
        <span className={isActiveChannel ? "font-bold" : ""}>
          {channel.slug}
        </span>
      </Link>
      {channel.id !== 1 &&
        (channel.created_by === user?.id ||
          userRoles?.includes(Roles.ADMIN.toLowerCase())) && (
          <button onClick={() => deleteChannel(channel.id)}>
            <TrashIcon />
          </button>
        )}
    </li>
  </>
);

function getActiveUser(payload: Map<string, SupabaseUserResponse | null>) {
  if (!payload) return payload;
  const size = payload.size;
  return size >= 3 ? 3 + "+" : 3 + "";
}

const Layout: React.FC<{
  channels: SupabaseChannelsResponse[];
  children: ReactNode;
  activeChannelId: number;
  users: Map<string, SupabaseUserResponse | null>;
}> = (props) => {
  const { signOut, user, userRoles, toggleShowUser } = useContext(UserContext);
  const [toggle, setToggle] = useState(false);
  const email = user?.email;

  const slugify = (text: string) => {
    return text
      .toString()
      .toLowerCase()
      .replace(/\s+/g, "-") // Replace spaces with -
      .replace(/[^\w-]+/g, "") // Remove all non-word chars
      .replace(/--+/g, "-") // Replace multiple - with single -
      .replace(/^-+/, "") // Trim - from start of text
      .replace(/-+$/, ""); // Trim - from end of text
  };

  const newChannel = async () => {
    const slug = prompt("Please enter your name");
    if (user && slug) {
      addChannel(slugify(slug), user.id);
    }
  };

  const handleLogout = () => {
    const flag = confirm("Are you sure want to logout");
    if (flag && signOut) signOut();
  };

  const handleToggle = () => {
    setToggle((s) => !s);
  };

  return (
    <main className="layout__container">
      {/* Sidebar */}
      <nav
        className={twMerge([
          "layout__sidebar",
          toggle && "layout__sidebar--close",
        ])}
      >
        <div className="layout__sidebar-1">
          <button className="layout__sidebar-1__btn">
            <Image
              src={"/slack-clone-logo.jpg"}
              loading="lazy"
              width={40}
              height={40}
              alt="app logo"
            />
          </button>
          <button className="layout__sidebar-1__btn-trans">
            <IconHash width={25} height={25} className="text-gray-200" />
          </button>
          <button
            className="layout__sidebar-1__btn-trans mt-auto"
            onClick={handleLogout}
          >
            <IconLogout2 width={25} height={25} className="text-gray-200" />
          </button>
        </div>
        {!toggle && (
          <div className={"layout__sidebar-2"}>
            <div className="layout__sidebar-2__label">
              <div># Channels</div>
              <button onClick={() => newChannel()}>
                <IconPlus width={18} height={18} className="text-primary" />
              </button>
            </div>
            <hr className="my-2" />
            <ul className="layout__channel-list">
              {props.channels.map((x) => (
                <SidebarItem
                  channel={x}
                  key={x.id}
                  isActiveChannel={x.id === props.activeChannelId}
                  user={user}
                  userRoles={userRoles}
                  onClick={handleToggle}
                />
              ))}
            </ul>
          </div>
        )}
      </nav>

      {/* Messages */}
      <div className="layout__message">
        <div className="layout__message-nav">
          <div className="flex items-center justify-center gap-3">
            <button className={"px-3"} onClick={handleToggle}>
              <IconMenu3 />
            </button>
            <ActiveUserIndicator
              total={getActiveUser(props.users)}
              onClick={() => {
                if(toggleShowUser) toggleShowUser();
              }}
            />
          </div>
          <span className="truncate text-gray-500">{email}</span>
        </div>
        {props.children}
      </div>
    </main>
  );
};

export default Layout;
