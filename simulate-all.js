/**
 * 🏠 SplitEase - Tam Sistem Simülasyonu
 * 
 * Senaryo: 5 üniversite öğrencisi bir evde birlikte yaşıyor.
 * 4 grup oluşturuyorlar ve tüm sistem özelliklerini kullanıyorlar.
 * 
 * Öğrenciler:
 *   1. Ahmet Yılmaz (Ev sahibi / Admin)
 *   2. Elif Kaya
 *   3. Mehmet Demir
 *   4. Zeynep Aksoy
 *   5. Can Öztürk
 * 
 * Gruplar:
 *   1. 🏠 Ev Giderleri (Kira, fatura, temizlik) - 5 kişi
 *   2. 🍔 Yemek & Market (Ortak market alışverişi) - 5 kişi
 *   3. 🎮 Eğlence (Netflix, oyun, gezi) - 3 kişi (Ahmet, Elif, Can)
 *   4. 📚 Ders Malzemeleri (Kitap, fotokopi) - 4 kişi (Ahmet, Mehmet, Zeynep, Can)
 */

const axios = require('axios');
const path = require('path');

const BASE_URL = 'http://localhost:5000/api';
const SERVER_DIR = path.join(__dirname, 'server');

// ═══════════════════════════════════════
// 📋 KULLANICI VERİLERİ
// ═══════════════════════════════════════
const students = [
  { name: 'Ahmet Yılmaz', email: 'ahmet@test.com', password: 'Test1234!' },
  { name: 'Elif Kaya', email: 'elif@test.com', password: 'Test1234!' },
  { name: 'Mehmet Demir', email: 'mehmet@test.com', password: 'Test1234!' },
  { name: 'Zeynep Aksoy', email: 'zeynep@test.com', password: 'Test1234!' },
  { name: 'Can Öztürk', email: 'can@test.com', password: 'Test1234!' },
];

// Kayıtlı kullanıcı bilgileri
const users = {};    // { ahmet: { id, token, ... }, ... }
const groups = {};   // { ev: { id, name }, ... }
const debts = {};    // { debtId: ... }
const invitations = {}; // { invId: ... }

let stepCount = 0;

// ═══════════════════════════════════════
// 🔧 YARDIMCI FONKSİYONLAR
// ═══════════════════════════════════════
function step(title) {
  stepCount++;
  console.log(`\n${'═'.repeat(60)}`);
  console.log(`  📌 ADIM ${stepCount}: ${title}`);
  console.log(`${'═'.repeat(60)}`);
}

function success(msg) { console.log(`  ✅ ${msg}`); }
function info(msg) { console.log(`  ℹ️  ${msg}`); }
function warn(msg) { console.log(`  ⚠️  ${msg}`); }
function error(msg) { console.log(`  ❌ ${msg}`); }

function api(token) {
  return axios.create({
    baseURL: BASE_URL,
    headers: { Authorization: `Bearer ${token}` },
    validateStatus: () => true, // tüm durumları kabul et
  });
}

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// ═══════════════════════════════════════
// 🗑️  VERİTABANINI TEMİZLE
// ═══════════════════════════════════════
async function clearDatabase() {
  step('VERİTABANINI TEMİZLE');
  
  const mongoose = require(path.join(SERVER_DIR, 'node_modules', 'mongoose'));
  const dns = require('dns');
  dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);
  require(path.join(SERVER_DIR, 'node_modules', 'dotenv')).config({ path: path.join(SERVER_DIR, 'config', '.env') });
  
  info('MongoDB\'ye bağlanılıyor...');
  await mongoose.connect(process.env.MONGO_URI);
  success('MongoDB bağlantısı kuruldu');

  const collections = ['users', 'groups', 'debts', 'invitations', 'transactions', 'activities'];
  for (const col of collections) {
    try {
      await mongoose.connection.db.collection(col).deleteMany({});
      success(`${col} koleksiyonu temizlendi`);
    } catch (e) {
      warn(`${col} koleksiyonu zaten boş veya yok`);
    }
  }

  await mongoose.disconnect();
  success('Veritabanı tamamen temizlendi');
}

// ═══════════════════════════════════════
// 1️⃣  KAYIT (REGISTER)
// ═══════════════════════════════════════
async function registerUsers() {
  step('5 ÖĞRENCİ KAYDI');
  
  for (const s of students) {
    const res = await axios.post(`${BASE_URL}/auth/register`, {
      name: s.name,
      email: s.email,
      password: s.password,
      confirmPassword: s.password,
    });

    if (res.data.success) {
      const key = s.name.split(' ')[0].toLowerCase();
      users[key] = {
        id: res.data.data.user.id,
        name: s.name,
        email: s.email,
        token: res.data.data.tokens.accessToken,
        refreshToken: res.data.data.tokens.refreshToken,
      };
      success(`${s.name} kayıt oldu (ID: ${users[key].id})`);
    } else {
      error(`${s.name} kayıt olamadı: ${res.data.message}`);
    }
  }
}

// ═══════════════════════════════════════
// 2️⃣  GİRİŞ (LOGIN)
// ═══════════════════════════════════════
async function loginUsers() {
  step('GİRİŞ TESTI');

  // Ahmet ile giriş testi
  const res = await axios.post(`${BASE_URL}/auth/login`, {
    email: 'ahmet@test.com',
    password: 'Test1234!',
  });

  if (res.data.success) {
    users.ahmet.token = res.data.data.tokens.accessToken;
    users.ahmet.refreshToken = res.data.data.tokens.refreshToken;
    success(`Ahmet giriş yaptı`);
  }
}

// ═══════════════════════════════════════
// 3️⃣  PROFİL İŞLEMLERİ
// ═══════════════════════════════════════
async function profileOperations() {
  step('PROFİL İŞLEMLERİ');

  // Profil görüntüle
  const profile = await api(users.ahmet.token).get('/users/me');
  if (profile.data.success) {
    success(`Ahmet profili görüntülendi: ${profile.data.data.user.name}`);
  }

  // Profil güncelle
  const update = await api(users.elif.token).put('/users/profile', {
    name: 'Elif Kaya Yıldırım',
  });
  if (update.data.success) {
    success(`Elif profil adını güncelledi: ${update.data.data.user.name}`);
    users.elif.name = update.data.data.user.name;
  }

  // Tüm profilleri kontrol et
  for (const [key, u] of Object.entries(users)) {
    const p = await api(u.token).get('/users/me');
    if (p.data.success) {
      info(`${u.name} - Durum: Aktif ✔`);
    }
  }
}

// ═══════════════════════════════════════
// 4️⃣  GRUP OLUŞTURMA
// ═══════════════════════════════════════
async function createGroups() {
  step('4 GRUP OLUŞTURMA');

  const groupDefs = [
    { key: 'ev', name: 'Ev Giderleri', description: 'Kira, fatura, temizlik malzemeleri', currency: 'TRY' },
    { key: 'yemek', name: 'Yemek & Market', description: 'Ortak market ve yemek alışverişleri', currency: 'TRY' },
    { key: 'eglence', name: 'Eğlence', description: 'Netflix, oyun abonelikleri, geziler', currency: 'TRY' },
    { key: 'ders', name: 'Ders Malzemeleri', description: 'Kitap, fotokopi, kırtasiye', currency: 'TRY' },
  ];

  for (const g of groupDefs) {
    const res = await api(users.ahmet.token).post('/groups', {
      name: g.name,
      description: g.description,
      currency: g.currency,
    });

    if (res.data.success) {
      groups[g.key] = { id: res.data.data._id, name: g.name };
      success(`"${g.name}" grubu oluşturuldu (ID: ${groups[g.key].id})`);
    } else {
      error(`"${g.name}" oluşturulamadı: ${JSON.stringify(res.data)}`);
    }
  }
}

// ═══════════════════════════════════════
// 5️⃣  DAVET GÖNDERME
// ═══════════════════════════════════════
async function sendInvitations() {
  step('DAVET GÖNDERME');

  // Ev Giderleri → herkesi davet et
  const evInvites = ['elif', 'mehmet', 'zeynep', 'can'];
  for (const key of evInvites) {
    const res = await api(users.ahmet.token).post(`/groups/${groups.ev.id}/invite`, {
      email: users[key].email,
      role: 'member',
      message: 'Ev giderleri grubuna hoş geldiniz!',
    });
    if (res.data.success) {
      success(`Ahmet → ${users[key].name} davet etti (Ev Giderleri)`);
    }
  }

  // Yemek & Market → herkesi davet et
  for (const key of evInvites) {
    const res = await api(users.ahmet.token).post(`/groups/${groups.yemek.id}/invite`, {
      email: users[key].email,
    });
    if (res.data.success) {
      success(`Ahmet → ${users[key].name} davet etti (Yemek & Market)`);
    }
  }

  // Eğlence → sadece Elif ve Can
  for (const key of ['elif', 'can']) {
    const res = await api(users.ahmet.token).post(`/groups/${groups.eglence.id}/invite`, {
      email: users[key].email,
    });
    if (res.data.success) {
      success(`Ahmet → ${users[key].name} davet etti (Eğlence)`);
    }
  }

  // Ders Malzemeleri → Mehmet, Zeynep, Can
  for (const key of ['mehmet', 'zeynep', 'can']) {
    const res = await api(users.ahmet.token).post(`/groups/${groups.ders.id}/invite`, {
      email: users[key].email,
    });
    if (res.data.success) {
      success(`Ahmet → ${users[key].name} davet etti (Ders Malzemeleri)`);
    }
  }
}

// ═══════════════════════════════════════
// 6️⃣  BEKLEYen DAVETİYELERİ GÖRÜNTÜLE
// ═══════════════════════════════════════
async function viewPendingInvitations() {
  step('BEKLEYEN DAVETİYELERİ GÖRÜNTÜLE');

  for (const [key, u] of Object.entries(users)) {
    if (key === 'ahmet') continue;
    const res = await api(u.token).get('/groups/invitations/pending');
    if (res.data.success) {
      const count = res.data.data.length;
      success(`${u.name}: ${count} bekleyen davetiye var`);
      res.data.data.forEach(inv => {
        info(`  → ${inv.groupId?.name || 'Bilinmeyen Grup'} (Davet eden: ${inv.invitedBy?.name})`);
        invitations[inv._id] = inv;
      });
    }
  }
}

// ═══════════════════════════════════════
// 7️⃣  DAVETİYE KABUL / RED
// ═══════════════════════════════════════
async function handleInvitations() {
  step('DAVETİYE KABUL VE RED');

  // Herkes tüm davetiyelerini kabul etsin
  for (const [key, u] of Object.entries(users)) {
    if (key === 'ahmet') continue;
    
    const res = await api(u.token).get('/groups/invitations/pending');
    if (res.data.success) {
      for (const inv of res.data.data) {
        const accept = await api(u.token).post(`/groups/invitations/${inv._id}/accept`);
        if (accept.data.success) {
          success(`${u.name} → "${inv.groupId?.name}" davetiyesini KABUL ETTİ`);
        }
      }
    }
  }

  // Zeynep'i Eğlence grubuna davet et ve REDDETTİR
  info('Zeynep\'e reddedilecek bir davetiye gönderiliyor...');
  const invRes = await api(users.ahmet.token).post(`/groups/${groups.eglence.id}/invite`, {
    email: users.zeynep.email,
  });
  if (invRes.data.success) {
    const invId = invRes.data.data._id;
    const reject = await api(users.zeynep.token).post(`/groups/invitations/${invId}/reject`);
    if (reject.data.success) {
      success(`Zeynep → "Eğlence" davetiyesini REDDETTİ ❌`);
    }
  }
}

// ═══════════════════════════════════════
// 8️⃣  GRUPLARI GÖRÜNTÜLE
// ═══════════════════════════════════════
async function viewGroups() {
  step('GRUPLARI GÖRÜNTÜLE');

  const res = await api(users.ahmet.token).get('/groups');
  if (res.data.success) {
    success(`Ahmet'in ${res.data.data.length} grubu var:`);
    res.data.data.forEach(g => {
      info(`  📁 ${g.name} - ${g.members?.length || '?'} üye - ${g.currency}`);
    });
  }

  // Elif'in grupları
  const elifGroups = await api(users.elif.token).get('/groups');
  if (elifGroups.data.success) {
    success(`Elif'in ${elifGroups.data.data.length} grubu var`);
  }
}

// ═══════════════════════════════════════
// 9️⃣  GRUP DETAYLARI
// ═══════════════════════════════════════
async function viewGroupDetails() {
  step('GRUP DETAYLARI');

  for (const [key, g] of Object.entries(groups)) {
    const res = await api(users.ahmet.token).get(`/groups/${g.id}`);
    if (res.data.success) {
      const d = res.data.data;
      success(`"${d.name}" - ${d.members?.length} üye, Para birimi: ${d.currency}`);
      d.members?.forEach(m => {
        info(`  👤 ${m.userId?.name} (${m.role})`);
      });
    }
  }
}

// ═══════════════════════════════════════
// 🔟  GRUP GÜNCELLEME
// ═══════════════════════════════════════
async function updateGroup() {
  step('GRUP GÜNCELLEME');

  const res = await api(users.ahmet.token).put(`/groups/${groups.ev.id}`, {
    name: 'Ev Giderleri 2026',
    description: 'Kira, faturalar, temizlik ve bakım masrafları - 2026 yılı',
  });

  if (res.data.success) {
    success(`Grup güncellendi: "${res.data.data.name}"`);
    groups.ev.name = res.data.data.name;
  }
}

// ═══════════════════════════════════════
// 1️⃣1️⃣  ÜYE YÖNETİMİ
// ═══════════════════════════════════════
async function memberManagement() {
  step('ÜYE YÖNETİMİ');

  // Üyeleri listele
  const members = await api(users.ahmet.token).get(`/groups/${groups.ev.id}/members`);
  if (members.data.success) {
    success(`Ev Giderleri üyeleri (${members.data.data.length} kişi):`);
    members.data.data.forEach(m => {
      info(`  👤 ${m.name} - ${m.role} - ${m.isActive ? 'Aktif' : 'Pasif'}`);
    });
  }

  // Elif'i admin yap
  const roleUpdate = await api(users.ahmet.token).put(
    `/groups/${groups.ev.id}/members/${users.elif.id}/role`,
    { role: 'admin' }
  );
  if (roleUpdate.data.success) {
    success(`Elif "Ev Giderleri" grubunda admin yapıldı 👑`);
  }

  // Mehmet'i Eğlence grubuna davet et ve sonra çıkar (removeMember testi)
  const invMehmet = await api(users.ahmet.token).post(`/groups/${groups.eglence.id}/invite`, {
    email: users.mehmet.email,
  });
  if (invMehmet.data.success) {
    const invId = invMehmet.data.data._id;
    await api(users.mehmet.token).post(`/groups/invitations/${invId}/accept`);
    success('Mehmet Eğlence grubuna eklendi (çıkarılmak için)');

    const remove = await api(users.ahmet.token).delete(
      `/groups/${groups.eglence.id}/members/${users.mehmet.id}`
    );
    if (remove.data.success) {
      success('Mehmet Eğlence grubundan ÇIKARILDI ❌');
    }
  }
}

// ═══════════════════════════════════════
// 1️⃣2️⃣  İŞLEM OLUŞTURMA (TRANSACTION/EXPENSE)
// ═══════════════════════════════════════
async function createTransactions() {
  step('İŞLEMLER OLUŞTURMA (HARCAMALAR)');

  const transactions = [];

  // --- Ev Giderleri grubu ---
  // 1. Kira ödemesi - Ahmet ödedi
  const kira = await api(users.ahmet.token).post('/transactions/expense', {
    groupId: groups.ev.id,
    amount: 7500,
    description: 'Şubat ayı kira ödemesi',
    participants: [users.ahmet.id, users.elif.id, users.mehmet.id, users.zeynep.id, users.can.id],
    currency: 'TRY',
  });
  if (kira.data.success) {
    transactions.push(kira.data.data.transaction);
    success(`Kira: 7.500 TL (Ahmet ödedi, 5 kişiye bölündü = ${kira.data.data.splitAmount} TL/kişi)`);
  }

  // 2. Elektrik faturası - Elif ödedi
  const elektrik = await api(users.elif.token).post('/transactions/expense', {
    groupId: groups.ev.id,
    amount: 850,
    description: 'Şubat elektrik faturası',
    participants: [users.ahmet.id, users.elif.id, users.mehmet.id, users.zeynep.id, users.can.id],
    currency: 'TRY',
  });
  if (elektrik.data.success) {
    transactions.push(elektrik.data.data.transaction);
    success(`Elektrik: 850 TL (Elif ödedi, 5 kişiye bölündü = ${elektrik.data.data.splitAmount} TL/kişi)`);
  }

  // 3. İnternet faturası - Mehmet ödedi
  const internet = await api(users.mehmet.token).post('/transactions/expense', {
    groupId: groups.ev.id,
    amount: 450,
    description: 'Aylık internet faturası',
    participants: [users.ahmet.id, users.elif.id, users.mehmet.id, users.zeynep.id, users.can.id],
    currency: 'TRY',
  });
  if (internet.data.success) {
    transactions.push(internet.data.data.transaction);
    success(`İnternet: 450 TL (Mehmet ödedi, 5 kişiye bölündü = ${internet.data.data.splitAmount} TL/kişi)`);
  }

  // 4. Su faturası - Zeynep ödedi
  const su = await api(users.zeynep.token).post('/transactions/expense', {
    groupId: groups.ev.id,
    amount: 320,
    description: 'Şubat su faturası',
    participants: [users.ahmet.id, users.elif.id, users.mehmet.id, users.zeynep.id, users.can.id],
    currency: 'TRY',
  });
  if (su.data.success) {
    transactions.push(su.data.data.transaction);
    success(`Su: 320 TL (Zeynep ödedi, 5 kişiye bölündü = ${su.data.data.splitAmount} TL/kişi)`);
  }

  // --- Yemek & Market grubu ---
  // 5. Market alışverişi - Can ödedi
  const market1 = await api(users.can.token).post('/transactions/expense', {
    groupId: groups.yemek.id,
    amount: 1200,
    description: 'Haftalık market alışverişi (A101)',
    participants: [users.ahmet.id, users.elif.id, users.mehmet.id, users.zeynep.id, users.can.id],
    currency: 'TRY',
  });
  if (market1.data.success) {
    transactions.push(market1.data.data.transaction);
    success(`Market: 1.200 TL (Can ödedi, 5 kişiye bölündü = ${market1.data.data.splitAmount} TL/kişi)`);
  }

  // 6. Pizza sipariş - Ahmet ödedi (sadece 3 kişi)
  const pizza = await api(users.ahmet.token).post('/transactions/expense', {
    groupId: groups.yemek.id,
    amount: 450,
    description: 'Pizza gecesi siparişi',
    participants: [users.ahmet.id, users.elif.id, users.can.id],
    currency: 'TRY',
  });
  if (pizza.data.success) {
    transactions.push(pizza.data.data.transaction);
    success(`Pizza: 450 TL (Ahmet ödedi, 3 kişiye bölündü = ${pizza.data.data.splitAmount} TL/kişi)`);
  }

  // 7. Kahvaltı malzemeleri - Elif ödedi
  const kahvalti = await api(users.elif.token).post('/transactions/expense', {
    groupId: groups.yemek.id,
    amount: 380,
    description: 'Kahvaltı malzemeleri (peynir, zeytin, yumurta)',
    participants: [users.ahmet.id, users.elif.id, users.mehmet.id, users.zeynep.id, users.can.id],
    currency: 'TRY',
  });
  if (kahvalti.data.success) {
    transactions.push(kahvalti.data.data.transaction);
    success(`Kahvaltı: 380 TL (Elif ödedi, bölündü = ${kahvalti.data.data.splitAmount} TL/kişi)`);
  }

  // --- Eğlence grubu ---
  // 8. Netflix aboneliği - Ahmet ödedi
  const netflix = await api(users.ahmet.token).post('/transactions/expense', {
    groupId: groups.eglence.id,
    amount: 190,
    description: 'Netflix aylık abonelik',
    participants: [users.ahmet.id, users.elif.id, users.can.id],
    currency: 'TRY',
  });
  if (netflix.data.success) {
    transactions.push(netflix.data.data.transaction);
    success(`Netflix: 190 TL (Ahmet ödedi, 3 kişiye bölündü = ${netflix.data.data.splitAmount} TL/kişi)`);
  }

  // 9. Sinema bileti - Can ödedi
  const sinema = await api(users.can.token).post('/transactions/expense', {
    groupId: groups.eglence.id,
    amount: 270,
    description: 'Sinema bileti (3 kişi)',
    participants: [users.ahmet.id, users.elif.id, users.can.id],
    currency: 'TRY',
  });
  if (sinema.data.success) {
    transactions.push(sinema.data.data.transaction);
    success(`Sinema: 270 TL (Can ödedi, 3 kişiye bölündü = ${sinema.data.data.splitAmount} TL/kişi)`);
  }

  // --- Ders Malzemeleri grubu ---
  // 10. Fotokopi - Mehmet ödedi
  const fotokopi = await api(users.mehmet.token).post('/transactions/expense', {
    groupId: groups.ders.id,
    amount: 200,
    description: 'Dönem sonu ders notları fotokopisi',
    participants: [users.ahmet.id, users.mehmet.id, users.zeynep.id, users.can.id],
    currency: 'TRY',
  });
  if (fotokopi.data.success) {
    transactions.push(fotokopi.data.data.transaction);
    success(`Fotokopi: 200 TL (Mehmet ödedi, 4 kişiye bölündü = ${fotokopi.data.data.splitAmount} TL/kişi)`);
  }

  // 11. Ders kitabı - Zeynep ödedi
  const kitap = await api(users.zeynep.token).post('/transactions/expense', {
    groupId: groups.ders.id,
    amount: 350,
    description: 'Matematik ders kitabı (ortak kullanım)',
    participants: [users.ahmet.id, users.mehmet.id, users.zeynep.id, users.can.id],
    currency: 'TRY',
  });
  if (kitap.data.success) {
    transactions.push(kitap.data.data.transaction);
    success(`Kitap: 350 TL (Zeynep ödedi, 4 kişiye bölündü = ${kitap.data.data.splitAmount} TL/kişi)`);
  }

  info(`\nToplam ${transactions.length} işlem oluşturuldu`);
}

// ═══════════════════════════════════════
// 1️⃣3️⃣  İŞLEMLERİ GÖRÜNTÜLE
// ═══════════════════════════════════════
async function viewTransactions() {
  step('İŞLEMLERİ GÖRÜNTÜLE');

  // Grup bazlı işlemler
  for (const [key, g] of Object.entries(groups)) {
    const res = await api(users.ahmet.token).get(`/transactions/group/${g.id}`);
    if (res.data.success) {
      const txList = res.data.data.transactions || res.data.data || [];
      success(`"${g.name}" işlemleri: ${txList.length} adet`);
      txList.forEach(t => {
        info(`  💰 ${t.description}: ${t.totalAmount} ${t.currency} (Ödeyen: ${t.payerName})`);
      });
    }
  }

  // Son işlemler
  const recent = await api(users.ahmet.token).get(`/transactions/group/${groups.ev.id}/recent`);
  if (recent.data.success) {
    const recentList = Array.isArray(recent.data.data) ? recent.data.data : recent.data.data.transactions || [];
    success(`Ev Giderleri son işlemler: ${recentList.length} adet`);
  }

  // Kullanıcı işlemleri
  const userTx = await api(users.elif.token).get('/transactions/user');
  if (userTx.data.success) {
    const userTxList = userTx.data.data.transactions || userTx.data.data || [];
    success(`Elif'in toplam işlemleri: ${userTxList.length} adet`);
  }
}

// ═══════════════════════════════════════
// 1️⃣4️⃣  BORÇLAR OLUŞTURMA (DEBT) - Manuel
// ═══════════════════════════════════════
async function createManualDebts() {
  step('MANUEL BORÇ OLUŞTURMA');

  // Ahmet → Can'a borç ekle (Can'ın Ahmet'e borcu)
  const debt1 = await api(users.ahmet.token).post(`/debts/${groups.ev.id}`, {
    creditorId: users.ahmet.id,
    participants: [users.can.id],
    amount: 150,
    description: 'Temizlik malzemeleri için',
    currency: 'TRY',
  });
  if (debt1.data.success) {
    debts.temizlik = debt1.data.data[0];
    success(`Borç: Can → Ahmet'e 150 TL borçlu (temizlik malzemeleri)`);
  }

  // Elif → Mehmet'e borç ekle
  const debt2 = await api(users.elif.token).post(`/debts/${groups.yemek.id}`, {
    creditorId: users.elif.id,
    participants: [users.mehmet.id],
    amount: 85,
    description: 'Elif\'in aldığı su ve içecekler',
    currency: 'TRY',
  });
  if (debt2.data.success) {
    debts.icecek = debt2.data.data[0];
    success(`Borç: Mehmet → Elif'e 85 TL borçlu (içecekler)`);
  }

  // Zeynep → birden fazla kişiye borç (bölünmüş)
  const debt3 = await api(users.zeynep.token).post(`/debts/${groups.ders.id}`, {
    creditorId: users.zeynep.id,
    participants: [users.ahmet.id, users.can.id],
    amount: 120,
    description: 'Kırtasiye malzemeleri',
    currency: 'TRY',
  });
  if (debt3.data.success) {
    debts.kirtasiye = debt3.data.data;
    success(`Borç: Ahmet ve Can → Zeynep'e 60'ar TL borçlu (kırtasiye)`);
  }
}

// ═══════════════════════════════════════
// 1️⃣5️⃣  BORÇLARI GÖRÜNTÜLE
// ═══════════════════════════════════════
async function viewDebts() {
  step('BORÇLARI GÖRÜNTÜLE');

  // Kullanıcının tüm borçları
  const myDebts = await api(users.ahmet.token).get('/debts/my-debts');
  if (myDebts.data.success) {
    success(`Ahmet'in toplam borç kaydı: ${myDebts.data.data.length}`);
    myDebts.data.data.forEach(d => {
      const type = d.creditorId?._id === users.ahmet.id ? 'ALACAK' : 'BORÇ';
      info(`  💳 ${type}: ${d.amount} ${d.currency} - ${d.description} [${d.status}]`);
    });
  }

  // Grup bazlı borçlar
  for (const [key, g] of Object.entries(groups)) {
    const res = await api(users.ahmet.token).get(`/debts/group/${g.id}`);
    if (res.data.success) {
      const active = res.data.data.filter(d => d.status === 'active').length;
      const settled = res.data.data.filter(d => d.status === 'settled').length;
      success(`"${g.name}": ${res.data.data.length} borç (${active} aktif, ${settled} ödendi)`);
    }
  }
}

// ═══════════════════════════════════════
// 1️⃣6️⃣  BORÇ DÜZENLEME
// ═══════════════════════════════════════
async function editDebt() {
  step('BORÇ DÜZENLEME');

  if (debts.temizlik) {
    const debtId = debts.temizlik._id;
    const res = await api(users.ahmet.token).put(`/debts/${debtId}`, {
      amount: 200,
      description: 'Temizlik malzemeleri + deterjan (güncellendi)',
    });
    if (res.data.success) {
      success(`Borç güncellendi: 150 TL → 200 TL, açıklama güncellendi`);
    }
  }
}

// ═══════════════════════════════════════
// 1️⃣7️⃣  BAKİYE HESAPLAMA
// ═══════════════════════════════════════
async function calculateBalances() {
  step('BAKİYE HESAPLAMA');

  // Ahmet ile diğerleri arasındaki bakiye (Ev Giderleri)
  const others = ['elif', 'mehmet', 'zeynep', 'can'];
  for (const key of others) {
    const res = await api(users.ahmet.token).get(`/debts/balance/${groups.ev.id}/${users[key].id}`);
    if (res.data.success) {
      const b = res.data.data;
      success(`Ahmet ↔ ${users[key].name}: ${b.balance} ${b.currency} — ${b.message}`);
    }
  }
}

// ═══════════════════════════════════════
// 1️⃣8️⃣  TEK BORÇ TASFİYESİ (SETTLE)
// ═══════════════════════════════════════
async function settleDebts() {
  step('BORÇ TASFİYESİ (TEK TEK)');

  // Ev Giderleri grubundaki ilk aktif borcu bul ve öde
  const evDebts = await api(users.ahmet.token).get(`/debts/group/${groups.ev.id}`);
  if (evDebts.data.success) {
    const activeDebts = evDebts.data.data.filter(d => d.status === 'active');
    
    if (activeDebts.length > 0) {
      // İlk 2 borcu tsfiye et
      for (let i = 0; i < Math.min(2, activeDebts.length); i++) {
        const d = activeDebts[i];
        const settleUser = d.debtorId?._id === users.ahmet.id ? users.ahmet : 
                          d.creditorId?._id === users.ahmet.id ? users.ahmet :
                          Object.values(users).find(u => u.id === d.debtorId?._id || u.id === d.creditorId?._id);
        
        if (settleUser) {
          const res = await api(settleUser.token).patch(`/debts/${d._id}/settle`);
          if (res.data.success) {
            success(`Borç ödendi ✅: ${d.amount} ${d.currency} - "${d.description}"`);
          } else {
            warn(`Borç ödenemedi: ${JSON.stringify(res.data)}`);
          }
        }
      }
    }
  }

  // Manuel oluşturduğumuz borcu da öde
  if (debts.icecek) {
    const res = await api(users.mehmet.token).patch(`/debts/${debts.icecek._id}/settle`);
    if (res.data.success) {
      success(`Borç ödendi ✅: Mehmet → Elif 85 TL (içecekler)`);
    }
  }
}

// ═══════════════════════════════════════
// 1️⃣9️⃣  TOPLU TASFİYE (SETTLE ALL)
// ═══════════════════════════════════════
async function settleAllDebts() {
  step('TOPLU BORÇ TASFİYESİ');

  // Ahmet ile Can arasındaki tüm borçları tsfiye et (Ev Giderleri)
  const res = await api(users.ahmet.token).patch(
    `/debts/settle-all/${groups.ev.id}/${users.can.id}`
  );
  if (res.data.success) {
    success(`Ahmet ↔ Can arasındaki tüm borçlar tasfiye edildi: ${res.data.data?.settledCount || 0} borç`);
  } else {
    info(`Toplu tasfiye sonucu: ${res.data.message || JSON.stringify(res.data)}`);
  }
}

// ═══════════════════════════════════════
// 2️⃣0️⃣  BORÇ SİLME
// ═══════════════════════════════════════
async function deleteDebt() {
  step('BORÇ SİLME');

  // Kırtasiye borçlarından birini sil
  if (debts.kirtasiye && debts.kirtasiye.length > 0) {
    const debtToDelete = debts.kirtasiye[0];
    const res = await api(users.zeynep.token).delete(`/debts/${debtToDelete._id}`);
    if (res.data.success) {
      success(`Borç silindi: ${debtToDelete.amount} TL kırtasiye borcu`);
    }
  }
}

// ═══════════════════════════════════════
// 2️⃣1️⃣  ANALİTİK VERİLER
// ═══════════════════════════════════════
async function viewAnalytics() {
  step('ANALİTİK VERİLER');

  for (const [key, g] of Object.entries(groups)) {
    // Toplam tutar
    const total = await api(users.ahmet.token).get(`/analytics/group/${g.id}/total`);
    if (total.data.success) {
      const d = total.data.data;
      success(`"${g.name}" Toplam: ${d.totalAmount} TL (Aktif: ${d.activeAmount}, Ödenen: ${d.settledAmount})`);
    }

    // Aylık analiz
    const monthly = await api(users.ahmet.token).get(`/analytics/group/${g.id}/monthly`);
    if (monthly.data.success) {
      info(`  📊 Aylık veri: ${monthly.data.data?.length || 0} ay`);
    }

    // Kullanıcı dağılımı
    const patterns = await api(users.ahmet.token).get(`/analytics/group/${g.id}/user-patterns`);
    if (patterns.data.success) {
      info(`  👥 Kullanıcı dağılımı mevcut`);
    }

    // Grup özeti
    const summary = await api(users.ahmet.token).get(`/analytics/group/${g.id}/summary`);
    if (summary.data.success) {
      info(`  📋 Grup özeti mevcut`);
    }
  }
}

// ═══════════════════════════════════════
// 2️⃣2️⃣  AKTİVİTE KAYITLARI
// ═══════════════════════════════════════
async function viewActivities() {
  step('AKTİVİTE KAYITLARI');

  // Grup aktiviteleri
  for (const [key, g] of Object.entries(groups)) {
    const res = await api(users.ahmet.token).get(`/activities/group/${g.id}`);
    if (res.data.success) {
      const activities = res.data.data.activities;
      success(`"${g.name}" aktiviteleri: ${activities?.length || 0} kayıt`);
      activities?.slice(0, 3).forEach(a => {
        info(`  📝 [${a.type}] ${a.description}`);
      });
    }
  }

  // Kullanıcı aktiviteleri
  const userAct = await api(users.ahmet.token).get('/activities/user');
  if (userAct.data.success) {
    success(`Ahmet'in aktiviteleri: ${userAct.data.data.activities?.length || 0} kayıt`);
  }
}

// ═══════════════════════════════════════
// 2️⃣3️⃣  GRUPTAN AYRILMA (LEAVE)
// ═══════════════════════════════════════
async function leaveGroup() {
  step('GRUPTAN AYRILMA');

  // Can Ders Malzemeleri grubundan ayrılsın
  const res = await api(users.can.token).post(`/groups/${groups.ders.id}/leave`);
  if (res.data.success) {
    success('Can "Ders Malzemeleri" grubundan ayrıldı 🚪');
  } else {
    warn(`Can gruptan ayrılamadı: ${res.data.message || JSON.stringify(res.data)}`);
  }
}

// ═══════════════════════════════════════
// 2️⃣4️⃣  TOKEN YENİLEME (REFRESH)
// ═══════════════════════════════════════
async function refreshTokenTest() {
  step('TOKEN YENİLEME');

  const res = await axios.post(`${BASE_URL}/auth/refresh-token`, {
    refreshToken: users.ahmet.refreshToken,
  });

  if (res.data.success) {
    users.ahmet.token = res.data.data.tokens?.accessToken || users.ahmet.token;
    success('Ahmet\'in token\'ı yenilendi');
  } else {
    info(`Token yenileme sonucu: ${res.data.message}`);
  }
}

// ═══════════════════════════════════════
// 2️⃣5️⃣  ÇIKIŞ (LOGOUT)
// ═══════════════════════════════════════
async function logoutTest() {
  step('ÇIKIŞ TESTİ');

  // Can çıkış yapsın
  const res = await api(users.can.token).post('/auth/logout');
  if (res.data.success) {
    success('Can çıkış yaptı');
  }

  // Tekrar giriş yapsın
  const login = await axios.post(`${BASE_URL}/auth/login`, {
    email: 'can@test.com',
    password: 'Test1234!',
  });
  if (login.data.success) {
    users.can.token = login.data.data.tokens.accessToken;
    users.can.refreshToken = login.data.data.tokens.refreshToken;
    success('Can tekrar giriş yaptı');
  }
}

// ═══════════════════════════════════════
// 2️⃣6️⃣  SON DURUM ÖZET
// ═══════════════════════════════════════
async function finalSummary() {
  step('SON DURUM ÖZETİ');

  console.log('\n  ╔══════════════════════════════════════════╗');
  console.log('  ║        📊 SİSTEM ÖZET RAPORU             ║');
  console.log('  ╚══════════════════════════════════════════╝\n');

  // Kullanıcı sayısı
  info(`👥 Toplam Kullanıcı: ${Object.keys(users).length}`);
  
  // Grup bilgileri
  for (const [key, g] of Object.entries(groups)) {
    const details = await api(users.ahmet.token).get(`/groups/${g.id}`);
    const debtsRes = await api(users.ahmet.token).get(`/debts/group/${g.id}`);
    
    if (details.data.success) {
      const memberCount = details.data.data.members?.length || 0;
      const totalDebts = debtsRes.data.success ? debtsRes.data.data.length : 0;
      const activeDebts = debtsRes.data.success ? debtsRes.data.data.filter(d => d.status === 'active').length : 0;
      const settledDebts = debtsRes.data.success ? debtsRes.data.data.filter(d => d.status === 'settled').length : 0;
      
      console.log(`\n  📁 ${g.name}`);
      info(`     Üye: ${memberCount} | Borç: ${totalDebts} (${activeDebts} aktif, ${settledDebts} ödendi)`);
    }
  }

  console.log('\n  ╔══════════════════════════════════════════╗');
  console.log('  ║   ✅ TÜM İŞLEMLER BAŞARIYLA TAMAMLANDI  ║');
  console.log('  ╚══════════════════════════════════════════╝\n');
}

// ═══════════════════════════════════════
// 🚀 ANA ÇALIŞTIRMA FONKSİYONU
// ═══════════════════════════════════════
async function main() {
  console.log('\n');
  console.log('  ╔══════════════════════════════════════════════╗');
  console.log('  ║  🏠 SplitEase - Tam Sistem Simülasyonu       ║');
  console.log('  ║  5 Öğrenci • 4 Grup • Tüm Özellikler        ║');
  console.log('  ║  Para Birimi: TRY (Türk Lirası)              ║');
  console.log('  ╚══════════════════════════════════════════════╝');
  console.log('\n');

  try {
    // 1. Veritabanını temizle
    await clearDatabase();
    await sleep(1000);

    // 2. Kayıt
    await registerUsers();
    await sleep(500);

    // 3. Giriş
    await loginUsers();

    // 4. Profil işlemleri
    await profileOperations();

    // 5. Grup oluşturma
    await createGroups();
    await sleep(500);

    // 6. Davet gönderme
    await sendInvitations();
    await sleep(500);

    // 7. Bekleyen davetiyeleri görüntüle
    await viewPendingInvitations();

    // 8. Davetiye kabul ve red
    await handleInvitations();
    await sleep(500);

    // 9. Grupları görüntüle
    await viewGroups();

    // 10. Grup detayları
    await viewGroupDetails();

    // 11. Grup güncelleme
    await updateGroup();

    // 12. Üye yönetimi (rol değiştirme, üye çıkarma)
    await memberManagement();
    await sleep(500);

    // 13. İşlem/Harcama oluşturma (11 farklı işlem)
    await createTransactions();
    await sleep(500);

    // 14. İşlemleri görüntüle
    await viewTransactions();

    // 15. Manuel borç oluşturma
    await createManualDebts();
    await sleep(500);

    // 16. Borçları görüntüle
    await viewDebts();

    // 17. Borç düzenleme
    await editDebt();

    // 18. Bakiye hesaplama
    await calculateBalances();

    // 19. Tek borç tasfiyesi
    await settleDebts();
    await sleep(500);

    // 20. Toplu tasfiye
    await settleAllDebts();

    // 21. Borç silme
    await deleteDebt();

    // 22. Analitik veriler (4 grup × 4 endpoint)
    await viewAnalytics();

    // 23. Aktivite kayıtları
    await viewActivities();

    // 24. Gruptan ayrılma
    await leaveGroup();

    // 25. Token yenileme
    await refreshTokenTest();

    // 26. Çıkış ve tekrar giriş
    await logoutTest();

    // 27. Son durum özeti
    await finalSummary();

  } catch (err) {
    console.error('\n  💥 KRİTİK HATA:', err.message);
    if (err.response) {
      console.error('  📡 API Yanıtı:', err.response.status, err.response.data);
    }
    console.error(err.stack);
  }
}

// Çalıştır
main();
