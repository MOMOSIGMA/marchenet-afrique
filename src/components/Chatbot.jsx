import { useEffect, useState, useRef } from 'react';

const Chatbot = () => {
  const [isVisible, setIsVisible] = useState(true); // État pour masquer/afficher
  const [position, setPosition] = useState({ x: 16, y: 16 }); // Position initiale (bas-droite)
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const chatbotRef = useRef(null);

  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://www.gstatic.com/dialogflow-console/fast/messenger/bootstrap.js?v=1';
    script.async = true;
    document.body.appendChild(script);

    script.onload = () => {
      console.log('Dialogflow script loaded successfully');
      // Forcer un re-rendu après le chargement du script
      setIsVisible(false);
      setTimeout(() => setIsVisible(true), 100);
    };

    script.onerror = () => {
      console.error('Failed to load Dialogflow script');
    };

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

  // Gestion du drag-and-drop (souris)
  const handleMouseDown = (e) => {
    if (chatbotRef.current) {
      const rect = chatbotRef.current.getBoundingClientRect();
      setIsDragging(true);
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
    }
  };

  const handleMouseMove = (e) => {
    if (isDragging) {
      const newX = e.clientX - dragOffset.x;
      const newY = e.clientY - dragOffset.y;
      const maxX = window.innerWidth - (chatbotRef.current?.offsetWidth || 300);
      const maxY = window.innerHeight - (chatbotRef.current?.offsetHeight || 400);
      setPosition({
        x: Math.max(0, Math.min(newX, maxX)),
        y: Math.max(0, Math.min(newY, maxY)),
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Gestion du drag-and-drop (tactile)
  const handleTouchStart = (e) => {
    if (chatbotRef.current) {
      const touch = e.touches[0];
      const rect = chatbotRef.current.getBoundingClientRect();
      setIsDragging(true);
      setDragOffset({
        x: touch.clientX - rect.left,
        y: touch.clientY - rect.top,
      });
    }
  };

  const handleTouchMove = (e) => {
    if (isDragging) {
      e.preventDefault(); // Éviter le scroll par défaut
      const touch = e.touches[0];
      const newX = touch.clientX - dragOffset.x;
      const newY = touch.clientY - dragOffset.y;
      const maxX = window.innerWidth - (chatbotRef.current?.offsetWidth || 300);
      const maxY = window.innerHeight - (chatbotRef.current?.offsetHeight || 400);
      setPosition({
        x: Math.max(0, Math.min(newX, maxX)),
        y: Math.max(0, Math.min(newY, maxY)),
      });
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      window.addEventListener('touchmove', handleTouchMove, { passive: false });
      window.addEventListener('touchend', handleTouchEnd);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isDragging, dragOffset]);

  return (
    <>
      {!isVisible ? (
        <button
          onClick={() => setIsVisible(true)}
          onTouchStart={() => setIsVisible(true)}
          className="fixed bottom-4 right-4 z-50 bg-orange-500 text-white rounded-full p-3 shadow-lg hover:bg-orange-600"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16h6M4 6h16M4 12h16m-7 6h7" />
          </svg>
        </button>
      ) : (
        <div
          ref={chatbotRef}
          className="fixed z-50"
          style={{ left: `${position.x}px`, bottom: `${position.y}px` }}
        >
          <div className="relative">
            {/* Bouton pour masquer */}
            <button
              onClick={() => setIsVisible(false)}
              onTouchStart={() => setIsVisible(false)}
              className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 shadow-md hover:bg-red-600"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            {/* Bouton pour déplacer (drag handle) */}
            <div
              onMouseDown={handleMouseDown}
              onTouchStart={handleTouchStart}
              className="absolute top-2 left-2 bg-gray-300 rounded-full p-1 cursor-move"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 8h16M4 12h16M4 16h16" />
              </svg>
            </div>
            <df-messenger
              intent="WELCOME"
              chat-title="MarchyBot"
              agent-id="2069ca38-f63b-4314-85f1-dcb3dd67ff49"
              language-code="fr"
              className="chatbot-widget"
            ></df-messenger>
          </div>
        </div>
      )}
      <style jsx>{`
        .chatbot-widget {
          --df-messenger-bot-message: #ffffff;
          --df-messenger-button-titlebar-color: #ff6200;
          --df-messenger-button-color: #ffffff;
          --df-messenger-widget-titlebar-color: #ff6200;
          --df-messenger-font-color: #000000;
          --df-messenger-chat-background-color: #ffffff; /* Fond blanc */
          max-width: 300px;
          max-height: 400px;
          border-radius: 8px;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        }
        /* Style pour mobile */
        @media (max-width: 640px) {
          .chatbot-widget {
            max-width: 90%;
            max-height: 50vh;
            position: fixed;
            bottom: 16px;
            left: 50%;
            transform: translateX(-50%);
            z-index: 50;
            border-radius: 8px;
            box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);
          }
          /* Surcharge pour éviter le plein écran */
          .chatbot-widget[expanded="true"] {
            position: fixed;
            bottom: 16px;
            left: 50%;
            transform: translateX(-50%);
            height: 50vh;
            width: 90%;
            border-radius: 8px;
          }
        }
      `}</style>
    </>
  );
};

export default Chatbot;