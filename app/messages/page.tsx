'use client';

import { useState, useEffect, useRef } from 'react';
import { db } from '@/lib/firebase';
import { collection, query, where, orderBy, onSnapshot, addDoc, serverTimestamp, getDocs, getDoc, doc, deleteDoc, updateDoc } from 'firebase/firestore';
import { useAuthContext } from '@/components/layout/AuthLayout';
import { useRouter, useSearchParams } from 'next/navigation';
import { storage } from '@/lib/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Send, 
  Image as ImageIcon, 
  Search, 
  Phone, 
  MapPin, 
  MessageSquare, 
  ChevronLeft,
  MoreVertical,
  Paperclip,
  Smile,
  Mic,
  X,
  Trash2,
  Archive,
  Flag,
  Bell,
  BellOff,
  Blocks,
  Share2,
  AlertTriangle
} from 'lucide-react';
import { format, isToday, isYesterday } from 'date-fns';
import dynamic from 'next/dynamic';

const ProtectedRoute = dynamic(() => import('@/components/auth/ProtectedRoute'), {
  ssr: false
});

interface Message {
  id: string;
  text: string;
  senderId: string;
  senderName: string;
  timestamp: any;
  imageUrl?: string;
  price?: number;
  location?: string;
}

interface Chat {
  id: string;
  participants: string[];
  lastMessage?: Message;
  createdAt: any;
  listingId: string;
  listingName: string;
  listingPrice: number;
  listingImage?: string;
  sellerId: string;
  archived: boolean;
  archivedAt: any;
  muted: boolean;
}

// Add message suggestions
const MESSAGE_SUGGESTIONS = [
  "Is this still available?",
  "What's the best price you can offer?",
  "Can I see more photos?",
  "Where can we meet?",
  "Is this negotiable?",
  "What's the condition?",
  "Do you have more in stock?",
  "Can you deliver?",
  "What's your location?",
  "Is this authentic?"
];

interface ChatControlsProps {
  chat: Chat;
  onClose: () => void;
  onDelete: () => void;
  onArchive: () => void;
  onReport: () => void;
  onToggleNotifications: () => void;
  onBlock: () => void;
  onShare: () => void;
}

const ChatControls = ({ 
  chat, 
  onClose, 
  onDelete, 
  onArchive, 
  onReport, 
  onToggleNotifications,
  onBlock,
  onShare 
}: ChatControlsProps) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-full hover:bg-[var(--accent)] transition-colors"
      >
        <MoreVertical className="w-5 h-5 text-[var(--foreground)]" />
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />

          {/* Controls Menu */}
          <div className="absolute right-0 top-full mt-2 w-48 bg-[var(--background)] rounded-xl shadow-lg z-50 overflow-hidden">
            <div className="py-1">
              <button
                onClick={() => {
                  onShare();
                  setIsOpen(false);
                }}
                className="w-full px-4 py-2 text-left text-sm text-[var(--foreground)] hover:bg-[var(--accent)] transition-colors flex items-center space-x-2"
              >
                <Share2 className="w-4 h-4" />
                <span>Share Chat</span>
              </button>

              <button
                onClick={() => {
                  onToggleNotifications();
                  setIsOpen(false);
                }}
                className="w-full px-4 py-2 text-left text-sm text-[var(--foreground)] hover:bg-[var(--accent)] transition-colors flex items-center space-x-2"
              >
                {chat.muted ? (
                  <BellOff className="w-4 h-4" />
                ) : (
                  <Bell className="w-4 h-4" />
                )}
                <span>{chat.muted ? 'Unmute' : 'Mute'} Notifications</span>
              </button>

              <button
                onClick={() => {
                  onArchive();
                  setIsOpen(false);
                }}
                className="w-full px-4 py-2 text-left text-sm text-[var(--foreground)] hover:bg-[var(--accent)] transition-colors flex items-center space-x-2"
              >
                <Archive className="w-4 h-4" />
                <span>Archive Chat</span>
              </button>

              <button
                onClick={() => {
                  onBlock();
                  setIsOpen(false);
                }}
                className="w-full px-4 py-2 text-left text-sm text-[var(--foreground)] hover:bg-[var(--accent)] transition-colors flex items-center space-x-2"
              >
                <Blocks className="w-4 h-4" />
                <span>Block User</span>
              </button>

              <button
                onClick={() => {
                  onReport();
                  setIsOpen(false);
                }}
                className="w-full px-4 py-2 text-left text-sm text-red-500 hover:bg-red-50 transition-colors flex items-center space-x-2"
              >
                <Flag className="w-4 h-4" />
                <span>Report</span>
              </button>

              <button
                onClick={() => {
                  onDelete();
                  setIsOpen(false);
                }}
                className="w-full px-4 py-2 text-left text-sm text-red-500 hover:bg-red-50 transition-colors flex items-center space-x-2"
              >
                <Trash2 className="w-4 h-4" />
                <span>Delete Chat</span>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default function MessagesPage() {
  const [mounted, setMounted] = useState(false);
  const [chats, setChats] = useState<Chat[]>([]);
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const { user } = useAuthContext();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const searchParams = useSearchParams();
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [chatToDelete, setChatToDelete] = useState<Chat | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    
    if (!user) {
      router.push('/login');
      return;
    }

    const initializeChat = async () => {
      try {
        const listingId = searchParams.get('listingId');
        const sellerId = searchParams.get('sellerId');
        
        if (listingId && sellerId) {
          const listingDoc = await getDoc(doc(db, 'listings', listingId));
          if (listingDoc.exists()) {
            const listingData = listingDoc.data();
            
            const existingChatQuery = query(
              collection(db, 'chats'),
              where('participants', 'array-contains', user.uid),
              where('listingId', '==', listingId)
            );
            
            const existingChat = await getDocs(existingChatQuery);
            
            if (existingChat.empty) {
              const chatData = {
                participants: [user.uid, sellerId],
                createdAt: serverTimestamp(),
                listingId,
                listingName: listingData.title || 'Untitled Listing',
                listingPrice: listingData.price || 0,
                sellerId
              };

              const chatDataWithImage = {
                ...chatData,
                ...(listingData.images?.length > 0 && {
                  listingImage: listingData.images[0]
                })
              };

              const chatRef = await addDoc(collection(db, 'chats'), chatDataWithImage);

              setSelectedChat({
                id: chatRef.id,
                participants: [user.uid, sellerId],
                createdAt: new Date(),
                listingId,
                listingName: listingData.title || 'Untitled Listing',
                listingPrice: listingData.price || 0,
                listingImage: listingData.images?.[0] || null,
                sellerId,
                archived: false,
                archivedAt: null,
                muted: false
              });
            } else {
              const existingChatDoc = existingChat.docs[0];
              const existingChatData = existingChatDoc.data();
              setSelectedChat({
                id: existingChatDoc.id,
                participants: existingChatData.participants,
                createdAt: existingChatData.createdAt,
                listingId: existingChatData.listingId,
                listingName: existingChatData.listingName,
                listingPrice: existingChatData.listingPrice,
                listingImage: existingChatData.listingImage || null,
                sellerId: existingChatData.sellerId,
                lastMessage: existingChatData.lastMessage,
                archived: existingChatData.archived || false,
                archivedAt: existingChatData.archivedAt || null,
                muted: existingChatData.muted || false
              });
            }
            
            router.replace('/messages');
          }
        }
      } catch (error) {
        console.error('Error initializing chat:', error);
      }
    };

    initializeChat();
    fetchChats();
  }, [user, mounted, router, searchParams]);

  useEffect(() => {
    if (selectedChat) {
      fetchMessages(selectedChat.id);
    }
  }, [selectedChat]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchChats = async () => {
    try {
      const chatsQuery = query(
        collection(db, 'chats'),
        where('participants', 'array-contains', user?.uid)
      );

      const unsubscribe = onSnapshot(chatsQuery, (snapshot) => {
        const chatsData = snapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            participants: data.participants,
            lastMessage: data.lastMessage,
            createdAt: data.createdAt,
            listingId: data.listingId,
            listingName: data.listingName,
            listingPrice: data.listingPrice,
            listingImage: data.listingImage,
            sellerId: data.sellerId
          } as Chat;
        });
        
        const sortedChats = chatsData.sort((a, b) => {
          const dateA = a.createdAt?.toDate?.() || new Date(0);
          const dateB = b.createdAt?.toDate?.() || new Date(0);
          return dateB.getTime() - dateA.getTime();
        });
        
        setChats(sortedChats);
        setLoading(false);
      });

      return () => unsubscribe();
    } catch (error) {
      console.error('Error fetching chats:', error);
      setLoading(false);
    }
  };

  const fetchMessages = async (chatId: string) => {
    try {
      const messagesQuery = query(
        collection(db, 'chats', chatId, 'messages'),
        orderBy('timestamp', 'asc')
      );

      const unsubscribe = onSnapshot(messagesQuery, (snapshot) => {
        const messagesData = snapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            text: data.text,
            senderId: data.senderId,
            senderName: data.senderName,
            timestamp: data.timestamp,
            imageUrl: data.imageUrl,
            price: data.price,
            location: data.location
          } as Message;
        });
        setMessages(messagesData);
      });

      return () => unsubscribe();
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedChat || !newMessage.trim()) return;

    try {
      await addDoc(collection(db, 'chats', selectedChat.id, 'messages'), {
        text: newMessage.trim(),
        senderId: user?.uid,
        senderName: user?.displayName || 'Anonymous',
        timestamp: serverTimestamp()
      });

      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleSendPrice = async (price: number) => {
    if (!selectedChat) return;

    try {
      await addDoc(collection(db, 'chats', selectedChat.id, 'messages'), {
        text: `Price: MWK ${price.toLocaleString()}`,
        senderId: user?.uid,
        senderName: user?.displayName || 'Anonymous',
        timestamp: serverTimestamp(),
        price
      });
    } catch (error) {
      console.error('Error sending price:', error);
    }
  };

  const handleSendLocation = async (location: string) => {
    if (!selectedChat) return;

    try {
      await addDoc(collection(db, 'chats', selectedChat.id, 'messages'), {
        text: `Meeting at: ${location}`,
        senderId: user?.uid,
        senderName: user?.displayName || 'Anonymous',
        timestamp: serverTimestamp(),
        location
      });
    } catch (error) {
      console.error('Error sending location:', error);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedChat) return;

    try {
      setUploading(true);
      const storageRef = ref(storage, `messages/${selectedChat.id}/${Date.now()}_${file.name}`);
      const snapshot = await uploadBytes(storageRef, file);
      const imageUrl = await getDownloadURL(snapshot.ref);

      await addDoc(collection(db, 'chats', selectedChat.id, 'messages'), {
        text: '',
        imageUrl,
        senderId: user?.uid,
        senderName: user?.displayName || 'Anonymous',
        timestamp: serverTimestamp()
      });
    } catch (error) {
      console.error('Error uploading image:', error);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const formatMessageTime = (timestamp: any) => {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    
    if (isToday(date)) {
      return format(date, 'h:mm a');
    } else if (isYesterday(date)) {
      return 'Yesterday';
    } else {
      return format(date, 'MMM d');
    }
  };

  const formatChatTime = (timestamp: any) => {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    
    if (isToday(date)) {
      return format(date, 'h:mm a');
    } else if (isYesterday(date)) {
      return 'Yesterday';
    } else {
      return format(date, 'MMM d');
    }
  };

  // Helper function to format price in MWK
  const formatPrice = (price: number) => {
    return `MWK ${price.toLocaleString()}`;
  };

  // Add new functions for chat controls
  const handleDeleteChat = async (chat: Chat) => {
    setChatToDelete(chat);
    setShowDeleteConfirm(true);
  };

  const confirmDeleteChat = async () => {
    if (!chatToDelete) return;

    try {
      // Delete all messages in the chat
      const messagesQuery = query(collection(db, 'chats', chatToDelete.id, 'messages'));
      const messagesSnapshot = await getDocs(messagesQuery);
      
      const deletePromises = messagesSnapshot.docs.map(doc => 
        deleteDoc(doc.ref)
      );
      
      await Promise.all(deletePromises);
      
      // Delete the chat document
      await deleteDoc(doc(db, 'chats', chatToDelete.id));
      
      // Update local state
      setChats(prev => prev.filter(c => c.id !== chatToDelete.id));
      if (selectedChat?.id === chatToDelete.id) {
        setSelectedChat(null);
      }
      
      setShowDeleteConfirm(false);
      setChatToDelete(null);
    } catch (error) {
      console.error('Error deleting chat:', error);
    }
  };

  const handleArchiveChat = async (chat: Chat) => {
    try {
      await updateDoc(doc(db, 'chats', chat.id), {
        archived: true,
        archivedAt: serverTimestamp()
      });
      
      // Update local state
      setChats(prev => prev.filter(c => c.id !== chat.id));
      if (selectedChat?.id === chat.id) {
        setSelectedChat(null);
      }
    } catch (error) {
      console.error('Error archiving chat:', error);
    }
  };

  const handleReportChat = async (chat: Chat) => {
    // Implement report functionality
    console.log('Report chat:', chat);
  };

  const handleToggleNotifications = async (chat: Chat) => {
    try {
      await updateDoc(doc(db, 'chats', chat.id), {
        muted: !chat.muted
      });
      
      // Update local state
      setChats(prev => prev.map(c => 
        c.id === chat.id ? { ...c, muted: !c.muted } : c
      ));
    } catch (error) {
      console.error('Error toggling notifications:', error);
    }
  };

  const handleBlockUser = async (chat: Chat) => {
    // Implement block user functionality
    console.log('Block user:', chat);
  };

  const handleShareChat = async (chat: Chat) => {
    // Implement share functionality
    console.log('Share chat:', chat);
  };

  if (!mounted) {
    return null;
  }

  return (
    <ProtectedRoute>
      <div className="flex h-screen bg-[var(--background)]">
        {/* Chats List Sidebar - Hidden on mobile when chat is selected */}
        <div className={`w-full md:w-1/3 lg:w-1/4 bg-[var(--background)] shadow-lg flex flex-col transition-all duration-300 ${
          selectedChat ? 'hidden md:flex' : 'flex'
        }`}>
          {/* Header */}
          <div className="p-4 bg-[var(--background)]">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-[var(--foreground)]">Messages</h2>
              <button className="p-2 rounded-full hover:bg-[var(--accent)] transition-colors">
                <MoreVertical className="w-5 h-5 text-[var(--foreground)]" />
              </button>
            </div>
            <div className="relative">
              <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-[var(--foreground-muted)]" />
              <input
                type="text"
                placeholder="Search conversations..."
                className="w-full pl-10 pr-4 py-2 rounded-full border border-[var(--border)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent bg-[var(--background)] text-[var(--foreground)] placeholder-[var(--foreground-muted)]"
              />
            </div>
          </div>

          {/* Chats List */}
          <div className="flex-1 overflow-y-auto p-2 space-y-2">
            <AnimatePresence>
              {chats.map((chat) => (
                <motion.div
                  key={chat.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  onClick={() => setSelectedChat(chat)}
                  className={`p-3 rounded-xl cursor-pointer transition-all ${
                    selectedChat?.id === chat.id 
                      ? 'bg-[var(--primary)] text-white shadow-lg' 
                      : 'bg-[var(--background)] hover:bg-[var(--accent)] shadow-sm'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    {chat.listingImage ? (
                      <img 
                        src={chat.listingImage} 
                        alt={chat.listingName}
                        className="w-12 h-12 rounded-xl object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-xl bg-[var(--primary-light)] flex items-center justify-center">
                        <span className="text-lg font-semibold text-[var(--primary)]">
                          {chat.listingName?.[0]?.toUpperCase() || 'L'}
                        </span>
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start">
                        <h3 className={`font-medium truncate ${
                          selectedChat?.id === chat.id ? 'text-white' : 'text-[var(--foreground)]'
                        }`}>
                          {chat.listingName}
                        </h3>
                        {chat.lastMessage?.timestamp && (
                          <span className={`text-xs whitespace-nowrap ml-2 ${
                            selectedChat?.id === chat.id ? 'text-white/80' : 'text-[var(--foreground-muted)]'
                          }`}>
                            {formatChatTime(chat.lastMessage.timestamp)}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center justify-between">
                        <p className={`text-sm font-medium ${
                          selectedChat?.id === chat.id ? 'text-white/90' : 'text-[var(--primary)]'
                        }`}>
                          {formatPrice(chat.listingPrice)}
                        </p>
                        {chat.lastMessage && (
                          <p className={`text-sm truncate flex-1 ml-2 ${
                            selectedChat?.id === chat.id ? 'text-white/80' : 'text-[var(--foreground-muted)]'
                          }`}>
                            {chat.lastMessage.text}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>

        {/* Chat Area */}
        <div className={`flex-1 flex flex-col bg-[var(--background)] ${
          selectedChat ? 'flex' : 'hidden md:flex'
        }`}>
          {selectedChat ? (
            <>
              {/* Chat Header */}
              <div className="p-4 bg-[var(--background)] shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <button 
                      onClick={() => setSelectedChat(null)}
                      className="p-2 rounded-full hover:bg-[var(--accent)] transition-colors md:hidden"
                    >
                      <ChevronLeft className="w-5 h-5 text-[var(--foreground)]" />
                    </button>
                    {selectedChat.listingImage ? (
                      <img 
                        src={selectedChat.listingImage} 
                        alt={selectedChat.listingName}
                        className="w-10 h-10 rounded-xl object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-xl bg-[var(--primary-light)] flex items-center justify-center">
                        <span className="text-lg font-semibold text-[var(--primary)]">
                          {selectedChat.listingName?.[0]?.toUpperCase() || 'L'}
                        </span>
                      </div>
                    )}
                    <div>
                      <h3 className="font-semibold text-[var(--foreground)]">
                        {selectedChat.listingName}
                      </h3>
                      <p className="text-sm text-[var(--primary)]">
                        {formatPrice(selectedChat.listingPrice)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <ChatControls
                      chat={selectedChat}
                      onClose={() => setSelectedChat(null)}
                      onDelete={() => handleDeleteChat(selectedChat)}
                      onArchive={() => handleArchiveChat(selectedChat)}
                      onReport={() => handleReportChat(selectedChat)}
                      onToggleNotifications={() => handleToggleNotifications(selectedChat)}
                      onBlock={() => handleBlockUser(selectedChat)}
                      onShare={() => handleShareChat(selectedChat)}
                    />
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.length === 0 && (
                  <div className="flex flex-col items-center justify-center h-full space-y-4">
                    <div className="text-center">
                      <h3 className="text-lg font-semibold text-[var(--foreground)] mb-2">
                        Start the conversation
                      </h3>
                      <p className="text-[var(--foreground-muted)] mb-4">
                        Choose a suggestion or type your own message
                      </p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full max-w-2xl px-4">
                      {MESSAGE_SUGGESTIONS.map((suggestion, index) => (
                        <button
                          key={index}
                          onClick={() => {
                            setNewMessage(suggestion);
                            setShowSuggestions(false);
                          }}
                          className="p-3 text-left rounded-xl bg-[var(--background)] hover:bg-[var(--accent)] transition-colors text-sm text-[var(--foreground)] shadow-sm"
                        >
                          {suggestion}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {messages.map((message, index) => {
                  const isSameSender = index > 0 && messages[index - 1].senderId === message.senderId;
                  const showTimestamp = index === messages.length - 1 || 
                    messages[index + 1].senderId !== message.senderId;

                  return (
                    <div
                      key={message.id}
                      className={`flex ${message.senderId === user?.uid ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-[85%] sm:max-w-[70%] ${!isSameSender ? 'mt-4' : ''}`}>
                        {!isSameSender && message.senderId !== user?.uid && (
                          <div className="text-xs text-[var(--message-sender)] mb-1">
                            {message.senderName}
                          </div>
                        )}
                        <div
                          className={`rounded-2xl p-3 shadow-sm ${
                            message.senderId === user?.uid
                              ? 'bg-[var(--primary)] text-white'
                              : 'bg-[var(--message-bg)] text-[var(--message-text)]'
                          }`}
                        >
                          {message.imageUrl && (
                            <img 
                              src={message.imageUrl} 
                              alt="Message attachment"
                              className="max-w-full h-auto rounded-lg mb-2"
                            />
                          )}
                          {message.text && (
                            <p className={`text-sm ${message.senderId === user?.uid ? 'text-white' : 'text-[var(--message-text)]'}`}>
                              {message.text}
                            </p>
                          )}
                          {showTimestamp && (
                            <div className={`text-xs mt-1 ${message.senderId === user?.uid ? 'text-white/80' : 'text-[var(--message-time)]'}`}>
                              {message.timestamp && formatMessageTime(message.timestamp)}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input with Suggestions */}
              <div className="p-4 bg-[var(--background)] shadow-lg">
                <form onSubmit={handleSendMessage} className="flex flex-col space-y-2">
                  {/* Suggestions Toggle */}
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={() => setShowSuggestions(!showSuggestions)}
                      className="text-sm text-[var(--primary)] hover:text-[var(--primary)]/80 transition-colors"
                    >
                      {showSuggestions ? 'Hide suggestions' : 'Show suggestions'}
                    </button>
                  </div>

                  {/* Suggestions Panel */}
                  {showSuggestions && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 p-2 bg-[var(--background)] rounded-xl">
                      {MESSAGE_SUGGESTIONS.map((suggestion, index) => (
                        <button
                          key={index}
                          type="button"
                          onClick={() => {
                            setNewMessage(suggestion);
                            setShowSuggestions(false);
                          }}
                          className="p-2 text-left rounded-lg bg-[var(--background)] hover:bg-[var(--accent)] transition-colors text-sm text-[var(--foreground)] shadow-sm"
                        >
                          {suggestion}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Input Area */}
                  <div className="flex items-center space-x-2">
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleImageUpload}
                      accept="image/*"
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploading}
                      className="p-3 rounded-full hover:bg-[var(--accent)] transition-colors disabled:opacity-50"
                    >
                      {uploading ? (
                        <div className="w-5 h-5 border-2 border-[var(--primary)] border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                        <Paperclip className="w-5 h-5 text-[var(--primary)]" />
                      )}
                    </button>
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Type a message..."
                      className="flex-1 p-3 rounded-full border border-[var(--border)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent bg-[var(--background)] text-[var(--foreground)] placeholder-[var(--foreground-muted)]"
                    />
                    <div className="hidden sm:flex space-x-2">
                      <button
                        type="button"
                        className="p-3 rounded-full hover:bg-[var(--accent)] transition-colors"
                      >
                        <Smile className="w-5 h-5 text-[var(--primary)]" />
                      </button>
                      <button
                        type="button"
                        className="p-3 rounded-full hover:bg-[var(--accent)] transition-colors"
                      >
                        <Mic className="w-5 h-5 text-[var(--primary)]" />
                      </button>
                    </div>
                    <button
                      type="submit"
                      disabled={!newMessage.trim()}
                      className="p-3 rounded-full bg-[var(--primary)] text-white hover:bg-[var(--primary)]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Send className="w-5 h-5" />
                    </button>
                  </div>
                </form>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center p-8 bg-[var(--background)] rounded-2xl shadow-lg">
                <div className="w-16 h-16 rounded-full bg-[var(--primary-light)] flex items-center justify-center mx-auto mb-4">
                  <MessageSquare className="w-8 h-8 text-[var(--primary)]" />
                </div>
                <h3 className="text-xl font-semibold text-[var(--foreground)] mb-2">Your Messages</h3>
                <p className="text-[var(--foreground-muted)] mb-4">Select a conversation to start messaging</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && chatToDelete && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-sm w-full mx-4">
            <div className="flex items-center space-x-3 mb-4">
              <AlertTriangle className="w-6 h-6 text-red-500" />
              <h3 className="text-lg font-semibold text-[var(--foreground)]">
                Delete Chat
              </h3>
            </div>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this chat? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setChatToDelete(null);
                }}
                className="px-4 py-2 rounded-lg text-[var(--foreground)] hover:bg-[var(--accent)] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteChat}
                className="px-4 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </ProtectedRoute>
  );
}