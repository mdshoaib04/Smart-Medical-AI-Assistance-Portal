interface NotificationData {
  id: string;
  type: 'appointment' | 'message' | 'reminder' | 'emergency' | 'system';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  actionUrl?: string;
}

export class NotificationService {
  private static instance: NotificationService;
  private listeners: Array<(notifications: NotificationData[]) => void> = [];
  private notifications: NotificationData[] = [];

  private constructor() {
    this.loadNotifications();
  }

  static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  private loadNotifications() {
    const saved = localStorage.getItem('app_notifications');
    if (saved) {
      try {
        this.notifications = JSON.parse(saved).map((n: any) => ({
          ...n,
          timestamp: new Date(n.timestamp),
        }));
      } catch (e) {
        console.error('Failed to load notifications:', e);
      }
    }
  }

  private saveNotifications() {
    localStorage.setItem('app_notifications', JSON.stringify(this.notifications));
    this.notifyListeners();
  }

  subscribe(listener: (notifications: NotificationData[]) => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notifyListeners() {
    this.listeners.forEach(listener => listener([...this.notifications]));
  }

  addNotification(data: Omit<NotificationData, 'id' | 'timestamp' | 'read'>) {
    const notification: NotificationData = {
      ...data,
      id: Date.now().toString(),
      timestamp: new Date(),
      read: false,
    };

    this.notifications.unshift(notification);
    
    // Keep only last 100 notifications
    if (this.notifications.length > 100) {
      this.notifications = this.notifications.slice(0, 100);
    }

    this.saveNotifications();

    // Show browser notification if permission granted
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(data.title, {
        body: data.message,
        icon: '/icon-192.png',
      });
    }
  }

  markAsRead(id: string) {
    this.notifications = this.notifications.map(n =>
      n.id === id ? { ...n, read: true } : n
    );
    this.saveNotifications();
  }

  markAllAsRead() {
    this.notifications = this.notifications.map(n => ({ ...n, read: true }));
    this.saveNotifications();
  }

  deleteNotification(id: string) {
    this.notifications = this.notifications.filter(n => n.id !== id);
    this.saveNotifications();
  }

  getNotifications(): NotificationData[] {
    return [...this.notifications];
  }

  getUnreadCount(): number {
    return this.notifications.filter(n => !n.read).length;
  }

  async requestPermission() {
    if ('Notification' in window) {
      return await Notification.requestPermission();
    }
    return 'denied';
  }
}

// Helper function for appointment notifications
export const createAppointmentNotification = (doctorName: string, date: string) => {
  const service = NotificationService.getInstance();
  service.addNotification({
    type: 'appointment',
    title: 'Appointment Scheduled',
    message: `Your appointment with ${doctorName} is scheduled for ${date}`,
    actionUrl: '/appointments',
  });
};

// Helper function for message notifications
export const createMessageNotification = (senderName: string) => {
  const service = NotificationService.getInstance();
  service.addNotification({
    type: 'message',
    title: 'New Message',
    message: `You have a new message from ${senderName}`,
    actionUrl: '/messages',
  });
};


