const mongoose = require("mongoose");
const crypto = require("crypto");

// ===================================
// 📨 INVITATION SCHEMA
// ===================================

const InvitationSchema = new mongoose.Schema(
  {
    groupId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Group",
      required: [true, "Grup kimliği gereklidir"],
      index: true,
    },
    invitedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Davet eden kimliği gereklidir"],
    },
    invitedUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    invitedEmail: {
      type: String,
      required: [true, "Davet edilen e-posta gereklidir"],
      lowercase: true,
      trim: true,
      index: true,
    },
    status: {
      type: String,
      enum: ["pending", "accepted", "rejected", "expired"],
      default: "pending",
      index: true,
    },
    role: {
      type: String,
      enum: ["admin", "member"],
      default: "member",
    },
    message: {
      type: String,
      maxlength: [500, "Message cannot exceed 500 characters"],
      trim: true,
    },
    token: {
      type: String,
      unique: true,
      index: true,
    },
    expiresAt: {
      type: Date,
      default: () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 أيام
      index: true,
    },
    respondedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// ===================================
// 📊 INDEXES FOR PERFORMANCE
// ===================================

InvitationSchema.index({ groupId: 1, invitedEmail: 1 });
InvitationSchema.index({ invitedBy: 1, status: 1 });
InvitationSchema.index({ status: 1, expiresAt: 1 });

// ===================================
// 📝 INSTANCE METHODS
// ===================================

// تحقق من انتهاء الدعوة
InvitationSchema.methods.isExpired = function () {
  return this.expiresAt < new Date();
};

// تحقق من صلاحية الدعوة
InvitationSchema.methods.isValid = function () {
  return this.status === "pending" && !this.isExpired();
};

// قبول الدعوة
InvitationSchema.methods.accept = async function () {
  if (this.status !== "pending") {
    throw new Error("Invitation is no longer pending");
  }

  if (this.isExpired()) {
    this.status = "expired";
    await this.save();
    throw new Error("Invitation has expired");
  }

  this.status = "accepted";
  this.respondedAt = new Date();
  return await this.save();
};

// رفض الدعوة
InvitationSchema.methods.reject = async function () {
  if (this.status !== "pending") {
    throw new Error("Invitation is no longer pending");
  }

  if (this.isExpired()) {
    this.status = "expired";
    await this.save();
    throw new Error("Invitation has expired");
  }

  this.status = "rejected";
  this.respondedAt = new Date();
  return await this.save();
};

// التحقق من انتهاء الدعوة وتحديث الحالة
InvitationSchema.methods.checkExpiration = async function () {
  if (this.status === "pending" && this.isExpired()) {
    this.status = "expired";
    return await this.save();
  }
  return this;
};

// ===================================
// 🔍 STATIC METHODS
// ===================================

// جلب الدعوات المعلقة للمستخدم
InvitationSchema.statics.findPendingForUser = function (email) {
  return this.find({
    invitedEmail: email.toLowerCase(),
    status: "pending",
    expiresAt: { $gt: new Date() },
  })
    .populate("groupId", "name description")
    .populate("invitedBy", "name email avatar")
    .sort({ createdAt: -1 });
};

// جلب الدعوات لمجموعة
InvitationSchema.statics.findByGroup = function (groupId, status = null) {
  const query = { groupId };
  if (status) query.status = status;

  return this.find(query)
    .populate("invitedBy", "name email avatar")
    .populate("invitedUser", "name email avatar")
    .sort({ createdAt: -1 });
};

// جلب الدعوة عن طريق التوكن
InvitationSchema.statics.findByToken = function (token) {
  return this.findOne({ token })
    .populate("groupId", "name description")
    .populate("invitedBy", "name email avatar");
};

// ===================================
// 🔄 MIDDLEWARE
// ===================================

// Generate unique token before saving
InvitationSchema.pre("save", function (next) {
  if (this.isNew && !this.token) {
    this.token = crypto.randomBytes(32).toString("hex");
  }
  next();
});

// Clean up expired invitations
InvitationSchema.statics.cleanupExpired = async function () {
  const result = await this.updateMany(
    {
      status: "pending",
      expiresAt: { $lt: new Date() },
    },
    {
      status: "expired",
    }
  );

  console.log(`🧹 Cleaned up ${result.modifiedCount} expired invitations`);
  return result;
};

// ===================================
// 📤 EXPORT MODEL
// ===================================

module.exports = mongoose.model("Invitation", InvitationSchema);
