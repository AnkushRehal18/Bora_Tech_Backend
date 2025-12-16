const bcrypt = require('bcryptjs');
const logger = require('../../utils/logger');
const config = require('../../config/config');
const User = require('../../model/users');

async function run() {
  try {
    logger.info('Starting company users seeder...');

    const all_companies_users = [
      { email: 'rutuja@bora.tech', password: 'rutuja@123', role: 'Admin' },
      { email: 'sunil@bora.tech', password: 'sunil@123', role: 'Regular' },
      { email: 'suyash@bora.tech', password: 'suyash@123', role: 'Regular' },
      { email: 'kritika@bora.tech', password: 'kritika@123', role: 'Regular' },
      { email: 'himanshu@bora.tech', password: 'himanshu@123', role: 'Regular' },
      { email: 'sayam@bora.tech', password: 'sayam@123', role: 'Regular' },
      { email: 'bharat@bora.tech', password: 'bharat@123', role: 'Regular' },
    ];

    const dns_users = [
      { email: 'rkn@bora.tech', password: 'rkn@123', role: 'Regular' },
      { email: 'dyaneshwar@bora.tech', password: 'dyan@123', role: 'Regular' },
    ];

    const usersToSeed = [...all_companies_users, ...dns_users];
    const usersToInsert = [];

    for (const user of usersToSeed) {
      const existingUser = await User.findOne({ email: user.email });

      if (existingUser) {
        logger.info(`User already exists, skipping: ${user.email}`);
        continue;
      }

      const hashedPassword = await bcrypt.hash(
        user.password,
        config.security.bcryptRounds
      );

      usersToInsert.push({
        email: user.email,
        password: hashedPassword,
        role: user.role.toUpperCase(),
        isActive: true,
        emailVerified: true,
      });
    }

    if (usersToInsert.length > 0) {
      const createdUsers = await User.insertMany(usersToInsert);

      createdUsers.forEach(user => {
        logger.info(`Created user: ${user.email}`);
      });
    } else {
      logger.info('No new users to insert.');
    }

    logger.info('Company users seeder completed successfully');
  } catch (error) {
    logger.error('Error in company users seeder:', error);
    throw error;
  }
}

module.exports = { run };
