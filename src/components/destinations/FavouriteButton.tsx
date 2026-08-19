import { Heart, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '../ui';

interface FavouriteButtonProps {
  isFavourite: boolean;
  loading?: boolean;
  disabled?: boolean;
  canSave?: boolean;
  onToggle?: () => void;
  loginHref?: string;
  className?: string;
  compact?: boolean;
  saveLabel?: string;
  savedLabel?: string;
  loginLabel?: string;
  touristOnlyLabel?: string;
}

export function FavouriteButton({
  isFavourite,
  loading = false,
  disabled = false,
  canSave = true,
  onToggle,
  loginHref = '/login',
  className,
  compact = false,
  saveLabel = 'Save',
  savedLabel = 'Saved',
  loginLabel = 'Sign in to save',
  touristOnlyLabel = 'Tourist only',
}: FavouriteButtonProps) {
  if (!canSave) {
    return (
      <Button type="button" variant="secondary" className={className} disabled>
        <Heart className="h-4 w-4" />
        {touristOnlyLabel}
      </Button>
    );
  }

  if (!onToggle) {
    return (
      <Button asChild type="button" variant="secondary" className={className}>
        <Link to={loginHref} className="inline-flex items-center gap-2">
          <Heart className="h-4 w-4" />
          {loginLabel}
        </Link>
      </Button>
    );
  }

  return (
    <Button
      type="button"
      variant={isFavourite ? 'primary' : 'secondary'}
      className={className}
      disabled={disabled || loading}
      onClick={onToggle}
      aria-pressed={isFavourite}
    >
      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Heart className={`h-4 w-4 ${isFavourite ? 'fill-current' : ''}`} />}
      {compact ? null : isFavourite ? savedLabel : saveLabel}
    </Button>
  );
}
