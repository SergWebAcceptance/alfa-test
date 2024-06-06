import React, { useState, useEffect } from 'react';
import { useAuth } from '@/src/contexts/AuthContext';
import { encrypt } from '@/src/utils/encrypt-decrypt';

function ContactDetailsForm() {
  const { currentUser, fetchCurrentUser, setCurrentUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [firstName, setFirstName] = useState(currentUser?.firstName || '');
  const [lastName, setLastName] = useState(currentUser?.lastName || '');
  const [email, setEmail] = useState(currentUser?.email || '');
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [formError, setFormError] = useState(null);
  const [formSuccess, setFormSuccess] = useState(null);

  useEffect(() => {
    if (currentUser) {
      setFirstName(currentUser.firstName || '');
      setLastName(currentUser.lastName || '');
      setEmail(currentUser.email || '');
    }
  }, [currentUser]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setFormError(null);
    setFormSuccess(null);

    try {
      const jwt = localStorage.getItem('jwt');
      const response = await fetch('/api/user-update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${jwt}`,
        },
        body: JSON.stringify({
          jwt,
          id: currentUser.id,
          email,
          firstName,
          lastName,
          ...(newPassword && { password: newPassword }),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to update details');
      }

      const updatedUser = { ...currentUser, firstName, lastName, email };
      localStorage.setItem('user', encrypt(JSON.stringify(updatedUser)));
      setCurrentUser(updatedUser);

      setFormSuccess('Your details have been successfully updated.');
      await fetchCurrentUser();
    } catch (error) {
      console.error('Failed to update user details:', error);
      setFormError(error.message || 'Failed to update details.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2 className="text-xl font-bold text-gray-900">Update Your Contact Details</h2>
      <form onSubmit={handleSubmit} className="mt-4">
        <div className="grid gap-6 mb-6 lg:grid-cols-2">
          <div>
            <label htmlFor="firstName" className="block mb-2 text-sm font-medium text-gray-900">First Name</label>
            <input
              type="text"
              id="firstName"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
              required
            />
          </div>
          <div>
            <label htmlFor="lastName" className="block mb-2 text-sm font-medium text-gray-900">Last Name</label>
            <input
              type="text"
              id="lastName"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
              required
            />
          </div>
        </div>
        <div className="grid gap-6 mb-6 lg:grid-cols-2">
          <div>
            <label htmlFor="email" className="block mb-2 text-sm font-medium text-gray-900">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
              required
            />
          </div>
          <div>
            <label htmlFor="oldPassword" className="block mb-2 text-sm font-medium text-gray-900">Old Password</label>
            <input
              type="password"
              id="oldPassword"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
            />
          </div>
          <div>
            <label htmlFor="newPassword" className="block mb-2 text-sm font-medium text-gray-900">New Password</label>
            <input
              type="password"
              id="newPassword"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
            />
          </div>
        </div>
        <button type="submit" className="text-white bg-primary hover:bg-green-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center">
          Update Details
        </button>
      </form>
      {loading && <p className="mt-4 text-gray-600">Updating...</p>}
      {formError && <p className="mt-4 text-red-600">{formError}</p>}
      {formSuccess && <p className="mt-4 text-green-600">{formSuccess}</p>}
    </div>
  );
}

export default ContactDetailsForm;
