// backend/controllers/notificationController.js
const Notification = require("../models/Notification");

const getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .limit(20);

    const unreadCount = await Notification.countDocuments({
      user: req.user._id,
      isRead: false,
    });

    res.json({ notifications, unreadCount });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);

    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }

    if (notification.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    notification.isRead = true;
    await notification.save();

    res.json({ message: "Marked as read", notification });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const markAllAsRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { user: req.user._id, isRead: false },
      { isRead: true }
    );

    res.json({ message: "All notifications marked as read" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = {
  getNotifications,
  markAsRead,
  markAllAsRead,
};