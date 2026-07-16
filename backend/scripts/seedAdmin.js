/**
 * Seed script: Create first admin user if none exists
 * Run from backend folder: node scripts/seedAdmin.js
 */
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@velo.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';
const ADMIN_PHONE = process.env.ADMIN_PHONE || '9999999999';

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/velo_db');
  const existing = await User.findOne({ role: 'admin' });
  if (existing) {
    console.log('Admin user already exists:', existing.email);
    process.exit(0);
    return;
  }
  await User.create({
    firstName: 'Admin',
    middleName: '',
    lastName: 'User',
    email: ADMIN_EMAIL,
    phone: ADMIN_PHONE,
    password: ADMIN_PASSWORD,
    role: 'admin',
  });
  console.log('Admin created. Login with:', ADMIN_EMAIL, '/', ADMIN_PASSWORD);
  process.exit(0);
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
