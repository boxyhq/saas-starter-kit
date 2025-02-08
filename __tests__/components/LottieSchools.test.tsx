import { render, screen } from '@testing-library/react';
import LottieSchools from '@/components/defaultLanding/LottieSchools';
import '@testing-library/jest-dom';

describe('LottieSchools Component', () => {
  it('renders the Lottie player', () => {
    render(<LottieSchools />);
    const lottieElement = document.querySelector('dotlottie-player');
    expect(lottieElement).toBeInTheDocument();
  });

  it('has correct animation properties', () => {
    render(<LottieSchools />);
    const lottieElement = document.querySelector('dotlottie-player');
    expect(lottieElement).toHaveAttribute('autoplay');
    expect(lottieElement).toHaveAttribute('loop');
  });
});