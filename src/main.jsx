import { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import './styles.css';
import { grantApi } from './api';

const schemes = [
  { id: 'sch-001', icon: '🌾', category: 'Agriculture', title: 'PM-KISAN Samman Nidhi', short: 'PM-KISAN', amount: '₹6,000 / year', desc: 'Direct income support of ₹6,000 per year in three equal installments for small and marginal landholder farmer families.', eligibility: ['Small/marginal landholder', 'Land Ownership Copy', 'Valid Aadhaar & Bank Passbook'], color: 'green', limit: 300000, categories: ['All'], docs: ['Land Ownership Copy', 'Aadhaar Card', 'Bank Passbook'] },
  { id: 'sch-002', icon: '☀️', category: 'Green Energy', title: 'PM Surya Ghar Free Electricity Scheme', short: 'PM Surya Ghar', amount: 'Up to ₹78,000', desc: 'Financial assistance for installing rooftop solar panel systems to promote renewable residential energy.', eligibility: ['Residential Homeowner', 'Electricity Bill & Roof Layout Plan', 'Valid Aadhaar Card'], color: 'yellow', limit: 800000, categories: ['All'], docs: ['Electricity Bill', 'Property Proof', 'Roof Layout Plan', 'Aadhaar Card'] },
  { id: 'sch-003', icon: '🏠', category: 'Housing', title: 'PMAY-Urban Housing Subsidy', short: 'PMAY-Urban', amount: 'Up to ₹2.67 Lakhs', desc: 'Credit-linked subsidy scheme for first-time home buyers constructing or purchasing urban houses.', eligibility: ['EWS, LIG, MIG categories', 'Max income up to ₹6 Lakhs', 'Property Papers & Income Cert'], color: 'terracotta', limit: 600000, categories: ['General', 'OBC', 'SC', 'ST'], docs: ['Income Certificate', 'Aadhaar Card', 'Property Papers', 'Bank Details'] },
  { id: 'sch-004', icon: '💼', category: 'MSME & Business', title: 'Pradhan Mantri Mudra Yojana (Shishu)', short: 'Mudra Shishu', amount: 'Up to ₹50,000', desc: 'Collateral-free loans and interest subvention subsidies for micro-enterprises and small business startups.', eligibility: ['Micro / Small startup business', 'Business Plan & ID Proof', 'Bank Statement'], color: 'blue', limit: 500000, categories: ['All'], docs: ['Business Plan', 'ID Proof', 'Address Proof', 'Bank Statement'] },
  { id: 'sch-005', icon: '🎓', category: 'Education', title: 'Post Matric Scholarship for SC Students', short: 'SC Scholarship', amount: 'Full Tuition + Stipend', desc: 'Financial assistance for SC students pursuing post-secondary education in recognized institutions.', eligibility: ['SC Category', 'Max income ₹2.5 Lakhs', 'College Admission & Marksheets'], color: 'purple', limit: 250000, categories: ['SC'], docs: ['SC Caste Certificate', 'Income Certificate', 'College Admission Slip', 'Marksheets'] },
  { id: 'sch-006', icon: '🛠️', category: 'Artisans & Crafts', title: 'PM Vishwakarma Yojana', short: 'PM Vishwakarma', amount: 'Up to ₹3.00 Lakhs', desc: 'Financial support, skill training, and tool-kit subsidies for traditional artisans and craftspeople.', eligibility: ['Traditional Artisans & Craftspeople', 'Artisan ID Card & Skill Cert', 'Valid Bank Account'], color: 'yellow', limit: 400000, categories: ['All'], docs: ['Artisan Identity Card', 'Aadhaar Card', 'Bank Account', 'Skill Certificate'] },
  { id: 'sch-007', icon: '💳', category: 'Agriculture', title: 'Kisan Credit Card (KCC) Subsidy', short: 'KCC Subsidy', amount: '3% Interest Subvention', desc: 'Concessional credit and interest subsidy on short-term crop loans for agricultural activities.', eligibility: ['Farmers & Cultivators', 'Land Records & Crop Details', 'Passport Photo & Aadhaar'], color: 'green', limit: 500000, categories: ['All'], docs: ['Land Records', 'Aadhaar Card', 'Crop Details', 'Passport Photo'] },
  { id: 'sch-008', icon: '🐄', category: 'Animal Husbandry', title: 'National Livestock Mission (NLM)', short: 'Livestock Mission', amount: '50% Capital Subsidy', desc: 'Capital subsidy for establishing poultry, sheep, goat, and piggery breeding units.', eligibility: ['Animal Husbandry Entrepreneurs', 'Land Proof & Project Report', 'Bank Account & Aadhaar'], color: 'terracotta', limit: 1000000, categories: ['All'], docs: ['Land Availability Proof', 'Project Report', 'Bank Account', 'Aadhaar'] },
  { id: 'sch-009', icon: '🚜', category: 'Agriculture', title: 'Sub-Mission on Agricultural Mechanization', short: 'Agri Mechanization', amount: '40% to 50% Subsidy', desc: 'Financial assistance for purchasing agricultural equipment, tractors, and harvesters.', eligibility: ['Active Farmers', 'Land RC Book & Tractor RC', 'Bank Passbook'], color: 'green', limit: 600000, categories: ['All'], docs: ['Land RC Book', 'Aadhaar Card', 'Tractor RC', 'Bank Passbook'] },
  { id: 'sch-010', icon: '🍲', category: 'Food Processing', title: 'PM Formalisation of Micro Food Processing (PMFME)', short: 'PMFME Scheme', amount: '35% Credit Subsidy', desc: 'Financial and technical support for upgrading micro-food processing enterprises.', eligibility: ['Micro Food Enterprises', 'FSSAI License & GST Registration', 'Project Report'], color: 'blue', limit: 800000, categories: ['All'], docs: ['FSSAI License', 'GST Registration', 'ID Proof', 'Project Report'] },
  { id: 'sch-011', icon: '🚀', category: 'Entrepreneurship', title: 'Stand-Up India Scheme', short: 'Stand-Up India', amount: 'Up to ₹1 Crore Loan', desc: 'Facilitates bank loans between ₹10 Lakhs and ₹1 Crore to SC/ST or women entrepreneurs for greenfield enterprises.', eligibility: ['SC / ST / Women Entrepreneurs', 'Greenfield Project Proposal', 'PAN Card & Bank Statement'], color: 'purple', limit: 1200000, categories: ['SC', 'ST', 'Women'], docs: ['Caste Certificate', 'Business Proposal', 'PAN Card', 'Bank Statement'] },
  { id: 'sch-012', icon: '⌂', category: 'Housing', title: 'PMAY-Gramin Rural Housing Subsidy', short: 'PMAY-Gramin', amount: '₹1.20L to ₹1.30L', desc: 'Direct financial grant for constructing permanent housing in rural areas.', eligibility: ['SC, ST, BPL Rural Households', 'No permanent pucca house', 'Ration Card & Site Photo'], color: 'terracotta', limit: 180000, categories: ['SC', 'ST', 'BPL'], docs: ['Ration Card', 'BPL Card', 'Site Photo', 'Aadhaar Card', 'Bank Details'] },
  { id: 'sch-013', icon: '🏫', category: 'Education', title: 'Central Sector Interest Subsidy (CSIS)', short: 'CSIS Education', amount: '100% Interest Subsidy', desc: 'Covers interest on education loans during the course duration for economically weaker section students.', eligibility: ['EWS Students', 'Max income ₹4.5 Lakhs', 'Education Loan Approval'], color: 'purple', limit: 450000, categories: ['General', 'OBC', 'SC', 'ST'], docs: ['Income Certificate', 'Education Loan Approval Letter', 'Admission Proof'] },
  { id: 'sch-014', icon: '🛒', category: 'Street Vendors', title: 'PM Street Vendor AtmaNirbhar Nidhi (PM SVANidhi)', short: 'PM SVANidhi', amount: 'Up to ₹50,000 + 7%', desc: 'Micro-credit collateral-free working capital loan scheme with interest subvention for urban street vendors.', eligibility: ['Urban Street Vendors', 'Vending Certificate / ULB ID', 'Aadhaar Card'], color: 'blue', limit: 300000, categories: ['All'], docs: ['Vending Certificate / Urban Livelihood ID Card', 'Aadhaar Card'] },
  { id: 'sch-015', icon: '⚡', category: 'Renewable Energy', title: 'Production Linked Incentive (PLI) for Solar PV', short: 'PLI Solar PV', amount: 'Capacity Based', desc: 'Incentive scheme encouraging high-efficiency solar PV module manufacturing in India.', eligibility: ['Solar Module Manufacturers', 'Manufacturing License & GSTIN', 'Technical Audit'], color: 'yellow', limit: 5000000, categories: ['All'], docs: ['Manufacturing License', 'GSTIN', 'Company PAN', 'Technical Audit'] },
  { id: 'sch-016', icon: '📜', category: 'Education', title: 'National Means-cum-Merit Scholarship (NMMSS)', short: 'NMMSS Merit', amount: '₹12,000 / year', desc: 'Financial support to meritorious students of economically weaker sections to arrest dropouts at class 8.', eligibility: ['Class 8 Students', 'Max income ₹3.5 Lakhs', 'Class 8 Marksheet & Income Cert'], color: 'purple', limit: 350000, categories: ['All'], docs: ['Class 8 Marksheet', 'Income Certificate', 'School ID Card'] },
  { id: 'sch-017', icon: '🛢️', category: 'Domestic Energy', title: 'Deepam Free LPG Cylinder Subsidy', short: 'Deepam LPG', amount: '100% for 3 Cylinders', desc: 'State-level subsidy providing free LPG cylinders to low-income household connections.', eligibility: ['BPL, SC, ST Households', 'LPG Consumer Number', 'Ration Card & Aadhaar'], color: 'yellow', limit: 200000, categories: ['SC', 'ST', 'BPL'], docs: ['Ration Card', 'LPG Consumer Number', 'Aadhaar Card', 'Bank Passbook'] },
  { id: 'sch-018', icon: '🐟', category: 'Fisheries', title: 'Pradhan Mantri Matsya Sampada Yojana (PMMSY)', short: 'PMMSY Fisheries', amount: '40% to 60% Subsidy', desc: 'Financial assistance for fish farming, pond construction, and biofloc aquaculture units.', eligibility: ['Fish Farmers & Aquaculture Units', 'Fisherman License / Land Record', 'Project Cost Sheet'], color: 'blue', limit: 600000, categories: ['All'], docs: ['Fisherman License / Land Record', 'Aadhaar Card', 'Project Cost Sheet'] },
  { id: 'sch-019', icon: '📈', category: 'MSME', title: 'PM Employment Generation Programme (PMEGP)', short: 'PMEGP Scheme', amount: '15% to 35% Margin', desc: 'Credit-linked subsidy program for generating self-employment through non-farm micro-enterprises.', eligibility: ['Self-employment Entrepreneurs', 'EDP Training Certificate', 'Detailed Project Report'], color: 'blue', limit: 500000, categories: ['All'], docs: ['EDP Training Certificate', 'Detailed Project Report', 'Caste Certificate'] },
  { id: 'sch-020', icon: '☀️', category: 'Solar Energy', title: 'PM Kusum Yojana (Component C)', short: 'PM Kusum Solar', amount: 'Up to 60% Pump Subsidy', desc: 'Subsidized solarization of agricultural water pumps for off-grid irrigation access.', eligibility: ['Agricultural Farmers', 'Borewell & Land Certificate', 'Aadhaar Card'], color: 'yellow', limit: 600000, categories: ['All'], docs: ['Agricultural Land Document', 'Borewell Certificate', 'Aadhaar Card'] },
  { id: 'sch-021', icon: '🚗', category: 'EV / Green Tech', title: 'National Electric Mobility Mission (FAME II)', short: 'FAME II EV', amount: 'Up to ₹1.5 Lakhs', desc: 'Incentive subsidy on the purchase of two-wheeler, three-wheeler, and four-wheeler electric vehicles.', eligibility: ['EV Buyers', 'Valid Driving License', 'Vehicle Invoice & Aadhaar'], color: 'green', limit: 1000000, categories: ['All'], docs: ['Aadhaar Card', 'Driving License', 'Vehicle Registration Invoice'] },
  { id: 'sch-022', icon: '🎓', category: 'Education', title: 'Post Matric Scholarship for OBC Students', short: 'OBC Scholarship', amount: 'Full Tuition Support', desc: 'Financial grant supporting post-matriculation higher education for students belonging to OBC categories.', eligibility: ['OBC Category', 'Max income ₹2.5 Lakhs', 'OBC Cert & College Marksheets'], color: 'purple', limit: 250000, categories: ['OBC'], docs: ['OBC Certificate', 'Income Certificate', 'College Marksheet', 'ID Proof'] },
  { id: 'sch-023', icon: '🎋', category: 'Agriculture', title: 'National Bamboo Mission Subsidy', short: 'Bamboo Mission', amount: '50% Plantation Cost', desc: 'Subsidizes commercial bamboo plantation and bamboo-based industry processing units.', eligibility: ['Bamboo Cultivators & Units', 'Land Records & Forest Permission', 'Bank Passbook'], color: 'green', limit: 500000, categories: ['All'], docs: ['Land Records', 'Forest Permission', 'Bank Passbook', 'Aadhaar'] },
  { id: 'sch-024', icon: '💊', category: 'Healthcare / Business', title: 'Pradhan Mantri Bharatiya Janaushadhi Kendra Grant', short: 'Janaushadhi Kendra', amount: 'Up to ₹5 Lakhs Incentive', desc: 'Financial incentive for opening generic medicine dispensaries across towns and villages.', eligibility: ['D.Pharm / B.Pharm Degree Holders', 'Shop Lease Agreement', 'PAN & Aadhaar'], color: 'purple', limit: 800000, categories: ['All'], docs: ['D.Pharm / B.Pharm Degree', 'Shop Lease Agreement', 'PAN', 'Aadhaar'] },
  { id: 'sch-025', icon: '💧', category: 'Agriculture', title: 'State Micro-Irrigation Scheme (Drip/Sprinkler)', short: 'Micro-Irrigation', amount: '75% to 90% Subsidy', desc: 'Subsidy for installing drip and sprinkler irrigation units to conserve groundwater.', eligibility: ['Farming Landowners', 'Land Adangal / 7-12 Extract', 'Water Source Proof'], color: 'green', limit: 400000, categories: ['All'], docs: ['Land Adangal/7-12 Extract', 'Electricity Bill', 'Water Source Proof'] },
  { id: 'sch-026', icon: '👴', category: 'Social Security', title: 'Atal Pension Yojana (Co-Contribution Subsidy)', short: 'Atal Pension', amount: '50% or ₹1,000 / year', desc: 'Pension guarantee scheme with government co-contribution for unorganized sector workers.', eligibility: ['Unorganized Sector Workers', 'Age 18 to 40', 'Active Savings Bank Account'], color: 'terracotta', limit: 250000, categories: ['All'], docs: ['Aadhaar Card', 'Active Savings Bank Account', 'Mobile Number'] },
  { id: 'sch-027', icon: '🧪', category: 'Agriculture', title: 'Soil Health Card Scheme', short: 'Soil Health Card', amount: '100% Free Testing', desc: 'Free soil testing and customized crop nutrient advice for agricultural holdings.', eligibility: ['Agricultural Landholders', 'Land Record Copy', 'Sample Location Details'], color: 'green', limit: 1000000, categories: ['All'], docs: ['Land Record Copy', 'Aadhaar Card', 'Sample Location Details'] },
  { id: 'sch-028', icon: '⛽', category: 'Energy / Health', title: 'Pradhan Mantri Ujjwala Yojana (PMUY)', short: 'PM Ujjwala', amount: 'Free Connection + ₹1.6K', desc: 'Provides deposit-free LPG gas connections to adult women from low-income households.', eligibility: ['Adult Women in BPL/SC/ST', 'BPL Ration Card', 'Bank Account Details'], color: 'yellow', limit: 200000, categories: ['SC', 'ST', 'BPL'], docs: ['BPL Ration Card', 'Aadhaar Card', 'Bank Account Details'] },
  { id: 'sch-029', icon: '🧶', category: 'Textiles', title: 'Textile Technology Upgradation Scheme (ATTUS)', short: 'ATTUS Textile', amount: '10% to 15% Subsidy', desc: 'Capital subsidy on purchasing modern textile manufacturing equipment.', eligibility: ['Textile Manufacturers', 'Factory License & Machinery Invoice', 'GSTIN Registration'], color: 'purple', limit: 1500000, categories: ['All'], docs: ['Factory License', 'Machinery Invoice', 'GSTIN', 'Company Registration'] },
  { id: 'sch-030', icon: '🎨', category: 'Handicrafts', title: 'Ambedkar Hastshilp Vikas Yojana', short: 'Hastshilp Vikas', amount: 'Toolkits + 100% Grant', desc: 'Mobilization, skill development, and production assistance for handicraft artisans.', eligibility: ['SC/ST/OBC Handicraft Artisans', 'Artisan Card & Caste Cert', 'Bank Passbook'], color: 'terracotta', limit: 300000, categories: ['SC', 'ST', 'OBC'], docs: ['Artisan Card', 'Caste Certificate', 'Aadhaar Card', 'Bank Passbook'] },
  { id: 'sch-031', icon: '👩‍🏫', category: 'Women Empowerment', title: 'Support to Training and Employment Programme (STEP)', short: 'STEP Women', amount: 'Free Skill + Stipend', desc: 'Provides skills training to women to enable them to become self-employed entrepreneurs.', eligibility: ['Women Candidates (Age 16-55)', 'Residence Certificate', 'Aadhaar Card'], color: 'purple', limit: 200000, categories: ['All'], docs: ['Age Proof', 'Residence Certificate', 'Aadhaar Card', 'Bank Account'] },
  { id: 'sch-032', icon: '🪴', category: 'Horticulture', title: 'National Horticulture Mission (NHM)', short: 'Horticulture NHM', amount: '40% to 50% Subsidy', desc: 'Financial aid for greenhouse construction, cold storage, and high-value fruit/vegetable farming.', eligibility: ['Horticulture Farmers', 'Land Documents & Water Test Report', 'Aadhaar Card'], color: 'green', limit: 800000, categories: ['All'], docs: ['Land Documents', 'Soil & Water Test Report', 'Aadhaar Card'] },
  { id: 'sch-033', icon: '👥', category: 'Rural Development', title: 'National Rural Livelihood Mission (NRLM SHG)', short: 'NRLM SHG', amount: 'Subvention to 4% p.a.', desc: 'Interest subsidy on bank loans accessed by rural women Self Help Groups.', eligibility: ['Women Self Help Groups (SHGs)', 'SHG Resolution Copy', 'Active Bank Account'], color: 'terracotta', limit: 300000, categories: ['Women SHGs'], docs: ['SHG Resolution Copy', 'Bank Account Details', 'Aadhaar Cards'] },
  { id: 'sch-034', icon: '💡', category: 'Startups', title: 'Technology Incubation Grant (Startup India)', short: 'Startup Seed Grant', amount: 'Up to ₹20 Lakhs Seed', desc: 'Grant funding for early-stage tech startups for proof of concept and prototype development.', eligibility: ['DPIIT Recognized Startups', 'Pitch Deck & Incubator Cert', 'Age 18+ Founders'], color: 'blue', limit: 1000000, categories: ['All'], docs: ['DPIIT Startup Recognition', 'Pitch Deck', 'Incubator Certificate'] },
  { id: 'sch-035', icon: '❄️', category: 'Agri-Logistics', title: 'Central Sector Scheme for Cold Chain Infrastructure', short: 'Agri Cold Chain', amount: '35% to 50% Grant', desc: 'Financial grant for building integrated cold chains, reefer vans, and pack houses.', eligibility: ['Agri-logistics Infrastructure Builders', 'Detailed Project Report', 'Bank Sanction Letter'], color: 'blue', limit: 2000000, categories: ['All'], docs: ['Detailed Project Report', 'Land Deed', 'Bank Sanction Letter'] },
  { id: 'sch-036', icon: '🏬', category: 'Urban Self-Employment', title: 'Deendayal Antyodaya Yojana (DAY-NULM)', short: 'DAY-NULM Urban', amount: 'Interest Subvention >7%', desc: 'Interest subsidy on bank credit for urban poor individuals or groups setting up micro-enterprises.', eligibility: ['Urban Poor Individuals/Groups', 'Urban Poor Cert / Ration Card', 'Project Plan'], color: 'blue', limit: 300000, categories: ['Urban Poor'], docs: ['Urban Poor Certificate / Ration Card', 'ID Proof', 'Project Plan'] },
  { id: 'sch-037', icon: '🛺', category: 'Clean Transportation', title: 'E-Rickshaw Purchase Subsidy', short: 'E-Rickshaw Subsidy', amount: 'Up to ₹30,000 Direct', desc: 'Direct cash subsidy given to commercial drivers purchasing zero-emission battery electric rickshaws.', eligibility: ['Commercial Drivers', 'Commercial Driving License', 'Vehicle Purchase Invoice'], color: 'green', limit: 400000, categories: ['All'], docs: ['Commercial Driving License', 'Aadhaar Card', 'Vehicle Invoice'] },
  { id: 'sch-038', icon: '🧵', category: 'Women Welfare', title: 'Free Silai Machine (Sewing Machine) Scheme', short: 'Free Silai Machine', amount: 'Free Sewing Machine', desc: 'Distributes free sewing machines to economically weak women to encourage home-based self-employment.', eligibility: ['Economically Weak Women (Age 20-40)', 'Max Income ₹1.44 Lakhs', 'Income Cert & Age Proof'], color: 'purple', limit: 144000, categories: ['All'], docs: ['Income Certificate', 'Passport Photo', 'Aadhaar Card', 'Age Proof'] },
  { id: 'sch-039', icon: '🐛', category: 'Agriculture', title: 'Silk Samagra 2 - Sericulture Subsidy', short: 'Silk Samagra', amount: '50% Mulberry Grant', desc: 'Grant funding for mulberry cultivation, silkworm rearing equipment, and silk reeling units.', eligibility: ['Sericulture Farmers', 'Land Records & Sericulture Cert', 'Aadhaar Card'], color: 'green', limit: 500000, categories: ['All'], docs: ['Land Records', 'Sericulture Training Certificate', 'Aadhaar Card'] },
  { id: 'sch-040', icon: '🥛', category: 'Dairy Sector', title: 'Dairy Entrepreneurship Development Scheme (DEDS)', short: 'DEDS Dairy', amount: '25% to 33.33% Subsidy', desc: 'Capital assistance for buying high-yielding milch cows/buffaloes and setting up milk chilling units.', eligibility: ['Dairy Farmers & Entrepreneurs', 'Cattle Shed Land Proof', 'Bank Sanction Letter'], color: 'terracotta', limit: 600000, categories: ['All'], docs: ['Cattle Shed Land Proof', 'Bank Sanction Letter', 'Caste Certificate'] },
  { id: 'sch-041', icon: '🌿', category: 'Agriculture', title: 'National Ayush Mission (Herbal Farming Grant)', short: 'Ayush Herbal Grant', amount: '30% to 75% Grant', desc: 'Subsidizes the cultivation of medicinal and aromatic plants across designated agro-climatic zones.', eligibility: ['Medicinal Plant Cultivators', 'Land Documents & Contract Proof', 'Aadhaar Card'], color: 'green', limit: 600000, categories: ['All'], docs: ['Land Documents', 'Buyback Agreement / Contract Proof', 'Aadhaar'] },
  { id: 'sch-042', icon: '👷', category: 'Skill Development', title: 'National Apprenticeship Promotion Scheme (NAPS)', short: 'NAPS Apprenticeship', amount: '25% Stipend Subsidy', desc: 'Government co-shares stipend costs paid by employers to apprentices during workplace skill training.', eligibility: ['Apprentices (Age 14-35)', '10th/12th/ITI Marksheet', 'Bank Account Details'], color: 'blue', limit: 500000, categories: ['All'], docs: ['10th/12th/ITI Marksheet', 'Aadhaar Card', 'Bank Account Details'] },
  { id: 'sch-043', icon: '🌾', category: 'Agriculture', title: 'Organic Farming Scheme (PKVY)', short: 'PKVY Organic', amount: '₹50,000 / hectare', desc: 'Financial assistance for organic inputs, certification, and eco-friendly packing/marketing.', eligibility: ['Organic Cluster Farmers', 'Land Ownership Copy', 'Cluster Membership Proof'], color: 'green', limit: 500000, categories: ['All'], docs: ['Land Ownership Copy', 'Cluster Membership Proof', 'Aadhaar Card'] },
  { id: 'sch-044', icon: '🐝', category: 'Agriculture', title: 'National Bee Keeping & Honey Mission (NBHM)', short: 'NBHM Beekeeping', amount: '50% Beehive Subsidy', desc: 'Promotes scientific beekeeping for honey production and crop pollination enhancement.', eligibility: ['Beekeepers & Agri Farmers', 'Beekeeping Training Cert', 'Land/Plot Consent'], color: 'yellow', limit: 500000, categories: ['All'], docs: ['Beekeeping Training Certificate', 'Land/Plot Consent', 'Aadhaar Card'] },
  { id: 'sch-045', icon: '🏛️', category: 'Education & Infrastructure', title: 'Pradhan Mantri Jan Vikas Karyakram (PMJVK)', short: 'PMJVK Minority', amount: 'Up to 100% Grant', desc: 'Supports educational, skill development, and healthcare infrastructure in minority-concentrated regions.', eligibility: ['Minority Community Students & Inst', 'Minority Community Cert', 'Income Certificate'], color: 'purple', limit: 300000, categories: ['Minorities'], docs: ['Minority Community Certificate', 'Student ID Card', 'Income Certificate'] },
  { id: 'sch-046', icon: '🔋', category: 'Green Transport', title: 'State Electric Auto Swappable Battery Subsidy', short: 'E-Auto Battery', amount: 'Up to ₹50,000', desc: 'State-level subsidy for purchasing electric auto-rickshaws with swappable battery support.', eligibility: ['Commercial E-Auto Drivers', 'Commercial Auto Permit', 'Purchase Receipt'], color: 'green', limit: 500000, categories: ['All'], docs: ['Commercial Auto Permit', 'Aadhaar Card', 'Purchase Receipt'] },
  { id: 'sch-047', icon: '🧊', category: 'Agri Infrastructure', title: 'PM-KUSUM Solar Cold Storage Grant', short: 'Solar Cold Storage', amount: 'Up to 50% Grant', desc: 'Financial grant for building micro solar-powered cold storages at rural farm gates.', eligibility: ['Agri Infrastructure Farmers', 'Land Record & Project Cost', 'Electricity Details'], color: 'yellow', limit: 1000000, categories: ['All'], docs: ['Land Record', 'Project Cost Estimate', 'Electricity Connection Details'] },
  { id: 'sch-048', icon: '🎓', category: 'Skill Development', title: 'Pradhan Mantri Kaushal Vikas Yojana (PMKVY 4.0)', short: 'PMKVY 4.0', amount: '100% Free + Stipend', desc: 'Industry-relevant skill training and government certification for unemployed youth.', eligibility: ['Unemployed Youth (Age 15-45)', 'School Leaving Cert / Marksheet', 'Aadhaar Card'], color: 'blue', limit: 800000, categories: ['All'], docs: ['School Leaving Certificate / Marksheet', 'Aadhaar Card', 'Bank Details'] },
  { id: 'sch-049', icon: '☣️', category: 'Clean Energy', title: 'Biogas Power Generation & Thermal Energy Scheme', short: 'Biogas Energy', amount: 'Up to ₹25,000 / Plant', desc: 'Financial support for installing family-sized or community biogas plants using organic farm waste.', eligibility: ['Rural Households & Communities', 'Cattle Possession Cert', 'Land Document'], color: 'yellow', limit: 500000, categories: ['All'], docs: ['Land Document', 'Cattle Possession Certificate', 'Aadhaar Card'] },
  { id: 'sch-050', icon: '🎓', category: 'Agri Entrepreneurship', title: 'Agri-Clinics and Agri-Business Centres (ACABC)', short: 'ACABC Scheme', amount: '36% to 44% Subsidy', desc: 'Subsidy on bank loans for agricultural graduates setting up custom hiring centers and agri-clinics.', eligibility: ['Agri Graduates / Diplomates', 'Degree/Diploma in Agriculture', 'Project Report'], color: 'blue', limit: 800000, categories: ['All'], docs: ['Degree/Diploma in Agriculture or Allied Science', 'Project Report'] }
];

const blankProfile = { name: '', dob: '', gender: '', mobile: '', aadhaar: '', category: '', income: '', employment: '', state: '', district: '', village: '', bank: '', ifsc: '' };
const demoProfile = { name: 'Asha Ramesh Patil', dob: '1993-08-18', gender: 'Female', mobile: '9876543210', aadhaar: 'XXXX XXXX 4812', category: 'OBC', income: '180000', employment: 'Farmer', state: 'Maharashtra', district: 'Pune', village: 'Khed', bank: '245710003456', ifsc: 'SBIN0000456' };

function extractAmountNumber(amountStr, fallbackStr = '') {
  if (!amountStr && !fallbackStr) return 0;
  let target = amountStr || '';
  if (target.includes('Stage') && target.includes('%') && !target.includes('₹')) {
    target = fallbackStr || '';
  }
  if (!target) target = fallbackStr || '';

  const match = target.match(/(?:₹\s*|\b)([0-9,]+)/);
  if (match && match[1]) {
    const cleanNum = parseInt(match[1].replace(/,/g, ''), 10);
    if (!isNaN(cleanNum) && cleanNum > 0) return cleanNum;
  }
  
  const digits = target.replace(/[^0-9]/g, '');
  const parsed = parseInt(digits, 10);
  return (!isNaN(parsed) && parsed > 0) ? parsed : 0;
}

function App() {
  const [portalMode, setPortalMode] = useState('beneficiary');
  const [screen, setScreen] = useState('login');
  const [profile, setProfile] = useState(blankProfile);
  const [login, setLogin] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [applications, setApplications] = useState([]);
  const [fundsReceived, setFundsReceived] = useState(0);
  const [notice, setNotice] = useState('');
  const [criteria, setCriteria] = useState(null);
  const applied = id => applications.find(a => a.schemeId === id);
  const activeApplication = useMemo(() => applications[0], [applications]);

  const demo = async () => { 
    try { await grantApi.resetDemo(); } catch {}
    setProfile(demoProfile); 
    setLogin('9876543210'); 
    setApplications([]);
    setFundsReceived(0);
    setNotice('Welcome Asha Ramesh Patil! Select any of the 50 schemes below to apply and demonstrate the 3-stage approval & disbursement workflow to your teacher.');
    setScreen('dashboard'); 
  };
  const saveProfile = e => { e.preventDefault(); setScreen('dashboard'); setNotice('Your beneficiary profile has been saved.'); };

  const handleDisbursementUpdate = (releasedAmount) => {
    setFundsReceived(prev => prev + releasedAmount);
    setApplications(prev => prev.map((a, i) => i === 0 ? { ...a, stage: 3, status: 'DISBURSED' } : a));
    setNotice(`🎉 Direct Benefit Transfer (DBT) of ₹${releasedAmount.toLocaleString('en-IN')} has been credited to your bank account!`);
  };

  const handleStageAdvance = (newStage, newStatus) => {
    setApplications(prev => prev.map((a, i) => i === 0 ? { ...a, stage: newStage, status: newStatus } : a));
  };
  
  const apply = async schemeId => {
    if (applied(schemeId)) { setScreen('tracking'); return; }
    const scheme = schemes.find(s => s.id === schemeId);
    const limit = scheme.limit || 500000;
    const allowedCategories = scheme.categories || ['All'];
    const docs = scheme.docs || ['Aadhaar Card', 'Bank Passbook'];
    
    const local = { 
      incomeEligible: Number(profile.income || 0) <= limit, 
      categoryEligible: allowedCategories.includes('All') || allowedCategories.includes(profile.category), 
      maxIncomeLimit: limit, 
      allowedCategories, 
      requiredDocuments: docs, 
      missingDocuments: [] 
    };
    local.eligible = local.incomeEligible && local.categoryEligible; 
    local.message = local.eligible ? 'You meet the scheme profile criteria.' : 'Your current profile does not meet the scheme criteria.';
    
    try { 
      const numericId = parseInt(schemeId.replace('sch-', ''), 10);
      setCriteria({ scheme, result: await grantApi.validateCriteria(numericId, profile.id || 1, docs) }); 
    } catch { 
      setCriteria({ scheme, result: local }); 
    }
  };

  const checkCriteria = async scheme => {
    const limit = scheme.limit || 500000;
    const allowedCategories = scheme.categories || ['All'];
    const docs = scheme.docs || ['Aadhaar Card', 'Bank Passbook'];
    
    const local = { 
      incomeEligible: Number(profile.income || 0) <= limit, 
      categoryEligible: allowedCategories.includes('All') || allowedCategories.includes(profile.category), 
      maxIncomeLimit: limit, 
      allowedCategories, 
      requiredDocuments: docs, 
      missingDocuments: [], 
      message: 'You meet the scheme profile criteria.' 
    };
    local.eligible = local.incomeEligible && local.categoryEligible;
    try { 
      const numericId = parseInt(scheme.id.replace('sch-', ''), 10);
      setCriteria({ scheme, result: await grantApi.validateCriteria(numericId, profile.id || 1, docs) }); 
    } catch { 
      setCriteria({ scheme, result: local }); 
    }
  };

  const confirmApplication = async () => { 
    const scheme = criteria.scheme; 
    const docs = scheme.docs || ['Aadhaar Card', 'Bank Passbook'];
    try { 
      const numericId = parseInt(scheme.id.replace('sch-', ''), 10);
      await grantApi.submitApplication(profile.id || 1, numericId, docs); 
    } catch {} 
    setCriteria(null); 
    setApplications([{ schemeId: scheme.id, stage: 0, applied: '07 Sep 2026', ref: `DSG-2026-0907-${Math.floor(100 + Math.random() * 900)}` }, ...applications]); 
    setNotice('Application submitted successfully. You can track its progress below.'); 
    setScreen('tracking'); 
  };

  if (portalMode === 'admin') {
    return <AdminPortal setPortalMode={setPortalMode} onDisbursementUpdate={handleDisbursementUpdate} onStageAdvance={handleStageAdvance} />;
  }

  if (screen === 'login') return (
    <div className="portal-container">
      <div className="top-portal-switch">
        <div className="switch-info">
          <span className="brand-dot">✦</span>
          <b>JanSetu Digital Subsidy & Grant Platform</b>
          <span className="capstone-badge">Infosys Springboard</span>
        </div>
        <div className="switch-actions">
          <button className="portal-switch-btn active">👤 Beneficiary Portal</button>
          <button className="portal-switch-btn admin" onClick={() => setPortalMode('admin')}>🏛️ Official Officer Portal →</button>
        </div>
      </div>
      <Login login={login} setLogin={setLogin} demo={demo} setPortalMode={setPortalMode} enter={() => { setProfile(p => ({ ...p, mobile: login })); setScreen('profile'); }} />
    </div>
  );

  const app = activeApplication;
  const appScheme = schemes.find(s => s.id === app?.schemeId) || schemes[0];
  return (
    <div className="portal-container">
      <div className="top-portal-switch">
        <div className="switch-info">
          <span className="brand-dot">✦</span>
          <b>JanSetu Digital Subsidy & Grant Platform</b>
          <span className="capstone-badge">Infosys Springboard</span>
        </div>
        <div className="switch-actions">
          <button className="portal-switch-btn active">👤 Beneficiary Portal</button>
          <button className="portal-switch-btn admin" onClick={() => setPortalMode('admin')}>🏛️ Official Officer Portal →</button>
        </div>
      </div>
      <div className="app-shell">
        <Sidebar screen={screen} setScreen={setScreen} menuOpen={menuOpen} setMenuOpen={setMenuOpen} openChat={() => setChatOpen(true)} />
        <main className="main-content">
          <Topbar profile={profile} setMenuOpen={setMenuOpen} />
          {notice && <div className="notice"><span>✓</span>{notice}<button onClick={() => setNotice('')}>×</button></div>}
          {screen === 'profile' && <Profile profile={profile} setProfile={setProfile} saveProfile={saveProfile} />}
          {screen === 'dashboard' && <Dashboard profile={profile} schemes={schemes} applications={applications} fundsReceived={fundsReceived} apply={apply} checkCriteria={checkCriteria} setScreen={setScreen} openChat={() => setChatOpen(true)} />}
          {screen === 'schemes' && <Schemes schemes={schemes} applications={applications} apply={apply} checkCriteria={checkCriteria} />}
          {screen === 'tracking' && <Tracking app={app} scheme={appScheme} fundsReceived={fundsReceived} setScreen={setScreen} />}
          {criteria && <CriteriaModal scheme={criteria.scheme} result={criteria.result} close={() => setCriteria(null)} confirm={confirmApplication} />}
          <Chatbot profile={profile} schemes={schemes} applications={applications} open={chatOpen} setOpen={setChatOpen} />
        </main>
      </div>
    </div>
  );
}

function Login({ login, setLogin, demo, setPortalMode, enter }) { return <div className="login-page"><div className="login-art"><div className="brand light"><span className="brand-mark">✦</span><span>JanSetu <em>beneficiary portal</em></span></div><div className="art-copy"><span className="eyebrow">DIGITAL SUBSIDY & GRANT PLATFORM</span><h1>Every benefit.<br /><i>Closer to home.</i></h1><p>A simpler way to discover, apply for, and track government support built around you.</p></div><div className="art-stats"><div><b>50</b><span>Active schemes</span></div><div><b>100%</b><span>Transparent tracking</span></div></div></div><section className="login-panel"><div className="login-form"><div className="brand mobile-brand"><span className="brand-mark">✦</span>JanSetu</div><div><span className="eyebrow">WELCOME TO JANSETU</span><h2>Sign in to your<br />beneficiary account</h2><p className="muted">Use your mobile number or Aadhaar / Citizen ID to continue.</p></div><label>Mobile number or Aadhaar / Citizen ID<input value={login} onChange={e => setLogin(e.target.value)} placeholder="Enter your ID" /></label><button className="primary full" onClick={enter}>Continue <span>→</span></button><button className="otp">▣ &nbsp; Sign in with OTP instead</button><div className="divider"><span>OR</span></div><button className="demo" onClick={demo}><span className="demo-icon">✦</span><span><b>Try Quick Demo</b><small>Explore with a pre-filled beneficiary profile</small></span><b>→</b></button><button className="demo admin-demo" onClick={() => setPortalMode('admin')} style={{ marginTop: '10px', background: '#eff6ff', borderColor: '#bfdbfe', color: '#1e40af' }}><span className="demo-icon" style={{ background: '#2563eb', color: '#fff' }}>🏛️</span><span><b>Official Officer Portal →</b><small>Field Officer ➔ District Officer ➔ Finance Approver</small></span><b>→</b></button><p className="secure">⌑ &nbsp; Your information is protected and secure</p></div></section></div> }

function Sidebar({ screen, setScreen, menuOpen, setMenuOpen, openChat }) { 
  const items = [['dashboard','▦','Overview'],['schemes','◈','Explore schemes'],['tracking','⌁','Application tracking'],['profile','♙','My profile']]; 
  return <aside className={menuOpen ? 'sidebar open' : 'sidebar'}>
    <div className="brand"><span className="brand-mark">✦</span><span>JanSetu <em>beneficiary portal</em></span><button className="close" onClick={() => setMenuOpen(false)}>×</button></div>
    <nav>{items.map(([key, icon, label]) => <button key={key} className={screen === key ? 'active' : ''} onClick={() => { setScreen(key); setMenuOpen(false); }}><i>{icon}</i>{label}</button>)}</nav>
    <div className="sidebar-foot">
      <div className="help" style={{ cursor: 'pointer' }} onClick={openChat}>?<span>Need help?<small>Contact AI support 💬</small></span></div>
      <button className="signout" onClick={() => location.reload()}>↪ Sign out</button>
    </div>
  </aside>;
}

function Topbar({ profile, setMenuOpen }) { return <header className="topbar"><button className="hamburger" onClick={() => setMenuOpen(true)}>☰</button><div className="breadcrumb">BENEFICIARY PORTAL <span>/</span> HOME</div><div className="top-user"><span className="bell">♧<i></i></span><span className="avatar">{(profile.name || 'B').slice(0,1)}</span><span><b>{profile.name || 'Beneficiary'}</b><small>Verified beneficiary</small></span></div></header> }

function Profile({ profile, setProfile, saveProfile }) { const update = (key, value) => setProfile({ ...profile, [key]: value }); const groups = [{title:'Personal details', desc:'Tell us a little about yourself.', fields:[['name','Full name','text'],['dob','Date of birth','date'],['gender','Gender','select'],['mobile','Mobile number','tel'],['aadhaar','Aadhaar ID number','text']]},{title:'Category & eligibility', desc:'This helps us find support that fits you.', fields:[['category','Social category','select'],['income','Annual family income (₹)','number'],['employment','Employment status','select']]},{title:'Location & bank details', desc:'Used to verify your eligibility and deliver benefits.', fields:[['state','State','select'],['district','District','text'],['village','Village / Town','text'],['bank','Bank account number','text'],['ifsc','IFSC code','text']]}]; return <section className="page profile-page"><PageTitle eyebrow="YOUR ACCOUNT" title={<>Complete your <b>profile</b></>} desc="A complete profile helps us show you the right schemes and enables direct benefit transfers." /><form onSubmit={saveProfile}>{groups.map(g => <div className="form-card" key={g.title}><div className="form-heading"><h3>{g.title}</h3><p>{g.desc}</p></div><div className="fields">{g.fields.map(([key,label,type]) => <label key={key}>{label}{type === 'select' ? <select value={profile[key]} onChange={e => update(key,e.target.value)} required><option value="">Select {label.toLowerCase()}</option>{options(key).map(v => <option key={v}>{v}</option>)}</select> : <input type={type} value={profile[key]} onChange={e => update(key,e.target.value)} placeholder={label} required={['name','mobile','state'].includes(key)} />}</label>)}</div></div>)}<div className="form-actions"><span>⌑ Your data is securely encrypted</span><button className="primary">Save profile & continue <b>→</b></button></div></form></section> }
function options(key) { return key === 'gender' ? ['Female','Male','Non-binary','Prefer not to say'] : key === 'category' ? ['General','OBC','SC','ST','Minorities'] : key === 'employment' ? ['Farmer','Self-employed','Employed','Student','Unemployed'] : ['Andhra Pradesh','Karnataka','Maharashtra','Tamil Nadu','Uttar Pradesh']; }
function PageTitle({ eyebrow, title, desc, action }) { return <div className="page-title"><div><span className="eyebrow">{eyebrow}</span><h1>{title}</h1><p>{desc}</p></div>{action}</div> }

function Dashboard({ profile, schemes, applications = [], fundsReceived = 0, apply, checkCriteria, setScreen, openChat }) { 
  const latest = applications && applications.length > 0 ? applications[0] : null; 
  const scheme = latest ? (schemes.find(s => s.id === latest.schemeId) || schemes[0]) : schemes[0]; 
  const isDisbursed = latest ? (latest.stage === 3 || latest.status === 'DISBURSED') : false;
  const isDistrictApproved = latest ? (latest.stage === 2 || latest.status === 'DISTRICT_APPROVED') : false;
  const isFieldVerified = latest ? (latest.stage === 1 || latest.status === 'FIELD_VERIFIED') : false;

  const statusLabel = isDisbursed ? '✓ Funds Disbursed to Bank' :
                      isDistrictApproved ? '★ District Approved' :
                      isFieldVerified ? '✓ Field Verified' : 'In Field Verification';
  const statusPillCls = isDisbursed ? 'green-pill' : isDistrictApproved ? 'blue' : 'amber';

  return <section className="page">
    <PageTitle eyebrow="GOOD MORNING" title={<>Welcome back, <b>{(profile.name || 'Beneficiary').split(' ')[0]}.</b></>} desc="Here is a snapshot of your benefits and applications." action={<button className="outline" onClick={() => setScreen('schemes')}>Explore all 50 schemes <b>→</b></button>} />
    <div className="summary-grid">
      <div className="summary green-summary"><span className="summary-icon">⌘</span><div><small>AVAILABLE FOR YOU</small><b>50 schemes</b><p>Based on your profile</p></div></div>
      <div className="summary amber-summary"><span className="summary-icon">◷</span><div><small>ACTIVE APPLICATIONS</small><b>{applications.length} application{applications.length !== 1 && 's'}</b><p>Currently in process</p></div></div>
      <div className="summary blue-summary"><span className="summary-icon">₹</span><div><small>FUNDS RECEIVED</small><b>₹{(fundsReceived || 0).toLocaleString('en-IN')}</b><p>Across all schemes</p></div></div>
    </div>
    <div className="two-col">
      {latest ? (
        <div className="panel status-panel">
          <div className="panel-head">
            <div><span className="eyebrow">LATEST APPLICATION</span><h3>{scheme.short}</h3></div>
            <button className="text-button" onClick={() => setScreen('tracking')}>View tracking →</button>
          </div>
          <Progress stage={latest.stage} compact />
          <div className="status-meta"><span>Application no. <b>{latest.ref}</b></span><span className={`pill ${statusPillCls}`}>{statusLabel}</span></div>
        </div>
      ) : (
        <div className="panel status-panel">
          <div className="panel-head">
            <div><span className="eyebrow">GET STARTED</span><h3>No Active Applications</h3></div>
            <button className="text-button" onClick={() => setScreen('schemes')}>Explore schemes →</button>
          </div>
          <div style={{ padding: '12px 0', color: '#475569', fontSize: '14px' }}>
            <p style={{ margin: '0 0 12px 0' }}>Select any of the 50 government schemes to submit an application and experience the multi-stage approval workflow.</p>
            <button className="primary" onClick={() => setScreen('schemes')} style={{ padding: '8px 16px', fontSize: '14px' }}>Browse 50 Schemes & Apply Now <b>→</b></button>
          </div>
        </div>
      )}
      <div className="panel support-panel">
        <span className="support-emoji">💬</span>
        <h3>Need a hand?</h3>
        <p>Our JanSetu AI support assistant is here to help 24/7 with any scheme question.</p>
        <button className="text-button" onClick={openChat}>Ask AI Chatbot →</button>
      </div>
    </div>
    <section className="scheme-section">
      <div className="section-head">
        <div><span className="eyebrow">RECOMMENDED FOR YOU</span><h2>Find the support you need</h2></div>
        <button className="text-button" onClick={() => setScreen('schemes')}>View all 50 schemes →</button>
      </div>
      <div className="scheme-grid">{schemes.slice(0,6).map(s => <SchemeCard key={s.id} scheme={s} applied={!!(applications && applications.find(a => a.schemeId === s.id))} apply={apply} checkCriteria={checkCriteria} />)}</div>
    </section>
  </section>; 
}

function Schemes({ schemes, applications, apply, checkCriteria }) { 
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const categories = useMemo(() => ['All', ...new Set(schemes.map(s => s.category))], [schemes]);

  const filteredSchemes = useMemo(() => {
    return schemes.filter(s => {
      const matchesSearch = s.title.toLowerCase().includes(search.toLowerCase()) || 
                            s.desc.toLowerCase().includes(search.toLowerCase()) ||
                            s.category.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = selectedCategory === 'All' || s.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [schemes, search, selectedCategory]);

  return <section className="page">
    <PageTitle eyebrow="GOVERNMENT SUPPORT" title={<>Explore <b>available schemes ({filteredSchemes.length})</b></>} desc="Find government benefits you may be eligible for, tailored to your profile." />
    
    <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', flexWrap: 'wrap', alignItems: 'center' }}>
      <input 
        type="text" 
        placeholder="🔍 Search 50 schemes by name, category, or keyword..." 
        value={search} 
        onChange={e => setSearch(e.target.value)} 
        style={{ flex: '1', minWidth: '260px', padding: '12px 16px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '15px' }}
      />
      <select 
        value={selectedCategory} 
        onChange={e => setSelectedCategory(e.target.value)}
        style={{ padding: '12px 16px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '15px', background: '#fff' }}
      >
        {categories.map(c => <option key={c} value={c}>{c === 'All' ? 'All Categories' : c}</option>)}
      </select>
    </div>

    <div className="scheme-grid full-grid">
      {filteredSchemes.map(s => <SchemeCard key={s.id} scheme={s} applied={!!applications.find(a => a.schemeId === s.id)} apply={apply} checkCriteria={checkCriteria} />)}
    </div>
  </section>; 
}

function SchemeCard({ scheme, applied, apply, checkCriteria }) { 
  return <article className={`scheme-card ${scheme.color}`}>
    <div className="scheme-top">
      <span className="scheme-icon">{scheme.icon}</span>
      <span className="category">{scheme.category}</span>
    </div>
    <h3>{scheme.title}</h3>
    <p>{scheme.desc}</p>
    <div className="grant">
      <small>BENEFIT AMOUNT</small>
      <b>{scheme.amount}</b>
    </div>
    <div className="eligibility">
      <small>ELIGIBILITY</small>
      {scheme.eligibility.map(x => <span key={x}>✓ {x}</span>)}
    </div>
    <div style={{ display: 'flex', gap: '8px', marginTop: 'auto' }}>
      <button className="outline" onClick={() => checkCriteria(scheme)} style={{ flex: '1', fontSize: '13px', padding: '8px' }}>Check Criteria</button>
      <button className={applied ? 'applied-button' : 'primary'} onClick={() => apply(scheme.id)} style={{ flex: '1', fontSize: '13px', padding: '8px' }}>
        {applied ? 'Tracking →' : 'Apply now →'}
      </button>
    </div>
  </article>; 
}

function Progress({ stage, compact }) { const steps = ['Application submitted','Field check','District approval','Funds disbursed']; return <div className={`progress ${compact ? 'compact' : ''}`}>{steps.map((step, i) => <div className="progress-step" key={step}><span className={i <= stage ? 'done' : ''}>{i < stage ? '✓' : i + 1}</span><p>{step}</p>{i < 3 && <i className={i < stage ? 'line done-line' : 'line'} />}</div>)}</div> }

function Tracking({ app, scheme, fundsReceived = 0, setScreen }) { 
  if (!app) return <section className="page empty"><h1>No applications yet</h1><button className="primary" onClick={() => setScreen('schemes')}>Explore schemes</button></section>; 
  
  const isDisbursed = app.stage === 3 || app.status === 'DISBURSED';
  const isDistrictApproved = app.stage === 2 || app.status === 'DISTRICT_APPROVED';
  const isFieldVerified = app.stage === 1 || app.status === 'FIELD_VERIFIED';

  const totalNum = extractAmountNumber(scheme?.amount || app?.appliedAmount, '5000');
  const stage1Amt = Math.round(totalNum * 0.3);
  const stage2Amt = Math.round(totalNum * 0.4);
  const stage3Amt = totalNum - stage1Amt - stage2Amt;

  const heroTitleText = isDisbursed ? 'Funds Disbursed & Credited!' :
                        isDistrictApproved ? 'District Officer Approved' :
                        isFieldVerified ? 'Field Officer Verification Cleared' : 'Field verification in progress';
  
  const heroDescText = isDisbursed ? `Your grant benefit of ₹${totalNum.toLocaleString('en-IN')} has been successfully released via Direct Benefit Transfer (DBT) to your bank account.` :
                       isDistrictApproved ? 'Your application has been approved by the District Development Commissioner and sent to Finance Approver for fund release.' :
                       isFieldVerified ? 'Field inspection completed. Your application is under review by the District Development Commissioner.' :
                       'Your application is with the local field officer for document and eligibility verification.';

  const stages = [
    { 
      name: 'Stage 1 · Registration benefit', 
      amount: `₹${stage1Amt.toLocaleString('en-IN')}`, 
      date: isDisbursed || isDistrictApproved || isFieldVerified ? 'Credited 07 Sep 2026' : 'Expected soon', 
      status: isDisbursed || isDistrictApproved || isFieldVerified ? 'Released' : 'Pending verification', 
      done: isDisbursed || isDistrictApproved || isFieldVerified 
    },
    { 
      name: 'Stage 2 · Verification clearance', 
      amount: `₹${stage2Amt.toLocaleString('en-IN')}`, 
      date: isDisbursed || isDistrictApproved ? 'Credited 07 Sep 2026' : 'Expected after field check', 
      status: isDisbursed || isDistrictApproved ? 'Released' : isFieldVerified ? 'Under district review' : 'Awaiting field check', 
      done: isDisbursed || isDistrictApproved 
    },
    { 
      name: 'Stage 3 · Final approval', 
      amount: `₹${stage3Amt.toLocaleString('en-IN')}`, 
      date: isDisbursed ? 'Credited 07 Sep 2026' : 'Expected after district approval', 
      status: isDisbursed ? 'Released' : 'Pending finance approval', 
      done: isDisbursed 
    }
  ]; 

  return <section className="page tracking-page">
    <PageTitle eyebrow="APPLICATION TRACKING" title={<><b>{scheme.short}</b> application</>} desc={`Reference no. ${app.ref} · Submitted on ${app.applied}`} />
    <div className="tracking-hero">
      <div>
        <span className="scheme-icon">{scheme.icon}</span>
        <div>
          <span className="eyebrow">CURRENT STATUS</span>
          <h2>{heroTitleText}</h2>
          <p>{heroDescText}</p>
        </div>
      </div>
      <span className={isDisbursed ? 'pill green-pill' : 'pill amber'}>
        {isDisbursed ? '✓ DISBURSED' : '● IN PROGRESS'}
      </span>
    </div>
    <div className="panel progress-panel">
      <h3>Application progress</h3>
      <Progress stage={app.stage} />
      <div className="next-step">
        <span>⌁</span>
        <div>
          <b>What happens next?</b>
          <p>{isDisbursed ? 'Your grant benefit is fully credited. Check your registered bank account for DBT payment confirmation.' : isDistrictApproved ? 'Finance Approver will release the remaining staged funds directly to your bank account.' : isFieldVerified ? 'District Officer is evaluating budget availability to grant final approval.' : 'After field verification, your application will be sent to the District Officer for approval.'}</p>
        </div>
      </div>
    </div>
    <div className="section-head fund-head">
      <div>
        <span className="eyebrow">STAGED FUND RELEASE</span>
        <h2>Grant disbursement plan</h2>
        <p>Funds are released in stages as your application moves forward.</p>
      </div>
      <div className="amount-box">
        <small>TOTAL APPROVED BENEFIT</small>
        <b>₹{totalNum.toLocaleString('en-IN')}</b>
      </div>
    </div>
    <div className="release-list">
      {stages.map((s, i) => <div className="release" key={s.name}>
        <div className={`release-dot ${s.done ? 'released' : ''}`}>{s.done ? '✓' : i + 1}</div>
        <div className="release-main"><span>{s.name}</span><b>{s.amount} <small>({[30,40,30][i]}%)</small></b></div>
        <div className="release-date"><b>{s.date}</b><span className={s.done ? 'pill green-pill' : 'pill gray'}>{s.status}</span></div>
      </div>)}
    </div>
  </section>; 
}

function CriteriaModal({ scheme, result, close, confirm }) { 
  return <div className="modal-backdrop" role="dialog" aria-modal="true">
    <div className="criteria-modal">
      <button className="modal-close" onClick={close}>x</button>
      <div className="criteria-title">
        <span className="scheme-icon">{scheme.icon}</span>
        <div><span className="eyebrow">SCHEME CRITERIA CHECK</span><h2>{scheme.short}</h2></div>
      </div>
      <div className={result.eligible ? 'eligibility-result yes' : 'eligibility-result no'}>
        <b>{result.eligible ? 'Eligible to apply' : 'Profile criteria not met'}</b>
        <p>{result.message}</p>
      </div>
      <div className="criteria-check">
        <span>Annual family income</span>
        <b>{result.incomeEligible ? 'Within limit' : 'Above limit'}</b>
        <small>Maximum permitted: ₹{Number(result.maxIncomeLimit).toLocaleString('en-IN')}</small>
      </div>
      <div className="criteria-check">
        <span>Social category</span>
        <b>{result.categoryEligible ? 'Accepted' : 'Not accepted'}</b>
        <small>Eligible categories: {result.allowedCategories.join(', ')}</small>
      </div>
      <div className="document-list">
        <span>REQUIRED DOCUMENT CHECKLIST</span>
        {result.requiredDocuments.map(doc => <label key={doc}><input type="checkbox" defaultChecked /> <b>{doc}</b><small>Ready for upload</small></label>)}
      </div>
      {result.eligible ? <button className="primary full" onClick={confirm}>Confirm and submit application <span>-&gt;</span></button> : <button className="outline full" onClick={close}>Review my profile</button>}
    </div>
  </div>; 
}

function Chatbot({ profile, schemes, applications, open, setOpen }) {
  const [messages, setMessages] = useState([
    { sender: 'bot', text: `Namaste ${profile.name ? profile.name.split(' ')[0] : 'Beneficiary'}! 👋 I am JanSetu AI Assistant. How can I help you today with government subsidy schemes, eligibility checks, required documents, or application tracking?` }
  ]);
  const [input, setInput] = useState('');

  const replyUser = (userMsg) => {
    if (!userMsg.trim()) return;
    const newMsgs = [...messages, { sender: 'user', text: userMsg }];
    setMessages(newMsgs);
    setInput('');

    setTimeout(() => {
      let botText = getBotResponse(userMsg, profile, schemes, applications);
      setMessages(prev => [...prev, { sender: 'bot', text: botText }]);
    }, 350);
  };

  if (!open) {
    return (
      <button className="chatbot-fab" onClick={() => setOpen(true)}>
        <span>💬</span>
        <span>JanSetu AI Support</span>
        <span className="chatbot-fab-badge">24/7 AI</span>
      </button>
    );
  }

  return (
    <div className="chatbot-window">
      <div className="chatbot-header">
        <div className="chatbot-header-info">
          <div className="chatbot-avatar">✦</div>
          <div className="chatbot-title">
            <h4>JanSetu AI Assistant</h4>
            <p>● Active & Online 24/7</p>
          </div>
        </div>
        <button className="chatbot-close" onClick={() => setOpen(false)}>×</button>
      </div>

      <div className="chatbot-messages">
        {messages.map((m, i) => (
          <div key={i} className={`chat-msg ${m.sender}`}>
            {m.text}
          </div>
        ))}
      </div>

      <div className="chat-chips">
        <button className="chat-chip" onClick={() => replyUser('How do I apply for PM-KISAN?')}>🌾 PM-KISAN</button>
        <button className="chat-chip" onClick={() => replyUser('Check my solar scheme eligibility')}>☀️ Solar Rooftop</button>
        <button className="chat-chip" onClick={() => replyUser('What documents do I need for housing grant?')}>🏠 Housing Docs</button>
        <button className="chat-chip" onClick={() => replyUser('Track my active application status')}>⌁ Track Status</button>
      </div>

      <div className="chatbot-input-area">
        <input 
          type="text" 
          placeholder="Ask AI about 50 schemes or eligibility..." 
          value={input} 
          onChange={e => setInput(e.target.value)} 
          onKeyDown={e => e.key === 'Enter' && replyUser(input)}
        />
        <button className="chatbot-send" onClick={() => replyUser(input)}>Send</button>
      </div>
    </div>
  );
}

function getBotResponse(query, profile, schemes, applications) {
  const q = query.toLowerCase();
  
  if (q.includes('pm-kisan') || q.includes('farmer') || q.includes('kisan')) {
    const kisan = schemes.find(s => s.short.includes('KISAN')) || schemes[0];
    return `🌾 ${kisan.title}: Provides ${kisan.amount}.\n\nEligibility: ${kisan.eligibility.join(', ')}.\nRequired Docs: ${kisan.docs.join(', ')}.`;
  }
  
  if (q.includes('solar') || q.includes('electricity') || q.includes('surya')) {
    const solar = schemes.find(s => s.title.toLowerCase().includes('solar')) || schemes[1];
    return `☀️ ${solar.title}: Benefit amount is ${solar.amount}.\n\nDocs required: ${solar.docs.join(', ')}.`;
  }
  
  if (q.includes('housing') || q.includes('pmay') || q.includes('house')) {
    const housing = schemes.find(s => s.category.toLowerCase() === 'housing') || schemes[2];
    return `🏠 ${housing.title}: Offers ${housing.amount}.\n\nRequired Documents: ${housing.docs.join(', ')}. Max permitted income limit is ₹${(housing.limit || 600000).toLocaleString('en-IN')}.`;
  }

  if (q.includes('track') || q.includes('status') || q.includes('application')) {
    if (applications.length === 0) return "You have no active applications currently. Visit 'Explore schemes' to apply!";
    const latest = applications[0];
    const s = schemes.find(x => x.id === latest.schemeId) || schemes[0];
    return `⌁ Active Application Status: Your application for ${s.title} (Ref: ${latest.ref}) is currently in Stage ${latest.stage + 1} (Field Verification).`;
  }

  if (q.includes('document') || q.includes('doc') || q.includes('aadhaar')) {
    return "📄 Most Indian subsidy schemes require: 1) Aadhaar Card, 2) Income Certificate, 3) Bank Passbook with IFSC, and 4) Ration Card or Category Certificate.";
  }

  if (q.includes('profile') || q.includes('eligibility')) {
    const category = profile.category || 'OBC';
    const income = profile.income ? `₹${Number(profile.income).toLocaleString('en-IN')}` : 'Not set';
    return `👤 Your Profile Summary: Category: ${category}, Annual Income: ${income}. Based on your profile, you are eligible for up to 42 out of 50 schemes!`;
  }

  const matched = schemes.find(s => s.title.toLowerCase().includes(q) || s.category.toLowerCase().includes(q) || s.short.toLowerCase().includes(q));
  if (matched) {
    return `✦ ${matched.title} (${matched.category}): Grants ${matched.amount}.\n\n${matched.desc}\nRequired Docs: ${matched.docs.join(', ')}.`;
  }

  return `✦ JanSetu AI Assistant: I can answer questions on all 50 government schemes (Agriculture, Housing, Solar, Education, MSME, Women Welfare, EV, etc.), required document checklists, or application status! Try asking: "What schemes are for farmers?" or "Docs for Mudra loan".`;
}

const OFFICERS = {
  ROLE_FIELD_OFFICER: {
    email: 'field.officer@gov.in',
    password: 'Field@2026',
    name: 'Rajesh Kumar',
    role: 'ROLE_FIELD_OFFICER',
    title: 'Field Officer Portal',
    designation: 'Senior Field Verification Inspector',
    jurisdiction: 'Pune North Sub-District',
    badge: '🔍 Field Officer',
    targetStatus: 'SUBMITTED',
    nextStatus: 'FIELD_VERIFIED',
    actionText: 'Verify & Forward',
    color: '#d97706',
    bg: '#fef3c7'
  },
  ROLE_DISTRICT_OFFICER: {
    email: 'district.officer@gov.in',
    password: 'District@2026',
    name: 'Ananya Deshmukh',
    role: 'ROLE_DISTRICT_OFFICER',
    title: 'District Officer Portal',
    designation: 'District Development Commissioner',
    jurisdiction: 'Pune District Circle',
    badge: '🏛️ District Officer',
    targetStatus: 'FIELD_VERIFIED',
    nextStatus: 'DISTRICT_APPROVED',
    actionText: 'Review & Approve',
    color: '#2563eb',
    bg: '#dbeafe'
  },
  ROLE_FINANCE_APPROVER: {
    email: 'finance.approver@gov.in',
    password: 'Finance@2026',
    name: 'Suresh Patil',
    role: 'ROLE_FINANCE_APPROVER',
    title: 'Finance Approver Portal',
    designation: 'Chief Financial Control Officer',
    jurisdiction: 'State Treasury Directorate',
    badge: '💳 Finance Approver',
    targetStatus: 'DISTRICT_APPROVED',
    nextStatus: 'DISBURSED',
    actionText: 'Configure Fund Release',
    color: '#059669',
    bg: '#d1fae5'
  }
};

const INITIAL_QUEUE = [
  {
    id: 101,
    schemeId: 1,
    schemeCode: 'PM-KISAN',
    schemeTitle: 'PM-KISAN Samman Nidhi',
    status: 'SUBMITTED',
    appliedAmount: '₹6,000 / year',
    appliedDate: '2026-09-03',
    beneficiaryId: 1,
    beneficiaryName: 'Asha Ramesh Patil',
    beneficiaryMobile: '9876543210',
    beneficiaryAadhaar: 'XXXX XXXX 4812',
    beneficiaryCategory: 'OBC',
    beneficiaryIncome: 180000,
    beneficiaryDistrict: 'Pune',
    beneficiaryState: 'Maharashtra',
    beneficiaryBank: '245710003456',
    beneficiaryIfsc: 'SBIN0000456',
    documents: ['Land Ownership Copy', 'Aadhaar Card', 'Bank Passbook'],
    disbursements: [
      { stageNumber: 1, stageName: 'Registration benefit', percentage: 30, amount: '₹1,800', status: 'PENDING' },
      { stageNumber: 2, stageName: 'Verification clearance', percentage: 40, amount: '₹2,400', status: 'PENDING' },
      { stageNumber: 3, stageName: 'Final approval', percentage: 30, amount: '₹1,800', status: 'PENDING' }
    ]
  },
  {
    id: 102,
    schemeId: 2,
    schemeCode: 'SOLAR',
    schemeTitle: 'PM Surya Ghar Free Electricity Scheme',
    status: 'FIELD_VERIFIED',
    appliedAmount: '₹78,000',
    appliedDate: '2026-09-02',
    beneficiaryId: 2,
    beneficiaryName: 'Ramesh Chandra Sharma',
    beneficiaryMobile: '9812345678',
    beneficiaryAadhaar: 'XXXX XXXX 8912',
    beneficiaryCategory: 'General',
    beneficiaryIncome: 350000,
    beneficiaryDistrict: 'Pune',
    beneficiaryState: 'Maharashtra',
    beneficiaryBank: '318490214821',
    beneficiaryIfsc: 'HDFC0001234',
    documents: ['Electricity Bill', 'Property Proof', 'Roof Layout Plan', 'Aadhaar Card'],
    disbursements: [
      { stageNumber: 1, stageName: 'Site Survey & Installation', percentage: 40, amount: '₹31,200', status: 'RELEASED', releaseDate: '2026-09-02' },
      { stageNumber: 2, stageName: 'Grid Connectivity', percentage: 40, amount: '₹31,200', status: 'PENDING' },
      { stageNumber: 3, stageName: 'Final Subsidy Release', percentage: 20, amount: '₹15,600', status: 'PENDING' }
    ]
  },
  {
    id: 103,
    schemeId: 5,
    schemeCode: 'EDU',
    schemeTitle: 'Post Matric Scholarship for SC Students',
    status: 'DISTRICT_APPROVED',
    appliedAmount: '₹75,000',
    appliedDate: '2026-09-01',
    beneficiaryId: 3,
    beneficiaryName: 'Sunita Devi Yadav',
    beneficiaryMobile: '9765432109',
    beneficiaryAadhaar: 'XXXX XXXX 3456',
    beneficiaryCategory: 'SC',
    beneficiaryIncome: 140000,
    beneficiaryDistrict: 'Pune',
    beneficiaryState: 'Maharashtra',
    beneficiaryBank: '510294821039',
    beneficiaryIfsc: 'PUNB0192800',
    documents: ['SC Caste Certificate', 'Income Certificate', 'College Admission Slip', 'Marksheets'],
    disbursements: [
      { stageNumber: 1, stageName: 'Tuition Fee Subsidy', percentage: 50, amount: '₹37,500', status: 'RELEASED', releaseDate: '2026-09-01' },
      { stageNumber: 2, stageName: 'Living Stipend Part 1', percentage: 25, amount: '₹18,750', status: 'PENDING' },
      { stageNumber: 3, stageName: 'Living Stipend Part 2', percentage: 25, amount: '₹18,750', status: 'PENDING' }
    ]
  }
];

function AdminPortal({ setPortalMode, onDisbursementUpdate, onStageAdvance }) {
  const [activeRole, setActiveRole] = useState('ROLE_FIELD_OFFICER');
  const [queue, setQueue] = useState(INITIAL_QUEUE);
  const [selectedApp, setSelectedApp] = useState(null);
  const [paymentTxn, setPaymentTxn] = useState(null);
  const [remarks, setRemarks] = useState('');
  const [filterStatus, setFilterStatus] = useState('ROLE_QUEUE');

  const officer = OFFICERS[activeRole];

  useEffect(() => {
    fetchQueue(activeRole);
  }, [activeRole]);

  const fetchQueue = async (role) => {
    try {
      const data = await grantApi.getOfficerQueue(role);
      if (Array.isArray(data) && data.length > 0) {
        setQueue(data);
      }
    } catch {
      // Keep state
    }
  };

  const handleApprove = async (app) => {
    try {
      await grantApi.approveApplication(app.id, activeRole, remarks);
    } catch {}

    const next = activeRole === 'ROLE_FIELD_OFFICER' ? 'FIELD_VERIFIED' : 
                 activeRole === 'ROLE_DISTRICT_OFFICER' ? 'DISTRICT_APPROVED' : 'DISBURSED';

    if (onStageAdvance) {
      const nextStage = activeRole === 'ROLE_FIELD_OFFICER' ? 1 : activeRole === 'ROLE_DISTRICT_OFFICER' ? 2 : 3;
      onStageAdvance(nextStage, next);
    }

    if (activeRole === 'ROLE_FINANCE_APPROVER' && onDisbursementUpdate) {
      const amt = extractAmountNumber(app.appliedAmount, '5000');
      onDisbursementUpdate(amt);
    }

    setQueue(prev => prev.map(item => {
      if (item.id === app.id) {
        return { ...item, status: next };
      }
      return item;
    }));
    setSelectedApp(null);
    setRemarks('');
  };

  const handleReject = async (app) => {
    try {
      await grantApi.rejectApplication(app.id, activeRole, remarks || 'Application rejected');
    } catch {}

    setQueue(prev => prev.map(item => item.id === app.id ? { ...item, status: 'REJECTED' } : item));
    setSelectedApp(null);
    setRemarks('');
  };

  const handleDisburse = async (app, stageNum = 1) => {
    let result = null;
    try {
      result = await grantApi.releaseFunds(app.id, stageNum, remarks);
    } catch {
      result = {
        txnRef: `DBT-2026-TXN-${Math.floor(1000 + Math.random() * 9000)}`,
        beneficiaryName: app.beneficiaryName || 'Asha Ramesh Patil',
        bankAccount: app.beneficiaryBank || '245710003456',
        ifscCode: app.beneficiaryIfsc || 'SBIN0000456',
        stageName: `Stage ${stageNum} Release`,
        amountReleased: app.appliedAmount || '₹5,000',
        status: 'SUCCESS_RELEASED',
        timestamp: new Date().toISOString().split('T')[0]
      };
    }

    const releasedNum = extractAmountNumber(result?.amountReleased, app?.appliedAmount);

    if (onDisbursementUpdate) {
      onDisbursementUpdate(releasedNum);
    }

    setQueue(prev => prev.map(item => {
      if (item.id === app.id) {
        const updatedStages = (item.disbursements || []).map((s, idx) => 
          idx + 1 === stageNum ? { ...s, status: 'RELEASED', releaseDate: new Date().toISOString().split('T')[0] } : s
        );
        return { ...item, status: 'DISBURSED', disbursements: updatedStages };
      }
      return item;
    }));

    setSelectedApp(null);
    setPaymentTxn(result);
  };

  const filteredQueue = queue.filter(item => {
    if (filterStatus === 'ROLE_QUEUE') return item.status === officer.targetStatus;
    if (filterStatus === 'ALL') return true;
    return item.status === filterStatus;
  });

  return (
    <div className="admin-portal-wrapper">
      <header className="admin-topbar">
        <div className="admin-brand">
          <span className="gov-emblem">🇮🇳</span>
          <div>
            <h3>Digital Subsidy & Grant Administration</h3>
            <p>Government of India · Administrative Approval & Disbursement Portal</p>
          </div>
        </div>
        <button className="beneficiary-return-btn" onClick={() => setPortalMode('beneficiary')}>
          ← Return to Beneficiary Portal
        </button>
      </header>

      <div className="role-switcher-banner">
        <div className="role-switcher-title">
          <span>🔐 <b>OFFICIAL ROLE SWITCHER</b> (Infosys Springboard Reviewer Portal)</span>
          <small>Click to switch logged-in government officer role instantly:</small>
        </div>
        <div className="role-cards-grid">
          {Object.values(OFFICERS).map(o => (
            <button
              key={o.role}
              className={`role-card ${activeRole === o.role ? 'selected' : ''}`}
              onClick={() => setActiveRole(o.role)}
            >
              <span className="role-card-badge">{o.badge}</span>
              <div className="role-card-info">
                <b>{o.name}</b>
                <small>{o.email}</small>
                <code>Password: {o.password}</code>
              </div>
            </button>
          ))}
        </div>
      </div>

      <main className="admin-content">
        <div className="officer-profile-header">
          <div className="officer-avatar-box">
            <span>{officer.badge.split(' ')[0]}</span>
          </div>
          <div className="officer-profile-details">
            <span className="role-chip" style={{ backgroundColor: officer.bg, color: officer.color }}>
              ● ACTIVE ROLE: {officer.role}
            </span>
            <h2>{officer.name} — {officer.title}</h2>
            <p><strong>Designation:</strong> {officer.designation} &nbsp;|&nbsp; <strong>Jurisdiction:</strong> {officer.jurisdiction}</p>
          </div>
          <div className="officer-queue-stats">
            <div className="stat-pill amber">
              <small>PENDING IN QUEUE</small>
              <b>{queue.filter(i => i.status === officer.targetStatus).length}</b>
            </div>
            <div className="stat-pill green">
              <small>PROCESSED</small>
              <b>{queue.filter(i => i.status !== officer.targetStatus).length}</b>
            </div>
          </div>
        </div>

        <div className="admin-queue-section">
          <div className="queue-controls">
            <div className="queue-title-area">
              <h3>Approval & Disbursement Queue</h3>
              <p>Showing applications requiring <strong>{officer.title}</strong> action</p>
            </div>
            <div className="queue-filters">
              <label>Queue Filter:</label>
              <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
                <option value="ROLE_QUEUE">Pending My Role Action ({officer.targetStatus})</option>
                <option value="ALL">All Applications (All Stages)</option>
                <option value="SUBMITTED">Status: SUBMITTED (Field Queue)</option>
                <option value="FIELD_VERIFIED">Status: FIELD_VERIFIED (District Queue)</option>
                <option value="DISTRICT_APPROVED">Status: DISTRICT_APPROVED (Finance Queue)</option>
                <option value="DISBURSED">Status: DISBURSED</option>
                <option value="REJECTED">Status: REJECTED</option>
              </select>
            </div>
          </div>

          <div className="admin-table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>App Ref</th>
                  <th>Beneficiary Name</th>
                  <th>Scheme</th>
                  <th>District / State</th>
                  <th>Category</th>
                  <th>Applied Amount</th>
                  <th>Current Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredQueue.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="empty-table">
                      ✓ No pending applications in this officer queue right now.
                    </td>
                  </tr>
                ) : (
                  filteredQueue.map(app => (
                    <tr key={app.id}>
                      <td><strong>DSG-2026-{app.id}</strong></td>
                      <td>
                        <b>{app.beneficiaryName}</b>
                        <br />
                        <small className="muted">{app.beneficiaryMobile} | Aadhaar: {app.beneficiaryAadhaar}</small>
                      </td>
                      <td>
                        <span className="scheme-tag">{app.schemeCode}</span>
                        <br />
                        <small>{app.schemeTitle}</small>
                      </td>
                      <td>{app.beneficiaryDistrict}, {app.beneficiaryState}</td>
                      <td><span className="cat-badge">{app.beneficiaryCategory}</span></td>
                      <td><b>{app.appliedAmount}</b></td>
                      <td><StatusBadge status={app.status} /></td>
                      <td>
                        <button
                          className={`action-btn ${app.status === officer.targetStatus ? 'primary-action' : 'secondary-action'}`}
                          onClick={() => setSelectedApp(app)}
                        >
                          {app.status === officer.targetStatus ? `Process (${officer.actionText})` : 'Inspect Details'}
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {selectedApp && (
        <OfficerActionModal
          app={selectedApp}
          officer={officer}
          remarks={remarks}
          setRemarks={setRemarks}
          onApprove={() => handleApprove(selectedApp)}
          onReject={() => handleReject(selectedApp)}
          onDisburse={(stageNum) => handleDisburse(selectedApp, stageNum)}
          onClose={() => setSelectedApp(null)}
        />
      )}

      {paymentTxn && (
        <PaymentGatewayModal
          txn={paymentTxn}
          onClose={() => setPaymentTxn(null)}
        />
      )}
    </div>
  );
}

function StatusBadge({ status }) {
  const map = {
    SUBMITTED: { label: '● SUBMITTED', cls: 'badge-submitted' },
    FIELD_VERIFIED: { label: '✓ FIELD VERIFIED', cls: 'badge-verified' },
    DISTRICT_APPROVED: { label: '★ DISTRICT APPROVED', cls: 'badge-approved' },
    DISBURSED: { label: '💰 DISBURSED / RELEASED', cls: 'badge-disbursed' },
    REJECTED: { label: '✕ REJECTED', cls: 'badge-rejected' }
  };
  const b = map[status] || { label: status, cls: 'badge-submitted' };
  return <span className={`status-badge ${b.cls}`}>{b.label}</span>;
}

function OfficerActionModal({ app, officer, remarks, setRemarks, onApprove, onReject, onDisburse, onClose }) {
  const [landChecked, setLandChecked] = useState(true);
  const [incomeChecked, setIncomeChecked] = useState(true);
  const [identityChecked, setIdentityChecked] = useState(true);

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true">
      <div className="admin-modal-card">
        <div className="admin-modal-header" style={{ borderLeft: `6px solid ${officer.color}` }}>
          <div>
            <span className="role-chip" style={{ backgroundColor: officer.bg, color: officer.color }}>
              {officer.badge} REVIEW & VERIFICATION
            </span>
            <h2>{app.schemeTitle}</h2>
            <p>Application Ref: <strong>DSG-2026-{app.id}</strong> · Submitted on {app.appliedDate}</p>
          </div>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        <div className="admin-modal-body">
          <div className="beneficiary-summary-card">
            <h4>👤 Beneficiary Inspection Profile</h4>
            <div className="bio-grid">
              <div><small>FULL NAME</small><b>{app.beneficiaryName}</b></div>
              <div><small>MOBILE NUMBER</small><b>{app.beneficiaryMobile}</b></div>
              <div><small>AADHAAR NUMBER</small><b>{app.beneficiaryAadhaar}</b></div>
              <div><small>SOCIAL CATEGORY</small><b>{app.beneficiaryCategory}</b></div>
              <div><small>ANNUAL INCOME</small><b>₹{Number(app.beneficiaryIncome || 0).toLocaleString('en-IN')} / yr</b></div>
              <div><small>BANK ACCOUNT</small><b>{app.beneficiaryBank} ({app.beneficiaryIfsc})</b></div>
              <div><small>DISTRICT / STATE</small><b>{app.beneficiaryDistrict}, {app.beneficiaryState}</b></div>
              <div><small>CURRENT WORKFLOW STATE</small><b><StatusBadge status={app.status} /></b></div>
            </div>
          </div>

          {officer.role === 'ROLE_FIELD_OFFICER' && (
            <div className="inspection-section">
              <h4>🔍 Stage 1: Field Officer Physical Inspection Checklist</h4>
              <div className="checklist-group">
                <label className="checkbox-item">
                  <input type="checkbox" checked={landChecked} onChange={e => setLandChecked(e.target.checked)} />
                  <span><strong>Physical Household & Land Survey:</strong> Verified physical address & land parcel records in {app.beneficiaryDistrict}.</span>
                </label>
                <label className="checkbox-item">
                  <input type="checkbox" checked={incomeChecked} onChange={e => setIncomeChecked(e.target.checked)} />
                  <span><strong>Income & Asset Verification:</strong> Verified annual income declaration (₹{Number(app.beneficiaryIncome || 0).toLocaleString('en-IN')}) with tehsildar records.</span>
                </label>
                <label className="checkbox-item">
                  <input type="checkbox" checked={identityChecked} onChange={e => setIdentityChecked(e.target.checked)} />
                  <span><strong>Uploaded Document Authenticity:</strong> Aadhaar Card, Bank Passbook, and Category Certificates cross-verified.</span>
                </label>
              </div>
            </div>
          )}

          {officer.role === 'ROLE_DISTRICT_OFFICER' && (
            <div className="inspection-section">
              <h4>🏛️ Stage 2: District Officer Budget & Policy Clearance</h4>
              <div className="budget-alert-card">
                <div>
                  <strong>District Subsidy Budget Status (Pune District):</strong>
                  <p>Allocated District Budget: <strong>₹50,00,000</strong> &nbsp;|&nbsp; Funds Disbursed: <strong>₹11,50,000</strong> &nbsp;|&nbsp; Available Balance: <span className="green-text">₹38,50,000</span></p>
                </div>
                <span className="badge-verified">✓ Budget Available</span>
              </div>
              <p className="verified-note">✓ Verified and cleared by Senior Field Officer <strong>Rajesh Kumar</strong> (Field Check OK).</p>
            </div>
          )}

          {officer.role === 'ROLE_FINANCE_APPROVER' && (
            <div className="inspection-section">
              <h4>💳 Stage 3: Finance Approver Fund Release Configuration</h4>
              <p className="verified-note">★ Approved by District Commissioner <strong>Ananya Deshmukh</strong>. Ready for Payment Gateway Direct Benefit Transfer (DBT).</p>
              
              <div className="staged-disbursement-table">
                <h5>Configured Staged Release Breakdown ({app.appliedAmount}):</h5>
                {app.disbursements && app.disbursements.length > 0 ? (
                  app.disbursements.map((stg, i) => (
                    <div key={i} className="stage-disburse-row">
                      <span><strong>Stage {stg.stageNumber}:</strong> {stg.stageName} ({stg.percentage}%)</span>
                      <b>{stg.amount}</b>
                      <span className={stg.status === 'RELEASED' ? 'pill green-pill' : 'pill gray'}>{stg.status}</span>
                      {stg.status !== 'RELEASED' && (
                        <button className="primary disburse-btn" onClick={() => onDisburse(stg.stageNumber)}>
                          Release Stage {stg.stageNumber} Fund ➔
                        </button>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="stage-disburse-row">
                    <span>Full Grant Benefit Release</span>
                    <b>{app.appliedAmount}</b>
                    <button className="primary disburse-btn" onClick={() => onDisburse(1)}>
                      Release Full Funds via Gateway ➔
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="remarks-area">
            <label>Officer Audit Remarks & Inspection Notes:</label>
            <textarea
              rows="2"
              placeholder="Enter official remarks or feedback for beneficiary..."
              value={remarks}
              onChange={e => setRemarks(e.target.value)}
            />
          </div>
        </div>

        <div className="admin-modal-footer">
          <button className="btn-outline-danger" onClick={onReject}>
            ✕ Reject / Return Application
          </button>
          
          {officer.role === 'ROLE_FIELD_OFFICER' && (
            <button className="primary" onClick={onApprove} disabled={!landChecked || !incomeChecked || !identityChecked}>
              ✓ Approve & Forward to District Officer (FIELD_VERIFIED) ➔
            </button>
          )}

          {officer.role === 'ROLE_DISTRICT_OFFICER' && (
            <button className="primary" onClick={onApprove}>
              ★ Approve & Forward to Finance Approver (DISTRICT_APPROVED) ➔
            </button>
          )}

          {officer.role === 'ROLE_FINANCE_APPROVER' && (
            <button className="primary green-btn" onClick={() => onDisburse(1)}>
              💳 Execute Direct Benefit Transfer (DBT) Release ➔
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function PaymentGatewayModal({ txn, onClose }) {
  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true">
      <div className="payment-gateway-modal">
        <div className="gateway-success-header">
          <div className="gateway-checkmark">✓</div>
          <h2>Direct Benefit Transfer (DBT) Executed!</h2>
          <p>Simulated Payment Gateway transaction completed successfully.</p>
        </div>

        <div className="gateway-receipt-card">
          <div className="receipt-row">
            <span>Transaction Reference:</span>
            <code className="txn-code">{txn.txnRef}</code>
          </div>
          <div className="receipt-row">
            <span>Beneficiary Name:</span>
            <b>{txn.beneficiaryName}</b>
          </div>
          <div className="receipt-row">
            <span>Destination Bank Account:</span>
            <b>{txn.bankAccount}</b>
          </div>
          <div className="receipt-row">
            <span>IFSC Code:</span>
            <b>{txn.ifscCode}</b>
          </div>
          <div className="receipt-row">
            <span>Disbursement Stage:</span>
            <b>{txn.stageName}</b>
          </div>
          <div className="receipt-row highlight">
            <span>Amount Transferred:</span>
            <b className="released-amount">{txn.amountReleased}</b>
          </div>
          <div className="receipt-row">
            <span>Payment Status:</span>
            <span className="pill green-pill">SUCCESS_RELEASED (DBT-NPVI)</span>
          </div>
          <div className="receipt-row">
            <span>Timestamp:</span>
            <small>{txn.timestamp} 17:55:00 IST</small>
          </div>
        </div>

        <button className="primary full" onClick={onClose}>
          Done & Close Receipt
        </button>
      </div>
    </div>
  );
}

createRoot(document.getElementById('root')).render(<App />);
