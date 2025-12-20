/**
 * seedData.js - Complete database seeding script
 * Run: npm run seed
 */

require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Models
const Department = require('./models/Department');
const Resource = require('./models/Resource');
const User = require('./models/User');

// ========== SEED DATA ==========

const departments = [
  {
    name: "Computer Science & Engineering",
    code: "CSE",
    description: "B.Tech, M.Tech, and Ph.D. programs in Computer Science with modern labs.",
    latitude: 26.7285,
    longitude: 83.4338,
    mapLink: "https://www.openstreetmap.org/?mlat=26.7285&mlon=83.4338#map=18/26.7285/83.4338",
    photo360Link: "https://example.com/360/cse",
    building: "Academic Block A",
    floor: 2,
    roomNumbers: ["201", "202", "203", "Lab 204", "Lab 205"],
    contact: {
      phone: "0551-2271234",
      email: "cse@mmmut.ac.in",
      office: "Room 202, Academic Block A"
    },
    hod: {
      name: "Dr. Rajesh Kumar Singh",
      email: "hod.cse@mmmut.ac.in",
      cabin: "HOD Room, 2nd Floor"
    },
    visitingHours: {
      weekdays: { open: "9:00 AM", close: "5:00 PM" },
      saturday: { open: "10:00 AM", close: "2:00 PM" },
      closedDays: ["Sunday"]
    },
    photos: [
      { url: "https://example.com/photos/cse1.jpg", caption: "CSE Lab" },
      { url: "https://example.com/photos/cse2.jpg", caption: "Department Entrance" }
    ]
  },
  {
    name: "Civil Engineering",
    code: "CE",
    description: "Oldest department offering B.Tech in Civil with structural and geotech labs.",
    latitude: 26.7290,
    longitude: 83.4342,
    mapLink: "https://www.openstreetmap.org/?mlat=26.7290&mlon=83.4342#map=18/26.7290/83.4342",
    building: "Civil Block",
    floor: 1,
    roomNumbers: ["101", "102", "103", "Survey Lab", "Concrete Lab"],
    contact: {
      phone: "0551-2271235",
      email: "civil@mmmut.ac.in",
      office: "Room 101, Civil Block"
    },
    hod: {
      name: "Dr. S.K. Duggal",
      email: "hod.civil@mmmut.ac.in",
      cabin: "HOD Cabin, Ground Floor"
    },
    visitingHours: {
      weekdays: { open: "9:30 AM", close: "5:30 PM" },
      saturday: { open: "10:00 AM", close: "1:00 PM" },
      closedDays: ["Sunday"]
    }
  },
  {
    name: "Electrical Engineering",
    code: "EE",
    description: "Power systems, machines, and control labs.",
    latitude: 26.7288,
    longitude: 83.4335,
    mapLink: "https://www.openstreetmap.org/?mlat=26.7288&mlon=83.4335#map=18/26.7288/83.4335",
    building: "Electrical Block",
    floor: 1,
    roomNumbers: ["E101", "E102", "Power Lab", "Control Lab"],
    contact: {
      phone: "0551-2271236",
      email: "ee@mmmut.ac.in",
      office: "E101, Electrical Block"
    },
    hod: {
      name: "Dr. R.K. Srivastava",
      email: "hod.ee@mmmut.ac.in",
      cabin: "HOD Room, 1st Floor"
    },
    visitingHours: {
      weekdays: { open: "9:00 AM", close: "5:00 PM" },
      saturday: { open: "10:00 AM", close: "2:00 PM" },
      closedDays: ["Sunday"]
    }
  },
  {
    name: "Mechanical Engineering",
    code: "ME",
    description: "Thermodynamics, CAD/CAM, and workshop facilities.",
    latitude: 26.7292,
    longitude: 83.4340,
    mapLink: "https://www.openstreetmap.org/?mlat=26.7292&mlon=83.4340#map=18/26.7292/83.4340",
    building: "Workshop Complex",
    floor: 0,
    roomNumbers: ["W101", "W102", "Thermal Lab", "CAD Lab"],
    contact: {
      phone: "0551-2271237",
      email: "me@mmmut.ac.in",
      office: "Workshop Office"
    },
    hod: {
      name: "Dr. A.K. Gupta",
      email: "hod.me@mmmut.ac.in",
      cabin: "HOD Cabin, Ground Floor"
    },
    visitingHours: {
      weekdays: { open: "8:30 AM", close: "4:30 PM" },
      saturday: { open: "9:00 AM", close: "1:00 PM" },
      closedDays: ["Sunday"]
    }
  },
  {
    name: "Electronics & Communication Engineering",
    code: "ECE",
    description: "VLSI, Communication, and Embedded Systems labs.",
    latitude: 26.7287,
    longitude: 83.4339,
    mapLink: "https://www.openstreetmap.org/?mlat=26.7287&mlon=83.4339#map=18/26.7287/83.4339",
    building: "Academic Block B",
    floor: 1,
    roomNumbers: ["B101", "B102", "VLSI Lab", "Comm Lab"],
    contact: {
      phone: "0551-2271238",
      email: "ece@mmmut.ac.in",
      office: "B101, Academic Block B"
    },
    hod: {
      name: "Dr. Neelam Srivastava",
      email: "hod.ece@mmmut.ac.in",
      cabin: "HOD Room, 1st Floor"
    },
    visitingHours: {
      weekdays: { open: "9:00 AM", close: "5:00 PM" },
      saturday: { open: "10:00 AM", close: "2:00 PM" },
      closedDays: ["Sunday"]
    }
  },
  {
    name: "Information Technology",
    code: "IT",
    description: "Focus on software engineering and networking.",
    latitude: 26.7284,
    longitude: 83.4337,
    mapLink: "https://www.openstreetmap.org/?mlat=26.7284&mlon=83.4337#map=18/26.7284/83.4337",
    building: "Academic Block A",
    floor: 3,
    roomNumbers: ["301", "302", "Network Lab"],
    contact: {
      phone: "0551-2271239",
      email: "it@mmmut.ac.in",
      office: "Room 301"
    },
    hod: {
      name: "Dr. Umesh Kumar",
      email: "hod.it@mmmut.ac.in",
      cabin: "HOD Cabin, 3rd Floor"
    },
    visitingHours: {
      weekdays: { open: "9:00 AM", close: "5:00 PM" },
      saturday: { open: "10:00 AM", close: "1:00 PM" },
      closedDays: ["Sunday"]
    }
  },
  {
    name: "Library",
    code: "LIB",
    description: "Central library with 1 lakh+ books and digital access.",
    latitude: 26.7289,
    longitude: 83.4341,
    mapLink: "https://www.openstreetmap.org/?mlat=26.7289&mlon=83.4341#map=18/26.7289/83.4341",
    building: "Central Library Building",
    floor: 0,
    roomNumbers: ["Reading Room", "Digital Section", "Reference Desk"],
    contact: {
      phone: "0551-2271250",
      email: "library@mmmut.ac.in",
      office: "Circulation Counter"
    },
    hod: {
      name: "Mr. S.K. Verma",
      email: "librarian@mmmut.ac.in",
      cabin: "Librarian Office"
    },
    visitingHours: {
      weekdays: { open: "8:00 AM", close: "8:00 PM" },
      saturday: { open: "9:00 AM", close: "5:00 PM" },
      closedDays: ["Sunday"]
    }
  },
  {
    name: "Canteen",
    code: "CAN",
    description: "Main canteen serving North Indian and fast food.",
    latitude: 26.7286,
    longitude: 83.4343,
    mapLink: "https://www.openstreetmap.org/?mlat=26.7286&mlon=83.4343#map=18/26.7286/83.4343",
    building: "Canteen Block",
    floor: 0,
    roomNumbers: ["Dining Area", "Kitchen"],
    contact: {
      phone: "0551-2271260",
      email: "canteen@mmmut.ac.in",
      office: "Manager Cabin"
    },
    hod: {
      name: "Mr. Ram Prasad",
      email: "canteen.manager@mmmut.ac.in",
      cabin: "Manager Office"
    },
    visitingHours: {
      weekdays: { open: "8:00 AM", close: "9:00 PM" },
      saturday: { open: "8:00 AM", close: "8:00 PM" },
      closedDays: []
    }
  },
  {
    name: "Admin Block",
    code: "ADM",
    description: "Registrar, accounts, and admission office.",
    latitude: 26.7291,
    longitude: 83.4336,
    mapLink: "https://www.openstreetmap.org/?mlat=26.7291&mlon=83.4336#map=18/26.7291/83.4336",
    building: "Administrative Building",
    floor: 1,
    roomNumbers: ["Registrar Office", "Accounts", "Admission Cell"],
    contact: {
      phone: "0551-2271200",
      email: "registrar@mmmut.ac.in",
      office: "Room 101"
    },
    hod: {
      name: "Prof. S.N. Singh",
      email: "registrar@mmmut.ac.in",
      cabin: "Registrar Office"
    },
    visitingHours: {
      weekdays: { open: "10:00 AM", close: "5:00 PM" },
      saturday: { open: "10:00 AM", close: "1:00 PM" },
      closedDays: ["Sunday"]
    }
  },
  {
    name: "Hostel Block A",
    code: "HOS",
    description: "Boys hostel with 200+ rooms.",
    latitude: 26.7293,
    longitude: 83.4344,
    mapLink: "https://www.openstreetmap.org/?mlat=26.7293&mlon=83.4344#map=18/26.7293/83.4344",
    building: "Hostel Block A",
    floor: 0,
    roomNumbers: ["Room 1-200", "Common Room", "Warden Office"],
    contact: {
      phone: "0551-2271270",
      email: "hostel@mmmut.ac.in",
      office: "Warden Office"
    },
    hod: {
      name: "Dr. Pradeep Kumar",
      email: "warden@mmmut.ac.in",
      cabin: "Ground Floor"
    },
    visitingHours: {
      weekdays: { open: "24 hours", close: "24 hours" },
      saturday: { open: "24 hours", close: "24 hours" },
      closedDays: []
    }
  }
];

// Sample admin user
const adminUser = {
  name: "Admin User",
  email: "admin@mmmut.ac.in",
  password: "Admin@123",
  role: "admin"
};

// Sample regular user
const regularUser = {
  name: "Test Student",
  email: "student@mmmut.ac.in",
  password: "Student@123",
  role: "user"
};

// ========== SEED FUNCTION ==========

const seedDatabase = async () => {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB connected');

    console.log('🗑️  Clearing existing data...');
    await Promise.all([
      Department.deleteMany({}),
      Resource.deleteMany({}),
      User.deleteMany({})
    ]);
    console.log('✅ Existing data cleared');

    console.log('📚 Inserting departments...');
    const insertedDepartments = await Department.insertMany(departments);
    console.log(`✅ Inserted ${insertedDepartments.length} departments`);

    console.log('👥 Creating users...');
    const hashedAdminPassword = await bcrypt.hash(adminUser.password, 10);
    const hashedUserPassword = await bcrypt.hash(regularUser.password, 10);

    const createdAdmin = await User.create({
      ...adminUser,
      password: hashedAdminPassword
    });

    const createdUser = await User.create({
      ...regularUser,
      password: hashedUserPassword
    });

    console.log('✅ Created admin user:', createdAdmin.email);
    console.log('✅ Created regular user:', createdUser.email);

    console.log('📄 Creating sample resources...');
    const sampleResources = [
      {
        title: "Data Structures & Algorithms - Complete Notes",
        description: "Comprehensive DSA notes covering arrays, linked lists, trees, graphs, and dynamic programming with examples.",
        department: "CSE",
        fileUrl: "https://drive.google.com/file/d/sample-dsa-notes/view",
        fileType: "pdf",
        category: "notes",
        semester: 4,
        subject: "Data Structures and Algorithms",
        tags: ["dsa", "algorithms", "notes", "sem4"],
        uploadedBy: createdUser._id,
        status: "approved",
        isVerified: true,
        downloads: 45,
        views: 120,
        rating: 4,
        ratingCount: 5
      },
      {
        title: "Structural Analysis - Previous Year Paper 2023",
        description: "Solved previous year paper for Structural Analysis with detailed explanations.",
        department: "Civil",
        fileUrl: "https://drive.google.com/file/d/sample-civil-paper/view",
        fileType: "pdf",
        category: "previous-papers",
        semester: 6,
        subject: "Structural Analysis",
        tags: ["civil", "exam", "2023", "structural"],
        uploadedBy: createdUser._id,
        status: "approved",
        isVerified: true,
        downloads: 38,
        views: 95,
        rating: 4,
        ratingCount: 4
      },
      {
        title: "Python Programming Lab Manual",
        description: "Complete lab manual with all Python programs for CSE students.",
        department: "CSE",
        fileUrl: "https://drive.google.com/file/d/sample-python-lab/view",
        fileType: "pdf",
        category: "lab-manual",
        semester: 3,
        subject: "Python Programming",
        tags: ["python", "lab", "programming", "sem3"],
        uploadedBy: createdUser._id,
        status: "approved",
        isVerified: true,
        downloads: 62,
        views: 150,
        rating: 5,
        ratingCount: 5
      },
      {
        title: "Thermodynamics Assignment Solutions",
        description: "Solved assignments for Thermodynamics course.",
        department: "Mechanical",
        fileUrl: "https://drive.google.com/file/d/sample-thermo/view",
        fileType: "pdf",
        category: "assignments",
        semester: 5,
        subject: "Thermodynamics",
        tags: ["mechanical", "thermodynamics", "assignments"],
        uploadedBy: createdUser._id,
        status: "pending",
        isVerified: false,
        downloads: 0,
        views: 5,
        rating: 4,
        ratingCount: 2
      }
    ];

    const insertedResources = await Resource.insertMany(sampleResources);
    console.log(`✅ Inserted ${insertedResources.length} sample resources`);

    console.log('\n✨ Database seeding completed successfully!\n');
    console.log('📊 Summary:');
    console.log(`   - Departments: ${insertedDepartments.length}`);
    console.log(`   - Resources: ${insertedResources.length}`);
    console.log(`   - Users: 2 (1 admin, 1 regular)`);
    console.log('\n🔐 Login Credentials:');
    console.log(`   Admin: ${adminUser.email} / ${adminUser.password}`);
    console.log(`   User: ${regularUser.email} / ${regularUser.password}`);
    console.log('\n⚠️  IMPORTANT: Change default passwords after first login!\n');

    process.exit(0);

  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
};

seedDatabase();
