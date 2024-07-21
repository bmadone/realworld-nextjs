// pages/settings.tsx
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useUser } from '@/contexts/UserContext';
import { setAuthToken, getAuthToken } from '@/utils/auth';

export default function Settings() {
  const { user, setUser, logout } = useUser();
  const [formData, setFormData] = useState({
    image: '',
    username: '',
    bio: '',
    email: '',
    password: '',
  });
  const router = useRouter();

  useEffect(() => {
    const token = getAuthToken();
    if (!token) {
      router.push('/');
      return;
    }

    if (user) {
      setFormData({
        image: user.image || '',
        username: user.username || '',
        bio: user.bio || '',
        email: user.email || '',
        password: '',
      });
    }
  }, [user, router]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = getAuthToken();
    if (!token) {
      alert('No authentication token found');
      return;
    }

    try {
      const response = await fetch('https://api.realworld.io/api/user', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Token ${token}`,
        },
        body: JSON.stringify({ user: formData }),
      });

      if (!response.ok) {
        throw new Error('Failed to update user');
      }

      const data = await response.json();
      setUser(data.user);
      setAuthToken(data.user.token); // Update the token in cookies
      router.push(`/profile/${data.user.username}`);
    } catch (error) {
      console.error(error);
      alert('Failed to update settings');
    }
  };

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  return (
    <div className="settings-page">
      <div className="container page">
        <div className="row">
          <div className="col-md-6 offset-md-3 col-xs-12">
            <h1 className="text-xs-center">Your Settings</h1>

            <form onSubmit={handleSubmit}>
              <fieldset>
                <fieldset className="form-group">
                  <input
                    className="form-control"
                    type="text"
                    placeholder="URL of profile picture"
                    name="image"
                    value={formData.image}
                    onChange={handleChange}
                  />
                </fieldset>
                <fieldset className="form-group">
                  <input
                    className="form-control form-control-lg"
                    type="text"
                    placeholder="Your Name"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                  />
                </fieldset>
                <fieldset className="form-group">
                  <textarea
                    className="form-control form-control-lg"
                    rows={8}
                    placeholder="Short bio about you"
                    name="bio"
                    value={formData.bio}
                    onChange={handleChange}
                  ></textarea>
                </fieldset>
                <fieldset className="form-group">
                  <input
                    className="form-control form-control-lg"
                    type="text"
                    placeholder="Email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                  />
                </fieldset>
                <fieldset className="form-group">
                  <input
                    className="form-control form-control-lg"
                    type="password"
                    placeholder="New Password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                  />
                </fieldset>
                <button
                  className="btn btn-lg btn-primary pull-xs-right"
                  type="submit"
                >
                  Update Settings
                </button>
              </fieldset>
            </form>
            <hr />
            <button className="btn btn-outline-danger" onClick={handleLogout}>
              Or click here to logout.
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
