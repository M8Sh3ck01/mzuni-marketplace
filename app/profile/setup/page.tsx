"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { auth, db, uploadImage } from "@/lib/firebase";
import { Button } from "@/components/ui/Button";
import { updateProfile } from "firebase/auth";
import { ArrowLeft, User, Mail, Phone, MapPin, GraduationCap, BookOpen, Calendar, MessageCircle, Camera, X } from "lucide-react";
import Link from "next/link";

export default function ProfileSetupPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    surname: "",
    username: "",
    bio: "",
    phoneNumber: "",
    showPhone: false,
    whatsappNumber: "",
    showWhatsapp: false,
    location: "",
    studentId: "",
    program: "",
    yearOfStudy: "",
    photoURL: "",
    university: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [progress, setProgress] = useState(0);

  const capitalizeFirstLetter = (str: string) => {
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  };

  const handleNameChange = (field: 'firstName' | 'surname', value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: capitalizeFirstLetter(value)
    }));
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Only allow digits and limit to 10 characters
    const digitsOnly = value.replace(/\D/g, '');
    if (digitsOnly.length <= 10) {
      setFormData({ ...formData, phoneNumber: digitsOnly });
    }
  };

  const handleWhatsappChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Only allow digits and limit to 10 characters
    const digitsOnly = value.replace(/\D/g, '');
    if (digitsOnly.length <= 10) {
      setFormData({ ...formData, whatsappNumber: digitsOnly });
    }
  };

  useEffect(() => {
    const fetchExistingProfile = async () => {
      const user = auth.currentUser;
      if (!user) return;

      // Fetch public profile
      const publicRef = doc(db, "users_public", user.uid);
      const publicSnap = await getDoc(publicRef);
      // Fetch private profile
      const privateRef = doc(db, "users_private", user.uid);
      const privateSnap = await getDoc(privateRef);

      const publicData = publicSnap.exists() ? publicSnap.data() : {};
      const privateData = privateSnap.exists() ? privateSnap.data() : {};

      setFormData({
        firstName: privateData.firstName || "",
        surname: privateData.surname || "",
        username: publicData.username || "",
        bio: publicData.bio || "",
        phoneNumber: publicData.phone || "",
        showPhone: publicData.showPhone || false,
        whatsappNumber: publicData.whatsapp || "",
        showWhatsapp: publicData.showWhatsapp || false,
        location: publicData.location || "",
        studentId: privateData.studentId || "",
        program: privateData.program || "",
        yearOfStudy: privateData.yearOfStudy || "",
        photoURL: publicData.photoURL || "",
        university: publicData.university || "",
      });
      setIsEditing(!!(publicSnap.exists() || privateSnap.exists()));
    };

    fetchExistingProfile();
  }, []);

  // Calculate form completion progress
  useEffect(() => {
    const requiredFields = ['firstName', 'surname', 'username', 'studentId', 'program', 'yearOfStudy'];
    const filledFields = requiredFields.filter(field => {
  const value = formData[field as keyof typeof formData];
  return typeof value === 'string' && value.trim();
});
    setProgress((filledFields.length / requiredFields.length) * 100);
  }, [formData]);

  const validateForm = () => {
    if (!formData.firstName.trim()) {
      setError("First name is required");
      return false;
    }
    if (!formData.surname.trim()) {
      setError("Surname is required");
      return false;
    }
    if (!formData.username.trim()) {
      setError("Username is required");
      return false;
    }
    // Phone number validation: must be exactly 10 digits
    if (formData.phoneNumber && formData.phoneNumber.length !== 10) {
      setError("Phone number must be exactly 10 digits");
        return false;
      }
    // WhatsApp number validation: must be exactly 10 digits
    if (formData.whatsappNumber && formData.whatsappNumber.length !== 10) {
      setError("WhatsApp number must be exactly 10 digits");
      return false;
    }
    if (!formData.studentId.trim()) {
      setError("Student ID is required");
      return false;
    }
    if (!formData.program.trim()) {
      setError("Program is required");
      return false;
    }
    if (!formData.yearOfStudy) {
      setError("Year of study is required");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    setError("");

    try {
      // Wait for auth.currentUser to be available if not yet loaded
      let user = auth.currentUser;
      let retryCount = 0;
      while (!user && retryCount < 10) {
        await new Promise(res => setTimeout(res, 200));
        user = auth.currentUser;
        retryCount++;
      }
      if (!user) throw new Error("User not authenticated. Please refresh and try again.");

      const fullName = `${formData.firstName.trim()} ${formData.surname.trim()}`;

      // Update Firebase Auth display name
      try {
        await updateProfile(user, {
          displayName: fullName
        });
      } catch (profileError) {
        console.error("Error updating profile:", profileError);
        throw new Error("Failed to update profile name");
      }

      // Write to users_public
      const publicRef = doc(db, "users_public", user.uid);
      await setDoc(publicRef, {
        displayName: fullName,
        username: formData.username.trim(),
        bio: formData.bio,
        phone: formData.phoneNumber,
        showPhone: formData.showPhone,
        whatsapp: formData.whatsappNumber,
        showWhatsapp: formData.showWhatsapp,
        location: formData.location,
        photoURL: formData.photoURL || "",
        university: formData.university || "",
        rating: 0,
        totalListings: 0,
        updatedAt: new Date(),
      }, { merge: true });

      // Write to users_private
      const privateRef = doc(db, "users_private", user.uid);
      await setDoc(privateRef, {
        firstName: typeof formData.firstName === "string" ? formData.firstName.trim() : "",
        surname: typeof formData.surname === "string" ? formData.surname.trim() : "",
        studentId: formData.studentId,
        program: formData.program,
        yearOfStudy: formData.yearOfStudy,
        email: user.email,
        updatedAt: new Date(),
      }, { merge: true });

      router.push("/profile");
    } catch (err) {
      console.error("Profile setup error:", err);
      setError(err instanceof Error ? err.message : "Failed to save profile");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError('');

    try {
      const user = auth.currentUser;
      if (!user) throw new Error('User not authenticated');

      // Use the helper function to upload the image
      const downloadURL = await uploadImage(file, `profile_pictures/${user.uid}/${file.name}`);
      
      // Update form data with the new photo URL
      setFormData(prev => ({
        ...prev,
        photoURL: downloadURL
      }));

      // Update Firebase Auth profile
      await updateProfile(user, {
        photoURL: downloadURL
      });

    } catch (err) {
      console.error('Error uploading image:', err);
      setError(err instanceof Error ? err.message : 'Failed to upload image. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const removeProfilePicture = async () => {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('User not authenticated');

      // Update form data
      setFormData(prev => ({
        ...prev,
        photoURL: ''
      }));

      // Update Firebase Auth profile
      await updateProfile(user, {
        photoURL: null
      });

    } catch (err) {
      console.error('Error removing profile picture:', err);
      setError('Failed to remove profile picture. Please try again.');
    }
  };

  if (isSubmitting) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[var(--primary)]"></div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center mb-6">
        <Link href="/profile" className="mr-4">
          <Button variant="ghost" className="p-2">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <h2 className="text-2xl font-bold text-center text-[var(--foreground)]">
          {isEditing ? "Edit Profile" : "Complete Your Profile"}
        </h2>
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="h-2 bg-[var(--border)] rounded-full overflow-hidden">
          <div 
            className="h-full bg-[var(--primary)] transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="text-sm text-[var(--foreground)]/70 mt-2">
          {Math.round(progress)}% Complete
        </p>
      </div>

      <div className="bg-[var(--background)] p-8 rounded-lg shadow border border-[var(--border)]">
        {error && (
          <div className="mb-4 p-3 bg-[var(--error)]/10 text-[var(--error)] rounded text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Profile Picture Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-[var(--foreground)] flex items-center gap-2">
              <Camera className="w-5 h-5" />
              Profile Picture
            </h3>
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="w-24 h-24 rounded-full overflow-hidden bg-[var(--accent)] flex items-center justify-center">
                  {formData.photoURL ? (
                    <img 
                      src={formData.photoURL} 
                      alt="Profile" 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="w-12 h-12 text-[var(--foreground-muted)]" />
                  )}
                </div>
                {formData.photoURL && (
                  <button
                    type="button"
                    onClick={removeProfilePicture}
                    className="absolute -top-2 -right-2 p-1 rounded-full bg-[var(--error)] text-white hover:bg-[var(--error)]/90 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
              <div className="flex-1">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageUpload}
                  accept="image/*"
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="w-full"
                >
                  {uploading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-[var(--primary)] border-t-transparent rounded-full animate-spin"></div>
                      <span>Uploading...</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Camera className="w-4 h-4" />
                      <span>{formData.photoURL ? 'Change Picture' : 'Upload Picture'}</span>
                    </div>
                  )}
                </Button>
                <p className="text-xs text-[var(--foreground-muted)] mt-1">
                  Recommended: Square image, max 5MB
                </p>
              </div>
            </div>
          </div>

          {/* Personal Information Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-[var(--foreground)] flex items-center gap-2">
              <User className="w-5 h-5" />
              Personal Information
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <input
                  type="text"
                  placeholder="First Name"
                  value={formData.firstName}
                  onChange={(e) => handleNameChange('firstName', e.target.value)}
                  required
                  className="w-full border border-[var(--border)] px-4 py-2 rounded focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent bg-[var(--background)] text-[var(--foreground)]"
                />
              </div>
              <div>
                <input
                  type="text"
                  placeholder="Surname"
                  value={formData.surname}
                  onChange={(e) => handleNameChange('surname', e.target.value)}
                  required
                  className="w-full border border-[var(--border)] px-4 py-2 rounded focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent bg-[var(--background)] text-[var(--foreground)]"
                />
              </div>
            </div>

            <div>
              <input
                type="text"
                placeholder="Username"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                required
                className="w-full border border-[var(--border)] px-4 py-2 rounded focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent bg-[var(--background)] text-[var(--foreground)]"
              />
            </div>

            <div>
              <textarea
                placeholder="Short Bio"
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                className="w-full border border-[var(--border)] px-4 py-2 rounded focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent bg-[var(--background)] text-[var(--foreground)]"
                rows={3}
              />
            </div>
          </div>

          {/* Contact Information Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-[var(--foreground)] flex items-center gap-2">
              <Mail className="w-5 h-5" />
              Contact Information
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Phone className="w-4 h-4 text-[var(--primary)]" />
                  <label className="text-sm text-[var(--foreground)]/70">Call Number</label>
                </div>
                <input
                  type="tel"
                  placeholder="Phone Number for Calls"
                  value={formData.phoneNumber}
                  onChange={handlePhoneChange}
                  maxLength={10}
                  className="w-full border border-[var(--border)] px-4 py-2 rounded focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent bg-[var(--background)] text-[var(--foreground)]"
                />
                <div className="flex items-center mt-1">
                  <input
                    type="checkbox"
                    id="showPhone"
                    checked={formData.showPhone}
                    onChange={e => setFormData({ ...formData, showPhone: e.target.checked })}
                    className="mr-2"
                  />
                  <label htmlFor="showPhone" className="text-xs text-[var(--foreground)]/60">
                    Show my phone publicly
                  </label>
                </div>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <MessageCircle className="w-4 h-4 text-[var(--primary)]" />
                  <label className="text-sm text-[var(--foreground)]/70">WhatsApp Number</label>
                </div>
                <input
                  type="tel"
                  placeholder="WhatsApp Number"
                  value={formData.whatsappNumber}
                  onChange={handleWhatsappChange}
                  maxLength={10}
                  className="w-full border border-[var(--border)] px-4 py-2 rounded focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent bg-[var(--background)] text-[var(--foreground)]"
                />
                <div className="flex items-center mt-1">
                  <input
                    type="checkbox"
                    id="showWhatsapp"
                    checked={formData.showWhatsapp}
                    onChange={e => setFormData({ ...formData, showWhatsapp: e.target.checked })}
                    className="mr-2"
                  />
                  <label htmlFor="showWhatsapp" className="text-xs text-[var(--foreground)]/60">
                    Show my WhatsApp publicly
                  </label>
                </div>
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2 mb-1">
                <MapPin className="w-4 h-4 text-[var(--primary)]" />
                <label className="text-sm text-[var(--foreground)]/70">Location</label>
              </div>
              <input
                type="text"
                placeholder="Location (e.g. Campus, Town)"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="w-full border border-[var(--border)] px-4 py-2 rounded focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent bg-[var(--background)] text-[var(--foreground)]"
              />
            </div>
          </div>

          {/* Academic Information Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-[var(--foreground)] flex items-center gap-2">
              <GraduationCap className="w-5 h-5" />
              Academic Information
            </h3>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <BookOpen className="w-4 h-4 text-[var(--primary)]" />
                <label className="text-sm text-[var(--foreground)]/70">Student ID</label>
              </div>
              <input
                type="text"
                placeholder="Student ID"
                value={formData.studentId}
                onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
                required
                className="w-full border border-[var(--border)] px-4 py-2 rounded focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent bg-[var(--background)] text-[var(--foreground)]"
              />
            </div>

            <div>
              <div className="flex items-center gap-2 mb-1">
                <GraduationCap className="w-4 h-4 text-[var(--primary)]" />
                <label className="text-sm text-[var(--foreground)]/70">Program</label>
              </div>
              <input
                type="text"
                placeholder="Program (e.g. BSc ICT)"
                value={formData.program}
                onChange={(e) => setFormData({ ...formData, program: e.target.value })}
                required
                className="w-full border border-[var(--border)] px-4 py-2 rounded focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent bg-[var(--background)] text-[var(--foreground)]"
              />
            </div>

            <div>
              <div className="flex items-center gap-2 mb-1">
                <Calendar className="w-4 h-4 text-[var(--primary)]" />
                <label className="text-sm text-[var(--foreground)]/70">Year of Study</label>
              </div>
              <select
                value={formData.yearOfStudy}
                onChange={(e) => setFormData({ ...formData, yearOfStudy: e.target.value })}
                required
                className="w-full border border-[var(--border)] px-4 py-2 rounded focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent bg-[var(--background)] text-[var(--foreground)]"
              >
                <option value="">Select Year of Study</option>
                <option value="1">1st Year</option>
                <option value="2">2nd Year</option>
                <option value="3">3rd Year</option>
                <option value="4">4th Year</option>
              </select>
            </div>
          </div>

          <Button 
            type="submit" 
            disabled={isSubmitting}
            className="w-full bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white py-2 px-4 rounded"
          >
            {isSubmitting ? "Saving..." : isEditing ? "Update Profile" : "Save Profile"}
          </Button>
        </form>
      </div>
    </div>
  );
}
