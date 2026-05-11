export const sidebarLinks = [
  {
    label: 'Home',
    route: '/',
    icon: 'Home',
  },
  {
    label: 'Events',
    route: '/upcoming',
    icon: 'Calendar',
  },
  {
    label: 'History',
    route: '/previous',
    icon: 'Clock',
  },
  {
    label: 'Files',
    route: '/recordings',
    icon: 'Files',
  },
  {
    label: 'Personal Room',
    route: '/personal-room',
    icon: 'User',
  },
];

export const homeCards = [
  {
    title: 'NEW MEETING',
    description: 'Start an instant meeting',
    icon: 'Plus',
    color: 'orange',
    action: 'instant',
  },
  {
    title: 'JOIN MEETING',
    description: 'With an invitation link',
    icon: 'UserPlus',
    color: 'blue',
    action: 'join',
  },
  {
    title: 'SCHEDULE MEETING',
    description: 'Plan your upcoming meeting',
    icon: 'Calendar',
    color: 'purple',
    action: 'schedule',
  },
  {
    title: 'VIEW RECORDINGS',
    description: 'View and manage all playbacks',
    icon: 'Video',
    color: 'yellow',
    action: 'recordings',
  },
];
