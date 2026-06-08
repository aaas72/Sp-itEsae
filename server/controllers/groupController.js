const Group = require("../models/Group");
const Invitation = require("../models/Invitation");
const User = require("../models/User");
const {
  createSuccessResponse,
  createErrorResponse,
} = require("../utils/responseHelper");
const { generateToken } = require("../utils/tokenHelper");
const { logActivity } = require('./activityController');
const colors = require("colors");
const crypto = require("crypto");

/**
 * Create new group
 */
const createGroup = async (req, res) => {
  try {
    console.log("🏠 [GROUP]".cyan + " Creating group for user:", req.user.id);

    const { name, description, currency, settings } = req.body;

    // Create group with creator as admin
    const group = new Group({
      name,
      description,
      currency: currency || "USD",
      createdBy: req.user.id,
      members: [
        {
          userId: req.user.id,
          role: "admin",
          addedBy: req.user.id,
          joinedAt: new Date(),
          isActive: true,
        },
      ],
      settings: settings || {},
    });

    await group.save();

    // Populate creator info
    await group.populate("createdBy", "name email avatar");
    await group.populate("members.userId", "name email avatar");

    // تسجيل نشاط إنشاء المجموعة
    try {
      await logActivity({
        groupId: group._id,
        type: 'group_created',
        performedBy: req.user.id,
        description: `"${group.name}" grubu oluşturuldu`,
        metadata: {
          groupName: group.name,
          currency: group.currency,
          membersCount: 1
        },
        isImportant: true
      });
    } catch (activityError) {
      console.error('⚠️ [ACTIVITY]'.yellow + ' Failed to log group creation activity:', activityError.message);
    }

    console.log(
      "✅ [GROUP]".green + " Group created successfully:",
      group.name
    );

    res
      .status(201)
      .json(createSuccessResponse(group, "Grup başarıyla oluşturuldu"));
  } catch (error) {
    console.error("💥 [ERROR]".red + " Create group error:", error.message);
    res
      .status(500)
      .json(
        createErrorResponse(
          "INTERNAL_ERROR",
          "Grup oluşturulamadı",
          error.message
        )
      );
  }
};

/**
 * Get user's groups
 */
const getUserGroups = async (req, res) => {
  try {
    console.log("🏠 [GROUP]".cyan + " Fetching groups for user:", req.user.id);

    const groups = await Group.findByUserId(req.user.id);

    console.log("✅ [GROUP]".green + ` Found ${groups.length} groups for user`);

    res
      .status(200)
      .json(createSuccessResponse(groups, "Gruplar başarıyla getirildi"));
  } catch (error) {
    console.error("💥 [ERROR]".red + " Get user groups error:", error.message);
    res
      .status(500)
      .json(
        createErrorResponse(
          "INTERNAL_ERROR",
          "Gruplar getirilemedi",
          error.message
        )
      );
  }
};

/**
 * Get group details
 */
const getGroupDetails = async (req, res) => {
  try {
    const { groupId } = req.params;
    console.log("🏠 [GROUP]".cyan + " Fetching group details:", groupId);

    const group = await Group.findByIdWithMemberCheck(groupId, req.user.id);

    if (!group) {
      console.log(
        "⚠️  [GROUP]".yellow + " Group not found or user not member:",
        groupId
      );
      return res
        .status(404)
        .json(
          createErrorResponse(
            "GROUP_NOT_FOUND",
            "Grup bulunamadı veya üye değilsiniz"
          )
        );
    }

    console.log("✅ [GROUP]".green + " Group details retrieved:", group.name);

    res
      .status(200)
      .json(
        createSuccessResponse(group, "Grup detayları başarıyla getirildi")
      );
  } catch (error) {
    console.error(
      "💥 [ERROR]".red + " Get group details error:",
      error.message
    );
    res
      .status(500)
      .json(
        createErrorResponse(
          "INTERNAL_ERROR",
          "Grup detayları getirilemedi",
          error.message
        )
      );
  }
};

/**
 * Update group settings
 */
const updateGroup = async (req, res) => {
  try {
    const { groupId } = req.params;
    const { name, description, currency, settings } = req.body;

    console.log("🏠 [GROUP]".cyan + " Updating group:", groupId);

    const group = await Group.findByIdWithMemberCheck(groupId, req.user.id);

    if (!group) {
      return res
        .status(404)
        .json(
          createErrorResponse(
            "GROUP_NOT_FOUND",
            "Grup bulunamadı veya üye değilsiniz"
          )
        );
    }

    // Check if user is admin
    if (!group.isAdmin(req.user.id)) {
      console.log(
        "⚠️  [GROUP]".yellow + " User not admin, cannot update group"
      );
      return res
        .status(403)
        .json(
          createErrorResponse(
            "INSUFFICIENT_PERMISSIONS",
            "Yalnızca yöneticiler grup ayarlarını güncelleyebilir"
          )
        );
    }

    // Update fields
    if (name) group.name = name;
    if (description !== undefined) group.description = description;
    if (currency) group.currency = currency;
    if (settings) {
      group.settings = { ...group.settings, ...settings };
    }

    await group.save();
    await group.populate("createdBy", "name email avatar");
    await group.populate("members.userId", "name email avatar");

    console.log(
      "✅ [GROUP]".green + " Group updated successfully:",
      group.name
    );

    res
      .status(200)
      .json(createSuccessResponse(group, "Grup başarıyla güncellendi"));
  } catch (error) {
    console.error("💥 [ERROR]".red + " Update group error:", error.message);
    res
      .status(500)
      .json(
        createErrorResponse(
          "INTERNAL_ERROR",
          "Grup güncellenemedi",
          error.message
        )
      );
  }
};

/**
 * Invite user to group
 */
const inviteUser = async (req, res) => {
  try {
    const { groupId } = req.params;
    const { email, role = "member", message } = req.body;

    console.log("📧 [INVITE]".cyan + " Inviting user to group:", email);

    const group = await Group.findByIdWithMemberCheck(groupId, req.user.id);

    if (!group) {
      return res
        .status(404)
        .json(
          createErrorResponse(
            "GROUP_NOT_FOUND",
            "Grup bulunamadı veya üye değilsiniz"
          )
        );
    }

    // Check permissions
    const canInvite =
      group.isAdmin(req.user.id) || group.settings.allowMemberInvite;
    if (!canInvite) {
      return res
        .status(403)
        .json(
          createErrorResponse(
            "INSUFFICIENT_PERMISSIONS",
            "Kullanıcı davet etme yetkiniz yok"
          )
        );
    }

    // Check if user already exists
    const invitedUser = await User.findOne({ email });

    // Check if user is already a member
    if (invitedUser && group.isMember(invitedUser._id)) {
      return res
        .status(409)
        .json(
          createErrorResponse(
            "USER_ALREADY_MEMBER",
            "Kullanıcı zaten bu grubun üyesi"
          )
        );
    }

    // Check for existing pending invitation
    const existingInvitation = await Invitation.findOne({
      groupId,
      invitedEmail: email.toLowerCase(),
      status: "pending",
    });

    if (existingInvitation) {
      return res
        .status(409)
        .json(
          createErrorResponse(
            "INVITATION_EXISTS",
            "Bu e-postaya zaten davetiye gönderildi"
          )
        );
    }

    // Create invitation
    const invitation = new Invitation({
      groupId,
      invitedBy: req.user.id,
      invitedUser: invitedUser?._id,
      invitedEmail: email.toLowerCase(),
      role,
      message,
      token: crypto.randomBytes(32).toString("hex"),
    });

    await invitation.save();
    await invitation.populate("groupId", "name description avatar");
    await invitation.populate("invitedBy", "name email avatar");

    console.log("✅ [INVITE]".green + " Invitation created successfully");

    res
      .status(201)
      .json(createSuccessResponse(invitation, "Davetiye başarıyla gönderildi"));
  } catch (error) {
    console.error("💥 [ERROR]".red + " Invite user error:", error.message);
    res
      .status(500)
      .json(
        createErrorResponse(
          "INTERNAL_ERROR",
          "Davetiye gönderilemedi",
          error.message
        )
      );
  }
};

/**
 * Accept invitation
 */
const acceptInvitation = async (req, res) => {
  try {
    const { invitationId } = req.params;

    console.log(
      "✅ [INVITE]".cyan + " Accepting invitation with ID:",
      invitationId
    );

    // البحث بـ ID بدلاً من token
    const invitation = await Invitation.findById(invitationId);

    if (!invitation) {
      return res
        .status(404)
        .json(
          createErrorResponse(
            "INVITATION_NOT_FOUND",
            "Geçersiz veya süresi dolmuş davetiye"
          )
        );
    }

    // التحقق من أن الدعوة معلقة
    if (invitation.status !== "pending") {
      return res
        .status(400)
        .json(
          createErrorResponse(
            "INVITATION_NOT_PENDING",
            "Davetiye beklemede değil"
          )
        );
    }

    // التحقق من انتهاء الصلاحية
    if (invitation.isExpired()) {
      return res
        .status(410)
        .json(
          createErrorResponse("INVITATION_EXPIRED", "Davetiyenin süresi doldu")
        );
    }

    // التحقق من أن المستخدم هو المدعو
    if (
      invitation.invitedUser &&
      invitation.invitedUser.toString() !== req.user.id
    ) {
      return res
        .status(403)
        .json(
          createErrorResponse(
            "UNAUTHORIZED",
            "Bu davetiyeyi kabul etme yetkiniz yok"
          )
        );
    }

    // قبول الدعوة
    await invitation.accept(req.user.id);

    // إضافة المستخدم للمجموعة
    const group = await Group.findById(invitation.groupId);
    await group.addMember(req.user.id, invitation.invitedBy, invitation.role);

    // تسجيل نشاط انضمام العضو
    try {
      const user = await User.findById(req.user.id);
      await logActivity({
        groupId: group._id,
        type: 'member_joined',
        performedBy: req.user.id,
        description: `${user.name} gruba katıldı`,
        metadata: {
          memberName: user.name,
          memberEmail: user.email,
          role: invitation.role,
          invitedBy: invitation.invitedBy
        },
        isImportant: true
      });
    } catch (activityError) {
      console.error('⚠️ [ACTIVITY]'.yellow + ' Failed to log member join activity:', activityError.message);
    }

    console.log("✅ [INVITE]".green + " Invitation accepted successfully");

    res
      .status(200)
      .json(
        createSuccessResponse(
          { group, invitation },
          "Davetiye başarıyla kabul edildi"
        )
      );
  } catch (error) {
    console.error(
      "💥 [ERROR]".red + " Accept invitation error:",
      error.message
    );
    res
      .status(500)
      .json(
        createErrorResponse(
          "INTERNAL_ERROR",
          "Davetiye kabul edilemedi",
          error.message
        )
      );
  }
};

/**
 * Remove member from group
 */
const removeMember = async (req, res) => {
  try {
    const { groupId, userId } = req.params;
    const adminId = req.user.id; // افترض أن الـ admin معرف من التوكن

    console.log("👥 [MEMBER] Removing member from group:", userId);
    console.log("📦 Params:", { groupId, userId });

    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({
        success: false,
        error: { code: "GROUP_NOT_FOUND", message: "Grup bulunamadı" },
      });
    }

    console.log("👤 [MEMBERS] Current members:", group.members);

    // تحقق من أن الشخص الذي يحذف هو أدمن
    const admin = group.members.find(
      (m) =>
        m.userId._id.toString() === adminId && m.role === "admin" && m.isActive
    );

    if (!admin) {
      return res.status(403).json({
        success: false,
        error: { code: "FORBIDDEN", message: "Yalnızca yönetici üyeleri çıkarabilir" },
      });
    }

    // البحث عن العضو
    const memberIndex = group.members.findIndex(
      (m) => m.userId._id.toString() === userId
    );

    if (memberIndex === -1) {
      console.warn("⚠️ [MEMBER] Member not found in this group");
      return res.status(404).json({
        success: false,
        error: {
          code: "MEMBER_NOT_FOUND",
          message: "Bu grupta üye bulunamadı",
        },
      });
    }

    // الحصول على معلومات العضو المحذوف قبل الحذف
    const removedMember = group.members[memberIndex];
    const removedUser = await User.findById(removedMember.userId);
    
    group.members.splice(memberIndex, 1);
    await group.save();

    // تسجيل نشاط إزالة العضو
    try {
      await logActivity({
        groupId: group._id,
        type: 'member_removed',
        performedBy: adminId,
        targetUser: userId,
        description: `${removedUser?.name || 'Üye'} gruptan çıkarıldı`,
        metadata: {
          removedMemberName: removedUser?.name,
          removedMemberEmail: removedUser?.email,
          removedByAdmin: adminId,
          previousRole: removedMember.role
        },
        isImportant: true
      });
    } catch (activityError) {
      console.error('⚠️ [ACTIVITY]'.yellow + ' Failed to log member removal activity:', activityError.message);
    }

    console.log("✅ [MEMBER] Member removed successfully");
    return res.json({ success: true, message: "Üye başarıyla çıkarıldı" });
  } catch (err) {
    console.error("❌ [ERROR] removeMember:", err);
    return res.status(500).json({ success: false, error: err.message });
  }
};

/**
 * Update member role
 */
const updateMemberRole = async (req, res) => {
  try {
    const { groupId, userId } = req.params;
    const { role } = req.body;
    const adminId = req.user.id;

    console.log("🔄 [ROLE] Updating member role:", userId, "to", role);

    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({
        success: false,
        error: { code: "GROUP_NOT_FOUND", message: "Grup bulunamadı" },
      });
    }

    const admin = group.members.find(
      (m) =>
        m.userId._id.toString() === adminId && m.role === "admin" && m.isActive
    );

    if (!admin) {
      return res.status(403).json({
        success: false,
        error: { code: "FORBIDDEN", message: "Yalnızca yönetici rolleri güncelleyebilir" },
      });
    }

    const member = group.members.find(
      (m) => m.userId._id.toString() === userId
    );

    if (!member) {
      console.warn("⚠️ [ROLE] Member not found in this group");
      return res.status(404).json({
        success: false,
        error: {
          code: "MEMBER_NOT_FOUND",
          message: "Bu grupta üye bulunamadı",
        },
      });
    }

    member.role = role;
    await group.save();

    console.log("✅ [ROLE] Member role updated successfully");
    return res.json({
      success: true,
      message: "Üye rolü başarıyla güncellendi",
    });
  } catch (err) {
    console.error("❌ [ERROR] updateMemberRole:", err);
    return res.status(500).json({ success: false, error: err.message });
  }
};

/**
 * Delete group
 */
const deleteGroup = async (req, res) => {
  try {
    const { groupId } = req.params;

    console.log("🗑️ [GROUP]".cyan + " Deleting group:", groupId);
    console.log("👤 [USER]".yellow + " Request user _id:", req.user._id);
    console.log(
      "👤 [USER]".yellow + " Request user type:",
      typeof req.user._id
    );

    const group = await Group.findByIdWithMemberCheck(groupId, req.user._id);

    if (!group) {
      console.log("❌ [ERROR]".red + " Group not found or user not a member");
      return res
        .status(404)
        .json(
          createErrorResponse(
            "GROUP_NOT_FOUND",
            "Grup bulunamadı veya üye değilsiniz"
          )
        );
    }

    console.log(
      "👥 [MEMBERS]".blue + " Group members:",
      group.members.map((m) => ({
        userId: m.userId.toString(),
        role: m.role,
        isActive: m.isActive,
      }))
    );

    // Only admins can delete group
    const isUserAdmin = group.isAdmin(req.user._id);
    console.log("🔐 [ADMIN]".magenta + " Is user admin:", isUserAdmin);

    if (!isUserAdmin) {
      return res
        .status(403)
        .json(
          createErrorResponse(
            "INSUFFICIENT_PERMISSIONS",
            "Yalnızca yöneticiler grubu silebilir"
          )
        );
    }

    // Delete all pending invitations for this group
    await Invitation.deleteMany({ groupId });

    // Delete the group
    await Group.findByIdAndDelete(groupId);

    console.log("✅ [GROUP]".green + " Group deleted successfully");

    res
      .status(200)
      .json(createSuccessResponse(null, "Grup başarıyla silindi"));
  } catch (error) {
    console.error("💥 [ERROR]".red + " Delete group error:", error.message);
    res
      .status(500)
      .json(
        createErrorResponse(
          "INTERNAL_ERROR",
          "Grup silinemedi",
          error.message
        )
      );
  }
};

/**
 * Reject invitation
 */
const rejectInvitation = async (req, res) => {
  try {
    const { invitationId } = req.params;

    console.log("❌ [INVITE]".cyan + " Rejecting invitation:", invitationId);

    const invitation = await Invitation.findById(invitationId);

    if (!invitation) {
      return res
        .status(404)
        .json(
          createErrorResponse("INVITATION_NOT_FOUND", "Davetiye bulunamadı")
        );
    }

    if (invitation.isExpired()) {
      return res
        .status(410)
        .json(
          createErrorResponse("INVITATION_EXPIRED", "Davetiyenin süresi doldu")
        );
    }

    // Check if user has permission to reject (invited user or admin)
    const canReject =
      invitation.invitedUser?.toString() === req.user.id ||
      invitation.invitedEmail === req.user.email;

    if (!canReject) {
      return res
        .status(403)
        .json(
          createErrorResponse(
            "INSUFFICIENT_PERMISSIONS",
            "Yalnızca kendinize ait davetiyeleri reddedebilirsiniz"
          )
        );
    }

    await invitation.reject();

    console.log("✅ [INVITE]".green + " Invitation rejected successfully");

    res
      .status(200)
      .json(createSuccessResponse(null, "Davetiye başarıyla reddedildi"));
  } catch (error) {
    console.error(
      "💥 [ERROR]".red + " Reject invitation error:",
      error.message
    );
    res
      .status(500)
      .json(
        createErrorResponse(
          "INTERNAL_ERROR",
          "Davetiye reddedilemedi",
          error.message
        )
      );
  }
};

/**
 * Leave group
 */
const leaveGroup = async (req, res) => {
  try {
    const { groupId } = req.params;

    console.log("🚪 [GROUP]".cyan + " User leaving group:", groupId);

    const group = await Group.findByIdWithMemberCheck(groupId, req.user.id);

    if (!group) {
      return res
        .status(404)
        .json(
          createErrorResponse(
            "GROUP_NOT_FOUND",
            "Grup bulunamadı veya üye değilsiniz"
          )
        );
    }

    await group.removeMember(req.user.id);

    console.log("✅ [GROUP]".green + " User left group successfully");

    res
      .status(200)
      .json(createSuccessResponse(null, "Gruptan başarıyla ayrıldınız"));
  } catch (error) {
    console.error("💥 [ERROR]".red + " Leave group error:", error.message);

    if (error.message.includes("last admin")) {
      return res
        .status(400)
        .json(createErrorResponse("CANNOT_LEAVE_AS_LAST_ADMIN", error.message));
    }

    res
      .status(500)
      .json(
        createErrorResponse(
          "INTERNAL_ERROR",
          "Gruptan ayrılma başarısız oldu",
          error.message
        )
      );
  }
};

/**
 * Get user's pending invitations
 */
const getGroupInvitations = async (req, res) => {
  try {
    console.log(
      "📧 [INVITE]".cyan + " Fetching invitations for user:",
      req.user.email
    );

    const invitations = await Invitation.find({
      $or: [{ invitedUser: req.user.id }, { invitedEmail: req.user.email }],
      status: "pending",
    })
      .populate("groupId", "name description avatar")
      .populate("invitedBy", "name email avatar")
      .sort({ createdAt: -1 });

    console.log(
      "✅ [INVITE]".green + ` Found ${invitations.length} pending invitations`
    );

    res
      .status(200)
      .json(
        createSuccessResponse(invitations, "Davetiyeler başarıyla getirildi")
      );
  } catch (error) {
    console.error("💥 [ERROR]".red + " Get invitations error:", error.message);
    res
      .status(500)
      .json(
        createErrorResponse(
          "INTERNAL_ERROR",
          "Davetiyeler getirilemedi",
          error.message
        )
      );
  }
};
/**
 * Get all members of a group
 */
const getAllMembers = async (req, res) => {
  try {
    const { groupId } = req.params;

    console.log(
      "👥 [MEMBER]".cyan + " Fetching all members for group:",
      groupId
    );

    // التأكد من أن المستخدم عضو في المجموعة
    const group = await Group.findByIdWithMemberCheck(groupId, req.user.id);

    if (!group) {
      console.log(
        "⚠️ [MEMBER]".yellow + " Group not found or user not a member:",
        groupId
      );
      return res
        .status(404)
        .json(
          createErrorResponse(
            "GROUP_NOT_FOUND",
            "Grup bulunamadı veya üye değilsiniz"
          )
        );
    }

    // جلب جميع الأعضاء
    await group.populate("members.userId", "name email avatar");

    const members = group.members.map((m) => ({
      _id: m.userId._id,
      name: m.userId.name,
      email: m.userId.email,
      avatar: m.userId.avatar,
      role: m.role,
      joinedAt: m.joinedAt,
      isActive: m.isActive,
    }));

    console.log(
      "✅ [MEMBER]".green + ` Found ${members.length} members in group`
    );

    res
      .status(200)
      .json(
        createSuccessResponse(members, "Grup üyeleri başarıyla getirildi")
      );
  } catch (error) {
    console.error("💥 [ERROR]".red + " Get all members error:", error.message);
    res
      .status(500)
      .json(
        createErrorResponse(
          "INTERNAL_ERROR",
          "Grup üyeleri getirilemedi",
          error.message
        )
      );
  }
};

/**
 * Cancel invitation
 */
const cancelInvitation = async (req, res) => {
  try {
    const { invitationId } = req.params;

    console.log("🚫 [INVITE]".cyan + " Canceling invitation:", invitationId);

    const invitation = await Invitation.findById(invitationId);

    if (!invitation) {
      return res
        .status(404)
        .json(
          createErrorResponse("INVITATION_NOT_FOUND", "Davetiye bulunamadı")
        );
    }

    // Check if user has permission to cancel (inviter or admin)
    const group = await Group.findById(invitation.groupId);
    const canCancel =
      invitation.invitedBy.toString() === req.user.id ||
      (group && group.isAdmin(req.user.id));

    if (!canCancel) {
      return res
        .status(403)
        .json(
          createErrorResponse(
            "INSUFFICIENT_PERMISSIONS",
            "Yalnızca kendi gönderdiğiniz davetiyeleri veya grup yöneticisi olarak iptal edebilirsiniz"
          )
        );
    }

    await Invitation.findByIdAndDelete(invitationId);

    console.log("✅ [INVITE]".green + " Invitation canceled successfully");

    res
      .status(200)
      .json(createSuccessResponse(null, "Davetiye başarıyla iptal edildi"));
  } catch (error) {
    console.error(
      "💥 [ERROR]".red + " Cancel invitation error:",
      error.message
    );
    res
      .status(500)
      .json(
        createErrorResponse(
          "INTERNAL_ERROR",
          "Davetiye iptal edilemedi",
          error.message
        )
      );
  }
};

module.exports = {
  createGroup,
  getUserGroups,
  getGroupDetails,
  updateGroup,
  deleteGroup,
  inviteUser,
  acceptInvitation,
  rejectInvitation,
  removeMember,
  updateMemberRole,
  leaveGroup,
  getGroupInvitations,
  cancelInvitation,
  getAllMembers,
};
