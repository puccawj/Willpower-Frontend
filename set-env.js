const fs = require('fs');
const dir = './src/environments';

// ตรวจสอบว่ามีโฟลเดอร์ environments หรือยัง หากไม่มีให้สร้างขึ้นมา
if (!fs.existsSync(dir)){
  fs.mkdirSync(dir, { recursive: true });
}

// อ่านค่าตัวแปร API_URL จาก Environment Variable (ถ้าไม่มีให้ใช้ค่า Default เป็นของ Railway ตัวเดิม)
const apiUrl = process.env.API_URL || 'https://willpower-production.up.railway.app';

const targetPath = './src/environments/environment.ts';
const envConfigFile = `export const environment = {
  production: true,
  apiUrl: '${apiUrl}'
};
`;

fs.writeFileSync(targetPath, envConfigFile);
console.log(`Generated environment.ts dynamically with API_URL: ${apiUrl}`);
