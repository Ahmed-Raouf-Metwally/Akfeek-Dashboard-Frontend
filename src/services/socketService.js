import { io } from 'socket.io-client';
import { API_BASE_URL } from '../config/env';
import { getAuthToken } from './api';

const SOCKET_URL = API_BASE_URL || window.location.origin;

class SocketService {
    constructor() {
        this.socket = null;
    }

    connect() {
        if (this.socket?.connected) return;

        this.socket = io(SOCKET_URL, {
            auth: {
                token: getAuthToken()
            },
            transports: ['websocket'],
            reconnection: true,
            reconnectionAttempts: 5,
            reconnectionDelay: 1000
        });

        this.socket.on('connect', () => {
            console.log('✅ Connected to real-time server');
        });

        this.socket.on('disconnect', () => {
            console.log('❌ Disconnected from real-time server');
        });
    }

    joinFeedbackTicket(feedbackId) {
        if (!this.socket) this.connect();
        this.socket.emit('feedback:join', feedbackId);
    }

    leaveFeedbackTicket(feedbackId) {
        if (this.socket) {
            this.socket.emit('feedback:leave', feedbackId);
        }
    }

    onNewReply(callback) {
        if (!this.socket) this.connect();
        this.socket.on('feedback:new_reply', callback);
    }

    offNewReply() {
        if (this.socket) {
            this.socket.off('feedback:new_reply');
        }
    }

    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
        }
    }
}

export default new SocketService();
