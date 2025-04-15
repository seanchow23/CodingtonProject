import '@testing-library/jest-dom';

if (!global.URL) {
  global.URL = {};
}
global.URL.createObjectURL = jest.fn();

if (!window.URL) {
  window.URL = {};
}
window.URL.createObjectURL = jest.fn();
