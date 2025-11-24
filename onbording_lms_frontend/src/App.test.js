import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import App from './App';

test('renders home links and navigable routes', () => {
  render(
    <MemoryRouter initialEntries={['/']}>
      <App />
    </MemoryRouter>
  );
  expect(screen.getByText(/Onboarding LMS/i)).toBeInTheDocument();
  expect(screen.getByRole('link', { name: /Catalog/i })).toBeInTheDocument();
  expect(screen.getByRole('link', { name: /Documents/i })).toBeInTheDocument();
});

test('renders documents route', () => {
  render(
    <MemoryRouter initialEntries={['/documents']}>
      <App />
    </MemoryRouter>
  );
  expect(screen.getByText(/Onboarding Documents/i)).toBeInTheDocument();
  // Ensure no extraction/download notice appears
  expect(screen.queryByText(/extracted for accessibility/i)).not.toBeInTheDocument();
  expect(screen.queryByRole('link', { name: /Download original/i })).not.toBeInTheDocument();
});

test('redirects protected route to login when not authenticated', () => {
  render(
    <MemoryRouter initialEntries={['/dashboard']}>
      <App />
    </MemoryRouter>
  );
  expect(screen.getByText(/Login/i)).toBeInTheDocument();
});
