"use client";

import React from 'react';
import Image from 'next/image';
import { User, MapPin, Calendar, Star, Package, Phone, MessageCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { UserProfile } from '@/lib/user-profile';
import { Icon } from '@/components/ui/Icon';

// Extend UserProfile with public phone/whatsapp fields and visibility flags
interface PublicUserProfile extends UserProfile {
  phone?: string;
  whatsapp?: string;
  showPhone?: boolean;
  showWhatsapp?: boolean; // all from users_public
}

interface UserProfileCardProps {
  profile: PublicUserProfile | null;
  isLoading?: boolean;
  error?: string | null;
  variant?: 'compact' | 'full';
  showActions?: boolean;
}

export default function UserProfileCard({
  profile,
  isLoading = false,
  error = null,
  variant = 'full',
  showActions = false
}: Omit<UserProfileCardProps, 'profile'> & { profile: PublicUserProfile | null }) {
  if (isLoading) {
    return (
      <div className="animate-pulse bg-[var(--accent)] rounded-lg p-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-[var(--accent-dark)]"></div>
          <div className="flex-1">
            <div className="h-4 bg-[var(--accent-dark)] rounded w-24 mb-2"></div>
            <div className="h-3 bg-[var(--accent-dark)] rounded w-32"></div>
          </div>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="bg-red-50 text-red-500 rounded-lg p-4">
        <p>Error loading profile: {error}</p>
      </div>
    );
  }
  
  if (!profile) {
    return (
      <div className="bg-[var(--accent)] rounded-lg p-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-[var(--accent-dark)] flex items-center justify-center">
            <Icon 
              icon={User} 
              size={32} 
              color="var(--foreground)/40" 
            />
          </div>
          <div>
            <p className="font-medium">Seller</p>
            <p className="text-sm text-[var(--foreground)]/60">Profile not available</p>
          </div>
        </div>
      </div>
    );
  }
  
  // Format the join date
  const joinDate = profile.createdAt ? 
    formatDistanceToNow(new Date(profile.createdAt.toDate ? profile.createdAt.toDate() : profile.createdAt), { addSuffix: true }) : 
    'Recently';
  
  if (variant === 'compact') {
    return (
      <div className="bg-[var(--accent)] rounded-lg p-3">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-full bg-[var(--accent-dark)] overflow-hidden flex items-center justify-center">
            {profile.photoURL ? (
              <Image 
                src={profile.photoURL} 
                alt={profile.displayName} 
                width={40} 
                height={40} 
                className="object-cover" 
              />
            ) : (
              <Icon 
                icon={User} 
                size={32} 
                color="var(--foreground)/40" 
              />
            )}
          </div>
          <div>
            <p className="font-medium text-sm">{profile.displayName}</p>
            <div className="flex items-center text-xs text-[var(--foreground)]/60">
              <Icon 
                icon={Calendar} 
                size={16} 
                color="var(--foreground)/60" 
                className="mr-1" 
              />
              <span>Joined {joinDate}</span>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="bg-[var(--accent)] rounded-lg p-4">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-16 h-16 rounded-full bg-[var(--accent-dark)] overflow-hidden flex items-center justify-center">
          {profile.photoURL ? (
            <Image 
              src={profile.photoURL} 
              alt={profile.displayName} 
              width={64} 
              height={64} 
              className="object-cover" 
            />
          ) : (
            <Icon 
              icon={User} 
              size={32} 
              color="var(--foreground)/40" 
            />
          )}
        </div>
        <div>
          <h3 className="font-medium text-lg">{profile.displayName}</h3>
          <div className="flex items-center text-sm text-[var(--foreground)]/60">
            <Icon 
              icon={Calendar} 
              size={16} 
              color="var(--foreground)/60" 
              className="mr-1" 
            />
            <span>Joined {joinDate}</span>
          </div>
          {profile.university && (
            <div className="flex items-center text-sm text-[var(--foreground)]/60 mt-1">
              <Icon 
                icon={MapPin} 
                size={16} 
                color="var(--foreground)/60" 
                className="mr-1" 
              />
              <span>{profile.university}</span>
            </div>
          )}
          {/* Phone and WhatsApp, only if public */}
          {profile.showPhone && profile.phone && (
            <div className="flex items-center text-sm text-[var(--foreground)]/60 mt-1">
              <Icon 
                icon={Phone} 
                size={16} 
                color="var(--foreground)/60" 
                className="mr-1" 
              />
              <span>{profile.phone}</span>
            </div>
          )}
          {profile.showWhatsapp && profile.whatsapp && (
            <div className="flex items-center text-sm text-[var(--foreground)]/60 mt-1">
              <Icon 
                icon={MessageCircle} 
                size={16} 
                color="var(--foreground)/60" 
                className="mr-1 text-green-600" 
              />
              <a
                href={`https://wa.me/${profile.whatsapp.replace(/[^\d]/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-green-700"
              >
                WhatsApp
              </a>
            </div>
          )}
        </div>
      </div>
      
      <div className="flex items-center justify-between border-t border-[var(--border)] pt-3">
        <div className="flex items-center">
          {profile.rating > 0 && (
            <div className="flex items-center mr-4">
              <Icon 
                icon={Star} 
                size={16} 
                color="var(--foreground)/50" 
                className="mr-1" 
              />
              <span className="font-medium">{profile.rating.toFixed(1)}</span>
              <span className="text-xs text-[var(--foreground)]/60 ml-1">
                ({profile.ratingCount} {profile.ratingCount === 1 ? 'review' : 'reviews'})
              </span>
            </div>
          )}
          
          <div className="flex items-center">
            <Icon 
              icon={Package} 
              size={16} 
              color="var(--foreground)/60" 
              className="mr-1" 
            />
            <span className="text-sm">
              {profile.totalListings} {profile.totalListings === 1 ? 'listing' : 'listings'}
            </span>
          </div>
        </div>
        
        {showActions && (
          <div className="flex gap-2">
            <button className="px-3 py-1 text-sm bg-[var(--primary)] text-white rounded-md">
              Contact
            </button>
            <button className="px-3 py-1 text-sm border border-[var(--border)] rounded-md">
              View Profile
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
