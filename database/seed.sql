-- ============================================================================
-- TECHRESCUE ENTERPRISE IT SUPPORT - SEED DATA
-- ============================================================================

-- Seed Users
INSERT INTO users (id, name, email, password_hash, role, company, phone, location, title, bio, rating, reviews_count, hourly_rate, experience_years, verified, is_available, completed_jobs_count, total_earnings)
VALUES 
(
    'usr-client-1',
    'Sonu Patel',
    'sonu.patel@fintechglobal.com',
    '$2a$10$abcdefghijklmnopqrstuvwxy12345678901234567890123456789012',
    'CLIENT',
    'FinTech Global Systems',
    '+91 98201 44521',
    'Gurgaon, Haryana',
    'Director of IT & Enterprise Infrastructure',
    'VP of Infrastructure overseeing core banking gateways and hybrid multicloud environments.',
    5.0, 0, 0, 15, true, true, 0, 0
),
(
    'usr-expert-1',
    'Rahul Sharma',
    'rahul.sharma@cloudarchitects.io',
    '$2a$10$abcdefghijklmnopqrstuvwxy12345678901234567890123456789012',
    'EXPERT',
    'Independent Cloud Consulting',
    '+91 99100 88231',
    'Gurgaon, NCR',
    'Principal Cloud & Network Architect',
    'Former Tier-3 Data Center Architect specializing in enterprise hybrid cloud, Azure ExpressRoute migrations, and distributed zero-trust network design.',
    4.8, 84, 1500.00, 12, true, true, 127, 85000.00
),
(
    'usr-expert-2',
    'Priya Venkatesh',
    'priya.v@securesolutions.org',
    '$2a$10$abcdefghijklmnopqrstuvwxy12345678901234567890123456789012',
    'EXPERT',
    'CyberDefense Partners',
    '+91 98450 77123',
    'Bangalore, Karnataka',
    'Enterprise Security & Compliance Lead',
    'Lead security investigator specializing in rapid incident triage, ransomware mitigation, and corporate firewall policy audits.',
    4.9, 62, 1800.00, 10, true, true, 96, 112000.00
),
(
    'usr-eng-1',
    'Rajesh Kumar',
    'rajesh.k@fieldtechrescue.in',
    '$2a$10$abcdefghijklmnopqrstuvwxy12345678901234567890123456789012',
    'ENGINEER',
    'Metro Field Engineering Network',
    '+91 97690 12345',
    'Mumbai, Maharashtra',
    'Senior On-Site Hardware & Cabling Engineer',
    'Rapid dispatch field technician equipped with optical OTDR tester, Fluke Versiv certifier, and standard replacement power supplies/optics.',
    4.8, 127, 850.00, 6, true, true, 127, 68500.00
),
(
    'usr-admin-1',
    'Lakshya System Admin',
    'admin@techrescue.io',
    '$2a$10$abcdefghijklmnopqrstuvwxy12345678901234567890123456789012',
    'ADMIN',
    'TechRescue Global Ops',
    '+91 11 4500 9000',
    'Cyber City HQ, India',
    'Operations Director & Super Admin',
    'Global platform supervisor directing incident response protocols and escrow ledgers.',
    5.0, 0, 0, 14, true, true, 0, 0
)
ON CONFLICT (id) DO NOTHING;

-- Seed Skills
INSERT INTO user_skills (user_id, skill) VALUES
('usr-expert-1', 'Azure Infrastructure'),
('usr-expert-1', 'AWS Solutions'),
('usr-expert-1', 'Terraform'),
('usr-expert-1', 'Kubernetes'),
('usr-expert-1', 'Palo Alto Firewall'),
('usr-expert-1', 'BGP Routing'),
('usr-eng-1', 'Structured Cabling (Cat6a/Fiber)'),
('usr-eng-1', 'Cisco Catalyst 9300/9500'),
('usr-eng-1', 'Server Rack Integration'),
('usr-eng-1', 'Fluke Networks Certification')
ON CONFLICT DO NOTHING;

-- Seed Queries
INSERT INTO queries (
    id, ticket_number, title, category, subcategory, impact, urgency, priority, status,
    client_id, assigned_expert_id, assigned_engineer_id,
    short_description, detailed_description, environment, assignment_group,
    estimated_cost, actual_cost, is_escrow_funded, is_payment_released,
    sla_deadline, sla_breached
) VALUES
(
    'tkt-10231',
    'INC-20261008-0001',
    'Azure VM Connectivity & ExpressRoute Gateway Packet Drop',
    'Cloud Infrastructure',
    'Virtual Network & Peering',
    'HIGH',
    'HIGH',
    'HIGH',
    'IN_PROGRESS',
    'usr-client-1',
    'usr-expert-1',
    NULL,
    'Core transaction cluster VMs in Azure Central India losing peer route packets intermittently through ExpressRoute gateway.',
    '4 production API worker nodes in vnet-fintech-prod encountering TCP resets when communicating with on-prem core SQL ledger. Ping drop rate is ~18% through ER circuit.',
    'Azure Cloud',
    'Cloud Operations',
    4500.00,
    4500.00,
    true,
    false,
    NOW() + INTERVAL '4 hours',
    false
),
(
    'tkt-10230',
    'INC-20261008-0002',
    'Core Cisco Catalyst 9300 Switch Stack Port Flapping in Mumbai DC',
    'Hardware & Servers',
    'Switching & Physical Cabling',
    'ENTERPRISE',
    'HIGH',
    'CRITICAL',
    'ON_SITE',
    'usr-client-1',
    NULL,
    'usr-eng-1',
    'Stack cable on switch member #2 failing, causing flapping of uplinks to secondary core.',
    'Physical StackWise-480 cable on Member 2 in Rack B-04 is showing CRC errors. Requires on-site replacement of stack jumper cable and inspection with optical power meter.',
    'On-Premises Datacenter',
    'Desktop & Hardware Engineering',
    3800.00,
    3800.00,
    true,
    false,
    NOW() + INTERVAL '2 hours',
    false
),
(
    'tkt-10232',
    'INC-20261008-0004',
    'Branch Office SD-WAN Edge Gateway Total Disconnect in Pune',
    'Network & Firewall',
    'SD-WAN & Edge Tunneling',
    'HIGH',
    'HIGH',
    'HIGH',
    'OPEN',
    'usr-client-1',
    NULL,
    NULL,
    'Fortinet FortiGate 60F lost IPsec tunnel to headquarters after primary ISP optical cut.',
    'Failover LTE SIM card on WAN2 is not registering with local telecom APN. 45 employees at Pune branch office unable to access SAP or intranet banking applications.',
    'Corporate Office LAN',
    'Core Networking',
    3500.00,
    NULL,
    true,
    false,
    NOW() + INTERVAL '4 hours',
    false
)
ON CONFLICT (id) DO NOTHING;

-- Seed Payments
INSERT INTO payments (id, ticket_id, client_id, payee_id, amount, platform_fee, net_payout, status, invoice_number)
VALUES
('pay-101', 'tkt-10231', 'usr-client-1', 'usr-expert-1', 4500.00, 450.00, 4050.00, 'ESCROW_HELD', 'INV-TR-2026-0940'),
('pay-102', 'tkt-10230', 'usr-client-1', 'usr-eng-1', 3800.00, 380.00, 3420.00, 'ESCROW_HELD', 'INV-TR-2026-0938')
ON CONFLICT (id) DO NOTHING;
