const mongoose = require('mongoose');
const { Schema } = mongoose;

/**
 * GroupMember Schema - Embedded schema for group members
 */
const GroupMemberSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  role: {
    type: String,
    enum: ['admin', 'member'],
    default: 'member'
  },
  joinedAt: {
    type: Date,
    default: Date.now
  },
  addedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, { _id: false });

/**
 * Group Schema
 */
const GroupSchema = new Schema({
  name: {
    type: String,
    required: [true, 'Group name is required'],
    trim: true,
    maxlength: [100, 'Group name cannot exceed 100 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  avatar: {
    type: String,
    default: null
  },
  currency: {
    type: String,
    default: 'SAR',
    enum: ['USD', 'EUR', 'SAR', 'AED', 'EGP','TRY']
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  members: [GroupMemberSchema],
  settings: {
    allowMemberInvite: {
      type: Boolean,
      default: true
    },
    requireApproval: {
      type: Boolean,
      default: false
    },
    allowMemberAddExpense: {
      type: Boolean,
      default: true
    },
    allowMemberEditExpense: {
      type: Boolean,
      default: false
    }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  totalExpenses: {
    type: Number,
    default: 0
  },
  totalMembers: {
    type: Number,
    default: 1
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

/**
 * Indexes for better performance
 */
GroupSchema.index({ createdBy: 1 });
GroupSchema.index({ 'members.userId': 1 });
GroupSchema.index({ isActive: 1 });
GroupSchema.index({ createdAt: -1 });

/**
 * Virtual for active members count
 */
GroupSchema.virtual('activeMembersCount').get(function() {
  return (this.members || []).filter(member => member.isActive).length;
});

/**
 * Virtual for admin members
 */
GroupSchema.virtual('admins').get(function() {
  return (this.members || []).filter(member => member.role === 'admin' && member.isActive);
});

/**
 * Instance Methods
 */

/**
 * Check if user is member of the group
 */
GroupSchema.methods.isMember = function(userId) {
  return this.members.some(member => 
    member.userId.toString() === userId.toString() && member.isActive
  );
};

/**
 * Check if user is admin of the group
 */
GroupSchema.methods.isAdmin = function(userId) {
  console.log('🔍 [DEBUG] isAdmin check started');
  console.log('🔍 [DEBUG] Input userId:', userId);
  console.log('🔍 [DEBUG] Input userId type:', typeof userId);
  console.log('🔍 [DEBUG] Total members:', this.members.length);
  
  const result = this.members.some((member, index) => {
    // Handle both populated and non-populated userId
    let memberUserId;
    if (typeof member.userId === 'object' && member.userId._id) {
      // If populated, extract the _id
      memberUserId = member.userId._id.toString();
    } else {
      // If not populated, use directly
      memberUserId = member.userId.toString();
    }
    
    const inputUserIdStr = userId.toString();
    const roleMatch = member.role === 'admin';
    const activeMatch = member.isActive;
    const idMatch = memberUserId === inputUserIdStr;
    
    console.log(`🔍 [DEBUG] Member ${index + 1}:`);
    console.log(`  - userId: ${member.userId} (${typeof member.userId})`);
    console.log(`  - extracted userId: ${memberUserId}`);
    console.log(`  - input userId: ${inputUserIdStr}`);
    console.log(`  - role: ${member.role}`);
    console.log(`  - isActive: ${member.isActive}`);
    console.log(`  - ID Match: ${idMatch} (${memberUserId} === ${inputUserIdStr})`);
    console.log(`  - Role Match: ${roleMatch}`);
    console.log(`  - Active Match: ${activeMatch}`);
    console.log(`  - Overall Match: ${idMatch && roleMatch && activeMatch}`);
    
    return idMatch && roleMatch && activeMatch;
  });
  
  console.log('🔍 [DEBUG] Final isAdmin result:', result);
  return result;
};

/**
 * Add member to group
 */
GroupSchema.methods.addMember = function(userId, addedBy, role = 'member') {
  // Check if user is already a member
  const existingMember = this.members.find(member => 
    member.userId.toString() === userId.toString()
  );
  
  if (existingMember) {
    if (existingMember.isActive) {
      throw new Error('User is already a member of this group');
    } else {
      // Reactivate the member
      existingMember.isActive = true;
      existingMember.joinedAt = new Date();
      existingMember.addedBy = addedBy;
      existingMember.role = role;
    }
  } else {
    // Add new member
    this.members.push({
      userId,
      role,
      addedBy,
      joinedAt: new Date(),
      isActive: true
    });
  }
  
  this.totalMembers = this.activeMembersCount;
  return this.save();
};

/**
 * Remove member from group
 */
GroupSchema.methods.removeMember = function(userId) {
  const member = this.members.find(member => 
    member.userId.toString() === userId.toString() && member.isActive
  );
  
  if (!member) {
    throw new Error('User is not a member of this group');
  }
  
  // Don't allow removing the last admin
  if (member.role === 'admin' && this.admins.length === 1) {
    throw new Error('Cannot remove the last admin from the group');
  }
  
  member.isActive = false;
  this.totalMembers = this.activeMembersCount;
  return this.save();
};

/**
 * Update member role
 */
GroupSchema.methods.updateMemberRole = function(userId, newRole) {
  const member = this.members.find(member => 
    member.userId.toString() === userId.toString() && member.isActive
  );
  
  if (!member) {
    throw new Error('User is not a member of this group');
  }
  
  // Don't allow removing the last admin
  if (member.role === 'admin' && newRole === 'member' && this.admins.length === 1) {
    throw new Error('Cannot demote the last admin');
  }
  
  member.role = newRole;
  return this.save();
};

/**
 * Get member info
 */
GroupSchema.methods.getMember = function(userId) {
  return this.members.find(member => 
    member.userId.toString() === userId.toString() && member.isActive
  );
};

/**
 * Static Methods
 */

/**
 * Find groups by user ID
 */
GroupSchema.statics.findByUserId = function(userId) {
  return this.find({
    'members.userId': userId,
    'members.isActive': true,
    isActive: true
  }).populate('members.userId', 'name email avatar')
    .populate('createdBy', 'name email avatar')
    .sort({ updatedAt: -1 });
};

/**
 * Find group with member check
 */
GroupSchema.statics.findByIdWithMemberCheck = function(groupId, userId) {
  return this.findOne({
    _id: groupId,
    'members.userId': userId,
    'members.isActive': true,
    isActive: true
  }).populate('members.userId', 'name email avatar')
    .populate('createdBy', 'name email avatar');
};

/**
 * Pre-save middleware
 */
GroupSchema.pre('save', function(next) {
  // Update totalMembers count
  this.totalMembers = (this.members || []).filter(member => member.isActive).length;
  next();
});

/**
 * Pre-remove middleware
 */
GroupSchema.pre('remove', function(next) {
  // Here you can add cleanup logic like removing related expenses, etc.
  next();
});

module.exports = mongoose.model('Group', GroupSchema);