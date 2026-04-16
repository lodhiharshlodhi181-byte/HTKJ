import { useState } from "react";
import { askAI } from "../services/aiAPI";

export default function ChatBox() {
  const [msg, setMsg] = useState("");
  const [chat, setChat] = useState([]);

  const send = async () => {
    const res = await askAI(msg);

    setChat([...chat, { q: msg, a: res.data.answer }]);
    setMsg("");
  };

  return (
    <div>
      {chat.map((c, i) => (
        <div key={i}>
          <p><b>You:</b> {c.q}</p>
          <p><b>AI:</b> {c.a}</p>
        </div>
      ))}

      <input value={msg} onChange={(e)=>setMsg(e.target.value)} />
      <button onClick={send}>Send</button>
    </div>
  );
}