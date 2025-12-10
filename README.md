<p align="center"> <strong>Digital KYC</strong><br/> A fully digitized KYC solution inspired by enterprise-grade banking platforms. </p>

**Executive Summary**

The HDFC Digital KYC System is a full-stack web application designed to replicate a real-world digital KYC verification flow.
The platform ensures:

1. Faster onboarding

2. Paperless documentation

3. Bank-grade security

4. Automated verification pipeline

_This project demonstrates proficiency in React, Node.js, secure authentication, file uploads, state management, UI/UX, and system design._

**System Overview**

The system provides a 5-step KYC onboarding journey, typically used by financial institutions:

1. User Registration

2. User Login

3. Personal Details Submission
 
4. Document Collection

5. Document Upload & Review

6. Final KYC Submission & Dashboard

_The entire workflow follows HDFC-inspired UI styling, ensuring trust, clarity, and simplicity._

**Key Features:**

**1. Secure User Authentication**

a. KYC ID auto-generated on registration

b. Login via Email or KYC ID

c. JWT-based secure token authentication

**2. Step-by-Step Guided KYC Flow**

a. User-friendly forms

b. LocalStorage-based data persistence

c. Live document validation

d. Multi-step progress indicators

**3. Smart Document Handling**

a. Supports: Aadhaar, PAN, Passport, Voter ID

b. Client-side validation

c. File size/type restriction

d. Server-side storage & metadata tracking

**4. Review & Confirmation**

a. Auto-loaded data from previous steps

b. Masked document numbers

c. Editable sections with "Edit" buttons

**5. Dashboard for Verified Users**

a. Displays KYC status

b. Quick banking services navigation

c. Account overview section

**6. Architecture Overview**

_The system implements a modular, scalable architecture suitable for enterprise integration._

**Frontend Architecture – React**

a. Component-driven UI

b. Service-based API layer
 
c. Context + LocalStorage persistence

d. Tailwind Styling System

e. Framer Motion UI animations

**Backend Architecture – Node.js / Express**

a. RESTful API

b. Multer-based file upload handling

c. JWT authentication

d. Modular controllers, routes & models

**Database Layer**

_This layer Stores:_

a. User accounts

b. Personal KYC details

c. Document types & numbers

d. Uploaded file metadata

e. KYC status tracking

**Technology Stack**
**Frontend**

React.js

Tailwind CSS

Framer Motion

React Router DOM

Axios

Backend

Node.js

Express.js

Multer (file upload)

JWT Authentication

bcrypt.js (password hashing)

Database

MySQL / MongoDB (both compatible)

Tools

Git & GitHub

VS Code

Postman

**Core Modules**
🔹 1. User Module

Registration

Login

KYC ID generation

🔹 2. Personal Information Module (Step 1)

Captures:

Name

DOB

Gender

Address

Passport Photo

🔹 3. Document Information Module (Step 2)

Address Proof Type & Number

Identity Proof Type & Number

Input validation

🔹 4. Document Upload Module (Step 3)

Drag & drop file upload

Dual upload system (address + identity)

File size/type validation

Upload progress bar

🔹 5. Review Module (Step 4)

Displays all details from previous steps

"Edit" option in each section

Masked document numbers

🔹 6. Completion Module (Step 5)

Final confirmation

Downloadable KYC confirmation file

Redirect to dashboard

🔹 7. Dashboard Module

Shows KYC status

Banking service categories

**Project Workflow**

🟦 Homepage

🟦 Registration

🟦 Login

🟦 Step 1 — Personal Information

🟦 Step 2 — Document Details

🟦 Step 3 — Upload Documents

🟦 Step 4 — Review & Confirm

🟦 Step 5 — KYC Submitted

🟦 Dashboard

**Installation Guide**
1️⃣ Clone Repository
git clone https://github.com/Riajulhc/digital-kyc.git

2️⃣ Install Frontend
cd frontend
npm install
npm start

3️⃣ Install Backend
cd backend
npm install
npm start

**Folder Structure**

<img width="293" height="522" alt="image" src="https://github.com/user-attachments/assets/5917f8aa-29cd-4acf-9ba1-7dd486c8e6b8" />


**API Endpoints**

Authentication

Method	Endpoint	Description

POST	/register	Create account

POST	/login	Authenticate user

KYC Flow

Method	Endpoint	Description

POST	/kyc/personal	Save step 1 data

POST	/kyc/documents	Save document numbers

POST	/kyc/upload	Upload PDFs/Images

GET	/kyc/status	Fetch current status

**Security Framework**

JWT-based authentication

Encrypted passwords

Document number masking

File validation: type, size, format

Protected routes

Sanitized user input

CORS-enabled backend

**Future Enhancements**

1. OCR-based auto-reading of Aadhaar/PAN

2. Facial recognition + liveness detection

3. Aadhaar API integration

4. Push notification system

5. Admin verification dashboard

6. Multi-language support

7. Cloud file storage (AWS S3)

**Conclusion**

1. The project successfully demonstrates a complete digital KYC workflow.

2. Implements industrial UI/UX patterns used in modern banking apps.

3. Backend security ensures safe onboarding and compliant identity handling.

4. The architecture is scalable, extendable, and production-ready.

5. This project can serve as a foundation for real banking KYC systems or enterprise onboarding platforms.

**Author
Riajul Hoque Choudhury**

Developer – Digital KYC System

GitHub: https://github.com/Riajulhc

LinkedIn : http://www.linkedin.com/in/riajul-hoque-choudhury-a99988271
