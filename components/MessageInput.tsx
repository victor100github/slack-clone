import { IconSend2 } from "@tabler/icons-react";
import { KeyboardEvent, useState } from "react";

const MessageInput: React.FC<{ onSubmit: (payload: string) => void }> = ({
  onSubmit,
}) => {
  const [messageText, setMessageText] = useState("");

  const submitOnEnter = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.code.toLowerCase() === "enter" && messageText.length) {
      onSubmit(messageText);
      setMessageText("");
    }
  };

  const submitOnClick = () => {
    if (messageText.length) {
      onSubmit(messageText);
      setMessageText("");
    }
  };

  return (
    <div className="layout__message-input">
      <input
        type="text"
        placeholder="Send a message"
        value={messageText}
        onChange={(e) => setMessageText(e.target.value)}
        onKeyDown={(e) => submitOnEnter(e)}
      />
      <div>
        <button onClick={submitOnClick}>
          <IconSend2 />
        </button>
      </div>
    </div>
  );
};

export default MessageInput;
