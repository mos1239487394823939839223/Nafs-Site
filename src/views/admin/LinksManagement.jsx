import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Save, GripVertical } from 'lucide-react';
import { linksAPI } from '../../lib/api';
import toast from 'react-hot-toast';
import Button from '../../components/ui/Button';

export default function LinksManagement() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await linksAPI.getProfileData('default');
        setProfile(data);
      } catch (error) {
        toast.error("Failed to load profile data");
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile(prev => ({ ...prev, [name]: value }));
  };

  const handleSocialChange = (e) => {
    const { name, value } = e.target;
    setProfile(prev => ({
      ...prev,
      socials: { ...prev.socials, [name]: value }
    }));
  };

  const handleLinkChange = (index, field, value) => {
    const newLinks = [...profile.links];
    newLinks[index][field] = value;
    setProfile(prev => ({ ...prev, links: newLinks }));
  };

  const addLink = () => {
    setProfile(prev => ({
      ...prev,
      links: [...prev.links, { id: Date.now(), title: '', url: '', icon: 'default' }]
    }));
  };

  const removeLink = (index) => {
    const newLinks = [...profile.links];
    newLinks.splice(index, 1);
    setProfile(prev => ({ ...prev, links: newLinks }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await linksAPI.updateProfileData('default', profile);
      toast.success("Profile updated successfully");
    } catch (error) {
      toast.error("Failed to save profile");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8 animate-in fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Links Profile Management</h1>
          <p className="text-gray-500 text-sm">Manage the public link tree page</p>
        </div>
        <Button onClick={handleSave} disabled={saving} className="flex items-center gap-2">
          <Save className="w-4 h-4" /> {saving ? "Saving..." : "Save Changes"}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Profile Info */}
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm space-y-4">
          <h2 className="text-lg font-semibold border-b pb-2">Profile Details</h2>
          
          <div>
            <label className="block text-sm font-medium mb-1">Name</label>
            <input 
              type="text" 
              name="name" 
              value={profile.name || ''} 
              onChange={handleChange}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-primary outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Title / Subtitle</label>
            <input 
              type="text" 
              name="title" 
              value={profile.title || ''} 
              onChange={handleChange}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-primary outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Bio</label>
            <textarea 
              name="bio" 
              value={profile.bio || ''} 
              onChange={handleChange}
              rows={4}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-primary outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Avatar Image URL</label>
            <input 
              type="text" 
              name="avatar" 
              value={profile.avatar || ''} 
              onChange={handleChange}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-primary outline-none"
            />
          </div>
        </div>

        {/* Social Icons */}
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm space-y-4">
          <h2 className="text-lg font-semibold border-b pb-2">Social Links</h2>
          
          {['tiktok', 'whatsapp', 'instagram', 'x', 'youtube', 'facebook', 'snapchat'].map(social => (
            <div key={social} className="flex items-center gap-3">
              <label className="w-24 text-sm font-medium capitalize">{social}</label>
              <input 
                type="text" 
                name={social} 
                value={profile.socials?.[social] || ''} 
                onChange={handleSocialChange}
                placeholder={`https://${social}.com/...`}
                className="flex-1 p-2 border rounded-md focus:ring-2 focus:ring-primary outline-none text-sm"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Links List */}
      <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b pb-2">
          <h2 className="text-lg font-semibold">Custom Links</h2>
          <Button onClick={addLink} variant="outline" size="sm" className="flex items-center gap-1">
            <Plus className="w-4 h-4" /> Add Link
          </Button>
        </div>

        <div className="space-y-3 mt-4">
          {profile.links?.map((link, index) => (
            <div key={link.id} className="flex items-center gap-4 bg-gray-50 p-4 rounded-lg border">
              <div className="cursor-move text-gray-400">
                <GripVertical className="w-5 h-5" />
              </div>
              <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-3">
                <input 
                  type="text" 
                  value={link.title} 
                  onChange={(e) => handleLinkChange(index, 'title', e.target.value)}
                  placeholder="Link Title (e.g. My Website)"
                  className="w-full p-2 border rounded-md outline-none text-sm"
                />
                <input 
                  type="text" 
                  value={link.url} 
                  onChange={(e) => handleLinkChange(index, 'url', e.target.value)}
                  placeholder="URL (https://...)"
                  className="w-full p-2 border rounded-md outline-none text-sm"
                />
              </div>
              <button 
                onClick={() => removeLink(index)}
                className="p-2 text-red-500 hover:bg-red-50 rounded-md transition-colors"
                title="Remove Link"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          ))}
          {(!profile.links || profile.links.length === 0) && (
            <div className="text-center py-6 text-gray-500">No custom links added yet.</div>
          )}
        </div>
      </div>

      {/* Preview Link */}
      <div className="flex justify-end pt-4">
        <a 
          href={`/l/default`} 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-primary hover:underline font-medium flex items-center gap-1"
        >
          Preview Public Page
        </a>
      </div>
    </div>
  );
}
