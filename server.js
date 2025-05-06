require('dotenv').config();
const { exec } = require('child_process');
const AWS = require('aws-sdk');
const fs = require('fs');
const path = require('path');
const cron = require('node-cron');

function getDateFormatted() {
  const now = new Date();
  const dd = String(now.getDate()).padStart(2, '0');
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const yyyy = now.getFullYear();

  const hh = String(now.getHours()).padStart(2, '0');
  const min = String(now.getMinutes()).padStart(2, '0');
  const ss = String(now.getSeconds()).padStart(2, '0');


  return `${dd}-${mm}-${yyyy}_${hh}:${min}:${ss}`;
}

const spacesEndpoint = new AWS.Endpoint(process.env.DO_SPACES_ENDPOINT);
const s3 = new AWS.S3({
  endpoint: spacesEndpoint,
  accessKeyId: process.env.DO_SPACES_KEY,
  secretAccessKey: process.env.DO_SPACES_SECRET,
});

function backupAndUpload(env, dbConfig) {
  const date = getDateFormatted();
  const fileName = `backup-${env}-${date}.sql`;
  const filePath = path.join(__dirname, fileName);

  const dumpCommand = `mysqldump -h ${dbConfig.DB_HOST} -P ${dbConfig.DB_PORT} -u ${dbConfig.DB_USER} -p${dbConfig.DB_PASSWORD} ${dbConfig.DB_NAME} > ${filePath}`;

  console.log(`Taking backup for Env: ${env} and Executing command: '${dumpCommand}'`);
  exec(dumpCommand, (err, stdout, stderr) => {
    if (err) {
      console.error(`Database dump failed for Env: ${env} and error is : ${JSON.stringify(err, null, 2)}`);
      return;
    }

    console.log(`Backup file created: '${fileName}' for Env: ${env}. Now uploading to Spaces...`);
    const fileContent = fs.readFileSync(filePath);

    const locationKey = `${env}/${fileName}`;
    const params = {
      Bucket: process.env.DO_SPACES_BUCKET,
      Key: locationKey,
      Body: fileContent,
      ACL: 'private',
    };

    s3.upload(params, (uploadErr, data) => {
      if (uploadErr) {
        console.error(`Upload failed with fileName: '${fileName}' for Env: ${env}. Error is: ${JSON.stringify(uploadErr, null, 2)}`);
      } else {
        console.log(`Backup file: '${fileName}' uploaded to ${locationKey} for Env: ${env}.`);
        fs.unlinkSync(filePath); // Clean up local backup
      }
    });
  });
}

function takeBackup() {
  backupAndUpload('prod', {
    DB_HOST: process.env.DB_PROD_HOST,
    DB_PORT: process.env.DB_PROD_PORT,
    DB_USER: process.env.DB_PROD_USER,
    DB_PASSWORD: process.env.DB_PROD_PASSWORD,
    DB_NAME: process.env.DB_PROD_NAME
  });

  backupAndUpload('dev', {
    DB_HOST: process.env.DB_DEV_HOST,
    DB_PORT: process.env.DB_DEV_PORT,
    DB_USER: process.env.DB_DEV_USER,
    DB_PASSWORD: process.env.DB_DEV_PASSWORD,
    DB_NAME: process.env.DB_DEV_NAME
  });
}

// Schedule daily at 2:00 AM
cron.schedule('0 2 * * *', takeBackup);