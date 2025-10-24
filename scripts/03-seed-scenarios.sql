-- Seed sample business scenarios with Liberian context

INSERT INTO scenarios (title, description, context, difficulty_level, career_relevance, options) VALUES
  (
    'Market Day Pricing Strategy',
    'Your small business sells fresh produce at Waterside Market. Tomato prices have dropped due to a good harvest season.',
    'Waterside Market in Monrovia is one of Liberia''s busiest trading centers. Understanding supply and demand is crucial for success.',
    1,
    ARRAY['CEO', 'Marketing Lead', 'Operations Manager'],
    '[
      {"id": "A", "text": "Lower prices to match competitors and increase volume", "impact": "financial_literacy"},
      {"id": "B", "text": "Keep prices the same and emphasize quality", "impact": "marketing"},
      {"id": "C", "text": "Bundle tomatoes with other vegetables for a package deal", "impact": "innovation"},
      {"id": "D", "text": "Wait and see what other vendors do first", "impact": "risk_management"}
    ]'::jsonb
  ),
  (
    'Mobile Money Expansion',
    'Your tech startup wants to expand mobile payment services to rural areas, but infrastructure is limited.',
    'Mobile money services like Orange Money and MTN Mobile Money are growing in Liberia, but rural connectivity remains a challenge.',
    3,
    ARRAY['CTO', 'CEO', 'Product Manager'],
    '[
      {"id": "A", "text": "Partner with local agents in rural communities", "impact": "networking"},
      {"id": "B", "text": "Invest heavily in infrastructure first", "impact": "financial_literacy"},
      {"id": "C", "text": "Focus on urban areas where infrastructure exists", "impact": "risk_management"},
      {"id": "D", "text": "Develop an offline-first solution that syncs later", "impact": "innovation"}
    ]'::jsonb
  ),
  (
    'Employee Retention Challenge',
    'Your best software developer received a job offer from a company in Ghana with higher pay. How do you respond?',
    'Brain drain is a real challenge for Liberian businesses as talented professionals seek opportunities abroad.',
    2,
    ARRAY['CEO', 'HR Manager'],
    '[
      {"id": "A", "text": "Match the salary offer immediately", "impact": "financial_literacy"},
      {"id": "B", "text": "Offer equity/ownership stake in the company", "impact": "leadership"},
      {"id": "C", "text": "Create a career development plan with clear growth path", "impact": "strategic_thinking"},
      {"id": "D", "text": "Let them go and hire someone new", "impact": "risk_management"}
    ]'::jsonb
  ),
  (
    'Supply Chain Disruption',
    'Heavy rains have damaged roads between Monrovia and Gbarnga, delaying your product shipments by 2 weeks.',
    'Infrastructure challenges are common in Liberia, especially during rainy season. Businesses must plan for disruptions.',
    2,
    ARRAY['Operations Manager', 'CEO', 'Supply Chain Manager'],
    '[
      {"id": "A", "text": "Find alternative routes even if more expensive", "impact": "problem_solving"},
      {"id": "B", "text": "Communicate delays to customers and offer discounts", "impact": "communication"},
      {"id": "C", "text": "Build local inventory warehouses to prevent future issues", "impact": "strategic_thinking"},
      {"id": "D", "text": "Switch to local suppliers to reduce dependency", "impact": "innovation"}
    ]'::jsonb
  ),
  (
    'Social Media Marketing Crisis',
    'A customer posted a negative review on Facebook that''s going viral. The complaint is partially valid.',
    'Social media is increasingly important for Liberian businesses, with Facebook being the primary platform for customer engagement.',
    3,
    ARRAY['Marketing Lead', 'CEO', 'Customer Service Manager'],
    '[
      {"id": "A", "text": "Respond publicly with an apology and solution", "impact": "communication"},
      {"id": "B", "text": "Contact the customer privately to resolve the issue", "impact": "customer_service"},
      {"id": "C", "text": "Ignore it and let it blow over", "impact": "risk_management"},
      {"id": "D", "text": "Launch a positive PR campaign to counter the negativity", "impact": "marketing"}
    ]'::jsonb
  )
ON CONFLICT DO NOTHING;
