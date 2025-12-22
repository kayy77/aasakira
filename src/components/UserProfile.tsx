
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { 
  User, 
  Camera, 
  Instagram, 
  Twitter, 
  Mail, 
  Save,
  ExternalLink,
  MessageCircle
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import TelegramLinking from './TelegramLinking';

const UserProfile = () => {
  const { user, updateUserProfile } = useAuth();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    username: user?.username || '',
    email: user?.email || '',
    avatar: user?.avatar || '',
    newsletter: user?.preferences?.newsletter || false,
    instagram: user?.social?.instagram || '',
    twitter: user?.social?.twitter || '',
  });

  const handleSave = () => {
    updateUserProfile(profileData);
    setIsEditing(false);
    toast({
      title: "Profile Updated",
      description: "Your profile has been successfully updated.",
    });
  };

  const handleAvatarUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setProfileData(prev => ({
          ...prev,
          avatar: e.target?.result as string
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSupportEmail = () => {
    window.open('mailto:support@aasakira.app?subject=Support Request');
  };

  const handleInstagramOpen = () => {
    window.open('https://instagram.com/aasakira.app', '_blank');
  };

  if (!user) return null;

  return (
    <div className="space-y-6">
      {/* Telegram Linking Section */}
      <TelegramLinking />
      
      {/* Profile Header */}
      <Card className="glass-card hover-glow border-purple-500/20">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-white flex items-center justify-between">
            <span className="flex items-center">
              <User className="w-6 h-6 mr-2 text-purple-400" />
              Profile Settings
            </span>
            {!isEditing ? (
              <Button 
                onClick={() => setIsEditing(true)}
                variant="outline"
                className="border-purple-500/30 text-purple-400 hover:bg-purple-500/10"
              >
                Edit Profile
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button 
                  onClick={handleSave}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Save
                </Button>
                <Button 
                  onClick={() => setIsEditing(false)}
                  variant="outline"
                  className="border-gray-600 text-gray-400"
                >
                  Cancel
                </Button>
              </div>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Avatar Section */}
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Avatar className="w-20 h-20">
                <AvatarImage src={profileData.avatar} />
                <AvatarFallback className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xl">
                  {user.username.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              {isEditing && (
                <label className="absolute -bottom-2 -right-2 bg-purple-600 rounded-full p-2 cursor-pointer hover:bg-purple-700 transition-colors">
                  <Camera className="w-4 h-4 text-white" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarUpload}
                    className="hidden"
                  />
                </label>
              )}
            </div>
            <div>
              <h3 className="text-xl font-semibold text-white">{user.username}</h3>
              <Badge className={user.role === 'premium' 
                ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white" 
                : "bg-gradient-to-r from-gray-600 to-gray-700 text-white"
              }>
                {user.role === 'premium' ? 'Premium Member' : 'Free Member'}
              </Badge>
            </div>
          </div>

          {/* Profile Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="username" className="text-gray-300">Username</Label>
              <Input
                id="username"
                value={profileData.username}
                onChange={(e) => setProfileData(prev => ({ ...prev, username: e.target.value }))}
                disabled={!isEditing}
                className="bg-gray-800/50 border-gray-700 text-white"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" className="text-gray-300">Email</Label>
              <Input
                id="email"
                type="email"
                value={profileData.email}
                onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
                disabled={!isEditing}
                className="bg-gray-800/50 border-gray-700 text-white"
              />
            </div>
          </div>

          {/* Social Connections */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-white">Social Connections</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="instagram" className="text-gray-300 flex items-center">
                  <Instagram className="w-4 h-4 mr-2" />
                  Instagram Handle
                </Label>
                <Input
                  id="instagram"
                  value={profileData.instagram}
                  onChange={(e) => setProfileData(prev => ({ ...prev, instagram: e.target.value }))}
                  disabled={!isEditing}
                  placeholder="@yourusername"
                  className="bg-gray-800/50 border-gray-700 text-white"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="twitter" className="text-gray-300 flex items-center">
                  <Twitter className="w-4 h-4 mr-2" />
                  Twitter Handle
                </Label>
                <Input
                  id="twitter"
                  value={profileData.twitter}
                  onChange={(e) => setProfileData(prev => ({ ...prev, twitter: e.target.value }))}
                  disabled={!isEditing}
                  placeholder="@yourusername"
                  className="bg-gray-800/50 border-gray-700 text-white"
                />
              </div>
            </div>
          </div>

          {/* Newsletter Preferences */}
          <div className="flex items-center justify-between p-4 bg-gray-800/30 rounded-lg">
            <div className="flex items-center space-x-3">
              <Mail className="w-5 h-5 text-purple-400" />
              <div>
                <h4 className="text-white font-medium">Newsletter Subscription</h4>
                <p className="text-sm text-gray-400">Receive trading insights and updates</p>
              </div>
            </div>
            <Switch
              checked={profileData.newsletter}
              onCheckedChange={(checked) => setProfileData(prev => ({ ...prev, newsletter: checked }))}
              disabled={!isEditing}
            />
          </div>

          {/* Support & Social Links */}
          <div className="flex flex-wrap gap-3 pt-4 border-t border-gray-700">
            <Button
              onClick={handleSupportEmail}
              variant="outline"
              className="border-purple-500/30 text-purple-400 hover:bg-purple-500/10"
            >
              <MessageCircle className="w-4 h-4 mr-2" />
              Contact Support
            </Button>
            <Button
              onClick={handleInstagramOpen}
              variant="outline"
              className="border-pink-500/30 text-pink-400 hover:bg-pink-500/10"
            >
              <Instagram className="w-4 h-4 mr-2" />
              Follow @aasakira.app
              <ExternalLink className="w-3 h-3 ml-1" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UserProfile;
