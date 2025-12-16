require('dotenv').config();

const connectDB = require('../config/database');
const logger = require('../utils/logger');
const fs = require('fs').promises;
const path = require('path');

const runSeeders = async () => {
  try {
    await connectDB();
    logger.info('Starting MongoDB seeders...');

    const seedersDir = path.join(__dirname, 'files');
    const seederFiles = await fs.readdir(seedersDir);
    const jsFiles = seederFiles.filter(file => file.endsWith('.js')).sort();

    for (const file of jsFiles) {
      logger.info(`Running seeder: ${file}`);

      const seederPath = path.join(seedersDir, file);
      const seeder = require(seederPath);

      if (typeof seeder.run === 'function') {
        await seeder.run();
        logger.info(`Seeder completed: ${file}`);
      } else {
        logger.warn(`Seeder ${file} does not export a run() function`);
      }
    }

    logger.info('All seeders completed successfully');
    process.exit(0);
  } catch (error) {
    logger.error('Seeding failed:', error);
    process.exit(1);
  }
};

runSeeders();
