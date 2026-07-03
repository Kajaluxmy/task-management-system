import React, { useState, useEffect, useRef, useContext } from "react";
import { LuBell } from "react-icons/lu";
import axiosInstance from "../utils/axiosInstance";
import { API_PATHS } from "../utils/apiPaths";
import moment from "moment";
import { useNavigate } from "react-router-dom";
import { UserContext } from "../context/userContext";  

const NotificationBell = () => {
    const { user } = useContext(UserContext);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  const getNotifications = async () => {
    try {
      const response = await axiosInstance.get(API_PATHS.NOTIFICATIONS.GET_ALL);
      setNotifications(response.data.notifications || []);
      setUnreadCount(response.data.unreadCount || 0);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  };

  const handleMarkAsRead = async (notification) => {
    try {
      if (!notification.isRead) {
        await axiosInstance.put(
          API_PATHS.NOTIFICATIONS.MARK_AS_READ(notification._id),
        );
        getNotifications();
      }

      setIsOpen(false);

         if (notification.relatedTask) {
        if (user?.role === "admin") {
          navigate("/admin/create-task", {
            state: { taskId: notification.relatedTask },
          });
        } else {
          navigate(`/user/task-details/${notification.relatedTask}`);
        }
      }
    } catch (error) {
      console.error("Error marking as read:", error);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await axiosInstance.put(API_PATHS.NOTIFICATIONS.MARK_ALL_READ);
      getNotifications();
    } catch (error) {
      console.error("Error marking all as read:", error);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    getNotifications();
    const interval = setInterval(getNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-full hover:bg-gray-100 cursor-pointer"
      >
        <LuBell className="text-xl text-gray-600" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-medium rounded-full w-4 h-4 flex items-center justify-center">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
            <h3 className="text-sm font-medium">Notifications</h3>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="text-xs text-primary"
              >
                Mark all as read
              </button>
            )}
          </div>

          {notifications.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-6">
              No notifications
            </p>
          ) : (
            notifications.map((notification) => (
              <div
                key={notification._id}
                onClick={() => handleMarkAsRead(notification)}
                className={`px-4 py-3 border-b border-gray-50 cursor-pointer hover:bg-gray-50 ${
                  !notification.isRead ? "bg-blue-50/50" : ""
                }`}
              >
                <div className="flex items-start gap-2">
                  {!notification.isRead && (
                    <span className="w-2 h-2 bg-blue-500 rounded-full mt-1.5 flex-shrink-0" />
                  )}
                  <div className="flex-1">
                    <p className="text-xs font-medium text-black">
                      {notification.title}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {notification.message}
                    </p>
                    <p className="text-[10px] text-gray-400 mt-1">
                      {moment(notification.createdAt).fromNow()}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
