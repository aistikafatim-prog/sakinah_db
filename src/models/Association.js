const User = require('./UserModel');
const Mempelai = require('./MempelaiModel');
const Acara = require('./AcaraModel');
const Story = require('./StoryModel');
const Gift = require('./GiftModel');
const Ucapan = require('./UcapanModel');
const Invitation = require('./invitationModel');
const Tagihan = require('./TagihanModel');
const Template = require('./TemplateModel');
const Tamu = require('./TamuModel'); 
const LayarSapa = require('./LayarSapaModel');
const Setting = require('./SettingModel');
// === RELASI ANTAR MODEL ===
// 1. User -> Invitation (1 User bisa punya banyak undangan)
User.hasMany(Invitation, { foreignKey: 'user_id' });
Invitation.belongsTo(User, { foreignKey: 'user_id' });

// 2. Invitation -> Mempelai (1 Undangan punya 1 Data Mempelai)
Invitation.hasOne(Mempelai, { foreignKey: 'invitation_id', onDelete: 'CASCADE' });
Mempelai.belongsTo(Invitation, { foreignKey: 'invitation_id' });

// 3. Invitation -> Acara (1 Undangan punya 1 Data Acara)
Invitation.hasOne(Acara, { foreignKey: 'invitation_id', onDelete: 'CASCADE' });
Acara.belongsTo(Invitation, { foreignKey: 'invitation_id' });

// 4. Invitation -> Gift (1 Undangan punya 1 Data Gift)
Invitation.hasOne(Gift, { foreignKey: 'invitation_id', onDelete: 'CASCADE' });
Gift.belongsTo(Invitation, { foreignKey: 'invitation_id' });

// 5. Invitation -> Story (1 Undangan bisa punya BANYAK Cerita)
Invitation.hasMany(Story, { foreignKey: 'invitation_id', onDelete: 'CASCADE' });
Story.belongsTo(Invitation, { foreignKey: 'invitation_id' });

// 1 Undangan punya BANYAK Ucapan/RSVP
Invitation.hasMany(Ucapan, { foreignKey: 'invitation_id', onDelete: 'CASCADE' });
Ucapan.belongsTo(Invitation, { foreignKey: 'invitation_id' });
 
//tagihan relasi
User.hasMany(Tagihan, { foreignKey: 'user_id' });
Tagihan.belongsTo(User, { foreignKey: 'user_id' });

// 1 Undangan punya BANYAK Ucapan/RSVP
Invitation.hasMany(Ucapan, { foreignKey: 'invitation_id', onDelete: 'CASCADE' });
Ucapan.belongsTo(Invitation, { foreignKey: 'invitation_id' });

// === TAMBAHKAN RELASI TAMU DI SINI ===
// 1 Undangan punya BANYAK Tamu
Invitation.hasMany(Tamu, { foreignKey: 'invitation_id', onDelete: 'CASCADE' });
Tamu.belongsTo(Invitation, { foreignKey: 'invitation_id' });
// Relasi 1-to-1 (Satu undangan punya satu pengaturan layar sapa)
Invitation.hasOne(LayarSapa, { foreignKey: 'invitation_id' });
LayarSapa.belongsTo(Invitation, { foreignKey: 'invitation_id' });

// Relasi 1-to-1 (Satu undangan punya satu pengaturan setting)
Invitation.hasOne(Setting, { foreignKey: 'invitation_id' });
Setting.belongsTo(Invitation, { foreignKey: 'invitation_id' });


// Export semuanya yang sudah direlasikan
module.exports = {
    User,
    Invitation,
    Mempelai,
    Acara,
    Story,
    Gift,
    Ucapan,
    Tagihan,
    Template,
    Tamu,
    LayarSapa,
    Setting
};