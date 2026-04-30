import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Share, MoreVertical, Link2, MessageCircle, X as CloseIcon, Flag, Phone } from 'lucide-react';
import { linksAPI } from '../../lib/api';

const Facebook = ({ className }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24"><path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" /></svg>
);
const Twitter = ({ className }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24"><path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723 10.054 10.054 0 01-3.127 1.184 4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" /></svg>
);
const Linkedin = ({ className }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" /></svg>
);
const Youtube = ({ className }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" /></svg>
);
const Instagram = ({ className }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" /></svg>
);

const SocialIcon = ({ type, url }) => {
  if (!url) return null;
  const icons = {
    tiktok: <div className="font-bold">TikTok</div>, // Using text placeholder if icon isn't standard in lucide
    whatsapp: <Phone className="w-5 h-5" />,
    instagram: <Instagram className="w-5 h-5" />,
    x: <Twitter className="w-5 h-5" />,
    youtube: <Youtube className="w-5 h-5" />,
    facebook: <Facebook className="w-5 h-5" />,
    snapchat: <div className="font-bold">Snap</div>,
  };

  return (
    <a href={url} target="_blank" rel="noopener noreferrer" className="p-2 hover:bg-gray-200 rounded-full transition-colors text-gray-800">
      {icons[type] || <Link2 className="w-5 h-5" />}
    </a>
  );
};

const ShareModal = ({ isOpen, onClose, url }) => {
  if (!isOpen) return null;

  const copyLink = () => {
    navigator.clipboard.writeText(url);
    alert('Link copied!');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-3xl w-full max-w-sm p-6 relative animate-in fade-in zoom-in duration-200">
        <button onClick={onClose} className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full">
          <CloseIcon className="w-5 h-5" />
        </button>
        
        <h3 className="text-center font-bold text-xl mb-6">Share link</h3>
        
        <div className="flex overflow-x-auto gap-4 pb-4 snap-x no-scrollbar">
          <button onClick={copyLink} className="flex flex-col items-center gap-2 min-w-[70px] snap-start">
            <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center">
              <Link2 className="w-6 h-6" />
            </div>
            <span className="text-xs font-medium">Copy link</span>
          </button>
          
          <a href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}`} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center gap-2 min-w-[70px] snap-start">
            <div className="w-14 h-14 bg-black text-white rounded-full flex items-center justify-center">
              <Twitter className="w-6 h-6" />
            </div>
            <span className="text-xs font-medium">X</span>
          </a>

          <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center gap-2 min-w-[70px] snap-start">
            <div className="w-14 h-14 bg-blue-600 text-white rounded-full flex items-center justify-center">
              <Facebook className="w-6 h-6" />
            </div>
            <span className="text-xs font-medium">Facebook</span>
          </a>

          <a href={`https://api.whatsapp.com/send?text=${encodeURIComponent(url)}`} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center gap-2 min-w-[70px] snap-start">
            <div className="w-14 h-14 bg-green-500 text-white rounded-full flex items-center justify-center">
              <MessageCircle className="w-6 h-6" />
            </div>
            <span className="text-xs font-medium">WhatsApp</span>
          </a>
          
          <a href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center gap-2 min-w-[70px] snap-start">
            <div className="w-14 h-14 bg-blue-700 text-white rounded-full flex items-center justify-center">
              <Linkedin className="w-6 h-6" />
            </div>
            <span className="text-xs font-medium">LinkedIn</span>
          </a>
        </div>

        <div className="mt-4 pt-4 border-t border-gray-100">
          <button className="flex items-center gap-2 text-gray-500 hover:text-gray-800 text-sm font-medium w-full p-2 hover:bg-gray-50 rounded-xl transition-colors">
            <Flag className="w-4 h-4" />
            Report link
          </button>
        </div>
      </div>
    </div>
  );
};

export default function LinksPage() {
  const { username } = useParams();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await linksAPI.getProfileData(username || 'default');
        setProfile(data);
      } catch (error) {
        console.error("Failed to load profile", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [username]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-100">Loading...</div>;
  }

  if (!profile) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-100">Profile not found</div>;
  }

  return (
    <div 
      className="min-h-screen flex justify-center py-10 px-4 transition-colors duration-300 font-sans"
      style={{ backgroundColor: '#e5e7eb' }}
      dir="rtl"
    >
      <div 
        className="w-full max-w-lg flex flex-col items-center relative rounded-[3rem] p-6 shadow-xl"
        style={{ backgroundColor: profile.theme?.bgColor || '#f3f4f6' }}
      >
        {/* Share Button */}
        <div className="w-full flex justify-between items-center mb-4">
          <div className="w-10"></div> {/* Spacer */}
          <button 
            onClick={() => setIsShareModalOpen(true)}
            className="p-3 bg-white hover:bg-gray-50 rounded-full transition-all shadow-sm"
          >
            <Share className="w-5 h-5 text-gray-800" />
          </button>
        </div>

        {/* Profile Header */}
        <div className="flex flex-col items-center mb-8 w-full px-4 text-center">
          {profile.avatar ? (
            <img src={profile.avatar} alt={profile.name} className="w-24 h-24 rounded-full object-cover mb-4 shadow-sm" />
          ) : (
            <div className="w-24 h-24 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-3xl font-bold mb-4 shadow-sm">
              {profile.name?.charAt(0)?.toUpperCase()}
            </div>
          )}
          <h1 className="text-xl font-bold mb-2 text-gray-900">{profile.name}</h1>
          {profile.title && <p className="text-sm font-semibold text-gray-800 mb-2">{profile.title}</p>}
          {profile.bio && <p className="text-sm text-gray-600 whitespace-pre-wrap">{profile.bio}</p>}
        </div>

        {/* Social Icons */}
        {profile.socials && Object.values(profile.socials).some(Boolean) && (
          <div className="flex flex-wrap justify-center gap-2 mb-8">
            {Object.entries(profile.socials).map(([key, url]) => (
               <SocialIcon key={key} type={key} url={url} />
            ))}
          </div>
        )}

        {/* Links */}
        <div className="flex flex-col w-full gap-4 mb-12">
          {profile.links?.map((link) => (
            <a
              key={link.id}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="relative group flex items-center justify-between w-full p-4 rounded-xl transition-all hover:scale-[1.02] active:scale-[0.98] shadow-sm hover:shadow-md"
              style={{ 
                backgroundColor: profile.theme?.buttonBgColor || '#ffffff',
                color: profile.theme?.buttonTextColor || '#000000'
              }}
            >
              <div className="w-8 h-8 flex items-center justify-center">
                 {/* Optional custom icon here */}
                 <Link2 className="w-5 h-5" />
              </div>
              <span className="font-medium text-center flex-1">{link.title}</span>
              <div className="w-8 h-8 flex items-center justify-center opacity-70 group-hover:opacity-100 transition-opacity">
                <MoreVertical className="w-5 h-5" />
              </div>
            </a>
          ))}
        </div>

        <div className="mt-auto pt-8 pb-4">
          <button className="bg-white hover:bg-gray-50 px-6 py-3 rounded-full font-bold shadow-sm transition-colors text-sm">
            Join intlakaa on Linktree
          </button>
        </div>
        
        <div className="text-[10px] text-gray-500 flex gap-2 justify-center mt-4">
          <a href="#" className="hover:underline">Cookie Preferences</a>
          <span>•</span>
          <a href="#" className="hover:underline">Report</a>
          <span>•</span>
          <a href="#" className="hover:underline">Privacy</a>
          <span>•</span>
          <a href="#" className="hover:underline">More from Linktree</a>
        </div>
      </div>

      <ShareModal 
        isOpen={isShareModalOpen} 
        onClose={() => setIsShareModalOpen(false)} 
        url={window.location.href} 
      />
    </div>
  );
}
