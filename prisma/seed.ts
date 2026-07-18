import "dotenv/config";
import { PrismaClient, Role } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

const adapter = new PrismaPg(process.env.DATABASE_URL!);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Seeding database...");

  const hashedPassword = await bcrypt.hash("Admin123@", 12);

  const admin = await prisma.user.upsert({
    where: { email: "admin@fixitnow.com" },
    update: { password: hashedPassword },
    create: {
      name: "Admin User",
      email: "admin@fixitnow.com",
      password: hashedPassword,
      role: "ADMIN",
      phone: "+1234567890",
    },
  });
  console.log("Admin created:", admin.email);

  const customerPassword = await bcrypt.hash("Customer@123", 12);
  const customer = await prisma.user.upsert({
    where: { email: "john@example.com" },
    update: {},
    create: {
      name: "John Customer",
      email: "john@example.com",
      password: customerPassword,
      role: "CUSTOMER",
      phone: "+1234567891",
      address: "123 Main Street, New York, NY 10001",
    },
  });
  console.log("Customer created:", customer.email);

  const technicianPassword = await bcrypt.hash("Tech@12345", 12);
  const techUser = await prisma.user.upsert({
    where: { email: "mike@example.com" },
    update: {},
    create: {
      name: "Mike Technician",
      email: "mike@example.com",
      password: technicianPassword,
      role: "TECHNICIAN",
      phone: "+1234567892",
    },
  });

  const techProfile = await prisma.technicianProfile.upsert({
    where: { userId: techUser.id },
    update: {},
    create: {
      userId: techUser.id,
      bio: "Professional plumber with 10 years of experience. Licensed and insured.",
      experience: 10,
      hourlyRate: 75,
      skills: ["Plumbing", "Pipe Repair", "Water Heater Installation", "Drain Cleaning"],
      location: "New York, NY",
      serviceArea: "Manhattan, Brooklyn, Queens",
      isVerified: true,
      avgRating: 4.8,
      totalReviews: 2,
    },
  });
  console.log("Technician created:", techUser.email);

  const tech2User = await prisma.user.upsert({
    where: { email: "sarah@example.com" },
    update: {},
    create: {
      name: "Sarah Electrician",
      email: "sarah@example.com",
      password: technicianPassword,
      role: "TECHNICIAN",
      phone: "+1234567893",
    },
  });

  const tech2Profile = await prisma.technicianProfile.upsert({
    where: { userId: tech2User.id },
    update: {},
    create: {
      userId: tech2User.id,
      bio: "Certified electrician specializing in residential and commercial electrical work.",
      experience: 7,
      hourlyRate: 85,
      skills: ["Electrical Wiring", "Panel Upgrades", "Lighting Installation", "Safety Inspections"],
      location: "New York, NY",
      serviceArea: "Manhattan, Bronx",
      isVerified: true,
      avgRating: 4.5,
    },
  });

  const tech3User = await prisma.user.upsert({
    where: { email: "david@example.com" },
    update: {},
    create: {
      name: "David Cleaner",
      email: "david@example.com",
      password: technicianPassword,
      role: "TECHNICIAN",
      phone: "+1234567894",
    },
  });

  const tech3Profile = await prisma.technicianProfile.upsert({
    where: { userId: tech3User.id },
    update: {},
    create: {
      userId: tech3User.id,
      bio: "Professional cleaning service. Eco-friendly products. Satisfaction guaranteed.",
      experience: 5,
      hourlyRate: 45,
      skills: ["Deep Cleaning", "Office Cleaning", "Carpet Cleaning", "Window Cleaning"],
      location: "New York, NY",
      serviceArea: "All NYC Boroughs",
      isVerified: true,
      avgRating: 4.7,
    },
  });

  const tech4User = await prisma.user.upsert({
    where: { email: "lisa@example.com" },
    update: {},
    create: {
      name: "Lisa Painter",
      email: "lisa@example.com",
      password: technicianPassword,
      role: "TECHNICIAN",
      phone: "+1234567895",
    },
  });

  const tech4Profile = await prisma.technicianProfile.upsert({
    where: { userId: tech4User.id },
    update: {},
    create: {
      userId: tech4User.id,
      bio: "Interior and exterior painting specialist. Free estimates available.",
      experience: 8,
      hourlyRate: 65,
      skills: ["Interior Painting", "Exterior Painting", "Wallpaper Removal", "Pressure Washing"],
      location: "New York, NY",
      serviceArea: "Brooklyn, Queens, Staten Island",
      isVerified: true,
      avgRating: 4.9,
    },
  });

  const plumbingCategory = await prisma.category.upsert({
    where: { slug: "plumbing" },
    update: {},
    create: { name: "Plumbing", slug: "plumbing", description: "All plumbing repair and installation services", icon: "🔧" },
  });

  const electricalCategory = await prisma.category.upsert({
    where: { slug: "electrical" },
    update: {},
    create: { name: "Electrical", slug: "electrical", description: "Electrical repair, installation, and maintenance", icon: "⚡" },
  });

  const cleaningCategory = await prisma.category.upsert({
    where: { slug: "cleaning" },
    update: {},
    create: { name: "Cleaning", slug: "cleaning", description: "Professional home and office cleaning services", icon: "🧹" },
  });

  const paintingCategory = await prisma.category.upsert({
    where: { slug: "painting" },
    update: {},
    create: { name: "Painting", slug: "painting", description: "Interior and exterior painting services", icon: "🎨" },
  });

  console.log("Categories created");

  const s1 = await prisma.service.create({
    data: {
      title: "Leak Repair",
      description: "Fix leaking pipes, faucets, and toilets. Emergency service available.",
      price: 80,
      duration: 60,
      categoryId: plumbingCategory.id,
      techId: techProfile.id,
      location: "New York, NY",
    },
  });

  const s2 = await prisma.service.create({
    data: {
      title: "Water Heater Installation",
      description: "Professional installation of new water heaters. All brands supported.",
      price: 250,
      duration: 180,
      categoryId: plumbingCategory.id,
      techId: techProfile.id,
      location: "New York, NY",
    },
  });

  const s3 = await prisma.service.create({
    data: {
      title: "Drain Cleaning",
      description: "Clear clogged drains using professional-grade equipment.",
      price: 100,
      duration: 45,
      categoryId: plumbingCategory.id,
      techId: techProfile.id,
      location: "New York, NY",
    },
  });

  const s4 = await prisma.service.create({
    data: {
      title: "Electrical Panel Upgrade",
      description: "Upgrade your electrical panel for increased capacity and safety.",
      price: 500,
      duration: 240,
      categoryId: electricalCategory.id,
      techId: tech2Profile.id,
      location: "New York, NY",
    },
  });

  const s5 = await prisma.service.create({
    data: {
      title: "Lighting Installation",
      description: "Install new light fixtures, ceiling fans, and recessed lighting.",
      price: 150,
      duration: 90,
      categoryId: electricalCategory.id,
      techId: tech2Profile.id,
      location: "New York, NY",
    },
  });

  const s6 = await prisma.service.create({
    data: {
      title: "Deep Cleaning",
      description: "Thorough top-to-bottom cleaning of your entire home.",
      price: 200,
      duration: 240,
      categoryId: cleaningCategory.id,
      techId: tech3Profile.id,
      location: "New York, NY",
    },
  });

  const s7 = await prisma.service.create({
    data: {
      title: "Office Cleaning",
      description: "Regular or one-time office cleaning. Customizable schedules.",
      price: 150,
      duration: 120,
      categoryId: cleaningCategory.id,
      techId: tech3Profile.id,
      location: "New York, NY",
    },
  });

  const s8 = await prisma.service.create({
    data: {
      title: "Interior Painting",
      description: "Professional interior painting for rooms, hallways, and ceilings.",
      price: 300,
      duration: 360,
      categoryId: paintingCategory.id,
      techId: tech4Profile.id,
      location: "New York, NY",
    },
  });

  const s9 = await prisma.service.create({
    data: {
      title: "Exterior Painting",
      description: "Exterior house painting. Prep work and cleanup included.",
      price: 500,
      duration: 480,
      categoryId: paintingCategory.id,
      techId: tech4Profile.id,
      location: "New York, NY",
    },
  });

  console.log("Services created");

  await prisma.availability.createMany({
    data: [
      { techId: techProfile.id, dayOfWeek: 1, startTime: "08:00", endTime: "17:00" },
      { techId: techProfile.id, dayOfWeek: 2, startTime: "08:00", endTime: "17:00" },
      { techId: techProfile.id, dayOfWeek: 3, startTime: "08:00", endTime: "17:00" },
      { techId: techProfile.id, dayOfWeek: 4, startTime: "08:00", endTime: "17:00" },
      { techId: techProfile.id, dayOfWeek: 5, startTime: "08:00", endTime: "17:00" },
      { techId: tech2Profile.id, dayOfWeek: 1, startTime: "09:00", endTime: "18:00" },
      { techId: tech2Profile.id, dayOfWeek: 3, startTime: "09:00", endTime: "18:00" },
      { techId: tech2Profile.id, dayOfWeek: 5, startTime: "09:00", endTime: "18:00" },
      { techId: tech3Profile.id, dayOfWeek: 1, startTime: "07:00", endTime: "16:00" },
      { techId: tech3Profile.id, dayOfWeek: 2, startTime: "07:00", endTime: "16:00" },
      { techId: tech3Profile.id, dayOfWeek: 3, startTime: "07:00", endTime: "16:00" },
      { techId: tech3Profile.id, dayOfWeek: 4, startTime: "07:00", endTime: "16:00" },
      { techId: tech3Profile.id, dayOfWeek: 5, startTime: "07:00", endTime: "16:00" },
      { techId: tech4Profile.id, dayOfWeek: 1, startTime: "08:00", endTime: "18:00" },
      { techId: tech4Profile.id, dayOfWeek: 2, startTime: "08:00", endTime: "18:00" },
      { techId: tech4Profile.id, dayOfWeek: 4, startTime: "08:00", endTime: "18:00" },
      { techId: tech4Profile.id, dayOfWeek: 5, startTime: "08:00", endTime: "18:00" },
      { techId: tech4Profile.id, dayOfWeek: 6, startTime: "10:00", endTime: "15:00" },
    ],
    skipDuplicates: true,
  });
  console.log("Availability created");

  const booking1 = await prisma.booking.create({
    data: {
      customerId: customer.id,
      technicianId: techProfile.id,
      serviceId: s1.id,
      date: new Date("2026-07-20"),
      time: "09:00-10:00",
      address: "123 Main Street, New York, NY 10001",
      note: "Leaking kitchen faucet",
      status: "COMPLETED",
    },
  });

  const booking2 = await prisma.booking.create({
    data: {
      customerId: customer.id,
      technicianId: tech2Profile.id,
      serviceId: s5.id,
      date: new Date("2026-07-22"),
      time: "14:00-15:30",
      address: "456 Park Avenue, New York, NY 10022",
      note: "Install new chandelier in living room",
      status: "ACCEPTED",
    },
  });

  const booking3 = await prisma.booking.create({
    data: {
      customerId: customer.id,
      technicianId: tech3Profile.id,
      serviceId: s6.id,
      date: new Date("2026-07-25"),
      time: "08:00-12:00",
      address: "123 Main Street, New York, NY 10001",
      note: "Full apartment deep cleaning",
      status: "REQUESTED",
    },
  });

  console.log("Bookings created");

  await prisma.payment.create({
    data: {
      bookingId: booking1.id,
      userId: customer.id,
      amount: 80,
      provider: "STRIPE",
      status: "COMPLETED",
      stripePaymentIntentId: "pi_seed_demo_123",
      paidAt: new Date("2026-07-20"),
    },
  });
  console.log("Payments created");

  await prisma.review.create({
    data: {
      authorId: customer.id,
      bookingId: booking1.id,
      rating: 5,
      comment: "Excellent work! Mike fixed the leak quickly and professionally. Highly recommend!",
    },
  });
  console.log("Reviews created");

  console.log("Seed completed successfully!");
  console.log("\nCredentials:");
  console.log("Admin:    admin@fixitnow.com / Admin123@");
  console.log("Customer: john@example.com / Customer@123");
  console.log("Tech:     mike@example.com / Tech@12345");
  console.log("Tech2:    sarah@example.com / Tech@12345");
}

main()
  .catch((e) => {
    console.error("Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
