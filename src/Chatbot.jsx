import { useState, useRef, useEffect } from 'react';
import axios from 'axios';

const Chatbot = () => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [chatActive, setChatActive] = useState(true);
  const chatEndRef = useRef(null);

  

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() || !chatActive) return;

    const updatedMessages = [...messages, { text: input, type: 'user' }];
    const conversationContext = updatedMessages.map(msg => `${msg.type === 'user' ? 'Patient' : 'Doctor'}: ${msg.text}`).join('\n');

    const prompt = `You are a doctor. Continue this conversation as a doctor and respond to the patient's query appropriately.\n\n${conversationContext}\nDoctor:`;

    setMessages(updatedMessages);
    setInput('');
    setLoading(true);

    try {
      const response = await axios.post(
        'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=?',
        {
          contents: [
            {
              parts: [
                {
                  text: prompt,
                },
              ],
            },
          ],
        }
      );

      if (response.data.candidates && response.data.candidates.length > 0) {
        const botMessage = response.data.candidates[0].content.parts[0].text;
        setMessages([...updatedMessages, { text: botMessage, type: 'bot' }]);
      } else {
        setMessages([...updatedMessages, { text: 'No response from bot', type: 'bot' }]);
      }
    } catch (error) {
      console.error('Error fetching response:', error);
      setMessages([...updatedMessages, { text: 'Error fetching response', type: 'bot' }]);
    } finally {
      setLoading(false);
    }
  };

  const handleEndChat = () => {
    setChatActive(false);
    setMessages([...messages, { text: 'Chat has been ended.', type: 'bot' }]);
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="max-w-lg mx-auto p-4 border rounded-lg shadow-lg bg-white">
      <div className="chat-messages space-y-4 mb-4">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`message p-2 rounded-lg ${message.type === 'user' ? 'bg-blue-500 text-white self-end' : 'bg-gray-200 text-black self-start'}`}
          >
            {message.text}
          </div>
        ))}
        {loading && <div className="message p-2 rounded-lg bg-gray-200 text-black">Loading...</div>}
        <div ref={chatEndRef} />
      </div>
      <form onSubmit={handleSubmit} className="flex">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a message..."
          className="flex-grow p-2 border rounded-l-lg"
          disabled={!chatActive}
        />
        <button
          type="submit"
          className="p-2 bg-blue-500 text-white rounded-r-lg hover:bg-blue-600"
          disabled={!chatActive}
        >
          Send
        </button>
      </form>
      <button
        onClick={handleEndChat}
        className="mt-4 p-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
      >
        End Chat
      </button>
    </div>
  );
};

export default Chatbot;
