const mongoose = require('mongoose');
const Debt = require('../models/Debt');
const Group = require('../models/Group');
require('dotenv').config({ path: '../config/.env' });

/**
 * سكريبت لتحديث البيانات القديمة في قاعدة البيانات
 * يضيف حقل العملة للديون التي لا تحتوي عليه
 */
async function updateOldDebts() {
  try {
    // الاتصال بقاعدة البيانات
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/splitease');
    console.log('✅ Connected to database');

    // البحث عن الديون التي لا تحتوي على حقل العملة أو العملة فارغة
    const debtsWithoutCurrency = await Debt.find({
      $or: [
        { currency: { $exists: false } },
        { currency: null },
        { currency: '' }
      ]
    }).populate('groupId', 'currency');

    console.log(`🔍 Found ${debtsWithoutCurrency.length} debts without currency`);

    if (debtsWithoutCurrency.length === 0) {
      console.log('✅ All debts already have currency information');
      return;
    }

    // تحديث كل دين
    let updatedCount = 0;
    for (const debt of debtsWithoutCurrency) {
      try {
        // استخدام عملة المجموعة إذا كانت متوفرة، وإلا استخدام SAR كافتراضي
        const currency = debt.groupId?.currency || 'SAR';
        
        await Debt.findByIdAndUpdate(debt._id, {
          currency: currency
        });
        
        updatedCount++;
        console.log(`✅ Updated debt ${debt._id} with currency: ${currency}`);
      } catch (error) {
        console.error(`❌ Error updating debt ${debt._id}:`, error.message);
      }
    }

    console.log(`🎉 Successfully updated ${updatedCount} debts`);
    
  } catch (error) {
    console.error('❌ Error updating old debts:', error);
  } finally {
    // إغلاق الاتصال بقاعدة البيانات
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
  }
}

// تشغيل السكريبت
if (require.main === module) {
  updateOldDebts();
}

module.exports = updateOldDebts;