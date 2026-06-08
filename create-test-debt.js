const mongoose = require('mongoose');
require('dotenv').config({ path: './server/.env' });

// Import models
const Debt = require('./server/models/Debt');
const User = require('./server/models/User');
const Group = require('./server/models/Group');

async function createTestDebt() {
  try {
    console.log('🔗 Connecting to database...');
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/splitesae');
    console.log('✅ Connected to database');

    // Find existing users and groups
    const users = await User.find().limit(2);
    const groups = await Group.find().limit(1);

    if (users.length < 2) {
      console.log('❌ Need at least 2 users to create a debt');
      return;
    }

    if (groups.length < 1) {
      console.log('❌ Need at least 1 group to create a debt');
      return;
    }

    console.log('👥 Found users:', users.map(u => ({ id: u._id, name: u.name })));
    console.log('🏠 Found groups:', groups.map(g => ({ id: g._id, name: g.name })));

    // Create test debt
    const testDebt = new Debt({
      groupId: groups[0]._id,
      creditorId: users[0]._id, // Person who is owed money
      debtorId: users[1]._id,   // Person who owes money
      amount: 50.00,
      description: 'Test debt for debugging',
      currency: 'SAR',
      status: 'active',
      createdBy: users[0]._id
    });

    const savedDebt = await testDebt.save();
    console.log('✅ Test debt created:', {
      id: savedDebt._id,
      amount: savedDebt.amount,
      description: savedDebt.description,
      status: savedDebt.status
    });

    // Verify debt was created by fetching it
    const debts = await Debt.find({ groupId: groups[0]._id })
      .populate('creditorId', 'name')
      .populate('debtorId', 'name')
      .populate('groupId', 'name');

    console.log('📊 All debts in group:', debts.map(d => ({
      id: d._id,
      from: d.debtorId.name,
      to: d.creditorId.name,
      amount: d.amount,
      description: d.description,
      status: d.status,
      group: d.groupId.name
    })));

  } catch (error) {
    console.error('❌ Error creating test debt:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from database');
  }
}

createTestDebt();