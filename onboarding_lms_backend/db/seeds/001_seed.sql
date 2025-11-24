-- Seed initial documents
INSERT INTO documents (key, name, version, content_url)
VALUES
  ('code_of_conduct', 'Code of Conduct', 'v1', '/content/code_of_conduct.md'),
  ('nda', 'Non-Disclosure Agreement', 'v1', '/content/nda.md')
ON CONFLICT (key) DO UPDATE
SET name = EXCLUDED.name,
    version = EXCLUDED.version,
    content_url = EXCLUDED.content_url;

-- Seed initial courses (basic placeholders)
INSERT INTO courses (id, title, description, category)
VALUES
  (uuid_generate_v4(), 'Company Onboarding 101', 'Start here to learn the essentials about the company.', 'Onboarding'),
  (uuid_generate_v4(), 'Product Overview', 'Get to know our product and its value proposition.', 'Learning');
