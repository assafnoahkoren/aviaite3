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
      classes: 'shepherd-theme-custom'
    }
  });

  // Step 1: Welcome
  tour.addStep({
    id: 'welcome',
    title: 'Welcome to the Platform!',
    text: 'Let\'s take a quick tour to help you get started with the key features.',
    buttons: [
      {
        text: 'Skip Tour',
        action: tour.cancel,
        classes: 'shepherd-button-secondary'
      },
      {
        text: 'Next',
        action: tour.next
      }
    ]
  });

  // Step 2: Create New Chat
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

  // Step 3: Chat History
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

  // Step 4: Chat Interface
  tour.addStep({
    id: 'chat-interface',
    title: 'Chat Interface',
    text: 'Type your message here and press Enter or click Send to chat with the AI assistant.',
    attachTo: {
      element: '[data-tour="chat-composer"]',
      on: 'top'
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

  // Step 5: Settings
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