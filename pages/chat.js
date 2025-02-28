import React, { useRef, useEffect } from "react";

export default function Home() {
  // States
  const [value, setValue] = React.useState("");
  const [conversation, setConversation] = React.useState([]);
  const inputRef = useRef(null);
  const containerRef = useRef(null);

  const handleInput = React.useCallback((e) => {
    setValue(e.target.value);
  }, []);
  const handleKeyDown = async (e) => {
    if (e.key === "Enter") {
      handleButtonClick();
    }
  };

  const handleButtonClick = async () => {
    const chatHistory = [...conversation, { role: "user", content: value }];
    const chat = [
      { role: "system", content: "You are a therapist" },
      ...conversation,
      { role: "user", content: value },
    ];
    console.log(chatHistory);
    const response = await fetch("/api/openAIChat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ messages: chat }),
    });

    const data = await response.json();
    setValue("");
    setConversation([
      ...chatHistory,
      { role: "assistant", content: data.result.choices[0].message.content },
    ]);
  };
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [conversation]);

  const handleRefresh = () => {
    inputRef.current?.focus();
    setValue("");
    setConversation([]);
  };
  return (
    <div className="flex flex-col h-screen bg-yellow-100">
      <div className="flex items-center justify-center h-24 bg-orange-200">
        <h1 className="text-4xl text-gray-700">MindFulife</h1>
      </div>
      <div className="flex-1 flex items-center justify-center">
        <div className="w-full max-w-md">
          <div className="bg-white shadow-md rounded-md p-6">
            <div className="overflow-y-scroll h-72" ref={containerRef}>
              {conversation.map((item, index) => (
                <div
                  key={index}
                  className={`mb-2 ${
                    item.role === "assistant" ? "text-right" : ""
                  }`}
                >
                  <span
                    className={`inline-block px-4 py-2 rounded-lg ${
                      item.role === "assistant"
                        ? "bg-blue-500 text-white"
                        : "bg-gray-200 text-gray-700"
                    }`}
                  >
                    {item.content}
                  </span>
                </div>
              ))}
            </div>
            <div className="flex justify-between h-full mt-4">
              <div className=" h-full">
                <input
                  placeholder="Type here"
                  className="w-full h-full px-4 py-2 border border-gray-900 rounded-md focus:outline-none focus:border-blue-500"
                  value={value}
                  onChange={handleInput}
                  onKeyDown={handleKeyDown}
                  ref={inputRef}
                />
              </div>
              <button
                className="px-4 py-2 h-full bg-green-500 text-white rounded-md hover:bg-green-600 focus:outline-none focus:bg-green-600"
                onClick={handleButtonClick}
              >
                Send
              </button>
            </div>
          </div>
          <button
            className="px-4 py-2 bg-white border border-gray-500 rounded-md hover:bg-gray-100 focus:outline-none focus:bg-gray-100 mt-4 ml-32"
            onClick={handleRefresh}
          >
            Start New Conversation
          </button>
        </div>
      </div>
    </div>
  );
}
