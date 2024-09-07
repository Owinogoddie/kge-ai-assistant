(function() {
    function createChatWidget(config) {
      console.log('first')
      const defaultConfig = {
        primaryColor: '#0000FF',
        serverUrl: 'http://localhost:3000'
        // serverUrl: 'https://excel-chat-phi.vercel.app'
      };
      const widgetConfig = { ...defaultConfig, ...config };
  
      let iframe;
      const toggleButton = document.createElement('button');
      toggleButton.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
        </svg>
      `;
      toggleButton.style.position = 'fixed';
      toggleButton.style.width = '60px';
      toggleButton.style.height = '60px';
      toggleButton.style.borderRadius = '50%';
      toggleButton.style.backgroundColor = widgetConfig.primaryColor;
      toggleButton.style.color = 'white';
      toggleButton.style.border = 'none';
      toggleButton.style.zIndex = '1001';
      toggleButton.style.cursor = 'pointer';
      toggleButton.style.bottom = '20px';
      toggleButton.style.right = '20px';
      toggleButton.style.transition = 'all 0.3s ease-in-out';
  
      document.body.appendChild(toggleButton);
  
      let isOpen = false;
  
      function createIframe() {
        iframe = document.createElement('iframe');
        iframe.src = `${widgetConfig.serverUrl}/embed`;
        iframe.style.position = 'fixed';
        iframe.style.border = 'none';
        iframe.style.boxShadow = '0 0 10px rgba(0,0,0,0.1)';
        iframe.style.zIndex = '1000';
        iframe.style.width = '400px';
        iframe.style.height = '600px';
        iframe.style.borderRadius = '10px';
        iframe.style.bottom = '90px';
        iframe.style.right = '20px';
        iframe.style.transition = 'all 0.3s ease-in-out';
        iframe.style.transform = 'scale(0)';
        iframe.style.opacity = '0';
  
        document.body.appendChild(iframe);
      }
  
      function adjustForMobile() {
        if (!iframe) return;
  
        const mobileBreakpoint = 768;
        if (window.innerWidth <= mobileBreakpoint) {
          iframe.style.width = '100%';
          iframe.style.height = 'calc(100% - 80px)';
          iframe.style.top = '0';
          iframe.style.left = '0';
          iframe.style.right = '0';
          iframe.style.bottom = '80px';
          iframe.style.borderRadius = '0';
        } else {
          iframe.style.width = '400px';
          iframe.style.height = '600px';
          iframe.style.borderRadius = '10px';
          iframe.style.bottom = '90px';
          iframe.style.right = '20px';
          iframe.style.left = 'auto';
          iframe.style.top = 'auto';
        }
      }
  
      function toggleChat() {
        if (!iframe) {
          createIframe();
        }
        if (isOpen) {
          iframe.style.transform = 'scale(0)';
          iframe.style.opacity = '0';
          toggleButton.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
            </svg>
          `;
        } else {
          iframe.style.display = 'block';
          setTimeout(() => {
            iframe.style.transform = 'scale(1)';
            iframe.style.opacity = '1';
          }, 10);
          toggleButton.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          `;
          adjustForMobile();
        }
        isOpen = !isOpen;
      }
  
      toggleButton.addEventListener('click', toggleChat);
  
      window.addEventListener('resize', adjustForMobile);
  
      window.addEventListener('message', (event) => {
        if (event.origin !== widgetConfig.serverUrl) return;
        
        switch (event.data.type) {
          case 'CHAT_CLOSED':
            toggleChat();
            break;
          case 'MESSAGE_SENT':
            console.log('Message sent:', event.data.message);
            break;
        }
      });
    }
  
    if (document.readyState === 'complete') {
      createChatWidget(window.ChatWidgetConfig);
    } else {
      window.addEventListener('load', () => createChatWidget(window.ChatWidgetConfig));
    }
  })();