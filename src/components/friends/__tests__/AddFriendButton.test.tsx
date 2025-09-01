import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { AddFriendButton } from '../AddFriendButton';

describe('AddFriendButton', () => {
  it('should render button with correct text and icon', () => {
    render(<AddFriendButton onClick={vi.fn()} />);
    
    expect(screen.getByRole('button', { name: /add new friend/i })).toBeInTheDocument();
    expect(screen.getByText('Add Friend')).toBeInTheDocument();
  });

  it('should call onClick when clicked', () => {
    const handleClick = vi.fn();
    render(<AddFriendButton onClick={handleClick} />);
    
    const button = screen.getByRole('button', { name: /add new friend/i });
    fireEvent.click(button);
    
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('should be disabled when isDisabled prop is true', () => {
    render(<AddFriendButton onClick={vi.fn()} isDisabled={true} />);
    
    const button = screen.getByRole('button', { name: /add new friend/i });
    expect(button).toBeDisabled();
  });

  it('should not be disabled by default', () => {
    render(<AddFriendButton onClick={vi.fn()} />);
    
    const button = screen.getByRole('button', { name: /add new friend/i });
    expect(button).not.toBeDisabled();
  });
});
