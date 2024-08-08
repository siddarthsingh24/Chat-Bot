// src/Chatbot.jsx
// src/Chatbot.jsx
import { useState } from 'react';
import axios from 'axios';

const Chatbot = () => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    setMessages([...messages, { text: input, type: 'user' }]);
    setInput('');
    setLoading(true);

    try {
      const response = await axios.post(
        'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=YOUR_API_KEY',
        {
          contents: [
            {
              parts: [
                {
                  text: input,
                },
              ],
            },
          ],
        }
      );

      const botMessage = response.data.candidates[0].content.parts[0].text;

      setMessages([...messages, { text: input, type: 'user' }, { text: botMessage, type: 'bot' }]);
    } catch (error) {
      console.error('Error fetching response:', error);
      setMessages([...messages, { text: 'Error fetching response', type: 'bot' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="chatbot">
      <div className="chat-messages">
        {messages.map((message, index) => (
          <div key={index} className={`message ${message.type}`}>
            {message.text}
          </div>
        ))}
        {loading && <div className="message bot">Loading...</div>}
      </div>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a message..."
        />
        <button type="submit">Send</button>
      </form>
    </div>
  );
};

export default Chatbot;
