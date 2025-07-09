import Shepherd from 'shepherd.js';

export const MAIN_TOUR_ID = 'main_tour_v1';

export function createMainTour(): Shepherd.Tour {
  const tour = new Shepherd.Tour({
    useModalOverlay: true,
    defaultStepOptions: {
      cancelIcon: {
        enabled: false
      },
      arrow: false,
      scrollTo: true,
      classes: 'shepherd-theme-custom',
      modalOverlayOpeningPadding: 16,
      modalOverlayOpeningRadius: 16
    }
  });

  // Step 1: Logo Introduction
  tour.addStep({
    id: 'logo-intro',
    text: '👋 Welcome to ACE - your AI co-pilot for procedures and policies',
    attachTo: {
      element: '[data-tour="logo"]',
      on: 'bottom'
    },
    buttons: [
      {
        text: 'Skip',
        action: tour.cancel,
        classes: 'shepherd-button-secondary'
      },
      {
        text: 'Next',
        action: tour.next
      }
    ]
  });

  // Step 2: Chat Composer
  tour.addStep({
    id: 'chat-composer',
    text: '💬 Ask anything about procedures, MELs, or SOPs',
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
            const message = "What is the CABIN ALTITUDE procedure?";
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
                (tour as any).__typeTimeout = setTimeout(simulateTyping, 40);
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
        text: 'Next',
        action: () => {
          // Send the message before moving to next step
          const handleSend = (window as any).__composerHandleSend;
          if (handleSend) {
            handleSend();
          }
          // Wait a bit for the message to be sent before moving to next step
          setTimeout(() => {
            tour.next();
          }, 500);
        }
      }
    ]
  });

  // Step 3: Messages List
  tour.addStep({
    id: 'messages-list',
    text: '📎 Every answer includes manual references - trust the source',
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
    text: '✨ Start fresh conversations anytime',
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

  // Step 5: Assistant Selector
  tour.addStep({
    id: 'assistant-selector',
    text: '🤖 Switch between different aircraft models here',
    attachTo: {
      element: '[data-tour="assistant-selector"]',
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