import mongoose from "mongoose";
import { config } from "dotenv";
config();

import { AgencyModel } from "../src/modules/agencies/agencies.model";
import { UserModel } from "../src/modules/users/users.model";
import { PropertyModel } from "../src/modules/properties/properties.model";
import { LeadModel } from "../src/modules/leads/leads.model";
import { InteractionModel } from "../src/modules/interactions/interactions.model";
import { ReviewModel } from "../src/modules/reviews/reviews.model";
import { BlogModel } from "../src/modules/blogs/blogs.model";
import { AiAnalysisModel } from "../src/modules/ai/models/ai-analysis.model";
import { AiGeneratedCopyModel } from "../src/modules/ai/models/ai-copy.model";

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/plead";
const PICS_BASE = "https://picsum.photos/seed";

async function seed() {
  await mongoose.connect(MONGODB_URI);
  console.log("Connected to MongoDB");

  // ─── Clear existing data ───────────────────────────────────
  const collections = [
    "agencies", "users", "properties", "leads",
    "interactions", "reviews", "blogs",
    "aianalyses", "aigeneratedcopies",
  ];
  for (const c of collections) {
    await mongoose.connection.db?.dropCollection(c).catch((err: unknown) => {
      if ((err as { codeName?: string })?.codeName !== "NamespaceNotFound") {
        console.warn(`Failed to drop collection ${c}:`, (err as Error).message);
      }
    });
  }
  console.log("Cleared existing collections");

  // ─── Agency ────────────────────────────────────────────────
  const agency = await AgencyModel.create({
    name: "Sterling Realty",
    slug: "sterling-realty",
    logoUrl: "https://ui-avatars.com/api/?name=Sterling+Realty&background=2563EB&color=fff&size=128",
    plan: "pro",
  });
  console.log(`Agency created: ${agency.name} (${agency._id})`);

  // ─── Users (Clerk + MongoDB) ────────────────────────────────────────────────
  const { createClerkClient } = require("@clerk/express");
  const clerk = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });

  const demoAccounts = [
    { email: "admin@proplead.ai", password: "Admin123!", firstName: "Admin", lastName: "User", role: "admin", title: "Platform Administrator" },
    { email: "manager@proplead.ai", password: "Manager123!", firstName: "Sarah", lastName: "Mitchell", role: "manager", title: "Agency Manager", phone: "+1-555-0100" },
    { email: "agent@proplead.ai", password: "Agent123!", firstName: "James", lastName: "Chen", role: "agent", title: "Senior Real Estate Agent", phone: "+1-555-0101" },
  ];

  const usersData = [];
  for (const account of demoAccounts) {
    let clerkUser;
    const { data: existingUsers } = await clerk.users.getUserList({ emailAddress: [account.email] });
    if (existingUsers && existingUsers.length > 0) {
      clerkUser = existingUsers[0];
      await clerk.users.updateUser(clerkUser.id, { password: account.password });
    } else {
      clerkUser = await clerk.users.createUser({
        emailAddress: [account.email],
        password: account.password,
        firstName: account.firstName,
        lastName: account.lastName,
        skipPasswordChecks: true,
      });
    }

    usersData.push({
      clerkId: clerkUser.id,
      email: account.email,
      name: `${account.firstName} ${account.lastName}`,
      role: account.role as any,
      agencyId: agency._id,
      title: account.title,
      phone: account.phone,
      isActive: true,
    });
  }

  const users = await UserModel.insertMany(usersData);
  const [adminUser, managerUser, agentUser] = users;
  console.log(`Users created: ${users.map((u) => `${u.name} (${u.role})`).join(", ")}`);

  // ─── Properties ────────────────────────────────────────────
  const propertiesData = [
    {
      agencyId: agency._id,
      title: "Modern 3BR in Brooklyn Heights",
      slug: "modern-3br-brooklyn-heights",
      description: "Stunning modern three-bedroom apartment in the heart of Brooklyn Heights. Floor-to-ceiling windows with panoramic city views, chef's kitchen with Quartz countertops, and a private balcony. Building features a roof deck, fitness center, and 24/7 doorman.",
      price: 1250000,
      location: "Brooklyn Heights, NY",
      address: "150 Remsen St, Brooklyn, NY 11201",
      coordinates: { lat: 40.6944, lng: -73.9930 },
      images: [`${PICS_BASE}/prop1/400/300`, `${PICS_BASE}/prop1a/400/300`, `${PICS_BASE}/prop1b/400/300`],
      beds: 3,
      baths: 2,
      area: 1450,
      propertyType: "apartment",
      status: "available",
      features: ["Doorman", "Roof Deck", "Fitness Center", "Washer/Dryer", "Central AC", "Hardwood Floors"],
      assignedAgentId: agentUser._id,
      views: 342,
      inquiriesCount: 12,
      publishedAt: new Date("2026-06-01"),
    },
    {
      agencyId: agency._id,
      title: "Luxury Condo with River View",
      slug: "luxury-condo-river-view",
      description: "Exquisite luxury condo overlooking the East River. Floor-to-ceiling windows, custom Italian cabinetry, spa-inspired master bath with soaking tub. Residents enjoy access to private park, pool, and concierge services.",
      price: 2200000,
      location: "Manhattan, NY",
      address: "422 E 72nd St, New York, NY 10021",
      coordinates: { lat: 40.7669, lng: -73.9546 },
      images: [`${PICS_BASE}/prop2/400/300`, `${PICS_BASE}/prop2a/400/300`, `${PICS_BASE}/prop2b/400/300`],
      beds: 4,
      baths: 3,
      area: 2200,
      propertyType: "condo",
      status: "available",
      features: ["Concierge", "Pool", "Private Park", "Parking", "Storage", "Wine Cellar"],
      assignedAgentId: agentUser._id,
      views: 521,
      inquiriesCount: 18,
      publishedAt: new Date("2026-06-05"),
    },
    {
      agencyId: agency._id,
      title: "Cozy Studio, Downtown",
      slug: "cozy-studio-downtown",
      description: "Charming studio apartment in the heart of Downtown. Recently renovated with new appliances, exposed brick wall, and custom built-in shelving. Walking distance to subway, restaurants, and nightlife.",
      price: 450000,
      location: "Downtown, NY",
      address: "75 Wall St, New York, NY 10005",
      coordinates: { lat: 40.7055, lng: -74.0075 },
      images: [`${PICS_BASE}/prop3/400/300`, `${PICS_BASE}/prop3a/400/300`],
      beds: 0,
      baths: 1,
      area: 520,
      propertyType: "apartment",
      status: "available",
      features: ["Renovated", "Exposed Brick", "Laundry in Building", "Pets Allowed"],
      assignedAgentId: agentUser._id,
      views: 189,
      inquiriesCount: 7,
      publishedAt: new Date("2026-06-10"),
    },
    {
      agencyId: agency._id,
      title: "Family Home in Suburbs",
      slug: "family-home-suburbs",
      description: "Beautiful four-bedroom colonial in top-rated school district. Updated kitchen with granite counters, stainless steel appliances, large backyard with deck. Finished basement, attached garage, and mature landscaping.",
      price: 875000,
      location: "Scarsdale, NY",
      address: "42 Maple Dr, Scarsdale, NY 10583",
      coordinates: { lat: 40.9919, lng: -73.7840 },
      images: [`${PICS_BASE}/prop4/400/300`, `${PICS_BASE}/prop4a/400/300`, `${PICS_BASE}/prop4b/400/300`],
      beds: 4,
      baths: 2.5,
      area: 2800,
      propertyType: "house",
      status: "available",
      features: ["Garage", "Backyard", "Deck", "Finished Basement", "Central Vacuum", "Fireplace"],
      assignedAgentId: agentUser._id,
      views: 267,
      inquiriesCount: 9,
      publishedAt: new Date("2026-06-12"),
    },
    {
      agencyId: agency._id,
      title: "Beachfront Villa",
      slug: "beachfront-villa",
      description: "Stunning beachfront villa with private access to the sand. Open floor plan with panoramic ocean views, gourmet kitchen, infinity pool, and outdoor entertaining area. A rare opportunity for luxury coastal living.",
      price: 3500000,
      location: "The Hamptons, NY",
      address: "88 Ocean Rd, Southampton, NY 11968",
      coordinates: { lat: 40.8842, lng: -72.3903 },
      images: [`${PICS_BASE}/prop5/400/300`, `${PICS_BASE}/prop5a/400/300`],
      beds: 5,
      baths: 4,
      area: 4200,
      propertyType: "house",
      status: "available",
      features: ["Private Beach Access", "Infinity Pool", "Outdoor Kitchen", "Home Theater", "Wine Cellar", "Smart Home"],
      assignedAgentId: agentUser._id,
      views: 891,
      inquiriesCount: 34,
      publishedAt: new Date("2026-06-15"),
    },
    {
      agencyId: agency._id,
      title: "Modern Townhouse, Park Slope",
      slug: "modern-townhouse-park-slope",
      description: "Recently built modern townhouse in coveted Park Slope. Four stories with elevator, rooftop terrace, home office, and chef's kitchen. Smart home features throughout with integrated audio and lighting.",
      price: 2800000,
      location: "Park Slope, Brooklyn, NY",
      address: "255 5th Ave, Brooklyn, NY 11215",
      coordinates: { lat: 40.6737, lng: -73.9818 },
      images: [`${PICS_BASE}/prop6/400/300`, `${PICS_BASE}/prop6a/400/300`, `${PICS_BASE}/prop6b/400/300`],
      beds: 4,
      baths: 3.5,
      area: 3200,
      propertyType: "townhouse",
      status: "available",
      features: ["Elevator", "Rooftop Terrace", "Home Office", "Smart Home", "Garage", "Garden"],
      assignedAgentId: agentUser._id,
      views: 445,
      inquiriesCount: 15,
      publishedAt: new Date("2026-06-18"),
    },
    {
      agencyId: agency._id,
      title: "Commercial Space, Midtown",
      slug: "commercial-space-midtown",
      description: "Prime commercial space in Midtown Manhattan. Open floor plan ideal for office or retail. Recently renovated with modern HVAC, elevator access, and 24/7 building security. High foot traffic location.",
      price: 1500000,
      location: "Midtown, Manhattan, NY",
      address: "450 Lexington Ave, New York, NY 10017",
      coordinates: { lat: 40.7529, lng: -73.9755 },
      images: [`${PICS_BASE}/prop7/400/300`, `${PICS_BASE}/prop7a/400/300`],
      beds: 0,
      baths: 2,
      area: 1800,
      propertyType: "commercial",
      status: "available",
      features: ["Elevator", "24/7 Security", "HVAC", "Loading Dock", "Natural Light"],
      assignedAgentId: managerUser._id,
      views: 156,
      inquiriesCount: 5,
      publishedAt: new Date("2026-06-20"),
    },
    {
      agencyId: agency._id,
      title: "Land Parcel, Hudson Valley",
      slug: "land-parcel-hudson-valley",
      description: "Beautiful 5-acre land parcel in the scenic Hudson Valley. Zoned for residential development, with mature trees, stream frontage, and panoramic mountain views. Utilities available at street.",
      price: 320000,
      location: "Hudson Valley, NY",
      address: "100 Ridge Rd, Cold Spring, NY 10516",
      coordinates: { lat: 41.4188, lng: -73.9546 },
      images: [`${PICS_BASE}/prop8/400/300`, `${PICS_BASE}/prop8a/400/300`],
      beds: 0,
      baths: 0,
      area: 217800,
      propertyType: "land",
      status: "available",
      features: ["Stream Frontage", "Mountain Views", "Utilities Available", "Paved Road Access"],
      assignedAgentId: agentUser._id,
      views: 98,
      inquiriesCount: 3,
      publishedAt: new Date("2026-06-22"),
    },
  ];
  const properties = await PropertyModel.insertMany(propertiesData);
  console.log(`Properties created: ${properties.length}`);

  // ─── SOLD property (for variety) ───────────────────────────
  const soldProperty = await PropertyModel.create({
    agencyId: agency._id,
    title: "Classic Prewar, Upper West Side",
    slug: "classic-prewar-upper-west-side",
    description: "Beautiful prewar co-op on the Upper West Side. Original details including crown moldings, hardwood floors, and arched doorways. Updated kitchen and baths. Full-service building with gym and roof deck.",
    price: 1850000,
    location: "Upper West Side, NY",
    address: "300 Central Park West, New York, NY 10024",
    coordinates: { lat: 40.7896, lng: -73.9659 },
    images: [`${PICS_BASE}/prop9/400/300`, `${PICS_BASE}/prop9a/400/300`],
    beds: 3,
    baths: 2,
    area: 1600,
    propertyType: "apartment",
    status: "sold",
    features: ["Doorman", "Gym", "Roof Deck", "Storage", "Pet Friendly"],
    assignedAgentId: agentUser._id,
    views: 723,
    inquiriesCount: 28,
    publishedAt: new Date("2026-05-01"),
  });
  console.log(`Sold property created: ${soldProperty.title}`);

  // ─── Leads ────────────────────────────────────────────────
  const leadsData = [
    {
      agencyId: agency._id,
      name: "Sarah Johnson",
      email: "sarah.j@example.com",
      phone: "+1-555-1001",
      budget: 1300000,
      preferredLocation: "Brooklyn Heights",
      propertyType: "apartment",
      bedsDesired: 3,
      bathsDesired: 2,
      notes: "Looking for a modern apartment with good natural light. Prefers top floor units.",
      status: "qualified",
      source: "Website",
      assignedAgentId: agentUser._id,
      lastContactedAt: new Date("2026-06-24"),
    },
    {
      agencyId: agency._id,
      name: "Mark Thompson",
      email: "mark.t@example.com",
      phone: "+1-555-1002",
      budget: 2000000,
      preferredLocation: "Manhattan",
      propertyType: "condo",
      bedsDesired: 3,
      bathsDesired: 2,
      notes: "Interested in luxury buildings with concierge. Works in Midtown.",
      status: "contacted",
      source: "Realtor.com",
      assignedAgentId: agentUser._id,
      lastContactedAt: new Date("2026-06-23"),
    },
    {
      agencyId: agency._id,
      name: "Emily Rodriguez",
      email: "emily.r@example.com",
      phone: "+1-555-1003",
      budget: 900000,
      preferredLocation: "Scarsdale",
      propertyType: "house",
      bedsDesired: 4,
      bathsDesired: 2,
      notes: "Family with two kids. Good schools are the top priority.",
      status: "qualified",
      source: "Zillow",
      assignedAgentId: agentUser._id,
      lastContactedAt: new Date("2026-06-22"),
    },
    {
      agencyId: agency._id,
      name: "Michael Park",
      email: "michael.p@example.com",
      phone: "+1-555-1004",
      budget: 500000,
      preferredLocation: "Downtown",
      propertyType: "apartment",
      bedsDesired: 1,
      bathsDesired: 1,
      notes: "First-time buyer. Looking for a starter home or studio. Flexible on location.",
      status: "new",
      source: "Website",
      assignedAgentId: agentUser._id,
    },
    {
      agencyId: agency._id,
      name: "Jessica Lee",
      email: "jessica.l@example.com",
      phone: "+1-555-1005",
      budget: 3000000,
      preferredLocation: "The Hamptons",
      propertyType: "house",
      bedsDesired: 4,
      bathsDesired: 3,
      notes: "Looking for a vacation home. Must have water views and modern amenities.",
      status: "negotiating",
      source: "Referral",
      assignedAgentId: agentUser._id,
      lastContactedAt: new Date("2026-06-25"),
    },
    {
      agencyId: agency._id,
      name: "David Kim",
      email: "david.k@example.com",
      phone: "+1-555-1006",
      budget: 350000,
      preferredLocation: "Hudson Valley",
      propertyType: "land",
      bedsDesired: 0,
      notes: "Looking to build custom home. Wants at least 2 acres with views.",
      status: "new",
      source: "Google Ads",
      assignedAgentId: agentUser._id,
    },
    {
      agencyId: agency._id,
      name: "Lisa Wang",
      email: "lisa.w@example.com",
      phone: "+1-555-1007",
      budget: 750000,
      preferredLocation: "Park Slope",
      propertyType: "townhouse",
      bedsDesired: 3,
      bathsDesired: 2,
      notes: "Looking for a townhouse with outdoor space. Interested in fixer-uppers.",
      status: "contacted",
      source: "Website",
      assignedAgentId: agentUser._id,
      lastContactedAt: new Date("2026-06-20"),
    },
    {
      agencyId: agency._id,
      name: "Tom Baker",
      email: "tom.b@example.com",
      phone: "+1-555-1008",
      budget: 1200000,
      preferredLocation: "Upper West Side",
      propertyType: "apartment",
      bedsDesired: 2,
      bathsDesired: 2,
      notes: "Empty nester downsizing from a house in the suburbs.",
      status: "lost",
      source: "Realtor.com",
      assignedAgentId: agentUser._id,
      lastContactedAt: new Date("2026-06-01"),
    },
  ];
  const leads = await LeadModel.insertMany(leadsData);
  console.log(`Leads created: ${leads.length}`);

  // ─── Interactions ──────────────────────────────────────────
  const interactionsData = [
    {
      agencyId: agency._id,
      leadId: leads[0]._id,
      type: "call",
      notes: "Discussed the Brooklyn Heights property options. Sarah is very interested in the Modern 3BR.",
      outcome: "interested",
      performedById: agentUser._id,
    },
    {
      agencyId: agency._id,
      leadId: leads[0]._id,
      type: "email",
      notes: "Sent detailed floor plans and building information for 150 Remsen St.",
      outcome: "follow-up scheduled",
      performedById: agentUser._id,
    },
    {
      agencyId: agency._id,
      leadId: leads[1]._id,
      type: "call",
      notes: "Mark is interested in the Luxury Condo. Scheduled a viewing for next Thursday.",
      outcome: "interested",
      performedById: agentUser._id,
    },
    {
      agencyId: agency._id,
      leadId: leads[2]._id,
      type: "meeting",
      notes: "In-person walkthrough of the Scarsdale family home. Emily loved the backyard and kitchen.",
      outcome: "interested",
      performedById: agentUser._id,
    },
    {
      agencyId: agency._id,
      leadId: leads[2]._id,
      type: "email",
      notes: "Sent comps and school district reports for the Scarsdale area.",
      outcome: "follow-up scheduled",
      performedById: agentUser._id,
    },
    {
      agencyId: agency._id,
      leadId: leads[4]._id,
      type: "email",
      notes: "Sent beachfront villa listing details and recent similar sales in the Hamptons.",
      outcome: "interested",
      performedById: agentUser._id,
    },
    {
      agencyId: agency._id,
      leadId: leads[4]._id,
      type: "call",
      notes: "Jessica wants to schedule a weekend viewing. Discussed pricing and negotiation strategy.",
      outcome: "interested",
      performedById: agentUser._id,
    },
    {
      agencyId: agency._id,
      leadId: leads[6]._id,
      type: "email",
      notes: "Sent list of available townhouses in Park Slope within budget.",
      outcome: "follow-up scheduled",
      performedById: agentUser._id,
    },
    {
      agencyId: agency._id,
      leadId: leads[7]._id,
      type: "call",
      notes: "Tom decided to pause his search due to relocation. Will follow up in 3 months.",
      outcome: "not interested",
      performedById: agentUser._id,
    },
    {
      agencyId: agency._id,
      leadId: leads[5]._id,
      type: "email",
      notes: "Sent land parcel details and zoning information for Hudson Valley properties.",
      outcome: "follow-up scheduled",
      performedById: agentUser._id,
    },
  ];
  await InteractionModel.insertMany(interactionsData);
  console.log(`Interactions created: ${interactionsData.length}`);

  // ─── Reviews ──────────────────────────────────────────────
  const reviewsData = [
    {
      agencyId: agency._id,
      propertyId: properties[0]._id,
      userId: adminUser._id,
      rating: 5,
      title: "Excellent property, wonderful location",
      comment: "The Modern 3BR in Brooklyn Heights exceeded our expectations. Great layout, amazing views, and the building amenities are top-notch.",
      isVerified: true,
    },
    {
      agencyId: agency._id,
      propertyId: properties[1]._id,
      userId: adminUser._id,
      rating: 4,
      title: "Beautiful views but a bit pricey",
      comment: "The Luxury Condo has stunning river views and high-end finishes. The price is steep for the area, but the quality justifies it.",
      isVerified: true,
    },
    {
      agencyId: agency._id,
      propertyId: properties[2]._id,
      userId: adminUser._id,
      rating: 2,
      title: "Not as described",
      comment: "The studio was much smaller than the photos suggested. The exposed brick was nice but the building had maintenance issues.",
      isVerified: false,
    },
    {
      agencyId: agency._id,
      propertyId: properties[3]._id,
      userId: adminUser._id,
      rating: 5,
      title: "Perfect family home",
      comment: "The Scarsdale home is everything we wanted. Great schools, spacious yard, and the kitchen is gorgeous. Highly recommend!",
      isVerified: true,
    },
    {
      agencyId: agency._id,
      propertyId: properties[4]._id,
      userId: adminUser._id,
      rating: 1,
      title: "Spam review",
      comment: "Great property check out my website for deals",
      isVerified: false,
    },
    {
      agencyId: agency._id,
      propertyId: properties[5]._id,
      userId: adminUser._id,
      rating: 4,
      title: "Stunning townhouse with amazing rooftop",
      comment: "The Park Slope townhouse is beautifully designed. The rooftop terrace is incredible and the smart home features are very convenient.",
      isVerified: true,
    },
    {
      agencyId: agency._id,
      propertyId: properties[6]._id,
      userId: adminUser._id,
      rating: 3,
      title: "Good location but needs work",
      comment: "The commercial space has a great location but needs significant interior work. The building management is responsive though.",
      isVerified: true,
    },
  ];
  await ReviewModel.insertMany(reviewsData);
  console.log(`Reviews created: ${reviewsData.length}`);

  // ─── Blogs ────────────────────────────────────────────────
  const blogsData = [
    {
      agencyId: agency._id,
      title: "How AI is Transforming Real Estate Lead Management",
      slug: "ai-real-estate-lead-management",
      content: `The real estate industry has traditionally relied on manual processes for lead management — spreadsheets, sticky notes, and gut feelings. But that's changing rapidly. Artificial intelligence is transforming how agents qualify, prioritize, and convert leads.\n\nAI-powered lead scoring analyzes multiple data points simultaneously: budget, preferred location, property type, desired bedrooms, and even behavioral signals like email open rates and property page visits. The result is a ranked list of leads based on their likelihood to convert.\n\nPropLead's AI Match Engine takes this a step further. Instead of just scoring leads, it matches them against your actual property inventory. The AI considers budget fit, location preference, bedroom requirements, and property features to produce a comprehensive match score with detailed reasons.\n\nThe impact is measurable: agencies using AI-powered matching report a 40% reduction in lead-to-close time and a 25% increase in conversion rates.`,
      excerpt: "Discover how AI is revolutionizing lead management in real estate with smarter matching, automated scoring, and higher conversion rates.",
      coverImage: `${PICS_BASE}/blog1/800/400`,
      tags: ["AI", "Leads", "Technology"],
      authorId: managerUser._id,
      status: "published",
      publishedAt: new Date("2026-06-15"),
    },
    {
      agencyId: agency._id,
      title: "5 Tips for Closing More Deals in 2026",
      slug: "closing-more-deals-2026",
      content: `The real estate market in 2026 demands speed, precision, and personalization. Here are five proven strategies to close more deals this year.\n\n1. Use AI to Prioritize Leads: Not all leads are equal. Use AI-powered scoring to focus your energy on the highest-intent leads first.\n\n2. Personalize Every Interaction: Generic emails don't work. Use AI to generate personalized outreach that references specific properties and matches each lead's unique criteria.\n\n3. Respond Faster: Speed to lead is critical. Aim to respond within 5 minutes of an inquiry.\n\n4. Track Everything: Every call, email, and meeting should be logged. Use interaction tracking to remember details from previous conversations.\n\n5. Leverage Data: Use analytics to understand what's working. Which lead sources perform best? Which property types close fastest?`,
      excerpt: "Master the art of closing deals with these five actionable strategies for today's competitive real estate market.",
      coverImage: `${PICS_BASE}/blog2/800/400`,
      tags: ["Tips", "Sales", "Strategy"],
      authorId: managerUser._id,
      status: "published",
      publishedAt: new Date("2026-06-08"),
    },
    {
      agencyId: agency._id,
      title: "The Ultimate Guide to Property Marketing",
      slug: "property-marketing-guide",
      content: `Effective property marketing is the difference between a listing that sits for months and one that sells in days. Here's everything you need to know.\n\nHigh-quality photos are non-negotiable. Listings with professional photos sell 32% faster. But great photos are just the beginning. Today's buyers expect immersive experiences: virtual tours, detailed descriptions, and comprehensive feature lists.\n\nAI-generated property descriptions can save hours while maintaining quality. Provide the AI with key details (price, location, bedrooms, unique features) and it generates compelling copy in seconds.\n\nSocial media amplification is essential. Share listings across Instagram, Facebook, and LinkedIn with consistent branding.\n\nEmail marketing remains one of the most effective channels. Segment your list by buyer preferences and send personalized property recommendations.`,
      excerpt: "A complete guide to marketing properties effectively in the digital age, from photography to AI-powered copywriting.",
      coverImage: `${PICS_BASE}/blog3/800/400`,
      tags: ["Marketing", "Guide"],
      authorId: managerUser._id,
      status: "published",
      publishedAt: new Date("2026-05-25"),
    },
    {
      agencyId: agency._id,
      title: "Getting Started with PropLead",
      slug: "getting-started-proplead",
      content: `Welcome to PropLead! This guide will help you hit the ground running with your new AI-powered real estate lead engine.\n\nFirst, set up your team by inviting agents and assigning roles. Managers can view team performance, while agents focus on their assigned leads and properties.\n\nNext, import your property inventory. Use the bulk import feature or add properties one at a time. PropLead automatically generates SEO-friendly slugs and can even write AI-powered descriptions for each listing.\n\nThen, add your leads. Track their preferences, budget, and status as they move through your sales pipeline. The Kanban view makes it easy to see where every lead stands.\n\nFinally, leverage AI tools to match leads with properties, generate outreach emails, and create stunning property descriptions.`,
      excerpt: "New to PropLead? Follow this step-by-step guide to set up your agency, import properties, and start matching leads.",
      coverImage: `${PICS_BASE}/blog4/800/400`,
      tags: ["Guide", "Getting Started"],
      authorId: agentUser._id,
      status: "published",
      publishedAt: new Date("2026-05-01"),
    },
  ];
  await BlogModel.insertMany(blogsData);
  console.log(`Blogs created: ${blogsData.length}`);

  // ─── AI Analytics ───────────────────────────────────────────
  const aiTypes = ["lead-matching", "property-description", "outreach-email"] as const;
  const providers = ["gemini", "groq"];
  const aiAnalytics = [];
  for (let day = 0; day < 30; day++) {
    const date = new Date(Date.now() - day * 86400000);
    const count = Math.floor(Math.random() * 8) + 1;
    for (let i = 0; i < count; i++) {
      aiAnalytics.push({
        agencyId: agency._id,
        userId: agentUser._id,
        type: aiTypes[Math.floor(Math.random() * aiTypes.length)],
        input: { seed: `demo-${day}-${i}` },
        output: { result: "ok" },
        provider: providers[Math.floor(Math.random() * providers.length)],
        tokensUsed: Math.floor(Math.random() * 500) + 50,
        durationMs: Math.floor(Math.random() * 3000) + 200,
        success: Math.random() > 0.1,
        createdAt: date,
      });
    }
  }
  await AiAnalysisModel.insertMany(aiAnalytics);
  console.log(`AI analytics created: ${aiAnalytics.length}`);

  // ─── AI Generated Copies ──────────────────────────────────
  const aiCopies = [
    {
      agencyId: agency._id,
      userId: agentUser._id,
      type: "property-description" as const,
      propertyId: properties[0]._id,
      tone: "luxury",
      content: "Discover urban elegance at 150 Remsen Street. This meticulously designed three-bedroom residence offers panoramic views of the Brooklyn skyline through floor-to-ceiling windows. The chef's kitchen features Quartz countertops and premium stainless steel appliances. Residents enjoy world-class amenities including a roof deck, fitness center, and 24-hour doorman service.",
    },
    {
      agencyId: agency._id,
      userId: agentUser._id,
      type: "outreach-email" as const,
      propertyId: properties[0]._id,
      leadId: leads[0]._id,
      tone: "professional",
      content: "Dear Sarah,\n\nI hope this message finds you well. I came across a property that I believe matches your criteria perfectly.\n\nThe Modern 3BR in Brooklyn Heights offers exactly what you've been looking for: a sun-filled apartment with stunning views, modern finishes, and access to premier building amenities.\n\nI would love to schedule a private showing at your convenience. Please let me know what time works best for you.\n\nBest regards,\nJames Chen",
    },
  ];
  await AiGeneratedCopyModel.insertMany(aiCopies);
  console.log(`AI copies created: ${aiCopies.length}`);

  console.log("\n✅ Seed complete!");
  console.log(`\n📋 Summary:`);
  console.log(`   Agency:       ${agency.name}`);
  console.log(`   Users:        ${users.length} (admin, manager, agent)`);
  console.log(`   Properties:   ${properties.length + 1} (incl. 1 sold)`);
  console.log(`   Leads:        ${leads.length}`);
  console.log(`   Interactions: ${interactionsData.length}`);
  console.log(`   Reviews:      ${reviewsData.length}`);
  console.log(`   Blogs:        ${blogsData.length}`);
  console.log(`   AI Analytics: ${aiAnalytics.length}`);

  await mongoose.disconnect();
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
