export type MockInquiryStatus =
  | "New"
  | "Contacted"
  | "Viewing Scheduled"
  | "Negotiating"
  | "Converted";

export type MockInquiry = {
  id: string;
  property_title: string;
  buyer_name: string;
  buyer_email: string;
  message: string;
  status: MockInquiryStatus;
  created_at: string;
};

export const mockInquiries: MockInquiry[] = [
  {
    id: "inq-1",
    property_title: "Waterfront Five-Bedroom Banana Island Duplex",
    buyer_name: "Ify Madu",
    buyer_email: "buyer@realityng.com",
    message: "I am interested in a virtual walkthrough and title documentation review.",
    status: "New",
    created_at: "2026-06-23T08:30:00Z",
  },
  {
    id: "inq-2",
    property_title: "Maitama Diplomatic Residence",
    buyer_name: "Halima Sani",
    buyer_email: "halima.buyer@realityng.com",
    message: "Can the viewing be scheduled for Friday afternoon with my spouse?",
    status: "Viewing Scheduled",
    created_at: "2026-06-22T14:20:00Z",
  },
  {
    id: "inq-3",
    property_title: "Lekki Phase 1 Serviced Apartment",
    buyer_name: "Sade Lawal",
    buyer_email: "sade.buyer@realityng.com",
    message: "Please confirm service charge, power arrangement, and annual rent terms.",
    status: "Contacted",
    created_at: "2026-06-22T11:05:00Z",
  },
  {
    id: "inq-4",
    property_title: "Jabi Lake View Shortlet Penthouse",
    buyer_name: "Tara Ojo",
    buyer_email: "tara.buyer@realityng.com",
    message: "I would like projected occupancy and management fee assumptions.",
    status: "Negotiating",
    created_at: "2026-06-21T16:45:00Z",
  },
  {
    id: "inq-5",
    property_title: "GRA Phase 2 Port Harcourt Hotel",
    buyer_name: "Emeka Okoro",
    buyer_email: "emeka.buyer@realityng.com",
    message: "Send the last twelve months of revenue and occupancy summaries.",
    status: "New",
    created_at: "2026-06-21T10:10:00Z",
  },
  {
    id: "inq-6",
    property_title: "Uyo Luxury Shortlet Villas",
    buyer_name: "Samuel Etim",
    buyer_email: "samuel.buyer@realityng.com",
    message: "Can the owner accept staged payment after due diligence?",
    status: "Contacted",
    created_at: "2026-06-20T13:35:00Z",
  },
  {
    id: "inq-7",
    property_title: "Enugu Independence Layout Duplex",
    buyer_name: "Kingsley Nnamdi",
    buyer_email: "kingsley.buyer@realityng.com",
    message: "Please share the deed and survey coordinates before inspection.",
    status: "New",
    created_at: "2026-06-20T09:15:00Z",
  },
  {
    id: "inq-8",
    property_title: "Ibadan Jericho Executive Apartments",
    buyer_name: "Yewande Akin",
    buyer_email: "yewande.buyer@realityng.com",
    message: "I want to compare rental yield against Akobo and Bodija apartments.",
    status: "Viewing Scheduled",
    created_at: "2026-06-19T15:05:00Z",
  },
  {
    id: "inq-9",
    property_title: "Ikoyi Mixed-Use Commercial Building",
    buyer_name: "David Oluwaseun",
    buyer_email: "david.buyer@realityng.com",
    message: "Our investment committee needs tenant schedule and lease terms.",
    status: "Negotiating",
    created_at: "2026-06-19T12:55:00Z",
  },
  {
    id: "inq-10",
    property_title: "Asokoro Hillside Residential Land",
    buyer_name: "Halima Sani",
    buyer_email: "halima.buyer@realityng.com",
    message: "Please confirm plot size, access road status, and title type.",
    status: "Contacted",
    created_at: "2026-06-18T17:20:00Z",
  },
  {
    id: "inq-11",
    property_title: "Port Harcourt Old GRA Family Home",
    buyer_name: "Emeka Okoro",
    buyer_email: "emeka.buyer@realityng.com",
    message: "I need a home inspection report and security details.",
    status: "Converted",
    created_at: "2026-06-18T09:50:00Z",
  },
  {
    id: "inq-12",
    property_title: "Oniru Beachfront Shortlet Apartment",
    buyer_name: "Tara Ojo",
    buyer_email: "tara.buyer@realityng.com",
    message: "Please send furniture inventory and current booking performance.",
    status: "Viewing Scheduled",
    created_at: "2026-06-17T18:40:00Z",
  },
  {
    id: "inq-13",
    property_title: "Wuse 2 Boutique Hotel",
    buyer_name: "Obinna Iroegbu",
    buyer_email: "obinna.buyer@realityng.com",
    message: "I am reviewing hospitality assets and would like the inspection pack.",
    status: "New",
    created_at: "2026-06-17T14:00:00Z",
  },
  {
    id: "inq-14",
    property_title: "Alausa Ikeja Corporate Office",
    buyer_name: "Sade Lawal",
    buyer_email: "sade.buyer@realityng.com",
    message: "Can the landlord offer fit-out allowance for a three-year lease?",
    status: "Negotiating",
    created_at: "2026-06-16T13:10:00Z",
  },
  {
    id: "inq-15",
    property_title: "Akobo Gated Estate Duplex",
    buyer_name: "Yewande Akin",
    buyer_email: "yewande.buyer@realityng.com",
    message: "We are ready to proceed if legal due diligence is clean.",
    status: "Converted",
    created_at: "2026-06-15T10:25:00Z",
  },
];
