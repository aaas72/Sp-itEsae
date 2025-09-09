const express = require("express");
const {
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
  getAllMembers
} = require("../controllers/groupController");
const authMiddleware = require("../middleware/auth");

const router = express.Router();

// All group routes require authentication
router.use(authMiddleware);

// Group management routes
router.post("/", createGroup); // POST /api/groups
router.get("/", getUserGroups); // GET /api/groups
router.get("/:groupId", getGroupDetails); // GET /api/groups/:groupId
router.put("/:groupId", updateGroup); // PUT /api/groups/:groupId
router.delete("/:groupId", deleteGroup); // DELETE /api/groups/:groupId

// Member management routes
router.get("/:groupId/members", getAllMembers); // GET /api/groups/:groupId/members
router.post("/:groupId/invite", inviteUser); // POST /api/groups/:groupId/invite
router.post("/:groupId/leave", leaveGroup); // POST /api/groups/:groupId/leave
router.delete("/:groupId/members/:userId", removeMember); // DELETE /api/groups/:groupId/members/:userId
router.put("/:groupId/members/:userId/role", updateMemberRole); // PUT /api/groups/:groupId/members/:userId/role

// Invitation management routes
router.get("/invitations/pending", getGroupInvitations); // GET /api/groups/invitations/pending
router.post("/invitations/:invitationId/accept", acceptInvitation); // POST /api/groups/invitations/:invitationId/accept
router.post("/invitations/:invitationId/reject", rejectInvitation); // POST /api/groups/invitations/:invitationId/reject
router.delete("/invitations/:invitationId", cancelInvitation); // DELETE /api/groups/invitations/:invitationId

module.exports = router;
