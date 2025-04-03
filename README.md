# URL Shortener Web Application (Server)

<div align="center">
  <img src="https://res.cloudinary.com/dmmpngwym/image/upload/v1743660743/shortlink_oyvsr0.jpg">
</div>

## 📌 Overview
  - URL Shortener Application เป็นเครื่องมือสำหรับย่อ URL ที่พัฒนาด้วย TypeScript, Node.js, Express, และ Prisma ช่วยให้ผู้ใช้สามารถ:
  - ย่อ URL ยาว ๆ ให้สั้นลง
  - ติดตามจำนวนคลิกและแหล่งที่มาของผู้ใช้
  - วิเคราะห์ตำแหน่งของผู้เข้าถึงลิงก์ผ่าน IP Address
  - เหมาะสำหรับการแชร์ลิงก์บนโซเชียลมีเดียและการตลาดดิจิทัล ✨
## 🚀 Features

1. **🔗 URL Shortening**
   - แปลง URL ยาวให้เป็นรหัสสั้น (short code) โดยใช้การเข้ารหัส Base62
   - รองรับการสร้าง Short URL ซ้ำสำหรับ URL เดิมที่มีอยู่แล้ว
   - คืนค่า URL สั้นในรูปแบบ `https://your-domain.com/<shortCode>`

2. **📊 Click Tracking**
   - บันทึกจำนวนครั้งที่ URL สั้นถูกคลิก
   - เก็บข้อมูล IP Address ของผู้คลิกเพื่อวิเคราะห์เพิ่มเติม

3. **🌍 GeoLocation Tracking**
   - ดึงข้อมูลตำแหน่ง (ประเทศ, เมือง, ละติจูด, ลองจิจูด) จาก IP Address โดยใช้ **IpInfo API**
   - บันทึกข้อมูลตำแหน่งในตาราง `GeoLocation` เพื่อดูสถิติ

4. **📈 Analytics**
   - **Location Stats**: แสดงจำนวนคลิกตามตำแหน่ง, ข้อมูลตำแหน่งล่าสุด (latest GeoLocation), และสถิติรวม
   - **URL History**: แสดงรายการ URL ทั้งหมดที่เคยสร้าง พร้อมวันสร้างและจำนวนคลิก

5. **⚡ Scalability**
   - ใช้ Prisma ORM ร่วมกับ PostgreSQL เพื่อจัดการฐานข้อมูลแบบ scalable
   - รองรับการ deploy บน platform เช่น Render

6. **Security**
   - ตั้งค่า `trust proxy` เพื่อดึง IP จริงจาก header `X-Forwarded-For` เมื่ออยู่หลัง proxy (เช่น Render)

## 📌 ER-Diagram
<div align="center">
  <img src="https://res.cloudinary.com/dmmpngwym/image/upload/v1743658953/er_yh9owp.jpg">
</div>

## คำอธิบาย ERD และความสัมพันธ์

  ### 1. ตาราง ShortUrl
  - ฟิลด์:
    - id (Primary Key, int): รหัสประจำตัวของ URL ที่ย่อแล้ว (สร้างอัตโนมัติ)
    - originalUrl (string): URL เดิมที่ยาว (เช่น https://www.youtube.com/watch?v=example)
    - shortCode (string): รหัสสั้นที่ระบบสร้างขึ้น (เช่น 3s3eK) ซึ่งต้องไม่ซ้ำกัน (unique)
    - createdAt (datetime): วันที่และเวลาที่สร้าง URL สั้น
    - updatedAt (datetime): วันที่และเวลาที่มีการอัปเดตข้อมูล
  - ความสัมพันธ์:
    - มีความสัมพันธ์แบบ one-to-many กับตาราง Click (ระบุด้วยเส้น "contains" ใน ERD) หมายความว่า URL สั้น 1 รายการสามารถมีข้อมูลการคลิก (Click) ได้หลายครั้ง

  ### 2. ตาราง Click
  - ฟิลด์:
    - id (Primary Key, int): รหัสประจำตัวของการคลิก (สร้างอัตโนมัติ)
    - shortUrlId (Foreign Key, int): รหัสของ URL สั้นที่ถูกคลิก (อ้างอิงจาก id ของตาราง ShortUrl)
    - clickedAt (datetime): วันที่และเวลาที่มีการคลิก
    - ipAddress (string, optional): ที่อยู่ IP ของผู้ที่คลิก (อาจมีหรือไม่มีก็ได้)
  - ความสัมพันธ์:
    - มีความสัมพันธ์แบบ many-to-one กับตาราง ShortUrl ผ่าน shortUrlId (ระบุด้วยเส้นที่เชื่อมไปยัง ShortUrl)
    - มีความสัมพันธ์แบบ one-to-one กับตาราง GeoLocation (ระบุด้วยเส้น "has" ใน ERD) หมายความว่าการคลิก 1 ครั้งสามารถมีข้อมูลตำแหน่ง (GeoLocation) ได้สูงสุด 1 รายการ (แต่ไม่บังคับ)

  ### 3. ตาราง GeoLocation
  - ฟิลด์:
    - id (Primary Key, int): รหัสประจำตัวของข้อมูลตำแหน่ง (สร้างอัตโนมัติ)
    - clickId (Foreign Key, int): รหัสของการคลิกที่เกี่ยวข้อง (อ้างอิงจาก id ของตาราง Click) และต้องไม่ซ้ำกัน (unique)
    - country (string, optional): ประเทศของผู้คลิก
    - city (string, optional): เมืองของผู้คลิก
    - latitude (float, optional): ละติจูดของตำแหน่ง
    - longitude (float, optional): ลองจิจูดของตำแหน่ง
  - ความสัมพันธ์:
    - มีความสัมพันธ์แบบ one-to-one กับตาราง Click ผ่าน clickId (ระบุด้วยเส้นที่เชื่อมไปยัง Click)

## 📌 Data flow Diagram Level 0
<div align="center">
  <img src="https://res.cloudinary.com/dmmpngwym/image/upload/v1743658953/Blank_diagram_dpwz2x.jpg">
</div>

## คำอธิบาย
  - External Entity:
    - User: ผู้ใช้ที่โต้ตอบกับระบบ (เช่น ส่ง URL, คลิก URL, ขอสถิติ หรือดูประวัติ)
  - Data Flows:
    - Original URL: ผู้ใช้ส่ง URL เดิมเพื่อย่อ
    - Shortened URL: ระบบส่ง URL ที่ย่อแล้วกลับไป
    - Click Request: ผู้ใช้คลิก URL ที่ย่อแล้ว
    - Original URL Redirect: ระบบ redirect ไปยัง URL เดิม
    - ShortCode Or OriginalURL: ผู้ใช้ส่ง shortCode (เช่น 3s3eK) หรือ originalURL เพื่อขอสถิติการคลิก
    - Location Stats: ระบบส่งข้อมูลสถิติ (เช่น totalClicks, latestGeoLocation, locations) กลับไป
    - History Req: ผู้ใช้ส่งคำขอประวัติ URL (อาจไม่ต้องระบุพารามิเตอร์อะไรเพิ่มเติม)
    - URL History: ระบบส่งรายการประวัติ URL ทั้งหมด (เช่น id, originalUrl, shortCode, clickCount) กลับไป
  - ระบบ:
    - URL Shortener System: รับ URL, สร้าง URL สั้น, จัดการการคลิก, เก็บข้อมูล GeoLocation, และให้ข้อมูลสถิติ/ประวัติ

## 🛠 Prerequisites

ก่อนติดตั้ง คุณต้องมีเครื่องมือและข้อมูลต่อไปนี้:

- **Node.js**: v18 หรือสูงกว่า
- **npm**: v9 หรือสูงกว่า
- **PostgreSQL**: ฐานข้อมูลสำหรับเก็บข้อมูล URL, Click, และ GeoLocation
- **IpInfo API Key**: สมัครที่ [ipinfo.io](https://ipinfo.io) เพื่อรับ API Key
- **Render Account**: ถ้าต้องการ deploy ออนไลน์

## 🔧 Installation (Local Development)

### 1️⃣ Clone Repository
```bash
git clone https://github.com/erisk405/ShortLink-Server.git
cd ShortLink-Server
```
### 2️⃣ Install Dependencies
```bash
npm install
# หรือถ้าใช้ yarn
# yarn install
```
### 3️⃣ Setup Environment Variables
```bash
DATABASE_URL="postgresql://<username>:<password>@<host>:<port>/<dbname>?schema=public"
IPINFO_API_KEY="your_ipinfo_api_key"
BASE_URL="your_server_domain" #http://localhost:8080
CLIENT_URL="your_client_domain" #http://localhost:5173
PORT=8080
```
📌 เปลี่ยนค่า username , password , host , port , dbname ตามฐานข้อมูลของคุณ

### 4️⃣ Setup Database
```bash
npx prisma migrate dev --name init
```
🔹 คำสั่งนี้จะสร้างตาราง ShortUrl, Click, และ GeoLocation ตาม schema ใน prisma/schema.prisma

### 5️⃣ Start the Application
```bash
npm start
```
🔹 แอปจะรันที่ http://localhost:8080

## 🎯 API Endpoints

✂️ Shorten URL
```bash
POST http://localhost:8080/shorten
```
🔄 Redirect
```bash
GET http://localhost:8080/<shortCode>
```
🌍 Location Stats
```bash
GET http://localhost:8080/location-stats?shortCode=<shortCode>
```
📜 URL History
```bash
GET http://localhost:8080/history
```

## 🔗 Links
- **Client Repository:** [Short link client side](https://github.com/erisk405/ShortLink-Client)
- **Server Repository:** [Short link server side](https://github.com/erisk405/ShortLink-Server)

Built with ❤️ using Node.js.
