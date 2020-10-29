/**
 * @jest-environment jsdom
 */
import React from 'react';
import { render } from '@testing-library/react';
import App from '../App';

it('works', () => {
  const { container } = render(<App />);
  expect(container.textContent).toMatch(/JWT/i);
  expect(container.textContent).toMatch(/Simple Token/i);
  expect(container.textContent).toMatch(/OAuth/i);
});
