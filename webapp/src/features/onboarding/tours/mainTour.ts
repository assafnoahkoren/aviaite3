import Shepherd from 'shepherd.js';

export const MAIN_TOUR_ID = 'main_tour_v1';

export function createMainTour(): Shepherd.Tour {
  const tour = new Shepherd.Tour({
    useModalOverlay: true,
    defaultStepOptions: {
      cancelIcon: {
        enabled: true
      },
      scrollTo: true,
      classes: 'shepherd-theme-custom',
      modalOverlayOpeningPadding: 12,
      modalOverlayOpeningRadius: 12
    }
  });

  // Step 1: Logo Introduction
  tour.addStep({
    id: 'logo-intro',
    title: 'Welcome to Ace by Aviate!',
    text: 'Hello! We\'re Ace, your AI-powered assistant designed to help you work smarter and faster. Ace combines cutting-edge AI technology with an intuitive interface to streamline your workflow.',
    attachTo: {
      element: '[data-tour="ace-logo"]',
      on: 'bottom'
    },
    buttons: [
      {
        text: 'Skip Tour',
        action: tour.cancel,
        classes: 'shepherd-button-secondary'
      },
      {
        text: 'Nice to meet you!',
        action: tour.next
      }
    ]
  });

  // Step 2: Chat Composer
  tour.addStep({
    id: 'chat-composer',
    title: 'Start Chatting with Ace',
    text: 'Type your question or request here and press Enter to send. You can ask Ace anything - from coding questions to general assistance.',
    attachTo: {
      element: '[data-tour="chat-composer"]',
      on: 'top'
    },
    when: {
      show() {
        // Start typing animation when this step is shown
        setTimeout(() => {
          const textarea = document.querySelector('[data-tour="chat-composer"] textarea') as HTMLTextAreaElement;
          if (textarea) {
            textarea.focus();
          }
          
          // Use the exposed setValue function
          const setValue = (window as any).__composerSetValue;
          if (setValue) {
            const message = "What can you help me with today?";
            let currentText = '';
            let charIndex = 0;
            
            // Clear any existing value
            setValue('');
            
            // Function to simulate typing
            const simulateTyping = () => {
              if (charIndex < message.length) {
                currentText += message[charIndex];
                setValue(currentText);
                charIndex++;
                
                // Continue typing
                (tour as any).__typeTimeout = setTimeout(simulateTyping, 30);
              }
            };
            
            // Start typing
            simulateTyping();
          }
        }, 500); // Small delay to ensure React component is ready
      },
      hide() {
        // Clear the typing timeout if step is hidden
        if ((tour as any).__typeTimeout) {
          clearTimeout((tour as any).__typeTimeout);
        }
        
        // Clear the textarea value
        const setValue = (window as any).__composerSetValue;
        if (setValue) {
          setValue('');
        }
      }
    },
    buttons: [
      {
        text: 'Back',
        action: tour.back,
        classes: 'shepherd-button-secondary'
      },
      {
        text: 'Send & Continue',
        action: () => {
          // Find the send button (ActionIcon with IconSend)
          const composerContainer = document.querySelector('[data-tour="chat-composer"]')?.closest('.mantine-Group-root');
          const sendButton = composerContainer?.querySelector('button:last-child') as HTMLButtonElement;
          
          if (sendButton && !sendButton.disabled) {
            sendButton.click();
            
            // Wait for the message to be sent and response to start
            setTimeout(() => {
              tour.next();
            }, 2000);
          } else {
            // If can't send, just proceed
            tour.next();
          }
        }
      }
    ]
  });

  // Step 3: Messages List
  tour.addStep({
    id: 'messages-list',
    title: 'Your Conversation',
    text: 'Here you can see your messages and Ace\'s responses. Watch as Ace processes your question and provides helpful answers in real-time!',
    attachTo: {
      element: '[data-tour="messages-list"]',
      on: 'bottom'
    },
    buttons: [
      {
        text: 'Back',
        action: tour.back,
        classes: 'shepherd-button-secondary'
      },
      {
        text: 'Next',
        action: tour.next
      }
    ]
  });

  // Step 4: Create New Chat
  tour.addStep({
    id: 'new-chat',
    title: 'Start a New Conversation',
    text: 'Click the "New Chat" button to begin a fresh conversation with the AI assistant.',
    attachTo: {
      element: '[data-tour="new-chat-button"]',
      on: 'bottom'
    },
    buttons: [
      {
        text: 'Back',
        action: tour.back,
        classes: 'shepherd-button-secondary'
      },
      {
        text: 'Next',
        action: tour.next
      }
    ]
  });

  // Step 5: Chat History
  tour.addStep({
    id: 'chat-history',
    title: 'Your Chat History',
    text: 'All your previous conversations are saved here. Click on any chat to continue where you left off.',
    attachTo: {
      element: '[data-tour="chat-history"]',
      on: 'right'
    },
    buttons: [
      {
        text: 'Back',
        action: tour.back,
        classes: 'shepherd-button-secondary'
      },
      {
        text: 'Next',
        action: tour.next
      }
    ]
  });

  // Step 6: Settings
  tour.addStep({
    id: 'settings',
    title: 'Settings',
    text: 'Access your account settings and preferences here.',
    attachTo: {
      element: '[data-tour="settings-button"]',
      on: 'bottom'
    },
    buttons: [
      {
        text: 'Back',
        action: tour.back,
        classes: 'shepherd-button-secondary'
      },
      {
        text: 'Finish',
        action: tour.complete
      }
    ]
  });

  return tour;
}