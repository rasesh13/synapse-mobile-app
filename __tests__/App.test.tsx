/**
 * @format
 */

import 'react-native';
import React from 'react';
import { it, jest } from '@jest/globals';
import renderer from 'react-test-renderer';

jest.mock('@vapi-ai/react-native', () => {
  return jest.fn().mockImplementation(() => ({
    start: jest.fn(),
    stop: jest.fn(),
    on: jest.fn(),
  }));
});
jest.mock('@daily-co/react-native-daily-js', () => ({}));
jest.mock('@daily-co/react-native-webrtc', () => ({}));

import App from '../App';

it('renders correctly', () => {
  renderer.create(<App />);
});

