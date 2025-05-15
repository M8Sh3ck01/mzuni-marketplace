"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { doc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/Label";
import { Textarea } from "@/components/ui/Textarea";
import { Select } from "@/components/ui/Select";
import Avatar from "@/components/ui/Avatar";
import { User } from "lucide-react";
import { uploadImage } from "@/lib/cloudinaryImage";

export default function ProfileSetupPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [photoURL, setPhotoURL] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const [formData, setFormData] = useState({
    firstName: "",
    surname: "",
    username: "",
    university: "",
    studentId: "",
    program: "",
    yearOfStudy: "",
    phone: "",
    whatsapp: "",
    location: "",
    bio: "",
  });

  const handleImageChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const { url } = await uploadImage(file, {
        folder: `users/${user?.uid}/profile`,
        transformation: {
          width: 500,
          height: 500,
          crop: 'fill',
          quality: 'auto'
        }
      });
      setPhotoURL(url);
    } catch (error) {
      console.error("Upload failed:", error);
      setError("Failed to upload image. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      if (!user) throw new Error("You must be logged in to set up your profile.");

      // Create public profile
      const publicProfile = {
        firstName: formData.firstName,
        surname: formData.surname,
        username: formData.username,
        university: formData.university,
        photoURL: photoURL || user.photoURL,
        createdAt: new Date(),
      };

      // Create private profile
      const privateProfile = {
        studentId: formData.studentId,
        program: formData.program,
        yearOfStudy: formData.yearOfStudy,
        phone: formData.phone,
        whatsapp: formData.whatsapp,
        location: formData.location,
        bio: formData.bio,
      };

      // Save both profiles
      await Promise.all([
        setDoc(doc(db, "users_public", user.uid), publicProfile),
        setDoc(doc(db, "users_private", user.uid), privateProfile),
      ]);

      router.push("/profile");
    } catch (error) {
      console.error("Profile setup failed:", error);
      setError(error instanceof Error ? error.message : "Failed to set up profile");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-lg shadow-lg p-6"
      >
        <h1 className="text-2xl font-bold mb-6">Complete Your Profile</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Profile Image Upload */}
          <div className="flex flex-col items-center space-y-4">
            <div className="relative group">
              {photoURL || user?.photoURL ? (
                <Avatar
                  src={photoURL || user?.photoURL || '/default-avatar.png'}
                  alt="Profile Picture"
                  size={160}
                  className="border-4 border-[var(--primary)] transition-transform group-hover:scale-105"
                />
              ) : (
                <div className="w-40 h-40 rounded-full bg-[var(--accent)] flex items-center justify-center border-4 border-[var(--primary)]">
                  <User className="w-20 h-20 text-[var(--foreground-muted)]" />
                </div>
              )}
              <label
                htmlFor="photo-upload"
                className="absolute bottom-0 right-0 bg-[var(--primary)] text-white p-2 rounded-full hover:bg-[var(--primary-hover)] transition-colors cursor-pointer"
              >
                <input
                  id="photo-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
              </label>
            </div>
            {isUploading && <p className="text-sm text-[var(--foreground)]/60">Uploading...</p>}
          </div>

          {/* Personal Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="firstName">First Name</Label>
              <Input
                id="firstName"
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="surname">Surname</Label>
              <Input
                id="surname"
                value={formData.surname}
                onChange={(e) => setFormData({ ...formData, surname: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="university">University</Label>
              <Input
                id="university"
                value={formData.university}
                onChange={(e) => setFormData({ ...formData, university: e.target.value })}
                required
              />
            </div>
          </div>

          {/* Academic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="studentId">Student ID</Label>
              <Input
                id="studentId"
                value={formData.studentId}
                onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="program">Program</Label>
              <Input
                id="program"
                value={formData.program}
                onChange={(e) => setFormData({ ...formData, program: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="yearOfStudy">Year of Study</Label>
              <Select
                id="yearOfStudy"
                value={formData.yearOfStudy}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFormData({ ...formData, yearOfStudy: e.target.value })}
                required
              >
                <option value="">Select Year</option>
                <option value="1">First Year</option>
                <option value="2">Second Year</option>
                <option value="3">Third Year</option>
                <option value="4">Fourth Year</option>
                <option value="5">Fifth Year</option>
              </Select>
            </div>
          </div>

          {/* Contact Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="whatsapp">WhatsApp Number</Label>
              <Input
                id="whatsapp"
                type="tel"
                value={formData.whatsapp}
                onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
              />
            </div>
            <div className="md:col-span-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              />
            </div>
          </div>

          {/* Bio */}
          <div>
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              value={formData.bio}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFormData({ ...formData, bio: e.target.value })}
              rows={4}
            />
          </div>

          {error && (
            <div className="text-[var(--error)] text-sm">{error}</div>
          )}

          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white"
          >
            {isSubmitting ? "Setting up profile..." : "Complete Profile"}
          </Button>
        </form>
      </motion.div>
    </div>
  );
}